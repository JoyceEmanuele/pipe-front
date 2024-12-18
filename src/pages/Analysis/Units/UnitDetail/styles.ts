import styled from 'styled-components';
import { CalendarPlusIcon } from '~/icons';

import { colors } from '~/styles/colors';

export const VarsCardTitle = styled.div`
  font-weight: bold;
  padding-bottom: 15px;
`;
export const VarName = styled.div`
  font-weight: bold;
  color: #5b5b5b;
`;
export const VarValue = styled.span<{ relevance?: number | string }>`
  font-weight: bold;
  font-size: ${(props) => (props.relevance === 2 || props.relevance === '2' ? '100%' : '150%')};
`;
export const VarUnit = styled.span<{ relevance?: number | string }>`
  font-size: ${(props) => (props.relevance === 2 || props.relevance === '2' ? '85%' : '130%')};
  color: #8c8c8c;
  padding-left: 0.35em;
`;
export const CardContainer = styled.div`
  margin: 15px;
`;
export const VarContainer = styled.div`
  margin: 10px 0 10px 15px;
  min-width: 230px;
`;

export const CardElev = styled.div`
  margin-top: 24px;
  border-radius: 8px;
  border: 1px solid ${colors.Grey100};
`;

export const RealTimeBox = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Bluebar = styled.div`
  border-radius: 8px 8px 0 0;
  background-color:  ${colors.Blue300};
  height: 20px;
  width: 100%;
`;

export const ConteinerTitle = styled.div`
  margin: 5px 0 10px 15px;
  min-width: 230px;

  h1 {
    color: black;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

export const ContentRealTime = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 4rem 2rem 10rem;
  width: 400px;

    h3 {
      color: #8c8c8c;
      font-weight: bold;
    }

    span {
      display: flex;
      flex-direction: row;
      color: black;
      font-size: 1.7rem;
      font-weight: bold;

      p {
        color: #8c8c8c;
      }
    }
`;

export const MachineHeaderContainer = styled.div`
display: flex;
flex-wrap: wrap;
flex: 1;
align-items: flex-start;
justify-content: space-between;

.input-container {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  max-width: fit-content;

  > div {
    height: 50px;
    min-width: 250px;
  }

  > div + div {
    height: 50px;
  }
}
`;

export const ViewModeButton = styled.button<{ isActive: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90px;
  height: 32px;
  background-color: #ffffff;

  border: ${(props) => (props.isActive ? '2px solid #363bc4' : 0)};
  border-radius: 5px;

  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.isActive ? '#363BC4' : '#7A7A7A')};

  > span {
    margin-right: 4px;
  }

  & + & {
    margin-left: 10px;
  }

  transition: filter 0.3s;

  &:hover {
    filter: brightness(0.9);
  }
`;

export const SearchInput = styled.div`
  min-height: 48px;
  max-width: 250px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #818181;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
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

export const Link = styled.div`
  font-size: 11px;
  line-height: 13px;
  color: #363BC4;
  text-decoration: underline;

  margin-top: 6px;

  cursor: pointer;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 500px;
  height: 350px;
  border-radius: 5px;
  outline: 1px solid #D7D7D7;
  padding: 30px 45px 30px 45px;
  align-items: center;
  content-align: center;
  justify-content: space-evenly;
`;

export const CardTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  text-align: left;
  width: 100%;
`;

export const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SubTitle = styled.div`
  font-size: 17px;
`;

export const Title = styled.div`
  font-weight: bold;
  font-size: 23px;
  padding-bottom: 1px;
`;

export const DevId = styled.div`
  color: grey;
  font-size: 17px;
  width: 230px;
  padding-top: 8px;
`;

export const Phrase = styled.div`
  font-size: 19px;
`;

export const ConfirmContainer = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: center;
  width: 100%;
`;

export const ConfirmStatus = styled.div`
  font-size: 18px;
  color: white;
  display: flex;
  background-color: #363BC4;
  justify-content: center;
  align-items: center;
  width: 180px;
  height: 56px;
  border-radius: 13px;
`;

export const DenyStatus = styled.div`
  font-size: 18px;
  display: flex;
  color: #363BC4;
  justify-content: center;
  align-items: center;
  width: 180px;
  height: 56px;
  border: solid 3px #363BC4;
  border-radius: 13px;
`;

export const CancelButton = styled.span`
  display: flex;
  width: max-content;
  padding: 10px;
  font-family: 'Inter';
  font-size: 11px;
  line-height: 13px;
  color: #6C6B6B;
  text-decoration-line: underline;
`;

export const OptionExportReport = styled.a`
  display: flex;
  height: 120px;
  width: 230px;
  border: 1px solid rgba(197, 197, 197, 0.56);
  border-radius: 5px;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding-inline: 20px;
  background-color: black;

  font-family: 'Inter';
  font-size: 13px;
  line-height: 16px;
  color: black;
  span{
    display: flex;
    gap: 5px;
  }
`;

export const HoverExportReport = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 247px;
  padding-inline: 20px;
  padding-block: 15px;
  /* border-radius: 5px; */
  gap: 5px;
  color: white;
  strong{
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 15px;
  }
  span{
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;

  }
`;

export const StyledCalendarIcon = styled(CalendarPlusIcon)`
  position: absolute;
`;

export const ContainerDate = styled.div`
    display: flex;
    border: 1px solid rgba(197, 197, 197, 0.56);
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    padding-block: 5px;
  `;

export const DateLabel = styled.span`
  transition: all 0.2s;
  margin-left: 14px;

  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
  color: #373737;
`;

export const DividerDate = styled.div`
  margin-inline: 15px;
  height: 36px;
  width: 2px;
  background-color: rgba(0, 0, 0, 0.17);
`;

export const ContentDate = styled.div`
  position: relative;
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
    bottom: -60px;
    left: 50px;
    z-index: 999;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .SingleDatePicker {
    display: block;
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
    color: ${colors.White};
    border: 1px solid #F4EBEB;
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

export const VisualizationMode = styled.div`
  h4 {
    font-size: 14px;
    font-family: Inter;
    font-weight: 700;
    margin-bottom: 10px;
  }
`;

export const AreaCheck = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  p {
    margin: 0;
  }
`;

export const AreaRadio = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  p {
    margin: 0;
  }
`;

export const ContainerCheckbox = styled.div`
  display: flex;
  width: 50%;
  justify-content: space-between;
  margin-bottom: 30px;
`;

export const ContainerCheckboxWithRadio = styled.div`
  width: 100%;
  margin-bottom: 30px;
  gap: 5px;
  p {
    margin: 0;
  }
`;
