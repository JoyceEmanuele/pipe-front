import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import moment from 'moment';

import {
  Loader,
  Select,
} from 'components';
import CheckboxMaterial from '@material-ui/core/Checkbox';
import { ToggleSwitchMini } from 'components/ToggleSwitch';
import {
  TermometerIcon,
  VAVOpenedIcon,
  VAVClosedIcon,
  LockOpenedIcon,
  LockClosedIcon,
  ArrowUpIconV2,
  ArrowDownIconV2,
  InfoIcon,
} from '~/icons';
import { DevInfo, getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { useDebouncedRender, useStateVar } from 'helpers/useStateVar';
import { useWebSocket } from 'helpers/wsConnection';
import { colors } from 'styles/colors';
import { checkProtocolValue } from 'helpers/driConfig';

import img_mode_cool from 'assets/img/cool_ico/mode_cool.svg';
import img_mode_fan from 'assets/img/cool_ico/mode_fan.svg';
import img_mode_off from 'assets/img/cool_ico/power_1_color.svg';
import { apiCall } from 'providers';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Scatter, ScatterChart,
} from 'recharts';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import img_schedule from 'assets/img/cool_ico/schedule.svg';

import {
  Bluebar,
  ControlButtonIcon,
  ControlButton,
  SelectContainer,
  CardElev, ConteinerTitle, Content, ContentRealTime, RealTimeBox,
  Container,
  Slider,
  Cursor,
  ParamName,
  ParamValue,
  ParamTitle,
  SetpointButton,
  ModalContainerLoading,
  ControlButtonIconFancoil,
  NotyIconStyle,
  NotyNumCornerStyle,
} from './styles';
import {
  driMeterApplications, driApplicationOpts, driVAVsApplications, driFancoilsApplications,
} from '~/helpers/driConfigOptions';
import { DriSchedModeOpts, DRIScheduleSummary } from '../../SchedulesModals/DRI_Shedule';
import { FanOffIcon, FanOnIcon } from '~/icons/FanOnOff';
import { ValveClosedIcon, ValveOpenedIcon } from '~/icons/ValveOpenedClosed';
import ReactTooltip from 'react-tooltip';
import { DriException, DriSchedule, DriScheduleModal } from '../../SchedulesModals/DRI_ScheduleModal';
import { RssiComponent } from './components/RssiComponent';
import { verifyAndUpdateRSSI } from '~/helpers/rssi';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const ikron03availableErrors = {
  0: t('sequenciaDeFasesIncorretaOuFaltaDeFase'),
  1: t('configuracaoIncorretadeTcTpTl'),
  3: t('tensaoOuCorrenteAcimaDoLimitePermitido'),
  4: t('reinicializeCorretamenteSistema'),
};

const multkAvailableErrors = {
  0: t('TensaoMedidaSequenciaAntiHoraria'),
  1: t('ErroMatematico'),
  2: t('OverFlowGeracaoPulsosEnergia'),
  3: t('ExcedidoLimitePermitidoTensaoCorrente'),
};

export function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

