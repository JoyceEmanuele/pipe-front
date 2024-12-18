import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Helmet } from 'react-helmet';
import { useHistory, useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import {
  AssetTree,
} from '~/components/AssetTree';
import { AssetStatus } from '~/components/AssetStatus';
import {
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
} from '~/icons';

import {
  Carousel,
  Loader,
  Button,
} from 'components';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallFormData, ApiResps } from 'providers';
import { colors } from 'styles/colors';
import {
  Card,
  Data,
  DataText,
  Title,
} from './styles';
import { DamScheduleSummary } from '../../SchedulesModals/DAM_Schedule';
import { DutScheduleSummary } from '../../SchedulesModals/DUT_Schedule';
import { AssetLayout } from '../AssetLayout';
import { DRIScheduleSummary } from '../../SchedulesModals/DRI_Shedule';
import { verifyInfoAdditionalParameters } from '~/helpers/additionalParameters';
import { withTransaction } from '@elastic/apm-rum-react';
import { TransparentLink } from '~/pages/NewNotifications/styles';
import { ReferenceType } from '../../../../providers/types/api-upload-service';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { generateNameFormatted } from '~/helpers/titleHelper';

type DevInfo = null
  | (
    ((ApiResps['/clients/get-asset-info']['info'])|(ApiResps['/clients/get-group-info']))
    & { PLACEMENT?: string }
  )

