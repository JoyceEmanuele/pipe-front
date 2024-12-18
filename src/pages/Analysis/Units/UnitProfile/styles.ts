import styled from 'styled-components';

import { CalendarIcon, ExportWorksheetIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { Select } from 'components';
import { Link } from 'react-router-dom';

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

export const ContainerSimcardsProfileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
  @media (max-width: 476px) {
    width: 100%;
  }
`;

export const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 12px;
  font-weight: bold;
`;

export const PageTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  color: ${colors.Black};
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

export const BtnFilter = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  padding: 14px 20px;
  border: 1px solid ${colors.BlueSecondary};
  margin-left: 10px;
  font-weight: 600;
  border-radius: 5px;
  height: 51px;
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-top: 7px;
  margin-left: 10px;
  text-decoration: underline;
  font-size: 11px;
`;

export const Text = styled.text`
color: ${colors.Black};
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
    color: ${colors.White};
    background-color: #363BC4;
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

export const CustomSelectDutsReference = styled(Select)`
  margin-top: 5px;
`;

export const ElevatedCard = styled.div`
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const TableBasic = styled.table`
  white-space: nowrap;
  thead {
    z-index: 0 !important;
  }
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

export const CustomSelect = styled(Select)`
  margin-bottom: 20px;
`;

export const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
`;

export const OverLay = styled.div`
  position: absolute;
  display: flex;
  background-color: #eceaea;
  width: 100%;
  height: 100%;
  z-index: 10000000;
  opacity: 0.4;
  filter: alpha(opacity=40);
  top: 0;
  left: 0;
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

export const ContainerDuts = styled.div`
  max-width: 80%;
  height: auto;
  padding: 10px;
  margin: 5px;
  border: 1px solid #DADADA;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const DutItemStyle = styled.div`
  display: flex;
  width: 100%;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
  svg {
    height: 20px;
  }
  div {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 10px;
    p {
    max-width: 50ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }
    h6 {
      font-size: 11px;
      font-weight: bold;
      min-width: 86px;
    }
  }
 @media (max-width: 926px) {
  div {
    width: 90%;
  }
 }
 @media (max-width: 700px) {
  div {
    width: 80%;
  }
 }
`;

export const HeaderVisibility = styled.div`
  display: flex;
  padding-left: 45px;
  padding-right: 60px;
  width: 100%;
  justify-content: space-between;
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
  color: #5B5B5B;
  p{
    margin-right: 29px;
    margin-bottom: 10px;
  }
  position: absolute;
  top: -21px;
`;

export const UnderlineBtn = styled.span`
  text-decoration: underline;
  color: ${colors.BlueSecondary};
  line-height: 12px;
  font-size: 12px;
  :hover{
    color: ${colors.Blue500};
  }
`;

export const Title = styled.h1`
  font-size: 1.5em;
  color: ${colors.Grey400};
`;

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const Data = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  align-items: start;
`;
export const DataText = styled.span<{ fontWeight? }>(
  ({ color = colors.Grey400, fontWeight = 'normal' }) => `
  font-size: 1em;
  font-weight: ${fontWeight};
  color: ${color};
`,
);

export const Separator = styled.div`
  width: 1px;
  background-color: #C4C4C4;
  display: flex;
  margin-left: 20px;
  margin-right: 20px;

  @media (max-width: 775px) {
    height: 1px;
    width: 100%;
    align-items: center;
    justify-content: center;
    margin-left: 0px;
    margin-right: 0px;
    margin-bottom: 20px;
  }
`;

export const DocumentationContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 218px;
  margin-bottom: 5px;
  overflow-x: hidden;
  overflow-y: scroll;
  border-radius: 5px;
  padding: 4px;
  border: 1px solid rgba(32, 35, 112, 0.20);
  background: #F8F8F8;
  div {
    display: flex;
    align-items: center;

    p {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0px;
    }
  }
  ::-webkit-scrollbar-track {
    background: #F8F8F8;
  }
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-radius: 5px;
    background: #F8F8F8;
    margin-left: 8px;
    text-align: center;
    h4 {
      color: #AEAEAE;
      font-family: Inter;
      font-size: 11px;
      font-style: normal;
      font-weight: 400;
      line-height: normal
    }
    h3 {
      color: #000;
      font-family: Inter;
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }
    svg {
      margin-bottom: 5px;
    }
  }
`;

export const ExibInvisibleFile = styled.p`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  svg {
    width: 10px;
    height: 10px;
  }
`;

export const DocumentationContainerArea = styled.div`
  width: 100%;
  h4 {
    color: #363BC4;
  }
  button {
    max-width: 100px;
  }
