import { colors } from '~/styles/colors';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    width: 134px;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  gap: 8px;

  h1 {
    margin: 0;

    color: #000;

    font-family: Inter;
    font-size: 14px;
    font-weight: 700;
  }

  p {
    margin: 0;

    color: #4B4B4B

    font-family: Inter;
    font-size: 12px;
    font-weight: 400;
  }
`;

export const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;

  height: 33px;
  width: min-content;
  border: 0.8px solid #C5C5C58F;
  border-radius: 8px;

  padding-left: 12px;

  input {
    border: none;
    outline: none;
    border-radius: 8px;

    color: #000000;

    font-family: Inter;
    font-size: 12px;
    font-weight: 400;

    &::placeholder {
      color: #000000;

      font-family: Inter;
      font-size: 12px;
      font-weight: 400;
    }
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 33px;
    height: 33px;

    svg {
      width: 13px;
      height: 13px;

      path {
        fill: #363BC4;
      }
    }
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: 5px;
`;

export const TabOption = styled.span<{active?: boolean}>`
  position: relative;

  width: 176px;
  height: 34px;

  padding: 8px 25px;

  border-radius: 8px 8px 0 0;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-bottom: none;

  color: ${colors.Black};

  text-align: center;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;

  ${({ active = false }) => {
    if (active) {
      return css`
        background-color: white;
      `;
    }

    return css`
      background-color: #F4F4F4;
      cursor: pointer;
    `;
  }}
`;

export const ModelListContainer = styled.div`
  overflow-y: scroll;

  background-color: #f9f9f9;
  border: 1px solid #e3e3e3;
  border-bottom-left-radius: 7px;
  border-bottom-right-radius: 7px;

  display: flex;
  flex-direction: column;
  gap: 8px;

  height: 195px;
  max-height: 195px;
  padding: 12px;
`;

export const ModelRow = styled.div<{isSelected?: boolean}>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px 12px;
  border: 1px solid #68686833;
  border-radius: 5px;

  background: #FFFFFF;

  cursor: pointer;

  p {
    margin: 0;

    color: #464555;

    font-family: Inter;
    font-size: 12px;
    font-weight: 500;
  }

  svg {
    cursor: pointer;
  }

  ${({ isSelected = false }) => isSelected && css`
    background: #363BC4;

    cursor: unset;

    p {
      color: #FFFFFF;
    }

    svg {
      path {
        stroke: #FFFFFF;
      }
    }
  `}
`;

export const EmptyContent = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;

    p {
      width: 214px;
      margin: 0;

      color: #818181;

      font-family: Inter;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }
`;

export const TitleSectionDropdown = styled.div<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 4px 8px;

  width: max-content;

  border: 0.8px solid rgba(80, 80, 80, 0.17);
  border-radius: 8px;

  box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.03);

  cursor: pointer;

  span {
    color: #000000;

    font-family: Inter;
    font-size: 12px;
    font-weight: 400;
    text-align: center;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    width: 7.5px;
    height: 7.5px;
  }

  ${({ isOpen = false }) => !isOpen && css`
    div {
      transform: rotate(270deg);
    }
  `}
`;

export const DateExportRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  position: relative;
`;

export const ResultContainerOverlay = styled.div`
  height: 80%;
  width: 100%;

  position: absolute;
  top: 0;

  background-color: white;

  opacity: 0.6;
`;

export const AnalisysResult = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NoAnalisysSelected = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    border: 1px solid #0000000F;
    border-radius: 10px;

    background: #F9F9F9;

    height: 273px;

    color: #7D7D7D;

    span {
      margin: 0;

      font-family: Inter;
      font-size: 13px;
      font-weight: 700;
      text-align: center;
    }

    p {
      margin: 0;

      font-family: Inter;
      font-size: 10px;
      font-weight: 500;
      text-align: center;
    }
`;

export const DateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .DayPicker {
    z-index: 300;

    position: absolute;
    top: 200%;
    left: 0%;
  }
  .DayPickerKeyboardShortcuts_buttonReset {
    &::before {
      display: none;
    }
  }
  .CalendarMonth_caption {
    color: #000;
    text-transform: capitalize;
  }
  .CalendarDay__selected {
    background: #363BC4;
    border-color: #363BC4;
    font-weight: bold;
  }
  .CalendarDay__selected:hover {
    background: #363BC4;
    border-color: #363BC4;
  }
  .CalendarDay__selected_span {
    background: #D0D2F1;
    border: 1px double #F4EBEB;
    color: #000;
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    display: none;
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
`;

