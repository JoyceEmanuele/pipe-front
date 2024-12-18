import { useEffect } from 'react';

import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { Loader, Button } from 'components';
import { Table, FileInput } from './styles';
import { useStateVar } from 'helpers/useStateVar';
import {
  apiCall, apiCallFormData, ApiResps, ApiParams,
} from 'providers';
import { colors } from 'styles/colors';
import { driApplicationCfgs, installationTypeOpts } from 'helpers/driConfigOptions';

function getNormalizedOpt(optList, name) {
  if (optList && name) {
    return optList.find((opt) => opt.name.toLowerCase().trim().replaceAll(' ', '') === name.toLowerCase().trim().replaceAll(' ', ''));
  }
  return null;
}

export const BatchInputDRIs = ({ clientId }): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSending: false,
      columns: {} as ApiResps['/batch-input-columns']['dris'],
      parsedRows: [] as ApiResps['/check-client-dris-batch']['list'],
      resultadoEnvio: {} as { [key: string]: string },
      comboOpts: {} as {
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
        { dris: columns },
        comboOpts,
      ] = await Promise.all([
        apiCall('/batch-input-columns', { dris: true }),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
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
      const { list } = await apiCallFormData('/check-client-dris-batch', {
        CLIENT_ID: clientId,
      }, {
        file: fileRef,
      });
      state.parsedRows = list;
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
      const response = await apiCall('/add-client-dris-batch', {
        CLIENT_ID: clientId,
        dris: state.parsedRows,
      });
      for (const row of (response.added || [])) {
        if (!row.key) continue;
        if (row.driId && row.driCfg) {
          let cfg = { driId: row.driId } as ApiParams['/upload-dri-varscfg'];
          if (row.driCfg.application === 'Medidor de Energia' && row.driCfg.meterModel) {
            cfg = {
              driId: row.driId,
              ...driApplicationCfgs[row.driCfg.meterModel],
              telemetryInterval: row.driCfg.telemetryInterval,
              capacityTc: row.driCfg.capacityTc,
              installationType: row.driCfg.meterModel && getNormalizedOpt(installationTypeOpts[row.driCfg.meterModel], row.driCfg.installationType)?.value,
            };
          } else if (row.driCfg.application === 'VAV' && row.driCfg.vavModel) {
            cfg = { driId: row.driId, ...driApplicationCfgs[row.driCfg.vavModel], telemetryInterval: row.driCfg.telemetryInterval };
          } else {
            cfg = { driId: row.driId, ...driApplicationCfgs[row.driCfg.application], telemetryInterval: row.driCfg.telemetryInterval };
          }
          try {
            await apiCallFormData('/upload-dri-varscfg', cfg, { file: null });
            state.resultadoEnvio[row.key] = 'Salvo!';
          } catch (err) {
            const error = err as AxiosError;
            console.log(err);
            state.resultadoEnvio[row.key] = 'Erro!';
            if (error.response?.status !== 500) {
              toast.error(`${error.response?.data} - ${row.driId}`);
            } else {
              toast.error(`Houve erro - ${row.driId}`);
            }
          }
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
      <h3>DRIs</h3>
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
                    <td>{(state.columns?.UNIT_NAME || {}).label}</td>
                    <td>{(state.columns?.APPLICATION || {}).label}</td>
                    <td>{(state.columns?.DRI_ID || {}).label}</td>
                    <td>{(state.columns?.GROUP || {}).label}</td>
                    <td>{(state.columns?.ROOM || {}).label}</td>
                    <td>{(state.columns?.ENERGY_METER_SERIAL || {}).label}</td>
                    <td>{(state.columns?.ENERGY_METER_MODEL || {}).label}</td>
                    <td>{(state.columns?.THERM_MANUF || {}).label}</td>
                    <td>{(state.columns?.THERM_MODEL || {}).label}</td>
                    <td>{(state.columns?.VALVE_MANUF || {}).label}</td>
                    <td>{(state.columns?.VALVE_MODEL || {}).label}</td>
                    <td>{(state.columns?.BOX_MANUF || {}).label}</td>
                    <td>{(state.columns?.BOX_MODEL || {}).label}</td>
                    <td>{(state.columns?.TC_CAPACITY || {}).label}</td>
                    <td>{(state.columns?.INSTALLATION_TYPE || {}).label}</td>
                    <td>{(state.columns?.TELEMETRY_INTERVAL || {}).label}</td>
                    <td>{(state.columns?.PHOTO_1 || {}).label}</td>
                    <td>{(state.columns?.PHOTO_2 || {}).label}</td>
                    <td>{(state.columns?.PHOTO_3 || {}).label}</td>
                    <td>{(state.columns?.PHOTO_4 || {}).label}</td>
                    <td>{(state.columns?.PHOTO_5 || {}).label}</td>
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
                      <td>{row.APPLICATION}</td>
                      <td>{row.DRI_ID}</td>
                      <td>{row.GROUP}</td>
                      <td>{row.ROOM}</td>
                      <td>{row.ENERGY_METER_SERIAL}</td>
                      <td>{row.ENERGY_METER_MODEL}</td>
                      <td>{row.THERM_MANUF}</td>
                      <td>{row.THERM_MODEL}</td>
                      <td>{row.VALVE_MANUF}</td>
                      <td>{row.VALVE_MODEL}</td>
                      <td>{row.BOX_MANUF}</td>
                      <td>{row.BOX_MODEL}</td>
                      <td>{row.TC_CAPACITY}</td>
                      <td>{row.INSTALLATION_TYPE}</td>
                      <td>{row.TELEMETRY_INTERVAL}</td>
                      <td>{row.PHOTO_1}</td>
                      <td>{row.PHOTO_2}</td>
                      <td>{row.PHOTO_3}</td>
                      <td>{row.PHOTO_4}</td>
                      <td>{row.PHOTO_5}</td>
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
    </div>
  );
};
