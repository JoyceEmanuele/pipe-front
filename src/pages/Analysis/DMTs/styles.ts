import { colors } from '~/styles/colors';
import styled from 'styled-components';
import { CalendarIcon } from '~/icons';
import { Link } from 'react-router-dom';

export const ExportBtn = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-radius: 10px;
  padding: 8px 10px;

  &:hover {
    cursor: pointer;
    background-color: ${colors.BlueSecondary};
    color: white;
    svg path {
      fill: white !important;
    }
  }
`;

export const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 6px;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
    color: white;
  }
  .react-datepicker__month-wrapper {
    display: flex;
    text-align: center;
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
  .react-datepicker__month .react-datepicker__month-text, .react-datepicker__month .react-datepicker__quarter-text {
    padding: 5px;
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

export const InfoItem = styled.div`
width: 150px;
margin-right: 10px;
margin-bottom: 30px;
`;

export const Title = styled.h1`
  font-size: 1.25em;
  color: #363BC4;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-top: 7px;
  text-decoration: underline;
  width: fit-content;
  font-size: 11px;
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
  border: 0.7px solid ${colors.GreyInputBorder};
`;

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  &:hover {
    color: ${colors.Grey300};
  }
`;

export const ContainerInfoUsageIndex = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  gap: 10px;
`;

export const ContainerCardDmtUsage = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-size: 14px;
  justify-content: space-between;
  gap: 10px;
  margin: 0px 73px;
  margin-bottom: 20px;
  @media (max-width: 767px) {
    margin: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid lightgray;
    padding-bottom: 10px;
  }
`;
