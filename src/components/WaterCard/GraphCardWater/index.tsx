import { ContainerCardWater } from '../style';
import {
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import { useContext, useEffect, useRef } from 'react';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { t } from 'i18next';
import { ApiResps } from '~/providers';
import { ICard } from '~/contexts/CardContext';
import { getUserProfile } from '~/helpers/userProfile';
import { INCOERENT_ICON, WARNING_ICON } from '~/components/EnergyCard/EnergyHistory';
import MenuContext from '~/contexts/menuContext';
import i18n from '~/i18n';

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  CanvasRenderer,
  UniversalTransition,
  BarChart,
]);

interface TooltipParams {
  name: string; // Nome da categoria
  value: number; // Valor do ponto de dados
  seriesName: string; // Nome da série
  seriesType: string; // Tipo da série
  dataIndex: number; // Índice do ponto de dados
  color: string; // Cor da série
}
const namesMonths = [t('Jan'), t('Fev'), t('Mar'), t('Abr'), t('Mai'), t('Jun'), t('Jul'), t('Ago'), t('Set'), t('Out'), t('Nov'), t('Dez')];
const completeNameMonths = [t('mesesDoAno.janeiro'), t('mesesDoAno.fevereiro'), t('mesesDoAno.marco'), t('mesesDoAno.abril'), t('mesesDoAno.maio'), t('mesesDoAno.junho'), t('mesesDoAno.julho'), t('mesesDoAno.agosto'), t('mesesDoAno.setembro'), t('mesesDoAno.outubro'), t('mesesDoAno.novembro'), t('mesesDoAno.dezembro')];
const completeNumberMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

