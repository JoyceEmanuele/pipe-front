import {
  ReactElement, useCallback, useEffect, useMemo, useState,
} from 'react';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import EcoV2 from '~/assets/img/EcoV2.png';
import BackupEcoV2DamDac from '~/assets/img/BackupEcoV2DamDac.png';
import { Image } from 'antd';
import {
  ControlMode, ScheduleDut, ExceptionDut, FullProg_v4,
} from '../../../../providers/types/api-private';
import {
  Loader,
  Checkbox,
  Input,
  InputCalculator,
  ScheduleViewCard,
  ExceptionViewCard,
  Button,
  ScheduleEditCard,
  ExceptionEditCard,
  ModalWindow,
} from 'components';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { getCachedDevInfo } from 'helpers/cachedStorage';
import { apiCall, ApiParams } from 'providers';
import { CheckboxIcon, InformationIcon } from 'icons';
import ReactTooltip from 'react-tooltip';

import { FullProgEdit } from '../../SchedulesModals/FullProgEdit';

import {
  Label,
  IconWrapper,
  ElevatedCard,
  CustomSelect,
  TextLine,
  OverLay,
  StyledCalendarIcon,
} from './styles';
import { SingleDatePicker } from 'react-dates';
import { identifyDutIrCommands } from '../../DUTs/EnvironmentRealTime';
import { useTranslation, Trans } from 'react-i18next';
import { ContentDate } from '~/pages/Overview/Default/styles';
import { Moment } from 'moment';
import { IlluminationMultipleProg } from './IlluminationMultipleProg';
import { isFwVersionGreatestOrEqual } from '~/helpers';
import { getCitiesList, getStatesList, getUnitsList } from '~/helpers/genericHelper';
import { parseDamList, parseDutList } from './MultipleDevProg/helpers/parseDevices';
import { sortDam, sortDut } from './MultipleDevProg/helpers/sortDevices';
import { DutFilter, SelectedFilterDutOptions } from './MultipleDevProg/DutFilter';
import { DutTable } from './MultipleDevProg/DutTable';
import { SelectAllDevices } from './MultipleDevProg/components/SelectAllDevices';
import {
  isAllDevicesSelected, verifyValueDefinedNotEmpty, toggleSelectAllDevices, checkDecimalPlace,
} from './MultipleDevProg/helpers/verifications';
import { batchRequests } from 'helpers/batchRequests';
import {
  DacList,
  DamList, DevList, DevProperties, DutList, DutReferenceList, DutError, DutOffline,
  Dut,
  Dam,
  DamOffline,
} from './MultipleDevProg/types';
import {
  dacDamEcoDetails, daysOfWeek, defaultFormData, ecoModeDetails, initialProg, limitDamScheduleDevices, limitDutScheduleDevices, temprtControlModeDetails,
} from './MultipleDevProg/constants';
import { DamTable } from './MultipleDevProg/DamTable';
import { DamFilter, SelectedFilterDamOptions } from './MultipleDevProg/DamFilter';
import { DefaultDeviceTable } from './MultipleDevProg/DefaultDeviceTable';
import { SelectDevType } from './MultipleDevProg/components/SelectDevType';
import { ProgrammingProgress } from './MultipleDevProg/components/ProgrammingProgress';
import { ExceptionsHeader } from '../../SchedulesModals/components/ExceptionsHeader';

