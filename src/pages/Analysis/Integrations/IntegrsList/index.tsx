import { useEffect, useMemo, useRef } from 'react';

import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import IconLate from 'assets/img/status_late.svg';
import IconOffline from 'assets/img/status_offline.svg';
import IconOnline from 'assets/img/status_online.svg';
import {
  Loader,
} from 'components';
import { filterByColumns, orderByColumns } from 'helpers/filterByColumns';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';
import { colors } from 'styles/colors';
import Pagination from 'rc-pagination';
import { AnalysisLayout } from '../../AnalysisLayout';
import { Headers2 } from '../../Header';
import {
  ExternalLink,
  StyledLink,
  TableNew2,
} from './styles';
import { Select } from '~/components/NewSelect';
import { useTranslation } from 'react-i18next';
import { UtilFilter } from '../../Utilities/UtilityFilter';
import { setValueState } from '~/helpers/genericHelper';
import { getUserProfile } from '~/helpers/userProfile';
import { t } from 'i18next';
import { withTransaction } from '@elastic/apm-rum-react';
import { AnalysisEmpty } from '../../AnalysisEmpty';

const pageLocale = {
  prev_page: t('paginaAnterior'),
  next_page: t('proximaPagina'),
  prev_5: t('5paginasAnteriores'),
  next_5: t('proximas5paginas'),
  prev_3: t('3paginasAnteriores'),
  next_3: t('proximas3paginas'),
};

type IntegrRow = (ApiResps['/get-integrations-list']['list'][0])&{ infoLink?: string };

