import styled from 'styled-components';

import { CalendarIcon } from '../../icons';
import { colors } from '../../styles/colors';

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;

export const ContentDate = styled.div`
  position: relative;
  .SingleDatePicker {
    display: block;
    position: initial;
  }
  .SingleDatePickerInput {
    display: block;
    position: relative;
    border: none;
    .DateInput {
      display: block;
      position: relative;
      width: 100%;
      .DateInput_input {
        border: none;
        outline: none;
        min-height: 48px;
        font-size: 1em;
        line-height: 19px;
        border-radius: 8px;
        padding: 20px 40px 10px 14px;
        color: ${colors.Grey400};
        width: 100%;
        box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
      }
    }
  }
  .DayPicker_weekHeader_li {
    width: 37px !important;
  }
  .DateInput_fang {
    z-index: 1;
  }
  .DayPicker,
  .DayPicker > div > div,
  .DayPicker_transitionContainer {
    width: 300px !important;
  }
  .CalendarDay__selected,
  .CalendarDay__selected:active {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.White};
  }
  .CalendarDay__selected:hover {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
`;
