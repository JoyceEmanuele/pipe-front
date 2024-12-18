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

export const IconWrapper = styled.div`
  display: inline-block;
  width: 21px;
  height: 27px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: 21px;
    height: 27px;
  }
`;

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
