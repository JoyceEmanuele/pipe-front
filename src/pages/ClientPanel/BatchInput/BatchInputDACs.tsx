import { useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import { Loader, Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import {
  apiCall,
  ApiResps,
  apiCallFormData,
  apiCallDownload,
} from 'providers';
import { colors } from 'styles/colors';
import { stateObject } from '../../../helpers/batchInputHelpers';

export const BatchInputDACs = ({ clientId }): JSX.Element => {
  const [state, render, setState] = useStateVar(stateObject());

  useEffect(() => {
    fetchServerData();
  }, []);

  async function fetchServerData() {
    try {
      const [
        { dacs: fetchedColumns },
        comboOpts,
      ] = await Promise.all([
        apiCall('/batch-input-columns', { dacs: true }),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
          units: true,
          groups: true,
          fluids: true,
          applics: true,
          types: true,
          envs: true,
          brands: true,
          psens: true,
        }),
      ]);
      state.comboOpts = comboOpts;
      state.columns = fetchedColumns;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  async function exportUnitMachines(unitId: number) {
    try {
      const exportResponse = await apiCallDownload('/export-client-dacs-batch-input', {
        CLIENT_ID: clientId,
        UNIT_ID: unitId,
      });
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'Maquinas.xlsx';
      link.click();
      toast.success('Exportado com sucesso.');
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível exportar!');
    }
  }

  async function onChange_textAreaUnidades(fileRef: any) {
    setState({ isSending: true, parsedRows: [] });
    try {
      // const formData = new FormData();
      // formData.set('CLIENT_ID', clientId);
      // formData.set('file', fileRef);

      const { list, tableCols } = await apiCallFormData('/check-client-dacs-batch', {
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
      const response = await apiCall('/add-client-dacs-batch', {
        CLIENT_ID: clientId,
        dacs: state.parsedRows as ApiResps['/check-client-dacs-batch']['list'],
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
  const columns = state.columns as ApiResps['/batch-input-columns']['dacs'];
  return (
    <div>
      <a href="#" style={{ display: 'none' }} id="downloadLink" />
      <h3>DACs</h3>
      {(state.parsedRows.length === 0)
        && (
        <>
          <div style={{ overflow: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  {Object.values(columns!).map((col) => <th key={col.label}>{col.label}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(columns!).map((col) => <td key={col.label}>{col.example}</td>)}
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
                  <td>{(columns!.DAC_ID || {}).label}</td>
                  {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{(columns!.UNIT_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('GROUP_NAME')) && <td>{(columns!.GROUP_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('AUTOM_ENABLE')) && <td>{(columns!.AUTOM_ENABLE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_APPL')) && <td>{(columns!.DAC_APPL || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('FLUID_TYPE')) && <td>{(columns!.FLUID_TYPE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('P0_SENSOR')) && <td>{(columns!.P0_SENSOR || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('P0_POSITN')) && <td>{(columns!.P0_POSITN || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('P1_SENSOR')) && <td>{(columns!.P1_SENSOR || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('P1_POSITN')) && <td>{(columns!.P1_POSITN || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_TYPE')) && <td>{(columns!.DAC_TYPE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_PWR')) && <td>{(columns!.CAPACITY_PWR || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_UNIT')) && <td>{(columns!.CAPACITY_UNIT || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_COP')) && <td>{(columns!.DAC_COP || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_KW')) && <td>{(columns!.DAC_KW || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_ENV')) && <td>{(columns!.DAC_ENV || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_BRAND')) && <td>{(columns!.DAC_BRAND || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_MODEL')) && <td>{(columns!.DAC_MODEL || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_DESC')) && <td>{(columns!.DAC_DESC || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_NAME')) && <td>{(columns!.DAC_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_MODIF')) && <td>{(columns!.DAC_MODIF || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAC_COMIS')) && <td>{(columns!.DAC_COMIS || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_1')) && <td>{(columns!.PHOTO_1 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_2')) && <td>{(columns!.PHOTO_2 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_3')) && <td>{(columns!.PHOTO_3 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_4')) && <td>{(columns!.PHOTO_4 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_5')) && <td>{(columns!.PHOTO_5 || {}).label}</td>}
                </tr>
              </thead>
              <tbody>
                {state.parsedRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                      {state.resultadoEnvio[row.key] && <div>{state.resultadoEnvio[row.key]}</div>}
                    </td>
                    <td>{row.DAC_ID}</td>
                    {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{row.UNIT_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('GROUP_NAME')) && <td>{row.GROUP_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('AUTOM_ENABLE')) && <td>{row.AUTOM_ENABLE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_APPL')) && <td>{row.DAC_APPL}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('FLUID_TYPE')) && <td>{row.FLUID_TYPE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('P0_SENSOR')) && <td>{row.P0_SENSOR}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('P0_POSITN')) && <td>{row.P0_POSITN}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('P1_SENSOR')) && <td>{row.P1_SENSOR}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('P1_POSITN')) && <td>{row.P1_POSITN}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_TYPE')) && <td>{row.DAC_TYPE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_PWR')) && <td>{row.CAPACITY_PWR}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_UNIT')) && <td>{row.CAPACITY_UNIT}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_COP')) && <td>{row.DAC_COP}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_KW')) && <td>{row.DAC_KW}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_ENV')) && <td>{row.DAC_ENV}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_BRAND')) && <td>{row.DAC_BRAND}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_MODEL')) && <td>{row.DAC_MODEL}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_DESC')) && <td>{row.DAC_DESC}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_NAME')) && <td>{row.DAC_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_MODIF')) && <td>{row.DAC_MODIF}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAC_COMIS')) && <td>{row.DAC_COMIS}</td>}
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
                      <td onDoubleClick={() => exportUnitMachines(unit.value)}>{unit.label}</td>
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
                    <th>Fluidos</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.fluids || []).map((row) => (
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
                    <th>Aplicações</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.applics || []).map((row) => (
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
                    <th>Tipos</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.types || []).map((row) => (
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
                    <th>Ambientes</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.envs || []).map((row) => (
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
                    <th>Sensores</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.psens || []).map((row) => (
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
