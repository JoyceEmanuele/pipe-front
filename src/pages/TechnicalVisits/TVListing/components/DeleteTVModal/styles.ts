import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Column = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const ColumnTitle = styled.b`
  font-size: 12px;
  color: #555555;
`;

export const Value = styled.span`
  display: block;
  font-size: 12px;
  color: ${colors.Blue700};
`;
