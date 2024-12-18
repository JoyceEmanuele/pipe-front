import { useEffect, useState } from 'react';
import { t } from 'i18next';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'moment/locale/en-ca';
import { Helmet } from 'react-helmet';
import {
  useHistory, useRouteMatch, useParams,
} from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import {
  ItemTitle,
  Card,
  Data,
  DataText,
  Title,
} from './styles';
import {
  Card as NewCard,
  Carousel,
  Loader,
  Button,
  StatusBox,
  ScheduleButton,
  ScheduleViewCard,
  ModalWindow,
} from 'components';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocketLazy } from 'helpers/wsConnection';
import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import { apiCall, apiCallFormData } from 'providers';
import { DevFullInfo } from 'store';
import { colors } from 'styles/colors';
import { DutSchedulesList } from '../SchedulesModals/DUT_SchedulesList';
import { DamScheduleSummary } from '../SchedulesModals/DAM_Schedule';
import { ScheduleDut, ExceptionDut } from '../../../providers/types/api-private';
import { DalInfo } from '../DALs/DalInfo';
import { DmtInfo } from '../DMTs/DmtInfo';
import { withTransaction } from '@elastic/apm-rum-react';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { generateNameFormatted } from '~/helpers/titleHelper';

function rssiDesc(RSSI: number, status: string) {
  if (RSSI < 0 && status === 'ONLINE') {
    if (RSSI > -50) return t('excelente');
    if (RSSI > -60) return t('bom');
    if (RSSI > -70) return t('regular');
    return t('ruim');
  }
  return '-';
}

