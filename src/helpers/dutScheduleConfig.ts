import { isFwVersionGreatestOrEqual } from './fwVersion';

export function isNewChangesOnDemandMode(controlOperation: string, currentVersion: string): boolean {
  return isNewChangesOnDemandModeVersion(currentVersion) && controlOperation === '2_SOB_DEMANDA';
}

export function isNewChangesOnDemandModeVersion(currentVersion: string): boolean {
  return isFwVersionGreatestOrEqual('2_5_1', currentVersion);
}
