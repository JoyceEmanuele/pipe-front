import {
  useState, useEffect, useRef, useMemo,
} from 'react';
import { t } from 'i18next';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import { useHistory } from 'react-router-dom';

import {
  Loader, ActionButton, RadioButton, Button, ModalWindow, Card,
} from 'components';
import { formatHealthIcon, labelDescHealth } from 'components/HealthIcon';
import { TextArea } from '~/components/NewInputs/TextArea';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import {
  DeleteOutlineIcon,
  AcceptIcon,
  EditIcon,
} from 'icons';
import { applyActionToSelectedDacs } from '~/pages/Admin/FaultsList';
import { ApiResps, apiCall } from 'providers';
import { colors } from 'styles/colors';
import { useTranslation } from 'react-i18next';

import {
  SelectedStatusText,
  StatusText,
  StyledBox,
  Icon,
  CardWrapper,
  CardTitle,
  GreenButton,
  YellowButton,
  OrangeButton,
  RedButton,
  GreyButton,
  DarkGreyButton,
  SaveButton,
  TContainer,
  THeader,
  TableHead,
  TableBody,
  HeaderTitle,
  Data,
  DataCentered,
  Row,
  BtnExport,
  ExportWorksheet,
  Text,
} from './styles';
import styled from 'styled-components';
import { generateNameFormatted } from '~/helpers/titleHelper';

const CSVheader = [
  { label: t('dispositivo'), key: 'id' },
  { label: t('status'), key: 'status' },
  { label: t('descricao'), key: 'descricao' },
  { label: t('data'), key: 'data' },
  { label: t('causa'), key: 'causa' },
  { label: t('tipoDeMudanca'), key: 'tipo' },
];

export interface ObservationInfo {
  devId: string;
  date: string;
  OBS_DESC: string;
  userId: string;
  observationId: string;
}

