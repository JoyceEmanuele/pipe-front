import {
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';

import { toast } from 'react-toastify';
import { Flex } from 'reflexbox';
import '~/assets/css/ReactTags.css';
import {
  Button,
  FormMachine,
  FormAssetsList,
  ViewMachine,
  ViewCAG,
} from 'components';
import { useForm } from 'react-hook-form';
import { useStateVar } from 'helpers/useStateVar';
import queryString from 'query-string';
import { useHistory } from 'react-router-dom';
import { apiCall, apiCallFormData, ApiResps } from 'providers';

import { FormEditExtras } from '../UnitExtras';
import { Headers2 } from '../../Analysis/Header';
import { AxiosError } from 'axios';

import { useTranslation } from 'react-i18next';
import {
  Form,
} from './styles';
import {
  driApplicationCfgs,
  driChillerCarrierApplications, driLayerOpts, driParityOpts, driProtocolsOpts, driStopBitsOpts,
} from '~/helpers/driConfigOptions';
import { checkProtocolValue } from '~/helpers/driConfig';
import { getUserProfile } from '~/helpers/userProfile';

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

type Inputs = {
  login: string,
  loginExtra: string,
  password: string,
  consumerUnit: string,
  finished: boolean,
  name: string | null,
  model: string | null,
  refrigerationCapacity: string | null,
  refrigerationFluid: string | null,
  ratedPower: string | null,
  installationDate: string | null,
  automationDevId: string | null,
};

type Machine = {
  groupId: number | null,
  name: string,
  unitId: number,
  unitName: string | null,
  brandName: string | null,
  type: string | null,
  model: string | null,
  refrigerationCapacity: string | null,
  refrigerationFluid: string | null,
  applic: string | null,
  ratedPower: string | null,
  installationDate: string | null,
  automationDevId: string | null,
  capacityMeasurementUnit: string | null,
  refDUTId: string | null
  assetsSumRatedPower: string | null,
};

type Asset = {
  index: number,
  name: string,
  installationLocation: string | null,
  datId: string | null,
  devId: string | null,
  roleId: number | null,
  role: string | null,
  type: string | null,
  brandName: string | null,
  model: string | null,
  refrigerationCapacity: string | null,
  ratedPower: string | null,
  refrigerationFluid: string | null,
  capacityMeasurementUnit: string | null,
  devClientAssetId: number | null,
  datIndex: number | null,
  devIdPersisted: string | null,
  assetId: number | null,
  chillerModel: string | null,
  chillerModelValue: number | null,
  chillerLine: string | null,
  chillerLineValue: number | null,
  nominalCapacity: number | null,
  nominalVoltage: number | null,
  nominalFrequency: number | null,
};

export const FormEditMachine = (props: {
  unitInfo?: {
    UNIT_ID: number
    UNIT_NAME: string
    LAT: string
    LON: string
    TARIFA_KWH: number
    CITY_ID: string
    STATE_ID: string
    DISTRIBUTOR_ID: number
    CONSUMER_UNIT: string
    LOGIN: string
    LOGIN_EXTRA: string
    PASSWORD: string
  }
  unitsList: {
    value: number
    name: string
  }[]
  modelsChillerList: {
    id: number
    modelName: string
    lineName: string
    nominalCapacity: number
    nominalVoltage: number
    nominalFrequency: number
  }[]
  comboOpts: {
    fluids: { value: number, name: string, id: string, }[],
    types: { value: number, name: string, id: string, }[],
    brands: { value: number, name: string, id: string, }[],
    applics: { value: number, name: string, id: string, }[],
    roles: { value: number, name: string }[],
    chillerModels: { value: number, name: string }[],
    chillerLines: { value: number, name: string }[],
  }
  machineWithAsset?: {
    GROUP_ID: number
    GROUP_NAME: string
    DUT_ID: string
    DEV_AUT: string | null
    UNIT_ID: number
    UNIT_NAME: string
    CITY_NAME: string
    STATE_ID: string
    MODEL: string | null
    INSTALLATION_DATE: string | null
    GROUP_TYPE: string | null
    BRAND: string | null
    FRIGO_CAPACITY: number | null
    FRIGO_CAPACITY_UNIT: string | null
    FLUID_TYPE: string | null
    RATED_POWER: number | null
    DEVS_COUNT: number,
    ASSETS_COUNT: number,
    MCHN_APPL: string | null,
    MACHINE_RATED_POWER: number,
    assets: {
      DAT_ID: string | null
      AST_DESC: string
      INSTALLATION_LOCATION: string | null
      AST_TYPE: string | null
      CAPACITY_PWR: number | null
      CAPACITY_UNIT: string | null
      CLIENT_ID: number | null
      FLUID_TYPE: string | null
      GROUP_ID: number | null
      MCHN_APPL: string | null
      MCHN_BRAND: string | null
      MCHN_ENV: string | null
      MCHN_KW: number | null
      MCHN_MODEL: string | null
      UNIT_ID: number
      INSTALLATION_DATE: string | null
      AST_ROLE: number | null
      DEV_ID: string | null
      DEV_CLIENT_ASSET_ID: number | null
      DAT_INDEX: number | null
      ASSET_ID: number
      CHILLER_MODEL_NAME: string | null
      CHILLER_MODEL_ID: number | null
      CHILLER_LINE_NAME: string | null
      CHILLER_LINE_ID: number | null
      NOMINAL_CAPACITY: number | null
      NOMINAL_VOLTAGE: number | null
      NOMINAL_FREQUENCY: number | null
    }[]
  }
  dacsList?: {
    DAC_ID: string
    GROUP_ID: number
    automationEnabled: boolean
  }[]
  clientId: number
  isViewMachine?: boolean
  onSuccess: (result: { item: {}, action: string }) => void
  onCancel: () => void
}): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const {
    unitInfo = undefined, clientId, onSuccess, onCancel,
  } = props;
  const [state, render, setState] = useStateVar({
    submitting: false,
    editingExtras: false,
    isLoading: false as boolean,
    key: 1 as number,
    isViewMachine: props.isViewMachine as boolean,
    sending: false,
    selectedApplication: false as boolean,
    selectedChillerModel: false as boolean,
    selectedChillerLine: false as boolean,
    driInfo: null as null|ApiResps['/get-integration-info'],
    driProtocol: null as null | string,
    driLayer: null as null | string,
    modbusBaudRate: '',
    driParity: null as null | string,
    driStopBits: null as null | string,
    driSendInterval: '',
    selectedCurrentCapacity: null as null | { name: string, value: string },
    selectedInstallationType: null as null | { name: string, value: string },
    driSlaveId: '',
    driCfgFile: null as null | (Blob & { name: string }),
    isChillerCarrier: false as boolean,

  });

  const [formData] = useState({
    UNIT_ID: (unitInfo && unitInfo.UNIT_ID) || null,
    machine: {
      groupId: props.machineWithAsset && props.machineWithAsset.GROUP_ID || null as number | null,
      name: props.machineWithAsset && props.machineWithAsset.GROUP_NAME || '' as string,
      unitId: props.machineWithAsset && props.machineWithAsset.UNIT_ID || 0 as number,
      unitName: props.machineWithAsset && props.machineWithAsset.UNIT_NAME || '' as string | null,
      brandName: props.machineWithAsset && props.machineWithAsset.BRAND || '' as string | null,
      type: props.machineWithAsset && props.machineWithAsset.GROUP_TYPE || '' as string | null,
      model: props.machineWithAsset && props.machineWithAsset.MODEL || '' as string | null,
      refrigerationCapacity: props.machineWithAsset ? props.machineWithAsset.assets.reduce((accumulator, object) => (object.AST_ROLE === 2 ? accumulator + Number(object.CAPACITY_PWR) : accumulator), 0).toString() : null,
      refrigerationFluid: props.machineWithAsset && props.machineWithAsset.FLUID_TYPE || '' as string | null,
      applic: props.machineWithAsset && props.machineWithAsset.MCHN_APPL || '' as string | null,
      ratedPower: props.machineWithAsset?.MACHINE_RATED_POWER?.toString() || '' as string | null,
      installationDate: props.machineWithAsset && props.machineWithAsset.INSTALLATION_DATE || '' as string | null,
      automationDevId: (props.machineWithAsset && (props.machineWithAsset.DEV_AUT)) || '' as string | null,
      capacityMeasurementUnit: props.machineWithAsset && props.machineWithAsset.assets.find((asset) => asset.AST_ROLE === 2)?.CAPACITY_UNIT || 'TR' as string | null,
      refDUTId: props.machineWithAsset && (props.machineWithAsset.DUT_ID !== props.machineWithAsset.DEV_AUT) && props.machineWithAsset.DUT_ID || '' as string | null,
      assetsSumRatedPower: props.machineWithAsset ? props.machineWithAsset.assets.reduce((accumulator, object) => (object.AST_ROLE === 2 ? accumulator + Number(object.MCHN_KW) : accumulator), 0).toString() : null,
    },
    assets: [] as {
      index: number,
      name: string,
      installationLocation: string | null,
      datId: string | null,
      devId: string | null,
      roleId: number | null,
      role: string | null,
      type: string | null,
      brandName: string | null,
      model: string | null,
      refrigerationCapacity: string | null,
      ratedPower: string | null,
      refrigerationFluid: string | null,
      capacityMeasurementUnit: string | null,
      devIdPersisted: string | null,
      devClientAssetId: number | null,
      datIndex: number | null,
      assetId: number | null,
      chillerModel: string | null,
      chillerModelValue: number | null,
      chillerLine: string | null,
      chillerLineValue: number | null,
      nominalCapacity: number | null,
      nominalVoltage: number | null,
      nominalFrequency: number | null,
    }[],
  });

  const isEdit = !!formData.machine.groupId;

  useEffect(() => {
    if (isEdit || state.isViewMachine) {
      if (props.machineWithAsset) {
        let indexAux = 0;
        for (const asset of props.machineWithAsset.assets) {
          formData.assets.push({
            index: indexAux,
            name: asset.AST_DESC || '',
            installationLocation: asset.INSTALLATION_LOCATION || '',
            datId: asset.DAT_ID || '',
            devId: asset.DEV_ID || '',
            roleId: asset.AST_ROLE || 0,
            role: '',
            type: asset.AST_TYPE || '',
            brandName: asset.MCHN_BRAND || '',
            model: asset.MCHN_MODEL || '',
            refrigerationCapacity: asset.CAPACITY_PWR?.toString() || '',
            ratedPower: asset.MCHN_KW?.toString() || '',
            refrigerationFluid: asset.FLUID_TYPE || '',
            capacityMeasurementUnit: asset.CAPACITY_UNIT || 'TR',
            devIdPersisted: asset.DEV_ID || null,
            devClientAssetId: asset.DEV_CLIENT_ASSET_ID || null,
            datIndex: asset.DAT_INDEX || null,
            assetId: asset.ASSET_ID,
            chillerModel: asset.CHILLER_MODEL_NAME,
            chillerModelValue: asset.CHILLER_MODEL_ID,
            chillerLine: asset.CHILLER_LINE_NAME,
            chillerLineValue: asset.CHILLER_LINE_ID,
            nominalCapacity: asset.NOMINAL_CAPACITY,
            nominalVoltage: asset.NOMINAL_VOLTAGE,
            nominalFrequency: asset.NOMINAL_FREQUENCY,
          });
          indexAux++;
        }
        render();
      }
    }
  }, []);

  useEffect(() => {
    if (formData.machine.applic === 'chiller' && formData.machine.brandName === 'carrier') {
      state.isChillerCarrier = true;
      render();
    }
  }, []);

  function handleChangeMachine(machineForm: Machine) {
    formData.machine = machineForm;
    render();
  }

  function handleChangeSelectedApplication(selectedApplication: boolean) {
    state.selectedApplication = selectedApplication;
    render();
  }

  function handleChangeSelectedChillerCarrier(selectedChillerCarrier: boolean) {
    state.isChillerCarrier = selectedChillerCarrier;
    render();
  }

  function handleChangeSelectedChillerModel(selectedChillerModel: boolean) {
    state.selectedChillerModel = selectedChillerModel;
    render();
  }

  function handleChangeSelectedChillerLine(selectedChillerLine: boolean) {
    state.selectedChillerLine = selectedChillerLine;
    render();
  }

  function handleChangeAssets(assetsForm: Asset[]) {
    formData.assets = assetsForm;

    const sumRatedPower = assetsForm.reduce((accumulator, object) => (object.roleId === 2 ? accumulator + Number(object.ratedPower) : accumulator), 0);
    const sumRefrigerationCapacity = assetsForm.reduce((accumulator, object) => (object.roleId === 2 ? accumulator + Number(object.refrigerationCapacity) : accumulator), 0);
    const condensers = assetsForm.find((asset) => asset.roleId === 2);

    if (condensers) {
      formData.machine.capacityMeasurementUnit = condensers.capacityMeasurementUnit || 'TR';
    }
    formData.machine.assetsSumRatedPower = sumRatedPower.toString();
    formData.machine.refrigerationCapacity = sumRefrigerationCapacity.toString();
  }

  function handleDeleteAssets(index: number) {
    formData.assets.splice(formData.assets.findIndex((item) => item.index === index), 1);
    render();
  }

  function checkDevExistsAnotherAsset(devCode: string, assetToIgnore: number) {
    return !!formData.assets.find((item) => item.assetId !== assetToIgnore && item.devId === devCode);
  }

  function verifyAutomPermission() {
    return profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === state.driInfo?.info?.CLIENT_ID);
  }

  async function getDriInfo(driId: string) {
    try {
      const response = await apiCall('/get-integration-info', { supplier: 'diel', integrId: driId });
      state.driInfo = response;
      const { dri: driCfg } = response;
      setDriCfg(driCfg);
      render();
    } catch (err) {
      console.log(err);
      alert(t('erroInformacoesDispositivos'));
    }
  }

  function verifyPermissions() {
    if (!profile.manageAllClients && !profile.permissions.isInstaller && !verifyAutomPermission()) {
      return true;
    }
    return false;
  }

  const setDriCfg = (driCfg: ApiResps['/get-integration-info']['dri']) => {
    const defaultConfig = driApplicationCfgs['Chiller-Default'];

    const driProtocol = getKeyByValue(driProtocolsOpts, defaultConfig.protocol) ?? null;
    const modbusBaudRate = defaultConfig.modbusBaudRate;
    const driParity = getKeyByValue(driParityOpts, defaultConfig.parity) ?? null;
    const driLayer = getKeyByValue(driLayerOpts, defaultConfig.serialMode) ?? null;
    const driStopBits = getKeyByValue(driStopBitsOpts, defaultConfig.stopBits) ?? null;
    const driSendInterval = '60';

    state.driProtocol = getKeyByValue(driProtocolsOpts, driCfg?.protocol) ?? driProtocol;

    const parity = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'mdb_parity'))?.value;
    state.driParity = (parity !== undefined) ? Object.keys(driParityOpts)[parity] : driParity;

    const serialMode = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'serial_mode'))?.value;
    state.driLayer = (serialMode !== undefined) ? Object.keys(driLayerOpts)[Number(serialMode) - 1] : driLayer;

    const stopBits = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'mdb_stopbits'))?.value;
    state.driStopBits = (stopBits !== undefined) ? Object.keys(driStopBitsOpts)[stopBits] : driStopBits;

    state.driSendInterval = (driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value?.toString() ?? driSendInterval);

    state.modbusBaudRate = driCfg?.driConfigs?.find((cfg) => checkProtocolValue(cfg, 'mdb_baud'))?.value?.toString() ?? modbusBaudRate;

    state.driSlaveId = (['30HXE', '30GXE', '30HXF', '30XAB'].includes(formData?.assets[0]?.chillerLine ?? '') && driCfg?.varsList?.find((item) => item.address)?.address?.id?.toString()) || '';
  };

  function createVariables() {
    const driProtocol = state.driProtocol && driProtocolsOpts[state.driProtocol];
    const driLayer = state.driLayer ? driLayerOpts[state.driLayer] : undefined;
    const modbusBaudRate = state.modbusBaudRate || undefined;
    const parity = state.driParity ? driParityOpts[state.driParity] : undefined;
    const stopBits = state.driStopBits ? driStopBitsOpts[state.driStopBits] : undefined;
    const intervalTmp = state.driSendInterval || undefined;
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

  function getDriApplication() {
    const chillerLine = formData?.assets[0]?.chillerLine;
    const driApplication = chillerLine ? driChillerCarrierApplications[chillerLine] : null;

    return driApplication;
  }

  async function uploadSelectedDriConfigFile() {
    try {
      const asset = formData?.assets[0];
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

      if (asset.devId) {
        await Promise.all([
          (async () => {
            if (verifyPermissions()) return;
            asset.devId && await apiCall('/dri/set-dri-info', {
              DRI_ID: asset.devId,
              SYSTEM_NAME: asset.name || formData.machine.name,
              UNIT_ID: formData.machine.unitId,
              CLIENT_ID: clientId,
            });
          })(),
          apiCallFormData('/upload-dri-varscfg', {
            driId: asset.devId,
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
      }

      toast.success(t('sucessoSalvarConfiguracoes'));
      toast.success(t('sucessoReiniciarDispositivo'));
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

  const handleFormSubmition = async () => {
    let action: string | null;
    let response: null | {};
    if (state.submitting) {
      try {
        if (!formData.machine.name) {
          alert('É necessário informar um nome para a máquina');
          state.submitting = false;
          render();
          return;
        }

        const assetsWithoutName = formData.assets.filter((assets) => assets.name == null);
        if (!state.isChillerCarrier && assetsWithoutName.length > 0) {
          alert('É necessário informar nome para os ativos');
          state.submitting = false;
          render();
          return;
        }
        if (state.isChillerCarrier && (!formData.assets[0]?.chillerLine || !formData.assets[0]?.chillerModel)) {
          alert(t('preencherModeloChiller'));
          state.submitting = false;
          render();
          return;
        }
        if (formData.machine.installationDate && formData.machine.installationDate.length !== 10) {
          alert('Data de instalação fora do formato dd/mm/yyyy');
          state.submitting = false;
          render();
          return;
        }
        setState({ sending: true });
        if (!isEdit) {
          if (!formData.machine.unitId) {
            alert('É necessário selecionar a unidade');
            state.submitting = false;
            render();
            return;
          }

          const isDam = formData.machine.automationDevId?.includes('DAM');
          const isDut = formData.machine.automationDevId?.includes('DUT');
          const isDri = formData.machine.automationDevId?.includes('DRI');
          const formatedDate = formData.machine.installationDate
            ? `${formData.machine.installationDate.substring(6, 10)}-${formData.machine.installationDate.substring(3, 5)}-${formData.machine.installationDate.substring(0, 2)}` : null;
          setState({ sending: true });
          if (isDam) {
            await apiCall('/dam/set-dam-info', {
              UNIT_ID: formData.machine.unitId,
              CLIENT_ID: clientId,
              DAM_ID: formData.machine.automationDevId as string,
            });
          }
          else if (isDri) {
            await apiCall('/dri/set-dri-info', {
              UNIT_ID: formData.machine.unitId,
              CLIENT_ID: clientId,
              DRI_ID: formData.machine.automationDevId as string,
            });
          }
          else if (isDut || formData.machine.refDUTId) {
            await apiCall('/dut/set-dut-info', {
              UNIT_ID: formData.machine.unitId,
              CLIENT_ID: clientId,
              DEV_ID: (isDut && formData.machine.automationDevId ? formData.machine.automationDevId : formData.machine.refDUTId) as string,
            });
          }

          const groupResponse = await apiCall('/dac/add-new-group', {
            UNIT_ID: formData.machine.unitId,
            GROUP_NAME: formData.machine.name,
            REL_DUT_ID: isDut && formData.machine.automationDevId ? formData.machine.automationDevId : formData.machine.refDUTId,
            DEV_AUT: formData.machine.automationDevId || '',
            REL_DAM_ID: formData.machine.automationDevId && (formData.machine.automationDevId.startsWith('DAM') || formData.machine.automationDevId.startsWith('DAC')) && formData.machine.automationDevId || null,
            REL_DRI_ID: formData.machine.automationDevId && formData.machine.automationDevId.startsWith('DRI') && formData.machine.automationDevId || null,
            CLIENT_ID: clientId,
            MODEL: formData.machine.model,
            INSTALLATION_DATE: formatedDate,
            GROUP_TYPE: formData.machine.type,
            BRAND: formData.machine.brandName,
            FRIGO_CAPACITY: Number(formData.machine.refrigerationCapacity),
            FRIGO_CAPACITY_UNIT: formData.machine.capacityMeasurementUnit,
            FLUID_TYPE: formData.machine.refrigerationFluid,
            MCHN_APPL: formData.machine.applic,
            SUM_RATED_POWER_CONDENSERS: formData.machine.assetsSumRatedPower ? Number(formData.machine.assetsSumRatedPower) : null,
            RATED_POWER: formData.machine.ratedPower ? Number(formData.machine.ratedPower) : 0,
          });

          for (const asset of formData.assets) {
            const datId = asset.datId;
            await apiCall('/clients/add-new-asset', {
              DAT_ID: datId,
              AST_DESC: asset.name || formData.machine.name,
              AST_TYPE: asset.type,
              CAPACITY_PWR: asset.refrigerationCapacity != null ? Number(asset.refrigerationCapacity) : null,
              CAPACITY_UNIT: asset.capacityMeasurementUnit,
              CLIENT_ID: clientId,
              FLUID_TYPE: formData.machine.refrigerationFluid,
              GROUP_ID: groupResponse.GROUP_ID,
              MCHN_BRAND: formData.machine.brandName,
              MCHN_MODEL: asset.model,
              UNIT_ID: formData.machine.unitId,
              INSTALLATION_DATE: formatedDate,
              AST_ROLE: asset.roleId,
              DEV_ID: asset.devId,
              DAT_COUNT: asset.index,
              MCHN_KW: asset.ratedPower != null ? Number(asset.ratedPower) : null,
              INSTALLATION_LOCATION: asset.installationLocation,
              MCHN_APPL: formData.machine.applic,
              CHILLER_CARRIER_MODEL_ID: asset.chillerModelValue,
            });

            if (asset.devId && asset.devId.includes('DAC')) {
              await apiCall('/dac/set-dac-info', {
                DAC_ID: asset.devId, GROUP_ID: groupResponse.GROUP_ID, UNIT_ID: formData.machine.unitId, CLIENT_ID: clientId,
              });
            }

            if (asset.devId && asset.devId.includes('DRI') && state.isChillerCarrier) {
              await uploadSelectedDriConfigFile();
            }
          }
          action = 'new';
          response = groupResponse;
        }
        else {
          if (!formData.machine.unitId) {
            alert('É necessário selecionar a unidade');
            state.submitting = false;
            render();
            return;
          }

          if (formData.machine.automationDevId) {
            const reqCombos = { CLIENT_ID: clientId, groups: true };
            const combos = await apiCall('/dev/dev-info-combo-options', reqCombos);

            if (combos.groups) {
              const groupInfo = combos.groups.find((groupInfo) => groupInfo.value === formData.machine.groupId);
              if (groupInfo && groupInfo.devAut != null && groupInfo.devAut !== formData.machine.automationDevId) {
                toast.warn(t('avisoGrupoEstaAutomatizadoDispositivo', {
                  value1: groupInfo.label,
                  value2: groupInfo.devAut,
                }));
                state.submitting = false;
                render();
                return;
              }
            }
          }

          const isDut = formData.machine.automationDevId?.includes('DUT');
          const formatedDate = formData.machine.installationDate
            ? `${formData.machine.installationDate.substring(6, 10)}-${formData.machine.installationDate.substring(3, 5)}-${formData.machine.installationDate.substring(0, 2)}` : null;
          const groupResponse = await apiCall('/clients/edit-group', {
            GROUP_ID: formData.machine.groupId as number,
            UNIT_ID: formData.machine.unitId,
            GROUP_NAME: formData.machine.name,
            REL_DUT_ID: isDut && formData.machine.automationDevId ? formData.machine.automationDevId : formData.machine.refDUTId,
            REL_DEV_AUT: formData.machine.automationDevId,
            CLIENT_ID: clientId,
            MODEL: formData.machine.model,
            INSTALLATION_DATE: formatedDate,
            GROUP_TYPE: formData.machine.type,
            BRAND: formData.machine.brandName,
            FRIGO_CAPACITY: Number(formData.machine.refrigerationCapacity),
            FRIGO_CAPACITY_UNIT: formData.machine.capacityMeasurementUnit,
            FLUID_TYPE: formData.machine.refrigerationFluid,
            RATED_POWER: formData.machine.ratedPower ? Number(formData.machine.ratedPower) : 0,
            MCHN_APPL: formData.machine.applic,
            SUM_RATED_POWER_CONDENSERS: formData.machine.assetsSumRatedPower ? Number(formData.machine.assetsSumRatedPower) : null,
          });

          const groupId = formData.machine.groupId as number;

          // first remove assets that have card deleted
          const assetsOriginal = props.machineWithAsset?.assets || [];

          if (assetsOriginal.length > 0) {
            for (const asset of assetsOriginal) {
              const assetAux = formData.assets.find((item) => item.assetId === asset.ASSET_ID);
              if (!assetAux) {
                // Remove asset that had card deleted
                await apiCall('/clients/remove-asset', { ASSET_ID: asset.ASSET_ID, DAT_ID: asset.DAT_ID as string, DEVICE_CODE: asset.DEV_ID ? asset.DEV_ID : undefined });

                if (asset.DEV_ID && asset.DEV_ID.includes('DAC') && !checkDevExistsAnotherAsset(asset.DEV_ID, asset.ASSET_ID)) {
                  await apiCall('/dac/set-dac-info', { DAC_ID: asset.DEV_ID, GROUP_ID: null });
                }
              }
            }
          }

          // Handle with the asset list
          for (const asset of formData.assets) {
            // New asset
            if (!asset.assetId) {
              const datId = asset.datId;
              await apiCall('/clients/add-new-asset', {
                DAT_ID: datId,
                AST_DESC: asset.name || formData.machine.name,
                AST_TYPE: asset.type,
                CAPACITY_PWR: asset.refrigerationCapacity != null ? Number(asset.refrigerationCapacity) : null,
                CAPACITY_UNIT: asset.capacityMeasurementUnit,
                CLIENT_ID: clientId,
                FLUID_TYPE: formData.machine.refrigerationFluid,
                GROUP_ID: groupId,
                MCHN_BRAND: formData.machine.brandName,
                MCHN_MODEL: asset.model,
                UNIT_ID: formData.machine.unitId,
                INSTALLATION_DATE: formatedDate,
                AST_ROLE: asset.roleId,
                DEV_ID: asset.devId,
                DAT_COUNT: asset.index,
                MCHN_KW: asset.ratedPower != null ? Number(asset.ratedPower) : null,
                INSTALLATION_LOCATION: asset.installationLocation,
                MCHN_APPL: formData.machine.applic,
                TYPE_CFG: formData.machine.type,
                CHILLER_CARRIER_MODEL_ID: asset.chillerModelValue,
              });

              if (asset.devId && asset.devId.includes('DAC')) {
                await apiCall('/dac/set-dac-info', {
                  DAC_ID: asset.devId, GROUP_ID: groupId, UNIT_ID: formData.machine.unitId, CLIENT_ID: clientId,
                });
              }

              if (asset.devId && asset.devId.includes('DRI') && state.isChillerCarrier) {
                await uploadSelectedDriConfigFile();
              }
            }
            else {
              if (asset.devIdPersisted != null && asset.devIdPersisted !== asset.devId && asset.devIdPersisted.startsWith('DAC') && asset.devId != null && !checkDevExistsAnotherAsset(asset.devIdPersisted, asset.assetId)) {
                await apiCall('/dac/set-dac-info', { DAC_ID: asset.devIdPersisted, GROUP_ID: null });
              }

              await apiCall('/clients/edit-asset', {
                ASSET_ID: asset.assetId,
                DAT_ID: asset.datId as string,
                AST_DESC: asset.name,
                AST_TYPE: asset.type,
                CAPACITY_PWR: asset.refrigerationCapacity != null ? Number(asset.refrigerationCapacity) : null,
                CAPACITY_UNIT: asset.capacityMeasurementUnit,
                CLIENT_ID: clientId,
                FLUID_TYPE: asset.refrigerationFluid,
                GROUP_ID: groupId,
                MCHN_BRAND: asset.brandName,
                MCHN_MODEL: asset.model,
                UNIT_ID: formData.machine.unitId,
                INSTALLATION_DATE: formatedDate,
                AST_ROLE: asset.roleId,
                DEV_ID: asset.devId,
                DAT_COUNT: asset.index,
                OLD_DEV_ID: asset.devIdPersisted,
                DEV_CLIENT_ASSET_ID: asset.devClientAssetId,
                DAT_INDEX: asset.datIndex,
                MCHN_KW: asset.ratedPower != null ? Number(asset.ratedPower) : null,
                INSTALLATION_LOCATION: asset.installationLocation,
                UPDATE_MACHINE_RATED_POWER: false,
              });

              if (asset.devId && asset.devId.includes('DRI') && state.isChillerCarrier) {
                await uploadSelectedDriConfigFile();
              }
            }
          }

          response = groupResponse;
          action = 'edit';
        }
        if (response && action) onSuccess({ item: response, action });
      } catch (err) {
        const error = err as AxiosError;
        console.log(err);
        // Exibindo mensagens dos erros tratados no backend
        if (error.response?.status !== 500) {
          toast.error(`${error.response?.data}`);
        } else {
          toast.error('Houve erro');
        }
      }
    }
    state.sending = false;
  };

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  const tabs = [
    {
      title: t('maquina'),
      link: `${linkBase}`,
      isActive: !queryPars.aba,
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('ativosAssociados'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'ativos-associados' })}`,
      isActive: (queryPars.aba === 'ativos-associados'),
      visible: !state.isChillerCarrier,
      ref: useRef(null),
    },
  ];

  const {
    register, handleSubmit,
  } = useForm<Inputs>({
    mode: 'all',
  });

  function onStateSelected() {
    if (state.isChillerCarrier && formData?.assets[0]?.devId) {
      const driId = formData.assets[0].devId;
      getDriInfo(driId);
    }
    setState({ isLoading: true, submitting: true });
    render();
  }

  return (
    state.editingExtras
      ? (
        <FormEditExtras
          unitId={formData.UNIT_ID}
          wantClose={() => setState({ editingExtras: false })}
        />
      )
      : (
        <div style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        >
          <Form onSubmit={handleSubmit(handleFormSubmition)}>
            <div>
              {!state.isViewMachine && !state.submitting && (
                <>
                  <span
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '115%',
                    }}
                  >
                    {!isEdit ? 'Nova Máquina' : 'Editar Máquina'}
                  </span>
                  <div style={{ paddingTop: '20px', paddingLeft: '20px' }}>
                    <Headers2 links={tabs} />
                  </div>
                  {tabs[0].isActive
                    && (
                      <div style={{ marginLeft: '40px', marginTop: '20px' }}>
                        <FormMachine
                          registerParente={register}
                          onHandleChangeMachine={handleChangeMachine}
                          onHandleChangeAsset={handleChangeAssets}
                          machine={formData.machine}
                          asset={formData.assets[0]}
                          unitsOpt={props.unitsList}
                          modelsChillerList={props.modelsChillerList}
                          comboOpts={props.comboOpts}
                          handleSelectedApplication={handleChangeSelectedApplication}
                          handleSelectedChillerCarrier={handleChangeSelectedChillerCarrier}
                          handleSelectedChillerModel={handleChangeSelectedChillerModel}
                          handleSelectedChillerLine={handleChangeSelectedChillerLine}
                          isChillerCarrier={state.isChillerCarrier}
                          selectedApplication={state.selectedApplication}
                          selectedChillerModel={state.selectedChillerModel}
                          selectedChillerLine={state.selectedChillerLine}
                        />
                      </div>
                    )}
                  {tabs[1].isActive
                    && state.key++
                    && (
                      <div style={{ marginLeft: '61px', marginTop: '15px' }}>
                        <FormAssetsList dacsList={props.dacsList} key={state.key} assets={formData.assets} isEdit={isEdit} onHandleDeleteAsset={handleDeleteAssets} onHandleChange={handleChangeAssets} comboOpts={props.comboOpts} />
                      </div>
                    )}
                </>
              )}
              {(state.isViewMachine || state.submitting) && (
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexFlow: 'column',
                  justifyContent: 'left',
                  marginLeft: '15px',
                }}
                >
                  <span
                    style={{
                      fontWeight: 'bold',
                      fontSize: '115%',
                    }}
                  >
                    {state.isViewMachine ? 'Visualizar' : 'Resumo'}
                  </span>
                  {state.submitting && (
                    <span
                      style={{
                        fontSize: '100%',
                      }}
                    >
                      Confira as informações inseridas
                    </span>
                  )}
                  <div style={{
                    marginTop: '29px',
                    width: '100%',
                    borderTop: '1px solid lightgrey',
                  }}
                  >
                    {/* <ViewCAG machine={formData.machine} asset={formData.assets[0]} /> */}
                    {state.isChillerCarrier ? <ViewCAG machine={formData.machine} asset={formData.assets[0]} /> : <ViewMachine machine={formData.machine} assets={formData.assets} /> }
                  </div>
                </div>
              )}
              {!state.submitting && !state.isViewMachine && (
                <Flex flexWrap="nowrap" flexDirection="row" mt="40px" justifyContent="space-between">
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" mt="16px">
                    <u style={{ color: '#6C6B6B', cursor: 'pointer' }} onClick={onCancel}>
                      Cancelar
                    </u>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="right" ml="384px">
                    {/* eslint-disable-next-line react/jsx-no-bind */}
                    <Button style={{ width: '140px' }} disabled={state.submitting} variant="primary" onClick={(e) => { e.preventDefault(); onStateSelected(); }}>
                      Finalizar
                    </Button>
                    {/* @ts-ignore */}
                  </Flex>
                </Flex>
              )}
              {state.submitting && (
                <Flex flexWrap="nowrap" flexDirection="row" mt="20px">
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" width="150px" mt="16px">
                    <u
                      style={{ color: '#6C6B6B', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        state.submitting = false;
                        render(); }}
                    >
                      Voltar para Edição
                    </u>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="right" ml="324px">
                    {/* eslint-disable-next-line react/jsx-no-bind */}
                    <Button
                      type="submit"
                      style={{ width: '140px' }}
                      variant="primary"
                      disabled={state.sending}
                    >
                      Salvar
                    </Button>
                    {/* @ts-ignore */}
                  </Flex>
                </Flex>
              )}
              {state.isViewMachine && (
                <Flex flexWrap="nowrap" flexDirection="row" mt="20px">
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" width="150px" mt="16px">
                    <u style={{ color: '#6C6B6B', cursor: 'pointer' }} onClick={onCancel}>
                      Fechar
                    </u>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="right" ml="324px">
                    {/* eslint-disable-next-line react/jsx-no-bind */}
                    <Button style={{ width: '140px' }} variant="primary" onClick={(e) => { e.preventDefault(); state.isViewMachine = false; render(); }}>
                      Editar
                    </Button>
                    {/* @ts-ignore */}
                  </Flex>
                </Flex>
              )}
            </div>
          </Form>
        </div>
      )
  );
};
