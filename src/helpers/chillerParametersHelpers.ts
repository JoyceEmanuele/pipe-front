import { t } from 'i18next';
import { toast } from 'react-toastify';
import { ApiResps } from '~/providers';
import moment from 'moment';

const daysWeek = [t('domingo'), t('segundaFeira'), t('tercaFeira'), t('quartaFeira'), t('quintaFeira'), t('sextaFeira'), t('sabado')];

export function getDaysBetweenDates(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  const currentDate = new Date(startDate);
  // Loop para adicionar cada dia entre as datas de início e fim
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
}

export function getListDays(props, setState, state) {
  if (props.startDate && props.endDate) {
    const startDate = new Date(props.startDate.format('YYYY-MM-DD'));
    const endDate = new Date(props.endDate.format('YYYY-MM-DD'));
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    const daysBetweenDates = getDaysBetweenDates(startDate, endDate);
    if (daysBetweenDates.length > 15) {
      toast.error(t('numeroMaximoDeDias'));
      setState({ dataPeriodOut: true });
      return true;
    }
    setState({ listDays: daysBetweenDates });
  }
  if (state.listDays.length > 5) {
    setState({ numPoints: 24, hourGraph: true, interval: 1 });
  } else {
    setState({ numPoints: 144, hourGraph: false, interval: 10 });
  }
  setState({ dataPeriodOut: false });
  return false;
}

export function criarNovoArrayDuplicandoOsValoresPeloTempo(array: ApiResps['/dri/get-chiller-parameters-hist']['paramsLists']['paramsChanged']) {
  const novoArray: number[] = [];
  let currentIndex = 0;
  let currentTime = new Date(array[0].record_date).getTime();
  const finalDoDia = new Date(currentTime);
  finalDoDia.setDate(finalDoDia.getDate() + 1);
  finalDoDia.setSeconds(finalDoDia.getSeconds() - 1); // Configura o último segundo do dia anterior
  const now = Date.now();
  while (currentTime <= finalDoDia.getTime()) {
    const currentObj = array[currentIndex];
    const nextObj = array[currentIndex + 1];
    const nextTime = nextObj ? new Date(nextObj.record_date).getTime() : finalDoDia.getTime();

    novoArray.push(currentObj.parameter_value);

    if (currentTime >= now) {
      break;
    }

    // Se o próximo objeto existir e a hora atual for menor que o próximo tempo, repita o número atual
    while (nextObj && currentTime < nextTime) {
      novoArray.push(currentObj.parameter_value);
      currentTime += 30000; // Avança 30seg
    }
    // Se o próximo objeto existir, avance para ele
    if (nextObj) {
      currentIndex++;
    }

    // Avança para o próximo intervalo de 30 segundos
    currentTime += 30000;
  }
  return novoArray;
}

export function agruparPorData(array: ApiResps['/dri/get-chiller-parameters-hist']['paramsLists']['paramsChanged'], listDates: Date[]) {
  const grupos: { [data: string]: ApiResps['/dri/get-chiller-parameters-hist']['paramsLists']['paramsChanged'] } = {};
  const objectDatesArrayNull: { [data: string]: any[] } = {};
  (array || []).forEach((obj) => {
    const data = obj.record_date.split('T')[0];
    if (!grupos[data]) {
      grupos[data] = [];
    }
    grupos[data].push(obj);
  });
  const arrayNull: any[] = new Array(2880).fill(null);
  const valuesFinal: number[][] = [];
  const filterDates = listDates.filter((item) => !grupos[moment(item).format('YYYY-MM-DD')]);
  filterDates.forEach((item) => {
    const data = moment(item).format('YYYY-MM-DD');
    if (!objectDatesArrayNull[data]) {
      objectDatesArrayNull[data] = [];
    }
    objectDatesArrayNull[data].push('');
  });
  const arraySeparadasPorDia = Object.values(grupos).map(verifyAddNull);
  const chavesObjeto = Object.keys(grupos);
  arraySeparadasPorDia.forEach((item) => valuesFinal.push(criarNovoArrayDuplicandoOsValoresPeloTempo(item)));
  const arrayDatasOrganizadas: number[][] = [];
  listDates.forEach((item) => {
    const data = moment(item).format('YYYY-MM-DD');
    if (grupos[data]) {
      arrayDatasOrganizadas.push(valuesFinal[chavesObjeto.indexOf(data)]);
    } else if (objectDatesArrayNull[data]) {
      arrayDatasOrganizadas.push(arrayNull);
    }
  });
  const valoresRepetidos: number[] = arrayDatasOrganizadas.reduce((acc, val) => acc.concat(val), []);
  return valoresRepetidos;
}

