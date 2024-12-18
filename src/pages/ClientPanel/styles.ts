import styled from 'styled-components';
import { colors } from '~/styles/colors';
import { CalendarIcon, ExportWorksheetIcon } from '~/icons';
import {
  Button,
} from 'components';
import { Link, NavLink } from 'react-router-dom';

export const InfoSIMCARD = styled.div`
  min-width: 90px;
  p {
    color: #000;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
  }
  label {
    font-size: 11px;
    color: #202370;
    font-weight: 700;
  }
`;

export const ContainerIconsSimcard = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 476px) {
    width: 100%;
    border-bottom: 1px solid rgba(197, 197, 197, 0.56);
  }
`;

export const ContainerDescEditSim = styled.div`
  border-right: 1px solid rgba(197, 197, 197, 0.56);
  display: flex;
  gap: 10px;
  padding-right: 20px;
  margin-left: 20px;
  @media (max-width: 476px) {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    border-right: unset;
  }
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

export const ModalContainer = styled.div`
  width: 100%;
  border-radius: 4px;
`;

export const FakeLink = styled.span`
  color: black;
  text-decoration: underline;
  cursor: pointer;
`;

export const Title = styled.span`
  font-size: 14px
  font-weight: bold;
  color: #4c4c4c;
`;

export const ConsumptionContainer = styled.span`
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  width: 625px;
  justify-content: space-between;
  height: 600px;
  marginLeft: 5px;
`;

export const ConsumptionRow = styled.span`
  display: flex;
  flex-direction: row;
  width: 100%;
  marginLeft: 5px;
`;

export const DateRow = styled.span`
  display: flex;
  flex-direction: row;
  width: 370px;
  marginLeft: 5px;
`;

export const InputLabel = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 5px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const DateLabel = styled.span`
  width: 30px;
  transition: all 0.2s
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const InputText = styled.input`
margin-left: 3px;
type: text;
border: none;
outline: none;
borderBottom: none;
width: 100px;
::-webkit-inner-spin-button{
  -webkit-appearance: none;
  margin: 0;
}
::-webkit-outer-spin-button{
  -webkit-appearance: none;
  margin: 0;
}
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

export const Form = styled.form`
  display: flex;
  width: '100&';
  flex-direction: column;
  `;
export const CicleDetailContainer = styled.form`
  margin: -28px 10px;
  display: flex;
  width: 570px;
  flex-direction: column;
  padding-right: 15px;
`;
export const TitleSelectRow = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const CustomInputCicle = styled.div`
  font-size: 12px;
  color: #000;
  width: 45%;
  border: 1px solid ${colors.Grey030};
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  border: 1px solid ${colors.GreyLight};
`;

export const CicleInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CicleInfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 15px;
`;

export const CicleDateInfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-top: 15px;
`;

export const ItemRow = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export const ItemDateRow = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export const ItemTitle = styled.div`
  width: 120%;
  color: #202370;
  font-weight: bold;
  font-size: 14px;
`;
export const ItemSubTitle = styled.div`
  font-size: 12px;
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-top: 15px;
  margin-right: 15px;
  cursor: pointer;
  position: relative;
  top: -10px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const IconWrapperView = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  position: relative;
  margin-right: 15px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Content = styled.div`
  width: 90%;
  position: relative;
  margin: 30px 80px 40px;
  display: flex;
  justify-content: space-between;
  @media (max-width: 568px) {
    flex-direction: column;
    margin: 20px 10px;
    align-items: center;
  }
`;

export const BaseLinesBool = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: bold;
  font-size: 16px;
  margin-left: 15px;
  margin: 30px;
  width: 100px;
  height: 30px;
  border: solid 1x black;
`;

export const ContentEnergyMeter = styled.div`
  position: relative;
  display: flex;
  margin: 30px 100px 40px;
  justify-content: space-between;
  gap: 40px;
  flex-direction: column;

  @media (max-width: 568px) {
    margin: 20px 10px;
    align-items: center;
  }
`;

export const Text = styled.text`
color: ${colors.Black};
`;

export const Unit = styled.div`
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  background-color: #F2F0F0;
  font-size: 13px;
  text-align: center;
  color: #818181;
  height: 25px;
  margin-left: 3px;
  padding-left: 7px;
  padding-right: 7px;
`;

