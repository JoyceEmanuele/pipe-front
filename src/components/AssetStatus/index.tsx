import { useEffect } from 'react';
import moment from 'moment';
import { useStateVar } from 'helpers/useStateVar';
import { getCachedDevInfo } from 'helpers/cachedStorage';
import { useWebSocketLazy } from 'helpers/wsConnection';
import { Flex } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import i18n from 'i18n';
import {
  IconWrapper,
  Data,
  DataText,
  StatusBox,
} from './styles';
import { colors } from 'styles/colors';
import { toast } from 'react-toastify';
import { apiCall } from '../../providers';

import {
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
} from '../../icons';

interface ComponentProps {
  DEV_ID: string|null,
  isAutomation: boolean,
  DEV_AUT: string|null,
  DUT_ID: string|null,
  withoutMarginTop?: boolean
  onlyIcon?: boolean
}

const getLteQuality = (value: number, status: string | null) => {
  if (value < 0 && status === 'ONLINE') {
    if (value <= -100) return 'Ruim';
    if (value <= -90 && value > -100) return 'Regular';
    if (value < -80 && value > -90) return 'Bom';
    if (value >= -80) return 'Excelente';
  }

  return null;
};

export const AssetStatus = (props: ComponentProps): JSX.Element => {
  const [state, render] = useStateVar(() => ({
    TIMESTAMP: null,
    LAST_TELEMETRY: null as string|null,
    STATUS: null as string|null,
    RSSI: null as string|null,
    oldDate: false as boolean,
    lteQuality: '' as string,
  }));
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();
  useEffect(() => {
    (async function () {
      try {
        if (props.DEV_ID) {
          const devInfo = (await getCachedDevInfo(props.DEV_ID, { forceFresh: true }))!;

          if (devInfo.lastMessageTS) state.LAST_TELEMETRY = devInfo.lastMessageTS;

          const lteNetworkRsrpQuality = devInfo?.LTE_NETWORK && devInfo?.LTE_RSRP && getLteQuality(devInfo?.LTE_RSRP, devInfo?.status);
          state.lteQuality = lteNetworkRsrpQuality;

          render();
        }
        wsl.start(onWsOpen, onWsMessage, beforeWsClose);
      } catch (err) {
        toast.error(t('erroDadosDispositivo'));
        console.log(err);
      }
    }());
  }, [props.DEV_ID]);

  const wsl = useWebSocketLazy();
  function onWsOpen(wsConn) {
    if (!props.DEV_ID) return;
    if (!props.isAutomation && props.DEV_ID.startsWith('DAC')) wsConn.send({ type: 'subscribeTelemetry', data: { dac_id: props.DEV_ID } });
    else if (props.isAutomation && props.DEV_AUT && (props.DEV_AUT.startsWith('DAM') || props.DEV_AUT.startsWith('DAC'))) wsConn.send({ type: 'subscribeStatus', data: { dam_id: props.DEV_AUT } });
    else if (props.isAutomation && props.DEV_AUT && props.DEV_AUT.startsWith('DRI')) wsConn.send({ type: 'driSubscribeRealTime', data: { DRI_ID: props.DEV_AUT } });
    else if (props.isAutomation && props.DEV_AUT && props.DEV_AUT.startsWith('DMT')) wsConn.send({ type: 'dmtSubscribeRealTime', data: { DMT_CODE: props.DEV_AUT } });
    else if (props.isAutomation && props.DEV_AUT && props.DEV_AUT.startsWith('DAL')) wsConn.send({ type: 'dalSubscribeRealTime', data: { DAL_CODE: props.DEV_AUT } });
    else wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: props.DEV_ID } });
  }

  function handleDacIdMessage(payload) {
    if (payload.data.dac_id === props.DEV_ID) {
      if (payload.type === 'dacTelemetry') {
        verifyAndUpdateDataStatusAndRSSI(payload);
      }
      if (payload.type === 'dacOnlineStatus') {
        verifyAndUpdateDataStatus(payload);
        render();
      }
    }
  }

  function handleDevIdMessage(payload) {
    if (payload.data.dev_id === props.DEV_ID) {
      if (payload.type === 'damStatus') {
        if (payload.data.deviceTimestamp) state.TIMESTAMP = payload.data.deviceTimestamp;
        verifyAndUpdateDataStatusAndRSSI(payload);
      }
      if (payload.type === 'dutTelemetry') {
        verifyAndUpdateDataStatusAndRSSI(payload);
        render();
      }
      if (payload.type === 'dmtTelemetry') {
        verifyAndUpdateDataStatusAndRSSI(payload);
        render();
      }
      if (payload.type === 'driTelemetry') {
        verifyAndUpdateDataStatusAndRSSI(payload);
      }
      if (payload.type === 'dalTelemetry') {
        verifyAndUpdateDataStatusAndRSSI(payload);
      }
    }
  }

  function onWsMessage(payload) {
    if (!payload) return;
    handleDacIdMessage(payload);
    handleDevIdMessage(payload);
  }

  const verifyAndUpdateDataStatus = (payload) => {
    if (payload.data.status) state.STATUS = payload.data.status;
    if (payload.data.timestamp || payload.data.deviceTimestamp) {
      const timestamp = payload.data.timestamp || payload.data.deviceTimestamp;
      const data = moment(timestamp);
      payload.data.timestamp = data;
      state.LAST_TELEMETRY = payload.data.timestamp;
      checkLastTemetry(state.LAST_TELEMETRY);
    }
  };

  const verifyAndUpdateDataStatusAndRSSI = (payload) => {
    verifyAndUpdateDataStatus(payload);
    if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
    else {
      state.RSSI = state.lteQuality || null;
    }
    render();
  };

  function beforeWsClose(wsConn) {
    if (!props.DEV_ID) return;
    if (!props.isAutomation && props.DEV_ID) wsConn.send({ type: 'subscribeTelemetry', data: {} });
    else if (props.isAutomation && props.DEV_AUT && (props.DEV_AUT.startsWith('DAM') || props.DEV_AUT?.startsWith('DAC'))) wsConn.send({ type: 'unsubscribeStatus' });
    else if (props.isAutomation && props.DUT_ID) wsConn.send({ type: 'dutUnsubscribeRealTime' });
    else if (props.isAutomation && props.DEV_AUT && (props.DEV_AUT.startsWith('DRI'))) wsConn.send({ type: 'driUnsubscribeRealTime' });
    else if (props.isAutomation && props.DEV_AUT && (props.DEV_AUT.startsWith('DMT'))) wsConn.send({ type: 'dmtUnsubscribeRealTime' });
  }

  function rssiDesc(RSSI: number, status: string) {
    if (RSSI < 0 && status === 'ONLINE') {
      if (RSSI > -50) return t('excelente');
      if (RSSI > -60) return t('bom');
      if (RSSI > -70) return t('regular');
      return t('ruim');
    }
    return '-';
  }

  function formatRssiIcon(rssi: string) {
    switch (rssi) {
      case t('excelente'): return <GreatSignalIcon />;
      case t('bom'): return <GoodSignalIcon />;
      case t('regular'): return <RegularSignalIcon />;
      case t('ruim'): return <BadSignalIcon />;
      default: return <NoSignalIcon />;
    }
  }

  function statusText() {
    return (!state.oldDate && state.STATUS) || 'OFFLINE';
  }

  function rssiText() {
    return (!state.oldDate && state.RSSI) || '-';
  }

  function lastTelemetryText() {
    return (state.LAST_TELEMETRY && moment(state.LAST_TELEMETRY).format('lll')) || t('semInformacao');
  }

  function checkLastTemetry(lastTelemetry:string | null) {
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

  if (props.onlyIcon) {
    return (
      <div
        style={{
          border: '1px solid #D7D7D7',
          borderRadius: 8,
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <strong>{t('status')}</strong>
        <IconWrapper>
          {formatRssiIcon(rssiText())}
        </IconWrapper>
      </div>
    );
  }
  const isDesktop = window.matchMedia('(min-width: 1039px)');
  const isMobile = !isDesktop.matches;
  return (
    <Flex
      flexWrap={isMobile ? 'wrap' : 'nowrap'}
      flexDirection="row"
      height={isMobile ? '' : '78px'}
      width={isMobile ? '100%' : '424px'}
      alignItems="start"
      mt={props.withoutMarginTop ? 0 : 4}
      mr={0}
      style={{
        border: '1px solid lightgrey',
        borderRadius: '10px',
        fontSize: '12px',
      }}
    >
      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left" mimWidth="50%">
        <div style={{ marginLeft: '10px', marginTop: '12px' }}>
          <Data>
            <DataText style={{ marginLeft: '7px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
              {t('status')}
            </DataText>
            <StatusBox status={statusText()}>{statusText()}</StatusBox>
          </Data>
        </div>
      </Flex>

      {(props.DEV_ID && props.DEV_ID.startsWith('DRI')) && (
      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left" mimWidth="50%">
        <div style={{ marginLeft: '10px', marginTop: '12px' }}>
          <span>
            <strong>
              {`${t('intensidade')}:`}
            </strong>
            <br />
            {(!state.oldDate && state.RSSI && state.RSSI !== '-') ? state.RSSI : t('semSinal')}
          </span>
        </div>
      </Flex>
      )}

      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left" mr={2} width="10%">
        <div style={{ marginTop: '28px' }}>
          {(rssiText() != null)
      && (
        <IconWrapper>
          {formatRssiIcon(rssiText())}
        </IconWrapper>
      )}
        </div>
      </Flex>
      <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="0">
        <div style={{
          marginTop: '10px', borderLeft: '2px solid lightgrey', height: '52px',
        }}
        />
      </Flex>
      <Flex flexWrap="wrap" flexDirection="column" ml={2} alignItems="left" width="40%">
        <div style={{ marginTop: '12px' }}>
          <Data>
            <DataText color={colors.Black} fontWeight="bold" fontSize="12px">
              {t('ultimaLeitura')}
            </DataText>
            <DataText fontSize="12px">
              {lastTelemetryText()}
            </DataText>
          </Data>
        </div>
      </Flex>
    </Flex>
  );
};
