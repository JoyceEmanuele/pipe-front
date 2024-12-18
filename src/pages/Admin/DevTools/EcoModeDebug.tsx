import {
  Button,
  Loader,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import styled from 'styled-components';

interface PeriodData {
  permission: 'allow' | 'forbid'
  start: string // '00:00'
  end: string // '23:59'
  indexIni: number
  indexEnd: number
  days: string[]
  fullDay: boolean
}

interface Resposta {
  agora: string,
  damEcoDebug: {
    [damId: string]: {
      ecoCfg: {
        ENABLE_ECO: number
        ECO_CFG: string
        ECO_OFST_START: number
        ECO_OFST_END: number
        ECO_INT_TIME: number
        SCHEDULE_START_BEHAVIOR: string
        SETPOINT: number
        LTC: number
        LTI: number
        UPPER_HYSTERESIS: number
        LOWER_HYSTERESIS: number
        SELF_REFERENCE: number
        MINIMUM_TEMPERATURE: number
        MAXIMUM_TEMPERATURE: number
        CAN_SELF_REFERENCE: number
        splitCond: boolean
      },
      lastDamTelem: {
        lastTelemetry: {
          dev_id: string
          timestamp: string
          Mode?: 'Auto' | 'Manual' | 'Local'
          State?: 'allow' | 'forbid' | 'onlyfan' | 'enabling' | 'disabling' | 'eco' | 'thermostat'
          status?: string
          Temperature?: string
          Temperature_1?: string
        }
      },
      damSched_current: PeriodData,
      damEcoState: {
        sleep_ts?: number,
        sleep_ts_eco_v2?: number,
        sleep_ts_eco_v2_to_cool?: number,
        cmd_state?: string,
        cmd_exp?: number,
        condensersEnabled?: boolean,
        duts: {
          [dutId: string]: {
            telmTS: number
            accLOW: number
            accAfterCool?: number
          }
        },
        stagesEcoV2?: 'before-setpoint'|'after-LTC'|'after-LTI',
        counterToLog?: number,
      },
      assocDuts: {
        [dutId: string]: {
          lastDutTelem: {
            dev_id: string;
            timestamp: string;
            Temperature: number;
            Temperature_1: number;
            Humidity: number;
            eCO2: number;
            TVOC: number;
            raw_eCO2: number;
            Tmp: number;
            operation_mode: number;
          },
          dutSched_current: PeriodData,
          TUSEMIN: number,
          proxCmd: string,
        }
      },
    }
  }
}

export function EcoModeDebug(): JSX.Element {
  const [state, render, setState] = useStateVar({
    enviando: false,
    dams: [] as {
      damId: string
      cmd_state: string
      cmd_exp: string
      state: string
      mode: string
      SETPOINT: string
      duts: {
        dutId: string,
        T0: string,
        TUSEMIN: string,
        proxCmd: string,
      }[]
    }[],
  });

  async function solicitar() {
    if (state.enviando) return;
    try {
      setState({ enviando: true, dams: [] });
      const response = await apiCall('/realtime/devtools/debug_dam_ecomode', {}) as Resposta;
      state.dams = [];
      for (const [damId, ecoInfo] of Object.entries(response.damEcoDebug)) {
        const duts: (typeof state)['dams'][number]['duts'] = [];
        state.dams.push({
          damId,
          cmd_state: ecoInfo.damEcoState?.cmd_state || '',
          cmd_exp: ecoInfo.damEcoState?.cmd_exp ? new Date(ecoInfo.damEcoState.cmd_exp).toISOString() : '',
          state: ecoInfo.lastDamTelem?.lastTelemetry?.State || '',
          mode: ecoInfo.lastDamTelem?.lastTelemetry?.Mode || '',
          SETPOINT: String(ecoInfo.ecoCfg?.SETPOINT ?? ''),
          duts,
        });
        for (const [dutId, dutInfo] of Object.entries(ecoInfo.assocDuts)) {
          duts.push({
            dutId,
            T0: String(dutInfo.lastDutTelem?.Temperature ?? ''),
            TUSEMIN: String(dutInfo.TUSEMIN ?? ''),
            proxCmd: dutInfo.proxCmd || '',
          });
        }
      }
      alert('Sucesso');
    } catch (err) { console.log(err); alert('Erro'); }
    setState({ enviando: false });
  }

  return (
    <div>
      <Button variant="primary" style={{ marginTop: '20px' }} onClick={solicitar}>
        {state.enviando ? <Loader /> : <span>Enviar</span>}
      </Button>
      {(state.dams.length > 0) && (
        <>
          <br />
          <br />
          <Table>
            <thead>
              <tr>
                <th>DAM</th>
                <th>Eco CMD</th>
                <th>Cmd Date</th>
                <th>Mode</th>
                <th>State</th>
                <th>Setpoint</th>
                <th>DUTs</th>
              </tr>
            </thead>
            <tbody>
              {(state.dams || []).map((rowDam) => (
                <tr key={rowDam.damId}>
                  <td>{rowDam.damId}</td>
                  <td>{rowDam.cmd_state}</td>
                  <td>{rowDam.cmd_exp}</td>
                  <td>{rowDam.mode}</td>
                  <td>{rowDam.state}</td>
                  <td>{rowDam.SETPOINT}</td>
                  <td style={{ padding: '4px' }}>
                    <Table>
                      <tbody>
                        {(rowDam.duts || []).map((rowDut) => (
                          <tr key={rowDut.dutId}>
                            <td>{rowDut.dutId}</td>
                            <td>{rowDut.T0}</td>
                            <td>{rowDut.TUSEMIN}</td>
                            <td>{rowDut.proxCmd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}

const Table = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;
