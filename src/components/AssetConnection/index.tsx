import { useEffect } from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocketLazy } from 'helpers/wsConnection';
import { toast } from 'react-toastify';

import {
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
} from '../../icons';
import { useTranslation } from 'react-i18next';

interface ComponentProps {
  DEV_ID?: string|null,
  isAutomation: boolean,
  DEV_AUT?: string|null,
  DUT_ID: string|null,
}

export const AssetConnection = (props: ComponentProps): JSX.Element => {
  const [state, render] = useStateVar(() => ({
    RSSI: null as string|null,
    STATUS: null as string|null,
  }));
  const { t } = useTranslation();
  useEffect(() => {
    (async function () {
      try {
        wsl.start(onWsOpen, onWsMessage, beforeWsClose);
      } catch (err) {
        toast.error(t('erroStatusDoDispositivo'));
        console.log(err);
      }
    }());
  }, [props.DEV_ID]);

  const wsl = useWebSocketLazy();
  function onWsOpen(wsConn) {
    if (!props.DEV_ID) return;
    if (!props.isAutomation && props.DEV_ID.startsWith('DAC')) wsConn.send({ type: 'subscribeTelemetry', data: { dac_id: props.DEV_ID } });
    else if (props.isAutomation && props.DEV_AUT && (props.DEV_AUT.startsWith('DAM') || props.DEV_AUT.startsWith('DAC'))) wsConn.send({ type: 'subscribeStatus', data: { dam_id: props.DEV_ID } });
    else if (props.isAutomation && props.DEV_ID.startsWith('DRI')) wsConn.send({ type: 'driSubscribeRealTime', data: { DRI_ID: props.DEV_ID } });
    else if (props.isAutomation && props.DEV_ID.startsWith('DMT')) wsConn.send({ type: 'dmtSubscribeRealTime', data: { DMT_CODE: props.DEV_ID } });
    else if (props.isAutomation && props.DEV_ID.startsWith('DAL')) wsConn.send({ type: 'dalSubscribeRealTime', data: { DAL_CODE: props.DEV_ID } });
    else wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: props.DEV_ID } });
  }

  const verifyAndUpdateDataStatus = (payload) => {
    if (payload.data.status) {
      state.STATUS = payload.data.status;
    }
  };

  function handleDamStatusMessage(payload) {
    if (payload.type === 'damStatus' && payload.data.dev_id === props.DEV_ID) {
      verifyAndUpdateDataStatus(payload);
      if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
      render();
    }
  }

  function handleDacTelemetryMessage(payload) {
    if (payload.type === 'dacTelemetry' && payload.data.dac_id === props.DEV_ID) {
      verifyAndUpdateDataStatus(payload);
      if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
      render();
    }
  }

  function handleDacOnlineStatusMessage(payload) {
    if (payload.type === 'dacOnlineStatus' && payload.data.dac_id === props.DEV_ID) {
      verifyAndUpdateDataStatus(payload);
      render();
    }
  }

  function handleDevsTelemetryMessage(payload) {
    if (
      (payload.type === 'dutTelemetry' || payload.type === 'driTelemetry' || payload.type === 'dalTelemetry' || payload.type === 'dmtTelemetry')
      && payload.data.dev_id === props.DEV_ID
    ) {
      verifyAndUpdateDataStatus(payload);
      if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
      render();
    }
  }

  function onWsMessage(payload) {
    if (!payload) return;
    handleDamStatusMessage(payload);
    handleDacTelemetryMessage(payload);
    handleDacOnlineStatusMessage(payload);
    handleDevsTelemetryMessage(payload);
  }

  function beforeWsClose(wsConn) {
    if (!props.DEV_ID) return;
    if (!props.isAutomation && props.DEV_ID) wsConn.send({ type: 'subscribeTelemetry', data: {} });
    else if (props.isAutomation && props.DEV_AUT && (props.DEV_AUT.startsWith('DAM') || props.DEV_AUT?.startsWith('DAC'))) wsConn.send({ type: 'unsubscribeStatus' });
    else if (props.isAutomation && props.DUT_ID) wsConn.send({ type: 'dutUnsubscribeRealTime' });
    else if (props.isAutomation && props.DEV_ID.startsWith('DRI')) wsConn.send({ type: 'driUnsubscribeRealTime' });
    else if (props.isAutomation && props.DEV_ID.startsWith('DMT')) wsConn.send({ type: 'dmtUnsubscribeRealTime' });
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

  function formatRssiIcon(rssi: string|null) {
    switch (rssi) {
      case 'Excelente': return <GreatSignalIcon />;
      case 'Bom': return <GoodSignalIcon />;
      case 'Regular': return <RegularSignalIcon />;
      case 'Ruim': return <BadSignalIcon />;
      default: return <NoSignalIcon />;
    }
  }

  function rssiText() {
    return state.RSSI || '-';
  }

  return (
    <>
      {(rssiText() != null)
        && (
          formatRssiIcon(state.RSSI)
        )}
    </>
  );
};
