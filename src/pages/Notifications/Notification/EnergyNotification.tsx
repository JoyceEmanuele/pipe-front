import { Flex } from 'reflexbox';
import { useTranslation, Trans } from 'react-i18next';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { colors } from '~/styles/colors';
import { useStateVar } from 'helpers/useStateVar';
import { getUserProfile } from 'helpers/userProfile';
import {
  Select, Checkbox, Input, Button,
} from '../../../components';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import {
  SearchInput, Label, EnergyCardsWrapper, EnergyCardsEmpty, EnergyNotifCardContainer, Sidebar, WeekDayButton,
} from './styles';
import { NothingRegistered, DeleteSimpleIcon } from '~/icons';
import { SmallTrashIcon } from '~/icons/Trash';
import { apiCall } from '~/providers';
import jsonTryParse from '~/helpers/jsonTryParse';

interface NOTIF_COND_PARS {
  energyCards: {
    condOper: string,
    limiarInput: string,
    allDays: boolean,
    selectedDays: {
      mon: boolean,
      tue: boolean,
      wed: boolean,
      thu: boolean,
      fri: boolean,
      sat: boolean,
      sun: boolean,
    },
    schedulesList: {start: string, end: string}[]
    allHours: boolean,
    instant: boolean,
    endOfDay: boolean,
  }[],
}

