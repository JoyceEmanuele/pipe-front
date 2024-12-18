import {
  OrderColumnArrow, PopoverContent, TitleColumn,
} from '../../../components/Table/styles';
import {
  ArrowDownAnalisys, ArrowRightIcon, BadSignalIcon, ChipIcon, CompDisabled, Compressor, CoolIcon, FanBlueIcon, GoodSignalIcon, GreatSignalIcon, IconHIndex100, IconHIndex2, IconHIndex25, IconHIndex4, IconHIndex50, IconHIndex75, NoSignalIcon, OnIcon, OpenTab, ProgIcon, RegularSignalIcon,
} from '~/icons';
import { healthLevelColor } from '~/components/HealthIcon';
import {
  ButtonArrow,
  ContainerProg, IconWrapper, PopoverContainerDevAut, PopoverContentDevAut, UnitLink,
} from './styles';
import { getCardColor } from '../Units/UnitDetail/UnitDetailDUTs';
import { t } from 'i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import TooltipWhite from '~/components/SlidingBannerTooltip';
import { useCallback, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';

const openArrows = (type, state, setState, render) => {
  const newStateData = state.listMachine.map((item) => {
    item.toogleAsset = type;
    return item;
  });
  setState({ listMachine: newStateData });
  render();
};

const toogleAsset = (machineId, state, setState) => {
  const newStateData = state.listMachine.map((item) => {
    if (item.MACHINE_ID === machineId) {
      item.toogleAsset = !item.toogleAsset;
    }
    return item;
  });
  setState({ listMachine: newStateData });
};

export const ArrowValue = (
  machineId, state, setState, assetOpen, hasAsset, styled?,
) => {
  if (hasAsset !== 0) {
    return (
      <ButtonArrow
        onClick={() => toogleAsset(machineId, state, setState)}
        type="button"
      >
        {
          assetOpen ? <ArrowDownAnalisys /> : <ArrowRightIcon color="black" />
        }
      </ButtonArrow>
    );
  }
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'center', maxWidth: 25, height: 50, alignItems: 'center',
      }}
    />
  );
};

export function GenerateItemColumnArrow(accessor, state, setState, render, value): JSX.Element {
  return (
    <TitleColumn
      key={`accessor_${accessor}`}
      onClick={() => {
        openArrows(!value, state, setState, render);
        setState({ arrowValue: !value });
      }}
      style={{ height: '100%', display: 'flex', alignItems: 'flex-start' }}
    >
      <OrderColumnArrow style={{ height: '63%' }}>
        { !value ? <ArrowRightIcon color="black" /> : <ArrowDownAnalisys /> }
      </OrderColumnArrow>
    </TitleColumn>
  );
}

export function GenerateColorIcon(value, padding?) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'center', width: '100%', padding,
      }}
    >
      {
        (order.includes(value)) ? (
          <IconWrapper style={{ backgroundColor: healthLevelColor(value) }}>
            {formatHealthIcon(value)}
          </IconWrapper>
        ) : '-'
      }
    </div>
  );
}

export function formatHealthIcon(health, color = 'white') {
  switch (health) {
    case 25: return <IconHIndex25 />;
    case 50: return <IconHIndex50 />;
    case 75: return <IconHIndex75 />;
    case 100: return <IconHIndex100 />;
    case 4: return <IconHIndex4 />;
    default: return <IconHIndex2 />;
  }
}

export function GenerateConectionIcon(value) {
  if (value === 'ONLINE') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <GreatSignalIcon width="12px" heigth="12px" />
      </div>
    );
  }
  return <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>-</div>;
}

export function GenerateIconWifiColumn(value) {
  switch (value) {
    case 'Excelente': return <GreatSignalIcon />;
    case 'Bom': return <GoodSignalIcon />;
    case 'Regular': return <RegularSignalIcon />;
    case 'Ruim': return <BadSignalIcon />;
    default: return <NoSignalIcon />;
  }
}

export function GenerateColumnWithValue(value, unit) {
  if (value && unit) {
    return `${value}${unit}`;
  }
  return '-';
}

