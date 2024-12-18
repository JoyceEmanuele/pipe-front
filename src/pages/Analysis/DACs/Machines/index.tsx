import { useEffect, useRef } from 'react';

import queryString from 'query-string';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import i18n from '~/i18n';
import { colors } from '~/styles/colors';

import {
  Button, DataTable, Loader, AntSwitch, StatusBox, Checkbox, Select, HealthIcon,
} from '~/components';
import { healthLevelDesc } from '~/components/HealthIcon';
import { ModalWindow } from '~/components/ModalWindow';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { AnalysisLayout } from '~/pages/Analysis/AnalysisLayout';
import { saveSessionStorageItem, removeSessionStorageItem, getSessionStorageItem } from '~/helpers/cachedStorage';
import { apiCall } from '~/providers';
import { AnalysisEmpty } from '../../AnalysisEmpty';

import {
  WrapperDesktop,
  WrapperMobile,
  StyledLink,
  StyledSpan,
} from './styles';

import '~/assets/css/ReactTags.css';
import { TableColumn, OrderableHeaderCell } from '~/components/DataTable';
import { FilterItem } from '../../AnalysisFilters';
import { UtilFilter } from '../../Utilities/UtilityFilter';
import { ajustParams, setValueState } from '~/helpers/genericHelper';
import { withTransaction } from '@elastic/apm-rum-react';

const t = i18n.t.bind(i18n);

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

const CSVheader = [
  { label: t('cliente'), key: 'CLIENT_NAME' },
  { label: t('estado'), key: 'state' },
  { label: t('cidade'), key: 'city' },
  { label: t('unidade'), key: 'unit' },
  { label: t('maquina'), key: 'group' },
  { label: t('dispositivo'), key: 'machine' },
  { label: t('saude'), key: 'health' },
  { label: t('ultimaAlteracaoDaSaude'), key: 'healthDate' },
  { label: t('descricaoSaude'), key: 'healthDesc' },
  { label: t('conexao'), key: 'status' },
  { label: t('ultimoVisto'), key: 'lastCommTs' },
  { label: t('fluido'), key: 'fluidType' },
  { label: t('aplicacaoMaquina'), key: 'appl' },
  { label: t('tipoMaquina'), key: 'type' },
  { label: t('tipoAmbiente'), key: 'env' },
  { label: t('variavelP0'), key: 'p0var' },
  { label: t('tipoSensorP0'), key: 'p0sensor' },
  { label: t('variavelP1'), key: 'p1var' },
  { label: t('tipoSensorP1'), key: 'p1sensor' },
  { label: t('capacidadeKw'), key: 'capkw' },
  { label: t('temperaturaAmbienteC'), key: 'Tamb' },
  { label: t('temperaturaLiquidoC'), key: 'Tliq' },
  { label: t('temperaturaSuccaoC'), key: 'Tsuc' },
  { label: 'P0 (ADC)', key: 'P0Raw' },
  { label: 'P1 (ADC)', key: 'P1Raw' },
];

const healthCodes = {
  'Equipamento offline': 2,
  'Máquina desativada': 4,
  'Manutenção urgente': 25,
  'Risco iminente': 50,
  'Fora de especificação': 75,
  'Operando corretamente': 100,
};

