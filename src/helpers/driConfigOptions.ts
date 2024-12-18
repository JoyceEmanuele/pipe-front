import { Option } from 'components/NewSelect';
import { t } from 'i18next';

export const driApplicationOpts = {
  'Carrier ECOSPLIT': 'carrier-ecosplit',
  'Medidor de Energia': 'medidor-energia',
  VAV: 'vav',
  'Modbus Genérico': 'modbus-generico',
  Fancoil: 'fancoil',
  'Chiller Carrier': 'chiller-carrier',
};

export const driMeterApplications = {
  ET330: 'cg-et330',
  'Nexus II': 'abb-nexus-ii',
  'ETE-30': 'abb-ete-30',
  'ETE-50': 'abb-ete-50',
  EM210: 'cg-em210',
  'MULT-K': 'kron-mult-k',
  'MULT-K 05': 'kron-mult-k-05',
  'MULT-K 120': 'kron-mult-k-120',
  'iKRON 03': 'kron-ikron-03',
  'Schneider PM2100': 'schneider-eletric-pm2100',
  'Schneider PM210': 'schneider-electric-pm210',
  'Schneider PM9C': 'schneider-electric-pm9c',
};

export const driVAVsApplications = {
  'BAC-6000': 'vav-bac-6000',
  'BAC-2000': 'vav-bac-2000',
  'BAC-6000 AMLN': 'vav-bac-6000-amln',
};

export const driVAVApplicationsOptions: Option[] = [
  { label: 'BAC6000 AMLN', value: 'BAC-6000 AMLN', iconName: 'ThermostatCircleIcon' },
  { label: 'BAC6000 MLN', value: 'BAC-6000', iconName: 'ThermostatCircleIcon' },
  { label: 'BAC2000 MLN', value: 'BAC-2000', iconName: 'ThermostatSquareIcon' },
];

export const driFancoilsApplications = {
  'BAC-6000': 'fancoil-bac-6000',
  'BAC-2000': 'fancoil-bac-2000',
  'BAC-6000 AMLN': 'fancoil-bac-6000-amln',
};

export const driChillerCarrierApplications = {
  '30HXE': 'chiller-carrier-30hxe',
  '30GXE': 'chiller-carrier-30gxe',
  '30HXF': 'chiller-carrier-30hxf',
  '30XAB': 'chiller-carrier-30xab-hvar',
};

export const vavFancoilValveTypes: { name: string, value: string}[] = [
  { name: t('valvulaProporcional010V'), value: 'PROPORTIONAL' },
  { name: t('valvulaOnOff'), value: 'ON-OFF' },
];

type Parameter = {
  value: number | null;
  name: string | null;
  unitMeasurement: string | null;
};

type ChillerParams = Record<string, Parameter>;

export const driChillerCarrier30HXParams = {
  circuitAParams: {
    CP_A1: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CP_A2: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CAPA_T: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    DP_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SP_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SCT_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SST_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA1_OP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA2_OP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    DOP_A1: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    DOP_A2: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA1_DGT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA2_DGT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    EXV_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    HR_CP_A1: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    HR_CP_A2: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA1_TMP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA2_TMP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA1_CUR: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPA2_CUR: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  },
  circuitBParams: {
    CP_B1: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CP_B2: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CAPB_T: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    DP_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SP_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SCT_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SST_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB1_OP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB2_OP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    DOP_B1: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    DOP_B2: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB1_DGT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB2_DGT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    EXV_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    HR_CP_B1: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    HR_CP_B2: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB1_TMP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB2_TMP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB1_CUR: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    CPB2_CUR: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  },
};

export const driChillerCarrierGeneral30HXParams = {
  CHIL_S_S: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CAP_T: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  DEM_LIM: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  LAG_LIM: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  SP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CTRL_PNT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  EMSTOP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COND_LWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COND_EWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COOL_LWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COOL_EWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COND_SP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CHIL_OCC: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  STATUS: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
};

export const driChillerCarrierAlarmParams = {
  alarm_1: null as number | null,
  alarm_2: null as number | null,
  alarm_3: null as number | null,
  alarm_4: null as number | null,
  alarm_5: null as number | null,
};

export const driChillerCarrier30XAParams = {
  circuitAParams: {
    DP_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SP_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SCT_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SST_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    OP_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SLT_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    HR_CP_A: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  },
  circuitBParams: {
    DP_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SP_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SCT_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SST_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    OP_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    SLT_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
    HR_CP_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  },
};

export const driChillerCarrierGeneral30XAParams = {
  STATUS: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CHIL_S_S: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CHIL_OCC: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CTRL_TYP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  SLC_HM: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CAP_T: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  DEM_LIM: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  SP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  SP_OCC: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  CTRL_PNT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  OAT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  EMSTOP: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  HR_MACH: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COOL_EWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COOL_LWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COND_EWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  COND_LWT: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
  HR_MACH_B: { value: null as number | null, name: null as string | null, unitMeasurement: null as string | null },
};

