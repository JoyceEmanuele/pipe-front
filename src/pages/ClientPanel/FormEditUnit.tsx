import {
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { Flex } from 'reflexbox';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { usePasswordToggle } from '~/hooks/usePasswordToggle';
import '~/assets/css/ReactTags.css';
import {
  Button, Input, ModalWindow, Select,
} from 'components';
import { Input as InputNew } from 'components/NewInputs/Default';
import { Select as SelectNew } from 'components/NewSelect';
import { useForm } from 'react-hook-form';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { useStateVar } from 'helpers/useStateVar';
import queryString from 'query-string';
import { useHistory } from 'react-router-dom';
import { apiCall, apiCallFormData, ApiResps } from '../../providers';
import { SelectMultiple } from '~/components/NewSelectMultiple';
import { GetUsersListType } from '~/metadata/GetUsersList';
import {
  FormEditBaselines,
} from '~/components/FormEditBaselines';
import { FormEditExtras } from './UnitExtras';
import { Headers2 } from '../Analysis/Header';
import { getCachedDevInfo } from '~/helpers/cachedStorage';
import { AxiosError } from 'axios';
import moment from 'moment';

import {
  CustomInput,
  BaseLinesBool,
  Label,
  Form,
  IconWrapper,
  Content,
  ContentEnergyMeter,
  ContentDate,
  StyledCalendarIcon,
  ModalCancel,
  ModalDisassociate,
  InfoSIMCARD,
  ContainerIconsSimcard,
  ContainerDescEditSim,
  CustomInputConstructedArea,
} from './styles';

import {
  currentCapacityOpts,
  driMetersCfgs,
  installationTypeOpts,
} from '~/helpers/driConfigOptions';
import { SingleDatePicker } from 'react-dates';
import { Tabs } from '~/components/Tabs';
import { EnergyMeterForm } from './EnergyMeterForm';
import { colors } from '~/styles/colors';
import i18n from '~/i18n';
import { CicleDetail } from './CicleDetail';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteTrashIcon,
  EditPenPaperIcon,
  PaperBloomIcon,
  SimcardIcon,
} from '~/icons';
import { RateModelsType } from './ClientPanel';
import { DropzoneArea } from '~/components/Dropzone';
import {
  TSIMCARD,
  addPhotosSims,
  deletePhotosSims,
  deleteSims,
  editUpdateSims,
} from '~/helpers/simcards';

type Inputs = {
  login: string,
  loginExtra: string,
  password: string,
  consumerUnit: string,
};

const formValidators = {
  login: {
    required: false,
  },
  loginExtra: {
    required: false,
  },
  consumerUnit: {
    required: false,
  },
  password: {
    required: false,
  },
};

const comboHydrometerOptions: string[] = ['Elster S120 (1 L/pulso)', 'ZENNER ETKD-P-N (10 L/pulso)', 'ZENNER MTKD-AM-I (10 L/pulso)',
  'Saga Unijato US-1.5 (1 L/pulso)', 'Saga Unijato US-3.0 (1 L/pulso)', 'Saga Unijato US-5.0 (1 L/pulso)'];

const comboLocalOptions: string[] = [
  'Em série com o hidrômetro da unidade',
  "Próximo à caixa d'agua",
  'Somente sensor no hidrômetro da unidade',
  'Outro',
];

interface IEnergyMeter {
  selectedManufacturer: null | { MANUFACTURER_ID: number, NAME: string };
  meterSerial: string;
  meterDriId: string;
  selectedMeterModel: null | { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string };
  selectedCurrentCapacity: null | { name: string, value: string };
  selectedInstallationType: null | { name: string, value: string };
  nameOfEstablishment?: string;
  filteredModelsList: { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string }[],
}

interface IEnergyMeterToSend {
  SERIAL?: string
  MANUFACTURER: string
  MODEL: string
  DRI_ID?: string
  ESTABLISHMENT_NAME?: string
  DRI_CFG?: {
    driId: string
    application: string
    protocol: string
    modbusBaudRate?: string
    telemetryInterval?: string
    serialMode?: string
    parity?: string
    stopBits?: string
    capacityTc?: string
    worksheetName?: string
  }
}