export function convertSchedTime(value: number | null | undefined) {
  if (value == null) return '';
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function formatTimeToTimeAxios(date: moment.Moment, seconds = 0, format = 'HH:mm:ss') {
  return moment(date)
    .add(seconds, 'seconds')
    .format(format);
}

function getMagnitudeOrder(n: number) {
  if (n === Infinity || n === -Infinity) {
    return 0;
  }
  const order = Math.floor(Math.log(Math.abs(n)) / Math.LN10 + 0.000000001);
  return 10 ** order;
}

function getTime(timestamp) {
  return new Date(timestamp).getTime() + 3 * 60 * 60 * 1000;
}

export function DriRealTimeContents(props: { devId: string }): JSX.Element {
  // const { devId } = useParams<{ devId: string }>();
  let CONT_WS_REQUEST = 0;
  const CONT_WS_REQUEST_RENDER = 3; // quantidades de request para renderizar o grafico;
  const { devId } = props;
  const [state, render, setState] = useStateVar({
    isTelemetryNull: false,
    installationError: null as null|string,
    loading: true,
    shouldRender: true,
    desktopWidth: window.matchMedia('(min-width: 768px)'),
    telemetries: [] as {
      fp?: number;
      fp_a?: number,
      fp_b?: number,
      fp_c?: number,
      timestamp: string,
      v_avg?: number,
      v_a?: number,
      v_b?: number,
      v_c?: number,
      i_total?: number,
      i_a?: number,
      i_b?: number,
      i_c?: number,
      en_at_tri?: number,
      pot_at_total: number,
      pot_at_tri: number,
      pot_at_a?: number,
      pot_at_b?: number,
      pot_at_c?: number,
    }[], // { status }[]
    driInterval: null as null | number,
    isSendingSetpoint: 0,
    timerChangeSetpoint: null as null | NodeJS.Timeout,
    devInfo: getCachedDevInfoSync(devId),
    setpoint: null as null | number,
    vavSetpoint: null as null | number,
    vavTempAmb: null as null | number,
    vavValve: null as null | number,
    vavLock: null as null | number,
    fancoilSetpoint: null as null | number,
    fancoilTempAmb: null as null | number,
    fancoilValve: null as null | number,
    fancoilFan: null as null | number,
    activeOperationMode: 0,
    activeFancoilOperationMode: null as null | number,
    driApplication: '',
    activeMachineStatus: 0,
    floatingControlMode: null as null | {
      x: number
      y: number
    },
    floatingControlFan: null as null | {
      x: number
      y: number
    },
    floatingControlSwing: null as null | {
      x: number
      y: number
    },
    showCurves: {
      totalOrMedium: true,
      phaseA: true,
      phaseB: true,
      phaseC: true,
    },
    sendingNewFancoilMode: false,
    RSSI: '',
    timezoneOffset: 0,
    oldDate: false as boolean,
  });

  const [driState, , setDriState] = useStateVar({
    schedules: [] as DriSchedule[],
    exceptions: [] as DriException[],
    totalSchedules: 0,
    showScheduleModal: false,
  });

  const [energyState, , setEnergyState] = useStateVar({
    initialTimeRef: new Date().toISOString().substr(0, 19),
    tab: { label: t('tensao'), value: 'voltage' },
  });

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  const debouncedRender = useDebouncedRender(render);

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  function onWsOpen(wsConn) {
    wsConn.send({ type: 'driSubscribeRealTime', data: { DRI_ID: devId } });
  }
  function onWsMessage(response) {
    if (response && response.type === 'driTelemetry') {
      verifyDriTypeToFormatPower(response, state.driApplication);
      addEnergyParams(response);
      if (response.data.timestamp) {
        const data = moment(response.data.timestamp);
        checkLastTimeStamp(response.data.timestamp);
        response.data.timestamp = data.format('YYYY-MM-DDTHH:mm:ss');
        state.telemetries.push(response.data);
      }
      if (state.telemetries.length > 6) state.telemetries.shift();
      if (!state.isSendingSetpoint) state.setpoint = (response.data.Temp != null) ? response.data.Temp : 24;
      if (state.devInfo?.dri && getKeyByValue(driFancoilsApplications, state.devInfo?.dri.varsCfg?.application)) {
        if (response.data.ThermOn === 0) {
          state.activeFancoilOperationMode = 2;
        } else {
          state.activeFancoilOperationMode = response.data.Mode === 0 ? 0 : 1;
        }
      }
      state.activeOperationMode = Number(getKeyByValue(DriSchedModeOpts, response.data.Mode)) || 0;
      state.activeMachineStatus = response.data.MachineStatus || 0;
      state.installationError = convertErrorTelemetry(response.data.erro, state.driApplication);
      state.isTelemetryNull = response.data.timestamp && response.data.erro === 256;
      render();

      state.vavTempAmb = response.data.TempAmb;
      state.vavValve = response.data.ValveOn;
      state.vavLock = response.data.Lock;

      state.fancoilTempAmb = response.data.TempAmb;
      state.fancoilValve = response.data.ValveOn;
      state.fancoilFan = response.data.FanStatus;
      updateRssi(response);
      if (!state.isSendingSetpoint) state.fancoilSetpoint = response.data.Setpoint;
      if (!state.isSendingSetpoint) state.vavSetpoint = response.data.Setpoint;

      if (CONT_WS_REQUEST < CONT_WS_REQUEST_RENDER) { CONT_WS_REQUEST++; }
      if (CONT_WS_REQUEST === CONT_WS_REQUEST_RENDER) { setState({ loading: false }); }
      debouncedRender();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'driUnsubscribeRealTime' });
    if (state.driInterval) updateTimeReceiveTelemetries(devId, state.driInterval);
  }

  function verifyMeterIsSchneiderPm210() {
    return state.driApplication === 'schneider-electric-pm210';
  }

  function addEnergyParams(response) {
    response.data.v_avg = ([response.data.v_a, response.data.v_b, response.data.v_c].reduce((acc, value) => acc += (value || 0), 0) / 3) || 0;
    response.data.i_total = [response.data.i_a, response.data.i_b, response.data.i_c].reduce((acc, value) => acc += (value || 0), 0) || 0;
    if (verifyMeterIsSchneiderPm210()) {
      response.data.pot_at_total = response.data.pot_at_tri;
    } else {
      response.data.pot_at_total = [response.data.pot_at_a, response.data.pot_at_b, response.data.pot_at_c].reduce((acc, value) => acc += (value || 0), 0) || 0;
    }
  }

  function verifyDriTypeToFormatPower(response, applicationDri) {
    if (applicationDri === 'kron-ikron-03') {
      response.data.pot_at_a = formatPowerAux(response.data.pot_at_a);
      response.data.pot_at_b = formatPowerAux(response.data.pot_at_b);
      response.data.pot_at_c = formatPowerAux(response.data.pot_at_c);
    }
  }

  function formatPowerAux(power) {
    return power > 0 ? power / 1000 : 0;
  }

  async function getTimezoneOffset() {
    try {
      await apiCall('/get-timezone-offset-by-devId', { devId }).then((tzOffset) => {
        if (tzOffset != null) state.timezoneOffset = tzOffset;
      });
    } catch (err) {
      console.log(err);
      toast.error(t('erroObterFusoHorario'));
    }
  }

  async function sendDriSetpoint(newSetpoint) {
    try {
      await apiCall('/dri/send-dri-command', {
        DRI_ID: state.devInfo.DEV_ID,
        TYPE: 'setpoint',
        VALUE: newSetpoint,
      });
      setTimeout(() => {
        state.isSendingSetpoint = 0;
        toast.success(t('sucessoEnviarSetpoint'));
      }, 5000);
    } catch (err) {
      console.log(err);
      toast.error(t('erroEstabelecerSetpoint'));
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
      toast.error(t('erroAtualizarTempoReceberTelemetrias'));
    }
  }

  async function sendOnOffCommand(command) {
    try {
      await apiCall('/dri/send-dri-command', {
        DRI_ID: state.devInfo.DEV_ID,
        TYPE: 'on/off',
        VALUE: command,
      });
      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{command === 'ON' ? t('ligar') : t('desligar')}</span>
          <span>{t('sucessoComandoEnviado')}</span>
        </div>,
      );
      return true;
    } catch (err) {
      console.log(err);
      toast.error(t('erroComandoLigarDesligar'));
      return false;
    }
  }

  function changeVAVSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.vavSetpoint && newSetpoint >= 15 && newSetpoint <= 30) {
      if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
      state.vavSetpoint = newSetpoint;
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(newSetpoint), 1500);
      render();
    } else {
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(state.vavSetpoint), 1500);
    }
  }

  function checkLastTimeStamp(lastTelemetry:string | null) {
    if (lastTelemetry) {
      const dateLastTelemetry = new Date(lastTelemetry);
      const dateCurrent = new Date();
      const dateMil = dateCurrent.getTime() - dateLastTelemetry.getTime();
      const dateDays = dateMil / (1000 * 60 * 60 * 24);

      if (dateDays > 7) {
        state.oldDate = true;
      } else {
        state.oldDate = false;
      }
    }
  }

  async function changeVAVLock(command) {
    try {
      await apiCall('/dri/send-dri-command', {
        DRI_ID: state.devInfo.DEV_ID,
        TYPE: 'lock',
        VALUE: command,
      });
      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{command === 0 ? t('liberadoMin') : t('travado')}</span>
          <span>{t('sucessoComandoEnviado')}</span>
        </div>,
      );
      return true;
    } catch (err) {
      console.log(err);
      toast.error(t('erroComandoLiberarTravar'));
      return false;
    }
  }

  function changeFancoilSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.fancoilSetpoint && newSetpoint >= 15 && newSetpoint <= 30) {
      if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
      state.fancoilSetpoint = newSetpoint;
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(newSetpoint), 1500);
      render();
    } else {
      state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(state.fancoilSetpoint), 1500);
    }
  }

  function changeSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.setpoint) {
      if (newSetpoint >= 17 && newSetpoint <= 25) {
        if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
        state.setpoint = newSetpoint;
        render();
        state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(newSetpoint), 1500);
      }
      if (newSetpoint > 25 && newSetpoint < state.setpoint) {
        if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
        state.setpoint = 25;
        render();
        state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(25), 1500);
      }
      if (newSetpoint < 17 && newSetpoint > state.setpoint) {
        if (!state.isSendingSetpoint) state.isSendingSetpoint = 1;
        state.setpoint = 17;
        render();
        state.timerChangeSetpoint = setTimeout(() => sendDriSetpoint(17), 1500);
      }
    }
  }

  function getOperationModeIcon(operationMode: number) {
    // operationModes: {"0":"COOL","1":"FAN"},
    switch (operationMode) {
      case 0: return img_mode_cool;
      case 1: return img_mode_fan;
    }
  }

  function getFancoilOperationModeIcon(operationMode: number | null) {
    if (operationMode === null) return undefined;
    switch (operationMode) {
      case 0: return img_mode_cool;
      case 1: return img_mode_fan;
      case 2: return img_mode_off;
    }
  }

  function getFancoilOperationModeLabel(operationMode: number | null) {
    if (operationMode === null) return '';
    switch (operationMode) {
      case 0: return t('refrigerar');
      case 1: return t('ventilar');
      case 2: return t('desligar');
    }
  }

  function onClickMode(event) {
    if (state.sendingNewFancoilMode) return;
    if (state.devInfo.dri && getKeyByValue(driFancoilsApplications, state.devInfo.dri.varsCfg?.application)) {
      window.scrollBy(0, 200);
      render();
    }
    if (state.floatingControlMode) {
      state.floatingControlMode = null;
    } else {
      let el = event.target;
      while (el.tagName.toLowerCase() !== 'div') {
        if (!el.parentElement) return;
        if (!el.parentElement.tagName) return;
        el = el.parentElement;
      }
      const rect = el.getBoundingClientRect();
      state.floatingControlMode = null;
      state.floatingControlFan = null;
      state.floatingControlSwing = null;
      state.floatingControlMode = {
        x: rect.x, // event.target.offsetLeft, // event.clientX
        y: state.devInfo.dri && getKeyByValue(driFancoilsApplications, state.devInfo.dri.varsCfg?.application) ? rect.y + 1 * 43 : rect.y + 1 * 71, // event.target.offsetTop, // event.clientY
      };
    }
    render();
  }

  async function setOperationMode(operationMode: number) {
    try {
      state.activeOperationMode = operationMode;
      const command = DriSchedModeOpts[operationMode];
      await apiCall('/dri/send-dri-command', {
        DRI_ID: state.devInfo.DEV_ID,
        TYPE: 'mode',
        VALUE: command,
      });
      toast.success(t('sucessoModoOperacaoEnviado'));
      setState({ floatingControlMode: null, floatingControlFan: null, floatingControlSwing: null });
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  async function setFancoilOperationMode(operationMode: number) {
    try {
      state.activeFancoilOperationMode = operationMode;
      setState({
        floatingControlMode: null, floatingControlFan: null, floatingControlSwing: null,
      });
      render();
      toast.success(t('iniciandoTrocaDeModoDeOperacao'));

      if (operationMode === 0) {
        setTimeout(async () => {
          await apiCall('/dri/send-dri-command', {
            DRI_ID: state.devInfo.DEV_ID,
            TYPE: 'therm',
            VALUE: '1',
          });
          setTimeout(async () => {
            await apiCall('/dri/send-dri-command', {
              DRI_ID: state.devInfo.DEV_ID,
              TYPE: 'mode',
              VALUE: '0',
            });
            await apiCall('/dri/send-dri-command', {
              DRI_ID: state.devInfo.DEV_ID,
              TYPE: 'fanspeed',
              VALUE: '1',
            });
            if (state.fancoilSetpoint) {
              await apiCall('/dri/send-dri-command', {
                DRI_ID: state.devInfo.DEV_ID,
                TYPE: 'setpoint',
                VALUE: state.fancoilSetpoint.toString(),
              });
            }
            toast.success(t('sucessoModoOperacaoEnviado'));
            state.sendingNewFancoilMode = false;
          }, 8000);
        }, 5000);
      } else if (operationMode === 1) {
        setTimeout(async () => {
          await apiCall('/dri/send-dri-command', {
            DRI_ID: state.devInfo.DEV_ID,
            TYPE: 'therm',
            VALUE: '1',
          });
          setTimeout(async () => {
            await apiCall('/dri/send-dri-command', {
              DRI_ID: state.devInfo.DEV_ID,
              TYPE: 'mode',
              VALUE: '2',
            });
            await apiCall('/dri/send-dri-command', {
              DRI_ID: state.devInfo.DEV_ID,
              TYPE: 'fanspeed',
              VALUE: '1',
            });
            state.sendingNewFancoilMode = false;
            toast.success(t('sucessoModoOperacaoEnviado'));
          }, 8000);
        }, 5000);
      } else {
        await apiCall('/dri/send-dri-command', {
          DRI_ID: state.devInfo.DEV_ID,
          TYPE: 'therm',
          VALUE: '0',
        });
        await apiCall('/dri/send-dri-command', {
          DRI_ID: state.devInfo.DEV_ID,
          TYPE: 'mode',
          VALUE: '2',
        });
        setTimeout(() => { state.sendingNewFancoilMode = false; }, 2000);
        toast.success(t('sucessoModoOperacaoEnviado'));
      }
      render();
    } catch (err) { console.log(err); state.sendingNewFancoilMode = false; toast.error(t('erro')); }
  }

  function CustomTickTime(props) {
    const {
      x, y, payload, anchor,
    } = props;
    const shiftedTime = payload.value - 3 * 60 * 60 * 1000;
    return (
      <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
        <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fontSize="10px">
          {(shiftedTime > 1000000)
            ? new Date(shiftedTime).toLocaleTimeString()
            : formatTimeToTimeAxios(moment(energyState.initialTimeRef), shiftedTime)}
        </text>
      </g>
    );
  }

  function getDialColor({ temp }) {
    if (state.devInfo.status !== 'ONLINE') return colors.LightGrey_v3;
    if (temp != null && Number.isFinite(Number(temp))) {
      return (
        state.devInfo.dri?.vavCfg?.TUSEMAX && temp > state.devInfo.dri?.vavCfg?.TUSEMAX && colors.Red
        || state.devInfo.dri?.vavCfg?.TUSEMIN && temp < state.devInfo.dri?.vavCfg?.TUSEMIN && colors.BlueSecondary_v3
        || colors.GreenLight
      );
    }
    return colors.GreenLight;
  }

  const updateRssi = (payload) => {
    const rssi = verifyAndUpdateRSSI(payload);
    if (rssi) {
      state.RSSI = t(rssi, { defaultValue: '-' });
      render();
    }
  };

  function isDRIFancoil(devInfo: DevInfo): boolean {
    return !!(devInfo.dri && getKeyByValue(driFancoilsApplications, devInfo.dri.varsCfg?.application));
  }

  function isDRIVav(devInfo: DevInfo): boolean {
    return !!(devInfo.dri && getKeyByValue(driVAVsApplications, devInfo.dri.varsCfg?.application));
  }

  async function callDriSchedules(devId: string): Promise<void> {
    try {
      const { list: schedulesList } = await apiCall('/dri/get-dri-scheds', { DRI_ID: devId });
      const schedules: DriSchedule[] = [];
      const exceptions: DriException[] = [];

      for (const sched of schedulesList) {
        if (sched.EXCEPTION_DATE) {
          exceptions.push(sched);
        } else {
          schedules.push(sched);
        }
      }

      setDriState({
        exceptions,
        schedules,
        totalSchedules: schedules.length,
      });
    } catch (error) {
      console.error(error);
      toast.error(t('naoFoiPossivelBuscarProgramacoesExcecoesDRI'));
    }
  }

  useEffect(() => {
    if (state.shouldRender) {
      Promise.resolve().then(async () => {
        try {
          setState({ loading: true });
          // @ts-ignore
          const devInfo = await getCachedDevInfo(devId, {});

          if (isDRIFancoil(devInfo) || isDRIVav(devInfo)) {
            await callDriSchedules(devId);
          }
          // if (onDevInfoUpdate) onDevInfoUpdate();

          await getTimezoneOffset();
          setState({ driApplication: devInfo.dri.varsCfg?.application, devInfo });
          render();
          state.driInterval = devInfo.dri.varsCfg?.driConfigs.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value;
          if (state.driInterval) updateTimeReceiveTelemetries(devId, 2);
        } catch (err) { toast.error(t('erro')); console.error(err);
          setState({ loading: false }); }
      });
    }
    setState({ shouldRender: false });
  }, [state.shouldRender]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  if (!state.devInfo) return (<div />);

  return (
    <>
      <DriScheduleModal
        devInfo={state.devInfo}
        exceptions={driState.exceptions}
        schedules={driState.schedules}
        open={driState.showScheduleModal}
        onClose={() => {
          setDriState({
            showScheduleModal: false,
          });
        }}
        refetch={() => callDriSchedules(devId)}
      />
      <Flex flexDirection="column" overflowX="hidden">
        {!state.oldDate && state.devInfo.status === 'ONLINE' ? (
          <>
            {state.driApplication !== 'carrier-ecosplit' && state.isTelemetryNull ? (
              <ModalContainerLoading display={state.isTelemetryNull}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  <Trans i18nKey="medidorEnergiaDesconectadoOuFalhaLigacoesEletricas">
                    { state.installationError }
                  </Trans>
                </div>
              </ModalContainerLoading>
            ) : (
              <ModalContainerLoading display={state.loading}>
                <Loader variant="primary" size="large" />
                <Trans i18nKey="aguardeDadosSendoCarregados">
                  <h4>Aguarde, os dados estão</h4>
                  <h4>sendo carregados.</h4>
                </Trans>
              </ModalContainerLoading>
            )}

            {(state.devInfo.dri && state.devInfo.dri.varsCfg?.application === 'carrier-ecosplit') && (
            <Flex flexDirection="column">
              {(state.loading) ? <Loader />
                : (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '15px 0',
                      alignItems: 'center',
                    }}
                    >
                      <div
                        style={{
                          height: '230px',
                          width: '230px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '0',
                            top: '0',
                          }}
                        >
                          <Dial temperature={state.setpoint} status={state.devInfo.status} withCommands />
                        </div>
                        <div style={{ zIndex: 1 }}>
                          <div style={{ textAlign: 'center', fontWeight: 700 }}>Setpoint</div>
                          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'baseline' }}>
                            <div style={{ alignSelf: 'flex-end', marginRight: '5px' }}>
                              <div
                                style={{
                                  border: '8px solid transparent',
                                  borderBottomColor: 'black',
                                  cursor: 'pointer',
                                  marginBottom: '10px',
                                }}
                                onClick={() => { if (state.devInfo.status === 'ONLINE' && state.setpoint) changeSetpoint(state.setpoint + 1); }}
                              />
                              <div
                                style={{
                                  border: '8px solid transparent',
                                  borderTopColor: 'black',
                                  cursor: 'pointer',
                                  marginBottom: '4px',
                                }}
                                onClick={() => { if (state.devInfo.status === 'ONLINE' && state.setpoint) changeSetpoint(state.setpoint - 1); }}
                              />
                            </div>
                            <span style={{ fontSize: '240%', fontWeight: 700 }}>{state.setpoint || '--'}</span>
                            <span style={{ color: colors.Grey200 }}>&nbsp;°C</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                        <div style={{ display: 'flex' }}>
                          <ControlButton
                            onClick={onClickMode}
                            style={{ margin: '0 10px' }}
                          >
                            <ControlButtonIcon status={state.devInfo.status} alt="mode" src={getOperationModeIcon(state.activeOperationMode)} />
                          </ControlButton>
                          {state.floatingControlMode && state.devInfo.status === 'ONLINE' && (
                          <SelectContainer style={{ left: state.floatingControlMode.x, top: state.floatingControlMode.y }}>
                            <div>
                              <ControlButton noBorder isActive={state.activeOperationMode === 0} onClick={() => setOperationMode(0)}>
                                <ControlButtonIcon isActive={state.activeOperationMode === 0} alt="cool" src={img_mode_cool} />
                              </ControlButton>
                            </div>
                            <div>
                              <ControlButton noBorder isActive={state.activeOperationMode === 1} onClick={() => setOperationMode(1)}>
                                <ControlButtonIcon isActive={state.activeOperationMode === 1} alt="fan" src={img_mode_fan} />
                              </ControlButton>
                            </div>
                          </SelectContainer>
                          )}
                          <DRIScheduleSummary driId={state.devInfo.DEV_ID} layout="small-btn" devInfo={state.devInfo} varsCfg={state.devInfo.dri.varsCfg} />
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: colors.LightGrey_v3,
                        width: '2px',
                        height: '70px',
                        borderRadius: '10px',
                        marginLeft: '20px',
                        marginRight: '30px',
                      }}
                      />

                      <div style={{ maxWidth: '250px' }}>
                        <div style={{ fontWeight: 'bold', color: state.devInfo.status === 'ONLINE' ? '' : colors.Grey300 }}>{t('funcionamento')}</div>
                        {state.devInfo.status === 'ONLINE'
                          ? (
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                              <span>{t('ligadoMin')}</span>
                              <ToggleSwitch
                                onOff
                                checked={!(state.activeMachineStatus === 1)}
                                style={{ margin: '0 8px' }}
                                onClick={async () => {
                                  if (state.activeMachineStatus === 0) {
                                    const success = await sendOnOffCommand('ON');
                                    if (success) state.activeMachineStatus = 1;
                                  } else {
                                    const success = await sendOnOffCommand('OFF');
                                    if (success) state.activeMachineStatus = 0;
                                  }
                                  render();
                                }}
                              />
                              <span>{t('desligadoMin')}</span>
                            </div>
                          )
                          : (
                            <span style={{ color: colors.Grey300 }}>{t('funcoesNaoDisponiveisStatusDispositivo')}</span>
                          )}
                      </div>

                    </div>
                  </>
                )}
            </Flex>
            )}
            {state.devInfo.dri && getKeyByValue(driVAVsApplications, state.devInfo.dri.varsCfg?.application) && (
            <Flex flexDirection="column">
              {(state.loading) ? <Loader />
                : (
                  <>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '15px 0',
                      alignItems: 'center',
                    }}
                    >
                      <div
                        style={{
                          height: '230px',
                          width: '230px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '0',
                            top: '0',
                          }}
                        >
                          <Dial temperature={state.vavTempAmb} color={getDialColor({ temp: state.vavTempAmb })} status={state.devInfo.status} withCommands={false} />
                        </div>
                        <div style={{ zIndex: 1 }}>
                          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '120%' }}>
                            <TermometerIcon width="20px" style={{ marginLeft: '-10px' }} />
                            {t('agora')}
                          </div>
                          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '370%', fontWeight: 700 }}>{formatNumberWithFractionDigits(state.vavTempAmb ?? '-')}</span>
                            <span style={{ color: colors.Grey200, fontSize: '150%' }}>&nbsp;°C</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                        {state.devInfo.status === 'ONLINE' && (
                        <div style={{ margin: '0px 15px' }}>
                          <div style={{ fontWeight: 'bold' }}>{t('limitesTemperatura')}</div>
                          <span>
                            mín.
                            <b style={{ fontSize: '110%' }}>{` ${formatNumberWithFractionDigits(state.devInfo.dri?.vavCfg?.TUSEMIN ?? '-')}`}</b>
                            <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            máx.
                            <b style={{ fontSize: '110%' }}>{` ${formatNumberWithFractionDigits(state.devInfo.dri?.vavCfg?.TUSEMAX ?? '-')}`}</b>
                            <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                          </span>
                        </div>
                        )}
                      </div>

                      <Flex mt={10} flexWrap="wrap" justifyContent="center" flexDirection={state.devInfo.status === 'ONLINE' ? 'row' : 'column'}>
                        {state.devInfo.status === 'ONLINE'
                          ? (
                            <Flex mb={state.desktopWidth.matches ? null : 20}>
                              <div style={{ margin: '0px 15px' }}>
                                <div style={{ fontWeight: 'bold' }}>{t('atuadorVav')}</div>
                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                  <Flex flexDirection="column">
                                    <span>{t('aberto')}</span>
                                    <VAVOpenedIcon color={state.vavValve != null && state.vavValve === 1 ? undefined : colors.LightGrey_v3} />
                                  </Flex>
                                  <ToggleSwitchMini
                                    checked={!(state.vavValve && state.vavValve === 1)}
                                    style={{ margin: '0 8px', cursor: 'unset' }}
                                  />
                                  <Flex flexDirection="column">
                                    <span>{t('fechado')}</span>
                                    <VAVClosedIcon color={state.vavValve != null && state.vavValve === 0 ? undefined : colors.LightGrey_v3} />
                                  </Flex>
                                </div>
                              </div>

                              <div style={{ margin: '0px 15px' }}>
                                <div style={{ fontWeight: 'bold' }}>{t('termostato')}</div>
                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                  <Flex flexDirection="column">
                                    <span>{t('liberadoMin')}</span>
                                    <LockOpenedIcon color={state.vavLock != null && state.vavLock === 0 ? undefined : colors.LightGrey_v3} />
                                  </Flex>
                                  <ToggleSwitchMini
                                    checked={!!(state.vavLock && state.vavLock === 1)}
                                    style={{ margin: '0 8px' }}
                                    onClick={async () => {
                                      if (state.vavLock === 0) {
                                        const success = await changeVAVLock(1);
                                        if (success) state.vavLock = 1;
                                      } else {
                                        const success = await changeVAVLock(0);
                                        if (success) state.vavLock = 0;
                                      }
                                      render();
                                    }}
                                  />
                                  <Flex flexDirection="column">
                                    <span>{t('travado')}</span>
                                    <LockClosedIcon color={state.vavLock != null && state.vavLock === 1 ? undefined : colors.LightGrey_v3} />
                                  </Flex>
                                </div>
                              </div>
                            </Flex>
                          )
                          : (
                            <span style={{ color: colors.Grey300, margin: '20px 0px' }}>{t('funcoesNaoDisponiveisStatusDispositivo')}</span>
                          )}

                        {state.devInfo.status === 'ONLINE' && (
                        <div style={{ margin: '0px 15px' }}>
                          <ControlButton
                            style={{ width: '155px', justifyContent: 'flex-start' }}
                          >
                            <div style={{
                              width: '57px',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                            >
                              <SetpointButton up onClick={() => state.vavSetpoint && state.devInfo.status === 'ONLINE' && changeVAVSetpoint(state.vavSetpoint + 0.5)}>
                                <ArrowUpIconV2 />
                              </SetpointButton>
                              <SetpointButton down onClick={() => state.vavSetpoint && state.devInfo.status === 'ONLINE' && changeVAVSetpoint(state.vavSetpoint - 0.5)}>
                                <ArrowDownIconV2 />
                              </SetpointButton>
                            </div>
                            <div style={{ width: '98px', marginLeft: '20px' }}>
                              <div style={{ fontWeight: '700', color: colors.Blue700 }}>Setpoint</div>
                              <div style={{ fontWeight: '400', fontSize: '18px' }}>{`${formatNumberWithFractionDigits(state.vavSetpoint?.toFixed(1) ?? '-')} °C`}</div>
                            </div>
                          </ControlButton>
                        </div>
                        )}

                        <div style={{
                          display: 'flex', justifyContent: 'center', margin: '0px 15px',
                        }}
                        >
                          <div style={{ display: 'flex' }}>
                            <DRIScheduleSummary driId={state.devInfo.DEV_ID} layout="small-btn" devInfo={state.devInfo} varsCfg={state.devInfo.dri.varsCfg} />
                          </div>
                        </div>
                      </Flex>

                    </div>
                  </>
                )}
            </Flex>
            )}
            {isDRIFancoil(state.devInfo) && (
            <Flex flexDirection="column">
              {(state.loading) ? <Loader />
                : (
                  <div style={{
                    display: 'flex', position: windowSize[0] > 825 ? 'absolute' : undefined, justifyContent: windowSize[0] < 825 ? 'center' : undefined, marginBottom: '20px',
                  }}
                  >
                    <Flex
                      flexDirection="column"
                      style={{
                        border: '0.5px solid', borderRadius: '10px', borderColor: colors.LightGrey_v3, width: '230px',
                      }}
                    >
                      <Flex flexDirection="row" style={{ padding: '20px' }} justifyContent="space-between">
                        <Flex justifyContent="center" alignItems="flex-start" flexDirection="column">
                          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                            DEV ID
                          </span>
                          {state.devInfo.DEV_ID}
                        </Flex>
                        <RssiComponent rssi={state.RSSI} style={{ borderLeft: '0.5px solid', borderColor: colors.LightGrey_v3, paddingLeft: '20px' }} />
                      </Flex>
                      <Flex id="env" data-for="env" data-tip style={{ borderTop: '0.5px solid', padding: '20px', borderColor: colors.LightGrey_v3 }} justifyContent="center">
                        <span style={{ fontWeight: 'bold', fontSize: '12px', marginRight: '4px' }}>{t('ambienteRefrigerado')}</span>
                        <InfoIcon />
                      </Flex>
                      <ReactTooltip
                        id="env"
                        place="right"
                        border
                        textColor="#000000"
                        backgroundColor="rgba(255, 255, 255, 0.9)"
                        borderColor="rgba(0, 0, 0, 0.33)"
                      >
                        {state.devInfo.dri?.fancoilCfg?.FANCOIL_ID}
                      </ReactTooltip>
                    </Flex>
                  </div>
                )}
              {(state.loading) ? <Loader />
                : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '15px 0',
                    alignItems: 'center',
                    marginBottom: '110px',
                  }}
                  >
                    <div
                      style={{
                        height: '230px',
                        width: '230px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '0',
                          top: '0',
                        }}
                      >
                        <Dial temperature={state.fancoilTempAmb} color={getDialColor({ temp: state.fancoilTempAmb })} status={state.devInfo.status} withCommands={false} />
                      </div>
                      <div style={{ zIndex: 1 }}>
                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '120%' }}>
                          <TermometerIcon width="20px" style={{ marginLeft: '-10px' }} />
                          {t('agora')}
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '370%', fontWeight: 700 }}>{formatNumberWithFractionDigits(state.fancoilTempAmb ?? '-')}</span>
                          <span style={{ color: colors.Grey200, fontSize: '150%' }}>&nbsp;°C</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                      {state.devInfo.status !== '' && (
                      <div style={{ margin: '0px 15px' }}>
                        <div style={{ fontWeight: 'bold' }}>{t('limitesTemperatura')}</div>
                        <span>
                          mín.
                          <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dri?.fancoilCfg?.THERM_T_MIN || state.devInfo.dri?.fancoilCfg?.TUSEMIN || '-'}`}</b>
                          <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                          máx.
                          <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dri?.fancoilCfg?.THERM_T_MAX || state.devInfo.dri?.fancoilCfg?.TUSEMAX || '-'}`}</b>
                          <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                        </span>
                      </div>
                      )}
                    </div>

                    <Flex
                      mt={30}
                      flexWrap="wrap-reverse"
                      justifyContent="center"
                      flexDirection="row"
                      style={{
                        rowGap: 10,
                      }}
                    >
                      <Flex
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '24px' }}>{t('modoDeOperacao')}</div>

                        <ControlButton
                          larger
                          disabled={state.sendingNewFancoilMode || state.activeFancoilOperationMode === null}
                          onClick={onClickMode}
                          style={{ margin: '0 10px' }}
                        >
                          {state.activeFancoilOperationMode !== null && <ControlButtonIconFancoil status={state.devInfo.status} alt="mode" src={getFancoilOperationModeIcon(state.activeFancoilOperationMode)} />}
                          <span style={{
                            width: '70%', fontSize: '13px', fontWeight: '600', color: colors.Blue700,
                          }}
                          >
                            {getFancoilOperationModeLabel(state.activeFancoilOperationMode)}
                          </span>
                        </ControlButton>
                        {state.floatingControlMode && state.devInfo.status === 'ONLINE' && (
                        <SelectContainer style={{ left: state.floatingControlMode.x, top: state.floatingControlMode.y }}>
                          <div>
                            <ControlButton larger noBorder isActive={state.activeFancoilOperationMode === 0} onClick={() => { state.sendingNewFancoilMode = true; render(); setFancoilOperationMode(0); }}>
                              <ControlButtonIconFancoil isActive={state.activeFancoilOperationMode === 0} alt="cool" src={img_mode_cool} />
                              <span style={{
                                width: '70%', fontSize: '13px', fontWeight: '600', color: state.activeFancoilOperationMode === 0 ? '#fff' : colors.Blue700,
                              }}
                              >
                                {t('refrigerar')}
                              </span>
                            </ControlButton>
                          </div>
                          <div>
                            <ControlButton larger noBorder isActive={state.activeFancoilOperationMode === 1} onClick={() => { state.sendingNewFancoilMode = true; render(); setFancoilOperationMode(1); }}>
                              <ControlButtonIconFancoil isActive={state.activeFancoilOperationMode === 1} alt="fan" src={img_mode_fan} />
                              <span style={{
                                width: '70%', fontSize: '13px', fontWeight: '600', color: state.activeFancoilOperationMode === 1 ? '#fff' : colors.Blue700,
                              }}
                              >
                                {t('ventilar')}
                              </span>
                            </ControlButton>
                          </div>
                          <div>
                            <ControlButton larger noBorder isActive={state.activeFancoilOperationMode === 2} onClick={() => { state.sendingNewFancoilMode = true; render(); setFancoilOperationMode(2); }}>
                              <ControlButtonIconFancoil isActive={state.activeFancoilOperationMode === 2} alt="off" src={img_mode_off} />
                              <span style={{
                                width: '70%', fontSize: '13px', fontWeight: '600', color: state.activeFancoilOperationMode === 2 ? '#fff' : colors.Blue700,
                              }}
                              >
                                {t('desligar')}
                              </span>
                            </ControlButton>
                          </div>
                        </SelectContainer>
                        )}
                      </Flex>
                      {state.devInfo.status === 'ONLINE' && (
                      <>
                        <div style={{ margin: '0px 15px' }}>
                          <Flex
                            width="105px"
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                          >
                            <div style={{ fontWeight: 'bold', marginBottom: '24px' }}>{t('setpoint')}</div>

                            <ControlButton
                              disabled={state.sendingNewFancoilMode || state.activeFancoilOperationMode !== 0}
                              style={{ width: '105px', height: '45px', justifyContent: 'flex-start' }}
                              isActive={false}
                            >
                              <div style={{
                                width: '57px',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                              }}
                              >
                                <SetpointButton up onClick={() => state.activeFancoilOperationMode === 0 && state.fancoilSetpoint && state.devInfo.status === 'ONLINE' && changeFancoilSetpoint(state.fancoilSetpoint + 1)}>
                                  <ArrowUpIconV2 width="9" heigth="8" />
                                </SetpointButton>
                                <SetpointButton down onClick={() => state.activeFancoilOperationMode === 0 && state.fancoilSetpoint && state.devInfo.status === 'ONLINE' && changeFancoilSetpoint(state.fancoilSetpoint - 1)}>
                                  <ArrowDownIconV2 width="9" heigth="8" />
                                </SetpointButton>
                              </div>
                              <div style={{ width: '98px', marginLeft: '14px' }}>
                                <div style={{ fontWeight: '400', fontSize: '16px' }}>{`${state.fancoilSetpoint?.toFixed(0) || '-'} °C`}</div>
                              </div>
                            </ControlButton>
                          </Flex>

                        </div>
                        <div style={{ margin: '0px 15px' }}>
                          <Flex
                            width="105px"
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                          >
                            <div style={{ fontWeight: 'bold', marginBottom: '24px' }}>{t('ventilador')}</div>

                            <Flex flexDirection="row" width="100%" alignItems="center" justifyContent="space-between">
                              <Flex flexDirection="column" alignItems="center" justifyContent="center">
                                <FanOnIcon width="31" height="28" color={!state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilFan != null && state.fancoilFan !== 0 ? undefined : colors.LightGrey_v3} />
                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: !state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilFan != null && state.fancoilFan !== 0 ? colors.Blue700 : colors.LightGrey_v3 }}>{t('ligadoMin')}</span>
                              </Flex>
                              <Flex flexDirection="column" alignItems="center" justifyContent="center">
                                <FanOffIcon width="42" height="28" color={!state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilFan != null && state.fancoilFan === 0 ? undefined : colors.LightGrey_v3} />
                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: !state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilFan != null && state.fancoilFan === 0 ? colors.Blue700 : colors.LightGrey_v3 }}>{t('desligadoMinusculo')}</span>
                              </Flex>
                            </Flex>
                          </Flex>
                        </div>
                        <div style={{ margin: '0px 15px' }}>
                          <Flex
                            width="142px"
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                          >
                            <div style={{ fontWeight: 'bold', marginBottom: '24px' }}>{t('comandoValvula')}</div>
                            <Flex flexDirection="row" width="100%" alignItems="center" justifyContent="center">
                              <Flex flexDirection="column" alignItems="center" justifyContent="center" marginRight="16px">
                                <ValveOpenedIcon width="39" height="27" color={!state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilValve != null && state.fancoilValve === 1 ? undefined : colors.LightGrey_v3} />
                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: !state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilValve != null && state.fancoilValve === 1 ? colors.Blue700 : colors.LightGrey_v3 }}>{t('aberta')}</span>
                              </Flex>
                              <Flex flexDirection="column" alignItems="center" justifyContent="center">
                                <ValveClosedIcon width="39" height="27" color={!state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilValve != null && state.fancoilValve === 0 ? undefined : colors.LightGrey_v3} />
                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: !state.sendingNewFancoilMode && state.activeFancoilOperationMode !== null && state.fancoilValve != null && state.fancoilValve === 0 ? colors.Blue700 : colors.LightGrey_v3 }}>{t('fechada')}</span>
                              </Flex>
                            </Flex>
                          </Flex>
                        </div>
                        <div style={{ margin: '0px 15px' }}>
                          <Flex
                            width="120px"
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                          >
                            <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>{t('programacoes')}</div>
                            <Flex flexDirection="row" width="100%" alignItems="center" justifyContent="center">
                              <NotyIconStyle>
                                {driState.totalSchedules > 0 && (
                                  <NotyNumCornerStyle>{driState.totalSchedules}</NotyNumCornerStyle>
                                )}
                                <ControlButton
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                  }}
                                  onClick={() => {
                                    setDriState({
                                      showScheduleModal: true,
                                    });
                                  }}
                                >
                                  <ControlButtonIcon
                                    alt={t('programacao')}
                                    status={state.devInfo?.status}
                                    src={img_schedule}
                                    width="24px"
                                    height="24px"
                                  />
                                </ControlButton>
                              </NotyIconStyle>
                            </Flex>
                          </Flex>
                        </div>
                      </>
                      )}
                    </Flex>
                  </div>
                )}
            </Flex>
            )}
            {state.devInfo.dri && getKeyByValue(driMeterApplications, state.devInfo.dri.varsCfg?.application) && (
            <Flex flexDirection="column">
              {!state.desktopWidth.matches && (
              <Box width="50%" justifyContent="center" ml="25%" mt="10%">
                <Select
                  name="option"
                  onSelect={(e) => setEnergyState({ tab: e })}
                  options={[{ label: t('tensao'), value: 'voltage' }, { label: t('corrente'), value: 'current' }, { label: t('potenciaAtiva'), value: 'active-power' }]}
                  hideSelected
                  value={energyState.tab}
                />
              </Box>
              )}
              {state.desktopWidth.matches
            && (
              <>
                <div style={{
                  display: 'grid', gridTemplateColumns: '120px 6px 120px 6px 120px auto', height: '5px', paddingLeft: '0px', marginTop: '50px',
                }}
                >
                  <span
                    style={{
                      border: '1px solid lightgrey',
                      borderBottom: 'none',
                      borderRadius: '6px 6px 0 0',
                      backgroundColor: (energyState.tab.value === 'voltage') ? 'transparent' : '#f4f4f4',
                    }}
                  />
                  <span />
                  <span
                    style={{
                      border: '1px solid lightgrey',
                      borderBottom: 'none',
                      borderRadius: '6px 6px 0 0',
                      backgroundColor: (energyState.tab.value === 'current') ? 'transparent' : '#f4f4f4',
                    }}
                  />
                  <span />
                  <span
                    style={{
                      border: '1px solid lightgrey',
                      borderBottom: 'none',
                      borderRadius: '6px 6px 0 0',
                      backgroundColor: (energyState.tab.value === 'active-power') ? 'transparent' : '#f4f4f4',
                    }}
                  />
                  <span />
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '120px 6px 120px 6px 120px auto', marginBottom: '10px', paddingLeft: '0px',
                }}
                >
                  <span
                    style={{
                      borderRight: '1px solid lightgrey',
                      borderLeft: '1px solid lightgrey',
                      textAlign: 'center',
                      fontSize: '90%',
                      borderBottom: (energyState.tab.value === 'voltage') ? 'none' : '1px solid lightgrey',
                      backgroundColor: (energyState.tab.value === 'voltage') ? 'transparent' : '#f4f4f4',
                      cursor: (energyState.tab.value === 'voltage') ? undefined : 'pointer',
                    }}
                    onClick={() => setEnergyState({ tab: { label: 'Tensão', value: 'voltage' } })}
                  >
                    {t('tensao')}
                  </span>
                  <span
                    style={{
                      borderBottom: '1px solid lightgrey',
                    }}
                  />
                  <span
                    style={{
                      borderLeft: '1px solid lightgrey',
                      borderRight: '1px solid lightgrey',
                      textAlign: 'center',
                      fontSize: '90%',
                      borderBottom: (energyState.tab.value === 'current') ? 'none' : '1px solid lightgrey',
                      backgroundColor: (energyState.tab.value === 'current') ? 'transparent' : '#f4f4f4',
                      cursor: (energyState.tab.value === 'current') ? undefined : 'pointer',
                    }}
                    onClick={() => setEnergyState({ tab: { label: 'Corrente', value: 'current' } })}
                  >
                    {t('corrente')}
                  </span>
                  <span
                    style={{
                      borderBottom: '1px solid lightgrey',
                    }}
                  />
                  <span
                    style={{
                      borderLeft: '1px solid lightgrey',
                      borderRight: '1px solid lightgrey',
                      textAlign: 'center',
                      fontSize: '90%',
                      borderBottom: (energyState.tab.value === 'active-power') ? 'none' : '1px solid lightgrey',
                      backgroundColor: (energyState.tab.value === 'active-power') ? 'transparent' : '#f4f4f4',
                      cursor: (energyState.tab.value === 'active-power') ? undefined : 'pointer',
                    }}
                    onClick={() => setEnergyState({ tab: { label: 'Potência Ativa', value: 'active-power' } })}
                  >
                    {t('potenciaAtiva')}
                  </span>
                  <span
                    style={{
                      borderBottom: '1px solid lightgrey',
                    }}
                  />
                </div>
              </>
            )}

              <Flex ml={state.desktopWidth.matches ? '5%' : '0px'} flexDirection={state.desktopWidth.matches ? 'row' : 'column'} width="100%" mt={40}>
                <ResponsiveContainer width={state.desktopWidth.matches ? '50%' : '100%'} height={350}>
                  <ScatterChart
                    margin={{
                      top: 20, right: state.desktopWidth.matches ? 20 : 5, bottom: 10, left: state.desktopWidth.matches ? 10 : -10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="timestamp"
                      tick={<CustomTickTime anchor="middle" />}
                      interval={0}
                      tickCount={7}
                      minTickGap={-2}
                      domain={['dataMin', 'dataMax']}
                    />
                    {energyState.tab.value === 'voltage' && <YAxis dataKey="y" name="voltage" unit="V" type="number" domain={[(dataMin) => Math.round(dataMin) - 3, (dataMax) => Math.round(dataMax) + 3]} tickCount={6} />}
                    {energyState.tab.value === 'voltage' && state.showCurves.totalOrMedium && <Scatter name="v_avg" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.v_avg }))} fill="#13006A" />}
                    {energyState.tab.value === 'voltage' && state.showCurves.phaseA && <Scatter name="v_a" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.v_a }))} fill="#4B2FDB" />}
                    {energyState.tab.value === 'voltage' && state.showCurves.phaseB && <Scatter name="v_b" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.v_b }))} fill="#9480F9" />}
                    {energyState.tab.value === 'voltage' && state.showCurves.phaseC && <Scatter name="v_c" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.v_c }))} fill="#D2CAF8" />}

                    {energyState.tab.value === 'current' && <YAxis dataKey="y" name="current" unit="A" type="number" domain={[(dataMin) => Math.round(dataMin) - 3, (dataMax) => Math.round(dataMax) + 3]} tickCount={6} />}
                    {energyState.tab.value === 'current' && state.showCurves.totalOrMedium && <Scatter name="i_total" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.i_total }))} fill="#13006A" />}
                    {energyState.tab.value === 'current' && state.showCurves.phaseA && <Scatter name="i_a" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.i_a }))} fill="#4B2FDB" />}
                    {energyState.tab.value === 'current' && state.showCurves.phaseB && <Scatter name="i_b" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.i_b }))} fill="#9480F9" />}
                    {energyState.tab.value === 'current' && state.showCurves.phaseC && <Scatter name="i_c" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.i_c }))} fill="#D2CAF8" />}

                    {energyState.tab.value === 'active-power' && <YAxis dataKey="y" name="active-power" unit="kW" type="number" domain={[(dataMin) => (dataMin - getMagnitudeOrder(dataMin)).toFixed(1), (dataMax) => (dataMax + getMagnitudeOrder(dataMax)).toFixed(1)]} tickCount={6} />}
                    {energyState.tab.value === 'active-power' && state.showCurves.totalOrMedium && <Scatter name="pot_at_total" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.pot_at_total }))} fill="#13006A" />}
                    {energyState.tab.value === 'active-power' && !verifyMeterIsSchneiderPm210() && state.showCurves.phaseA && <Scatter name="pot_at_a" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.pot_at_a }))} fill="#4B2FDB" />}
                    {energyState.tab.value === 'active-power' && !verifyMeterIsSchneiderPm210() && state.showCurves.phaseB && <Scatter name="pot_at_b" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.pot_at_b }))} fill="#9480F9" />}
                    {energyState.tab.value === 'active-power' && !verifyMeterIsSchneiderPm210() && state.showCurves.phaseC && <Scatter name="pot_at_c" line={{ strokeWidth: 3 }} shape={() => null} data={state.telemetries.map((tel) => ({ x: getTime(tel.timestamp), y: tel.pot_at_c }))} fill="#D2CAF8" />}
                  </ScatterChart>
                </ResponsiveContainer>
                {!(verifyMeterIsSchneiderPm210() && energyState.tab.value === 'active-power') && (
                  <Flex alignItems="center" justifyContent="center" alignContent="center" paddingTop={state.desktopWidth.matches ? '0px' : '5px'}>
                    <Flex flexDirection="column" alignItems="center" justifyContent="center" alignContent="center" height="70%" width="100%">
                      <Flex flexDirection={state.desktopWidth.matches ? 'column' : 'row'}>
                        <Flex flexDirection="column" m="8px">
                          <Flex alignItems="center" height="25px">
                            <CheckboxMaterial
                              style={{ color: '#13006A', marginLeft: '-12px', backgroundColor: 'transparent' }}
                              size="small"
                              disableRipple
                              checked={state.showCurves.totalOrMedium}
                              onClick={() => setState({
                                showCurves: {
                                  ...state.showCurves,
                                  totalOrMedium: !state.showCurves.totalOrMedium,
                                },
                              })}
                            />
                            {energyState.tab.value === 'voltage' ? (<span style={{ fontSize: '14px', fontWeight: 700 }}>{t('Média')}</span>) : (<span style={{ fontSize: '14px', fontWeight: 700 }}>{t('total')}</span>)}
                          </Flex>
                          <ParamValue isOk>
                            {energyState.tab.value === 'voltage' && (
                            <div>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_avg?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                              <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                            </div>
                            )}
                            {energyState.tab.value === 'current' && (
                            <div>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_total?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                              <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                            </div>
                            )}
                            {energyState.tab.value === 'active-power' && (
                            <div>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_total?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                              <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                            </div>
                            )}
                          </ParamValue>
                        </Flex>

                        <Flex flexDirection={state.desktopWidth.matches ? 'column' : 'row'}>
                          <Flex flexDirection="column" m="8px">
                            <Flex alignItems="center" height="25px">
                              <CheckboxMaterial
                                style={{ color: '#4B2FDB', marginLeft: '-12px', backgroundColor: 'transparent' }}
                                size="small"
                                checked={state.showCurves.phaseA}
                                disableRipple
                                onClick={() => setState({
                                  showCurves: {
                                    ...state.showCurves,
                                    phaseA: !state.showCurves.phaseA,
                                  },
                                })}
                              />
                              <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('faseA')}</span>
                            </Flex>
                            <ParamValue isOk>
                              {energyState.tab.value === 'voltage' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                                </div>
                              )}
                              {energyState.tab.value === 'current' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                                </div>
                              )}
                              {energyState.tab.value === 'active-power' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                                </div>
                              )}
                            </ParamValue>
                          </Flex>
                          <Flex flexDirection="column" m="8px">
                            <Flex alignItems="center" height="25px">
                              <CheckboxMaterial
                                style={{ color: '#9480F9', marginLeft: '-12px', backgroundColor: 'transparent' }}
                                size="small"
                                checked={state.showCurves.phaseB}
                                disableRipple
                                onClick={() => setState({
                                  showCurves: {
                                    ...state.showCurves,
                                    phaseB: !state.showCurves.phaseB,
                                  },
                                })}
                              />
                              <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('faseB')}</span>
                            </Flex>
                            <ParamValue isOk>
                              {energyState.tab.value === 'voltage' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                                </div>
                              )}
                              {energyState.tab.value === 'current' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                                </div>
                              )}
                              {energyState.tab.value === 'active-power' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                                </div>
                              )}
                            </ParamValue>
                          </Flex>
                          <Flex flexDirection="column" m="8px">
                            <Flex alignItems="center" height="25px">
                              <CheckboxMaterial
                                style={{ color: '#D2CAF8', marginLeft: '-12px', backgroundColor: 'transparent' }}
                                disableRipple
                                size="small"
                                checked={state.showCurves.phaseC}
                                onClick={() => setState({
                                  showCurves: {
                                    ...state.showCurves,
                                    phaseC: !state.showCurves.phaseC,
                                  },
                                })}
                              />
                              <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('faseC')}</span>
                            </Flex>
                            <ParamValue isOk>
                              {energyState.tab.value === 'voltage' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_c?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                                </div>
                              )}
                              {energyState.tab.value === 'current' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_c?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                                </div>
                              )}
                              {energyState.tab.value === 'active-power' && (
                                <div>
                                  {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_c?.toFixed(2).replace('.', ',') ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                                  <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                                </div>
                              )}
                            </ParamValue>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                )}
              </Flex>
              {state.desktopWidth.matches ? (
                <div style={{
                  borderTop: '1px solid lightgrey', width: '90%', marginLeft: '10px', marginTop: '50px',
                }}
                />
              ) : (
                <div style={{
                  borderTop: '1px solid lightgrey', width: '92%', marginLeft: '4%', marginRight: '4%',
                }}
                />
              )}

              <Box
                m="20px "
              >
                <ParamTitle>{t('parametros')}</ParamTitle>
                <Box paddingLeft="10%" display={state.desktopWidth.matches ? 'flex' : 'column'} flexDirection="row">
                  <Box display="flex" paddingBottom="20px">
                    <Box width="200px">
                      <ParamTitle>{t('tensao')}</ParamTitle>
                      <Flex flexDirection="column">
                        <ParamName>{t('faseA')}</ParamName>
                        <ParamValue isOk>
                          {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                        </ParamValue>
                      </Flex>

                      <Flex flexDirection="column">
                        <ParamName>{t('faseB')}</ParamName>
                        <ParamValue isOk>
                          {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                        </ParamValue>
                      </Flex>

                      <Flex flexDirection="column">
                        <ParamName>{t('faseC')}</ParamName>
                        <ParamValue isOk>
                          {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].v_c?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> V</span>
                        </ParamValue>
                      </Flex>
                    </Box>
                    <Box width="200px">
                      <ParamTitle>{t('corrente')}</ParamTitle>

                      <Flex flexDirection="column">
                        <ParamName>{t('faseA')}</ParamName>
                        <ParamValue isOk>
                          {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                        </ParamValue>
                      </Flex>

                      <Flex flexDirection="column">
                        <ParamName>{t('faseB')}</ParamName>
                        <ParamValue isOk>
                          {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                        </ParamValue>
                      </Flex>

                      <Flex flexDirection="column">
                        <ParamName>{t('faseC')}</ParamName>
                        <ParamValue isOk>
                          {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].i_c?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> A</span>
                        </ParamValue>
                      </Flex>
                    </Box>
                  </Box>
                  <Box display="flex">
                    <Box width="200px">
                      <ParamTitle>{t('potenciaAtiva')}</ParamTitle>
                      {verifyMeterIsSchneiderPm210() ? (
                        <Flex flexDirection="column">
                          <ParamName>{t('total')}</ParamName>
                          <ParamValue isOk>
                            {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_tri?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                            <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                          </ParamValue>
                        </Flex>
                      ) : (
                        <>
                          <Flex flexDirection="column">
                            <ParamName>{t('faseA')}</ParamName>
                            <ParamValue isOk>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                              <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                            </ParamValue>
                          </Flex>

                          <Flex flexDirection="column">
                            <ParamName>{t('faseB')}</ParamName>
                            <ParamValue isOk>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                              <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                            </ParamValue>
                          </Flex>

                          <Flex flexDirection="column">
                            <ParamName>{t('faseC')}</ParamName>
                            <ParamValue isOk>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].pot_at_c?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                              <span style={{ color: '#5B5B5B', fontWeight: 'normal' }}> kW</span>
                            </ParamValue>
                          </Flex>
                        </>
                      )}
                    </Box>
                  </Box>
                  <Box display="flex">
                    <Box width="200px">
                      <ParamTitle>{t('fatorPotencia')}</ParamTitle>
                      {verifyMeterIsSchneiderPm210() ? (
                        <Flex flexDirection="column">
                          <ParamName>{t('total')}</ParamName>
                          <ParamValue isOk>
                            {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].fp?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                          </ParamValue>
                        </Flex>
                      ) : (
                        <>
                          <Flex flexDirection="column">
                            <ParamName>{t('faseA')}</ParamName>
                            <ParamValue isOk>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].fp_a?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                            </ParamValue>
                          </Flex>

                          <Flex flexDirection="column">
                            <ParamName>{t('faseB')}</ParamName>
                            <ParamValue isOk>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].fp_b?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                            </ParamValue>
                          </Flex>

                          <Flex flexDirection="column">
                            <ParamName>{t('faseC')}</ParamName>
                            <ParamValue isOk>
                              {(state.telemetries.length > 0 ? formatNumberWithFractionDigits(state.telemetries[state.telemetries.length - 1].fp_c?.toFixed(2) ?? '-', { minimum: 0, maximum: 2 }) : '-')}
                            </ParamValue>
                          </Flex>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
              {state.installationError && state.installationError !== t('semErro') && (
              <Box m="20px ">
                <ParamTitle>{t('alertas')}</ParamTitle>
                <b style={{ marginLeft: '40px' }}>
                  {t('possivelErroNaInstalacao', {
                    value: state.installationError,
                  })}
                </b>
              </Box>
              )}
            </Flex>
            )}
            {state.devInfo.dri && !getKeyByValue(driMeterApplications, state.devInfo.dri.varsCfg?.application) && !getKeyByValue(driApplicationOpts, state.devInfo.dri.varsCfg?.application) && !getKeyByValue(driVAVsApplications, state.devInfo.dri.varsCfg?.application) && !isDRIFancoil(state.devInfo) && (
            <Flex>
              <CardElev>
                {(state.loading) && <Loader />}
                <Bluebar />
                <ConteinerTitle>
                  <h1>Informações</h1>
                </ConteinerTitle>
                <RealTimeBox>
                  <ContentRealTime>
                    <Content>
                      <h3>Operation Mode</h3>
                      <span>1</span>
                    </Content>
                    <Content>
                      <h3>Filter Sign</h3>
                      <span>0</span>
                    </Content>
                    <Content>
                      <h3>Local Wall Controller</h3>
                      <span>2</span>
                    </Content>
                  </ContentRealTime>
                  <ContentRealTime>
                    <Content>
                      <h3>Fan Speed</h3>
                      <span>1</span>
                    </Content>
                    <Content>
                      <h3>Swing</h3>
                      <span>Off</span>
                    </Content>
                  </ContentRealTime>
                  <ContentRealTime>
                    <Content>
                      <h3>ON/OFF</h3>
                      <span>Off</span>
                    </Content>
                    <Content>
                      <h3>Malfunction Code</h3>
                      <span>n/d</span>
                    </Content>
                  </ContentRealTime>
                </RealTimeBox>

              </CardElev>
              <CardElev>
                <Bluebar />
                <ConteinerTitle>
                  <h1>Temperatura</h1>
                </ConteinerTitle>
                <RealTimeBox>
                  <ContentRealTime>
                    <Content>
                      <h3>Room Temperature</h3>
                      <span>
                        35
                        <p>°C</p>
                      </span>
                    </Content>
                    <Content>
                      <h3>Set Temperature</h3>
                      <span>
                        5
                        <p>°C</p>
                      </span>
                    </Content>
                    <Content>
                      <h3>Set Temp.Limites</h3>
                      <span>
                        20 - 35
                        <p>°C</p>
                      </span>
                    </Content>
                  </ContentRealTime>
                </RealTimeBox>
                <RealTimeBox />
              </CardElev>
            </Flex>
            )}
          </>
        ) : (
          <Flex flexDirection="column">
            {t('dispositivoOffline')}
          </Flex>
        )}

      </Flex>
    </>
  );
}

