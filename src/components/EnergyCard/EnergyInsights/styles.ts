import styled, { css } from 'styled-components';

export const Content = styled.div`
  height: 375px;

  display: flex;
  justify-content: center;
  gap: 12px;

  padding: 20px 0 0 0;
`;

export const EnergyEfficiencyStyled = styled.div`
  min-width: 200px;

  @media (min-width: 1473px) {
    min-width: 240px;
  }

  @media (min-width: 1553px) {
    min-width: 280px;
  }

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const EnergyEfficiencyHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3{
    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
    line-height: 13.31px;

    color: #000000;

    margin: 0;
  }

  span{
    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: 10.89px;

    color: #000000;

    margin: 0;
  }
`;

export const ConsumptionStyled = styled.div<{ isExpanded?: boolean }>`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 18px 0 0 0;

  h3{
    font-family: Inter;
    font-size: 11px;
    font-weight: 700;
    line-height: 13.31px;
    text-align: left;

    margin: 0;
  }

  span {
    font-family: Inter;
    font-size: 9px;
    font-weight: 400;
    line-height: 10.89px;
    text-align: left;
  }
`;

export const ConsumptionResultContainer = styled.div<{ isExpanded?: boolean }>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 42px;

  ${({ isExpanded }) => isExpanded
  && css`
    display: flex;
    flex-direction: row;
    justify-content: start;

    height: min-content;
  `}
`;

export const ConsumptionResultData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;

  span{
    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: 10.89px;

    color: #000000;

    margin: 0;
  }

  p{
    font-family: Inter;
    font-size: 21px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px;

    color: #000000;

    margin: 0;

    span{
      font-family: Inter;
      font-size: 16px;
      font-style: normal;
      font-weight: 300;
      line-height: 24px;

      color: #3C3C3C;

      margin: 0;
    }
  }
`;

export const ConsumptionResultHighlight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  max-width: 289px;

  background: #F6F6F6;
  border-radius: 13px;

  padding: 12px;

  p{
    color: #000000;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
    line-height: 13.31px;

    margin: 0;
  }

  span{
    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: 12.1px;
    color: #0000008F;

    margin: 0;
  }
`;

export const HighlightData = styled.p`
  color: #000000;

  font-family: Inter;
  font-size: 21px !important;
  font-style: normal;
  font-weight: 700;
  line-height: 13.31px;

  margin: 0;

  span{
    color: #3C3C3C;

    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 300;
    line-height: 12.1px;

    margin: 0;
  }
`;

export const DeltaInfo = styled.div<{isPositive?: boolean}>`
  display: flex;
  align-items: center;
  gap: 4px;

  p{
    color: #E00030;

    ${({ isPositive }) => !isPositive
      && css`
      color: #5AB365;
    `}

    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: 10.89px;
  }

  div{
    margin-top: -5px;

    svg {
      transform: rotate(180deg);
      path{
        fill: #E00030;
      }

      ${({ isPositive }) => !isPositive
        && css`
          transform: rotate(0deg);

          path{
            fill: #5AB365;
          }
      `}
    }
  }
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  p{
    color: #fff;

    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 10.89px;
  }

  span{
    color: #fff;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: 10.89px;
  }
`;

export const NoAnalisysWarning = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;

  p {
    color: #7D7D7D;

    font-family: Inter;
    font-size: 13px;
    font-style: normal;
    font-weight: 700;
    line-height: 15.73px;

    margin: 0;
  }

  span {
    color: #7D7D7D;

    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: 12.1px;

    margin: 0;
  }
`;
