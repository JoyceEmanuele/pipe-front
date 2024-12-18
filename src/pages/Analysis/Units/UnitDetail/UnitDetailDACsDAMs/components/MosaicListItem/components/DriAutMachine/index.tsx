import { apiCall } from '~/providers';
import { useStateVar } from '~/helpers/useStateVar';
import { useWebSocket } from '~/helpers/wsConnection';
import { toast } from 'react-toastify';

import {
  Container,
  SelectedInput,
  Label,
  Status,
  SetPointRow,
  SetPoint,
  TempSetPoint,
  Arrows,
  ArrowUp,
  ArrowDown,
  TransparentLink,
  StatusContainer,
  IconWiFiRealTime,
  StatusBox,
} from './styles';
import {
  formatRssiIcon,
  rssiDesc,
} from '../../../../..';
import {
  ArrowDownIcon, ArrowUpIcon, VAVClosedIcon, VAVOpenedIcon,
} from '~/icons';
import { useEffect } from 'react';
import { checkProtocolValue } from '~/helpers/driConfig';

type Props = {
  DEV_ID: string;
  devAutData: any;
}

function findActualMode(modes, value) {
  return modes.find((mode) => mode === value);
}

export const DriAutMachine = ({ DEV_ID, devAutData }: Props): React.ReactElement => {
  const [state, render, setState] = useStateVar({
    dutIrCommands: null as null | { IR_ID: string, cmdName: string }[],
    statusOptions: ['Desligar', 'Ventilar', 'Refrigerar'],
    devInfo: devAutData,
    driInterval: devAutData?.dri?.varsCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value,
    activeOperationMode: 'Desligar',
    activeMachineStatus: null as null | number,
    setPoint: null as null|number,
    isSendingSetpoint: 0,
    telemetries: [] as string[],
    isVav: devAutData?.dri?.vavCfg,
    RSSI: undefined as undefined|number,
    status: devAutData?.status,
    timerChangeSetpoint: null as null | NodeJS.Timeout,
  });

  useEffect(() => {
    const driInterval = devAutData?.dri?.varsCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value;
    if (driInterval && state.status === 'ONLINE') updateTimeReceiveTelemetries(DEV_ID, 2);
    setState({ isVav: devAutData?.dri?.vavCfg, driInterval });
  }, [devAutData]);

  async function sendOffCommand(command) {
    try {
      await apiCall('/dri/send-dri-command', {
        DRI_ID: DEV_ID,
        TYPE: 'on/off',
        VALUE: command,
      });
      state.activeOperationMode = 'Desligar';
      toast.success('Comando enviado - Desligar');
      return true;
    } catch (err) {
      console.log(err);
      toast.error('Houve um erro no comando desligar');
      return false;
    }
  }

  async function setOperationMode(operationMode: string) {
    try {
      if (operationMode === 'Refrigerar') {
        state.activeOperationMode = 'Refrigerar';
        await apiCall('/dri/send-dri-command', {
          DRI_ID: DEV_ID,
          TYPE: 'mode',
          VALUE: 'COOL',
        });
        toast.success('Modo de operação enviado - Refrigerar');
        render();
      }

      if (operationMode === 'Ventilar') {
        state.activeOperationMode = 'Ventilar';
        await apiCall('/dri/send-dri-command', {
          DRI_ID: DEV_ID,
          TYPE: 'mode',
          VALUE: 'FAN',
        });
        toast.success('Modo de operação enviado - Ventilar');
        render();
      }
    } catch (err) { console.log(err); toast.error('Houve um erro'); }
  }

  async function sendDriSetpoint(newSetpoint) {
    try {
      await apiCall('/dri/send-dri-command', {
        DRI_ID: DEV_ID,
        TYPE: 'setpoint',
        VALUE: newSetpoint,
      });
      state.isSendingSetpoint = 0;
      toast.success('Setpoint enviado');
    } catch (err) {
      console.log(err);
      toast.error('Houve erro em estabelecer setpoint');
    }
  }

  function changeSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.setPoint) {
      if (newSetpoint >= 17 && newSetpoint <= 25) {
        if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
        state.setPoint = newSetpoint;
        state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(newSetpoint), 1500);
        render();
      }
      if (newSetpoint > 25 && newSetpoint < state.setPoint) {
        if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
        state.setPoint = 25;
        state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(25), 1500);
        render();
      }
      if (newSetpoint < 17 && newSetpoint > state.setPoint) {
        if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
        state.setPoint = 17;
        state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(17), 1500);
        render();
      }
    }
  }

  function changeVAVSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.setPoint && newSetpoint >= 15 && newSetpoint <= 30) {
      if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
      state.setPoint = newSetpoint;
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(newSetpoint), 1500);
      render();
    } else {
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(state.setPoint), 1500);
    }
  }

  async function updateTimeReceiveTelemetries(DRI_ID: string, interval: number) {
    try {
      await apiCall('/dri/update-time-send-config', {
        DRI_ID,
        VALUE: interval,
      });
    } catch (err) {
      console.log(err);
      toast.error(`Houve erro ao atualizar tempo para receber telemetrias do ${DRI_ID}`);
    }
  }

  function onWsOpen(wsConn) {
  }
  function onWsMessage(response) {
    if (response && response.type === 'driTelemetry' && response.data?.dev_id === DEV_ID) {
      state.telemetries.unshift(JSON.stringify(response.data));
      if (state.telemetries.length > 30) state.telemetries.pop();
      if (state.isVav) {
        if (!state.isSendingSetpoint) state.setPoint = (response.data.Setpoint != null) ? response.data.Setpoint : 24;
        state.activeMachineStatus = response.data.ValveOn;
      } else {
        state.setPoint = state.isSendingSetpoint ? state.setPoint : (response.data.Temp ?? 24);
        state.activeMachineStatus = response.data.MachineStatus || 0;
      }
      state.activeOperationMode = findActualMode(['Ventilar', 'Desligar', 'Refrigerar'], response.data.Mode) || 'Selecionar';
      state.status = response.data.status;
      state.RSSI = response.data.RSSI;
      render();
    }
  }
  function beforeWsClose(wsConn) {
    if (state.driInterval && state.status === 'ONLINE') updateTimeReceiveTelemetries(DEV_ID, state.driInterval);
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  return (
    <>
      <Container>
        <TransparentLink to={`/analise/dispositivo/${DEV_ID}/informacoes`}>
          <b style={{ fontSize: '13px' }}>Automação</b>
          <p style={{ fontSize: '11px' }}>{ DEV_ID }</p>
        </TransparentLink>
        <SetPointRow style={{ opacity: (state.status === 'ONLINE') ? '1' : '0.3', flexDirection: 'column' }}>
          <SetPoint>
            <b style={{ fontSize: '12px' }}>Setpoint</b>
            <TempSetPoint>
              <svg width="15" height="15" style={{ borderRadius: '3px' }}>
                <rect width="15" height="15" style={{ fill: state.status === 'ONLINE' ? '#5AB365' : 'gray' }} />
              </svg>
              <div>
                { `${(state.status === 'ONLINE' && state.setPoint) || '-'} C º`}

              </div>
              <Arrows>
                <ArrowUp onClick={() => {
                  if (state.isVav) {
                    state.setPoint && state.status === 'ONLINE' && changeVAVSetpoint(state.setPoint + 0.5);
                  } else {
                    state.setPoint && (state.setPoint < 25 && (state.setPoint += 1));
                    state.status === 'ONLINE' && state.setPoint && (changeSetpoint(state.setPoint));
                  }
                  render();
                }}
                >
                  <ArrowUpIcon heigth="10px" width="9px" />
                </ArrowUp>
                <ArrowDown onClick={() => {
                  if (state.isVav) {
                    state.setPoint && state.status === 'ONLINE' && changeVAVSetpoint(state.setPoint - 0.5);
                  } else {
                    state.setPoint && (state.setPoint > 17 && (state.setPoint -= 1));
                    state.status === 'ONLINE' && state.setPoint && (changeSetpoint(state.setPoint));
                  }
                  render();
                }}
                >
                  <ArrowDownIcon heigth="10px" width="9px" />
                </ArrowDown>
              </Arrows>
            </TempSetPoint>
          </SetPoint>
          {!state.isVav && (
            <Status>
              <Label style={{ fontSize: '12px' }}>Status</Label>
              <SelectedInput
                value={state.activeOperationMode}
                onSelect={(e) => {
                  (e === 'Desligar') ? sendOffCommand('OFF') : setOperationMode(e);
                  render();
                }}
                options={state.status === 'ONLINE' ? state.statusOptions : []}
                defaultValue="Selecionar"
                hideSelected
                styles={{ border: '10px' }}
              />
            </Status>
          )}
        </SetPointRow>
        <StatusContainer>
          {(state.status === 'ONLINE' && !state.isVav && state.activeMachineStatus != null) && (
            <StatusBox isPrimary={false} status={state.activeMachineStatus}>
              {state.activeMachineStatus === 1 ? 'Ligado' : 'Desligado'}
            </StatusBox>
          )}
          <IconWiFiRealTime>
            {formatRssiIcon(rssiDesc(state.RSSI, state.status))}
          </IconWiFiRealTime>
          {(state.status === 'ONLINE' && state.isVav && state.activeMachineStatus != null) && (
            <>
              {state.activeMachineStatus ? (
                <VAVOpenedIcon />
              ) : (
                <VAVClosedIcon />
              )}
            </>
          )}
        </StatusContainer>
      </Container>
    </>
  );
};
