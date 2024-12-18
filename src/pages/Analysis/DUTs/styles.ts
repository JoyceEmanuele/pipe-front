import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const ControlButtonIcon = styled.img<{ isActive?: boolean, status?: string }>`
  max-width: 100%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
  ${({ status }) => (status === 'ONLINE' ? '' : 'filter: contrast(0)')};
`;

export const ControlButton = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: 70px;
  height: 70px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
`;

export const HistoryContainerQA = styled.div`
`;

export const SetpointButton = styled.div<{ up?: boolean, down?: boolean }>`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #D7D7D7;
  user-select: none;
  ${({ up }) => (up ? 'border-bottom: 1px solid #D7D7D7' : '')}
  ${({ down }) => (down ? 'border-top: 1px solid #D7D7D7' : '')}
`;

export const SelectContainer = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
`;
