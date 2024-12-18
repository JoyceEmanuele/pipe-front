import { useEffect, useRef, useMemo } from 'react';

import moment from 'moment';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Box } from 'reflexbox';

import {
  Loader, Button, ActionButton, ModalWindow, Input, InputSearch,
} from 'components';
import queryString from 'query-string';
import { useStateVar } from 'helpers/useStateVar';
import { EditIcon } from 'icons';
import { apiCall, ApiResps } from 'providers';
import { colors } from 'styles/colors';
import ReactTooltip from 'react-tooltip';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { AdminLayout } from '../AdminLayout';
import {
  TableContainer,
  TableHead,
  TableBody,
  HeaderCell,
  DataCell,
  DataCellCenter,
  DataCellRight,
  Row,
  HeaderRow,
  CustomSelect,
  ChevronTop,
  ChevronBottom,
  StyledLink,
  HeaderCellOrder,
} from './styles';

import 'moment/locale/pt-br';

import { withTransaction } from '@elastic/apm-rum-react';
import { Headers2 } from '~/pages/Analysis/Header';
import { Pagination } from '~/components/NewTable';
import { UtilFilter } from '~/pages/Analysis/Utilities/UtilityFilter';
import { StatusIcon } from '~/pages/Analysis/AnalysisLayout/styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

function sizeToByteConversion(size: number, measure: string) {
  switch (measure.toLowerCase()) {
    case 'kb':
      return size * 1024;
    case 'mb':
      return size * 1048576;
    case 'gb':
      return size * 1073741824;
    default:
      return size;
  }
}

function dynamicSort(property: string, sortOrder: '+'|'-') {
  return function (a, b) {
    let aa;
    let bb;
    if (property === 'line__total_f') {
      aa = sizeToByteConversion(parseFloat(a[property]?.split(' ')[0]), a[property]?.split(' ')[1]);
      bb = sizeToByteConversion(parseFloat(b[property]?.split(' ')[0]), b[property]?.split(' ')[1]);
    } else {
      aa = a[property];
      bb = b[property];
    }
    // equal items sort equally
    if (aa === bb) {
      return 0;
    }
    // nulls sort after anything else
    if (aa == null) {
      return 1;
    }
    if (bb == null) {
      return -1;
    }
    // otherwise...
    if (sortOrder === '+') {
      // if we're ascending, lowest sorts first
      return aa < bb ? -1 : 1;
    }
    // if descending, highest sorts first
    return aa < bb ? 1 : -1;
  };
}

// type SimCardItem = NonNullable<ApiResps['/sims-v2']['tns']>[number]&{ consumptionPercent?: number }
type SimCardItem = {
  iccid: string
  onlineStatus: string
  soldplan: string
  lastConn: string | undefined
  lastDisc?: string|null
  consumption?: string|null
  clientId: number
  clientName: string
  unitId: number
  unitName: string
  accessPoint: string
  modem: string
  accessPointMAC: string
  repeaterMAC: string
  empresa: string
  consumptionPercent: number
  associationDate?: string|null
  stateId: number
  cityId: number
}

