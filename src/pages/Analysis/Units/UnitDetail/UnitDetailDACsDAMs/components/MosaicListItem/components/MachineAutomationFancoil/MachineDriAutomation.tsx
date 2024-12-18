import { apiCall } from 'providers';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocket } from 'helpers/wsConnection';
import { toast } from 'react-toastify';
import {
  Status,
  SetPointRow,
  TempSetPoint,
  Arrows,
  ArrowUp,
  ArrowDown,
  StatusContainer,
  IconWiFiRealTime,
  Title,
  Label,
  SetPointLabel,
  SetPointContainer,
  IconWatchButton,
  DriContainer,
} from './styles';
import {
  formatRssiIcon,
  rssiDesc,
} from '../../../../..';
import {
  ArrowDownIcon, ArrowUpIcon,
  WatchIcon,
} from 'icons';
import { useEffect, useMemo, useState } from 'react';
import { checkProtocolValue } from 'helpers/driConfig';
import { useTranslation } from 'react-i18next';
import { DriControlOperation } from '../ControlOperation';
import { colors } from 'styles/colors';
import { DriException, DriSchedule, DriScheduleModal } from 'pages/Analysis/SchedulesModals/DRI_ScheduleModal';
import { TransparentLink } from '../../styles';

const MAX_DRI_SETPOINT = 30;
const MIN_DRI_SETPOINT = 15;

type Props = {
  DEV_ID: string;
  devAutData: any;
}

function findActualMode(value: number, thermOn: number): string {
  if (thermOn === 0) return 'Desligar';
  switch (value) {
    case 0: return 'Refrigerar';
    default: return 'Ventilar';
  }
}

