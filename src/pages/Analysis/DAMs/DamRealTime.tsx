import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex } from 'reflexbox';
import styled from 'styled-components';

import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import EcoModeIcon from '~/assets/img/icons/eco.svg';
import {
  Loader, StatusBox, DamEcoCard, OptionsWithIcon,
} from '~/components';
import { DamControl } from '~/components/DamControl';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { useWebSocketLazy } from '~/helpers/wsConnection';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';
import {
  TermometerIcon,
  RemoteAutoIcon,
  RemoteManualIcon,
  LocalOperationIcon,
  CoolIcon,
  FanIcon,
  BlockIcon,
  ArrowUpIconV2,
  ArrowDownIconV2,
  ThermostatIcon,
  EvapInsufIcon,
} from '~/icons';

import {
  ControlButton,
  SetpointButton,
  IconWrapper,
  DesktopWrapper,
  MobileWrapper,
  SetpointButtonMobile,
} from './styles';
import { t } from 'i18next';
import { formatNumberWithFractionDigits } from '../../../helpers/thousandFormatNumber';

export const DamRealTime = (): JSX.Element => {
  const routeParams = useParams<{ devId }>();
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaDetalhesDam')}</title>
      </Helmet>
      <DevLayout devInfo={devInfo} />
      {/* @ts-ignore */ }
      <DamRealTimeContents onDevInfoUpdate={render} />
    </>
  );
};

