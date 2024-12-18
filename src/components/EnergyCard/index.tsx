import { Button } from '../Button';
import { Card } from '../Card';
import {
  CardContent,
  CardHeader,
  CardHeaderContent,
  FilterHeader,
  FilterHeaderButton,
  LoaderOverlay,
} from './styles';
import { useRef } from 'react';
import { Box } from 'reflexbox';
import { t } from 'i18next';
import { ICard, useCard } from '~/contexts/CardContext';
import { CardManager } from '../CardManager';
import { SelectOptionDropdown } from '../SelectOptionDropdown';
import { EnergyCardFooter } from './EnergyCardFooter';
import { EnergyHistory } from './EnergyHistory';
import { apiCall } from '~/providers';
import moment from 'moment';
import i18n from '~/i18n';
import { Loader } from '../Loader';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, ArrowRightIcon } from '~/icons';
import { capitalizeFirstLetter } from '~/helpers/capitalizeFirstLetter';
import { useStateVar } from '~/helpers/useStateVar';
import { TabOptionCard } from '../ItemCardTabOption/TabOption';
import { EnergyInsights } from './EnergyInsights';
import { useEnergyCard } from './EnergyCardContext';
import { handleGetDatesParams } from '~/helpers/getRangeParamsChart';
import { EnergyTrend } from './EnergyTrends';

export interface EnergyCardProps {
  energyCardFilters: {
    startObject?: boolean;
    unitIds?: number[];
    stateIds?: number[];
    cityIds?: string[];
    clientIds?: number[],
    supervisorIds?: string[]
  };
}

interface FilterDatesProps {
  yearOptions: {
    label: string;
    value: string | number;
    hasData: boolean;
  }[];
  monthOptions: {
    label: string;
    value: string | number;
    hasData: boolean;
  }[];
}

