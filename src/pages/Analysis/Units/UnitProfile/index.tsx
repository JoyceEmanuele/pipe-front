import React, {
  useEffect, useState, useRef, useMemo,
} from 'react';
import { t } from 'i18next';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { CSVLink } from 'react-csv';
import { useParams, useHistory, useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import i18n from '~/i18n';
import {
  Loader,
  Button,
  ModalWindow,
  Checkbox,
} from 'components';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { TUnitInfo, UnitLayout } from 'pages/Analysis/Units/UnitLayout';
import { ApiParams, ApiResps, apiCall } from 'providers';
import { colors } from 'styles/colors';
import {
  BtnExport,
  ExportWorksheet,
  Text,
  Title,
  Card,
  Data,
  DataText,
  Separator,
  BoxResponsive,
  ObservationAreaContainer,
  TitleInfoObservation,
  ContainerObservationsItems,
  ContainerEditDeleteObs,
  ContainerObservation,
  TextObsUnit,
  TextObsUnitExpand,
  IconsContainerObs,
  ContainerHtmlObs,
} from './styles';
import { getDatesRange } from 'helpers/formatTime';
import { DocumentationFiles } from './DocumentationsFiles';
import { processDataAndDownloadCSV } from '~/helpers/dateFormatedcsv';
import { DateButtonExport } from './DateButtonExport';
import { TSIMCARD } from '~/helpers/simcards';
import { withTransaction } from '@elastic/apm-rum-react';
import {
  DeleteNotificationIcon,
  EditNotificationIcon,
  InfoIcon,
} from '~/icons';
import OlhoAberto from '~/icons/OlhoAberto';
import OlhoFechado from '~/icons/OlhoFechado';
import Pagination from 'rc-pagination';
import ReactHtmlParser from 'react-html-parser';
import ReactTooltip from 'react-tooltip';
import { HoverExportList } from '../../Utilities/UtilityFilter/styles';
import * as DOMPurify from 'dompurify';
import { formatNumber } from '~/helpers/formatNumber';
import { generateNameFormatted } from '~/helpers/titleHelper';

const CSVheader = [
  { label: t('cliente'), key: 'cliente' },
  { label: t('unidade'), key: 'unidade' },
  { label: t('dispositivo'), key: 'id' },
  { label: t('maquina'), key: 'maquina' },
  { label: t('ambiente'), key: 'ambiente' },
  { label: t('disponibilidadeOnline'), key: 'disponibilidade' },
  { label: t('dia'), key: 'dia' },
];

const daysOfTheWeek = [t('diasDaSemana.dom'), t('diasDaSemana.seg'), t('diasDaSemana.ter'), t('diasDaSemana.qua'), t('diasDaSemana.qui'), t('diasDaSemana.sex'), t('diasDaSemana.sab')];

export const UnitProfile = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const routeParams = useParams<{ unitId: string }>();
  const match = useRouteMatch<{ unitId: string }>();
  const history = useHistory();
  const csvLinkEl = useRef();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    linkBase: match.url.split(`/${match.params.unitId}`)[0],
    isLoading: true,
    devsDispLoading: false,
    isSending: false,
    unitInfo: {} as TUnitInfo,
    supervisors: [] as { USER_ID: string, UNIT_ID: number, NOME: string, SOBRENOME: string, EMAIL: string }[],
    devsDisp: {} as {
      [devId: string]: {
          devId: string;
          startDate: string;
          endDate: string;
          clientName: string;
          unitName: string;
          groupName: string;
          roomName: string;
          avgDisp: number;
          dispList: {
              disponibility: number;
              YMD: string;
          }[];
      };
    },
    meanDevsDisp: undefined as undefined|number,
    csvData: [] as {}[],
    openModal: false,
    lastDate: moment().subtract(1, 'days'),
    selectedDate: moment().subtract(1, 'days'),
    datesRange: getDatesRange(moment().subtract(1, 'days'), 7) as {
      mdate: moment.Moment,
      YMD: string,
      DMY: string,
    }[],
    focusedInput: null,
    focused: false,
    gettingCsv: false,
    documentations: [] as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    }[],
    selectedDocumentations: [] as number[],
    listSimcards: [] as TSIMCARD[],
  });

  async function handleGetUnitInfo() {
    try {
      setState({ isLoading: true });
      const [
        unitInfo,
        supervisors,
      ] = await Promise.all([
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
        apiCall('/clients/get-unit-supervisors', { UNIT_ID: state.unitId }),
      ]);
      state.unitInfo = unitInfo;
      state.supervisors = supervisors.list;

      const { list } = await apiCall('/upload-service/get-sketches-list', { unitId: state.unitId });
      state.documentations = list.map((item) => ({ ...item, UNIT_SKETCH_ID: item.ID }));
    } catch (err) {
      console.log(err);
      toast.error(t('erroInformacaoUnidade'));
    }
    setState({ isLoading: false });
  }

  async function calculateUnitDevsDisp() {
    try {
      setState({ devsDispLoading: true });

      const endDate = moment(state.lastDate).format('YYYY-MM-DD');
      const startDate = moment(state.lastDate).subtract(6, 'days').format('YYYY-MM-DD');

      const devsDisp = await apiCall('/clients/get-unit-devs-disp-v2', { UNIT_ID: state.unitId, startDate, endDate });

      state.devsDisp = devsDisp;

      const list = Object.values(devsDisp);

      const meanDisp = list.reduce((acc, data) => acc += data.avgDisp, 0) / list.length;

      state.meanDevsDisp = meanDisp;
    } catch (err) {
      console.log(err);
      toast.error(t('erroCalcularDisponibilidadeDispositivos'));
    }
    setState({ devsDispLoading: false });
  }

  const handleFocused = (data) => {
    setState({ focused: data });
    render();
  };

  async function getListSimcards() {
    try {
      if (state.unitId && (isClientManage || profile.manageAllClients || profile.permissions.isInstaller)) {
        const list = await apiCall('/sims/get-unit-sims', { unitId: state.unitId });
        setState({ listSimcards: list });
      }
    } catch (err) {
      toast.error('Nao foi possivel buscar a lista de SIMCARD da unidade');
    }
  }

  async function getDispCsvData() {
    state.gettingCsv = true; render();

    let data = [] as {
      devId: string;
      startDate: string;
      endDate: string;
      clientName: string;
      unitName: string;
      groupName: string;
      roomName: string;
      avgDisp: number;
      dispList: {
          disponibility: number;
          YMD: string;
      }[];
    }[];

    try {
      if (false && moment(state.selectedDate).format('YYYY-MM-DD') === moment(state.lastDate).format('YYYY-MM-DD')) {
        if (Object.values(state.devsDisp).length > 0) {
          data = Object.values(state.devsDisp);
        } else {
          toast.info(t('erroExportarDadosDisponibilidade')); state.isLoading = false;
        }
      } else {
        const dispList = await apiCall('/clients/get-unit-devs-disp-v2', {
          UNIT_ID: state.unitId,
          startDate: state.datesRange[state.datesRange.length - 1].YMD,
          endDate: state.datesRange[0].YMD,
          ...{ flagExportCSV: true },
        });
        if (Object.values(dispList).length > 0) {
          data = Object.values(dispList);
        } else {
          toast.info(t('erroExportarDadosDisponibilidade')); state.isLoading = false;
        }
      }

      state.csvData = await processDataAndDownloadCSV(data);
      render();
      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);

      state.gettingCsv = false; render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); state.gettingCsv = false; render(); }
  }

  useEffect(() => {
    handleGetUnitInfo();
    // calculateUnitDevsDisp();
    // getListSimcards();
  }, []);

  function onDateChange(date, dateEnd) {
    state.selectedDate = date;
    state.datesRange = getDatesRange(date, 7);
    render();
  }

  const isClientManage = profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === state.unitInfo.CLIENT_ID);
  const isUnitManage = profile.adminClientProg?.UNIT_MANAGE.some((item) => item === state.unitInfo?.UNIT_ID);
  let navigateUrl;
  if (isClientManage) {
    navigateUrl = `${state.linkBase}/${state.unitId}/editar-unidade?aba=programacao-multipla`;
  } else if (profile.permissions.isInstaller) {
    navigateUrl = `${state.linkBase}/${state.unitId}/editar-unidade?aba=simcards`;
  } else if (isUnitManage) {
    navigateUrl = `${state.linkBase}/${state.unitId}/editar-unidade?aba=programacao-multipla`;
  } else {
    navigateUrl = `${state.linkBase}/${state.unitId}/editar-unidade`;
  }

  const navigate = navigateUrl;

  let permissionProfile = isClientManage || profile.manageAllClients || profile.permissions.isInstaller;
  if (permissionProfile === false || permissionProfile === undefined) {
    permissionProfile = !!isUnitManage;
  }

  const renderCsvExportButton = () => (
    <BtnExport variant={state.isLoading ? 'disabled' : 'primary'} onClick={() => setState({ openModal: true })}>
      <div>
        <ExportWorksheet />
        <Text style={{ paddingLeft: '5px' }}>{t('exportarPlanilha')}</Text>
      </div>
    </BtnExport>
  );

  function returnSimcards() {
    if (profile.manageAllClients || profile.permissions.isInstaller) {
      return (
        <Data>
          <DataText color={colors.Grey300} fontWeight="bold">
            {t('SIMCARD')}
          </DataText>
          <DataText>{state.listSimcards.length}</DataText>
        </Data>
      );
    }
    return <></>;
  }

  function getHeight() {
    if (state.focused) {
      return '400px';
    }
    return 'auto';
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('perfil'))}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />
      <Card style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
        <BoxResponsive>
          <Flex flexWrap="wrap" width="100%">
            {(state.isLoading) && (
              <Loader />
            )}
            {(!state.isLoading && state.unitInfo) && (
              <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb={[24, 24, 24, 24, 24, 0]}>
                <Title>{t('informacoes')}</Title>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('unidade')}
                  </DataText>
                  <DataText>{state.unitInfo.UNIT_NAME || t('semInformacao')}</DataText>
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('codigoDaUnidade')}
                  </DataText>
                  <DataText>{state.unitInfo.UNIT_CODE_CELSIUS || t('semInformacao')}</DataText>
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('estado')}
                  </DataText>
                  <DataText>{state.unitInfo.STATE_ID || t('semInformacao')}</DataText>
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('endereco')}
                  </DataText>
                  <DataText>{state.unitInfo.ADDRESS || t('semInformacao')}</DataText>
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('cidade')}
                  </DataText>
                  <DataText>{state.unitInfo.CITY_NAME || t('semInformacao')}</DataText>
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('responsaveis')}
                  </DataText>
                  {(state.supervisors.length === 0) && (
                    <DataText>{t('nenhumResponsavelAtribuido')}</DataText>
                  )}
                  {state.supervisors.map((supervisor, index) => (
                    <DataText key={index + supervisor.NOME}>{`${supervisor.NOME} ${supervisor.SOBRENOME} (${supervisor.EMAIL})`}</DataText>
                  ))}
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    Fuso Horário
                  </DataText>
                  <DataText>{`${state.unitInfo.TIMEZONE_AREA} (${state.unitInfo.TIMEZONE_OFFSET})`}</DataText>
                </Data>

                <Data>
                  <DataText color={colors.Grey300} fontWeight="bold">
                    {t('areaConstruida')}
                  </DataText>
                  <DataText>{state.unitInfo.CONSTRUCTED_AREA ? `${formatNumber(state.unitInfo.CONSTRUCTED_AREA)}m²` : '-'}</DataText>
                </Data>

                {!state.devsDispLoading
                  ? (
                    <div>
                      <Data>
                        <DataText color={colors.Grey300} fontWeight="bold">
                          {t('disponibilidadeDosDispositivos')}
                        </DataText>
                        <DataText>{state.meanDevsDisp !== undefined ? `${state.meanDevsDisp?.toFixed(1).replace('.', ',')}% ${t('onlineUltimaSemana')}` : t('erroAoCalcular')}</DataText>
                        {renderCsvExportButton()}
                      </Data>
                      {state.openModal && (
                        <ModalWindow onClickOutside={() => !state.gettingCsv && setState({ openModal: false })}>
                          {state.gettingCsv
                            ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Text style={{ padding: '20px' }}>{t('calculandoEGerandoPlanilha')}</Text>
                                <Loader />
                              </div>
                            )
                            : (
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: getHeight(),
                              }}
                              >
                                <DateButtonExport onFocusedUpdate={handleFocused} onClickDownload={getDispCsvData} onDateChange={onDateChange} />
                                <CSVLink
                                  headers={CSVheader}
                                  data={state.csvData}
                                  filename={`Disponibilidade_${state.unitInfo.UNIT_NAME}_Periodo_${state.datesRange[state.datesRange.length - 1].DMY.replaceAll('/', '-')}_${state.datesRange[0].DMY.replaceAll('/', '-')}.csv`}
                                  separator=";"
                                  asyncOnClick
                                  enclosingCharacter={'"'}
                                  ref={csvLinkEl}
                                />
                              </div>
                            )}
                        </ModalWindow>
                      )}
                    </div>
                  )
                  : (
                    <Data>
                      <DataText color={colors.Grey300} fontWeight="bold">
                        {t('calculandoDisponibilidade')}
                        <Loader />
                      </DataText>
                    </Data>
                  )}
                  {/* {returnSimcards()} */}
              </Box>
            )}
          </Flex>
          <Separator />
          <Flex width="100%">
            <DocumentationFiles documentations={state.documentations} unitId={state.unitId} profile={profile} />
          </Flex>
        </BoxResponsive>
        {permissionProfile ? (
          <Button
            style={{ maxWidth: '200px', marginTop: '20px' }}
            onClick={() => history.push(navigate)}
            variant="primary"
          >
            {`${t('botaoEditar')}`}
          </Button>
        ) : null}
      </Card>
      <ObservationUnit unitId={state.unitId} profile={profile} />
    </>
  );
};

