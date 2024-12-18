import { ApiResps } from '../providers';
import moment from 'moment';

interface EnergySample {
  v_a?: number,
  v_b?: number,
  v_c?: number,
  v_ab?: number,
  v_bc?: number,
  v_ca?: number,
  i_a?: number,
  i_b?: number,
  i_c?: number,
  pot_at_a?: number,
  pot_at_b?: number,
  pot_at_c?: number,
  pot_ap_a?: number,
  pot_ap_b?: number,
  pot_ap_c?: number,
  pot_re_a?: number,
  pot_re_b?: number,
  pot_re_c?: number,
  v_tri_ln?: number,
  v_tri_ll?: number,
  pot_at_tri?: number,
  pot_ap_tri?: number,
  pot_re_tri?: number,
  demanda_at?: number,
  demanda_ap?: number,
  en_at_tri?: number,
  en_re_tri?: number,
  fp_a?: number,
  fp_b?: number,
  fp_c?: number,
  fp?: number,
  freq?: number,
}

interface EnergyDataStruct {
  [param: string]: {
    [day: string]: {
      day: string,
      dayInMonth?: string,
      dayOfWeek?: string,
      dayNumber?: string,
      totalMeasured: number,
      hourValues: {
        [hour: string]: number[],
      },
      hours: [],
    }
  }
}

export interface CompiledEnergyData {
  [property: string] : {
    day: string,
    dayInMonth?: string,
    dayOfWeek?:string,
    dayNumber?: string,
    percentageTotalMeasured: 0,
    hours: {
      hour: string,
      totalMeasured: number,
      percentageTotalMeasured: number,
    }[],
    totalMeasured: number,
    maxDayTotalMeasured: number
    yPointsHoursMeasured: number[],
  }[]
}

export function compileEnergyData(energyApiResponse: ApiResps['/energy/get-hist'], firstDate: string, lastDate: string, params: string[]): CompiledEnergyData {
  const sampleWithParams = energyApiResponse.data.find((x) => Object.keys(x).length > 1);
  const { timestamp, ...sample } = sampleWithParams || { timestamp: null };
  const dataStruct = generateDataStruct(sample, firstDate, lastDate, params);
  const compiledEnergyData = formatData(dataStruct, energyApiResponse);

  return compiledEnergyData;
}

function generateDataStruct(sample: EnergySample, firstDate: string, lastDate: string, params: string[]) {
  const result = {} as EnergyDataStruct;
  for (const key of params) {
    result[key] = {};
  }

  const firstDay = moment(firstDate);
  const lastDay = moment(lastDate);
  const numDays = lastDay.diff(firstDay, 'days') + 1;
  for (let i = 0; i < numDays; i += 1) {
    for (const key of Object.keys(result)) {
      const day = firstDay.clone().add(i, 'days').toISOString().split('T')[0];
      const dayInMonth = moment(firstDay.clone().add(i, 'days').toISOString().split('T')[0]).format('D');
      const dayOfWeek = `${moment(day).format('dddd')}`;
      const dayNumber = `${i + 1}`;
      result[key][day] = {
        day,
        dayInMonth,
        dayOfWeek,
        dayNumber,
        totalMeasured: 0,
        hourValues: {
          '00': [],
          '01': [],
          '02': [],
          '03': [],
          '04': [],
          '05': [],
          '06': [],
          '07': [],
          '08': [],
          '09': [],
          10: [],
          11: [],
          12: [],
          13: [],
          14: [],
          15: [],
          16: [],
          17: [],
          18: [],
          19: [],
          20: [],
          21: [],
          22: [],
          23: [],
        },
        hours: [],
      };
    }
  }
  return result;
}

function formatData(dataStruct: EnergyDataStruct, data: ApiResps['/energy/get-hist']) {
  for (const measures of data.data) {
    const [day, hours] = measures.timestamp.split('T');
    for (const key of Object.keys(dataStruct)) {
      dataStruct[key][day]?.hourValues[hours.substring(0, 2)].push(measures[key]);
    }
  }

  const compiledData = {} as CompiledEnergyData;

  const properties = Object.keys(dataStruct);
  for (const property of properties) {
    compiledData[property] = [];
    const daysData = Object.values(dataStruct[property]);
    for (const [dayIndex, dayData] of daysData.entries()) {
      const obj = {
        day: dayData.day,
        dayInMonth: dayData.dayInMonth,
        dayOfWeek: dayData.dayOfWeek,
        dayNumber: dayData.dayNumber,
        percentageTotalMeasured: 0,
        hours: [],
      } as any;
      const hoursSorted = Object.keys(dayData.hourValues).sort((a, b) => Number(a) - Number(b));
      for (const [hourIndex, hour] of hoursSorted.entries()) {
        const hourDataVec = dayData.hourValues[hour];
        let nextHourDataVec = [] as number[];
        if (hour !== '23') {
          nextHourDataVec = dayData.hourValues[(hourIndex + 1).toString().padStart(2, '0')];
        } else {
          nextHourDataVec = daysData[dayIndex + 1]?.hourValues['00'];
        }
        const hourDataValue = (hourDataVec.length > 0 ? (hourDataVec[hourDataVec.length - 1] - hourDataVec[0]) : hourDataVec[0]);
        const nextHourValue = (nextHourDataVec?.length > 0
          ? nextHourDataVec[0] - hourDataVec[0]
          : hourDataValue
        );
        obj.hours.push({
          hour,
          totalMeasured: (hourDataVec.length > 0
            ? nextHourValue
            : 0
          ),
          percentageTotalMeasured: 0,
        });
      }

      obj.totalMeasured = obj.hours.reduce((acc: any, value: { totalMeasured: any; }) => acc += (value.totalMeasured ? value.totalMeasured : 0), 0);
      obj.maxDayTotalMeasured = obj.hours.reduce((acc: number, value: { totalMeasured: number; }) => {
        if (value.totalMeasured > acc) return value.totalMeasured;
        return acc;
      }, 0);
      obj.yPointsHoursMeasured = [4, 3, 2, 1, 0];
      compiledData[property].push(obj);
    }
  }

  return compiledData;
}
