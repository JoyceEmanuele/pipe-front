import { useState } from 'react';

import styled from 'styled-components';

import { ActionButton } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { DeleteOutlineIcon, EditIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const TableRoomTypes = ({ roomTypes, onDeleteClick, onEditClick }): JSX.Element => {
  const [profile] = useState(getUserProfile);
  return (
    <TableContainer>
      <TableHead>
        <HeaderRow>
          <HeaderCell>Nome</HeaderCell>
          <HeaderCell>T-min</HeaderCell>
          <HeaderCell>T-max</HeaderCell>
          <HeaderCell>Horário</HeaderCell>
          <HeaderCell>CO2-max</HeaderCell>
          <HeaderCell>Umi-min</HeaderCell>
          <HeaderCell>Umi-max</HeaderCell>
          <HeaderCell>Dispositivos</HeaderCell>
          {(profile.manageAllClients)
            && <HeaderCell />}
        </HeaderRow>
      </TableHead>
      <TableBody>
        {roomTypes.map((item) => (
          <Row key={item.RTYPE_ID}>
            <DataCell>{item.RTYPE_NAME}</DataCell>
            <DataCell>{item.TUSEMIN == null ? '-' : `${item.TUSEMIN} °C`}</DataCell>
            <DataCell>{item.TUSEMAX == null ? '-' : `${item.TUSEMAX} °C`}</DataCell>
            <DataCell>{item.schedCol || '-'}</DataCell>
            <DataCell>{item.CO2MAX == null ? '-' : `${item.CO2MAX} ppm`}</DataCell>
            <DataCell>{item.HUMIMIN == null ? '-' : `${item.HUMIMIN}%`}</DataCell>
            <DataCell>{item.HUMIMAX == null ? '-' : `${item.HUMIMAX}%`}</DataCell>
            <DataCell>{item.DUTS_COUNT + item.DRIS_COUNT}</DataCell>
            {(profile.manageAllClients)
              && (
              <DataCell>
                <ActionButton onClick={() => onDeleteClick(item)} variant="red-inv">
                  <DeleteOutlineIcon colors={colors.Red} />
                </ActionButton>
                <ActionButton onClick={() => onEditClick(item)} variant="blue-inv">
                  <EditIcon color={colors.LightBlue} />
                </ActionButton>
              </DataCell>
              )}
          </Row>
        ))}
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