export function ValueNumberFormatComma(value, sufix, key, padding?) {
  if (value) {
    return (
      <span key={key} style={{ fontSize: 11, padding: (padding || '0px 10px') }}>
        {formatNumberWithFractionDigits(value, { minimum: 0, maximum: 2 })}
        {' '}
        {sufix}
      </span>
    );
  }
  return <span style={{ fontSize: 11, padding: (padding || '0px 10px') }}>-</span>;
}

export function GenerateIconAutomationValue({
  value, prog, setpoint, operationMode, enableEco, setState, render, client, unit,
}) {
  if (value) {
    let progValidation = true;
    const parseProg = JSON.parse(prog);
    if (!parseProg || Object.keys(parseProg.week).length === 0) {
      progValidation = false;
    }
    return (
      <ContainerProg>
        <PopoverDevAut devAut={value} />
        {progValidation && (
          <div onClick={() => { setState({
            showSched: true,
            schedInfo: {
              device: value,
              sched: prog,
              setpoint,
              operationMode,
              enableEco,
              client,
              unit,
            },
          }); render(); }}
          >
            <ProgIcon size="15px" />
          </div>
        )}
      </ContainerProg>
    );
  }
  return <></>;
}

export function PopoverDevAut({
  devAut,
}): JSX.Element {
  const [onOpenPopover, setOnOpenPopover] = useState(false);

  return (
    <Popover.Root open={onOpenPopover} onOpenChange={setOnOpenPopover}>
      <Popover.Trigger asChild>
        <div onClick={() => setOnOpenPopover((prev) => !prev)}>
          <ChipIcon />
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="center"
          className="PopoverContent"
          side="top"
        >
          <PopoverContainerDevAut>
            <PopoverContentDevAut>
              <h4><strong>{t('dispositivo')}</strong></h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <UnitLink
                  target="_blank"
                  rel="noopener noreferrer"
                  to={`/analise/dispositivo/${devAut}/informacoes`}
                >
                  {devAut}
                </UnitLink>
                <UnitLink
                  target="_blank"
                  rel="noopener noreferrer"
                  to={`/analise/dispositivo/${devAut}/informacoes`}
                >
                  <OpenTab />
                </UnitLink>
              </div>
            </PopoverContentDevAut>
          </PopoverContainerDevAut>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function progReturn(week, day) {
  if (week[day]?.permission === 'forbid') {
    return <p style={{ margin: 0, fontSize: 11 }}>{t('desligadoMinusculo')}</p>;
  }
  if (week[day]?.permission === 'allow') {
    return (
      <>
        <p style={{ margin: 0, fontSize: 11 }}>{week[day]?.start}</p>
        <p style={{ margin: 0, fontSize: 11 }}>-</p>
        <p style={{ margin: 0, fontSize: 11 }}>{week[day]?.end}</p>
      </>
    );
  }
  return <p style={{ margin: 0, fontSize: 11 }} />;
}

export function ValueProgDayWeek(prog, day, dev_aut, multi_scheds: {
  sun: boolean,
  mon: boolean,
  tue: boolean,
  wed: boolean,
  thu: boolean,
  fri: boolean,
  sat: boolean,
}) {
  if (prog && dev_aut) {
    const progParse = JSON.parse(prog);
    const week = progParse.week;
    if (!week || Object.keys(week).length === 0) {
      return <></>;
    }
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', lineHeight: '8.24px', padding: '0px 10px', alignItems: 'center',
        }}
      >
        {
          (multi_scheds && multi_scheds[day]) ? (
            <p style={{ margin: 0, fontSize: 11 }}>Mult. progs.</p>
          ) : progReturn(week, day)
        }
      </div>
    );
  }
  return <></>;
}

export function ColumnTemperature(
  value,
  isSetPoint,
  connection,
  nameEnv?,
  min?,
  max?,
  isTemperature?,
) {
  const color = getCardColor(value, null, min, max);

  // Função auxiliar para renderizar o conteúdo
  const renderContent = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '0px 16px',
        fontSize: 11,
        fontFamily: 'Inter',
      }}
    >
      {!isSetPoint && (
        <div
          style={{
            backgroundColor: color,
            width: 13,
            height: 13,
            borderRadius: 2,
          }}
        />
      )}
      <strong>{`${formatNumberWithFractionDigits(value, { minimum: 0, maximum: 2 })} `}</strong>
      °C
    </div>
  );

  if (value && connection === 'ONLINE') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '0px 16px',
          fontSize: 11,
          fontFamily: 'Inter',
        }}
      >
        { nameEnv && isTemperature ? (
          <TooltipWhite text={nameEnv} maxChart={0} width="150px">
            {renderContent()}
          </TooltipWhite>
        ) : (
          <>
            {renderContent()}
          </>
        )}
      </div>
    );
  }

  return <span style={{ padding: '0px 16px' }}>-</span>;
}

