import { Flex } from 'reflexbox';
import { BatteryIcon, InfoIcon, UtilityIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { IconWrapper, IconWrapperBig, IconWrapperMini } from './styles';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, LineChart, Tooltip, Line,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { getFormattedTimeFromHour, timeFormater, getDateFromHour } from '~/helpers/formatTime';
import { useStateVar } from '~/helpers/useStateVar';
import { ContainerGraphicIndexUsage, TextPNoMargin } from '../../DALs/styles';
import { ContainerCardDmtUsage } from '../styles';

const nobreakLabelFormater = (value: number) => {
  if (value === 0) return t('desligado').toUpperCase();
  if (value === 1) return t('bateria').toUpperCase();
  if (value === 2) return t('redeEletrica').toUpperCase();

  return value.toString();
};

export function resize(func: () => void) {
  document.body.onresize = function () {
    func();
  };
}

const illumLabelFormater = (value: number) => {
  if (value === 0) return t('desligado').toUpperCase();
  if (value === 1) return t('ligado').toUpperCase();

  return value.toString();
};

const UtilityCustomTick = (props) => {
  const {
    x, y, payload, anchor, utilityType,
  } = props;

  const label = utilityType === 'Nobreak' ? nobreakLabelFormater(payload.value) : illumLabelFormater(payload.value);

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
};

export const DmtUtilityHistoryCard = (props: {dateStart: string, timeRange: string, timeUsingBattery: number, numDays: number, y: number[], commonX: number[], xTicks: number[], xDomain: number[], dmtCode: string,
  name: string,
  datCode?: number, consumption?: number | null, utilityType: string }): JSX.Element => {
  const { t } = useTranslation();
  const [state, _render, setState] = useStateVar({
    widthPageCard: window.innerWidth,
  });
  resize(() => setState({ widthPageCard: document.body.clientWidth }));
  const customTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value } = payload;

    return <text x={x} y={y - 4} textAnchor="middle" className="recharts-text">{`${getFormattedTimeFromHour(value)}`}</text>;
  };

  return (
    <ContainerGraphicIndexUsage>
      <ContainerCardDmtUsage>
        <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
          <IconWrapper>
            <UtilityIcon />
          </IconWrapper>
          <Flex flexDirection="column">
            <span style={{ fontWeight: 'bold' }}>
              {props.name || '-'}
            </span>
            {props.utilityType === 'Nobreak' && (
              <span style={{ color: colors.Grey300, fontSize: 12, marginTop: 3 }}>
                {`${props.datCode || '-'}/ ${props.dmtCode || '-'}`}
              </span>
            )}
            {props.utilityType === 'Illumination' && (
              <span style={{ color: colors.Grey300, fontSize: 12, marginTop: 3 }}>
                {`${props.dmtCode || '-'}`}
              </span>
            )}
          </Flex>
        </Flex>
        {props.utilityType === 'Illumination' && (
          <Flex>
            <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <Flex flexDirection="column">
                <span style={{ fontWeight: 'bold' }}>
                  {(t('tempoDeUso'))}
                </span>
                {`${props.timeUsingBattery} ${t('horas')}`}
              </Flex>
            </Flex>
            <Flex flexDirection="column" ml={80}>
              <span style={{ fontWeight: 'bold' }}>
                {(t('consumo'))}
              </span>
              {(props.consumption === undefined || props.consumption === null) && (
                <div>
                  <IconWrapperMini>
                    <InfoIcon />
                  </IconWrapperMini>
                  {(t('semInformacao'))}
                </div>
              )}
              {(props.consumption !== undefined && props.consumption !== null) && `${props.consumption} kWh`}
            </Flex>
          </Flex>
        )}
        {props.utilityType === 'Nobreak' && (
          <>
            <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <IconWrapperBig>
                <BatteryIcon />
              </IconWrapperBig>
              <Flex flexDirection="column">
                <span style={{ fontWeight: 'bold' }}>
                  {(t('tempoUtilizandoBateria'))}
                </span>
                {`${props.timeUsingBattery} ${t('horas')}`}
              </Flex>
            </Flex>
            <Flex flexDirection="column">
              <span style={{ fontWeight: 'bold' }}>
                {(t('duracaoMediaDaBateria'))}
              </span>
              <div>
                <IconWrapperMini>
                  <InfoIcon />
                </IconWrapperMini>
                {(t('semInformacao'))}
              </div>
            </Flex>
            <Flex flexDirection="column">
              <span style={{ fontWeight: 'bold' }}>
                {(t('autonomia'))}
              </span>
              <div>
                <IconWrapperMini>
                  <InfoIcon />
                </IconWrapperMini>
                {(t('semInformacao'))}
              </div>
            </Flex>
          </>
        )}
      </ContainerCardDmtUsage>
      <Flex flexDirection="column" alignItems="flex-start" justifyContent="center">
        <TextPNoMargin>{t('tempoDeUso')}</TextPNoMargin>
        <ResponsiveContainer width="96%" height={props.timeRange === t('dia') ? 80 : 110}>
          <LineChart
            height={props.timeRange === t('dia') ? 80 : 110}
            margin={{
              top: 10,
              right: state.widthPageCard > 767 ? 30 : 5,
              left: state.widthPageCard > 767 ? 30 : 18,
              bottom: 0,
            }}
            data={props.commonX.map((v, i) => ({ x: v, y: props.y.length > i ? props.y[i] : null }))}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <Tooltip isAnimationActive={false} cursor={{ stroke: colors.Grey200, strokeWidth: 1 }} labelFormatter={(hour) => timeFormater(hour, props.dateStart)} formatter={props.utilityType === 'Nobreak' ? nobreakLabelFormater : illumLabelFormater} />

            <Line name={props.utilityType} yAxisId={props.utilityType} type="stepAfter" dataKey="y" dot={false} stroke={colors.BlueSecondary} strokeWidth={2.5} animationDuration={300} strokeDasharray="" />

            <YAxis type="number" yAxisId={props.utilityType} allowDataOverflow tick={<UtilityCustomTick utilityType={props.utilityType} />} ticks={props.utilityType === 'Nobreak' ? [0, 1, 2] : [0, 1]} interval={0} domain={props.utilityType === 'Nobreak' ? [0, 2] : [0, 1]} />
            {props.numDays && props.numDays > 1 ? (<XAxis allowDataOverflow xAxisId={props.utilityType} tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={customTick} type="number" dataKey="x" ticks={props.xTicks} domain={props.xDomain} />) : null}
            <XAxis allowDataOverflow type="number" dataKey="x" tickFormatter={(hour) => (props.numDays && props.numDays > 1 ? getDateFromHour(hour, props.dateStart) : getFormattedTimeFromHour(hour))} ticks={props.xTicks} domain={props.xDomain} />

          </LineChart>
        </ResponsiveContainer>
      </Flex>
    </ContainerGraphicIndexUsage>
  );
};