export const driChillerCarrier30XAHvarParams: {
  circuitAParams: ChillerParams;
  circuitBParams: ChillerParams;
  circuitCParams: ChillerParams;
} = {
  circuitAParams: {
    CAPA_T: { value: null, name: null, unitMeasurement: null },
    DP_A: { value: null, name: null, unitMeasurement: null },
    SP_A: { value: null, name: null, unitMeasurement: null },
    ECON_P_A: { value: null, name: null, unitMeasurement: null },
    OP_A: { value: null, name: null, unitMeasurement: null },
    DOP_A: { value: null, name: null, unitMeasurement: null },
    CURREN_A: { value: null, name: null, unitMeasurement: null },
    CP_TMP_A: { value: null, name: null, unitMeasurement: null },
    DGT_A: { value: null, name: null, unitMeasurement: null },
    ECO_TP_A: { value: null, name: null, unitMeasurement: null },
    SCT_A: { value: null, name: null, unitMeasurement: null },
    SST_A: { value: null, name: null, unitMeasurement: null },
    SUCT_T_A: { value: null, name: null, unitMeasurement: null },
    EXV_A: { value: null, name: null, unitMeasurement: null },
    CIRCA_AN_UI: { value: null, name: null, unitMeasurement: null },
  },
  circuitBParams: {
    CIRCB_AN_UI: { value: null, name: null, unitMeasurement: null },
    CAPB_T: { value: null, name: null, unitMeasurement: null },
    DP_B: { value: null, name: null, unitMeasurement: null },
    SP_B: { value: null, name: null, unitMeasurement: null },
    ECON_P_B: { value: null, name: null, unitMeasurement: null },
    OP_B: { value: null, name: null, unitMeasurement: null },
    DOP_B: { value: null, name: null, unitMeasurement: null },
    CURREN_B: { value: null, name: null, unitMeasurement: null },
    CP_TMP_B: { value: null, name: null, unitMeasurement: null },
    DGT_B: { value: null, name: null, unitMeasurement: null },
    ECO_TP_B: { value: null, name: null, unitMeasurement: null },
    SCT_B: { value: null, name: null, unitMeasurement: null },
    SST_B: { value: null, name: null, unitMeasurement: null },
    SUCT_T_B: { value: null, name: null, unitMeasurement: null },
    EXV_B: { value: null, name: null, unitMeasurement: null },
  },
  circuitCParams: {
    CIRCC_AN_UI: { value: null, name: null, unitMeasurement: null },
    CAPC_T: { value: null, name: null, unitMeasurement: null },
    DP_C: { value: null, name: null, unitMeasurement: null },
    SP_C: { value: null, name: null, unitMeasurement: null },
    ECON_P_C: { value: null, name: null, unitMeasurement: null },
    OP_C: { value: null, name: null, unitMeasurement: null },
    DOP_C: { value: null, name: null, unitMeasurement: null },
    CURREN_C: { value: null, name: null, unitMeasurement: null },
    CP_TMP_C: { value: null, name: null, unitMeasurement: null },
    DGT_C: { value: null, name: null, unitMeasurement: null },
    ECO_TP_C: { value: null, name: null, unitMeasurement: null },
    SCT_C: { value: null, name: null, unitMeasurement: null },
    SST_C: { value: null, name: null, unitMeasurement: null },
    SUCT_T_C: { value: null, name: null, unitMeasurement: null },
    EXV_C: { value: null, name: null, unitMeasurement: null },
  },
};

export const driChillerCarrierGeneral30XAHvarParams: ChillerParams = {
  CTRL_TYP: { value: null, name: null, unitMeasurement: null },
  STATUS: { value: null, name: null, unitMeasurement: null },
  GENUNIT_UI: { value: null, name: null, unitMeasurement: null },
  SP_OCC: { value: null, name: null, unitMeasurement: null },
  CHIL_S_S: { value: null, name: null, unitMeasurement: null },
  CHIL_OCC: { value: null, name: null, unitMeasurement: null },
  DEM_LIM: { value: null, name: null, unitMeasurement: null },
  EMSTOP: { value: null, name: null, unitMeasurement: null },
  CAP_T: { value: null, name: null, unitMeasurement: null },
  TOT_CURR: { value: null, name: null, unitMeasurement: null },
  CTRL_PNT: { value: null, name: null, unitMeasurement: null },
  OAT: { value: null, name: null, unitMeasurement: null },
  COOL_EWT: { value: null, name: null, unitMeasurement: null },
  COOL_LWT: { value: null, name: null, unitMeasurement: null },
};

