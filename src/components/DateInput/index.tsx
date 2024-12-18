import { useState } from 'react';
import moment, { Moment } from 'moment';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import DatePicker from 'react-datepicker';
import { ContentDate, StyledCalendarIcon, Label } from './styles';
import i18n from '../../i18n';

export const DateInput = (props: {
  startDate: Moment|null,
  endDate?: Moment|null,
  timeRange?: string|null,
  setDate: (startDate, endDate?) => void,
  label: string|null
}): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { startDate, endDate, setDate } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState('');

  return (
    <>
      {props.timeRange === 'Dia' && (
      <ContentDate>
        <Label>{props.label}</Label>
        <SingleDatePicker
          date={startDate}
          onDateChange={(newDate) => {
            setDate(newDate, newDate);
          }}
          focused={focused}
          onFocusChange={({ focused: isFocused }) => setFocused(isFocused)}
          id="datepicker"
          numberOfMonths={1}
          isOutsideRange={(d) => !d.isBefore(moment(moment().add(1, 'days').format('YYYY-MM-DD')))}
        />
        <StyledCalendarIcon />
      </ContentDate>
      )}
      {props.timeRange === 'Mês' && (
        <ContentDate>
          <Label>{props.label}</Label>
          <DatePicker
            maxDate={moment().toDate()}
            selected={startDate?.toDate()}
            onChange={(newDate) => {
              setDate(moment(newDate), moment(newDate));
            }}
            locale="pt-BR"
            dateFormat="MMM/yyyy"
            showMonthYearPicker
          />
          <StyledCalendarIcon />
        </ContentDate>
      )}
      {props.timeRange === 'Flexível' && (
      <ContentDate>
        <Label>{props.label}</Label>
        <DateRangePicker
          startDate={startDate}
          startDateId="your_unique_start_date_id"
          endDate={endDate}
          endDateId="your_unique_end_date_id"
          onDatesChange={({ startDate: newStartDate, endDate: newEndDate }) => {
            setDate(moment(newStartDate), moment(newEndDate));
          }}
          onFocusChange={(isFocused: 'endDate' | 'startDate' | '') => {
            setFocusedInput(isFocused);
          }}
          focusedInput={focusedInput}
          noBorder
          isOutsideRange={(d) => !d.isBefore(moment())}
        />
        <StyledCalendarIcon />
      </ContentDate>
      )}
      {props.timeRange === 'Semana' && (
      <ContentDate>
        <Label>{props.label}</Label>
        <DateRangePicker
          startDate={startDate}
          startDateId="your_unique_start_date_id"
          endDate={endDate}
          endDateId="your_unique_end_date_id"
          onDatesChange={({ startDate: newStartDate }) => {
            setDate(moment(newStartDate), moment(newStartDate));
          }}
          onFocusChange={(isFocused:'startDate') => {
            setFocusedInput(isFocused);
          }}
          focusedInput={focusedInput}
          noBorder
          isOutsideRange={(d) => !d.isBefore(moment())}
        />
        <StyledCalendarIcon />
      </ContentDate>
      )}
      {props.timeRange === 'Ano' && (
        <ContentDate>
          <Label>{props.label}</Label>
          <DatePicker
            maxDate={moment().toDate()}
            id="DatePicker"
            type="string"
            selected={startDate?.toDate()}
            onChange={(newDate) => {
              setDate(moment(newDate), moment(newDate));
            }}
            showYearPicker
            dateFormat="yyyy"
            yearItemNumber={9}
          />
          <StyledCalendarIcon />
        </ContentDate>
      )}
    </>
  );
};
