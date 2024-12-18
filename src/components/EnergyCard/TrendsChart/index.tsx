import { useContext, useEffect } from 'react';
import { getArrayDaysOfMonth } from '~/helpers/getArrayDaysOfMonth';
import { t } from 'i18next';

import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { useCard } from '~/contexts/CardContext';
import {
  BarchartWrapper,
  CheckboxLine,
  DeltaInfo,
  TrendsFooter,
  TrendsFooterData,
} from './styles';
import { Checkbox } from '~/components/Checkbox';
import { useStateVar } from '~/helpers/useStateVar';
import MenuContext from '~/contexts/menuContext';
import { useEnergyCard } from '../EnergyCardContext';
import moment from 'moment';
import { convertEnergy } from '~/helpers';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

interface TrendsChartProps {
  trendChartData: any;
  consumptionChartStyle?: React.CSSProperties;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  trendChartData,
  consumptionChartStyle,
}) => {
  const { menuToogle } = useContext(MenuContext);
  const { cards } = useCard();
  const energyCard = cards.find((card) => card.title === 'Energia');
  const { cardDate } = useEnergyCard();

  const [state, render] = useStateVar({
    showConsumptionPredict: true,
  });

  const formatterTooltip = (values) => {
    const dayChart = values[0].name;

    const trendDay = trendChartData.trendsData.find(
      (trend) => moment(trend.time).format('D/MMMM/YYYY')
        === `${dayChart}/${cardDate.month}/${cardDate.year}`,
    );

    if (!trendDay) return '';

    const isAfterOrSameActualDate = moment(trendDay.time).startOf('day').isSameOrAfter(moment().startOf('day'));

    let labelConsumption = '';
    let valueConsumption = 0;

    if (isAfterOrSameActualDate) {
      labelConsumption = t('consumoProjetadoMin');
      valueConsumption = trendDay.consumptionForecast;
    } else {
      labelConsumption = t('consumido');
      valueConsumption = trendDay.lastConsumption;
    }

    let previousTrendDay: any = null;

    if (dayChart > 1) {
      previousTrendDay = trendChartData.trendsData.find(
        (trend) => moment(trend.time).format('D/MMMM/YYYY')
          === `${dayChart - 1}/${cardDate.month}/${cardDate.year}`,
      );
    }

    const consumptionDay = trendDay.consumption !== '0' && previousTrendDay ? Number(trendDay.consumption) - Number(previousTrendDay.consumption) : Number(trendDay.consumption);
    const numberConsuptionPercentageFixed = Number(trendDay.consumptionPercentage).toFixed();
    const redPercentage = Number(numberConsuptionPercentageFixed) > 100;
    const element = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 12px; font-family: Inter; font-weight: 400px; color: #000000;">${dayChart}/${moment(cardDate.month, 'MMMM').format('M')}/${cardDate.year}</span>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; gap: 4px;">
            <span style="font-size: 12px; font-family: Inter; font-weight: 700px; color: #000000;"><strong>${t('consumoDoDia')}:</strong></span>
            <span style="font-size: 12px; font-family: Inter; font-weight: 400px; color: #000000;"> ${formatterAux(consumptionDay)}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <span style="font-size: 12px; font-family: Inter; font-weight: 700px; color: #000000;"><strong>${t('meta')}:</strong></span>
            <span style="font-size: 12px; font-family: Inter; font-weight: 400px; color: #000000;"> ${formatterAux(trendDay.consumptionTarget)}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <span style="font-size: 12px; font-family: Inter; font-weight: 700px; color: #000000;"><strong>${labelConsumption}:</strong></span>
            <span style="font-size: 12px; font-family: Inter; font-weight: 400px; color: #000000;"> ${formatterAux(valueConsumption)}</span>
            <div>
             <span style="font-size: 12px; font-family: Inter; font-weight: 400px; color: ${redPercentage ? '#E00030' : '#5AB365'} ">${numberConsuptionPercentageFixed}%</span>

            </div>
          </div>
        </div>
      </div>
    `;

    return element;
  };

  function formatterAux(value) {
    if (!value || value === '0') {
      return '-';
    }

    return ` ${formatterNumbers(value)[0]}${formatterNumbers(value)[1]}h`;
  }

  const xAxisFactory = getArrayDaysOfMonth(
    Number(moment().month(cardDate.month).format('M')),
    Number(cardDate.year),
  );

  const xAxisFormatterFactory = (value) => value;

  const yAxisFormatter = (value) => {
    const [valueDemandConverted, valueDemandUnitMeasurement] = convertEnergy(value);

    return `${formatNumberWithFractionDigits(
      valueDemandConverted,
    )} ${valueDemandUnitMeasurement}h`;
  };

  const formatterNumbers = (value) => {
    if (!value) {
      return ['-', 'kW'];
    }

    const [valueDemandConverted, valueDemandUnitMeasurement] = convertEnergy(value);

    return [formatNumberWithFractionDigits(valueDemandConverted, { minimum: 0, maximum: 2 }), valueDemandUnitMeasurement];
  };

  const barWidthFactory = {
    isExpanded: '22px',
    isNotExpanded: '10px',
  };

  const formatterSeries = () => {
    const trendsFormatted = {
      consumption: [] as any[],
      consumptionForecastGraphic: [] as any[],
      consumptionOverTarget: [] as any[],
      consumptionTarget: [] as any[],
      consumptionTotal: [] as any[],
    };

    const actualDate = moment().startOf('day');
    let lastConsumption = 0;

    trendChartData.trendsData.forEach((trend) => {
      const isOverTarget = Number(trend.consumptionOverTarget) > 0;
      const showForecastBar = trend.consumption === '0';
      const trendConsumption = trend.consumption;
      const isBeforeActualDate = moment(trend.time).startOf('day').isBefore(actualDate);

      if (lastConsumption === 0 || trend.consumption !== '0') {
        lastConsumption = Number(trend.consumption);
      }

      trend.lastConsumption = lastConsumption;

      if (isOverTarget) {
        trendsFormatted.consumption.push({
          value: Number(trendConsumption) - Number(trend.consumptionOverTarget),
          itemStyle: {
            color: '#92CC9A',
            borderRadius: [0, 0, 0, 0],
            padding: [0, 20, 0, 0],
          },
        });
      }
      else {
        trendsFormatted.consumption.push({
          value: Number(trendConsumption),
          itemStyle: {
            color: '#92CC9A',
            borderRadius: [5, 5, 0, 0],
            padding: [0, 20, 0, 0],
          },
        });
      }

      trendsFormatted.consumptionOverTarget.push(Number(trend.consumptionOverTarget));

      if (showForecastBar && !isBeforeActualDate) {
        trendsFormatted.consumptionForecastGraphic.push(Number(trend.consumptionForecast) - Number(trend.consumption));
      } else {
        trendsFormatted.consumptionForecastGraphic.push(0);
      }

      trendsFormatted.consumptionTarget.push(Number(trend.consumptionTarget));
    });

    const series = [
      {
        data: trendsFormatted.consumption,
        type: 'bar',
        stack: 'consumption',
        name: 'consumption',
        barWidth:
          barWidthFactory[
            energyCard?.isExpanded ? 'isExpanded' : 'isNotExpanded'
          ],
      },
      {
        data: trendsFormatted.consumptionOverTarget,
        type: 'bar',
        stack: 'consumption',
        stackStrategy: 'all',
        name: 'overConsumption',
        itemStyle: {
          color: '#E00030',
          borderRadius: [5, 5, 0, 0],
          padding: [0, 20, 0, 0],
        },
        barWidth:
          barWidthFactory[
            energyCard?.isExpanded ? 'isExpanded' : 'isNotExpanded'
          ],
      },
      state.showConsumptionPredict && {
        data: trendsFormatted.consumptionForecastGraphic,
        type: 'bar',
        stack: 'consumption',
        stackStrategy: 'all',
        name: 'forecastConsumption',
        itemStyle: {
          color: '#D3D3D3',
          borderRadius: [5, 5, 0, 0],
          padding: [0, 20, 0, 0],
        },
        barWidth:
          barWidthFactory[
            energyCard?.isExpanded ? 'isExpanded' : 'isNotExpanded'
          ],
      },
      trendChartData.monthlyTarget && {
        name: 'targetConsumption',
        type: 'line',
        data: trendsFormatted.consumptionTarget,
        itemStyle: {
          opacity: 0,
        },
        lineStyle: {
          width: 1.5,
          type: 'dashed',
          color: '#363BC4',
        },
      },
    ].filter(Boolean);

    return series;
  };

  const formatterBackground = () => {
    const highlightBackgroundColor = '#F6F6F6';
    const backgroundColor = '#FFFFFF';

    const backgroundArray: string[] = [];

    Array.from({ length: 7 }).forEach((_, index) => {
      const date = moment(
        `${index + 1} ${cardDate.month} ${cardDate.year}`,
        'D MMMM YYYY',
      );

      if (date.day() === 0) {
        backgroundArray.push(highlightBackgroundColor);
      } else {
        backgroundArray.push(backgroundColor);
      }
    });

    return backgroundArray;
  };

  const handleRenderBarchart = () => {
    const barchartDom = document.getElementById('barchart-trend');

    if (!barchartDom) return;

    echarts.dispose(barchartDom);
    const barChart = echarts.init(barchartDom);

    window.addEventListener('resize', () => {
      barChart.resize();
    });

    const barchartOptions = {
      tooltip: {
        trigger: 'axis',
        formatter: formatterTooltip,
        axisPointer: {
          type: 'shadow',
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
      xAxis: {
        type: 'category',
        data: xAxisFactory,
        boundaryGap: false,
        splitLine: {
          show: true,
          interval: 0,
          lineStyle: {
            type: 'dashed',
          },
        },
        axisLabel: {
          show: true,
          align: 'center',
          margin: 8,
          showMaxLabel: true,
          interval: energyCard?.isExpanded
            ? 0
            : (index: number) => {
              if (index === 0) return true;

              return (index + 1) % 5 === 0;
            },
          color: '#000',
          fontFamily: 'Inter',
          fontSize: '10',
          lineHeight: 12,
          rich: {
            bold: {
              fontWeight: 600,
              color: '#000',
              fontFamily: 'Inter',
              fontSize: '10',
            },
          },
          formatter: xAxisFormatterFactory,
        },
        splitArea: {
          show: true,
          interval: 0,
          areaStyle: {
            color: formatterBackground(),
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
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
            show: true,
            interval: 0,
            lineStyle: {
              type: 'dashed',
            },
          },
        },
      ],
      series: formatterSeries(),
    };

    barchartOptions && barChart.setOption(barchartOptions);

    window.removeEventListener('resize', () => {
      barChart.resize();
    });
  };

  useEffect(() => {
    trendChartData.trendsData && handleRenderBarchart();
  }, [trendChartData, energyCard?.isExpanded, menuToogle]);

  return (
    <div style={{ padding: '5px 8px 18px', ...consumptionChartStyle }}>
      {
        cardDate.isCurrentMonth && (
          <div style={{ display: 'flex', justifyContent: 'start', margin: '0 2%' }}>
            <CheckboxLine>
              <Checkbox
                checked={state.showConsumptionPredict}
                onClick={() => {
                  state.showConsumptionPredict = !state.showConsumptionPredict;
                  handleRenderBarchart();
                  render();
                }}
                size={15}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{t('previsaoConsumo')}</span>
              </div>
            </CheckboxLine>
          </div>
        )
      }
      <BarchartWrapper>
        <div id="barchart-trend" style={{ width: '100%', height: '100%' }} />
      </BarchartWrapper>
      <TrendsFooter>
        <TrendsFooterData>
          <h2>{cardDate.isCurrentMonth ? t('consumoAtual') : t('consumo')}</h2>
          <DeltaInfo redPercentage={Math.floor(trendChartData.totalConsumtionPercentage) > 100}>
            {Number(trendChartData.totalConsumtionPercentage) ? `${formatNumberWithFractionDigits(Number(trendChartData.totalConsumtionPercentage).toFixed())}%` : ''}
          </DeltaInfo>
          <p>
            {formatterNumbers(trendChartData.totalConsumption)[0]}
            <span>
              {' '}
              {formatterNumbers(trendChartData.totalConsumption)[1]}
              h
            </span>
          </p>
        </TrendsFooterData>
        {
          (cardDate.isCurrentMonth && state.showConsumptionPredict) && (
            <TrendsFooterData>
              <h2>{t('consumoProjetado')}</h2>
              <DeltaInfo redPercentage={Math.floor(trendChartData.monthlyForecastPercentage) > 100}>
                {Number(trendChartData.monthlyForecastPercentage) ? `${Number(trendChartData.monthlyForecastPercentage).toFixed()}%` : ''}
              </DeltaInfo>
              <p>
                {formatterNumbers(trendChartData.monthlyForecast)[0]}
                <span>
                  {' '}
                  {formatterNumbers(trendChartData.monthlyForecast)[1]}
                  h
                </span>
              </p>
            </TrendsFooterData>
          )
        }
        <TrendsFooterData>
          <h2>{t('metaMensal')}</h2>
          <p>
            {formatterNumbers(trendChartData.monthlyTarget)[0]}
            <span>
              {' '}
              {formatterNumbers(trendChartData.monthlyTarget)[1]}
              h
            </span>
          </p>
        </TrendsFooterData>
      </TrendsFooter>
    </div>
  );
};
