import { useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Loader, Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import {
  apiCall,
  ApiResps,
  apiCallFormData,
  apiCallDownload,
} from 'providers';
import { colors } from 'styles/colors';
import { CustomizedButton } from '~/components/CutomizedButton';
import { stateObject } from '../../../helpers/batchInputHelpers';

/*
Sempre que adicionar novas funcionalidades na planilha, atualizar o guia da planilha no S3.
*/

export const BatchInputAssets = ({ clientId }): JSX.Element => {
  const [state, render, setState] = useStateVar(stateObject());

  useEffect(() => {
    fetchServerData();
  }, []);

  async function fetchServerData() {
    try {
      const [
        { assets: fetchedColumns },
        comboOpts,
      ] = await Promise.all([
        apiCall('/batch-input-columns', { assets: true }),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
          units: true,
          groups: true,
          fluids: true,
          applics: true,
          types: true,
          envs: true,
          brands: true,
          roles: true,
        }),
      ]);
      state.comboOpts = comboOpts;
      state.columns = fetchedColumns;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  async function exportUnitMachines(unitId: number) {
    try {
      const exportResponse = await apiCallDownload('/export-client-assets-batch-input', {
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

      const { list, tableCols } = await apiCallFormData('/check-client-assets-batch', {
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
      const response = await apiCall('/add-client-assets-batch', {
        CLIENT_ID: clientId,
        assets: state.parsedRows,
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
    setState({ isSending: false, sended: true });
  }

  if (state.isLoading || state.isSending) return <Loader />;

  async function getAssetsManual() {
    try {
      const manual = await apiCallDownload('/get-assets-sheet-manual', {});
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') {
        window.URL.revokeObjectURL(link.href);
      }
      link.href = window.URL.createObjectURL(manual.data);
      link.download = 'Guia-Planilha-Ativos.pdf';

      link.click();
    } catch (err) {
      console.log(err); toast.error('Não foi possível buscar o manual!'); }
  }
  const columns = state.columns as ApiResps['/batch-input-columns']['assets'];
  return (
    <div>
      <a href="#" style={{ display: 'none' }} id="downloadLink" />
      <h3>Ativos</h3>
      <CustomizedButton description="Guia da Planilha" variant="download" onClick={getAssetsManual} />
      {(state.parsedRows.length === 0) && (
        <>
          <div style={{ overflow: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  {Object.values(state.columns!).map((col) => <th key={col.label}>{col.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {columns && (
                  columns?.UNIT_NAME.exampleList.map((_item, index) => (
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
            Obs: A data no arquivo .xlsx deve estar como texto = &apos;DD/MM/AAAA
          </p>
          <FileInput onChange={(e: any) => { onChange_textAreaUnidades(e.target.files[0]); }} style={{ backgroundColor: colors.Blue300, borderColor: colors.Blue300, padding: '10px' }}>
            <span style={{ display: 'inline-block', width: '200px', textAlign: 'center' }}>
              Selecionar Arquivo
            </span>
            <input type="file" hidden />
          </FileInput>
        </>
      )}

      {(state.parsedRows.length > 0) && (
        <>
          <div style={{ overflow: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>Status</th>
                  {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{(columns?.UNIT_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('GROUP_ID')) && <td>{(columns?.GROUP_ID || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('GROUP_NAME')) && <td>{(columns?.GROUP_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_DATE')) && <td>{(columns?.INSTALLATION_DATE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MCHN_APPL')) && <td>{(columns?.MCHN_APPL || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('GROUP_TYPE')) && <td>{(columns?.GROUP_TYPE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MCHN_BRAND')) && <td>{(columns?.MCHN_BRAND || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('FLUID_TYPE')) && <td>{(columns?.FLUID_TYPE || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_1')) && <td>{(columns?.PHOTO_1 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_2')) && <td>{(columns?.PHOTO_2 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_3')) && <td>{(columns?.PHOTO_3 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_4')) && <td>{(columns?.PHOTO_4 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_5')) && <td>{(columns?.PHOTO_5 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DEV_AUTOM_ID')) && <td>{(columns?.DEV_AUTOM_ID || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DUT_ID')) && <td>{(columns?.DUT_ID || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DAT_ID')) && <td>{(columns?.DAT_ID || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('AST_DESC')) && <td>{(columns?.AST_DESC || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_LOCATION')) && <td>{(columns?.INSTALLATION_LOCATION || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('AST_ROLE_NAME')) && <td>{(columns?.AST_ROLE_NAME || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MCHN_MODEL')) && <td>{(columns?.MCHN_MODEL || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_PWR')) && <td>{(columns?.CAPACITY_PWR || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_UNIT')) && <td>{(columns?.CAPACITY_UNIT || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('MCHN_KW')) && <td>{(columns?.MCHN_KW || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('DEV_ID')) && <td>{(columns?.DEV_ID || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_6')) && <td>{(columns?.PHOTO_6 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_7')) && <td>{(columns?.PHOTO_7 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_8')) && <td>{(columns?.PHOTO_8 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_9')) && <td>{(columns?.PHOTO_9 || {}).label}</td>}
                  {((!state.parsedCols) || state.parsedCols.includes('PHOTO_10')) && <td>{(columns?.PHOTO_10 || {}).label}</td>}
                </tr>
              </thead>
              <tbody>
                {state.parsedRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                      {state.resultadoEnvio[row.key] && <div>{state.resultadoEnvio[row.key]}</div>}
                    </td>
                    {((!state.parsedCols) || state.parsedCols.includes('UNIT_NAME')) && <td>{row.UNIT_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('GROUP_ID')) && <td>{row.GROUP_ID}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('GROUP_NAME')) && <td>{row.GROUP_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_DATE')) && <td>{row.INSTALLATION_DATE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MCHN_APPL')) && <td>{row.MCHN_APPL}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('GROUP_TYPE')) && <td>{row.GROUP_TYPE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MCHN_BRAND')) && <td>{row.MCHN_BRAND}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('FLUID_TYPE')) && <td>{row.FLUID_TYPE}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_1')) && <td>{row.PHOTO_1}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_2')) && <td>{row.PHOTO_2}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_3')) && <td>{row.PHOTO_3}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_4')) && <td>{row.PHOTO_4}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_5')) && <td>{row.PHOTO_5}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DEV_AUTOM_ID')) && <td>{row.DEV_AUTOM_ID}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DUT_ID')) && <td>{row.DUT_ID}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DAT_ID')) && <td>{row.DAT_ID}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('AST_DESC')) && <td>{row.AST_DESC}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('INSTALLATION_LOCATION')) && <td>{row.INSTALLATION_LOCATION}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('AST_ROLE_NAME')) && <td>{row.AST_ROLE_NAME}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MCHN_MODEL')) && <td>{row.MCHN_MODEL}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_PWR')) && <td>{row.CAPACITY_PWR}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('CAPACITY_UNIT')) && <td>{row.CAPACITY_UNIT}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('MCHN_KW')) && <td>{row.MCHN_KW}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('DEV_ID')) && <td>{row.DEV_ID}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_6')) && <td>{row.PHOTO_6}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_7')) && <td>{row.PHOTO_7}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_8')) && <td>{row.PHOTO_8}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_9')) && <td>{row.PHOTO_9}</td>}
                    {((!state.parsedCols) || state.parsedCols.includes('PHOTO_10')) && <td>{row.PHOTO_10}</td>}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div style={{ display: 'flex', paddingTop: '30px' }}>
            {!state.sended
              && (
              <Button style={{ width: '140px' }} onClick={confirmouEnviar} variant="primary">
                Enviar
              </Button>
              )}
            {!state.sended
              && (
                <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => setState({ parsedRows: [], sended: false })} variant="grey">
                  Cancelar
                </Button>
              )}
            {state.sended && (
              <Link to={`/painel/clientes/editar-cliente/${clientId}`}>
                <Button style={{ width: '140px', color: 'black' }} variant="grey">
                  Voltar
                </Button>
              </Link>
            )}

          </div>
        </>
      )}

      {(state.parsedRows.length === 0) && (
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
                    <th>Funções</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.comboOpts.roles || []).map((row) => (
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
