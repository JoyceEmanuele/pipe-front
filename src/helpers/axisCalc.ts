import { DiscreteHistVar } from './formatArrHistory';

interface DataLimits {
  minTval?: number,
  maxTval?: number,
  minPval?: number,
  maxPval?: number,
  minCO2val?: number,
  maxCO2val?: number,
  minHum?: number,
  maxHum?: number,
}

export function updateDataLimits(newDataLimits: DataLimits, currentDataLimits?: DataLimits): DataLimits {
  if (!currentDataLimits) {
    currentDataLimits = {};
  }
  for (const minVar of ['minTval', 'minPval', 'minCO2val', 'minHum']) {
    if (newDataLimits[minVar] != null) {
      if (typeof currentDataLimits[minVar] !== 'number' || newDataLimits[minVar] < currentDataLimits[minVar]) {
        currentDataLimits[minVar] = newDataLimits[minVar];
      }
    }
  }

  for (const minVar of ['maxTval', 'maxPval', 'maxCO2val', 'maxHum']) {
    if (newDataLimits[minVar] != null) {
      if (typeof currentDataLimits[minVar] !== 'number' || newDataLimits[minVar] > currentDataLimits[minVar]) {
        currentDataLimits[minVar] = newDataLimits[minVar];
      }
    }
  }

  return currentDataLimits;
}

export function calculateTemprtAxisInfo(limits: { min: null|number, max: null|number }) {
  const { min: minDataVal, max: maxDataVal } = limits;

  if ((minDataVal == null) || (maxDataVal == null)) {
    return {
      L1start: 0,
      ticks: [],
      maxAxisVal: 0,
    };
  }

  const maxTtick = Math.ceil((maxDataVal + 0.5) / 5) * 5;
  const minTtick = Math.floor((minDataVal - 0.5) / 5) * 5;
  const ticks = [] as number[];
  for (let t = minTtick; t <= maxTtick; t += 5) {
    ticks.push(t);
  }

  return { L1start: minTtick, ticks, maxAxisVal: maxTtick };
}

function presentLimits(dataLimits: DataLimits) {
  const {
    minTval, maxTval, minPval, maxPval, minCO2val, maxCO2val, minHum, maxHum,
  } = dataLimits;
  return {
    Temperature: (minTval != null) && (maxTval != null),
    Pressure: (minPval != null) && (maxPval != null),
    CO2: (minCO2val != null) && (maxCO2val != null),
    Humidity: (minHum != null) && (maxHum != null),
  };
}

function getInitialLimits(dataLimits: DataLimits, numOfBoolVars: number) {
  let {
    minTval, maxTval, minPval, maxPval, minCO2val, maxCO2val, minHum, maxHum,
  } = dataLimits;

  const varLimits = presentLimits(dataLimits);

  let hasTdata = varLimits.Temperature;
  let hasPdata = varLimits.Pressure;
  let hasCO2data = varLimits.CO2;
  let hasHum = varLimits.Humidity;

  if ((!hasTdata) && (!numOfBoolVars)) {
    minTval = 5;
    maxTval = 25;
    hasTdata = true;
  }
  if (hasTdata || hasPdata || hasCO2data) {
    if (!hasTdata) {
      minTval = 5;
      maxTval = 25;
      hasTdata = true;
    }
    if (!hasPdata) {
      minPval = 5;
      maxPval = 25;
      hasPdata = true;
    }

    if (minCO2val === null || minCO2val === undefined || maxCO2val === null || maxCO2val === undefined) {
      minCO2val = 0;
      maxCO2val = 4000;
      hasCO2data = true;
    }

    if (!hasHum) {
      minHum = 0;
      maxHum = 100;
      hasHum = true;
    }
  }

  return {
    dataLimits: {
      minTval, maxTval, minPval, maxPval, minCO2val, maxCO2val,
    },
    hasTdata,
    hasPdata,
    hasCO2data,
  };
}

function getMinTicks(tInfo: { hasTdata: boolean, maxTval?: number, minTval?: number }, pInfo: { hasPdata: boolean, maxPval?: number, minPval?: number }) {
  const { hasTdata, maxTval, minTval } = tInfo;
  const { hasPdata, maxPval, minPval } = pInfo;
  let minTtick;
  let maxTtick;
  if (hasTdata && (maxTval != null) && (minTval != null)) {
    maxTtick = Math.ceil((maxTval + 1) / 5) * 5;
    minTtick = Math.floor((minTval - 1) / 5) * 5;
    if (minTtick > 0) minTtick = 0;
    if (maxTtick < 5) maxTtick = 5;
  }

  let minPtick = 0;
  let maxPtick = 1;
  if (hasPdata && (maxPval != null) && (minPval != null)) {
    maxPtick = Math.ceil((maxPval + 1) / 5) * 5;
    minPtick = Math.floor((minPval - 1) / 5) * 5;
    if (minPtick > 0) minPtick = 0;
    if (maxPtick < 1) maxPtick = 1;
  }

  return {
    minTtick, maxTtick, minPtick, maxPtick,
  };
}

