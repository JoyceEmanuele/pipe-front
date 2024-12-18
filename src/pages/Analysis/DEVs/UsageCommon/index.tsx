import { t } from 'i18next';
import { colors } from '~/styles/colors';
import moment from 'moment';
import { Box, Flex } from 'reflexbox';
import { Loader } from '~/components';
import {
  ReferenceArea,
  ScatterChart,
  Scatter,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  PowerGraphic,
  ContainerInfo,
  Timer,
  ContainerTimer,
  MarginWrapper,
  Graphic,
  TextStyled,
  TextDataTimer,
  TextDataPower,
  TextDataKwh,
  ElipseTimer,
  RealTimeContainer,
  Title,
} from './styles';
import { formatArrHistory } from '~/helpers';
import { KwhIcon } from '~/icons';

function CustomTick(props) {
  const {
    x, y, payload, anchor,
  } = props;

  let label = '';
  switch (payload.value) {
    case 1: label = t('ligado'); break;
    case 0: label = t('desligado'); break;
  }

  return label && (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}

function CustomMonthXAxis(props: any) {
  const {
    x, y, payload, anchor, realLiveHistorical,
  } = props;
  if (realLiveHistorical.data && payload) {
    return (
      <g transform={`translate(${x - 8},${anchor ? y : y + 15})`}>
        <text fontSize={12} fill="#5D5D5D">
          {moment(payload.value, 'DD/MM/YYYY').format('DD')}
        </text>
        <br />
        <text style={{ transform: 'translate(2px, 18px)' }} fill={colors.Grey400}>
          {moment(payload.value, 'DD/MM/YYYY')
            .format('ddd')[0]}
        </text>
      </g>
    );
  } return <g />;
}

export const RenderUsageInformation = (props: {
  state: {
    dacInfo?: { hasAutomation?: boolean, DAC_KW?: number },
    dutInfo?: { hasAutomation?: boolean, DAC_KW?: number },
    selectedTimeRange: string,
    realLiveData: { data: any[], yearData: any[] },
    realLiveHistorical: {
      data: {
        Lcmp?: { v, c },
        Levp?: { v, c },
        Lcut?: { v, c },
        greenAreas?: { key: string, x1: number, x2: number }[],
        },
    },
    loading: boolean,
    mostradores: { tempoLigado_text?: string, consumo_kwh?: string, num_partidas?: number}
    },
  }) : JSX.Element => {
  const { state } = props;
  function decimalHourToTime(hour: number) {
    const sign = hour < 0 ? '-' : '';
    const min = Math.floor(Math.abs(hour));
    const sec = Math.floor((Math.abs(hour) * 60) % 60);

    return `${sign + (min < 10 ? '0' : '') + min}h ${sec < 10 ? '0' : ''}${sec}m`;
  }

  function toolTipLabelFormater(value) { return `${t('data')}: ${value}`; }

  function formaterHourTick(tick) { return `${tick}h`; }

  function toolTipFormater(value, name) {
    const valueFormated = decimalHourToTime(value);
    switch (name) {
      case 'MONTH_NUM_DEPARTS':
        return [value, t('tooltipPartida(s)')];
      case 'day_num_departs':
        return [value, t('tooltipPartida(s)')];
      case 'MONTH_HOURS_ON':
        return [valueFormated, t('tooltipHora(s)')];
      case 'day_hours_on':
        return [valueFormated, t('tooltipHora(s)')];
      case 'MONTH_HOURS_BLOCKED':
        return [valueFormated, t('tooltipHora(s)')];
      case 'day_hours_blocked':
        return [valueFormated, t('tooltipHora(s)')];
      default:
        return ['default', 'default'];
    }
  }

  const graphFormattedWeekDays = [
    { dat_report_week: t('diaDom') },
    { dat_report_week: t('diaSeg') },
    { dat_report_week: t('diaTer') },
    { dat_report_week: t('diaQua') },
    { dat_report_week: t('diaQui') },
    { dat_report_week: t('diaSex') },
    { dat_report_week: t('diaSab') },
  ];

  function yearPane() {
    return (
      <Flex justifyContent="center">
        <Box width={0.8} maxWidth={1000}>
          <RealTimeContainer>
            <Title>{`${t('horasEmFuncionamento')}:`}</Title>
            <ResponsiveContainer height={250}>
              <BarChart
                style={{ marginBottom: '20px', marginLeft: '-30px' }}
                data={state.realLiveData.yearData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="MONTH_REPORT" />
                <YAxis tickFormatter={formaterHourTick} />
                <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                <Bar dataKey="MONTH_HOURS_ON" fill={colors.Pink100} />
              </BarChart>
            </ResponsiveContainer>
          </RealTimeContainer>
          <RealTimeContainer>
            <Title>{`${t('numeroPartidas')}:`}</Title>
            <ResponsiveContainer height={250}>
              <BarChart
                style={{ marginBottom: '0px', marginLeft: '-30px' }}
                data={state.realLiveData.yearData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="MONTH_REPORT" />
                <YAxis />
                <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                <Bar dataKey="MONTH_NUM_DEPARTS" fill={colors.Blue400} />
              </BarChart>
            </ResponsiveContainer>
          </RealTimeContainer>
          {(state.dacInfo?.hasAutomation)
            && (
            <>
              <RealTimeContainer>
                <Title>{`${t('horasBloqueadas')}: `}</Title>
                <ResponsiveContainer height={250}>
                  <BarChart
                    style={{ marginBottom: '20px', marginLeft: '-30px' }}
                    data={state.realLiveData.yearData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="MONTH_REPORT" />
                    <YAxis tickFormatter={formaterHourTick} />
                    <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                    <Bar dataKey="MONTH_HOURS_BLOCKED" fill={colors.Green} />
                  </BarChart>
                </ResponsiveContainer>
              </RealTimeContainer>
            </>
            )}
        </Box>
      </Flex>
    );
  }

  function monthPane() {
    return (
      <Flex justifyContent="center">
        <Box width={0.8} maxWidth={1300}>
          <RealTimeContainer>
            <Title>{`${t('horasEmFuncionamento')}:`}</Title>
            <ResponsiveContainer height={250}>
              <BarChart
                margin={{
                  top: 5, right: 5, bottom: 20, left: 5,
                }}
                style={{ marginBottom: '20px', marginLeft: '-30px' }}
                data={state.realLiveData.data}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis interval={2} tick={<CustomMonthXAxis realLiveHistorical={state.realLiveHistorical} />} dataKey="dat_report_month" />
                <YAxis tickFormatter={formaterHourTick} ticks={[0, 12, 24]} />
                <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                <Bar dataKey="day_hours_on" fill={colors.Pink100} />
              </BarChart>
            </ResponsiveContainer>
          </RealTimeContainer>
          <RealTimeContainer>
            <Title>{`${t('numeroPartidas')}:`}</Title>
            <ResponsiveContainer height={250}>
              <BarChart
                margin={{
                  top: 5, right: 5, bottom: 20, left: 5,
                }}
                style={{ marginBottom: '0px', marginLeft: '-30px' }}
                data={state.realLiveData.data}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis interval={2} tick={<CustomMonthXAxis realLiveHistorical={state.realLiveHistorical} />} dataKey="dat_report_month" />
                <YAxis />
                <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                <Bar dataKey="day_num_departs" fill={colors.Blue400} />
              </BarChart>
            </ResponsiveContainer>
          </RealTimeContainer>
          {(state.dacInfo?.hasAutomation)
            && (
            <>
              <RealTimeContainer>
                <Title>{`${t('horasBloqueadas')}: `}</Title>
                <ResponsiveContainer height={250}>
                  <BarChart
                    margin={{
                      top: 5, right: 5, bottom: 20, left: 5,
                    }}
                    style={{ marginBottom: '20px', marginLeft: '-30px' }}
                    data={state.realLiveData.data}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis interval={2} tick={<CustomMonthXAxis realLiveHistorical={state.realLiveHistorical} />} dataKey="dat_report_month" />
                    <YAxis tickFormatter={formaterHourTick} ticks={[0, 12, 24]} />
                    <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                    <Bar dataKey="day_hours_blocked" fill={colors.Green} />
                  </BarChart>
                </ResponsiveContainer>
              </RealTimeContainer>
            </>
            )}
        </Box>
      </Flex>
    );
  }

  function weekPane() {
    return (
      <Flex justifyContent="center">
        <Box width={0.8} maxWidth={600}>
          <RealTimeContainer>
            <Title>{t('horasFuncionamento')}</Title>
            <ResponsiveContainer height={250}>
              <BarChart
                style={{ marginBottom: '20px', marginLeft: '-30px' }}
                data={state.realLiveData.data.length ? state.realLiveData.data : graphFormattedWeekDays}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dat_report_week" />
                <YAxis tickFormatter={formaterHourTick} ticks={[0, 12, 24]} />
                <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                <Bar dataKey="day_hours_on" fill={colors.Pink100} />
              </BarChart>
            </ResponsiveContainer>
          </RealTimeContainer>
          <RealTimeContainer>
            <Title>{`${t('numeroPartidas')}:`}</Title>
            <ResponsiveContainer height={250}>
              <BarChart
                data={state.realLiveData.data.length ? state.realLiveData.data : graphFormattedWeekDays}
                style={{ marginBottom: '0px', marginLeft: '-30px' }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dat_report_week" />
                <YAxis />
                <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                <Bar dataKey="day_num_departs" fill={colors.Blue400} />
              </BarChart>
            </ResponsiveContainer>
          </RealTimeContainer>
          {(state.dacInfo?.hasAutomation)
            && (
            <>
              <RealTimeContainer>
                <Title>{`${t('horasBloqueadas')}: `}</Title>
                <ResponsiveContainer height={250}>
                  <BarChart
                    style={{ marginBottom: '20px', marginLeft: '-30px' }}
                    data={state.realLiveData.data}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dat_report_week" />
                    <YAxis tickFormatter={formaterHourTick} ticks={[0, 12, 24]} />
                    <Tooltip labelFormatter={toolTipLabelFormater} formatter={toolTipFormater} />
                    <Bar dataKey="day_hours_blocked" fill={colors.Green} />
                  </BarChart>
                </ResponsiveContainer>
              </RealTimeContainer>
            </>
            )}
        </Box>
      </Flex>
    );
  }

  function dayPane() {
    return (
      <Flex justifyContent="center">
        <Box width={0.8} maxWidth={1300}>
          <RealTimeContainer>
            <Title>{t('usoTempoReal')}</Title>
            <ResponsiveContainer height={150}>
              <ScatterChart dots={false}>
                {
                  (state.realLiveHistorical.data?.greenAreas || []).map((item) => <ReferenceArea key={item.key} x1={item.x1} x2={item.x2} y1={0} y2={1} fill="#B3E841" fillOpacity={0.7} stroke="#B3E841" strokeOpacity={0.7} />)
                }
                <XAxis
                  type="number"
                  ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]}
                  dataKey="x"
                  interval={0}
                  allowDecimals={false}
                  name="hora"
                />
                <YAxis
                  type="number"
                  ticks={state.dacInfo?.hasAutomation ? [-2, -1, 0, 1] : [0, 1]}
                  // @ts-ignore
                  tick={<CustomTick />}
                  interval={0}
                  domain={state.dacInfo?.hasAutomation ? [-2.5, 1.5] : [-1, 2]}
                  dataKey="y"
                  label={{ value: '', angle: -90, color: '#656565' }}
                  width={90}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Scatter
                  dot={false}
                  strokeWidth={1}
                  fill={colors.Blue400}
                  line
                  shape={() => null}
                  // @ts-ignore
                  data={formatArrHistory(state.realLiveHistorical.data.Lcmp)}
                />
                {(state.dacInfo?.hasAutomation) && (
                <Scatter
                  dot={false}
                  strokeWidth={1}
                  fill={colors.Grey300}
                  line
                  shape={() => null}
                  // @ts-ignore
                  data={formatArrHistory(state.realLiveHistorical.data.Levp)}
                />
                )}
                {(state.dacInfo?.hasAutomation) && (
                <Scatter
                  dot={false}
                  strokeWidth={1}
                  fill={colors.Grey300}
                  line
                  shape={() => null}
                  // @ts-ignore
                  data={formatArrHistory(state.realLiveHistorical.data.Lcut)}
                />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </RealTimeContainer>
        </Box>
      </Flex>
    );
  }

  return (
    state.loading ? (
      <Flex justifyContent="center" alignItems="center" pt="150px" pb="150px">
        <Box width={1} justifyContent="center" alignItems="center">
          <Loader />
        </Box>
      </Flex>
    ) : (
      <>
        <Flex flexWrap="wrap" justifyContent="center" mt="16px">
          <Box>
            <MarginWrapper>
              <ContainerTimer>
                <ContainerInfo>
                  <TextStyled style={{ marginBottom: '10px' }}>{`${t('tempoLigado')}: `}</TextStyled>
                  <Graphic>
                    { /* @ts-ignore */}
                    <ElipseTimer data={state.mostradores.tempoLigado_hours || 0} />
                    <Timer color={colors.Grey400} />
                    <TextDataTimer>{state.mostradores?.tempoLigado_text}</TextDataTimer>
                  </Graphic>
                </ContainerInfo>
                <ContainerInfo>
                  <TextStyled style={{ marginBottom: '30px' }}>{`${t('consumo')} (kWh): `}</TextStyled>
                  <Graphic>
                    <TextDataKwh>{state.mostradores?.consumo_kwh}</TextDataKwh>
                    <KwhIcon color={colors.Grey400} />
                  </Graphic>
                </ContainerInfo>
                <ContainerInfo>
                  <TextStyled style={{ marginBottom: '20px' }}>{`${t('numeroPartidas')}:`}</TextStyled>
                  <Graphic>
                    <TextDataPower>{state.mostradores?.num_partidas}</TextDataPower>
                    <PowerGraphic color={colors.Grey400} />
                  </Graphic>
                </ContainerInfo>
              </ContainerTimer>
            </MarginWrapper>
          </Box>
        </Flex>
        {(state.selectedTimeRange === t('dia')) && dayPane()}
        {(state.selectedTimeRange === t('semana')) && weekPane()}
        {(state.selectedTimeRange === t('mes')) && monthPane()}
        {(state.selectedTimeRange === t('ano')) && yearPane()}
      </>
    )
  );
};
