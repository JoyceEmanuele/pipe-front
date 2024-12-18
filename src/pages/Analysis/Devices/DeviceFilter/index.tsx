import SelectSearch, { fuzzySearch } from 'react-select-search';
import { Flex } from 'reflexbox';
import { useStateVar } from '~/helpers/useStateVar';
import {
  SearchInput, Label, StatusIcon, ControlFilter, CleanBtn, ExportBtn,
} from './styles';
import i18n from '~/i18n';
import { Button } from '~/components';
import { useContext, useEffect, useRef } from 'react';
import {
  ArrowDownIconV2, ArrowUpIconV2, ExportIcon, FilterIcon,
} from '~/icons';
import { colors } from '~/styles/colors';
import { CSVLink } from 'react-csv';
import MenuContext from '~/contexts/menuContext';
import {
  getCitiesList, getClientsList, getStatesList, getUnitsList, setValueState,
} from '~/helpers/genericHelper';
import { InputSearch } from '~/components/NewInputs/Search';

const t = i18n.t.bind(i18n);

const CSVHeader = [
  { label: t('cliente'), key: 'CLIENT_NAME' },
  { label: t('estado'), key: 'STATE' },
  { label: t('cidade'), key: 'CITY_NAME' },
  { label: t('unidade'), key: 'UNIT' },
  { label: t('dispositivo'), key: 'DEVICE' },
  { label: t('status'), key: 'STATUS' },
];