function getPresLimitsAndTicks(pInfo: { hasPdata: boolean, maxPtick, minPtick }, tInfo: { maxTtick, minTtick, minTaxisVal }) {
  let { maxPtick, minPtick } = pInfo;
  const { maxTtick, minTtick, minTaxisVal: minTAxisVal } = tInfo;

  let presLimits = [0, 10];
  const presTicks: number[] = [];

  if (pInfo.hasPdata) {
    const totalSteps = Math.round((maxTtick - minTtick) / 5);
    const positiveSteps = Math.round(maxTtick / 5);
    const negativeSteps = totalSteps - positiveSteps;
    let pStepSize;
    if (minPtick >= 0) {
      pStepSize = Math.ceil(maxPtick / positiveSteps);
      // pStepSize = Math.ceil(pStepSize / 5) * 5;
      maxPtick = pStepSize * positiveSteps;
      minPtick = 0;
    } else {
      pStepSize = Math.ceil((maxPtick - minPtick) / totalSteps);
      // pStepSize = Math.ceil(pStepSize / 5) * 5;
      maxPtick = pStepSize * positiveSteps;
      minPtick = -pStepSize * negativeSteps;
    }
    presLimits = [Math.round(minTAxisVal / 5 * pStepSize), maxPtick];
    for (let t = minPtick; t <= maxPtick; t += pStepSize) {
      presTicks.push(t);
    }
  }

  return { presLimits, presTicks };
}

function getCO2LimitsAndTicks(co2Info: { minCO2val, maxCO2val }, tempTicks: number[]) {
  const { minCO2val, maxCO2val } = co2Info;

  const co2Ticks: number[] = [];
  let co2Limits = [0, 4000];

  if (minCO2val != null && maxCO2val != null) {
    const totalSteps = tempTicks.length; // para alinhar com o eixo de temperatura
    const stepSize = (maxCO2val - minCO2val) / totalSteps;
    let minVal = minCO2val - stepSize;
    const maxVal = maxCO2val + stepSize;
    if (minVal < 0) {
      minVal = 0;
    }
    co2Limits = [minVal, maxVal];
    for (let t = minVal; t <= maxVal + stepSize; t += Math.ceil(stepSize / 10) * 10) {
      co2Ticks.push(t);
    }
  }

  return { co2Limits, co2Ticks };
}

export function calculateAxisInfo(dataLimits: DataLimits, numOfBoolVars: number, booleanTypes?: string[]) {
  const {
    dataLimits: {
      minTval, maxTval, minPval, maxPval, minCO2val, maxCO2val,
    },
    hasTdata,
    hasPdata,
  } = getInitialLimits(dataLimits, numOfBoolVars);

  const minTicks = getMinTicks({ hasTdata, maxTval, minTval }, { hasPdata, maxPval, minPval });
  const {
    minTtick, maxTtick, minPtick, maxPtick,
  } = minTicks;

  let L1start = 0;
  if (numOfBoolVars) {
    L1start = (minTtick != null) ? (minTtick - 0) : 0;
  }

  const boolVarStep = booleanTypes?.some((type) => type === 'Nobreak') ? 6 : 5;
  const maxTaxisVal = (maxTtick != null) ? maxTtick : (L1start - 1);
  const minTaxisVal = numOfBoolVars ? (L1start - (numOfBoolVars * boolVarStep) - 1) : minTtick;
  const tempLimits = [minTaxisVal, maxTaxisVal];
  const tempTicks: number[] = [];
  if (numOfBoolVars) {
    for (let i = 0; i < numOfBoolVars; i++) {
      const lineType = booleanTypes?.[i];
      const lineBase = L1start - (boolVarStep * i) - boolVarStep;
      tempTicks.push(lineBase + 0.5);
      tempTicks.push(lineBase + 2.6);
      if (lineType === 'Nobreak') tempTicks.push(Number((lineBase + 4.7).toFixed(1)));
    }
  }
  if (minTtick != null) {
    for (let t = minTtick; t <= maxTtick; t += 5) {
      tempTicks.push(t);
    }
  }

  const { presLimits, presTicks } = getPresLimitsAndTicks({ hasPdata, maxPtick, minPtick }, { maxTtick, minTtick, minTaxisVal });

  const { co2Limits, co2Ticks } = getCO2LimitsAndTicks({ minCO2val, maxCO2val }, tempTicks);

  return {
    tempLimits,
    tempTicks,
    presLimits,
    presTicks,
    co2Limits,
    co2Ticks,
    L1start,
  };
}

