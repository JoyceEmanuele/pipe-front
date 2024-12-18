export const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const ecoModeDetails = {
  'eco-C1-V': 'Se a temperatura do ambiente ficar abaixo do limite mínimo por 5 minutos o sistema desativa uma condensadora. Se a temperatura continuar abaixo do limite depois de 5 minutos com a condensadora desligada, o sistema desliga a outra condensadora, ficando só com a ventilação',
  'eco-C2-V': 'Se a temperatura do ambiente ficar abaixo do limite mínimo por 5 minutos o sistema desativa uma condensadora. Se a temperatura continuar abaixo do limite depois de 5 minutos com a condensadora desligada, o sistema desliga a outra condensadora, ficando só com a ventilação.',
};

export const dacDamEcoDetails = 'Durante o início do horário permitido de funcionamento, a máquina permanecerá ou desligada ou ventilando (parametrizável) até a temperatura atingir o setpoint, neste momento a máquina começará a ventilar. Ao atingir o Limiar de Temperatura Crítico (LTC), a máquina irá iniciar o Modo Eco em torno do setpoint. Dentro do horário permitido, esta operação permanecerá ativa até o momento em que, eventualmente, a temperatura cair abaixo do Limiar de Temperatura Inferior (LTI), neste momento a máquina irá desligar ou ventilar (parametrizável) para economizar energia. Fora do horário permitido de funcionamento, a máquina permanecerá desligada.';

export const temprtControlModeDetails = {
  '1_CONTROL': 'O DUT3 irá manter a maquina desligada durante o periodo fora do horario de funcionamento. Dentro do horario permitido de funcionamento, o DUT3 atuará somente ligando a maquina refrigerando, e começara a verificar o valor de SETPOINT, caso o valor for menor que SETPOINT, ele irá ventilar, e quando o valor ficar maior, irá refrigerar.',
  '2_SOB_DEMANDA': 'O DUT3 irá manter a máquina desligada durante o período fora do horário de funcionamento. Dentro do horário permitido de funcionamento, o DUT3 atuará somente se a temperatura cair abaixo do setpoint de temperatura. Quando este evento acontecer, o DUT3 irá controlar a temperatura do ambiente seguindo o Modo ECO de operação por uma hora, de acordo com o setpoint programado. Após uma hora, o DUT3 desliga a máquina e não atua mais sobre ela, até que uma nova queda de temperatura seja observada.',
  '4_BLOCKED': 'A máquina permanecerá desligada fora do horário permitido de funcionamento. Durante o horário permitido de funcionamento, o DUT3 não atuará na máquina, deixando o usuário controlar a máquina conforme deseje.',
  '5_BACKUP_CONTROL': 'A máquina ficará sem atuar enquanto a temperatura de LTC não for atingida. No momento que LTC é atingido, ela entrará como Enabled e fará o modo ECO durante 3 horas. No final das 3 horas, ela desligará e ficará no Disabled até o LTC ser atingido novamente.',
  '6_BACKUP_CONTROL_V2': 'Durante o horário permitido de funcionamento, a máquina permanecerá desligada até a temperatura atingir o setpoint, neste momento a máquina começará a ventilar. Ao atingir o limiar de temperatura crítico (LTC), a máquina irá funcionar em modo ECO. Dentro do horário permitido, essa operação permanecerá sendo executada até o momento que a temperatura cair abaixo do limiar de temperatura inferior (LTI), neste momento o DUT desliga a máquina para economizar energia.',
  '7_FORCED': 'Durante o horário permitido de funcionamento, a máquina fica enviando comando forçado para refrigerar.',
};

export const initialProg = {
  exceptions: {},
  ventTime: { begin: 0, end: 0 },
  ventilation: 0,
  week: {},
};

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

export const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

export const defaultFormData = {
  DAT_BEGMON: '',
  CLIENT_ID_item: null as null|{ NAME: string, CLIENT_ID: number },
  UNIT_ID_item: null as null|{ UNIT_NAME: string, UNIT_ID: number },
  ROOM_NAME: '',
  CTRLOPER_item: null as null|{ label: string, value: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED' },
  USE_IR_item: null as null|{ label: string, value: 'IR'|'RELAY'|'DISABLED' },
  ENABLE_ECO_item: null as null|{ label: string, value: string, valueN: 0|1|2 },
  ECO_CFG_item: null as null|{ label: string, value: string },
  GROUP_ID_item: null as null|{ label: string, value: number, unit: number },
  REL_DUT_ID_item: null as null|{ DEV_ID: string, UNIT_ID: number },
  DAC_APPL_item: null as null|{ label: string, value: { DAC_APPL: string, hasPliq: boolean, hasPsuc: boolean } },
  FLUID_TYPE_item: null as null|{ label: string, value: string },
  DAC_TYPE_item: null as null|{ label: string, value: string, tags: string },
  DAC_ENV_item: null as null|{ label: string, value: string, tags: string },
  DAC_BRAND_item: null as null|{ label: string, value: string },
  DAC_MODEL: '',
  DAC_MODIF_item: null as null|{ label: string, value: string },
  DAC_COMIS_item: null as null|{ label: string, value: string },
  DAC_DESC: '',
  DAC_NAME: '',
  P0_POSITION: null as null|{ label: string, value: string },
  P0_SENSOR: null as null|{ label: string, value: string },
  P1_POSITION: null as null|{ label: string, value: string },
  P1_SENSOR: null as null|{ label: string, value: string },
  T0_POSITION: null as null|{ label: string, value: string },
  T1_POSITION: null as null|{ label: string, value: string },
  T2_POSITION: null as null|{ label: string, value: string },
  USE_RELAY_item: null as null|{ label: string, value: string, valueN: 0|1 },
  MCHN_BRAND_item: null as null|{ label: string, value: string },
  PLACEMENT_item: null as null|undefined|{ label: string, value: 'AMB'|'INS' },
  MCHN_MODEL: '',
  ECO_OFST_START: '',
  ECO_OFST_END: '',
  TSETPOINT: '',
  RESENDPER: '',
  LTCRIT: '',
  LTINF: '',
  varsConfigInput: '',
  CAPACITY_UNIT_item: null as null|{ value: string },
  CAPACITY_PWR: '',
  DAC_COP: '',
  DAC_KW: '',
  FU_NOM: '',
  configTsensors: false,
  ECO_TIME_INTERVAL_HYSTERESIS: '',
  ECO_SETPOINT: '',
  ECO_LTC: '',
  ECO_LTI: '',
  ECO_UPPER_HYSTERESIS: '',
  ECO_LOWER_HYSTERESIS: '',
  ECO_SCHEDULE_START_BEHAVIOR_item: null as null|{ label: string, value: string },
  ECO_DUT_SCHEDULE_START_BEHAVIOR_item: null as null|{ label: string, value: string },
  ECO_DUT_SCHEDULE_END_BEHAVIOR_item: null as null|{ label: string, value: string },
  FORCED_BEHAVIOR_item: null as null|{ label: string, value: string },
};

export const defaultMinimumTemperature = 20;
export const defaultMaximumTemperature = 28;

export const limitDamScheduleDevices = 3;
export const limitDutScheduleDevices = 3;
