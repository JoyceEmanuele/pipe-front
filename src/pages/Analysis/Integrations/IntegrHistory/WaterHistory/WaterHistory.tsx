/* eslint-disable import/no-duplicates */
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import moment, { isMoment } from 'moment';
import DatePicker from 'react-datepicker';
import i18n from '~/i18n';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { Flex, Box } from 'reflexbox';
import {
  Select, Card, Loader, Checkbox,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall, ApiResps } from '~/providers';

import {
  ContentDate,
  VarContainer,
  VarName,
  VarUnit,
  VarValue,
} from '../styles';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import ReactTooltip from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '~/helpers/userProfile';
import { GenerateGraphWater } from '~/components/WaterCard/GraphCardWater';
import {
  ArrowDownIcon,
  ArrowLeftIcon, ArrowRightIcon, InfoIcon, InfoLinkIcon,
} from '~/icons';
import {
  ButtonReturnPeriod,
  ContainerArrowLeft,
  ContainerArrowRight,
  ContainerCaption, ContainerIcon, ContainerUsageDiff, HoverConsumptionInfo, HoverMeterInfo, LabelData,
} from './styles';
import { QuickSelection } from '~/components/QuickSelection';
import { TransparentLink } from '~/components/EnvGroupAnalysis/styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

interface IGraphData {
  devId: string;
  name: string;
  usage: string;
  date: string;
  estimatedUsage?: boolean;
  dailyReadings?: {
    devId?: string;
    name: string;
    usage: string;
    date: string;
    dayUsage: number | string;
    readTime: string;
    estimatedUsage?: boolean;
  }[];
}

