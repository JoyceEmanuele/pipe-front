import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Flex, Box } from 'reflexbox';
import { apiCall } from '~/providers';
import { Card } from '~/components';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import { LabelData, LabelInfo, LabelSwitch } from '~/components/ModalWindow/styles';
import { useWebSocket } from '~/helpers/wsConnection';
import { useStateVar } from '~/helpers/useStateVar';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Line, LineChart, Tooltip,
} from 'recharts';
import { colors } from '~/styles/colors';
import {
  Text, Line as LineLegend, ColoredLine, WaterTooltip, Timer, Calendar,
} from './styles';
import { useTranslation } from 'react-i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const DmaRealTime = (props: {dmaId: string}): JSX.Element => {
  const { dmaId } = props;
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaTempoReal')}</title>
      </Helmet>
      {/* @ts-ignore */}
      <DmaRealTimeContents dmaId={dmaId} />
    </>
  );
};

const getCurrDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 1; // Months start at 0!
  const dd = today.getDate();

  return `${dd < 10 ? `0${dd}` : dd}/${mm < 10 ? `0${mm}` : mm}/${yyyy}`;
};

export function DmaRealTimeContents({ dmaId }) {
  const { t } = useTranslation();
  const [shouldNotDisplayLiters, setShouldNotDisplayLiters] = useState(false);
  const [state, render, setState] = useStateVar({
    telemetries: [] as {pulses: number| null, status: string}[], // { status }[]
    graphData: [] as {x: string, value: number | null }[],
    graphDataCubic: [] as {x: string, value: number | null }[],
    lastConsumption: 0 as number,
    lastConsumptionCube: 0 as number,
    devInfo: {} as any,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await apiCall('/dma/get-dma-info', { dmaId });
        setState({ devInfo: data });
        if (!state.devInfo.HYDROMETER_MODEL) {
          toast.error(t('erroHidrometroCadastrado'));
        }
      } catch (err) {
        toast.error(t('erroInformacoesDispositivos'));
      }
    })();
  }, []);

  const changeSamplingPeriod = async (interval: number) => {
    try {
      await apiCall('/dma/set-sampling-period', { dmaId, samplingPeriod: interval });
    } catch (err) {
      toast.error(t('erroTelemetrias'));
    }
  };

  const reformatDate = (dateStr) => {
    const dArr = dateStr.split('-');
    return `${dArr[2]}/${dArr[1]}/${dArr[0].substring(2)}`;
  };

  const getLitersPerPulse = () => {
    if (!state.devInfo.HYDROMETER_MODEL) {
      toast.error(t('erroHidrometroCadastrado'));
      return null;
    }

    return Number(state.devInfo.HYDROMETER_MODEL.substring(
      state.devInfo.HYDROMETER_MODEL.indexOf('(') + 1,
      state.devInfo.HYDROMETER_MODEL.lastIndexOf(')'),
    ).split(' ')[0]);
  };

  const updateGraphData = (response, date, litersPerPulse) => {
    if (response.data.status !== 'ONLINE') {
      state.graphData.push({ x: response.data.timestamp, date, value: null });
      state.graphDataCubic.push({ x: response.data.timestamp, date, value: 0.0000 });
    } else if (state.telemetries.length === 0) {
      state.graphData.push({ x: response.data.timestamp, date, value: 0 });
      state.graphDataCubic.push({ x: response.data.timestamp, date, value: 0.0000 });
    } else if (!response.data.pulses || !state.telemetries[state.telemetries.length - 1].pulses) {
      state.graphData.push({ x: response.data.timestamp, date, value: 0 });
      state.graphDataCubic.push({ x: response.data.timestamp, date, value: 0.0000 });
    } else {
      const currValue = state.lastConsumption + litersPerPulse * (Number(response.data.pulses) - Number(state.telemetries[state.telemetries.length - 1].pulses));

      if (currValue < 0) {
        state.lastConsumption = 0;
        state.lastConsumptionCube = 0;
        state.graphData.push({ x: response.data.timestamp, date, value: 0 });
        state.graphDataCubic.push({ x: response.data.timestamp, date, value: 0 });
      } else {
        state.graphData.push({ x: response.data.timestamp, date, value: currValue });
        state.graphDataCubic.push({ x: response.data.timestamp, date, value: Number((currValue / 1000).toFixed(4)) });
        state.lastConsumption = currValue;
        state.lastConsumptionCube = Number((currValue / 1000).toFixed(4));
      }
    }

    const dataCopy = state.graphData;
    setState({ graphData: [] });
    setState({ graphData: dataCopy });
    const dataCopyCubic = state.graphDataCubic;
    setState({ graphDataCubic: [] });
    setState({ graphDataCubic: dataCopyCubic });

    state.telemetries.push(response.data);
  };

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  function onWsOpen(wsConn) {
    wsConn.send({ type: 'dmaSubscribeRealTime', data: { DMA_ID: dmaId } });
    changeSamplingPeriod(10);
  }

  function onWsMessage(response) {
    if (response && response.type === 'dmaTelemetry') {
      if (!response.data.pulses || response.data.saved_data) return;

      const date = reformatDate(response.data.timestamp.split('T')[0]);
      response.data.timestamp = response.data.timestamp.split('T')[1];

      response.data.pulses = Number(String(response.data.pulses));

      const litersPerPulse = getLitersPerPulse();
      if (litersPerPulse === null) return;

      updateGraphData(response, date, litersPerPulse);
      render();
    }
  }

  function beforeWsClose(wsConn) {
    changeSamplingPeriod(900);
    wsConn.send({ type: 'dmaUnsubscribeRealTime' });
  }

  const CustomizedToolTip = ({ payload }: any) => {
    if (payload != null) {
      return (
        <WaterTooltip>
          <span>{t('leitura')}</span>
          <p>
            <strong>
              {payload && payload?.length > 0 ? formatNumberWithFractionDigits(payload[0].payload.value) : '-'}
            </strong>
            <span>{shouldNotDisplayLiters ? 'm³' : 'litros'}</span>
          </p>
          <Flex width="100%" alignItems="center" justifyContent="space-between">
            <Box>
              <Calendar color={colors.BlueSecondary} />
              {payload && payload?.length > 0 ? payload[0].payload.date : '-'}
            </Box>
            &nbsp;
            <Box>
              <Timer color={colors.BlueSecondary} />
              {payload && payload?.length > 0 ? payload[0].payload.x : '-'}
            </Box>
          </Flex>

        </WaterTooltip>
      );
    }
    return <div />;
  };

  return (
    <>
      <Flex mt={32}>
        <Box width={1}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{t('consumoAgua')}</h2>
          <Card>
            <Flex alignItems="center">
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginRight: '20px',
                    }}
                  >
                    <LabelInfo>
                      {t('idDoDispositivo')}
                    </LabelInfo>
                    <LabelData>{dmaId}</LabelData>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <LabelInfo>
                      {t('unidadeDeMedida')}
                    </LabelInfo>
                    <div>
                      <LabelSwitch>{t('litros')}</LabelSwitch>
                      <ToggleSwitchMini
                        checked={shouldNotDisplayLiters}
                        onClick={() => setShouldNotDisplayLiters(!shouldNotDisplayLiters)}
                        style={{ marginLeft: '8px', marginRight: '8px' }}
                      />
                      <LabelSwitch>{t('metrosCubicos')}</LabelSwitch>
                    </div>
                  </div>
                </div>
                <div>
                  <LabelData>
                    {getCurrDate()}
                  </LabelData>

                </div>
              </div>

            </Flex>
            <Flex justifyContent="center" alignItems="center" flexDirection="row" flexWrap="wrap" paddingTop="4rem" width="100%">
              <Box width={[1, 1, 1, 1, 2 / 3]}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    width={600}
                    height={300}
                    data={shouldNotDisplayLiters ? state.graphDataCubic : state.graphData}
                    margin={{
                      top: 5, right: 20, bottom: 5, left: 0,
                    }}
                  >
                    <Line type="monotone" dataKey="value" stroke={colors.BlueSecondary} strokeWidth={2} dot={false} />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <Tooltip content={<CustomizedToolTip />} />
                    <XAxis dataKey="x" type="category" />
                    <YAxis
                      dataKey="value"
                      type="number"
                      label={{
                        value: shouldNotDisplayLiters ? t('consumoM3') : t('consumoL'), position: 'insideLeft', angle: -90, color: '#656565',
                      }}
                      tickFormatter={(value) => formatNumberWithFractionDigits(value, { minimum: 0, maximum: 2 })}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Box width={[1, 1, 1, 1, 1 / 3]}>
                <Flex justifyContent="center" alignItems="center">
                  <LineLegend>
                    <Text style={{ fontWeight: 'bold' }}>
                      {`${t('consumoAgua')}:`}
                      &nbsp;
                    </Text>
                    <Text>
                      {`${formatNumberWithFractionDigits((state.graphData.length !== 0 ? shouldNotDisplayLiters ? state.graphDataCubic[state.graphDataCubic.length - 1]?.value : state.graphData[state.graphData.length - 1]?.value : '-') || 0)} ${shouldNotDisplayLiters ? '(m³)' : '(L)'}` }
                    </Text>
                    <ColoredLine color={colors.BlueSecondary} />
                  </LineLegend>
                </Flex>
              </Box>
            </Flex>

          </Card>
        </Box>
      </Flex>
    </>
  );
}
