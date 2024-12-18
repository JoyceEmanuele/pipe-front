import React, { useState, useEffect, useCallback } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { SketchPicker } from 'react-color';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Label, LineChart, Line, ReferenceLine, Tooltip,
} from 'recharts';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';
import {
  Button, Datepicker, Loader, ModalWindow,
} from '~/components';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { LineIcon, CloseIcon } from '~/icons';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';
import { t } from 'i18next';
import { NoGraph } from '~/components/NoGraph';
import { HistoryContainerQA } from './styles';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import {
  BtnExport, CloseBtnIcon, ModalContent, OptionColor,
} from '~/components/EnvGroupAnalysis/styles';
import {
  ColorsPalet,
} from '~/components/EnvGroupAnalysis';
import moment from 'moment';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { toast } from 'react-toastify';
import { NoAnalisysSelected } from '~/pages/General/styles';
import { EmptyDocumentIcon } from '~/icons/EmptyDocumentIcon';

const ticksXgraph = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

export const DUTHistory = (): JSX.Element => {
  const routeParams = useParams<{ devId }>();
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaHistorico')}</title>
      </Helmet>
      <DevLayout devInfo={devInfo} />
      {/* @ts-ignore */}
    </>
  );
};

export function DUTHistoryContents({ onDevInfoUpdate = undefined }): JSX.Element {
  const { devId } = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      devInfo: getCachedDevInfoSync(devId),
      dutInfo: null,
      graphDataX: undefined as any,
      isLoading: false,
      useMaxGraphData: null as null|{},
      useMinGraphData: null as null|{},
      useCO2LimitGraphData: null as null|{},
      showLimits: true,
      showCO2Limits: false,
      daySched: null as null | { TUSEMIN: number, TUSEMAX: number, indexEnd: number, indexIni: number },
      isDutQA: true,
      groupGraph: false,
      isModalOpen: false,
      dateStart: null as null|moment.Moment,
      dateEnd: null as null|moment.Moment,
      tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
      focused: false,
      focusedInput: null as 'endDate' | 'startDate' | null,
      multiDays: false,
      numDays: 1 as number,
      refAreaLeft: null as null | number,
      refAreaRight: null as null | number,
      xDomain: null as null | [number, number],
      xTicks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] as number[],
      axisInfo: {
        tempLimits: [10, 40],
        tempTicks: [10, 15, 20, 25, 30, 35, 40],
        humLimits: [0, 100],
        humTicks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        eCO2Ticks: [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800],
        eCO2Domain: [200, 1800],
        L1start: 0,
      },
      humLineInfo: {
        lineColorObj: {
          lineColor: '#2D81FF',
          isDisplayColorVisible: false,
          text: 'Umidade [%]',
        },
        limitColorObj: {
          lineColor: '#1E5DBA',
          isDisplayColorVisible: false,
          text: 'Limite umidade [%]',
        },
        lineColor: '#2D81FF',
        colorLimit: '#1E5DBA',
        isVisible: true,
        isLimitVisible: true,
        isDisplayColorVisible: false,
      },
      tempLineInfo: {
        lineColorObj: {
          lineColor: '#E00030',
          isDisplayColorVisible: false,
          text: 'Temperatura [°C]',
        },
        limitColorObj: {
          lineColor: '#8C001E',
          isDisplayColorVisible: false,
          text: 'Limite de Temperatura [°C]',
        },
        lineColor: '#E00030',
        colorLimit: '#8C001E',
        isVisible: true,
        isLimitVisible: true,
        isDisplayColorVisible: false,
      },
      temp1LineInfo: {
        lineColor: 'rgb(255, 190, 22)',
        isVisible: true,
      },
      L1LineInfo: {
        lineColor: '#000',
        isVisible: true,
      },
      co2LineInfo: {
        lineColorObj: {
          lineColor: '#FFBE16',
          isDisplayColorVisible: false,
          text: 'CO₂ [ppm]',
        },
        limitColorObj: {
          lineColor: '#C68F00',
          isDisplayColorVisible: false,
          text: 'Limite de CO₂ [ppm]',
        },
        lineColor: '#FFBE16',
        colorLimit: '#C68F00',
        isVisible: true,
        isLimitVisible: true,
        isDisplayColorVisible: false,
      },
      hasL1: false,
    };
    return state;
  });
  const [date, setDate] = useState(null as null|moment.Moment);
  const [graphData, setGraphData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [graphEnable, setGraphEnable] = useState({
    Temperature: true,
    Temperature_1: true,
    Humidity: true,
    eCO2: true,
    TVOC: false,
    L1: true,
  });

  const [axisInfo, setAxisInfo] = useState({
    tempLimits: [10, 40],
    tempTicks: [10, 15, 20, 25, 30, 35, 40],
    humLimits: [0, 100],
    humTicks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    eCO2Ticks: [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800],
    eCO2Domain: [200, 1800],
    L1start: 0,
  });

  useEffect(() => {
    Promise.resolve().then(async () => {
      const devInfo = await getCachedDevInfo(devId, {});
      // @ts-ignore
      if (onDevInfoUpdate) onDevInfoUpdate();
      // @ts-ignore
      const dutInfo = devInfo.dut;
      // @ts-ignore

      ({ devInfo, dutInfo });
    }).catch(console.log);
  }, []);

  function proximoMultiploDeCinco(num) {
    if (num % 5 === 0) {
      return num;
    }
    return Math.ceil(num / 5) * 5;
  }

  useEffect(() => {
    if (!state.devInfo || !date) return;
    Promise.resolve().then(async () => {
      setState({ isLoading: true });

      try {
        const params = {
          devId,
          day: date.format().substring(0, 10),
          selectedParams: ['Temperature', 'Temperature_1', 'Humidity', 'eCO2', 'L1'],
          numDays: 1,
        };
        const dutHist = await apiCall('/dut/get-day-charts-data-commonX', params);
        const maxValue = dutHist.daySched?.TUSEMAX ? dutHist.daySched?.TUSEMAX + 5 : 30;
        const minValue = dutHist.daySched?.TUSEMIN ? dutHist.daySched?.TUSEMIN - 5 : -35;
        state.axisInfo.tempLimits[0] = dutHist.axisInfo.tempLimits[0] > 0 ? 0 : Math.max(Math.min(...dutHist.Temperature.y, minValue), -40);
        state.axisInfo.tempLimits[1] = dutHist.Temperature?.y.length ? proximoMultiploDeCinco(Math.max(...dutHist.Temperature.y, maxValue)) : 40;
        if (dutHist.daySched) state.daySched = dutHist.daySched;
        state.graphDataX = dutHist;
        state.hasL1 = dutHist.L1?.y?.some((item) => item !== null);
        render();
      } catch (err) { console.log(err); toast.error(t('houveErroBuscandoGrafico')); }
      state.isLoading = false;
      render();
    });
  }, [date, state.devInfo]);

  useEffect(() => {
    const { dutInfo } = state;

    if (state.daySched) {
      const indexIni = state.daySched.indexIni / 60;
      const indexEnd = state.daySched.indexEnd / 60;
      let useMaxGraphData = null as null|{};
      if (state.daySched.TUSEMAX != null) {
        useMaxGraphData = [
          { x: indexIni, y: state.daySched.TUSEMAX },
          { x: indexEnd, y: state.daySched.TUSEMAX },
        ];
      }
      let useMinGraphData = null as null|{};
      if (state.daySched.TUSEMIN != null) {
        useMinGraphData = [
          { x: indexIni, y: state.daySched.TUSEMIN },
          { x: indexEnd, y: state.daySched.TUSEMIN },
        ];
      }
      let useCO2LimitGraphData = null as null|{};
      // @ts-ignore
      if (dutInfo && dutInfo.CO2MAX != null) {
        useCO2LimitGraphData = [
          // @ts-ignore
          { x: 0, y: dutInfo.CO2MAX },
          // @ts-ignore
          { x: 24, y: dutInfo.CO2MAX },
        ];
      }

      setState({ useMaxGraphData, useMinGraphData, useCO2LimitGraphData });
    }
  }, [state.dutInfo, state.daySched, JSON.stringify(date)]);

  const handleChange = (name) => {
    setGraphEnable({ ...graphEnable, [name]: !graphEnable[name] });
  };

  const setFormattedDate = useCallback((date) => setDate(date ? date.set({ hour: 0 }) : null), []);

  const DesktopFiltering = () => (
    <Flex justifyContent="flex-start" flexWrap="wrap" mb={38} width="100%">
      <Box>
        <Datepicker setDate={setFormattedDate} date={date} />
      </Box>
    </Flex>
  );

  if (state.isLoading) {
    return <Loader />;
  }
  return (
    <>
      <ModalMobile isModalOpen={isModalOpen}>
        <Flex mb={32}>
          <Box width={1}>
            <ModalSection>
              <ModalTitleContainer>
                <ModalTitle>{t('Filtrar por')}</ModalTitle>
                <CloseIcon size="12px" onClick={() => setIsModalOpen(false)} />
              </ModalTitleContainer>
            </ModalSection>
          </Box>
        </Flex>
        <Flex flexWrap="wrap" pl={16} pr={16}>
          <Box width={1} mb={24}>
            <Datepicker setDate={setFormattedDate} date={date} />
          </Box>
          <Box width={1}>
            <Button type="button" variant="primary" onClick={() => setIsModalOpen(false)}>
              {t('botaoFiltrar')}
            </Button>
          </Box>
        </Flex>
      </ModalMobile>
      <Flex>
        <Box width={1}>
          <DesktopWrapper>
            <Card
              // @ts-ignore
              tickXLabelFormaterHour={tickXLabelFormaterHour}
              Filtering={DesktopFiltering}
              graphData={graphData}
              graphEnable={graphEnable}
              // @ts-ignore
              handleChange={handleChange}
              axisInfo={axisInfo}
              state={state}
              date={date}
              isDutQA={state.isDutQA}
              render={render}
              setState={setState}
            />
          </DesktopWrapper>
          <MobileWrapper>
            <Flex mt="32px" mb="32px">
              <Box width={1}>
                <div onClick={() => setIsModalOpen(true)}>
                  <Button variant="primary">{t('botaoFiltrar')}</Button>
                </div>
              </Box>
            </Flex>
            <Card
              graphData={graphData}
              graphEnable={graphEnable}
              // @ts-ignore
              handleChange={handleChange}
              axisInfo={state.axisInfo}
              state={state}
              date={date}
            />
          </MobileWrapper>
        </Box>
      </Flex>
    </>
  );
}