export const FormEditUnit = (props: {
  rateModels?: RateModelsType[],
  unitInfo?: {
    UNIT_ID: number
    UNIT_NAME: string
    UNIT_CODE_CELSIUS: string
    UNIT_CODE_API: string
    LAT: string
    LON: string
    TARIFA_KWH: number
    CITY_ID: string
    STATE_ID: string
    STATE_NAME: string
    COUNTRY_NAME: string
    DISTRIBUTOR_ID: number
    ADDITIONAL_DISTRIBUTOR_INFO: string
    CONSUMER_UNIT: string
    LOGIN: string
    LOGIN_EXTRA: string
    PASSWORD: string
    STATUS: string
    PRODUCTION: boolean
    TIMEZONE_AREA: string
    TIMEZONE_ID: number
    TIMEZONE_OFFSET: number
    AMOUNT_PEOPLE: string
    CONSTRUCTED_AREA?: string
  }
  clientId: number,
  onSuccess: (result: { item: {}, action: string }) => void
  onCancel: () => void
  states: { STATE_ID: string, COUNTRY_ID: number }[]
  cities: { CITY_ID: string, STATE_ID: string }[]
  timezones: { value: number, label: string }[]
  countries: { COUNTRY_NAME: string, COUNTRY_ID: number }[]
  distributors?: { value: number, name: string }[]
  accessPoints?: {
    name: string,
    cnpjs: string[],
    access_points: string[]
  }[]
  energyMeters?: ApiResps['/energy/get-energy-list']['list'],
  waterMeters?: ApiResps['/get-integrations-list']['list']
}): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const history = useHistory();
  const {
    unitInfo = undefined, clientId, onSuccess, onCancel, countries, states, cities, timezones, distributors,
  } = props;
  const [files, setFiles] = useState<File[]>([]);
  const [state, render, setState] = useStateVar({
    selectedModelId: null as number | null,
    isBaselineOpen: false,
    submitting: false,
    editingExtras: false,
    supervisors: [] as { USER: string }[],
    distributors: props.distributors as { value: number, name: string, tag: string }[],
    selectedDistributor: '' as string,
    isLoading: false as boolean,
    isBaselineEdit: false as boolean,
    isBaselineValuesEdit: false as boolean,
    accessPoints: props.accessPoints as {name: string, access_points: string[]}[],
    additionalDistributorInfo: '' as string,
    accessPointsAvailable: [] as string[],
    manufacturersList: [] as { MANUFACTURER_ID: number, NAME: string, }[],
    modelsList: [] as { MODEL_ID: number, MANUFACTURER_ID: number, NAME: string }[],
    energyMeters: props.energyMeters,
    energyMetersData: [] as IEnergyMeter[],
    waterMeters: props.waterMeters,
    selectedSupplier: '' as string,
    hydrometerModel: '' as string,
    installationDate: '' as any,
    meterWaterId: '' as string,
    totalCapacity: '',
    totalOfReservoirs: '',
    installationLocal: '',
    otherInstallationLocal: '',
    focused: false,
    isAllEnergyMetersFromDiel: true,
    listSimcards: [] as TSIMCARD[],
    listSimEdit: [] as TSIMCARD[],
    modalAddSimcard: false,
    formSimcard: {
      iccid: '',
      pontoAcesso: '',
      modem: '',
      macPontoAcesso: '',
      macRepetidor: '',
    },
    itemDesc: {} as TSIMCARD,
    deleteSims: [] as { ICCID: string }[],
    isEdit: false,
    modalDesc: false,
    editDeleteSim: {} as TSIMCARD | null,
    listAddPhotos: [] as {
      iccid: string,
      file: Blob
    }[],
    deleteListPhotos: [] as {
      filename: string,
      iccid: string,
    }[],
    modalDeleteSim: false,
  });
  const [PasswordInputType, ToggleIcon] = usePasswordToggle();
  const [formData] = useState({
    UNIT_ID: (unitInfo && unitInfo.UNIT_ID) || null,
    UNIT_NAME: (unitInfo && unitInfo.UNIT_NAME) || '',
    UNIT_CODE_CELSIUS: unitInfo?.UNIT_CODE_CELSIUS ?? '',
    UNIT_CODE_API: unitInfo?.UNIT_CODE_API ?? '',
    LAT: (unitInfo && unitInfo.LAT) || '',
    LON: (unitInfo && unitInfo.LON) || '',
    TARIFA_KWH: (unitInfo && unitInfo.TARIFA_KWH && String(unitInfo.TARIFA_KWH)) || '',
    PRODUCTION: (unitInfo && unitInfo.PRODUCTION !== undefined ? Boolean(unitInfo.PRODUCTION) : null),
    city_item: (unitInfo && unitInfo.CITY_ID && cities.find((item) => item.CITY_ID === unitInfo.CITY_ID)) || null,
    state_item: (unitInfo && unitInfo.STATE_ID && states.find((item) => item.STATE_ID === unitInfo.STATE_NAME)) || null,
    country_item: (unitInfo && unitInfo.COUNTRY_NAME && countries.find((item) => item.COUNTRY_NAME === unitInfo.COUNTRY_NAME)) || null,
    distributor: (unitInfo && unitInfo.DISTRIBUTOR_ID && distributors && distributors.find((item) => item.value === unitInfo.DISTRIBUTOR_ID)) || null,
    accessPoints: [],
    login: (unitInfo && unitInfo.LOGIN) || '',
    login_extra: (unitInfo && unitInfo.LOGIN_EXTRA) || '',
    consumer_unit: (unitInfo && unitInfo.CONSUMER_UNIT) || '',
    password: (unitInfo && unitInfo.PASSWORD) || '',
    baselineValues: [] as {
      BASELINE_MONTH: number,
      BASELINE_KWH: number,
      BASELINE_PRICE: number,
    }[],
    baselineTemplate: {} as {value: number, name: string, tag: string},
    baselineId: null as null|number,
    additionalDistributorInfo: unitInfo && unitInfo.ADDITIONAL_DISTRIBUTOR_INFO || '',
    status: unitInfo && unitInfo.STATUS || null,
    timezone: unitInfo && { area: `${unitInfo.TIMEZONE_AREA} (${unitInfo.TIMEZONE_OFFSET})`, id: unitInfo.TIMEZONE_ID } || {} as { area: string, id: number },
    AMOUNT_PEOPLE: unitInfo?.AMOUNT_PEOPLE ?? '',
    CONSTRUCTED_AREA: unitInfo?.CONSTRUCTED_AREA ?? null,
  });

  const [usersList, setUsersList] = useState<GetUsersListType[]>([]);
  const isEdit = !!formData.UNIT_ID;
  const isAccessDistributorEdit = !!formData.distributor;
  const comboLocalOptions: string[] = [
    t('emSerieHidrometroUnidade'),
    t('proximoCaixaDagua'),
    t('somenteSensorHidrometroUnidade'),
    t('outro'),
  ];
  async function getClientUsers(unitId?: number) {
    const response = await apiCall('/users/list-users', { CLIENT_ID: clientId, includeAdmins: false });
    setUsersList(response.list);
    if (unitId) {
      const { list: oldSupervisorsList } = await apiCall('/clients/get-unit-supervisors', { UNIT_ID: unitId });
      const oldSupervisorsEmail = oldSupervisorsList.map((supervisor) => supervisor.EMAIL);
      const oldSupervisors = response.list.filter((user) => oldSupervisorsEmail.includes(user.USER));
      setState({ supervisors: oldSupervisors });
    }
  }

  function handleAccessPoints() {
    const distributorTag = (state.distributors.find((item) => item.value === Number(state.selectedDistributor)))?.tag;
    setState({ accessPointsAvailable: state.accessPoints.find((item) => item.name === distributorTag)?.access_points });
  }

  const checkMultipleEnergyMeters = () => {
    let isAllDiel = true;
    state.energyMetersData.forEach((meter) => {
      if (meter.selectedManufacturer?.NAME !== 'Diel Energia') {
        isAllDiel = false;
      }
    });
    setState({ isAllEnergyMetersFromDiel: isAllDiel });
  };

  function handlePrice(month, price) {
    const baselineIndex = formData.baselineValues.findIndex((item) => item.BASELINE_MONTH === month);
    price = price != null ? price.replace('R$ ', '') : price;
    if (baselineIndex > -1) {
      formData.baselineValues[baselineIndex].BASELINE_PRICE = Number(price);
    }
    else {
      formData.baselineValues.push({ BASELINE_MONTH: month, BASELINE_PRICE: Number(price), BASELINE_KWH: 0 });
    }
  }

  function handleKwh(month, kwh) {
    const baselineIndex = formData.baselineValues.findIndex((item) => item.BASELINE_MONTH === month);
    kwh = kwh != null ? kwh.replace('kWh ', '') : kwh;
    if (baselineIndex > -1) {
      formData.baselineValues[baselineIndex].BASELINE_KWH = Number(kwh);
    }
    else {
      formData.baselineValues.push({ BASELINE_MONTH: month, BASELINE_PRICE: 0, BASELINE_KWH: Number(kwh) });
    }
  }

  function handleBaselineId(baselineId) {
    formData.baselineId = baselineId;
  }

  function handleBaselineTemplate(baselineTemplate: {value: number, name: string, tag: string}) {
    formData.baselineTemplate = { value: baselineTemplate.value, name: baselineTemplate.name, tag: baselineTemplate.tag };
  }

  function handleBaselineEdit(isBaselineEdit: boolean) {
    state.isBaselineEdit = isBaselineEdit;
  }

  function handleBaselineValuesEdit(isBaselineValuesEdit: boolean) {
    state.isBaselineValuesEdit = isBaselineValuesEdit;
  }

  function onFilterDistributorChange(distributor) {
    state.selectedDistributor = distributor;
    render();
    formData.additionalDistributorInfo = '';
    handleAccessPoints();
  }

  async function getEnergyData(unitId?: number) {
    const { manufacturersList, modelsList } = await apiCall('/energy/get-energy-combo-opts', {});
    setState({ manufacturersList, modelsList });

    if (!unitId) return;
    const energyMeters = state.energyMeters?.filter((meter) => meter.UNIT_ID === unitId);

    if (!energyMeters) return;
    for (const meter of energyMeters) {
      let capacityTc : string;
      let installationType: string;
      if (meter && meter.MANUFACTURER === 'Diel Energia') {
        const devInfo = await getCachedDevInfo(meter.ENERGY_DEVICE_ID, { forceFresh: true });
        capacityTc = devInfo?.dri?.varsCfg?.varsList.find((x) => x.name === 'Capacidade TC')?.address.value;
        installationType = devInfo?.dri?.varsCfg?.varsList.find((x) => x.name === 'Tipo Instalação')?.address.value;
      }
      if (meter) {
        const manufacturer = manufacturersList.find((x) => x.NAME === meter.MANUFACTURER);
        state.energyMetersData.push({
          selectedManufacturer: manufacturer || null,
          selectedMeterModel: modelsList.find((x) => x.NAME === meter.MODEL) || null,
          filteredModelsList: state.modelsList.filter((model) => model.MANUFACTURER_ID === manufacturer?.MANUFACTURER_ID),
          meterDriId: meter.MANUFACTURER === 'Diel Energia' ? meter.ENERGY_DEVICE_ID : '',
          meterSerial: meter.SERIAL,
          selectedCurrentCapacity: currentCapacityOpts?.find((opt) => opt.value === (Number(capacityTc) / 2).toString()) || null,
          selectedInstallationType: installationTypeOpts[meter.MODEL]?.find((opt) => opt.value === installationType) || null,
          nameOfEstablishment: meter.ESTABLISHMENT_NAME,
        });
      }
    }
    if (state.energyMetersData.length === 0) {
      state.energyMetersData.push({
        selectedManufacturer: null,
        selectedMeterModel: null,
        filteredModelsList: [],
        meterDriId: '',
        meterSerial: '',
        selectedCurrentCapacity: null,
        selectedInstallationType: null,
        nameOfEstablishment: '',
      });
    }
    checkMultipleEnergyMeters();
  }

  async function getWaterData(unitId?: number) {
    if (unitId) {
      const meter = state.waterMeters?.find((meter) => meter.UNIT_ID === unitId);
      const meterId = meter?.integrId;
      if (meterId) {
        const { info } = await apiCall('/get-integration-info', { supplier: (meterId.startsWith('DMA') ? 'diel-dma' : 'laager'), integrId: meterId });
        const hasDefaultOption = comboLocalOptions.includes(info.installationLocation || '');
        setState({
          selectedSupplier: info.supplier,
          hydrometerModel: info.hydrometerModel || '',
          installationDate: info.installationDate ? moment(info.installationDate?.substring(0, 10)) : null,
          meterWaterId: meterId,
          totalCapacity: String(info.totalCapacity) || '',
          totalOfReservoirs: String(info.quantityOfReservoirs) || '',
        });
        if (hasDefaultOption) {
          setState({
            installationLocal: info.installationLocation || '',
            otherInstallationLocal: '',
          });
        } else if (info.installationLocation && info.installationLocation !== '') {
          setState({
            installationLocal: 'Outro',
            otherInstallationLocal: info.installationLocation,
          });
        }
      }
    }
  }

  async function getListSimcards(unitId?: number) {
    try {
      if (unitId) {
        const list = await apiCall('/sims/get-unit-sims', { unitId });
        setState({ listSimcards: list, listSimEdit: list });
      }
    } catch (err) {
      toast.error('Nao foi possivel buscar a lista de SIMCARD da unidade');
    }
  }

  useEffect(() => {
    getClientUsers(unitInfo?.UNIT_ID);
    updateAccessDistributorData();
    getEnergyData(unitInfo?.UNIT_ID);
    getWaterData(unitInfo?.UNIT_ID);
    getListSimcards(unitInfo?.UNIT_ID);
  }, []);

  const updateAccessDistributorData = () => {
    if (clientId == null) return;
    state.isLoading = true;
    setValue('login', formData.login);
    setValue('loginExtra', formData.login_extra);
    setValue('consumerUnit', formData.consumer_unit);
    state.isLoading = false;
  };

  function verifyAmountPeople(amountPeople) {
    const amountPeopleValue = Number(amountPeople);
    if (amountPeopleValue && (Number.isNaN(amountPeopleValue) || amountPeopleValue <= 0 || !Number.isInteger(amountPeopleValue))) {
      toast.error(t('numeroPessoasDeveSerUmNumeroInteiro'));
      return true;
    }
    return false;
  }

  const handleFormSubmition = async ({
    consumerUnit, login, password, loginExtra,
  }: Inputs) => {
    let response = null as null|{
      UNIT_ID: number
      UNIT_NAME: string
      LAT: string
      LON: string
      CITY_ID: string
      CITY_NAME: string
      STATE_ID: string
      GA_METER?: number
      PRODUCTION?: boolean
      TARIFA_DIEL?: 0|1
      AMOUNT_PEOPLE?: number
    };

    let responseAccessDistributor = null as {
      UNIT_ID: number
      DISTRIBUTOR_ID: number
      CONSUMER_UNIT: string
      LOGIN: string
      LOGIN_EXTRA: string
      DISTRIBUTOR_LABEL: string
      STATUS: string
    }|null;

    let responseBaseline: {
      UNIT_ID: number,
      BASELINE_ID: number,
      BASELINE_TEMPLATE_ID: number,
      BASELINE_TEMPLATE_TAG: string,
    }|null;

    let action = null as null|string;
    try {
      state.submitting = true; render();

      const reqData = {
        UNIT_ID: formData.UNIT_ID || undefined,
        CLIENT_ID: clientId,
        UNIT_CODE_CELSIUS: formData.UNIT_CODE_CELSIUS || null,
        UNIT_CODE_API: formData.UNIT_CODE_API || null,
        UNIT_NAME: formData.UNIT_NAME,
        LAT: formData.LAT || null,
        LON: formData.LON || null,
        TARIFA_KWH: parseDecimalNumber(formData.TARIFA_KWH) || null,
        CITY_ID: formData.city_item && formData.city_item.CITY_ID,
        STATE_ID: formData.state_item && formData.state_item.STATE_ID,
        // eslint-disable-next-line no-unneeded-ternary
        PRODUCTION: formData.PRODUCTION,
        TIMEZONE_ID: formData.timezone.id,
        AMOUNT_PEOPLE: formData.AMOUNT_PEOPLE || null,
        CONSTRUCTED_AREA: formData.CONSTRUCTED_AREA ?? null,
      };
      if (verifyAmountPeople(reqData.AMOUNT_PEOPLE)) {
        return;
      }
      if (isEdit) {
        response = await apiCall('/clients/edit-unit', {
          ...reqData,
          ...(formData.AMOUNT_PEOPLE !== '' ? { AMOUNT_PEOPLE: formData.AMOUNT_PEOPLE } : { AMOUNT_PEOPLE: null }),
          ...(formData.CONSTRUCTED_AREA !== '' ? { CONSTRUCTED_AREA: formData.CONSTRUCTED_AREA } : { CONSTRUCTED_AREA: null }),
          UNIT_ID: formData.UNIT_ID!,
          RATE_MODEL_ID: state.selectedModelId,
        });
        action = 'edit';
      } else {
        response = await apiCall('/dac/add-client-unit', {
          ...reqData,
          ...(formData.CONSTRUCTED_AREA !== '' ? { CONSTRUCTED_AREA: formData.CONSTRUCTED_AREA } : { CONSTRUCTED_AREA: null }),
          ...(formData.AMOUNT_PEOPLE !== '' ? { AMOUNT_PEOPLE: formData.AMOUNT_PEOPLE } : { AMOUNT_PEOPLE: null }),
        });
        formData.UNIT_ID = response.UNIT_ID;
        action = 'new';
      }

      if (state.selectedDistributor === '' && formData.distributor) {
        state.selectedDistributor = formData.distributor.value.toString();
      }

      if (response && state.selectedDistributor && login) {
        const reqDataAccessDistributor = {
          UNIT_ID: response.UNIT_ID,
          CLIENT_ID: clientId,
          DISTRIBUTOR_ID: Number(state.selectedDistributor) || undefined,
          ADDITIONAL_DISTRIBUTOR_INFO: state.additionalDistributorInfo || undefined,
          CONSUMER_UNIT: consumerUnit || null,
          LOGIN: login || null,
          PASSWORD: password || null,
          LOGIN_EXTRA: loginExtra || null,
          STATUS: formData.status || null,
        };

        if (isAccessDistributorEdit) {
          responseAccessDistributor = await apiCall('/clients/edit-access-distributor', reqDataAccessDistributor);
        }
        else {
          responseAccessDistributor = await apiCall('/clients/add-access-distributor', reqDataAccessDistributor);
        }
      }

      if (response && formData.baselineTemplate) {
        const reqBaseline = {
          CLIENT_ID: clientId,
          UNIT_ID: response.UNIT_ID,
          BASELINE_ID: formData.baselineId || undefined,
          BASELINE_TEMPLATE_ID: formData.baselineTemplate.value,
        };

        if (reqBaseline.BASELINE_ID || reqBaseline.BASELINE_TEMPLATE_ID) {
          if (state.isBaselineEdit) {
            responseBaseline = await apiCall('/clients/edit-baseline', { ...reqBaseline, BASELINE_ID: formData.baselineId! });
          }
          else {
            responseBaseline = await apiCall('/clients/add-baseline', reqBaseline);
          }

          if (responseBaseline && responseBaseline.BASELINE_TEMPLATE_TAG === 'manual') {
            const reqBaselineValues = {
              CLIENT_ID: clientId,
              UNIT_ID: response.UNIT_ID,
              BASELINE_ID: responseBaseline.BASELINE_ID,
              baselineValues: formData.baselineValues,
            };

            await apiCall('/clients/set-baseline-values', reqBaselineValues);
          }
        }
      }

      if (unitInfo) {
        if (state.supervisors.length > 0) {
          await Promise.all(state.supervisors.map((user: { USER: string }) => apiCall('/clients/set-unit-supervisors', {
            USER_ID: user.USER,
            UNIT_ID: unitInfo.UNIT_ID,
          })));
        } else {
          await apiCall('/clients/clear-unit-supervisors', { UNIT_ID: unitInfo.UNIT_ID });
        }
      }
    } catch (err) {
      const error = err as AxiosError;
      console.log(err);
      if (error.response?.status !== 500) {
        toast.error(`${error.response?.data}`);
      } else {
        toast.error(t('erroDadosGerais'));
      }
    }
    state.submitting = false; render();
    if (response && (responseAccessDistributor || state.selectedDistributor === '' || isAccessDistributorEdit) && action) onSuccess({ item: { response, responseAccessDistributor }, action });
  };

  async function handleSubmitEnergyMeterInfo() {
    try {
      const meters: IEnergyMeterToSend[] = [];
      for (const energyMeter of state.energyMetersData) {
        if (energyMeter.selectedManufacturer && energyMeter.selectedMeterModel) {
          const meterReqData: IEnergyMeterToSend = {
            MANUFACTURER: energyMeter.selectedManufacturer.NAME,
            MODEL: energyMeter.selectedMeterModel.NAME,
            DRI_ID: energyMeter.meterDriId,
            SERIAL: energyMeter.meterSerial,
            CLIENT_ID: clientId,
            UNIT_ID: formData.UNIT_ID,
            ESTABLISHMENT_NAME: energyMeter.nameOfEstablishment,
          };
          meters.push(meterReqData);
        }
      }
      await apiCall('/energy/set-energy-list-info', { meters, CLIENT_ID: clientId, UNIT_ID: formData.UNIT_ID });
      toast.success('Sucesso na associação dos medidores de energia');

      for (const energyMeter of state.energyMetersData) {
        if (energyMeter.selectedManufacturer && energyMeter.selectedMeterModel) {
          if (energyMeter.meterDriId) {
            const driCfg = driMetersCfgs[energyMeter.selectedMeterModel.NAME];
            driCfg.driId = energyMeter.meterDriId;
            driCfg.capacityTc = energyMeter.selectedCurrentCapacity?.value;
            driCfg.installationType = energyMeter.selectedInstallationType?.value;
            apiCallFormData('/upload-dri-varscfg', driCfg, { file: null });
          }
        }
      }
    } catch (err) {
      const error = err as AxiosError;
      console.log(err);
      if (error.response?.status !== 500) {
        toast.error(`${error.response?.data}`);
      } else {
        toast.error(t('erroAssociacaoMedidorEnergia'));
      }
    }
  }

  async function handleDisassociation() {
    try {
      if (state.selectedSupplier && state.meterWaterId) {
        if (state.selectedSupplier === 'Diel') {
          const dmaData: any = { DMA_ID: state.meterWaterId };
          dmaData.UNIT_ID = null;
          await apiCall('/dma/set-dma-info', dmaData);

          toast.success(t('sucessoDesassociacaoDma'));
        } else if (state.selectedSupplier === 'Laager') {
          const laagerData: any = { integrId: state.meterWaterId };
          laagerData.UNIT_ID = null;

          await apiCall('/laager/set-meter-info', {
            unitId: laagerData.UNIT_ID,
            meterId: laagerData.integrId,
          });

          toast.success(t('sucessoDesassociacaoLaager'));
        }
      }
    } catch (err) { console.log(err);
      toast.error(t('erroDesassociacaoMedidorAgua'));
    }
  }
  async function handleSubmitWaterMeterInfo() {
    try {
      if (state.selectedSupplier && state.meterWaterId) {
        if (state.selectedSupplier === 'Diel') {
          const dmaData: any = { DMA_ID: state.meterWaterId };

          dmaData.UNIT_ID = unitInfo && unitInfo.UNIT_ID ? unitInfo.UNIT_ID : (formData.UNIT_ID ? formData.UNIT_ID : null);
          dmaData.UNIT_NAME = unitInfo && unitInfo.UNIT_NAME ? unitInfo.UNIT_NAME : null;
          dmaData.CLIENT_ID = clientId || null;
          dmaData.HYDROMETER_MODEL = state.hydrometerModel ? state.hydrometerModel : null;
          const defaultInstallationLocation = state.installationLocal !== 'Outro' && state.installationLocal !== '' ? state.installationLocal : null;
          dmaData.INSTALLATION_LOCATION = state.installationLocal === 'Outro' && state.otherInstallationLocal !== '' ? state.otherInstallationLocal : defaultInstallationLocation;
          dmaData.INSTALLATION_DATE = state.installationDate !== '' && state.installationDate !== null ? moment(state.installationDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
          dmaData.TOTAL_CAPACITY = state.totalCapacity ? Number(state.totalCapacity) : null;
          dmaData.QUANTITY_OF_RESERVOIRS = state.totalOfReservoirs ? Number(state.totalOfReservoirs) : null;
          dmaData.CHANGED_BY_UNIT = true;

          await apiCall('/dma/set-dma-info', dmaData);

          toast.success(t('sucessoAdicaoDma'));
        } else if (state.selectedSupplier === 'Laager') {
          const laagerData: any = { integrId: state.meterWaterId };

          laagerData.UNIT_ID = unitInfo && unitInfo.UNIT_ID ? unitInfo.UNIT_ID : (formData.UNIT_ID ? formData.UNIT_ID : null);
          laagerData.hydrometerModel = state.hydrometerModel ? state.hydrometerModel : null;
          const defaultInstallationLocation = state.installationLocal !== 'Outro' && state.installationLocal !== '' ? state.installationLocal : null;
          laagerData.installationLocation = state.installationLocal === 'Outro' && state.otherInstallationLocal !== '' ? state.otherInstallationLocal : defaultInstallationLocation;
          laagerData.installationDate = state.installationDate !== '' && state.installationDate !== null ? moment(state.installationDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
          laagerData.totalCapacity = state.totalCapacity ? Number(state.totalCapacity) : null;
          laagerData.quantityOfReservoirs = state.totalOfReservoirs ? Number(state.totalOfReservoirs) : null;

          await apiCall('/laager/set-meter-info', {
            unitId: laagerData.UNIT_ID,
            meterId: laagerData.integrId,
            installationLocation: laagerData.installationLocation,
            installationDate: laagerData.installationDate,
            totalCapacity: laagerData.totalCapacity,
            quantityOfReservoirs: laagerData.quantityOfReservoirs,
            hydrometerModel: laagerData.hydrometerModel,
            changedByUnit: true,

          });

          toast.success(t('sucessoAssociacaoMedidorAgua'));
        }
      }
    } catch (err) { console.log(err);
      toast.error(t('erroAdicaoDmaOuAssociacaoMedidorAgua'));
    }
  }

  async function SubmitSimcards() {
    await Promise.all([
      deleteSims(state),
      editUpdateSims(state),
      addPhotosSims(state),
      deletePhotosSims(state),
    ]).then(() => {
      toast.success(t('sucessoSalvar'));
    }).catch(() => {
      toast.error(t('erroSalvar'));
    });
  }

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  const tabs = [
    {
      title: t('dadosGerais'),
      link: `${linkBase}`,
      isActive: !queryPars.aba,
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('energia'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'energia', categoria: 'fatura' })}`,
      isActive: (queryPars.aba === 'energia'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('agua'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'water' })}`,
      isActive: (queryPars.aba === 'water'),
      visible: true,
      ref: useRef(null),
    },
    // {
    //   title: 'SIMCARD',
    //   link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'simcard' })}`,
    //   isActive: (queryPars.aba === 'simcard'),
    //   visible: true,
    //   ref: useRef(null),
    // },
  ];

  const energyTabs = [
    {
      title: 'Faturas',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, categoria: 'fatura' })}`,
      isActive: (queryPars.categoria === 'fatura'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Medidores',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, categoria: 'medidor-de-energia' })}`,
      isActive: (queryPars.categoria === 'medidor-de-energia'),
      visible: true,
      ref: useRef(null),
    },
  ];

  const {
    register, setValue, handleSubmit, watch, formState: { errors },
  } = useForm<Inputs>({
    mode: 'all',
  });

  function onCountrySelected(item) {
    formData.country_item = item;
    const selectedCountry = formData.country_item && formData.country_item.COUNTRY_ID;
    if (formData.state_item && formData.state_item.COUNTRY_ID !== selectedCountry) {
      formData.state_item = null;
      formData.city_item = null;
    }
    render();
  }

  function onStatusUnitSelected(item) {
    if (item === t('emOperacao')) {
      formData.PRODUCTION = true;
    } else if (item === t('emInstalacao')) {
      formData.PRODUCTION = false;
    }
    render();
  }

  function onStateSelected(item) {
    formData.state_item = item;
    const selectedState = formData.state_item && formData.state_item.STATE_ID;
    if (formData.city_item && formData.city_item.STATE_ID !== selectedState) {
      formData.city_item = null;
    }
    render();
  }

  const filtStates = useMemo(() => {
    if (!formData.country_item) return states;
    return states.filter((state) => state.COUNTRY_ID === formData.country_item!.COUNTRY_ID);
  }, [formData.country_item, states]);

  const filtCities = useMemo(() => {
    if (!formData.state_item) return cities;
    return cities.filter((city) => city.STATE_ID === formData.state_item!.STATE_ID);
  }, [formData.state_item, cities]);

  const unitStatus = [
    t('emInstalacao'),
    t('emOperacao'),
  ];

  function clearEnergyForm(index: number) {
    state.energyMetersData[index].selectedMeterModel = null;
    state.energyMetersData[index].meterDriId = '';
    state.energyMetersData[index].meterSerial = '';
    state.energyMetersData[index].selectedCurrentCapacity = null;
    state.energyMetersData[index].filteredModelsList = [];
    render();
  }

  function onDateChange(date, dateEnd) {
    state.installationDate = date;
    render();
  }

  function setUnitStatus(status: boolean|null) {
    if (status === true) {
      return t('emOperacao');
    } if (status === false) {
      return t('emInstalacao');
    }
    return null;
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
          <Form onSubmit={handleSubmit(handleFormSubmition)} style={{ width: '100%' }}>
            <div>
              <span
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '115%',
                }}
              >
                {t('adicionarUnidade')}
              </span>
              <div style={{ paddingTop: '20px', paddingBottom: '20px' }} data-test-id="botaoAdicionarUnidade">
                <Headers2 links={tabs} />
              </div>
              {tabs[0].isActive
                && (
                  <div>
                    <div style={{ margin: '10px 0px', width: '100%' }}>
                      <Flex maxWidth="640px" flexDirection="row" flexWrap="wrap" justifyContent="space-between" alignItems="center">
                        <span style={{ width: '100%', fontWeight: 'bold', fontSize: '100%' }}>{t('localizacao')}</span>
                        <Input
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          type="text"
                          value={formData.UNIT_NAME}
                          placeholder={t('nomeDaUnidade')}
                          label={t('unidade')}
                          onChange={(event) => { formData.UNIT_NAME = event.target.value; render(); }}
                          data-test-id="nomeUnidade"
                        />
                        <Input
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          type="text"
                          value={formData.UNIT_CODE_CELSIUS}
                          placeholder={t('digitarCodigo')}
                          label={t('codigoDaUnidadeCelsius')}
                          onChange={(event) => { formData.UNIT_CODE_CELSIUS = event.target.value; render(); }}
                          data-test-id="codigoDaUnidadeCelsius"
                        />
                        <SelectNew
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          options={countries}
                          propLabel="COUNTRY_NAME"
                          value={formData.country_item}
                          label={t('pais')}
                          onSelect={onCountrySelected}
                          data-test-id="selectPais"
                        />
                        <Input
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          type="text"
                          value={formData.UNIT_CODE_API}
                          placeholder={t('digitarCodigo')}
                          label={t('codigoDaUnidadeApi')}
                          onChange={(event) => { formData.UNIT_CODE_API = event.target.value; render(); }}
                          data-test-id="codigoDaUnidadeApi"
                        />
                        <SelectNew
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          options={filtStates}
                          propLabel="STATE_ID"
                          value={formData.state_item}
                          label={t('estado')}
                          onSelect={onStateSelected}
                          disabled={!formData.country_item}
                          data-test-id="selectEstado"
                        />
                        <SelectNew
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          options={filtCities}
                          propLabel="CITY_NAME"
                          value={formData.city_item}
                          label={t('cidade')}
                          onSelect={(item) => { formData.city_item = item; render(); }}
                          disabled={!formData.state_item}
                          data-test-id="selectCidade"
                        />
                        <SelectMultiple
                          style={{ margin: '10px 0px 16px 0px', height: '50px', width: '300px' }}
                          options={usersList}
                          propLabel="FULLNAME"
                          values={state.supervisors}
                          label={t('responsaveis')}
                          placeholder={t('selecioneOsResponsaveis')}
                          onSelect={
                            (item, list, newValues) => {
                              setState({ supervisors: newValues });
                            }
                          }
                          data-test-id="selectResponsaveis"
                        />
                        <SelectNew
                          style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                          options={timezones}
                          value={formData.timezone.area}
                          label={t('fusoHorario')}
                          notNull
                          onSelect={(e) => { formData.timezone = { area: e.label, id: e.value }; render(); }}
                          data-test-id="selectFuso"
                        />
                        <Input
                          style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                          type="text"
                          value={formData.LAT}
                          label="Latitude"
                          onChange={(event) => { formData.LAT = event.target.value; render(); }}
                          data-test-id="latitude"
                        />
                        <Input
                          style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                          type="text"
                          value={formData.LON}
                          label="Longitude"
                          onChange={(event) => { formData.LON = event.target.value; render(); }}
                          data-test-id="longitude"
                        />
                        <SelectNew
                          style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                          options={unitStatus}
                          value={setUnitStatus(formData.PRODUCTION)}
                          label={t('statusDaUnidade')}
                          placeholder={t('selecioneOStatusDaUnidade')}
                          onSelect={onStatusUnitSelected}
                          disabled={!!(isEdit && formData.PRODUCTION)}
                          data-test-id="selectStatus"
                        />
                        <Input
                          style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                          type="number"
                          value={formData.AMOUNT_PEOPLE}
                          placeholder={t('numeroPessoas')}
                          label={t('numeroPessoas')}
                          onChange={(event) => { formData.AMOUNT_PEOPLE = event.target.value; render(); }}
                        />
                        <CustomInputConstructedArea>
                          <Input
                            style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                            type="number"
                            value={formData.CONSTRUCTED_AREA ?? ''}
                            placeholder={t('digiteOValorEmM')}
                            label={t('areaConstruida')}
                            onChange={(event) => {
                              formData.CONSTRUCTED_AREA = event.target.value;
                              render();
                            }}
                            suffix="m²"
                          />
                        </CustomInputConstructedArea>
                        <span style={{
                          width: '100%', fontWeight: 'bold', fontSize: '100%', marginTop: '16px',
                        }}
                        >
                          {t('outrosDados')}
                        </span>
                        <Input
                          style={{ margin: '10px 0px 16px 0px', width: '300px', height: '50px' }}
                          type="text"
                          value={formData.TARIFA_KWH}
                          placeholder={`${t('tarifaMedia')} (R$/kWh)`}
                          onChange={(event) => { formData.TARIFA_KWH = event.target.value; render(); }}
                          data-test-id="tarifaMedia"
                        />
                      </Flex>

                    </div>

                  </div>
                )}
              {tabs[1].isActive
              && (
              <div>

                <Tabs links={energyTabs} />
                <div style={{ paddingTop: '10px' }} />

                <div style={{ margin: '30px 200px 40px', width: '95%' }} />
                {
                  energyTabs[1].isActive && (
                    <ContentEnergyMeter>
                      {state.energyMetersData.map((meter, index) => <EnergyMeterForm state={state} render={render} checkMultipleEnergyMeters={checkMultipleEnergyMeters} clearEnergyForm={clearEnergyForm} key={index} index={index} clientId={clientId} unitInfo={unitInfo} />) }
                      {(state.energyMetersData.length < 4 && state.isAllEnergyMetersFromDiel) && (
                      <p
                        style={{
                          color: colors.Blue300, textDecoration: 'underline', left: '-50px', position: 'relative',
                        }}
                        onClick={() => {
                          if (state.energyMetersData.length < 4) {
                            state.energyMetersData.push({
                              selectedManufacturer: null,
                              selectedMeterModel: null,
                              filteredModelsList: [],
                              meterDriId: '',
                              meterSerial: '',
                              selectedCurrentCapacity: null,
                              selectedInstallationType: null,
                              nameOfEstablishment: '',
                            });
                            render();
                          }
                        }}
                      >
                        Cadastrar novo medidor

                      </p>
                      )}
                    </ContentEnergyMeter>
                  )
                }
                {energyTabs[0].isActive && (
                <div style={{ minWidth: '700px' }}>
                  <Content>
                    <Flex flexWrap="wrap" flexDirection="column" alignItems="left" ml={-60} mt={-30}>
                      <span
                        style={{
                          textAlign: 'left',
                          fontWeight: 'bold',
                          fontSize: '115%',
                        }}
                      >
                        Distribuidora
                      </span>
                      <div style={{ paddingTop: '15px' }} />
                      <CustomInput>
                        <div style={{ width: '100%', paddingTop: 3 }}>
                          <Label>Distribuidora</Label>
                          <SelectSearch
                            options={state.distributors}
                            value={state.selectedDistributor || formData.distributor?.value.toString() || ''}
                            printOptions="on-focus"
                            search
                            filterOptions={fuzzySearch}
                            placeholder=""
                          // eslint-disable-next-line react/jsx-no-bind
                            onChange={onFilterDistributorChange}
                          // onBlur={onFilterUnitBlur}
                            disabled={state.isLoading}
                            closeOnSelect={false}
                          />
                        </div>
                      </CustomInput>
                      <div style={{ paddingTop: '10px' }} />
                      <Select
                        options={state.accessPointsAvailable}
                        value={state.additionalDistributorInfo || formData.additionalDistributorInfo}
                        placeholder={t('informacaoAdicional')}
                        onSelect={(item) => setState({ additionalDistributorInfo: item })}
                      />
                      <div style={{ paddingTop: '10px' }} />
                      <InputNew
                        placeholder=""
                        isInputFilled={!!watch('consumerUnit')}
                        label={t('unidadeConsumidora')}
                        formLabel="consumerUnit"
                        validation={formValidators.consumerUnit}
                        error={errors.consumerUnit ? errors.consumerUnit.message : undefined}
                        register={register}
                      />
                      <div style={{ paddingTop: '10px' }} />
                      <InputNew
                        placeholder=""
                        isInputFilled={!!watch('login')}
                        label="Login"
                        formLabel="login"
                        validation={formValidators.login}
                        error={errors.login ? errors.login.message : undefined}
                        register={register}
                      />
                      <div style={{ paddingTop: '10px' }} />
                      <div>
                        <CustomInput type={PasswordInputType}>
                          <div style={{ width: '100%', paddingTop: 3 }}>
                            <InputNew
                              placeholder=""
                              isInputFilled={!!watch('password')}
                              label={t('senha')}
                              formLabel="password"
                              type={PasswordInputType}
                              validation={formValidators.password}
                              error={errors.password ? errors.password.message : undefined}
                              register={register}
                              style={{ width: '100%', border: '0px' }}
                            />
                          </div>
                          <IconWrapper>
                            {ToggleIcon}
                          </IconWrapper>
                        </CustomInput>
                      </div>
                      <div style={{ paddingTop: '10px' }} />
                      <InputNew
                        placeholder=""
                        isInputFilled={!!watch('loginExtra')}
                        label={t('loginExtra')}
                        formLabel="loginExtra"
                        validation={formValidators.loginExtra}
                        error={errors.loginExtra ? errors.loginExtra.message : undefined}
                        register={register}
                      />
                    </Flex>
                    {
                      props.rateModels ? (
                        <Flex>
                          <CicleDetail rateModels={props.rateModels} formUnitState={state} />
                        </Flex>
                      )
                        : (
                          <h3 style={{ marginRight: '70px' }}>
                            Nenhum modelo de tarifa criado
                          </h3>
                        )
                    }
                  </Content>
                  <BaseLinesBool onClick={() => {
                    state.isBaselineOpen = !state.isBaselineOpen;
                    render();
                  }}
                  >
                    { state.isBaselineOpen ? (<ArrowUpIcon />) : (<ArrowDownIcon />) }
                    <div style={{ width: '15px' }} />
                    Baseline
                  </BaseLinesBool>
                  {
                    state.isBaselineOpen && (
                      <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="87%" ml={20} mt={-40}>
                        <FormEditBaselines
                          CLIENT_ID={clientId}
                          UNIT_ID={formData.UNIT_ID || undefined}
                          onHandlePrice={handlePrice}
                          onHandleKwh={handleKwh}
                          onHandleBaselineTemplate={handleBaselineTemplate}
                          onHandleBaselineId={handleBaselineId}
                          onHandleIsBaselineEdit={handleBaselineEdit}
                          onHandleIsBaselineValuesEdit={handleBaselineValuesEdit}
                        />
                      </Flex>
                    )
                  }
                </div>
                )}
              </div>
              )}
              {tabs[2].isActive
              && (
              <div>
                <div style={{ margin: '30px 100px 40px', width: '95%' }}>

                  <span
                    style={{
                      textAlign: 'left',
                      fontWeight: 'bold',
                      fontSize: '115%',
                    }}
                  >
                    {t('medidorDeAgua')}
                  </span>

                  <Flex maxWidth="800px" flexDirection="row" flexWrap="wrap" justifyContent="space-between" alignItems="center">

                    <SelectNew
                      options={comboHydrometerOptions}
                      value={state.hydrometerModel}
                      onSelect={(item) => {
                        setState({ hydrometerModel: item });
                      }}
                      label={t('hidrometro')}
                      placeholder={t('selecioneHidrometro')}
                      hideSelected
                      style={{ margin: '10px 0px', width: '260px' }}
                    />

                    <Input
                      style={{ margin: '10px 0px', width: '260px', height: '50px' }}
                      type="number"
                      value={state.totalCapacity}
                      label={`${t('capacidadeTotalReservatorios')} (L)`}
                      placeholder={t('capacidadeTotalReservatorios')}
                      onChange={(e) => setState({ totalCapacity: e.target.value })}
                    />

                    <Input
                      style={{ margin: '10px 0px', width: '260px', height: '50px' }}
                      type="number"
                      value={state.totalOfReservoirs}
                      label={t('totalReservatorios')}
                      placeholder={t('quantidadeReservatorios')}
                      onChange={(e) => setState({ totalOfReservoirs: e.target.value })}
                    />
                  </Flex>

                  <span
                    style={{
                      textAlign: 'left',
                      fontWeight: 'bold',
                      fontSize: '115%',
                    }}
                  >
                    {t('dispositivo')}
                  </span>

                  <Flex maxWidth="800px" flexDirection="row" flexWrap="wrap" justifyContent="space-between" alignItems="center">
                    <SelectNew
                      label={t('fabricante')}
                      placeholder={t('selecionarFabricante')}
                      options={['Laager', 'Diel']}
                      propLabel="supplier"
                      value={state.selectedSupplier}
                      onSelect={(item) => {
                        setState({ selectedSupplier: item });
                      }}
                      notNull
                      style={{ margin: '10px 0px', width: '260px' }}
                    />
                    <SelectNew
                      label={t('localInstalacao')}
                      placeholder={t('selecionarLocalInstalacao')}
                      options={comboLocalOptions}
                      value={state.installationLocal}
                      onSelect={(item) => {
                        setState({ installationLocal: item });
                      }}
                      notNull
                      style={{ margin: '10px 0px', width: '260px' }}
                      disabled={!state.selectedSupplier}
                    />
                    <Input
                      style={{ margin: '10px 0px', width: '260px', height: '50px' }}
                      type="text"
                      value={state.otherInstallationLocal}
                      label={t('outroLocal')}
                      placeholder={t('digiteoLocal')}
                      onChange={(e) => setState({ otherInstallationLocal: e.target.value })}
                      disabled={state.installationLocal !== t('outro')}
                    />
                    <Input
                      style={{ margin: '10px 0px', width: '260px', height: '50px' }}
                      type="text"
                      value={state.meterWaterId}
                      label={state.selectedSupplier === 'Laager' ? t('idDoMedidor') : t('idDoDma')}
                      placeholder={t('digiteId')}
                      onChange={(e) => setState({ meterWaterId: e.target.value })}
                      disabled={!state.selectedSupplier}
                    />
                    <ContentDate
                      style={{ margin: '10px 0px', width: '260px' }}
                      disabled={!state.selectedSupplier}

                    >
                      <Label>{t('dataInstalacao')}</Label>
                      <SingleDatePicker
                        date={state.installationDate}
                        onDateChange={onDateChange}
                        focused={state.focused}
                        onFocusChange={({ focused }) => { state.focused = focused; render(); }}
                        id="datepicker"
                        disabled={!state.selectedSupplier}
                        numberOfMonths={1}
                        isOutsideRange={() => false}

                      />
                      <StyledCalendarIcon color="#202370" />
                    </ContentDate>
                  </Flex>

                </div>
                <ModalDisassociate onClick={handleDisassociation}>{t('desassociarDispositivo')}</ModalDisassociate>

              </div>
              )}
              {/* {tabs[3].isActive
              && (
                <>
                  {state.listSimEdit.length > 0 ? (
                    <SimcardContainerList state={state} setState={setState} total botao />
                  ) : (
                    <NoSimcardAdd setState={setState} botao where="abaixo" />
                  )}
                  {
                    state.modalAddSimcard && (
                      <ModalAddSimcard
                        closeModal={() => { setState({ modalAddSimcard: false, isEdit: false, editSim: null }); setFiles([]); }}
                        edit={state.isEdit}
                        editSim={state.editDeleteSim}
                        state={state}
                        setState={setState}
                        unitId={unitInfo?.UNIT_ID}
                        clientId={clientId}
                        files={files}
                        setFiles={setFiles}
                      />
                    )
                  }
                  {
                    state.modalDesc && (
                      <ModalDescSimcard sim={state.itemDesc} closeModal={() => setState({ modalDesc: false })} />
                    )
                  }
                  {
                    state.modalDeleteSim && (
                      <ModalDeleteSimcard closeModal={() => { setState({ modalDeleteSim: false, editDeleteSim: null }); setFiles([]); }} sim={state.editDeleteSim} state={state} setState={setState} />
                    )
                  }
                </>

              )} */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', marginBottom: '20px',
              }}
              >
                <ModalCancel onClick={onCancel} data-test-id="botaoCancelarUnidade">{t('botaoCancelar')}</ModalCancel>
                {/* eslint-disable-next-line react/jsx-no-bind */}
                <Button
                  type="submit"
                  style={{ width: '200px' }}
                  variant="primary"
                  onClick={() => {
                    if (queryPars.aba === 'energia') {
                      handleSubmitEnergyMeterInfo();
                    } else if (queryPars.aba === 'water') {
                      handleSubmitWaterMeterInfo();
                    } else if (queryPars.aba === 'simcard') {
                      SubmitSimcards();
                    } }}
                  data-test-id="botaoSalvarUnidade"
                >
                  {t('salvarDados')}
                </Button>
                {/* @ts-ignore */}
              </div>
            </div>
          </Form>
        </div>
      )
  );
};

