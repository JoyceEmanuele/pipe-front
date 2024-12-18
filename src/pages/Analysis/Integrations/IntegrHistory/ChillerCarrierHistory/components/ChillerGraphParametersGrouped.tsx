import { useContext, useEffect, useRef } from 'react';
import {
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { t } from 'i18next';
import { haveToolbox, zoomTooltipOff } from './ChillerParameters';
import MenuContext from '~/contexts/menuContext';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LineChart,
  SVGRenderer,
  UniversalTransition,
]);

interface TooltipParams {
  name: string; // Nome da categoria
  value: number; // Valor do ponto de dados
  seriesName: string; // Nome da série
  seriesType: string; // Tipo da série
  dataIndex: number; // Índice do ponto de dados
  color: string; // Cor da série
}

export function GenerateGraphSample({
  arrayData, name, xAxis, title, haveTitle, driId, getDate, groupGraph, isLoading, countUniMed, maxValue, toolbox,
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { menuToogle } = useContext(MenuContext);
  let objectData;
  function verifyIndexY(item) {
    if (item === 'H') return 0;
    if (item === 'C') return 1;
    if (item === 'kPa') return 3;
    if (item === 'A') return 2;
    if (item === 's') return 4;
    if (item === 'P' && groupGraph) return 5;
    return 0;
  }

  function returnWitchUniMedHave() {
    const haveCelcius = countUniMed.C > 0;
    const haveHour = countUniMed.H > 0;
    const haveKpa = countUniMed.kPa > 0;
    const haveAmper = countUniMed.A > 0;
    const havePercent = countUniMed.P > 0;
    const haveSeconds = countUniMed.s > 0;
    return {
      haveCelcius, haveAmper, haveHour, haveKpa, havePercent, haveSeconds,
    };
  }

  function formatLabel(value: any, unit: string) {
    const numberValue = parseFloat(value);

    if (!Number.isNaN(numberValue)) {
      const formattedNumber = formatNumberWithFractionDigits(value);
      return `${formattedNumber} ${unit}`;
    }

    return `${value}`;
  }

  const generateAxisConfig = (name: string, maxValue: number, unit: string, fontSize: number, align: string, offset: number, position: string, textAlign?: string) => ({
    type: 'value',
    name: name ? `${name}(${unit})` : '',
    max: name ? Math.ceil(maxValue) : 0,
    splitNumber: 5,
    minInterval: name ? Math.ceil(maxValue / 5) : 0,
    position,
    offset,
    axisLabel: {
      formatter: (value) => (name ? formatLabel(value, unit) : ''),
      align,
      fontSize,
    },
    nameTextStyle: {
      fontWeight: 'bolder',
      align: textAlign || 'center',
      color: 'black',
      fontSize: 11,
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
      },
    },
  });

  const generateCleanConfig = (quantEspaco: number, position) => ({
    type: 'value',
    min: 0,
    max: 100,
    position,
    axisLabel: {
      formatter: `${' '.repeat(quantEspaco)}`,
      align: 'center',
    },
    offset: 20,
    axisLine: { show: false },
    axisTick: { show: false },
  });

  function returnSide(condition) {
    if (condition) {
      return 'left';
    }
    return 'right';
  }

  function returnOffsetHour(haveHour, haveCelcius) {
    if (haveHour && !haveCelcius) {
      return 20;
    }
    return 60;
  }

  function returnOffsetAmper(haveAmper) {
    if (haveAmper && countUniMed.A > 0 && countUniMed.kPa === 0) {
      return 30;
    }
    return 95;
  }

  function returnGraphNotPorcent() {
    const {
      haveCelcius, haveHour, haveKpa, haveAmper, haveSeconds,
    } = returnWitchUniMedHave();
    const haveOnlyLeftKpa = (!(haveHour || haveSeconds) && !haveCelcius);
    const haveOnlyLeftAmper = (!(haveHour || haveSeconds) && !haveCelcius);
    const decideSideAmper = returnSide(haveOnlyLeftAmper);
    const decideSideKpa = returnSide(haveOnlyLeftKpa);
    const decideSide = haveCelcius && !(haveHour || haveSeconds) ? 'left' : 'right';
    const decideSideCelcius = (haveHour || haveSeconds) && !haveCelcius ? 'left' : 'right';
    const yAxisNotPorcent = [
      haveHour ? generateAxisConfig('Horas', maxValue.H, 'h', 10, 'right', returnOffsetHour(haveHour, haveCelcius), 'left', 'right') : generateCleanConfig(9, decideSide),
      haveCelcius ? generateAxisConfig('Temp.', maxValue.C, '°C', 10, 'center', 30, 'left') : generateCleanConfig(8, decideSideCelcius),
      haveAmper ? generateAxisConfig('Corren.', maxValue.A, 'A', 10, decideSideAmper, returnOffsetAmper(haveAmper), decideSideAmper) : generateCleanConfig(9, decideSideAmper),
      haveKpa ? generateAxisConfig('Press.', maxValue.kPa, 'kPa', 10, 'center', 30, decideSideKpa) : generateCleanConfig(8, decideSideKpa),
      haveSeconds ? generateAxisConfig('Seg.', maxValue.s + 20, 's', 10, 'right', returnOffsetHour(haveSeconds, haveCelcius), 'left', 'right') : generateCleanConfig(9, decideSide),
    ] as any;
    return yAxisNotPorcent;
  }
  function yAxisDecide() {
    if (title === t('porcentagens')) {
      return [
        {
          type: 'value',
          min: 0,
          max: 100,
          position: 'left',
          axisLabel: {
            formatter: '{value} %',
            align: 'center',
            fontSize: 10,
          },
          nameTextStyle: {
            fontWeight: 'bolder',
            align: 'center',
            color: 'black',
          },
          offset: 20,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        generateCleanConfig(32, 'right'),
      ];
    }
    const yAxisNotPorcent = returnGraphNotPorcent();
    const {
      havePercent, haveAmper, haveKpa,
    } = returnWitchUniMedHave();
    if (groupGraph && havePercent) {
      yAxisNotPorcent.push({
        type: 'value',
        name: 'Porcen.(%)',
        min: 0,
        max: 100,
        position: 'right',
        offset: haveKpa && haveAmper ? 155 : (haveKpa || haveAmper ? 90 : 30),
        axisLabel: {
          formatter: '{value} %',
          align: 'center',
          fontSize: 11,
          padding: [0, 0, 0, 0],
        },
        nameTextStyle: {
          fontWeight: 'bolder',
          align: 'center',
          color: 'black',
          fontSize: 11,
          padding: [0, 0, 0, 10],
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      });
    }
    return yAxisNotPorcent;
  }

  function getTitle() {
    if (title && haveTitle) {
      return {
        title: {
          text: title,
          padding: [0, 0, 0, 10],
          textStyle: {
            color: 'black',
            fontSize: 15,
          },
        },
      };
    }
  }

  function formatUnidMed(item) {
    let uniMed = objectData[item.seriesName]?.unidMed;
    if (uniMed === 'P') uniMed = '%';
    if (uniMed === 'C') uniMed = '°C';
    if (uniMed === 'H') uniMed = 'h';
    return uniMed;
  }

  function formatterTooltip(value: TooltipParams[]) {
    const nameChiller = `<strong>${driId}</strong>`;
    // const type = `<div class="containerCircle"><p>${}</p><div class="circle" style="${}"/></div>`;
    const date = getDate(value[0].dataIndex);
    const arrayA = [`<strong>${t('circuitoA')}</strong>`];
    const arrayB = [`<strong>${t('circuitoB')}</strong>`];
    const arrayC = [`<strong>${t('circuitoC')}</strong>`];
    const values = [`<strong>${title || t('geral')}</strong>`];

    if (value.every((x) => x?.value == null)) return '';

    for (const item of value) {
      if (item.value == null) {
        continue;
      }
      const dataObject = objectData[item.seriesName];
      const newSeriesName = item.seriesName.replace('do circ. A', '').replace('do circ. B', '').replace('do circuito B', '').replace('do circuito A', '');
      const uniMed = formatUnidMed(item);
      const cssObject = `<span style="color: ${item.color}">${newSeriesName}: </span><span style="color: 'black'">${formatNumberWithFractionDigits(Number(item.value).toFixed(uniMed === 'h' ? 0 : 1))}${uniMed}</span>`;
      if (dataObject && dataObject.type === 'A') {
        arrayA.push(cssObject);
      }
      else if (dataObject && dataObject.type === 'B') {
        arrayB.push(cssObject);
      } else if (dataObject && dataObject.type === 'C') {
        arrayC.push(cssObject);
      }
      else {
        values.push(cssObject);
      }
    }
    const tooltipContentFactory = [date, nameChiller, ''];
    if (values.length > 1) {
      tooltipContentFactory.push(...values, '');
    }
    if (arrayA.length > 1) {
      tooltipContentFactory.push(...arrayA, '');
    }
    if (arrayB.length > 1) {
      tooltipContentFactory.push(...arrayB);
    }
    if (arrayC.length > 1) {
      tooltipContentFactory.push(...arrayC);
    }
    return tooltipContentFactory.join('<br />');
  }

  const handleRenderChiller = () => {
    if (chartRef.current) {
      echarts.dispose(chartRef.current);
      const chartInstance = echarts.init(chartRef.current);
      if (isLoading) {
        chartInstance.showLoading();
      }
      const seriesData = (arrayData || []).map((item) => (
        {
          name: item.name,
          color: item.color,
          type: 'line',
          stack: item.name,
          smooth: true,
          data: item.data,
          symbolSize: 0,
          yAxisIndex: verifyIndexY(item.unidMed),
        }
      ));
      window.addEventListener('resize', () => {
        chartInstance.resize();
      });
      chartInstance.setOption({
        ...getTitle(),
        ...haveToolbox(toolbox, true),
        grid: {
          left: title === t('porcentagens') ? '91px' : '50px',
          top: '70px',
          bottom: '10%',
          width: '90%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          formatter: (value) => formatterTooltip(value),
          padding: 20,
        },
        xAxis,
        yAxis: yAxisDecide(),
        series: seriesData,
      });
      chartInstance.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'dataZoomSelect',
        dataZoomSelectActive: true,
      });
      chartInstance.group = 'group1';
      const newObjectData = {};
      arrayData.forEach((item) => {
        newObjectData[item.name] = { ...item };
      });
      objectData = newObjectData;
      chartInstance.hideLoading();
      zoomTooltipOff(chartInstance, 'group1');
      window.addEventListener('resize', () => {
        chartInstance.resize();
      });
    }
  };

  useEffect(() => {
    handleRenderChiller();
  }, [arrayData, menuToogle]);

  return (
    <>
      {
        arrayData.length > 0 && (
          <div id={name} ref={chartRef} style={{ width: '100%', height: '450px', marginBottom: '40px' }} />
        )
      }
    </>
  );
}
