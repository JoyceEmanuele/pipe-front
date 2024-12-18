import styled from 'styled-components';
import { colors } from 'styles/colors';

export const ControlButton = styled.button<{
  isActive?: boolean,
  disabled?: boolean,
  noBorder?: boolean
}>`
  position: relative;
  height: 40px;
  width: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 3px 3px 0px #00000014;
  border: 1px solid #E2E2E2;
  ${({ noBorder }) => (noBorder ? `
    border-left: 0;
    border-right: 0;
    ` : `
    border-radius: 8px;
    width: 40px;  `)}
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : 'background-color: #FFFFFF;')}
  ${({ disabled }) => (disabled ? `
    opacity: 0.3;
    cursor: not-allowed;
  ` : '')}
`;

export const ControlButtonIcon = styled.img<{ isActive?: boolean, status?: string }>`
  width: 16px;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
`;

export const SelectContainer = styled.div`
  position: fixed;
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 40px;
  background: white;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
  overflow: hidden;
`;

export const ControlButtonLabel = styled.span<{isActive?: boolean}>`
  width: 70%;
  font-size: 12px;
  font-weight: 600;
  color: ${({ isActive }) => (!isActive ? colors.Blue700 : '#FFFFFF')};
`;

export const DriSelectContainer = styled.div`
  position: fixed;
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 120px;
  background: white;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
  overflow: hidden;

  div:nth-child(1) {
    button {
      border-top: 0;
      border-bottom: 0;
    }
  }

  div:nth-last-child(1) {
    button {
      border-top: 0;
      border-bottom: 0;
    }
  }
`;

export const LoaderContainer = styled.div`
  height: 40px;
  width: 40px;

  svg {
    width: 40px;
    height: 40px;
  }
`;
