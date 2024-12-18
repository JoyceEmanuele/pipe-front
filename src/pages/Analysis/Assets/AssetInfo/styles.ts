import styled from 'styled-components';
import { colors } from 'styles/colors';

export const Card = styled.div`
  padding: 32px 0 32px 32px;
  margin-top: 24px;
  border-radius: 10px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
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
export const Title = styled.h1`
  font-size: 1.25em;
  color: #363BC4;
  font-weight: bold;
  margin-bottom: 16px;
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
