import styled from 'styled-components';

import {
  RadialChartIcon, ButtonPowerIcon, CronometerIcon, CalendarIcon,
} from '~/icons';
import { colors } from '~/styles/colors';

export const Card = styled.div`
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  margin-top: 24px;
`;

export const InputDate = styled.input`
  border: none;
  outline: none;
  font-size: 12px;
  line-height: 19px;
  border-radius: 8px;
  padding: 0px 0px 0px 14px;
  color: ${colors.Grey400};
  width: 100%;
`;

export const PowerGraphic = styled(ButtonPowerIcon)`
  width: 140px;
`;

export const RealTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  @media screen and (max-width: 700px) {
    display: none;
  }
`;

export const Title = styled.h3`
  font-size: 1em;
  font-weight: bold;
  color: ${colors.Grey400};
`;

export const ContainerInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 210px;
  margin: 24px 0 0 0;
`;

export const Timer = styled(CronometerIcon)`
  position: absolute;
  width: 140px;
  top: 4px;
  left: 30px;
  text-align: center;
`;

export const ContainerTimer = styled.div`
  display: flex;
  background: ${colors.White};
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;
`;

export const MarginWrapper = styled.div`
`;

export const Graphic = styled.div`
  position: relative;
`;

export const TextStyled = styled.span`
  font-weight: bold;
  font-size: 1em;
  line-height: 19px;
  color: ${colors.Grey400};
`;

export const TextDataTimer = styled(TextStyled)`
  position: absolute;
  left: 10%;
  top: 46%;
  width: 80%;
  text-align: center;
  font-weight: bold;
  font-size: 150%;
`;

export const TextDataPower = styled(TextStyled)`
  position: absolute;
  left: 20px;
  top: 90px;
  width: 99px;
  text-align: center;
  font-weight: bold;
  font-size: 1.5em;
`;

export const TextDataKwh = styled(TextStyled)`
  position: absolute;
  top: 86px;
  left: 30px;
  width: 99px;
  text-align: center;
  font-weight: bold;
  font-size: 1.5em;
`;

export const ElipseTimer = styled(RadialChartIcon)``;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
    color: #FFF
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

  .react-datepicker__year-wrapper {
    display: block !important;
  }

  .react-datepicker__year-text--selected, .react-datepicker__year-text--in-selecting-range, .react-datepicker__year-text--in-range {
    background-color: #363BC4;
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

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;