export const SimCards = (): JSX.Element => {
  const history = useHistory();
  const queryPars = queryString.parse(history.location.search);
  const [state, render, setState] = useStateVar({
    simCardsList: [] as SimCardItem[],
    simCardsListFiltered: [] as SimCardItem[],
    loading: true,
    openModal: false,
    selectedSim: null as null|SimCardItem,
    searchState: '',
    orderColum: '',
    sortOrder: '+' as '+'|'-',
    resetSolicitado: [] as string[],
    pageSize: 40,
    currentPage: 1,
    selectedConnection: '' as string | string[],
    selectedState: '' as string | string[],
    selectedCity: '' as string | string[],
    selectedClientFilter: '' as string | string[],
    selectedUnit: '' as string | string[],
    totalItems: 0,
  });

  const linkBase = history.location.pathname;
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
    setState({ currentPage: 1 });
  }, [queryPars.empresa]);

  const getDataPerPage = useMemo(() => getPages(), [state.simCardsListFiltered, state.currentPage, state.pageSize]);

  function getPages() {
    return state.simCardsListFiltered.map((item, index) => ({ ...item, key: `${index} ${item.iccid}` })).slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize);
  }
  const allTabs = [
    {
      title: 'TNS',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, empresa: 'tns' })}`,
      isActive: (queryPars.empresa === 'tns' || !queryPars.empresa),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Meta',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, empresa: 'meta' })}`,
      isActive: (queryPars.empresa === 'meta'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Vivo Kite',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, empresa: 'kite' })}`,
      isActive: queryPars.empresa === 'kite',
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Todos',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, empresa: 'todos' })}`,
      isActive: (queryPars.empresa === 'todos'),
      visible: true,
      ref: useRef(null),
    },
  ];

  function openEditSimCard(itemToEdit: SimCardItem) {
    state.selectedSim = itemToEdit;
    state.openModal = true;
    render();
  }

  async function afterEditSim() {
    try {
      state.openModal = false;
      await fetchData();
      render();

      toast.success(t('sucesso'));
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  function setOrderColum(column: string) {
    if (state.orderColum !== column || state.sortOrder === '-') {
      setState({ simCardsListFiltered: state.simCardsListFiltered.sort(dynamicSort(column, '+')) });
      state.sortOrder = '+';
    } else {
      setState({ simCardsListFiltered: state.simCardsListFiltered.sort(dynamicSort(column, '-')) });
      state.sortOrder = '-';
    }
    setState({ currentPage: 1 });
    applyTextFilter();
    state.orderColum = column;
    render();
  }

  function chevron(column: string) {
    if (state.orderColum === column) {
      if (state.sortOrder === '+') {
        return <ChevronTop />;
      }

      return <ChevronBottom />;
    }
  }

  function formatSimTns(response: ApiResps['/sims-v2']) {
    for (const sim of (response.tns || [])) {
      const [planSize, planMeasure] = sim.soldplan__consumption_f.split(' ');
      const [consumptionSize, consumptionMeasure] = sim.line__total_f.split(' ');
      let consumptionMB = 0;
      if (consumptionMeasure === 'GB') {
        consumptionMB = parseFloat(consumptionSize) * 1000;
      } else if (consumptionMeasure === 'B') {
        consumptionMB = parseFloat(consumptionSize) / 0.000001;
      } else {
        consumptionMB = parseFloat(consumptionSize);
      }
      let consumptionPercent = 0;
      if (parseFloat(consumptionSize) === 0) {
        consumptionPercent = 0;
      } else if (planMeasure === consumptionMeasure) {
        consumptionPercent = parseFloat(consumptionSize) * 100 / parseFloat(planSize);
      } else {
        const planSizeInBytes = sizeToByteConversion(parseFloat(planSize), planMeasure);
        const consumptionSizeInBytes = sizeToByteConversion(parseFloat(consumptionSize), consumptionMeasure);
        consumptionPercent = consumptionSizeInBytes * 100 / planSizeInBytes;
      }

      state.simCardsList.push({
        iccid: sim.iccid,
        onlineStatus: sim.status__name,
        soldplan: sim.soldplan__name,
        lastConn: sim.last_conn,
        lastDisc: sim.last_disc,
        consumption: sim.line__total_f,
        clientId: sim.client,
        clientName: sim.clientName,
        unitId: sim.unit,
        unitName: sim.unitName,
        accessPoint: sim.accessPoint,
        modem: sim.modem,
        accessPointMAC: sim.accessPointMAC,
        repeaterMAC: sim.repeaterMAC,
        empresa: 'TNS',
        consumptionPercent,
        consumptionMB,
        associationDate: sim.associationDate,
        cityId: sim.cityId,
        stateId: sim.stateId,
      });
    }
  }

  function getSoldPlanMeta(sim) {
    const soldplan = [] as string[];
    if (sim.operadora) {
      if (sim.operadora === '200') soldplan.push(t('vivo'));
      else soldplan.push(`Operadora-${sim.operadora}`);
    }
    if (sim.reset) {
      if (sim.reset >= 1000) soldplan.push(`${Math.round(sim.reset / 1000 * 10) / 10}GB`);
      else soldplan.push(`${formatNumberWithFractionDigits(Math.round(sim.reset))}MB`);
    }
    if (sim.mensalidade) {
      soldplan.push(`R$${formatNumberWithFractionDigits(sim.mensalidade.toFixed(2), { minimum: 0, maximum: 2 })}`);
    }
    return soldplan;
  }

  function formatSimMeta(response: ApiResps['/sims-v2']) {
    for (const sim of (response.meta || [])) {
      let consumption = null as string|null;
      let consumptionPercent = 0;
      let consumptionMB = 0;
      if (sim.reset && sim.saldo != null && sim.saldo <= sim.reset) {
        consumptionMB = sim.reset - sim.saldo;
        if (consumptionMB >= 1000) consumption = `${Math.round(consumptionMB / 1000 * 100) / 100} GB`;
        else consumption = `${Math.round(consumptionMB * 100) / 100} MB`;
        consumptionPercent = Math.round(consumptionMB / sim.reset * 100);
      }

      let onlineStatus = '';
      if (sim.online === '1') onlineStatus = t('online');
      else if (sim.online === '0') onlineStatus = t('offline');

      const soldplan = getSoldPlanMeta(sim);

      state.simCardsList.push({
        iccid: sim.iccid,
        onlineStatus,
        soldplan: soldplan.join(' '),
        lastConn: sim.ultimaConexao,
        lastDisc: null,
        consumption,
        clientId: sim.client,
        clientName: sim.clientName,
        unitId: sim.unit,
        unitName: sim.unitName,
        accessPoint: sim.accessPoint,
        modem: sim.modem,
        accessPointMAC: sim.accessPointMAC,
        repeaterMAC: sim.repeaterMAC,
        empresa: t('meta'),
        consumptionPercent,
        consumptionMB,
        associationDate: sim.associationDate,
        cityId: sim.cityId,
        stateId: sim.stateId,
      });
    }
  }

  function getSimOperatorVivo(sim) {
    const soldplan = [] as string[];
    if (sim.operator) {
      soldplan.push(sim.operator);
      if (sim.ratType === 1) {
        soldplan.push('3G');
      }
      else if (sim.ratType === 2) {
        soldplan.push('2G');
      }
      else if (sim.ratType === 5) {
        soldplan.push('3.5G');
      }
      else if (sim.ratType === 6) {
        soldplan.push('4G');
      }
      else if (sim.ratType === 8) {
        soldplan.push('NB-IoT');
      }
    }
    return soldplan;
  }

  function formatSimVivo(response: ApiResps['/sims-v2']) {
    for (const sim of (response.vivo || [])) {
      let onlineStatus = '';
      if (sim.gprsStatus?.status === 1) onlineStatus = t('online');
      else if (sim.gprsStatus?.status === 0) onlineStatus = t('offline');
      else if (sim.gprsStatus?.status === 2) onlineStatus = t('inativo');

      const soldplan = getSimOperatorVivo(sim);

      const lastConn = sim.gprsStatus?.status === 1 ? sim.gprsStatus.lastConnStart : '';
      const lastDisc = sim.gprsStatus?.status === 1 ? sim.gprsStatus.lastConnStop : '';
      const gb = 1073741824;
      const mb = 1048576;

      let consumption = null as string|null;
      const consumptionMB = Number((sim.consumptionMonthly.data.value / mb).toFixed(2));
      if (consumptionMB >= 1000) consumption = `${(sim.consumptionMonthly.data.value / gb).toFixed(2)} GB`;
      else if (consumptionMB === 0) consumption = '0.00 B';
      else consumption = `${consumptionMB} MB`;

      state.simCardsList.push({
        iccid: sim.iccid,
        onlineStatus,
        soldplan: soldplan.join(' '),
        lastConn,
        lastDisc,
        consumption,
        clientId: sim.client,
        clientName: sim.clientName,
        unitId: sim.unit,
        unitName: sim.unitName,
        accessPoint: sim.accessPoint,
        modem: sim.modem,
        accessPointMAC: sim.accessPointMAC,
        repeaterMAC: sim.repeaterMAC,
        empresa: t('VIVO'),
        consumptionPercent: 0,
        consumptionMB,
        associationDate: sim.associationDate,
        cityId: sim.cityId,
        stateId: sim.stateId,
      });
    }
  }
  const onPreviousPage = () => {
    if (state.currentPage > 1) {
      setState({ currentPage: state.currentPage - 1 });
    }
  };

  const onNextPage = () => {
    if (state.currentPage * state.pageSize < state.simCardsListFiltered.length) {
      setState({ currentPage: state.currentPage + 1 });
    }
  };
  async function fetchData() {
    try {
      state.simCardsListFiltered = state.simCardsList = [];
      state.loading = true; render();
      const response = await apiCall('/sims-v2', { solution: queryPars.empresa as ('tns' | 'meta' | 'kite' | 'todos') });

      formatSimTns(response);
      formatSimMeta(response);
      formatSimVivo(response);

      applyTextFilter();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    state.loading = false;
    render();
  }

  async function solicitarReset(item: { iccid: string, clientName: string, unitName: string, empresa: string }) {
    const {
      iccid, clientName, unitName, empresa,
    } = item;
    if (state.resetSolicitado.includes(iccid)) return;
    if (!window.confirm(`${t('temCertezaQueDesejaReiniciarSimcard')}\n${unitName || clientName || iccid}`)) return;
    state.resetSolicitado.push(iccid);
    try {
      await apiCall('/sims/send-reset-request', {
        iccid, type: empresa,
      });
      toast.success(t('sucessoEnviarSolicitacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    state.resetSolicitado.shift();
  }

  function onApplyFilter() {
    const result = state.simCardsList.filter((dev) => (state.selectedState.length > 0 && state.selectedState.includes(dev.stateId?.toString())) || state.selectedState.length === 0)
      .filter((dev) => (state.selectedCity.length > 0 && state.selectedCity.includes(dev.cityId?.toString())) || state.selectedCity.length === 0)
      .filter((dev) => (state.selectedUnit.length > 0 && state.selectedUnit.includes(dev.unitId?.toString())) || state.selectedUnit.length === 0)
      .filter((dev) => (state.selectedClientFilter.length > 0 && state.selectedClientFilter.includes(dev.clientId?.toString())) || state.selectedClientFilter.length === 0)
      .filter((dev) => (state.selectedConnection.length > 0 && state.selectedConnection.includes(dev.onlineStatus.toLocaleUpperCase())) || state.selectedConnection.length === 0);
    setState({
      simCardsListFiltered: result,
      totalItems: result.length,
    });
  }

  function clearFilters() {
    state.selectedState = [];
    state.selectedCity = [];
    state.selectedUnit = [];
    state.selectedConnection = [];
    state.selectedClientFilter = [];
  }

  function applyTextFilter() {
    const searchState = state.searchState.trim().toLowerCase();
    state.simCardsListFiltered = state.simCardsList.filter((item) => (!searchState)
      || item.iccid && item.iccid.toLowerCase().includes(searchState)
      || item.onlineStatus && item.onlineStatus.toLowerCase().includes(searchState)
      || item.soldplan && item.soldplan.toLowerCase().includes(searchState)
      || item.clientName && item.clientName.toLowerCase().includes(searchState)
      || item.unitName && item.unitName.toLowerCase().includes(searchState)
      || item.accessPoint && item.accessPoint.toLowerCase().includes(searchState)
      || item.accessPointMAC && item.accessPointMAC.toLowerCase().includes(searchState)
      || item.modem && item.modem.toLowerCase().includes(searchState)
      || item.repeaterMAC && item.repeaterMAC.toLowerCase().includes(searchState)
      || item.empresa && item.empresa.toLowerCase().includes(searchState));
    state.simCardsListFiltered = state.simCardsListFiltered.sort(dynamicSort(state.orderColum, state.sortOrder));
    setState({ currentPage: 1 });
  }

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaConfiguracoes')}</title>
      </Helmet>
      <AdminLayout />
      <div style={{ paddingTop: '10px' }}>
        <Headers2 links={allTabs} />
      </div>
      <UtilFilter
        state={state}
        render={render}
        onAply={() => onApplyFilter()}
        setState={setState}
        clearFilter={clearFilters}
        listFilters={['estado', 'cidade', 'cliente', 'unidade', 'conexao']}
        optionsConnetionsName="Status"
        optionsConnetions={[
          { value: 'ONLINE', name: t('online'), icon: <StatusIcon status="ONLINE" color="green" /> },
          { value: 'INATIVO', name: t('inativo'), icon: <StatusIcon status="LATE" color="red" /> },
          { value: 'OFFLINE', name: t('offline'), icon: <StatusIcon status="OFFLINE" color="red" /> },
          { value: 'BLOQUEADO', name: t('bloqueadoMinusculo'), icon: <StatusIcon status="LATE" color="red" /> },
          { value: 'STANDBY', name: 'Stand By', icon: <StatusIcon status="LATE" color="red" /> },
        ]}
        lengthArrayResult={state.totalItems}
      />
      {state.loading && (
        <>
          <br />
          <Loader variant="primary" />
        </>
      )}
      {!state.loading && (
        <div>
          <br />
          <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
            <InputSearch
              id="search"
              name="search"
              placeholder={t('pesquisar')}
              value={state.searchState}
              onChange={(e) => {
                state.searchState = e.target.value;
                applyTextFilter();
                render();
              }}
            />
          </Box>
          <br />
          <TableContainer>
            <TableHead>
              <HeaderRow>
                <HeaderCellOrder onClick={() => { setOrderColum('iccid'); render(); }}>
                  ICCID
                  {' '}
                  { chevron('iccid') }
                  {' '}
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('onlineStatus'); render(); }}>
                  {t('status')}
                  {' '}
                  { chevron('onlineStatus') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('soldplan'); render(); }}>
                  {t('plano')}
                  {' '}
                  { chevron('soldplan') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('lastConn'); render(); }}>
                  {t('ultimaConexao')}
                  {' '}
                  { chevron('lastConn') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('lastDisc'); render(); }}>
                  {t('ultimaDesconexao')}
                  {' '}
                  { chevron('lastDisc') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('consumptionMB'); render(); }}>
                  {t('consumo')}
                  {' '}
                  { chevron('consumptionMB') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('clientName'); render(); }}>
                  {t('cliente')}
                  {' '}
                  { chevron('clientName') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('unitName'); render(); }}>
                  {t('unidade')}
                  {' '}
                  { chevron('unitName') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('associationDate'); render(); }}>
                  <div data-tip data-for="tooltip">
                    {t('dataAssociacao')}
                  </div>
                  {' '}
                  { chevron('associationDate') }
                  <ReactTooltip
                    id="tooltip"
                    place="top"
                    effect="solid"
                    delayHide={100}
                    textColor="#000000"
                    border
                    backgroundColor="rgba(255, 255, 255, 0.97)"
                    style={{ display: 'inline-block' }}
                  >
                    <span style={{
                      display: 'block', marginTop: '6px', fontSize: '96%', textAlign: 'left',
                    }}
                    >
                      <Trans i18nKey="dataRenovacaoPlanosFornecedor">
                        Datas de Renovação
                        <strong>Mensal</strong>
                        dos planos de Fornecedor:
                        <br />
                        TNS - Dia 01
                        <br />
                        Meta Telecom - Dia 20
                        <br />
                        Vivo Telefônica - Dia 24
                        <br />
                      </Trans>
                    </span>
                  </ReactTooltip>
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('accessPoint'); render(); }}>
                  {t('pontoAcesso')}
                  {' '}
                  { chevron('accessPoint') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('modem'); render(); }}>
                  {t('modem')}
                  {' '}
                  { chevron('modem') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('accessPointMAC'); render(); }}>
                  {t('macPontoAcesso')}
                  {' '}
                  { chevron('accessPointMAC') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('repeaterMAC'); render(); }}>
                  {t('macRepetidor')}
                  {' '}
                  { chevron('repeaterMAC') }
                </HeaderCellOrder>
                <HeaderCellOrder onClick={() => { setOrderColum('empresa'); render(); }}>
                  {t('empresa')}
                  {' '}
                  { chevron('empresa') }
                </HeaderCellOrder>
                <HeaderCell>
                  {t('solicitarReset')}
                </HeaderCell>
                <HeaderCell />
              </HeaderRow>
            </TableHead>
            <TableBody>
              {getDataPerPage.map((item) => (
                <Row key={item.iccid}>
                  <DataCellCenter>{item.iccid}</DataCellCenter>
                  <DataCell><span style={{ color: item.onlineStatus === 'Online' ? 'green' : 'red' }}>{item.onlineStatus}</span></DataCell>
                  <DataCell>{item.soldplan}</DataCell>
                  <DataCellCenter>{moment(item.lastConn).format('DD/MM/YYYY HH:mm:ss')}</DataCellCenter>
                  <DataCellCenter>{(item.lastDisc && moment(item.lastDisc).format('DD/MM/YYYY HH:mm:ss')) || '-'}</DataCellCenter>
                  <DataCellRight style={{
                    color: '#252525',
                    background: `linear-gradient(to right, ${item.consumptionPercent! <= 80 ? 'rgba(99, 198, 120, 0.58)' : item.consumptionPercent! <= 100 ? 'rgba(238, 241, 20, 0.51)' : 'rgba(236, 27, 27, 0.58)'} ${item.consumptionPercent}%, transparent 0)`,
                  }}
                  >
                    {formatNumberWithFractionDigits(item.consumption ?? 0, { minimum: 0, maximum: 2 })}
                  </DataCellRight>
                  <DataCell>{item.clientName || '-'}</DataCell>
                  <DataCell>{item.unitId ? <StyledLink to={`/analise/unidades/perfil/${item.unitId}`}>{item.unitName}</StyledLink> : '-'}</DataCell>
                  <DataCellCenter>{(item.associationDate && moment(item.associationDate).format('DD/MM/YYYY HH:mm:ss')) || '-'}</DataCellCenter>
                  <DataCell>{item.accessPoint}</DataCell>
                  <DataCell>{item.modem}</DataCell>
                  <DataCell>{item.accessPointMAC}</DataCell>
                  <DataCell>{item.repeaterMAC}</DataCell>
                  <DataCell>{item.empresa}</DataCell>
                  <DataCellCenter>
                    {(item.empresa === 'TNS' || item.empresa === 'VIVO') && (
                      <ActionButton onClick={() => solicitarReset(item)} variant="blue-inv">
                        <i className="fa fa-refresh" aria-hidden="true" />
                      </ActionButton>
                    )}
                  </DataCellCenter>
                  <DataCellCenter>
                    <ActionButton onClick={() => openEditSimCard(item)} variant="blue-inv">
                      <EditIcon color={colors.LightBlue} />
                    </ActionButton>
                  </DataCellCenter>
                </Row>
              ))}
            </TableBody>
          </TableContainer>
          <Pagination
            currentPage={state.currentPage}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            filteredRows={state.simCardsListFiltered}
            pageSize={state.pageSize}
          />
          {state.openModal && (
            <ModalWindow onClickOutside={undefined}>
              <FormEditItem
                simInfo={state.selectedSim!}
                onCancel={() => { state.openModal = false; render(); }}
                onSuccess={afterEditSim}
              />
            </ModalWindow>
          )}
        </div>
      )}
    </>
  );
};

