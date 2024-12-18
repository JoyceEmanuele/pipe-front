import SelectSearch, {
  fuzzySearch,
  SelectedOptionValue,
  SelectedOption,
  SelectSearchOption,
  SelectSearchProps,
} from 'react-select-search';
import { Box, Flex } from 'reflexbox';
import { useStateVar } from '~/helpers/useStateVar';
import { Checkbox as CheckboxAnalysis } from '@material-ui/core';

import {
  SearchInput,
  Label,
  StatusIcon,
  ControlFilter,
  CleanBtn,
  ExportBtn,
  TempGreat,
  TempHigh,
  TempLow,
  NoTempData,
  OptionExportList,
  CancelButton,
  ContentDate,
  DateLabel,
  ContainerCheckbox,
  HoverExportList,
  ModalWindowStyled,
  ContainerModal,
  TitleModal,
  SubtitleModal,
  FiltersContainer,
  ContainerArea,
  ContentDateNew,
  ArrowButton,
  ContainerDateNew,
  CheckboxLine,
  TransparentLink as TransparentLinkIcon,
  RowCheckbox,
  SelectWithCheckbox,
} from './styles';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import i18n from '~/i18n';
import {
  Button, Card, Checkbox, HealthIcon, FiltersContainer as FiltersSelected,
  QuickSelectionV2,
} from '~/components';

import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import {
  ArrowDownIconV2, ArrowUpIconV2, CompleteListIcon, CustomListIcon, ExportIcon, FilterIcon, InfoIcon, LinkIcon, NewExpandIcon,
} from '~/icons';
import { colors } from '~/styles/colors';
import { CSVLink } from 'react-csv';
import { getUserProfile } from '~/helpers/userProfile';
import { QuickSelection } from '~/components/QuickSelection';
import ReactTooltip from 'react-tooltip';
import moment, { Moment } from 'moment';
import { StyledCalendarIcon } from '../../DACs/DACHistoric';
import {
  getClientsList, getCitiesList, getStatesList, getUnitsList, getCountry,
  getSupervisorsList,
  getClassesList,
} from '~/helpers/genericHelper';
import { InputSearch } from '~/components/NewInputs/Search';
import { apiCall } from '~/providers';
import DatePicker from 'react-datepicker';
import { getDatesList } from '~/helpers/dates';
import { GroupInfo } from '~/components/EnvGroupAnalysis';
import {
  StyledReactTooltip, Text, CheckboxLine as CheckBoxLineAnalysis,
  BtnClean,
} from '~/components/EnvGroupAnalysis/styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const t = i18n.t.bind(i18n);

// para usar o filtro tem que ter as variaveis criadas no state do componente:
// state.searchState
// state.selectedCity
// state.selectedState
// state.selectedUnit
// state.selectedClientFilter
// state.selectedHealthOpts
// state.selectedTemperatureOpts
// state.selectedControlOpts
// state.selectedModeEcoOpts
// state.selectedPeriodOpts
// state.selectedDataTypeOpts
// state.selectedAnalysisOpts
// state.selectedCountry
// state.selectedTrooms
// state.selectedL1s
// state.selectedTambs
// state.selectedTInmets
// state.selectedPowers
// state.selectedUtilities

export type TListFilters = 'progDisp' | 'tipo' | 'operacao' | 'cliente' | 'estado' | 'cidade' | 'unidade' | 'statusOperacao' | 'conexao' | 'status' | 'saude' | 'temperatura' | 'controle' | 'modoEco' | 'periodo' | 'data' | 'dataUnica' | 'dados' | 'analise' | 'pais' | 'id' | 'search' | 'tipoNotificacao' | 'subtipoNotificacao' | 'destinatario' | 'responsavel' | 'grupo' | 'dataNew' | 'fornecedor' | 'maquina' | 'ambiente' | 'temperaturaExterna' | 'temperaturaExternaMeteorologica' | 'utilitario' | 'potenciaAtiva';

type TValueFilter = string | string[];

type FilterColumnsSelected = {
  [key: string]: {
    label: string;
    values: {
      value: string;
      name: string
    }[]
  };
}

