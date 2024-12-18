import { CSSProperties, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from 'reflexbox';
import {
  BadSignalIcon, GoodSignalIcon, GreatSignalIcon, NoSignalIcon, RegularSignalIcon,
} from 'icons';
import { colors } from 'styles/colors';
import { IconWrapper } from '../styles';

interface RssiProperties {
  showLabel?: boolean;
  rssi?: string;
  style?: CSSProperties;
}

export const RssiComponent = ({
  rssi,
  style,
  showLabel = false,
}: RssiProperties): ReactElement => {
  const { t } = useTranslation();

  function rssiText() {
    return rssi || '-';
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

  return (
    <Flex justifyContent="center" alignItems="center" style={style} flexDirection="column">
      <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
        {t('status')}
      </span>
      <Flex style={{ columnGap: 4 }} alignItems="center" justifyContent="center">
        <IconWrapper>
          {formatRssiIcon(rssiText())}
        </IconWrapper>
        {showLabel && <span style={{ fontSize: '12px' }}>{rssi}</span>}
      </Flex>
    </Flex>
  );
};