export function gerarNumerosAteMaximoDataX(maximo: number, setState) {
  const numeros: number[] = [];
  for (let i = 0; i <= maximo; i++) {
    numeros.push(i);
  }
  setState({ dataX: numeros });
}

export function gerarNumerosAteMaximoDataXChangedParams(days: number, setState, state) {
  const numeros: number[] = [];
  const max = 2880 * days;
  for (let i = 0; i <= max; i++) {
    numeros.push(i);
  }
  const numPoints = days > 5 ? 24 : 144;
  setState({ dataXChangedParams: numeros, numPoints });
  setState({ dataX: numeros.slice(0, (state.numPoints * days) + 1) });
}

export function separarValoresPorPropriedade(array: ApiResps['/dri/get-chiller-parameters-hist']['paramsLists']['paramsGrouped']) {
  const propriedades = {}; // Objeto para armazenar arrays de valores por propriedade
  array.forEach((objeto) => {
    // Para cada objeto, percorra todas as chaves
    Object.entries(objeto).forEach(([chave, valor]) => {
      const chaveLower = chave.toLocaleLowerCase();
      propriedades[chaveLower] = propriedades[chaveLower] || [];
      propriedades[chaveLower].push(valor);
    });
  });
  return propriedades;
}

const verifyAddNull = (items: any[]) => {
  if (items.length > 0 && !items[0].record_date.includes('T00:00:00')) {
    return [{ record_date: `${items[0].record_date.split('T')[0]}T00:00:00`, value: null }, ...items];
  }
  return items;
};

export function formatterxAxis(state, changedParams?: boolean) {
  const numPoints = (changedParams ? 2880 : state.numPoints); // 2880 segundos no dia.
  let isDifferentMonth = false;
  if (state.listDays[0]?.getMonth() !== state.listDays[state.listDays.length - 1]?.getMonth()) {
    isDifferentMonth = true;
  }
  return ((value) => {
    if (value % numPoints === 0) {
      if (value / numPoints === state.listDays.length) {
        return;
      }
      const dayWeek = state.listDays[value / numPoints]?.getDay();
      const date = state.listDays[(value / numPoints)];
      const monthPart = isDifferentMonth ? `/${(date?.getMonth() + 1).toString().padStart(2, '0')}` : '';
      if (dayWeek === 0) {
        return `{bold|${date?.getDate().toString().padStart(2, '0')}${monthPart}\n${daysWeek[dayWeek][0]}}`;
      }
      return `${date?.getDate().toString().padStart(2, '0')}${monthPart}\n${daysWeek[dayWeek][0]}`;
    }
  });
}

export function returnXAxis(state, changedParams?: boolean) {
  return {
    type: 'category',
    boundaryGap: false,
    splitLine: {
      show: true,
      interval: changedParams ? 2879 : 23,
      lineStyle: {
        type: 'dashed',
      },
    },
    data: changedParams ? state.dataXChangedParams : state.dataX,
    axisLabel: {
      show: true,
      padding: [0, 0, 0, 0],
      interval: changedParams ? 2879 : 23,
      color: '#000',
      fontFamily: 'Inter',
      fontSize: '10',
      lineHeight: 12,
      margin: 8,
      formatter: formatterxAxis(state, changedParams),
      rich: {
        bold: {
          fontWeight: 'bold',
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '10',
        },
      },
    },
    axisLine: { show: false },
    axisTick: { show: false },
  };
}

function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  // Formata para garantir que horas, minutos e segundos tenham dois dígitos
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(secs).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function getDate(state, index, recordDate, changedParams?: boolean) {
  const numPoints = (changedParams ? 2880 : state.numPoints); // 2880 segundos no dia.
  const dateFull = state.listDays[Math.floor(index / numPoints)];
  const day = dateFull?.getDate().toString();
  const month = (dateFull?.getMonth() + 1).toString();
  const year = dateFull?.getFullYear().toString();
  const timeGrouped = (index * 30) > 86400 ? (index * 30) % 86400 : index * 30;
  const hour = changedParams ? secondsToTime(timeGrouped) : recordDate[index]?.split('T')[1];
  return `${day?.padStart(2, '0')}/${month?.padStart(2, '0')}/${year} ${hour?.substring(0, 5)}h`;
}

