import { useEffect, useState } from 'react';
import { t } from 'i18next';
import Checkbox from '@material-ui/core/Checkbox';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Scatter, ScatterChart,
} from 'recharts';
import { Flex, Box } from 'reflexbox';

import * as axisCalc from '~/helpers/axisCalc';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { useWebSocketLazy } from '~/helpers/wsConnection';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import {
  StatusL1,
  ColoredDottedLine,
  ColoredLine,
  CheckboxLine,
  Text,
  Container,
  CardWrapper,
  CardTitle,
  DivisionLine,
} from './styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const TSPAN = 5 * 60 * 1000;
const ONLINE_TIMEOUT = 10 * 1000;

function invBool(v) {
  return v === 1 ? 0 : v === 0 ? 1 : v;
}

function formatTimeToTimeAxios(date: moment.Moment, seconds = 0, format = 'HH:mm:ss') {
  return moment(date)
    .add(seconds, 'seconds')
    .format(format);
}

export const RealTime = (): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ devId }>();
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaTempoReal')}</title>
      </Helmet>
      <DevLayout devInfo={devInfo} />
      <RealTimeContents onDevInfoUpdate={render} />
    </>
  );
};

function CustomTickTime(props) {
  const {
    x, y, payload, anchor, initialTimeRef,
  } = props;
  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="9px">
        {(payload.value > 1000000)
          ? new Date(payload.value).toLocaleTimeString()
          : formatTimeToTimeAxios(moment(initialTimeRef), payload.value)}
      </text>
    </g>
  );
}