export function GenerateGraphWater({
  arrayData, waterCard, isExpanded, unitMeasuere, period, isHistory, last12Months, showForecast, handleClickBar, litersSelected,
} : Readonly<{
  arrayData: ApiResps['/dma/get-consumption-history']['history'],
  waterCard: ICard | undefined,
  isExpanded: boolean | undefined,
  isHistory: boolean,
  unitMeasuere: string,
  period?: string
  last12Months?: boolean
  showForecast?: boolean
  handleClickBar?: (value) => void
  litersSelected?: boolean
}>) {
  const idioma = i18n.language;
  const chartRef = useRef<HTMLDivElement>(null);
  const { menuToogle } = useContext(MenuContext);
  let arrayDataFiltered;
  let xAxisNames;
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;
  const isDesktop = window.matchMedia('(min-width: 426px)');
  const isMobile = !isDesktop.matches;

  const fontOverview = isExpanded ? '12px' : '10px';
  const barOverview = isExpanded ? '30px' : '20px';

  const fontSize = isHistory ? '11px' : fontOverview;
  const barWidth = isMobile ? '12px' : barOverview;
  const barWidthHistory = period === t('semana') ? '30px' : '12px';

  const getConsumptionWater = (consumption: number) => {
    if (!unitMeasuere || unitMeasuere === 'cubic') { return `${formatNumberWithFractionDigits((consumption / 1000).toFixed(2), { minimum: 0, maximum: 2 })}`; }
    if (unitMeasuere === 'liters') { return `${formatNumberWithFractionDigits(consumption, { minimum: 0, maximum: 2 })}`; }
    return '';
  };

  function getDateTooltip(value: TooltipParams[]) {
    if (period) {
      if (period === t('dia')) return `${arrayData[value[0].dataIndex].day?.dayDate}/${completeNumberMonths[arrayData[value[0].dataIndex].month]}/${arrayData[value[0].dataIndex].year} às ${arrayData[value[0].dataIndex].hour}:00h`;
      if (period === t('semana') || period === t('mes') || period === t('flexivel')) return `${arrayData[value[0].dataIndex].day?.dayDate}/${completeNumberMonths[arrayData[value[0].dataIndex].month]}/${arrayData[value[0].dataIndex].year}`;
      if (period === t('ano') && !last12Months) return `${completeNameMonths[arrayData[value[0].dataIndex].month]} ${arrayData[value[0].dataIndex].year}`;
    }
    return `${completeNameMonths[arrayData[value[0].dataIndex].month]} ${arrayData[value[0].dataIndex].year}`;
  }

  function formatterTooltip(value: TooltipParams[]) {
    if (!arrayData[value[0].dataIndex]?.usage && !arrayData[value[0].dataIndex]?.number_devices) {
      return `
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">
        <div style="display: flex; flex-direction: column; gap: 8px; color: #000000;">
          <span style="font-weight: 700; font-size: 12px; font-family: Inter;"><strong>${getDateTooltip(value)}</strong></span>
          <div style="display: flex; gap: 8px;">
            <svg style="margin-top: 4px;" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.085 9.519V7.085M7.085 4.651H7.09109M13.17 7.085C13.17 10.4457 10.4457 13.17 7.085 13.17C3.72435 13.17 1 10.4457 1 7.085C1 3.72435 3.72435 1 7.085 1C10.4457 1 13.17 3.72435 13.17 7.085Z" stroke="#565656" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <span style="font-weight: 700; font-size: 12px; font-family: Inter; color: #565656;">${t('semMonitoramento')}</span>
              <span style="font-weight: 400; font-size: 11px; font-family: Inter; color: #737373;">${t('paraMaisDetalhesHTML')}</span>
            </div>
          </div>
        </div>
      </div>
      `;
    }

    const consumo = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">
      <div style="display: flex; flex-direction: column; gap: 8px; color: #000000;">
        <span style="font-weight: 700; font-size: 12px; font-family: Inter;"><strong>${getDateTooltip(value)}</strong></span>
        <div style="display: flex; gap: 8px;">
          <div style="width: 15px; height: 15px; border-radius: 5px; background-color: ${arrayData[value[0].dataIndex]?.usage < 0 && isAdmin ? '#F3B107' : arrayData[value[0].dataIndex]?.isEstimated ? '#E6E6E6' : '#2D81FF'}; margin-top: 3px;"></div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; font-size: 10px; font-family: Inter;">${arrayData[value[0].dataIndex]?.isEstimated ? t('previsaoConsumo') : t('consumo')}: </span>
            <span style="font-weight: 400; font-size: 11px; font-family: Inter;"><strong>${getConsumptionWater(arrayData[value[0].dataIndex]?.usage || 0)}</strong>${unitMeasuere === 'liters' ? 'L' : 'm³'}</span>
          </div>
        </div>
        ${arrayData[value[0].dataIndex]?.number_devices ? `<span style="font-weight: 400; font-size: 11px; margin-left: 22px;"><strong style="font-weight: 700; font-size: 10px; font-family: Inter;">${t('dispositivosContabilizados')}: </strong>${arrayData[value[0].dataIndex]?.number_devices}</span>` : ''}
      </div>
    </div>
    `;
    const tooltipContentFactory = [consumo];
    return tooltipContentFactory.join('<br />');
  }
  function formatNumber(number: number): string {
    const numberString = number.toFixed(2);
    const formattedNumber = formatNumberWithFractionDigits(numberString, { minimum: 2, maximum: 2 });
    return formattedNumber;
  }
  function handleWeekDay(value?: {
    dayDate: string;
    dayWeek: string;
    dayWeekName: string;
}) {
    if (idioma === 'pt') return value?.dayWeek;
    return value?.dayWeekName.charAt(0).toUpperCase();
  }

  function formatArrayDataFiltered() {
    if (arrayData) {
      if (unitMeasuere === 'liters') {
        arrayDataFiltered = arrayData.map((item) => ({
          value: showForecast || !item.isEstimated
            ? Number(item.usage).toFixed(2)
            : 0,
          isEstimated: item?.isEstimated,
          month: item.month,
        }));
      } else {
        arrayDataFiltered = arrayData.map((item) => ({
          value: showForecast || !item.isEstimated
            ? (Number(item.usage) / 1000)?.toFixed(2)
            : 0,
          isEstimated: item?.isEstimated,
          month: item.month,
        }));
      }
      xAxisNames = arrayData.map((item) => {
        let isProblemData = '';
        if (item.usage < 0) isProblemData = '\n{image|    }';
        if (period) {
          switch (period) {
            case t('dia'): return { value: `${item?.hour}:00${isProblemData}` };
            case t('semana'): return { value: `${item.day?.dayWeek === 'D' ? `{bold|${item.day?.dayDate}}` : item.day?.dayDate}\n${handleWeekDay(item.day)}${isProblemData}` };
            case t('mes'): return { value: `${item.day?.dayWeek === 'D' ? `{bold|${item.day?.dayDate}}` : item.day?.dayDate}\n${handleWeekDay(item.day)}${isProblemData}` };
            case t('ano'): return { value: `${namesMonths[item.month]}\n{bold|${isMobile ? item.year?.toString().slice(-2) : item.year}}${isProblemData}` };
            case t('flexivel'): return { value: `${item.day?.dayWeek === 'D' ? `{bold|${item.day?.dayDate}}` : item.day?.dayDate}\n${handleWeekDay(item.day)}${isProblemData}` };
          }
        }
        return {
          value: `${namesMonths[item.month]}\n{bold|${isMobile ? item.year?.toString().slice(-2) : item.year}}${isProblemData}`,
        };
      });
    } else {
      arrayDataFiltered = [];
    }
  }

  const formatSeriesChart = (item) => {
    const currentMonth = new Date().getMonth();
    if (!item || (!isAdmin && item.value < 0)) {
      return 0;
    }

    if (isAdmin && item.value < 0) {
      return {
        value: item.value,
        itemStyle: {
          color: '#F3B107',
          borderRadius: [0, 0, 5, 5],
        },
      };
    }

    if (item.isEstimated) {
      return {
        value: item.value,
        itemStyle: {
          color: '#E6E6E6',
          borderRadius: [5, 5, 0, 0],
        },
      };
    }

    return item;
  };

  const handleRenderWater = () => {
    formatArrayDataFiltered();
    arrayDataFiltered = arrayDataFiltered.map((item) => formatSeriesChart(item));
    if (chartRef.current) {
      echarts.dispose(chartRef.current);
      const chartInstance = echarts.init(chartRef.current);
      window.addEventListener('resize', () => {
        chartInstance.resize();
      });
      chartInstance.setOption({
        grid: {
          left: '5%',
          right: '5%',
          bottom: '2%',
          width: '90%',
          top: '10%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          formatter: (value) => formatterTooltip(value),
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
        xAxis: [{
          type: 'category',
          data: xAxisNames,
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
            fontSize,
            rich: {
              bold: {
                fontWeight: 'bold',
                color: '#000',
                fontFamily: 'Inter',
                fontSize,
              },
              image: {
                backgroundColor: {
                  image: isAdmin ? WARNING_ICON : INCOERENT_ICON,
                },
              },
            },
          },
          axisLine: { show: false },
          axisTick: { show: false },
        }],
        yAxis: [
          {
            type: 'value',
            ...(litersSelected !== null && {
              name: `${t('consumo')} ${litersSelected ? '(L)' : '(m³)'}`,
              nameLocation: 'end',
              nameTextStyle: {
                fontSize: 9,
                fontFamily: 'Inter',
                fontWeight: 'bold',
                color: '#000',
                padding: [0, litersSelected ? 60 : 40, 0, 0],
              },
            }),
            splitNumber: 5,
            position: 'left',
            axisLabel: {
              formatter: (value) => (`${formatNumber(value)} ${unitMeasuere === 'liters' ? 'L' : 'm³'}`),
              align: 'right',
              fontSize: 9,
              color: '#000',
              fontFamily: 'Inter',
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
        series: period === t('ano') ? [
          {
            type: 'bar',
            cursor: handleClickBar ? 'pointer' : 'default',
            barWidth: isHistory ? barWidthHistory : barWidth,
            data: arrayDataFiltered,
            color: '#2D81FF',
            stack: 'group',
            barCategoryGap: '10%',
            itemStyle: {
              borderRadius: [5, 5, 0, 0],
              padding: [0, 20, 0, 0], // Definindo o raio de borda para o canto superior esquerdo e superior direito
            },
          },
        ] : [
          {
            type: 'bar',
            cursor: handleClickBar && period !== t('dia') ? 'pointer' : 'default',
            barWidth: isHistory ? barWidthHistory : barWidth,
            data: arrayDataFiltered,
            color: '#2D81FF',
            stack: 'group',
            barCategoryGap: '10%',
            itemStyle: {
              borderRadius: [5, 5, 0, 0],
              padding: [0, 20, 0, 0], // Definindo o raio de borda para o canto superior esquerdo e superior direito
            },
          },
        ]
        ,
      });
      chartInstance.on('click', (value) => {
        handleClickBar && handleClickBar(arrayData[value.dataIndex]);
      });

      window.addEventListener('resize', () => {
        chartInstance.resize();
      });
    }
  };

  useEffect(() => {
    handleRenderWater();
  }, [waterCard?.isExpanded, arrayData, isExpanded, menuToogle, unitMeasuere, showForecast]);

  return (
    <ContainerCardWater>
      <div id="card-water" ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ContainerCardWater>
  );
}
