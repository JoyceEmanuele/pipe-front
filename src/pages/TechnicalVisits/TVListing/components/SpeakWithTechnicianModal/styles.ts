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

export const Title = styled.b`
  color: ${colors.Blue500};
  font-size: 15px;
`;

export const ColumnTitle = styled.b`
  font-size: 12px;
  color: ${colors.Blue700};
`;

export const Value = styled.span`
  display: block;
  font-size: 12px;
  color: ${colors.GreyInputPlaceholder};
`;
