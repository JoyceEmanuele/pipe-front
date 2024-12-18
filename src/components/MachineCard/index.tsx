import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Flex, Box } from 'reflexbox';

import OrderIcon from '../../assets/img/order.svg';
import {
  Card, Table, HealthIcon, Loader,
} from '..';
import { useStateVar } from '../../helpers/useStateVar';
import { daysRange, HealthHistoryContents } from '../../pages/Overview/HealthHistoryCard';
import { colors } from '../../styles/colors';
import Pagination from 'rc-pagination';

import {
  Line,
  TopTitle,
  ItemTitle,
  ItemSubTitle,
  ItemLegend,
  ItemValue,
  ItemVal,
  HealthGreat,
  HealthGood,
  HealthMedium,
  HealthBad,
  HealthOthers,
  BtnList,
  ItemCompare,
  RedTriangleUp,
  RedTriangleDown,
  GreenTriangleUp,
  GreenTriangleDown,
  LabelFilter,
  CellLabel,
  StyledLink,
  OverLay,
  HealthDeactiv,
  TopDate,
  ItemTitleTotal,
  IconContainer,
} from './styles';
import { t } from 'i18next';
import { ICard, useCard } from '../../contexts/CardContext';
import { CardManager } from '../CardManager';
import {
  HealthDisabledIcon, ImminentRiskIcon, OperatingCorrectlyIcon, OutOfSpecificationIcon, UnknownHealthDarkIcon, UrgentMaintenanceIcon,
} from '~/icons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import { formatNumberWithFractionDigits, thousandPointFormat } from '~/helpers/thousandFormatNumber';

const HEALTH_INITIAL_VALUE = {
  green: 0, yellow: 0, orange: 0, red: 0, deactiv: 0, others: 0,
};
const DATE_FORMAT = 'YYYY-MM-DD';
const KW_TO_TR = 0.28434517;

