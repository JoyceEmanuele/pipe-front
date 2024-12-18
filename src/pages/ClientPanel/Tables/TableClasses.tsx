import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { apiCall } from 'providers';
import { ActionButton, Loader } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { DeleteOutlineIcon, EditIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const TableClasses = ({
  list, onDeleteClick, onEditClick, clientId,
}): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const [state, setState] = useState({
    isLoading: true,
    classesUnitsList: [] as {}[][],
  });

  async function getClassesUnits() {
    const classesUnitsList: { UNIT_ID: string, NOME: string, SOBRENOME: string }[][] = await Promise.all(list.map(async (item) => {
      const { list } = await apiCall('/clients/get-class-units', { CLASS_ID: item.CLASS_ID, CLIENT_ID: clientId });
      return list;
    }));
    setState({ isLoading: false, classesUnitsList });
  }

  useEffect(() => {
    getClassesUnits();
  }, []);

  function filterClassUnits(index) {
    const classUnits = state.classesUnitsList[index];
    if (classUnits && classUnits.length > 0) {
      return (
        <div>
          {`${classUnits.length} unidades`}
        </div>
      );
    }
    return '0 unidades';
  }

  return (
    <TableContainer>
      <TableHead>
        <HeaderRow>
          <HeaderCell>Tipo</HeaderCell>
          <HeaderCell>Nome do Grupo</HeaderCell>
          <HeaderCell>Unidades</HeaderCell>
          {(profile.manageAllClients)
            && <HeaderCell />}
        </HeaderRow>
      </TableHead>
      <TableBody>
        { list.map((item, index) => (
          <Row key={item.CLASS_ID}>
            <DataCell>{item.CLASS_TYPE}</DataCell>
            <DataCell>{item.CLASS_NAME}</DataCell>
            <DataCell>{filterClassUnits(index)}</DataCell>
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