export const AssetInfo = (): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const match = useRouteMatch<{ devId: string, groupId: string }>();
  const history = useHistory();

  const [state, render, setState] = useStateVar(() => {
    moment.locale('pt-br');
    return {
      devId: match.params.devId,
      groupId: match.params.groupId,
      linkBase: match.url.split(`/${match.params.devId}`)[0],
      isLoading: true,
      devInfo: null as DevInfo,
      driInfo: null as null|ApiResps['/get-integration-info'],
      additionalMachineParameters: [] as {
        ID: number,
        COLUMN_NAME: string,
        COLUMN_VALUE: string,
      }[],
      assetSelected: false,
      selectedIndex: -1 as number,
      automationSelected: false as boolean,
      groupSelected: false as boolean,
      assetRoleSelected: undefined as undefined|number,
      placementSelected: null as null | string,
      DEV_AUT: null as string|null,
      DUT_ID: null as string|null,
      AUTOM_ID: null as string|null,
      AUTOM_DEVICE_ID: undefined as number|undefined,
      GROUP_INSTALLATION_DATE: null as string|null,
      GROUP_MODEL: null as string|null,
      FLUID_TYPE: null as string|null,
      MCHN_BRAND: null as string|null,
      RSSI: null as string|null,
      assets: [] as {
        ASSET_ID: number,
        DAT_ID: string,
        AST_TYPE: string,
        AST_DESC: string,
        DEV_ID: string,
        DEVICE_ID: number|null,
        H_INDEX: number|null,
        AST_ROLE: number,
        AST_ROLE_NAME: string,
        INSTALLATION_DATE: string,
        DAT_INDEX: number,
        MCHN_BRAND: string,
        CAPACITY_PWR: number,
        CAPACITY_UNIT: string,
        FLUID_TYPE: string,
        MCHN_MODEL: string,
        PLACEMENT: string | null,
        AST_ROLE_INDEX: number,
        selected: boolean,
        rssiText: string,
      }[],
      selectedDevInfo: [] as {
        DEV_ID: string,
        DEVICE_ID: number,
        MODEL: string|null,
        CAPACITY_PWR: number|null,
        FLUID_TYPE: string|null,
        DAT_BEGMON: string|null,
        LAST_TELEMETRY: string|null,
        STATUS: string|null,
        RSSI: string|null,
        DEVICE_TIMESTAMP: string|null,
        PLACEMENT?: string|null,
      }[],
      clientName: undefined as undefined|string,
      dutAutomationInfo: {} as {
        dutId?: string,
        placement?: string
      },
      hasNonDutDeviceInAssets: false as boolean,
    };
  });

  async function checkSetDutPlacement() {
    let cachedDutInfo: { info: { DEV_ID: string, PLACEMENT: string } } | null = null;
    if (state.devInfo && state.devId && state.devId.startsWith('DUT')) {
      cachedDutInfo = await apiCall('/dut/get-dut-info', { DEV_ID: state.devId });
      setState({ devInfo: { PLACEMENT: cachedDutInfo.info.PLACEMENT, ...state.devInfo } });
    }
    if (state.AUTOM_ID?.startsWith('DUT')) {
      // Evitando fazer 2 requests caso dut de automação seja o mesmo do focado
      if (state.AUTOM_ID !== state.devId || cachedDutInfo == null) {
        cachedDutInfo = await apiCall('/dut/get-dut-info', { DEV_ID: state.AUTOM_ID });
      }
      setState({ dutAutomationInfo: { dutId: cachedDutInfo.info.DEV_ID, placement: cachedDutInfo.info?.PLACEMENT } });
    }
  }

  useEffect(() => {
    (async function () {
      try {
        setState({ isLoading: true });
        if (state.devId) {
          await verifyDevInfo();
        }
        else {
          await verifyGroupInfo();
        }

        await verifyAssetInfo();

        if (profile.manageAllClients) {
          // @ts-ignore
          const { client } = await apiCall('/clients/get-client-info', { CLIENT_ID: state.devInfo.CLIENT_ID });
          setState({ clientName: client.NAME });
        }
        handleUrl();
        await checkSetDutPlacement();
      } catch (err) {
        toast.error(t('erroDadosDispositivo'));
        console.log(err);
      }
      setState({ isLoading: false });
    }());
  }, []);

  useEffect(() => {
    if (state.groupSelected || state.groupId) {
      getMachineAdditionalParameters();
    }
  }, [state.groupSelected]);

  async function verifyDevInfo() {
    if (!state.devId.includes('DAM') && !state.devId.includes('DUT') && !state.devId.includes('DRI')) {
      const { info: devInfoRes } = await apiCall('/clients/get-asset-info', { DEV_ID: state.devId, DAT_ID: state.devId, ASSET_ID: state.devId });
      state.devInfo = devInfoRes;
    }
    else {
      const devInfoRes = await apiCall('/clients/get-group-info', { GROUP_ID: Number(state.groupId) });
      state.devInfo = devInfoRes;
      state.automationSelected = true;
    }
  }

  async function verifyGroupInfo() {
    const devInfoRes = await apiCall('/clients/get-group-info', { GROUP_ID: Number(state.groupId) });
    state.devInfo = devInfoRes;
    state.groupSelected = true;
  }

  async function verifyAssetInfo() {
    if (state.devInfo?.GROUP_ID) {
      const assetsApiResponse = await apiCall('/clients/get-client-assets-by-group',
        {
          CLIENT_ID: [state.devInfo?.CLIENT_ID] || undefined,
          GROUP_ID: state.groupId ? Number(state.groupId) : state.devInfo?.GROUP_ID,
        });

      state.DEV_AUT = assetsApiResponse.DEV_AUT || assetsApiResponse.DAM_ID;
      state.DUT_ID = assetsApiResponse.DUT_ID;

      let condenser = 0;
      let evaporator = 0;
      let heatExchanger = 0;

      for (let index = 0; index < assetsApiResponse.assets.length; index++) {
        if (assetsApiResponse.assets[index].AST_ROLE === 1 && assetsApiResponse.assets[index].DEV_ID === '' && assetsApiResponse.DUT_ID?.length > 1) {
          assetsApiResponse.assets[index].DEV_ID = assetsApiResponse.DUT_ID;
        }

        if (assetsApiResponse.assets[index].DAT_INDEX === 0) {
          condenser += assetsApiResponse.assets[index].AST_ROLE === 2 ? 1 : 0;
          evaporator += assetsApiResponse.assets[index].AST_ROLE === 1 ? 1 : 0;
          heatExchanger += assetsApiResponse.assets[index].AST_ROLE === 4 ? 1 : 0;
        }

        let astRoleIndex = condenser;
        astRoleIndex = assetsApiResponse.assets[index].AST_ROLE === 1 ? evaporator : astRoleIndex;
        astRoleIndex = assetsApiResponse.assets[index].AST_ROLE === 4 ? heatExchanger : astRoleIndex;

        state.assets.push({
          ASSET_ID: assetsApiResponse.assets[index].ASSET_ID,
          DAT_ID: assetsApiResponse.assets[index].DAT_ID,
          AST_TYPE: assetsApiResponse.assets[index].AST_TYPE,
          AST_DESC: assetsApiResponse.assets[index].AST_DESC,
          DEV_ID: assetsApiResponse.assets[index].DEV_ID,
          DEVICE_ID: assetsApiResponse.assets[index].DEVICE_ID,
          H_INDEX: assetsApiResponse.assets[index].H_INDEX,
          AST_ROLE: assetsApiResponse.assets[index].AST_ROLE,
          AST_ROLE_NAME: assetsApiResponse.assets[index].AST_ROLE_NAME,
          INSTALLATION_DATE: assetsApiResponse.assets[index].INSTALLATION_DATE,
          DAT_INDEX: assetsApiResponse.assets[index].DAT_INDEX,
          MCHN_BRAND: assetsApiResponse.assets[index].MCHN_BRAND,
          CAPACITY_PWR: assetsApiResponse.assets[index].CAPACITY_PWR,
          CAPACITY_UNIT: assetsApiResponse.assets[index].CAPACITY_UNIT,
          FLUID_TYPE: assetsApiResponse.assets[index].FLUID_TYPE,
          MCHN_MODEL: assetsApiResponse.assets[index].MCHN_MODEL,
          AST_ROLE_INDEX: astRoleIndex,
          PLACEMENT: assetsApiResponse.assets[index].PLACEMENT,
          selected: assetsApiResponse.assets[index].DAT_ID === state.devId || assetsApiResponse.assets[index].DEV_ID === state.devId || assetsApiResponse.assets[index].ASSET_ID === Number(state.devId),
          rssiText: t('excelente'),
        });

        if (state.assets[state.assets.length - 1].selected) {
          state.assetSelected = true;
          state.selectedIndex = index;
          state.assetRoleSelected = assetsApiResponse.assets[index].AST_ROLE;
        }

        if (state.assets[index].DEV_ID && !state.assets[index].DEV_ID.startsWith('DUT')) {
          state.hasNonDutDeviceInAssets = true;
        }
        // Get dev info
        if (assetsApiResponse.assets[index].DEV_ID) {
          const itemDev = await apiCall('/get-dev-full-info', { DEV_ID: assetsApiResponse.assets[index].DEV_ID });
          state.selectedDevInfo.push({
            DEV_ID: assetsApiResponse.assets[index].DEV_ID,
            DEVICE_ID: itemDev.info.DEVICE_ID,
            MODEL: itemDev.dac?.DAC_MODEL || null,
            CAPACITY_PWR: itemDev.dac?.CAPACITY_PWR || 0,
            FLUID_TYPE: itemDev.dac?.FLUID_TYPE || null,
            LAST_TELEMETRY: '',
            STATUS: '',
            RSSI: null,
            DEVICE_TIMESTAMP: null,
            DAT_BEGMON: itemDev.info.DAT_BEGMON,
          });
          if (!assetsApiResponse.assets[index].DEVICE_ID) {
            assetsApiResponse.assets[index].DEVICE_ID = itemDev.info.DEVICE_ID;
            state.assets[index].DEVICE_ID = itemDev.info.DEVICE_ID;
          }
        }
      }

      if (state.groupId || state.devInfo.GROUP_ID) {
        const groupIdToRequest = state.groupId || state.devInfo.GROUP_ID;
        const groupInfo = await apiCall('/clients/get-group-info', { GROUP_ID: Number(groupIdToRequest) });
        state.GROUP_INSTALLATION_DATE = groupInfo.INSTALLATION_DATE;
        state.FLUID_TYPE = groupInfo.FLUID_TYPE;
        state.MCHN_BRAND = groupInfo.MCHN_BRAND;
        state.GROUP_MODEL = groupInfo.MODEL;
        state.AUTOM_ID = groupInfo.AUTOM_ID;
        state.AUTOM_DEVICE_ID = groupInfo.AUTOM_DEVICE_ID;
        if (state.AUTOM_ID && state.AUTOM_ID.startsWith('DRI')) {
          state.driInfo = await apiCall('/get-integration-info', { supplier: 'diel', integrId: state.AUTOM_ID });
        }
      }
    }
    else {
      const assetApiResponse = await apiCall('/clients/get-client-asset',
        {
          CLIENT_ID: [state.devInfo?.CLIENT_ID] || undefined,
          // @ts-ignore
          ASSET_ID: state.devInfo.ASSET_ID || undefined,
        });

      state.selectedIndex = 0;
      state.assets.push({
        ASSET_ID: assetApiResponse.asset.ASSET_ID,
        DAT_ID: assetApiResponse.asset.DAT_ID,
        AST_TYPE: assetApiResponse.asset.AST_TYPE,
        AST_DESC: assetApiResponse.asset.AST_DESC,
        DEV_ID: assetApiResponse.asset.DEV_ID,
        DEVICE_ID: assetApiResponse.asset.DEVICE_ID,
        H_INDEX: assetApiResponse.asset.H_INDEX,
        AST_ROLE: assetApiResponse.asset.AST_ROLE,
        AST_ROLE_NAME: assetApiResponse.asset.AST_ROLE_NAME,
        INSTALLATION_DATE: assetApiResponse.asset.INSTALLATION_DATE,
        DAT_INDEX: assetApiResponse.asset.DAT_INDEX,
        MCHN_BRAND: assetApiResponse.asset.MCHN_BRAND,
        CAPACITY_PWR: assetApiResponse.asset.CAPACITY_PWR,
        CAPACITY_UNIT: assetApiResponse.asset.CAPACITY_UNIT,
        FLUID_TYPE: assetApiResponse.asset.FLUID_TYPE,
        MCHN_MODEL: assetApiResponse.asset.MCHN_MODEL,
        AST_ROLE_INDEX: 0,
        PLACEMENT: null,
        selected: assetApiResponse.asset.DAT_ID === state.devId || assetApiResponse.asset.DEV_ID === state.devId || assetApiResponse.asset.ASSET_ID === Number(state.devId),
        rssiText: t('excelente'),
      });
      state.assetSelected = true;
      state.assetRoleSelected = assetApiResponse.asset.AST_ROLE;

      // Get dev info
      if (assetApiResponse.asset.DEV_ID) {
        const itemDev = await apiCall('/get-dev-full-info', { DEV_ID: assetApiResponse.asset.DEV_ID });
        state.selectedDevInfo.push({
          DEV_ID: assetApiResponse.asset.DEV_ID,
          DEVICE_ID: itemDev.info.DEVICE_ID,
          MODEL: itemDev.dac?.DAC_MODEL || null,
          CAPACITY_PWR: itemDev.dac?.CAPACITY_PWR || 0,
          FLUID_TYPE: itemDev.dac?.FLUID_TYPE || null,
          LAST_TELEMETRY: '',
          STATUS: '',
          RSSI: null,
          DEVICE_TIMESTAMP: null,
          DAT_BEGMON: itemDev.info.DAT_BEGMON,
        });

        if (!assetApiResponse.asset.DEV_ID.startsWith('DUT')) {
          state.hasNonDutDeviceInAssets = true;
        }
      }
    }
  }

  async function getMachineAdditionalParameters() {
    const additionalParameters = await apiCall('/get-machine-additional-parameters', { MACHINE_ID: Number(state.groupId) });
    state.additionalMachineParameters = additionalParameters;
  }

  function handleUrl() {
    if (!state.groupId && state.devInfo?.GROUP_ID) {
      state.groupId = state.devInfo.GROUP_ID.toString();
      state.linkBase = `/analise/maquina/${state.groupId}/ativos`;
      const devAux = state.assets[state.selectedIndex]?.ASSET_ID;
      const url = `${state.linkBase}/${devAux}/informacoes`;
      history.push(url);
    }
    else if (!state.devInfo?.GROUP_ID) {
      state.linkBase = '/analise/ativo';
      const devAux = state.assets[state.selectedIndex]?.ASSET_ID;
      const url = `${state.linkBase}/${devAux}/informacoes`;
      history.push(url);
    }

    if (state.linkBase.endsWith('/')) {
      state.linkBase = state.linkBase.slice(0, -1);
    }
  }

  function getCarouselId() {
    return state.assetSelected ? state.assets[state.selectedIndex].ASSET_ID : state.groupId;
  }

  async function handleGetImages() {
    if (state.assetSelected) {
      if (state.assets[state.selectedIndex].DEV_ID) {
        let referenceType: ReferenceType = 'DACS';
        if (state.assets[state.selectedIndex].DEV_ID.startsWith('DUT')) {
          referenceType = 'DUTS';
        }
        return apiCall('/upload-service/get-images', {
          referenceId: state.assets[state.selectedIndex].DEVICE_ID!,
          referenceType,
        });
      }
      return apiCall('/upload-service/get-images', {
        referenceId: state.assets[state.selectedIndex].ASSET_ID!,
        referenceType: 'ASSETS',
      });
    }

    const listAll = await Promise.all(state.assets.map((item) => {
      if (item.DEV_ID?.startsWith('DAC')) {
        return apiCall('/upload-service/get-images', {
          referenceId: item.DEVICE_ID!,
          referenceType: 'DACS',
        });
      }
      if (item.DEV_ID?.startsWith('DUT')) {
        return apiCall('/upload-service/get-images', {
          referenceId: item.DEVICE_ID!,
          referenceType: 'DUTS',
        });
      }
      return apiCall('/upload-service/get-images', {
        referenceId: item.ASSET_ID,
        referenceType: 'ASSETS',
      });
    }));

    let list = [] as string[];

    const listGroup = await apiCall('/upload-service/get-images', {
      referenceId: Number(state.groupId),
      referenceType: 'MACHINES',
    });
    list = list.concat(listGroup.list);
    listAll.forEach((item) => list = list.concat(item.list));

    return { list };
  }

  async function handlePostImage(photo: Blob) {
    if (state.assetSelected) {
      if (state.assets[state.selectedIndex].DEV_ID) {
        let referenceType: ReferenceType = 'DACS';
        if (state.assets[state.selectedIndex].DEV_ID.startsWith('DUT')) {
          referenceType = 'DUTS';
        }
        return apiCallFormData('/upload-service/upload-image', { referenceId: state.assets[state.selectedIndex].DEVICE_ID!, referenceType }, { file: photo });
      }
      return apiCallFormData('/upload-service/upload-image', { referenceId: state.assets[state.selectedIndex].ASSET_ID, referenceType: 'ASSETS' }, { file: photo });
    }
    return apiCallFormData('/upload-service/upload-image', { referenceId: Number(state.groupId), referenceType: 'MACHINES' }, { file: photo });
  }

  async function handleDeleteImage(imageUrl: string) {
    if (state.assetSelected) {
      if (state.assets[state.selectedIndex].DEV_ID.length > 0) {
        if (state.assets[state.selectedIndex].DEV_ID.startsWith('DUT')) {
          return apiCall('/upload-service/delete-image', {
            referenceId: state.assets[state.selectedIndex].DEVICE_ID!,
            referenceType: 'DUTS',
            filename: imageUrl,
          });
        }
        return apiCall('/upload-service/delete-image', {
          referenceId: state.assets[state.selectedIndex].DEVICE_ID!,
          referenceType: 'DACS',
          filename: imageUrl,
        });
      }
      return apiCall('/upload-service/delete-image', {
        referenceId: state.assets[state.selectedIndex].ASSET_ID,
        referenceType: 'ASSETS',
        filename: imageUrl,
      });
    }

    if (imageUrl.includes('assets_images') || imageUrl.includes('ASSETS/')) {
      const beginAssetIdIndex = imageUrl.includes('assets_images/') ? imageUrl.lastIndexOf('assets_images/') : imageUrl.lastIndexOf('ASSETS/');
      const assetId = imageUrl.substring(beginAssetIdIndex + (imageUrl.includes('assets_images/') ? 'assets_images/' : 'ASSETS/').length).split('-')[0].toUpperCase();
      return apiCall('/upload-service/delete-image', {
        referenceId: Number(assetId.slice(assetId.indexOf('_') + 1)),
        referenceType: 'ASSETS',
        filename: imageUrl,
      });
    }

    if (imageUrl.includes('dev_groups_images') || imageUrl.includes('MACHINES')) {
      return apiCall('/upload-service/delete-image', {
        referenceId: Number(state.groupId),
        referenceType: 'MACHINES',
        filename: imageUrl,
      });
    }

    const beginDacIdIndex = imageUrl.includes('dac_images/') ? imageUrl.lastIndexOf('dac_images/') : imageUrl.lastIndexOf('DACS/');
    const dacId = imageUrl.substring(beginDacIdIndex + (imageUrl.includes('dac_images/') ? 'dac_images/' : 'DACS/').length).split('-')[0];
    return apiCall('/upload-service/delete-image', {
      referenceId: Number(dacId),
      referenceType: 'DACS',
      filename: imageUrl,
    });
  }

  function getReferenceTypeDevAut(): ReferenceType {
    if (state.AUTOM_ID?.startsWith('DAM')) {
      return 'DAMS';
    }
    if (state.AUTOM_ID?.startsWith('DRI')) {
      return 'DRIS';
    }
    if (state.AUTOM_ID?.startsWith('DAC')) {
      return 'DACS';
    }
    return 'DUTS';
  }

  const handleGetAutomationImages = async () => {
    const referenceType = getReferenceTypeDevAut();

    if (referenceType) {
      return apiCall('/upload-service/get-images', {
        referenceId: state.AUTOM_DEVICE_ID!,
        referenceType,
      });
    }
    return { list: [] };
  };

  const handlePostAutomationImage = async (photo: Blob) => {
    const referenceType = getReferenceTypeDevAut();
    return apiCallFormData('/upload-service/upload-image', { referenceId: state.AUTOM_DEVICE_ID!, referenceType }, { file: photo });
  };

  const handleDeleteAutomationImage = async (imageUrl: string) => {
    const referenceType = getReferenceTypeDevAut();
    return apiCall('/upload-service/delete-image', {
      referenceId: state.AUTOM_DEVICE_ID!,
      referenceType,
      filename: imageUrl,
    });
  };

  function showButton() {
    if (state.assetSelected) {
      return true;
    }
    return false;
  }

  const { devInfo } = state;

  function groupName(group: {GROUP_NAME: string} | null) {
    return group?.GROUP_NAME || t('semInformacao');
  }

  async function selectedCard(position: number) {
    setState({ isLoading: true });
    state.selectedIndex = position;
    state.assetSelected = position > -1;
    state.automationSelected = position === -1;
    state.groupSelected = position === -2;
    state.assetRoleSelected = state.assetSelected ? state.assets[state.selectedIndex].AST_ROLE : undefined;
    state.placementSelected = state.assetSelected && state.assets[state.selectedIndex].PLACEMENT ? state.assets[state.selectedIndex].PLACEMENT : null;

    let urlAux = '';
    if (state.assetSelected) {
      const devAux = state.assets[state.selectedIndex].DEV_ID || state.assets[state.selectedIndex].DAT_ID || state.assets[state.selectedIndex].ASSET_ID;
      urlAux = `${state.linkBase}/${devAux}/informacoes`;
    }
    else if (state.automationSelected) {
      urlAux = state.AUTOM_ID ? `${state.linkBase}/${state.AUTOM_ID}/informacoes` : state.linkBase;
    }
    else {
      urlAux = state.AUTOM_ID ? `${state.linkBase}` : state.linkBase;
    }

    history.push(urlAux);
    setState({ isLoading: false });
    render();
  }

  function devSelected() {
    const result = (state.assetSelected ? (state.assets[state.selectedIndex].DEV_ID || state.assets[state.selectedIndex].DAT_ID) : state.AUTOM_ID);
    return result;
  }

  function devText() {
    let result = (state.assetSelected ? (state.assets[state.selectedIndex].DAT_ID) : state.AUTOM_ID) || null;
    result = !state.groupSelected ? result : state.groupId;
    if (state.assetSelected && state.assets[state.selectedIndex].DEV_ID) {
      result = result ? `${result}/${state.assets[state.selectedIndex].DEV_ID}` : `${state.assets[state.selectedIndex].DEV_ID}`;
    }
    return result;
  }

  function capacityPowerText() {
    let totalCapacity = 0;
    state.assets.forEach((asset) => { if (asset.AST_ROLE === 2) totalCapacity += asset.CAPACITY_PWR; });
    return state.assetSelected ? formatNumberWithFractionDigits(state.assets[state.selectedIndex].CAPACITY_PWR ?? t('semInformacao')) : formatNumberWithFractionDigits(totalCapacity);
  }

  function capacityUnitText() {
    return state.assets[(state.selectedIndex > -1 ? state.selectedIndex : 0)]?.CAPACITY_UNIT || '';
  }

  function fluidTypeText() {
    const indexAux = state.selectedIndex > -1 ? state.selectedIndex : 0;
    const fluidAux = state.assetSelected ? state.assets[indexAux].FLUID_TYPE : state.FLUID_TYPE;
    return fluidAux || t('semInformacao');
  }

  function modelText() {
    const modelAux = state.assetSelected ? state.assets[state.selectedIndex].MCHN_MODEL : state.GROUP_MODEL || (state.assets[0]?.MCHN_MODEL || null);
    return modelAux || t('semInformacao');
  }

  function brandText() {
    const indexAux = state.selectedIndex > -1 ? state.selectedIndex : 0;
    const brandAux = state.assetSelected ? state.assets[indexAux].MCHN_BRAND : state.MCHN_BRAND;
    return brandAux || t('semInformacao');
  }

  function instalationDateText() {
    const monitorationDateAux = state.assetSelected ? state.assets[state.selectedIndex].INSTALLATION_DATE : state.GROUP_INSTALLATION_DATE;
    return (monitorationDateAux && moment(monitorationDateAux).format('DD/MM/YYYY')) || t('semInformacao');
  }

  function formatRssiIcon(rssi: string) {
    switch (rssi) {
      case t('excelente'): return <GreatSignalIcon />;
      case t('bom'): return <GoodSignalIcon />;
      case t('regular'): return <RegularSignalIcon />;
      case t('ruim'): return <BadSignalIcon />;
      default: return <NoSignalIcon />;
    }
  }

  function showEditButton() {
    if (!state.groupSelected && (state.assetSelected || state.automationSelected)) {
      return true;
    }
    return false;
  }

  function showTree() {
    if (state.groupId) {
      return true;
    }
    return false;
  }

  function editDevice() {
    if (state.assetSelected) {
      if (state.assets[state.selectedIndex].DEV_ID) {
        history.push(`${state.linkBase}/${state.assets[state.selectedIndex].DEV_ID}/editar`);
      }
      else if (!state.assets[state.selectedIndex].DAT_INDEX) {
        history.push(`${state.linkBase}/${state.assets[state.selectedIndex].ASSET_ID}/editarAtivo`);
      }
      else {
        history.push(`${state.linkBase}/${state.assets[state.selectedIndex].ASSET_ID}/editarAtivo/${state.assets[state.selectedIndex].DAT_INDEX}`);
      }
    }
    else if (state.automationSelected && state.AUTOM_ID) {
      history.push(`${state.linkBase}/${state.AUTOM_ID}/editar`);
    }
  }

  function showStatus() {
    return state.assetSelected ? state.assets[state.selectedIndex]?.DEV_ID?.length > 0 : (state.automationSelected && state.AUTOM_ID != null);
  }

  function getGroupName() {
    return !state.groupSelected ? t('ativo') : t('maquina');
  }

  function getIsDevice() {
    return (devText()?.startsWith('DUT') || devText()?.startsWith('DAM') || devText()?.startsWith('DAC'));
  }

  function getEditDevicePermissions(devInfo) {
    return (profile.manageAllClients || profile.permissions.CLIENT_MANAGE.includes(devInfo.CLIENT_ID)) && (showEditButton());
  }

  function buildScreenInfoParams(): Parameters<(typeof AssetLayout)>[0]['screenInfo'] {
    // caso onde dispositivo de automação não é o próprio DUT duo selecionado.
    // Queremos ocultar pois não existe falha possível se isso acontecer.
    // Se não houver dispositivo de automação, seguimos a lógica normal de decidir se aba aparece ou não.
    const shouldForceHideHealthTab = state.assetRoleSelected !== undefined
      && state.devInfo?.PLACEMENT === 'DUO'
      && ((state.dutAutomationInfo?.dutId ?? state.devId) !== state.devId);
    return {
      assetRoleSelected: state.assetRoleSelected,
      groupSelected: state.groupSelected,
      hasNonDutDeviceInAssets: state.hasNonDutDeviceInAssets,
      dutAutomationInfo: {
        placement: state.dutAutomationInfo?.placement,
        dutId: state.dutAutomationInfo?.dutId,
      },
      devAssociated: state?.assets[state.selectedIndex]?.DEV_ID,
      isDuoSelected: state.devInfo?.PLACEMENT === 'DUO' || state.dutAutomationInfo?.placement === 'DUO' || state.placementSelected === 'DUO',
      forceHideHealthTab: shouldForceHideHealthTab,
    };
  }

  function isAssetWithoutIdSelected() {
    return state.assetSelected
      && !state.assets[state.selectedIndex]?.DAT_ID
      && !state.assets[state.selectedIndex]?.DEV_ID;
  }

  const isDesktop = window.matchMedia('(min-width: 765px)');
  const isMobile = !isDesktop.matches;
  function selectedDecideName() {
    if (state.assetSelected) {
      return state.assets[state.selectedIndex].AST_DESC;
    }
    if (state.groupSelected) {
      return state.devInfo?.GROUP_NAME;
    }
    if (state.automationSelected) {
      return state.DEV_AUT;
    }
    return null;
  }
  function selectedDecideNameInfo() {
    if (state.assetSelected) {
      return t('ativo');
    }
    if (state.automationSelected) {
      return t('automacao');
    }
    return t('maquina');
  }
  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(selectedDecideName(), selectedDecideNameInfo())}</title>
      </Helmet>
      <AssetLayout
        key={state.selectedIndex}
        devInfo={state.devInfo}
        clientName={state.clientName}
        screenInfo={buildScreenInfoParams()}
      />
      <Card style={{ borderTop: '10px solid #363BC4' }}>
        <Flex flexWrap="wrap" flexDirection="row" ml={-32} mt={-4}>
          {showTree()
          && (
            <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="378px" style={{ borderRight: '1px solid lightgrey' }}>
              {state.isLoading
                ? (
                  <Loader />
                )
                : (
                  <>
                    <div style={{ borderBottom: '1px solid lightgrey', marginTop: '15px', paddingBottom: '15px' }}>
                      <strong style={{ marginLeft: '25px', fontSize: '90%' }}>
                        {t('maquina')}
                      </strong>
                    </div>
                    <AssetTree
                      assets={state.assets}
                      AUTOM_ID={state.AUTOM_ID}
                      DEV_AUT={state.DEV_AUT}
                      DUT_ID={state.DUT_ID}
                      GROUP_ID={state.groupId}
                      GROUP_NAME={groupName(devInfo)}
                      onHandleSelectCard={selectedCard}
                      isAutomationelected={state.automationSelected}
                      isGroupSelected={state.groupSelected}
                    />
                  </>
                )}
            </Flex>
          )}
          <Flex justifyContent="space-between" flexWrap="wrap" flex="1" style={{ minWidth: '375px' }}>
            {state.isLoading
              ? (
                <Loader />
              )
              : (devInfo && (
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left" width="100%">
                <Flex flexWrap="wrap" flexDirection="row" alignItems="left" width="100%" justifyContent="space-between">
                  <Flex flexWrap="nowrap" flexDirection="column" alignItems="left" width={isMobile ? '100%' : showStatus() ? '30%' : '55%'}>
                    <div style={{ marginTop: '35px', paddingBottom: '10px', marginLeft: '20px' }}>
                      <strong style={{ fontSize: '90%', color: !state.automationSelected ? colors.Black : colors.Grey }}>
                        {getGroupName()}
                      </strong>
                      <br />
                      <strong>
                        {state.assets[state.selectedIndex]?.AST_DESC || groupName(devInfo)}
                      </strong>
                    </div>
                    {!isAssetWithoutIdSelected() && (
                      <Flex flexWrap="wrap" flexDirection="column" alignItems="left" style={{ marginLeft: '20px', fontSize: '80%' }}>
                        <strong>
                          {!state.groupSelected ? t('devId') : t('idMaquina')}
                        </strong>
                          {getIsDevice() ? (
                            <TransparentLink to={`/analise/dispositivo/${devText()}/informacoes`}>
                              {devText()}
                            </TransparentLink>
                          )
                            : (
                              <span>
                                {devText()}
                              </span>
                            )}
                      </Flex>
                    )}
                  </Flex>
                  {showStatus()
                  && (
                    <Flex flexWrap="wrap" flexDirection="row" alignContent="right" width="62%" mr="10px" alignItems="flex-end">
                      <AssetStatus key={devSelected()} DUT_ID={state.DUT_ID} DEV_AUT={state.DEV_AUT} DEV_ID={devSelected()} isAutomation={state.automationSelected} />
                    </Flex>
                  )}
                </Flex>
                {(!state.automationSelected || (state.automationSelected && state.AUTOM_ID?.startsWith('DRI'))) && (
                <div
                  style={{
                    border: '1px solid #DEDEDE',
                    marginLeft: '20px',
                    marginRight: '0.75rem',
                    marginTop: '15px',
                    marginBottom: '15px',
                  }}
                  height="100%"
                />
                )}
                <Flex justifyContent="flex-start" flexWrap="wrap" width="100%" ml="20px">
                  <Flex flexDirection="row" width="50%" flexWrap="wrap" mb="20px" mt="20px">
                    <Flex flexWrap="wrap" width="100%" flexDirection="column">
                      {!state.automationSelected && (
                        <>
                          <Flex flexDirection="row" flexWrap="wrap" justifyContent="flex-start" width="100%" alignItems="flex-start">
                            <Flex flexDirection="column">
                              <div>
                                <Title>
                                  {t('informacoes')}
                                </Title>
                                {state.assetSelected
                                && (
                                <Data>
                                  <DataText color={colors.Grey400} fontWeight="bold">
                                    {t('tipoAtivo')}
                                  </DataText>
                                  <DataText>{state.assets[state.selectedIndex].AST_ROLE_NAME}</DataText>
                                </Data>
                                )}
                                {!state.assetSelected && (
                                <Data>
                                  <DataText color={colors.Grey400} fontWeight="bold">
                                    {t('fabricante')}
                                  </DataText>
                                  <DataText>{brandText()}</DataText>
                                </Data>
                                ) }
                                <Data>
                                  <DataText color={colors.Grey400} fontWeight="bold">
                                    {t('modelo')}
                                  </DataText>
                                  <DataText>{modelText()}</DataText>
                                </Data>
                                <Data>
                                  <DataText color={colors.Grey400} fontWeight="bold">
                                    {t('capacidadeFrigorifica')}
                                  </DataText>
                                  <DataText>{`${capacityPowerText()} ${capacityUnitText()}`}</DataText>
                                </Data>
                                <Data>
                                  <DataText color={colors.Grey400} fontWeight="bold">
                                    {t('fluidoRefrigerante')}
                                  </DataText>
                                  <DataText>{fluidTypeText()}</DataText>
                                </Data>
                                <Data>
                                  <DataText color={colors.Grey400} fontWeight="bold">
                                    {t('dataInstalacao')}
                                  </DataText>
                                  <DataText>{instalationDateText()}</DataText>
                                </Data>
                              </div>
                            </Flex>
                          </Flex>
                          {(state.groupSelected && state.additionalMachineParameters.length > 0) && (
                            <Flex flexDirection="row" flexWrap="wrap" justifyContent="flex-start" width="100%" alignItems="flex-start">
                              <Flex flexDirection="column">
                                {verifyInfoAdditionalParameters(state.additionalMachineParameters)}
                              </Flex>
                            </Flex>
                          )}
                          <Box width={1}>
                            {getEditDevicePermissions(devInfo) && (
                              <div>
                                <Button
                                  style={{ maxWidth: '100px' }}
                                  onClick={() => editDevice()}
                                  variant="primary"
                                >
                                  {t('botaoEditar')}
                                </Button>
                              </div>
                            )}
                          </Box>
                        </>
                      )}
                      {(state.automationSelected && state.AUTOM_ID) && (
                        <Flex flexDirection="row" flexWrap="wrap" justifyContent="flex-start" width="100%" alignItems="flex-start">
                          <Flex flexDirection="column">
                            <div style={{ marginTop: '10px', fontSize: '90%' }}>
                              {state.AUTOM_ID.startsWith('DAM') && (
                                <DamScheduleSummary damId={state.AUTOM_ID} assetLayout />
                              )}
                              {state.AUTOM_ID.startsWith('DUT') && (
                                <DutScheduleSummary dutId={state.AUTOM_ID} />
                              )}
                              {state.AUTOM_ID.startsWith('DRI') && state.driInfo && (
                                <DRIScheduleSummary driId={state.driInfo.info.dataSource} layout="asset" devInfo={state.driInfo.info} varsCfg={state.driInfo.dri} />
                              )}
                              <Box width={1} marginTop="20px">
                                {getEditDevicePermissions(devInfo) && (
                                <div>
                                  <Button
                                    style={{ maxWidth: '100px' }}
                                    onClick={() => editDevice()}
                                    variant="primary"
                                  >
                                    {t('editar')}
                                  </Button>
                                </div>
                                )}
                              </Box>
                            </div>
                          </Flex>
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                  {!state.automationSelected && (
                    <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb="20px" mt="20px">
                      <Flex
                        flexDirection="column"
                        alignItems={['center', 'center', 'center', 'center', 'flex-end', 'flex-end']}
                      >
                        <Box width={1} maxWidth="310px" mb="16px" mr="40px" justifyContent="center" alignItems="center">
                          <Carousel
                            key={getCarouselId()}
                            match={match}
                            getImages={handleGetImages}
                            postImage={handlePostImage}
                            deleteImage={handleDeleteImage}
                          />
                        </Box>
                      </Flex>
                    </Box>
                  )}
                  {(state.automationSelected && state.AUTOM_ID) && (
                    <Box width={[1, 1, 1, 1, 1, 1 / 3]} mb="20px" mt="20px">
                      <Flex
                        flexDirection="column"
                        alignItems={['center', 'center', 'center', 'center', 'flex-end', 'flex-end']}
                      >
                        <Box width={1} maxWidth="310px" mb="16px" mr="40px" justifyContent="center" alignItems="center">
                          <Carousel
                            key={getCarouselId()}
                            match={match}
                            getImages={handleGetAutomationImages}
                            postImage={handlePostAutomationImage}
                            deleteImage={handleDeleteAutomationImage}
                          />
                        </Box>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Flex>
              ) || null)}
          </Flex>
        </Flex>
      </Card>
    </>
  );
};

export default withTransaction('AssetInfo', 'component')(AssetInfo);
