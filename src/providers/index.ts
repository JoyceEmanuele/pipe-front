/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
import axios, { AxiosRequestConfig } from 'axios';

import ThenArg from 'helpers/ThenArg';

import API_private from './types/api-private';
import API_public from './types/api-public';
import API_uploadService from './types/api-upload-service';
import { apmElastic } from 'helpers/apmElastic';

const isProductionFront = [
  'celsius360.dielenergia.com',
  'dap.dielenergia.com',
  'dash.dielenergia.com',
  'energia.dielenergia.com',
  'hvac.dielenergia.com',
].includes(window.location.host);

// localStorage.setItem('@diel:custom-backend', 'http://localhost:8443');
// localStorage.setItem('@diel:custom-backend', 'https://api-qa.dielenergia.com');

export const __API__ = localStorage.getItem('@diel:custom-backend')
  || process.env.REACT_APP_API_URL
  || 'http://api.unknown-host'; // force error

let _backendDescriptionToShow: string|null = null;
try {
  const apiHostName = new URL(__API__).hostname;
  switch (apiHostName) {
    case 'api.dielenergia.com': { _backendDescriptionToShow = 'SERVIDOR DE PRODUÇÃO!'; break; }
    case 'api-qa.dielenergia.com': { _backendDescriptionToShow = 'QA'; break; }
    case 'api-test.dielenergia.com': { _backendDescriptionToShow = 'TIMEZONE'; break; }
    case 'api-dev-nav.dielenergia.com': { _backendDescriptionToShow = 'DEV-NAV'; break; }
    case 'api-demo.dielenergia.com': { _backendDescriptionToShow = 'DEMONSTRAÇÃO'; break; }
    default: { _backendDescriptionToShow = 'SERVIDOR DE TESTES'; break; }
  }

  if (isProductionFront && (apiHostName === 'api.dielenergia.com')) { _backendDescriptionToShow = null; }
} catch (err) { console.error(err); }

export const backendDescriptionToShow = _backendDescriptionToShow;

export const __WS_URL__ = process.env.REACT_APP_WEBSOCKET_URL || `ws${__API__.substring(4)}:8010/wsfront`;

const defaultOptions = {
  baseURL: __API__,
};

const instance = axios.create(defaultOptions);

