import { useState } from 'react';

import styled from 'styled-components';

import { Checkbox } from '~/components';
import { colors } from '~/styles/colors';

export const TableFreeDevices = ({ freeDevs, selectionChanged }): JSX.Element => {
  const [, stateChanged] = useState({});
  return (
    <TableContainer>
      <TableHead>
        <HeaderRow>
          <HeaderCell>Tipo</HeaderCell>
          <HeaderCell>ID</HeaderCell>
          <HeaderCell>Conexão</HeaderCell>
          <HeaderCell>Seleção</HeaderCell>
        </HeaderRow>
      </TableHead>
      <TableBody>
        {(freeDevs.map((devInfo) => (
          <Row key={devInfo.DEV_ID}>
            <DataCell>{devInfo.type}</DataCell>
            <DataCell>{devInfo.DEV_ID}</DataCell>
            <DataCell>{devInfo.status}</DataCell>
            <DataCell>
              {['DAC', 'DUT'].includes(devInfo.type)
                && (
                <Checkbox
                  checked={devInfo.freeDevChecked}
                  onClick={() => { devInfo.freeDevChecked = !devInfo.freeDevChecked; stateChanged({}); selectionChanged(); }}
                />
                )}
            </DataCell>
          </Row>
        )))}
      </TableBody>
    </TableContainer>
  );
};

const TableContainer = styled.table`
  width: 100%;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
`;
const TableHead = styled.thead`
`;
const TableBody = styled.tbody`
  border: 1px solid ${colors.Grey};
`;
const HeaderCell = styled.th`
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
const DataCell = styled.td`
  text-align: left;
  color: ${colors.DarkGrey};
  min-width: 50px;
  padding: 0 10px;
  font-size: 0.71rem
`;
const Row = styled.tr`
  height: 35px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
const HeaderRow = styled.tr`
  height: 40px;
  display: table-row;
`;
