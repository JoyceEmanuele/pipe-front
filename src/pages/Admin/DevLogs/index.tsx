import { useEffect, useState } from 'react';

import { Checkbox } from '@material-ui/core';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

import { Input, Button, Loader } from 'components';
import { useStateVar, useDebouncedRender } from 'helpers/useStateVar';
import { useWebSocket } from 'helpers/wsConnection';
import { apiCall } from 'providers';

import { AdminLayout } from '../AdminLayout';
import {
  ContainerInputs,
  DynRow,
  Card,
} from './styles';
import { getUserProfile } from 'helpers/userProfile';
import { withTransaction } from '@elastic/apm-rum-react';

const CSVheader = [
  { label: 'timestamp', key: 'ts' },
  { label: 'topic', key: 'topic' },
  { label: 'payload', key: 'payload' },
];

export const DevLogs = (): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      loading: false,
      log_dev_cmd: { list: [], waitingResponse: null as null|boolean },
      log_dev_ctrl: { list: [], waitingResponse: null as null|boolean },
      aggregatedLogs_all: [] as { ts, topic, payload }[],
      aggregatedLogs_visible: [] as { ts, topic, payload }[],
      resultDevId: null as null|string,
      customFilter: null as null|string,
      wsConn: null,
      liveLogActive: false,
      ocultarSyncDebug: false,
      ocultarEcoRt: false,
      qPars: {
        devId: '',
        periodIni: '',
        periodFin: '',
      },
    };

    const now = new Date();
    const nowShifted = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
    state.qPars.periodIni = `${nowShifted.toISOString().substring(0, 11)}00:00:00`;
    state.qPars.periodFin = nowShifted.toISOString().substring(0, 19);

    return state;
  });
  const debouncedRender = useDebouncedRender(render);

  function logsSorter(a, b) {
    if (a.ts > b.ts) return -1;
    if (a.ts < b.ts) return 1;
    return 0;
  }

  function beginSearch() {
    resetResults();
    if (!state.qPars.devId) return alert('DEV_ID obrigatório');
    if (!state.qPars.periodIni) return alert('Data inicial obrigatória');
    if (!state.qPars.periodFin) return alert('Data final obrigatória');

    const { devId } = state.qPars;
    state.log_dev_cmd.waitingResponse = true;
    state.log_dev_ctrl.waitingResponse = true;
    render();

    Promise.all([
      new Promise(async (resolve, reject) => {
        try {
          const qPars = { dynamoTable: 'log_dev_cmd', ...state.qPars };
          while (true) {
            const { data } = await apiCall('/log/query-dev-log', qPars);
            data.list.forEach((item) => {
              if (item.userId && (typeof item.payload === 'object')) {
                item.payload.userId = item.userId;
              }
            });
            state.aggregatedLogs_all = state.aggregatedLogs_all.concat(data.list).sort(logsSorter);
            if (data.continuesAfter) {
              qPars.periodIni = `${data.continuesAfter}A`;
              continue;
            }
            break;
          }
        } catch (err) {
          console.log(err);
          toast.error('Houve erro');
        }
        state.log_dev_cmd.waitingResponse = false;
        resolve(null);
      }),
      new Promise(async (resolve, reject) => {
        try {
          const qPars = { dynamoTable: 'log_dev_ctrl', ...state.qPars };
          while (true) {
            const { data } = await apiCall('/log/query-dev-log', qPars);
            state.aggregatedLogs_all = state.aggregatedLogs_all.concat(data.list).sort(logsSorter);
            if (data.continuesAfter) {
              qPars.periodIni = `${data.continuesAfter}A`;
              continue;
            }
            break;
          }
        } catch (err) {
          console.log(err);
          toast.error('Houve erro');
        }
        state.log_dev_ctrl.waitingResponse = false;
        resolve(null);
      }),
    ])
      .catch(console.log)
      .then(() => {
        state.resultDevId = devId;
        state.aggregatedLogs_visible = state.aggregatedLogs_all.filter((item) => {
          if (isIgnored(item)) return false;
          item.payload = JSON.stringify(item.payload);
          return true;
        });
        if (state.wsConn) onWsOpen(state.wsConn);
        render();
      });
  }

  function isIgnored(entry) {
    if (state.ocultarSyncDebug) {
      if (entry && entry.topic) {
        if (entry.topic === 'sync') return true;
        if (entry.topic.includes('/sync/')) return true;
      }
      if (entry && entry.payload) {
        if (entry.payload.msgtype === 'SYNC') return true;
        if (entry.payload.msgtype === 'debug-device') return true;
        if (entry.payload.includes) {
          if (entry.payload.includes('"msgtype":"SYNC"')) return true;
          if (entry.payload.includes('"msgtype":"debug-device"')) return true;
        }
      }
    }
    if (state.ocultarEcoRt) {
      if (entry && entry.payload) {
        if (entry.payload.message_type === 'eco_programming') return true;
        if (entry.payload['eco-programming'] != null) return true;
        if (entry.payload.rt != null) return true;
        if (entry.payload.includes) {
          if (entry.payload.includes('"eco_programming"')) return true;
          if (entry.payload.includes('"eco-programming"')) return true;
          if (entry.payload.includes('"rt"')) return true;
        }
      }
    }

    if (state.customFilter) {
      // state.customFilter = `
      //   delete entry.payload.bt_id;
      //   delete entry.payload.package_id;
      //   delete entry.payload.QTD_ITEMS;
      //   delete entry.payload.RMT_PAYLOAD;
      //   delete entry.payload.MAC;
      //   // return true;
      // `;
      try {
        // eslint-disable-next-line
        let ignore = false;
        // eslint-disable-next-line no-eval
        eval(state.customFilter);
        if (ignore) return true;
      } catch (err: any) { console.log(err && err.message); }
    }

    return false;
  }

  function resetResults() {
    state.log_dev_cmd.list = [];
    state.log_dev_ctrl.list = [];
    state.aggregatedLogs_all = [];
    state.aggregatedLogs_visible = [];
    state.log_dev_cmd.waitingResponse = null;
    state.log_dev_ctrl.waitingResponse = null;
    state.resultDevId = null;
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    state.wsConn = wsConn;
    if (state.liveLogActive && state.resultDevId) {
      wsConn.send({ type: 'subscribeDevLog', data: { devId: state.resultDevId } });
    }
  }
  function onWsMessage(payload) {
    if (payload.type === 'logEntry' && payload.data && payload.data.entry) {
      const { table, entry } = payload.data;

      if (table === 'log_dev_cmd') {
        if (entry.userId && (typeof entry.payload === 'object')) {
          entry.payload.userId = entry.userId;
        }
      }

      state.aggregatedLogs_all.unshift(entry);
      if (!isIgnored(entry)) {
        state.aggregatedLogs_visible.unshift(entry);
      }
      entry.payload = JSON.stringify(entry.payload);
      debouncedRender();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'unsubscribeDevLog' });
  }

  useEffect(() => {
    if (state.wsConn) {
      if (state.liveLogActive) onWsOpen(state.wsConn);
      else beforeWsClose(state.wsConn);
    }
  }, [state.liveLogActive]);

  const isWaitingResults = state.log_dev_cmd.waitingResponse || state.log_dev_ctrl.waitingResponse;

  return (
    <>
      <Helmet>
        <title>Diel Energia - Dev Tools</title>
      </Helmet>
      <AdminLayout />
      {(state.loading || isWaitingResults) && <Loader variant="primary" />}
      {(!state.loading) && (
        <Card>
          {/* Dynamo Queries */}
          <div style={{ display: 'flex' }}>
            <ContainerInputs>
              <div>
                <Input
                  value={state.qPars.devId}
                  onChange={(e) => { state.qPars.devId = e.target.value; render(); }}
                  placeholder="DEV_ID"
                />
                <Input
                  style={{ marginTop: '10px' }}
                  value={state.qPars.periodIni}
                  onChange={(e) => { state.qPars.periodIni = e.target.value; render(); }}
                  placeholder="Data inicial"
                />
                <Input
                  style={{ marginTop: '10px' }}
                  value={state.qPars.periodFin}
                  onChange={(e) => { state.qPars.periodFin = e.target.value; render(); }}
                  placeholder="Data final"
                />
                <Button variant="primary" style={{ marginTop: '20px' }} onClick={beginSearch}>
                  Buscar
                </Button>
              </div>
            </ContainerInputs>
            {(profile.user === 'carlos_diel') && (
              <textarea
                style={{ width: '800px', height: '300px', marginLeft: '20px' }}
                placeholder="Filtro: ex: if (entry.payload.bt_id == null) ignore = true;"
                onChange={(event) => { setState({ customFilter: event.target.value }); }}
              >
                {state.customFilter}
              </textarea>
            )}
          </div>
          <div>
            <label style={{ cursor: 'pointer' }}>
              <Checkbox
                checked={state.ocultarSyncDebug}
                onClick={() => setState({ ocultarSyncDebug: !state.ocultarSyncDebug })}
                color="primary"
              />
              Ocultar syncs e debugs
            </label>
            <label style={{ cursor: 'pointer' }}>
              <Checkbox
                checked={state.ocultarEcoRt}
                onClick={() => setState({ ocultarEcoRt: !state.ocultarEcoRt })}
                color="primary"
              />
              Ocultar Eco e RT
            </label>
          </div>
          {(!!state.resultDevId) && (
            <label style={{ marginTop: '15px', cursor: 'pointer' }}>
              <Checkbox
                checked={state.liveLogActive}
                onClick={() => setState({ liveLogActive: !state.liveLogActive })}
                color="primary"
              />
              Habilitar log ao vivo
            </label>
          )}
          {(!!state.aggregatedLogs_all.length) && (
            <>
              <div style={{ paddingTop: '15px' }}>
                <DynRow>
                  <span style={{ fontWeight: 'bold' }}>timestamp</span>
                  <span style={{ fontWeight: 'bold' }}>topic</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>payload</span>
                    <CSVLink
                      headers={CSVheader}
                      data={state.aggregatedLogs_visible}
                      filename="Logs.csv"
                      separator=";"
                      enclosingCharacter={"'"}
                    >
                      <Button type="button" style={{ width: '300px' }} variant="primary">
                        EXPORTAR LISTA
                      </Button>
                    </CSVLink>
                  </div>
                </DynRow>
                {state.aggregatedLogs_visible.map((row) => (
                  <DynRow key={row.ts}>
                    <span>{row.ts}</span>
                    <span>{row.topic}</span>
                    <span>{row.payload}</span>
                  </DynRow>
                ))}
              </div>
              <div style={{ display: 'flex', marginTop: '20px' }}>
                <Button variant="primary" style={{ width: '300px' }} onClick={() => { resetResults(); render(); }}>
                  Limpar
                </Button>
                {/* <q-btn color="primary" onClick="beginSearch" label="Continuar" /> */}
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default withTransaction('DevLogs', 'component')(DevLogs);
