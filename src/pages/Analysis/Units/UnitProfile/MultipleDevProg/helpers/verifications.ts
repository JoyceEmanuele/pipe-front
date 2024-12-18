import { DevList } from '../types';

export function getCheckStatusKey(devsList: DevList[], key: string, value: unknown): boolean {
  return !devsList.some((dev) => dev[key] === value && !dev.checked);
}

export function toggleAllDevicesFromKey(devsList: DevList[], key: string, value: unknown): void {
  if (getCheckStatusKey(devsList, key, value)) {
    for (const dev of devsList) {
      if (dev[key] === value) { dev.checked = false; }
    }
  } else {
    for (const dev of devsList) {
      if (dev[key] === value) { dev.checked = true; }
    }
  }
}

export function checkDecimalPlace(value: string): boolean {
  if (/^\d*\.?\d{0,1}$/.test(value)) {
    return true;
  }
  return false;
}

export function isAllDevicesSelected(devsList: DevList[]): boolean {
  return devsList.length === 0 ? false : !devsList.some((dev) => !dev.checked);
}

export function toggleSelectAllDevices(devsList: DevList[]): void {
  if (isAllDevicesSelected(devsList)) {
    for (const dev of devsList) {
      dev.checked = false;
    }
  } else {
    for (const dev of devsList) {
      dev.checked = true;
    }
  }
}

export function verifyValueDefinedNotEmpty<Type>(value ?: Type[]): Type[] | undefined {
  return (value && value.length > 0 ? value : undefined);
}