export const EnergyNotification = (props: {
  notificationType: string,
  notifId: number,
  notifInfo: null|{
    CLIENT_ID?: number
    FILT_IDS?: (string[])|(number[])
    FILT_TYPE?: string
    FREQ?: string
    NAME?: string
    COND_VAR?: string
    COND_OP?: string
    COND_VAL?: string
    COND_SECONDARY_VAL?: string
    NOTIF_DESTS?: string[]
    COND_PARS?: string
  },
  onSuccess: () => void
  onCancel: () => void
}): JSX.Element => {
  const {
    notificationType, notifId, notifInfo, onSuccess, onCancel,
  } = props;
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const clientAdmin = (!profile.manageAllClients && profile.singleClientViewId?.toString());
    const state = {
      isLoading: true,
      clientsList: [] as { name: string, value: string }[],
      selectedClient: clientAdmin || undefined as undefined|string,
      clientChanged: !profile.manageAllClients,
      unitsList: [] as {
        index?: number,
        name: string,
        value: string,
        checked: boolean,
        subList: {
          name: string,
          value: string,
          checked: boolean,
        }[]
      }[],
      selectedUnits: [] as any[],
      notifTitle: '',
      notifTypeOpts: [
        // { name: t('consumoDeEnergiaPorDia'), value: 'ECPD' },
        { name: t('consumoDeEnergiaPorHora'), value: 'ECPH' },
        // { name: t('potenciaAtiva'), value: 'AP' },
      ],
      selectedNotifType: '',
      notifCards: [] as NOTIF_COND_PARS['energyCards'],
      allUnits: false,
      allReceivers: false,
      receiversFullList: [] as { FULLNAME: string, USER: string, unitIds?: number[] }[],
      receiversList: [] as { name: string, value: string }[],
      selectedReceivers: [] as string[],
      loadedNotifInfo: false,
    };
    return state;
  });

  function addNotifCard() {
    if (state.selectedNotifType) {
      state.notifCards.push({
        condOper: '',
        limiarInput: '',
        allDays: false,
        selectedDays: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        schedulesList: [{ start: '', end: '' }],
        allHours: false,
        instant: false,
        endOfDay: false,
      });
    }
    render();
  }

  function deleteNotifCard(cardIndex) {
    state.notifCards.splice(cardIndex, 1);
    render();
  }

  async function getClientsList() {
    if (state.clientsList.length === 0 && !state.selectedClient) {
      await apiCall('/clients/get-clients-list', {}).then(({ list }) => {
        state.clientsList = list.map((item) => ({ name: item.NAME, value: item.CLIENT_ID.toString() }));
        state.selectedClient = state.clientsList.find((x) => Number(x.value) === notifInfo?.CLIENT_ID)?.value;
        if (state.selectedClient) state.clientChanged = true;
        render();
      });
    }
  }

  async function getUnitsList() {
    if (state.selectedClient && state.clientChanged) {
      await apiCall('/clients/get-units-with-energy-device', { clientIds: [Number(state.selectedClient)] }).then(({ list }) => {
        state.unitsList = list
          .filter((item) => {
            const dmeList = item.devices.filter((x) => x.ID.startsWith('DRI'));
            if (!dmeList.length) return false;
            item.devices = dmeList;
            return true;
          })
          .map((item) => {
            const unitSelected = (notifInfo?.FILT_IDS as number[])?.includes(item.UNIT_ID) || item.devices.every((x) => (notifInfo?.FILT_IDS as string[])?.includes(x.ID));
            return {
              name: item.UNIT_NAME,
              value: item.UNIT_ID.toString(),
              checked: unitSelected || false,
              subList: item.devices.map((meter) => ({
                name: meter.NAME || meter.ID,
                value: meter.ID,
                checked: unitSelected || notifInfo?.FILT_TYPE === 'DRI' && (notifInfo?.FILT_IDS as string[]).includes(meter.ID) || false,
              })),
            };
          });
        renderSelectedUnitOptions();
        state.clientChanged = false;
        render();
      });
    }
  }

  async function getUsersList() {
    if (state.selectedUnits.length > 0 && state.receiversFullList.length === 0) {
      await apiCall('/users/list-users', { CLIENT_ID: Number(state.selectedClient), includeAdmins: true }).then(({ list, adminUsers }) => {
        const fullList = list.map((item) => ({ FULLNAME: item.FULLNAME, USER: item.USER, unitIds: item.unitIds })) as {
          FULLNAME: string,
          USER: string,
          unitIds?: number[],
        }[];
        for (const adminUser of (adminUsers || [])) {
          if (fullList.some((x) => x.USER === adminUser.USER)) { continue; } // user already in the list
          else fullList.push({ FULLNAME: adminUser.FULLNAME, USER: adminUser.USER });
        }
        state.receiversFullList = fullList;
      });
    }
  }

  function filterUsersList() {
    if (state.selectedUnits.length > 0) {
      const selectedUnits = state.unitsList.filter((a) => a.checked || a.subList.some((b) => b.checked));
      const filt = state.receiversFullList.filter((user) => {
        if (!user.unitIds) return true;
        const hasAllUnits = selectedUnits.every((x) => user.unitIds?.includes(Number(x.value)));
        return hasAllUnits;
      });
      state.receiversList = filt.map((x) => ({ name: x.FULLNAME, value: x.USER }));
    }
  }

  async function handleGetPageData() {
    try {
      setState({ isLoading: true });
      await getClientsList(),
      await getUnitsList(),
      await getUsersList(),
      filterUsersList();
      loadNotifInfo();
      render();
    } catch (error) {
      console.log(error);
      toast.error(t('erroSelecionaveis'));
    }
    setState({ isLoading: false });
  }

  function loadNotifInfo() {
    if (notifInfo && !state.loadedNotifInfo) {
      const dests = state.receiversList.filter((x) => notifInfo?.NOTIF_DESTS?.includes(x.value)).map((x) => x.value);
      setState({
        notifTitle: notifInfo.NAME,
        selectedNotifType: notifInfo.COND_OP,
        notifCards: notifInfo.COND_PARS && jsonTryParse<NOTIF_COND_PARS>(notifInfo.COND_PARS)?.energyCards || [],
        loadedNotifInfo: true,
        selectedReceivers: dests,
        allReceivers: dests.length === state.receiversList.length,
        clientChanged: false,
      });
    }
  }

  useEffect(() => {
    handleGetPageData();
  }, [state.selectedClient, state.selectedUnits]);

  function onSelect(opt, field) {
    if (field === 'selectedClient') {
      state.clientChanged = true;
      state.selectedUnits = [];
    }
    if (field === 'selectedReceivers') {
      state.allReceivers = opt.length === state.receiversList.length;
    }
    if (field === 'selectedNotifType') {
      state.notifCards = [];
    }
    setState({ [field]: opt });
  }

  function handleAllUnitsCheck() {
    if (state.unitsList.length > 0) {
      const inv = !state.allUnits;
      const list = state.unitsList.map((unit) => ({
        ...unit,
        checked: inv,
        subList: unit.subList.map((meter) => ({ ...meter, checked: inv })),
      }));
      setState({
        allUnits: inv,
        unitsList: list,
      });
      renderSelectedUnitOptions();
    }
  }

  function handleAllReceiversCheck() {
    if (state.receiversList.length > 0) {
      setState({
        allReceivers: !state.allReceivers,
        selectedReceivers: state.allReceivers ? [] : state.receiversList.map((unit) => unit.value),
      });
    }
  }

  function getFiltInfoNotif() {
    let FILT_TYPE;
    const FILT_IDS = [] as any[];
    if (state.selectedUnits.every((unit) => unit.checked)) {
      FILT_TYPE = 'UNIT';
      FILT_IDS.push(...state.selectedUnits.map((x) => Number(x.value)));
    } else {
      FILT_TYPE = 'DRI';
      state.selectedUnits.forEach((unit) => {
        unit.subList.forEach((meter) => {
          if (meter.checked) FILT_IDS.push(meter.value);
        });
      });
    }
    return { FILT_TYPE, FILT_IDS };
  }

  function notifValidation(notifType: string) {
    for (const [cardIndex, card] of state.notifCards.entries()) {
      const someCardEqual = (state.notifCards.findIndex((item) => JSON.stringify(item) === JSON.stringify(card))) !== cardIndex;
      if (someCardEqual) return new Error(t('erroCardsIguais'));

      for (const [schedIndex, sched] of card.schedulesList.entries()) {
        const startNumber = Number(sched.start.split(':').join(''));
        const endNumber = Number(sched.end.split(':').join(''));
        const invalidInterval = startNumber > endNumber;
        const oneHourDiff = notifType === 'ECPH' && (endNumber - startNumber) >= 100;
        if (
          Number.isNaN(startNumber)
          || Number.isNaN(startNumber)
          || invalidInterval
          || !oneHourDiff
        ) return new Error(`${t('erroHorarioInvalidoCard')} ${cardIndex + 1}`);

        const overlappingScheds = card.schedulesList.find((item, index) => (
          index !== schedIndex && ((sched.start <= item.start && item.start < sched.end)
          || (sched.start < item.end && item.end <= sched.end))
        ));
        if (overlappingScheds) return new Error(`${t('erroHorarioSobrepostoCard')} ${cardIndex + 1}`);
      }
    }
  }

  async function addEditEnergyNotif() {
    try {
      const { FILT_TYPE, FILT_IDS } = getFiltInfoNotif();

      const error = notifValidation(state.selectedNotifType);
      if (error) {
        toast.error(error.message);
        return;
      }

      if (notifInfo) {
        await apiCall('/energy/edit-notification-request', {
          NOTIF_ID: notifId,
          COND_VAR: 'ENERGY',
          COND_OP: state.selectedNotifType,
          FILT_TYPE,
          FILT_IDS,
          CLIENT_ID: Number(state.selectedClient),
          NAME: state.notifTitle,
          NOTIF_DESTS: state.selectedReceivers,
          ENERGY_CARDS: state.notifCards,
        });
      } else {
        await apiCall('/energy/add-notification-request', {
          COND_VAR: 'ENERGY',
          COND_OP: state.selectedNotifType,
          FILT_TYPE,
          FILT_IDS,
          CLIENT_ID: Number(state.selectedClient),
          NAME: state.notifTitle,
          NOTIF_DESTS: state.selectedReceivers,
          ENERGY_CARDS: state.notifCards,
        });
      }
      toast.success(t('sucessoAdicionarNotificacao'));
      onSuccess();
    } catch (error) {
      console.log(error);
      toast.error(t('erroCadastrarNotificacao'));
    }
  }

  function renderUnitOption(props, option, _snapshot, className) {
    return (
      <div
        {...props}
        className={className}
        style={{
          height: 'fit-content', backgroundColor: 'transparent', padding: '10px 16px', color: 'black',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div
            style={{
              display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', height: 'fit-content(25px)',
            }}
            onClick={() => {
              option.checked = !option.checked;
              option.subList.forEach((item) => item.checked = option.checked);
              const unitIndex = state.unitsList.findIndex((x) => x.name === option.name);
              state.unitsList[unitIndex] = option;
              render();
            }}
          >
            <Checkbox
              size={15}
              style={{ borderRadius: '5px' }}
              checked={option.checked}
            />
            <span style={{ marginLeft: '3px', fontWeight: 'bold' }}>
              {`${option.name}${option.subList.length > 1 ? ` (${option.subList.length})` : ''}`}
            </span>
          </div>
          {(option.subList?.length > 1) && option.subList.map((item, index) => (
            <div
              style={{
                display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', height: '25px', marginTop: '7px',
              }}
              onClick={() => {
                item.checked = !item.checked;
                option.checked = option.subList.every((x) => x.checked);
                state.unitsList[option.index] = option;
                render();
              }}
            >
              <div style={{
                borderLeft: '1px dashed #00000040',
                height: index !== option.subList.length - 1 ? '100%' : '45%',
                marginLeft: '7px',
                alignSelf: 'flex-start',
              }}
              />
              <div style={{
                borderBottom: '1px dashed #00000040',
                marginLeft: '1px',
                marginRight: '5px',
                width: '20px',
                alignSelf: 'center',
              }}
              />
              <Checkbox
                size={15}
                style={{ borderRadius: '5px' }}
                checked={item.checked}
              />
              <span style={{ marginLeft: '3px' }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSelectedUnitOptions() {
    const result = [] as any[];
    state.unitsList.forEach((opt) => {
      if (opt.checked || opt.subList.some((x) => x.checked)) result.push(opt);
    });
    state.selectedUnits = result;
    if (state.unitsList.length && state.unitsList.every((unit) => unit.checked)) {
      state.allUnits = true;
    } else state.allUnits = false;
    render();
  }

  function formatCondsDesc() {
    if (state.notifCards.length) {
      return (
        <span>
          <Trans
            i18nKey="totalDeCondicionaisNotificacao"
            value={
              state.notifCards.length === 1
                ? `${state.notifCards.length} ${t('condicionalAdicionada')} `
                : `${state.notifCards.length} ${t('condicionaisAdicionadas')} `
            }
          >
            Total de
            <b>
              <>
                {{
                  value: state.notifCards.length === 1
                    ? `${state.notifCards.length} ${t('condicionalAdicionada')} `
                    : `${state.notifCards.length} ${t('condicionaisAdicionadas')} `,
                }}
              </>
            </b>
            à esta notificação
          </Trans>
        </span>
      );
    }
    return (<span>{t('nenhumaCondicionalNotificacao')}</span>);
  }

  function renderDestOptions(propsOption, option, _snapshot, className) {
    return (
      <>
        <button
          {...propsOption}
          className={className}
          type="button"
          onClick={() => {
            const selected = state.selectedReceivers.findIndex((x) => x === option.value);
            if (selected >= 0) state.selectedReceivers.splice(selected, 1);
            else state.selectedReceivers.push(option.value);
            if (state.selectedReceivers.length === state.receiversList.length) state.allReceivers = true;
            else state.allReceivers = false;
            render();
          }}
        >
          {option.name}
        </button>
      </>
    );
  }
  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const pastedData = event.clipboardData.getData('Text');
    const pastedItems = pastedData.split(/\r?\n/).map((item) => item.trim());
    const matchingUnits = (state.unitsList || []).filter((unit) => pastedItems.includes(unit.name)).map((unit) => unit.value);
    const indexTotal = state.selectedUnits.length;
    let count = 0;
    state.unitsList.forEach((item) => {
      if (matchingUnits.includes(item.value)) {
        item.checked = true;
        item.index = indexTotal + count;
        count++;
        item.subList.forEach((item) => item.checked = true);
      }
    });
    render();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  return (
    <div>
      <p style={{
        margin: '24px 5px', fontSize: '18px', fontWeight: 'bold', color: '#181842',
      }}
      >
        {notifId ? t('editarNotificacao') : t('adicionarNovaNotificacao')}
      </p>
      <p style={{ color: colors.BlueSecondary, fontWeight: 700 }}>{t('geral')}</p>
      <div style={{ width: 'fit-content', display: 'grid' }}>
        <Flex mt={20}>
          {(profile.manageAllClients || profile.viewMultipleClients) && (
            <SearchInput style={{ width: '255px' }}>
              <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                <Label>{t('cliente')}</Label>
                <SelectSearch
                  options={state.clientsList}
                  value={state.selectedClient}
                  closeOnSelect
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={`${t('selecionar')} ${t('cliente')}`}
                  onChange={(opt) => { onSelect(opt, 'selectedClient'); }}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
          )}
          <SearchInput style={{ width: '255px', marginRight: '0px' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }} onPaste={(e) => { handlePaste(e); render(); }}>
              <Label>{t('unidade(s)')}</Label>
              <SelectSearch
                options={[...state.unitsList]}
                value={state.selectedUnits}
                closeOnSelect={false}
                printOptions="on-focus"
                search
                filterOptions={fuzzySearch}
                placeholder={`${t('selecionar')} ${t('unidade(s)')}`}
                multiple
                onBlur={renderSelectedUnitOptions}
                renderOption={renderUnitOption}
                disabled={state.isLoading || !state.selectedClient}
              />
            </div>
          </SearchInput>
        </Flex>
        <Flex style={{
          width: '255px', justifySelf: 'end', alignItems: 'center', fontSize: 'small',
        }}
        >
          <Checkbox size={15} checked={state.allUnits} onClick={handleAllUnitsCheck} />
          {t('selecionarTodas')}
        </Flex>

        <Input
          style={{ border: '1px solid #E9E9E9', marginTop: '20px' }}
          label={t('tituloNotificacao')}
          placeholder={t('digiteTitulo')}
          value={state.notifTitle}
          onChange={(event) => setState({ notifTitle: event.target.value })}
        />

        <Flex mt={20}>
          <SearchInput style={{ marginRight: '0px' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('tipoNotificacao')}</Label>
              <SelectSearch
                options={state.notifTypeOpts}
                value={state.selectedNotifType}
                closeOnSelect
                printOptions="on-focus"
                placeholder={t('selecionarTipo')}
                onChange={(opt) => onSelect(opt, 'selectedNotifType')}
                disabled={state.isLoading}
              />
            </div>
          </SearchInput>
        </Flex>
      </div>

      <Flex justifyContent="space-between" style={{ marginTop: '40px' }}>
        <Flex flexDirection="column">
          <span style={{ color: colors.BlueSecondary, fontWeight: 700 }}>{t('condicionais')}</span>
          {formatCondsDesc()}
        </Flex>
        <Button variant="primary" style={{ width: '170px' }} onClick={addNotifCard}>{t('adicionar')}</Button>
      </Flex>
      <EnergyCardsWrapper>
        {state.notifCards.length > 0 ? (
          state.notifCards.map((card, index) => (
            <EnergyNotifCard
              notifType={state.notifTypeOpts.find((x) => x.value === state.selectedNotifType)}
              card={card}
              deleteNotifCard={() => deleteNotifCard(index)}
            />
          ))
        ) : (
          <EnergyCardsEmpty>
            <Flex flexDirection="column" alignItems="center">
              <NothingRegistered />
              <span style={{ fontWeight: 400, marginTop: '10px' }}>{t('obsNenhumaCondicionalNotificacao')}</span>
            </Flex>
          </EnergyCardsEmpty>
        )}
      </EnergyCardsWrapper>

      <span style={{ color: colors.BlueSecondary, fontWeight: 700 }}>{t('destinatarios')}</span>
      <div style={{ width: 'fit-content', display: 'grid' }}>
        <Flex mt={20}>
          <SearchInput style={{ width: '255px', marginRight: '0px' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('destinatarios')}</Label>
              <SelectSearch
                options={state.receiversList}
                value={state.selectedReceivers}
                closeOnSelect={false}
                printOptions="on-focus"
                multiple
                search
                filterOptions={fuzzySearch}
                placeholder={`${t('selecionar')} ${t('destinatarios').toLowerCase()}`}
                renderOption={renderDestOptions}
                disabled={state.isLoading || !state.selectedUnits.length}
              />
            </div>
          </SearchInput>
        </Flex>
        <Flex style={{
          width: '255px', justifySelf: 'end', alignItems: 'center', fontSize: 'small',
        }}
        >
          <Checkbox size={15} checked={state.allReceivers} onClick={handleAllReceiversCheck} />
          {t('selecionarTodos')}
        </Flex>
      </div>

      <Button
        variant="primary"
        style={{ width: '170px', marginTop: '40px', marginBottom: '20px' }}
        onClick={addEditEnergyNotif}
      >
        {notifInfo ? t('editar') : t('salvar')}
      </Button>
    </div>
  );
};

const EnergyNotifCard = (props: {
  notifType: {
    name: string;
    value: string;
  } | undefined
  card: {
    condOper: string,
    limiarInput: string,
    allDays: boolean,
    selectedDays: {
      mon: boolean,
      tue: boolean,
      wed: boolean,
      thu: boolean,
      fri: boolean,
      sat: boolean,
      sun: boolean,
    },
    schedulesList: {start: string, end: string}[]
    allHours: boolean,
    instant: boolean,
    endOfDay: boolean,
  },
  deleteNotifCard: () => void,
}): JSX.Element => {
  const { notifType, card, deleteNotifCard } = props;
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      condOperOptions: ['<', '>'],
    };
    return state;
  });

  function handleLimiarInput(e) {
    const input = e.target.value;
    if (!Number.isNaN(Number(input))) {
      card.limiarInput = input;
      render();
    }
  }

  function handleAllDaysClick() {
    const days = card.selectedDays;
    Object.keys(days).forEach((day) => {
      days[day] = !card.allDays || false;
    });
    card.allDays = !card.allDays;
    render();
  }

  function handleAllHoursClick() {
    if (notifType?.value === 'ECPH') {
      card.allHours = !card.allHours;
      card.schedulesList = [{ start: card.allHours ? '00:00' : '', end: card.allHours ? '23:59' : '' }];
      render();
    }
  }

  function selectDay(day) {
    card.selectedDays[day] = !card.selectedDays[day];
    render();
  }

  function deleteSchedule(index) {
    card.schedulesList.splice(index, 1);
    render();
  }

  return (
    <EnergyNotifCardContainer style={{
      marginLeft: '20px', width: '500px', maxHeight: '400px', overflow: 'auto',
    }}
    >
      <Sidebar />
      <Flex flexDirection="column" padding={15}>
        <Flex justifyContent="space-between">
          <div style={{ width: '160px' }}>
            <span>
              <Trans
                i18nKey="quandoCondEstiver"
                value={` ${notifType?.name.toLowerCase()} `}
              >
                Quando
                <b>
                  <>
                    {{ value: ` ${notifType?.name.toLowerCase()} ` }}
                  </>
                </b>
                estiver:
              </Trans>
            </span>
          </div>
          <div style={{ width: '120px' }}>
            <Select
              options={state.condOperOptions}
              value={card.condOper}
              onSelect={(value) => { card.condOper = value; render(); }}
              hideSelected
              style={{ height: '40px' }}
            />
          </div>
          <div style={{ width: '120px' }}>
            <Input
              suffix="kWh"
              noSuffixBorder
              value={card.limiarInput}
              onChange={(event) => handleLimiarInput(event)}
              style={{ height: '40px', minHeight: '40px' }}
              placeholder="Valor"
            />
          </div>

          <Button variant="blue-inv" style={{ padding: 0, width: 'auto', backgroundColor: 'transparent' }} onClick={deleteNotifCard}>
            <DeleteSimpleIcon size={25} />
          </Button>
        </Flex>

        <div style={{ padding: '0px 20px', marginTop: '10px' }}>
          <Flex justifyContent="space-between" marginBottom={10}>
            <span style={{ fontWeight: 'bold' }}>{t('dias')}</span>
            <Flex>
              <Checkbox size={20} checked={card.allDays} onClick={handleAllDaysClick} />
              <span>{t('todosOsDias')}</span>
            </Flex>
          </Flex>
          <Flex style={{ fontSize: '90%', justifyContent: 'space-between' }}>
            <WeekDayButton checked={card.selectedDays.sun} onClick={() => selectDay('sun')}>{t('diasDaSemana.dom').toUpperCase()}</WeekDayButton>
            <WeekDayButton checked={card.selectedDays.mon} onClick={() => selectDay('mon')}>{t('diasDaSemana.seg').toUpperCase()}</WeekDayButton>
            <WeekDayButton checked={card.selectedDays.tue} onClick={() => selectDay('tue')}>{t('diasDaSemana.ter').toUpperCase()}</WeekDayButton>
            <WeekDayButton checked={card.selectedDays.wed} onClick={() => selectDay('wed')}>{t('diasDaSemana.qua').toUpperCase()}</WeekDayButton>
            <WeekDayButton checked={card.selectedDays.thu} onClick={() => selectDay('thu')}>{t('diasDaSemana.qui').toUpperCase()}</WeekDayButton>
            <WeekDayButton checked={card.selectedDays.fri} onClick={() => selectDay('fri')}>{t('diasDaSemana.sex').toUpperCase()}</WeekDayButton>
            <WeekDayButton checked={card.selectedDays.sat} onClick={() => selectDay('sat')}>{t('diasDaSemana.sab').toUpperCase()}</WeekDayButton>
          </Flex>

          <Flex margin="10px 0px" justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <span style={{ fontWeight: 'bold', wordBreak: 'normal', marginRight: '10px' }}>{t('horarios')}</span>
              <Button
                variant="borderblue"
                style={{
                  width: '25px', height: '25px', padding: '0', opacity: card.allHours || notifType?.value !== 'ECPH' ? '0.2' : '',
                }}
                disabled={card.allHours || notifType?.value !== 'ECPH'}
                onClick={() => { card.schedulesList.push({ start: '', end: '' }); render(); }}
              >
                +
              </Button>
            </Flex>
            <Flex>
              <Checkbox size={20} checked={card.allHours || notifType?.value !== 'ECPH'} onClick={handleAllHoursClick} />
              <span>{t('aQualquerHora')}</span>
            </Flex>
          </Flex>

          {card.schedulesList.map((sched, index) => (
            <Flex justifyContent="space-between" mb={15} key={index}>
              <Input
                style={{ width: '175px' }}
                label={t('horarioInicio')}
                value={sched.start}
                mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
                onChange={(event) => { sched.start = event.target.value; render(); }}
                disabled={notifType?.value !== 'ECPH'}
              />
              <Input
                style={{ width: '175px' }}
                label={t('horarioFim')}
                value={sched.end}
                mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
                onChange={(event) => { sched.end = event.target.value; render(); }}
                disabled={notifType?.value !== 'ECPH'}
              />

              <Button
                variant="blue-inv"
                style={{
                  padding: 0, width: 'auto', opacity: card.schedulesList.length === 1 ? '0.2' : '', backgroundColor: 'transparent',
                }}
                onClick={() => deleteSchedule(index)}
                disabled={card.schedulesList.length === 1}
              >
                <SmallTrashIcon color="red" width="22px" />
              </Button>
            </Flex>
          ))}

          <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.2)', marginBottom: '15px' }} />

          <span style={{ fontWeight: 'bold' }}>{t('emQualMomentoNotificacao')}</span>
          <Flex justifyContent="space-between" marginTop={10}>
            <Flex flexBasis="90%">
              <Checkbox
                size={20}
                checked={card.instant}
                onClick={() => { card.instant = !card.instant; card.endOfDay = !card.instant && card.endOfDay; render(); }}
              />
              <span>
                <Trans
                  i18nKey="noMomentoNotificacao"
                >
                  <b>No momento</b>
                  em que a notificação ocorrer.
                </Trans>
              </span>
            </Flex>
            <Flex>
              <Checkbox
                size={20}
                checked={card.endOfDay}
                onClick={() => { card.endOfDay = !card.endOfDay; card.instant = !card.endOfDay && card.instant; render(); }}
              />
              <span>
                <Trans
                  i18nKey="finalDoDiaNotificacaoEnergia"
                >
                  <b>No final do dia</b>
                  com o compilado de todos os medidores de energia que satisfizeram a condição.
                </Trans>
              </span>
            </Flex>
          </Flex>
        </div>
      </Flex>
    </EnergyNotifCardContainer>
  );
};