export default withTransaction('UnitProfile', 'component')(UnitProfile);

const pageLocale = {
  prev_page: t('paginaAnterior'),
  next_page: t('proximaPagina'),
  prev_5: t('5paginasAnteriores'),
  next_5: t('proximas5paginas'),
  prev_3: t('3paginasAnteriores'),
  next_3: t('proximas3paginas'),
};

function ObservationUnit({ unitId, profile }) {
  const [state, _render, setState] = useStateVar({
    openModalEditAdd: false,
    isEditModal: false,
    item: {} as ApiResps['/unit/get-observations'][0],
    openModalDelete: false,
    listObservations: [] as ApiResps['/unit/get-observations'],
    isLoading: false,
    currentPage: 1,
    pageSize: 10,
  });

  const getDataPerPage = useMemo(() => state.listObservations.slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize), [state.listObservations, state.currentPage, state.pageSize]);
  const onPageChange = (curr) => {
    setState({ currentPage: curr });
  };

  async function getObservationList() {
    setState({ isLoading: true });
    try {
      const list = await apiCall('/unit/get-observations', { unitId });
      setState({ listObservations: list });
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getObservationList();
  }, []);

  async function handleSendObs() {
    setState({ isLoading: true });
    try {
      await apiCall('/unit/set-observation', state.item);
      await getObservationList();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  if (state.isLoading) {
    return (
      <Card>
        <ObservationAreaContainer>
          <div>
            <h4>{t('observacoes')}</h4>
          </div>
          <Loader />
        </ObservationAreaContainer>
      </Card>
    );
  }

  function verifyWhoIsObservation(item) {
    if ((permissionOnlyEditOwn && profile.user === item.USER_ID) || permissionEditAll) {
      return true;
    }
    return false;
  }
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const isMobile = !isDesktop.matches;

  const permissionProfile = (profile.manageAllClients || profile.permissions.isParceiroValidador || profile.permissions.isInstaller || profile.manageSomeClient);
  const permissionOnlyEditOwn = (profile.manageSomeClient || profile.permissions.isInstaller);
  const permissionEditAll = (profile.manageAllClients || profile.permissions.isParceiroValidador);
  return (
    <Card>
      <ObservationAreaContainer>
        <div>
          <h4>{t('observacoes')}</h4>
          {
            permissionProfile && (
              <Button style={{ maxWidth: '230px', padding: 5 }} variant="blue" onClick={() => setState({ openModalEditAdd: true, item: undefined })}>{t('adicionarObservacao')}</Button>
            )
          }
        </div>
        {
          state.listObservations.length > 0 && (
            <>
              <TitleInfoObservation>
                <span>{t('descricao')}</span>
                <span>{t('data')}</span>
                <span>{t('usuario')}</span>
              </TitleInfoObservation>
              {
                getDataPerPage.map((obs) => (
                  <ContainerObservationsItems key={`${obs.DATE_OBS}/${obs.ID}`}>
                    <ContainerObservation>
                      {
                        verifyWhoIsObservation(obs) && (
                          <div style={{ marginTop: 4 }} onClick={() => { setState({ item: { ...obs, ISVISIBLE: obs.ISVISIBLE === 0 ? 1 : 0 } }); handleSendObs(); }}>
                            {obs.ISVISIBLE ? <OlhoAberto /> : <OlhoFechado />}
                          </div>
                        )
                      }
                      {
                        (!verifyWhoIsObservation(obs) && permissionOnlyEditOwn) && (
                          <div style={{ marginTop: 4, width: 20, height: 20 }} />
                        )
                      }
                      <div style={{ width: '95%', maxWidth: '150ch' }}>
                        <TextObservation obs={obs} />
                      </div>
                    </ContainerObservation>
                    <div style={{ width: '90%', display: 'flex' }}>
                      {
                        isMobile ? (
                          <>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <span>{obs.DATE_OBS}</span>
                              {isMobile && (
                                <UserAndIcons
                                  obs={obs}
                                  setState={setState}
                                  verifyWhoIsObservation={verifyWhoIsObservation(obs)}
                                  isMobile
                                />
                              )}
                            </div>
                            {isMobile && <IconsEditExclude verifyWhoIsObservation={verifyWhoIsObservation} setState={setState} obs={obs} /> }
                          </>
                        ) : (
                          <span>{obs.DATE_OBS}</span>
                        )
                      }
                    </div>
                    {!isMobile && (
                      <UserAndIcons
                        obs={obs}
                        setState={setState}
                        verifyWhoIsObservation={verifyWhoIsObservation(obs)}
                        isMobile={false}
                      />
                    )}
                  </ContainerObservationsItems>
                ))
              }
            </>
          )
        }
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '10px',
          }}
        >
          <Pagination
            className="ant-pagination"
            defaultCurrent={state.currentPage}
            total={state.listObservations.length}
            locale={pageLocale}
            pageSize={state.pageSize}
            onChange={(current) => onPageChange(current)}
          />
        </div>
      </ObservationAreaContainer>
      {
        state.openModalEditAdd && (
          <ModalAddEditObservations
            closeModal={() => setState({ openModalEditAdd: false, isEditModal: false, item: undefined })}
            isEdit={state.isEditModal}
            item={state.item}
            unitId={unitId}
            getObservations={() => getObservationList()}
          />
        )
      }
      {
        state.openModalDelete && (
        <ModalDeleteObservation
          closeModal={() => setState({ openModalDelete: false })}
          item={state.item}
          getObservations={() => getObservationList()}
          unitId={unitId}
        />
        )
      }
    </Card>
  );
}

