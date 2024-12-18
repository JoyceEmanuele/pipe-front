import { DamList, DutList } from '../types';

const sortLocation = (dev_1: DamList | DutList, dev_2:DamList | DutList): number => {
  if (dev_1.STATE_NAME == null) return 1;
  if (dev_2.STATE_NAME == null) return -1;
  if (dev_1.STATE_NAME < dev_2.STATE_NAME) {
    return -1;
  }
  if (dev_1.STATE_NAME > dev_2.STATE_NAME) {
    return 1;
  }
  if (dev_1.CITY_NAME == null) return 1;
  if (dev_2.CITY_NAME == null) return -1;
  if (dev_1.CITY_NAME < dev_2.CITY_NAME) {
    return -1;
  }
  if (dev_1.CITY_NAME > dev_2.CITY_NAME) {
    return 1;
  }
  return 2;
};

export const sortDut = (dut_1: DutList, dut_2: DutList): number => {
  const res = sortLocation(dut_1, dut_2);
  if (res !== 2) return res;

  if (dut_1.UNIT_NAME == null) return 1;
  if (dut_2.UNIT_NAME == null) return -1;
  if (dut_1.UNIT_NAME < dut_2.UNIT_NAME) {
    return -1;
  }
  if (dut_1.UNIT_NAME > dut_2.UNIT_NAME) {
    return 1;
  }
  return 0;
};

export const sortDam = (dam_1: DamList, dam_2: DamList): number => {
  const res = sortLocation(dam_1, dam_2);
  if (res !== 2) return res;

  if (dam_1.UNIT_NAME == null) return 1;
  if (dam_2.UNIT_NAME == null) return -1;
  if (dam_1.UNIT_NAME < dam_2.UNIT_NAME) {
    return -1;
  }
  if (dam_1.UNIT_NAME > dam_2.UNIT_NAME) {
    return 1;
  }
  if (dam_1.groupsNames == null) return 1;
  if (dam_2.groupsNames == null) return -1;
  if (dam_1.groupsNames < dam_2.groupsNames) {
    return 1;
  }
  if (dam_1.groupsNames > dam_2.groupsNames) {
    return -1;
  }
  return 0;
};
