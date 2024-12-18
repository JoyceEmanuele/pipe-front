import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const ContainerDST = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px;
  p {
    margin: 0px;
  }
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
  }
  .react-datepicker__triangle {
    left: -130px !important;
  }
  .react-datepicker__header {
    background-color: white;
    border-bottom: none;
  }
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
    border-bottom-color: white;
  }
  .react-datepicker-wrapper {
    display: block;
    .react-datepicker__input-container {
      input[type="text"] {
        border: none;
        font-size: 12px;
        outline: none;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: #464555;
      }
    }
  }
  .DateRangePickerInput {
    .DateRangePickerInput_arrow {
      width: 30px;
    }
    .DateInput {
      width: 90px;
      margin: 10px 0px;
      .DateInput_input {
        outline: none;
        font-size: 14px;
        line-height: 19px;
        padding: 0px;
        color: ${colors.Grey400};
      }
      .DateInput_input__focused {
        border: none;
      }
    }
    .DateRangePickerInput_arrow_svg {
      width: 14px;
      height: 14px;
    }
  }
  .DateInput_fang {
    z-index: 1;
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
  .CalendarDay__hovered_span {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
  CalendarDay__hovered_span:hover {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
  .CalendarDay__hovered_span_3 {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
  .CalendarDay__hovered_span_3:hover {
    background: ${colors.BlueSelectedSpan};
    border: 1px double ${colors.BlueSelectedSpan};
    color: ${colors.White};
  }
`;

export const ContainerAreas = styled.div`
  margin: 30px 0px;
  .select-search__input {
    padding: 0px;
    font-size: 12px;
  }
  p {
    font-size: 14px;
  }
`;

export const InputAreasContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  input {
    position: relative;
    border-radius: 5px;
    border: 1px solid gray;
    outline: 0;
    text-align: center;
  }
`;
