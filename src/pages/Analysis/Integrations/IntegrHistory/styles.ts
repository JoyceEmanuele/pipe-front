import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  CalendarIcon, LineIcon, ExportWorksheetIcon, DashedLineIcon,
} from '~/icons';
import { colors } from '~/styles/colors';

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;

  .CalendarMonth_caption {
    color: #000;
    text-transform: capitalize;
  }
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

  .CalendarDay__selected_span {
    background: #D0D2F1;
    border: 1px double #F4EBEB;
    color: #000;
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    display: none;
  }
  .CalendarDay__default:hover {
    background: #e4e7e7;
    border: 1px solid #e4e7e7;
    color: inherit;
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
    
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before,
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
    display: none;
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
  .react-datepicker__year-text--selected, .react-datepicker__year-text--in-selecting-range, .react-datepicker__year-text--in-range {
    background-color: #363BC4;
  }
  .react-datepicker__year-wrapper {
    justify-content: center;
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

export const StyledCalendarIconMonthViewBtn = styled(CalendarIcon)(
  () => `
  width: 30px;
  height: 24px;
  color: #363BC4;
`,
);

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

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const VarContainer = styled.div`
  margin: 10px 0 10px 15px;
  min-width: 230px;
`;

export const VarName = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #000;
  line-height: '13.31px'
`;
export const VarValue = styled.span`
  font-weight: bold;
  font-size: 150%;
`;
export const VarUnit = styled.span`
  font-size: 130%;
  color: #8c8c8c;
  padding-left: 0.35em;
`;

export const CustomLegendUl = styled.ul`
  transform: rotate(270deg);
  position: relative;
  left: 50px;
`;

export const CustomLegendLi = styled.li`
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  color: #000000;
  list-style-type: none;
  display: inline-flex;
  align-items: center;
`;

export const WaterTooltip = styled.div`
  min-width: 210px;
  min-height: 140px;
  background: #FFFFFFF7;
  border: 1px solid #202370;
  border-radius: 4px;
  padding: 24px;

  > span {
    font-weight: bold;
    color: #000000;
  }

  > p {
    > strong {
      font-size: 150%;
    }

    > span {
      font-size: 130%;
      color: #8c8c8c;
      padding-left: 0.35em;
    }
   }
`;

export const GraphWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100%;
`;

export const ModalMobile = styled.div<{ isModalOpen }>(
  ({ isModalOpen }) => `
  display:${isModalOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  background-color: ${colors.White};
  width: 100%;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
  transition: all .5s ease-in-out;

  @media (min-width: 768px) {
    display: none;
  }
`,
);

export const ModalTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Grey400};
`;

export const ModalTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 16px;
  svg {
    cursor: pointer;
  }
`;

export const ModalSection = styled.div`
  width: 100%;
  height: 80px;
  background: ${colors.Grey030};
  border-bottom: 2px solid ${colors.Grey100};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
`;

export const MobileWrapper = styled.div`
  display: block;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const DesktopWrapper = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

export const Text = styled.span`
  font-weight: bold;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
`;

export const MonthViewBtnText = styled.span`
  font-size: 1rem;
  line-height: 20px;
  color: ${colors.Black};
`;

export const CheckboxLine = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const ColoredLine = styled(LineIcon)(
  ({ color }) => `
  margin-left: 10px;
  color: ${color}
`,
);

export const DashedColoredLine = styled(DashedLineIcon)(
  ({ color }) => `
  margin-left: 10px;
  color: ${color}
`,
);

export const CardWrapper = styled.div`
  padding: 32px 24px;
  margin-top: 24px;
  background: ${colors.White};
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const CustomLabel = styled.text<{ angle }>`
  transform: rotate(${({ angle }) => (angle || -90)}deg);
`;

export const DateLabel = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const BtnExport = styled.div`
  cursor: pointer;
  color: #363BC4;
  padding: 14px 20px;
  border: 1px solid ${colors.GreyLight};
  margin-left: 10px;
  font-weight: 400;
  border-radius: 12px;
  height: 41px;
  display: flex;
  text-align: center;
  align-items: center;
  :hover {
    color: ${colors.White}
    background-color: #363BC4
    ${Text} {
      color: ${colors.White}
    }
  })
`;

export const BtnExportReduced = styled.div`
  cursor: pointer;
  color: #363BC4;
  padding: 14px 20px;
  border: 1px solid ${colors.GreyLight};
  margin-left: 10px;
  border-radius: 12px;
  height: 1px;
  display: flex;
  text-align: center;
  align-items: center;
  :hover {
    color: ${colors.White}
    background-color: #363BC4
  })
`;

export const ExportWorksheet = styled(ExportWorksheetIcon)(
  () => `
  padding-left: 10px;
  color: #363BC4;
`,
);

export const BtnMonthView = styled.div`
  cursor: pointer;
  color: #363BC4;
  padding: 14px 20px;
  border: 1px solid ${colors.GreyLight};
  margin-right: 20px;
  font-weight: 400;
  border-radius: 12px;
  height: 41px;
  display: flex;
  text-align: center;
  align-items: center;
  :hover {
    color: ${colors.White}
    background-color: #363BC4
    ${MonthViewBtnText} {
      color: ${colors.White}
    }
  })
`;

export const StyledLink = styled(Link)`
color: #363BC4;
font-family: 'Inter';
font-style: normal;
font-weight: 400;
font-size: 12px;
line-height: 12px;
text-decoration-line: underline;
display: block;
`;

export const InfoText = styled.p`
color: ${colors.Grey400};
font-family: 'Inter';
font-style: normal;
font-weight: 400;
font-size: 12px;
line-height: 12px;
display: block;
`;
