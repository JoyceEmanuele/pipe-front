import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import Plot from 'react-plotly.js';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import {
  Button, Datepicker, Overlay, Loader,
} from '~/components';
import { processReceivedHistoryDAM } from '~/helpers';
import * as axisCalc from '~/helpers/axisCalc';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { ContinuousHistVar, DiscreteHistVar } from '~/helpers/formatArrHistory';
import { useStateVar } from '~/helpers/useStateVar';
import { CloseIcon } from '~/icons';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';
import { AssetLayout } from '~/pages/Analysis/Assets/AssetLayout';
import { useHistory } from 'react-router-dom';
import { apiCall, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '~/helpers/userProfile';
import { NoGraph } from '~/components/NoGraph';
import moment from 'moment';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const DamHistory = (): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ devId }>();
  const history = useHistory();
  const linkBase = history.location.pathname;
  let assetLayout = false;
  assetLayout = linkBase.includes('/ativo');
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaHistorico')}</title>
      </Helmet>
      {!assetLayout ? (<DevLayout devInfo={devInfo} />) : (<AssetLayout devInfo={devInfo} />)}
      <DamHistoryContents onDevInfoUpdate={render} />
    </>
  );
};

export function DamHistoryContents(props: { onDevInfoUpdate?: () => void }): JSX.Element {
  const { onDevInfoUpdate } = props;
  const { t } = useTranslation();
  const routeParams = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      damId: routeParams.devId,
      devInfo: getCachedDevInfoSync(routeParams.devId),
      isModalOpen: false,
      isLoading: false,
      date: null as null|moment.Moment,
      dutRoomName: '' as string,
      damCharts: {} as {
        State?: DiscreteHistVar,
        Mode?: DiscreteHistVar,
        ecoCmd?: DiscreteHistVar,
        humidity?: {
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        } | null
        Temperature?: {
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        Temperature_1?: {
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        limTmin?: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        limTmax?: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        tSetpoint?: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
      },
      dutChart: null as null|{
        temprt: {
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        temprt1: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        limTmin: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        limTmax: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        tSetpoint: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        l1: null | DiscreteHistVar
        tLti: ContinuousHistVar | null;
      },
      dutDuoChartNotAut: null as null|{
        temprt: {
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        temprt1: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        limTmin: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
        limTmax: null|{
          d: { x: number, y?: number|null }[]
          limits: [number, number]
        }
      },
      conclusionsDam: [] as string[],
      dacsCharts: [] as {
        dacId: string
        groupId: string
        potNominal: number
        chartData: DiscreteHistVar
        conclusions: string[]
        stateStats: {
          cond1_hit: number
          cond1_miss: number
          cond2_hit: number
          cond2_miss: number
          ecoFull_hit: number
          noEcoVent_hit: number
        }
        isCond1?: boolean
        isCond2?: boolean
      }[],
      asTable: [] as (number|string)[][],
      dacsCols: [] as string[],
      newCharts: [] as {
        x: string[],
        y: (number|null)[],
        text?: string[],
        type: string,
        mode: string,
        line: {
          color: string,
          width: number,
          dash?: string,
        },
        hovertemplate?: string,
        customdata?: unknown[],
        name?: string,
        visible?: boolean | 'legendonly',
      }[],
      daySched: null as null|{
        type: 'allow' | 'forbid';
        startHM: string;
        endHM: string;
        indexIni: number;
        indexEnd: number;
      },
      axisDataLimits: {} as { minTval?: number, maxTval?: number },
      axisInfo: {
        L1start: null as null|number,
        leftLimits: [-10, 5],
        leftTicks: [-10, 5],
        leftTicksLabels: ['-10', '5'],
        stepTicksNames: {}, // { '-1.1': 'LIGADO' }
        rightLimits: [0, 100],
        rightTicks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        rightTickLabels: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
      },
      graphEnable: {
        State: true,
        Mode: true,
        ecoCmd: true,
        dutT: true,
        dutL1: true,
      },
      profile: getUserProfile(),
    };
    return state;
  });

  function setFormattedDate(date) {
    if (!date) {
      state.date = null;
    } else {
      state.date = date.set({ hour: 0 });
    }
    render();
  }

  async function fetchServerData() {
    try {
      const devInfo = await getCachedDevInfo(state.damId, {});
      if (onDevInfoUpdate) onDevInfoUpdate();
      state.devInfo = devInfo;
      if (devInfo?.dam?.REL_DUT_ID) {
        const dutInfo = await getCachedDevInfo(devInfo?.dam?.REL_DUT_ID, {});
        state.dutRoomName = dutInfo?.dut?.ROOM_NAME ?? 'DUT';
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }
  const getTranslatedInstallationLocation = (str?: string|null) => {
    const opts = {
      'casa-de-maquina': t('casaDeMaquina'),
      'ambiente-refrigerado': t('ambienteRefrigeradoDam'),
    };

    return (str && opts[str]) || `Temperatura do Local de Instalação do ${state.devInfo.DEV_ID}`;
  };

  const getDamTemperatureLabel = () => ((state.devInfo.dam?.PLACEMENT === 'RETURN' || (state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam?.T0_POSITION === 'RETURN')) ? getTranslatedInstallationLocation(state.devInfo?.dam?.INSTALLATION_LOCATION) : t('temperaturaDeInsuflamento'));
  const getDamTemperature1Label = () => (state.devInfo.dam?.T1_POSITION === 'RETURN' ? getTranslatedInstallationLocation(state.devInfo?.dam?.INSTALLATION_LOCATION) : t('temperaturaDeInsuflamento'));

  const getDamTemperatureVisibility = (): boolean | 'legendonly' => (state.devInfo.dam.SELF_REFERENCE ? true : 'legendonly');

  const isBBOrDiel = (): boolean => (state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1);

  const addDamTemperatureLines = (damCharts: typeof state.damCharts) => {
    if (state.devInfo.dam && damCharts.Temperature && (state.devInfo.dam?.PLACEMENT === 'RETURN' || (state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam.T0_POSITION))) {
      if (!((state.devInfo.dam?.PLACEMENT === 'RETURN' || (state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam.T0_POSITION === 'RETURN')) && (state.dutChart?.temprt))) {
        state.newCharts.push({
          name: getDamTemperatureLabel(),
          x: damCharts.Temperature.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: damCharts.Temperature.d.map((item) => item.y!),
          type: 'scatter',
          mode: 'lines',
          visible: getDamTemperatureVisibility(),
          line: { color: colors.Yellow, width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: damCharts.Temperature.d.map((item) => formatNumberWithFractionDigits(item.y!)),
        });
      }
    }
    // FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA
    if (state.devInfo.dam && damCharts.Temperature_1 && state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam.T1_POSITION && isBBOrDiel()) {
      if (!((state.devInfo.dam?.PLACEMENT === 'RETURN' || (state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam.T1_POSITION === 'RETURN')) && (state.dutChart?.temprt))) {
        state.newCharts.push({
          name: getDamTemperature1Label(),
          x: damCharts.Temperature_1.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: damCharts.Temperature_1.d.map((item) => item.y!),
          type: 'scatter',
          mode: 'lines',
          line: { color: colors.Green_v2, width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: damCharts.Temperature_1.d.map((item) => formatNumberWithFractionDigits(item.y!)),
        });
      }
    }
  };

  const addDamDefaultLines = (damCharts: typeof state.damCharts) => {
    if (damCharts.Mode) {
      state.newCharts.push({
        name: 'Mode',
        x: damCharts.Mode.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.Mode.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Red, width: 1 },
        hovertemplate: '%{y}',
      });
    }
    if (damCharts.State) {
      state.newCharts.push({
        name: 'State',
        x: damCharts.State.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.State.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: '#F032E6', width: 1 },
        hovertemplate: '%{y}',
      });
    }
    if (damCharts.ecoCmd) {
      state.newCharts.push({
        name: 'CmdEco',
        x: damCharts.ecoCmd.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.ecoCmd.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Blue300, width: 1 },
        hovertemplate: '%{y}',
      });
    }
    if (damCharts.humidity) {
      state.newCharts.push({
        name: 'Umidade',
        x: damCharts.humidity.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.humidity.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Blue400, width: 1 },
        hovertemplate: '%{customdata} %',
        customdata: damCharts.humidity.d.map((item) => formatNumberWithFractionDigits(item.y!)),
        yaxis: 'y2',
      });
    }
    addDamTemperatureLines(damCharts);
  };

  const addDamSelfReferenceLines = (damCharts: typeof state.damCharts, parsedGraphData: ReturnType<typeof processReceivedHistoryDAM>) => {
    if (damCharts.limTmax) {
      state.newCharts.push({
        name: 'max',
        x: damCharts.limTmax.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.limTmax.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Green, width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: damCharts.limTmax.d.map((item) => formatNumberWithFractionDigits(item.y!)),
      });
    }
    if (damCharts.limTmin) {
      state.newCharts.push({
        name: 'min',
        x: damCharts.limTmin.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.limTmin.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Green, width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: damCharts.limTmin.d.map((item) => formatNumberWithFractionDigits(item.y!)),
      });
    }
    if (damCharts.tSetpoint && (parsedGraphData.setpointHist == null || parsedGraphData.setpointHist.d.length === 0)) {
      state.newCharts.push({
        name: 'setpoint',
        x: damCharts.tSetpoint.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: damCharts.tSetpoint.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { dash: 'dot', color: colors.Green, width: 2 },
        hovertemplate: '%{customdata} °C',
        customdata: damCharts.tSetpoint.d.map((item) => formatNumberWithFractionDigits(item.y!)),
      });
    }
    else if (parsedGraphData.setpointHist != null && parsedGraphData.setpointHist.d.length > 0) {
      state.newCharts.push({
        name: 'setpoint',
        x: parsedGraphData.setpointHist.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: parsedGraphData.setpointHist.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { dash: 'dot', color: colors.Green, width: 2 },
        hovertemplate: '%{customdata} °C',
        customdata: parsedGraphData.setpointHist.d.map((item) => formatNumberWithFractionDigits(item.y!)),
      });
    }
    if (state.profile.manageAllClients && state.devInfo.dam && state.devInfo.dam.CAN_SELF_REFERENCE) {
      if (damCharts.tSetpoint) {
        state.newCharts.push({
          name: 'histerese sup.',
          x: damCharts.tSetpoint.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: damCharts.tSetpoint.d.map((item) => item.y! + (state.devInfo.dam.UPPER_HYSTERESIS || 0)),
          type: 'scatter',
          mode: 'lines',
          line: { color: '#6AA5E0', width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: damCharts.tSetpoint.d.map((item) => formatNumberWithFractionDigits(item.y! + (state.devInfo.dam.UPPER_HYSTERESIS || 0))),
        });
        state.newCharts.push({
          name: 'histerese inf.',
          x: damCharts.tSetpoint.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: damCharts.tSetpoint.d.map((item) => item.y! - (state.devInfo.dam.LOWER_HYSTERESIS || 0)),
          type: 'scatter',
          mode: 'lines',
          line: { color: '#6AA5E0', width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: damCharts.tSetpoint.d.map((item) => formatNumberWithFractionDigits(item.y! - (state.devInfo.dam.LOWER_HYSTERESIS || 0))),
        });
      }
    }
  };

  const addDutHistereseLines = () => {
    if (state.profile.manageAllClients && state.devInfo.dam?.CAN_SELF_REFERENCE) {
      if (state.dutChart?.tSetpoint) {
        state.newCharts.push({
          name: 'histerese sup.',
          x: state.dutChart.tSetpoint.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: state.dutChart.tSetpoint.d.map((item) => item.y! + (state.devInfo.dam.UPPER_HYSTERESIS || 0)),
          type: 'scatter',
          mode: 'lines',
          line: { color: '#6AA5E0', width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: state.dutChart.tSetpoint.d.map((item) => formatNumberWithFractionDigits(item.y! + (state.devInfo.dam.UPPER_HYSTERESIS || 0))),
        });
        state.newCharts.push({
          name: 'histerese inf.',
          x: state.dutChart.tSetpoint.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: state.dutChart.tSetpoint.d.map((item) => item.y! - (state.devInfo.dam.LOWER_HYSTERESIS || 0)),
          type: 'scatter',
          mode: 'lines',
          line: { color: '#6AA5E0', width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: state.dutChart.tSetpoint.d.map((item) => formatNumberWithFractionDigits(item.y! - (state.devInfo.dam.LOWER_HYSTERESIS || 0))),
        });
      }
    }
  };

  const addDutLtiLines = (): void => {
    if (state.dutChart?.tLti) {
      state.newCharts.push({
        name: 'LTI',
        x: state.dutChart.tLti.d.map((item) => state.date?.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)).filter(Boolean) as string[],
        y: state.dutChart.tLti.d.map((item) => item.y).filter(Boolean) as number[],
        type: 'scatter',
        mode: 'lines',
        line: { dash: 'dot', color: '#a4c9ec', width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: state.dutChart.tLti.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }
  };

  function isFancoil() {
    if (state.devInfo.dut && state.devInfo.dut.APPLICATION === 'fancoil') {
      return true;
    }
    return false;
  }

  function nameTemp1() {
    let name;
    if (state.dutChart && !state.dutChart.temprt1) {
      name = state.dutRoomName ?? 'DUT';
    } else if (isFancoil()) {
      name = 'DUT Temp Saída de Água';
    } else {
      name = 'DUT Temp Retorno';
    }
    return name;
  }

  function nameTemp2() {
    let name = '';
    if (isFancoil()) {
      name = 'DUT Temp Entrada de Água';
    }
    else {
      name = 'DUT Temp Insuflamento';
    }
    return name;
  }

  const addDutChartLines = (parsedGraphData: ReturnType<typeof processReceivedHistoryDAM>) => {
    if (state.dutChart?.temprt) {
      state.newCharts.push({
        name: nameTemp1(),
        x: state.dutChart.temprt.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: state.dutChart.temprt.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Orange, width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: state.dutChart.temprt.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }
    if (state.dutChart?.temprt1) {
      state.newCharts.push({
        name: nameTemp2(),
        x: state.dutChart.temprt1.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: state.dutChart.temprt1.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Blue300, width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: state.dutChart.temprt1.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }
    if (state.dutChart?.l1) {
      state.newCharts.push({
        name: 'DUT L1',
        x: state.dutChart.l1.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: state.dutChart.l1.d.map((item) => item.y || null),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Black, width: 1 },
        hovertemplate: '%{y}',
      });
    }
    if (state.dutChart?.limTmax) {
      state.newCharts.push({
        name: 'max',
        x: state.dutChart.limTmax.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: state.dutChart.limTmax.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Green, width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: state.dutChart.limTmax.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }
    if (state.dutChart?.limTmin) {
      state.newCharts.push({
        name: 'min',
        x: state.dutChart.limTmin.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: state.dutChart.limTmin.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: colors.Green, width: 1 },
        hovertemplate: '%{customdata} °C',
        customdata: state.dutChart.limTmin.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }
    if (state.dutChart?.tSetpoint && (parsedGraphData.setpointHist == null || parsedGraphData.setpointHist.d.length === 0)) {
      state.newCharts.push({
        name: 'setpoint',
        x: state.dutChart.tSetpoint.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: state.dutChart.tSetpoint.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { dash: 'dot', color: colors.Green, width: 2 },
        hovertemplate: '%{customdata} °C',
        customdata: state.dutChart.tSetpoint.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }
    else if (parsedGraphData.setpointHist != null && parsedGraphData.setpointHist.d.length > 0) {
      state.newCharts.push({
        name: 'setpoint',
        x: parsedGraphData.setpointHist.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: parsedGraphData.setpointHist.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { dash: 'dot', color: colors.Green, width: 2 },
        hovertemplate: '%{customdata} °C',
        customdata: parsedGraphData.setpointHist.d.map((item) => formatNumberWithFractionDigits(item.y ?? 0)),
      });
    }

    addDutHistereseLines();

    addDutLtiLines();
  };

  const addDutDuoNotAutLines = () => {
    if (state.dutDuoChartNotAut) {
      if (state.dutDuoChartNotAut.temprt1) {
        state.newCharts.push({
          name: t('temperaturadeInsuflamento'),
          x: state.dutDuoChartNotAut.temprt1.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: state.dutDuoChartNotAut.temprt1.d.map((item) => item.y!),
          type: 'scatter',
          mode: 'lines',
          line: { color: colors.Yellow, width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: state.dutDuoChartNotAut.temprt1.d.map((item) => formatNumberWithFractionDigits(item.y!)),
        });
      }
      if (state.dutDuoChartNotAut.temprt) {
        state.newCharts.push({
          name: t('temperaturadeRetorno'),
          x: state.dutDuoChartNotAut.temprt.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
          y: state.dutDuoChartNotAut.temprt.d.map((item) => item.y!),
          type: 'scatter',
          mode: 'lines',
          line: { color: colors.Green_v2, width: 1 },
          hovertemplate: '%{customdata} °C',
          customdata: state.dutDuoChartNotAut.temprt.d.map((item) => formatNumberWithFractionDigits(item.y!)),
        });
      }
    }
  };

  const addDacLines = () => {
    for (const dacInfo of (state.dacsCharts || [])) {
      state.newCharts.push({
        name: dacInfo.dacId,
        x: dacInfo.chartData.d.map((item) => state.date!.clone().add(moment.duration(item.x * 3600 * 1000)).toISOString(true)),
        y: dacInfo.chartData.d.map((item) => item.y!),
        type: 'scatter',
        mode: 'lines',
        line: { color: '#911EB4', width: 1 },
        hovertemplate: '%{y}',
      });
    }
  };

  const valueOrEmptyArr = (value) => (value || []);

  const formatAsTable = (comprHistory: ApiResps['/get-autom-day-charts-data']) => {
    state.asTable = [];
    state.dacsCols = [];
    if (!comprHistory.asTable?.c.length) return;
    const {
      c, prog, Mode, State, ecoCmd, dacsRows, dacsCols, labels_State,
    } = comprHistory.asTable;
    state.dacsCols = valueOrEmptyArr(dacsCols);
    const labelsMode = valueOrEmptyArr(comprHistory.Mode?.labels);
    const labelsState = valueOrEmptyArr(labels_State || (comprHistory.State?.labels));
    const labelsEcoCmd = valueOrEmptyArr(comprHistory.ecoCmd?.labels);
    const labelsProg = valueOrEmptyArr(comprHistory.prog?.labels);
    for (let i = 0; i < c.length; i++) {
      const row = [
        c[i],
        (prog && labelsProg[prog[i]]) || '',
        (Mode && labelsMode[Mode[i]]) || '',
        (State && labelsState[State[i]]) || '',
        (ecoCmd && labelsEcoCmd[ecoCmd[i]]) || '',
      ];
      row.push(''); // Modo Economia
      for (const dac of dacsRows) {
        row.push(dac[i]);
        row.push(''); // Economia DAC
      }
      state.asTable.push(row);
    }
  };

  const createDacLines = (comprHistory: ApiResps['/get-autom-day-charts-data'], parsedGraphData: ReturnType<typeof processReceivedHistoryDAM>) => {
    for (const [dacId, dacLine] of Object.entries(parsedGraphData.dacs || {})) {
      // if (!dacLine) continue;
      if (!comprHistory.asTable.dacsCols.includes(dacId)) continue;
      const dacInf = comprHistory.dacsInfo?.[dacId];
      state.dacsCharts.push({
        dacId,
        groupId: dacLine.groupId,
        chartData: dacLine,
        usePeriod: null,
        useFactor: null,
        potNominal: dacInf?.DAC_KW,
        conclusions: [],
        states: [],
        stateStats: {
          cond1_hit: 0,
          cond1_miss: 0,
          cond2_hit: 0,
          cond2_miss: 0,
          ecoFull_hit: 0,
          noEcoVent_hit: 0,
        },
      });
    }
  };

  async function updateChartData() {
    if (!state.devInfo) return;
    if (!state.date) return;

    try {
      if (!state.isLoading) {
        setState({ isLoading: true });
      }
      state.damCharts = {};
      state.dacsCharts = [];
      state.dutChart = null;
      state.dutDuoChartNotAut = null;

      const params = {
        devId: state.damId,
        day: state.date.format().substring(0, 10),
      };
      const comprHistory = await apiCall('/get-autom-day-charts-data', params);

      if (comprHistory.provision_error) { toast.error(t('erroDadosIncompletos')); }

      const parsedGraphData = processReceivedHistoryDAM(comprHistory, state.devInfo);

      const damCharts = state.damCharts = {
        State: parsedGraphData.State,
        Mode: parsedGraphData.Mode,
        ecoCmd: parsedGraphData.ecoCmd,
        Temperature: parsedGraphData.damTemperature,
        Temperature_1: parsedGraphData.damTemperature_1,
        limTmin: parsedGraphData.limTmin,
        limTmax: parsedGraphData.limTmax,
        tSetpoint: parsedGraphData.tSetpoint,
        humidity: parsedGraphData.humidity,
      };

      createDacLines(comprHistory, parsedGraphData);

      state.conclusionsDam = [];
      state.dutChart = (!parsedGraphData.duts[0]?.isDutDuo && parsedGraphData.duts[0]) || null;
      const dutsDuoNotAut = parsedGraphData.duts.filter((dut) => dut?.isDutDuo);
      state.dutDuoChartNotAut = dutsDuoNotAut.length > 0 ? dutsDuoNotAut[0] : null;
      state.daySched = comprHistory.daySched || null;

      updateAxis();

      state.newCharts = [];
      addDamDefaultLines(damCharts);
      if (state.devInfo.dam?.SELF_REFERENCE) {
        addDamSelfReferenceLines(damCharts, parsedGraphData);
      }
      else if (state.dutChart) {
        addDutChartLines(parsedGraphData);
      }

      addDutDuoNotAutLines();

      addDacLines();

      for (const chart of state.newCharts) {
        chart.text = chart.x.map((x) => x.substring(11, 19));
      }

      formatAsTable(comprHistory);
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }

    setState({ isLoading: false });
  }

  const setTemprtLimits = (limits: { max: null|number, min: null|number }) => {
    if (!state.dutChart?.temprt?.limits) return;

    const [minTval, maxTval] = state.dutChart.temprt.limits;
    if (state.dutChart && maxTval && (maxTval > limits.max! || limits.max == null)) {
      limits.max = maxTval;
    }
    if (state.dutChart && minTval && (minTval < limits.min! || limits.min == null)) {
      limits.min = minTval;
    }
  };

  const setDutsLimits = (limits: { max: null|number, min: null|number }) => {
    if (!state.dutChart) return;

    if (state.dutChart.limTmax?.limits.length) {
      if (!limits.max || state.dutChart.limTmax.limits[1] > limits.max) {
        limits.max = state.dutChart.limTmax.limits[1];
      }
    }
    if (state.dutChart.limTmin?.limits.length) {
      if (!limits.min || state.dutChart.limTmin.limits[0] < limits.min) {
        limits.min = state.dutChart.limTmin.limits[0];
      }
    }

    setTemprtLimits(limits);
  };

  const setDamsTLimits = (limits: { max: null|number, min: null|number }) => {
    if (state.damCharts.limTmax?.limits.length) {
      if (!limits.max || state.damCharts.limTmax.limits[1] > limits.max) {
        limits.max = state.damCharts.limTmax.limits[1];
      }
    }
    if (state.damCharts.limTmin?.limits.length) {
      if (!limits.min || state.damCharts.limTmin.limits[0] < limits.min) {
        limits.min = state.damCharts.limTmin.limits[0];
      }
    }
  };

  const setDamsTempLimits = (limits: { max: null|number, min: null|number }) => {
    if (state.damCharts.Temperature && (state.devInfo.dam?.PLACEMENT === 'RETURN' || (state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam.T0_POSITION))) {
      const [minTval, maxTval] = state.damCharts.Temperature.limits;
      if (state.damCharts && maxTval && (maxTval > limits.max! || limits.max == null)) {
        limits.max = maxTval;
      }
      if (state.damCharts && minTval && (minTval < limits.min! || limits.min == null)) {
        limits.min = minTval;
      }
    }
  };

  const setDamsTemp1Limits = (limits: { max: null|number, min: null|number }) => {
    // FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA
    if (state.damCharts.Temperature_1 && state.devInfo.dam?.PLACEMENT === 'DUO' && state.devInfo.dam.T1_POSITION && (state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1)) {
      const [minTval, maxTval] = state.damCharts.Temperature_1.limits;
      if (state.damCharts && maxTval && (maxTval > limits.max! || limits.max == null)) {
        limits.max = maxTval;
      }
      if (state.damCharts && minTval && (minTval < limits.min! || limits.min == null)) {
        limits.min = minTval;
      }
    }
  };

  const setDamsLimits = (limits: { max: null|number, min: null|number }) => {
    setDamsTLimits(limits);
    setDamsTempLimits(limits);
    setDamsTemp1Limits(limits);
  };

  const setDutsDuoTemprtLimits = (limits: { max: null|number, min: null|number }) => {
    if (!state.dutDuoChartNotAut?.temprt?.limits) return;

    const [minTval, maxTval] = state.dutDuoChartNotAut.temprt.limits;
    if (maxTval && (maxTval > limits.max! || limits.max == null)) {
      limits.max = maxTval;
    }
    if (minTval && (minTval < limits.min! || limits.min == null)) {
      limits.min = minTval;
    }
  };

  const setDutsDuoTemprt1Limits = (limits: { max: null|number, min: null|number }) => {
    if (!state.dutDuoChartNotAut?.temprt1?.limits) return;

    const [minTval, maxTval] = state.dutDuoChartNotAut.temprt1.limits;
    if (maxTval && (maxTval > limits.max! || limits.max == null)) {
      limits.max = maxTval;
    }
    if (minTval && (minTval < limits.min! || limits.min == null)) {
      limits.min = minTval;
    }
  };

  const setDutsDuoLimits = (limits: { max: null|number, min: null|number }) => {
    if (!state.dutDuoChartNotAut) return;

    if (state.dutDuoChartNotAut.temprt?.limits) {
      setDutsDuoTemprtLimits(limits);
    }
    if (state.dutDuoChartNotAut.temprt1?.limits) {
      setDutsDuoTemprt1Limits(limits);
    }
  };

  function updateAxis() {
    const limits = { max: null as null|number, min: null as null|number };

    setDutsLimits(limits);

    setDamsLimits(limits);

    setDutsDuoLimits(limits);

    const { L1start, ticks, maxAxisVal } = axisCalc.calculateTemprtAxisInfo(limits);

    const steppedLines: DiscreteHistVar[] = [];
    if (state.damCharts.Mode) steppedLines.push(state.damCharts.Mode);
    if (state.damCharts.State) steppedLines.push(state.damCharts.State);
    if (state.damCharts.ecoCmd) steppedLines.push(state.damCharts.ecoCmd);
    for (const dacInfo of (state.dacsCharts || [])) {
      steppedLines.push(dacInfo.chartData);
    }
    if (state.dutChart?.l1) steppedLines.push(state.dutChart.l1);

    const { allTicks, ticksNames, endValue } = axisCalc.updateStepY(steppedLines, L1start);
    state.axisInfo.L1start = L1start;
    state.axisInfo.leftLimits = [endValue - 2, ticks.length ? maxAxisVal : (L1start + 0.5)];
    state.axisInfo.leftTicks = [...ticks, ...allTicks];
    state.axisInfo.stepTicksNames = ticksNames;

    state.axisInfo.leftTicksLabels = state.axisInfo.leftTicks.map((v) => { const vs = String(v); return ticksNames[vs] || vs; });
  }

  function calculateStats(comprHistory: ApiResps['/get-autom-day-charts-data']) {
    // groupsInfo: { [groupId: string]: { GROUP_NAME: string } }, unitInfo: { greenAntCons_kWh: number, averageTariff: number }, damInfo: { FU_NOM: number }
    const { groupsInfo, unitInfo, automInfo: damInfo } = comprHistory;
    const statsCounters = {} as {
      [dacId: string]: {
        dacId: string
        firstL1: number|null
        lastL1: number|null
        lastL1iRow: number
        fuRef: number|null
        inL1: {
          on: number
          off: number
          ignr: number
        }
        inProg: {
          on: number
          off: number
          ignr: number
        }
        inProg_B: {
          on: number
          off: number
          ena: number
          dis: number
          C1: number
          C2: number
          ignr: number
        }
        inEnabled: {
          on: number
          off: number
          ignr: number
        }
        inC1: {
          on: number
          off: number
          ignr: number
        }
        inC2: {
          on: number
          off: number
          ignr: number
        }
        inForbid: {
          on: number
          off: number
          ignr: number
        }
        stateStats: {
          cond1_hit: number
          cond1_miss: number
          cond2_hit: number
          cond2_miss: number
          ecoFull_hit: number
          noEcoVent_hit: number
        }
      }
    };
    for (let iD = 0; iD < state.dacsCols.length; iD++) {
      const dacId = state.dacsCols[iD];
      let lastL1iRow = -1;
      for (let iR = state.asTable.length - 1; iR >= 0; iR--) {
        const row = state.asTable[iR];
        const dacL1 = row[6 + 2 * iD];
        if (dacL1 === 1) {
          lastL1iRow = iR;
          break;
        }
      }
      statsCounters[dacId] = {
        dacId,
        firstL1: null,
        lastL1: null,
        fuRef: null,
        lastL1iRow,
        inL1: { on: 0, off: 0, ignr: 0 },
        inProg: { on: 0, off: 0, ignr: 0 },
        inProg_B: {
          on: 0, off: 0, ena: 0, dis: 0, C1: 0, C2: 0, ignr: 0,
        },
        inEnabled: { on: 0, off: 0, ignr: 0 },
        inC1: { on: 0, off: 0, ignr: 0 },
        inC2: { on: 0, off: 0, ignr: 0 },
        inForbid: { on: 0, off: 0, ignr: 0 },
        inProgOn: 0,
        inProgOff: 0,
        inProgIgnored: 0,
        stateStats: {
          cond1_hit: 0,
          cond1_miss: 0,
          cond2_hit: 0,
          cond2_miss: 0,
          ecoFull_hit: 0,
          noEcoVent_hit: 0,
        },
      };
      const dacInfo = state.dacsCharts.find((x) => x.dacId === dacId)!;
      dacInfo.stateStats = statsCounters[dacId].stateStats;
    }
    let tempoStateEnabled = 0;
    let tempoStateVentilation = 0;
    let tempoStateC1 = 0;
    let tempoStateC2 = 0;
    let accT = 0;
    let timeDamOffline = 0;
    // let damIsBlocking = null;
    for (let iR = 0; iR < state.asTable.length; iR++) {
      const row = state.asTable[iR];
      const rowDuration = row[0] as number;
      const rowProg = row[1] as string;
      const rowMode = row[2] as string;
      const rowState = row[3] as string;
      const rowEcoCmd = row[4] as string;

      if (!rowState) timeDamOffline += rowDuration;
      else timeDamOffline = 0;

      if (rowMode === 'Auto') {
        if (rowState === 'Enabled') { tempoStateEnabled += rowDuration; } else if (rowState === 'Ventilation') { tempoStateVentilation += rowDuration; } else if (rowState === 'Condenser 1') { tempoStateC1 += rowDuration; } else if (rowState === 'Condenser 2') { tempoStateC2 += rowDuration; }
      }

      const isEcoCmd = (rowEcoCmd && rowEcoCmd !== 'Sem eco') || ['Condenser 1', 'Enabling Condenser 1', 'Condenser 2', 'Enabling Condenser 2'].includes(rowState);
      let rowSavingDet = '';
      if (isEcoCmd) {
        if (!rowEcoCmd) rowSavingDet = t('ignoradoCMD');
        else if (rowProg && (rowProg !== 'allow')) rowSavingDet = t('ignoradoProg');
        else if (['Disabling', 'Starting Ventilation', 'Enabling Condenser 1', 'Enabling Condenser 2'].includes(rowState)) rowSavingDet = t('ignoradoTRN');
        else if (rowState && (rowState !== rowEcoCmd)) rowSavingDet = t('ignoradoState');
        else if (rowMode && (rowMode !== 'Auto')) rowSavingDet = t('ignoradoMode');
        else if (timeDamOffline >= 20 * 60) rowSavingDet = t('ignoradoOffl');
        else rowSavingDet = 'ECO';
      }
      if (!rowSavingDet) {
        if (rowState === 'Starting Ventilation') rowSavingDet = t('ignoradoTRN');
        else if (rowState === 'Ventilation') rowSavingDet = t('ventilacao');
      }
      row[5] = rowSavingDet;

      // if (!rowProg) { // no programming defined
      //   damIsBlocking = null;
      // }
      // else if (timeDamOffline >= 20*60) { // offline
      //   damIsBlocking = null;
      // }
      // else if (rowProg === 'allow') {
      //   damIsBlocking = false;
      // } else { // if (rowProg === 'forbid')
      //   damIsBlocking = false;
      // }

      for (let iD = 0; iD < state.dacsCols.length; iD++) {
        const dacId = state.dacsCols[iD];
        const dacStats = statsCounters[dacId];
        const dacL1 = row[6 + 2 * iD];
        if (dacL1 === 1) {
          if (dacStats.firstL1 == null) dacStats.firstL1 = accT;
          dacStats.inL1.on += rowDuration;
          if (iR === dacStats.lastL1iRow) {
            dacStats.lastL1 = accT + rowDuration - 1;
          }
        } else if (dacL1 === 0) {
          if ((dacStats.firstL1 != null) && (iR < dacStats.lastL1iRow)) {
            dacStats.inL1.off += rowDuration;
          }
        } else if ((dacStats.firstL1 != null) && (iR < dacStats.lastL1iRow)) {
          dacStats.inL1.ignr += rowDuration;
        }
        let disabledRow = '';
        if (rowProg === 'allow') {
          if (dacL1 === 1) {
            dacStats.inProg.on += rowDuration;
          } else if (dacL1 === 0) {
            dacStats.inProg.off += rowDuration;
          } else {
            dacStats.inProg.ignr += rowDuration;
          }
          if (rowMode === 'Auto') {
            if (dacL1 === 1) {
              dacStats.inProg_B.on += rowDuration;
              disabledRow = t('ligadoMin');
            } else if (dacL1 === 0) {
              dacStats.inProg_B.off += rowDuration;
              disabledRow = t('desligadoMin');
            } else if (rowState === 'Enabled') {
              dacStats.inProg_B.ena += rowDuration;
              disabledRow = t('ligadoMin');
            } else if (rowState === 'Ventilation') {
              dacStats.inProg_B.dis += rowDuration;
              disabledRow = t('desligadoMin');
            } else if (rowState === 'Disabled') {
              dacStats.inProg_B.dis += rowDuration;
              disabledRow = t('desligadoMin');
            } else if (rowState === 'Condenser 1') {
              dacStats.inProg_B.C1 += rowDuration;
              disabledRow = t('ignoradoC1');
            } else if (rowState === 'Condenser 2') {
              dacStats.inProg_B.C2 += rowDuration;
              disabledRow = t('ignoradoC2');
            } else {
              dacStats.inProg_B.ignr += rowDuration;
              disabledRow = t('ignoradoState');
            }
          } else {
            dacStats.inProg_B.ignr += rowDuration;
            disabledRow = t('ignoradoMode');
          }
        }
        if (rowProg === 'forbid') {
          if (dacL1 === 1) {
            dacStats.inForbid.on += rowDuration;
          } else if (dacL1 === 0) {
            dacStats.inForbid.off += rowDuration;
          } else {
            dacStats.inForbid.ignr += rowDuration;
          }
        }
        if (rowMode === 'Auto') {
          if (rowState === 'Enabled') {
            if (dacL1 === 1) {
              dacStats.inEnabled.on += rowDuration;
            } else if (dacL1 === 0) {
              dacStats.inEnabled.off += rowDuration;
            } else {
              dacStats.inEnabled.ignr += rowDuration;
            }
          } else if (rowState === 'Condenser 1') {
            if (dacL1 === 1) {
              dacStats.inC1.on += rowDuration;
            } else if (dacL1 === 0) {
              dacStats.inC1.off += rowDuration;
            } else {
              dacStats.inC1.ignr += rowDuration;
            }
          } else if (rowState === 'Condenser 2') {
            if (dacL1 === 1) {
              dacStats.inC2.on += rowDuration;
            } else if (dacL1 === 0) {
              dacStats.inC2.off += rowDuration;
            } else {
              dacStats.inC2.ignr += rowDuration;
            }
          }
        }

        // if (['Condenser 1', 'Condenser 2'].includes(rowState) || ((!rowState) && ['Condenser 1', 'Condenser 2'].includes(rowEcoCmd))) {
        if (rowSavingDet === 'ECO') {
          if (rowEcoCmd === 'Condenser 1') {
            if (dacL1 === 1) { dacStats.stateStats.cond1_hit += rowDuration; } else { dacStats.stateStats.cond1_miss += rowDuration; }
          } else if (rowEcoCmd === 'Condenser 2') {
            if (dacL1 === 1) { dacStats.stateStats.cond2_hit += rowDuration; } else { dacStats.stateStats.cond2_miss += rowDuration; }
          } else if (dacL1 === 1) { } // ignore
          else { dacStats.stateStats.ecoFull_hit += rowDuration; }
        }
        if ((!isEcoCmd) && (rowState === 'Ventilation')) { // (rowSavingDet === 'Ventilation')
          if (dacL1 === 1) { } // ignore
          else { dacStats.stateStats.noEcoVent_hit += rowDuration; }
        }

        // let ecoDac = '';
        // if (rowSavingDet) {
        //   if (rowSavingDet.startsWith('Ignorado')) {
        //     // Ignore
        //   }
        //   else {
        //     if (dacL1 === 1) {
        //       ecoDac = 'Ignorado [L1]';
        //     } else {
        //       if (rowSavingDet === 'ECO') {
        //         if ((rowEcoCmd === 'Disabled') || (rowEcoCmd === 'Ventilation')) ecoDac = 'Saving ECO';
        //         else if ((rowEcoCmd === 'Condenser 1') || (rowEcoCmd === 'Condenser 2')) ecoDac = 'Ignorado [COND]';
        //         else ecoDac = 'Ignorado [E1]';
        //       }
        //       else if (rowSavingDet === 'Ventilation') {
        //         ecoDac = 'Saving Vent';
        //       }
        //       else {
        //         ecoDac = 'Ignorado [E2]';
        //       }
        //     }
        //   }
        // }
        // row[6 + 2 * iD + 1] = ecoDac;
        row[6 + 2 * iD + 1] = disabledRow;
      }
      accT += rowDuration;
    }

    identifyConds();

    // if (state.devInfo && state.devInfo.dam) {
    //   state.conclusionsDam.push(`Configuração do DAM: ${JSON.stringify({
    //     REL_DUT_ID: state.devInfo.dam.REL_DUT_ID,
    //     ENABLE_ECO: state.devInfo.dam.ENABLE_ECO,
    //     ECO_CFG: state.devInfo.dam.ECO_CFG,
    //     ECO_OFST_START: state.devInfo.dam.ECO_OFST_START,
    //     ECO_OFST_END: state.devInfo.dam.ECO_OFST_END,
    //     ECO_INT_TIME: state.devInfo.dam.ECO_INT_TIME,
    //     FW_MODE: state.devInfo.dam.FW_MODE,
    //     DAM_DISABLED: state.devInfo.dam.DAM_DISABLED,
    //     dam_mode: state.devInfo.dam.dam_mode,
    //   })}`);
    //   state.conclusionsDam.push(`Máquinas do DAM: ${JSON.stringify(state.devInfo.dam.groups)}`);
    // }
    // state.conclusionsDam.push(`Máquinas do DAM: ${JSON.stringify(comprHistory.groupsInfo)}`);
    // state.conclusionsDam.push(`Programação horária: ${JSON.stringify(comprHistory.daySched)}`);
    // for (const dut of (comprHistory.dutsTemprt || [])) {
    //   state.conclusionsDam.push(`Tipo de ambiente: ${JSON.stringify({
    //     dutId: dut.dutId,
    //     daySched: dut.daySched,
    //   })}`);
    // }

    let progDesc = null as null|string;
    if (state.daySched && state.daySched.type === 'allow') {
      progDesc = `${state.daySched.startHM} a ${state.daySched.endHM}`;
      const hoursAllowed = Math.round((state.daySched.indexEnd - state.daySched.indexIni + 1) / 60 * 10) / 10;
      const hoursForbid = 24 - hoursAllowed;
      state.conclusionsDam.push(t('pelaProgramacaoHorarioFuncionamento', { progDesc, hoursForbid, hoursAllowed }));
      state.conclusionsDam.push(t('damEnabledVentilation', { tempoStateEnabled, tempoStateVentilation }));
      if (unitInfo && unitInfo.greenAntCons_kWh) {
        state.conclusionsDam.push(t('consumoTotalUnidadeMedidoGreenAnt', { kWh: unitInfo.greenAntCons_kWh }));
      }
    }

    for (const dacInfo of state.dacsCharts) {
      const dacStats = statsCounters[dacInfo.dacId];
      if (!dacStats.inProg.on) {
        if (dacStats.inProg.off) {
          dacInfo.conclusions.push(t('compressorMonitoradoNaoUtilizado'));
        } else {
          dacInfo.conclusions.push(t('naoTemInformacaoSobreEstadoCompressor'));
        }
      } else {
        const potNominal = dacInfo.potNominal ? t('potenciaNominalCompressor', { potNominal: dacInfo.potNominal }) : t('faltaInformacaoPotenciaNominalCompressor');
        const machineName = ((groupsInfo && dacInfo.groupId && groupsInfo[dacInfo.groupId]) || {}).GROUP_NAME || '';
        dacStats.fuRef = damInfo.FU_NOM || 0.6;
        if (dacInfo.isCond1) {
          dacInfo.conclusions.push(t('condensadora1MaquinaFuNominal', { machineName, potNominal, percent: dacStats.fuRef * 100 }));
        } else if (dacInfo.isCond2) {
          dacInfo.conclusions.push(t('condensadora2MaquinaFuNominal', { machineName, potNominal, percent: dacStats.fuRef * 100 }));
        } else {
          dacInfo.conclusions.push(potNominal);
        }
        if (progDesc) {
          if (dacStats.inProg.on) {
            const FUprog = `${Math.round(dacStats.inProg.on / (dacStats.inProg.on + dacStats.inProg.off) * 100 * 10) / 10}%`;
            dacInfo.conclusions.push(t('durantePeriodoPermitidoProgamacaoDacFicou', {
              tempOn: dacStats.inProg.on,
              tempOff: dacStats.inProg.off,
              tempOffline: dacStats.inProg.ignr,
              FUprog,
            }));
          }
          if (dacStats.inForbid.off && dacStats.inForbid.on) {
            dacInfo.conclusions.push(t('foraHorarioProgramacaoDacFicou', {
              tempOn: dacStats.inForbid.on,
              tempOff: dacStats.inForbid.off,
              tempOffline: dacStats.inForbid.ignr,
            }));
          }
        }
        if (dacStats.inEnabled.on) {
          // dacStats.fuRef = dacStats.inEnabled.on / (dacStats.inEnabled.on + dacStats.inEnabled.off);
          // const FUenab = `${Math.round(dacStats.inEnabled.on / (dacStats.inEnabled.on + dacStats.inEnabled.off) * 100 * 10) / 10}%`
          dacInfo.conclusions.push(t('considerandoDamEnabledDacFicou', { tempOn: dacStats.inEnabled.on, tempOff: dacStats.inEnabled.off, tempOffline: dacStats.inEnabled.ignr }));
        }
        if (dacInfo.isCond1 && tempoStateC1) {
          dacInfo.conclusions.push(t('considerandoDamCondenser1DacFicou', { tempOn: dacStats.inC1.on, tempOff: dacStats.inC1.off, tempOffline: dacStats.inC1.ignr }));
        }
        if (dacInfo.isCond2 && tempoStateC2) {
          dacInfo.conclusions.push(t('considerandoDamCondenser2DacFicou', { tempOn: dacStats.inC1.on, tempOff: dacStats.inC1.off, tempOffline: dacStats.inC1.ignr }));
        }
        if (dacStats.inL1.on) {
          if (dacStats.firstL1 != null) {
            const usePeriod = `${convertToTime(dacStats.firstL1)} a ${convertToTime(dacStats.lastL1!)}`;
            // dacInfo.useFactor = (dacStats.inL1.on) ? `${dacStats.inL1.on} / ${(dacStats.inL1.on + dacStats.inL1.off)} = ${Math.round(dacStats.inL1.on / (dacStats.inL1.on + dacStats.inL1.off) * 100 * 10) / 10}%` : '';
            const FU = `${Math.round(dacStats.inL1.on / (dacStats.inL1.on + dacStats.inL1.off) * 100 * 10) / 10}%`;
            dacInfo.conclusions.push(t('observandoL1DacFuncionouPeriodo', {
              usePeriod,
              tempOn: dacStats.inL1.on,
              tempOff: dacStats.inL1.off,
              tempOffline: dacStats.inL1.ignr,
              FU,
            }));
          }
        }
      }
    }

    for (let iD = 0; iD < state.dacsCols.length; iD++) {
      const dacId = state.dacsCols[iD];
      const dac = state.dacsCharts.find((x) => x.dacId === dacId);
      if (!dac) continue;
      for (let iR = 0; iR < state.asTable.length; iR++) {
        const row = state.asTable[iR];
        // let ecoDac = row[6 + 2 * iD + 1];
        // if (ecoDac === 'Ignorado [COND]') {
        //   const rowEcoCmd = row[4];
        //   if ((rowEcoCmd === 'Condenser 1') && (dac.isCond1 === false)) ecoDac = 'Saving ECO';
        //   else if ((rowEcoCmd === 'Condenser 2') && (dac.isCond2 === false)) ecoDac = 'Saving ECO';
        //   row[6 + 2 * iD + 1] = ecoDac;
        // }
        // else if (ecoDac === 'Ignorado [L1]') {
        //   const rowEcoCmd = row[4];
        //   if ((rowEcoCmd === 'Condenser 1') && (dac.isCond1 === true)) ecoDac = 'Ignorado [COND]';
        //   else if ((rowEcoCmd === 'Condenser 2') && (dac.isCond2 === true)) ecoDac = 'Ignorado [COND]';
        //   row[6 + 2 * iD + 1] = ecoDac;
        // }
        let disabledRow = row[6 + 2 * iD + 1];
        if ((disabledRow === t('ignoradoC1')) && (!dac.isCond1)) {
          disabledRow = t('desligadoMin');
          row[6 + 2 * iD + 1] = disabledRow;
        } else if ((disabledRow === t('ignoradoC2')) && (!dac.isCond2)) {
          disabledRow = t('desligadoMin');
          row[6 + 2 * iD + 1] = disabledRow;
        }
      }
    }

    for (const dacInfo of state.dacsCharts) {
      const dacStats = statsCounters[dacInfo.dacId];

      let ecoModeSavings_n = dacStats.stateStats.ecoFull_hit;
      if (!dacInfo.isCond1) ecoModeSavings_n += dacStats.stateStats.cond1_miss;
      if (!dacInfo.isCond2) ecoModeSavings_n += dacStats.stateStats.cond2_miss;
      const ventilSavings_n = dacStats.stateStats.noEcoVent_hit;
      const ecoVentSavings = ecoModeSavings_n + ventilSavings_n;
      let tempoDesligado = dacStats.inProg_B.off + dacStats.inProg_B.dis;
      if (!dacInfo.isCond1) tempoDesligado += dacStats.inProg_B.C1;
      if (!dacInfo.isCond2) tempoDesligado += dacStats.inProg_B.C2;
      const tempoLigado = dacStats.inProg_B.on + dacStats.inProg_B.ena;
      const FU = dacStats.fuRef || 1;
      const timeSavedEst = ecoVentSavings * FU / 3600;

      if (dacStats.inL1.on) {
        let consumoCompressor = `${dacStats.inL1.on}s = ${Math.round(dacStats.inL1.on / 3600 * 1000) / 1000}hs`;
        if (dacInfo.potNominal) {
          consumoCompressor += ` = ${Math.round(dacStats.inL1.on / 3600 * dacInfo.potNominal * 10) / 10} kWh`;
        }
        dacInfo.conclusions.push(t('consumoCompressorDia', { consumo: consumoCompressor }));
      }
      // if (ecoModeSavings_n) {
      //   let ecoModeSavings_s = `${ecoModeSavings_n}s = ${Math.round(ecoModeSavings_n / 3600 * 1000) / 1000}hs`;
      //   if (dacStats.fuRef != null) {
      //     ecoModeSavings_s += `. Considerando o FU (${Math.round(FU * 1000) / 10}): ${Math.round(ecoModeSavings_n / 3600 * FU * 1000) / 1000} hs`;
      //     if (dacInfo.potNominal) {
      //       ecoModeSavings_s += ` = ${Math.round(ecoModeSavings_n / 3600 * dacInfo.potNominal* FU * 10) / 10} kWh`;
      //     }
      //   }
      //   dacInfo.conclusions.push(`Economia pelo modo ECO: ${ecoModeSavings_s}`);
      // }
      // if (ventilSavings_n) {
      //   let ventilSavings_s = `${ventilSavings_n}s = ${Math.round(ventilSavings_n / 3600 * 1000) / 1000}hs`;
      //   if (dacStats.fuRef != null) {
      //     ventilSavings_s += `. Considerando o FU (${Math.round(FU * 1000) / 10}): ${Math.round(ventilSavings_n / 3600 * FU * 1000) / 1000} hs`;
      //     if (dacInfo.potNominal) {
      //       ventilSavings_s += ` = ${Math.round(ventilSavings_n / 3600 * dacInfo.potNominal* FU * 10) / 10} kWh`;
      //     }
      //   }
      //   dacInfo.conclusions.push(`Economia por ventilação fora do modo ECO: ${ventilSavings_s}`);
      // }
      if (ecoVentSavings) {
        let descr = t('economiaEcoVentilacaoHs', {
          ecoModeSavings_n,
          ventilSavings_n,
          valueHs: (Math.round(ecoVentSavings / 3600 * 1000) / 1000),
        });
        if (dacStats.fuRef != null) {
          descr += t('comOFuCompressorDeixouDeOperar', { FU: (Math.round(FU * 1000) / 10), valueHs: (Math.round(ecoVentSavings / 3600 * FU * 1000) / 1000) });
          if (dacInfo.potNominal) {
            descr += ` = ${Math.round(ecoVentSavings / 3600 * dacInfo.potNominal * FU * 10) / 10} kWh`;
            if (unitInfo.averageTariff) {
              descr += ` = R$ ${(timeSavedEst * dacInfo.potNominal * unitInfo.averageTariff).toFixed(2)} (tarifa ${unitInfo.averageTariff.toFixed(2)})`;
            }
          }
        }
        dacInfo.conclusions.push(descr);
      }

      if (dacStats.inL1.on) {
        // const timeInOperation = dacStats.inL1.on / 3600;
        // let savingsTotal = `${Math.round(timeSavedEst * 1000) / 1000} / (${Math.round(timeSavedEst * 1000) / 1000} + ${Math.round(timeInOperation * 1000) / 1000}) = ${Math.round(timeSavedEst / (timeSavedEst + timeInOperation) * 100 * 10) / 10}%.`;
        if (state.daySched && state.daySched.type === 'allow') {
          const hoursAllowed = (state.daySched.indexEnd - state.daySched.indexIni + 1) / 60;
          const expectHoursOff = hoursAllowed * (1 - FU);
          if (ecoVentSavings) {
            dacInfo.conclusions.push(t('comparandoTempoAtuacaoEstrategiaEconomiaComHorarioFuncionamento', { valueHs1: (Math.round(ecoVentSavings / 3600 * 1000) / 1000), valueHs2: (Math.round(hoursAllowed * 1000) / 1000), valueHs3: (Math.round(ecoVentSavings / 3600 / hoursAllowed * 1000) / 10) }));
          }
          dacInfo.conclusions.push(t('considerandoProgramacaoFuCompressor', { value1: (FU.toFixed(2)), value2: (Math.round(hoursAllowed * FU * 1000) / 1000), value3: (Math.round(expectHoursOff * 1000) / 1000) }));
          dacInfo.conclusions.push(t('consideradoDacFicou', {
            tempoLig: tempoLigado,
            tempoDes: tempoDesligado,
            tempoOff: dacStats.inProg_B.ignr,
            value1: Math.round(tempoLigado / 3600 * 1000) / 1000,
            value2: Math.round(tempoDesligado / 3600 * 1000) / 1000,
            value3: Math.round(dacStats.inProg_B.ignr / 3600 * 1000) / 1000,
          }));
          dacInfo.conclusions.push(t('foiConsideradoDacFicou', {
            tempoLigado,
            tempoDesligado,
            tempoOff: dacStats.inProg_B.ignr,
            value1: (Math.round(tempoLigado / 3600 * 1000) / 1000),
            value2: (Math.round(tempoDesligado / 3600 * 1000) / 1000),
            value3: (Math.round(dacStats.inProg_B.ignr / 3600 * 1000) / 1000),
          }));
          // A equação é a economia do modo ECO e ventilação (7.511) menos o tempo que a máquina naturalmente já ficaria com o compressor desligado.

          // const savingsHours_A = ((ecoVentSavings / 3600) - expectHoursOff);
          // dacInfo.conclusions.push(`Economia total A: ${Math.round(ecoVentSavings / 3600 * 1000) / 1000} - ${Math.round(expectHoursOff * 1000) / 1000} = ${Math.round(savingsHours_A * 1000) / 1000} hs.`);

          const savingsHours_B = ((tempoDesligado / 3600) - expectHoursOff);
          let economiaTotal = t('economiaTotalHs', { valueHs1: (Math.round(tempoDesligado / 3600 * 1000) / 1000), valueHs2: (Math.round(expectHoursOff * 1000) / 1000), valueHs3: (Math.round(savingsHours_B * 1000) / 1000) });
          if (dacInfo.potNominal) {
            economiaTotal += ` = ${Math.round(savingsHours_B * dacInfo.potNominal * 10) / 10} kWh`;
            if (unitInfo.averageTariff) {
              economiaTotal += t('economiaTotalRS', { value1: (savingsHours_B * dacInfo.potNominal * unitInfo.averageTariff).toFixed(2), value2: unitInfo.averageTariff.toFixed(2) });
            }
          }
          dacInfo.conclusions.push(economiaTotal);
        }
      }
    }

    // ESAVED = ESAVED_TIME + ESAVED_ECO
    // ESAVED_TIME: Energia economizada com a programação horária.
    // ESAVED_ECO: Energia economizada com o modo ECO dentro do horário permitido de funcionamento.

    // ESAVED_ECO = ENOMINAL - EECO
    // ENOMINAL = (PNOMINAL x tTOTAL_PERM) x FUNOMINAL
    // EECO = (ECOND1 + ECOND2 + ECOND3 + EVENT) x mode
    // ECOND2 = PCOND2 x (tENABLED+ tCOND2)
    // ECOND1 = PCOND1 x tENABLED
    // EVENT = PVENT x tVENT
  }

  function identifyConds() {
    const groups = [] as string[];
    for (const dacInfo of state.dacsCharts) {
      if (!dacInfo.groupId) continue;
      if (!groups.includes(dacInfo.groupId)) {
        groups.push(dacInfo.groupId);
      }
    }
    for (const groupId of groups) {
      const dacsInfo = state.dacsCharts.filter((x) => x.groupId === groupId);

      if (dacsInfo.length < 2) {
        dacsInfo[0].isCond1 = true;
        dacsInfo[0].isCond2 = false;
        continue;
      }

      let cond1_hits = 0;
      let cond2_hits = 0;
      for (const dac of dacsInfo) {
        cond1_hits += dac.stateStats.cond1_hit;
        cond2_hits += dac.stateStats.cond2_hit;
      }
      let cond1: null|{ stateStats: { cond1_hit: number } } = null;
      let cond2: null|{ stateStats: { cond2_hit: number } } = null;

      if (cond2_hits > cond1_hits) {
        for (const dac of dacsInfo) {
          if ((cond2 == null) || (dac.stateStats.cond2_hit > cond2.stateStats.cond2_hit)) {
            cond2 = dac;
          }
        }
        for (const dac of dacsInfo) {
          if (dac === cond2) continue;
          if ((cond1 == null) || (dac.stateStats.cond1_hit > cond1.stateStats.cond1_hit)) {
            cond1 = dac;
          }
        }
      } else {
        for (const dac of dacsInfo) {
          if ((cond1 == null) || (dac.stateStats.cond1_hit > cond1.stateStats.cond1_hit)) {
            cond1 = dac;
          }
        }
        for (const dac of dacsInfo) {
          if (dac === cond1) continue;
          if ((cond2 == null) || (dac.stateStats.cond2_hit > cond2.stateStats.cond2_hit)) {
            cond2 = dac;
          }
        }
      }

      for (const dac of dacsInfo) {
        dac.isCond1 = (dac === cond1);
        dac.isCond2 = (dac === cond2);
      }
    }
  }

  function fillGaps() {
    const conversions: { [k: string]: string } = {
      // 'Disabling': 'Disabled',
      // 'Enabling': 'Enabled',
      // 'Starting Ventilation': 'Ventilation',
      // 'Enabling Condenser 1': 'Condenser 1',
      // 'Enabling Condenser 2': 'Condenser 2',
    };

    let lastState = null as null|string;
    let lastMode = null as null|string;
    let accOfflineState = 0;
    let accOfflineMode = 0;
    for (let iR = 0; iR < state.asTable.length; iR++) {
      const row = state.asTable[iR];
      const rowDuration = row[0] as number;
      const rowMode = row[2] as string;
      const rowState = row[3] as string;
      if (!rowState) {
        accOfflineState += rowDuration;
      } else {
        if ((accOfflineState > 0) && (accOfflineState < 20 * 60)) {
          const currState = conversions[rowState] || rowState;
          if (currState === lastState) {
            let j = iR - 1;
            while ((j >= 0) && !state.asTable[j][3]) {
              state.asTable[j][3] = lastState;
              j--;
            }
          }
        }
        if (lastState !== rowState) {
          lastState = conversions[rowState] || rowState;
        }
        accOfflineState = 0;
      }
      if (!rowMode) {
        accOfflineMode += rowDuration;
      } else {
        if ((accOfflineMode > 0) && (accOfflineMode < 20 * 60)) {
          const currMode = rowMode;
          if (currMode === lastMode) {
            let j = iR - 1;
            while ((j >= 0) && !state.asTable[j][2]) {
              state.asTable[j][2] = lastMode;
              j--;
            }
          }
        }
        if (lastMode !== rowMode) {
          lastMode = rowMode;
        }
        accOfflineMode = 0;
      }
    }
  }

  useEffect(() => {
    fetchServerData();
  }, []);

  useEffect(() => {
    updateChartData();
  }, [state.devInfo, JSON.stringify(state.date)]);

  const { axisInfo, graphEnable, damCharts } = state;

  const isDesktop = window.matchMedia('(min-width: 768px)');
  const isMobile = !isDesktop;

  return (
    <>
      <ModalMobile isModalOpen={state.isModalOpen}>
        <Flex mb={32}>
          <Box width={1}>
            <ModalSection>
              <ModalTitleContainer>
                <ModalTitle>{t('Filtrar por')}</ModalTitle>
                <CloseIcon size="12px" onClick={() => setState({ isModalOpen: false })} />
              </ModalTitleContainer>
            </ModalSection>
          </Box>
        </Flex>
        <Flex flexWrap="wrap" pl={16} pr={16}>
          <Box width={1} mb={24}>
            <Datepicker setDate={setFormattedDate} date={state.date} />
          </Box>
          <Box width={1}>
            <Button type="button" variant="primary" onClick={() => setState({ isModalOpen: false })}>
              FILTRAR
            </Button>
          </Box>
        </Flex>
      </ModalMobile>
      {(isMobile)
        && (
        <Flex mt="32px">
          <Box width={1}>
            <div onClick={() => setState({ isModalOpen: true })}>
              <Button variant="primary">{t('botaoFiltrar')}</Button>
            </div>
          </Box>
        </Flex>
        )}
      <CardWrapper>
        {(isDesktop) && (
          <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={38}>
            <Box width={1 / 3}>
              <Datepicker setDate={setFormattedDate} date={state.date} />
            </Box>
          </Flex>
        )}
        {(!state.date) ? <NoGraph title={routeParams.devId.startsWith('DAM') ? t('historicoDoDam') : t('historicoDoDut')} /> : null}

        {state.date && (
        <Flex flexWrap="wrap">
          <Box width={[1, 1, 1, 1, 1]} minHeight="500px">
            <GraphWrapper>
              {state.isLoading && (
              <Overlay>
                <Loader />
              </Overlay>
              )}
              <Plot
                data={state.newCharts}
                layout={{
                  height: 500,
                  showlegend: true,
                  legend: { orientation: 'h' },
                  title: null,
                  margin: {
                    l: 90, r: 80, b: 20, t: 20, pad: 4,
                  },
                  font: {
                    size: 12,
                  },
                  xaxis: {
                    title: null,
                    showgrid: true,
                    zeroline: false,
                    showline: true,
                    tick0: state.date.toISOString(true),
                    dtick: 3600 * 1000,
                    range: [state.date.clone().toISOString(true), state.date.clone().add(24, 'h').toISOString(true)],
                    // tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((x) => state.date!.clone().add(x, 'h').toISOString(true)),
                    tickformat: '%-H',
                    hoverformat: '%H:%M:%S',
                  },
                  yaxis: {
                    title: null,
                    showgrid: true,
                    zeroline: false,
                    showline: true,
                    range: axisInfo.leftLimits,
                    tickvals: axisInfo.leftTicks,
                    ticktext: axisInfo.leftTicksLabels,
                  },
                  yaxis2: {
                    title: 'Umidade',
                    showgrid: true,
                    zeroline: false,
                    showline: true,
                    overlaying: 'y',
                    range: axisInfo.rightLimits,
                    tickvals: axisInfo.rightTicks,
                    ticktext: axisInfo.rightTickLabels,
                    side: 'right',
                  },
                  hovermode: 'x unified',
                  hoverdistance: 1920,
                  hoverlabel: {
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    font: {
                      color: colors.Black,
                    },
                  },
                }}
                config={{ responsive: true }}
                style={{ width: '100%' }}
              />
            </GraphWrapper>
          </Box>
        </Flex>
        )}
      </CardWrapper>

      {(state.profile.manageAllClients && state.asTable && state.asTable.length > 0)
        && (
        <CardWrapper style={{ fontSize: '85%' }}>
          <div>
            <p>
              <pre>{state.conclusionsDam.join('\n')}</pre>
            </p>
            {(state.dacsCharts || []).map((dacInfo) => (
              <div>
                <p>
                  <b>
                    {dacInfo.dacId}
                    :
                  </b>
                </p>
                <pre>{dacInfo.conclusions.join('\n')}</pre>
              </div>
            ))}
          </div>
          <Flex>
            <div>
              <Table>
                <thead>
                  <tr>
                    <th>{t('duracaoS')}</th>
                    <th>Prog</th>
                    <th>{t('modo')}</th>
                    <th>{t('estadoAtual')}</th>
                    <th>{t('modoEco')}</th>
                    <th>{t('modoEconomia')}</th>
                    {state.dacsCols.map((dacId, idac) => (
                      <>
                        <th key={`A-${dacId}`}>L1</th>
                        <th key={`B-${dacId}`}>{dacId}</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.asTable.map((row, irow) => (
                    <tr key={irow}>
                      <td>{formatNumberWithFractionDigits(row[0])}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                      <td>{row[4]}</td>
                      <td>{row[5]}</td>
                      {state.dacsCols.map((dacId, idac) => (
                        <>
                          <td key={`A-${dacId}`}>{row[6 + 2 * idac]}</td>
                          <td key={`B-${dacId}`}>{row[6 + 2 * idac + 1]}</td>
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Flex>
        </CardWrapper>
        )}
    </>
  );
}

function convertToTime(index: number) {
  if (index == null) return '';
  const hours = Math.floor(index / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((index % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(index % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

const GraphWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100%;
`;

const ModalMobile = styled.div<{ isModalOpen }>(
  ({ isModalOpen }) => `
  display:${isModalOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  background-color: ${colors.White};
  width: 100%;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
  transition: all .5s ease-in-out;

  @media (min-width: 768px) {
    display: none;
  }
`,
);

const ModalSection = styled.div`
  width: 100%;
  height: 80px;
  background: ${colors.Grey030};
  border-bottom: 2px solid ${colors.Grey100};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
`;

const ModalTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 16px;
  svg {
    cursor: pointer;
  }
`;

const ModalTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Grey400};
`;

const CardWrapper = styled.div`
  padding: 32px 24px;
  margin-top: 24px;
  background: ${colors.White};
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

const Table = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;
