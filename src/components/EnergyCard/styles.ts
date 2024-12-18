import styled, { css } from 'styled-components';
import { colors } from '~/styles/colors';

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 30px;

  h2 {
    color: ${colors.Black};
    margin: 0;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
`;

export const CardHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  h2 {
    font-family: Inter;
    font-style: normal;
    font-weight: bold;
    font-size: 13px;
    line-height: 16px;
    color: ${colors.Black};
  }
`;

export const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;


  span {
    font-family: Inter;
    font-size: 12px;
    font-weight: 600;
    line-height: normal;

    cursor: pointer;
  }
`;

export const FilterHeaderButton = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;

  path{
    fill: black;
  }

  ${({ disabled = false }) => disabled && css`
    cursor: not-allowed;

    path{
      fill: #B7B7B7
    }
  `}
`;

export const TabOptions = styled.div`
  display: 'grid';
  grid-template-columns: '150px 150px auto';
  margin-bottom: '10px';
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
  line-height: 20px;

  ${({ active = false }) => {
    if (active) {
      return css`
        border-bottom: 1px solid transparent;
        background-color: white;
        font-weight: 700;
      `;
    }

    return css`
      background-color: #F4F4F4;
      border-bottom: 1px solid ${colors.GreyDefaultCardBorder};
      cursor: pointer;
      font-weight: 500;
    `;
  }}
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  position: relative;
  padding: 4px 18px;
`;

export const LoaderOverlay = styled.div`
  position: absolute;
  top: 0;

  background-color: #ffffff;
  opacity: 0.7;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`;
