import { useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import { Loader, Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallFormData, ApiResps } from 'providers';
import { colors } from 'styles/colors';

export const BatchInputDUTs = ({ clientId }): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSending: false,
      columns: {} as ApiResps['/batch-input-columns']['duts'],
      parsedCols: [] as string[],
      parsedRows: [] as ApiResps['/check-client-duts-batch']['list'],
      resultadoEnvio: {} as { [key: string]: string },
      comboOpts: {} as {
        brands?: { label: string, value: string }[],
        rtypes?: { RTYPE_NAME: string, RTYPE_ID: number }[],
        dutPlacement?: { label: string, value: string }[],
        units?: { label: string, value: number }[],
        groups?: { label: string, value: number, unit: number }[],
      },
    };
    return state;
  });

  useEffect(() => {
    fetchServerData();
  }, []);

  async function fetchServerData() {
    try {
      const [
        { duts: columns },
        comboOpts,
      ] = await Promise.all([
        apiCall('/batch-input-columns', { duts: true }),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
          brands: true,
          rtypes: true,
          dutPlacement: true,
          units: true,
          groups: true,
        }),
      ]);
      state.comboOpts = comboOpts;
      state.columns = columns;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  async function onChange_textAreaUnidades(fileRef: any) {
    setState({ isSending: true, parsedRows: [] });
    try {
      const { list, tableCols } = await apiCallFormData('/check-client-duts-batch', {
        CLIENT_ID: clientId,
      }, {
        file: fileRef,
      });
      state.parsedRows = list;
      state.parsedCols = tableCols;
    } catch (err) {
      console.log(err);
      toast.error('Erro ao analisar os dados inseridos');
      state.parsedRows = [];
    }
    setState({ isSending: false });
  }

  async function confirmouEnviar() {
    try {
      setState({ isSending: true, resultadoEnvio: {} });
      const response = await apiCall('/add-client-duts-batch', {
        CLIENT_ID: clientId,
        duts: state.parsedRows,
      });
      for (const row of (response.added || [])) {
        if (!row.key) continue;
        state.resultadoEnvio[row.key] = 'Salvo!';
      }
      for (const row of (response.ignored || [])) {
        if ((!row.key) || (!row.reason)) continue;
        state.resultadoEnvio[row.key] = row.reason;
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    setState({ isSending: false });
  }

  if (state.isLoading || state.isSending) return <Loader />;

  return (
    <div>
      <h3>DUTs</h3>
      {(state.parsedRows.length === 0)
        && (
        <>
          <div style={{ overflow: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  {Object.values(state.columns!).map((col) => <th key={col.label}>{col.label}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(state.columns!).map((col) => <td key={col.label}>{col.example}</td>)}
                </tr>
              </tbody>
            </Table>
          </div>
          <p>
            Copie a tabela acima e cole no seu editor de planilhas.
            <br />
            Preencha a tabela com os dados a inserir e salve como XLSX.
            <br />
          </p>
          <FileInput onChange={(e: any) => { onChange_textAreaUnidades(e.target.files[0]); }} style={{ backgroundColor: colors.Blue300, borderColor: colors.Blue300, padding: '10px' }}>
            <span style={{ display: 'inline-block', width: '200px', textAlign: 'center' }}>
              Selecionar Arquivo
            </span>
            <input type="file" hidden />
          </FileInput>
        </>
        )}

      {(state.parsedRows.length > 0)
        && (
        <>
          <div style={{ overflow: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>Status</th>
                  <td>{(state.columns?.DUT_ID || {}).label}</td>
                  {((!state.parsedCols) || state.parsedCols.includes('ROOM_NAME')) && <td>{(state.columns?.ROOM_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{(state.columns?.UNIT_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('RTYPE_NAME')) && <td>{(state.columns?.RTYPE_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PLACEMENT')) && <td>{(state.columns?.PLACEMENT || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('AUTOM_CFG')) && <td>{(state.columns?.AUTOM_CFG || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MCHN_BRAND')) && <td>{(state.columns?.MCHN_BRAND || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MCHN_MODEL')) && <td>{(state.columns?.MCHN_MODEL || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MONIT_MACHINE')) && <td>{(state.columns?.MONIT_MACHINE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_1')) && <td>{(state.columns?.PHOTO_1 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_2')) && <td>{(state.columns?.PHOTO_2 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_3')) && <td>{(state.columns?.PHOTO_3 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_4')) && <td>{(state.columns?.PHOTO_4 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_5')) && <td>{(state.columns?.PHOTO_5 || {}).label}</td>}

                </tr>
              </thead>
              <tbody>
                {state.parsedRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                      {state.resultadoEnvio[row.key] && <div>{state.resultadoEnvio[row.key]}</div>}
                    </td>
                    <td>{row.DUT_ID}</td>
                    {((!state.parsedCols) || state.parsedCols.includes('ROOM_NAME')) && <td>{row.ROOM_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{row.UNIT_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('RTYPE_NAME')) && <td>{row.RTYPE_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PLACEMENT')) && <td>{row.PLACEMENT}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('AUTOM_CFG')) && <td>{row.AUTOM_CFG}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MCHN_BRAND')) && <td>{row.MCHN_BRAND}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MCHN_MODEL')) && <td>{row.MCHN_MODEL}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MONIT_MACHINE')) && <td>{row.MONIT_MACHINE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_1')) && <td>{row.PHOTO_1}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_2')) && <td>{row.PHOTO_2}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_3')) && <td>{row.PHOTO_3}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_4')) && <td>{row.PHOTO_4}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_5')) && <td>{row.PHOTO_5}</td>}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div style={{ display: 'flex', paddingTop: '30px' }}>
            <Button style={{ width: '140px' }} onClick={confirmouEnviar} variant="primary">
              Enviar
            </Button>
            <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => setState({ parsedRows: [] })} variant="grey">
              Cancelar
            </Button>
          </div>
        </>
        )}

      {(state.parsedRows.length === 0)
        && (
        <>
          <p style={{ paddingTop: '10px' }}>Valores tabelados</p>
          <div style={{ display: 'flex', overflow: 'auto' }}>
            <div>
              <Table>
                <thead>
                  <tr>
                    <th>Unidades</th>
                    <th>Máquinas</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.units || []).map((unit) => (
                    <tr key={unit.value}>
                      <td>{unit.label}</td>
                      <td>
                        {(state.comboOpts.groups || []).filter((x) => x.unit === unit.value).map((machine) => (
                          <div key={machine.value}>
                            {machine.label}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div>
              <Table>
                <thead>
                  <tr>
                    <th>Marcas</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.brands || []).map((row) => (
                    <tr key={row.value}>
                      <td>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div>
              <Table>
                <thead>
                  <tr>
                    <th>Tipos de Ambiente</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.rtypes || []).map((row) => (
                    <tr key={row.RTYPE_ID}>
                      <td>{row.RTYPE_NAME}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div>
              <Table>
                <thead>
                  <tr>
                    <th>Posicionamento</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.dutPlacement || []).map((row) => (
                    <tr key={row.value}>
                      <td>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </>
        )}
    </div>
  );
};

const Table = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

const FileInput = styled.label`
  border-radius: 32px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  outline: none;
  padding: 8px 0px;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  width: 100%;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
  background-color: ${colors.Pink200};
  border-color: ${colors.Pink200};
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.Pink300};
    border-color: ${colors.Pink300};
    box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.35), 0px 11px 15px rgba(85, 97, 115, 0.25);
  }
`;