import moment from 'moment';

export function getDatesList(date: moment.Moment, numDays: number) {
  const dateList = [] as {
    mdate: moment.Moment;
    YMD: string;
    DMY: string;
    totalGreenAntCons: number;
    totalGreenAntInvoice: number;
    totalAirCondCons: number;
    savings_kWh: number;
  }[];

  for (let i = 0; i < numDays; i++) {
    const mdate = moment(date).add(i, 'days');
    dateList.push({
      mdate,
      DMY: mdate.format('DD/MM/YYYY'),
      YMD: mdate.format('YYYY-MM-DD'),
      totalGreenAntCons: 0,
      totalGreenAntInvoice: 0,
      totalAirCondCons: 0,
      savings_kWh: 0,
    });
  }

  return dateList;
}
