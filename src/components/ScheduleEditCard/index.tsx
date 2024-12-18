import {
  useEffect, ChangeEvent, useState, ReactElement,
  useMemo,
  useCallback,
} from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  TextLine, CustomSelect,
} from './styles';
import { toast } from 'react-toastify';
import { ScheduleDut } from '../../providers/types/api-private';
import BackupEcoV2 from '../../assets/img/BackupEcoV2.png';
import EcoV2 from '../../assets/img/EcoV2.png';
import ModoSobDemanda from '../../assets/img/ModoSobDemanda.png';
import SobDemanda from '../../assets/img/SobDemanda.png';
import { Image } from 'antd';
import { CheckboxIcon, InfoIcon } from 'icons';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { Trans, useTranslation } from 'react-i18next';

import {
  Input, RadioButton, Checkbox, Button, InputCalculator,
  Select,
} from 'components';

import {
  ToggleSwitchMini,
} from '../ToggleSwitch';
import { apiCall } from '../../providers';
import ReactTooltip from 'react-tooltip';
import { HoverExportList } from '~/pages/Analysis/Utilities/UtilityFilter/styles';
import { isFwVersionGreatestOrEqual } from '~/helpers';
import { getContainerModal } from '~/helpers/modalImage';
import { isNewChangesOnDemandMode, isNewChangesOnDemandModeVersion } from '~/helpers/dutScheduleConfig';
import { ComponentProps, NewOption, ScheduleEditCardFormData } from './types';
import { colors } from 'styles/colors';
import {
  defaultActionModeOptions, defaultActionModes, defaultActionPostModeOptions, getCoolSetpointDefaultCommandValue, getOptionByKey,
  MIN_LTI_SETPOINT_SCHEDULE,
} from './constants';

export function CoolSetPointLabel({ setpoint } : {
  readonly setpoint?: string | null
}): ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <span style={{ fontSize: '0.875em' }}>{t('refrigerar')}</span>
      {' '}
      <strong style={{ fontSize: '0.875em', color: colors.Blue700 }}>
        [
        {setpoint ? `${setpoint}ºC` : '-'}
        ]
      </strong>
    </>
  );
}