export const EnergyCard: React.FC<EnergyCardProps> = ({
  energyCardFilters,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const {
    isLoadingFilters,
    handleSetIsLoadingFilters,
    cardControlTab,
    handleChangeTab,
    tabIsLoading,
    cardDate,
    handleSetCardDate,
  } = useEnergyCard();

  const historyChartRef = useRef({} as { handleGetChartData: (options?) => void });
  const footerRef = useRef({} as { handleResetFilters: () => void });

  const [state, render] = useStateVar({
    chartMode: 'yearMode' as 'yearMode' | 'monthMode',
    isOpenFilterHeader: false,
    isComparingChart: false,
    totalUnitsWithConstructedArea: 0,
    filterDatesCard: {
      yearOptions: [],
      monthOptions: [],
    } as FilterDatesProps,
    tableFilters: {} as {
      clientIds: [],
      stateIds: [],
      cityIds: [],
      unitIds: [],
    },
    procellFilters: [] as number[],
    procellLetters: [] as string[],
    cardTabs: [
      {
        label: 'insights',
        name: 'Insights',
        onClickFunc: () => {
          handleUpdateTab('insights');
        },
      },
      {
        label: 'history',
        name: t('historico'),
        onClickFunc: () => {
          handleUpdateTab('history');
        },
      },
      {
        label: 'trends',
        name: t('tendencia'),
        onClickFunc: () => {
          handleUpdateTab('trends');
        },
      },
    ],
  });

  function handleGetTotalUnits(total: number) {
    state.totalUnitsWithConstructedArea = total;
    render();
  }

  const { cards } = useCard();

  const energyCard = cards.find((card) => card.title === 'Energia');

  const cardContentFactory = {
    history: (
      <EnergyHistory
        ref={historyChartRef}
        chartMode={state.chartMode}
        filterDatesChart={state.filterDatesCard}
        isLoading={isLoadingFilters || tabIsLoading.history}
        energyCardFilters={energyCardFilters}
        insideFilters={state.tableFilters}
        handleClickBarChart={({ name }) => {
          if (state.chartMode === 'monthMode') return;

          const barClicked = moment(name, 'MMM YYYY');

          state.chartMode = 'monthMode';
          handleSetCardDate({
            isApiDate: false,
            year: barClicked.format('YYYY'),
            month: barClicked.format('MMMM'),
          });

          render();
        }}
        handleIsComparing={(value) => {
          state.isComparingChart = value;
          render();
        }}
        handleResetDates={() => {
          handleGetDatesFilter('CONSUMPTION', {});

          render();
        }}
      />
    ),
    insights: (
      <EnergyInsights
        filterDatesChart={state.filterDatesCard}
        isLoading={isLoadingFilters || tabIsLoading.insights}
        energyCardFilters={energyCardFilters}
        insideFilters={state.tableFilters}
        handleClickBarChart={() => {}}
        handleGetTotalUnits={handleGetTotalUnits}
        handleResetProcellFilters={() => {
          state.procellFilters = [];
          state.procellLetters = [];
          render();
        }}
        handleChangeProcellFilters={(units, letters) => {
          handleGetDatesFilter('CONSUMPTION', { unitIds: units });

          state.procellFilters = units;
          state.procellLetters = letters;
          render();
        }}
      />
    ),
    trends: (
      <EnergyTrend
        energyCardFilters={energyCardFilters}
        insideFilters={state.tableFilters}
        handleResetDates={() => {
          handleGetDatesFilter('CONSUMPTION_FORECAST', {});

          render();
        }}
      />
    ),
  };

  const handleGetYearIndex = (label) => state.filterDatesCard.yearOptions.findIndex((year) => moment.utc(year.value).isSame(moment(label, 'YYYY'), 'year'));

  const handleGetMonthIndex = (monthLabel, yearLabel) => state.filterDatesCard.monthOptions.findIndex((month) => moment.utc(month.value).isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

  const checkMonthCanClick = (direction) => {
    const currentMonthIndex = handleGetMonthIndex(cardDate.month, cardDate.year);
    const monthOptions = state.filterDatesCard.monthOptions;

    if (direction > 0) {
      return monthOptions.some((year, index) => currentMonthIndex < index && year.hasData);
    }
    return monthOptions.slice().reverse().some((year, index) => monthOptions.length - (currentMonthIndex + 1) < index && year.hasData);
  };

  const checkYearCanClick = (direction) => {
    const currentYearIndex = handleGetYearIndex(cardDate.year);
    const yearOptions = state.filterDatesCard.yearOptions;

    if (direction > 0) {
      return yearOptions.some((year, index) => currentYearIndex < index && year.hasData);
    }
    return yearOptions.slice().reverse().some((year, index) => yearOptions.length - (currentYearIndex + 1) < index && year.hasData);
  };

  const checkCanClick = (direction) => {
    const { chartMode } = state;

    if (Object.values(tabIsLoading).some(Boolean)) {
      return false;
    }

    if (chartMode === 'monthMode' || cardControlTab !== 'history') {
      return checkMonthCanClick(direction);
    }

    if (chartMode === 'yearMode') {
      return checkYearCanClick(direction);
    }

    return false;
  };

  const handleSelectYear = (direction) => {
    const currentYearIndex = handleGetYearIndex(cardDate.year);
    let newDate = '';

    let breakLoop = false;

    if (direction > 0) {
      state.filterDatesCard.yearOptions.forEach((year, index) => {
        if (currentYearIndex < index && year.hasData && !breakLoop) {
          newDate = moment(`${cardDate.month} ${year.label}`).format('MMMM YYYY');
          breakLoop = true;
        }
      });
    } else {
      state.filterDatesCard.yearOptions.slice().reverse().forEach((year, index) => {
        if (state.filterDatesCard.yearOptions.length - (currentYearIndex + 1) < index && year.hasData && !breakLoop) {
          newDate = moment(`${cardDate.month} ${year.label}`).format('MMMM YYYY');
          breakLoop = true;
        }
      });
    }

    return newDate;
  };

  const handleSelectMonth = (direction) => {
    const currentMonthIndex = handleGetMonthIndex(cardDate.month, cardDate.year);
    let newDate = '';

    let breakLoop = false;

    if (direction > 0) {
      state.filterDatesCard.monthOptions.forEach((month, index) => {
        if (currentMonthIndex < index && month.hasData && !breakLoop) {
          newDate = moment(month.value).format('MMMM YYYY');
          breakLoop = true;
        }
      });
    } else {
      state.filterDatesCard.monthOptions.slice().reverse().forEach((month, index) => {
        if (state.filterDatesCard.monthOptions.length - (currentMonthIndex + 1) < index && month.hasData && !breakLoop) {
          newDate = moment(month.value).format('MMMM YYYY');
          breakLoop = true;
        }
      });
    }

    return newDate;
  };

  const handleDateChange = (direction) => {
    if (!checkCanClick(direction)) return;

    if (state.chartMode === 'monthMode' || cardControlTab !== 'history') {
      const newDate = moment(handleSelectMonth(direction), 'MMMM YYYY');

      handleSetCardDate({
        isApiDate: false,
        year: newDate.format('YYYY'),
        month: newDate.format('MMMM'),
      });
      return;
    }

    if (state.chartMode === 'yearMode') {
      const newDate = moment(handleSelectYear(direction), 'MMMM YYYY');

      handleSetCardDate({
        isApiDate: false,
        year: newDate.format('YYYY'),
        month: newDate.format('MMMM'),
      });
    }
  };

  const generateArrayDates = (anoInicio, anoFim, intervalo) => {
    const datas: string[] = [];
    const dataAtual = moment(`${anoInicio}-01-01`);

    while (dataAtual.year() <= anoFim) {
      datas.push(dataAtual.format('YYYY-MM-DD'));
      dataAtual.add(1, intervalo);
    }

    return datas;
  };

  const handleGetDatesFilter = async (tabType, insideFilters) => {
    try {
      handleSetIsLoadingFilters(true);

      const { years, months } = await apiCall('/energy/get-energy-analysis-hist-filter', {
        insideFilters: { ...state.tableFilters },
        type: tabType,
        ...energyCardFilters,
        ...insideFilters,
      });

      const yearArray = generateArrayDates('2021', '2024', 'year');
      const monthArray = generateArrayDates('2021', '2024', 'month');

      const yearTrated = yearArray.map((year) => {
        const isSameYear = years.find((apiYear) => moment.utc(apiYear.time).isSame(year, 'year'));

        if (isSameYear) {
          return {
            label: moment.utc(year).format('YYYY'),
            value: year,
            hasData: true,
          };
        }
        return {
          label: moment.utc(year).format('YYYY'),
          value: year,
          hasData: false,

        };
      });

      const monthTrated = monthArray.map((month) => {
        const isSameMonth = months.find((apiMonth) => moment.utc(apiMonth.time).isSame(month, 'month'));

        if (isSameMonth) {
          return {
            label: moment.utc(month).format('MMMM'),
            value: month,
            hasData: true,
          };
        }
        return {
          label: moment.utc(month).format('MMMM'),
          value: month,
          hasData: false,

        };
      });

      let breakLoopMonth = false;

      let currentMonthIndex = monthTrated.slice().reverse().findIndex((month) => moment.utc(month.value).isSame(moment(cardDate.month, 'MMMM'), 'month'));

      if (!monthTrated.slice().reverse()[currentMonthIndex].hasData) {
        monthTrated.slice().reverse().forEach((month, index) => {
          if (currentMonthIndex < index && month.hasData && !breakLoopMonth) {
            currentMonthIndex = index;
            breakLoopMonth = true;
          }
        });
      }

      let breakLoopYear = false;

      let currentYearIndex = yearTrated.slice().reverse().findIndex((year) => moment.utc(year.value).isSame(moment(cardDate.year, 'YYYY'), 'year'));

      if (!yearTrated.slice().reverse()[currentYearIndex].hasData) {
        yearTrated.slice().reverse().forEach((year, index) => {
          if (currentYearIndex < index && year.hasData && !breakLoopYear) {
            currentYearIndex = index;
            breakLoopYear = true;
          }
        });
      }

      state.filterDatesCard.yearOptions = yearTrated;
      state.filterDatesCard.monthOptions = monthTrated;

      handleSetCardDate({
        isApiDate: true,
        verifyDate: true,
        month: moment(monthTrated.slice().reverse()[currentMonthIndex].value).format('MMMM'),
        year: moment(yearTrated.slice().reverse()[currentYearIndex].value).format('YYYY'),
      });
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesFiltros'));
    } finally {
      handleSetIsLoadingFilters(false);
      render();
    }
  };

  const handleUpdateTab = (tab) => {
    state.procellFilters = [];
    state.tableFilters = {
      clientIds: [],
      stateIds: [],
      cityIds: [],
      unitIds: [],
    };
    footerRef.current.handleResetFilters();
    handleSetCardDate({
      verifyDate: false,
    });
    handleChangeTab(tab);
    handleGetDatesFilter(tab === 'trends' ? 'CONSUMPTION_FORECAST' : 'CONSUMPTION', {});
    render();
  };

  return (
    <Box
      width={energyCard?.isExpanded ? 1 : [1, 1, 1, 1, 25 / 51, 25 / 51]}
      mb={40}
      ml={0}
      mr={0}
      style={
        energyCard?.isExpanded
          ? { maxWidth: 'none', height: 'auto' }
          : { maxWidth: 'none', minHeight: 570 }
      }
    >
      <Card
        noPadding
        wrapperStyle={{
          minHeight: energyCard?.isExpanded ? 'auto' : 570,
        }}
      >
        <CardHeader>
          <CardHeaderContent>
            <h2>{t('energia')}</h2>
            {(cardControlTab !== 'insights' && state.chartMode === 'monthMode') && (
              <Button
                variant="borderblue"
                style={{
                  width: 'fit-content',
                  padding: '2px 15px',
                  fontSize: '12px',
                }}
                onClick={() => {
                  state.chartMode = 'yearMode';
                  render();

                  const datesParams = handleGetDatesParams(
                    `${cardDate.month} ${cardDate.year}`,
                    'MMMM YYYY',
                    state.chartMode,
                    state.isComparingChart,
                  );

                  historyChartRef.current.handleGetChartData({ ...datesParams });
                }}
              >
                {t('voltar')}
              </Button>
            )}
          </CardHeaderContent>
          <CardHeaderContent>
            <SelectOptionDropdown
              mode={cardControlTab === 'history' ? state.chartMode : 'monthMode'}
              open={state.isOpenFilterHeader}
              isLoading={isLoadingFilters || Object.values(tabIsLoading).some(Boolean)}
              handleClickOutside={() => {
                state.isOpenFilterHeader = false;
                render();
              }}
              yearOptions={state.filterDatesCard.yearOptions}
              monthOptions={state.filterDatesCard.monthOptions}
              yearSelected={cardDate.year}
              monthSelected={cardDate.month}
              handleChangeDate={(value) => {
                const newDate = moment(value, 'MMMM YYYY');

                handleSetCardDate({
                  isApiDate: false,
                  month: newDate.format('MMMM'),
                  year: newDate.format('YYYY'),
                });

                render();
              }}
            >
              <FilterHeader>
                <FilterHeaderButton
                  disabled={!checkCanClick(-1)}
                  onClick={() => !(isLoadingFilters || tabIsLoading[cardControlTab]) && handleDateChange(-1)}
                >
                  <ArrowLeftIcon />
                </FilterHeaderButton>
                <span
                  onClick={() => {
                    if (isLoadingFilters || tabIsLoading[cardControlTab]) return;
                    state.isOpenFilterHeader = !state.isOpenFilterHeader;
                    render();
                  }}
                >
                  {(state.chartMode === 'monthMode' || cardControlTab !== 'history') && capitalizeFirstLetter(cardDate.month)}
                  {' '}
                  {cardDate.year}
                </span>
                <FilterHeaderButton
                  disabled={!checkCanClick(1)}
                  onClick={() => !(isLoadingFilters || tabIsLoading[cardControlTab]) && handleDateChange(1)}
                >
                  <ArrowRightIcon />
                </FilterHeaderButton>
              </FilterHeader>
            </SelectOptionDropdown>
            <CardManager card={energyCard as ICard} />
          </CardHeaderContent>
        </CardHeader>
        <TabOptionCard selected={cardControlTab} arrayItems={state.cardTabs} loading={Object.values(tabIsLoading).some(Boolean)} />
        <CardContent>
          <div style={{ position: 'relative' }}>
            {cardContentFactory[cardControlTab]}
            {(isLoadingFilters || tabIsLoading[cardControlTab]) && (
              <LoaderOverlay>
                <Loader variant="primary" size="large" />
              </LoaderOverlay>
            )}
          </div>
          <EnergyCardFooter
            ref={footerRef}
            energyCardFilters={energyCardFilters}
            chartMode={state.chartMode}
            isComparing={state.isComparingChart}
            procellFilters={state.procellFilters}
            procellLetters={state.procellLetters}
            totalUnitsWithConstructedArea={state.totalUnitsWithConstructedArea}
            isExpanded={energyCard?.isExpanded}
            handleChangeTableFilters={(tableFilters) => {
              state.tableFilters = tableFilters;
              handleGetDatesFilter(cardControlTab === 'trends' ? 'CONSUMPTION_FORECAST' : 'CONSUMPTION', { insideFilters: { ...tableFilters } });
              render();
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
