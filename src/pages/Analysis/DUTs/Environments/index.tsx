import React, { useState, useEffect, useMemo } from 'react';

import queryString from 'query-string';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import {
  DataTable, Button, EmptyWrapper, Loader, StatusBox, Checkbox, Select,
} from '~/components';
import { FilterItem } from '../../AnalysisFilters';
import { ModalWindow } from '~/components/ModalWindow';
import checkDutsLimits from '~/helpers/checkDutsLimits';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { TermometerSubIcon, HumidityIcon } from '~/icons';
import { AnalysisLayout } from '~/pages/Analysis/AnalysisLayout';
import { saveSessionStorageItem, removeSessionStorageItem, getSessionStorageItem } from '~/helpers/cachedStorage';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';

import {
  DesktopTable,
  MobileTable,
  StyledSpan,
  StyledLink,
} from './styles';
import { t } from 'i18next';
import '~/assets/css/ReactTags.css';
import { TableColumn, OrderableHeaderCell } from '~/components/DataTable';
import { UtilFilter } from '../../Utilities/UtilityFilter';
import { ajustParams, setValueState } from '~/helpers/genericHelper';
import { withTransaction } from '@elastic/apm-rum-react';
import { AnalysisEmpty } from '../../AnalysisEmpty';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const tempCodes = {
  'Temperatura acima': 'high',
  'Temperatura correta': 'good',
  'Temperatura abaixo': 'low',
  'Sem info': 'no data',
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

export const Environments = ({ history }): JSX.Element => {
  const csvLinkEl = React.useRef();
  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar(() => {
    const {
      preFiltered,
      unitIds,
      stateIds,
      cityIds,
    } = queryString.parse(history.location.search, { arrayFormat: 'comma' });
    const formattedPreFilter = (typeof preFiltered === 'string')
      ? preFiltered
        ? [preFiltered]
        : [...preFiltered]
      : [];

    const state = {
      actionOpts: [] as { label: string, value: string }[],
      clientsList: [] as { CLIENT_ID: number, NAME: string }[],
      selectedClientFilter: setValueState('filterClient') as any[],
      manufacturers: [],
      selectedClient: null,
      wantSetClient: false,
      ownershipFilter: null,
      permissions: profile.permissions,
      isLoading: !profile.manageAllClients && !profile.manageSomeClient, // setIsLoading
      csvData: [], // setCsvData
      environments: [], // setEnvironments
      invisibleDuts: [] as {}[] | undefined,
      searchState: '' as string, // setSearchState
      searchValue: '' as string,
      tablePage: 1,
      tablePageSize: 50,
      totalItems: 0,

      statesList: [] as { value: string, name: string }[],
      selectedState: stateIds?.length ? stateIds : setValueState('filterStates') as any[],
      citiesList: [] as { value: string, name: string }[],
      selectedCity: cityIds?.length ? cityIds : setValueState('filterCity') as any[],
      unitsList: [] as { value: string, name: string }[],
      selectedUnit: unitIds?.length ? unitIds : setValueState('filterUnit') as any[],
      selectedTemperature: formattedPreFilter.map((value) => tempCodes[value]),
      selectedConnection: [],
      selectedDevId: '',
      filters: [] as FilterItem[],
      orderBy: null as null | [string, 'ASC' | 'DESC'],
      needFilter: profile.manageAllClients || profile.manageSomeClient,
    };

    if (profile.permissions.isAdminSistema) {
      state.actionOpts = [{ label: t('excluir'), value: 'delete' }, { label: t('atribuirCliente'), value: 'set-client' }];
    } else if (profile.manageAllClients) {
      state.actionOpts = [{ label: t('excluir'), value: 'delete' }, { label: t('atribuirCliente'), value: 'set-client' }];
    }

    return state;
  });

  function loadSessionFilters() {
    const filters = getSessionStorageItem('environmentsAnalysisFilters') as null | {
      searchState: '',
      selectedState: [],
      selectedCity: [],
      selectedUnit: [],
      selectedClientFilter?: [],
      selectedTemperature: [],
      selectedConnection: [],
    };
    if (filters) {
      state.searchState = filters.searchState || '';
      state.selectedState = filters.selectedState || [];
      state.selectedCity = filters.selectedCity || [];
      state.selectedUnit = filters.selectedUnit || [];
      state.selectedClientFilter = filters.selectedClientFilter || [];
      state.selectedTemperature = filters.selectedTemperature || [];
      state.selectedConnection = filters.selectedConnection || [];
    }
    render();
    removeSessionStorageItem('environmentsAnalysisFilters');
  }

  function saveSessionFilters() {
    const filters = {
      searchState: state.searchState,
      selectedState: state.selectedState,
      selectedCity: state.selectedCity,
      selectedUnit: state.selectedUnit,
      selectedTemperature: state.selectedTemperature,
      selectedConnection: state.selectedConnection,
    } as any;
    if (profile.manageAllClients) {
      filters.selectedClientFilter = state.selectedClientFilter;
    }
    saveSessionStorageItem('environmentsAnalysisFilters', filters);
  }

  async function clearFilters() {
    state.searchState = '';
    state.selectedCity = [];
    state.selectedClientFilter = [];
    state.selectedState = [];
    state.selectedConnection = [];
    state.selectedTemperature = [];
    state.selectedUnit = [];

    state.isLoading = true;
    render();
    await handleGetDUTS();
  }

  async function applyActionToSelected(action, list) {
    try {
      const selectedDevs = list.filter((dev) => dev.checked);

      if (!selectedDevs.length) return;

      if (action === 'delete') {
        if (!window.confirm(`Deseja excluir ${selectedDevs.length} DUT(s)?`)) {
          return;
        }
        for (const dev of selectedDevs) {
          await apiCall('/dut/delete-dut-info', { dutId: dev.DEV_ID });
        }
        window.location.reload();
        return;
      }
      if (action === 'set-client') {
        state.wantSetClient = true; render();
        return;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  async function confirmSetClient() {
    try {
      // @ts-ignore
      const selectedDevs = state.environments.filter((dev) => dev.checked);
      if (!selectedDevs.length) {
        toast.error(t('erroNenhumSelecionado'));
        return;
      }

      // @ts-ignore
      const clientId = state.selectedClient && state.selectedClient.CLIENT_ID;

      if (!clientId) {
        toast.error(t('erroNaoSelecionadoOuInvalido'));
        return;
      }

      for (const dev of selectedDevs) {
        // @ts-ignore
        await apiCall('/dut/set-dut-info', { DEV_ID: dev.DEV_ID, CLIENT_ID: clientId });
      }

      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  function orderColumn(column: TableColumn) {
    return (
      <OrderableHeaderCell onColumnClick={onColumnClick} column={column} orderBy={state.orderBy} />
    );
  }

  const [columns, columnsMobile] = useMemo(() => {
    const columnsDesktop = [] as TableColumn[];
    const columnsMobile = [] as TableColumn[];

    columnsDesktop.push({
      // @ts-ignore
      Header: t('estado'),
      // @ts-ignore
      accessor: 'col_STATE_ID',
      // @ts-ignore
      Cell: (props) => <StyledSpan>{props.state}</StyledSpan>,
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('cidade'),
      // @ts-ignore
      accessor: 'col_CITY_NAME',
      // @ts-ignore
      Cell: (props) => <StyledSpan>{props.city}</StyledSpan>,
      HeaderCell: orderColumn,
    });
    if (profile.viewMultipleClients) {
      columnsDesktop.push({
        // @ts-ignore
        Header: t('cliente'),
        // @ts-ignore
        accessor: 'col_CLIENT_NAME',
        // @ts-ignore
        Cell: (props) => (props.CLIENT_NAME ? <StyledSpan>{props.CLIENT_NAME}</StyledSpan> : '-'),
        HeaderCell: orderColumn,
      });
    }
    columnsDesktop.push({
      // @ts-ignore
      Header: t('unidade'),
      // @ts-ignore
      accessor: 'col_UNIT_NAME',
      // @ts-ignore
      Cell: (props) => <>{props.unit && props.unit.id && props.unit.name ? <StyledLink to={`/analise/unidades/${props.unit.id}`}><StyledSpan onClick={saveSessionFilters}>{props.unit.name}</StyledSpan></StyledLink> : '-'}</>,
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('ambiente'),
      // @ts-ignore
      accessor: 'col_ROOM_NAME',
      // @ts-ignore
      Cell: (props) => (
        <>
          {props.measuring_point.length > 1
            ? (
              <StyledLink to={`/analise/dispositivo/${props.measuring_point}/informacoes`}>
                <StyledSpan>{(props.environment && props.environment.length > 100 ? (props.environment).slice(0, 100).concat('...') : props.environment || '-')}</StyledSpan>
              </StyledLink>
            )
            : (
              <StyledSpan>{(props.environment && props.environment.length > 100 ? (props.environment).slice(0, 100).concat('...') : props.environment || '-')}</StyledSpan>
            )}
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('dispositivo'),
      // @ts-ignore
      accessor: 'col_DEV_ID',
      // @ts-ignore
      Cell: (props) => (
        <>
          {props.unit.id && props.measuring_point
            ? (
              <StyledLink to={`/analise/dispositivo/${props.measuring_point}/informacoes`}>
                <StyledSpan onClick={saveSessionFilters}>{props.measuring_point}</StyledSpan>
              </StyledLink>
            )
            : ((!props.unit.id && props.measuring_point)
              ? (
                <StyledLink to={`/analise/dispositivo/${props.measuring_point}/informacoes`}>
                  <StyledSpan onClick={saveSessionFilters}>{props.measuring_point}</StyledSpan>
                </StyledLink>
              )
              : (
                '-'
              ))}
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('temperatura'),
      // @ts-ignore
      accessor: 'col_Temperature',
      // @ts-ignore
      Cell: (props) => (
        <>
          <TermometerSubIcon color={props.Temperature && (props.specialColor || colors.Green)} />
          <StyledSpan style={{ color: (props.Temperature && (props.specialColor || colors.Green)) }}>{props.temperature}</StyledSpan>
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('umidade'),
      // @ts-ignore
      accessor: 'col_Humidity',
      // @ts-ignore
      Cell: (props) => (
        <>
          {props.VARS?.includes('H') ? (
            <>
              <HumidityIcon />
              <StyledSpan>{props.Humidity ? ` ${props.Humidity}%` : ' -'}</StyledSpan>
            </>
          ) : (
            <StyledSpan>-</StyledSpan>
          )}
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: 'CO2',
      // @ts-ignore
      accessor: 'col_eCO2',
      // @ts-ignore
      Cell: (props) => (
        <>
          <StyledSpan style={{ color: props.specialColor || colors.Black }}>{props.eCO2}</StyledSpan>
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('conexao'),
      // @ts-ignore
      accessor: 'col_status',
      // @ts-ignore
      Cell: (props) => <StatusBox status={props.status}>{props.status}</StatusBox>,
      HeaderCell: orderColumn,
    });

    if (profile.manageAllClients) {
      columnsDesktop.push({
        // @ts-ignore
        Header: t('ultimaVezVisto'),
        // @ts-ignore
        accessor: 'col_lastCommTs',
        // @ts-ignore
        Cell: (props) => (props.lastCommTs || '-'),
        HeaderCell: orderColumn,
      });
    }

    if (profile.manageAllClients) {
      columnsDesktop.push({
        // @ts-ignore
        Header: '',
        // @ts-ignore
        accessor: 'col_selection',
        // @ts-ignore
        Cell: (props) => <Checkbox checked={props.checked} onClick={() => { props.checked = !props.checked; render(); }} />,
      });
    }

    columnsMobile.push({
      // @ts-ignore
      Header: t('dispositivo'),
      // @ts-ignore
      accessor: 'measuring_point',
      // @ts-ignore
      Cell: (props) => (
        <>
          {props.unit.id && props.measuring_point
            ? (
              <StyledLink to={`/analise/dispositivo/${props.measuring_point}/informacoes`}>
                {props.measuring_point}
              </StyledLink>
            )
            : ((!props.unit.id && props.measuring_point)
              ? (
                <StyledLink to={`/analise/dispositivo/${props.measuring_point}/informacoes`}>
                  {props.measuring_point}
                </StyledLink>
              )
              : (
                '-'
              ))}
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsMobile.push({
      // @ts-ignore
      Header: 'Temp',
      // @ts-ignore
      accessor: 'col_Temperature',
      // @ts-ignore
      Cell: (props) => (
        <>
          <TermometerSubIcon color={props.specialColor || colors.Green} />
          <StyledSpan style={{ color: props.specialColor || colors.Green }}>{props.temperature}</StyledSpan>
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsMobile.push({
      // @ts-ignore
      Header: 'Umid',
      // @ts-ignore
      accessor: 'col_Humidity',
      // @ts-ignore
      Cell: (props) => (
        <>
          <HumidityIcon />
          <StyledSpan>{props.humidity}</StyledSpan>
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsMobile.push({
      // @ts-ignore
      Header: t('conexao'),
      // @ts-ignore
      accessor: 'col_status',
      // @ts-ignore
      Cell: (props) => <StatusBox status={props.status}>{props.status}</StatusBox>,
      HeaderCell: orderColumn,
    });

    return [columnsDesktop, columnsMobile];
  }, []);

  function verifyExist(item) {
    if (item) return item;
    return '-';
  }

  function formatDut(list) {
    for (const dut of list) {
      // @ts-ignore
      if (dut.lastCommTs) { dut.lastCommTs = dut.lastCommTs.replace('T', ' '); }
      Object.assign(dut, {
        Humidity: dut.Humidity ? dut.Humidity.toString() : '-',
        state: verifyExist(dut.STATE_ID),
        city: verifyExist(dut.CITY_NAME),
        unit: { id: dut.UNIT_ID, name: dut.UNIT_NAME } || '-',
        environment: dut.ROOM_NAME,
        measuring_point: verifyExist(dut.DEV_ID),
        temperature: (dut.Temperature != null) ? `${formatNumberWithFractionDigits(dut.Temperature)}°C` : ' -',
        humidity: dut.Humidity ? `${formatNumberWithFractionDigits(dut.Humidity)}%` : ' -',
        eCO2: dut.eCO2 ? `${formatNumberWithFractionDigits(dut.eCO2, { minimum: 0, maximum: 0 })} ppm` : '-',
        status: verifyExist(dut.status),
      });
    }
  }

  const CSVHeader = [
    { label: t('cliente'), key: 'CLIENT_NAME' },
    { label: t('estado'), key: 'state' },
    { label: t('cidade'), key: 'city' },
    { label: t('unidade'), key: 'unit' },
    { label: t('ambiente'), key: 'environment' },
    { label: t('dispositivo'), key: 'measuring' },
    { label: t('temperatura'), key: 'temperature' },
    { label: t('umidade'), key: 'humidity' },
    { label: t('conexao'), key: 'status' },
    { label: t('ultimoVisto'), key: 'lastCommTs' },
  ];

  function onColumnClick(column: { accessor: string }) {
    if (state.orderBy && (state.orderBy[1] === 'ASC') && (state.orderBy[0] === column.accessor)) {
      state.orderBy = [column.accessor, 'DESC'];
    } else {
      state.orderBy = [column.accessor, 'ASC'];
    }
    render();
    handleGetDUTS();
  }

  function getParamsToCallEnvironmentsListPage() {
    const params = {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
      SKIP: (state.tablePage - 1) * state.tablePageSize,
      LIMIT: state.tablePageSize,
      // @ts-ignore
      searchTerms: state.selectedDevId ? [state.selectedDevId] : [],
      // @ts-ignore
      ownershipFilter: (state.ownershipFilter?.value) || undefined,
      stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
      cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
      unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
      clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
      temprtAlerts: (state.selectedTemperature.length > 0) ? state.selectedTemperature : undefined,
      status: (state.selectedConnection.length > 0) ? state.selectedConnection : undefined,
      searchEnvironment: state.searchState || undefined,
      orderByProp: state.orderBy && state.orderBy[0]?.substring('col_'.length) || undefined,
      orderByDesc: (state.orderBy && state.orderBy[1] === 'DESC') || undefined,
    };

    return params;
  }
  const handleGetDUTS = async () => {
    try {
      setState({ isLoading: true });
      if (state.needFilter !== null) setState({ needFilter: false });
      loadSessionFilters();
      const [
        { list, totalItems },
      ] = await Promise.all([
        apiCall('/get-environments-list-page', getParamsToCallEnvironmentsListPage()),
      ]);
      await checkDutsLimits(list);
      formatDut(list);
      setState({ invisibleDuts: list.filter((item) => item.ISVISIBLE !== 1) });
      const invisibleDutsCount = state.invisibleDuts ? state.invisibleDuts.length : 0;
      state.totalItems = totalItems - invisibleDutsCount;
      // @ts-ignore
      setState({ environments: list.filter((item) => item.ISVISIBLE === 1) });
    } catch (err) {
      console.log(err);
      toast.error(t('erroDados'));
    } finally {
      if (state.needFilter === null) setState({ needFilter: true });
      setState({ isLoading: false });
    }
  };

  const getCsvData = async () => {
    state.isLoading = true; render();

    apiCall('/dut/get-duts-list', {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
    }).then(({ list }) => {
      const formatterCSV = list.map((dut) => ({
        CLIENT_NAME: dut.CLIENT_NAME || '-',
        state: dut.STATE_ID || '-',
        city: dut.CITY_NAME || '-',
        unit: dut.UNIT_NAME || '-',
        environment: dut.ROOM_NAME || '-',
        measuring: dut.DEV_ID || '-',
        temperature: (dut.Temperature != null) ? `${formatNumberWithFractionDigits(dut.Temperature)}` : '-',
        humidity: dut.Humidity || '-',
        status: dut.status || '-',
        // @ts-ignore
        lastCommTs: (dut.lastCommTs && dut.lastCommTs.replace('T', ' ')) || '-',
      }));

      // @ts-ignore
      state.csvData = formatterCSV;
      state.isLoading = false; render();

      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);
    });
  };

  const onPageChange = (page) => {
    state.tablePage = page;
    render();
    handleGetDUTS();
  };

  const awaitData = async () => {
    try {
      const { list: clientlist } = await apiCall('/clients/get-clients-list', {});
      state.clientsList = clientlist;
      handleGetDUTS();
    } catch (error) {
      console.log(error); toast.error(t('houveErro'));
    }
  };

  useEffect(() => {
    state.tablePage = 1;
    render();
    if (!profile.manageAllClients && !profile.manageSomeClient) {
      awaitData();
    }
  }, [state.ownershipFilter]);

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaAmbientes')}</title>
      </Helmet>
      <AnalysisLayout />
      <UtilFilter
        state={state}
        render={render}
        onAply={() => { state.tablePage = 1; handleGetDUTS(); }}
        setState={setState}
        clearFilter={clearFilters}
        exportFunc={getCsvData}
        csvHeader={CSVHeader}
        listFilters={['tipo', 'estado', 'cidade', 'unidade', 'cliente', 'conexao', 'temperatura', 'id', 'search']}
        searchLabel={t('ambientes')}
        lengthArrayResult={state.environments.length}
      />
      <Flex flexWrap="wrap" width={1} justifyContent="space-between">
        <div style={{
          display: 'flex', justifyContent: 'space-between', zIndex: 2, width: '100%',
        }}
        >
          <CSVLink
            headers={CSVHeader}
            data={state.csvData}
            separator=";"
            enclosingCharacter={"'"}
            filename={t('Listagem_de_AmbientesCsv')}
            asyncOnClick
            ref={csvLinkEl}
          />
        </div>
      </Flex>
      {state.needFilter && (
        <>
          <AnalysisEmpty />
        </>
      )}
      {state.isLoading
        ? (
          <EmptyWrapper>
            <Loader variant="primary" size="large" />
          </EmptyWrapper>
        )
        : !state.needFilter && (
          <>
            <DesktopTable>
              {state.environments
                ? (
                  <DataTable
                    isUnit={false}
                    columns={columns}
                    data={state.environments}
                    onPageChange={onPageChange}
                    currentPage={state.tablePage}
                    pageSize={state.tablePageSize}
                    totalItems={state.totalItems}
                  />
                )
                : (
                  <Flex justifyContent="center" alignItems="center">
                    <Box justifyContent="center" alignItems="center">
                      <StyledSpan>{t('erroDados')}</StyledSpan>
                    </Box>
                  </Flex>
                )}
            </DesktopTable>
            <MobileTable>
              {state.environments
                ? (
                  <DataTable
                    isUnit={false}
                    columns={columnsMobile}
                    data={state.environments}
                    onPageChange={onPageChange}
                    currentPage={state.tablePage}
                    pageSize={state.tablePageSize}
                    totalItems={state.totalItems}
                  />
                )
                : (
                  <Flex justifyContent="center" alignItems="center">
                    <Box justifyContent="center" alignItems="center">
                      <StyledSpan>{t('erroDados')}</StyledSpan>
                    </Box>
                  </Flex>
                )}
            </MobileTable>
          </>
        )}
      {(state.wantSetClient)
        && (
          // @ts-ignore
          <ModalWindow>
            <h3>{t('selecioneOCliente')}</h3>
            <Select
              options={state.clientsList}
              propLabel="NAME"
              value={state.selectedClient}
              placeholder={t('cliente')}
              onSelect={(item) => { state.selectedClient = item; render(); }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
            }}
            >
              <Button style={{ width: '140px' }} onClick={() => { confirmSetClient(); }} variant="primary">
                {t('salvar')}
              </Button>
              {/* @ts-ignore */}
              <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => { state.wantSetClient = false; render(); }} variant="grey">
                {t('botaoCancelar')}
              </Button>
            </div>
          </ModalWindow>
        )}
    </>
  );
};

export default withTransaction('Environments', 'component')(Environments);
