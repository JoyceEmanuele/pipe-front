import { Card } from '~/components/Card';
import {
  DateExportRow,
  ExportButton,
  ResultsResume,
  DateButton,
  DateWrapper,
  DateButtonActions,
  ResultContainer,
  NoAnalisysSelected,
  AnalisysResult,
  LoaderOverlay,
  TableWrapper,
  ResultsContent,
  EnergyEfficiencyItem,
  EnergyEfficiencyBar,
  ResultsContentEF,
} from './styles';
import { DayPickerRangeController } from 'react-dates';
import { useStateVar } from '~/helpers/useStateVar';
import {
  ExportIcon,
  FoldedSheet,
} from '~/icons';
import { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { apiCall, apiCallDownload } from '~/providers';
import {
  Loader, Table,
} from '~/components';
import { toast } from 'react-toastify';
import { QuickSelectionV2 } from '~/components/QuickSelectionV2';
import {
  StringLabel, LinkedStringLabel, PercentageTableLabel, controlColumnsConfigs, ValueLabelWithSufix,
  ValueLabelWithSufixNullable,
  ValueLabelWithPrefixNullable,
  ValueTrated,
  RankingLabel,
  ProcelCategoryLabel,
  VarConsumptionLabel,
  GenerateEfColumn,
  ValueTotalCharged,
} from './TableConfigs';
import { GenerateItemColumn } from '~/components/Table';
import { Flex } from 'reflexbox';
import Pagination from 'rc-pagination';
import ModalOrderColumns from '~/components/ModalOrderColumns';
import { reorderList } from '~/helpers/reorderList';
import { ColumnTable } from '~/metadata/ColumnTable.model';
import { t } from 'i18next';
import { EmptyDocumentIcon } from '~/icons/EmptyDocumentIcon';
import { CalendarIcon } from '~/icons/CalendarIcon';
import { useLocation } from 'react-router-dom';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { getUserProfile } from '~/helpers/userProfile';
import i18n from '~/i18n';

export const tickets = [
  {
    label: 'a',
    color: '#039340',
    height: '16px',
  },
  {
    label: 'b',
    color: '#05A935',
    height: '25px',
  },
  {
    label: 'c',
    color: '#99D014',
    height: '31px',
  },
  {
    label: 'd',
    color: '#FDF900',
    height: '35px',
  },
  {
    label: 'e',
    color: '#F1AE02',
    height: '42px',
  },
  {
    label: 'f',
    color: '#E4650A',
    height: '48px',
  },
  {
    label: 'g',
    color: '#DE2917',
    height: '53px',
  },
];

export const EnergyAnalisys = (): JSX.Element => {
  const isDesktop = window.matchMedia('(min-width: 768px)');

  const location = useLocation();

  const [isShowCalendar, setIsShowCalendar] = useState(false);
  const [showModalOrderColumns, setShowModalOrderColumns] = useState(false);
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;
  const filteredColumnsModal = isAdmin ? controlColumnsConfigs : controlColumnsConfigs.filter((col) => col.id !== 'clientName');

  const [controlColumns, setControlColumns] = useState(filteredColumnsModal);
  const [exportColumns, setExportColumns] = useState<string[]>(filteredColumnsModal.map((col) => col.id));

  useEffect(() => {
    const weekdaysMin: string[] = t('weekdaysMin', { returnObjects: true });
    const language = i18n.language === 'pt' ? 'pt-br' : i18n.language;
    moment.updateLocale(language, {
      weekdaysMin,
    });
  }, [i18n.language, t]);

  const columnsTable = [
    isAdmin && {
      Header: () => (
        GenerateItemColumn(t('cliente'), 'clientName', handleSortData, state.columnSort.clientName, {
          hasFilter: true,
          options: state.filtersData.clients,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData?.clients?.length === state.selectedFilters?.clients?.length,
          value: state.selectedFilters.clients.values,
        })
      ),
      accessor: 'clientName',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.clientName, `clientName-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(t('estado'), 'stateName', handleSortData, state.columnSort.stateName, {
          hasFilter: true,
          options: state.filtersData.states,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData?.states?.length === state.selectedFilters?.states?.length,
          value: state.selectedFilters.states.values,
        })
      ),
      accessor: 'stateName',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.stateName, `stateName-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(t('cidade'), 'cityName', handleSortData, state.columnSort.cityName, {
          hasFilter: true,
          options: state.filtersData.cities,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData?.cities?.length === state.selectedFilters?.cities?.length,
          value: state.selectedFilters.cities.values,
        })
      ),
      accessor: 'cityName',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.cityName, `cityName-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(t('unidade'), 'unitName', handleSortData, state.columnSort.unitName, {
          hasFilter: true,
          options: state.filtersData.units,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData?.units?.length === state.selectedFilters?.units?.length,
          value: state.selectedFilters.units.values,
        })
      ),
      accessor: 'unitName',
      disableSortBy: true,
      Cell: (props) => LinkedStringLabel(props.row.original.unitName, props.row.original.unitId, `unitName-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn('Ranking', 'procelRanking', handleSortData, state.columnSort.procelRanking, {
          hasFilter: false,
        }, false, { tooltipId: 'ranking-info', title: 'Ranking', text: t('rankingDesc') })
      ),
      accessor: 'procelRanking',
      disableSortBy: true,
      Cell: (props) => RankingLabel(props.row.original.procelRanking),
    },
    {
      Header: () => (
        GenerateEfColumn('Efic. Energética', 'procelCategory', handleSortData, state.columnSort.procelCategory, {
          hasFilter: true,
          options: tickets,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.selectedFilters.energyEfficiency.length === 7,
          value: state.selectedFilters.energyEfficiency.values,
        })
      ),
      accessor: 'procelCategory',
      disableSortBy: true,
      Cell: (props) => ProcelCategoryLabel(props.row.original.procelCategory, tickets),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('consumoPorM')} (kWh/m²)`, 'consumptionByArea', handleSortData, state.columnSort.consumptionByArea)
      ),
      accessor: 'consumptionByArea',
      disableSortBy: true,
      Cell: (props) => ValueTrated(props.row.original, 'consumptionByArea', '', ' kWh/m²'),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('consumo')} (kWh)`, 'consumption', handleSortData, state.columnSort.consumption)
      ),
      accessor: 'consumption',
      disableSortBy: true,
      Cell: (props) => ValueTrated(props.row.original, 'consumption', '', ' kWh'),
    },
    {
      Header: () => (
        GenerateItemColumn('Var. Consumo', 'consumptionPreviousPercentage', handleSortData, state.columnSort.consumptionPreviousPercentage, {
          hasFilter: false,
        }, false, { tooltipId: 'var_consumption-info', title: t('variacaoConsumo'), text: t('variacaoConsumoDesc') })
      ),
      accessor: 'consumptionPreviousPercentage',
      disableSortBy: true,
      Cell: (props) => VarConsumptionLabel(props.row.original, props.row.original.consumptionPreviousPercentage, 'consumptionPreviousPercentage'),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('consumo')} (R$)`, 'totalCharged', handleSortData, state.columnSort.totalCharged)
      ),
      accessor: 'totalCharged',
      disableSortBy: true,
      Cell: (props) => ValueTotalCharged(props.row.original, props.row.original.totalCharged, 'totalCharged', 'R$ '),
    },
    {
      Header: () => (
        GenerateItemColumn(t('consumoRefrigecao'), 'refrigerationConsumption', handleSortData, state.columnSort.refrigerationConsumption)
      ),
      accessor: 'refrigerationConsumption',
      disableSortBy: true,
      Cell: (props) => ValueTrated(props.row.original, 'refrigerationConsumption', '', ' kWh'),
    },
    {
      Header: () => (
        GenerateItemColumn(t('refrigecacaoConsumo'), 'refrigerationConsumptionPercentage', handleSortData, state.columnSort.refrigerationConsumptionPercentage)
      ),
      accessor: 'refrigerationConsumptionPercentage',
      disableSortBy: true,
      Cell: (props) => PercentageTableLabel(props.row.original, 'refrigerationConsumptionPercentage'),
    },
    {
      Header: () => (
        GenerateItemColumn(t('capacidadeRefrigeracao'), 'refCapacity', handleSortData, state.columnSort.refCapacity)
      ),
      accessor: 'refCapacity',
      disableSortBy: true,
      Cell: (props) => ValueLabelWithSufix(props.row.original.refCapacity, ' TR', `refCapacity-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(`m²/TR ${t('instalado')}`, 'refrigerationConsumptionByArea', handleSortData, state.columnSort.refrigerationConsumptionByArea)
      ),
      accessor: 'refrigerationConsumptionByArea',
      disableSortBy: true,
      Cell: (props) => ValueLabelWithSufixNullable(props.row.original.refrigerationConsumptionByArea, ' m²/TR ', `refrigerationConsumptionByArea-${props.row.original.unitId}`),
    },
  ];

  const filteredColumnsTable = columnsTable.filter((x): x is Exclude<typeof x, undefined> => x !== undefined && x !== false);

  const [columnsData, setColumnsData] = useState<(boolean | ColumnTable)[]>(filteredColumnsTable);

  const [state, render, setState] = useStateVar({
    showModelsCard: true,
    showTableCard: true,
    haveAnalisysResult: false,
    hasResult: true,
    isLoading: false,
    focusedInput: 'startDate' as 'endDate' | 'startDate' | null,
    showResult: false,
    selectedModel: 0,
    startDate: null as Date | moment.Moment | null,
    endDate: null as Date | moment.Moment | null,
    totalItems: { totalCities: 0, totalStates: 0, totalUnits: 0 },
    unitsList: [] as any,
    showCalendar: false,
    debounceTimer: null as null | NodeJS.Timeout,
    filtersData: {} as any,
    procell: [] as any[],
    selectedFilters: {
      clients: {
        label: t('cliente'),
        values: [],
      },
      states: {
        label: t('estado'),
        values: [],
      },
      cities: {
        label: t('cidade'),
        values: [],
      },
      units: {
        label: t('unidade'),
        values: [],
      },
      energyEfficiency: {
        label: 'Efic. Energética',
        values: [],
      },
    } as any,
    filterAll: {
      clients: false,
      states: false,
      cities: false,
      units: false,
      energyEfficiency: false,
    },
    columnSort: {
      clientName: {
        column: 'clientName',
        desc: false,
      },
      stateName: {
        column: 'stateName',
        desc: false,
      },
      cityName: {
        column: 'cityName',
        desc: false,
      },
      unitName: {
        column: 'unitName',
        desc: false,
      },
      procelRanking: {
        column: 'procelRanking',
        desc: true,
      },
      procelCategory: {
        column: 'procelCategory',
        desc: false,
      },
      consumption: {
        column: 'consumption',
        desc: false,
      },
      consumptionPreviousPercentage: {
        column: 'consumptionPreviousPercentage',
        desc: false,
      },
      totalCharged: {
        column: 'totalCharged',
        desc: false,
      },
      refrigerationConsumption: {
        column: 'refrigerationConsumption',
        desc: false,
      },
      refrigerationConsumptionPercentage: {
        column: 'refrigerationConsumptionPercentage',
        desc: false,
      },
      consumptionByArea: {
        column: 'consumptionByArea',
        desc: false,
      },
      refCapacity: {
        column: 'refCapacity',
        desc: false,
      },
      refrigerationConsumptionByArea: {
        column: 'refrigerationConsumptionByArea',
        desc: false,
      },
    },
    currentSort: {
      field: '',
      type: '',
    },
    pagination: {
      itemsPerPage: 20,
      totalItems: 0,
      currentPage: 1,
    },
  });

  const getUnitListInfo = async (resetPagination = true) => {
    try {
      setState({ isLoading: true });

      const filterParams = {
        unitIds: state.selectedFilters.units.values.map((filter) => filter.value),
        stateIds: state.selectedFilters.states.values.map((filter) => filter.value),
        cityIds: state.selectedFilters.cities.values.map((filter) => filter.value),
        clientIds: state.selectedFilters.clients.values.map((filter) => filter.value),
        categoryFilter: state.selectedFilters.energyEfficiency.values.map((filter) => filter.value),
      };

      const sortParams = {} as {orderByField: string, orderByType: string };

      if (state.currentSort.field && state.currentSort.type) {
        sortParams.orderByField = state.currentSort.field;
        sortParams.orderByType = state.currentSort.type;
      }

      if (resetPagination) {
        state.pagination.currentPage = 1;
      }

      const items = await apiCall('/energy/get-analysis-list', {
        startDate: moment(state.startDate).format().substring(0, 19),
        endDate: moment(state.endDate).format().substring(0, 19),
        page: state.pagination.currentPage,
        pageSize: state.pagination.itemsPerPage,
        ...sortParams,
        insideFilters: { ...filterParams },
      });

      state.pagination.totalItems = items.resume.totalItems;

      const procelItems = tickets.map((ticket) => ({
        qtd: items.resume.procel[ticket.label],
        ...ticket,
      }));

      setState({
        unitsList: items.unitsList,
        procell: procelItems,
        totalItems: {
          totalCities: items.resume.totalCITIES,
          totalUnits: items.resume.totalItems,
          totalStates: items.resume.totalSTATES,
        },
        haveAnalisysResult: true,
        isLoading: false,
      });

      render();
    } catch (error) {
      console.log(error);
      setState({ isLoading: false });
      render();
    }
  };

  const handleChangeFilters = async (name, filters) => {
    switch (name) {
      case 'Cliente':
        state.selectedFilters.clients.values = filters.map((filter) => state.filtersData.clients.find((filterData) => filterData.value === filter));
        break;
      case 'Estado':
        state.selectedFilters.states.values = filters.map((filter) => state.filtersData.states.find((filterData) => filterData.value === filter));
        break;
      case 'Cidade':
        state.selectedFilters.cities.values = filters.map((filter) => state.filtersData.cities.find((filterData) => filterData.value === filter));
        break;
      case 'Unidade':
        state.selectedFilters.units.values = filters.map((filter) => state.filtersData.units.find((filterData) => filterData.value === filter));
        break;
      case 'Efic. Energética':
        state.selectedFilters.energyEfficiency.values = filters;
        break;
      default:
        break;
    }

    handleGetFilters();
    getUnitListInfo();
    render();
  };

  const handleSelectAllFilters = async (name, filterAll) => {
    switch (name) {
      case 'Cliente':
        state.selectedFilters.clients.values = filterAll ? state.filtersData.clients : [];
        state.filterAll.clients = filterAll;
        break;
      case 'Estado':
        state.selectedFilters.states.values = filterAll ? state.filtersData.states : [];
        state.filterAll.states = filterAll;
        break;
      case 'Cidade':
        state.selectedFilters.cities.values = filterAll ? state.filtersData.cities : [];
        state.filterAll.cities = filterAll;
        break;
      case 'Unidade':
        state.selectedFilters.units.values = filterAll ? state.filtersData.units : [];
        state.filterAll.units = filterAll;
        break;
      case 'Efic. Energética':
        state.selectedFilters.energyEfficiency.values = filterAll ? tickets.map((ticket) => ({
          name: ticket.label.toUpperCase(),
          value: ticket.label.toUpperCase(),
          ...ticket,
        })) : [];
        state.filterAll.energyEfficiency = filterAll;
        break;
      default:
        break;
    }

    handleGetFilters();
    getUnitListInfo();
    render();
  };

  const handleSortData = (column) => {
    sortDataColumn(state, column);
    getUnitListInfo();
    render();
  };

  const handleGetFilters = async () => {
    try {
      if (!state.startDate || !state.endDate) return;

      const filtersParams = {
        clients: state.selectedFilters.clients.values.map((filter) => filter.value),
        states: state.selectedFilters.states.values.map((filter) => filter.value),
        cities: state.selectedFilters.cities.values.map((filter) => filter.value),
      };
      const filters = await apiCall('/energy/get-energy-analysis-filters', {
        startDate: moment(state.startDate).format().substring(0, 19),
        endDate: moment(state.endDate).format().substring(0, 19),
        ...filtersParams,
      });
      state.filtersData = {
        clients: filters.clients.map((client) => ({ name: client.name, value: client.id })),
        states: filters.states.map((state) => ({ name: state.name, value: state.id })),
        cities: filters.cities.map((city) => ({ name: city.name, value: city.id })),
        units: filters.units.map((unit) => ({ name: unit.name, value: unit.id })),
      };

      render();
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesFiltros'));
    }
  };

  const handleRemoveAllFilters = () => {
    state.selectedFilters.clients.values = [];
    state.selectedFilters.states.values = [];
    state.selectedFilters.cities.values = [];
    state.selectedFilters.units.values = [];
    state.selectedFilters.energyEfficiency.values = [];

    handleGetFilters();
    getUnitListInfo();
    render();
  };

  const handleRemoveFilter = (columnKey: string, filterIndex: number) => {
    state.selectedFilters[columnKey].values.splice(filterIndex, 1);

    handleGetFilters();
    getUnitListInfo();
    render();
  };

  const handleRemoveCategoryFilter = (columnKey: string) => {
    state.selectedFilters[columnKey].values = [];

    handleGetFilters();
    getUnitListInfo();
    render();
  };

  const handleChangeColumns = (columnId) => {
    const toggleVisibility = (column) => ({
      ...column,
      visible: column.id === columnId ? !column.visible : column.visible,
    });

    const updatedColumns = controlColumns.map(toggleVisibility);
    setControlColumns(updatedColumns);
    handleSetExportColumns(updatedColumns);

    const newColumnsData = updatedColumns.map((column) => {
      if (column.visible === true) {
        return filteredColumnsTable.find((columnTable) => columnTable && columnTable.accessor === column.id) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);

    return updatedColumns.some((column) => column.visible);
  };

  const handleSetColumnsData = (columns) => {
    setControlColumns(columns);
    handleSetExportColumns(columns);

    const newColumnsData = columns.map((column) => {
      if (column.visible === true) {
        return filteredColumnsTable.find((columnTable) => {
          if (typeof columnTable !== 'boolean') {
            return columnTable.accessor === column.id;
          }

          return false;
        }) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);
  };

  function handleSetExportColumns(columns) {
    const columnsToExport: string[] = [];
    for (const col of columns) {
      if (col?.visible) {
        columnsToExport.push(col.id);
      }
    }
    setExportColumns(columnsToExport);
  }

  async function handleExportEnergyAnalysis(startDate: Moment, endDate: Moment) {
    try {
      setState({ isLoading: true });
      render();

      const filterParams = {
        unitIds: state.selectedFilters.units.values.map((filter) => filter.value),
        stateIds: state.selectedFilters.states.values.map((filter) => filter.value),
        cityIds: state.selectedFilters.cities.values.map((filter) => filter.value),
        clientIds: state.selectedFilters.clients.values.map((filter) => filter.value),
        categoryFilter: state.selectedFilters.energyEfficiency.values.map((filter) => filter.value),
      };

      const sortParams = {} as {orderByField: string, orderByType: string };

      if (state.currentSort.field && state.currentSort.type) {
        sortParams.orderByField = state.currentSort.field;
        sortParams.orderByType = state.currentSort.type;
      }

      const exportResponse = await apiCallDownload('/energy/export-energy-analysis-list', {
        columnsToExport: exportColumns,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        ...sortParams,
        ...filterParams,
      });

      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || `${t('nomeArquivoAnaliseEnergia')}.xlsx`;
      link.click();

      toast.success(t('sucessoExportacao'));
    } catch (error) {
      console.log(error);
      toast.error(t('naoFoiPossivelExportar'));
    } finally {
      setState({ isLoading: false });
      render();
    }
  }

  async function handleExport() {
    if (state.isLoading) return;
    if (!state.startDate || !state.endDate) {
      return toast.warn(t('selecioneAlgumPeriodoExportar'));
    }

    await handleExportEnergyAnalysis(moment(state.startDate), moment(state.endDate));
  }

  const handleFeedDefaultFilters = (pageState, filter) => {
    if (pageState.insideFilters[filter].length > 0) {
      return pageState.insideFilters[filter];
    }

    if (pageState.pageFilters[filter]) {
      return pageState.pageFilters[filter];
    }

    return [];
  };

  const handleTransformFilterApi = (filters, defaultOptions) => {
    const teste = defaultOptions.map((option) => filters.find((filter) => option === filter.value));

    return teste;
  };

  const handleSetDefaultFilters = async (pageState) => {
    try {
      if (!state.startDate || !state.endDate) return;

      const defaultFilterOptions = {
        clients: handleFeedDefaultFilters(pageState, 'clientIds'),
        states: handleFeedDefaultFilters(pageState, 'stateIds'),
        cities: handleFeedDefaultFilters(pageState, 'cityIds'),
        units: handleFeedDefaultFilters(pageState, 'unitIds'),
      };

      const filters = await apiCall('/energy/get-energy-analysis-filters', {
        startDate: moment(state.startDate).format().substring(0, 19),
        endDate: moment(state.endDate).format().substring(0, 19),
        ...defaultFilterOptions,
      });

      state.filtersData = {
        clients: filters.clients.map((client) => ({ name: client.name, value: client.id })),
        states: filters.states.map((state) => ({ name: state.name, value: state.id })),
        cities: filters.cities.map((city) => ({ name: city.name, value: city.id })),
        units: filters.units.map((unit) => ({ name: unit.name, value: unit.id })),
      };

      state.selectedFilters.units.values = handleTransformFilterApi(state.filtersData.units, defaultFilterOptions.units) || [];
      state.selectedFilters.cities.values = handleTransformFilterApi(state.filtersData.cities, defaultFilterOptions.cities) || [];
      state.selectedFilters.clients.values = handleTransformFilterApi(state.filtersData.clients, defaultFilterOptions.clients) || [];
      state.selectedFilters.states.values = handleTransformFilterApi(state.filtersData.states, defaultFilterOptions.states) || [];

      render();
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesFiltros'));
    }
  };

  const handleLoadPrevData = async () => {
    const searchParams = new URLSearchParams(location.search);
    const pageFilters = JSON.parse(searchParams.get('pageFilters') || '{}');
    const insideFilters = JSON.parse(searchParams.get('insideFilters') || '{}');
    const procellFilters = searchParams.get('procellFilters');
    const date = searchParams.get('date');

    const pageState = {
      pageFilters,
      insideFilters,
      procellFilters,
      date,
    };

    state.startDate = moment(pageState.date, 'MMMM YYYY').startOf('month');
    state.endDate = moment(pageState.date, 'MMMM YYYY').endOf('month');
    state.selectedModel = 1;
    const selectedTicket = state.procell.find((ticket) => ticket.label.toUpperCase() === pageState.procellFilters);
    state.selectedFilters.energyEfficiency.values.push({
      ...selectedTicket,
      name: pageState.procellFilters,
      value: pageState.procellFilters,
    });
    await handleSetDefaultFilters(pageState);

    getUnitListInfo();

    render();
  };

  const handleGetMaxQtdCharacteres = (): number => {
    let higherNumber = state.procell[0].qtd;
    state.procell.forEach((ticket) => {
      if (Number(higherNumber) < Number(ticket.qtd)) {
        higherNumber = ticket.qtd;
      }
    });

    return higherNumber.toString().length;
  };

  const handleFormatNumber = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  useEffect(() => {
    if (location.search && location.search !== '?tipo=energy') {
      state.isLoading = true;
      render();
      handleLoadPrevData();
    } else {
      handleGetFilters();
    }
  }, []);

  useEffect(() => {
    if (location.search && location.search !== '?tipo=energy') {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  function handleChangeDate(startDate: Moment, endDate: Moment, isQuickSelection?: boolean) {
    const endDateAux = !isQuickSelection && startDate !== state.startDate ? null : endDate;
    setState({
      startDate,
      endDate: endDateAux,
    });

    if (startDate?.isValid() && endDateAux?.isValid()) {
      handleGetFilters();
      getUnitListInfo();
      render();
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {state.showTableCard && (
        <ResultContainer>
          <DateExportRow>
            <DateWrapper>
              <div style={{ width: 'min-content' }}>
                <DateButton
                  className="date-picker-no-close"
                  onClick={() => {
                    setIsShowCalendar(!isShowCalendar);
                  }}
                  disabled={state.isLoading}
                >
                  <CalendarIcon />
                  <p className="date-picker-no-close">
                    <span
                      className="date-picker-no-close"
                      onClick={() => {
                        state.focusedInput = 'startDate';
                        render();
                      }}
                    >
                      {state.startDate ? moment(state.startDate)
                        .format('DD MMM YYYY')
                        .toLowerCase() : t('dataInicial')}
                    </span>
                    {' '}
                    -
                    {' '}
                    <span
                      className="date-picker-no-close"
                      onClick={() => {
                        state.focusedInput = 'endDate';
                        render();
                      }}
                    >
                      {state.endDate ? moment(state.endDate)
                        .format('DD MMM YYYY')
                        .toLowerCase() : t('dataFinal')}
                    </span>
                  </p>
                  {isShowCalendar && (
                  <DayPickerRangeController
                    onDatesChange={({ startDate, endDate }) => {
                      handleChangeDate(startDate, endDate);
                    }}
                    onFocusChange={(focusedInput) => {
                      setState({
                        focusedInput: !focusedInput ? 'startDate' : focusedInput,
                      });
                    }}
                    focusedInput={state.focusedInput}
                    startDate={state.startDate}
                    endDate={state.endDate}
                    isOutsideRange={(d) => !d.isBefore(moment().format('YYYY-MM-DD'))}
                    renderCalendarInfo={null}
                    onOutsideClick={(e) => {
                      if (e.target.className === 'date-picker-no-close') return;

                      setIsShowCalendar(false);
                    }}
                  />
                  )}
                </DateButton>
                <DateButtonActions disabled={state.isLoading}>
                  <span
                    className="date-picker-no-close"
                    onClick={() => {
                      setState({
                        startDate: null,
                        endDate: null,
                      });
                      getUnitListInfo();
                      render();
                    }}
                  >
                    {t('limpar')}
                  </span>
                  <QuickSelectionV2
                    height="auto"
                    dateRanges={[
                      { label: t('semanaAtual'), start: () => moment().startOf('week'), end: () => moment().subtract(1, 'day') },
                      { label: t('semanaPassada'), start: () => moment().subtract(7, 'days').startOf('week'), end: () => moment().subtract(7, 'days').endOf('week') },
                      { label: t('ultimos7dias'), start: () => moment().subtract(7, 'days'), end: () => moment().subtract(1, 'day') },
                      { label: t('ultimos30dias'), start: () => moment().subtract(30, 'days'), end: () => moment().subtract(1, 'day') },
                    ]}
                    setDate={(startDate, endDate) => {
                      handleChangeDate(startDate, endDate, true);
                    }}
                  />
                </DateButtonActions>
              </div>
            </DateWrapper>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <ExportButton
                onClick={() => setShowModalOrderColumns(!showModalOrderColumns)}
              >
                <svg
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0013 14.3333L6.0013 1M10.668 12.3333L10.668 3M1.33463 12.3333L1.33463 3"
                    stroke="#363BC4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p style={{ margin: '0%' }}>{t('colunas')}</p>
              </ExportButton>
              <a href="#" style={{ display: 'none' }} id="downloadLink" />
              <ExportButton onClick={() => handleExport()} disabled={state.isLoading || (!state.startDate || !state.endDate)}>
                <ExportIcon />
                <p style={{ margin: '0%' }}>{t('botaoExportar')}</p>
              </ExportButton>
            </div>
          </DateExportRow>
          <div style={{ position: 'relative' }}>
            {!state.haveAnalisysResult ? (
              <NoAnalisysSelected>
                {(!state.startDate || !state.endDate) ? <FoldedSheet width="21" height="27" color="#7D7D7D" /> : <EmptyDocumentIcon />}
                <span>{t('resultadoDaAnalise')}</span>
                <p>
                  {t('gerarAnalise')}
                  .
                </p>
              </NoAnalisysSelected>
            ) : (
              <AnalisysResult>
                <ResultsResume>
                  <ResultsContent>
                    <b>{t('unidades')}</b>
                    <p>{formatNumberWithFractionDigits(state.totalItems.totalUnits) ?? '-'}</p>
                  </ResultsContent>
                  <ResultsContent>
                    <b>{t('Estados')}</b>
                    <p>{formatNumberWithFractionDigits(state.totalItems.totalStates) ?? '-'}</p>
                  </ResultsContent>
                  <ResultsContent>
                    <b>{t('Cidades')}</b>
                    <p>{formatNumberWithFractionDigits(state.totalItems.totalCities) ?? '-'}</p>
                  </ResultsContent>
                  <ResultsContentEF qtdCharacteres={handleGetMaxQtdCharacteres()}>
                    <b>{t('Eficiência Energética')}</b>
                    <div style={{
                      display: 'flex', gap: '8px', padding: '0', width: '100%',
                    }}
                    >
                      {state.procell.map((ticket) => (
                        <EnergyEfficiencyItem key={`ticket-element-${ticket.label}`}>
                          {handleFormatNumber(ticket.qtd)}
                          <EnergyEfficiencyBar barColor={ticket.color} barHeight={ticket.height}>
                            {ticket.label.toUpperCase()}
                          </EnergyEfficiencyBar>
                        </EnergyEfficiencyItem>
                      ))}

                    </div>
                  </ResultsContentEF>
                </ResultsResume>
                <div>
                  <Card noPaddingRelative>
                    <>
                      {controlColumns.some(
                        (column) => column.visible === true,
                      ) ? (
                        <TableWrapper>
                          <Table
                            columns={columnsData.filter(Boolean)}
                            data={state.unitsList}
                            noDataComponent={NoDataInTable}
                            noBorderBottom
                            handleRemoveAllFilters={handleRemoveAllFilters}
                            handleRemoveCategoryFilter={handleRemoveCategoryFilter}
                            handleRemoveFilter={handleRemoveFilter}
                            filtersSelected={state.selectedFilters}
                            style={{
                              boxShadow: 'none',
                              minHeight: '200px',
                              overflowX: state.unitsList.length ? 'auto' : 'hidden',
                              overflowY: state.unitsList.length > 7 ? 'auto' : 'hidden',
                            }}
                          />
                        </TableWrapper>
                        ) : <NoDataInTable />}

                      {showModalOrderColumns && (
                        <ModalOrderColumns
                          handleCancelModal={() => {
                            setShowModalOrderColumns(false);
                          }}
                          handleSubmitModal={() => setShowModalOrderColumns(false)}
                          columns={controlColumns}
                          handleChangeColumns={handleChangeColumns}
                          isDesktop={isDesktop.matches}
                          handleDragColumn={(dragIndex, hoverIndex) => {
                            setControlColumns((prevState) => {
                              const dataAux = reorderList(prevState, dragIndex, hoverIndex);
                              handleSetExportColumns(dataAux);
                              return dataAux;
                            });
                            setColumnsData((prevState) => reorderList(prevState, dragIndex, hoverIndex));
                          }}
                          handleResetColumns={(originalColumns) => {
                            handleSetColumnsData(originalColumns);
                          }}
                        />
                      )}
                    </>
                  </Card>
                  <Flex justifyContent="flex-end" width={1} mt={10} mb={10}>
                    <Pagination
                      className="ant-pagination"
                      current={state.pagination.currentPage}
                      total={state.pagination.totalItems}
                      pageSize={state.pagination.itemsPerPage}
                      onChange={(current) => {
                        state.pagination.currentPage = current;
                        getUnitListInfo(false);
                        render();
                      }}
                      disabled={state.isLoading}
                    />
                  </Flex>
                </div>
              </AnalisysResult>
            )}

            {state.isLoading && (
            <LoaderOverlay>
              <Loader variant="primary" size="large" />
            </LoaderOverlay>
            )}
          </div>
        </ResultContainer>
      )}
    </div>
  );
};

export function sortDataColumn(state, column) {
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
    type: state.columnSort[column].desc ? 'Asc' : 'Desc',
  };
}

const NoDataInTable = () => (
  <NoAnalisysSelected>
    <EmptyDocumentIcon />
    <span>{t('resultadoDaAnalise')}</span>
    <p>
      {t('tabelaSemDados')}
    </p>
  </NoAnalisysSelected>
);
