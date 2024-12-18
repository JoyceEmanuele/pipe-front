import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';

import moment from 'moment';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import { CSVLink } from 'react-csv';
import i18n from '~/i18n';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Label, LineChart, Tooltip, Line, ReferenceArea,
} from 'recharts';
import {
  Loader,
  Card,
  Datepicker,
  Button,
  Overlay,
  Checkbox,
} from 'components';
import { getEndTime } from 'helpers';
import { useStateVar } from 'helpers/useStateVar';
import { getUserProfile } from 'helpers/userProfile';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { apiCall, ApiResps } from 'providers';
import 'react-datepicker/dist/react-datepicker.css';
import { CloseIcon } from '~/icons';
import {
  GraphWrapper,
  ModalMobile,
  ModalTitle,
  ModalTitleContainer,
  ModalSection,
  MobileWrapper,
  DesktopWrapper,
  Text,
  CheckboxLine,
  CustomLabel,
  ContentDate,
  DateLabel,
  StyledCalendarIcon,
  BtnExport,
  ExportWorksheet,
  ColoredLine,
  DashedColoredLine,
  StyledLink,
  InfoText,
} from './styles';
import { colors } from '~/styles/colors';
import { t } from 'i18next';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import { NoGraph } from '~/components/NoGraph';
import { ChangeColor } from '~/components/ChangeColor';
import ChillerCarrierHistory from './ChillerCarrierHistory/index';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { generateTicksByRange } from 'helpers/ticks';
import {
  CsvLabelFormatterData, renderQuarterTickHour, tickXLabelFormatterDay, tickXLabelFormatterHour,
  tooltipXLabelFormatter,
} from 'helpers/historyGraph';

type ChartDataVar = {
        id: string;
        name: string;
        unit?: string;
        y: (null | number)[];
        strokeDasharray: string;
        type: string;
        color: string;
        axisId: string;
        maxY?: null | number;
        minY?: null | number;
        y_orig?: (null | number | string)[];
        steps?: {
          y_orig: (null | number | string);
          y_chart: (null | number);
          label: string;
        }[];
        checked?: boolean;
};

type ChartDataDutDuo = ApiResps['/dut/get-day-charts-data-commonX'];

type ShowChartDataDutDuo = {
  Temperature: boolean;
  Temperature_1: boolean;
};

interface DriHistoryState {
  groupGraph: boolean;
  associatedDacsId: {
    dacId: string;
    checked: boolean;
    temperatures: {
      TsucChecked: boolean;
      TliqChecked: boolean;
      TambChecked: boolean;
    };
  }[];
  selectedDacs: {
    dacId: string;
    chartData: {
      commonX: number[];
      vars: {
        Lcmp: any;
        Tsuc: any;
        Tliq: any;
        Tamb: any;
      };
      limts: {
        maxPval: number;
        maxTval: number;
        minPval: number;
        minTval: number;
      };
      faults: any;
      numDeparts: number[];
    };
  }[];
  associatedDacs: {
    dacId: string;
    chartData: {
      commonX: number[];
      vars: {
        Lcmp: any;
        Tsuc: any;
        Tliq: any;
        Tamb: any;
      };
      limts: {
        maxPval: number;
        maxTval: number;
        minPval: number;
        minTval: number;
      };
      faults: any;
      numDeparts: number[];
    };
    show: {
        Lcmp: boolean;
        Tsuc: boolean;
        Tliq: boolean;
        Tamb: boolean;
    };
  }[];
  loading: boolean;
  devInfo: ReturnType<typeof getCachedDevInfoSync>;
  driInfo: null | {
    varsCfg: { application: string };
    ecoCfg: { ECO_OFST_START: number; DUT_ID: string };
  };
  xDomain: null | [number, number];
  xTicks: number[];
  refAreaLeft: null | number;
  refAreaRight: null | number;
  multiDays: boolean;
  numDays: number;
  dateStart: null | moment.Moment;
  dateEnd: null | moment.Moment;
  tomorrow: moment.Moment;
  chartData: {
    x: number[];
    vars: ChartDataVar[] | null;
  };
  isModalOpen: boolean;
  focused: boolean;
  focusedInput: 'endDate' | 'startDate' | null;
  csvData: {}[];
  setpointLimits: number[];
  setpointTicks: number[];
  modeLimits: number[];
  modeTicks: number[];
  vavModeLimits: number[];
  vavModeTicks: number[];
  fancoilModeTicks: number[];
  fancoilModeLimits: number[];
  customPointLimit: number;
  valveOnChecked: boolean;
  thermOnChecked: boolean;
  fanStatusChecked: boolean;
  lockChecked: boolean;
  baseSetpointTicks: number[];
  yDomain: number[];
  associatedDutsDuoId: {
    dutDuoId: string;
    checked: boolean;
    temperatures: {
      Temperature: boolean;
      Temperature_1: boolean;
    };
  }[];
  associatedDutsDuo: {
    dutDuoId: string;
    chartData: ChartDataDutDuo;
    show: ShowChartDataDutDuo;
  }[];
  selectedDutsDuo: { dutDuoId: string; chartData: ChartDataDutDuo }[];
}

