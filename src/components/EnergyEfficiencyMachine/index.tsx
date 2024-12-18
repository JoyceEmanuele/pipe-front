import { useEffect } from 'react';
import {
  Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line, Legend,
} from 'recharts';
import { Flex, Box } from 'reflexbox';

import { Card, HealthIcon } from '../index';
import { formatTime } from '../../helpers/formatTime';
import { useStateVar } from '../../helpers/useStateVar';
import { apiCall } from '../../providers';

import {
  TopTitle,
  ExpandButton,
  ItemTitle,
  ItemSubTitle,
  ItemValue,
  ItemValueCurrency,
  ItemValueInt,
  ItemValueDecimal,
  ChevronDown,
  StyledLink,
  StyledButton,
  MenorConsumo,
  MedioConsumo,
  MaiorConsumo,
  BarColor,
  StatusButtonOn,
  StatusButtonOff,
  CustomLegendUl,
  CustomLegendLi,
  LegendIcon,
  SeparationLine,
} from './styles';
import '../../assets/css/EnergyEfficiencyMachine.css';
import { t } from 'i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

interface EnergyEfficiencyMachineProps {
  dac: any;
  dateList: any;
  averageTariff: any;
  automationSavings: any;
  selectedTimeRange: string;
  numDays: number;
  language: string;
  unitHasDacs: boolean;
}

