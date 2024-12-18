import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import {
  Button, Select, Input, Loader, SelectMultiple, Checkbox,
} from 'components';
import formFieldsValidator, { requiredStringField } from 'helpers/formFieldsValidator';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { Trans, useTranslation } from 'react-i18next';
import { getDutDescription, getDutNotifTemperature } from '../../../helpers/dutNotifVerifcation';
import parseDecimalNumber from '~/helpers/parseDecimalNumber';
import { CloseIcon } from '~/icons';
import {
  IconWrapper, Offset, OffsetContainer, StyledReactTooltip,
} from './styles';
import { colors } from '~/styles/colors';

interface ComboItemUnit {
  UNIT_ID: number
  UNIT_NAME: string
  CLIENT_NAME: string
  comboLabel?: string
  checked?: boolean
}

interface FormFields {
  description: string
  freq: null|{ label: string, value: 'NONE'|'DAY'|'WEEK'|'MONTH' },
  client: null|{ label: string, value: number },
  notifType: null|{
    id: string;
    name: string;
    ops: { label: string; value: string; unit: string, unit2: string }[];
    type: string;
  },
  notifCond: null|{ label: string; value: string; unit: string, unit2: string },
  condValue: string
  condSecondaryValue: string
}

function initFormFields() {
  return formFieldsValidator<FormFields>({}, {
    description: '',
    freq: null,
    client: null,
    notifType: null,
    notifCond: null,
    condValue: '',
    condSecondaryValue: '',
    message: '',
  });
}

