import { apiCall, ApiResps, apiSpecial } from '~/providers';
import {
  InfoItem, Title,
} from './styles';
import {
  Carousel,
} from '~/components';
import {
  driApplicationOpts,
  driChillerCarrierApplications,
  driFancoilsApplications,
  driMeterApplications,
  driProtocolsOpts,
  driVAVsApplications,
} from '~/helpers/driConfigOptions';
import { Box, Flex } from 'reflexbox';
import { AssetStatus } from '~/components/AssetStatus';
import { useTranslation } from 'react-i18next';
import { DRIScheduleSummary } from '../../SchedulesModals/DRI_Shedule';
import { useEffect, useState } from 'react';

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

export const DRIPRofile = (props: { devInfo: ApiResps['/get-integration-info']['info'], varsCfg?: { application: string, protocol: string, worksheetName: string }|null|undefined }): JSX.Element => {
  const { devInfo, varsCfg } = props;
  const { t } = useTranslation();

  async function handleGetAssetImages() {
    return apiCall('/upload-service/get-images', {
      referenceId: devInfo.DEVICE_ID!,
      referenceType: 'DRIS',
    });
  }
  async function handlePostAssetImage(photo: Blob) {
    return apiSpecial['/upload-service/upload-image'](
      {
        referenceId: devInfo.DEVICE_ID!,
        referenceType: 'DRIS',
        file: photo,
      },
    );
  }
  async function handleDeleteAssetImage(imageUrl: string) {
    return apiCall('/upload-service/delete-image',
      {
        referenceId: devInfo.DEVICE_ID!,
        referenceType: 'DRIS',
        filename: imageUrl,
      });
  }
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const getDriModel = (varsCfg) => (
    getKeyByValue(driMeterApplications, varsCfg.application)
      ?? getKeyByValue(driVAVsApplications, varsCfg.application)
      ?? getKeyByValue(driFancoilsApplications, varsCfg.application)
      ?? varsCfg?.chillerModel
      ?? '-'
  );

  const getDriApplication = (varsCfg) => (
    varsCfg && (
      getKeyByValue(driApplicationOpts, varsCfg.application)
    || (getKeyByValue(driMeterApplications, varsCfg.application) && t('medidorEnergia'))
    || (getKeyByValue(driVAVsApplications, varsCfg.application) && 'VAV')
    || (getKeyByValue(driFancoilsApplications, varsCfg.application) && 'Fancoil')
    || (getKeyByValue(driChillerCarrierApplications, varsCfg.application) && 'Chiller Carrier')
    ) || '-'
  );

  return (
    <Flex flexDirection="row" width="100%" marginTop="10px" flexWrap="wrap" justifyContent="space-between" fontSize="13px">
      <Flex width={windowSize[0] < 1200 ? '100%' : '60%'} flexDirection="column" flex="wrap">
        <Flex style={{ width: '100%' }}>
          <AssetStatus
            key={devInfo.integrId}
            DUT_ID={null}
            DEV_AUT={devInfo.integrId}
            DEV_ID={devInfo.integrId}
            isAutomation
            withoutMarginTop
          />
        </Flex>
        <Flex flexDirection="row" flexWrap="wrap" mb="20px" mt="20px">
          <Flex flexWrap="wrap" flexDirection="column">
            <Title>{t('informacoes')}</Title>
            <InfoItem>
              <b>{t('fonteDados')}</b>
              <br />
              {devInfo.dataSource || '-'}
            </InfoItem>
            <Flex flexWrap="wrap">
              <InfoItem>
                <b>{`${t('aplicacao')}:`}</b>
                <br />
                {getDriApplication(varsCfg)}
              </InfoItem>
              {varsCfg && (
                getKeyByValue(driMeterApplications, varsCfg.application)
              || getKeyByValue(driVAVsApplications, varsCfg.application)
              || getKeyByValue(driFancoilsApplications, varsCfg.application)
              || getKeyByValue(driChillerCarrierApplications, varsCfg.application)
              ) && (
                <InfoItem>
                  <b>{`${t('modelo')}:`}</b>
                  <br />
                  {getDriModel(varsCfg)}
                </InfoItem>
              )}
            </Flex>

            <Flex flexWrap="wrap">
              <InfoItem>
                <b>{`${t('protocoloComunicacao')}:`}</b>
                <br />
                {varsCfg && getKeyByValue(driProtocolsOpts, varsCfg.protocol) || '-'}
              </InfoItem>
              <InfoItem>
                <b>{`${t('planilha')}:`}</b>
                <br />
                {varsCfg?.worksheetName ?? '-'}
              </InfoItem>
            </Flex>

          </Flex>

          {(['fancoil', 'carrier-ecosplit'].includes(varsCfg?.application ?? '')) && (
          <Flex flexDirection="column">
            <Title>Funcionamento</Title>
            <DRIScheduleSummary driId={devInfo.dataSource} devInfo={devInfo} varsCfg={varsCfg} layout="large-btn" />
          </Flex>
          )}
        </Flex>

      </Flex>
      <Box width={[1, 1, 1, 1, 1, 1 / 3]}>
        <Flex
          flexDirection="column"
          alignItems={['center', 'center', 'center', 'center', 'center', 'flex-end']}
        >
          <Box width={1} maxWidth="415px" justifyContent="center" alignItems="center">
            <Carousel
              getImages={handleGetAssetImages}
              postImage={handlePostAssetImage}
              deleteImage={handleDeleteAssetImage}
            />
          </Box>
        </Flex>
      </Box>
    </Flex>

  );
};
