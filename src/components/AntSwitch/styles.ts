import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const SwitchButton = styled.div`
  display: flex;
  align-items: center;
`;

export const SwitchText = styled.span<{ switchOn: boolean }>(
  ({ switchOn }) => `
  color: ${switchOn ? colors.Blue300 : colors.Grey200};
  font-size: 1em;
  line-height: 26px;
`,
);