export const Health = (): JSX.Element => {
  const { devId } = useParams<{ devId: string }>();
  const [profile] = useState(getUserProfile);
  const [descObs, setDescObs] = useState<string>();
  const csvLinkEl = useRef();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    devInfo: getCachedDevInfoSync(devId),
    healthIndexes: {},
    currentHealthIndex: null as null|number,
    currentHealthTitle: null as null|string,
    currentLaudo: null as null|string,
    currentPosCauses: [] as string[],
    selectedLevelTitle: null as null|string,
    isLoading: false,
    newHealthIndex: null as null|number,
    showAddObservation: false as boolean,
    newLaudo: null as null|string,
    detectedFaults: [] as { origin: string; faultId: string; faultDesc: string; severity: string; faultLevel: number; actionAprove: boolean; actionTaken?: string; origem: string; lastAction:string }[],
    healthHist: [] as { devId: string; assetId: number; date: string; DAT_REPORT: number; healthIndex: string; H_INDEX: number; possCauses: string[]; UNIT_ID: number; desc: string; changeType: string; }[],
    observations: [] as { devId: string; date: string; OBS_DESC: string; userId: string; observationId: string;}[],
    modalEditObservation: null as null|{
      addEdit: 'Add'|'Edit'
      observationId: string
    },
    laudos: [] as {
      text: string;
      application: string[];
      pcauses?: string[];
      fullText?: string;
    }[],
    csvData: [] as {}[],
    assetLayout: false as boolean,
  });

  const CSVheader = [
    { label: t('dispositivo'), key: 'id' },
    { label: t('status'), key: 'status' },
    { label: t('descricao'), key: 'descricao' },
    { label: t('data'), key: 'data' },
    { label: t('causa'), key: 'causa' },
    { label: t('tipoMudanca'), key: 'tipo' },
  ];

  const history = useHistory();
  const linkBase = history.location.pathname;
  state.assetLayout = linkBase.includes('/ativo');

  function filterLaudo(laudos: typeof state.laudos, selector?: string) {
    return laudos.filter((item) => {
      if (!item.application) return true;
      if (!selector) return true;
      if (selector === 'DUO') return true; // provisoriamente, fazemos aparecer todos os laudos para DUT duo.
      return item.application.includes(selector);
    });
  }

  function buildLaudoFullText(laudo: typeof state.laudos[number], pcauses: { [k: string]: { text: string } }) {
    laudo.fullText = laudo.text;
    if (!laudo.pcauses) return laudo;
    const causesDesc = laudo.pcauses.map((id) => (pcauses?.[id]?.text)).filter((x) => !!x);
    if (causesDesc.length === 0) return laudo;
    laudo.fullText += ` (${causesDesc.join(', ')})`;
    return laudo;
  }

  function buildDetectedFault(
    faultData: {
      origin: string,
      id: string,
      faultName: string,
      faultLevel: number,
      lastAction: string,
      lastActionTime: number
    },
    healthIndexes: { [k: string]: { titulo: string }},
  ) {
    const fdata = {
      origin: faultData.origin,
      faultId: faultData.id,
      faultDesc: faultData.faultName,
      severity: (healthIndexes[String(faultData.faultLevel)] || {}).titulo || '?',
      faultLevel: faultData.faultLevel,
      actionAprove: true,
      actionTaken: undefined as string|undefined,
      origem: faultData.origin,
      lastAction: faultData.lastAction,
    };
    if (faultData.lastActionTime) {
      const limit24h = Date.now() - 24 * 60 * 60 * 1000;
      const actionTime = new Date(faultData.lastActionTime);
      if (actionTime.getTime() > limit24h) {
        fdata.actionTaken = `${faultData.lastAction} ${actionTime.toLocaleString()}`;
        fdata.actionAprove = false;
      }
    }
    return fdata;
  }

  async function verifyHealthStatus(healthStatus: ApiResps['/asset/get-health-status']['healthStatus'], healthIndexes: ApiResps['/faults/get-fault-codes']['healthIndexes']) {
    if (healthStatus) {
      state.detectedFaults = [];
      if (healthStatus.fdetected) {
        healthStatus.fdetected.forEach((faultData) => {
          const fdata = buildDetectedFault(faultData, healthIndexes);
          state.detectedFaults.push(fdata);
        });
      }
    }
  }

  async function handleGetDevHealth() {
    try {
      setState({ isLoading: true });

      const devInfo = await getCachedDevInfo(devId);
      state.devInfo = devInfo;

      if (devInfo?.ASSET_ID) {
        const [{ possibleCauses, healthIndexes, laudos },
          { list: healthList },
          { healthStatus }] = await Promise.all([
          apiCall('/faults/get-fault-codes', {}),
          apiCall('/asset/get-health-hist', { assetId: devInfo.ASSET_ID }),
          apiCall('/asset/get-health-status', { ASSET_ID: devInfo.ASSET_ID }),
        ]);

        const assetTypeSelector = devInfo?.dac?.DAC_APPL ?? devInfo?.dut?.PLACEMENT;

        state.healthIndexes = (healthIndexes || {});
        state.healthHist = (healthList || []);
        state.laudos = (laudos || []);
        state.currentHealthIndex = healthStatus.H_INDEX;
        state.currentHealthTitle = ((state.healthIndexes || {})[String(healthStatus.H_INDEX)] || {}).titulo;
        state.currentLaudo = healthStatus.H_DESC;
        state.currentPosCauses = (healthStatus.P_CAUSES || '')
          .split(',')
          .map((id) => (possibleCauses?.[id]?.text))
          .filter((x) => !!x);
        for (const laudo of state.laudos) {
          buildLaudoFullText(laudo, possibleCauses);
        }

        verifyHealthStatus(healthStatus, healthIndexes);

        state.laudos = filterLaudo(state.laudos, assetTypeSelector);
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erroSaudeMaquinas'));
    }
    setState({ isLoading: false });
  }

  async function saveHealthInfo() {
    try {
      if (!state.devInfo.ASSET_ID) {
        toast.warn(t('erroSalvarSaudeSemAtivoRelacionado'));
        return;
      }
      const selectedLaudo = (state.newLaudo && state.laudos.find((x) => (x.fullText === state.newLaudo))) || null;
      if ((!selectedLaudo) && (state.newHealthIndex !== 100)) {
        toast.error(t('errorSelecioneLaudo'));
        return;
      }
      if (state.newHealthIndex == null) {
        toast.error(t('erroIndiceSaude'));
        return;
      }
      await apiCall('/asset/save-health-info', {
        assetId: state.devInfo.ASSET_ID,
        healthIndex: state.newHealthIndex,
        possibleCauses: selectedLaudo && selectedLaudo.pcauses,
        laudo: selectedLaudo && selectedLaudo.text,
      });
      toast.success(t('sucessoSalvar'));
      state.newHealthIndex = null;
      state.newLaudo = null;
      render();
      await handleGetDevHealth();
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }

  const getCsvData = async () => {
    state.isLoading = true; render();
    const formattedCSV = [] as any;
    try {
      if (state.healthHist) {
        state.healthHist.forEach((item) => {
          formattedCSV.push({
            id: item.devId,
            status: labelDescHealth(item.H_INDEX),
            descricao: item.desc,
            data: new Date(item.date).toLocaleString('pt-BR'),
            causa: (item.possCauses && (item.possCauses.length > 0)) && (
              item.possCauses.map((cause) => `• ${cause}\n`).join('')
            ),
            tipo: item.changeType,
          });
        });

        state.csvData = formattedCSV;
        render();
        setTimeout(() => {
          (csvLinkEl as any).current.link.click();
        }, 1000);

        state.isLoading = false; render();
      }
      else {
        toast.info(t('naoHaDadosSaudeParaExportar')); state.isLoading = false;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); state.isLoading = false; }
  };

  async function wantDeleteHistoryEvent(item: {
    devId: string;
    assetId: number;
    date: string;
    DAT_REPORT: number;
    desc: string;
    changeType: string;
    healthIndex: string;
    possCauses: string[];
    UNIT_ID: number;
    H_INDEX: number;
  }) {
    if (window.confirm(`${t('desejaExcluir')} "${item.desc}" [${item.changeType}]?`)) {
      await apiCall('/asset/delete-health-hist', {
        assetId: item.assetId,
        itemDate: item.DAT_REPORT,
        healthIndex: item.H_INDEX,
      });
      window.location.reload();
    }
  }

  async function getObservations() {
    if ((profile.manageAllClients || profile.permissions.isInstaller) && state.devInfo?.ASSET_ID) {
      const { list: observationsList } = await apiCall('/asset/get-observation', { assetId: state.devInfo.ASSET_ID });
      setState({
        observations: (observationsList || []),
      });
    }
  }

  useEffect(() => {
    handleGetDevHealth();
  }, []);

  useMemo(async () => {
    getObservations();
  }, []);

  function onLevelClick(newHealthIndex: number) {
    const selectedLevelTitle = ((state.healthIndexes || {})[String(newHealthIndex)] || {}).titulo;
    if (newHealthIndex === 100) state.newLaudo = null;
    setState({ newHealthIndex, selectedLevelTitle });
  }

  async function wantDeleteObservation(item: ObservationInfo) {
    if (profile.manageAllClients || profile.permissions.isInstaller)
    {
      try {
        if (window.confirm(`${t('desejaExcluir')} "${item.OBS_DESC}"?`))
        {
          const itemDate = Math.round(new Date(item.date).getTime() / 1000);
          await apiCall('/asset/delete-observation', {
            assetId: state.devInfo.ASSET_ID,
            itemDate,
          });
          toast.success(t('observacaoExcluida'));
          window.location.reload();
        }
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
    }
  }

  function wantEditAddProgramming(item?: ObservationInfo) {
    try {
      state.modalEditObservation = {
        addEdit: item ? 'Edit' : 'Add',
        observationId: (item && item.observationId) || '',
      };
      setDescObs((item && item.OBS_DESC) || '');
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  async function saveNewObservation() {
    if (!state.devInfo.ASSET_ID) {
      toast.warn(t('erroAdicionarObservacaoSemAtivoRelacionado'));
    } else if (profile.manageAllClients || profile.permissions.isInstaller)
    {
      try {
        await apiCall('/asset/save-observation-info', {
          assetId: state.devInfo.ASSET_ID,
          observationDesc: descObs,
        });
        state.modalEditObservation = null;
        toast.success(t('sucessoSalvar'));
        window.location.reload();
      } catch (err) {
        console.log(err);
        toast.error('Erro');
      }
    }
  }

  async function editObservation() {
    if (profile.manageAllClients || profile.permissions.isInstaller)
    {
      try {
        await apiCall('/asset/edit-observation-info', {
          observationId: state.modalEditObservation!.observationId,
          observationDesc: descObs,
        });
        state.modalEditObservation = null;
        toast.success(t('sucessoSalvar'));
        window.location.reload();
      } catch (err) {
        console.log(err);
        toast.error('Erro');
      }
    }
  }

  function showAddObservation() {
    try {
      state.showAddObservation = true;
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devInfo?.DEV_ID, t('saude'))}</title>
      </Helmet>
      {(state.isLoading)
        && (
        <Flex alignItems="center" justifyContent="center" mt="32px">
          <Box width={1} alignItems="center" justifyContent="center">
            <Loader />
          </Box>
        </Flex>
        )}
      {(!state.isLoading)
        && (
        <Flex flexDirection="column">
          <Box mt="32px" width="100%">
            <CardWrapper>
              <Flex alignItems="center" justifyContent={['center', 'center', 'center', 'flex-start', 'flex-start']}>
                <StyledBox health={25} selected={state.currentHealthIndex === 25}>
                  <Icon>
                    {formatHealthIcon(25)}
                  </Icon>
                  <SelectedStatusText health={state.currentHealthIndex || 0}>{state.currentHealthTitle}</SelectedStatusText>
                </StyledBox>
                <StyledBox health={50} selected={state.currentHealthIndex === 50}>
                  <Icon>
                    {formatHealthIcon(50)}
                  </Icon>
                </StyledBox>
                <StyledBox health={75} selected={state.currentHealthIndex === 75}>
                  <Icon>
                    {formatHealthIcon(75)}
                  </Icon>
                </StyledBox>
                <StyledBox health={100} selected={state.currentHealthIndex === 100}>
                  <Icon>
                    {formatHealthIcon(100)}
                  </Icon>
                </StyledBox>
                <StyledBox health={0} selected={![4, 25, 50, 75, 100].includes(state.currentHealthIndex!)}>
                  <Icon>
                    {formatHealthIcon(0)}
                  </Icon>
                </StyledBox>
                <StyledBox health={4} selected={state.currentHealthIndex === 4}>
                  <Icon>
                    {formatHealthIcon(4)}
                  </Icon>
                </StyledBox>
              </Flex>
              <Flex mt="16px" style={{ color: colors.Grey400 }}>
                <Box>
                  {(state.currentLaudo)
                    && (
                    <>
                      <StatusText isBold>{t('laudoTecnico')}</StatusText>
                      <StatusText>{state.currentLaudo}</StatusText>
                    </>
                    )}
                  {((state.currentPosCauses || []).length === 1)
                    && (
                    <div>
                      {`${t('possiveisCausas')}: `}
                      {state.currentPosCauses[0]}
                    </div>
                    )}
                  {((state.currentPosCauses || []).length > 1)
                    && (
                    <div>
                      {`${t('possiveisCausas')}: `}
                      {state.currentPosCauses.map((cause) => (
                        <div>
                          -
                          {' '}
                          {cause}
                        </div>
                      ))}
                    </div>
                    )}
                </Box>
              </Flex>
            </CardWrapper>
          </Box>
          {profile.permissions.HEALTH_MANAGEMENT && (
          <CardWrapper style={{ marginTop: '32px' }}>
            <CardTitle>{t('editarSaude')}</CardTitle>
            <div>
              <div style={{ paddingBottom: '20px', paddingTop: '20px' }}>
                <GreenButton selected={state.newHealthIndex === 100} onClick={() => onLevelClick(100)}>{t('corVerde')}</GreenButton>
                <YellowButton selected={state.newHealthIndex === 75} onClick={() => onLevelClick(75)}>{t('corAmarelo')}</YellowButton>
                <OrangeButton selected={state.newHealthIndex === 50} onClick={() => onLevelClick(50)}>{t('corLaranja')}</OrangeButton>
                <RedButton selected={state.newHealthIndex === 25} onClick={() => onLevelClick(25)}>{t('corVermelho')}</RedButton>
                <GreyButton selected={state.newHealthIndex === 3} onClick={() => onLevelClick(3)}>{t('corCinza')}</GreyButton>
                <DarkGreyButton selected={state.newHealthIndex === 4} onClick={() => onLevelClick(4)}>{t('desativado')}</DarkGreyButton>
              </div>
              {(state.newHealthIndex != null)
                  && (
                  <div>
                    <div style={{ paddingBottom: '20px', color: colors.Grey400 }}>
                      {t('nivel')}
                      {' '}
                      {state.selectedLevelTitle || '?'}
                    </div>
                    {state.laudos.map((item) => (
                      <div>
                        <RadioButton
                          key={item.fullText}
                          label={item.fullText}
                          checked={state.newLaudo === item.fullText}
                          onClick={() => setState({ newLaudo: item.fullText })}
                          style={{ marginTop: '5px' }}
                        />
                      </div>
                    ))}
                    <div>
                      <SaveButton variant="primary" style={{ marginTop: '15px' }} onClick={() => saveHealthInfo()}>{t('salvar')}</SaveButton>
                    </div>
                  </div>
                  )}
            </div>
          </CardWrapper>
          )}
          {(profile.permissions.HEALTH_MANAGEMENT && (state.detectedFaults?.length > 0) && !profile.permissions.isInstaller) && (
          <CardWrapper style={{ marginTop: '32px' }}>
            <CardTitle>{t('falhasDetectadas')}</CardTitle>
            <TContainer>
              <TableHead>
                <Row>
                  <THeader>
                    <HeaderTitle>
                      <span>{t('origem')}</span>
                    </HeaderTitle>
                  </THeader>
                  <THeader>
                    <HeaderTitle>
                      <span>{t('gravidade')}</span>
                    </HeaderTitle>
                  </THeader>
                  <THeader>
                    <HeaderTitle>
                      <span>{t('falha')}</span>
                    </HeaderTitle>
                  </THeader>
                  <THeader>
                    <HeaderTitle>
                      <span>&nbsp;</span>
                    </HeaderTitle>
                  </THeader>
                </Row>
              </TableHead>
              <TableBody>
                {state.detectedFaults.map((item) => (
                  <Row key={item.faultId}>
                    <Data>
                      {item.origem}
                    </Data>
                    <Data>
                      {item.severity}
                    </Data>
                    <Data>
                      {item.faultDesc}
                    </Data>
                    <Data>
                      {item.actionAprove && (
                      <>
                        <ActionButton onClick={() => applyActionToSelectedDacs('approve', [{ devId, faultId: item.faultId, state: item.lastAction }])} variant="blue-inv"><AcceptIcon color={colors.LightBlue} /></ActionButton>
                        <ActionButton onClick={() => applyActionToSelectedDacs('reject', [{ devId, faultId: item.faultId, state: item.lastAction }])} variant="red-inv"><DeleteOutlineIcon colors={colors.Red} /></ActionButton>
                      </>
                      )}
                      {item.actionTaken || ''}
                    </Data>
                  </Row>
                ))}
              </TableBody>
            </TContainer>
          </CardWrapper>
          )}
          {(state.healthHist
            && (
            <CardWrapper style={{ marginTop: '32px' }}>
              <Flex alignItems="center" justifyContent="space-between" mt="32px">
                <CardTitle>{t('historicoSaude')}</CardTitle>
                <Flex alignItems="center" justifyContent="right" mt="32">
                  <BtnExport variant={state.isLoading ? 'disabled' : 'primary'} onClick={getCsvData}>
                    <div>
                      <ExportWorksheet />
                      <Text style={{ paddingLeft: '5px' }}>
                        {t('exportarPlanilha')}
                      </Text>
                    </div>
                  </BtnExport>
                  <CSVLink
                    headers={CSVheader}
                    data={state.csvData}
                    filename={t('historicoDeSaudeDoDispositivosCsv')}
                    separator=";"
                    asyncOnClick
                    enclosingCharacter={"'"}
                    ref={csvLinkEl}
                  />
                </Flex>
              </Flex>
              <TContainer>
                <TableHead>
                  <Row>
                    <THeader>
                      <HeaderTitle>
                        <span>&nbsp;</span>
                      </HeaderTitle>
                    </THeader>
                    <THeader>
                      <HeaderTitle>
                        <span>{t('descricao')}</span>
                      </HeaderTitle>
                    </THeader>
                    <THeader>
                      <HeaderTitle>
                        <span>{t('data')}</span>
                      </HeaderTitle>
                    </THeader>
                    <THeader>
                      <HeaderTitle>
                        <span>{t('causas')}</span>
                      </HeaderTitle>
                    </THeader>
                    {(profile.manageAllClients) && (
                    <THeader>
                      <HeaderTitle>
                        <span>{t('tipoDeMudanca')}</span>
                      </HeaderTitle>
                    </THeader>
                    )}
                    {(profile.permissions.HEALTH_MANAGEMENT) && (
                    <THeader>
                      <HeaderTitle>
                        <span>&nbsp;</span>
                      </HeaderTitle>
                    </THeader>
                    )}
                  </Row>
                </TableHead>
                <TableBody>
                  {state.healthHist.map((item) => (
                    <Row key={Math.random().toString(36).substring(2, 11)}>
                      <DataCentered>
                        <StyledBox health={item.H_INDEX} selected={false} style={{ display: 'inline-block' }}>
                          <Icon>
                            {formatHealthIcon(item.H_INDEX)}
                          </Icon>
                        </StyledBox>
                      </DataCentered>
                      <Data>
                        {item.desc}
                      </Data>
                      <Data>
                        {new Date(item.date).toLocaleString('pt-BR')}
                      </Data>
                      <Data>
                        {(item.possCauses && (item.possCauses.length > 0)) && (
                        <ul>
                          {item.possCauses.map((cause) => <li key={Math.random().toString(36).substr(2, 9)}>{cause}</li>)}
                        </ul>
                        )}
                      </Data>
                      {(profile.manageAllClients) && (
                      <Data>
                        {item.changeType}
                      </Data>
                      )}
                      {(profile.permissions.HEALTH_MANAGEMENT) && (
                      <Data>
                        <ActionButton onClick={() => wantDeleteHistoryEvent(item)} variant="red-inv"><DeleteOutlineIcon colors={colors.Red} /></ActionButton>
                      </Data>
                      )}
                    </Row>
                  ))}
                </TableBody>
              </TContainer>
            </CardWrapper>
            )
          )}

          {((profile.manageAllClients || profile.permissions.isInstaller) && state.observations) && (
          <CardWrapper style={{ marginTop: '32px' }}>
            <Flex alignItems="center" justifyContent="space-between" mt="32px">
              <CardTitle>{t('observacoes')}</CardTitle>
              <Flex alignItems="center" justifyContent="right" mt="32">
                <Button
                  variant="primary"
                  style={{ width: 'fit-content', padding: '6px 15px', backgroundColor: '#363BC4' }}
                  onClick={() =>
                  { showAddObservation();
                    wantEditAddProgramming(); }}
                >
                  {t('adicionarObservacao')}
                </Button>
              </Flex>
            </Flex>
            <TContainer>
              <TableHead>
                <Row>
                  <THeader>
                    <HeaderTitle>
                      <span>{t('descricao')}</span>
                    </HeaderTitle>
                  </THeader>
                  <THeader>
                    <HeaderTitle>
                      <span>{t('data')}</span>
                    </HeaderTitle>
                  </THeader>
                  <THeader>
                    <HeaderTitle>
                      <span>{t('usuario')}</span>
                    </HeaderTitle>
                  </THeader>
                  <THeader>
                    <HeaderTitle>
                      <span>&nbsp;</span>
                    </HeaderTitle>
                  </THeader>

                </Row>
              </TableHead>
              <TableBody>
                {state.observations.map((item) => (
                  <Row key={item.observationId}>
                    <Data>
                      {item.OBS_DESC}
                    </Data>
                    <Data>
                      {new Date(item.date).toLocaleString('pt-BR')}
                    </Data>
                    <Data>
                      {item.userId}
                    </Data>
                    <Data>
                      <ActionButton onClick={() => wantEditAddProgramming(item)} variant="blue-inv"><EditIcon width="18px" color={colors.Blue300} /></ActionButton>
                      <ActionButton onClick={() => wantDeleteObservation(item)} variant="red-inv"><DeleteOutlineIcon colors={colors.Red} /></ActionButton>
                    </Data>
                  </Row>
                ))}
              </TableBody>
            </TContainer>
          </CardWrapper>
          )}

          {state.modalEditObservation && (
          <div style={{ zIndex: 3, position: 'sticky' }}>
            <ModalWindow
              style={{
                padding: '0px',
                marginBottom: 'auto',
                marginTop: '8%',
                minWidth: '500px',
                zIndex: 5,
              }}
              topBorder
              onClickOutside={() => {
                setState({ modalEditObservation: null });
              }}
            >
              <Card>
                <Flex flexDirection="column">
                  <span style={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '15px',
                    lineHeight: ' 18px',
                    marginBottom: '18px',
                    color: ' #000',
                  }}
                  >
                    {`${state.modalEditObservation.addEdit === 'Edit' ? t('botaoEditar') : t('adicionar')} ${t('observacao')}`}
                  </span>

                  <span style={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '12px',
                    lineHeight: ' 15px',
                    marginBottom: '9px',
                    color: ' #000',
                  }}
                  >
                    {t('descricao')}
                  </span>

                  <TextArea
                    value={descObs}
                    onChange={setDescObs}
                    error={undefined}
                    style={{
                      width: '100%',
                      marginBottom: '26px',
                      padding: '5px',
                    }}
                    maxLength={250}
                  />

                  <Button
                    variant="primary"
                    style={{
                      width: 'fit-content', padding: '6px 15px', backgroundColor: '#363BC4', marginInline: 'auto', marginBottom: '22px',
                    }}
                    onClick={() => {
                      state.modalEditObservation?.addEdit === 'Edit' ? editObservation() : saveNewObservation();
                    }}
                  >
                    {state.modalEditObservation?.addEdit === 'Edit' ? t('salvar') : t('adicionar')}
                  </Button>
                  <CancelButton
                    onClick={() => {
                      setState({ modalEditObservation: null });
                    }}
                  >
                    {t('cancelar')}
                  </CancelButton>
                </Flex>

              </Card>
            </ModalWindow>
          </div>
          )}

        </Flex>
        )}
    </>
  );
};

const CancelButton = styled.a`
  display: flex;
  justify-content: center;
  font-family: 'Inter';
  font-size: 13px;
  line-height: 16px;
  color: #202370;
  margin-inline: auto;
  text-decoration-line: underline;
`;
