import styled from 'styled-components';

import { DottedLineIcon, LineIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const GraphWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100%;
`;

export const CheckboxLine = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
export const Text = styled.span`
  font-weight: normal;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
`;

export const DesktopWrapper = styled.div`
  display: block;
  margin-bottom: 10px;
`;

export const CardWrapper = styled.div`
  padding: 32px 24px;
  background: ${colors.White};
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const CustomLabel = styled.text<{ angle }>`
transform: rotate(${({ angle }) => (angle || -90)}deg);
`;

export const ContainerArrowLeft = styled.div<{disabled: boolean }>(
  ({
    disabled,
  }) => `
  display: flex;
  width: 35px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #EDEDED;
  cursor: pointer;
  pointer-events: ${disabled ? 'none' : 'all'}
`,
);
export const ContainerArrowRight = styled.div<{disabled: boolean }>(
  ({
    disabled,
  }) => `
  display: flex;
  width: 35px;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #EDEDED;
  cursor: pointer;
  pointer-events: ${disabled ? 'none' : 'all'}
`,
);

export const LabelData = styled.div`
  position: relative;
  top: 3px;
  margin-left: 13px;
  font-size: 11px;
  font-weight: 700;
  line-height: 15px;
`;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
  .CalendarDay__selected_span {
    background: #D0D2F1;
    border: 1px double #F4EBEB;
    color: #000;
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
  .react-datepicker-wrapper {
    display: block;
    .react-datepicker__input-container {
      input[type="text"] {
        border: none;
        font-size: 12px;
        outline: none;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        background: none;
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
      width: 15px;
    }
    .DateInput {
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 15px 0px 14px;
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
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.White};
    font-weight: bold;
  }
  .CalendarDay__selected:hover {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.Black};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }

  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    display: none;
  }

  .CalendarMonth_caption {
    color: #000;
    text-transform: capitalize;
  }

  .CalendarMonth_caption {
    color: #000;
    text-transform: capitalize;
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    display: none;
  }
  .CalendarDay__hovered_span, .CalendarDay__hovered_span:hover {
    background: #E5E6F8;
    border: 1px double #F4EBEB;
    color: #000;
  }
  .CalendarDay__selected_span:hover {
    background: #B5B7DD;
    border: 1px double #B5B7DD;
    color: #fff;
  }
`;

export const BtnExport = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  cursor: pointer;
  padding: 0 10px;
  border: 1px solid lightgrey;
  font-weight: 500;
  border-radius: 10px;
  box-shadow: 0 0px 4px 0px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  height: 40px;
  gap: 10px;

  &:hover {
    color: ${colors.BlueSecondary};
  }

  ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);