function CustomTickTemp(props) {
  const {
    x, y, payload, anchor, axisInfo,
  } = props;

  let label = payload.value;
  if (payload.value < (axisInfo.L1start - 5)) {
    label = ((payload.value % 5) > -2.5) ? t('liberadoAbreviado') : t('bloqueadoAbreviado');
  } else if (payload.value < axisInfo.L1start) {
    label = ((payload.value % 5) > -2.5) ? t('ligadoAbreviado') : t('desligadoAbreviado');
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}

function CustomTickPress(props) {
  const {
    x, y, payload, anchor,
  } = props;

  return (
    <g transform={`translate(${x + 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'start'} fill="#666" fontSize="10px">
        {payload.value}
      </text>
    </g>
  );
}

function ChartRealTime(props) {
  const {
    state,
    graphEnable,
    isDesktop,
    profile,
  } = props;

  let styleLabelTemperature = {};
  let styleLabelPressure = {};

  if (isDesktop) {
    styleLabelTemperature = { value: `${t('temperatura')}`, angle: -90, color: '#656565' };
    styleLabelPressure = { value: `${t('pressao')}`, angle: -90, color: '#656565' };
  } else {
    styleLabelTemperature = {
      value: `${t('temperaturaC')}`,
      position: 'top',
      dx: 54,
      dy: -10,
      style: {
        fontSize: '12px',
        fontWeight: '500',
      },
    };
    styleLabelPressure = {
      value: `${t('pressaoBar')}`,
      position: 'top',
      dx: -40,
      dy: -10,
      style: {
        fontSize: '12px',
        fontWeight: '500',
      },
    };
  }

  return (
    <Box width={[1, 1, 1, 1, 2 / 3]} height={350}>
      {!isDesktop && profile?.manageAllClients && state.devInfo?.dac?.FLUID_TYPE && (
        <DacFluid state={state} isDesktop={false} />
      )}
      <ResponsiveContainer>
        <ScatterChart
          height={350}
          margin={{
            top: 50,
            left: 5,
            right: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            tick={<CustomTickTime anchor="middle" initialTimeRef={state.initialTimeRef} />}
            tickCount={isDesktop ? 6 : 3}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            type="number"
            yAxisId="temp"
            dataKey="y"
            tick={<CustomTickTemp axisInfo={state.axisInfo} />}
            ticks={state.axisInfo.tempTicks}
            domain={state.axisInfo.tempLimits}
            interval={0}
            label={styleLabelTemperature}
          />
          <YAxis
            type="number"
            yAxisId="press"
            dataKey="y"
            tick={<CustomTickPress />}
            ticks={state.axisInfo.presTicks}
            domain={state.axisInfo.presLimits}
            orientation="right"
            label={styleLabelPressure}
          />

          {graphEnable.Tamb && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Tamb} fill={colors.Green} isAnimationActive={false} />
          )}
          {graphEnable.Tsuc && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Tsuc} fill={colors.Blue300} isAnimationActive={false} />
          )}
          {graphEnable.Tliq && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Tliq} fill={colors.Red} isAnimationActive={false} />
          )}
          {graphEnable.deltaT && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.deltaT} fill="#181842" isAnimationActive={false} strokeDasharray="5 5" />
          )}
          {graphEnable.Psuc && (
            <Scatter yAxisId="press" line shape={() => null} data={state.graphData.Psuc} fill={colors.Blue400} isAnimationActive={false} strokeDasharray="5 5" />
          )}
          {graphEnable.Pliq && (
            <Scatter yAxisId="press" line shape={() => null} data={state.graphData.Pliq} fill={colors.Red} isAnimationActive={false} strokeDasharray="5 5" />
          )}
          {graphEnable.Tsc && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Tsc} fill={colors.Blue500} isAnimationActive={false} />
          )}
          {graphEnable.Tsh && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Tsh} fill={colors.Pink400} isAnimationActive={false} />
          )}
          {graphEnable.Lcmp && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Lcmp} fill={colors.Grey400} isAnimationActive={false} />
          )}
          {graphEnable.Levp && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Levp} fill={colors.Grey400} isAnimationActive={false} />
          )}
          {graphEnable.Lcut && (
            <Scatter yAxisId="temp" line shape={() => null} data={state.graphData.Lcut} fill={colors.Orange600} isAnimationActive={false} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
}

function CommandStatus(props) {
  const {
    status,
    isDesktop,
    labelGreen,
    labelRed,
    context,
  } = props;

  if (status !== 'undefined') {
    let statusText = '';

    switch (context) {
      case 'signal':
        statusText = status === 1 ? labelGreen : labelRed;
        break;
      case 'block':
        statusText = status === 0 ? labelGreen : labelRed;
        break;
      default:
        break;
    }

    const statusColor = statusText === labelGreen ? colors.Green : colors.Red;

    const additionalStyles = isDesktop ? {} : { marginLeft: 0, minWidth: '20px' };

    return (
      <StatusL1 style={{ ...additionalStyles }} color={statusColor}>
        {statusText}
      </StatusL1>
    );
  }

  return <span />;
}

function DacFluid(props) {
  const { state, isDesktop } = props;

  let styleText: React.CSSProperties = {};
  let styleFluidType: React.CSSProperties = {};

  if (isDesktop) {
    styleText = { paddingLeft: '42px' };
    styleFluidType = {};
  } else {
    styleText = { fontSize: '12px', float: 'right', marginRight: '24px' };
    styleFluidType = { fontWeight: 'bold' };
  }

  return (
    <Text style={styleText}>
      {`${t('fluido')}: `}
      <Text style={styleFluidType}>
        {state.devInfo?.dac?.FLUID_TYPE}
      </Text>
    </Text>
  );
}

function RealTimeDesktop(props) {
  const {
    state,
    hwCfg,
    graphEnable,
    profile,
    render,
  } = props;
  return (
    <>
      <Flex mt={32}>
        <Box width={1}>
          <Container>
            <Flex flexWrap="wrap">
              <ChartRealTime graphEnable={graphEnable} state={state} isDesktop />
              <Box width={[1, 1, 1, 1, 1 / 3]}>
                <CheckboxLine>
                  <Checkbox
                    checked={graphEnable.Tamb}
                    onChange={() => { graphEnable.Tamb = !graphEnable.Tamb; render(); }}
                    value={graphEnable.Tamb}
                    color="primary"
                  />
                  <Text>
                    {t('temperatura')}
                    {' '}
                    {state.devInfo?.dac?.DAC_TYPE === 'self' ? t('retorno') : t('externa')}
                    {' '}
                    {formatNumberWithFractionDigits(state.lastData?.Tamb ?? '-')}
                    {' '}
                    [°C]
                  </Text>
                  <ColoredLine color={colors.Green} />
                </CheckboxLine>
                {
                  verifyIsHeatExchanger(hwCfg, state)
                    ? (
                      <>
                        <CheckboxLine>
                          <Checkbox
                            checked={graphEnable.Tliq}
                            onChange={() => { graphEnable.Tliq = !graphEnable.Tliq; render(); }}
                            value={graphEnable.Tliq}
                            color="primary"
                          />
                          <Text>
                            {t('temperatura')}
                            {' '}
                            {verifyIsFancoilOrHeatExchanger(hwCfg, state) ? t('deRetornoAgua') : t('deLiquido')}
                            {' '}
                            {state.lastData?.Tliq ? formatNumberWithFractionDigits(state.lastData?.Tliq) : '-'}
                            {' '}
                            [°C]
                          </Text>
                          <ColoredLine color={colors.Red} />

                        </CheckboxLine>
                        <CheckboxLine>
                          <Checkbox
                            checked={graphEnable.Tsuc}
                            onChange={() => { graphEnable.Tsuc = !graphEnable.Tsuc; render(); }}
                            value={graphEnable.Tsuc}
                            color="primary"
                          />
                          <Text>
                            {t('temperatura')}
                            {' '}
                            {verifyIsFancoilOrHeatExchanger(hwCfg, state) ? t('saidaDeAgua') : t('deSuccao')}
                            {' '}
                            {state.lastData?.Tsuc ? formatNumberWithFractionDigits(state.lastData?.Tsuc) : '-'}
                            {' '}
                            [°C]
                          </Text>
                          <ColoredLine color={colors.Blue300} />
                        </CheckboxLine>
                      </>
                    ) : (
                      <>
                        <CheckboxLine>
                          <Checkbox
                            checked={graphEnable.Tsuc}
                            onChange={() => { graphEnable.Tsuc = !graphEnable.Tsuc; render(); }}
                            value={graphEnable.Tsuc}
                            color="primary"
                          />
                          <Text>
                            {t('temperatura')}
                            {' '}
                            {verifyIsFancoilOrHeatExchanger(hwCfg, state) ? t('saidaDeAgua') : t('deSuccao')}
                            {' '}
                            {state.lastData?.Tsuc ? formatNumberWithFractionDigits(state.lastData?.Tsuc) : '-'}
                            {' '}
                            [°C]
                          </Text>
                          <ColoredLine color={colors.Blue300} />
                        </CheckboxLine>

                        <CheckboxLine>
                          <Checkbox
                            checked={graphEnable.Tliq}
                            onChange={() => { graphEnable.Tliq = !graphEnable.Tliq; render(); }}
                            value={graphEnable.Tliq}
                            color="primary"
                          />
                          <Text>
                            {t('temperatura')}
                            {' '}
                            {verifyIsFancoilOrHeatExchanger(hwCfg, state) ? t('deRetornoAgua') : t('deLiquido')}
                            {' '}
                            {state.lastData?.Tliq ? formatNumberWithFractionDigits(state.lastData?.Tliq) : '-'}
                            {' '}
                            [°C]
                          </Text>
                          <ColoredLine color={colors.Red} />

                        </CheckboxLine>
                      </>
                    )
                }

                {verifyIsFancoilOrHeatExchanger(hwCfg, state) && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.deltaT}
                      onChange={() => { graphEnable.deltaT = !graphEnable.deltaT; render(); }}
                      value={graphEnable.deltaT}
                      color="primary"
                    />
                    <Text>
                      ΔT =
                      {' '}
                      {state.lastData?.deltaT ? formatNumberWithFractionDigits(state.lastData?.deltaT) : '-'}
                      {' '}
                      [°C]
                    </Text>
                    <ColoredDottedLine color="#181842" />
                  </CheckboxLine>
                )}
                {hwCfg.hasPsuc && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Psuc}
                      onChange={() => { graphEnable.Psuc = !graphEnable.Psuc; render(); }}
                      value={graphEnable.Psuc}
                      color="primary"
                    />
                    <Text>
                      {t('pressaoSuccao')}
                      {' '}
                      {state.lastData?.Psuc ? formatNumberWithFractionDigits(state.lastData?.Psuc) : '-'}
                      {' '}
                      [
                      {state.usePsi ? 'PSI' : 'Bar'}
                      ]
                    </Text>
                    <ColoredDottedLine color={colors.Blue400} />
                  </CheckboxLine>
                )}
                {hwCfg.hasPliq && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Pliq}
                      onChange={() => { graphEnable.Pliq = !graphEnable.Pliq; render(); }}
                      value={graphEnable.Pliq}
                      color="primary"
                    />
                    <Text>
                      {t('pressaoLiquido')}
                      {' '}
                      {state.lastData?.Pliq ? formatNumberWithFractionDigits(state.lastData?.Pliq) : '-'}
                      {' '}
                      {' '}
                      [
                      {state.usePsi ? 'PSI' : 'Bar'}
                      ]
                    </Text>
                    <ColoredDottedLine color={colors.Red} />
                  </CheckboxLine>
                )}
                {hwCfg.hasTsc && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Tsc}
                      onChange={() => { graphEnable.Tsc = !graphEnable.Tsc; render(); }}
                      value={graphEnable.Tsc}
                      color="primary"
                    />
                    <Text>
                      {t('subresfriamento')}
                      {' '}
                      {state.lastData?.Tsc ? formatNumberWithFractionDigits(state.lastData?.Tsc) : '-'}
                      {' '}
                      [ΔTºC]
                    </Text>
                    <ColoredLine color={colors.Blue500} />
                  </CheckboxLine>
                )}
                {hwCfg.hasTsh && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Tsh}
                      onChange={() => { graphEnable.Tsh = !graphEnable.Tsh; render(); }}
                      value={graphEnable.Tsh}
                      color="primary"
                    />
                    <Text>
                      {t('superaquecimento')}
                      {' '}
                      {state.lastData?.Tsh ? formatNumberWithFractionDigits(state.lastData?.Tsh) : '-'}
                      {' '}
                      [ΔTºC]
                    </Text>
                    <ColoredLine color={colors.Pink400} />
                  </CheckboxLine>
                )}
                {(!hwCfg.hasAutomation) && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Lcmp}
                      onChange={() => { graphEnable.Lcmp = !graphEnable.Lcmp; render(); }}
                      value={graphEnable.Lcmp}
                      color="primary"
                    />
                    <Text>{t('sinalComando')}</Text>
                    <CommandStatus context="signal" isDesktop status={state.lastData?.Lcmp} labelGreen={t('ligado')} labelRed={t('desligado')} />
                    <ColoredLine color={colors.Grey400} />
                  </CheckboxLine>
                )}
                {hwCfg.hasAutomation && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Levp}
                      onChange={() => { graphEnable.Levp = !graphEnable.Levp; render(); }}
                      value={graphEnable.Levp}
                      color="primary"
                    />
                    <Text>{t('sinalComando')}</Text>
                    <CommandStatus context="signal" isDesktop status={state.lastData?.Levp} labelGreen={t('ligado')} labelRed={t('desligado')} />
                    <ColoredLine color={colors.Grey400} />
                  </CheckboxLine>
                )}
                {hwCfg.hasAutomation && (
                  <CheckboxLine>
                    <Checkbox
                      checked={graphEnable.Lcut}
                      onChange={() => { graphEnable.Lcut = !graphEnable.Lcut; render(); }}
                      value={graphEnable.Lcut}
                      color="primary"
                    />
                    <Text>{t('bloqueioComando')}</Text>
                    <CommandStatus context="block" isDesktop status={state.lastData?.Lcut} labelGreen={t('liberado')} labelRed={t('bloqueado')} />
                    <ColoredLine color={colors.Orange600} />
                  </CheckboxLine>
                )}
                {profile.manageAllClients && state.devInfo?.dac?.FLUID_TYPE && (
                  <CheckboxLine>
                    <DacFluid state={state} isDesktop />
                  </CheckboxLine>
                )}
              </Box>
            </Flex>
          </Container>
        </Box>
      </Flex>
      {(profile.manageAllClients) && (
        <CardWrapper style={{ marginTop: '32px' }}>
          <CardTitle>{t('deteccaoFalhas')}</CardTitle>
          {state.debugFaults.map((fault) => (
            <div key={fault.desc}>
              {' '}
              &nbsp;
              {' '}
              {fault.desc}
            </div>
          ))}
        </CardWrapper>
      )}
    </>
  );
}

function verifyIsFancoilOrHeatExchanger(hwCfg, state) {
  const result = !!(hwCfg.isFanCoil || state.devInfo?.dac?.DAC_APPL === 'trocador-de-calor');
  return result;
}

function verifyIsHeatExchanger(hwCfg, state) {
  const result = !!(state.devInfo?.dac?.DAC_APPL === 'trocador-de-calor');
  return result;
}

function RealTimeMobile(props) {
  const {
    state,
    hwCfg,
    graphEnable,
    profile,
    render,
  } = props;
  return (
    <Flex>
      <Box width={1}>
        <Flex flexWrap="wrap">
          <ChartRealTime graphEnable={graphEnable} state={state} isDesktop={false} profile={profile} />
          <Box
            style={{
              position: 'relative',
              width: '100%',
              marginTop: '60px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            <DivisionLine />
            <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
              <Checkbox
                checked={graphEnable.Tsuc}
                onChange={() => { graphEnable.Tsuc = !graphEnable.Tsuc; render(); }}
                value={graphEnable.Tsuc}
                style={{
                  color: colors.Blue300,
                  padding: '0 5px 0 10px',
                }}
              />
              <Text style={{ fontSize: '13px' }}>
                {t('temperatura')}
                {' '}
                {verifyIsFancoilOrHeatExchanger(hwCfg, state) ? t('saidaDeAgua') : t('deSuccao')}
                {'\n'}
                <h1>
                  {`${state.lastData?.Tsuc ? formatNumberWithFractionDigits(state.lastData?.Tsuc) : '-'} °C`}
                </h1>
              </Text>
            </CheckboxLine>
            <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
              <Checkbox
                checked={graphEnable.Tamb}
                onChange={() => { graphEnable.Tamb = !graphEnable.Tamb; render(); }}
                value={graphEnable.Tamb}
                style={{
                  color: colors.Green,
                  padding: '0 5px 0 10px',
                }}
              />
              <Text style={{ fontSize: '13px' }}>
                {t('temperatura')}
                {' '}
                {state.devInfo?.dac?.DAC_TYPE === 'self' ? t('retorno') : t('externa')}
                {'\n'}
                <h1>
                  {`${state.lastData?.Tamb ? formatNumberWithFractionDigits(state.lastData?.Tamb) : '-'} °C`}
                </h1>
              </Text>
            </CheckboxLine>
            {hwCfg.hasPsuc && (
              <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                <Checkbox
                  checked={graphEnable.Psuc}
                  onChange={() => { graphEnable.Psuc = !graphEnable.Psuc; render(); }}
                  value={graphEnable.Psuc}
                  style={{
                    color: colors.Blue400,
                    padding: '0 5px 0 10px',
                  }}
                />
                <Text style={{ fontSize: '13px' }}>
                  {t('pressaoSuccao')}
                  {'\n'}
                  <h1>
                    {`${state.lastData?.Psuc ? formatNumberWithFractionDigits(state.lastData?.Psuc) : '-'} ${state.usePsi ? 'PSI' : 'Bar'}`}
                  </h1>
                </Text>
              </CheckboxLine>
            )}
            <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
              <Checkbox
                checked={graphEnable.Tliq}
                onChange={() => { graphEnable.Tliq = !graphEnable.Tliq; render(); }}
                value={graphEnable.Tliq}
                style={{
                  color: colors.Red,
                  padding: '0 5px 0 10px',
                }}
              />
              <Text style={{ fontSize: '13px' }}>
                {t('temperatura')}
                {' '}
                {verifyIsFancoilOrHeatExchanger(hwCfg, state) ? t('deRetornoAgua') : t('deLiquido')}
                {'\n'}
                <h1>
                  {`${state.lastData?.Tliq ? formatNumberWithFractionDigits(state.lastData?.Tliq) : '-'} °C`}
                </h1>
              </Text>
            </CheckboxLine>
            {hwCfg.hasTsh && (
              <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                <Checkbox
                  checked={graphEnable.Tsh}
                  onChange={() => { graphEnable.Tsh = !graphEnable.Tsh; render(); }}
                  value={graphEnable.Tsh}
                  style={{
                    color: colors.Pink400,
                    padding: '0 5px 0 10px',
                  }}
                />
                <Text style={{ fontSize: '13px' }}>
                  {t('superaquecimento')}
                  {'\n'}
                  <h1>
                    {`${state.lastData?.Tsh ? formatNumberWithFractionDigits(state.lastData?.Tsh) : '-'} °C`}
                  </h1>
                </Text>
              </CheckboxLine>
            )}
            {hwCfg.hasPliq && (
              <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                <Checkbox
                  checked={graphEnable.Pliq}
                  onChange={() => { graphEnable.Pliq = !graphEnable.Pliq; render(); }}
                  value={graphEnable.Pliq}
                  style={{
                    color: colors.Red,
                    padding: '0 5px 0 10px',
                  }}
                />
                <Text style={{ fontSize: '13px' }}>
                  {t('pressaoLiquido')}
                  {'\n'}
                  <h1>
                    {`${state.lastData?.Pliq ? formatNumberWithFractionDigits(state.lastData?.Pliq) : '-'} ${state.usePsi ? 'PSI' : 'Bar'}`}
                  </h1>
                </Text>
              </CheckboxLine>
            )}
            {verifyIsFancoilOrHeatExchanger(hwCfg, state) && (
              <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                <Checkbox
                  checked={graphEnable.deltaT}
                  onChange={() => { graphEnable.deltaT = !graphEnable.deltaT; render(); }}
                  value={graphEnable.deltaT}
                  style={{
                    color: colors.Blue500,
                    padding: '0 5px 0 10px',
                  }}
                />
                <Text style={{ fontSize: '13px' }}>
                  ΔT
                  {'\n'}
                  <h1>
                    {`${state.lastData?.deltaT ? formatNumberWithFractionDigits(state.lastData?.deltaT) : '-'} °C`}
                  </h1>
                </Text>
              </CheckboxLine>
            )}
            {hwCfg.hasTsc && (
              <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                <Checkbox
                  checked={graphEnable.Tsc}
                  onChange={() => { graphEnable.Tsc = !graphEnable.Tsc; render(); }}
                  value={graphEnable.Tsc}
                  style={{
                    color: colors.Blue500,
                    padding: '0 5px 0 10px',
                  }}
                />
                <Text style={{ fontSize: '13px' }}>
                  {t('subresfriamento')}
                  {'\n'}
                  <h1>
                    {`${state.lastData?.Tsc ? formatNumberWithFractionDigits(state.lastData?.Tsc) : '-'} °C`}
                  </h1>
                </Text>
              </CheckboxLine>
            )}
            {hwCfg.hasAutomation ? (
              <>
                <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                  <Checkbox
                    checked={graphEnable.Levp}
                    onChange={() => { graphEnable.Levp = !graphEnable.Levp; render(); }}
                    value={graphEnable.Levp}
                    style={{
                      color: colors.Grey400,
                      padding: '0 5px 0 10px',
                    }}
                  />
                  <Text style={{ fontSize: '13px' }}>
                    {t('sinalComando')}
                    <CommandStatus context="signal" isDesktop={false} status={state.lastData?.Levp} labelGreen={t('ligado')} labelRed={t('desligado')} />
                  </Text>
                </CheckboxLine>
                <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                  <Checkbox
                    checked={graphEnable.Lcut}
                    onChange={() => { graphEnable.Lcut = !graphEnable.Lcut; render(); }}
                    value={graphEnable.Lcut}
                    style={{
                      color: colors.Orange600,
                      padding: '0 5px 0 10px',
                    }}
                  />
                  <Text style={{ fontSize: '13px' }}>
                    {t('bloqueioComando')}
                    <CommandStatus context="block" isDesktop={false} status={state.lastData?.Lcut} labelGreen={t('liberado')} labelRed={t('bloqueado')} />
                  </Text>
                </CheckboxLine>
              </>
            ) : (
              <CheckboxLine style={{ flexBasis: '50%', alignItems: 'flex-start', padding: '0 10px 10px 0' }}>
                <Checkbox
                  checked={graphEnable.Lcmp}
                  onChange={() => { graphEnable.Lcmp = !graphEnable.Lcmp; render(); }}
                  value={graphEnable.Lcmp}
                  style={{
                    color: colors.Grey400,
                    padding: '0 5px 0 10px',
                  }}
                />
                <Text style={{ fontSize: '13px' }}>
                  {t('sinalComando')}
                  <CommandStatus context="signal" isDesktop={false} status={state.lastData?.Lcmp} labelGreen={t('ligado')} labelRed={t('desligado')} />
                </Text>
              </CheckboxLine>
            )}
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}

export function RealTimeContents({ onDevInfoUpdate = undefined as undefined | (() => void) }) {
  const { t } = useTranslation();
  const { devId: dacId } = useParams<{ devId: string }>();
  const [profile] = useState(getUserProfile);
  const [state, render] = useStateVar(() => {
    const state = {
      dacId,
      devInfo: getCachedDevInfoSync(dacId),
      graphData: {
        Lcmp: [] as { x: number, y?: number, L?: number }[],
        Levp: [] as { x: number, y?: number, L?: number }[],
        Lcut: [] as { x: number, y?: number, L?: number }[],
        Tamb: [] as { x: number, y: number }[],
        Tsuc: [] as { x: number, y: number }[],
        Tliq: [] as { x: number, y: number }[],
        Psuc: [] as { x: number, y: number }[],
        Pliq: [] as { x: number, y: number }[],
        Tsc: [] as { x: number, y: number }[],
        Tsh: [] as { x: number, y: number }[],
        deltaT: [] as { x: number, y: number }[],
      },
      axisDataLimits: {
        minTval: undefined as undefined|number,
        maxTval: undefined as undefined|number,
        minPval: undefined as undefined|number,
        maxPval: undefined as undefined|number,
      },
      hasNewTelm: false,
      axisInfo: {
        L1start: null as null|number,
        tempLimits: [0, 40],
        tempTicks: [0, 5, 10, 15, 20, 25, 30, 35, 40],
        presLimits: [0, 35],
        presTicks: [0, 5, 10, 15, 20, 25, 30, 35],
      },
      lastData: null as null|{
        Lcmp: number,
        Levp: number,
        Lcut: number,
        Tsuc: number,
        Tliq: number,
        Tamb: number,
        Psuc: number,
        Pliq: number,
        Tsc: number,
        Tsh: number,
        deltaT: number,
      },
      debugFaults: [] as { desc: string }[],
      usePsi: (profile.prefsObj.pressureUnit === 'psi'),
      graphEnable: {
        Tamb: true,
        Tsuc: true,
        Tliq: true,
        Psuc: true,
        Pliq: true,
        Tsc: true,
        Tsh: true,
        Lcmp: true,
        Levp: true,
        Lcut: true,
        deltaT: true,
      },
      hwCfg: {
        hasPliq: true, hasPsuc: true, hasTsc: true, hasTsh: true, hasAutomation: false, isFanCoil: false, calculate_L1_fancoil: false,
      },
      initialTimeRef: new Date().toISOString().substr(0, 19),
      onTelmTimer: undefined as undefined|NodeJS.Timeout,
      timezoneOffset: 0,
    };
    return state;
  });

  const { graphEnable } = state;
  const { hwCfg } = state;
  state.hasNewTelm = false;
  const isDesktop = window.matchMedia('(min-width: 768px)');

  const lws = useWebSocketLazy();

  useEffect(() => {
    (async function () {
      const historyPromise = apiCall('/dac/get-recent-history-v2', {
        dacId: state.dacId,
        intervalLength_s: 5 * 60, // 5 min
        intervalLength: 5 * 60 * 1000, // 5 min
      }).catch(console.log);

      const devInfo = await getCachedDevInfo(dacId, {});
      const tzOffset = await apiCall('/get-timezone-offset-by-devId', { devId: dacId }).catch((err) => {
        toast.error(t('erroObterFusoHorario'));
        console.log(err);
      });
      if (tzOffset != null) {
        state.timezoneOffset = tzOffset;
        const data = moment();
        const dateWithOffset = data.utcOffset(state.timezoneOffset);
        state.initialTimeRef = dateWithOffset.format('YYYY-MM-DDTHH:mm:ss');
      }
      if (onDevInfoUpdate) onDevInfoUpdate();
      state.devInfo = devInfo;
      const dacInfo = devInfo.dac;
      state.hwCfg.hasPsuc = (dacInfo.P0Psuc || dacInfo.P1Psuc);
      state.hwCfg.hasPliq = (dacInfo.P0Pliq || dacInfo.P1Pliq);
      state.hwCfg.hasTsh = state.hwCfg.hasPsuc;
      state.hwCfg.hasTsc = state.hwCfg.hasPliq;
      state.hwCfg.hasAutomation = dacInfo.hasAutomation;
      state.hwCfg.isFanCoil = (dacInfo.DAC_APPL === 'fancoil');
      state.hwCfg.calculate_L1_fancoil = (dacInfo.SELECTED_L1_SIM === 'fancoil');
      if (!state.hwCfg.hasPsuc) state.graphEnable.Psuc = false;
      if (!state.hwCfg.hasPliq) state.graphEnable.Pliq = false;
      if (!state.hwCfg.hasAutomation) state.graphEnable.Levp = false;
      if (!state.hwCfg.hasAutomation) state.graphEnable.Lcut = false;
      if (state.hwCfg.hasAutomation) state.graphEnable.Lcmp = false;
      render();
      lws.start(onWsOpen, onWsMessage, beforeWsClose);

      const histResp = await historyPromise;
      if (histResp && histResp.data) {
        if ((state.hwCfg.isFanCoil || state.devInfo.dac!.DAC_APPL === 'trocador-de-calor') && histResp.data.Tliq && histResp.data.Tsuc) {
          const histData = Object.assign(histResp.data, { deltaT: [] as number[] });
          histData.deltaT = [...histResp.data.Tliq];
          for (let i = 0; i < histResp.data.Tliq.length; i++) {
            if (histResp.data.Tliq[i] && histResp.data.Tsuc[i]) histData.deltaT[i] = Number((histResp.data.Tliq[i] - histResp.data.Tsuc[i]).toFixed(2));
          }
        }
        processReceivedHistory(histResp.data, state.usePsi, state.graphData);
        render();
      }
    }()).catch(console.log);
  }, []);

  function onWsOpen(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: { dac_id: state.dacId } }));
  }

  function onWsMessage(payload) {
    if (payload && payload.type === 'dacTelemetry') {
      const data = moment(new Date(payload.data.timestamp));
      payload.data.timestamp = data.format('YYYY-MM-DDTHH:mm:ss');
      processReceivedTelemetry(payload.data, state.usePsi, state.graphData);
      state.lastData = payload.data;

      if (state.hwCfg.calculate_L1_fancoil && state.lastData) {
        state.lastData.Lcmp = ((state.lastData.Tsuc - state.lastData.Tliq) >= 1.5) ? 1 : 0;
      }
      if ((hwCfg.isFanCoil || state.devInfo.dac!.DAC_APPL === 'trocador-de-calor') && state.lastData && state.lastData.Tliq && state.lastData.Tsuc) {
        state.lastData.deltaT = Number((state.lastData.Tliq - state.lastData.Tsuc).toFixed(2));
      }
      if (payload.data.debugFaults instanceof Array) {
        payload.data.debugFaults.forEach((item) => {
          item.desc = `${item.faultName}: ${Math.round(Math.min(100, (item.t / item.time) * 100))}% ${item.condDesc}`;
        });
        if (payload.data.debugFaults.length === 0) payload.data.debugFaults = [{ desc: '(nenhuma)' }];
      } else payload.data.debugFaults = [];
      state.debugFaults = payload.data.debugFaults;
      clearTimeout(state.onTelmTimer);
      state.hasNewTelm = true;
      state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
      // render();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: {} }));
  }

  function processReceivedHistory(devHist, convertToPsi, currentData) {
    const newData: typeof state.graphData = {
      Lcmp: [],
      Levp: [],
      Lcut: [],
      Tamb: [],
      Tsuc: [],
      Tliq: [],
      Psuc: [],
      Pliq: [],
      Tsc: [],
      Tsh: [],
      deltaT: [],
    };

    let maxTval = 10;
    let minTval = 10;
    let maxPval = 10;
    let minPval = 10;

    let x = 0;
    if (devHist && devHist.initialTimestamp && devHist.timeAxis) {
      const datIni = new Date(devHist.initialTimestamp).getTime();
      const { timeAxis } = devHist;
      const LcmpHist = devHist.Lcmp;
      const LevpHist = devHist.Levp;
      const LcutHist = devHist.Lcut;
      const TambHist = devHist.Tamb;
      const TsucHist = devHist.Tsuc;
      const TliqHist = devHist.Tliq;
      const PsucHist = devHist.Psuc;
      const PliqHist = devHist.Pliq;
      const TscHist = devHist.Tsc;
      const TshHist = devHist.Tsh;
      const deltaTHist = devHist.deltaT;

      x = datIni;
      for (let i = 0; i < timeAxis.length; i++) {
        x = datIni + timeAxis[i] * 1000;
        if (convertToPsi) {
          if (PsucHist) PsucHist[i] *= 14.50377;
          if (PliqHist) PliqHist[i] *= 14.50377;
        }
        if (i > 0 && timeAxis[i] - timeAxis[i - 1] > 10) {
          newData.Lcmp.push({ x: x - 1000, y: NaN });
          newData.Levp.push({ x: x - 1000, y: NaN });
          newData.Lcut.push({ x: x - 1000, y: NaN });
          newData.Tamb.push({ x: x - 1000, y: NaN });
          newData.Tsuc.push({ x: x - 1000, y: NaN });
          newData.Tliq.push({ x: x - 1000, y: NaN });
          newData.Psuc.push({ x: x - 1000, y: NaN });
          newData.Pliq.push({ x: x - 1000, y: NaN });
          newData.Tsc.push({ x: x - 1000, y: NaN });
          newData.Tsh.push({ x: x - 1000, y: NaN });
          newData.deltaT.push({ x: x - 1000, y: NaN });
        }
        newData.Lcmp.push(LcmpHist ? { x, L: LcmpHist[i] } : { x, L: NaN });
        newData.Levp.push(LevpHist ? { x, L: LevpHist[i] } : { x, L: NaN });
        newData.Lcut.push(LcutHist ? { x, L: invBool(LcutHist[i]) } : { x, L: NaN });
        newData.Tamb.push(TambHist ? { x, y: TambHist[i] } : { x, y: NaN });
        newData.Tsuc.push(TsucHist ? { x, y: TsucHist[i] } : { x, y: NaN });
        newData.Tliq.push(TliqHist ? { x, y: TliqHist[i] } : { x, y: NaN });
        newData.Psuc.push(PsucHist ? { x, y: PsucHist[i] } : { x, y: NaN });
        newData.Pliq.push(PliqHist ? { x, y: PliqHist[i] } : { x, y: NaN });
        newData.Tsc.push(TscHist ? { x, y: TscHist[i] } : { x, y: NaN });
        newData.Tsh.push(TshHist ? { x, y: TshHist[i] } : { x, y: NaN });
        newData.deltaT.push(deltaTHist ? { x, y: deltaTHist[i] } : { x, y: NaN });

        if (TambHist && TambHist[i] != null && TambHist[i] > maxTval) maxTval = TambHist[i];
        if (TsucHist && TsucHist[i] != null && TsucHist[i] > maxTval) maxTval = TsucHist[i];
        if (TliqHist && TliqHist[i] != null && TliqHist[i] > maxTval) maxTval = TliqHist[i];
        if (TscHist && TscHist[i] != null && TscHist[i] > maxTval) maxTval = TscHist[i];
        if (TshHist && TshHist[i] != null && TshHist[i] > maxTval) maxTval = TshHist[i];
        if (deltaTHist && deltaTHist[i] != null && deltaTHist[i] > maxTval) maxTval = deltaTHist[i];

        if (TambHist && TambHist[i] != null && TambHist[i] < minTval) minTval = TambHist[i];
        if (TsucHist && TsucHist[i] != null && TsucHist[i] < minTval) minTval = TsucHist[i];
        if (TliqHist && TliqHist[i] != null && TliqHist[i] < minTval) minTval = TliqHist[i];
        if (TscHist && TscHist[i] != null && TscHist[i] < minTval) minTval = TscHist[i];
        if (TshHist && TshHist[i] != null && TshHist[i] < minTval) minTval = TshHist[i];
        if (deltaTHist && deltaTHist[i] != null && deltaTHist[i] < minTval) minTval = deltaTHist[i];

        if (PsucHist && PsucHist[i] != null && PsucHist[i] > maxPval) maxPval = PsucHist[i];
        if (PliqHist && PliqHist[i] != null && PliqHist[i] > maxPval) maxPval = PliqHist[i];

        if (PsucHist && PsucHist[i] != null && PsucHist[i] < minPval) minPval = PsucHist[i];
        if (PliqHist && PliqHist[i] != null && PliqHist[i] < minPval) minPval = PliqHist[i];
      }
    }

    if (currentData) {
      for (let i = 0; i < currentData.Lcmp.length; i++) {
        if (currentData.Lcmp[i].x > x) {
          newData.Lcmp.push(currentData.Lcmp[i]);
          newData.Levp.push(currentData.Levp[i]);
          newData.Lcut.push(currentData.Lcut[i]);
          newData.Tamb.push(currentData.Tamb[i]);
          newData.Tsuc.push(currentData.Tsuc[i]);
          newData.Tliq.push(currentData.Tliq[i]);
          newData.Psuc.push(currentData.Psuc[i]);
          newData.Pliq.push(currentData.Pliq[i]);
          newData.Tsc.push(currentData.Tsc[i]);
          newData.Tsh.push(currentData.Tsh[i]);
          newData.deltaT.push(currentData.deltaT[i]);
        }
      }
    }
    addTelemetryPoint(newData.Lcmp);
    addTelemetryPoint(newData.Levp);
    addTelemetryPoint(newData.Lcut);
    addTelemetryPoint(newData.Tamb);
    addTelemetryPoint(newData.Tsuc);
    addTelemetryPoint(newData.Tliq);
    addTelemetryPoint(newData.Psuc);
    addTelemetryPoint(newData.Pliq);
    addTelemetryPoint(newData.Tsc);
    addTelemetryPoint(newData.Tsh);
    addTelemetryPoint(newData.deltaT);
    state.graphData = newData;

    state.axisInfo.L1start = null; // force check of L1 values
    updateAxis(minTval, maxTval, minPval, maxPval);

    return newData;
  }

  function processReceivedTelemetry(telemetry, convertToPsi, currentData) {
    if (convertToPsi) {
      telemetry.Psuc = Math.round(telemetry.Psuc * 14.50377);
      telemetry.Pliq = Math.round(telemetry.Pliq * 14.50377);
    }

    if ((hwCfg.isFanCoil || state.devInfo.dac!.DAC_APPL === 'trocador-de-calor') && telemetry.Tliq && telemetry.Tsuc) {
      telemetry.deltaT = telemetry.Tliq - telemetry.Tsuc;
    }

    const minTval = Math.min(currentData.Tamb || 0, currentData.Tsuc || 0, currentData.Tliq || 0, currentData.Tsc || 0, currentData.Tsh || 0, currentData.deltaT || 0);
    const maxTval = Math.max(currentData.Tamb || 0, currentData.Tsuc || 0, currentData.Tliq || 0, currentData.Tsc || 0, currentData.Tsh || 0, currentData.deltaT || 0);
    const minPval = Math.min(currentData.Psuc || 0, currentData.Pliq || 0);
    const maxPval = Math.max(currentData.Psuc || 0, currentData.Pliq || 0);
    // TODO: check if have to update L1start
    updateAxis(minTval, maxTval, minPval, maxPval);

    const { L1start } = state.axisInfo;

    let Lcmp = telemetry.Lcmp;

    if (state.hwCfg.calculate_L1_fancoil) {
      Lcmp = ((telemetry.Tsuc - telemetry.Tliq) >= 1.5) ? 1 : 0;
    }

    const yLcmp = axisCalc.convertBoolValue(Lcmp, L1start!, 0);
    const yLevp = axisCalc.convertBoolValue(telemetry.Levp, L1start!, 0);
    const yLcut = axisCalc.convertBoolValue(invBool(telemetry.Lcut), L1start!, 1);

    telemetry.time = new Date(telemetry.timestamp);
    const time = telemetry.time.getTime();
    addTelemetryPoint(currentData.Lcmp, { x: time, L: Lcmp, y: yLcmp });
    addTelemetryPoint(currentData.Levp, { x: time, L: telemetry.Levp, y: yLevp });
    addTelemetryPoint(currentData.Lcut, { x: time, L: telemetry.Lcut, y: yLcut });
    addTelemetryPoint(currentData.Tamb, { x: time, y: telemetry.Tamb });
    addTelemetryPoint(currentData.Tsuc, { x: time, y: telemetry.Tsuc });
    addTelemetryPoint(currentData.Tliq, { x: time, y: telemetry.Tliq });
    addTelemetryPoint(currentData.deltaT, { x: time, y: telemetry.deltaT });
    addTelemetryPoint(currentData.Psuc, { x: time, y: telemetry.Psuc });
    addTelemetryPoint(currentData.Pliq, { x: time, y: telemetry.Pliq });
    addTelemetryPoint(currentData.Tsc, { x: time, y: telemetry.Tsc });
    addTelemetryPoint(currentData.Tsh, { x: time, y: telemetry.Tsh });

    return currentData;
  }

  function updateAxis(minTval, maxTval, minPval, maxPval) {
    const prevL1start = state.axisInfo.L1start;
    const newDataLimits = {
      minTval, maxTval, minPval, maxPval,
    };
    const booleanLines = state.hwCfg.hasAutomation ? 2 : 1;
    axisCalc.updateDataLimits(newDataLimits, state.axisDataLimits);
    state.axisInfo = axisCalc.calculateAxisInfo(state.axisDataLimits, booleanLines);

    if (prevL1start !== state.axisInfo.L1start) {
      const { graphData } = state;
      const varsList = state.hwCfg.hasAutomation ? [graphData.Levp, graphData.Lcut] : [graphData.Lcmp];
      axisCalc.updateBoolY(varsList, state.axisInfo.L1start!);
    }
  }

  return (
    <>
      {isDesktop.matches ? (
        <RealTimeDesktop state={state} graphEnable={graphEnable} profile={profile} hwCfg={hwCfg} render={render} />
      ) : (
        <RealTimeMobile state={state} graphEnable={graphEnable} profile={profile} hwCfg={hwCfg} render={render} />
      )}
    </>
  );
}

function addTelemetryPoint(chartPoints, newPoint?) {
  if (chartPoints.length === 0) {
    if (newPoint) {
      const chartTimeIni = new Date(newPoint.x - TSPAN).getTime();
      chartPoints.push({ x: chartTimeIni, y: NaN });
      chartPoints.push(newPoint);
    }
    return;
  }

  let lastPoint = chartPoints[chartPoints.length - 1];

  if (newPoint && (newPoint.x > lastPoint.x)) {
    const timeEndThreshold = new Date(newPoint.x - ONLINE_TIMEOUT).getTime();
    if (!(lastPoint.x >= timeEndThreshold)) {
      chartPoints.push({ x: timeEndThreshold, y: NaN });
    }
    chartPoints.push(newPoint);
    lastPoint = newPoint;
  }

  const chartTimeIni = new Date(lastPoint.x - TSPAN).getTime();

  // Remove old points
  while (chartPoints.length > 0 && !(chartPoints[0].x >= chartTimeIni)) {
    chartPoints.shift();
  }

  if (chartPoints[0].x > chartTimeIni) {
    chartPoints.unshift({ x: chartTimeIni, y: NaN });
  }
}
