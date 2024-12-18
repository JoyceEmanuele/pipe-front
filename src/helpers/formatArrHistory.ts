import moment from 'moment';

import { ApiResps } from '~/providers';

import { t } from 'i18next';

function invBool(v: number) {
  return v === 1 ? 0 : v === 0 ? 1 : v;
}

export function formatArrHistory(dataVectors: { v: number[], c: number[] }|undefined, limits?: { min: number|null, max: number|null }, isBool01?: boolean, invertBool?: boolean) {
  const chartData: { x: number, y?: number|null, L?: number|null }[] = [];
  if (!dataVectors) return chartData;
  const { v, c } = dataVectors;
  // if (!v.length) return chartData
  let x = 0;
  // let last = null
  // chartData.push(last = { x, y: v[0] })
  for (let i = 0; i < v.length; i++) {
    // if (last.y == null && v[i] != null) { chartData.push({ x, y: v[i] }) }
    chartData.push(isBool01 ? invertBool ? { x, L: invBool(v[i]) } : { x, L: v[i] } : { x, y: v[i] });
    x += c[i] / 3600;
    // chartData.push(last = { x, y: v[i] })
    chartData.push(isBool01 ? invertBool ? { x, L: invBool(v[i]) } : { x, L: v[i] } : { x, y: v[i] });
    if (limits != null && v[i] != null) {
      if (limits.max == null || v[i] > limits.max) limits.max = v[i];
      if (limits.min == null || v[i] < limits.min) limits.min = v[i];
    }
  }
  if (x < 24) chartData.push({ x: 24, y: null });
  return chartData;
}

function histDacProcess(v) {
  for (let i = 0; i < v.length; i++) {
    if (v[i] != null) v[i] *= 14.50377;
  }
}

type HistoryDAC = ApiResps['/dac/get-day-charts-data'];
export function processReceivedHistoryDAC(dacHistory: HistoryDAC, usePsi: boolean): {} {
  if (usePsi) {
    if (dacHistory.Psuc) {
      const { v } = dacHistory.Psuc;
      histDacProcess(v);
    }
    if (dacHistory.Pliq) {
      const { v } = dacHistory.Pliq;
      histDacProcess(v);
    }
  }

  const limitsTemp = { min: null as null|number, max: null as null|number };
  const limitsPres = { min: null as null|number, max: null as null|number };
  const parsedGraphData = {
    Lcmp: formatArrHistory(dacHistory.Lcmp, undefined, true),
    Levp: formatArrHistory(dacHistory.Levp, undefined, true),
    Lcut: formatArrHistory(dacHistory.Lcut, undefined, true, true),
    Tamb: formatArrHistory(dacHistory.Tamb, limitsTemp),
    Tsuc: formatArrHistory(dacHistory.Tsuc, limitsTemp),
    Tliq: formatArrHistory(dacHistory.Tliq, limitsTemp),
    Psuc: formatArrHistory(dacHistory.Psuc, limitsPres),
    Pliq: formatArrHistory(dacHistory.Pliq, limitsPres),
    Tsc: formatArrHistory(dacHistory.Tsc, limitsTemp),
    Tsh: formatArrHistory(dacHistory.Tsh, limitsTemp),
  };

  const dataLimits = {
    minTval: limitsTemp.min,
    maxTval: limitsTemp.max,
    minPval: limitsPres.min,
    maxPval: limitsPres.max,
  };

  // const booleanLines = [
  //   parsedGraphData.Lcmp,
  //   parsedGraphData.Levp,
  //   parsedGraphData.Lcut,
  // ];
  // const dataLimits = axisCalc.updateDataLimits(newDataLimits, null);
  // const axisInfo = axisCalc.calculateAxisInfo(dataLimits, booleanLines.length);
  // axisCalc.updateBoolY(booleanLines, axisInfo.L1start);

  return { parsedGraphData, dataLimits };
}