function tooltipXLabelFormater(hour: number, day) {
  const numDays = Math.floor(hour / 24);
  const date = new Date(
    `${moment(day).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`,
  );
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const finalDate = `${dd}/${mm}`;

  const hh = String(Math.floor(Math.abs(hour)) - 24 * numDays);
  const min = String(Math.floor((Math.abs(hour) * 60) % 60));
  const ss = String(Math.floor((Math.abs(hour) * 60 * 60) % 60));

  return (
    <p>
      <b>{finalDate}</b>
      {' '}
      -
      {' '}
      <span style={{ fontWeight: 'normal' }}>
        {`${hh.padStart(2, '0')}:${min.padStart(
          2,
          '0',
        )}:${ss.padStart(2, '0')}`}
      </span>
    </p>
  );
}

function returnUnityMeasure(payload): string {
  if (payload.unit === 'Temperatura') return `${payload.value} °C`;
  if (payload.unit === 'Umidade') return `${payload.value} %`;
  if (payload.unit === 'CO₂') return `${payload.value} ppm`;
  return payload.value;
}

function tickXLabelFormaterHour(hour: number) {
  const numDays = Math.floor(hour / 24);
  const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
  const min = Math.floor((Math.abs(hour) * 60) % 60);

  return `${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

const CustomTooltip = ({
  payload, limitData, date, label,
}) => {
  const { limitInfo, dut } = limitData;
  const { tempLineInfo, humLineInfo, co2LineInfo } = limitInfo;

  if (payload?.length) {
    const minTemp = dut?.TUSEMIN && `${formatNumberWithFractionDigits(dut.TUSEMIN)} ºC min` || '';
    const maxTemp = dut?.TUSEMAX && `${formatNumberWithFractionDigits(dut?.TUSEMAX)}ºC max` || '';
    const minHum = dut?.HUMIMIN && `${formatNumberWithFractionDigits(dut?.HUMIMIN)}% min` || '';
    const maxHum = dut?.HUMIMAX && `${formatNumberWithFractionDigits(dut?.HUMIMAX)}% max` || '';
    return (
      <div className="custom-tooltip">
        { payload.map((payload) => (
          <>
            <b>{tooltipXLabelFormater(label, date)}</b>
            <p>{`${payload.unit}: ${returnUnityMeasure(payload)}`}</p>
            <p>
              {payload.unit === 'Temperatura' && tempLineInfo.isLimitVisible && (dut?.TUSEMIN || dut?.TUSEMAX) && (
              <p style={{ color: tempLineInfo.limitColorObj.lineColor }}>
                {`Limites de Temperatura: ${minTemp} ${maxTemp}`}
              </p>
              )}
            </p>
            <p>
              {
                payload.unit === 'Umidade' && humLineInfo.isLimitVisible && (dut?.HUMIMIN || dut?.HUMIMAX) && (
                  <p style={{ color: humLineInfo.limitColorObj.lineColor }}>
                    {`Limites de Umidade: ${minHum} ${maxHum}`}
                  </p>
                )
              }
            </p>
            <p>
              { payload.unit === 'CO₂' && co2LineInfo.isLimitVisible && dut?.CO2MAX && (
              <p style={{ color: co2LineInfo.limitColorObj.lineColor }}>
                {`Limites de CO₂: ${dut.CO2MAX} CO₂ max`}
              </p>
              ) }
            </p>
          </>
        )) }
        {

        }
        <div style={{ height: '10px' }} />
      </div>
    );
  }

  return null;
};

const CustomTooltipGroup = ({
  payload, data, limitData, label, date, isDutQA,
}) => {
  const { limitInfo, dut } = limitData;
  const {
    tempLineInfo, humLineInfo, co2LineInfo, temp1LineInfo, L1LineInfo,
  } = limitInfo;
  if (payload?.length) {
    const humidity = payload.find((item) => item.unit === 'umidade');
    const temperature = payload.find((item) => item.unit === 'Temperatura' || item.unit === 'temperatura');
    const eCO2 = payload.find((item) => item.unit === 'eCO2');
    const l1 = payload.find((item) => item.unit === 'L1');
    const Temperature1 = payload.find((item) => item.unit === 'temperatura1');
    return (
      <div className="custom-tooltip">
        <div style={{ height: '10px' }} />
        { label && (
        <b>{tooltipXLabelFormater(label, date)}</b>
        )}
        { temperature && data?.Temperature?.y.some((item) => item) && (
          <p style={{ color: tempLineInfo.lineColorObj.lineColor }}>{`Temperatura: ${formatNumberWithFractionDigits(temperature.value)} ºC`}</p>
        )}
        { Temperature1 && data?.Temperature_1?.y.some((item) => item !== null) && (
          <p style={{ color: temp1LineInfo.lineColor }}>{`Temperatura de Insuflação: ${formatNumberWithFractionDigits(Temperature1.value)} ºC`}</p>
        )}
        { isDutQA && humidity && data?.Humidity?.y.some((item) => item) && (
        <p style={{ color: humLineInfo.lineColorObj.lineColor }}>{`Umidade: ${formatNumberWithFractionDigits(humidity.value)} %`}</p>
        )}
        { isDutQA && eCO2 && data?.eCO2?.y.some((item) => item) && (
        <p style={{ color: co2LineInfo.lineColorObj.lineColor }}>{`CO₂: ${formatNumberWithFractionDigits(eCO2.value)} ppm`}</p>
        )}
        { l1 && data?.L1?.y.some((item) => item !== null) && (
          <p style={{ color: L1LineInfo.lineColor }}>{`Status do Compressor: ${l1.value === -2 ? 'Desligado' : 'Ligado'}`}</p>
        )}
        { groupLimitsTip(dut, limitInfo, isDutQA) }

      </div>
    );
  }

  return null;
};

function groupLimitsTip(dut, limitInfo, isDutQA) {
  const { tempLineInfo, humLineInfo, co2LineInfo } = limitInfo;
  const minTemp = dut?.TUSEMIN && `${formatNumberWithFractionDigits(dut.TUSEMIN)} ºC min` || '';
  const maxTemp = dut?.TUSEMAX && `${formatNumberWithFractionDigits(dut?.TUSEMAX)}ºC max` || '';
  const minHum = dut?.HUMIMIN && `${formatNumberWithFractionDigits(dut?.HUMIMIN)}% min` || '';
  const maxHum = dut?.HUMIMAX && `${formatNumberWithFractionDigits(dut?.HUMIMAX)}% max` || '';
  return (
    <>
      {
          tempLineInfo.isLimitVisible && (dut?.TUSEMIN || dut?.TUSEMAX) && (
            <p style={{ color: tempLineInfo.limitColorObj.lineColor }}>
              {`Limites de Temperatura: ${formatNumberWithFractionDigits(minTemp)} ${formatNumberWithFractionDigits(maxTemp)}`}
            </p>
          )
        }
      {
          isDutQA && humLineInfo.isLimitVisible && (dut?.HUMIMIN || dut?.HUMIMAX) && (
            <p style={{ color: humLineInfo.limitColorObj.lineColor }}>
              {`Limites de Umidade: ${formatNumberWithFractionDigits(minHum)} ${formatNumberWithFractionDigits(maxHum)}`}
            </p>
          )
        }
      {
          isDutQA && co2LineInfo.isLimitVisible && dut?.CO2MAX && (
            <p style={{ color: co2LineInfo.limitColorObj.lineColor }}>
              {`Limites de CO₂: ${formatNumberWithFractionDigits(dut.CO2MAX)} CO₂ max`}
            </p>
          )
        }

    </>
  );
}

function returnTooltip(limitData, date, data, hasL1 = false, isDutQA = false) {
  return (
    <Tooltip
      content={({ active, label, payload }) => (!hasL1 ? <CustomTooltip active={active} payload={payload} label={label} limitData={limitData} date={date} /> : <CustomTooltipGroup isDutQA={isDutQA} active={active} payload={payload} label={label} data={data} limitData={limitData} date={date} />)}
    />
  );
}

function returnTooltipGroup(date, data, limitData, isDutQA) {
  return (
    <Tooltip
      content={({ active, label, payload }) => <CustomTooltipGroup active={active} payload={payload} label={label} data={data} limitData={limitData} date={date} isDutQA={isDutQA} />}
    />
  );
}

const xaxisObject = (graphDataX) => ({
  id: 1,
  allowDataOverflow: true,
  type: 'number',
  name: 'time',
  dataKey: ({ index }) => graphDataX?.commonX[index],
  ticks: ticksXgraph,
  allowDecimals: false,
  domain: [0, 24],
  ticksFormater: tickXLabelFormaterHour,
});

function DutQAHistory({
  state, graphData, render, tickXLabelFormaterHour, date, isDutQA, labelTemp, labelTemp1, hasData,
}): JSX.Element {
  const {
    axisInfo, tempLineInfo, humLineInfo, co2LineInfo, graphDataX, temp1LineInfo, hasL1, L1LineInfo,
  } = state;
  let menorNumber = 0;

  function generateTicks(range: [number, number], step = 5): number[] {
    const [min, max] = range;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks = [] as number[];
    for (let i = start; i <= end; i += step) {
      ticks.push(i);
    }

    // Garantir que 0 esteja incluído
    if (!ticks.includes(0)) {
      ticks.push(0);
      ticks.sort((a, b) => a - b);
    }
    menorNumber = ticks[0];
    if (menorNumber >= 0) {
      menorNumber += 2;
    } else {
      menorNumber -= 2;
    }
    if (hasL1) {
      const firstTick = ticks[0];
      const additionalTicks = [firstTick - 1, firstTick - 2];

      ticks.unshift(...additionalTicks);
      ticks.sort((a, b) => a - b);
    }
    return ticks;
  }
  return (
    <HistoryContainerQA>
      {
        state.groupGraph && state.graphDataX && (
          <>
            <ResponsiveContainer width="96%" height={500}>
              <LineChart
                height={600}
                data={graphDataX.commonX.map((_data, index) => ({ index }))}
                margin={{
                  top: 40,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  allowDataOverflow
                  type="number"
                  name="time"
                  dataKey={({ index }) => graphDataX?.commonX[index]}
                  ticks={ticksXgraph}
                  tickFormatter={tickXLabelFormaterHour}
                  allowDecimals={false}
                  domain={[0, 24]}
                />
                {graphDataX.Humidity?.y && (
                <YAxis
                  type="number"
                  yAxisId="hum"
                  allowDataOverflow
                  tick={<CustomTickGraph type="hum" />}
                  dataKey="y"
                  ticks={axisInfo.humTicks}
                  tickMargin={35}
                  orientation="right"
                  domain={axisInfo.humLimits}
                >
                  <Label
                    value="Umidade"
                    offset={23}
                    angle="0"
                    position="top"
                    style={{
                      color: '#464555', fontSize: '13px', textAnchor: 'middle', fontWeight: 'bold',
                    }}
                  />
                </YAxis>
                )}
                {humLineInfo.isVisible && graphDataX.Humidity?.y && (
                <Line
                  yAxisId="hum"
                  dataKey={({ index }) => graphDataX.Humidity.y[index]}
                  stroke={humLineInfo.lineColorObj.lineColor}
                  strokeWidth={1.2}
                  unit="umidade"
                  type="monotone"
                  dot={false}
                />
                )}
                {graphDataX.eCO2 && (
                <YAxis
                  type="number"
                  yAxisId="co2id"
                  dataKey="y"
                  tick={<CustomTickGraph type="co2" />}
                  ticks={state.axisInfo.eCO2Ticks}
                  tickMargin={70}
                  orientation="right"
                  interval={0}
                  domain={state.axisInfo.eCO2Domain}
                  tickLine
                >
                  <Label
                    value="CO₂"
                    offset={23}
                    angle="0"
                    position="top"
                    style={{
                      color: '#464555', fontSize: '13px', textAnchor: 'middle', fontWeight: 'bold',
                    }}
                  />
                </YAxis>
                )}
                {graphDataX.eCO2?.y && co2LineInfo.isVisible && (
                <Line
                  yAxisId="co2id"
                  dataKey={({ index }) => graphDataX.eCO2.y[index]}
                  stroke={co2LineInfo.lineColorObj.lineColor}
                  strokeWidth={1.2}
                  unit="eCO2"
                  type="monotone"
                  dot={false}
                />
                )}
                <div style={{ width: '2px', height: '400px', backgroundColor: 'blue' }} />
                {graphDataX.Temperature && (
                <YAxis
                  type="number"
                  yAxisId="tempId"
                  allowDataOverflow
                  dataKey="y"
                  tick={<CustomTickGraph type="temp" />}
                  ticks={state.axisInfo.tempTicks}
                  orientation="left"
                  interval={0}
                  domain={state.axisInfo.tempLimits}
                >
                  <div style={{ width: '50px', backgroundColor: 'blue', height: '100px' }} />
                  <Label
                    value="Temperatura"
                    offset={18}
                    angle="0"
                    position="top"
                    style={{ color: '#656565', fontSize: '16px', textAnchor: 'middle' }}
                  />
                </YAxis>
                )}
                {graphDataX.Temperature && tempLineInfo.isVisible && (
                <Line
                  yAxisId="tempId"
                  dataKey={({ index }) => graphDataX.Temperature.y[index]}
                  stroke={tempLineInfo.lineColorObj.lineColor}
                  strokeWidth={1.2}
                  type="monotone"
                  unit="temperatura"
                  dot={false}

                />
                )}
                {humLineInfo.isLimitVisible && graphDataX.Humidity && (
                <ReferenceLine yAxisId="hum" y={state.devInfo?.dut?.HUMIMAX} stroke={humLineInfo.limitColorObj.lineColor} strokeWidth={0.7} />
                )}
                {humLineInfo.isLimitVisible && graphDataX.Humidity && (
                <ReferenceLine yAxisId="hum" y={state.devInfo?.dut?.HUMIMIN} stroke={humLineInfo.limitColorObj.lineColor} strokeWidth={0.7} />
                )}
                {tempLineInfo.isLimitVisible && graphDataX.Temperature && (
                <ReferenceLine yAxisId="tempId" y={state.devInfo?.dut?.TUSEMAX} stroke={tempLineInfo.limitColorObj.lineColor} strokeWidth={0.7} />
                )}
                {tempLineInfo.isLimitVisible && graphDataX.Temperature && (
                <ReferenceLine yAxisId="tempId" y={state.devInfo?.dut?.TUSEMIN} stroke={tempLineInfo.limitColorObj.lineColor} strokeWidth={0.7} />
                )}
                {co2LineInfo.isLimitVisible && graphDataX?.eCO2 && state.devInfo?.dut?.CO2MAX && (
                <ReferenceLine yAxisId="co2id" y={state.devInfo?.dut?.CO2MAX} stroke={co2LineInfo.limitColorObj.lineColor} strokeWidth={0.7} />
                )}
                { returnTooltipGroup(date, graphDataX, { dut: state.devInfo.dut, limitInfo: { co2LineInfo, tempLineInfo, humLineInfo } }, isDutQA) }
              </LineChart>
            </ResponsiveContainer>
            <div style={{
              display: 'flex', flexDirection: 'row', width: '90%', paddingLeft: '80px',
            }}
            >
              { graphDataX.Temperature && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <CheckBoxLines text="Temperatura[°C]" onClick={() => { tempLineInfo.isVisible = !tempLineInfo.isVisible; render(); }} checked={tempLineInfo.isVisible} color={tempLineInfo.lineColorObj.lineColor} />
                <CheckBoxLines text="Limite de temperatura [°C]" onClick={() => { tempLineInfo.isLimitVisible = !tempLineInfo.isLimitVisible; render(); }} checked={tempLineInfo.isLimitVisible} color={tempLineInfo.limitColorObj.lineColor} />
              </div>
              ) }
              { graphDataX.Humidity && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <CheckBoxLines text="Umidade [%]" onClick={() => { humLineInfo.isVisible = !humLineInfo.isVisible; render(); }} checked={humLineInfo.isVisible} color={humLineInfo.lineColorObj.lineColor} />
                <CheckBoxLines text="Limite de Umidade [%]" onClick={() => { humLineInfo.isLimitVisible = !humLineInfo.isLimitVisible; render(); }} checked={humLineInfo.isLimitVisible} color={humLineInfo.limitColorObj.lineColor} />
              </div>
              ) }
              { graphDataX.eCO2 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <CheckBoxLines text="CO₂ [ppm]" onClick={() => { co2LineInfo.isVisible = !co2LineInfo.isVisible; render(); }} checked={co2LineInfo.isVisible} color={co2LineInfo.lineColorObj.lineColor} />
                <CheckBoxLines text="Limite de CO₂ [ppm]" onClick={() => { co2LineInfo.isLimitVisible = !co2LineInfo.isLimitVisible; render(); }} checked={co2LineInfo.isLimitVisible} color={co2LineInfo.limitColorObj.lineColor} />
              </div>
              ) }
            </div>
          </>
        )
      }
      { !state.groupGraph && graphDataX?.Temperature?.y.some((item) => item !== null) && (
      <>
        <b style={{ fontSize: '18px', padding: '25px' }}>{t('temperatura')}</b>
        <GraphLineChart
          date={date}
          graphDataX={graphDataX}
          isDutQA={isDutQA}
          limitData={{
            dut: state.devInfo.dut,
            limitInfo: {
              co2LineInfo, tempLineInfo, humLineInfo, L1LineInfo, temp1LineInfo,
            },
          }}
          xaxisProps={[xaxisObject(graphDataX)]}
          yaxisProps={
                    [{
                      id: 2,
                      type: 'number',
                      yAxisId: 'tempId',
                      allowDataOverflow: true,
                      tick: <CustomTickGraph type="temp" ticks={generateTicks(axisInfo.tempLimits)} hasL1={state.hasL1} />,
                      dataKey: 'y',
                      ticks: generateTicks(axisInfo.tempLimits),
                      interval: 0,
                      domain: hasL1 && axisInfo.tempLimits ? [axisInfo.tempLimits[0] - 2, axisInfo.tempLimits[1]] : axisInfo.tempLimits,
                      Label: {
                        offset: -45,
                        angle: 90,
                        position: 'right',
                        style: { color: '#656565', fontSize: '16px', textAnchor: 'middle' },
                      },
                    }]
                  }
          lineProps={
                    [{
                      id: 3,
                      yAxisId: 'tempId',
                      dataKey: ({ index }) => graphDataX?.Temperature?.y[index],
                      stroke: tempLineInfo.lineColorObj.lineColor,
                      strokeWidth: 1.2,
                      unit: 'Temperatura',
                      type: 'monotone',
                      dot: false,
                      isVisible: tempLineInfo.isVisible,
                    }, {
                      id: 4,
                      yAxisId: 'tempId',
                      dataKey: ({ index }) => graphDataX?.Temperature_1?.y[index],
                      stroke: temp1LineInfo.lineColor,
                      strokeWidth: 1.2,
                      unit: 'temperatura1',
                      type: 'monotone',
                      dot: false,
                      isVisible: temp1LineInfo.isVisible,
                    }, {
                      id: 5,
                      yAxisId: 'tempId',
                      dataKey: ({ index }) => (graphDataX?.L1?.y[index] != null ? graphDataX?.L1?.y[index] - menorNumber : null),
                      stroke: L1LineInfo.lineColor,
                      strokeWidth: 1.2,
                      unit: 'L1',
                      type: 'monotone',
                      dot: false,
                      isVisible: L1LineInfo.isVisible,
                    }]
                  }
          referenceProps={[{
            id: 6,
            yAxisId: 'tempId',
            y: state.devInfo?.dut?.TUSEMAX,
            stroke: tempLineInfo.limitColorObj.lineColor,
            strokeWidth: 0.7,
            isVisible: tempLineInfo.isLimitVisible,
            segment: state.useMaxGraphData,
            isDutQA,
          },
          {
            id: 7,
            yAxisId: 'tempId',
            y: state.devInfo?.dut?.TUSEMIN,
            stroke: tempLineInfo.limitColorObj.lineColor,
            strokeWidth: 0.7,
            isVisible: tempLineInfo.isLimitVisible,
            segment: state.useMinGraphData,
            isDutQA,
          }]}
          hasL1={state.hasL1 || graphDataX?.Temperature_1?.y.some((item) => item !== null)}
        />
        <div
          style={{
            display: 'flex', flexDirection: 'row', paddingLeft: '70px', flexWrap: 'wrap',
          }}
        >
          <CheckBoxLines text={labelTemp()} onClick={() => { tempLineInfo.isVisible = !tempLineInfo.isVisible; render(); }} checked={tempLineInfo.isVisible} color={tempLineInfo.lineColorObj.lineColor} />
          <CheckBoxLines text="Limite de temperatura [°C]" onClick={() => { tempLineInfo.isLimitVisible = !tempLineInfo.isLimitVisible; render(); }} checked={tempLineInfo.isLimitVisible} color={tempLineInfo.limitColorObj.lineColor} />
          { (graphDataX.Temperature_1?.y?.length > 0 && graphDataX.Temperature_1?.y?.filter((item) => item !== null).length > 0) && (
            <CheckBoxLines text={labelTemp1()} onClick={() => { temp1LineInfo.isVisible = !temp1LineInfo.isVisible; render(); }} checked={temp1LineInfo.isVisible} color={temp1LineInfo.lineColor} />
          )}
          {
            state.hasL1 && (
              <CheckBoxLines text="Status do Compressor" onClick={() => { L1LineInfo.isVisible = !L1LineInfo.isVisible; render(); }} checked={L1LineInfo.isVisible} color={L1LineInfo.lineColor} />
            )
          }
        </div>
      </>
      )}
      { !state.groupGraph && isDutQA && graphDataX?.Humidity?.y.some((item) => item !== null) && (
      <>
        <b style={{ fontSize: '18px', padding: '25px' }}>{t('umidade')}</b>
        <GraphLineChart
          date={date}
          graphDataX={graphDataX}
          limitData={{
            dut: state.devInfo.dut,
            limitInfo: {
              co2LineInfo, tempLineInfo, humLineInfo, L1LineInfo, temp1LineInfo,
            },
          }}
          hasL1={false}
          xaxisProps={[xaxisObject(graphDataX)]}
          yaxisProps={
            [{
              id: 2,
              type: 'number',
              yAxisId: 'hum',
              allowDataOverflow: true,
              tick: <CustomTickGraph type="hum" />,
              dataKey: 'y',
              ticks: axisInfo.humTicks,
              interval: 0,
              domain: axisInfo.humLimits,
              Label: {
                offset: -45,
                angle: 90,
                position: 'right',
                style: { color: '#656565', fontSize: '16px', textAnchor: 'middle' },
              },
            }]
          }
          lineProps={
            [{
              id: 3,
              yAxisId: 'hum',
              dataKey: ({ index }) => graphDataX?.Humidity?.y[index],
              stroke: humLineInfo.lineColorObj.lineColor,
              strokeWidth: 1.2,
              unit: 'Umidade',
              type: 'monotone',
              dot: false,
              isVisible: humLineInfo.isVisible,
            }]
          }
          referenceProps={[{
            id: 5,
            yAxisId: 'hum',
            y: state.devInfo?.dut?.HUMIMAX,
            stroke: humLineInfo.limitColorObj.lineColor,
            strokeWidth: 0.7,
            isVisible: humLineInfo.isLimitVisible,
          },
          {
            id: 7,
            yAxisId: 'hum',
            y: state.devInfo?.dut?.HUMIMAX,
            stroke: humLineInfo.limitColorObj.lineColor,
            strokeWidth: 0.7,
            isVisible: humLineInfo.isLimitVisible,
          },
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: '70px' }}>
          <CheckBoxLines text="Umidade [%]" onClick={() => { humLineInfo.isVisible = !humLineInfo.isVisible; render(); }} checked={humLineInfo.isVisible} color={humLineInfo.lineColorObj.lineColor} />
          <CheckBoxLines text="Limite de Umidade [%]" onClick={() => { humLineInfo.isLimitVisible = !humLineInfo.isLimitVisible; render(); }} checked={humLineInfo.isLimitVisible} color={humLineInfo.limitColorObj.lineColor} />
        </div>
      </>
      )}
      { !state.groupGraph && isDutQA && graphDataX?.eCO2?.y.some((item) => item !== null) && (
      <>
        <b style={{ fontSize: '18px', padding: '14px' }}>CO₂</b>
        <GraphLineChart
          date={date}
          graphDataX={graphDataX}
          hasL1={false}
          limitData={{
            dut: state.devInfo.dut,
            limitInfo: {
              co2LineInfo, tempLineInfo, humLineInfo, L1LineInfo, temp1LineInfo,
            },
          }}
          xaxisProps={[xaxisObject(graphDataX)]}
          yaxisProps={
            [{
              id: 21,
              type: 'number',
              yAxisId: 'hum',
              allowDataOverflow: true,
              tick: <CustomTickGraph type="co2" />,
              dataKey: 'y',
              ticks: axisInfo.eCO2Ticks,
              interval: 0,
              domain: axisInfo.eCO2Domain,
              Label: {
                offset: -45,
                angle: 90,
                position: 'right',
                style: { color: '#656565', fontSize: '16px', textAnchor: 'middle' },
              },
            }]
          }
          lineProps={
            [{
              id: 21,
              yAxisId: 'hum',
              data: graphData.eCO2,
              dataKey: ({ index }) => graphDataX?.eCO2?.y[index],
              unit: 'CO₂',
              stroke: co2LineInfo.lineColorObj.lineColor,
              strokeWidth: 1.2,
              type: 'monotone',
              dot: false,
              isVisible: co2LineInfo.isVisible,
            }]
          }
          referenceProps={[{
            id: 22,
            yAxisId: 'hum',
            y: state.devInfo?.dut?.CO2MAX,
            stroke: co2LineInfo.limitColorObj.lineColor,
            strokeWidth: 0.7,
            isVisible: co2LineInfo.isLimitVisible,
          },
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: '70px' }}>
          <CheckBoxLines text="CO₂ [ppm]" onClick={() => { co2LineInfo.isVisible = !co2LineInfo.isVisible; render(); }} checked={co2LineInfo.isVisible} color={co2LineInfo.lineColorObj.lineColor} />
          <CheckBoxLines text="Limite de CO₂ [ppm]" onClick={() => { co2LineInfo.isLimitVisible = !co2LineInfo.isLimitVisible; render(); }} checked={co2LineInfo.isLimitVisible} color={co2LineInfo.limitColorObj.lineColor} />
        </div>
      </>
      )}
      {
        !hasData && (
          <NoDataInTable />
        )
      }
    </HistoryContainerQA>
  );
}

const CheckBoxLines = ({
  text, checked, onClick, color,
}) => (
  <Box minWidth={250} maxWidth={290}>
    <CheckboxLine>
      <Checkbox
        checked={checked}
        onClick={onClick}
        color="primary"
      />
      <Text>{text}</Text>
      <div style={{ width: '8px' }} />
      <div style={{
        paddingLeft: '8px', height: '10px', width: '35px', borderRadius: '6px', backgroundColor: color || 'blue',
      }}
      />
    </CheckboxLine>
  </Box>
);

const CustomTickGraph = (props) => {
  const {
    x, y, payload, anchor, type, ticks, hasL1,
  } = props;
  let label = payload.value;
  switch (type) {
    case 'co2':
      label = `${payload.value}ppm`;
      break;
    case 'hum':
      label = `${payload.value}%`;
      break;
    case 'temp':
      label = `${payload.value}°C`;
      break;
  }
  if (Array.isArray(ticks) && hasL1) {
    if (payload.value === ticks[0]) {
      label = 'DESLIGADO';
    } else if (payload.value === ticks[1]) {
      label = 'LIGADO';
    }
  }
  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
};

function handleClick(LineInfo) {
  if (!LineInfo) return;
  LineInfo.isDisplayColorVisible = !LineInfo.isDisplayColorVisible;
}

function handleClose(lineInfo) {
  if (!lineInfo) return;
  lineInfo.displayColorPicker = false;
}

function RenderModalLines({
  lineInfo, render,
}): JSX.Element {
  return (
    <Flex alignItems="center" style={{ marginBottom: '8px' }}>
      <OptionColor
        color={lineInfo.lineColor}
        style={{ cursor: 'pointer' }}
        onClick={() => { handleClick(lineInfo); render(); }}
      />
      <span style={{ paddingLeft: '10px' }}>{lineInfo.text}</span>
      { lineInfo.isDisplayColorVisible && (
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: '40%',
          right: '40%',
        }}
      >
        <div
          style={{
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
          }}
          onClick={() => handleClose(lineInfo)}
        />
        <SketchPicker
          color={lineInfo.lineColor}
          onChange={({ hex }) => {
            lineInfo.lineColor = hex;
            lineInfo.isDisplayColorVisible = false;
            render(); }}
        />
      </div>
      )}
    </Flex>
  );
}

function Card({
  Filtering,
  graphData,
  graphEnable,
  handleChange,
  axisInfo,
  state,
  date,
  render,
  tickXLabelFormaterHour,
}: {
  // @ts-ignore
  Filtering?: React.Element,
  graphData?: any,
  graphEnable?: any,
  handleChange?: () => void,
  axisInfo: any,
  state: any,
  date: null|moment.Moment,
  isDutQA: boolean,
  render: () => void,
  tickXLabelFormaterHour,
}) {
  function isFancoil() {
    if (state.devInfo.dut && state.devInfo.dut.APPLICATION === 'fancoil') {
      return true;
    }
    return false;
  }

  function labelTemp() {
    if (isFancoil() && graphData?.Temperature_1) {
      return `${t('temperaturaSaidaAgua')} [°C]`;
    }
    if (!isFancoil() && graphData?.Temperature_1) {
      return `${t('temperaturaRetorno')} [°C]`;
    }
    return `${t('temperaturaAmbiente')} [°C]`;
  }

  function labelTemp1() {
    if (isFancoil()) {
      return `${t('temperaturaEntradaAgua')} [°C]`;
    }
    return `${t('temperaturaInsuflamento')}`;
  }
  const hasData = (state.graphDataX?.Temperature?.y.some((item) => item !== null) || state.graphDataX?.Temperature_1?.y.some((item) => item !== null) || state.graphDataX?.Humidity?.y.some((item) => item !== null) || state.graphDataX?.eCO2?.y.some((item) => item !== null || state.graphDataX?.L1?.y.some((item) => item !== null)));
  return (
    <CardWrapper>
      {state.isModalOpen && (
      <ModalWindow onClickOutside={undefined}>
        <ModalContent>
          <Box style={{ borderBottom: '2px solid rgba(128,128,128,0.4)' }}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              style={{ marginBottom: '20px' }}
            >
              <h2 style={{ margin: '0px' }}><b>{t('alterarCores')}</b></h2>
              <BtnExport
                variant="secondary"
                onClick={() => { state.isModalOpen = false; render(); }}
              >
                <Flex justifyContent="center" alignItems="center">
                  <CloseBtnIcon />
                </Flex>
              </BtnExport>
            </Flex>
          </Box>
          <Box
            mt="10px"
            style={{ overflow: 'auto', maxHeight: '85%' }}
          >
            { state.graphDataX.Humidity && (
            <>
              <RenderModalLines lineInfo={state.humLineInfo.lineColorObj} render={render} />
              <RenderModalLines lineInfo={state.humLineInfo.limitColorObj} render={render} />
            </>
            ) }
            { state.graphDataX.Temperature && (
            <>
              <RenderModalLines lineInfo={state.tempLineInfo.lineColorObj} render={render} />
              <RenderModalLines lineInfo={state.tempLineInfo.limitColorObj} render={render} />
            </>
            ) }
            { state.graphDataX.eCO2 && (
            <>
              <RenderModalLines lineInfo={state.co2LineInfo.lineColorObj} render={render} />
              <RenderModalLines lineInfo={state.co2LineInfo.limitColorObj} render={render} />
            </>
            ) }
          </Box>
        </ModalContent>
      </ModalWindow>
      )}
      <Flex width="100%" justifyContent="space-between" paddingRight="40px" paddingLeft="20px">
        <div style={{ display: 'flex' }}>
          { Filtering && <Filtering /> }
          { (state.devInfo.dut.operation_mode === 5 && hasData && date) && (
          <Box style={{ paddingLeft: '30px', paddingBottom: '30px' }}>
            <b style={{ fontSize: '14px' }}>{t('visualizacao')}</b>
            <Box minWidth="280px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <span style={{ fontSize: '1rem' }}>{t('desagrupar')}</span>
              <ToggleSwitchMini
                checked={state.groupGraph}
                onClick={() => { state.groupGraph = !state.groupGraph; render(); }}
                style={{ marginLeft: '10px', marginRight: '10px' }}
              />
              <span style={{ fontSize: '1rem' }}>{t('agrupar')}</span>
            </Box>
          </Box>
          ) }
        </div>
        { (state.devInfo.dut.operation_mode === 5 && hasData && date) && <ColorsPalet state={state} render={render} /> }
      </Flex>
      {(!date) ? <NoGraph title={t('historicoDoDut')} /> : null}
      {date && (
        <DutQAHistory
          state={state}
          Filtering={Filtering}
          graphData={graphData}
          labelTemp={labelTemp}
          labelTemp1={labelTemp1}
          tickXLabelFormaterHour={tickXLabelFormaterHour}
          render={render}
          date={date}
          isDutQA={state.devInfo.dut.operation_mode === 5}
          hasData={hasData}
        />
      )}
    </CardWrapper>
  );
}

type LabelType = {
  offset: number
  angle: number
  position: string
  style: object
}

type XaxisType = {
  id: number
  allowDataOverflow: boolean
  type: string
  name: string
  dataKey: any
  ticks: number []
  allowDecimals: boolean
  domain: number []
  ticksFormater: (x: number) => string
}

type YaxisType = {
  id: number
  yAxisId: string
  allowDataOverflow: boolean
  tick: JSX.Element
  dataKey: string
  ticks: number []
  interval: number
  domain: number []
  Label: LabelType
}

type LineType = {
  id: number
  yAxisId: string
  unit: string
  dataKey: (item: any) => any
  stroke: string
  strokeWidth: number
  type: string
  dot: boolean
  isVisible: boolean
}

type ReferenceLine = {
  id: number
  yAxisId: string
  y: number
  strokeWidth: number
  isVisible: boolean
  stroke: string
  segment?: { x: number, y: number }[]
  isDutQA?: boolean
}

const GraphLineChart = ({
  xaxisProps, yaxisProps, lineProps, referenceProps, limitData, graphDataX, date, hasL1 = false, isDutQA = false,
}: { xaxisProps?: XaxisType[], yaxisProps?: YaxisType[], lineProps?: LineType[], referenceProps?: ReferenceLine[], limitData, graphDataX, date, hasL1?: boolean, isDutQA?: boolean }): JSX.Element => (
  <ResponsiveContainer width="96%" height={500}>
    <LineChart
      height={600}
      data={graphDataX.commonX?.map((_data, index) => ({ index }))}
      margin={{
        top: 25,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      { xaxisProps && xaxisProps?.map((xaxis) => (
        <XAxis
          key={xaxis.id}
          allowDataOverflow
          type={xaxis.type}
          name={xaxis.name}
          dataKey={xaxis.dataKey}
          tickFormatter={tickXLabelFormaterHour}
          ticks={xaxis.ticks}
          allowDecimals={xaxis.allowDecimals}
          domain={xaxis.domain}
        />
      )) }
      {
          yaxisProps && yaxisProps?.map((yaxis) => (
            <YAxis
              key={yaxis.id}
              yAxisId={yaxis.yAxisId}
              allowDataOverflow
              tick={yaxis.tick}
              dataKey="y"
              ticks={yaxis.ticks}
              interval={0}
              domain={yaxis.domain}
            >
              <Label
                offset={yaxis.Label.offset}
                angle={yaxis.Label.angle}
                position={yaxis.Label.position}
                style={yaxis.Label.style}
              />
            </YAxis>
          ))
        }
      {
          lineProps && lineProps?.map((line) => line.isVisible && (
            <Line
              key={line.id}
              yAxisId={line.yAxisId}
              dataKey={line.dataKey}
              stroke={line.stroke}
              unit={line.unit}
              strokeWidth={line.strokeWidth}
              type="monotone"
              dot={false}
            />
          ))
        }
      {
          referenceProps && referenceProps?.map((line) => {
            if (line.isVisible) {
              if (line.segment && !line.isDutQA) {
                return (
                  <ReferenceLine
                    key={line.id}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    segment={line.segment}
                    yAxisId="tempId"
                    ifOverflow="extendDomain"
                  />
                );
              }
              return <ReferenceLine key={line.id} y={line.y} stroke={line.stroke} yAxisId={line.yAxisId} strokeWidth={line.strokeWidth} />;
            }
            return <></>;
          })
        }
      { returnTooltip(limitData, date, graphDataX, hasL1, isDutQA) }
    </LineChart>
  </ResponsiveContainer>
);

const NoDataInTable = () => (
  <NoAnalisysSelected>
    <EmptyDocumentIcon />
    <p>
      {t('graficoSemDados')}
    </p>
  </NoAnalisysSelected>
);

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

const ModalTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Grey400};
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

const ModalSection = styled.div`
  width: 100%;
  height: 80px;
  background: ${colors.Grey030};
  border-bottom: 2px solid ${colors.Grey100};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
`;

const MobileWrapper = styled.div`
  display: block;

  @media (min-width: 768px) {
    display: none;
  }
`;

const DesktopWrapper = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const Text = styled.span`
  font-weight: normal;
  font-size: 0.8em;
  line-height: 26px;
  color: ${colors.Grey400};

  @media (min-width: 460px) {
    font-size: 1em;
  }
`;

const CheckboxLine = styled.div`
  display: flex;
  align-items: center;
  padding-right: 0px;
  @media (min-width: 460px) {
    padding-right: 20px;
  }
`;

const ColoredLine = styled(LineIcon)(
  ({ color }) => `
  margin-left: 10px;
  color: ${color};
`,
);

const CardWrapper = styled.div`
  padding: 32px 24px;
  margin-top: 24px;
  background: ${colors.White};
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
