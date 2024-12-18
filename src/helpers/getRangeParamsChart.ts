import moment from 'moment';

export const handleGetDatesParams = (
  date: string | Date,
  format: string,
  chartMode: string | 'yearMode' | 'monthMode',
  isComparing: boolean,
  cardYear?: string | number,
): { startDate: moment.Moment; endDate: moment.Moment } => {
  let dateParams = {
    startDate: moment(date, format).startOf('month').utcOffset(0, true),
    endDate: moment(date, format).endOf('month').utcOffset(0, true),
  };

  if (chartMode === 'yearMode') {
    dateParams = {
      startDate: moment(date, format).startOf('year').utcOffset(0, true),
      endDate: moment(date, format).endOf('year').add(1, 'month').endOf('month')
        .utcOffset(0, true),
    };
  }

  if (chartMode === 'yearMode' && isComparing) {
    dateParams = {
      startDate: moment(date, format).startOf('year').utcOffset(0, true),
      endDate: moment(date, format).endOf('year').endOf('month').utcOffset(0, true),
    };
  }

  if (chartMode === 'yearMode' && moment(date, format).year() === moment().year() && !isComparing) {
    dateParams = {
      startDate: moment().subtract(1, 'years').startOf('month').utcOffset(0, true),
      endDate: moment().endOf('month').utcOffset(0, true),
    };
  }

  if (chartMode === 'yearMode' && Number(cardYear) === moment().year() && !isComparing) {
    dateParams = {
      startDate: moment(date, format).subtract(1, 'years').startOf('month').utcOffset(0, true),
      endDate: moment(date, format).endOf('month').utcOffset(0, true),
    };
  }

  return dateParams;
};