export const DateButton = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  width: max-content;
  height: 30px;
  min-height: 30px;
  position: relative;

  display: flex;
  gap: 8px;
  align-items: center;

  padding: 0 12px;

  border: 1px solid #C5C5C58F;
  border-radius: 8px;

  cursor: pointer;

  p {
    margin: 0;
    color: #000;

    font-family: Inter;
    font-size: 12px;
    font-weight: 400;
  }

  ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);

export const DateButtonActions = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    margin: 0;
    color: #363BC4;

    font-family: Inter;
    font-size: 11px;
    text-decoration: underline;
    cursor: pointer;
  }
    ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);

export const StatusColor = styled.div<{color?: string}>`
  width: 11px;
  height: 11px;
  border-radius: 3px;

  ${({ color = '#00A74A' }) => css`
    background: ${color}
  `}
`;

export const ResultsResume = styled.div`
  display: flex;
  align-items: start;
  justify-content: center;

  gap: 40px;

  border-radius: 9px;
  border: 1px solid #e3e3e3;

  background-color: #f9f9f9;

  width: 100%;
  height: 100%;
`;

export const ResultsContent = styled.div`
  height: 100%;
  padding: 22px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  p{
    text-align: center;
    margin: 0;
  }
`;

export const ResultsContentEF = styled.div<{ qtdCharacteres?: number }>`
  height: 100%;
  padding: 22px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  p{
    text-align: center;
    margin: 0;
  }

  ${({ qtdCharacteres }) => qtdCharacteres === 1 && css`
    max-width: 145px;
    width: 100%;
  `}

  ${({ qtdCharacteres }) => qtdCharacteres === 2 && css`
    max-width: 175px;
    width: 100%;
  `}

  ${({ qtdCharacteres }) => qtdCharacteres === 3 && css`
    max-width: 240px;
    width: 100%;
  `}

  ${({ qtdCharacteres }) => qtdCharacteres === 4 && css`
    max-width: 330px;
    width: 100%;
  `}
`;

export const EnergyEfficiencyItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
`;

export const EnergyEfficiencyBar = styled.div<{
  barColor: string;
  barHeight: string;
}>`
  width: 14px;
  border-radius: 0 0 3px 3px;
  display: flex;
  justify-content: center;
  align-items: start;
  ${({ barColor, barHeight }) => css`
    background: ${barColor};
    height: ${barHeight};
  `}
  font-size: 10px;
  font-weight: 500;
  color: #000000;
  margin: 0;
`;

export const ExportButton = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  padding: 5px;
  display: flex;
  flex-direction: row;
  width: 97px;
  height: max-content;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  border-radius: 11px;
  border: 1px solid;
  border-color: #e3e3e3;
  cursor: pointer;

    ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);

export const ShowProblemDataWrapper = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 4px;
`;

export const NoInfoTooltip = styled.div`
  display: flex;
  gap: 8px;
  max-width: 172px;

  div {
    display: flex;
    flex-direction: column;
    gap: 8px;

    max-width: 142px;
  }

  span {
    margin: 0;
    color: #FFFFFF;

    font-family: Inter;
    font-size: 12px;
    font-weight: 700;

    white-space: normal;
  }

  p {
    margin: 0;
    color: #FFFFFF;

    font-family: Inter;
    font-size: 11px;
    font-weight: 400;

    white-space: normal;
  }
`;

export const UnitLink = styled(Link)`
  color: #000000;

  font-family: Inter;
  font-size: 12px;
  font-weight: 400;
  text-decoration: underline;
`;

export const NoInfoIcon = styled.span`
  display: flex;
  justify-content: center;
`;

export const LoaderOverlay = styled.div`
  position: absolute;
  top: 0;

  background-color: ${`${colors.Grey030}99`};

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  width: 100%;
  height: 100%;
`;

export const TableWrapper = styled.div`
  padding: 20px 29px 20px 21px;
`;

export const SelectOptionStyled = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;

  height: 41px;
  width: 100%;

  border: none;
  background: transparent;
  padding: 10px;

  border-left: 5px solid transparent;

  ${({ selected }) => selected
    && css`
      border-left: 5px solid #363BC4;
    `}
`;
