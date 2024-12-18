import { SelectOptionDropdown } from '~/components/SelectOptionDropdown';
import { Checkbox } from '~/components';
import {
  forwardRef, useContext, useEffect, useImperativeHandle,
} from 'react';
import { getArrayMonthsOfYear } from '~/helpers/getArrayMonthsOfYear';
import { getArrayDaysOfMonth } from '~/helpers/getArrayDaysOfMonth';
import { t } from 'i18next';

import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { useCard } from '~/contexts/CardContext';
import { ApiResps } from '~/providers';
import moment from 'moment';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { capitalizeFirstLetter } from '~/helpers/capitalizeFirstLetter';
import { convertEnergy } from '~/helpers';
import { getUserProfile } from '~/helpers/userProfile';
import MenuContext from '~/contexts/menuContext';
import { useStateVar } from '~/helpers/useStateVar';
import { ArrowDownIconV2 } from '~/icons';
import {
  BarchartWrapper, CheckboxContent, CheckboxLine, SelectedDate,
} from './style';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

const daysOfWeek = {
  0: t('diasDaSemana.domingo'),
  1: t('diasDaSemana.segunda'),
  2: t('diasDaSemana.terca'),
  3: t('diasDaSemana.quarta'),
  4: t('diasDaSemana.quinta'),
  5: t('diasDaSemana.sexta'),
  6: t('diasDaSemana.sabado'),
};

export const INCOERENT_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuNTg1IDguODE5VjYuNTg1TTYuNTg1IDQuMzUxSDYuNTkwNTlNMTIuMTcgNi41ODVDMTIuMTcgOS42Njk1MSA5LjY2OTUxIDEyLjE3IDYuNTg1IDEyLjE3QzMuNTAwNDkgMTIuMTcgMSA5LjY2OTUxIDEgNi41ODVDMSAzLjUwMDQ5IDMuNTAwNDkgMSA2LjU4NSAxQzkuNjY5NTEgMSAxMi4xNyAzLjUwMDQ5IDEyLjE3IDYuNTg1WiIgc3Ryb2tlPSIjQTlBOUE5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
export const WARNING_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxNSAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuMjY1IDQuOTcwMjVWNy40MTE5M003LjI2NSA5Ljg1MzYxSDcuMjcxMU02LjQxOTc2IDEuODUyMDZMMS4zOTkxMyAxMC41MjQxQzEuMTIwNjUgMTEuMDA1MSAwLjk4MTQxNCAxMS4yNDU2IDEuMDAxOTkgMTEuNDQzQzEuMDE5OTQgMTEuNjE1MSAxLjExMDE0IDExLjc3MTYgMS4yNTAxNSAxMS44NzM0QzEuNDEwNjYgMTEuOTkwMSAxLjY4ODU2IDExLjk5MDEgMi4yNDQzNyAxMS45OTAxSDEyLjI4NTZDMTIuODQxNCAxMS45OTAxIDEzLjExOTMgMTEuOTkwMSAxMy4yNzk4IDExLjg3MzRDMTMuNDE5OSAxMS43NzE2IDEzLjUxMDEgMTEuNjE1MSAxMy41MjggMTEuNDQzQzEzLjU0ODYgMTEuMjQ1NiAxMy40MDkzIDExLjAwNTEgMTMuMTMwOSAxMC41MjQxTDguMTEwMjQgMS44NTIwNkM3LjgzMjc2IDEuMzcyNzggNy42OTQwMiAxLjEzMzE0IDcuNTEzMDEgMS4wNTI2NUM3LjM1NTEyIDAuOTgyNDQ4IDcuMTc0ODggMC45ODI0NDggNy4wMTY5OSAxLjA1MjY1QzYuODM1OTggMS4xMzMxNCA2LjY5NzI0IDEuMzcyNzggNi40MTk3NiAxLjg1MjA2WiIgc3Ryb2tlPSIjRjNCMTA3IiBzdHJva2Utd2lkdGg9IjEuMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';