export const DevFilter = (props: {state: any, render: any}): JSX.Element => {
  const [state, render] = useStateVar(() => {
    const state = {
      isLoading: false, // setIsLoading
      showFilter: true as boolean,
      desktopWidth: window.matchMedia('(min-width: 768px)'),

      statesListOpts: [] as { value: string, name: string }[],
      selectedStateOpts: setValueState('filterStates') as any | any[],
      citiesListOpts: [] as { value: string, name: string }[],
      selectedCityOpts: setValueState('filterCity') as any | any[],
      clientsListOpts: [] as { value: string, name: string }[],
      selectedClientOpts: setValueState('filterClient') as any | any[],
      unitsListOpts: [] as { value: string, name: string }[],
      selectedUnitOpts: setValueState('filterUnit') as any | any[],
      selectedConnectionOpts: [] as any | any[],
      selectedDevId: '',

      infoTypeOpts: [
        { value: 'assoc', name: t('dispositivosAssociados') },
        { value: 'notAssoc', name: t('dispositivosSemAssociacao') },
        { value: 'all', name: t('todos') },
      ],
      selectedInfoType: 'all' as any,

      associateds: true as boolean,
      csvData: [], // setCsvData
    };
    return state;
  });

  const { menuToogle } = useContext(MenuContext);// true = open, false = not Open

  function clearFilters() {
    state.selectedCityOpts = [];
    state.selectedClientOpts = [];
    state.selectedConnectionOpts = [];
    state.selectedStateOpts = [];
    state.selectedUnitOpts = [];
    state.selectedInfoType = 'all';
    render();
    filter();
    sessionStorage.clear();
  }

  useEffect(() => {
    getCitiesList(state, render);
    getUnitsList(state, render);
    getClientsList(state, render);
    getStatesList(state, render);
    filter();
  }, []);

  function verificationItemFilter(value, arraySelected) {
    const result = (arraySelected.length > 0 && arraySelected.includes(value?.toString()) || arraySelected.length === 0);
    return result;
  }

  function filter() {
    props.state.isLoading = true; props.render();

    props.state.associatedsDevicesListFiltered = props.state.associatedsDevicesList
      .filter((dev) => dev.DEVICE_CODE.toLowerCase().includes(state.selectedDevId.toLowerCase()))
      .filter((dev) => verificationItemFilter(dev.STATE_ID, state.selectedStateOpts))
      .filter((dev) => verificationItemFilter(dev.CITY_ID, state.selectedCityOpts))
      .filter((dev) => verificationItemFilter(dev.CLIENT_ID, state.selectedClientOpts))
      .filter((dev) => verificationItemFilter(dev.UNIT_ID, state.selectedUnitOpts))
      .filter((dev) => !state.selectedConnectionOpts.length || state.selectedConnectionOpts.includes(dev.STATUS));

    props.state.notAssociatedsDevicesListFiltered = props.state.notAssociatedsDevicesList
      .filter((dev) => dev.DEVICE_CODE.toLowerCase().includes(state.selectedDevId.toLowerCase()))
      .filter((dev) => verificationItemFilter(dev.STATE_ID, state.selectedStateOpts))
      .filter((dev) => verificationItemFilter(dev.CITY_ID, state.selectedCityOpts))
      .filter((dev) => verificationItemFilter(dev.CLIENT_ID, state.selectedClientOpts))
      .filter((dev) => verificationItemFilter(dev.UNIT_ID, state.selectedUnitOpts))
      .filter((dev) => !state.selectedConnectionOpts.length || state.selectedConnectionOpts.includes(dev.STATUS));

    if (state.selectedInfoType === 'assoc') {
      props.state.devicesListFiltered = props.state.associatedsDevicesListFiltered;
    }
    if (state.selectedInfoType === 'notAssoc') {
      props.state.devicesListFiltered = props.state.notAssociatedsDevicesListFiltered;
    }
    if (state.selectedInfoType === 'all') {
      props.state.devicesListFiltered = props.state.associatedsDevicesListFiltered
        .concat(props.state.notAssociatedsDevicesListFiltered);
    }
    props.state.isLoading = false; props.render();
  }

  function renderOption(props, option, snapshot, className) {
    return (
      <button {...props} className={className} type="button">
        <div style={{
          display: 'flex', flexFlow: 'row nowrap', alignItems: 'center',
        }}
        >
          {option.icon}
          <span style={{ marginLeft: '10px' }}>{option.name}</span>
        </div>
      </button>
    );
  }

  function defineSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
  }

  return (
    <Flex style={{ position: 'relative' }} flexDirection="column" flexWrap="wrap">
      <Flex width="100%" height={state.showFilter ? 'auto' : '0px'} flexDirection="row" style={{ borderBottom: state.showFilter ? `2px solid ${colors.Grey100}` : 'none' }} bg={state.showFilter ? '#f8f8f8' : '#ffffff'} padding={`24px 13px ${state.showFilter ? '16px' : '0'} 20px`}>
        <Flex flexDirection="column" justifyContent="start">
          <Flex
            flexDirection="row"
            mt={0}
            alignItems="center"
            flexWrap="wrap"
            style={{
              transition: 'visibility 0.5s, opacity 0.5s, background-color 0.5s, margin-top 1s',
              visibility: state.showFilter ? 'visible' : 'hidden',
              opacity: state.showFilter ? '1' : '0',
            }}
          >
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto', marginBottom: 23 }}>
              <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                <Label>{t('estado')}</Label>
                <SelectSearch
                  options={state.statesListOpts}
                  value={state.selectedStateOpts}
                  multiple
                  closeOnSelect={false}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('estado')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { state.selectedStateOpts = value; defineSessionStorage('filterStates', value); render(); }}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto', marginBottom: 23 }}>
              <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                <Label>{t('cidade')}</Label>
                <SelectSearch
                  options={state.citiesListOpts}
                  value={state.selectedCityOpts}
                  multiple
                  closeOnSelect={false}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('cidade')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { state.selectedCityOpts = value; defineSessionStorage('filterCity', value); render(); }}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto', marginBottom: 23 }}>
              <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                <Label>{t('cliente')}</Label>
                <SelectSearch
                  options={state.clientsListOpts}
                  value={state.selectedClientOpts}
                  multiple
                  closeOnSelect={false}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('nomeDoCliente')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { state.selectedClientOpts = value; defineSessionStorage('filterClient', state.selectedClientOpts); render(); }}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto', marginBottom: 23 }}>
              <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                <Label>{t('unidade')}</Label>
                <SelectSearch
                  options={state.unitsListOpts}
                  value={state.selectedUnitOpts}
                  multiple
                  closeOnSelect={false}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('nomeUnidade')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { state.selectedUnitOpts = value; defineSessionStorage('filterUnit', state.selectedUnitOpts); render(); }}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto', marginBottom: 23 }}>
              <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                <Label>{t('conexao')}</Label>
                <SelectSearch
                  options={[
                    { value: 'ONLINE', name: t('online'), icon: <StatusIcon status="ONLINE" /> },
                    { value: 'LATE', name: t('late'), icon: <StatusIcon status="LATE" /> },
                    { value: 'OFFLINE', name: t('offline'), icon: <StatusIcon status="OFFLINE" /> },
                  ]}
                  value={state.selectedConnectionOpts}
                  multiple
                  closeOnSelect={false}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('conexao')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { state.selectedConnectionOpts = value; render(); }}
                  disabled={state.isLoading}
                  renderOption={renderOption}
                />
              </div>
            </SearchInput>
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto' }}>
              <div
                style={{
                  width: '100%',
                  paddingTop: 3,
                  paddingBottom: 3,
                  height: 56.84,
                }}
              >
                <Label>{t('informacoesExibidas')}</Label>
                <SelectSearch
                  options={state.infoTypeOpts}
                  value={state.selectedInfoType}
                  closeOnSelect
                  printOptions="on-focus"
                  placeholder={t('selecionar')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { state.selectedInfoType = value; render(); }}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
            <SearchInput menuOpened={menuToogle} style={{ width: 'auto', marginTop: state.desktopWidth.matches ? 'none' : '23px', border: '0px' }}>
              <div style={{
                width: '100%', minWidth: '222px', height: '57px',
              }}
              >
                <InputSearch
                  style={{ height: '57px', border: '0px', padding: '22px 26px 4px 14px' }}
                  id="search"
                  name="search"
                  label={t('idDoDispositivo')}
                  placeholder={t('digitar')}
                  value={state.selectedDevId}
                  onEnterKey={filter}
                  onChange={(id) => { state.selectedDevId = id; render(); }}
                  disabled={state.isLoading}
                  noBorder
                  filterStyle
                />
              </div>
            </SearchInput>
          </Flex>
          {
            state.showFilter
            && (
            <CleanBtn menuOpened={menuToogle} onClick={clearFilters}>
              {t('limparFiltrosCap')}
            </CleanBtn>
            )
          }
        </Flex>
        <Button
          style={{
            width: '200px',
            height: '48.84px',
          }}
          type="button"
          variant={state.isLoading ? 'disabled' : 'primary'}
          onClick={filter}
        >
          {t('botaoFiltrar')}
        </Button>
      </Flex>
      {state.showFilter && <div style={{ height: 10 }} />}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ControlFilter
          style={{
            width: '110px', alignSelf: 'flex-start', marginTop: state.showFilter ? '10px' : 0,
          }}
          onClick={() => { state.showFilter = !state.showFilter; render(); }}
        >
          <FilterIcon style={{ marginRight: 4 }} />
          {t('filtros')}
          {state.showFilter ? <ArrowDownIconV2 width="8" heigth="7" style={{ marginLeft: 4 }} /> : <ArrowUpIconV2 width="8" heigth="7" style={{ marginLeft: 4 }} />}
        </ControlFilter>
        <CustomFilter showFilter={state.showFilter} stateFilter={state} render={props.render} state={props.state} tab="devices" />
      </div>
      {state.showFilter && <div style={{ height: 10 }} />}
    </Flex>
  );
};