export function GenerateColumnValue(value, padding?) {
  if (value != null) {
    return <span style={{ padding }}>{`${value}`}</span>;
  }
  return <span style={{ padding }}>-</span>;
}

export function GenerateColumnValueEco(value, padding?) {
  if (value !== null) {
    const valueEco = value === 0 ? t('desabilitado') : t('habilitado');
    return <span style={{ padding }}>{`${valueEco}`}</span>;
  }
  return <span style={{ padding }}>-</span>;
}

export function ValueMachineTypeFormated(value, key) {
  if (value) {
    const newValue = value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return <span key={key}>{newValue[0].toUpperCase() + newValue.substr(1)}</span>;
  }
  return <>-</>;
}

const order = [25, 50, 75, 100, 2, 4];

export function ValueMachineHealth(assets, key) {
  if (!assets) return <></>;

  const counts = {
    25: 0, 50: 0, 75: 0, 100: 0, 4: 0, 2: 0,
  };

  assets.forEach((item) => {
    const index = item.H_INDEX;
    const device = item.DEVICE_CODE;
    if (index == null || device == null) return;
    if (index === 1) {
      counts[2]++;
    } else if (index in counts) {
      counts[index]++;
    }
  });

  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-evenly', fontFamily: 'Inter', fontSize: 11,
      }}
    >
      {order.map((index) => (
        counts[index] > 0 && (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {GenerateColorIcon(index)}
            {counts[index]}
          </div>
        )
      ))}
    </div>
  );
}

export function ValueMachineConection(assets, dev_aut_conn, dev_aut, key) {
  if (!assets && !dev_aut) return <></>;
  let countOn = dev_aut_conn === 'ONLINE' ? 1 : 0;
  assets.forEach((item) => {
    if (item.STATUS_WIFI === 'ONLINE' && item.DEVICE_CODE !== dev_aut) {
      countOn++;
    }
  });
  return (
    <div
      key={key}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {countOn > 0 ? (
        <>
          <GreatSignalIcon width="12px" heigth="12px" />
          <span>{countOn}</span>
        </>
      ) : <>-</>}
    </div>
  );
}

export function ValueMachineControlMode(value, device, eco, key) {
  if (device) {
    let modeValue = '-';
    if (value && value !== '') {
      modeValue = valuesControlMode[value].name;
    }
    if (device.startsWith('DAM') && eco === 1) {
      modeValue = t('modoEco');
    }
    return (
      <div key={key}>
        <span>{modeValue}</span>
      </div>
    );
  }
  return <>-</>;
}

export const LinkedStringLabel = (value, unitId, isUnit) => {
  const haveInfo = value !== null && value !== undefined && value !== '';
  if (haveInfo) {
    return (
      <div style={{ padding: '0px 7px' }}>
        <UnitLink
          style={{ color: 'black' }}
          to={isUnit ? `/analise/unidades/${unitId}` : `/analise/dispositivo/${value}/informacoes`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </UnitLink>
      </div>
    );
  }
  return (<></>);
};

export const LinkedStringLabelMachine = (value, link) => {
  const haveInfo = value !== null && value !== undefined && value !== '';
  if (haveInfo) {
    let newValue = value;
    if (value.length > 50) {
      newValue = `${value.slice(0, 50)}...`;
    }
    return (
      <div>
        <TooltipWhite text={value} maxChart={50}>
          <UnitLink
            target="_blank"
            rel="noopener noreferrer"
            to={link}
          >
            {newValue}
          </UnitLink>
        </TooltipWhite>
      </div>
    );
  }
  return (<></>);
};

export const ValueStateMachine = (value, connection) => {
  if (value && connection === 'ONLINE') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {valuesControlState[value]?.icon}
        <span>{valuesControlState[value]?.name}</span>
      </div>
    );
  }
  return <>-</>;
};

