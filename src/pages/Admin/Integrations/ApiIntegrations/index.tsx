import {
  Loader,
  Input,
  ModalWindow,
  SelectMultiple,
  Button,
  Table,
  Checkbox,
} from 'components';
import { Select as SelectNew } from 'components/NewSelect';

import { useStateVar } from 'helpers/useStateVar';
import { DeleteTrashIcon, EditIcon, NewApiIcon } from '~/icons';
import { t } from 'i18next';
import {
  ButtonOptions, ButtonsRow, Container, ContainerButtonOpen,
  ContainerModal,
  ContainerModalInputs,
  ContainerRow,
  Label,
  ModalSubTitle,
  ModalTitle,
  NoApiReturn,
  OptionsButtonsTypeAPI,
  TableWrapper,
  TextLine,
} from './styles';
import { useEffect, useState } from 'react';
import { Card } from '~/components/Card';
import { ModalCancel } from '~/components/Menu/styles';
import { Flex } from 'reflexbox';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import { colors } from '~/styles/colors';
import { apiCall } from '~/providers';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { toast } from 'react-toastify';
import { ColumnTable } from '~/metadata/ColumnTable.model';
import { GenerateItemColumn } from '~/components/Table';
import { OptionsButton, StringLabel } from '~/pages/General/TableConfigs';
import { getUserProfile } from '~/helpers/userProfile';
import ReactTooltip from 'react-tooltip';
import { TooltipContainer } from '~/components/Table/styles';
import { TableItemCell } from '~/pages/Analysis/Units/UnitDetail/UnitDetailUtilities/styles';
import { FaTools } from 'react-icons/fa';
import Pagination from 'rc-pagination';

const notif_type_options = [
  t('indiceSaude'),
];

const health_status_options = [
  t('vermelho'),
  t('vermelhoOuLaranja'),
  t('diferenteDeVerde'),
];

type HealthStatus = 'RED' | 'RED_OR_ORANGE' | 'NOT_GREEN';

const StatusCell = (id, units) => (
  <>
    <ReactTooltip
      id={`tooltip-${id}`}
      place="top"
      border
      textColor="#000000"
      backgroundColor="rgba(255, 255, 255, 0.97)"
      borderColor="#202370"
    >
      <TooltipContainer style={{ width: '100%', maxWidth: '100%' }}>
        {units.slice(0, 10).map((item) => (
          <strong key={item}>
            {item}
          </strong>
        ))}
        {units.length > 10 && <strong>...</strong>}
      </TooltipContainer>
    </ReactTooltip>
    <TableItemCell data-tip data-for={`tooltip-${id}`}>
      {`${units.length} ${t('unidades')}`}
    </TableItemCell>
  </>
);

