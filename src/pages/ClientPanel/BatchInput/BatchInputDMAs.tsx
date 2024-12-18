import { useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import { Loader, Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallFormData, ApiResps } from 'providers';
import { colors } from 'styles/colors';

const hydrometerModels = ['Elster S120 (1 L/pulso)', 'ZENNER ETKD-P-N (10 L/pulso)', 'ZENNER MTKD-AM-I (10 L/pulso)',
  'Saga Unijato US-1.5 (1 L/pulso)', 'Saga Unijato US-3.0 (1 L/pulso)', 'Saga Unijato US-5.0 (1 L/pulso)'];

export const BatchInputDMAs = ({ clientId }): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSending: false,
      columns: {} as ApiResps['/batch-input-columns']['dmas'],
      parsedCols: [] as string[],
      parsedRows: [] as ApiResps['/check-client-dmas-batch']['list'],
      resultadoEnvio: {} as { [key: string]: string },
      comboOpts: {} as {
        brands?: { label: string, value: string }[],
        rtypes?: { RTYPE_NAME: string, RTYPE_ID: number }[],
        units?: { label: string, value: number }[],
        groups?: { label: string, value: number, unit: number }[],
      },
    };
    return state;
  });

  useEffect(() => {
    fetchServerData();
  }, [clientId]);

  async function fetchServerData() {
    try {
      const [
        { dmas: columns },
        comboOpts,
      ] = await Promise.all([
        apiCall('/batch-input-columns', { dmas: true }),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
          brands: true,
          rtypes: true,
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
      const { list, tableCols } = await apiCallFormData('/check-client-dmas-batch', {
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
      const response = await apiCall('/add-client-dmas-batch', {
        CLIENT_ID: clientId,
        dmas: state.parsedRows,
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
      <h3>DMAs</h3>
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

                {state.columns && (
                  state.columns?.UNIT_NAME.exampleList.map((_item, index) => (
                    <tr>
                      {Object.values(state.columns!).map((col) => <td key={col.label}>{col.exampleList[index]}</td>)}
                    </tr>
                  )))}

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
                  <td>{(state.columns!.METER_ID || {}).label}</td>
                  {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{(state.columns!.UNIT_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('SUPPLIER')) && <td>{(state.columns!.SUPPLIER || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('HYDROMETER_MODEL')) && <td>{(state.columns!.HYDROMETER_MODEL || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_LOCATION')) && <td>{(state.columns!.INSTALLATION_LOCATION || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_DATE')) && <td>{(state.columns!.INSTALLATION_DATE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('TOTAL_CAPACITY')) && <td>{(state.columns!.TOTAL_CAPACITY || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('QUANTITY_OF_RESERVOIRS')) && <td>{(state.columns!.QUANTITY_OF_RESERVOIRS || {}).label}</td>}
                </tr>
              </thead>
              <tbody>
                {state.parsedRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                      {state.resultadoEnvio[row.key] && <div>{state.resultadoEnvio[row.key]}</div>}
                    </td>
                    <td>{row.METER_ID}</td>
                    {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{row.UNIT_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('SUPPLIER')) && <td>{row.SUPPLIER}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('HYDROMETER_MODEL')) && <td>{row.HYDROMETER_MODEL}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_LOCATION')) && <td>{row.INSTALLATION_LOCATION}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_DATE')) && <td>{row.INSTALLATION_DATE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('TOTAL_CAPACITY')) && <td>{row.TOTAL_CAPACITY}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('QUANTITY_OF_RESERVOIRS')) && <td>{row.QUANTITY_OF_RESERVOIRS}</td>}
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
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.units || []).map((unit) => (
                    <tr key={unit.value}>
                      <td>{unit.label}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div>
              <Table>
                <thead>
                  <tr>
                    <th>Modelos de Hidrômetro</th>
                  </tr>
                </thead>
                <tbody>
                  {hydrometerModels.map((model) => (
                    <tr key={model}>
                      <td>{model}</td>
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
