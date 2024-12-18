import styled from 'styled-components';
import { colors } from 'styles/colors';

export const Data = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;
export const DataText = styled.span<{ fontWeight? }>(
  ({ color = colors.Grey400, fontWeight = 'normal' }) => `
  font-size: 12px;
  font-weight: ${fontWeight};
  color: ${color};
`,
);

export const IconWrapper = styled.div<{ width?, height? }>(
  ({ width, height }) => `
  display: inline-block;
  width: ${width || '19'}px;
  height: ${height || '25'}px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: ${width}px;
    height: ${height}px;
  }
`,
);

export const StatusBox = styled.div<{ color?, status? }>(
  ({ color, status }) => `
  width: 80px;
  height: 25px;
  margin-left: 5px;
  border-radius: 5px;
  border: 2px solid ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  background: ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  font-weight: bold;
  font-size: 0.8em;
  line-height: 18px;
  color: ${colors.White};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`,
);

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

export const ShowHideButton = styled.div`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #D7D7D7;
  border-radius: 10px;
  user-select: none;
  cursor: pointer;
  width: 45px;
  height: 45px;
`;