export const DevInfo = (): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const match = useRouteMatch<{ devId: string }>();
  const { devId } = useParams<{ devId: string }>();
  const history = useHistory();
  const verifyTranslation = t('unidade');
  const [state, render, setState] = useStateVar(() => {
    moment.locale(verifyTranslation === 'unidade' ? 'pt-br' : 'en-ca');
    const state = {
      devId: match.params.devId,
      linkBase: match.url.split(`/${match.params.devId}`)[0],
      isLoading: true,
      devInfo: getCachedDevInfoSync(devId) as DevFullInfo|null,
      temperatureControlState: null as null|{ automation: boolean, mode: string, temperature: number, LTC: number },
      online: 'OFFLINE',
      RSSI: null as null|string,
      lastTelemetryTS: null as null|string,
      deviceTimestamp: null,
      DUTS_SCHEDULES: [] as ScheduleDut[],
      SCHEDULES_ACTIVE_QUANTITY: 0 as number,
      DUTS_EXCEPTIONS: [] as ExceptionDut[],
      openModal: false,
    };
    return state;
  });

  function redirectToIntegrations() {
    if (match.params.devId.startsWith('DRI') || match.params.devId.startsWith('DMA')) {
      const url = `/integracoes/info/diel/${state.devId}/perfil`;
      history.push(url);
    }
  }

  useEffect(() => {
    redirectToIntegrations();
  }, []);

  const isDal = state.devId.startsWith('DAL');
  const isDmt = state.devId.startsWith('DMT');

  const wsl = useWebSocketLazy();
  function onWsOpen(wsConn) {
    if (!state.devInfo) return;
    if (state.devInfo.dac) wsConn.send({ type: 'subscribeTelemetry', data: { dac_id: state.devId } });
    else if (state.devInfo.dam) wsConn.send({ type: 'subscribeStatus', data: { dam_id: state.devId } });
    else if (state.devInfo.dut) wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: state.devId } });
  }
  function handleDamMessages(payload) {
    if (payload.type === 'damStatus' && payload.data.dev_id === state.devId) {
      if (payload.data.status) state.online = payload.data.status;
      if (payload.data.timestamp) state.lastTelemetryTS = payload.data.timestamp;
      if (payload.data.deviceTimestamp) {
        const data = moment(payload.data.deviceTimestamp);
        payload.data.deviceTimestamp = data;
        state.deviceTimestamp = payload.data.deviceTimestamp;
      }
      if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
      render();
    }
  }
  function handleDacMessages(payload) {
    if (payload.type === 'dacTelemetry' && payload.data.dac_id === state.devId) {
      if (payload.data.status) state.online = payload.data.status;
      if (payload.data.timestamp) state.lastTelemetryTS = payload.data.timestamp;
      if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
      render();
    }
    if (payload.type === 'dacOnlineStatus' && payload.data.dac_id === state.devId) {
      if (payload.data.status) state.online = payload.data.status;
      if (payload.data.timestamp) state.lastTelemetryTS = payload.data.timestamp;
      render();
    }
  }
  function handleDutMessages(payload) {
    if (payload.type === 'dutTelemetry' && payload.data.dev_id === state.devId) {
      if (payload.data.status) state.online = payload.data.status;
      if (payload.data.timestamp) state.lastTelemetryTS = payload.data.timestamp;
      if (payload.data.RSSI != null) state.RSSI = rssiDesc(payload.data.RSSI, payload.data.status);
      render();
    }
  }
  function onWsMessage(payload) {
    if (!payload) return;
    if (payload.data.timestamp) {
      const data = moment(payload.data.timestamp);
      payload.data.timestamp = data;
    }

    handleDamMessages(payload);
    handleDacMessages(payload);
    handleDutMessages(payload);
  }
  function beforeWsClose(wsConn) {
    if (!state.devInfo) return;
    if (state.devInfo.dac) wsConn.send({ type: 'subscribeTelemetry', data: {} });
    else if (state.devInfo.dam) wsConn.send({ type: 'unsubscribeStatus' });
    else if (state.devInfo.dut) wsConn.send({ type: 'dutUnsubscribeRealTime' });
  }

  async function getDutAutExtraInfo(devInfo: DevFullInfo) {
    if (state.devInfo?.status === 'ONLINE') {
      apiCall('/request-dut-aut-config', { devId: devInfo.DEV_ID })
        .then((response) => {
          state.temperatureControlState = {
            automation: response.enabled,
            mode: response.ctrl_mode,
            temperature: response.setpoint,
            LTC: response.LTC,
          };
          render();
        })
        .catch(console.log);
    }

    apiCall('/dut/get-dut-schedules', { DUT_ID: devInfo.DEV_ID, CLIENT_ID: devInfo.CLIENT_ID, UNIT_ID: devInfo.UNIT_ID })
      .then((response) => {
        state.DUTS_SCHEDULES = response.schedules;
        state.SCHEDULES_ACTIVE_QUANTITY = state.DUTS_SCHEDULES.filter((schedule) => schedule.SCHEDULE_STATUS).length;
        render();
      })
      .catch(console.log);

    apiCall('/dut/get-dut-exceptions', { DUT_ID: devInfo.DEV_ID, CLIENT_ID: devInfo.CLIENT_ID, UNIT_ID: devInfo.UNIT_ID })
      .then((response) => {
        state.DUTS_EXCEPTIONS = response.exceptions;
        render();
      })
      .catch(console.log);
  }

  useEffect(() => {
    (async function () {
      try {
        setState({ isLoading: true });

        if (state.devId.includes('DAT')) {
          const url = `/analise/ativo/${state.devId}/informacoes`;
          history.push(url);
          return;
        }

        const devInfo = (await getCachedDevInfo(state.devId, { forceFresh: true }))!;
        state.devInfo = devInfo;
        if (devInfo.status) state.online = devInfo.status;
        if (devInfo.lastMessageTS) state.lastTelemetryTS = devInfo.lastMessageTS;
        wsl.start(onWsOpen, onWsMessage, beforeWsClose);

        const isDutAut = !!(devInfo && devInfo.dut_aut);
        const isDutQA = state.devInfo?.dut?.operation_mode === 5 || false;
        if (isDutAut && !isDutQA) {
          await getDutAutExtraInfo(devInfo);
        }
      } catch (err) {
        toast.error(t('erroDadosDispositivo'));
        console.log(err);
      }
      setState({ isLoading: false });
    }());
  }, []);

  async function handleGetDACImages() {
    return apiCall('/upload-service/get-images', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DACS',
    });
  }
  async function handlePostDACImage(photo: Blob) {
    return apiCallFormData('/upload-service/upload-image',
      {
        referenceId: state.devInfo!.DEVICE_ID,
        referenceType: 'DACS',
      },
      { file: photo });
  }
  async function handleDeleteDACImage(imageUrl: string) {
    return apiCall('/upload-service/delete-image', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DACS',
      filename: imageUrl,
    });
  }
  async function handleGetDUTImages() {
    return apiCall('/upload-service/get-images', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DUTS',
    });
  }
  async function handlePostDUTImage(photo: Blob) {
    return apiCallFormData('/upload-service/upload-image',
      {
        referenceId: state.devInfo!.DEVICE_ID,
        referenceType: 'DUTS',
      },
      { file: photo });
  }
  async function handleDeleteDUTImage(imageUrl: string) {
    return apiCall('/upload-service/delete-image', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DUTS',
      filename: imageUrl,
    });
  }
  async function handleGetDAMImages() {
    return apiCall('/upload-service/get-images', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DAMS',
    });
  }
  async function handlePostDAMImage(photo: Blob) {
    return apiCallFormData('/upload-service/upload-image',
      {
        referenceId: state.devInfo!.DEVICE_ID,
        referenceType: 'DAMS',
      },
      { file: photo });
  }
  async function handleDeleteDAMImage(imageUrl: string) {
    return apiCall('/upload-service/delete-image', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DAMS',
      filename: imageUrl,
    });
  }
  async function handleGetDRIImages() {
    return apiCall('/upload-service/get-images', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DRIS',
    });
  }
  async function handlePostDRIImage(photo: Blob) {
    return apiCallFormData('/upload-service/upload-image',
      {
        referenceId: state.devInfo!.DEVICE_ID,
        referenceType: 'DRIS',
      },
      { file: photo });
  }
  async function handleDeleteDRIImage(imageUrl: string) {
    return apiCall('/upload-service/delete-image', {
      referenceId: state.devInfo!.DEVICE_ID,
      referenceType: 'DRIS',
      filename: imageUrl,
    });
  }

  function openModalDutSchedulesList() {
    setState({ openModal: true });
    render();
  }

  const { devInfo } = state;

  function renderCustomPages(type: string) {
    return (
      <>
        <Helmet>
          <title>{generateNameFormatted(state.devId, t('perfil'))}</title>
        </Helmet>
        {state.devInfo && <DevLayout devInfo={state.devInfo} />}
        <div style={{ marginTop: '30px' }} />
        <NewCard noPadding>
          <Flex>
            {state.isLoading && (
              <Loader />
            )}
            {(!state.isLoading && devInfo && type === 'dal')
            && (
              <DalInfo dalInfo={state.devInfo} />
            )}
            {(!state.isLoading && devInfo && type === 'dmt')
            && (
              <DmtInfo dmtInfo={state.devInfo} />
            )}
          </Flex>
        </NewCard>
      </>
    );
  }
  if (isDal || isDmt) {
    return renderCustomPages(isDmt ? 'dmt' : 'dal');
  }

  function showDevWifiConn() {
    return ((profile.viewAllClients || profile.manageSomeClient) && (state.RSSI != null)) && (
      <span>
        {/* eslint-disable */}
&nbsp; &nbsp;{`${t('intensidadeDoWifi')}:`}
        {/* eslint-enable */}
        {state.RSSI}
      </span>
    );
  }

  function renderScheds(devInfo) {
    return (
      <Box width={[1, 1, 1, 1, 1, 1 / 3]}>
        {(devInfo.dam) && ((!devInfo.dac) || (devInfo.dam.DAM_DISABLED !== 1)) && (
          <div>
            <DamScheduleSummary damId={devInfo.DEV_ID} />
          </div>
        )}
        {(devInfo.dut_aut) && (devInfo.dut_aut.DUTAUT_DISABLED !== 1) && (
          <div style={{ marginTop: '40px' }}>
            {/* <DutScheduleSummary dutId={devInfo.DEV_ID} /> */}
            {(state.DUTS_SCHEDULES.length > 2 || state.DUTS_EXCEPTIONS.length > 0) && (
              <ItemTitle>
                {t('funcionamento')}
                <ScheduleButton handleOnClick={openModalDutSchedulesList} DEV_ID={devInfo.DEV_ID} SCHEDULES_ACTIVE_QUANTITY={state.SCHEDULES_ACTIVE_QUANTITY} SCHEDULE_TOTAL_QUANTITY={state.DUTS_SCHEDULES.length} />
              </ItemTitle>
            )}
            {state.DUTS_SCHEDULES.length < 3 && state.DUTS_SCHEDULES.map((schedule, index) => (
              <Flex
                key={schedule.DUT_SCHEDULE_ID}
                style={{
                  marginTop: '10px',
                  marginLeft: '-10px',
                }}
                flexDirection="column"
              >
                <ScheduleViewCard cardPosition={index} schedule={schedule} hideButtons />
              </Flex>
            ))}
          </div>
        )}
      </Box>
    );
  }

  const getTranslatedInstallationLocation = (str?: string|null) => {
    const opts = {
      'casa-de-maquina': t('casaDeMaquina'),
      'ambiente-refrigerado': t('ambienteRefrigeradoDam'),
      outros: t('outros'),
    };

    return (str && opts[str]) || null;
  };

  function renderDevInfo() {
    return (devInfo && (
      <>
        <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb={[24, 24, 24, 24, 24, 0]}>
          <Title>{t('status')}</Title>
          <Data style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StatusBox status={state.online || 'OFFLINE'}>{state.online || 'OFFLINE'}</StatusBox>
            {showDevWifiConn()}
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              DEV ID
            </DataText>
            <DataText>{devInfo.DEV_ID || t('semInformacao')}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              BT ID
            </DataText>
            <DataText>{devInfo.BT_ID || t('semInformacao')}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('ultimaMensagemRecebida')}
            </DataText>
            <DataText>
              {(state.lastTelemetryTS && moment(state.lastTelemetryTS).format('lll')) || t('semInformacao')}
            </DataText>
            {(profile.manageAllClients && state.deviceTimestamp && (state.deviceTimestamp !== state.lastTelemetryTS))
            && (
              <span style={{ color: 'red' }}>
                {t('horarioDispositivo')}
                {moment(state.deviceTimestamp).format('lll')}
              </span>
            )}
          </Data>

          {(devInfo.dam && !devInfo.dac)
          && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('modoOperacao')}
            </DataText>
            <DataText>{devInfo.dam.dam_mode || t('semInformacao')}</DataText>
          </Data>
          )}

          <Title>{t('informacoes')}</Title>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('estado')}
            </DataText>
            <DataText>{devInfo.STATE_ID || t('semInformacao')}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('cidade')}
            </DataText>
            <DataText>{devInfo.CITY_NAME || t('semInformacao')}</DataText>
          </Data>

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('unidade')}
            </DataText>
            <DataText>{devInfo.UNIT_NAME || t('semInformacao')}</DataText>
          </Data>
          {(devInfo.dac)
          && (
          <>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('conjunto')}
              </DataText>
              <DataText>{devInfo.dac.GROUP_NAME || t('semInformacao')}</DataText>
            </Data>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('condensadora')}
              </DataText>
              <DataText>{devInfo.dac.DAC_NAME || t('semInformacao')}</DataText>
            </Data>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('descricao')}
              </DataText>
              {
                (devInfo.dac.DAC_DESC?.startsWith('https://') || devInfo.dac.DAC_DESC?.startsWith('http://'))
                  ? <DataText><a href={devInfo.dac.DAC_DESC} style={{ color: 'inherit' }}>{devInfo.dac.DAC_DESC}</a></DataText>
                  : <DataText>{devInfo.dac.DAC_DESC || t('semInformacao')}</DataText>
              }
            </Data>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('modelo')}
              </DataText>
              <DataText>{devInfo.dac.DAC_MODEL || t('semInformacao')}</DataText>
            </Data>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('capacidadeFrigorifica')}
              </DataText>
              <DataText>{verifyCapacityPower(devInfo)}</DataText>
            </Data>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('fluidoRefrigerante')}
              </DataText>
              <DataText>{(devInfo.optsDescs || {})[devInfo.dac.FLUID_TYPE] || t('semInformacao')}</DataText>
            </Data>
          </>
          )}
          {(devInfo.dam)
          && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('localDeInstalacao')}
            </DataText>
            <DataText>{getTranslatedInstallationLocation(devInfo.dam?.INSTALLATION_LOCATION) ?? '-'}</DataText>
          </Data>
          )}
          {(devInfo.dam && !devInfo.dac)
          && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('conjunto')}
            </DataText>
            <DataText>{(devInfo.dam.groups && devInfo.dam.groups.map((group) => group.GROUP_NAME).join(', ')) || t('semInformacao')}</DataText>
          </Data>
          )}
          {(devInfo.dam)
          && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('modoEco')}
            </DataText>
            <DataText>{habilitadoDesabilitado(devInfo)}</DataText>
          </Data>
          )}
          {(devInfo.dut_aut && state.temperatureControlState && profile.manageAllClients)
          && (
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('modoEco')}
            </DataText>
            <DataText>{JSON.stringify(state.temperatureControlState)}</DataText>
          </Data>
          )}
          {(devInfo.dut)
          && (
          <>
            <Data>
              <DataText color={colors.Grey300} fontWeight="bold">
                {t('ambiente')}
              </DataText>
              <DataText>{devInfo.dut.ROOM_NAME || t('semInformacao')}</DataText>
            </Data>
          </>
          )}

          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('inicioMonitoramento')}
            </DataText>
            <DataText>
              {(devInfo.DAT_BEGMON && moment(devInfo.DAT_BEGMON).format('lll')) || t('semInformacao')}
            </DataText>
          </Data>

          {/* Informação ocultada para futuras melhorias */}
          {/* <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              Data da primeira automação
            </DataText>
            <DataText>
              {(devInfo.DAT_BEGAUT && moment(devInfo.DAT_BEGAUT).format('lll')) || 'Sem informação'}
            </DataText>
          </Data> */}
        </Box>
        {renderScheds(devInfo)}
        <Box width={[1, 1, 1, 1, 1, 1 / 3]}>
          <Flex
            flexDirection="column"
            alignItems={['center', 'center', 'center', 'center', 'flex-end', 'flex-end']}
          >
            <Box width={1} maxWidth="415px" mb="16px" justifyContent="center" alignItems="center">
              {(devInfo.dac)
              && (
              <Carousel
                match={match}
                getImages={handleGetDACImages}
                postImage={handlePostDACImage}
                deleteImage={handleDeleteDACImage}
              />
              )}
              {(devInfo.dut)
              && (
              <Carousel
                match={match}
                getImages={handleGetDUTImages}
                postImage={handlePostDUTImage}
                deleteImage={handleDeleteDUTImage}
              />
              )}
              {(devInfo.dam && !devInfo.dac)
              && (
              <Carousel
                match={match}
                getImages={handleGetDAMImages}
                postImage={handlePostDAMImage}
                deleteImage={handleDeleteDAMImage}
              />
              )}
              {(devInfo.dri)
              && (
              <Carousel
                match={match}
                getImages={handleGetDRIImages}
                postImage={handlePostDRIImage}
                deleteImage={handleDeleteDRIImage}
              />
              )}
            </Box>
          </Flex>
        </Box>
        <Box width={1}>
          {isEditEnable(devInfo)}
        </Box>
      </>
    ) || null);
  }

  function habilitadoDesabilitado(devInfo: DevFullInfo) {
    if (devInfo.dam?.ENABLE_ECO === 1 || devInfo.dam?.ENABLE_ECO === 2) {
      return t('habilitado');
    }
    return t('desabilitado');
  }

  let permissionProfile = (state.devInfo && state.devInfo.CLIENT_ID
    ? profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === state.devInfo?.CLIENT_ID)
    : false) || profile.manageAllClients;

  if (permissionProfile === false || permissionProfile === undefined) {
    permissionProfile = !!profile.adminClientProg?.UNIT_MANAGE.some((item) => item === state.devInfo?.UNIT_ID);
  }

  function isEditEnable(devInfo: DevFullInfo) {
    if (permissionProfile || profile.permissions.CLIENT_MANAGE.includes(devInfo.CLIENT_ID) || profile.permissions.isInstaller) {
      return (
        <div>
          <Button
            style={{ maxWidth: '100px' }}
            onClick={() => history.push(`${state.linkBase}/${state.devId}/editar`)}
            variant="primary"
          >
            {t('editar')}
          </Button>
        </div>
      );
    }
    return <></>;
  }

  function verifyCapacityPower(devInfo: DevFullInfo) {
    if (devInfo.dac?.CAPACITY_PWR) {
      return `${formatNumberWithFractionDigits(devInfo.dac?.CAPACITY_PWR)} ${devInfo.dac?.CAPACITY_UNIT || ''}`;
    }
    return t('semInformacao');
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devId, t('perfil'))}</title>
      </Helmet>
      {state.devInfo && <DevLayout devInfo={state.devInfo} />}
      <Card>
        <Flex flexWrap="wrap">
          {state.isLoading
            ? (
              <Loader />
            )
            : renderDevInfo() }
        </Flex>
        {state.openModal && (
        <ModalWindow style={{ padding: '0px', overflowX: 'hidden' }} onClickOutside={() => { setState({ openModal: false }); }}>
          <DutSchedulesList schedules={state.DUTS_SCHEDULES} exceptions={state.DUTS_EXCEPTIONS} />
        </ModalWindow>
        )}
      </Card>
    </>
  );
};

export default withTransaction('DevInfo', 'component')(DevInfo);
