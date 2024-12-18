import moment from 'moment';
import { useEffect, useState } from 'react';
import { Box, Flex } from 'reflexbox';
import { Carousel } from '~/components';
import { apiCall, ApiResps, apiSpecial } from '~/providers';
import { colors } from '~/styles/colors';
import { Data, DataText } from '../../Assets/AssetInfo/styles';
import { useTranslation } from 'react-i18next';
import { thousandPointFormat } from '~/helpers/thousandFormatNumber';
import { toast } from 'react-toastify';
import i18n from '~/i18n';
import { useWebSocket } from '~/helpers/wsConnection';
import {
  RegularSignalIcon,
  NoSignalIcon,
  BadSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
} from '~/icons';
import { IconWrapper, StatusDevice } from './styles';

export const IntegrWaterInfo = (props: {
  devInfo: ApiResps['/get-integration-info']['info'],
  integrId: string,
}): JSX.Element => {
  const { t } = useTranslation();
  const { devInfo, integrId } = props;
  const [bateryState, setBateryState] = useState('');
  const [rfModule, setRfModule] = useState('');
  const [lastReadingDate, setLastReadingDate] = useState<string|null>(null);
  const [lastRSSI, setLastRSSI] = useState(0);
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');

  useEffect(() => {
    (async () => {
      if (!integrId.startsWith('DMA')) {
        const laagerUsage = await apiCall('/laager/get-informations', {
          unit_id: integrId,
        });

        setBateryState(laagerUsage.batery_state);
        setRfModule(laagerUsage.module_rf.toString());
        await verifyLastReadingDateLaager(integrId);
      }
    })();
  }, []);

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  function getRssiIcon(RSSI: number, status: string) {
    if (RSSI < 0 && status === 'ONLINE') {
      if (RSSI > -50) return <GreatSignalIcon />;
      if (RSSI > -60) return <GoodSignalIcon />;
      if (RSSI > -70) return <RegularSignalIcon />;
      return <BadSignalIcon />;
    }
    return <NoSignalIcon />;
  }

  async function verifyLastReadingDateLaager(device_code: string) {
    try {
      const response = await apiCall('/laager/get-informations', {
        unit_id: device_code,
      });
      if (response?.last_reading_date) {
        setLastReadingDate(moment(response.last_reading_date).format('lll'));
        setLastRSSI(-1);
      } else {
        setLastReadingDate(t('erroNaoFoiRealizadaNenhumaLeitura'));
      }
    } catch (error) {
      toast.error(t('erroCarregarInformacoes'));
      console.error(error);
    }
  }

  const changeSamplingPeriod = async (interval: number) => {
    try {
      await apiCall('/dma/set-sampling-period', { dmaId: integrId, samplingPeriod: interval });
    } catch (err) {
      toast.error(t('erroTelemetrias'));
    }
  };

  function onWsOpen(wsConn) {
    if (integrId?.startsWith('DMA')) {
      wsConn.send({ type: 'dmaSubscribeRealTime', data: { DMA_ID: integrId } });
      changeSamplingPeriod(10);
    }
  }

  function onWsMessage(response) {
    if (response && response.type === 'dmaTelemetry') {
      if (!response.data?.saved_data) {
        setLastReadingDate(moment(response.data?.timestamp).format('lll'));
        setLastRSSI(response.data?.RSSI ?? 0);
      }
    }
  }

  function beforeWsClose(wsConn) {
    changeSamplingPeriod(900);
    wsConn.send({ type: 'dmaUnsubscribeRealTime' });
  }

  async function handleGetAssetImages() {
    if (integrId.startsWith('DMA')) {
      return apiCall('/upload-service/get-images', {
        referenceId: devInfo.DEVICE_ID!,
        referenceType: 'DMAS',
      });
    }
    return apiCall('/upload-service/get-images', {
      referenceId: devInfo.DEVICE_ID!,
      referenceType: 'LAAGER',
    });
  }
  async function handlePostAssetImage(photo: Blob) {
    if (integrId.startsWith('DMA')) {
      return apiSpecial['/upload-service/upload-image'](
        {
          referenceId: devInfo.DEVICE_ID!,
          referenceType: 'DMAS',
          file: photo,
        },
      );
    }

    return apiSpecial['/upload-service/upload-image'](
      {
        referenceId: devInfo.DEVICE_ID!,
        referenceType: 'LAAGER',
        file: photo,
      },
    );
  }
  async function handleDeleteAssetImage(imageUrl: string) {
    if (integrId.startsWith('DMA')) {
      return apiCall('/upload-service/delete-image', {
        referenceId: devInfo.DEVICE_ID!,
        referenceType: 'DMAS',
        filename: imageUrl,
      });
    }

    return apiCall('/upload-service/delete-image', {
      referenceId: devInfo.DEVICE_ID!,
      referenceType: 'LAAGER',
      filename: imageUrl,
    });
  }

  const handleDate = () => (
    devInfo.installationDate ? moment(devInfo.installationDate?.substring(0, 10)).format('ll') === t('dataInvalida') ? '-' : moment(devInfo.installationDate?.substring(0, 10)).format('ll') : '-'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Flex
        flexDirection={['column', 'column', 'column', 'column', 'column', 'row']}
        justifyContent="space-between"
        alignItems="flex-start"
        wrap="wrap"
      >
        <Flex flexDirection="column" order={['1', '1', '1', '1', '1', '0']}>
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {integrId === '' ? 'Ambiente virtual sem Dispositivo' : integrId.startsWith('DMA') ? 'DMA ID' : t('idDaUnidadeLaager')}
            </DataText>
            <DataText>{devInfo.integrId || '-'}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('fabricante')}
            </DataText>
            <DataText>{devInfo.supplier || '-'}</DataText>
          </Data>

          {!integrId.startsWith('DMA') && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('moduloRf')}
            </DataText>
            <DataText>{rfModule || '-'}</DataText>
          </Data>
          )}

          {!integrId.startsWith('DMA') && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('statusBateria')}
            </DataText>
            <DataText>{bateryState || '-'}</DataText>
          </Data>
          )}

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('hidrometro')}
            </DataText>
            <DataText>{devInfo.hydrometerModel || '-'}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('localDeInstalacao')}
            </DataText>
            <DataText>{devInfo.installationLocation || '-'}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('dataInstalacao')}
            </DataText>
            <DataText>{handleDate()}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('capacidadeTotalReservatorios')}
            </DataText>
            <DataText>{thousandPointFormat(devInfo.totalCapacity, true) || '-'}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('totalDeReservatorios')}
            </DataText>
            <DataText>{devInfo.quantityOfReservoirs || '-'}</DataText>
          </Data>
        </Flex>

        <Box
          mt={['16px', '16px', '0']}
          mb="10px"
          flexShrink={0}
        >
          <StatusDevice>
            <Flex alignItems="center">
              <div
                style={{
                  padding: '10px 22px 10px 0',
                  borderRight: '2px solid #D9DADB',
                }}
              >
                <span>
                  <b>{t('status')}</b>
                </span>
                <IconWrapper>
                  {getRssiIcon(lastRSSI, devInfo.status)}
                </IconWrapper>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginLeft: '22px',
                }}
              >
                <span>
                  <b>{t('ultimaLeitura')}</b>
                </span>
                <span>{lastReadingDate ?? '-'}</span>
              </div>
            </Flex>
          </StatusDevice>
        </Box>

        <Box width={[1, 1, 1, 1, 1, 1 / 2]} order={['1', '1', '1', '1', '1', '0']}>
          <Flex
            flexDirection="column"
            alignItems={['flex-start', 'flex-start', 'flex-start', 'flex-start', 'flex-start', 'flex-end']}
          >
            {integrId !== '' && (
            <Box width={1} maxWidth="415px" mb="16px" justifyContent="center" alignItems="center">
              <Carousel
                getImages={handleGetAssetImages}
                postImage={handlePostAssetImage}
                deleteImage={handleDeleteAssetImage}
              />
            </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </div>
  );
};