export function WaterHistory(props: {
  device_code: string;
  status: string | undefined;
  installationDate: string | undefined | null;
  unitId?: number|null;
}): JSX.Element {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { device_code, status, unitId } = props;
  const [shouldNotDisplayLiters, setShouldNotDisplayLiters] = useState(
    profile.prefsObj?.water === 'cubic',
  );
  const [state, render, setState] = useStateVar({
    loading: true,
    loadingNewData: true,
    focused: false,
    focusedInput: null,
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD'),
    lastStartDate: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
    lastEndDate: moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
    graphData: [] as IGraphData[],
    graphDataForecast: [] as IGraphData[],
    cubicMetersGraphData: [] as IGraphData[],
    cubicMetersGraphDataForecast: [] as IGraphData[],
    graphLegend: [] as string[],
    showForecast: true,
    period: t('mes'),
    last12Months: false as boolean,
    periodIsMonthOrFlexible: true,
    maxUsage: 0,
    lastReadingDate: '',
    daily_average: '0',
    period_usage: '0',
    period_usage_last: null as string | null,
    period_usage_up: false as boolean,
    predicted: '0',
    predictedLastMonth: undefined as string | undefined,
    installationDate: props.installationDate as string | undefined | null,
    devInfo: null as null | ApiResps['/get-integration-info']['info'],
    forecastUsage: null as null | ApiResps['/dma/get-forecast-usage'],
    isCurrentMonth: false as boolean,
    consumptionByDayOfWeek: [
      { label: t('diasDaSemana.domingo'), days: 0, consumption: 0 },
      { label: t('diasDaSemana.segunda'), days: 0, consumption: 0 },
      { label: t('diasDaSemana.terca'), days: 0, consumption: 0 },
      { label: t('diasDaSemana.quarta'), days: 0, consumption: 0 },
      { label: t('diasDaSemana.quinta'), days: 0, consumption: 0 },
      { label: t('diasDaSemana.sexta'), days: 0, consumption: 0 },
      { label: t('diasDaSemana.sabado'), days: 0, consumption: 0 },
    ] as any[],
    yearGraphic: false as boolean,
    arrayData: [] as ApiResps['/dma/get-consumption-history']['history'],
    arrowDisabled: true as boolean,
    periodHist: '' as string,
    startDateHist: moment().startOf('month').format('YYYY-MM-DD'),
    endDateHist: moment().endOf('month').format('YYYY-MM-DD'),
    lastStartDateHist: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
    lastEndDateHist: moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
  });

  useEffect(() => {
    const weekdaysMin: string[] = t('weekdaysMin', { returnObjects: true });
    const language = i18n.language === 'pt' ? 'pt-br' : i18n.language;
    moment.updateLocale(language, {
      weekdaysMin,
    });
  }, [i18n.language, t]);

  const maxValue = (graphData) => {
    let numberArr = [];
    if (state.period === t('dia')) {
      const currentDay = moment(state.startDate).format('DD/MM/YYYY');

      const currentDayData = graphData.filter((e) => e.date === currentDay)[0];

      numberArr = currentDayData?.dailyReadings?.map(({ dayUsage }) => Number(dayUsage));
    } else {
      numberArr = graphData.map(({ usage }) => Number(usage));
    }

    const maxNumber = !numberArr ? 0 : Math.max(...numberArr);

    return maxNumber;
  };

  const setForecastStates = () => {
    const currDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const dataDate = new Date(state.endDate);
    state.isCurrentMonth = currDate.getMonth() === dataDate.getMonth()
      && dataDate.getDate() >= currDate.getDate();
    state.showForecast = true;
  };

  const getDailyData = async () => {
    let responseUsage;
    if (device_code.startsWith('DMA')) {
      if (state.devInfo?.hydrometerModel) {
        responseUsage = await apiCall('/dma/get-consumption-history', {
          DEVICE_CODE: device_code,
          START_DATE: state.startDate,
          END_DATE: state.endDate,
          LAST_START_DATE: state.lastStartDate,
          LAST_END_DATE: state.lastEndDate,
          YEAR_GRAPHIC: state.yearGraphic,
        });
        setState({ arrayData: responseUsage.history });
      } else if (state.devInfo && !state.devInfo.hydrometerModel) {
        toast.error(t('erroHistoricoHidrometro'));
        setState({ loadingNewData: false });
        return;
      } else {
        setState({ loadingNewData: false });
        return;
      }
    } else {
      responseUsage = await apiCall('/laager/get-consumption-history', {
        LAAGER_CODE: device_code,
        START_DATE: state.startDate,
        END_DATE: state.endDate,
        LAST_START_DATE: state.lastStartDate,
        LAST_END_DATE: state.lastEndDate,
        YEAR_GRAPHIC: state.yearGraphic,
      });

      setState({ arrayData: responseUsage.history });
    }

    const name = format(parseISO(state.startDate), 'dd-eeeee', {
      locale: pt,
    }).toUpperCase();

    const date = format(parseISO(state.startDate), 'dd/MM/yyyy', {
      locale: pt,
    });

    const usage = responseUsage.period_usage;

    const dailyReading = responseUsage?.history?.length > 0
      ? responseUsage.history.map((readings) => ({
        name,
        usage,
        date,
        dayUsage: readings.usage,
        readTime: moment(readings.information_date).format('HH:mm'),
        estimatedUsage: readings.estimatedUsage,
        devId: device_code,
      }))
      : [];

    const graphDataDaily = {
      name,
      usage,
      date,
      dailyReadings: dailyReading,
      devId: device_code,
    };

    const maxUsage = maxValue([graphDataDaily]);
    setState({
      graphData: [graphDataDaily],
      maxUsage,
      daily_average: `${responseUsage.daily_average || '0'}`,
      period_usage: `${responseUsage.period_usage || '0'}`,
      period_usage_last: handlePeriodUsageDiff(responseUsage.period_usage, responseUsage.period_usage_last),
    });
  };

  const getResponseUsage = async () => {
    let responseUsage;
    if (device_code.startsWith('DMA')) {
      if (state.devInfo?.hydrometerModel) {
        responseUsage = await apiCall('/dma/get-consumption-history', {
          DEVICE_CODE: device_code,
          START_DATE: state.startDate,
          END_DATE: state.endDate,
          LAST_START_DATE: state.lastStartDate,
          LAST_END_DATE: state.lastEndDate,
          YEAR_GRAPHIC: state.yearGraphic,
        });
        setState({ arrayData: responseUsage.history });
      } else if (state.devInfo && !state.devInfo.hydrometerModel) {
        toast.error(t('erroHistoricoHidrometro'));
        setState({ loadingNewData: false });
        return null;
      } else {
        setState({ loadingNewData: false });
        return null;
      }
    } else {
      responseUsage = await apiCall('/laager/get-consumption-history', {
        LAAGER_CODE: device_code,
        START_DATE: state.startDate,
        END_DATE: state.endDate,
        LAST_START_DATE: state.lastStartDate,
        LAST_END_DATE: state.lastEndDate,
        YEAR_GRAPHIC: state.yearGraphic,
      });
    }
    return responseUsage;
  };

  const getForecast = async () => {
    try {
      if (device_code.startsWith('DMA')) {
        const forecast = await apiCall('/dma/get-forecast-usage', {
          DEVICE_CODE: device_code,
        });
        state.forecastUsage = forecast;
      } else {
        const forecast = await apiCall('/laager/get-forecast-usage', {
          LAAGER_CODE: device_code,
        });
        state.forecastUsage = forecast;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getValueOrZero = (value: any) => `${value || '0'}`;

  const getGraphDataAndForecast = async () => {
    const responseUsage = await getResponseUsage();
    if (responseUsage === null) return null;
    const arrayData = responseUsage.history;

    const graphData = responseUsage.history.map((h) => ({
      name: format(parseISO(h.information_date), 'dd-eeeee', {
        locale: pt,
      }).toUpperCase(),
      usage: `${h.usage}`,
      date: format(parseISO(h.information_date), 'dd/MM/yyyy', {
        locale: pt,
      }),
      devId: h.device_code,
      estimatedUsage: h.estimatedUsage,
    }));

    setState({
      arrayData,
      graphData,
      daily_average: getValueOrZero(responseUsage.daily_average),
      period_usage: getValueOrZero(responseUsage.period_usage),
      period_usage_last: handlePeriodUsageDiff(responseUsage.period_usage, responseUsage.period_usage_last),
    });

    let maxUsageForecast = 0;
    let predictedConsumption = 0;
    if (state.periodIsMonthOrFlexible && state.isCurrentMonth) {
      await getForecast();

      if (state.forecastUsage) {
        let graphDataForecast = JSON.parse(JSON.stringify(arrayData));
        graphDataForecast = graphDataForecast.map((e) => {
          const currDate = new Date();
          currDate.setHours(0, 0, 0, 0);
          const dataDate = new Date(e.information_date);
          dataDate.setHours(0, 0, 0, 0);
          if (dataDate > currDate && state.forecastUsage) {
            e.usage = state.forecastUsage[e.day.dayWeekName];
            e.isEstimated = true;
          } else {
            e.isEstimated = false;
          }
          return e;
        });

        setState({ arrayData: graphDataForecast });

        state.arrayData.forEach(
          (e) => { if (e.isEstimated) predictedConsumption += Number(e.usage); },
        );
        maxUsageForecast = maxValue(graphDataForecast);
      }
    }

    const maxUsage = Math.max(maxValue(arrayData), maxUsageForecast);
    setState({
      predicted:
        state.periodIsMonthOrFlexible && state.isCurrentMonth
          ? `${predictedConsumption || '0'}`
          : `${responseUsage.predicted || '0'}`,
      maxUsage,
    });
    if (state.predictedLastMonth === undefined) setState({ predictedLastMonth: state.predicted });
  };

  const getOthersPeriodData = async () => {
    await getGraphDataAndForecast();

    if (state.periodIsMonthOrFlexible) {
      const consumptionByDayOfWeek = [
        { label: t('diasDaSemana.domingo'), days: 0, consumption: 0 },
        { label: t('diasDaSemana.segunda'), days: 0, consumption: 0 },
        { label: t('diasDaSemana.terca'), days: 0, consumption: 0 },
        { label: t('diasDaSemana.quarta'), days: 0, consumption: 0 },
        { label: t('diasDaSemana.quinta'), days: 0, consumption: 0 },
        { label: t('diasDaSemana.sexta'), days: 0, consumption: 0 },
        { label: t('diasDaSemana.sabado'), days: 0, consumption: 0 },
      ];
      state.graphData.forEach((e) => {
        const dateArray = e.date.split('/');
        const strDate = [dateArray[1], dateArray[0], dateArray[2]].join('/');
        const date = moment(strDate).startOf('day');
        const currDate = moment().startOf('day');
        if (date <= currDate) {
          consumptionByDayOfWeek[date.day()].consumption += Number(e.usage);
          consumptionByDayOfWeek[date.day()].days += 1;
        }
      });
      setState({ consumptionByDayOfWeek });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!state.endDate) return;
        setState({ loadingNewData: true });

        setForecastStates();

        if (state.period === t('dia')) {
          await getDailyData();
        } else {
          await getOthersPeriodData();
        }

        if (shouldNotDisplayLiters) {
          verifyConsumptionInMeterCubic();
        }
      } catch (err) {
        toast.error(t('erroHistorico'));
        console.error(err);
        console.log(err);
      }
      setState({ loadingNewData: false });
    })();
  }, [device_code, state.startDate, state.devInfo, state.endDate]);

  useEffect(() => {
    (async () => {
      try {
        setState({ loading: true });

        let lastReadingDate = t('erroNaoFoiRealizadaNenhumaLeitura');
        if (device_code.startsWith('DMA')) {
          const { info } = await apiCall('/get-integration-info', {
            supplier: 'diel-dma',
            integrId: device_code,
          });
          setState({ devInfo: info });
          setState({
            installationDate:
              moment(info.installationDate?.substring(0, 10)).format('ll')
              === t('dataInvalida')
                ? '-'
                : moment(info.installationDate?.substring(0, 10)).toISOString(),
          });
          const response = await apiCall('/dma/get-last-reading-date', {
            dmaId: device_code,
          });
          if (response?.date != null) {
            lastReadingDate = moment(response.date).format('lll');
          }
        } else {
          const response = await apiCall('/laager/get-informations', {
            unit_id: device_code,
          });
          if (response?.last_reading_date) {
            lastReadingDate = moment(response.last_reading_date).format('lll');
          }
        }

        setState({
          lastReadingDate,
        });
      } catch (err) {
        toast.error(t('erroCarregarInformacoes'));
        console.error(err);
      }
      setState({ loading: false });
    })();
  }, []);

  useEffect(() => {
    if (shouldNotDisplayLiters) {
      verifyConsumptionInMeterCubic();
    } else {
      const maxUsage = maxValue(state.graphData);
      setState({ maxUsage });
    }
    render();
  }, [shouldNotDisplayLiters]);

  function verifyConsumptionInMeterCubic() {
    const cubicMetersHistGraphData = state.graphData.map(
      ({
        name, usage, date, dailyReadings, devId, estimatedUsage,
      }) => {
        const dailyHistReadings = dailyReadings && dailyReadings.length > 0
          ? dailyReadings.map((readings) => ({
            name,
            usage: (Number(usage) / 1000).toFixed(2),
            date,
            dayUsage: (Number(readings.dayUsage) / 1000).toFixed(2),
            readTime: readings.readTime,
            estimatedUsage: readings.estimatedUsage,
          }))
          : [];
        return {
          name,
          usage: (Number(usage) / 1000).toFixed(2),
          date,
          dailyReadings: dailyHistReadings,
          estimatedUsage,
          devId,
        };
      },
    );
    state.cubicMetersGraphData = cubicMetersHistGraphData;

    let maxUsageForecast = 0;
    if (state.periodIsMonthOrFlexible) {
      const cubicMetersHistGraphDataForecast = state.graphDataForecast.map(
        ({
          name, usage, date, dailyReadings, devId, estimatedUsage,
        }) => {
          const dailyHistReadings = dailyReadings && dailyReadings.length > 0
            ? dailyReadings.map((readings) => ({
              name,
              usage: (Number(usage) / 1000).toFixed(2),
              date,
              dayUsage: (Number(readings.dayUsage) / 1000).toFixed(2),
              readTime: readings.readTime,
              estimatedUsage: readings.estimatedUsage,
            }))
            : [];

          return {
            name,
            usage: (Number(usage) / 1000).toFixed(2),
            date,
            dailyReadings: dailyHistReadings,
            devId,
            estimatedUsage,
          };
        },
      );
      state.cubicMetersGraphDataForecast = cubicMetersHistGraphDataForecast;
      maxUsageForecast = maxValue(state.cubicMetersGraphData);
    }

    const maxUsage = Math.max(
      maxValue(state.cubicMetersGraphData),
      maxUsageForecast,
    );
    setState({ maxUsage });
  }

  function handleDateChange(date: moment.Moment | string): void {
    setState({
      startDateHist: state.startDate, endDateHist: state.endDate, lastStartDateHist: state.lastStartDate, lastEndDateHist: state.lastEndDate,
    });
    if (state.period === t('dia') && isMoment(date)) {
      setState({ yearGraphic: false });
      const formattedDate = date.format('YYYY-MM-DD');
      const formattedLastDate = date.subtract(1, 'days').format('YYYY-MM-DD');
      setState({
        startDate: formattedDate, endDate: formattedDate, lastStartDate: formattedLastDate, lastEndDate: formattedLastDate,
      });
    } else if (state.period === t('semana') && isMoment(date)) {
      setState({ yearGraphic: false });
      const startDate = date.startOf('week').format('YYYY-MM-DD');
      const endDate = date.endOf('week').format('YYYY-MM-DD');
      const lastStartDate = moment(startDate).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
      const lastEndDate = moment(endDate).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
      setState({
        startDate, endDate, lastStartDate, lastEndDate,
      });
    } else if (state.period === t('mes') && isMoment(date)) {
      setState({ yearGraphic: false });
      const startDate = date.startOf('month').format('YYYY-MM-DD');
      const endDate = date.endOf('month').format('YYYY-MM-DD');
      const lastStartDate = moment(startDate).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      const lastEndDate = moment(endDate).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
      setState({
        startDate, endDate, lastStartDate, lastEndDate,
      });
    } else if (state.period === t('flexivel') && isMoment(date)) {
      setState({ yearGraphic: false });
      const startDate = date.startOf('month').format('YYYY-MM-DD');
      const endDate = date.endOf('month').format('YYYY-MM-DD');
      const lastStartDate = moment(startDate).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      const lastEndDate = moment(endDate).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
      setState({
        startDate, endDate, lastStartDate, lastEndDate,
      });
    } else if (state.period === t('ano') && isMoment(date)) {
      setState({ yearGraphic: true });
      const startDate = date.startOf('year').format('YYYY-MM-DD');
      const endDate = date.endOf('year').format('YYYY-MM-DD');
      const lastStartDate = moment(startDate).subtract(1, 'years').startOf('year').format('YYYY-MM-DD');
      const lastEndDate = moment(endDate).subtract(1, 'years').endOf('year').format('YYYY-MM-DD');
      setState({
        startDate, endDate, lastStartDate, lastEndDate,
      });
    }
    getDisabledButton();
  }

  function getDisabledButton(): void {
    const endDate = moment(state.endDate);
    const currentDate = moment();
    const currentDay = currentDate.day();
    const currentWeek = currentDate.week();
    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();
    if (state.period === t('dia') && endDate.day() === currentDay) {
      setState({ arrowDisabled: true });
    }
    if (state.period === t('semana') && endDate.week() === currentWeek) {
      setState({ arrowDisabled: true });
    }
    else if (state.period === t('mes') && endDate.month() === currentMonth) {
      setState({ arrowDisabled: true });
    }
    else if (state.period === t('ano') && endDate.year() === currentYear) {
      setState({ arrowDisabled: true });
    }
    else if (state.period === t('flexivel')) {
      const differenceInDays = endDate.diff(moment(state.startDate), 'days');
      const newEndDate = endDate.add(differenceInDays, 'days');
      const isNextMonth = newEndDate.month() > currentDate.month() || newEndDate.year() > currentDate.year();

      setState({ arrowDisabled: isNextMonth });
    }
    else {
      setState({ arrowDisabled: false });
    }
  }

  function handlePeriodUsageDiff(usage: number, usageLast: number): string | null {
    // calcular o percentual de diferença de uso: ()
    const diffPercent = (((usage - usageLast) / usageLast) * 100) || 0;
    if (diffPercent >= 0) setState({ period_usage_up: true });
    else setState({ period_usage_up: false });
    if (diffPercent === Infinity || diffPercent === 0 || diffPercent == null) return null;
    return diffPercent.toFixed(2);
  }

  const getMeasureUnit = () => (shouldNotDisplayLiters ? 'm³' : t('litros'));

  const formatConsumption = (num: string) => (shouldNotDisplayLiters
    ? formatNumberWithFractionDigits(Number(num) / 1000, { minimum: 2, maximum: 2 })
    : formatNumberWithFractionDigits(Number(num), { minimum: 0, maximum: 0 }));

  function quickChangeData(startDate, endDate, timeSelected) {
    const timeSelectedForDay = ['Hoje', 'Ontem'];
    const timeSelectedForWeek = ['Semana Atual', 'Semana Passada', 'Últimos 7 dias'];
    const timeSelectedForMonth = ['Últimos 30 dias', 'Últimos 60 dias', 'Últimos 90 dias'];
    const timeSelectedForYear = ['Últimos 12 meses'];

    setState({ periodHist: state.period });
    if (timeSelectedForDay.includes(timeSelected)) setState({ yearGraphic: false, period: t('dia'), last12Months: false });
    else if (timeSelectedForWeek.includes(timeSelected)) setState({ yearGraphic: false, period: t('semana'), last12Months: false });
    else if (timeSelectedForMonth.includes(timeSelected)) setState({ yearGraphic: false, period: t('flexivel'), last12Months: false });
    else if (timeSelectedForYear.includes(timeSelected)) { setState({ yearGraphic: true, period: t('ano'), last12Months: true });
    }

    setState({
      startDateHist: state.startDate, endDateHist: state.endDate, lastStartDateHist: state.lastStartDate, lastEndDateHist: state.lastEndDate,
    });

    const endDateFormat = endDate.format('YYYY-MM-DD');
    const startDateFormat = startDate.format('YYYY-MM-DD');
    setState({ startDate: startDateFormat, endDate: endDateFormat });

    render();
  }

  function handleDateChangeLeft(): void {
    const dateInit = moment(state.startDate);
    const dateEnd = moment(state.endDate);
    if (state.period === t('dia')) {
      const formattedDateInit = dateInit.subtract(1, 'days').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.subtract(1, 'days').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'days').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'days').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('semana')) {
      const formattedDateInit = dateInit.subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('mes')) {
      const formattedDateInit = dateInit.subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('flexivel')) {
      const differenceInDays: number = dateEnd.diff(dateInit, 'days');
      const formattedDateInit = dateInit.subtract(differenceInDays, 'days').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.subtract(differenceInDays, 'days').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(differenceInDays, 'days').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(differenceInDays, 'days').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('ano')) {
      const formattedDateInit = dateInit.subtract(1, 'years').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.subtract(1, 'years').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'years').startOf('year').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'years').endOf('year').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    }
    getDisabledButton();
  }

  function handleDateChangeRight(): void {
    const dateInit = moment(state.startDate);
    const dateEnd = moment(state.endDate);
    if (state.period === t('dia')) {
      const formattedDateInit = dateInit.add(1, 'days').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.add(1, 'days').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'days').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'days').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('semana')) {
      const formattedDateInit = dateInit.add(1, 'weeks').startOf('week').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.add(1, 'weeks').endOf('week').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('mes')) {
      const formattedDateInit = dateInit.add(1, 'months').startOf('month').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.add(1, 'months').endOf('month').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('flexivel')) {
      const differenceInDays: number = dateEnd.diff(dateInit, 'days');
      const formattedDateInit = dateInit.add(differenceInDays, 'days').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.add(differenceInDays, 'days').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(differenceInDays, 'days').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(differenceInDays, 'days').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    } else if (state.period === t('ano')) {
      const formattedDateInit = dateInit.add(1, 'years').startOf('year').format('YYYY-MM-DD');
      const formattedDateEnd = dateEnd.add(1, 'years').endOf('year').format('YYYY-MM-DD');
      const formattedLastDateInit = moment(formattedDateInit).subtract(1, 'years').startOf('year').format('YYYY-MM-DD');
      const formattedLastDateEnd = moment(formattedDateEnd).subtract(1, 'years').endOf('year').format('YYYY-MM-DD');
      setState({
        startDate: formattedDateInit, endDate: formattedDateEnd, lastStartDate: formattedLastDateInit, lastEndDate: formattedLastDateEnd,
      });
    }
    getDisabledButton();
  }

  function handleClickBar(value): void {
    if (state.period === t('dia')) return;

    if (state.period === t('ano')) {
      setState({
        periodHist: state.period,
        period: t('mes'),
      });
    }
    else {
      setState({
        periodHist: state.period,
        period: t('dia'),
      });
    }
    handleDateChange(moment(value.information_date));
  }

  function returnPeriod(): void {
    setState({
      startDate: state.startDateHist,
      endDate: state.endDateHist,
      period: state.periodHist,
      lastStartDate: state.lastStartDateHist,
      lastEndDate: state.lastEndDateHist,
      startDateHist: undefined,
      endDateHist: undefined,
      periodHist: '',
      lastStartDateHist: undefined,
      lastEndDateHist: undefined,
    });
    setState({ yearGraphic: false });
    if (state.period === t('ano')) setState({ yearGraphic: true });
    else setState({ yearGraphic: false });
    getDisabledButton();
  }

  function verifyLink() {
    if (device_code?.startsWith('DMA')) {
      return `/integracoes/info/diel/${device_code}/perfil`;
    }

    return `/analise/unidades/integracao-agua/${unitId}?supplier=laager`;
  }

  function verifyIsOutsideRange(date: moment.Moment) {
    const startDate = moment(state.startDate, 'YYYY-MM-DD').startOf('day');
    const maxEndDate = startDate.isValid() ? startDate.clone().add(1, 'month').endOf('day') : null;

    const isAfterMaxEndDate = maxEndDate ? date.isAfter(maxEndDate) : false;
    const isOutsideCurrentMonth = !date.isBefore(moment().endOf('month'));

    return isAfterMaxEndDate || isOutsideCurrentMonth;
  }

  return (
    <div style={{ paddingTop: '25px' }}>
      {(state.loading || state.loadingNewData) && <Loader />}
      {!state.loading && !state.loadingNewData && (
        <Box width={1}>
          <Flex flexWrap="wrap" alignItems="center">
            <Box width="110px">
              <Select
                options={[
                  t('dia'),
                  t('semana'),
                  t('mes'),
                  t('flexivel'),
                  t('ano'),
                ]}
                onSelect={(period: string) => {
                  setState({
                    periodHist: state.period,
                    period,
                    periodIsMonthOrFlexible: [
                      t('ano'),
                      t('mes'),
                      t('flexivel'),
                      t('semana'),
                    ].includes(period),
                  });
                  handleDateChange(moment());
                }}
                value={state.period}
                placeholder={t('periodo')}
                hideSelected
                small
                // @ts-ignore
                disabled={state.isLoading}
              />
            </Box>
            <Flex alignItems="center" ml="40px">
              <ContentDate style={{ minHeight: '40px', width: '270px' }}>
                <Flex justifyContent="space-between">
                  <ContainerArrowLeft onClick={() => handleDateChangeLeft()}>
                    <ArrowLeftIcon color="#202370" />
                  </ContainerArrowLeft>
                  <Flex flexDirection="column" width="100%">
                    <LabelData>{t('data')}</LabelData>
                    {(state.period === t('dia') || state.period === t('semana')) && (
                    <SingleDatePicker
                      disabled={state.loading}
                      date={moment(state.startDate, 'YYYY-MM-DD')}
                      onDateChange={(data) => handleDateChange(data)}
                      focused={state.focused}
                      onFocusChange={({ focused }) => {
                        state.focused = focused;
                        render();
                      }}
                      id="datepicker"
                      numberOfMonths={1}
                      displayFormat="DD/MM/YYYY"
                      isOutsideRange={(d) => !d.isBefore(moment())}
                    />
                    )}
                    {state.period === t('mes') && (
                      <DatePicker
                        maxDate={moment().toDate()}
                        disabled={state.loading}
                        selected={moment(state.startDate, 'YYYY-MM-DD').toDate()}
                        onChange={(d) => handleDateChange(moment(d))}
                        locale="pt-BR"
                        showMonthYearPicker
                        dateFormat="MMMM Y"
                      />
                    )}
                    {state.period === t('ano') && (
                    <DatePicker
                      maxDate={moment().toDate()}
                      disabled={state.loading}
                      selected={moment(state.startDate, 'YYYY-MM-DD').toDate()}
                      onChange={(d) => handleDateChange(moment(d))}
                      locale="pt-BR"
                      showYearPicker
                      dateFormat="yyyy"
                    />
                    )}
                    {state.period === t('flexivel') && (
                    <DateRangePicker
                      small
                      readOnly
                      disabled={state.loading}
                      startDate={moment(state.startDate, 'YYYY-MM-DD')}
                      startDateId="your_unique_start_date_id"
                      endDate={
                      state.endDate ? moment(state.endDate, 'YYYY-MM-DD') : null
                    }
                      endDateId="your_unique_end_date_id"
                      onDatesChange={({ startDate, endDate }) => {
                        setState({
                          startDate: startDate.format('YYYY-MM-DD'),
                          endDate:
                          startDate.format('YYYY-MM-DD') !== state.startDate
                            ? null
                            : endDate.format('YYYY-MM-DD'),
                        });
                        getDisabledButton();
                      }}
                      onFocusChange={(focused) => {
                        state.focusedInput = focused;
                        render();
                      }}
                      focusedInput={state.focusedInput}
                      noBorder
                      isOutsideRange={verifyIsOutsideRange}
                      startDatePlaceholderText={t('dataInicial')}
                      endDatePlaceholderText={t('dataFinal')}
                      displayFormat="DD/MM/YYYY"
                    />
                    )}

                  </Flex>
                  <ContainerArrowRight disabled={state.arrowDisabled} onClick={() => handleDateChangeRight()}>
                    <ArrowRightIcon color={state.arrowDisabled ? '#E6E6E6' : '#202370'} />
                  </ContainerArrowRight>
                </Flex>
              </ContentDate>
            </Flex>
          </Flex>
          <div style={{ width: 'fit-content' }}>
            <QuickSelection isShortMode={false} setDate={quickChangeData} excludeSelects={['Últimos 60 dias', 'Últimos 90 dias']} height="120px" />
          </div>
          <br />
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginRight: '50px',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>
                    {t('consumo')}
                  </span>
                  { profile.manageAllClients && (
                    <Box>
                      <Flex
                        width="14px"
                        style={{ cursor: 'pointer', position: 'relative', top: '2px' }}
                      >
                        <InfoIcon
                          data-tip
                          data-for="custom"
                          width="14px"
                          color="#A9A9A9"
                        />
                      </Flex>

                      <ReactTooltip
                        id="custom"
                        place="top"
                        event="mouseenter"
                        eventOff="mouseleave"
                        clickable
                        delayHide={500}
                        effect="solid"
                        backgroundColor="#fff"
                        border
                        borderColor="#E8E8E8"
                      >
                        <HoverMeterInfo>
                          <Flex flexDirection="column" marginTop="3px">
                            <span
                              style={{
                                fontWeight: 700,
                                marginBottom: '8px',
                              }}
                            >
                              {t('medidor')}
                            </span>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '25px',
                              position: 'relative',
                            }}
                            >
                              <TransparentLink
                                to={verifyLink()}
                              >
                                <span
                                  style={{
                                    fontSize: '12px',
                                    color: '#464646',
                                    textDecoration: 'underline',
                                  }}
                                >
                                  {device_code}
                                </span>
                              </TransparentLink>

                              <InfoLinkIcon />
                            </div>
                          </Flex>
                        </HoverMeterInfo>
                      </ReactTooltip>
                    </Box>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginRight: '50px',
                  }}
                >
                  <span
                    style={{
                      color: '#373737',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {t('unidadeDeMedida')}
                  </span>
                  <div>
                    <span style={{ fontSize: '13px' }}>{t('litros')}</span>
                    <ToggleSwitchMini
                      checked={shouldNotDisplayLiters}
                      onClick={() => setShouldNotDisplayLiters(!shouldNotDisplayLiters)}
                      style={{ marginLeft: '10px', marginRight: '10px' }}
                    />
                    <span style={{ fontSize: '13px' }}>
                      {t('metrosCubicos')}
                    </span>
                  </div>
                </div>
                {props.installationDate && state.isCurrentMonth ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Checkbox
                      size={16}
                      checked={state.showForecast}
                      onClick={() => {
                        state.showForecast = !state.showForecast;
                        render();
                      }}
                    />
                    {t('previsaoConsumo')}
                  </div>
                ) : null}
              </div>
              <Flex justifyContent="space-around" alignItems="center">
                {state.periodHist !== '' && <ButtonReturnPeriod onClick={() => returnPeriod()}>{t('voltar').toUpperCase()}</ButtonReturnPeriod>}
                <DateCaption startDate={state.startDate} endDate={state.endDate} period={state.period} />
              </Flex>
            </div>
            <Flex flexDirection="column">
              <GenerateGraphWater
                arrayData={state.arrayData}
                waterCard={undefined}
                isExpanded={false}
                isHistory
                unitMeasuere={shouldNotDisplayLiters ? 'cubic' : 'liters'}
                period={state.period}
                last12Months={state.last12Months}
                showForecast={state.showForecast}
                handleClickBar={handleClickBar}
                litersSelected={!shouldNotDisplayLiters}
              />
              <ContainerCaption>
                <ConsumptionInfoCaption
                  dataId="real"
                  label={t('consumoReal')}
                  color="#2D81FF"
                  legendHover={t(
                    'consumoRegistradoPeloDispositivoDurantePeriodoSelecionado',
                  )}
                  widthIcon="28px"
                />

                <ConsumptionInfoCaption
                  dataId="virtual"
                  label={t('consumoVirtual')}
                  color="#BCD5FB"
                  legendHover={t(
                    'consumoAcumuladoDistribuidoIntervaloSelecionado',
                  )}
                  widthIcon="58px"
                />

                {state.periodIsMonthOrFlexible
                  && props.installationDate
                  && state.isCurrentMonth && (
                    <ConsumptionInfoCaption
                      dataId="previsto"
                      label={t('consumoPrevisto')}
                      color="#E6E6E6"
                      legendHover={t(
                        'consumoEstimadoBaseadoHistoricoConsumoUnidade',
                      )}
                      widthIcon="28px"
                    />
                )}
              </ContainerCaption>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  marginTop: '20px',
                }}
              >
                <VarContainer>
                  <VarName>{t('consumoPeriodo')}</VarName>
                  <div>
                    <VarValue>
                      {shouldNotDisplayLiters
                        ? formatNumberWithFractionDigits(Number(state.period_usage) / 1000, { minimum: 2, maximum: 2 })
                        : formatNumberWithFractionDigits(Number(state.period_usage), { minimum: 0, maximum: 0 })}
                    </VarValue>
                    <VarUnit>{getMeasureUnit()}</VarUnit>
                  </div>
                  {state.period_usage_last
                  && (
                  <ContainerUsageDiff style={{ color: state.period_usage_up ? '#E00030' : '#92CC9A' }}>
                    <ContainerIcon
                      period_usage_up={state.period_usage_up}
                    >
                      <ArrowDownIcon color={state.period_usage_up ? '#E00030' : '#92CC9A'} />
                    </ContainerIcon>
                    {state.period_usage_last}
                    %
                  </ContainerUsageDiff>
                  )}

                </VarContainer>
                {state.period !== t('dia') && (
                  <>
                    <VarContainer data-tip data-for="forecast">
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <VarName>{t('mediaConsumoDiario')}</VarName>
                        <InfoIcon width="14px" color="#A9A9A9" />
                      </div>
                      <div>
                        <VarValue>
                          {formatConsumption(state.daily_average)}
                        </VarValue>
                        <VarUnit>{getMeasureUnit()}</VarUnit>
                      </div>
                    </VarContainer>
                    {state.isCurrentMonth && (
                      <VarContainer>
                        <VarName>{t('previsao')}</VarName>
                        <div>
                          <VarValue>
                            {formatConsumption(state.predicted)}
                          </VarValue>
                          <VarUnit>{getMeasureUnit()}</VarUnit>
                        </div>
                      </VarContainer>
                    )}
                  </>
                )}
              </div>

              <Flex>
                <div>
                  {state.periodIsMonthOrFlexible && (
                    <ReactTooltip
                      id="forecast"
                      place="top"
                      effect="solid"
                      delayHide={100}
                      offset={{ top: 0, left: 10 }}
                      textColor="#000000"
                      backgroundColor="rgba(255, 255, 255, 0.97)"
                      border
                      borderColor="#202370"
                    >
                      <span style={{ marginTop: '6px', fontSize: '95%' }}>
                        <strong style={{ fontSize: '1.2rem' }}>
                          {t('mediasDeConsumo')}
                        </strong>
                        {state.consumptionByDayOfWeek.map((e) => (
                          <Flex
                            key={e.label}
                            alignItems="center"
                            justifyContent="space-between"
                            style={{ fontSize: '0.9rem' }}
                          >
                            <strong>
                              {`${e.label}:`}
                              &nbsp; &nbsp;
                            </strong>
                            <div>
                              <strong>
                                {`${
                                  shouldNotDisplayLiters
                                    ? (
                                      ((Number(e.consumption)
                                          / (e.days || 1)) as number) / 1000
                                    ).toLocaleString('pt-br', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                    : (
                                      Number(e.consumption) / (e.days || 1)
                                    ).toFixed(0)
                                }`}
                              </strong>
                              {getMeasureUnit()}
                            </div>
                          </Flex>
                        ))}
                      </span>
                    </ReactTooltip>
                  )}
                </div>
              </Flex>
            </Flex>
          </Card>
        </Box>
      )}
    </div>
  );
}