export const ValueStateAssetMachine = (value, type, conn) => {
  if (value && type && value != null && conn === 'ONLINE') {
    const newValue = value === 'Disabled' ? value : 'Others';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {valuesAssetsStateDevice[type][newValue]?.icon}
        <span>{valuesAssetsStateDevice[type][newValue]?.name}</span>
      </div>
    );
  }
  return <>-</>;
};

export const controlColumnsMachineConfigs = [
  {
    id: 'CLIENT_NAME',
    visible: true,
    label: t('cliente'),
  },
  {
    id: 'STATE_NAME',
    visible: true,
    label: t('estado'),
  },
  {
    id: 'CITY_NAME',
    visible: true,
    label: t('cidade'),
  },
  {
    id: 'UNIT_NAME',
    visible: true,
    label: t('unidade'),
  },
  {
    id: 'MACHINE_NAME',
    visible: true,
    label: t('maquina'),
  },
  {
    id: 'tipoMaquina',
    visible: true,
    label: t('tipoMaquina'),
  },
  // {
  //   id: 'STATE',
  //   visible: true,
  //   label: t('status'),
  // },
  {
    id: 'saudeAtual',
    visible: true,
    label: t('saudeAtual'),
  },
  {
    id: 'SETPOINT',
    visible: true,
    label: t('setpoint'),
  },
  // {
  //   id: 'TEMPERATURE',
  //   visible: true,
  //   label: t('tempAmb'),
  // },
  // {
  //   id: 'TEMPERATURE1',
  //   visible: false,
  //   label: t('tempRetorno'),
  // },
  {
    id: 'DEV_AUT',
    visible: true,
    label: t('automacao'),
  },
  {
    id: 'MODE',
    visible: true,
    label: t('modoOperacao'),
  },
  {
    id: 'LAST_PROG_MON',
    visible: true,
    label: t('diasDaSemana.seg'),
  },
  {
    id: 'LAST_PROG_TUE',
    visible: true,
    label: t('diasDaSemana.ter'),
  },
  {
    id: 'LAST_PROG_WED',
    visible: true,
    label: t('diasDaSemana.qua'),
  },
  {
    id: 'LAST_PROG_THU',
    visible: true,
    label: t('diasDaSemana.qui'),
  },
  {
    id: 'LAST_PROG_FRI',
    visible: true,
    label: t('diasDaSemana.sex'),
  },
  {
    id: 'LAST_PROG_SAT',
    visible: true,
    label: t('diasDaSemana.sab'),
  },
  {
    id: 'LAST_PROG_SUN',
    visible: true,
    label: t('diasDaSemana.dom'),
  },
  {
    id: 'TOTAL_DEV_COUNT',
    visible: true,
    label: t('dispositivos'),
  },
  {
    id: 'conexao',
    visible: true,
    label: t('conexao'),
  },
  {
    id: 'MCHN_BRAND',
    visible: false,
    label: t('fabricante'),
  },
  {
    id: 'MODEL',
    visible: false,
    label: t('modelo'),
  },
  {
    id: 'TOTAL_CAPACITY_CONDENSER',
    visible: true,
    label: t('capacidadeRefrigeracao'),
  },
  {
    id: 'RATED_POWER',
    visible: true,
    label: `${t('potencia')} (kW)`,
  },
];

export const totalParametersColumns = [{
  column: t('unidades'),
  value: 'TOTAL_UNITS',
  unit: '',
},
{
  column: t('estados'),
  value: 'TOTAL_STATE',
  unit: '',
},
{
  column: t('cidades'),
  value: 'TOTAL_CITY',
  unit: '',
},
{
  column: t('maquinas'),
  value: 'TOTAL_MACHINES',
  unit: '',
},
{
  column: t('ativos'),
  value: 'TOTAL_ASSETS',
  unit: '',
},
{
  column: t('capRefrig'),
  value: 'TOTAL_CAPACITY_PWR',
  unit: 'TR',
},
{
  column: t('potencia'),
  value: 'TOTAL_MACHINE_KW',
  unit: 'kW',
}];