type HistoryDUT = ApiResps['/dut/get-day-charts-data'];
export function processReceivedHistoryDUT(dutHistory: HistoryDUT, rawLimits = false) {
  const limitsTemp = rawLimits ? { min: 4, max: 6 } : { min: 10, max: 35 };
  const limitsHum = { min: 30, max: 70 };
  const limitsCO2 = { min: 0, max: 2800 };
  const limitsTVOC = { min: 0, max: 1300 };
  const parsedGraphData = {
    Temperature: formatArrHistory(dutHistory.Temperature, limitsTemp),
    Temperature_1: formatArrHistory(dutHistory.Temperature_1, limitsTemp),
    Humidity: formatArrHistory(dutHistory.Humidity, limitsHum),
    eCO2: formatArrHistory(dutHistory.eCO2, limitsCO2),
    TVOC: formatArrHistory(dutHistory.TVOC, limitsTVOC),
    L1: formatArrHistory(dutHistory.L1, undefined, true),
  };

  let axisInfo;
  if (rawLimits) {
    const tempLimits = [limitsTemp.min, limitsTemp.max];
    const humLimits = [limitsHum.min, limitsHum.max];
    const co2Limits = [limitsCO2.min, limitsCO2.max];
    const TVOCLimits = [limitsTVOC.min, limitsTVOC.max];
    axisInfo = {
      tempLimits,
      humLimits,
      co2Limits,
      TVOCLimits,
    };
  } else {
    const tempLimits = [(Math.ceil(limitsTemp.min / 5 - 0.999) * 5 - 5), (Math.trunc(limitsTemp.max / 5 + 0.999) * 5 + 5)];
    const tempTicks = [] as number[];
    for (let temp = tempLimits[0]; temp <= tempLimits[1]; temp += 5) {
      tempTicks.push(temp);
    }

    const humLimits = [(Math.ceil(limitsHum.min / 10 - 0.999) * 10 - 10), (Math.trunc(limitsHum.max / 10 + 0.999) * 10 + 10)];
    const humTicks = [] as number[];
    for (let temp = humLimits[0]; temp <= humLimits[1]; temp += 10) {
      humTicks.push(temp);
    }

    const co2Limits = [(Math.ceil(limitsCO2.min / 200 - 0.999) * 200), (Math.trunc(limitsCO2.max / 200 + 0.999) * 200 + 200)];
    const co2Ticks = [] as number[];
    for (let temp = co2Limits[0]; temp <= co2Limits[1]; temp += 200) {
      co2Ticks.push(temp);
    }
    const TVOCLimits = [(Math.ceil(limitsTVOC.min / 200) * 200), (Math.trunc(limitsTVOC.max / 200 + 0.999) * 200 + 200)];
    const TVOCTicks = [] as number[];
    for (let temp = TVOCLimits[0]; temp <= TVOCLimits[1]; temp += 200) {
      TVOCTicks.push(temp);
    }

    axisInfo = {
      tempLimits, tempTicks, humLimits, humTicks, co2Limits, co2Ticks, TVOCLimits, TVOCTicks,
    };
  }

  return { parsedGraphData, axisInfo };
}

type resultDamHistoryProcessing = {
  State?: DiscreteHistVar,
  Mode?: DiscreteHistVar,
  ecoCmd?: DiscreteHistVar,
  damTemperature?: ContinuousHistVar,
  damTemperature_1?: ContinuousHistVar,
  limTmin?: ContinuousHistVar|null,
  limTmax?: ContinuousHistVar|null,
  humidity?: ContinuousHistVar|null,
  tSetpoint?: ContinuousHistVar|null,
  dacs: {
    [dacId: string]: DiscreteHistVar & { groupId: string }
  },
  duts: {
    dutId: string,
    temprt: ContinuousHistVar
    temprt1: ContinuousHistVar|null
    limTmin: ContinuousHistVar|null
    limTmax: ContinuousHistVar|null
    tSetpoint: ContinuousHistVar|null
    tLti: ContinuousHistVar|null
    l1: DiscreteHistVar|null,
    isDutDuo: boolean,
  }[],
  setpointHist?: ContinuousHistVar,
};
type HistoryDAM = ApiResps['/get-autom-day-charts-data'];
type DevInfo = {
  dam?: ApiResps['/get-dev-full-info']['dam']
  dut?: ApiResps['/get-dev-full-info']['dut']
  dut_aut?: ApiResps['/get-dev-full-info']['dut_aut']
};