function calcTickLimits(L1start:number, boolVarStep: number, lineType?: string) {
  const tick_0 = Math.round((L1start - boolVarStep + 0.5) * 10) / 10;
  const tick_1 = Math.round((L1start - boolVarStep + 2.6) * 10) / 10;
  if (lineType === 'Nobreak') {
    const tick_2 = Math.round((L1start - boolVarStep + 4.7) * 10) / 10;
    return [tick_0, tick_1, tick_2];
  }
  return [tick_0, tick_1];
}

export function updateBoolY(varsList: { L?: number|null, y?: number|null }[][], L1start: number, varTypes?: string[]): [number[]] {
  const ticksValues: [number[]] = [[0, 0]];
  let index = 0;
  const boolVarStep = varTypes?.some((type) => type === 'Nobreak') ? 6 : 5;
  varsList.forEach((lineData, i) => {
    const lineType = varTypes?.[i];
    if (index === 0) ticksValues.pop();
    const ticks = calcTickLimits(L1start, boolVarStep, lineType);
    ticksValues.push(ticks);
    if (lineData && lineData.length) {
      for (const element of lineData) {
        if (element) {
          if (element.L === 1) element.y = ticks[1];
          else if (element.L === 0) element.y = ticks[0];
          else element.y = null;
        }
      }
    }

    L1start -= boolVarStep;
    index++;
  });

  return ticksValues;
}

export function updateStepY(varsList: DiscreteHistVar[], L1start: number) {
  const varsTicks = [] as number[][];
  const allTicks = [] as number[];
  const ticksNames = {} as { [k:string]: string };
  for (const varInfo of varsList) {
    const [min, max] = varInfo.limits;
    const nTicks = Math.round(max - min) + 1;
    L1start -= nTicks * 2.5;
    const varTicks = [] as number[];
    for (let i = 0; i < nTicks; i++) {
      const tickValue = L1start + 0.5 + i * 2.5;
      varTicks.push(tickValue);
      allTicks.push(tickValue);
      ticksNames[tickValue.toString()] = varInfo.labels[i];
    }
    varsTicks.push(varTicks);
    const lineData = varInfo.d;
    for (let i = 0; i < lineData.length; i++) {
      if (lineData[i]) {
        if (lineData[i].L == null) {
          lineData[i].y = null;
          continue;
        }
        const stepIndex = lineData[i].L! - min;
        lineData[i].y = varTicks[stepIndex];
      }
    }
  }
  return {
    varsTicks, allTicks: allTicks.sort((a, b) => a - b), ticksNames, endValue: L1start,
  };
}

export function convertBoolValue(Lval: number, L1start: number, lineIndex: number) {
  if (Lval === 1) return L1start - (lineIndex * 5) - 5 + 2.6;
  if (Lval === 0) return L1start - (lineIndex * 5) - 5 + 0.5;
  return Lval;
}
export function convertBoolValueInv(Lval: number, L1start: number, lineIndex: number) {
  if (Lval === 0) return L1start - (lineIndex * 5) - 5 + 2.6;
  if (Lval === 1) return L1start - (lineIndex * 5) - 5 + 0.5;
  return Lval;
}

export interface ChartLine {
  name: string;
  x: number[];
  y: (null|number)[];
}
export interface ChartLineNumber extends ChartLine {
  maxY: null|number;
  minY: null|number;
}
export interface ChartLineSteps extends ChartLine {
  y_orig: (null|number|string)[];
  steps: {
    y_orig: (null|number|string);
    y_chart: (null|number);
    label: string;
  }[];
}
export interface AxisInfo {
  left: null|{
    range: [number, number]
    tickvals: number[]
    ticktext: string[]
  }
  // right?: null|{
  //   range: [number, number]
  //   tickvals: number[]
  //   ticktext: string[]
  // }
}
interface ChartLines {
  left: ChartLineNumber[],
  right: ChartLineNumber[],
  stepped: ChartLineSteps[],
}

export function fillMaxMin(line: ChartLineNumber) {
  if (!line) return;
  if (!line.y.length) return;
  line.maxY = null;
  line.minY = null;
  for (const v of line.y) {
    if (v == null) continue;
    if (line.maxY == null || v > line.maxY) line.maxY = v;
    if (line.minY == null || v < line.minY) line.minY = v;
  }
}