export const MultipleDevProg = (props: {
  unitId?: number,
  clientId?: number,
  type?: string,
}): JSX.Element => {
  const { unitId, clientId, type } = props;
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [date, setDate] = useState<Moment|null>(null);
  const [calendarFocused, setCalendarFocused] = useState(false);
  const [state, render, setState] = useStateVar({
    unitId: Number(unitId),
    clientId: Number(clientId),
    isLoading: true,
    isSending: false,
    isFiltering: false,
    unitInfo: {} as { UNIT_ID: number, UNIT_NAME: string, hasNess: boolean, hasOxyn: boolean, hasVrf: boolean },
    dacsList: [] as DacList[],
    damsList: [] as DamList[],
    dutsList: [] as DutList[],
    dutsListToReference: [] as DutReferenceList[],
    selectedDevType: '',
    // initialProg: null as null|FullProg_v4,
    initialProg,
    hysteresisChecked: false as boolean,
    // expectedProgS: null as null|string,
    temperatureControlState: null as null|{ automationEnabled: boolean, mode: string, temperature: number, LTC: number },
    formData: defaultFormData,
    comboOpts: {
      yesNo: [
        {
          label: 'Sim', value: '1', valueN: 1, valueNinv: 0,
        },
        {
          label: 'Não', value: '0', valueN: 0, valueNinv: 1,
        },
      ] as { label: string, value: string, valueN: 0|1, valueNinv: 0|1 }[],
      dutAutCfg: [
        { label: t('infraVermelhoPadrao'), value: 'IR' },
        { label: t('rele'), value: 'RELAY' },
        { label: t('nao'), value: 'DISABLED' },
      ] as { label: string, value: 'IR'|'RELAY'|'DISABLED' }[],
      optionsEco: [
        {
          label: 'Sim', value: '1', valueN: 1, valueNinv: 0,
        },
        // {
        //   label: 'Sim, Eco 2', value: '2', valueN: 2, valueNinv: 2,
        // },
        // Temporário: Inicialmente só será permitido utilização de novo modo em dispositivos previamente selecionados. Sendo assim por enquanto
        // tal opção estará desativada da programação múltipla.
        {
          label: 'Não', value: '0', valueN: 0, valueNinv: 1,
        },
      ] as { label: string, value: string, valueN: 0|1|2, valueNinv: 0|1|2 }[],
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
        { label: '1. AC com Pliq', value: { DAC_APPL: 'ar-condicionado', hasPliq: true, hasPsuc: false } },
        { label: '2. AC com Psuc', value: { DAC_APPL: 'ar-condicionado', hasPliq: false, hasPsuc: true } },
        { label: '3. AC com Pliq e Psuc', value: { DAC_APPL: 'ar-condicionado', hasPliq: true, hasPsuc: true } },
        { label: '4. AC sem Pliq e Psuc', value: { DAC_APPL: 'ar-condicionado', hasPliq: false, hasPsuc: false } },
        { label: '5. CF com Pliq', value: { DAC_APPL: 'camara-fria', hasPliq: true, hasPsuc: false } },
        { label: '6. CF com Psuc', value: { DAC_APPL: 'camara-fria', hasPliq: false, hasPsuc: true } },
        { label: '7. CF com Pliq e Psuc', value: { DAC_APPL: 'camara-fria', hasPliq: true, hasPsuc: true } },
        { label: '8. CF sem Pliq e Psuc', value: { DAC_APPL: 'camara-fria', hasPliq: false, hasPsuc: false } },
        { label: '9. Fancoil', value: { DAC_APPL: 'fancoil', hasPliq: false, hasPsuc: false } },
        { label: '10. Chiller com Pliq', value: { DAC_APPL: 'chiller', hasPliq: true, hasPsuc: false } },
        { label: '11. Chiller com Psuc', value: { DAC_APPL: 'chiller', hasPliq: false, hasPsuc: true } },
        { label: '12. Chiller com Pliq e Psuc', value: { DAC_APPL: 'chiller', hasPliq: true, hasPsuc: true } },
        { label: '13. Chiller sem Pliq e Psuc', value: { DAC_APPL: 'chiller', hasPliq: false, hasPsuc: false } },
      ],
      capacUnits: [
        { label: 'TR', value: 'TR' },
        { label: 'BTU/hr', value: 'BTU/hr' },
        { label: 'kW', value: 'kW' },
        { label: 'HP', value: 'HP' },
      ],
      placement: [
        { label: 'Ambiente (padrão)', value: 'AMB' },
        { label: 'Insuflamento', value: 'INS' },
      ] as { label: string, value: 'INS'|'AMB' }[],
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
      states: [] as { STATE_NAME: string, STATE_ID: string }[],
      cities: [] as { CITY_NAME: string, CITY_ID: string }[],
      units: [] as { UNIT_NAME: string, UNIT_ID: number }[],
      ecoModeCfg: [] as { label: string, value: string }[],
      groups: [] as { label: string, value: number, withDacAut?: boolean, checked?: boolean, unit: number }[],
      duts: [] as { DEV_ID: string, UNIT_ID: number }[],
      psens: [] as { label: string, value: string }[],
      fluids: [] as { label: string, value: string }[],
      applics: [] as { label: string, value: string }[],
      types: [] as { label: string, value: string, tags: string }[],
      envs: [] as { label: string, value: string, tags: string }[],
      brands: [] as { label: string, value: string }[],
      scheduleStartBehavior: [] as { label: string, value: string}[],
      dutScheduleStartBehavior: [] as { label: string, value: string}[],
      dutScheduleEndBehavior: [] as { label: string, value: string}[],
      dutForcedBehavior: [] as { label: string, value: string}[],
    },
    searchState: [] as { text: string }[],
    showNewParametersDAM3: true as boolean,
    selectedModeToDut: null as null|'0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED'|'8_ECO_2',
    isSaving: false,
    showExceptions: false as boolean,
    dutCompatibilityHysteresisEco2: true as boolean,
    DUTS_SCHEDULES_TO_ADD: [] as ScheduleDut[],
    DUTS_EXCEPTIONS_TO_ADD: [] as ExceptionDut[],
    openModal: null as null|string,
    selectExceptionDate: false,
    selectedSchedule: null as ScheduleDut|null,
    selectedIndexSchedule: null as number|null,
    selectedException: null as ExceptionDut|null,
    selectedIndexException: null as number|null,
    irCommands: [] as {
      IR_ID: string,
      CMD_NAME: string,
      CMD_TYPE: string|null,
      TEMPER: number
    }[],
    DUTS_SCHEDULES: [] as ScheduleDut[],
    filteredDevList: [] as DevList[],
    unitsListOpts: [] as {name: string, value: string, clientId: number}[],
    statesListOpts: [] as {name: string, value: string}[],
    citiesListOpts: [] as {name: string, value: string}[],
    selectedCityOpts: [] as string[],
    selectedUnitOpts: [] as string[],
    selectedStateOpts: [] as string[],
  });
  const [progressState, setProgressState] = useState({
    currentDevices: 0,
    totalDevices: 0,
  });

  function formatDutsList(dutsList: Dut[]): DutList[] {
    return dutsList.map((dut) => parseDutList(dut)).sort(sortDut);
  }

  const getDevBySelectedType = (): DevList[] => {
    if (state.selectedDevType === 'DAM') {
      return state.damsList;
    }
    if (state.selectedDevType === 'DUT') {
      return state.dutsList;
    }
    return [];
  };

  function formatDamsList(damsList: Dam[]): DamList[] {
    return damsList.map((dam) => parseDamList(dam)).sort(sortDam);
  }

  const getUnitDevicesInfoByUnitId = async (unitId: number) => {
    const { list: dacsList } = await apiCall('/dac/get-dacs-list', { unitId });
    const { list: damsList } = await apiCall('/dam/get-dams-list', { unitIds: [unitId], removeIlluminations: true });
    const { list: dutsList } = await apiCall('/dut/get-duts-list', { unitId, onlyWithAutomation: true });
    const { list: dutsListToReference } = await apiCall('/dut/get-duts-list', { unitId });
    state.dacsList = dacsList;
    state.damsList = damsList.map((dam) => parseDamList(dam));
    state.dutsList = dutsList.map((dut) => parseDutList(dut));

    for (const dut of dutsListToReference) {
      if (!dut.ROOM_NAME) { dut.ROOM_NAME = dut.DEV_ID; }
    }
    // DUTS QA não podem ser selecionados para serem referências de temperatura.
    // Atualmente, o único critério confiável que eu descobri é se o DUT tiver variáveis de umidade e CO2.
    // Isso implica que o DUT QA ainda aparecerá na lista antes de começar a publicar.
    state.dutsListToReference = dutsListToReference.filter((x) => !x.automationEnabled && (!x.VARS?.includes('HD')));
  };

  const getDacsList = async (clientId: number) => {
    const { list: dacsList } = await apiCall('/dac/get-dacs-list', { clientId });
    state.dacsList = dacsList;
  };

  const getDutsToReference = async (clientId: number) => {
    if (state.dutsListToReference.length > 0) {
      return;
    }

    const { list: dutsList } = await apiCall('/dut/get-duts-list', { clientId });
    const dutsListToReference: DutReferenceList[] = [];

    for (const dut of dutsList) {
      if (dut.automationEnabled || (dut.VARS && dut.VARS.includes('HD'))) {
        continue;
      }

      dutsListToReference.push({
        ...dut,
        ...(!dut.ROOM_NAME ? { ROOM_NAME: dut.DEV_ID } : {}),
      });
    }

    state.dutsListToReference = dutsListToReference;
  };

  const getStateUnitCitiesList = async (clientId: number): Promise<void> => {
    if (state.unitsListOpts.length > 0 && state.statesListOpts.length > 0 && state.citiesListOpts.length > 0) {
      return;
    }

    await Promise.all([
      getStatesList(state, render),
      getUnitsList(state, render),
      getCitiesList(state, render),
    ]);
    state.unitsListOpts = state.unitsListOpts.filter((unit) => unit.clientId === clientId);
  };

  const clearDevsLists = (): void => {
    if (state.dacsList.length > 0) { state.dacsList = []; }
    if (state.dutsList.length > 0) { state.dutsList = []; }
    if (state.damsList.length > 0) { state.damsList = []; }
    if (state.dutsListToReference.length > 0) { state.dutsListToReference = []; }
    if (state.filteredDevList.length > 0) { state.filteredDevList = []; }
  };

  const getUnitDevicesInfoByClientId = async (clientId: number): Promise<void> => {
    clearDevsLists();
    const promises: (() => Promise<unknown>)[] = [];

    if (state.selectedDevType === 'DUT') {
      promises.push(() => getStateUnitCitiesList(clientId));
    }

    if (state.selectedDevType === 'DAC') {
      promises.push(() => getDacsList(clientId));
    }

    await Promise.all(promises.map((p) => p()));
    render();
  };

  const verifyShowNewParametersDAM3 = (): void => {
    state.showNewParametersDAM3 = state.selectedDevType === 'DAM' && !!state.filteredDevList.some((dam) => !!(dam as DamList).CAN_SELF_REFERENCE);
  };

  async function getUnitDevicesInfo() {
    try {
      setState({ isLoading: true });
      if (unitId) {
        await getUnitDevicesInfoByUnitId(unitId);
        state.filteredDevList = getDevBySelectedType();
        render();
      }
      if (clientId) {
        await getUnitDevicesInfoByClientId(clientId);
      }
    } catch (err) {
      console.log(err);
      if (unitId) {
        toast.error('Não foi possível obter informações sobre os dispositivos da unidade');
      }
      if (clientId) {
        toast.error('Não foi possível obter informações sobre os dispositivos do cliente');
      }
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    if (type === 'iluminacao') {
      state.selectedDevType = 'Iluminação';
    } else if (type === 'dam') {
      state.selectedDevType = 'DAM';
    } else if (type === 'dut') {
      state.selectedDevType = 'DUT';
    } else if (type === 'dac') {
      state.selectedDevType = 'DAC';
    }
    render();
    getUnitDevicesInfo();
  }, [state.selectedDevType]);

  const onFilterDevChange = useCallback((devType): void => {
    state.selectedDevType = devType;
    const reqCombos = {
      ecoModeCfg: true,
      scheduleStartBehavior: true,
      dutScheduleStartBehavior: true,
      dutScheduleEndBehavior: true,
      dutForcedBehavior: true,
    };
    apiCall('/dev/dev-info-combo-options', reqCombos).then((response) => {
      Object.assign(state.comboOpts, response);
    });
    state.formData = defaultFormData;
    state.filteredDevList = [];
    state.formData.ECO_CFG_item = null;
    state.formData.ECO_SCHEDULE_START_BEHAVIOR_item = null;
    render();
  }, []);

  function increaseDecrease(value: string) {
    setFormData({ TSETPOINT: value });
  }

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

  function editSchedule(cardPosition: number) {
    state.selectedSchedule = state.DUTS_SCHEDULES_TO_ADD[cardPosition];
    state.selectedIndexSchedule = cardPosition;
    state.openModal = 'add-edit-schedule';

    render();
  }

  function deleteSchedule(scheduleId: number|null, cardPosition: number) {
    state.DUTS_SCHEDULES_TO_ADD = state.DUTS_SCHEDULES_TO_ADD.filter((_schedule, index) => index !== cardPosition);
    render();
  }

  function saveSchedule(schedule: ScheduleDut, cardPosition: number|null) {
    if (cardPosition != null) {
      state.DUTS_SCHEDULES_TO_ADD[cardPosition] = schedule;
    }
    else {
      state.DUTS_SCHEDULES_TO_ADD.push(schedule);
    }
    render();
  }

  function saveException(exception: ExceptionDut, cardPosition: number|null) {
    if (cardPosition != null) {
      state.DUTS_EXCEPTIONS_TO_ADD[cardPosition] = exception;
    }
    else {
      state.DUTS_EXCEPTIONS_TO_ADD.push(exception);
    }
    render();
  }

  function editException(cardPosition: number) {
    state.selectedException = state.DUTS_EXCEPTIONS_TO_ADD[cardPosition];
    state.selectedIndexException = cardPosition;
    state.openModal = 'add-edit-exception';

    render();
  }

  function deleteException(exceptionId: number|null, cardPosition: number) {
    state.DUTS_EXCEPTIONS_TO_ADD = state.DUTS_EXCEPTIONS_TO_ADD.filter((_schedule, index) => index !== cardPosition);
    render();
  }

  const damDacEcoV2 = (
    <>
      {state.selectedDevType === 'DAM' && (
        <div>
          <CustomSelect
            options={state.comboOpts.scheduleStartBehavior}
            value={state.formData.ECO_SCHEDULE_START_BEHAVIOR_item}
            placeholder="Comportamento Início Prog Horária"
            onSelect={(item) => setFormData({ ECO_SCHEDULE_START_BEHAVIOR_item: item })}
            notNull
          />
        </div>
      )}
      <div>
        <Input
          label="Intervalo para considerar histereses"
          value={state.formData.ECO_TIME_INTERVAL_HYSTERESIS}
          style={{ width: '250px' }}
          onChange={(e) => setFormData({ ECO_TIME_INTERVAL_HYSTERESIS: e.target.value })}
        />
      </div>
      <div>
        A histerese só será considerada para alterar o estado do dispositivo, quando o intervalo de tempo em relação à mudança de estado anterior tiver sido alcançada.
      </div>
      <div style={{ marginTop: '20px' }}>
        <Input
          label="Setpoint [°C]"
          value={state.formData.ECO_SETPOINT}
          style={{ width: '250px' }}
          onChange={(e) => setFormData({ ECO_SETPOINT: e.target.value })}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <Input
          label="Limiar de Temperatura Crítico [°C]"
          value={state.formData.ECO_LTC}
          style={{ width: '250px' }}
          onChange={(e) => setFormData({ ECO_LTC: e.target.value })}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <Input
          label="Limiar de Temperatura Inferior [°C]"
          value={state.formData.ECO_LTI}
          style={{ width: '250px' }}
          onChange={(e) => setFormData({ ECO_LTI: e.target.value })}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <Input
          label="Histerese Superior [°C]"
          value={state.formData.ECO_UPPER_HYSTERESIS}
          style={{ width: '250px' }}
          onChange={(e) => setFormData({ ECO_UPPER_HYSTERESIS: e.target.value })}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <Input
          label="Histerese Inferior [°C]"
          value={state.formData.ECO_LOWER_HYSTERESIS}
          style={{ width: '250px' }}
          onChange={(e) => setFormData({ ECO_LOWER_HYSTERESIS: e.target.value })}
        />
      </div>
    </>
  );

  const damDacEcoV2Description = (
    <>
      <div style={{ marginBottom: '20px' }}>
        {dacDamEcoDetails}
      </div>
      {profile.manageAllClients && (
        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
          <Image
            width={700}
            height={500}
            src={String(BackupEcoV2DamDac)}
          />
        </div>
      )}
    </>
  );

  const handleShowNewParametersDAM3Eco = () => (
    state.showNewParametersDAM3 && `O modo ECO será acionado quando a temperatura atingir ${(Number(state.formData.ECO_SETPOINT) || 0) - (Number(state.formData.ECO_LOWER_HYSTERESIS) || 0)}°C, que é o valor do setpoint ${state.formData.ECO_SETPOINT || '0ºC'} menos o valor da histerese inferior ${state.formData.ECO_LOWER_HYSTERESIS}`
  );

  const handleShowNewParametersDAM3Refrigerate = () => (
    `O Refrigerar será acionado quando a temperatura atingir ${(Number(state.formData.ECO_SETPOINT) || 0) + (Number(state.formData.ECO_UPPER_HYSTERESIS) || 0)}°C, que é o valor do setpoint ${state.formData.ECO_SETPOINT || '0ºC'} mais o valor da histerese superior ${state.formData.ECO_UPPER_HYSTERESIS}`
  );

  const handleNotShowNewParametersDAM3Eco = () => (
    !state.showNewParametersDAM3 ? t('seTemperaturaAtivacaoModoEcoOffset', { value1: state.formData.ECO_OFST_END || 1, value2: 7 + (parseFloat(state.formData.ECO_OFST_END) || 1) })
      : t('modoEcoAcionandoQuando', {
        value1: ((Number(state.formData.ECO_SETPOINT) || 0) - (Number(state.formData.ECO_LOWER_HYSTERESIS) || 0)),
        value2: (state.formData.ECO_SETPOINT || '0'),
        value3: (state.formData.ECO_LOWER_HYSTERESIS || '0'),
      }));

  const activateRefrigerateWhen = () => (
    t('refrigerarAcionandoQuando', {
      value1: ((Number(state.formData.ECO_SETPOINT) || 0) + (Number(state.formData.ECO_UPPER_HYSTERESIS) || 0)),
      value2: (state.formData.ECO_SETPOINT || '0'),
      value3: (state.formData.ECO_UPPER_HYSTERESIS || '0'),
    })
  );

  const handleNotShowNewParametersDAM3MinTemp = () => (
    !state.showNewParametersDAM3 && t('temperaturaMinima20C', { value1: state.formData.ECO_OFST_START || 1, value2: 20 + (parseFloat(state.formData.ECO_OFST_START) || 1) })
  );

  const dacConfigOpts = (
    <>
      <CustomSelect
        options={state.comboOpts.optionsEco}
        value={state.formData.ENABLE_ECO_item}
        placeholder="Modo ECO"
        onSelect={(item) => setFormData({ ENABLE_ECO_item: item })}
        notNull
      />
      {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN === 2) && damDacEcoV2Description}
      {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN !== 0) && (
        <>
          <CustomSelect
            options={state.comboOpts.ecoModeCfg}
            value={state.formData.ECO_CFG_item}
            placeholder="Configuração Modo ECO"
            onSelect={(item) => setFormData({ ECO_CFG_item: item })}
            notNull
          />
          {(state.formData.ECO_CFG_item && ecoModeDetails[state.formData.ECO_CFG_item.value]) && (
            <div style={{ marginBottom: '20px' }}>
              {ecoModeDetails[state.formData.ECO_CFG_item.value]}
            </div>
          )}
          {state.formData.ENABLE_ECO_item.valueN === 1 && (
            <>
              <div>
                <Input
                  placeholder="Offset entrada [°C]"
                  value={state.formData.ECO_OFST_START}
                  style={{ width: '160px' }}
                  onChange={(e) => setFormData({ ECO_OFST_START: e.target.value })}
                />
              </div>
              {state.showNewParametersDAM3 && (
                <>
                  <div>
                    <InputCalculator
                      label="Setpoint"
                      value={state.formData.ECO_SETPOINT}
                      style={{ width: '250px' }}
                      onIncreaseDecrease={increaseDecreaseSetpoint}
                      unity="ºC"
                      onChange={(e) => setFormData({ ECO_SETPOINT: e.target.value })}
                    />
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <InputCalculator
                      label="Histerese Superior"
                      value={state.formData.ECO_UPPER_HYSTERESIS}
                      style={{ width: '250px' }}
                      onIncreaseDecrease={increaseDecreaseUpperHysterese}
                      unity="ºC"
                      lowerLimit={0}
                      onChange={(e) => setFormData({ ECO_UPPER_HYSTERESIS: e.target.value })}
                    />
                  </div>
                  <div>
                    {handleShowNewParametersDAM3Refrigerate()}
                  </div>
                </>
              )}
              <div>
                Se a temperatura mínima do ambiente estiver definida como 20°C, um offset de entrada de +1.5°C faz o modo Eco ser ativado quando a temperatura do ambiente ficar abaixo de 21.5°C.
              </div>
              <div style={{ marginTop: '20px' }}>
                <Input
                  placeholder="Offset saída [°C]"
                  value={state.formData.ECO_OFST_END}
                  style={{ width: '160px' }}
                  onChange={(e) => setFormData({ ECO_OFST_END: e.target.value })}
                />
                {state.showNewParametersDAM3 && (
                  <InputCalculator
                    label="Histerese Inferior"
                    value={state.formData.ECO_LOWER_HYSTERESIS}
                    style={{ width: '250px' }}
                    onIncreaseDecrease={increaseDecreaseLowerHysterese}
                    unity="ºC"
                    lowerLimit={0}
                    onChange={(e) => setFormData({ ECO_LOWER_HYSTERESIS: e.target.value })}
                  />
                )}
              </div>
              <div>
                Se a temperatura de ativação do modo Eco para uma câmara fria for 7°C, um offset de saída de 2°C faz o modo Eco permanecer em operação enquanto a temperatura estiver abaixo de 9°C.
                {handleShowNewParametersDAM3Eco()}
              </div>
            </>
          )}
          {state.formData.ENABLE_ECO_item.valueN === 2 && damDacEcoV2}
          <TextLine style={{ marginTop: '20px' }}>
            {state.showNewParametersDAM3 && (
              <InputCalculator
                label="Fator de Utilização Nominal"
                type="text"
                value={state.formData.FU_NOM}
                style={{ width: '250px' }}
                onIncreaseDecrease={increaseDecreaseIntervalTime}
                onChange={(e) => setFormData({ FU_NOM: e.target.value })}
              />
            )}
            <Input
              type="text"
              value={state.formData.FU_NOM || ''}
              placeholder="Fator de Utilização Nominal (0-1)"
              onChange={(event) => setFormData({ FU_NOM: event.target.value })}
            />
          </TextLine>
        </>
      )}
    </>
  );

  const damConfigOpts = (
    <>
      <CustomSelect
        options={state.comboOpts.optionsEco}
        value={state.formData.ENABLE_ECO_item}
        placeholder={t('modoEco')}
        onSelect={(item) => setFormData({ ENABLE_ECO_item: item })}
        notNull
      />
      {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN === 2) && damDacEcoV2Description}
      {state.formData.ENABLE_ECO_item && (state.formData.ENABLE_ECO_item.valueN !== 0) && (
        <>
          <CustomSelect
            options={state.comboOpts.ecoModeCfg}
            value={state.formData.ECO_CFG_item}
            placeholder={t('configuracaoModoEco')}
            onSelect={(item) => setFormData({ ECO_CFG_item: item })}
            notNull
          />
          {(state.formData.ECO_CFG_item && ecoModeDetails[state.formData.ECO_CFG_item.value]) && (
            <div style={{ marginBottom: '20px' }}>
              {ecoModeDetails[state.formData.ECO_CFG_item.value]}
            </div>
          )}
          {state.formData.ENABLE_ECO_item.valueN === 1 && (
            <>
              {!state.showNewParametersDAM3 && (
                <>
                  <div>
                    <Input
                      placeholder={t('offsetEntradaC')}
                      value={state.formData.ECO_OFST_START}
                      style={{ width: '160px' }}
                      onChange={(e) => setFormData({ ECO_OFST_START: e.target.value })}
                    />
                  </div>
                  <div>
                    {handleNotShowNewParametersDAM3MinTemp()}
                  </div>
                </>
              )}
              {state.showNewParametersDAM3 && (
                <>
                  <div>
                    <InputCalculator
                      label={t('setpoint')}
                      value={state.formData.ECO_SETPOINT}
                      style={{ width: '250px' }}
                      onIncreaseDecrease={increaseDecreaseSetpoint}
                      unity="ºC"
                      onChange={(e) => { if (checkDecimalPlace(e.target.value)) setFormData({ ECO_SETPOINT: e.target.value }); }}
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
                      onChange={(e) => { if (checkDecimalPlace(e.target.value)) setFormData({ ECO_UPPER_HYSTERESIS: e.target.value }); }}
                    />
                  </div>
                  <div>
                    {activateRefrigerateWhen()}
                  </div>
                </>
              )}
              <div style={{ marginTop: '20px' }}>
                {!state.showNewParametersDAM3 && (
                  <Input
                    placeholder={t('offsetSaidaC')}
                    value={state.formData.ECO_OFST_END}
                    style={{ width: '160px' }}
                    onChange={(e) => setFormData({ ECO_OFST_END: e.target.value })}
                  />
                )}
                {state.showNewParametersDAM3 && (
                  <InputCalculator
                    label={t('histereseInferior')}
                    value={state.formData.ECO_LOWER_HYSTERESIS}
                    style={{ width: '250px' }}
                    onIncreaseDecrease={increaseDecreaseLowerHysterese}
                    unity="ºC"
                    lowerLimit={0}
                    onChange={(e) => { if (checkDecimalPlace(e.target.value)) setFormData({ ECO_LOWER_HYSTERESIS: e.target.value }); }}
                  />
                )}
              </div>
              <div>
                {handleNotShowNewParametersDAM3Eco()}
              </div>
            </>
          )}
          {state.formData.ENABLE_ECO_item.valueN === 2 && damDacEcoV2}
          <TextLine style={{ marginTop: '20px' }}>
            {!state.showNewParametersDAM3 && (
              <Input
                type="text"
                value={state.formData.FU_NOM || ''}
                placeholder={t('fatorUtilizacaoNominal01')}
                onChange={(event) => setFormData({ FU_NOM: event.target.value })}
              />
            )}
            {state.showNewParametersDAM3 && (
              <InputCalculator
                label={t('fatorUtilizacaoNominal')}
                type="text"
                value={state.formData.FU_NOM}
                style={{ width: '250px' }}
                onIncreaseDecrease={increaseDecreaseIntervalTime}
                onChange={(e) => setFormData({ FU_NOM: e.target.value })}
              />
            )}
          </TextLine>
        </>
      )}
    </>
  );

  const dutConfigOpts = (
    <div>
      <CustomSelect
        options={state.comboOpts.yesNo}
        value={state.formData.USE_IR_item}
        placeholder="Automação habilitada"
        onSelect={(item) => setFormData({ USE_IR_item: item })}
        notNull
      />
      <CustomSelect
        options={state.comboOpts.dutControlOperation}
        value={state.formData.CTRLOPER_item}
        placeholder="Modo de operação do controle"
        onSelect={(item) => setFormData({ CTRLOPER_item: item })}
        notNull
      />
      {(state.formData.CTRLOPER_item && temprtControlModeDetails[state.formData.CTRLOPER_item.value]) && (
        <div style={{ marginBottom: '20px' }}>
          {temprtControlModeDetails[state.formData.CTRLOPER_item.value]}
        </div>
      )}
      {(profile.manageAllClients && state.formData.CTRLOPER_item && ['6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
        <div style={{ marginTop: '10px' }}>
          <Image
            width={700}
            height={500}
            src={String(EcoV2)}
          />
        </div>
      )}
      {(state.formData.CTRLOPER_item && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '4_BLOCKED', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '7_FORCED'].includes(state.formData.CTRLOPER_item.value)) && (
        <>
          {(state.temperatureControlState && profile.manageAllClients) && (
            <div style={{ paddingBottom: '10px' }}>{JSON.stringify(state.temperatureControlState)}</div>
          )}
          {(['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
            <>
              <Flex flexWrap="nowrap" flexDirection="row">
                <Input
                  label="Setpoint [°C]"
                  value={state.formData.TSETPOINT}
                  style={{ width: '160px' }}
                  onChange={(e) => setFormData({ TSETPOINT: e.target.value })}
                />
                {(['6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
                  <Flex flexWrap="nowrap" flexDirection="row">
                    <div style={{ marginLeft: '100px', marginTop: '12px' }}>
                      <label
                        onClick={() => {
                          state.hysteresisChecked = !state.hysteresisChecked;
                          if (state.hysteresisChecked) {
                            state.selectedModeToDut = '8_ECO_2';
                          }
                          else {
                            state.selectedModeToDut = '6_BACKUP_CONTROL_V2';
                          }
                          render();
                        }}
                      >
                        <Checkbox checked={state.hysteresisChecked}>
                          {state.hysteresisChecked ? <CheckboxIcon /> : null}
                        </Checkbox>
                      </label>
                    </div>
                    <div style={{ marginLeft: '10px' }}>
                      <Input
                        label="Histerese Superior [°C]"
                        value={state.formData.ECO_UPPER_HYSTERESIS}
                        style={{ width: '150px' }}
                        onChange={(e) => setFormData({ UPPER_HYSTERESIS: e.target.value })}
                        disabled={!state.hysteresisChecked}
                      />
                    </div>
                    <div style={{ marginLeft: '15px' }}>
                      <Input
                        label="Histerese Inferior [°C]"
                        value={state.formData.ECO_LOWER_HYSTERESIS}
                        style={{ width: '150px' }}
                        onChange={(e) => setFormData({ LOWER_HYSTERESIS: e.target.value })}
                        disabled={!state.hysteresisChecked}
                      />
                    </div>
                  </Flex>
                )}
              </Flex>
              {(['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
                <Flex flexWrap="nowrap" mb={0} flexDirection="row">
                  <div style={{ marginTop: '15px' }}>
                    <Input
                      label="Limiar de Temperatura Crítico [°C]"
                      value={state.formData.LTCRIT}
                      style={{ width: '226px' }}
                      onChange={(e) => setFormData({ LTCRIT: e.target.value })}
                    />
                  </div>
                  {(['6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
                    <div style={{ marginTop: '17px', marginLeft: '75px' }}>
                      <CustomSelect
                        options={state.comboOpts.dutScheduleStartBehavior}
                        value={state.formData.ECO_DUT_SCHEDULE_START_BEHAVIOR_item}
                        placeholder="Comportamento Início Prog. Horária"
                        style={{ width: '300px' }}
                        onSelect={(item) => setFormData({ ECO_DUT_SCHEDULE_START_BEHAVIOR_item: item })}
                        notNull
                      />
                    </div>
                  )}
                </Flex>
              )}
              {(['6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
                <Flex flexWrap="nowrap" mb={0} flexDirection="row">
                  <div>
                    <Input
                      label="Limiar de Temperatura Inferior [°C]"
                      value={state.formData.LTINF}
                      style={{ width: '226px' }}
                      onChange={(e) => setFormData({ LTINF: e.target.value })}
                    />
                  </div>
                  {(['6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value)) && (
                    <div style={{ marginLeft: '75px' }}>
                      <CustomSelect
                        options={state.comboOpts.dutScheduleEndBehavior}
                        value={state.formData.ECO_DUT_SCHEDULE_END_BEHAVIOR_item}
                        placeholder="Comportamento Final Prog. Horária"
                        style={{ width: '300px' }}
                        onSelect={(item) => setFormData({ ECO_DUT_SCHEDULE_END_BEHAVIOR_item: item })}
                        notNull
                      />
                    </div>
                  )}
                </Flex>
              )}
            </>
          )}
          {(['7_FORCED'].includes(state.formData.CTRLOPER_item.value)) && (
            <>
              <Flex mb={0} flexDirection="row">
                <div style={{ marginTop: '10px' }}>
                  <CustomSelect
                    options={state.comboOpts.dutForcedBehavior}
                    value={state.formData.FORCED_BEHAVIOR_item}
                    placeholder="Função"
                    style={{ width: '300px' }}
                    onSelect={(item) => setFormData({ FORCED_BEHAVIOR_item: item })}
                    notNull
                  />
                </div>
              </Flex>
              {state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool' && (
                <Flex
                  flexWrap="nowrap"
                  flexDirection="row"
                  style={{
                    marginTop: '10px',
                  }}
                >
                  <InputCalculator
                    label="Setpoint [°C]"
                    value={state.formData.TSETPOINT}
                    style={{ width: '376px' }}
                    possibleValues={[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]}
                    unity="ºC"
                    onIncreaseDecrease={increaseDecrease}
                  />
                </Flex>
              )}
            </>
          )}
          {/* <TextLine style={{ marginTop: '20px' }}>
            <Input
              type="text"
              value={state.formData.FU_NOM || ''}
              label="Fator de Utilização Nominal (0-1)"
              onChange={(event) => setFormData({ FU_NOM: event.target.value })}
            />
          </TextLine> */}
        </>
      )}
    </div>
  );

  const dutCardsSchedulesExceptionsConfig = (
    <>
      <CustomSelect
        options={state.comboOpts.dutAutCfg}
        value={state.formData.USE_IR_item}
        placeholder={t('automacaoHabilitada')}
        onSelect={(item) => setFormData({ USE_IR_item: item })}
        notNull
      />
      {state.formData.USE_IR_item?.value === 'IR' && (
        <>
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            alignItems="left"
          >
            <div style={{ display: 'flex', paddingTop: '15px' }}>
              <Button
                style={{ width: '225px' }}
                disabled={state.isSaving}
                variant="primary"
                onClick={() => {
                  if (!state.showExceptions) {
                    if (window.confirm('Deseja limpar todas as programações?')) {
                      clearProgramming();
                    }
                  } else {
                    state.openModal = 'clear-exception';
                    render();
                  }
                }}
              >
                {!state.showExceptions ? t('botaoLimparProgramacao') : t('botaoLimparExcecao')}
              </Button>
            </div>
          </Flex>
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
            alignItems="left"
            width="768px"
            style={{
              borderRadius: '10px',
            }}
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
                  borderTop: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  borderLeft: '1px solid lightgrey',
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
                  textAlign: 'center',
                  fontSize: '90%',
                  ...(state.showExceptions ? {
                    borderBottom: '1px solid lightgrey',
                    backgroundColor: '#f4f4f4',
                    curstor: 'pointer',
                    fontWeight: 'normal',
                  } : {
                    borderBottom: 'none',
                    backgroundColor: 'transparent',
                    cursor: undefined,
                    fontWeight: 'bold',
                  }),
                }}
                onClick={() => { state.showExceptions && setState({ showExceptions: !state.showExceptions, showList: false }); }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  {t('programacoes')}
                  <IconWrapper data-tip data-for="information" style={{ marginLeft: '3px', marginTop: '-2px' }}>
                    <InformationIcon />
                    <ReactTooltip
                      id="information"
                      place="top"
                      effect="solid"
                      delayHide={100}
                      offset={{ top: 0, left: 10 }}
                      textColor="#FFFFFF"
                      border
                      backgroundColor="rgba(38, 38, 38, 0.97)"
                    >
                      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                        <span
                          style={{
                            marginTop: '6px',
                            fontSize: '95%',
                            maxWidth: '262px',
                            textAlign: 'justify',
                          }}
                        >
                          <Trans i18nKey="infoAbaProgramacaoMult" />
                        </span>
                      </Flex>
                    </ReactTooltip>
                  </IconWrapper>
                </div>
              </span>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
              <span
                style={{
                  borderLeft: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  ...(state.showExceptions ? {
                    borderBottom: 'none',
                    backgroundColor: 'transparent',
                    cursor: undefined,
                    fontWeight: 'bold',
                  } : {
                    borderBottom: '1 px solid lightgrey',
                    backgroundColor: '#f4f4f4',
                    cursor: 'pointer',
                    fontWeight: 'normal',
                  }),
                }}
                onClick={() => { (!state.showExceptions) && setState({ showExceptions: !state.showExceptions }); }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  {t('excecoes')}
                  <IconWrapper data-tip data-for="informationException" style={{ marginLeft: '3px', marginTop: '-2px' }}>
                    <InformationIcon />
                    <ReactTooltip
                      id="informationException"
                      place="top"
                      effect="solid"
                      delayHide={100}
                      offset={{ top: 0, left: 10 }}
                      textColor="#FFFFFF"
                      border
                      backgroundColor="rgba(38, 38, 38, 0.97)"
                    >
                      <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                        <span
                          style={{
                            marginTop: '6px',
                            fontSize: '95%',
                            maxWidth: '262px',
                            textAlign: 'justify',
                          }}
                        >
                          <Trans i18nKey="infoAbaExcecaoMult" />
                        </span>
                      </Flex>
                    </ReactTooltip>
                  </IconWrapper>
                </div>
              </span>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
            </div>
          </Flex>
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
                {`Total: ${!state.showExceptions ? state.DUTS_SCHEDULES_TO_ADD.length : state.DUTS_EXCEPTIONS_TO_ADD.length}`}
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
                    if (state.showExceptions && state.DUTS_EXCEPTIONS_TO_ADD.length === 30) {
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
            {!state.showExceptions && (
              <Flex
                flexWrap="nowrap"
                flexDirection="column"
                alignItems="left"
              >
                {state.DUTS_SCHEDULES_TO_ADD.map((schedule, index) => (index % 2 === 0
                  ? (
                    <Flex
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
                      {index + 1 < state.DUTS_SCHEDULES_TO_ADD.length ? (
                        <ScheduleViewCard
                          cardPosition={index + 1}
                          schedule={state.DUTS_SCHEDULES_TO_ADD[index + 1]}
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
            {state.showExceptions && state.DUTS_EXCEPTIONS_TO_ADD.length > 0 && (
              <>
                <ExceptionsHeader
                  style={{
                    marginTop: '25px',
                  }}
                />
                {state.DUTS_EXCEPTIONS_TO_ADD.map((exception, index) => (
                  <Flex
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
          </Flex>
        </>
      )}
    </>
  );

  function renderDevConfigOptions() {
    if (state.selectedDevType === 'DAC') {
      state.comboOpts.ecoModeCfg = state.comboOpts.ecoModeCfg.filter((x) => x.value === 'eco-D');
      return dacConfigOpts;
    }
    if (state.selectedDevType === 'DAM') {
      state.comboOpts.ecoModeCfg = state.comboOpts.ecoModeCfg.filter((x) => x.value !== 'eco-D');
      return damConfigOpts;
    }
    if (state.selectedDevType === 'DUT') {
      return dutConfigOpts;
    }
  }

  function setFormData(obj) {
    Object.assign(state.formData, obj);

    if (obj.hasOwnProperty('CTRLOPER_item')) {
      state.selectedModeToDut = state.formData.CTRLOPER_item?.value || null;

      if (state.selectedModeToDut === '6_BACKUP_CONTROL_V2' && state.hysteresisChecked) {
        state.selectedModeToDut = '8_ECO_2';
      }
      else if (state.selectedModeToDut === '7_FORCED' && state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool') {
        state.formData.TSETPOINT = '21';
      }
    }
    else if (obj.hasOwnProperty('FORCED_BEHAVIOR_item')) {
      if (state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool') {
        state.formData.TSETPOINT = '21';
      }
      else {
        state.formData.TSETPOINT = '';
      }
    }
    render();
  }

  function validateEco2Values() {
    const ltc = (parseDecimalNumber(state.formData.LTCRIT) || 0);
    const lti = (parseDecimalNumber(state.formData.LTINF) || 0);
    const setpoint = (parseDecimalNumber(state.formData.TSETPOINT) || 0);
    const upperHysteresis = (parseDecimalNumber(state.formData.ECO_UPPER_HYSTERESIS) || 0);
    const lowerHysteresis = (parseDecimalNumber(state.formData.ECO_LOWER_HYSTERESIS) || 0);
    if (ltc > 40 || ltc < 13) {
      toast.error('LTC deve ser entre 13º e 40º');
      return false;
    }
    if (lti > 34 || lti < 8) {
      toast.error('LTI deve ser entre 8º e 34º');
      return false;
    }
    if (ltc <= lti) {
      toast.error('LTC deve ser maior que LTI');
      return false;
    }
    if (setpoint > 35 || setpoint < 12) {
      toast.error('Setpoint deve ser entre 12º e 35º');
      return false;
    }
    if (upperHysteresis > 5 || upperHysteresis < 0.2) {
      toast.error('Histerese Superior deve ser entre 0.2º e 5º');
      return false;
    }
    if (lowerHysteresis > 5 || lowerHysteresis < 0.2) {
      toast.error('Histerese Inferior deve ser entre 0.2º e 5º');
      return false;
    }
    if (ltc < setpoint || lti > setpoint) {
      toast.error('Setpoint deve estar entre valores de LTC e LTI');
      return false;
    }
    return true;
  }

  function updateSchedule(sched) {
    // state.expectedProgS = serializeFullProg(sched);
    // render();
  }

  function checkNeedMultipleSchedule(dutSchedules: ScheduleDut[], dutExceptions: ExceptionDut[]) {
    let index = 0;
    for (const schedule of dutSchedules) {
      for (let i = index + 1; i < dutSchedules.length; i++) {
        const scheduleCompare = dutSchedules[i];
        if (isAllDisabled(schedule.DAYS) || isAllDisabled(scheduleCompare.DAYS)) {
          continue;
        }
        const bothSchedulesActives = schedule.SCHEDULE_STATUS && scheduleCompare.SCHEDULE_STATUS;
        const bothSchedulesAllow = schedule.PERMISSION === 'allow' && scheduleCompare.PERMISSION === 'allow';
        if (checkWeekDayCommun(schedule, scheduleCompare)) {
          return true;
        }
        if (!checkWeekDayCommun(schedule, scheduleCompare) && bothSchedulesActives && bothSchedulesAllow && checkSchedulesConfigurationDifferent(schedule, scheduleCompare)) {
          return true;
        }
      }

      if (schedule.SCHEDULE_STATUS && checkScheduleAndExceptions(schedule, dutExceptions)) {
        return true;
      }
      index++;
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

  function checkScheduleAndExceptions(schedule: ScheduleDut, dutExceptions: ExceptionDut[]) {
    for (const exception of dutExceptions) {
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

  function checkSchedulesConfigurationDifferent(schedule1: ScheduleDut|ExceptionDut, schedule2: ScheduleDut|ExceptionDut) {
    const hasSetPoint = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && (['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(schedule1.CTRLOPER) || schedule1.CTRLOPER === '7_FORCED' && schedule1.FORCED_BEHAVIOR === 'dut-forced-cool') : false;
    const hasLtc = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(schedule1.CTRLOPER) : false;
    const hasLti = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(schedule1.CTRLOPER) : false;
    const hasForcedOptions = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['7_FORCED'].includes(schedule1.CTRLOPER) : false;
    const hasEco2Options = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['8_ECO_2'].includes(schedule1.CTRLOPER) : false;
    const hasActionMode = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['2_SOB_DEMANDA'].includes(schedule1.CTRLOPER) : false;
    const hasActionTime = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['2_SOB_DEMANDA'].includes(schedule1.CTRLOPER) : false;
    const hasActionPostBehavior = schedule1.CTRLOPER ? schedule1.PERMISSION === 'allow' && ['2_SOB_DEMANDA'].includes(schedule1.CTRLOPER) : false;

    let result = schedule1.CTRLOPER !== schedule2.CTRLOPER;

    result = result || (hasSetPoint && schedule1.SETPOINT !== schedule2.SETPOINT);
    result = result || (hasLtc && schedule1.LTC !== schedule2.LTC);
    result = result || (hasLti && schedule1.LTI !== schedule2.LTI);
    result = result || (hasEco2Options && schedule1.UPPER_HYSTERESIS !== schedule2.UPPER_HYSTERESIS);
    result = result || (hasEco2Options && schedule1.LOWER_HYSTERESIS !== schedule2.LOWER_HYSTERESIS);
    result = result || (hasEco2Options && schedule1.SCHEDULE_START_BEHAVIOR !== schedule2.SCHEDULE_START_BEHAVIOR);
    result = result || (hasEco2Options && schedule1.SCHEDULE_END_BEHAVIOR !== schedule2.SCHEDULE_END_BEHAVIOR);
    result = result || (hasForcedOptions && schedule1.FORCED_BEHAVIOR !== schedule2.FORCED_BEHAVIOR);
    result = result || (hasActionMode && schedule1.ACTION_MODE !== schedule2.ACTION_MODE);
    result = result || (hasActionTime && schedule1.ACTION_TIME !== schedule2.ACTION_TIME);
    result = result || (hasActionPostBehavior && schedule1.ACTION_POST_BEHAVIOR !== schedule2.ACTION_POST_BEHAVIOR);

    return result;
  }

  async function getDutIrCodesList(devId: string, dutsErrors) {
    let irCommands;
    await apiCall('/get-dut-ircodes-list', { devId })
      .then((response) => {
        const dutIrCodes = response.list;
        irCommands = identifyDutIrCommands(dutIrCodes)
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
      }).catch((_err) => {
        dutsErrors.push({ DUT_ID: devId, Motivo: t('codigoIrNaoCadastrado') });
      });

    return irCommands;
  }

  async function checkDutOnline(devId: string, dutsOffline: { DUT_ID: string }[]) {
    const devInfo = await getCachedDevInfo(devId);

    if (devInfo.status !== 'ONLINE') {
      dutsOffline.push({ DUT_ID: devId });
      const dutIndex = state.dutsList.findIndex((dut) => dut.DEV_ID === devId);
      if (dutIndex !== -1) {
        state.dutsList[dutIndex].checked = false;
        render();
      }
    }
  }

  function returnScheduleStatus(schedule: ScheduleDut) {
    return schedule.SCHEDULE_STATUS;
  }

  function checkCardsNoConflicts() {
    let index = 0;
    for (const schedule of state.DUTS_SCHEDULES_TO_ADD) {
      for (let i = index + 1; i < state.DUTS_SCHEDULES_TO_ADD.length; i++) {
        const scheduleCompare = state.DUTS_SCHEDULES_TO_ADD[i];
        const bothSchedulesActives = schedule.SCHEDULE_STATUS && scheduleCompare.SCHEDULE_STATUS;
        if (checkWeekDayCommun(schedule, scheduleCompare) && bothSchedulesActives) {
          let conflict = schedule.BEGIN_TIME >= scheduleCompare.BEGIN_TIME && schedule.BEGIN_TIME < state.DUTS_SCHEDULES_TO_ADD[i].END_TIME;
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

  const getDaysWithNewProgramming = async () => {
    const daysWithProgramming = new Set();
    for (const schedule of state.DUTS_SCHEDULES_TO_ADD) {
      if (schedule.SCHEDULE_STATUS) {
        for (const day of daysOfWeek) {
          if (schedule.DAYS[day]) {
            daysWithProgramming.add(day);
          }
        }
      }
    }
    return daysWithProgramming;
  };

  const isAllDisabled = (DAYS) => {
    for (const day of daysOfWeek) {
      if (DAYS[day]) return false;
    }

    return true;
  };

  async function checkCardsCompatibility(devId: string, type: 'schedule'|'exception', irCommands, dutsErrors) {
    const cards = type === 'schedule' ? state.DUTS_SCHEDULES_TO_ADD : state.DUTS_EXCEPTIONS_TO_ADD;
    for (const card of cards) {
      const status = type === 'schedule' ? returnScheduleStatus(card as ScheduleDut) : true;
      if (card.PERMISSION === 'allow' && status) {
        const CTRLOPER = card.CTRLOPER && card.FORCED_BEHAVIOR !== 'dut-forced-fan' ? card.CTRLOPER : undefined;
        const FORCED_BEHAVIOR = card.FORCED_BEHAVIOR === 'dut-forced-fan' ? card.FORCED_BEHAVIOR : undefined;
        const result = await checkCompatibiltyWithOperationMode([{ DEV_ID: devId }], CTRLOPER, FORCED_BEHAVIOR);
        if (result.dutsIncompatibles.length > 0) {
          dutsErrors.push(...result.dutsIncompatibles);
          return;
        }

        if (card.CTRLOPER === '7_FORCED' && card.FORCED_BEHAVIOR === 'dut-forced-cool') {
          if (irCommands.find((item) => item.TEMPER === Number(card.SETPOINT)) == null) {
            dutsErrors.push({ DUT_ID: devId, Motivo: t('codigoIrNaoCadastrado') });
            return;
          }
          card.IR_ID_COOL = irCommands.find((item) => item.TEMPER === Number(card.SETPOINT))?.IR_ID;
        }
      }
    }
  }

  function addExceptionsToClean(dutProgramming, DUTS_EXCEPTIONS_PERSISTED, specificDay?) {
    if (specificDay) {
      if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
      dutProgramming.exceptions[specificDay] = {
        permission: 'allow',
        start: '',
        end: '',
        clearProg: true,
      };
    }
    else {
      DUTS_EXCEPTIONS_PERSISTED.forEach((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
        dutProgramming.exceptions[day] = {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: (specificDay && specificDay === day) || !specificDay,
        };
      });
    }
  }

  function prepareDutProgramming(dutProgramming, FINAL_DUTS_EXCEPTIONS, DUTS_EXCEPTIONS_PERSISTED) {
    let scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.mon && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.mon = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.tue && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.tue = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.wed && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.wed = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.thu && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.thu = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.fri && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.fri = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.sat && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.sat = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    scheduleToProgrammming = state.DUTS_SCHEDULES_TO_ADD.find((schedule) => schedule.DAYS.sun && schedule.SCHEDULE_STATUS);
    if (scheduleToProgrammming && state.formData.USE_IR_item?.value === 'IR') {
      dutProgramming.week.sun = {
        permission: scheduleToProgrammming.PERMISSION,
        start: scheduleToProgrammming.BEGIN_TIME,
        end: scheduleToProgrammming.END_TIME,
      };
    }

    if (state.formData.USE_IR_item?.value === 'IR') {
      FINAL_DUTS_EXCEPTIONS.forEach((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        if (!dutProgramming.exceptions) dutProgramming.exceptions = {};
        dutProgramming.exceptions[day] = {
          permission: exception.PERMISSION,
          start: exception.BEGIN_TIME,
          end: exception.END_TIME,
        };
      });
    }
    else {
      addExceptionsToClean(dutProgramming, DUTS_EXCEPTIONS_PERSISTED);
    }
  }

  function clearCards() {
    state.DUTS_SCHEDULES_TO_ADD = [];
    state.DUTS_EXCEPTIONS_TO_ADD = [];
  }

  async function sendDutDeviceSchedule(dev: DutList, index: number, dutsErrors: DutError[], dutsOffline: DutOffline[]): Promise<void> {
    if (dutsOffline.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      state.filteredDevList[index].checked = false;
      return;
    }

    const FINAL_DUTS_SCHEDULES = state.DUTS_SCHEDULES_TO_ADD.map((obj) => ({ ...obj }));
    const FINAL_DUTS_EXCEPTIONS = state.DUTS_EXCEPTIONS_TO_ADD.map((obj) => ({ ...obj }));

    // Seleciona ID de comandos IR para caso haja cards com modo forçado refrigerar
    const irCommands = await getDutIrCodesList(dev.DEV_ID, dutsErrors);

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    // Verificar compatibilidade de fw e códigos IR com cards
    await checkCardsCompatibility(dev.DEV_ID, 'schedule', irCommands, dutsErrors);

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    // Verificar compatibilidade de fw e códigos IR com exceções
    await checkCardsCompatibility(dev.DEV_ID, 'exception', irCommands, dutsErrors);

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    let DUTS_SCHEDULES_PERSISTED = [] as ScheduleDut[];
    let DUTS_EXCEPTIONS_PERSISTED = [] as ExceptionDut[];

    // Seleciona schedules e exceptions do dispositivo
    await apiCall('/dut/get-dut-schedules', { DUT_ID: dev.DEV_ID, CLIENT_ID: dev.CLIENT_ID, UNIT_ID: dev.UNIT_ID })
      .then((response) => {
        DUTS_SCHEDULES_PERSISTED = response.schedules;
        render();
      })
      .catch((error) => {
        console.error(error);
        dutsErrors.push({
          DUT_ID: dev.DEV_ID,
          Motivo: t('erroBuscarCardsProgramacao'),
        });
      });

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    await apiCall('/dut/get-dut-exceptions', { DUT_ID: dev.DEV_ID, CLIENT_ID: dev.CLIENT_ID, UNIT_ID: dev.UNIT_ID })
      .then((response) => {
        DUTS_EXCEPTIONS_PERSISTED = response.exceptions;
        render();
      })
      .catch((error) => {
        console.error(error);
        dutsErrors.push({
          DUT_ID: dev.DEV_ID,
          Motivo: t('erroBuscarCardsExcecao'),
        });
      });

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    // Verifica se há exception para a mesma data, para virar edição
    if (DUTS_EXCEPTIONS_PERSISTED.length > 0) {
      for (const exception of FINAL_DUTS_EXCEPTIONS) {
        let indexToRemove = 0;
        const hasSameDate = DUTS_EXCEPTIONS_PERSISTED.find((item, index) => { indexToRemove = index; if (item.EXCEPTION_DATE === exception.EXCEPTION_DATE) return item; });
        if (hasSameDate) {
          exception.DUT_EXCEPTION_ID = hasSameDate.DUT_EXCEPTION_ID;
          DUTS_EXCEPTIONS_PERSISTED.splice(indexToRemove, 1);
        }
      }
    }

    // identifica os dias da semana com programação múltipla, e desativa as programações já existentes no DUT nesses dias
    const daysWithProgramming = Array.from(await getDaysWithNewProgramming());

    for (const schedule of DUTS_SCHEDULES_PERSISTED) {
      for (const day of daysWithProgramming) {
        schedule.DAYS[day as string] = false;
      }
    }

    const NEED_MULT_SCHEDULES = checkNeedMultipleSchedule(FINAL_DUTS_SCHEDULES.concat(DUTS_SCHEDULES_PERSISTED), FINAL_DUTS_EXCEPTIONS.concat(DUTS_EXCEPTIONS_PERSISTED));

    const dutSchedules: ApiParams['/dut/set-dut-schedules'] = {
      CLIENT_ID: dev.CLIENT_ID,
      UNIT_ID: dev.UNIT_ID,
      DUT_ID: dev.DEV_ID,
      NEED_MULT_SCHEDULES,
      schedules: [],
    };

    const dutExceptions: ApiParams['/dut/set-dut-exceptions'] = {
      CLIENT_ID: dev.CLIENT_ID,
      UNIT_ID: dev.UNIT_ID,
      DUT_ID: dev.DEV_ID,
      exceptions: [],
    };

    // Se não há novos cards, não precisa altera-los. Se IR está desativada, apenas apaga cards antigos
    if (state.DUTS_SCHEDULES_TO_ADD.length > 0 || state.formData.USE_IR_item?.value !== 'IR' || NEED_MULT_SCHEDULES) {
      // Adiciona novos cards para inserção (caso automação esteja ativada), e cards persistidos para deleção
      if (state.formData.USE_IR_item?.value === 'IR') {
        dutSchedules.schedules = FINAL_DUTS_SCHEDULES.map((schedule) =>
        {
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
            IR_ID_COOL: hasIrCode ? irCommands.find((item) => item.TEMPER === schedule.SETPOINT)?.IR_ID || null : null,
            ACTION_MODE: schedule.ACTION_MODE,
            ACTION_TIME: schedule.ACTION_TIME,
            ACTION_POST_BEHAVIOR: schedule.ACTION_POST_BEHAVIOR,
          });
        });
      }
      dutSchedules.schedules = dutSchedules.schedules.concat(DUTS_SCHEDULES_PERSISTED.map((schedule) =>
      {
        const hasIrCode = schedule.CTRLOPER === '7_FORCED' && schedule.FORCED_BEHAVIOR === 'dut-forced-cool' && schedule.SETPOINT != null;
        return ({
          DUT_SCHEDULE_ID: schedule.DUT_SCHEDULE_ID,
          DELETE: isAllDisabled(schedule.DAYS),
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
          IR_ID_COOL: hasIrCode ? irCommands.find((item) => item.TEMPER === schedule.SETPOINT)?.IR_ID || null : null,
          ACTION_MODE: schedule.ACTION_MODE,
          ACTION_TIME: schedule.ACTION_TIME,
          ACTION_POST_BEHAVIOR: schedule.ACTION_POST_BEHAVIOR,
        });
      }));
    }

    if (FINAL_DUTS_EXCEPTIONS.length > 0 && state.formData.USE_IR_item?.value === 'IR') {
      dutExceptions.exceptions = FINAL_DUTS_EXCEPTIONS.map((exception) => {
        const hasIrCode = exception.CTRLOPER === '7_FORCED' && exception.FORCED_BEHAVIOR === 'dut-forced-cool' && exception.SETPOINT != null;
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        return ({
          DUT_EXCEPTION_ID: exception.DUT_EXCEPTION_ID,
          DELETE: false,
          EXCEPTION_TITLE: exception.EXCEPTION_TITLE,
          REPEAT_YEARLY: exception.REPEAT_YEARLY,
          EXCEPTION_STATUS_ID: exception.EXCEPTION_STATUS_ID,
          EXCEPTION_DATE: day,
          PERMISSION: exception.PERMISSION,
          BEGIN_TIME: exception.BEGIN_TIME,
          END_TIME: exception.END_TIME,
          CTRLOPER: exception.CTRLOPER,
          SETPOINT: exception.SETPOINT,
          LTC: exception.LTC,
          LTI: exception.LTI,
          UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
          LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
          SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_START_BEHAVIOR,
          SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
          FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
          IR_ID_COOL: hasIrCode ? irCommands.find((item) => item.TEMPER === exception.SETPOINT)?.IR_ID || null : null,
          ACTION_MODE: exception.ACTION_MODE,
          ACTION_TIME: exception.ACTION_TIME,
          ACTION_POST_BEHAVIOR: exception.ACTION_POST_BEHAVIOR,
        });
      });
    }
    // Exclui as exceções
    else if (state.formData.USE_IR_item?.value !== 'IR') {
      dutExceptions.exceptions = DUTS_EXCEPTIONS_PERSISTED.map((exception) => {
        const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
        return ({
          DUT_EXCEPTION_ID: exception.DUT_EXCEPTION_ID,
          DELETE: true,
          EXCEPTION_TITLE: exception.EXCEPTION_TITLE,
          REPEAT_YEARLY: exception.REPEAT_YEARLY,
          EXCEPTION_STATUS_ID: exception.EXCEPTION_STATUS_ID,
          EXCEPTION_DATE: day,
          PERMISSION: exception.PERMISSION,
          BEGIN_TIME: exception.BEGIN_TIME,
          END_TIME: exception.END_TIME,
          CTRLOPER: exception.CTRLOPER,
          SETPOINT: exception.SETPOINT,
          LTC: exception.LTC,
          LTI: exception.LTI,
          UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
          LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
          SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_START_BEHAVIOR,
          SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
          FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
          IR_ID_COOL: null,
        });
      });
    }

    const dutData: ApiParams['/dut/set-dut-info'] = {
      DEV_ID: dev.DEV_ID,
      CLIENT_ID: dev.CLIENT_ID,
      UNIT_ID: dev.UNIT_ID,
      UPDATE_AUTOM_INFO: true,
    };

    if (state.formData.USE_IR_item) {
      if (state.formData.USE_IR_item.value === 'IR') {
        dutData.PORTCFG = 'IR';
        dutData.USE_IR = 1;
      } else if (state.formData.USE_IR_item.value === 'RELAY') {
        dutData.PORTCFG = 'RELAY';
        dutData.USE_IR = 0;
      } else if (state.formData.USE_IR_item.value === 'DISABLED') {
        dutData.PORTCFG = 'IR';
        dutData.USE_IR = 0;
      }
    }

    // Se precisa da rotina, apenas salva informações de DUT, Schedules e Exceptions. Caso contrário, além das informações descritas, envia toda programação da semana para o DUT,
    // bem como configuração de modo de operação.
    if (!NEED_MULT_SCHEDULES || state.formData.USE_IR_item?.value !== 'IR') {
      const dutProgramming: ApiParams['/dut/update-programming'] = {
        dutId: dev.DEV_ID,
        week: {},
        exceptions: {},
      };

      dutData.CTRLOPER = undefined;
      dutData.TSETPOINT = undefined;
      dutData.LTCRIT = undefined;
      dutData.LTINF = undefined;
      dutData.UPPER_HYSTERESIS = undefined;
      dutData.LOWER_HYSTERESIS = undefined;
      dutData.SCHEDULE_START_BEHAVIOR = undefined;
      dutData.SCHEDULE_END_BEHAVIOR = undefined;
      dutData.FORCED_BEHAVIOR = undefined;
      dutData.IR_ID_COOL = undefined;
      dutData.ACTION_MODE = undefined;
      dutData.ACTION_TIME = undefined;
      dutData.ACTION_POST_BEHAVIOR = undefined;

      const scheduleAux = FINAL_DUTS_SCHEDULES.filter((schedule) => schedule.PERMISSION === 'allow' && schedule.SCHEDULE_STATUS);

      if (scheduleAux != null && scheduleAux.length > 0 && state.formData.USE_IR_item?.value === 'IR') {
        dutData.CTRLOPER = scheduleAux[0].CTRLOPER ? scheduleAux[0].CTRLOPER : state.comboOpts.dutControlOperation[0].value;
        dutData.TSETPOINT = scheduleAux[0].SETPOINT;
        dutData.LTCRIT = scheduleAux[0].LTC;
        dutData.LTINF = scheduleAux[0].LTI;
        dutData.UPPER_HYSTERESIS = scheduleAux[0].UPPER_HYSTERESIS;
        dutData.LOWER_HYSTERESIS = scheduleAux[0].LOWER_HYSTERESIS;
        dutData.SCHEDULE_START_BEHAVIOR = scheduleAux[0].SCHEDULE_START_BEHAVIOR;
        dutData.SCHEDULE_END_BEHAVIOR = scheduleAux[0].SCHEDULE_END_BEHAVIOR;
        dutData.FORCED_BEHAVIOR = scheduleAux[0].FORCED_BEHAVIOR;
        const hasIrCode = scheduleAux[0].CTRLOPER === '7_FORCED' && scheduleAux[0].FORCED_BEHAVIOR === 'dut-forced-cool' && scheduleAux[0].SETPOINT != null;
        dutData.IR_ID_COOL = hasIrCode ? state.irCommands.find((item) => item.TEMPER === scheduleAux[0].SETPOINT)?.IR_ID || null : null;
        dutData.ACTION_MODE = scheduleAux[0].ACTION_MODE;
        dutData.ACTION_TIME = scheduleAux[0].ACTION_TIME;
        dutData.ACTION_POST_BEHAVIOR = scheduleAux[0].ACTION_POST_BEHAVIOR;
      }

      // Prepara programação para enviar
      prepareDutProgramming(dutProgramming, FINAL_DUTS_EXCEPTIONS, DUTS_EXCEPTIONS_PERSISTED);

      // Realiza envios, validando se houve erro
      try {
        await apiCall('/dut/set-dut-info', dutData);
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarInfo') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        await apiCall('/resend-dut-ir-codes', { devId: dev.DEV_ID });
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroEnviarComandosIr') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        await apiCall('/resend-dut-aut-config', { devId: dev.DEV_ID });
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroEnviarConfigDut') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        await apiCall('/dut/update-programming', dutProgramming);
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroEnviarProg') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        if (dutSchedules.schedules.length > 0) {
          await apiCall('/dut/set-dut-schedules', dutSchedules);
        }
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarCardsProgramacao') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        if (state.DUTS_EXCEPTIONS_TO_ADD.length > 0 || (state.formData.USE_IR_item?.value !== 'IR' && dutExceptions.exceptions.length > 0)) {
          await apiCall('/dut/set-dut-exceptions', dutExceptions);
        }
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarCardsExcecao') });
      }
    }
    else {
      try {
        await apiCall('/dut/set-dut-info', dutData);
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarInfo') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        if (dutSchedules.schedules.length > 0) {
          await apiCall('/dut/set-dut-schedules', dutSchedules);
        }
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarCardsProgramacao') });
      }

      if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
        return;
      }

      try {
        if (state.DUTS_EXCEPTIONS_TO_ADD.length > 0 || (state.formData.USE_IR_item?.value !== 'IR' && dutExceptions.exceptions.length > 0)) {
          await apiCall('/dut/set-dut-exceptions', dutExceptions);
        }
      }
      catch (err) {
        dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarCardsExcecao') });
      }
    }
  }

  function onCompleteProgressDevice(): void {
    setProgressState((previousState) => ({
      ...previousState,
      currentDevices: previousState.currentDevices + 1,
    }));
  }

  async function sendDutSchedule() {
    if (state.selectedDevType === 'DUT') {
      const dutsErrors = [] as DutError[];
      const dutsOffline = [] as DutOffline[];

      if (!checkCardsNoConflicts()) {
        return;
      }

      try {
        const selectedDevList = state.filteredDevList.filter((dev) => dev.checked) as DutList[];

        for (const device of selectedDevList) {
          if (device.status === 'OFFLINE') {
            dutsOffline.push({ DUT_ID: device.DEV_ID });
          }
        }

        if (selectedDevList.length === 0) {
          toast.warn(t('semDispositivoSelecionad'));
          return;
        }
        setProgressState({
          currentDevices: 0,
          totalDevices: selectedDevList.length,
        });
        setState({ isSending: true });
        toast.info(t('iniciadoProgramacaoEmMassa'));

        let hasOutdatedOnDemandFw = false;
        const notAcceptActionPostBehavior: string[] = [];

        selectedDevList.forEach((dev) => {
          if (!isFwVersionGreatestOrEqual('2_3_13', dev.CURRFW_VERS || '')) {
            hasOutdatedOnDemandFw = true;
            notAcceptActionPostBehavior.push(dev.DEV_ID);
          }
        });

        let canUpdateSched = true;
        state.DUTS_SCHEDULES_TO_ADD.forEach((sched) => {
          if (sched.CTRLOPER === '2_SOB_DEMANDA' && hasOutdatedOnDemandFw && (sched.ACTION_MODE !== 'ECO' || sched.ACTION_TIME !== 3600 || sched.ACTION_POST_BEHAVIOR !== 'Disabled')) canUpdateSched = false;
        });
        state.DUTS_EXCEPTIONS_TO_ADD.forEach((sched) => {
          if (sched.CTRLOPER === '2_SOB_DEMANDA' && hasOutdatedOnDemandFw && (sched.ACTION_MODE !== 'ECO' || sched.ACTION_TIME !== 3600 || sched.ACTION_POST_BEHAVIOR !== 'Disabled')) canUpdateSched = false;
        });

        if (hasOutdatedOnDemandFw && !canUpdateSched) {
          toast.warn(`${t('erroSalvarProgramacaoSobDemanda')}${notAcceptActionPostBehavior.join(' - ')} `);
          setState({ isLoading: false, isSending: false });
          return;
        }

        const promises = selectedDevList.map((dev, index) => () => sendDutDeviceSchedule(dev, index, dutsErrors, dutsOffline)
          .then(() => {
            onCompleteProgressDevice();
          })
          .catch((error) => {
            console.error(`Erro promisse sendDutDeviceSchedule ${dev.DEV_ID}: ${error.message}`);
            dutsErrors.push({
              DUT_ID: dev.DEV_ID,
              Motivo: t('erroProgDispositivos'),
            });
            onCompleteProgressDevice();
          }));

        await batchRequests(promises, limitDutScheduleDevices);

        if (dutsErrors.length > 0 || dutsOffline.length > 0) {
          throw new Error();
        }
      }
      catch (err) {
        console.log(err);
        render();
        handleDutMessageError(dutsErrors, dutsOffline);
        return;
      }
      toast.success(t('progEnviadaSucesso'));
      await new Promise((resolve) => setTimeout(resolve, 300));
      clearCards();
      setState({ selectedDevType: '', isSending: false });
      render();
    }
  }

  function handleDutMessageError(dutsErrors: DutError[], dutsOffline: DutOffline[]) {
    const devicesIdWithErrors: string[] = [];
    const devicesIdsOffline: string[] = dutsOffline.map((dev) => dev.DUT_ID);

    if (dutsErrors.length > 0) {
      let message = t('erroProgDispositivos');
      devicesIdWithErrors.push(...dutsErrors.map(({ DUT_ID, Motivo }) => {
        console.log(`${DUT_ID}:${Motivo}`);
        message += `\n${DUT_ID}`;
        return DUT_ID;
      }));

      toast.error(message, { closeOnClick: false, draggable: false, duration: 10000 });
    }

    if (dutsOffline.length > 0) {
      const message = t('dispositivoOfflineDesmarcado', { devs: devicesIdsOffline.join(', ') });
      toast.error(message, { closeOnClick: false, draggable: false, duration: 10000 });
    }

    const pendingDevs = [...devicesIdWithErrors, ...devicesIdsOffline];
    const refreshDevsList = state.filteredDevList.map((dut) => {
      if (!pendingDevs.includes((dut as DutList).DEV_ID)) {
        return { ...dut, checked: false };
      }
      return dut;
    });

    setState({ filteredDevList: refreshDevsList });
    setState({ isSending: false });
  }

  function handleDamMessageError(damsErrors: { id: string, err: string | Error }[], damsOffline: DamOffline[]) {
    const devicesIdWithErrors: string[] = [];
    const devicesIdsOffline: string[] = damsOffline.map((dev) => dev.DAM_ID);
    if (damsErrors.length > 0) {
      let message = t('erroProgDispositivos');
      devicesIdWithErrors.push(...damsErrors.map(({ id, err }) => {
        console.log(`${id}:${err}`);
        message += `\n${id}`;
        return id;
      }));

      toast.error(message, { closeOnClick: false, draggable: false, duration: 10000 });
    }

    if (damsOffline.length > 0) {
      const message = t('dispositivoOfflineDesmarcado', { devs: devicesIdsOffline.join(', ') });
      toast.error(message, { closeOnClick: false, draggable: false, duration: 10000 });
    }

    const pendingDevs = [...devicesIdWithErrors, ...devicesIdsOffline];
    const refreshDevsList = state.filteredDevList.map((dam) => {
      if (!pendingDevs.includes((dam as DamList).DAM_ID)) {
        return { ...dam, checked: false };
      }
      return dam;
    });

    setState({ filteredDevList: refreshDevsList });
    setState({ isSending: false });
  }

  async function clearDeviceProgramming(dev: DutList, dutsOffline: DutOffline[], dutsErrors: DutError[]): Promise<void> {
    if (dutsOffline.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    let DUTS_SCHEDULES_PERSISTED = [] as ScheduleDut[];
    // Seleciona schedules e exceptions do dispositivo
    await apiCall('/dut/get-dut-schedules', { DUT_ID: dev.DEV_ID, CLIENT_ID: state.clientId, UNIT_ID: state.unitInfo.UNIT_ID })
      .then((response) => {
        DUTS_SCHEDULES_PERSISTED = response.schedules;
        render();
      })
      .catch(console.log);

    const dutSchedules: ApiParams['/dut/set-dut-schedules'] = {
      CLIENT_ID: dev.CLIENT_ID,
      UNIT_ID: dev.UNIT_ID,
      DUT_ID: dev.DEV_ID,
      NEED_MULT_SCHEDULES: false,
      schedules: [],
    };

    dutSchedules.schedules = dutSchedules.schedules.concat(DUTS_SCHEDULES_PERSISTED.map((schedule) => (
      {
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
        IR_ID_COOL: null,
      }
    )));

    const dutProgramming: ApiParams['/dut/update-programming'] = {
      dutId: dev.DEV_ID,
      week: {
        mon: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
        tue: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
        wed: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
        thu: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
        fri: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
        sat: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
        sun: {
          permission: 'allow',
          start: '',
          end: '',
          clearProg: true,
        },
      },
      exceptions: {},
    };

    const dutData: ApiParams['/dut/set-dut-info'] = {
      DEV_ID: dev.DEV_ID,
      CLIENT_ID: dev.CLIENT_ID,
      UNIT_ID: dev.UNIT_ID,
      UPDATE_AUTOM_INFO: true,
    };

    if (state.formData.USE_IR_item) {
      if (state.formData.USE_IR_item.value === 'IR') {
        dutData.PORTCFG = 'IR';
        dutData.USE_IR = 1;
      } else if (state.formData.USE_IR_item.value === 'RELAY') {
        dutData.PORTCFG = 'RELAY';
        dutData.USE_IR = 0;
      } else if (state.formData.USE_IR_item.value === 'DISABLED') {
        dutData.PORTCFG = 'IR';
        dutData.USE_IR = 0;
      }
    }
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

    try {
      await apiCall('/dut/update-programming', dutProgramming);
    }
    catch (err) {
      dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroLimparProg') });
    }

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    // Realiza envios, validando se houve erro
    try {
      await apiCall('/dut/set-dut-info', dutData);
    }
    catch (err) {
      dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarInfo') });
    }

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    try {
      await apiCall('/resend-dut-aut-config', { devId: dev.DEV_ID });
    }
    catch (err) {
      dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroEnviarConfigDut') });
    }

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    try {
      if (DUTS_SCHEDULES_PERSISTED.length > 0) {
        await apiCall('/dut/set-dut-schedules', dutSchedules);
      }
    }
    catch (err) {
      dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarCardsProgramacao') });
    }
  }

  async function clearProgramming() {
    setState({ isLoading: true });
    const selectedDevList = state.filteredDevList.filter((dev) => dev.checked) as DutList[];
    const dutsErrors = [] as DutError[];
    const dutsOffline = [] as DutOffline[];

    if (selectedDevList.length === 0) {
      toast.warn(t('semDispositivoSelecionad'));
      setState({ isLoading: false });
      return;
    }

    for (const device of selectedDevList) {
      if (device.status === 'OFFLINE') {
        dutsOffline.push({ DUT_ID: device.DEV_ID });
      }
    }

    try {
      const promises = selectedDevList.map((dev) => () => clearDeviceProgramming(dev, dutsOffline, dutsErrors).catch((err) => console.log(err)));

      await batchRequests(promises, limitDutScheduleDevices);

      if (dutsErrors.length > 0 || dutsOffline.length > 0) {
        throw new Error();
      }
    }
    catch (err) {
      console.log(err);

      handleDutMessageError(dutsErrors, dutsOffline);
      return;
    }
    toast.success(t('progEnviadaSucesso'));
    clearCards();
    setState({ selectedDevType: '', isLoading: false });
    render();
  }

  async function clearDeviceException(dev: DutList,
    dutsOffline: DutOffline[],
    dutsErrors: DutError[],
    specificDay?: string): Promise<void> {
    if (dutsOffline.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    let DUTS_EXCEPTIONS_PERSISTED = [] as ExceptionDut[];
    // Seleciona schedules e exceptions do dispositivo
    await apiCall('/dut/get-dut-exceptions', { DUT_ID: dev.DEV_ID, CLIENT_ID: state.clientId, UNIT_ID: state.unitInfo.UNIT_ID })
      .then((response) => {
        DUTS_EXCEPTIONS_PERSISTED = response.exceptions;
        render();
      })
      .catch(console.log);

    const dutExceptions: ApiParams['/dut/set-dut-exceptions'] = {
      CLIENT_ID: dev.CLIENT_ID,
      UNIT_ID: dev.UNIT_ID,
      DUT_ID: dev.DEV_ID,
      exceptions: [],
    };

    dutExceptions.exceptions = DUTS_EXCEPTIONS_PERSISTED.map((exception) => {
      const day = `${exception.EXCEPTION_DATE.substring(6, 10)}-${exception.EXCEPTION_DATE.substring(3, 5)}-${exception.EXCEPTION_DATE.substring(0, 2)}`;
      return ({
        DUT_EXCEPTION_ID: exception.DUT_EXCEPTION_ID,
        DELETE: (specificDay && specificDay === day) || !specificDay,
        EXCEPTION_TITLE: exception.EXCEPTION_TITLE,
        REPEAT_YEARLY: exception.REPEAT_YEARLY,
        EXCEPTION_STATUS_ID: exception.EXCEPTION_STATUS_ID,
        EXCEPTION_DATE: day,
        PERMISSION: exception.PERMISSION,
        BEGIN_TIME: exception.BEGIN_TIME,
        END_TIME: exception.END_TIME,
        CTRLOPER: exception.CTRLOPER,
        SETPOINT: exception.SETPOINT,
        LTC: exception.LTC,
        LTI: exception.LTI,
        UPPER_HYSTERESIS: exception.UPPER_HYSTERESIS,
        LOWER_HYSTERESIS: exception.LOWER_HYSTERESIS,
        SCHEDULE_START_BEHAVIOR: exception.SCHEDULE_START_BEHAVIOR,
        SCHEDULE_END_BEHAVIOR: exception.SCHEDULE_END_BEHAVIOR,
        FORCED_BEHAVIOR: exception.FORCED_BEHAVIOR,
        IR_ID_COOL: null,
      });
    });

    const dutProgramming: ApiParams['/dut/update-programming'] = {
      dutId: dev.DEV_ID,
      week: {},
      exceptions: {},
    };

    addExceptionsToClean(dutProgramming, DUTS_EXCEPTIONS_PERSISTED, specificDay);

    try {
      await apiCall('/dut/update-programming', dutProgramming);
    }
    catch (err) {
      dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroLimparExcecoes') });
    }

    if (dutsErrors.find((erro) => erro.DUT_ID === dev.DEV_ID)) {
      return;
    }

    try {
      if (DUTS_EXCEPTIONS_PERSISTED.length > 0) {
        await apiCall('/dut/set-dut-exceptions', dutExceptions);
      }
    }
    catch (err) {
      dutsErrors.push({ DUT_ID: dev.DEV_ID, Motivo: t('erroSalvarCardsExcecao') });
    }
  }

  async function clearExceptions(specificDay?: string) {
    setState({ isLoading: true });
    const selectedDevList = state.filteredDevList.filter((dev) => dev.checked) as DutList[];
    const dutsErrors = [] as DutError[];
    const dutsOffline = [] as DutOffline[];

    if (selectedDevList.length === 0) {
      toast.warn(t('semDispositivoSelecionad'));
      setState({ isLoading: false, openModal: null });
      return;
    }

    for (const device of selectedDevList) {
      if (device.status === 'OFFLINE') {
        dutsOffline.push({ DUT_ID: device.DEV_ID });
      }
    }

    try {
      const promises = selectedDevList.map((dev) => () => clearDeviceException(dev, dutsOffline, dutsErrors, specificDay).catch((err) => console.log(err)));

      await batchRequests(promises, limitDutScheduleDevices);

      if (dutsErrors.length > 0) {
        throw new Error();
      }
    }
    catch (err) {
      console.log(err);
      handleDutMessageError(dutsErrors, dutsOffline);
      return;
    }
    toast.success(t('progEnviadaSucesso'));
    clearCards();
    setState({
      selectedDevType: '',
      isLoading: false,
      openModal: null,
      selectExceptionDate: false,
    });
    setDate(null);
    render();
  }

  async function sendDamSchedule(
    dev: DamList, sched: FullProg_v4, errorsList: { err: Error | string, id: string }[], damsOffline: DamOffline[],
  ): Promise<void> {
    const { formData } = state;
    const damData: ApiParams['/dam/set-dam-info'] = {
      DAM_ID: dev.DAM_ID,
      IGNORE_SET_SENSORS: true,
    };

    try {
      damData.ENABLE_ECO = formData?.ENABLE_ECO_item?.valueN ?? undefined;

      if (damData.ENABLE_ECO && !dev.DUT_ID && !dev.SELF_REFERENCE) {
        toast.error(t('dispositivoEstaComModoEcoMasSemAmbienteReferencia', { value1: dev.DAM_ID }));
        errorsList.push({ err: new Error(t('dispositivoEstaComModoEcoMasSemAmbienteReferencia', { value1: dev.DAM_ID })), id: dev.DAM_ID });
        return;
      }
      const ecoCfg = formData?.ECO_CFG_item?.value ?? undefined;
      damData.REL_DUT_ID = dev.DUT_ID;
      damData.HAD_AUTOMATION_SETTING_CHANGED = true;
      damData.ECO_CFG = ecoCfg;
      damData.ECO_OFST_START = parseDecimalNumber(formData.ECO_OFST_START) != null ? parseDecimalNumber(formData.ECO_OFST_START) : undefined;
      damData.ECO_OFST_END = parseDecimalNumber(formData.ECO_OFST_END) != null ? parseDecimalNumber(formData.ECO_OFST_END) : undefined;
      damData.FU_NOM = parseDecimalNumber(formData.FU_NOM) != null ? parseDecimalNumber(formData.FU_NOM) : undefined;
      if (state.showNewParametersDAM3) {
        damData.UPPER_HYSTERESIS = formData.ECO_UPPER_HYSTERESIS != null && ecoCfg ? parseDecimalNumber(formData.ECO_UPPER_HYSTERESIS || '0') : undefined;
        damData.LOWER_HYSTERESIS = formData.ECO_LOWER_HYSTERESIS != null && ecoCfg ? parseDecimalNumber(formData.ECO_LOWER_HYSTERESIS || '0') : undefined;
        damData.SETPOINT = formData.ECO_SETPOINT != null && ecoCfg ? parseDecimalNumber(formData.ECO_SETPOINT || '0') : undefined;
      }
      damData.SELF_REFERENCE = dev.SELF_REFERENCE;
      damData.MINIMUM_TEMPERATURE = damData.SELF_REFERENCE ? parseDecimalNumber(dev.MINIMUM_TEMPERATURE != null ? dev.MINIMUM_TEMPERATURE.toString() : '20') : undefined;
      damData.MAXIMUM_TEMPERATURE = damData.SELF_REFERENCE ? parseDecimalNumber(dev.MAXIMUM_TEMPERATURE != null ? dev.MAXIMUM_TEMPERATURE.toString() : '28') : undefined;

      if (damData.ENABLE_ECO === 2) {
        damData.SCHEDULE_START_BEHAVIOR = (formData.ECO_SCHEDULE_START_BEHAVIOR_item && formData.ECO_SCHEDULE_START_BEHAVIOR_item.value) || undefined;
        damData.ECO_INT_TIME = parseDecimalNumber(formData.ECO_TIME_INTERVAL_HYSTERESIS || '0') || 0;
        damData.SETPOINT = parseDecimalNumber(formData.ECO_SETPOINT || '0') || 0;
        damData.LTC = parseDecimalNumber(formData.ECO_LTC || '0') || 0;
        damData.LTI = parseDecimalNumber(formData.ECO_LTI || '0') || 0;
        damData.UPPER_HYSTERESIS = parseDecimalNumber(formData.ECO_UPPER_HYSTERESIS || '1') || 1;
        damData.LOWER_HYSTERESIS = parseDecimalNumber(formData.ECO_LOWER_HYSTERESIS || '1') || 1;
      }
      damData.groups = dev.groupsIds ? dev.groupsIds.map((group) => group.toString()) : undefined;

      await apiCall('/dam/set-dam-info', damData).catch((err) => errorsList.push({ err, id: dev.DAM_ID }));

      if (errorsList.some((devErr) => devErr.id === dev.DAM_ID)) {
        return;
      }

      await apiCall('/dam/update-programming', {
        ...sched,
        damId: dev.DAM_ID,
      }).catch((err) => {
        if (err.response?.status !== 500 && err.response?.data === 'Offline device!') {
          damsOffline.push({ DAM_ID: dev.DAM_ID });
          const damIndex = state.filteredDevList.findIndex((dam) => (dam as DamList).DAM_ID === dev.DAM_ID);
          if (damIndex !== -1) {
            state.filteredDevList[damIndex].checked = false;
          }
        } else {
          errorsList.push({ err, id: dev.DAM_ID });
        }
      });
    } catch (err) {
      errorsList.push({ err: t('erroEnvioProgramacaoEmMassaPreenchimento'), id: dev.DAM_ID });
    }
  }

  async function sendSchedule(sched) {
    const errorsList = [] as { err: Error|string, id: string }[];
    let dutsIncompatibles = [] as { DUT_ID: string, Motivo: string }[];

    if (state.selectedDevType === 'DAC') {
      try {
        setState({ isLoading: true });
        const selectedDevList = state.dacsList.filter((dev) => dev.checked);
        const { formData } = state;
        await Promise.all(selectedDevList.map((dev) => {
          const dacData: ApiParams['/dac/set-dac-info'] = {
            DAC_ID: dev.DAC_ID,
          };
          dacData.ENABLE_ECO = (formData.ENABLE_ECO_item && formData.ENABLE_ECO_item.valueN) != null ? formData.ENABLE_ECO_item?.valueN : undefined;
          dacData.ECO_CFG = (formData.ECO_CFG_item && formData.ECO_CFG_item.value) || undefined;
          dacData.ECO_OFST_START = parseDecimalNumber(formData.ECO_OFST_START) != null ? parseDecimalNumber(formData.ECO_OFST_START) : undefined;
          dacData.ECO_OFST_END = parseDecimalNumber(formData.ECO_OFST_END) != null ? parseDecimalNumber(formData.ECO_OFST_END) : undefined;
          dacData.FU_NOM = parseDecimalNumber(formData.FU_NOM) != null ? parseDecimalNumber(formData.FU_NOM) : undefined;
          // Entrará apenas com implementação do ticket 864dgq33t  dacData.SETPOINT = parseDecimalNumber(formData.ECO_SETPOINT || '0') || 0;
          // dacData.UPPER_HYSTERESIS = parseDecimalNumber(formData.ECO_UPPER_HYSTERESIS || '0') || 0;
          // dacData.LOWER_HYSTERESIS = parseDecimalNumber(formData.ECO_LOWER_HYSTERESIS || '0') || 0;
          if (dacData.ENABLE_ECO === 2) {
            dacData.SCHEDULE_START_BEHAVIOR = (formData.ECO_SCHEDULE_START_BEHAVIOR_item && formData.ECO_SCHEDULE_START_BEHAVIOR_item.value) || null;
            dacData.ECO_INT_TIME = parseDecimalNumber(formData.ECO_TIME_INTERVAL_HYSTERESIS || '0') || 0;
            dacData.SETPOINT = parseDecimalNumber(formData.ECO_SETPOINT || '0') || 0;
            dacData.LTC = parseDecimalNumber(formData.ECO_LTC || '0') || 0;
            dacData.LTI = parseDecimalNumber(formData.ECO_LTI || '0') || 0;
            dacData.UPPER_HYSTERESIS = parseDecimalNumber(formData.ECO_UPPER_HYSTERESIS || '1') || 1;
            dacData.LOWER_HYSTERESIS = parseDecimalNumber(formData.ECO_LOWER_HYSTERESIS || '1') || 1;
          }
          dacData.MULT_PROG_SCREEN = true;
          return apiCall('/dac/set-dac-info', dacData).catch((err) => errorsList.push({ err, id: dev.DAC_ID }));
        }));
        await Promise.all(selectedDevList.map((dev) => apiCall('/dam/update-programming', {
          ...sched,
          damId: dev.DAC_ID,
        }).catch((err) => errorsList.push({ err, id: dev.DAC_ID }))));
        if (errorsList.length > 0) {
          throw new Error();
        }
        toast.success('Programação enviada com sucesso');
        setState({ selectedDevType: '', isLoading: false });
      } catch (err) {
        console.log(err);
        let message = 'Houve um erro na programação dos seguintes dispositivos: ';
        const pendingDevs = errorsList.map(({ id, err }) => {
          console.log(err);
          message += `\n${id}`;
          return id;
        });
        const refreshDevsList = state.dacsList.map((dac) => {
          if (!pendingDevs.includes(dac.DAC_ID)) {
            return { ...dac, checked: false };
          }
          return dac;
        });
        setState({ dacsList: refreshDevsList, isLoading: false });
        toast.error(message);
      }
    }
    if (state.selectedDevType === 'DAM') {
      const damsOffline: DamOffline[] = [];
      const selectedDevList = state.filteredDevList.filter((dev) => dev.checked) as DamList[];
      setProgressState({
        currentDevices: 0,
        totalDevices: selectedDevList.length,
      });
      try {
        setState({ isSending: true });
        toast.info(t('iniciadoProgramacaoEmMassa'));
        const promises = selectedDevList.map((dev) => (
          () => sendDamSchedule(dev, sched, errorsList, damsOffline).then(() => {
            onCompleteProgressDevice();
          })));

        await batchRequests(promises, limitDamScheduleDevices);

        if (errorsList.length > 0 || damsOffline.length > 0) {
          render();
          throw new Error();
        }
        toast.success(t('progEnviadaSucesso'));

        await new Promise((resolve) => setTimeout(resolve, 300));
        setState({ selectedDevType: '', isSending: false });
      } catch (err) {
        handleDamMessageError(errorsList, damsOffline);
      }
    }
    if (state.selectedDevType === 'DUT') {
      try {
        setState({ isLoading: true });
        const selectedDevList = state.filteredDevList.filter((dev) => dev.checked) as DutList[];
        const { formData } = state;
        let validateEco2 = true;

        const result = await checkCompatibiltyWithOperationMode(selectedDevList);
        let dutsCompatibles = result.dutsCompatibles;
        dutsIncompatibles = result.dutsIncompatibles;

        await Promise.all(dutsCompatibles.map(async (dev) => {
          const dutData: ApiParams['/dut/set-dut-info'] = {
            DEV_ID: dev.DEV_ID,
          };
          const useIrValue = formData.USE_IR_item?.value === 'IR' ? 0 : 1;
          dutData.USE_IR = (formData.USE_IR_item && formData.USE_IR_item.value) != null ? useIrValue : undefined;
          dutData.CTRLOPER = (formData.CTRLOPER_item) != null ? formData.CTRLOPER_item.value : undefined;
          dutData.TSETPOINT = parseDecimalNumber(formData.TSETPOINT) != null ? parseDecimalNumber(formData.TSETPOINT) : undefined;
          dutData.LTCRIT = parseDecimalNumber(formData.LTCRIT) != null ? parseDecimalNumber(formData.LTCRIT) : undefined;
          dutData.LTINF = parseDecimalNumber(formData.LTINF) != null ? parseDecimalNumber(formData.LTINF) : undefined;
          // dutData.FU_NOM = formData.FU_NOM ? parseDecimalNumber(formData.FU_NOM) : null;
          dutData.FORCED_BEHAVIOR = formData.FORCED_BEHAVIOR_item ? formData.FORCED_BEHAVIOR_item.value : state.comboOpts.dutForcedBehavior[0].value;
          if (dutData.CTRLOPER === '6_BACKUP_CONTROL_V2' && state.hysteresisChecked) {
            validateEco2 = validateEco2Values();
            if (validateEco2) {
              dutData.CTRLOPER = '8_ECO_2';
              dutData.UPPER_HYSTERESIS = formData.ECO_UPPER_HYSTERESIS ? parseDecimalNumber(formData.ECO_UPPER_HYSTERESIS) || 1 : null;
              dutData.LOWER_HYSTERESIS = formData.ECO_LOWER_HYSTERESIS ? parseDecimalNumber(formData.ECO_LOWER_HYSTERESIS) || 1 : null;
              dutData.SCHEDULE_START_BEHAVIOR = formData.ECO_DUT_SCHEDULE_START_BEHAVIOR_item ? formData.ECO_DUT_SCHEDULE_START_BEHAVIOR_item.value : state.comboOpts.dutScheduleStartBehavior[0].value;
              dutData.SCHEDULE_END_BEHAVIOR = formData.ECO_DUT_SCHEDULE_END_BEHAVIOR_item ? formData.ECO_DUT_SCHEDULE_END_BEHAVIOR_item.value : state.comboOpts.dutScheduleEndBehavior[0].value;
            }
            else {
              setState({ isLoading: false });
              return;
            }
          }

          let irCommands;
          if (formData.CTRLOPER_item?.value === '7_FORCED' && formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool') {
            await apiCall('/get-dut-ircodes-list', { devId: dev.DEV_ID })
              .then((response) => {
                const dutIrCodes = response.list;
                irCommands = identifyDutIrCommands(dutIrCodes)
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
                if (irCommands.find((item) => item.TEMPER === Number(formData.TSETPOINT)) == null) {
                  dutsIncompatibles.push({ DUT_ID: dev.DEV_ID, Motivo: 'Código IR no setpoint escolhido não cadastrado!' });
                }
              }).catch((err) => dutsIncompatibles.push({ DUT_ID: dev.DEV_ID, Motivo: 'Código IR no setpoint escolhido não cadastrado!' }));
            dutData.IR_ID_COOL = irCommands.find((item) => item.TEMPER === Number(formData.TSETPOINT))?.IR_ID;
          }

          if (!dutsIncompatibles.find((item) => item.DUT_ID === dev.DEV_ID)) {
            return apiCall('/dut/set-dut-info', dutData).catch((err) => errorsList.push({ err, id: dev.DEV_ID }));
          }
        }));

        if (!validateEco2) {
          return;
        }
        const dutsIdsIncompatibles = dutsIncompatibles.map((item) => item.DUT_ID);
        dutsCompatibles = dutsCompatibles.filter((item) => !dutsIdsIncompatibles.includes(item.DEV_ID));

        await Promise.all(dutsCompatibles.map((dev) => {
          apiCall('/dut/update-programming', {
            ...sched,
            dutId: dev.DEV_ID,
          }).catch((err) => errorsList.push({ err, id: dev.DEV_ID }));
          apiCall('/resend-dut-ir-codes', {
            devId: dev.DEV_ID,
          }).catch((err) => errorsList.push({ err, id: dev.DEV_ID }));
        }));

        await Promise.all(dutsCompatibles.map(async (dev) => {
          const devInfo = await getCachedDevInfo(dev.DEV_ID);
          const isDutAut = !!(devInfo && devInfo.dut_aut);
          if (isDutAut) {
            await apiCall('/resend-dut-aut-config', { devId: dev.DEV_ID })
              .catch((err) => {
                if (!errorsList.find((err) => err.id === dev.DEV_ID)) {
                  errorsList.push({ err, id: dev.DEV_ID });
                }
              });
          }
        }));
        if (errorsList.length > 0) {
          dutsIncompatibles.forEach((item) => {
            errorsList.push({ err: new Error(item.Motivo), id: item.DUT_ID });
          });
          throw new Error();
        }

        if (dutsIncompatibles.length === 0) {
          toast.success('Programação enviada com sucesso');
          setState({ selectedDevType: '', isLoading: false });
        }
        else {
          toast.error(`Não foi possível configurar os dispositivos: ${dutsIdsIncompatibles.join(',')}
          \n${dutsIncompatibles.map((item) => `${item.DUT_ID} ${item.Motivo}\n`)}`);

          const refreshDevsList = state.dutsList.map((dut) => {
            if (!dutsIdsIncompatibles.includes(dut.DEV_ID)) {
              return { ...dut, checked: false };
            }
            return dut;
          });
          setState({ dutsList: refreshDevsList, isLoading: false });
        }
      } catch (err) {
        console.log(err);
        let message = 'Houve um erro na programação dos seguintes dispositivos: ';
        const pendingDevs = errorsList.map(({ id, err }) => {
          console.log(err);
          message += `\n${id}`;
          return id;
        });

        const refreshDevsList = state.dutsList.map((dut) => {
          if (!pendingDevs.includes(dut.DEV_ID)) {
            return { ...dut, checked: false };
          }
          return dut;
        });
        setState({ dutsList: refreshDevsList, isLoading: false });
        toast.error(message);
      }
    }

    render();
  }

  async function checkCompatibiltyWithOperationMode(selectedDevList: { DEV_ID: string }[], controlMode?: ControlMode, forcedBehavior?: string) {
    const dutsToCheck = selectedDevList.map((item) => item.DEV_ID);
    if (controlMode || forcedBehavior) {
      const { dutsCompatibility } = await apiCall('/dut/get-compatibility-list', { dutIds: dutsToCheck, CTRLOPER: controlMode, FORCED_BEHAVIOR: forcedBehavior });

      const dutsCompatibles = dutsCompatibility.filter((dut) => dut.compatible).map((filtered) => filtered.DUT_ID) as string[];
      const dutsIncompatibles = dutsCompatibility.filter((dut) => !dut.compatible)
        .map((filtered) => ({
          DUT_ID: filtered.DUT_ID,
          Motivo: controlMode ? 'Não está na versão mínima para o modo de Operação selecionado.' : 'Não está na versão mínima para a funcionalidade Ventilar do Modo Forçado',
        })) as {
          DUT_ID: string,
          Motivo: string,
        }[];

      return { dutsCompatibles: selectedDevList.filter((dut) => dutsCompatibles.includes(dut.DEV_ID)), dutsIncompatibles };
    }

    return { dutsCompatibles: selectedDevList, dutsIncompatibles: [] };
  }

  const getDevProperties = useCallback((): DevProperties => {
    const devType = state.selectedDevType;
    let devsList = [] as DevList[];

    let id = '';
    let name = '';
    let groupName = '';
    let dutId = '';
    let unitId = '';
    let unitName = '';
    let canSelfReference = '';
    let selfReference = '';
    let minimumTemperature = '';
    let maximumTemperature = '';
    let cityName = '';
    let stateName = '';
    let status = '';
    let enabledEco = '';
    let mode = '';
    let ctrlOperation = '';
    let autConfiguration = '';
    if (devType === 'DAC') {
      devsList = state.dacsList;
      id = 'DAC_ID';
      name = 'GROUP_NAME';
      state.damsList.forEach((dam) => dam.checked = false);
      state.dutsList.forEach((dut) => dut.checked = false);
    } else if (devType === 'DAM') {
      devsList = state.damsList;
      id = 'DAM_ID';
      name = 'UNIT_NAME';
      groupName = 'groupsNames';
      dutId = 'DUT_ID';
      unitId = 'UNIT_ID';
      canSelfReference = 'CAN_SELF_REFERENCE';
      selfReference = 'SELF_REFERENCE';
      minimumTemperature = 'MINIMUM_TEMPERATURE';
      maximumTemperature = 'MAXIMUM_TEMPERATURE';
      stateName = 'STATE_NAME';
      cityName = 'CITY_NAME';
      unitName = 'UNIT_NAME';
      status = 'status';
      enabledEco = 'ENABLED_ECO';
      mode = 'mode';
      state.dacsList.forEach((dac) => dac.checked = false);
      state.dutsList.forEach((dut) => dut.checked = false);
    } else if (devType === 'DUT') {
      devsList = state.dutsList;
      id = 'DEV_ID';
      name = 'ROOM_NAME';
      unitName = 'UNIT_NAME';
      unitId = 'UNIT_ID';
      stateName = 'STATE_NAME';
      cityName = 'CITY_NAME';
      status = 'status';
      ctrlOperation = 'CTRLOPER';
      autConfiguration = 'PORTCFG';
      state.dacsList.forEach((dac) => dac.checked = false);
      state.damsList.forEach((dam) => dam.checked = false);
    }
    return {
      id,
      name,
      groupName,
      dutId,
      unitId,
      unitName,
      canSelfReference,
      selfReference,
      minimumTemperature,
      maximumTemperature,
      cityName,
      stateName,
      devType,
      devsList,
      status,
      enabledEco,
      mode,
      ctrlOperation,
      autConfiguration,
    };
  }, [state.dacsList, state.damsList, state.dutsList, state.selectedDevType]);

  const clearSelectedNonFilterResults = (filteredResults: (DamList | DutList)[], id: string) => {
    const nonFilteredSelectedResults = state.filteredDevList.filter(
      (dev) => dev.checked && !filteredResults.some((result) => result[id] === dev[id]),
    );

    for (const result of nonFilteredSelectedResults) {
      result.checked = false;
    }
  };

  const callDutsFilter = useCallback(async (filterOptions: SelectedFilterDutOptions) => {
    if (clientId) {
      state.isFiltering = true;
      render();
      const {
        cities,
        connections,
        dutAutConfigs,
        dutControlOperations,
        searchState,
        states,
        units,
        hasProgrammingMult,
      } = filterOptions;

      const { list: dutsList } = await apiCall('/dut/get-duts-list', {
        clientIds: [clientId],
        stateIds: verifyValueDefinedNotEmpty(states),
        cityIds: verifyValueDefinedNotEmpty(cities),
        status: verifyValueDefinedNotEmpty(connections),
        controlMode: verifyValueDefinedNotEmpty(dutControlOperations),
        automationConfig: verifyValueDefinedNotEmpty(dutAutConfigs),
        searchTerms: verifyValueDefinedNotEmpty(searchState)?.map(({ text }) => text.toLowerCase()),
        unitIds: verifyValueDefinedNotEmpty(units)?.map((unit) => Number(unit)),
        hasProgrammingMult,
      });

      state.isFiltering = false;
      const filteredArray = formatDutsList(dutsList);
      clearSelectedNonFilterResults(filteredArray, 'DEV_ID');
      state.filteredDevList = filteredArray;
      render();
    }
  }, []);

  const onClickSelectAllDevicesList = (devsList: DevList[]): void => {
    if (devsList.length > 0) {
      toggleSelectAllDevices(devsList);
      render();
    }
  };

  const onClickSelectAllDevices = useCallback(() => {
    if (state.filteredDevList.length > 0) {
      toggleSelectAllDevices(state.filteredDevList);
      render();
    }
  }, [state.filteredDevList]);

  const adjustProgrammingFilter = (programming?: string): boolean | undefined => {
    if (!programming || programming === 'Todos') {
      return undefined;
    }
    return programming === 'Com Programacao';
  };

  const callDamsFilter = useCallback(async (filterOptions: SelectedFilterDamOptions) => {
    if (clientId) {
      const {
        states, cities, units, controlModes, ecoModes, connections, programming, searchState,
      } = filterOptions;

      state.isFiltering = true;
      render();

      const [{ list: damsList }] = await Promise.all([
        apiCall('/dam/get-dams-list', {
          clientIds: [clientId],
          removeIlluminations: true,
          stateIds: verifyValueDefinedNotEmpty(states),
          cityIds: verifyValueDefinedNotEmpty(cities),
          unitIds: verifyValueDefinedNotEmpty(units) ? units?.map((unit) => Number(unit)) : undefined,
          controlMode: verifyValueDefinedNotEmpty(controlModes),
          ecoMode: verifyValueDefinedNotEmpty(ecoModes),
          status: verifyValueDefinedNotEmpty(connections),
          searchTerms: verifyValueDefinedNotEmpty(searchState) ? searchState?.map(({ text }) => text.toLowerCase()) : undefined,
          hasProgramming: adjustProgrammingFilter(programming),
        }),
        getDutsToReference(clientId),
      ]);

      state.isFiltering = false;
      const filteredArray = formatDamsList(damsList);
      clearSelectedNonFilterResults(filteredArray, 'DEV_ID');
      state.filteredDevList = filteredArray;
      verifyShowNewParametersDAM3();
      render();
    }
  }, [clientId]);

  function onClickSelectDevice(dev: DevList): void {
    dev.checked = !dev.checked;
    render();
  }

  const renderFullProgEdit = useMemo(() => (state.selectedDevType === 'DAM' && state.filteredDevList.length > 0) || (state.selectedDevType === 'DAC' && state.dacsList.length > 0),
    [state.selectedDevType, state.filteredDevList, state.dacsList]);

  const RenderDevicesTable = (): ReactElement => {
    const {
      id,
      name,
      unitName,
      cityName,
      stateName,
      unitId: unitIdKey,
      dutId,
      groupName,
      canSelfReference,
      selfReference,
      minimumTemperature,
      maximumTemperature,
      devsList,
    } = getDevProperties();

    if (state.selectedDevType === 'DUT') {
      return (
        <div>
          <DutFilter
            isFiltering={state.isFiltering}
            onClickFilter={callDutsFilter}
            clientId={clientId}
            unitId={unitId}
          />
          <Flex flexDirection="column" width="100%" mb="15px">
            <SelectAllDevices
              isAllSelected={isAllDevicesSelected(state.filteredDevList)}
              onClickSelect={onClickSelectAllDevices}
            />
          </Flex>
          <DutTable
            data={state.filteredDevList}
            keys={{
              cityName,
              id,
              name,
              stateName,
              unitId: unitIdKey,
              unitName,
            }}
            render={render}
            clientId={clientId}
            isLoading={state.isFiltering}
          />
        </div>
      );
    }
    if (state.selectedDevType === 'DAM') {
      return (
        <div>
          <DamFilter
            onClickFilter={callDamsFilter}
            isFiltering={state.isFiltering}
            clientId={clientId}
            unitId={unitId}
          />
          <Flex flexDirection="column" width="100%" mb="15px">
            <SelectAllDevices
              isAllSelected={isAllDevicesSelected(state.filteredDevList)}
              onClickSelect={onClickSelectAllDevices}
            />
          </Flex>
          <DamTable
            clientId={clientId}
            data={state.filteredDevList}
            dutsToReference={state.dutsListToReference}
            keys={{
              canSelfReference,
              cityName,
              dutId,
              groupName,
              id,
              maximumTemperature,
              minimumTemperature,
              name,
              selfReference,
              stateName,
              unitId: unitIdKey,
            }}
            isLoading={state.isFiltering}
            render={render}
          />
        </div>
      );
    }
    if (state.selectedDevType === 'Iluminação') {
      return (
        <IlluminationMultipleProg clientId={clientId} unitId={unitId} />
      );
    }

    return (
      <DefaultDeviceTable
        devType={state.selectedDevType}
        devsList={devsList}
        idKey={id}
        nameKey={name}
        onClickSelectDevice={onClickSelectDevice}
        selectAllDevicesElement={(
          <SelectAllDevices
            isAllSelected={isAllDevicesSelected(devsList)}
            onClickSelect={() => onClickSelectAllDevicesList(devsList)}
          />
        )}
      />
    );
  };

  if (state.isSending) {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Loader />
        <ProgrammingProgress currentDevices={progressState.currentDevices} totalDevices={progressState.totalDevices} />
      </Flex>
    );
  }

  if (state.isLoading) {
    return (
      <Loader />
    );
  }

  if (state.isSending) {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Loader />
        <ProgrammingProgress currentDevices={progressState.currentDevices} totalDevices={progressState.totalDevices} />
      </Flex>
    );
  }

  return (
    <div>
      {/* <h2>Programação Múltipla de Dispositivos</h2> */}
      <SelectDevType
        defaultDev={state.selectedDevType}
        onFilterDevChange={onFilterDevChange}
      />
      {state.selectedDevType && (
      <div>
        {RenderDevicesTable()}
        {renderFullProgEdit && (
        <div style={{ display: 'flex', paddingTop: '15px', flexWrap: 'wrap' }}>
          <ElevatedCard style={{ width: '800px' }}>
            <FullProgEdit fullProg={state.initialProg} onConfirm={sendSchedule} onChange={updateSchedule} devType={state.selectedDevType} devConfigOpts={renderDevConfigOptions()} multiple />
          </ElevatedCard>
        </div>
        )}
        {state.selectedDevType === 'DUT' && state.filteredDevList.length > 0 && (
        <>
          <div style={{ display: 'flex', paddingTop: '15px', flexWrap: 'wrap' }}>
            <ElevatedCard style={{ width: '800px' }}>
              {dutCardsSchedulesExceptionsConfig}
            </ElevatedCard>
          </div>
          <div style={{ display: 'flex', paddingTop: '15px', flexWrap: 'wrap' }}>
            <Button style={{ maxWidth: '100px' }} disabled={state.isSaving} onClick={() => sendDutSchedule()} variant="primary">
              {t('botaoSalvar')}
            </Button>
          </div>
        </>
        )}
      </div>
      )}
      {(state.openModal != null) && (
      <ModalWindow
        style={{ padding: '0', overflowX: 'hidden' }}
        onClickOutside={() => setState({ openModal: null, selectExceptionDate: false })}
        id="schedule-modal"
      >
        {state.openModal === 'add-edit-schedule'
                && (
                <ScheduleEditCard
                  cardIndex={state.selectedIndexSchedule}
                  schedule={state.selectedSchedule}
                  dutControlOperation={state.comboOpts.dutControlOperation}
                  dutScheduleStartBehavior={state.comboOpts.dutScheduleStartBehavior}
                  dutCompatibilityHysteresisEco2={state.dutCompatibilityHysteresisEco2}
                  dutScheduleEndBehavior={state.comboOpts.dutScheduleEndBehavior}
                  dutForcedBehavior={state.comboOpts.dutForcedBehavior}
                  irCommands={state.irCommands}
                  temperaturesForcedSetpoint={[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]}
                  onHandleSave={saveSchedule}
                  onHandleCancel={() => { setState({ openModal: null }); }}
                  isFromMultipleProg
                />
                )}
        {state.openModal === 'add-edit-exception'
                && (
                <ExceptionEditCard
                  cardIndex={state.selectedIndexException}
                  exception={state.selectedException}
                  dutControlOperation={state.comboOpts.dutControlOperation}
                  dutScheduleStartBehavior={state.comboOpts.dutScheduleStartBehavior}
                  dutCompatibilityHysteresisEco2={state.dutCompatibilityHysteresisEco2}
                  dutScheduleEndBehavior={state.comboOpts.dutScheduleEndBehavior}
                  dutForcedBehavior={state.comboOpts.dutForcedBehavior}
                  irCommands={state.irCommands}
                  temperaturesForcedSetpoint={[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]}
                  onHandleSave={saveException}
                  onHandleCancel={() => { setState({ openModal: null }); }}
                  isFromMultipleProg
                />
                )}
        {state.openModal === 'clear-exception'
                && (
                  <Flex flexDirection="column" justifyContent="center" alignItems="center" paddingY="80px">
                    <Box width="70%">
                      <h2 style={{ fontWeight: 'bold' }}>{t('limparExcecoes')}</h2>
                      {!state.selectExceptionDate
                      && (
                        <>
                          <p>{t('modoDeExclusaoExcecao')}</p>

                          <Flex flexDirection="row" marginTop="20px" justifyContent="space-between">
                            <Button
                              style={{ width: '48%' }}
                              variant="primary"
                              onClick={() => { state.selectExceptionDate = true; render(); }}
                            >
                              {t('limparExcecaoDia')}
                            </Button>
                            <Button
                              style={{ width: '48%' }}
                              variant="primary"
                              onClick={() => {
                                clearExceptions();
                              }}
                            >
                              {t('limparTodasExcecoes')}
                            </Button>
                          </Flex>
                        </>
                      )}
                      {state.selectExceptionDate
                      && (
                        <>
                          <p>{t('selecioneDiaLimpar')}</p>

                          <Flex flexDirection="column" marginTop="20px" justifyContent="space-between">
                            <ContentDate>
                              <Label>{t('data')}</Label>
                              <SingleDatePicker
                                date={date}
                                onDateChange={setDate}
                                id="datepicker"
                                numberOfMonths={1}
                                focused={calendarFocused}
                                onFocusChange={({ focused }) => setCalendarFocused(focused)}
                                isOutsideRange={() => false}
                              />
                              <StyledCalendarIcon color="#202370" />
                            </ContentDate>
                            <Button
                              style={{ width: '100%', marginTop: '100px' }}
                              variant="primary"
                              onClick={() => {
                                clearExceptions(date?.format('YYYY-MM-DD'));
                              }}
                            >
                              {t('limparUpper')}
                            </Button>
                          </Flex>
                        </>
                      )}
                      <Flex marginTop="20px" justifyContent="center">
                        <Button
                          style={{ width: state.selectExceptionDate ? '100%' : '260px' }}
                          variant="secondary"
                          onClick={() => {
                            state.openModal = null;
                            state.selectExceptionDate = false;
                            render();
                          }}
                        >
                          CANCELAR
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                )}
      </ModalWindow>
      )}
    </div>
  );
};