export const valuesControlMode = {
  '0_NO_CONTROL': {
    name: t('desabilitado'),
    tags: ['0_NO_CONTROL'],
    hide: false,
  },
  '1_CONTROL': {
    name: t('modoEco'),
    tags: ['1_CONTROL'],
    hide: false,
  },
  '2_SOB_DEMANDA': {
    name: t('modoSobDemanda'),
    tags: ['2_SOB_DEMANDA'],
    hide: false,
  },
  '3_BACKUP': {
    name: t('modoBackup'),
    tags: ['3_BACKUP'],
    hide: false,
  },
  '4_BLOCKED': {
    name: t('modoBloqueio'),
    tags: ['4_BLOCKED'],
    hide: false,
  },
  '5_BACKUP_CONTROL': {
    name: t('modoBackupEco'),
    tags: ['5_BACKUP_CONTROL'],
    hide: false,
  },
  '6_BACKUP_CONTROL_V2': {
    name: t('modoEco2'),
    tags: ['6_BACKUP_CONTROL_V2', '8_ECO_2'],
    hide: false,
  },
  '7_FORCED': {
    name: t('modoForcado'),
    tags: ['7_FORCED'],
    hide: false,
  },
  '8_ECO_2': {
    name: t('modoEco2'),
    tags: ['6_BACKUP_CONTROL_V2', '8_ECO_2'],
    hide: true,
  },
};

export const valuesAssetsStateDevice = {
  Evaporadora: {
    Disabled: {
      icon: <OnIcon color="#E3E3E3" />,
      name: t('desligadoMinusculo'),
    },
    Others: {
      icon: <OnIcon />,
      name: t('emFuncionamento'),
    },
  },
  Condensadora: {
    Disabled: {
      icon: <CompDisabled width="15px" height="15px" />,
      name: t('compressorDesligado'),
    },
    Others: {
      icon: <Compressor width="15px" height="15px" />,
      name: t('compressorLigado'),
    },
  },
  'Trocador de Calor': {
    Disabled: {
      icon: <OnIcon color="#E3E3E3" />,
      name: t('desligadoMinusculo'),
    },
    Others: {
      icon: <OnIcon />,
      name: t('emFuncionamento'),
    },
  },
};

