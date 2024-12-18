import { ApiResps } from '~/providers';
import { DevFullInfo } from '~/store';

export type AutomationTypes = 'carrier-ecosplit' | 'fancoil' | 'vav';
export type ApplicationTypes = 'automation' | 'chiller' | 'medicaoEnergia';

interface AssetOption {
  value: number;
  label: string;
  name: string;
  UNIT_ID: number;
  CLIENT_ID: number;
  GROUP_ID: number;
  DEV_ID: string | null;
  ASSET_ROLE: number;
  DAT_ID: string | null;
  DAT_INDEX: number | null;
  MCHN_APPL: string | null;
  MCHN_BRAND: string | null;
}

interface DriConfigFormData {
  CLIENT_ID_item: { NAME: string, CLIENT_ID: number } | null;
  UNIT_ID_item: { UNIT_NAME: string, UNIT_ID: number } | null;
  GROUP_ID_item: { label: string, value: number, unit: number, name?: string } | null;
  ASSET_ID_item: {
    value: number,
    label: string,
    UNIT_ID: number,
    CLIENT_ID: number,
    GROUP_ID: number,
    DEV_ID: string | null,
    ASSET_ROLE: number,
    DAT_ID: string | null,
    DAT_INDEX: number | null
  } | null,
  establishmentName: string;
  REL_DUT_ID_item: { comboLabel: string, DUT_ID: string } | null;
  ENABLE_ECO_item: { name: string, value: number } | null;
  ECO_MODE_CFG_item: { name: string, value: string } | null;
  ECO_INTERVAL_TIME: string;
  ECO_OFST_START: string;
  ECO_OFST_END: string;
  AUTOMATION_INTERVAL_TIME: string;
}

export interface DriConfigState {
  isLoading: boolean;
  application: {name: string, value: ApplicationTypes} | null;
  automation: {name: string, value: AutomationTypes} | null;
  comboOpts: {
    automation: { name: string, value: string }[],
    applications: {name: string, value: string}[],
    assets: AssetOption[],
    boxManuf: string[],
    chillerLines: { name: string, id: string }[],
    chillerModels: { name: string, id: string }[],
    cities: { CITY_NAME: string, CITY_ID: string, STATE_ID: string }[],
    clients: { NAME: string, CLIENT_ID: number }[],
    duts: { comboLabel: string, DUT_ID: string }[],
    enableEco: {name: string, value: number }[],
    ecoModeCfg: {name: string, value: string}[],
    fancoilManuf: string[],
    fancoilValveManuf: string[],
    groups: { label: string, value: number, withDacAut?: boolean, checked?: boolean, unit: number}[],
    meterModels: { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string }[],
    states: { STATE_NAME: string, STATE_ID: string }[],
    thermManuf: string[],
    units: { UNIT_NAME: string, UNIT_ID: number }[],
    valveManuf: string[],
  };
  devInfo: DevFullInfo | null;
  driApplication: string | null;
  driCfgFile: (Blob & { name: string }) | null;
  driChillerCarrierLine: { id: string, name: string } | null;
  driChillerCarrierModel: { id: string, name: string } | null;
  driLayer: string | null;
  driMeterModel: { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string } | null;
  driProtocol: string | null;
  driParity: string | null;
  driSlaveId: string;
  driStopBits: string | null;
  driSendInterval: string;
  driVavFancoilModel: string | null;
  fancoilLoaded: boolean;
  fancoilManuf: string | null;
  fancoilModel: string;
  formData: DriConfigFormData;
  listModelsChiller: { ID: number, MODEL_NAME: string }[],
  modbusBaudRate: string;
  openModal: 'add-unit' | null;
  otherValveManuf: string;
  otherFancoilManuf: string;
  persistedAssetDevice: { value: number, label: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null } | null,
  roomName: string;
  roomDutInfo?: { DEV_ID?: string, RTYPE_NAME?: string, ROOM_NAME?: string, TUSEMIN?: number, TUSEMAX?: number } | null;
  rooms: { RTYPE_ID: number, RTYPE_NAME: string }[],
  rssi: string;
  selectedCurrentCapacity: { name: string, value: string } | null;
  selectedInstallationType: { name: string, value: string } | null;
  thermManuf: string | null;
  valveManuf: string | null;
  valveModel: string;
  selectedValveModel: { name: string, value: string};
  vavBoxManuf: string | null;
  vavBoxModel: string;
  vavLoaded: boolean;
  varsCfg: ApiResps['/get-integration-info']['dri'];
}
