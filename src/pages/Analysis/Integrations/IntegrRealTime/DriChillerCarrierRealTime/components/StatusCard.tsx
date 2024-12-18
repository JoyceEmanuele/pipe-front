import { Flex } from 'reflexbox';
import {
  BlackBlob,
  GreenBlob, GreyBlob, RedBlob, YellowBlob,
} from './styles';
import ProgressBar from './ProgressBar';
import { t } from 'i18next';

const getAlarmInfo = (value: number | null) => {
  if (value === 0) { // Normal
    return {
      label: t('semAlarmes'),
      blob: <GreenBlob />,
    };
  }
  if (value === 1) { // Alert
    return {
      label: t('emAlerta'),
      blob: <YellowBlob />,
    };
  }
  if (value === 2) { // Alarm
    return {
      label: t('emAlarme'),
      blob: <RedBlob />,
    };
  }

  return {
    label: t('semInformacao'),
    blob: <GreyBlob />,
  };
};

export const getGeralStatusInfo = (value: number | null) => {
  switch (value) {
    case 0: return { label: t('desligadoMinusculo') }; // Start
    case 1: return { label: t('emFuncionamento') }; // Stop
    case 2: return { label: t('emParada') }; // Stop
    case 3: return { label: t('emPartida') }; // Stop
    case 4: return { label: t('Desarmado') }; // Stop
    case 5: return { label: t('pronto') }; // Stop
    case 6: return { label: t('forcado') }; // Stop
    case 7: return { label: t('emDescongelamento') }; // Stop
    case 8: return { label: t('emTesteCarga') }; // Stop
    case 9: return { label: t('teste') }; // Stop
    default: return { label: t('semInformacao') };
  }
};

const getEmergencyStopInfo = (value: number | null) => {
  if (value === 0) { // Off
    return {
      label: t('desligadoMinusculo'),
      blob: <BlackBlob />,
    };
  }
  if (value === 1) { // On
    return {
      label: t('emFuncionamento'),
      blob: <RedBlob />,
    };
  }
  if (value === 2) { // Off
    return {
      label: t('parando'),
      blob: <BlackBlob />,
    };
  }
  if (value === 3) { // On
    return {
      label: t('atrasado'),
      blob: <RedBlob />,
    };
  }
  if (value === 4) { // Off
    return {
      label: t('desarmado'),
      blob: <BlackBlob />,
    };
  }
  if (value === 5) { // On
    return {
      label: t('preparado'),
      blob: <RedBlob />,
    };
  }
  if (value === 6) { // Off
    return {
      label: t('forcado'),
      blob: <BlackBlob />,
    };
  }
  if (value === 7) { // On
    return {
      label: t('descongelando'),
      blob: <RedBlob />,
    };
  }
  if (value === 8) { // Off
    return {
      label: t('testeCorrida'),
      blob: <BlackBlob />,
    };
  }
  if (value === 9) { // On
    return {
      label: t('teste'),
      blob: <RedBlob />,
    };
  }

  return {
    label: t('semInformacao'),
    blob: <GreyBlob />,
  };
};

export default function StatusCard(props: {totalCapacity: number, geralStatus: number | null, alarm: number | null, emergencyStop: number | null, tablet: boolean, mobile: boolean, model?: string}): JSX.Element {
  const {
    totalCapacity, geralStatus, alarm, emergencyStop, tablet, mobile, model,
  } = props;

  const handleFontSize = () => (mobile ? '12px' : 'unset');
  const handleSpaceRight = () => (alarm === 2 ? '20px' : '0px');

  return (
    <Flex flexDirection="column" height="135px" width={tablet ? '100%' : 'unset'} padding={mobile ? '15px 15px 0 15px' : '15px 30px 0px 30px'} alignItems="center" justifyContent="flex-start" style={{ border: '1px solid #d9d9d9', borderRadius: 10 }}>
      <Flex style={{ fontWeight: 'bold' }} marginBottom="10px" alignSelf="flex-start">
        {t('status')}
      </Flex>
      <Flex flexDirection="row" alignSelf={tablet ? 'flex-start' : 'unset'}>
        <Flex flexDirection="column" paddingRight={mobile ? '0px' : '20px'} marginRight={mobile ? '10px' : '20px'} style={{ borderRight: !model?.startsWith('chiller-carrier-30xa') ? '1px solid #d9d9d9' : '0px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{t('geral')}</span>
          <Flex flexDirection="row" alignItems="center" justifyContent="space-between" fontSize={handleFontSize()} marginRight={mobile ? '6px' : '15px'}>
            {getGeralStatusInfo(geralStatus).label}
          </Flex>
        </Flex>
        {!model?.startsWith('chiller-carrier-30xa')
          && (
          <>
            <Flex flexDirection="column" paddingRight={handleSpaceRight()} marginRight={handleSpaceRight()} style={{ borderRight: (alarm === 2 ? '1px solid #d9d9d9' : 'none') }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{t('alarme')}</span>
              <Flex flexDirection="row" alignItems="center" justifyContent="space-between" fontSize={handleFontSize()} marginRight={mobile ? '6px' : '15px'}>
                {getAlarmInfo(alarm).blob}
                {getAlarmInfo(alarm).label}
              </Flex>
            </Flex>
            {(alarm === 2) && (
            <Flex flexDirection="column" paddingRight="0px">
              <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '-5px' }}>{t('paradaDeEmergencia')}</span>
              <Flex flexDirection="row" alignItems="center" justifyContent="space-between" fontSize={handleFontSize()}>
                {getEmergencyStopInfo(emergencyStop).blob}
                {getEmergencyStopInfo(emergencyStop).label}
              </Flex>
            </Flex>
            )}
          </>
          )}
      </Flex>
      <Flex flexDirection="row" width="100%" alignSelf="flex-start">
        <ProgressBar title={t('capacidadeTotalLabel')} progress={Math.floor(totalCapacity)} disabled={(!totalCapacity) || (!geralStatus && geralStatus !== 0)} />
      </Flex>
    </Flex>
  );
}
