import moment from 'moment-timezone';
import { ReactElement } from 'react';

export function CsvLabelFormatterData(hour: number, dateStart: moment.Moment | null): string {
  const numDays = Math.floor(hour / 24);
  const date = new Date(`${moment(dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dateFinal = `${dd}/${mm}`;
  const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
  const min = Math.floor((Math.abs(hour) * 60) % 60);
  const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);
  return `${dateFinal} ${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function tickXLabelFormatterDay(hour: number, dateStart: moment.Moment | null): string {
  const numDays = Math.floor(hour / 24);
  const date = new Date(`${moment(dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');

  const dateFinal = `${dd}/${mm}`;
  return `${dateFinal}`;
}

export function tickXLabelFormatterHour(hour: number): string {
  const numDays = Math.floor(hour / 24);
  const sign = hour - 24 * numDays < 0 ? '-' : '';
  const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
  const mm = Math.floor((Math.abs(hour) * 60) % 60);
  return `${'\n'} ${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export const renderQuarterTickHour = (tickProps: any): ReactElement => {
  const { x, y, payload } = tickProps;
  const { value } = payload;

  return <text x={x} y={y - 4} textAnchor="middle" className="recharts-text">{`${tickXLabelFormatterHour(value)}`}</text>;
};

export function tooltipXLabelFormatter(hour: number, dateStart: moment.Moment | null) {
  const numDays = Math.floor(hour / 24);
  const date = new Date(`${moment(dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dateFinal = `${dd}/${mm}`;

  const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
  const min = Math.floor((Math.abs(hour) * 60) % 60);
  const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);

  return `${dateFinal} - ${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