export const CustomFilter = (props : {showFilter: boolean, tab: string, state: any, stateFilter: any, render: any}): JSX.Element => {
  const csvLinkEl = useRef();

  const getCsvData = async () => {
    props.state.isLoading = true; props.render();
    const formatterCSV = props.state.devicesListFiltered.map((dev) => ({
      CLIENT_NAME: dev.CLIENT_NAME || '-',
      STATE: dev.STATE || '-',
      CITY_NAME: dev.CITY_NAME || '-',
      UNIT: dev.UNIT_NAME || '-',
      DEVICE: dev.DEVICE_CODE || '-',
      STATUS: dev.STATUS || '-',
    }));

    props.stateFilter.csvData = formatterCSV;
    props.render();

    setTimeout(() => {
      (csvLinkEl as any).current.link.click();
      window.location.reload();
    }, 1000);
    props.state.isLoading = false; props.render();
  };

  return (
    <Flex
      style={{
        position: 'relative', transition: 'top 0.6s', top: 0,
      }}
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-end"
      width="99%"
    >
      {
        props.tab === 'devices' && (
        <>
          <ExportBtn onClick={getCsvData}>
            <ExportIcon />
            <span style={{ marginLeft: 10 }}>{t('exportarListaCap')}</span>
            <CSVLink
              headers={CSVHeader}
              data={props.stateFilter.csvData}
              separator=";"
              enclosingCharacter={"'"}
              filename={t('dispositivos')}
              asyncOnClick
              ref={csvLinkEl}
            />
          </ExportBtn>
        </>
        )
      }
    </Flex>
  );
};
