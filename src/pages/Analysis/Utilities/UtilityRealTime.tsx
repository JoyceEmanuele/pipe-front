import { useEffect, useState } from 'react';
import { Flex } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useRouteMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStateVar } from '~/helpers/useStateVar';
import { getUserProfile } from 'helpers/userProfile';
import {
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
  LightOnIcon,
  LightOffIcon,
  RemoteAutoIcon,
  RemoteManualIcon,
  ExitButtonIcon,
} from '~/icons';
import {
  DesktopWrapper, MobileWrapper, DataText, IconWrapper, Card, TitleColumn, ConfirmContainer,
} from './styles';
import { colors } from 'styles/colors';
import { Loader, ModalWindow, OptionsWithIcon } from 'components';
import { UtilityLayout } from './UtilityLayout';
import { apiCall, ApiResps } from '~/providers';
import { useWebSocketLazy } from 'helpers/wsConnection';
import { AxiosError } from 'axios';
import { Bluebar } from '../Integrations/IntegrRealTime/styles';
import { t } from 'i18next';
import { ConfirmStatus, DenyStatus } from '../Units/UnitDetail/styles';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const UtilityRealTime = ({ utilInfo }): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ utilId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      confirmChange: false as boolean,
      isLoading: true,
      utilInfo: utilInfo as (ApiResps['/dal/get-illumination-info']),
      RSSI: null as null | number,
      Feedback: null as null|boolean,
      Mode: null as null|string,
      Relay: null as null|boolean,
      selectedStatus: null as null | any,
      status: null as null|string,
      optionsControlMode: [
        {
          icon: <RemoteAutoIcon />,
          iconSelected: <RemoteAutoIcon color="white" />,
          label: t('automatico'),
          selected: true,
          tag: 'AUTO',
          mode: 'auto',
        },
        {
          icon: <RemoteManualIcon />,
          iconSelected: <RemoteManualIcon color="white" />,
          label: t('manual'),
          selected: false,
          tag: 'MANUAL',
          mode: 'manual',
        },
      ],
      optionsLightStatus: [
        {
          icon: <LightOnIcon />,
          iconSelected: <LightOnIcon />,
          label: t('ligar'),
          selected: false,
          tag: 'ON',
          mode: 'on',
        },
        {
          icon: <LightOffIcon />,
          iconSelected: <LightOffIcon />,
          label: t('desligar'),
          selected: true,
          tag: 'OFF',
          mode: 'off',
        },
      ],
    };
    return state;
  });
  const { utilId } = match.params;

  const wsl = useWebSocketLazy();
  function onWsOpen(wsConn) {
    if (state.utilInfo?.DAL_CODE) {
      wsConn.send({ type: 'dalSubscribeRealTime', data: { DAL_CODE: state.utilInfo.DAL_CODE } });
    }
  }
  function onWsMessage(response) {
    if (response && response.type === 'dalTelemetry') {
      if (state.utilInfo?.FEEDBACK) {
        state.Feedback = response.data.Feedback[state.utilInfo.FEEDBACK - 1];
      }
      if (state.utilInfo?.PORT) {
        state.Mode = response.data.Mode[state.utilInfo.PORT - 1];
        state.Relay = response.data.Relays[state.utilInfo.PORT - 1];
      }
      state.RSSI = response.data.RSSI;
      state.status = response.data.status;
      getCurrentOptions(state.Mode, state.Relay);
      render();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dalUnsubscribeRealTime' });
  }

  function getCurrentOptions(mode: string|null, relay: boolean|null) {
    const newMode = state.utilInfo?.PORT
    && mode as 'AUTO'|'MANUAL';
    const newRelayStatus = state.utilInfo?.PORT
      && relay ? 'ON' : 'OFF';
    const controlModeCurrent = state.optionsControlMode.find((item) => item.selected);
    if (controlModeCurrent && controlModeCurrent.tag !== newMode) {
      controlModeCurrent.selected = false;
      const controlModeNew = state.optionsControlMode.find((item) => item.tag === newMode);
      if (controlModeNew) {
        controlModeNew.selected = true;
      }
      else {
        state.optionsControlMode[0].selected = true;
      }
    }

    const lightStatusCurrent = state.optionsLightStatus.find((item) => item.selected);
    if (lightStatusCurrent && lightStatusCurrent.tag !== newRelayStatus) {
      lightStatusCurrent.selected = false;
      const lightStatusNew = state.optionsLightStatus.find((item) => item.tag === newRelayStatus);
      if (lightStatusNew) {
        lightStatusNew.selected = true;
      }
      else {
        state.optionsLightStatus[0].selected = true;
      }
    }
  }

  async function getUtilityInfo() {
    if (!utilInfo) {
      try {
        setState({ isLoading: true });
        const utilInfo = await apiCall('/dal/get-illumination-info', { ILLUMINATION_ID: Number(utilId) });
        state.utilInfo = utilInfo;
        render();
        if (utilInfo.DAL_CODE) {
          wsl.start(onWsOpen, onWsMessage, beforeWsClose);
        }
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
      setState({ isLoading: false });
    }
  }

  useEffect(() => {
    getUtilityInfo();
  }, []);

  function getDialColor() {
    if (state.status !== 'ONLINE' || !state.Feedback) return colors.LightGrey_v3;
    return colors.BlueSecondary;
  }

  function updateUtilStatus(telemetry: ApiResps['/dal/set-dal-operation']) {
    state.Mode = telemetry.Mode?.[state.utilInfo.PORT - 1] ?? null;
    state.Relay = telemetry.Relays?.[state.utilInfo.PORT - 1] ?? null;
    state.Feedback = telemetry.Feedback?.[state.utilInfo.FEEDBACK - 1] ?? null;
    render();
  }

  async function sendDalMode(selectedMode) {
    setState({ isLoading: true });
    try {
      if (state.utilInfo.DAL_CODE) {
        const telemetry = await apiCall('/dal/set-dal-operation', {
          dalCode: state.utilInfo.DAL_CODE,
          instance: state.utilInfo.PORT - 1,
          mode: selectedMode.tag,
        });
        state.Mode = selectedMode.tag;
        toast.success(`Enviado!${selectedMode.tag === 'MANUAL' ? t('sucessoOperacaoManualDal') : ''}`);
      }
    } catch (err) {
      const error = err as AxiosError;
      console.log(error);
      if (error.response?.data.errorMessage.includes('Timeout')) {
        toast.error(t('erro'));
      } else {
        toast.error(error.message);
      }
    }
    getCurrentOptions(state.Mode, state.Relay);
    setState({ isLoading: false });
  }

  async function selectControlMode() {
    const selectedMode = state.optionsControlMode.find((item) => item.selected);
    await sendDalMode(selectedMode);
    render();
  }

  async function sendDalStatus(selectedStatus) {
    setState({ isLoading: true });
    try {
      if (state.utilInfo.DAL_CODE) {
        const newStatus = selectedStatus.tag === 'ON' ? 1 : 0;
        const telemetry = await apiCall('/dal/set-dal-operation', {
          dalCode: state.utilInfo.DAL_CODE,
          relays: [state.utilInfo.PORT - 1],
          values: [newStatus],
        });
        if (telemetry) {
          updateUtilStatus(telemetry);
          if (telemetry.Relays?.[state.utilInfo.PORT - 1] !== (!!newStatus)) {
            throw Error(t('erroComandoEnviadoStatusAutomacao'));
          }
          if (telemetry.Feedback?.[state.utilInfo.FEEDBACK - 1] !== (!!newStatus)) {
            throw Error(t('erroComandoEnviadoFeedback'));
          }
          toast.success(t('sucesso'));
        }
      }
    } catch (err) {
      const error = err as AxiosError;
      console.log(error);
      if (error.response?.data.errorMessage.includes('Timeout')) {
        toast.error(t('erro'));
      } else {
        toast.error(error.message);
      }
    }
    getCurrentOptions(state.Mode, state.Relay);
    setState({ isLoading: false });
  }

  async function selectStatus() {
    const selectedStatus = state.optionsLightStatus.find((item) => item.selected);
    await sendDalStatus(selectedStatus);
    render();
  }

  // const disableAutomationButtons = state.status !== 'ONLINE' || state.isLoading;
  const disableAutomationButtons = !state.utilInfo?.isCommandAvailable;

  function closeModal() {
    setState({ confirmChange: false });
    render();
  }

  function openConfirmModal() {
    const selectedStatus = state.optionsLightStatus.find((item) => item.selected);
    state.selectedStatus = selectedStatus;
    setState({ confirmChange: true });
    render();
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.utilInfo?.NAME, t('tempoReal'))}</title>
      </Helmet>
      <UtilityLayout utilInfo={state.utilInfo} />
      {state.isLoading && (
        <div style={{ marginTop: '50px' }}>
          <Loader variant="primary" />
        </div>
      )}
      <div style={{ marginTop: '30px' }} />
      { state.confirmChange && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow
          style={{
            padding: '0px',
            width: '55%',
            marginBottom: 'auto',
            marginTop: '8%',
            minWidth: '300px',
            maxWidth: '500px',
          }}
          topBorder
          onClickOutside={() => {
            closeModal();
          }}
        >
          <Bluebar />
          <ConfirmChangeModal selectedStatus={state.selectedStatus} closeModal={closeModal} sendDalStatus={sendDalStatus} />
        </ModalWindow>
      </div>
      ) }
      {state.utilInfo && (!state.isLoading) && (
        <Card style={{ borderTop: '10px solid #363BC4' }}>
          <StatusCard automId={state.utilInfo.DAL_CODE} status={state.status} RSSI={state.RSSI} />
          {!!state.utilInfo.FEEDBACK && (
            <Flex
              flexWrap="nowrap"
              flexDirection="column"
              alignItems="center"
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
                    <Dial status={state.Feedback} color={getDialColor()} />
                  </div>
                  <div style={{ zIndex: 1 }}>
                    {state !== undefined && (
                      <div style={{
                        textAlign: 'center', fontSize: '110%', display: 'flex', fontWeight: 'normal',
                      }}
                      >
                        <div>
                          {state.Feedback ? (
                            <Flex flexDirection="column" alignItems="center">
                              <IconWrapper height={36} width={36}>
                                <LightOnIcon />
                              </IconWrapper>
                              <div style={{ width: '70%', marginTop: '15px' }}>
                                {t('iluminacaoLigada')}
                              </div>
                            </Flex>
                          ) : (
                            <Flex flexDirection="column" alignItems="center">
                              <IconWrapper height={36} width={36}>
                                <LightOffIcon />
                              </IconWrapper>
                              <div style={{ width: '70%', marginTop: '15px' }}>
                                {t('iluminacaoDesligada')}
                              </div>
                            </Flex>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {state.utilInfo.DAL_CODE && (
                <Flex
                  flexWrap="wrap"
                  flexDirection="row"
                  mt={20}
                  justifyContent="center"
                >
                  <Flex
                    flexWrap="nowrap"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <div style={{ fontWeight: 'bold', margin: '0px 70px' }}>
                      {t('modoControle')}
                    </div>
                    <div style={{ fontWeight: 'bold', margin: '11px 63px' }}>
                      <OptionsWithIcon handleSelect={selectControlMode} disabled={disableAutomationButtons || !state.Mode} options={state.optionsControlMode} />
                    </div>
                  </Flex>
                  <Flex
                    flexWrap="nowrap"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <div style={{ fontWeight: 'bold', margin: '0px 45px' }}>
                      {t('statusAutomacao')}
                    </div>
                    <div style={{ fontWeight: 'bold', margin: '11px 38px' }}>
                      <OptionsWithIcon handleSelect={openConfirmModal} disabled={state.Mode !== 'MANUAL' || disableAutomationButtons || state.Relay == null} options={state.optionsLightStatus} onClickOutside={() => render()} />
                    </div>
                  </Flex>
                </Flex>
              )}
              {
                  disableAutomationButtons
                  && (
                    <h4 style={{ fontWeight: 'bold' }}>
                      {t('ComandoDalNaoDisponivel')}
                    </h4>
                  )
              }
            </Flex>
          )}
        </Card>
      )}
    </>
  );
};

const StatusCard = ({ automId, status, RSSI }): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);

  function formatRssiIcon(rssi: string) {
    switch (rssi) {
      case 'Excelente': return <GreatSignalIcon />;
      case 'Bom': return <GoodSignalIcon />;
      case 'Regular': return <RegularSignalIcon />;
      case 'Ruim': return <BadSignalIcon />;
      default: return <NoSignalIcon />;
    }
  }

  function rssiDesc() {
    if (RSSI < 0 && status === 'ONLINE') {
      if (RSSI > -50) return 'Excelente';
      if (RSSI > -60) return 'Bom';
      if (RSSI > -70) return 'Regular';
      return 'Ruim';
    }
    return '-';
  }

  const automationAndStatusInfo = (): JSX.Element => (
    <Flex flexWrap="nowrap" alignItems="left">
      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
        <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
          <DataText style={{ fontSize: '12px', marginLeft: '24px', marginTop: '21px' }} color={colors.Black} fontWeight="bold">
            {t('automacao')}
          </DataText>
        </Flex>
        <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
          <DataText style={{ fontSize: '12px', marginTop: '4px', marginLeft: '24px' }} color={colors.Black}>
            {automId}
          </DataText>
        </Flex>
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
        <div style={{
          height: '42px', marginTop: '19px', marginLeft: '19px', borderLeft: '2px solid lightgrey',
        }}
        />
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
        <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
          <DataText style={{ fontSize: '12px', marginLeft: '24px', marginTop: '19px' }} color={colors.Black} fontWeight="bold">
            {t('status')}
          </DataText>
        </Flex>
        <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
          <DataText style={{ marginLeft: '30px' }}>
            <div>
              {(profile.manageAllClients && (rssiDesc() != null))
                && (
                <IconWrapper width="19" height="25">
                  {formatRssiIcon(rssiDesc())}
                </IconWrapper>
                )}
            </div>
          </DataText>
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <>
      <DesktopWrapper>
        <Flex
          flexDirection="column"
          alignItems="left"
          flexWrap="nowrap"
          width="221px"
          height="78px"
          style={{
            border: '1px solid lightgrey',
            borderRadius: '10px',
          }}
        >
          {automationAndStatusInfo()}
        </Flex>
      </DesktopWrapper>
      <MobileWrapper>
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          alignItems="left"
          width="221px"
          style={{
            border: '1px solid lightgrey',
            borderRadius: '10px',
          }}
        >
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            height="81px"
            alignItems="left"
          >
            {automationAndStatusInfo()}
          </Flex>
        </Flex>
      </MobileWrapper>
    </>
  );
};

