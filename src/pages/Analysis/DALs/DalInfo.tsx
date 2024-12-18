import { useState } from 'react';
import { Box, Flex } from 'reflexbox';
import { useHistory, useRouteMatch } from 'react-router';
import { AssetStatus } from '~/components/AssetStatus';
import {
  Carousel, Button,
} from '~/components';
import {
  Title, InfoItem, IconWrapper, ContainerInfoDalProfoile, ContainerDalTree, FlexRowColumn, FlexRowColumn1250,
} from './styles';
import { LightOnIcon, LightOffIcon } from 'icons';
import { useTranslation } from 'react-i18next';
import { apiCall, apiSpecial } from '~/providers';
import { useStateVar } from 'helpers/useStateVar';
import { getUserProfile } from 'helpers/userProfile';
import { UtilityTree } from 'components/UtilityTree';
import { DALSchedule } from '../SchedulesModals/DAL_Schedule';
import { useWebSocket } from '~/helpers/wsConnection';

export const DalInfo = ({ dalInfo }): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const match = useRouteMatch<{ devId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    devId: dalInfo.DEV_ID,
    linkBase: match.url.split(`/${match.params.devId}`)[0],
    utils: dalInfo.dal?.illuminationList || [],
    utilSelected: false,
    selectedIndex: -1 as number,
    deviceSelected: true as boolean,
    isLoading: false,
    lastTelemetry: null as null | { Feedback: boolean[] },
    RSSI: null as null|number,
  });

  async function handleGetImages() {
    if (state.utilSelected) {
      return apiCall('/upload-service/get-images', {
        referenceId: state.utils[state.selectedIndex].ILLUMINATION_ID,
        referenceType: 'ILLUMINATIONS',
      });
    }
    return apiCall('/upload-service/get-images', {
      referenceId: dalInfo.DEVICE_ID,
      referenceType: 'DALS',
    });
  }

  async function handlePostImage(photo: Blob) {
    if (state.utilSelected) {
      return apiSpecial['/upload-service/upload-image'](
        {
          referenceId: state.utils[state.selectedIndex].ILLUMINATION_ID,
          referenceType: 'ILLUMINATIONS',
          file: photo,
        },
      );
    }
    return apiSpecial['/upload-service/upload-image'](
      {
        referenceId: dalInfo.DEVICE_ID,
        referenceType: 'DALS',
        file: photo,
      },
    );
  }

  async function handleDeleteImage(imageUrl: string) {
    if (state.utilSelected) {
      return apiCall('/upload-service/delete-image',
        {
          referenceId: state.utils[state.selectedIndex].ILLUMINATION_ID,
          referenceType: 'ILLUMINATIONS',
          filename: imageUrl,
        });
    }
    return apiCall('/upload-service/delete-image',
      {
        referenceId: dalInfo.DEVICE_ID,
        referenceType: 'DALS',
        filename: imageUrl,
      });
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    wsConn.send({ type: 'dalSubscribeRealTime', data: { DAL_CODE: state.devId } });
  }
  function onWsMessage(response) {
    if (response && response.type === 'dalTelemetry') {
      state.lastTelemetry = response.data;
      state.RSSI = response.RSSI;
      render();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dalUnsubscribeRealTime' });
  }

  async function selectedCard(position: number) {
    state.selectedIndex = position;
    state.utilSelected = position > -1;
    state.deviceSelected = position === -2;
    render();
  }

  function renderImages() {
    return (
      <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb="20px" mt="20px">
        <Flex
          flexDirection="column"
          alignItems={['center', 'center', 'center', 'center', 'flex-end', 'flex-end']}
        >
          <Box width={1} maxWidth="415px" justifyContent="center" alignItems="center">
            <Carousel
              getImages={handleGetImages}
              postImage={handlePostImage}
              deleteImage={handleDeleteImage}
              index={state.selectedIndex}
            />
          </Box>
        </Flex>
      </Box>
    );
  }

  function renderDeviceInfo() {
    return (
      <Flex flexDirection="row" width="100%" marginTop="10px" flexWrap="wrap" justifyContent="space-between" fontSize="13px" padding="20px">
        <Flex width="100%" flexDirection="column" flex="wrap">
          <Flex
            style={{
              width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 15,
            }}
            flexWrap="wrap"
          >
            <Flex flexDirection="column">
              <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{t('dispositivo')}</span>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{dalInfo.DEV_ID}</span>
            </Flex>
            <AssetStatus
              key={dalInfo.DEV_ID}
              DUT_ID={null}
              DEV_AUT={dalInfo.DEV_ID}
              DEV_ID={dalInfo.DEV_ID}
              isAutomation
              withoutMarginTop
            />
          </Flex>
          <div style={{ border: '1px solid #DEDEDE', marginTop: '20px' }} />
          <FlexRowColumn>
            <Flex flexDirection="row" flexWrap="wrap" mb="20px" mt="20px">
              <Flex flexWrap="wrap" flexDirection="column">
                <Title>{t('informacoes')}</Title>
                <InfoItem>
                  <b>{t('estado')}</b>
                  <br />
                  {dalInfo.STATE_ID || '-'}
                </InfoItem>

                <InfoItem>
                  <b>{t('cidade')}</b>
                  <br />
                  {dalInfo.CITY_NAME || '-'}
                </InfoItem>

                <InfoItem>
                  <b>{t('cliente')}</b>
                  <br />
                  {dalInfo.CLIENT_NAME || '-'}
                </InfoItem>

                <InfoItem>
                  <b>{t('unidade')}</b>
                  <br />
                  {dalInfo.UNIT_NAME || '-'}
                </InfoItem>

                <Title>{t('associacoes')}</Title>
                <InfoItem>
                  <b>{t('portasEmUso')}</b>
                  <br />
                  {dalInfo.dal.illuminationList.filter((x) => x.PORT).reduce((acc, illum) => {
                    acc.push(illum.PORT);
                    return acc;
                  }, []).join(', ').replace(/,([^,]*)$/, ` ${t('e')}$1`) || '-'}
                </InfoItem>

                {(profile.manageAllClients || profile.permissions.isInstaller || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === dalInfo.CLIENT_ID)) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      style={{
                        maxWidth: '100px', marginTop: '15px',
                      }}
                      onClick={() => history.push(`${state.linkBase}/${state.devId}/editar`)}
                      variant="primary"
                    >
                      {`${t('editar')}`}
                    </Button>
                  </div>
                )}
              </Flex>
            </Flex>

            {renderImages()}
          </FlexRowColumn>
        </Flex>
      </Flex>
    );
  }

  if (profile.manageAllClients || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === dalInfo.CLIENT_ID)) {
    return (
      <div style={{ width: '100%' }}>
        <Flex flexWrap="wrap" flexDirection="row" width="100%">
          <ContainerDalTree>
            <>
              <div style={{ borderBottom: '1px solid lightgrey', marginTop: '15px', paddingBottom: '15px' }}>
                <strong style={{ marginLeft: '25px', fontSize: '90%' }}>
                  {t('dispositivo')}
                </strong>
              </div>
              <UtilityTree
                utils={dalInfo.dal?.illuminationList || []}
                DEV_ID={dalInfo?.DEV_ID}
                isDevSelected={state.deviceSelected}
                isUtilSelected={state.utilSelected}
                onHandleSelectCard={selectedCard}
                lastTelemetry={state.lastTelemetry}
              />
            </>
          </ContainerDalTree>
          <ContainerInfoDalProfoile>
            {state.deviceSelected && renderDeviceInfo()}
            {state.utilSelected && (
              <Flex width="100%" flexDirection="column" flex="wrap" padding={20}>
                <Flex style={{
                  width: '100%', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15,
                }}
                >
                  <Flex flexDirection="column">
                    <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{t('utilitario')}</span>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{state.utils[state.selectedIndex].NAME}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500 }}>{state.utils[state.selectedIndex].DAL_CODE}</span>
                  </Flex>
                  {state.utils[state.selectedIndex].DAL_CODE && (
                    <AssetStatus
                      key={state.utils[state.selectedIndex].DAL_CODE}
                      DUT_ID={null}
                      DEV_AUT={state.utils[state.selectedIndex].DAL_CODE}
                      DEV_ID={state.utils[state.selectedIndex].DAL_CODE}
                      isAutomation
                      withoutMarginTop
                    />
                  )}
                </Flex>

                <div style={{ border: '1px solid #DEDEDE', marginTop: '20px' }} />

                <FlexRowColumn1250>
                  <Flex flexDirection="row" flexWrap="wrap" mb="20px" mt="20px">
                    <Flex flexWrap="wrap" flexDirection="column">
                      <Title>{t('informacoes')}</Title>
                      <InfoItem>
                        <b>{t('tensaoDaRede')}</b>
                        <br />
                        {state.utils[state.selectedIndex].GRID_VOLTAGE ? `${state.utils[state.selectedIndex].GRID_VOLTAGE}VAC` : '-'}
                      </InfoItem>

                      <InfoItem style={{ width: '200px' }}>
                        <b>{t('correnteDaRedeEletrica')}</b>
                        <br />
                        {state.utils[state.selectedIndex].GRID_CURRENT ? `${state.utils[state.selectedIndex].GRID_CURRENT}A` : '-'}
                      </InfoItem>

                      {state.utils[state.selectedIndex].FEEDBACK && (
                        <>
                          <Title>{t('tempoReal')}</Title>
                          <InfoItem>
                            <b>{t('status')}</b>
                            <br />
                            <Flex
                              justifyContent="center"
                              alignItems="center"
                              style={{
                                border: '1px solid #EDEDED', borderRadius: '10px', width: '250px', height: '60px', marginTop: '10px',
                              }}
                            >
                              {state.lastTelemetry?.Feedback
                                && state.lastTelemetry?.Feedback[state.utils[state.selectedIndex].FEEDBACK - 1] ? (
                                  <>
                                    <IconWrapper width={22} height={22}>
                                      <LightOnIcon />
                                    </IconWrapper>
                                    <span style={{ marginLeft: '10px' }}>{t('iluminacaoLigada')}</span>
                                  </>
                                ) : (
                                  <>
                                    <IconWrapper width={22} height={22}>
                                      <LightOffIcon />
                                    </IconWrapper>
                                    <span style={{ marginLeft: '10px' }}>{t('iluminacaoDesligada')}</span>
                                  </>
                                )}

                            </Flex>
                          </InfoItem>
                        </>
                      )}

                      <Title>{t('associacao')}</Title>
                      <InfoItem>
                        <b>{t('portaDoDal')}</b>
                        <br />
                        {state.utils[state.selectedIndex].PORT ?? '-'}
                      </InfoItem>
                      <InfoItem>
                        <b>{t('feedbackDoDal')}</b>
                        <br />
                        {state.utils[state.selectedIndex].FEEDBACK ?? '-'}
                      </InfoItem>

                      {(profile.manageAllClients || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === dalInfo.CLIENT_ID)) && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <Button
                            style={{
                              maxWidth: '100px', marginTop: '15px',
                            }}
                            onClick={() => history.push(`/analise/utilitario/iluminacao/${state.utils[state.selectedIndex].ILLUMINATION_ID}/editar`)}
                            variant="primary"
                          >
                            {`${t('editar')}`}
                          </Button>
                        </div>
                      )}
                    </Flex>
                  </Flex>

                  {state.utils[state.selectedIndex].DAL_CODE && state.utils[state.selectedIndex].PORT && (
                    <Flex flexDirection="column" mb="20px" mt="20px">
                      <Title>{t('funcionamento')}</Title>
                      <DALSchedule
                        deviceCode={state.utils[state.selectedIndex].DAL_CODE}
                        illumId={state.utils[state.selectedIndex].ILLUMINATION_ID}
                        illumName={state.utils[state.selectedIndex].NAME}
                        canEdit={false}
                        isModal
                      />
                    </Flex>
                  )}

                  {renderImages()}
                </FlexRowColumn1250>
              </Flex>
            )}
          </ContainerInfoDalProfoile>
        </Flex>
      </div>
    );
  }

  return renderDeviceInfo();
};
