import { useEffect, useState, useRef } from 'react';

import moment from 'moment';
import Checkbox from '@material-ui/core/Checkbox';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, ScatterChart, Scatter, Tooltip, Dot,
} from 'recharts';
import { Flex, Box } from 'reflexbox';
import { CSVLink } from 'react-csv';
import {
  Overlay, Loader,
  Select,
  QuickSelectionV2,
  SelectMultiple,
  Checkbox as CheckboxComponent,
  Card,
} from '~/components';
import { getEndTime } from '~/helpers';
import * as axisCalc from '~/helpers/axisCalc';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import {
  CalendarIcon, ExportWorksheetIcon, ArrowLeftIcon, ArrowRightIcon,
  ExportIcon,
} from '~/icons';
import { apiCall } from '../../../../providers';
import { colors } from '~/styles/colors';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { useHistory } from 'react-router-dom';
import { t } from 'i18next';
import i18n from '~/i18n';

import {
  CheckboxLine,
  Text,
  DesktopWrapper,
  ContainerArrowRight,
  ContainerArrowLeft,
  LabelData,
  ContentDate,
  BtnExport,
} from './styles';
import { NoGraph } from '~/components/NoGraph';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import {
  InfoSelected, InputStyledSelected, SearchInputStyled, SelectedContent, SelectOptionStyled,
} from '../../Integrations/IntegrHistory/ChillerCarrierHistory/components/styles';
import { ButtonClear, SearchInput } from '../../styles';
import { darkenColor } from '~/helpers/chillerParametersHelpers';
import { GenerateGraphSample } from './components/DacHistoryGraph';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';

interface VarItem {
  id: string;
  name: string;
  unit?: string;
  y: (null | number)[];
  strokeDasharray: string;
  type: string;
  color: string;
  axisId: string;
  maxY?: null | number;
  minY?: null | number;
  y_orig?: (null | number | string)[];
  steps?: {
    y_orig: null | number | string;
    y_chart: null | number;
    label: string;
  }[];
  checked?: boolean;
}

const colorList = [
  '#e6194B',
  '#3cb44b',
  '#c7ad00',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#42d4f4',
  '#f032e6',
  '#96ca11',
  '#f25991',
  '#469990',
  '#dcbeff',
  '#9A6324',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#a9a9a9',
];

const varsProperties = {
  Tamb: {
    colorDefault: colors.Green,
    colorFanCoil: colors.Pink100,
    strokeDasharray: '',
    type: 'monotone',
  },
  Tsuc: {
    colorDefault: colors.Blue300,
    colorFanCoil: colors.Red,
    colorHeat: colors.Blue300,
    strokeDasharray: '',
    type: 'monotone',
  },
  Tliq: {
    colorDefault: colors.Red,
    colorFanCoil: colors.Blue300,
    colorHeat: colors.Red,
    strokeDasharray: '',
    type: 'monotone',
  },
  Psuc: {
    colorDefault: colors.Blue300,
    colorFanCoil: colors.Blue300,
    strokeDasharray: '5 5',
    type: 'monotone',
  },
  Pliq: {
    colorDefault: colors.Red,
    colorFanCoil: colors.Red,
    strokeDasharray: '5 5',
    type: 'monotone',
  },
  Tsc: {
    colorDefault: colors.Blue500,
    colorFanCoil: colors.Blue500,
    strokeDasharray: '3 3',
    type: 'monotone',
  },
  Tsh: {
    colorDefault: colors.Pink400,
    colorFanCoil: colors.Pink400,
    strokeDasharray: '3 3',
    type: 'monotone',
  },
  Lcmp: {
    colorDefault: colors.Grey400,
    colorFanCoil: colors.Grey400,
    strokeDasharray: '',
    type: 'step',
  },
  SavedData: {
    colorDefault: colors.Grey200,
    colorFanCoil: colors.Grey200,
    strokeDasharray: '',
    type: 'step',
  },
  Levp: {
    colorDefault: colors.Grey400,
    colorFanCoil: colors.Grey400,
    strokeDasharray: '',
    type: 'step',
  },
  Lcut: {
    colorDefault: colors.Orange600,
    colorFanCoil: colors.Orange600,
    strokeDasharray: '',
    type: 'step',
  },
  L1raw: {
    colorDefault: colors.Grey400,
    colorFanCoil: colors.Grey400,
    strokeDasharray: '',
    type: 'step',
  },
  L1fancoil: {
    colorDefault: colors.Grey400,
    colorFanCoil: colors.Grey400,
    strokeDasharray: '',
    type: 'step',
  },
  deltaT: {
    colorDefault: '#181842',
    colorFanCoil: '#181842',
    strokeDasharray: '3 3',
    type: 'monotone',
  },
  Icomp: {
    colorDefault: colors.Green_v2,
    colorFanCoil: colors.Green_v2,
    strokeDasharray: '',
    type: 'monotone',
  },
  Vinsuf: {
    colorDefault: colors.Yellow_v3,
    colorFanCoil: colors.Yellow_v3,
    strokeDasharray: '',
    type: 'monotone',
  },
};

let CSVheader = [] as any;

let varsFix = [] as any;

function calculateGraphData(faultsChart) {
  const booleanLines = faultsChart.lines.filter((line) => line.isBool || line.length === 0).map((line) => line.data);

  const { tempLimits, tempTicks, L1start } = axisCalc.calculateAxisInfo({}, booleanLines.length);
  faultsChart.L1start = L1start;
  faultsChart.leftLimits = tempLimits;
  faultsChart.leftTicks = tempTicks;
  const ticksValues = axisCalc.updateBoolY(booleanLines, L1start);

  const boolTicksNames = {};
  for (let i = 0; i < booleanLines.length; i++) {
    const [tick_0, tick_1] = ticksValues[i];
    boolTicksNames[String(tick_0)] = faultsChart.lines[i].lineId;
    boolTicksNames[String(tick_1)] = '';
  }
  faultsChart.boolTicksNames = boolTicksNames;
}

function processFaultsData(histData: { [lineId: string]: { x: number; L: number; }[] }, faultsChart) {
  const lines = [] as { lineId: string, color: string, data: { x:number, L:number }[] }[]; // { lineId: 'CHAV_d', color: 'blue', data: [{ x: 10, y: 20 }] }
  let colorIndex = 0;
  for (const [faultId, line] of Object.entries(histData)) {
    lines.push({
      lineId: faultId,
      isBool: true,
      color: colorList[colorIndex],
      data: line,
    });
    colorIndex = (colorIndex + 1) % colorList.length;
  }

  faultsChart.lines = lines;
  calculateGraphData(faultsChart);
}

