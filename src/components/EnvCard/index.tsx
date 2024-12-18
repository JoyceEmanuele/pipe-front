import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Flex, Box } from 'reflexbox';
import { t } from 'i18next';
import OrderIcon from '../../assets/img/order.svg';
import { Card, Table, Loader } from '../index';
import { useStateVar } from '../../helpers/useStateVar';
import {
  AmbsHistoryContents,
  daysRange,
} from '../../pages/Overview/AmbsHistoryCard';
import { colors } from '../../styles/colors';
import Pagination from 'rc-pagination';

import {
  Line,
  TopTitle,
  ItemTitle,
  ItemSubTitle,
  ItemValue,
  ItemVal,
  TempGreat,
  TempLow,
  TempHigh,
  NoTempData,
  BtnList,
  StyledLink,
  CellLabel,
  TootipTexName,
  OverLay,
  TopDate,
} from './styles';
import { CardManager } from '../CardManager';
import { ICard, useCard } from '../../contexts/CardContext';
import { useTour } from '~/contexts/TourContext';
import { TourPopover } from '../TourPopover';
import moment from 'moment';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const tempData = (original) => {
  if (original.temprtAlert === 'high') return <TempHigh />;

  if (original.temprtAlert === 'low') return <TempLow />;

  if (original.temprtAlert === 'good') return <TempGreat />;

  return <NoTempData />;
};