function Dial(props: { temperature: number | null, color?: string | null, status: string, withCommands: boolean }) {
  const min = 17;
  const max = 25;
  let percentage = (props.temperature == null) ? NaN : ((props.temperature - min) / (max - min));
  if (percentage > 1) percentage = 1;
  if (percentage < 0) percentage = 0;
  if (!Number.isFinite(percentage)) percentage = NaN;

  function onSvgClick(event) {
    let el = event.target;
    while (el.tagName.toLowerCase() !== 'svg') {
      if (!el.parentElement) return;
      if (!el.parentElement.tagName) return;
      el = el.parentElement;
    }
    const rect = el.getBoundingClientRect();
  }

  return (
    <svg
      width="230"
      height="230"
      viewBox="0 0 43.93095 43.93095"
      onClick={onSvgClick}
    >
      <g transform="translate(-9.1068883,-56.072787)">
        {props.withCommands && (
          <path
            style={{
              fill: 'none',
              stroke: '#d9d9d9',
              strokeWidth: 1.05833,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
              strokeOpacity: 1,
            }}
            transform="scale(-1)"
            d="m -26.111271,-92.230659 a 15.034513,15.034513 0 0 1 9.857829,16.729361 15.034513,15.034513 0 0 1 -14.861396,12.49749 15.034513,15.034513 0 0 1 -14.790544,-12.581262 15.034513,15.034513 0 0 1 9.952198,-16.673395"
          />
        )}
        {(!Number.isNaN(percentage)) && props.withCommands && (
          <g transform={`rotate(${percentage * 317 - 20.4},31.072363,78.038261)`}>
            <circle
              style={{
                fill: 'none',
                stroke: '#bbbbbb',
                strokeWidth: 0.785182,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                strokeOpacity: 0.00765806,
              }}
              transform="scale(-1)"
              cx="-31.072363"
              cy="-78.038261"
              r="15.034513"
            />
            <circle
              style={{
                fill: '#363bc4',
                fillOpacity: 1,
                stroke: 'none',
                strokeWidth: 2.96762,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
              cx="20.919857"
              cy="89.219666"
              r="1.2549769"
            />
          </g>
        )}
        <circle
          style={{
            fill: 'none',
            fillOpacity: 1,
            stroke: props.color ? (props.color || colors.LightLightGrey_v3) : (props.status === 'ONLINE') ? 'mediumseagreen' : colors.LightLightGrey_v3,
            strokeWidth: 3.92591,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
            strokeOpacity: 1,
          }}
          cx="31.072363"
          cy="78.038261"
          r="20.00252"
        />
        {props.withCommands && (
          <>
            <rect
              style={{
                fill: '#2d81ff',
                fillOpacity: 1,
                stroke: 'none',
                strokeWidth: 0.252035,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
              }}
              width="1.7076257"
              height="1.7076257"
              x="27.262398"
              y="91.697784"
              ry="0.54493499"
            />
            <rect
              style={{
                fill: '#e00030',
                fillOpacity: 1,
                stroke: 'none',
                strokeWidth: 0.252035,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
              }}
              width="1.7076257"
              height="1.7076257"
              x="33.055614"
              y="91.697784"
              ry="0.54493499"
            />
          </>
        )}
      </g>
    </svg>
  );
}

const ToggleSwitch = ({
  label = undefined, checked, onOff = false, ...props
}): JSX.Element => (
  <Container {...props}>
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Slider checked={checked}>
        <Cursor onOff={onOff} checked={checked} />
      </Slider>
      {label && <span style={{ paddingLeft: '8px' }}>{label}</span>}
    </div>
  </Container>
);

function convertKronErrorTelemetry(availableErrors, erro) {
  if (erro === 0) return t('semErro');
  const erroBin = erro.toString(2);
  const msg = [] as string[];
  erroBin.split('').forEach((bit, i) => {
    if (bit === '1') {
      const position = erroBin.length - i - 1;
      availableErrors[position] && msg.push(availableErrors[position]);
    }
  });
  return msg.join('; ');
}

const convertErrorTelemetry = (erro: number, driApplication: string) => {
  if (!driApplication) return null;

  if (driApplication === 'kron-ikron-03') {
    return convertKronErrorTelemetry(ikron03availableErrors, erro);
  }

  if (driApplication === 'kron-mult-k' && erro === 16) {
    return t('semErro');
  }

  if (driApplication === 'kron-mult-k') {
    return convertKronErrorTelemetry(multkAvailableErrors, erro);
  }

  switch (erro) {
    case 0: return t('semErro');
    case 1: return t('sequenciaFaseIncorreta');
    case 2: return t('orientacaoTcFase1Invertida');
    case 4: return t('orientacaoTcFase2Invertida');
    case 8: return t('orientacaoTcFase3Invertida');
    case 16: return t('posicaoTcsFase1e2Trocadas');
    case 32: return t('posicaoTcsFase1e3Trocadas');
    case 64: return t('posicaoTcsFase2e3Trocadas');
    case 128: return t('nenhumaAssociacaoTcsFasesCorreta');
    case 256: return t('medidorEnergiaDesconectadoOuFalhaLigacoesEletricas');
    default: return t('semErro');
  }
};