function FormEditItem(props: {
  simInfo: SimCardItem
  onSuccess: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation();
  const { simInfo, onSuccess, onCancel } = props;
  const [state, render, setState] = useStateVar({
    submitting: false,
    comboClients: [] as {}[],
    comboUnits: [] as {}[],
    client: simInfo.clientName || '',
    unit: simInfo.unitName || '',
    clientId: simInfo.clientId || null,
    unitId: simInfo.unitId || null,
    accessPoint: simInfo.accessPoint || '',
    modem: simInfo.modem || '',
    accessPointMAC: simInfo.accessPointMAC || '',
    repeaterMAC: simInfo.repeaterMAC || '',
    associationDate: simInfo.associationDate || null,
  });

  useEffect(() => {
    if (state.comboClients.length === 0) {
      apiCall('/clients/get-clients-list', {}).then((response) => {
        state.comboClients = response.list.map((row) => ({ label: row.NAME, value: row.CLIENT_ID }));
        render();
      });
    }
    if (state.clientId) {
      loadUnitsClient(state.clientId);
    }
  }, [false]);

  async function confirm() {
    try {
      state.submitting = true;
      if (!state.clientId || !state.unitId) {
        toast.error(t('selecioneClienteEUnidade'));
        return;
      }
      render();
      const reqData = {
        ICCID: simInfo.iccid,
        CLIENT: state.clientId || null,
        UNIT: state.unitId || null,
        ACCESSPOINT: state.accessPoint || null,
        MODEM: state.modem || null,
        MACACCESSPOINT: state.accessPointMAC || null,
        MACREPEATER: state.repeaterMAC || null,
        ASSOCIATION_DATE: new Date(Date.now()).toISOString(),
      };
      await apiCall('/sims/set-sim-info', reqData);
      onSuccess();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }

    state.submitting = false;
    render();
  }

  const calculateAssociationDate = () => {
    if (state.unitId !== simInfo.unitId || state.associationDate === null) {
      return moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }
    return moment(state.associationDate).format('YYYY-MM-DD HH:mm:ss');
  };

  const loadUnitsClient = (clientId) => {
    const reqCombos = { CLIENT_ID: clientId, units: true };
    apiCall('/dev/dev-info-combo-options', reqCombos)
      .then((response) => {
        state.comboUnits = response.units!.map((row) => ({ label: row.label, value: row.value }));
        render();
      })
      .catch((err) => {
        console.log(err);
        toast.error(t('houveErro'));
      });
  };

  const onSelectClient = (item) => {
    state.client = item.label;
    state.clientId = item.value;
    state.unit = '';
    state.comboUnits = [];

    render();

    if (item && item.value != null) {
      loadUnitsClient(item.value);
    } else if (item === '') {
      state.unitId = null;
    }
  };

  return (
    <div>
      <CustomSelect
        options={state.comboClients}
        value={state.client}
        placeholder={t('cliente')}
        onSelect={onSelectClient}
        haveFuzzySearch
      />
      <CustomSelect
        options={state.comboUnits}
        value={state.unit}
        placeholder={t('unidade')}
        onSelect={(item) => {
          state.unitId = item.value;
          state.unit = item.label;
          render();
        }}
        haveFuzzySearch
        disabled={!state.client}
      />
      <Input
        type="text"
        value={state.accessPoint}
        placeholder={t('pontoAcesso')}
        onChange={(event) => { state.accessPoint = event.target.value; render(); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.modem}
        placeholder={t('modem')}
        onChange={(event) => { state.modem = event.target.value; render(); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.accessPointMAC}
        placeholder={t('macPontoAcesso')}
        onChange={(event) => { state.accessPointMAC = event.target.value; render(); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.repeaterMAC}
        placeholder={t('macRepetidor')}
        onChange={(event) => { state.repeaterMAC = event.target.value; render(); }}
      />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
          {t('botaoSalvar')}
        </Button>
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          {t('botaoCancelar')}
        </Button>
      </div>
    </div>
  );
}

export default withTransaction('SimCards', 'component')(SimCards);