export const valuesControlState = {
  Enabled: {
    icon: <OnIcon />,
    name: t('ligada'),
    tags: ['1', 'Enabled'],
    hide: false,
  },
  Disabled: {
    icon: <OnIcon color="#E3E3E3" />,
    name: t('desligada'),
    tags: ['0', 'Disabled'],
    hide: false,
  },
  Ventilation: {
    icon: <FanBlueIcon />,
    name: t('ventilando'),
    tags: ['Ventilation'],
    hide: false,
  },
  NO_ACTION: {
    icon: <></>,
    name: t('semAcao'),
    tags: ['NO_ACTION'],
    hide: false,
  },
  Forbid: {
    icon: <></>,
    name: t('bloqueado'),
    tags: ['Forbid'],
    hide: false,
  },
  'Condenser 1': {
    icon: <CoolIcon width="15px" height="15px" />,
    name: t('refrigerando'),
    tags: ['Condenser 1', 'THERMOSTAT', 'Condenser 2'],
    hide: false,
  },
  'Condenser 2': {
    icon: <CoolIcon width="15px" height="15px" />,
    name: t('refrigerando'),
    tags: ['Condenser 1', 'THERMOSTAT', 'Condenser 2'],
    hide: true,
  },
  Heat: {
    icon: <></>,
    name: t('aquecendo'),
    tags: ['Heat'],
    hide: false,
  },
  0: {
    icon: <></>,
    name: t('desligadoMinusculo'),
    tags: ['0', 'Disabled'],
    hide: true,
  },
  1: {
    name: t('ligadoMinusculo'),
    icon: <></>,
    tags: ['1', 'Enabled'],
    hide: true,
  },
  2: {
    name: t('parando'),
    icon: <></>,
    tags: ['2'],
    hide: false,
  },
  3: {
    name: t('atrasado'),
    icon: <></>,
    tags: ['3'],
    hide: false,
  },
  4: {
    name: t('desarmado'),
    icon: <></>,
    tags: ['4'],
    hide: false,
  },
  5: {
    name: t('preparado'),
    icon: <></>,
    tags: ['5'],
    hide: false,
  },
  6: {
    name: t('forcado'),
    icon: <></>,
    tags: ['6'],
    hide: false,
  },
  7: {
    name: t('descongelando'),
    icon: <></>,
    tags: ['7'],
    hide: false,
  },
  8: {
    name: t('testeCorrida'),
    icon: <></>,
    tags: ['8'],
    hide: false,
  },
  9: {
    name: t('teste'),
    icon: <></>,
    tags: ['9'],
    hide: false,
  },
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function transformScheduleData(data: any, schedInfo: any) {
  const week = data.week;
  if (!week || Object.keys(week).length === 0) {
    return [];
  }

  // Mapeamento dos dias da semana
  const daysMapping: { [key: string]: string } = {
    mon: 'Seg',
    tue: 'Ter',
    wed: 'Qua',
    thu: 'Qui',
    fri: 'Sex',
    sat: 'Sáb',
    sun: 'Dom',
  };

  const groupedSchedules: { [key: string]: string[] } = {};
  Object.keys(week).forEach((day) => {
    const { start, end, permission } = week[day];
    if (permission !== 'allow' && permission !== 'forbid') {
      return;
    }
    const key = `${start}-${end}-${permission}`;
    if (!groupedSchedules[key]) {
      groupedSchedules[key] = [];
    }
    groupedSchedules[key].push(day);
  });

  const schedules = Object.keys(groupedSchedules).map((key, index) => {
    const [start, end, permission] = key.split('-');
    const days = groupedSchedules[key].reduce(
      (acc, day) => {
        acc[day] = true;
        return acc;
      },
      {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
    );

    const scheduleTitle = `Programação ${groupedSchedules[key]
      .map((day) => capitalize(daysMapping[day] || day))
      .join(', ')}`;
    const modoEco = schedInfo.enableEco ? '1_CONTROL' : null;
    return {
      ACTION_MODE: null,
      ACTION_POST_BEHAVIOR: null,
      ACTION_TIME: null,
      BEGIN_TIME: start,
      CTRLOPER: schedInfo.device.startsWith('DAM') ? modoEco : schedInfo.operationMode,
      DAYS: days,
      DUT_SCHEDULE_ID: 0,
      END_TIME: end,
      FORCED_BEHAVIOR: '',
      LOWER_HYSTERESIS: 0,
      LTC: 0,
      LTI: 0,
      PERMISSION: permission as 'allow' | 'forbid',
      SCHEDULE_END_BEHAVIOR: '',
      SCHEDULE_START_BEHAVIOR: '',
      SCHEDULE_STATUS: true,
      SCHEDULE_TITLE: scheduleTitle,
      SETPOINT: schedInfo.setpoint,
      UPPER_HYSTERESIS: 0,
      isDam: true,
    };
  });

  return schedules;
}

export function transformScheduleExceptionData(data, schedInfo) {
  if (!data.exceptions || Object.keys(data.exceptions).length === 0) {
    return [];
  }
  const exceptions = Object.keys(data.exceptions || {}).map((date, index) => {
    const exception = data.exceptions[date];
    return {
      DUT_EXCEPTION_ID: 0,
      EXCEPTION_TITLE: date,
      REPEAT_YEARLY: false,
      EXCEPTION_DATE: date,
      BEGIN_TIME: exception?.start,
      END_TIME: exception.end,
      PERMISSION: exception?.permission,
      EXCEPTION_STATUS_ID: 1,
      CTRLOPER: schedInfo.operationMode,
      SETPOINT: schedInfo.setpoint || null,
      LTC: null,
      LTI: null,
      UPPER_HYSTERESIS: null,
      LOWER_HYSTERESIS: null,
      SCHEDULE_START_BEHAVIOR: null,
      SCHEDULE_END_BEHAVIOR: null,
      FORCED_BEHAVIOR: null,
      IR_ID_COOL: null,
      ACTION_MODE: null,
      ACTION_TIME: null,
      ACTION_POST_BEHAVIOR: null,
    };
  });
  return exceptions;
}
