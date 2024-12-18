import { ControlMode } from 'providers/types/api-private';
import { ApiResps } from 'providers';

export type Dam = ApiResps['/dam/get-dams-list']['list'][number];
export type Dut = ApiResps['/dut/get-duts-list']['list'][number]

type PortCfg = 'IR' | 'RELAY' | 'DISABLED';
export type DevList = DutList | DamList | DacList;
export type SelectedDevType = 'DUT' | 'DAM' | 'Iluminação';

export interface DutList {
  ROOM_NAME: string,
  DEV_ID: string,
  CLIENT_ID: number,
  UNIT_ID: number,
  UNIT_NAME: string,
  CITY_NAME: string,
  STATE_NAME: string,
  status: string,
  CTRLOPER: ControlMode,
  PORTCFG: PortCfg,
  CURRFW_VERS?: string,
  checked?: boolean,
  STATE_ID: string,
  CITY_ID: string,
}

export interface DamList {
  UNIT_NAME: string,
  DAM_ID: string,
  groupsIds: number[],
  groupsNames: string,
  DUT_ID: string,
  UNIT_ID: number,
  CITY_NAME: string,
  STATE_NAME: string,
  CAN_SELF_REFERENCE: number,
  SELF_REFERENCE: boolean,
  MINIMUM_TEMPERATURE: number,
  MAXIMUM_TEMPERATURE: number,
  ENABLE_ECO: number,
  status: string,
  mode: string,
  hasProgramming: boolean,
  STATE_ID: string,
  CITY_ID: string,
  checked?: boolean,
}

export interface DacList {
  GROUP_NAME: string,
  DAC_ID: string,
  checked?: boolean
}

export interface DevProperties {
  id: string,
  name: string,
  groupName: string,
  dutId: string,
  unitId: string,
  unitName: string,
  canSelfReference: string,
  selfReference: string,
  minimumTemperature: string,
  maximumTemperature: string,
  cityName: string,
  stateName: string,
  devType: string,
  devsList: DevList[],
  status: string,
  ctrlOperation: string,
  autConfiguration: string,
  mode: string,
  enabledEco: string,
}

export interface DutReferenceList {
  DEV_ID: string,
  UNIT_ID: number,
  ROOM_NAME: string,
  TUSEMAX?: number,
  TUSEMIN?: number
}

export type DutOffline = { DUT_ID: string };
export type DutError = { DUT_ID: string, Motivo: string };
export type DamOffline = { DAM_ID: string};
