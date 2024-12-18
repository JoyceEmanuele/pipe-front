import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const StatusBox = styled.div<{ color?, status? }>(
  ({ color, status }) => `
  width: 75px;
  height: 26px;
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

// status === 'ONLINE' ? colors.Blue300 : colors.Grey200

export const L1StateBox = styled.div<{ color?, status? }>(
  ({ color, status }) => `
  width: 75px;
  height: 26px;
  margin-left: 5px;
  border-radius: 5px;
  border: 2px solid ${color || (status === 1 ? '#65E39D' : '#FE3049')};
  font-weight: bold;
  font-size: 0.8em;
  line-height: 18px;
  color: ${color || (status === 1 ? '#65E39D' : '#FE3049')};;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`,
);

export default StatusBox;