export const ScheduleEditCard = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();

  const [actionModes, setActionModes] = useState(defaultActionModes);
  const [actionModeOptions, setActionModeOptions] = useState<NewOption[]>(
    defaultActionModeOptions,
  );
  const [actionPostModeOptions, setActionPostModeOptions] = useState<NewOption[]>(
    defaultActionPostModeOptions,
  );

  const getActionKeyFromValue = (value: string): string => {
    for (const key of Object.keys(actionModes)) {
      if (actionModes[key] === value) return key;
    }
    return t('modoDesligar');
  };

  const [state, render] = useStateVar({
    formData: {
      DUT_SCHEDULE_ID: props.schedule?.DUT_SCHEDULE_ID || null,
      SCHEDULE_TITLE: props.schedule?.SCHEDULE_TITLE || null,
      SCHEDULE_STATUS: props.schedule != null ? props.schedule.SCHEDULE_STATUS : true,
      BEGIN_TIME: props.schedule?.BEGIN_TIME || null,
      END_TIME: props.schedule?.END_TIME || null,
      CTRLOPER: props.schedule?.CTRLOPER || null,
      PERMISSION: props.schedule?.PERMISSION || 'allow',
      DAYS: {
        mon: props.schedule?.DAYS.mon != null ? props.schedule.DAYS.mon : true,
        tue: props.schedule?.DAYS.tue != null ? props.schedule.DAYS.tue : true,
        wed: props.schedule?.DAYS.wed != null ? props.schedule.DAYS.wed : true,
        thu: props.schedule?.DAYS.thu != null ? props.schedule.DAYS.thu : true,
        fri: props.schedule?.DAYS.fri != null ? props.schedule.DAYS.fri : true,
        sat: props.schedule?.DAYS.sat != null ? props.schedule.DAYS.sat : false,
        sun: props.schedule?.DAYS.sun != null ? props.schedule.DAYS.sun : false,
      },
      SETPOINT: props.schedule?.SETPOINT?.toString().replace('.', ',') || null,
      LTC: props.schedule?.LTC?.toString().replace('.', ',') || null,
      LTI: props.schedule?.LTI?.toString().replace('.', ',') || null,
      UPPER_HYSTERESIS: props.schedule?.UPPER_HYSTERESIS?.toString().replace('.', ',') || '1',
      LOWER_HYSTERESIS: props.schedule?.LOWER_HYSTERESIS?.toString().replace('.', ',') || '1',
      SCHEDULE_START_BEHAVIOR: props.schedule?.SCHEDULE_START_BEHAVIOR || null,
      SCHEDULE_END_BEHAVIOR: props.schedule?.SCHEDULE_END_BEHAVIOR || null,
      FORCED_BEHAVIOR: props.schedule?.FORCED_BEHAVIOR || null,
      CTRLOPER_item: props.schedule?.CTRLOPER ? props.dutControlOperation.find((item) => item.value === props.schedule?.CTRLOPER || (props.schedule?.CTRLOPER === '8_ECO_2' && item.value === '6_BACKUP_CONTROL_V2')) : null as null|{ label: string, value: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED' },
      SCHEDULE_START_BEHAVIOR_item: props.schedule?.SCHEDULE_START_BEHAVIOR ? props.dutScheduleStartBehavior.find((item) => item.value === props.schedule?.SCHEDULE_START_BEHAVIOR) : props.dutScheduleStartBehavior[0] as null|{ label: string, value: string },
      SCHEDULE_END_BEHAVIOR_item: props.schedule?.SCHEDULE_END_BEHAVIOR ? props.dutScheduleEndBehavior.find((item) => item.value === props.schedule?.SCHEDULE_END_BEHAVIOR) : props.dutScheduleEndBehavior[0] as null|{ label: string, value: 'dut-schedule-end-behavior-off' },
      FORCED_BEHAVIOR_item: props.schedule?.FORCED_BEHAVIOR ? props.dutForcedBehavior.find((item) => item.value === props.schedule?.FORCED_BEHAVIOR) : props.dutForcedBehavior[0] as { label: string, value: string },

      ACTION_TIME: props.schedule?.ACTION_TIME ? (props.schedule?.ACTION_TIME / 60).toFixed(0) : '60',
      ACTION_MODE: getActionKeyFromValue(props.schedule?.ACTION_MODE || 'ECO'),
      ACTION_POST_BEHAVIOR: getActionKeyFromValue(props.schedule?.ACTION_POST_BEHAVIOR || 'Disabled'),
      SETPOINT_ON_DEMAND: null,
    } as ScheduleEditCardFormData,
    formErrors: {
      SCHEDULE_TITLE: '',
      BEGIN_TIME: '',
      END_TIME: '',
      SETPOINT: '',
      LTC: '',
      LTI: '',
      UPPER_HYSTERESIS: '',
      LOWER_HYSTERESIS: '',
      CTRLOPER: '',
      ACTION_TIME: '',
      ACTION_MODE: '',
      ACTION_POST_BEHAVIOR: '',
      SETPOINT_ON_DEMAND: '',
    },
    hysteresisChecked: props.schedule?.CTRLOPER === '8_ECO_2' || false as boolean,
    allDay: props.schedule ? props.schedule.BEGIN_TIME === '00:00' && props.schedule.END_TIME === '23:59' : false as boolean,
    showSetPoint: props.schedule?.CTRLOPER ? props.schedule.PERMISSION === 'allow' && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER) : false as boolean,
    showLtc: props.schedule?.CTRLOPER ? props.schedule.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER) : false as boolean,
    showLti: props.schedule?.CTRLOPER ? props.schedule.PERMISSION === 'allow' && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER) : false as boolean,
    showForcedOptions: props.schedule?.CTRLOPER ? props.schedule.PERMISSION === 'allow' && ['7_FORCED'].includes(props.schedule.CTRLOPER) : false as boolean,
    showEco2Options: props.schedule?.CTRLOPER ? props.schedule.PERMISSION === 'allow' && props.dutCompatibilityHysteresisEco2 && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER) : false as boolean,
    showSetPointForced: props.schedule?.CTRLOPER ? props.schedule.PERMISSION === 'allow' && ['7_FORCED'].includes(props.schedule.CTRLOPER) && props.schedule.FORCED_BEHAVIOR === 'dut-forced-cool' : false as boolean,
    fwVersion: null as null | string,
    actionMode: getOptionByKey(getActionKeyFromValue(props.schedule?.ACTION_MODE ?? 'ECO'), actionModeOptions),
    actionPostMode: getOptionByKey(getActionKeyFromValue(props.schedule?.ACTION_POST_BEHAVIOR ?? 'Disabled'), actionPostModeOptions),
  });

  function onDemandChanges(): boolean {
    return isNewChangesOnDemandMode(state.formData.CTRLOPER_item?.value ?? '', state.fwVersion ?? '');
  }

  const coolOptionElement = useCallback((setpoint: string | null): NewOption => ({
    label: <CoolSetPointLabel setpoint={setpoint} />,
    value: t('refrigerar'),
  }), []);

  function updateActionsOnDemandMode(): void {
    if (onDemandChanges()) {
      setActionModes((prevValue) => {
        const newActionMode = { ...prevValue };
        delete newActionMode[t('habilitado')];
        newActionMode[t('refrigerar')] = 'Enabled';
        return newActionMode;
      });

      setActionModeOptions((prevValues) => {
        const newActionOptions: NewOption[] = [];
        for (const value of prevValues) {
          if (value.value === t('habilitado')) {
            newActionOptions.push(coolOptionElement(state.formData.SETPOINT_ON_DEMAND));
          } else {
            newActionOptions.push(value);
          }
        }
        return newActionOptions;
      });

      setActionPostModeOptions((prevValues) => {
        const newOptions: NewOption[] = [];
        for (const value of prevValues) {
          if (value.value === t('habilitado')) {
            newOptions.push(coolOptionElement(state.formData.SETPOINT_ON_DEMAND));
          } else {
            newOptions.push(value);
          }
        }
        return newOptions;
      });
    }
  }

  function setpointInteger(): void {
    state.formData.SETPOINT = state.formData.SETPOINT ? Math.floor(Number(state.formData.SETPOINT)).toString() : '';
    render();
  }

  function updatePropsChangesOnDemandMode(currentVersion: string | null): void {
    if (isNewChangesOnDemandModeVersion(state.fwVersion ?? '')) {
      setpointInteger();
    }
    if (props.schedule) {
      if (isNewChangesOnDemandMode(props.schedule.CTRLOPER, currentVersion ?? '')) {
        state.showLti = true;
        setpointOnDemand();
        updateActionsOnDemandMode();

        if (props.schedule.ACTION_MODE && props.schedule.ACTION_MODE === 'Enabled') {
          state.actionMode = coolOptionElement(state.formData.SETPOINT_ON_DEMAND);
        }
        if (props.schedule.ACTION_POST_BEHAVIOR && props.schedule.ACTION_POST_BEHAVIOR === 'Enabled') {
          state.actionPostMode = coolOptionElement(state.formData.SETPOINT_ON_DEMAND);
        }
        render();
      }
    }
  }

  const getFWVersion = async (devId: string) => {
    try {
      const fwInfo = await apiCall('/dev/request-firmware-info', { devId });
      state.fwVersion = fwInfo?.firmware_version || null;
      render();
    } catch (err) {
      toast.error(t('houveErroBuscandoVersaoFirmware'));
    }
  };

  const temprtControlModeDetails = {
    '1_CONTROL': 'detalhesModoControle1',
    '2_SOB_DEMANDA': onDemandChanges() ? 'detalhesNovoModoControle2' : 'detalhesModoControle2',
    '4_BLOCKED': 'detalhesModoControle4',
    '5_BACKUP_CONTROL': 'detalhesModoControle5',
    '6_BACKUP_CONTROL_V2': 'detalhesModoControle6',
    '7_FORCED': 'detalhesModoControle7',
  };

  function valideForcedOptions() {
    if (state.formData.CTRLOPER_item != null && state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value)) {
      const haveForcedFan = props.dutForcedBehavior.find((item) => item.value === 'dut-forced-fan');
      if (!haveForcedFan) {
        toast.info(t('avisoDutIrSemVentilacao'));
      }
    }
  }

  function setpointForced() {
    try {
      state.showSetPointForced = state.formData.CTRLOPER_item != null && state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value) && state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool';
      if (state.showSetPointForced && props.irCommands.length === 0 && (props.temperaturesForcedSetpoint == null || props.temperaturesForcedSetpoint?.length === 0)) {
        state.showSetPointForced = false;
        toast.info(t('avisoDutIrNomeInvalido'));
      }

      if (state.showSetPointForced) {
        const persistedForcedCool = props.schedule?.CTRLOPER === '7_FORCED' && props.schedule?.FORCED_BEHAVIOR === 'dut-forced-cool';
        let forcedSetpointDefault = props.irCommands.find((command) => command.TEMPER === props.schedule?.SETPOINT);
        let setpointDefault = 21 as number|null;
        if (!forcedSetpointDefault || !persistedForcedCool) {
          forcedSetpointDefault = props.irCommands.find((command) => command.CMD_TYPE === 'AC_COOL');
        }
        if (forcedSetpointDefault) {
          setpointDefault = forcedSetpointDefault.TEMPER || null;
        }
        setFormData({ SETPOINT: setpointDefault }, false);

        render();
      }
    } catch (err) {
      toast.error(t('erroObterDadosSetpointModoForcado'));
      console.log(err);
    }
  }

  function setpointOnDemand(): void {
    if (onDemandChanges()) {
      if (props.irCommands.length === 0) {
        toast.info(t('avisoDutIrNomeInvalido'));
        return;
      }

      if (props.devId) {
        setFormData({
          SETPOINT_ON_DEMAND: getCoolSetpointDefaultCommandValue(props.devId, props.irCommands),
        }, true);
      }
    }
  }

  function setFormData(obj, withRender = true) {
    Object.assign(state.formData, obj);
    if ((obj.hasOwnProperty('CTRLOPER_item') || obj.hasOwnProperty('FORCED_BEHAVIOR_item')) && state.formData.CTRLOPER_item) {
      state.showSetPoint = state.formData.PERMISSION === 'allow' && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value);
      state.showLtc = state.formData.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value);
      state.showLti = state.formData.PERMISSION === 'allow' && (
        ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value) || onDemandChanges()
      );
      state.showForcedOptions = state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value);
      state.showEco2Options = state.formData.PERMISSION === 'allow' && props.dutCompatibilityHysteresisEco2 && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value);
      state.showSetPointForced = state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value) && state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool';

      if (state.showSetPointForced && props.irCommands.length === 0 && (props.temperaturesForcedSetpoint == null || props.temperaturesForcedSetpoint.length === 0)) {
        state.showSetPointForced = false;
        toast.info(t('avisoDutIrNomeInvalido'));
      }
      if (state.showForcedOptions) {
        const haveForcedFan = props.dutForcedBehavior.find((item) => item.value === 'dut-forced-fan');
        if (!haveForcedFan) {
          toast.info(t('avisoDutIrSemVentilacao'));
        }
      }
      if (!state.showSetPoint) setFormData({ SETPOINT: null }, false);
      if (!state.showLtc) setFormData({ LTC: null }, false);
      if (!state.showLti) setFormData({ LTI: null }, false);
      if (!state.showEco2Options) setFormData({ UPPER_HYSTERESIS: null }, false);
      if (!state.showEco2Options) setFormData({ LOWER_HYSTERESIS: null }, false);
      if (!state.showEco2Options) setFormData({ SCHEDULE_START_BEHAVIOR: null }, false);
      if (!state.showEco2Options) setFormData({ SCHEDULE_END_BEHAVIOR: null }, false);
      if (!state.showForcedOptions) setFormData({ FORCED_BEHAVIOR: null }, false);

      if (state.showSetPointForced) {
        let setpointDefault = 21 as number|null;
        const persistedForcedCool = props.schedule?.CTRLOPER === '7_FORCED' && props.schedule?.FORCED_BEHAVIOR === 'dut-forced-cool';
        let forcedSetpointDefault = props.irCommands.find((command) => command.TEMPER === props.schedule?.SETPOINT);
        if (!forcedSetpointDefault || !persistedForcedCool) {
          forcedSetpointDefault = props.irCommands.find((command) => command.CMD_TYPE === 'AC_COOL');
        }
        if (forcedSetpointDefault) {
          setpointDefault = forcedSetpointDefault.TEMPER || null;
        }
        setFormData({ SETPOINT: setpointDefault }, false);
      }

      setpointOnDemand();
      updateActionsOnDemandMode();
    }

    if (obj.hasOwnProperty('PERMISSION')) {
      if (state.formData.PERMISSION === 'forbid') {
        clearFields();
      }
    }

    if (obj.hasOwnProperty('BEGIN_TIME') || obj.hasOwnProperty('END_TIME')) {
      state.allDay = state.formData.BEGIN_TIME === '00:00' && state.formData.END_TIME === '23:59';
    }

    if (withRender) {
      render();
    }
  }

  function clearFields() {
    setFormData({ CTRLOPER_item: null }, false);
    setFormData({ CTRLOPER: null }, false);
    setFormData({ SETPOINT: null }, false);
    setFormData({ SETPOINT_ON_DEMAND: null }, false);
    setFormData({ LTC: null }, false);
    setFormData({ LTI: null }, false);
    setFormData({ UPPER_HYSTERESIS: null }, false);
    setFormData({ LOWER_HYSTERESIS: null }, false);
    setFormData({ SCHEDULE_START_BEHAVIOR: null }, false);
    setFormData({ SCHEDULE_END_BEHAVIOR: null }, false);
    setFormData({ FORCED_BEHAVIOR: null }, false);
    state.showSetPoint = false;
    state.showLtc = false;
    state.showLti = false;
    state.showForcedOptions = false;
    state.showEco2Options = false;
    state.hysteresisChecked = false;
  }

  function setFormDataDays(obj) {
    Object.assign(state.formData.DAYS, obj);
    render();
  }

  function addVariationVariableVerificationVersion(schedule: ScheduleDut) {
    schedule.ACTION_MODE = state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) ? actionModes[state.formData.ACTION_MODE] : null;
    schedule.ACTION_TIME = state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) ? Number(state.formData.ACTION_TIME) * 60 : null;
    schedule.ACTION_POST_BEHAVIOR = state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) ? actionModes[state.formData.ACTION_POST_BEHAVIOR] : null;
  }

  function addScheduleStartAndEndBehavior(schedule: ScheduleDut) {
    schedule.SCHEDULE_START_BEHAVIOR = state.showEco2Options && state.hysteresisChecked && state.formData.SCHEDULE_START_BEHAVIOR_item ? state.formData.SCHEDULE_START_BEHAVIOR_item.value : null;
    schedule.SCHEDULE_END_BEHAVIOR = state.showEco2Options && state.hysteresisChecked && state.formData.SCHEDULE_END_BEHAVIOR_item ? state.formData.SCHEDULE_END_BEHAVIOR_item.value : null;
    schedule.FORCED_BEHAVIOR = state.showForcedOptions && state.formData.FORCED_BEHAVIOR_item ? state.formData.FORCED_BEHAVIOR_item.value : null;
  }

  function saveSchedule() {
    const schedule = {} as ScheduleDut;

    if (!checkScheduleToSave()) {
      render();
      return;
    }

    schedule.DUT_SCHEDULE_ID = props.schedule?.DUT_SCHEDULE_ID;
    schedule.SCHEDULE_TITLE = state.formData.SCHEDULE_TITLE;
    schedule.SCHEDULE_STATUS = state.formData.SCHEDULE_STATUS;
    schedule.BEGIN_TIME = state.formData.BEGIN_TIME;
    schedule.END_TIME = state.formData.END_TIME;
    if (state.formData.CTRLOPER_item) {
      schedule.CTRLOPER = state.formData.CTRLOPER_item.value === '6_BACKUP_CONTROL_V2' && state.hysteresisChecked ? '8_ECO_2' : state.formData.CTRLOPER_item.value;
    }
    else {
      schedule.CTRLOPER = '0_NO_CONTROL';
    }
    schedule.PERMISSION = state.formData.PERMISSION;
    schedule.DAYS = state.formData.DAYS;
    schedule.SETPOINT = state.showSetPoint || state.showSetPointForced ? Number(state.formData.SETPOINT?.toString().replace(',', '.').replace('ºC', '')) : null;

    schedule.LTC = state.showLtc ? Number(state.formData.LTC?.replace(',', '.')) : null;
    schedule.LTI = (state.showLti && state.formData.LTI) ? Number(state.formData.LTI.replace(',', '.')) : null;
    schedule.UPPER_HYSTERESIS = state.showEco2Options && state.hysteresisChecked ? Number(state.formData.UPPER_HYSTERESIS?.replace(',', '.')) : null;
    schedule.LOWER_HYSTERESIS = state.showEco2Options && state.hysteresisChecked ? Number(state.formData.LOWER_HYSTERESIS?.replace(',', '.')) : null;
    addVariationVariableVerificationVersion(schedule);
    addScheduleStartAndEndBehavior(schedule);

    props.onHandleSave(schedule, props.cardIndex);
    props.onHandleCancel();
  }

  function checkOnDemandChangesFields(lti: number, setpoint: number): boolean {
    if (onDemandChanges()) {
      if (!lti) { return true; }
      if (lti < MIN_LTI_SETPOINT_SCHEDULE) {
        state.formErrors.LTI = t('erroLTIdeveSerMaiorValue', { value: MIN_LTI_SETPOINT_SCHEDULE });
        return false;
      }

      if (lti > setpoint) {
        state.formErrors.LTI = t('erroLTIdeveSerMenorSetpoint');
        return false;
      }

      if (!state.formData.SETPOINT_ON_DEMAND) {
        if (state.formData.ACTION_MODE === t('refrigerar')) {
          state.formErrors.ACTION_MODE = t('erroComandoIRNaoExisteModo');
          return false;
        }
        if (state.formData.ACTION_POST_BEHAVIOR === t('refrigerar')) {
          state.formErrors.ACTION_POST_BEHAVIOR = t('erroComandoIRNaoExisteModo');
          return false;
        }
      }
    }
    return true;
  }

  function checkScheduleToSave() {
    state.formErrors.SCHEDULE_TITLE = '';
    state.formErrors.BEGIN_TIME = '';
    state.formErrors.END_TIME = '';
    state.formErrors.CTRLOPER = '';
    state.formErrors.SETPOINT = '';
    state.formErrors.LTC = '';
    state.formErrors.LTI = '';
    state.formErrors.UPPER_HYSTERESIS = '';
    state.formErrors.LOWER_HYSTERESIS = '';
    state.formErrors.ACTION_MODE = '';
    state.formErrors.ACTION_TIME = '';
    state.formErrors.ACTION_POST_BEHAVIOR = '';
    state.formErrors.SETPOINT_ON_DEMAND = '';

    const ltc = (parseDecimalNumber(state.formData.LTC?.replace(',', '.')) || 0);
    const lti = (parseDecimalNumber(state.formData.LTI?.replace(',', '.')) || 0);
    const setpoint = (parseDecimalNumber(state.formData.SETPOINT?.toString().replace(',', '.').replace('ºC', '')) || 0);
    const upperHysteresis = (parseDecimalNumber(state.formData.UPPER_HYSTERESIS?.replace(',', '.')) || 0);
    const lowerHysteresis = (parseDecimalNumber(state.formData.LOWER_HYSTERESIS?.replace(',', '.')) || 0);

    if (!state.formData.SCHEDULE_TITLE || state.formData.SCHEDULE_TITLE.length === 0) {
      state.formErrors.SCHEDULE_TITLE = t('erroTituloProgramacaoNecessario');
      return false;
    }

    if (!state.formData.BEGIN_TIME || state.formData.BEGIN_TIME.length !== 5) {
      state.formErrors.BEGIN_TIME = t('erroDeveSerPreenchido');
      return false;
    }

    if (!state.formData.END_TIME || state.formData.END_TIME.length !== 5) {
      state.formErrors.END_TIME = t('erroDeveSerPreenchido');
      return false;
    }

    if (state.formData.BEGIN_TIME >= state.formData.END_TIME) {
      toast.error(t('erroHorarioInicioMenorHorarioFim'));
      return false;
    }

    if (state.formData.PERMISSION === 'allow' && state.formData.CTRLOPER_item == null) {
      state.formErrors.CTRLOPER = t('erroNecessarioModoOperacao');
      return false;
    }

    if (state.showSetPoint || state.showSetPointForced) {
      if (state.formData.SETPOINT == null || state.formData.SETPOINT.length === 0 || Number.isNaN(state.formData.SETPOINT.toString().replace('ºC', ''))) {
        state.formErrors.SETPOINT = t('erroNecessarioSetpoint');
        return false;
      }
      if (setpoint > 35 || setpoint < 12) {
        state.formErrors.SETPOINT = t('erroSetpointDeveSerEntre12e35');
        return false;
      }
    }

    if (state.showLtc) {
      if (state.formData.LTC == null || state.formData.LTC.length === 0 || Number.isNaN(state.formData.LTC)) {
        state.formErrors.LTC = t('erroNecessarioLTC');
        return false;
      }
    }

    if (state.showLti && !onDemandChanges()) {
      if (state.formData.LTI == null || state.formData.LTI.length === 0 || Number.isNaN(state.formData.LTI)) {
        state.formErrors.LTI = t('erroNecessarioLTI');
        return false;
      }
    }

    if (!checkOnDemandChangesFields(lti, setpoint)) {
      return false;
    }

    if (state.formData.ACTION_TIME && (Number(state.formData.ACTION_TIME) % 5 !== 0 || Number(state.formData.ACTION_TIME) < 5)) {
      toast.error(t('erroTempoAcaoMultiplo5'));
      return false;
    }

    if (state.showEco2Options && state.hysteresisChecked) {
      if (ltc > 40 || ltc < 13) {
        state.formErrors.LTC = t('erroLTCdeveSerEntre13e40');
        return false;
      }
      if (lti > 34 || lti < 8) {
        state.formErrors.LTI = t('erroLTCdeveSerEntre8e34');
        return false;
      }
      if (ltc <= lti) {
        toast.error(t('erroLTCdeveSerMaiorLTI'));
        return false;
      }
      if (setpoint > 35 || setpoint < 12) {
        state.formErrors.SETPOINT = t('erroSetpointDeveSerEntre12e35');
        return false;
      }
      if (upperHysteresis > 5 || upperHysteresis < 0.2) {
        state.formErrors.UPPER_HYSTERESIS = t('erroHistereseSuperiorDeveSerEntre0-2e5');
        return false;
      }
      if (lowerHysteresis > 5 || lowerHysteresis < 0.2) {
        state.formErrors.LOWER_HYSTERESIS = t('erroHistereseInferiorDeveSerEntre0-2e5');
        return false;
      }
      if (ltc < setpoint || lti > setpoint) {
        state.formErrors.SETPOINT = t('erroSetpointDeveEstarEntreLTCeLTI');
        return false;
      }
    }

    if (state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && !state.formData.ACTION_MODE) {
      state.formErrors.ACTION_MODE = t('erroNecessarioActionMode');
      return false;
    }

    if (state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && !state.formData.ACTION_TIME) {
      state.formErrors.ACTION_TIME = t('erroNecessarioActionTime');
      return false;
    }

    if (state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && !state.formData.ACTION_POST_BEHAVIOR) {
      state.formErrors.ACTION_POST_BEHAVIOR = t('erroNecessarioActionBehavior');
      return false;
    }

    if (state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) && Number(state.formData.ACTION_TIME) < 5) {
      state.formErrors.ACTION_TIME = t('erroMinActionTime');
      return false;
    }

    if (state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && !isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') && (state.formData.ACTION_MODE !== t('eco') || state.formData.ACTION_TIME !== '60') && !props.isFromMultipleProg) {
      toast.error(t('fwDesatualizadoSobDemanda'));
      return false;
    }

    if (state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && !isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') && (state.formData.ACTION_POST_BEHAVIOR !== t('modoDesligar')) && !props.isFromMultipleProg) {
      toast.error(t('fwDesatualizadoSobDemandaPostBehavior'));
      return false;
    }

    return true;
  }

  function increaseDecrease(value: string) {
    setFormData({ SETPOINT: value });
  }

  function setEcoV3OptionsDefault() {
    if (!state.hysteresisChecked) {
      state.formData.UPPER_HYSTERESIS = '1';
      state.formData.LOWER_HYSTERESIS = '1';
    }
    state.formData.SCHEDULE_START_BEHAVIOR_item = props.dutScheduleStartBehavior.find((item) => item.value === (!state.hysteresisChecked ? 'dut-schedule-start-behavior-off' : 'dut-schedule-start-behavior-ventilate')) || null;
  }

  useEffect(() => {
    (async function () {
      setpointForced();
      valideForcedOptions();
      if (!props.isFromMultipleProg) {
        await getFWVersion(props.devId ? props.devId : '');
      }
      updatePropsChangesOnDemandMode(state.fwVersion);
    }());
  }, []);

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="column"
      width="452px"
      style={{
        borderTop: '15px solid #363BC4',
        borderRadius: '5px',
        marginBottom: '63px',
      }}
    >
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '40px',
          marginLeft: '27px',
        }}
      >
        <div
          style={{
            fontSize: '15px',
            fontWeight: 'bold',
          }}
        >
          {t('adicionarProgramacao')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '27px',
        }}
      >
        <div
          style={{
            width: '145px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {t('titulo')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '7px',
          marginLeft: '27px',
        }}
      >
        <TextLine style={{ marginBottom: '20px', width: '210px' }}>
          <Input
            type="text"
            value={state.formData.SCHEDULE_TITLE}
            label=""
            error={state.formErrors.SCHEDULE_TITLE}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ SCHEDULE_TITLE: e.target.value }); render(); }}
          />
        </TextLine>
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          style={{
            marginLeft: '57px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#373737',
            }}
          >
            {t('Programação')}
          </div>
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
          >
            <div
              style={{
                fontSize: '10px',
                color: '#373737',
                width: '60px',
              }}
            >
              {`${state.formData.SCHEDULE_STATUS ? t('habilitada') : t('desabilitada')}`}
            </div>
            <ToggleSwitchMini
              checked={!state.formData.SCHEDULE_STATUS}
              onOff
              onClick={(e) => { e.preventDefault(); setFormData({ SCHEDULE_STATUS: !state.formData.SCHEDULE_STATUS }); }}
            />
          </Flex>
        </Flex>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '15px',
          marginLeft: '27px',
        }}
      >
        <div
          style={{
            width: '145px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {t('selecioneDias')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginLeft: '57px',
          marginTop: '13px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            backgroundColor: state.formData.DAYS.sun ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.sun ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ sun: !state.formData.DAYS.sun }); }}
          >
            {t('diaDom').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: state.formData.DAYS.mon ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.mon ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ mon: !state.formData.DAYS.mon }); }}
          >
            {t('diaSeg').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: state.formData.DAYS.tue ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.tue ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ tue: !state.formData.DAYS.tue }); }}
          >
            {t('diaTer').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: state.formData.DAYS.wed ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.wed ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ wed: !state.formData.DAYS.wed }); }}
          >
            {t('diaQua').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: state.formData.DAYS.thu ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.thu ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ thu: !state.formData.DAYS.thu }); }}
          >
            {t('diaQui').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: state.formData.DAYS.fri ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.fri ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ fri: !state.formData.DAYS.fri }); }}
          >
            {t('diaSex').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: state.formData.DAYS.sat ? '#363BC4' : '#D3D3D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: state.formData.DAYS.sat ? 'white' : 'black',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.preventDefault(); setFormDataDays({ sat: !state.formData.DAYS.sat }); }}
          >
            {t('diaSab').toLocaleUpperCase()}
          </div>
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '27px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {t('horarioInicio')}
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginLeft: '60px',
          }}
        >
          {t('horarioFim')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '27px',
        }}
      >
        <TextLine style={{ marginBottom: '20px', width: '112px' }}>
          <Input
            value={state.formData.BEGIN_TIME}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            error={state.formErrors.BEGIN_TIME}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ BEGIN_TIME: e.target.value }); render(); }}
          />
        </TextLine>
        <TextLine style={{ marginBottom: '20px', width: '112px', marginLeft: '34px' }}>
          <Input
            value={state.formData.END_TIME}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            error={state.formErrors.END_TIME}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ END_TIME: e.target.value }); render(); }}
          />
        </TextLine>
        <div
          style={{
            marginLeft: '26px',
            marginTop: '14px',
          }}
        >
          <label
            onClick={() => {
              state.allDay = !state.allDay;

              if (state.allDay) {
                setFormData({ BEGIN_TIME: '00:00', END_TIME: '23:59' });
              }
              else {
                setFormData({ BEGIN_TIME: null, END_TIME: null });
              }
            }}
          >
            <Checkbox checked={state.allDay}>
              {state.allDay ? <CheckboxIcon /> : null}
            </Checkbox>
          </label>
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginTop: '16px',
          }}
        >
          {t('diaInteiro')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '15px',
          marginLeft: '27px',
        }}
      >
        <div
          style={{
            width: '145px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {t('funcionamento')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '22px',
          marginLeft: '27px',
        }}
      >
        <RadioButton label={t('permitir')} checked={state.formData.PERMISSION === 'allow'} onClick={() => setFormData({ PERMISSION: 'allow' })} />
        <span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span>
        <RadioButton label={t('desligar')} checked={state.formData.PERMISSION === 'forbid'} onClick={() => setFormData({ PERMISSION: 'forbid' })} />
      </Flex>
      {state.formData.PERMISSION === 'allow' && (
        <div>
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            style={{
              marginTop: '10px',
              marginLeft: '27px',
            }}
          >
            <CustomSelect
              options={props.dutControlOperation}
              value={state.formData.CTRLOPER_item}
              placeholder={t('modoOperacaoControle')}
              onSelect={(item) => setFormData({ CTRLOPER_item: item })}
              error={state.formErrors.CTRLOPER}
              style={{ width: '376px' }}
              notNull
            />
          </Flex>
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            style={{
              marginLeft: '27px',
            }}
          >
            {state.formData.CTRLOPER_item && (
              <div style={{ fontSize: '12px', textAlign: 'justify', marginRight: '50px' }}>
                <Trans i18nKey={temprtControlModeDetails[state.formData.CTRLOPER_item.value]} />

              </div>
            )}
          </Flex>
          {state.formData.CTRLOPER_item && ['2_SOB_DEMANDA'].includes(state.formData.CTRLOPER_item.value) && (
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              style={{
                marginLeft: '27px',
                marginTop: '16px',
              }}
            >
              <Image
                width={376}
                height={209}
                src={String(onDemandChanges() ? ModoSobDemanda : SobDemanda)}
                preview={{
                  getContainer: getContainerModal('schedule-modal'),
                }}
              />
            </Flex>
          )}
          {state.formData.CTRLOPER_item && ['6_BACKUP_CONTROL_V2'].includes(state.formData.CTRLOPER_item.value) && (
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              style={{
                marginLeft: '27px',
                marginTop: '16px',
              }}
            >
              <Image
                width={376}
                height={209}
                src={String(state.showEco2Options ? EcoV2 : BackupEcoV2)}
                preview={{
                  getContainer: getContainerModal('schedule-modal'),
                }}
              />
            </Flex>
          )}
          {state.showSetPoint && (
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              style={{
                marginLeft: '27px',
                marginTop: '16px',
              }}
            >
              <Input
                label="Setpoint [°C]"
                value={state.formData.SETPOINT}
                style={{ width: '376px' }}
                error={state.formErrors.SETPOINT}
                {...isNewChangesOnDemandModeVersion(state.fwVersion ?? '') ? {
                  onChange: (e) => {
                    const { value } = e.target;
                    const number = Number.parseInt(value, 10);
                    if (value === '' || (!Number.isNaN(number)
                    && !value.includes('.') && !value.includes(',')
                    && number >= 0 && number <= 32)
                    ) {
                      setFormData({ SETPOINT: e.target.value });
                    }
                  },
                } : {
                  onChange: (e) => setFormData({ SETPOINT: e.target.value }),
                }}

              />
            </Flex>
          )}
          {state.showLtc && (
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              style={{
                marginLeft: '27px',
                marginTop: '16px',
              }}
            >
              <Input
                label={t('limiarTemperaturaCritico')}
                value={state.formData.LTC}
                style={{ width: '376px' }}
                error={state.formErrors.LTC}
                onChange={(e) => setFormData({ LTC: e.target.value })}
              />
            </Flex>
          )}
          {state.showLti && (
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              style={{
                marginLeft: '27px',
                marginTop: '16px',
              }}
            >
              <Input
                label={t('limiarTemperaturaInferior')}
                value={state.formData.LTI}
                style={{ width: '376px' }}
                error={state.formErrors.LTI}
                onChange={(e) => setFormData({ LTI: e.target.value })}
              />
            </Flex>
          )}
          {state.showEco2Options && (
            <>
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                style={{
                  marginLeft: '27px',
                  marginTop: '19px',
                }}
              >
                <label
                  onClick={() => {
                    state.hysteresisChecked = !state.hysteresisChecked;
                    setEcoV3OptionsDefault();
                    render();
                  }}
                >
                  <Checkbox checked={state.hysteresisChecked}>
                    {state.hysteresisChecked ? <CheckboxIcon /> : null}
                  </Checkbox>
                </label>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginTop: '2px',
                  }}
                >
                  {t('habilitarHistereses')}
                </div>
              </Flex>
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                style={{
                  marginLeft: '27px',
                  marginTop: '16px',
                }}
              >
                <Input
                  label={t('histereseSuperiorC')}
                  value={state.formData.UPPER_HYSTERESIS}
                  style={{ width: '180px' }}
                  error={state.formErrors.UPPER_HYSTERESIS}
                  onChange={(e) => setFormData({ UPPER_HYSTERESIS: e.target.value })}
                  disabled={!state.hysteresisChecked}
                />
                <div
                  style={{
                    marginLeft: '17px',
                  }}
                >
                  <Input
                    label={t('histereseInferiorC')}
                    value={state.formData.LOWER_HYSTERESIS}
                    style={{ width: '180px' }}
                    error={state.formErrors.LOWER_HYSTERESIS}
                    onChange={(e) => setFormData({ LOWER_HYSTERESIS: e.target.value })}
                    disabled={!state.hysteresisChecked}
                  />
                </div>
              </Flex>
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                style={{
                  marginTop: '10px',
                  marginLeft: '27px',
                }}
              >
                <CustomSelect
                  options={props.dutScheduleStartBehavior.filter((item) => item.value === (!state.hysteresisChecked ? 'dut-schedule-start-behavior-off' : 'dut-schedule-start-behavior-ventilate'))}
                  value={state.formData.SCHEDULE_START_BEHAVIOR_item}
                  placeholder={t('comportamentoInicialProgHorario')}
                  onSelect={(item) => setFormData({ SCHEDULE_START_BEHAVIOR_item: item })}
                  style={{ width: '376px' }}
                  disabled={!state.hysteresisChecked}
                  notNull
                />
              </Flex>
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                style={{
                  marginTop: '10px',
                  marginLeft: '27px',
                }}
              >
                <CustomSelect
                  options={props.dutScheduleEndBehavior}
                  value={state.formData.SCHEDULE_END_BEHAVIOR_item}
                  placeholder={t('comportamentoFinalProgHorario')}
                  onSelect={(item) => setFormData({ SCHEDULE_END_BEHAVIOR_item: item })}
                  style={{ width: '376px' }}
                  disabled={!state.hysteresisChecked}
                  notNull
                />
              </Flex>
            </>
          )}
          {state.showForcedOptions && (
            <>
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                style={{
                  marginTop: '10px',
                  marginLeft: '27px',
                }}
              >
                <CustomSelect
                  options={props.dutForcedBehavior}
                  value={state.formData.FORCED_BEHAVIOR_item}
                  placeholder={t('funcao')}
                  onSelect={(item) => setFormData({ FORCED_BEHAVIOR_item: item })}
                  style={{ width: '376px' }}
                  notNull
                />
              </Flex>
              {state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool' && state.showSetPointForced && state.formData.SETPOINT != null && (
                <Flex
                  flexWrap="nowrap"
                  flexDirection="row"
                  style={{
                    marginTop: '10px',
                    marginLeft: '27px',
                  }}
                >
                  <InputCalculator
                    label="Setpoint [°C]"
                    value={state.formData.SETPOINT}
                    style={{ width: '376px' }}
                    error={state.formErrors.SETPOINT}
                    possibleValues={props.irCommands.length > 0 ? props.irCommands.map((command) => command.TEMPER) : props.temperaturesForcedSetpoint}
                    unity="ºC"
                    onIncreaseDecrease={increaseDecrease}
                    isSetpoint
                  />
                </Flex>
              )}
            </>
          )}
          {state.formData.CTRLOPER_item && ['2_SOB_DEMANDA'].includes(state.formData.CTRLOPER_item.value) && (
            <Flex
              flexWrap="nowrap"
              flexDirection="column"
              style={{
                marginLeft: '27px',
                marginTop: '16px',
                marginRight: '50px',
              }}
            >
              <Select
                options={actionModeOptions}
                value={state.actionMode}
                placeholder={t('modoDeAcao')}
                onSelect={(item: NewOption) => {
                  state.actionMode = item;
                  setFormData({ ACTION_MODE: item.value });
                }}
                error={state.formErrors.ACTION_MODE}
                style={{ border: '0.7px solid #818181', width: '376px', marginBottom: '16px' }}
                propLabel="label"
                notNull
              />
              <Input
                label={t('tempoDeAcao')}
                value={state.formData.ACTION_TIME}
                type="number"
                style={{ width: '376px', marginBottom: '16px' }}
                error={state.formErrors.ACTION_TIME}
                onChange={(e) => setFormData({ ACTION_TIME: e.target.value })}
              />
              {state.formData.ACTION_MODE === t('eco') && (
              <div style={{
                fontSize: '12px', textAlign: 'justify', marginBottom: '10px',
              }}
              >
                {t('sobDemandaModoEco')}
              </div>
              )}
              <div style={{
                fontSize: '11px', position: 'relative',
              }}
              >
                {
                  (!props.isFromMultipleProg && (state.fwVersion && !isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || ''))) && (
                    <>
                      <InfoIcon
                        width="12px"
                        data-tip
                        data-for="search"
                        color="#BDBDBD"
                        style={{
                          position: 'absolute', top: -4, right: 196, zIndex: 3, marginRight: 5, marginTop: 5,
                        }}
                      />
                      <ReactTooltip
                        id="search"
                        place="top"
                        effect="solid"
                      >
                        <HoverExportList>
                          {t('sobDemandaComportamentoAposAcao')}
                        </HoverExportList>
                      </ReactTooltip>
                    </>
                  )
                }
                <Select
                  options={actionPostModeOptions}
                  value={state.actionPostMode}
                  placeholder={t('comportamentoAposAcao')}
                  onSelect={(item: NewOption) => {
                    state.actionPostMode = item;
                    setFormData({ ACTION_POST_BEHAVIOR: item.value });
                  }}
                  error={state.formErrors.ACTION_POST_BEHAVIOR}
                  style={{ width: '376px', border: '0.7px solid #818181' }}
                  disabled={!props.isFromMultipleProg && !isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '')}
                  propLabel="label"
                  notNull
                />
              </div>
            </Flex>
          )}
        </div>
      )}
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '41px',
          marginLeft: '138px',
        }}
      >
        <Button style={{ maxWidth: '178px' }} onClick={(e) => { e.stopPropagation(); saveSchedule(); }} variant="primary">
          {`${props.cardIndex == null ? t('botaoAdicionar') : t('botaoEditar')}`}
        </Button>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '22px',
          marginLeft: '195px',
        }}
      >
        <u style={{ color: '#6C6B6B', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); props.onHandleCancel(); }}>
          {t('botaoCancelar')}
        </u>
      </Flex>
    </Flex>
  );
};
