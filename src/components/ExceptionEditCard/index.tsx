import {
  useEffect, ChangeEvent, useState,
  useCallback,
} from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  TextLine, CustomSelect,
} from './styles';
import { toast } from 'react-toastify';
import { ExceptionDut } from '../../providers/types/api-private';
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
import { apiCall } from '../../providers';
import ReactTooltip from 'react-tooltip';
import { HoverExportList } from '~/pages/Analysis/Utilities/UtilityFilter/styles';
import { isFwVersionGreatestOrEqual } from '~/helpers';
import { CoolSetPointLabel } from '../ScheduleEditCard';
import {
  defaultActionModeOptions, defaultActionModes, defaultActionPostModeOptions, getCoolSetpointDefaultCommandValue, getOptionByKey, MIN_LTI_SETPOINT_SCHEDULE,
} from '../ScheduleEditCard/constants';
import { getContainerModal } from '~/helpers/modalImage';
import { isNewChangesOnDemandMode, isNewChangesOnDemandModeVersion } from '~/helpers/dutScheduleConfig';
import { ComponentProps, ExceptionEditCardFormData } from './types';
import { NewOption } from '../ScheduleEditCard/types';

export const ExceptionEditCard = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();

  const [actionModes, setActionModes] = useState(defaultActionModes);
  const [actionModeOptions, setActionModeOptions] = useState<
    NewOption[]>(defaultActionModeOptions);
  const [actionPostModeOptions, setActionPostModeOptions] = useState<NewOption[]>(
    defaultActionPostModeOptions,
  );

  const getActionKeyFromValue = (value: string) => {
    for (const key of Object.keys(actionModes)) {
      if (actionModes[key] === value) return key;
    }
    return t('modoDesligar');
  };

  const [state, render] = useStateVar({
    formData: {
      DUT_EXCEPTION_ID: props.exception?.DUT_EXCEPTION_ID || null,
      EXCEPTION_TITLE: props.exception?.EXCEPTION_TITLE || null,
      REPEAT_YEARLY: props.exception != null ? props.exception.REPEAT_YEARLY : false,
      EXCEPTION_DATE: props.exception?.EXCEPTION_DATE || null,
      BEGIN_TIME: props.exception?.BEGIN_TIME || null,
      END_TIME: props.exception?.END_TIME || null,
      PERMISSION: props.exception?.PERMISSION || 'allow',
      EXCEPTION_STATUS_ID: props.exception?.EXCEPTION_STATUS_ID || 0,
      CTRLOPER: props.exception?.CTRLOPER || null,
      SETPOINT: props.exception?.SETPOINT?.toString().replace('.', ',') || null,
      LTC: props.exception?.LTC?.toString().replace('.', ',') || null,
      LTI: props.exception?.LTI?.toString().replace('.', ',') || null,
      UPPER_HYSTERESIS: props.exception?.UPPER_HYSTERESIS?.toString().replace('.', ',') || '1',
      LOWER_HYSTERESIS: props.exception?.LOWER_HYSTERESIS?.toString().replace('.', ',') || '1',
      SCHEDULE_START_BEHAVIOR: props.exception?.SCHEDULE_START_BEHAVIOR || null,
      SCHEDULE_END_BEHAVIOR: props.exception?.SCHEDULE_END_BEHAVIOR || null,
      FORCED_BEHAVIOR: props.exception?.FORCED_BEHAVIOR || null,
      CTRLOPER_item: props.exception?.CTRLOPER ? props.dutControlOperation.find((item) => item.value === props.exception?.CTRLOPER || (props.exception?.CTRLOPER === '8_ECO_2' && item.value === '6_BACKUP_CONTROL_V2')) : null as null | { label: string, value: '0_NO_CONTROL' | '1_CONTROL' | '2_SOB_DEMANDA' | '3_BACKUP' | '4_BLOCKED' | '5_BACKUP_CONTROL' | '6_BACKUP_CONTROL_V2' | '7_FORCED' },
      SCHEDULE_START_BEHAVIOR_item: props.exception?.SCHEDULE_START_BEHAVIOR ? props.dutScheduleStartBehavior.find((item) => item.value === props.exception?.SCHEDULE_START_BEHAVIOR) : props.dutScheduleStartBehavior[0] as null | { label: string, value: 'dut-schedule-start-behavior-ventilate' },
      SCHEDULE_END_BEHAVIOR_item: props.exception?.SCHEDULE_END_BEHAVIOR ? props.dutScheduleEndBehavior.find((item) => item.value === props.exception?.SCHEDULE_END_BEHAVIOR) : props.dutScheduleEndBehavior[0] as null | { label: string, value: 'dut-schedule-end-behavior-off' },
      FORCED_BEHAVIOR_item: props.exception?.FORCED_BEHAVIOR ? props.dutForcedBehavior.find((item) => item.value === props.exception?.FORCED_BEHAVIOR) : props.dutForcedBehavior[0] as { label: string, value: string },
      ACTION_TIME: props.exception?.ACTION_TIME ? (props.exception?.ACTION_TIME / 60).toFixed(0) : '60',
      ACTION_MODE: getActionKeyFromValue(props.exception?.ACTION_MODE || 'ECO'),
      ACTION_POST_BEHAVIOR: getActionKeyFromValue(props.exception?.ACTION_POST_BEHAVIOR || 'Disabled'),
      SETPOINT_ON_DEMAND: null,
    } as ExceptionEditCardFormData,
    formErrors: {
      EXCEPTION_TITLE: '',
      EXCEPTION_DATE: '',
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
    allDay: props.exception ? props.exception.BEGIN_TIME === '00:00' && props.exception.END_TIME === '23:59' : false as boolean,
    hysteresisChecked: props.exception?.CTRLOPER === '8_ECO_2' || false as boolean,
    showSetPoint: props.exception?.CTRLOPER ? props.exception.PERMISSION === 'allow' && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.exception.CTRLOPER) : false as boolean,
    showLtc: props.exception?.CTRLOPER ? props.exception.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.exception.CTRLOPER) : false as boolean,
    showLti: props.exception?.CTRLOPER ? props.exception.PERMISSION === 'allow' && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.exception.CTRLOPER) : false as boolean,
    showForcedOptions: props.exception?.CTRLOPER ? props.exception.PERMISSION === 'allow' && ['7_FORCED'].includes(props.exception.CTRLOPER) : false as boolean,
    showEco2Options: props.exception?.CTRLOPER ? props.exception.PERMISSION === 'allow' && props.dutCompatibilityHysteresisEco2 && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.exception.CTRLOPER) : false as boolean,
    showSetPointForced: props.exception?.CTRLOPER ? props.exception.PERMISSION === 'allow' && ['7_FORCED'].includes(props.exception.CTRLOPER) && props.exception.FORCED_BEHAVIOR === 'dut-forced-cool' : false as boolean,
    fwVersion: null as null | string,
    actionMode: getOptionByKey(getActionKeyFromValue(props.exception?.ACTION_MODE ?? 'ECO'), actionModeOptions),
    actionPostMode: getOptionByKey(getActionKeyFromValue(props.exception?.ACTION_POST_BEHAVIOR ?? 'Disabled'), actionPostModeOptions),
  });

  function onDemandChanges(): boolean {
    return isNewChangesOnDemandMode(
      state.formData.CTRLOPER_item?.value ?? '', state.fwVersion ?? '',
    );
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
    if (props.exception) {
      if (isNewChangesOnDemandMode(props.exception.CTRLOPER, currentVersion ?? '')) {
        state.showLti = true;
        setpointOnDemand();
        updateActionsOnDemandMode();

        if (props.exception.ACTION_MODE && props.exception.ACTION_MODE === 'Enabled') {
          state.actionMode = coolOptionElement(state.formData.SETPOINT_ON_DEMAND);
        }
        if (props.exception.ACTION_POST_BEHAVIOR && props.exception.ACTION_POST_BEHAVIOR === 'Enabled') {
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

  function setpointForced() {
    try {
      state.showSetPointForced = state.formData.CTRLOPER_item != null && state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value) && state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool';
      if (state.showSetPointForced && props.irCommands.length === 0 && (props.temperaturesForcedSetpoint == null || props.temperaturesForcedSetpoint?.length === 0)) {
        state.showSetPointForced = false;
        toast.info(t('avisoDutIrNomeInvalido'));
      }

      if (state.showSetPointForced) {
        const persistedForcedCool = props.exception?.CTRLOPER === '7_FORCED' && props.exception?.FORCED_BEHAVIOR === 'dut-forced-cool';
        let forcedSetpointDefault = props.irCommands.find((command) => command.TEMPER === props.exception?.SETPOINT);
        let setpointDefault = 21 as number | null;
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

  function valideForcedOptions() {
    if (state.formData.CTRLOPER_item != null && state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value)) {
      const haveForcedFan = props.dutForcedBehavior.find((item) => item.value === 'dut-forced-fan');
      if (!haveForcedFan) {
        toast.info(t('avisoDutIrSemVentilacao'));
      }
    }
  }

  function setFormData(obj, withRender = true) {
    Object.assign(state.formData, obj);
    if ((obj.hasOwnProperty('CTRLOPER_item') || obj.hasOwnProperty('FORCED_BEHAVIOR_item')) && state.formData.CTRLOPER_item) {
      state.showSetPoint = state.formData.PERMISSION === 'allow' && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value);
      state.showLtc = state.formData.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value);
      state.showLti = state.formData.PERMISSION === 'allow' && (['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value) || onDemandChanges());
      state.showForcedOptions = state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value);
      state.showEco2Options = state.formData.PERMISSION === 'allow' && props.dutCompatibilityHysteresisEco2 && ['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(state.formData.CTRLOPER_item.value);
      state.showSetPointForced = state.formData.PERMISSION === 'allow' && ['7_FORCED'].includes(state.formData.CTRLOPER_item.value) && state.formData.FORCED_BEHAVIOR_item?.value === 'dut-forced-cool';

      if (state.showSetPointForced && props.irCommands.length === 0 && (props.temperaturesForcedSetpoint == null || props.temperaturesForcedSetpoint?.length === 0)) {
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
        const persistedForcedCool = props.exception?.CTRLOPER === '7_FORCED' && props.exception?.FORCED_BEHAVIOR === 'dut-forced-cool';
        let forcedSetpointDefault = props.irCommands.find((command) => command.TEMPER === props.exception?.SETPOINT);
        let setpointDefault = 21 as number | null;
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
    setFormData({ LTC: null }, false);
    setFormData({ LTI: null }, false);
    setFormData({ UPPER_HYSTERESIS: null }, false);
    setFormData({ LOWER_HYSTERESIS: null }, false);
    setFormData({ SCHEDULE_START_BEHAVIOR: null }, false);
    setFormData({ SCHEDULE_END_BEHAVIOR: null }, false);
    setFormData({ FORCED_BEHAVIOR: null }, false);
    setFormData({ SETPOINT_ON_DEMAND: null }, false);
    state.showSetPoint = false;
    state.showLtc = false;
    state.showLti = false;
    state.showForcedOptions = false;
    state.showEco2Options = false;
    state.hysteresisChecked = false;
  }

  function addVariationVariableVerificationVersion(exception: ExceptionDut) {
    exception.ACTION_MODE = state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) ? actionModes[state.formData.ACTION_MODE] : null;
    exception.ACTION_TIME = state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) ? Number(state.formData.ACTION_TIME) * 60 : null;
    exception.ACTION_POST_BEHAVIOR = state.formData.CTRLOPER_item && state.formData.CTRLOPER_item.value === '2_SOB_DEMANDA' && (isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '') || props.isFromMultipleProg) ? actionModes[state.formData.ACTION_POST_BEHAVIOR] : null;
  }

  function addScheduleStartAndEndBehavior(exception: ExceptionDut) {
    exception.SCHEDULE_START_BEHAVIOR = state.showEco2Options && state.hysteresisChecked && state.formData.SCHEDULE_START_BEHAVIOR_item ? state.formData.SCHEDULE_START_BEHAVIOR_item.value : null;
    exception.SCHEDULE_END_BEHAVIOR = state.showEco2Options && state.hysteresisChecked && state.formData.SCHEDULE_START_BEHAVIOR_item ? state.formData.SCHEDULE_START_BEHAVIOR_item.value : null;
    exception.FORCED_BEHAVIOR = state.showForcedOptions && state.formData.FORCED_BEHAVIOR_item ? state.formData.FORCED_BEHAVIOR_item.value : null;
  }

  function saveSchedule() {
    const exception = {} as ExceptionDut;

    if (!checkExceptionToSave()) {
      render();
      return;
    }

    exception.DUT_EXCEPTION_ID = props.exception?.DUT_EXCEPTION_ID;
    exception.EXCEPTION_TITLE = state.formData.EXCEPTION_TITLE;
    exception.EXCEPTION_DATE = state.formData.EXCEPTION_DATE;
    exception.REPEAT_YEARLY = state.formData.REPEAT_YEARLY;
    exception.BEGIN_TIME = state.formData.BEGIN_TIME;
    exception.END_TIME = state.formData.END_TIME;
    exception.PERMISSION = state.formData.PERMISSION;
    exception.EXCEPTION_STATUS_ID = 0;
    if (state.formData.CTRLOPER_item) {
      exception.CTRLOPER = state.formData.CTRLOPER_item.value === '6_BACKUP_CONTROL_V2' && state.hysteresisChecked ? '8_ECO_2' : state.formData.CTRLOPER_item.value;
    }
    else {
      exception.CTRLOPER = '0_NO_CONTROL';
    }

    exception.SETPOINT = state.showSetPoint || state.showSetPointForced ? Number(state.formData.SETPOINT?.toString().replace(',', '.').replace('ºC', '')) : null;
    exception.LTC = state.showLtc ? Number(state.formData.LTC?.replace(',', '.')) : null;
    exception.LTI = (state.showLti && state.formData.LTI) ? Number(state.formData.LTI.replace(',', '.')) : null;
    exception.UPPER_HYSTERESIS = state.showEco2Options && state.hysteresisChecked ? Number(state.formData.UPPER_HYSTERESIS?.replace(',', '.')) : null;
    exception.LOWER_HYSTERESIS = state.showEco2Options && state.hysteresisChecked ? Number(state.formData.LOWER_HYSTERESIS?.replace(',', '.')) : null;
    addVariationVariableVerificationVersion(exception);
    addScheduleStartAndEndBehavior(exception);

    props.onHandleSave(exception, props.cardIndex);
    props.onHandleCancel();
  }

  function checkOnDemandChangesFields(lti: number, setpoint: number): boolean {
    if (onDemandChanges()) {
      if (!lti) return true;
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

  function checkExceptionToSave() {
    state.formErrors.EXCEPTION_TITLE = '';
    state.formErrors.EXCEPTION_DATE = '';
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

    if (!state.formData.EXCEPTION_TITLE || state.formData.EXCEPTION_TITLE.length === 0) {
      state.formErrors.EXCEPTION_TITLE = t('erroTituloProgramacaoNecessario');
      return false;
    }
    if (!state.formData.EXCEPTION_DATE || state.formData.EXCEPTION_DATE.length !== 10 || state.formData.EXCEPTION_DATE.includes('_')) {
      state.formErrors.EXCEPTION_DATE = t('erroDataExcecaoObrigatoria');
      return false;
    }
    if (!state.formData.BEGIN_TIME || !/^\d\d:\d\d$/.test(state.formData.BEGIN_TIME)) {
      state.formErrors.BEGIN_TIME = t('erroDeveSerPreenchido');
      return false;
    }
    if (!state.formData.END_TIME || !/^\d\d:\d\d$/.test(state.formData.END_TIME)) {
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
      height="455"
      style={{
        borderTop: '15px solid #363BC4',
        borderRadius: '5px',
        marginBottom: '20px',
      }}
    >
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '40px',
          marginLeft: '39px',
        }}
      >
        <div
          style={{
            fontSize: '15px',
            fontWeight: 'bold',
          }}
        >
          {t('adicionarExcecao')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '36px',
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
          marginLeft: '36px',
        }}
      >
        <TextLine style={{ width: '364px' }}>
          <Input
            type="text"
            value={state.formData.EXCEPTION_TITLE}
            label=""
            error={state.formErrors.EXCEPTION_TITLE}
            style={{ width: '374px' }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ EXCEPTION_TITLE: e.target.value }); render(); }}
          />
        </TextLine>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '36px',
        }}
      >
        <div
          style={{
            width: '145px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {t('selecioneDia')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '7px',
          marginLeft: '36px',
        }}
      >
        <TextLine style={{ width: '199px' }}>
          <Input
            style={{ width: '199px' }}
            value={state.formData.EXCEPTION_DATE}
            label=""
            error={state.formErrors.EXCEPTION_DATE}
            mask={[/[0-3]/, /[0-9]/, '/', /[0-1]/, /[0-9]/, '/', /[2]/, /[0]/, /[0-9]/, /[0-9]/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ EXCEPTION_DATE: e.target.value }); }}
          />
        </TextLine>
        <div
          style={{
            marginLeft: '27px',
            marginTop: '13px',
          }}
        >
          <label
            onClick={() => {
              setFormData({ REPEAT_YEARLY: !state.formData.REPEAT_YEARLY });
            }}
          >
            <Checkbox checked={state.formData.REPEAT_YEARLY}>
              {state.formData.REPEAT_YEARLY ? <CheckboxIcon /> : null}
            </Checkbox>
          </label>
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginTop: '15px',
          }}
        >
          {t('repetirTodoOAno')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '36px',
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
          marginTop: '7px',
          marginLeft: '36px',
        }}
      >
        <TextLine style={{ width: '112px' }}>
          <Input
            value={state.formData.BEGIN_TIME}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            error={state.formErrors.BEGIN_TIME}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ BEGIN_TIME: e.target.value }); render(); }}
          />
        </TextLine>
        <TextLine style={{ width: '112px', marginLeft: '34px' }}>
          <Input
            value={state.formData.END_TIME}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            error={state.formErrors.END_TIME}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setFormData({ END_TIME: e.target.value }); render(); }}
          />
        </TextLine>
        <div
          style={{
            marginLeft: '20px',
            marginTop: '13px',
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
            marginTop: '15px',
          }}
        >
          {t('diaInteiro')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '13px',
          marginLeft: '36px',
        }}
      >
        <RadioButton label="Permitir" checked={state.formData.PERMISSION === 'allow'} onClick={() => setFormData({ PERMISSION: 'allow' })} />
        <span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span>
        <RadioButton label="Desligar" checked={state.formData.PERMISSION === 'forbid'} onClick={() => setFormData({ PERMISSION: 'forbid' })} />
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
              style={{ width: '376px', marginRight: '50px' }}
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
                label={t('limiarDeTemperaturaCriticoC')}
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
                label={t('limiarDeTemperaturaInferiorC')}
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
                  options={props.dutScheduleStartBehavior}
                  value={state.formData.SCHEDULE_START_BEHAVIOR_item}
                  placeholder={t('comportamentoInicialProgHorario')}
                  onSelect={(item) => setFormData({ SCHEDULE_START_BEHAVIOR_item: item })}
                  style={{ width: '376px' }}
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
                onSelect={(item) => {
                  state.actionMode = item;
                  setFormData({ ACTION_MODE: item.value });
                }}
                error={state.formErrors.ACTION_MODE}
                style={{
                  width: '376px',
                  border: '0.7px solid #818181',
                  marginBottom: '16px',
                }}
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
                  (!props.isFromMultipleProg && state.fwVersion && !isFwVersionGreatestOrEqual('2_3_13', state.fwVersion || '')) && (
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
          marginLeft: '144px',
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
          marginLeft: '202px',
        }}
      >
        <u style={{ color: '#6C6B6B', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); props.onHandleCancel(); }}>
          {t('botaoCancelar')}
        </u>
      </Flex>
    </Flex>
  );
};
