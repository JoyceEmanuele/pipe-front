import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { Loader } from '~/components';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { useWebSocket } from '~/helpers/wsConnection';
import {
  HumidityIcon,
  TermometerIcon,
  CO2IconV2,
  EvapReturnIcon,
  EvapInsufIcon,
} from '~/icons';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';
import {
  ControlButton,
  ControlButtonIcon,
  SelectContainer,
} from './styles';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';

import img_mode_cool from '~/assets/img/cool_ico/mode_cool.svg';
import img_mode_fan from '~/assets/img/cool_ico/mode_fan.svg';
import img_power from '~/assets/img/cool_ico/power.svg';
import img_power_grey from '~/assets/img/cool_ico/power_grey.svg';
import { t } from 'i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const EnvironmentRealTime = (): JSX.Element => {
  const routeParams = useParams<{ devId }>();
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaTempoReal')}</title>
      </Helmet>
      <DevLayout devInfo={devInfo} />
      {/* @ts-ignore */}
      <EnvironmentRealTimeContents onDevInfoUpdate={render} />
    </>
  );
};

export function identifyDutIrCommands(dutIrCmds) {
  return dutIrCmds.map((item) => {
    const desc = (item.CMD_DESC || '').toUpperCase();
    const t1 = (item.TEMPER == null) ? null : String(item.TEMPER);
    const t2 = (desc.match(/(\d+)/g) || []).join(';') || null;
    const T = (t1 === t2) ? t1 : [t1, t2].filter((x) => x).join(';');
    const ehDesl = !!((item.CMD_TYPE === 'AC_OFF') || desc.includes('DESL') || desc.includes('OFF'));
    const ehVent = !!((item.CMD_TYPE === 'AC_FAN') || desc.includes('VENT') || desc.includes('FAN'));
    const ehRefr_pre = !!((item.CMD_TYPE === 'AC_COOL') || desc.includes('COOL') || desc.includes('REFR') || desc.includes('SET') || desc.match(/\bLIG/) || desc.match(/\bON/)) || (item.CMD_DESC && item.CMD_DESC === t2);
    const ehRefr = ehRefr_pre || !!(T && (!ehDesl) && (!ehVent));
    const M = (desc.startsWith('FAKE') ? 'FAKE' : [ehDesl && 'AC_OFF', ehVent && 'AC_FAN', ehRefr && 'AC_COOL'].filter((x) => x).join(';')) || '?';
    let avaliacao = '';
    if ((M === 'AC_OFF') || (M === 'AC_FAN')) { avaliacao = 'OK'; }
    else if ((M === 'AC_COOL') && T && (T.length === 2)) { avaliacao = 'OK'; }
    const identificado = ((avaliacao === 'OK') && `${M}${(M === 'AC_COOL') ? (`:${T}`) : ''}`) || null;
    // identificado = 'AC_OFF' ou 'AC_FAN' ou 'AC_COOL:21' ...
    return { ...item, cmdName: identificado };
  }) || null;
}

