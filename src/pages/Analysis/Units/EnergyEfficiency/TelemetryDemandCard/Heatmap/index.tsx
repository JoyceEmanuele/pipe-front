import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
} from 'echarts/components';
import { HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

import i18n from '~/i18n';
import {
  HeatmapWrapper,
} from './styles';

import { ApiResps } from '~/providers';
import { convertEnergy } from '~/helpers';
import { TelemetryChartsLegend } from '~/components';

import {
  getDay, getDate, format, getHours, addHours,
// eslint-disable-next-line import/no-duplicates
} from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { ptBR, enUS } from 'date-fns/locale';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  HeatmapChart,
  CanvasRenderer,
]);

interface HeatmapProps {
  telemetryData: ApiResps['/energy/get-demand-hist'],
  handleClick: (name: echarts.ECElementEvent) => void
  startDate: string,
  endDate: string
}

export const Heatmap: React.FC<HeatmapProps> = ({
  telemetryData, handleClick, startDate, endDate,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const daysOfWeek = {
    0: t('diasDaSemana.domingo'),
    1: t('diasDaSemana.segunda'),
    2: t('diasDaSemana.terca'),
    3: t('diasDaSemana.quarta'),
    4: t('diasDaSemana.quinta'),
    5: t('diasDaSemana.sexta'),
    6: t('diasDaSemana.sabado'),
  };

  useEffect(() => {
    const xAxis = handlePrepareXAxis(startDate, endDate);
    const yAxis = handlePrepareYAxis();
    const heatmapData = telemetryData.demands && telemetryData.demands.length > 0
      ? handlePrepareData(telemetryData.demands, xAxis)
      : [];

    handleRenderHeatmap(xAxis, yAxis, heatmapData);
  }, [telemetryData]);

  // prepares
  const handlePrepareXAxis = (startDateTimestamp, endDateTimestamp) => {
    const startDate = new Date(startDateTimestamp);
    const endDate = new Date(endDateTimestamp);

    const arrOfDates: Date[] = [];
    const controlDate = new Date(startDate);

    while (controlDate.getTime() <= endDate.getTime()) {
      controlDate.setDate(controlDate.getDate() + 1);
      arrOfDates.push(new Date(controlDate));
    }

    return arrOfDates;
  };

  const handlePrepareYAxis = () => Array.from({ length: 24 }, (_, index) => index);

  const handlePrepareData = (data, xAxis: Date[]) => {
    const formattedData: { timestamp: string; value: number }[] = [];

    data.forEach((item) => {
      const index = formattedData.findIndex(
        (prData: { timestamp: string; value: number }) => {
          const isSameHour = getHours(new Date(prData.timestamp)) === getHours(new Date(item.record_date));
          const isSameDay = getDate(new Date(prData.timestamp)) === getDate(new Date(item.record_date));

          return isSameHour && isSameDay;
        },
      );

      const avg_demand = Number(item.average_demand) || 0;

      if (index < 0) {
        formattedData.push({
          timestamp: item.record_date,
          value: avg_demand,
        });

        return;
      }

      formattedData[index] = {
        timestamp: formattedData[index].timestamp,
        value: formattedData[index].value + avg_demand,
      };
    });

    return formattedData.map((item) => {
      const time = moment(item.timestamp);
      const xIndex = xAxis.findIndex((date) => format(date, 'yyyy-MM-dd') === time.format('YYYY-MM-DD'));

      if (xIndex === -1) return null;
      return [xIndex, time.hours(), item.value || '-'];
    });
  };

  // formatters
  const xAxisFormatter = (value) => {
    const date = new Date(value);
    let monthDay: string | number = getDate(date);
    const weekDay = getDay(date);

    if (monthDay < 10) monthDay = `0${monthDay}`;

    if (weekDay === 0) return `{bold|${monthDay}\n${daysOfWeek[weekDay][0]}}`;

    return `${monthDay}\n${daysOfWeek[weekDay][0]}`;
  };

  const yAxisFormatter = (value) => {
    if (value === '23') return '24:00h';

    return `${value}:00h`;
  };

  const visualMapFormatter = (value) => {
    const [valueDemandConverted, valueDemandUnitMeasurement] = convertEnergy(Number(value) || 0);

    return `${formatNumberWithFractionDigits(valueDemandConverted.toFixed(1))}${valueDemandUnitMeasurement}`;
  };

  const tooltipFormatter = (value) => {
    if (!telemetryData.demands) return '';

    const date = new Date(value.name);
    const valueDemand = value.data[2];
    const valueHour = value.data[1];

    const stringDate = `${format(date, 'EEE - dd/LLL', { locale: i18n.language === 'pt' ? ptBR : enUS }).replace(/\b[a-z]/, (match) => match.toUpperCase())}`;
    const stringHour = `${valueHour}:00 - ${valueHour !== '24' ? Number(valueHour) + 1 : '00'}:00h`;
    let stringMax = `<strong>${t('max')}:</strong> `;
    let stringAvg = `<strong>${t('media')}:</strong> `;
    let stringMin = `<strong>${t('min')}:</strong> `;

    if (telemetryData.demands.length >= 1) {
      const [maxValueDemandConverted, maxValueDemandUnitMeasurement] = convertEnergy(Number(telemetryData.demands[value.dataIndex].max_demand) ?? 0);
      const [medValueDemandConverted, medValueDemandUnitMeasurement] = convertEnergy(Number(valueDemand) ?? 0);
      const [minValueDemandConverted, minValueDemandUnitMeasurement] = convertEnergy(Number(telemetryData.demands[value.dataIndex].min_demand) ?? 0);

      stringMax += `${maxValueDemandConverted === 0 ? formatNumberWithFractionDigits(maxValueDemandConverted.toFixed()) : formatNumberWithFractionDigits(maxValueDemandConverted.toFixed(1))}${maxValueDemandUnitMeasurement}`;
      stringAvg += `${medValueDemandConverted === 0 ? formatNumberWithFractionDigits(medValueDemandConverted.toFixed()) : formatNumberWithFractionDigits(medValueDemandConverted.toFixed(1))}${medValueDemandUnitMeasurement}`;
      stringMin += `${minValueDemandConverted === 0 ? formatNumberWithFractionDigits(minValueDemandConverted.toFixed()) : formatNumberWithFractionDigits(minValueDemandConverted.toFixed(1))}${minValueDemandUnitMeasurement}`;
    }

    const tooltipContentFactory = [stringDate, stringHour, stringMax, stringAvg, stringMin];

    return tooltipContentFactory.join('<br />');
  };

  // plot heatmap
  const handleRenderHeatmap = (xAxis, yAxis, heatmapData) => {
    const heatmapDom = document.getElementById('heatmap-demanda');

    const heatmapChart = echarts.init(heatmapDom);

    window.addEventListener('resize', () => {
      heatmapChart.resize();
    });

    heatmapChart.on('click', 'series.heatmap', handleClick);

    const heatmapConfig = {
      grid: {
        height: '70%',
        width: '95%',
        top: '15%',
        left: '5%',
        show: true,
        backgroundColor: 'rgba(196, 196, 196, 0.10)',
        borderColor: 'rgba(196, 196, 196, 0.10)',
      },
      yAxis: {
        type: 'category',
        data: yAxis,
        splitArea: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          margin: 10,
          interval: 5,
          showMaxLabel: true,
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '10.5',
          formatter: yAxisFormatter,
        },
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        splitArea: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          margin: 15,
          interval: 0,
          showMaxLabel: true,
          showMinLabel: true,
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '10.5',
          rich: {
            bold: {
              fontWeight: 600,
              color: '#000',
              fontFamily: 'Inter',
              fontSize: '10.5',
            },
          },
          formatter: xAxisFormatter,
        },
      },
      series: [
        {
          name: 'Punch Card',
          type: 'heatmap',
          data: heatmapData || [],
          label: { show: false },
          emphasis: { show: false },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 0.5,
          },
          tooltip: {
            borderColor: 'rgba(0, 0, 0, 0.19)',
            textStyle: {
              color: '#000',
              fontFamily: 'Inter',
              fontSize: '11',
            },
            formatter: tooltipFormatter,
          },
        },
      ],
      visualMap: {
        min: 0,
        max: telemetryData?.max_demand?.value ?? 0,
        calculable: true,
        orient: 'horizontal',
        align: 'right',
        left: 'right',
        top: 'top',
        itemWidth: 10,
        textStyle: {
          color: '#000',
          fontFamily: 'Inter',
          fontSize: 9,
          fontStyle: 'normal',
          fontWeight: 400,
        },
        formatter: visualMapFormatter,
      },
      tooltip: {
        position: 'top',
      },
      gradientColor: ['#B2E1B9', '#5AB365'],
    };

    heatmapConfig && heatmapChart.setOption(heatmapConfig);

    window.removeEventListener('resize', () => {
      heatmapChart.resize();
    });
  };

  return (
    <div>
      <HeatmapWrapper>
        <div id="heatmap-demanda" style={{ width: '100%', height: '100%' }} />
      </HeatmapWrapper>

      <TelemetryChartsLegend telemetryData={telemetryData} />
    </div>
  );
};