export function ConsumptionInfoCaption(props: {
  label: string;
  color: string;
  legendHover: string;
  dataId: string;
  widthIcon: string;
}): JSX.Element {
  return (
    <Flex
      mr={2}
      alignItems="center"
      data-tip
      data-for={props.dataId}
      justifyContent="space-between"
    >
      <div
        style={{
          backgroundColor: props.color,
          borderRadius: '5px',
          width: '25px',
          height: '8px',
          display: 'inline-block',
        }}
      />
      <span style={{ marginLeft: 7, fontSize: '12px', marginRight: 3 }}>
        {props.label}
      </span>
      <ReactTooltip id={props.dataId} place="top" effect="solid">
        <HoverConsumptionInfo>
          <InfoIcon width={props.widthIcon} color="white" />
          <Flex flexDirection="column" marginTop="3px">
            <span
              style={{
                fontSize: '12px',
                marginBottom: '12px',
                fontWeight: 700,
              }}
            >
              {props.label}
            </span>
            {props.legendHover}
          </Flex>
        </HoverConsumptionInfo>
      </ReactTooltip>
      <InfoIcon width="14px" color="#A9A9A9" />
    </Flex>
  );
}

export function DateCaption(props: {
  startDate: string;
  endDate: string;
  period: string
}): JSX.Element {
  moment.updateLocale('pt', {
    months: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ],
  });

  if (props.period === t('dia')) {
    return (
      <span style={{ fontWeight: 600, color: '#3c3c3c' }}>
        {moment(props.startDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
      </span>
    );
  }

  if (props.period === t('semana') || props.period === t('flexivel')) { return (
    <span style={{ fontWeight: 600, color: '#3c3c3c' }}>
      {props.startDate ? moment(props.startDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : t('selecioneDataInicial')}
      <span style={{ padding: '0 4px' }}>-</span>
      {props.endDate ? moment(props.endDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : t('selecionaDataFinal')}
    </span>
  ); }

  if (props.period === t('mes')) {
    return (
      <span style={{ fontWeight: 600, color: '#3c3c3c' }}>
        {moment(props.startDate, 'YYYY-MM-DD').format('MMMM YYYY')}
      </span>
    );
  }

  if (props.period === t('ano')) {
    return (
      <span style={{ fontWeight: 600, color: '#3c3c3c' }}>
        {moment(props.startDate, 'YYYY-MM-DD').format('YYYY')}
      </span>
    );
  }

  return <></>;
}
