import { useState } from 'react';
import { toast } from 'react-toastify';
import { Loader } from 'components';
import { getUserProfile } from 'helpers/userProfile';
import { apiCall } from 'providers';
import {
  DamItem, DatItem, formatRssiIcon, rssiDesc,
} from '../../../../..';
import { t } from 'i18next';
import {
  Container,
  Title,
  Label,
  ModeContainer,
  StatusContainer,
  IconWiFiRealTime,
  LabelSwitch,
  IconWatchButton,
  SwitchContainer,
} from './styles';
import { WatchIcon } from 'icons';
import { colors } from 'styles/colors';
import { DamControlOperation } from '../ControlOperation';
import { ToggleSwitchMini } from 'components/ToggleSwitch';
import { useWebSocket } from 'helpers/wsConnection';
import { TransparentLink } from '../../styles';

type Props = {
  dam: DamItem;
  dat?: DatItem;
  openScheduleDialogFor: (devId: string) => void;
  manualCommandsEnabled: object;
  automationOption: object;
  statusOption: object;
};

function updateDamStatus(message, dev) {
  dev.status = message.status;
  dev.Mode = message.Mode;
  dev.State = message.State;
}

export const MachineDamAutomation = ({
  dam,
  dat,
  openScheduleDialogFor,
  manualCommandsEnabled,
  automationOption,
  statusOption,
}: Props): React.ReactElement => {
  const [profile] = useState(getUserProfile);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(automationOption[dam.DAM_ID] === 'Manual');

  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [rssi, setRssi] = useState<number>();

  function onClickSwitchMode() {
    setMode((previousState) => !previousState);

    if (mode) {
      sendDamMode('manual', 'Manual');
    } else {
      sendDamMode('auto', 'Automático');
    }
  }

  async function retrieveDamProgramming() {
    if (dam && dam.DAM_ID) {
      try {
        openScheduleDialogFor(dam.DAM_ID);
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function sendDamRelay(mode: 'allow' | 'onlyfan' | 'forbid', option: string) {
    if (dam.safeWaitRelay) return;
    dam.safeWaitRelay = true;
    setTimeout(() => {
      delete dam.safeWaitRelay;
    }, 2500);
    try {
      const data = {
        dev_id: dam.DAM_ID,
        relay: mode,
      };
      setLoading(true);
      const telemetry = await apiCall('/dam/set-dam-operation', data);
      updateDamStatus(telemetry, dam);
      statusOption[dam.DAM_ID] = option;
      toast.success(t('sucessoDAMStatus'));
    } catch (err) {
      console.log(err);
      toast.error(
        t('erroStatusDAM'),
      );
    }
    setLoading(false);
  }

  async function sendDamMode(mode: 'auto' | 'manual', option: string) {
    if (!dam.safeWaitMode) {
      dam.safeWaitMode = true;
      setTimeout(() => {
        delete dam.safeWaitMode;
      }, 2500);
      try {
        const data = {
          dev_id: dam.DAM_ID,
          mode,
        };
        setLoading(true);
        const telemetry = await apiCall('/dam/set-dam-operation', data);
        updateDamStatus(telemetry, dam);
        automationOption[dam.DAM_ID] = option;
        toast.success(t('sucessoModoDamAlterado'));
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
      setLoading(false);
    }
  }

  function onWsOpen(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: { dev_id: dam.DAM_ID } }));
  }

  function onWsMessage(response) {
    if (response && response.type === 'damTelemetry' && response.data.dev_id === dam.DAM_ID) {
      setStatus(response.data.status);
      setRssi(response.data.RSSI);
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: {} }));
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  return (
    <Container style={{ padding: '8px 0px 16px 16px' }}>
      {loading ? (
        <div style={{ margin: 'auto 0' }}><Loader /></div>
      ) : (
        <>
          <Title>{t('automacao')}</Title>
          {(profile.manageAllClients || profile.permissions.isInstaller) && (
            <TransparentLink to={`/analise/dispositivo/${dam.DAM_ID}/informacoes`}>
              <Label>{dam.DAM_ID}</Label>
              {dat && <Label>{dat.DAT_ID}</Label>}
            </TransparentLink>
          )}
          <ModeContainer>
            <DamControlOperation
              status={status}
              currentOption={statusOption[dam.DAM_ID]}
              sendOperation={sendDamRelay}
              disabled={!manualCommandsEnabled[dam.DAM_ID]}
            />
          </ModeContainer>
          <StatusContainer>
            <SwitchContainer>
              <LabelSwitch>{t('auto')}</LabelSwitch>
              <ToggleSwitchMini
                checked={mode}
                onClick={onClickSwitchMode}
                disabled={status !== 'ONLINE'}
              />
              <LabelSwitch>{t('manual')}</LabelSwitch>
            </SwitchContainer>
            <IconWatchButton onClick={retrieveDamProgramming}>
              <WatchIcon color={colors.BlueSecondary} />
            </IconWatchButton>
            <IconWiFiRealTime>
              {formatRssiIcon(rssiDesc(rssi, status ?? 'OFFLINE'))}
            </IconWiFiRealTime>
          </StatusContainer>
        </>
      )}
    </Container>
  );
};
