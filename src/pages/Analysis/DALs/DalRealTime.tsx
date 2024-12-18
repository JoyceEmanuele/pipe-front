import { useEffect } from 'react';
import { Flex, Box } from 'reflexbox';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useStateVar } from '~/helpers/useStateVar';
import { UtilityIcon } from '~/icons';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Scatter, ScatterChart,
} from 'recharts';
import { useWebSocketLazy } from '~/helpers/wsConnection';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import { InfoGraphCont } from './styles';

const TSPAN = 5 * 60 * 1000;
const ONLINE_TIMEOUT = 50 * 1000;

function CustomTickFeedback(props) {
  const {
    x, y, payload, anchor,
  } = props;

  let label = payload.value;
  if (payload.value) {
    label = 'LIGADO';
  } else {
    label = 'DESLIGADO';
  }

  return (
    <g transform={`translate(${x - 70},${anchor ? y : y - 14})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'start'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}

function formatTimeToTimeAxios(date: moment.Moment, seconds = 0, format = 'HH:mm:ss') {
  return moment(date)
    .add(seconds, 'seconds')
    .format(format);
}

export const DalRealTimeContent = ({ dalInfo }): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ devId }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      graphData: {
        Control: [[] as { x: number, L?: number }[]],
        Feedback: [[] as { x: number, L?: number }[]],
      },
      illuminationList: dalInfo?.dal?.illuminationList || [],
      initialTimeRef: new Date().toISOString().substring(0, 19),
      onTelmTimer: undefined as undefined|NodeJS.Timeout,
      hasNewTelm: false,
      timezoneOffset: 0,
    };
    return state;
  });

  const { devId } = routeParams;

  useEffect(() => {
    (async function () {
      try {
        if (dalInfo.DEV_ID) {
          await apiCall('/get-timezone-offset-by-devId', { devId: dalInfo.DEV_ID }).then((tzOffset) => {
            if (tzOffset != null) state.timezoneOffset = tzOffset;
          });
          wsl.start(onWsOpen, onWsMessage, beforeWsClose);
          render();
        }
      } catch (err) {
        toast.error(t('erroDadosDispositivo'));
        console.log(err);
      }
    }());
  }, []);

  const wsl = useWebSocketLazy();
  function onWsOpen(wsConn) {
    wsConn.send({ type: 'dalSubscribeRealTime', data: { DAL_CODE: devId } });
  }
  function onWsMessage(response) {
    if (response && response.type === 'dalTelemetry') {
      if (response.data.timestamp || (response.data.status === 'ONLINE' && response.data.deviceTimestamp)) {
        const data = moment(new Date(response.data.timestamp));
        response.data.timestamp = data.format('YYYY-MM-DDTHH:mm:ss');
        processReceivedTelemetry(response.data, state.graphData);
        clearTimeout(state.onTelmTimer);
        state.hasNewTelm = true;
        state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
        render();
      }
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dalUnsubscribeRealTime' });
  }

  function processReceivedTelemetry(telemetry, currentData) {
    telemetry.time = new Date(telemetry.timestamp);
    const time = telemetry.time.getTime();
    telemetry.Relays.forEach((relay, index) => {
      if (!currentData.Control[index]) currentData.Control[index] = [];
      addTelemetryPoint(currentData.Control[index], { x: time, L: relay });
    });
    telemetry.Feedback.forEach((feedback, index) => {
      if (!currentData.Feedback[index]) currentData.Feedback[index] = [];
      addTelemetryPoint(currentData.Feedback[index], { x: time, L: feedback });
    });
    return currentData;
  }

  function addTelemetryPoint(chartPoints, newPoint?) {
    if (chartPoints.length === 0) {
      if (newPoint) {
        const chartTimeIni = new Date(newPoint.x - TSPAN).getTime();
        chartPoints.push({ x: chartTimeIni, L: NaN });
        chartPoints.push({ x: new Date(newPoint.x - 30 * 1000).getTime(), L: newPoint.L });
        chartPoints.push(newPoint);
      }
      return;
    }

    let lastPoint = chartPoints[chartPoints.length - 1];

    if (newPoint && (newPoint.x > lastPoint.x)) {
      const timeEndThreshold = new Date(newPoint.x - ONLINE_TIMEOUT).getTime();
      if (lastPoint.x < timeEndThreshold) {
        chartPoints.push({ x: timeEndThreshold, L: NaN });
      }
      chartPoints.push(newPoint);
      lastPoint = newPoint;
    }
    const chartTimeIni = new Date(lastPoint.x - TSPAN).getTime();
    // Remove old points
    while (chartPoints.length > 0 && (chartPoints[0].x < chartTimeIni)) {
      chartPoints.shift();
    }
    if (chartPoints[0].x > chartTimeIni) {
      chartPoints.unshift({ x: chartTimeIni, L: NaN });
    }
  }

  function CustomTickTime(props) {
    const {
      x, y, payload, anchor,
    } = props;
    return (
      <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
        <text x={0} y={0} dy={16} fontSize="10px" textAnchor={anchor || 'end'} fill="#666">
          {(payload.value > 1000000)
            ? new Date(payload.value).toLocaleTimeString()
            : formatTimeToTimeAxios(moment(state.initialTimeRef), payload.value)}
        </text>
      </g>
    );
  }

  return (
    <Flex flexDirection="column" padding={[1, 1, 30, 30]}>
      <span style={{ fontSize: '16px', fontWeight: 700 }}>{t('portasDoDal')}</span>
      <span style={{ marginBottom: '20px' }}>{t('statusPortasAssociadas')}</span>

      {state.illuminationList.map((illum, index) => (
        <Flex key={illum.ID} mt={20} flexDirection="column" mb={20}>
          <Flex alignItems="center">
            <UtilityIcon />
            <Link
              style={{
                color: 'black', textDecoration: 'underline', fontWeight: 700, marginLeft: '10px',
              }}
              to={`/analise/utilitario/iluminacao/${illum.ILLUMINATION_ID}/informacoes`}
            >
              {illum.NAME}
            </Link>
          </Flex>

          <InfoGraphCont>
            {illum.PORT && (
              <Flex flexDirection="column" mt={20}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{t('controle')}</span>
                <div style={{ width: '100%', marginTop: '20px', marginLeft: '-30px' }}>
                  <GraphContainer CustomTickTime={CustomTickTime}>
                    <Scatter
                      scale="time"
                      yAxisId="status"
                      line={{ stroke: '#363BC4', strokeWidth: 2 }}
                      shape={() => null}
                      data={state.graphData.Control[illum.PORT - 1]}
                      isAnimationActive={false}
                    />
                  </GraphContainer>
                </div>
              </Flex>
            )}
            {illum.FEEDBACK && (
              <Flex flexDirection="column" mt={20}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{t('feedback')}</span>
                <div style={{ width: '100%', marginTop: '20px', marginLeft: '-30px' }}>
                  <GraphContainer CustomTickTime={CustomTickTime}>
                    <Scatter yAxisId="status" line={{ stroke: '#202370', strokeWidth: 2 }} shape={() => null} data={state.graphData.Feedback[illum.FEEDBACK - 1]} isAnimationActive={false} />
                  </GraphContainer>
                </div>
              </Flex>
            )}
            <div style={{ border: '1px solid #00000021', marginTop: '30px' }} />
          </InfoGraphCont>
        </Flex>
      ))}
    </Flex>
  );
};

const GraphContainer = ({ children, CustomTickTime }): JSX.Element => (
  <Flex flexWrap="wrap">
    <Box width={[1, 1, 1, 1, 1]} height={100}>
      <ResponsiveContainer>
        <ScatterChart
          height={350}
          margin={{
            top: 5,
            bottom: 5,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            tick={<CustomTickTime anchor="middle" />}
            tickCount={6}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            type="number"
            yAxisId="status"
            dataKey="L"
            tick={<CustomTickFeedback />}
            ticks={[0, 1]}
            domain={[0, 1]}
            interval={0}
            width={90}
          />
          { children }
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  </Flex>
);
