import {
  createContext, useEffect, useState,
} from 'react';
import { toast } from 'react-toastify';
import {
  Label, CustomInput, IconWrapper, ModalTitle3, LabelSwitch,
} from './styles';
import {
  Button, Input,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { Flex } from 'reflexbox';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { UtilityIcon } from '~/icons/Utility';
import {
  DatIcon, MonitoringIcon, PortIcon,
} from '~/icons';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import { InputWithValidation } from '~/components/InputWithValidation';
import { SelectDMTport } from '~/components/SelectDmtPort';
import { t } from 'i18next';

export const InputValidationContext = createContext({});

export const addUnitToString = (str: string|null, unit: string) : string => (str ? `${str} ${unit}` : '');
export const propOrNullValue = (value) => (value || null);
export const getParamNumber = (param: string|null) => (param?.split(' ').length ? Number(param.split(' ')[0]) : null);

export const FormEditUtility = ({
  clientId, onSuccess, onCancel, utilityInfo, utilityType,
}): JSX.Element => {
  const [state, render] = useStateVar({
    submitting: false,
    editingExtras: false,
    brandList: [] as string[],
    hasMonitoring: !!utilityInfo?.DMT_CODE || !!utilityInfo?.DAL_CODE || !!utilityInfo?.DAM_ILLUMINATION_CODE,
    selectPortNow: !!utilityInfo?.PORT || (!!utilityInfo?.DMT_CODE && !!utilityInfo?.FEEDBACK),
    hasDatId: !!utilityInfo?.DAT_CODE,
    buttonDisabled: !utilityInfo?.DMT_CODE || !utilityInfo?.DAL_CODE || !utilityInfo?.DAM_ILLUMINATION_CODE,
    unitsOpt: [] as {value: number, name: string}[],
    portsOpt: [] as {label: string, associated: boolean, port: number, nobreakId?: number, illuminationId?: number}[],
    feedbackOpt: [] as {label: string, associated: boolean, port: number, illuminationId?: number}[],
    applicationOpts: [t('nobreak'), t('iluminacao')].map((e) => ({ name: e, value: e })) as { name: string, value: string }[],
    newDevice: false as boolean,
    hasMachine: false as boolean,
  });
  const fetchData = async () => {
    try {
      const data = await apiCall('/clients/get-units-list', { CLIENT_ID: clientId });
      const opts: {value: number, name: string}[] = [];
      for (const unit of data) {
        opts.push({ value: unit.UNIT_ID, name: unit.UNIT_NAME });
      }
      state.unitsOpt = opts;
      if (formData.MONITORING_DEVICE) {
        const portsInfo = await getPortsOpts();
        state.portsOpt = portsInfo.ports;
        state.feedbackOpt = portsInfo.feedbacks;
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
  };

  const getDmtPortsOpts = async () => {
    const ports = await apiCall('/dmt/get-dmt-ports-info', { DMT_CODE: formData.MONITORING_DEVICE, CLIENT_ID: clientId, NEW_UTILITY_TYPE: utilityType === t('nobreak') ? 'Nobreak' : 'Illumination' });
    return {
      ports: ports.ports.map((port) => { if (utilityInfo?.ID && port.nobreakId === utilityInfo.ID) { port.associated = false; } return port; }),
      feedbacks: [],
    };
  };

  const getDalPortsOpts = async () => {
    const ports = await apiCall('/dal/get-dal-ports-info', { DAL_CODE: formData.MONITORING_DEVICE, CLIENT_ID: clientId });
    return {
      ports: ports.ports.map((port) => { if (utilityInfo && port.illuminationId === utilityInfo.ID) { port.associated = false; } return port; }),
      feedbacks: ports.feedbacks.map((fb) => { if (utilityInfo && fb.illuminationId === utilityInfo.ID) { fb.associated = false; } return { ...fb, label: 'F'.concat(fb.label) }; }),
    };
  };

  async function getPortsOpts() {
    if (utilityType === t('nobreak') || (utilityType === t('iluminacao') && formData.MONITORING_DEVICE.startsWith('DMT'))) {
      const ports = await getDmtPortsOpts();
      return ports;
    }
    if (utilityType === t('iluminacao') && formData.MONITORING_DEVICE.startsWith('DAL')) {
      const ports = await getDalPortsOpts();
      return ports;
    }

    return { ports: [], feedbacks: [] };
  }

  useEffect(() => {
    fetchData();
  }, []);

  const propOrEmpty = (prop) => (prop || '');
  function getFormDataInitialState() {
    const portProp = (utilityInfo?.DMT_CODE && utilityInfo?.FEEDBACK) ? utilityInfo?.FEEDBACK : utilityInfo.PORT;
    const labelProp = (utilityInfo?.DMT_CODE && utilityInfo?.FEEDBACK) ? 'F'.concat(String(utilityInfo.FEEDBACK)) : String(utilityInfo.PORT);
    const hasPort = utilityInfo?.PORT || (utilityInfo?.DMT_CODE && utilityInfo?.FEEDBACK);
    return {
      ID: (utilityInfo?.ID) || null,
      NAME: propOrEmpty(utilityInfo?.NAME),
      UNIT: propOrEmpty(utilityInfo?.UNIT_ID),
      APPLICATION: propOrEmpty(utilityType),
      INSTALLATION_DATA: (utilityInfo?.INSTALLATION_DATE) ? utilityInfo.INSTALLATION_DATE.substring(0, 10) : '' as any,
      MANUFACTURER: propOrEmpty(utilityInfo?.MANUFACTURER),
      MODEL: propOrEmpty(utilityInfo?.MODEL),
      INPUT_VOLTAGE: addUnitToString(utilityInfo?.INPUT_VOLTAGE, 'VAC') as any,
      OUTPUT_VOLTAGE: addUnitToString(utilityInfo?.OUTPUT_VOLTAGE, 'VAC') as any,
      NOMINAL_POTENTIAL: propOrEmpty(utilityInfo?.NOMINAL_POTENTIAL),
      BATTERY_LIFE: propOrEmpty(utilityInfo?.NOMINAL_BATTERY_LIFE),
      INPUT_ELECTRIC_CURRENT: propOrEmpty(utilityInfo?.INPUT_ELECTRIC_CURRENT),
      OUTPUT_ELECTRIC_CURRENT: propOrEmpty(utilityInfo?.OUTPUT_ELECTRIC_CURRENT),
      NOMINAL_BATTERY_CAPACITY: propOrEmpty(utilityInfo?.NOMINAL_BATTERY_CAPACITY),
      MONITORING_DEVICE: propOrEmpty(utilityInfo?.DMT_CODE || utilityInfo?.DAL_CODE || utilityInfo?.DAM_ILLUMINATION_CODE),
      DAT_ID: propOrEmpty(utilityInfo?.DAT_CODE),
      PORT: hasPort ? { label: labelProp, port: portProp } : '' as any,
      FEEDBACK: (utilityInfo?.FEEDBACK) ? { label: 'F'.concat(String(utilityInfo.FEEDBACK)), port: utilityInfo.FEEDBACK } : '' as any,
      GRID_VOLTAGE: addUnitToString(utilityInfo?.GRID_VOLTAGE, 'VAC') as any,
      GRID_CURRENT: propOrEmpty(utilityInfo?.GRID_CURRENT),
    };
  }

  const [allowedMonitoring, setAllowedMonitoring] = useState(!!utilityInfo?.DMT_CODE || !!utilityInfo?.DAL_CODE || !!utilityInfo?.DAM_ILLUMINATION_CODE);
  const [formData] = useState(getFormDataInitialState());
  const isEdit = !!formData.ID;

  const isLessThanZero = (number) => (number && number < 0);

  function checkErrorNobreakFormData() {
    if (!formData.NAME) { toast.error(t('necessarioNomeUtilitario')); state.submitting = false; return true; }
    if (!formData.APPLICATION) { toast.error(t('necessarioCampoAplicacao')); state.submitting = false; return true; }
    if (!formData.UNIT) { toast.error(t('necessarioCampoUnidade')); state.submitting = false; return true; }
    if (state.hasMonitoring && !formData.MONITORING_DEVICE && !allowedMonitoring) { toast.error(t('necessarioDispositivoDeMonitoramento')); state.submitting = false; return true; }
    if (state.hasMonitoring && allowedMonitoring && state.selectPortNow && !formData.PORT && !formData.PORT.port) { toast.error(t('necessarioCampoPortaDmt')); state.submitting = false; return true; }
    if (isLessThanZero(formData.NOMINAL_POTENTIAL)) { toast.error(t('necessarioNumeroPositivoPotencia')); state.submitting = false; return true; }
    if (isLessThanZero(formData.BATTERY_LIFE)) { toast.error(t('necessarioNumeroPositivoAutonomia')); state.submitting = false; return true; }
    if (isLessThanZero(formData.INPUT_ELECTRIC_CURRENT)) { toast.error(t('necessarioNumeroPositivoCorrenteEletricaDeEntrada')); state.submitting = false; return true; }
    if (isLessThanZero(formData.OUTPUT_ELECTRIC_CURRENT)) { toast.error(t('necessarioNumeroPositivoCorrenteEletricaDeSaida')); state.submitting = false; return true; }
    if (isLessThanZero(formData.NOMINAL_BATTERY_CAPACITY)) { toast.error(t('necessarioNumeroPositivoCapacidadeNominalDaBateria')); state.submitting = false; return true; }
    return false;
  }

  function getNobreakReqData() {
    return {
      CLIENT_ID: clientId,
      ID: propOrNullValue(formData.ID),
      UNIT_ID: propOrNullValue(formData.UNIT),
      DMT_CODE: propOrNullValue(state.hasMonitoring && formData.MONITORING_DEVICE),
      DAT_CODE: propOrNullValue(state.hasDatId && formData.DAT_ID),
      NAME: propOrNullValue(formData.NAME),
      MANUFACTURER: propOrNullValue(formData.MANUFACTURER),
      MODEL: propOrNullValue(formData.MODEL),
      INPUT_VOLTAGE: getParamNumber(formData.INPUT_VOLTAGE),
      OUTPUT_VOLTAGE: getParamNumber(formData.OUTPUT_VOLTAGE),
      NOMINAL_POTENTIAL: propOrNullValue(formData.NOMINAL_POTENTIAL),
      NOMINAL_BATTERY_LIFE: propOrNullValue(formData.BATTERY_LIFE),
      INPUT_ELECTRIC_CURRENT: propOrNullValue(formData.INPUT_ELECTRIC_CURRENT),
      OUTPUT_ELECTRIC_CURRENT: propOrNullValue(formData.OUTPUT_ELECTRIC_CURRENT),
      NOMINAL_BATTERY_CAPACITY: propOrNullValue(formData.NOMINAL_BATTERY_CAPACITY),
      INSTALLATION_DATE: propOrNullValue(formData.INSTALLATION_DATA),
      PORT: propOrNullValue(state.selectPortNow && formData.PORT && formData.PORT.port),
    };
  }

  async function confirmNobreak() {
    let response;
    let action: string|null = null;
    const reqData = getNobreakReqData();

    const error = checkErrorNobreakFormData();
    if (error) return;

    if (isEdit) {
      response = await apiCall('/dmt/set-dmt-nobreak', reqData);
      action = 'edit';
    } else {
      response = await apiCall('/dmt/set-dmt-nobreak', reqData);
      action = 'new';
    }
    return { response, action };
  }

  function checkErrorIllumFormData() {
    if (!formData.NAME) { toast.error(t('necessarioNomeUtilitario')); state.submitting = false; return true; }
    if (!formData.APPLICATION) { toast.error(t('necessarioCampoAplicacao')); state.submitting = false; return true; }
    if (!formData.UNIT) { toast.error(t('necessarioCampoUnidade')); state.submitting = false; return true; }
    if (state.hasMonitoring && !formData.MONITORING_DEVICE && !allowedMonitoring) { toast.error(t('necessarioDispositivoDeAutomacao')); state.submitting = false; return true; }
    if (state.hasMonitoring && allowedMonitoring && state.selectPortNow && !formData.PORT && !formData.PORT.port) { toast.error(t('necessarioCampoPortaDal')); state.submitting = false; return true; }
    return false;
  }

  const propOrNull = (prop) => (prop || null);
  async function confirmIllumination() {
    let response;
    let action: string|null = null;

    const hasDevice = state.hasMonitoring && formData.MONITORING_DEVICE;
    const hasDmt = hasDevice && formData.MONITORING_DEVICE.startsWith('DMT');
    const hasDal = hasDevice && formData.MONITORING_DEVICE.startsWith('DAL');
    const hasDam = hasDevice && formData.MONITORING_DEVICE.startsWith('DAM');
    const port = state.selectPortNow && formData.PORT && formData.PORT.port;
    const feedback = state.selectPortNow && formData.FEEDBACK && formData.FEEDBACK.port;
    const gridVoltageSplitted = formData.GRID_VOLTAGE?.split(' ');

    const reqData = {
      CLIENT_ID: clientId,
      ID: propOrNull(formData.ID),
      UNIT_ID: propOrNull(formData.UNIT),
      DAL_CODE: hasDal ? formData.MONITORING_DEVICE : null,
      DMT_CODE: hasDmt ? formData.MONITORING_DEVICE : null,
      DAM_ILLUMINATION_CODE: hasDam ? formData.MONITORING_DEVICE : null,
      NAME: propOrNull(formData.NAME),
      GRID_VOLTAGE: gridVoltageSplitted.length ? Number(gridVoltageSplitted[0]) : null,
      GRID_CURRENT: propOrNull(formData.GRID_CURRENT),
      PORT: propOrNull(port),
      FEEDBACK: propOrNull(feedback),
    };

    const error = checkErrorIllumFormData();
    if (error) return;

    if (reqData.DMT_CODE) {
      response = await apiCall('/dmt/set-dmt-illumination', reqData);
    }
    else if (reqData.DAL_CODE) {
      response = await apiCall('/dal/set-dal-illumination', reqData);
    }
    else {
      response = await apiCall('/dam/set-dam-illumination', reqData);
    }

    action = isEdit ? 'edit' : 'new';

    return { response, action };
  }

  async function confirm() {
    let response;
    let action: string|null = null;
    try {
      state.submitting = true; render();
      if (formData.APPLICATION === t('nobreak')) {
        const result = await confirmNobreak();
        response = result?.response;
        action = result?.action ?? null;
      }

      if (formData.APPLICATION === t('iluminacao')) {
        const result = await confirmIllumination();
        response = result?.response;
        action = result?.action ?? null;
      }
    } catch (err) {
      console.log(err);
      if (formData.APPLICATION === t('nobreak')) {
        toast.error(t('houveErroVerifiqueUnidade'));
      } else {
        toast.error(t('houveErro'));
      }
    }
    state.submitting = false; render();
    if (response && action) onSuccess({ item: response, action });
  }

  function checkMonitoring() {
    if (utilityInfo && utilityInfo.DMT_CODE === formData.MONITORING_DEVICE) {
      setAllowedMonitoring(true);
      state.buttonDisabled = false;
    } else if ((!state.hasMonitoring) || (state.hasMonitoring && allowedMonitoring && !state.selectPortNow) || (state.hasMonitoring && allowedMonitoring && state.selectPortNow && formData.PORT)) {
      state.buttonDisabled = false;
    } else {
      state.buttonDisabled = true;
    }
  }

  useEffect(() => {
    (async function () {
      if (formData.MONITORING_DEVICE && state.selectPortNow) {
        const portsInfo = await getPortsOpts();
        state.portsOpt = portsInfo.ports;
        state.feedbackOpt = portsInfo.feedbacks;
      }
      if (!allowedMonitoring) {
        checkMonitoring();
      } else if (state.hasMonitoring && state.selectPortNow) {
        if (formData.MONITORING_DEVICE) {
          const portsInfo = await getPortsOpts();
          state.portsOpt = portsInfo.ports;
          state.feedbackOpt = portsInfo.feedbacks;
        }
        state.buttonDisabled = !(formData.MONITORING_DEVICE && formData.PORT);
      } else {
        state.buttonDisabled = false;
      }
      render();
    }());
  }, [allowedMonitoring, formData.MONITORING_DEVICE, formData.PORT, state.hasMonitoring, state.selectPortNow]);

  const validateMonitoringDmtUtility = async () : Promise<boolean|null> => {
    try {
      const ans = await apiCall('/dmt/get-dmt-ports-info', { DMT_CODE: formData.MONITORING_DEVICE, CLIENT_ID: clientId, NEW_UTILITY_TYPE: formData.APPLICATION === t('nobreak') ? 'Nobreak' : 'Illumination' });
      if (utilityInfo && utilityInfo.DMT_CODE === formData.MONITORING_DEVICE && utilityInfo.ID) {
        return true;
      }
      return ans.freePorts;
    } catch (err) {
      return null;
    }
  };

  const validateMonitoringIllumination = async () : Promise<boolean|null> => {
    try {
      const ans = await apiCall('/dal/get-dal-ports-info', { DAL_CODE: formData.MONITORING_DEVICE, CLIENT_ID: clientId });
      if (utilityInfo && utilityInfo.DAL_CODE === formData.MONITORING_DEVICE && utilityInfo.ID) {
        return true;
      }
      return ans.freePorts;
    } catch (err) {
      return null;
    }
  };

  const validateMonitoringDamIlluminationUtility = async () : Promise<boolean|null> => {
    try {
      const ans = await apiCall('/dam/get-dam-illumination-validation', { DAM_ILLUMINATION_CODE: formData.MONITORING_DEVICE, CLIENT_ID: clientId, UNIT_ID: formData.UNIT });
      if (utilityInfo && utilityInfo.DAM_ILLUMINATION_CODE === formData.MONITORING_DEVICE && utilityInfo.ID) {
        return true;
      }
      state.newDevice = ans.newDevice;
      state.hasMachine = ans.hasMachine;
      render();
      return ans.freeDevice;
    } catch (err) {
      return null;
    }
  };

  const notValidate = async () : Promise<boolean|null> => null;

  const handleValidateFunction = async () : Promise<boolean|null> => {
    if (formData.MONITORING_DEVICE.startsWith('DAM')) {
      return validateMonitoringDamIlluminationUtility();
    }
    if (formData.MONITORING_DEVICE.startsWith('DMT')) {
      return validateMonitoringDmtUtility();
    }
    if (formData.MONITORING_DEVICE.startsWith('DAL')) {
      return validateMonitoringIllumination();
    }
    return notValidate();
  };

  const getDeviceFormLabels = (application) => {
    if (application === t('nobreak')) {
      return {
        deviceCode: 'DMT_CODE',
        deviceIdText: t('digiteIdDmt'),
        devicePortText: t('feedbackDoDmt'),
        monitoringText: t('dispositivoDeMonitoramento'),
        validateFunction: validateMonitoringDmtUtility,
      };
    }
    return {
      deviceCode: 'DAL_CODE',
      deviceIdText: t('digiteIdDalDmtDam'),
      devicePortText: !formData.MONITORING_DEVICE.startsWith('DMT') ? t('portaDoDal') : t('feedbackDoDmt'),
      monitoringText: t('dispositivoDeAutomacao'),
      validateFunction: handleValidateFunction,
    };
  };

  const monitoringDeviceForm = () => {
    const labels = getDeviceFormLabels(formData.APPLICATION);

    if (labels.deviceCode) {
      return (
        <>
          <Flex flexDirection="row" justifyContent="space-between">
            <Flex flexDirection="column">
              <Flex flexDirection="row" alignItems="center">
                <IconWrapper>
                  <MonitoringIcon />
                </IconWrapper>
                <ModalTitle3>{t('possuiMonitoramento')}</ModalTitle3>
              </Flex>
              <div style={{ marginLeft: '34px' }}>
                <LabelSwitch>{t('nao')}</LabelSwitch>
                <ToggleSwitchMini
                  checked={state.hasMonitoring}
                  onClick={() => { state.hasMonitoring = !state.hasMonitoring; render(); formData.PORT = (state.hasMonitoring && utilityInfo && utilityInfo[labels.deviceCode] === formData.MONITORING_DEVICE && utilityInfo.PORT) || ''; render(); }}
                  style={{ marginLeft: '8px', marginRight: '8px' }}
                />
                <LabelSwitch>{t('sim')}</LabelSwitch>
              </div>
            </Flex>
            <div style={{ width: '48%' }}>
              <InputValidationContext.Provider value={{ allowedMonitoring, setAllowedMonitoring }}>
                <InputWithValidation
                  type="text"
                  value={formData.MONITORING_DEVICE}
                  label={labels.monitoringText}
                  placeholder={labels.deviceIdText}
                  onChange={(event) => { formData.MONITORING_DEVICE = event.target.value; setAllowedMonitoring(false); render(); formData.PORT = (state.hasMonitoring && utilityInfo && utilityInfo[labels.deviceCode] === formData.MONITORING_DEVICE && utilityInfo.PORT) || ''; render(); }}
                  disabled={!state.hasMonitoring}
                  validateFunction={labels.validateFunction}
                  newDevice={state.newDevice}
                  hasMachine={state.hasMachine}
                />
              </InputValidationContext.Provider>
            </div>
          </Flex>
          <div style={{ paddingTop: '5px' }} />

          <Flex flexDirection="row" style={{ position: 'relative' }} alignItems="center" justifyContent="space-between">
            <Flex flexDirection="column" width="48%">
              <Flex flexDirection="row" alignItems="center">
                <IconWrapper>
                  <PortIcon />
                </IconWrapper>
                <ModalTitle3>{t('portaUtilizada')}</ModalTitle3>
              </Flex>
              <Flex style={{ marginLeft: '34px' }}>
                <LabelSwitch>{t('selecionarDepois')}</LabelSwitch>
                <ToggleSwitchMini
                  checked={state.selectPortNow}
                  onClick={() => {
                    state.selectPortNow = !state.selectPortNow;
                    formData.PORT = (state.selectPortNow && utilityInfo && utilityInfo[labels.deviceCode] === formData.MONITORING_DEVICE && utilityInfo.PORT) || '';
                    formData.FEEDBACK = (state.selectPortNow && utilityInfo && utilityInfo[labels.deviceCode] === formData.MONITORING_DEVICE && utilityInfo.FEEDBACK) || '';
                    render();
                  }}
                  style={{ marginLeft: '8px', marginRight: '8px' }}
                />
                <LabelSwitch>{t('selecionarAgora')}</LabelSwitch>
              </Flex>
            </Flex>
            <div style={{ width: labels.deviceCode === 'DAL_CODE' && !formData.MONITORING_DEVICE.startsWith('DMT') ? '30%' : '48%' }}>
              <SelectDMTport
                label={labels.devicePortText}
                placeholder={t('selecionar')}
                options={state.portsOpt}
                propLabel="label"
                value={formData.PORT}
                hideSelected
                onSelect={(item) => {
                  formData.PORT = item;
                  render();
                }}
                disabled={!state.selectPortNow}
              />
            </div>
            {(labels.deviceCode === 'DAL_CODE' && !formData.MONITORING_DEVICE.startsWith('DMT')) && (
              <div style={{ width: '30%', marginLeft: '10px' }}>
                <SelectDMTport
                  label={t('feedbackDoDal')}
                  placeholder={t('selecionar')}
                  options={state.feedbackOpt}
                  propLabel="label"
                  value={formData.FEEDBACK}
                  hideSelected
                  onSelect={(item) => {
                    formData.FEEDBACK = item;
                    render();
                  }}
                  disabled={!state.selectPortNow}
                />
              </div>
            )}
            {(!allowedMonitoring || !state.hasMonitoring || formData.MONITORING_DEVICE.startsWith('DAM')) && (
            <div style={{
              zIndex: 9, background: '#ffffff', width: '100%', height: '100%', position: 'absolute', opacity: 0.7, top: 0, left: 0, borderRadius: '5px',
            }}
            />
            )}

          </Flex>
        </>
      );
    }
  };

  return (
    <div style={{ margin: '25px' }}>
      <Flex flexDirection="row" justifyContent="space-between">
        <Flex flexDirection="row" alignItems="center" mb="10px">
          <IconWrapper>
            <UtilityIcon />
          </IconWrapper>
          <ModalTitle3>{t('novoUtilitario')}</ModalTitle3>
        </Flex>
        {formData.ID && (
        <Flex flexDirection="row" alignItems="center" mb="10px">
          <ModalTitle3>ID:&nbsp;</ModalTitle3>
          <span>{formData.ID}</span>
        </Flex>
        )}
      </Flex>
      <Input
        type="text"
        value={formData.NAME}
        label={t('nomeDoUtilitario')}
        placeholder={t('digiteNomeUtilitario')}
        onChange={(event) => { formData.NAME = event.target.value; render(); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <CustomInput style={{ width: '100%' }}>
        <div style={{ width: '100%', paddingTop: 3, zIndex: 11 }}>
          <Label>{t('unidade')}</Label>
          <SelectSearch
            options={state.unitsOpt}
            value={formData.UNIT}
            onChange={(item) => { formData.UNIT = item; render(); }}
            search
            filterOptions={fuzzySearch}
            placeholder={t('selecioneUnidade')}
            closeOnSelect={false}
          />
        </div>
      </CustomInput>
      <div style={{ paddingTop: '10px' }} />
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <div style={{ width: formData.APPLICATION === t('iluminacao') ? '100%' : '48%' }}>
          <CustomInput style={{ width: '100%' }}>
            <div style={{ width: '100%', paddingTop: 3 }}>
              <Label>{t('aplicacao')}</Label>
              <SelectSearch
                options={state.applicationOpts}
                value={formData.APPLICATION}
                onChange={(item) => { formData.APPLICATION = item; render(); }}
                placeholder="Selecione a aplicação"
                closeOnSelect={false}
                disabled={utilityType}
              />
            </div>
          </CustomInput>
        </div>
        {' '}
        {formData.APPLICATION === t('nobreak') && (
          <div style={{ width: '48%' }}>
            <Input
              width="100%"
              type="date"
              value={formData.INSTALLATION_DATA}
              label={t('dataInstalacao')}
              onChange={(event) => { formData.INSTALLATION_DATA = event.target.value; render(); }}
            />
          </div>
        )}
      </Flex>
      {formData.APPLICATION === t('nobreak') && (
        <>
          <div style={{ paddingTop: '10px' }} />

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <div style={{ width: '48%' }}>
              <Input
                type="text"
                value={formData.MANUFACTURER}
                label={t('fabricante')}
                placeholder={t('digiteFabricante')}
                onChange={(event) => { formData.MANUFACTURER = event.target.value; render(); }}
              />
            </div>
            {' '}
            <div style={{ width: '48%' }}>
              <Input
                type="text"
                value={formData.MODEL}
                label={t('modelo')}
                placeholder={t('digiteModelo')}
                onChange={(event) => { formData.MODEL = event.target.value; render(); }}
              />
            </div>
          </Flex>
          <div style={{ paddingTop: '10px' }} />
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <div style={{ width: '48%' }}>
              <CustomInput style={{ width: '100%' }}>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('tensaoDeEntrada')}</Label>
                  <SelectSearch
                    options={['127 VAC', '220 VAC', '380 VAC'].map((e) => ({ name: e, value: e }))}
                    value={formData.INPUT_VOLTAGE}
                    onChange={(item) => { formData.INPUT_VOLTAGE = item; render(); }}
                    placeholder={t('selecioneTensao')}
                    closeOnSelect={false}
                  />
                </div>
              </CustomInput>
            </div>
            {' '}
            <div style={{ width: '48%' }}>
              <CustomInput style={{ width: '100%' }}>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('tensaoDeSaida')}</Label>
                  <SelectSearch
                    options={['127 VAC', '220 VAC'].map((e) => ({ name: e, value: e }))}
                    value={formData.OUTPUT_VOLTAGE}
                    onChange={(item) => { formData.OUTPUT_VOLTAGE = item; render(); }}
                    placeholder={t('selecioneTensao')}
                    closeOnSelect={false}
                  />
                </div>
              </CustomInput>
            </div>

          </Flex>
          <div style={{ paddingTop: '10px' }} />
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <div style={{ width: '48%' }}>
              <Input
                type="number"
                value={formData.NOMINAL_POTENTIAL}
                placeholder={t('digite')}
                label={t('potenciaNominal')}
                onChange={(event) => { formData.NOMINAL_POTENTIAL = event.target.value; render(); }}
                suffix="VA"
                noSuffixBorder
              />
            </div>
            {' '}
            <div style={{ width: '48%' }}>
              <Input
                type="number"
                value={formData.BATTERY_LIFE}
                placeholder={t('digite')}
                label={t('autonomiaNominalDaBateriaInterna')}
                onChange={(event) => { formData.BATTERY_LIFE = event.target.value; render(); }}
                suffix="min"
                noSuffixBorder
              />
            </div>
          </Flex>
          <div style={{ paddingTop: '10px' }} />
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <div style={{ width: '48%' }}>
              <Input
                type="number"
                value={formData.INPUT_ELECTRIC_CURRENT}
                placeholder={t('digite')}
                label={t('correnteEletricaDeEntrada')}
                onChange={(event) => { formData.INPUT_ELECTRIC_CURRENT = event.target.value; render(); }}
                suffix="A"
                noSuffixBorder
              />
            </div>
            {' '}
            <div style={{ width: '48%' }}>
              <Input
                type="number"
                value={formData.OUTPUT_ELECTRIC_CURRENT}
                placeholder={t('digite')}
                label={t('correnteEletricaDeSaida')}
                onChange={(event) => { formData.OUTPUT_ELECTRIC_CURRENT = event.target.value; render(); }}
                suffix="A"
                noSuffixBorder
              />
            </div>
          </Flex>
          <div style={{ paddingTop: '10px' }} />
          <Flex flexDirection="row" justifyContent="flex-start" alignItems="center">
            <div style={{ width: '100%' }}>
              <Input
                type="number"
                value={formData.NOMINAL_BATTERY_CAPACITY}
                placeholder={t('digite')}
                label={t('capacidadeNominalDaBateria')}
                onChange={(event) => { formData.NOMINAL_BATTERY_CAPACITY = event.target.value; render(); }}
                suffix="Ah"
                noSuffixBorder
              />
            </div>
            {' '}
          </Flex>
          <div style={{ paddingTop: '15px' }} />

          {monitoringDeviceForm()}

          <div style={{ paddingTop: '15px' }} />

          <Flex flexDirection="row" justifyContent="space-between">
            <Flex flexDirection="column">
              <Flex flexDirection="row" alignItems="center">
                <IconWrapper>
                  <DatIcon />
                </IconWrapper>
                <ModalTitle3>{t('possuiDatId')}</ModalTitle3>
              </Flex>
              <div style={{ marginLeft: '34px' }}>
                <LabelSwitch>{t('nao')}</LabelSwitch>
                <ToggleSwitchMini
                  checked={state.hasDatId}
                  onClick={() => { state.hasDatId = !state.hasDatId; render(); formData.DAT_ID = (state.hasDatId && utilityInfo && utilityInfo.DAT_ID) || ''; render(); }}
                  style={{ marginLeft: '8px', marginRight: '8px' }}
                />
                <LabelSwitch>{t('sim')}</LabelSwitch>
              </div>
            </Flex>
            <div style={{ width: '48%' }}>
              <Input
                type="text"
                value={formData.DAT_ID}
                label="DAT ID"
                placeholder={t('digiteId')}
                onChange={(event) => { formData.DAT_ID = event.target.value; render(); }}
                disabled={!state.hasDatId}
              />
            </div>
          </Flex>
        </>
      )}
      {formData.APPLICATION === t('iluminacao') && (
        <>
          <div style={{ paddingTop: '10px' }} />

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <div style={{ width: '48%' }}>
              <CustomInput style={{ width: '100%' }}>
                <div style={{ width: '100%', paddingTop: 3, zIndex: 10 }}>
                  <Label>{t('tensaoDaRede')}</Label>
                  <SelectSearch
                    options={['127 VAC', '220 VAC', '380 VAC'].map((e) => ({ name: e, value: e }))}
                    value={formData.GRID_VOLTAGE}
                    onChange={(item) => { formData.GRID_VOLTAGE = item; render(); }}
                    placeholder={t('selecioneTensao')}
                    closeOnSelect={false}
                  />
                </div>
              </CustomInput>
            </div>
            {' '}
            <div style={{ width: '48%' }}>
              <Input
                type="text"
                value={formData.GRID_CURRENT}
                label={t('correnteDaRede')}
                placeholder={t('digitar')}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (!Number.isNaN(value) && value >= 0) {
                    formData.GRID_CURRENT = event.target.value;
                    render();
                  }
                }}
                suffix="A"
              />
            </div>
          </Flex>

          <div style={{ paddingTop: '15px' }} />

          {monitoringDeviceForm()}

          <div style={{ paddingTop: '15px' }} />
        </>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '15px',
      }}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button disabled={state.buttonDisabled && (formData.APPLICATION === t('nobreak') || formData.APPLICATION === t('iluminacao'))} style={{ width: '30%' }} onClick={confirm} variant="primary">
          {t('finalizar')}
        </Button>
      </div>
    </div>
  );
};
