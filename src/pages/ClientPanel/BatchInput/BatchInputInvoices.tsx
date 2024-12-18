import { useEffect } from 'react';

import { toast } from 'react-toastify';

import { Loader, Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallFormData, ApiResps } from 'providers';
import { Table, FileInput } from './styles';
import { colors } from '~/styles/colors';

export const BatchInputInvoices = ({ clientId }): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSending: false,
      columns: {} as ApiResps['/batch-input-columns']['invoices'],
      parsedRows: [] as ApiResps['/check-client-invoices-batch']['list'],
      resultadoEnvio: {} as { [key: string]: string },
      additionalDistributorInfo: { access_points: [], providers: [] } as ApiResps['/four-docs/get-login-data']['list'],
      fourDocsResult: {} as { [key: string]: string },
    };
    return state;
  });

  useEffect(() => {
    fetchServerData();
  }, []);

  async function fetchServerData() {
    try {
      const [
        { invoices: columns },
        { list: additionalDistributorInfo },
      ] = await Promise.all([
        apiCall('/batch-input-columns', { invoices: true }),
        apiCall('/four-docs/get-login-data')]);
      state.columns = columns;
      state.additionalDistributorInfo = additionalDistributorInfo;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  async function onChange_textAreaUnidades(fileRef: any) {
    setState({ isSending: true, parsedRows: [] });
    try {
      // const formData = new FormData();
      // formData.set('CLIENT_ID', clientId);
      // formData.set('file', fileRef);

      const { list } = await apiCallFormData('/check-client-invoices-batch', {
        CLIENT_ID: clientId,
      }, {
        file: fileRef,
      });
      state.parsedRows = list;
    } catch (err) {
      console.log(err);
      toast.error('Erro ao analisar os dados inseridos');
      // toast.error('Não foi possível interpretar os dados inseridos');
      state.parsedRows = [];
    }
    setState({ isSending: false });
  }

  async function confirmouEnviar() {
    try {
      setState({ isSending: true, resultadoEnvio: {} });
      const response = await apiCall('/add-client-invoices-batch', {
        CLIENT_ID: clientId,
        invoices: state.parsedRows,
      });
      for (const row of (response.added || [])) {
        console.log(row);
        if (!row.key) continue;
        state.resultadoEnvio[row.key] = 'Salvo!';
        if (!row.sendToFourDocs) {
          state.fourDocsResult[row.key] = 'Não foi possível enviar as informações para a Four Docs!';
        }
        else {
          state.fourDocsResult[row.key] = '';
        }
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
      <h3>Unidades</h3>
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
                  <td>{(state.columns!.UNIT_ID || {}).label}</td>
                  <td>{(state.columns!.CONSUMER_UNIT || {}).label}</td>
                  <td>{(state.columns!.DISTRIBUTOR_NAME || {}).label}</td>
                  <td>{(state.columns!.ADDITIONAL_DISTRIBUTOR_INFO || {}).label}</td>
                  <td>{(state.columns!.LOGIN || {}).label}</td>
                  <td>{(state.columns!.PASSWORD || {}).label}</td>
                  <td>{(state.columns!.LOGIN_EXTRA || {}).label}</td>
                  <td>{(state.columns!.BASELINE_TEMPLATE || {}).label}</td>
                  <td>{(state.columns!.JANUARY_PRICE || {}).label}</td>
                  <td>{(state.columns!.JANUARY_KWH || {}).label}</td>
                  <td>{(state.columns!.FEBRUARY_PRICE || {}).label}</td>
                  <td>{(state.columns!.FEBRUARY_KWH || {}).label}</td>
                  <td>{(state.columns!.MARCH_PRICE || {}).label}</td>
                  <td>{(state.columns!.MARCH_KWH || {}).label}</td>
                  <td>{(state.columns!.APRIL_PRICE || {}).label}</td>
                  <td>{(state.columns!.APRIL_KWH || {}).label}</td>
                  <td>{(state.columns!.MAY_PRICE || {}).label}</td>
                  <td>{(state.columns!.MAY_KWH || {}).label}</td>
                  <td>{(state.columns!.JUNE_PRICE || {}).label}</td>
                  <td>{(state.columns!.JUNE_KWH || {}).label}</td>
                  <td>{(state.columns!.JULLY_PRICE || {}).label}</td>
                  <td>{(state.columns!.JULLY_KWH || {}).label}</td>
                  <td>{(state.columns!.AUGUST_PRICE || {}).label}</td>
                  <td>{(state.columns!.AUGUST_KWH || {}).label}</td>
                  <td>{(state.columns!.SEPTEMBER_PRICE || {}).label}</td>
                  <td>{(state.columns!.SEPTEMBER_KWH || {}).label}</td>
                  <td>{(state.columns!.OCTOBER_PRICE || {}).label}</td>
                  <td>{(state.columns!.OCTOBER_KWH || {}).label}</td>
                  <td>{(state.columns!.NOVEMBER_PRICE || {}).label}</td>
                  <td>{(state.columns!.NOVEMBER_KWH || {}).label}</td>
                  <td>{(state.columns!.DECEMBER_PRICE || {}).label}</td>
                  <td>{(state.columns!.DECEMBER_KWH || {}).label}</td>
                </tr>
              </thead>
              <tbody>
                {state.parsedRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                      {state.resultadoEnvio[row.key] && <div>{state.resultadoEnvio[row.key]}</div>}
                      {state.fourDocsResult[row.key] && <div>{state.fourDocsResult[row.key]}</div>}
                    </td>
                    <td>{row.UNIT_ID}</td>
                    <td>{row.CONSUMER_UNIT}</td>
                    <td>{row.DISTRIBUTOR_NAME}</td>
                    <td>{row.ADDITIONAL_DISTRIBUTOR_INFO}</td>
                    <td>{row.LOGIN}</td>
                    <td>•••••••••••</td>
                    <td>{row.LOGIN_EXTRA}</td>
                    <td>{row.BASELINE_TEMPLATE}</td>
                    <td>{row.JANUARY_PRICE}</td>
                    <td>{row.JANUARY_KWH}</td>
                    <td>{row.FEBRUARY_PRICE}</td>
                    <td>{row.FEBRUARY_KWH}</td>
                    <td>{row.MARCH_PRICE}</td>
                    <td>{row.MARCH_KWH}</td>
                    <td>{row.APRIL_PRICE}</td>
                    <td>{row.APRIL_KWH}</td>
                    <td>{row.MAY_PRICE}</td>
                    <td>{row.MAY_KWH}</td>
                    <td>{row.JUNE_PRICE}</td>
                    <td>{row.JUNE_KWH}</td>
                    <td>{row.JULLY_PRICE}</td>
                    <td>{row.JULLY_KWH}</td>
                    <td>{row.AUGUST_PRICE}</td>
                    <td>{row.AUGUST_KWH}</td>
                    <td>{row.SEPTEMBER_PRICE}</td>
                    <td>{row.SEPTEMBER_KWH}</td>
                    <td>{row.OCTOBER_PRICE}</td>
                    <td>{row.OCTOBER_KWH}</td>
                    <td>{row.NOVEMBER_PRICE}</td>
                    <td>{row.NOVEMBER_KWH}</td>
                    <td>{row.DECEMBER_PRICE}</td>
                    <td>{row.DECEMBER_KWH}</td>
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

      {(state.additionalDistributorInfo.providers.length !== 0)
        && (
        <>
          <p style={{ paddingTop: '30px' }}>Valores tabelados</p>
          <div style={{ display: 'flex', overflow: 'auto' }}>
            <div>
              <Table>
                <thead>
                  <tr>
                    <th>Distribuidora</th>
                    <th>Informação Adicional da Distribuidora</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.additionalDistributorInfo.providers || []).map((distributor, i) => (
                    <tr key={i}>
                      <td>{distributor.name}</td>
                      <td>
                        {(distributor.access_points).map((accessPoint, j) => (
                          <div key={j}>
                            {accessPoint}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )) }
                </tbody>
              </Table>
            </div>
          </div>
        </>
        )}
    </div>
  );
};
