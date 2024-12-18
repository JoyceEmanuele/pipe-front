import { Flex } from 'reflexbox';
import {
  BadSignalIcon, GoodSignalIcon, GreatSignalIcon, NoSignalIcon, RegularSignalIcon,
} from '~/icons';
import { IconBiggerWrapper } from './styles';
import { useEffect, useState } from 'react';
import { t } from 'i18next';

const getLteNetwork = (value) => {
  if (value === 'LTE') return '4G';
  if (value === 'GPRS' || value === 'EDGE') return '3G';
  if (value === 'GSM') return '2G';

  return null;
};

const getLteQuality = (value: number, status: string | null) => {
  if (value < 0 && status === 'ONLINE') {
    if (value <= -100) return 'Ruim';
    if (value <= -90 && value > -100) return 'Regular';
    if (value < -80 && value > -90) return 'Bom';
    if (value >= -80) return 'Excelente';
  }

  return null;
};

function getRssiQuality(RSSI: number, status: string | null) {
  if (RSSI < 0 && status === 'ONLINE') {
    if (RSSI > -50) return 'Excelente';
    if (RSSI > -60) return 'Bom';
    if (RSSI > -70) return 'Regular';
    return 'Ruim';
  }
  return null;
}

export default function MonitoringCard(props: {lastTelemetry: string, status: string | null, tablet: boolean, mobile: boolean, lteNetwork: string, lteRSRP: number | null, RSSI: number | null}): JSX.Element {
  const {
    lastTelemetry, status, tablet, mobile, lteNetwork, lteRSRP, RSSI,
  } = props;
  const lteNetworkRsrpQuality = lteNetwork && lteRSRP && getLteQuality(lteRSRP, status);
  const rssiQuality = RSSI && getRssiQuality(RSSI, status);

  let signal = 0;
  const signals = ['Sem', 'Ruim', 'Regular', 'Bom', 'Excelente'];
  if (rssiQuality) {
    signal = signals.indexOf(rssiQuality) !== -1 ? signals.indexOf(rssiQuality) : 0;
  } else if (lteNetworkRsrpQuality) {
    signal = signals.indexOf(lteNetworkRsrpQuality) !== -1 ? signals.indexOf(lteNetworkRsrpQuality) : 0;
  } else {
    signal = status === 'ONLINE' ? 4 : 0;
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

  const [counterState, setCounter] = useState(0);
  useEffect(() => {
    let timer;
    clearInterval(timer);
    timer = setInterval(() => {
      if (counterState === signal) {
        clearInterval(timer);
        return;
      }
      setCounter((prev) => (signal > prev ? prev + 1 : prev - 1));
    }, (1000 / signal));
    return () => clearInterval(timer);
  }, [counterState, signal]);

  return (
    <Flex flexDirection="column" width={tablet ? '100%' : 'unset'} height={tablet ? '115px' : '135px'} padding={mobile ? '15px 15px 0 15px' : '15px 30px 0px 30px'} alignItems="center" justifyContent="flex-start" style={{ border: '1px solid #d9d9d9', borderRadius: 10 }}>
      <Flex style={{ fontWeight: 'bold' }} marginBottom="10px" alignSelf="flex-start">
        {t('monitoramento')}
      </Flex>
      <Flex flexDirection="row" alignSelf={tablet ? 'flex-start' : 'unset'}>
        <Flex flexDirection="column" paddingRight={mobile ? '10px' : '25px'} marginRight={mobile ? '5px' : '15px'} style={{ borderRight: '1px solid #d9d9d9' }}>
          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Conexão</span>
          <Flex flexDirection="row" fontWeight="bold" color="#363BC4" alignItems="center" justifyContent="center">
            <IconBiggerWrapper>
              {formatRssiIcon(signals[counterState])}
            </IconBiggerWrapper>
            {lteNetworkRsrpQuality && <span style={{ marginLeft: '5px', fontSize: (mobile ? '12px' : 'unset') }}>{lteNetworkRsrpQuality}</span>}
          </Flex>
        </Flex>
        <Flex flexDirection="column" paddingRight="0px" marginRight="0px">
          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{t('ultimaLeitura')}</span>
          <Flex flexDirection="row" alignItems="center" fontSize={mobile ? '12px' : 'unset'} style={{ hyphens: 'auto' }} justifyContent="space-between">
            {lastTelemetry}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
