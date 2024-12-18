import { useState } from 'react';
import { Box, Flex } from 'reflexbox';
import { useHistory, useRouteMatch } from 'react-router';
import { AssetStatus } from '~/components/AssetStatus';
import {
  Carousel, Button,
} from '~/components';
import {
  Title, InfoItem,
} from './styles';
import { useTranslation } from 'react-i18next';
import { apiCall, apiSpecial } from '~/providers';
import { useStateVar } from 'helpers/useStateVar';
import { getUserProfile } from 'helpers/userProfile';
import { UtilityTree } from 'components/UtilityTree';
import { NobreakInfo } from '../Utilities/Nobreak/NobreakInfo';
import { IlluminationInfo } from '../Utilities/Illumination/IlluminationInfo';

export const RenderImagesDmtNobreak = (props: { devCode: string, utilSelected?: boolean, nobreakId?: number, deviceId: number }) : JSX.Element => {
  const {
    utilSelected,
    nobreakId,
    deviceId,
  } = props;

  async function handleGetImages() {
    if (utilSelected && nobreakId) {
      return apiCall('/upload-service/get-images',
        {
          referenceId: nobreakId,
          referenceType: 'NOBREAKS',
        });
    }
    return apiCall('/upload-service/get-images',
      {
        referenceId: deviceId,
        referenceType: 'DMTS',
      });
  }

  async function handlePostImage(photo: Blob) {
    if (utilSelected && nobreakId) {
      return apiSpecial['/upload-service/upload-image'](
        {
          referenceId: nobreakId,
          referenceType: 'NOBREAKS',
          file: photo,
        },
      );
    }
    return apiSpecial['/upload-service/upload-image'](
      {
        referenceId: deviceId,
        referenceType: 'DMTS',
        file: photo,
      },
    );
  }

  async function handleDeleteImage(imageUrl: string) {
    if (utilSelected && nobreakId) {
      return apiCall('/upload-service/delete-image',
        {
          referenceId: nobreakId,
          referenceType: 'NOBREAKS',
          filename: imageUrl,
        });
    }
    return apiCall('/upload-service/delete-image',
      {
        referenceId: deviceId,
        referenceType: 'DMTS',
        filename: imageUrl,
      });
  }
  return (
    <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb="20px" mt="20px">
      <Flex
        flexDirection="column"
        alignItems={['center', 'center', 'center', 'center', 'flex-end', 'flex-end']}
      >
        <Box width={1} minWidth="305px" maxWidth="415px" justifyContent="center" alignItems="center">
          <Carousel
            forceReload={nobreakId}
            getImages={handleGetImages}
            postImage={handlePostImage}
            deleteImage={handleDeleteImage}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export const DmtInfo = ({ dmtInfo }): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const match = useRouteMatch<{ devId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const [state, render] = useStateVar({
    devId: dmtInfo.DEV_ID,
    linkBase: match.url.split(`/${match.params.devId}`)[0],
    utils: dmtInfo.dmt?.utilitiesList || [],
    utilSelected: false,
    selectedIndex: -1 as number,
    deviceSelected: true as boolean,
    isLoading: false,
  });

  async function selectedCard(position: number) {
    state.selectedIndex = position;
    state.utilSelected = position > -1;
    state.deviceSelected = position === -2;
    render();
  }

  function renderDeviceInfo() {
    return (
      <Flex flexDirection="row" width="100%" marginTop="10px" flexWrap="wrap" justifyContent="space-between" fontSize="13px" padding="20px">
        <Flex width="100%" height="100%" flexDirection="column" flex="wrap">
          <Flex style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Flex flexDirection="column">
              <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{t('dispositivo')}</span>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{dmtInfo.DEV_ID}</span>
            </Flex>
            <AssetStatus
              key={dmtInfo.DEV_ID}
              DUT_ID={null}
              DEV_AUT={dmtInfo.DEV_ID}
              DEV_ID={dmtInfo.DEV_ID}
              isAutomation
              withoutMarginTop
            />
          </Flex>
          <div style={{ border: '1px solid #DEDEDE', marginTop: '20px' }} />
          <Flex justifyContent="space-between" flexWrap="wrap">
            <Flex flexDirection="row" flexWrap="wrap" mb="20px" mt="20px">
              <Flex flexWrap="wrap" flexDirection="column">
                <Title>{t('informacoes')}</Title>
                <InfoItem>
                  <b>{t('estado')}</b>
                  <br />
                  {dmtInfo.STATE_ID || '-'}
                </InfoItem>

                <InfoItem>
                  <b>{t('cidade')}</b>
                  <br />
                  {dmtInfo.CITY_NAME || '-'}
                </InfoItem>

                <InfoItem>
                  <b>{t('cliente')}</b>
                  <br />
                  {dmtInfo.CLIENT_NAME || '-'}
                </InfoItem>

                <InfoItem>
                  <b>{t('unidade')}</b>
                  <br />
                  {dmtInfo.UNIT_NAME || '-'}
                </InfoItem>

                <Title>{t('associacoes')}</Title>
                <InfoItem>
                  <b>{t('feedbacksEmUso')}</b>
                  <br />
                  {dmtInfo.dmt.utilitiesList.filter((x) => x.PORT).reduce((portList, util) => {
                    portList.push(`F${util.PORT}`);
                    return portList;
                  }, []).join(', ').replace(/,([^,]*)$/, ` ${t('e')}$1`) || '-'}
                </InfoItem>

                {(profile.manageAllClients || profile.permissions.isInstaller) && (
                  <div style={{ justifyContent: 'flex-start', display: 'flex' }}>
                    <Button
                      variant="primary"
                      style={{
                        marginTop: '15px', maxWidth: '100px',
                      }}
                      onClick={() => history.push(`${state.linkBase}/${state.devId}/editar`)}
                    >
                      {t('editar')}
                    </Button>
                  </div>
                )}
              </Flex>
            </Flex>

            <RenderImagesDmtNobreak devCode={dmtInfo.DEV_ID} deviceId={dmtInfo.DEVICE_ID} />
          </Flex>
        </Flex>
      </Flex>
    );
  }

  if (profile.manageAllClients) {
    return (
      <div style={{ marginTop: '16px', width: '100%' }}>
        <Flex flexWrap="wrap" flexDirection="row" height="100%" justifyContent="space-between">
          <Flex flexWrap="wrap" flexDirection="column" height="100%" alignItems="left" width="378px" style={{ borderRight: '1px solid lightgrey' }}>
            <div style={{ borderBottom: '1px solid lightgrey', paddingBottom: '15px' }}>
              <strong style={{ marginLeft: '25px', fontSize: '90%' }}>
                {t('dispositivo')}
              </strong>
            </div>
            <UtilityTree
              utils={dmtInfo.dmt?.utilitiesList || []}
              DEV_ID={dmtInfo?.DEV_ID}
              isDevSelected={state.deviceSelected}
              isUtilSelected={state.utilSelected}
              onHandleSelectCard={selectedCard}
            />

          </Flex>
          <Flex justifyContent="flex-start" flexWrap="wrap" flex="1" style={{ minWidth: '375px' }}>
            {state.deviceSelected && renderDeviceInfo()}
            {state.utilSelected && state.utils[state.selectedIndex].NOBREAK_ID && (
              <NobreakInfo screen="dmtInfo" util={state.utils[state.selectedIndex]} />
            )}
            {state.utilSelected && state.utils[state.selectedIndex].ILLUMINATION_ID && (
              <IlluminationInfo screen="dmtInfo" util={state.utils[state.selectedIndex]} />
            )}
          </Flex>
        </Flex>
      </div>
    );
  }

  return renderDeviceInfo();
};
