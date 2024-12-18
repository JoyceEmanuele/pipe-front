import { useState } from 'react';
import moment, { Moment } from 'moment';
import { SingleDatePicker } from 'react-dates';
import { ContentDate, StyledCalendarIcon } from './styles';

export const Datepicker = (props: {
  date: Moment|null,
  setDate: (date: Moment) => void,
}): JSX.Element => {
  const {
    date, setDate,
  } = props;
  const [focused, setFocused] = useState<boolean>(false);

  return (
    <ContentDate>
      <SingleDatePicker
        date={date}
        onDateChange={(newDate) => {
          setDate(newDate);
        }}
        focused={focused}
        onFocusChange={({ focused: isFocused }) => setFocused(isFocused)}
        id="datepicker"
        numberOfMonths={1}
        isOutsideRange={(d) => !d.isBefore(moment(moment().add(1, 'days').format('YYYY-MM-DD')))}
      />
      <StyledCalendarIcon />
    </ContentDate>
  );
};
