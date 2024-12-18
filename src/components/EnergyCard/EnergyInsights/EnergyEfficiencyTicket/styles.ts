import styled, { css } from 'styled-components';

export const EnergyEfficiencyTicketStyled = styled.div<{
  isSelected?: boolean;
}>`
  width: 100%;

  display: flex;
  align-items: center;

  border: 1px solid #ededed;
  border-radius: 10px;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.07);

  ${({ isSelected }) => !isSelected
    && css`
      border: 1px solid #d9d9d9;
    `}
`;

export const EnergyEfficiencyTicketData = styled.div`
  min-width: 52px;

  display: flex;
  flex-direction: column;
  align-items: end;

  padding: 2px 8px;

  cursor: pointer;

  p {
    font-family: Inter;
    font-size: 19px;
    font-style: normal;
    font-weight: 700;
    line-height: 18px;
    text-align: right;

    white-space: nowrap;

    color: #000000;

    margin: 0;
  }

  span {
    font-family: Inter;
    font-size: 8px;
    font-style: normal;
    font-weight: 400;
    line-height: 8.47px;
    text-align: right;

    white-space: nowrap;

    color: #676767;

    margin: 0;
  }
`;

export const EnergyEfficiencyBar = styled.div<{
  barColor: string;
  barWidth: string;
  isSelected?: boolean;
  isActivate?: boolean;
}>`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: start;

  padding: 2px 8px;

  border-radius: 0 9px 9px 0;
  cursor: pointer;

  ${({ isSelected }) => !isSelected
    && css`
      background: #e7e7e7;
    `}

  ${({ isActivate }) => !isActivate
  && css`
    cursor: not-allowed;
  `}

  div {
    height: 15px;
    border-radius: 0 6px 6px 0;
    display: flex;
    justify-content: end;
    align-items: center;
    padding: 0 8px;

    ${({ barColor, barWidth }) => css`
      background: ${barColor};
      width: ${barWidth};
    `}

    span {
      font-size: 10px;
      font-weight: 500;
      color: #000000;
      margin: 0;
    }
  }
`;