const varsPropertiesFancoil = {
  Setpoint: {
    colorDefault: colors.Green,
    strokeDasharray: '5 5',
    type: 'monotone',
  },
  DutTemp: {
    colorDefault: colors.Orange,
    strokeDasharray: '',
    type: 'monotone',
  },
  TUSEMAX: {
    colorDefault: colors.Green,
    strokeDasharray: '',
    type: 'monotone',
  },
  TUSEMIN: {
    colorDefault: colors.Green,
    strokeDasharray: '',
    type: 'monotone',
  },
  EcoSetpoint: {
    colorDefault: colors.Green,
    strokeDasharray: '5 5',
    type: 'monotone',
  },
  OperationMode: {
    colorDefault: '#505050',
    strokeDasharray: '',
    type: 'monotone',
  },
  TempAmb: {
    colorDefault: colors.Orange,
    strokeDasharray: '',
    type: 'monotone',
  },
  Mode: {
    colorDefault: colors.BlueChart,
    strokeDasharray: '',
    type: 'stepAfter',
  },
  ThermOn: {
    colorDefault: '#082948',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  ValveOn: {
    colorDefault: '#2D81FF',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  FanStatus: {
    colorDefault: '#4F6381',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  Lock: {
    colorDefault: colors.BlueChart,
    strokeDasharray: '',
    type: 'stepAfter',
  },
  Tliq: {
    colorDefault: '#074FBC',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  Tsuc: {
    colorDefault: '#87B5FA',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  Temperature_1: {
    colorDefault: '#074FBC',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  Temperature: {
    colorDefault: '#87B5FA',
    strokeDasharray: '',
    type: 'stepAfter',
  },
  Tamb: {
    colorDefault: '#C2D3ED',
    strokeDasharray: '',
    type: 'stepAfter',
  },
};

const CustomTick = (props) => {
  const {
    x, y, payload, anchor, application, baseSetpointMinLimit, stepperGraph,
  } = props;

  const isFancoil = !!application?.startsWith('fancoil');
  const isVav = !!application?.startsWith('vav');

  const label = generateLabel();

  function isBelowAdjustedMinLimit(numberBelow: number): boolean {
    return payload.value === baseSetpointMinLimit - (numberBelow * stepperGraph);
  }

  function getStatusMessage(condition: boolean, trueMessage: string, falseMessage: string): string {
    return t(condition ? trueMessage : falseMessage).toLocaleUpperCase();
  }

  function generateLabel(): string {
    if (isFancoil || isVav) {
      if (payload.value >= baseSetpointMinLimit) return '';

      const belowLimitFirstTick = isBelowAdjustedMinLimit(1);
      const belowLimitSecondTick = isBelowAdjustedMinLimit(2);
      const belowLimitPenultTick = isBelowAdjustedMinLimit(5);
      const belowLimitLastTick = isBelowAdjustedMinLimit(6);

      if (belowLimitFirstTick || belowLimitSecondTick) {
        return getStatusMessage(belowLimitFirstTick, 'aberta', 'fechada');
      }

      if (isVav && (belowLimitPenultTick || belowLimitLastTick)) {
        return getStatusMessage(belowLimitPenultTick, 'travado', 'liberadoMin');
      }

      return getStatusMessage(!!((baseSetpointMinLimit - payload.value) % 2), 'ligado', 'desligado');
    }

    switch (payload.value) {
      case 3:
        return t('desligado');
      case 4:
        return t('ligado');
      case 5:
        return t('desligado');
      case 6:
        return t('ligado');
      case 7:
        return t('desligado');
      case 8:
        return t('ligado');
      case 9:
        return t('desligado');
      case 10:
        return t('ligado');
      case 11:
        return t('desligado');
      case 12:
        return t('ligado');
      case 13:
        return t('desligado');
      case 14:
        return t('ligado');
      default:
        return '';
    }
  }

  if (payload.value >= -10 && payload.value <= 14 && !(isFancoil || isVav) || ((isFancoil || isVav) && !!label)) {
    return (
      <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
        <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
          {label}
        </text>
      </g>
    );
  }

  if (payload.value > 1000000) {
    return (
      <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
        <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
          {new Date(payload.value).toLocaleTimeString()}
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {anchor === 'middle'
          ? Math.floor(payload.value / (60 * 60))
            .toString()
            .padStart(2, '0')
          : payload.value}
      </text>
    </g>
  );
};

function CustomTickMode(props) {
  const {
    x, y, payload, anchor,
  } = props;

  let label = payload.value;

  if (payload.value === 0) {
    label = t('desligado');
  }
  if (payload.value === 1) {
    label = t('ventilar').toLocaleUpperCase();
  }
  if (payload.value === 2) {
    label = t('refrigerar').toLocaleUpperCase();
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}
function CustomCompressorTickMode(props) {
  const {
    x, y, payload, anchor,
  } = props;

  let label = payload.value;

  if (payload.value === 0) {
    label = t('desligadoMin');
  }
  if (payload.value === 1) {
    label = t('ligadoMin');
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}

function CustomTickVAV(props) {
  const {
    x, y, payload, anchor, id,
  } = props;

  let label = payload.value;
  const modeTicks = {
    0: t('resfriar'),
    1: t('esquentar'),
    2: t('ventilar'),
  };
  const thermOnTicks = {
    0: t('desligadoMin'),
    1: t('ligadoMin'),
  };
  const valveOnTicks = {
    0: t('fechado'),
    1: t('aberto'),
  };
  const lockTicks = {
    0: t('liberadoMin'),
    1: t('travado'),
  };
  if (id === 'Mode') {
    label = modeTicks[payload.value] || label;
  }
  if (id === 'ThermOn') {
    label = thermOnTicks[payload.value] || label;
  }
  if (id === 'ValveOn') {
    label = valveOnTicks[payload.value] || label;
  }
  if (id === 'Lock') {
    label = lockTicks[payload.value] || label;
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}

function CustomTickFancoil(props) {
  const {
    x, y, payload, anchor, id,
  } = props;

  let label = payload.value;
  const modeTicks = {
    0: t('desligar'),
    1: t('ventilar'),
    2: t('refrigerar'),
  };
  const thermOnTicks = {
    0: t('desligadoMin'),
    1: t('ligadoMin'),
  };
  const valveOnTicks = {
    0: t('fechada'),
    1: t('aberta'),
  };
  const fanTicks = {
    0: t('desligadoMin'),
    1: t('ligadoMin'),
  };

  if (id === 'OperationMode') {
    label = modeTicks[payload.value] || label;
  }
  if (id === 'ThermOn') {
    label = thermOnTicks[payload.value] || label;
  }
  if (id === 'ValveOn') {
    label = valveOnTicks[payload.value] || label;
  }
  if (id === 'FanStatus') {
    label = fanTicks[payload.value] || label;
  }

  return (
    <g transform={`translate(${x - 3},${anchor ? y : y - 12})`}>
      <text x={0} y={0} dy={16} textAnchor={anchor || 'end'} fill="#666" fontSize="10px">
        {label}
      </text>
    </g>
  );
}

function varsProperties(application?: string) {
  if (application?.startsWith('fancoil')) return varsPropertiesFancoil;
  const varsProperties = {
    Setpoint: {
      colorDefault: application === 'carrier-ecosplit' ? colors.Blue200 : colors.Green,
      strokeDasharray: application === 'carrier-ecosplit' ? '' : '5 5',
      type: 'monotone',
    },
    DutTemp: {
      colorDefault: colors.Orange,
      strokeDasharray: '',
      type: 'monotone',
    },
    TUSEMAX: {
      colorDefault: colors.Green,
      strokeDasharray: '',
      type: 'monotone',
    },
    TUSEMIN: {
      colorDefault: colors.Green,
      strokeDasharray: '',
      type: 'monotone',
    },
    EcoSetpoint: {
      colorDefault: colors.Green,
      strokeDasharray: '5 5',
      type: 'monotone',
    },
    OperationMode: {
      colorDefault: colors.Red,
      strokeDasharray: '',
      type: 'monotone',
    },
    TempAmb: {
      colorDefault: colors.Orange,
      strokeDasharray: '',
      type: 'monotone',
    },
    Mode: {
      colorDefault: colors.BlueChart,
      strokeDasharray: '',
      type: 'stepAfter',
    },
    ThermOn: {
      colorDefault: colors.BlueChart,
      strokeDasharray: '',
      type: 'stepAfter',
    },
    ValveOn: {
      colorDefault: colors.BlueChart,
      strokeDasharray: '',
      type: 'stepAfter',
    },
    FanStatus: {
      colorDefault: colors.BlueChart,
      strokeDasharray: '',
      type: 'stepAfter',
    },
    Lock: {
      colorDefault: colors.BlueChart,
      strokeDasharray: '',
      type: 'stepAfter',
    },
    Tliq: {
      colorDefault: '#2d81ff',
      strokeDasharray: '',
      type: 'stepAfter',
    },
    Tsuc: {
      colorDefault: '#ffbe16',
      strokeDasharray: '',
      type: 'stepAfter',
    },
    Tamb: {
      colorDefault: '#e803c3',
      strokeDasharray: '',
      type: 'stepAfter',
    },
    Lcmp: {
      colorDefault: colors.BlueChart,
      strokeDasharray: '',
      type: 'stepAfter',
    },
  };
  return varsProperties;
}

function getDataByVars(vars?: ChartDataVar[]): Record<string, ChartDataVar | undefined> {
  const defaultVars: Record<string, ChartDataVar | undefined> = {
    setpoint: undefined,
    dutTemp: undefined,
    tusemax: undefined,
    tusemin: undefined,
    ecoSetpoint: undefined,
    operationMode: undefined,
    mode: undefined,
    tempAmb: undefined,
    thermOn: undefined,
    valveOn: undefined,
    fanStatus: undefined,
    lock: undefined,
  };

  if (!vars) return defaultVars;

  const mapping: Record<string, keyof typeof defaultVars> = {
    Setpoint: 'setpoint',
    DutTemp: 'dutTemp',
    TUSEMAX: 'tusemax',
    TUSEMIN: 'tusemin',
    EcoSetpoint: 'ecoSetpoint',
    OperationMode: 'operationMode',
    Mode: 'mode',
    TempAmb: 'tempAmb',
    ThermOn: 'thermOn',
    ValveOn: 'valveOn',
    FanStatus: 'fanStatus',
    Lock: 'lock',
  };

  const result = { ...defaultVars };

  for (const data of vars) {
    if (data?.id && mapping[data.id] && !result[mapping[data.id]]) {
      result[mapping[data.id]] = data;
    }
  }

  return result;
}

let CSVheader = [] as any;

export function DriHistory(props: { integrId: string, chillerModel?: string }): JSX.Element {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { integrId: devId } = props;
  const csvLinkEl = useRef();
  const [state, render, setState] = useStateVar<DriHistoryState>({
    groupGraph: false,
    associatedDacsId: [],
    selectedDacs: [],
    associatedDacs: [],
    loading: false,
    devInfo: getCachedDevInfoSync(devId),
    driInfo: null,
    xDomain: [0, 24],
    xTicks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
    refAreaLeft: null,
    refAreaRight: null,
    multiDays: false,
    numDays: 1,
    dateStart: null,
    dateEnd: null,
    tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    chartData: {
      x: [],
      vars: null,
    },
    isModalOpen: false,
    focused: false,
    focusedInput: null,
    csvData: [],
    setpointLimits: [0, 0],
    setpointTicks: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    modeLimits: [0, 2],
    modeTicks: [0, 1, 2],
    vavModeLimits: [0, 2],
    vavModeTicks: [0, 1, 2],
    fancoilModeTicks: [0, 1, 2],
    fancoilModeLimits: [0, 2],
    customPointLimit: 11,
    valveOnChecked: true,
    thermOnChecked: true,
    fanStatusChecked: true,
    lockChecked: true,
    baseSetpointTicks: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    yDomain: [15, 40],
    associatedDutsDuoId: [],
    associatedDutsDuo: [],
    selectedDutsDuo: [],
  });
  const [date, setDate] = useState(getEndTime());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [graphData, setGraphData] = useState({});

  const isFancoil = () => !!state.driInfo?.varsCfg?.application.startsWith('fancoil');
  const isVav = () => !!state.driInfo?.varsCfg?.application.startsWith('vav');
  const isCarrierEcosplit = () => state.driInfo?.varsCfg?.application === 'carrier-ecosplit';

  function generateSetpointTicks(newSetpointsLimit: number[]): number[] {
    const lastTicks = generateTicksByRange(
      {
        min: newSetpointsLimit[0],
        max: newSetpointsLimit[1],
      },
    );
    return lastTicks;
  }

  function updateMinMaxSetpoint({ min, max }: { min: number; max: number;}) {
    if (!isFancoil()) return;
    const minY = Math.floor(min / 5) * 5;
    const maxY = Math.ceil(max / 5) * 5;

    const newSetpoints: number[] = [...state.setpointLimits];
    if (newSetpoints[0] > minY) newSetpoints[0] = minY;
    if (newSetpoints[1] < maxY) newSetpoints[1] = maxY;

    const setpointLimits = [minY, maxY];
    setState({ setpointLimits });

    const newSetpointsTicks = generateSetpointTicks(newSetpoints);
    setState({
      setpointTicks: newSetpointsTicks,
      baseSetpointTicks: newSetpointsTicks,
      yDomain: [newSetpointsTicks[0], newSetpointsTicks[newSetpointsTicks.length - 1]],
    });
  }

  function createAdditionalTicksFancoil(baseTicks: number[]): number[] {
    const differenceTicks = baseTicks[1] - baseTicks[0];
    const arrayLength = 6;

    const newTicks = Array.from({ length: arrayLength },
      (_, index) => baseTicks[0] - ((arrayLength * differenceTicks) - (index * differenceTicks)));
    return [...newTicks, ...baseTicks];
  }

  function checkAgroupGraphData() {
    let baseTicks = [...state.baseSetpointTicks];
    if (state.groupGraph) {
      if (isFancoil() || isVav()) {
        baseTicks = createAdditionalTicksFancoil(baseTicks);
      }
      let customPointLimit = baseTicks[0];
      const customPointTick: number[] = [];
      if (!isFancoil() && state.selectedDacs.length > 0) {
        customPointLimit = baseTicks[0] - state.selectedDacs.length * 2;
        for (let i = customPointLimit; i <= (baseTicks[0] - 1); i++) {
          customPointTick.push(i);
        }
      }

      const updatedBaseTick = customPointTick.concat(baseTicks);

      state.setpointTicks = updatedBaseTick;
      state.yDomain = [updatedBaseTick[0], updatedBaseTick[updatedBaseTick.length - 1]];
      state.customPointLimit = customPointLimit;
      render();
    } else {
      state.setpointTicks = state.baseSetpointTicks;
      state.yDomain = [state.baseSetpointTicks[0], state.baseSetpointTicks[state.baseSetpointTicks.length - 1]];
      render();
    }
  }

  function insertVars(vars: any) {
    const chartVars: (typeof state.chartData.vars) = [];
    const application = state.driInfo?.varsCfg?.application;
    const ecoCfg = state.driInfo?.ecoCfg;
    let i = 0;
    for (const key in vars) {
      if (vars.hasOwnProperty(key) && vars[key].y.length > 0 && vars[key].y.some((value) => value !== null)) {
        chartVars.push({
          id: key,
          name: vars[key].name,
          y: vars[key].y,
          color: varsProperties(application)[key]?.colorDefault,
          strokeDasharray: varsProperties(application)[key]?.strokeDasharray,
          axisId: key,
          checked: true,
          type: varsProperties(application)[key]?.type,
          maxY: 40,
          minY: 0,
        });
        if (key === 'TUSEMIN' && ecoCfg?.DUT_ID) {
          chartVars.push({
            id: 'EcoSetpoint',
            name: 'Eco Setpoint',
            y: vars[key].y.map((value) => value && value + state.driInfo?.ecoCfg.ECO_OFST_START),
            color: varsProperties(application).EcoSetpoint?.colorDefault,
            strokeDasharray: varsProperties(application).EcoSetpoint?.strokeDasharray,
            axisId: 'EcoSetpoint',
            checked: true,
            type: varsProperties(state.devInfo?.varsCfg?.application).EcoSetpoint?.type,
            maxY: 40,
            minY: 0,
          });
        }
      }
      i++;
    }

    state.chartData.vars = chartVars;
  }

  const getChartDacs = async (numDays: number) => {
    const { dri } = state.devInfo;
    const application = state.driInfo?.varsCfg?.application;
    const params: string[] = [];

    if (application?.startsWith('fancoil')) {
      params.push('Tsuc', 'Tliq', 'Tamb');
    } else {
      params.push('Lcmp');
    }
    const promiseDacs = dri.associatedDacs?.map(async (dac, i) => {
      const chartData = await apiCall('/dac/get-charts-data-common', {
        dacId: dac.DAC_ID,
        selectedParams: params,
        dayYMD: moment(state.dateStart).format('YYYY-MM-DD'),
        numDays,
      });
      updateMinMaxSetpoint({ min: chartData.limts.minTval, max: chartData.limts.maxTval });
      return { dacId: dac.DAC_ID, chartData };
    }) || [];
    const resultPromises = await Promise.all(promiseDacs);
    const chartVars: (typeof state.chartData.vars) = [];
    const labels = {
      Tliq: t('temperaturaEntradaAgua'),
      Tsuc: t('temperaturaSaidaAgua'),
      Tamb: t('temperaturaArEntrada'),
      Lcmp: t('sinalComando'),
    };
    let index = 0;

    for (const dac of resultPromises) {
      for (const param of params) {
        const labelDifference = application?.startsWith('fancoil') ? '' : ` - ${index}`;
        if (param === 'Lcmp' && dac.chartData.vars[param] && dac.chartData.vars[param].L.length > 0 && dac.chartData.vars[param].L.some((value) => value !== null)) {
          chartVars.push({
            id: param,
            name: `${labels[param]}${labelDifference}`,
            y: dac.chartData.vars[param].L,
            color: varsProperties(application)[param]?.colorDefault,
            strokeDasharray: varsProperties(application)[param]?.strokeDasharray,
            axisId: param,
            checked: true,
            type: varsProperties(application)[param]?.type,
            maxY: 40,
            minY: 0,
          });
        } else if (dac.chartData.vars[param] && dac.chartData.vars[param].y.length > 0 && dac.chartData.vars[param].y.some((value) => value !== null)) {
          chartVars.push({
            id: param,
            name: `${labels[param]}${labelDifference}`,
            y: dac.chartData.vars[param].y,
            color: varsProperties(application)[param]?.colorDefault,
            strokeDasharray: varsProperties(application)[param]?.strokeDasharray,
            axisId: param,
            checked: true,
            type: varsProperties(application)[param]?.type,
            maxY: 40,
            minY: 0,
          });
        }
      }
      index++;
    }
    state.chartData.vars = (state.chartData.vars || []).concat(chartVars);
    setState({ selectedDacs: resultPromises, associatedDacs: resultPromises.map((dac) => ({ ...dac, show: { Tsuc: true, Tliq: true, Tamb: true } })), associatedDacsId: resultPromises.map((dac) => ({ dacId: dac.dacId, checked: true, temperatures: { TsucChecked: true, TliqChecked: true, TambChecked: true } })) });
    render();
  };

  const getChartDutsDuo = async (numDays: number) => {
    const { dri } = state.devInfo as { dri: NonNullable<ApiResps['/get-dev-full-info']['dri']>};
    const application = state.driInfo?.varsCfg?.application;
    const params = ['Temperature', 'Temperature_1'];

    if (!isFancoil() || !dri.associatedDutsDuo?.length) return;

    const promisesDutsDuo = dri.associatedDutsDuo.map(async (dutDuo) => {
      const chartData = await apiCall('/dut/get-day-charts-data-commonX', {
        devId: dutDuo.DUT_DUO_ID,
        selectedParams: params,
        day: moment(state.dateStart).format('YYYY-MM-DD'),
        numDays,
      });
      const temperatureGraphValues = [...chartData.Temperature.y, ...chartData.Temperature_1.y].filter((value) => value !== null);
      const minValueTemp = Math.min(...temperatureGraphValues);
      const maxValueTemp = Math.max(...temperatureGraphValues);
      updateMinMaxSetpoint({ min: minValueTemp, max: maxValueTemp });
      return { dutDuoId: dutDuo.DUT_DUO_ID, chartData };
    });
    const resultPromises = await Promise.all(promisesDutsDuo);

    const chartVars: (typeof state.chartData.vars) = [];
    const labels = {
      Temperature_1: t('temperaturaEntradaAgua'),
      Temperature: t('temperaturaSaidaAgua'),
    };
    let index = 0;

    for (const dutDuo of resultPromises) {
      for (const param of params) {
        if (dutDuo.chartData[param] && dutDuo.chartData[param].y.length > 0 && dutDuo.chartData[param].y.some((value) => value !== null)) {
          chartVars.push({
            id: param,
            name: `${labels[param]}`,
            y: dutDuo.chartData[param].y,
            color: varsProperties(application)[param]?.colorDefault,
            strokeDasharray: varsProperties(application)[param]?.strokeDasharray,
            axisId: param,
            checked: true,
            type: varsProperties(application)[param]?.type,
            maxY: 40,
            minY: 0,
          });
        }
      }
      index++;
    }

    state.chartData.vars = (state.chartData.vars || []).concat(chartVars);

    const newState = {
      selectedDutsDuo: resultPromises,
      associatedDutsDuo: resultPromises.map((dutDuo) => ({
        ...dutDuo,
        show: { Temperature: true, Temperature_1: true },
      })),
      associatedDutsDuoId: resultPromises.map((dutDuo) => ({
        dutDuoId: dutDuo.dutDuoId,
        checked: true,
        temperatures: {
          Temperature: true,
          Temperature_1: true,
        },
      })),
    };

    setState(newState);
  };

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!state.loading) {
        setState({ loading: true });
      }
      const devInfo = await getCachedDevInfo(devId, { forceFresh: true });
      const driInfo = devInfo.dri;
      setState({ devInfo, driInfo, loading: false });
      render();
    }).catch(console.log);
  }, []);

  useEffect(() => {
    if (!state.devInfo) return;
    if (!(isFancoil() || isVav() || isCarrierEcosplit())) return;
    if (!state.dateStart || !state.dateEnd) return;

    Promise.resolve().then(async () => {
      if (!state.loading) {
        setState({ loading: true });
      }

      try {
        const d1 = new Date(`${moment(state.dateStart).format('YYYY-MM-DD')}T00:00:00Z`).getTime();
        const d2 = new Date(`${moment(state.dateEnd).format('YYYY-MM-DD')}T00:00:00Z`).getTime();
        const numDays = Math.round((d2 - d1) / 1000 / 60 / 60 / 24) + 1;
        state.numDays = numDays;
        if ((numDays >= 1) && (numDays <= 15)) { } // OK
        else {
          toast.error(t('periodoDe1a15Dias'));
          state.loading = false;
          render();
          return;
        }

        try {
          const params = {
            driId: devId,
            selectedParams: ['Setpoint', 'Status', 'Mode', 'DutTemp', 'ThermOn', 'Lock', 'TempAmb', 'ValveOn', 'FanStatus'],
            dayYMD: moment(state.dateStart).format('YYYY-MM-DD'),
            numDays,
          };

          const chartsData = await apiCall('/dri/get-day-charts-data-common', params);
          setState({ setpointLimits: [chartsData.limits.minTval, chartsData.limits.maxTval] });
          updateMinMaxSetpoint({ min: chartsData.limits.minTval, max: chartsData.limits.maxTval });

          state.chartData.x = chartsData.commonX;

          insertVars(chartsData.vars);

          state.xDomain = [0, 24 * numDays];
          state.xTicks = Array.from({ length: 13 }, (_, i) => i * 2 * numDays);
        } catch (e) {
          state.chartData.vars = null;
          toast.error(t('erroAquisicaoHistoricoDRI'));
          console.log(e);
        }
        await Promise.all([getChartDacs(numDays), getChartDutsDuo(numDays)]);
      } catch (err) { console.log(err); }
      state.loading = false;
      render();
    });
  }, [state.dateStart, state.dateEnd, state.devInfo, state.driInfo]);

  function onMultidaysClick() {
    state.multiDays = !state.multiDays;
    if (!state.multiDays) {
      state.dateEnd = state.dateStart;
    }
    render();
  }

  const setFormattedDate = useCallback((date) => setDate(date.set({ hour: 0 })), []);

  function csvValueFormatter(value: any, id: string) {
    const labels = {
      OperationMode: {
        0: t('desligado'),
        1: t('ventilar').toLocaleUpperCase(),
        2: t('refrigerar').toLocaleUpperCase(),
      },
      ThermOn: {
        0: t('desligado'),
        1: t('ligado').toLocaleUpperCase(),
      },
      ValveOn: {
        0: t('fechada').toLocaleUpperCase(),
        1: t('aberta').toLocaleUpperCase(),
      },
      FanStatus: {
        0: t('desligado').toLocaleUpperCase(),
      },
      Mode: {
        0: t('resfriar').toLocaleUpperCase(),
        1: t('esquentar').toLocaleUpperCase(),
        2: t('ventilar').toLocaleUpperCase(),
      },
      Lock: {
        0: t('liberadoMin'),
        1: t('travado'),
        2: t('refrigerar').toLocaleUpperCase(),
      },
    };
    if (state.chartData.vars && value != null) {
      let label = labels[id]?.[value] || value.toString();
      if (id === 'FanStatus' && value !== 0) label = t('ligado').toLocaleUpperCase();
      return `${formatNumberWithFractionDigits(label)}`;
    }
    return '-';
  }

  const getCsvData = async () => {
    state.loading = true; render();
    const formattedCSV = [] as any;
    CSVheader = [];

    try {
      CSVheader.push({
        label: t('dataHora'),
        key: 'data',
      });

      if (state.chartData.vars && state.chartData.vars.length > 0) {
        for (const object of state.chartData.vars) {
          if ((isFancoil() && object.checked && ['Setpoint', 'OperationMode', 'ThermOn', 'TempAmb', 'ValveOn', 'FanStatus', 'TUSEMAX', 'TUSEMIN'].includes(object.id))
           || (isVav() && object.checked && ['Setpoint', 'Mode', 'ThermOn', 'TempAmb', 'ValveOn', 'Lock', 'TUSEMAX', 'TUSEMIN'].includes(object.id))
           || (object.checked && ['Setpoint', 'OperationMode', 'DutTemp', 'EcoSetpoint'].includes(object.id))
          ) {
            CSVheader.push({
              label: object.name,
              key: object.id,
            });
          }
        }

        for (let i = 0; i < state.chartData.x.length; i++) {
          if (state.chartData.vars) {
            if (isFancoil()) {
              formattedCSV.push({
                data: `${CsvLabelFormatterData(state.chartData.x[i], state.dateStart)}`,
                Setpoint: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Setpoint')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Setpoint')[0].y[i], 'Setpoint') : '-'),
                OperationMode: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'OperationMode')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'OperationMode')[0].y[i], 'OperationMode') : '-'),
                ThermOn: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'ThermOn')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'ThermOn')[0].y[i], 'ThermOn') : '-'),
                TempAmb: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'TempAmb')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'TempAmb')[0].y[i], 'TempAmb') : '-'),
                ValveOn: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'ValveOn')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'ValveOn')[0].y[i], 'ValveOn') : '-'),
                FanStatus: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'FanStatus')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'FanStatus')[0].y[i], 'FanStatus') : '-'),
                TUSEMAX: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'TUSEMAX')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'TUSEMAX')[0].y[i], 'TUSEMAX') : '-'),
                TUSEMIN: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'TUSEMIN')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'TUSEMIN')[0].y[i], 'TUSEMIN') : '-'),
              });
            } else if (isVav()) {
              formattedCSV.push({
                data: `${CsvLabelFormatterData(state.chartData.x[i], state.dateStart)}`,
                Setpoint: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Setpoint')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Setpoint')[0].y[i], 'Setpoint') : '-'),
                Mode: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Mode')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Mode')[0].y[i], 'Mode') : '-'),
                ThermOn: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'ThermOn')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'ThermOn')[0].y[i], 'ThermOn') : '-'),
                TempAmb: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'TempAmb')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'TempAmb')[0].y[i], 'TempAmb') : '-'),
                ValveOn: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'ValveOn')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'ValveOn')[0].y[i], 'ValveOn') : '-'),
                Lock: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Lock')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Lock')[0].y[i], 'Lock') : '-'),
                TUSEMAX: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'TUSEMAX')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'TUSEMAX')[0].y[i], 'TUSEMAX') : '-'),
                TUSEMIN: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'TUSEMIN')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'TUSEMIN')[0].y[i], 'TUSEMIN') : '-'),
              });
            } else {
              formattedCSV.push({
                data: `${CsvLabelFormatterData(state.chartData.x[i], state.dateStart)}`,
                Setpoint: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'Setpoint')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'Setpoint')[0].y[i], 'Setpoint') : '-'),
                DutTemp: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'DutTemp')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'DutTemp')[0].y[i], 'DutTemp') : '-'),
                EcoSetpoint: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'EcoSetpoint')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'EcoSetpoint')[0].y[i], 'EcoSetpoint') : '-'),
                OperationMode: (state.chartData.vars && state.chartData.vars.filter((line) => line.id === 'OperationMode')[0] ? csvValueFormatter(state.chartData.vars.filter((line) => line.id === 'OperationMode')[0].y[i], 'OperationMode') : '-'),
              });
            }
          }
        }

        state.csvData = formattedCSV;
        render();
        setTimeout(() => {
          (csvLinkEl as any).current.link.click();
        }, 1000);

        state.loading = false; render();
      }
      else {
        toast.info(t('semDadosGraficoExportar')); state.loading = false;
      }
    } catch (err) { console.log(err); toast.error(t('erro')); state.loading = false; }
  };

  function getDataToChangeColor() {
    const list = [] as {color: string, description: string, index: number}[];
    state.chartData.vars?.forEach((item, i) => {
      if ((isFancoil() && ['Setpoint', 'OperationMode', 'ThermOn', 'TempAmb', 'ValveOn', 'FanStatus', 'TUSEMAX', 'TUSEMIN', 'Tliq', 'Tsuc', 'Tamb', 'Temperature', 'Temperature_1'].includes(item.id))
      || (isVav() && ['Setpoint', 'Mode', 'ThermOn', 'TempAmb', 'ValveOn', 'Lock', 'TUSEMAX', 'TUSEMIN', 'Lcmp'].includes(item.id))
      || (!(isFancoil() || isVav()))) {
        list.push({
          color: item.color,
          description: `${item.name}`,
          index: i,
        });
      }
    });
    return list;
  }

  function setColor(color, index) {
    if (state.chartData.vars && state.chartData.vars.length > index) {
      state.chartData.vars[index].color = color.hex;
      render();
    }
  }

  return (
    <>
      {(!state.loading && state.driInfo?.varsCfg.application.startsWith('chiller-carrier')) ? (
        <ChillerCarrierHistory driId={devId} model={state.driInfo?.varsCfg.application} chillerModel={props.chillerModel} />
      ) : (
        <Card>
          <>{state.loading && <Loader />}</>
          <div>
            {(!state.loading && (isCarrierEcosplit() || isVav() || isFancoil()))
                  && (
                    <div>
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
                              FILTRAR
                            </Button>
                          </Box>
                        </Flex>
                      </ModalMobile>
                      <Flex flexDirection="column">
                        <Flex flexWrap="wrap" flexDirection="row" mb={38} alignItems="center" justifyContent="space-between">
                          <Flex flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                            <Box>
                              <ContentDate>
                                <DateLabel>{t('Data')}</DateLabel>
                                <br />
                                {!state.isModalOpen && (!state.multiDays) && (
                                <SingleDatePicker
                                  disabled={state.loading}
                                  date={state.dateStart}
                                  onDateChange={(value) => { setState({ dateStart: value, dateEnd: value }); }}
                                  focused={state.focused}
                                  onFocusChange={({ focused }) => setState({ focused })}
                                  id="datepicker"
                                  numberOfMonths={1}
                                  isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                                />
                                )}
                                {!state.isModalOpen && (state.multiDays) && (
                                <DateRangePicker
                                  disabled={state.loading}
                                  startDate={state.dateStart} // momentPropTypes.momentObj or null,
                                  startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                                  endDate={state.dateEnd} // momentPropTypes.momentObj or null,
                                  endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                                  onDatesChange={({ startDate, endDate }) => { setState({ dateStart: startDate, dateEnd: startDate !== state.dateStart ? null : endDate }); }} // PropTypes.func.isRequired,
                                  onFocusChange={(focused: 'endDate' | 'startDate' | null) => setState({ focusedInput: focused })}
                                  focusedInput={state.focusedInput}
                                  noBorder
                                  isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                                />
                                )}
                                <StyledCalendarIcon color="#202370" />
                              </ContentDate>
                              <CheckboxLine style={{ marginTop: '10px', height: '' }}>
                                <Checkbox
                                  checked={state.multiDays}
                                  onClick={onMultidaysClick}
                                  style={{ marginLeft: '20px' }}
                                />
                                <Text>
                                  {t('multiplosDias')}
                                </Text>
                              </CheckboxLine>
                            </Box>
                            <Box style={{ paddingLeft: '30px', paddingBottom: '30px' }}>
                              <b style={{ fontSize: '14px' }}>{t('visualizacao')}</b>
                              <Box minWidth="280px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
                                <span style={{ fontSize: '1rem' }}>{t('desagrupar')}</span>
                                <ToggleSwitchMini
                                  checked={state.groupGraph}
                                  onClick={() => { setState({ groupGraph: !state.groupGraph }); checkAgroupGraphData(); render(); }}
                                  style={{ marginLeft: '10px', marginRight: '10px' }}
                                />
                                <span style={{ fontSize: '1rem' }}>{t('agrupar')}</span>
                              </Box>
                            </Box>
                          </Flex>
                          <Flex flexDirection="row" alignItems="center">
                            <ChangeColor blueVersion data={getDataToChangeColor()} setColor={setColor} />
                            <Flex ml="30px" justifyContent="flex-end" flexWrap="wrap">
                              <BtnExport variant={state.loading ? 'disabled' : 'primary'} onClick={getCsvData}>
                                <div>
                                  <ExportWorksheet />
                                  <Text style={{ paddingLeft: '5px' }}>
                                    {t('exportarPlanilha')}
                                  </Text>
                                </div>
                              </BtnExport>
                              <CSVLink
                                headers={CSVheader}
                                data={state.csvData}
                                filename={t('nomeArquivoHistoricoDevId', { id: devId })}
                                separator=";"
                                asyncOnClick
                                enclosingCharacter={"'"}
                                ref={csvLinkEl}
                              />
                            </Flex>
                          </Flex>
                        </Flex>
                        <Box width={1}>
                          <DesktopWrapper>
                            <Graph
                              graphData={graphData}
                              state={state}
                              checkAgroupGraphData={checkAgroupGraphData}
                            />
                          </DesktopWrapper>
                          <MobileWrapper>
                            <Flex mt="32px">
                              <Box width={1}>
                                <div onClick={() => setIsModalOpen(true)}>
                                  <Button variant="primary">{t('botaoFiltrar')}</Button>
                                </div>
                              </Box>
                            </Flex>
                            <Graph
                              graphData={graphData}
                              state={state}
                              checkAgroupGraphData={checkAgroupGraphData}
                            />
                          </MobileWrapper>
                        </Box>
                      </Flex>
                    </div>
                  )}
            {(!state.loading && !(state.driInfo?.varsCfg.application.startsWith('chiller-carrier') || isCarrierEcosplit() || isVav() || isFancoil())) && <div>{t('naoDisponivel')}</div>}
          </div>
        </Card>
      )}
    </>
  );
}

