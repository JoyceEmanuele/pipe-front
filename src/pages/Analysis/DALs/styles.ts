import styled from 'styled-components';
import { CalendarIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const InfoItem = styled.div`
width: 150px;
margin-right: 20px;
margin-bottom: 30px;

@media (max-width: 767px) {
  margin-bottom: 0;
}
`;

export const TableNew2 = styled.table`
width: 100%;
white-space: nowrap;
border-collapse: collapse;
& tbody {
  & tr {
    height: 35px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  & td {
    text-align: left;
    color: ${colors.DarkGrey};
    padding: 0 10px;
  }
}
& thead {
  & tr {
    height: 40px;
    display: table-row;
    border-bottom: solid 1px ${colors.Grey};
  }
  & th {
    flex: 1;
    text-align: left;
    align-items: center;
    padding: 0 10px;
    word-break: normal;
  }
}
`;

export const Title = styled.h1`
  font-size: 1.25em;
  color: #363BC4;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const NotyIconStyle = styled.div`
  width: 180px;
  position: relative;
  display: inline;
`;

export const NotyNumStyle = styled.div`
  position: absolute;
  right: 0px;
  top: -10px;
  background-color: #363BC4;
  font-size: 11px;
  color: white;
  display: inline;
  padding: 2px 8px;
  border-radius: 25px;
  font-weight: bold;
`;

export const ControlButton = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: 160px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
`;

export const ControlButtonIcon = styled.img<{ isActive?: boolean, status?: string }>`
  width: 13%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
  ${({ status }) => (status === 'ONLINE' ? '' : 'filter: contrast(0)')};
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-top: 7px;
  text-decoration: underline;
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

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const IconWrapper = styled.div<{ width?, height? }>(
  ({ width, height }) => `
  display: inline-block;
  width: ${width || '19'}px;
  height: ${height || '25'}px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: ${width}px;
    height: ${height}px;
  }
`,
);

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

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
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

export const InfoGraphCont = styled.div`
  @media only screen and (max-width: 1050px) {
    width: 100%;
    margin-left: 0px;
  }
  width: 60%;
  margin-left: 40px;
`;

export const ButtonAddAssociationsDal = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 200px;
  @media (max-width: 767px) {
    width: 100%;
    margin-bottom: 40px;
  }
`;

export const ContainerInfoIlumItem = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-right: 10px;
  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export const ContainerUseIndex = styled.div`
 margin: 30px;
 @media (max-width: 767px) {
    margin: 10px;
 }
`;

export const TextPNoMargin = styled.p`
  font-weight: bold;
  font-size: medium;
  @media (max-width: 767px) {
    font-size: small;
  }
`;

export const TextPMargin = styled.p`
  font-weight: bold;
  font-size: medium;
  margin: 30px;
  @media (max-width: 767px) {
    font-size: small;
    margin: 0px;
  }
`;

export const ContainerInfoIndexUse = styled.div`
  display: flex;
  margin-bottom: 15px;
  margin-left: 28px;
  flex-wrap: wrap;
`;

export const ContainerWithBorderInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  @media (max-width: 767px) {
    border-bottom: 1px solid #D1D1D1;
    width: 100%;
    margin: 20px 0px;
    padding: 0px 20px;
  }
`;

export const ContainerGraphicIndexUsage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 7px solid ${colors.BlueSecondary};
  border: 1px solid #d7d7d7;
  padding: 30px;
  margin: 10px 0px;
  @media (max-width: 767px) {
    padding: 15px;
  }
`;

export const ContainerDalTree = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  border-right: 1px solid lightgray;
  width: 30%;
  @media (max-width: 1270px) {
    width: 100%;
  }
`;

export const ContainerInfoDalProfoile = styled.div`
  display: flex;
  width: 70%;
  @media (max-width: 1270px) {
    width: 100%;
  }
`;

export const FlexRowColumn = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export const FlexRowColumn1250 = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  @media (max-width: 1250px) {
    flex-direction: column;
  }
`;