export function DamRealTimeContents({ onDevInfoUpdate = undefined }) {
  const routeParams = useParams<{ devId }>();
  // @ts-ignore
  const [state, render, setState] = useStateVar({
    isLoading: false,
    devInfo: getCachedDevInfoSync(routeParams.devId),
    temperature: 23 as number|null,
    ecoModeCfg: null,
    telemetry: {
      DAM_ID: routeParams.devId,
      State: null,
      Mode: null,
      ecoModeActing: null,
      status: 'OFFLINE',
      loading: false,
      safeWaitMode: false,
      safeWaitRelay: false,
      Temperature: null,
      Temperature_1: null,
      lastTelemetry: null,
      timestamp: null,
      RSSI: null,
    } as {
      DAM_ID: string|null,
      State: string|null,
      Mode: string|null,
      ecoModeActing: string|null,
      status: string|null,
      loading: boolean,
      safeWaitMode: boolean,
      safeWaitRelay: boolean,
      Temperature: string|null,
      Temperature_1: string|null,
      lastTelemetry: string|null,
      timestamp: string|null,
      RSSI: string|null,
    },
    // @ts-ignore
    relDutInfo: null as {
      REL_DUT_ID: string,
      ROOM_DESC?: string,
      TUSEMIN?: number,
      TUSEMAX?: number,
      Temperature?: number,
      status?: string,
    },
    optionsControlMode: [
      {
        icon: <RemoteAutoIcon />,
        iconSelected: <RemoteAutoIcon color="white" />,
        label: t('remotoAutomatico'),
        selected: true,
        tag: 'Auto',
        mode: 'auto',
      },
      {
        icon: <RemoteManualIcon />,
        iconSelected: <RemoteManualIcon color="white" />,
        label: t('remotoManual'),
        selected: false,
        tag: 'Manual',
        mode: 'manual',
      },
    ],
    optionsOperationMode: [
      {
        icon: <CoolIcon />,
        iconSelected: <CoolIcon color="white" colorSecundary="#363BC4" />,
        label: t('refrigerar'),
        selected: true,
        tag: ['allow', 'enabling', 'eco'],
        mode: 'allow',
      },
      {
        icon: <FanIcon variant="primary" color="#363BC4" />,
        iconSelected: <FanIcon variant="primary" color="white" />,
        label: t('ventilar'),
        selected: false,
        tag: ['onlyfan'],
        mode: 'onlyfan',
      },
      {
        icon: <BlockIcon />,
        iconSelected: <BlockIcon color="white" />,
        label: t('bloqueadoMin'),
        selected: false,
        tag: ['forbid', 'disabling'],
        mode: 'forbid',
      },
    ],
    disableOperationMode: true as boolean,
    disableSetpoint: true as boolean,
    dutIrCommands: null as null | { IR_ID: string, cmdName: string, CMD_TYPE: string}[],
  });

  const ecoModeCfgs = {
    'eco-D': t('desligar').toLocaleLowerCase(),
    'eco-V': t('ventilar').toLocaleLowerCase(),
    'eco-C1-V': t('desligarCondensadora2DepoisVentilar'),
    'eco-C2-V': t('desligarCondensadora1DepoisVentilar'),
  };
  const lws = useWebSocketLazy();

  useEffect(() => {
    (async function () {
      try {
        state.isLoading = true; render();
        state.devInfo = await getCachedDevInfo(routeParams.devId, {});
        state.temperature = state.devInfo.dam?.SETPOINT_ECO_REAL_TIME != null ? state.devInfo.dam?.SETPOINT_ECO_REAL_TIME : (state.devInfo.dam?.SETPOINT || 23);
        // @ts-ignore
        if (onDevInfoUpdate) onDevInfoUpdate();
        // @ts-ignore
        state.ecoModeCfg = (state.devInfo.dam.ENABLE_ECO && state.devInfo.dam.ECO_CFG) || null;
        if (state.devInfo?.DEV_ID?.startsWith('DAM3') && state.devInfo?.dam?.supportsExtTherm) {
          if (!state.optionsOperationMode.find((x) => x.mode === 'thermostat')) {
            state.optionsOperationMode.push({
              icon: <ThermostatIcon />,
              iconSelected: <ThermostatIcon color="white" />,
              label: t('termostatoExterno'),
              selected: false,
              tag: ['THERMOSTAT', 'thermostat', 'STARTING_THERMOSTAT'],
              mode: 'thermostat',
            });
          }
        }
        // @ts-ignore
        if (state.devInfo.dam.REL_DUT_ID) {
          state.relDutInfo = {
            // @ts-ignore
            REL_DUT_ID: state.devInfo.dam.REL_DUT_ID,
          };
          const dutInfo = await apiCall('/dut/get-dut-info', { DEV_ID: state.relDutInfo.REL_DUT_ID });
          state.relDutInfo.TUSEMIN = dutInfo.info.TUSEMIN;
          state.relDutInfo.TUSEMAX = dutInfo.info.TUSEMAX;
          state.relDutInfo.ROOM_DESC = dutInfo.info.ROOM_NAME ? `${dutInfo.info.ROOM_NAME} (${dutInfo.info.DEV_ID})` : dutInfo.info.DEV_ID;
        }
        lws.start(onWsOpen, onWsMessage, beforeWsClose);
      } catch (err) { console.log(err); toast.error(t('erro')); }
      state.isLoading = false; render();
    }());
  }, []);

  // useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    wsConn.send({ type: 'subscribeStatus', data: { dam_id: routeParams.devId } });
    if (state.relDutInfo && !state.devInfo.dam.SELF_REFERENCE) {
      wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: state.relDutInfo.REL_DUT_ID } });
    }
  }
  function onWsMessage(message) {
    if (message && message.type === 'damStatus' && message.data.status && message.data.dev_id === state.telemetry.DAM_ID) {
      state.telemetry.status = message.data.status;
      state.telemetry.Mode = message.data.Mode;
      state.telemetry.State = message.data.State;
      state.telemetry.ecoModeActing = message.data.ecoModeActing;
      state.telemetry.Temperature = message.data.Temperature || null;
      state.telemetry.Temperature_1 = message.data.Temperature_1 || null;
      if (message.data.timestamp) state.telemetry.lastTelemetry = message.data.timestamp;
      if (message.data.deviceTimestamp) state.telemetry.timestamp = message.data.deviceTimestamp;
      if (message.data.RSSI != null) state.telemetry.RSSI = rssiDesc(message.data.RSSI, message.data.status);
      defineSelectedOptions();
      render();
    }
    if (message && message.type === 'dutTelemetry' && state.relDutInfo && message.data.dev_id === state.relDutInfo.REL_DUT_ID) {
      state.relDutInfo.Temperature = message.data?.Temperature;
      state.relDutInfo.status = message.data?.status;
      render();
    }
    if (message && message.type === 'devOnlineStatus' && state.relDutInfo && message.data.dev_id === state.relDutInfo.REL_DUT_ID) {
      state.relDutInfo.status = message.data?.status;
      render();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'unsubscribeStatus' });
    wsConn.send({ type: 'dutUnsubscribeRealTime' });
  }

  function rssiDesc(RSSI: number, status: string) {
    if (RSSI < 0 && status === 'ONLINE') {
      if (RSSI > -50) return 'Excelente';
      if (RSSI > -60) return 'Bom';
      if (RSSI > -70) return 'Regular';
      return 'Ruim';
    }
    return '-';
  }

  function defineSelectedOptions() {
    const controlModeCurrent = state.optionsControlMode.find((item) => item.selected);
    if (controlModeCurrent && controlModeCurrent.tag !== state.telemetry.Mode) {
      controlModeCurrent.selected = false;

      if (state.telemetry.Mode === 'Local') {
        state.optionsControlMode.push(
          {
            icon: <LocalOperationIcon />,
            iconSelected: <LocalOperationIcon color="white" />,
            label: t('emOperacaoLocal'),
            selected: true,
            tag: 'Local',
            mode: 'local',
          },
        );
      }
      else {
        const controlModeNew = state.optionsControlMode.find((item) => item.tag === state.telemetry.Mode);
        if (controlModeNew) {
          controlModeNew.selected = true;
        }
        else {
          state.optionsControlMode[0].selected = true;
        }

        if (state.optionsControlMode[state.optionsControlMode.length - 1].tag === 'Local') {
          state.optionsControlMode.splice(state.optionsControlMode.length - 1, 1);
        }
      }
    }

    const operationModeCurrent = state.optionsOperationMode.find((item) => item.selected);
    if (operationModeCurrent && state.telemetry.State && !operationModeCurrent.tag.includes(state.telemetry.State)) {
      operationModeCurrent.selected = false;
      const controlModeNew = state.optionsOperationMode.find((item) => item.tag.includes(state.telemetry.State!));
      if (controlModeNew) {
        controlModeNew.selected = true;
      }
      else {
        state.optionsOperationMode[0].selected = true;
      }
    }

    const optionControlModeSelected = state.optionsControlMode.find((item) => item.selected);
    state.disableOperationMode = !optionControlModeSelected || optionControlModeSelected.label !== 'Remoto Manual';

    const optionOperationModeSelected = state.optionsOperationMode.find((item) => item.selected);
  }
  function getDialColor({ temp }) {
    if ((state.relDutInfo && state.relDutInfo.status !== 'ONLINE') || (state.devInfo.status !== 'ONLINE')) return colors.LightGrey_v3;
    if (temp != null && Number.isFinite(Number(temp))) {
      return (
        (state.relDutInfo && ((state.relDutInfo.TUSEMAX != null && temp > state.relDutInfo.TUSEMAX && colors.Red)
        || (state.relDutInfo.TUSEMIN != null && temp < state.relDutInfo.TUSEMIN && colors.BlueSecondary_v3)))
        || state.devInfo.dam.MAXIMUM_TEMPERATURE != null && temp > state.devInfo.dam.MAXIMUM_TEMPERATURE && colors.Red
        || state.devInfo.dam.MINIMUM_TEMPERATURE != null && temp < state.devInfo.dam.MINIMUM_TEMPERATURE && colors.BlueSecondary_v3
        || colors.GreenLight
      );
    }
    return colors.GreenLight;
  }

  async function changeSetpoint(newSetpoint: number) {
    try {
      render();
      const telemetry = await apiCall('/dam/set-local-setpoint', {
        DAM_ID: state.telemetry.DAM_ID!,
        SETPOINT: newSetpoint,
      });

      state.temperature = newSetpoint;
    }
    catch (err) {
      toast.error(t('erroEnviarSetpoint'));
    }

    render();
  }

  function updateDamStatus(message) {
    state.telemetry.status = message.status;
    state.telemetry.Mode = message.Mode;
    state.telemetry.State = message.State;
  }

  async function selectControleMode(options: {
    icon: JSX.Element,
    iconSelected: JSX.Element,
    label: string,
    selected: boolean,
    tag: string,
    mode: string,
  }[]) {
    state.optionsControlMode = options;

    const optionControlModeSelected = state.optionsControlMode.find((item) => item.selected);
    state.disableOperationMode = !optionControlModeSelected || optionControlModeSelected.label !== 'Remoto Manual';

    await sendDamMode(optionControlModeSelected!.mode);
    render();
  }

  async function sendDamMode(newMode) {
    if (state.telemetry.safeWaitMode) return;
    state.telemetry.safeWaitMode = true;
    setTimeout(() => {
      state.telemetry.safeWaitMode = false;
    }, 2500);
    try {
      state.telemetry.loading = true;
      render();
      const telemetry = await apiCall('/dam/set-dam-operation', {
        dev_id: state.telemetry.DAM_ID!,
        mode: newMode, // 'manual', 'auto'
      });
      if (telemetry) {
        updateDamStatus(telemetry);
      }
      toast.success(`Enviado!${newMode === 'manual' ? t('sucessoOperacaoManualPermaneceraFuncionamento') : ''}`);
    } catch (err) { console.log(err); toast.error(t('erro')); defineSelectedOptions(); }
    state.telemetry.loading = false;
  }

  async function selectOperationMode(options: {
    icon: JSX.Element,
    iconSelected: JSX.Element,
    label: string,
    selected: boolean,
    tag: string[],
    mode: string,
  }[]) {
    state.optionsOperationMode = options;

    const optionOperationModeSelected = state.optionsOperationMode.find((item) => item.selected);

    await sendDamRelay(optionOperationModeSelected?.mode);
    render();
  }

  async function sendDamRelay(newMode) {
    if (state.telemetry.safeWaitRelay) return;
    state.telemetry.safeWaitRelay = true;
    setTimeout(() => {
      state.telemetry.safeWaitRelay = false;
    }, 2500);
    try {
      state.telemetry.loading = true;
      render();
      const telemetry = await apiCall('/dam/set-dam-operation', {
        dev_id: state.telemetry.DAM_ID!,
        relay: newMode, // 'allow', 'forbid', 'onlyfan', 'thermostat'
      });
      updateDamStatus(telemetry);
    } catch (err) { console.log(err); toast.error(t('erro')); defineSelectedOptions(); }
    state.telemetry.loading = false;
  }

  function getDutTemperature() {
    return state.relDutInfo.status !== 'ONLINE' ? null : state.relDutInfo.Temperature || null;
  }

  function getTemperature() {
    return state.relDutInfo ? getDutTemperature() : Number(getReturnTemperature()) || null;
  }

  const getReturnTemperature = () => {
    if (state.devInfo.dam.PLACEMENT !== 'DUO') return state.telemetry.Temperature;

    if (state.devInfo.dam.T0_POSITION === 'RETURN' || (!state.devInfo.dam.T0_POSITION && state.devInfo.dam.T1_POSITION !== 'RETURN')) {
      return state.telemetry.Temperature;
    }
    return state.telemetry.Temperature_1;
  };

  const getInsufflationTemperature = () => {
    if (state.devInfo.dam.PLACEMENT !== 'DUO') return null;

    if (state.devInfo.dam.T1_POSITION === 'INSUFFLATION' || (!state.devInfo.dam.T1_POSITION && state.devInfo.dam.T0_POSITION !== 'INSUFFLATION')) {
      return state.telemetry.Temperature_1;
    }
    return state.telemetry.Temperature;
  };

  const showInsufTemp = () => (
    getInsufflationTemperature() && (
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
            <span style={{ fontSize: '110%' }}>{formatNumberWithFractionDigits(getInsufflationTemperature() ?? '-')}</span>
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
    )
  );

  return (
    <>
      <Flex pt="10px" flexDirection="column">
        <Card>
          {state.isLoading ? (
            <Loader />
          ) : (
            (!state.devInfo.DEV_ID.startsWith('DAM3') || !state.devInfo.dam?.CAN_SELF_REFERENCE) && (
              <>
                <StatusBox status={state.telemetry.status} style={{ marginBottom: '30px' }}>{state.telemetry.status}</StatusBox>
                <div style={{ position: 'relative' }}>
                  <DamControl dam={state.telemetry} onStateChanged={() => render()} />
                  {state.telemetry.loading && (
                  <div style={{
                    position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 1)', left: '0', top: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  >
                    <Loader />
                  </div>
                  )}
                </div>
                <div style={{ paddingTop: '5px', display: 'flex', alignItems: 'center' }}>
                  <Text>
                    <b>
                      {t('modoEco')}
                      : &nbsp;
                    </b>
                    {/* @ts-ignore */}
                    {state.ecoModeCfg ? (ecoModeCfgs[state.ecoModeCfg] || state.ecoModeCfg || `(${t('nenhuma')})`) : t('desabilitado')}
                  </Text>
                  {(state.telemetry && state.telemetry.ecoModeActing)
                  && (
                  <img
                    style={{
                      width: '24px', marginBottom: '8px', objectFit: 'contain', marginLeft: '8px',
                    }}
                    src={EcoModeIcon}
                    alt="active"
                  />
                  )}
                </div>
              </>
            ) || (state.devInfo.DEV_ID.startsWith('DAM3') && state.devInfo.dam?.CAN_SELF_REFERENCE && (
              <>
                <DesktopWrapper>
                  <Flex
                    flexWrap="nowrap"
                    flexDirection="column"
                  >
                    <Flex
                      flexWrap="nowrap"
                      flexDirection="row"
                    >
                      <DamEcoCard
                        damInfo={{ DAM_ID: state.devInfo.DEV_ID, damEco: state.ecoModeCfg ? (ecoModeCfgs[state.ecoModeCfg] || state.ecoModeCfg || `(${t('nenhuma')})`) : t('desabilitado') }}
                        dutInfo={state.relDutInfo && { DUT_ID: state.relDutInfo.REL_DUT_ID || '', ROOM_DESC: state.relDutInfo.ROOM_DESC || '' }}
                        DAM_ID={state.devInfo.DEV_ID}
                        telemetry={state.telemetry}
                      />
                      <Flex
                        flexWrap="nowrap"
                        flexDirection="column"
                        style={{ marginLeft: '25%' }}
                      >
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          padding: '15px 0',
                        }}
                        >
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
                              <Dial temperature={getTemperature()} color={getDialColor({ temp: getTemperature() })} showIndicator={false} />
                            </div>
                            <div style={{ zIndex: 1 }}>
                              {state !== undefined && (
                                <div style={{ textAlign: 'center', fontSize: '110%', display: 'flex' }}>
                                  <div>
                                    <div>
                                      <TermometerIcon variant="primary" width="20px" style={{ marginLeft: '-10px' }} />
                                      {t('agora')}
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '320%' }}>{(state == null) ? '-' : formatNumberWithFractionDigits(getTemperature() ?? '-')}</span>
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
                              {showInsufTemp()}
                            </div>
                          </div>
                          <div style={{ margin: '26px 70px' }}>
                            <div style={{ fontWeight: 'bold' }}>{t('limitesTemperatura')}</div>
                            <span>
                              mín.
                              <b style={{ fontSize: '110%' }}>{` ${state.relDutInfo ? (state.relDutInfo.TUSEMIN != null ? formatNumberWithFractionDigits(state.relDutInfo.TUSEMIN) : '-') : (formatNumberWithFractionDigits(state.devInfo.dam.MINIMUM_TEMPERATURE ?? '-'))}`}</b>
                              <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                              máx.
                              <b style={{ fontSize: '110%' }}>{` ${state.relDutInfo ? (state.relDutInfo.TUSEMAX != null ? formatNumberWithFractionDigits(state.relDutInfo.TUSEMAX) : '-') : (formatNumberWithFractionDigits(state.devInfo.dam.MAXIMUM_TEMPERATURE ?? '-'))}`}</b>
                              <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                            </span>
                          </div>
                        </div>
                      </Flex>
                    </Flex>
                    <Flex
                      flexWrap="nowrap"
                      flexDirection="row"
                      style={{ marginLeft: '25%' }}
                    >
                      <Flex
                        flexWrap="nowrap"
                        flexDirection="column"
                      >
                        <div style={{ fontWeight: 'bold', margin: '0px 70px' }}>
                          {t('modoControle')}
                        </div>
                        <div style={{ fontWeight: 'bold', margin: '11px 63px' }}>
                          <OptionsWithIcon handleSelect={selectControleMode} disabled={state.telemetry.loading} options={state.optionsControlMode} />
                        </div>
                      </Flex>
                      <Flex
                        flexWrap="nowrap"
                        flexDirection="column"
                      >
                        <div style={{ fontWeight: 'bold', margin: '0px 45px' }}>
                          {t('modoOperacao')}
                        </div>
                        <div style={{ fontWeight: 'bold', margin: '11px 38px' }}>
                          <OptionsWithIcon handleSelect={selectOperationMode} disabled={state.disableOperationMode || state.telemetry.loading} options={state.optionsOperationMode} onClickOutside={() => render()} />
                        </div>
                      </Flex>
                      <Flex
                        flexWrap="nowrap"
                        flexDirection="column"
                      >
                        <div style={{ fontWeight: 'bold', margin: '0px 60px' }}>
                          Setpoint
                        </div>
                        <div style={{ margin: '11px 55px' }}>
                          <ControlButton
                            style={{ width: '99px', height: '48px', justifyContent: 'flex-start' }}
                          >
                            <div style={{
                              width: '57px',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              opacity: state.disableSetpoint || state.telemetry.loading ? '0.5' : '1',
                            }}
                            >
                              <SetpointButton disabled={state.disableSetpoint || state.telemetry.loading} up onClick={() => !state.disableSetpoint && !state.telemetry.loading && state.temperature != null && state.devInfo.status === 'ONLINE' && changeSetpoint(state.temperature + 1)}>
                                <IconWrapper>
                                  <ArrowUpIconV2 />
                                </IconWrapper>
                              </SetpointButton>
                              <SetpointButton disabled={state.disableSetpoint || state.telemetry.loading} down onClick={() => !state.disableSetpoint && !state.telemetry.loading && state.temperature != null && state.devInfo.status === 'ONLINE' && changeSetpoint(state.temperature - 1)}>
                                <IconWrapper>
                                  <ArrowDownIconV2 />
                                </IconWrapper>
                              </SetpointButton>
                            </div>
                            <div style={{ width: '98px', opacity: state.disableSetpoint || state.telemetry.loading ? '0.5' : '1' }}>
                              <div style={{ fontWeight: '400', marginLeft: '10px', fontSize: '16px' }}>{`${state.temperature ? formatNumberWithFractionDigits(state.temperature) : '-'} °C`}</div>
                            </div>
                          </ControlButton>
                        </div>
                      </Flex>
                    </Flex>
                  </Flex>
                </DesktopWrapper>
                <MobileWrapper>
                  <Flex
                    flexWrap="nowrap"
                    flexDirection="column"
                  >
                    <div style={{ marginLeft: '-10px' }}>
                      <DamEcoCard
                        damInfo={{ DAM_ID: state.devInfo.DEV_ID, damEco: state.ecoModeCfg ? (ecoModeCfgs[state.ecoModeCfg] || state.ecoModeCfg || `(${t('nenhuma')})`) : t('desabilitado') }}
                        dutInfo={state.relDutInfo && { DUT_ID: state.relDutInfo.REL_DUT_ID || '', ROOM_DESC: state.relDutInfo.ROOM_DESC || '' }}
                        DAM_ID={state.devInfo.DEV_ID}
                        telemetry={state.telemetry}
                      />
                    </div>
                    <Flex
                      flexWrap="nowrap"
                      flexDirection="column"
                      ml={20}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '15px 0',
                      }}
                      >
                        <div
                          style={{
                            height: '225px',
                            width: '225px',
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
                            <Dial temperature={getTemperature()} color={getDialColor({ temp: getTemperature() })} showIndicator={false} mobile />
                          </div>
                          <div style={{ zIndex: 1 }}>
                            {state !== undefined && (
                              <div style={{ textAlign: 'center', fontSize: '110%', display: 'flex' }}>
                                <div>
                                  <div>
                                    <TermometerIcon variant="primary" width="20px" style={{ marginLeft: '-10px' }} />
                                    {t('agora')}
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '320%' }}>{(state == null) ? '-' : formatNumberWithFractionDigits(getTemperature() ?? '-')}</span>
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
                            {showInsufTemp()}
                          </div>
                        </div>
                        <div style={{ margin: '16px 40px' }}>
                          <div style={{ fontWeight: 'bold', width: '150px' }}>{t('limitesTemperatura')}</div>
                          <span>
                            mín.
                            <b style={{ fontSize: '110%' }}>{` ${state.relDutInfo ? (state.relDutInfo.TUSEMIN || '-') : (state.devInfo.dam.MINIMUM_TEMPERATURE || '-')}`}</b>
                            <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            máx.
                            <b style={{ fontSize: '110%' }}>{` ${state.relDutInfo ? state.relDutInfo.TUSEMAX || '-' : (state.devInfo.dam.MAXIMUM_TEMPERATURE || '-')}`}</b>
                            <span style={{ color: colors.Grey200, fontSize: '80%', fontWeight: 'bold' }}>°C</span>
                          </span>
                        </div>
                      </div>
                    </Flex>
                    <Flex
                      flexWrap="nowrap"
                      flexDirection="row"
                      justifyContent="space-between"
                    >
                      <Flex
                        flexWrap="nowrap"
                        flexDirection="column"
                      >
                        <div style={{ fontWeight: 'bold', margin: '0px -10px', width: '80px' }}>
                          {t('modoControle')}
                        </div>
                        <div style={{ fontWeight: 'bold', marginTop: '11px', marginLeft: '-15px' }}>
                          <OptionsWithIcon handleSelect={selectControleMode} disabled={state.telemetry.loading} options={state.optionsControlMode} />
                        </div>
                      </Flex>
                      <Flex
                        flexWrap="nowrap"
                        flexDirection="column"
                      >
                        <div style={{ fontWeight: 'bold', margin: '0px 45px', width: '80px' }}>
                          {t('modoOperacao')}
                        </div>
                        <div style={{ fontWeight: 'bold', marginTop: '11px', marginLeft: '40px' }}>
                          <OptionsWithIcon handleSelect={selectOperationMode} disabled={state.disableOperationMode || state.telemetry.loading} options={state.optionsOperationMode} onClickOutside={() => render()} />
                        </div>
                      </Flex>
                    </Flex>
                    <Flex
                      flexWrap="nowrap"
                      flexDirection="column"
                    >
                      <div style={{ fontWeight: 'bold', marginTop: '11px', marginLeft: '105px' }}>
                        Setpoint
                      </div>
                      <div style={{ margin: '11px 50px' }}>
                        <ControlButton
                          style={{ width: '166px', height: '114px', justifyContent: 'flex-start' }}
                        >
                          <div style={{
                            width: '57px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            height: '100%',
                            opacity: state.disableSetpoint || state.telemetry.loading ? '0.5' : '1',
                          }}
                          >
                            <SetpointButtonMobile disabled={state.disableSetpoint || state.telemetry.loading} up onClick={() => !state.disableSetpoint && !state.telemetry.loading && state.temperature != null && state.devInfo.status === 'ONLINE' && changeSetpoint(state.temperature + 1)}>
                              <IconWrapper>
                                <ArrowUpIconV2 />
                              </IconWrapper>
                            </SetpointButtonMobile>
                            <SetpointButtonMobile disabled={state.disableSetpoint || state.telemetry.loading} down onClick={() => !state.disableSetpoint && !state.telemetry.loading && state.temperature != null && state.devInfo.status === 'ONLINE' && changeSetpoint(state.temperature - 1)}>
                              <IconWrapper>
                                <ArrowDownIconV2 />
                              </IconWrapper>
                            </SetpointButtonMobile>
                          </div>
                          <div style={{ width: '98px', opacity: state.disableSetpoint || state.telemetry.loading ? '0.5' : '1' }}>
                            <div style={{ fontWeight: '400', marginLeft: '34px', fontSize: '16px' }}>{`${state.temperature ? formatNumberWithFractionDigits(state.temperature) : '-'} °C`}</div>
                          </div>
                        </ControlButton>
                      </div>
                    </Flex>
                  </Flex>
                </MobileWrapper>
              </>
            ))
          )}
        </Card>
      </Flex>
      {(state.relDutInfo && (!state.devInfo.DEV_ID.startsWith('DAM3') || !state.devInfo.dam?.CAN_SELF_REFERENCE))
        && (
        <Flex pt="10px" flexDirection="column">
          <Card>
            {state.isLoading ? (
              <Loader />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <StatusBox status={state.relDutInfo.status || 'OFFLINE'}>{state.relDutInfo.status || 'OFFLINE'}</StatusBox>
                  <Text style={{ marginTop: '30px' }}>
                    <b>{t('ambienteRefrigerado')}</b>
                    {' '}
                    {state.relDutInfo.ROOM_DESC || state.relDutInfo.REL_DUT_ID}
                  </Text>
                  <div>
                    <Text>
                      <b>{t('limiteTemperatura')}</b>
                      {' '}
                      {(state.relDutInfo.TUSEMIN != null) ? `${formatNumberWithFractionDigits(state.relDutInfo.TUSEMIN)} °C` : t('semInformacaoTemperatura')}
                    </Text>
                  </div>
                </div>
                <Wrapper>
                  <StyledText>
                    <TermometerIcon />
                    {' '}
                    {t('temperaturaAmbiente')}
                  </StyledText>
                  <div>
                    <StyledText fontSize="96px">{(state.relDutInfo.Temperature != null) ? `${formatNumberWithFractionDigits(state.relDutInfo.Temperature)}°C` : '-'}</StyledText>
                  </div>
                </Wrapper>
                <div>&nbsp;</div>
              </div>
            )}
          </Card>
        </Flex>
        )}
    </>
  );
}

