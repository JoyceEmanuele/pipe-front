import Checkbox from '@material-ui/core/Checkbox';
import moment, { Moment } from 'moment';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceArea,
  Label,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import { Box, Flex } from 'reflexbox';
import { SketchPicker } from 'react-color';
import '~/assets/css/ReactTags.css';
import { t } from 'i18next';
import {
  Loader, Card, ModalWindow,
  ModalLoading,
} from 'components';
import * as axisCalc from 'helpers/axisCalc';
import { getDaySched } from 'helpers/scheduleData';
import { useStateVar } from 'helpers/useStateVar';
import { ApiResps, apiCall, apiCallDownload } from 'providers';
import { colors } from 'styles/colors';
import {
  Text,
  BtnExport,
  ZoomOut,
  OptionColor,
  ModalContent,
  ColorChangeBtnWithHover,
  ColorChangeBtnSvg,
  CloseBtnIcon,
} from './styles';
import { addDays_YMD } from '~/helpers/formatTime';
import { NoGraph } from '../NoGraph';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { TListFilters, UtilFilter } from '~/pages/Analysis/Utilities/UtilityFilter';
import { Trans } from 'react-i18next';

interface GroupChartData {
  lineId: string;
  data: { y: (number|null)[], L?: (number|null)[] };
  isL1: boolean;
  tempLimits?: [number, number];
  humLimits?: [number, number];
  co2Limits?: [number, number];
  powerLimits?: [number, number];
  color?: string;
  axisId?: string;
  distance?: string;
  name?: string;
  type?: string;
  showLine?: boolean
}
export interface GroupInfo {
  GROUP_ID: string;
  GROUP_NAME: string;
  checked: boolean;
  devs?: {
    DAC_ID?: string;
    DEV_ID?: string;
    DRI_ID?: string;
    DMT_CODE?: string;
    DAL_CODE?: string;
    VARS?: string;
    PLACEMENT?: string;
    isVav?: boolean;
  }[];
  gData: GroupChartData[];
  type: string;
  color: string;
  unitId?: number;
  CD_ESTACAO?: string;
  displayColorPicker?: boolean;
  DISTANCIA_EM_KM?: string;
  vars?: string;
  ENERGY_DEVICE_ID?: string;
  SERIAL?: string;
  MANUFACTURER?: string;
  MODEL?: string;
  humidity?: boolean;
  temperature?: boolean;
  eco2?: boolean;
}

// https://www.colourlovers.com/palettes
// https://colorbrewer2.org/
// https://blog.graphiq.com/finding-the-right-color-palettes-for-data-visualizations-fcd4e707a283
const colorList = [
  '#e6194B',
  '#287833',
  '#f032e6',
  '#3259e6',
  '#f58231',
  '#847c7c',
  '#347069',
  '#0f8aa6',
  '#800000',
  '#000075',
  '#A16B00',
  '#8719a9',
  '#565655',
  '#6a9400',
  '#3668A3',
  '#554694',
  '#A10A00',
  '#693c0e',
  '#9d847c',
  '#AB00A2',
];

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

export const CustomYTick = ({
  x, y, payload, anchor, namedTicks, unitProps,
}: any) => {
  let text = payload.value == null ? '' : payload.value.toString();
  const payloadValue = text;

  if (namedTicks && namedTicks[text]) {
    text = namedTicks[text];
  }

  let unit = '';

  switch (unitProps) {
    case 'temp':
      unit = ' °C';
      break;
    case 'hum':
      unit = ' %';
      break;
    case 'kw':
      unit = ' Kw';
      break;
    case 'co2':
      unit = ' ppm';
  }

  if (namedTicks[payloadValue]) {
    unit = '';
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text
        x={0}
        y={2}
        dy={16}
        textAnchor={anchor || 'end'}
        fill="#666"
        fontSize="10px"
        style={{ padding: '2px 0' }}
      >
        {text + unit}
      </text>
    </g>
  );
};

