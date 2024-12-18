import store from 'store';
import { apiCall, ApiResps } from '../providers';
import jsonTryParse from './jsonTryParse';

// sessionStorage.setItem('key', 'value'); // Save data to sessionStorage
// let data = sessionStorage.getItem('key'); // Get saved data from sessionStorage
// sessionStorage.removeItem('key'); // Remove saved data from sessionStorage
// sessionStorage.clear(); // Remove all saved data from sessionStorage

export function saveSessionStorageItem(key: string, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionStorageItem(key: string) {
  sessionStorage.removeItem(key);
}

export function getSessionStorageItem(key: string) {
  const data = sessionStorage.getItem(key);
  return jsonTryParse(data || '');
}

function getExistingDevInfo() {
  const data = localStorage.getItem('DEV-INFO');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (err) { }
  }
  return null;
}

// async function getCachedDacInfo (devId: string) {
//   let data = getExistingDevInfo()
//   if (data && data.DAC_ID === devId) return data
//   const response = await api['/dac/get-dac-info']({ DAC_ID: devId }).then(data => ({ data }))
//   data = response.data.info
//   setCachedDacInfo(data)
//   return data
// }

// async function getCachedDutInfo (devId: string, forceNew: boolean) {
//   let data = getExistingDevInfo()
//   if ((!forceNew) && data && data.DEV_ID === devId) return data
//   const response = await api['/dut/get-dut-info']({ DEV_ID: devId })
//   data = {
//     ...response.info,
//     workPeriods: response.workPeriods,
//     workPeriodExceptions: response.workPeriodExceptions,
//   }
//   setCachedDutInfo(data)
//   return data
// }

// async function getCachedDamInfo (devId: string) {
//   let data = getExistingDevInfo()
//   if (data && data.DAM_ID === devId) return data
//   const response = await api['/dam/get-dam-info']({ DAM_ID: devId }).then(data => ({ data }))
//   data = response.data.info
//   setCachedDamInfo(data)
//   return data
// }

// function setCachedDacInfo (data: any) {
//   localStorage.setItem('DEV-INFO', JSON.stringify(data))
// }

// function setCachedDutInfo (data: any) {
//   localStorage.setItem('DEV-INFO', JSON.stringify(data))
// }

// function setCachedDamInfo (data: any) {
//   localStorage.setItem('DEV-INFO', JSON.stringify(data))
// }

export type DevInfo = ApiResps['/get-dev-full-info']['info'] & {
  dac: ApiResps['/get-dev-full-info']['dac'],
  dam: ApiResps['/get-dev-full-info']['dam'],
  dut: ApiResps['/get-dev-full-info']['dut'],
  dut_aut: ApiResps['/get-dev-full-info']['dut_aut'],
  dri: ApiResps['/get-dev-full-info']['dri'],
  dma: ApiResps['/get-dev-full-info']['dma'],
  optsDescs: ApiResps['/get-dev-full-info']['optsDescs'],
}

export function getCachedDevInfoSync(devId: string) { // : DevInfo|null
  const { devInfo } = store.getState();
  if ((devInfo && devInfo.DEV_ID) === devId) {
    return devInfo;
  }
  return null;
}

export function getCachedDevInfo(devId: string, { onlyCached = false, forceFresh = false } = {}) { // : Promise<DevInfo|null>
  return Promise.resolve().then(async () => {
    let { devInfo } = store.getState();
    if ((!forceFresh) && (devInfo && devInfo.DEV_ID) === devId) {
      return devInfo;
    }
    if (onlyCached) return null;
    const response = await apiCall('/get-dev-full-info', { DEV_ID: devId });
    devInfo = {
      ...response.info,
      dac: response.dac,
      dam: response.dam,
      dut: response.dut,
      dut_aut: response.dut_aut,
      dri: response.dri,
      dma: response.dma,
      dal: response.dal,
      dmt: response.dmt,
      optsDescs: response.optsDescs,
    };
    store.dispatch({ type: 'SET_DEV_INFO', payload: devInfo });
    return devInfo;
  });
}
