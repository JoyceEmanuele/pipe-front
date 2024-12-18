import { ChangeEvent, useEffect } from 'react';
import { t } from 'i18next';
import { Helmet } from 'react-helmet';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  Input, Checkbox, Button, Loader,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { SchedulesList, SchedulesEdit } from 'pages/Analysis/SchedulesModals/DUT_Schedule';
import { apiCall, ApiResps } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';

import { TUnitInfo, UnitLayout } from '../UnitLayout';
import { withTransaction } from '@elastic/apm-rum-react';

export const SchedTurnConfig = (): JSX.Element => {
  const routePars = useParams<{ unitId: string, roomId?: string }>();
  const history = useHistory();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      loading: true,
      unitId: Number(routePars.unitId || 0),
      roomInf: null as null|ApiResps['/clients/get-room-info-v2']['info'],
      dutsList: [] as { ROOM_NAME: string, DEV_ID: string, checked?: boolean, turns?: ('ON'|'OFF')[] }[],
      unitInfo: null as null| TUnitInfo,
      schedulesTypeActive: 'List' as 'List'|'Add'|'Edit'|'Remove',
      editedDay: null as null|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun',
      newRoomName: '',
      newPeriodDays: '7',
      numPeriods: '2',
      newStartDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().substr(0, 10),
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    try {
      setState({ loading: true });
      if (routePars.roomId) {
        const response = await apiCall('/clients/get-room-info-v2', { ROOM_ID: Number(routePars.roomId) });
        const { info } = response;
        if (!info.progs) {
          info.progs = {
            ON: { week: {}, exceptions: {} },
            OFF: { week: {}, exceptions: {} },
          };
        }
        if (!info.schedTurn) {
          info.schedTurn = {
            numDays: 7,
            datRef: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().substr(0, 10),
            devs: {},
          };
        }
        state.roomInf = info;
        const { list: dutsList } = await apiCall('/dut/get-duts-list', { unitIds: [info.UNIT_ID], onlyWithAutomation: true });
        state.dutsList = dutsList;
        state.newPeriodDays = (state.roomInf.schedTurn!.numDays || 7).toString();
        if (state.roomInf.schedTurn!.datRef) {
          state.newStartDate = state.roomInf.schedTurn!.datRef.toString();
        }
        for (const dut of state.dutsList) {
          dut.turns = state.roomInf.schedTurn!.devs[dut.DEV_ID] || [];
          dut.checked = dut.turns.length > 0;
          if (dut.turns.length > 1) {
            state.numPeriods = dut.turns.length.toString();
          }
        }
        render();
        state.unitInfo = await apiCall('/clients/get-unit-info', { unitId: state.unitId });
      } else {
        const [
          unitInfo,
        ] = await Promise.all([
          apiCall('/clients/get-unit-info', { unitId: state.unitId }),
        ]);
        state.unitInfo = unitInfo;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ loading: false });
  }

  async function submitNewRoom() {
    const clientId = (state.roomInf && state.roomInf.CLIENT_ID) || (state.unitInfo && state.unitInfo.CLIENT_ID);
    if (!clientId) return alert(t('erroCliente'));
    if (!state.unitId) return alert(t('erroAcharUnidade'));
    // if (!state.selectedClient) return alert('Selecione um cliente');
    // if (!state.selectedUnit) return alert('Selecione uma unidade');
    if (!state.newRoomName) return alert(t('digiteNome'));
    try {
      const { info: newRoom } = await apiCall('/clients/add-new-room', {
        CLIENT_ID: clientId, // state.selectedClient.CLIENT_ID,
        UNIT_ID: state.unitId, // state.selectedUnit.UNIT_ID,
        ROOM_NAME: state.newRoomName,
      });
      history.push(`/analise/unidades/perfil/${newRoom.UNIT_ID}`);
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  async function saveProgInfo() {
    if (!state.roomInf) return;
    const schedTurn = {
      numDays: Number(state.newPeriodDays),
      datRef: state.newStartDate,
      devs: {},
    };
    for (const dut of state.dutsList) {
      if (!dut.checked) continue;
      schedTurn.devs[dut.DEV_ID] = dut.turns!;
    }
    try {
      await apiCall('/clients/set-room-progs-v2', {
        ROOM_ID: state.roomInf.ROOM_ID,
        progs: state.roomInf.progs!,
        schedTurn,
      });
      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  const numPeriods = Number(state.numPeriods);
  for (const dut of state.dutsList) {
    if (!dut.turns) dut.turns = [];
    while (dut.turns.length > numPeriods) dut.turns.pop();
    while (dut.turns.length < numPeriods) dut.turns.push('ON');
  }

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaConfiguracoes')}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />

      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <>
          {(!state.roomInf) && (
            <div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column', width: '400px', gap: '12px', padding: '12px',
                }}
              >
                <Input
                  label={t('nome')}
                  value={state.newRoomName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ newRoomName: event.target.value })}
                />
                <Button variant="primary" onClick={submitNewRoom}>{t('adicionar')}</Button>
              </div>
            </div>
          )}
          {(state.roomInf) && (
            <>
              <h2>{state.roomInf.ROOM_NAME}</h2>
              {(state.roomInf.progs && state.roomInf.schedTurn && state.roomInf.progs.ON && state.roomInf.progs.OFF) && (
                <>
                  <div style={{ display: 'flex', gap: '50px' }}>
                    <div style={{ width: '50%' }}>
                      <div>{t('programacaoON')}</div>
                      <SchedEditor fullSched={state.roomInf.progs.ON} />
                    </div>
                    <div style={{ width: '50%' }}>
                      <div>{t('programacaoBackup')}</div>
                      <SchedEditor fullSched={state.roomInf.progs.OFF} />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex', flexDirection: 'column', width: '400px', gap: '12px', padding: '12px',
                    }}
                  >
                    <Input
                      label={t('diasEntreRevezamentos')}
                      value={state.newPeriodDays}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ newPeriodDays: event.target.value })}
                    />
                    <Input
                      label={t('numeroPeriodosDistintos')}
                      type="number"
                      value={state.numPeriods}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ numPeriods: event.target.value })}
                    />
                    <Input
                      label={t('dataInicio')}
                      value={state.newStartDate}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ newStartDate: event.target.value })}
                    />
                  </div>
                  <div>
                    <TableBasic>
                      <tr>
                        <th>DUT</th>
                        {Array(numPeriods).fill(0).map((_, i) => (
                          <th key={i}>{i + 1}</th>
                        ))}
                      </tr>
                      {state.dutsList.map((dut) => (
                        <tr key={dut.DEV_ID}>
                          <td>
                            <Checkbox
                              label={dut.ROOM_NAME ? `${dut.ROOM_NAME} (${dut.DEV_ID})` : dut.DEV_ID}
                              checked={dut.checked}
                              onClick={() => { dut.checked = !dut.checked; render(); }}
                            />
                          </td>
                          {dut.turns!.map((val, i) => (
                            <td key={i} onClick={() => { if (val === 'ON') { dut.turns![i] = 'OFF'; } else { dut.turns![i] = 'ON'; } render(); }}>
                              {dut.checked ? ((val === 'OFF') ? 'Backup' : val) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </TableBasic>
                    {(state.dutsList.length === 0) && (
                      <div>{t('nenhumDUTDisponivelUnidade')}</div>
                    )}
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <Button onClick={saveProgInfo} variant="primary" style={{ width: '300px' }}>{t('salvar')}</Button>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

function SchedEditor(props: { fullSched: FullProg_v4 }) {
  const { fullSched } = props;
  const [state, render, setState] = useStateVar(() => {
    const state = {
      schedulesTypeActive: 'List' as 'List'|'Add'|'Edit',
      editedDay: null as null|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun',
    };
    return state;
  });

  async function wantSaveVent(ventInput: string) {
    const ventilation = (ventInput && Number(ventInput)) || 0;
    fullSched.ventTime = { begin: ventilation, end: ventilation };
    render();
  }

  async function wantSaveCtrl(mode: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED', temperature: number, LTC: number, LTI: number) {
    fullSched.temprtControl = {
      mode,
      temperature,
      LTC,
      LTI,
    };
    render();
  }

  async function wantDelException(day: string) {
    if (!fullSched.exceptions) return;
    if (!fullSched.exceptions[day]) return;
    if (!window.confirm(t('temCerteza'))) return;
    delete fullSched.exceptions[day];
    render();
  }

  async function onConfirmProg(days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[], prog: DayProg) {
    for (const day of days) {
      fullSched.week[day] = prog;
    }
    setState({ schedulesTypeActive: 'List', editedDay: null });
  }

  async function onConfirmExcept(day: string, prog: DayProg) {
    if (!fullSched.exceptions) fullSched.exceptions = {};
    fullSched.exceptions[day] = prog;
    setState({ schedulesTypeActive: 'List', editedDay: null });
  }

  async function wantRemoveWeekProg(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') {
    if (!fullSched.week[day]) return;
    if (!window.confirm(t('temCerteza'))) return;
    delete fullSched.week[day];
    render();
  }

  return (
    <div style={{ padding: '10px', border: '1px solid grey', borderRadius: '8px' }}>
      {(state.schedulesTypeActive === 'List') && (
        <SchedulesList
          devSched={fullSched}
          wantDelException={wantDelException}
          wantSaveVent={wantSaveVent}
          wantSaveCtrl={wantSaveCtrl}
          wantRemoveDay={wantRemoveWeekProg}
          wantAddProg={() => setState({ schedulesTypeActive: 'Add', editedDay: null })}
          wantEditDay={(day) => setState({ schedulesTypeActive: 'Edit', editedDay: day })}
          isLoading={false}
          temprtControl
        />
      )}
      {(state.schedulesTypeActive === 'Edit') && (
        <SchedulesEdit
          devSched={fullSched}
          selectedDay={state.editedDay}
          onConfirmProg={onConfirmProg}
          onConfirmExcept={onConfirmExcept}
          onCancel={() => setState({ schedulesTypeActive: 'List', editedDay: null })}
          isSending={false}
        />
      )}
      {(state.schedulesTypeActive === 'Add') && (
        <SchedulesEdit
          devSched={fullSched}
          selectedDay={null}
          onConfirmProg={onConfirmProg}
          onConfirmExcept={onConfirmExcept}
          onCancel={() => setState({ schedulesTypeActive: 'List', editedDay: null })}
          isSending={false}
        />
      )}
    </div>
  );
}

const TableBasic = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

export default withTransaction('SchedTurnConfig', 'component')(SchedTurnConfig);
