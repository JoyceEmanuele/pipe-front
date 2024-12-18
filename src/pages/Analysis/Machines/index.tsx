import { Card } from '~/components/Card';
import {
  ResultContainer,
  NoAnalisysSelected,
  AnalisysResult,
  LoaderOverlay,
  TableWrapper,
} from '../../General/styles';
import { useStateVar } from '~/helpers/useStateVar';
import {
  ArrowDownAnalisys,
  ColumnIcon,
  ExportIcon,
  FoldedSheet,
  GreatSignalIcon,
  MachineIcon,
  MonitoramentoIcon,
  NoWifi,
  ProgIcon,
} from '~/icons';
import { useEffect, useState } from 'react';
import { apiCall, apiCallDownload } from '~/providers';
import {
  Button,
  Loader, ModalWindow, Table,
} from '~/components';
import { toast } from 'react-toastify';
import {
  formatValue,
  StringLabel,
} from '../../General/TableConfigs';
import { GenerateItemColumn } from '~/components/Table';
import { ColumnTable } from '~/metadata/ColumnTable.model';
import { t } from 'i18next';
import { EmptyDocumentIcon } from '~/icons/EmptyDocumentIcon';
import {
  ButtonOptions, ColumnTotalValues, ContainerButtonOpen, DataExportRow, IconWrapper, ResultsResume,
  SelectOptionStyled,
} from './styles';
import { Flex } from 'reflexbox';
import Pagination from 'rc-pagination';
import ModalOrderColumns from '~/components/ModalOrderColumns';
import { reorderList } from '~/helpers/reorderList';
import { healthLevelColor } from '~/components/HealthIcon';
import {
  ArrowValue,
  ColumnTemperature, controlColumnsMachineConfigs, formatHealthIcon, GenerateColorIcon, GenerateColumnValue, GenerateColumnValueEco, GenerateConectionIcon, GenerateIconAutomationValue, GenerateItemColumnArrow,
  LinkedStringLabel,
  LinkedStringLabelMachine,
  totalParametersColumns,
  transformScheduleData,
  transformScheduleExceptionData,
  ValueMachineConection,
  ValueMachineControlMode,
  ValueMachineHealth,
  ValueMachineTypeFormated,
  ValueNumberFormatComma,
  ValueProgDayWeek,
  valuesControlMode,
  valuesControlState,
  ValueStateAssetMachine,
  ValueStateMachine,
} from './TableConfig';
import { ExceptionDut, ScheduleDut } from '~/providers/types/api-private';
import { DutSchedulesList } from '../SchedulesModals/DUT_SchedulesList';
import { getUserProfile } from '~/helpers/userProfile';
import { generateNameFormatted } from '~/helpers/titleHelper';
import { Helmet } from 'react-helmet';
import { AnalysisLayout } from '../AnalysisLayout';
import { formatNumberWithFractionDigits } from '../../../helpers/thousandFormatNumber';

const healthValues = [{
  value: 100,
  parameter: 'TOTAL_H_INDEX100',
},
{
  value: 75,
  parameter: 'TOTAL_H_INDEX75',
},
{
  value: 50,
  parameter: 'TOTAL_H_INDEX50',
},
{
  value: 25,
  parameter: 'TOTAL_H_INDEX25',
},
{
  value: 2,
  parameter: 'TOTAL_H_INDEX2',
},
{
  value: 4,
  parameter: 'TOTAL_H_INDEX4',
}];

