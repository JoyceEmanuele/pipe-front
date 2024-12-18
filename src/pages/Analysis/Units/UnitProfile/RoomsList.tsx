import { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { ActionButton, Loader, Button } from 'components';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { DeleteOutlineIcon } from 'icons';
import { apiCall, ApiResps } from 'providers';
import { colors } from 'styles/colors';

export default function RoomsList(props: { unitId: number }): JSX.Element {
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      allRows: [] as ApiResps['/clients/get-rooms-list']['list'],
      isLoading: true,
    };

    return state;
  });

  async function handleGetData() {
    try {
      setState({ isLoading: true });

      const { list } = await apiCall('/clients/get-rooms-list', { unitIds: [props.unitId] });

      state.allRows = list;
    } catch (err) {
      console.log(err);
      toast.error(t('erroDados'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetData();
  }, []);

  async function onDeleteClick(row: { ROOM_ID: number }) {
    if (!window.confirm(t('temCerteza'))) return;
    try {
      await apiCall('/clients/remove-room', {
        ROOM_ID: row.ROOM_ID,
      });
      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  return (
    <>
      {state.isLoading && <Loader variant="primary" />}
      {(!state.isLoading)
        && (
        <>
          <div style={{ marginTop: '20px' }}>
            <Link to={`/analise/unidades/revezamento-programacao/${props.unitId}/adicionar`}>
              <Button variant="primary" style={{ width: '300px' }}>{t('adicionar')}</Button>
            </Link>
          </div>
          {(state.allRows.length === 0) && (
            <div style={{ paddingTop: '30px', paddingLeft: '20px' }}>
              {t('nenhumConfigurado')}
            </div>
          )}
          {(state.allRows.length > 0) && (
            <Flex flexWrap="wrap">
              <Box width={1} pt={20}>
                <TableNew2 style={{ color: colors.Grey400, width: '100%' }}>
                  <thead>
                    <tr>
                      <th>{t('nome')}</th>
                      {(profile.manageAllClients) && (
                        <th>&nbsp;</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {state.allRows.map((row) => (
                      <tr key={`${row.ROOM_ID}`}>
                        <td>
                          <StyledLink to={`/analise/unidades/revezamento-programacao/${row.UNIT_ID}/editar/${row.ROOM_ID}`}>{row.ROOM_NAME}</StyledLink>
                        </td>
                        {(profile.manageAllClients) && (
                          <td>
                            <ActionButton onClick={() => onDeleteClick(row)} variant="red-inv">
                              <DeleteOutlineIcon colors={colors.Blue300} />
                            </ActionButton>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </TableNew2>
              </Box>
            </Flex>
          )}
        </>
        )}
    </>
  );
}

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
`;

export const TableNew2 = styled.table`
  white-space: nowrap;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
  & tbody {
    border: 1px solid ${colors.Grey};
    & tr {
      height: 35px;
      &:not(:last-child) {
        border-bottom: 1px solid ${colors.Grey};
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    & td {
      text-align: left;
      color: ${colors.DarkGrey};
      padding: 0 10px;
      font-size: 0.71rem
    }
  }
  & thead {
    & tr {
      height: 40px;
      display: table-row;
    }
    & th {
      flex: 1;
      text-align: left;
      align-items: center;
      padding: 0 10px;
      word-break: normal;
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
    }
  }
`;