function getChangeText(tag: string): string {
  return `Você tem certeza que deseja ${tag === 'ON' ? 'ligar' : 'desligar'} a  \n iluminação do ambiente?`;
}

type ConfirmProps = {
  closeModal: () => void,
  selectedStatus?: {
    icon: JSX.Element,
    iconSelected: JSX.Element,
    label: string,
    selected: boolean,
    tag: string,
    mode: string,
  },
  sendDalStatus: (selectedStatus: any) => Promise<void>,
}

function ConfirmChangeModal(
  { closeModal, selectedStatus, sendDalStatus }: ConfirmProps,
) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '330px', paddingBottom: '20px',
    }}
    >
      <div style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '90%', padding: '20px',
      }}
      >
        <TitleColumn>
          <b>
            Desligar Iluminação
          </b>
          <p>
            Alterar status
          </p>
        </TitleColumn>
        <div onClick={closeModal} style={{ cursor: 'pointer' }} onKeyDown={closeModal}>
          <ExitButtonIcon />
        </div>
      </div>
      { selectedStatus?.tag === 'ON' ? (<LightOnIcon heigth="45" width="45" />) : (<LightOffIcon heigth="45" width="45" />) }
      <div style={{ width: '80%' }}>
        <h3>
          { selectedStatus && getChangeText(selectedStatus.tag) }
        </h3>
      </div>
      <ConfirmContainer>
        <ConfirmStatus
          onClick={() => {
            sendDalStatus(selectedStatus);
            closeModal();
          }}
          style={{ cursor: 'pointer' }}
        >
          <>{t('sim')}</>
        </ConfirmStatus>
        <DenyStatus onClick={closeModal} style={{ cursor: 'pointer' }}>
          <>{t('nao')}</>
        </DenyStatus>
      </ConfirmContainer>
    </div>
  );
}

function Dial(props: { status: boolean | null, color: string | null, mobile?: boolean }) {
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
      viewBox="0 0 43.93095 43.93095"
      width={!props.mobile ? '270' : '225'}
      height={!props.mobile ? '270' : '225'}
      onClick={onSvgClick}
    >
      <g transform="translate(-9.1068883,-56.072787)">
        <circle
          style={{
            fill: 'none',
            fillOpacity: 1,
            stroke: props.color ?? colors.LightLightGrey_v3,
            strokeWidth: 3.92591,
            strokeDasharray: 'none',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeOpacity: 1,
          }}
          cx="31.072363"
          cy="78.038261"
          r="20.00252"
        />
      </g>
    </svg>
  );
}

export default withTransaction('UtilityRealTime', 'component')(UtilityRealTime);
