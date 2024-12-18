import { useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  Button,
  Loader,
  Select,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

export const DRIUnits = (): JSX.Element => {
  const [state, render, setState] = useStateVar({
    loading: true,
    dris: [] as { DRI_ID: string, UNIT_ID: number, UNIT_NAME: string, CLIENT_NAME: string, comboLabel?: string }[],
    dielUnits: [] as { UNIT_ID: number, UNIT_NAME: string, CLIENT_NAME: string, comboLabel?: string }[],
    combo_selectedDielUnit: null as null|{ UNIT_ID: number, CLIENT_ID: number },
    combo_selectedDRI: null as null|{ DRI_ID: string },
  });

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    try {
      setState({ loading: true });
      const [
        { list: dielUnits },
      ] = await Promise.all([
        apiCall('/clients/get-units-list-basic', {}),
      ]);
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    setState({ loading: false });
  }

  async function saveAssociation() {
    const DRI_ID = state.combo_selectedDRI && state.combo_selectedDRI.DRI_ID;
    const UNIT_ID = state.combo_selectedDielUnit && state.combo_selectedDielUnit.UNIT_ID;
    const CLIENT_ID = state.combo_selectedDielUnit && state.combo_selectedDielUnit.CLIENT_ID;
    if ((!UNIT_ID) || (!CLIENT_ID)) {
      toast.error('Unidade inválida');
      return;
    }
    if (!DRI_ID) {
      toast.error('Selecione um DRI');
      return;
    }
    await apiCall('/dri/set-dri-info', {
      DRI_ID,
      UNIT_ID,
      CLIENT_ID,
    });
    window.location.reload();
  }

  return (
    <>
      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <>
          <div>
            <div style={{ display: 'flex' }}>
              <Select
                style={{ width: '400px', marginTop: '10px', marginRight: '10px' }}
                options={state.dielUnits}
                propLabel="comboLabel"
                value={state.combo_selectedDielUnit}
                placeholder="Unidade Diel"
                onSelect={(item) => { setState({ combo_selectedDielUnit: item }); }}
                notNull
              />
              <Select
                style={{ width: '500px', marginTop: '10px', marginRight: '10px' }}
                options={state.dris}
                propLabel="DRI_ID"
                value={state.combo_selectedDRI}
                placeholder="DRI"
                onSelect={(item) => { setState({ combo_selectedDRI: item }); }}
                notNull
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button style={{ width: '100px' }} onClick={saveAssociation} variant="primary">
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <h2>TABELA GREENANT</h2>
            <TableBasic>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Unidade</th>
                  <th>DRI</th>
                </tr>
              </thead>
              <tbody>
                {(state.dris || []).map((row) => (
                  <tr key={row.DRI_ID}>
                    <td>{row.CLIENT_NAME}</td>
                    <td>{row.UNIT_NAME}</td>
                    <td>{row.DRI_ID}</td>
                  </tr>
                ))}
              </tbody>
            </TableBasic>
          </div>
        </>
      )}
    </>
  );
};

const TableBasic = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;
