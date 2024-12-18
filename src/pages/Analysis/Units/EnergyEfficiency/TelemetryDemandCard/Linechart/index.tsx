import { useEffect } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import * as echarts from 'echarts/core';
import {
  TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent,
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import {
  LinechartWrapper,
} from './styles';
import i18n from '~/i18n';
import { ApiResps } from '~/providers';
import { convertEnergy } from '~/helpers';
import { TelemetryChartsLegend } from '~/components';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

interface LinechartProps {
  telemetryData: ApiResps['/energy/get-demand-hist']
}

export const Linechart: React.FC<LinechartProps> = ({ telemetryData }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  useEffect(() => {
    const xAxis = handlePrepareXAxis(15, 0, 24);
    if (telemetryData.demands && telemetryData.demands?.length > 0) {
      const demandData = handlePrepareData(telemetryData.demands);

      handleRenderStackedLine(xAxis, demandData);
    } else {
      handleRenderStackedLine(xAxis, null);
    }
  }, [telemetryData]);

  // prepares
  const handlePrepareXAxis = (intervalMinutes, startHour, endHour) => {
    const times: string[] = [];
    const currentTime = new Date();
    currentTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, 0, 0, 0);

    while (currentTime <= endTime) {
      const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      times.push(formattedTime);
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }

    return times;
  };

  const handlePrepareData = (data) => data.reduce((acc, item) => {
    acc.push(item.average_demand);
    return acc;
  }, []);

  // formatters
  const tooltipFormatter = (value) => {
    const valueHour = value.find((item) => item.seriesName === 'Demanda').axisValue;
    // const valueContractOutPoint = value.find((item) => item.seriesName === 'Contrato').data;
    // const valueToleranceOutPoint = value.find((item) => item.seriesName === 'Tolerância').data;
    const valueDemand = value.find((item) => item.seriesName === 'Demanda').data;
    const [valueDemandConverted, valueDemandUnitMeasurement] = convertEnergy(Number(valueDemand) ?? 0);

    if (valueDemand === null) return;

    const valueSplitedHour = Number(valueHour.split(':')[0]);
    const valueSplitedMinute = Number(valueHour.split(':')[1]);

    const valueEndHourString = new Date();
    valueEndHourString.setHours(valueSplitedHour, valueSplitedMinute + 15, 0, 0);
    const endHour = valueEndHourString.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let stringHour = '';

    if (valueSplitedHour === 24) {
      stringHour = `00:${valueSplitedMinute}h`;
    } else {
      stringHour = `${valueHour}h`;
    }

    if (valueHour === '23:45') {
      stringHour += ' - 24:00h';
    } else if (endHour.split(':')[0] === '24') {
      stringHour += ` - 00:${endHour.split(':')[1]}h`;
    } else {
      stringHour += ` - ${endHour}h`;
    }

    // const stringContractOutPoint = `<strong>Contrato fora ponta:</strong> ${valueContractOutPoint} kW`;
    // const stringToleranceOutPoint = `<strong>Tolerância fora ponta:</strong> ${valueToleranceOutPoint} kW`;
    const stringDemand = `<strong>${t('demanda')}:</strong> ${formatNumberWithFractionDigits(valueDemandConverted.toFixed(1))}${valueDemandUnitMeasurement}`;

    const tooltipContentFactory = [stringHour, stringDemand];

    return tooltipContentFactory.join('<br />');
  };

  const xAxisFormatter = (value) => {
    if (value === '24:00') return '00:00';
    return value;
  };

  const yAxisFormatter = (value) => {
    if (value === 0 && telemetryData.max_demand?.value) {
      return `0${convertEnergy(telemetryData.max_demand.value)[1]}`;
    }

    const [valueDemandConverted, valueDemandUnitMeasurement] = convertEnergy(value);

    return `${formatNumberWithFractionDigits(valueDemandConverted)}${valueDemandUnitMeasurement}`;
  };

  // plot linechart
  const handleRenderStackedLine = (xAxis, demandData) => {
    const linechartDom = document.getElementById('linechart-demanda');

    if (!linechartDom) return;

    const lineChart = echarts.init(linechartDom);

    window.addEventListener('resize', () => {
      lineChart.resize();
    });

    const linechartOptions = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '11',
        },
        formatter: tooltipFormatter,
      },
      legend: {
        show: false,
      },
      grid: {
        left: '0%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      toolbox: {
        show: false,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxis,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          margin: 10,
          showMaxLabel: true,
          interval: 3,
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '10.5',
          formatter: xAxisFormatter,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitNumber: 5,
        max: () => {
          if (telemetryData.max_demand?.value === 0) return 10;
        },
        axisLabel: {
          margin: 50,
          align: 'left',
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '10.5',
          formatter: yAxisFormatter,
        },
      },
      series: [
        {
          name: 'Demanda',
          type: 'line',
          step: 'end',
          data: demandData,
          lineStyle: {
            color: '#5AB365',
            width: 1,
          },
          showSymbol: false,
          legendHoverLink: false,
          areaStyle: {
            color: 'rgba(121, 207, 132, 0.26)',
          },
          symbol: 'none',
        },
        {
          name: 'void',
          type: 'line',
          data: [0],
          showSymbol: false,
          symbol: 'none',
        },
        // {
        //   name: 'Tolerância',
        //   type: 'line',
        //   data: Array dos dados de tolerância,
        //   lineStyle: {
        //     color: '#F00',
        //     width: 1,
        //   },
        //   showSymbol: false,
        //   symbol: 'none',
        // },
        // {
        //   name: 'Contrato',
        //   type: 'line',
        //   data: Array dos dados de contrato,
        //   lineStyle: {
        //     type: 'dashed',
        //     color: '#F00',
        //     width: 1,
        //   },
        //   showSymbol: false,
        //   symbol: 'none',
        // },
      ],
    };

    linechartOptions && lineChart.setOption(linechartOptions);

    window.removeEventListener('resize', () => {
      lineChart.resize();
    });
  };

  return (
    <div>
      <LinechartWrapper>
        <div id="linechart-demanda" style={{ width: '100%', height: '100%' }} />
      </LinechartWrapper>

      <TelemetryChartsLegend telemetryData={telemetryData} />
    </div>
  );
};
