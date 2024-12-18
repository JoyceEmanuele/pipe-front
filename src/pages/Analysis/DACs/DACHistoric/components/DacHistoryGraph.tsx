import { useContext, useEffect, useRef } from 'react';
import {
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  DataZoomComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { t } from 'i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { zoomTooltipOff } from '~/pages/Analysis/Integrations/IntegrHistory/ChillerCarrierHistory/components/ChillerParameters';
import moment from 'moment';
import { tooltipXLabelFormatter } from '~/helpers/historyGraph';
import MenuContext from '~/contexts/menuContext';

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LineChart,
  SVGRenderer,
  UniversalTransition,
  DataZoomComponent,
]);

interface TooltipParams {
  name: string;
  value: number;
  seriesName: string;
  seriesType: string;
  dataIndex: number;
  axisValue: number;
  color: string;
}

export function GenerateGraphSample({
  state, graphEnable, axisInfo, hwCfg, manageAllClients,
}): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);
  const { menuToogle } = useContext(MenuContext);

  const selectedParams = state.chartData.vars?.filter((varInfo) => graphEnable[varInfo.id] || varInfo.id === 'SavedData');
  const isDesktop = window.matchMedia('(min-width: 1039px)').matches;
  const isSmallMobile = window.matchMedia('(max-width: 550px)').matches;

  function formatterTooltip(value: TooltipParams[], unitMap: { [key: string]: string }) {
    const date = tooltipXLabelFormatter(value[0].axisValue, state.dateStart);
    const values: string[] = [];
    const tooltipContentFactory = [date];

    if (value.every((x) => x?.value == null)) return '';

    for (const item of value) {
      if (item.value == null) {
        continue;
      }
      const itemValue = verifyValue(item.value, item.seriesName);
      const itemName = item.seriesName?.replace('[Bar]', '').replace('[ΔTºC]', '[ΔT]');
      const cssObject = `<span style="color: ${item.color}">${itemName}: </span><span style="color: 'black'">${itemValue} ${unitMap[item.seriesName]}</span>`;
      values.push(cssObject);
    }

    tooltipContentFactory.push(...values);

    return tooltipContentFactory.join('<br />');
  }

  function tickXLabelFormaterDay(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(`${moment(state.dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');

    const dateFinal = `${dd}/${mm}`;
    return `${dateFinal}${tickXLabelFormaterHour(hour)}`;
  }

  function tickXLabelFormaterHour(hour: number) {
    const numDays = Math.floor(hour / 24);
    const sign = hour - 24 * numDays < 0 ? '-' : '';
    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;

    return `${'\n'} ${sign}${String(hh).padStart(2, '0')}:00`;
  }

  function verifyIndexY(axisId: string) {
    if (axisId === 'press') return 1;

    return 0;
  }

  function generateMappings(value: number) {
    const mappingValues = new Map<number, number>();

    const min = -2.4;
    const max = axisInfo.tempTicks[0] ? axisInfo.tempTicks[0] : 0;
    let current = min;
    let alternate = true;
    let minKey = -3;

    while (current >= max) {
      const nextValue = current + (alternate ? -2.1 : -2.9);
      mappingValues.set(minKey, Number(current.toFixed(1)));
      minKey -= 3;
      current = nextValue;
      alternate = !alternate;
    }

    return mappingValues.get(value) ?? value;
  }

  function mapToFurthestMultiple(value: number): number {
    const chartDataVars = state.chartData?.vars ?? [];
    const minTemperature = Math.floor(Math.min(
      ...chartDataVars.filter((item) => item.axisId === 'temp' && ['Lcmp', 'Levp', 'L1raw', 'L1fancoil', 'Lcut', 'SavedData'].some((x) => x !== item.id))
        .flatMap((item) => item.y)
        .filter((value) => value != null),
    ));

    const alteredValues = state.alteredValues ?? [];

    if (!alteredValues?.length && value < minTemperature) {
      const mappingValue = generateMappings(value);
      alteredValues.push({ originalValue: mappingValue, roundedValue: value });
      return mappingValue;
    }

    const foundValue = alteredValues.find((x) => x.roundedValue === value);

    if (foundValue) {
      return foundValue.originalValue;
    }

    return getClosestMultipleOfFive(value);
  }

  function getClosestMultipleOfFive(value: number): number {
    let valueAux = value;

    if (value > 0) return value;

    if (valueAux % 10 === 3) {
      valueAux = value - 3;
    } else if (valueAux % 10 === 6) {
      valueAux = value - 1;
    } else if (valueAux % 10 === 9) {
      valueAux = value + 1;
    } else {
      valueAux = Math.round(valueAux / 5) * 5;
    }

    return valueAux;
  }

  function mapSavedDataLabel(value: number, abbreviate: boolean): string {
    const onlineLabel = abbreviate ? t('onlineAbreviado') : t('online');
    const offlineLabel = abbreviate ? t('offlineAbreviado') : t('offline');

    if (value % 3 === 0 && value < 0) {
      return Math.abs(value / 3) % 2 === 0 ? onlineLabel : offlineLabel;
    }

    return value.toString();
  }

  function verifyIsSavedDataValue(valueY: number) {
    const hasValidData = state.chartData.vars?.some(
      (item) => item.id === 'SavedData' && item.y?.some((value) => value != null),
    );

    if (!hasValidData) return false;
    const alteredValuesAux = state.alteredValues.sort((a, b) => a.originalValue - b.originalValue);
    const valueOnline = alteredValuesAux[0]?.roundedValue;
    const valueOffline = alteredValuesAux[1]?.roundedValue;

    return [valueOnline, valueOffline].some((x) => x === valueY);
  }

  function getCustomTickTempLabel(params: {
    value: number, L1start: number, isFancoil: boolean, manageAllClients: boolean,
  }) {
    const {
      value, L1start, isFancoil, manageAllClients,
    } = params;

    let label = value.toString();

    const isSavedDataValue = verifyIsSavedDataValue(params.value);

    if (isSavedDataValue) {
      return mapSavedDataLabel(params.value, true);
    }

    const valAux = mapToFurthestMultiple(value);
    if (valAux < (L1start - 5)) {
      if (isFancoil && manageAllClients && (valAux < (L1start - 7) && valAux > (L1start - 10))) {
        label = (valAux % 5 > -2.5) ? t('ligadoAbreviado') : t('desligadoAbreviado');
      } else {
        label = (valAux % 5 > -2.5) ? t('liberadoAbreviado') : t('bloqueadoAbreviado');
      }
    } else if (valAux < L1start) {
      label = (valAux % 5 > -2.5) ? t('ligadoAbreviado') : t('desligadoAbreviado');
    }

    return label;
  }

  function verifyValue(value: number, paramName: string) {
    if (!state.chartData.vars || state.axisInfo.L1start === null) return '';

    const varInfo = state.chartData.vars.find((data) => data.name === paramName);
    const id = varInfo?.id;

    const isPressure = id === 'Psuc';
    const isBool = ['Levp', 'Lcut', 'Lcmp', 'L1raw', 'L1fancoil'].includes(id || '');

    let label = formatNumberWithFractionDigits(
      isPressure ? value.toFixed(1).toString() : value.toString(),
    );

    if (id === 'SavedData') {
      label = mapSavedDataLabel(value, false);
    } else if (isBool) {
      const valAux = mapToFurthestMultiple(value);
      label = getBooleanLabel(valAux);
    }

    return label;
  }

  function getLabelBasedOnCondition(valAux: number, ifOption: string, elseOption: string): string {
    return valAux % 5 > -2.5 ? ifOption : elseOption;
  }

  function getBooleanLabel(valAux: number): string {
    const { L1start } = axisInfo;

    if (valAux < L1start - 5) {
      const condition = hwCfg.isFanCoil && manageAllClients && valAux < L1start - 7 && valAux > L1start - 10;

      if (condition) {
        return getLabelBasedOnCondition(valAux, t('ligadoMin'), t('desligadoMin'));
      }
      return getLabelBasedOnCondition(valAux, t('liberadoMin'), t('bloqueadoMin'));
    }

    if (valAux < L1start) {
      return getLabelBasedOnCondition(valAux, t('ligadoMin'), t('desligadoMin'));
    }

    return '';
  }

  function verifyYLabel() {
    return ((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.devInfo.dac.AST_ROLE === 1 || state.devInfo.dac.AST_ROLE === 2)) ? `${t('temperaturaAbreviado')}/${t('correnteAbreviado')}/${t('velocidadeAbreviado')}` : t('temperatura');
  }

  function renderToolbox() {
    return {
      toolbox: {
        feature: {
          dataZoom: {
            xAxisIndex: [0],
            title: {
              zoom: t('Zoom'),
              back: t('voltarAmpliacao'),
            },
            filterMode: 'filter',
          },
          restore: {
            title: t('restaurarZoom'),
          },
          saveAsImage: {
            title: t('salvarComoImagem'),
            name: state.dacId,
          },
        },
        top: '0%',
      },
    };
  }

  function verifyInterval() {
    const interval = Math.max(60, 1440 / state.numDays);

    if (isSmallMobile) return interval * 2;

    return interval;
  }

  function verifyMinPressure() {
    const hasValidData = state.chartData.vars?.some(
      (item) => item.axisId === 'press' && item.y?.some((value) => value != null),
    );
    const intervalPressure = verifyIntervalPressure();
    const gaps = verifyGapsIntervalPressure();

    if (hasValidData) {
      const minValue = Math.floor(Math.min(
        ...state.chartData.vars
          .filter((item) => item.axisId === 'press')
          .flatMap((item) => item.y)
          .filter((value) => value != null),
      ));

      const minValueAux = axisInfo.presTicks[0] < minValue ? axisInfo.presTicks[0] : Math.floor(minValue);

      return minValueAux - (gaps * intervalPressure);
    }

    return Number(axisInfo.presLimits[0] ?? 0) - (gaps * intervalPressure);
  }

  function verifyMaxPressure() {
    const hasValidData = state.chartData.vars?.some(
      (item) => item.axisId === 'press' && item.y?.some((value) => value != null),
    );

    if (hasValidData) {
      return axisInfo.presTicks[axisInfo.presTicks.length - 1];
    }

    return axisInfo.presLimits[1];
  }

  function verifyIntervalPressure() {
    if (axisInfo.presTicks?.length > 1) {
      return Math.floor(axisInfo.presTicks[1] - axisInfo.presTicks[0]);
    }
    return Math.ceil((axisInfo.presLimits[1] - axisInfo.presLimits[0]) / 10);
  }

  function verifyMinTemp() {
    const hasValidData = state.chartData.vars?.some(
      (item) => item.axisId === 'temp' && item.y?.some((value) => value != null),
    );

    if (hasValidData) {
      const minValue = Math.min(
        ...state.chartData.vars
          .filter((item) => item.axisId === 'temp')
          .flatMap((item) => item.y)
          .filter((value) => value != null),
      );

      const minValueAux = axisInfo.tempTicks[0] < minValue ? axisInfo.tempTicks[0] : Math.floor(minValue);

      return minValueAux;
    }

    return axisInfo.tempLimits[0];
  }

  function verifyMaxTemp() {
    const hasValidData = state.chartData.vars?.some(
      (item) => item.axisId === 'temp' && item.y?.some((value) => value != null),
    );

    if (hasValidData) {
      return axisInfo.tempTicks[axisInfo.tempTicks.length - 1];
    }

    return axisInfo.tempLimits[1];
  }

  function verifyGapsIntervalPressure() {
    return state.alteredValues?.length ?? 0;
  }

  function verifyPaddingLegend() {
    const lengthParams = selectedParams?.length ?? 0;

    if (lengthParams >= 8) {
      return '30%';
    }

    if (lengthParams > 6) {
      return '25%';
    }

    return '20%';
  }

  useEffect(() => {
    const seriesData = state.chartData.vars?.filter((varInfo) => graphEnable[varInfo.id])?.map((item) => (
      {
        name: item.name,
        color: item.color,
        type: 'line',
        stack: item.name,
        smooth: true,
        data: item.y,
        lineStyle: { type: item.strokeDasharray ? 'dashed' : 'solid', width: 1 },
        showSymbol: false,
        yAxisIndex: verifyIndexY(item.axisId),
      }
    ));

    const unitMap: { [key: string]: string } = {};
    state.chartData.vars?.forEach((item) => {
      if (graphEnable[item.id]) {
        unitMap[item.name] = item.unit || '';
      }
    });
    const chartInstance = echarts.init(chartRef.current);

    const minPressure = verifyMinPressure();
    const maxPressure = verifyMaxPressure();
    const intervalPressure = verifyIntervalPressure();

    const options = {
      legend: {
        data: selectedParams?.map((param) => param.name),
        bottom: 0,
        left: 'center',
        textStyle: {
          fontSize: isSmallMobile ? 7 : 10,
          color: '#333',
        },
        orient: 'horizontal',
        width: '100%',
        itemGap: 10,
        formatter: (name) => {
          const unitMed = unitMap[name];
          const unitAux = unitMed?.length ? `[${unitMed}]` : '';
          return `${name.replace('[Bar]', '').replace('[ΔTºC]', '').trim()} ${unitAux}`;
        },
      },
      grid: {
        top: '14%',
        bottom: isDesktop ? '15%' : verifyPaddingLegend(),
      },
      tooltip: {
        trigger: 'axis',
        formatter: (value) => formatterTooltip(value, unitMap),
        padding: 20,
        confine: true,
      },
      xAxis: {
        type: 'category',
        data: state.chartData.x,
        axisLabel: {
          show: true,
          interval: verifyInterval(),
          formatter: (value) => {
            if (state.numDays === 1) {
              return tickXLabelFormaterHour(value);
            }
            return tickXLabelFormaterDay(value);
          },
          textStyle: {
            fontSize: 10,
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: verifyYLabel(),
          min: verifyMinTemp(),
          max: verifyMaxTemp(),
          id: 'temp',
          interval: 3,
          offset: 8,
          nameTextStyle: {
            padding: [0, 0, 0, isSmallMobile ? 30 : 50],
            fontSize: isSmallMobile ? 8 : 10,
          },
          axisLabel: {
            align: 'center',
            textStyle: {
              fontSize: isSmallMobile ? 8 : 10,
            },
            formatter: (value) => {
              const dataMin = verifyMinTemp();
              const interval = 3;
              const maxTemp = verifyMaxTemp();
              let current = parseFloat(dataMin);
              while (current <= maxTemp) {
                if (value === current) {
                  return getCustomTickTempLabel({
                    value,
                    L1start: axisInfo.L1start,
                    isFancoil: hwCfg.isFanCoil,
                    manageAllClients,
                  });
                }
                current += interval;
              }

              return '';
            },
          },
          alignTicks: true,
        },
        {
          type: 'value',
          name: t('pressao'),
          boundaryGap: false,
          min: minPressure,
          max: maxPressure,
          position: 'right',
          id: 'press',
          nameTextStyle: {
            fontSize: isSmallMobile ? 8 : 10,
          },
          axisLabel: {
            textStyle: {
              fontSize: isSmallMobile ? 8 : 10,
            },
            formatter: (value) => {
              let current = minPressure;
              const gaps = verifyGapsIntervalPressure();

              if (value < (minPressure + gaps * intervalPressure)) {
                return '';
              }

              while (current <= maxPressure) {
                if (value === current) {
                  return formatNumberWithFractionDigits(value, { minimum: 0, maximum: 0 });
                }
                current += intervalPressure;
              }

              return '';
            },
          },
          interval: intervalPressure,
          alignTicks: true,
          splitLine: {
            show: false,
          },
        },
      ],
      series: seriesData,
      ...renderToolbox(),
    };

    chartInstance.setOption(options);

    zoomTooltipOff(chartInstance, '');

    const handleResize = () => chartInstance.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.dispose();
    };
  }, [state.chartData.vars, graphEnable, axisInfo, menuToogle]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
  );
}