export function EnvironmentRealTimeContents({ onDevInfoUpdate = undefined }) {
  const { devId: dutId } = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar({
    data: null as null | {
      operation_mode: number; status: string, Temperature: string | number, Temperature_1: null | number, Humidity?: null | number, eCO2?: null | number
}, // { status, Temperature, Humidity, eCO2, TVOC}
    dutStats: null, // { max, med, min, dayIni, dayEnd }
    devInfo: getCachedDevInfoSync(dutId),
    dutIrCommands: null as null | { IR_ID: string, cmdName: string, CMD_TYPE: string }[],
    dutType: null as null | 'monitoring' | 'automation',
    timerChangeSetpoint: null as null | NodeJS.Timeout,
    setpoint: 23 as number,
    activeOperationMode: 0,
    activeOperationStatus: 1,
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
  });

  function getDutType() {
    const dutInfo = state.devInfo;
    if (!dutInfo.dut_aut) {
      setState({ dutType: 'monitoring' });
    }
    if (dutInfo.dut_aut && dutInfo.dut_aut.DUTAUT_DISABLED !== 1) {
      const tempDefault = dutInfo.dut_aut.TSETPOINT || state.dutIrCommands?.filter((command) => {
        const cmdSetpoint = Number(command?.cmdName?.split(':')[1]) || null;
        if (cmdSetpoint != null) return command;
      })
        .map((command) => (
          {
            IR_ID: command.IR_ID,
            CMD_NAME: command?.cmdName,
            CMD_TYPE: command?.CMD_TYPE,
            TEMPER: Number(command?.cmdName?.split(':')[1]),
          }
        ))
        .find((item) => item.CMD_TYPE === 'AC_COOL')?.TEMPER;
      setState({ dutType: 'automation', setpoint: tempDefault || 23 });
    }
  }

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        const dayIni = new Date(Date.now() - (6 + new Date().getDay()) * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString().substr(0, 10);
        const dayEnd = new Date(Date.now() - (2 + new Date().getDay()) * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString().substr(0, 10);

        const [
          devInfo,
          dutStats,
        ] = await Promise.all([
          getCachedDevInfo(dutId, {}),
          apiCall('/dut/get-day-stats', {
            devId: dutId,
            dayIni,
            numDays: 5,
          }),
        ]);

        if (state.dutType !== 'monitoring') {
          const { list: dutIrCodes } = await apiCall('/get-dut-ircodes-list', { devId: dutId });
          state.dutIrCommands = identifyDutIrCommands(dutIrCodes);
        }
        getDutType();
        // @ts-ignore
        if (onDevInfoUpdate) onDevInfoUpdate();

        state.devInfo = devInfo;
        // @ts-ignore
        state.dutStats = dutStats || {};
        // @ts-ignore
        state.dutStats.dayIni = dayIni;
        // @ts-ignore
        state.dutStats.dayEnd = dayEnd;
        render();
      } catch (err) { toast.error(t('erro')); console.error(err); getDutType(); }
    });
  }, []);

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: dutId } });
  }
  function onWsMessage(response) {
    if (response && response.type === 'dutTelemetry') {
      if (response.data.status !== 'ONLINE') {
        response.data.Temperature = '-';
        response.data.Temperature_1 = null;
        response.data.Humidity = null;
        response.data.eCO2 = null;
        response.data.TVOC = null;
        setState({ data: response.data });
      }
      if (response.data.status === 'ONLINE' && response.data.timestamp) {
        setState({ data: response.data });
      }
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dutUnsubscribeRealTime' });
  }

  function getClosestSetpointCommand(setpoint) {
    return state.dutIrCommands?.reduce((cmd, value) => {
      if (value.cmdName?.includes('COOL')) {
        const cmdSetpoint = Number(cmd?.cmdName?.split(':')[1]) || 0;
        const valueSetpoint = Number(value.cmdName?.split(':')[1]) || 0;
        if (
          (setpoint >= state.setpoint && valueSetpoint >= (setpoint - 1))
          || (setpoint <= state.setpoint && valueSetpoint <= (setpoint + 1))) {
          if (Math.abs(setpoint - valueSetpoint) < Math.abs(setpoint - cmdSetpoint)) return value;
          return cmd;
        }
      }
      return cmd;
    }, undefined as undefined | { IR_ID: string, cmdName: string });
  }

  function changeSetpoint(newSetpoint: number) {
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (state.setpoint) {
      const newSetpointCommand = getClosestSetpointCommand(newSetpoint);
      if (newSetpointCommand) {
        state.setpoint = Number(newSetpointCommand.cmdName.split(':')[1]);
        state.timerChangeSetpoint = setTimeout(() => sendSetpoint(newSetpointCommand), 1500);
        render();
      } else {
        state.timerChangeSetpoint = setTimeout(() => toast.info(t('comandoNaoEncontrado')), 1500);
      }
    }
  }

  async function sendSetpoint(command) {
    try {
      await apiCall('/send-dut-aut-command', { devId: dutId, IR_ID: command.IR_ID });
      toast.success(t('sucessoTemperaturaEnviada'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroEstabelecerSetpoint'));
    }
  }

  const onClickMode = (event) => {
    if (state.floatingControlMode) {
      state.floatingControlMode = null;
    } else {
      let element = event.target;
      while (element.tagName.toLowerCase() !== 'div') {
        if (!(element.parentElement && element.parentElement.tagName)) return;

        element = element.parentElement;
      }
      const rect = element.getBoundingClientRect();
      state.floatingControlMode = {
        y: rect.y + 1 * 71, // event.target.offsetTop, // event.clientY
        x: rect.x, // event.target.offsetLeft, // event.clientX
      };
      state.floatingControlSwing = null;
      state.floatingControlFan = null;
    }
    render();
  };

  async function setOperationMode(operationMode: number) {
    try {
      if (operationMode === 1) {
        const command = state.dutIrCommands?.find((cmd) => cmd.cmdName === 'AC_FAN');
        if (command) {
          await apiCall('/send-dut-aut-command', { devId: dutId, IR_ID: command.IR_ID });
          state.activeOperationMode = operationMode;
          toast.success(t('sucessoModoOperacaoEnviado'));
        } else {
          toast.info(t('comandoNaoEncontrado'));
        }
      }
      if (operationMode === 0) {
        const command = getClosestSetpointCommand(state.setpoint);
        if (command) {
          await apiCall('/send-dut-aut-command', { devId: dutId, IR_ID: command.IR_ID });
          state.setpoint = Number(command.cmdName?.split(':')[1]);
          state.activeOperationMode = operationMode;
          toast.success(t('sucessoModoOperacaoEnviado'));
        } else {
          toast.info(t('comandoNaoEncontrado'));
        }
      }
      setState({ floatingControlMode: null, floatingControlFan: null, floatingControlSwing: null });
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  async function setOperationStatus(operationStatus: number) {
    try {
      if (operationStatus === 0) {
        const command = state.dutIrCommands?.find((cmd) => cmd.cmdName === 'AC_OFF');
        if (command) {
          await apiCall('/send-dut-aut-command', { devId: dutId, IR_ID: command.IR_ID });
          state.activeOperationStatus = operationStatus;
          toast.success(t('sucessoComandoEnviadoDesligar'));
        } else {
          toast.info(t('comandoNaoEncontrado'));
        }
      }
      if (operationStatus === 1) {
        const command = getClosestSetpointCommand(state.setpoint);
        if (command) {
          await apiCall('/send-dut-aut-command', { devId: dutId, IR_ID: command.IR_ID });
          state.setpoint = Number(command.cmdName?.split(':')[1]);
          state.activeOperationStatus = operationStatus;
          toast.success(t('sucessoComandoEnviadoLigar'));
        } else {
          toast.info(t('comandoNaoEncontrado'));
        }
      }
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function getOperationModeIcon(operationMode: number) {
    // operationModes: {"0":"COOL","1":"FAN"},
    switch (operationMode) {
      case 0: return img_mode_cool;
      case 1: return img_mode_fan;
    }
  }

  function onOffBackgroundColor(operationStatus: number) {
    // operationStatuses: {"1":"on","2":"off"},
    if (state.devInfo.status !== 'ONLINE') return '#bbbbbb'; // OFF
    switch (operationStatus) {
      case 1: return '#363bc4'; // ON
      case 2: return '#bbbbbb'; // OFF
      default: return '#bbbbbb';
    }
  }

  function getOperationStatusIcon(operationStatus: number) {
    // operationStatuses: {"1":"on","2":"off"},
    if (state.devInfo.status !== 'ONLINE') return img_power_grey;
    switch (operationStatus) {
      case 1: return img_power;
      case 0: return img_power_grey;
      default: return img_power_grey;
    }
  }

  function getDialColor({ temp, co2, hum }: { temp?: any, co2?: any, hum?: any }) {
    if (state.devInfo.status !== 'ONLINE') return colors.LightGrey_v3;
    if (temp != null && Number.isFinite(Number(temp))) {
      return (
        state.devInfo.dut.TUSEMAX && temp > state.devInfo.dut.TUSEMAX && colors.Red
        || state.devInfo.dut.TUSEMIN && temp < state.devInfo.dut.TUSEMIN && colors.BlueSecondary_v3
        || colors.GreenLight
      );
    }
    if (co2 != null && Number.isFinite(Number(co2)) && state.devInfo.dut.CO2MAX && co2 > state.devInfo.dut.CO2MAX) return colors.LightOrange;
    if (hum != null && Number.isFinite(Number(hum))) {
      const humidityMin = state.devInfo?.dut?.HUMIMIN ?? 30;
      const humidityMax = state.devInfo?.dut?.HUMIMAX ?? 70;
      const humAux = Number(hum);

      if (humAux > humidityMax) {
        return colors.Red;
      }

      if (humAux < humidityMin) {
        return '#2D81FF';
      }
    }
    return colors.GreenLight;
  }

  function labelTempRetorno() {
    if (state.devInfo?.dut.APPLICATION === 'fancoil') {
      return t('saidaAgua');
    }
    return t('retorno');
  }

  function labelTempInsuf() {
    if (state.devInfo?.dut.APPLICATION === 'fancoil') {
      return t('entradaAgua');
    }
    return t('insuflamento');
  }

  const tempOrDutDuo = state.data?.Temperature_1 || state.devInfo?.isDutDuo;

  return (
    <>
      <Flex flexDirection="column">
        <Box width={1} pt="24px">
          <Card>
            <Flex
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
              flexDirection={['column', 'column', 'column', 'column', 'row', 'row']}
            >
              {(!state.data)
                ? <Loader />
                : (
                  <>
                    {state.data && state.data.operation_mode !== 5 && (
                      <BoxWrapper>
                        <Box width={[1, 1, 1, 1, 1, 1]} justifyContent="center" alignItems="center" pr={[0, 0, 0, 0, 0, 0]}>
                          <Wrapper>
                            <div style={{
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              padding: '15px 0',
                            }}
                            >
                              <div style={{ display: 'flex', padding: '15px 0', justifyContent: 'center' }}>
                                <div
                                  style={{
                                    fontWeight: 'bold',
                                    height: '270px',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    alignItems: 'center',
                                    width: '270px',
                                    display: 'flex',
                                  }}
                                >
                                  <div
                                    style={{
                                      left: '0',
                                      position: 'absolute',
                                      top: '0',
                                    }}
                                  >
                                    <Dial temperature={state.setpoint} showIndicator={false} color={getDialColor({ temp: state.data.Temperature, co2: state.data.eCO2 })} />
                                  </div>
                                  <div style={{ zIndex: 1 }}>
                                    {state.data.Temperature !== undefined && (
                                      <div style={{
                                        fontSize: '110%', display: 'flex', textAlign: 'center', justifyContent: 'center',
                                      }}
                                      >
                                        <div>
                                          {(!state.data.Temperature_1 && !state.devInfo?.isDutDuo) && (
                                            <div>
                                              <TermometerIcon style={{ marginLeft: '-10px' }} width="20px" />
                                              {t('agora')}
                                            </div>
                                          ) }
                                          {tempOrDutDuo && (
                                            <div>
                                              {
                                                labelTempRetorno() === t('retorno') && <EvapReturnIcon />
                                              }
                                              <span style={{ marginLeft: '5px' }}>{labelTempRetorno()}</span>
                                            </div>
                                          )}
                                          <div>
                                            <span style={{ fontSize: '320%' }}>{formatNumberWithFractionDigits(state.data.Temperature)}</span>
                                            <span style={{
                                              marginBottom: '12px',
                                              fontSize: '120%',
                                              alignSelf: 'flex-end',
                                              color: colors.Grey200,
                                            }}
                                            >
                                              &nbsp;°C
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {tempOrDutDuo && (
                                      <div style={{
                                        textAlign: 'center', fontSize: '90%', display: 'flex', justifyContent: 'center',
                                      }}
                                      >
                                        <div>
                                          <div>
                                            {
                                                labelTempInsuf() === t('insuflamento') && <EvapInsufIcon />
                                              }
                                            <span style={{ marginLeft: '5px' }}>{labelTempInsuf()}</span>
                                          </div>
                                          <div>
                                            <span style={{ fontSize: '110%' }}>{state.data.Temperature_1 ? formatNumberWithFractionDigits(state.data.Temperature_1) : '-'}</span>
                                            <span style={{
                                              marginBottom: '12px',
                                              color: colors.Grey200,
                                              fontSize: '120%',
                                              alignSelf: 'flex-end',
                                            }}
                                            >
                                              &nbsp;°C
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {state.data.eCO2 && (
                                      <div style={{ fontSize: '110%', textAlign: 'center', display: 'flex' }}>
                                        <div>
                                          <div>
                                            <CO2IconV2 style={{ marginRight: '10px' }} />
                                            {t('nivelCo')}
                                            <span style={{ fontSize: '80%' }}>2</span>
                                          </div>
                                          <div>
                                            <span style={{ fontSize: '320%' }}>{formatNumberWithFractionDigits(state.data.eCO2)}</span>
                                            <span style={{
                                              alignSelf: 'flex-end',
                                              marginBottom: '12px',
                                              fontSize: '120%',
                                              color: colors.Grey200,
                                            }}
                                            >
                                              &nbsp;ppm
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {state.data.Humidity && (
                                      <div>
                                        <div style={{
                                          display: 'center',
                                          alignItems: 'center',
                                          fontSize: '80%',
                                          justifyContent: 'center',
                                        }}
                                        >
                                          <HumidityIcon width="20px" />
                                          {t('umidade')}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                          <span style={{ fontSize: '150%' }}>{formatNumberWithFractionDigits(state.data.Humidity)}</span>
                                          <span style={{ color: colors.Grey200 }}>%</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', margin: '10px 0px', flexWrap: 'wrap' }}>
                                {state.devInfo.dut && state.data.Temperature && (
                                  <div style={{ margin: '0px 15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{t('limitesTemperatura')}</div>
                                    <span>
                                      {t('minMinimo')}
                                      <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dut.TUSEMIN ? formatNumberWithFractionDigits(state.devInfo.dut.TUSEMIN) : '-'}`}</b>
                                      <span style={{ color: colors.Grey200, fontWeight: 'bold', fontSize: '80%' }}>°C</span>
                                      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                      {t('maxMaximo')}
                                      <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dut.TUSEMAX ? formatNumberWithFractionDigits(state.devInfo.dut.TUSEMAX) : '-'}`}</b>
                                      <span style={{ color: colors.Grey200, fontWeight: 'bold', fontSize: '80%' }}>°C</span>
                                    </span>
                                  </div>
                                )}
                                {state.devInfo.dut && state.dutType === 'automation' && (
                                  <div style={{ margin: '0px 15px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                      {t('setpoint')}
                                    </div>
                                    <span>
                                      <b style={{ fontSize: '110%' }}>{`${formatNumberWithFractionDigits(state.setpoint)}`}</b>
                                      <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                                    </span>
                                  </div>
                                )}
                                {state.devInfo.dut && state.data.eCO2 && (
                                  <div style={{ margin: '0px 15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                      {t('limitesDeCo')}
                                      <span>2</span>
                                    </div>
                                    <span>
                                      {t('maxMaximo')}
                                      <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dut.CO2MAX ? formatNumberWithFractionDigits(state.devInfo.dut.CO2MAX) : '-'}`}</b>
                                      <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>ppm</span>
                                    </span>
                                  </div>
                                )}
                                {state.devInfo.dut && state.data.Humidity && (
                                  <div style={{ margin: '0px 15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{t('limitesUmidade')}</div>
                                    <span>
                                      {t('minMinimo')}
                                      <b style={{ fontSize: '110%' }}>{` ${state.devInfo?.dut?.HUMIMIN ?? 60}`}</b>
                                      <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>%</span>
                                      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                      {t('maxMaximo')}
                                      <b style={{ fontSize: '110%' }}>{` ${state.devInfo?.dut?.HUMIMAX ?? 100}`}</b>
                                      <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>%</span>
                                    </span>
                                  </div>
                                )}
                              </div>

                              {state.devInfo.status === 'ONLINE' && state.data.Temperature === null && (
                                <span style={{ color: colors.Grey300 }}>{t('funcoesDispositivoNaoDisponiveis')}</span>
                              )}

                              {state.dutType === 'automation' && (
                                <div>
                                  {state.devInfo.status === 'ONLINE'
                                    ? (
                                      <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginTop: '10px',
                                        justifyContent: 'center',
                                      }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'center', margin: '0px 15px' }}>
                                          <div style={{ display: 'flex' }}>
                                            <ControlButton onClick={onClickMode}>
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
                                          </div>
                                        </div>

                                        <div style={{ margin: '0px 15px' }}>
                                          <ControlButton
                                            style={{ alignSelf: 'end', backgroundColor: onOffBackgroundColor(state.activeOperationStatus) }}
                                            onClick={() => state.devInfo.status === 'ONLINE' && setOperationStatus((state.activeOperationStatus === 1) ? 0 : 1)}
                                          >
                                            <img alt="on_off" src={getOperationStatusIcon(state.activeOperationStatus)} />
                                          </ControlButton>
                                        </div>

                                        {/* <div style={{ margin: '0px 15px' }}>
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
                                              <SetpointButton up onClick={() => state.setpoint && state.devInfo.status === 'ONLINE' && changeSetpoint(state.setpoint + 1)}>
                                                <ArrowUpIconV2 />
                                              </SetpointButton>
                                              <SetpointButton down onClick={() => state.setpoint && state.devInfo.status === 'ONLINE' && changeSetpoint(state.setpoint - 1)}>
                                                <ArrowDownIconV2 />
                                              </SetpointButton>
                                            </div>
                                            <div style={{ width: '98px' }}>
                                              <div style={{ fontWeight: '700', color: colors.Blue700 }}>{t('temperatura')}</div>
                                              <div style={{ fontWeight: '400', fontSize: '18px' }}>{`${state.setpoint?.toString().replace('.', ',') || '-'} °C`}</div>
                                            </div>
                                          </ControlButton>
                                        </div> */}
                                      </div>
                                    ) : (
                                      <span style={{ color: colors.Grey300 }}>{t('funcoesNaoDisponiveisStatusDispositivo')}</span>
                                    )}
                                </div>
                              )}
                            </div>
                          </Wrapper>
                        </Box>
                      </BoxWrapper>
                    )}
                    { state.data.operation_mode === 5 && (
                      <>
                        { state.data.Temperature && (
                          <BoxWrapper>
                            <Box width={[1, 1, 1, 1, 1, 1]} justifyContent="center" alignItems="center" pr={[0, 0, 0, 0, 96, 96]}>
                              <Wrapper>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  flexWrap: 'wrap',
                                  justifyContent: 'center',
                                  padding: '15px 0',
                                  alignItems: 'center',
                                }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0' }}>
                                    <div
                                      style={{
                                        height: '270px',
                                        width: '270px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      <div
                                        style={{
                                          position: 'absolute',
                                          left: '0',
                                          top: '0',
                                        }}
                                      >
                                        <Dial temperature={state.setpoint} color={getDialColor({ temp: state.data.Temperature })} showIndicator={false} />
                                      </div>
                                      <div style={{ zIndex: 1 }}>
                                        {state.data.Temperature !== undefined && (
                                        <div style={{
                                          textAlign: 'center', fontSize: '110%', display: 'flex', justifyContent: 'center',
                                        }}
                                        >
                                          <div>
                                            {state.data.Temperature_1 ? (
                                              <div>
                                                <EvapReturnIcon />
                                                <span style={{ marginLeft: '5px' }}>{t('retorno')}</span>
                                              </div>
                                            ) : (
                                              <div>
                                                <TermometerIcon width="20px" style={{ marginLeft: '-10px' }} />
                                                {t('temperatura')}
                                              </div>
                                            )}
                                            <div>
                                              <span style={{ fontSize: '400%' }}>{formatNumberWithFractionDigits(state.data.Temperature)}</span>
                                              <span style={{
                                                color: colors.Grey200,
                                                marginBottom: '12px',
                                                alignSelf: 'flex-end',
                                                fontSize: '120%',
                                              }}
                                              >
                                                &nbsp;°C
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        )}
                                        {state.data.Temperature_1 && (
                                        <div style={{
                                          textAlign: 'center', fontSize: '90%', display: 'flex', justifyContent: 'center',
                                        }}
                                        >
                                          <div>
                                            <div>
                                              <EvapInsufIcon />
                                              <span style={{ marginLeft: '5px' }}>{t('insuflamento')}</span>
                                            </div>
                                            <div>
                                              <span style={{ fontSize: '110%' }}>{formatNumberWithFractionDigits(state.data.Temperature_1)}</span>
                                              <span style={{
                                                color: colors.Grey200,
                                                marginBottom: '12px',
                                                alignSelf: 'flex-end',
                                                fontSize: '120%',
                                              }}
                                              >
                                                &nbsp;°C
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                                    {state.devInfo.dut && state.data.Temperature && (
                                    <div style={{ margin: '0px 15px' }}>
                                      <div style={{ fontWeight: 'bold' }}>{t('limitesTemperatura')}</div>
                                      <span>
                                        {t('minMinimo')}
                                        <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dut.TUSEMIN ? formatNumberWithFractionDigits(state.devInfo.dut.TUSEMIN) : '-'}`}</b>
                                        <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                                        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        {t('maxMaximo')}
                                        <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dut.TUSEMAX ? formatNumberWithFractionDigits(state.devInfo.dut.TUSEMAX) : '-'}`}</b>
                                        <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                                      </span>
                                    </div>
                                    )}
                                  </div>

                                  {state.devInfo.status === 'ONLINE' && state.data.Temperature === null && (
                                  <span style={{ color: colors.Grey300 }}>{t('funcoesDispositivoNaoDisponiveis')}</span>
                                  )}
                                </div>
                              </Wrapper>
                            </Box>
                          </BoxWrapper>
                        ) }
                        {
                          state.data.Humidity && (
                            <BoxWrapper>
                              <Box width={[1, 1, 1, 1, 1, 1]} justifyContent="center" alignItems="center" pr={[0, 0, 0, 0, 96, 96]}>
                                <Wrapper>
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    padding: '15px 0',
                                    alignItems: 'center',
                                  }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0' }}>
                                      <div
                                        style={{
                                          height: '270px',
                                          width: '270px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          position: 'relative',
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: '0',
                                            top: '0',
                                          }}
                                        >
                                          <Dial temperature={state.setpoint} color={getDialColor({ hum: state.data.Humidity })} showIndicator={false} />
                                        </div>
                                        <div style={{ zIndex: 1 }}>
                                          {state.data.Humidity && (
                                          <div>
                                            <div style={{
                                              display: 'center',
                                              fontSize: '100%',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                            }}
                                            >
                                              <HumidityIcon width="20px" />
                                              {t('umidade')}
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                              <span style={{ fontSize: '500%' }}>{formatNumberWithFractionDigits(state.data.Humidity)}</span>
                                              <span style={{ color: colors.Grey200 }}>%</span>
                                            </div>
                                          </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                                      {state.devInfo.dut && state.data.Humidity && (
                                      <div style={{ margin: '0px 15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{t('limitesUmidade')}</div>
                                        <span>
                                          {t('minMinimo')}
                                          <b style={{ fontSize: '110%' }}>{` ${state.devInfo?.dut?.HUMIMIN ?? 30}`}</b>
                                          <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>%</span>
                                          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                          {t('maxMaximo')}
                                          <b style={{ fontSize: '110%' }}>{` ${state.devInfo?.dut?.HUMIMAX ?? 70}`}</b>
                                          <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>%</span>
                                        </span>
                                      </div>
                                      )}
                                    </div>

                                    {state.devInfo.status === 'ONLINE' && state.data.Temperature === null && (
                                    <span style={{ color: colors.Grey300 }}>{t('funcoesDispositivoNaoDisponiveis')}</span>
                                    )}
                                  </div>
                                </Wrapper>
                              </Box>
                            </BoxWrapper>
                          )
                        }
                        { state.data.eCO2 && (
                        <BoxWrapper>
                          <Box width={[1, 1, 1, 1, 1, 1]} justifyContent="center" alignItems="center" pr={[0, 0, 0, 0, 96, 96]}>
                            <Wrapper>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                padding: '15px 0',
                                alignItems: 'center',
                              }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0' }}>
                                  <div
                                    style={{
                                      height: '270px',
                                      width: '270px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      position: 'relative',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '0',
                                      }}
                                    >
                                      <Dial temperature={state.setpoint} color={getDialColor({ co2: state.data.eCO2 })} showIndicator={false} />
                                    </div>
                                    <div style={{ zIndex: 1 }}>

                                      {state.data.eCO2 && (
                                      <div style={{ textAlign: 'center', fontSize: '110%', display: 'flex' }}>
                                        <div>
                                          <div>
                                            <CO2IconV2 style={{ marginRight: '10px' }} />
                                            {t('nivelCo')}
                                            <span style={{ fontSize: '80%' }}>2</span>
                                          </div>
                                          <div>
                                            <span style={{ fontSize: '400%' }}>{formatNumberWithFractionDigits(state.data.eCO2)}</span>
                                            <span style={{
                                              color: colors.Grey200,
                                              marginBottom: '12px',
                                              alignSelf: 'flex-end',
                                              fontSize: '120%',
                                            }}
                                            >
                                                                    &nbsp;ppm
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                                  {state.devInfo.dut && state.data.eCO2 && (
                                  <div style={{ margin: '0px 15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                      {t('limitesDeCo')}
                                      <span>2</span>
                                    </div>
                                    <span>
                                      {t('maxMaximo')}
                                      <b style={{ fontSize: '110%' }}>{` ${state.devInfo.dut.CO2MAX ? formatNumberWithFractionDigits(state.devInfo.dut.CO2MAX) : '-'}`}</b>
                                      <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>ppm</span>
                                    </span>
                                  </div>
                                  )}

                                </div>
                              </div>
                            </Wrapper>
                          </Box>
                        </BoxWrapper>
                        ) }
                      </>
                    ) }
                    {/* @ts-ignore */}
                    {/* {(!state.data.eCO2 || (state.data.eCO2 && state.data.Temperature)) */}
                    {false
                      && (
                        <BoxWrapper>
                          <Box width={[1, 1, 1, 1, 1, 1]} justifyContent="center" alignItems="center" pr={[0, 0, 0, 0, 96, 96]}>
                            {/* <Wrapper>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                padding: '15px 0',
                                alignItems: 'center',
                              }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0' }}>
                                  <div
                                    style={{
                                      height: '230px',
                                      width: '230px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      position: 'relative',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '0',
                                      }}
                                    >
                                      <Dial temperature={state.setpoint} status={state.devInfo.status} />
                                    </div>
                                    <div style={{ zIndex: 1 }}>
                                      <div style={{ textAlign: 'center' }}>Setpoint</div>
                                      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'baseline' }}>
                                        <div style={{ alignSelf: 'flex-end', marginRight: '5px' }}>
                                          <div
                                            style={{
                                              border: '8px solid transparent',
                                              borderBottomColor: 'black',
                                              cursor: 'pointer',
                                              marginBottom: '10px',
                                            }}
                                            onClick={() => state.setpoint && state.devInfo.status === 'ONLINE' && changeSetpoint(state.setpoint + 1)}
                                          />
                                          <div
                                            style={{
                                              border: '8px solid transparent',
                                              borderTopColor: 'black',
                                              cursor: 'pointer',
                                              marginBottom: '4px',
                                            }}
                                            onClick={() => state.setpoint && state.devInfo.status === 'ONLINE' && changeSetpoint(state.setpoint - 1)}
                                          />
                                        </div>
                                        <span style={{ fontSize: '240%' }}>{state.setpoint}</span>
                                        <span style={{ color: colors.Grey200 }}>&nbsp;°C</span>
                                      </div>
                                      <div style={{ textAlign: 'center' }}>Agora</div>
                                      <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '130%' }}>{(state.data.Temperature == null) ? '-' : state.data.Temperature.toString().replace('.', ',')}</span>
                                        <span style={{ color: colors.Grey200 }}> °C</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {state.devInfo.status === 'ONLINE'
                                  ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'center', margin: '0px 15px' }}>
                                        <div style={{ display: 'flex' }}>
                                          <ControlButton onClick={onClickMode}>
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
                                        </div>
                                      </div>

                                      <div style={{ margin: '0px 15px' }}>
                                        <ControlButton
                                          style={{ alignSelf: 'end', backgroundColor: onOffBackgroundColor(state.activeOperationStatus) }}
                                          onClick={() => state.devInfo.status === 'ONLINE' && setOperationStatus((state.activeOperationStatus === 1) ? 0 : 1)}
                                        >
                                          <img alt="on_off" src={getOperationStatusIcon(state.activeOperationStatus)} />
                                        </ControlButton>
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={{ color: colors.Grey300 }}>Funções não disponíveis devido ao status atual do dispositivo</span>
                                  )}
                              </div>
                            </Wrapper> */}
                          </Box>
                        </BoxWrapper>
                      )}
                  </>
                )}
            </Flex>
          </Card>
        </Box>
      </Flex>
    </>
  );
}

function Dial(props: { temperature: number | null, color: string | null, showIndicator: boolean }) {
  const min = 16;
  const max = 32;
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
    console.log('DBG013', rect, event);
  }

  return (
    <svg
      width="270"
      height="270"
      viewBox="0 0 43.93095 43.93095"
      onClick={onSvgClick}
    >
      <g transform="translate(-9.1068883,-56.072787)">
        {props.showIndicator && (
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
        {(!Number.isNaN(percentage)) && props.showIndicator && (
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
            stroke: props.color || colors.LightLightGrey_v3,
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
        {props.showIndicator && (
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

const BoxWrapper = styled.div`
  display: flex;
`;

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
`;

const Card = styled.div`
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
