import { Link } from 'react-router-dom';
import { Flex } from 'reflexbox';
import { UtilityIcon, CorrectIcon, IncorrectIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { IconWrapper } from '../../DMTs/DmtUtilityHistoryCard/styles';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, LineChart, Tooltip, Line,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { getFormattedTimeFromHour, timeFormater, getDateFromHour } from '~/helpers/formatTime';
import { useStateVar } from '~/helpers/useStateVar';
import {
  TextPMargin, TextPNoMargin, ContainerInfoIndexUse, ContainerWithBorderInfo,
} from '../styles';
import { resize } from '../../DMTs/DmtUtilityHistoryCard';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const labelFormater = (value: number) => {
  if (value === 0) return t('desligado').toUpperCase();
  if (value === 1) return t('ligado').toUpperCase();

  return value.toString();
};

const IllumCustomTick = (props) => {
  const {
    x, y, payload, anchor,
  } = props;

  const label = labelFormater(payload.value);

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
};

const CorrectIncorrectIcon = (props: { feedbackValue: string|null, relayValue: string|null }): JSX.Element => {
  const { feedbackValue, relayValue } = props;
  const isEqual = (feedbackValue && relayValue) ? feedbackValue === relayValue : null;
  return (
    <>
      {isEqual !== null && (
        <>
          {isEqual ? <CorrectIcon /> : <IncorrectIcon />}
        </>
      )}
    </>
  );
};

export const IlluminationHistoryCard = (props: {dateStart: string, timeRange: string, numDays: number, relay: number[], feedback: number[], commonX: number[], xTicks: number[], xDomain: number[], dalCode?: string, illumInfo: { ID: number, NAME: string, GRID_VOLTAGE: number, GRID_CURRENT: number, PORT: number, FEEDBACK: number } }): JSX.Element => {
  const { t } = useTranslation();
  const [state, _render, setState] = useStateVar({
    widthPage: window.innerWidth,
  });
  resize(() => {
    setState({ widthPage: document.body.clientWidth });
  });
  const customTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value } = payload;

    return <text x={x} y={y - 4} textAnchor="middle" className="recharts-text">{`${getFormattedTimeFromHour(value)}`}</text>;
  };

  function getUsageTimeFormatted(dataArray: (number)[] | null) {
    const secondsOn = getUsageTime(dataArray);
    const pointsResolution = (5 * props.numDays * props.numDays);
    if (secondsOn != null) {
      const minutes = Math.floor(secondsOn / (60 / pointsResolution)) % 60;
      const hours = Math.floor(secondsOn / ((60 / pointsResolution) * 60));
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${t('horas')}`;
    }

    return null;
  }

  function getUsageTime(dataArray: (number)[] | null) {
    const secondsOn = dataArray?.reduce((acc, value) => {
      if (acc === null && value !== null) { acc = 0; }
      if (value === 1 && acc !== null) { acc += 1; }
      return acc;
    }, null as null|number);
    return secondsOn;
  }

  function getConsumption(dataArray) {
    const { GRID_VOLTAGE, GRID_CURRENT } = props.illumInfo;
    const secondsOn = getUsageTime(dataArray);
    const pointsResolution = (5 * props.numDays * props.numDays);
    if (secondsOn != null && GRID_VOLTAGE && GRID_CURRENT) {
      const power = GRID_VOLTAGE * GRID_CURRENT;
      const minutes = Math.floor(secondsOn / (60 / pointsResolution)) % 60;
      const hours = Math.floor(secondsOn / ((60 / pointsResolution) * 60));
      const cons = (hours + (minutes / 60)) * power / 1000;
      return `${formatNumberWithFractionDigits(cons.toFixed(3), { minimum: 0, maximum: 3 })}kWh`;
    }
    return null;
  }

  const feedbackUsage = getUsageTimeFormatted(props.feedback);
  const feedbackConsumption = getConsumption(props.feedback);
  const relayUsage = getUsageTimeFormatted(props.relay);
  const relayConsumption = getConsumption(props.relay);

  function renderUsageTimeInfo() {
    return (
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column">
          <span style={{ fontWeight: 700 }}>
            {(t('tempoDeUso'))}
          </span>
          <Flex flexWrap="wrap">
            {!!props.illumInfo.FEEDBACK && (
              <Flex flexDirection="column" width={props.illumInfo.PORT ? 150 : null}>
                <span style={{ fontWeight: 600 }}>
                  {(t('real'))}
                </span>
                <span>
                  <span style={{ marginRight: '5px' }}>{feedbackUsage}</span>
                  <CorrectIncorrectIcon feedbackValue={feedbackUsage} relayValue={relayUsage} />
                </span>
              </Flex>
            )}
            {!!props.illumInfo.PORT && (
              <Flex flexDirection="column">
                <span style={{ fontWeight: 600 }}>
                  {(t('programacao'))}
                </span>
                {relayUsage}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    );
  }

  function renderConsumptionInfo() {
    if (feedbackConsumption || relayConsumption) {
      return (
        <>
          <div style={{ border: '0.8px solid #D1D1D1', margin: '0px 50px' }} />
          <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
            <Flex flexDirection="column">
              <span style={{ fontWeight: 'bold' }}>
                {(t('consumo'))}
              </span>
              <Flex flexWrap="wrap">
                {!!props.illumInfo.FEEDBACK && (
                  <Flex flexDirection="column" width={props.illumInfo.PORT ? 150 : null}>
                    <span style={{ fontWeight: 600 }}>
                      {(t('real'))}
                    </span>
                    <span>
                      <span style={{ marginRight: '5px' }}>{feedbackConsumption}</span>
                      <CorrectIncorrectIcon feedbackValue={feedbackConsumption} relayValue={relayConsumption} />
                    </span>
                  </Flex>
                )}
                {!!props.illumInfo.PORT && (
                  <Flex flexDirection="column">
                    <span style={{ fontWeight: 600 }}>
                      {(t('programacao'))}
                    </span>
                    {relayConsumption}
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
        </>
      );
    }
  }

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      style={{
        border: '1px solid #d7d7d7', borderLeft: `7px solid ${colors.BlueSecondary}`, padding: state.widthPage > 767 ? 30 : 15, borderRadius: 10, margin: '10px 0',
      }}
    >
      <ContainerWithBorderInfo>
        <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom={10}>
          <IconWrapper>
            <UtilityIcon />
          </IconWrapper>
          <Flex flexDirection="column">
            <Link to={`/analise/utilitario/iluminacao/${props.illumInfo.ID}/informacoes`} style={{ fontWeight: 'bold', color: 'black' }}>
              {props.illumInfo.NAME || '-'}
            </Link>
            <span style={{ color: colors.Grey300, fontSize: 12, marginTop: 3 }}>
              {props.dalCode || '-'}
            </span>
          </Flex>
        </Flex>
        <ContainerInfoIndexUse>
          {renderUsageTimeInfo()}
          {renderConsumptionInfo()}
        </ContainerInfoIndexUse>
      </ContainerWithBorderInfo>
      <Flex flexDirection="column" alignItems="flex-start" justifyContent="center">
        <TextPNoMargin>{t('tempoDeUso')}</TextPNoMargin>

        {!!(props.illumInfo.FEEDBACK && props.illumInfo.PORT) && (
          <TextPMargin>{t('real')}</TextPMargin>
        )}
        {!!props.illumInfo.FEEDBACK && (
          <ResponsiveContainer width="100%" height={props.timeRange === t('dia') ? 80 : 110}>
            <LineChart
              height={props.timeRange === t('dia') ? 80 : 110}
              margin={{
                top: 10,
                right: state.widthPage > 767 ? 30 : 5,
                left: state.widthPage > 767 ? 30 : 5,
                bottom: 0,
              }}
              data={props.commonX.map((v, i) => ({ x: v, y: props.feedback?.length > i ? props.feedback[i] : null }))}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <Tooltip isAnimationActive={false} cursor={{ stroke: colors.Grey200, strokeWidth: 1 }} labelFormatter={(hour) => timeFormater(hour, props.dateStart)} formatter={labelFormater} />

              <Line name="Status" yAxisId="Relay" type="stepAfter" dataKey="y" dot={false} stroke={colors.BlueSecondary} strokeWidth={3} animationDuration={300} strokeDasharray="" />

              <YAxis type="number" yAxisId="Relay" allowDataOverflow tick={<IllumCustomTick />} ticks={[0, 1]} interval={0} domain={[0, 1]} />
              {props.numDays && props.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="Relay" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={customTick} type="number" dataKey="x" ticks={props.xTicks} domain={props.xDomain} />) : null}
              <XAxis allowDataOverflow type="number" dataKey="x" tickFormatter={(hour) => (props.numDays && props.numDays > 1 ? getDateFromHour(hour, props.dateStart) : getFormattedTimeFromHour(hour))} ticks={props.xTicks} domain={props.xDomain} />

            </LineChart>
          </ResponsiveContainer>
        )}

        {!!(props.illumInfo.FEEDBACK && props.illumInfo.PORT) && (
          <TextPMargin>
            {t('programacao')}
          </TextPMargin>
        )}
        {!!props.illumInfo.PORT && (
          <ResponsiveContainer width="100%" height={props.timeRange === t('dia') ? 80 : 110}>
            <LineChart
              height={props.timeRange === t('dia') ? 80 : 110}
              margin={{
                top: 10,
                right: state.widthPage > 767 ? 30 : 5,
                left: state.widthPage > 767 ? 30 : 5,
                bottom: 0,
              }}
              data={props.commonX.map((v, i) => ({ x: v, y: props.relay?.length > i ? props.relay[i] : null }))}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <Tooltip isAnimationActive={false} cursor={{ stroke: colors.Grey200, strokeWidth: 1 }} labelFormatter={(hour) => timeFormater(hour, props.dateStart)} formatter={labelFormater} />

              <Line name="Status" yAxisId="Relay" type="stepAfter" dataKey="y" dot={false} stroke="#8E8E8E" strokeWidth={3} animationDuration={300} strokeDasharray="" />

              <YAxis type="number" yAxisId="Relay" allowDataOverflow tick={<IllumCustomTick />} ticks={[0, 1]} interval={0} domain={[0, 1]} />
              {props.numDays && props.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="Relay" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={customTick} type="number" dataKey="x" ticks={props.xTicks} domain={props.xDomain} />) : null}
              <XAxis allowDataOverflow type="number" dataKey="x" tickFormatter={(hour) => (props.numDays && props.numDays > 1 ? getDateFromHour(hour, props.dateStart) : getFormattedTimeFromHour(hour))} ticks={props.xTicks} domain={props.xDomain} />

            </LineChart>
          </ResponsiveContainer>
        )}
      </Flex>
    </Flex>
  );
};
