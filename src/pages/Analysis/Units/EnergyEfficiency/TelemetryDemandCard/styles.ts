import styled, { css } from 'styled-components';
import { colors } from '~/styles/colors';

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 24px 14px 24px;

  div {
    display: flex;
    gap: 8px;

    align-items: center;
  }

  h2 {
    color: ${colors.Black};
    margin: 0;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  span {
    color: ${colors.Black};

    text-align: center;
    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }
`;

export const TabOptions = styled.div`
  display: flex;
  gap: 5px;

  border-bottom: 1px solid ${colors.GreyDefaultCardBorder};
`;

export const TabOption = styled.span<{active?: boolean}>`
  position: relative;
  top: 1px;

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
        border-bottom: 1px solid transparent;
        background-color: white;
      `;
    }

    return css`
      background-color: #F4F4F4;
      border-bottom: 1px solid ${colors.GreyDefaultCardBorder};
      cursor: pointer;
    `;
  }}
`;

export const TelemetryCard = styled.div`
  position: relative;
`;

export const LoaderOverlay = styled.div`
  position: absolute;
  top: 0;

  background-color: ${`${colors.Grey030}99`};

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`;