export const Machines = ({ history }): JSX.Element => {
  const { t } = useTranslation();
  const csvLinkEl = useRef();
  const profile = getUserProfile();
  function formattedFilter(preFiltered: string | string[] | null) {
    let formattedPreFilter = [] as string[];
    if (preFiltered === 'Sem informação') {
      formattedPreFilter.push('Máquina desativada');
      formattedPreFilter.push('Equipamento offline');
    } else if (preFiltered?.includes('Sem informação') && typeof preFiltered !== 'string') {
      formattedPreFilter = preFiltered.filter((x) => x !== 'Sem informação');
      formattedPreFilter.push('Máquina desativada');
      formattedPreFilter.push('Equipamento offline');
    } else if (typeof preFiltered === 'string') {
      if (preFiltered) {
        formattedPreFilter = [preFiltered];
      }
      else {
        formattedPreFilter = [...preFiltered];
      }
    }
    return formattedPreFilter;
  }
  const [state, render] = useStateVar(() => {
    const {
      preFiltered,
      unitIds,
      stateIds,
      cityIds,
    } = queryString.parse(history.location.search, { arrayFormat: 'comma' });
    const formattedPreFilter = formattedFilter(preFiltered);

    const state = {
      actionOpts: [] as {}[],
      columnsMobile: [] as TableColumn[],
      columnsDesktop: [] as TableColumn[],
      list: [] as {
        STATE_ID: string
        CITY_NAME: string
        CLIENT_NAME: string
        UNIT_ID: number
        UNIT_NAME: string
        GROUP_NAME: string
        DAC_ID?: string
        DAT_ID?: string
        AST_DESC?: string
        ASSET_ID?: number
        VAV_ID?: string
        DUT_DUO_ID?: string
        H_INDEX?: number
        H_DESC?: string
        status?: string
        lastCommTs?: string
        DAC_COMIS?: string
        checked?: boolean
      }[],
      clientsList: [] as { CLIENT_ID: number, NAME: string }[],
      selectedClientFilter: setValueState('filterClient') as any[],
      manufacturers: [] as {}[],
      isLoading: !profile.manageAllClients && !profile.manageSomeClient,
      csvData: [] as {}[],
      searchState: '' as string,
      searchValue: '' as string,
      // searchState: preFiltered
      //   ? typeof preFiltered === 'string'
      //     ? [...[{ id: preFiltered.toString(), text: preFiltered.toString() }]]
      //     : [...preFiltered.map((filter) => ({ id: filter.toString(), text: filter.toString() }))]
      //   : [],
      selectedClient: null as null | { CLIENT_ID: number },
      wantSetClient: false,
      ownershipOpts: [
        { value: 'CLIENTS', label: t('deClientes') },
        { value: 'N-COMIS', label: t('naoComissionados') }, // aqueles com DEV_ID default de firmware
        { value: 'N-ASSOC', label: t('naoAssociados') }, // Aqueles que já tem DEV_ID próprio, mas não possuem cliente associado
        { value: 'MANUFAC', label: t('comissionadosEmFabrica') }, // Aqueles que já tem DEV_ID próprio, e possuem cliente SERDIA
        { value: 'D-TESTS', label: t('emTestes') }, // Aqueles que estão associados ao cliente DIEL ENERGIA LTDA.
        { value: 'ALLDEVS', label: t('todos') },
      ],
      ownershipFilter: null as null | { value: string, label: string },
      dielClientId: undefined as undefined | number,
      profile,
      tablePage: 1,
      tablePageSize: 50,
      totalItems: 0,
      timeOutId: null as null | NodeJS.Timeout,
      orderBy: null as null | [string, 'ASC' | 'DESC'],

      statesList: [] as { value: string, name: string }[],
      selectedState: setValueState('filterStates') as any[],
      citiesList: [] as { value: string, name: string }[],
      selectedCity: setValueState('filterCity') as any[],
      unitsList: [] as { value: string, name: string }[],
      selectedUnit: setValueState('filterUnit') as any[],
      selectedHealth: formattedPreFilter.map((code) => healthCodes[code]),
      selectedConnection: [],
      selectedDevId: '',
      filters: [] as FilterItem[],
      needFilter: profile.manageAllClients || profile.manageSomeClient,
    };

    return state;
  });
  useEffect(() => {
    // TODO: use window.matchMedia('(min-width: 768px)') instead of WrapperDesktop and WrapperMobile
    if (profile.viewAllClients || profile.permissions.isInstaller) {
      state.ownershipFilter = state.ownershipOpts[0];
    }

    if (profile.permissions.isAdminSistema) {
      state.actionOpts = [{ label: 'Excluir', value: 'delete' }, { label: 'Monitorado', value: 'comis-true' }, { label: 'Não-Monitorado', value: 'comis-false' }, { label: 'Atribuir Cliente', value: 'set-client' }];
    } else if (profile.manageAllClients) {
      state.actionOpts = [{ label: 'Monitorado', value: 'comis-true' }, { label: 'Não-Monitorado', value: 'comis-false' }, { label: 'Atribuir Cliente', value: 'set-client' }];
    }
    populateColumnsDesktop();
    populateColumnsMobile();
    verifyPermissionsAndPopulateColumns();
  }, []);

  function cellGroup(DAT_ID: string, GROUP_NAME: string, GROUP_ID: number) {
    if (!DAT_ID && !GROUP_ID) {
      const ternaryAux = GROUP_NAME.length > 100 ? (GROUP_NAME).slice(0, 100).concat('...') : GROUP_NAME;
      return (GROUP_NAME ? <StyledSpan>{ternaryAux}</StyledSpan> : '-');
    }
    const ternaryAux = GROUP_NAME.length > 100 ? (GROUP_NAME).slice(0, 100).concat('...') : GROUP_NAME;
    return (GROUP_NAME ? <StyledLink to={`/analise/maquina/${GROUP_ID}/ativos`}><StyledSpan>{ternaryAux}</StyledSpan></StyledLink> : '-');
  }

  function cellGroupAsset(ASSET_NAME: string, DAT_ID: string, ASSET_ID: number) {
    const ternaryAux = ASSET_NAME?.length > 50 ? (ASSET_NAME).slice(0, 50).concat('...') : ASSET_NAME;
    const urlAux = DAT_ID || ASSET_ID;

    return (urlAux ? <StyledLink to={`/analise/ativo/${urlAux}/informacoes`}><StyledSpan>{ternaryAux}</StyledSpan></StyledLink> : '-');
  }

  function urlDac(DAT_ID: string, DAC_ID: string) {
    if (!DAT_ID) {
      return `/analise/dispositivo/${DAC_ID}/informacoes`;
    }
    return `/analise/dispositivo/${DAT_ID}/informacoes`;
  }

  function orderColumn(column: TableColumn) {
    return (
      <OrderableHeaderCell onColumnClick={onColumnClick} column={column} orderBy={state.orderBy} />
    );
  }

  function devicesLabel(DEV_ID?: string, DUT_ID?: string, VAV_ID?: string) {
    if (DEV_ID) return DEV_ID;
    if (DUT_ID) return DUT_ID;
    if (VAV_ID) return VAV_ID;
    return '-';
  }

  const columnClientName = () => {
    if (profile.viewMultipleClients) {
      state.columnsDesktop.push({
        Header: t('cliente'),
        accessor: 'col_CLIENT_NAME',
        Cell: (props) => (props.CLIENT_NAME ? <StyledSpan>{props.CLIENT_NAME}</StyledSpan> : '-'),
        HeaderCell: orderColumn,
      });
    }
  };

  function populateColumnsDesktop() {
    columnClientName();

    state.columnsDesktop.push({
      Header: t('estado'),
      accessor: 'col_STATE_ID',
      Cell: (props) => (props.STATE_ID ? <StyledSpan>{props.STATE_ID}</StyledSpan> : '-'),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('cidade'),
      accessor: 'col_CITY_NAME',
      Cell: (props) => (props.CITY_NAME ? <StyledSpan>{props.CITY_NAME}</StyledSpan> : '-'),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('unidade'),
      accessor: 'col_UNIT_NAME',
      Cell: (props) => (props.UNIT_ID
        ? <StyledLink to={`/analise/unidades/${props.UNIT_ID}`}><StyledSpan onClick={saveSessionFilters}>{props.UNIT_NAME}</StyledSpan></StyledLink> : '-'),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('maquina'),
      accessor: 'col_GROUP_NAME',
      Cell: (props) => (
        <StyledLink to={urlDac(props.DAT_ID, props.DAC_ID || props.VAV_ID)}>
          <StyledSpan onClick={saveSessionFilters}>
            {cellGroup(props.DAT_ID, props.GROUP_NAME, props.GROUP_ID)}
          </StyledSpan>
        </StyledLink>
      ),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('ativo'),
      accessor: 'col_DAT_ID',
      Cell: (props) => (
        <StyledSpan onClick={saveSessionFilters}>
          {cellGroupAsset(props.AST_DESC, props.DAT_ID, props.ASSET_ID)}
        </StyledSpan>
      ),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('dispositivo'),
      accessor: 'col_DEV_ID',
      Cell: (props) => (
        <StyledLink to={urlDac(props.DAT_ID, props.DAC_ID || props.VAV_ID || props.DUT_DUO_ID)}>
          <StyledSpan onClick={saveSessionFilters}>
            {devicesLabel(props.DAC_ID, props.VAV_ID, props.DUT_DUO_ID)}
          </StyledSpan>
        </StyledLink>
      ),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('saude'),
      accessor: 'col_H_INDEX',
      Cell: (props) => ((props.H_INDEX != null) ? <HealthIcon health={String(props.H_INDEX)} label={props.col_H_DESC} /> : '-'),
      HeaderCell: orderColumn,
    });

    state.columnsDesktop.push({
      Header: t('conexao'),
      accessor: 'col_status',
      Cell: (props) => (props.status ? <StatusBox status={props.status}>{props.status}</StatusBox> : '-'),
      HeaderCell: orderColumn,
    });
  }

  function populateColumnsMobile() {
    state.columnsMobile.push({
      Header: t('ativo'),
      accessor: 'col_DAT_ID',
      Cell: (props) => (
        <StyledSpan onClick={saveSessionFilters}>
          {cellGroupAsset(props.AST_DESC, props.DAT_ID, props.ASSET_ID)}
        </StyledSpan>
      ),
    });

    state.columnsMobile.push({
      Header: t('dispositivo'),
      accessor: 'col_DEV_ID',
      Cell: (props) => (<StyledLink to={`/analise/dispositivo/${props.DAC_ID || props.VAV_ID}/informacoes`}><StyledSpan onClick={saveSessionFilters}>{props.DAC_ID || props.VAV_ID}</StyledSpan></StyledLink>),
    });

    state.columnsMobile.push({
      Header: t('saude'),
      accessor: 'col_H_INDEX',
      Cell: (props) => ((props.H_INDEX != null) ? <HealthIcon health={String(props.H_INDEX)} label={props.col_H_DESC} /> : '-'),
    });

    state.columnsMobile.push({
      Header: t('conexao'),
      accessor: 'col_status',
      Cell: (props) => (props.status ? <StatusBox status={props.status}>{props.status}</StatusBox> : '-'),
    });
  }

  function verifyPermissionsAndPopulateColumns() {
    if (profile.manageAllClients) {
      state.columnsDesktop.push({
        Header: t('ultimaVezVisto'),
        accessor: 'col_lastCommTs',
        Cell: (props) => (props.lastCommTs || '-'),
        HeaderCell: orderColumn,
      });

      state.columnsDesktop.push({
        Header: 'Monitorado',
        accessor: 'col_DAC_COMIS',
        Cell: (props) => (props.DAC_ID ? <AntSwitch checked={props.DAC_COMIS === '1'} onChange={() => switchDacMonitoring(props)} /> : '-'),
        HeaderCell: orderColumn,
      });

      state.columnsDesktop.push({
        Header: '',
        accessor: 'col_selection',
        Cell: (props) => <Checkbox checked={props.checked} onClick={() => { props.checked = !props.checked; render(); }} />,
      });
    }
  }

  function loadSessionFilters() {
    const filters = getSessionStorageItem('machinesAnalysisFilters') as null | {
      searchState: '',
      selectedState: [],
      selectedCity: [],
      selectedUnit: [],
      selectedClientFilter?: [],
      selectedHealth: [],
      selectedConnection: [],
    };
    if (filters) {
      state.searchState = filters.searchState || '';
      state.selectedState = filters.selectedState || [];
      state.selectedCity = filters.selectedCity || [];
      state.selectedUnit = filters.selectedUnit || [];
      state.selectedClientFilter = filters.selectedClientFilter || [];
      state.selectedHealth = filters.selectedHealth || [];
      state.selectedConnection = filters.selectedConnection || [];
    }
    render();
    removeSessionStorageItem('machinesAnalysisFilters');
  }

  function saveSessionFilters() {
    const filters = {
      searchState: state.searchState,
      selectedState: state.selectedState,
      selectedCity: state.selectedCity,
      selectedUnit: state.selectedUnit,
      selectedHealth: state.selectedHealth,
      selectedConnection: state.selectedConnection,
      selectedClientFilter: null as null|({}[]),
    };
    if (profile.manageAllClients) {
      filters.selectedClientFilter = state.selectedClientFilter;
    }
    saveSessionStorageItem('machinesAnalysisFilters', filters);
  }

  async function clearFilters() {
    state.searchState = '';
    state.selectedCity = [];
    state.selectedClientFilter = [];
    state.selectedState = [];
    state.selectedConnection = [];
    state.selectedUnit = [];
    state.selectedHealth = [];

    state.isLoading = true;
    render();
    await handleGetData();
  }

  function verifyObject(dev) {
    if (!dev.STATE_ID) dev.STATE_ID = '-';
    if (!dev.CITY_NAME) dev.CITY_NAME = '-';
    if (!dev.UNIT_NAME) dev.UNIT_NAME = '-';
    if (!dev.GROUP_NAME) dev.GROUP_NAME = '-';
    if (dev.lastCommTs) { dev.lastCommTs = dev.lastCommTs.replace('T', ' '); }
  }

  function getParamsToCallDacsAndAssetsList() {
    const params = {
      INCLUDE_INSTALLATION_UNIT: !!profile.viewAllClients || !!profile.permissions.isInstaller,
      SKIP: (state.tablePage - 1) * state.tablePageSize,
      LIMIT: state.tablePageSize,
      searchTerms: state.selectedDevId ? [state.selectedDevId.toLowerCase()] : [],
      ownershipFilter: (state.ownershipFilter?.value) || undefined,
      orderByProp: state.orderBy && state.orderBy[0]?.substring('col_'.length) || undefined,
      orderByDesc: (state.orderBy && state.orderBy[1] === 'DESC') || undefined,
      stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
      cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
      unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
      clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
      healthIndexes: (state.selectedHealth.length > 0) ? state.selectedHealth : undefined,
      status: (state.selectedConnection.length > 0) ? state.selectedConnection : undefined,
      searchMachine: state.searchState || undefined,
    };
    return params;
  }

  async function handleGetData() {
    try {
      state.isLoading = true; render();
      if (state.needFilter !== null) state.needFilter = false;
      loadSessionFilters();
      const [
        { list: dacsAndAssetsList, totalItems },
      ] = await Promise.all([
        apiCall('/get-dacs-and-assets-list', getParamsToCallDacsAndAssetsList()),
      ]);

      state.list = dacsAndAssetsList;

      for (const dev of state.list) {
        verifyObject(dev);
        Object.assign(dev, {
          checked: false,
          rowKey: dev.DAC_ID || dev.DAT_ID,
          col_H_DESC: healthLevelDesc[String(dev.H_INDEX)] || dev.H_DESC || 'Sem informação',
        });
      }

      state.totalItems = totalItems;
      // Estado sem uso
      // state.manufacturers = clientsList.filter((row) => (row.clientType || []).includes('fabricante')).map((row) => row.CLIENT_ID);
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erroDadosMaquinas'));
    }
    if (state.needFilter === null) state.needFilter = true;
    state.isLoading = false; render();
  }

  async function switchDacMonitoring(rowData) {
    try {
      const dacData = {
        DAC_ID: rowData.DAC_ID,
        DAC_COMIS: ((rowData.DAC_COMIS === '1') ? '0' : '1'),
      };
      await apiCall('/dac/set-dac-info', dacData);
      window.location.reload(); // TODO: remover todos os reloads
      // toast.success('Alterado')
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  async function confirmSetClient() {
    try {
      const selectedDevs = state.list.filter((dev) => dev.checked);
      if (!selectedDevs.length) {
        toast.error(t('erroNenhumDispositivoSelecionado'));
        return;
      }
      const clientId = state.selectedClient && state.selectedClient.CLIENT_ID;

      if (!clientId) {
        toast.error(t('erroClienteNaoSelecionadoOuInvalido'));
        return;
      }

      const selectedDacs = selectedDevs.filter((row) => row.DAC_ID);
      const selectedAssets = selectedDevs.filter((row) => row.DAT_ID);
      for (const dev of selectedDacs) {
        await apiCall('/dac/set-dac-info', { DAC_ID: dev.DAC_ID!, CLIENT_ID: clientId });
      }
      for (const dev of selectedAssets) {
        await apiCall('/clients/edit-asset', { ASSET_ID: dev.ASSET_ID, DAT_ID: dev.DAT_ID!, CLIENT_ID: clientId });
      }

      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  const awaitData = async () => {
    try {
      await handleGetData();
    } catch (error) {
      console.log(error); toast.error(t('houveErro'));
    }
  };

  useEffect(() => {
    state.tablePage = 1;
    if (!profile.manageAllClients && !profile.manageSomeClient) {
      awaitData();
    }
  }, []);

  const onPageChange = (page) => {
    state.tablePage = page;
    render();
    handleGetData();
  };

  function onColumnClick(column: { accessor: string }) {
    if (state.orderBy && (state.orderBy[1] === 'ASC') && (state.orderBy[0] === column.accessor)) {
      state.orderBy = [column.accessor, 'DESC'];
    } else {
      state.orderBy = [column.accessor, 'ASC'];
    }
    render();
    handleGetData();
  }

  function verifyExist(item) {
    if (item) return item;
    return '-';
  }

  const getCsvData = async () => {
    state.isLoading = true; render();

    try {
      const { list } = await apiCall('/dac/get-dacs-list', {
        INCLUDE_INSTALLATION_UNIT: !!profile.viewAllClients || !!profile.permissions.isInstaller,
        includeHealthDesc: true,
        includeSensorInfo: true,
        includeCapacityKW: true,
        includeLastMeasures: true,
      });
      const formattedMachineCSV = list.map((machine) => ({
        CLIENT_NAME: verifyExist(machine.CLIENT_NAME),
        state: verifyExist(machine.STATE_ID),
        city: verifyExist(machine.CITY_NAME),
        unit: verifyExist(machine.UNIT_NAME),
        group: verifyExist(machine.GROUP_NAME),
        machine: verifyExist(machine.DAC_ID),
        health: healthLevelDesc[String(machine.H_INDEX)] || machine.H_DESC || '-',
        healthDate: verifyExist((machine.H_DATE && machine.H_DATE.replace('T', ' ').slice(0, 19))),
        status: verifyExist(machine.status),
        lastCommTs: verifyExist(machine.lastCommTs && machine.lastCommTs.replace('T', ' ')),
        healthDesc: verifyExist(machine.H_DESC),
        fluidType: verifyExist(machine.FLUID_TYPE),
        appl: verifyExist(machine.DAC_APPL),
        type: verifyExist(machine.DAC_TYPE),
        env: verifyExist(machine.DAC_ENV),
        p0var: verifyExist(machine.P0_POSITN),
        p0sensor: verifyExist(machine.P0_SENSOR),
        p1var: verifyExist(machine.P1_POSITN),
        p1sensor: verifyExist(machine.P1_SENSOR),
        capkw: verifyExist(machine.capacityKW),
        Tamb: verifyExist(machine.Tamb),
        Tliq: verifyExist(machine.Tliq),
        Tsuc: verifyExist(machine.Tsuc),
        P0Raw: verifyExist(machine.P0Raw),
        P1Raw: verifyExist(machine.P1Raw),
      }));
      state.csvData = formattedMachineCSV;
      render();
      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);
    } catch (err) { console.log(err); toast.error(t('houveErro')); }

    state.isLoading = false; render();
  };

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaMaquinas')}</title>
      </Helmet>
      <UtilFilter
        state={state}
        render={render}
        onAply={() => { state.tablePage = 1; handleGetData(); }}
        clearFilter={clearFilters}
        exportFunc={getCsvData}
        csvHeader={CSVheader}
        listFilters={['conexao', 'tipo', 'saude', 'estado', 'cidade', 'cliente', 'unidade', 'id', 'conexao', 'search']}
        searchLabel={t('maquinas')}
        lengthArrayResult={state.list.length}
      />
      <CSVLink
        headers={CSVheader}
        data={state.csvData}
        separator=";"
        enclosingCharacter={"'"}
        filename={t('ListagemDeMaquinasCsv')}
        asyncOnClick
        ref={csvLinkEl}
      />
      <Flex flexWrap="wrap">
        <Box width={1} paddingTop={3}>
          <WrapperDesktop>
            {state.needFilter && (
              <>
                <AnalysisEmpty />
              </>
            )}
            {state.isLoading
              ? <Loader variant="primary" />
              : !state.needFilter && (
                <DataTable
                  isUnit={false}
                  columns={state.columnsDesktop}
                  data={state.list}
                  onPageChange={onPageChange}
                  currentPage={state.tablePage}
                  pageSize={state.tablePageSize}
                  totalItems={state.totalItems}
                />
              )}
          </WrapperDesktop>
          <WrapperMobile>
            {state.isLoading
              ? <Loader variant="primary" />
              : (
                <DataTable
                  isUnit={false}
                  columns={state.columnsMobile}
                  data={state.list}
                  onPageChange={onPageChange}
                  currentPage={state.tablePage}
                  pageSize={state.tablePageSize}
                  totalItems={state.totalItems}
                />
              )}
          </WrapperMobile>
        </Box>
      </Flex>
      {(state.wantSetClient)
        && (
          <ModalWindow onClickOutside={undefined}>
            <h3>{t('selecioneCliente')}</h3>
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
                {t('botaoSalvar')}
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

const StatusIcon = styled.div<{ color?, status?}>(
  ({ color, status }) => `
  width: 10px;
  height: 10px;
  margin-left: 5px;
  border-radius: 50%;
  border: 2px solid ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  background: ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  font-weight: bold;
  font-size: 0.8em;
  line-height: 18px;
  color: ${colors.White};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`,
);

export default withTransaction('Machines', 'component')(Machines);
