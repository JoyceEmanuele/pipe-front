import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Row = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

export const Text = styled.p<{ isBold? }>(
  ({ isBold }) => `
  margin-top: 1em;
  margin-bottom: 1em;
  color: ${colors.Grey400};
  font-weight: ${isBold ? 'bold' : 'normal'};
`,
);
