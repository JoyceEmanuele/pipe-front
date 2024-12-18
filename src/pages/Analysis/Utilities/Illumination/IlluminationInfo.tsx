import { useState } from 'react';
import { Box, Flex } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import 'moment/locale/pt-br';
import { useHistory, useRouteMatch } from 'react-router';
import { getUserProfile } from 'helpers/userProfile';
import { apiCall, apiSpecial } from 'providers';
import {
  Title,
  InfoItem,
  IconWrapper,
} from './styles';
import { InfoIcon, LightOffIcon, LightOnIcon } from 'icons';
import { Button, Carousel } from 'components';
import { AssetStatus } from '~/components/AssetStatus';
import { DALSchedule } from '../../SchedulesModals/DAL_Schedule';
import { colors } from '~/styles/colors';
import { StyledLink } from '../Nobreak/styles';
import ReactTooltip from 'react-tooltip';
import { useWebSocket } from '~/helpers/wsConnection';

export const IlluminationInfo = ({ util, screen }): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [feedbackStatus, setFeedbackStatus] = useState(null as null | boolean);
  const match = useRouteMatch<{ utilId: string }>();
  const history = useHistory();
  const illuminationStatus = {
    Ligado: {
      icon: <LightOnIcon />,
      label: t('ligadoMinusculo'),
    },
    Desligado: {
      icon: <LightOffIcon />,
      label: t('desligadoMin'),
    },
    Indisponível: {
      icon: <InfoIcon width="30" />,
      label: t('semInformacao'),
    },
  };

  let { utilId } = match.params;
  utilId = utilId || util.ILLUMINATION_ID;
  const noOpStatus = !util.STATUS || util.STATUS === 'Indisponível';
  const utilIllumination = (util?.DMT_CODE || util?.DAL_CODE || util?.DAM_ILLUMINATION_CODE);

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    if (util?.DAL_CODE) {
      wsConn.send({ type: 'dalSubscribeRealTime', data: { DAL_CODE: util?.DAL_CODE } });
    }
  }
  function onWsMessage(response) {
    if (response && response.type === 'dalTelemetry' && util?.FEEDBACK) {
      setFeedbackStatus(response.data.Feedback[util.FEEDBACK - 1] || null);
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dalUnsubscribeRealTime' });
  }

  async function handleGetIlluminationImages() {
    return apiCall('/upload-service/get-images', {
      referenceId: Number(utilId),
      referenceType: 'ILLUMINATIONS',
    });
  }
  async function handlePostIlluminationImage(photo: Blob) {
    return apiSpecial['/upload-service/upload-image'](
      {
        referenceId: Number(utilId),
        referenceType: 'ILLUMINATIONS',
        file: photo,
      },
    );
  }
  async function handleDeleteIlluminationImage(imageUrl: string) {
    return apiCall('/upload-service/delete-image',
      {
        referenceId: Number(utilId),
        referenceType: 'ILLUMINATIONS',
        filename: imageUrl,
      });
  }

  return (
    <Flex width="100%" flexDirection="column" marginTop="10px" flex="wrap" fontSize="13px" padding={20}>
      <Flex style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        <Flex flexDirection="column">
          <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{t('utilitario')}</span>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>{util?.NAME}</span>
          <span style={{ fontSize: '10.7px', fontWeight: 500, color: colors.Grey300 }}>
            {utilIllumination
            && (
              <StyledLink to={`/analise/dispositivo/${utilIllumination}/informacoes`}>
                {utilIllumination || '-'}
              </StyledLink>
            )}
            {!utilIllumination
            && (
              <>
                -
              </>
            )}
          </span>
        </Flex>
        {utilIllumination && (
          <AssetStatus
            key={utilIllumination}
            DUT_ID={null}
            DEV_AUT={utilIllumination}
            DEV_ID={utilIllumination}
            isAutomation
            withoutMarginTop
          />
        )}
      </Flex>

      <div style={{ border: '1px solid #DEDEDE', marginTop: '20px' }} />

      <Flex justifyContent="space-between" flexWrap="wrap" width="100%">
        <Flex flexDirection="row" width={screen === 'dmtInfo' ? undefined : '50%'} flexWrap="wrap" mb="20px" mt="20px">
          <Flex flexWrap="wrap" flexDirection="column">
            <Title>{t('informacoes')}</Title>
            <InfoItem>
              <b>{t('tensaoDaRede')}</b>
              <br />
              {util?.GRID_VOLTAGE ? `${util.GRID_VOLTAGE} VAC` : '-'}
            </InfoItem>

            <InfoItem style={{ width: '200px' }}>
              <b>{t('correnteDaRedeEletrica')}</b>
              <br />
              {util?.GRID_CURRENT ? `${util.GRID_CURRENT} A` : '-'}
            </InfoItem>
            {(util.DAL_CODE && util?.FEEDBACK) && (
              <>
                <Title>{t('tempoReal')}</Title>
                <InfoItem>
                  <b>{t('status')}</b>
                  <br />
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    style={{
                      border: '1px solid #EDEDED',
                      borderRadius: '10px',
                      width: '250px',
                      height: '60px',
                      marginTop: '10px',
                    }}
                  >
                    {feedbackStatus ? (
                      <>
                        <IconWrapper width={22} height={22}>
                          <LightOnIcon />
                        </IconWrapper>
                        <span style={{ marginLeft: '10px' }}>
                          {t('iluminacaoLigada')}
                        </span>
                      </>
                    ) : (
                      <>
                        <IconWrapper width={22} height={22}>
                          <LightOffIcon />
                        </IconWrapper>
                        <span style={{ marginLeft: '10px' }}>
                          {t('iluminacaoDesligada')}
                        </span>
                      </>
                    )}
                  </Flex>
                </InfoItem>
              </>
            )}

            {(util.DMT_CODE)
            && (
            <>
              <Title>{t('tempoReal')}</Title>
              <InfoItem>
                <b>{t('status')}</b>
                <br />
                {noOpStatus
                && (
                  <Flex flexDirection="row" alignItems="center" data-tip data-for="noInfo" justifyContent="flex-start">
                    <InfoIcon />
                    <span style={{ marginLeft: 6 }}>{t('semInformacao')}</span>
                  </Flex>
                )}
                {!noOpStatus
                && (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  data-tip
                  data-for="noInfo"
                  style={{
                    border: '1px solid #EDEDED',
                    borderRadius: '10px',
                    width: '250px',
                    height: '60px',
                    marginTop: '10px',
                  }}
                >
                  {illuminationStatus[util.STATUS]?.icon}
                  <span style={{ marginLeft: '10px', fontSize: 13 }}>
                    {illuminationStatus[util.STATUS]?.label}
                  </span>
                </Flex>
                )}
                {noOpStatus
                    && (
                    <ReactTooltip
                      id="noInfo"
                      place="top"
                      border
                      textColor="#000000"
                      backgroundColor="rgba(255, 255, 255, 0.97)"
                      borderColor="#202370"
                    >
                      <div style={{ width: '200px' }}>
                        <span>{t('semInfoIluminacaoDmt')}</span>
                      </div>
                    </ReactTooltip>
                    )}
              </InfoItem>
            </>
            )}

            {(util.DAL_CODE || util.DMT_CODE) && <Title>{t('associacao')}</Title>}
            {(util.DAL_CODE)
            && (
              <>
                <InfoItem>
                  <b>{t('portaDoDal')}</b>
                  <br />
                  {util?.PORT ?? '-'}
                </InfoItem>
                <InfoItem>
                  <b>{t('feedbackDoDal')}</b>
                  <br />
                  {util?.FEEDBACK ?? '-'}
                </InfoItem>
              </>
            )}
            {util.DMT_CODE
            && (
              <InfoItem>
                <b>{t('feedbackDoDmt')}</b>
                <br />
                {util?.PORT ? `F${util?.PORT}` : '-'}
              </InfoItem>
            )}

            {(profile.manageAllClients || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === util?.CLIENT_ID)) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  style={{
                    maxWidth: '100px', marginTop: '15px',
                  }}
                  onClick={() => history.push(`/analise/utilitario/iluminacao/${utilId}/editar`, { from: screen })}
                  variant="primary"
                >
                  {`${t('editar')}`}
                </Button>
              </div>
            )}
          </Flex>
        </Flex>

        {util?.DAL_CODE && (
          <Flex flexDirection="column" mb="20px" mt="20px">
            <Title>{t('funcionamento')}</Title>
            <DALSchedule
              deviceCode={util.DAL_CODE}
              illumId={Number(utilId)}
              illumName={util.NAME}
              canEdit={false}
              isModal
            />
          </Flex>
        )}

        <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb="20px" mt="20px">
          <Flex
            flexDirection="column"
            alignItems={['center', 'center', 'center', 'center', 'flex-end', 'flex-end']}
          >
            <Box width={1} minWidth="340px" maxWidth="415px" justifyContent="center" alignItems="center">
              <Carousel
                getImages={handleGetIlluminationImages}
                postImage={handlePostIlluminationImage}
                deleteImage={handleDeleteIlluminationImage}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