const CustomPowerTick = ({
  x, y, payload, anchor,
}: any) => {
  const text = payload.value < 0 ? '' : payload.value;
  return (
    <g transform={`translate(${x + 9},${anchor ? y : y - 12})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor={anchor || 'end'}
        fill="#666"
        fontSize="10px"
      >
        {`${text}Kw`}
      </text>
    </g>
  );
};

export function tickXLabelFormaterHour(hour: number) {
  const numDays = Math.floor(hour / 24);
  const sign = hour - 24 * numDays < 0 ? '-' : '';
  const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
  const mm = Math.floor((Math.abs(hour) * 60) % 60);
  return `${'\n'} ${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(
    2,
    '0',
  )}`;
}

export const renderQuarterTickHour = (tickProps: any) => {
  const { x, y, payload } = tickProps;
  const { value } = payload;

  return (
    <text
      x={x}
      y={y - 4}
      textAnchor="middle"
      className="recharts-text"
    >
      {`${tickXLabelFormaterHour(value)}`}

    </text>
  );
};

interface ComponentProps {
  ambientes: {
    DEV_ID: string;
    ROOM_NAME: string;
    lineColor?: string;
    temperature?: number | string;
    eCO2?: number | string;
    VARS?: string;
    PLACEMENT?: string;
  }[];
  conjuntos: {
    groupId: number;
    name: string;
    dacs: {
      DAC_ID: string;
      DAC_NAME: string;
    }[];
    dris: {
      DRI_ID: string;
    }[];
    lineColor?: string;
  }[];
  utilitarios?: {
    ID: number
    TYPE: string
    NAME: string
    PORT: number
    FEEDBACK: number
    DMT_CODE: string
    DAL_CODE: string
  }[];
  weatherStations?: {
    CD_ESTACAO: string;
    DC_NOME: string;
    DISTANCIA_EM_KM?: string;
  }[];
  unitId: number;
  unitName: string;
  includePower: boolean;
  includeDme?: ApiResps['/energy/get-energy-list']['list'];
  L1only?: boolean;
  splitLcmp?: boolean;
  height?: number;
  temperatureLimits: null | {
    workPeriods: { [day: string]: string };
    workPeriodExceptions: { [day: string]: string };
    TUSEMAX: number;
    TUSEMIN: number;
  };
  unitCoordinate?: {
    lat: string | null;
    lon: string | null;
  }
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T; // from lodash

function truthy<T>(value: T): value is Truthy<T> {
  return !!value;
}

export const EnvGroupAnalysis = (props: ComponentProps): JSX.Element => {
  const {
    ambientes,
    conjuntos,
    utilitarios,
    unitId,
    unitName,
    includePower,
    includeDme,
    L1only,
    height,
    temperatureLimits,
    splitLcmp,
    unitCoordinate,
  } = props;

  const [state, render, setState] = useStateVar({
    date: null as Moment | null,
    grupos: {} as { [group: string]: GroupInfo },
    loadingData: false as boolean,
    exportLoading: false as boolean,
    selectedVars: [] as GroupChartData[],
    search: [] as { id: string; text: string }[],
    trooms: [] as GroupInfo[],
    l1s: [] as GroupInfo[],
    tambs: [] as GroupInfo[],
    powers: [] as GroupInfo[],
    utilities: [] as GroupInfo[],
    troomsOpened: true as boolean,
    l1sOpened: true as boolean,
    tambsOpened: true as boolean,
    powersOpened: true as boolean,
    utilitiesOpened: true as boolean,
    troomsFiltered: [] as { name: string; value: string, icon: JSX.Element }[],
    l1sFiltered: [] as { name: string; value: string }[],
    tambsFiltered: [] as { name: string; value: string }[],
    powersFiltered: [] as { name: string; value: string }[],
    tInmetFiltered: [] as { name: string; value: string }[],
    utilitiesFiltered: [] as { name: string; value: string }[],
    tInmet: [] as GroupInfo[],
    selectedTrooms: [] as string[],
    selectedTambs: [] as string[],
    selectedPowers: [] as string[],
    selectedTInmets: [] as string[],
    selectedL1s: [] as string[],
    selectedUtilities: []as string[],
    allCheck: false as boolean,
    isSelected: false as boolean,
    axisDataLimits: {} as {
      minTval?: number;
      maxTval?: number;
      minPval?: number;
      maxPval?: number;
    },
    axisInfo: {
      L1start: null,
      tempLimits: [-15, 40],
      tempTicks: [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40],
      humLimits: [0, 100],
      humTicks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      powerLimits: [-15, 40],
      powerTicks: [0, 5, 10, 15, 20, 25, 30, 35, 40],
      co2Limits: [0, 3600],
      co2Ticks: [
        0, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600,
      ],
    } as {
      L1start: number | null;
      tempLimits: number[];
      tempTicks: number[];
      powerLimits: number[];
      powerTicks: number[];
      co2Limits: number[];
      co2Ticks: number[];
    },
    boolTicksNames: null as { [v: string]: string } | null,
    displayColorPicker: false as boolean,
    useMinGraphData: null as { x: number; y: number }[] | null | undefined,
    useMaxGraphData: null as { x: number; y: number }[] | null | undefined,
    refAreaLeft: null as null | number,
    refAreaRight: null as null | number,
    commonX: [] as number[],
    xDomain: null as null | [number, number],
    xTicks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] as number[],
    numDays: 1 as number,
    multiDays: false,
    selectedTimeRange: null as string | null,
    startDate: null as Moment | null,
    endDate: null as Moment | null,
    tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    focusedInput: null as 'endDate' | 'startDate' | null,
    focused: false,
    isModalOpen: false,
    weatherStationsData: {} as {
      [key: string]: {
        date: string;
        temperatures: { y: number[] };
        tempLimits: number[];
        distance?: string;
      }
    },
  });
  verifyExternalProps();

  const listFilters: TListFilters[] = [
    'periodo',
    'dataNew',
    'ambiente',
    'maquina',
    'temperaturaExterna',
    'temperaturaExternaMeteorologica',
    'utilitario',
    'potenciaAtiva',
  ];

  function handleCommonX() {
    const commonX = [] as number[];
    let xInsert = 0;
    while (xInsert <= state.numDays * 24) {
      commonX.push(xInsert);
      xInsert += (0.00138888888 * (state.numDays * state.numDays));
    }
    return commonX;
  }

  function getTemperatureLimitLines(dayYMD: string | null) {
    if (!temperatureLimits) return;
    if (!temperatureLimits.workPeriods) return;
    if (!dayYMD) return;
    const pData = getDaySched(
      temperatureLimits.workPeriods,
      temperatureLimits.workPeriodExceptions,
      dayYMD,
    );
    if (pData.isDefault) return;
    if (pData.type !== 'enabled') return;

    const indexIni = (Number(pData.startHM.substring(0, 2)) * 60
      + Number(pData.startHM.substring(3, 5)) * 1)
      / 60;
    const indexEnd = (Number(pData.endHM.substring(0, 2)) * 60
      + Number(pData.endHM.substring(3, 5)) * 1)
      / 60;
    let useMaxGraphData: { x: number; y: number }[] | null = null;
    if (temperatureLimits.TUSEMAX != null) {
      useMaxGraphData = [
        { x: indexIni, y: temperatureLimits.TUSEMAX },
        { x: indexEnd, y: temperatureLimits.TUSEMAX },
      ];
    }
    let useMinGraphData: { x: number; y: number }[] | null = null;
    if (temperatureLimits.TUSEMIN != null) {
      useMinGraphData = [
        { x: indexIni, y: temperatureLimits.TUSEMIN },
        { x: indexEnd, y: temperatureLimits.TUSEMIN },
      ];
    }
    return { useMaxGraphData, useMinGraphData };
  }

  type ColorIndexAux = { colorIndex: number }

  function verifyEnvProps(aux: ColorIndexAux) {
    for (const dut of ambientes) {
      const GROUP_ID = `g${dut.DEV_ID}`;
      const GROUP_NAME = dut.ROOM_NAME;
      if (!state.grupos[GROUP_ID]) {
        dut.lineColor = colorList[++aux.colorIndex % colorList.length];
        const info = {
          GROUP_ID,
          GROUP_NAME,
          checked: false,
          devs: [dut],
          gData: [],
          type: 'room-temp',
          color: dut.lineColor,
          vars: dut.VARS,
        };
        state.grupos[GROUP_ID] = info;
        if (dut.PLACEMENT === 'DUO') {
          const INS_GROUP_ID = info.GROUP_ID.concat('-INS');
          state.grupos[INS_GROUP_ID] = {
            ...info,
            GROUP_ID: INS_GROUP_ID,
            GROUP_NAME: '(INS) '.concat(info.GROUP_NAME),
            color: colorList[++aux.colorIndex % colorList.length],
          };
        }
      }
    }
  }

  function addDacGroupByType(
    grupo: ComponentProps['conjuntos'][number],
    dac: ComponentProps['conjuntos'][number]['dacs'][number],
    aux: ColorIndexAux,
    type: string,
  ) {
    const GROUP_ID = `g-${type}:${grupo.groupId}\t${dac.DAC_ID}`;
    let GROUP_NAME = grupo.name;
    if (grupo.dacs.length > 1) {
      if (!dac.DAC_NAME) {
        dac.DAC_NAME = `Condensadora ${grupo.dacs.indexOf(dac) + 1}`;
      }
      GROUP_NAME += ` (${dac.DAC_NAME})`;
    }
    if (!state.grupos[GROUP_ID]) {
      grupo.lineColor = colorList[++aux.colorIndex % colorList.length];
      state.grupos[GROUP_ID] = {
        GROUP_ID,
        GROUP_NAME,
        checked: false,
        devs: [dac],
        gData: [],
        type,
        color: grupo.lineColor,
      };
    }
  }

  function verifyDacsProps(grupo: ComponentProps['conjuntos'][number], aux: ColorIndexAux) {
    for (const dac of grupo.dacs) {
      addDacGroupByType(grupo, dac, aux, 'Lcmp');
      if (!L1only) {
        addDacGroupByType(grupo, dac, aux, 'Tamb');
      }
    }
  }

  function verifyDrisProps(grupo: ComponentProps['conjuntos'][number], aux: ColorIndexAux) {
    for (const dri of grupo.dris) {
      const GROUP_ID = `g-ValveOn:${grupo.groupId}\t${dri.DRI_ID}`;
      const GROUP_NAME = grupo.name;
      if (!state.grupos[GROUP_ID]) {
        if (!grupo.lineColor) {
          grupo.lineColor = colorList[++aux.colorIndex % colorList.length];
        }
        state.grupos[GROUP_ID] = {
          GROUP_ID,
          GROUP_NAME,
          checked: false,
          devs: [dri],
          gData: [],
          type: 'ValveOn',
          color: grupo.lineColor,
        };
      }
    }
  }

  function verifyGroupsProps(aux: ColorIndexAux) {
    for (const grupo of conjuntos) {
      verifyDacsProps(grupo, aux);
      verifyDrisProps(grupo, aux);
    }
  }

  function verifyWeatherStationsProps(aux: ColorIndexAux) {
    for (const grupo of props.weatherStations ?? []) {
      const GROUP_ID = `g-Inmet:${grupo.CD_ESTACAO}`;
      const GROUP_NAME = grupo.DC_NOME;
      if (!state.grupos[GROUP_ID]) {
        state.grupos[GROUP_ID] = {
          GROUP_ID,
          GROUP_NAME,
          checked: false,
          unitId,
          DISTANCIA_EM_KM: grupo.DISTANCIA_EM_KM,
          CD_ESTACAO: grupo.CD_ESTACAO,
          gData: [],
          type: 'Tinmet',
          color: colorList[++aux.colorIndex % colorList.length],
        };
      }
    }
  }

  function verifyGreenAntPowerProps(aux: ColorIndexAux) {
    if (includePower) {
      const GROUP_ID = 'greenant:meter';
      const GROUP_NAME = unitName || t('energiaConsumida');
      const linerColor = colorList[++aux.colorIndex % colorList.length];
      if (!state.grupos[GROUP_ID]) {
        state.grupos[GROUP_ID] = {
          GROUP_ID,
          GROUP_NAME,
          checked: false,
          unitId,
          gData: [],
          type: 'energy',
          color: linerColor,
        };
      }
    }
  }
  function verifyDMEPowerProps(aux: ColorIndexAux) {
    if (includeDme) {
      for (const grupo of includeDme ?? []) {
        const GROUP_ID = `dme:meter:${grupo.ENERGY_DEVICE_ID}`;
        const GROUP_NAME = grupo.ESTABLISHMENT_NAME || unitName || t('energiaConsumida');
        if (!state.grupos[GROUP_ID]) {
          state.grupos[GROUP_ID] = {
            GROUP_ID,
            GROUP_NAME,
            ENERGY_DEVICE_ID: grupo.ENERGY_DEVICE_ID,
            SERIAL: grupo.SERIAL,
            MANUFACTURER: grupo.MANUFACTURER,
            MODEL: grupo.MODEL,
            checked: false,
            unitId,
            gData: [],
            type: 'energy',
            color: colorList[++aux.colorIndex % colorList.length],
          };
        }
      }
    }
  }

  function verifyUtilityProps(aux: ColorIndexAux) {
    for (const util of utilitarios ?? []) {
      const GROUP_ID = `g-Util-${util.TYPE}:${util.ID}`;
      const GROUP_NAME = util.NAME;
      if (!state.grupos[GROUP_ID]) {
        state.grupos[GROUP_ID] = {
          GROUP_ID,
          GROUP_NAME,
          checked: false,
          devs: [util],
          gData: [],
          type: `utility-${util.TYPE}`,
          color: colorList[++aux.colorIndex % colorList.length],
        };
      }
    }
  }

  function verifyExternalProps() {
    const aux: ColorIndexAux = { colorIndex: -1 };
    verifyEnvProps(aux);
    verifyGroupsProps(aux);
    verifyWeatherStationsProps(aux);
    verifyGreenAntPowerProps(aux);
    verifyDMEPowerProps(aux);
    verifyUtilityProps(aux);
  }

  const calcNumDays = () => {
    const d1 = new Date(
      `${moment(state.startDate).format('YYYY-MM-DD')}T00:00:00Z`,
    ).getTime();
    const d2 = new Date(
      `${moment(state.endDate).format('YYYY-MM-DD')}T00:00:00Z`,
    ).getTime();

    const numDays = Math.round((d2 - d1) / 1000 / 60 / 60 / 24) + 1;

    if (numDays < 1 || numDays > 15) { return toast.error(t('periodo1a15')); }

    state.numDays = numDays;
  };

  async function dateChanged() {
    try {
      Object.values(state.grupos).forEach((grupo) => {
        grupo.gData = [];
      });
      const dayYMD = state.date && state.date.format().substring(0, 10);
      const { useMinGraphData, useMaxGraphData } = getTemperatureLimitLines(dayYMD) || {};
      state.useMinGraphData = useMinGraphData;
      state.useMaxGraphData = useMaxGraphData;
      render();
      await fetchMissingData();
    } catch (err) {
      console.log(err);
    }
    calculateGraphData();
    setState({ loadingData: false });
  }

  function getTambGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'Tamb' && grupo.devs?.length) {
      grupo.devs.forEach((dac) => {
        const params = {
          dacId: dac.DAC_ID!,
          selectedParams: ['Tamb'],
          dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
          numDays: verifyNumDaysAux(state.startDate, state.endDate),
        };
        const promise = apiCall('/dac/get-charts-data-common', params).then(
          async (websocketHistory) => {
            const {
              vars: { Tamb },
              commonX,
              limts,
            } = websocketHistory;

            state.commonX = commonX;

            gData.push({
              lineId: `${grupo.type}-${dac.DAC_ID}`,
              data: Tamb,
              isL1: false,
              showLine: true,
              axisId: 'temp',
              tempLimits: [
                limts.minTval,
                limts.maxTval,
              ] as GroupChartData['tempLimits'],
              type: grupo.type,
            });
          },
        );
        promises.push(promise);
      });
    }
  }

  function verifyNumDaysAux(startDate, endDate) {
    const today = moment().startOf('day');

    if (startDate && endDate && endDate.isAfter(today)) {
      return today.diff(startDate, 'days') + 1;
    }

    return state.numDays;
  }

  function getLcmpGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'Lcmp' && grupo.devs?.length) {
      grupo.devs.forEach((dac) => {
        if (splitLcmp) {
          const params = {
            dacId: dac.DAC_ID!,
            selectedParams: ['Levp', 'Lcut'],
            dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
            numDays: verifyNumDaysAux(state.startDate, state.endDate),
          };
          const promise = apiCall('/dac/get-charts-data-common', params).then(
            async (websocketHistory) => {
              const {
                vars: { Levp, Lcut },
                commonX,
              } = websocketHistory;

              state.commonX = commonX;

              gData.push({
                lineId: `Levp-${grupo.type}-${dac.DAC_ID}`,
                data: Levp,
                isL1: true,
                type: grupo.type,
                showLine: true,
              });
              gData.push({
                lineId: `Lcut-${grupo.type}-${dac.DAC_ID}`,
                data: Lcut,
                isL1: true,
                type: grupo.type,
                showLine: true,
              });
            },
          );
          promises.push(promise);
        } else {
          const params = {
            dacId: dac.DAC_ID!,
            selectedParams: ['Lcmp'],
            dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
            numDays: verifyNumDaysAux(state.startDate, state.endDate),
          };
          const promise = apiCall('/dac/get-charts-data-common', params).then(
            async (websocketHistory) => {
              const {
                vars: { Lcmp },
                commonX,
              } = websocketHistory;

              state.commonX = commonX;

              gData.push({
                lineId: `${grupo.type}-${dac.DAC_ID}`,
                data: Lcmp,
                isL1: true,
                showLine: true,
                type: grupo.type,
                axisId: 'temp',
              });
            },
          );
          promises.push(promise);
        }
      });
    }
  }

  function getValveOnGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'ValveOn' && grupo.devs?.length) {
      grupo.devs.forEach((dri) => {
        const params = {
          driId: dri.DRI_ID!,
          selectedParams: ['ValveOn'],
          dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
          numDays: state.numDays,
        };
        const promise = apiCall('/dri/get-day-charts-data-common', params).then(
          async (websocketHistory) => {
            const {
              vars: { ValveOn },
              commonX,
            } = websocketHistory;

            state.commonX = commonX;

            gData.push({
              lineId: `${grupo.type}-${dri.DRI_ID}`,
              data: ValveOn,
              isL1: true,
              showLine: true,
              type: grupo.type,
            });
          },
        );
        promises.push(promise);
      });
    }
  }

  function getVavRoomTempGraphData(
    grupo: GroupInfo,
    dut: { DEV_ID?: string },
    promises: Promise<void>[],
    gData: GroupChartData[],
  ) {
    const params = {
      driId: dut.DEV_ID!,
      selectedParams: ['TempAmb'],
      dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
      numDays: state.numDays,
    };
    const promise = apiCall('/dri/get-day-charts-data-common', params)
      .then(async (websocketHistory) => {
        const {
          vars: { TempAmb: Temperature },
          commonX,
          limits: { minTval, maxTval },
        } = websocketHistory;

        state.commonX = commonX;
        const tempLimits = [minTval, maxTval] as [number, number];

        gData.push({
          lineId: dut.DEV_ID ?? '',
          data: Temperature,
          isL1: false,
          tempLimits,
          axisId: 'temp',
          type: grupo.type,
          showLine: true,
        });
      });
    promises.push(promise);
  }

  function identifyDutDuoInsuf(grupo: GroupInfo, params: { selectedParams: string[] }, placement?: string) {
    let isDutDuoInsuf = false;
    if (placement === 'DUO' && grupo.GROUP_ID.endsWith('-INS')) {
      params.selectedParams = ['Temperature_1'];
      isDutDuoInsuf = true;
    }
    return isDutDuoInsuf;
  }

  function getDutGraphData(
    grupo: GroupInfo,
    dut: { DEV_ID?: string, PLACEMENT?: string, VARS?: string },
    promises: Promise<void>[],
    gData: GroupChartData[],
  ) {
    const params = {
      devId: dut.DEV_ID!,
      selectedParams: ['Temperature', 'eCO2', 'Humidity'],
      day: moment(state.startDate).format('YYYY-MM-DD'),
      numDays: state.numDays,
    };

    const isDutDuoInsuf = identifyDutDuoInsuf(grupo, params, dut?.PLACEMENT);

    const promise = apiCall(
      '/dut/get-day-charts-data-commonX',
      params,
    ).then(async (websocketHistory) => {
      const {
        Temperature, Temperature_1, eCO2, axisInfo, commonX, Humidity,
      } = websocketHistory;

      state.commonX = commonX;

      if (dut.VARS == null || dut.VARS.includes('T')) {
        // assumindo que DUTs sem VARS são mais antigos e têm ao menos a temperatura
        const isDutDuo = ((dut.DEV_ID && isDutDuoInsuf) ? dut.DEV_ID.concat('-INS') : dut.DEV_ID);
        gData.push({
          lineId: isDutDuo ?? '',
          data: isDutDuoInsuf ? Temperature_1 : Temperature,
          isL1: false,
          tempLimits: axisInfo.tempLimits,
          axisId: 'temp',
          type: grupo.type,
          showLine: true,
        });
      }
      if (dut.VARS?.includes('D')) {
        gData.push({
          lineId: dut.DEV_ID ?? '',
          data: eCO2,
          isL1: false,
          co2Limits: axisInfo.co2Limits,
          axisId: 'co2',
          type: 'co2',
          showLine: true,
        });
      }

      if (dut.VARS?.includes('D')) {
        gData.push({
          lineId: dut.DEV_ID ?? '',
          data: Humidity,
          isL1: false,
          humLimits: axisInfo.humLimits,
          axisId: 'hum',
          type: 'hum',
          showLine: true,
        });
      }
    });
    promises.push(promise);
  }

  function getRoomTempGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'room-temp' && grupo.devs?.length) {
      grupo.devs.forEach((dut) => {
        if (dut.isVav) {
          getVavRoomTempGraphData(grupo, dut, promises, gData);
        } else {
          getDutGraphData(grupo, dut, promises, gData);
        }
      });
    }
  }

  function calculateEnergyLimits(eConsumption: { y: number[] }, commonX: number[], isDme: boolean) {
    let maxValue = 1;
    let minValue = 0;
    for (let i = 0; i < commonX.length; i++) {
      if (eConsumption.y[i] != null) {
        if (!isDme) eConsumption.y[i] = Math.round(eConsumption.y[i] / 100) / 10;

        if (eConsumption.y[i] > maxValue) {
          maxValue = eConsumption.y[i];
        }
        if (eConsumption.y[i] < minValue) {
          minValue = eConsumption.y[i];
        }
      }
    }

    return [minValue, maxValue];
  }

  function handleEnergyGraphDME(energyGraph) {
    let powerLast = 0 as number | undefined;
    let powerFirst = 0 as number | undefined;

    const energyGraphDME = energyGraph.map((power) => {
      if (powerFirst === 0 && power !== -1) powerFirst = power;
      if (power === null) { return 0; }
      if (power !== -1) { powerLast = power; return power; }
      if (powerFirst === 0) return -1;
      return powerLast;
    });

    const energyGraphAux = energyGraphDME.map((power) => {
      if (power === -1) return powerFirst;
      return power;
    });

    return energyGraphAux;
  }

  function getGreenAntGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.GROUP_ID === 'greenant:meter' && grupo.type === 'energy' && grupo.unitId) {
      const params = {
        UNIT_ID: grupo.unitId,
        day: moment(state.startDate).format('YYYY-MM-DD'),
        numDays: state.numDays,
      };
      const promise = apiCall(
        '/get-unit-energy-consumption-commonX',
        params,
      ).then(async (energyConsumption) => {
        const { commonX, energyConsumption: eConsumption } = energyConsumption;

        state.commonX = commonX;

        const limits = calculateEnergyLimits(eConsumption, commonX, false);
        gData.push({
          lineId: grupo.GROUP_ID,
          data: eConsumption,
          isL1: false,
          powerLimits: limits as GroupChartData['powerLimits'],
          axisId: 'power',
          type: grupo.type,
          showLine: true,
        });
      });
      promises.push(promise);
    }
  }

  function getDMEGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.GROUP_ID.startsWith('dme:meter') && grupo.type === 'energy' && grupo.unitId) {
      const params = {
        energy_device_id: grupo.ENERGY_DEVICE_ID,
        serial: grupo.SERIAL,
        manufacturer: grupo.MANUFACTURER,
        model: grupo.MODEL,
        start_time: `${moment(state.startDate).format('YYYY-MM-DD')}T00:00:00`,
        end_time: `${moment(state.endDate).format('YYYY-MM-DD')}T23:59:59`,
      };
      const promise = apiCall(
        '/energy/get-hist',
        params,
      ).then(async (energyConsumption) => {
        const energyPower = energyConsumption.data.map((telemetry) => ({
          power: telemetry.pot_ap_tri,
          timestamp: telemetry.timestamp,
        }));

        const commonX = handleCommonX();
        state.commonX = commonX;
        const energyGraph = new Array(state.commonX.length).fill(-1);
        for (const energy of energyPower) {
          const momentCurrent = moment(energy.timestamp);
          const timestampObj = new Date(energy.timestamp);
          state.startDate?.startOf('day');
          const diffInDays = momentCurrent.diff(state.startDate, 'days');
          const timestampFr = (diffInDays * 86400 + timestampObj.getHours() * 3600 + timestampObj.getMinutes() * 60 + timestampObj.getSeconds()) / 3600;

          const pos = state.commonX.findIndex((elemento) => elemento > timestampFr) - 1;
          const powerCurrent = energy?.power?.toFixed(1);
          if (powerCurrent !== undefined) energyGraph[pos] = parseFloat(powerCurrent);
        }

        const energyGraphDME = handleEnergyGraphDME(energyGraph);
        const eConsumption = { y: energyGraphDME };
        const limits = calculateEnergyLimits(eConsumption, commonX, true);
        gData.push({
          lineId: grupo.GROUP_ID,
          data: eConsumption,
          isL1: false,
          powerLimits: limits as GroupChartData['powerLimits'],
          axisId: 'power',
          type: grupo.type,
          showLine: true,
        });
      });

      promises.push(promise);
    }
  }

  function getTinmetGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'Tinmet' && grupo.unitId && grupo.CD_ESTACAO) {
      let promise = Promise.resolve();
      promise = promise.then(async () => {
        const params = {
          unitId: grupo.unitId!,
          dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
          stations: [grupo.GROUP_NAME],
          numDays: state.numDays,
        };
        const { commonX, stationsTemps } = await apiCall(
          '/get-weather-data-near-unit-commonX-v2',
          params,
        );

        state.commonX = commonX;

        const temperatures = stationsTemps[grupo.GROUP_NAME].temperatures;
        const tempLimits = stationsTemps[grupo.GROUP_NAME].tempLimits;

        state.weatherStationsData[grupo.GROUP_NAME] = {
          date: params.dayYMD,
          temperatures,
          tempLimits,
          distance: grupo.DISTANCIA_EM_KM,
        };
      });

      promise = promise.then(async () => {
        gData.push({
          lineId: grupo.GROUP_ID,
          data: state.weatherStationsData[grupo.GROUP_NAME].temperatures,
          isL1: false,
          tempLimits: state.weatherStationsData[grupo.GROUP_NAME].tempLimits as [number, number],
          type: grupo.type,
          axisId: 'temp',
          showLine: true,
          distance: state.weatherStationsData[grupo.GROUP_NAME].distance,
        });
      });
      promises.push(promise);
    }
  }

  function getDMTGraphData(DMT_CODE: string, type: string, grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    const params = {
      dmtCode: DMT_CODE,
      dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
      numDays: state.numDays,
    };
    const promise = apiCall('/dmt/get-nobreaks-charts-data', params).then(
      async (websocketHistory) => {
        const { vars, commonX } = websocketHistory;

        state.commonX = commonX;
        const utilId = grupo.GROUP_ID.split(':')[1];
        const utilVar = vars[utilId];

        gData.push({
          lineId: `${type}-${grupo.GROUP_ID}-${DMT_CODE}`,
          data: { L: utilVar?.y || [], y: utilVar?.y || [] },
          axisId: 'temp',
          isL1: true,
          type,
          showLine: true,
        });
      },
    );

    promises.push(promise);
  }

  function getNobreakData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'utility-nobreak' && grupo.devs?.length) {
      grupo.devs.forEach((dev) => {
        if (dev.DMT_CODE) {
          getDMTGraphData(dev.DMT_CODE, 'nobreak', grupo, promises, gData);
        }
      });
    }
  }

  function getIlluminationData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    if (grupo.type === 'utility-illumination' && grupo.devs?.length) {
      grupo.devs.forEach((dev) => {
        if (dev.DAL_CODE) {
          const params = {
            dalCode: dev.DAL_CODE,
            dayYMD: moment(state.startDate).format('YYYY-MM-DD'),
            numDays: state.numDays,
          };
          const promise = apiCall('/dal/get-illuminations-charts-data', params).then(
            async (websocketHistory) => {
              const { vars: { Feedback }, commonX } = websocketHistory;

              state.commonX = commonX;
              const utilId = grupo.GROUP_ID.split(':')[1];
              const utilFeedbackPort = utilitarios?.find((util) => util.ID.toString() === utilId)?.FEEDBACK;
              const data = utilFeedbackPort && Feedback[utilFeedbackPort - 1];

              gData.push({
                lineId: `illumination-${grupo.GROUP_ID}-${dev.DMT_CODE}`,
                data: { L: data || [], y: data || [] },
                isL1: true,
                axisId: 'temp',
                type: 'illumination',
                showLine: true,
              });
            },
          );

          promises.push(promise);
        }

        if (dev.DMT_CODE) {
          getDMTGraphData(dev.DMT_CODE, 'illumination', grupo, promises, gData);
        }
      });
    }
  }

  function getUtilityGraphData(grupo: GroupInfo, promises: Promise<void>[], gData: GroupChartData[]) {
    getNobreakData(grupo, promises, gData);
    getIlluminationData(grupo, promises, gData);
  }

  async function fetchGraphData(grupo: GroupInfo) {
    const gData: GroupChartData[] = [];
    const promises: Promise<void>[] = [];
    getTambGraphData(grupo, promises, gData);
    getLcmpGraphData(grupo, promises, gData);
    getValveOnGraphData(grupo, promises, gData);
    getRoomTempGraphData(grupo, promises, gData);
    getGreenAntGraphData(grupo, promises, gData);
    getDMEGraphData(grupo, promises, gData);
    getTinmetGraphData(grupo, promises, gData);
    getUtilityGraphData(grupo, promises, gData);
    await Promise.all(promises);
    return gData;
  }

  async function fetchMissingData() {
    if (!state.startDate) return;

    try {
      const promises = Object.values(state.grupos).map(async (grupo) => {
        if (grupo.checked && !grupo.gData.length) {
          setState({ loadingData: true });
          return fetchGraphData(grupo).then((gData) => {
            for (const line of gData) {
              line.color = grupo.color || '#3a393e';
            }
            grupo.gData = gData;
          });
        }
      });
      await Promise.all(promises);
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  type BooleanLinesData = { L?: number | null; y?: number | null, }[][]

  function getBoolTicksNames(
    booleanLines: BooleanLinesData,
    ticksValues: [number[]],
    booleanTypes: string[],
  ) {
    const boolTicksNames = {};
    for (let i = 0; i < booleanLines.length; i++) {
      const [tick_0, tick_1, tick_2] = ticksValues[i];
      const isVav = booleanTypes[i] === 'VAV';
      const isNobreak = booleanTypes[i] === 'Nobreak';
      if (isNobreak) {
        boolTicksNames[String(tick_0)] = t('desligadoAbreviado');
        boolTicksNames[String(tick_1)] = t('bateriaAbreviado');
        boolTicksNames[String(tick_2)] = t('redeEletricaAbreviado');
      }
      else if (isVav) {
        boolTicksNames[String(tick_0)] = t('fechadoAbreviado');
        boolTicksNames[String(tick_1)] = t('abertoAbreviado');
      } else if (splitLcmp) {
        boolTicksNames[String(tick_0)] = i % 2 ? t('bloqueadoAbreviado') : t('desligadoAbreviado');
        boolTicksNames[String(tick_1)] = i % 2 ? t('liberadoAbreviado') : t('ligadoAbreviado');
      } else {
        boolTicksNames[String(tick_0)] = t('desligadoAbreviado');
        boolTicksNames[String(tick_1)] = t('ligadoAbreviado');
      }
    }

    return boolTicksNames;
  }

  function updateTempLimits(line: GroupChartData, tempLimits: { maxTval?: number, minTval?: number }) {
    if (line.tempLimits) {
      if (tempLimits.maxTval == null || line.tempLimits[1] > tempLimits.maxTval) { tempLimits.maxTval = line.tempLimits[1]; }
      if (tempLimits.minTval == null || line.tempLimits[0] < tempLimits.minTval) { tempLimits.minTval = line.tempLimits[0]; }
    }
  }
  function updatePowerLimits(line: GroupChartData, powerLimits: { maxPval?: number, minPval?: number }) {
    if (line.powerLimits) {
      if (powerLimits.maxPval == null || line.powerLimits[1] > powerLimits.maxPval) { powerLimits.maxPval = line.powerLimits[1]; }
      if (powerLimits.minPval == null || line.powerLimits[0] < powerLimits.minPval) { powerLimits.minPval = line.powerLimits[0]; }
    }
  }

  function updateCO2Limits(line: GroupChartData, co2Limits: { maxCO2val?: number, minCO2val?: number }) {
    if (line.co2Limits) {
      if (co2Limits.maxCO2val == null || line.co2Limits[1] > co2Limits.maxCO2val) { co2Limits.maxCO2val = line.co2Limits[1]; }
      if (co2Limits.minCO2val == null || line.co2Limits[0] < co2Limits.minCO2val) { co2Limits.minCO2val = line.co2Limits[0]; }
    }
  }

  function handleBooleanData(line: GroupChartData, booleanLines: BooleanLinesData, booleanTypes: string[]) {
    const lData: { L: (number|null) }[] = [];
    if (line.data.L) {
      line.data.L.forEach((L) => lData.push({ L }));
    } else {
      line.data.y.forEach((y) => lData.push({ L: y }));
    }
    booleanLines.push(lData);
    const isVav = line.type === 'ValveOn';
    const isNobreak = line.type === 'nobreak';
    if (isVav) {
      booleanTypes.push('VAV');
    } else if (isNobreak) {
      booleanTypes.push('Nobreak');
    } else {
      booleanTypes.push('L1');
    }
  }

  function getVarsData() {
    const selectedVars: GroupChartData[] = [];
    const booleanLines: BooleanLinesData = [];
    const booleanTypes: string[] = [];
    const tempLimits = {} as { maxTval?: number, minTval?: number };
    const powerLimits = {} as { maxPval?: number, minPval?: number };
    const co2Limits = {} as { maxCO2val?: number, minCO2val?: number };
    for (const grupo of Object.values(state.grupos)) {
      if (!grupo.checked) continue;

      for (const line of grupo.gData) {
        const existingLine = state.selectedVars.find((item) => item.lineId === line.lineId && item.axisId === line.axisId);

        if (existingLine) {
          selectedVars.push({ ...line, name: grupo.GROUP_NAME, showLine: existingLine.showLine });
        } else {
          selectedVars.push({ ...line, name: grupo.GROUP_NAME });
        }

        if (line.isL1) {
          handleBooleanData(line, booleanLines, booleanTypes);
          continue;
        }

        updateTempLimits(line, tempLimits);
        updatePowerLimits(line, powerLimits);
        updateCO2Limits(line, co2Limits);
      }
    }
    return {
      selectedVars, booleanLines, booleanTypes, ...tempLimits, ...powerLimits, ...co2Limits,
    };
  }

  function calculateGraphData() {
    const {
      selectedVars,
      booleanLines,
      booleanTypes,
      maxTval,
      minTval,
      maxPval,
      minPval,
      maxCO2val,
      minCO2val,
    } = getVarsData();
    state.selectedVars = selectedVars;
    const dataLimits = {
      maxTval,
      minTval,
      maxPval,
      minPval,
      maxCO2val,
      minCO2val,
    };
    const axisInfo = axisCalc.calculateAxisInfo(
      dataLimits,
      booleanLines.length,
      booleanTypes,
    );

    state.axisInfo = {
      ...state.axisInfo,
      ...axisInfo,
      powerLimits: axisInfo.presLimits,
      powerTicks: axisInfo.presTicks,
      presLimits: null,
      presTicks: null,
    };
    const ticksValues = axisCalc.updateBoolY(
      booleanLines,
      state.axisInfo.L1start as number,
      booleanTypes,
    );

    let indexBool = 0;
    for (const selectedVar of state.selectedVars) {
      if (booleanLines[indexBool] && selectedVar.isL1) {
        const yData: (number|null)[] = [];

        booleanLines[indexBool].forEach((data) => {
          yData.push(data.y!);
        });
        selectedVar.data.y = yData;
        indexBool++;
      }
    }

    state.boolTicksNames = getBoolTicksNames(booleanLines, ticksValues, booleanTypes);
  }

  async function requireMultiDaysCsv(params) {
    const days = [] as string[];
    for (let i = 0; i < state.numDays; i++) {
      const dayAux = addDays_YMD(
        moment(state.startDate).format('YYYY-MM-DD'),
        i,
      );
      days.push(dayAux);
    }

    return Promise.all(
      days.map(async (day) => {
        const paramsAux = { ...params, day };

        return apiCallDownload('/analise-integrada-export', paramsAux);
      }),
    );
  }

  async function requireCsvExport() {
    if (!state.startDate || !state.selectedVars.length) return;
    if (state.numDays < 1 || state.numDays > 15) {
      toast.error(t('periodo1a15'));
      return;
    }

    try {
      const params = prepareExportParams(state.startDate);
      setState({ exportLoading: true });

      populateParamsWithGroups(params);

      const responses = await requireMultiDaysCsv(params);
      handleCsvDownload(responses);

      toast.success(t('sucessoGerar'));
    } catch (err) {
      console.error(err);
      toast.error(t('houveErro'));
    }

    setState({ exportLoading: false });
  }

  function prepareExportParams(startDate: any) {
    const selectedDate = startDate.format().substring(0, 10);
    return {
      day: selectedDate,
      dacsTamb: [] as string[],
      dacsL1: [] as string[],
      dutsTemp: [] as string[],
      unitsPower: [] as number[],
      tempInmet: [] as { GROUP_ID: string; GROUP_NAME: string }[],
    };
  }

  function populateParamsWithGroups(params: any) {
    for (const grupo of Object.values(state.grupos)) {
      if (grupo.checked && grupo.gData && grupo.gData.length) {
        switch (grupo.type) {
          case 'Tamb':
            addDeviceIds(grupo.devs, params.dacsTamb);
            break;
          case 'Lcmp':
            addDeviceIds(grupo.devs, params.dacsL1);
            break;
          case 'room-temp':
            addDeviceIds(grupo.devs, params.dutsTemp, 'DEV_ID');
            break;
          case 'energy':
            addUnitId(grupo.unitId, params.unitsPower);
            break;
          case 'Tinmet':
            addInmetData(grupo, params.tempInmet);
            break;
        }
      }
    }
  }

  function addDeviceIds(devices: GroupInfo['devs'] = [], targetArray: string[], idKey = 'DAC_ID') {
    if (devices && devices.length) {
      targetArray.push(...devices.map((device) => device[idKey]).filter(Boolean));
    }
  }

  function addUnitId(unitId: number | undefined, targetArray: number[]) {
    if (unitId) {
      targetArray.push(unitId);
    }
  }

  function addInmetData(grupo: any, tempInmet: { GROUP_ID: string; GROUP_NAME: string }[]) {
    if (grupo.CD_ESTACAO && grupo.GROUP_NAME) {
      tempInmet.push({ GROUP_ID: grupo.CD_ESTACAO, GROUP_NAME: grupo.GROUP_NAME });
    }
  }

  function handleCsvDownload(responses: any[]) {
    const responsesData = responses.map((response) => response.data);
    const link = document.getElementById('downloadLink') as any;

    if (link.href !== '#') {
      window.URL.revokeObjectURL(link.href);
    }

    link.href = window.URL.createObjectURL(
      new Blob([...responsesData], { type: 'text/csv' }),
    );
    link.download = `Análise ${moment(state.startDate).format('DD-MM-YYYY')} - ${moment(state.endDate).format('DD-MM-YYYY')}`;
    link.click();
  }

  function getFilterOptions(filterOptions: GroupInfo[]) {
    return filterOptions.map((group) => ({
      name: group.GROUP_NAME,
      value: group.GROUP_ID,
      color: group.color,
      icon: (
        <Flex alignItems="center">
          <Checkbox
            checked={group.checked}
            value={group.checked}
            color="primary"
          />
        </Flex>
      ),
      distance: group.DISTANCIA_EM_KM,
    }));
  }

  function buildItemsList() {
    Object.values(state.grupos).forEach((grupo) => {
      if (grupo.type === 'room-temp') {
        state.trooms.push(grupo);
      }
      if (grupo.type === 'Lcmp' || grupo.type === 'ValveOn') {
        state.l1s.push(grupo);
      }
      if (grupo.type === 'Tamb') {
        state.tambs.push(grupo);
      }
      if (grupo.type === 'energy') {
        state.powers.push(grupo);
      }
      if (grupo.type === 'Tinmet') {
        state.tInmet.push(grupo);
      }
      if (grupo.type.startsWith('utility')) {
        state.utilities.push(grupo);
      }
    });
  }

  function itemsWithoutFilter() {
    if (state.search.length === 0) {
      state.trooms = [];
      state.l1s = [];
      state.tambs = [];
      state.powers = [];
      state.tInmet = [];
      state.utilities = [];

      buildItemsList();

      state.troomsFiltered = getFilterOptions(state.trooms);
      state.l1sFiltered = getFilterOptions(state.l1s);
      state.tambsFiltered = getFilterOptions(state.tambs);
      state.powersFiltered = getFilterOptions(state.powers);
      state.tInmetFiltered = getFilterOptions(state.tInmet);
      state.utilitiesFiltered = getFilterOptions(state.utilities);
    }
  }
  itemsWithoutFilter();

  function zoom() {
    let { refAreaLeft, refAreaRight } = state;

    if (
      refAreaLeft === refAreaRight
      || refAreaRight == null
      || refAreaLeft == null
    ) {
      setState({
        refAreaLeft: null,
        refAreaRight: null,
      });
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) { [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft]; }

    setState({
      refAreaLeft: null,
      refAreaRight: null,
      xDomain: [refAreaLeft, refAreaRight],
      xTicks: [],
    });
  }

  function zoomOut() {
    setState({
      refAreaLeft: null,
      refAreaRight: null,
      xDomain: null,
      xTicks: Array.from({ length: 13 }, (_, i) => i * 2 * state.numDays),
    });
  }

  function tickXLabelFormaterDay(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(
      `${moment(state.startDate)
        .add(numDays + 1, 'days')
        .format('YYYY-MM-DD')}T00:00:00Z`,
    );
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');

    return `${dd}/${mm}`;
  }

  function tooltipXLabelFormater(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(
      `${moment(state.startDate)
        .add(numDays + 1, 'days')
        .format('YYYY-MM-DD')}T00:00:00Z`,
    );
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dateFinal = `${dd}/${mm}`;

    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const min = Math.floor((Math.abs(hour) * 60) % 60);
    const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);

    return (
      <p>
        <b>{dateFinal}</b>
        {' '}
        -
        {' '}
        <span style={{ fontWeight: 'normal' }}>
          {`${String(hh).padStart(2, '0')}:${String(min).padStart(
            2,
            '0',
          )}:${String(ss).padStart(2, '0')}`}
        </span>
      </p>
    );
  }

  function formatLabel(value: number, label: string, isBool: boolean, isVav: boolean, isNobreak: boolean) {
    let formattedLabel = label;
    if (isBool) {
      formattedLabel = value % 5 > -2.5 ? t('ligado') : t('desligado');
    }

    if (isVav) {
      formattedLabel = value % 5 > -2.5 ? t('abertoCap') : t('fechadoCap');
    }

    if (isNobreak) {
      if (value % 6 < -5) formattedLabel = t('desligado');
      else if (value % 6 > -2) formattedLabel = t('redeEletricaCap');
      else formattedLabel = t('bateriaCap');
    }

    return formattedLabel;
  }

  function toolTipFormater(
    value: number,
    _accessor: string | Function,
    payload: {
        value: number;
        payload: number;
        name: string;
        label: string;
    },
    _index: number,
  ) {
    if (state.selectedVars && state.axisInfo.L1start !== null) {
      const varInfo = findVarInfo(payload.name);
      const type = varInfo?.type ?? '';
      const isBool = isBooleanType(type);

      const unit = determineUnit(varInfo?.axisId);
      const isVav = type === 'ValveOn';
      const isNobreak = type === 'nobreak';

      let label = formatNumberWithFractionDigits(value.toString());
      label = formatLabel(payload.value, label, isBool, isVav, isNobreak);
      const unitMeasure = getUnitMeasure(label, unit, isBool, varInfo);

      const formattedValue = formatValue(label, unitMeasure, isBool);
      const formattedName = formatName(payload);

      return [formattedValue, formattedName];
    }

    return '';
  }

  function findVarInfo(name: string) {
    return state.selectedVars.find(
      (data) => `${data.name}|${data.lineId}|${data.axisId}` === name,
    );
  }

  function isBooleanType(type: string) {
    return ['Levp', 'Lcut', 'Lcmp', 'illumination'].includes(type);
  }

  function determineUnit(axisId: string | undefined) {
    switch (axisId) {
      case 'temp': return ' °C ';
      case 'hum': return ' % ';
      case 'power': return ' Kw ';
      case 'co2': return ' ppm ';
      default: return '';
    }
  }

  function getUnitMeasure(label: string, unit: string, isBool: boolean, varInfo: any) {
    if (label.toLocaleLowerCase().includes('km')) return '';
    if ([t('desligado'), t('bateriaCap'), t('redeEletricaCap'), t('ligado'), t('abertoCap'), t('fechadoCap'), t('liberado'), t('bloqueado')].includes(label)) {
      return '';
    }
    return varInfo && varInfo.axisId !== 'power' ? unit : 'kW';
  }

  function formatValue(label: string, unitMeasure: string, isBool: boolean) {
    return (
      <span style={{ color: '#000', fontWeight: 'normal' }}>
        {`${label}${!isBool ? unitMeasure : ''}`}
      </span>
    );
  }

  function formatName(payload: { name: string; label: string }) {
    const name = payload.name.split('|')[0];
    return payload.label || (name.length > 35 ? `${name.substring(0, 35)}...` : name);
  }

  const CustomTooltipContent = (customTooltipProps) => {
    if (unitCoordinate?.lat && unitCoordinate?.lon && customTooltipProps.payload && customTooltipProps.payload.length !== 0) {
      const newPayload = [
        ...customTooltipProps.payload,
      ];

      customTooltipProps.payload.forEach((e) => {
        const varInfo = state.selectedVars.find(
          (data) => `${data.name}|${data.lineId}|${data.axisId}` === e.name,
        );
        if (varInfo && varInfo.type === 'Tinmet') {
          const indexToInsert = newPayload.findIndex((o) => o.name === e.name) + 1;

          newPayload.splice(indexToInsert, 0, {
            name: e.name,
            label: t('distanciaUnidadeEstacao'),
            value: varInfo?.distance || t('indisponivel'),
          });
        }
      });

      return <DefaultTooltipContent {...customTooltipProps} payload={newPayload} />;
    }

    return <DefaultTooltipContent {...customTooltipProps} />;
  };

  function handleClick(group: GroupInfo) {
    if (!group) return;
    group.displayColorPicker = !group.displayColorPicker;
    render();
  }

  function handleClose(group: GroupInfo) {
    if (!group) return;
    group.displayColorPicker = false;
    render();
  }

  function changeGroupsColor(groupId: string, color: string) {
    const group = state.selectedVars.filter((g) => g.lineId === groupId);
    if (group) {
      for (const item of group) {
        item.color = color;
      }
    }
  }

  function handleChange(color: { hex: string }, group: GroupInfo) {
    if (!group) return;
    group.color = color.hex;
    for (const line of group.gData) {
      line.color = color.hex;
      changeGroupsColor(line.lineId, color.hex);
    }

    render();
  }

  function isXDomainValid() {
    if (state.xDomain) {
      const isValidArrOfNumbers = state.xDomain.every((n) => typeof n === 'number' && n.toString() !== 'NaN');
      const isNotDefault = state.xDomain.toString() !== [0, 24 * state.numDays].toString();

      return isValidArrOfNumbers && isNotDefault;
    }

    return false;
  }

  function handleModalClose() {
    state.isModalOpen = false;
    render();
  }

  function renderModalGroups(groupData: GroupInfo[], groupName: string) {
    const selectedGroup = (
      groupData.map((group) => (
        group.checked && (
          <Flex alignItems="center" style={{ marginBottom: '8px' }} key={group.GROUP_ID}>
            <OptionColor
              color={group.color}
              onClick={() => handleClick(group)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ paddingLeft: '10px' }}>{group.GROUP_NAME}</span>
            {group.displayColorPicker ? (
              <div
                style={{
                  position: 'absolute',
                  zIndex: 2,
                  top: '42%',
                  right: '35%',
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
                  onClick={() => handleClose(group)}
                />
                <SketchPicker
                  color={group.color}
                  onChange={(color) => handleChange(color, group)}
                />
              </div>
            ) : null}
          </Flex>
        )
      ))
    );

    return (
      <>
        {groupData.some((group) => group.checked) && (
          <Box style={{ margin: '10px 0' }}>
            <span style={{ fontSize: '20px' }}><b>{groupName}</b></span>
          </Box>
        )}
        {selectedGroup}
      </>
    );
  }

  const handleFilter = async () => {
    state.numDays = 0;
    if (!(state.startDate && state.endDate)) return;

    calcNumDays();

    if (state.numDays < 1 || state.numDays > 15) return;
    state.xDomain = [0, 24 * state.numDays];
    state.xTicks = Array.from({ length: 13 }, (_, i) => i * 2 * state.numDays);
    await dateChanged();
  };

  function handleChangePeriod() {
    setState({
      startDate: null,
      endDate: null,
      date: null,
      numDays: 0,
      selectedVars: [],
    });

    render();
  }

  return (
    <div id="pageBody" style={{ width: '100%', position: 'relative' }}>
      <ModalLoading display={state.loadingData || state.exportLoading}>
        <Loader />
        <div>
          <Trans
            i18nKey="mensageLoader"
          >
            <h4> Aguarde, os dados estão </h4>
            <h4> sendo carregados. </h4>
          </Trans>
        </div>
      </ModalLoading>
      {state.isModalOpen && (
      <ModalColorsWindow handleModalClose={handleModalClose} renderModalGroups={renderModalGroups} state={state} />
      )}
      <div style={{
        margin: '-20px -20px 0 -20px',
      }}
      >
        <UtilFilter
          state={state}
          render={render}
          onAply={handleFilter}
          setState={setState}
          listFilters={listFilters}
          margin
          filterFooter
          isLoading={state.loadingData}
          removeYearFilter
          fixedPeriod
          l1Only={L1only}
          unitCoordinate={unitCoordinate}
          exportFunc={requireCsvExport}
          handleChangePeriod={handleChangePeriod}
          removeMonthFilter
          includeQuickSelection
          closeFilter
        />
      </div>

      <div style={{ paddingLeft: '10px' }}>
        {(state.startDate && state.endDate && state.selectedVars?.length > 0) && (
          <Card>
            <Box>
              <Flex justifyContent="end" alignItems="center">
                <ColorChangeBtnWithHover variant="secondary" onClick={() => { state.isModalOpen = true; render(); }}>
                  <Flex justifyContent="center" alignItems="center">
                    <ColorChangeBtnSvg />
                    <Text style={{ paddingLeft: '6px' }}>{t('alterarCores')}</Text>
                  </Flex>
                </ColorChangeBtnWithHover>
                {state.xDomain
                      && isXDomainValid() && (
                        <BtnExport variant="secondary" onClick={zoomOut}>
                          <Flex justifyContent="center" alignItems="center">
                            <ZoomOut />
                            <Text style={{ paddingLeft: '6px' }}>Zoom Out</Text>
                          </Flex>
                        </BtnExport>
                )}
                {state.startDate && (
                <span style={{ marginLeft: '20px' }}>
                  {moment(state.endDate).isAfter(state.startDate)
                    ? `${moment(state.startDate).format('DD/MM/YYYY')} - ${moment(state.endDate).format('DD/MM/YYYY')}`
                    : moment(state.startDate).format('DD/MM/YYYY')}
                </span>
                )}
              </Flex>
            </Box>
            <div
              style={{
                width: '100%',
                height: `${height || 600}px`,
                userSelect: 'none',
                margin: '25px 0',
              }}
            >
              <ResponsiveContainer>
                <LineChart
                  height={500}
                  margin={{
                    top: 40,
                    right: 35,
                    left: 20,
                    bottom: 5,
                  }}
                  data={state.commonX.map((_data, index) => ({ index }))}
                  onMouseDown={(e) => {
                    setState({ refAreaLeft: e?.activeLabel });
                  }}
                  onMouseMove={(e) => {
                    state.refAreaLeft != null
                          && setState({ refAreaRight: e.activeLabel });
                  }}
                  onMouseUp={zoom}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    allowDataOverflow
                    type="number"
                    name="time"
                    tickFormatter={
                          state.numDays && state.numDays > 1
                            ? tickXLabelFormaterDay
                            : tickXLabelFormaterHour
                        }
                    dataKey={({ index }) => state.commonX[index]}
                    ticks={state.xTicks}
                    allowDecimals={false}
                    domain={state.xDomain}
                  />
                  {state.numDays && state.numDays > 1 ? (
                    <XAxis
                      allowDataOverflow
                      xAxisId="1"
                      tickLine={false}
                      axisLine={false}
                      allowDuplicatedCategory={false}
                      tick={renderQuarterTickHour}
                      type="number"
                      dataKey={({ index }) => state.commonX[index]}
                      ticks={state.xTicks}
                      domain={state.xDomain}
                    />
                  ) : null}
                  <YAxis
                    type="number"
                    name="temp"
                    yAxisId="temp"
                    allowDataOverflow
                    dataKey="y"
                    tick={<CustomYTick namedTicks={state.boolTicksNames} unitProps="temp" />}
                    ticks={state.axisInfo.tempTicks}
                    interval={0}
                    domain={state.axisInfo.tempLimits}
                  >
                    <div style={{ width: '50px', backgroundColor: 'blue', height: '100px' }} />

                    <Label
                      value={(state.selectedVars.every((gData) => gData.isL1)) ? '' : t('temperaturaC')}
                      offset={20}
                      dx={40}
                      angle="0"
                      position="top"
                      style={{
                        color: '#464555', fontSize: '13px', textAnchor: 'middle', fontWeight: 'bold',
                      }}
                    />
                  </YAxis>
                  <YAxis
                    type="number"
                    yAxisId="hum"
                    allowDataOverflow
                    tick={<CustomYTick namedTicks={state.boolTicksNames} unitProps="hum" />}
                    dataKey="y"
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    interval={0}
                    domain={[0, 100]}
                  >
                    <Label
                      value={(state.selectedVars.every((gData) => gData.isL1)) ? '' : 'Umidade (%)'}
                      offset={20}
                      angle="0"
                      dx={-10}
                      position="top"
                      style={{
                        color: '#464555', fontSize: '13px', textAnchor: 'middle', fontWeight: 'bold',
                      }}
                    />
                  </YAxis>
                  {state.selectedVars.some((gData) => !!gData.co2Limits) && (
                  <YAxis
                    type="number"
                    name="co2"
                    yAxisId="co2"
                    tick={<CustomYTick namedTicks={state.boolTicksNames} unitProps="co2" />}
                    tickMargin={49}
                    dataKey="y"
                    ticks={[0, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600]}
                    interval={0}
                    domain={[0, 3600]}
                    orientation="right"
                  >
                    <Label
                      value="CO₂ (ppm)"
                      offset={20}
                      dx={-50}
                      angle="0"
                      position="top"
                      style={{
                        color: '#464555', fontSize: '13px', textAnchor: 'middle', fontWeight: 'bold',
                      }}
                    />
                  </YAxis>
                  )}
                  {(state.selectedVars.some((item) => item.axisId === 'power')) && (
                  <YAxis
                    type="number"
                    name="power"
                    yAxisId="power"
                    dataKey="y"
                    tick={<CustomPowerTick />}
                    orientation="right"
                    ticks={state.axisInfo.powerTicks}
                    tickMargin={20}
                    interval={0}
                    domain={state.axisInfo.powerLimits}
                  >
                    <Label
                      value="Potência Ativa (kW)"
                      offset={20}
                      angle="0"
                      position="top"
                      style={{
                        color: '#464555', fontSize: '13px', textAnchor: 'middle', fontWeight: 'bold',
                      }}
                    />
                  </YAxis>
                  )}
                  <Tooltip
                    isAnimationActive={false}
                    contentStyle={{ fontWeight: 'bold' }}
                    cursor={{ stroke: 'red', strokeWidth: 1 }}
                    labelFormatter={tooltipXLabelFormater}
                    formatter={toolTipFormater}
                    content={<CustomTooltipContent />}
                  />
                  {state.selectedVars.length > 0
                        && state.selectedVars.map((gData) => (
                          gData.showLine && (
                            <Line
                              name={`${gData.name}|${gData.lineId}|${gData.axisId}`}
                              key={gData.lineId + gData.axisId}
                              yAxisId={gData.axisId}
                              stroke={gData.color}
                              dataKey={({ index }) => gData.data.y[index]}
                              dot={false}
                              animationDuration={300}
                              type="monotone"
                            />
                          )
                        ))}
                  {state.useMinGraphData && (
                  <Line
                    yAxisId="temp"
                    data={state.useMinGraphData}
                    fill={colors.Green}
                    isAnimationActive={false}
                    type="monotone"
                  />
                  )}
                  {state.useMaxGraphData && (
                  <Line
                    yAxisId="temp"
                    data={state.useMaxGraphData}
                    fill={colors.Green}
                    isAnimationActive={false}
                    type="monotone"
                  />
                  )}
                  {state.refAreaLeft && state.refAreaRight ? (
                    <ReferenceArea
                      yAxisId="temp"
                      x1={state.refAreaLeft}
                      x2={state.refAreaRight}
                      strokeOpacity={0.3}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {(!state.startDate || !state.endDate || !state.selectedVars.length) ? <NoGraph title={t('analiseIntegrada')} type="integratedAnalysis" /> : null}
      </div>
      <a href="#" style={{ display: 'none' }} id="downloadLink" />
    </div>
  );
};

export const ModalColorsWindow = ({ handleModalClose, renderModalGroups, state }: {
  handleModalClose: () => void,
  renderModalGroups: (state, name) => JSX.Element,
  state: any,
  }): JSX.Element => (
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
              onClick={handleModalClose}
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
          {renderModalGroups(state.trooms, t('ambientes'))}
          {renderModalGroups(state.l1s, t('maquinas'))}
          {renderModalGroups(state.tambs, t('temperaturaExterna'))}
          {renderModalGroups(state.tInmet, t('temExtEstMetereologicas'))}
          {renderModalGroups(state.powers, t('potenciaAtiva'))}
          {renderModalGroups(state.utilities, t('utilitarios'))}
        </Box>
      </ModalContent>
    </ModalWindow>
);

export const ColorsPalet = ({ state, render }: { state, render: () => void }): JSX.Element => (
  <ColorChangeBtnWithHover variant="secondary" onClick={() => { state.isModalOpen = true; render(); }}>
    <Flex justifyContent="center" alignItems="center">
      <ColorChangeBtnSvg />
      <Text style={{ paddingLeft: '6px' }}>{t('alterarCores')}</Text>
    </Flex>
  </ColorChangeBtnWithHover>
);