function setCircuitMaxValueAndCounter(isCircuit, item, acc) {
  if (isCircuit && item.unidMed != null) {
    const maxValue = item.data?.length > 0 ? Math.max(...item.data) : 0;
    if (!acc.maxValue[item.unidMed]) {
      acc.maxValue[item.unidMed] = 0;
    }
    acc.maxValue[item.unidMed] = Math.max(acc.maxValue[item.unidMed] || 0, maxValue);
  }
}

export function getDataToGraphsAndSetMaxValues(allWithoutDefault, percentArray, setState, state) {
  const {
    countValuesUniMed, sendToGraphDefault, sendToGraphPercent, maxValue,
  } = allWithoutDefault.reduce((acc, item) => {
    const newState = { ...acc };
    if (!percentArray.includes(item.value)) {
      const isCircuit = (item.value !== 'ACircuit' && item.value !== 'BCircuit');
      setCircuitMaxValueAndCounter(isCircuit, item, acc);
      newState.sendToGraphDefault.push(item);
    } else {
      newState.sendToGraphPercent.push(item);
    }
    acc.countValuesUniMed[item.unidMed]++;
    return newState;
  }, {
    maxValue: {
      C: 0,
      kPa: 0,
      A: 0,
      H: 0,
      s: 0,
    },
    countValuesUniMed: {
      C: 0,
      kPa: 0,
      A: 0,
      H: 0,
      P: 0,
      s: 0,
    },
    sendToGraphDefault: [],
    sendToGraphPercent: [],
  });
  setState({
    ...state,
    maxValue,
    countValuesUniMed,
    sendToGraphDefault,
    sendToGraphPercent,
  });
}

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
};