export const ApiIntegrations = (): JSX.Element => {
  const profile = getUserProfile();
  const isAdminApi = profile.permissions?.API_MANAGEMENT;
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openButton, setOpenButton] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isIdEditApi, setIsIdEditApi] = useState<number>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      pagination: {
        itemsPerPage: 10,
        totalItems: 0,
        currentPage: 1,
      },
      currentSort: {
        field: 'UPDATED_AT',
        type: 'desc',
      },
      selected_is_test: false as boolean,
      selected_client: null as null|{ NAME: string, CLIENT_ID: number },
      selected_ids_apis: [] as number[],
      selected_status_open: [] as number[],
      selected_notif_type: null as 'HEALTH_INDEX' | null,
      selected_type: false as boolean,
      title_api: '' as string,
      selected_health_status: null as HealthStatus | null,
      trigger_id: '' as string,
      comboOpts: {
        clients: [] as { NAME: string, CLIENT_ID: number }[],
        units: [] as { UNIT_NAME: string, UNIT_ID: number, checked: boolean }[],
      },
      filtersData: {} as any,
      selectedFilters: {
        clients: {
          label: t('cliente'),
          values: [],
        },
        nome: {
          label: t('nome'),
          values: [],
        },
        trigger_id: {
          label: t('trigger_id'),
          values: [],
        },
        unit: {
          label: t('unidades'),
          values: [],
        },
        health_status: {
          label: t('condicao'),
          values: [],
        },
        status: {
          label: t('status'),
          values: [],
        },
        notify_condition: {
          label: t('modulo'),
          values: [],
        },
        is_test: {
          label: t('emteste'),
          values: [],
        },
      } as any,
      filterAll: {
        clients: false,
        nome: false,
        trigger_id: false,
        unit: false,
        health_status: false,
        status: false,
        notify_condition: false,
        is_test: false,
      },
      apis: [] as {
            ID: number;
            CLIENT_ID: number;
            CLIENT_NAME: string;
            HEALTH_STATUS: string;
            INTEGRATION_TYPE: string;
            ApiUnitRelations: {
              UNIT_NAME: string
              UNIT_ID: number;
            }[];
            NOTIFY_CONDITION: string;
            STATUS: string;
            TITLE: string;
            TRIGGER_ID: string;
      }[],
      columnSort: {
        ID: {
          column: 'ID',
          desc: false,
        },
        CLIENT_NAME: {
          column: 'CLIENT_NAME',
          desc: false,
        },
        TITLE: {
          column: 'TITLE',
          desc: false,
        },
        TRIGGER_ID: {
          column: 'TRIGGER_ID',
          desc: false,
        },
        UNIT_NAME: {
          column: 'UNIT_NAME',
          desc: false,
        },
        NOTIFY_CONDITION: {
          column: 'NOTIFY_CONDITION',
          desc: false,
        },
        HEALTH_STATUS: {
          column: 'HEALTH_STATUS',
          desc: false,
        },
        STATUS: {
          column: 'STATUS',
          desc: false,
        },
        IS_TEST: {
          column: 'IS_TEST',
          desc: false,
        },
      },
      loading: true,
    };
    return state;
  });

  const handleModalToggle = async (isOpen: boolean, isEdit: boolean, infos?: {
    id: number,
    is_test: boolean,
    client_id: number,
    client_name: string,
    health_status: HealthStatus,
    trigger_id: string,
    title_api: string,
    notif_type: 'HEALTH_INDEX',
    unit_ids: number[]
  }) => {
    setIsEditModal(isEdit);
    setIsModalOpen(isOpen);
    if (infos) {
      setIsIdEditApi(infos.id);
      state.selected_client = {
        CLIENT_ID: infos.client_id,
        NAME: infos.client_name,
      };
      state.selected_is_test = infos.is_test;
      state.selected_health_status = infos.health_status;
      state.trigger_id = infos.trigger_id;
      state.title_api = infos.title_api;
      state.selected_notif_type = infos.notif_type;

      const list = await apiCall('/clients/get-units-list', { CLIENT_ID: state.selected_client?.CLIENT_ID });
      const unitIdsToCheck = infos.unit_ids;

      state.comboOpts.units = list.map((item) => ({
        UNIT_ID: item.UNIT_ID,
        UNIT_NAME: item.UNIT_NAME,
        checked: !!unitIdsToCheck.includes(item.UNIT_ID),
      }));

      render();
    }
  };

  const handleButtonToggle = () => {
    setOpenButton((prev) => !prev);
  };

  const handleButtonStatusToggle = (id) => {
    const isAlreadySelected = state.selected_status_open.includes(id);
    const updatedSelectedIds = isAlreadySelected
      ? []
      : [id];
    setState({
      selected_status_open: updatedSelectedIds,
    });
  };

  const handleModalClose = () => {
    state.selected_client = null;
    state.comboOpts.units = state.comboOpts.units.map((item) => ({ UNIT_ID: item.UNIT_ID, UNIT_NAME: item.UNIT_NAME, checked: false }));
    state.selected_health_status = null;
    state.selected_notif_type = null;
    state.title_api = '';
    state.trigger_id = '';
    state.selected_is_test = false;
    setIsModalOpen(false);
    render();
  };

  function onSelectedNotfiType(item) {
    if (item === t('indiceSaude')) {
      setState({
        selected_notif_type: 'HEALTH_INDEX',
      });
    }
    render();
  }

  const optionSelectedNotifType = () => {
    if (state.selected_notif_type === 'HEALTH_INDEX') {
      return t('indiceSaude');
    }
    return '';
  };

  function onSelectedHealthStatus(item) {
    if (item === t('vermelho')) {
      setState({
        selected_health_status: 'RED',
      });
    } else if (item === t('vermelhoOuLaranja')) {
      setState({
        selected_health_status: 'RED_OR_ORANGE',
      });
    } else if (item === t('diferenteDeVerde')) {
      setState({
        selected_health_status: 'NOT_GREEN',
      });
    }
    render();
  }

  const optionSelectedHealthStatus = () => {
    if (state.selected_health_status === 'RED') {
      return t('vermelho');
    }
    if (state.selected_health_status === 'RED_OR_ORANGE') {
      return t('vermelhoOuLaranja');
    }
    if (state.selected_health_status === 'NOT_GREEN') {
      return t('diferenteDeVerde');
    }
    return '';
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function handleChangePagination(current) {
    state.pagination.currentPage = current;
    const filterParams = setFiltersAndReturn(state);
    await getApisList(filterParams);
    render();
  }

  async function fetchData() {
    try {
      await apiCall('/clients/get-clients-list', {}).then(({ list }) => {
        state.comboOpts.clients = list;
      });
    } catch (e) {
      toast.error(t('erroBuscarListaClientes'));
    }
    try {
      const { apis, totalItems } = await apiCall('/mainservice/api-registries/get-apis', { limit: state.pagination.itemsPerPage, page: state.pagination.currentPage });
      const apisComboOpts = await apiCall('/mainservice/api-registries/get-combo-opts');
      setState({
        apis,
      });
      state.pagination.totalItems = totalItems;
      state.filtersData = {
        clients: apisComboOpts.CLIENTS.map((item) => ({
          name: item.CLIENT_NAME,
          value: item.CLIENT_ID,
        })),
        notify_condition: [{
          name: t('preditivo'),
          value: t('preditivo'),
        }],
        nome: apisComboOpts.TITLES.map((item) => ({
          name: item,
          value: item,
        })),
        trigger_id: apisComboOpts.TRIGGER_IDS.map((item) => ({
          name: item,
          value: item,
        })),
        health_status: [
          {
            name: t('vermelho'),
            value: 'RED',
          },
          {
            name: t('vermelhoOuLaranja'),
            value: 'RED_OR_ORANGE',
          },
          {
            name: t('diferenteDeVerde'),
            value: 'NOT_GREEN',
          },
        ],
        unit: apisComboOpts.ApiUnitRelations.map((item) => ({
          name: item.UNIT_NAME,
          value: item.UNIT_ID,
        })),
        status: [
          {
            name: t('ativada'),
            value: 1,
          }, {
            name: t('pausada'),
            value: 0,
          },
        ],
        is_test: [
          {
            name: t('sim'),
            value: 1,
          }, {
            name: t('nao'),
            value: 0,
          },
        ],
      };
    } catch (e) {
      toast.error(t('erroBuscarDadosApis'));
    }
    setState({ loading: false });
    render();
  }

  async function onSelectClient(item) {
    try {
      state.selected_client = { NAME: item.name, CLIENT_ID: item.value };
      const list = await apiCall('/clients/get-units-list', { CLIENT_ID: state.selected_client?.CLIENT_ID });
      state.comboOpts.units = list.map((item) => ({ UNIT_ID: item.UNIT_ID, UNIT_NAME: item.UNIT_NAME, checked: false }));

      render();
    } catch (err) {
      toast.error(t('houveErro'));
    }
  }

  function selectAllOptions(list) {
    const itemsToCheck = list;

    const shouldBeChecked = itemsToCheck.some((el) => !el.checked);

    for (const elem of itemsToCheck) {
      elem.checked = shouldBeChecked;
    }

    render();
  }

  function handleSelectItem(item, list) {
    if (item) {
      item.checked = !item.checked;
    } else {
      for (const elem of list) {
        elem.checked = false;
      }
    }

    render();
  }

  function getUnitRelations(): { unitName: string; unitId: number }[] | void {
    if (state.selected_is_test) {
      const selectedUnits = state.comboOpts.units.filter((unit) => unit.checked);

      if (selectedUnits.length === 0) {
        toast.error(t('erroAoCadastrarApiTesteSemUnidade'));
        return;
      }

      return selectedUnits.map((unit) => ({
        unitName: unit.UNIT_NAME,
        unitId: unit.UNIT_ID,
      }));
    }

    return [];
  }

  async function handleCreateNewApi() {
    if (!state.selected_client?.CLIENT_ID
      || !state.selected_client.NAME
      || !state.selected_health_status
      || !state.trigger_id
    ) {
      return toast.error(t('confiraCampos'));
    }

    const unitRelations = getUnitRelations();

    if (!unitRelations) {
      return;
    }

    if (!isEditModal) {
      try {
        const existingApi = state.apis?.find((api) => api.TITLE === state.title_api);
        if (existingApi) {
          return toast.error(t('nomeDaApiUtilizada'));
        }

        await apiCall('/mainservice/api-registries', {
          clientId: state.selected_client?.CLIENT_ID,
          clientName: state.selected_client?.NAME,
          title: state.title_api,
          integrationType: 'GOOGLE',
          triggerId: state.trigger_id,
          notifyCondition: 'HEALTH_INDEX',
          healthStatus: state.selected_health_status,
          unitRelations: unitRelations || [],
          isTest: state.selected_is_test,
        });
        toast.success(t('registroApiCriadoSucesso'));
        fetchData();
        handleModalClose();
      } catch (error) {
        toast.error(t('erroCriarRegistroApi'));
      }
    } else {
      try {
        if (isIdEditApi) {
          await apiCall('/mainservice/api-registries/update-api', {
            id: isIdEditApi,
            body: {
              clientId: state.selected_client?.CLIENT_ID,
              clientName: state.selected_client?.NAME,
              title: state.title_api,
              integrationType: 'GOOGLE',
              triggerId: state.trigger_id,
              notifyCondition: 'HEALTH_INDEX',
              healthStatus: state.selected_health_status,
              unitRelations: unitRelations || [],
              isTest: state.selected_is_test,
            },
          });
          fetchData();
          handleModalClose();
          toast.success(t('apiAlteradaSucesso'));
        } else {
          toast.error(t('erroAtualizarApi'));
        }
      } catch (error) {
        toast.error(t('erroAtualizarApi'));
      }
    }
  }

  const parseHealthStatusColumn = (value: string) => {
    if (value === 'RED') {
      return `ficar ${t('vermelho')}`.toLowerCase();
    }
    if (value === 'RED_OR_ORANGE') {
      return `ficar ${t('vermelhoOuLaranja')}`.toLowerCase();
    }
    if (value === 'NOT_GREEN') {
      return `for ${t('diferenteDeVerde')}`.toLowerCase();
    }
  };

  const handleCheckboxChange = (id: number) => {
    const isAlreadySelected = state.selected_ids_apis.includes(id);
    const updatedSelectedIds = isAlreadySelected
      ? state.selected_ids_apis.filter((item) => item !== id)
      : [...state.selected_ids_apis, id];
    setState({
      selected_ids_apis: updatedSelectedIds,
    });
  };

  const handleSelectAll = (allIds: number[]) => {
    if (state.selected_ids_apis.length === allIds.length) {
      setState({
        selected_ids_apis: [],
      });
    } else {
      setState({
        selected_ids_apis: allIds,
      });
    }
  };

  const verifyChecked = (apis: number[], data) => (apis.length > 0 && apis.length === data.length);

  const filtersMappings = {
    [t('cliente')]: { filterKey: 'clients', filterAllKey: 'clients' },
    'Trigger ID': { filterKey: 'trigger_id', filterAllKey: 'trigger_id' },
    [t('unidades')]: { filterKey: 'unit', filterAllKey: 'unit' },
    [t('status')]: { filterKey: 'status', filterAllKey: 'status' },
    [t('condicao')]: { filterKey: 'health_status', filterAllKey: 'health_status' },
    [t('modulo')]: { filterKey: 'notify_condition', filterAllKey: 'notify_condition' },
    [t('nome')]: { filterKey: 'nome', filterAllKey: 'nome' },
    [t('health_status')]: { filterKey: 'health_status', filterAllKey: 'health_status' },
    [t('emteste')]: { filterKey: 'is_test', filterAllKey: 'is_test' },
  };

  const handleSelectFiltersAll = async (name, filterAll) => {
    const mapping = filtersMappings[name];

    if (mapping) {
      state.selectedFilters[mapping.filterKey].values = filterAll ? state.filtersData[mapping.filterKey] : [];
      state.filterAll[mapping.filterAllKey] = filterAll;
    }

    await handleGetFilters();
    render();
  };

  const handleChangeFilters = async (name, filters) => {
    switch (name) {
      case t('cliente'):
        state.selectedFilters.clients.values = filters.map((filter) => state.filtersData.clients.find((filterData) => filterData.value === filter));
        break;
      case t('nome'):
        state.selectedFilters.nome.values = filters.map((filter) => state.filtersData.nome.find((filterData) => filterData.value === filter));
        break;
      case 'Trigger ID':
        state.selectedFilters.trigger_id.values = filters.map((filter) => state.filtersData.trigger_id.find((filterData) => filterData.value === filter));
        break;
      case t('unidades'):
        state.selectedFilters.unit.values = filters.map((filter) => state.filtersData.unit.find((filterData) => filterData.value === filter));
        break;
      case t('condicao'):
        state.selectedFilters.health_status.values = filters.map((filter) => state.filtersData.health_status.find((filterData) => filterData.value === filter));
        break;
      case t('modulo'):
        state.selectedFilters.notify_condition.values = filters.map((filter) => state.filtersData.notify_condition.find((filterData) => filterData.value === filter));
        break;
      case t('status'):
        if (filters.length === 1) {
          state.selectedFilters.status.values = [filters[0]];
        } else if (filters.length > 1) {
          state.selectedFilters.status.values = [filters[filters.length - 1]];
        } else {
          state.selectedFilters.status.values = [];
        }
        break;
      case t('health_status'):
        state.selectedFilters.health_status.values = filters.map((filter) => state.filtersData.health_status.find((filterData) => filterData.value === filter));
        break;
      case t('emteste'):
        if (filters.length === 1) {
          state.selectedFilters.is_test.values = [filters[0]];
        } else if (filters.length > 1) {
          state.selectedFilters.is_test.values = [filters[filters.length - 1]];
        } else {
          state.selectedFilters.is_test.values = [];
        }
        break;

      default:
        break;
    }
    state.pagination.currentPage = 1;
    await handleGetFilters();
    render();
  };

  const handleGetFilters = async () => {
    try {
      const filterParams = setFiltersAndReturn(state);
      await getApisList(filterParams);
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesFiltros'));
    }
    render();
  };

  const columnsTable = [
    {
      Header: (props) => (
        <Checkbox
          onClick={() => {
            const allIds = props.data.map((item) => item.ID);
            handleSelectAll(allIds);
          }}
          checked={verifyChecked(state.selected_ids_apis, props.data)}
        />
      ),
      accessor: 'ID',
      disableSortBy: false,
      Cell: (props) => (
        <Checkbox
          checked={state.selected_ids_apis.includes(props.row.original.ID)}
          onClick={() => handleCheckboxChange(props.row.original.ID)}
          key={props.row.original.ID}
        />
      ),
    },
    {
      Header: () => (
        GenerateItemColumn(t('cliente'), 'CLIENT_NAME', handleSortData, state.columnSort.CLIENT_NAME, {
          hasFilter: true,
          options: state.filtersData.clients,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.clients?.length === state.selectedFilters.clients.length,
          value: state.selectedFilters.clients.values,
        })
      ),
      accessor: 'CLIENT_NAME',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.CLIENT_NAME, 'CLIENT_NAME'),
    },
    {
      Header: () => (
        GenerateItemColumn(t('emteste'), 'IS_TEST', handleSortData, state.columnSort.IS_TEST, {
          hasFilter: true,
          options: state.filtersData.is_test,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.is_test?.length === state.selectedFilters.is_test.length,
          value: state.selectedFilters.is_test.values,
        })
      ),
      accessor: 'IS_TEST',
      disableSortBy: true,
      Cell: (props) => (props.row.original.IS_TEST ? <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}><FaTools color={colors.LightBlue} /></div> : <div />),
    },
    {
      Header: () => (
        GenerateItemColumn(t('modulo'), 'NOTIFY_CONDITION', handleSortData, state.columnSort.NOTIFY_CONDITION, {
          hasFilter: true,
          options: state.filtersData.notify_condition,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.notify_condition?.length === state.selectedFilters.notify_condition.length,
          value: state.selectedFilters.notify_condition.values,
        })
      ),
      accessor: 'NOTIFY_CONDITION',
      disableSortBy: true,
      Cell: () => StringLabel(t('preditivo'), 'TITLE'),
    },
    {
      Header: () => (
        GenerateItemColumn(t('nome'), 'TITLE', handleSortData, state.columnSort.TITLE, {
          hasFilter: true,
          options: state.filtersData.nome,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.nome?.length === state.selectedFilters.nome.length,
          value: state.selectedFilters.nome.values,
        })
      ),
      accessor: 'TITLE',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.TITLE, 'TITLE'),
    },
    {
      Header: () => (
        GenerateItemColumn('Trigger ID', 'TRIGGER_ID', handleSortData, state.columnSort.TRIGGER_ID, {
          hasFilter: true,
          options: state.filtersData.trigger_id,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.trigger_id?.length === state.selectedFilters.trigger_id.length,
          value: state.selectedFilters.trigger_id.values,
        })
      ),
      accessor: 'TRIGGER_ID',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.TRIGGER_ID, 'TRIGGER_ID'),
    },
    {
      Header: () => (
        GenerateItemColumn(t('condicao'), 'HEALTH_STATUS', handleSortData, state.columnSort.HEALTH_STATUS, {
          hasFilter: true,
          options: state.filtersData.health_status,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.health_status?.length === state.selectedFilters.health_status.length,
          value: state.selectedFilters.health_status.values,
        })
      ),
      accessor: 'HEALTH_STATUS',
      disableSortBy: true,
      Cell: (props) => StringLabel(`${t('indiceDeSaude')} ${parseHealthStatusColumn(props.row.original.HEALTH_STATUS)}`, 'HEALTH_STATUS'),
    },
    {
      Header: () => (
        GenerateItemColumn(t('unidades'), 'UNIT_NAME', handleSortData, state.columnSort.UNIT_NAME, {
          hasFilter: true,
          options: state.filtersData.unit,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.unit?.length === state.selectedFilters.unit.length,
          value: state.selectedFilters.unit.values,
        })
      ),
      accessor: 'UNITS',
      disableSortBy: true,
      Cell: (props) => (
        props.row.original.ApiUnitRelations.length > 0
          ? StatusCell(props.row.original.ID, props.row.original.ApiUnitRelations.map((item) => item.UNIT_NAME))
          : StringLabel(`${t('todas')}`, 'UNIT_IDS')
      ),
    },
    {
      Header: () => (
        GenerateItemColumn(t('status'), 'STATUS', handleSortData, state.columnSort.STATUS, {
          hasFilter: true,
          options: state.filtersData.status,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectFiltersAll,
          filterAll: state.filtersData.status?.length === state.selectedFilters.status.values.length,
          value: state.selectedFilters.status.values,
        })),
      accessor: 'STATUS',
      disableSortBy: false,
      Cell: (props) => {
        const id = props.row.original.ID;
        const status = props.row.original.STATUS;
        return (
          <OptionsButton
            id={id}
            handleButtonStatusToggle={handleButtonStatusToggle}
            isOpen={state.selected_status_open.includes(id)}
            status={status}
            onActivateClick={(id) => handleUpdate(id, status)}
          />
        );
      },
    },
    {
      Header: () => (GenerateItemColumn(t('acoes'), 'ID', () => {}, state.columnSort.ID, {
        hasFilter: false,
      }, true)),
      accessor: 'CLIENT_ID',
      disableSortBy: false,
      Cell: (props) => {
        const infos = props.row.original;
        return (
          <Flex justifyContent="center">
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={() => {
                handleModalToggle(true, true, {
                  id: infos.ID,
                  is_test: infos.IS_TEST,
                  client_id: infos.CLIENT_ID,
                  client_name: infos.CLIENT_NAME,
                  health_status: infos.HEALTH_STATUS,
                  title_api: infos.TITLE,
                  trigger_id: infos.TRIGGER_ID,
                  notif_type: 'HEALTH_INDEX',
                  unit_ids: infos.ApiUnitRelations.map((item) => item.UNIT_ID),
                });
              }}
            >
              <EditIcon color={colors.LightBlue} />
            </button>
          </Flex>
        );
      },
    },
  ];

  async function handleUpdate(id, status) {
    if (state.selected_status_open[0] === id) {
      try {
        await apiCall('/mainservice/api-registries/update-api', {
          id: state.selected_status_open[0],
          body: {
            status: !status,
          },
        });

        fetchData();
        state.selected_ids_apis = [];
        toast.success(t('statusAlteradoSucesso'));
      } catch (error) {
        toast.error(t('erroMudarStatus'));
      }
    }
  }

  async function handleDelete() {
    if (state.selected_ids_apis && state.selected_ids_apis.length > 0) {
      try {
        await apiCall('/mainservice/api-registries/delete-apis', {
          ids: state.selected_ids_apis,
        });
        fetchData();
        state.selected_ids_apis = [];
        toast.success(t('apisExcluidasSucesso'));
      } catch (error) {
        toast.error('erroExcluirApi');
      }
    } else {
      toast.warn(t('nenhumaApiSelecionadaExclusão'));
    }
  }

  function sortDataColumnKey(column) {
    Object.keys(state.columnSort).forEach((columnKey) => {
      if (columnKey === column) {
        state.columnSort[columnKey] = {
          column: state.columnSort[columnKey].column,
          desc: !state.columnSort[columnKey].desc,
        };
      } else {
        state.columnSort[columnKey] = {
          column: state.columnSort[columnKey].column,
          desc: false,
        };
      }
    });

    state.currentSort = {
      field: state.columnSort[column].column,
      type: state.columnSort[column].desc ? 'desc' : 'asc',
    };
  }

  const handleSortData = async (column) => {
    sortDataColumnKey(column);
    const filterParams = setFiltersAndReturn(state);
    await getApisList(filterParams);
    render();
  };

  const getApisList = async (filterParams) => {
    try {
      const sortParams = {} as {orderByField: string, orderByType: string };
      const filterParamsSet = filterParams;
      if (state.currentSort.field && state.currentSort.type) {
        sortParams.orderByField = state.currentSort.field;
        sortParams.orderByType = state.currentSort.type;
      }
      const { apis, totalItems } = await apiCall('/mainservice/api-registries/get-apis', { limit: state.pagination.itemsPerPage, page: state.pagination.currentPage, ...filterParamsSet });
      const listApis = apis.map((item) => ({ ...item, toogleAsset: false }));
      setState({
        apis: listApis,
      });
      state.pagination.totalItems = totalItems;
      render();
    } catch (error) {
      toast.error(t('houveErroBuscandoAsAnalises'));
      render();
    }
  };

  const setFiltersAndReturn = (state) => {
    const filterParams = {
      clientIds: state.selectedFilters.clients.values?.map((filter) => filter.value),
      title: state.selectedFilters.nome.values?.map((filter) => filter.value),
      triggerId: state.selectedFilters.trigger_id.values?.map((filter) => filter.value),
      unitIds: state.selectedFilters.unit.values?.map((filter) => filter.value),
      status: state.selectedFilters.status.values[0] === 1 ? true : state.selectedFilters.status.values[0] === 0 ? false : null,
      healthStatus: state.selectedFilters.health_status.values?.map((filter) => filter.value),
      isTest: state.selectedFilters.is_test.values[0] === 1 ? true : state.selectedFilters.is_test.values[0] === 0 ? false : null,
      orderDirection: state.currentSort.type.toLowerCase(),
      orderBy: state.currentSort.field,
    };
    return filterParams;
  };

  const filteredColumnsData: (boolean | ColumnTable)[] = columnsTable;

  const [columnsData] = useState<(boolean | ColumnTable)[]>(filteredColumnsData);

  return (
    <>
      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <Container>
          <ButtonsRow>
            <div style={{
              display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap',
            }}
            >
              <div style={{ position: 'relative' }}>
                <ButtonOptions disabled={state.loading} onClick={handleButtonToggle}>
                  <NewApiIcon color="#363BC4" />
                  <p style={{ margin: '0%' }}>{t('novaApi')}</p>
                </ButtonOptions>
                {openButton && (
                  <>
                    <ContainerButtonOpen onClick={() => setOpenButton(false)}>
                      <OptionsButtonsTypeAPI
                        disabled={false}
                        onClick={() => {
                          handleModalToggle(true, false);
                          handleButtonToggle();
                        }}
                      >
                        {t('moduloPreditivo')}
                      </OptionsButtonsTypeAPI>
                    </ContainerButtonOpen>

                    <button
                      style={{
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        position: 'fixed',
                        zIndex: 10,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                      }}
                      onClick={handleButtonToggle}
                      aria-label="Toggle button"
                      type="button"
                    />
                  </>
                )}
              </div>
              <ButtonOptions
                onClick={() => { handleDelete(); }}
                disabled={state.selected_ids_apis.length <= 0}
                aria-disabled={state.selected_ids_apis.length <= 0}
              >
                <DeleteTrashIcon />
                <p style={{ margin: '0%' }}>{t('excluir')}</p>
              </ButtonOptions>
            </div>
          </ButtonsRow>

          <Card noPaddingRelative>
            {
              !state.apis ? <NoDataInTable />
                : (
                  <TableWrapper>
                    <Table
                      style={{ minHeight: '70vh' }}
                      columns={columnsData.filter(Boolean)}
                      data={state.apis}
                      noDataComponent={NoDataInTable}
                      noBorderBottom
                    />
                  </TableWrapper>
                )
              }
          </Card>
          <Flex justifyContent="flex-end" width={1} mt={10} mb={10}>
            <Pagination
              className="ant-pagination"
              current={state.pagination.currentPage}
              total={state.pagination.totalItems}
              pageSize={state.pagination.itemsPerPage}
              onChange={(current) => handleChangePagination(current)}
            />
          </Flex>

          {isModalOpen && (
            <ModalWindow
              borderTop
              style={{
                minWidth: isDesktop ? '600px' : '300px',
                paddingLeft: '0',
                paddingRight: '0',
              }}
              onClickOutside={handleModalClose}
            >
              <ContainerModal>
                <Flex justifyContent="space-between">
                  <Flex flexDirection="column">
                    <ModalTitle>{t('novaApi')}</ModalTitle>
                    <ModalSubTitle>
                      {t('moduloPreditivo')}
                    </ModalSubTitle>
                  </Flex>
                  {isAdminApi && (
                    <Checkbox
                      label={`${t('emteste')}?`}
                      size={20}
                      checked={state.selected_is_test}
                      onClick={() => { state.selected_is_test = !state.selected_is_test; render(); }}
                    />
                  )}
                </Flex>
                <ModalTitle>{t('geral')}</ModalTitle>
                <ContainerModalInputs>
                  <ContainerRow>
                    <div style={{
                      border: '1px solid #818181', borderRadius: '6px', margin: '10px 0px 16px 0px', height: '55px', width: '200px',
                    }}
                    >
                      <Label>{t('cliente')}</Label>
                      <SelectSearch
                        options={state.comboOpts.clients.map((item) => ({ value: item.CLIENT_ID, name: item.NAME }))}
                        value={state.selected_client?.CLIENT_ID.toString()}
                        search
                        filterOptions={fuzzySearch}
                        onChange={(value, name) => { onSelectClient(name); }}
                        placeholder={t('nomeDoCliente')}
                        data-test-id="nomeCliente"
                      />
                    </div>
                    {state.selected_is_test && (
                      <div style={{ width: '200px', margin: '10px 0px 16px 0px' }}>
                        <SelectMultiple
                          haveFuzzySearch
                          emptyLabel={`${t('selecionar')}`}
                          propLabel="UNIT_NAME"
                          options={state.comboOpts.units}
                          values={state.comboOpts.units.filter((x) => x.checked)}
                          haveSelectAll
                          selectAllOptions={() => { selectAllOptions(state.comboOpts.units); }}
                          name="unidades"
                          onSelect={(item) => handleSelectItem(item, state.comboOpts.units)}
                          placeholder={`${t('unidades')}`}
                          disabled={!state.selected_client?.CLIENT_ID}
                          styleBox={{ border: '1px solid #818181', height: '55px' }}
                          position="left"
                        />
                      </div>
                    )}
                  </ContainerRow>
                  <ContainerRow>
                    <SelectNew
                      style={{ height: '55px', width: '200px' }}
                      options={notif_type_options}
                      propLabel="NOTIF_TYPE"
                      label={t('enviarNotificacaoSe')}
                      onSelect={(e) => {
                        onSelectedNotfiType(e);
                      }}
                      notNull
                      value={optionSelectedNotifType()}
                      placeholder={t('selecionar')}
                      data-test-id="notif_type"
                    />
                    <SelectNew
                      style={{ minHeight: '55px', minWidth: '200px' }}
                      options={health_status_options}
                      propLabel="HEALTH_STATUS"
                      label={t('statusDeSaude')}
                      onSelect={(e) => {
                        onSelectedHealthStatus(e);
                      }}
                      value={optionSelectedHealthStatus()}
                      notNull
                      placeholder={t('selecionar')}
                      data-test-id="health_status"
                    />

                  </ContainerRow>
                  <ContainerRow>
                    <TextLine>
                      <Input
                        style={{ width: '200px', height: '55px' }}
                        value={state.title_api}
                        type="text"
                        label={t('tituloApi')}
                        placeholder={t('digitarTitulo')}
                        data-test-id="tituloApi"
                        onChange={(e) => {
                          setState({
                            title_api: e.target.value,
                          });
                        }}
                      />
                    </TextLine>
                    <TextLine style={{ margin: '10px 0px 16px 0px' }}>
                      <Input
                        style={{
                          width: '200px', height: '55px',
                        }}
                        value={state.trigger_id}
                        type="text"
                        label="Trigger ID"
                        placeholder={`${t('digitar')} ID`}
                        onChange={(e) => {
                          setState({
                            trigger_id: e.target.value,
                          });
                        }}
                        data-test-id="trigger_id"
                      />
                    </TextLine>
                  </ContainerRow>
                  <ContainerRow>
                    <div style={{
                      margin: '10px 0px 16px 0px',
                      height: '50px',
                      width: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    >
                      <div>
                        <p style={{ color: colors.Blue400, fontWeight: 'bold', fontSize: '12px' }}>{t('tipoDeIntegracao')}</p>
                        <span>Google</span>
                        <ToggleSwitchMini
                          disabled
                          checked={state.selected_type}
                          style={{ margin: '0 8px' }}
                          onClick={() => { setState({
                            selected_type: state.selected_type, // Opção desabilitada Celsius
                          }); }}
                        />
                        <span style={{ opacity: '.5' }}>Celsius</span>
                      </div>
                    </div>
                  </ContainerRow>
                </ContainerModalInputs>
              </ContainerModal>
              <Flex marginTop={20} marginLeft={30} marginRight={30} justifyContent="space-between" alignItems="end" flexDirection="row">
                <ModalCancel
                  style={{
                    cursor: 'pointer', textAlign: 'center', width: '100px',
                  }}
                  onClick={handleModalClose}
                >
                  {t('botaoCancelar')}
                </ModalCancel>
                <Button onClick={() => { handleCreateNewApi(); }} variant="primary" style={{ width: '150px', fontWeight: 'normal' }}>
                  {t('finalizar')}
                </Button>
              </Flex>
            </ModalWindow>
          )}
        </Container>
      )}
    </>
  );
};

const NoDataInTable = () => (
  <NoApiReturn style={{ minHeight: '60vh' }}>
    <NewApiIcon color="#7d7d7d" />
    <span>{t('listagemDeApi')}</span>
    <div style={{ width: '250px' }}>
      <p>
        {t('paraGerarListagemCadastrarNovaConfiguracao')}
      </p>
    </div>
  </NoApiReturn>
);