export const UtilFilter = (props:{
  state: any,
  updateCheckInformations?: (value: any, date?: Moment) => void,
  informationsUnits?: any,
  optionsConnetions?: SelectSearchOption[],
  optionsConnetionsName?: string,
  render: any,
  searchLabel?: string;
  onAply: () => void, // funçao para quando mudar o valor do select;
  clearFilters?: () => void, // função de limpar o filtro
  listFilters?: TListFilters[], // passar os selects que é pra ter;
  exportFunc?: () => Promise<void> | void, // usado em exportação;
  typeValueName?: TListFilters[], // usado para quando você quer que os valores sejam os nomes ou seja label e name ficam iguais;
  isProg?: boolean, // usado no select de dispostivo / programação;
  setView?: (timeSelected: string) => void, // usado no select de periodo para ter as seleções rapidas
  setProg?: (value: string) => void, // usado no select de dispostivo / programação;
  infoType?: { value: string, name: string }[],
  isFilterButton?: boolean,
  isPeriodLabel?: boolean,
  isMaxOneMonthPeriod?: boolean,
  removeYearFilter?: boolean,
  removeMonthFilter?: boolean,
  fixedPeriod?: boolean,
  margin?: boolean;
  isLoading?: boolean;
  filterFooter?: boolean;
  closeDefault?: boolean;
  l1Only?: boolean;
  handleChangePeriod?: () => void,
  includeQuickSelection?: boolean,
  unitCoordinate?: { lat: string | null; lon: string | null; }
  lengthArrayResult?: number;
  closeFilter?: boolean;
  csvHeader?: { // usado para exportação
  label: string;
  key: string;
}[]}): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: false, // setIsLoading
      showFilter: props.closeDefault != null ? !props.closeDefault : true as boolean,
      clientsListOpts: [] as { value: string, name: string, cities: string[], states: number[] }[],
      selectedClientOpts: [] as TValueFilter,
      statesListOpts: [] as { value: string, name: string }[],
      statesListFilterOpts: [] as { value: string, name: string }[],
      selectedStateOpts: [] as TValueFilter,
      citiesListFilterOpts: [] as { value: string, name: string, stateId: number }[],
      citiesListOpts: [] as { value: string, name: string, stateId: number }[],
      selectedCityOpts: [] as TValueFilter,
      unitsFilterOpts: [] as { value: string, name: string, clientId: number, city: string, state: string }[],
      unitsListOpts: [] as { value: string, name: string, clientId: number, city: string, state: string }[],
      selectedUnitOpts: [] as TValueFilter,
      supervisorListOpts: [] as { value: string, name: string, unit_ids: number[] }[],
      supervisorFilterListOpts: [] as { value: string, name: string}[],
      classesListOpts: [] as { value: string, name: string}[],
      classesNamesListOpts: [] as { value: string, name: string, class: string, units: number[] }[],
      classesNamesFilterListOpts: [] as { value: string, name: string, class: string, units: number[] }[],
      selectedSupervisorOpts: [] as TValueFilter,
      selectedClassesOpts: [] as TValueFilter,
      selectedClassesNamesOpts: [] as TValueFilter,
      selectedConnectionOpts: [] as TValueFilter,
      selectedStatusOpts: [] as TValueFilter,
      selectedSupplierOpts: '' as TValueFilter,
      selectedHealthOpts: [] as TValueFilter,
      selectedTemperatureOpts: [] as TValueFilter,
      selectedControlOpts: [] as TValueFilter,
      selectedModeEcoOpts: [] as TValueFilter,
      selectedPeriodOpts: props.state?.selectedTimeRange ?? '' as string,
      selectedDataTypeOpts: 'energia' as TValueFilter,
      selectedAnalysisOpts: 'unidades' as TValueFilter,
      selectedCountry: [] as TValueFilter,
      countryListOpts: [] as { value: string | number; name: string; }[],
      searchTerms: '',
      selectStartOperationOpts: '' as TValueFilter,
      selectEndOperationOpts: '' as TValueFilter,
      selectedOperationStatusOpts: [] as TValueFilter,
      selectedOwnershipFilter: props.infoType ? 'all' : { value: 'CLIENTS' } as any | any[],
      selectedInfoExib: 'dispositivo' as any | any[],
      dateValuePicker: {} as {
        startDate: moment.Moment | null,
        endDate: moment.Moment | null,
      },
      tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
      focused: {} as {
        id: string,
        focused: boolean,
      },
      selectedDevId: '',
      csvData: [], // setCsvData,
      selectedNotificationType: [] as TValueFilter,
      selectedNotificationSubtype: [] as TValueFilter,
      selectedNotificationDestinatary: [] as TValueFilter,
      selectedDateStart: null as Moment | null,
      selectedDateEnd: null as Moment | null,
      selectFocused: false,
      destinataryListOps: [] as { name: string, value: string }[],
      buttonName: props?.isFilterButton ? t('filtrar') : t('botaoAnalisar'),
      typesNotificationFilterOpts: [] as { value: number, name: string }[],
      typesNotificationListOpts: [] as { value: number, name: string }[],
      subtypesNotificationFilterOpts: [] as { value: number, name: string, typeId: number }[],
      subtypesNotificationListOpts: [] as { value: number, name: string, typeId: number }[],
      isClearFilter: false as boolean,
      selectedTrooms: [] as TValueFilter,
      selectedL1s: [] as TValueFilter,
      selectedTambs: [] as TValueFilter,
      selectedTInmets: [] as TValueFilter,
      selectedUtilities: [] as TValueFilter,
      selectedPowers: [] as TValueFilter,

      selectedFiltersColumns: {
        CLIENT: {
          label: t('cliente'),
          values: [],
        },
        UNIT: {
          label: t('unidade'),
          values: [],
        },
        STATE: {
          label: t('estado'),
          values: [],
        },
        CITY: {
          label: t('cidade'),
          values: [],
        },
        SUPERVISOR: {
          label: t('responsavel'),
          values: [],
        },
        CLASS_NAME: {
          label: t('nomeDoGrupo'),
          values: [],
        },
      } as FilterColumnsSelected,
    };
    return state;
  });
  const [profile] = useState(getUserProfile);

  const isDesktop = window.matchMedia('(min-width: 1039px)').matches;

  function clearFilters() {
    state.isClearFilter = true;
    state.selectedCityOpts = [];
    state.searchTerms = '';
    state.selectedClientOpts = [];
    state.selectedConnectionOpts = [];
    state.selectedStateOpts = [];
    state.selectedStatusOpts = [];
    state.selectedSupplierOpts = 'Todos';
    state.selectedUnitOpts = [];
    state.selectedHealthOpts = [];
    state.selectedTemperatureOpts = [];
    state.selectedControlOpts = [];
    state.selectedModeEcoOpts = [];
    state.selectedDataTypeOpts = [];
    state.selectedAnalysisOpts = [];
    state.selectedNotificationType = [];
    state.selectedNotificationSubtype = [];
    state.selectedNotificationDestinatary = [];
    state.selectedClassesNamesOpts = [];
    state.selectedSupervisorOpts = [];
    state.selectedClassesOpts = [];

    if (!props.fixedPeriod) {
      state.selectedPeriodOpts = '';
    }

    removeAllFilters();
    if (props.listFilters?.includes('data')) {
      props.informationsUnits.dates.dateStart = null;
      props.informationsUnits.dates.dateEnd = null;
    }
    if (props.state.isUnits) {
      props.informationsUnits.statusUnitsCheck = '2';
    }
    state.selectEndOperationOpts = '';
    state.selectStartOperationOpts = '';
    state.dateValuePicker.startDate = null;
    state.dateValuePicker.endDate = null;
    state.selectedDateStart = null;
    state.selectedDateEnd = null;
    state.selectedDevId = '';
    clearOwners();
    setState({ statesListFilterOpts: state.statesListOpts });
    setState({ citiesListFilterOpts: state.citiesListOpts });
    setState({ supervisorFilterListOpts: state.supervisorListOpts });
    setState({ unitsFilterOpts: state.unitsListOpts });
    setState({ typesNotificationFilterOpts: state.typesNotificationListOpts });
    setState({ subtypesNotificationFilterOpts: state.subtypesNotificationListOpts });
    render();
    if (!props.onAply) {
      filter();
    }
    sessionStorage.clear();
    props.state.needFilter = null;
    state.isLoading = false;
  }

  async function getDestinataryListOpts() {
    try {
      const clientIds = Array.isArray(state.selectedClientOpts) && state.selectedClientOpts.length > 0 ? state.selectedClientOpts.map((x) => Number(x)) : undefined;
      await apiCall('/users/list-users', { CLIENT_IDS: clientIds, includeAdmins: profile.permissions.isAdminSistema }).then(({ list, adminUsers }) => {
        const fullList = list.map((item) => ({ FULLNAME: item.FULLNAME, USER: item.USER, unitIds: item.unitIds })) as {
          FULLNAME: string,
          USER: string,
          unitIds?: number[],
        }[];
        for (const adminUser of (adminUsers || [])) {
          if (fullList.some((x) => x.USER === adminUser.USER)) { continue; } // user already in the list
          else fullList.push({ FULLNAME: adminUser.FULLNAME, USER: adminUser.USER });
        }
        state.destinataryListOps = fullList.map((x) => ({ name: x.FULLNAME, value: x.USER }));
      });
    } catch (err) {
      console.log(err);
      toast.error(t('erroDestinatarios'));
    }
    render();
  }

  function getTypesNotificationListOpts() {
    setState({
      typesNotificationListOpts: [
        { value: 1, name: t('ambiente') },
        { value: 2, name: t('maquina') },
        { value: 3, name: t('utilitario') },
      ],
    });
    setState({ typesNotificationFilterOpts: state.typesNotificationListOpts });
    render();
  }

  function getSubtypesNotificationListOpts() {
    setState({
      subtypesNotificationListOpts: [
        { value: 4, name: t('agua'), typeId: 3 },
        { value: 1, name: t('ambiente'), typeId: 1 },
        { value: 3, name: t('energia'), typeId: 3 },
        { value: 5, name: t('saude'), typeId: 2 },
        { value: 6, name: t('usoCondensadora'), typeId: 2 },
        { value: 7, name: t('VRF'), typeId: 2 },
      ],
    });
    setState({ subtypesNotificationFilterOpts: state.subtypesNotificationListOpts });
    render();
  }

  function clearOwners() {
    if (props.infoType) {
      state.selectedOwnershipFilter = 'all';
    } else {
      state.selectedOwnershipFilter = { value: 'CLIENTS' };
    }
  }

  async function getValues() {
    if (props.listFilters?.includes('estado')) {
      await getStatesList(state, render);
      setState({ statesListFilterOpts: state.statesListOpts });
    }
    if (props.listFilters?.includes('cidade')) {
      await getCitiesList(state, render);
      setState({ citiesListFilterOpts: state.citiesListOpts });
    }
    if (props.listFilters?.includes('cliente') && profile.manageAllClients) {
      await getClientsList(state, render);
    }
    if (props.listFilters?.includes('unidade')) {
      await getUnitsList(state, render);
      setState({ unitsFilterOpts: state.unitsListOpts });
    }
    if (props.listFilters?.includes('pais')) {
      await getCountry(state, render, props.typeValueName);
    }
    if (props.listFilters?.includes('responsavel')) {
      await getSupervisorsList(state, render);
      setState({ supervisorFilterListOpts: state.supervisorListOpts });
    }
    if (props.listFilters?.includes('grupo') && !profile.manageAllClients) {
      await getClassesList(state, render);
    }

    getPreFilteredParams();
  }

  useEffect(() => {
    if (props.listFilters?.includes('tipoNotificacao')) {
      getTypesNotificationListOpts();
    }

    if (props.listFilters?.includes('subtipoNotificacao')) {
      getSubtypesNotificationListOpts();
    }

    getValues();
  }, []);

  useEffect(() => {
    if (props.listFilters?.includes('destinatario')) {
      getDestinataryListOpts();
    }
  }, [state.selectedClientOpts]);

  useEffect(() => {
    if (props.lengthArrayResult && props.lengthArrayResult > 5) {
      setState({ showFilter: false });
    }
  }, [props.lengthArrayResult]);

  function getPreFilteredParams() {
    let hasPrefilters = false;

    if (props.state?.selectedState?.length) {
      hasPrefilters = true;
      state.selectedFiltersColumns.STATE.values = state.statesListOpts.filter((c) => props.state?.selectedState.includes(c.value));
      setState({ selectedStateOpts: props.state.selectedState });
    }
    if (props.state?.selectedCity?.length) {
      hasPrefilters = true;
      state.selectedFiltersColumns.CITY.values = state.citiesListOpts.filter((c) => props.state?.selectedCity.includes(c.value));
      setState({ selectedCityOpts: props.state.selectedCity });
    }
    if (props.state?.selectedUnit?.length) {
      hasPrefilters = true;
      state.selectedFiltersColumns.UNIT.values = state.unitsListOpts.filter((c) => props.state?.selectedUnit.includes(c.value));
      setState({ selectedUnitOpts: props.state.selectedUnit });
    }
    if (props.state.selectedTemperature?.length) {
      hasPrefilters = true;
      setState({ selectedTemperatureOpts: props.state.selectedTemperature });
    }
    if (props.state.selectedSupervisor?.length) {
      hasPrefilters = true;
      state.selectedFiltersColumns.SUPERVISOR.values = state.supervisorListOpts.filter((c) => props.state?.selectedSupervisor.includes(c.value));
      setState({ selectedSupervisorOpts: props.state.selectedSupervisor });
    }

    if (state.selectedClassesNamesOpts.length) {
      hasPrefilters = true;
      state.selectedFiltersColumns.CLASS_NAME.values = state.classesNamesListOpts.filter((c) => state.selectedClassesNamesOpts.includes(c.value));
    }

    if (props.state?.selectedTrooms?.length) {
      hasPrefilters = true;
      setState({ selectedTrooms: props.state.selectedTrooms });
    }

    if (props.state?.selectedTambs?.length) {
      hasPrefilters = true;
      setState({ selectedTambs: props.state.selectedTambs });
    }

    if (props.state?.selectedL1s?.length) {
      hasPrefilters = true;
      setState({ selectedL1s: props.state.selectedL1s });
    }

    if (props.state?.selectedPowers?.length) {
      hasPrefilters = true;
      setState({ selectedPowers: props.state.selectedPowers });
    }

    if (props.state?.selectedTInmets?.length) {
      hasPrefilters = true;
      setState({ selectedTInmets: props.state.selectedTInmets });
    }

    if (props.state?.selectedUtilities?.length) {
      hasPrefilters = true;
      setState({ selectedUtilities: props.state.selectedUtilities });
    }

    if (hasPrefilters) {
      setVariables();
      props.onAply!();
    }

    render();
  }

  function filter() {
    props.state.isLoading = true; props.render();
    props.state.filteredUtilities = props.state.utilities
      .filter((dev) => !state.selectedStateOpts!.length || state.selectedStateOpts!.includes(dev.STATE_UF))
      .filter((dev) => !state.selectedCityOpts!.length || state.selectedCityOpts!.includes(dev.CITY_NAME))
      .filter((dev) => !state.selectedClientOpts!.length || state.selectedClientOpts!.includes(dev.CLIENT_NAME))
      .filter((dev) => !state.selectedUnitOpts!.length || state.selectedUnitOpts!.includes(dev.UNIT_NAME))
      .filter((dev) => !state.selectedConnectionOpts!.length || state.selectedConnectionOpts!.includes(dev.connection))
      .filter((dev) => !state.selectedStatusOpts!.length || state.selectedStatusOpts!.includes(dev.status));

    props.state.isLoading = false; props.render();
  }

  function setVariablesUsuals() {
    if (props.listFilters?.includes('estado')) {
      props.state.selectedState = state.selectedStateOpts;
      defineSessionStorage('filterStates', state.selectedStateOpts);
    }
    if (props.listFilters?.includes('cidade')) {
      props.state.selectedCity = state.selectedCityOpts;
      defineSessionStorage('filterCity', state.selectedCityOpts);
    }
    if (props.listFilters?.includes('cliente') && profile.manageAllClients) {
      props.state.selectedClientFilter = state.selectedClientOpts;
      defineSessionStorage('filterClient', state.selectedClientOpts);
    }
    if (props.listFilters?.includes('unidade')) {
      props.state.selectedUnit = state.selectedUnitOpts;
      defineSessionStorage('filterUnit', state.selectedUnitOpts);
    }
    if (props.listFilters?.includes('responsavel')) {
      props.state.selectedSupervisor = state.selectedSupervisorOpts;
      defineSessionStorage('filterSupervisor', state.selectedSupervisorOpts);
    }
    if (props.listFilters?.includes('grupo')) {
      defineSessionStorage('filterClass', state.selectedClassesOpts);
      defineSessionStorage('filterClassName', state.selectedClassesNamesOpts);
    }
    if (props.listFilters?.includes('ambiente')) {
      props.state.selectedTrooms = state.selectedTrooms;
      defineSessionStorage('filterEnvironment', state.selectedTrooms);
    }
    if (props.listFilters?.includes('maquina')) {
      props.state.selectedL1s = state.selectedL1s;
      defineSessionStorage('filterMachines', state.selectedL1s);
    }
    if (props.listFilters?.includes('temperaturaExterna')) {
      props.state.selectedTambs = state.selectedTambs;
      defineSessionStorage('filterExtTemperature', state.selectedTambs);
    }
    if (props.listFilters?.includes('temperaturaExternaMeteorologica')) {
      props.state.selectedTrooms = state.selectedTInmets;
      defineSessionStorage('filterExtTemperatureMet', state.selectedTInmets);
    }
    if (props.listFilters?.includes('utilitario')) {
      props.state.selectedUtilities = state.selectedUtilities;
      defineSessionStorage('filterUtilities', state.selectedUtilities);
    }
    if (props.listFilters?.includes('potenciaAtiva')) {
      props.state.selectedPowers = state.selectedPowers;
      defineSessionStorage('filterPowers', state.selectedPowers);
    }
    if (props.listFilters?.includes('search')) {
      props.state.searchState = state.searchTerms;
    }
  }

  function setVariablesWater() {
    if (props.listFilters?.includes('fornecedor')) {
      props.state.selectSupplier = state.selectedSupplierOpts;
    }
  }

  function setVariablesNotification() {
    if (props.listFilters?.includes('dataUnica')) {
      props.state.selectedDateStart = state.selectedDateStart;
      props.state.selectedDateEnd = state.selectedDateEnd;
    }
    if (props.listFilters?.includes('tipoNotificacao')) {
      props.state.selectedNotificationType = state.selectedNotificationType;
    }
    if (props.listFilters?.includes('subtipoNotificacao')) {
      props.state.selectedNotificationSubtype = state.selectedNotificationSubtype;
    }
    if (props.listFilters?.includes('destinatario')) {
      props.state.selectedNotificationDestinatary = state.selectedNotificationDestinatary;
    }
  }

  function defineSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
  }

  function onChangeClient(clients) {
    const filteredArray = clients.filter((value) => !state.selectedClientOpts.includes(value));
    if (filteredArray?.length) {
      const selectedClients = [...state.selectedClientOpts, ...filteredArray];
      state.selectedFiltersColumns.CLIENT.values = state.clientsListOpts.filter((c) => selectedClients.includes(c.value));
      state.selectedFiltersColumns.UNIT.values = [];
      state.selectedFiltersColumns.STATE.values = [];
      state.selectedFiltersColumns.CITY.values = [];
      state.selectedFiltersColumns.SUPERVISOR.values = [];
      onChangeClientAux(selectedClients);
    } else {
      state.selectedFiltersColumns.CLIENT.values = state.clientsListOpts.filter((c) => clients.includes(c.value));
      onChangeClientAux(clients);
    }

    render();
  }

  function onChangeClientAux(selectedValues) {
    const filteredStates = state.statesListOpts.filter((st) => !selectedValues?.length || state.clientsListOpts.some((client) => client.states.includes(Number(st.value)) && selectedValues.includes(client.value)));

    const filteredCities = state.citiesListOpts.filter((city) => !selectedValues?.length || state.clientsListOpts.some((client) => selectedValues.includes(client.value) && client.cities.includes(city.value)));

    const filteredUnits = state.unitsListOpts.filter((unit) => {
      const isClientMatching = !selectedValues?.length || selectedValues.includes(unit.clientId.toString());
      const isCityMatching = filteredCities.some((city) => city.value === unit.city);
      return isClientMatching && isCityMatching;
    });

    const filteredSupervisors = state.supervisorListOpts.filter((supervisor) => supervisor.unit_ids.some((unitId) => filteredUnits.some((unit) => unit.value === unitId.toString())));

    state.selectedFiltersColumns.CITY.values = [];
    state.selectedFiltersColumns.UNIT.values = [];
    state.selectedFiltersColumns.SUPERVISOR.values = [];
    state.selectedFiltersColumns.STATE.values = [];

    setState({
      selectedUnitOpts: [],
      selectedSupervisorOpts: [],
      selectedCityOpts: [],
      selectedStateOpts: [],
      citiesListFilterOpts: filteredCities,
      unitsFilterOpts: filteredUnits,
      supervisorFilterListOpts: filteredSupervisors,
      statesListFilterOpts: filteredStates,
      selectedClientOpts: selectedValues,
    });
  }

  function onChangeState(states) {
    const filteredArray = states.filter((value) => !state.selectedStateOpts.includes(value));
    if (filteredArray?.length) {
      const selectedStates = [...state.selectedStateOpts, ...filteredArray];
      state.selectedFiltersColumns.CITY.values = [];
      state.selectedFiltersColumns.UNIT.values = [];
      state.selectedFiltersColumns.SUPERVISOR.values = [];
      state.selectedFiltersColumns.STATE.values = state.statesListOpts.filter((c) => selectedStates.includes(c.value));

      onChangeStateAux(selectedStates);
    } else {
      state.selectedFiltersColumns.STATE.values = state.statesListOpts.filter((st) => states.some((val) => val === st.value));

      onChangeStateAux(states);
    }

    render();
  }

  function onChangeStateAux(selectedValues) {
    const filteredCities = state.citiesListOpts.filter((city) => {
      const isStateMatching = !selectedValues?.length || selectedValues.includes(city.stateId.toString());
      const isClientMatching = !state.selectedClientOpts.length || state.clientsListOpts.some((client) => state.selectedClientOpts.includes(client.value) && client.cities.includes(city.value));
      return isStateMatching && isClientMatching;
    });

    const filteredUnits = state.unitsListOpts.filter((unit) => {
      const isStateMatching = !selectedValues?.length || selectedValues.includes(unit.state?.toString());
      const isCityMatching = !state.selectedCityOpts.length || filteredCities.some((city) => city.value === unit.city);
      const isClientMatching = !state.selectedClientOpts.length || state.selectedClientOpts.includes(unit.clientId.toString());
      return isStateMatching && isCityMatching && isClientMatching;
    });

    const filteredSupervisors = state.supervisorListOpts.filter((supervisor) => supervisor.unit_ids.some((unitId) => filteredUnits.some((unit) => unit.value === unitId.toString())));

    state.selectedFiltersColumns.CITY.values = [];
    state.selectedFiltersColumns.UNIT.values = [];
    state.selectedFiltersColumns.SUPERVISOR.values = [];

    setState({
      selectedUnitOpts: [],
      selectedSupervisorOpts: [],
      selectedCityOpts: [],
      citiesListFilterOpts: filteredCities,
      unitsFilterOpts: filteredUnits,
      supervisorFilterListOpts: filteredSupervisors,
      selectedStateOpts: selectedValues,
    });
  }

  function onChangeCity(cities) {
    const filteredArray = cities.filter((value) => !state.selectedCityOpts.includes(value));
    if (filteredArray?.length) {
      const selectedCities = [...state.selectedCityOpts, ...filteredArray];
      state.selectedFiltersColumns.CITY.values = state.citiesListOpts.filter((c) => selectedCities.includes(c.value));
      state.selectedFiltersColumns.UNIT.values = [];
      state.selectedFiltersColumns.SUPERVISOR.values = [];

      onChangeCityAux(selectedCities);
    } else {
      state.selectedFiltersColumns.CITY.values = state.citiesListOpts.filter((ct) => cities.some((val) => val === ct.value));
      onChangeCityAux(cities);
    }

    render();
  }

  function onChangeCityAux(selectedValues) {
    const filteredUnits = state.unitsListOpts.filter((unit) => {
      const isCityMatching = !selectedValues?.length || selectedValues.includes(unit.city);
      const isStateMatching = !state.selectedStateOpts.length || state.selectedStateOpts.includes(unit.state?.toString());
      const isClientMatching = !state.selectedClientOpts.length || state.selectedClientOpts.includes(unit.clientId.toString());
      return isCityMatching && isStateMatching && isClientMatching;
    });

    const filteredSupervisors = state.supervisorListOpts.filter((supervisor) => {
      supervisor.unit_ids.some((unitId) => filteredUnits.some((unit) => unit.value === unitId.toString()));
    });

    state.selectedFiltersColumns.UNIT.values = [];
    state.selectedFiltersColumns.SUPERVISOR.values = [];

    setState({
      unitsFilterOpts: filteredUnits,
      selectedUnitOpts: [],
      selectedSupervisorOpts: [],
      selectedCityOpts: selectedValues,
      supervisorFilterListOpts: filteredSupervisors,
    });
  }

  function onChangeUnit(units) {
    const filteredArray = units.filter((value) => !state.selectedUnitOpts.includes(value));
    if (filteredArray?.length) {
      state.selectedFiltersColumns.UNIT.values = state.unitsFilterOpts
        .filter((unit) => [...state.selectedUnitOpts, ...filteredArray].some((val) => val.toString() === unit.value))
        .map((unit) => ({
          name: unit.name,
          value: unit.value,
        }));
      setState({
        selectedUnitOpts: [...state.selectedUnitOpts, ...filteredArray],
        supervisorFilterListOpts: state.supervisorListOpts.filter((item) => item.unit_ids.some((unitId) => [...state.selectedUnitOpts, ...filteredArray].some((unit) => Number(unit) === unitId))),
      });
    } else {
      state.selectedFiltersColumns.UNIT.values = state.unitsListOpts.filter((u) => units.some((val) => val === u.value));
      state.selectedFiltersColumns.CLASS_NAME.values = [];
      setState({
        selectedUnitOpts: units,
        unitsFilterOpts: state.unitsListOpts,
        supervisorFilterListOpts: state.supervisorListOpts,
        selectedSupervisorOpts: [],
        selectedClassesNamesOpts: [],
      });
    }

    render();
  }

  function onChangeClasses(value) {
    if (value && value !== state.selectedClassesOpts) {
      setState({
        selectedClassesOpts: value,
        selectedClassesNamesOpts: [],
        classesNamesFilterListOpts: state.classesNamesListOpts.filter((x) => value === x.class),
      });
    } else {
      setState({
        selectedClassesOpts: [],
        selectedClassesNamesOpts: [],
        classesNamesFilterListOpts: [],
      });
    }
    state.selectedFiltersColumns.CLASS_NAME.values = [];

    render();
  }

  function onChangeClassesNames(classesNames) {
    const filteredArray = classesNames.filter((value) => !state.selectedClassesNamesOpts.includes(value));
    if (filteredArray?.length) {
      const selectedClasses = [...state.selectedClassesNamesOpts, ...filteredArray];

      const selectedUnits = state.unitsFilterOpts.filter((unit) => state.classesNamesListOpts
        .filter((classItem) => selectedClasses.includes(classItem.value))
        .some((classItem) => classItem.units.includes(Number(unit.value))));

      state.selectedFiltersColumns.CLASS_NAME.values = state.classesNamesListOpts.filter((c) => selectedClasses.includes(c.value));
      state.selectedFiltersColumns.UNIT.values = selectedUnits;

      setState({
        selectedClassesNamesOpts: selectedClasses,
        selectedUnitOpts: selectedUnits.map((u) => u.value),
      });
    } else {
      const selectedUnits = state.unitsFilterOpts.filter((unit) => state.classesNamesListOpts
        .filter((classItem) => classesNames.includes(classItem.value))
        .some((classItem) => classItem.units.includes(Number(unit.value))));
      state.selectedFiltersColumns.UNIT.values = selectedUnits;
      state.selectedFiltersColumns.CLASS_NAME.values = state.classesNamesListOpts.filter((c) => classesNames.some((val) => val === c.value));
      setState({
        selectedUnitOpts: selectedUnits.map((u) => u.value),
        selectedClassesNamesOpts: classesNames,
      });
    }

    render();
  }

  function onChangeSupervisor(supervisors) {
    const filteredArray = supervisors.filter((value) => !state.selectedSupervisorOpts.includes(value));
    if (filteredArray?.length) {
      state.selectedSupervisorOpts = [...state.selectedSupervisorOpts, ...filteredArray];
      state.selectedFiltersColumns.SUPERVISOR.values = state.supervisorListOpts.filter((st) => [...state.selectedSupervisorOpts, ...filteredArray].some((val) => val === st.value));
    } else {
      state.selectedSupervisorOpts = supervisors;
      state.selectedFiltersColumns.SUPERVISOR.values = state.supervisorListOpts.filter((st) => supervisors.some((val) => val === st.value));
    }

    render();
  }

  function onChangeNotificationTypes(value) {
    if (value) {
      state.selectedNotificationSubtype = [];
      state.selectedNotificationType = value;
      setState({ subtypesNotificationFilterOpts: state.subtypesNotificationListOpts.filter((item) => (value.includes(item.typeId) || value === item.typeId)) });
      render();
    }
  }

  function setVariables() {
    setVariablesUsuals();
    if (props.listFilters?.includes('conexao')) {
      props.state.selectedConnection = state.selectedConnectionOpts;
    }
    if (props.listFilters?.includes('status')) {
      props.state.selectedStatus = state.selectedStatusOpts;
    }

    if (props.listFilters?.includes('saude')) {
      props.state.selectedHealth = state.selectedHealthOpts;
    }
    if (props.listFilters?.includes('temperatura')) {
      props.state.selectedTemperature = state.selectedTemperatureOpts;
    }
    if (props.listFilters?.includes('controle')) {
      props.state.selectedControlType = state.selectedControlOpts;
    }
    if (props.listFilters?.includes('modoEco')) {
      props.state.selectedEcoMode = state.selectedModeEcoOpts;
    }
    if (props.listFilters?.includes('periodo')) {
      props.state.selectedTimeRange = state.selectedPeriodOpts;
    }
    if (props.listFilters?.includes('dados')) {
      props.state.selectedDataType = state.selectedDataTypeOpts;
    }
    if (props.listFilters?.includes('analise')) {
      props.state.selectedAnalysis = state.selectedAnalysisOpts;
    }
    if (props.listFilters?.includes('pais')) {
      props.state.selectedCountry = state.selectedCountry;
    }
    if (props.listFilters?.includes('operacao')) {
      props.state.selectedOperationStatus = state.selectedOperationStatusOpts;
    }
    if (props.listFilters?.includes('tipo')) {
      props.state.ownershipFilter = state.selectedOwnershipFilter;
    }
    if (props.listFilters?.includes('id')) {
      props.state.selectedDevId = state.selectedDevId;
    }
    setVariablesWater();
    setVariablesNotification();
    if (state.isClearFilter) state.isClearFilter = false;
    else if (props.closeFilter) state.showFilter = false;
  }

  function quickHandleChangeData(startDate, endDate, timeSelected) {
    const data = [...props.state.data];
    data.forEach((itemData) => {
      itemData.date.startDate = startDate.format('YYYY-MM-DD');
      itemData.date.endDate = endDate.format('YYYY-MM-DD');
    });
    setState({ ...state, selectedPeriodOpts: timeSelected, data });
    props.setView!(timeSelected);
    props.state.selectedTimeRange = state.selectedPeriodOpts;
  }

  const handleClickChange = (value: any, date?: Moment | null) => {
    if (props.updateCheckInformations) {
      if (date) props.updateCheckInformations(value, date);
      else props.updateCheckInformations(value);
    }
    props.render();
  };

  function quickChangeData(startDate, endDate) {
    props.informationsUnits.dates.dateStart = startDate;
    if (endDate) { handleClickChange('dateEnd', endDate); }
  }

  function onSelectedOwnership(value) {
    if (!props.infoType) {
      state.selectedOwnershipFilter = { value };
    } else {
      state.selectedOwnershipFilter = value;
    }
    render();
  }

  const setOnChange = (opt, data) => {
    if (opt.placeholder === t('inicioOperacao')) {
      state.dateValuePicker.startDate = data;
    } else {
      state.dateValuePicker.endDate = data;
    }
  };
  const isOutsideRange = (day) => {
    if (!props.isMaxOneMonthPeriod || props.state.focusedInput === 'startDate') return !day.isBefore(state.tomorrow);
    if (props.state.focusedInput === 'endDate') {
      return !day.isBefore(state.tomorrow) || day.isAfter(moment(new Date(props.informationsUnits.dates.dateStart)).add(30, 'days'));
    }
    return false;
  };

  const getColorExpandIcon = () => (state.isLoading ? colors.Grey200 : colors.Blue700);

  function removeAllFilters() {
    setState({
      selectedClientOpts: [],
      selectedUnitOpts: [],
      selectedStateOpts: [],
      selectedCityOpts: [],
      selectedSupervisorOpts: [],
      selectedClassesNamesOpts: [],
      selectedClassesOpts: [],
      unitsFilterOpts: state.unitsListOpts,
      statesListFilterOpts: state.statesListOpts,
      citiesListFilterOpts: state.citiesListOpts,
      supervisorFilterListOpts: state.supervisorListOpts,
      classesNamesFilterListOpts: state.classesNamesListOpts,
    });

    if (props.handleChangePeriod) {
      props.handleChangePeriod();
      state.selectedPeriodOpts = null;
    }

    handleRemoveAllFilterIntegratedAnalysis();

    state.selectedFiltersColumns.CLIENT.values = [];
    state.selectedFiltersColumns.UNIT.values = [];
    state.selectedFiltersColumns.STATE.values = [];
    state.selectedFiltersColumns.CITY.values = [];
    state.selectedFiltersColumns.SUPERVISOR.values = [];
    state.selectedFiltersColumns.CLASS_NAME.values = [];
    setVariables();
    props.onAply!();
  }

  function handleRemoveAllFilterIntegratedAnalysis() {
    if (state.selectedTrooms.length) clearGroup(props.state.trooms, 'selectedTrooms');
    if (state.selectedL1s.length) clearGroup(props.state.l1s, 'selectedL1s');
    if (state.selectedTambs.length) clearGroup(props.state.tambs, 'selectedTambs');
    if (state.selectedTInmets.length) clearGroup(props.state.tInmet, 'selectedTInmets');
    if (state.selectedUtilities.length) clearGroup(props.state.utilities, 'selectedUtilities');
    if (state.selectedPowers.length) clearGroup(props.state.powers, 'selectedPowers');
    props.state.selectedVars = [];
  }

  function handleRemoveFilterAux(filtersSelected: TValueFilter, valueRemoved: { value: string, name: string }) {
    let updateOpts: TValueFilter = '';

    if (Array.isArray(filtersSelected)) {
      updateOpts = filtersSelected.filter((x) => x.toString() !== valueRemoved.value.toString());
    } else {
      updateOpts = filtersSelected === valueRemoved.value ? '' : state.selectedUnitOpts;
    }

    return updateOpts;
  }

  function handleRemoveFilter(columnKey: string, filterIndex: number) {
    const valueRemoved = state.selectedFiltersColumns[columnKey].values[filterIndex];

    switch (columnKey) {
      case 'UNIT': {
        const updateOpts = handleRemoveFilterAux(state.selectedUnitOpts, valueRemoved);
        onChangeUnit(updateOpts);
        break;
      }
      case 'CLIENT': {
        const updateOpts = handleRemoveFilterAux(state.selectedClientOpts, valueRemoved);
        onChangeClient(updateOpts);
        break;
      }
      case 'STATE': {
        const updateOpts = handleRemoveFilterAux(state.selectedStateOpts, valueRemoved);
        onChangeState(updateOpts);
        break;
      }
      case 'CITY': {
        const updateOpts = handleRemoveFilterAux(state.selectedCityOpts, valueRemoved);
        onChangeCity(updateOpts);
        break;
      }
      case 'SUPERVISOR': {
        const updateOpts = handleRemoveFilterAux(state.selectedSupervisorOpts, valueRemoved);
        onChangeSupervisor(updateOpts);
        break;
      }
      case 'CLASS_NAME': {
        const updateOpts = handleRemoveFilterAux(state.selectedClassesNamesOpts, valueRemoved);
        onChangeClassesNames(updateOpts);
        break;
      }
      default:
        break;
    }

    setVariables();
    props.onAply!();
  }

  function handleRemoveCategoryFilter(columnKey: string) {
    switch (columnKey) {
      case 'UNIT':
        onChangeUnit([]);
        break;
      case 'CLIENT':
        onChangeClient([]);
        break;
      case 'STATE':
        onChangeState([]);
        break;
      case 'CITY':
        onChangeCity([]);
        break;
      case 'SUPERVISOR':
        onChangeSupervisor([]);
        break;
      case 'CLASS_NAME':
        onChangeClassesNames([]);
        break;
      default:
        break;
    }

    setVariables();
    props.onAply!();
  }

  function alterDate(type: 'next' | 'previous') {
    let newDate;
    const today = moment();

    if (state.selectedPeriodOpts === t('mes')) {
      newDate = type === 'next' ? new Date(props.state.monthDate.getFullYear(), props.state.monthDate.getMonth() + 1, 1) : new Date(props.state.monthDate.getFullYear(), props.state.monthDate.getMonth() - 1, 1);
    }
    if (state.selectedPeriodOpts === t('semana')) {
      newDate = type === 'next' ? moment(props.state.date).add(7, 'days') : moment(props.state.date).subtract(7, 'days');
    }
    if (state.selectedPeriodOpts === t('dia')) {
      newDate = type === 'next' ? moment(props.state.date).add(1, 'days') : moment(props.state.date).subtract(1, 'days');
    }
    if (newDate && moment(newDate).isSameOrBefore(today, 'day')) onDateChange(newDate, newDate);
  }

  function onDateChange(date, dateEnd) {
    if (state.selectedPeriodOpts === t('semana')) {
      props.state.date = date;
      render();
      const datesList = getDatesList(date, 7);
      props.state.dateList = datesList;
      props.state.startDate = datesList[0].mdate;
      props.state.endDate = datesList[datesList.length - 1].mdate;
    } else if (state.selectedPeriodOpts === t('dia')) {
      props.state.date = date;
      props.state.startDate = date;
      props.state.endDate = date;
      render();
      props.state.dateList = getDatesList(date, 1);
    } else if (state.selectedPeriodOpts === t('flexivel')) {
      props.state.multiDays = true;
      props.state.startDate = date;
      props.state.endDate = dateEnd;
      if (dateEnd) {
        dateEnd.set({
          hour: 12, minute: 0, second: 0, millisecond: 0,
        });
      }
    } else if (state.selectedPeriodOpts === t('mes')) {
      props.state.monthDate = date;
    }

    render();
  }

  function onSelectDevice(devices, selectedDevicesState: string, stateAux: any) {
    stateAux.isSelected = true;
    Object.values(stateAux.grupos).forEach((group: any) => {
      const deviceFound = devices.find((d) => d === group.GROUP_ID);

      if (deviceFound) {
        group.checked = true;
      } else if (
        state[selectedDevicesState].find((d) => d === group.GROUP_ID)
      ) {
        group.checked = false;
        const updatedVars = stateAux.selectedVars.filter(
          (selectedVar) => selectedVar.name !== group.GROUP_NAME,
        );
        stateAux.selectedVars = updatedVars;
      }
    });

    state[selectedDevicesState] = devices;
    props.render();
  }

  function replaceLastCharacters(str: string) {
    return str.length > 40 ? `${str.slice(0, 41)}...` : str;
  }

  function clearGroup(list: GroupInfo[], selectedGroup: string) {
    for (const group of list) {
      group.checked = false;
    }

    state[selectedGroup] = [];

    onSelectDevice([], selectedGroup, props.state);

    render();
  }

  function setAllGroup(list: GroupInfo[], selectedGroup: string) {
    const shouldBeChecked = list.some((group) => !group.checked);
    for (const group of list) {
      group.checked = shouldBeChecked;
      state[selectedGroup].push(group.GROUP_ID);
    }

    onSelectDevice(state[selectedGroup], selectedGroup, props.state);
    render();
  }

  function getIconLink(groupName: string, group: GroupInfo) {
    if (groupName === t('ambiente')) {
      return renderLinkIcon(group.checked, `/analise/dispositivo/${group.GROUP_ID.split('-INS')[0].substring(1)}/historico`);
    }

    if (groupName === t('temperaturaExterna') && group?.devs?.[0]?.DAC_ID) {
      return renderLinkIcon(group.checked, `/analise/dispositivo/${group.devs[0].DAC_ID}/tempo-real`);
    }

    if (groupName === t('utilitario')) {
      return getUtilityLinkIcon(group);
    }

    if (groupName === t('consumoEnergia')) {
      return renderLinkIcon(group.checked, `/integracoes/info/diel/${group.ENERGY_DEVICE_ID}/perfil`);
    }
    const devId = group?.devs?.[0]?.DAC_ID || group?.devs?.[0]?.DRI_ID;
    if (!devId) return null;

    return props.l1Only
      ? renderLinkIcon(group.checked, `/analise/dispositivo/${devId}/informacoes`)
      : renderLinkIcon(group.checked, `/analise/dispositivo/${devId}/tempo-real`);
  }

  function getDevice(groupName: string, group: GroupInfo) {
    if (groupName === t('ambiente')) {
      return group.devs && group.devs[0]?.DEV_ID || '';
    }

    if (groupName === t('utilitario')) {
      return group.devs && (group.devs[0]?.DAL_CODE || group.devs[0]?.DMT_CODE) || '';
    }

    if (groupName === t('maquina') || groupName === t('temperaturaExterna')) {
      return group.devs && group.devs[0]?.DAC_ID || '';
    }

    if (groupName === t('consumoEnergia')) {
      return group.ENERGY_DEVICE_ID;
    }
    return '';
  }

  function renderLinkIcon(checked: boolean, to: string) {
    return (
      <TransparentLinkIcon target="_blank" rel="noopener noreferrer" to={to}>
        <LinkIcon />
      </TransparentLinkIcon>
    );
  }

  function getUtilityLinkIcon(group: GroupInfo) {
    const utilId = group?.GROUP_ID.split(':')[1];
    if (!utilId) return null;

    const to = group.type === 'utility-nobreak'
      ? `/analise/utilitario/nobreak/${utilId}/informacoes`
      : `/analise/utilitario/iluminacao/${utilId}/informacoes`;

    return renderLinkIcon(group.checked, to);
  }

  function renderOptionAnalysisIntegrated(propsOption, option, _snapshot, className, state) {
    const deviceGroup = findDeviceGroup(option.value, state);

    function changeCheckbox(value: 'temp' | 'hum' | 'co2') {
      const tempValue = state.selectedVars.filter((item) => item.axisId === value).find((item) => item.lineId === deviceGroup.group?.GROUP_ID.substring(1));
      const getIndex = tempValue && state.selectedVars.indexOf(tempValue);
      if (getIndex !== undefined && tempValue) {
        state.selectedVars[getIndex].showLine = !tempValue.showLine;
      }
    }

    let showCheckbox = 0;
    const tempItem = state.selectedVars.filter((item) => item.axisId === 'temp').find((item) => item.lineId === deviceGroup.group?.GROUP_ID.substring(1));
    const co2Item = state.selectedVars.filter((item) => item.axisId === 'co2').find((item) => item.lineId === deviceGroup.group?.GROUP_ID.substring(1));
    const humItem = state.selectedVars.filter((item) => item.axisId === 'hum').find((item) => item.lineId === deviceGroup.group?.GROUP_ID.substring(1));

    if (tempItem) showCheckbox++;
    if (co2Item) showCheckbox++;
    if (humItem) showCheckbox++;

    return (
      <>
        <RowCheckbox colorCheckbox={option.color}>
          <button
            {...propsOption}
            className={className}
            type="button"
            data-tips
            data-for={option.value}
          >
            <div
              style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                marginLeft: '-20px',
                gap: '10px',
              }}
            >
              {option.icon}
              <div style={{ width: '100%' }}>
                <div>
                  <span>
                    {
                      replaceLastCharacters(option.name)
                    }
                  </span>
                  <p style={{ color: 'gray', fontSize: 10, margin: 0 }}>
                    {
                      getDevice(deviceGroup.name, deviceGroup?.group)
                    }
                  </p>
                </div>
              </div>

            </div>
          </button>
          {getIconLink(deviceGroup.name, deviceGroup?.group)}
        </RowCheckbox>
        { deviceGroup.group?.GROUP_NAME && deviceGroup.group.checked && (showCheckbox > 1) && (
        <>
          <Flex width="240px" flexWrap="wrap" flexDirection="row" style={{ height: '40px', width: '100%', backgroundColor: tempItem?.showLine && colors.BlueSecondary || '' }}>
            <div style={{ borderLeft: '1px dashed #DADADA', height: '90%', marginLeft: '18px' }} />
            <div style={{
              borderBottom: '1px dashed #DADADA',
              height: '60%',
              width: '15px',
            }}
            />
            <CheckBoxLineAnalysis>
              <CheckboxAnalysis
                checked={tempItem?.showLine}
                onClick={() => {
                  changeCheckbox('temp');
                  props.render();
                }}
                style={{ marginLeft: '-10px' }}
                color="primary"
              />
              <Text style={{ color: tempItem?.showLine ? 'white' : 'black' }}>{t('temperatura')}</Text>
            </CheckBoxLineAnalysis>
          </Flex>
          <Flex width="240px" flexWrap="wrap" flexDirection="row" style={{ height: '40px', width: '100%', backgroundColor: humItem?.showLine && colors.BlueSecondary || '' }}>
            <div style={{ borderLeft: '1px dashed #DADADA', height: '90%', marginLeft: '18px' }} />
            <div style={{
              borderBottom: '1px dashed #DADADA',
              height: '60%',
              width: '15px',
            }}
            />
            <CheckBoxLineAnalysis>
              <CheckboxAnalysis
                checked={humItem?.showLine}
                onClick={() => {
                  changeCheckbox('hum');
                  props.render();
                }}
                style={{ marginLeft: '-10px' }}
                color="primary"
              />
              <Text style={{ color: humItem?.showLine ? 'white' : 'black' }}>{t('umidade')}</Text>
            </CheckBoxLineAnalysis>
          </Flex>
          <Flex width="240px" flexWrap="wrap" flexDirection="row" style={{ height: '40px', width: '100%', backgroundColor: co2Item?.showLine && colors.BlueSecondary || '' }}>
            <div style={{ borderLeft: '1px dashed #DADADA', height: '60%', marginLeft: '18px' }} />
            <div style={{
              borderBottom: '1px dashed #DADADA',
              height: '60%',
              width: '15px',
            }}
            />
            <CheckBoxLineAnalysis>
              <CheckboxAnalysis
                checked={co2Item?.showLine}
                onClick={() => {
                  changeCheckbox('co2');
                  props.render();
                }}
                style={{ marginLeft: '-10px' }}
                color="primary"
              />
              <Text style={{ color: co2Item?.showLine ? 'white' : 'black' }}>CO₂</Text>
            </CheckBoxLineAnalysis>
          </Flex>
        </>
        ) }
        <StyledReactTooltip
          id={option.value}
          place="top"
          type="light"
          effect="solid"
          offset={{ top: -10, right: 50 }}
          border
          borderColor={colors.LightGrey_v3}
        >
          <div style={{ marginBottom: '10px' }}>
            <span>{deviceGroup?.name}</span>
          </div>
          <div>
            {
              deviceGroup.name === t('temExtEstMetereologicas') && props.unitCoordinate?.lat && props.unitCoordinate?.lon ? (
                <>
                  <span>
                    <b>{t('estacao')}</b>
                    {option.name}
                  </span>
                  <br />
                  <span>
                    <b>{t('distanciaEstacaoUnidade')}</b>
                    {formatNumberWithFractionDigits(option.distance)}
                  </span>
                </>
              ) : (
                <span>
                  <b>{option.name}</b>
                </span>
              )
            }
          </div>
        </StyledReactTooltip>
      </>
    );
  }

  const findDeviceGroup = (deviceId: string, state: any) => {
    const trooms = state?.trooms?.find((troom) => troom.GROUP_ID === deviceId);
    const troomsFiltered = state?.troomsFiltered?.find((troom) => troom.value === deviceId);

    if (trooms) { return {
      name: t('ambiente'), group: trooms, filter: 'selectedTrooms', troomsFiltered,
    }; }

    const l1s = state?.l1s?.find((l1) => l1.GROUP_ID === deviceId);

    if (l1s) return { name: t('maquina'), group: l1s, filter: 'selectedL1s' };

    const tambs = state?.tambs?.find((tamb) => tamb.GROUP_ID === deviceId);

    if (tambs) return { name: t('temperaturaExterna'), group: tambs, filter: 'selectedTambs' };

    const tInmet = state?.tInmet?.find((inmet) => inmet.GROUP_ID === deviceId);

    if (tInmet) return { name: 'Tem. Ext. - Est. Metereológicas', group: null, filter: 'selectedTInmets' };

    const powers = state?.powers?.find((power) => power.GROUP_ID === deviceId);

    if (powers) return { name: t('consumoEnergia'), group: powers, filter: 'selectedPowers' };

    const utilities = state?.utilities?.find((util) => util.GROUP_ID === deviceId);

    if (utilities) return { name: t('utilitario'), group: utilities, filter: 'selectedUtilities' };

    return { name: '', group: null, filter: '' };
  };

  const handleSelection = (label) => {
    if (label === t('hoje') || label === t('ontem')) {
      state.selectedPeriodOpts = t('dia');
    } else if (label === t('semanaAtual') || label === t('semanaPassada')) {
      state.selectedPeriodOpts = t('semana');
    } else if (label === t('ultimos7dias') || label === t('ultimos15dias')) {
      state.selectedPeriodOpts = t('flexivel');
    }

    render();
  };

  const loading = props.isLoading || props.state.isLoading || state.isLoading || props.state.loadingData || props.state.exportLoading;

  return (
    <Flex style={{ position: 'relative' }} flexDirection="column">
      <FiltersContainer
        flexWrap={['wrap', 'wrap', 'wrap', 'nowrap', 'nowrap']}
        showFilter={state.showFilter}
      >
        {
          state.showFilter && (
            <Flex
              flexDirection="row"
              justifyContent="center"
              mt={state.showFilter ? 0 : -23}
              alignItems="flex-start"
              style={{
                transition: 'visibility 0.5s, opacity 0.5s, background-color 0.5s, margin-top 1s',
                visibility: state.showFilter ? 'visible' : 'hidden',
                opacity: state.showFilter ? '1' : '0',
              }}
              flexWrap={['wrap', 'wrap', 'wrap', 'wrap', 'nowrap']}
            >
              <div style={{
                width: '100%',
              }}
              >
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '5px',
                }}
                >
                  {
                    (props.listFilters?.includes('cliente') && profile.manageAllClients) && (
                    <FilterOption
                      options={state.clientsListOpts}
                      value={state.selectedClientOpts}
                      onChange={(value) => { onChangeClient(value); }}
                      multiple
                      placeholder={t('cliente')}
                      disabled={loading}
                    />
                    )
                  }
                  {
                    props.listFilters?.includes('pais') && (
                      <FilterOption
                        options={state.countryListOpts}
                        value={state.selectedCountry}
                        onChange={(value) => { state.selectedCountry = value as any; render(); }}
                        multiple
                        placeholder={t('pais')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('estado') && (
                    <FilterOption
                      options={state.statesListFilterOpts}
                      value={state.selectedStateOpts}
                      onChange={(value) => { onChangeState(value); }}
                      multiple
                      placeholder={t('estado')}
                      disabled={loading}
                    />
                    )
                  }
                  {
                    props.listFilters?.includes('cidade') && (
                    <FilterOption
                      options={state.citiesListFilterOpts}
                      value={state.selectedCityOpts}
                      onChange={(value) => { onChangeCity(value); }}
                      multiple
                      placeholder={t('cidade')}
                      disabled={loading}
                    />
                    )
                  }
                  {
                    props.listFilters?.includes('unidade') && (
                    <FilterOption
                      value={state.selectedUnitOpts}
                      options={state.unitsFilterOpts}
                      onChange={(value) => { onChangeUnit(value); }}
                      multiple
                      placeholder={t('unidade')}
                      disabled={loading}
                    />
                    )
                  }
                  {
                    props.listFilters?.includes('responsavel') && (
                    <FilterOption
                      value={state.selectedSupervisorOpts}
                      options={state.supervisorFilterListOpts}
                      onChange={(value) => { onChangeSupervisor(value); }}
                      multiple
                      placeholder={t('responsavel')}
                      disabled={loading}
                    />
                    )
                  }
                  {
                    (props.listFilters?.includes('grupo') && state.classesListOpts.length > 0) && (
                      <>
                        <FilterOption
                          value={state.selectedClassesOpts}
                          options={state.classesListOpts}
                          onChange={(value) => { onChangeClasses(value); }}
                          placeholder="Grupo"
                          disabled={loading}
                        />
                        <FilterOption
                          value={state.selectedClassesNamesOpts}
                          options={state.classesNamesFilterListOpts}
                          onChange={(value) => { onChangeClassesNames(value); }}
                          placeholder="Nome do Grupo"
                          multiple
                          disabled={loading || !state.selectedClassesOpts.length}
                        />
                      </>
                    )
                  }
                  {
                    props.listFilters?.includes('statusOperacao') && profile.manageAllClients && (
                      <FilterOption
                        value={props.informationsUnits.statusUnitsCheck}
                        options={[
                          { value: '0', name: 'Em instalação' },
                          { value: '1', name: 'Em operação' },
                          { value: '2', name: 'Todas' },
                        ]}
                        onChange={(value) => { handleClickChange(value);
                          props.render(); }}
                        placeholder="Status"
                        disabled={loading}
                        renderOption
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('conexao') && (
                      <FilterOption
                        value={state.selectedConnectionOpts}
                        options={props.optionsConnetions || [
                          { value: 'ONLINE', name: t('online'), icon: <StatusIcon status="ONLINE" /> },
                          { value: 'LATE', name: t('late'), icon: <StatusIcon status="LATE" /> },
                          { value: 'OFFLINE', name: t('offline'), icon: <StatusIcon status="OFFLINE" /> },
                        ]}
                        onChange={(value) => { state.selectedConnectionOpts = value as any; render(); }}
                        multiple
                        placeholder={props.optionsConnetionsName || t('conexao')}
                        disabled={loading}
                        renderOption
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('status') && (
                      <>
                        {props.state.utilities[0] && props.state.utilities[0].APPLICATION === 'Nobreak' && (
                        <FilterOption
                          value={state.selectedStatusOpts}
                          options={[
                            { value: 'Rede Elétrica', name: 'Rede Elétrica' },
                            { value: 'Bateria', name: 'Bateria' },
                            { value: 'Desligado', name: 'Desligado' },
                          ]}
                          onChange={(value) => { state.selectedStatusOpts = value as any; render(); }}
                          multiple
                          placeholder="Status"
                          disabled={loading}
                          renderOption
                        />
                        )}

                        {props.state.utilities[0] && props.state.utilities[0].APPLICATION === 'Iluminação' && (
                        <FilterOption
                          value={state.selectedStatusOpts}
                          options={[
                            { value: 1, name: 'Ligado' },
                            { value: 0, name: 'Desligado' },
                          ]}
                          onChange={(value) => { state.selectedStatusOpts = value as any; render(); }}
                          multiple
                          placeholder="Status"
                          disabled={loading}
                          renderOption
                        />
                        )}
                      </>
                    )
                  }
                  {
                    props.listFilters?.includes('saude') && (
                      <FilterOption
                        value={state.selectedHealthOpts}
                        options={[
                          { value: '100', name: t('operandoCorretamente'), icon: <HealthIcon health="100" /> },
                          { value: '75', name: t('foraDeEspecificacao'), icon: <HealthIcon health="75" /> },
                          { value: '50', name: t('riscoIminente'), icon: <HealthIcon health="50" /> },
                          { value: '25', name: t('manutencaoUrgente'), icon: <HealthIcon health="25" /> },
                          { value: '2', name: t('equipamentoOffline'), icon: <HealthIcon health="2" /> },
                          { value: '4', name: t('maquinaDesativada'), icon: <HealthIcon health="4" /> },
                        ]}
                        onChange={(value) => { state.selectedHealthOpts = value as any; render(); }}
                        multiple
                        placeholder={t('saude')}
                        disabled={loading}
                        renderOption
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('temperatura') && (
                      <FilterOption
                        value={state.selectedTemperatureOpts}
                        options={[
                          { value: 'high', name: t('acima'), icon: <TempHigh /> },
                          { value: 'good', name: t('correta'), icon: <TempGreat /> },
                          { value: 'low', name: t('abaixo'), icon: <TempLow /> },
                          { value: 'no data', name: t('semInfo'), icon: <NoTempData /> },
                        ]}
                        onChange={(value) => { state.selectedTemperatureOpts = value as any; render(); }}
                        multiple
                        placeholder={t('temperatura')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('controle') && (
                      <FilterOption
                        value={state.selectedControlOpts}
                        options={[
                          { value: 'Automático', name: t('automatico') },
                          { value: 'Local', name: t('local') },
                          { value: 'Manual', name: t('manual') },
                          { value: 'Sem controle', name: t('semControle') },
                        ]}
                        onChange={(value) => { state.selectedControlOpts = value as any; render(); }}
                        multiple
                        placeholder={t('tipoControle')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('tipoNotificacao') && (
                      <FilterOption
                        value={state.selectedNotificationType}
                        options={state.typesNotificationFilterOpts}
                        onChange={(value) => { onChangeNotificationTypes(value); }}
                        multiple
                        placeholder={t('tipoNotificacao')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('subtipoNotificacao') && (
                      <FilterOption
                        value={state.selectedNotificationSubtype}
                        options={state.subtypesNotificationFilterOpts}
                        onChange={(value) => { state.selectedNotificationSubtype = value as any; render(); }}
                        multiple
                        placeholder="Subtipo"
                        disabled={loading || !state.selectedNotificationType.length}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('destinatario') && (
                      <FilterOption
                        value={state.selectedNotificationDestinatary}
                        options={state.destinataryListOps}
                        onChange={(value) => { state.selectedNotificationDestinatary = value as any; render(); }}
                        multiple
                        placeholder="Destinatário"
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('modoEco') && (
                      <FilterOption
                        value={state.selectedModeEcoOpts}
                        options={[
                          { value: 'habilitado', name: t('habilitado') },
                          { value: 'desabilitado', name: t('desabilitado') },
                        ]}
                        onChange={(value) => { state.selectedModeEcoOpts = value as any; render(); }}
                        multiple
                        placeholder={t('modoEco')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('operacao') && (
                      <FilterOption
                        value={state.selectedOperationStatusOpts}
                        options={[
                          { value: 'Liberado', name: t('liberadoMin') },
                          { value: 'Bloqueado', name: t('bloqueadoMin') },
                          { value: 'Ventilação', name: t('ventilacao') },
                          { value: 'Eco-Mode', name: t('modoEco') },
                          { value: 'Aberto', name: t('aberto') },
                          { value: 'Fechado', name: t('fechado') },
                          { value: 'Sem status', name: t('semStatus') },
                        ]}
                        onChange={(value) => { state.selectedOperationStatusOpts = value as any; render(); }}
                        multiple
                        placeholder={t('operacao')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('analise') && (
                      <FilterOption
                        value={state.selectedAnalysisOpts}
                        options={[
                          { value: 'unidades', name: t('unidades') },
                        ]}
                        onChange={(value) => { state.selectedAnalysisOpts = value as any; render(); }}
                        placeholder={t('analisar')}
                        disabled
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('dados') && (
                      <FilterOption
                        value={state.selectedDataTypeOpts}
                        options={[
                          { value: 'energia', name: t('energia') },
                        ]}
                        onChange={(value) => { state.selectedDataTypeOpts = value as any; render(); }}
                        placeholder={t('tipoDeDados')}
                        disabled
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('ambiente') && !!props.state?.troomsFiltered?.length) && (
                      <FilterOptionAnalysis
                        label={t('ambientes')}
                        options={props.state?.troomsFiltered}
                        value={state.selectedTrooms}
                        renderOption={renderOptionAnalysisIntegrated}
                        state={props.state}
                        group={props.state.trooms}
                        groupName="selectedTrooms"
                        loading={loading}
                        onChange={(value) => onSelectDevice(value, 'selectedTrooms', props.state)}
                        clearGroup={clearGroup}
                        setAllGroup={setAllGroup}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('maquina') && !!props.state?.l1sFiltered?.length) && (
                      <FilterOptionAnalysis
                        label={t('maquinas')}
                        options={props.state?.l1sFiltered}
                        value={state.selectedL1s}
                        renderOption={renderOptionAnalysisIntegrated}
                        state={props.state}
                        loading={loading}
                        onChange={(value) => onSelectDevice(value, 'selectedL1s', props.state)}
                        group={props.state.l1s}
                        groupName="selectedL1s"
                        clearGroup={clearGroup}
                        setAllGroup={setAllGroup}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('temperaturaExterna') && !!props.state?.tambsFiltered?.length) && (
                      <FilterOptionAnalysis
                        label={t('temperaturaExterna')}
                        options={props.state?.tambsFiltered}
                        value={state.selectedTambs}
                        renderOption={renderOptionAnalysisIntegrated}
                        state={props.state}
                        loading={loading}
                        onChange={(value) => onSelectDevice(value, 'selectedTambs', props.state)}
                        group={props.state.tambs}
                        groupName="selectedTambs"
                        clearGroup={clearGroup}
                        setAllGroup={setAllGroup}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('temperaturaExternaMeteorologica') && !!props.state?.tInmetFiltered?.length) && (
                      <FilterOptionAnalysis
                        label={t('temperaturaExternaMeteorologicas')}
                        options={props.state?.tInmetFiltered}
                        value={state.selectedTInmets}
                        renderOption={renderOptionAnalysisIntegrated}
                        state={props.state}
                        loading={loading}
                        onChange={(value) => onSelectDevice(value, 'selectedTInmets', props.state)}
                        group={props.state.tInmet}
                        groupName="selectedTInmets"
                        clearGroup={clearGroup}
                        setAllGroup={setAllGroup}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('utilitario') && !!props.state?.utilitiesFiltered?.length) && (
                      <FilterOptionAnalysis
                        label={t('utilitarios')}
                        options={props.state?.utilitiesFiltered}
                        value={state.selectedUtilities}
                        renderOption={renderOptionAnalysisIntegrated}
                        state={props.state}
                        loading={loading}
                        onChange={(value) => onSelectDevice(value, 'selectedUtilities', props.state)}
                        group={props.state.utilities}
                        groupName="selectedUtilities"
                        clearGroup={clearGroup}
                        setAllGroup={setAllGroup}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('potenciaAtiva') && !!props.state?.powersFiltered?.length) && (
                      <FilterOptionAnalysis
                        label={t('potenciaAtiva')}
                        options={props.state?.powersFiltered}
                        value={state.selectedPowers}
                        renderOption={renderOptionAnalysisIntegrated}
                        state={props.state}
                        loading={loading}
                        onChange={(value) => onSelectDevice(value, 'selectedPowers', props.state)}
                        group={props.state.powers}
                        groupName="selectedPowers"
                        clearGroup={clearGroup}
                        setAllGroup={setAllGroup}
                      />
                    )
                  }
                  {
                    props.listFilters?.includes('periodo') && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                      }}
                      >
                        <FilterOption
                          value={state.selectedPeriodOpts}
                          options={[
                            ...(!props.removeYearFilter ? [{ value: 'Ano', name: 'Ano' }] : []),
                            ...(!props.removeMonthFilter ? [{ value: 'Mês', name: 'Mês' }] : []),
                            { value: 'Semana', name: 'Semana' },
                            { value: 'Dia', name: 'Dia' },
                            { value: 'Flexível', name: 'Flexível' },
                          ]}
                          onChange={(value) => {
                            state.selectedPeriodOpts = value as any;
                            if (props.handleChangePeriod) {
                              props.handleChangePeriod();
                            }
                            render();
                          }}
                          placeholder={t('periodo')}
                          disabled={loading}
                          removeMarginBottom={props.includeQuickSelection}
                        />
                        {
                          props.includeQuickSelection && (
                            <div style={{ paddingLeft: '14px', marginTop: '2px' }}>
                              <QuickSelectionV2
                                height="auto"
                                twoColumns
                                dateRanges={[
                                  {
                                    label: t('hoje'), start: () => moment(), end: () => moment(), changeSelectedPeriod: () => handleSelection(t('hoje')),
                                  },
                                  {
                                    label: t('ontem'), start: () => moment().subtract(1, 'day'), end: () => moment().subtract(1, 'day'), changeSelectedPeriod: () => handleSelection(t('ontem')),
                                  },
                                  {
                                    label: t('semanaAtual'), start: () => moment().startOf('week'), end: () => moment().subtract(1, 'day'), changeSelectedPeriod: () => handleSelection(t('semanaAtual')),
                                  },
                                  {
                                    label: t('semanaPassada'), start: () => moment().subtract(7, 'days').startOf('week'), end: () => moment().subtract(7, 'days').endOf('week'), changeSelectedPeriod: () => handleSelection(t('semanaPassada')),
                                  },
                                  {
                                    label: t('ultimos7dias'), start: () => moment().subtract(7, 'days'), end: () => moment().subtract(1, 'day'), changeSelectedPeriod: () => handleSelection(t('ultimos7dias')),
                                  },
                                  {
                                    label: t('ultimos15dias'), start: () => moment().subtract(15, 'days'), end: () => moment().subtract(1, 'day'), changeSelectedPeriod: () => handleSelection(t('ultimos15dias')),
                                  },
                                ]}
                                setDate={(startDate, endDate) => {
                                  if (props.handleChangePeriod) props.handleChangePeriod();
                                  onDateChange(startDate, endDate);
                                }}
                              />
                            </div>
                          )
                        }
                      </div>
                    )
                  }
                  {
                    props.listFilters?.includes('data') && (

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'end',
                    }}
                    >
                      <ContentDate>
                        <DateLabel>{props?.isPeriodLabel ? t('periodo') : t('inicioOperacao')}</DateLabel>
                        {!props?.isPeriodLabel && <InfoIcon width="12px" data-tip data-for="startOperation" color="#BDBDBD" />}
                        <ReactTooltip
                          id="startOperation"
                          place="top"
                          effect="solid"
                        >

                          <HoverExportList>
                            {t('informacoesInicioOperacao')}
                          </HoverExportList>

                        </ReactTooltip>
                        <DateRangePicker
                          readOnly
                          disabled={props.state.isLoading}
                          startDate={props.informationsUnits.dates.dateStart}// momentPropTypes.momentObj or null,
                          startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                          endDate={props.informationsUnits.dates.dateEnd}// momentPropTypes.momentObj or null,
                          endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                          onDatesChange={({ startDate, endDate }) => {
                            if (startDate) { handleClickChange('dateStart', startDate); }
                            if (startDate !== props.informationsUnits.dates.dateStart) { handleClickChange('dateEnd', null); }
                            else {
                              handleClickChange('dateEnd', endDate);
                            }
                          }} // PropTypes.func.isRequired,
                          onFocusChange={(focused: 'endDate' | 'startDate' | null) => {
                            props.state.focusedInput = focused;
                            props.render();
                          }}
                          focusedInput={props.state.focusedInput}
                          noBorder
                          isOutsideRange={(d) => isOutsideRange(d)}
                          startDatePlaceholderText={t('dataInicial')}
                          endDatePlaceholderText={t('dataFinal')}
                        />
                      </ContentDate>
                      <QuickSelection isShortMode={props?.isPeriodLabel} setDate={quickChangeData} />
                    </div>

                    )
                  }
                  { props.listFilters?.includes('dataNew') && state.selectedPeriodOpts && state.selectedPeriodOpts !== t('flexivel') && (
                  <ContainerDateNew disabled={loading}>
                    <ArrowButton style={{ borderRadius: '8px 0px 0px 8px' }} orientation="left" onClick={() => !loading && alterDate('previous')}>
                      <NewExpandIcon color={getColorExpandIcon()} />
                    </ArrowButton>
                    {
                      state.selectedPeriodOpts === t('mes') && (
                      <ContentDateNew>
                        <Label>{t('data')}</Label>
                        <DatePicker
                          maxDate={moment().toDate()}
                          disabled={loading}
                          selected={props.state.monthDate}
                          // eslint-disable-next-line react/jsx-no-bind
                          onChange={onDateChange}
                          dateFormat="MMM yyyy"
                          locale={`${t('data') === 'Data' ? 'pt-BR' : ''}`}
                          showMonthYearPicker
                        />
                      </ContentDateNew>
                      )
                    }
                    {
                      [t('semana'), t('dia')].includes(state.selectedPeriodOpts) && (
                      <ContentDateNew>
                        <Label>{t('data')}</Label>
                        <SingleDatePicker
                          disabled={loading}
                          date={props.state.date}
                          // eslint-disable-next-line react/jsx-no-bind
                          onDateChange={onDateChange}
                          focused={props.state.focused}
                          onFocusChange={({ focused }) => { props.state.focused = focused; render(); }}
                          id="datepicker"
                          numberOfMonths={1}
                          isOutsideRange={(d) => !d.isBefore(moment())}
                          placeholder={t('selecionar')}
                        />
                      </ContentDateNew>
                      )
                    }
                    <ArrowButton style={{ borderRadius: '0px 8px 8px 0px' }} orientation="right" onClick={() => !loading && alterDate('next')}>
                      <NewExpandIcon color={getColorExpandIcon()} style={{ rotate: '540deg' }} />
                    </ArrowButton>
                  </ContainerDateNew>
                  )}
                  { props.listFilters?.includes('dataNew') && state.selectedPeriodOpts && state.selectedPeriodOpts === t('flexivel') && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'end',
                    }}
                    >
                      <ContentDate>
                        <DateLabel>{t('data')}</DateLabel>
                        <DateRangePicker
                          disabled={loading}
                          startDate={props.state.startDate}
                          startDateId="your_unique_start_date_id"
                          endDate={props.state.endDate}
                          endDateId="your_unique_end_date_id"
                          onDatesChange={({ startDate, endDate }) => onDateChange(startDate, endDate)}
                          onFocusChange={(focused) => { props.state.focusedInput = focused; render(); }}
                          focusedInput={props.state.focusedInput}
                          noBorder
                          startDatePlaceholderText={t('dataInicial')}
                          endDatePlaceholderText={t('dataFinal')}
                          isOutsideRange={(d) => d.startOf('day').isAfter(moment().startOf('day'))}
                        />
                      </ContentDate>
                    </div>
                  )}

                  {
                    (props.listFilters?.includes('tipo') && (profile.viewAllClients || profile.permissions.isInstaller)) && (
                      <FilterOption
                        options={props.infoType ? props.infoType : [
                          { value: 'CLIENTS', name: t('deClientes') },
                          { value: 'N-COMIS', name: t('naoComissionados') }, // aqueles com DEV_ID default de firmware
                          { value: 'N-ASSOC', name: t('naoAssociados') }, // Aqueles que já tem DEV_ID próprio, mas não possuem cliente associado
                          { value: 'MANUFAC', name: t('comissionadosEmFabrica') }, // Aqueles que já tem DEV_ID próprio, e possuem cliente SERDIA
                          { value: 'D-TESTS', name: t('emTestes') }, // Aqueles que estão associados ao cliente DIEL ENERGIA LTDA.
                          { value: 'ALLDEVS', name: t('todos') },
                        ]}
                        value={state.selectedOwnershipFilter.value}
                        onChange={(value) => { onSelectedOwnership(value); }}
                        placeholder={t('tipo')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('progDisp')) && (
                      <FilterOption
                        options={[
                          { value: 'programacao', name: t('programacao') },
                          { value: 'dispositivo', name: t('dispositivo') }, // aqueles com DEV_ID default de firmware
                        ]}
                        value={state.selectedInfoExib}
                        onChange={(value) => { state.selectedInfoExib = value; props.setProg!(state.selectedInfoExib); render(); }}
                        placeholder={t('informacoesExibidas')}
                        disabled={loading}
                      />
                    )
                  }
                  {
                    (props.listFilters?.includes('id') && (
                      <div style={{
                        marginLeft: '16px', fontSize: '11px',
                      }}
                      >
                        <InputSearch
                          style={{
                            height: '41px', width: 224, fontSize: '11px', borderRadius: '8px', border: '1px solid #BABABA',
                          }}
                          id="search"
                          name="search"
                          label={t('idDoDispositivo')}
                          placeholder={t('digitar')}
                          value={state.selectedDevId}
                          onEnterKey={() => { setVariables(); props.onAply!(); }}
                          onChange={(id) => { state.selectedDevId = id; render(); }}
                          disabled={loading}
                          filterStyle
                          noBorder
                        />
                      </div>
                    ))
                  }
                  {
                    props.listFilters?.includes('fornecedor') && (

                    <FilterOption
                      value={state.selectedSupplierOpts}
                      options={[
                        { value: 'Laager', name: 'Laager' },
                        { value: 'Diel', name: 'Diel' },
                        { value: 'Todos', name: 'Todos' },

                      ]}
                      onChange={(value) => { state.selectedSupplierOpts = value as any; render(); }}
                      placeholder={t('fornecedor')}
                      disabled={loading}
                      renderOption
                    />
                    )
                  }
                  {
                    (props.listFilters?.includes('search') && (
                      <div style={{
                        marginLeft: '16px', fontSize: '11px', position: 'relative',
                      }}
                      >
                        <InfoIcon
                          width="12px"
                          data-tip
                          data-for="search"
                          color="#BDBDBD"
                          style={{
                            position: 'absolute', top: 0, right: 0, zIndex: 2, marginRight: 5, marginTop: 5,
                          }}
                        />
                        <ReactTooltip
                          id="search"
                          place="top"
                          effect="solid"
                        >

                          <HoverExportList>
                            {t('pesquiseAmbientes')}
                          </HoverExportList>

                        </ReactTooltip>
                        <InputSearch
                          style={{
                            height: '41px', width: 224, fontSize: '11px', borderRadius: '8px', border: '1px solid #BABABA',
                          }}
                          id="search"
                          name="search"
                          label={props.searchLabel || t('buscar')}
                          placeholder={t('digitar')}
                          value={state.searchTerms}
                          onEnterKey={() => { setVariables(); props.onAply!(); }}
                          onChange={(term) => { state.searchTerms = term; render(); }}
                          disabled={loading}
                          filterStyle
                          noBorder
                        />
                      </div>
                    ))
                  }
                </div>
                {
                    props.listFilters?.includes('dataUnica') && (
                      <ContentDate style={{ maxWidth: '220px' }}>
                        <DateLabel>{t('data')}</DateLabel>
                        <SingleDatePicker
                          disabled={loading}
                          date={state.selectedDateStart}
                          onDateChange={(value) => setState({ selectedDateStart: value, selectedDateEnd: value })}
                          focused={state.selectFocused}
                          onFocusChange={({ focused }) => setState({ selectFocused: focused })}
                          id="datepicker"
                          numberOfMonths={1}
                          isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                          placeholder={t('data')}
                        />

                        <StyledCalendarIcon color="#202370" />
                      </ContentDate>
                    )

                  }
                <div>
                  {
                    (state.showFilter)
                    && (
                    <CleanBtn onClick={() => { clearFilters(); setVariables(); props.onAply!(); }}>
                      {t('limparTodos')}
                    </CleanBtn>
                    )
                  }
                </div>
              </div>
              <Button
                style={{
                  width: '110px',
                  marginLeft: '20px',
                  minWidth: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '41px',
                  textTransform: 'capitalize',
                  justifyContent: 'center',
                }}
                type="button"
                variant={loading ? 'disabled' : 'primary'}
                onClick={() => { setVariables(); props.onAply!(); render(); }}
              >
                {state.buttonName}
              </Button>
            </Flex>
          )
        }
      </FiltersContainer>
      {state.showFilter && <div style={{ height: 10 }} />}
      <div
        style={{
          margin: props.margin ? '10px 20px 10px 30px' : '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <ControlFilter style={{ marginTop: 1, width: '83px', zIndex: '0' }} onClick={() => { state.showFilter = !state.showFilter; render(); }}>
          <FilterIcon style={{ marginRight: 4 }} />
          {t('filtros')}
          {state.showFilter ? <ArrowDownIconV2 width="8" heigth="7" style={{ marginLeft: 4 }} /> : <ArrowUpIconV2 width="8" heigth="7" style={{ marginLeft: 4 }} />}
        </ControlFilter>
        {
          (props.filterFooter && isDesktop && !state.showFilter && Object.values(state.selectedFiltersColumns).some((item) => item.values.length > 0)) && (
          <div style={{
            width: '100%', paddingLeft: '10px',
          }}
          >
            <FiltersSelected
              handleRemoveAllFilters={removeAllFilters}
              handleRemoveFilter={handleRemoveFilter}
              filtersSelected={state.selectedFiltersColumns}
              handleRemoveCategoryFilter={handleRemoveCategoryFilter}
            />
          </div>

          )
        }
        {
          props.exportFunc && (
            <CustomFilter
              showFilter={state.showFilter}
              stateFilter={state}
              render={props.render}
              state={props.state}
              updateCheckInformations={props.updateCheckInformations}
              informationsUnits={props.informationsUnits}
              exportFunc={props.exportFunc}
              csvHeader={props.csvHeader}
              tab="devices"
              loading={loading}
            />
          )
        }
      </div>
      {state.showFilter && <div style={{ height: 10 }} />}

    </Flex>
  );
};

export const CustomFilter = (props : {
  showFilter: boolean,
  tab: string,
  state: any,
  updateCheckInformations?: (value: any, date?: Moment) => void,
  informationsUnits?: any,
  stateFilter: any,
  render: any,
  exportFunc: (() => Promise<void> | void) | undefined,
  loading: boolean,
  csvHeader: {
    label: string;
    key: string;
  }[] | undefined
}): JSX.Element => {
  const csvLinkEl = useRef();
  const [profile] = useState(getUserProfile);

  function verifyParams() {
    if (props.state.isUnits && props.state.openExportList === false) {
      return openExportList();
    }
    if (props.exportFunc) {
      return props.exportFunc();
    }
    return getCsvData();
  }
  function openExportList() {
    try {
      props.state.openExportList = true;
      props.render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function isCompleteList() {
    try {
      handleClick('complete');
      props.render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function isCustomList() {
    try {
      handleClick('custom');
      props.render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function closeExportList() {
    try {
      props.state.openExportList = false;
      props.state.modeExportList = '';
      props.render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  const handleClick = (value: string, date?: Moment) => {
    if (props.updateCheckInformations) {
      if (date) props.updateCheckInformations(value, date);
      else props.updateCheckInformations(value);
    }
  };

  const getCsvData = async () => {
    props.state.isLoading = true; props.render();
    const formatterCSV = props.state.filteredUtilities.map((dev) => ({
      CLIENT_NAME: dev.CLIENT_NAME || '-',
      STATE: dev.STATE_UF || '-',
      CITY_NAME: dev.CITY_NAME || '-',
      NAME: dev.NAME || '-',
      UNIT: dev.UNIT_NAME || '-',
      DAT_CODE: dev.DAT_CODE || '-',
      DMT_CODE: dev.DMT_CODE || '-',
      STATUS: dev.status || '-',
      averageDur: dev.averageDur || '-',
      autonon: dev.autonon || '-',
      connection: dev.connection || '-',
    }));

    props.stateFilter.csvData = formatterCSV;
    props.render();

    setTimeout(() => {
      (csvLinkEl as any).current.link.click();
      window.location.reload();
    }, 1000);
    props.state.isLoading = false; props.render();
  };

  useEffect(() => {
    props.state.filteredUtilities = props.state.utilities;
    props.render();
  }, []);

  useEffect(() => {
    const weekdaysMin: string[] = t('weekdaysMin', { returnObjects: true });
    const language = i18n.language === 'pt' ? 'pt-br' : i18n.language;
    moment.updateLocale(language, {
      weekdaysMin,
    });
  }, [i18n.language, t]);

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
          <ExportBtn disabled={props.loading} onClick={() => { verifyParams(); }}>
            <ExportIcon />
            <span style={{ marginLeft: 10 }}>
              {t('exportarListaCap')}
            </span>
            <CSVLink
              headers={props.csvHeader}
              data={props.stateFilter.csvData}
              separator=";"
              enclosingCharacter={"'"}
              filename={t('utilitario')}
              asyncOnClick
              ref={csvLinkEl}
            />
          </ExportBtn>
        </>
        )
      }
      {props.state.isUnits && props.state.openExportList && (
      <div style={{ zIndex: 3, position: 'sticky' }}>
        <ModalWindowStyled
          topBorder
          onClickOutside={() => closeExportList()}
        >
          <Card noPadding>
            <ContainerModal>
              <TitleModal>
                {t('exportarPlanilha')}
              </TitleModal>
              <SubtitleModal>
                {t('selecioneOpcaoDesejada')}
              </SubtitleModal>

              <Flex
                style={{
                  gap: '13px',
                  marginTop: '23px',
                  marginBottom: '23px',
                }}
              >
                {/* Complete */}
                <OptionExportList
                  style={{
                    backgroundColor: props.informationsUnits.modeExportList === 'complete' ? '#363BC4' : ' white',
                    color: props.informationsUnits.modeExportList === 'complete' ? 'white' : ' black',
                  }}
                  onClick={() => { isCompleteList(); }}
                >
                  <CompleteListIcon color={props.informationsUnits.modeExportList === 'complete' ? 'white' : '#363BC4'} />
                  <span>{t('planilhaCompleta')}</span>
                  <InfoIcon width="14px" data-tip data-for="complete" color="#BDBDBD" />
                  <ReactTooltip
                    id="complete"
                    place="top"
                    effect="solid"
                  >
                    <HoverExportList>
                      {t('informacoesPlanilhaCompleta')}
                    </HoverExportList>
                  </ReactTooltip>
                </OptionExportList>

                {/* Custom */}
                <OptionExportList
                  style={{
                    backgroundColor: props.informationsUnits.modeExportList === 'custom' ? '#363BC4' : ' white',
                    color: props.informationsUnits.modeExportList === 'custom' ? 'white' : ' #363BC4',
                  }}
                  onClick={() => { isCustomList(); }}
                >
                  <CustomListIcon color={props.informationsUnits.modeExportList === 'custom' ? 'white' : '#363BC4'} />

                  <span style={{ width: '135px' }}>
                    {t('planilhaCustomizada')}
                  </span>
                  <InfoIcon width="14px" data-tip data-for="custom" color="#BDBDBD" />

                  <ReactTooltip
                    id="custom"
                    place="top"
                    effect="solid"
                  >

                    <HoverExportList>
                      {t('informacoesPlanilhaCustomizada')}
                    </HoverExportList>

                  </ReactTooltip>
                </OptionExportList>
              </Flex>

              {props.informationsUnits.modeExportList === 'custom' && (
              <>

                <Flex
                  marginBottom="20px"
                  flexDirection="column"
                >
                  <span style={{ fontWeight: 'bolder', marginBottom: '16px' }}>
                    {t('informacoes')}
                    :
                  </span>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-between"
                  >
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkState}
                        onClick={() => {
                          handleClick('estado');
                        }}
                        size={16}
                      />
                      <span>
                        {t('estado')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkCity}
                        onClick={() => {
                          handleClick('cidade');
                        }}
                        size={16}
                      />
                      <span>
                        {t('cidade')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkUnit}
                        onClick={() => {
                          handleClick('unidade');
                        }}
                        size={16}
                      />
                      <span>
                        {t('unidade')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkMachines}
                        onClick={() => {
                          handleClick('maquinas');
                        }}
                        size={16}
                      />
                      <span>
                        {t('maquinas')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkEnvironments}
                        onClick={() => {
                          handleClick('ambientes');
                        }}
                        size={16}
                      />
                      <span>
                        {t('ambientes')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkUtilities}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('utilitarios');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('utilitarios')}
                      </span>
                    </ContainerCheckbox>

                    {profile.manageAllClients && (
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkStartMonitoring}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('inicioMonitoramento');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('inicioMonitoramento')}
                      </span>
                    </ContainerCheckbox>

                    )}
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkWaterDevices}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('dispositivosAgua');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('dispositivosAgua')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkEnergyDevices}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('dispositivosEnergia');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('dispositivosEnergia')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkAutomationDevices}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('dispositivosAutomacao');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('dispositivosAutomacao')}
                      </span>
                    </ContainerCheckbox>
                    <ContainerCheckbox style={{ alignItems: 'flex-end' }}>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkMonitoringDevices}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('dispositivosMonitoramento');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('dispositivosMonitoramento')}
                      </span>
                    </ContainerCheckbox>

                    {profile.manageAllClients && (
                    <ContainerCheckbox>
                      <Checkbox
                        checked={props.informationsUnits.informationsUnitsCheck.checkStatus}
                        onClick={() => {
                          props.updateCheckInformations !== undefined && props.updateCheckInformations('status');
                          props.render();
                        }}
                        size={16}
                      />
                      <span>
                        {t('status')}
                      </span>
                    </ContainerCheckbox>
                    )}

                  </Box>

                </Flex>
              </>

              )}

              <Button
                variant={(props.state.isLoading || props.informationsUnits.modeExportList === '') ? 'disabled' : 'primary'}
                onClick={() => verifyParams()}
              >
                {t('exportar')}
              </Button>

            </ContainerModal>
            <CancelButton
              onClick={() => closeExportList()}
            >
              {t('cancelar')}
            </CancelButton>

          </Card>
        </ModalWindowStyled>
      </div>
      )}
    </Flex>
  );
};

const FilterOption = (props: {
  value: string | string[] | undefined
  placeholder: string,
  onChange: ((selectedValue: SelectedOptionValue | SelectedOptionValue[], selectedOption: SelectedOption | SelectedOption[], optionSnapshot: SelectSearchProps) => void) | undefined
  options: SelectSearchOption[],
  disabled?: boolean,
  multiple?: boolean,
  closeOnSelected?: boolean,
  renderOption?: boolean,
  type?: string,
  getSelectedDate?: (opt: any, state: any) => any,
  setOnChange?: (opt: any, data: any) => void,
  state?: any,
  setState?: any,
  render?: any,
  removeMarginBottom?: boolean,
}) => {
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
  return (
    <>
      {
        props.type && props.type === 'date'
          ? (
            <>
              <ContentDate
                style={{
                  marginLeft: '16px',
                  backgroundColor: 'white',
                  paddingTop: 5,
                }}
                key={props.placeholder}
              >
                <DateLabel>{props.placeholder}</DateLabel>
                <br />
                <SingleDatePicker
                  disabled={props.state.isLoading}
                  date={props.getSelectedDate!(props, props.state)}
                  onDateChange={(data) => {
                    props.setOnChange!(props, data);
                    props.onChange!(data, [], [] as any);
                    props.render();
                  }}
                  focused={props.state.focused.id === props.placeholder ? props.state.focused.focused : false}
                  onFocusChange={({ focused }) => {
                    props.setState({ focused: { id: props.placeholder, focused } });
                    props.render();
                  }}
                  numberOfMonths={1}
                  displayFormat="DD/MM/YYYY"
                  isOutsideRange={(d) => {
                    if (props.placeholder === t('fimOperacao') && props.state.dateValuePicker.startDate) {
                      return d.isBefore(props.state.dateValuePicker.startDate);
                    }
                    return d.isAfter(props.state.dateValuePicker.endDate);
                  }}
                  placeholder={props.placeholder}
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            </>
          ) : (
            <SearchInput
              disabled={props.disabled}
              style={{
                width: '226px', marginBottom: props.removeMarginBottom ? '0' : '10px', borderRadius: '8px', height: '41px', padding: '2px 0px',
              }}
            >
              <ContainerArea>
                <Label style={{ opacity: props.disabled ? '0.4' : '1' }}>{props.placeholder}</Label>
                <SelectSearch
                  options={props.options}
                  value={props.value}
                  multiple={props.multiple}
                  closeOnSelect={props.closeOnSelected}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('selecionar')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={props.onChange}
                  // onBlur={onFilterUnitBlur}
                  disabled={props.disabled}
                  renderOption={props.renderOption ? renderOption : undefined}
                />
              </ContainerArea>
            </SearchInput>
          )
      }
    </>
  );
};

const FilterOptionAnalysis = (props: {
  label: string,
  options: SelectSearchOption[],
  value: string | string[] | undefined,
  onChange: (value) => void,
  clearGroup: (list: GroupInfo[], selectedGroup: string) => void,
  setAllGroup: (list: GroupInfo[], selectedGroup: string) => void,
  renderOption: (DomProps: any, option: any, snapshot: any, className: any, state: any) => JSX.Element,
  state: any,
  loading: boolean,
  group: GroupInfo[],
  groupName: string,
  }) => (
    <Flex flexDirection="column" mb={10}>
      <Box>
        <SelectWithCheckbox
          disabled={props.loading}
          style={{
            width: '226px', borderRadius: '8px', height: '41px', padding: '2px 0px',
          }}
        >
          <ContainerArea>
            <Label style={{ opacity: props.loading ? '0.4' : '1' }}>{props.label}</Label>
            <SelectSearch
              options={props.options}
              value={props.value}
              renderOption={(DomProps, option, snapshot, className) => props.renderOption(DomProps, option, snapshot, className, props.state)}
              multiple
              closeOnSelect={false}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder={t('selecionar')}
              onChange={props.onChange}
              disabled={props.loading}
            />
          </ContainerArea>
        </SelectWithCheckbox>
      </Box>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <CheckboxLine>
            <Checkbox
              checked={props.group?.every((grupo) => grupo.checked)}
              size={15}
              onClick={() => (props.group.every((grupo) => grupo.checked)
                ? props.clearGroup(props.group, props.groupName)
                : props.setAllGroup(props.group, props.groupName))}
              color="primary"
            />
            <Text style={{ fontSize: '10px' }}>{t('selecionarTodos')}</Text>
          </CheckboxLine>
        </Box>
        <Box>
          <BtnClean
            onClick={() => props.clearGroup(props.group, props.groupName)}
          >
            {t('limpar')}
          </BtnClean>
        </Box>
      </Flex>
    </Flex>
);