const formatDamParameters = (result: resultDamHistoryProcessing, comprHistory: HistoryDAM) => {
  if (comprHistory.State) {
    const d = formatArrHistory(comprHistory.State, undefined, true);
    result.State = {
      d,
      limits: [1, comprHistory.State.labels.length - 1],
      labels: comprHistory.State.labels.slice(1),
    };
  }
  if (comprHistory.Mode) {
    const d = formatArrHistory(comprHistory.Mode, undefined, true);
    result.Mode = {
      d,
      limits: [1, comprHistory.Mode.labels.length - 1],
      labels: comprHistory.Mode.labels.slice(1),
    };
  }
  if (comprHistory.damTemperature) {
    const limits = { min: null as null|number, max: null as null|number };
    const d = formatArrHistory(comprHistory.damTemperature, limits);
    result.damTemperature = {
      d,
      limits: [limits.min!, limits.max!],
    };
  }
  if (comprHistory.damTemperature_1) {
    const limits = { min: null as null|number, max: null as null|number };
    const d = formatArrHistory(comprHistory.damTemperature_1, limits);
    result.damTemperature_1 = {
      d,
      limits: [limits.min!, limits.max!],
    };
  }
  if (comprHistory.ecoCmd) {
    comprHistory.ecoCmd.v = comprHistory.ecoCmd.v.map((x) => x || 0);
    const d = formatArrHistory(comprHistory.ecoCmd, undefined, true);
    result.ecoCmd = {
      d,
      limits: [1, comprHistory.ecoCmd.labels.length - 1],
      labels: comprHistory.ecoCmd.labels.slice(1),
    };
  }
  if (comprHistory.humidity) {
    const limits = { min: null as null|number, max: null as null|number };
    const d = formatArrHistory(comprHistory.humidity, limits);
    result.humidity = {
      d,
      limits: [limits.min!, limits.max!],
    };
  }
  if (comprHistory.damSelfRefInfo && comprHistory.daySched) {
    result.limTmin = {
      d: [{ x: comprHistory.daySched.indexIni / 60, y: comprHistory.damSelfRefInfo.MINIMUM_TEMPERATURE }, { x: comprHistory.daySched.indexEnd / 60, y: comprHistory.damSelfRefInfo.MINIMUM_TEMPERATURE }],
      limits: [comprHistory.damSelfRefInfo.MINIMUM_TEMPERATURE, comprHistory.damSelfRefInfo.MINIMUM_TEMPERATURE],
    };
    result.limTmax = {
      d: [{ x: comprHistory.daySched.indexIni / 60, y: comprHistory.damSelfRefInfo.MAXIMUM_TEMPERATURE }, { x: comprHistory.daySched.indexEnd / 60, y: comprHistory.damSelfRefInfo.MAXIMUM_TEMPERATURE }],
      limits: [comprHistory.damSelfRefInfo.MAXIMUM_TEMPERATURE, comprHistory.damSelfRefInfo.MAXIMUM_TEMPERATURE],
    };
    result.tSetpoint = {
      d: [{ x: comprHistory.daySched.indexIni / 60, y: comprHistory.damSelfRefInfo.SETPOINT }, { x: comprHistory.daySched.indexEnd / 60, y: comprHistory.damSelfRefInfo.SETPOINT }],
      limits: [comprHistory.damSelfRefInfo.SETPOINT, comprHistory.damSelfRefInfo.SETPOINT],
    };
  }
};

const getDevType = (devInfo: DevInfo) => {
  const isDutAut = !!devInfo.dut_aut;
  const isDutDuo = devInfo.dut?.PLACEMENT === 'DUO';

  return { isDutAut, isDutDuo };
};

const getTlim = (dut: HistoryDAM['dutsTemprt'][number]) => {
  let limTmin = null as null|{ d: { x: number, y: number }[], limits: [number, number] };
  let limTmax = null as null|{ d: { x: number, y: number }[], limits: [number, number] };

  if (dut?.daySched?.indexEnd && dut.daySched.TUSEMAX != null && dut.daySched.TUSEMIN != null) {
    limTmin = {
      d: [{ x: dut.daySched.indexIni / 60, y: dut.daySched.TUSEMIN }, { x: dut.daySched.indexEnd / 60, y: dut.daySched.TUSEMIN }],
      limits: [dut.daySched.TUSEMIN, dut.daySched.TUSEMIN],
    };
    limTmax = {
      d: [{ x: dut.daySched.indexIni / 60, y: dut.daySched.TUSEMAX }, { x: dut.daySched.indexEnd / 60, y: dut.daySched.TUSEMAX }],
      limits: [dut.daySched.TUSEMAX, dut.daySched.TUSEMAX],
    };
  }

  return { limTmin, limTmax };
};

const getTLti = (dut: HistoryDAM['dutsTemprt'][number], isDutAut: boolean) => {
  let tLti = null as ContinuousHistVar | null;

  if (isDutAut && dut?.daySched && dut.daySched.MODE === '2_SOB_DEMANDA' && dut.daySched.LTI) {
    const valueLti = dut.daySched.LTI;
    tLti = {
      d: [
        { x: dut.daySched.indexIni / 60, y: valueLti },
        { x: dut.daySched.indexEnd / 60, y: valueLti },
      ],
      limits: [valueLti, valueLti],
    };
  }
  return tLti;
};

