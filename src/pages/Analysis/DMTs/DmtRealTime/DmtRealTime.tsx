import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Flex, Box } from 'reflexbox';
import { ApiResps, apiCall } from '~/providers';
import { useWebSocketLazy } from '~/helpers/wsConnection';
import { useStateVar } from '~/helpers/useStateVar';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Line, LineChart,
} from 'recharts';
import { colors } from '~/styles/colors';
import {
  GraphContainer, TitleFieldNobreak, TitleColumn,
} from './styles';
import { useTranslation } from 'react-i18next';
import { NobreakIcon } from '~/icons';
import moment from 'moment';
import { StyledLink } from '../styles';

export const DmtRealTime = (props: {dmtId: string}): JSX.Element => {
  const { dmtId } = props;
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaTempoReal')}</title>
      </Helmet>
      <DmtRealTimeContent dmtId={dmtId} />
    </>
  );
};

export function DmtRealTimeContent({ dmtId }: { dmtId: string }): JSX.Element {
  const { t } = useTranslation();
  const [state, render] = useStateVar({
    telemetries: [] as {pulses: number| null, status: string}[], // { status }[]
    graphData: [] as {x: string, value: number | null }[],
    lastConsumption: 0 as number,
    lastConsumptionCube: 0 as number,
    timezoneOffset: 0,
    electricalNetwork: {} as { port: string, id: number },
    nobreakList: [] as { port: string, id: number, name?: string, datId?: string}[],
    illuminationList: [] as { port: string, id: number, name? : string }[],
    F1: [] as { x: string, value: number }[],
    F2: [] as { x: string, value: number }[],
    F3: [] as { x: string, value: number }[],
    F4: [] as { x: string, value: number }[],
    portsInfo: {} as ApiResps['/dmt/get-dmt-ports-info'],
    initialTimeRef: new Date().toISOString().substring(0, 19),
    onTelmTimer: undefined as undefined|NodeJS.Timeout,
    hasNewTelm: false,
  });

  useEffect(() => {
    (async () => {
      try {
        if (dmtId) {
          await apiCall('/get-timezone-offset-by-devId', { devId: dmtId }).then((tzOffset) => {
            if (tzOffset != null) state.timezoneOffset = tzOffset;
          });
          await apiCall('/dmt/get-dmt-ports-info', { DMT_CODE: dmtId }).then((portInfo) => state.portsInfo = portInfo);
          if (state.portsInfo) {
            getPortsInfoGraph();
          }
          wsl.start(onWsOpen, onWsMessage, beforeWsClose);
          render();
        }
      } catch (err) {
        toast.error(t('erroDadosDispositivo'));
        console.log(err);
      }
    })();
  }, []);

  function getPortsInfoGraph() {
    const listNobreaks: { port: string, id: number, name?: string, datId?: string }[] = [];
    const listIllumination: { port: string, id: number, name?: string }[] = [];

    for (const port of state.portsInfo.ports) {
      if (port.associated && port.nobreakId) {
        listNobreaks.push({
          port: `F${port.port}`,
          id: port.nobreakId,
          name: port.name,
          datId: port.datId,
        });
      }
      if (port.associated && port.illuminationId) {
        listIllumination.push({
          port: `F${port.port}`,
          id: port.illuminationId,
          name: port.name,
        });
      }
      if (port.associated && port.eletricCircuitId) {
        state.electricalNetwork = {
          port: `F${port.port}`,
          id: port.eletricCircuitId,
        };
      }
    }

    state.nobreakList = listNobreaks;
    state.illuminationList = listIllumination;
  }

  const labelFormater = (value: number, isNobreak: boolean) => {
    if (value === 0) return t('desligado').toUpperCase();
    if (value === 1 && isNobreak) {
      return t('bateria').toUpperCase();
    }
    if (value && !isNobreak) {
      return t('ligado').toUpperCase();
    }
    if (value === 2 && isNobreak) return t('redeEletrica').toUpperCase();

    return value.toString();
  };

  const NobreakCustomTick = (props) => {
    const {
      x, y, payload, anchor, isNobreak,
    } = props;

    const label = labelFormater(payload.value, isNobreak);

    return (
      <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
        <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
          {label}
        </text>
      </g>
    );
  };

  function getTelemetryIllumination(port: string, telemetry) {
    const illuminationPorts = state.illuminationList.map((x) => x.port);

    if (illuminationPorts.includes(port) && telemetry) {
      return true;
    }
    return false;
  }

  function getTelemetryValue(port: string, telemetry) {
    if (getTelemetryIllumination(port, telemetry[port])) return 1;
    if (telemetry[state.electricalNetwork.port]) return 2;
    if (telemetry[port]) return 1;
    return 0;
  }

  function processReceivedTelemetry(telemetry) {
    state.F1.push({ x: telemetry.timestamp, value: getTelemetryValue('F1', telemetry) });
    state.F2.push({ x: telemetry.timestamp, value: getTelemetryValue('F2', telemetry) });
    state.F3.push({ x: telemetry.timestamp, value: getTelemetryValue('F3', telemetry) });
    state.F4.push({ x: telemetry.timestamp, value: getTelemetryValue('F4', telemetry) });
    state.F1.length > 6 && state.F1.shift();
    state.F2.length > 6 && state.F2.shift();
    state.F3.length > 6 && state.F3.shift();
    state.F4.length > 6 && state.F4.shift();
  }

  const wsl = useWebSocketLazy();

  function onWsOpen(wsConn) {
    wsConn.send({ type: 'dmtSubscribeRealTime', data: { DMT_CODE: dmtId } });
  }

  function onWsMessage(response) {
    if (response && response.type === 'dmtTelemetry') {
      const data = moment(new Date(response.data.timestamp || response.data.deviceTimestamp));
      response.data.timestamp = data.format('YYYY-MM-DDTHH:mm:ss').split('T')[1];
      processReceivedTelemetry(response.data);
      render();
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dmtUnsubscribeRealTime' });
  }

  if (state[state.electricalNetwork.port]) {
    state[state.electricalNetwork.port].forEach((data) => {
      if (data.value > 1) data.value = 1;
    });
  }

  return (
    <>
      <Flex mt={32}>
        <Box width={1}>
          <Flex justifyContent="left" alignItems="left" flexDirection="column" flexWrap="wrap" paddingTop="4rem" width="100%" padding={[0, 0, 0, 50, 50]}>
            {
              state[state.electricalNetwork.port] && (
                <Box width={[1, 1, 1, 1, 2 / 3]} paddingBottom={35}>
                  <TitleFieldNobreak>
                    <TitleColumn>
                      <h3 style={{ fontWeight: 'bold', margin: 0 }}>
                        Monitoramento Rede Elétrica
                      </h3>
                      <h4>
                        Status da Rede Elétrica
                      </h4>
                    </TitleColumn>
                  </TitleFieldNobreak>
                  <GraphContainer>
                    <ResponsiveContainer key={`rc_${state[state.electricalNetwork.port]?.length}`} width="100%" height={90}>
                      <LineChart
                        width={600}
                        height={300}
                        data={state[state.electricalNetwork.port] || []}
                        margin={{
                          top: 5, right: 20, bottom: 5, left: 35,
                        }}
                      >
                        <Line type="monotone" dataKey="value" stroke={colors.BlueSecondary} strokeWidth={2} dot={false} isAnimationActive={false} />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <XAxis dataKey="x" type="category" />
                        <YAxis
                          dataKey="value"
                          type="number"
                          tick={<NobreakCustomTick />}
                          ticks={[0, 1]}
                          interval={0}
                          domain={[0, 1]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </GraphContainer>
                </Box>
              )
            }
            <TitleFieldNobreak>
              <TitleColumn>
                <h3 style={{ fontWeight: 'bold', margin: 0 }}>
                  Portas do DMT
                </h3>
                <h4 style={{ paddingBottom: '30px' }}>
                  Status de portas associadas
                </h4>
              </TitleColumn>
            </TitleFieldNobreak>
            { state.nobreakList.length > 0 && state.nobreakList.map(((nobreak, key) => (
              <NobreakGraph name={nobreak.name} datId={nobreak.datId} data={state[nobreak.port]} t={t} key={key} />
            ))) }
            { state.illuminationList.length > 0 && state.illuminationList.map((illumination, key) => (
              <IlluminationGraph name={illumination.name} data={state[illumination.port]} key={key} t={t} />
            )) }
          </Flex>
        </Box>
      </Flex>
    </>
  );
}

function IlluminationGraph({ name, data, t }: { name?: string, data, t}) {
  return (
    <Box paddingBottom={35} width={[1, 1, 1, 1, 2 / 3]}>
      <TitleFieldNobreak>
        <NobreakIcon />
        <TitleColumn>
          <h3 style={{ fontWeight: 'bold', margin: 0, textDecoration: 'underline black' }}>
            { name }
          </h3>
        </TitleColumn>
      </TitleFieldNobreak>
      <h4 style={{ fontWeight: 'bold', paddingBottom: '10px', paddingLeft: '125px' }}>
        Feedback
      </h4>
      <GraphContainerAll data={data} isNobreak={false} ticks={[0, 1]} domain={[0, 1]} t={t} />
    </Box>
  );
}

const labelFormater = (value: number, isNobreak: boolean, t) => {
  if (value === 0) return t('desligado').toUpperCase();
  if (value === 1 && isNobreak) {
    return t('bateria').toUpperCase();
  }
  if (value && !isNobreak) {
    return t('ligado').toUpperCase();
  }

  if (value === 2 && isNobreak) return t('redeEletrica').toUpperCase();

  return value.toString();
};

const NobreakCustomTick = (props) => {
  const {
    x, y, payload, anchor, isNobreak, t,
  } = props;

  const label = labelFormater(payload.value, isNobreak, t);

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
};

function NobreakGraph({
  name, datId, data, t,
}: { name?: string, datId?: string, data, t }) {
  return (
    <Box paddingBottom={35} width={[1, 1, 1, 1, 2 / 3]}>
      <TitleFieldNobreak>
        <NobreakIcon />
        <TitleColumn>
          <h3 style={{ fontWeight: 'bold', margin: 0 }}>
            { name || '-' }
          </h3>
          <h4 style={{ color: 'blue', textDecoration: 'underline blue' }}>
            <StyledLink to={`/analise/ativo/${datId}/informacoes`}>{datId || ''}</StyledLink>
          </h4>
        </TitleColumn>
      </TitleFieldNobreak>
      <GraphContainerAll isNobreak data={data} ticks={[0, 1, 2]} domain={[0, 2]} t={t} />
    </Box>
  );
}

function GraphContainerAll({
  data, isNobreak, domain, ticks, t,
}) {
  return (
    <GraphContainer>
      { data.length && (
      <ResponsiveContainer key={`rc_${data.length}`} width="100%" height={90}>
        <LineChart
          width={600}
          height={300}
          data={data}
          margin={{
            top: 5, right: 20, bottom: 5, left: 35,
          }}
        >
          <Line type="monotone" dataKey="value" stroke={colors.BlueSecondary} strokeWidth={2} dot={false} isAnimationActive={false} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="x" type="category" />
          <YAxis
            dataKey="value"
            type="number"
            tick={<NobreakCustomTick isNobreak={isNobreak} t={t} />}
            ticks={ticks}
            interval={0}
            domain={domain}
          />
        </LineChart>
      </ResponsiveContainer>
      ) }

    </GraphContainer>
  );
}
