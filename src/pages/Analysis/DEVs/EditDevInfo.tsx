import {
  ChangeEvent, useEffect, useRef, useState,
} from 'react';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import BackupEcoV2DamDac from '~/assets/img/BackupEcoV2DamDac.png';
import { Image } from 'antd';
import {
  Input,
  Checkbox,
  Loader,
  ModalWindow,
  ScheduleViewCard,
  ScheduleEditCard,
  ExceptionViewCard,
  ExceptionEditCard,
  Button,
  InputCalculator,
  ModalLoading,
  Card as NewCard,
  ClearSelect,
} from 'components';
import { ToggleSwitchMini } from 'components/ToggleSwitch';
import { Select } from 'components/NewSelect';
import { getCachedDevInfo } from 'helpers/cachedStorage';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocketLazy } from 'helpers/wsConnection';
import { PaperIcon, CheckboxIcon } from 'icons';
import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import { AssetLayout } from 'pages/Analysis/Assets/AssetLayout';
import { FormEditGroup } from 'pages/ClientPanel/FormEditGroup';
import { FormEditUnit } from 'pages/ClientPanel/FormEditUnit';
import { apiCall, ApiParams, ApiResps } from 'providers';
import { DevFullInfo } from 'store';

import { DamScheduleContents } from '../DAMs/DamSchedule';
import { Headers2 } from '../Header';
import { EditDevInfoDRI, DriConfig } from '../Integrations/IntegrEdit/DriConfig';
import jsonTryParse from '~/helpers/jsonTryParse';
import { CardsCfg } from '../Integrations/IntegrEdit';
import {
  Card,
  TextLine,
  Title,
  Text,
  CustomSelect,
  ContainerInfo,
  ContainerText,
  OverLay,
  HoverEcoLocal,
  ContainerEcoMode,
} from './styles';
import { colors } from '~/styles/colors';
import { ScheduleDut, ExceptionDut } from '../../../providers/types/api-private';
import { identifyDutIrCommands } from '../DUTs/EnvironmentRealTime';
import { useTranslation, Trans } from 'react-i18next';
import { EditDalInfo } from '../DALs/EditDalInfo';
import { EditDmtInfo } from '../DMTs/DmtEdit';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import {
  SearchInput,
  Label,
} from '../styles';
import { CustomInput } from '../DMTs/styles';
import { BtnClean } from '../DALs/styles';
import ReactTooltip from 'react-tooltip';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const EditDevInfo = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ devId: string }>();
  const routeParams = useParams<{ devId: string }>();
  const [profile] = useState(getUserProfile);
  const [resendTimeError, setResendTimeError] = useState('');
  const [sendAndDisableAut, setSendAndDisableAut] = useState(false);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      devId: routeParams.devId,
      devType: {} as {
        isDac: boolean,
        isDam: boolean,
        isDut: boolean,
        isDutAut: boolean,
        isOnlyDutRef: boolean,
        isDri: boolean,
        isDal: boolean,
        isDmt: boolean,
        dutAutEnabled: boolean| null,
        isDutQA: boolean,
      },
      isLoading: true,
      isSaving: false,
      devInfo: null as null|DevFullInfo,
      damFuNomCalc: null as null | number,
      selectedL1Sim: undefined as undefined|boolean,
      assetLayout: false as boolean,
      temperatureControlState: null as null|{ automation: boolean, mode: string, temperature: number, LTC: number },
      persistedAssetDevice: null as null|{ value: number, label: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null, MCHN_KW: number },
      formData: {
        DAT_BEGMON: '',
        DAT_BEGAUT: '',
        CLIENT_ID_item: null as null|{ NAME: string, CLIENT_ID: number },
        UNIT_ID_item: null as null|{ UNIT_NAME: string, UNIT_ID: number },
        ENVIRONMENT_ID_item: null as null|{ ENVIRONMENT_NAME: string, ENVIRONMENT_ID: number, DUT_CODE: string },
        ROOM_NAME: '',
        CTRLOPER_item: null as null|{ label: string, value: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED' },
        DUTAUTCFG_item: null as null|{ label: string, value: 'IR'|'RELAY'|'DISABLED' },
        ENABLE_ECO_item: null as null|{ label: string, value: string, valueN: 0|1|2 },
        ENABLE_ECO_local: null as null|{ label: string, value: 0|1},
        ECO_CFG_item: null as null|{ label: string, value: string },
        GROUP_ID_item: null as null|{ label: string, value: number, unit: number, name?: string },
        REL_DUT_ID_item: null as null|{ DEV_ID: string, UNIT_ID: number, RTYPE_NAME: string, TUSEMAX?: number, TUSEMIN?: number },
        DAC_APPL_item: null as null|{ label: string, value: { DAC_APPL: string, hasPliq: boolean, hasPsuc: boolean } },
        FLUID_TYPE_item: null as null|{ label: string, value: string },
        DAC_TYPE_item: null as null|{ label: string, value: string, tags: string },
        DAC_ENV_item: null as null|{ label: string, value: string, tags: string },
        DAC_BRAND_item: null as null|{ label: string, value: string },
        ASSET_ID_item: null as null|{ value: number, label: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null },
        DAC_MODEL: '',
        DAC_DESC: '',
        DAC_NAME: '',
        DAC_MODIF_item: null as null|{ label: string, value: string },
        DAC_COMIS_item: null as null|{ label: string, value: string },
        DAC_HEAT_EXCHANGER_item: null as null|{ID: number, NAME: string, BRAND?: string, MODEL?: string},
        P0_POSITION: null as null|{ label: string, value: string },
        P0_SENSOR: null as null|{ label: string, value: string },
        P1_POSITION: null as null|{ label: string, value: string },
        P1_SENSOR: null as null|{ label: string, value: string },
        T0_POSITION: null as null|{ label: string, value: string },
        T1_POSITION: null as null|{ label: string, value: string },
        T2_POSITION: null as null|{ label: string, value: string },
        USE_RELAY_item: null as null|{ label: string, value: string, valueN: 0|1 },
        MCHN_BRAND_item: null as null|{ label: string, value: string },
        PLACEMENT_item: null as null|undefined|{ label: string, value: 'AMB'|'INS'|'DUO' },
        DAM_PLACEMENT_item: null as null|undefined|{ label: string, value: 'RETURN'|'DUO' },
        SENSOR_AUTOM: null as null|0|1,
        MCHN_MODEL: '',
        ECO_OFST_START: '',
        ECO_OFST_END: '',
        TSETPOINT: '',
        RESENDPER: '',
        LTCRIT: '',
        LTINF: '',
        varsConfigInput: '',
        CAPACITY_UNIT_item: null as null|{ value: string },
        CAPACITY_PWR: '',
        DAC_COP: '',
        DAC_KW: '',
        FU_NOM: '',
        configTsensors: false,
        ECO_INTERVAL_TIME: '',
        TEMPERATURE_OFFSET: '',
        ECO_SETPOINT: '',
        ECO_LTC: '',
        ECO_LTI: '',
        ECO_UPPER_HYSTERESIS: '',
        ECO_LOWER_HYSTERESIS: '',
        ECO_SCHEDULE_START_BEHAVIOR_item: null as null|{ label: string, value: string },
        MINIMUM_TEMPERATURE: '',
        MAXIMUM_TEMPERATURE: '',
        EXT_THERM_CFG: null as null | { label: string, value: 'D'|'S'|'P' },
        COMPRESSOR_NOMINAL_CURRENT: '',
        EQUIPMENT_POWER_item: null as null|{ label: string, value: string },
        DAM_INSTALLATION_LOCATION_item: null as null|{ label: string, value: string },
        T0_POSITION_DAM: null as null|{ label: string, value: 'RETURN'|'INSUFFLATION'|null },
        T1_POSITION_DAM: null as null|{ label: string, value: 'RETURN'|'INSUFFLATION'|null },
        EVAPORATOR_MODEL_item: null as null|{ label: string, value: string },
        INSUFFLATION_SPEED: '',
        APPLICATION: '',
      },
      automationTabHasBeenSelected: false,
      comboOpts: {
        yesNo: [
          {
            label: t('sim'), value: '1', valueN: 1, valueNinv: 0,
          },
          {
            label: t('nao'), value: '0', valueN: 0, valueNinv: 1,
          },
        ] as { label: string, value: string, valueN: 0|1, valueNinv: 0|1 }[],
        optionsEco: [
          {
            label: t('sim'), value: '1', valueN: 1, valueNinv: 0,
          },
          {
            label: t('simEco2'), value: '2', valueN: 2, valueNinv: 2,
          },
          {
            label: t('nao'), value: '0', valueN: 0, valueNinv: 1,
          },
        ] as { label: string, value: string, valueN: 0|1|2, valueNinv: 0|1|2 }[],
        optionsEcoLocal: [
          {
            label: t('sim'), value: 1,
          },
          {
            label: t('nao'), value: 0,
          },
        ] as { label: string, value: 0|1 }[],
        pPositions: [
          { label: 'Psuc', value: 'Psuc' },
          { label: 'Pliq', value: 'Pliq' },
        ],
        tPositions: [
          { label: 'Tamb', value: 'Tamb' },
          { label: 'Tsuc', value: 'Tsuc' },
          { label: 'Tliq', value: 'Tliq' },
        ],
        applicsNew: [
          { label: t('1acComPliq'), value: { DAC_APPL: 'ar-condicionado', hasPliq: true, hasPsuc: false } },
          { label: t('2acComPsuc'), value: { DAC_APPL: 'ar-condicionado', hasPliq: false, hasPsuc: true } },
          { label: t('4acSemPliqPsuc'), value: { DAC_APPL: 'ar-condicionado', hasPliq: false, hasPsuc: false } },
        ],
        capacUnits: [
          { label: 'TR', value: 'TR' },
          { label: 'BTU/hr', value: 'BTU/hr' },
          { label: 'kW', value: 'kW' },
          { label: 'HP', value: 'HP' },
        ],
        placement: [
          { label: t('ambientePadrao'), value: 'AMB' },
          { label: t('insuflamento'), value: 'INS' },
          { label: t('duo'), value: 'DUO' },
        ] as { label: string, value: 'INS'|'AMB' }[],
        damPlacement: [
          { label: t('retorno'), value: 'RETURN' },
          { label: t('duo'), value: 'DUO' },
        ] as { label: string, value: 'DUO'|'RETURN' }[],
        sensorAutom: [t('retorno'), t('insuflamento')],
        sensorDamDuo: [{ label: t('retorno'), value: 'RETURN' }, { label: t('insuflamento'), value: 'INSUFFLATION' }] as { label: string, value: 'RETURN'|'INSUFFLATION' }[],
        dutAutCfg: [
          { label: t('infraVermelhoPadrao'), value: 'IR' },
          { label: t('rele'), value: 'RELAY' },
          { label: t('nao'), value: 'DISABLED' },
        ] as { label: string, value: 'IR'|'RELAY'|'DISABLED' }[],
        dutControlOperation: [
          { label: t('modoEco'), value: '1_CONTROL' },
          { label: t('modoSobDemanda'), value: '2_SOB_DEMANDA' },
          { label: t('modoBackup'), value: '3_BACKUP' },
          { label: t('modoBloqueio'), value: '4_BLOCKED' },
          { label: t('modoBackupEco'), value: '5_BACKUP_CONTROL' },
          { label: t('modoEco2'), value: '6_BACKUP_CONTROL_V2' },
          { label: t('modoForcado'), value: '7_FORCED' },
        ] as { label: string, value: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED' }[],
        clients: [] as { NAME: string, CLIENT_ID: number }[],
        timezones: [] as { label: string, value: number }[],
        states: [] as { STATE_NAME: string, STATE_ID: string, COUNTRY_ID: number }[],
        cities: [] as { CITY_NAME: string, CITY_ID: string, STATE_ID: string }[],
        countries: [] as { COUNTRY_NAME: string, COUNTRY_ID: number}[],
        units: [] as { UNIT_NAME: string, UNIT_ID: number }[],
        environments: [] as {ENVIRONMENT_ID: number, ENVIRONMENT_NAME: string, DUT_CODE: string, ENVIRONMENT_LABEL: string}[],
        ecoModeCfg: [] as { label: string, value: string }[],
        groups: [] as { label: string, value: number, withDacAut?: boolean, checked?: boolean, unit: number, dev_aut: string }[],
        assets: [] as { value: number, label: string, UNIT_ID: number, CLIENT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, DAT_ID: string|null, DAT_INDEX: number|null }[],
        duts: [] as { DEV_ID: string, UNIT_ID: number, RTYPE_NAME: string, TUSEMAX?: number, TUSEMIN?: number }[],
        psens: [] as { label: string, value: string }[],
        fluids: [] as { label: string, value: string }[],
        applics: [] as { label: string, value: string }[],
        types: [] as { label: string, value: string, tags: string }[],
        envs: [] as { label: string, value: string, tags: string }[],
        brands: [] as { label: string, value: string }[],
        scheduleStartBehavior: [] as { label: string, value: string}[],
        heatExchangerTypes: [] as {ID: number, NAME: string, BRAND?: string, MODEL?: string, label: string, value: string}[],
        dutScheduleStartBehavior: [] as { label: string, value: string}[],
        dutScheduleEndBehavior: [] as { label: string, value: string}[],
        dutForcedBehavior: [] as { label: string, value: string}[],
        damInstallationLocation: [] as { label: string, value: string}[],
        evaporatorModels: [] as { label: string, value: string}[],
        extThermCfg: [
          { label: t('desabilitado'), value: 'D' },
          { label: t('emSerie'), value: 'S' },
          { label: t('emParalelo'), value: 'P' },
        ] as { label: string, value: 'D'|'S'|'P' }[],
        equipmentPower: [
          { label: '380V / 3F / 60Hz', value: '380V / 3F / 60Hz' },
          { label: '220V / 3F / 60Hz', value: '220V / 3F / 60Hz' },
          { label: '220V / 1F / 60Hz', value: '220V / 1F / 60Hz' },
        ],
      },
      filtComboOpts: {
        groups: [] as { label: string, value: number, withDacAut?: boolean, checked?: boolean, unit: number, dev_aut: string }[],
        duts: [] as { DEV_ID: string, UNIT_ID: number }[],
        types: [] as { label: string, value: string }[],
        envs: [] as { label: string, value: string }[],
      },
      telemetry: {
        P0raw: null,
        P1raw: null,
      },
      openModal: null as null|string,
      offsetChecked: false as boolean,
      hysteresisChecked: false as boolean,
      dutCompatibilityHysteresisEco2: false as boolean,
      driInfo: null as null|ApiResps['/get-integration-info'],
      machinesAssetsList: null as null|ApiResps['/clients/get-machines-list'],
      cards: [] as string[],
      subcards: [] as string[],
      relevances: [] as string[],
      DUTS_SCHEDULES: [] as ScheduleDut[],
      DUTS_SCHEDULES_FILTERED: [] as ScheduleDut[],
      DUTS_SCHEDULES_DELETED: [] as number[],
      DUTS_EXCEPTIONS: [] as ExceptionDut[],
      DUTS_EXCEPTIONS_FILTERED: [] as ExceptionDut[],
      DUTS_EXCEPTIONS_DELETED: [] as number[],
      selectedSchedule: null as ScheduleDut|null,
      selectedIndexSchedule: null as number|null,
      selectedException: null as ExceptionDut|null,
      selectedIndexException: null as number|null,
      NEED_MULT_SCHEDULES: false as boolean,
      CHANGE_EXCEPTION_PARAMETERS: false as boolean,
      showExceptions: false as boolean,
      irCommands: [] as {
        IR_ID: string,
        CMD_NAME: string,
        CMD_TYPE: string|null,
        TEMPER: number
      }[],
      persisted_USE_RELAY_item: null as null|{ label: string, value: string, valueN: 0|1 },
      isLoadingUnitInfo: false as boolean,
    };
    if (!profile.permissions.isInstaller) {
      state.comboOpts.applicsNew.push(
        { label: t('3acComPliqPsuc'), value: { DAC_APPL: 'ar-condicionado', hasPliq: true, hasPsuc: true } },
        { label: t('5cfComPliq'), value: { DAC_APPL: 'camara-fria', hasPliq: true, hasPsuc: false } },
        { label: t('6cfComPsuc'), value: { DAC_APPL: 'camara-fria', hasPliq: false, hasPsuc: true } },
        { label: t('7cfComPliqPsuc'), value: { DAC_APPL: 'camara-fria', hasPliq: true, hasPsuc: true } },
        { label: t('8cfSemPlicPsuc'), value: { DAC_APPL: 'camara-fria', hasPliq: false, hasPsuc: false } },
        { label: t('9fancoil'), value: { DAC_APPL: 'fancoil', hasPliq: false, hasPsuc: false } },
        { label: t('10chillerComPliq'), value: { DAC_APPL: 'chiller', hasPliq: true, hasPsuc: false } },
        { label: t('11chillerComPsuc'), value: { DAC_APPL: 'chiller', hasPliq: false, hasPsuc: true } },
        { label: t('12chillerComPliqPsuc'), value: { DAC_APPL: 'chiller', hasPliq: true, hasPsuc: true } },
        { label: t('13chillerSemPliqPsuc'), value: { DAC_APPL: 'chiller', hasPliq: false, hasPsuc: false } },
        { label: t('14trocadorCalor'), value: { DAC_APPL: 'trocador-de-calor', hasPliq: false, hasPsuc: false } },
      );
    }
    return state;
  });

  function redirectToIntegrations() {
    if (match.params.devId.startsWith('DRI') || match.params.devId.startsWith('DMA')) {
      const url = `/integracoes/info/diel/${state.devId}/editar`;
      history.push(url);
    }
  }

  useEffect(() => {
    redirectToIntegrations();
  }, []);

  const temprtControlModeDetails = {
    '1_CONTROL': t('detalhesModoControle1'),
    '2_SOB_DEMANDA': t('detalhesModoControle2'),
    '4_BLOCKED': t('detalhesModoControle4'),
    '5_BACKUP_CONTROL': t('detalhesModoControle5'),
    '6_BACKUP_CONTROL_V2': t('detalhesModoControle6'),
    '7_FORCED': t('detalhesModoControle7'),
  };

  const dacDamEcoDetails = t('damEcoDetalhes');

  const ecoModeDetails = {
    'eco-C1-V': t('detalheModoEcoC1-V', {
      value1: state.formData.ECO_INTERVAL_TIME,
      value2: state.formData.ECO_INTERVAL_TIME,
    }),
    'eco-C2-V': t('detalheModoEcoC2-V', {
      value1: state.formData.ECO_INTERVAL_TIME,
      value2: state.formData.ECO_INTERVAL_TIME,
    }),
  };

  const wsl = useWebSocketLazy();
  function onWsOpen(wsConn) {
    wsConn.send({ type: 'subscribeTelemetry', data: { dac_id: state.devId } });
  }
  function onWsMessage(message) {
    if (message && message.type === 'dacTelemetry') {
      setState({ telemetry: message.data });
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'subscribeTelemetry', data: {} });
  }

  function checkDamFields(damData: ApiParams['/dam/set-dam-info']) {
    let returnCheck = true;

    if (damData.ENABLE_ECO && damData.SELF_REFERENCE && damData.MAXIMUM_TEMPERATURE != null && damData.MINIMUM_TEMPERATURE != null) {
      if (damData.MAXIMUM_TEMPERATURE < damData.MINIMUM_TEMPERATURE) {
        toast.warn(t('avisoTemperaturaMaximaDeveSerMaiorMinima'));
        returnCheck = false;
      }
    }

    if (damData.ENABLE_ECO && !damData.ECO_CFG) {
      toast.warn(t('avisoNecessarioSelecionarConfiguracaoModoEco'));
      returnCheck = false;
    }

    if ((damData.UPPER_HYSTERESIS != null && damData.UPPER_HYSTERESIS < 0) || (damData.LOWER_HYSTERESIS != null && damData.LOWER_HYSTERESIS < 0)) {
      toast.warn(t('avisoNaoPodeHaverHistereseNegativa'));
      returnCheck = false;
    }

    if (damData.REL_DUT_ID && (damData.groups == null || damData.groups.length === 0)) {
      toast.warn(t('necessarioSelecionarGrupoReliacionarDamDut'));
      returnCheck = false;
    }

    returnCheck = checkGroupAutomated(damData.groups);

    return returnCheck;
  }

  function checkGroupAutomated(groupsDevice) {
    let returnCheck = true;
    if (groupsDevice) {
      groupsDevice.forEach((group) => {
        const groupInfo = state.filtComboOpts.groups.find((groupInfo) => groupInfo.value.toString() === group);
        if (groupInfo?.dev_aut != null && groupInfo.dev_aut !== state.devId) {
          toast.warn(t('avisoGrupoEstaAutomatizadoDispositivo', {
            value1: groupInfo.label,
            value2: groupInfo.dev_aut,
          }));
          returnCheck = false;
        }
      });
    }
    return returnCheck;
  }
  function checkIsDutRef(groupsDevice) {
    let returnCheck = false;
    if (groupsDevice) {
      groupsDevice.forEach((group) => {
        const groupInfo = state.filtComboOpts.groups.find((groupInfo) => groupInfo.value === group.GROUP_ID);
        if (groupInfo?.dev_aut != null && groupInfo.dev_aut !== state.devId) {
          returnCheck = true;
        }
      });
    }
    return returnCheck;
  }
  async function deleteAutAndDisassociate() {
    setState({ isSaving: true });
    try {
      const dutData: ApiParams['/dut/set-dut-info'] = {
        DEV_ID: state.devId,
        ROOM_NAME: state.formData.ROOM_NAME ?? null,
        PLACEMENT: state.formData.PLACEMENT_item?.value ?? null,
        CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID ?? null,
        UNIT_ID: state.formData.UNIT_ID_item?.UNIT_ID ?? null,
        TEMPERATURE_OFFSET: state.formData.TEMPERATURE_OFFSET && state.offsetChecked ? parseDecimalNumber(state.formData.TEMPERATURE_OFFSET) : null,
        ENVIRONMENT_ID: state.formData.ENVIRONMENT_ID_item?.ENVIRONMENT_ID ?? null,
      };

      const deleteDayProg = {
        permission: 'allow' as 'allow' | 'forbid',
        start: '',
        end: '',
        clearProg: true,
      };
      const dutProgramming: ApiParams['/dut/set-programming-v3'] = {
        dutId: state.devId,
        week: {
          mon: deleteDayProg,
          tue: deleteDayProg,
          wed: deleteDayProg,
          thu: deleteDayProg,
          fri: deleteDayProg,
          sat: deleteDayProg,
          sun: deleteDayProg,
        },
        exceptions: {},
      };
      state.DUTS_EXCEPTIONS.forEach((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
        dutProgramming.exceptions[day] = {
          permission: exception.PERMISSION,
          start: exception.BEGIN_TIME,
          end: exception.END_TIME,
          clearProg: true,
        };
      });
      await apiCall('/dut/set-programming-v3', dutProgramming);
      await apiCall('/dut/set-dut-info', dutData);
      toast.success(t('sucessoAoSalvar'));
    } catch (error) {
      toast.error(t('houveErro'));
    }
    setState({ isSaving: false });
    setSendAndDisableAut(false);
  }

  const formatDacData = () => {
    const currentUseRelayValue = state.formData.USE_RELAY_item ? state.formData.USE_RELAY_item.valueN : 0;
    const considerDutRef = state.persisted_USE_RELAY_item?.valueN ? 1 : currentUseRelayValue;
    let l1SimMode: string | null = null;
    if (state.selectedL1Sim) {
      if (state.devInfo?.dac?.DAC_APPL === 'fancoil') {
        l1SimMode = 'fancoil';
      }
      else {
        l1SimMode = 'virtual';
      }
    }
    const dacData: ApiParams['/dac/set-dac-info'] = {
      DAC_ID: state.devId,
      DAC_DESC: valueOrNull(state.formData.DAC_DESC),
      DAC_NAME: valueOrNull(state.formData.DAC_NAME),
      DAC_MODEL: valueOrNull(state.formData.DAC_MODEL),
      CLIENT_ID: valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID),
      UNIT_ID: valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID),
      GROUP_ID: valueOrNull(state.formData.GROUP_ID_item?.value),
      FLUID_TYPE: valueOrNull(state.formData.FLUID_TYPE_item?.value),
      DAC_TYPE: valueOrNull(state.formData.DAC_TYPE_item?.value),
      CAPACITY_UNIT: valueOrNull(state.formData?.CAPACITY_UNIT_item?.value),
      CAPACITY_PWR: valueOrNull(parseDecimalNumber(state.formData.CAPACITY_PWR)),
      COMPRESSOR_NOMINAL_CURRENT: valueOrNull(parseDecimalNumber(state.formData.COMPRESSOR_NOMINAL_CURRENT)),
      EQUIPMENT_POWER: valueOrNull(state.formData.EQUIPMENT_POWER_item?.value),
      EVAPORATOR_MODEL_ID: valueOrNull(state.formData.EVAPORATOR_MODEL_item && Number(state.formData.EVAPORATOR_MODEL_item.value)),
      DAC_COP: valueOrNull(parseDecimalNumber(state.formData.DAC_COP)),
      DAC_ENV: valueOrNull(state.formData.DAC_ENV_item?.value),
      DAC_BRAND: valueOrNull(state.formData.DAC_BRAND_item?.value),
      DAC_MODIF: valueOrNull(state.formData.DAC_MODIF_item?.value),
      DAC_COMIS: valueOrNull(state.formData.DAC_COMIS_item?.value),
      DAC_HEAT_EXCHANGER_ID: valueOrNull(state.formData.DAC_HEAT_EXCHANGER_item?.ID),
      DAC_APPL: null,
      P0_POSITN: null,
      P0_SENSOR: null,
      P1_POSITN: null,
      P1_SENSOR: null,
      T0_T1_T2: null,
      REL_DUT_ID: considerDutRef ? (valueOrNull(state.formData.REL_DUT_ID_item?.DEV_ID)) : undefined,
      SELECTED_L1_SIM: l1SimMode,
      INSUFFLATION_SPEED: valueOrNull(parseDecimalNumber(state.formData.INSUFFLATION_SPEED)),
      USE_RELAY: 0,
    };
    return dacData;
  };

  const getPsucAndPliq = () => {
    const applicationConfig = valueOrNull(state.formData.DAC_APPL_item?.value);
    let Psuc = null as null|string;
    let Pliq = null as null|string;
    let isValidationOk = true;
    if (state.formData.P0_POSITION && state.formData.P0_POSITION.value === 'Psuc') Psuc = 'P0';
    if (state.formData.P0_POSITION && state.formData.P0_POSITION.value === 'Pliq') Pliq = 'P0';
    if (state.formData.P1_POSITION && state.formData.P1_POSITION.value === 'Psuc') Psuc = 'P1';
    if (state.formData.P1_POSITION && state.formData.P1_POSITION.value === 'Pliq') Pliq = 'P1';
    if (applicationConfig.hasPsuc && !Psuc) { alert(t('alertaNecessarioPreencherFormulaConversaoPsuc')); isValidationOk = false; return { Psuc, Pliq, isValidationOk }; }
    if (applicationConfig.hasPliq && !Pliq) { alert(t('alertaNecessarioPreencherFormulaConversaoPliq')); isValidationOk = false; return { Psuc, Pliq, isValidationOk }; }
    return { Psuc, Pliq, isValidationOk };
  };

  const validateDacApp = (dacData: ApiParams['/dac/set-dac-info']) => {
    if (dacData.DAC_APPL === 'trocador-de-calor' && dacData.DAC_TYPE === 'tipo-trocador-de-calor' && state.comboOpts.heatExchangerTypes.length === 0) {
      toast.error(t('erroClienteNaoTemTipoTrocadorDeCalorParaSerSelecionado'));
      return false;
    }

    if (dacData.DAC_APPL === 'trocador-de-calor' && dacData.DAC_TYPE === 'tipo-trocador-de-calor' && !dacData.DAC_HEAT_EXCHANGER_ID) {
      toast.error(t('erroParaCompletarOperacaoNecessarioSelecionarTipoTrocadorCalor'));
      return false;
    }
    return true;
  };

  const validatePsucAndPliq = (Psuc: string | null, Pliq: string | null, dacData: ApiParams['/dac/set-dac-info']) => {
    const applicationConfig = valueOrNull(state.formData.DAC_APPL_item?.value);
    if (Psuc === 'P0' || Pliq === 'P0') {
      if (!state.formData.P0_SENSOR) { alert(t('alertaNecessarioSelecionarSensorP0')); return false; }
      dacData.P0_POSITN = state.formData.P0_POSITION!.value;
      dacData.P0_SENSOR = state.formData.P0_SENSOR.value;
    }
    if (Psuc === 'P1' || Pliq === 'P1') {
      if (!state.formData.P1_SENSOR) { alert(t('alertaNecessarioSelecionarSensorP1')); return false; }
      dacData.P1_POSITN = state.formData.P1_POSITION!.value;
      dacData.P1_SENSOR = state.formData.P1_SENSOR.value;
    }
    dacData.DAC_APPL = applicationConfig.DAC_APPL;

    return true;
  };

  const validateDacAppConfig = (dacData: ApiParams['/dac/set-dac-info']) => {
    const applicationConfig = valueOrNull(state.formData.DAC_APPL_item?.value);
    if (applicationConfig) {
      const { Psuc, Pliq, isValidationOk } = getPsucAndPliq();
      if (!isValidationOk) return false;

      if (!validatePsucAndPliq(Psuc, Pliq, dacData)) return false;

      if (!validateDacApp(dacData)) return false;
    }

    return true;
  };

  const validateDacData = (dacData: ApiParams['/dac/set-dac-info']) => {
    if (dacData.GROUP_ID && !state.formData.ASSET_ID_item) {
      toast.warn(t('ativoObrigatorio'));
      return false;
    }
    if (state.formData.ASSET_ID_item?.DEV_ID && state.formData.ASSET_ID_item?.DEV_ID !== state.devId) {
      toast.warn(t('ativoRelacionadoOutroDispositivo'));
      return false;
    }

    if (!validateDacAppConfig(dacData)) return false;

    return true;
  };

  const sendDacData = async (dacData: ApiParams['/dac/set-dac-info']) => {
    if ((!dacData.GROUP_ID && state.persistedAssetDevice) || (state.persistedAssetDevice && state.formData.ASSET_ID_item && state.persistedAssetDevice.value !== state.formData.ASSET_ID_item.value)) {
      await apiCall('/clients/edit-asset', {
        GROUP_ID: state.persistedAssetDevice.GROUP_ID,
        DAT_ID: state.persistedAssetDevice.DAT_ID as string || undefined,
        AST_DESC: state.persistedAssetDevice.label,
        UNIT_ID: state.persistedAssetDevice.UNIT_ID,
        AST_ROLE: state.persistedAssetDevice.ASSET_ROLE,
        DAT_INDEX: state.persistedAssetDevice.DAT_INDEX,
        ASSET_ID: state.persistedAssetDevice.value,
        DEV_ID: null,
        OLD_DEV_ID: state.persistedAssetDevice.DEV_ID,
        CLIENT_ID: state.persistedAssetDevice.CLIENT_ID,
      });
    }

    if (state.formData.ASSET_ID_item) {
      await apiCall('/clients/edit-asset', {
        DAT_INDEX: state.formData.ASSET_ID_item.DAT_INDEX,
        AST_ROLE: state.formData.ASSET_ID_item.ASSET_ROLE,
        ASSET_ID: state.formData.ASSET_ID_item.value,
        GROUP_ID: state.formData.ASSET_ID_item.GROUP_ID,
        UNIT_ID: state.formData.ASSET_ID_item.UNIT_ID,
        OLD_DEV_ID: state.formData.ASSET_ID_item.DEV_ID,
        DEV_ID: state.devId,
        DAT_ID: state.formData.ASSET_ID_item.DAT_ID as string || undefined,
        AST_DESC: state.formData.ASSET_ID_item.label,
        CLIENT_ID: state.formData.ASSET_ID_item.CLIENT_ID,
        MCHN_KW: valueOrNull(parseDecimalNumber(state.formData.DAC_KW)),
        UPDATE_MACHINE_RATED_POWER: true,
      });
    }
    await apiCall('/dac/set-dac-info', dacData);
  };

  const valueOrNumber = (value, number) => (value || number);

  const setDacWithDamInfo = (dacData: ApiParams['/dac/set-dac-info']) => {
    dacData.ECO_OFST_START = valueOrNumber(parseDecimalNumber(state.formData.ECO_OFST_START || '0'), 0);
    dacData.ECO_OFST_END = valueOrNumber(parseDecimalNumber(state.formData.ECO_OFST_END || '0'), 0);
    dacData.FU_NOM = valueOrNull(state.formData.FU_NOM && parseDecimalNumber(state.formData.FU_NOM));
    dacData.ECO_INT_TIME = valueOrNumber(parseDecimalNumber(state.formData.ECO_INTERVAL_TIME), 5);

    if (state.devInfo?.dam?.CAN_SELF_REFERENCE) {
      dacData.UPPER_HYSTERESIS = valueOrNumber(parseDecimalNumber(state.formData.ECO_UPPER_HYSTERESIS || '0'), 0);
      dacData.LOWER_HYSTERESIS = valueOrNumber(parseDecimalNumber(state.formData.ECO_LOWER_HYSTERESIS || '0'), 0);
      dacData.SETPOINT = valueOrNumber(parseDecimalNumber(state.formData.ECO_SETPOINT || '21'), 21);
    }

    if (dacData.ENABLE_ECO === 2) {
      dacData.SCHEDULE_START_BEHAVIOR = valueOrNull(state.formData.ECO_SCHEDULE_START_BEHAVIOR_item?.value);
      dacData.ECO_INT_TIME = valueOrNumber(parseDecimalNumber(state.formData.ECO_INTERVAL_TIME || '0'), 0);
      dacData.SETPOINT = valueOrNumber(parseDecimalNumber(state.formData.ECO_SETPOINT || '21'), 21);
      dacData.LTC = valueOrNumber(parseDecimalNumber(state.formData.ECO_LTC || '0'), 0);
      dacData.LTI = valueOrNumber(parseDecimalNumber(state.formData.ECO_LTI || '0'), 0);
      dacData.UPPER_HYSTERESIS = valueOrNumber(parseDecimalNumber(state.formData.ECO_UPPER_HYSTERESIS || '0'), 0);
      dacData.LOWER_HYSTERESIS = valueOrNumber(parseDecimalNumber(state.formData.ECO_LOWER_HYSTERESIS || '0'), 0);
    }
  };

  const handleDacWithDam = (dacData: ApiParams['/dac/set-dac-info']) => {
    if (!checkGroupAutomated([dacData.GROUP_ID])) {
      setState({ isSaving: false });
      return false;
    }
    dacData.USE_RELAY = valueOrNull(state.formData.USE_RELAY_item?.valueN);
    if (dacData.USE_RELAY === 1) {
      dacData.ENABLE_ECO = valueOrNull(state.formData.ENABLE_ECO_item?.valueN);
    } else {
      dacData.ENABLE_ECO = 0;
    }
    if (dacData.ENABLE_ECO !== 0) {
      dacData.ECO_CFG = valueOrNull(state.formData.ECO_CFG_item?.value);
    } else {
      dacData.ECO_CFG = null;
    }

    if (dacData.ENABLE_ECO && (!dacData.CLIENT_ID || !dacData.UNIT_ID) && (state.devInfo?.CLIENT_ID || state.devInfo?.UNIT_ID)) {
      toast.warn(t(t('precisaDesabilitarAutomacao')));
      setState({ isSaving: false });
      return false;
    }

    if (dacData.ENABLE_ECO && !dacData.GROUP_ID) {
      toast.warn(t('precisaMaquinaAutomatizada'));
      setState({ isSaving: false });
      return false;
    }

    setDacWithDamInfo(dacData);
    return true;
  };

  const saveDacInfo = async () => {
    const dacData = formatDacData();

    if (!validateDacData(dacData)) return;

    if (state.formData.configTsensors) {
      dacData.T0_T1_T2 = [
        valueOrNull(state.formData.T0_POSITION?.value),
        valueOrNull(state.formData.T1_POSITION?.value),
        valueOrNull(state.formData.T2_POSITION?.value),
      ];
    }
    if (state.devType.isDam) {
      if (!handleDacWithDam(dacData)) return;
    }

    await sendDacData(dacData);
  };

  const showDamWarnings = (damData: ApiParams['/dam/set-dam-info']) => {
    if ((damData.ECO_CFG === 'eco-C1-V' || damData.ECO_CFG === 'eco-C2-V') && (damData.ECO_INT_TIME! < 5)) {
      damData.ECO_INT_TIME = 5;
      toast.warn(t('ecoIntTimeParaEcoC-V'));
    }

    if (damData.REL_DUT_ID && damData.groups?.length === 0) {
      toast.warn(t('avisoAmbienteMonitorado'));
    }
  };

  const validateDamParams = (damData: ApiParams['/dam/set-dam-info']) => {
    if (damData.PLACEMENT === 'DUO') {
      if (damData.T0_POSITION === damData.T1_POSITION && damData.T0_POSITION != null) {
        toast.error('Não é permitido selecionar o mesmo posicionamento para os sensores T0 e T1');
        return false;
      }
    }

    showDamWarnings(damData);

    if (!checkGroupAutomated(damData.groups)) {
      setState({ isSaving: false });
      return false;
    }

    if (!damData.ENABLE_ECO) {
      damData.ECO_CFG = null;
    }
    else {
      if ((!damData.CLIENT_ID || !damData.UNIT_ID) && (state.devInfo?.CLIENT_ID || state.devInfo?.UNIT_ID)) {
        toast.warn(t(t('precisaDesabilitarAutomacao')));
        setState({ isSaving: false });
        return false;
      }
      if (!damData.groups || damData.groups.length === 0) {
        toast.warn(t('precisaMaquinaAutomatizada'));
        setState({ isSaving: false });
        return false;
      }
    }
    return true;
  };

  const formatDamData = () => {
    const damData: ApiParams['/dam/set-dam-info'] = {
      DAM_ID: state.devId,
      CLIENT_ID: valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID),
      UNIT_ID: valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID),
      ENABLE_ECO: valueOrNull(state.formData.ENABLE_ECO_item?.valueN),
      ENABLE_ECO_LOCAL: state.formData.ENABLE_ECO_local ? state.formData.ENABLE_ECO_local.value : null,
      ECO_CFG: valueOrNull(state.formData.ECO_CFG_item?.value),
      REL_DUT_ID: valueOrNull(state.formData.REL_DUT_ID_item?.DEV_ID?.startsWith('DUT') ? state.formData.REL_DUT_ID_item?.DEV_ID : null),
      groups: state.filtComboOpts.groups.filter((group) => group.checked).map((group) => group.value.toString()),
      ECO_OFST_START: parseDecimalNumber(state.formData.ECO_OFST_START ?? '0') ?? 0,
      ECO_OFST_END: parseDecimalNumber(state.formData.ECO_OFST_END ?? '0') ?? 0,
      FU_NOM: state.formData.FU_NOM ? parseDecimalNumber(state.formData.FU_NOM) : null,
      ECO_INT_TIME: parseDecimalNumber(state.formData.ECO_INTERVAL_TIME) ?? 5,
      HAD_AUTOMATION_SETTING_CHANGED: state.automationTabHasBeenSelected,
      EXT_THERM_CFG: (state.devInfo?.dam?.supportsExtTherm && state.formData.EXT_THERM_CFG?.value) || undefined,
      INSTALLATION_LOCATION: valueOrNull(state.formData.DAM_INSTALLATION_LOCATION_item?.value),
      PLACEMENT: (state.formData.DAM_PLACEMENT_item?.value) ?? 'RETURN',
      T0_POSITION: valueOrNull(state.formData.DAM_PLACEMENT_item?.value === 'DUO' ? state.formData.T0_POSITION_DAM?.value : null),
      T1_POSITION: valueOrNull(state.formData.DAM_PLACEMENT_item?.value === 'DUO' ? state.formData.T1_POSITION_DAM?.value : null),
    };
    return damData;
  };

  const setDamDataWithCanSelfReference = (damData: ApiParams['/dam/set-dam-info']) => {
    if (state.devInfo?.dam?.CAN_SELF_REFERENCE) {
      damData.SELF_REFERENCE = state.formData.REL_DUT_ID_item?.DEV_ID?.startsWith('DAM');
      if (damData.SELF_REFERENCE) {
        damData.MINIMUM_TEMPERATURE = parseDecimalNumber(state.formData.MINIMUM_TEMPERATURE ?? '20') ?? 20;
        damData.MAXIMUM_TEMPERATURE = parseDecimalNumber(state.formData.MAXIMUM_TEMPERATURE ?? '28') ?? 28;
      }
      damData.UPPER_HYSTERESIS = parseDecimalNumber(state.formData.ECO_UPPER_HYSTERESIS ?? '0') ?? 0;
      damData.LOWER_HYSTERESIS = parseDecimalNumber(state.formData.ECO_LOWER_HYSTERESIS ?? '0') ?? 0;
      damData.SETPOINT = parseDecimalNumber(state.formData.ECO_SETPOINT ?? '21') ?? 21;
    }

    if (state.devInfo?.dam?.CAN_SELF_REFERENCE && !checkDamFields(damData)) {
      return false;
    }
    return true;
  };

  const saveDamInfo = async () => {
    const damData = formatDamData();

    if (!validateDamParams(damData)) return;

    if (!setDamDataWithCanSelfReference(damData)) return;

    if (damData.ENABLE_ECO === 2) {
      damData.SCHEDULE_START_BEHAVIOR = valueOrNull(state.formData.ECO_SCHEDULE_START_BEHAVIOR_item?.value);
      damData.ECO_INT_TIME = parseDecimalNumber(state.formData.ECO_INTERVAL_TIME ?? '0') ?? 0;
      damData.LTC = parseDecimalNumber(state.formData.ECO_LTC ?? '0') ?? 0;
      damData.LTI = parseDecimalNumber(state.formData.ECO_LTI ?? '0') ?? 0;
      damData.UPPER_HYSTERESIS = parseDecimalNumber(state.formData.ECO_UPPER_HYSTERESIS ?? '0') ?? 0;
      damData.LOWER_HYSTERESIS = parseDecimalNumber(state.formData.ECO_LOWER_HYSTERESIS ?? '0') ?? 0;
    }

    await apiCall('/dam/set-dam-info', damData);
    redirectToProfile();
  };

  const dutBeginValidations = () => {
    const environmentToCheck = state.comboOpts.environments.find((item) => item.ENVIRONMENT_ID === state.formData.ENVIRONMENT_ID_item?.ENVIRONMENT_ID);
    if (state.formData.ENVIRONMENT_ID_item && environmentToCheck?.DUT_CODE && environmentToCheck?.DUT_CODE !== state.devId) {
      toast.warn(t('outroDutRelacionadoAmbiente'));
      return false;
    }

    return true;
  };

  const formatDutData = () => {
    const dutData: ApiParams['/dut/set-dut-info'] = {
      DEV_ID: state.devId,
      ROOM_NAME: valueOrNull(state.formData.ROOM_NAME),
      PLACEMENT: valueOrNull(state.formData.PLACEMENT_item?.value),
      CLIENT_ID: valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID),
      UNIT_ID: valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID),
      TEMPERATURE_OFFSET: state.formData.TEMPERATURE_OFFSET && state.offsetChecked ? parseDecimalNumber(state.formData.TEMPERATURE_OFFSET) : null,
      ENVIRONMENT_ID: valueOrNull(state.formData.ENVIRONMENT_ID_item?.ENVIRONMENT_ID),
      groups: state.devType.isDutAut ? state.filtComboOpts.groups.filter((group) => group.checked).map((group) => group.value.toString()) : undefined,
    };
    return dutData;
  };

  const handleDutAsset = async () => {
    if ((!devInfo?.GROUP_ID && state.persistedAssetDevice) || (state.persistedAssetDevice && state.formData.ASSET_ID_item && state.persistedAssetDevice.value !== state.formData.ASSET_ID_item.value) || (state.persistedAssetDevice && !state.formData.ASSET_ID_item)) {
      await apiCall('/clients/edit-asset', {
        ASSET_ID: state.persistedAssetDevice.value,
        DAT_ID: state.persistedAssetDevice.DAT_ID as string || undefined,
        AST_DESC: state.persistedAssetDevice.label,
        CLIENT_ID: state.persistedAssetDevice.CLIENT_ID,
        GROUP_ID: state.persistedAssetDevice.GROUP_ID,
        UNIT_ID: state.persistedAssetDevice.UNIT_ID,
        AST_ROLE: state.persistedAssetDevice.ASSET_ROLE,
        DEV_ID: null,
        OLD_DEV_ID: state.persistedAssetDevice.DEV_ID,
        DAT_INDEX: state.persistedAssetDevice.DAT_INDEX,
      });
    }

    if (state.formData.ASSET_ID_item) {
      await apiCall('/clients/edit-asset', {
        ASSET_ID: state.formData.ASSET_ID_item.value,
        DAT_ID: state.formData.ASSET_ID_item.DAT_ID as string || undefined,
        AST_DESC: state.formData.ASSET_ID_item.label,
        CLIENT_ID: state.formData.ASSET_ID_item.CLIENT_ID,
        GROUP_ID: state.formData.ASSET_ID_item.GROUP_ID,
        UNIT_ID: state.formData.ASSET_ID_item.UNIT_ID,
        AST_ROLE: state.formData.ASSET_ID_item.ASSET_ROLE,
        DEV_ID: state.devId,
        OLD_DEV_ID: state.formData.ASSET_ID_item.DEV_ID,
        DAT_INDEX: state.formData.ASSET_ID_item.DAT_INDEX,
      });
    }
  };

  const beginDutAutValidations = (dutData: ApiParams['/dut/set-dut-info']) => {
    dutData.groups = state.filtComboOpts.groups.filter((group) => group.checked).map((group) => group.value.toString());
    if (!checkGroupAutomated(dutData.groups)) {
      setState({ isSaving: false });
      return false;
    }

    if (state.formData.DUTAUTCFG_item?.value === 'IR' && (!dutData.CLIENT_ID || !dutData.UNIT_ID) && (state.devInfo?.CLIENT_ID || state.devInfo?.UNIT_ID)) {
      if (profile.permissions.isInstaller) {
        setSendAndDisableAut(true);
      } else {
        toast.warn(t(t('precisaDesabilitarAutomacao')));
        setState({ isSaving: false });
      }
      return false;
    }
    if (state.formData.DUTAUTCFG_item?.value === 'IR' && (!dutData.groups || dutData.groups.length === 0)) {
      toast.warn(t('precisaMaquinaAutomatizada'));
      setState({ isSaving: false });
      return false;
    }
    return true;
  };

  const handleDutSched = (dutSchedules: ApiParams['/dut/set-dut-schedules']) => {
    // #region Dut Schedules
    dutSchedules.NEED_MULT_SCHEDULES = state.NEED_MULT_SCHEDULES;

    // Adiciona programações editadas/incluídas
    if (state.DUTS_SCHEDULES_FILTERED.length > 0 && state.formData.DUTAUTCFG_item?.value === 'IR') {
      dutSchedules.schedules = state.DUTS_SCHEDULES_FILTERED.map((schedule) => {
        const hasIrCode = schedule.CTRLOPER === '7_FORCED' && schedule.FORCED_BEHAVIOR === 'dut-forced-cool' && schedule.SETPOINT != null;
        return ({
          DUT_SCHEDULE_ID: schedule.DUT_SCHEDULE_ID,
          DELETE: false,
          SCHEDULE_TITLE: schedule.SCHEDULE_TITLE,
          SCHEDULE_STATUS: schedule.SCHEDULE_STATUS,
          PERMISSION: schedule.PERMISSION,
          BEGIN_TIME: schedule.BEGIN_TIME,
          END_TIME: schedule.END_TIME,
          CTRLOPER: schedule.CTRLOPER,
          DAYS: schedule.DAYS,
          SETPOINT: schedule.SETPOINT,
          LTC: schedule.LTC,
          LTI: schedule.LTI,
          UPPER_HYSTERESIS: schedule.UPPER_HYSTERESIS,
          LOWER_HYSTERESIS: schedule.LOWER_HYSTERESIS,
          SCHEDULE_START_BEHAVIOR: schedule.SCHEDULE_START_BEHAVIOR,
          SCHEDULE_END_BEHAVIOR: schedule.SCHEDULE_END_BEHAVIOR,
          FORCED_BEHAVIOR: schedule.FORCED_BEHAVIOR,
          IR_ID_COOL: hasIrCode ? state.irCommands.find((item) => item.TEMPER === schedule.SETPOINT)?.IR_ID ?? null : null,
          ACTION_MODE: schedule.ACTION_MODE,
          ACTION_TIME: schedule.ACTION_TIME,
          ACTION_POST_BEHAVIOR: schedule.ACTION_POST_BEHAVIOR,
        });
      });
    }

    // Adiciona programações deletadas
    if (state.formData.DUTAUTCFG_item?.value === 'IR') {
      state.DUTS_SCHEDULES_DELETED.forEach((deletedId) => {
        const schedule = state.DUTS_SCHEDULES.find((deleted) => deleted.DUT_SCHEDULE_ID === deletedId);
        if (schedule) {
          dutSchedules.schedules.push({
            DUT_SCHEDULE_ID: schedule.DUT_SCHEDULE_ID,
            DELETE: true,
            SCHEDULE_TITLE: schedule.SCHEDULE_TITLE,
            SCHEDULE_STATUS: schedule.SCHEDULE_STATUS,
            PERMISSION: schedule.PERMISSION,
            BEGIN_TIME: schedule.BEGIN_TIME,
            END_TIME: schedule.END_TIME,
            CTRLOPER: schedule.CTRLOPER,
            DAYS: schedule.DAYS,
            SETPOINT: schedule.SETPOINT,
            LTC: schedule.LTC,
            LTI: schedule.LTI,
            UPPER_HYSTERESIS: schedule.UPPER_HYSTERESIS,
            LOWER_HYSTERESIS: schedule.LOWER_HYSTERESIS,
            SCHEDULE_START_BEHAVIOR: schedule.SCHEDULE_START_BEHAVIOR,
            SCHEDULE_END_BEHAVIOR: schedule.SCHEDULE_END_BEHAVIOR,
            FORCED_BEHAVIOR: schedule.FORCED_BEHAVIOR,
            ACTION_MODE: schedule.ACTION_MODE,
            ACTION_TIME: schedule.ACTION_TIME,
            ACTION_POST_BEHAVIOR: schedule.ACTION_POST_BEHAVIOR,
          });
        }
      });
    }
    else {
      state.DUTS_SCHEDULES.forEach((schedule) => {
        dutSchedules.schedules.push({
          DUT_SCHEDULE_ID: schedule.DUT_SCHEDULE_ID,
          DELETE: true,
          SCHEDULE_TITLE: schedule.SCHEDULE_TITLE,
          SCHEDULE_STATUS: schedule.SCHEDULE_STATUS,
          PERMISSION: schedule.PERMISSION,
          BEGIN_TIME: schedule.BEGIN_TIME,
          END_TIME: schedule.END_TIME,
          CTRLOPER: schedule.CTRLOPER,
          DAYS: schedule.DAYS,
          SETPOINT: schedule.SETPOINT,
          LTC: schedule.LTC,
          LTI: schedule.LTI,
          UPPER_HYSTERESIS: schedule.UPPER_HYSTERESIS,
          LOWER_HYSTERESIS: schedule.LOWER_HYSTERESIS,
          SCHEDULE_START_BEHAVIOR: schedule.SCHEDULE_START_BEHAVIOR,
          SCHEDULE_END_BEHAVIOR: schedule.SCHEDULE_END_BEHAVIOR,
          FORCED_BEHAVIOR: schedule.FORCED_BEHAVIOR,
          ACTION_MODE: schedule.ACTION_MODE,
          ACTION_TIME: schedule.ACTION_TIME,
          ACTION_POST_BEHAVIOR: schedule.ACTION_POST_BEHAVIOR,
        });
      });
    }
    // #endregion Dut Schedules
  };

  const handleDutSchedWithoutMultProg = (dutData: ApiParams['/dut/set-dut-info']) => {
    dutData.CTRLOPER = '0_NO_CONTROL';
    dutData.TSETPOINT = null;
    dutData.LTCRIT = null;
    dutData.LTINF = null;
    dutData.UPPER_HYSTERESIS = null;
    dutData.LOWER_HYSTERESIS = null;
    dutData.SCHEDULE_START_BEHAVIOR = null;
    dutData.SCHEDULE_END_BEHAVIOR = null;
    dutData.FORCED_BEHAVIOR = null;
    dutData.IR_ID_COOL = null;
    dutData.ACTION_MODE = null;
    dutData.ACTION_TIME = null;
    dutData.ACTION_POST_BEHAVIOR = null;

    const scheduleAux = state.DUTS_SCHEDULES_FILTERED.filter((schedule) => schedule.PERMISSION === 'allow' && schedule.SCHEDULE_STATUS);

    if (scheduleAux != null && scheduleAux.length > 0) {
      const hasIrCode = scheduleAux[0].CTRLOPER === '7_FORCED' && scheduleAux[0].FORCED_BEHAVIOR === 'dut-forced-cool' && scheduleAux[0].SETPOINT != null;
      dutData.IR_ID_COOL = hasIrCode ? state.irCommands.find((item) => item.TEMPER === scheduleAux[0].SETPOINT)?.IR_ID ?? null : null;
      dutData.ACTION_MODE = scheduleAux[0].ACTION_MODE;
      dutData.LOWER_HYSTERESIS = scheduleAux[0].LOWER_HYSTERESIS;
      dutData.SCHEDULE_START_BEHAVIOR = scheduleAux[0].SCHEDULE_START_BEHAVIOR;
      dutData.SCHEDULE_END_BEHAVIOR = scheduleAux[0].SCHEDULE_END_BEHAVIOR;
      dutData.FORCED_BEHAVIOR = scheduleAux[0].FORCED_BEHAVIOR;
      dutData.ACTION_TIME = scheduleAux[0].ACTION_TIME;
      dutData.ACTION_POST_BEHAVIOR = scheduleAux[0].ACTION_POST_BEHAVIOR;
      dutData.CTRLOPER = scheduleAux[0].CTRLOPER ? scheduleAux[0].CTRLOPER : state.comboOpts.dutControlOperation[0].value;
      dutData.UPPER_HYSTERESIS = scheduleAux[0].UPPER_HYSTERESIS;
      dutData.TSETPOINT = scheduleAux[0].SETPOINT;
      dutData.LTCRIT = scheduleAux[0].LTC;
      dutData.LTINF = scheduleAux[0].LTI;
    }
  };

  const handleDutsExcepts = (dutData: ApiParams['/dut/set-dut-info'], dutExceptions: ApiParams['/dut/set-dut-exceptions']) => {
    // #region Dut Exceptions
    if (state.DUTS_EXCEPTIONS_FILTERED.length > 0 && dutData.USE_IR === 1) {
      dutExceptions.exceptions = state.DUTS_EXCEPTIONS_FILTERED.map((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        const hasIrCode = exception.CTRLOPER === '7_FORCED' && exception.FORCED_BEHAVIOR === 'dut-forced-cool' && exception.SETPOINT != null;
        return {
          DUT_EXCEPTION_ID: exception.DUT_EXCEPTION_ID,
          DELETE: false,
          EXCEPTION_TITLE: exception.EXCEPTION_TITLE,
          EXCEPTION_DATE: day,
          REPEAT_YEARLY: exception.REPEAT_YEARLY,
          BEGIN_TIME: exception.BEGIN_TIME,
          END_TIME: exception.END_TIME,
          PERMISSION: exception.PERMISSION,
          EXCEPTION_STATUS_ID: 1,
          CTRLOPER: exception.CTRLOPER,
          SETPOINT: exception.SETPOINT,
          LTC: exception.LTC,
          LTI: exception.LTI,
          UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
          LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
          SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
          SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
          FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
          IR_ID_COOL: hasIrCode ? state.irCommands.find((item) => item.TEMPER === exception.SETPOINT)?.IR_ID ?? null : null,
          ACTION_MODE: exception.ACTION_MODE,
          ACTION_TIME: exception.ACTION_TIME,
          ACTION_POST_BEHAVIOR: exception.ACTION_POST_BEHAVIOR,
        };
      });
    }

    if (dutData.USE_IR === 1) {
      state.DUTS_EXCEPTIONS_DELETED.forEach((deletedId) => {
        const exception = state.DUTS_EXCEPTIONS.find((deleted) => deleted.DUT_EXCEPTION_ID === deletedId);
        if (exception) {
          const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
          dutExceptions.exceptions.push({
            EXCEPTION_TITLE: exception.EXCEPTION_TITLE,
            DUT_EXCEPTION_ID: exception.DUT_EXCEPTION_ID,
            REPEAT_YEARLY: exception.REPEAT_YEARLY,
            BEGIN_TIME: exception.BEGIN_TIME,
            END_TIME: exception.END_TIME,
            LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
            SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
            SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
            FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
            ACTION_MODE: exception.ACTION_MODE,
            PERMISSION: exception.PERMISSION,
            EXCEPTION_STATUS_ID: 1,
            CTRLOPER: exception.CTRLOPER,
            SETPOINT: exception.SETPOINT,
            LTC: exception.LTC,
            LTI: exception.LTI,
            EXCEPTION_DATE: day,
            UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
            ACTION_TIME: exception.ACTION_TIME,
            ACTION_POST_BEHAVIOR: exception.ACTION_POST_BEHAVIOR,
            DELETE: true,
          });
        }
      });
    }
    else {
      state.DUTS_EXCEPTIONS.forEach((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        dutExceptions.exceptions.push({
          DELETE: true,
          DUT_EXCEPTION_ID: exception.DUT_EXCEPTION_ID,
          EXCEPTION_TITLE: exception.EXCEPTION_TITLE,
          BEGIN_TIME: exception.BEGIN_TIME,
          END_TIME: exception.END_TIME,
          PERMISSION: exception.PERMISSION,
          UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
          LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
          SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
          EXCEPTION_STATUS_ID: 1,
          CTRLOPER: exception.CTRLOPER,
          FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
          ACTION_MODE: exception.ACTION_MODE,
          ACTION_TIME: exception.ACTION_TIME,
          ACTION_POST_BEHAVIOR: exception.ACTION_POST_BEHAVIOR,
          SETPOINT: exception.SETPOINT,
          EXCEPTION_DATE: day,
          REPEAT_YEARLY: exception.REPEAT_YEARLY,
          LTC: exception.LTC,
          LTI: exception.LTI,
          SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
        });
      });
    }
    // #endregion Dut Exceptions
  };

  const handleDutsCommandsWithoutMultSchedsPart1 = (dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    const deleteDayProg = {
      permission: 'allow' as 'allow' | 'forbid',
      start: '',
      end: '',
      clearProg: true,
    };
    let scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.mon && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.mon = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.mon = deleteDayProg;
    }

    scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.tue && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.tue = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.tue = deleteDayProg;
    }

    scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.wed && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.wed = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.wed = deleteDayProg;
    }

    scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.thu && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.thu = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.thu = deleteDayProg;
    }
  };

  const handleDutsCommandsWithoutMultSchedsPart2 = (dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    const deleteDayProg = {
      permission: 'allow' as 'allow' | 'forbid',
      start: '',
      end: '',
      clearProg: true,
    };
    let scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.fri && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.fri = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.fri = deleteDayProg;
    }

    scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.sat && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.sat = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.sat = deleteDayProg;
    }

    scheduleAux = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.DAYS.sun && schedule.SCHEDULE_STATUS);
    if (scheduleAux) {
      dutProgramming.week.sun = {
        permission: scheduleAux.PERMISSION,
        start: scheduleAux.BEGIN_TIME,
        end: scheduleAux.END_TIME,
      };
    }
    else {
      dutProgramming.week.sun = deleteDayProg;
    }
  };

  const handleDutsCommandsWithoutMultScheds = (dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    handleDutsCommandsWithoutMultSchedsPart1(dutProgramming);
    handleDutsCommandsWithoutMultSchedsPart2(dutProgramming);

    state.DUTS_EXCEPTIONS_FILTERED.forEach((exception) => {
      const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
      if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
      dutProgramming.exceptions[day] = {
        permission: exception.PERMISSION,
        start: exception.BEGIN_TIME,
        end: exception.END_TIME,
      };
    });
  };

  const handleDutsCommands = (dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    // #region Dut Commands
    if (!state.NEED_MULT_SCHEDULES && state.formData.DUTAUTCFG_item?.value === 'IR') {
      handleDutsCommandsWithoutMultScheds(dutProgramming);
    }
    // Desativou automação e havia cards cadastrados; necessário limpar programação do dispositivo
    else if (state.formData.DUTAUTCFG_item?.value !== 'IR' && state.DUTS_SCHEDULES.length > 0) {
      const deleteDayProg = {
        permission: 'allow' as 'allow' | 'forbid',
        start: '',
        end: '',
        clearProg: true,
      };
      dutProgramming.week.mon = deleteDayProg;
      dutProgramming.week.tue = deleteDayProg;
      dutProgramming.week.wed = deleteDayProg;
      dutProgramming.week.thu = deleteDayProg;
      dutProgramming.week.fri = deleteDayProg;
      dutProgramming.week.sat = deleteDayProg;
      dutProgramming.week.sun = deleteDayProg;

      state.DUTS_EXCEPTIONS.forEach((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
        dutProgramming.exceptions[day] = {
          permission: exception.PERMISSION,
          start: exception.BEGIN_TIME,
          end: exception.END_TIME,
          clearProg: true,
        };
      });
    }
    state.DUTS_EXCEPTIONS_DELETED.forEach((exceptionId) => {
      const exception = state.DUTS_EXCEPTIONS.find((item) => item.DUT_EXCEPTION_ID === exceptionId);
      if (exception) {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
        dutProgramming.exceptions[day] = {
          permission: exception.PERMISSION,
          start: exception.BEGIN_TIME,
          end: exception.END_TIME,
          clearProg: true,
        };
      }
    });
    // #endregion Dut Commands
  };

  const setDutExcepts = (scheduleReference: ScheduleDut) => {
    for (const dut of state.DUTS_EXCEPTIONS) {
      if (dut.PERMISSION === 'allow') {
        dut.CTRLOPER = scheduleReference.CTRLOPER;
        dut.SCHEDULE_END_BEHAVIOR = scheduleReference.SCHEDULE_END_BEHAVIOR;
        dut.SCHEDULE_START_BEHAVIOR = scheduleReference.SCHEDULE_START_BEHAVIOR;
        dut.ACTION_MODE = scheduleReference.ACTION_MODE;
        dut.ACTION_TIME = scheduleReference.ACTION_TIME;
        dut.ACTION_POST_BEHAVIOR = scheduleReference.ACTION_POST_BEHAVIOR;
        dut.LOWER_HYSTERESIS = scheduleReference.LOWER_HYSTERESIS;
        dut.FORCED_BEHAVIOR = scheduleReference.FORCED_BEHAVIOR;
        dut.LTC = scheduleReference.LTC;
        dut.LTI = scheduleReference.LTI;
        dut.SETPOINT = scheduleReference.SETPOINT;
        dut.UPPER_HYSTERESIS = scheduleReference.UPPER_HYSTERESIS;
      }
    }
  };

  const setDutExceptsFiltered = (scheduleReference: ScheduleDut) => {
    for (const dut of state.DUTS_EXCEPTIONS_FILTERED) {
      if (dut.PERMISSION === 'allow') {
        dut.SETPOINT = scheduleReference.SETPOINT;
        dut.SCHEDULE_END_BEHAVIOR = scheduleReference.SCHEDULE_END_BEHAVIOR;
        dut.CTRLOPER = scheduleReference.CTRLOPER;
        dut.FORCED_BEHAVIOR = scheduleReference.FORCED_BEHAVIOR;
        dut.SCHEDULE_START_BEHAVIOR = scheduleReference.SCHEDULE_START_BEHAVIOR;
        dut.ACTION_MODE = scheduleReference.ACTION_MODE;
        dut.ACTION_TIME = scheduleReference.ACTION_TIME;
        dut.ACTION_POST_BEHAVIOR = scheduleReference.ACTION_POST_BEHAVIOR;
        dut.LTC = scheduleReference.LTC;
        dut.LTI = scheduleReference.LTI;
        dut.LOWER_HYSTERESIS = scheduleReference.LOWER_HYSTERESIS;
        dut.UPPER_HYSTERESIS = scheduleReference.UPPER_HYSTERESIS;
      }
    }
  };

  const handleEqualsExcepts = () => {
    // Altera configuração de exceções quando todas forem iguais e não precisar de programação múltipla
    if (!state.NEED_MULT_SCHEDULES && state.CHANGE_EXCEPTION_PARAMETERS) {
      const scheduleReference = state.DUTS_SCHEDULES_FILTERED.find((schedule) => schedule.PERMISSION === 'allow' && schedule.SCHEDULE_STATUS);
      if (scheduleReference) {
        setDutExcepts(scheduleReference);
        setDutExceptsFiltered(scheduleReference);
      }
    }
  };

  const setDutAutTimeAndConf = (dutData: ApiParams['/dut/set-dut-info']) => {
    if (state.formData.RESENDPER) {
      const resendPER: number = parseDecimalNumber(state.formData.RESENDPER)!;
      if (resendPER % 5 !== 0 || resendPER < 5) {
        toast.error(t('erroTempoReenvioDeveSerMultiplo5Minimo5'));
        return false;
      }
      dutData.RESENDPER = parseDecimalNumber(state.formData.RESENDPER)! * 60;
    } else {
      dutData.RESENDPER = null;
    }

    if (state.formData.DUTAUTCFG_item) {
      if (state.formData.DUTAUTCFG_item.value === 'IR') {
        dutData.PORTCFG = 'IR';
        dutData.USE_IR = 1;
      } else if (state.formData.DUTAUTCFG_item.value === 'RELAY') {
        dutData.PORTCFG = 'RELAY';
        dutData.USE_IR = 0;
      } else if (state.formData.DUTAUTCFG_item.value === 'DISABLED') {
        dutData.PORTCFG = 'IR';
        dutData.USE_IR = 0;
      }
    }
    return true;
  };

  const isDevicesConnecteds = () => {
    if (state.devInfo?.status !== 'ONLINE' && tabs.find((tab) => tab.title === t('automacao') && tab.isActive)) {
      toast.warn(t('erroRealizarAlteracaoParametrosDispositivoSemConexao'));
      return false;
    }
    return true;
  };

  const setDutAutEquipInfo = async (dutData: ApiParams['/dut/set-dut-info']) => {
    if (state.devInfo?.status !== 'ONLINE' && tabs.find((tab) => tab.title === t('equipamento') && tab.isActive)) {
      dutData.UPDATE_AUTOM_INFO = false;
      await apiCall('/dut/set-dut-info', dutData);

      try {
        if (dutData.PLACEMENT === 'DUO' && state.formData.SENSOR_AUTOM == null) throw new Error(t('erroT0eT1naoDefinidos'));
        if (dutData.PLACEMENT !== state.devInfo?.dut?.PLACEMENT || (dutData.PLACEMENT === 'DUO' && (state.formData.SENSOR_AUTOM ?? 0) !== state.devInfo?.dut?.SENSOR_AUTOM)) {
          await apiCall('/dut/set-temperature-sensors', { devId: state.devId, value: state.formData.SENSOR_AUTOM ?? 0, placement: dutData.PLACEMENT ?? 'AMB' });
        }
      } catch (err) {
        console.log(err);
        toast.error(t('erroSalvarConfiguracaoSensores'));
      }
      toast.success(t('sucessoSalvar'));
      setState({ isSaving: false });
      return true;
    }
    return false;
  };

  const handleDutAut = async (dutData: ApiParams['/dut/set-dut-info'], dutSchedules: ApiParams['/dut/set-dut-schedules'], dutExceptions: ApiParams['/dut/set-dut-exceptions'], dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    if (!beginDutAutValidations(dutData)) return false;

    const ans = await setDutAutEquipInfo(dutData);
    if (ans) return false;

    if (!isDevicesConnecteds()) return false;

    const conflits = await checkCardsNoConflicts();
    if (!conflits) {
      return false;
    }
    await checkNeedMultipleSchedule();

    handleDutSched(dutSchedules);

    dutData.UPDATE_AUTOM_INFO = !state.NEED_MULT_SCHEDULES || (!!state.devInfo?.dut_aut?.DUTAUT_DISABLED && state.formData.DUTAUTCFG_item?.value === 'IR');
    dutData.MCHN_BRAND = state.formData.MCHN_BRAND_item?.value;
    dutData.MCHN_MODEL = state.formData.MCHN_MODEL || null;

    // Não precisa entrar no script de Programação Múltipla, pode enviar programação normalmente
    if (!state.NEED_MULT_SCHEDULES) {
      handleDutSchedWithoutMultProg(dutData);
    }

    if (!setDutAutTimeAndConf(dutData)) return false;

    handleEqualsExcepts();

    handleDutsExcepts(dutData, dutExceptions);

    handleDutsCommands(dutProgramming);
    return true;
  };

  const sendDutAutData = async (dutData: ApiParams['/dut/set-dut-info'], dutSchedules: ApiParams['/dut/set-dut-schedules'], dutExceptions: ApiParams['/dut/set-dut-exceptions'], dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    if (!state.NEED_MULT_SCHEDULES) {
      try {
        await apiCall('/resend-dut-ir-codes', { devId: state.devId });
      }
      catch (err) {
        toast.error('Não foi possível reenviar comandos de IR do dispositivo.');
      }

      try {
        await apiCall('/dut/set-programming-v3', dutProgramming);
      } catch (err) {
        console.log(err);
        toast.error(t('erroEnviarProgramacao'));
        setState({ isSaving: false });
        return;
      }
      try {
        await apiCall('/dut/set-dut-schedules', dutSchedules);
        await apiCall('/dut/set-dut-exceptions', dutExceptions);
      } catch (err) {
        console.log(err);
        toast.error(t('erroSalvarCardsProgramacao'));
        setState({ isSaving: false });
        return;
      }
    }
    else {
      if (state.DUTS_EXCEPTIONS_DELETED && state.DUTS_EXCEPTIONS_DELETED.length > 0) {
        try {
          await apiCall('/dut/update-programming', dutProgramming);
        } catch (err) {
          console.log(err);
          toast.error(t('erroApagarExcecao'));
          setState({ isSaving: false });
          return;
        }
      }
      try {
        await apiCall('/dut/set-dut-schedules', dutSchedules);
        await apiCall('/dut/set-dut-exceptions', dutExceptions);
      } catch (err) {
        console.log(err);
        toast.error(t('erroSalvarCardsProgramacao'));
        setState({ isSaving: false });
        return;
      }
    }
    if (!state.NEED_MULT_SCHEDULES) {
      toast.success(t('sucessoSalvarProgramacao'));
    }
    else {
      toast.success(t('sucessoSalvarProgramacaoEnviadaMultiplaProgramacao'));
      setState({ isSaving: false });
      redirectToProfile();
    }
    clearArraysSchedulesExceptions();
  };

  const sendDutData = async (dutData: ApiParams['/dut/set-dut-info'], dutSchedules: ApiParams['/dut/set-dut-schedules'], dutExceptions: ApiParams['/dut/set-dut-exceptions'], dutProgramming: ApiParams['/dut/set-programming-v3']) => {
    await apiCall('/dut/set-dut-info', dutData);

    try {
      if (dutData.PLACEMENT === 'DUO' && state.formData.SENSOR_AUTOM == null) throw new Error(t('erroT0eT1naoDefinidos'));
      if (dutData.PLACEMENT !== state.devInfo?.dut?.PLACEMENT || (dutData.PLACEMENT === 'DUO' && (state.formData.SENSOR_AUTOM ?? 0) !== state.devInfo?.dut?.SENSOR_AUTOM)) {
        await apiCall('/dut/set-temperature-sensors', { devId: state.devId, value: state.formData.SENSOR_AUTOM ?? 0, placement: dutData.PLACEMENT ?? 'AMB' });
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvarConfiguracaoSensores'));
    }

    if (state.devType.isDutAut && !state.devType.isDutQA) {
      await sendDutAutData(dutData, dutSchedules, dutExceptions, dutProgramming);
    }
  };

  const saveDutInfo = async () => {
    if (!dutBeginValidations()) return;

    const dutData = formatDutData();

    await handleDutAsset();

    const dutSchedules: ApiParams['/dut/set-dut-schedules'] = {
      CLIENT_ID: valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID),
      UNIT_ID: valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID),
      DUT_ID: state.devId,
      NEED_MULT_SCHEDULES: state.NEED_MULT_SCHEDULES,
      schedules: [],
    };

    const dutExceptions: ApiParams['/dut/set-dut-exceptions'] = {
      CLIENT_ID: valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID),
      UNIT_ID: valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID),
      DUT_ID: state.devId,
      exceptions: [],
    };

    const dutProgramming: ApiParams['/dut/set-programming-v3'] = {
      dutId: state.devId,
      week: {},
      exceptions: {},
    };

    if (state.devType.isDutAut && !state.devType.isDutQA && state.filtComboOpts.groups.filter((group) => group.checked).map((group) => group.value.toString()).length) {
      const ans = await handleDutAut(dutData, dutSchedules, dutExceptions, dutProgramming);
      if (!(ans)) return;
    }

    await sendDutData(dutData, dutSchedules, dutExceptions, dutProgramming);
  };

  const handleDriConfig = (driData: ApiParams['/dri/set-dri-info']) => {
    const cfgsList = state.formData.varsConfigInput.replace(/\r/g, '\n').split('\n').map((x) => x.trim()).filter((x) => !!x);

    if (cfgsList.length > 0) {
      driData.varsList = [];
      try {
        for (let item of cfgsList) {
          if (item.endsWith(',')) item = item.substr(0, item.length - 1);
          const itemJ = JSON.parse(item);
          if (itemJ?.address?.protocol) {
            driData.varsList.push(itemJ);
          } else {
            console.log(item);
            toast.error(t('erroInterpretarConfiguracaoDri'));
            return false;
          }
        }
      } catch (err) {
        console.log(err);
        toast.error(t('erroInterpretarConfiguracaoDri'));
        return false;
      }
    }
    return true;
  };

  const saveDriInfo = async () => {
    const driData: ApiParams['/dri/set-dri-info'] = {
      DRI_ID: state.devId,
      CLIENT_ID: valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID),
      UNIT_ID: valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID),
    };
    if (profile.manageAllClients) {
      if (!handleDriConfig(driData)) return;
    }
    await apiCall('/dri/set-dri-info', driData);
  };

  async function saveDevInfo(tabs) {
    try {
      setState({ isSaving: true });
      const {
        isDac, isDam, isDut, isDutAut, isDri, isDutQA,
      } = getDevType();

      if (isDac) {
        await saveDacInfo();
      } else if (isDam) {
        await saveDamInfo();
      } else if (isDut) {
        await saveDutInfo();
      } else if (isDri) {
        await saveDriInfo();
      } else {
        toast.error(t('houveErro'));
        setState({ isSaving: false });
        return;
      }

      // TODO: se não tiver UNIT selecionada, não é para mostrar nenhum group na lista.

      getData().catch(console.log);
      if (isDutAut && !isDutQA) {
        if (!state.NEED_MULT_SCHEDULES) {
          await apiCall('/resend-dut-aut-config', { devId: state.devId })
            .then(() => {
              toast.success(t('sucessoSalvar'));
              setState({ isSaving: false });
              redirectToProfile();
            })
            .catch((err) => {
              console.log(err);
              toast.error(t('erroEnviarNovaAutomacaoDut'));
            });
        }
      } else {
        redirectToProfile();
        toast.success(t('sucessoSalvar'));
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvarAlteracoes'));
    }
    setState({ isSaving: false });
  }

  function redirectToProfile() {
    const urlBase = history.location.pathname.replace('editar', 'informacoes');
    history.push(urlBase);
  }

  function clearArraysSchedulesExceptions() {
    state.DUTS_SCHEDULES = [];
    state.DUTS_SCHEDULES_FILTERED = [];
    state.DUTS_SCHEDULES_DELETED = [];
    state.DUTS_EXCEPTIONS = [];
    state.DUTS_EXCEPTIONS_FILTERED = [];
    state.DUTS_EXCEPTIONS_DELETED = [];
  }

  function dateDiffInDays(a, b) {
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / (24 * 60 * 60 * 1000));
  }

  async function getDAMFUnom() {
    if (!(state.devInfo?.DAT_BEGAUT)) return null;
    const groupIds = state.devInfo?.dam?.groups.map((r) => r.GROUP_ID);
    if (groupIds && groupIds.length > 0) {
      // OK
    }
    else return null;
    const { list: dacsList } = await apiCall('/dac/get-dacs-list', { groupIds });
    if (dacsList.length === 0) {
      toast.warn(t('avisoNaoHaDacAssociadoMaquinaAutomatizadaDAM'));
      return null;
    }
    const dacId = dacsList[0].DAC_ID;
    const begMonDate = new Date(state.devInfo.DAT_BEGMON);
    const begAutDate = new Date(state.devInfo.DAT_BEGAUT);
    const day = begMonDate.getDate().toString().padStart(2, '0');
    const month = (begMonDate.getMonth() + 1).toString().padStart(2, '0');
    const year = begMonDate.getFullYear().toString();
    const datIni = [year, month, day].join('-');
    const numDays = dateDiffInDays(begMonDate, begAutDate);
    const { list: usageList } = await apiCall('/dac/get-usage-per-day', { dacId, datIni, numDays });
    if (usageList) {
      const usageListFiltered = usageList.filter((r) => r.hoursOn > 0);
      const totalHoursOn = usageListFiltered.reduce((acc, value) => acc + value.hoursOn, 0);
      const averageHoursOn = totalHoursOn / usageListFiltered.length;
      const fu = averageHoursOn / 24;
      if (fu < 0.1) return null;
      return Number(fu.toFixed(2));
    }
    return null;
  }

  const getDutAutConfig = (devInfo: DevFullInfo) => {
    if (devInfo.status === 'ONLINE') {
      apiCall('/request-dut-aut-config', { devId: devInfo.DEV_ID })
        .then((response) => {
          state.temperatureControlState = {
            automation: response.enabled,
            mode: response.ctrl_mode,
            temperature: response.setpoint,
            LTC: response.LTC,
          };
          render();
        })
        .catch(console.log);
    }

    apiCall('/get-dut-ircodes-list', { devId: devInfo.DEV_ID })
      .then((response) => {
        const dutIrCodes = response.list;
        state.irCommands = identifyDutIrCommands(dutIrCodes)
          .filter((command) => {
            const cmdSetpoint = Number(command?.cmdName?.split(':')[1]) || null;
            if (cmdSetpoint != null) return command;
          })
          .map((command) => (
            {
              IR_ID: command.IR_ID,
              CMD_NAME: command?.cmdName,
              CMD_TYPE: command?.CMD_TYPE,
              TEMPER: Number(command?.cmdName?.split(':')[1]),
            }
          ))
          .sort((a, _b) => {
            if (a.TYPE === 'AC_COOL') {
              return 1;
            }
            return -1;
          })
          .sort((a, b) => {
            if (a.TEMPER > b.TEMPER) {
              return 1;
            }
            return -1;
          })
          .filter((value, index, self) => index === self.findIndex((t) => (
            t.CMD_NAME === value.CMD_NAME
          )));
      });
  };

  const getTranslatedInstallationLocation = (str?: string|null) => {
    const opts = {
      'casa-de-maquina': t('casaDeMaquina'),
      'ambiente-refrigerado': t('ambienteRefrigeradoDam'),
      outros: t('outros'),
    };

    return (str && opts[str]) || null;
  };

  const fetchEndpoints = async (devInfo: DevFullInfo) => {
    const reqCombos = {
      DEVICE_CODE: devInfo.DEV_ID,
      fluids: true,
      applics: true,
      types: true,
      envs: true,
      brands: true,
      psens: true,
      ecoModeCfg: true,
      scheduleStartBehavior: true,
      dutScheduleStartBehavior: true,
      dutScheduleEndBehavior: true,
      dutForcedBehavior: true,
      damInstallationLocation: true,
      evaporatorModels: true,
    };
    await Promise.all([
      apiCall('/clients/get-clients-list', {}).then(({ list }) => {
        state.comboOpts.clients = list;
      }),
      apiCall('/get-timezones-list-with-offset', {}).then(({ list }) => {
        state.comboOpts.timezones = list.map((item) => ({ label: `${item.area} (${item.offset})`, value: item.id }));
      }),
      apiCall('/dac/get-states-list', { full: true }).then(({ list }) => {
        state.comboOpts.states = list.map((item) => ({ STATE_NAME: item.fullName, STATE_ID: item.fullName, COUNTRY_ID: item.countryId }));
      }),
      apiCall('/dac/get-cities-list', {}).then(({ list }) => {
        state.comboOpts.cities = list.map((item) => ({ CITY_NAME: item.name, CITY_ID: item.id, STATE_ID: item.stateFullName }));
      }),
      apiCall('/dac/get-countries-list', { full: true }).then(({ list }) => {
        state.comboOpts.countries = list.map((item) => ({ COUNTRY_NAME: item.name, COUNTRY_ID: item.id }));
      }),
      apiCall('/dev/dev-info-combo-options', reqCombos).then((response) => {
        response.damInstallationLocation = response.damInstallationLocation?.map((item) => ({ ...item, label: getTranslatedInstallationLocation(item.value) }));
        Object.assign(state.comboOpts, response);
      }),
      fetchUnits(devInfo.CLIENT_ID),
      fetchEnvironments(devInfo.CLIENT_ID, devInfo.UNIT_ID, devInfo),
      fetchGroups(devInfo.CLIENT_ID, devInfo.UNIT_ID),
    ]);
    render();
  };

  const setDutAutFormData = (devInfo: DevFullInfo) => {
    state.comboOpts.ecoModeCfg = state.comboOpts.ecoModeCfg.filter((x) => ['eco-V', 'eco-D'].includes(x.value));

    for (let i = state.comboOpts.dutControlOperation.length - 1; i >= 0; i--) {
      if (!devInfo.dut_aut?.COMPATIBLE_MODES.includes(state.comboOpts.dutControlOperation[i].value)) {
        state.comboOpts.dutControlOperation.splice(i, 1);
      }
    }

    for (let i = state.comboOpts.dutForcedBehavior.length - 1; i >= 0; i--) {
      if (!devInfo.dut_aut?.COMPATIBLE_MODES.includes(state.comboOpts.dutForcedBehavior[i].value)) {
        state.comboOpts.dutForcedBehavior.splice(i, 1);
      }
    }

    state.dutCompatibilityHysteresisEco2 = devInfo.dut_aut?.COMPATIBLE_MODES.includes('8_ECO_2') || false;
  };

  const valueOrEmptyString = (value) => ((value || '').toString());

  const setDamFormData = async (devInfo: DevFullInfo) => {
    state.formData.ENABLE_ECO_item = valueOrNull(state.comboOpts.optionsEco.find((item) => item.valueN === devInfo.dam!.ENABLE_ECO));
    if (devInfo.dam?.ENABLE_ECO == null) state.formData.ENABLE_ECO_item = valueOrNull(state.comboOpts.optionsEco.find((item) => item.valueN === 0));
    state.formData.ECO_CFG_item = valueOrNull(state.comboOpts.ecoModeCfg.find((item) => item.value === devInfo.dam!.ECO_CFG));
    if (state.formData.ENABLE_ECO_item?.valueN === 0) {
      state.formData.ECO_CFG_item = null;
    }
    state.formData.REL_DUT_ID_item = !devInfo.dam!.SELF_REFERENCE ? valueOrNull(state.comboOpts.duts.find((item) => item.DEV_ID === devInfo.dam!.REL_DUT_ID)) : {
      DEV_ID: devInfo.DEV_ID, UNIT_ID: devInfo.UNIT_ID, ROOM_NAME: 'Sensor Interno do DAM', RTYPE_NAME: '',
    };
    state.formData.ENABLE_ECO_local = state.comboOpts.optionsEcoLocal.find((item) => item.value === devInfo.dam!.ENABLE_ECO_LOCAL) || null;

    state.formData.DAM_PLACEMENT_item = state.comboOpts.damPlacement.find((item) => item.value === devInfo.dam!.PLACEMENT) || state.comboOpts.damPlacement.find((item) => item.value === 'RETURN');
    state.formData.T0_POSITION_DAM = valueOrNull(state.comboOpts.sensorDamDuo.find((item) => item.value === devInfo.dam!.T0_POSITION));
    state.formData.T1_POSITION_DAM = valueOrNull(state.comboOpts.sensorDamDuo.find((item) => item.value === devInfo.dam!.T1_POSITION));

    state.formData.EXT_THERM_CFG = valueOrNull(state.comboOpts.extThermCfg.find((item) => item.value === devInfo.dam?.EXT_THERM_CFG));
    state.formData.ECO_OFST_START = valueOrEmptyString(devInfo.dam?.ECO_OFST_START);
    state.formData.ECO_OFST_END = valueOrEmptyString(devInfo.dam?.ECO_OFST_END);
    state.formData.ECO_INTERVAL_TIME = valueOrEmptyString(devInfo.dam?.ECO_INT_TIME);
    state.formData.FU_NOM = (devInfo.dam?.FU_NOM == null) ? '' : String(devInfo.dam?.FU_NOM);

    state.formData.ECO_SCHEDULE_START_BEHAVIOR_item = valueOrNull(state.comboOpts.scheduleStartBehavior.find((item) => item.value === devInfo.dam!.SCHEDULE_START_BEHAVIOR));
    state.formData.ECO_INTERVAL_TIME = valueOrEmptyString(devInfo.dam?.ECO_INT_TIME);
    state.formData.ECO_SETPOINT = (devInfo.dam?.SETPOINT == null ? '21' : devInfo.dam.SETPOINT).toString();
    state.formData.ECO_LTC = valueOrEmptyString(devInfo.dam?.LTC);
    state.formData.ECO_LTI = valueOrEmptyString(devInfo.dam?.LTI);
    state.formData.ECO_UPPER_HYSTERESIS = (devInfo.dam?.UPPER_HYSTERESIS == null ? '1' : devInfo.dam.UPPER_HYSTERESIS).toString();
    state.formData.ECO_LOWER_HYSTERESIS = (devInfo.dam?.LOWER_HYSTERESIS == null ? '1' : devInfo.dam.LOWER_HYSTERESIS).toString();
    state.formData.MINIMUM_TEMPERATURE = (devInfo.dam?.MINIMUM_TEMPERATURE == null ? '20' : devInfo.dam.MINIMUM_TEMPERATURE).toString();
    state.formData.MAXIMUM_TEMPERATURE = (devInfo.dam?.MAXIMUM_TEMPERATURE == null ? '28' : devInfo.dam.MAXIMUM_TEMPERATURE).toString();
    state.formData.DAM_INSTALLATION_LOCATION_item = devInfo.dam?.INSTALLATION_LOCATION ? { label: getTranslatedInstallationLocation(devInfo.dam.INSTALLATION_LOCATION), value: devInfo.dam.INSTALLATION_LOCATION } : null; // adicionar traducao no label
    state.damFuNomCalc = await getDAMFUnom();

    const devGroups = (devInfo.dam?.groups ?? []).map((x) => x.GROUP_ID);
    for (const group of state.comboOpts.groups) {
      group.checked = devGroups.includes(group.value);
    }
  };

  const setDacL1 = (devInfo: DevFullInfo) => {
    if (devInfo.dac?.DAC_APPL === 'fancoil') {
      state.selectedL1Sim = devInfo.dac.SELECTED_L1_SIM === 'fancoil';
    }
    else {
      state.selectedL1Sim = devInfo.dac?.SELECTED_L1_SIM === 'virtual';
    }
  };

  const setDacApplication = (devInfo: DevFullInfo) => {
    const hasPsuc = !!(devInfo.dac?.P0Psuc || devInfo.dac?.P1Psuc);
    const hasPliq = !!(devInfo.dac?.P0Pliq || devInfo.dac?.P1Pliq);

    state.formData.DAC_APPL_item = state.comboOpts.applicsNew.find((item) => {
      if (item.value.DAC_APPL !== devInfo.dac!.DAC_APPL) return false;
      if (!!item.value.hasPsuc !== hasPsuc) return false;
      if (!!item.value.hasPliq !== hasPliq) return false;
      return true;
    }) || null;
    if (devInfo.dac!.DAC_APPL === 'trocador-de-calor') {
      state.formData.DAC_APPL_item = { label: t('14trocadorCalor'), value: { DAC_APPL: 'trocador-de-calor', hasPliq: false, hasPsuc: false } };
    }
  };

  const setDacSensors = (devInfo: DevFullInfo) => {
    state.formData.P0_POSITION = valueOrNull(state.comboOpts.pPositions.find((item) => item.value === devInfo.dac!.P0_POSITN));
    state.formData.P1_POSITION = valueOrNull(state.comboOpts.pPositions.find((item) => item.value === devInfo.dac!.P1_POSITN));
    state.formData.P0_SENSOR = valueOrNull(state.comboOpts.psens.find((item) => item.value === devInfo.dac!.P0_SENSOR));
    state.formData.P1_SENSOR = valueOrNull(state.comboOpts.psens.find((item) => item.value === devInfo.dac!.P1_SENSOR));

    state.formData.configTsensors = !!devInfo.dac?.T0_T1_T2;
    if (devInfo.dac?.T0_T1_T2) {
      const arr = JSON.parse(devInfo.dac.T0_T1_T2);
      state.formData.T0_POSITION = valueOrNull(state.comboOpts.tPositions.find((x) => x.value === arr[0]));
      state.formData.T1_POSITION = valueOrNull(state.comboOpts.tPositions.find((x) => x.value === arr[1]));
      state.formData.T2_POSITION = valueOrNull(state.comboOpts.tPositions.find((x) => x.value === arr[2]));
    }

    isFancoil();
  };

  const setDacFormData = async (devInfo: DevFullInfo) => {
    setDacL1(devInfo);

    state.formData.DAC_DESC = valueOrEmptyString(devInfo.dac?.DAC_DESC);
    state.formData.DAC_NAME = valueOrEmptyString(devInfo.dac?.DAC_NAME);
    state.formData.DAC_MODEL = valueOrEmptyString(devInfo.dac?.DAC_MODEL);
    state.formData.CAPACITY_PWR = valueOrEmptyString(devInfo.dac?.CAPACITY_PWR);
    state.formData.DAC_COP = valueOrEmptyString(devInfo.dac?.DAC_COP);
    state.formData.DAC_KW = valueOrEmptyString(devInfo.dac?.DAC_KW);
    state.formData.GROUP_ID_item = valueOrNull(state.comboOpts.groups.find((item) => item.value === devInfo.dac!.GROUP_ID));
    state.formData.ASSET_ID_item = valueOrNull(state.comboOpts.assets.find((item) => item.DEV_ID === devInfo.DEV_ID && item.GROUP_ID === devInfo.dac!.GROUP_ID));
    state.formData.FLUID_TYPE_item = valueOrNull(state.comboOpts.fluids.find((item) => item.value === devInfo.dac!.FLUID_TYPE));
    state.formData.DAC_TYPE_item = valueOrNull(state.comboOpts.types.find((item) => item.value === devInfo.dac!.DAC_TYPE));
    state.formData.CAPACITY_UNIT_item = valueOrNull(state.comboOpts.capacUnits.find((item) => item.value === devInfo.dac!.CAPACITY_UNIT));
    state.formData.DAC_ENV_item = valueOrNull(state.comboOpts.envs.find((item) => item.value === devInfo.dac!.DAC_ENV));
    state.formData.DAC_BRAND_item = valueOrNull(state.comboOpts.brands.find((item) => item.value === devInfo.dac!.DAC_BRAND));
    state.formData.DAC_MODIF_item = valueOrNull(state.comboOpts.yesNo.find((item) => item.value === devInfo.dac!.DAC_MODIF));
    state.formData.DAC_COMIS_item = valueOrNull(state.comboOpts.yesNo.find((item) => item.value === devInfo.dac!.DAC_COMIS));
    state.formData.REL_DUT_ID_item = valueOrNull(state.comboOpts.duts.find((item) => item.DEV_ID === devInfo.dac!.REL_DUT_ID));
    state.formData.DAC_HEAT_EXCHANGER_item = valueOrNull(state.comboOpts.heatExchangerTypes.find((item) => item.ID === devInfo.dac!.HEAT_EXCHANGER_ID));
    state.formData.COMPRESSOR_NOMINAL_CURRENT = valueOrEmptyString(devInfo.dac?.COMPRESSOR_NOMINAL_CURRENT);
    state.formData.EQUIPMENT_POWER_item = devInfo.dac?.EQUIPMENT_POWER ? { label: devInfo.dac.EQUIPMENT_POWER, value: devInfo.dac.EQUIPMENT_POWER } : null;
    state.formData.EVAPORATOR_MODEL_item = devInfo.dac?.EVAPORATOR_MODEL_ID ? { label: devInfo.dac.EQUIPMENT_POWER, value: String(devInfo.dac.EVAPORATOR_MODEL_ID) } : null;
    state.formData.INSUFFLATION_SPEED = valueOrEmptyString(devInfo.dac?.INSUFFLATION_SPEED);

    if (devInfo.dac?.DAC_COMIS == null) state.formData.DAC_COMIS_item = valueOrNull(state.comboOpts.yesNo.find((item) => item.valueN === 0));

    setDacApplication(devInfo);

    setDacSensors(devInfo);

    if (devInfo.dam) {
      state.formData.USE_RELAY_item = valueOrNull(state.comboOpts.yesNo.find((x) => x.valueNinv === devInfo.dam!.DAM_DISABLED));
      if (devInfo.dam.DAM_DISABLED == null) state.formData.USE_RELAY_item = valueOrNull(state.comboOpts.yesNo.find((item) => item.valueN === 0));
      state.persisted_USE_RELAY_item = state.formData.USE_RELAY_item;
    }
    await getOriginalInfoAssets();
  };

  const setDutAutConfig = (devInfo: DevFullInfo) => {
    let portCfg = devInfo.dut_aut?.PORTCFG;
    if (portCfg === null) portCfg = 'IR';
    let autCfg = null as null|string;
    if ((devInfo.dut_aut?.DUTAUT_DISABLED === 0) && (portCfg === 'IR')) autCfg = 'IR';
    if ((devInfo.dut_aut?.DUTAUT_DISABLED === 1) && (portCfg === 'RELAY')) autCfg = 'RELAY';
    if ((devInfo.dut_aut?.DUTAUT_DISABLED === 1) && (portCfg === 'IR')) autCfg = 'DISABLED';
    state.formData.DUTAUTCFG_item = valueOrNull(state.comboOpts.dutAutCfg.find((item) => item.value === autCfg));
  };

  const setDutFormData = async (devInfo: DevFullInfo) => {
    state.formData.PLACEMENT_item = valueOrNull(state.comboOpts.placement.find((item) => item.value === devInfo.dut!.PLACEMENT));
    state.formData.SENSOR_AUTOM = valueOrNull(devInfo.dut?.SENSOR_AUTOM) as null|0|1;
    state.formData.TEMPERATURE_OFFSET = (devInfo.dut?.TEMPERATURE_OFFSET ?? '0').toString();
    state.formData.GROUP_ID_item = valueOrNull(state.comboOpts.groups.find((item) => item.value === devInfo.GROUP_ID));
    state.formData.ASSET_ID_item = valueOrNull(state.comboOpts.assets.find((item) => item.DEV_ID === devInfo.DEV_ID && item?.GROUP_ID === devInfo?.GROUP_ID));
    if (devInfo.dut_aut) {
      state.formData.CTRLOPER_item = state.comboOpts.dutControlOperation.find((item) => item.value === devInfo.dut_aut!.CTRLOPER) || state.comboOpts.dutControlOperation[0];
      setDutAutConfig(devInfo);
    }
    if (state.formData.TEMPERATURE_OFFSET != null) {
      state.offsetChecked = true;
    }
    await getOriginalInfoAssets();
  };

  const getDutsSchedAndExcepts = (devInfo: DevFullInfo) => {
    if (state.DUTS_SCHEDULES.length === 0) {
      apiCall('/dut/get-dut-schedules', { DUT_ID: devInfo.DEV_ID, CLIENT_ID: devInfo.CLIENT_ID, UNIT_ID: devInfo.UNIT_ID })
        .then((response) => {
          state.DUTS_SCHEDULES = response.schedules;
          state.DUTS_SCHEDULES_FILTERED = state.DUTS_SCHEDULES.filter((schedule) => schedule.DUT_SCHEDULE_ID == null || !state.DUTS_SCHEDULES_DELETED.includes(schedule.DUT_SCHEDULE_ID));
          render();
        })
        .catch(console.log);
    }

    if (state.DUTS_EXCEPTIONS.length === 0) {
      apiCall('/dut/get-dut-exceptions', { DUT_ID: devInfo.DEV_ID, CLIENT_ID: devInfo.CLIENT_ID, UNIT_ID: devInfo.UNIT_ID })
        .then((response) => {
          state.DUTS_EXCEPTIONS = response.exceptions;
          state.DUTS_EXCEPTIONS_FILTERED = state.DUTS_EXCEPTIONS.filter((exception) => exception.DUT_EXCEPTION_ID == null || !state.DUTS_EXCEPTIONS_DELETED.includes(exception.DUT_EXCEPTION_ID));
          render();
        })
        .catch(console.log);
    }
  };

  const setDutAutMachine = (devInfo: DevFullInfo) => {
    state.formData.MCHN_MODEL = devInfo.dut_aut?.MCHN_MODEL ?? '';
    state.formData.MCHN_BRAND_item = state.comboOpts.brands.find((item) => item.value === devInfo.dut_aut!.MCHN_BRAND) ?? null;
    state.formData.TSETPOINT = (devInfo.dut_aut?.TSETPOINT ?? '').toString();
    state.formData.RESENDPER = (devInfo.dut_aut?.RESENDPER && (devInfo.dut_aut?.RESENDPER / 60) >= 5) ? (devInfo.dut_aut.RESENDPER / 60).toString() : '5';
    state.formData.LTCRIT = (devInfo.dut_aut?.LTCRIT ?? '').toString();
    state.formData.LTINF = (devInfo.dut_aut?.LTINF ?? '').toString();
    const devGroups = (devInfo.dut_aut?.groups ?? []).map((x) => x.GROUP_ID);
    for (const group of state.comboOpts.groups) {
      group.checked = devGroups.includes(group.value);
    }
    state.formData.TEMPERATURE_OFFSET = (devInfo.dut_aut?.TEMPERATURE_OFFSET ?? '0').toString();
    if (state.formData.TEMPERATURE_OFFSET.length > 0) {
      state.offsetChecked = true;
    }
  };

  const setFormDataDates = (devInfo: DevFullInfo) => {
    if (devInfo.DAT_BEGMON) {
      state.formData.DAT_BEGMON = new Date(devInfo.DAT_BEGMON).toLocaleString().split('T')[0].split('-').reverse().join('/');
    } else {
      state.formData.DAT_BEGMON = '';
    }
    if (devInfo.DAT_BEGAUT) {
      state.formData.DAT_BEGAUT = new Date(devInfo.DAT_BEGAUT).toLocaleString().split('T')[0].split('-').reverse().join('/');
    } else {
      state.formData.DAT_BEGAUT = '';
    }
  };

  const setFormDataValues = async (devInfo: DevFullInfo) => {
    if (state.devType.isDutAut) {
      setDutAutFormData(devInfo);
    }
    if (state.devType.isDam && state.comboOpts.ecoModeCfg.some((x) => x.value === 'eco-D')) {
      if (state.devType.isDac) {
        state.comboOpts.ecoModeCfg = state.comboOpts.ecoModeCfg.filter((x) => x.value === 'eco-D');
      }
      else {
        state.comboOpts.ecoModeCfg = state.comboOpts.ecoModeCfg.filter((x) => x.value !== 'eco-D');
      }
    }
    state.formData.CLIENT_ID_item = state.comboOpts.clients.find((item) => item.CLIENT_ID === devInfo.CLIENT_ID) ?? null;
    state.formData.UNIT_ID_item = state.comboOpts.units.find((item) => item.UNIT_ID === devInfo.UNIT_ID) ?? null;

    setFormDataDates(devInfo);

    if (devInfo.dam) {
      await setDamFormData(devInfo);
    }

    if (devInfo.dac) {
      await setDacFormData(devInfo);
    }

    if (devInfo.dut) {
      await setDutFormData(devInfo);
    }

    if (devInfo.dut_aut && !state.devType.isDutQA) {
      setDutAutMachine(devInfo);

      getDutsSchedAndExcepts(devInfo);
    }
  };

  async function getData() {
    try {
      state.devInfo = await getCachedDevInfo(state.devId, { forceFresh: true });
      const devInfo = state.devInfo!;

      state.devType = getDevType();

      if (state.devType.isDri) {
        await getDriInfo(devInfo.DEV_ID);
      }
      if (devInfo.dac) {
        wsl.start(onWsOpen, onWsMessage, beforeWsClose);
      }

      state.formData.varsConfigInput = '';
      if (devInfo.dri) {
        state.formData.varsConfigInput = devInfo.dri?.varsCfg?.varsList?.map((x) => JSON.stringify(x)).join('\n');
      }
      if (state.devType.isDutAut && state.devInfo?.dut?.operation_mode !== 5) {
        getDutAutConfig(devInfo);
      }

      if (devInfo.dac) {
        const heatExchangers = await apiCall('/heat-exchanger/get-list-v2', { CLIENT_ID: devInfo.CLIENT_ID });
        state.comboOpts.heatExchangerTypes = heatExchangers.map((e) => ({ ...e, label: e.NAME, value: e.NAME }));
        render();
      }

      // Temporario: será permitido que o novo modo seja configurável apenas para os seguintes DAMs:
      // DAM303221310, DAM303221303, DAM209211441, DAM210211471 e DAM210211473
      if (!['DAM303221310', 'DAM303221303', 'DAM209211441', 'DAM210211471', 'DAM210211473'].includes(devInfo.DEV_ID)) {
        // Remove segunda opção: 'Sim, Eco 2
        if (state.comboOpts.optionsEco.length === 3) {
          state.comboOpts.optionsEco.splice(1, 1);
        }
      }

      await fetchEndpoints(devInfo);

      await setFormDataValues(devInfo);

      await onSelectUnit(state.formData.UNIT_ID_item);
      onSelectApplication(state.formData.DAC_APPL_item);
    } catch (err) {
      console.log(err);
      alert(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getData();
    setState({ offsetChecked: false });
    render();
  }, []);

  const formatGroups = (dutsList: ApiResps['/dut/get-duts-list']['list'], dacsAutoList: ApiResps['/dacs-with-automation-enabled']['list']) => {
    const isDam = !!(state.devInfo?.dam);
    const isOnlyDutRef = !!(state.devType.isDut && state.devInfo?.dut_aut && checkIsDutRef(state.devInfo.dut_aut.groups));
    const isDutAut = !!(!isOnlyDutRef && state.devInfo?.dut_aut);

    if (isDam) {
      for (const dut of dutsList) {
        if (!dut.ROOM_NAME) { dut.ROOM_NAME = dut.DEV_ID; }
      }
      // DUTS QA não podem ser selecionados para serem referências de temperatura.
      // Atualmente, o único critério confiável que eu descobri é se o DUT tiver variáveis de umidade e CO2.
      // Isso implica que o DUT QA ainda aparecerá na lista antes de começar a publicar.
      state.comboOpts.duts = dutsList.filter((x) => !x.automationEnabled && (!x?.VARS?.includes('HD')));
      const devGroups = (state.devInfo!.dam!.groups || []).map((x) => x.GROUP_ID);
      for (const group of state.comboOpts.groups) {
        group.checked = devGroups.includes(group.value);
        group.withDacAut = dacsAutoList.some((x) => (x.GROUP_ID === group.value));
      }
    }
    if (isDutAut) {
      const devGroups = (state.devInfo!.dut_aut!.groups || []).map((x) => x.GROUP_ID);
      for (const group of state.comboOpts.groups) {
        group.checked = devGroups.includes(group.value);
      }
    }
  };

  async function getOriginalInfoAssets() {
    const { devInfo } = state;
    const asset = await apiCall('/clients/get-asset-info', { DEV_ID: devInfo?.DEV_ID });
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
        MCHN_KW: asset.info.MCHN_KW,
      };
    } else {
      state.persistedAssetDevice = null;
    }
    render();
  }

  async function fetchUnits(CLIENT_ID) {
    state.comboOpts.units = [];
    state.comboOpts.groups = [];
    state.comboOpts.duts = [];
    state.comboOpts.environments = [];
    if (!CLIENT_ID) return;

    const { devInfo } = state;
    const isDac = !!(devInfo?.dac);
    const isDam = !!(devInfo?.dam);
    const isOnlyDutRef = !!(state.devType.isDut && state.devInfo?.dut_aut && checkIsDutRef(state.devInfo.dut_aut.groups));
    const isDutAut = !!(!isOnlyDutRef && state.devInfo?.dut_aut);

    const reqCombos = { CLIENT_ID, units: true, groups: (isDac || isDam || isDutAut || state.devType.isDut) };
    try {
      const combos = await apiCall('/dev/dev-info-combo-options', reqCombos);
      let units;
      if (combos.units) {
        units = combos.units.map((unit) => ({ UNIT_ID: unit.value, UNIT_NAME: unit.label }));
      }
      Object.assign(state.comboOpts, combos, { units });
      state.comboOpts = {
        ...state.comboOpts,
        ...state.comboOpts,
      };
      state.isLoadingUnitInfo = false;
      render();
    }
    catch {
      toast.error(t('houveErro'));
      state.isLoadingUnitInfo = false;
    }
  }

  async function fetchGroups(CLIENT_ID: number, UNIT_ID: number) {
    if (!CLIENT_ID && !UNIT_ID) return;

    const isDam = !!(devInfo?.dam);

    const [
      { list: dutsList },
      { list: dacsAutoList },
    ] = await Promise.all([
      Promise.resolve().then(async () => (isDam ? apiCall('/dut/get-duts-list', { clientId: CLIENT_ID, unitId: UNIT_ID }) : ({ list: [] }))),
      Promise.resolve().then(async () => (isDam ? apiCall('/dacs-with-automation-enabled', { clientId: CLIENT_ID, unitId: UNIT_ID }) : ({ list: [] }))),
    ]);

    formatGroups(dutsList, dacsAutoList);
    state.filtComboOpts.groups = state.comboOpts.groups.filter((group) => group.unit === UNIT_ID);
    state.filtComboOpts.duts = state.comboOpts.duts.filter((dut) => dut.UNIT_ID === UNIT_ID);

    state.isLoadingUnitInfo = false;
    render();
  }

  async function fetchEnvironments(CLIENT_ID, UNIT_ID, devInfo) {
    state.comboOpts.environments = [];
    const isDut = !!(devInfo && devInfo.dut);
    setFormData({ ENVIRONMENT_ID_item: null });
    setFormData({ ROOM_NAME: '' });
    if (!isDut || !CLIENT_ID || !UNIT_ID) return;

    let environments;
    await apiCall('/environments/get-environment-list', { CLIENT_ID, UNIT_ID }).then((result) => {
      environments = result.environments.map((environment) => Object.assign(environment, {
        ENVIRONMENT_LABEL: `${environment.ENVIRONMENT_NAME}${environment.DUT_CODE ? ` - ${environment.DUT_CODE}` : ''}`,
      }));
    });

    setState({ comboOpts: { ...state.comboOpts, environments } });
    setFormData({ ENVIRONMENT_ID_item: environments.find((item) => item.ENVIRONMENT_ID === state.devInfo?.dut?.ENVIRONMENT_ID) || null });
    setFormData({ ROOM_NAME: state.formData.ENVIRONMENT_ID_item?.ENVIRONMENT_NAME ?? null });
    render();
  }

  const fancoilLabel = (position) => {
    if (position && position.label) {
      if (position.label === 'Tamb') {
        position.label = t('temperaturaExterna');
      } else if (position.label === 'Tsuc') {
        position.label = t('temperaturaEntradaAgua');
      } else if (position.label === 'Tliq') {
        position.label = t('temperaturaSaidaAgua');
      }
    }
    return position;
  };

  function isFancoil() {
    if (state.formData.DAC_APPL_item?.value?.DAC_APPL === 'fancoil') {
      state.comboOpts.tPositions = [
        { label: t('temperaturaExterna'), value: 'Tamb' },
        { label: t('temperaturaEntradaAgua'), value: 'Tsuc' },
        { label: t('temperaturaSaidaAgua'), value: 'Tliq' },
      ];

      fancoilLabel(state.formData.T0_POSITION);
      fancoilLabel(state.formData.T1_POSITION);
      fancoilLabel(state.formData.T2_POSITION);
    } else {
      state.comboOpts.tPositions = [
        { label: 'Tamb', value: 'Tamb' },
        { label: 'Tsuc', value: 'Tsuc' },
        { label: 'Tliq', value: 'Tliq' },
      ];

      if (state.devInfo?.dac?.T0_T1_T2) {
        const arr = JSON.parse(state.devInfo?.dac?.T0_T1_T2);
        state.formData.T0_POSITION = valueOrNull(state.comboOpts.tPositions.find((x) => x.value === arr[0]));
        state.formData.T1_POSITION = valueOrNull(state.comboOpts.tPositions.find((x) => x.value === arr[1]));
        state.formData.T2_POSITION = valueOrNull(state.comboOpts.tPositions.find((x) => x.value === arr[2]));
      } else {
        state.formData.T0_POSITION = state.comboOpts.tPositions[0];
        state.formData.T1_POSITION = state.comboOpts.tPositions[1];
        state.formData.T2_POSITION = state.comboOpts.tPositions[2];
      }
    }
  }

  useEffect(() => {
    isFancoil();
    render();
  }, [state.formData.DAC_APPL_item]);

  function dacApplicationTag(dacApplic: string|null): string|null {
    if (dacApplic === 'ar-condicionado') return '(ac)';
    if (dacApplic === 'camara-fria') return '(cf)';
    if (dacApplic === 'fancoil') return '(fc)';
    if (dacApplic === 'chiller') return '(ch)';
    if (dacApplic === 'trocador-de-calor') return '(he)';
    return null;
  }

  function onSelectApplication(item) {
    if (state.formData.DAC_APPL_item?.label !== item?.label) {
      setFormData({
        P0_POSITION: null,
        P0_SENSOR: null,
        P1_POSITION: null,
        P1_SENSOR: null,
      });
    }

    state.formData.DAC_APPL_item = item;
    const dacApplic = (state.formData?.DAC_APPL_item?.value.DAC_APPL) ?? null;
    const tag = dacApplicationTag(dacApplic);
    if (tag === '(he)') {
      state.formData.DAC_TYPE_item = {
        value: 'tipo-trocador-de-calor',
        label: t('trocadorCalor'),
        tags: '(he)',
      };
      state.formData.configTsensors = true;
      if ((!state.formData.T0_POSITION) && (!state.formData.T1_POSITION) && (!state.formData.T2_POSITION)) {
        state.formData.T0_POSITION = state.comboOpts.tPositions[0];
        state.formData.T1_POSITION = state.comboOpts.tPositions[1];
        state.formData.T2_POSITION = state.comboOpts.tPositions[2];
      }
      if (state.comboOpts.heatExchangerTypes.length !== 0 && !state.formData.DAC_HEAT_EXCHANGER_item) {
        state.formData.DAC_HEAT_EXCHANGER_item = state.comboOpts.heatExchangerTypes[0];
      }
    }
    if (tag) {
      state.filtComboOpts.types = state.comboOpts.types.filter((type) => type.tags === tag);
      state.filtComboOpts.envs = state.comboOpts.envs.filter((env) => env.tags === tag);
      if (state.formData.DAC_TYPE_item && state.formData.DAC_TYPE_item.tags !== tag) {
        state.formData.DAC_TYPE_item = null;
      }
      if (state.formData?.DAC_ENV_item?.tags !== tag) {
        state.formData.DAC_ENV_item = null;
      }
    } else {
      state.filtComboOpts.types = state.comboOpts.types.filter((type) => true);
      state.filtComboOpts.envs = state.comboOpts.envs.filter((env) => true);
    }
    isFancoil();
    render();
  }

  const changeDacPropertiesByMachine = () => {
    const selectedMachine = state.machinesAssetsList?.find((item) => item.GROUP_ID === state.formData.GROUP_ID_item?.value);

    const hasPsuc = !!(state.devInfo?.dac?.P0Psuc || state.devInfo?.dac?.P1Psuc);
    const hasPliq = !!(state.devInfo!.dac!.P0Pliq || state.devInfo?.dac?.P1Pliq);
    state.formData.DAC_APPL_item = state.comboOpts.applicsNew.find((item) => {
      if (item.value.DAC_APPL !== selectedMachine!.MCHN_APPL) return false;
      if (!!item.value.hasPsuc !== hasPsuc) return false;
      if (!!item.value.hasPliq !== hasPliq) return false;
      return true;
    }) || null;
    state.formData.FLUID_TYPE_item = state.comboOpts.fluids.find((item) => item.value === selectedMachine!.FLUID_TYPE) || null;
    state.formData.DAC_TYPE_item = state.comboOpts.types.find((item) => item.value === selectedMachine!.GROUP_TYPE) || null;
    state.formData.DAC_BRAND_item = state.comboOpts.brands.find((item) => item.value === selectedMachine!.BRAND) || null;
  };

  function changePropertiesByMachine() {
    if (!state.formData.GROUP_ID_item || !state.machinesAssetsList || !state.devInfo) return;

    if (state.formData.GROUP_ID_item.value !== state.formData.ASSET_ID_item?.GROUP_ID) {
      state.formData.ASSET_ID_item = null;
    }
    const selectedMachine = state.machinesAssetsList.find((item) => item.GROUP_ID === state.formData.GROUP_ID_item?.value);

    if (!selectedMachine) return;

    if (state.devType.isDac) {
      changeDacPropertiesByMachine();
    }
  }

  function changePropertiesByAsset() {
    if (!state.formData.ASSET_ID_item || !state.machinesAssetsList || !state.devInfo) return;
    const selectedAsset = state.machinesAssetsList.find((item) => item.GROUP_ID === state.formData.GROUP_ID_item?.value)?.assets.find((item) => item.ASSET_ID === state.formData.ASSET_ID_item?.value);

    if (!selectedAsset) return;
    if (state.devType.isDac) {
      state.formData.CAPACITY_PWR = (selectedAsset.CAPACITY_PWR && String(selectedAsset.CAPACITY_PWR)) || '';
      state.formData.CAPACITY_UNIT_item = state.comboOpts.capacUnits.find((item) => item.value === selectedAsset.CAPACITY_UNIT) || null;
      state.formData.DAC_KW = (selectedAsset.MCHN_KW && String(selectedAsset.MCHN_KW)) || '';
      state.formData.DAC_MODEL = selectedAsset.MCHN_MODEL ?? '';
      state.formData.DAC_NAME = selectedAsset.AST_DESC ?? '';
    }
  }

  const setAsset = () => {
    if (state.devType.isDac) {
      state.formData.ASSET_ID_item = state.comboOpts.assets.find((item) => item.DEV_ID === state.devInfo?.DEV_ID && item?.GROUP_ID === state.devInfo?.dac?.GROUP_ID) || null;
    }
    if (state.devType.isDut) {
      state.formData.ASSET_ID_item = state.comboOpts.assets.find((item) => item.DEV_ID === state.devInfo?.DEV_ID && item?.GROUP_ID === state.devInfo?.GROUP_ID) || null;
    }
  };

  const filterByUnitId = async (unitId: number, item) => {
    state.filtComboOpts.groups = state.comboOpts.groups.filter((group) => group.unit === unitId);
    state.filtComboOpts.duts = state.comboOpts.duts.filter((dut) => dut.UNIT_ID === unitId);
    if (!state.formData.ASSET_ID_item || unitId !== state.formData.ASSET_ID_item.UNIT_ID) {
      state.formData.ASSET_ID_item = null;
      state.isLoadingUnitInfo = true;
      render();
      const machinesAssetsList = await (state.devType.isDam || state.devType.isDac || state.devType.isDut ? apiCall('/clients/get-machines-list', { unitIds: [item.value || item.UNIT_ID] }) : []);
      const assets = [] as { value: number, label: string, UNIT_ID: number, GROUP_ID: number, DEV_ID: string|null, ASSET_ROLE: number, CLIENT_ID: number, DAT_INDEX: number|null, DAT_ID: string|null }[];
      for (const item of machinesAssetsList) {
        item.assets.forEach((asset) => {
          assets.push({
            value: asset.ASSET_ID,
            label: asset.AST_DESC,
            UNIT_ID: asset.UNIT_ID,
            GROUP_ID: item.GROUP_ID,
            DEV_ID: asset.DEV_ID,
            ASSET_ROLE: asset.AST_ROLE || 0,
            CLIENT_ID: state.formData.CLIENT_ID_item?.CLIENT_ID as number,
            DAT_INDEX: asset.DAT_INDEX,
            DAT_ID: asset.DAT_ID,
          });
        });
      }
      setState({
        comboOpts: {
          ...state.comboOpts,
          assets,
        },
      });
      setAsset();
      state.machinesAssetsList = machinesAssetsList;
      state.isLoadingUnitInfo = false;
      render();
    }
  };

  const valueOrNull = (value) => (value ?? null);

  async function fetchGroupByUnit(clientId: number, unitId: number) {
    const { devInfo } = state;
    if (unitId !== devInfo?.UNIT_ID) {
      await fetchGroups(clientId, unitId);
    }
  }

  async function onSelectUnit(item) {
    const { devInfo } = state;
    const isDac = !!(devInfo?.dac);
    state.formData.UNIT_ID_item = item && state.comboOpts.units.find((x) => (x.UNIT_ID === item.value || x.UNIT_ID === item.UNIT_ID)) || null;
    const unitId = valueOrNull(state.formData.UNIT_ID_item?.UNIT_ID);
    const clientId = valueOrNull(state.formData.CLIENT_ID_item?.CLIENT_ID);
    if (unitId) {
      await fetchGroupByUnit(clientId, unitId);
      await filterByUnitId(unitId, item);
    } else {
      if (isDac || state.devType.isDut) {
        state.filtComboOpts.groups = state.comboOpts.groups.filter((group) => true);
      } else {
        state.filtComboOpts.groups = [];
      }
      state.filtComboOpts.duts = [];
    }
    if (devInfo?.DEV_ID.startsWith('DAM3') && devInfo.dam?.CAN_SELF_REFERENCE) {
      state.filtComboOpts.duts.push({ DEV_ID: devInfo.DEV_ID, UNIT_ID: devInfo.UNIT_ID, ROOM_NAME: 'Sensor Interno do DAM' });
    }
    if (state.formData.GROUP_ID_item && state.formData.GROUP_ID_item.unit !== unitId) {
      state.formData.GROUP_ID_item = null;
      state.formData.ASSET_ID_item = null;
    }
    if (state.formData.REL_DUT_ID_item && state.formData.REL_DUT_ID_item.UNIT_ID !== unitId) {
      state.formData.REL_DUT_ID_item = null;
    }
    await fetchEnvironments(state.formData.CLIENT_ID_item?.CLIENT_ID, state.formData.UNIT_ID_item?.UNIT_ID, devInfo);
    render();
  }

  async function onSelectClient(item) {
    try {
      state.formData.CLIENT_ID_item = item ? { NAME: item.name, CLIENT_ID: item.value } : null;
      render();
      await fetchUnits(item?.value);
      onSelectUnit(state.formData.UNIT_ID_item);
      fetchEnvironments(item?.value, state.formData.UNIT_ID_item?.UNIT_ID, devInfo);
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  async function afterCreateUnit({ item: response }) {
    try {
      const clientId = (state.formData?.CLIENT_ID_item?.CLIENT_ID) ?? null;
      await fetchUnits(clientId);
      state.formData.UNIT_ID_item = state.comboOpts.units.find((item) => item.UNIT_ID === response.UNIT_ID) ?? null;
      onSelectUnit(state.formData.UNIT_ID_item);
      fetchEnvironments(clientId, state.formData.UNIT_ID_item?.UNIT_ID, state.devInfo);
      toast.success(t('sucessoUnidadeAdicionada'));
      setState({ openModal: null });
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }
  async function afterCreateGroup({ item: response }) {
    try {
      const { devInfo } = state;
      const isDac = !!(devInfo && devInfo.dac);
      const isDam = !!(devInfo && devInfo.dam);

      const clientId = (state.formData?.CLIENT_ID_item?.CLIENT_ID) ?? null;
      await fetchUnits(clientId);
      const groupItem = state.comboOpts.groups.find((item) => item.value === response.GROUP_ID) ?? null;
      if (isDac || state.devType.isDut) {
        state.formData.GROUP_ID_item = groupItem;
      }
      if (isDam) {
        if (groupItem) groupItem.checked = true;
      }
      if (groupItem) {
        state.formData.UNIT_ID_item = state.comboOpts.units.find((item) => item.UNIT_ID === groupItem.unit) || null;
      }
      onSelectUnit(state.formData.UNIT_ID_item);
      fetchEnvironments(clientId, state.formData.UNIT_ID_item?.UNIT_ID, devInfo);
      toast.success(t('sucessoAdicionarGrupo'));
      setState({ openModal: null });
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  function onTconfigClick() {
    state.formData.configTsensors = !state.formData.configTsensors;
    if (state.formData.configTsensors) {
      if ((!state.formData.T0_POSITION) && (!state.formData.T1_POSITION) && (!state.formData.T2_POSITION)) {
        state.formData.T0_POSITION = state.comboOpts.tPositions[0];
        state.formData.T1_POSITION = state.comboOpts.tPositions[1];
        state.formData.T2_POSITION = state.comboOpts.tPositions[2];
      }
    }
    isFancoil();
    render();
  }

  function changeSelectedL1Sim() {
    setState({ selectedL1Sim: !state.selectedL1Sim });
  }

  async function getDriInfo(driId: string) {
    const response = await apiCall('/get-integration-info', { supplier: 'diel', integrId: driId });
    state.driInfo = response;
    const cardsCfg = (response.cardsCfg && jsonTryParse<CardsCfg>(response.cardsCfg)) || null;
    state.cards = (cardsCfg && cardsCfg.cards) || [];
    state.subcards = (cardsCfg && cardsCfg.subcards) || [];
    state.relevances = (cardsCfg && cardsCfg.relevances) || [];
    render();
  }

  function getMinimumInterval(ecoCfg: string) {
    return ['eco-C1-V', 'eco-C2-V'].includes(ecoCfg) ? 5 : 0;
  }

  let { devInfo } = state;
  function getDevType() {
    const isOnlyDutRef = !!(state.devType.isDut && state.devInfo?.dut_aut && checkIsDutRef(state.devInfo.dut_aut.groups));
    const isDutAut = !!(!isOnlyDutRef && state.devInfo?.dut_aut);
    return {
      isDac: !!(state.devInfo?.dac),
      isDam: !!(state.devInfo?.dam),
      isDut: !!(state.devInfo?.dut),
      isDutAut,
      isOnlyDutRef,
      isDri: !!(state.devInfo?.dri),
      isDal: !!(state.devInfo?.dal),
      isDmt: !!(state.devInfo?.dmt),
      dutAutEnabled: (isDutAut && state.formData.DUTAUTCFG_item && (state.formData.DUTAUTCFG_item.value === 'IR')),
      isDutQA: (state.devType.isDut && state.devInfo?.dut?.operation_mode === 5) || false,
    };
  }

  function setFormData(obj) {
    state.automationTabHasBeenSelected = queryPars.aba === 'automacao';
    if (obj.hasOwnProperty('RESENDPER')) {
      if (obj.RESENDPER && (obj.RESENDPER % 5 !== 0 || obj.RESENDPER < 5)) {
        setResendTimeError(t('insiraValorMultiplo5Minimo5'));
      } else {
        setResendTimeError('');
      }
    }
    // Regra temporária caso seja configurado DAM em tela que não tem o SETPOINT ainda (ex programação múltipla da unidade)
    else if (obj.hasOwnProperty('REL_DUT_ID_item') && state.devInfo && state.devInfo.DEV_ID.startsWith('DAM3') && state.devInfo.dam?.CAN_SELF_REFERENCE && obj.REL_DUT_ID_item.length > 0) {
      const needCalculateSetpoint = !obj.REL_DUT_ID_item.DEV_ID?.startsWith('DAM3') && state.formData.ECO_SETPOINT.length === 0 && obj.REL_DUT_ID_item.TUSEMIN;
      if (needCalculateSetpoint) {
        setSetpointByRoom(obj.REL_DUT_ID_item.TUSEMIN);
      }
    }
    else if (obj.hasOwnProperty('SENSOR_AUTOM')) {
      toast.warn(t('mudancaSensorDutDuo'));
    }
    Object.assign(state.formData, obj);

    devInfo = state.devInfo;
    setState({ devType: getDevType() });
    render();
  }

  function setSetpointByRoom(tusemin: number) {
    state.formData.ECO_SETPOINT = (state.devInfo!.dam!.ECO_OFST_START + tusemin).toString();
  }

  function editSchedule(cardPosition: number) {
    state.selectedSchedule = state.DUTS_SCHEDULES_FILTERED[cardPosition];
    state.selectedIndexSchedule = cardPosition;
    state.openModal = 'add-edit-schedule';

    render();
  }

  function saveSchedule(schedule: ScheduleDut, cardPosition: number|null) {
    if (cardPosition != null) {
      state.DUTS_SCHEDULES_FILTERED[cardPosition] = schedule;
    }
    else {
      state.DUTS_SCHEDULES_FILTERED.push(schedule);
    }
    render();
  }

  function deleteSchedule(scheduleId: number|null, cardPosition: number) {
    if (scheduleId != null) {
      state.DUTS_SCHEDULES_DELETED.push(scheduleId);
      state.DUTS_SCHEDULES_FILTERED = state.DUTS_SCHEDULES_FILTERED.filter((schedule) => schedule.DUT_SCHEDULE_ID == null || !state.DUTS_SCHEDULES_DELETED.includes(schedule.DUT_SCHEDULE_ID));
    }
    else {
      state.DUTS_SCHEDULES_FILTERED = state.DUTS_SCHEDULES_FILTERED.filter((_schedule, index) => index !== cardPosition);
    }

    render();
  }

  function editException(cardPosition: number) {
    state.selectedException = state.DUTS_EXCEPTIONS_FILTERED[cardPosition];
    state.selectedIndexException = cardPosition;
    state.openModal = 'add-edit-exception';

    render();
  }

  function saveException(exception: ExceptionDut, cardPosition: number|null) {
    if (cardPosition != null) {
      state.DUTS_EXCEPTIONS_FILTERED[cardPosition] = exception;
    }
    else {
      state.DUTS_EXCEPTIONS_FILTERED.push(exception);
    }
    render();
  }

  function deleteException(exceptionId: number|null, cardPosition: number) {
    if (exceptionId != null) {
      state.DUTS_EXCEPTIONS_DELETED.push(exceptionId);
      state.DUTS_EXCEPTIONS_FILTERED = state.DUTS_EXCEPTIONS_FILTERED.filter((exception) => exception.DUT_EXCEPTION_ID == null || !state.DUTS_EXCEPTIONS_DELETED.includes(exception.DUT_EXCEPTION_ID));
    }
    else {
      state.DUTS_EXCEPTIONS_FILTERED = state.DUTS_EXCEPTIONS_FILTERED.filter((_schedule, index) => index !== cardPosition);
    }

    render();
  }

  async function checkCardsNoConflicts() {
    let index = 0;
    for (const schedule of state.DUTS_SCHEDULES_FILTERED) {
      for (let i = index + 1; i < state.DUTS_SCHEDULES_FILTERED.length; i++) {
        const scheduleCompare = state.DUTS_SCHEDULES_FILTERED[i];
        const bothSchedulesActives = schedule.SCHEDULE_STATUS && scheduleCompare.SCHEDULE_STATUS;
        if (checkWeekDayCommun(schedule, scheduleCompare) && bothSchedulesActives) {
          let conflict = schedule.BEGIN_TIME >= scheduleCompare.BEGIN_TIME && schedule.BEGIN_TIME < state.DUTS_SCHEDULES_FILTERED[i].END_TIME;
          conflict = conflict || (schedule.END_TIME >= scheduleCompare.BEGIN_TIME && schedule.END_TIME < scheduleCompare.END_TIME);
          conflict = conflict || (scheduleCompare.BEGIN_TIME >= schedule.BEGIN_TIME && scheduleCompare.BEGIN_TIME < schedule.END_TIME);
          conflict = conflict || (scheduleCompare.END_TIME >= schedule.BEGIN_TIME && scheduleCompare.END_TIME < schedule.END_TIME);
          if (conflict) {
            const msgError = t('erroSalvarProgramacoesHorarias', {
              value1: schedule.SCHEDULE_TITLE,
              value2: scheduleCompare.SCHEDULE_TITLE,
            });
            toast.error(msgError);
            return false;
          }
        }
      }
      index++;
    }
    return true;
  }

  async function checkNeedMultipleSchedule() {
    let index = 0;
    checkExceptionsHasSameProperties();
    if (state.formData.DUTAUTCFG_item?.value !== 'IR') {
      state.NEED_MULT_SCHEDULES = false;
      return;
    }

    for (const schedule of state.DUTS_SCHEDULES_FILTERED) {
      if (schedule.SCHEDULE_STATUS) {
        compareWithAllOthersSchedules(index, schedule);
        if (state.NEED_MULT_SCHEDULES) {
          return;
        }

        if (schedule.SCHEDULE_STATUS && !state.CHANGE_EXCEPTION_PARAMETERS && checkScheduleAndExceptions(schedule)) {
          state.NEED_MULT_SCHEDULES = true;
          return;
        }
      }
      index++;
    }
    state.NEED_MULT_SCHEDULES = false;
  }

  function compareWithAllOthersSchedules(index: number, schedule: ScheduleDut) {
    for (let i = index + 1; i < state.DUTS_SCHEDULES_FILTERED.length; i++) {
      const scheduleCompare = state.DUTS_SCHEDULES_FILTERED[i];
      if (!scheduleCompare.SCHEDULE_STATUS) continue;
      const bothSchedulesAllow = schedule.PERMISSION === 'allow' && scheduleCompare.PERMISSION === 'allow';
      if (checkWeekDayCommun(schedule, scheduleCompare)) {
        state.NEED_MULT_SCHEDULES = true;
        return;
      }
      if (!checkWeekDayCommun(schedule, scheduleCompare) && bothSchedulesAllow && checkSchedulesConfigurationDifferent(schedule, scheduleCompare)) {
        state.NEED_MULT_SCHEDULES = true;
        return;
      }
    }
  }

  function checkExceptionsHasSameProperties() {
    // Encontra uma exceção que não seja desligar
    const exceptionToCompare = state.DUTS_EXCEPTIONS_FILTERED.find((exception) => exception.PERMISSION === 'allow');
    if (exceptionToCompare) {
      for (const exception of state.DUTS_EXCEPTIONS_FILTERED) {
        if (exception.PERMISSION === 'allow') {
          if (checkSchedulesConfigurationDifferent(exceptionToCompare, exception)) {
            return false;
          }
        }
      }
      state.CHANGE_EXCEPTION_PARAMETERS = true;
      return true;
    }
    return false;
  }

  function checkScheduleAndExceptions(schedule: ScheduleDut) {
    for (const exception of state.DUTS_EXCEPTIONS_FILTERED) {
      const bothSchedulesAllow = schedule.PERMISSION === 'allow' && exception.PERMISSION === 'allow';
      const exceptionAsScheduleConfig = {
        SCHEDULE_TITLE: exception.EXCEPTION_TITLE,
        SCHEDULE_STATUS: true,
        BEGIN_TIME: exception.BEGIN_TIME,
        END_TIME: exception.END_TIME,
        CTRLOPER: exception.CTRLOPER,
        PERMISSION: exception.PERMISSION,
        DAYS: {
          mon: true,
          tue: true,
          wed: true,
          thu: true,
          fri: true,
          sat: true,
          sun: true,
        },
        SETPOINT: exception.SETPOINT,
        LTC: exception.LTC,
        LTI: exception.LTI,
        UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
        LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
        SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_START_BEHAVIOR,
        SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
        FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
      } as ScheduleDut;
      if (bothSchedulesAllow && checkSchedulesConfigurationDifferent(schedule, exceptionAsScheduleConfig)) {
        return true;
      }
    }
    return false;
  }

  function checkWeekDayCommun(schedule1: ScheduleDut, schedule2: ScheduleDut) {
    let result = schedule1.DAYS.mon && schedule2.DAYS.mon;
    result = result || (schedule1.DAYS.tue && schedule2.DAYS.tue);
    result = result || (schedule1.DAYS.wed && schedule2.DAYS.wed);
    result = result || (schedule1.DAYS.thu && schedule2.DAYS.thu);
    result = result || (schedule1.DAYS.fri && schedule2.DAYS.fri);
    result = result || (schedule1.DAYS.sat && schedule2.DAYS.sat);
    result = result || (schedule1.DAYS.sun && schedule2.DAYS.sun);

    return result;
  }

  function getModificationsSobDemanda(schedule1: ScheduleDut|ExceptionDut, schedule2: ScheduleDut|ExceptionDut) {
    const hasActionMode = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['2_SOB_DEMANDA'].includes(schedule1.CTRLOPER) : false;
    const hasActionTime = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['2_SOB_DEMANDA'].includes(schedule1.CTRLOPER) : false;
    const hasActionPostBehavior = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['2_SOB_DEMANDA'].includes(schedule1.CTRLOPER) : false;
    return {
      hasActionMode,
      hasActionTime,
      hasActionPostBehavior,
    };
  }

  function getModifications(schedule1: ScheduleDut|ExceptionDut, schedule2: ScheduleDut|ExceptionDut) {
    const hasSetPoint = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && (['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(schedule1.CTRLOPER) || schedule1.CTRLOPER === '7_FORCED' && schedule1.FORCED_BEHAVIOR === 'dut-forced-cool') : false;
    const hasLtc = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(schedule1.CTRLOPER) : false;
    const hasLti = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(schedule1.CTRLOPER) : false;
    const hasForcedOptions = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['7_FORCED'].includes(schedule1.CTRLOPER) : false;
    const hasEco2Options = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['8_ECO_2'].includes(schedule1.CTRLOPER) : false;
    return {
      hasSetPoint,
      hasLtc,
      hasLti,
      hasForcedOptions,
      hasEco2Options,
    };
  }

  function configResultSobDemanda(resultInitial: boolean, schedule1: ScheduleDut|ExceptionDut, schedule2: ScheduleDut|ExceptionDut, hasActionMode: boolean, hasActionTime: boolean, hasActionPostBehavior: boolean, hasForcedOptions: boolean) {
    let result = resultInitial;
    result = result || (hasForcedOptions && schedule1.FORCED_BEHAVIOR !== schedule2.FORCED_BEHAVIOR);
    result = result || (hasActionMode && schedule1.ACTION_MODE !== schedule2.ACTION_MODE);
    result = result || (hasActionTime && schedule1.ACTION_TIME !== schedule2.ACTION_TIME);
    result = result || (hasActionPostBehavior && schedule1.ACTION_POST_BEHAVIOR !== schedule2.ACTION_POST_BEHAVIOR);
    return result;
  }

  function checkSchedulesConfigurationDifferent(schedule1: ScheduleDut|ExceptionDut, schedule2: ScheduleDut|ExceptionDut) {
    const {
      hasSetPoint,
      hasLtc,
      hasLti,
      hasEco2Options,
      hasForcedOptions,
    } = getModifications(schedule1, schedule2);
    const {
      hasActionMode,
      hasActionPostBehavior,
      hasActionTime,
    } = getModificationsSobDemanda(schedule1, schedule2);

    let result = schedule1.CTRLOPER !== schedule2.CTRLOPER;

    result = result || (hasSetPoint && schedule1.SETPOINT !== schedule2.SETPOINT);
    result = result || (hasLtc && schedule1.LTC !== schedule2.LTC);
    result = result || (hasLti && schedule1.LTI !== schedule2.LTI);
    result = result || (hasEco2Options && schedule1.UPPER_HYSTERESIS !== schedule2.UPPER_HYSTERESIS);
    result = result || (hasEco2Options && schedule1.LOWER_HYSTERESIS !== schedule2.LOWER_HYSTERESIS);
    result = result || (hasEco2Options && schedule1.SCHEDULE_START_BEHAVIOR !== schedule2.SCHEDULE_START_BEHAVIOR);
    result = result || (hasEco2Options && schedule1.SCHEDULE_END_BEHAVIOR !== schedule2.SCHEDULE_END_BEHAVIOR);
    result = configResultSobDemanda(result, schedule1, schedule2, hasActionMode, hasActionTime, hasActionPostBehavior, hasForcedOptions);

    return result;
  }

  let permissionProfile = (state.devInfo && state.devInfo.CLIENT_ID
    ? profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === state.devInfo?.CLIENT_ID)
    : false) || profile.manageAllClients;

  if (permissionProfile === false || permissionProfile === undefined) {
    permissionProfile = !!profile.adminClientProg?.UNIT_MANAGE.some((item) => item === state.devInfo?.UNIT_ID);
  }
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  state.assetLayout = linkBase.includes('/ativo');
  const allTabs = [
    {
      title: t('equipamento'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'equipamento' })}`,
      isActive: (queryPars.aba === 'equipamento') || (!queryPars.aba),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('automacao'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'automacao' })}`,
      isActive: (queryPars.aba === 'automacao'),
      visible: (permissionProfile && (state.devType.isDam || state.devType.isDutAut)),
      ref: useRef(null),
    },
    {
      title: 'DRI',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'dri' })}`,
      isActive: (queryPars.aba === 'dri'),
      visible: (profile.manageAllClients && state.devType.isDri),
      ref: useRef(null),
    },
  ];
  const tabs = allTabs;

  function increaseDecreaseIntervalTime(value: string) {
    setFormData({ ECO_INTERVAL_TIME: value });
  }

  function increaseDecreaseSetpoint(value: string) {
    setFormData({ ECO_SETPOINT: value });
  }

  function increaseDecreaseUpperHysterese(value: string) {
    setFormData({ ECO_UPPER_HYSTERESIS: value });
  }

  function increaseDecreaseLowerHysterese(value: string) {
    setFormData({ ECO_LOWER_HYSTERESIS: value });
  }

  function increaseDecreaseMinimumTemperature(value: string) {
    setFormData({ MINIMUM_TEMPERATURE: value });
  }

  function increaseDecreaseMaximumTemperature(value: string) {
    setFormData({ MAXIMUM_TEMPERATURE: value });
  }

  function renderModal(devInfo) {
    return (state.openModal != null) && (
      <ModalWindow
        style={{ padding: state.openModal === 'add-edit-schedule' || state.openModal === 'add-edit-exception' ? '0' : '20px', overflowX: 'hidden' }}
        onClickOutside={() => setState({ openModal: null })}
        id="schedule-modal"
      >
        {state.openModal === 'add-unit'
          && (
          <FormEditUnit
            clientId={devInfo.CLIENT_ID}
            timezones={state.comboOpts.timezones}
            states={state.comboOpts.states}
            cities={state.comboOpts.cities}
            countries={state.comboOpts.countries}
            onCancel={() => setState({ openModal: null })}
            onSuccess={afterCreateUnit}
          />
          )}
        {state.openModal === 'add-group'
          && (
          <FormEditGroup
            unitInfo={state.formData.UNIT_ID_item || undefined}
            unitsList={(!state.formData.UNIT_ID_item) && state.comboOpts.units || undefined}
            clientId={devInfo.CLIENT_ID}
            onCancel={() => setState({ openModal: null })}
            onSuccess={afterCreateGroup}
          />
          )}
        {state.openModal === 'add-edit-schedule'
          && (
          <ScheduleEditCard
            devId={state.devId}
            cardIndex={state.selectedIndexSchedule}
            schedule={state.selectedSchedule}
            dutControlOperation={state.comboOpts.dutControlOperation}
            dutScheduleStartBehavior={state.comboOpts.dutScheduleStartBehavior}
            dutCompatibilityHysteresisEco2={state.dutCompatibilityHysteresisEco2}
            dutScheduleEndBehavior={state.comboOpts.dutScheduleEndBehavior}
            dutForcedBehavior={state.comboOpts.dutForcedBehavior}
            irCommands={state.irCommands}
            onHandleSave={saveSchedule}
            onHandleCancel={() => { setState({ openModal: null }); }}
          />
          )}
        {state.openModal === 'add-edit-exception'
          && (
          <ExceptionEditCard
            devId={state.devId}
            cardIndex={state.selectedIndexException}
            exception={state.selectedException}
            dutControlOperation={state.comboOpts.dutControlOperation}
            dutScheduleStartBehavior={state.comboOpts.dutScheduleStartBehavior}
            dutCompatibilityHysteresisEco2={state.dutCompatibilityHysteresisEco2}
            dutScheduleEndBehavior={state.comboOpts.dutScheduleEndBehavior}
            dutForcedBehavior={state.comboOpts.dutForcedBehavior}
            irCommands={state.irCommands}
            onHandleSave={saveException}
            onHandleCancel={() => { setState({ openModal: null }); }}
          />
          )}
      </ModalWindow>
    );
  }

  if (state.devType.isDal || state.devType.isDmt) {
    return (
      <>
        <Helmet>
          <title>{generateNameFormatted(state.devId, t('editar'))}</title>
        </Helmet>
        <DevLayout devInfo={devInfo} />
        {state.isLoading && (
          <div style={{ marginTop: '50px' }}>
            <Loader variant="primary" />
          </div>
        )}
        <div style={{ marginTop: '30px' }} />
        {(!state.isLoading) && devInfo && (
          <NewCard>
            <>
              {state.devType.isDal && <EditDalInfo dalInfo={devInfo} />}
              {state.devType.isDmt && <EditDmtInfo dmtInfo={devInfo} />}
            </>
          </NewCard>
        )}
      </>
    );
  }

  const dutDuoFancoil = () => {
    if (devInfo?.dut?.APPLICATION === 'fancoil') {
      state.comboOpts.sensorAutom = [t('temperaturaSaidaAgua'), t('temperaturaEntradaAgua')];
    }
  };

  function renderDutDuoEquipFields() {
    dutDuoFancoil();
    const t1_index = state.formData.SENSOR_AUTOM === 0 ? 1 : 0;
    const t1 = state.formData.SENSOR_AUTOM != null ? state.comboOpts.sensorAutom[t1_index] : null;
    return (state.formData.PLACEMENT_item?.value === 'DUO' && (
      <Flex>
        <CustomSelect
          style={{ width: '130px', minWidth: 'fit-content', marginRight: '20px' }}
          options={state.comboOpts.sensorAutom}
          value={state.formData.SENSOR_AUTOM != null ? state.comboOpts.sensorAutom[state.formData.SENSOR_AUTOM] : null}
          placeholder="T0"
          onSelect={(item) => setFormData({ SENSOR_AUTOM: item === t('retorno') ? 0 : 1 })}
          notNull
        />
        <CustomSelect
          style={{ width: '130px', minWidth: 'fit-content' }}
          options={state.comboOpts.sensorAutom}
          value={t1}
          placeholder="T1"
          onSelect={(item) => setFormData({ SENSOR_AUTOM: item === t('retorno') ? 1 : 0 })}
          notNull
        />
      </Flex>
    ));
  }

  function renderDutEquipFields() {
    return (
      <>
        {(state.devType.isDut && state.devInfo?.dut?.APPLICATION !== 'fancoil') && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <CustomSelect
                options={state.comboOpts.environments.filter((env) => env.ENVIRONMENT_NAME !== null)}
                value={state.formData.ENVIRONMENT_ID_item}
                propLabel="ENVIRONMENT_LABEL"
                placeholder={t('ambiente')}
                onSelect={(item) => { setFormData({ ENVIRONMENT_ID_item: item }); setFormData({ ROOM_NAME: item.ENVIRONMENT_NAME }); }}
                disabled={!state.formData.UNIT_ID_item}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Input
                type="text"
                value={state.formData.ENVIRONMENT_ID_item ? state.formData.ROOM_NAME : ''}
                label={t('nomeAmbiente')}
                onChange={(event) => setFormData({ ROOM_NAME: event.target.value })}
                disabled={!profile.manageAllClients}
              />
            </div>
          </>
        )}

        {(state.devType.isDut) && (
          <>
            <CustomSelect
              options={state.comboOpts.placement}
              value={state.formData.PLACEMENT_item}
              placeholder={t('posicionamento')}
              onSelect={(item) => setFormData({ PLACEMENT_item: item, SENSOR_AUTOM: item.value === 'DUO' ? 0 : null })}
              notNull
            />
            {renderDutDuoEquipFields()}
          </>
        )}

        {(state.devType.isDut) && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label
                onClick={() => {
                  state.offsetChecked = !state.offsetChecked;
                  if (state.offsetChecked) {
                    alert(t('cadastroOffsetAlerta'));
                  }
                  state.formData.TEMPERATURE_OFFSET = state.formData.TEMPERATURE_OFFSET ? state.formData.TEMPERATURE_OFFSET : '0';
                  render();
                }}
                style={{
                  display: 'flex',
                  marginTop: '5px',
                }}
              >
                <Checkbox checked={state.offsetChecked}>
                  {state.offsetChecked ? <CheckboxIcon /> : null}
                </Checkbox>
                <span style={{ paddingLeft: '10px' }}>
                  {t('offsetTemperatura')}
                </span>
              </label>
            </div>
            {state.offsetChecked && (
              <>
                <div style={{ width: '100%' }}>
                  <Input
                    type="number"
                    value={state.formData.TEMPERATURE_OFFSET}
                    label={t('offsetTemperatura')}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(event) => setFormData({ TEMPERATURE_OFFSET: event.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  {t('detalhesOffset', {
                    value1: (state.formData.TEMPERATURE_OFFSET ?? '0'),
                    value2: (state.formData.TEMPERATURE_OFFSET ? (23.0 + (parseDecimalNumber(state.formData.TEMPERATURE_OFFSET) ?? 0)).toString() : '23'),
                  })}
                </div>
              </>
            )}
          </>
        )}
      </>
    );
  }

  function renderAssetsFields() {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 40px', gap: 10 }}>
          <SearchInput
            style={{
              width: 'auto',
              margin: 0,
              marginBottom: 10,
              border: '1px solid #818181',
            }}
          >
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('conjunto')}</Label>
              <SelectSearch
                options={state.filtComboOpts.groups.map((item) => ({
                  value: item.value,
                  name: item.label,
                  unit: item.unit,
                }))}
                value={state.formData.GROUP_ID_item?.value.toString()}
                placeholder={t('conjunto')}
                search
                filterOptions={fuzzySearch}
                onChange={(value, name) => {
                  setFormData({ GROUP_ID_item: name });
                  changePropertiesByMachine();
                }}
                disabled={!state.formData.UNIT_ID_item}
              />
            </div>
          </SearchInput>
        </div>
        <div>
          {state.formData.GROUP_ID_item?.value && (
            <div style={{ marginBottom: '20px' }}>
              <ClearSelect
                onClickClear={() => {
                  setFormData({ GROUP_ID_item: null });
                  setFormData({ ASSET_ID_item: null });
                }}
                value={state.formData.GROUP_ID_item.name ?? state.formData.GROUP_ID_item.label}
              />
            </div>
          )}
        </div>
        <CustomSelect
          style={{
            marginRight: 50,
          }}
          options={state.comboOpts.assets.filter((asset) => asset.GROUP_ID === state.formData.GROUP_ID_item?.value)}
          value={state.formData.ASSET_ID_item?.label}
          placeholder={t('ativo')}
          onSelect={(item) => {
            setFormData({ ASSET_ID_item: item || null });
            changePropertiesByAsset();
            render();
          }}
          disabled={!state.formData.GROUP_ID_item}
        />
      </>
    );
  }

  function renderDacEquipFields() {
    return (
      <>
        {(state.devType.isDac)
          && (
          <>
            <CustomSelect
              style={{
                marginRight: 50,
              }}
              options={state.comboOpts.applicsNew}
              value={state.formData.DAC_APPL_item}
              placeholder={t('aplicacao')}
              onSelect={onSelectApplication}
            />
            {
              !profile.permissions.isInstaller && (
                <CustomSelect
                  options={state.comboOpts.fluids}
                  value={state.formData.FLUID_TYPE_item}
                  placeholder={t('fluidoRefrigerante')}
                  onSelect={(item) => setFormData({ FLUID_TYPE_item: item })}
                />
              )
            }
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ minWidth: '80px' }}>
                P0: [
                {state.telemetry.P0raw}
                ]
              </div>
              <CustomSelect
                style={{ width: '120px' }}
                options={state.comboOpts.pPositions}
                value={state.formData.P0_POSITION}
                placeholder={t('pressao')}
                onSelect={(item) => setFormData({ P0_POSITION: item })}
              />
              <CustomSelect
                style={{ width: '150px' }}
                options={state.comboOpts.psens}
                value={state.formData.P0_SENSOR}
                placeholder={t('sensor')}
                onSelect={(item) => setFormData({ P0_SENSOR: item })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ minWidth: '80px' }}>
                P1: [
                {state.telemetry.P1raw}
                ]
              </div>
              <CustomSelect
                style={{ width: '120px' }}
                options={state.comboOpts.pPositions}
                value={state.formData.P1_POSITION}
                placeholder={t('pressao')}
                onSelect={(item) => setFormData({ P1_POSITION: item })}
              />
              <CustomSelect
                style={{ width: '150px' }}
                options={state.comboOpts.psens}
                value={state.formData.P1_SENSOR}
                placeholder={t('sensor')}
                onSelect={(item) => setFormData({ P1_SENSOR: item })}
              />
            </div>
            {
              !profile.permissions.isInstaller && (
                <>
                  <div>
                    <Checkbox
                      style={{ paddingBottom: '8px' }}
                      label={t('configurarSensoresTemperatura')}
                      checked={state.formData.configTsensors}
                      onClick={() => onTconfigClick()}
                    />
                    {(state.formData.configTsensors)
                      && (
                      <div style={{ display: 'flex' }}>
                        <CustomSelect
                          options={state.comboOpts.tPositions}
                          value={state.formData.T0_POSITION}
                          placeholder="T0"
                          onSelect={(item) => setFormData({ T0_POSITION: item })}
                        />
                        <CustomSelect
                          style={{ marginLeft: '8px' }}
                          options={state.comboOpts.tPositions}
                          value={state.formData.T1_POSITION}
                          placeholder="T1"
                          onSelect={(item) => setFormData({ T1_POSITION: item })}
                        />
                        <CustomSelect
                          style={{ marginLeft: '8px' }}
                          options={state.comboOpts.tPositions}
                          value={state.formData.T2_POSITION}
                          placeholder="T2"
                          onSelect={(item) => setFormData({ T2_POSITION: item })}
                        />
                      </div>
                      )}
                  </div>
                  <CustomSelect
                    options={state.filtComboOpts.types}
                    value={state.formData.DAC_TYPE_item}
                    placeholder={t('tipoEquipamento')}
                    onSelect={(item) => setFormData({ DAC_TYPE_item: item })}
                  />
                  {renderHeatExchangerFields()}
                  <TextLine style={{ alignItems: 'flex-start' }}>
                    <Input
                      type="text"
                      value={state.formData.CAPACITY_PWR}
                      label={t('capacidadeFrigorifica')}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ CAPACITY_PWR: event.target.value })}
                    />
                    <CustomSelect
                      options={state.comboOpts.capacUnits}
                      value={state.formData.CAPACITY_UNIT_item}
                      placeholder={t('unidade')}
                      onSelect={(item) => setFormData({ CAPACITY_UNIT_item: item })}
                    />
                  </TextLine>
                  <TextLine style={{ marginBottom: '20px' }}>
                    <Input
                      type="text"
                      value={state.formData.DAC_COP}
                      label={t('coeficientePerformanceCOP')}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ DAC_COP: event.target.value })}
                    />
                  </TextLine>
                  <TextLine style={{ marginBottom: '20px' }}>
                    <Input
                      type="text"
                      value={state.formData.DAC_KW}
                      label={t('potenciaNominalKw')}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ DAC_KW: event.target.value })}
                    />
                  </TextLine>
                  <CustomSelect
                    options={state.filtComboOpts.envs}
                    value={state.formData.DAC_ENV_item}
                    placeholder={t('ambiente')}
                    onSelect={(item) => setFormData({ DAC_ENV_item: item })}
                  />

                  <CustomSelect
                    options={state.comboOpts.brands}
                    value={state.formData.DAC_BRAND_item}
                    placeholder={t('marca')}
                    onSelect={(item) => setFormData({ DAC_BRAND_item: item })}
                  />
                  <TextLine style={{ marginBottom: '20px' }}>
                    <Input
                      type="text"
                      value={state.formData.DAC_MODEL}
                      label={t('modelo')}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ DAC_MODEL: event.target.value })}
                    />
                  </TextLine>
                  <CustomSelect
                    options={state.comboOpts.yesNo}
                    value={state.formData.DAC_MODIF_item}
                    placeholder={t('houveModificacao')}
                    onSelect={(item) => setFormData({ DAC_MODIF_item: item })}
                  />
                  <CustomSelect
                    options={state.comboOpts.yesNo}
                    value={state.formData.DAC_COMIS_item}
                    placeholder={t('dacComissionado')}
                    onSelect={(item) => setFormData({ DAC_COMIS_item: item })}
                    notNull
                  />
                  <TextLine style={{ marginBottom: '20px' }}>
                    <Input
                      type="text"
                      value={state.formData.DAC_DESC}
                      label={t('descricao')}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ DAC_DESC: event.target.value })}
                    />
                  </TextLine>
                  <TextLine style={{ marginBottom: '20px' }}>
                    <Input
                      type="text"
                      value={state.formData.DAC_NAME}
                      label={t('tagCondensadora')}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ DAC_NAME: event.target.value })}
                    />
                  </TextLine>
                </>
              )
            }
            {/* FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA */}
            {(state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.persistedAssetDevice?.ASSET_ROLE === 1 || state.persistedAssetDevice?.ASSET_ROLE === 2) && (
              <>
                <CustomInput style={{ width: '400px' }}>
                  <div style={{ width: '100%', paddingTop: 3 }}>
                    <Label>{t('modeloDaEvaporadora')}</Label>
                    <SelectSearch
                      options={state.comboOpts.evaporatorModels?.map((item) => ({ name: item.label, value: item.value }))}
                      value={state.formData.EVAPORATOR_MODEL_item?.value}
                      printOptions="on-focus"
                      search
                      filterOptions={fuzzySearch}
                      placeholder={t('selecioneOModeloDaEvaporadora')}
                      onChange={(id) => { setFormData({ EVAPORATOR_MODEL_item: state.comboOpts.evaporatorModels.find((item) => String(item.value) === String(id)) }); }}
                      closeOnSelect={false}
                    />
                  </div>
                </CustomInput>
                <BtnClean onClick={() => setFormData({ EVAPORATOR_MODEL_item: null })} style={{ marginBottom: '10px' }}>{t('limparCampo')}</BtnClean>
                <TextLine style={{ marginBottom: '20px' }}>
                  <Input
                    type="text"
                    value={state.formData.INSUFFLATION_SPEED}
                    width="400px"
                    label={`${t('velocidadeDeInsuflamento')} [m/s]`}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ INSUFFLATION_SPEED: event.target.value })}
                  />
                </TextLine>
              </>
            )}
            {((state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && (state.persistedAssetDevice?.ASSET_ROLE === 1 || state.persistedAssetDevice?.ASSET_ROLE === 2)) && (
              <>
                <TextLine style={{ marginBottom: '20px' }}>
                  <Input
                    type="text"
                    value={state.formData.COMPRESSOR_NOMINAL_CURRENT}
                    width="400px"
                    label={t('correnteNominalDoCompressor')}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setFormData({ COMPRESSOR_NOMINAL_CURRENT: event.target.value })}
                  />
                </TextLine>
                <CustomSelect
                  options={state.comboOpts.equipmentPower}
                  value={state.formData.EQUIPMENT_POWER_item}
                  placeholder={t('alimentacaoDoEquipamento')}
                  onSelect={(item) => setFormData({ EQUIPMENT_POWER_item: item })}
                  notNull
                />
              </>
            )}
          </>
          )}
      </>
    );
  }

  function renderDamDuoEquipFields() {
    return (state.formData.DAM_PLACEMENT_item?.value === 'DUO' && (
      <Flex>
        <CustomSelect
          style={{ width: '130px', minWidth: 'fit-content', marginRight: '20px' }}
          options={state.comboOpts.sensorDamDuo}
          value={state.formData.T0_POSITION_DAM?.label}
          placeholder="T0"
          onSelect={(item) => {
            const other = item.value === 'RETURN' ? state.comboOpts.sensorDamDuo[1] : state.comboOpts.sensorDamDuo[0];
            setFormData({ T0_POSITION_DAM: item, T1_POSITION_DAM: other });
          }}
        />
        <CustomSelect
          style={{ width: '130px', minWidth: 'fit-content' }}
          options={state.comboOpts.sensorDamDuo}
          value={state.formData.T1_POSITION_DAM?.label}
          placeholder="T1"
          onSelect={(item) => {
            const other = item.value === 'RETURN' ? state.comboOpts.sensorDamDuo[1] : state.comboOpts.sensorDamDuo[0];
            setFormData({ T1_POSITION_DAM: item, T0_POSITION_DAM: other });
          }}
        />
      </Flex>
    ));
  }

  function renderEquipmentInfo() {
    return (
      <div>
        <TextLine>
          <PaperIcon />
          <Text>
            <span style={{ fontWeight: 'bold' }}>DEV ID: </span>
            {state.devId}
          </Text>
        </TextLine>

        <TextLine style={{ marginTop: '15px' }}>
          <span>
            <span style={{ fontWeight: 'bold' }}>{`${t('inicioMonitoramento')}: `}</span>
            {state.formData.DAT_BEGMON || t('semInformacoes')}
          </span>
        </TextLine>

        {(state.devType.isDac) && (
          <div style={{ marginTop: '10px' }}>
            <span>{t('l1Real')}</span>
            <ToggleSwitchMini checked={!!state.selectedL1Sim} style={{ margin: '0 8px' }} onClick={changeSelectedL1Sim} />
            <span>{t('l1Simulado')}</span>
          </div>
        )}

        {state.isLoadingUnitInfo && (
          <OverLay>
            <Loader variant="primary" size="large" />
          </OverLay>
        )}

        <ContainerInfo>
          <Flex width={1} flexDirection={['column', 'row']}>
            <Box width={[1, 1, 1, 1 / 2]} mr={[0, 30]} height="auto">
              <ContainerText>
                <SearchInput
                  style={{
                    width: '100%',
                    margin: 0,
                    marginBottom: 10,
                    marginRight: 50,
                    border: '1px solid #818181',
                  }}
                >
                  <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                    <Label>{t('cliente')}</Label>
                    <SelectSearch
                      options={state.comboOpts.clients.map((item) => ({ value: item.CLIENT_ID, name: item.NAME }))}
                      value={state.formData.CLIENT_ID_item?.CLIENT_ID.toString()}
                      propLabel="NAME"
                      placeholder={t('cliente')}
                      search
                      filterOptions={fuzzySearch}
                      onChange={(value, name) => { onSelectClient(name); }}
                    />
                  </div>
                </SearchInput>
                {state.formData.CLIENT_ID_item?.CLIENT_ID && (
                  <div style={{ marginBottom: '20px' }}>
                    <ClearSelect
                      onClickClear={onSelectClient}
                      value={state.formData.CLIENT_ID_item.NAME}
                    />
                  </div>
                )}
                <SearchInput
                  style={{
                    width: '100%',
                    margin: 0,
                    marginBottom: 10,
                    marginRight: 50,
                    border: '1px solid #818181',
                  }}
                >
                  <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                    <Label>{t('unidade')}</Label>
                    <SelectSearch
                      options={state.comboOpts.units.map((item) => ({ value: item.UNIT_ID, name: item.UNIT_NAME }))}
                      value={state.formData.UNIT_ID_item?.UNIT_ID.toString()}
                      propLabel="NAME"
                      placeholder={t('unidade')}
                      search
                      filterOptions={fuzzySearch}
                      notNull={false}
                      onChange={(value, name) => { onSelectUnit(name); }}
                      disabled={!state.formData.CLIENT_ID_item}
                    />
                  </div>
                </SearchInput>
                {state.formData.UNIT_ID_item?.UNIT_ID && (
                  <div style={{ marginBottom: '20px' }}>
                    <ClearSelect
                      onClickClear={onSelectUnit}
                      value={state.formData.UNIT_ID_item.UNIT_NAME}
                    />
                  </div>
                )}
                {(state.devId.startsWith('DAM')) && (
                  <>
                    <CustomSelect
                      options={state.comboOpts.damInstallationLocation}
                      value={state.formData.DAM_INSTALLATION_LOCATION_item}
                      propLabel="label"
                      placeholder={t('localInstalacaoDam')}
                      onSelect={(item) => setFormData({ DAM_INSTALLATION_LOCATION_item: item })}
                    />
                    {/* FEATURE DISPONIVEL APENAS PARA OS CLIENTES: BANCO DO BRASIL e DIEL ENERGIA */}
                    {(state.devInfo?.CLIENT_ID === 145 || state.devInfo?.CLIENT_ID === 1) && state.formData.DAM_INSTALLATION_LOCATION_item?.value === 'casa-de-maquina' && (
                      <>
                        <CustomSelect
                          options={state.comboOpts.damPlacement}
                          value={state.formData.DAM_PLACEMENT_item}
                          placeholder={t('posicionamento')}
                          onSelect={(item) => setFormData({ DAM_PLACEMENT_item: item, ...(item.value === 'RETURN' && { T0_POSITION_DAM: null, T1_POSITION_DAM: null }) })}
                        />
                        {renderDamDuoEquipFields()}
                      </>
                    )}
                  </>
                )}
                {(state.devType.isDut)
                  && (
                    renderAssetsFields()
                  )}
                {renderDutEquipFields()}

                {((!state.devType.isDac) && state.filtComboOpts.groups.length > 0) && (
                <>
                  <div>
                    {`${t('maquinas')}:`}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 10px 40px', paddingBottom: '15px' }}>
                    <div>
                      {state.filtComboOpts.groups.map((group) => (
                        <label key={group.value} onClick={() => { group.checked = !group.checked; render(); }} style={{ display: 'flex', marginTop: '5px' }}>
                          <Checkbox checked={!!group.checked}>
                            {group.checked ? <CheckboxIcon /> : null}
                          </Checkbox>
                          <span style={{ paddingLeft: '10px' }}>
                            {group.label}
                            {' '}
                            {state.devType.isDam && group.withDacAut && t('automatizadoPorDac')}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div />
                  </div>
                </>
                )}
                {(state.devType.isDac)
                  && (
                    renderAssetsFields()
                  )}
                {renderDacEquipFields()}
              </ContainerText>
            </Box>
          </Flex>
        </ContainerInfo>
      </div>
    );
  }

  function renderDutAutSchedTabs() {
    return (
      <Flex
        style={{
          borderRadius: '10px',
        }}
        flexWrap="nowrap"
        flexDirection="column"
        alignItems="left"
        width="768px"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 6px 150px auto',
            height: '5px',
            marginTop: '24px',
          }}
        >
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: state.showExceptions ? '#f4f4f4' : 'transparent',
            }}
          />
          <span />
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: state.showExceptions ? 'transparent' : '#f4f4f4',
            }}
          />
          <span />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto' }}>
          <span
            style={{
              borderRight: '1px solid lightgrey',
              borderLeft: '1px solid lightgrey',
              borderBottom: state.showExceptions ? '1px solid lightgrey' : 'none',
              textAlign: 'center',
              fontSize: '90%',
              fontWeight: state.showExceptions ? 'normal' : 'bold',
              backgroundColor: state.showExceptions ? '#f4f4f4' : 'transparent',
              cursor: state.showExceptions ? 'pointer' : undefined,
            }}
            onClick={() => { state.showExceptions && setState({ showExceptions: !state.showExceptions, showList: false }); }}
          >
            {t('programacoes')}
          </span>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
          <span
            style={{
              borderBottom: state.showExceptions ? 'none' : '1px solid lightgrey',
              borderLeft: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              backgroundColor: state.showExceptions ? 'transparent' : '#f4f4f4',
              cursor: (!state.showExceptions) ? 'pointer' : undefined,
              fontWeight: !state.showExceptions ? 'normal' : 'bold',
            }}
            onClick={() => { (!state.showExceptions) && setState({ showExceptions: !state.showExceptions }); }}
          >
            {t('excecoes')}
          </span>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
        </div>
      </Flex>
    );
  }

  function renderDutAutSchedCards() {
    return (
      <>
        {!state.showExceptions && (
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
            alignItems="left"
          >
            {state.DUTS_SCHEDULES_FILTERED.map((schedule, index) => (index % 2 === 0
              ? (
                <Flex
                  key={schedule.DUT_SCHEDULE_ID}
                  style={{
                    marginTop: index === 0 ? '15px' : '17px',
                    marginLeft: '17px',
                  }}
                  flexDirection="row"
                >
                  {state.isSaving && (
                    <OverLay>
                      <Loader variant="primary" size="large" />
                    </OverLay>
                  )}
                  <ScheduleViewCard
                    cardPosition={index}
                    schedule={schedule}
                    hideButtons={false}
                    onHandleEdit={editSchedule}
                    onHandleDelete={deleteSchedule}
                  />
                  {index + 1 < state.DUTS_SCHEDULES_FILTERED.length ? (
                    <ScheduleViewCard
                      cardPosition={index + 1}
                      schedule={state.DUTS_SCHEDULES_FILTERED[index + 1]}
                      hideButtons={false}
                      onHandleEdit={editSchedule}
                      onHandleDelete={deleteSchedule}
                    />
                  ) : (
                    <>
                    </>
                  )}
                </Flex>
              )
              : (
                <></>
              )))}
          </Flex>
        )}
        {state.showExceptions && state.DUTS_EXCEPTIONS_FILTERED.length > 0 && (
          <>
            <Flex
              style={{
                marginTop: '25px',
                marginLeft: '43px',
              }}
              flexDirection="row"
            >
              <div
                style={{
                  fontWeight: 'bold',
                  width: '42px',
                  fontSize: '13px',
                }}
              >
                {t('titulo')}
              </div>
              <div
                style={{
                  width: '42px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginLeft: '193px',
                }}
              >
                {t('data')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  marginLeft: '61px',
                  width: '111px',
                }}
              >
                {t('repetirTodoAno')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  marginLeft: '28px',
                  width: '42px',
                }}
              >
                {t('inicio')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  marginLeft: '33px',
                  width: '30px',
                  fontSize: '13px',
                }}
              >
                {t('fim')}
              </div>
            </Flex>
            {state.DUTS_EXCEPTIONS_FILTERED.map((exception, index) => (
              <Flex
                key={exception.DUT_EXCEPTION_ID}
                style={{
                  marginTop: '5px',
                  marginLeft: '16px',
                }}
                flexDirection="column"
              >
                <ExceptionViewCard
                  cardPosition={index}
                  exception={exception}
                  hideButtons={false}
                  onHandleEdit={editException}
                  onHandleDelete={deleteException}
                />
              </Flex>
            ))}
          </>
        )}
      </>
    );
  }

  function renderDutAutSchedule(devInfo) {
    return (devInfo.dut_aut) && state.devType.dutAutEnabled && (
      <>
        {renderDutAutSchedTabs()}
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          alignItems="left"
          width="768px"
          height="620px"
          style={{
            borderLeft: '1px solid #D7D7D7',
            borderRight: '1px solid #D7D7D7',
            borderBottom: '1px solid #D7D7D7',
            radius: '10px',
            overflowY: 'scroll',
            overflowX: 'hidden',
            marginBottom: '26px',
          }}
        >
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            alignItems="left"
          >
            <div
              style={{
                marginLeft: '18px',
                marginTop: '26px',
                width: '74px',
                fontSize: '16px',
              }}
            >
              {`Total: ${!state.showExceptions ? state.DUTS_SCHEDULES_FILTERED.length : state.DUTS_EXCEPTIONS_FILTERED.length}`}
            </div>
            <div
              style={{
                marginLeft: '413px',
                marginTop: '17px',
              }}
            >
              <Button
                style={{
                  width: '225px',
                }}
                disabled={state.isSaving}
                onClick={() => {
                  if (state.showExceptions && state.DUTS_EXCEPTIONS_FILTERED.length === 30) {
                    toast.error('Limite de 30 exceções alcançado!');
                  }
                  else {
                    setState({
                      selectedSchedule: null,
                      selectedIndexSchedule: null,
                      selectedException: null,
                      selectedIndexException: null,
                      openModal: !state.showExceptions ? 'add-edit-schedule' : 'add-edit-exception',
                    });
                  }
                }}
                variant="primary"
              >
                {`${!state.showExceptions ? t('adicionarProgramacao') : t('adicionarExcecao')}`}
              </Button>
            </div>
          </Flex>
          {renderDutAutSchedCards()}
        </Flex>
      </>
    );
  }

  function renderHeatExchangerFields() {
    return (state.formData.DAC_APPL_item?.label === t('14trocadorCalor') && state.formData.DAC_TYPE_item?.label === t('trocadorCalor')) ? (
      <div>
        <CustomSelect
          options={state.comboOpts.heatExchangerTypes}
          value={state.formData.DAC_HEAT_EXCHANGER_item}
          placeholder={t('tipoTrocadorCalor')}
          onSelect={(item) => setFormData({ DAC_HEAT_EXCHANGER_item: item })}
        />
        {(state.formData?.DAC_HEAT_EXCHANGER_item?.BRAND && state.formData?.DAC_HEAT_EXCHANGER_item?.MODEL)
          ? (
            <div style={{ paddingBottom: '15px', fontWeight: 'bold', color: colors.Blue400 }}>
              {t('informacoesTipoTrocadorCalor')}
              {`
              ${state.formData.DAC_HEAT_EXCHANGER_item?.BRAND ? t('marcaTrocadorCalor', { value1: state.formData.DAC_HEAT_EXCHANGER_item?.BRAND }) : ''}
              ${state.formData.DAC_HEAT_EXCHANGER_item?.BRAND && state.formData.DAC_HEAT_EXCHANGER_item?.MODEL ? ' | ' : ''}
              ${state.formData.DAC_HEAT_EXCHANGER_item?.MODEL ? t('modeloTrocadorCalor', { value1: state.formData.DAC_HEAT_EXCHANGER_item?.MODEL }) : ''}
              `}
            </div>
          )

          : null}
      </div>

    ) : null;
  }

  function renderDriConfig() {
    return (!state.isLoading) && devInfo && state.devType.isDri && state.driInfo?.dri?.varsList && (
      <Card>
        <br />
        <DriConfig
          devInfoResp={state.driInfo}
          varsList={state.driInfo.dri.varsList}
          cards={state.cards}
          subcards={state.subcards}
          relevances={state.relevances}
        />
      </Card>
    );
  }

  function renderDamEcoFields() {
    return state.formData.ECO_CFG_item && (ecoModeDetails[state.formData.ECO_CFG_item.value] || state.devInfo?.dam?.CAN_SELF_REFERENCE) && (
      <div style={{ marginBottom: '20px' }}>
        {!state.devInfo?.dam?.CAN_SELF_REFERENCE
          ? (
            <Input
              label={t('intervaloComandoModoEco')}
              value={state.formData.ECO_INTERVAL_TIME}
              style={{ width: '250px' }}
              onChange={(e) => {
                if (
                  (parseInt(e.target.value, 10) >= 1 && parseInt(e.target.value, 10) <= 15)
                  || (e.target.value === '')
                ) {
                  setFormData({ ECO_INTERVAL_TIME: e.target.value });
                }
              }}
            />
          )
          : (
            <InputCalculator
              id={state.formData.ECO_INTERVAL_TIME}
              label={t('intervaloComandoModoEco')}
              value={state.formData.ECO_INTERVAL_TIME}
              style={{ width: '250px' }}
              onIncreaseDecrease={increaseDecreaseIntervalTime}
              lowerLimit={getMinimumInterval(state.formData.ECO_CFG_item.value)}
              onChange={(e) => {
                if (
                  (parseInt(e.target.value, 10) >= 1 && parseInt(e.target.value, 10) <= 15)
                  || (e.target.value === '')
                ) {
                  setFormData({ ECO_INTERVAL_TIME: e.target.value });
                }
              }}
            />
          )}
        <p>{t('limitesMin', { inicio: 1, final: 15 })}</p>
        <div
          style={{ width: '800px' }}
        >
          {ecoModeDetails[state.formData.ECO_CFG_item.value]}
        </div>
      </div>
    );
  }

  function renderEco1Fields() {
    return (
      <>
        {renderDamEcoFields()}
        {!state.devInfo?.dam?.CAN_SELF_REFERENCE && (
          <>
            <div>
              <Input
                label={t('offsetEntradaC')}
                value={state.formData.ECO_OFST_START}
                style={{ width: '160px' }}
                onChange={(e) => setFormData({ ECO_OFST_START: e.target.value })}
              />
            </div>
            <div>
              {t('seTemperaturaMinimaAmbiente20graus', {
                value1: state.formData.ECO_OFST_START,
                value2: (20 + parseFloat(state.formData.ECO_OFST_START)),
              })}
            </div>
            <div style={{ marginTop: '20px' }}>
              <Input
                label={t('offsetSaidaC')}
                value={state.formData.ECO_OFST_END}
                style={{ width: '160px' }}
                onChange={(e) => setFormData({ ECO_OFST_END: e.target.value })}
              />
            </div>
            <div>
              {t('seTemperaturaAtivacaoModoEcoCamaraFria7graus', {
                value1: (state.formData.ECO_OFST_END || 1),
                value2: (7 + (parseFloat(state.formData.ECO_OFST_END) || 1)),
              })}
            </div>
          </>
        )}
        {state.devInfo?.dam?.CAN_SELF_REFERENCE && (
          <>
            <div>
              <InputCalculator
                label={t('setpoint')}
                value={state.formData.ECO_SETPOINT}
                style={{ width: '250px' }}
                onIncreaseDecrease={increaseDecreaseSetpoint}
                unity="ºC"
                onChange={(e) => setFormData({ ECO_SETPOINT: e.target.value })}
              />
            </div>
            <div style={{ marginTop: '20px' }}>
              <InputCalculator
                label={t('histereseSuperior')}
                value={state.formData.ECO_UPPER_HYSTERESIS}
                style={{ width: '250px' }}
                onIncreaseDecrease={increaseDecreaseUpperHysterese}
                unity="ºC"
                lowerLimit={0}
                onChange={(e) => setFormData({ ECO_UPPER_HYSTERESIS: e.target.value })}
              />
            </div>
            <div>
              {t('refrigerarAcionandoQuando', {
                value1: ((Number(state.formData.ECO_SETPOINT) || 0) + (Number(state.formData.ECO_UPPER_HYSTERESIS) || 0)),
                value2: (state.formData.ECO_SETPOINT || '0'),
                value3: (state.formData.ECO_UPPER_HYSTERESIS || '0'),
              })}
            </div>
            <div style={{ marginTop: '20px' }}>
              <InputCalculator
                label={t('histereseInferior')}
                value={state.formData.ECO_LOWER_HYSTERESIS}
                style={{ width: '250px' }}
                onIncreaseDecrease={increaseDecreaseLowerHysterese}
                unity="ºC"
                lowerLimit={0}
                onChange={(e) => setFormData({ ECO_LOWER_HYSTERESIS: e.target.value })}
              />
            </div>
            <div>
              {t('modoEcoAcionandoQuando', {
                value1: ((Number(state.formData.ECO_SETPOINT) || 0) - (Number(state.formData.ECO_LOWER_HYSTERESIS) || 0)),
                value2: (state.formData.ECO_SETPOINT || '0'),
                value3: (state.formData.ECO_LOWER_HYSTERESIS || '0'),
              })}
            </div>
          </>
        )}
      </>
    );
  }

  function renderEco2Fields() {
    return (
      <>
        {!state.devType.isDac && (
          <div>
            <CustomSelect
              options={state.comboOpts.scheduleStartBehavior}
              value={state.formData.ECO_SCHEDULE_START_BEHAVIOR_item}
              placeholder={t('comportamentoInicioProgHoraria')}
              onSelect={(item) => setFormData({ ECO_SCHEDULE_START_BEHAVIOR_item: item })}
              notNull
            />
          </div>
        )}
        <div>
          <Input
            label={t('intervaloConsiderarHipoteses')}
            value={state.formData.ECO_INTERVAL_TIME}
            style={{ width: '250px' }}
            onChange={(e) => setFormData({ ECO_INTERVAL_TIME: e.target.value })}
          />
        </div>
        <div>
          {t('histereseSoSeraConsideradaAlterarEstadoDispositivoIntervaloTempo')}
        </div>
        <div style={{ marginTop: '20px' }}>
          <Input
            label={t('setpointC')}
            value={state.formData.ECO_SETPOINT}
            style={{ width: '250px' }}
            onChange={(e) => setFormData({ ECO_SETPOINT: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Input
            label={t('limiarDeTemperaturaCriticoC')}
            value={state.formData.ECO_LTC}
            style={{ width: '250px' }}
            onChange={(e) => setFormData({ ECO_LTC: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Input
            label={t('limiarDeTemperaturaInferiorC')}
            value={state.formData.ECO_LTI}
            style={{ width: '250px' }}
            onChange={(e) => setFormData({ ECO_LTI: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Input
            label={t('histereseSuperiorC')}
            value={state.formData.ECO_UPPER_HYSTERESIS}
            style={{ width: '250px' }}
            onChange={(e) => setFormData({ ECO_UPPER_HYSTERESIS: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Input
            label={t('histereseInferiorC')}
            value={state.formData.ECO_LOWER_HYSTERESIS}
            style={{ width: '250px' }}
            onChange={(e) => setFormData({ ECO_LOWER_HYSTERESIS: e.target.value })}
          />
        </div>
      </>
    );
  }

  function decideAssetLayout() {
    if (!state.assetLayout) {
      return <DevLayout devInfo={devInfo} />;
    }
    return <AssetLayout devInfo={devInfo} />;
  }

  function formDataPlacemantitem() {
    if (state.formData.PLACEMENT_item && state.formData.PLACEMENT_item.value === 'DUO') {
      return <h4>{t('msgInfoDutDuo')}</h4>;
    }
    return null;
  }

  function verifyDamAndRelDutId(devInfo) {
    if (devInfo.dam && ((!devInfo.dac) || (devInfo.dam.DAM_DISABLED !== 1)) && state.formData.REL_DUT_ID_item) {
      return true;
    }
    return false;
  }

  function verifyDamAndDamDisabled(devInfo) {
    if ((devInfo.dam) && ((!devInfo.dac) || (devInfo.dam.DAM_DISABLED !== 1))) {
      return true;
    }
    return false;
  }

  function verifyDamFuNomCal() {
    if (state.damFuNomCalc) {
      return state.damFuNomCalc;
    }
    return t('semDados');
  }

  function verifyVariableExistence(variable, exeption) {
    if (variable) {
      return variable;
    }
    return exeption;
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devId, t('editar'))}</title>
      </Helmet>
      {decideAssetLayout()}
      {state.isLoading && (
        <div style={{ marginTop: '50px' }}>
          <Loader variant="primary" />
        </div>
      )}
      {renderDriConfig()}

      <ModalLoading display={state.isSaving}>
        <Loader />
        <div>
          <Trans
            i18nKey="mensageSave"
          >
            <h4> Aguarde, os dados estão </h4>
            <h4> sendo salvos. </h4>
          </Trans>
          {formDataPlacemantitem()}
        </div>
      </ModalLoading>

      {(!state.isLoading) && devInfo && !state.devType.isDri && (
        <>
          <Card>
            <Title>{t('botaoEditar')}</Title>
            {(tabs.length > 1) && <Headers2 links={tabs} />}
            <br />
            <br />
            {(allTabs[0].isActive)
            && renderEquipmentInfo()}
            {(allTabs[1].isActive)
            && (
            <div>
              {/* Informação ocultada para futuras melhorias */}
              {/* <TextLine style={{ marginTop: '15px' }}>
                <span>
                  <span style={{ fontWeight: 'bold' }}>Data da primeira automação: </span>
                  {state.formData.DAT_BEGAUT || 'Sem informações'}
                </span>
              </TextLine> */}
              <ContainerInfo>
                <Flex>
                  <Box>
                    <ContainerText>
                      {(state.devType.isDac && state.devType.isDam) && (
                      <CustomSelect
                        options={state.comboOpts.yesNo}
                        value={state.formData.USE_RELAY_item}
                        placeholder={t('automacaoHabilitada')}
                        onSelect={(item) => setFormData({ USE_RELAY_item: item })}
                        notNull
                      />
                      )}
                      {(state.devType.isDutAut) && (
                      <CustomSelect
                        options={state.comboOpts.dutAutCfg}
                        value={!state.devType.isDutQA ? state.formData.DUTAUTCFG_item : { label: t('nao'), value: 'DISABLED' }}
                        placeholder={t('automacaoHabilitada')}
                        onSelect={(item) => setFormData({ DUTAUTCFG_item: item })}
                        notNull
                        disabled={state.devType.isDut && state.devInfo?.dut?.operation_mode === 5}
                      />
                      )}

                      {(devInfo.dut_aut) && state.devType.dutAutEnabled && (
                        <>
                          <CustomSelect
                            options={state.comboOpts.brands}
                            value={state.formData.MCHN_BRAND_item}
                            placeholder={t('marca')}
                            onSelect={(item) => setFormData({ MCHN_BRAND_item: item })}
                          />
                          <TextLine style={{ marginBottom: '20px' }}>
                            <Input
                              type="text"
                              value={state.formData.MCHN_MODEL}
                              label={t('modelo')}
                              onChange={(event) => setFormData({ MCHN_MODEL: event.target.value })}
                            />
                          </TextLine>
                          {(state.temperatureControlState && profile.manageAllClients) && (
                            <div style={{ paddingBottom: '10px' }}>{JSON.stringify(state.temperatureControlState)}</div>
                          )}
                          {(state.formData.DUTAUTCFG_item && (state.formData.DUTAUTCFG_item.value === 'IR')) && (
                            <TextLine style={{ marginBottom: '20px' }}>
                              <Input
                                type="number"
                                value={state.formData.RESENDPER}
                                label={t('tempoReenvioComandoMin')}
                                onChange={(event) => setFormData({ RESENDPER: event.target.value })}
                                placeholder={t('valorMultiplo5')}
                                error={resendTimeError}
                              />
                            </TextLine>
                          )}
                        </>
                      )}

                      {(!state.devType.isDut) && (
                        <CustomSelect
                          options={state.filtComboOpts.duts}
                          value={state.formData.REL_DUT_ID_item}
                          placeholder={t('ambienteMonitorado')}
                          style={{ width: '250px' }}
                          onSelect={(item) => setFormData({ REL_DUT_ID_item: item })}
                          disabled={!state.formData.UNIT_ID_item}
                          propLabel="ROOM_NAME"
                        />
                      )}

                      {(state.devType.isDam && devInfo.DEV_ID.startsWith('DAM3')) && devInfo.dam?.supportsExtTherm && (
                        <Select
                          options={state.comboOpts.extThermCfg}
                          value={state.formData.EXT_THERM_CFG}
                          label={t('ligacaoTermostatoControlador')}
                          style={{ width: '250px', marginBottom: '10px' }}
                          onSelect={(item) => setFormData({ EXT_THERM_CFG: item })}
                          propLabel="label"
                        />
                      )}

                      {(verifyDamAndRelDutId(devInfo)) && (
                        <>
                          {!state.formData.REL_DUT_ID_item!.DEV_ID.startsWith('DAM3') && state.devInfo?.dam?.CAN_SELF_REFERENCE && (
                            <>
                              <div
                                style={{ fontWeight: 'bold' }}
                              >
                                {t('tipoAmbiente')}
                              </div>
                              <p>{verifyVariableExistence(state.formData.REL_DUT_ID_item!.RTYPE_NAME, '-')}</p>
                              <div
                                style={{ fontWeight: 'bold', marginTop: '15px' }}
                              >
                                {t('limitesTemperatura')}
                              </div>
                              <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
                                <>min.</>
                                <div
                                  style={{
                                    display: 'flex',
                                    marginLeft: '3px',
                                    flexFlow: 'row nowrap',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {` ${verifyVariableExistence(state.formData.REL_DUT_ID_item!.TUSEMIN, '-')} `}
                                </div>
                                °C
                                <div
                                  style={{
                                    display: 'flex',
                                    marginLeft: '10px',
                                    flexFlow: 'row nowrap',
                                  }}
                                >
                                  max.
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    marginLeft: '3px',
                                    flexFlow: 'row nowrap',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  <p>{state.formData.REL_DUT_ID_item!.TUSEMAX ?? '-'}</p>
                                </div>
                                °C
                              </div>
                            </>
                          )}
                          {state.formData.REL_DUT_ID_item!.DEV_ID.startsWith('DAM3') && state.devInfo?.dam?.CAN_SELF_REFERENCE && (
                            <div style={{ display: 'flex', flexFlow: 'row nowrap', marginBottom: '20px' }}>
                              <div>
                                <InputCalculator
                                  label="T-min"
                                  value={state.formData.MINIMUM_TEMPERATURE}
                                  style={{ width: '150px' }}
                                  onIncreaseDecrease={increaseDecreaseMinimumTemperature}
                                  unity="°C"
                                  onChange={(e) => setFormData({ MINIMUM_TEMPERATURE: e.target.value })}
                                />
                              </div>
                              <div style={{ marginLeft: '9px' }}>
                                <InputCalculator
                                  label="T-máx"
                                  value={state.formData.MAXIMUM_TEMPERATURE}
                                  style={{ width: '150px' }}
                                  onIncreaseDecrease={increaseDecreaseMaximumTemperature}
                                  unity="°C"
                                  onChange={(e) => setFormData({ MAXIMUM_TEMPERATURE: e.target.value })}
                                />
                              </div>
                            </div>
                          )}
                          <div
                            style={{ width: '800px' }}
                          >
                            <p>{t('limitesTemperaturaConsideradosApenasNotificacoesExibicaoLinhas')}</p>
                          </div>

                          <ContainerEcoMode>
                            <CustomSelect
                              options={state.comboOpts.optionsEco}
                              value={state.formData.ENABLE_ECO_item}
                              placeholder={t('modoEco')}
                              style={{ width: '250px' }}
                              onSelect={(item) => setFormData({ ENABLE_ECO_item: item })}
                              notNull
                            />
                            {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN !== 0) && (
                              <>
                                <CustomSelect
                                  options={state.comboOpts.optionsEcoLocal}
                                  value={state.formData.ENABLE_ECO_local}
                                  placeholder={t('ecoLocal')}
                                  style={{ width: '250px' }}
                                  onSelect={(item) => setFormData({ ENABLE_ECO_local: item })}
                                  notNull
                                  data-tip
                                  data-for="ecoLocal"
                                />
                                <ReactTooltip
                                  id="ecoLocal"
                                  place="top"
                                  effect="solid"
                                >
                                  <HoverEcoLocal>
                                    <span>
                                      {t('quandoHabilitadoODamExecutara')}
                                    </span>
                                  </HoverEcoLocal>

                                </ReactTooltip>
                              </>
                            )}
                          </ContainerEcoMode>

                          {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN === 2) && (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                {dacDamEcoDetails}
                              </div>
                              {profile.manageAllClients && (
                                <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                                  <Image
                                    width={800}
                                    height={500}
                                    src={String(BackupEcoV2DamDac)}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN !== 0) && (
                            <>
                              <CustomSelect
                                options={state.comboOpts.ecoModeCfg}
                                value={state.formData.ECO_CFG_item}
                                placeholder={t('configuracaoModoEco')}
                                style={{ width: '250px' }}
                                onSelect={(item) => setFormData({ ECO_CFG_item: item })}
                                notNull
                              />
                              {state.formData.ENABLE_ECO_item.valueN === 1 && renderEco1Fields()}
                              {state.formData.ENABLE_ECO_item.valueN === 2 && renderEco2Fields()}
                              {!state.devInfo?.dam?.CAN_SELF_REFERENCE && (
                                <>
                                  <TextLine style={{ marginTop: '20px' }}>
                                    <Input
                                      type="text"
                                      value={state.formData.FU_NOM || ''}
                                      placeholder={t('fatorUtilizacaoNominal01')}
                                      onChange={(event) => setFormData({ FU_NOM: event.target.value })}
                                    />
                                  </TextLine>
                                  <p>(1-0)</p>
                                </>
                              )}
                              {state.devInfo?.dam?.CAN_SELF_REFERENCE && (
                                <>
                                  <TextLine style={{ marginTop: '20px' }}>
                                    <InputCalculator
                                      label={t('fatorUtilizacaoNominal')}
                                      type="text"
                                      value={state.formData.FU_NOM}
                                      style={{ width: '250px' }}
                                      onIncreaseDecrease={increaseDecreaseIntervalTime}
                                      onChange={(e) => setFormData({ FU_NOM: e.target.value })}
                                    />
                                  </TextLine>
                                  <p>(1-0)</p>
                                </>
                              )}
                              <div style={{ marginBottom: '20px' }}>
                                {t('fatorUtilizacaoNominalSugerido', {
                                  value1: (verifyDamFuNomCal()),
                                })}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </ContainerText>
                  </Box>
                </Flex>
              </ContainerInfo>
              {(verifyDamAndDamDisabled(devInfo)) && (
                <div style={{ paddingBottom: '20px' }}>
                  <DamScheduleContents hideAnalysis />
                </div>
              )}
              {/* {(devInfo.dut_aut) && dutAutEnabled && (
                <div style={{ paddingBottom: '20px' }}>
                  <DutScheduleContents />
                </div>
              )} */}
              {renderDutAutSchedule(devInfo)}
            </div>
            )}
            {(allTabs[2].isActive)
            && (
            <EditDevInfoDRI
              formData={state.formData}
              onDataUpdate={(data) => state.formData.varsConfigInput = data.varsConfigInput}
            />
            )}
            <div>
              <Button style={{ maxWidth: '100px' }} disabled={state.isSaving} onClick={() => saveDevInfo(allTabs)} variant="primary">
                {t('botaoSalvar')}
              </Button>
            </div>
          </Card>
          {renderModal(devInfo)}
          {sendAndDisableAut && (
            <ModalWindow borderTop onClickOutside={() => setSendAndDisableAut(false)}>
              <div style={{ marginBottom: 10 }}> Essa desassociação irá desabilitar a automação do dispositivo, deseja continuar?</div>
              <Button variant="primary" onClick={() => { deleteAutAndDisassociate(); }}> SIM </Button>
              <Button variant="blue-inv" onClick={() => setSendAndDisableAut(false)}> NÃO </Button>
            </ModalWindow>
          )}
        </>
      )}
    </>
  );
};

export default withTransaction('EditDevInfo', 'component')(EditDevInfo);