const getTSetpoint = (dut: HistoryDAM['dutsTemprt'][number], devInfo: DevInfo, isDutAut: boolean) => {
  let tSetpoint = null as null|{ d: { x: number, y: number }[], limits: [number, number] };

  if (dut?.daySched?.indexEnd) {
    if (isDutAut) {
      if (devInfo.dut_aut?.TSETPOINT
        && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '7_FORCED'].includes(devInfo.dut_aut?.CTRLOPER)) {
        tSetpoint = {
          d: [{ x: dut.daySched.indexIni / 60, y: (devInfo.dut_aut.TSETPOINT) }, { x: dut.daySched.indexEnd / 60, y: (devInfo.dut_aut.TSETPOINT) }],
          limits: [(devInfo.dut_aut.TSETPOINT), (devInfo.dut_aut.TSETPOINT)],
        };
      }
    } else if (dut.daySched.TUSEMIN != null || devInfo.dam?.CAN_SELF_REFERENCE) {
      const setpoint = !devInfo.dam?.CAN_SELF_REFERENCE ? dut.daySched.TUSEMIN + (devInfo.dam?.ECO_OFST_START || 0) : devInfo.dam?.SETPOINT || 21;
      tSetpoint = {
        d: [{ x: dut.daySched.indexIni / 60, y: setpoint }, { x: dut.daySched.indexEnd / 60, y: setpoint }],
        limits: [setpoint, setpoint],
      };
    }
  }
  return tSetpoint;
};

const fixLimits = (limits: { min: null|number, max: null|number }) => {
  if ((limits.min == null) && (limits.max == null)) {
    limits.min = 0;
    limits.max = 1;
  }
  if ((limits.min == null) && (limits.max != null)) limits.min = limits.max - 1;
  if ((limits.max == null) && (limits.min != null)) limits.max = limits.min - 1;
};

const formatDutParameters = (result: resultDamHistoryProcessing, comprHistory: HistoryDAM, devInfo: DevInfo) => {
  const { isDutAut, isDutDuo } = getDevType(devInfo);

  for (const dut of (comprHistory.dutsTemprt || [])) {
    const limits = { min: null as null|number, max: null as null|number };
    const temp = formatArrHistory(dut.Temperature, limits);
    const temp1 = (isDutDuo || dut.isDutDuo) && formatArrHistory(dut.Temperature_1, limits);
    const l1 = isDutDuo && formatArrHistory(dut.l1, undefined, true);
    if (!temp.length && !(temp1 && temp1?.length)) continue;

    const { limTmin, limTmax } = getTlim(dut);

    const tSetpoint = getTSetpoint(dut, devInfo, isDutAut);

    const tLti = getTLti(dut, isDutAut);

    fixLimits(limits);

    result.duts.push({
      dutId: dut.dutId,
      temprt: {
        d: temp,
        limits: [limits.min!, limits.max!],
      },
      temprt1: temp1 ? {
        d: temp1,
        limits: [limits.min!, limits.max!],
      } : null,
      limTmin,
      limTmax,
      tSetpoint,
      l1: l1 ? {
        d: l1,
        limits: [0, 1],
        labels: [t('desligado'), t('ligado')],
      } : null,
      tLti,
      isDutDuo: dut.isDutDuo ?? false,
    });
  }
};

const formatDacParameters = (result: resultDamHistoryProcessing, comprHistory: HistoryDAM) => {
  for (const [groupId, groupDacs] of Object.entries(comprHistory.dacsL1 || {})) {
    for (const [dacId, dacHist] of Object.entries(groupDacs || {})) {
      const d = formatArrHistory(dacHist, undefined, true);
      result.dacs[dacId] = {
        d,
        limits: [0, 1],
        labels: [t('desligado'), t('ligado')],
        groupId,
      };
    }
  }
};

const formatSetpointHist = (result: resultDamHistoryProcessing, comprHistory: HistoryDAM) => {
  if (comprHistory?.setpointHist !== undefined && comprHistory.setpointHist.c.length > 0) {
    const limits = { min: null as null|number, max: null as null|number };
    const d = formatArrHistory(comprHistory.setpointHist, limits);
    result.setpointHist = {
      d,
      limits: [limits.min || 0, limits.max || 30],
    };
  }
};

export function processReceivedHistoryDAM(comprHistory: HistoryDAM, devInfo: DevInfo) {
  const result = { dacs: {}, duts: [] } as resultDamHistoryProcessing;

  formatDamParameters(result, comprHistory);

  formatDutParameters(result, comprHistory, devInfo);

  formatDacParameters(result, comprHistory);

  formatSetpointHist(result, comprHistory);

  return result;
}

export const getEndTime = () => moment({ hour: 0, minute: 0, second: 0 });

export interface DiscreteHistVar {
  d: {
    x: number
    L?: number|null
    y?: number|null
  }[]
  limits: [number, number]
  labels: string[]
}

export interface ContinuousHistVar {
  d: {
    x: number
    y?: number|null
  }[]
  limits: [number, number]
}
