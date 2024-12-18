import styled, { css, keyframes } from 'styled-components';

const marquee = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

export const PinTooltipWrapper = styled.div`
  position: absolute
  left: -100%
  transform: translateX(-50%)
  background: rgba(255, 255, 255, 1)
  border: 0.8px solid rgba(0, 0, 0, 0.19)
  boxShadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.05),
  padding: 5px
  display: none
  width: 192px
  borderRadius: 5px
`;

export const PinTooltipStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Header = styled.div<{ haveOverflow?: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;

  gap: 8px;

  .text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;

    h2 {
      ${({ haveOverflow = false }) => haveOverflow && css`
        animation: ${marquee} 10s linear infinite;
      `}
    }
  }

  h2 {
    text-align: start;

    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 700;
    line-height: 12px;
    margin: 0;

    white-space: nowrap;
  }

  span {
    text-align: start;

    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: 9px;

    color: rgba(54, 59, 196, 1);
  }
`;

export const Contents = styled.div<{isDUTQA: boolean}>`
  display: flex;
  justify-content: space-between;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h3 {
    text-align: start;

    font-family: Inter;
    font-size: 8px;
    font-style: normal;
    font-weight: 600;
    line-height: 9px;

    margin: 0;

    color: rgba(0, 0, 0, 1);
  }

  p {
    text-align: start;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 9px;

    margin: 0;

    color: rgba(0, 0, 0, 1);

    span {
      font-size: 9px;
      color: rgba(0, 0, 0, 1);
    }
  }

  span {
    text-align: start;

    font-family: Inter;
    font-size: 8px;
    font-style: normal;
    font-weight: 400;
    line-height: 9px;

    color: rgba(107, 107, 107, 1);

    span {
      font-size: 9px;
    }
  }

  .content {
    ${({ isDUTQA }) => isDUTQA && css`
      width: 30%;
    `}
  }
`;

export const StatusColor = styled.div<{ color?: string }>`
  min-width: 14px;
  min-height: 14px;

  width: 14px;
  height: 14px;
  border-radius: 2px;

  ${({ color = '#5AB365' }) => css`
    background-color: ${color};
  `}
`;