const Infos = ({ label, value }) => (
  <InfoSIMCARD>
    <label>{label}</label>
    <p>{value || '-'}</p>
  </InfoSIMCARD>
);

export function SimcardContainerList({
  state, setState, total, botao,
}) {
  const newArraySort = state.listSimEdit.sort((a, b) => {
    if (a.ICCID > b.ICCID) {
      return 1;
    }
    if (a.ICCID < b.ICCID) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  return (
    <div style={{ width: '100%' }}>
      {
        total && (
          <div style={{ display: 'flex', justifyContent: 'end', fontSize: 10 }}>
            <p><strong>Total Adicionado:</strong></p>
            <span>{state.listSimEdit.length > 1 ? ` ${state.listSimEdit.length} SIMCARDS` : ` ${state.listSimEdit.length} SIMCARD`}</span>
          </div>
        )
      }
      <div
        style={{
          minHeight: 300, borderRadius: 5, border: '1px solid rgba(197, 197, 197, 0.56)', padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {
            newArraySort.map((sim, index) => (
              <div
                key={sim.ID || sim.ICCID}
                style={{
                  padding: 10, display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, minWidth: '60%',
                  }}
                >
                  <SimcardIcon />
                  <div
                    style={{
                      display: 'flex', flexDirection: 'column', fontSize: 11, lineHeight: 'normal', width: 150,
                    }}
                  >
                    <strong
                      style={{
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {sim.ICCID}
                    </strong>
                    <span>{`SIMCARD ${index + 1}`}</span>
                  </div>
                </div>
                <ContainerIconsSimcard>
                  <ContainerDescEditSim>
                    <div onClick={() => setState({ modalDesc: true, itemDesc: sim })}>
                      <PaperBloomIcon />
                    </div>
                    <div onClick={() => setState({ modalAddSimcard: true, isEdit: true, editDeleteSim: sim })}>
                      <EditPenPaperIcon />
                    </div>
                  </ContainerDescEditSim>
                  <div onClick={() => setState({ modalDeleteSim: true, editDeleteSim: sim })}>
                    <DeleteTrashIcon />
                  </div>
                </ContainerIconsSimcard>
              </div>
            ))
          }
        </div>
        {
          botao && (
            <Button type="button" onClick={() => setState({ modalAddSimcard: true })} variant="borderblue" style={{ height: 30, padding: 0, fontSize: 10 }}>
              {t('adicionarNovoSimcard')}
            </Button>
          )
        }
      </div>
    </div>
  );
}

export function NoSimcardAdd({ setState, botao, where }) {
  return (
    <div
      style={{
        width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#F9F9F9', minHeight: 300, borderRadius: 5, color: '#7D7D7D', padding: 10,
      }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 100,
        }}
      >
        <SimcardIcon width="21" height="27" color="#7D7D7D" />
        <span style={{ fontSize: 12, marginTop: 5 }}><strong>{t('unidadesemSimcards')}</strong></span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>{t('Paraadicionarcliqueno')}</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>
          {t('botão')}
          {' '}
          {t(where)}
        </span>
      </div>
      {
        botao && (
          <Button type="button" onClick={() => setState({ modalAddSimcard: true })} variant="borderblue" style={{ height: 30, padding: 0, fontSize: 10 }}>
            {t('adicionarNovoSimcard')}
          </Button>
        )
      }
    </div>
  );
}

export function ModalDeleteSimcard({
  closeModal, sim, state, setState,
}) {
  function removeFromArray() {
    const newArray = state.listSimEdit.filter((simCard) => simCard.ICCID !== sim.ICCID);
    setState({
      listSimEdit: [...newArray],
      deleteSims: [...state.deleteSims, { ICCID: sim.ICCID, OLDICCID: sim.OLDICCID }],
    });
    closeModal();
  }

  return (
    <ModalWindow borderTop onClickOutside={() => closeModal()} style={{ width: 355, padding: '20px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <DeleteTrashIcon />
        <span><strong>Deletar SIMCARD</strong></span>
      </div>
      <p style={{ marginLeft: 20 }}>
        Tem certeza que deseja deletar o SIMCARD
        <br />
        <strong>{sim.ICCID}</strong>
        ?
      </p>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%',
        }}
      >
        <Button
          variant="secondary"
          style={{
            padding: 5, width: 120, height: '30px', fontSize: 12,
          }}
          type="button"
          onClick={() => removeFromArray()}
        >
          {t('deletar')}
        </Button>
        <ModalCancel style={{ margin: 0, width: 70 }} onClick={() => closeModal()}>{t('botaoCancelar')}</ModalCancel>
      </div>
    </ModalWindow>
  );
}

export function ModalDescSimcard({ sim, closeModal }) {
  return (
    <ModalWindow borderTop onClickOutside={() => closeModal()} style={{ width: 355, padding: '10px 30px' }}>
      <h3><strong>Visualizar SIMCARD</strong></h3>
      <div style={{ padding: 20 }}>
        <Infos label="ICCID" value={sim.ICCID} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Infos label={t('pontoAcesso')} value={sim.ACCESSPOINT} />
          <Infos label={t('modem')} value={sim.MODEM} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Infos label={`MAC - ${t('pontoAcesso')}`} value={sim.MACACCESSPOINT} />
          <Infos label={`MAC - ${t('repetidor')}`} value={sim.MACREPEATER} />
        </div>
      </div>
      <h4><strong>Fotos do SIMCARD</strong></h4>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          sim.IMAGES.map((item) => (
            <div
              key={item.preview || item.url}
              style={{
                width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginRight: 5, marginBottom: 10,
              }}
            >
              <img
                src={item.preview || item.url}
                style={{
                  width: 90, height: 90, borderRadius: 10, objectFit: 'cover',
                }}
                onDoubleClick={() => downloadFile(item.preview || item.url, item.name || item.filename, !!item.url)}
              />
            </div>
          ))
        }
      </div>

      <ModalCancel onClick={() => closeModal()}>{t('fechar')}</ModalCancel>
    </ModalWindow>
  );
}

function downloadFile(url, fileName, baix) {
  if (baix) {
    window.open(url, '_blank');
  } else {
    fetch(url, { method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer' })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement('a');
        aElement.setAttribute('download', fileName);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute('target', '_blank');
        aElement.click();
        URL.revokeObjectURL(href);
      });
  }
}

export function ModalAddSimcard({
  closeModal, edit, editSim, state, setState, unitId, clientId, files, setFiles,
}) {
  const [stateAdd, _render, setStateAdd] = useStateVar({
    iccid: '',
    pontoAcesso: '',
    modem: '',
    macPontoAcesso: '',
    macRepetidor: '',
    dropzoneArea: false,
    files: [] as any[],
    oldFiles: [] as any[],
    filesEditDelete: [] as any[],
  });

  useEffect(() => {
    if (edit) {
      setStateAdd({
        iccid: editSim?.ICCID,
        pontoAcesso: editSim?.ACCESSPOINT,
        modem: editSim?.MODEM,
        macPontoAcesso: editSim?.MACACCESSPOINT,
        macRepetidor: editSim?.MACREPEATER,
        dropzoneArea: false,
        oldFiles: editSim?.IMAGES,
      });
    }
  }, []);

  function addInArraySimcard() {
    if (!edit) {
      if (state.listSimEdit.find((sim) => stateAdd.iccid === sim.ICCID) || !stateAdd.iccid) {
        toast.error('ICCID já existente na Unidade ou Vazio');
        return;
      }
      setState({
        listSimEdit: [...state.listSimEdit, {
          ICCID: stateAdd.iccid,
          OLDICCID: stateAdd.iccid,
          CLIENT: clientId,
          UNIT: unitId,
          ACCESSPOINT: stateAdd.pontoAcesso,
          MODEM: stateAdd.modem,
          MACACCESSPOINT: stateAdd.macPontoAcesso,
          MACREPEATER: stateAdd.macRepetidor,
          IMAGES: [...stateAdd.files, ...stateAdd.oldFiles],
        }],
      });
    } else {
      const newArray = state.listSimEdit.filter((sim) => sim.ICCID !== editSim.ICCID);
      setState({
        listSimEdit: [...newArray, {
          ICCID: stateAdd.iccid,
          OLDICCID: editSim?.ICCID,
          CLIENT: clientId,
          UNIT: unitId,
          ACCESSPOINT: stateAdd.pontoAcesso,
          MODEM: stateAdd.modem,
          MACACCESSPOINT: stateAdd.macPontoAcesso,
          MACREPEATER: stateAdd.macRepetidor,
          IMAGES: [...stateAdd.files, ...stateAdd.oldFiles],
        }],
      });
    }
    for (const file of stateAdd.files) {
      setState({
        listAddPhotos: [...state.listAddPhotos, { iccid: stateAdd.iccid, file }],
      });
    }
    setState({
      deleteListPhotos: [...state.deleteListPhotos, ...stateAdd.filesEditDelete],
    });
    closeModal();
    setFiles([]);
  }

  function deleteImageArray(image) {
    let array;
    let oldArray;
    if (image.url && image.name) {
      setStateAdd({
        filesEditDelete: [...stateAdd.filesEditDelete, {
          filename: image.name,
          iccid: stateAdd.iccid,
        }],
      });
      array = stateAdd.files.filter((item) => item.url !== image.url);
      oldArray = stateAdd.oldFiles.filter((item) => item.url !== image.url);
    } else {
      array = stateAdd.files.filter((item) => item.preview !== image.preview);
      oldArray = stateAdd.oldFiles.filter((item) => item.preview !== image.preview);
    }
    setStateAdd({
      files: array,
      oldFiles: oldArray,
    });
  }

  return (
    <ModalWindow borderTop onClickOutside={() => closeModal()} style={{ width: 400, padding: 40 }}>
      <h3><strong>{!edit ? t('adicionarSIMCARD') : t('editarSIMCARD')}</strong></h3>
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0px',
        }}
      >
        <Input
          style={{ border: '1px solid rgba(197, 197, 197, 0.56)' }}
          value={stateAdd.iccid}
          label="ICCID"
          placeholder="Digitar"
          onChange={(e) => setStateAdd({ iccid: e.target.value })}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            style={{ border: '1px solid rgba(197, 197, 197, 0.56)' }}
            value={stateAdd.pontoAcesso}
            label={t('pontoAcesso')}
            placeholder="Digitar"
            onChange={(e) => setStateAdd({ pontoAcesso: e.target.value })}
          />
          <Input
            style={{ border: '1px solid rgba(197, 197, 197, 0.56)' }}
            value={stateAdd.modem}
            label={t('modem')}
            placeholder="Digitar"
            onChange={(e) => setStateAdd({ modem: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            style={{ border: '1px solid rgba(197, 197, 197, 0.56)' }}
            value={stateAdd.macPontoAcesso}
            label={`MAC - ${t('pontoAcesso')}`}
            placeholder="Digitar"
            onChange={(e) => setStateAdd({ macPontoAcesso: e.target.value })}
          />
          <Input
            style={{ border: '1px solid rgba(197, 197, 197, 0.56)' }}
            value={stateAdd.macRepetidor}
            label={`MAC - ${t('repetidor')}`}
            placeholder="Digitar"
            onChange={(e) => setStateAdd({ macRepetidor: e.target.value })}
          />
        </div>
      </div>
      <h4><strong>Fotos do SIMCARD</strong></h4>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', width: '100%', alignItems: 'center', marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {
            ([...stateAdd.files, ...stateAdd.oldFiles] || []).map((item) => (
              <div
                key={item.preview || item.url}
                style={{
                  display: 'flex', flexDirection: 'column', marginRight: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
                }}
              >
                <img
                  src={item.preview || item.url}
                  style={{
                    width: 90, height: 90, borderRadius: 10, objectFit: 'cover',
                  }}
                  onDoubleClick={() => downloadFile(item.preview || item.url, item.name || item.filename, !!item.url)}
                />
                <div onClick={() => deleteImageArray(item)}>
                  <DeleteTrashIcon />
                </div>
              </div>
            ))
          }
        </div>
        <div
          style={{
            fontSize: 20,
            backgroundColor: '#C4C4C4',
            color: 'white',
            width: 30,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
            fontWeight: 'bold',
            height: 30,
            margin: 10,
          }}
          onClick={() => setStateAdd({ dropzoneArea: true })}
        >
          <span style={{ paddingBottom: 5 }}>+</span>
        </div>
      </div>
      {
        stateAdd.dropzoneArea && (
          <ModalWindow borderTop onClickOutside={() => { setStateAdd({ dropzoneArea: false }); setFiles([]); }} style={{ width: 400, padding: 20 }}>
            <h3>
              <strong>Adicionar fotos: </strong>
              <strong style={{ color: 'gray', fontSize: 10 }}>(png, jpeg, jpg)</strong>
            </h3>
            <DropzoneArea maxFiles={3} files={files} fileDropped={setFiles} title="Arraste no máximo 3 imagens, ou" extensions={{ image: ['.jpeg', '.png', '.jpg'] }} />
            <ModalCancel onClick={() => { setStateAdd({ dropzoneArea: false }); setFiles([]); }}>{t('botaoCancelar')}</ModalCancel>
            <Button variant="blue" type="button" onClick={() => { setStateAdd({ dropzoneArea: false, files: [...stateAdd.files, ...files] }); setFiles([]); }}>Adicionar</Button>
          </ModalWindow>
        )
      }
      <Button variant="blue" type="button" onClick={() => addInArraySimcard()}>{!edit ? t('adicionarSIMCARD') : t('salvarEdicao')}</Button>
      <ModalCancel style={{ margin: 0, width: 70 }} onClick={() => { closeModal(); setFiles([]); }}>{t('botaoCancelar')}</ModalCancel>
    </ModalWindow>
  );
}
