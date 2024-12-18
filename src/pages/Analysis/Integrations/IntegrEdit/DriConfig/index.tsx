import { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { colors } from '~/styles/colors';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { Flex } from 'reflexbox';
import {
  Button,
  ClearSelect,
  Input,
  Loader,
} from '~/components';
import { Select } from '~/components/NewSelect';
import { getUserProfile } from '~/helpers/userProfile';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { useDebouncedRender, useStateVar } from '~/helpers/useStateVar';
import { apiCall, apiCallFormData, ApiResps } from '~/providers';
import { Headers2 } from '../../../Header';
import { SearchInput } from '../../../styles';
import { BtnClean } from '../styles';

import {
  driApplicationOpts,
  driMeterApplications,
  driProtocolsOpts,
  driParityOpts,
  driStopBitsOpts,
  driLayerOpts,
  currentCapacityOpts,
  installationTypeOpts,
  driVAVsApplications,
  driApplicationCfgs,
  driFancoilsApplications,
  driChillerCarrierApplications,
  vavFancoilValveTypes,
} from '~/helpers/driConfigOptions';
import { checkProtocolValue } from '~/helpers/driConfig';
import { useTranslation } from 'react-i18next';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { Label } from '~/components/FormMachine/styles';
import { OverLay } from '~/components/EnergyEfficiencyCard/styles';
import { getCachedDevInfo } from '~/helpers/cachedStorage';
import { DevFullInfo } from '~/store';
import { RssiComponent } from '../../IntegrRealTime/components/RssiComponent';
import { useWebSocket } from '~/helpers/wsConnection';
import { verifyAndUpdateRSSI } from '~/helpers/rssi';
import { DriConfigParameters } from './DriConfigParameters';
import { DriConfigState } from '../types';
import { DriConfigAutomation } from './DriConfigAutomation';
import { DriConfigChillerCarrier } from './DriConfigChillerCarrier';
import { DriConfigEnergyMeter } from './DriConfigEnergyMeter';
import { DriConfigSchedulesAutomation } from './DriConfigSchedulesAutomation';

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
function valueOrNull(value) {
  return value ?? null;
}

const MANUFACTURER = 'Diel Energia';

export const DriConfig = (props: {
  devInfoResp: ApiResps['/get-integration-info'],
  varsList: {
    varId: string
    name: string
    currVal?: string
    valUnit?: string
    card?: string
    subcard?: string
    relevance?: string | number
  }[],
  cards: string[],
  subcards: string[],
  relevances: string[],
}): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar<DriConfigState>({
    isLoading: false,
    devInfo: null as null|DevFullInfo,
    modbusBaudRate: '',
    listModelsChiller: {} as { ID: number, MODEL_NAME: string }[],
    driApplication: null as null | string,
    driMeterModel: null as null | { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string },
    driChillerCarrierModel: null as null | { id: string, name: string },
    driChillerCarrierLine: null as null | { id: string, name: string },
    driVavFancoilModel: null as null | string,
    thermManuf: null as null | string,
    valveManuf: null as null | string,
    otherValveManuf: '',
    valveModel: '',
    selectedValveModel: vavFancoilValveTypes[0],
    vavBoxManuf: null as null | string,
    vavBoxModel: '',
    fancoilManuf: null as null | string,
    fancoilModel: '',
    otherFancoilManuf: '',
    roomName: '',
    vavLoaded: false,
    fancoilLoaded: false,
    driProtocol: null as null | string,
    driParity: null as null | string,
    driLayer: null as null | string,
    driStopBits: null as null | string,
    driSendInterval: '',
    selectedCurrentCapacity: null as null | { name: string, value: string },
    selectedInstallationType: null as null | { name: string, value: string },
    driSlaveId: '',
    driCfgFile: null as null | (Blob & { name: string }),
    comboOpts: {
      clients: [] as { NAME: string, CLIENT_ID: number }[],
      states: [] as { STATE_NAME: string, STATE_ID: string }[],
      cities: [] as { CITY_NAME: string, CITY_ID: string, STATE_ID: string }[],
      units: [] as { UNIT_NAME: string, UNIT_ID: number }[],
      duts: [] as { comboLabel: string, DUT_ID: string }[],
      enableEco: [{ name: t('sim'), value: 1 }, { name: t('nao'), value: 0 }],
      ecoModeCfg: [{ name: t('desligar'), value: 'eco-D' }, { name: t('ventilar'), value: 'eco-V' }],
      meterModels: [] as { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string }[],
      thermManuf: [] as string[],
      valveManuf: [] as string[],
      boxManuf: [] as string[],
      fancoilManuf: [] as string[],
      fancoilValveManuf: [] as string[],
      groups: [] as { label: string, value: number, withDacAut?: boolean, checked?: boolean, unit: number}[],
      assets: [] as { value: number, label: string, name: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null, MCHN_APPL: string|null, MCHN_BRAND: string|null }[],
      chillerLines: [] as { name: string, id: string }[],
      chillerModels: [] as { name: string, id: string }[],
      applications: [
        { name: t('Automação'), value: 'automation' },
        { name: 'Chiller', value: 'chiller-carrier' },
        { name: t('MedicaodeEnergia'), value: 'medidor-energia' },
      ],
      automation: [
        { name: 'Carrier Ecosplit', value: 'carrier-ecosplit' },
        { name: 'Fancoil', value: 'fancoil' },
        { name: 'VAV', value: 'vav' },
      ],
    },
    formData: {
      CLIENT_ID_item: null as null | { NAME: string, CLIENT_ID: number },
      UNIT_ID_item: null as null | { UNIT_NAME: string, UNIT_ID: number },
      GROUP_ID_item: null as null|{ label: string, value: number, unit: number, name?: string },
      ASSET_ID_item: null as null|{ value: number, label: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null },
      establishmentName: '',
      REL_DUT_ID_item: null as null | { comboLabel: string, DUT_ID: string },
      ENABLE_ECO_item: null as null | { name: string, value: number },
      ECO_MODE_CFG_item: null as null | { name: string, value: string },
      ECO_INTERVAL_TIME: '',
      ECO_OFST_START: '',
      ECO_OFST_END: '',
      AUTOMATION_INTERVAL_TIME: '5',
    },
    persistedAssetDevice: null as null|{ value: number, label: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null },
    varsCfg: props.devInfoResp.dri,
    openModal: null as null | 'add-unit',
    rooms: [] as { RTYPE_ID: number, RTYPE_NAME: string }[],
    roomDutInfo: null as null | undefined | { DEV_ID?: string, RTYPE_NAME?: string, ROOM_NAME?: string, TUSEMIN?: number, TUSEMAX?: number},
    rssi: '',
    application: null,
    automation: null,
  });
  const debouncedRender = useDebouncedRender(render);

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  function onWsOpen(wsConn) {
    wsConn.send({ type: 'driSubscribeRealTime', data: { DRI_ID: props.devInfoResp.info.integrId } });
  }

  function onWsMessage(response) {
    if (response && response.type === 'driTelemetry') {
      updateRssi(response);
      debouncedRender();
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'driUnsubscribeRealTime' });
  }

  const updateRssi = (payload) => {
    const rssi = verifyAndUpdateRSSI(payload);
    if (rssi) {
      state.rssi = t(rssi, { defaultValue: '-' });
      render();
    }
  };

  const setDriApplication = (driCfg: ApiResps['/get-integration-info']['dri']) => {
    if (driCfg?.application && getKeyByValue(driMeterApplications, driCfg.application)) setDriApplicationEnergy(driCfg);
    else if (driCfg?.application && getKeyByValue(driVAVsApplications, driCfg.application)) setDriApplicationVAV(driCfg);
    else if (driCfg?.application && getKeyByValue(driFancoilsApplications, driCfg.application)) setDriApplicationFancoil(driCfg);
    else if (driCfg?.application && getKeyByValue(driChillerCarrierApplications, driCfg.application)) setDriApplicationChillerCarrier(driCfg);
    else if (driCfg?.application === 'carrier-ecosplit') setDriApplicationCarrierEcosplit();
    else if (driCfg?.chillerName) setDriApplicationChillerName(driCfg);
    else {
      state.driApplication = getKeyByValue(driApplicationOpts, driCfg?.application) ?? null;
    }
  };

  function getOptionByValue<T>(options: T, value: string) {
    return Array.isArray(options) ? (options.find((item) => item.value === value) ?? null) : null;
  }

  const setDriApplicationEnergy = (driCfg) => {
    state.application = getOptionByValue(state.comboOpts.applications, 'medidor-energia');
    state.driApplication = 'Medidor de Energia';
    state.driMeterModel = valueOrNull(state.comboOpts.meterModels.find((opt) => opt.NAME === getKeyByValue(driMeterApplications, driCfg.application)));
  };
  const setDriApplicationVAV = (driCfg) => {
    state.application = getOptionByValue(state.comboOpts.applications, 'automation');
    state.automation = getOptionByValue(state.comboOpts.automation, 'vav');
    state.driApplication = 'VAV';
    state.driVavFancoilModel = valueOrNull(getKeyByValue(driVAVsApplications, driCfg.application));
  };
  const setDriApplicationFancoil = (driCfg) => {
    state.application = getOptionByValue(state.comboOpts.applications, 'automation');
    state.automation = getOptionByValue(state.comboOpts.automation, 'fancoil');
    state.driApplication = 'Fancoil';
    state.driVavFancoilModel = valueOrNull(getKeyByValue(driFancoilsApplications, driCfg.application));
  };
  const setDriApplicationChillerCarrier = (driCfg) => {
    state.application = getOptionByValue(state.comboOpts.applications, 'chiller-carrier');
    state.driApplication = 'Chiller Carrier';
    const model = getKeyByValue(driChillerCarrierApplications, driCfg.application);
    state.driChillerCarrierLine = model ? { name: model, id: model } : null;
  };
  const setDriApplicationChillerName = (driCfg) => {
    state.application = getOptionByValue(state.comboOpts.applications, 'chiller-carrier');
    state.driApplication = 'Chiller Carrier';
    const model = driCfg?.chillerName;
    state.driChillerCarrierLine = model ? { name: model, id: model } : null;
  };
  const setDriApplicationCarrierEcosplit = () => {
    state.application = getOptionByValue(state.comboOpts.applications, 'automation');
    state.automation = getOptionByValue(state.comboOpts.automation, 'carrier-ecosplit');
    state.driApplication = 'Carrier ECOSPLIT';
  };

  const setDriCfg = (driCfg: ApiResps['/get-integration-info']['dri']) => {
    setDriApplication(driCfg);
    state.driProtocol = valueOrNull(getKeyByValue(driProtocolsOpts, driCfg?.protocol));
    const parity = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'mdb_parity'))?.value;
    state.driParity = (parity !== undefined) ? Object.keys(driParityOpts)[parity] : null;
    const serialMode = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'serial_mode'))?.value;
    state.driLayer = (serialMode !== undefined) ? Object.keys(driLayerOpts)[Number(serialMode) - 1] : null;
    const stopBits = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'mdb_stopbits'))?.value;
    state.driStopBits = (stopBits !== undefined) ? Object.keys(driStopBitsOpts)[stopBits] : null;
    state.driSendInterval = ['Medidor de energia', 'Carrier ECOSPLIT'].includes(String(state.driApplication)) ? '900' : (driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value?.toString() ?? '');
    state.modbusBaudRate = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'mdb_baud'))?.value?.toString() ?? '';
    const findCapacity = driCfg?.varsList?.find((v) => v.name === 'Capacidade TC');
    const capacityTc = findCapacity?.address?.value ?? findCapacity?.value;
    state.selectedCurrentCapacity = capacityTc && currentCapacityOpts.find((opt) => opt.value === (Number(capacityTc) / 2).toString()) || null;
    const findInstallationType = driCfg?.varsList?.find((v) => v.name === 'Tipo Instalação');
    const installationType = findInstallationType?.address?.value ?? findInstallationType?.value;
    state.selectedInstallationType = installationType && state.driMeterModel && installationTypeOpts[state.driMeterModel.NAME]?.find((opt) => opt.value === installationType) || null;
    state.driSlaveId = (['Nexus II', 'EM210', 'iKRON 03', 'ET330', 'ETE-30', 'ETE-50', 'Schneider PM2100', 'Schneider PM210', 'Schneider PM9C', '30HXE', '30XAB', '30GXE', '30HXF', '30XAB', 'MULT-K', 'MULT-K 05', 'MULT-K 120'].includes(state.driMeterModel?.NAME ?? state.driChillerCarrierLine?.name ?? '') && driCfg?.varsList?.find((item) => item.address)?.address?.id?.toString()) || '';
  };

  async function loadPlaceConfig() {
    const { devInfoResp } = props;
    setState({ isLoading: true });
    fetchUnits(devInfoResp.info.CLIENT_ID);
    const { info: driInfo, dri: driCfg } = devInfoResp;
    state.devInfo = await getCachedDevInfo(driInfo.integrId, { forceFresh: true });

    state.formData.CLIENT_ID_item = (driInfo.CLIENT_ID) ? { NAME: driInfo.CLIENT_NAME, CLIENT_ID: driInfo.CLIENT_ID } : null;
    state.formData.UNIT_ID_item = (driInfo.CLIENT_ID && driInfo.UNIT_ID) ? { UNIT_NAME: driInfo.UNIT_NAME, UNIT_ID: driInfo.UNIT_ID } : null;
    render();

    await updateGroups();
    render();
    const group = state.comboOpts.groups.find((group) => (group.unit === state.formData.UNIT_ID_item?.UNIT_ID && group.value === state.devInfo?.GROUP_ID));
    if (group) {
      // @ts-ignore
      state.formData.GROUP_ID_item = {
        value: group.value,
        name: group.label,
        unit: group.unit,
      };
    }
    render();

    await updateAssets();
    render();
    for (const asset of state.comboOpts.assets) {
      if (asset.value === state.devInfo?.ASSET_ID) {
        state.formData.ASSET_ID_item = asset;
      }
    }
    render();

    const asset = await apiCall('/clients/get-asset-info', { DEV_ID: state.devInfo?.DEV_ID });
    if (asset?.info) {
      state.persistedAssetDevice = {
        value: asset.info.ASSET_ID,
        label: asset.info.AST_DESC,
        UNIT_ID: asset.info.UNIT_ID,
        GROUP_ID: asset.info.GROUP_ID,
        DEV_ID: asset.info.DEV_ID,
        ASSET_ROLE: asset.info.AST_ROLE || 0,
        CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID as number,
        DAT_INDEX: asset.info.DAT_INDEX,
        DAT_ID: asset.info.DAT_ID,
      };
    } else {
      state.persistedAssetDevice = null;
    }

    setDriCfg(driCfg);
    if (state.driApplication === 'Chiller Carrier') {
      setVariablesChiller(driCfg?.chillerName ?? state.driChillerCarrierLine?.name);
    }
    setState({ isLoading: false });
    render();
  }

  const loadVavConfig = (VAV_ID: string) => {
    apiCall('/dri/get-dri-vav-info', { VAV_ID })
      .then((value) => {
        state.thermManuf = value.THERM_MANUF ?? null;
        state.valveManuf = value.VALVE_MANUF ?? null;
        state.valveModel = value.VALVE_MODEL ?? '';
        state.selectedValveModel = vavFancoilValveTypes.find((item) => item.value === value.VALVE_TYPE) ?? vavFancoilValveTypes[0];
        state.vavBoxManuf = value.BOX_MANUF ?? null;
        state.vavBoxModel = value.BOX_MODEL ?? '';
        state.roomName = value.ROOM_NAME ?? '';
      })
      .catch((err) => {
        console.log(err);
        toast.error(t('erroBuscarInformacoesVavDri'));
      });
    state.vavLoaded = true;
  };

  const loadFancoilConfig = (FANCOIL_ID: string) => {
    apiCall('/dri/get-dri-fancoil-info', { FANCOIL_ID })
      .then((value) => {
        if (value) {
          state.thermManuf = value.THERM_MANUF ?? null;
          state.driVavFancoilModel = value.THERM_MODEL ?? null;
          state.valveManuf = value.VALVE_MANUF ?? null;
          state.valveModel = value.VALVE_MODEL ?? '';
          state.selectedValveModel = vavFancoilValveTypes.find((item) => item.value === value.VALVE_TYPE) ?? vavFancoilValveTypes[0];
          state.fancoilManuf = value.FANCOIL_MANUF ?? null;
          state.fancoilModel = value.FANCOIL_MODEL ?? '';
          render();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(t('erroBuscarInformacoesFancoilDri'));
      });
    state.fancoilLoaded = true;
  };

  const loadEcoConfig = (driInfo: ApiResps['/get-integration-info']['info'], driCfg: ApiResps['/get-integration-info']['dri']) => {
    state.formData.REL_DUT_ID_item = (driCfg?.ecoCfg.DUT_ID) ? { DUT_ID: driCfg.ecoCfg.DUT_ID, comboLabel: driInfo.roomName } : null;
    state.formData.ENABLE_ECO_item = state.comboOpts.enableEco.find((opt) => opt.value === driCfg?.ecoCfg.ENABLE_ECO) ?? null;
    state.formData.ECO_MODE_CFG_item = state.comboOpts.ecoModeCfg.find((opt) => opt.value === driCfg?.ecoCfg.ECO_CFG) ?? null;
    state.formData.ECO_INTERVAL_TIME = driCfg?.ecoCfg.ECO_INT_TIME?.toString() ?? '';
    state.formData.ECO_OFST_START = driCfg?.ecoCfg.ECO_OFST_START?.toString() ?? '';
    state.formData.ECO_OFST_END = driCfg?.ecoCfg.ECO_OFST_END?.toString() ?? '';
  };

  const loadAutomationConfig = (): void => {
    const { devInfoResp } = props;
    state.formData.AUTOMATION_INTERVAL_TIME = devInfoResp.dri?.automationCfg.AUTOMATION_INTERVAL ? String(devInfoResp.dri.automationCfg.AUTOMATION_INTERVAL) : '5';
  };

  function loadConfig() {
    const { devInfoResp } = props;
    const { info: driInfo, dri: driCfg } = devInfoResp;

    if (driCfg?.application?.startsWith('vav') && !state.vavLoaded) {
      loadVavConfig(devInfoResp.info.integrId);
    }

    if (driCfg?.application?.startsWith('fancoil') && !state.fancoilLoaded) {
      loadFancoilConfig(devInfoResp.info.integrId);
    }

    state.formData.establishmentName = driInfo.establishmentName ?? driInfo.machineName ?? '';
    state.driChillerCarrierModel = devInfoResp.dri?.chillerModel ? { id: devInfoResp.dri?.chillerModel, name: devInfoResp.dri?.chillerModel } : null;
    render();
    setDriApplication(driCfg);
    render();
    loadEcoConfig(driInfo, driCfg);
    loadAutomationConfig();

    render();
  }

  function fancoilForEach(opt, thermManuf, fancoilValveManuf, fancoilManuf) {
    if (opt.type === 'THERM_MANUF') thermManuf.push(opt.label);
    if (opt.type === 'VALVE_MANUF') {
      if (opt.label === 'Outro (digitar)') {
        fancoilValveManuf.push(t('outroDigitar'));
      } else {
        fancoilValveManuf.push(opt.label);
      }
    }
    if (opt.type === 'FANCOIL_MANUF') {
      if (opt.label === 'Outro (digitar)') {
        fancoilManuf.push(t('outroDigitar'));
      } else {
        fancoilManuf.push(opt.label);
      }
    }
  }

  function vavsForEach(opt, thermManuf, valveManuf, boxManuf) {
    if (opt.type === 'THERM_MANUF') thermManuf.push(opt.label);
    if (opt.type === 'VALVE_MANUF') valveManuf.push(opt.label);
    if (opt.type === 'BOX_MANUF') boxManuf.push(opt.label);
  }

  function verifyComboOptsVav() {
    if (state.comboOpts.thermManuf.length > 0 && state.comboOpts.valveManuf.length > 0 && state.comboOpts.boxManuf.length > 0) {
      return true;
    }
    return false;
  }

  function verifyComboOptsFancoil() {
    if (state.comboOpts.thermManuf.length > 0 && state.comboOpts.fancoilValveManuf.length > 0 && state.comboOpts.fancoilManuf.length > 0) {
      return true;
    }
    return false;
  }

  function verifyPermissions() {
    if (!profile.manageAllClients && !profile.permissions.isInstaller && !verifyAutomPermission()) {
      return true;
    }
    return false;
  }

  function verifyOpenModalAndStates() {
    let isReturn = false;
    if (state.openModal !== 'add-unit') isReturn = true;
    if (state.comboOpts.states.length > 0) isReturn = true;
    return isReturn;
  }

  function verifyOpenModalAndCities() {
    let isReturn = false;
    if (state.openModal !== 'add-unit') isReturn = true;
    if (state.comboOpts.cities.length > 0) isReturn = true;
    return isReturn;
  }

  function verifyOpenPermissionAndClients() {
    let isReturn = false;
    if (verifyPermissions()) isReturn = true;
    if (state.comboOpts.clients.length > 0) isReturn = true;
    return isReturn;
  }

  function verifyComboLabel(item) {
    if (item.ROOM_NAME) {
      return item.ROOM_NAME;
    }
    return item.DEV_ID;
  }

  function verifyAutomPermission() {
    return profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === props.devInfoResp?.info?.CLIENT_ID);
  }

  const verifyMeterModelsSort = (a, b) => {
    if (a.NAME.toLowerCase() < b.NAME.toLowerCase()) {
      return -1;
    }
    if (a.NAME.toLowerCase() > b.NAME.toLowerCase()) {
      return 1;
    }
    return 0;
  };

  useEffect(() => {
    if (verifyPermissions()) return;
    (async function () {
      try {
        await Promise.all([
          getClientsList(),
          getStatesList(),
          getCitiesList(),
          getDutsList(),
          getEnergyComboOpts(),
          getChillerComboOpts(),
          getVavComboOpts(),
          getFancoilComboOpts(),
        ]);
      } catch (err) { console.log(err); toast.error(t('erro')); }
    }());
  }, [state.openModal]);

  const getClientsList = async () => {
    if (verifyOpenPermissionAndClients()) return;
    const { list } = await apiCall('/clients/get-clients-list', {});
    const formattedList = list.map((item) => ({ CLIENT_ID: item.CLIENT_ID, NAME: item.NAME }));
    setState({ comboOpts: { ...state.comboOpts, clients: formattedList } });
  };

  const getStatesList = async () => {
    if (verifyOpenModalAndStates()) return;
    const { list } = await apiCall('/dac/get-states-list', { full: true });
    const formattedList = list.map((item) => ({ STATE_NAME: item.name, STATE_ID: item.id }));
    setState({ comboOpts: { ...state.comboOpts, states: formattedList } });
  };

  const getCitiesList = async () => {
    if (verifyOpenModalAndCities()) return;
    const { list } = await apiCall('/dac/get-cities-list', {});
    const formattedList = list.map((item) => ({ CITY_NAME: item.name, CITY_ID: item.id, STATE_ID: item.state }));
    setState({ comboOpts: { ...state.comboOpts, cities: formattedList } });
  };

  const getDutsList = async () => {
    if (state.comboOpts.duts.length > 0) return;
    const { list } = await apiCall('/dut/get-duts-list', { unitId: props.devInfoResp.info.UNIT_ID });
    const notAutomatedList = list.filter((item) => !item.automationEnabled);
    const formattedList = notAutomatedList.map((item) => ({ comboLabel: verifyComboLabel(item), DUT_ID: item.DEV_ID }));
    setState({ comboOpts: { ...state.comboOpts, duts: formattedList } });
  };

  const getEnergyComboOpts = async () => {
    if (state.comboOpts.meterModels.length > 0) return;
    const { manufacturersList, modelsList } = await apiCall('/energy/get-energy-combo-opts', {});
    const dielManuf = manufacturersList.find((manuf) => manuf.NAME === 'Diel Energia');
    const driMeterModels = modelsList.filter((model) => model.MANUFACTURER_ID === dielManuf?.MANUFACTURER_ID);
    const driMeterModelsSort = driMeterModels.slice().sort(verifyMeterModelsSort);
    setState({ comboOpts: { ...state.comboOpts, meterModels: driMeterModelsSort } });
  };

  const getChillerComboOpts = async () => {
    if (state.comboOpts.chillerLines.length > 0) return;
    const { chillerLines, chillerModels } = await apiCall('/dri/get-chiller-combo-opts', {});
    const formattedList = chillerLines.filter((item) => item.LINE_NAME !== '30GXE').map((item) => ({ name: item.LINE_NAME, id: item.LINE_NAME }));
    const formattedListModels = chillerModels.map((item) => ({ name: item.MODEL_NAME, id: item.MODEL_NAME }));
    setState({ comboOpts: { ...state.comboOpts, chillerLines: formattedList, chillerModels: formattedListModels }, listModelsChiller: chillerModels });
  };

  const getVavComboOpts = async () => {
    if (verifyComboOptsVav()) return;
    const { vavs } = await apiCall('/dev/dev-info-combo-options', { vavs: true });
    const thermManuf = [] as string[];
    const valveManuf = [] as string[];
    const boxManuf = [] as string[];
    vavs?.forEach((opt) => {
      vavsForEach(opt, thermManuf, valveManuf, boxManuf);
    });
    setState({
      comboOpts: {
        ...state.comboOpts, thermManuf, valveManuf, boxManuf,
      },
    });
  };

  const getFancoilComboOpts = async () => {
    if (verifyComboOptsFancoil()) return;
    const { fancoils } = await apiCall('/dev/dev-info-combo-options', { fancoils: true });
    const thermManuf = [] as string[];
    const fancoilValveManuf = [] as string[];
    const fancoilManuf = [] as string[];
    fancoils?.forEach((opt) => {
      fancoilForEach(opt, thermManuf, fancoilValveManuf, fancoilManuf);
    });

    setState({
      comboOpts: {
        ...state.comboOpts, thermManuf, fancoilValveManuf, fancoilManuf,
      },
    });
  };

  useEffect(() => {
    if (!profile.manageAllClients && !profile.permissions.isInstaller && !verifyAutomPermission()) return;

    if (state.formData.UNIT_ID_item?.UNIT_ID) {
      loadConfig();
    }
  }, [profile.manageAllClients, profile.permissions.isInstaller, state.formData.UNIT_ID_item?.UNIT_ID]);

  useEffect(() => {
    if (!profile.manageAllClients && !profile.permissions.isInstaller && !verifyAutomPermission()) return;
    loadPlaceConfig();
  }, []);

  const updateUnits = async () => {
    const clientId = state.formData.CLIENT_ID_item?.CLIENT_ID ?? null;
    await fetchUnits(clientId);
  };

  const updateGroups = async () => {
    const { groups } = await apiCall('/dev/dev-info-combo-options', { CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID, UNIT_ID: state.formData.UNIT_ID_item?.UNIT_ID, groups: true });
    const groupFiltered = groups?.filter((group) => (group.unit === state.formData.UNIT_ID_item?.UNIT_ID));
    setState({ comboOpts: { ...state.comboOpts, groups: groupFiltered || [] } });
  };

  const updateAssets = async () => {
    const machinesAssetsList = state.formData.UNIT_ID_item?.UNIT_ID ? await apiCall('/clients/get-machines-list', { unitIds: [state.formData.UNIT_ID_item.UNIT_ID] }) : [];
    const assets = [] as { value: number, label: string, name: string, UNIT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, CLIENT_ID: number, DAT_INDEX: number|null, DAT_ID: string|null, MCHN_APPL: string|null, MCHN_BRAND: string|null }[];
    for (const item of machinesAssetsList) {
      item.assets.forEach((asset) => {
        if (item.GROUP_ID === state.formData.GROUP_ID_item?.value && asset.AST_ROLE === 5 && asset.MCHN_APPL === 'chiller') {
          assets.push({
            value: asset.ASSET_ID,
            label: asset.AST_DESC,
            name: asset.AST_DESC,
            UNIT_ID: asset.UNIT_ID,
            GROUP_ID: item.GROUP_ID,
            DEV_ID: asset.DEV_ID,
            ASSET_ROLE: asset.AST_ROLE || 0,
            CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID as number,
            DAT_INDEX: asset.DAT_INDEX,
            DAT_ID: asset.DAT_ID,
            MCHN_APPL: asset.MCHN_APPL,
            MCHN_BRAND: asset.MCHN_BRAND,
          });
        }
      });
    }
    setState({ comboOpts: { ...state.comboOpts, assets } });
  };

  function getDriApplication() {
    let driApplication;
    if (state.driApplication === 'Medidor de Energia' && state.driMeterModel) {
      driApplication = driMeterApplications[state.driMeterModel.NAME];
    } else if (state.driApplication === 'VAV' && state.driVavFancoilModel) {
      driApplication = driVAVsApplications[state.driVavFancoilModel];
    } else if (state.driApplication === 'Fancoil' && state.driVavFancoilModel) {
      driApplication = driFancoilsApplications[state.driVavFancoilModel];
    } else if (state.driApplication === 'Chiller Carrier' && state.driChillerCarrierLine) {
      driApplication = driChillerCarrierApplications[state.driChillerCarrierLine.name];
    } else {
      driApplication = state.driApplication && driApplicationOpts[state.driApplication];
    }
    return driApplication;
  }

  function verifyDriProtocol(driProtocol, modbusBaudRate, parity, stopBits, sendInterval) {
    if (driProtocol && (['modbus-rtu', 'carrier-ecosplit', 'Carrier ECOSPLIT'].includes(driProtocol)) && !modbusBaudRate) {
      alert(t('alertaInformeBaudRate'));
      return true;
    }
    if (driProtocol && (['modbus-rtu', 'carrier-ecosplit', 'Carrier ECOSPLIT'].includes(driProtocol)) && !parity) {
      alert(t('alertaInformeParidade'));
      return true;
    }
    if (driProtocol && (['modbus-rtu', 'carrier-ecosplit', 'Carrier ECOSPLIT'].includes(driProtocol)) && !stopBits) {
      alert(t('alertaInformeStopBits'));
      return true;
    }
    if (driProtocol && (['modbus-rtu', 'carrier-ecosplit', 'Carrier ECOSPLIT'].includes(driProtocol)) && !sendInterval) {
      alert(t('alertaInformeIntervaloEnvio'));
      return true;
    }
    return false;
  }

  function verifyDriProtocolAndModel(driProtocol, slaveId, capacityTc, installationType, driLayer) {
    if (driProtocol && ['EM210', 'MULT-K', 'MULT-K 05', 'MULT-K 120', 'Nexus II', 'Schneider PM2100'].includes(state.driMeterModel?.NAME || '') && slaveId == null) {
      alert(t('alertaInformeEnderecoId'));
      return true;
    }
    if (driProtocol && ['EM210', 'MULT-K', 'MULT-K 05'].includes(state.driMeterModel?.NAME || '') && !capacityTc) {
      alert(t('alertaInformeCapacidadeCorrente'));
      return true;
    }
    if (driProtocol && ['EM210'].includes(state.driMeterModel?.NAME || '') && !installationType) {
      alert(t('alertaInformeTipoInstalacaoEletrica'));
      return true;
    }
    if (driProtocol && ['Nexus II', 'Schneider PM2100'].includes(state.driMeterModel?.NAME || '') && !driLayer) {
      alert(t('alertaInfomeCamadaFisica'));
      return true;
    }
    if (['Nexus II'].includes(state.driMeterModel?.NAME || '') && !driProtocol) {
      alert(t('alertaInformeProtocoloComunicacao'));
      return true;
    }
    return false;
  }

  async function fancoilUpdate(lastApplication, driApplication) {
    if (lastApplication && (lastApplication?.startsWith('fancoil') && !driApplication?.startsWith('fancoil'))) {
      await apiCall('/dri/update-dri-fancoil', { FANCOIL_ID: props.devInfoResp.info.integrId, remove: true });
    } else if (driApplication?.startsWith('fancoil')) {
      await apiCall('/dri/update-dri-fancoil', {
        FANCOIL_ID: props.devInfoResp.info.integrId,
        THERM_MANUF: state.thermManuf,
        THERM_MODEL: state.driVavFancoilModel,
        VALVE_MANUF: state.valveManuf === t('outroDigitar') ? state.otherValveManuf : state.valveManuf,
        VALVE_MODEL: state.valveModel,
        VALVE_TYPE: state.selectedValveModel.value,
        FANCOIL_MANUF: state.fancoilManuf === t('outroDigitar') ? state.otherFancoilManuf : state.fancoilManuf,
        FANCOIL_MODEL: state.fancoilModel,
        THERM_T_MAX: 24,
        THERM_T_MIN: 21,
      });
    }
  }

  async function vavUpdate(lastApplication, driApplication) {
    if (lastApplication && (lastApplication?.startsWith('vav') && !driApplication?.startsWith('vav'))) {
      await apiCall('/dri/update-dri-vav', { VAV_ID: props.devInfoResp.info.integrId, remove: true });
    } else if (driApplication?.startsWith('vav')) {
      await apiCall('/dri/update-dri-vav', {
        VAV_ID: props.devInfoResp.info.integrId,
        THERM_MANUF: state.thermManuf,
        THERM_MODEL: state.driVavFancoilModel,
        VALVE_MANUF: state.valveManuf,
        VALVE_MODEL: state.valveModel,
        VALVE_TYPE: state.selectedValveModel.value,
        BOX_MANUF: state.vavBoxManuf,
        BOX_MODEL: state.vavBoxModel,
        ROOM_NAME: state.roomName,
      });
    }
  }

  async function energyMeterSetAndDelete(lastApplication) {
    if (state.driApplication === 'Medidor de Energia' && state.driMeterModel && state.formData.UNIT_ID_item && state.formData.CLIENT_ID_item) {
      await apiCall('/energy/set-energy-list-info', {
        UNIT_ID: state.formData.UNIT_ID_item.UNIT_ID,
        CLIENT_ID: state.formData.CLIENT_ID_item.CLIENT_ID,
        meters: [{
          MANUFACTURER, MODEL: state.driMeterModel.NAME, DRI_ID: props.devInfoResp.info.integrId, ESTABLISHMENT_NAME: state.formData.establishmentName,
        }],
      });
    }

    if (lastApplication && ['cg-et330', 'abb-nexus-ii', 'abb-ete-30', 'abb-ete-50', 'cg-em210', 'kron-mult-k', 'kron-mult-k-05', 'kron-mult-k-120', 'kron-ikron-03'].includes(lastApplication) && state.driApplication !== 'Medidor de Energia') {
      await apiCall('/energy/delete-energy-info', {
        MANUFACTURER, DRI_ID: props.devInfoResp.info.integrId, UNIT_ID: state.formData.UNIT_ID_item?.UNIT_ID, CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID,
      });
    }
  }

  function createVariables() {
    const driProtocol = state.driProtocol && driProtocolsOpts[state.driProtocol];
    const driLayer = state.driLayer ? driLayerOpts[state.driLayer] : undefined;
    const modbusBaudRate = state.modbusBaudRate || undefined;
    const parity = state.driParity ? driParityOpts[state.driParity] : undefined;
    const stopBits = state.driStopBits ? driStopBitsOpts[state.driStopBits] : undefined;
    let intervalTmp = state.driApplication === 'Medidor de Energia' ? '900' : undefined;
    intervalTmp = !intervalTmp && state.driApplication === 'Chiller Carrier' ? '60' : intervalTmp;
    const sendInterval = state.driSendInterval ? state.driSendInterval : intervalTmp;
    const capacityTc = state.selectedCurrentCapacity?.value || undefined;
    const installationType = state.selectedInstallationType?.value || undefined;
    const slaveId = (Number(state.driSlaveId) && state.driSlaveId) || undefined;

    return {
      driProtocol,
      driLayer,
      modbusBaudRate,
      parity,
      stopBits,
      sendInterval,
      capacityTc,
      installationType,
      slaveId,
    };
  }

  const handleEditAsset = async (driApplication: string) => {
    if (!driApplication || driApplication === 'chiller-carrier-30hxe' || driApplication === 'chiller-carrier-30gxe' || driApplication === 'chiller-carrier-30hxf' || driApplication === 'chiller-carrier-30xab' || driApplication === 'chiller-carrier-30xab-hvar') {
      if ((!state.formData.ASSET_ID_item && state.persistedAssetDevice) || (!state.devInfo?.GROUP_ID && state.persistedAssetDevice) || (state.persistedAssetDevice && state.formData.ASSET_ID_item && state.persistedAssetDevice.value !== state.formData.ASSET_ID_item.value)) {
        await apiCall('/clients/edit-asset', {
          ASSET_ID: state.persistedAssetDevice.value,
          DAT_ID: state.persistedAssetDevice.DAT_ID as string || undefined,
          AST_DESC: state.persistedAssetDevice.label,
          CLIENT_ID: state.persistedAssetDevice.CLIENT_ID,
          GROUP_ID: state.persistedAssetDevice.GROUP_ID,
          UNIT_ID: state.persistedAssetDevice.UNIT_ID,
          AST_ROLE: state.persistedAssetDevice.ASSET_ROLE,
          MCHN_MODEL: state.driChillerCarrierModel?.name,
          DEV_ID: null,
          OLD_DEV_ID: state.persistedAssetDevice.DEV_ID,
          DAT_INDEX: state.persistedAssetDevice.DAT_INDEX,
          CHILLER_CARRIER_MODEL_ID: state.listModelsChiller.find((item) => item.MODEL_NAME === state.driChillerCarrierModel?.name)?.ID ?? null,
        });
      }

      if (state.formData.ASSET_ID_item && state.formData.GROUP_ID_item) {
        await apiCall('/clients/edit-asset', {
          ASSET_ID: state.formData.ASSET_ID_item.value,
          DAT_ID: state.formData.ASSET_ID_item.DAT_ID as string || undefined,
          AST_DESC: state.formData.ASSET_ID_item.label,
          CLIENT_ID: state.formData.ASSET_ID_item.CLIENT_ID,
          GROUP_ID: state.formData.ASSET_ID_item.GROUP_ID,
          UNIT_ID: state.formData.ASSET_ID_item.UNIT_ID,
          AST_ROLE: state.formData.ASSET_ID_item.ASSET_ROLE,
          MCHN_MODEL: state.driChillerCarrierModel?.name,
          DEV_ID: state.devInfo?.DEV_ID,
          OLD_DEV_ID: state.formData.ASSET_ID_item.DEV_ID,
          DAT_INDEX: state.formData.ASSET_ID_item.DAT_INDEX,
          CHILLER_CARRIER_MODEL_ID: state.listModelsChiller.find((item) => item.MODEL_NAME === state.driChillerCarrierModel?.name)?.ID ?? null,
        });
      }
    }
  };

  function validateShipping() {
    if (state.driApplication === 'Chiller Carrier' && (!state.driChillerCarrierLine || !state.driChillerCarrierModel)) {
      toast.error(t('preencherModeloChiller'));
      return true;
    }
    return false;
  }

  function verifyValveType() {
    if (state.driApplication === 'Fancoil' || state.driApplication === 'VAV') {
      if (state.driVavFancoilModel?.toLowerCase().includes('bac-6000 amln')
      && (!state.selectedValveModel || !state.selectedValveModel.value)) {
        toast.error(t('preencherTipoAtuador'));
        return true;
      }
    }
    return false;
  }

  async function uploadSelectedDriConfigFile() {
    try {
      if (validateShipping()) {
        return;
      }

      const { dri: driCfg } = props.devInfoResp;
      const lastApplication = driCfg?.application;
      const driApplication = getDriApplication();

      const {
        driProtocol,
        driLayer,
        modbusBaudRate,
        parity,
        stopBits,
        sendInterval,
        capacityTc,
        installationType,
        slaveId,
      } = createVariables();

      if (verifyDriProtocol(driProtocol, modbusBaudRate, parity, stopBits, sendInterval)) {
        return;
      }

      if (verifyDriProtocolAndModel(driProtocol, slaveId, capacityTc, installationType, driLayer)) {
        return;
      }

      if (verifyValveType()) {
        return;
      }

      await vavUpdate(lastApplication, driApplication);

      await fancoilUpdate(lastApplication, driApplication);

      await Promise.all([
        (async () => {
          if (verifyPermissions()) return;
          const systemName = state.driApplication === 'Chiller Carrier' ? state.persistedAssetDevice?.label : state.formData.establishmentName;
          await apiCall('/dri/set-dri-info', {
            DRI_ID: props.devInfoResp.info.integrId,
            SYSTEM_NAME: systemName,
            UNIT_ID: state.formData.UNIT_ID_item?.UNIT_ID ?? null,
            CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID ?? null,
          });
        })(),
        (async () => {
          await handleEditAsset(driApplication);
        })(),

        apiCallFormData('/upload-dri-varscfg', {
          driId: props.devInfoResp.info.integrId,
          application: driApplication,
          protocol: driProtocol,
          serialMode: driLayer,
          modbusBaudRate,
          parity,
          stopBits,
          telemetryInterval: sendInterval,
          capacityTc,
          installationType,
          slaveId,
          worksheetName: state.driCfgFile?.name,
        }, {
          file: state.driCfgFile,
        }),
      ]);

      await energyMeterSetAndDelete(lastApplication);

      toast.success(t('sucessoSalvarConfiguracoes'));
      toast.success(t('sucessoReiniciarDispositivo'));
      history.push(history.location.pathname.replace('editar', history.location.pathname.includes('ativos') ? 'informacoes' : 'perfil'));
    } catch (err) {
      const error = err as AxiosError;
      console.log(err);
      if (error.response?.status !== 500) {
        toast.error(`${error.response?.data}`);
      } else {
        toast.error(t('erro'));
      }
    }
  }

  async function saveAutomationInfo() {
    try {
      if (profile.manageAllClients || verifyAutomPermission()) {
        await apiCall('/dri/set-dri-info', {
          DRI_ID: props.devInfoResp.info.integrId,
          DUT_ID: state.formData.REL_DUT_ID_item && state.formData.REL_DUT_ID_item.DUT_ID,
          ENABLE_ECO: state.formData.ENABLE_ECO_item && state.formData.ENABLE_ECO_item.value,
          ECO_CFG: state.formData.ECO_MODE_CFG_item && state.formData.ECO_MODE_CFG_item.value,
          ECO_INT_TIME: parseDecimalNumber(state.formData.ECO_INTERVAL_TIME) || 5,
          ECO_OFST_START: parseDecimalNumber(state.formData.ECO_OFST_START || '0') || null,
          ECO_OFST_END: parseDecimalNumber(state.formData.ECO_OFST_END || '0') || null,
          AUTOMATION_INTERVAL: parseDecimalNumber(state.formData.AUTOMATION_INTERVAL_TIME) ?? 5,
        });

        toast.success(t('sucessoSalvarConfiguracoes'));
        history.push(history.location.pathname.replace('editar', 'perfil'));
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }

  async function fetchUnits(CLIENT_ID: number | null) {
    state.comboOpts.units = [];
    if (!CLIENT_ID) { render(); return; }

    const { units } = await apiCall('/dev/dev-info-combo-options', { CLIENT_ID, units: true });

    if (units) {
      state.comboOpts.units = units.map((unit) => ({ UNIT_ID: unit.value, UNIT_NAME: unit.label }));
    }
    render();
  }

  async function onSelectClient(item) {
    try {
      setState({ isLoading: true });
      state.formData.CLIENT_ID_item = { NAME: item.name, CLIENT_ID: item.value };
      state.formData.UNIT_ID_item = null;
      await fetchUnits(item.value);
      setState({ isLoading: false });
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }

  function setVariablesChiller(name) {
    state.driSlaveId = state.driSlaveId?.length ? state.driSlaveId : '10';
    const defaultConfig = driApplicationCfgs[name];

    if (defaultConfig) {
      state.driProtocol = getKeyByValue(driProtocolsOpts, defaultConfig.protocol) ?? null;
      state.modbusBaudRate = defaultConfig.modbusBaudRate;
      state.driParity = getKeyByValue(driParityOpts, defaultConfig.parity) ?? null;
      state.driLayer = getKeyByValue(driLayerOpts, defaultConfig.serialMode) ?? null;
      state.driStopBits = getKeyByValue(driStopBitsOpts, defaultConfig.stopBits) ?? null;
      state.driSendInterval = '60';
    } else { resetCfgFields(); }
  }

  function getDefaultSendInterval() {
    if (state.driSendInterval.length > 0) {
      return '';
    }
    switch (state.driApplication) {
      case 'Medidor de energia': return '900';
      case 'Chiller Carrier':
      case 'Carrier ECOSPLIT':
      case 'Fancoil':
      case 'VAV': return '60';
      default: return '';
    }
  }

  function resetCfgFields() {
    if (state.driApplication !== 'Chiller Carrier') {
      state.formData.GROUP_ID_item = null;
      state.formData.ASSET_ID_item = null;
    }
    state.driProtocol = null;
    state.driMeterModel = null;
    state.driVavFancoilModel = null;
    state.driChillerCarrierModel = null;
    state.driChillerCarrierLine = null;
    state.modbusBaudRate = '';
    state.driParity = null;
    state.driStopBits = null;
    state.driLayer = null;
    state.driCfgFile = null;
    state.selectedCurrentCapacity = null;
    state.selectedInstallationType = null;
    state.driSlaveId = '';
    state.driSendInterval = getDefaultSendInterval();
    render();
  }

  function resetAutomationField() {
    if (state.automation) {
      state.automation = null;
    }
  }

  function resetApplicationFields() {
    state.driApplication = null;
    state.application = null;
    resetAutomationField();
  }

  function returnExistOrValue1(item, item2) {
    if (item !== null) return item;
    return item2;
  }

  const isFancoilVavApplication = props.devInfoResp.dri?.application?.includes('fancoil')
    || props.devInfoResp.dri?.application?.includes('vav');

  const isAutomationApplication = state.driApplication === 'Fancoil' || state.driApplication === 'VAV' || state.driApplication === 'Carrier ECOSPLIT';

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const allTabs = [
    {
      title: t('equipamento'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'equipamento' })}`,
      isActive: (queryPars.aba === 'equipamento') || (!queryPars.aba),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('Automação'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'automacao' })}`,
      isActive: (queryPars.aba === 'automacao'),
      visible: isAutomationApplication,
      ref: useRef(null),
    },
  ];

  function onSelectUnit(item) {
    state.formData.UNIT_ID_item = { UNIT_NAME: item.name, UNIT_ID: item.value };
  }

  const tabs = allTabs.filter((x) => x.visible);

  const getUnitsOptions = () => (
    state.comboOpts.units.length > 0 ? state.comboOpts.units.map((item) => ({ value: item.UNIT_ID, name: item.UNIT_NAME })) : [{ value: state.formData.UNIT_ID_item ? state.formData.UNIT_ID_item.UNIT_ID : '', name: state.formData.UNIT_ID_item ? state.formData.UNIT_ID_item.UNIT_NAME : '' }]
  );

  return (
    <div>
      {(tabs.length > 0) && <Headers2 links={tabs} />}
      <br />
      <br />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
      }}
      >
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>{t('editarDispositivo')}</div>
          <div style={{ fontSize: '1.1em', fontWeight: 400, color: 'darkgray' }}>{props.devInfoResp.info.integrId}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <RssiComponent
            rssi={state.rssi}
            style={{
              border: '1px solid', borderColor: colors.GreyDefaultCardBorder, height: '78px', padding: '20px', borderRadius: '8px',
            }}
            showLabel
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <br />
        <br />

        {allTabs[0].isActive && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', maxWidth: '628px', rowGap: 14,
            }}
            >
              {state.isLoading && (
              <OverLay>
                <Loader />
              </OverLay>
              )}
              <div style={{
                display: 'flex', flexDirection: 'column', rowGap: 14, marginBottom: 46,
              }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>{t('geral')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  <Flex flexDirection="column">
                    <SearchInput
                      style={{
                        width: '200px',
                        height: '50px',
                        margin: 0,
                        border: '1px solid #818181',
                      }}
                    >
                      <div>
                        <Label>{t('cliente')}</Label>
                        <SelectSearch
                          label={t('cliente')}
                          placeholder={t('selecionar')}
                          search
                          filterOptions={fuzzySearch}
                          options={state.comboOpts.clients.map((item) => ({ value: item.CLIENT_ID, name: item.NAME }))}
                          value={state.formData.CLIENT_ID_item?.CLIENT_ID.toString()}
                          onChange={(item, value) => { onSelectClient(value); updateUnits(); }}
                        />
                      </div>
                    </SearchInput>
                    {state.formData.CLIENT_ID_item?.CLIENT_ID && (
                    <div style={{ marginTop: '-5px', maxWidth: '200px' }}>
                      <ClearSelect
                        onClickClear={() => {
                          state.formData.CLIENT_ID_item = null;
                          state.formData.UNIT_ID_item = null;
                          state.formData.GROUP_ID_item = null;
                          state.formData.ASSET_ID_item = null;
                          render();
                        }}
                        value={state.formData.CLIENT_ID_item?.NAME}
                      />
                    </div>
                    )}
                  </Flex>

                  <Flex flexDirection="column">
                    <SearchInput
                      style={{
                        width: '200px',
                        height: '50px',
                        margin: 0,
                        border: '1px solid #818181',
                      }}
                    >
                      <div>
                        <Label>{t('unidade')}</Label>
                        <SelectSearch
                          label={t('unidade')}
                          placeholder={t('selecionar')}
                          search
                          filterOptions={fuzzySearch}
                          options={getUnitsOptions()}
                          value={state.formData.UNIT_ID_item?.UNIT_ID.toString()}
                          onChange={(item, name) => { onSelectUnit(name); updateGroups(); render(); }}
                          disabled={!state.formData.CLIENT_ID_item?.CLIENT_ID}
                        />
                      </div>
                    </SearchInput>
                    {state.formData.UNIT_ID_item?.UNIT_ID && (
                    <div style={{ marginTop: '-5px', maxWidth: '200px' }}>
                      <ClearSelect
                        onClickClear={() => {
                          state.formData.UNIT_ID_item = null;
                          state.formData.GROUP_ID_item = null;
                          state.formData.ASSET_ID_item = null;
                          render();
                        }}
                        value={state.formData.UNIT_ID_item?.UNIT_NAME}
                      />
                    </div>
                    )}
                  </Flex>

                  <Flex flexDirection="column">
                    <Select
                      style={{ width: '200px' }}
                      options={state.comboOpts.applications}
                      value={state.application}
                      label={t('aplicacao')}
                      placeholder={t('selecionar')}
                      onSelect={(item) => {
                        if (item !== '') {
                          state.application = item;
                          if (item.value !== 'automation') {
                            state.driApplication = getKeyByValue(driApplicationOpts, item.value) ?? null;
                            resetAutomationField();
                            resetCfgFields();
                          } else {
                            state.driApplication = null;
                          }
                        } else {
                          resetApplicationFields();
                          resetCfgFields();
                        }
                        render();
                      }}
                      propLabel="name"
                    />
                  </Flex>
                </div>
                <DriConfigAutomation
                  render={render}
                  resetCfgFields={resetCfgFields}
                  setState={setState}
                  state={state}
                />
                <DriConfigChillerCarrier
                  render={render}
                  state={state}
                  setVariablesChiller={setVariablesChiller}
                  updateAssets={updateAssets}
                />
                <DriConfigEnergyMeter
                  render={render}
                  state={state}
                  resetCfgFields={resetCfgFields}
                />
              </div>
              <DriConfigParameters
                render={render}
                setState={setState}
                state={state}
              />
            </div>
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '30px',
            }}
            >
              <Button style={{ width: '100px' }} onClick={() => uploadSelectedDriConfigFile()} variant="primary">
                {t('botaoSalvar')}
              </Button>
              <BtnClean onClick={() => history.push(history.location.pathname.replace('/editar', history.location.pathname.includes('ativos') ? '/informacoes' : '/perfil'))}>{t('botaoCancelar')}</BtnClean>
            </div>
          </div>
        )}

        {allTabs[1].isActive && (
          <div style={{ width: '60%' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', rowGap: 20, columnGap: 14,
            }}
            >
              <Select
                style={{ width: '414px' }}
                options={state.comboOpts.duts}
                value={state.formData.REL_DUT_ID_item}
                label={t('ambienteMonitorado')}
                placeholder={t('selecionar')}
                onSelect={(item) => { state.formData.REL_DUT_ID_item = (item !== '') ? item : null; render(); }}
                disabled={!state.formData.UNIT_ID_item || isFancoilVavApplication}
                propLabel="comboLabel"
              />

              <div style={{ display: 'flex', gap: 14 }}>
                <Select
                  style={{ width: '200px', height: 'fit-content' }}
                  options={state.comboOpts.enableEco}
                  value={state.formData.ENABLE_ECO_item}
                  label={t('modoEco')}
                  placeholder={t('selecionar')}
                  onSelect={(item) => { state.formData.ENABLE_ECO_item = (item !== '') ? item : null; render(); }}
                  disabled={!state.formData.REL_DUT_ID_item || isFancoilVavApplication}
                  propLabel="name"
                />
                <Select
                  style={{ width: '200px', height: 'fit-content' }}
                  options={state.comboOpts.ecoModeCfg}
                  value={state.formData.ECO_MODE_CFG_item}
                  label={t('configModoEco')}
                  placeholder={t('selecionar')}
                  onSelect={(item) => { state.formData.ECO_MODE_CFG_item = (item !== '') ? item : null; render(); }}
                  disabled={!state.formData.REL_DUT_ID_item || isFancoilVavApplication}
                  propLabel="name"
                />
                <div>
                  {isAutomationApplication ? (
                    <Input
                      label={t('intervaloParaComando')}
                      value={state.formData.AUTOMATION_INTERVAL_TIME}
                      style={{ width: '200px', height: '50px' }}
                      onChange={(e) => {
                        const numberValue = parseInt(e.target.value, 10);
                        if ((numberValue >= 1 && numberValue <= 15) || (e.target.value === '')) {
                          state.formData.AUTOMATION_INTERVAL_TIME = e.target.value;
                          if (state.devInfo?.dri) {
                            state.devInfo.dri.automationCfg.AUTOMATION_INTERVAL = numberValue;
                          }
                          render();
                        }
                      }}
                    />
                  ) : (
                    <Input
                      label={t('intervaloParaComando')}
                      value={state.formData.ECO_INTERVAL_TIME}
                      style={{ width: '200px', height: '50px' }}
                      onChange={(e) => {
                        if (
                          (parseInt(e.target.value, 10) >= 1 && parseInt(e.target.value, 10) <= 15)
                        || (e.target.value === '')
                        ) {
                          state.formData.ECO_INTERVAL_TIME = e.target.value;
                          render();
                        }
                      }}
                      disabled={!state.formData.REL_DUT_ID_item || isFancoilVavApplication}
                    />
                  )}
                  <p style={{ color: 'darkgray', margin: 0 }}>{t('limites1-15min')}</p>
                </div>
              </div>
              {!isFancoilVavApplication && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '45%' }}>
                  <Input
                    label={t('offsetEntradaC')}
                    value={state.formData.ECO_OFST_START}
                    style={{ width: 'inherit', height: '50px' }}
                    onChange={(e) => { state.formData.ECO_OFST_START = e.target.value; render(); }}
                    disabled={!state.formData.REL_DUT_ID_item}
                  />
                  <p style={{ color: 'darkgray' }}>{t('seTemperaturaMinimaAmbienteOffset', { value1: (returnExistOrValue1(state.formData.ECO_OFST_START, 1)), value2: (20 + parseFloat(returnExistOrValue1(state.formData.ECO_OFST_START, '1'))) })}</p>
                </div>

                <div style={{ width: '45%' }}>
                  <Input
                    label={t('offsetSaidaC')}
                    value={state.formData.ECO_OFST_END}
                    style={{ width: 'inherit', height: '50px' }}
                    onChange={(e) => { state.formData.ECO_OFST_END = e.target.value; render(); }}
                    disabled={!state.formData.REL_DUT_ID_item}
                  />
                  <p style={{ color: 'darkgray' }}>{t('seTemperaturaAtivacaoModoEcoOffset', { value1: (returnExistOrValue1(state.formData.ECO_OFST_END, 1)), value2: (7 + (parseFloat(returnExistOrValue1(state.formData.ECO_OFST_END, 1)))) })}</p>
                </div>
              </div>
              )}

              {isFancoilVavApplication && <DriConfigSchedulesAutomation devInfo={state.devInfo} />}

              <div style={{
                width: '300px',
                display: 'flex',
                alignItems: 'center',
                marginTop: '30px',
              }}
              >
                <Button style={{ width: '100px' }} onClick={() => saveAutomationInfo()} variant="primary">
                  {t('botaoSalvar')}
                </Button>
                <BtnClean onClick={() => history.push(history.location.pathname.replace('/editar', '/perfil'))}>{t('botaoCancelar')}</BtnClean>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const EditDevInfoDRI = (props: {
  formData: { varsConfigInput: string }
  onDataUpdate: (data: { varsConfigInput: string }) => void
}): JSX.Element => {
  const { t } = useTranslation();
  const { formData, onDataUpdate } = props;
  return (
    <div>
      <textarea
        style={{ width: '100%', height: '300px' }}
        placeholder={t('variaveis')}
        onChange={(event) => { onDataUpdate({ varsConfigInput: event.target.value }); }}
      >
        {formData.varsConfigInput}

      </textarea>
      <div>
        {t('umItemPorLinha')}
        <br />
        {'{"name":"Psuc máquina 1","address":{"protocol":"read-modbus-tcp","machine":0,"ip":"192.168.137.1","id":1,"function":4,"address":21}}'}
      </div>
    </div>
  );
};