export function fillSteps(line: ChartLineSteps) {
  if (!line) return;
  if (!line.y_orig.length) return;
  line.steps = [];
  for (const v of line.y_orig) {
    if (v == null) continue;
    if (line.steps.some((s) => s.y_orig === v)) continue;
    line.steps.push({
      y_orig: v,
      y_chart: null,
      label: String(v),
    });
  }
  line.steps.sort((a, b) => {
    if ((a.y_orig != null) && (b.y_orig == null)) return -1;
    if ((a.y_orig == null) && (b.y_orig != null)) return 1;
    if ((a.y_orig == null) || (b.y_orig == null)) return 0;
    if (a.y_orig > b.y_orig) return -1;
    if (a.y_orig < b.y_orig) return 1;
    return 0;
  });
}

export function fillDynamicValues(axisInfo: AxisInfo, linesLeft: ChartLineNumber[], steppedLines?: ChartLineSteps[]) { // , linesRight?: ChartLineNumber[]
  axisInfo.left = null;
  {
    let minLval: (null|number) = null;
    let maxLval: (null|number) = null;
    for (const line of linesLeft) {
      if (line.minY == null) continue;
      if (line.maxY == null) continue;
      if ((minLval == null) || (line.minY < minLval)) minLval = line.minY;
      if ((maxLval == null) || (line.maxY > maxLval)) maxLval = line.maxY;
    }
    if ((minLval != null) && (maxLval != null)) {
      axisInfo.left = {
        range: [minLval, maxLval],
        tickvals: [],
        ticktext: [],
      };
    }
  }

  // axisInfo.right = null;
  // if (linesRight) {
  //   let minRval: (null|number) = null;
  //   let maxRval: (null|number) = null;
  //   for (const line of linesRight) {
  //     if (line.minY == null) continue;
  //     if (line.maxY == null) continue;
  //     if ((minRval == null) || (line.minY < minRval)) minRval = line.minY;
  //     if ((maxRval == null) || (line.maxY > maxRval)) maxRval = line.maxY;
  //   }
  //   if ((minRval != null) && (maxRval != null)) {
  //     axisInfo.right = {
  //       range: [minRval, maxRval],
  //       tickvals: [],
  //       ticktext: [],
  //     }
  //   }
  // }

  // if (axisInfo.left && axisInfo.right) {
  //   let propF = 0;
  //   if ((axisInfo.left.range[0] < 0) && (axisInfo.right.range[0] < 0)) {
  //     if (axisInfo.left.range[0] > -1) axisInfo.left.range[0] = -1;
  //     if (axisInfo.right.range[0] > -1) axisInfo.right.range[0] = -1;
  //     const prop = axisInfo.right.range[0] / axisInfo.left.range[0];
  //     if (prop > propF) propF = prop;
  //   }
  //   if ((axisInfo.left.range[1] > 0) && (axisInfo.right.range[1] > 0)) {
  //     if (axisInfo.left.range[1] < 1) axisInfo.left.range[1] = 1;
  //     if (axisInfo.right.range[1] < 1) axisInfo.right.range[1] = 1;
  //     const prop = axisInfo.right.range[1] / axisInfo.left.range[1];
  //     if (prop > propF) propF = prop;
  //   }
  //   if (propF) {
  //     if (axisInfo.left.range[1])
  //   }
  // }

  // if ((!axisInfo.left) && axisInfo.right) {
  //   axisInfo.left = {
  //     range: [...axisInfo.right.range],
  //     tickvals: [],
  //     ticktext: [],
  //   }
  // }

  if (axisInfo.left) {
    const [minLval, maxLval] = axisInfo.left.range;
    const maxLtick = Math.ceil((maxLval + 1) / 5) * 5;
    const minLtick = Math.floor((minLval - 1) / 5) * 5;
    axisInfo.left.range = [minLtick, maxLtick];
    for (let t = minLtick; t <= maxLtick; t += 5) {
      axisInfo.left.tickvals.push(t);
      axisInfo.left.ticktext.push(String(t));
    }
  }

  if (steppedLines) {
    if (!axisInfo.left) {
      axisInfo.left = {
        range: [0, 0],
        tickvals: [],
        ticktext: [],
      };
    }
    for (const line of steppedLines) {
      for (const step of line.steps) {
        step.y_chart = axisInfo.left.range[0] - 1;
        axisInfo.left.range[0] -= 2;
        axisInfo.left.tickvals.push(step.y_chart);
        axisInfo.left.ticktext.push(step.label);
      }
      for (let i = 0; i < line.y_orig.length; i++) {
        line.y[i] = line.steps.find((x) => x.y_orig === line.y_orig[i])!.y_chart;
      }
    }
  }
}
