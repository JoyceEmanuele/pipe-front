import styled from 'styled-components';

import { CalendarIcon, ExpandIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
    color: white;
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

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-left: 16px;
  color: ${colors.Grey300};
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const Section = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 36px;
  letter-spacing: 0.5px;
  color: ${colors.Black};
  margin-top: 30px;
  cursor: pointer;
  width: fit-content;
`;

export const ChevronDown = styled.span`
  margin-left: 20px;
  ::before {
    border-style: solid;
    border-width: 0.17em 0.17em 0 0;
    content: '';
    display: inline-block;
    height: 0.50em;
    left: 0.15em;
    position: relative;
    top: 13px;
    -webkit-transform: rotate(135deg);
    -ms-transform: rotate(135deg);
    transform: rotate(135deg);
    vertical-align: top;
    width: 0.50em;
  }
`;

export const ChevronUp = styled.span`
  margin-left: 20px;
  ::before {
    border-style: solid;
    border-width: 0.17em 0.17em 0 0;
    content: '';
    display: inline-block;
    height: 0.50em;
    left: 0.15em;
    position: relative;
    top: 13px;
    -webkit-transform: rotate(315deg);
    -ms-transform: rotate(315deg);
    transform: rotate(315deg);
    vertical-align: top;
    width: 0.50em;
  }
`;

export const Title = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  color: #5E5E5E;
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 21px;
  height: 21px;
  margin-right: 7px;
  top: -1px;
  cursor: pointer;
  position: relative;
  svg {
    width: 21px;
    height: 21px;
  }
  color: #363BC4;
`;

export const TopTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 13px;
  line-height: 16px;
  color: ${colors.Black};
`;

export const TopDate = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 24px;
  text-align: right;
  letter-spacing: -0.5px;
  color: ${colors.GreyDark};
`;

export const ArrowButton = styled.div<{ orientation: string }>(
  ({ orientation }) => `
  height: 50px;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  ${orientation === 'right' ? 'border-left: 0px;' : ''}
  ${orientation === 'left' ? 'border-right: 0px;' : ''}
  &:hover {
    background-color: #F5F5F5;
  }
`,
);

export const ExportButton = styled.div<{ hover?: boolean }>(
  ({ hover }) => `
  cursor: pointer;
  color: black;
  border: 1px solid ${colors.GreyLight};
  margin-left: auto;
  border-radius: 12px;
  height: 45px;
  width: 160px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  ${hover && `:hover {
    color: ${colors.White};
    background-color: #363BC4;
    div > div {
      color: ${colors.White};
    }
  })`}
`,
);

export const CardNoService = styled.div`
  width: 100%;
  height: 100%;
  border: 1px solid #20237033;
  border-radius: 4px;
  background-color: ${colors.White};

  display: flex;
  justify-content: center;
  align-items: center;
  padding-block: 54px;
  margin-top: 15px;
  margin-bottom: 34px;

  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  color: #0000008f;

  span{
    margin-left: 10px;
  }
`;

export const ModalContainerLoading = styled.div<{display?: boolean }>`
  ${({ display }) => (display ? 'display: block' : 'display: none')}  
  padding-top: 30%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100vw;
  background-color: #fcfdfcd9;
  z-index: 1;
  position: absolute;
  left: 0;
  color: #5B5B5B;
  font-size: 14px;
  text-align: center;
  gap: 8px;
  cursor: wait;
  pointer-events: none;
  margin-left: 20px;
  h4 {
    margin: 0px;
  }
`;

export const SearchInput = styled.div`
min-height: 48px;
margin: 0;
font-size: 12px;
color: #000;
width: 100%;
border: 1px solid #E9E9E9;
border-radius: 5px;
box-sizing: border-box !important;
display: inline-flex;
`;

export const TextLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 6px;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 12px;
  font-weight: bold;
`;
