import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';
import { CalendarIcon } from '~/icons';

export const Container = styled.div``;

export const SelectContainer = styled.div`
font-weight: bold;
position: fixed;
background: white;
border: 2px solid #d3d3d3;
border-radius: 10px;
box-shadow: 5px 6px 11px rgba(0,0,0,0.24), 0px 14px 15px rgba(0,0,0,0.12);
`;

export const LoaderContainer = styled.div`
position: absolute;
left: 0;
top: 0;
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
z-index: 2;
background-color: rgba(255, 255, 255, 0.5);
`;

export const Scroll = styled.div`
overflow-x: auto;
`;

export const FaultsRow = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
justify-content: space-around;
`;

export const StyledLink = styled(Link)`
color: ${colors.LightBlue};
`;

export const TransparentLink = styled(Link)`
color: inherit;
text-decoration: inherit;
`;

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

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const ContainerDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
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

export const TitleLabel = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const CheckboxDay = styled.div`
  display: flex;
  margin-top: 5px;
`;

export const Text = styled.span`
  font-weight: normal;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
  margin-left: 5px;
`;