`;

export const SelectAndDownloadArea = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    align-items: center;
    p {
      margin: 0px;
    }
  }
`;

export const ItemDoc = styled.div`
  gap: 10px;
  padding: 10px;
  color: #464555;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  svg {
    width: 24px;
    height: 24px;
  }
  div {
    gap: 16px;
    div {
      svg {
      width: 14px;
      height: 14px;
      }
    }
  }
`;

export const ItemDocDelete = styled.div`
 gap: 10px;
  padding: 10px;
  color: gray;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  svg {
    width: 24px;
    height: 24px;
    color: gray;
  }
  div {
    gap: 16px;
    div {
      svg {
      width: 14px;
      height: 14px;
      }
    }
  }
`;

export const InibVisibilityAddDoc = styled.div`
  display: flex;
  margin: 0px 22px 22px;
  font-size: 12px;
  flex-direction: column;
  div {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 5px;
    p {
      margin: 0;
    }
    span {
      span {
        padding: 0;
        width: 10px;
        height: 10px;
        margin-left: 6px;
      }
      svg {
        width: 15px;
        height: 15px;
        margin-left: 6px;
      }
    }
    button {
      width: 200px;
    }
    h6 {
      color: blue;
      font-size: 10px;
      text-decoration: underline;
    }
  }
  section {
    display: flex;
    align-items: end;
    justify-content: space-between;
    margin-top: 10px;
    text-align: center;
    h3 {
      text-align: center;
    }
    button {
      width: 200px;
      padding: 5px;
    }
    h6 {
      color: blue;
      font-size: 11px;
      text-decoration: underline;
      margin: 0;
    }
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export const BoxResponsive = styled.div`
  width: 100%;
  display: flex;

  @media (max-width: 775px) {
    flex-direction: column;
  }
`;

export const EditAreaDocs = styled.div`
  height: 150px;
  border: 2px dashed #BFBFBF;
  margin: 22px 22px 22px 22px;
  align-items: center;
  justify-content: center;
  display: flex;
  gap: 5px;
  padding: 10px;
  textarea {
    width: 100%;
    height: 131px;
    border-radius: 3px;
    resize: none;
  }
`;

export const StyledLink = styled(Link)`
  color: ${(props) => props.color ?? colors.Grey400};
  margin: 0 8px 0 8px;
  &:hover {
    text-decoration: underline;
    color: ${colors.Blue300};
  }
`;

export const ObservationAreaContainer = styled.div`
  h4 {
    color: #363BC4;
  }
  && div:first-child {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
`;

export const TitleInfoObservation = styled.div`
  display: grid;
  grid-template: repeat(1, 1fr) / 3fr repeat(2, 1fr);
  padding-bottom: 10px;
  width: 100%;
  border-bottom: 1px solid #C4C4C4;
  span {
    color: #77818B;
    font-size: 10px;
    font-family: Inter;
    font-weight: 700;
  }
`;

export const ContainerObservationsItems = styled.div`
  display: grid;
  grid-template: repeat(1, 1fr) / 3fr repeat(2, 1fr);
  margin: 5px 0px;
  align-items: start;
  width: 100%;
  div {
    span {
      width: 95%;
    }
  }
  @media (max-width: 768px) {
    grid-template: repeat(1, 1fr) / repeat(2, 1fr);
    border-bottom: 1px solid lightgray;
  }
`;

export const ContainerEditDeleteObs = styled.div`
  display: flex;
  gap: 20px;
  .edit {
    width: 20px;
    height: 18px;
  }
`;

export const ContainerObservation = styled.div`
  display: flex;
  align-items: start;
  gap: 10px;
  justify-content: flex-start;
  width: 95%;
`;

export const TextObsUnit = styled.span`
display: -webkit-box;
overflow: hidden;
-webkit-box-orient: vertical;
`;

export const TextObsUnitExpand = styled.span`
display: -webkit-box;
overflow: hidden;
-webkit-box-orient: vertical;
`;

export const IconsContainerObs = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0px;

  }
`;

export const CustomInput = styled.div`
  span:first-of-type {
    top: calc(50% - 30px) !important;
  }

  span:nth-child(3) {
    top: 20% !important;
  }
`;

export const ContainerHtmlObs = styled.div`
  display: flex;
  flex-direction: column;
  ul {
    margin: 0px;
    padding-inline-start: 20px;
  }
  p {
    margin: 0px;
  }
`;

export const TextProgressBar = styled.span`
  flex-shrink: 0;
  vertical-align: middle;
  line-height: 42px;
  color: ${colors.Grey400};
`;
