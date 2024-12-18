import { useEffect, useRef, useState } from 'react';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Loader, NewTable,
} from 'components';
import { CSVLink } from 'react-csv';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';
import { AnalysisLayout } from '../AnalysisLayout';
import { Headers2 } from '../Header';
import { useTranslation } from 'react-i18next';
import { StyledLink, StatusBox } from './styles';
import i18n from '~/i18n';
import { getUserProfile } from '~/helpers/userProfile';
import { UtilFilter } from '../Utilities/UtilityFilter';
import { setValueState, ajustParams } from '~/helpers/genericHelper';
import { withTransaction } from '@elastic/apm-rum-react';
import { AnalysisEmpty } from '../AnalysisEmpty';

const t = i18n.t.bind(i18n);
const CSVHeader = [
  { label: t('cliente'), key: 'CLIENT_NAME' },
  { label: t('estado'), key: 'STATE' },
  { label: t('cidade'), key: 'CITY_NAME' },
  { label: t('unidade'), key: 'UNIT' },
  { label: t('dispositivo'), key: 'DEVICE' },
  { label: 'MAC', key: 'MAC' },
  { label: t('status'), key: 'STATUS' },
];

export const Devices = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar({
    isLoading: !profile.manageAllClients && !profile.manageSomeClient,
    needFilter: profile.manageAllClients || profile.manageSomeClient,
    associatedsDevicesList: [] as ApiResps['/devices/get-devices-list']['list'],
    notAssociatedsDevicesList: [] as ApiResps['/devices/get-devices-list']['list'],
    devicesListFiltered: [] as ApiResps['/devices/get-devices-list']['list'],
    associatedsDevicesListFiltered: [] as ApiResps['/devices/get-devices-list']['list'],
    notAssociatedsDevicesListFiltered: [] as ApiResps['/devices/get-devices-list']['list'],
    devicesColumns: [
      {
        name: 'client',
        value: t('cliente'),
        accessor: 'CLIENT_NAME',
        width: '25%',
        render: (props) => (
          props.CLIENT_NAME || '-'
        ),
      },
      {
        name: 'state',
        value: t('estado'),
        accessor: 'STATE',
        width: '10%',
        render: (props) => (
          props.STATE || '-'
        ),
      },
      {
        name: 'city',
        value: t('cidade'),
        accessor: 'CITY_NAME',
        width: '15%',
        render: (props) => (
          props.CITY_NAME || '-'
        ),
      },
      {
        name: 'unit',
        value: t('unidade'),
        accessor: 'UNIT_NAME',
        width: '30%',
        render: (props) => (
          <div>
            {props.UNIT_NAME ? (
              <StyledLink to={`/analise/unidades/${props.UNIT_ID}`}>
                {props.UNIT_NAME}
              </StyledLink>
            ) : '-'}
          </div>
        ),
      },
      {
        name: 'device',
        value: t('dispositivo'),
        accessor: 'DEVICE_CODE',
        width: '10%',
        render: (props) => (
          <div>
            {props.DEVICE_CODE ? (
              <StyledLink to={`/analise/dispositivo/${props.DEVICE_CODE}/informacoes`}>
                {props.DEVICE_CODE}
              </StyledLink>
            ) : '-'}
          </div>
        ),
      },
      {
        name: 'connection',
        value: t('conexao'),
        accessor: 'STATUS',
        width: '10%',
        render: (props) => (
          <div>
            {props.STATUS ? (
              <StatusBox status={props.STATUS}>{props.STATUS}</StatusBox>
            ) : '-'}
          </div>
        ),
      },
    ],
    statesListOpts: [] as { value: string, name: string }[],
    selectedState: setValueState('filterStates') as string | string[],
    citiesListOpts: [] as { value: string, name: string }[],
    selectedCity: setValueState('filterCity') as string | string[],
    clientsListOpts: [] as { value: string, name: string }[],
    selectedClientFilter: setValueState('filterClient') as string | string[],
    unitsListOpts: [] as { value: string, name: string }[],
    selectedUnit: setValueState('filterUnit') as string | string[],
    selectedConnection: [] as string | string[],
    selectedDevId: '',

    infoTypeOpts: [
      { value: 'assoc', name: t('dispositivosAssociados') },
      { value: 'notAssoc', name: t('dispositivosSemAssociacao') },
      { value: 'all', name: t('todos') },
    ],
    ownershipFilter: 'all' as string,

    associateds: true as boolean,
    csvData: [] as { CLIENT_NAME: string; STATE: string; CITY_NAME: string; UNIT: string; DEVICE: string; STATUS: string; }[], // setCsvData
  });
  const csvLinkEl = useRef();

  function verificationItemFilter(value, arraySelected) {
    const result = (arraySelected.length > 0 && arraySelected.includes(value?.toString())) || arraySelected.length === 0;
    return result;
  }

  async function filter() {
    state.isLoading = true;
    if (state.needFilter !== null) setState({ needFilter: false });
    await handleGetData();
    render();

    state.associatedsDevicesListFiltered = state.associatedsDevicesList
      .filter((dev) => dev.DEVICE_CODE.toLowerCase().includes(state.selectedDevId.toLowerCase()))
      .filter((dev) => verificationItemFilter(dev.STATE_ID, state.selectedState))
      .filter((dev) => verificationItemFilter(dev.CITY_ID, state.selectedCity))
      .filter((dev) => verificationItemFilter(dev.CLIENT_ID, state.selectedClientFilter))
      .filter((dev) => verificationItemFilter(dev.UNIT_ID, state.selectedUnit))
      .filter((dev) => state.selectedConnection.length === 0 || state.selectedConnection.includes(dev.STATUS));

    state.notAssociatedsDevicesListFiltered = state.notAssociatedsDevicesList
      .filter((dev) => dev.DEVICE_CODE.toLowerCase().includes(state.selectedDevId.toLowerCase()))
      .filter((dev) => verificationItemFilter(dev.STATE_ID, state.selectedState))
      .filter((dev) => verificationItemFilter(dev.CITY_ID, state.selectedCity))
      .filter((dev) => verificationItemFilter(dev.CLIENT_ID, state.selectedClientFilter))
      .filter((dev) => verificationItemFilter(dev.UNIT_ID, state.selectedUnit))
      .filter((dev) => state.selectedConnection.length === 0 || state.selectedConnection.includes(dev.STATUS));

    if (state.ownershipFilter === 'assoc') {
      state.devicesListFiltered = state.associatedsDevicesListFiltered;
    }
    if (state.ownershipFilter === 'notAssoc') {
      state.devicesListFiltered = state.notAssociatedsDevicesListFiltered;
    }
    if (state.ownershipFilter === 'all') {
      state.devicesListFiltered = state.associatedsDevicesListFiltered
        .concat(state.notAssociatedsDevicesListFiltered);
    }
    if (state.needFilter === null) setState({ needFilter: true });
    state.isLoading = false;
    render();
  }

  function clearFilters() {
    state.selectedCity = [];
    state.selectedClientFilter = [];
    state.selectedConnection = [];
    state.selectedState = [];
    state.selectedUnit = [];
    state.ownershipFilter = 'all';
    render();
    filter();
  }

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  async function handleGetData() {
    try {
      setState({ isLoading: true });
      const { list } = await apiCall('/devices/get-devices-list', {
        INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
        device: queryPars.dispositivo as 'all'| 'dac' | 'dal' | 'dam' | 'dma' | 'dmt' | 'dri' | 'dut',
        // @ts-ignore
        searchTerms: state.selectedDevId ? [state.selectedDevId.toLowerCase()] : [],
        // @ts-ignore
        clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
        stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
        cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
        unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
        status: (state.selectedConnection.length > 0) ? ajustParams(state.selectedConnection) : undefined,
      });
      state.associatedsDevicesList = list.filter((dev) => dev.ASSOCIATED);
      state.notAssociatedsDevicesList = list.filter((dev) => !dev.ASSOCIATED);
      state.associatedsDevicesListFiltered = state.associatedsDevicesList;
      state.notAssociatedsDevicesListFiltered = state.notAssociatedsDevicesList;
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erroCarregarDados'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    if (!state.needFilter) {
      filter();
    }
  }, [queryPars.dispositivo]);

  function getDevTab(title: string, ref, dev?: string) {
    return {
      title,
      link: `${linkBase}?${queryString.stringify({ ...queryPars, dispositivo: dev })}`,
      isActive: (queryPars.dispositivo === dev),
      visible: true,
      ref,
    };
  }

  const getCsvData = async () => {
    state.isLoading = true; render();
    const formatterCSV = state.devicesListFiltered.map((dev) => ({
      CLIENT_NAME: dev.CLIENT_NAME ?? '-',
      STATE: dev.STATE ?? '-',
      CITY_NAME: dev.CITY_NAME ?? '-',
      UNIT: dev.UNIT_NAME ?? '-',
      DEVICE: dev.DEVICE_CODE ?? '-',
      STATUS: dev.STATUS ?? '-',
      MAC: dev.MAC ?? '-',
    }));

    state.csvData = formatterCSV;
    render();

    setTimeout(() => {
      (csvLinkEl as any).current.link.click();
      window.location.reload();
    }, 1000);
    state.isLoading = false; render();
  };

  const allTabs = [
    getDevTab('DAC', useRef(null), 'dac'),
    getDevTab('DAL', useRef(null), 'dal'),
    getDevTab('DAM', useRef(null), 'dam'),
    getDevTab('DMA', useRef(null), 'dma'),
    getDevTab('DMT', useRef(null), 'dmt'),
    getDevTab('DRI', useRef(null), 'dri'),
    getDevTab('DUT', useRef(null), 'dut'),
    getDevTab(t('todos'), useRef(null)),
  ];
  const tabs = allTabs.filter((x) => x.visible);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaDispositivos')}</title>
      </Helmet>
      <AnalysisLayout />
      <>
        <div style={{ paddingTop: '10px' }}>
          <Headers2 links={tabs} />
        </div>
        <UtilFilter
          state={state}
          render={render}
          onAply={filter}
          setState={setState}
          clearFilter={clearFilters}
          exportFunc={getCsvData}
          csvHeader={CSVHeader}
          listFilters={['estado', 'cidade', 'unidade', 'cliente', 'tipo', 'id', 'conexao']}
          infoType={state.infoTypeOpts}
          lengthArrayResult={state.devicesListFiltered.length}
        />
        <CSVLink
          headers={CSVHeader}
          data={state.csvData}
          separator=";"
          enclosingCharacter={"'"}
          filename={t('dispositivos')}
          asyncOnClick
          ref={csvLinkEl}
        />
        {state.needFilter && (
          <>
            <AnalysisEmpty />
          </>
        )}
        {state.isLoading && <Loader variant="primary" />}
        {!state.isLoading && !state.needFilter && (
          <NewTable
            data={state.devicesListFiltered}
            columns={state.devicesColumns}
            pageSize={20}
            noSearchBar
          />
        )}
      </>
    </>
  );
};

export default withTransaction('Devices', 'component')(Devices);
