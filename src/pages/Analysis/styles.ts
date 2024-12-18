import styled, { keyframes } from 'styled-components';
import { colors } from '../../styles/colors';
import { Flex, Box } from 'reflexbox';
import { Link } from 'react-router-dom';

export const IconWrapperHealth = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: 12px;
    height: 12px;
  }
`;

export const TempColor = styled.div`
display: flex;
flex-direction: column;
width: 30px;
justify-content: space-between;
align-items: center;
`;

export const RowTemp = styled.div`
margin: 3px;
width: 110px;
display: flex;
flex-direction: row;
align-items: left;
`;

export const RowHealth = styled.div`
margin: 3px;
width: auto;
display: flex;
flex-direction: row;
align-items: left;
`;

export const ExpandBtn = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
flex-direction: row;
width: 90%;
height: 58px;
cursor: pointer;
`;

export const ExpandAll = styled.div`
display: flex;
justify-content: center;
align-items: center;
width: 21px;
height: 21px;
background-color: white;
border-radius: 7px;
cursor: pointer;
`;

export const EnvironmentBox = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const StyledFlex = styled(Flex)`
  border-bottom: 2px solid ${colors.Grey050};
`;
export const StyledBox = styled(Box)`
  border-right: none;
  @media (min-width: 360px) {
    border-right: 2px solid ${colors.Grey050};
  }
`;

export const CardMachine = styled.div`
  border-radius: 16px;
  padding: 24px 2px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  margin: 0 8px 0 8px;
`;
export const DesktopTable = styled.div<{ verifyMobile?: boolean }>`
  ${({ verifyMobile }) => (verifyMobile ? `
  @media (max-width: 1170px) {
    display: block;
    width: 100%;
    overflow-y: hidden;
  }
  ` : `
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
  `)}
`;
export const MobileTable = styled.div`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;
export const StyledSpan = styled.span(
  (fontWeight) => `
  color: ${colors.Grey400};
  margin-right: 8px;
  font-weight: ${fontWeight || 'normal'};
`,
);
export const IconWrapper = styled.div`
  padding: 5px 0 5px 0;
  display: flex;
`;
export const HealthIconBox = styled.div(
  ({ color = colors.White }) => `
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-width: 24px;
  height: 24px;
  background-color: ${color};
  padding 3px;
  border-radius: 6px;
  svg {
    min-width: 24px;
    min-height: 24px;
    max-width: 24px;
    max-height: 24px;
  }
`,
);
export const SearchInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  margin-left: 16px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  align-items: center;
`;

export const ButtonClear = styled.button`
  background-color: transparent;
  border: unset;
  cursor: pointer;
  span {
    text-decoration: underline;
    font-size: 12px;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const AlertTextParameters = styled.div`
  opacity: 1;
  animation: ${fadeOut} 4s ease-in-out forwards;
  display: flex;
  align-items: center;
  color: rgba(160, 160, 160, 1);
  font-size: 12px;
  gap: 5px;
`;

export const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 1px;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;

export const DielTool = styled.div`
  display: flex;
  flex-flow: row nowrap;
  min-width: 120px;
  margin-left: 16px,
`;

export const BtnInput = styled.button`
display: flex;
align-items: center;
justify-content: center;
background-color: white;
width: 32px;
height: 30px;
margin-right: 10px;

border: 1px solid  rgba(0, 0, 0, 0.15);
cursor: pointer;
border-radius: 5px;
box-shadow: 0 0.3em 0.3em rgba(0, 0, 0, 0.09);
transition: all 0.5s ease-in;
&:hover {
   background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  }
`;

export const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 60px;
  max-height: 60px;
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

export const WrapperDesktop = styled.div`
display: none;
@media (min-width: 768px) {
  display: block;
}
`;

export const WrapperMobile = styled.div`
display: block;
@media (min-width: 768px) {
  display: none;
}
`;

export const SelectedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  height: 25px;
  margin-top: 10px;
  min-width: 40%;
  max-width: 70%;
  border-radius: 5px;
`;

export const IconWrapperSelect = styled.div<{ disabled }>(({ disabled }) => `
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  ${disabled ? 'cursor: not-allowed;' : 'cursor: pointer;'}
`);

export const Selected = styled.span`
  font-weight: bold;
  font-size: 0.75em;
  margin-left: 5px;
  color: ${colors.Blue300};
`;