function Dial(props: { temperature: number | null, color: string | null, showIndicator: boolean, mobile?: boolean }) {
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

  const max = 32;
  const min = 16;

  let percentage = (props.temperature == null) ? NaN : ((props.temperature - min) / (max - min));

  if (percentage > 1) percentage = 1;
  if (percentage < 0) percentage = 0;

  if (!Number.isFinite(percentage)) percentage = NaN;

  return (
    <svg
      height={!props.mobile ? '270' : '225'}
      width={!props.mobile ? '270' : '225'}
      onClick={onSvgClick}
      viewBox="0 0 43.93095 43.93095"
    >
      <g transform="translate(-9.1068883,-56.072787)">
        {props.showIndicator && (
          <path
            style={{
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
              strokeOpacity: 1,
              fill: 'none',
              stroke: '#d9d9d9',
              strokeWidth: 1.05833,
            }}
            transform="scale(-1)"
            d="m -26.111271,-92.230659 a 15.034513,15.034513 0 0 1 9.857829,16.729361 15.034513,15.034513 0 0 1 -14.861396,12.49749 15.034513,15.034513 0 0 1 -14.790544,-12.581262 15.034513,15.034513 0 0 1 9.952198,-16.673395"
          />
        )}
        {(!Number.isNaN(percentage)) && props.showIndicator && (
          <g transform={`rotate(${percentage * 317 - 20.4},31.072363,78.038261)`}>
            <circle
              style={{
                strokeDasharray: 'none',
                strokeOpacity: 0.00765806,
                fill: 'none',
                stroke: '#bbbbbb',
                strokeWidth: 0.785182,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
              }}
              transform="scale(-1)"
              r="15.034513"
              cx="-31.072363"
              cy="-78.038261"
            />
            <circle
              style={{
                strokeWidth: 2.96762,
                strokeLinecap: 'round',
                strokeDasharray: 'none',
                fill: '#363bc4',
                strokeOpacity: 1,
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                fillOpacity: 1,
                stroke: 'none',
              }}
              cx="20.919857"
              r="1.2549769"
              cy="89.219666"
            />
          </g>
        )}
        <circle
          style={{
            fill: 'none',
            strokeLinecap: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
            strokeOpacity: 1,
            strokeWidth: 3.92591,
            strokeLinejoin: 'round',
            fillOpacity: 1,
            stroke: props.color || colors.LightLightGrey_v3,
          }}
          cx="31.072363"
          cy="78.038261"
          r="20.00252"
        />
        {props.showIndicator && (
          <>
            <rect
              style={{
                strokeWidth: 0.252035,
                strokeLinecap: 'round',
                fill: '#2d81ff',
                fillOpacity: 1,
                stroke: 'none',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
              }}
              x="27.262398"
              y="91.697784"
              width="1.7076257"
              height="1.7076257"
              ry="0.54493499"
            />
            <rect
              style={{
                fill: '#e00030',
                strokeWidth: 0.252035,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                fillOpacity: 1,
                stroke: 'none',
              }}
              x="33.055614"
              y="91.697784"
              width="1.7076257"
              height="1.7076257"
              ry="0.54493499"
            />
          </>
        )}
      </g>
    </svg>
  );
}

const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

const StyledText = styled.span<{ fontSize? }>(
  ({ fontSize = '16px' }) => `
  font-size: ${fontSize};
  font-weight: bold;
  color: ${colors.Grey400};
  white-space: nowrap;
  text-align: center;
`,
);

const Wrapper = styled.div`
  text-align: center;
`;

const Text = styled.p<{ isBold? }>(
  ({ isBold }) => `
    margin-bottom: ${isBold ? 0 : '1em'};
    margin-top: ${isBold ? '1em' : 0};
    color: ${isBold ? colors.Grey300 : colors.Grey400};
    font-weight: ${isBold ? 'bold' : 'normal'};
  `,
);