const dutColumns = [
  {
    Header: () => (
      <span>
        {t('unidade')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'UNIT_NAME',
    // disableSortBy: true,
    Cell: (props) => (
      <div>
        <StyledLink to={`/analise/unidades/${props.row.original.UNIT_ID}`}>
          {props.row.original.UNIT_NAME}
        </StyledLink>
      </div>
    ),
  },
  {
    Header: () => (
      <span>
        {t('ambiente')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'ROOM_NAME',
    // disableSortBy: true,
    Cell: (props) => (
      <div
        style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <StyledLink
          to={`/analise/ambiente/${props.row.original.DEV_ID}/informacoes`}
        >
          {props.row.original.ROOM_NAME}
        </StyledLink>
      </div>
    ),
  },
  {
    Header: () => (
      <span>
        {t('temperatura')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'Temperature',
    // disableSortBy: true,
    Cell: (props) => (props.row.original.Temperature != null ? (
      <Flex alignItems="center" width={1}>
        <CellLabel style={{ width: 33, textAlign: 'right', marginRight: 10 }}>
          {formatNumberWithFractionDigits(props.row.original.Temperature)}
          °C
        </CellLabel>
        {tempData(props.row.original)}
      </Flex>
    ) : (
      <CellLabel style={{ marginLeft: '25px' }}>-</CellLabel>
    )),
  },
  {
    Header: () => (
      <span>
        {t('limites')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'LIMITS',
    disableSortBy: true,
    Cell: (props) => (props.row.original.TUSEMIN != null
      && props.row.original.TUSEMAX != null ? (
        <div>
          <CellLabel style={{ paddingRight: '7px' }}>
            {formatNumberWithFractionDigits(props.row.original.TUSEMIN)}
            °C
          </CellLabel>
          a
          <CellLabel style={{ paddingLeft: '7px' }}>
            {formatNumberWithFractionDigits(props.row.original.TUSEMAX)}
            °C
          </CellLabel>
        </div>
      ) : (
        <CellLabel style={{ paddingLeft: '20px' }}>-</CellLabel>
      )),
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

export const EnvBlocks = ({
  envs,
  dutsCount,
  squareSize,
  dutsTempHigh,
  dutsTempOk,
  dutsTempLow,
  dutsNoTempData,
}): JSX.Element => {
  if (dutsCount > 0 && dutsCount < 500 && envs) {
    const dutListCloneHigh = envs.filter(
      (dut) => !!dut.ROOM_NAME && dut.temprtAlert === 'high',
    );
    const dutListCloneOk = envs.filter(
      (dut) => !!dut.ROOM_NAME && dut.temprtAlert === 'good',
    );
    const dutListCloneLow = envs.filter(
      (dut) => !!dut.ROOM_NAME && dut.temprtAlert === 'low',
    );
    const dutListCloneNoData = envs.filter(
      (dut) => !!dut.ROOM_NAME && !dut.temprtAlert,
    );

    return (
      <>
        {dutListCloneHigh.map((dut) => (
          <StyledLink to={`/analise/ambiente/${dut.DEV_ID}/informacoes`} key={dut.DEV_ID}>
            <div
              data-tip
              data-for={dut.DEV_ID}
              style={{
                margin: dutsCount >= 200 ? 1 : 2.5,
                width: squareSize - (dutsCount >= 200 ? 2 : 5),
                height: squareSize - (dutsCount >= 200 ? 2 : 5),
                borderRadius: dutsCount >= 200 ? 2 : 5,
                background: colors.RedDark,
              }}
            >
              <ReactTooltip
                id={`${dut.DEV_ID}`}
                place="right"
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
              >
                <Box width={1}>
                  <TootipTexName>
                    <strong>{`${t('ambiente')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>{dut.ROOM_NAME}</TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <TootipTexName>
                    <strong>{`${t('limiteDeTemperatura')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>
                    {dut.TUSEMIN == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMIN)}
                    °C -
                    {' '}
                    {dut.TUSEMAX == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMAX)}
                    °C
                  </TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>{`${t('media')}:`}</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.med)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Máx:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.max)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Min:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.min)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                  </Flex>
                </Box>
              </ReactTooltip>
            </div>
          </StyledLink>
        ))}
        {dutListCloneOk.map((dut) => (
          <StyledLink to={`/analise/ambiente/${dut.DEV_ID}/informacoes`} key={dut.DEV_ID}>
            <div
              data-tip
              data-for={dut.DEV_ID}
              style={{
                margin: dutsCount >= 200 ? 1 : 2.5,
                width: squareSize - (dutsCount >= 200 ? 2 : 5),
                height: squareSize - (dutsCount >= 200 ? 2 : 5),
                borderRadius: dutsCount >= 200 ? 2 : 5,
                background: colors.GreenLight,
              }}
            >
              <ReactTooltip
                id={`${dut.DEV_ID}`}
                place="right"
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
              >
                <Box width={1}>
                  <TootipTexName>
                    <strong>{`${t('ambiente')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>{dut.ROOM_NAME}</TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <TootipTexName>
                    <strong>{`${t('limiteDeTemperatura')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>
                    {dut.TUSEMIN == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMIN)}
                    °C -
                    {' '}
                    {dut.TUSEMAX == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMAX)}
                    °C
                  </TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>{`${t('media')}:`}</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.med)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Máx:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.max)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Min:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.min)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                  </Flex>
                </Box>
              </ReactTooltip>
            </div>
          </StyledLink>
        ))}
        {dutListCloneLow.map((dut) => (
          <StyledLink to={`/analise/ambiente/${dut.DEV_ID}/informacoes`} key={dut.DEV_ID}>
            <div
              data-tip
              data-for={dut.DEV_ID}
              style={{
                margin: dutsCount >= 200 ? 1 : 2.5,
                width: squareSize - (dutsCount >= 200 ? 2 : 5),
                height: squareSize - (dutsCount >= 200 ? 2 : 5),
                borderRadius: dutsCount >= 200 ? 2 : 5,
                background: colors.BlueSecondary_v3,
              }}
            >
              <ReactTooltip
                id={`${dut.DEV_ID}`}
                place="right"
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
              >
                <Box width={1}>
                  <TootipTexName>
                    <strong>{`${t('ambiente')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>{dut.ROOM_NAME}</TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <TootipTexName>
                    <strong>{`${t('limiteDeTemperatura')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>
                    {dut.TUSEMIN == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMIN)}
                    °C -
                    {' '}
                    {dut.TUSEMAX == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMAX)}
                    °C
                  </TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>{`${t('media')}:`}</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.med)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Máx:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.max)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Min:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.min)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                  </Flex>
                </Box>
              </ReactTooltip>
            </div>
          </StyledLink>
        ))}
        {dutListCloneNoData.map((dut) => (
          <StyledLink to={`/analise/ambiente/${dut.DEV_ID}/informacoes`} key={dut.DEV_ID}>
            <div
              data-tip
              data-for={dut.DEV_ID}
              style={{
                margin: dutsCount >= 200 ? 1 : 2.5,
                width: squareSize - (dutsCount >= 200 ? 2 : 5),
                height: squareSize - (dutsCount >= 200 ? 2 : 5),
                borderRadius: dutsCount >= 200 ? 2 : 5,
                background: colors.Grey_v3,
              }}
            >
              <ReactTooltip
                id={`${dut.DEV_ID}`}
                place="right"
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
              >
                <Box width={1}>
                  <TootipTexName>
                    <strong>{`${t('ambiente')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>{dut.ROOM_NAME}</TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <TootipTexName>
                    <strong>{`${t('limiteDeTemperatura')}:`}</strong>
                  </TootipTexName>
                  <TootipTexName>
                    {dut.TUSEMIN == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMIN)}
                    °C -
                    {' '}
                    {dut.TUSEMAX == null ? '-' : formatNumberWithFractionDigits(dut.TUSEMAX)}
                    °C
                  </TootipTexName>
                </Box>

                <Box width={1} mt={3}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>{`${t('media')}:`}</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.med)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Máx:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.max)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                    <Box width={1 / 3}>
                      <TootipTexName>
                        <strong>Min:</strong>
                      </TootipTexName>
                      <TootipTexName>
                        {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.min)) || '-'}
                        °C
                      </TootipTexName>
                    </Box>
                  </Flex>
                </Box>
              </ReactTooltip>
            </div>
          </StyledLink>
        ))}
      </>
    );
  }
  return (
    <>
      <div
        style={{
          width: '100%',
          height: `${
            (dutsTempHigh
              / (dutsTempHigh + dutsTempOk + dutsTempLow + dutsNoTempData))
            * 100
          }%`,
          background: colors.RedDark,
          borderTopRightRadius: 5,
          borderTopLeftRadius: 5,
        }}
      />
      <div
        style={{
          width: '100%',
          height: `${
            (dutsTempOk
              / (dutsTempHigh + dutsTempOk + dutsTempLow + dutsNoTempData))
            * 100
          }%`,
          background: colors.GreenLight,
        }}
      />
      <div
        style={{
          width: '100%',
          height: `${
            (dutsTempLow
              / (dutsTempHigh + dutsTempOk + dutsTempLow + dutsNoTempData))
            * 100
          }%`,
          background: colors.BlueSecondary_v3,
        }}
      />
      <div
        style={{
          width: '100%',
          height: `${
            (dutsNoTempData
              / (dutsTempHigh + dutsTempOk + dutsTempLow + dutsNoTempData))
            * 100
          }%`,
          background: colors.Grey_v3,
          borderBottomRightRadius: 5,
          borderBottomLeftRadius: 5,
        }}
      />
    </>
  );
};

export const EnvCard = (props: {
  maxWidth?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  manageAllClients: boolean|undefined
  enableHistoryTab: boolean
  paramsForLoadData: null|{
    selectedUnit: number[]
    selectedCity: string[]
    selectedState: number[]
    selectedTimeRange: string
    selectedClient: number[]
    date: moment.Moment
    endDate: moment.Moment
    monthDate: Date
    startDate: moment.Moment
  };
  selectedFilter?: {
    unitIds?: string[];
    stateIds?: string[];
    cityIds?: string[];
  };
  saveOverviewFilters?: () => void;
}) => {
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
    disabledCategories: {} as { [category: string]: boolean },

    isLoadingRoomsOverviewChart: false,
    isLoadingRoomsHistoryChart: false,
    isLoadingRoomsList: false,

    roomsHistory: null as null|{
      day: string;
      good: number;
      high: number;
      low: number;
      others: number;
      dutsList?: {
        DEV_ID: string
        ROOM_NAME: string
        TUSEMIN: number
        TUSEMAX: number
        med: number
        max: number
        min: number
        temprtAlert: 'low'|'high'|'good'|null
      }[],
    }[],

    dutList: null as null|{
      CLIENT_ID: number
      UNIT_ID: number
      UNIT_NAME: string
      DEV_ID: string
      ROOM_NAME: string
      ISVISIBLE: number
      Temperature?: number
      temprtAlert?: 'low'|'high'|'good'|null
      TUSEMIN?: number
      TUSEMAX?: number
    }[],
    dutsCount: 0,
    invisibleDuts: 0,
    dutsTempOk: 0,
    dutsTempHigh: 0,
    dutsTempLow: 0,
    dutsNoTempData: 0,
    totalRoomsData: undefined as undefined|{
      DEV_ID: string;
      ROOM_NAME: string;
      TUSEMIN: number;
      TUSEMAX: number;
      tpstats?: {
          med: number;
          max: number;
          min: number;
      } | undefined;
      temprtAlert: 'low' | 'high' | 'good' | null;
    }[],
    roomsPag: {
      tablePage: 1,
      tablePageSize: 20,
      totalItems: 0,
    },
  }));

  const isLoading = state.isLoadingRoomsList || state.isLoadingRoomsOverviewChart || state.isLoadingRoomsHistoryChart;

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

  const processedDuts = useMemo(
    () => (state.dutList || [])
      .filter((x) => {
        if (x.ISVISIBLE !== 1) return false;
        if (!!x.ROOM_NAME === true) {
          const definedStates: Set<string | null | undefined> = new Set([
            'high',
            'good',
            'low',
          ]);
          if (!state.showAsHistory) return true;

          if (definedStates.has(x.temprtAlert)) {
            return !state.disabledCategories[x.temprtAlert!];
          }
          return !state.disabledCategories.others;
        }
        return false;
      })
      .sort((a, b) => {
        if (state.filter === t('unidade')) {
          return a.UNIT_NAME < b.UNIT_NAME
            ? -1
            : a.UNIT_NAME > b.UNIT_NAME
              ? 1
              : 0;
        }
        if (state.filter === t('ambiente')) {
          return a.ROOM_NAME < b.ROOM_NAME
            ? -1
            : a.ROOM_NAME > b.ROOM_NAME
              ? 1
              : 0;
        }
        return (a.Temperature || 0) - (b.Temperature || 0);
      }),
    [state.dutList, state.filter, state.disabledCategories, state.showAsHistory],
  );

  const squareSize = useMemo(() => {
    // Compute number of rows and columns, and cell size
    const x = 200;
    const y = 250;
    const n = state.dutsCount;
    const ratio = x / y;
    const ncols_float = Math.sqrt(n * ratio);
    const nrows_float = n / ncols_float;

    // Find best option filling the whole height
    let nrows1 = Math.ceil(nrows_float);
    let ncols1 = Math.ceil(n / nrows1);
    while (nrows1 * ratio < ncols1) {
      nrows1++;
      ncols1 = Math.ceil(n / nrows1);
    }
    const cell_size1 = y / nrows1;

    // Find best option filling the whole width
    let ncols2 = Math.ceil(ncols_float);
    let nrows2 = Math.ceil(n / ncols2);
    while (ncols2 < nrows2 * ratio) {
      ncols2++;
      nrows2 = Math.ceil(n / ncols2);
    }
    const cell_size2 = x / ncols2;

    // Find the best values
    let nrows;
    let ncols;
    let cell_size;
    if (cell_size1 < cell_size2) {
      nrows = nrows2;
      ncols = ncols2;
      cell_size = cell_size2;
    } else {
      nrows = nrows1;
      ncols = ncols1;
      cell_size = cell_size1;
    }

    return cell_size;
  }, [state.dutsCount]);

  const { tour, isTourActive } = useTour();
  const { cards } = useCard();
  const initialStep = tour.findIndex((step) => step.step === 0);
  const envCard = cards.find((card) => card.title === 'Ambientes');

  const envCardDaysRange = useMemo(() => {
    if (envCard?.isExpanded) return daysRange(state.roomsHistory);
    return daysRange(state.roomsHistory?.slice(-7) || []);
  }, [envCard, state.roomsHistory]);
  useEffect(() => {
    if (state.roomsHistory || state.isLoadingRoomsHistoryChart) {
      // O histórico já foi ou está sendo carregado
      return;
    }
    if (!props.paramsForLoadData) {
      return;
    }
    if (state.showAsHistory || envCard?.isExpanded) {
      roomsHistoryChart();
    }
  }, [envCard?.isExpanded, state.showAsHistory, state.roomsHistory, props.paramsForLoadData]);

  useEffect(() => {
    if (state.dutList || state.isLoadingRoomsList) {
      // A lista já foi ou está sendo carregada
      return;
    }
    if (!props.paramsForLoadData) {
      return;
    }
    if (state.showList) {
      getRoomsList();
    }
  }, [state.showList, state.dutList, props.paramsForLoadData]);

  async function getRoomsList(page?: number) {
    state.isLoadingRoomsList = true;
    render();

    if (!page) state.roomsPag.tablePage = 1;

    try {
      const roomsList = await apiCall('/overview-rooms-list', {
        INCLUDE_INSTALLATION_UNIT: !!props.manageAllClients,
        unitIds: props.paramsForLoadData!.selectedUnit.length ? props.paramsForLoadData!.selectedUnit : undefined,
        cityIds: props.paramsForLoadData!.selectedCity.length ? props.paramsForLoadData!.selectedCity : undefined,
        stateIds: props.paramsForLoadData!.selectedState.length > 0 ? props.paramsForLoadData!.selectedState : undefined,
        clientIds: props.paramsForLoadData!.selectedClient.length ? props.paramsForLoadData!.selectedClient : undefined,
        SKIP: (state.roomsPag.tablePage - 1) * state.roomsPag.tablePageSize,
        LIMIT: state.roomsPag.tablePageSize,
      });
      state.dutList = roomsList.list;
      state.roomsPag.totalItems = roomsList.totalItems;
    } catch (err) {
      console.log(err);
      toast.error(t('erroDUTs'));
    }

    state.isLoadingRoomsList = false;
    render();
  }

  const onPageChange = (page) => {
    state.roomsPag.tablePage = page;
    if (props.paramsForLoadData) {
      getRoomsList(page);
    }
    render();
  };

  async function roomsOverviewChart() {
    state.isLoadingRoomsOverviewChart = true;
    render();

    try {
      const { currentData } = await apiCall('/overview-card-rooms', cardParams());
      state.dutsCount = currentData.good + currentData.high + currentData.low + currentData.others;
      state.dutsTempOk = currentData.good;
      state.dutsTempHigh = currentData.high;
      state.dutsTempLow = currentData.low;
      state.dutsNoTempData = currentData.others;
      state.totalRoomsData = currentData.dutsList;
      state.invisibleDuts = currentData.invisible;
    } catch (err) {
      console.log(err);
      toast.error(t('erroSaudeMaquinas'));
    }
    state.isLoadingRoomsOverviewChart = false;
    render();
  }

  async function roomsHistoryChart() {
    state.isLoadingRoomsHistoryChart = true;
    state.roomsHistory = null;
    render();

    try {
      let refDate = moment();
      if (props.paramsForLoadData!.selectedTimeRange === t('semana')) {
        refDate = moment(props.paramsForLoadData!.date).add(6, 'day');
      } else if (props.paramsForLoadData!.selectedTimeRange === t('dia')) {
        refDate = moment(props.paramsForLoadData!.date);
      } else if (props.paramsForLoadData!.selectedTimeRange === t('flexivel')) {
        refDate = moment(props.paramsForLoadData!.endDate);
      } else if (props.paramsForLoadData!.selectedTimeRange === t('mes')) {
        refDate = moment(props.paramsForLoadData!.monthDate).endOf('month');
      }
      if (refDate.format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')) {
        refDate = moment().subtract(1, 'day');
      }

      const daysList = [] as string[];
      for (let i = 0; i < 13; i++) {
        daysList.push(refDate.format('YYYY-MM-DD'));
        if (props.paramsForLoadData!.selectedTimeRange === t('mes')) {
          refDate = refDate.subtract(1, 'month');
        } else {
          refDate = refDate.subtract(1, 'day');
        }
      }
      if (props.paramsForLoadData!.selectedTimeRange === t('flexivel')) {
        const startYMD = props.paramsForLoadData!.startDate.format('YYYY-MM-DD');
        while ((daysList.length < 15) && (daysList[daysList.length - 1] > startYMD)) {
          daysList.push(refDate.format('YYYY-MM-DD'));
          refDate = refDate.subtract(1, 'day');
        }
      }
      daysList.reverse();

      const { list } = await apiCall('/overview-card-rooms', cardParams(daysList));
      state.roomsHistory = list;
    } catch (err) {
      console.log(err);
      toast.error(t('erroSaudeMaquinas'));
    }
    state.isLoadingRoomsHistoryChart = false;
    render();
  }

  function cardParams(daysList?: string[]) {
    return {
      INCLUDE_INSTALLATION_UNIT: !!props.manageAllClients,
      days: daysList,
      historyOnly: !!daysList,
      unitIds: props.paramsForLoadData!.selectedUnit.length ? props.paramsForLoadData!.selectedUnit : undefined,
      cityIds: props.paramsForLoadData!.selectedCity.length ? props.paramsForLoadData!.selectedCity : undefined,
      stateIds: props.paramsForLoadData!.selectedState.length > 0 ? props.paramsForLoadData!.selectedState : undefined,
      clientIds: props.paramsForLoadData!.selectedClient.length ? props.paramsForLoadData!.selectedClient : undefined,
    };
  }

  function loadData() {
    state.dutsCount = 0;
    state.invisibleDuts = 0;
    state.dutsTempOk = 0;
    state.dutsTempHigh = 0;
    state.dutsTempLow = 0;
    state.dutsNoTempData = 0;
    state.roomsHistory = null;
    state.dutList = null;

    render();

    if (props.paramsForLoadData) {
      roomsOverviewChart();
    }
  }

  useEffect(() => {
    loadData();
  }, [props.paramsForLoadData]);

  return (
    <Box
      width={envCard?.isExpanded ? 1 : [1, 1, 1, 1, 25 / 51, 25 / 51]}
      mb={40}
      ml={marginLeft}
      mr={marginRight}
      style={envCard?.isExpanded ? { maxWidth: maxWidth || 'none', height: 'auto' } : { maxWidth: maxWidth || 'none', minHeight: 570 }}
    >
      <Card noPaddingRelative wrapperStyle={envCard?.isExpanded ? { minHeight: 'auto' } : { minHeight: 570 }}>
        <div style={{ padding: '10px 30px' }}>
          <Flex
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <TopTitle>{t('ambientes')}</TopTitle>
            <TopDate>
              &nbsp;
              {state.showAsHistory && envCardDaysRange}
            </TopDate>
            {isTourActive ? (
              <TourPopover tour={tour[initialStep]}>
                <CardManager card={envCard as ICard} />
              </TourPopover>
            ) : (
              <CardManager card={envCard as ICard} />
            )}
          </Flex>
        </div>

        {envCard?.isExpanded ? (
          <></>
        ) : (
          <>
            {props.enableHistoryTab && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 6px 150px auto',
                    height: '5px',
                  }}
                >
                  <span
                    style={{
                      borderTop: '1px solid lightgrey',
                      borderRight: '1px solid lightgrey',
                      borderRadius: '6px 6px 0 0',
                      backgroundColor: state.showAsHistory
                        ? '#f4f4f4'
                        : 'transparent',
                    }}
                  />
                  <span />
                  <span
                    style={{
                      border: '1px solid lightgrey',
                      borderBottom: 'none',
                      borderRadius: '6px 6px 0 0',
                      backgroundColor: state.showAsHistory
                        ? 'transparent'
                        : '#f4f4f4',
                    }}
                  />
                  <span />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 6px 150px auto',
                    marginBottom: '10px',
                  }}
                >
                  <span
                    style={{
                      borderRight: '1px solid lightgrey',
                      textAlign: 'center',
                      fontSize: '90%',
                      borderBottom: state.showAsHistory
                        ? '1px solid lightgrey'
                        : 'none',
                      backgroundColor: state.showAsHistory
                        ? '#f4f4f4'
                        : 'transparent',
                      cursor: state.showAsHistory ? 'pointer' : undefined,
                    }}
                    onClick={() => {
                      state.showAsHistory
                        && setState({ showAsHistory: !state.showAsHistory });
                    }}
                  >
                    {t('temperaturaAtual')}
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
                      borderBottom: state.showAsHistory
                        ? 'none'
                        : '1px solid lightgrey',
                      backgroundColor: state.showAsHistory
                        ? 'transparent'
                        : '#f4f4f4',
                      cursor: !state.showAsHistory ? 'pointer' : undefined,
                    }}
                    onClick={() => {
                      !state.showAsHistory
                        && setState({ showAsHistory: !state.showAsHistory });
                    }}
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
        ) : (
          <></>
        )}

        {envCard?.isExpanded ? (
          <div
            style={{
              paddingLeft: '30px',
              paddingRight: '30px',
              paddingBottom: '12px',
            }}
          >
            <div style={{ paddingTop: '10px' }}>
              <AmbsHistoryContents
                state={state}
                render={render}
                roomsHistory={state.roomsHistory}
              />
            </div>
            <Flex
              flexWrap="wrap"
              flexDirection="row-reverse"
              justifyContent="space-between"
              alignItems="flex-end"
              mt={1}
              width={1}
              pl={15}
            >
              <Box>
                <BtnList
                  onClick={() => {
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
                <Flex flexWrap="wrap" width={1} mt={10}>
                  <Table
                    style={{
                      overflow: 'auto',
                      height: '300px',
                      borderCollapse: 'separate',
                      boxShadow: 'none',
                    }}
                    columns={dutColumns}
                    data={processedDuts}
                    dense
                    border={false}
                  />
                </Flex>
                {state.roomsPag && onPageChange && (
                  <Flex
                    justifyContent="flex-end"
                    width={1}
                    pt={10}
                    mt={10}
                    style={{ borderTop: '0.7px solid rgba(0,0,0,0.2)' }}
                  >
                    <Pagination
                      className="ant-pagination"
                      defaultCurrent={state.roomsPag.tablePage}
                      total={state.roomsPag.totalItems}
                      locale={pageLocale}
                      pageSize={state.roomsPag.tablePageSize}
                      onChange={(current) => onPageChange && onPageChange(current)}
                    />
                  </Flex>
                )}
              </Flex>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div
            style={{
              paddingLeft: '30px',
              paddingRight: '30px',
              paddingBottom: '12px',
            }}
          >
            {state.showAsHistory ? (
              <div style={{ paddingTop: '10px' }}>
                <AmbsHistoryContents
                  state={state}
                  render={render}
                  roomsHistory={state.roomsHistory?.slice(-7) || []}
                />
              </div>
            ) : (
              <Flex
                flexWrap="wrap"
                justifyContent="space-around"
                alignItems="center"
                mt={35}
                pl={15}
                pr={15}
                pb={10}
              >
                <Box width={[1, 1, 1, 3 / 5, 3 / 5, 3 / 5]} pr={30}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <ItemTitle>{t('total')}</ItemTitle>
                      <ItemSubTitle>{t('ambientesMonitorados')}</ItemSubTitle>
                    </Box>
                    <Box>
                      <ItemValue>
                        <ItemVal>{formatNumberWithFractionDigits(state.dutsCount)}</ItemVal>
                      </ItemValue>
                    </Box>
                  </Flex>

                  <Line />

                  <Link
                    to={`/analise/ambientes?preFiltered=Temperatura acima${
                      formatSelectedFilter() || ''
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Flex
                      flexWrap="wrap"
                      justifyContent="space-between"
                      alignItems="center"
                      width={1}
                      mt={15}
                      onClick={() => saveOverviewFilters && saveOverviewFilters()}
                    >
                      <Box>
                        <ItemTitle>
                          {t('temperaturaAcima')}
                          {' '}
                          <TempHigh />
                        </ItemTitle>
                        <ItemSubTitle>{`Total ${t('ambientes')}`}</ItemSubTitle>
                      </Box>
                      <Box>
                        <ItemValue>
                          <ItemVal>{formatNumberWithFractionDigits(state.dutsTempHigh)}</ItemVal>
                        </ItemValue>
                      </Box>
                    </Flex>
                  </Link>

                  <Link
                    to={`/analise/ambientes?preFiltered=Temperatura correta${
                      formatSelectedFilter() || ''
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Flex
                      flexWrap="wrap"
                      justifyContent="space-between"
                      alignItems="center"
                      width={1}
                      mt={15}
                      onClick={() => saveOverviewFilters && saveOverviewFilters()}
                    >
                      <Box>
                        <ItemTitle>
                          {t('temperaturaCorreta')}
                          {' '}
                          <TempGreat />
                        </ItemTitle>
                        <ItemSubTitle>{`Total ${t('ambientes')}`}</ItemSubTitle>
                      </Box>
                      <Box>
                        <ItemValue>
                          <ItemVal>{formatNumberWithFractionDigits(state.dutsTempOk)}</ItemVal>
                        </ItemValue>
                      </Box>
                    </Flex>
                  </Link>

                  <Link
                    to={`/analise/ambientes?preFiltered=Temperatura abaixo${
                      formatSelectedFilter() || ''
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Flex
                      flexWrap="wrap"
                      justifyContent="space-between"
                      alignItems="center"
                      width={1}
                      mt={15}
                      onClick={() => saveOverviewFilters && saveOverviewFilters()}
                    >
                      <Box>
                        <ItemTitle>
                          {t('temperaturaAbaixo')}
                          {' '}
                          <TempLow />
                        </ItemTitle>
                        <ItemSubTitle>{`Total ${t('ambientes')}`}</ItemSubTitle>
                      </Box>
                      <Box>
                        <ItemValue>
                          <ItemVal>{formatNumberWithFractionDigits(state.dutsTempLow)}</ItemVal>
                        </ItemValue>
                      </Box>
                    </Flex>
                  </Link>

                  <Link
                    to={`/analise/ambientes?preFiltered=Sem info${
                      formatSelectedFilter() || ''
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Flex
                      flexWrap="wrap"
                      justifyContent="space-between"
                      alignItems="center"
                      width={1}
                      mt={15}
                      onClick={() => saveOverviewFilters && saveOverviewFilters()}
                    >
                      <Box>
                        <ItemTitle>
                          {t('semInfo')}
                          {' '}
                          <NoTempData />
                        </ItemTitle>
                        <ItemSubTitle>{`Total ${t('ambientes')}`}</ItemSubTitle>
                      </Box>
                      <Box>
                        <ItemValue>
                          <ItemVal>{formatNumberWithFractionDigits(state.dutsNoTempData)}</ItemVal>
                        </ItemValue>
                      </Box>
                    </Flex>
                  </Link>
                </Box>

                <Box width={[1, 1, 1, 2 / 5, 2 / 5, 2 / 5]}>
                  <Flex
                    alignItems="center"
                    width={1}
                    justifyContent="center"
                    pl={30}
                  >
                    <Flex
                      flexWrap="wrap"
                      width={1}
                      justifyContent="flex-start"
                      alignContent="flex-start"
                      style={{
                        minWidth: 200,
                        minHeight: 250,
                        maxWidth: 200,
                        maxHeight: 250,
                        width: 200,
                        height: 250,
                      }}
                    >
                      {(state.dutsCount || state.totalRoomsData) && (
                        <EnvBlocks
                          envs={state.totalRoomsData}
                          dutsCount={state.dutsCount}
                          squareSize={squareSize}
                          dutsTempHigh={state.dutsTempHigh}
                          dutsTempOk={state.dutsTempOk}
                          dutsTempLow={state.dutsTempLow}
                          dutsNoTempData={state.dutsNoTempData}
                        />
                      )}
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            )}

            <Flex
              flexWrap="wrap"
              flexDirection="row-reverse"
              justifyContent="space-between"
              alignItems="flex-end"
              mt={state.showAsHistory ? '10px' : '105px'}
              width={1}
              pl={15}
            >
              <Box>
                <BtnList
                  onClick={() => {
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
                <Flex flexWrap="wrap" width={1} mt={10}>
                  <Table
                    style={{
                      overflow: 'auto',
                      height: '300px',
                      borderCollapse: 'separate',
                      boxShadow: 'none',
                    }}
                    columns={dutColumns}
                    data={processedDuts}
                    dense
                    border={false}
                  />
                </Flex>
                {state.roomsPag && onPageChange && (
                  <Flex
                    justifyContent="flex-end"
                    width={1}
                    pt={10}
                    mt={10}
                    style={{ borderTop: '0.7px solid rgba(0,0,0,0.2)' }}
                  >
                    <Pagination
                      className="ant-pagination"
                      defaultCurrent={state.roomsPag.tablePage}
                      total={state.roomsPag.totalItems}
                      locale={pageLocale}
                      pageSize={state.roomsPag.tablePageSize}
                      onChange={(current) => onPageChange && onPageChange(current)}
                    />
                  </Flex>
                )}
              </Flex>
            ) : (
              <></>
            )}
          </div>
        )}
      </Card>
    </Box>
  );
};
