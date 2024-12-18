import moment from 'moment';

export function formatTime(time: number) {
  const hour = Math.floor(time);
  const minutes = `${Math.floor(((time - Math.floor(time)) * 30) / 0.5)}`;
  let text = `${hour}:${minutes.length === 1 ? `0${minutes}` : minutes}`;
  const seconds = `${Math.floor(
    ((((time - Math.floor(time)) * 30) / 0.5 - Math.floor(((time - Math.floor(time)) * 30) / 0.5)) * 30) / 0.5,
  )}`;
  text += `:${seconds.length === 1 ? `0${seconds}` : seconds}`;

  return text;
}

export function addDays_YMD(day: string, numDays: number) {
  const d = new Date(`${day}Z`);
  for (let i = 0; i < numDays; i++) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d.toISOString().substr(0, 10);
}

export function getDatesRange(date: moment.Moment, numDays: number) {
  const dateList = [] as {
    mdate: moment.Moment,
    YMD: string,
    DMY: string,
  }[];

  for (let i = 0; i < numDays; i++) {
    const mdate = moment(date).subtract(i, 'days');
    dateList.push({
      mdate,
      DMY: mdate.format('DD/MM/YYYY'),
      YMD: mdate.format('YYYY-MM-DD'),
    });
  }

  return dateList;
}

export function formatCsvDatetime(xPoint: number, dayStartYMD: string): string {
  const numDays = Math.floor(xPoint / 24);
  const date = new Date(`${moment(dayStartYMD).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hourFormatted = String(Math.floor(Math.abs(xPoint)) - 24 * numDays).padStart(2, '0');
  const minFormatted = String(Math.floor((Math.abs(xPoint) * 60) % 60)).padStart(2, '0');
  const secFormatted = String(Math.floor((Math.abs(xPoint) * 60 * 60) % 60)).padStart(2, '0');

  return `${day}/${month} ${hourFormatted}:${minFormatted}:${secFormatted}`;
}

export const getDateFromHour = (hour: number, dateStart: string): string => {
  const numberOfDays = Math.floor(hour / 24);
  const date = new Date(`${moment(dateStart).add(numberOfDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const endDate = `${day}/${month}`;
  return `${endDate}`;
};

export const getTimeFromHour = (hour: number): { hourFormatted: number, minFormatted: number, secFormatted: number } => {
  const numberOfDays = Math.floor(hour / 24);

  const minFormatted = Math.floor((Math.abs(hour) * 60) % 60);
  const secFormatted = Math.floor((Math.abs(hour) * 60 * 60) % 60);
  const hourFormatted = Math.floor(Math.abs(hour)) - 24 * numberOfDays;

  return { hourFormatted, minFormatted, secFormatted };
};

export function getFormattedTimeFromHour(hour: number): string {
  const numDays = Math.floor(hour / 24);
  const sign = hour - 24 * numDays < 0 ? '-' : '';

  const time = getTimeFromHour(hour);
  const { hourFormatted, minFormatted } = time;

  return `${'\n'} ${sign}${String(hourFormatted).padStart(2, '0')}:${String(minFormatted).padStart(2, '0')}`;
}

export const timeFormater = (hour: number, dateStart: string): string => {
  const time = getTimeFromHour(hour);
  const { hourFormatted, minFormatted, secFormatted } = time;

  const date = getDateFromHour(hour, dateStart);

  return `${date} - ${String(hourFormatted).padStart(2, '0')}:${String(minFormatted).padStart(2, '0')}:${String(secFormatted).padStart(2, '0')}`;
};

export function getDates(state: { dateList: { YMD: string }[], validInvoiceMonth?: boolean, currentMonthNumber?: number, currentYearNumber?: number }): { dateStart: Date, dateEnd: Date} {
  const dateNow = new Date();
  const dateEnd = state.dateList.length > 0 ? new Date(`${moment(state.dateList[state.dateList.length - 1].YMD).format('YYYY-MM-DD')}T00:00:00Z`) : new Date();
  dateEnd.setDate(1);
  if (dateEnd.getMonth() >= dateNow.getMonth() && dateEnd.getFullYear() === dateNow.getFullYear()
    || dateEnd.getFullYear() > dateNow.getFullYear()) {
    dateEnd.setMonth(dateNow.getMonth() - 1);
    dateEnd.setFullYear(dateNow.getFullYear());
    if (state.validInvoiceMonth != null) {
      state.validInvoiceMonth = false;
      state.currentMonthNumber = dateNow.getMonth();
      state.currentYearNumber = dateNow.getFullYear();
    }
  }
  const dateStart = state.dateList.length > 0 ? new Date(`${moment(state.dateList[state.dateList.length - 1].YMD).format('YYYY-MM-DD')}T00:00:00Z`) : new Date();
  dateStart.setDate(1);

  if (dateStart.getMonth() >= dateNow.getMonth() && dateStart.getFullYear() === dateNow.getFullYear()
    || dateStart.getFullYear() > dateNow.getFullYear()) {
    dateStart.setFullYear(dateNow.getFullYear());
    dateStart.setMonth(dateNow.getMonth() - 1);
  }

  dateStart.setDate(dateStart.getDate() - 1);
  dateStart.setFullYear(dateStart.getFullYear() - 1);

  return { dateStart, dateEnd };
}