instance.interceptors.request.use((config) => {
  if (localStorage.getItem('@diel:token')) {
    config.headers.Authorization = `Bearer ${localStorage.getItem('@diel:token')}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      localStorage.clear();
    }
    if (
      error
      && error.response
      && error.response.status === 401
      && window.location.pathname !== '/login'
      && window.location.pathname !== '/esqueceu-senha'
      && window.location.pathname !== '/configuracoes/alterar-senha'
    ) {
      window.location.href = '/login';
    } else {
      return Promise.reject(error);
    }
  },
);

export function reqWithCredentials(authHeader: string, route: string, body?: string|{}) {
  const config: AxiosRequestConfig = {
    method: 'post',
    baseURL: __API__,
    url: route,
    data: body,
    headers: {},
  };
  if (authHeader && authHeader.length > 10) config.headers.Authorization = authHeader;
  return axios(config);
}

export function unicodeBase64(str: string) {
  const encoded = encodeURIComponent(str);
  const equivString = encoded.replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(`0x${p1}`, 16)));
  return btoa(equivString);
}

async function dielApiPost(route: string, body?: any) {
  const token = localStorage.getItem('@diel:token');
  const prefsStorage = (localStorage.getItem('@diel:profile') && JSON.parse(localStorage.getItem('@diel:profile')!).prefs) || undefined;
  const formatLanguage = (prefsStorage && JSON.parse(prefsStorage).language) || 'pt';
  const authorization = (token && `Bearer ${token}`);
  apmElastic(route);

  const config: AxiosRequestConfig = {
    method: 'post',
    baseURL: __API__,
    url: route,
    data: body,
    headers: {
      'Accept-Language': formatLanguage || undefined,
    },
  };
  if (authorization && authorization.length > 10) config.headers.Authorization = authorization;
  return axios(config);
}

type FullApi = API_private & API_public & API_uploadService;
export type ApiResps = {
  [Route in keyof FullApi]: ThenArg<ReturnType<FullApi[Route]>>;
};
export type ApiParams = {
  [Route in keyof FullApi]: Parameters<FullApi[Route]>[0];
};

export function apiCall<Key extends keyof FullApi>(key: Key, reqParams?: Parameters<FullApi[Key]>[0]): ReturnType<FullApi[Key]> {
  return dielApiPost(key, reqParams).then((r) => r.data) as any;
}

export function apiCall2<Key extends keyof FullApi>(route: Key, reqParams: Parameters<FullApi[Key]>[0], authToken: string): ReturnType<FullApi[Key]> {
  const config: AxiosRequestConfig = {
    method: 'post',
    baseURL: __API__,
    url: route,
    data: reqParams,
    headers: {},
  };
  if (authToken && authToken.length > 10) config.headers.Authorization = authToken;
  return axios(config).then((r) => r.data) as any;
  // .catch((e) => {
  //   return checkAxiosError(e);
  // })
}

function toFormData(reqParams: { [name: string]: string|Blob|Array<Blob>|Array<string>|null|number|boolean }) {
  const formData = new FormData();
  for (const [propName, propVal] of Object.entries(reqParams)) {
    if (Array.isArray(propVal)) {
      for (const propValItem of propVal) {
        formData.set(propName, propValItem);
      }
    } else if (propVal != null) {
      if (typeof propVal === 'number' || typeof propVal === 'boolean') {
        formData.set(propName, propVal.toString());
      } else {
        formData.set(propName, propVal);
      }
    }
  }
  return formData;
}

export const apiSpecial = {
  '/devs/upload-new-firmware-version': (reqParams: ApiParams['/devs/upload-new-firmware-version']&{ file: Blob }) => instance.post<ApiResps['/devs/upload-new-firmware-version']>('/devs/upload-new-firmware-version', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-dacs-batch': (reqParams: ApiParams['/check-client-dacs-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-dacs-batch']>('/check-client-dacs-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/export-client-dacs-batch-input': (reqParams: ApiParams['/export-client-dacs-batch-input']) => instance.post<ApiResps['/export-client-dacs-batch-input']>('/export-client-dacs-batch-input', reqParams, { responseType: 'blob' }),
  '/check-client-duts-batch': (reqParams: ApiParams['/check-client-duts-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-duts-batch']>('/check-client-duts-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-dmas-batch': (reqParams: ApiParams['/check-client-dmas-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-dmas-batch']>('/check-client-dmas-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-dams-batch': (reqParams: ApiParams['/check-client-dams-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-dams-batch']>('/check-client-dams-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-supervisors-batch': (reqParams: ApiParams['/check-client-supervisors-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-supervisors-batch']>('/check-client-supervisors-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-units-batch': (reqParams: ApiParams['/check-client-units-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-units-batch']>('/check-client-units-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-roomtypes-batch': (reqParams: ApiParams['/check-client-roomtypes-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-roomtypes-batch']>('/check-client-roomtypes-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-assets-batch': (reqParams: ApiParams['/check-client-assets-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-assets-batch']>('/check-client-assets-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/check-client-unified-batch': (reqParams: ApiParams['/check-client-unified-batch']&{ file: Blob }) => instance.post<ApiResps['/check-client-unified-batch']>('/check-client-unified-batch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/upload-dri-varscfg': (reqParams: ApiParams['/upload-dri-varscfg']&{ file: Blob }) => instance.post<ApiResps['/upload-dri-varscfg']>('/upload-dri-varscfg', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/dac/export-unit-report': (reqParams: ApiParams['/dac/export-unit-report']) => instance.post<ApiResps['/dac/export-unit-report']>('/dac/export-unit-report', reqParams, { responseType: 'blob' }),
  '/dac/export-preventive-report': (reqParams: ApiParams['/dac/export-preventive-report']) => instance.post<ApiResps['/dac/export-preventive-report']>('/dac/export-preventive-report', reqParams, { responseType: 'blob' }),
  '/export-dacs-faults': (reqParams: ApiParams['/export-dacs-faults']) => instance.post<ApiResps['/export-dacs-faults']>('/export-dacs-faults', reqParams, { responseType: 'blob' }),
  '/devtools/export-dacs-info': (reqParams: ApiParams['/devtools/export-dacs-info']) => instance.post<ApiResps['/devtools/export-dacs-info']>('/devtools/export-dacs-info', reqParams, { responseType: 'blob' }),
  '/devtools/export-duts-info': (reqParams: ApiParams['/devtools/export-duts-info']) => instance.post<ApiResps['/devtools/export-duts-info']>('/devtools/export-duts-info', reqParams, { responseType: 'blob' }),
  '/devtools/export-dams-info': (reqParams: ApiParams['/devtools/export-dams-info']) => instance.post<ApiResps['/devtools/export-dams-info']>('/devtools/export-dams-info', reqParams, { responseType: 'blob' }),
  '/analise-integrada-export': (reqParams: ApiParams['/analise-integrada-export']) => instance.post<ApiResps['/analise-integrada-export']>('/analise-integrada-export', reqParams, { responseType: 'blob' }),
  '/unit/export-real-time': (reqParams: ApiParams['/unit/export-real-time']) => instance.post<ApiResps['/unit/export-real-time']>('/unit/export-real-time', reqParams, { responseType: 'blob' }),
  '/unit/upload-ground-plan': (reqParams: ApiParams['/unit/upload-ground-plan']&{ photo: Blob }) => instance.post<ApiResps['/unit/upload-ground-plan']>('/unit/upload-ground-plan', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/upload-service/upload-image': (reqParams: ApiParams['/upload-service/upload-image']&{ file: Blob }) => instance.post<ApiResps['/upload-service/upload-image']>('/upload-service/upload-image', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
  '/upload-service/upload-sketch': (reqParams: ApiParams['/upload-service/upload-sketch']&{ file: Blob }) => instance.post<ApiResps['/upload-service/upload-sketch']>('/upload-service/upload-sketch', toFormData(reqParams), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data),
};

interface ApiWithUpload {
  '/devs/upload-new-firmware-version': { file: Blob },
  '/check-client-dacs-batch': { file: Blob },
  '/check-client-duts-batch': { file: Blob },
  '/check-client-dmas-batch': { file: Blob },
  '/check-client-dams-batch': { file: Blob },
  '/check-client-dris-batch': { file: Blob },
  '/check-client-supervisors-batch': { file: Blob },
  '/check-client-units-batch': { file: Blob },
  '/check-client-roomtypes-batch': { file: Blob },
  '/check-client-assets-batch': { file: Blob },
  '/check-client-invoices-batch': { file: Blob },
  '/check-client-unified-batch': { file: Blob },
  '/upload-service/upload-sketch': { file: Blob },
  '/upload-dri-varscfg': { file: Blob|null },
  '/vt/set-vt-info': { PLANTABAIXA_IMG: string[], AUTORIZACAO_IMG: string[] },
  '/vt/update-vt-info': { PLANTABAIXA_IMG: string[], AUTORIZACAO_IMG: string[] },
  '/unit/upload-ground-plan': { photo: Blob },
  '/upload-service/upload-image': { file: Blob }
}
export function apiCallFormData<Key extends keyof ApiWithUpload>(key: Key, reqParams: Parameters<FullApi[Key]>[0], files: ApiWithUpload[Key]) {
  return instance.post<ApiResps[Key]>(key, toFormData({ ...reqParams, ...files }), { headers: { 'content-type': 'multipart-form-data' } }).then((r) => r.data);
}

interface ApiWithDownload {
  '/export-client-dacs-batch-input': true,
  '/dac/export-unit-report': true,
  '/dac/export-preventive-report': true,
  '/export-dacs-faults': true,
  '/devtools/export-dacs-info': true,
  '/devtools/export-duts-info': true,
  '/devtools/export-dams-info': true,
  '/analise-integrada-export': true,
  '/export-client-assets-batch-input': true,
  '/export-client-unified-batch-input': true,
  '/invoice/get-invoice-pdf': true,
  '/upload-service/download-sketches': true,
  '/devtools/brokers-monitor-disconnected-devs': true,
  '/devtools/export-duts-mean-temperatures': true,
  '/get-assets-sheet-manual': true,
  '/get-private-unit-report-file': true,
  '/devtools/export-duts-temperatures': true,
  '/devtools/export-waters-usages': true,
  '/unified/export-unified-example': true,
  '/unit/export-real-time': true,
  '/dri/export-chiller-alarms-hist': true,
  '/energy/export-energy-analysis-list': true,
  '/machines/export-machines-analysis-list': true,
}
export function apiCallDownload<Key extends keyof ApiWithDownload>(key: Key, reqParams: Parameters<FullApi[Key]>[0]) {
  return instance.post<ApiResps[Key]>(key, reqParams, { responseType: 'blob' });
}