export const Test = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  width: 35%;
  height: 50px;
  padding: 8px;
`;

export const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  width: 95%;
  height: 50px;
`;

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
  font-weight: 400;
  border-radius: 12px;
  height: 41px;
  display: flex;
  text-align: center;
  align-items: center;
  width: fit-content;
  :hover {
    color: ${colors.White}
    background-color: #363BC4
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

export const ModalTitle2 = styled.div`
  color: black;
  font-weight: bold;
  font-size: 1rem;
`;

export const IconWrapper2 = styled.div`
  cursor: pointer;
`;

export const SectionContainer = styled.div`
  padding: 15px 22px 22px 15px;
`;

export const SimpleButton = styled(Button)`
  width: initial;
  padding: 8px 15px;
  margin: 7px 7px;
`;

export const SeeAssociationGroups = styled.p`
color: black;
text-decoration: underline;
cursor: pointer;
margin-top: 0;
margin-bottom: 0;
`;

export const ModalDesktop = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

export const Container = styled.div`
`;

export const MobileWrapper = styled.div`
  top: 0;
  left: 0;
  display: block;
  position: fixed;
  background-color: ${colors.White};
  width: 100%;
  height: 100vh;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.5s ease-in-out;

  @media (min-width: 568px) {
    display: none;
  }
`;

export const ModalSection = styled.div`
  width: 100%;
  height: 80px;
  background: ${colors.Grey030};
  border-bottom: 2px solid ${colors.Grey100};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
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

export const ModalTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Grey400};
`;

export const ModalCancel = styled.p`
  cursor: pointer;
  font-size: 1em;
  color: ${colors.Grey200};
  text-decoration: underline;
  width: 140px;
  text-align: left;
  margin-top: 10px;
  margin-left: 5px;
  &:hover {
    color: ${colors.Blue400};
  }
`;
export const ModalDisassociate = styled.p`
  cursor: pointer;
  font-size: 1em;
  color: ${colors.Red};
  text-decoration: underline;
  width: 140px;
  text-align: left;
  margin-top: 10px;
  margin-left: 5px;
  &:hover {
    color: ${colors.Blue400};
  }
`;

export const EditCicleContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 750px;
  justifyContent: space-between;
  padding: 5%;
`;

export const ModelRateContainer = styled.div`
  display: flex;
  flex-drection: row;
  width: 400px;
  padding-top: 20px;
  justify-content: space-between;
  margin-left: 5px;
`;

export const CancelButton = styled.div`
  text-decoration: underline;
  color: #6C6B6B;
`;

export const RateGroupsTitle = styled.div`
  color: #202370;
  font-weight: bold;
`;

export const ContentTab = styled.div`
display: flex;
align-items: center;
padding: 0;
height: 35px;
max-width: 100%;
border-bottom: 2px solid ${colors.Grey100};
justify-content: space-between;
margin-bottom: 10px;
margin-top: 25px;
@media (max-width: 768px) {
  height: 50px;
  overflow-x: scroll;
}
`;

export const StyledList = styled.ul`
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
list-style: none;
padding: 0;
li:not(:first-child) {
  margin-left: 32px;
}
.active {
  color: ${colors.Blue300}; // texto nav maior
}
`;

export const StyledItem = styled.li`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
white-space: nowrap;
`;

export const StyledName = styled.span<{ isActive: boolean }>(({ isActive }) => `
color: ${isActive ? colors.Blue300 : colors.Grey500};
font-size: 14px;
font-weight: bold;
text-decoration: none;
margin-top: 10px;
  :hover {
    color: ${colors.Blue300};
  }

`);

export const ModalTitle3 = styled.div`
  color: black;
  font-weight: bold;
  font-size: 0.9rem;
`;

export const LabelSwitch = styled.span`
  display: inline-block;
  max-width: 70px;
  font-size: 14px;
  @media (max-width: 400px) {
    font-size: 9px;
  }
`;

export const CloseBtn = styled.span`
  color: ${colors.Blue200};
  text-decoration: underline;
  font-size: 10px;
  :hover {
    color: ${colors.Blue400};
  }
`;

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  margin: 0 8px 0 8px;
`;

export const CustomInputConstructedArea = styled.div`
  span:nth-child(3) {
    top: 30% !important;
  }
`;