export const IntegrsList = (params: { type?: string }): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const profile = getUserProfile();
  const [state, render, setState] = useStateVar({
    allRows: [] as IntegrRow[],
    filteredRows: [] as IntegrRow[],
    isLoading: !profile.manageAllClients && !profile.manageSomeClient,
    needFilter: profile.manageAllClients || profile.manageSomeClient,
    limitItems: 100,
    lastScrollHeight: 0,
    searchState: '',
    suppliersList: [] as string[],
    verticalList: [] as string[],
    selectSupplier: 'Todos' as string,
    sortBy: null as null|string,
    selectedState: setValueState('filterStates') as any | any[],
    selectedCity: setValueState('filterCity') as any | any[],
    selectedUnit: setValueState('filterUnit') as any | any[],
    selectedConnection: [] as any | any[],
    selectedClientFilter: setValueState('filterClient') as any | any[],
    selectedDevId: '',
    search: false,
    currentPage: 1,
    pageSize: 20,
  });

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const currentDate = new Date();
  const yesterday = new Date(currentDate.setDate(currentDate.getDate() - 1)).toLocaleDateString().substr(0, 5);
  state.filteredRows = useMemo(() => {
    const columns: (keyof typeof state.allRows[0])[] = ['STATE_ID', 'CITY_NAME', 'CLIENT_NAME', 'UNIT_NAME', 'vertical', 'supplier', 'dataSource', 'equipType', 'method', 'status'];
    let filtered;
    if (queryPars.dispositivo === 'agua') {
      if (!state.selectSupplier?.length || state.selectSupplier === 'Todos') {
        filtered = state.allRows.filter((x) => x.vertical.toLowerCase() === 'água');
        filtered = filterData(filtered);
      } else {
        filtered = state.allRows.filter((x) => x.vertical.toLowerCase() === 'água' && x.supplier === state.selectSupplier);
        filtered = filterData(filtered);
      }
    }

    else if (queryPars.fornecedor === 'energy') {
      if (state.selectSupplier === 'Todos') {
        filtered = state.allRows.filter((x) => x.vertical.toLowerCase() === 'energia');
        filtered = filterData(filtered);
      } else {
        filtered = state.allRows.filter((x) => x.vertical.toLowerCase() === 'energia' && x.supplier === state.selectSupplier);
        filtered = filterData(filtered);
      }
    }

    else {
      filtered = queryPars.fornecedor ? state.allRows.filter((x) => (x.supplier.toLowerCase() === queryPars.fornecedor) && x.vertical.toLowerCase() !== 'água' && x.vertical.toLowerCase() !== 'energia') : state.allRows;
    }
    filtered = filterByColumns(filtered, columns, state.searchState);
    if (state.sortBy) {
      orderByColumns(filtered, state.sortBy, false);
    }
    filtered = filterData(filtered);
    state.currentPage = 1;
    return filtered;
  }, [state.searchState, state.allRows, queryPars.fornecedor, state.selectSupplier, state.search]);
  const getDataPerPage = useMemo(() => state.filteredRows.slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize), [state.filteredRows, state.currentPage, state.pageSize]);
  const onPageChange = (curr) => {
    setState({ currentPage: curr });
  };

  const handleGetIntegrationsList = async (supplier: 'diel' | 'ness' | 'greenant' | 'coolautomation' | 'laager' | 'water' | 'diel-dma' | 'energy' | 'water-virtual' | undefined, includeInstallationUnit: boolean) => {
    try {
      const { list } = await apiCall('/get-integrations-list', {
        supplier,
        INCLUDE_INSTALLATION_UNIT: includeInstallationUnit || !!profile.permissions.isInstaller,
        cityIds: state.selectedCity?.length ? state.selectedCity : undefined,
        stateIds: state.selectedState?.length ? state.selectedState : undefined,
        unitIds: state.selectedUnit?.length ? state.selectedUnit?.map((x) => Number(x)) : undefined,
        clientIds: state.selectedClientFilter?.length ? state.selectedClientFilter?.map((x) => Number(x)) : undefined,
        status: state.selectedConnection?.length ? state.selectedConnection : undefined,
      });
      state.allRows = state.allRows.concat(list);
    } catch (_err) { toast.error(t('erroBuscarIntegracoesa')); }
  };

  const handleGetIntegrationsListWater = async (includeInstallationUnit: boolean) => {
    try {
      const { list } = await apiCall('/get-integrations-list/water', {
        INCLUDE_INSTALLATION_UNIT: includeInstallationUnit || !!profile.permissions.isInstaller,
        cityIds: state.selectedCity?.length ? state.selectedCity : undefined,
        stateIds: state.selectedState?.length ? state.selectedState : undefined,
        unitIds: state.selectedUnit?.length ? state.selectedUnit?.map((x) => Number(x)) : undefined,
        clientIds: state.selectedClientFilter?.length ? state.selectedClientFilter?.map((x) => Number(x)) : undefined,
        status: state.selectedConnection?.length ? state.selectedConnection : undefined,
      });
      state.allRows = state.allRows.concat(list);
    } catch (_err) { toast.error(t('erroBuscarIntegracoes')); }
  };

  const handleGetIntegrationsListEnergy = async (includeInstallationUnit: boolean) => {
    try {
      const { list } = await apiCall('/get-integrations-list/energy', {
        INCLUDE_INSTALLATION_UNIT: includeInstallationUnit || !!profile.permissions.isInstaller,
        cityIds: state.selectedCity?.length ? state.selectedCity : undefined,
        stateIds: state.selectedState?.length ? state.selectedState : undefined,
        unitIds: state.selectedUnit?.length ? state.selectedUnit?.map((x) => Number(x)) : undefined,
        clientIds: state.selectedClientFilter?.length ? state.selectedClientFilter?.map((x) => Number(x)) : undefined,
        status: state.selectedConnection?.length ? state.selectedConnection : undefined,
      });
      state.allRows = state.allRows.concat(list);
    } catch (_err) { toast.error(t('erroBuscarIntegracoes')); }
  };

  async function handleGetPromises(includeInstallationUnit) {
    await Promise.all([
      handleGetIntegrationsList('diel', includeInstallationUnit),
      handleGetIntegrationsList('ness', includeInstallationUnit),
      handleGetIntegrationsList('coolautomation', includeInstallationUnit),
      handleGetIntegrationsListEnergy(includeInstallationUnit),
    ]);
  }

  function handleSuppliersList(rowSupplier:'Diel' | 'Oxyn' | 'NESS' | 'GreenAnt' | 'CoolAutomation' | 'Laager', supplier: string) {
    if (rowSupplier && !state.suppliersList.includes(supplier)) {
      state.suppliersList.push(supplier);
    }
  }
  function handleVerticalList(rowVertical: string, vertical: string) {
    if (rowVertical && !state.verticalList.includes(vertical)) {
      state.verticalList.push(vertical);
    }
  }
  function handleInfoLinkUnit(row: IntegrRow) {
    let infoLink = '' as string;
    if (row.supplier === 'CoolAutomation') { infoLink = `/analise/unidades/integracao-vrf/${row.UNIT_ID}?aba=tempo-real`; }
    if (row.supplier === 'Laager') { infoLink = `/analise/unidades/integracao-agua/${row.UNIT_ID}?aba=perfil&supplier=laager`; }
    if (row.supplier === 'Diel' && row.vertical.toLowerCase() === 'água') { infoLink = `/integracoes/info/diel/${row.integrId}/perfil`; }
    return infoLink === '' ? row.infoLink : infoLink;
  }

  async function handleGetData() {
    try {
      setState({ isLoading: true });
      if (state.needFilter !== null) setState({ needFilter: false });
      state.allRows = [];
      const includeInstallationUnit = !!profile.manageAllClients || !!profile.permissions.isInstaller;
      if (params?.type === 'agua') {
        await handleGetIntegrationsListWater(includeInstallationUnit);
      } else {
        await handleGetPromises(includeInstallationUnit);
      }

      state.suppliersList = [];
      state.verticalList = [];
      for (const row of state.allRows) {
        const supplier = row.supplier.toLowerCase();
        const vertical = row.vertical.toLowerCase();
        handleSuppliersList(row.supplier, supplier);
        handleVerticalList(row.vertical, vertical);

        row.infoLink = `/integracoes/info/${supplier}/${row.integrId}/${integrDefaultPage(supplier)}`;
        if (supplier === 'greenant') {
          row.infoLink = `https://dashboard.greenant.com.br/dashboard/meters/${row.integrId}`;
        }
        if (row.UNIT_ID) {
          row.infoLink = handleInfoLinkUnit(row);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erroCarregarDados'));
    }
    if (state.needFilter === null) setState({ needFilter: true });
    setState({ isLoading: false });
  }

  async function fillLaagersDevsStatus(listDevs: { integrId: string, status: string|null }[]) {
    try {
      const { list: listStatus } = await apiCall('/get-integrations-list/laager-status');
      for (const devRow of listDevs) {
        const statusRow = listStatus.find((x) => x.integrId === devRow.integrId) || null;
        devRow.status = statusRow && statusRow.status;
      }
      if (listStatus.some((item) => item.status == null)) {
        toast.warn(t('erroBuscarInformacoes'));
      }
    } catch (_err) { toast.error(t('erroBuscarStatusIntegracoes')); }
  }

  function filterData(filtered: IntegrRow[]) {
    return filtered.filter((dev) => (state.selectedState.length > 0 && state.selectedState.includes(dev.STATE_ID?.toString())) || state.selectedState.length === 0)
      .filter((dev) => (state.selectedCity.length > 0 && state.selectedCity.includes(dev.CITY_ID?.toString())) || state.selectedCity.length === 0)
      .filter((dev) => (state.selectedUnit.length > 0 && state.selectedUnit.includes(dev.UNIT_ID?.toString())) || state.selectedUnit.length === 0)
      .filter((dev) => (state.selectedClientFilter.length > 0 && state.selectedClientFilter.includes(dev.CLIENT_ID?.toString())) || state.selectedClientFilter.length === 0)
      .filter((dev) => (state.selectedConnection.length > 0 && state.selectedConnection.includes(dev.status)) || state.selectedConnection.length === 0)
      .filter((dev) => (state.selectedDevId.length && dev.integrId?.toLowerCase().includes(state.selectedDevId.toLowerCase())) || state.selectedDevId.length === 0);
  }

  useEffect(() => {
    if (!profile.manageAllClients && !profile.manageSomeClient) {
      handleGetData();
    }
    setState({ currentPage: 1 });
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!state.limitItems) return;
      if (state.limitItems >= state.filteredRows.length) return;
      const scrollBottom = document.documentElement.scrollTop + window.innerHeight;
      const distanceToEnd = document.documentElement.offsetHeight - scrollBottom;
      if (!(distanceToEnd < 500)) return;
      if (state.lastScrollHeight >= document.documentElement.offsetHeight) return;
      setState({
        limitItems: state.limitItems + 200,
        lastScrollHeight: document.documentElement.offsetHeight,
      });
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function integrDefaultPage(supplier: string) {
    switch (supplier && supplier.toLowerCase()) {
      case 'ness': { return 'tempo-real'; }
      default: { return 'perfil'; }
    }
  }

  const allTabs = [
    {
      title: 'DRI',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, fornecedor: 'diel' })}`,
      isActive: (queryPars.fornecedor === 'diel'),
      visible: state.suppliersList.includes('diel') || profile.manageAllClients,
      ref: useRef(null),
    },
    {
      title: 'Ness',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, fornecedor: 'ness' })}`,
      isActive: (queryPars.fornecedor === 'ness'),
      visible: state.suppliersList.includes('ness') || profile.manageAllClients,
      ref: useRef(null),
    },
    {
      title: t('energia'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, fornecedor: 'energy' })}`,
      isActive: (queryPars.fornecedor === 'energy'),
      visible: true,
    },
    {
      title: t('sistemasVrf'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, fornecedor: 'coolautomation' })}`,
      isActive: (queryPars.fornecedor === 'coolautomation'),
      visible: state.suppliersList.includes('coolautomation') || profile.manageAllClients,
      ref: useRef(null),
    },
    {
      title: t('todos'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, fornecedor: undefined })}`,
      isActive: !queryPars.fornecedor,
      visible: true,
      ref: useRef(null),
    },
  ];
  const tabs = allTabs.filter((x) => x.visible);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaIntegracoes')}</title>
      </Helmet>
      <div style={{ paddingTop: '10px' }}>
        { params.type !== 'agua' && <Headers2 links={tabs} /> }
        <UtilFilter
          state={state}
          render={render}
          onAply={async () => { await handleGetData(); setState({ search: !state.search }); }}
          listFilters={['estado', 'cidade', 'unidade', 'cliente', 'conexao', 'id', 'fornecedor']}
          lengthArrayResult={getDataPerPage.length}
        />
      </div>
      <>
        {(state.allRows.length === 0 && !profile.manageAllClients) && (
          <div style={{ paddingTop: '30px', paddingLeft: '20px' }}>
            {t('nenhumaIntegracao')}
          </div>
        )}
        {(state.allRows.length > 0 || profile.manageAllClients) && (
          <Flex flexWrap="wrap">
            <Box width={1} pt={20}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {((queryPars.fornecedor === 'energy' || !queryPars.fornecedor) && params?.type !== 'agua') && (
                <>
                  <h5 style={{ color: 'red', flexWrap: 'wrap', marginLeft: '10px' }}>
                    {`${t('statusDeEnergiaReferente')} ${yesterday}`}
                  </h5>
                </>
                )}
              </div>
            </Box>
            <Box width={1} pt={20}>
              {state.needFilter && (
                <>
                  <AnalysisEmpty />
                </>
              )}
              {state.isLoading && <Loader variant="primary" />}
              {!state.isLoading && !state.needFilter && (
                <TableNew2 style={{ color: colors.Grey400, width: '100%' }}>
                  <thead>
                    <tr>
                      <th>{t('Estado')}</th>
                      <th>{t('Cidade')}</th>
                      <th>{t('cliente')}</th>
                      <th>{t('unidade')}</th>
                      <th>{t('vertical')}</th>
                      <th>{t('fornecedor')}</th>
                      <th>{t('fonteDado')}</th>
                      <th>{t('tipo')}</th>
                      <th>{t('Metodo')}</th>
                      <th>{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDataPerPage.filter((x, i) => (i < state.limitItems)).map((dev) => (
                      <tr key={`${dev.supplier} ${dev.integrId} ${dev.UNIT_ID} ${dev.supplier}`}>
                        <td>{dev.STATE_ID || '-'}</td>
                        <td>{dev.CITY_NAME || '-'}</td>
                        <td>{dev.CLIENT_NAME || '-'}</td>
                        <td>{dev.UNIT_ID ? <StyledLink to={`/analise/unidades/${dev.UNIT_ID}`}>{dev.UNIT_NAME}</StyledLink> : '-'}</td>
                        <td>{dev.vertical || '-'}</td>
                        <td>{dev.supplier || '-'}</td>
                        <td>
                          {(dev.infoLink!.startsWith('http')
                            ? <ExternalLink href={dev.infoLink!} target="_blank">{dev.dataSource}</ExternalLink>
                            : <StyledLink to={dev.infoLink!}>{dev.dataSource}</StyledLink>
                          )}
                        </td>
                        <td>{dev.equipType || '-'}</td>
                        <td>{dev.method || '-'}</td>
                        <td>{(dev.status === 'ONLINE') ? <img src={IconOnline} /> : (dev.status === 'OFFLINE') ? <img src={IconOffline} /> : (dev.status === 'LATE') ? <img src={IconLate} /> : (dev.status || '-')}</td>
                      </tr>
                    ))}
                  </tbody>
                </TableNew2>
              )}
              {
                !state.needFilter && (
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
                    total={state.filteredRows.length}
                    locale={pageLocale}
                    pageSize={state.pageSize}
                    onChange={(current) => onPageChange(current)}
                  />
                </div>
                )
              }
            </Box>
          </Flex>
        )}
      </>
    </>
  );
};

export default withTransaction('IntegrsList', 'component')(IntegrsList);