export const driMetersCfgs = {
  ET330: {
    application: 'cg-et330',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'Nexus II': {
    application: 'abb-nexus-ii',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'ETE-30': createEteConfig('abb-ete-30'),
  'ETE-50': createEteConfig('abb-ete-50'),
  EM210: {
    application: 'cg-em210',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'MULT-K': {
    application: 'kron-mult-k',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'MULT-K 05': {
    application: 'kron-mult-k-05',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'MULT-K 120': {
    application: 'kron-mult-k-120',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'iKRON 03': {
    application: 'kron-ikron-03',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'Schneider PM2100': {
    application: 'schneider-eletric-pm2100',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
  },
  'Schneider PM210': createSchneiderConfig('schneider-electric-pm210'),
  'Schneider PM9C': createSchneiderConfig('schneider-electric-pm9c'),
};

export const driProtocolsOpts = {
  'Modbus TCP': 'modbus-tcp',
  'Modbus RTU': 'modbus-rtu',
  'Carrier ECOSPLIT': 'carrier-ecosplit',
};

export const driParityOpts = {
  Desabilitado: 'desabilitado',
  Ímpar: 'impar',
  Par: 'par',
};

export const driLayerOpts = {
  'RS-485': 'rs-485',
  'RS-232': 'rs-232',
  Ethernet: 'ethernet',
};

export const driStopBitsOpts = {
  '1 Stop Bit': '1-stop-bit',
  '1.5 Stop Bits': '1.5-stop-bits',
  '2 Stop Bits': '2-stop-bits',
};

export const modbusBaudRateOpts = ['4800', '9600', '19200', '115200', '921600'];

export const currentCapacityOpts = [
  { name: '50A', value: '50' },
  { name: '75A', value: '75' },
  { name: '100A', value: '100' },
  { name: '150A', value: '150' },
  { name: '200A', value: '200' },
  { name: '250A', value: '250' },
  { name: '300A', value: '300' },
  { name: '350A', value: '350' },
  { name: '400A', value: '400' },
  { name: '500A', value: '500' },
  { name: '600A', value: '600' },
  { name: '630A', value: '630' },
  { name: '800A', value: '800' },
  { name: '1000A', value: '1000' },
  { name: '1200A', value: '1200' },
  { name: '1500A', value: '1500' },
  { name: '1600A', value: '1600' },
  { name: '2000A', value: '2000' },
  { name: '2500A', value: '2500' },
];

export const metersWithCurrCapacityConfig = ['ET330'] as string[];

export const installationTypeOpts = {
  ET330: [
    { name: 'Rede Bifásica', value: '2' },
    { name: 'Rede Trifásica sem neutro', value: '1' },
    { name: 'Rede Trifásica com neutro', value: '0' },
  ],
  EM210: [
    { name: 'Rede Bifásica', value: '2' },
    { name: 'Rede Trifásica sem neutro', value: '1' },
    { name: 'Rede Trifásica com neutro', value: '0' },
  ],
  'MULT-K 120': [
    { name: 'Rede Bifásica', value: '2' },
    { name: 'Rede Trifásica sem neutro', value: '1' },
    { name: 'Rede Trifásica com neutro', value: '0' },
  ],
};

export const driApplicationCfgs = {
  ET330: {
    application: 'cg-et330',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'Nexus II': {
    application: 'abb-nexus-ii',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'ETE-30': createEteApplicationConfig('abb-ete-30'),
  'ETE-50': createEteApplicationConfig('abb-ete-50'),
  'Carrier ECOSPLIT': {
    application: 'carrier-ecosplit',
    protocol: 'carrier-ecosplit',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  EM210: {
    application: 'cg-em210',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'MULT-K': {
    application: 'kron-mult-k',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'MULT-K 05': {
    application: 'kron-mult-k-05',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'MULT-K 120': {
    application: 'kron-mult-k-120',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'iKRON 03': {
    application: 'kron-ikron-03',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'BAC-6000': {
    application: 'vav-bac-6000',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'BAC-6000 AMLN': {
    application: 'vav-bac-6000-amln',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'BAC-2000': {
    application: 'vav-bac-2000',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'Schneider PM2100': createSchneiderApplicationConfig('schneider-eletric-pm2100'),
  '30HXE': {
    application: 'chiller-carrier-30hxe',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  '30GXE': {
    application: 'chiller-carrier-30gxe',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  '30HXF': {
    application: 'chiller-carrier-30hxf',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  '30XAB': {
    application: 'chiller-carrier-30xab-hvar',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'Chiller-Default': {
    application: 'chiller-carrier-30xab-hvar',
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  },
  'Schneider PM210': createSchneiderApplicationConfig('schneider-electric-pm210'),
  'Schneider PM9C': createSchneiderApplicationConfig('schneider-electric-pm9c'),
} as {
  [key: string]: {
    application: string,
    protocol: string,
    serialMode: string,
    modbusBaudRate: string,
    parity: string,
    stopBits: string,
  }
};

function createEteConfig(application: string) {
  return {
    application,
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '2-stop-bits',
    telemetryInterval: 900,
    driSlaveId: '174',
  };
}

function createEteApplicationConfig(application: string) {
  return {
    application,
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '2-stop-bits',
  };
}

function createSchneiderConfig(application: string) {
  return {
    application,
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: 9600,
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
    telemetryInterval: 900,
    driSlaveId: '1',
  };
}

function createSchneiderApplicationConfig(application: string) {
  return {
    application,
    protocol: 'modbus-rtu',
    serialMode: 'rs-485',
    modbusBaudRate: '9600',
    parity: 'desabilitado',
    stopBits: '1-stop-bit',
  };
}
