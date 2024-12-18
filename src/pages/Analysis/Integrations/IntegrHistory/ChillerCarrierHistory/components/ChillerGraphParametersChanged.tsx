import { useContext, useEffect, useRef } from 'react';
import { ContainerGraphParamsChange } from './styles';
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

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LineChart,
  SVGRenderer,
  UniversalTransition,
]);

type TGenerateGraphsPercentGeralAlarmMaintaince = {
  arrayData: ({ value: string; name: string; color: string; unidMed?: string; type?: string; data: number[]; } | undefined)[],
  name: string,
  yAxisNames?: string[],
  title?: string,
  height: number,
  getDate: (index: number) => string,
  driId?: string,
  xAxis: {},
  groupGraph: boolean,
  toolbox: boolean,
  lengthArraySample?: number
}

export function GenerateGraphGeralAlarmMaintaince({
  arrayData, name, yAxisNames, title, height, getDate, driId, xAxis, groupGraph, toolbox, lengthArraySample,
}: Readonly<TGenerateGraphsPercentGeralAlarmMaintaince>) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { menuToogle } = useContext(MenuContext);
  function formatterTooltip(value) {
    const tooltipContentFactory: string[] = [];
    const nameChiller = `<strong>${driId}</strong>`;
    const date = getDate(value[0].dataIndex);
    tooltipContentFactory.push(date, nameChiller, ' ');
    const arrayNames: string[] = [];
    for (const v1 of value) {
      if (!v1.value && v1.value !== 0) {
        return '';
      }
      const style = getBallColor(yAxisNames?.[v1.value]);
      const type = `<div class="containerCircle" style="margin: 0;"><div class=${style?.class} style="${style?.style}"></div><span>${yAxisNames![v1.value]}</span></div>`;
      const titleName = `<span><strong>${groupGraph || title === t('status_compressores') ? v1.seriesName : title}</strong></span>`;
      arrayNames.push(titleName, type);
    }
    tooltipContentFactory.push(...arrayNames);
    return tooltipContentFactory.join('<br />');
  }
  function getBallColor(name) {
    if (name === t('emAlarme') || name === t('desligadoMinusculo')) return { class: 'circleRed', style: 'background: #FF1818;' };
    if (name === t('semAlarmes') || name === t('emFuncionamento')) return { class: 'circleGreen', style: 'background: #4EB73B;' };
    if (name === t('emAlerta')) return { class: 'circleYellow', style: 'background: #EDA800' };
  }

  function yAxisDecide() {
    return {
      type: 'category',
      boundaryGap: false,
      data: yAxisNames,
      axisLabel: {
        align: 'left',
        fontSize: 10,
        margin: 2,
        padding: 10,
      },
      offset: 120,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
    };
  }

  function verifyNullOrSum(item, sum) {
    if (item == null) {
      return null;
    }
    return item + sum;
  }

  function formatterDataIfGroupGraph(item) {
    let data = item.data;
    if (groupGraph && item.data) {
      if (item.value === 'alarme') {
        data = item.data.map((item) => verifyNullOrSum(item, 11));
      }
      if (item.value === 'geral') {
        data = item.data.map((item) => verifyNullOrSum(item, 15));
      }
      if (item.value === 'CP_B1' || item.value === 'CP_B2' || item.value === 'CP_A2' || item.value === 'CP_A1') {
        data = item.data.map((item) => verifyNullOrSum(item, 18));
      }
      if (item.value === 'status') {
        data = item.data;
      }
    }
    return {
      name: item.name,
      color: item.color,
      type: 'line',
      stack: item.name,
      step: 'start',
      symbolSize: 0,
      data,
    };
  }

  function haveTitle() {
    if (title) {
      return {
        title: {
          text: title,
          padding: [15, 0, 0, 10],
          textStyle: {
            color: 'black',
            fontSize: 15,
          },
        },
      };
    }
  }

  const handleRenderChiller = () => {
    if (chartRef.current) {
      echarts.dispose(chartRef.current);
      const chartInstance = echarts.init(chartRef.current);
      const newSeries = (arrayData || []).map((item) => formatterDataIfGroupGraph(item));
      window.addEventListener('resize', () => {
        chartInstance.resize();
      });
      const chillerConfig = {
        ...haveTitle(),
        grid: {
          left: groupGraph ? '9px' : '15px',
          bottom: '20%',
          width: '90%',
          containLabel: true,
        },
        ...haveToolbox(toolbox),
        tooltip: {
          trigger: 'axis',
          formatter: (value) => formatterTooltip(value),
          padding: [20, 90, 20, 30],
          textStyle: {
            width: 400,
          },
        },
        xAxis,
        yAxis: yAxisDecide(),
        series: newSeries,
      };
      chillerConfig && chartInstance.setOption(chillerConfig);
      chartInstance.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'dataZoomSelect',
        dataZoomSelectActive: true,
      });
      chartInstance.group = 'group2';
      zoomTooltipOff(chartInstance, 'group2');
      window.removeEventListener('resize', () => {
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
          <ContainerGraphParamsChange
            groupGraph={groupGraph}
            lengthArraySample={lengthArraySample}
            id={name}
            ref={chartRef}
            style={{
              height, width: groupGraph ? '95%' : '97%', marginBottom: '10px', marginTop: (lengthArraySample && lengthArraySample > 0 && groupGraph) ? '0px' : '30px',
            }}
          />
        )
      }
    </>
  );
}
