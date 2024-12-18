import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import { CalendarIcon, ExportWorksheetIcon, ZoomOutIcon } from '../../icons';
import { CloseBtn } from '~/icons/CloseBtn';
import { ColorChangeBtn } from '../../icons/ColorChange';

import { colors } from '../../styles/colors';

export const Container = styled.div`
  display: flex;
  minHeight: 350px;
  position: relative;
  flex-wrap: wrap;
  @media (min-width: 992px) {
    flex-wrap: nowrap;
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

export const Text = styled.span`
  font-weight: normal;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
`;

export const StyledLink = styled(Link)`
  font-weight: normal;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
`;

export const CheckboxLine = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const TransparentLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
  :hover {
    color: ${colors.Black};
    text-decoration: none;
    cursor: pointer;
  }
`;

export const TransparentLinkDut = styled(Link)`
  width: 11%;
  padding-top: 11px;
  padding-left: 7px;
  padding-right: 15px;
  color: inherit;
  text-decoration: inherit;
  :hover {
    color: ${colors.Black};
    text-decoration: none;
    cursor: pointer;
  }
`;

export const IconWrapper = styled.div`
position: absolute;
display: inline-block;
width: 18px;
height: 18px;
right: 15px;
top: calc(50% - 12px);
svg {
  width: 18px;
  height: 18px;
}
`;

export const IconWrapperSearch = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-top: 15px;
  margin-right: 15px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  text-decoration: underline;
  font-size: 10px;
`;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 55px;
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
  .SingleDatePicker_picker {
    z-index: 999;
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

export const DateLabel = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 14px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 12px;
  font-weight: bold;
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

export const ZoomOut = styled(ZoomOutIcon)(
  () => `
  padding-left: 10px;
  color: #363BC4;
`,
);

export const ExportWorksheet = styled(ExportWorksheetIcon)(
  () => `
  padding-left: 10px;
  color: #363BC4;
`,
);

export const CloseBtnIcon = styled(CloseBtn)(
  () => `
  padding-left: 10px;
  color: #363BC4;
`,
);

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

export const OptionColor = styled.div`
  display: inline;
  border-radius: 4px;
  width: 26px;
  height: 22px;
  padding: 0 10px;
  background-color: ${(props) => props.color};
`;

export const StyledReactTooltip = styled(ReactTooltip)`
  opacity: 1 !important;
`;

export const ModalContent = styled.div`
  background-color: #fefefe;
  padding: 20px;
  width: 400px;
  height: 400px;
  border-radius: 10px;
`;

export const ColorChangeBtnSvg = styled(ColorChangeBtn)(
  () => `
    padding-left: 10px;
    color: #363BC4;
  `,
);

export const ColorChangeBtnWithHover = styled.div`
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

export const ListBoxOptionColor = styled.div`
  display: inline;
  border-radius: 4px;
  width: 20px;
  height: 6px;
  padding: 0 10px;
  background-color: ${(props) => props.color};
`;
