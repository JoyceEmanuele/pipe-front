import styled from 'styled-components';

import {
  Button,
} from '~/components';
import { colors } from '~/styles/colors';

export const TableContainer = styled.table`
  width: 100%;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
`;

export const TableHead = styled.thead`
`;

export const TableBody = styled.tbody`
  border: 1px solid ${colors.Grey};
`;

export const HeaderCell = styled.th`
  text-align: left;
  padding: 0 10px;
  border-bottom: solid 1px ${colors.Grey};
  font-size: 0.75rem;
  background-color: ${colors.Blue300};
  color: ${colors.White};
  &:first-child {
    border-top-left-radius: 10px;
  }
  &:last-child {
    border-top-right-radius: 10px;
  }
`;

export const DataCell = styled.td`
  text-align: left;
  color: ${colors.DarkGrey};
  min-width: 50px;
  padding: 0 10px;
  font-size: 0.71rem
`;

export const Row = styled.tr`
  height: 35px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const HeaderRow = styled.tr`
  height: 40px;
  display: table-row;
`;

export const SimpleButton = styled(Button)`
  width: initial;
  padding: 8px 15px;
  margin: 7px 7px;
`;
