import styled, { css, keyframes } from 'styled-components';
import { colors } from '~/styles/colors';

const marquee = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

export const TooltipContainer = styled.div<{viewMode: boolean}>`
  position: relative;
  display: inline-block;
  ${({ viewMode }) => !viewMode && css`
    cursor: grab;
  `}

  ${({ viewMode }) => viewMode && css`
    cursor: pointer;
    margin-left: 24px;
    margin-top: 24px;
  `}
`;

export const TooltipText = styled.div<{viewMode: boolean}>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${({ viewMode }) => !viewMode && css`
    width: 128px;
    justify-content: space-between;

    &::before {
      margin-left: -5px;
    }

    &::after {
      margin-left: -4px;
    }
  `}

  ${({ viewMode }) => viewMode && css`
    width: 93px;
    justify-content: center;

    &::before {
      margin-left: -34px;
    }

    &::after {
      margin-left: -33px;
    }
  `}


  background-color: ${colors.White};
  color: ${colors.Black};
  text-align: center;
  padding: 5px;

  border-width: 1px;
  border-color: #C5C5C5;
  border-style: solid;
  border-radius: 6px;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);

  bottom: 100%;
  left: 50%;
  margin-left: -60px;

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: -15%;
    border-width: 5px;
    border-style: solid;
    border-color: #C5C5C5 transparent transparent transparent;
  }

  &::after {
    content: '';
    position: absolute;
    top: 98%;
    left: -15%;
    border-width: 4px;
    border-style: solid;
    border-color: ${colors.White} transparent transparent transparent;
  }

  font-family: Inter;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 12px;

  color: ${colors.Black}
`;

export const ContentWrapper = styled.div<{viewMode: boolean, haveOverflow?: boolean}>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${({ viewMode }) => !viewMode && css`
    overflow: hidden;
    width: 80%;
  `}

  span {
    text-align: start;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .marquee {
    text-align: start;
    white-space: nowrap;
    overflow: unset;
    text-overflow: unset;

    ${({ haveOverflow = false }) => haveOverflow && css`
      animation: ${marquee} 10s linear infinite;
    `}
  }

`;

export const Temperature = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    text-align: start;

    font-family: Inter;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 21px;

    .unit {
      font-weight: 400;
      color: #989898;
    }
  }
`;

export const StatusColor = styled.div<{ color?: string }>`
  width: 14px;
  height: 14px;
  border-radius: 2px;

  ${({ color = '#5AB365' }) => css`
    background-color: ${color};
  `}
`;

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  svg {
    cursor: pointer;
  }
`;
