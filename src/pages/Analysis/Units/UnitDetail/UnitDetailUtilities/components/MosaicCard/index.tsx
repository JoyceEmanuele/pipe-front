import {
  useEffect, useRef, useState,
} from 'react';
import ReactTooltip from 'react-tooltip';
import { Flex } from 'reflexbox';
import {
  CardContainer, BorderTop, TooltipContainer, ProgWrapper, ButtomStatus, ButtomStatusOn, ButtomStatusOff, ModalStatusDivisor, ModalStatus,
} from './styles';
import {
  BatteryIcon,
  PortIcon,
  BatteryFullIcon,
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
  ClockDurationIcon,
  EletricNetworkIcon,
  NobreakOffIcon,
  InfoIcon,
  LightOnIcon,
  LightOffIcon,
  WatchIcon,
} from '~/icons';
import { t } from 'i18next';
import { TransparentLink } from '../../styles';
import { getUserProfile } from '~/helpers/userProfile';
import { ToggleSwitchMini } from 'components/ToggleSwitch';
import { DALSchedule } from 'pages/Analysis/SchedulesModals/DAL_Schedule';
import { colors } from '~/styles/colors';
import { DamItem } from '../../..';
import { apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { Loader } from '~/components';
import { ConfirmStatusChange } from '../../../ConfirmStatusChange';
import { useStateVar } from '~/helpers/useStateVar';

export interface MosaicCardProps {
  utilityInfo: {
    ID: number;
    NAME: string;
    APPLICATION?: string;
    DAT_CODE?: string|null;
    DEVICE_CODE: string|null;
    PORT: number|null;
    PORT_ELETRIC?: number|null;
    FEEDBACK?: number|null;
    UNIT_ID?: number|null;
    CLIENT_ID?: number|null;
  },
  telemetry?: {
    dev_id?: string
    F1?: boolean
    F2?: boolean
    F3?: boolean
    F4?: boolean
    Feedback?: boolean[],
    Mode?: string[],
    RSSI?: number
    status?: string
    State?: string
    safeWaitMode?: boolean
  }
  openScheduleDialogFor?: (devId: string) => void;
  openConfirmStatusChange?: (devId: string, command: { label: string, value: string, dam: DamItem }) => void;
}

export function formatRssiIcon(telemetry: MosaicCardProps['telemetry']): JSX.Element {
  if (telemetry?.RSSI && (telemetry?.RSSI < 0) && telemetry?.status === 'ONLINE') {
    if (telemetry.RSSI > -50) return <GreatSignalIcon width="25px" height="20px" />;
    if (telemetry.RSSI > -60) return <GoodSignalIcon />;
    if (telemetry.RSSI > -70) return <RegularSignalIcon />;
    return <BadSignalIcon />;
  }
  return <NoSignalIcon width="25px" height="20px" />;
}

function noInfoItem() {
  return (
    <Flex alignItems="center">
      <InfoIcon width="25px" height="20px" />
      <Flex flexDirection="column" ml="5px">
        <span style={{ fontWeight: 700 }}>{t('semInformacao')}</span>
      </Flex>
    </Flex>
  );
}

export function getNobreakStatus(
  utilityInfo: MosaicCardProps['utilityInfo'],
  telemetry: MosaicCardProps['telemetry'],
): JSX.Element {
  if (utilityInfo.PORT && utilityInfo.PORT_ELETRIC && telemetry?.status === 'ONLINE') {
    const electricNetworkPort = `F${utilityInfo.PORT_ELETRIC}`;
    const nobreakPort = `F${utilityInfo.PORT}`;
    if (telemetry[electricNetworkPort]) {
      return (
        <Flex justifyContent="center">
          <EletricNetworkIcon />
          <span style={{ marginLeft: '5px' }}>{t('utilizandoRedeEletrica')}</span>
        </Flex>
      );
    }
    if (telemetry[nobreakPort]) {
      return (
        <Flex justifyContent="center">
          <BatteryIcon width="25px" height="20px" />
          <span style={{ marginLeft: '5px' }}>{t('utilizandoBateria')}</span>
        </Flex>
      );
    }
    return (
      <Flex justifyContent="center">
        <NobreakOffIcon />
        <span style={{ marginLeft: '5px' }}>{t('desligadoMin')}</span>
      </Flex>
    );
  }
  return (
    <Flex justifyContent="center">
      <InfoIcon />
      <span style={{ marginLeft: '5px' }}>{t('semInformacao')}</span>
    </Flex>
  );
}

export function getIlluminationDamStatus(
  utilityInfo: MosaicCardProps['utilityInfo'],
  telemetry: MosaicCardProps['telemetry'],
  localState?: boolean,
  openModalStatus?: () => void,
  closeModalStatus?: () => void,
  openConfirmStatusChange?: (devId: string, command: { label: string, value: string, dam: DamItem }) => void,
): JSX.Element {
  const illumState = telemetry?.State;
  const illumMode = telemetry?.Mode ? telemetry.Mode[0] : null;
  if (illumMode === 'A') {
    return illumState === 'allow' ? (
      <Flex justifyContent="center">
        <LightOnIcon />
        <span style={{ marginLeft: '5px' }}>{t('iluminacaoLigada')}</span>
      </Flex>
    ) : (
      <Flex justifyContent="center">
        <LightOffIcon />
        <span style={{ marginLeft: '5px' }}>{t('iluminacaoDesligada')}</span>
      </Flex>
    );
  }

  if (illumMode === 'M' && !localState) {
    return illumState === 'allow' ? (
      <ButtomStatus onClick={openModalStatus} justifyContent="center">
        <LightOnIcon />
        <span style={{ marginLeft: '5px' }}>{t('iluminacaoLigada')}</span>
      </ButtomStatus>
    ) : (
      <ButtomStatus onClick={openModalStatus} justifyContent="center">
        <LightOffIcon />
        <span style={{ marginLeft: '5px' }}>{t('iluminacaoDesligada')}</span>
      </ButtomStatus>
    );
  }

  if (localState) {
    return (
      <div style={{ position: 'relative' }}>
        <ModalStatusIllumination illumState={illumState} utilityInfo={utilityInfo} telemetry={telemetry} openConfirmStatusChange={openConfirmStatusChange} closeModalStatus={closeModalStatus} />
      </div>
    );
  }
  return (
    <Flex justifyContent="center">
      <InfoIcon />
      <span style={{ marginLeft: '5px' }}>{t('semInformacao')}</span>
    </Flex>
  );
}

export function getIlluminationDeviceStatus(
  illumStatus: boolean,
): JSX.Element {
  return illumStatus ? (
    <Flex justifyContent="center">
      <LightOnIcon />
      <span style={{ marginLeft: '5px' }}>{t('iluminacaoLigada')}</span>
    </Flex>
  ) : (
    <Flex justifyContent="center">
      <LightOffIcon />
      <span style={{ marginLeft: '5px' }}>{t('iluminacaoDesligada')}</span>
    </Flex>
  );
}

export function getIlluminationStatus(
  utilityInfo: MosaicCardProps['utilityInfo'],
  telemetry: MosaicCardProps['telemetry'],
  localState?: boolean,
  openModalStatus?: () => void,
  closeModalStatus?: () => void,
  openConfirmStatusChange?: (devId: string, command: { label: string, value: string, dam: DamItem }) => void,
): JSX.Element {
  if (telemetry?.status === 'ONLINE') {
    let illumStatus;
    const isDmt = telemetry.dev_id?.startsWith('DMT');
    const isDal = telemetry.dev_id?.startsWith('DAL');
    const isDam = telemetry.dev_id?.startsWith('DAM');

    if (isDmt && utilityInfo.PORT) {
      const illumPort = `F${utilityInfo.PORT}`;
      illumStatus = telemetry[illumPort];
    }
    if (isDal && utilityInfo.FEEDBACK) {
      const illumPort = utilityInfo.FEEDBACK - 1;
      illumStatus = telemetry.Feedback?.[illumPort];
    }
    if (isDam) { illumStatus = telemetry.status; }
    const hasOnline = illumStatus != null;

    if (hasOnline && !isDam) { return getIlluminationDeviceStatus(illumStatus); }

    if (hasOnline && isDam) { return getIlluminationDamStatus(utilityInfo, telemetry, localState, openModalStatus, closeModalStatus, openConfirmStatusChange); }
  }
  return (
    <Flex justifyContent="center">
      <InfoIcon />
      <span style={{ marginLeft: '5px' }}>{t('semInformacao')}</span>
    </Flex>
  );
}

export function getIlluminationMode(
  utilityInfo: MosaicCardProps['utilityInfo'],
  telemetry: MosaicCardProps['telemetry'],
): 'AUTO'|'MANUAL' | undefined {
  if (!utilityInfo.DEVICE_CODE?.startsWith('DAM') && telemetry?.status === 'ONLINE' && utilityInfo.PORT) {
    const mode = telemetry.Mode?.[utilityInfo.PORT - 1] as 'AUTO'|'MANUAL'|undefined;
    return mode;
  }
  if (utilityInfo.DEVICE_CODE?.startsWith('DAM') && telemetry?.status === 'ONLINE') {
    const modeAux = telemetry.Mode as 'AUTO'|'MANUAL'|undefined;
    const mode = modeAux?.toUpperCase() as 'AUTO'|'MANUAL'|undefined;
    return mode;
  }
  return 'AUTO';
}

function getUtilType(utilityInfo: MosaicCardProps['utilityInfo']) {
  if (utilityInfo.APPLICATION === 'Nobreak') return 'nobreak';
  if (utilityInfo.APPLICATION === 'Iluminação') return 'iluminacao';
  return null;
}

function updateDamStatus(message, dev) {
  dev.status = message.status;
  dev.Mode = message.Mode;
  dev.State = message.State;
}

export const MosaicCard = (props: MosaicCardProps): JSX.Element => {
  const {
    utilityInfo, telemetry, openScheduleDialogFor,
  } = props;
  const [profile] = useState(getUserProfile);
  const utilType = getUtilType(utilityInfo);
  const [loading, setLoading] = useState(false);
  const [safeWaitMode, setSafeWaitMode] = useState(false);
  const [state, render, _setState] = useStateVar({
    isConfirmStatusChangeOpen: false,
    statusChangeCommand: {
      label: '',
      value: '',
      dam: {} as DamItem,
    },
    selectedDamId: '',
    localModalStatus: false,
  });

  let permissionProfile = (utilityInfo && utilityInfo.CLIENT_ID
    ? profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === utilityInfo?.CLIENT_ID)
    : false) || profile.manageAllClients;

  if (permissionProfile === false || permissionProfile === undefined) {
    permissionProfile = !!profile.adminClientProg?.UNIT_MANAGE.some((item) => item === utilityInfo?.UNIT_ID);
  }

  async function retrieveDamProgramming() {
    if (utilityInfo && utilityInfo.DEVICE_CODE) {
      try {
        openScheduleDialogFor && openScheduleDialogFor(utilityInfo.DEVICE_CODE);
      } catch (err) {
        console.log(err);
      }
    }
  }

  function openConfirmStatusChange(damId: string, status: { label: string, value: string, dam: DamItem }) {
    state.selectedDamId = damId;
    state.statusChangeCommand = status;
    state.isConfirmStatusChangeOpen = true;
    render();
  }

  function closeConfirmStatusChange() {
    state.isConfirmStatusChangeOpen = false;
    render();
  }

  function openModalStatus() {
    state.localModalStatus = true;
    render();
  }

  function closeModalStatus() {
    state.localModalStatus = false;
    render();
  }

  async function sendDamMode(newMode) {
    if (safeWaitMode) return;
    if (telemetry) {
      setSafeWaitMode(true);
      setTimeout(() => {
        setSafeWaitMode(false);
      }, 2500);
      try {
        setLoading(true);
        const telemetryCurrent = await apiCall('/dam/set-dam-operation', {
          dev_id: utilityInfo.DEVICE_CODE ? utilityInfo.DEVICE_CODE : '',
          mode: newMode, // 'manual', 'auto'
        });
        updateDamStatus(telemetryCurrent, telemetry);
        toast.success(t('sucessoModoDamAlterado'));
        window.location.reload();
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
      setLoading(false);
    }
  }

  async function changeDamMode(
    telemetry: MosaicCardProps['telemetry'],
    utilityInfo: MosaicCardProps['utilityInfo'],
  ) {
    if (utilityInfo && telemetry && telemetry.Mode) {
      if (telemetry?.Mode[0].startsWith('A') && utilityInfo.DEVICE_CODE) {
        await sendDamMode('manual');
      }
      else if (telemetry?.Mode[0].startsWith('M') && utilityInfo.DEVICE_CODE) {
        await sendDamMode('auto');
      }
    }
  }

  return (
    <CardContainer>
      <BorderTop />
      <Flex flexDirection="column" padding="15px" height="100%">
        <TransparentLink to={`/analise/utilitario/${utilType}/${utilityInfo.ID}/informacoes`}>
          <span style={{ fontWeight: 700 }}>
            { utilityInfo.NAME.length < 20 ? utilityInfo.NAME : `${utilityInfo.NAME.substring(0, 20)}...`}
          </span>
        </TransparentLink>

        <div style={{ border: '1px solid #E4E3E3', margin: '10px 0px' }} />

        <span style={{
          marginBottom: '10px', fontSize: '11px', color: '#6D6D6D', fontWeight: 500, height: '40px',
        }}
        >
          {utilityInfo.DAT_CODE && (
            <TransparentLink to={`/analise/utilitario/${utilType}/${utilityInfo.ID}/informacoes`}>
              {`${utilityInfo.DAT_CODE} / `}
            </TransparentLink>
          )}
          {utilityInfo.DEVICE_CODE && (
            <TransparentLink to={`/analise/dispositivo/${utilityInfo.DEVICE_CODE}/informacoes`}>
              {utilityInfo.DEVICE_CODE}
            </TransparentLink>
          )}
        </span>

        {utilType === 'nobreak' && (
          <Flex flexDirection="column" mt={20} justifyContent="space-between" height="100%">
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{getNobreakStatus(utilityInfo, telemetry)}</div>
            <Flex alignItems="center" justifyContent="space-between">
              <div data-tip data-for={`clock-duration-${utilityInfo.ID}`}>
                <ClockDurationIcon width="25px" height="20px" />
              </div>
              <div data-tip data-for={`battery-${utilityInfo.ID}`}>
                <BatteryFullIcon width="25px" height="20px" />
              </div>
              {profile.manageAllClients && (
                <div data-tip data-for={`port-${utilityInfo.ID}`}>
                  <PortIcon width="25px" height="20px" />
                </div>
              )}
              {formatRssiIcon(telemetry)}
            </Flex>
          </Flex>
        )}

        {utilType === 'iluminacao' && (
          <Flex flexDirection="column" mt={20} justifyContent="space-between" height="100%">
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{ getIlluminationStatus(utilityInfo, telemetry, state.localModalStatus, openModalStatus, closeModalStatus, openConfirmStatusChange)}</div>
            <Flex justifyContent="space-between" alignItems="center">
              {(utilityInfo.DEVICE_CODE?.startsWith('DAM') || (utilityInfo.DEVICE_CODE?.startsWith('DAL') && utilityInfo.PORT)) && (
                loading ? <Loader size="small" />
                  : (
                    <Flex alignItems="center">
                      <span style={{ fontSize: '11px', color: '#6D6D6D', fontWeight: 500 }}>Auto</span>
                      <ToggleSwitchMini
                        onOff={false}
                        checked={getIlluminationMode(utilityInfo, telemetry) === 'MANUAL'}
                        style={{ margin: '0 5px', cursor: 'unset' }}
                        onClick={() => utilityInfo.DEVICE_CODE?.startsWith('DAM') && changeDamMode(telemetry, utilityInfo)}
                      />
                      <span style={{ fontSize: '11px', color: '#6D6D6D', fontWeight: 500 }}>{t('manual')}</span>
                    </Flex>
                  )
              )}
              {utilityInfo.DEVICE_CODE?.startsWith('DAL') && utilityInfo.PORT && (
                <ProgWrapper>
                  <DALSchedule
                    deviceCode={utilityInfo.DEVICE_CODE}
                    illumId={utilityInfo.ID}
                    illumName={utilityInfo.NAME}
                    canEdit={permissionProfile}
                    isModal
                    onlyIcon
                  />
                </ProgWrapper>
              )}
              {utilityInfo.DEVICE_CODE?.startsWith('DAM') && (
                <ProgWrapper onClick={retrieveDamProgramming}>
                  <WatchIcon color={colors.BlueSecondary} />
                </ProgWrapper>
              )}
              {utilityInfo.DEVICE_CODE && (
                <Flex alignItems="center" style={{ marginLeft: 'auto' }}>
                  {formatRssiIcon(telemetry)}
                </Flex>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>

      <ReactTooltip
        id={`clock-duration-${utilityInfo.ID}`}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
      >
        <TooltipContainer>
          {noInfoItem()}
        </TooltipContainer>
      </ReactTooltip>

      <ReactTooltip
        id={`battery-${utilityInfo.ID}`}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
      >
        <TooltipContainer>
          {noInfoItem()}
        </TooltipContainer>
      </ReactTooltip>

      <ReactTooltip
        id={`port-${utilityInfo.ID}`}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
      >
        <TooltipContainer>
          <Flex alignItems="center">
            <PortIcon width="25px" height="20px" />
            <Flex flexDirection="column" ml="5px">
              <span style={{ fontWeight: 700 }}>{t('feedback')}</span>
              <span>{utilityInfo.PORT ?? '-'}</span>
            </Flex>
          </Flex>
        </TooltipContainer>
      </ReactTooltip>

      { state.selectedDamId && state.isConfirmStatusChangeOpen && <ConfirmStatusChange devId={state.selectedDamId} command={state.statusChangeCommand} closeConfirmStatusChange={closeConfirmStatusChange} /> }
    </CardContainer>
  );
};

export const ModalStatusIllumination = (cProps: {
  illumState?: string,
  utilityInfo: MosaicCardProps['utilityInfo'],
  telemetry: MosaicCardProps['telemetry'],
  openConfirmStatusChange?: (devId: string, command: { label: string, value: string, dam: DamItem }) => void,
  closeModalStatus?: () => void
}): JSX.Element => {
  const {
    openConfirmStatusChange, closeModalStatus, utilityInfo, telemetry, illumState,
  } = cProps;

  const [checkedOn, _setCheckedOn] = useState(telemetry?.State === 'allow' || false);
  const [checkedOff, _setCheckedOff] = useState(telemetry?.State === 'forbid' || false);

  const dam = {
    DAM_ID: utilityInfo.DEVICE_CODE,
    UNIT_ID: utilityInfo.UNIT_ID,
    State: telemetry?.State,
    Mode: telemetry?.Mode ? telemetry.Mode[0] : '',
    switchProgOn: false,
    emptyProg: true,
    status: telemetry?.status,
  } as DamItem;

  const refModal = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (refModal.current && !refModal.current.contains(event.target)) {
        closeModalStatus && closeModalStatus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ModalStatus ref={refModal}>
      <ButtomStatusOn
        style={{ backgroundColor: illumState === 'allow' ? '#363BC4' : '#FFF' }}
        onClick={() => { !checkedOn && openConfirmStatusChange && telemetry?.dev_id && openConfirmStatusChange(telemetry?.dev_id, {
          label: t('ligar'),
          value: 'allow',
          dam,
        });
        closeModalStatus && closeModalStatus(); }}
        justifyContent="center"
      >
        <LightOnIcon color={illumState === 'allow' ? '#FFF' : '#363BC4'} />
        <span style={{ marginLeft: '5px', color: illumState === 'allow' ? '#FFF' : '#000' }}>{t('iluminacaoLigada')}</span>
      </ButtomStatusOn>
      <ModalStatusDivisor />
      <ButtomStatusOff
        style={{ backgroundColor: illumState === 'forbid' ? '#363BC4' : '#FFF' }}
        onClick={() => { !checkedOff && openConfirmStatusChange && telemetry?.dev_id && openConfirmStatusChange(telemetry?.dev_id, {
          label: t('desligar'),
          value: 'forbid',
          dam,
        });
        closeModalStatus && closeModalStatus(); }}
        justifyContent="center"
      >
        <LightOffIcon color={illumState === 'forbid' ? '#FFF' : '#363BC4'} />
        <span style={{ marginLeft: '5px', color: illumState === 'forbid' ? '#FFF' : '#000' }}>{t('iluminacaoDesligada')}</span>
      </ButtomStatusOff>
    </ModalStatus>
  );
};