const rgbToHex = (r, g, b) => {
  const toHex = (x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const darkenColor = (hex, amount) => {
  const [r, g, b] = hexToRgb(hex);
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);
  return rgbToHex(newR, newG, newB);
};

type DataRecord = ApiResps['/dri/get-chiller-parameters-hist']['paramsLists']['paramsGrouped'][0]

function setTimeToLoop(i, interval, numPoints, countHour) {
  const counter = i * interval;
  const hours = numPoints === 24 ? i : countHour;
  const minutes = counter < 60 ? counter : counter % 60;
  let time: string;
  if (interval === 10) {
    time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    time = `${hours.toString().padStart(2, '0')}:00`;
  }
  return { hours, minutes, time };
}

function fillMissingIntervals(dataArray: DataRecord[], numPoints: number, chillerModel: string): DataRecord[] {
  const filledData: any = [];
  const dataMap = dataArray.reduce((map, data) => {
    const time = moment(data.record_date).format('HH:mm');
    map[time] = data;
    return map;
  }, {} as { [key: string]: DataRecord });
  let countHour = 0;
  const interval = numPoints === 24 ? 1 : 10; // Intervalo em horas (1 para 24 pontos) ou minutos (10 para 144 pontos)
  const data = dataArray[0].record_date.split('T')[0];
  const currentDate = moment();
  for (let i = 0; i < numPoints; i += 1) {
    const { hours, minutes, time } = setTimeToLoop(i, interval, numPoints, countHour);
    if (dataMap[time]) {
      filledData.push(dataMap[time]);
    } else {
      if (moment(dataArray[0].record_date).isSame(currentDate, 'day') && hours > currentDate.hours()) {
        // Não preenche além do horário atual
        break;
      }
      filledData.push(chillerModel === 'XA' ? ObjectXAData(`${data}T${time}:00Z`) : chillerModel === 'XA_HVAR' ? ObjectXAHvarData(`${data}T${time}:00Z`) : ObjectHXData(`${data}T${time}:00Z`));
    }

    if (minutes === 50) {
      countHour++;
    }
  }
  return filledData;
}
interface RecordStatus {
  haveData: boolean;
  count: number;
  date: string;
}

export function createRecordStatusObject(recordDates: string[], listDates: Date[]): { [key: number]: RecordStatus } {
  const recordStatusObject: { [key: number]: RecordStatus } = {};
  listDates.forEach((date, index) => {
    const dateObj = moment(date).format('YYYY-MM-DD');
    const count = recordDates.filter((recordDate) => recordDate.split('T')[0] === dateObj).length;
    recordStatusObject[index] = {
      haveData: count > 0,
      count,
      date: dateObj,
    };
  });
  return recordStatusObject;
}

const ObjectXAData = (record_date) => ({
  cap_t: null,
  cond_ewt: null,
  cond_lwt: null,
  cool_ewt: null,
  cool_lwt: null,
  ctrl_pnt: null,
  deviceCode: null,
  dp_a: null,
  dp_b: null,
  hr_cp_a: null,
  hr_cp_b: null,
  hr_mach: null,
  hr_mach_b: null,
  oat: null,
  op_a: null,
  op_b: null,
  record_date,
  sct_a: null,
  sct_b: null,
  slt_a: null,
  slt_b: null,
  sp: null,
  sp_a: null,
  sp_b: null,
  sst_a: null,
  sst_b: null,
  unit_id: null,
});

const ObjectXAHvarData = (record_date) => ({
  genunit_ui: null,
  cap_t: null,
  tot_curr: null,
  ctrl_pnt: null,
  oat: null,
  cool_ewt: null,
  cool_lwt: null,
  circa_an_ui: null,
  capa_t: null,
  dp_a: null,
  sp_a: null,
  econ_p_a: null,
  op_a: null,
  dop_a: null,
  curren_a: null,
  cp_tmp_a: null,
  dgt_a: null,
  eco_tp_a: null,
  sct_a: null,
  sst_a: null,
  suct_t_a: null,
  exv_a: null,
  circb_an_ui: null,
  capb_t: null,
  dp_b: null,
  sp_b: null,
  econ_p_b: null,
  op_b: null,
  dop_b: null,
  curren_b: null,
  cp_tmp_b: null,
  dgt_b: null,
  eco_tp_b: null,
  sct_b: null,
  sst_b: null,
  suct_t_b: null,
  exv_b: null,
  circc_an_ui: null,
  capc_t: null,
  dp_c: null,
  sp_c: null,
  econ_p_c: null,
  op_c: null,
  dop_c: null,
  curren_c: null,
  cp_tmp_c: null,
  dgt_c: null,
  eco_tp_c: null,
  sct_c: null,
  sst_c: null,
  suct_t_c: null,
  exv_c: null,
  deviceCode: null,
  record_date,
  unit_id: null,
});

const ObjectHXData = (record_date) => ({
  cap_t: null,
  capa_t: null,
  capb_t: null,
  cond_ewt: null,
  cond_lwt: null,
  cond_sp: null,
  cool_ewt: null,
  cool_lwt: null,
  cpa1_cur: null,
  cpa1_dgt: null,
  cpa1_op: null,
  cpa1_tmp: null,
  cpa2_cur: null,
  cpa2_dgt: null,
  cpa2_op: null,
  cpa2_tmp: null,
  cpb1_cur: null,
  cpb1_dgt: null,
  cpb1_op: null,
  cpb1_tmp: null,
  cpb2_cur: null,
  cpb2_dgt: null,
  cpb2_op: null,
  cpb2_tmp: null,
  ctrl_pnt: null,
  dem_lim: null,
  device_code: null,
  dop_a1: null,
  dop_a2: null,
  dop_b1: null,
  dop_b2: null,
  dp_a: null,
  dp_b: null,
  exv_a: null,
  exv_b: null,
  hr_cp_a1: null,
  hr_cp_a2: null,
  hr_cp_b1: null,
  hr_cp_b2: null,
  lag_lim: null,
  record_date,
  sct_a: null,
  sct_b: null,
  sp: null,
  sp_a: null,
  sp_b: null,
  sst_a: null,
  sst_b: null,
  unit_id: null,
});

export function processData(pointsObj: { [key: number]: RecordStatus }, dataArray: DataRecord[], numPoints: number, chillerModel: string): DataRecord[] {
  const results: any = [];

  let sumData = 0;
  for (const day in pointsObj) {
    const value = pointsObj[day];
    sumData += value.count;

    if (value.haveData) {
      if (numPoints === value.count) {
        results.push(...dataArray.slice(sumData - value.count, sumData));
      } else {
        const arrayData = dataArray.slice(sumData - value.count, sumData);
        results.push(...fillMissingIntervals(arrayData, numPoints, chillerModel));
      }
    } else {
      const date = moment(value.date);
      for (let i = 0; i < numPoints; i++) {
        date.hours(i);
        date.minutes(0);
        results.push(
          chillerModel === 'XA'
            ? ObjectXAData(date.format())
            : chillerModel === 'XA_HVAR'
              ? ObjectXAHvarData(date.format())
              : ObjectHXData(date.format()),
        ); }
    }
  }
  return results;
}