const dacColumns = (list) => [
  {
    Header: () => (
      <span>
        {list[0]}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'state',
    // disableSortBy: true,
    Cell: (props) => <CellLabel>{props.row.original.state}</CellLabel>,
  },
  {
    Header: () => (
      <span>
        {list[1]}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'city',
    // disableSortBy: true,
    Cell: (props) => <CellLabel>{props.row.original.city}</CellLabel>,
  },
  {
    Header: () => (
      <span>
        {list[2]}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'unit',
    // disableSortBy: true,
    Cell: (props) => <div><StyledLink to={`/analise/unidades/${props.row.original.unitId}`}>{props.row.original.unit}</StyledLink></div>,
  },
  {
    Header: () => (
      <span>
        {list[3]}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'id',
    // disableSortBy: true,
    Cell: (props) => <StyledLink to={`/analise/maquina/${props.row.original.id}/informacoes`}>{props.row.original.id}</StyledLink>,
  },
  {
    Header: () => (
      <span>
        {list[4]}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'health',
    // disableSortBy: true,
    Cell: (props) => ((props.row.original.health == null) ? '' : <HealthIcon health={props.row.original.health.toString()} />),
  },
  {
    Header: () => (
      <span>
        {list[5]}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'healthHistoryDuration',
    // disableSortBy: true,
    Cell: (props) => <CellLabel>{props.row.original.healthHistory}</CellLabel>,
  },
];

const pageLocale = {
  prev_page: t('paginaAnterior'),
  next_page: t('proximaPagina'),
  prev_5: t('5paginasAnteriores'),
  next_5: t('proximas5paginas'),
  prev_3: t('3paginasAnteriores'),
  next_3: t('proximas3paginas'),
};

export const MachineCard = (props: {
  maxWidth?: string|number,
  marginLeft?: string|number,
  marginRight?: string|number,
  manageAllClients: boolean|undefined
  enableHistoryTab: boolean
  paramsForLoadData: null|{
    selectedUnit: number[]
    selectedCity: string[]
    selectedState: number[]
    selectedClient: number[]
    selectedTimeRange: string
    date: moment.Moment
    endDate: moment.Moment
    monthDate: Date
    startDate: moment.Moment
  };
  selectedFilter?: {
    unitIds?: string[],
    stateIds?: string[],
    cityIds?: string[],
  }
  saveOverviewFilters?: () => void,
}): JSX.Element => {
  const { t } = useTranslation();
  const {
    maxWidth = null,
    marginLeft = 0,
    marginRight = 0,
    selectedFilter = null,
    saveOverviewFilters,
  } = props;

  const [state, render, setState] = useStateVar(() => ({
    filter: t('unidade'),
    showList: false,
    showAsHistory: false,
    disabledLevels: {} as { [level: string]: boolean },

    isLoadingHealthOverviewNow: false,
    isLoadingHealthOverviewBefore: false,
    isLoadingHealthHistoryChart: false,
    isLoadingDacsList: false,

    dacList: null as null|{
      state: string
      city: string
      unitId: number
      unit: string
      id: string
      health: number
      healthHistory: string
    }[],
    machinesHealthNow: HEALTH_INITIAL_VALUE,
    machinesHealthBefore: HEALTH_INITIAL_VALUE,
    healthHistory: null as null|{
      day: string;
      health: {
          green: number;
          yellow: number;
          orange: number;
          red: number;
          deactiv: number;
          others: number;
      };
      powerTR: {
          green: number;
          yellow: number;
          orange: number;
          red: number;
          deactiv: number;
          others: number;
      };
    }[],
    machinesPag: {
      tablePage: 1,
      tablePageSize: 20,
      totalItems: 0,
    },
    machinesTRs: 0,
  }));

  const {
    machinesHealthNow,
    machinesHealthBefore,
    machinesTRs,
    dacList,
    machinesPag,
  } = state;

  const isLoading = state.isLoadingDacsList || state.isLoadingHealthOverviewNow || state.isLoadingHealthOverviewBefore || state.isLoadingHealthHistoryChart || false;

  function formatSelectedFilter() {
    if (selectedFilter) {
      let filterString = '';
      for (const filterType of Object.keys(selectedFilter)) {
        filterString += `&${filterType}=`;
        filterString += `${selectedFilter[filterType].join()}`;
      }
      return filterString;
    }
  }

  function healthOverview() {
    if (!props.paramsForLoadData) {
      return;
    }
    state.isLoadingHealthOverviewNow = true;
    render();

    apiCall('/health-overview-card', {
      INCLUDE_INSTALLATION_UNIT: !!props.manageAllClients,
      atDayYMD: moment().format(DATE_FORMAT),
      unitIds: props.paramsForLoadData.selectedUnit.length ? props.paramsForLoadData.selectedUnit : undefined,
      cityIds: props.paramsForLoadData.selectedCity.length ? props.paramsForLoadData.selectedCity : undefined,
      stateIds: props.paramsForLoadData.selectedState.length > 0 ? props.paramsForLoadData.selectedState.map((num) => num.toString()) : undefined,
      clientIds: props.paramsForLoadData.selectedClient.length ? props.paramsForLoadData.selectedClient : undefined,
    }).then((healthNow) => {
      if (healthNow) {
        state.machinesHealthNow = healthNow.health;
        state.machinesTRs = Object.values(healthNow.powerTR).reduce((a, b) => a + b, 0);
      }
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroSaudeMaquinas'));
    }).finally(() => {
      state.isLoadingHealthOverviewNow = false;
      render();
    });

    state.isLoadingHealthOverviewBefore = true;
    render();

    apiCall('/health-overview-card', {
      INCLUDE_INSTALLATION_UNIT: !!props.manageAllClients,
      atDayYMD: moment().subtract(7, 'days').format(DATE_FORMAT),
      unitIds: props.paramsForLoadData.selectedUnit.length ? props.paramsForLoadData.selectedUnit : undefined,
      cityIds: props.paramsForLoadData.selectedCity.length ? props.paramsForLoadData.selectedCity : undefined,
      stateIds: props.paramsForLoadData.selectedState.length ? props.paramsForLoadData.selectedState.map((num) => num.toString()) : undefined,
    }).then((healthBefore) => {
      if (healthBefore) state.machinesHealthBefore = healthBefore.health;
      render();
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroSaudeMaquinas'));
    }).finally(() => {
      state.isLoadingHealthOverviewBefore = false;
      render();
    });
  }

  async function healthHistoryChart() {
    if (!props.paramsForLoadData) {
      return;
    }
    state.isLoadingHealthHistoryChart = true;
    state.healthHistory = null;
    render();

    try {
      const refDate = calculateReferenceDate(state);

      const daysList = generateDaysList(refDate, props.paramsForLoadData.selectedTimeRange);

      const reqs = await Promise.all(
        daysList.reverse().map(async (atDayYMD) => {
          const { health, powerTR } = await fetchHealthOverviewData(atDayYMD);
          return { day: atDayYMD, health, powerTR };
        }),
      );

      state.healthHistory = reqs;
    } catch (err) {
      console.error(err);
      toast.error(t('erroSaudeMaquinas'));
    }

    state.isLoadingHealthHistoryChart = false;
    render();
  }

  function calculateReferenceDate(state) {
    let refDate = moment();

    if (state.selectedTimeRange === t('semana')) {
      refDate = moment(state.date).add(6, 'day');
    } else if (state.selectedTimeRange === t('dia')) {
      refDate = moment(state.date);
    } else if (state.selectedTimeRange === t('flexivel')) {
      refDate = moment(state.endDate);
    } else if (state.selectedTimeRange === t('mes')) {
      refDate = moment(state.monthDate).endOf('month');
    }

    return refDate.format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD') ? moment() : refDate;
  }

  function generateDaysList(refDate: moment.Moment, selectedTimeRange: string) {
    const daysList: string[] = [];

    for (let i = 0; i < 13; i++) {
      daysList.push(refDate.format('YYYY-MM-DD'));

      if (selectedTimeRange === t('mes')) {
        refDate = refDate.subtract(1, 'month');
      } else {
        refDate = refDate.subtract(1, 'day');
      }
    }

    if (selectedTimeRange === t('flexivel')) {
      const startYMD = props.paramsForLoadData!.startDate.format('YYYY-MM-DD');

      while (daysList.length < 15 && daysList[daysList.length - 1] > startYMD) {
        daysList.push(refDate.format('YYYY-MM-DD'));
        refDate = refDate.subtract(1, 'day');
      }
    }

    return daysList;
  }

  async function fetchHealthOverviewData(atDayYMD) {
    const { health, powerTR } = await apiCall('/health-overview-card', {
      INCLUDE_INSTALLATION_UNIT: !!props.manageAllClients,
      atDayYMD,
      unitIds: props.paramsForLoadData!.selectedUnit.length ? props.paramsForLoadData!.selectedUnit : undefined,
      cityIds: props.paramsForLoadData!.selectedCity.length ? props.paramsForLoadData!.selectedCity : undefined,
      stateIds: props.paramsForLoadData!.selectedState.length > 0 ? props.paramsForLoadData!.selectedState.map((num) => num.toString()) : undefined,
      clientIds: props.paramsForLoadData!.selectedClient.length ? props.paramsForLoadData!.selectedClient : undefined,
    });

    return { health, powerTR };
  }

  function getDacsList(page?: number) {
    if (!props.paramsForLoadData) {
      return;
    }
    state.isLoadingDacsList = true;
    render();

    if (!page) state.machinesPag.tablePage = 1;
    apiCall('/dev/get-health-power-data', {
      unitIds: props.paramsForLoadData.selectedUnit.length ? props.paramsForLoadData.selectedUnit : undefined,
      cityIds: props.paramsForLoadData.selectedCity.length ? props.paramsForLoadData.selectedCity : undefined,
      stateIds: props.paramsForLoadData.selectedState.length > 0 ? props.paramsForLoadData.selectedState.map((num) => num.toString()) : undefined,
      clientIds: props.paramsForLoadData!.selectedClient.length ? props.paramsForLoadData!.selectedClient : undefined,
      SKIP: (state.machinesPag.tablePage - 1) * state.machinesPag.tablePageSize,
      LIMIT: state.machinesPag.tablePageSize,
    }).then((dacsList) => {
      handleGetDacsInfo(dacsList);
      state.machinesPag.totalItems = dacsList.totalItems;
    }).catch((err) => {
      console.log(err);
      toast.error(t('erroDACs'));
    }).finally(() => {
      state.isLoadingDacsList = false;
      render();
    });
  }

  const onPageChange = (page) => {
    state.machinesPag.tablePage = page;
    getDacsList(page);
    render();
  };

  function handleGetDacsInfo(dacsList: {
    list: {
      CLIENT_ID: number
      H_DATE: string
      DEV_ID: string
      H_INDEX: number
      CITY_NAME: string
      STATE_NAME: string
      UNIT: string
      UNIT_ID: number
      capacityKW?: number
    }[]
  }) {
    state.dacList = dacsList && dacsList.list
      .map((dac) => {
        let healthHistory = '-';
        let healthHistoryDuration = 0;

        if (dac.H_DATE) {
          const duration = moment.duration(moment().diff(moment(dac.H_DATE)));

          healthHistoryDuration = duration.asSeconds();

          if (duration.asMinutes() < 60) healthHistory = `Há ${Math.round(duration.asMinutes())} min.`;
          else if (duration.asHours() < 24) healthHistory = `Há ${Math.round(duration.asHours())} ${Math.round(duration.asHours()) === 1 ? 'hr' : 'hrs'}`;
          else if (duration.asDays() < 7) healthHistory = `Há ${Math.round(duration.asDays())} ${Math.round(duration.asDays()) === 1 ? t('dia') : t('dias')}`;
          else if (duration.asWeeks() < 4) healthHistory = `Há ${Math.round(duration.asWeeks())} sem.`;
          else healthHistory = `Há ${Math.round(duration.asMonths())} ${Math.round(duration.asMonths()) === 1 ? t('mes') : t('meses')}`;
        }

        return {
          id: dac.DEV_ID,
          health: dac.H_INDEX,
          city: dac.CITY_NAME,
          state: dac.STATE_NAME,
          unit: dac.UNIT,
          unitId: dac.UNIT_ID,
          healthHistory,
          healthHistoryDuration,
        };
      });

    render();
  }

  useEffect(() => {
    if (state.dacList || state.isLoadingDacsList) {
      // A lista já foi ou está sendo carregada
      return;
    }
    if (!props.paramsForLoadData) {
      return;
    }
    if (state.showList) {
      getDacsList();
    }
  }, [state.showList, state.dacList, props.paramsForLoadData]);

  function loadData() {
    state.machinesHealthNow = HEALTH_INITIAL_VALUE;
    state.machinesHealthBefore = HEALTH_INITIAL_VALUE;
    state.machinesTRs = 0;
    state.healthHistory = null;
    state.dacList = null;

    render();

    if (props.paramsForLoadData) {
      healthOverview();
    }
  }

  useEffect(() => {
    loadData();
  }, [props.paramsForLoadData]);

  const processedDacs = useMemo(() => (dacList || []).filter((x) => {
    if (!!x.unit === true) {
      const definedStates: Set<string | null | undefined> = new Set(['deactiv', 'green', 'orange', 'red', 'yellow']);
      const stateInString = {
        100: 'green', 75: 'yellow', 50: 'orange', 25: 'red', 4: 'deactiv',
      };

      if (!state.showAsHistory) return true;
      if (definedStates.has(stateInString[x.health])) {
        return !state.disabledLevels[stateInString[x.health]];
      }
      return !state.disabledLevels.others;
    }

    return false;
  }).sort((a, b) => {
    if (state.filter === t('unidade')) {
      return ((a.unit < b.unit)
        ? -1
        : ((a.unit > b.unit)
          ? 1
          : 0));
    }
    if (state.filter === t('estado')) {
      return ((a.state < b.state)
        ? -1
        : ((a.state > b.state)
          ? 1
          : 0));
    }
    if (state.filter === t('cidade')) {
      return ((a.city < b.city)
        ? -1
        : ((a.city > b.city)
          ? 1
          : 0));
    }
    return ((a.health < b.health)
      ? -1
      : ((a.health > b.health)
        ? 1
        : 0));
  }), [dacList, state.filter, state.disabledLevels, state.showAsHistory]);

  const totalMachines: number = useMemo(() => Object.values(machinesHealthNow).reduce((a: number, b: number) => a + b, 0) as number, [machinesHealthNow]);

  const compareMachinesGreen: number | null = useMemo(() => (!machinesHealthNow.green || !machinesHealthBefore.green
    ? null
    : ((machinesHealthNow.green - machinesHealthBefore.green) / machinesHealthBefore.green * 100) as number), [machinesHealthNow, machinesHealthBefore]);

  const compareMachinesYellow: number | null = useMemo(() => (!machinesHealthNow.yellow || !machinesHealthBefore.yellow
    ? null
    : ((machinesHealthNow.yellow - machinesHealthBefore.yellow) / machinesHealthBefore.yellow * 100) as number), [machinesHealthNow, machinesHealthBefore]);

  const compareMachinesOrange: number | null = useMemo(() => (!machinesHealthNow.orange || !machinesHealthBefore.orange
    ? null
    : ((machinesHealthNow.orange - machinesHealthBefore.orange) / machinesHealthBefore.orange * 100) as number), [machinesHealthNow, machinesHealthBefore]);

  const compareMachinesRed: number | null = useMemo(() => (!machinesHealthNow.red || !machinesHealthBefore.red
    ? null
    : ((machinesHealthNow.red - machinesHealthBefore.red) / machinesHealthBefore.red * 100) as number), [machinesHealthNow, machinesHealthBefore]);

  const compareMachinesDeactiv: number | null = useMemo(() => (!machinesHealthNow.deactiv || !machinesHealthBefore.deactiv
    ? null
    : ((machinesHealthNow.deactiv - machinesHealthBefore.deactiv) / machinesHealthBefore.deactiv * 100) as number), [machinesHealthNow, machinesHealthBefore]);

  const compareMachinesOthers: number | null = useMemo(() => (!machinesHealthNow.others || !machinesHealthBefore.others
    ? null
    : ((machinesHealthNow.others - machinesHealthBefore.others) / machinesHealthBefore.others * 100) as number), [machinesHealthNow, machinesHealthBefore]);

  const { cards } = useCard();
  const machineCard = cards.find((card) => card.title === 'Máquinas');
  const isDesktop = window.matchMedia('(min-width: 765px)');
  const isMobile = !isDesktop.matches;
  useEffect(() => {
    if (state.healthHistory || state.isLoadingHealthHistoryChart) {
      // O histórico já foi ou está sendo carregado
      return;
    }
    if (!props.paramsForLoadData) {
      return;
    }
    if (state.showAsHistory || machineCard?.isExpanded) {
      healthHistoryChart();
    }
  }, [machineCard?.isExpanded, state.showAsHistory, state.healthHistory, props.paramsForLoadData]);

  const machineCardDaysRange = useMemo(() => {
    if (machineCard?.isExpanded) return daysRange(state.healthHistory);
    return daysRange(state?.healthHistory?.slice(-7) || []);
  }, [machineCard, state.healthHistory]);

  return (
    <Box width={machineCard?.isExpanded ? 1 : [1, 1, 1, 1, 25 / 51, 25 / 51]} mb={40} ml={marginLeft} mr={marginRight} style={machineCard?.isExpanded ? { maxWidth: maxWidth || 'none', height: 'auto' } : { maxWidth: maxWidth || 'none', minHeight: 570 }}>
      <Card noPadding wrapperStyle={machineCard?.isExpanded ? { minHeight: 'auto' } : { minHeight: 570 }}>
        <div style={{ padding: '10px 30px' }}>
          <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
            <TopTitle>{t('maquinas')}</TopTitle>
            <TopDate>
              &nbsp;
              {state.showAsHistory && machineCardDaysRange}
            </TopDate>
            <CardManager card={machineCard as ICard} />
          </Flex>
        </div>

        {machineCard?.isExpanded ? (<></>) : (
          <>
            {(props.enableHistoryTab) && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 6px 120px auto', height: '5px' }}>
                <span
                  style={{
                    borderTop: '1px solid lightgrey',
                    borderRight: '1px solid lightgrey',
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: state.showAsHistory ? '#f4f4f4' : 'transparent',
                  }}
                />
                <span />
                <span
                  style={{
                    border: '1px solid lightgrey',
                    borderBottom: 'none',
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: state.showAsHistory ? 'transparent' : '#f4f4f4',
                  }}
                />
                <span />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 6px 120px auto', marginBottom: '10px' }}>
                <span
                  style={{
                    borderRight: '1px solid lightgrey',
                    textAlign: 'center',
                    fontSize: '90%',
                    borderBottom: state.showAsHistory ? '1px solid lightgrey' : 'none',
                    backgroundColor: state.showAsHistory ? '#f4f4f4' : 'transparent',
                    cursor: state.showAsHistory ? 'pointer' : undefined,
                  }}
                  onClick={() => { state.showAsHistory && setState({ showAsHistory: !state.showAsHistory }); }}
                >
                  {t('saudeAtual')}
                </span>
                <span
                  style={{
                    borderBottom: '1px solid lightgrey',
                  }}
                />
                <span
                  style={{
                    borderLeft: '1px solid lightgrey',
                    borderRight: '1px solid lightgrey',
                    textAlign: 'center',
                    fontSize: '90%',
                    borderBottom: state.showAsHistory ? 'none' : '1px solid lightgrey',
                    backgroundColor: state.showAsHistory ? 'transparent' : '#f4f4f4',
                    cursor: (!state.showAsHistory) ? 'pointer' : undefined,
                  }}
                  onClick={() => { (!state.showAsHistory) && setState({ showAsHistory: !state.showAsHistory }); }}
                >
                  {t('historico')}
                </span>
                <span
                  style={{
                    borderBottom: '1px solid lightgrey',
                  }}
                />
              </div>
            </>
            )}
          </>
        )}

        {isLoading ? (
          <OverLay>
            <Loader variant="primary" size="large" />
          </OverLay>
        ) : <></>}

        {machineCard?.isExpanded ? (
          <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
            <HealthHistoryContents render={render} state={state} healthHistory={state.healthHistory} />

            <Flex flexWrap="wrap" flexDirection="row-reverse" justifyContent="space-between" alignItems="flex-end" width={1} pl={15} mt={state.showAsHistory ? 10 : 20}>
              <Box>
                <BtnList onClick={() => {
                  state.showList = !state.showList;
                  render();
                }}
                >
                  {t('verLista')}

                </BtnList>
              </Box>
            </Flex>

            {state.showList ? (
              <Flex flexDirection="column">
                <Flex
                  flexWrap="wrap"
                  width={1}
                  mt={10}
                >
                  <Table
                    style={{
                      overflow: 'auto', height: '300px', borderCollapse: 'separate', boxShadow: 'none',
                    }}
                    columns={dacColumns([t('estado'), t('cidade'), t('unidade'), t('dispositivo'), t('saude'), t('historico')])}
                    data={processedDacs}
                    dense
                    border={false}
                  />
                </Flex>
                {machinesPag && onPageChange && (
                  <Flex justifyContent="flex-end" width={1} pt={10} mt={10} style={{ borderTop: '0.7px solid rgba(0,0,0,0.2)' }}>
                    <Pagination
                      className="ant-pagination"
                      defaultCurrent={machinesPag.tablePage}
                      total={machinesPag.totalItems}
                      locale={pageLocale}
                      pageSize={machinesPag.tablePageSize}
                      onChange={(current) => onPageChange(current)}
                    />
                  </Flex>
                )}
              </Flex>
            ) : <></>}
          </div>
        ) : (
          <>
            <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
              {(state.showAsHistory) ? (
                <div style={{ paddingTop: '10px' }}>
                  <HealthHistoryContents render={render} state={state} healthHistory={state.healthHistory?.slice(-7) || []} />
                </div>
              ) : (
                <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" mt={35} pl={15} pr={15}>

                  <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} pl={20} pr={20}>
                    <Box width={!isMobile ? '1 / 3' : ''} justifyContent="center">
                      <ItemTitleTotal>
                        {t('total')}
                      </ItemTitleTotal>
                      <ItemSubTitle>
                        {t('ciclosDeRefrigeracao')}
                      </ItemSubTitle>
                    </Box>
                    <Box width={1 / 3}>
                      <ItemValue>
                        <ItemVal>
                          {thousandPointFormat(totalMachines)}
                        </ItemVal>
                      </ItemValue>
                    </Box>
                    <Box width={1 / 3}>
                      <Flex style={{ height: 30 }}>
                        <div style={{
                          background: '#BBBBBB',
                          width: `${machinesHealthNow.others / (totalMachines || 0) * 100}%`,
                          height: '100%',
                          borderTopLeftRadius: 5,
                          borderBottomLeftRadius: 5,
                        }}
                        />
                        <div style={{
                          background: 'grey',
                          width: `${machinesHealthNow.deactiv / (totalMachines || 0) * 100}%`,
                          height: '100%',
                        }}
                        />
                        <div style={{
                          background: '#E00030',
                          width: `${machinesHealthNow.red / (totalMachines || 0) * 100}%`,
                          height: '100%',
                        }}
                        />
                        <div style={{
                          background: '#FF4D00',
                          width: `${machinesHealthNow.orange / (totalMachines || 0) * 100}%`,
                          height: '100%',
                        }}
                        />
                        <div style={{
                          background: '#F8D000',
                          width: `${machinesHealthNow.yellow / (totalMachines || 0) * 100}%`,
                          height: '100%',
                        }}
                        />
                        <div style={{
                          background: '#5AB365',
                          width: `${machinesHealthNow.green / (totalMachines || 0) * 100}%`,
                          height: '100%',
                          borderTopRightRadius: 5,
                          borderBottomRightRadius: 5,
                        }}
                        />
                      </Flex>
                      <Flex justifyContent="center" alignItems="center" width={1}>
                        <ItemLegend>
                          {thousandPointFormat(Math.round(state.machinesTRs))}
                          {' '}
                          TR
                        </ItemLegend>
                      </Flex>
                    </Box>
                  </Flex>

                  <Line />

                  <Flex flexWrap="wrap" justifyContent="space-around" width={1} mt={17}>
                    <Box width={1 / 2}>
                      <Link
                        to={`/analise/maquinas?preFiltered=Operando corretamente${formatSelectedFilter() || ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10} onClick={() => saveOverviewFilters && saveOverviewFilters()}>
                          <Box width={1 / 2}>
                            <Flex width={1} alignItems="center" justifyContent="center" style={{ gap: '8px' }}>
                              <IconContainer style={{ background: '#5AB365' }}>
                                <OperatingCorrectlyIcon color="white" />
                              </IconContainer>
                              <Flex flexDirection="column">
                                <ItemTitle>
                                  {t('correto')}
                                  {' '}
                                </ItemTitle>
                                <ItemSubTitle>
                                  {t('totalDeCiclos')}
                                </ItemSubTitle>
                              </Flex>
                            </Flex>
                          </Box>
                          <Box width={1 / 2}>
                            <Flex alignItems="center" width={1} flexDirection="column">
                              <ItemValue>
                                <ItemVal>{thousandPointFormat(machinesHealthNow.green)}</ItemVal>
                              </ItemValue>
                              {compareMachinesGreen !== null && (
                              <>
                                <ItemCompare style={{ color: compareMachinesGreen >= 0 ? colors.GreenLight : colors.RedDark }}>
                                  {formatNumberWithFractionDigits(compareMachinesGreen, { minimum: 2, maximum: 2 })}
                                  %
                                </ItemCompare>
                                {
                                        compareMachinesGreen ? (compareMachinesGreen > 0 ? <GreenTriangleUp /> : <RedTriangleDown />) : ''
                                      }
                              </>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Link>
                      <Link
                        to={`/analise/maquinas?preFiltered=Fora de especificação${formatSelectedFilter() || ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10} onClick={() => saveOverviewFilters && saveOverviewFilters()}>
                          <Box width={1 / 2}>
                            <Flex width={1} alignItems="center" justifyContent="center" style={{ gap: '8px' }}>
                              <IconContainer style={{ background: '#F8D000' }}>
                                <OutOfSpecificationIcon color="white" />
                              </IconContainer>
                              <Flex flexDirection="column">
                                <ItemTitle>
                                  Fora Espec.
                                  {' '}
                                </ItemTitle>
                                <ItemSubTitle>
                                  {t('totalDeCiclos')}
                                </ItemSubTitle>
                              </Flex>
                            </Flex>
                          </Box>
                          <Box width={1 / 2}>
                            <Flex alignItems="center" width={1} flexDirection="column">
                              <ItemValue>
                                <ItemVal>{thousandPointFormat(machinesHealthNow.yellow)}</ItemVal>
                              </ItemValue>
                              {compareMachinesYellow !== null && (
                              <>
                                <ItemCompare style={{ color: compareMachinesYellow > 0 ? colors.RedDark : colors.GreenLight }}>
                                  {formatNumberWithFractionDigits(compareMachinesYellow, { minimum: 2, maximum: 2 })}
                                  %
                                </ItemCompare>
                                {
                                        compareMachinesYellow ? (compareMachinesYellow > 0 ? <RedTriangleUp /> : <GreenTriangleDown />) : ''
                                      }
                              </>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Link>
                      <Link
                        to={`/analise/maquinas?preFiltered=Risco iminente${formatSelectedFilter() || ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10} onClick={() => saveOverviewFilters && saveOverviewFilters()}>
                          <Box width={1 / 2}>
                            <Flex width={1} alignItems="center" justifyContent="center" style={{ gap: '8px' }}>
                              <IconContainer style={{ background: '#FF4D00' }}>
                                <ImminentRiskIcon color="white" />
                              </IconContainer>
                              <Flex flexDirection="column">
                                <ItemTitle>
                                  {t('emRisco')}
                                  {' '}
                                </ItemTitle>
                                <ItemSubTitle>
                                  {t('totalDeCiclos')}
                                </ItemSubTitle>
                              </Flex>
                            </Flex>
                          </Box>
                          <Box width={1 / 2}>
                            <Flex alignItems="center" width={1} flexDirection="column">
                              <ItemValue>
                                <ItemVal>{thousandPointFormat(machinesHealthNow.orange)}</ItemVal>
                              </ItemValue>
                              {compareMachinesOrange !== null && (
                              <>
                                <ItemCompare style={{ color: compareMachinesOrange > 0 ? colors.RedDark : colors.GreenLight }}>
                                  {formatNumberWithFractionDigits(compareMachinesOrange, { minimum: 2, maximum: 2 })}
                                  %
                                </ItemCompare>
                                {
                                        compareMachinesOrange ? (compareMachinesOrange > 0 ? <RedTriangleUp /> : <GreenTriangleDown />) : ''
                                      }
                              </>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Link>
                    </Box>
                    <Box width={1 / 2}>
                      <Link
                        to={`/analise/maquinas?preFiltered=Manutenção urgente${formatSelectedFilter() || ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10} onClick={() => saveOverviewFilters && saveOverviewFilters()}>
                          <Box width={1 / 2}>
                            <Flex width={1} alignItems="center" justifyContent="center" style={{ gap: '8px' }}>
                              <IconContainer style={{ background: '#E00030' }}>
                                <UrgentMaintenanceIcon color="white" />
                              </IconContainer>
                              <Flex flexDirection="column">
                                <ItemTitle>
                                  {t('urgente')}
                                  {' '}
                                </ItemTitle>
                                <ItemSubTitle>
                                  {t('totalDeCiclos')}
                                </ItemSubTitle>
                              </Flex>
                            </Flex>
                          </Box>
                          <Box width={1 / 2}>
                            <Flex alignItems="center" width={1} flexDirection="column">
                              <ItemValue>
                                <ItemVal>{thousandPointFormat(machinesHealthNow.red)}</ItemVal>
                              </ItemValue>
                              {compareMachinesRed !== null && (
                              <>
                                <ItemCompare style={{ color: compareMachinesRed > 0 ? colors.RedDark : colors.GreenLight }}>
                                  {formatNumberWithFractionDigits(compareMachinesRed, { minimum: 2, maximum: 2 })}
                                  %
                                </ItemCompare>
                                {
                                        compareMachinesRed ? (compareMachinesRed > 0 ? <RedTriangleUp /> : <GreenTriangleDown />) : ''
                                      }
                              </>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Link>
                      <Link
                        to={`/analise/maquinas?preFiltered=Máquina desativada${formatSelectedFilter() || ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10} onClick={() => saveOverviewFilters && saveOverviewFilters()}>
                          <Box width={1 / 2}>
                            <Flex width={1} alignItems="center" justifyContent="center" style={{ gap: '8px' }}>
                              <IconContainer style={{ background: 'grey' }}>
                                <HealthDisabledIcon color="white" />
                              </IconContainer>
                              <Flex flexDirection="column">
                                <ItemTitle>
                                  {t('desativada')}
                                  {' '}
                                </ItemTitle>
                                <ItemSubTitle>
                                  {t('totalDeCiclos')}
                                </ItemSubTitle>
                              </Flex>
                            </Flex>
                          </Box>
                          <Box width={1 / 2}>
                            <Flex alignItems="center" width={1} flexDirection="column">
                              <ItemValue>
                                <ItemVal>{thousandPointFormat(machinesHealthNow.deactiv)}</ItemVal>
                              </ItemValue>
                              {compareMachinesDeactiv !== null && (
                              <>
                                <ItemCompare style={{ color: compareMachinesDeactiv > 0 ? colors.RedDark : colors.GreenLight }}>
                                  {formatNumberWithFractionDigits(compareMachinesDeactiv, { minimum: 2, maximum: 2 })}
                                  %
                                </ItemCompare>
                                {
                                        compareMachinesDeactiv ? (compareMachinesDeactiv > 0 ? <RedTriangleUp /> : <GreenTriangleDown />) : ''
                                      }
                              </>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Link>
                      <Link
                        to={`/analise/maquinas?preFiltered=Sem informação${formatSelectedFilter() || ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10} onClick={() => saveOverviewFilters && saveOverviewFilters()}>
                          <Box width={1 / 2}>
                            <Flex width={1} alignItems="center" justifyContent="center" style={{ gap: '8px' }}>
                              <IconContainer style={{ background: '#BBBBBB' }}>
                                <UnknownHealthDarkIcon color="white" />
                              </IconContainer>
                              <Flex flexDirection="column">
                                <ItemTitle>
                                  {t('semInfo')}
                                  {' '}
                                </ItemTitle>
                                <ItemSubTitle>
                                  {t('totalDeCiclos')}
                                </ItemSubTitle>
                              </Flex>
                            </Flex>
                          </Box>
                          <Box width={1 / 2}>
                            <Flex alignItems="center" width={1} flexDirection="column">
                              <ItemValue>
                                <ItemVal>{thousandPointFormat(machinesHealthNow.others)}</ItemVal>
                              </ItemValue>
                              {compareMachinesOthers !== null && (
                              <>
                                <ItemCompare style={{ color: compareMachinesOthers > 0 ? colors.RedDark : colors.GreenLight }}>
                                  {formatNumberWithFractionDigits(compareMachinesOthers, { minimum: 2, maximum: 2 })}
                                  %
                                </ItemCompare>
                                {
                                        compareMachinesOthers ? (compareMachinesOthers > 0 ? <RedTriangleUp /> : <GreenTriangleDown />) : ''
                                      }
                              </>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Link>
                    </Box>
                  </Flex>

                </Flex>
              )}

              <Flex flexWrap="wrap" flexDirection="row-reverse" justifyContent="space-between" alignItems="flex-end" width={1} pl={15} mt={state.showAsHistory ? '13px' : '93px'}>
                <Box>
                  <BtnList onClick={() => {
                    state.showList = !state.showList;
                    render();
                  }}
                  >
                    {t('verLista')}

                  </BtnList>
                </Box>
              </Flex>

              {state.showList ? (
                <Flex flexDirection="column">
                  <Flex
                    flexWrap="wrap"
                    width={1}
                    mt={10}
                  >
                    <Table
                      style={{
                        overflow: 'auto', height: '300px', borderCollapse: 'separate', boxShadow: 'none',
                      }}
                      columns={dacColumns([t('estado'), t('cidade'), t('unidade'), t('dispositivo'), t('saude'), t('historico')])}
                      data={processedDacs}
                      dense
                      border={false}
                    />
                  </Flex>
                  {machinesPag && onPageChange && (
                  <Flex justifyContent="flex-end" width={1} pt={10} mt={10} style={{ borderTop: '0.7px solid rgba(0,0,0,0.2)' }}>
                    <Pagination
                      className="ant-pagination"
                      defaultCurrent={machinesPag.tablePage}
                      total={machinesPag.totalItems}
                      locale={pageLocale}
                      pageSize={machinesPag.tablePageSize}
                      onChange={(current) => onPageChange(current)}
                    />
                  </Flex>
                  )}
                </Flex>
              ) : <></>}
            </div>
          </>
        )}

      </Card>
    </Box>
  );
};
