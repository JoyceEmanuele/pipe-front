import { useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import { Loader, Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallFormData, ApiResps } from 'providers';
import { colors } from 'styles/colors';
import { useTranslation } from 'react-i18next';

export const BatchInputUnits = ({ clientId }): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSending: false,
      columns: {} as ApiResps['/batch-input-columns']['units'],
      parsedRows: [] as ApiResps['/check-client-units-batch']['list'],
      resultadoEnvio: {} as { [key: string]: string },
    };
    return state;
  });

  useEffect(() => {
    fetchServerData();
  }, []);

  async function fetchServerData() {
    try {
      const [
        { units: columns },
      ] = await Promise.all([
        apiCall('/batch-input-columns', { units: true }),
      ]);
      state.columns = columns;
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    state.isLoading = false; render();
  }

  async function onChange_textAreaUnidades(fileRef: any) {
    setState({ isSending: true, parsedRows: [] });
    try {
      // const formData = new FormData();
      // formData.set('CLIENT_ID', clientId);
      // formData.set('file', fileRef);

      const { list } = await apiCallFormData('/check-client-units-batch', {
        CLIENT_ID: clientId,
      }, {
        file: fileRef,
      });
      state.parsedRows = list;
    } catch (err) {
      console.log(err);
      toast.error(t('erroAnalisarDadosInseridos'));
      // toast.error('Não foi possível interpretar os dados inseridos');
      state.parsedRows = [];
    }
    setState({ isSending: false });
  }

  async function confirmouEnviar() {
    try {
      setState({ isSending: true, resultadoEnvio: {} });
      const response = await apiCall('/add-client-units-batch', {
        CLIENT_ID: clientId,
        units: state.parsedRows,
      });
      for (const row of (response.added || [])) {
        if (!row.key) continue;
        state.resultadoEnvio[row.key] = 'Salvo!';
      }
      for (const row of (response.ignored || [])) {
        if ((!row.key) || (!row.reason)) continue;
        state.resultadoEnvio[row.key] = row.reason;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ isSending: false });
  }

  if (state.isLoading || state.isSending) return <Loader />;

  return (
    <div>
      <h3>{t('unidades')}</h3>
      {(state.parsedRows.length === 0)
        && (
        <>
          <div style={{ overflow: 'auto' }}>
            <Table style={{ textAlign: 'center' }}>
              <thead>
                <tr>
                  {Object.values(state.columns!).map((col) => <th key={col.label}>{col.label}</th>)}
                  <th>{t('endereco')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(state.columns!).map((col) => <td key={col.label}>{col.example}</td>)}
                  <td>{t('exemploRuaVoluntariosPatria190')}</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <p>
            {t('copieTabelaAcimaColeEditorPlanilhas')}
            <br />
            {t('preenchaTabelaSalveComoXLSX')}
            <br />
          </p>
          <FileInput onChange={(e: any) => { onChange_textAreaUnidades(e.target.files[0]); }} style={{ backgroundColor: colors.Blue300, borderColor: colors.Blue300, padding: '10px' }}>
            <span style={{ display: 'inline-block', width: '200px', textAlign: 'center' }}>
              {t('selecionarArquivo')}
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
                  <th>{t('status')}</th>
                  <td>{(state.columns!.UNIT_NAME || {}).label}</td>
                  <td>{(state.columns!.COUNTRY_NAME || {}).label}</td>
                  <td>{(state.columns!.STATE_ID || {}).label}</td>
                  <td>{(state.columns!.CITY_NAME || {}).label}</td>
                  <td>{(state.columns!.LATLONG || {}).label}</td>
                  <td>{(state.columns!.PRODUCTION || {}).label}</td>
                  <td>{(state.columns!.TIMEZONE_AREA || {}).label}</td>
                  <th>{t('extras')}</th>
                </tr>
              </thead>
              <tbody>
                {state.parsedRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                      {state.resultadoEnvio[row.key] && <div>{state.resultadoEnvio[row.key]}</div>}
                    </td>
                    <td>{row.UNIT_NAME}</td>
                    <td>{row.COUNTRY_NAME}</td>
                    <td>{row.STATE_ID}</td>
                    <td>{row.CITY_NAME}</td>
                    <td>{row.LATLONG}</td>
                    <td>{row.PRODUCTION}</td>
                    <td>{row.TIMEZONE_AREA}</td>
                    <td>
                      <pre style={{ margin: '0' }}>{(row.extras || []).map((x) => x.join(': ')).join('\n')}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div style={{ display: 'flex', paddingTop: '30px' }}>
            <Button style={{ width: '140px' }} onClick={confirmouEnviar} variant="primary">
              {t('botaoEnviar')}
            </Button>
            <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => setState({ parsedRows: [] })} variant="grey">
              {t('botaoCancelar')}
            </Button>
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