export const DACHistoric = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const routeParams = useParams<{ devId }>();
  const history = useHistory();
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaHistorico')}</title>
      </Helmet>
      <DACHistoricContents onDevInfoUpdate={render} />
    </>
  );
};
export function DACHistoricContents({ onDevInfoUpdate = undefined as undefined|(() => void) }) {
  const [profile] = useState(getUserProfile);
  const csvLinkEl = useRef();
  const { devId: dacId } = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      xDomain: null as null|([number, number]),
      xTicks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] as number[],
      refAreaLeft: null as null|number,
      refAreaRight: null as null|number,
      numDays: 1 as number,
      dateStart: null as null|moment.Moment,
      dateEnd: null as null|moment.Moment,
      tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
      arrowDisabled: false,
      chartData: {
        x: [] as number[],
        vars: null as null|VarItem[],
      },
      numDeparts: [] as number[],
      csvData: [] as {}[],
      focused: false,
      focusedInput: null as 'endDate'|'startDate'|null,
      dacId,
      devInfo: getCachedDevInfoSync(dacId),
      selectedL1Sim: undefined as undefined|boolean,
      isModalOpen: false,
      isLoading: false,
      gotHwCfg: false,
      advancedAnalysis: false,
      withPsuc: false,
      date: getEndTime(),
      usePsi: (profile.prefsObj.pressureUnit === 'psi'),
      axisDataLimits: {} as { minTval?: number, maxTval?: number, minPval?: number, maxPval?: number },
      axisInfo: {
        L1start: null as null|number,
        tempLimits: [-5, 30],
        tempTicks: [-5, 0, 5, 10, 15, 20, 25, 30],
        presLimits: [-5, 35],
        presTicks: [-5, 0, 5, 10, 15, 20, 25, 30, 35],
      },
      faultsChart: {
        L1start: null,
        leftLimits: [-5, 30],
        leftTicks: [-5, 0, 5, 10, 15, 20, 25, 30],
        lines: [], // { lineId: 'CHAV_d', color: 'blue', data: [{ x: 10, y: 20 }] }
        boolTicksNames: {}, // { '-1.1': 'LIGADO' }
      },
      graphEnable: {
        Tamb: true,
        Tsuc: true,
        Tliq: true,
        deltaT: true,
        Psuc: true,
        Pliq: true,
        Tsc: true,
        Tsh: true,
        Lcmp: true,
        Levp: true,
        Lcut: true,
        Icomp: true,
        L1raw: true,
        L1fancoil: true,
        t_lim: true,
        deltaT_lim: true,
        Vinsuf: true,
        SavedData: true,
      },
      hwCfg: {
        hasPliq: true, hasPsuc: true, hasTsc: true, hasTsh: true, hasAutomation: false, isFanCoil: false,
      },
      heatExchangerInfo: {} as {
        ID: number
        NAME: string
        T_MIN: number
        T_MAX: number
        DELTA_T_MIN: number
        DELTA_T_MAX: number
      } | null,
      alteredValues: [] as { originalValue: number, roundedValue: number }[],
      periodSelected: t('dia'),
      optionsParameters: [] as { value: string, name: string, color: string, checked: boolean, index: number }[],
      selectedParameters: [] as { value: string, name: string, color: string, checked: boolean, index: number }[],
    };
    return state;
  });

  const {
    hwCfg, axisInfo, graphEnable, chartData,
  } = state;
  // const readyToRequestHistory = state.connectedWS && state.gotHwCfg;

  const dateRanges = [
    {
      label: t('hoje'),
      start: () => moment(),
      end: () => moment(),
      changeSelectedPeriod: () => handleSelection(t('hoje')),
    },
    {
      label: t('ontem'),
      start: () => moment().subtract(1, 'day'),
      end: () => moment().subtract(1, 'day'),
      changeSelectedPeriod: () => handleSelection(t('ontem')),
    },
    {
      label: t('semanaAtual'),
      start: () => moment().startOf('week'),
      end: () => moment(),
      changeSelectedPeriod: () => handleSelection(t('semanaAtual')),
    },
    {
      label: t('semanaPassada'),
      start: () => moment().subtract(7, 'days').startOf('week'),
      end: () => moment().subtract(7, 'days').endOf('week'),
      changeSelectedPeriod: () => handleSelection(t('semanaPassada')),
    },
    {
      label: t('ultimos7dias'),
      start: () => moment().subtract(7, 'days'),
      end: () => moment().subtract(1, 'day'),
      changeSelectedPeriod: () => handleSelection(t('ultimos7dias')),
    },
    {
      label: t('ultimos15dias'),
      start: () => moment().subtract(15, 'days'),
      end: () => moment().subtract(1, 'day'),
      changeSelectedPeriod: () => handleSelection(t('ultimos15dias')),
    },
  ];

  function CheckPermDetected(fault: {
    detected_fault_id: number;
    timestamp: string;
    dev_id: string;
    rise: boolean;
    approved: boolean | null;
    source: 'Endpoint' | 'FR';
    restab: boolean;
    fault_id: string;
    name: string;
    gravity: string;
    approval_type: string;
    permanence_detected: boolean;
  }) {
    if (fault.permanence_detected === true && fault.restab === false) {
      return '(Lógica Permanência)';
    }
    if (fault.restab === true) {
      return '(Restabelecimento)';
    }
    return '';
  }

  function processFault(fault, faultsHist, definitions, gravityTranslation, periodStart) {
    if (fault.source === 'Endpoint') return;

    let approvalState = '';
    if (fault.approved === true) {
      approvalState = ' - Approved';
    } else if (fault.approved === false) {
      approvalState = ' - Rejected';
    }

    const isPermDetected = CheckPermDetected(fault);
    const faultTextAux = `${definitions[fault.fault_id].name} - ${gravityTranslation[definitions[fault.fault_id].gravity]}`;

    const desc = `${isPermDetected} ${faultTextAux}${approvalState}`;

    if (!faultsHist[faultTextAux]) {
      faultsHist[faultTextAux] = [];
    }

    faultsHist[faultTextAux].push({
      x: moment.duration(moment.utc(fault.timestamp).diff(periodStart)).asHours(),
      L: 0,
      desc,
      time: moment.utc(fault.timestamp),
    });
  }

  async function getFaultHistory() {
    try {
      const faultsHist = {} as {
          [faultId : string]: {
            x: number
            L:number
            desc: string
          }[]
        };
      if (state.advancedAnalysis) {
        const periodStart = moment(state.dateStart).startOf('day').utc();
        const faultParams = {
          dev_id: state.dacId,
          start_time: periodStart.utc().format('YYYY-MM-DDTHH:mm:ss'),
          end_time: moment(state.dateEnd).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss'),
        };
        const [faultDefs, faults] = await Promise.all([apiCall('/dac/get-fault-descs'), apiCall('/dac/get-fr-history', faultParams)]);
        if (!faultDefs || !faults || !faults.history) {
          console.log('Não foi possível obter definições de falhas ou histórico de falhas');
          toast.error(t('erroObterDadosDeFalha'));
          state.isLoading = false;
          render();
          return;
        }
        const gravityTranslation = {
          Green: 'Verde',
          Yellow: 'Amarela',
          Orange: 'Laranja',
          Red: 'Vermelha',
        };

        const definitions = {};

        for (const faultDef of faultDefs.defs) {
          definitions[faultDef.fault_id] = faultDef;
        }

        for (const fault of faults.history) {
          processFault(fault, faultsHist, definitions, gravityTranslation, periodStart);
        }
        processFaultsData(faultsHist, state.faultsChart);
      }
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function generateMappings() {
    const mappingValues = new Map<number, number>();

    const min = -2.4;
    const max = -100;
    let current = min;
    let alternate = true;
    let minKey = -3;

    while (current >= max) {
      const nextValue = current + (alternate ? -2.1 : -2.9);
      mappingValues.set(Number(current.toFixed(1)), minKey);
      minKey -= 3;
      current = nextValue;
      alternate = !alternate;
    }

    return mappingValues;
  }

  function roundToFurthestMultipleOfThree(value: number, trackChanges: boolean, mappings: Map<number, number>) {
    if (value <= -2.4) {
      const roundedValue = mappings.get(value) ?? value;

      if (trackChanges && !state.alteredValues.some((val) => val.roundedValue === roundedValue)) {
        state.alteredValues.push({ originalValue: value, roundedValue });
        verifyPairValues(value, roundedValue);
      }

      return roundedValue;
    }

    return value;
  }

  function verifySelectedParams() {
    const selectedParams = ['Tamb', 'Tsuc', 'Tliq', 'Psuc', 'Pliq', 'Tsc', 'Tsh', 'Lcmp', 'Levp', 'Lcut', 'Icomp', 'Vinsuf'];
    if (verifyShowSavedData()) {
      selectedParams.push('SavedData');
    }

    return selectedParams;
  }

  function verifyPairValues(value: number, roundedValue: number) {
    const valString = value.toString();
    if (valString.endsWith('.4')) {
      const nextValue = Number((value - 2.1).toFixed(1));
      const existingEntry = state.alteredValues.find((item) => item.originalValue === nextValue);
      if (!existingEntry) {
        state.alteredValues.push({
          originalValue: nextValue,
          roundedValue: roundedValue - 3,
        });
      }
    } else if (valString.endsWith('.5')) {
      const nextValue = Number((value + 2.1).toFixed(1));
      const existingEntry = state.alteredValues.find((item) => item.originalValue === nextValue);
      if (!existingEntry) {
        state.alteredValues.push({
          originalValue: nextValue,
          roundedValue: roundedValue + 3,
        });
      }
    }
  }

  useEffect(() => {
    if (!state.gotHwCfg) return;
    if (!state.dateStart || !state.dateEnd) return;

    state.alteredValues = [];

    Promise.resolve().then(async () => {
      if (!state.isLoading) {
        state.isLoading = true;
        render();
      }
      try {
        const d1 = new Date(`${moment(state.dateStart).format('YYYY-MM-DD')}T00:00:00Z`).getTime();
        const d2 = new Date(`${moment(state.dateEnd).format('YYYY-MM-DD')}T00:00:00Z`).getTime();
        const numDays = Math.round((d2 - d1) / 1000 / 60 / 60 / 24) + 1;
        state.numDays = numDays;
        if ((numDays >= 1) && (numDays <= 15)) { } // OK
        else {
          toast.error(t('periodoDe1a15Dias'));
          state.isLoading = false;
          render();
          return;
        }

        // FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA
        state.graphEnable.Icomp = (state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2);

        const params = {
          dacId: state.dacId,
          dayYMD: moment(state.dateStart).format('YYYY-MM-DD'),
          selectedParams: verifySelectedParams(),
          numDays,
          usePsi: state.usePsi,
          isFanCoil: state.hwCfg.isFanCoil,
          hasAutomation: state.hwCfg.hasAutomation,
        };

        const {
          vars, commonX, limts, numDeparts,
        } = await apiCall('/dac/get-charts-data-common', params);

        if (!profile.manageAllClients) {
          vars.Psuc.y = vars.Psuc.y.map((psuc) => {
            if (psuc && psuc === (-2.8)) {
              return null;
            }
            if (psuc && psuc !== (-2.8)) {
              state.withPsuc = true;
            }
            return psuc;
          });
        }

        varsFix = vars;
        state.chartData.x = commonX;
        state.numDeparts = numDeparts;

        if (state.hwCfg.isFanCoil || state.devInfo.dac!.DAC_APPL === 'trocador-de-calor') {
          vars.deltaT = JSON.parse(JSON.stringify(vars.Tliq));
          vars.Tsuc.name = t('temperaturaSaidaAgua');
          vars.Tliq.name = state.devInfo.dac!.DAC_APPL === 'trocador-de-calor' ? t('temperaturaRetornoAgua') : t('temperaturaEntradaAgua');
          vars.Tamb.name = t('temperaturaExterna');
          vars.deltaT.name = 'ΔT';
          for (let i = 0; i < vars.Tliq.y.length; i++) {
            if (vars.Tliq.y[i] && vars.Tsuc.y[i]) vars.deltaT.y[i] = Number((vars.Tliq.y[i] - vars.Tsuc.y[i]).toFixed(2));
          }
        }

        if (state.devInfo.dac.DAC_TYPE === 'self') {
          vars.Tamb.name = t('temperaturaRetorno');
        }

        insertVars(vars);

        const debug_L1_fancoil = state.hwCfg.isFanCoil && profile.manageAllClients;

        // const boolLines = state.hwCfg.hasAutomation ? [vars.Levp, vars.Lcut] : [vars.Lcmp];
        const boolLines = state.hwCfg.hasAutomation
          ? (debug_L1_fancoil ? [vars.L1raw, vars.L1fancoil, vars.Lcut] : [vars.Levp, vars.Lcut])
          : (debug_L1_fancoil ? [vars.L1raw, vars.L1fancoil] : [vars.Lcmp]);
        state.axisDataLimits = axisCalc.updateDataLimits(limts);
        state.axisInfo = axisCalc.calculateAxisInfo(state.axisDataLimits, boolLines.length);
        const mappings = generateMappings();
        state.axisInfo.tempTicks = state.axisInfo.tempTicks.map((value) => roundToFurthestMultipleOfThree(value, false, mappings)).sort((a, b) => a - b);
        // Ajuste quando valor mínimo de pressão é negativo
        if (state.axisDataLimits.minPval && state.axisDataLimits.minPval < 0) {
          state.axisInfo.presLimits = [state.axisInfo.presLimits[0] - 1, state.axisInfo.presLimits[1]];
        }

        state.xDomain = [0, 24 * numDays];
        state.xTicks = Array.from({ length: 13 }, (_, i) => i * 2 * numDays);

        axisCalc.updateBoolY(boolLines, state.axisInfo.L1start!);
      } catch (err) { console.log(err); toast.error(t('erro')); }

      await getFaultHistory();

      state.isLoading = false;
      render();
    });
  }, [state.gotHwCfg, JSON.stringify(state.date), state.dateStart, state.dateEnd, state.advancedAnalysis]);

  useEffect(() => {
    (async function () {
      const devInfo = await getCachedDevInfo(state.dacId, {});
      if (onDevInfoUpdate) onDevInfoUpdate();
      state.devInfo = devInfo;
      const dacInfo = devInfo.dac;
      state.hwCfg.hasPsuc = (dacInfo.P0Psuc || dacInfo.P1Psuc);
      state.hwCfg.hasPliq = (dacInfo.P0Pliq || dacInfo.P1Pliq);
      state.hwCfg.hasTsh = state.hwCfg.hasPsuc;
      state.hwCfg.hasTsc = state.hwCfg.hasPliq;
      state.hwCfg.hasAutomation = dacInfo.hasAutomation;
      state.hwCfg.isFanCoil = (dacInfo.DAC_APPL === 'fancoil');
      if (state.hwCfg.isFanCoil) {
        state.selectedL1Sim = state.devInfo.dac.SELECTED_L1_SIM === '1';
        if (profile.manageAllClients) {
          state.graphEnable.Lcmp = false;
          state.graphEnable.Levp = false;
          state.graphEnable.L1raw = true;
          state.graphEnable.L1fancoil = true;
        }
      }
      if (!state.hwCfg.hasPsuc) state.graphEnable.Psuc = false;
      if (!state.hwCfg.hasPliq) state.graphEnable.Pliq = false;
      if (!state.hwCfg.hasAutomation) state.graphEnable.Levp = false;
      if (!state.hwCfg.hasAutomation) state.graphEnable.Lcut = false;
      if (state.hwCfg.hasAutomation) state.graphEnable.Lcmp = false;
      state.gotHwCfg = true;

      const heatExchangeId = dacInfo!.HEAT_EXCHANGER_ID;
      if (heatExchangeId && dacInfo!.DAC_APPL === 'trocador-de-calor') {
        state.heatExchangerInfo = await apiCall('/heat-exchanger/get-info-v2', { CLIENT_ID: devInfo.CLIENT_ID, HEAT_EXCHANGER_ID: heatExchangeId });
      }

      state.optionsParameters = initializeOptionParameters();

      render();
    }()).catch(console.log);
  }, []);

  useEffect(() => {
    const weekdaysMin: string[] = t('weekdaysMin', { returnObjects: true });
    const language = i18n.language === 'pt' ? 'pt-br' : i18n.language;
    moment.updateLocale(language, {
      weekdaysMin,
    });
  }, [i18n.language, t]);

  function findColorByKey(key) {
    const optionIndex = state.optionsParameters.findIndex((option) => option.value === key);
    const color = optionIndex !== -1 ? state.optionsParameters[optionIndex].color : varsProperties[key].colorDefault;

    return color;
  }

  function verifyKeyToAdjustData(key: string, vars: VarItem[], mappings: Map<number, number>) {
    if (['Lcmp', 'Levp', 'L1raw', 'L1fancoil', 'Lcut', 'SavedData'].some((x) => x === key)) {
      vars[key].y = vars[key].y.map((value) => roundToFurthestMultipleOfThree(value, true, mappings)); }
  }

  function verifyShowSavedData() {
    return state.advancedAnalysis && profile.manageAllClients;
  }

  function insertVars(vars: any) {
    const mappings = generateMappings();
    state.alteredValues = [];
    const chartVars: (typeof chartData.vars) = [];
    let i = 0;

    let tsucIndex: number | null = null;
    let tliqIndex: number | null = null;

    for (const key in vars) {
      if ((vars.hasOwnProperty(key) && checkKeyInsertVars(key)) || (key === 'SavedData' && verifyShowSavedData())) {
        // Se for trocador de calor
        const color = findColorByKey(key);
        if (state.devInfo?.dac?.DAC_APPL === 'trocador-de-calor') {
          ({ tsucIndex, tliqIndex } = updateIndexes(key, i, tsucIndex, tliqIndex));
        }
        verifyKeyToAdjustData(key, vars, mappings);

        chartVars.push({
          id: key,
          name: vars[key].name,
          y: vars[key].y,
          color,
          strokeDasharray: varsProperties[key].strokeDasharray,
          axisId: checkAxisId(key),
          checked: graphEnable[key].checked,
          type: varsProperties[key].type,
          unit: verifyUnitMed(key),
          maxY: 35,
          minY: 0,
        });
      }

      i++;
    }

    verifyTsucTliqIndexes(chartVars, tsucIndex, tliqIndex);

    state.chartData.vars = chartVars;
  }

  function checkKeyInsertVars(key: string) {
    return graphEnable[key] && state.optionsParameters.some((opt) => opt.value === key);
  }

  function checkAxisId(key: string) {
    return (key === 'Psuc' || key === 'Pliq' ? 'press' : 'temp');
  }

  function updateIndexes(
    key: string,
    index: number,
    tsucIndex: number | null,
    tliqIndex: number | null,
  ): { tsucIndex: number | null; tliqIndex: number | null } {
    if (key === 'Tliq') {
      tliqIndex = index;
    }
    if (key === 'Tsuc') {
      tsucIndex = index;
    }
    return { tsucIndex, tliqIndex };
  }

  function verifyTsucTliqIndexes(chartVars: typeof chartData.vars, tsucIndex: number|null, tliqIndex: number|null) {
    // Altera os índices de Tsuc e Tliq
    if (chartVars && tsucIndex !== null && tliqIndex !== null) {
      const temp = chartVars[tsucIndex];
      chartVars[tsucIndex] = chartVars[tliqIndex];
      chartVars[tliqIndex] = temp;
    }
  }

  function verifyUnitMed(itemName: string) {
    switch (itemName) {
      case 'Pliq':
      case 'Psuc':
        return isUsePsei;
      case 'Tamb':
      case 'Tsuc':
      case 'Tliq':
      case 'Tsc':
      case 'Tsh':
      case 'deltaT':
        return '°C';
      case 'Icomp':
        return 'A';
      case 'Vinsuf':
        return 'm/s';
      default:
        return '';
    }
  }

  function csvValueFormatter(value: any, id: string) {
    if (state.chartData.vars && state.axisInfo.L1start !== null && value !== null && value !== undefined) {
      let label = value.toString();
      if (id === 'Levp' || id === 'Lcut' || id === 'Lcmp') {
        const findValue = state.alteredValues.find((x) => x.roundedValue === value);
        const valAux = findValue?.originalValue ?? value;
        if (valAux < (state.axisInfo.L1start - 5)) {
          label = ((valAux % 5) > -2.5) ? 'LIBERADO' : 'BLOQUEADO';
        } else if (valAux < state.axisInfo.L1start) {
          label = ((valAux % 5) > -2.5) ? 'LIGADO' : 'DESLIGADO';
        }
      }
      const numberValue = parseFloat(label);
      if (!Number.isNaN(numberValue)) {
        return formatNumberWithFractionDigits(numberValue);
      }
      return `${label}`;
    }
    return '-';
  }

  function handleChangePeriod(period: string) {
    state.periodSelected = period;
    if (period === t('dia')) {
      state.dateEnd = state.dateStart;
    }
    render();
  }

  function tickXLabelFormaterDay(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(`${moment(state.dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');

    const dateFinal = `${dd}/${mm}`;
    return `${dateFinal}`;
  }

  function tickXLabelFormaterHour(hour: number) {
    const numDays = Math.floor(hour / 24);
    const sign = hour - 24 * numDays < 0 ? '-' : '';
    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const mm = Math.floor((Math.abs(hour) * 60) % 60);
    return `${'\n'} ${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  function CsvLabelFromaterData(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(`${moment(state.dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dateFinal = `${dd}/${mm}`;

    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const min = Math.floor((Math.abs(hour) * 60) % 60);
    const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);

    return `${dateFinal} ${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  const renderQuarterTickHour = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value, offset } = payload;
    const date = new Date(value);
    const month = date.getMonth();
    const quarterNo = Math.floor(month / 3) + 1;

    return <text x={x} y={y - 4} textAnchor="middle" className="recharts-text">{`${tickXLabelFormaterHour(value)}`}</text>;
  };

  const getCsvData = async () => {
    state.isLoading = true; render();
    const formattedCSV = [] as any;
    CSVheader = [];

    try {
      CSVheader.push({
        label: t('dataHora'),
        key: 'data',
      });

      if (state.chartData.vars && state.chartData.vars.length > 0) {
        for (const object of state.chartData.vars) {
          if (graphEnable[object.id]) {
            CSVheader.push({
              label: object.name,
              key: object.id,
            });
          }
        }

        CSVheader.push({
          label: t('numeroPartidas'),
          key: 'numDeparts',
        });

        let totalNumDeparts = 0;
        let indexNumDeparts = 0;
        for (let i = 0; i < state.chartData.x.length; i++) {
          if (state.chartData.vars) {
            let valueNumDeparts = 0;
            let insertNumDeparts = false;

            if (i > 0 && i < state.chartData.x.length - 1) {
              if (state.chartData.x[i] % 24 > state.chartData.x[i + 1] % 24) {
                valueNumDeparts = state.numDeparts[indexNumDeparts];
                insertNumDeparts = true;
                totalNumDeparts += valueNumDeparts;
                indexNumDeparts++;
              }
            }
            else if (i === state.chartData.x.length - 1) {
              valueNumDeparts = state.numDeparts[indexNumDeparts];
              insertNumDeparts = state.numDays > 1;
              totalNumDeparts += valueNumDeparts;
              indexNumDeparts++;
            }

            formattedCSV.push({
              data: `${CsvLabelFromaterData(state.chartData.x[i])}`,
              Tamb: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Tamb')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Tamb')[0].y[i], 'Tamb') : '-'),
              Tsuc: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Tsuc')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Tsuc')[0].y[i], 'Tsuc') : '-'),
              Tliq: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Tliq')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Tliq')[0].y[i], 'Tliq') : '-'),
              Psuc: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Psuc')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Psuc')[0].y[i], 'Psuc') : '-'),
              Pliq: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Pliq')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Pliq')[0].y[i], 'Pliq') : '-'),
              Tsc: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Tsc')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Tsc')[0].y[i], 'Tsc') : '-'),
              Tsh: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Tsh')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Tsh')[0].y[i], 'Tsh') : '-'),
              Lcmp: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Lcmp')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Lcmp')[0].y[i], 'Lcmp') : '-'),
              Levp: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Levp')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Levp')[0].y[i], 'Levp') : '-'),
              Lcut: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Lcut')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Lcut')[0].y[i], 'Lcut') : '-'),
              L1raw: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'L1raw')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'L1raw')[0].y[i], 'L1raw') : '-'),
              L1fancoil: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'L1fancoil')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'L1fancoil')[0].y[i], 'L1fancoil') : '-'),
              // FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA
              ...(((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2)) && { Icomp: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Icomp')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Icomp')[0].y[i], 'Icomp') : '-') }),
              ...(((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && ((state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2) && (state.devInfo.dac.EVAPORATOR_MODEL_ID || state.devInfo.dac.INSUFFLATION_SPEED))) && { Vinsuf: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Vinsuf')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Vinsuf')[0].y[i], 'Vinsuf') : '-') }),
              numDeparts: !insertNumDeparts ? null : valueNumDeparts,
            });
          }
        }

        const penultimo = CSVheader[CSVheader.length - 2].key;

        formattedCSV.push({
          data: null,
          Tamb: null,
          Tsuc: null,
          Tliq: null,
          Psuc: null,
          Pliq: null,
          Tsc: null,
          Tsh: null,
          Lcmp: null,
          Levp: null,
          Lcut: null,
          L1raw: null,
          L1fancoil: null,
          // FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA
          ...(((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2)) && { Icomp: null }),
          ...(((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && ((state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2) && (state.devInfo.dac.EVAPORATOR_MODEL_ID || state.devInfo.dac.INSUFFLATION_SPEED))) && { Vinsuf: null }),
          numDeparts: totalNumDeparts,
        });

        formattedCSV[formattedCSV.length - 1][penultimo] = t('totalPartidasPeriodo');

        state.csvData = formattedCSV;
        render();
        setTimeout(() => {
          (csvLinkEl as any).current.link.click();
        }, 1000);

        state.isLoading = false; render();
      }
      else {
        toast.info(t('semDadosGraficoExportar')); state.isLoading = false;
      }
    } catch (err) { console.log(err); toast.error(t('erro')); state.isLoading = false; }
  };

  function verifyIsOutsideRange(date: moment.Moment) {
    const startDate = moment(state.dateStart, 'YYYY-MM-DD').startOf('day');
    const maxEndDate = startDate.isValid() ? startDate.clone().add(14, 'day').endOf('day') : null;

    const isAfterMaxEndDate = maxEndDate ? date.isAfter(maxEndDate) : false;

    return isAfterMaxEndDate || !date.isBefore(state.tomorrow);
  }

  const temperatureLabel = (() => {
    if (state.devInfo.dac && state.devInfo.dac.DAC_APPL === 'trocador-de-calor') {
      return t('deRetornoAgua');
    }
    if (hwCfg.isFanCoil) {
      return t('deEntradaAgua');
    }
    return t('deSuccao');
  })();

  const typeLoading = () => (state.isLoading ? 'disabled' : 'primary');

  const returnNoGraph = (() => {
    if (!state.dateStart || !state.dateEnd) {
      return <NoGraph title={t('historicoDoDac')} />;
    }
    return null;
  })();

  const isFanCoilOrHeatExchanger = (() => {
    if (state.devInfo.dac.DAC_APPL === 'fancoil' || hwCfg.isFanCoil || state.devInfo.dac!.DAC_APPL === 'trocador-de-calor') {
      return true;
    }
    return false;
  })();

  const verifyClientsFeature = (() => {
    if ((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2)) {
      return true;
    }
    return false;
  })();

  const verifyEvaporatorAndInsufflation = (() => {
    if ((state.devInfo.dac.EVAPORATOR_MODEL_ID || state.devInfo.dac.INSUFFLATION_SPEED))
    {
      return true;
    }
    return false;
  })();

  const isUsePsei = (() => {
    if (state.usePsi) {
      return 'PSI';
    }
    return 'Bar';
  })();

  function labelTempSelf() {
    if (state.devInfo.dac.DAC_TYPE === 'self') {
      return t('deRetorno');
    }
    return t('externa');
  }

  function handleSelection(label: string) {
    if (label === t('hoje') || label === t('ontem')) {
      state.periodSelected = t('dia');
    } else {
      state.periodSelected = t('flexivel');
    }

    render();
  }

  function onDateChange(date: moment.Moment, dateEnd: moment.Moment, isQuickSelection?: boolean) {
    const dateEndAux = !isQuickSelection && date?.format('YYYY-MM-DD') !== state.dateStart?.format('YYYY-MM-DD') ? null : dateEnd;

    setState({
      dateStart: date,
      dateEnd: dateEndAux,
    });
  }

  function handleDateChangeDirection(change: number) {
    const dateInit = moment(state.dateStart);
    const dateEnd = moment(state.dateEnd);

    if (state.periodSelected === t('dia')) {
      const formattedDate = dateInit.add(change, 'days');
      setState({
        dateStart: formattedDate,
        dateEnd: formattedDate,
      });
    } else {
      const differenceInDays = dateEnd.diff(dateInit, 'days');
      const formattedDateInit = dateInit.add(change * differenceInDays, 'days');
      const formattedDateEnd = dateEnd.add(change * differenceInDays, 'days');
      setState({
        dateStart: formattedDateInit,
        dateEnd: formattedDateEnd,
      });
    }

    getDisabledButton();
  }

  function getDisabledButton() {
    const endDate = moment(state.dateEnd);
    const currentDate = moment();
    const currentDay = currentDate.day();

    if (state.periodSelected === t('dia') && endDate.day() === currentDay) {
      setState({ arrowDisabled: true });
    } else {
      const differenceInDays = endDate.diff(moment(state.dateStart), 'days');
      const newEndDate = endDate.add(differenceInDays, 'days');

      setState({ arrowDisabled: currentDate.startOf('day').isBefore(newEndDate.startOf('day')) });
    }
  }

  function veirifyLeftArrowDisabled() {
    return state.isLoading || (!state.dateStart || !state.dateEnd);
  }

  function verifyRightArrowDisabled() {
    return state.arrowDisabled || (!state.dateStart || !state.dateEnd);
  }

  function selectedParameter(item) {
    state.optionsParameters[item.index].checked = !state.optionsParameters[item.index].checked;
    const parameter = item.value;

    if (graphEnable.hasOwnProperty(parameter)) {
      graphEnable[parameter] = !graphEnable[parameter];
      insertVars(varsFix);
    }

    state.selectedParameters = state.optionsParameters.filter((item) => item.checked);

    render();
  }

  function createOptionParameter(value: string, name: string, index: number) {
    const color = getColorBasedOnConditions(value);
    return {
      value,
      name,
      color,
      checked: true,
      index,
    };
  }

  function initializeOptionParameters() {
    render();
    const valueIndex = { index: 0 };
    const options = [
      createOptionParameter('Tamb', `${t('temperatura')} ${labelTempSelf()} [°C]`, valueIndex.index++),
      createOptionParameter(isFanCoilOrHeatExchanger ? 'Tliq' : 'Tsuc', `${t('temperatura')} ${temperatureLabel} [°C]`, valueIndex.index++),
      createOptionParameter(isFanCoilOrHeatExchanger ? 'Tsuc' : 'Tliq', `${t('temperatura')} ${isFanCoilOrHeatExchanger ? t('deSaidaAgua') : t('deLiquido')} [°C]`, valueIndex.index++),
      ...addFanCoilAndHeatExchangerOptions(valueIndex),
      ...addPsucPliqTscTshOptions(valueIndex),
      ...addAutomationOptions(valueIndex),
      ...addHeatExchangerOptions(valueIndex),
      ...addClientFeatureOptions(valueIndex),
    ];

    return options;
  }

  function addFanCoilAndHeatExchangerOptions(valueIndex: { index: number }) {
    const options = [] as { value: string, name: string, color: string, checked: boolean, index: number }[];
    if (isFanCoilOrHeatExchanger) {
      options.push(createOptionParameter('deltaT', 'ΔT [°C]', valueIndex.index++));
    }
    return options;
  }

  function addPsucPliqTscTshOptions(valueIndex: { index: number }) {
    const options = [] as { value: string, name: string, color: string, checked: boolean, index: number }[];
    if ((!profile.manageAllClients && state.withPsuc) || (profile.manageAllClients && hwCfg.hasPsuc)) {
      options.push(createOptionParameter('Psuc', `${t('pressaoSuccao')} [${isUsePsei}]`, valueIndex.index++));
    }

    if (hwCfg.hasPliq) {
      options.push(createOptionParameter('Pliq', `${t('pressaoLiquido')} [${isUsePsei}]`, valueIndex.index++));
    }

    if (hwCfg.hasTsc) {
      options.push(createOptionParameter('Tsc', `${t('subresfriamento')} ΔT°C`, valueIndex.index++));
    }

    if (hwCfg.hasTsh) {
      options.push(createOptionParameter('Tsh', `${t('superaquecimento')} ΔT°C`, valueIndex.index++));
    }

    return options;
  }

  function addAutomationOptions(valueIndex: { index: number }) {
    const options = [] as { value: string, name: string, color: string, checked: boolean, index: number }[];
    if (!hwCfg.hasAutomation && (!hwCfg.isFanCoil || !profile.manageAllClients)) {
      options.push(createOptionParameter('Lcmp', `${t('sinalComando')}`, valueIndex.index++));
    }

    if ((hwCfg.hasAutomation) && (!hwCfg.isFanCoil || !profile.manageAllClients)) {
      options.push(createOptionParameter('Levp', `${t('sinalComando')}`, valueIndex.index++));
    }

    if (hwCfg.isFanCoil && profile.manageAllClients) {
      options.push(createOptionParameter('L1raw', `${t('sinalComandoReal')}`, valueIndex.index++));
      options.push(createOptionParameter('L1fancoil', `${t('sinalComandoSimulado')}`, valueIndex.index++));
    }

    if (hwCfg.hasAutomation) {
      options.push(createOptionParameter('Lcut', `${t('bloqueioComando')}`, valueIndex.index++));
    }

    return options;
  }

  function addHeatExchangerOptions(valueIndex: { index: number }) {
    const options = [] as { value: string, name: string, color: string, checked: boolean, index: number }[];
    if (state.devInfo?.dac?.DAC_APPL === 'trocador-de-calor' && state.devInfo?.dac?.HEAT_EXCHANGER_ID) {
      options.push(createOptionParameter('t_lim', `${t('limitesTemperaturaSaidaAgua')}`, valueIndex.index++));
      options.push(createOptionParameter('deltaT_lim', `${t('limitesTemperaturaT')}`, valueIndex.index++));
    }
    return options;
  }

  function addClientFeatureOptions(valueIndex: { index: number }) {
    const options = [] as { value: string, name: string, color: string, checked: boolean, index: number }[];
    if (verifyClientsFeature) {
      options.push(createOptionParameter('Icomp', `${t('correnteDoCompressor')} [A]`, valueIndex.index++));
    }

    if (verifyClientsFeature && verifyEvaporatorAndInsufflation) {
      options.push(createOptionParameter('Vinsuf', `${t('velocidadeDeInsuflamento')} [m/s]`, valueIndex.index++));
    }

    return options;
  }

  function getColorBasedOnConditions(key: string): string {
    const { dac } = state.devInfo;
    const { colorHeat, colorFanCoil, colorDefault } = varsProperties[key];

    if (dac?.DAC_APPL === 'trocador-de-calor' && colorHeat) {
      return colorHeat;
    }

    if (hwCfg.isFanCoil && colorFanCoil) {
      return colorFanCoil;
    }

    return colorDefault;
  }

  function setColor(e, index) {
    const selectedColor = e.target.value;
    const darkenedColor = darkenColor(selectedColor, 40);
    state.optionsParameters[index].color = darkenedColor;
  }

  const handleColorInputClick = (event) => {
    event.stopPropagation();
  };

  const handleBlur = () => {
    insertVars(varsFix);
    render();
  };

  const renderOption = (option) => (
    <SelectOptionStyled className={option.value} disabled={false}>
      <SelectedContent>
        <InfoSelected>
          <CheckboxComponent checked={option.checked} size={18} />
          <InputStyledSelected type="checkbox" checked={option.checked} isLeft={false} />
          <span style={{ marginLeft: '10px' }}>
            {
             option.name
            }
          </span>
        </InfoSelected>
        <input type="color" id={option.value} value={state.optionsParameters[option.index]?.color} onBlur={handleBlur} onMouseOutCapture={handleBlur} onChange={(e) => setColor(e, option.index)} onClick={handleColorInputClick} />
      </SelectedContent>
    </SelectOptionStyled>
  );

  function clearCheckbox() {
    if (state.isLoading) return;

    state.optionsParameters.forEach((option) => {
      option.checked = false;
    });

    state.graphEnable = {
      Tamb: false,
      Tsuc: false,
      Tliq: false,
      deltaT: false,
      Psuc: false,
      Pliq: false,
      Tsc: false,
      Tsh: false,
      Lcmp: false,
      Levp: false,
      Lcut: false,
      Icomp: false,
      L1raw: false,
      L1fancoil: false,
      t_lim: false,
      deltaT_lim: false,
      Vinsuf: false,
      SavedData: true,
    };

    state.selectedParameters = [];

    render();
  }

  return (
    <>
      <Flex justifyContent="space-between" flexWrap="wrap" mb={10}>
        <Flex flexWrap="wrap" style={{ gap: '10px' }} mb={20}>
          <Box width="110px">
            <Select
              options={[
                t('dia'),
                t('flexivel'),
              ]}
              onSelect={(period: string) => {
                handleChangePeriod(period);
              }}
              value={state.periodSelected}
              placeholder={t('periodo')}
              hideSelected
              small
                // @ts-ignore
              disabled={state.isLoading}
              removeScroll
            />
            <QuickSelectionV2
              height="auto"
              twoColumns
              dateRanges={dateRanges}
              setDate={(startDate, endDate) => {
                onDateChange(startDate, endDate, true);
              }}
            />
          </Box>
          <Box alignItems="center">
            <ContentDate style={{ minHeight: '40px', width: '270px' }}>
              <Flex justifyContent="space-between">
                <ContainerArrowLeft disabled={veirifyLeftArrowDisabled()} onClick={() => handleDateChangeDirection(-1)}>
                  <ArrowLeftIcon color={veirifyLeftArrowDisabled() ? '#E6E6E6' : '#202370'} />
                </ContainerArrowLeft>
                <Flex flexDirection="column" width="100%">
                  <LabelData>{t('data')}</LabelData>
                  {state.periodSelected === t('dia') && (
                  <SingleDatePicker
                    disabled={state.isLoading}
                    date={state.dateStart}
                    onDateChange={(data) => { setState({ dateStart: data, dateEnd: data }); getDisabledButton(); }}
                    focused={state.focused}
                    onFocusChange={({ focused }) => {
                      state.focused = focused;
                      render();
                    }}
                    id="datepicker"
                    numberOfMonths={1}
                    displayFormat="DD/MM/YYYY"
                    isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                    placeholder={t('selecioneUmaData')}
                  />
                  )}
                  {state.periodSelected === t('flexivel') && (
                  <DateRangePicker
                    small
                    readOnly
                    disabled={state.isLoading}
                    startDate={state.dateStart}
                    startDateId="your_unique_start_date_id"
                    endDate={state.dateEnd}
                    endDateId="your_unique_end_date_id"
                    onDatesChange={({ startDate, endDate }) => {
                      onDateChange(startDate, endDate);
                      getDisabledButton();
                    }}
                    onFocusChange={(focused) => {
                      state.focusedInput = focused;
                      render();
                    }}
                    focusedInput={state.focusedInput}
                    noBorder
                    isOutsideRange={verifyIsOutsideRange}
                    startDatePlaceholderText={t('dataInicial')}
                    endDatePlaceholderText={t('dataFinal')}
                  />
                  )}

                </Flex>
                <ContainerArrowRight disabled={verifyRightArrowDisabled()} onClick={() => handleDateChangeDirection(1)}>
                  <ArrowRightIcon color={verifyRightArrowDisabled() ? '#E6E6E6' : '#202370'} />
                </ContainerArrowRight>
              </Flex>
            </ContentDate>
          </Box>
        </Flex>
        <Box>
          <Flex justifyContent="flex-end" flexWrap="wrap">
            <BtnExport disabled={state.isLoading} variant={typeLoading} onClick={getCsvData}>
              <div>
                <ExportIcon />
                <Text style={{ paddingLeft: '5px' }}>
                  {t('botaoExportar')}
                </Text>
              </div>
            </BtnExport>
            <CSVLink
              headers={CSVheader}
              data={state.csvData}
              filename={t('nomeArquivoMedicoesDeDispositivos')}
              separator=";"
              asyncOnClick
              enclosingCharacter={"'"}
              ref={csvLinkEl}
            />
          </Flex>
        </Box>
      </Flex>

      {returnNoGraph}
      {
        (state.dateStart && state.dateEnd) && (
          <Card>
            <DesktopWrapper>
              <Flex flexWrap="wrap" mb="10px" style={{ gap: '20px' }}>
                <div style={{ justifyContent: 'right', width: '100%', maxWidth: '400px' }}>
                  <SearchInput style={{ width: '100%', marginLeft: '0' }}>
                    <SearchInputStyled>
                      <SelectMultiple
                        options={state.optionsParameters}
                        values={state.selectedParameters}
                        multiple
                        search
                        haveFuzzySearch
                        propLabel="name"
                        placeholder={t('parametros')}
                        onSelect={(value) => { selectedParameter(value); }}
                        customElements={renderOption}
                        disabled={state.isLoading}
                        styleBox={{ border: 'none', width: '100%' }}
                        haveCountSelect={false}
                      />
                    </SearchInputStyled>
                  </SearchInput>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <ButtonClear type="button" onClick={() => clearCheckbox()}>
                      <span style={{ textAlign: 'end', color: state.isLoading ? '#5B5B5B' : '#363BC4' }}>{t('limpar')}</span>
                    </ButtonClear>
                  </div>
                </div>
                <Box style={{ cursor: state.isLoading ? 'not-allowed' : 'default' }}>
                  <b style={{ fontSize: '14px' }}>{t('analiseAvancada')}</b>
                  <Box minWidth="280px" mb={[16, 16, 16, 16, 16, 0]}>
                    <span style={{ fontSize: '14px' }}>{t('nao')}</span>
                    <ToggleSwitchMini
                      checked={state.advancedAnalysis}
                      onClick={() => { state.advancedAnalysis = !state.advancedAnalysis; render(); }}
                      style={{ marginLeft: '10px', marginRight: '10px' }}
                    />
                    <span style={{ fontSize: '14px' }}>{t('sim')}</span>
                  </Box>
                </Box>
              </Flex>
              <Flex style={{
                position: 'relative',
              }}
              >
                {state.isLoading && (
                <Overlay>
                  <Loader />
                </Overlay>
                )}
                <GenerateGraphSample
                  state={state}
                  graphEnable={graphEnable}
                  axisInfo={axisInfo}
                  manageAllClients={profile.manageAllClients}
                  hwCfg={hwCfg}
                />
              </Flex>
              { profile.manageAllClients && (
              <div>
                <FaultsChart
                  faultsChart={state.faultsChart}
                  advancedAnalysis={state.advancedAnalysis}
                  xTicks={state.xTicks}
                  tickXLabelFormaterDay={tickXLabelFormaterDay}
                  tickXLabelFormaterHour={tickXLabelFormaterHour}
                  renderQuarterTickHour={renderQuarterTickHour}
                  numDays={state.numDays}
                  xDomain={state.xDomain}
                />
              </div>
              )}
            </DesktopWrapper>
          </Card>
        )
      }
    </>
  );
}

