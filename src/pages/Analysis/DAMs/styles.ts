import styled from 'styled-components';
import { colors } from '~/styles/colors';

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

export const SetpointButton = styled.div<{ up?: boolean, down?: boolean, disabled?: boolean }>`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #D7D7D7;
  user-select: none;
  ${({ up }) => (up ? 'border-bottom: 1px solid #D7D7D7' : '')}
  ${({ down }) => (down ? 'border-top: 1px solid #D7D7D7' : '')}
  ${({ disabled }) => (disabled ? 'cursor: default' : 'cursor: pointer')}
`;

export const SetpointButtonMobile = styled.div<{ up?: boolean, down?: boolean, disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 48px;
  height: 48px;
  justify-content: center;
  border: 1px solid #D7D7D7;
  border-radius: 10px;
  user-select: none;
  ${({ disabled }) => (disabled ? 'cursor: default' : 'cursor: pointer')}
`;

export const IconWrapper = styled.div`
  display: inline-block;
  width: 9px;
  height: 15px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: 9px;
    height: 15px;
  }
`;

export const DesktopWrapper = styled.div`
display: none;
@media (min-width: 768px) {
  display: block;
}
`;

export const MobileWrapper = styled.div`
display: block;
@media (min-width: 768px) {
  display: none;
}
`;