function UserAndIcons({
  obs, setState, verifyWhoIsObservation, isMobile,
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span>{`${obs.NOME} ${obs.SOBRENOME || ''}`}</span>
      {!isMobile && <IconsEditExclude verifyWhoIsObservation={verifyWhoIsObservation} setState={setState} obs={obs} /> }
    </div>
  );
}

function IconsEditExclude({ verifyWhoIsObservation, setState, obs }) {
  if (verifyWhoIsObservation) {
    return (
      <IconsContainerObs>
        <ContainerEditDeleteObs onClick={() => setState({ isEditModal: true, openModalEditAdd: true, item: obs })}>
          <EditNotificationIcon class="edit" heightSvg="20px" widthSvg="22px" />
        </ContainerEditDeleteObs>
        <ContainerEditDeleteObs onClick={() => setState({ openModalDelete: true, item: obs })}>
          <DeleteNotificationIcon width="20px" height="18px" />
        </ContainerEditDeleteObs>
      </IconsContainerObs>
    );
  }
  return <></>;
}

function ModalAddEditObservations({
  closeModal,
  isEdit,
  item,
  unitId,
  getObservations,
}) {
  const [text, setText] = useState<string>(item?.OBS || '');
  const [state, _render, setState] = useStateVar({
    item: {
      ID: item?.ID || null,
      UNIT_ID: unitId,
      ISVISIBLE: item?.ISVISIBLE || 0,
      DATE_OBS: item?.DATE_OBS || moment().toISOString(),
      OBS: item?.OBS || '',
    },
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  async function handleSendObs() {
    if (state.item.OBS.length > 1500) {
      toast.error(t('observacaoMuitoGrande'));
      return;
    }
    setState({ item: { ...state.item, OBS: text } });
    try {
      const isVisible = isEdit ? (state.item.ISVISIBLE ? 1 : 0) : (state.item.ISVISIBLE ? 0 : 1);
      await apiCall('/unit/set-observation', { ...state.item, ISVISIBLE: isVisible });
      closeModal();
      getObservations();
      if (isEdit) {
        toast.success(t('sucessoEditarObs'));
      } else {
        toast.success(t('sucessoCriarObs'));
      }
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  return (
    <ModalWindow borderTop onClickOutside={() => closeModal()} style={{ width: '400px' }}>
      <h3><strong>{isEdit ? t('editarObservacao') : t('adicionarObservacao')}</strong></h3>
      <span style={{
        color: '#373737', fontSize: 12, display: 'flex', alignItems: 'center',
      }}
      >
        <strong style={{ marginRight: 4 }}>{t('descricao')}</strong>
        <InfoIcon data-tip data-for="info-description" width="11px" />
        <ReactTooltip
          id="info-description"
          place="top"
          effect="solid"
        >
          <HoverExportList>
            {t('infoDescriptionObservation')}
          </HoverExportList>
        </ReactTooltip>
      </span>
      <textarea
        ref={textAreaRef}
        style={{
          width: '100%', borderRadius: 5, borderColor: '#D1D1D1', minHeight: 150, marginTop: 8,
        }}
        onChange={(event) => setText(event.target.value)}
      >
        {text}
      </textarea>
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0px' }}>
        <Checkbox
          checked={isEdit ? !state.item.ISVISIBLE : state.item.ISVISIBLE}
          onClick={() => {
            setState({ item: { ...state.item, ISVISIBLE: !state.item.ISVISIBLE } });
          }}
          size={13}
          borderRadius={3}
          color="primary"
        />
        <span style={{ fontSize: 11, marginLeft: 6 }}>{t('inibirVisualizacaoObservacao')}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button variant="primary" style={{ width: 200, marginBottom: 10, marginTop: 6 }} onClick={() => handleSendObs()}>{isEdit ? t('editar') : t('adicionar')}</Button>
        <p style={{ color: '#202370', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => closeModal()}>{t('cancelar')}</p>
      </div>
    </ModalWindow>
  );
}

function ModalDeleteObservation({
  item, closeModal, getObservations, unitId,
}) {
  async function deleteObs() {
    try {
      await apiCall('/unit/delete-observation', { observation: { ID: item.ID }, unitId });
      closeModal();
      getObservations();
      toast.success(t('sucessoDeletandoObs'));
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }
  return (
    <ModalWindow borderTop onClickOutside={() => closeModal()} style={{ width: '400px' }}>
      <h3><strong>{t('deletarObservacao')}</strong></h3>
      <span>{t('voceTemCertezaDeletarObservacao')}</span>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0px',
        }}
      >
        <p style={{ color: '#202370', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => closeModal()}>{t('cancelar')}</p>
        <Button variant="primary" style={{ width: 200, marginBottom: 10 }} onClick={() => deleteObs()}>{t('deletar')}</Button>
      </div>
    </ModalWindow>
  );
}

function TextObservation({
  obs,
}) {
  const show = (obs.OBS.length > 190);
  const [expand, setExpand] = useState(false);
  const [html, setHtml] = useState('');

  const handleChange = () => {
    const inputValue = obs.OBS;
    const lines = inputValue.split('\n');

    const updatedHtml = lines.map((line, index) => {
      if (line.startsWith('- ')) {
        return `<ul><li>${line.substring(2)}</li></ul>`;
      }
      return `<p>${line}</p>`;
    }).join('\n').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const clean = DOMPurify.sanitize(updatedHtml);
    setHtml(clean);
  };

  useEffect(() => {
    handleChange();
  }, [obs]);

  if (expand) {
    return (
      <>
        <TextObsUnitExpand>
          <TextWithHtml htmlContent={html} />
        </TextObsUnitExpand>
        <span style={{ cursor: 'pointer', color: '#363BC4' }} onClick={() => setExpand(!expand)}>{t('verMenos')}</span>
      </>
    );
  }
  return (
    <TextObsUnit>
      <TextWithHtml htmlContent={html.slice(0, 190)} />
      {show && <>...</>}
      {show && <span style={{ cursor: 'pointer', color: '#363BC4' }} onClick={() => setExpand(!expand)}>{t('verMais')}</span>}
    </TextObsUnit>
  );
}

function TextWithHtml({ htmlContent }) {
  const parsedHtml = ReactHtmlParser(htmlContent);
  return (
    <ContainerHtmlObs>
      {parsedHtml.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ))}
    </ContainerHtmlObs>
  );
}