const Graph = ({
  state,
  checkAgroupGraphData,
}: {
  // @ts-ignore
  Filtering?: React.Element,
  graphData?: any,
  graphEnable?: any,
  handleChange?: () => void,
  state: DriHistoryState,
  checkAgroupGraphData: () => void,
}) => {
  const [profile] = useState(getUserProfile);
  const [, render] = useStateVar({});
  const application = state.driInfo?.varsCfg?.application;
  const commonX = state.chartData.x;
  const stepperGraph = state.baseSetpointTicks[1] - state.baseSetpointTicks[0];

  const isFancoil = application?.startsWith('fancoil');
  const isVav = application?.startsWith('vav');
  const isCarrierEcosplit = application === 'carrier-ecosplit';

  const {
    setpoint,
    dutTemp,
    tusemax,
    tusemin,
    ecoSetpoint,
    operationMode,
    mode,
    tempAmb,
    thermOn,
    valveOn,
    fanStatus,
    lock,
  } = useMemo(() => getDataByVars(state.chartData.vars ?? undefined), [state.chartData.vars]);

  function zoom() {
    let { refAreaLeft, refAreaRight } = state;

    if (refAreaLeft === refAreaRight || refAreaRight == null || refAreaLeft == null) {
      state.refAreaLeft = null;
      state.refAreaRight = null;
      render();
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    state.refAreaLeft = null;
    state.refAreaRight = null;
    state.xDomain = [refAreaLeft, refAreaRight];
    state.xTicks = [];
    render();
  }

  function zoomOut() {
    state.refAreaLeft = null;
    state.refAreaRight = null;
    state.xDomain = null;
    state.xTicks = Array.from({ length: 13 }, (_, i) => i * 2 * state.numDays);
    render();
  }

  function operationalModeFancoilLabel(value: number) {
    if (value === 0) return t('desligar');
    if (value === 1) return t('ventilar');
    if (value === 2) return t('resfriar');
  }

  function operationalModeVavLabel(value: number) {
    if (value === 0) return t('refrigerar');
    if (value === 1) return t('esquentar');
    if (value === 2) return t('ventilar');
  }

  function operationalModeCarrierEcoSplitLabel(value: number) {
    if (value === 0) return t('desligado');
    if (value === 1) return t('ventilar').toLocaleUpperCase();
    if (value === 2) return t('refrigerar').toLocaleUpperCase();
  }

  function tooltipFancoilFormater(value: number, accessor: string, baseValueLimit: number) {
    const label = formatNumberWithFractionDigits(value.toString());

    if (accessor.includes('Setpoint') || accessor.includes('Temperatura')) {
      return `${label}°C`;
    }

    const valueForLabel = state.groupGraph ? baseValueLimit - value : value;

    switch (accessor) {
      case 'Modo de operação': return operationalModeFancoilLabel(value);
      case 'Sinal de Comando para Válvula': return t(valueForLabel % 2 ? 'aberta' : 'fechada').toLocaleUpperCase();
      case 'Status do Ventilador':
      case 'Status do Termostato':
      default: return t(valueForLabel % 2 ? 'ligadoMin' : 'desligadoMin').toLocaleUpperCase();
    }
  }

  function tooltipVavFormater(value: number, accessor: string, baseValueLimit: number) {
    const label = formatNumberWithFractionDigits(value.toString());

    if (accessor.includes('Setpoint') || accessor.includes('Temperatura')) {
      return `${label}°C`;
    }

    const valueForLabel = state.groupGraph ? baseValueLimit - value : value;

    switch (accessor) {
      case 'Modo de operação': return operationalModeVavLabel(value);
      case 'Status da válvula': return t(valueForLabel % 2 ? 'aberta' : 'fechada').toLocaleUpperCase();
      case 'Bloqueio': return t(valueForLabel % 2 ? 'travado' : 'liberadoMin').toLocaleUpperCase();
      case 'Status do Termostato':
      default: return t(valueForLabel % 2 ? 'ligadoMin' : 'desligadoMin').toLocaleUpperCase();
    }
  }

  function toolTipFormater(
    value: number,
    accessor: string | Function,
  ) {
    if (typeof accessor !== 'string') return;

    if (isFancoil) {
      return tooltipFancoilFormater(value, accessor, state.baseSetpointTicks[0]);
    }

    if (isVav) {
      return tooltipVavFormater(value, accessor, state.baseSetpointTicks[0]);
    }

    const label = formatNumberWithFractionDigits(value.toString());

    if (accessor.includes('Setpoint') || accessor.includes('Temperatura')) {
      return `${label}°C`;
    }

    if (accessor === 'Modo de operação' && isCarrierEcosplit) {
      return operationalModeCarrierEcoSplitLabel(value);
    }

    if (accessor.startsWith(t('sinalComando'))) {
      return t(value % 2 ? 'DESLIGADO' : 'LIGADO').toLocaleUpperCase();
    }

    const statusLabelMap = {
      'Status da válvula': { 0: 'Fechada', 1: 'Aberta' },
      'Status do Ventilador': { 0: t('desligadoMin'), 1: t('ligadoMin') },
      'Status do Termostato': { 0: t('desligadoMin'), 1: t('ligadoMin') },
      Bloqueio: { 0: t('liberadoMin'), 1: t('bloqueadoMin') },
    };

    if (statusLabelMap[accessor]) {
      return statusLabelMap[accessor][value];
    }

    if (value >= 3 && value <= 12) {
      return value % 2 ? 'DESLIGADO' : 'LIGADO';
    }

    return label;
  }

  function toolTipFormaterDac(
    value: number,
  ) {
    if (value === 0) {
      return 'Desligado';
    }

    if (value === 1) {
      return 'ligado';
    }
  }

  function returnSizeGraph(isNumber: boolean) {
    const baseSizeGraph = 450;
    const customSizeGraph = state.selectedDacs ? (state.selectedDacs.length > 0 ? baseSizeGraph + (state.selectedDacs.length * 50) : baseSizeGraph) : baseSizeGraph;
    if (isNumber) {
      return customSizeGraph;
    }
    return `${customSizeGraph}px`;
  }

  const getParamsColor = (name) => {
    const info = state.chartData.vars?.find((data) => data.name === name);

    return info?.color || '';
  };

  const onMouseMove = (e) => {
    if (state.refAreaLeft != null) {
      state.refAreaRight = e.activeLabel;
      render();
    }
  };
  const onMouseDown = (e) => {
    state.refAreaLeft = e.activeLabel;
    render();
  };

  function fancoilGroupGraphDataKey(
    chartDataInfo: { chartDataVar: ChartDataVar, isChecked: boolean },
    i: number,
    count: number,
  ): number | null {
    const { chartDataVar, isChecked } = chartDataInfo;
    const stepBeforeLimit = count * stepperGraph;
    const dacsSteps = stepBeforeLimit * 2;
    const chartDataIValue = chartDataVar.y[i];
    const valueChart = chartDataIValue !== null ? (chartDataIValue * stepperGraph) : null;

    return (valueChart !== null && isChecked) ? state.customPointLimit + valueChart + dacsSteps : null;
  }

  function onClickDutDuoCheckboxTemperature(
    dutDuo: DriHistoryState['associatedDutsDuoId'][number],
    key: keyof DriHistoryState['associatedDutsDuoId'][number]['temperatures'],
  ): void {
    dutDuo.temperatures[key] = !dutDuo.temperatures[key];
    render();

    state.associatedDutsDuo = state.associatedDutsDuo.map((selectedDutDuo) => {
      if (selectedDutDuo.dutDuoId === dutDuo.dutDuoId) {
        selectedDutDuo.show[key] = dutDuo.temperatures[key];
      }
      return selectedDutDuo;
    });
    checkAgroupGraphData();
  }

  useEffect(() => {
    if (state.groupGraph) {
      checkAgroupGraphData();
    }
  }, []);

  return (
    <div>
      {(!state.dateStart || !state.dateEnd) ? <NoGraph title={t('historicoDoDri')} /> : null}

      {(state.dateStart && state.dateEnd) && (
      <Flex flexWrap="wrap">
        <Box width={[1, 1, 1, 1, 2 / 3]} height={state.groupGraph ? returnSizeGraph(false) : '450px'} mb={30}>
          <GraphWrapper>
            {state.loading && (
            <Overlay>
              <Loader />
            </Overlay>
            )}
            <p style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>
              {t('temperaturas')}
            </p>
            {!state.loading && commonX && (
              <ResponsiveContainer>
                <LineChart
                  height={state.groupGraph ? returnSizeGraph(false) : 450}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                  data={commonX.map((_v, i) => i)}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={zoom}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    allowDataOverflow
                    type="number"
                    dataKey={(i) => commonX[i]}
                    tickFormatter={(hour) => (state.numDays && state.numDays > 1
                      ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))}
                    ticks={state.xTicks}
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
                      dataKey={(i) => commonX[i]}
                      ticks={state.xTicks}
                      domain={state.xDomain}
                    />
                  ) : null}
                  <YAxis
                    type="number"
                    yAxisId="Temperatura"
                    allowDataOverflow
                    dataKey="y"
                    tick={(
                      <CustomTick
                        application={application}
                        baseSetpointMinLimit={state.baseSetpointTicks[0]}
                        stepperGraph={stepperGraph}
                      />
                    )}
                    ticks={state.setpointTicks}
                    interval={0}
                    domain={state.yDomain}
                  >
                    <Label
                      content={() => (
                        <CustomLabel angle="-90" x="-230" y="38" color="#656565">
                          {t('temperaturaC')}
                        </CustomLabel>
                      )}
                    />
                  </YAxis>

                  <Tooltip
                    isAnimationActive={false}
                    cursor={{ stroke: 'red', strokeWidth: 1 }}
                    labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)}
                    formatter={toolTipFormater}
                  />
                  {tempAmb && tempAmb.checked && <Line name={tempAmb.name} key={tempAmb.name} yAxisId="Temperatura" type={tempAmb.type} dataKey={(i) => tempAmb.y[i]} dot={false} stroke={tempAmb.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={tempAmb.strokeDasharray} />}
                  {setpoint && setpoint.checked && <Line name={setpoint.name} key={setpoint.name} yAxisId="Temperatura" type={setpoint.type} dataKey={(i) => setpoint.y[i]} dot={false} stroke={setpoint.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={setpoint.strokeDasharray} />}
                  {dutTemp && dutTemp.checked && <Line name={dutTemp.name} key={dutTemp.name} yAxisId="Temperatura" type={dutTemp.type} dataKey={(i) => dutTemp.y[i]} dot={false} stroke={dutTemp.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={dutTemp.strokeDasharray} />}
                  {tusemax && tusemax.checked && <Line name={tusemax.name} key={tusemax.name} yAxisId="Temperatura" type={tusemax.type} dataKey={(i) => tusemax.y[i]} dot={false} stroke={tusemax.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={tusemax.strokeDasharray} />}
                  {ecoSetpoint && ecoSetpoint.checked && <Line name={ecoSetpoint.name} key={ecoSetpoint.name} yAxisId="Temperatura" type={ecoSetpoint.type} dataKey={(i) => ecoSetpoint.y[i]} dot={false} stroke={ecoSetpoint.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={ecoSetpoint.strokeDasharray} />}
                  {tusemin && tusemin.checked && <Line name={tusemin.name} key={tusemin.name} yAxisId="Temperatura" type={tusemin.type} dataKey={(i) => tusemin.y[i]} dot={false} stroke={tusemin.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={tusemin.strokeDasharray} />}
                  {isFancoil && state.associatedDutsDuo.map(({ chartData, show }) => (
                    chartData.Temperature && show?.Temperature && (
                    <Line
                      name={t('temperaturaSaidaAgua')}
                      key={t('temperaturaSaidaAgua')}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => ((chartData.Temperature?.y[i] != null) ? chartData.Temperature?.y[i] : null)}
                      dot={false}
                      stroke={getParamsColor(t('temperaturaSaidaAgua'))}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                    )
                  ))}
                  {isFancoil && state.associatedDutsDuo.map(({ chartData, show }) => (
                    chartData.Temperature_1 && show?.Temperature_1 && (
                    <Line
                      name={t('temperaturaEntradaAgua')}
                      key={t('temperaturaEntradaAgua')}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => ((chartData.Temperature_1?.y[i] != null) ? chartData.Temperature_1?.y[i] : null)}
                      dot={false}
                      stroke={getParamsColor(t('temperaturaEntradaAgua'))}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                    )
                  ))}

                  {isFancoil && state.associatedDacs?.map(({ chartData, show }) => (
                    chartData.vars?.Tsuc && show?.Tsuc && (
                    <Line
                      name={t('temperaturaSaidaAgua')}
                      key={t('temperaturaSaidaAgua')}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => ((chartData.vars?.Tsuc.y[i] != null) ? chartData.vars?.Tsuc.y[i] : null)}
                      dot={false}
                      stroke={getParamsColor(t('temperaturaSaidaAgua'))}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                    )
                  ))}
                  {isFancoil && state.associatedDacs?.map(({ chartData, show }) => (
                    chartData.vars?.Tliq && show?.Tliq && (
                    <Line
                      name={t('temperaturaEntradaAgua')}
                      key={t('temperaturaEntradaAgua')}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => ((chartData.vars?.Tliq.y[i] != null) ? chartData.vars?.Tliq.y[i] : null)}
                      dot={false}
                      stroke={getParamsColor(t('temperaturaEntradaAgua'))}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                    )
                  ))}
                  {isFancoil && state.associatedDacs?.map(({ chartData, show }) => (
                    chartData.vars?.Tamb && show?.Tamb && (
                    <Line
                      name={t('temperaturaArEntrada')}
                      key={t('temperaturaArEntrada')}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => ((chartData.vars?.Tamb.y[i] != null) ? chartData.vars?.Tamb.y[i] : null)}
                      dot={false}
                      stroke={getParamsColor(t('temperaturaArEntrada'))}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                    )
                  ))}

                  {!isFancoil && state.groupGraph && state.selectedDacs.map(({ dacId, chartData }, index) => (
                    chartData.vars?.Lcmp && (
                    <Line
                      name={`${t('sinalComando')} - ${index}`}
                      stroke={getParamsColor(`${t('sinalComando')} - ${index}`)}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => ((chartData.vars?.Lcmp.L[i] != null) ? state.customPointLimit + (chartData.vars?.Lcmp.L[i] + (index * 2)) : null)}
                      dot={false}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                      key={`line-${dacId}`}
                    />
                    )
                  ))}
                  {(isFancoil || isVav) && state.groupGraph && valveOn && (
                    <Line
                      name={valveOn.name}
                      key={valveOn.name}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => fancoilGroupGraphDataKey({ chartDataVar: valveOn, isChecked: state.valveOnChecked }, i, 2)}
                      dot={false}
                      stroke={valveOn.color}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                  )}
                  {isFancoil && state.groupGraph && fanStatus && (
                    <Line
                      name={fanStatus.name}
                      key={fanStatus.name}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => fancoilGroupGraphDataKey({ chartDataVar: fanStatus, isChecked: state.fanStatusChecked }, i, 1)}
                      dot={false}
                      stroke={fanStatus.color}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                  )}
                  {(isFancoil || isVav) && state.groupGraph && thermOn && (
                    <Line
                      name={thermOn.name}
                      key={thermOn.name}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => fancoilGroupGraphDataKey({ chartDataVar: thermOn, isChecked: state.thermOnChecked }, i, isFancoil ? 0 : 1)}
                      dot={false}
                      stroke={thermOn.color}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                  )}
                  {isVav && state.groupGraph && lock && (
                    <Line
                      name={lock.name}
                      key={lock.name}
                      yAxisId="Temperatura"
                      type="stepAfter"
                      dataKey={(i) => fancoilGroupGraphDataKey({ chartDataVar: lock, isChecked: state.lockChecked }, i, 0)}
                      dot={false}
                      stroke={lock.color}
                      strokeWidth={1.5}
                      animationDuration={300}
                      strokeDasharray=""
                    />
                  )}
                  {state.refAreaLeft && state.refAreaRight ? (
                    <ReferenceArea yAxisId="Temperatura" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            )}
          </GraphWrapper>
        </Box>
        <div style={{
          display: 'flex',
          justifyContent: 'right',
          flexDirection: 'column',
        }}
        >
          <button type="button" className="btn update" onClick={zoomOut} style={{ width: 'fit-content' }}>
            Zoom Out
          </button>
          {tempAmb && (
            <CheckboxLine style={{ marginTop: '10px' }}>
              <Checkbox
                checked={tempAmb.checked}
                onClick={() => { tempAmb.checked = !tempAmb.checked; render(); }}
              />
              <div>
                <div>
                  <Text>
                    {t('temperaturaAmbiente')}
                  </Text>
                  <ColoredLine color={tempAmb.color} />
                </div>
                <InfoText>
                  {t('termostatoAssociadoAoDRI')}
                </InfoText>
              </div>

            </CheckboxLine>
          )}
          {setpoint && (
            <CheckboxLine style={{ marginTop: '10px' }}>
              <Checkbox
                checked={setpoint.checked}
                onClick={() => { setpoint.checked = !setpoint.checked; render(); }}
              />
              <Text>
                {isCarrierEcosplit && <span>{t('setpointMaquina')}</span>}
                {(isFancoil || isVav) && <span>Setpoint</span>}
              </Text>
              {isCarrierEcosplit && <ColoredLine color={setpoint.color} />}
              {(isFancoil || isVav) && <DashedColoredLine color={setpoint.color} />}
            </CheckboxLine>
          )}
          {dutTemp && (
          <CheckboxLine style={{ marginTop: '10px' }}>
            <Checkbox
              checked={dutTemp.checked}
              onClick={() => { dutTemp.checked = !dutTemp.checked; render(); }}
            />
            <Text>
              {t('temperaturaVal', { value: state.driInfo?.ecoCfg?.DUT_ID })}
            </Text>
            <ColoredLine color={dutTemp.color} />
          </CheckboxLine>
          )}
          {ecoSetpoint && (
          <CheckboxLine style={{ marginTop: '10px' }}>
            <Checkbox
              checked={ecoSetpoint.checked}
              onClick={() => { ecoSetpoint.checked = !ecoSetpoint.checked; render(); }}
            />
            <Text>
              {t('setpointModoEco')}
            </Text>
            <DashedColoredLine color={ecoSetpoint.color} />
          </CheckboxLine>
          )}
          {tusemin && (
          <CheckboxLine style={{ marginTop: '10px' }}>
            <Checkbox
              checked={tusemin.checked}
              onClick={() => {
                tusemin.checked = !tusemin.checked;
                if (tusemax) {
                  tusemax.checked = !tusemax.checked;
                }
                render();
              }}
            />
            <Text>
              {t('limitesTemperatura')}
            </Text>
            <ColoredLine color={tusemin.color} />
          </CheckboxLine>
          )}
          {isFancoil && state.associatedDacsId?.map((dac) => (
            <CheckboxLine style={{ marginTop: '10px' }} key={`${t('temperaturaArEntrada')}-${dac.dacId}`}>
              <Checkbox
                checked={dac.temperatures.TambChecked}
                onClick={() => {
                  dac.temperatures.TambChecked = !dac.temperatures.TambChecked; render();
                  if (!dac.temperatures.TambChecked && state.associatedDacs) { state.associatedDacs = state.associatedDacs.map((selectedDac) => { if (selectedDac.dacId === dac.dacId) { selectedDac.show.Tamb = false; } return selectedDac; }); }
                  if (dac.temperatures.TambChecked && state.associatedDacs) { state.associatedDacs = state.associatedDacs.map((selectedDac) => { if (selectedDac.dacId === dac.dacId) { selectedDac.show.Tamb = true; } return selectedDac; }); }
                  checkAgroupGraphData();
                }}
              />
              <div>
                <div>
                  <Text>
                    { `${t('temperaturaArEntrada')}` }
                  </Text>
                  <ColoredLine color={getParamsColor(t('temperaturaArEntrada'))} />
                </div>
                <StyledLink to={`/analise/dispositivo/${dac.dacId}/informacoes`}>{dac.dacId}</StyledLink>
              </div>
            </CheckboxLine>
          ))}
          {isFancoil && state.associatedDacsId?.map((dac) => (
            <CheckboxLine style={{ marginTop: '10px' }} key={`${t('temperaturaSaidaAgua')}-${dac.dacId}`}>
              <Checkbox
                checked={dac.temperatures.TsucChecked}
                onClick={() => {
                  dac.temperatures.TsucChecked = !dac.temperatures.TsucChecked; render();
                  if (!dac.temperatures.TsucChecked && state.associatedDacs) { state.associatedDacs = state.associatedDacs.map((selectedDac) => { if (selectedDac.dacId === dac.dacId) { selectedDac.show.Tsuc = false; } return selectedDac; }); }
                  if (dac.temperatures.TsucChecked && state.associatedDacs) { state.associatedDacs = state.associatedDacs.map((selectedDac) => { if (selectedDac.dacId === dac.dacId) { selectedDac.show.Tsuc = true; } return selectedDac; }); }
                  checkAgroupGraphData();
                }}
              />
              <div>
                <div>
                  <Text>
                    { `${t('temperaturaSaidaAgua')}` }
                  </Text>
                  <ColoredLine color={getParamsColor(t('temperaturaSaidaAgua'))} />
                </div>
                <StyledLink to={`/analise/dispositivo/${dac.dacId}/informacoes`}>{dac.dacId}</StyledLink>
              </div>
            </CheckboxLine>
          ))}
          {isFancoil && state.associatedDacsId?.map((dac) => (
            <CheckboxLine style={{ marginTop: '10px' }} key={`${t('temperaturaEntradaAgua')}-${dac.dacId}`}>
              <Checkbox
                checked={dac.temperatures.TliqChecked}
                onClick={() => {
                  dac.temperatures.TliqChecked = !dac.temperatures.TliqChecked; render();
                  if (!dac.temperatures.TliqChecked && state.associatedDacs) { state.associatedDacs = state.associatedDacs.map((selectedDac) => { if (selectedDac.dacId === dac.dacId) { selectedDac.show.Tliq = false; } return selectedDac; }); }
                  if (dac.temperatures.TliqChecked && state.associatedDacs) { state.associatedDacs = state.associatedDacs.map((selectedDac) => { if (selectedDac.dacId === dac.dacId) { selectedDac.show.Tliq = true; } return selectedDac; }); }
                  checkAgroupGraphData();
                }}
              />
              <div>
                <div>
                  <Text>
                    { `${t('temperaturaEntradaAgua')}` }
                  </Text>
                  <ColoredLine color={getParamsColor(t('temperaturaEntradaAgua'))} />
                </div>
                <StyledLink to={`/analise/dispositivo/${dac.dacId}/informacoes`}>{dac.dacId}</StyledLink>
              </div>
            </CheckboxLine>
          ))}

          {isFancoil && state.associatedDutsDuoId.map((dutDuo) => (
            <CheckboxLine style={{ marginTop: '10px' }} key={`${t('temperaturaSaidaAgua')}-${dutDuo.dutDuoId}`}>
              <Checkbox
                checked={dutDuo.temperatures.Temperature}
                onClick={() => onClickDutDuoCheckboxTemperature(dutDuo, 'Temperature')}
              />
              <div>
                <div>
                  <Text>
                    { `${t('temperaturaSaidaAgua')}` }
                  </Text>
                  <ColoredLine color={getParamsColor(t('temperaturaSaidaAgua'))} />
                </div>
                <StyledLink to={`/analise/dispositivo/${dutDuo.dutDuoId}/informacoes`}>{dutDuo.dutDuoId}</StyledLink>
              </div>
            </CheckboxLine>
          ))}

          {isFancoil && state.associatedDutsDuoId.map((dutDuo) => (
            <CheckboxLine style={{ marginTop: '10px' }} key={`${t('temperaturaEntradaAgua')}-${dutDuo.dutDuoId}`}>
              <Checkbox
                checked={dutDuo.temperatures.Temperature_1}
                onClick={() => onClickDutDuoCheckboxTemperature(dutDuo, 'Temperature_1')}
              />
              <div>
                <div>
                  <Text>
                    { `${t('temperaturaEntradaAgua')}` }
                  </Text>
                  <ColoredLine color={getParamsColor(t('temperaturaEntradaAgua'))} />
                </div>
                <StyledLink to={`/analise/dispositivo/${dutDuo.dutDuoId}/informacoes`}>{dutDuo.dutDuoId}</StyledLink>
              </div>
            </CheckboxLine>
          ))}

          {state.groupGraph && (isFancoil || isVav) && valveOn && (
          <CheckboxLine style={{ marginTop: 'auto' }}>
            <Checkbox
              checked={state.valveOnChecked}
              onClick={() => {
                state.valveOnChecked = !state.valveOnChecked;
                render();
              }}
            />
            <Text>
              {valveOn.name}
            </Text>
            <ColoredLine color={valveOn.color} />
          </CheckboxLine>
          )}
          {state.groupGraph && isFancoil && fanStatus && (
          <CheckboxLine style={{ marginTop: '10px' }}>
            <Checkbox
              checked={state.fanStatusChecked}
              onClick={() => {
                state.fanStatusChecked = !state.fanStatusChecked;
                render();
              }}
            />
            <Text>
              {fanStatus.name}
            </Text>
            <ColoredLine color={fanStatus.color} />
          </CheckboxLine>
          )}
          {state.groupGraph && (isFancoil || isVav) && thermOn && (
          <CheckboxLine style={{ marginTop: '10px' }}>
            <Checkbox
              checked={state.thermOnChecked}
              onClick={() => {
                state.thermOnChecked = !state.thermOnChecked;
                render();
              }}
            />
            <Text>
              {thermOn.name}
            </Text>
            <ColoredLine color={thermOn.color} />
          </CheckboxLine>
          )}
          {state.groupGraph && isVav && lock && (
            <CheckboxLine style={{ marginTop: '10px' }}>
              <Checkbox
                checked={state.lockChecked}
                onClick={() => {
                  state.lockChecked = !state.lockChecked;
                  render();
                }}
              />
              <Text>
                {lock.name}
              </Text>
              <ColoredLine color={lock.color} />
            </CheckboxLine>
          )}
          <div style={{ marginTop: state.selectedDacs && !isFancoil && state.selectedDacs.length > 0 ? `${200 + (state.selectedDacs.length * 50)}px` : '0' }}>
            {state.groupGraph && state.associatedDacsId.map((dac, index) => (
              <CheckboxLine style={{ marginTop: '10px' }} key={`${t('sinalComando')}-${dac.dacId}`}>
                <Checkbox
                  checked={dac.checked}
                  onClick={() => {
                    dac.checked = !dac.checked; render();
                    if (!dac.checked && state.selectedDacs) state.selectedDacs = state.associatedDacs.filter((selectedDac) => selectedDac.dacId !== dac.dacId);
                    if (dac.checked && state.selectedDacs) state.selectedDacs = state.associatedDacs;
                    checkAgroupGraphData();
                  }}
                />
                <Text>
                  {isFancoil ? t('monitoramentoDaValvula') : dac.dacId}
                </Text>
                <ColoredLine color={getParamsColor(isFancoil ? t('sinalComando') : `${t('sinalComando')} - ${index}`)} />
              </CheckboxLine>
            ))}
          </div>
        </div>

        {isCarrierEcosplit && !state.groupGraph && !!state.associatedDacs?.length && (
        <Box width={[1, 1, 1, 1, 2 / 3]} mt={20} mb={30}>
          <GraphWrapper>
            {state.loading && (
            <Overlay>
              <Loader />
            </Overlay>
            )}
            <Box height="30px">
              <p style={{
                fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px', marginBottom: '2px',
              }}
              >
                {t('compressores')}
              </p>
              <p style={{ marginLeft: '20px' }}>{t('statusL1')}</p>
            </Box>
            {!state.loading && state.associatedDacs.map(({ dacId, chartData }, index) => (
              <Box height={state.numDays === 1 ? '85px' : '100px'} mt={10} mb={50} key={`box-${dacId}`}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <h3 style={{ padding: '20px', textDecoration: 'underline', color: '#363BC4' }}>
                    {dacId}
                  </h3>
                  <div style={{
                    height: '6px', width: '60px', backgroundColor: getParamsColor(`${t('sinalComando')} - ${index}`), borderRadius: '5px', marginBottom: '9px',
                  }}
                  />
                </div>
                <ResponsiveContainer>
                  <LineChart
                    height={350}
                    margin={{
                      top: 3, right: 30, left: 20, bottom: 5,
                    }}
                    data={commonX.map((_v, i) => i)}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={zoom}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      allowDataOverflow
                      type="number"
                      dataKey={(i) => commonX[i]}
                      tickFormatter={(hour) => (state.numDays && state.numDays > 1
                        ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))}
                      ticks={state.xTicks}
                      domain={state.xDomain}
                    />
                    {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                    <YAxis type="number" yAxisId="Lcmp" allowDataOverflow dataKey="y" tick={<CustomCompressorTickMode />} ticks={[0, 1]} interval={0} domain={[0, 1]} />

                    <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormaterDac} />
                    {chartData.vars?.Lcmp && (
                      <Line
                        name={`${t('sinalComando')} - ${index}`}
                        key={`${t('sinalComando')} - ${index}`}
                        stroke={getParamsColor(`${t('sinalComando')} - ${index}`)}
                        yAxisId="Lcmp"
                        type="stepAfter"
                        dataKey={(i) => chartData.vars?.Lcmp.L[i]}
                        dot={false}
                        strokeWidth={1.5}
                        animationDuration={300}
                        strokeDasharray=""
                      />
                    )}
                    {state.refAreaLeft && state.refAreaRight ? (
                      <ReferenceArea yAxisId="Lcmp" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ))}
          </GraphWrapper>
        </Box>
        )}

        {isCarrierEcosplit && (
          <Box width={[1, 1, 1, 1, 2 / 3]} minHeight="250px">
            <GraphWrapper>
              {state.loading && (
                <Overlay>
                  <Loader />
                </Overlay>
              )}
              <p style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('modoOperacao')}</p>
              {!state.loading && (
                <ResponsiveContainer height="60%">
                  <LineChart
                    height={350}
                    margin={{
                      top: 5, right: 30, left: 20, bottom: 5,
                    }}
                    data={commonX.map((_v, i) => i)}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={zoom}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                    {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                    <YAxis type="number" yAxisId="OperationMode" allowDataOverflow dataKey="y" tick={<CustomTickMode />} ticks={state.modeTicks} interval={0} domain={state.modeLimits} />

                    <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                    {operationMode && <Line name={operationMode.name} key={operationMode.name} yAxisId={operationMode.axisId} type={operationMode.type} dataKey={(i) => operationMode.y[i]} dot={false} stroke={operationMode.color} strokeWidth={1.5} animationDuration={300} strokeDasharray={operationMode.strokeDasharray} />}
                    {state.refAreaLeft && state.refAreaRight ? (
                      <ReferenceArea yAxisId="OperationMode" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GraphWrapper>
          </Box>
        )}
        {isVav && profile.manageAllClients && (
          <Box width={[1, 1, 1, 1, 2 / 3]} height="135px" mt={20} mb={30}>
            <GraphWrapper>
              {state.loading && (
              <Overlay>
                <Loader />
              </Overlay>
              )}
              <p style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('modoOperacao')}</p>
              {!state.loading && (
              <ResponsiveContainer>
                <LineChart
                  height={350}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                  data={commonX.map((_v, i) => i)}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={zoom}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                  {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                  <YAxis type="number" yAxisId="Mode" allowDataOverflow dataKey="y" tick={<CustomTickVAV id="Mode" />} ticks={state.vavModeTicks} interval={0} domain={state.vavModeLimits} />

                  <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                  {mode && <Line name={mode.name} key={mode.name} yAxisId={mode.axisId} type={mode.type} dataKey={(i) => mode.y[i]} dot={false} stroke={mode.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={mode.strokeDasharray} />}
                  {state.refAreaLeft && state.refAreaRight ? (
                    <ReferenceArea yAxisId="Mode" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
              )}
            </GraphWrapper>
          </Box>
        )}
        {isVav && !state.groupGraph && (
          <>
            <Box width={[1, 1, 1, 1, 2 / 3]} height="85px" mt={20} mb={30}>
              <GraphWrapper>
                {state.loading && (
                  <Overlay>
                    <Loader />
                  </Overlay>
                )}
                <p style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('termostato')}</p>
                {!state.loading && (
                  <ResponsiveContainer>
                    <LineChart
                      height={350}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      data={commonX.map((_v, i) => i)}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={zoom}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                      {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                      <YAxis type="number" yAxisId="ThermOn" allowDataOverflow dataKey="y" tick={<CustomTickVAV id="ThermOn" />} ticks={[0, 1]} interval={0} domain={[0, 1]} />
                      <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                      {thermOn && <Line name={thermOn.name} key={thermOn.name} yAxisId={thermOn.axisId} type={thermOn.type} dataKey={(i) => thermOn.y[i]} dot={false} stroke={thermOn.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={thermOn.strokeDasharray} />}
                      {state.refAreaLeft && state.refAreaRight ? (
                        <ReferenceArea yAxisId="ThermOn" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GraphWrapper>
            </Box>
            <Box width={[1, 1, 1, 1, 2 / 3]} height="85px" mt={20} mb={30}>
              <GraphWrapper>
                {state.loading && (
                  <Overlay>
                    <Loader />
                  </Overlay>
                )}
                <p style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('atuadorVav')}</p>
                {!state.loading && (
                  <ResponsiveContainer>
                    <LineChart
                      height={350}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      data={commonX.map((_v, i) => i)}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={zoom}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                      {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                      <YAxis type="number" yAxisId="ValveOn" allowDataOverflow dataKey="y" tick={<CustomTickVAV id="ValveOn" />} ticks={[0, 1]} interval={0} domain={[0, 1]} />

                      <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                      {valveOn && <Line name={valveOn.name} key={valveOn.name} yAxisId={valveOn.axisId} type={valveOn.type} dataKey={(i) => valveOn.y[i]} dot={false} stroke={valveOn.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={valveOn.strokeDasharray} />}
                      {state.refAreaLeft && state.refAreaRight ? (
                        <ReferenceArea yAxisId="ValveOn" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GraphWrapper>
            </Box>
            <Box width={[1, 1, 1, 1, 2 / 3]} height="85px" mt={20} mb={30}>
              <GraphWrapper>
                {state.loading && (
                  <Overlay>
                    <Loader />
                  </Overlay>
                )}
                <p style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>
                  {t('Bloqueio')}
                  <span style={{ fontWeight: 'normal' }}> (Termostato)</span>
                </p>
                {!state.loading && (
                  <ResponsiveContainer>
                    <LineChart
                      height={350}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      data={commonX.map((_v, i) => i)}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={zoom}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                      {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                      <YAxis type="number" yAxisId="Lock" allowDataOverflow dataKey="y" tick={<CustomTickVAV id="Lock" />} ticks={[0, 1]} interval={0} domain={[0, 1]} />
                      <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                      {lock && <Line name={lock.name} key={lock.name} yAxisId={lock.axisId} type={lock.type} dataKey={(i) => lock.y[i]} dot={false} stroke={lock.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={lock.strokeDasharray} />}
                      {state.refAreaLeft && state.refAreaRight ? (
                        <ReferenceArea yAxisId="Lock" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GraphWrapper>
            </Box>
          </>
        )}

        {isFancoil && (
          <Box width={[1, 1, 1, 1, 2 / 3]} height="130px" mt={20} mb={30}>
            <GraphWrapper>
              {state.loading && (
              <Overlay>
                <Loader />
              </Overlay>
              )}
              <Flex flexDirection="row" alignItems="center" mb="10px">
                <span style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('modoOperacao')}</span>
                <ColoredLine color={operationMode?.color || colors.Red} />
              </Flex>

              {!state.loading && (
              <ResponsiveContainer>
                <LineChart
                  height={350}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                  data={commonX.map((_v, i) => i)}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={zoom}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                  {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                  <YAxis
                    type="number"
                    yAxisId="OperationMode"
                    allowDataOverflow
                    dataKey="y"
                    tick={<CustomTickFancoil id="OperationMode" />}
                    ticks={state.fancoilModeTicks}
                    interval={0}
                    domain={state.fancoilModeLimits}
                  />

                  <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                  {operationMode && <Line name={operationMode.name} key={operationMode.name} yAxisId={operationMode.axisId} type={operationMode.type} dataKey={(i) => operationMode.y[i]} dot={false} stroke={operationMode.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={operationMode.strokeDasharray} />}
                  {state.refAreaLeft && state.refAreaRight ? (
                    <ReferenceArea yAxisId="OperationMode" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
              )}
            </GraphWrapper>
          </Box>
        )}
        {isFancoil && !state.groupGraph && (
          <>
            <Box width={[1, 1, 1, 1, 2 / 3]} height="85px" mt={20} mb={30}>
              <GraphWrapper>
                {state.loading && (
                  <Overlay>
                    <Loader />
                  </Overlay>
                )}
                <Flex flexDirection="row" alignItems="center" mb="10px">
                  <span style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('valvulaDeAgua')}</span>
                  <ColoredLine color={valveOn?.color || colors.BlueChart} />
                </Flex>

                {!state.loading && (
                  <ResponsiveContainer>
                    <LineChart
                      height={350}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      data={commonX.map((_v, i) => i)}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={zoom}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                      {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                      <YAxis type="number" yAxisId="ValveOn" allowDataOverflow dataKey="y" tick={<CustomTickFancoil id="ValveOn" />} ticks={[0, 1]} interval={0} domain={[0, 1]} />

                      <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                      {valveOn && <Line name={valveOn.name} key={valveOn.name} yAxisId={valveOn.axisId} type={valveOn.type} dataKey={(i) => valveOn.y[i]} dot={false} stroke={valveOn.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={valveOn.strokeDasharray} />}
                      {state.refAreaLeft && state.refAreaRight ? (
                        <ReferenceArea yAxisId="ValveOn" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GraphWrapper>
            </Box>
            <Box width={[1, 1, 1, 1, 2 / 3]} height="85px" mt={20} mb={30}>
              <GraphWrapper>
                {state.loading && (
                  <Overlay>
                    <Loader />
                  </Overlay>
                )}
                <Flex flexDirection="row" alignItems="center" mb="10px">
                  <span style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('ventilador')}</span>
                  <ColoredLine color={fanStatus?.color || colors.BlueChart} />
                </Flex>

                {!state.loading && (
                  <ResponsiveContainer>
                    <LineChart
                      height={350}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      data={commonX.map((_v, i) => i)}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={zoom}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis allowDataOverflow type="number" dataKey={(i) => commonX[i]} tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))} ticks={state.xTicks} domain={state.xDomain} />
                      {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                      <YAxis type="number" yAxisId="FanStatus" allowDataOverflow dataKey="y" tick={<CustomTickFancoil id="FanStatus" />} ticks={[0, 1]} interval={0} domain={[0, 1]} />

                      <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                      {fanStatus && <Line name={fanStatus.name} key={fanStatus.name} yAxisId={fanStatus.axisId} type={fanStatus.type} dataKey={(i) => fanStatus.y[i]} dot={false} stroke={fanStatus.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={fanStatus.strokeDasharray} />}
                      {state.refAreaLeft && state.refAreaRight ? (
                        <ReferenceArea yAxisId="FanStatus" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GraphWrapper>
            </Box>
            <Box width={[1, 1, 1, 1, 2 / 3]} height="85px" mt={20} mb={50}>
              <GraphWrapper>
                {state.loading && (
                  <Overlay>
                    <Loader />
                  </Overlay>
                )}
                <Flex flexDirection="row" alignItems="center" mb="10px">
                  <span style={{ fontWeight: 'bold', fontSize: 'medium', marginLeft: '20px' }}>{t('termostato')}</span>
                  <ColoredLine color={thermOn?.color || colors.BlueChart} />
                </Flex>
                {!state.loading && (
                  <ResponsiveContainer>
                    <LineChart
                      height={350}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                      data={commonX.map((_v, i) => i)}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={zoom}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        allowDataOverflow
                        type="number"
                        dataKey={(i) => commonX[i]}
                        tickFormatter={(hour) => (state.numDays && state.numDays > 1 ? tickXLabelFormatterDay(hour, state.dateStart) : tickXLabelFormatterHour(hour))}
                        ticks={state.xTicks}
                        domain={state.xDomain}
                      />
                      {state.numDays && state.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={renderQuarterTickHour} type="number" dataKey={(i) => commonX[i]} ticks={state.xTicks} domain={state.xDomain} />) : null}
                      <YAxis type="number" yAxisId="ThermOn" allowDataOverflow dataKey="y" tick={<CustomTickFancoil id="ThermOn" />} ticks={[0, 1]} interval={0} domain={[0, 1]} />
                      <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={(hour) => tooltipXLabelFormatter(hour, state.dateStart)} formatter={toolTipFormater} />
                      {thermOn && <Line name={thermOn.name} key={thermOn.name} yAxisId={thermOn.axisId} type={thermOn.type} dataKey={(i) => thermOn.y[i]} dot={false} stroke={thermOn.color} strokeWidth={2.5} animationDuration={300} strokeDasharray={thermOn.strokeDasharray} />}
                      {state.refAreaLeft && state.refAreaRight ? (
                        <ReferenceArea yAxisId="ThermOn" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </GraphWrapper>
            </Box>
          </>
        )}
      </Flex>
      )}
    </div>
  );
};
