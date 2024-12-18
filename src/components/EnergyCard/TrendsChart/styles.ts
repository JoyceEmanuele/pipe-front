import styled, { css } from 'styled-components';

export const BarchartWrapper = styled.div`
  width: 100%;
  height: 276px;
`;

export const CheckboxLine = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  padding: 8px;

  height: 40px;

  span {
    color: #000000;
    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

export const TrendsFooter = styled.div`
  width: 100%;

  display: flex;
  justify-content: space-evenly;;
`;

export const TrendsFooterData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h2 {
    color: #000;
    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;
  }

  p{
    color: #000;
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;

    span{
      color: #3C3C3C;
      font-family: Inter;
      font-size: 16px;
      font-style: normal;
      font-weight: 300;
      line-height: normal;

      margin: 0;
    }
  }

  span {
    color: #92CC9A;
    font-family: Inter;
    font-size: 12x;
    font-style: normal;
    font-weight: 400;
    line-height: normal;

    margin: 0;
  }
`;

export const DeltaInfo = styled.div<{redPercentage?: boolean}>`
  display: flex;
  align-items: center;
  gap: 4px;

  font-family: Inter;
  font-size: 16x;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: #E00030;

  margin: 0;

  ${({ redPercentage }) => !redPercentage
    && css`
      color: #92CC9A;
  `}
`;