interface ConsumptionChartProps {
  chartData: ApiResps['/energy/get-energy-analysis-hist'];
  cardYear: string;
  cardMonth: string;
  chartMode: string;
  filterDatesChart: FilterDatesChart;
  isLoading: boolean;
  handleClickBarChart: (name) => void;
  handleChangeComparingChart: (
    isComparing: boolean,
    yearSelected: string,
    monthSelected: string
  ) => void;
  consumptionChartStyle?: React.CSSProperties;
  chartWrapperStyle?: React.CSSProperties;
  canCompare?: boolean,
  ref?: React.Ref<{ handleUpdateChartDates: (date, format) => void }>;
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

export const ConsumptionChart: React.FC<ConsumptionChartProps> = forwardRef(({
  chartData,
  cardYear,
  cardMonth,
  chartMode,
  isLoading,
  filterDatesChart,
  handleClickBarChart,
  handleChangeComparingChart,
  chartWrapperStyle,
  consumptionChartStyle,
  canCompare = true,
}, ref) => {
  const isDesktop = window.matchMedia('(min-width: 426px)');
  const isMobile = !isDesktop.matches;
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;

  const { menuToogle } = useContext(MenuContext);
  const { cards } = useCard();
  const energyCard = cards.find((card) => card.title === 'Energia');

  const [state, render] = useStateVar({
    isComparingChart: false,
    isOpenComparingDropdown: false,
    monthSelected: cardMonth,
    yearSelected: moment().format('YYYY'),
    viewTratedData: isAdmin && profile.prefsObj.viewTratedData,
  });

  const handleGetYearIndex = (label) => filterDatesChart.yearOptions.findIndex((year) => moment.utc(year.value).isSame(moment(label, 'YYYY'), 'year'));

  const handleGetMonthIndex = (monthLabel, yearLabel) => filterDatesChart.monthOptions.findIndex((month) => moment
    .utc(month.value)
    .isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

  const handleMonthHasData = (monthLabel, yearLabel) => {
    const month = filterDatesChart.monthOptions.find((month) => moment
      .utc(month.value)
      .isSame(moment(`${monthLabel} ${yearLabel}`, 'MMMM YYYY'), 'month'));

    return month?.hasData;
  };

  const calculateDelta = (firstNumber, secondNumber) => {
    if (Number(secondNumber) === 0) {
      return Number(firstNumber);
    }
    const difference = firstNumber - secondNumber;

    return (difference / secondNumber) * 100;
  };

  const handleGetDataChart = (data, date, format) => data.find((item) => moment.utc(item.time).format(format) === moment(date, format).format(format));

  const checkProblemDataIsInvalid = (chartData, date, format) => {
    const chartValue = handleGetDataChart(chartData, date, format);
    const hasProblemData = chartValue?.dataIsInvalid;
    return chartValue && hasProblemData;
  };

  const checkProblemDataIsProcessed = (chartData, date, format) => {
    const chartValue = handleGetDataChart(chartData, date, format);
    const hasProblemData = chartValue?.dataIsProcessed;
    return chartValue && hasProblemData;
  };

  const createDeltaElement = (deltaValue, color) => {
    const signal = deltaValue < 0 ? '-' : '+';
    const rotation = signal === '+' ? '180deg' : '0';
    const formattedValue = formatNumberWithFractionDigits(Math.abs(deltaValue));

    return `
      <div style="display: flex; gap: 4px; align-items: center;">
        <svg style="transform: rotate(${rotation});" width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.36603 7.5C4.98113 8.16667 4.01887 8.16667 3.63397 7.5L0.602887 2.25C0.217987 1.58333 0.699112 0.749999 1.46891 0.749999L7.53109 0.75C8.30089 0.75 8.78202 1.58333 8.39711 2.25L5.36603 7.5Z" fill="${color}"/>
        </svg>
        <span style="font-weight: 600; font-size: 9px; font-family: Inter;">${signal}${formattedValue}%</span>
      </div>
    `;
  };

  const createIsProblemTooltipHTML = (tooltipTitle) => `
    <div style="display: flex; flex-direction: column; gap: 8px; color: #000000;">
      <span style="font-weight: 700; font-size: 12px; font-family: Inter;"><strong>${tooltipTitle}</strong></span>
      <div style="display: flex; gap: 8px;">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.085 9.519V7.085M7.085 4.651H7.09109M13.17 7.085C13.17 10.4457 10.4457 13.17 7.085 13.17C3.72435 13.17 1 10.4457 1 7.085C1 3.72435 3.72435 1 7.085 1C10.4457 1 13.17 3.72435 13.17 7.085Z" stroke="#565656" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-weight: 700; font-size: 12px; font-family: Inter; color: #565656; line-height: 14.52px;">${t('naoFoiPossivelColetar')}</span>
          <span style="font-weight: 400; font-size: 11px; font-family: Inter; color: #737373; line-height: 14.52px;">${t('paraMaisDetalhesHTML')}</span>
        </div>
      </div>
    </div>
  `;

  const createIsUnMonitoredTooltipHTML = (tooltipTitle) => `
    <div style="display: flex; flex-direction: column; gap: 8px; color: #000000;">
      <span style="font-weight: 700; font-size: 12px; font-family: Inter;"><strong>${tooltipTitle}</strong></span>
      <div style="display: flex; gap: 8px;">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.085 9.519V7.085M7.085 4.651H7.09109M13.17 7.085C13.17 10.4457 10.4457 13.17 7.085 13.17C3.72435 13.17 1 10.4457 1 7.085C1 3.72435 3.72435 1 7.085 1C10.4457 1 13.17 3.72435 13.17 7.085Z" stroke="#565656" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-weight: 700; font-size: 12px; font-family: Inter; color: #565656; line-height: 14.52px;">${t('semMonitoramento')}</span>
          <span style="font-weight: 400; font-size: 11px; font-family: Inter; color: #737373; line-height: 14.52px;">${t('paraMaisDetalhesHTML')}</span>
        </div>
      </div>
    </div>
  `;

  const createTratedDataElement = (Icon, title) => `
    <div style="display: flex; gap: 8px; align-items: center;">
      ${Icon}
      <span style="font-weight: 700; font-size: 12px; font-family: Inter; color: #565656;">${title}</span>
    </div>
  `;

  const createTooltipHTML = (
    tooltipTitle,
    consumptionValue,
    consumptionMeasurement,
    totalChargedData,
    totalUnits,
    color,
    deltaValue,
    flags,
  ) => {
    let deltaElement = '';

    if (Number(deltaValue)) {
      const deltaColor = deltaValue < 0 ? '#5AB365' : '#E00030';
      deltaElement = createDeltaElement(deltaValue, deltaColor);
    }

    const infoIcon = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.085 9.519V7.085M7.085 4.651H7.09109M13.17 7.085C13.17 10.4457 10.4457 13.17 7.085 13.17C3.72435 13.17 1 10.4457 1 7.085C1 3.72435 3.72435 1 7.085 1C10.4457 1 13.17 3.72435 13.17 7.085Z" stroke="#565656" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const warnIcon = `
      <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.265 4.97025V7.41193M7.265 9.85361H7.2711M6.41976 1.85206L1.39913 10.5241C1.12065 11.0051 0.981414 11.2456 1.00199 11.443C1.01994 11.6151 1.11014 11.7716 1.25015 11.8734C1.41066 11.9901 1.68856 11.9901 2.24437 11.9901H12.2856C12.8414 11.9901 13.1193 11.9901 13.2798 11.8734C13.4199 11.7716 13.5101 11.6151 13.528 11.443C13.5486 11.2456 13.4093 11.0051 13.1309 10.5241L8.11024 1.85206C7.83276 1.37278 7.69402 1.13314 7.51301 1.05265C7.35512 0.982448 7.17488 0.982448 7.01699 1.05265C6.83598 1.13314 6.69724 1.37278 6.41976 1.85206Z" stroke="#F3B107" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    let tratedData = '';

    if (state.viewTratedData) {
      if (flags.dataIsProcessed) {
        tratedData = isAdmin ? createTratedDataElement(infoIcon, t('dadoTratado')) : '';
      }

      if (flags.dataIsInvalid) {
        tratedData = isAdmin ? createTratedDataElement(warnIcon, t('dadoIncoerente')) : createTratedDataElement(infoIcon, t('dadoTratado'));
      }
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 8px; color: #000000;">
        <span style="font-weight: 700; font-size: 12px; font-family: Inter;"><strong>${tooltipTitle}</strong></span>
        <div style="display: flex; gap: 8px;">
          <div style="width: 15px; height: 15px; border-radius: 5px; background-color: ${color}; margin-top: 3px;"></div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; font-size: 10px; font-family: Inter;">Consumo:</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <span style="font-weight: 400; font-size: 11px; font-family: Inter;"><strong>${consumptionValue}</strong> ${consumptionMeasurement} | R$<strong>${totalChargedData}</strong></span>
              ${deltaElement}
            </div>
          </div>
        </div>
        <span style="font-weight: 400; font-size: 11px; margin-left: 22px;"><strong style="font-weight: 700; font-size: 10px; font-family: Inter;">${t('ucsContabilizadas')}: </strong>${totalUnits}</span>
        ${tratedData}
      </div>
    `;
  };

  const createTooltipElement = (value, title, color, delta?) => {
    const consumption = value?.consumption ?? 0;
    const totalCharged = value?.totalCharged ?? 0;
    const totalUnits = value?.totalUnits ?? 0;

    const [consumptionValue, consumptionMeasurement] = convertEnergy(consumption);

    const tooltipElement = createTooltipHTML(
      title,
      formatNumberWithFractionDigits(consumptionValue),
      `${consumptionMeasurement}h`,
      formatNumberWithFractionDigits(totalCharged),
      totalUnits,
      color,
      delta,
      {
        dataIsInvalid: value?.dataIsInvalid,
        dataIsProcessed: value?.dataIsProcessed,
      },
    );

    if (!value || value?.consumption === null) {
      return createIsUnMonitoredTooltipHTML(title);
    }

    if (!isAdmin && value?.dataIsInvalid) {
      return createIsProblemTooltipHTML(title);
    }

    return tooltipElement;
  };

  const tooltipFactory = {
    isComparing: {
      yearMode: (values) => {
        const tooltipDate = moment(values[0].name, 'MMM YYYY');
        const monthName = tooltipDate.format('MMMM');
        const year = tooltipDate.format('YYYY');
        let compareYear = '';
        let delta = 0;

        if (year === cardYear) {
          compareYear = state.yearSelected;
        } else if (Number(cardYear) === moment().year()) {
          compareYear = `${Number(state.yearSelected) - 1}`;
        }

        const chartValueCompare = handleGetDataChart(
          chartData.compare,
          `${monthName} ${compareYear}`,
          'MMMM YYYY',
        );

        const compareElement = createTooltipElement(chartValueCompare, `${capitalizeFirstLetter(monthName)} ${compareYear}`, '#ACACAC');

        const chartValueCurrent = handleGetDataChart(
          chartData.current,
          `${monthName} ${year}`,
          'MMMM YYYY',
        );

        if (chartValueCurrent?.consumption !== null && chartValueCompare?.consumption !== null) {
          delta = Number(calculateDelta(chartValueCurrent?.consumption || 0, chartValueCompare?.consumption || 0).toFixed());
        }

        const currentElement = createTooltipElement(chartValueCurrent, `${capitalizeFirstLetter(monthName)} ${year}`, '#92CC9A', delta);

        const divElement = '<div style="width: 100%; height: 1px; background-color: #DDDDDD;"></div>';

        return `
          <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">
            ${compareElement}
            ${divElement}
            ${currentElement}
          </div>
        `;
      },
      monthMode: (values) => {
        const day = values[0].name;
        const monthName = moment(cardMonth, 'MMMM').format('MM');
        let delta = 0;

        const compareMonthName = moment(state.monthSelected, 'MMMM').format('MM');

        const chartValueCompare = handleGetDataChart(
          chartData.compare,
          `${day}/${compareMonthName}/${state.yearSelected}`,
          'DD/MM/YYYY',
        );

        const compareElement = createTooltipElement(chartValueCompare, `${day}/${compareMonthName}/${state.yearSelected}`, '#ACACAC');

        const chartValueCurrent = handleGetDataChart(
          chartData.current,
          `${day}/${monthName}/${cardYear}`,
          'DD/MM/YYYY',
        );

        if (chartValueCurrent?.consumption !== null && chartValueCompare?.consumption !== null) {
          delta = Number(calculateDelta(chartValueCurrent?.consumption || 0, chartValueCompare?.consumption || 0).toFixed());
        }

        const currentElement = createTooltipElement(chartValueCurrent, `${day}/${monthName}/${cardYear}`, '#92CC9A', delta);

        const divElement = '<div style="width: 100%; height: 1px; background-color: #DDDDDD;"></div>';

        return `
          <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">
            ${compareElement}
            ${divElement}
            ${currentElement}
          </div>
        `;
      },
    },
    isNotComparing: {
      yearMode: (values) => {
        const tooltipDate = moment(values[0].name, 'MMM YYYY');
        const monthName = tooltipDate.format('MMMM');
        const year = tooltipDate.format('YYYY');

        const chartValueCurrent = handleGetDataChart(
          chartData.current,
          `${monthName} ${year}`,
          'MMMM YYYY',
        );

        const element = createTooltipElement(chartValueCurrent, `${capitalizeFirstLetter(monthName)} ${year}`, '#92CC9A');

        return `
          <div style="display: flex; flex-direction: column; padding: 12px;">
            ${element}
          </div>
        `;
      },
      monthMode: (values) => {
        const day = values[0].name;
        const monthName = moment(cardMonth, 'MMMM').format('MM');

        const chartValueCurrent = handleGetDataChart(
          chartData.current,
          `${day}/${monthName}/${cardYear}`,
          'DD/MM/YYYY',
        );

        const element = createTooltipElement(chartValueCurrent, `${day}/${monthName}/${cardYear}`, '#92CC9A');

        return `
          <div style="display: flex; flex-direction: column; padding: 12px;">
            ${element}
          </div>`;
      },
    },
  };

  const handleGetXAxisYearMode = () => {
    const monthsOfYear = getArrayMonthsOfYear();

    const monthsOfYearFormatted = monthsOfYear.map(
      (prevYear) => `${prevYear} ${cardYear}`,
    );

    if (Number(cardYear) === moment().year() && !state.isComparingChart) {
      const currentMonth = moment().month();

      const prevYearMonths = monthsOfYear.slice(-(12 - currentMonth));
      const currentYearMonths = monthsOfYear.slice(0, currentMonth + 1);

      const prevYearMonthsFormatted = prevYearMonths.map(
        (prevYear) => `${prevYear} ${isMobile ? (Number(cardYear) - 1).toString().slice(-2) : Number(cardYear) - 1}`,
      );
      const currentYearMonthsFormatted = currentYearMonths.map(
        (prevYear) => `${prevYear} ${isMobile ? (Number(cardYear)).toString().slice(-2) : Number(cardYear)}`,
      );

      return [...prevYearMonthsFormatted, ...currentYearMonthsFormatted];
    }

    if (state.isComparingChart) {
      return monthsOfYearFormatted;
    }

    return [
      ...monthsOfYearFormatted,
      `${monthsOfYear[0]} ${Number(cardYear) + 1}`,
    ];
  };

  const xAxisFactory = {
    yearMode: handleGetXAxisYearMode(),
    monthMode: getArrayDaysOfMonth(
      Number(moment().month(cardMonth).format('M')),
      Number(cardYear),
    ),
  };

  const xAxisFormatterFactory = {
    yearMode: (value) => {
      const [month, year] = value.split(' ');
      const date = `${month} ${year}`;
      const dateChart = `${month} ${state.yearSelected}`;
      const hasProblemDataIsProcessed = checkProblemDataIsProcessed(chartData.current, date, 'MMM YYYY') || checkProblemDataIsProcessed(chartData.compare, dateChart, 'MMMM YYYY');

      const hasProblemDataIsInvalid = checkProblemDataIsInvalid(chartData.current, date, 'MMM YYYY') || checkProblemDataIsInvalid(chartData.compare, dateChart, 'MMMM YYYY');

      let problemDataIndicator = '';

      if (state.viewTratedData) {
        if (hasProblemDataIsProcessed) {
          problemDataIndicator = isAdmin ? '\n{incoerentIcon|    }' : '';
        }

        if (hasProblemDataIsInvalid) {
          problemDataIndicator = isAdmin ? '\n{warnIcon|    }' : '\n{incoerentIcon|    }';
        }
      }

      return state.isComparingChart ? `${month}${problemDataIndicator}` : `${month}\n{bold|${year}}${problemDataIndicator}`;
    },
    monthMode: (value) => {
      const date = `${cardMonth} ${cardYear} ${value}`;
      const dateChart = `${state.monthSelected} ${state.yearSelected} ${value}`;
      const monthDay = moment(date, 'MMMM YYYY DD').format('DD');
      const weekDayIndex = moment(date, 'MMMM YYYY DD').day();

      let result = `${monthDay}\n`;

      let problemDataIndicator = '';

      if (weekDayIndex === 0 && !state.isComparingChart) {
        result = `{bold|${result}${daysOfWeek[weekDayIndex][0]}}`;
      } else if (!state.isComparingChart) {
        result += daysOfWeek[weekDayIndex][0];
      }

      const hasProblemDataIsProcessed = checkProblemDataIsProcessed(chartData.current, date, 'MMMM YYYY DD') || checkProblemDataIsProcessed(chartData.compare, dateChart, 'MMMM YYYY DD');

      const hasProblemDataIsInvalid = checkProblemDataIsInvalid(chartData.current, date, 'MMMM YYYY DD') || checkProblemDataIsInvalid(chartData.compare, dateChart, 'MMMM YYYY DD');

      if (state.viewTratedData) {
        if (hasProblemDataIsProcessed) {
          problemDataIndicator = isAdmin ? '\n{incoerentIcon|    }' : '';
        }

        if (hasProblemDataIsInvalid) {
          problemDataIndicator = isAdmin ? '\n{warnIcon|    }' : '\n{incoerentIcon|    }';
        }
      }

      return result + problemDataIndicator;
    },
  };

  const yAxisFormatter = (value) => {
    const [valueDemandConverted, valueDemandUnitMeasurement] = convertEnergy(value);

    return `${formatNumberWithFractionDigits(
      valueDemandConverted,
    )} ${valueDemandUnitMeasurement}h`;
  };

  const barWidthFactory = {
    isComparing: {
      yearMode: {
        isExpanded: '15px',
        isNotExpanded: '7px',
      },
      monthMode: {
        isExpanded: '9',
        isNotExpanded: '4px',
      },
    },
    isNotComparing: {
      yearMode: {
        isExpanded: '30px',
        isNotExpanded: '18px',
      },
      monthMode: {
        isExpanded: '15px',
        isNotExpanded: '7px',
      },
    },
  };

  const formatSeriesChart = (data, isAdmin) => {
    if (isAdmin) {
      if (data?.dataIsInvalid) {
        return {
          value: data.consumption,
          itemStyle: {
            ...(data.consumption < 0 && { borderRadius: [0, 0, 5, 5] }),
          },
        };
      }

      return data?.consumption;
    }

    if (data?.dataIsInvalid) {
      return 0;
    }

    return data?.consumption;
  };

  const seriesFactory = (chartData) => {
    const currentFormattedData = chartData.current.map((data) => formatSeriesChart(data, isAdmin));
    const compareFormattedData = chartData.compare.map((data) => formatSeriesChart(data, isAdmin));

    return {
      isComparing: [
        {
          name: 'Consumo Compare',
          type: 'bar',
          barWidth:
            barWidthFactory.isComparing[chartMode][
              energyCard?.isExpanded ? 'isExpanded' : 'isNotExpanded'
            ],
          color: '#ACACAC',
          data: compareFormattedData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            padding: [0, 20, 0, 0],
          },
        },
        {
          name: 'Consumo',
          type: 'bar',
          barWidth:
            barWidthFactory.isComparing[chartMode][
              energyCard?.isExpanded ? 'isExpanded' : 'isNotExpanded'
            ],
          color: '#92CC9A',
          data: currentFormattedData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            padding: [0, 20, 0, 0],
          },
        },
      ],
      isNotComparing: [
        {
          name: 'Consumo',
          type: 'bar',
          barWidth: isMobile ? '12px' : barWidthFactory.isNotComparing[chartMode][
            energyCard?.isExpanded ? 'isExpanded' : 'isNotExpanded'
          ],
          color: '#92CC9A',
          data: currentFormattedData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            padding: [0, 20, 0, 0],
          },
        },
      ],
    };
  };

  const handleRenderBarchart = (chartData) => {
    const barchartDom = document.getElementById('barchart-demanda');

    if (!barchartDom) return;

    echarts.dispose(barchartDom);
    const barChart = echarts.init(barchartDom);

    window.addEventListener('resize', () => {
      barChart.resize();
    });

    barChart.on('click', 'series', (options) => {
      const barClicked = moment(options.name, 'MMM YYYY');

      state.monthSelected = barClicked.format('MMMM');
      handleClickBarChart(options);
    });

    const barchartOptions = {
      tooltip: {
        trigger: 'axis',
        formatter:
          tooltipFactory[state.isComparingChart ? 'isComparing' : 'isNotComparing'][
            chartMode
          ],
        axisPointer: {
          type: 'none',
        },
        shadowStyle: {
          shadowBlur: 2,
          shadowOffsetY: 0,
          shadowOffsetX: 1,
        },
        lineStyle: {
          width: '40px',
        },
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '2%',
        top: '14px',
        width: '92%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisFactory[chartMode],
          boundaryGap: false,
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
          axisLabel: {
            show: true,
            align: 'center',
            margin: 8,
            showMaxLabel: true,
            interval: 0,
            color: '#000',
            fontFamily: 'Inter',
            fontSize: '10',
            lineHeight: 12,
            rich: {
              bold: {
                fontWeight: 'bold',
                color: '#000',
                fontFamily: 'Inter',
                fontSize: '10',
              },
              warnIcon: {
                backgroundColor: {
                  image: WARNING_ICON,
                },
              },
              incoerentIcon: {
                backgroundColor: {
                  image: INCOERENT_ICON,
                },
              },
            },
            formatter: xAxisFormatterFactory[chartMode],
          },
          axisLine: { show: false },
          axisTick: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          position: 'left',
          splitNumber: 5,
          axisLabel: {
            align: 'right',
            fontSize: 9,
            color: '#000',
            fontFamily: 'Inter',
            formatter: yAxisFormatter,
          },
          offset: 18,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
      ],
      series:
        seriesFactory(chartData)[
          state.isComparingChart ? 'isComparing' : 'isNotComparing'
        ],
    };

    barchartOptions && barChart.setOption(barchartOptions);

    window.removeEventListener('resize', () => {
      barChart.resize();
    });
  };

  const handleUpdateChartDates = (date, format) => {
    const newDate = moment(date, format);

    state.yearSelected = newDate.format('YYYY');
    state.monthSelected = newDate.format('MMMM');
    render();
  };

  useImperativeHandle(ref, () => ({
    handleUpdateChartDates,
  }), []);

  useEffect(() => {
    chartData.current && chartData.compare && handleRenderBarchart(chartData);
  }, [chartData, chartMode, state.isComparingChart, energyCard?.isExpanded, menuToogle, state.viewTratedData]);

  function onClickComparePeriod() {
    state.isComparingChart = !state.isComparingChart;

    state.yearSelected = cardYear;
    state.monthSelected = cardMonth;

    const currentYearIndex = handleGetYearIndex(state.yearSelected);
    let breakLoop = false;

    filterDatesChart.yearOptions
      .slice()
      .reverse()
      .forEach((year, index) => {
        if (filterDatesChart.yearOptions.length - (currentYearIndex + 1) < index && year.hasData && !breakLoop) {
          state.yearSelected = year.label;
          breakLoop = true;
        }
      });

    if (!handleMonthHasData(state.monthSelected, state.yearSelected)) {
      const currentMonthIndex = handleGetMonthIndex(
        state.monthSelected,
        state.yearSelected,
      );

      let breakLoopMonth = false;

      filterDatesChart.monthOptions
        .slice()
        .reverse()
        .forEach((month, index) => {
          if (filterDatesChart.monthOptions.length - (currentMonthIndex + 1) < index && month.hasData && !breakLoopMonth) {
            state.monthSelected = month.label;
            breakLoopMonth = true;
          }
        });

      filterDatesChart.monthOptions.forEach((month, index) => {
        if (currentMonthIndex < index && month.hasData && !breakLoopMonth) {
          state.monthSelected = month.label;
          breakLoopMonth = true;
        }
      });
    }

    handleChangeComparingChart(
      state.isComparingChart,
      state.yearSelected,
      state.monthSelected,
    );
    render();
  }

  return (
    <div style={{ padding: '5px 8px 18px', ...consumptionChartStyle }}>
      <div style={{ display: 'flex', justifyContent: isAdmin ? 'space-between' : 'flex-end', margin: '0 2%' }}>
        {canCompare && (
        <SelectOptionDropdown
          mode={chartMode}
          open={state.isOpenComparingDropdown}
          handleClickOutside={() => {
            state.isOpenComparingDropdown = false;
            render();
          }}
          yearOptions={filterDatesChart.yearOptions}
          monthOptions={filterDatesChart.monthOptions}
          yearSelected={state.yearSelected}
          monthSelected={state.monthSelected}
          isLoading={isLoading}
          handleChangeDate={(value) => {
            const newDate = moment(value, 'MMMM YYYY');

            state.yearSelected = newDate.format('YYYY');
            state.monthSelected = newDate.format('MMMM');
            render();
            handleChangeComparingChart(state.isComparingChart, newDate.format('YYYY'), newDate.format('MMMM'));
          }}
        >
          <CheckboxLine>
            <Checkbox
              checked={state.isComparingChart}
              onClick={() => { onClickComparePeriod(); }}
              size={15}
              color="primary"
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{t('compararPeriodo')}</span>
              {state.isComparingChart && (
              <SelectedDate
                onClick={() => {
                  if (!isLoading) {
                    state.isOpenComparingDropdown = !state.isOpenComparingDropdown;
                    render();
                  }
                }}
              >
                <span>
                  {chartMode === 'monthMode'
                      && capitalizeFirstLetter(state.monthSelected)}
                  {' '}
                  {state.yearSelected}
                </span>
                <ArrowDownIconV2 color="#000000" width="9" heigth="8" />
              </SelectedDate>
              )}
            </div>
          </CheckboxLine>
        </SelectOptionDropdown>
        )}
      </div>
      <BarchartWrapper style={chartWrapperStyle}>
        <div id="barchart-demanda" style={{ width: '100%', height: '100%' }} />
      </BarchartWrapper>
    </div>
  );
});
