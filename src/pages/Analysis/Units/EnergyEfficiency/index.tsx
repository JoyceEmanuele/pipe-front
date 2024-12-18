import { useEffect, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import ptBR from 'date-fns/locale/pt-BR';
import moment from 'moment';
import DatePicker, { registerLocale } from 'react-datepicker';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Box, Flex } from 'reflexbox';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import Checkbox from '@material-ui/core/Checkbox';
import { t } from 'i18next';
import {
  ModalLoading, Select, Loader, Card, EnergyEfficiencyGeneral, EnergyEfficiencyMachines, EnergyEfficiencyMachine, EnergyEfficiencyInvoice, EnergyMeterDemand, Button, ModalWindow, SelectMultiple,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { TUnitInfo, UnitLayout } from '~/pages/Analysis/Units/UnitLayout';
import { apiCall, ApiResps } from '~/providers';
import {
  ThunderIcon,
  ExpandIcon,
  StatisticsIcon,
  ExportPdfIcon,
  InfoIcon,
} from '~/icons';
import { colors } from '~/styles/colors';
import {
  CompiledEnergyData,
  compileEnergyData,
} from '~/helpers/energyData';
import { DataExportModal } from './DataExportModal';

import {
  ContentDate,
  StyledCalendarIcon,
  Label,
  Section,
  ChevronDown,
  ChevronUp,
  Title,
  IconWrapper,
  TopTitle,
  TopDate,
  ArrowButton,
  ExportButton,
  CardNoService,
  ModalContainerLoading,
  SearchInput,
  TextLabel,
} from './styles';
import i18n from '~/i18n';
import 'react-datepicker/dist/react-datepicker.css';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { ListBoxOptionColor } from '~/components/EnvGroupAnalysis/styles';
import * as XLSX from 'xlsx';
import { getDates } from '~/helpers/formatTime';
import { TelemetryDemandCard } from './TelemetryDemandCard';
import { withTransaction } from '@elastic/apm-rum-react';
import { getDatesList } from '~/helpers/dates';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { generateNameFormatted } from '~/helpers/titleHelper';

registerLocale('pt-BR', ptBR);

let CSVheader = [] as any;

const metersColors = [
  '#2e6c39',
  '#4aa159',
  '#70c87e',
  '#adfcba'];

export type IEnergyMeter = ApiResps['/energy/get-energy-list']['list'][number] & {
  checked?: boolean
  color?: string;
};

export interface IMeterDemand {
  day: string,
  totalMeasured: number,
  percentageTotalMeasured: number,
  maxDayTotalMeasured: number,
  yPointsHoursMeasured: number[],
  dataIsInvalid?: boolean,
  dataIsProcessed?: boolean,
  hours: {
    hour: string,
    totalMeasured: number,
    percentageTotalMeasured?: number,
    dataIsInvalid?: boolean,
    dataIsProcessed?: boolean,
  }[],
}

export const EnergyEfficiency = () => {
  const idioma = i18n.language;
  moment.locale(idioma === 'pt' ? 'pt-BR' : 'en');
  const monthNames = [t('mesesDoAno.janeiro'), t('mesesDoAno.fevereiro'), t('mesesDoAno.marco'), t('mesesDoAno.abril'), t('mesesDoAno.maio'), t('mesesDoAno.junho'), t('mesesDoAno.julho'), t('mesesDoAno.agosto'), t('mesesDoAno.setembro'), t('mesesDoAno.outubro'), t('mesesDoAno.novembro'), t('mesesDoAno.dezembro')];
  const routeParams = useParams<{ unitId: string }>();
  const energyCsvLinkEl = useRef();
  const machinesCsvLinkEl = useRef();
  const [state, render] = useStateVar(() => ({
    unitId: Number(routeParams.unitId),
    unitInfo: null as null | TUnitInfo,
    isLoading: false,
    focused: false,
    selectedTimeRange: t('mes'),
    date: moment().subtract(1, 'days'),
    monthDate: moment().startOf('month').toDate(),
    startDate: moment().subtract(2, 'days'),
    endDate: moment().subtract(1, 'days'),
    dateList: getDatesList(moment().startOf('month'), new Date(moment().startOf('month').year(), moment().startOf('month').month() + 1, 0).getDate()),
    groupedMachines: [] as {
      id: number,
      name: string,
      dacs: {
        id: string,
        name: string,
        groupId: number,
        groupName: string,
        pot: number,
        health: number,
        kw: number,
        status: string,
        cons: object,
        sumCons: number,
        extTemp: object,
        extTempMax: object,
        extTempMin: object,
        coloredCons: null,
      }[],
      pot: number,
      consH: number,
      consKWH: number,
      rangeCons: string,
      onlyDutsInCondensers: boolean,
      machineHasDacs: boolean,
    }[],
    unitHasDacs: false,
    averageTariff: '0',
    consumptionSum: 0,
    opportunity: 0,
    greenAntSum: 0,
    greenAntInvoiceSum: 0,
    sumSavingsKWh: 0,
    higherConsumptionCounter: 0,
    mediumConsumptionCounter: 0,
    lowerConsumptionCounter: 0,
    zeroConsumptionCounter: 0,
    savingTarifa: false,
    dataTotalConsPercent: 0,
    automationSavings: {} as {
      [dacId: string]: {
        [day: string]: {
          totalEst: number;
        };
      };
    },
    showMachines: true,
    showInvoice: true,
    showEnergyMeter: true,
    focusedInput: null,
    order: t('maiorConsumo'),
    invoices: [] as null | {
      month: string,
      periodFrom: string,
      periodUntil: string,
      totalCharges: number,
      totalMeasured: number,
      percentageTotalCharges: number,
      percentageTotalMeasured: number,
      baselinePrice: number,
      baselineKwh: number,
      percentageBaselinePrice: number,
      percentageBaselineKwh: number,
    }[],
    maxTotalCharges: 0 as number,
    maxTotalMeasured: 0 as number,
    yPointsTotalCharges: [4000, 3000, 2000, 1000, 0] as number[],
    yPointsTotalMeasured: [4000, 3000, 2000, 1000, 0] as number[],
    demandsByMeter: {} as {
      [key: string] : IMeterDemand[]
    },
    consumption_by_device_machine: [] as {
      machine_id: number;
      device_code: string,
      total_refrigeration_consumption: number;
      total_utilization_time: number;
    }[],
    maxTotalDemandsMeasured: {} as {
      [key: string] : number
    },
    maxTotalDemandMeasured: 0 as number,
    maxTotalDemandMeasuredAllMeters: 0 as number,
    yPointsDemandTotalMeasured: [4, 3, 2, 1, 0] as number[],
    energyMetersList: [] as IEnergyMeter[],
    energyMeter: null as null | (ApiResps['/energy/get-energy-list']['list'][0]),
    validInvoiceMonth: true as boolean,
    currentMonthNumber: 1 as number,
    currentYearNumber: 2022 as number,
    energyCsvData: [] as {}[],
    machinesCsvData: [] as {}[],
    exportInvoices: false,
    openExportModal: false as boolean,
    energyMetersFiltered: [] as { name: string; value: string }[],
    selectedEnergyMeters: [] as string[],
    metersTotalDemand: [] as IMeterDemand[],
    yPointsDemandTotalMeasuredAllMeters: [4, 3, 2, 1, 0] as number[],
    numDays: 0,
    totalConsupmtionPeriod: {} as {
      totalKwh: number,
      totalCost: number,
      calc: boolean,
    },
    telemetryInterval: 60 as number,
    demandsData: {} as ApiResps['/energy/get-demand-hist'],
    loadingTelemetryInfos: true as boolean,
    consumptionFlags: {} as {
      dataIsInvalid: boolean,
      dataIsProcessed: boolean
    },
  }));
  const [shouldShowConsumptionByMeter, setShouldShowConsumptionByMeter] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null as null | undefined | IMeterDemand);
  const [selectedDayMeter, setSelectedDayMeter] = useState('' as string);
  const [selectedDayMeterStr, setSelectedDayMeterStr] = useState('' as string);
  const timeRangeDayOrWeek = state.selectedTimeRange === t('dia') || state.selectedTimeRange === t('semana');

  const padronizedRawParams = [
    { label: t('tensaoA'), key: 'v_a' },
    { label: t('tensaoB'), key: 'v_b' },
    { label: t('tensaoC'), key: 'v_c' },
    { label: t('tensaoAB'), key: 'v_ab' },
    { label: t('tensaoBC'), key: 'v_bc' },
    { label: t('tensaoCA'), key: 'v_ca' },
    { label: t('correnteA'), key: 'i_a' },
    { label: t('correnteB'), key: 'i_b' },
    { label: t('correnteC'), key: 'i_c' },
    { label: t('potenciaAtivaA'), key: 'pot_at_a' },
    { label: t('potenciaAtivaB'), key: 'pot_at_b' },
    { label: t('potenciaAtivaC'), key: 'pot_at_c' },
    { label: t('potenciaAparenteA'), key: 'pot_ap_a' },
    { label: t('potenciaAparenteB'), key: 'pot_ap_b' },
    { label: t('potenciaAparenteC'), key: 'pot_ap_c' },
    { label: t('potenciaReativaA'), key: 'pot_re_a' },
    { label: t('potenciaReativaB'), key: 'pot_re_b' },
    { label: t('potenciaReativaC'), key: 'pot_re_c' },
    { label: t('tensaoTrifasicaLN'), key: 'v_tri_ln' },
    { label: t('tensaoTrifasicaLL'), key: 'v_tri_ll' },
    { label: t('potenciaAtivaTrifasica'), key: 'pot_at_tri' },
    { label: t('potenciaAparenteTrifasica'), key: 'pot_ap_tri' },
    { label: t('potenciaReativaTrifasica'), key: 'pot_re_tri' },
    { label: t('energiaAtivaTrifasicaAcumulada'), key: 'en_at_tri' },
    { label: t('energiaReativaTrifasicaAcumulada'), key: 'en_re_tri' },
    { label: t('fatorPotenciaA'), key: 'fp_a' },
    { label: t('fatorPotenciaB'), key: 'fp_b' },
    { label: t('fatorPotenciaC'), key: 'fp_c' },
    { label: t('fatorPotenciaTotal'), key: 'fp' },
    { label: t('frequencia'), key: 'freq' },
    { label: t('demandaPicoPotenciaAtiva'), key: 'demanda_at' },
    { label: t('demandaMedia'), key: 'demanda_med_at' },
    { label: t('alertaErroInstalacao'), key: 'erro' },
  ];

  const padronizedParamsMultipleMeters = {
    v_a: t('tensaoA'),
    v_b: t('tensaoB'),
    v_c: t('tensaoC'),
    v_ab: t('tensaoAB'),
    v_bc: t('tensaoBC'),
    v_ca: t('tensaoCA'),
    i_a: t('correnteA'),
    i_b: t('correnteB'),
    i_c: t('correnteC'),
    pot_at_a: t('potenciaAtivaA'),
    pot_at_b: t('potenciaAtivaB'),
    pot_at_c: t('potenciaAtivaC'),
    pot_ap_a: t('potenciaAparenteA'),
    pot_ap_b: t('potenciaAparenteB'),
    pot_ap_c: t('potenciaAparenteC'),
    pot_re_a: t('potenciaReativaA'),
    pot_re_b: t('potenciaReativaB'),
    pot_re_c: t('potenciaReativaC'),
    v_tri_ln: t('tensaoTrifasicaLN'),
    v_tri_ll: t('tensaoTrifasicaLL'),
    pot_at_tri: t('potenciaAtivaTrifasica'),
    pot_ap_tri: t('potenciaAparenteTrifasica'),
    pot_re_tri: t('potenciaReativaTrifasica'),
    en_at_tri: t('energiaAtivaTrifasicaAcumulada'),
    en_re_tri: t('energiaReativaTrifasicaAcumulada'),
    fp_a: t('fatorPotenciaA'),
    fp_b: t('fatorPotenciaB'),
    fp_c: t('fatorPotenciaC'),
    fp: t('fatorPotenciaTotal'),
    freq: t('frequencia'),
    demanda_at: t('demandaPicoPotenciaAtiva'),
    demanda_med_at: t('demandaMedia'),
    erro: t('alertaErroInstalacao'),
  };

  function onRangeTypeChange(e) {
    setShouldShowConsumptionByMeter(false);
    render();

    if (e === t('semana')) {
      state.selectedTimeRange = t('semana');
      state.dateList = getDatesList(state.date, 7);
      state.telemetryInterval = 60;
    } else if (e === t('dia')) {
      state.dateList = getDatesList(state.date, 1);
      state.selectedTimeRange = t('dia');
      state.telemetryInterval = 15;
    } else if (e === t('flexivel')) {
      state.selectedTimeRange = t('flexivel');
      state.dateList = getDatesList(state.startDate, state.endDate.diff(state.startDate, 'days') + 1);
      state.telemetryInterval = 60;
    } else if (e === t('mes')) {
      state.selectedTimeRange = t('mes');
      state.dateList = getDatesList(moment(state.monthDate), new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate());
      state.telemetryInterval = 60;
    }

    render();
    handleGetUnitInfo();
  }

  function onDateChange(date, dateEnd) {
    setShouldShowConsumptionByMeter(false);
    render();

    if (state.selectedTimeRange === t('semana')) {
      state.date = date;
      render();
      state.dateList = getDatesList(date, 7);
    } else if (state.selectedTimeRange === t('dia')) {
      state.date = date;
      render();
      state.dateList = getDatesList(date, 1);
    } else if (state.selectedTimeRange === t('flexivel')) {
      state.endDate = state.startDate !== date ? null : dateEnd;
      state.startDate = date;
      if (state.endDate) {
        dateEnd.set({
          hour: 12, minute: 0, second: 0, millisecond: 0,
        });
        state.dateList = getDatesList(date, dateEnd.diff(date, 'days') + 1);
      }
    } else if (state.selectedTimeRange === t('mes')) {
      state.monthDate = date;
      state.dateList = getDatesList(moment(date), new Date(moment(date).year(), moment(date).month() + 1, 0).getDate());
    }

    render();
    if (state.startDate && state.endDate) handleGetUnitInfo();
  }

  function calculateNumDays() {
    if (state.selectedTimeRange === t('mes')) {
      state.numDays = new Date().getDate();
    } else if (state.selectedTimeRange === t('dia')) {
      state.numDays = 1;
    } else if (state.selectedTimeRange === t('semana')) {
      state.numDays = 7;
    } else {
      state.numDays = state.dateList.length;
    }
  }

  function auxCombinedLists(device) {
    const cons = {} as { [day: string]: number };
    const extTemp = {} as { [day: string]: number };
    const extTempMax = {} as { [day: string]: number };
    const extTempMin = {} as { [day: string]: number };

    for (const item of (device.CONSUMPTION || [])) {
      if (item.DAY_HOURS_ON == null) continue;

      cons[item.DAT_REPORT] = item.DAY_HOURS_ON;
      extTemp[item.DAT_REPORT] = item.meanT;
      extTempMax[item.DAT_REPORT] = item.maxT;
      extTempMin[item.DAT_REPORT] = item.minT;

      const dayInfo = state.dateList.find((x) => x.YMD === item.DAT_REPORT);
      if (dayInfo) {
        dayInfo.totalAirCondCons = (dayInfo.totalAirCondCons || 0) + (item.DAY_HOURS_ON * (device.DAC_KW || 0));
      }
    }

    return {
      cons,
      extTemp,
      extTempMax,
      extTempMin,
    };
  }

  function getCombinedLists(dacsList, dutsList) {
    const combinedList = [...dacsList, ...dutsList].map((device) => {
      const {
        cons,
        extTemp,
        extTempMax,
        extTempMin,
      } = auxCombinedLists(device);
      let sumCons = 0;
      for (const item of Object.values(cons)) {
        // @ts-ignore
        sumCons = (sumCons ?? 0) + (item * (device.DAC_KW || 0));
      }

      const {
        utilizationTime,
        sumConsComputedDataService,
      } = verifyDataByComputedDataService({
        sumCons, DAC_ID: device.DAC_ID, DEV_ID: device.DEV_ID, DAC_KW: device.DAC_KW, cons,
      });

      if (device.DAC_ID) {
        // @ts-ignore
        state.opportunity += (device.H_INDEX !== 100 ? sumConsComputedDataService : 0);
      }

      return {
        id: device.DAC_ID ?? device.DEV_ID,
        name: device.DAC_NAME ?? device.ASSET_NAME,
        groupId: device.GROUP_ID,
        groupName: device.GROUP_NAME,
        pot: device.DAC_KW,
        health: device.H_INDEX,
        kw: device.DAC_KW,
        status: device.status,
        cons,
        sumCons,
        extTemp,
        extTempMax,
        extTempMin,
        coloredCons: null,
        utilizationTime,
      };
    });
    return combinedList;
  }

  function verifyDataByComputedDataService(params: {sumCons: number, DAC_KW: number|null, DAC_ID: string|null, DEV_ID: string|null, cons: { [day: string]: number }}) {
    let sumConsComputedDataService = 0;

    sumConsComputedDataService = (params.cons[moment().format('YYYY-MM-DD')] || 0) * (params.DAC_KW || 0);
    const consByComputedDataService = state.consumption_by_device_machine.find((x) => x.device_code === params.DAC_ID || params.DEV_ID);
    if (consByComputedDataService) {
      sumConsComputedDataService += Number(consByComputedDataService.total_refrigeration_consumption || 0);
    } else {
      sumConsComputedDataService = params.sumCons;
    }

    const utilizationTime = (params.cons[moment().format('YYYY-MM-DD')] || 0) + Number(consByComputedDataService?.total_utilization_time || 0);

    return {
      utilizationTime,
      sumConsComputedDataService,
    };
  }

  function getDateStartAndDateEnd() {
    let dateStart = '';
    let dateEnd = '';
    switch (state.selectedTimeRange) {
      case t('dia'):
        dateStart = state.date.format('YYYY-MM-DD');
        dateEnd = moment(state.date).add(1, 'days').format('YYYY-MM-DD');
        break;
      case t('semana'):
        dateStart = state.date.format('YYYY-MM-DD');
        dateEnd = moment(state.dateList[state.dateList.length - 1].mdate).add(1, 'days').format('YYYY-MM-DD');
        break;
      case t('flexivel'):
        dateStart = state.startDate.format('YYYY-MM-DD');
        dateEnd = moment(state.dateList[state.dateList.length - 1].mdate).add(1, 'days').format('YYYY-MM-DD');
        break;
      default:
        dateStart = moment(state.monthDate).format('YYYY-MM-DD');
        dateEnd = moment(state.monthDate).endOf('month').add(1, 'days').format('YYYY-MM-DD');
        break;
    }

    return { dateStart, dateEnd };
  }

  async function getDevsWithMachinesList() {
    const { dateStart, dateEnd } = getDateStartAndDateEnd();

    const { list: dacsList } = await apiCall('/dac/get-dacs-list', {
      includeConsumption: true,
      unitId: state.unitId,
      dateStart,
      dateEnd,
    });

    state.unitHasDacs = !!dacsList.length;

    const { list: dutsList } = await apiCall('/dut/get-duts-duo-energy-efficiency', {
      unitId: state.unitId,
      dateStart,
      dateEnd,
    });

    return getCombinedLists(dacsList, dutsList);
  }

  async function getUnitConsumptionGreenAnt() {
    try {
      const greenAntResponse = await apiCall('/get-unit-energy-consumption-byDay', {
        UNIT_ID: state.unitId,
        dayStart: state.selectedTimeRange === t('mes') ? moment(state.monthDate).format('YYYY-MM-DD') : (state.selectedTimeRange === t('flexivel') ? state.startDate.format('YYYY-MM-DD') : state.date.format('YYYY-MM-DD')),
        dayEnd: state.selectedTimeRange === t('dia') ? moment(state.date).format('YYYY-MM-DD') : (state.selectedTimeRange === t('mes') ? moment(state.monthDate).endOf('month').format('YYYY-MM-DD') : state.dateList[state.dateList.length - 1].YMD),
      });

      if (greenAntResponse.list) {
        greenAntResponse.list.forEach((item) => {
          const day = moment(item.date).format('YYYY-MM-DD');
          const dayInfo = state.dateList.find((x) => x.YMD === day);
          if (dayInfo) {
            dayInfo.totalGreenAntCons = item.consumedEnergy / 1000;
            dayInfo.totalGreenAntInvoice = (item.invoice?.value || 0);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }

    for (const dat of state.dateList) {
      state.greenAntSum += (dat.totalGreenAntCons || 0);
      state.greenAntInvoiceSum += (dat.totalGreenAntInvoice || 0);
    }

    render();
  }

  async function getInvoices(dateStart, dateEnd, unitInfo) {
    const apiResponse = await apiCall('/invoice/get-invoices', {
      unit_id: state.unitId,
      periodStart: dateStart.toISOString(),
      periodEnd: dateEnd.toISOString(),
      baseline_id: unitInfo.BASELINE_ID,
    });
    if (apiResponse.messageError.length > 0) {
      console.log(apiResponse.messageError);
    }
    state.invoices = apiResponse.invoices;
    state.maxTotalCharges = (apiResponse.maxTotalCharges === 0 ? 0 : apiResponse.maxTotalCharges || 2);
    state.maxTotalMeasured = (apiResponse.maxTotalMeasured === 0 ? 0 : apiResponse.maxTotalMeasured || 1);
  }

  function consumptionCounter() {
    for (const machine of state.groupedMachines) {
      const percent = machine.consKWH / state.consumptionSum * 100;

      if (percent > 15) {
        state.higherConsumptionCounter++;
        machine.rangeCons = 'higher';
      } else if (percent <= 15 && percent >= 5) {
        state.mediumConsumptionCounter++;
        machine.rangeCons = 'medium';
      } else if (percent > 0) {
        state.lowerConsumptionCounter++;
        machine.rangeCons = 'lower';
      } else {
        state.zeroConsumptionCounter++;
        machine.rangeCons = 'zero';
      }
    }
    state.groupedMachines.sort((a, b) => b.consKWH - a.consKWH);

    render();
  }

  async function verifyHoursBlocked(combinedList) {
    const { dateStart } = getDateStartAndDateEnd();
    const { hoursBlocked } = await apiCall('/unit-automation-savings', {
      unitId: state.unitId,
      dayStart: dateStart,
      numDays: state.numDays,
    });

    state.automationSavings = hoursBlocked;

    for (const dev of combinedList) {
      const countersByDay = hoursBlocked[dev.id];
      if (!countersByDay) continue;
      for (const [day, count] of Object.entries(countersByDay)) {
        const dayInfo = state.dateList.find((x) => x.YMD === day);
        if (dayInfo && dev.pot) {
          const hours = (count.totalEst || 0);
          dayInfo.savings_kWh += (hours * dev.pot) || 0;
        }
      }
    }
  }

  function verifyTotalConsPercent() {
    const totalConstPercent = state.greenAntSum ? Math.ceil((state.consumptionSum || 0) / state.greenAntSum * 100) : 0;

    state.dataTotalConsPercent = totalConstPercent;

    render();
  }

  async function handleGetUnitInfo() {
    try {
      state.totalConsupmtionPeriod = {
        totalKwh: 0,
        totalCost: 0,
        calc: false,
      };
      state.isLoading = true;
      state.greenAntSum = 0;
      state.greenAntInvoiceSum = 0;
      state.sumSavingsKWh = 0;
      state.consumptionSum = 0;
      state.opportunity = 0;
      state.higherConsumptionCounter = 0;
      state.mediumConsumptionCounter = 0;
      state.lowerConsumptionCounter = 0;
      state.zeroConsumptionCounter = 0;

      for (const dat of state.dateList) {
        dat.totalGreenAntCons = 0;
        dat.totalGreenAntInvoice = 0;
        dat.totalAirCondCons = 0;
        dat.savings_kWh = 0;
      }

      render();

      calculateNumDays();

      state.validInvoiceMonth = true;
      const { dateStart, dateEnd } = getDates(state);

      const unitInfo = await apiCall('/clients/get-unit-info', { unitId: state.unitId });

      if (unitInfo.PRODUCTION) {
        await getInvoices(dateStart, dateEnd, unitInfo);

        await verifyDates(state.dateList[0].YMD, state.dateList[state.dateList.length - 1].YMD);

        state.unitInfo = unitInfo;
        calculateTotalDemand(state.demandsByMeter);

        await calculeYTicks();
        await calculePercentageBar();

        // @ts-ignore
        state.averageTariff = (unitInfo.TARIFA_KWH || '').toString();

        render();

        getUnitConsumptionGreenAnt();

        const combinedList = await getDevsWithMachinesList();

        verifyConsumptionActualDay();

        const groupedMachines = {} as any;
        combinedList.forEach((dev) => {
          if (!groupedMachines[dev.groupId]) {
            groupedMachines[dev.groupId] = {
              id: dev.groupId as string,
              name: dev.groupName,
              dacs: [],
            };
          }
          groupedMachines[dev.groupId].pot = (groupedMachines[dev.groupId].pot ?? 0) + dev.pot;
          groupedMachines[dev.groupId].consH = (groupedMachines[dev.groupId].consH ?? 0) + dev.utilizationTime;
          groupedMachines[dev.groupId].consKWH = (groupedMachines[dev.groupId].consKWH ?? 0) + (dev.utilizationTime * dev.kw);

          // @ts-ignore
          groupedMachines[dev.groupId].dacs.push(dev);
          groupedMachines[dev.groupId].machineHasDacs = groupedMachines[dev.groupId].machineHasDacs ?? dev.id.startsWith('DAC');
        });
        state.groupedMachines = Object.values(groupedMachines);

        render();

        consumptionCounter();

        verifyTotalConsPercent();

        verifyHoursBlocked(combinedList);
        state.sumSavingsKWh = 0;

        render();

        verifySumSavings();
      }
    } catch (error) {
      console.log(error);
      toast.error(t('erroAcharUnidade'));
    }

    state.isLoading = false;
    render();
  }

  // Consumo de refrigeração vem somado para datas anteriores ao dia atual
  // Quando vier refrigeração por dia/hora do CDS, tiramos a validação do dia atual
  function verifyConsumptionActualDay() {
    for (const dat of state.dateList) {
      if (dat.mdate.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
        state.consumptionSum += (dat.totalAirCondCons || 0);
      }
    }
  }

  function verifySumSavings() {
    for (const dat of state.dateList) {
      state.sumSavingsKWh += (dat.savings_kWh ?? 0);
    }
  }

  async function verifyDates(startDate: string, endDate: string) {
    const currentDate = moment();
    // se filtrar apenas por dia e for o dia atual, pegar dados do dash-performance
    if (startDate === endDate && startDate === currentDate.format('YYYY-MM-DD')) {
      await handleCommonFunctionsGetEnergy();
      await handleGetEnergy(`${startDate}T00:00:00`, `${endDate}T23:59:59`);
    }
    else if (moment(endDate).isAfter(currentDate)) {
      await handleCommonFunctionsGetEnergy();
      await handleGetEnergyByComputedDataService(startDate, currentDate.clone().subtract(1, 'days').format('YYYY-MM-DD'));
      await handleGetEnergy(currentDate.format('YYYY-MM-DDT00:00:00'), currentDate.format('YYYY-MM-DDT23:59:59'));
      await handleGetRefrigerationConsumptionByComputedDataService(startDate, currentDate.clone().subtract(1, 'days').format('YYYY-MM-DD'));
    }
    // se o endDate for igual ao dia de hoje, pegar os dados desse dia no dash-performance
    else if (endDate === currentDate.format('YYYY-MM-DD')) {
      const previousDay = currentDate.clone().subtract(1, 'days').format('YYYY-MM-DD');
      await handleCommonFunctionsGetEnergy();
      await handleGetEnergyByComputedDataService(startDate, previousDay);
      await handleGetEnergy(`${endDate}T00:00:00`, `${endDate}T23:59:59`);
      await handleGetRefrigerationConsumptionByComputedDataService(startDate, previousDay);
    }
    else {
      await handleCommonFunctionsGetEnergy();
      await handleGetEnergyByComputedDataService(startDate, endDate, state.selectedTimeRange === t('dia'));
      await handleGetRefrigerationConsumptionByComputedDataService(startDate, endDate);
    }
  }

  async function handleGetEnergy(startDate: string, endDate: string) {
    try {
      if (state.energyMetersList.length !== 0) {
        await Promise.all(
          state.energyMetersList.map(async (energyMeter) => {
            if (energyMeter?.ENERGY_DEVICE_ID?.startsWith('D')) {
              const params = ['en_at_tri'];
              const energyApiResponse = await apiCall('/energy/get-hist', {
                energy_device_id: energyMeter.ENERGY_DEVICE_ID,
                serial: energyMeter.SERIAL,
                manufacturer: energyMeter.MANUFACTURER,
                model: energyMeter.MODEL,
                start_time: startDate,
                end_time: endDate,
                params,
              });

              const energyData = compileEnergyData(energyApiResponse, startDate, state.dateList[state.dateList.length - 1].YMD, params);
              verifyEnergyData(energyMeter, energyData);
            }
          }),
        )
          .catch((err) => { console.log(err); toast.error(t('erro')); });
      }
    } catch (error) {
      toast.error(t('erroEficienciaEnergetica'));
    }
  }

  function verifyEnergyData(energyMeter: IEnergyMeter, energyData: CompiledEnergyData) {
    if (energyData?.en_at_tri) {
      state.demandsByMeter[energyMeter.ENERGY_DEVICE_ID] = state.demandsByMeter[energyMeter.ENERGY_DEVICE_ID] ? state.demandsByMeter[energyMeter.ENERGY_DEVICE_ID].concat(energyData.en_at_tri) : energyData.en_at_tri;
      calculateMaxTotalDemandMeasured(energyMeter);
    }
  }

  async function handleGetEnergyByComputedDataService(startDate: string, endDate: string, getHoursConsumption?: boolean) {
    const energyInfoByMeter = await apiCall('/unit/get-energy-consumption-unit', {
      UNIT_ID: state.unitId, START_DATE: startDate, END_DATE: endDate, GET_HOURS_CONSUMPTION: getHoursConsumption,
    });

    for (const energy of state.energyMetersList) {
      if (!energy.ENERGY_DEVICE_ID?.startsWith('D')) continue;
      const meterInfo = energyInfoByMeter.consumptionByDevice.find((x) => x.device_code === energy.ENERGY_DEVICE_ID);
      if (!meterInfo?.consumption?.length) continue;

      const meterConsumptionFormatted = meterInfo.consumption.map((device) => ({
        ...device,
        yPointsHoursMeasured: [4, 3, 2, 1, 0],
        percentageTotalMeasured: 0,
      }));

      if (!state.demandsByMeter[energy.ENERGY_DEVICE_ID]) {
        state.demandsByMeter[energy.ENERGY_DEVICE_ID] = [];
      }

      meterConsumptionFormatted.forEach((newData) => {
        const index = state.demandsByMeter[energy.ENERGY_DEVICE_ID].findIndex((data) => data.day === newData.day);

        if (index > -1) {
          state.demandsByMeter[energy.ENERGY_DEVICE_ID][index] = newData;
        } else {
          state.demandsByMeter[energy.ENERGY_DEVICE_ID].push(newData);
        }
      });

      calculateMaxTotalDemandMeasured(energy);
    }
  }

  function calculateMaxTotalDemandMeasured(energy: IEnergyMeter) {
    state.maxTotalDemandMeasured = Math.max(state.maxTotalDemandMeasured, (state.demandsByMeter[energy.ENERGY_DEVICE_ID]?.reduce((acc, value) => {
      if (value.totalMeasured > acc) return value.totalMeasured;
      return acc;
    }, 0) || 0));
  }

  async function handleCommonFunctionsGetEnergy() {
    const { list } = await apiCall('/energy/get-energy-list', { unitId: state.unitId, filterByNull: true });

    state.energyMetersList = list;

    state.energyMetersList.forEach((meter, index) => { meter.checked = true; meter.color = metersColors[index]; });
    state.selectedEnergyMeters = state.energyMetersList.map((meter) => meter.ENERGY_DEVICE_ID);
    handleGetTelemetryInfos();
    render();
    state.energyMetersFiltered = getFilterOptions(state.energyMetersList);
    state.demandsByMeter = {};
    state.maxTotalDemandMeasured = 0;
  }

  async function handleGetRefrigerationConsumptionByComputedDataService(startDate: string, endDate: string) {
    const refrigerationInfo = await apiCall('/unit/get-refrigeration-consumption-unit', { UNIT_ID: state.unitId, START_DATE: startDate, END_DATE: endDate });
    state.consumptionSum += Number(refrigerationInfo.total_consumption || 0);
    state.consumption_by_device_machine = refrigerationInfo.consumption_by_device_machine;
    state.consumptionFlags = {
      dataIsInvalid: refrigerationInfo.dataIsInvalid,
      dataIsProcessed: refrigerationInfo.dataIsProcessed,
    };
  }

  const calculateTotalDemand = (energyMeters: {[key: string] : IMeterDemand[]}) => {
    state.metersTotalDemand = [];
    state.maxTotalDemandMeasuredAllMeters = 0;
    render();
    if (!Object.keys(state.demandsByMeter).length) return;
    const randomMeter = Object.keys(state.demandsByMeter)[0];
    const totalDemand : IMeterDemand[] = [];
    state.demandsByMeter[randomMeter]?.forEach((_, dayIndex) => {
      const totalDayInfo : any = {
        day: state.demandsByMeter[randomMeter][dayIndex].day,
        dataIsInvalid: state.demandsByMeter[randomMeter][dayIndex].dataIsInvalid,
        dataIsProcessed: state.demandsByMeter[randomMeter][dayIndex].dataIsProcessed,
      };

      let totalMeasured = 0;
      Object.keys(state.demandsByMeter)?.forEach((meter) => {
        if (state.selectedEnergyMeters.includes(meter)) {
          totalMeasured += (state.demandsByMeter[meter][dayIndex]?.totalMeasured) || 0;
        }
      });
      totalDayInfo.totalMeasured = totalMeasured;

      const hoursInfo : any[] = [];
      let maxDayTotalMeasured = 0;
      state.demandsByMeter[randomMeter][dayIndex]?.hours.forEach((_, hourIndex) => {
        const hourInfo : any = {
          ...state.demandsByMeter[randomMeter][dayIndex].hours[hourIndex],
          hour: state.demandsByMeter[randomMeter][dayIndex].hours[hourIndex]?.hour,
        };

        let currHourTotalMeasured = 0;
        Object.keys(state.demandsByMeter).forEach((meter) => {
          if (state.selectedEnergyMeters.includes(meter)) {
            currHourTotalMeasured += (state.demandsByMeter[meter][dayIndex]?.hours[hourIndex]?.totalMeasured) || 0;
          }
        });

        hourInfo.totalMeasured = currHourTotalMeasured;
        maxDayTotalMeasured = Math.max(maxDayTotalMeasured, currHourTotalMeasured);

        hoursInfo.push(hourInfo);
      });
      totalDayInfo.hours = hoursInfo;
      totalDayInfo.maxDayTotalMeasured = maxDayTotalMeasured;
      totalDemand.push(totalDayInfo);
    });
    state.metersTotalDemand = totalDemand;
    state.maxTotalDemandMeasuredAllMeters = Math.max(state.maxTotalDemandMeasuredAllMeters, (totalDemand?.reduce((acc, value) => {
      if (value.totalMeasured > acc) return value.totalMeasured;
      return acc;
    }, 0) || 0));
    state.totalConsupmtionPeriod.totalKwh = state.metersTotalDemand.reduce((acc, value) => acc + value.totalMeasured, 0);
    if (state.unitInfo && state.unitInfo.TARIFA_KWH) {
      state.totalConsupmtionPeriod.totalCost = state.unitInfo.TARIFA_KWH * state.totalConsupmtionPeriod.totalKwh;
    }
    state.totalConsupmtionPeriod.calc = true;
    render();
  };

  async function calculeYTicks() {
    if (state.invoices && state.invoices.length > 0) {
      state.yPointsTotalCharges = [];
      state.yPointsTotalMeasured = [];
      let auxPointsTotalCharges = state.maxTotalCharges + (500 - state.maxTotalCharges % 500); // Find next multiple of 500
      state.yPointsTotalCharges.push(auxPointsTotalCharges);
      let auxPointsTotalMeasured = state.maxTotalMeasured + (500 - state.maxTotalMeasured % 500);// Find next multiple of 500
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

    state.yPointsDemandTotalMeasured = [];
    let auxPointsDemandTotalMeasured = 0;
    if (state.maxTotalDemandMeasured < 1000) {
      auxPointsDemandTotalMeasured = ((state.maxTotalDemandMeasured) + (100 - state.maxTotalDemandMeasured % 100));
    } else {
      auxPointsDemandTotalMeasured = ((state.maxTotalDemandMeasured / 1000) + (1 - state.maxTotalDemandMeasured % 1));
    }
    state.yPointsDemandTotalMeasured.push(auxPointsDemandTotalMeasured);

    for (let i = 0; i < 3; i++) {
      auxPointsDemandTotalMeasured = (state.yPointsDemandTotalMeasured[0] / 4) * (3 - i);
      state.yPointsDemandTotalMeasured.push(auxPointsDemandTotalMeasured);
    }

    state.yPointsDemandTotalMeasured.push(0);

    for (const meterId of Object.keys(state.demandsByMeter)) {
      for (let i = 0; i < state.demandsByMeter[meterId].length; i++) {
        const demand = state.demandsByMeter[meterId][i];
        demand.yPointsHoursMeasured = [];
        let auxPointsHoursMeasured = demand.maxDayTotalMeasured + (10 - demand.maxDayTotalMeasured % 10);
        demand.yPointsHoursMeasured.push(auxPointsHoursMeasured);
        for (let i = 0; i < 3; i++) {
          auxPointsHoursMeasured = (demand.yPointsHoursMeasured[0] / 4) * (3 - i);
          demand.yPointsHoursMeasured.push(auxPointsHoursMeasured);
        }
        demand.yPointsHoursMeasured.push(0);
      }
    }

    state.yPointsDemandTotalMeasuredAllMeters = [];
    let auxPointsDemandTotalMeasuredAllMeters = 0;

    if (state.maxTotalDemandMeasuredAllMeters < 1000) {
      auxPointsDemandTotalMeasuredAllMeters = ((state.maxTotalDemandMeasuredAllMeters) + (100 - state.maxTotalDemandMeasuredAllMeters % 100));
    } else {
      auxPointsDemandTotalMeasuredAllMeters = ((state.maxTotalDemandMeasuredAllMeters / 1000) + (1 - state.maxTotalDemandMeasuredAllMeters % 1));
    }

    state.yPointsDemandTotalMeasuredAllMeters.push(auxPointsDemandTotalMeasuredAllMeters);

    for (let i = 0; i < 3; i++) {
      auxPointsDemandTotalMeasuredAllMeters = (state.yPointsDemandTotalMeasuredAllMeters[0] / 4) * (3 - i);
      state.yPointsDemandTotalMeasuredAllMeters.push(auxPointsDemandTotalMeasuredAllMeters);
    }

    state.yPointsDemandTotalMeasuredAllMeters.push(0);

    for (let i = 0; i < state.metersTotalDemand.length; i++) {
      const demand = state.metersTotalDemand[i];
      demand.yPointsHoursMeasured = [];
      let auxPointsHoursMeasured = demand.maxDayTotalMeasured + (10 - demand.maxDayTotalMeasured % 10);
      demand.yPointsHoursMeasured.push(auxPointsHoursMeasured);
      for (let i = 0; i < 3; i++) {
        auxPointsHoursMeasured = (demand.yPointsHoursMeasured[0] / 4) * (3 - i);
        demand.yPointsHoursMeasured.push(auxPointsHoursMeasured);
      }
      demand.yPointsHoursMeasured.push(0);
    }
  }

  async function calculePercentageBar() {
    if (state.invoices) {
      for (let i = 0; i < state.invoices.length; i++) {
        state.invoices[i].percentageTotalCharges = Math.round((100 * state.invoices[i].totalCharges / state.yPointsTotalCharges[0]) * 100 / 100);
        state.invoices[i].percentageTotalMeasured = Math.round((100 * state.invoices[i].totalMeasured / state.yPointsTotalMeasured[0]) * 100 / 100);
        state.invoices[i].percentageBaselinePrice = Math.round((100 * state.invoices[i].baselinePrice / state.yPointsTotalCharges[0]) * 100 / 100);
        state.invoices[i].percentageBaselineKwh = Math.round((100 * state.invoices[i].baselineKwh / state.yPointsTotalMeasured[0]) * 100 / 100);
      }
    }

    if (Object.keys(state.demandsByMeter).length !== 0) {
      for (const meterId of Object.keys(state.demandsByMeter)) {
        for (let i = 0; i < state.demandsByMeter[meterId].length; i++) {
          state.demandsByMeter[meterId][i].percentageTotalMeasured = Math.round((100 * state.demandsByMeter[meterId][i].totalMeasured / state.yPointsDemandTotalMeasured[0]) * 100 / (state.maxTotalDemandMeasured < 1000 ? 100 : 100000));

          for (let j = 0; j < state.demandsByMeter[meterId][i].hours.length; j++) {
            state.demandsByMeter[meterId][i].hours[j].percentageTotalMeasured = Math.round((100 * state.demandsByMeter[meterId][i].hours[j].totalMeasured / state.demandsByMeter[meterId][i].yPointsHoursMeasured[0]) * 100 / 100);
          }
        }
      }
    }
    for (let i = 0; i < state.metersTotalDemand.length; i++) {
      state.metersTotalDemand[i].percentageTotalMeasured = Math.round((100 * state.metersTotalDemand[i].totalMeasured / state.yPointsDemandTotalMeasuredAllMeters[0]) * 100 / (state.maxTotalDemandMeasuredAllMeters < 1000 ? 100 : 100000));

      for (let j = 0; j < state.metersTotalDemand[i].hours.length; j++) {
        state.metersTotalDemand[i].hours[j].percentageTotalMeasured = Math.round((100 * state.metersTotalDemand[i].hours[j].totalMeasured / state.metersTotalDemand[i].yPointsHoursMeasured[0]) * 100 / 100);
      }
    }
  }

  function orderMachines(val) {
    state.order = val;
    render();
    // @ts-ignore
    state.groupedMachines.sort((a, b) => {
      if (val === t('maiorConsumo')) return b.consKWH - a.consKWH;
      if (val === t('menorConsumo')) return a.consKWH - b.consKWH;
      if (val === t('maiorPotencia')) return b.pot - a.pot;
      if (val === t('menorPotencia')) return a.pot - b.pot;
      if (val === t('nome')) return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });

    render();
  }

  useEffect(() => {
    handleGetUnitInfo();
  }, []);

  async function onSelectMeter(devices) {
    state.isLoading = true;
    state.energyMetersList.forEach((e) => {
      if (devices.includes(e.ENERGY_DEVICE_ID)) {
        e.checked = true;
      } else {
        e.checked = false;
      }
    });
    state.selectedEnergyMeters = devices;
    state.energyMetersFiltered = getFilterOptions(state.energyMetersList);
    render();

    handleGetTelemetryInfos();

    calculateTotalDemand(state.demandsByMeter);

    await calculeYTicks();
    await calculePercentageBar();
    render();

    if (selectedDayMeterStr !== '' && !shouldShowConsumptionByMeter) {
      setSelectedDay(state.metersTotalDemand.find((demand) => demand.day === selectedDayMeterStr) || null);
    } else if (selectedDayMeterStr !== '' && shouldShowConsumptionByMeter && state.selectedEnergyMeters.includes(selectedDayMeter) && Object.keys(state.demandsByMeter).includes(selectedDayMeter)) {
      setSelectedDay(state.demandsByMeter[selectedDayMeter].find((demand) => demand.day === selectedDayMeterStr) || null);
    }

    state.isLoading = false;
    render();
  }

  function renderOption(propsOption, option, _snapshot, className) {
    return (
      <>
        <button
          {...propsOption}
          className={className}
          type="button"
        >
          <div
            style={{
              display: 'flex',
              flexFlow: 'row nowrap',
              alignItems: 'center',
            }}
          >
            {option.icon}
            <span style={{ marginLeft: '10px' }}>
              {
                option.name
              }
            </span>
          </div>
        </button>

      </>
    );
  }
  function setExportInvoices(cond: boolean) {
    state.exportInvoices = cond;
    render();
  }

  const getEnergyCsvAllData = async (dateList) => {
    state.isLoading = true; render();
    let formattedCSV = [] as any;
    CSVheader = [];

    if (state.energyMetersList) {
      const energyApiResponses = {};
      await Promise.all(
        state.energyMetersList.map(async (meter) => {
          if (meter && meter.ENERGY_DEVICE_ID?.startsWith('D')) {
            const res = await apiCall('/energy/get-hist', {
              energy_device_id: meter.ENERGY_DEVICE_ID,
              serial: meter.SERIAL,
              manufacturer: meter.MANUFACTURER,
              model: meter.MODEL,
              start_time: `${dateList[0].YMD}T00:00:00`,
              end_time: `${dateList[dateList.length - 1].YMD}T23:59:59`,
            });
            energyApiResponses[meter.ENERGY_DEVICE_ID] = res;
          }
        }),
      )
        .catch((err) => { console.log(err); toast.error(t('erro')); });

      try {
        CSVheader.push({
          label: t('unidade'),
          key: 'unitName',
        });
        CSVheader.push({
          label: t('dataeHora'),
          key: 'timestamp',
        });
        if (state.energyMetersList.length > 1) {
          CSVheader.push({
            label: t('estabelecimento'),
            key: 'establishmentName',
          });
        }

        const workBook = XLSX.utils.book_new();

        CSVheader = CSVheader.concat(padronizedRawParams);

        if (energyApiResponses && Object.keys(energyApiResponses).length > 0) {
          state.energyMetersList.forEach((meter, index) => {
            if (!energyApiResponses[meter.ENERGY_DEVICE_ID]) return;
            for (const tel of energyApiResponses[meter.ENERGY_DEVICE_ID].data) {
              let data = {};
              if (state.energyMetersList.length > 1) {
                data = {
                  Unidade: state.unitInfo?.UNIT_NAME,
                  'Data e Hora': moment(tel.timestamp).format('DD-MM-YYYY HH:mm:ss').toString(),
                  Estabelecimento: meter.ESTABLISHMENT_NAME || `${t('estabelecimento')}  ${index + 1}`,
                };
                Object.keys(tel).forEach((telemetry) => {
                  if ((telemetry !== 'timestamp') && (telemetry !== 'en_at_tri') && (telemetry !== 'en_re_tri') && (telemetry !== 'erro')) tel[telemetry] = Number(tel[telemetry]).toFixed(2);
                  if (padronizedParamsMultipleMeters[telemetry]) {
                    data[padronizedParamsMultipleMeters[telemetry]] = tel[telemetry];
                  }
                });
              } else {
                Object.keys(tel).forEach((telemetry) => {
                  if ((telemetry !== 'timestamp') && (telemetry !== 'en_at_tri') && (telemetry !== 'en_re_tri') && (telemetry !== 'erro')) tel[telemetry] = Number(tel[telemetry]).toFixed(2);
                });
                data = {
                  ...tel,
                  unitName: state.unitInfo?.UNIT_NAME,
                  timestamp: moment(tel.timestamp).format('DD-MM-YYYY HH:mm:ss').toString(),
                };
              }

              formattedCSV.push(data);
            }
            if (state.energyMetersList.length > 1) {
              const workSheet = XLSX.utils.json_to_sheet(formattedCSV);
              const name = meter.ESTABLISHMENT_NAME ? meter.ESTABLISHMENT_NAME.slice(0, 30) : `Estabelecimento ${index + 1}`;
              XLSX.utils.book_append_sheet(workBook, workSheet, name);
              formattedCSV = [];
            }
          });

          state.energyCsvData = formattedCSV;
          render();

          if (state.energyMetersList.length > 1) {
            XLSX.writeFile(workBook, 'Medição_de_Energia.xlsx');
          } else {
            setTimeout(() => {
              (energyCsvLinkEl as any).current.link.click();
            }, 1000);
          }

          state.isLoading = false; render();
        } else {
          toast.info(t('erroExportarDadosGrafico')); state.isLoading = false;
        }
      } catch (err) { console.log(err); toast.error(t('houveErro')); state.isLoading = false; }
    } else {
      toast.info(t('infoSemMedidorUnidade')); state.isLoading = false;
    }
  };

  const getEnergyCsvData = async () => {
    state.isLoading = true; render();
    const formattedCSV = [] as any;
    try {
      getEnergyCsvHeaders();

      if (state.demandsByMeter && Object.keys(state.demandsByMeter).length > 0) {
        for (let dayIndex = 0; dayIndex < state.demandsByMeter[Object.keys(state.demandsByMeter)[0]].length; dayIndex++) {
          if (!state.demandsByMeter[Object.keys(state.demandsByMeter)[0]][dayIndex]) continue;
          const day = state.demandsByMeter[Object.keys(state.demandsByMeter)[0]][dayIndex].day;

          getEnergyCsvHourData(day, dayIndex, formattedCSV);
        }

        state.energyCsvData = formattedCSV;
        render();
        setTimeout(() => {
          (energyCsvLinkEl as any).current.link.click();
        }, 1000);

        state.isLoading = false; render();
      } else {
        toast.info(t('erroExportarDadosGrafico')); state.isLoading = false;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); state.isLoading = false; }
  };

  function getEnergyCsvHeaders() {
    CSVheader = [];

    CSVheader.push({
      label: t('unidade'),
      key: 'unitName',
    });
    CSVheader.push({
      label: t('dataeHora'),
      key: 'dayHour',
    });

    if (state.energyMetersList.length > 1) {
      state.energyMetersList.forEach((e, index) => {
        CSVheader.push({
          label: `Consumo do Estabelecimento [${e.ESTABLISHMENT_NAME || index + 1}] (kWh)`,
          key: `demand_${index + 1}`,
        });
      });
    }

    CSVheader.push({
      label: t('consumoKwh'),
      key: 'totalDemand',
    });
  }

  function getEnergyCsvHourData(day: string, dayIndex: number, formattedCSV: { [key: string]: any }[]) {
    for (let hourIndex = 0; hourIndex < state.demandsByMeter[Object.keys(state.demandsByMeter)[0]][dayIndex]?.hours.length; hourIndex++) {
      const data : {[key: string]: any} = {
        unitName: state.unitInfo?.UNIT_NAME,
        dayHour: moment(day).format('DD-MM-YYYY').toString().concat(` ${state.demandsByMeter[Object.keys(state.demandsByMeter)[0]][dayIndex]?.hours[hourIndex].hour}:00`),
      };

      let totalDemand = 0;
      state.energyMetersList.forEach((meter, index) => {
        const currMeterDemand = meter.ENERGY_DEVICE_ID && state.demandsByMeter[meter.ENERGY_DEVICE_ID] && state.demandsByMeter[meter.ENERGY_DEVICE_ID][dayIndex]?.hours[hourIndex]?.totalMeasured;
        if (state.energyMetersList.length > 1 && currMeterDemand) {
          data[`demand_${index + 1}`] = formatNumberWithFractionDigits(currMeterDemand.toFixed(1));
        }
        if (currMeterDemand) totalDemand += currMeterDemand;
      });
      data.totalDemand = formatNumberWithFractionDigits(totalDemand.toFixed(1));
      formattedCSV.push(data);
    }
  }

  const getMachinesCsvData = async () => {
    state.isLoading = true; render();
    const formattedCSV = [] as any;
    CSVheader = [];
    try {
      CSVheader.push({
        label: t('unidade'),
        key: 'unitName',
      });
      CSVheader.push({
        label: t('maquinas'),
        key: 'name',
      });
      CSVheader.push({
        label: 'DAC',
        key: 'id',
      });
      CSVheader.push({
        label: 'TR',
        key: 'pot',
      });
      CSVheader.push({
        label: t('data'),
        key: 'data',
      });
      CSVheader.push({
        label: t('consumoKwh'),
        key: 'consumo',
      });
      CSVheader.push({
        label: `${t('tempoDeUso')} - 0,0h/dia`,
        key: 'usage',
      });

      if (state.groupedMachines && state.groupedMachines.length > 0) {
        for (const machine of state.groupedMachines) {
          for (let i = 0; i < machine.dacs.length; i++) {
            const usageData = Object.entries(machine.dacs[i].cons);

            usageData.forEach((entries) => {
              const data = {
                unitName: state.unitInfo?.UNIT_NAME,
                name: machine.name,
                id: machine.dacs[i].id,
                pot: machine.dacs[i].pot,
                data: moment(entries[0]).format('DD/MM/YYYY'),
                consumo: formatNumberWithFractionDigits((Number(entries[1]) * machine.dacs[i].kw).toFixed(2), { minimum: 0, maximum: 2 }),
                usage: formatNumberWithFractionDigits(Number(entries[1]).toFixed(2), { minimum: 0, maximum: 2 }),
              };

              formattedCSV.push(data);
            });
          }
        }

        state.machinesCsvData = formattedCSV;
        render();
        setTimeout(() => {
          (machinesCsvLinkEl as any).current.link.click();
        }, 1000);

        state.isLoading = false; render();
      }
      else {
        toast.info(t('erroExportarDadosGrafico')); state.isLoading = false;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); state.isLoading = false; }
  };

  async function handleExport(newPeriodParams: any[], exportType: string, info?: string) {
    const periodParams = [state.selectedTimeRange, state.monthDate, state.startDate, state.endDate, state.dateList];
    if (exportType === t('medidorEnergia') && info === t('todosOsDados')) {
      await getEnergyCsvAllData(newPeriodParams[4]);
    } else {
      for (const [index, param] of periodParams.entries()) {
        if (param !== newPeriodParams[index]) {
          state.selectedTimeRange = newPeriodParams[0];
          state.monthDate = newPeriodParams[1];
          state.startDate = newPeriodParams[2];
          state.endDate = newPeriodParams[3];
          state.dateList = newPeriodParams[4];
          render();

          await handleGetUnitInfo();
          break;
        }
      }

      if (exportType === t('fatura')) setExportInvoices(true);
      if (exportType === t('medidorEnergia') && info === t('consumo')) {
        await handleGetEnergyCsv();
      }
      if (exportType === t('maquinas')) await getMachinesCsvData();
    }
  }

  async function handleGetEnergyCsv() {
    if (state.selectedTimeRange !== t('dia')) {
      if (moment(state.dateList[state.dateList.length - 1].YMD).startOf('day').isSameOrAfter(moment().startOf('day'))) {
        await handleGetEnergyByComputedDataService(state.dateList[0].YMD, moment().subtract(1, 'days').format('YYYY-MM-DD'), true);
      } else {
        await handleGetEnergyByComputedDataService(state.dateList[0].YMD, state.dateList[state.dateList.length - 1].YMD, true);
      }
    }
    await getEnergyCsvData();
  }

  function alterDate(type: 'next' | 'previous') {
    let newDate;
    if (state.selectedTimeRange === t('mes')) {
      newDate = type === 'next' ? new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() + 1, 1) : new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() - 1, 1);
    }
    if (state.selectedTimeRange === t('semana')) {
      newDate = type === 'next' ? moment(state.date).add(7, 'days') : moment(state.date).subtract(7, 'days');
    }
    if (state.selectedTimeRange === t('dia')) {
      newDate = type === 'next' ? moment(state.date).add(1, 'days') : moment(state.date).subtract(1, 'days');
    }
    if (newDate) onDateChange(newDate, newDate);
  }

  function getFilterOptions(filterOptions: IEnergyMeter[]) {
    return filterOptions.map((group, index) => ({
      name: group.ESTABLISHMENT_NAME || `Estabelecimento ${index + 1}`,
      value: group.ENERGY_DEVICE_ID,
      icon: (
        <Flex alignItems="center">
          <Checkbox
            checked={group.checked}
            value={group.checked}
            color="primary"
          />
          <ListBoxOptionColor
            color={group.color}
          />
        </Flex>
      ),
    }));
  }

  const handleGetTelemetryInfos = async () => {
    state.loadingTelemetryInfos = true;
    render();
    const electricCircuitsSelected: number[] = [];

    state.selectedEnergyMeters.forEach((energyDeviceId) => {
      state.energyMetersList.forEach((energyDevice) => {
        if (energyDeviceId === energyDevice.ENERGY_DEVICE_ID) {
          electricCircuitsSelected.push(energyDevice.ELECTRIC_CIRCUIT_ID);
        }
      });
    });

    if (!electricCircuitsSelected.length) {
      state.demandsData = {};
      return;
    }

    try {
      const demands = await apiCall('/energy/get-demand-hist', {
        UNIT_ID: state.unitId,
        START_DATE: state.dateList[0].YMD,
        END_DATE: state.dateList[state.dateList.length - 1].YMD,
        ELECTRIC_CIRCUIT_IDS: electricCircuitsSelected,
      });

      state.demandsData = demands;
    } catch (e) {
      console.log(e);
      state.demandsData = {};
      toast.error(t('erroBuscarTelemetriaDemandasEnergeticas'));
    }

    state.loadingTelemetryInfos = false;
    render();
  };

  const getTelemetryCardLabel = (selectedTimeRange): string => {
    switch (selectedTimeRange) {
      case t('dia'):
        return state.date.format('DD/MM/YYYY');
      case t('semana'):
      case t('flexivel'): {
        const firstDay = state.dateList[0].mdate.format('DD/MM/YYYY');
        const lastDay = state.dateList[state.dateList.length - 1].mdate.format('DD/MM/YYYY');
        return `${firstDay} a ${lastDay}`;
      }
      case t('mes'):
        return state.dateList[0].mdate.format('MMMM YYYY').replace(/\b[a-z]/, (match) => match.toUpperCase());
      default:
        return '';
    }
  };

  const getTelemetryFilterMode = (selectedTimeRange): string => {
    switch (selectedTimeRange) {
      case t('dia'):
        return 'linechart';
      default:
        return 'heatmap';
    }
  };

  const getColorExpandIcon = () => (state.isLoading ? colors.Grey200 : colors.Blue700);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('energia'))}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />
      <Flex alignItems="center" flexWrap="wrap">
        <div style={{
          display: 'flex',
          width: '100%',
          position: 'sticky',
          top: '75px',
          padding: '25px 0px',
          backgroundColor: 'white',
          zIndex: 2,
          alignItems: 'center',
          paddingBottom: '30px',
          borderBottom: '2px solid #D9DADB',
        }}
        >
          <Box width={[1, 1, 1, 1, 1, 1 / 12]} marginRight="20px" minWidth="125px">
            <Select
              options={[t('dia'), t('semana'), t('mes'), t('flexivel')]}
              // eslint-disable-next-line react/jsx-no-bind
              onSelect={onRangeTypeChange}
              value={state.selectedTimeRange}
              placeholder={t('periodo')}
              hideSelected
              // @ts-ignore
              disabled={state.isLoading}
            />
          </Box>
          {state.selectedTimeRange !== t('flexivel') && (
            <ArrowButton orientation="left" onClick={() => alterDate('previous')}>
              <ExpandIcon color={getColorExpandIcon()} style={{ rotate: '90deg' }} />
            </ArrowButton>
          )}

          <Box width="fit-content" margin="0px -5px" mt={[16, 16, 16, 16, 16, 0]}>
            {timeRangeDayOrWeek && (
              <ContentDate style={{ borderRight: '0px', borderLeft: '0px' }}>
                <Label>{t('data')}</Label>
                <SingleDatePicker
                  disabled={state.isLoading}
                  date={state.date}
                  // eslint-disable-next-line react/jsx-no-bind
                  onDateChange={onDateChange}
                  focused={state.focused}
                  onFocusChange={({ focused }) => { state.focused = focused; render(); }}
                  id="datepicker"
                  numberOfMonths={1}
                  isOutsideRange={(d) => !d.isBefore(moment())}
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            )}
            {state.selectedTimeRange === t('flexivel') && (
              <ContentDate style={{ borderRight: '0px', borderLeft: '0px' }}>
                <Label>{t('data')}</Label>
                <br />
                <DateRangePicker
                  disabled={state.isLoading}
                  startDate={state.startDate} // momentPropTypes.momentObj or null,
                  startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                  endDate={state.endDate} // momentPropTypes.momentObj or null,
                  endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                  onDatesChange={({ startDate, endDate }) => onDateChange(startDate, endDate)} // PropTypes.func.isRequired,
                  onFocusChange={(focused) => { state.focusedInput = focused; render(); }}
                  focusedInput={state.focusedInput}
                  noBorder
                  startDatePlaceholderText={t('dataInicial')}
                  endDatePlaceholderText={t('dataFinal')}
                  isOutsideRange={(d) => d.startOf('day').isAfter(moment().startOf('day'))}
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            )}
            {(state.selectedTimeRange === t('mes')) && (
              <ContentDate style={{ borderRight: '0px', borderLeft: '0px' }}>
                <Label>{t('data')}</Label>
                <DatePicker
                  maxDate={moment().toDate()}
                  disabled={state.isLoading}
                  selected={state.monthDate}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={onDateChange}
                  dateFormat="MMM yyyy"
                  locale={`${t('data') === 'Data' ? 'pt-BR' : ''}`}
                  showMonthYearPicker
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            )}

          </Box>
          {state.selectedTimeRange !== t('flexivel') && (
            <ArrowButton orientation="right" onClick={() => alterDate('next')}>
              <ExpandIcon color={getColorExpandIcon()} style={{ rotate: '270deg' }} />
            </ArrowButton>
          )}
          {state.energyMetersList.length > 1 && (
          <Box width={[1, 1, 1, 1, 1, 1 / 12]} marginLeft="20px" minWidth="200px">
            <SearchInput style={{ width: '100%', marginLeft: '0' }}>
              <div
                style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}
              >
                <TextLabel>{t('medidores')}</TextLabel>
                <SelectSearch
                  options={state.energyMetersFiltered}
                  value={state.selectedEnergyMeters}
                  multiple
                  closeOnSelect
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('selecionarMedidores')}
                  renderOption={renderOption}
                      // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => onSelectMeter(value)}
                  disabled={state.isLoading}
                />
              </div>
            </SearchInput>
          </Box>
          )}

          <ExportButton variant={state.isLoading ? 'disabled' : 'primary'} onClick={() => { window.scrollBy(0, 150); state.openExportModal = true; render(); }}>
            <div>
              <IconWrapper>
                <ExportPdfIcon />
              </IconWrapper>
              <span>{t('exportarDados')}</span>
            </div>
          </ExportButton>
        </div>

        <div id="pageBody" style={{ width: '100%', position: 'relative' }}>
          <ModalLoading display={state.isLoading}>
            <Loader />
            <div>
              <Trans
                i18nKey="mensageLoader"
              >
                <h4> Aguarde, os dados estão </h4>
                <h4> sendo carregados. </h4>
              </Trans>
            </div>
          </ModalLoading>

          {(state.energyMetersList.length || state.unitInfo?.GA_METER) ? (
            <div>
              <Box width={1} display="flex" justifyContent="space-between" alignItems="center" marginTop="30px">
                <div>
                  <Section
                    style={{ marginTop: '0px' }}
                    onClick={() => {
                      state.showEnergyMeter = !state.showEnergyMeter;
                      render();
                    }}
                  >
                    {t('medidorEnergia')}
                    {' '}
                    {IconChevrot(state.showEnergyMeter)}
                  </Section>
                  <ModalContainerLoading display={state.isLoading} />
                  <div>
                    {state.energyMetersList.length && state.energyMetersList[0]?.MANUFACTURER === 'Diel Energia' ? (state.energyMetersList.map((e) => (
                      <Link key={e.ENERGY_DEVICE_ID} to={`/integracoes/info/diel/${e.ENERGY_DEVICE_ID}/perfil`} style={{ color: colors.BlueSecondary, textDecoration: 'underline', marginRight: '10px' }}>{e.ENERGY_DEVICE_ID && e.ESTABLISHMENT_NAME}</Link>
                    ))) : (
                      <p style={{ textDecoration: 'underline', color: colors.BlueSecondary }}>{state.energyMetersList[0]?.ESTABLISHMENT_NAME || state.unitInfo?.GA_METER}</p>
                    )}
                    <p />
                  </div>

                  <CSVLink
                    headers={CSVheader}
                    data={state.energyCsvData}
                    filename={t('medicaoDeEnergiaCsv')}
                    separator=";"
                    asyncOnClick
                    enclosingCharacter={"'"}
                    ref={energyCsvLinkEl}
                  />
                </div>

              </Box>
              {state.showEnergyMeter && ((state.energyMetersList && state.energyMetersList[0]?.MANUFACTURER === 'GreenAnt') || state.unitInfo?.GA_METER) && (
                <CardNoService>
                  <Button
                    variant="blue"
                    style={{
                      width: '200px', heigth: '60px', backgroundColor: colors.BlueSecondary, textTransform: 'none', fontSize: '1.03em',
                    }}
                    onClick={() => window.open(`https://dashboard.greenant.com.br/dashboard/meters/${state.energyMetersList[0]?.ENERGY_DEVICE_ID.split('GA')[1] || state.unitInfo?.GA_METER}`)?.focus()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <StatisticsIcon />
                      <span style={{ marginLeft: '10px' }}>{t('analiseAvancada')}</span>
                    </div>
                  </Button>
                </CardNoService>
              )}
              {state.showEnergyMeter && (state.energyMetersList.length > 0 && state.energyMetersList[0]?.MANUFACTURER !== 'GreenAnt') && (
                <>
                  <Flex flexWrap="wrap" justifyContent="space-between" alignItems="stretch" width={1}>
                    <EnergyMeterDemand
                      unitId={state.unitId}
                      filterMode={state.selectedTimeRange}
                      dateList={state.dateList}
                      demandsByMeter={state.demandsByMeter}
                      maxTotalDemandMeasured={state.maxTotalDemandMeasured}
                      yPointsTotalMeasured={state.yPointsDemandTotalMeasured}
                      energyMetersList={state.energyMetersList}
                      metersTotalDemand={state.metersTotalDemand}
                      maxTotalDemandMeasuredAllMeters={state.maxTotalDemandMeasuredAllMeters}
                      yPointsDemandTotalMeasuredAllMeters={state.yPointsDemandTotalMeasuredAllMeters}
                      selectedEnergyMeters={state.selectedEnergyMeters}
                      shouldShowConsumptionByMeter={shouldShowConsumptionByMeter}
                      setShouldShowConsumptionByMeter={setShouldShowConsumptionByMeter}
                      selectedDay={selectedDay}
                      setSelectedDay={setSelectedDay}
                      selectedDayMeter={selectedDayMeter}
                      setSelectedDayMeter={setSelectedDayMeter}
                      selectedDayMeterStr={selectedDayMeterStr}
                      setSelectedDayMeterStr={setSelectedDayMeterStr}
                      totalConsumptionPeriod={state.totalConsupmtionPeriod}
                      handleGetTelemetryMonth={() => {
                        state.selectedTimeRange = t('mes');
                        state.dateList = getDatesList(moment(state.monthDate), new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate());
                        state.telemetryInterval = 60;

                        handleGetUnitInfo();
                      }}
                      handleGetTelemetryDay={(day) => {
                        state.selectedTimeRange = t('dia');
                        state.telemetryInterval = 15;

                        state.date = moment(new Date(day)).add(1, 'days');
                        state.dateList = getDatesList(state.date, 1);

                        handleGetUnitInfo();
                      }}
                    />
                  </Flex>
                  {!!state.demandsData?.demands?.length && (
                    <TelemetryDemandCard
                      loading={state.loadingTelemetryInfos}
                      telemetryData={state.demandsData}
                      filterMode={getTelemetryFilterMode(state.selectedTimeRange)}
                      cardLabel={getTelemetryCardLabel(state.selectedTimeRange)}
                      startDate={state.dateList[0].YMD}
                      endDate={state.dateList[state.dateList.length - 1].YMD}
                      handleChangeRangeType={(day) => {
                        state.selectedTimeRange = t('dia');
                        state.telemetryInterval = 15;

                        state.date = moment(new Date(day)).add(1, 'days');
                        state.dateList = getDatesList(state.date, 1);

                        handleGetUnitInfo();
                      }}
                      backBarchart={() => {
                        state.selectedTimeRange = t('mes');
                        state.dateList = getDatesList(moment(state.monthDate), new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate());
                        state.telemetryInterval = 60;

                        handleGetUnitInfo();
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )
            : (
              <Box width={1}>
                <Section
                  style={{ marginTop: '0px' }}
                  onClick={() => {
                    state.showEnergyMeter = !state.showEnergyMeter;
                    render();
                  }}
                >
                  {t('medidorEnergia')}
                  {' '}
                  {IconChevrot(state.showEnergyMeter)}
                </Section>
                {(state.showEnergyMeter && state.unitInfo?.PRODUCTION) && (
                  <CardNoService>
                    <InfoIcon color="#a7a7a7" />
                    <span>
                      <Trans i18nKey="contateAEmpresa">
                        Essa unidade não possui esse serviço disponível. Entrar em contato com a equipe da
                        <strong>   Diel Energia   </strong>
                        para contratá-lo.
                      </Trans>
                    </span>
                  </CardNoService>
                )}
                {(state.showEnergyMeter && !state.unitInfo?.PRODUCTION) && (
                <CardNoService>
                  <InfoIcon color="#a7a7a7" />
                  <span>
                    {t('dadosNaoDisponiveisUnidadeInstalacao')}
                  </span>
                </CardNoService>
                )}
              </Box>
            )}

          {(state.maxTotalCharges !== 0) && (
            <>
              <Box width={1}>
                <Section onClick={() => {
                  state.showInvoice = !state.showInvoice;
                  render();
                }}
                >
                  {t('fatura')}
                  {' '}
                  {IconChevrot(state.showInvoice)}
                </Section>
              </Box>
              {(state.showInvoice) && (
              <Flex flexWrap="wrap" justifyContent="space-between" alignItems="stretch" width={1}>
                <ModalLoading display={state.isLoading} />
                <EnergyEfficiencyInvoice
                  unitId={state.unitId}
                  invoices={state.invoices}
                  yPointsTotalCharges={state.yPointsTotalCharges}
                  yPointsTotalMeasured={state.yPointsTotalMeasured}
                  isLoading={state.isLoading}
                  shouldExport={state.exportInvoices}
                />
              </Flex>
              )}
              {(!state.validInvoiceMonth) && (
              <Flex flexWrap="wrap" justifyContent="center" alignItems="center" pl={25} pr={15}>
                <IconWrapper>
                  <ThunderIcon />
                </IconWrapper>
                <div>
                  <Trans
                    i18nKey="faturaVigenciaFechamento"
                    monthName={monthNames[state.currentMonthNumber]}
                    currentYear={state.currentYearNumber}
                  >
                    A fatura de
                    <strong>
                      <>
                        {{ monthName: monthNames[state.currentMonthNumber] }}
                      </>
                    </strong>
                    de
                    <strong>
                      <>
                        {{ currentYear: state.currentYearNumber }}
                      </>
                    </strong>
                    ainda está em vigência para fechamento
                  </Trans>
                </div>
              </Flex>
              )}
            </>
          )}

          <Box width={1}>
            <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
              <Box>
                <Section onClick={() => {
                  state.showMachines = !state.showMachines;
                  render();
                }}
                >
                  {t('maquinas')}
                  {' '}
                  {IconChevrot(state.showMachines)}
                </Section>
              </Box>
              <Box>
                <Flex alignItems="center">
                  {/* <DownloadButton handleClick={getMachinesCsvData} /> */}
                  <CSVLink
                    headers={CSVheader}
                    data={state.machinesCsvData}
                    filename={t('eficienciaEnergeticaCsv')}
                    separator=";"
                    asyncOnClick
                    enclosingCharacter={"'"}
                    ref={machinesCsvLinkEl}
                  />
                  {/* <Select
                    options={['Maior Consumo', 'Menor Consumo', 'Maior Potência', 'Menor Potência', 'Nome']}
                    // eslint-disable-next-line react/jsx-no-bind
                    onSelect={orderMachines}
                    value={state.order}
                    placeholder="Ordenar por"
                    hideSelected
                    style={{ minWidth: 250, marginLeft: 16 }}
                  /> */}
                </Flex>
              </Box>
            </Flex>

            {state.showMachines && (
              <Flex flexWrap="wrap" justifyContent="space-between" alignItems="stretch" width={1}>
                {/* @ts-ignore */}
                <Box width={[1, 1, 1, 1, 25 / 51, 25 / 51]} mb={40} ml={0} mr={0} style={{ maxWidth: 'none' }}>
                  <Card>
                    <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
                      <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
                        <TopTitle>{t('eficienciaEnergetica')}</TopTitle>
                      </Box>
                      <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
                        <TopDate>
                          {
                            state.selectedTimeRange === t('dia')
                              ? state.dateList[0].DMY
                              : `${state.dateList[0].DMY} ${t('a')} ${state.dateList[state.dateList.length - 1].DMY}`
                          }
                        </TopDate>
                      </Box>
                    </Flex>
                    <EnergyEfficiencyGeneral
                      selectedTimeRange={state.selectedTimeRange}
                      dateList={state.dateList}
                      consumptionSum={state.consumptionSum}
                      greenAntSum={state.greenAntSum}
                      greenAntInvoiceSum={state.greenAntInvoiceSum}
                      dataTotalConsPercent={state.dataTotalConsPercent}
                      averageTariff={state.averageTariff}
                      opportunity={state.opportunity}
                      sumSavingsKWh={state.sumSavingsKWh}
                      totalConsumptionPeriod={state.totalConsupmtionPeriod}
                      consumptionFlags={state.consumptionFlags}
                    />
                  </Card>
                </Box>
                <EnergyEfficiencyMachines
                  selectedTimeRange={state.selectedTimeRange}
                  dateList={state.dateList}
                  consumptionSum={state.consumptionSum}
                  dacList={state.groupedMachines}
                  averageTariff={state.averageTariff}
                  higherConsumptionCounter={state.higherConsumptionCounter}
                  mediumConsumptionCounter={state.mediumConsumptionCounter}
                  lowerConsumptionCounter={state.lowerConsumptionCounter}
                  zeroConsumptionCounter={state.zeroConsumptionCounter}
                />
              </Flex>
            )}

          </Box>

          {state.showMachines && state.groupedMachines?.map((machine) => (
            <>
              <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center" p={20}>
                <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
                  <Title>{t('maquina')}</Title>
                </Box>
                <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]} />
                <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
                  <Title>{t('potencia')}</Title>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
                  <Title>{t('consumo')}</Title>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
                  <Title>{t('usoMedio')}</Title>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
                  <Title>{t('saude')}</Title>
                </Box>
                <Box width={[1 / 12, 1 / 12, 1 / 12, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]} justifyContent="end" />
              </Flex>

              <EnergyEfficiencyMachine
                // @ts-ignore
                key={`machine-${machine.id}`}
                dateList={state.dateList}
                numDays={state.numDays}
                dac={machine}
                averageTariff={state.averageTariff}
                automationSavings={state.automationSavings}
                selectedTimeRange={state.selectedTimeRange}
                language={idioma}
                unitHasDacs={state.unitHasDacs}
              />
              <ModalLoading display={state.isLoading} />
            </>

          ))}

          {state.openExportModal && (
            <DataExportModal
              isLoading={state.isLoading}
              closeExportModal={() => {
                state.openExportModal = false;
                render();
              }}
              selectedTimeRange={state.selectedTimeRange}
              date={state.date}
              dateList={state.dateList}
              startDate={state.startDate}
              endDate={state.endDate}
              monthDate={state.monthDate}
              handleExport={handleExport}
            />
          )}
        </div>
      </Flex>
    </>
  );
};

export default withTransaction('EnergyEfficiency', 'component')(EnergyEfficiency);

const IconChevrot = (handle) => (handle ? <ChevronDown /> : <ChevronUp />);