export const MachineDriAutomation = ({ DEV_ID, devAutData }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    dutIrCommands: null as null | { IR_ID: string, cmdName: string }[],
    statusOptions: ['Desligar', 'Ventilar', 'Refrigerar'],
    devInfo: devAutData,
    driInterval: devAutData?.dri?.varsCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value,
    activeOperationMode: 'Desligar',
    activeMachineStatus: null as null | number,
    setPoint: null as null|number,
    isSendingSetpoint: false,
    telemetries: [] as string[],
    RSSI: undefined as undefined|number,
    status: devAutData?.status,
    timerChangeSetpoint: null as null | NodeJS.Timeout,
    isSendingOperationMode: false,
  });

  const isOffMode = useMemo(() => state.activeOperationMode === 'Desligar', [state.activeOperationMode]);
  const disabledSetpointButton = useMemo(() => state.status !== 'ONLINE' || isOffMode, [state.status, isOffMode]);

  const maxSetpoint = useMemo(() => state.setPoint !== null && state.setPoint >= MAX_DRI_SETPOINT, [state.setPoint]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [driState, setDriState] = useState({
    schedules: [] as DriSchedule[],
    exceptions: [] as DriException[],
  });

  function getOperationMode(mode: string, machineStatus: number): number {
    if (machineStatus === 0) return 2;
    switch (mode) {
      case 'Refrigerar': return 0;
      case 'Ventilar': return 1;
      default: return 2;
    }
  }

  function getOperationModeLabel(mode: number): string {
    switch (mode) {
      case 0: return 'Refrigerar';
      case 1: return 'Ventilar';
      default: return 'Desligar';
    }
  }

  async function sendDriSetpoint(newSetpoint) {
    try {
      await apiCall('/dri/send-dri-command', {
        DRI_ID: DEV_ID,
        TYPE: 'setpoint',
        VALUE: newSetpoint,
      });
      toast.success('Setpoint enviado');
    } catch (err) {
      setState({ isSendingSetpoint: false });
      console.log(err);
      toast.error('Houve erro em estabelecer setpoint');
    }
  }

  async function callDriSchedules(devId: string): Promise<void> {
    try {
      const { list: schedulesList } = await apiCall('/dri/get-dri-scheds', { DRI_ID: devId });
      const schedules: DriSchedule[] = [];
      const exceptions: DriException[] = [];

      for (const schedule of schedulesList) {
        if (schedule.EXCEPTION_DATE) {
          exceptions.push(schedule);
        } else {
          schedules.push(schedule);
        }
      }

      setDriState({
        exceptions,
        schedules,
      });
    } catch (error) {
      console.error(error);
      toast.error(t('naoFoiPossivelBuscarProgramacoesExcecoesDRI'));
    }
  }

  function changeSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.setPoint) {
      state.setPoint = newSetpoint;
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(newSetpoint), 1500);
      render();
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

  function onWsMessage(response) {
    if (response && response.type === 'driTelemetry' && response.data?.dev_id === DEV_ID) {
      state.telemetries.unshift(JSON.stringify(response.data));
      const actualMode = findActualMode(response.data.Mode ?? 2, response.data.ThermOn || 0);
      if (state.telemetries.length > 30) state.telemetries.pop();
      if (state.isSendingOperationMode && state.activeOperationMode === actualMode) state.isSendingOperationMode = false;
      if (state.isSendingSetpoint && state.setPoint === response.data.Setpoint) state.isSendingSetpoint = false;

      state.setPoint = state.isSendingSetpoint ? state.setPoint : (response.data.Setpoint ?? 24);
      state.activeMachineStatus = response.data.MachineStatus || response.data.ThermOn || 0;
      state.activeOperationMode = state.isSendingOperationMode ? state.activeOperationMode : actualMode;
      state.status = response.data.status;
      state.RSSI = response.data.RSSI;
      render();
    }
  }

  function beforeWsClose() {
    if (state.driInterval && state.status === 'ONLINE') updateTimeReceiveTelemetries(DEV_ID, state.driInterval);
  }

  function onClickArrowUp() {
    if (state.setPoint && state.setPoint < MAX_DRI_SETPOINT && state.status === 'ONLINE') {
      setState({ isSendingSetpoint: true });
      changeSetpoint(state.setPoint + 1);
    }
  }

  function onClickArrowDown() {
    if (state.setPoint && state.setPoint > MIN_DRI_SETPOINT && state.status === 'ONLINE') {
      setState({ isSendingSetpoint: true });
      changeSetpoint(state.setPoint - 1);
    }
  }

  function onClickWatchButton() {
    setShowScheduleModal(true);
  }

  function onSetOperationMode(mode: number) {
    setState({
      activeOperationMode: getOperationModeLabel(mode),
      isSendingOperationMode: true,
    });
  }

  useWebSocket(() => {}, onWsMessage, beforeWsClose);

  useEffect(() => {
    const driInterval = devAutData?.dri?.varsCfg?.driConfigs?.find(
      (cfg) => checkProtocolValue(cfg, 'interval'),
    )?.value;

    if (driInterval && state.status === 'ONLINE') updateTimeReceiveTelemetries(DEV_ID, 2);
    setState({ driInterval });
  }, [devAutData]);

  useEffect(() => {
    setLoading(true);
    callDriSchedules(DEV_ID).finally(() => setLoading(false));
  }, []);

  return (
    <DriContainer style={{
      padding: '8px 0px 16px 16px',
    }}
    >
      <DriScheduleModal
        devInfo={devAutData}
        exceptions={driState.exceptions}
        schedules={driState.schedules}
        open={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
        }}
        refetch={() => callDriSchedules(DEV_ID)}
        hideAddButton
      />
      <TransparentLink to={`/analise/dispositivo/${DEV_ID}/informacoes`}>
        <Title>{t('Automação')}</Title>
        <Label>{DEV_ID}</Label>
      </TransparentLink>
      <SetPointRow>
        <SetPointContainer style={{ opacity: state.status === 'ONLINE' && !isOffMode ? '1' : '0.3' }}>
          <TempSetPoint>
            <Title>{t('setpoint')}</Title>
            <div>
              <SetPointLabel>
                {(!isOffMode && state.setPoint) ?? '-'}
              </SetPointLabel>
              <span style={{ fontWeight: '400', fontSize: '11px', lineHeight: '12px' }}>
                ºC
              </span>
            </div>
          </TempSetPoint>
          <Arrows>
            <ArrowUp onClick={onClickArrowUp} disabled={disabledSetpointButton || maxSetpoint}>
              <ArrowUpIcon heigth="10px" color={disabledSetpointButton || maxSetpoint ? '#B3B3B3' : '#000000'} />
            </ArrowUp>
            <ArrowDown onClick={onClickArrowDown} disabled={disabledSetpointButton || state.setPoint === MIN_DRI_SETPOINT}>
              <ArrowDownIcon heigth="10px" color={disabledSetpointButton || state.setPoint === MIN_DRI_SETPOINT ? '#B3B3B3' : '#000000'} />
            </ArrowDown>
          </Arrows>
        </SetPointContainer>
        <Status>
          <DriControlOperation
            driId={DEV_ID}
            status={state.status}
            currentOperationMode={getOperationMode(state.activeOperationMode, state.activeMachineStatus ?? 0)}
            currentSetPoint={state.setPoint ?? undefined}
            setCurrentOperationMode={onSetOperationMode}
          />
        </Status>
      </SetPointRow>
      <StatusContainer style={{ alignItems: 'start' }}>
        <IconWatchButton onClick={onClickWatchButton} disabled={loading}>
          <WatchIcon color={colors.BlueSecondary} />
        </IconWatchButton>
        <IconWiFiRealTime>
          {formatRssiIcon(rssiDesc(state.RSSI, state.status))}
        </IconWiFiRealTime>
      </StatusContainer>
    </DriContainer>
  );
};