function FaultsChart({
  faultsChart, advancedAnalysis, xTicks, tickXLabelFormaterDay, tickXLabelFormaterHour, renderQuarterTickHour, numDays, xDomain,
}) {
  return (
    <>
      {(advancedAnalysis)
        && (
        <Flex flexWrap="wrap" justifyContent="center">
          <Box width={[1, '95%', '90%', '90%', '90%', '85%']} minHeight="420px" paddingX={['4px', '4px', '6px', '6px', '14px', '18px', '12px']}>
            <div style={{ width: '100%', height: `${600}px` }}>
              <ResponsiveContainer>
                <ScatterChart
                  height={600}
                  margin={{
                    top: 5,
                    right: 20,
                    left: -40,
                    bottom: 5,
                  }}
                  line={false}
                >
                  <Tooltip
                    content={(props) => {
                      const { active, payload } = props;

                      if (active && payload && payload.length === 2) {
                        return (
                          <div
                            style={{
                              padding: 10,
                              border: `1px solid ${colors.Grey100}`,
                              backgroundColor: '#FFFFFF',
                              maxWidth: '80%',
                            }}
                          >
                            {`${payload[0].payload.time.local().format('DD/MM - HH:mm:SS')} - ${payload[1].payload.desc}`}
                          </div>
                        );
                      }
                      return null;
                    }}
                    isAnimationActive={false}
                  />
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    name="time"
                    dataKey="x"
                    ticks={xTicks}
                    allowDecimals={false}
                    allowDataOverflow
                    tickFormatter={numDays && numDays > 1 ? tickXLabelFormaterDay : tickXLabelFormaterHour}
                    domain={xDomain}
                  />
                  {numDays && numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey="x" ticks={xTicks} domain={['dataMin', 'dataMax']} />) : null}
                  <YAxis
                    type="number"
                    name="left"
                    yAxisId="left"
                    dataKey="y"
                    allowDataOverflow
                    tick=""
                    interval={0}
                    domain={faultsChart.leftLimits}
                  />
                  {faultsChart.lines.map((line) => (
                    <Scatter
                      key={line.lineId}
                      yAxisId="left"
                      strokeWidth={line.isDet ? 10 : 1}
                      shape={(props) => (
                        <Dot
                          {...props}
                          r={7}
                        />
                      )}
                      data={line.data}
                      fill={line.color}
                      isAnimationActive={false}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Box>
        </Flex>
        )}
    </>
  );
}

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;

export const DateLabel = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const BtnExportReduced = styled.div`
  cursor: pointer;
  color: #363BC4;
  padding: 14px 20px;
  border: 1px solid ${colors.GreyLight};
  margin-left: 10px;
  border-radius: 12px;
  height: 1px;
  display: flex;
  text-align: center;
  align-items: center;
  :hover {
    color: ${colors.White};
    background-color: #363BC4;
  }
`;

export const ExportWorksheet = styled(ExportWorksheetIcon)(
  () => `
  padding-left: 10px;
  color: #363BC4;
`,
);