export const FormEditNotification = (props: {
  notificationType: string
  notifId: number
  notifInfo: null|{
    CLIENT_ID?: number,
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
  };
  onSuccess: (result: { item: {}, action: string }) => void
  onCancel: () => void
}): JSX.Element => {
  const {
    notificationType, notifId, notifInfo, onSuccess, onCancel,
  } = props;
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(() => {
    const isSpecialNotif = (notificationType === 'RelatorioAutomatico' || notificationType === 'FalhaRepentina');
    const isRegularFault = !isSpecialNotif;

    const profile = getUserProfile();
    const multiClient = isRegularFault && (!notifId) && (profile.viewMultipleClients);

    const state = {
      isSpecialNotif,
      isRegularFault,
      multiUsers: false,
      multiClient,
      isLoading: true,
      isSubmitting: false,
      clientId: profile.singleClientViewId || null,
      comboOpts: clearComboOpts(),
      formFields: initFormFields(),
      checkboxOption: '',
    };
    return state;
  });

  const { values: formValues, errors: formErrors } = state.formFields;
  const usesDacFilters = !!(formValues.notifType && ['uso', 'saude'].includes(formValues.notifType.type));
  const usesDutFilters = !!(formValues.notifType && ['room'].includes(formValues.notifType.type));

  const isWaterNotification = notificationType === 'Agua' || (formValues.notifType?.type === 'water');
  const isManagingAllClients = getUserProfile().manageAllClients;

  useEffect(() => {
    handleGetInfos();
  }, [state.clientId]);

  function setFormField(name: keyof FormFields, value: string) {
    state.formFields.handleChange(name, value); render();
  }

  function clearComboOpts() {
    return {
      clients: [] as { label: string, value: number }[],
      users: null as null|{ USER: string, checked?: boolean }[],
      units: null as null|(ComboItemUnit[]),
      groups: null as null|{ GROUP_ID: number, GROUP_NAME: string, UNIT_ID: number, unit?: ComboItemUnit, checked?: boolean, label?: string }[],
      duts: null as null|{ DEV_ID: string, UNIT_ID: number, ROOM_NAME: string, unit?: ComboItemUnit, checked?: boolean, label?: string }[],
      freqs: null as null|{ label: string, value: 'NONE'|'DAY'|'WEEK'|'MONTH' }[],
      notifTypes: null as null|{
        id: string;
        name: string;
        ops: { label: string; value: string; unit: string, unit2: string }[];
        type: string;
      }[],
      allGroups: null as null|{ GROUP_ID: number, GROUP_NAME: string, UNIT_ID: number, unit?: ComboItemUnit, checked?: boolean }[],
      allDuts: null as null|{ DEV_ID: string, UNIT_ID: number, ROOM_NAME: string, unit?: ComboItemUnit, checked?: boolean }[],
    };
  }

  function clientSelected(item: { label: string, value: number }) {
    state.formFields.handleChange('client', item);
    state.clientId = item && item.value;
    render();
  }

  async function handleSubmitNotification() {
    try {
      const formValues = state.formFields.values;
      const notifTypeId = formValues.notifType?.id;
      const notifEnvironment = notifTypeId === 'DUT_T' || notifTypeId === 'DUT_CO2';
      const notifMachine = notifTypeId === 'HEALTH_IDX' || notifTypeId === 'COMP_DUR' || notifTypeId === 'NUM_DEPS' || notifTypeId === 'COMP_TIME' || notifTypeId === 'VRF_COOLAUT';
      const profile = getUserProfile();

      let FILT_TYPE = null as null|string;
      let FILT_IDS = null as null|(string[])|(number[]);
      if (state.comboOpts.duts && notifEnvironment) {
        const selected_duts = state.comboOpts.duts.filter((x) => x.checked);
        const isAllChecked = selected_duts.length === 0 || selected_duts.length === state.comboOpts.allDuts!.length;

        if (!isAllChecked) {
          FILT_TYPE = 'DUT';
          FILT_IDS = selected_duts.map((x) => x.DEV_ID);
        }
        else {
          FILT_TYPE = null;
          FILT_IDS = null;
        }
      }

      else if (state.comboOpts.groups && notifMachine) {
        const selected_groups = state.comboOpts.groups && state.comboOpts.groups.filter((x) => x.checked);
        const isAllChecked = (selected_groups.length === 0) || (selected_groups.length === state.comboOpts.allGroups!.length);
        FILT_TYPE = isAllChecked ? null : 'GROUP';
        FILT_IDS = isAllChecked ? null : selected_groups.map((x) => x.GROUP_ID);
      }
      if (FILT_TYPE == null && state.comboOpts.units) {
        const selected_units = state.comboOpts.units.filter((x) => x.checked);
        const isAllChecked = selected_units.length === 0 || selected_units.length === state.comboOpts.units.length;
        if (!isAllChecked) {
          FILT_TYPE = 'UNIT';
          FILT_IDS = selected_units.map((x) => x.UNIT_ID);
        } else {
          FILT_TYPE = null;
          FILT_IDS = null;
        }
      }

      let response = null as null|{};
      let action = null as null|string;
      if (notificationType === 'RelatorioAutomatico') {
        if (!formValues.freq) {
          toast.error(t('erroSelecionarFrequeciaEnvio'));
          return;
        }
        setState({ isSubmitting: true });
        response = await apiCall('/users/set-notif-unitrep', {
          USER: profile.user,
          FILT_TYPE,
          FILT_IDS,
          FREQ: formValues.freq && formValues.freq.value,
        });
        action = 'set';
      } else if (notificationType === 'FalhaRepentina') {
        throw Error(t('erroNaoImplementado'));
      } else if (notifId) {
        if (!formValues.notifType) {
          toast.error(t('erroSelecionarCondicao'));
          return;
        }
        if (!formValues.notifCond) {
          toast.error(t('erroSelecionarCondicao'));
          return;
        }

        // Verifica se a condição é no momento da detecção ou no final do dia
        let cond_pars: string | null = null;
        if (state.checkboxOption === 'noMomento') {
          cond_pars = 'instant';
        } else if (state.checkboxOption === 'finalDoDia') {
          cond_pars = 'endofday';
        }

        setState({ isSubmitting: true });
        response = await apiCall('/dac/edit-notification-request', {
          NOTIF_ID: notifId,
          NAME: formValues.description,
          CLIENT_ID: state.clientId || undefined,
          COND_PARS: cond_pars,
          FILT_TYPE,
          FILT_IDS,
          COND_VAR: formValues.notifType && formValues.notifType.id,
          COND_OP: formValues.notifCond && formValues.notifCond.value,
          COND_VAL: formValues.condValue,
          COND_SECONDARY_VAL: formValues.condSecondaryValue,
          NOTIF_TYPE: 'EMAIL',
          NOTIF_DESTS: (state.multiUsers && state.comboOpts.users)
            ? state.comboOpts.users
              .filter((x) => x.checked)
              .map((x) => x.USER)
            : [profile.user],
        });
        action = 'edit';
      } else {
        if (!state.clientId) {
          toast.error(t('erroSelecionarCliente'));
          state.isSubmitting = false;
          return;
        }
        if (!formValues.notifType) {
          toast.error(t('erroSelecionarCondicao'));
          state.isSubmitting = false;
          return;
        }
        if (!formValues.notifCond) {
          toast.error(t('erroSelecionarCondicao'));
          state.isSubmitting = false;
          return;
        }
        if (formValues.notifType?.type === 'water' && state.checkboxOption !== 'noMomento' && state.checkboxOption !== 'finalDoDia') {
          toast.error(t('erroSelecionarMomentoDeEnvio'));
          state.isSubmitting = false;
          return;
        }
        if ((formValues.notifType && formValues.notifType.id === 'DUT_T') && (formValues.notifCond && getDutNotifTemperature(formValues.notifCond.value))) {
          formValues.description = getDutDescription(formValues.notifCond.value);
        }

        let cond_pars: string | null = null;
        if (state.checkboxOption === 'noMomento') {
          cond_pars = 'instant';
        } else if (state.checkboxOption === 'finalDoDia') {
          cond_pars = 'endofday';
        }

        setState({ isSubmitting: true });
        response = await apiCall('/dac/add-notification-request', {
          NAME: formValues.description,
          CLIENT_ID: state.clientId,
          FILT_TYPE,
          FILT_IDS,
          COND_VAR: formValues.notifType && formValues.notifType.id,
          COND_OP: formValues.notifCond && formValues.notifCond.value,
          COND_VAL: formValues.condValue,
          COND_SECONDARY_VAL: formValues.condSecondaryValue,
          COND_PARS: cond_pars,
          NOTIF_TYPE: 'EMAIL',
          NOTIF_DESTS: (state.multiUsers && state.comboOpts.users)
            ? state.comboOpts.users
              .filter((x) => x.checked)
              .map((x) => x.USER)
            : [profile.user],
        });
        action = 'new';
      }
      toast.success(t('sucessoAdicionarNotificacao'));
      if (response && action && onSuccess) onSuccess({ item: response, action });
    } catch (err) {
      console.log(err);
      toast.error(t('erroCadastrarNotificacao'));
    }
    setState({ isSubmitting: false });
  }

  async function handleGetInfos() {
    try {
      state.isLoading = true; render();

      state.comboOpts = clearComboOpts();
      state.formFields = initFormFields();
      const profile = getUserProfile();
      state.multiUsers = !!(state.isRegularFault && state.clientId && (profile.permissions.CLIENT_MANAGE.includes(state.clientId) || profile.manageAllClients));

      if (notificationType === 'FalhaRepentina') {
        throw Error(t('erroNaoImplementado'));
      }

      let notifInfo = props.notifInfo;
      if (notifInfo?.CLIENT_ID) state.clientId = notifInfo.CLIENT_ID;

      const isEdit = (!!notifId) || (notificationType === 'RelatorioAutomatico');

      if (!isEdit && state.multiClient) {
        if (state.comboOpts.clients.length === 0) {
          const { list } = await apiCall('/clients/get-clients-list', {});
          state.comboOpts.clients = list.map((row) => ({ label: row.NAME, value: row.CLIENT_ID }));
        }
        if (state.clientId) {
          state.formFields.values.client = state.comboOpts.clients.find((x) => x.value === state.clientId) || null;
        }
        if (!state.formFields.values.client) {
          state.isLoading = false; render();
          return;
        }
      }

      await Promise.all([
        (async () => {
          if (notificationType === 'RelatorioAutomatico') {
            notifInfo = await apiCall('/users/get-notif-unitrep', {});
          }
        })(),

        // Common queries
        (async () => {
          const responseData = await apiCall('/dac/notifications-options', {});
          state.comboOpts.notifTypes = responseData.notifTypes;
          state.comboOpts.freqs = responseData.frequencyOptions;
          // state.comboOpts.destTypes = responseData.destTypes;
        })(),
        (async () => {
          if (notificationType === 'Agua') {
            const response = await apiCall('/get-integrations-list', { clientIds: [state.clientId!], supplier: 'water' });
            state.comboOpts.units = response.list;
            for (const unit of state.comboOpts.units) {
              unit.comboLabel = state.clientId ? unit.UNIT_NAME : `${unit.CLIENT_NAME} > ${unit.UNIT_NAME}`;
            }
            state.comboOpts.units = state.comboOpts.units.sort((a, b) => {
              if (a.comboLabel! > b.comboLabel!) return 1;
              if (a.comboLabel! < b.comboLabel!) return -1;
              return 0;
            });
          } else {
            const response = await apiCall('/clients/get-units-list', { CLIENT_ID: state.clientId! });
            state.comboOpts.units = response;
            for (const unit of state.comboOpts.units) {
              unit.comboLabel = state.clientId ? unit.UNIT_NAME : `${unit.CLIENT_NAME} > ${unit.UNIT_NAME}`;
            }
            state.comboOpts.units = state.comboOpts.units.sort((a, b) => {
              if (a.comboLabel! > b.comboLabel!) return 1;
              if (a.comboLabel! < b.comboLabel!) return -1;
              return 0;
            });
          }
        })(),

        // Queries related to DUTs
        (async () => {
          if (['IndiceSaude', 'UsoCondensadora', 'RelatorioAutomatico', 'FalhaRepentina'].includes(notificationType)) {
            // No DUTs
          } else {
            const response = await apiCall('/dut/get-duts-list', { clientId: state.clientId! });
            state.comboOpts.allDuts = response.list;
          }
        })(),

        // Queries related to DACs
        (async () => {
          if (['Ambientes', 'RelatorioAutomatico'].includes(notificationType)) {
            // No DACs
          } else {
            const response = await apiCall('/clients/get-groups-list', { clientIds: [state.clientId!] });
            state.comboOpts.allGroups = response;
          }
        })(),

        (async () => {
          if (state.multiUsers) {
            const response = await apiCall('/users/list-users', {
              CLIENT_ID: state.clientId!,
              includeAdmins: profile.permissions.isAdminSistema,
            });
            state.comboOpts.users = response.list || [];
            for (const adminUser of (response.adminUsers || [])) {
              if (state.comboOpts.users.some((x) => (x.USER === adminUser.USER))) {
                // user already in the list
                continue;
              } else {
                state.comboOpts.users.push(adminUser);
              }
            }
          }
        })(),
      ]);

      // Receive and associate combo options
      const { comboOpts } = state;
      if (comboOpts.allGroups) {
        for (const group of comboOpts.allGroups) {
          group.unit = comboOpts.units!.find((unit) => unit.UNIT_ID === group.UNIT_ID);
          group.GROUP_NAME = `${group.unit?.UNIT_NAME} > ${group.GROUP_NAME}`;
        }
      }
      if (comboOpts.allDuts && comboOpts.units) {
        for (const dut of comboOpts.allDuts) {
          if (!dut.ROOM_NAME) dut.ROOM_NAME = dut.DEV_ID;
          dut.unit = comboOpts.units.find((unit) => unit.UNIT_ID === dut.UNIT_ID);
          dut.ROOM_NAME = `${dut.unit?.UNIT_NAME} > ${dut.ROOM_NAME}`;
        }
      }

      if (notificationType === 'Ambientes') {
        if (state.comboOpts.allDuts!.length === 0) {
          setTimeout(() => {
            alert(t('erroNaoPossuiEsseServicoEntreContatoEquipeDiel'));
          }, 50);
        }
      }

      // Filter options if a notification type was defined
      if (notificationType === 'IndiceSaude') {
        comboOpts.notifTypes = comboOpts.notifTypes!.filter((item) => item.type === 'saude');
      }
      if (notificationType === 'UsoCondensadora') {
        comboOpts.notifTypes = comboOpts.notifTypes!.filter((item) => item.type === 'uso');
      }
      if (notificationType === 'Ambientes') {
        comboOpts.notifTypes = comboOpts.notifTypes!.filter((item) => item.type === 'room');
      }
      if (notificationType === 'Agua') {
        comboOpts.notifTypes = comboOpts.notifTypes!.filter((item) => item.type === 'water');
      }
      if (notificationType === 'RelatorioAutomatico' || notificationType === 'FalhaRepentina') {
        comboOpts.notifTypes = null;
      } else {
        comboOpts.freqs = null;
      }

      const formValues = state.formFields.values;

      // if (comboOpts.units) comboOpts.units.forEach(item => { item.checked = false })
      // if (comboOpts.groups) comboOpts.groups.forEach(item => { item.checked = false })
      // if (comboOpts.dacs) comboOpts.dacs.forEach(item => { item.checked = false })
      // if (comboOpts.rooms) comboOpts.rooms.forEach(item => { item.checked = false })
      // if (comboOpts.duts) comboOpts.duts.forEach(item => { item.checked = false })

      // Load data for edition
      if (notifInfo) {
        if (notifInfo.COND_PARS === 'endofday') state.checkboxOption = 'finalDoDia';
        if (notifInfo.COND_PARS === 'instant') state.checkboxOption = 'noMomento';
        if (notifInfo.FILT_IDS) {
          if (notifInfo.FILT_TYPE === 'UNIT') comboOpts.units?.forEach((item) => { item.checked = (notifInfo!.FILT_IDS as number[]).includes(item.UNIT_ID); });
          if (notifInfo.FILT_TYPE === 'GROUP') comboOpts.allGroups?.forEach((item) => { item.checked = (notifInfo!.FILT_IDS as number[]).includes(item.GROUP_ID); if (item.checked && item.unit) { item.unit.checked = true; } });
          if (notifInfo.FILT_TYPE === 'DUT') comboOpts.allDuts?.forEach((item) => { item.checked = (notifInfo!.FILT_IDS as string[]).includes(item.DEV_ID); });
          if (notifInfo.FILT_TYPE === 'CLIENT') {
            // TODO: melhorar a interpretação deste filtro
            comboOpts.units?.forEach((item) => { item.checked = true; });
            comboOpts.allGroups?.forEach((item) => { item.checked = true; if (item.checked && item.unit) { item.unit.checked = true; } });
            comboOpts.allDuts?.forEach((item) => { item.checked = true; });
          }
          // if (notifInfo.FILT_TYPE === 'ROOM') comboOpts.allRooms.forEach(item => { item.checked = notifInfo.FILT_IDS.includes(item.GROUP_ID); if (item.checked && item.unit) { item.unit.checked = true; } })
          // if (notifInfo.FILT_TYPE === 'DAC') comboOpts.allDacs.forEach(item => { item.checked = notifInfo.FILT_IDS.includes(item.DAC_ID)})
        } else {
          comboOpts.units?.forEach((item) => { item.checked = true; });
          comboOpts.allGroups?.forEach((item) => { item.checked = true; if (item.checked && item.unit) { item.unit.checked = true; } });
          comboOpts.allDuts?.forEach((item) => { item.checked = true; });
        }
        if (notificationType === 'RelatorioAutomatico') {
          formValues.freq = comboOpts.freqs!.find((x) => x.value === notifInfo!.FREQ) || null;
          formValues.description = 'Relatório Automático';
        } else if (notificationType === 'FalhaRepentina') {
          formValues.freq = comboOpts.freqs!.find((x) => x.value === notifInfo!.FREQ) || null;
          formValues.description = 'Falha Repentina';
        } else if (notifId) {
          formValues.description = notifInfo.NAME || '';
          formValues.notifType = comboOpts.notifTypes!.find((item) => item.id === notifInfo!.COND_VAR) || null;
          formValues.notifCond = formValues.notifType && formValues.notifType.ops.find((item) => item.value === notifInfo!.COND_OP) || null;
          formValues.condValue = formValues.notifCond && notifInfo!.COND_VAL || '';
          formValues.condSecondaryValue = formValues.notifCond && notifInfo!.COND_SECONDARY_VAL || '';
          if (comboOpts.users && notifInfo.NOTIF_DESTS) {
            comboOpts.users.forEach((item) => { item.checked = notifInfo!.NOTIF_DESTS!.includes(item.USER); });
          }
        }
      } else if (comboOpts.notifTypes && comboOpts.notifTypes.length === 1) {
        formValues.notifType = comboOpts.notifTypes[0];
        if (formValues.notifType.ops && formValues.notifType.ops.length === 1) {
          formValues.notifCond = formValues.notifType.ops[0];
          if ((formValues.notifType.id === 'DUT_T') && (formValues.notifCond.value === 'DUT<>DUT') && !formValues.condValue) {
            setFormField('condValue', '30');
          }
        }
      }

      const checkers = {
        description: state.isRegularFault ? requiredStringField : undefined,
        notifType: state.isRegularFault ? requiredStringField : undefined,
        notifCond: state.isRegularFault ? requiredStringField : undefined,
        freq: state.isSpecialNotif ? requiredStringField : undefined,
        // message: null,
        // units: null,
        // groups: null,
        // dacs: null,
        // rooms: null,
        // duts: null,
      };

      state.formFields = formFieldsValidator(checkers, formValues);

      filterComboOptions();
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erroInformacoes'));
    }
    state.isLoading = false; render();
  }

  function filterComboOptions() {
    const { comboOpts } = state;
    let sel_units = comboOpts.units!.filter((item) => item.checked);
    if (sel_units.length === 0) sel_units = comboOpts.units!;

    if (comboOpts.allGroups) {
      comboOpts.groups = comboOpts.allGroups.filter((group) => comboOpts.units!.includes(group.unit!));
      if (sel_units.length) {
        comboOpts.groups = comboOpts.groups.filter((group) => sel_units.includes(group.unit!));
      }
      for (const group of comboOpts.allGroups) {
        if (!comboOpts.groups.includes(group)) group.checked = false;
      }
      // Check for multiple groups with the same name
      for (const item of comboOpts.groups) {
        const found = comboOpts.groups.find((x) => x.GROUP_NAME === item.GROUP_NAME)!;
        if (found !== item) {
          found.label = `${found.GROUP_NAME} (${found.unit!.UNIT_NAME})`;
          item.label = `${item.GROUP_NAME} (${item.unit!.UNIT_NAME})`;
        } else {
          item.label = item.GROUP_NAME;
        }
      }
    }

    if (comboOpts.allDuts) {
      comboOpts.duts = comboOpts.allDuts.filter((dut) => dut.unit && comboOpts.units!.includes(dut.unit));
      if (sel_units.length) {
        comboOpts.duts = comboOpts.duts.filter((dut) => dut.unit && sel_units.includes(dut.unit));
      }
      for (const dut of comboOpts.allDuts) {
        if (!comboOpts.duts.includes(dut)) dut.checked = false;
      }
      // Check for multiple duts with the same name
      for (const item of comboOpts.duts) {
        const found = comboOpts.duts.find((x) => x.ROOM_NAME === item.ROOM_NAME)!;
        if (found !== item) {
          found.label = `${found.ROOM_NAME} (${found.unit!.UNIT_NAME})`;
          item.label = `${item.ROOM_NAME} (${item.unit!.UNIT_NAME})`;
        } else {
          item.label = item.ROOM_NAME;
        }
      }
    }

    render();
  }

  function changeMultipleSelection(item, list) {
    if (item) {
      item.checked = !item.checked;
    } else {
      for (const elem of list) { elem.checked = false; }
    }
    filterComboOptions();
    render();
  }

  function selectAllOptions(list) {
    const shouldBeChecked = list.some((el) => !el.checked);

    if (shouldBeChecked) {
      for (const elem of list) {
        elem.checked = true;
      }
    } else {
      for (const elem of list) {
        elem.checked = false;
      }
    }

    filterComboOptions();
    render();
  }

  function changeNotifType(item) {
    setFormField('notifType', item);
    formValues.notifCond = null;
    formErrors.notifCond = null;
    if (item && item.ops && item.ops.length === 1) {
      formValues.notifCond = item.ops[0];
      if ((formValues.notifType!.id === 'DUT_T') && (formValues.notifCond!.value === 'DUT<>DUT') && !formValues.condValue) {
        setFormField('condValue', '30');
      }
    }
  }

  if (state.isLoading) return <Loader />;

  if (state.multiClient && (!state.clientId)) {
    return (
      <Flex flexDirection="column">
        <Select
          options={state.comboOpts.clients!}
          value={state.formFields.values.client}
          placeholder={t('cliente')}
          onSelect={(item) => clientSelected(item)}
          haveFuzzySearch
          style={{ marginBottom: '15px' }}
        />
      </Flex>
    );
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedData = event.clipboardData.getData('Text');
    const pastedItems = pastedData.split(/\r?\n/).map((item) => item.trim());
    const matchingUnits = (state.comboOpts.units || []).filter((unit) => pastedItems.includes(unit.UNIT_NAME)).map((unit) => unit.UNIT_ID);
    state.comboOpts.units?.forEach((item) => {
      if (matchingUnits.includes(item.UNIT_ID)) {
        item.checked = true;
      }
    });
    render();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <Flex flexDirection="column">
      {state.multiClient && (
        <Select
          options={state.comboOpts.clients!}
          value={state.formFields.values.client}
          placeholder={t('cliente')}
          onSelect={(item) => clientSelected(item)}
          haveFuzzySearch
          propLabel="label"
          style={{ marginBottom: '15px' }}
        />
      )}
      {state.isRegularFault && (
        <Box maxWidth="435px" width={1}>
          {
            ((formValues.notifType && formValues.notifType.id === 'DUT_T') && (formValues.notifCond && getDutNotifTemperature(formValues.notifCond.value)))
              ? (
                <Input
                  placeholder={t('titulo')}
                  value={getDutDescription(formValues.notifCond.value)}
                  disabled
                />
              )
              : (
                <Input
                  placeholder={t('titulo')}
                  value={formValues.description}
                  onChange={(e) => setFormField('description', e.target.value)}
                />
              )
          }
        </Box>
      )}
      <Flex flexWrap="wrap">
        {state.comboOpts.notifTypes && (
          <Box maxWidth="280px" width={1} mt="24px" mr="15px">
            <Select
              options={state.comboOpts.notifTypes}
              propLabel="name"
              value={formValues.notifType}
              onSelect={changeNotifType}
              haveFuzzySearch
              error={formErrors.notifType}
              placeholder={t('enviarNotificacaoSe')}
            />
          </Box>
        )}
        {state.comboOpts.notifTypes && (
          <Box maxWidth="280px" width={1} mt="24px" mr="15px">
            <Select
              options={(formValues.notifType && formValues.notifType.ops) || []}
              propLabel="label"
              value={formValues.notifCond}
              onSelect={(item) => setFormField('notifCond', item)}
              haveFuzzySearch
              error={formErrors.notifCond}
              placeholder={t('selecione')}
              tip
            />
          </Box>
        )}
        {formValues.notifCond && (formValues.notifCond.unit !== '') && (
          <Box maxWidth="280px" width={1} mt="24px" mr="15px">
            <Input
              value={formValues.condValue}
              onChange={(e) => {
                setFormField('condValue', e.target.value);
              }}
              error={formErrors.condValue}
              label={formValues.notifCond.unit}
            />
            {(formValues.notifCond.unit === 'offset para limite superior de temperatura') && (
            <OffsetContainer>
              <IconWrapper
                disabled={formValues.condValue === ''}
                onClick={() => {
                  setFormField('condValue', '');
                }}
              >
                <CloseIcon color={colors.Grey400} />
              </IconWrapper>
              <Offset data-tip data-for="offset">
                {t('offsetLimiteSuperior')}
              </Offset>
              <StyledReactTooltip
                id="offset"
                place="top"
                type="light"
                effect="float"
              >
                {t('detalhesOffsetNotificacao', {
                  value1: (formValues.condValue || '0'),
                  value2: (formValues.condValue ? (26.0 + (parseDecimalNumber(formValues.condValue) || 0)).toString() : '26'),
                })}
              </StyledReactTooltip>
            </OffsetContainer>
            )}
          </Box>
        )}
        {formValues.notifCond && (formValues.notifCond.unit2 !== '') && (
          <Box maxWidth="280px" width={1} mt="24px">
            <Input
              value={formValues.condSecondaryValue}
              onChange={(e) => setFormField('condSecondaryValue', e.target.value)}
              error={formErrors.condSecondaryValue}
              label={formValues.notifCond.unit2}
            />
          </Box>
        )}
      </Flex>
      <Flex flexWrap="wrap">
        {state.comboOpts.units && (
          <Box maxWidth="435px" width={1} mt="24px" mr="15px" onPaste={handlePaste}>
            <SelectMultiple
              emptyLabel={t('todas')}
              propLabel="comboLabel"
              options={state.comboOpts.units}
              values={state.comboOpts.units.filter((x) => x.checked)}
              haveFuzzySearch
              haveSelectAll
              selectAllOptions={selectAllOptions}
              name="unidades"
              onSelect={(item) => changeMultipleSelection(item, state.comboOpts.units)}
              placeholder={t('unidades')}
            />
          </Box>
        )}
        {state.comboOpts.groups && usesDacFilters && (
          <Box maxWidth="580px" width={1} mt="24px" mr="15px">
            <SelectMultiple
              emptyLabel={t('todas')}
              propLabel="GROUP_NAME"
              options={state.comboOpts.groups}
              values={state.comboOpts.groups.filter((x) => x.checked)}
              haveFuzzySearch
              haveSelectAll
              selectAllOptions={selectAllOptions}
              name="maquinas"
              onSelect={(item) => changeMultipleSelection(item, state.comboOpts.allGroups)}
              placeholder={t('maquinas')}
              disabled={(state.comboOpts.groups.length === 0)}
            />
          </Box>
        )}
        {state.comboOpts.duts && usesDutFilters && (
          <Box maxWidth="580px" width={1} mt="24px">
            <SelectMultiple
              emptyLabel={t('todos')}
              propLabel="ROOM_NAME"
              options={state.comboOpts.duts}
              values={state.comboOpts.duts.filter((x) => x.checked)}
              haveFuzzySearch
              haveSelectAll
              selectAllOptions={selectAllOptions}
              name="ambientes"
              onSelect={(item) => changeMultipleSelection(item, state.comboOpts.allDuts)}
              placeholder={t('ambientes')}
              disabled={(state.comboOpts.duts.length === 0)}
            />
          </Box>
        )}
      </Flex>
      {state.comboOpts.freqs && (
        <Box maxWidth="280px" width={1} mt="24px">
          <Select
            options={state.comboOpts.freqs}
            propLabel="label"
            value={formValues.freq}
            onSelect={(item) => setFormField('freq', item)}
            haveFuzzySearch
            error={formErrors.freq}
            placeholder={t('enviarNotificacao')}
          />
        </Box>
      )}
      {state.comboOpts.users && (
        <Box maxWidth="435px" width={1} mt="24px">
          <SelectMultiple
            emptyLabel={t('nenhum')}
            propLabel="USER"
            options={state.comboOpts.users}
            values={state.comboOpts.users.filter((x) => x.checked)}
            haveFuzzySearch
            haveSelectAll
            selectAllOptions={selectAllOptions}
            name="destinatarios"
            onSelect={(item) => changeMultipleSelection(item, state.comboOpts.users)}
            placeholder={t('destinatarios')}
          />
        </Box>
      )}
      {(isWaterNotification)
      && (
      <>
        <span style={{ fontWeight: 'bold' }}>{t('emQualMomentoNotificacao')}</span>
        <Flex marginTop={12}>
          <Flex marginRight={20}>
            <Checkbox
              size={20}
              checked={state.checkboxOption === 'noMomento'}
              onClick={() => {
                state.checkboxOption = 'noMomento';
                render();
              }}
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
              checked={state.checkboxOption === 'finalDoDia'}
              onClick={() => {
                state.checkboxOption = 'finalDoDia';
                render();
              }}
            />
            <span>
              <Trans
                i18nKey="finalDoDiaNotificacao"
              >
                <b>No final do dia</b>
                com o compilado de todos os que satisfizeram a condição.
              </Trans>
            </span>
          </Flex>
        </Flex>
      </>
      )}
      {(notificationType === 'Agua' && getUserProfile().manageAllClients) && (
      <div style={{ marginTop: '12px' }}>
        <strong>{t('regrasUtilizadasAlgoritmoDeteccaoVazamentoAgua')}</strong>
        <p>{t('consumoContinuoMaior12Horas')}</p>
        <p>{t('consumoDiaMaior2VezesMediaUltimosQuatroDias')}</p>
        <p>{t('consumoDiarioPassar2VezesCapacidadeCaixaAgua')}</p>
        <p>{t('obs1ComportamentoAcimaDeveRepetirDoisDiasConsecutivos')}</p>
        <p>{t('obs2ValoresMarcadosAsteriscoSaoValoresPadroesPoremParametrizaveis')}</p>
      </div>
      )}
      <Flex flexWrap="wrap">
        <Box maxWidth="280px" width={1} mt="24px" mr="24px">
          <Button variant="secondary" onClick={onCancel}>
            {t('botaoCancelar')}
          </Button>
        </Box>
        <Box maxWidth="280px" width={1} mt="24px">
          <Button variant={state.isSubmitting ? 'disabled' : 'primary'} onClick={() => handleSubmitNotification()}>
            {state.isSubmitting ? <Loader size="small" /> : t('botaoSalvar')}
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
};
