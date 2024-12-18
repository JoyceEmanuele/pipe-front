import styled, { css } from 'styled-components';
import { colors } from '~/styles/colors';

export const ImageZoomWrapper = styled.div`
  width: 100%;
  height: 437px;
  position: relative;

  max-height: 513px;
`;

export const ImageZoomActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  position: absolute;
  top: 5%;
  right: 5%;
`;

export const ImageZoomActionButton = styled.div<{ isActive?: boolean }>`
  width: 35px;
  height: 35px;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: 1px solid #DADADA;
  background: ${colors.White};
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05);

  cursor: pointer;

  ${({ isActive = true }) => !isActive
    && css`
      cursor: not-allowed;;
      opacity: 0.3;
    `}
`;
