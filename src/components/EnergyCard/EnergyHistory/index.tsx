import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ApiResps, apiCall } from '~/providers';
import { handleGetDatesParams } from '~/helpers/getRangeParamsChart';
import { useStateVar } from '~/helpers/useStateVar';
import moment from 'moment';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import {
  forwardRef, useEffect, useImperativeHandle, useRef,
} from 'react';
import { useEnergyCard } from '../EnergyCardContext';
import { ConsumptionChart } from '../ConsumptionChart';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

export const INCOERENT_ICON = "data:image/svg+xml;charset=utf8,%3Csvg%20width%3D'13'%20height%3D'13'%20viewBox%3D'0%200%2013%2013'%20fill%3D'none'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M6.585%208.819V6.585M6.585%204.351H6.59059M12.17%206.585C12.17%209.66951%209.66951%2012.17%206.585%2012.17C3.50049%2012.17%201%209.66951%201%206.585C1%203.50049%203.50049%201%206.585%201C9.66951%201%2012.17%203.50049%2012.17%206.585Z'%20stroke%3D'%23A9A9A9'%20stroke-width%3D'1.5'%20stroke-linecap%3D'round'%20stroke-linejoin%3D'round'%2F%3E%3C%2Fsvg%3E";
export const WARNING_ICON = "data:image/svg+xml;charset=utf8,%3Csvg%20width%3D'15'%20height%3D'13'%20viewBox%3D'0%200%2015%2013'%20fill%3D'none'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M7.265%204.97025V7.41193M7.265%209.85361H7.2711M6.41976%201.85206L1.39913%2010.5241C1.12065%2011.0051%200.981414%2011.2456%201.00199%2011.443C1.01994%2011.6151%201.11014%2011.7716%201.25015%2011.8734C1.41066%2011.9901%201.68856%2011.9901%202.24437%2011.9901H12.2856C12.8414%2011.9901%2013.1193%2011.9901%2013.2798%2011.8734C13.4199%2011.7716%2013.5101%2011.6151%2013.528%2011.443C13.5486%2011.2456%2013.4093%2011.0051%2013.1309%2010.5241L8.11024%201.85206C7.83276%201.37278%207.69402%201.13314%207.51301%201.05265C7.35512%200.982448%207.17488%200.982448%207.01699%201.05265C6.83598%201.13314%206.69724%201.37278%206.41976%201.85206Z'%20stroke%3D'%23F3B107'%20stroke-width%3D'1.3'%20stroke-linecap%3D'round'%20stroke-linejoin%3D'round'%2F%3E%3C%2Fsvg%3E";

interface EnergyHistoryProps {
  chartMode: string;
  filterDatesChart: FilterDatesChart;
  isLoading: boolean;
  handleClickBarChart: (name) => void;
  energyCardFilters: any;
  insideFilters: any;
  handleIsComparing: (value) => void;
  handleResetDates: () => void;
  ref: React.Ref<{ handleGetChartData: (options) => void }>;
}

interface FilterDatesChart {
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

export const EnergyHistory: React.FC<EnergyHistoryProps> = forwardRef(({
  chartMode,
  isLoading,
  filterDatesChart,
  handleClickBarChart,
  energyCardFilters,
  insideFilters,
  handleIsComparing,
  handleResetDates,
}, ref) => {
  const { cardDate, handleSetTabIsLoading } = useEnergyCard();

  const [state, render] = useStateVar({
    historyChartData: {} as ApiResps['/energy/get-energy-analysis-hist'],
    isLoadingChart: true,
    isOpenFilterHeader: false,
    isComparingChart: false,
    monthChartSelected: cardDate.month,
    yearChartSelected: cardDate.year,
  });

  const chartRef = useRef({} as { handleUpdateChartDates: (date, format) => void});

  const handleGetMonthIndex = (monthLabel, yearLabel) => filterDatesChart.monthOptions.findIndex((month) => moment
    .utc(month.value)
    .isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

  const handleMonthHasData = (monthLabel, yearLabel) => {
    const month = filterDatesChart.monthOptions.find((month) => moment
      .utc(month.value)
      .isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

    return month?.hasData;
  };

  const handleChangeComparingChart = (
    isComparing,
    yearSelectedComparing,
    monthSelectedComparing,
  ) => {
    state.monthChartSelected = monthSelectedComparing;
    state.yearChartSelected = yearSelectedComparing;
    state.isComparingChart = isComparing;

    handleIsComparing(state.isComparingChart);
    handleGetChartData({});

    render();
  };

  const handleClickBarChartHistory = (options) => {
    const barClicked = moment(options.name, 'MMM YYYY');

    const monthClicked = barClicked.format('MMMM');

    if (!handleMonthHasData(monthClicked, state.yearChartSelected)) {
      const currentMonthIndex = handleGetMonthIndex(monthClicked, state.yearChartSelected);

      let breakLoopMonth = false;

      filterDatesChart.monthOptions
        .slice()
        .reverse()
        .forEach((month, index) => {
          if (filterDatesChart.monthOptions.length - (currentMonthIndex + 1) < index && month.hasData && !breakLoopMonth) {
            state.monthChartSelected = month.label;
            breakLoopMonth = true;
          }
        });

      filterDatesChart.monthOptions.forEach((month, index) => {
        if (currentMonthIndex < index && month.hasData && !breakLoopMonth) {
          state.monthChartSelected = month.label;
          breakLoopMonth = true;
        }
      });
    } else {
      state.monthChartSelected = monthClicked;
    }

    chartRef.current.handleUpdateChartDates(`${state.monthChartSelected} ${state.yearChartSelected}`, 'MMMM YYYY');

    render();

    handleClickBarChart(options);
  };

  const handleGetChartData = async (energyHistParams) => {
    try {
      handleSetTabIsLoading(true, 'history');

      const chartModeParam = chartMode === 'monthMode' ? 'month' : 'year';

      const datesParams = handleGetDatesParams(
        `${cardDate.month} ${cardDate.year}`,
        'MMMM YYYY',
        chartMode,
        state.isComparingChart,
      );

      const { startDate: startDateToCompare, endDate: endDateToCompare } = handleGetDatesParams(
        `${state.monthChartSelected} ${state.yearChartSelected}`,
        'MMMM YYYY',
        chartMode,
        state.isComparingChart,
        cardDate.year,
      );

      const data = await apiCall('/energy/get-energy-analysis-hist', {
        ...datesParams,
        ...(state.isComparingChart && { startDateToCompare, endDateToCompare }),
        filterType: chartModeParam,
        ...energyHistParams,
        ...energyCardFilters,
        insideFilters: { ...insideFilters },
      });
      state.historyChartData = data;
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesGrafico'));
    } finally {
      handleSetTabIsLoading(false, 'history');
      render();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      handleGetChartData,
    }),
    [],
  );

  useEffect(() => {
    if (energyCardFilters.startObject || !cardDate.verifyDate) return;
    if (!cardDate.isApiDate) {
      handleResetDates();
    } else {
      handleGetChartData({});
    }
  }, [cardDate]);

  return (
    <ConsumptionChart
      ref={chartRef}
      chartData={state.historyChartData}
      chartMode={chartMode}
      cardYear={cardDate.year}
      cardMonth={cardDate.month}
      filterDatesChart={filterDatesChart}
      isLoading={isLoading}
      handleClickBarChart={handleClickBarChartHistory}
      handleChangeComparingChart={handleChangeComparingChart}
    />
  );
});