export const EnergyEfficiencyMachine = ({
  dac,
  dateList,
  averageTariff,
  automationSavings,
  selectedTimeRange,
  numDays,
  language,
  unitHasDacs,
}: EnergyEfficiencyMachineProps): JSX.Element => {
  const [state, render] = useStateVar(() => ({
    expand: false,
    chartData: [],
    expandMachines: false,
  }));

  async function dayConsumption(devId) {
    let result: {
      consumption: number[],
      meanT?: number[],
      maxT?: number[],
      minT?: number[],
    } = { consumption: [] };

    if (verifyMachineDevIdIsDac(devId)) {
      result = await apiCall('/dac/get-day-consumption', {
        dacId: devId,
        day: dateList[0].YMD,
      });

      return result;
    }

    result = await apiCall('/dut/get-day-consumption', {
      dutId: devId,
      day: dateList[0].YMD,
    });

    return result;
  }

  function verifyMachineExternalTemperature(data, machine, xaxis, index) {
    if (dac.machineHasDacs && machine.id?.startsWith('DAC') || (!dac.machineHasDacs && machine.id?.startsWith('DUT'))) {
      if (machine.extTemp[xaxis]) data[xaxis].dacTempAvg = (((parseFloat(data[xaxis].dacTempAvg) || 0) + machine.extTemp[xaxis]) / (index + 1)).toFixed(1);

      if (machine.extTempMax[xaxis]) data[xaxis].dacTempMax = (((parseFloat(data[xaxis].dacTempMax) || 0) + machine.extTempMax[xaxis]) / (index + 1)).toFixed(1);
      if (machine.extTempMin[xaxis]) data[xaxis].dacTempMin = (((parseFloat(data[xaxis].dacTempMin) || 0) + machine.extTempMin[xaxis]) / (index + 1)).toFixed(1);
    }
  }

  function setDataObject(data, xaxis, value, index, machine) {
    if (!data[xaxis]) data[xaxis] = {};

    data[xaxis].groupName = dac.name;
    data[xaxis].comsumptionT = (data[xaxis].comsumptionT || 0) + value;
    data[xaxis].comsumptionKWH = (parseFloat(data[xaxis].comsumptionKWH) || 0) + (((value as number) || 0) * (machine.kw || 0));
    data[xaxis][`dacName${index}`] = machine.name;
    data[xaxis][`dacId${index}`] = machine.id;
    data[xaxis][`dacHealth${index}`] = machine.health;
    data[xaxis][`dacUsage${index}`] = value;

    verifyMachineExternalTemperature(data, machine, xaxis, index);
    data[xaxis].name = xaxis;
    data[xaxis][`dac${index}`] = ((value as number) || 0) * (machine.kw || 0);
  }

  function verifyShowExternalTemperatureY(unitHasDacs) {
    return (numDays !== 1 && unitHasDacs);
  }

  async function getChartData() {
    const data = {};

    await Promise.all(
      dac.dacs.map(async (machine, index) => {
        try {
          if (selectedTimeRange === t('dia')) {
            const response = await dayConsumption(machine.id);
            for (let i = 0; i < response.consumption.length; i++) {
              setDataObject(data, `${String(i).padStart(2, '0')}:00`, response.consumption[i] / 3600, index, machine);
            }
          } else {
            Object.entries(machine.cons).forEach((item) => {
              setDataObject(data, item[0], item[1], index, machine);
            });
          }

          state.chartData = Object.values(data);
          render();
        } catch (err) {
          console.log(err);
        }
      }),
    );
  }

  function verifyMachineDevIdIsDac(devId) {
    const result = devId.startsWith('DAC');

    return result;
  }

  useEffect(() => {
    getChartData();
  }, [selectedTimeRange, dac]);

  const totalSaving = automationSavings
    ? dac.dacs.map((machine) => (Object.values(automationSavings[machine.id] || 0).reduce((total: number, item: any) => (total || 0) + (item.totalEst || 0), 0) || 0) * machine.kw).reduce((total: number, item: any) => (total || 0) + (item || 0), 0)
    : 0;

  const CustomizedAxisTick = ({
    x, y, payload,
  }: any) => {
    const text = selectedTimeRange === t('dia')
      ? payload.value.split(':')
      : new Date(`${payload.value} 00:00:00`).toLocaleDateString('pt-br', { day: 'numeric', weekday: 'short' }).split(',').reverse();
    return (
      <g transform={`translate(${x},${y})`} height="50px">
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" className="recharts-text">
          <tspan x="0" dy="1.2em" dx={selectedTimeRange === t('dia') ? '0.6em' : (selectedTimeRange === t('mes') ? '0.0em' : '0.5em')}>
            {selectedTimeRange === t('dia') ? `${text[0]}h` : text[0]}
          </tspan>
          <tspan x="0" dy="1.2em" dx={selectedTimeRange === t('mes') ? '0.0em' : '0.5em'} className="recharts-text-strong">
            {selectedTimeRange === t('dia') ? '' : (selectedTimeRange === t('mes') ? text[1]?.replace('.', '').toUpperCase()[0] : text[1]?.replace('.', '').toUpperCase())}
          </tspan>
        </text>
      </g>
    );
  };

  const CustomizedToolTip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const groupInfo = payload[0].payload;

      return (
        <div className="custom-tooltip">
          <p className="tooltipLabel">{selectedTimeRange === t('dia') ? `${label}h` : new Date(`${label} 00:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric', weekday: 'short' }).replace('.', ' ').replace(',', '-')}</p>
          <p className="tooltipLabel">
            <span className="tooltipLabelStrong">{formatNumberWithFractionDigits(groupInfo.comsumptionKWH || 0, { minimum: 2, maximum: 2 })}</span>
            {' '}
            kWh
          </p>
          {dac.dacs.map((_machine, index) => (
            <>
              <Flex alignItems="center" mt={10} style={{ minWidth: 125 }}>
                <Box width={10 / 12}>
                  <p className="tooltipLabelTitle">
                    <span className="tooltipLabelStrong">{groupInfo[`dacName${index}`]}</span>
                    <BarColor style={{ background: `rgba(90, 179, 101, ${1 - (0.3 * index)})` }} />
                  </p>
                  <p className="tooltipLabel">{groupInfo[`dacId${index}`]}</p>
                  <p className="tooltipLabel">
                    <span className="tooltipLabelStrong">{formatNumberWithFractionDigits(groupInfo[`dac${index}`], { minimum: 2, maximum: 2 })}</span>
                    kWh
                  </p>
                  <p className="tooltipLabel">
                    <span className="tooltipLabelStrong">
                      {t('uso')}
                      :
                    </span>
                    {formatTime(groupInfo[`dacUsage${index}`])}
                    h
                  </p>
                </Box>
                {verifyMachineDevIdIsDac(_machine.id) && (
                  <Box width={2 / 12}>
                    <HealthIcon health={(groupInfo[`dacHealth${index}`] || 0).toString()} />
                  </Box>
                )}
              </Flex>
            </>
          ))}
          {verifyShowExternalTemperatureY(unitHasDacs) && (
            <>
              <SeparationLine />
              <Flex alignItems="center" mt={10}>
                <Box width={10 / 12}>
                  <p className="tooltipLabelTitle">
                    <span className="tooltipLabelStrong">{t('temperaturaExterna')}</span>
                  </p>
                  <p className="tooltipLabel">
                    <span className="tooltipLabelStrong">{t('media')}</span>
                    {` ${groupInfo.dacTempAvg ?? ''} °C`}
                  </p>
                  <p className="tooltipLabel">
                    <span className="tooltipLabelStrong">{t('max')}</span>
                    {` ${groupInfo.dacTempMax ?? ''} °C`}
                  </p>
                  <p className="tooltipLabel">
                    <span className="tooltipLabelStrong">Min. </span>
                    {` ${groupInfo.dacTempMin ?? ''} °C`}
                  </p>
                </Box>
              </Flex>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  function formaterYAxis(tick) {
    return `${formatNumberWithFractionDigits(tick)} kWh`;
  }

  function formaterYAxisTemp(tick) {
    return `${formatNumberWithFractionDigits(tick)}°C `;
  }

  const renderLegendText = (props) => {
    const { payload } = props;

    return (
      <CustomLegendUl>
        {payload.map((entry, index) => {
          if (entry.value === 'dacTempAvg') {
            return (
              <CustomLegendLi key={`dacTempAvg-${index}`}>
                {t('temperaturaExterna')}
                {' '}
                <LegendIcon />
                {' '}
              </CustomLegendLi>
            );
          }
          return null;
        })}
      </CustomLegendUl>
    );
  };

  function showOrHide() {
    if (state.expand && state.expandMachines) {
      state.expandMachines = false;
    }
    state.expand = !state.expand;
    render();
  }

  return (
    <Box width={1} mb={40}>
      <Card noPadding>

        <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center" p={20}>
          <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
            <TopTitle>{dac.name}</TopTitle>
          </Box>
          {!dac.dacs?.find((x) => x.name === null) ? (
            <Box
              width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                if (!state.expandMachines && !state.expand) {
                  state.expand = true;
                }
                state.expandMachines = !state.expandMachines;
                render();
              }}
            >
              <ChevronDown />
            </Box>
          ) : (
            <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]} />
          ) }
          <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
            <TopTitle>
              {formatNumberWithFractionDigits(dac.pot || 0, { minimum: 0, maximum: 2 })}
              {' '}
              kW
            </TopTitle>
          </Box>
          <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
            <TopTitle>
              {formatNumberWithFractionDigits(dac.consKWH || 0, { minimum: 2, maximum: 2 })}
              kWh
              {dac.rangeCons === 'higher' && <MaiorConsumo />}
              {dac.rangeCons === 'medium' && <MedioConsumo />}
              {dac.rangeCons === 'lower' && <MenorConsumo />}
            </TopTitle>
          </Box>
          <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
            <TopTitle>
              {formatTime(dac.consH / (dac.dacs.length || 1) / (numDays))}
              {' '}
              {t('hrsdia')}
            </TopTitle>
          </Box>
          <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
            <Flex alignItems="center">
              {dac.dacs.map((machine) => verifyMachineDevIdIsDac(machine.id) && <HealthIcon key={machine.id} health={(machine.health || 0).toString()} />)}
            </Flex>
          </Box>
          <Box width={[1 / 12, 1 / 12, 1 / 12, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]} justifyContent="end">
            <ExpandButton onClick={showOrHide}>{state.expand ? '-' : '+'}</ExpandButton>
          </Box>
        </Flex>

        {state.expand ? (
          <>
            {state.expandMachines && dac.dacs.map((machine, index) => machine.name && (
              <Flex
                key={machine.id}
                flexWrap="wrap"
                justifyContent="space-between"
                alignItems="center"
                width={1}
                p={20}
                sx={{
                  background: '#EBEBEB',
                  borderTopStyle: 'solid',
                  borderTopWidth: index === 0 ? 1 : 0,
                  borderTopColor: 'rgba(32, 35, 112, 0.2)',
                  borderBottomStyle: 'solid',
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(32, 35, 112, 0.2)',
                }}
              >
                <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
                  <TopTitle>{machine.name}</TopTitle>
                  { verifyMachineDevIdIsDac(machine.id) && (
                    <StyledLink to={`/analise/dispositivo/${machine.id}/informacoes`}>{machine.id}</StyledLink>
                  )}
                </Box>
                <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
                  <StyledButton to={verifyMachineDevIdIsDac(machine.id) ? `/analise/dispositivo/${machine.id}/informacoes` : `/analise/maquina/${machine.groupId}/ativos/`}>{t('ver')}</StyledButton>
                </Box>
                <Box width={[1 / 3, 1 / 3, 1 / 3, 1 / 12, 1 / 12, 1 / 12]}>
                  <TopTitle>
                    {formatNumberWithFractionDigits(machine.pot || 0)}
                    {' '}
                    kW
                  </TopTitle>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
                  <TopTitle>
                    {formatNumberWithFractionDigits(machine.sumCons || 0, { minimum: 0, maximum: 2 })}
                    kWh
                  </TopTitle>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
                  <TopTitle>
                    {formatTime(Object.values(machine.cons).reduce((total: number, item: any) => (total || 0) + (item || 0), 0) / (numDays))}
                    {' '}
                    {t('hrsdia')}
                  </TopTitle>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]}>
                  <Flex alignItems="center">
                    {verifyMachineDevIdIsDac(machine.id) && (
                      <HealthIcon health={(machine.health || 0).toString()} />
                    )}
                  </Flex>
                </Box>
                <Box width={[1 / 4, 1 / 4, 1 / 4, 1 / 12, 1 / 12, 1 / 12]} mt={[15, 15, 15, 0, 0, 0]} justifyContent="end">
                  {machine.status === 'ONLINE' && <StatusButtonOn>ON</StatusButtonOn>}
                  {machine.status === 'OFFLINE' && <StatusButtonOff>OFF</StatusButtonOff>}
                </Box>
              </Flex>
            ))}
            <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" mt={50} mb={50}>
              <Box width={950} height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    width={950}
                    height={200}
                    data={state.chartData}
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 11,
                    }}
                  >
                    <XAxis dataKey="name" tick={<CustomizedAxisTick />} interval={0} />
                    <YAxis yAxisId="left" tickFormatter={formaterYAxis} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={formaterYAxisTemp} />
                    <Tooltip content={<CustomizedToolTip />} />
                    { verifyShowExternalTemperatureY(unitHasDacs) && (
                      <Legend
                        align="right"
                        height={36}
                        layout="vertical"
                        verticalAlign="middle"
                        iconType="line"
                        content={renderLegendText}
                      />
                    )}
                    {dac.dacs.map((_machine, index) => <Bar yAxisId="left" dataKey={`dac${index}`} fill={`rgba(90, 179, 101, ${1 - (0.3 * index)})`} />)}
                    <Line yAxisId="right" type="monotone" dataKey="dacTempAvg" stroke="#E00030" dot={false} strokeWidth={1} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Flex>

            <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" pb={40}>
              <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]} mt={[30, 30, 30, 10, 10, 0]} display="flex" justifyContent="center">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div>
                    <ItemTitle>
                      {t('refrigeracao')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {t('dentroDoPeriodoInformado')}
                    </ItemSubTitle>
                  </div>
                  <ItemValue>
                    <ItemValueCurrency>R$</ItemValueCurrency>
                    <ItemValueInt>
                      {formatNumberWithFractionDigits((dac.consKWH || 0) * parseFloat(averageTariff || '0')).split(language === 'en' ? '.' : ',')[0]}
                    </ItemValueInt>
                    <ItemValueDecimal>
                      ,
                      {formatNumberWithFractionDigits((dac.consKWH || 0) * parseFloat(averageTariff || '0'), { minimum: 2, maximum: 2 }).split(language === 'en' ? '.' : ',')[1]}
                    </ItemValueDecimal>
                  </ItemValue>
                </div>
              </Box>
              <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]} mt={[30, 30, 30, 10, 10, 0]} display="flex" justifyContent="center">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div>
                    <ItemTitle>
                      {t('totalEconomia')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {t('dentroDoPeriodoInformado')}
                    </ItemSubTitle>
                  </div>
                  <ItemValue>
                    <ItemValueCurrency>R$</ItemValueCurrency>
                    <ItemValueInt style={{ color: '#63B76D' }}>
                      {formatNumberWithFractionDigits((totalSaving as number || 0) * parseFloat(averageTariff || '0')).split(language === 'en' ? '.' : ',')[0]}
                    </ItemValueInt>
                    <ItemValueDecimal style={{ color: '#63B76D' }}>
                      ,
                      {formatNumberWithFractionDigits((totalSaving as number || 0) * parseFloat(averageTariff || '0'), { minimum: 2, maximum: 2 }).split(language === 'en' ? '.' : ',')[1]}
                    </ItemValueDecimal>
                  </ItemValue>
                </div>
              </Box>
            </Flex>
          </>
        ) : (
          <></>
        )}

      </Card>
    </Box>
  );
};
