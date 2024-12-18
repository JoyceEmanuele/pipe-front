import { ControlMode, ScheduleDut } from 'providers/types/api-private';
import { ReactElement } from 'react';

export type NewOption = { label: string | ReactElement, value: string };

export interface BaseComponentProps {
  devId?: string,
  cardIndex?: number | null,
  isFromMultipleProg?: boolean,
  dutScheduleStartBehavior: { label: string, value: string }[],
  dutScheduleEndBehavior: { label: string, value: string }[],
  dutForcedBehavior: { label: string, value: string }[],
  dutControlOperation: { label: string, value: '0_NO_CONTROL' | '1_CONTROL' | '2_SOB_DEMANDA' | '3_BACKUP' | '4_BLOCKED' | '5_BACKUP_CONTROL' | '6_BACKUP_CONTROL_V2' | '7_FORCED' }[],
  dutCompatibilityHysteresisEco2: boolean,
  irCommands: {
    IR_ID: string,
    CMD_NAME: string,
    CMD_TYPE: string | null,
    TEMPER: number,
  }[],
  temperaturesForcedSetpoint?: number[],
  onHandleSave,
  onHandleCancel,
}

export interface BaseEditCardFormData {
  BEGIN_TIME: string,
  END_TIME: string,
  PERMISSION: 'allow' | 'forbid',
  CTRLOPER: ControlMode,
  SETPOINT: string,
  LTC: string,
  LTI: string,
  UPPER_HYSTERESIS: string,
  LOWER_HYSTERESIS: string,
  SCHEDULE_START_BEHAVIOR: string,
  SCHEDULE_END_BEHAVIOR: string,
  CTRLOPER_item: null | { label: string, value: '0_NO_CONTROL' | '1_CONTROL' | '2_SOB_DEMANDA' | '3_BACKUP' | '4_BLOCKED' | '5_BACKUP_CONTROL' | '6_BACKUP_CONTROL_V2' | '7_FORCED' },
  SCHEDULE_START_BEHAVIOR_item: null | { label: string, value: string },
  SCHEDULE_END_BEHAVIOR_item: null | { label: string, value: string },
  FORCED_BEHAVIOR_item: null | { label: string, value: string },
  ACTION_TIME: string,
  ACTION_MODE: string,
  ACTION_POST_BEHAVIOR: string,
  SETPOINT_ON_DEMAND: string | null,
}

export interface ComponentProps extends BaseComponentProps {
  schedule?: ScheduleDut | null,
}

export interface ScheduleEditCardFormData extends BaseEditCardFormData {
  DUT_SCHEDULE_ID?: number,
  SCHEDULE_TITLE: string,
  SCHEDULE_STATUS: boolean,
  DAYS: {
    mon: boolean,
    tue: boolean,
    wed: boolean,
    thu: boolean,
    fri: boolean,
    sat: boolean,
    sun: boolean,
  },
}
