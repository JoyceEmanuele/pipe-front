import {
  useEffect, useState, Fragment,
} from 'react';

import { ptBR, enCA } from 'date-fns/locale';
import moment from 'moment';
import DatePicker, { registerLocale } from 'react-datepicker';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { Helmet } from 'react-helmet';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import { withTransaction } from '@elastic/apm-rum-react';

import {
  Select,
  EnergyEfficiencyCard,
  MachineCard,
  ConnectedDevices,
  EnvCard,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { saveSessionStorageItem, removeSessionStorageItem, getSessionStorageItem } from '~/helpers/cachedStorage';
import { apiCall } from '~/providers';
import i18n from '~/i18n';

import 'react-datepicker/dist/react-datepicker.css';
import { getUserProfile } from '~/helpers/userProfile';
import { useTranslation } from 'react-i18next';
import { getDates } from '~/helpers/formatTime';
import { useCard } from '~/contexts/CardContext';
import { EnergyCard } from '~/components/EnergyCard';
import { WaterCard } from '~/components/WaterCard';
import { EnergyCardProvider } from '~/components/EnergyCard/EnergyCardContext';
import { TListFilters, UtilFilter } from '~/pages/Analysis/Utilities/UtilityFilter';
import { setValueState } from '~/helpers/genericHelper';

registerLocale('pt-BR', ptBR);
registerLocale('en', enCA);

const AUTOMATION_STATS_INITIAL_VALUE = {
  automated: {
    machines: 0,
    powerTR: 0,
  },
  notAutomated: {
    machines: 0,
    powerTR: 0,
  },
  dacAutomation: {
    machines: 0,
    powerTR: 0,
  },
  damAutomation: {
    machines: 0,
    powerTR: 0,
  },
  dutAutomation: {
    machines: 0,
    powerTR: 0,
  },
  scheduleOnly: {
    machines: 0,
    powerTR: 0,
  },
  ecoOnly: {
    machines: 0,
    powerTR: 0,
  },
  scheduleAndEco: {
    machines: 0,
    powerTR: 0,
  },
  noEcoNoSched: {
    machines: 0,
    powerTR: 0,
  },
};

const ENERGY_EFFICIENCY_INITIAL_VALUE = {
  savings: { price: 0 },
  greenAntConsumption: { price: 0, kwh: 0 },
  condenserConsumption: { price: 0, kwh: 0 },
  unhealthyConsumption: { kwh: 0 },
};

interface UtilsCountList {
  maquinas: {
    catalogadas: number;
    monitoradas: {
      online: number;
      offline: number;
    }
  },
  ambientes: {
    online: number;
    offline: number;
    unMonitored: number;
  },
  energia: {
    online: number;
    offline: number;
  },
  agua: {
    online: number;
    offline: number;
  },
  iluminacao: {
    online: number;
    offline: number;
  },
  nobreak: {
    online: number;
    offline: number;
  },
}

export const getDatesList = (date: moment.Moment, numDays: number) : { mdate: moment.Moment, YMD: string, DMY: string }[] => {
  const dateList = [] as {
    mdate: moment.Moment,
    YMD: string,
    DMY: string,
  }[];

  for (let i = 0; i < numDays; i++) {
    const mdate = moment(date).add(i, 'days');
    dateList.push({
      mdate,
      DMY: mdate.format('DD/MM/YYYY'),
      YMD: mdate.format('YYYY-MM-DD'),
    });
  }

  return dateList;
};

export const Overview = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const [profile] = useState(getUserProfile);
  const { t } = useTranslation();
  const initialFilterOptions = [t('unidade'), t('cidade'), t('estado')];
  const [state, render, setState] = useStateVar({
    isModalOpen: false,
    selectedFilter: t('unidade'),
    filterOptions: initialFilterOptions,
    unitsList: [] as { value: number, name: string }[],
    supervisorsList: [] as { value: string, name: string }[],
    selectedSupervisor: setValueState('filterSupervisor') as any[],
    selectedUnit: setValueState('filterUnit') as any[],
    selectedClientFilter: [] as any[],
    utilsCount: {
      ativo: { online: 0, offline: 0 },
      maquinas: {
        catalogadas: 0,
        monitoradas: {
          online: 0,
          offline: 0,
        },
      },
      ambientes: { online: 0, offline: 0, unMonitored: 0 },
      energia: { online: 0, offline: 0 },
      agua: { online: 0, offline: 0 },
      iluminacao: { online: 0, offline: 0 },
      nobreak: { online: 0, offline: 0 },
    } as UtilsCountList,
    citiesList: [] as { value: string, name: string }[],
    selectedCity: setValueState('filterCity') as any[],
    statesList: [] as { value: string, name: string }[],
    selectedState: setValueState('filterStates') as any[],
    classesList: [] as {
      client: {CLIENT_ID: number, CLIENT_NAME: string},
      class: {CLASS_ID: number, CLASS_TYPE: string, CLASS_NAME: string},
      units: {UNIT_ID: number, UNIT_NAME: string}[]
    }[],
    selectedClass: [],

    envCardLoadDataParams: null as null|{
      selectedUnit: number[]
      selectedCity: string[]
      selectedState: number[]
      selectedClient: number[]
      selectedTimeRange: string
      date: moment.Moment
      endDate: moment.Moment
      monthDate: Date
      startDate: moment.Moment
    },

    selectedTimeRange: t('mes'),
    date: moment().subtract(1, 'days'),
    monthDate: moment().startOf('month').toDate(),
    startDate: moment().subtract(2, 'days'),
    endDate: moment().subtract(1, 'days'),
    dateList: getDatesList(moment().startOf('month'), new Date(moment().startOf('month').year(), moment().startOf('month').month() + 1, 0).getDate()),
    focusedInput: null,
    focused: false,

    devicesCount: {
      onlineDevs: 0,
      offlineDevs: 0,
    },

    unitsCount: {
      onlineUnits: 0,
      offlineUnits: 0,
    },

    automationStats: AUTOMATION_STATS_INITIAL_VALUE,

    energyEfficiency: ENERGY_EFFICIENCY_INITIAL_VALUE,

    automationList: [] as {
      UNIT_NAME: string;
      automDevType: 'dac'|'dut'|'dam';
      automDevId: string;
      useSchedule: boolean;
      useEcoMode: boolean;
    }[],

    automationPag: {
      tablePage: 1,
      tablePageSize: 20,
      totalItems: 0,
    },

    invoices: [] as
    {
      month: string,
      percentageTotalCharges: number,
      percentageTotalMeasured: number,
      totalCharges: number,
      totalMeasured: number,
      percentageInvoices: number,
    }[],

    invoicedList: [] as {
      unitId: number,
      unitName: string,
      totalCharges: number,
      totalBaselineCharges: number,
      variationCharges: number,
      totalMeasured: number,
      totalBaselineMeasured: number,
      variationMeasured: number,
    }[],

    maxTotalCharges: 0,
    maxTotalMeasured: 0,
    measurementUnit: 'kWh',
    yPointsTotalCharges: [4000, 3000, 2000, 1000, 0] as number[],
    yPointsTotalMeasured: [4000, 3000, 2000, 1000, 0] as number[],
    hideDefaultTab: false,

    isLoadingAutomationTypeList: false,
    isLoadingEfficiencyOverviewCard: false,
    isLoadingEfficiencyOverviewCardInvoiceTab: false,
    isLoadingClassesList: false,
    isLoadingUnitsList: false,
    isLoadingCitiesList: false,
    isLoadingStatesList: false,
    isLoadingOnlineDevicesOverview: false,
    isLoadingAutomationOverviewCard: false,
    showEnergyEfficiencyInvoices: false,
    energyCardFilters: { startObject: true } as {
      startObject?: boolean,
      unitIds?: number[],
      stateIds?: number[],
      cityIds?: string[],
      clientIds?: number[],
      supervisorIds?: string[]
    },
  });

  const isLoading = state.isLoadingAutomationTypeList
      || state.isLoadingEfficiencyOverviewCard
      || state.isLoadingClassesList
      || state.isLoadingUnitsList
      || state.isLoadingCitiesList
      || state.isLoadingStatesList
      || state.isLoadingOnlineDevicesOverview
      || state.isLoadingAutomationOverviewCard;

  function onRangeTypeChange(e) {
    if (e === t('semana')) {
      state.selectedTimeRange = t('semana');
      state.dateList = getDatesList(state.date, 7);
    } else if (e === t('dia')) {
      state.selectedTimeRange = t('dia');
      state.dateList = getDatesList(state.date, 1);
    } else if (e === t('flexivel')) {
      state.selectedTimeRange = t('flexivel');
      state.dateList = getDatesList(state.startDate, state.endDate.diff(state.startDate, 'days') + 1);
    } else if (e === t('mes')) {
      state.selectedTimeRange = t('mes');
      state.dateList = getDatesList(moment(state.monthDate), new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate());
    }

    render();
    loadData();
  }

  function automationTypeList(page?: number) {
    state.isLoadingAutomationTypeList = true;
    render();

    if (!page) state.automationPag.tablePage = 1;

    apiCall('/automation-type-list', {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
      clientIds: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
      unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
      cityIds: state.selectedCity.length ? state.selectedCity : undefined,
      stateIds: state.selectedState.length ? state.selectedState.map((num) => num.toString()) : undefined,
      SKIP: (state.automationPag.tablePage - 1) * state.automationPag.tablePageSize,
      LIMIT: state.automationPag.tablePageSize,
    }).then((automationList) => {
      if (automationList) {
        state.automationList = (automationList && automationList.list) || [];
        state.automationPag.totalItems = automationList.totalItems;
      }
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroSaudeMaquinas'));
    }).finally(() => {
      state.isLoadingAutomationTypeList = false;
      render();
    });
  }

  // function energyEfficiencyOverviewCard() {
  //   state.isLoadingEfficiencyOverviewCard = true;
  //   render();

  //   const numDays = state.selectedTimeRange === t('semana')
  //     ? 7
  //     : (state.selectedTimeRange === t('dia') ? 1
  //       : (state.selectedTimeRange === t('mes')
  //         ? new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate()
  //         : state.endDate.diff(state.startDate, 'days') + 1));

  //   const dateStart = state.selectedTimeRange === t('mes')
  //     ? moment(state.monthDate).format(DATE_FORMAT)
  //     : (state.selectedTimeRange === t('flexivel')
  //       ? state.startDate.format(DATE_FORMAT)
  //       : state.date.format(DATE_FORMAT));

  //   apiCall('/energy-efficiency-overview-card', {
  //     INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
  //     dayStart: dateStart,
  //     numDays,
  //     unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
  //     cityIds: state.selectedCity.length ? state.selectedCity : undefined,
  //     stateIds: state.selectedState.length > 0 ? state.selectedState.map((num) => num.toString()) : undefined,
  //   }).then((energyEfficiency) => {
  //     if (energyEfficiency) state.energyEfficiency = energyEfficiency;
  //     render();
  //   }).catch((err) => {
  //     console.log(err);
  //     toast.error(t('erroEficienciaEnergetica'));
  //   }).finally(() => {
  //     state.isLoadingEfficiencyOverviewCard = false;
  //     render();
  //   });
  // }

  function energyEfficiencyInvoiceTab() {
    state.isLoadingEfficiencyOverviewCardInvoiceTab = true;
    render();
    const { dateStart, dateEnd } = getDates(state);

    apiCall('/invoice/get-invoices-overview', {
      periodStart: dateStart.toISOString(),
      periodEnd: dateEnd.toISOString(),
      unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
      cityIds: state.selectedCity.length ? state.selectedCity : undefined,
      clientIds: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
      stateIds: state.selectedState.length ? state.selectedState.map((num) => num.toString()) : undefined,
    }).then((result) => {
      if (result) {
        state.invoices = result.invoicesTotal;
        state.invoicedList = result.unitsInvoice;
        state.maxTotalCharges = result.maxTotalCharges;
        state.maxTotalMeasured = result.maxTotalMeasured;
        state.measurementUnit = result.measurementUnit;
      }
      calculeYInvoicesTicks();
      calculePercentageBar();
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroEficienciaEnergetica'));
    }).finally(() => {
      state.isLoadingEfficiencyOverviewCardInvoiceTab = false;
      render();
    });
  }

  async function getWaterDevices() {
    try {
      const water = await apiCall('/get-integrations-list/water-overview-v2', {
        INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
        unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
        cityIds: state.selectedCity.length ? state.selectedCity : undefined,
        stateIds: state.selectedState.length > 0 ? state.selectedState : undefined,
        clientIds: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
      });

      state.utilsCount.agua.online = water.count.online;
      state.utilsCount.agua.offline = water.count.offline;
    } catch (err) {
      console.error(err);
      toast.error(t('erroAgua'));
    }
  }

  function getClassesList() {
    state.isLoadingClassesList = true;
    render();

    apiCall('/clients/get-classes-list', {}).then((classesList) => {
      state.classesList = classesList.list;
      classesList.list.forEach((item) => {
        if (!state.filterOptions.includes(item.class.CLASS_TYPE)) state.filterOptions.push(item.class.CLASS_TYPE);
      });
      if (state.classesList.map((item) => item.class.CLASS_TYPE).includes(state.selectedFilter)) {
        const list = [] as number[];
        state.selectedClass.forEach((classId) => {
          const currentClass = state.classesList.find((item) => item.class.CLASS_ID === classId);
          if (currentClass) {
            list.push(...currentClass.units.map((unit) => unit.UNIT_ID));
          }
        });

        state.selectedUnit = list;
      }
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroClasseDeUnidades'));
    }).finally(() => {
      state.isLoadingClassesList = false;
      render();
    });
  }

  async function getNobreakDevices() {
    try {
      await apiCall('/dmt/get-dmt-nobreak-list', {
        INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
        unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
        cityIds: state.selectedCity.length ? state.selectedCity : undefined,
        stateIds: state.selectedState.length > 0 ? state.selectedState : undefined,
      }).then(async (nobreakList) => {
        nobreakList.forEach((nobreak) => {
          if (nobreak.connection === 'ONLINE') {
            state.utilsCount.nobreak.online++;
          } else {
            state.utilsCount.nobreak.offline++;
          }
        });
      });
    } catch (err) {
      console.log(err);
      toast.error(t('erroNobreak'));
    }
  }

  async function getIlluminationDevices() {
    try {
      await apiCall('/dal/get-dal-illumination-list', {
        INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
        unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
      }).then(async (illuminationList) => {
        illuminationList.forEach((illumination) => {
          if (illumination.connection === 'ONLINE') {
            state.utilsCount.iluminacao.online++;
          } else {
            state.utilsCount.iluminacao.offline++;
          }
        });
      });
    } catch (err) {
      console.log(err);
      toast.error(t('erroIluminacao'));
    }
  }

  async function filterAndCountStatus(list, selectedFilter, selectedValues, state, statusKey) {
    try {
      state.utilsCount[statusKey].offline = 0;
      state.utilsCount[statusKey].online = 0;

      for (const item of list) {
        if (item.status === 'ONLINE') {
          state.utilsCount[statusKey].online++;
        } else {
          state.utilsCount[statusKey].offline++;
        }
      }
    } catch (err) {
      console.error('Error in filterAndCountStatus:', err);
      throw err;
    }
  }

  async function getEnergyDevices() {
    try {
      const list = await apiCall('/energy/get-energy-list-overview-v2', {
        INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
        unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
        cityIds: state.selectedCity.length ? state.selectedCity : undefined,
        stateIds: state.selectedState.length > 0 ? state.selectedState : undefined,
        clientIds: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
      });

      state.utilsCount.energia.offline = list.count.offline;
      state.utilsCount.energia.online = list.count.online;
    } catch (err) {
      console.error('Error in getEnergyDevices:', err);
      toast.error(t('erroEnergia'));
    }
  }

  async function getEnvironmentList() {
    try {
      const environmentsList = await apiCall('/environments/get-environment-list-overview-v2',
        paramsCommon());

      if (environmentsList) {
        state.utilsCount.ambientes.unMonitored = environmentsList.count.unMonitored;
        state.utilsCount.ambientes.offline = environmentsList.count.offline;
        state.utilsCount.ambientes.online = environmentsList.count.online;
      }
    } catch (err) {
      console.error('Error in getEnvironmentList:', err);
      toast.error(t('erroAmbientes'));
    }
  }

  const paramsCommon = () => ({
    INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
    unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
    cityIds: state.selectedCity.length ? state.selectedCity : undefined,
    stateIds: state.selectedState.length > 0 ? state.selectedState : undefined,
    clientIds: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
  });

  async function getMachinesList() {
    try {
      const machines = await apiCall('/clients/get-machines-list-overview-v2', paramsCommon());
      if (machines) {
        state.utilsCount.maquinas.catalogadas = machines.count.total;
        state.utilsCount.maquinas.monitoradas.offline = machines.count.offline;
        state.utilsCount.maquinas.monitoradas.online = machines.count.online;
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erroMaquinasMonitoradas'));
    }
  }

  function countUnits(unitsList) {
    state.unitsCount.offlineUnits = 0;
    state.unitsCount.onlineUnits = 0;

    for (const unit of unitsList) {
      const selectedFilter = state.selectedFilter;

      if (
        (selectedFilter === t('unidade') && state.selectedUnit.includes(unit.UNIT_ID))
            || (selectedFilter === t('cidade') && state.selectedCity.includes(unit.CITY_ID))
            || (selectedFilter === t('estado') && state.selectedState.includes(unit.STATE_ID))
      ) {
        if (unit.PRODUCTION) {
          state.unitsCount.onlineUnits++;
        } else {
          state.unitsCount.offlineUnits++;
        }
      } else if (unit.PRODUCTION) {
        state.unitsCount.onlineUnits++;
      } else {
        state.unitsCount.offlineUnits++;
      }
    }
  }

  async function getSupervisor(unitsList) {
    apiCall('/clients/get-unit-supervisors', { UNIT_IDS: unitsList.map((unit) => unit.UNIT_ID) }).then(({ list: supervisors }) => {
      const formattedData = supervisors.map((supervisor) => ({
        name: `${supervisor.NOME} ${supervisor.SOBRENOME}`,
        value: supervisor.USER_ID,
      }));
      const list = [] as { name: string, value: string }[];
      formattedData.forEach((supervisorOptions) => {
        const { name, value } = supervisorOptions;
        if (!list.find((item) => item.name === name && item.value === value)) {
          list.push({ name, value });
        }
      });
      state.supervisorsList = list;
      render();
    }).finally(() => {
      if (state.supervisorsList.length > 0
        && (!state.filterOptions.includes(t('responsaveis')))) {
        state.filterOptions.push(t('responsavel'));
      }
    });
  }

  async function getUnitsList() {
    state.isLoadingUnitsList = true;
    render();

    await Promise.all([
      getWaterDevices(),
      getEnergyDevices(),
      // getNobreakDevices(), desativado temporariamente para refatoração
      // getIlluminationDevices(), desativado temporariamente para refatoração
      getEnvironmentList(),
      getMachinesList(),
    ]);

    await apiCall('/clients/get-units-list-basic', {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
      UNIT_IDS: state.selectedUnit,
      CLIENT_IDS: state.selectedClientFilter,
      STATE_IDS: state.selectedState,
      CITY_IDS: state.selectedCity,
    }).then(async ({ list: unitsList, totalItems }) => {
      countUnits(unitsList);

      state.unitsList = unitsList && unitsList.map((unit) => ({
        value: unit.UNIT_ID,
        name: unit.UNIT_NAME,
      }));
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroUnidades'));
    }).finally(() => {
      state.isLoadingUnitsList = false;
      render();
    });
  }

  function getCitiesList() {
    state.isLoadingCitiesList = true;
    render();

    apiCall('/dac/get-cities-list', {}).then((citiesList) => {
      state.citiesList = citiesList && citiesList.list.map((city) => ({
        value: city.id,
        name: city.name,
      }));
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroCidades'));
    }).finally(() => {
      state.isLoadingCitiesList = false;
      render();
    });
  }

  function getStatesList() {
    state.isLoadingStatesList = true;
    render();

    apiCall('/dac/get-states-list', {}).then((statesList) => {
      state.statesList = statesList && statesList.list.map((state) => ({
        value: state.id,
        name: state.name,
      }));
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroEstados'));
    }).finally(() => {
      state.isLoadingStatesList = false;
      render();
    });
  }

  const onAutomationPageChange = (page) => {
    state.automationPag.tablePage = page;
    automationTypeList(page);
    render();
  };

  function onlineDevicesOverview() {
    state.isLoadingOnlineDevicesOverview = true;
    render();

    apiCall('/online-devices-overview', {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
      unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
      cityIds: state.selectedCity.length ? state.selectedCity : undefined,
      stateIds: state.selectedState.length > 0 ? state.selectedState.map((num) => num.toString()) : undefined,
      clientIds: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
    }).then((devicesCount) => {
      state.devicesCount = devicesCount;
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroDAMs'));
    }).finally(() => {
      state.isLoadingOnlineDevicesOverview = false;
      render();
    });
  }

  function automationOverviewCard() {
    state.isLoadingAutomationOverviewCard = true;
    render();

    apiCall('/automation-overview-card', {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients,
      unitIds: state.selectedUnit.length ? state.selectedUnit : undefined,
      cityIds: state.selectedCity.length ? state.selectedCity : undefined,
      stateIds: state.selectedState.length > 0 ? state.selectedState.map((num) => num.toString()) : undefined,
      CLIENT_IDS: state.selectedClientFilter.length ? state.selectedClientFilter : undefined,
    }).then((automationStats) => {
      if (automationStats) state.automationStats = automationStats.automationStats;
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroAutomacao'));
    }).finally(() => {
      state.isLoadingAutomationOverviewCard = false;
      render();
    });
  }

  async function loadData() {
    if (state.classesList.map((item) => item.class.CLASS_TYPE).includes(state.selectedFilter)) {
      const list = [] as number[];
      state.selectedClass.forEach((classId) => {
        const currentClass = state.classesList.find((item) => item.class.CLASS_ID === classId);
        if (currentClass) {
          list.push(...currentClass.units.map((unit) => unit.UNIT_ID));
        }
      });

      state.selectedUnit = list;
    }

    if (state.selectedSupervisor.length > 0) {
      let list = [] as number[];
      const data = await Promise.all(state.selectedSupervisor.map(async (userId) => apiCall('/clients/get-supervisor-units', { USER_ID: userId })));
      const formattedData = data.map(({ list }) => list);
      formattedData.forEach((ids) => {
        list = list.concat(ids);
      });

      state.selectedUnit = list;
    }

    // state.filterOptions = initialFilterOptions;
    state.automationStats = AUTOMATION_STATS_INITIAL_VALUE;
    state.energyEfficiency = ENERGY_EFFICIENCY_INITIAL_VALUE;
    state.automationList = [];
    state.devicesCount = {
      onlineDevs: 0,
      offlineDevs: 0,
    };
    state.unitsCount.offlineUnits = 0;
    state.unitsCount.onlineUnits = 0;
    state.utilsCount = {
      agua: {
        online: 0,
        offline: 0,
      },
      energia: {
        online: 0,
        offline: 0,
      },
      nobreak: {
        online: 0,
        offline: 0,
      },
      iluminacao: {
        online: 0,
        offline: 0,
      },
      ambientes: {
        online: 0,
        offline: 0,
        unMonitored: 0,
      },
      maquinas: {
        monitoradas: {
          online: 0,
          offline: 0,
        },
        catalogadas: 0,
      },
    };

    state.envCardLoadDataParams = {
      selectedUnit: state.selectedUnit,
      selectedCity: state.selectedCity,
      selectedState: state.selectedState,
      selectedTimeRange: state.selectedTimeRange,
      selectedClient: state.selectedClientFilter,
      date: state.date,
      endDate: state.endDate,
      startDate: state.startDate,
      monthDate: state.monthDate,
    };

    state.energyCardFilters = {
      clientIds: state.selectedClientFilter,
      unitIds: state.selectedUnit,
      cityIds: state.selectedCity,
      stateIds: state.selectedState,
      supervisorIds: state.selectedSupervisor,
    };

    render();

    automationTypeList();
    // energyEfficiencyOverviewCard();
    energyEfficiencyInvoiceTab();
    await getUnitsList();
    getClassesList();
    getCitiesList();
    getStatesList();
    onlineDevicesOverview();
    automationOverviewCard();
  }

  async function loadOverviewFilters() {
    const filters = getSessionStorageItem('overviewFilters') as null|{
        selectedFilter: string,
        selectedUnit: [],
        selectedCity: [],
        selectedState: [],
        selectedClass: [],
        selectedSupervisor: [],
        selectedClient: [],
    };
    if (filters) {
      state.selectedFilter = filters.selectedFilter || t('unidade');
      state.selectedUnit = filters.selectedUnit || [];
      state.selectedCity = filters.selectedCity || [];
      state.selectedState = filters.selectedState || [];
      state.selectedClass = filters.selectedClass || [];
      state.selectedSupervisor = filters.selectedSupervisor || [];
      state.selectedClientFilter = filters.selectedClient || [];
    }
    render();
    removeSessionStorageItem('overviewFilters');
  }

  function saveOverviewFilters() {
    saveSessionStorageItem('overviewFilters', {
      selectedFilter: state.selectedFilter,
      selectedUnit: state.selectedUnit,
      selectedCity: state.selectedCity,
      selectedState: state.selectedState,
      selectedClass: state.selectedClass,
      selectedSupervisor: state.selectedSupervisor,
      selectedClient: state.selectedClientFilter,
    });
  }

  useEffect(() => {
    loadOverviewFilters();
    loadData();
  }, []);

  function calculeYInvoicesTicks() {
    if (state.invoices && state.invoices.length < 1) {
      return;
    }

    state.yPointsTotalCharges = [];
    state.yPointsTotalMeasured = [];
    const multipleToYMeasured = state.measurementUnit === 'MWh' ? 4 : 500;
    let auxPointsTotalCharges = state.maxTotalCharges + (500 - state.maxTotalCharges % 500); // Find next multiple of 500
    state.yPointsTotalCharges.push(auxPointsTotalCharges);
    let auxPointsTotalMeasured = state.maxTotalMeasured + (multipleToYMeasured - state.maxTotalMeasured % multipleToYMeasured); // Find next multiple of 500 if kWh, 4 if MWh
    state.yPointsTotalMeasured.push(auxPointsTotalMeasured);

    for (let i = 0; i < 3; i++) {
      auxPointsTotalCharges = (state.yPointsTotalCharges[0] / 4) * (3 - i);
      state.yPointsTotalCharges.push(auxPointsTotalCharges);
      auxPointsTotalMeasured = (state.yPointsTotalMeasured[0] / 4) * (3 - i);
      state.yPointsTotalMeasured.push(auxPointsTotalMeasured);
    }

    state.yPointsTotalCharges.push(0);
    state.yPointsTotalMeasured.push(0);
  }

  function calculePercentageBar() {
    if (!state.invoices) {
      return;
    }

    for (let i = 0; i < state.invoices.length; i++) {
      state.invoices[i].percentageTotalCharges = Math.round((100 * state.invoices[i].totalCharges / state.yPointsTotalCharges[0]) * 100 / 100);
      state.invoices[i].percentageTotalMeasured = Math.round((100 * state.invoices[i].totalMeasured / state.yPointsTotalMeasured[0]) * 100 / 100);
    }
  }

  const buildSelectedFilter = () => {
    if (state.selectedUnit.length > 0) {
      return { unitIds: state.selectedUnit };
    }
    if (state.selectedState.length > 0) {
      return { stateIds: state.selectedState.map((num) => num.toString()) };
    }
    if (state.selectedCity.length > 0) {
      return { cityIds: state.selectedCity };
    }
    return undefined;
  };

  function verifyFilter(search: string[]) {
    if (search.length === 0) return null;

    return [...search].map((x) => Number(x));
  }

  function verifyAllFilters() {
    if (state.selectedUnit.length) {
      state.selectedUnit = verifyFilter(state.selectedUnit) ?? [];
    }
    if (state.selectedState.length) {
      state.selectedState = verifyFilter(state.selectedState) ?? [];
    }
    if (state.selectedClientFilter.length) {
      state.selectedClientFilter = verifyFilter(state.selectedClientFilter) ?? [];
    }
  }

  const handleFilter = async () => {
    verifyAllFilters();
    await loadData();

    render();
  };

  const { cards } = useCard();
  const cardOrder = cards.map((card) => card.title);
  const orderedCards = cardOrder.map((title) => cards.find((card) => card.title === title)).filter(Boolean);

  const listFilters: TListFilters[] = [
    'cliente',
    'unidade',
    'estado',
    'cidade',
    'responsavel',
    'grupo',
    'periodo',
    'dataNew',
  ];

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaVisaoGeral')}</title>
      </Helmet>
      <div style={{
        margin: '-20px -20px 0 -20px',
      }}
      >
        <UtilFilter
          state={state}
          render={render}
          onAply={handleFilter}
          setState={setState}
          listFilters={listFilters}
          margin
          filterFooter
          isLoading={isLoading}
          removeYearFilter
          fixedPeriod
          closeDefault
          closeFilter
        />
      </div>
      <div style={{ position: 'relative', marginLeft: '10px' }}>
        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={30}>
          {/* @ts-ignore */}
          <ConnectedDevices
            utils={state.utilsCount}
            unitsSelected={state.selectedUnit}
            unitsCount={state.unitsCount}
            devicesCount={state.devicesCount}
            isLoading={state.isLoadingOnlineDevicesOverview || state.isLoadingUnitsList}
          />
        </Flex>

        <Flex flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" width={1}>
          {orderedCards.map((card) => (
            <Fragment key={card?.title}>
              {card?.title === 'Energia' && card?.isActive && (
                <EnergyCardProvider>
                  <EnergyCard energyCardFilters={state.energyCardFilters} />
                </EnergyCardProvider>
              )}
              {card?.title === 'Ambientes' && card?.isActive && (
                <EnvCard
                  paramsForLoadData={state.envCardLoadDataParams}
                  manageAllClients={profile?.manageAllClients}
                  enableHistoryTab
                  selectedFilter={buildSelectedFilter()}
                  saveOverviewFilters={saveOverviewFilters}
                />
              )}
              {card?.title === 'Máquinas' && card?.isActive && (
                <MachineCard
                  paramsForLoadData={state.envCardLoadDataParams}
                  manageAllClients={profile?.manageAllClients}
                  enableHistoryTab
                  selectedFilter={buildSelectedFilter()}
                  saveOverviewFilters={saveOverviewFilters}
                />
              )}
              {/* {card?.title === 'Ef. Energética' && card?.isActive && (
                <EnergyEfficiencyCard
                  selectedTimeRange={state.selectedTimeRange}
                  dateList={state.dateList}
                  isLoadingEfficiencyOverviewCard={state.isLoadingEfficiencyOverviewCard}
                  isLoadingInvoices={state.isLoadingEfficiencyOverviewCardInvoiceTab}
                  invoices={state.invoices}
                  selectedUnit={state.selectedUnit}
                  energyEfficiency={state.energyEfficiency}
                  saveOverviewFilters={saveOverviewFilters}
                  invoicedList={state.invoicedList}
                  yPointsTotalCharges={state.yPointsTotalCharges}
                  yPointsTotalMeasured={state.yPointsTotalMeasured}
                  measurementUnit={state.measurementUnit}
                />
              )} */}
              {card?.title === 'Agua' && card?.isActive && (
                <WaterCard
                  paramsForLoadData={state.envCardLoadDataParams}
                  manageAllClients={profile?.manageAllClients}
                  enableHistoryTab
                  selectedFilter={buildSelectedFilter()}
                  saveOverviewFilters={saveOverviewFilters}
                />
              )}
            </Fragment>
          ))}
        </Flex>
      </div>
    </>
  );
};

export default withTransaction('Overview', 'component')(Overview);