export const MachinesAnalisys = (): JSX.Element => {
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const [profile] = useState(getUserProfile);
  const isAdmin = profile.permissions?.isAdminSistema;
  const hasOneClient = !isAdmin;
  const [showModalOrderColumns, setShowModalOrderColumns] = useState(false);
  const [controlColumns, setControlColumns] = useState<{
    id: string;
    visible: boolean;
    label: string;
  }[]>([]);
  const [exportColumns, setExportColumns] = useState<string[]>(controlColumnsMachineConfigs.filter((column) => !column.id.startsWith('LAST_PROG')).map((col) => col.id));
  const [state, render, setState] = useStateVar({
    showModelsCard: true,
    showTableCard: true,
    haveAnalisysResult: false,
    isFirstReload: false,
    isLoadingTotal: false,
    isLoadingTable: false,
    isLoadingModal: false,
    showSched: false,
    isMonitoring: true,
    openInfoMachine: false,
    totalItems: {
      TOTAL_CAPACITY_PWR: 0,
      TOTAL_MACHINE_KW: 0,
      TOTAL_UNITS: 0,
      TOTAL_ASSETS: 0,
      TOTAL_CITY: 0,
      TOTAL_STATE: 0,
      TOTAL_MACHINES: 0,
      TOTAL_H_INDEX100: 0,
      TOTAL_H_INDEX50: 0,
      TOTAL_H_INDEX75: 0,
      TOTAL_H_INDEX25: 0,
      TOTAL_H_INDEX2: 0,
      TOTAL_H_INDEX4: 0,
      TOTAL_H_INDEX_NULL: 0,
      TOTAL_ONLINE: 0,
      TOTAL_OFFLINE: 0,
    },
    schedInfo: {
      device: '',
      sched: null,
      setpoint: 0,
      operationMode: null,
      unit: null,
      client: null,
      enableEco: 0,
    },
    DUTS_SCHEDULES: [] as ScheduleDut[],
    DUTS_EXCEPTIONS: [] as ExceptionDut[],
    listMachine: [] as any,
    filtersData: {} as any,
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
      machines: {
        label: t('maquinas'),
        values: [],
      },
      machinesTypes: {
        label: t('tipoMaquina'),
        values: [],
      },
      operationModes: {
        label: t('modoOperacao'),
        values: [],
      },
      stateDev: {
        label: t('status'),
        values: [],
      },
      tempAmb: {
        label: t('tempAmb'),
        values: [],
      },
      health: {
        label: t('saudeAtual'),
        values: [],
      },
    } as any,
    filterAll: {
      clients: false,
      states: false,
      cities: false,
      units: false,
      machines: false,
      machinesTypes: false,
      operationModes: false,
      stateDev: false,
      tempAmb: false,
      health: false,
    },
    columnSort: {
      CLIENT_NAME: {
        column: 'CLIENT_NAME',
        desc: false,
      },
      STATE_NAME: {
        column: 'STATE_NAME',
        desc: false,
      },
      CITY_NAME: {
        column: 'CITY_NAME',
        desc: false,
      },
      UNIT_NAME: {
        column: 'UNIT_NAME',
        desc: false,
      },
      MACHINE_NAME: {
        column: 'MACHINE_NAME',
        desc: false,
      },
      tipoMaquina: {
        column: 'tipoMaquina',
        desc: false,
      },
      TEMPERATURE1: {
        column: 'TEMPERATURE1',
        desc: false,
      },
      TOTAL_DEV_COUNT: {
        column: 'TOTAL_DEV_COUNT',
        desc: false,
      },
      conexao: {
        column: 'conexao',
        desc: false,
      },
      MCHN_BRAND: {
        column: 'MCHN_BRAND',
        desc: false,
      },
      DEV_AUT: {
        column: 'DEV_AUT',
        desc: false,
      },
      TEMPERATURE: {
        column: 'TEMPERATURE',
        desc: false,
      },
      SETPOINT: {
        column: 'SETPOINT',
        desc: false,
      },
      saudeAtual: {
        column: 'saudeAtual',
        desc: false,
      },
      STATE: {
        column: 'STATE',
        desc: false,
      },
      MODE: {
        column: 'MODE',
        desc: false,
      },
      MODEL: {
        column: 'MODEL',
        desc: false,
      },
      TOTAL_CAPACITY_CONDENSER: {
        column: 'TOTAL_CAPACITY_CONDENSER',
        desc: false,
      },
      RATED_POWER: {
        column: 'RATED_POWER',
        desc: false,
      },
      LAST_PROG: {
        column: 'LAST_PROG',
        desc: false,
      },
    },
    currentSort: {
      field: 'CLIENT_NAME',
      type: 'asc',
    },
    pagination: {
      itemsPerPage: 10,
      totalItems: 0,
      currentPage: 1,
    },
    arrowValue: false,
  });

  const columnsTable = [
    ...(!hasOneClient ? [{
      Header: () => (
        GenerateItemColumn(t('cliente'), 'CLIENT_NAME', handleSortData, state.columnSort.CLIENT_NAME, {
          hasFilter: true,
          options: state.filtersData.clients,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.clients?.length === state.selectedFilters.clients.length,
          value: state.selectedFilters.clients.values,
        })
      ),
      accessor: 'CLIENT_NAME',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.CLIENT_NAME, `CLIENT_NAME-${props.row.original.unitId}`),
    }] : []),
    {
      Header: () => (
        GenerateItemColumn(t('estado'), 'STATE_NAME', handleSortData, state.columnSort.STATE_NAME, {
          hasFilter: true,
          options: state.filtersData.states,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.states?.length === state.selectedFilters.states.length,
          value: state.selectedFilters.states.values,
        })
      ),
      accessor: 'STATE_NAME',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.STATE_NAME, `STATE_NAME-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(t('cidade'), 'CITY_NAME', handleSortData, state.columnSort.CITY_NAME, {
          hasFilter: true,
          options: state.filtersData.cities,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.cities?.length === state.selectedFilters.cities.length,
          value: state.selectedFilters.cities.values,
        })
      ),
      accessor: 'CITY_NAME',
      disableSortBy: true,
      Cell: (props) => StringLabel(props.row.original.CITY_NAME, `CITY_NAME-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(t('unidade'), 'UNIT_NAME', handleSortData, state.columnSort.UNIT_NAME, {
          hasFilter: true,
          options: state.filtersData.units,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.units?.length === state.selectedFilters.units.length,
          value: state.selectedFilters.units.values,
        })
      ),
      accessor: 'UNIT_NAME',
      disableSortBy: true,
      Cell: (props) => LinkedStringLabel(props.row.original.UNIT_NAME, props.row.original.UNIT_ID, true),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('maquina')}`, 'MACHINE_NAME', handleSortData, state.columnSort.MACHINE_NAME, {
          hasFilter: isAdmin ? (state.selectedFilters.clients.values.length > 0 || state.selectedFilters.cities.values.length > 0 || state.selectedFilters.states.values.length > 0 || state.selectedFilters.units.values.length > 0) : true,
          options: state.filtersData.machines,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.machines?.length === state.selectedFilters.machines.length,
          value: state.selectedFilters.machines.values,
        })
      ),
      accessor: 'MACHINE_NAME',
      disableSortBy: true,
      Cell: (props) => LinkedStringLabelMachine(props.row.original.MACHINE_NAME, `/analise/maquina/${props.row.original.MACHINE_ID}/ativos`),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('tipoMaquina')}`, 'tipoMaquina', handleSortData, state.columnSort.tipoMaquina, {
          hasFilter: true,
          options: state.filtersData.machinesTypes,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.machinesTypes?.length === state.selectedFilters.machinesTypes.length,
          value: state.selectedFilters.machinesTypes.values,
        })
      ),
      accessor: 'tipoMaquina',
      disableSortBy: true,
      Cell: (props) => ValueMachineTypeFormated(props.row.original.MACHINE_TYPE, `tipoMaquina-${props.row.original.unitId}`),
    },
    // {
    //   Header: () => (
    //     GenerateItemColumn(t('status'), 'STATE', handleSortData, state.columnSort.STATE, {
    //       hasFilter: true,
    //       options: state.filtersData.stateDev,
    //       onChangeFilter: handleChangeFilters,
    //       onSelectAllOptions: handleSelectAllFilters,
    //       filterAll: state.filtersData.stateDev?.length === state.selectedFilters.stateDev.length,
    //       value: state.selectedFilters.stateDev.values,
    //     })
    //   ),
    //   accessor: 'STATE',
    //   disableSortBy: true,
    //   Cell: (props) => ValueStateMachine(props.row.original.STATE, props.row.original.STATE_CONN),
    // },
    {
      Header: () => (
        GenerateItemColumn(t('saudeAtual'), 'saudeAtual', handleSortData, state.columnSort.saudeAtual, {
          hasFilter: true,
          options: state.filtersData.health,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.health?.length === state.selectedFilters.health.length,
          renderOption,
          value: state.selectedFilters.health.values,
        }, true)
      ),
      accessor: 'saudeAtual',
      disableSortBy: false,
      Cell: (props) => ValueMachineHealth(props.row.original.ASSETS, `${props.row.original.MACHINE_ID}_ASSET_HEALTHS`),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('setpoint')}`, 'SETPOINT', handleSortData, state.columnSort.SETPOINT)
      ),
      accessor: 'SETPOINT',
      disableSortBy: true,
      Cell: (props) => ColumnTemperature(props.row.original.SETPOINT, true, 'ONLINE'),
    },
    // {
    //   Header: () => (
    //     GenerateItemColumn(t('tempAmb'), 'TEMPERATURE', handleSortData, state.columnSort.TEMPERATURE, {
    //       hasFilter: true,
    //       options: state.filtersData.tempAmb,
    //       onChangeFilter: handleChangeFilters,
    //       onSelectAllOptions: handleSelectAllFilters,
    //       filterAll: state.filtersData.tempAmb?.length === state.selectedFilters.tempAmb.length,
    //       value: state.selectedFilters.tempAmb.values,
    //     })
    //   ),
    //   accessor: 'TEMPERATURE',
    //   disableSortBy: true,
    //   Cell: (props) => ColumnTemperature(props.row.original.TEMPERATURE, false, props.row.original.STATE_CONN, props.row.original.ENVIRONMENT_NAME, props.row.original.TUSEMIN, props.row.original.TUSEMAX, true),
    // },
    // {
    //   Header: () => (
    //     GenerateItemColumn(`${t('tempRetorno')}`, 'TEMPERATURE1', handleSortData, state.columnSort.TEMPERATURE1, undefined, undefined, { tooltipId: 'tempRetorno', title: t('temperaturaRetorno'), text: t('temperatureRetornoInfo') })
    //   ),
    //   accessor: 'TEMPERATURE1',
    //   disableSortBy: true,
    //   Cell: (props) => ColumnTemperature(props.row.original.TEMPERATURE1, false, props.row.original.STATE_CONN, props.row.original.ENVIRONMENT_NAME, props.row.original.TUSEMIN, props.row.original.TUSEMAX),
    // },
    {
      Header: () => (
        GenerateItemColumn(`${t('automacao')}`, 'DEV_AUT', handleSortData, state.columnSort.DEV_AUT)
      ),
      accessor: 'DEV_AUT',
      disableSortBy: true,
      Cell: (props) => GenerateIconAutomationValue({
        value: props.row.original.DEV_AUT,
        prog: props.row.original.LAST_PROG,
        setpoint: props.row.original.SETPOINT,
        operationMode: props.row.original.MODE,
        enableEco: props.row.original.ENABLE_ECO,
        setState,
        render,
        client: props.row.original.CLIENT_ID,
        unit: props.row.original.UNIT_ID,
      }),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('modoOperacao')}`, 'MODE', handleSortData, state.columnSort.MODE, {
          hasFilter: true,
          options: state.filtersData.operationModes,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filtersData.operationModes?.length === state.selectedFilters.operationModes.length,
          value: state.selectedFilters.operationModes.values,
        })
      ),
      accessor: 'MODE',
      disableSortBy: true,
      Cell: (props) => ValueMachineControlMode(props.row.original.MODE, props.row.original.DEV_AUT, props.row.original.ENABLE_ECO, `${props.row.original.MACHINE_ID}${props.row.original.MODE}_OPERATION_MODE`),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.seg')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_MON',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'mon', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.ter')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_TUE',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'tue', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.qua')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_WED',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'wed', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.qui')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_THU',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'thu', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.sex')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_FRI',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'fri', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.sab')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_SAT',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'sat', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('diasDaSemana.dom')}`, 'LAST_PROG', handleSortData, state.columnSort.LAST_PROG, undefined, true)
      ),
      accessor: 'LAST_PROG_SUN',
      disableSortBy: true,
      Cell: (props) => ValueProgDayWeek(props.row.original.LAST_PROG, 'sun', props.row.original.DEV_AUT, props.row.original.DUT_MULT_SCHEDULE_DAYS),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('conexao')}`, 'conexao', handleSortData, state.columnSort.conexao, undefined, true)
      ),
      accessor: 'conexao',
      disableSortBy: false,
      Cell: (props) => ValueMachineConection(props.row.original.ASSETS, props.row.original.STATE_CONN, props.row.original.DEV_AUT, `conexao-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('dispositivos')}`, 'TOTAL_DEV_COUNT', handleSortData, state.columnSort.TOTAL_DEV_COUNT)
      ),
      accessor: 'TOTAL_DEV_COUNT',
      disableSortBy: true,
      Cell: (props) => GenerateColumnValue(props.row.original.TOTAL_DEV_COUNT, '0px 36px'),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('fabricante')}`, 'MCHN_BRAND', handleSortData, state.columnSort.MCHN_BRAND)
      ),
      accessor: 'MCHN_BRAND',
      disableSortBy: true,
      Cell: (props) => GenerateColumnValue(props.row.original.MCHN_BRAND, '0px 11px'),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('modelo')}`, 'MODEL', handleSortData, state.columnSort.MODEL)
      ),
      accessor: 'MODEL',
      disableSortBy: true,
      Cell: (props) => GenerateColumnValue(props.row.original.MODEL, '0px 19px'),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('capRefrig')}`, 'TOTAL_CAPACITY_CONDENSER', handleSortData, state.columnSort.TOTAL_CAPACITY_CONDENSER)
      ),
      accessor: 'TOTAL_CAPACITY_CONDENSER',
      disableSortBy: true,
      Cell: (props) => ValueNumberFormatComma(props.row.original.TOTAL_CAPACITY_CONDENSER, ' TR', `TOTAL_CAPACITY_CONDENSER-${props.row.original.unitId}`),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('potencia')}`, 'RATED_POWER', handleSortData, state.columnSort.RATED_POWER)
      ),
      accessor: 'RATED_POWER',
      disableSortBy: true,
      Cell: (props) => ValueNumberFormatComma(props.row.original.RATED_POWER, 'kW', `RATED_POWER-${props.row.original.unitId}`, '0px 17px'),
    },
  ];

  const columnsSubTable = {
    MACHINE_NAME: {
      name: t('ativo'),
      value: 'ASSET_NAME',
      Cell: (value, machineId, device, assetId) => LinkedStringLabelMachine(value, `/analise/maquina/${machineId}/ativos/${device || assetId}/informacoes`),
    },
    TOTAL_CAPACITY_CONDENSER: {
      name: '',
      value: 'CAPACITY_PWR',
      Cell: (value) => ValueNumberFormatComma(value, 'TR', `TOTAL_CAPACITY_CONDENSER-${value}_subtable`),
    },
    RATED_POWER: {
      name: '',
      value: 'MACHINE_KW',
      Cell: (value) => ValueNumberFormatComma(value, 'kW', `RATED_POWER-${value}_subtable`, '0px 17px'),
    },
    MCHN_BRAND: {
      name: '',
      value: 'MCHN_BRAND',
      Cell: (value) => GenerateColumnValue(value, '0px 12px'),
    },
    tipoMaquina: {
      name: t('funcao'),
      value: 'AST_ROLE_NAME',
      Cell: (value) => GenerateColumnValue(value),
    },
    STATE: {
      name: t('status'),
      value: 'STATE',
      Cell: (value, _a, _b, _c, type, conn) => ValueStateAssetMachine(value, type, conn),
    },
    saudeAtual: {
      name: t('saudeAtual'),
      value: 'H_INDEX',
      Cell: (value) => GenerateColorIcon(value),
      padding: '0px 7px',
    },
    TOTAL_DEV_COUNT: {
      name: t('dispositivos'),
      value: 'DEVICE_CODE',
      Cell: (value) => LinkedStringLabel(value, `${value}_sub_table`, false),
      padding: '0px 7px',
    },
    MODEL: {
      name: t('modelo'),
      value: 'MODEL',
      Cell: (value) => GenerateColumnValue(value, '0px 19px'),
      padding: '0px 19px',
    },
    conexao: {
      name: t('conexao'),
      value: 'STATUS_WIFI',
      Cell: (value) => GenerateConectionIcon(value),
      padding: '0px 15px',
    },
  };
  const filterColumns = (columns, filterLastProg, controlColumnsFilter) => {
    let newColumnsData = controlColumnsFilter.map((column) => {
      if (column.visible === true) {
        return columns.find((columnTable) => columnTable && columnTable.accessor === column.id) ?? false;
      }
      return false;
    });
    if (filterLastProg) {
      newColumnsData = newColumnsData.filter((item) => item && !item.accessor?.startsWith('LAST_PROG'));
    }
    return newColumnsData;
  };

  const [columnsData, setColumnsData] = useState<(boolean | ColumnTable | undefined)[]>([]);

  async function getData() {
    setState({ isLoadingTable: true, isFirstReload: false });
    try {
      const filterParams = setFiltersAndReturn();
      await getTotalInfoMachines(filterParams);
      await getMachineList(filterParams);
    } catch (err) {
      toast.error(t('houveErroBuscandoAnaliseDasMaquinas'));
    }
    setState({ isLoadingTable: false });
  }

  const getFilters = async (first = false) => {
    try {
      const filterParams = setFiltersAndReturn();
      const filters = await apiCall('/unit/get-filters-analyse-machines', filterParams);
      state.filtersData = {
        clients: !first ? state.filtersData.clients : filters.CLIENTS.map((client) => ({ name: client.CLIENT_NAME, value: client.CLIENT_ID })),
        states: filters.STATES.map((state) => ({ name: state.STATE_NAME, value: state.STATE_ID })),
        cities: filters.CITIES.map((city) => ({ name: city.CITY_NAME, value: city.CITY_ID })),
        units: filters.UNITS.map((unit) => ({ name: unit.UNIT_NAME, value: unit.UNIT_ID })),
        machines: filters.MACHINES.map((unit) => ({ name: unit.MACHINE_NAME, value: unit.MACHINE_ID })),
        machinesTypes: filters.MACHINES_TYPES?.map((type) => ({ name: type.MACHINE_TYPE, value: type.ID })),
        operationModes: Object.entries(valuesControlMode).filter(([, mode]) => !mode.hide).map(([key, mode]) => ({
          name: mode.name,
          value: mode.tags,
        })),
        stateDev: Object.entries(valuesControlState).filter(([, mode]) => !mode.hide).map(([key, mode]) => ({
          name: mode.name,
          value: mode.tags,
        })),
        tempAmb: [{ name: t('acima'), value: 'acima' }, { name: t('correta'), value: 'correta' }, { name: t('abaixo'), value: 'abaixo' }, { name: t('semInfo'), value: 'sem info' }],
        health: [{ name: t('operandoCorretamente'), value: 100, icon: formatHealthIcon(100) }, { name: t('foraDeEspecificacao'), value: 75, icon: formatHealthIcon(75) }, { name: t('riscoIminente'), value: 50, icon: formatHealthIcon(50) }, { name: t('manutencaoUrgente'), value: 25, icon: formatHealthIcon(25) }, { name: t('maquinaDesativada'), value: 4, icon: formatHealthIcon(4) }, { name: t('equipamentoOffline'), value: 2, icon: formatHealthIcon(2) }],
      };
      return filterParams;
    } catch (err) {
      toast.error(t('erroBuscarFiltros'));
    }
    render();
  };

  const getTotalInfoMachines = async (filterParams) => {
    try {
      const items = await apiCall('/unit/get-total-analyse-machines', filterParams);
      setState({
        totalItems: {
          TOTAL_CAPACITY_PWR: items.TOTAL_CAPACITY_PWR,
          TOTAL_MACHINE_KW: items.TOTAL_MACHINE_KW,
          TOTAL_ASSETS: items.TOTAL_ASSETS,
          TOTAL_UNITS: items.TOTAL_UNITS,
          TOTAL_CITY: items.TOTAL_CITY,
          TOTAL_STATE: items.TOTAL_STATE,
          TOTAL_MACHINES: items.TOTAL_MACHINES,
          TOTAL_H_INDEX100: items.TOTAL_H_INDEX100,
          TOTAL_H_INDEX50: items.TOTAL_H_INDEX50,
          TOTAL_H_INDEX75: items.TOTAL_H_INDEX75,
          TOTAL_H_INDEX25: items.TOTAL_H_INDEX25,
          TOTAL_H_INDEX2: items.TOTAL_H_INDEX2,
          TOTAL_H_INDEX4: items.TOTAL_H_INDEX4,
          TOTAL_H_INDEX_NULL: items.TOTAL_H_INDEX_NULL,
          TOTAL_ONLINE: items.TOTAL_ONLINE,
          TOTAL_OFFLINE: items.TOTAL_OFFLINE,
        },
        haveAnalisysResult: true,
        isLoadingTotal: false,
      });
      state.pagination.totalItems = items.TOTAL_MACHINES;
      render();
    } catch (err) {
      toast.error(t('houveErroBuscandoTotalDeMaquinas'));
    }
  };

  const setFiltersAndReturn = () => {
    const itemsStateDev = [] as string[];
    const itemsOperationModes = [] as string[];
    state.selectedFilters.stateDev.values?.map((filter) => filter.value?.forEach((item) => itemsStateDev.push(item)));
    state.selectedFilters.operationModes.values?.map((filter) => filter.value?.forEach((item) => itemsOperationModes.push(item)));
    const filterParams = {
      unitIds: state.selectedFilters.units.values?.map((filter) => filter.value),
      stateIds: state.selectedFilters.states.values?.map((filter) => filter.value),
      cityIds: state.selectedFilters.cities.values?.map((filter) => filter.value),
      clientIds: state.selectedFilters.clients.values?.map((filter) => filter.value),
      groupIds: state.selectedFilters.machines.values?.map((filter) => filter.value),
      machinesTypes: state.selectedFilters.machinesTypes.values?.map((filter) => filter.value),
      ordered: state.currentSort.field,
      typeOrdered: state.currentSort.type?.toUpperCase(),
      onlyAut: !state.isMonitoring,
      operation_modes: itemsOperationModes,
      stateDev: itemsStateDev,
      tempAmb: state.selectedFilters.tempAmb.values?.map((filter) => filter.value),
      health: state.selectedFilters.health.values?.map((filter) => filter.value),
    };
    return filterParams;
  };

  const getMachineList = async (filterParams, resetPage?) => {
    try {
      const sortParams = {} as {orderByField: string, orderByType: string };
      const filterParamsSet = filterParams;
      if (state.currentSort.field && state.currentSort.type) {
        sortParams.orderByField = state.currentSort.field;
        sortParams.orderByType = state.currentSort.type;
      }
      const listMachineOriginal = await apiCall('/unit/get-list-analyse-machines', { offset: (state.pagination.currentPage - 1) * 10, ...filterParamsSet });
      const listMachine = listMachineOriginal.map((item) => ({ ...item, toogleAsset: false }));
      setState({
        listMachine,
        isLoadingTable: false,
      });
      state.arrowValue = false;
      if (resetPage) {
        state.pagination.currentPage = 1;
      }
      render();
    } catch (error) {
      console.log(error);
      toast.error(t('houveErroBuscandoAsAnalises'));
      render();
    }
  };

  const handleChangeFilters = async (name, filters) => {
    let filterClient = false;
    switch (name) {
      case t('cliente'):
        state.selectedFilters.clients.values = filters.map((filter) => state.filtersData.clients.find((filterData) => filterData.value === filter));
        break;
      case t('estado'):
        state.selectedFilters.states.values = filters.map((filter) => state.filtersData.states.find((filterData) => filterData.value === filter));
        filterClient = true;
        break;
      case t('cidade'):
        state.selectedFilters.cities.values = filters.map((filter) => state.filtersData.cities.find((filterData) => filterData.value === filter));
        filterClient = true;
        break;
      case t('unidade'):
        state.selectedFilters.units.values = filters.map((filter) => state.filtersData.units.find((filterData) => filterData.value === filter));
        break;
      case t('maquina'):
        state.selectedFilters.machines.values = filters.map((filter) => state.filtersData.machines.find((filterData) => filterData.value === filter));
        break;
      case t('tipoMaquina'):
        state.selectedFilters.machinesTypes.values = filters.map((filter) => state.filtersData.machinesTypes.find((filterData) => filterData.value === filter));
        break;
      case t('modoOperacao'):
        state.selectedFilters.operationModes.values = filters.map((filter) => state.filtersData.operationModes.find((filterData) => filterData.value === filter));
        break;
      case t('status'): {
        state.selectedFilters.stateDev.values = filters.map((filter) => state.filtersData.stateDev.find((filterData) => filterData.value === filter));
        break;
      }
      case t('tempAmb'):
        state.selectedFilters.tempAmb.values = filters.map((filter) => state.filtersData.tempAmb.find((filterData) => filterData.value === filter));
        break;
      case t('saudeAtual'):
        state.selectedFilters.health.values = filters.map((filter) => state.filtersData.health.find((filterData) => filterData.value === filter));
        break;
      default:
        break;
    }
    state.pagination.currentPage = 1;
    await handleGetFilters(filterClient);
    render();
  };

  const filterMappings = {
    [t('cliente')]: { filterKey: 'clients', filterAllKey: 'clients' },
    [t('estado')]: { filterKey: 'states', filterAllKey: 'states' },
    [t('cidade')]: { filterKey: 'cities', filterAllKey: 'cities' },
    [t('unidade')]: { filterKey: 'units', filterAllKey: 'units' },
    [t('maquina')]: { filterKey: 'machines', filterAllKey: 'machines' },
    [t('tipoMaquina')]: { filterKey: 'machinesTypes', filterAllKey: 'machinesTypes' },
    [t('modoOperacao')]: { filterKey: 'operationModes', filterAllKey: 'operationModes' },
    [t('status')]: { filterKey: 'stateDev', filterAllKey: 'stateDev' },
    [t('tempAmb')]: { filterKey: 'tempAmb', filterAllKey: 'tempAmb' },
    [t('saudeAtual')]: { filterKey: 'health', filterAllKey: 'health' },
  };

  const renderOption = (propsOption, option, _snapshot) => (
    <SelectOptionStyled
      {...propsOption}
      type="button"
      selected={_snapshot.selected}
    >
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {option.icon}
        <span>{option.name}</span>
      </div>
    </SelectOptionStyled>
  );

  const handleSelectAllFilters = async (name, filterAll) => {
    const mapping = filterMappings[name];

    if (mapping) {
      state.selectedFilters[mapping.filterKey].values = filterAll ? state.filtersData[mapping.filterKey] : [];
      state.filterAll[mapping.filterAllKey] = filterAll;
    }

    await handleGetFilters();
    render();
  };

  const handleSortData = async (column) => {
    setState({ isLoadingTable: true, isLoadingTotal: true });
    sortDataColumn(state, column);
    const filterParams = setFiltersAndReturn();
    await getMachineList(filterParams, true);
    render();
    setState({ isLoadingTable: false, isLoadingTotal: false });
  };

  const handleGetFilters = async (filter = false) => {
    setState({ isLoadingTable: true, isLoadingTotal: true, isFirstReload: false });
    try {
      await getFilters(filter);
      await getData();
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesFiltros'));
    }
    setState({ isLoadingTable: false, isLoadingTotal: false });
    render();
  };

  const handleRemoveAllFilters = async () => {
    state.selectedFilters.clients.values = [];
    state.selectedFilters.states.values = [];
    state.selectedFilters.cities.values = [];
    state.selectedFilters.units.values = [];
    state.selectedFilters.machines.values = [];
    state.selectedFilters.machinesTypes.values = [];
    state.selectedFilters.operationModes.values = [];
    state.selectedFilters.stateDev.values = [];
    state.selectedFilters.tempAmb.values = [];
    state.selectedFilters.health.values = [];
    await handleGetFilters();
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
        return columnsTable.find((columnTable) => columnTable && columnTable.accessor === column.id) ?? false;
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
        return columnsTable.find((columnTable) => {
          if (columnTable && typeof columnTable !== 'boolean') {
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

  const handleRemoveCategoryFilter = async (columnKey: string) => {
    state.selectedFilters[columnKey].values = [];

    await handleGetFilters();
    render();
  };

  const handleRemoveFilter = async (columnKey: string, filterIndex: number) => {
    state.selectedFilters[columnKey].values.splice(filterIndex, 1);

    await handleGetFilters();
    render();
  };

  async function toogleMonitoring() {
    setState({ isMonitoring: !state.isMonitoring });
    setState({ pagination: { ...state.pagination, currentPage: 1 } });
    await getInfos();
    render();
  }

  async function getInfos() {
    setState({ isLoadingTable: true });
    await getFilters(state.isFirstReload);
    if (!state.isFirstReload) {
      await getData();
    }
    setState({ isLoadingTable: false });
  }

  async function getSchedDut(device: string, client: number | null, unit: number | null) {
    try {
      if (!client || !unit) {
        toast.error(t('houveErroBuscandoProgramações'));
        return;
      }
      setState({ isLoadingModal: true });
      const sched = await apiCall('/dut/get-dut-schedules', { DUT_ID: device, CLIENT_ID: client, UNIT_ID: unit });
      state.DUTS_SCHEDULES = sched.schedules;
      const excep = await apiCall('/dut/get-dut-exceptions', { DUT_ID: device, CLIENT_ID: client, UNIT_ID: unit });
      state.DUTS_EXCEPTIONS = excep.exceptions;
      render();
    } catch (err) {
      toast.error(t('houveErroBuscandoProgramações'));
      setState({ showSched: false });
    }
    setState({ isLoadingModal: false });
  }

  async function handleChangePagination(current) {
    setState({ isLoadingTable: true });
    state.pagination.currentPage = current;
    const filterParams = setFiltersAndReturn();
    await getMachineList(filterParams);
    setState({ isLoadingTable: false });
    render();
  }

  async function handleExportMachineAnalysis() {
    try {
      setState({ isLoadingTable: true });
      render();

      const sortParams = {} as {orderByField: string, orderByType: string };

      if (state.currentSort.field && state.currentSort.type) {
        sortParams.orderByField = state.currentSort.field;
        sortParams.orderByType = state.currentSort.type;
      }

      const filterParams = setFiltersAndReturn();

      const exportResponse = await apiCallDownload('/machines/export-machines-analysis-list', {
        columnsToExport: exportColumns,
        haveProg: state.isMonitoring,
        ...sortParams,
        ...filterParams,
      });

      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || `${t('nomeArquivoAnaliseMaquina')}.xlsx`;
      link.click();

      toast.success(t('sucessoExportacao'));
    } catch (error) {
      console.log(error);
      toast.error(t('naoFoiPossivelExportar'));
    } finally {
      setState({ isLoadingTable: false });
      render();
    }
  }

  useEffect(() => {
    setState({ isFirstReload: true });
    getInfos();
    if (hasOneClient) {
      setControlColumns(controlColumns.filter((item) => item.id !== 'CLIENT_NAME'));
    }
    setColumnsData(filterColumns(columnsTable, state.isMonitoring, controlColumns));
  }, []);

  useEffect(() => {
    if (state.schedInfo.sched) {
      if (state.schedInfo.device.startsWith('DUT')) {
        state.DUTS_EXCEPTIONS = [];
        state.DUTS_SCHEDULES = [];
        getSchedDut(state.schedInfo.device, state.schedInfo.client, state.schedInfo.unit);
      } else {
        setState({ DUTS_SCHEDULES: transformScheduleData(JSON.parse(state.schedInfo.sched), state.schedInfo), DUTS_EXCEPTIONS: transformScheduleExceptionData(JSON.parse(state.schedInfo.sched), state.schedInfo) });
      }
    }
  }, [state.schedInfo.device]);

  useEffect(() => {
    let controlDataFiltered = controlColumnsMachineConfigs.filter((column) => !column.id?.startsWith('LAST_PROG'));
    if (!state.isMonitoring) {
      controlDataFiltered = controlColumnsMachineConfigs;
    }
    if (hasOneClient) {
      controlDataFiltered = controlDataFiltered.filter((item) => item.id !== 'CLIENT_NAME');
    }
    setControlColumns(controlDataFiltered);
    setExportColumns(controlDataFiltered.map((col) => col.id));
    setColumnsData(filterColumns(columnsTable, state.isMonitoring, controlDataFiltered));
  }, [state.isMonitoring]);

  const IsFirstReloadComponent = () => (
    <NoAnalisysSelected>
      <FoldedSheet width="21" height="27" color="#7D7D7D" />
      <span>{t('resultadoDaAnalise')}</span>
      <p>
        {t('botaoOuUtilizeFiltros')}
        <br />
        {t('ouFiltros')}
      </p>
      <div style={{ marginTop: 5 }} onClick={() => getData()}>
        <Button
          style={{
            display: 'flex',
            alignItems: 'center',
            textTransform: 'capitalize',
            justifyContent: 'center',
            fontSize: 11,
            padding: '4px 17px',
            borderRadius: 7,
          }}
          type="button"
          variant="primary"
        >
          {t('analisar')}
        </Button>
      </div>
    </NoAnalisysSelected>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Helmet>
        <title>{generateNameFormatted('Celsius 360', t('maquinas'))}</title>
      </Helmet>
      {state.showTableCard && (
        <ResultContainer>
          <DataExportRow>
            <div style={{
              display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap',
            }}
            >
              {/* <ButtonOptions disabled={state.isLoadingTable || state.isLoadingTotal}>
                <MachineIcon />
                <p style={{ margin: '0%' }}>{t('maquinas')}</p>
                <ArrowDownAnalisys />
              </ButtonOptions> */}
              <MonitoringButton isMonitoring={state.isMonitoring} toogleIsMonitoring={toogleMonitoring} state={state} />
              <ButtonOptions
                onClick={() => setShowModalOrderColumns(!showModalOrderColumns)}
                disabled={state.isLoadingTable || state.isLoadingTotal}
              >
                <ColumnIcon />
                <p style={{ margin: '0%' }}>{t('colunas')}</p>
              </ButtonOptions>
              <a href="#" style={{ display: 'none' }} id="downloadLink" />
              <ButtonOptions onClick={() => { handleExportMachineAnalysis(); }} disabled={state.isLoadingTable}>
                <ExportIcon />
                <p style={{ margin: '0%' }}>{t('botaoExportar')}</p>
              </ButtonOptions>
            </div>
          </DataExportRow>
          <div style={{ position: 'relative' }}>
            <AnalisysResult>
              {
                state.haveAnalisysResult && (
                  <ResultsResume>
                    {
                      totalParametersColumns.map((item) => (
                        <ColumnTotalValues key={item.value}>
                          <b>{item.column}</b>
                          <p>
                            {item.unit ? <strong>{state.totalItems[item.value] ? formatValue(state.totalItems[item.value], '', '') : '0'}</strong> : <>{formatNumberWithFractionDigits(state.totalItems[item.value] ?? '-')}</>}
                            {' '}
                            {item.unit}
                          </p>
                        </ColumnTotalValues>
                      ))
                    }
                    <ColumnTotalValues>
                      <b>{`${t('saudeAtual')} (${formatNumberWithFractionDigits(state.totalItems.TOTAL_H_INDEX100 + state.totalItems.TOTAL_H_INDEX25 + state.totalItems.TOTAL_H_INDEX50 + state.totalItems.TOTAL_H_INDEX75 + state.totalItems.TOTAL_H_INDEX2 + state.totalItems.TOTAL_H_INDEX4)})`}</b>
                      <div style={{ display: 'grid', gap: 5, gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
                        {
                          healthValues.map((item) => (
                            <ColumnTotalValues key={item.value}>
                              <IconWrapper style={{ backgroundColor: healthLevelColor(item.value) }}>
                                {formatHealthIcon(item.value)}
                              </IconWrapper>
                              {formatNumberWithFractionDigits(state.totalItems[item.parameter] ?? '-')}
                            </ColumnTotalValues>
                          ))
                        }
                      </div>
                    </ColumnTotalValues>
                    <ColumnTotalValues>
                      <b>{t('conexao')}</b>
                      <div
                        style={{
                          display: 'grid', gap: 5, alignItems: 'center', gridTemplateColumns: '1fr 1fr',
                        }}
                      >
                        <ColumnTotalValues>
                          <GreatSignalIcon width="13px" heigth="13px" />
                          {formatNumberWithFractionDigits(state.totalItems.TOTAL_ONLINE ?? '-')}
                        </ColumnTotalValues>
                        <ColumnTotalValues>
                          <NoWifi width="12px" heigth="12px" />
                          {formatNumberWithFractionDigits(state.totalItems.TOTAL_OFFLINE ?? '-')}
                        </ColumnTotalValues>
                      </div>
                    </ColumnTotalValues>
                  </ResultsResume>
                )
              }
              <div>
                <Card noPaddingRelative>
                  <>
                    {controlColumns.some(
                      (column) => column.visible === true,
                    ) ? (
                      <TableWrapper>
                        <Table
                          columns={columnsData.filter(Boolean)}
                          data={state.listMachine}
                          noDataComponent={NoDataInTable}
                          isFirstReloadComponent={IsFirstReloadComponent}
                          isFirstReload={state.isFirstReload}
                          noBorderBottom
                          handleRemoveAllFilters={handleRemoveAllFilters}
                          handleRemoveCategoryFilter={handleRemoveCategoryFilter}
                          handleRemoveFilter={handleRemoveFilter}
                          filtersSelected={state.selectedFilters}
                          haveAssets
                          haveSubTable
                          openAllSubTables={() => GenerateItemColumnArrow('ARROW', state, setState, render, state.arrowValue)}
                          subTableItem={(itemId, isOpen, haveItem) => ArrowValue(itemId, state, setState, isOpen, haveItem)}
                          columnsSubTable={columnsSubTable}
                          style={{
                            boxShadow: 'none',
                            minHeight: '200px',
                            overflowX: state.listMachine.length ? 'auto' : 'hidden',
                            overflowY: state.listMachine.length > 7 ? 'auto' : 'hidden',
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
                    onChange={(current) => handleChangePagination(current)}
                    disabled={state.isLoadingTable}
                  />
                </Flex>
              </div>
            </AnalisysResult>
            {
              state.showSched && (
                <SchedModalOpen state={state} setState={setState} isLoading={state.isLoadingModal} />
              )
            }
            {(state.isLoadingTable || state.isLoadingTotal) && (
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

function MonitoringButton({ isMonitoring, toogleIsMonitoring, state }) {
  const [openButton, setOpenButton] = useState(false);

  function verifyMonitoring(value) {
    if (value) {
      return (
        <>
          <MonitoramentoIcon />
          <p style={{ margin: '0%' }}>{t('monitoramento')}</p>
        </>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <ProgIcon size="15px" />
        <p style={{ margin: '0%' }}>{t('automacao')}</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <ButtonOptions disabled={state.isLoadingTable || state.isLoadingTotal} onClick={() => setOpenButton(true)} style={{ borderRadius: openButton ? '11px 11px 0px 0px' : '11px', minWidth: 148, justifyContent: 'space-between' }}>
        {verifyMonitoring(isMonitoring)}
        <ArrowDownAnalisys />
      </ButtonOptions>
      { openButton && (
        <>
          <ContainerButtonOpen onClick={() => { toogleIsMonitoring(); setOpenButton(false); }}>
            {verifyMonitoring(!isMonitoring)}
          </ContainerButtonOpen>
          <div
            style={{
              top: 0, bottom: 0, left: 0, right: 0, position: 'fixed', zIndex: 10,
            }}
            onClick={() => setOpenButton(false)}
          />
        </>
      )}
    </div>
  );
}

function SchedModalOpen({ state, setState, isLoading }) {
  if (isLoading) {
    return (
      <ModalWindow
        borderTop
        onClickOutside={() => {
          setState({ showSched: false });
        }}
      >
        <Loader />
      </ModalWindow>
    );
  }
  return (
    <ModalWindow
      style={{ padding: '0px', overflowX: 'hidden' }}
      onClickOutside={() => {
        setState({ showSched: false });
      }}
    >
      {
        (state.schedInfo.device && state.schedInfo.sched) && (
          <DutSchedulesList
            schedules={state.DUTS_SCHEDULES}
            exceptions={state.DUTS_EXCEPTIONS}
          />
        )
      }
    </ModalWindow>
  );
}

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
