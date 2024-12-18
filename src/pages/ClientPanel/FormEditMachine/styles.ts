import styled from 'styled-components';
import { colors } from '~/styles/colors';
import { CalendarIcon, ExportWorksheetIcon } from '~/icons';

export const CustomInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  border: 0.7px solid ${colors.GreyInputBorder}
`;

export const ModalContainer = styled.div`
  width: 100%;
  border-radius: 4px;
`;

export const FakeLink = styled.span`
  color: black;
  text-decoration: underline;
  cursor: pointer;
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const Form = styled.form`
  display: flex;
  width: '100%';
  flex-direction: column;
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-top: 15px;
  margin-right: 15px;
  cursor: pointer;
  position: relative;
  top: -10px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Content = styled.div`
  position: relative;
  margin: 30px 100px 40px;
  display: flex;
  justify-content: space-between;

  @media (max-width: 568px) {
    flex-direction: column;
    margin: 20px 10px;
    align-items: center;
  }
`;

export const Text = styled.text`
color: ${colors.Black};
`;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.Pink200};
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
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: ${colors.Grey400};
        width: 100%;
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateRangePickerInput {
    .DateRangePickerInput_arrow {
      width: 60px;
    }
    .DateInput {
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: ${colors.Grey400};
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateInput_fang {
    z-index: 1;
  }
  .SingleDatePicker_picker {
    width: 100%;
  }
  .CalendarDay__selected,
  .CalendarDay__selected:active {
    background: ${colors.Pink200};
    border: 1px double ${colors.Pink200};
    color: ${colors.White};
  }
  .CalendarDay__selected:hover {
    background: ${colors.Pink400};
    border: 1px double ${colors.Pink400};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    border-right: 33px solid ${colors.Pink200};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
    border-right: 33px solid ${colors.Pink400};
  }
`;

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;

export const BtnExport = styled.div`
  cursor: pointer;
  color: #363BC4;
  padding: 14px 20px;
  border: 1px solid ${colors.GreyLight};
  font-weight: 400;
  border-radius: 12px;
  height: 41px;
  display: flex;
  text-align: center;
  align-items: center;
  width: fit-content;
  :hover {
    color: ${colors.White}
    background-color: #363BC4
    ${Text} {
      color: ${colors.White}
    }
  }
`;

export const ExportWorksheet = styled(ExportWorksheetIcon)(
  () => `
  color: #363BC4
`,
);
