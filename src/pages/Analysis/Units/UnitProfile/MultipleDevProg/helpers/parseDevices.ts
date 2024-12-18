import {
  Dam, DamList, Dut, DutList,
} from '../types';

export const parseDamList = (dam: Dam): DamList => ({
  UNIT_NAME: dam.UNIT_NAME,
  groupsIds: dam.groupsIds,
  groupsNames: dam.groupsNames.length > 0 ? dam.groupsNames.join('; ') : '-',
  DAM_ID: dam.DAM_ID,
  checked: false,
  DUT_ID: dam.DUT_ID,
  UNIT_ID: dam.UNIT_ID,
  CAN_SELF_REFERENCE: dam.CAN_SELF_REFERENCE,
  SELF_REFERENCE: dam.SELF_REFERENCE,
  MINIMUM_TEMPERATURE: dam.MINIMUM_TEMPERATURE,
  MAXIMUM_TEMPERATURE: dam.MAXIMUM_TEMPERATURE,
  CITY_NAME: dam.CITY_NAME,
  STATE_NAME: dam.STATE_NAME,
  status: dam.status,
  ENABLE_ECO: dam.ENABLE_ECO,
  mode: dam.Mode ?? 'Sem controle',
  hasProgramming: dam.hasProgramming,
  STATE_ID: dam.STATE_ID,
  CITY_ID: dam.CITY_ID,
});

export const parseDutList = (dut: Dut): DutList => ({
  ...dut,
  CTRLOPER: dut.CTRLOPER ?? '0_NO_CONTROL',
  PORTCFG: dut.PORTCFG ?? 'DISABLED',
});
