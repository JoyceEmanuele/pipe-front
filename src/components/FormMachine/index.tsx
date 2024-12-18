import SelectSearch, { fuzzySearch } from 'react-select-search';
import {
  CustomInput,
  Label,
  IconWrapper,
  PlaceholderWrapper,
} from './styles';
import { Input } from 'components/NewInputs/Default';
import { ToggleSwitchMini } from '../ToggleSwitch';
import {
  useState,
  useEffect,
} from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  ChipIcon,
  LayersIcon,
  TemperatureIcon,
} from '../../icons';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface ComponentProps {
    onHandleChangeMachine,
    onHandleChangeAsset,
    unitsOpt: {
      value: number
      name: string
    }[],
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
    },
    machine: {
      groupId: number|null,
      name: string|null,
      unitId: number|null,
      unitName: string|null,
      brandName: string|null,
      type: string|null,
      model: string|null,
      refrigerationCapacity: string|null,
      refrigerationFluid: string|null,
      applic: string|null,
      ratedPower: string | null,
      installationDate: string|null,
      automationDevId: string|null,
      capacityMeasurementUnit: string|null,
      refDUTId: string | null
      assetsSumRatedPower: string | null,
    },
    asset: TAssets,
    registerParente,
    handleSelectedApplication: (selectedApplication: boolean) => void,
    handleSelectedChillerCarrier: (selectedChillerCarrier: boolean) => void,
    handleSelectedChillerModel: (selectedChillerModel: boolean) => void,
    handleSelectedChillerLine: (selectedChillerLine: boolean) => void,
    isChillerCarrier: boolean,
    selectedApplication: boolean,
    selectedChillerModel: boolean,
    selectedChillerLine: boolean,
}

type Inputs = {
  name: string|null,
  model: string|null,
  refrigerationCapacity: string|null,
  capacityMeasurementUnit: string|null,
  ratedPower: string | null,
  installationDate: string|null,
  automationDevId: string|null,
  refDUTId: string | null,
  chillerModel: string | null,
  chillerModelValue: number | null,
  datId: string|null,
  devId: string|null,
  nominalCapacity: number|null,
  nominalVoltage: number|null,
  nominalFrequency: number|null,
};

type TAssets = {
  index: number,
  name: string|null,
  installationLocation: string|null,
  brandName: string|null,
  roleId: number | null,
  role: string|null,
  brandValue?: number|null,
  type: string|null,
  typeValue?: string|null,
  model: string|null,
  datId: string|null,
  devId: string|null,
  refrigerationCapacity: string|null,
  ratedPower: string|null,
  refrigerationFluid: string|null,
  refrigerationFluidValue?: string|null,
  capacityMeasurementUnit: string | null,
  devClientAssetId: number | null,
  datIndex: number | null,
  devIdPersisted: string|null,
  assetId: number | null,
  chillerModel: string | null,
  chillerModelValue: number | null,
  chillerLine: string | null,
  chillerLineValue: number | null,
  nominalCapacity: number | null,
  nominalVoltage: number | null,
  nominalFrequency: number | null,
}

const formValidators = {
  name: {
    message: 'O campo deve ter entre 3 e 250 caracteres.',
    required: true,
    validate: (value) => {
      if (value) {
        return (value.length < 250);
      } return true;
    },
  },
  model: {
    required: false,
  },
  refrigerationCapacity: {
    required: false,
  },
  capacityMeasurementUnit: {
    required: false,
  },
  refrigerationFluid: {
    required: false,
  },
  applic: {
    required: false,
  },
  ratedPower: {
    required: false,
  },
  installationDate: {
    required: false,
  },
  automationDevId: {
    required: false,
  },
  refDUTId: {
    required: false,
  },
  chillerModel: {
    required: false,
  },
  chillerModelValue: {
    required: false,
  },
  datId: {
    required: false,
  },
  devId: {
    required: false,
  },
  nominalCapacity: {
    required: false,
  },
  nominalVoltage: {
    required: false,
  },
  nominalFrequency: {
    required: false,
  },
};

export const FormMachine = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const [state] = useStateVar({
    isLoading: false as boolean,
  });
  const handleSwitchAutomation = (machineAutomation: string | null) => machineAutomation ?? props.machine.groupId == null;
  const [switchCapacity] = useState(props.machine.capacityMeasurementUnit?.startsWith('BTU/h'));
  const [switchAutomation, setSwitchAutomation] = useState(handleSwitchAutomation(props.machine.automationDevId));
  const [switchRefDut, setSwitchRefDut] = useState(handleSwitchAutomation(props.machine.refDUTId));
  const [switchDat, setSwitchDat] = useState(false);
  const [switchDev, setSwitchDev] = useState(false);
  const [chillerModelsFilter, setChillerModelsFilter] = useState(props.comboOpts.chillerModels);

  const [formData, render] = useStateVar({
    groupId: props.machine.groupId,
    name: props.machine.name,
    unitId: props.machine.unitId,
    unitName: props.machine.unitName,
    brandName: props.machine.brandName,
    brandValue: props.machine.brandName ? (props.comboOpts.brands.find((brand) => brand.id === props.machine.brandName))?.value : null as number|null,
    type: props.machine.type,
    typeValue: props.machine.type ? (props.comboOpts.types.find((type) => type.id === props.machine.type))?.value : null as number|null,
    model: props.machine.model,
    refrigerationCapacity: props.machine.refrigerationCapacity,
    refrigerationFluid: props.machine.refrigerationFluid,
    refrigerationFluidValue: props.machine.refrigerationFluid ? (props.comboOpts.fluids.find((fluid) => fluid.id === props.machine.refrigerationFluid))?.value : null as number|null,
    applic: props.machine.applic,
    applicValue: props.machine.applic ? (props.comboOpts.applics.find((applic) => applic.id === props.machine.applic))?.value : null as number|null,
    ratedPower: props.machine.ratedPower,
    installationDate: props.machine.installationDate,
    automationDevId: props.machine.automationDevId,
    capacityMeasurementUnit: props.machine.capacityMeasurementUnit || 'TR',
    refDUTId: props.machine.refDUTId,
    assetsSumRatedPower: props.machine.assetsSumRatedPower,
  });

  const [formDataAsset, setFormDataAsset] = useState<TAssets>({
    index: 0,
    name: null,
    installationLocation: null,
    brandName: null,
    roleId: null,
    role: null,
    brandValue: null,
    type: null,
    typeValue: null,
    model: null,
    datId: props.asset?.datId || null,
    devId: props.asset?.devId || null,
    refrigerationCapacity: null,
    ratedPower: null,
    refrigerationFluid: null,
    refrigerationFluidValue: null,
    capacityMeasurementUnit: null,
    devClientAssetId: null,
    datIndex: null,
    devIdPersisted: null,
    assetId: null,
    chillerModel: null,
    chillerModelValue: null,
    chillerLine: null,
    chillerLineValue: null,
    nominalCapacity: null,
    nominalVoltage: null,
    nominalFrequency: null,
  });
  function handleFormDataAsset(paramAsset) {
    return paramAsset || null;
  }

  function handleFormDataFind(paramFind, arrayParamFind) {
    return paramFind ? (arrayParamFind.find((e) => e.id === paramFind))?.value : null as number|null;
  }

  const notSelectedChillerCarrier = !props.isChillerCarrier;
  const selectedChillerCarrier = props.selectedApplication && props.isChillerCarrier;
  const isEdit = !!formData.groupId;

  useEffect(() => {
    updateMachineData();
  }, []);
  useEffect(() => {
    if (props.asset) {
      setFormDataAsset({
        index: props.asset?.index || 0 as number,
        name: handleFormDataAsset(props.asset?.name),
        installationLocation: handleFormDataAsset(props.asset?.installationLocation),
        brandName: handleFormDataAsset(props.asset?.brandName),
        roleId: handleFormDataAsset(props.asset?.roleId),
        role: handleFormDataAsset(props.asset?.role),
        brandValue: handleFormDataFind(props.asset?.brandName, props.comboOpts.brands),
        type: handleFormDataAsset(props.asset?.type),
        typeValue: handleFormDataFind(props.asset?.type, props.comboOpts.types),
        model: handleFormDataAsset(props.asset?.model),
        datId: handleFormDataAsset(props.asset?.datId),
        devId: handleFormDataAsset(props.asset?.devId),
        refrigerationCapacity: handleFormDataAsset(props.asset?.refrigerationCapacity),
        ratedPower: handleFormDataAsset(props.asset?.ratedPower),
        refrigerationFluid: handleFormDataAsset(props.asset?.refrigerationFluid),
        refrigerationFluidValue: handleFormDataFind(props.asset?.refrigerationFluid, props.comboOpts.fluids),
        capacityMeasurementUnit: props.asset?.capacityMeasurementUnit ?? 'TR',
        devClientAssetId: handleFormDataAsset(props.asset?.devClientAssetId),
        datIndex: handleFormDataAsset(props.asset?.datIndex),
        devIdPersisted: handleFormDataAsset(props.asset?.devIdPersisted),
        assetId: null,
        chillerModel: handleFormDataAsset(props.asset?.chillerModel),
        chillerModelValue: handleFormDataAsset(props.asset?.chillerModelValue),
        chillerLine: handleFormDataAsset(props.asset?.chillerLine),
        chillerLineValue: handleFormDataAsset(props.asset?.chillerLineValue),
        nominalCapacity: handleFormDataAsset(props.asset?.nominalCapacity),
        nominalVoltage: handleFormDataAsset(props.asset?.nominalVoltage),
        nominalFrequency: handleFormDataAsset(props.asset?.nominalFrequency),
      });
      if (props.asset.devId) {
        setSwitchDev(true);
      }
      if (props.asset.datId) {
        setSwitchDat(true);
      }
      render();
    }
  }, [props.asset, props.comboOpts]);

  useEffect(() => {
    props.handleSelectedApplication(!!formData.applic);
    props.handleSelectedChillerCarrier(formData.applic === 'chiller' && formData.brandName === 'carrier');
  }, []);

  useEffect(() => {
    if (props?.asset?.chillerLine) {
      const chillerIds = props.modelsChillerList.filter((model) => model.lineName === props.asset.chillerLine).map((item) => item.id);
      setChillerModelsFilter(props.comboOpts.chillerModels.filter((model) => chillerIds.includes(model.value)));
      render();
    }
  }, []);

  const updateMachineData = () => {
    state.isLoading = true;
    setValue('name', formData.name);
    setValue('model', formData.model);
    setValue('refrigerationCapacity', formData.refrigerationCapacity);
    setValue('capacityMeasurementUnit', formData.capacityMeasurementUnit);
    setValue('ratedPower', formData.ratedPower);
    setValue('installationDate', formData.installationDate);
    setValue('automationDevId', formData.automationDevId);
    setValue('refDUTId', formData.refDUTId);
    setValue('chillerModel', formDataAsset.chillerModel);
    setValue('datId', formDataAsset.datId);
    setValue('devId', formDataAsset.devId);
    setValue('nominalCapacity', formDataAsset.nominalCapacity);
    setValue('nominalVoltage', formDataAsset.nominalVoltage);
    setValue('nominalFrequency', formDataAsset.nominalFrequency);

    state.isLoading = false;
    render();
  };

  const {
    register, setValue, watch, formState: { errors },
  } = useForm<Inputs>({
    mode: 'all',
  });

  function onFilterUnitChange(unitId) {
    formData.unitId = unitId;
    const unitAux = props.unitsOpt.find((unit) => unit.value === unitId);
    formData.unitName = unitAux?.name || null;
    props.onHandleChangeMachine(formData);
    render();
  }

  function onFilterTypeChange(typeId) {
    const typeAux = props.comboOpts.types.find((type) => type.value === typeId);
    formData.type = typeAux?.id || null;
    formData.typeValue = typeId;
    props.onHandleChangeMachine(formData);
    render();
  }

  function onFilterBrandChange(brandId) {
    const brandAux = props.comboOpts.brands.find((brand) => brand.value === brandId);
    formData.brandName = brandAux?.id || null;
    formData.brandValue = brandId;
    props.handleSelectedChillerCarrier(formData.applic === 'chiller' && formData.brandName === 'carrier');
    if (props.isChillerCarrier) {
      formDataAsset.brandName = brandAux?.id || null;
      formDataAsset.brandValue = brandId;
      props.onHandleChangeAsset([formDataAsset]);
    }
    props.onHandleChangeMachine(formData);
    render();
  }

  function maskInput(value: string) {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '$1/$2');
    value = value.replace(/(\d{2})(\d)/, '$1/$2');
    value = value.replace(/(\d{2})(\d{2})$/, '$1$2');

    return value;
  }

  function onFilterRefrigerationFluidChange(fluidId) {
    const fluidAux = props.comboOpts.fluids.find((fluid) => fluid.value === fluidId);
    formData.refrigerationFluid = fluidAux?.id || null;
    formData.refrigerationFluidValue = fluidId;
    props.onHandleChangeMachine(formData);
    render();
  }

  function onFilterApplicChange(applicId) {
    const applicAux = props.comboOpts.applics.find((applic) => applic.value === applicId);
    formData.applic = applicAux?.id || null;
    formData.applicValue = applicId;
    if (!(formData?.applic === 'chiller' && formData?.brandName === 'carrier')) {
      formDataAsset.chillerModel = null;
      formDataAsset.chillerModelValue = null;
      formDataAsset.nominalCapacity = null;
      formDataAsset.nominalVoltage = null;
      formDataAsset.nominalFrequency = null;
      props.onHandleChangeAsset([formDataAsset]);
    }
    props.handleSelectedChillerCarrier(formData.applic === 'chiller' && formData.brandName === 'carrier');
    props.handleSelectedApplication(!!formData.applic);
    props.onHandleChangeMachine(formData);
    render();
  }

  function onFilterModelChillerChange(chillerModelId) {
    const chillerModelAux = props.comboOpts.chillerModels.find((model) => model.value === chillerModelId);
    const chillerInfo = props.modelsChillerList.find((model) => model.modelName === chillerModelAux?.name);
    formDataAsset.chillerModel = chillerModelAux?.name || null;
    formDataAsset.chillerModelValue = chillerModelId;
    props.handleSelectedChillerModel(!!formDataAsset.chillerModel);
    render();

    formDataAsset.nominalCapacity = chillerInfo?.nominalCapacity || null;
    formDataAsset.nominalVoltage = chillerInfo?.nominalVoltage || null;
    formDataAsset.nominalFrequency = chillerInfo?.nominalFrequency || null;
    formDataAsset.brandName = formData.brandName;
    formDataAsset.brandValue = formData.brandValue;

    const roleAux = props.comboOpts.roles.find((unit) => unit.name === 'Chiller');
    formDataAsset.roleId = roleAux?.value || null;
    formDataAsset.role = roleAux?.name || null;

    props.onHandleChangeAsset([formDataAsset]);
    render();
  }

  function onFilterLineChillerChange(chillerLineId) {
    const chillerLineAux = props.comboOpts.chillerLines.find((line) => line.value === chillerLineId);
    const chillerIds = props.modelsChillerList.filter((model) => model.lineName === chillerLineAux?.name).map((item) => item.id);
    setChillerModelsFilter(props.comboOpts.chillerModels.filter((model) => chillerIds.includes(Number(model.value))));
    formDataAsset.chillerLine = chillerLineAux?.name || null;
    formDataAsset.chillerLineValue = chillerLineId;
    formDataAsset.chillerModel = null;
    formDataAsset.chillerModelValue = null;
    props.handleSelectedChillerLine(!!formDataAsset.chillerLine);
    props.handleSelectedChillerModel(!!formDataAsset.chillerModel);
    render();

    props.onHandleChangeAsset([formDataAsset]);
    render();
  }

  function errorOrUndefined(error) {
    if (error?.message) return error.message;
    return undefined;
  }

  return (
    <Flex flexWrap="wrap" flexDirection="column" justifyContent="space-between">
      <Flex flexWrap="nowrap" flexDirection="row" justifyContent="space-between">
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left">
          <IconWrapper>
            <LayersIcon />
          </IconWrapper>
          <strong style={{ fontSize: '14px' }}>
            {t('maquina')}
          </strong>
        </Flex>
        {(isEdit && formData.groupId) && (
          <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left">
            <strong style={{ fontSize: '14px', color: 'rgba(75, 75, 75, 1)', marginRight: '2px' }}>
              ID:
            </strong>
            <span style={{ color: 'rgba(75, 75, 75, 1)' }}>{` ${formData.groupId}`}</span>
          </Flex>
        )}
      </Flex>
      <Flex flexWrap="wrap" flexDirection="row" mt="24px" justifyContent="space-between">
        <CustomInput style={{ width: '100%' }}>
          <Input
            placeholder={t('digiteNomeMaquina')}
            isInputFilled={!!watch('name')}
            label={t('nomeMaquina')}
            formLabel="name"
            validation={formValidators.name}
            error={errorOrUndefined(errors.name)}
            register={register}
            style={{ width: '100%', border: '0px' }}
            handleChange={(event) => { formData.name = event.target.value; props.onHandleChangeMachine(formData); }}
            data-test-id="nameMachine"
          />
        </CustomInput>
      </Flex>
      <Flex flexWrap="wrap" flexDirection="row" mt="15px" justifyContent="space-between">
        <CustomInput style={{ width: '565px' }}>
          <div style={{ width: '100%', paddingTop: 3 }}>
            <Label>{t('unidade')}</Label>
            <SelectSearch
              options={props.unitsOpt}
              value={formData.unitId?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              onChange={onFilterUnitChange}
              placeholder={t('selecioneUnidade')}
              // eslint-disable-next-line react/jsx-no-bind
              disabled={state.isLoading}
              closeOnSelect={false}
              data-test-id="unityMachine"
            />
          </div>
        </CustomInput>
      </Flex>
      <Flex flexWrap="wrap" flexDirection="row" mt="15px" justifyContent="space-between">
        <CustomInput style={{ width: '565px' }}>
          <div style={{ width: '100%', paddingTop: 3 }}>
            <Label>{t('tipoMaquina')}</Label>
            <SelectSearch
              options={props.comboOpts.types}
              value={formData.typeValue?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder={t('selecioneTipo')}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={onFilterTypeChange}
              disabled={state.isLoading}
              closeOnSelect={false}
              data-test-id="typeMachine"
            />
          </div>
        </CustomInput>
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="row" mt="15px" justifyContent="left">
        <CustomInput style={{ width: '275px' }}>
          <div style={{ width: '100%', paddingTop: 3 }}>
            <Label>{t('fabricante')}</Label>
            <SelectSearch
              options={props.comboOpts.brands}
              value={formData.brandValue?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder={t('selecionarFabricante')}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={onFilterBrandChange}
              disabled={state.isLoading}
              closeOnSelect={false}
              data-test-id="manufacturerMachine"
            />
          </div>
        </CustomInput>
        <CustomInput style={{
          width: '275px', marginLeft: '15px',
        }}
        >
          <div style={{
            width: '100%', paddingTop: 3,
          }}
          >
            <Label>{t('aplicacao')}</Label>
            <SelectSearch
              options={props.comboOpts.applics}
              value={formData.applicValue?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder={t('selecionar')}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={onFilterApplicChange}
              disabled={state.isLoading}
              closeOnSelect={false}
              data-test-id="applicationMachine"
            />
          </div>
        </CustomInput>
      </Flex>

      {!props.selectedApplication
      && (
      <Flex flexWrap="nowrap" flexDirection="row" mt="15px" justifyContent="left">
        <CustomInput style={{ width: '275px' }}>
          <Input
            placeholder="___/____/_____"
            isInputFilled={!!watch('installationDate')}
            label={t('dataInstalacao')}
            formLabel="installationDate"
            validation={false}
            error={errorOrUndefined(errors.installationDate)}
            register={register}
            handleChange={(event) => { formData.installationDate = maskInput(event.target.value); setValue('installationDate', formData.installationDate); props.onHandleChangeMachine(formData); }}
            style={{ width: '100%', border: '0px' }}
            data-test-id="installationMachine"
          />
        </CustomInput>
      </Flex>
      )}

      {notSelectedChillerCarrier
      && (
      <>
        <Flex flexWrap="nowrap" flexDirection="row" mt="15px" justifyContent="left">
          <CustomInput style={{ width: '275px' }}>
            <div style={{ width: '100%' }}>
              <Input
                placeholder="Digite"
                isInputFilled={!!watch('refrigerationCapacity')}
                label="Cap. Frigorífica"
                formLabel="refrigerationCapacity"
                validation={false}
                error={errorOrUndefined(errors.refrigerationCapacity)}
                register={register}
                style={{ width: '100%', border: '0px' }}
                disabled
                handleChange={(event) => { formData.refrigerationCapacity = event.target.value; props.onHandleChangeMachine(formData); }}
                data-test-id="capacityMachine"
              />
            </div>
            <PlaceholderWrapper>
              {!switchCapacity ? 'TR' : 'BTU/h'}
            </PlaceholderWrapper>
          </CustomInput>
          <CustomInput style={{ width: '275px', marginLeft: '15px' }}>
            <div style={{ width: '100%', paddingTop: 3 }}>
              <Label>Fluído Refrigerante</Label>
              <SelectSearch
                options={props.comboOpts.fluids}
                value={formData.refrigerationFluidValue?.toString() || ''}
                printOptions="on-focus"
                search
                filterOptions={fuzzySearch}
                placeholder="Selecionar fluído"
            // eslint-disable-next-line react/jsx-no-bind
                onChange={onFilterRefrigerationFluidChange}
                disabled={state.isLoading}
                closeOnSelect={false}
                data-test-id="fluidMachine"
              />
            </div>
          </CustomInput>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" mt="4px" justifyContent="space-between">
          <div style={{ fontSize: '12.5px' }}>
            Unidade Cap. Frig. TR
            <ToggleSwitchMini
              checked={!!switchCapacity}
              style={{ marginLeft: '7px', marginRight: '7px' }}
              onClick={(e) => { e.preventDefault(); }}
              disabled
              data-test-id="UnCapFrigTRBTU"
            />
            BTU/h
          </div>
        </Flex>
        <Flex flexWrap="nowrap" flexDirection="row" mt="15px" justifyContent="left">
          <CustomInput style={{ width: '275px' }}>
            <div style={{ width: '100%' }}>
              <Input
                placeholder="Digite"
                isInputFilled={!!watch('ratedPower')}
                label="Potência Nominal"
                formLabel="ratedPower"
                validation={false}
                error={errorOrUndefined(errors.ratedPower)}
                register={register}
                style={{ width: '100%', border: '0px' }}
                handleChange={(event) => { formData.ratedPower = event.target.value.replace(',', '.'); props.onHandleChangeMachine(formData); }}
                data-test-id="PowerMachine"
              />
            </div>
            <PlaceholderWrapper>
              kW
            </PlaceholderWrapper>
          </CustomInput>

          <CustomInput style={{ width: '275px', marginLeft: '15px' }}>
            <Input
              placeholder="___/____/_____"
              isInputFilled={!!watch('installationDate')}
              label={t('dataInstalacao')}
              formLabel="installationDate"
              validation={false}
              error={errorOrUndefined(errors.installationDate)}
              register={register}
              handleChange={(event) => { formData.installationDate = maskInput(event.target.value); setValue('installationDate', formData.installationDate); props.onHandleChangeMachine(formData); }}
              style={{ width: '100%', border: '0px' }}
              data-test-id="installationMachine"
            />
          </CustomInput>

        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="left" mt="15px">
          <Flex flexWrap="wrap" flexDirection="column" justifyContent="left" mt="24px">
            <Flex>
              <IconWrapper>
                <ChipIcon />
              </IconWrapper>
              <strong style={{ fontSize: '12px', marginLeft: '5px' }}>
                Possui automação?
              </strong>
            </Flex>
            <div style={{ fontSize: '12.5px', marginLeft: '30px' }}>
              Não
              <ToggleSwitchMini checked={!!switchAutomation} style={{ marginLeft: '7px', marginRight: '7px' }} onClick={(e) => { e.preventDefault(); setSwitchAutomation(!switchAutomation); }} />
              Sim
            </div>
          </Flex>
          <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="49px" mt="20px">
            <CustomInput style={{
              width: '275px',
            }}
            >
              <Input
                placeholder=""
                isInputFilled={!!watch('automationDevId')}
                label="Dispositivo Automação"
                formLabel="automationDevId"
                validation={formValidators.automationDevId}
                error={errorOrUndefined(errors.automationDevId)}
                register={register}
                style={{ width: '100%', border: '0px' }}
                disabled={!switchAutomation}
                handleChange={(event) => { formData.automationDevId = event.target.value; props.onHandleChangeMachine(formData); }}
                data-test-id="automationMachine"
              />
            </CustomInput>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="left">
          <Flex flexWrap="wrap" flexDirection="column" justifyContent="left" mt="24px">
            <Flex>
              <IconWrapper>
                <TemperatureIcon />
              </IconWrapper>
              <strong style={{ fontSize: '12px', marginLeft: '5px' }}>
                Possui DUT referência?
              </strong>
            </Flex>
            <div style={{ fontSize: '12.5px', marginLeft: '30px' }}>
              Não
              <ToggleSwitchMini checked={!!switchRefDut} style={{ marginLeft: '7px', marginRight: '7px' }} onClick={(e) => { e.preventDefault(); setSwitchRefDut(!switchRefDut); }} />
              Sim
            </div>
          </Flex>
          <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="28px" mt="20px">
            <CustomInput style={{
              width: '275px',
            }}
            >
              <Input
                placeholder=""
                isInputFilled={!!watch('refDUTId')}
                label="DUT Referência"
                formLabel="refDUTId"
                validation={formValidators.refDUTId}
                error={errorOrUndefined(errors.refDUTId)}
                register={register}
                style={{ width: '100%', border: '0px' }}
                disabled={!switchRefDut}
                handleChange={(event) => { formData.refDUTId = event.target.value; props.onHandleChangeMachine(formData); }}
                data-test-id="refDutMachine"
              />
            </CustomInput>

          </Flex>
        </Flex>
      </>
      )}

      {selectedChillerCarrier
      && (
        <>
          <Flex flexWrap="nowrap" flexDirection="row" mt="15px" justifyContent="left">
            <CustomInput style={{ width: '275px' }}>
              <Input
                placeholder="___/____/_____"
                isInputFilled={!!watch('installationDate')}
                label={t('dataInstalacao')}
                formLabel="installationDate"
                validation={false}
                error={errorOrUndefined(errors.installationDate)}
                register={register}
                handleChange={(event) => { formData.installationDate = maskInput(event.target.value); setValue('installationDate', formData.installationDate); props.onHandleChangeMachine(formData); }}
                style={{ width: '100%', border: '0px' }}
                data-test-id="installationMachine"
              />
            </CustomInput>
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" width="275px" marginLeft="15px">
              <CustomInput style={{
                width: '40%',
              }}
              >
                <div style={{
                  width: '100%', paddingTop: 3,
                }}
                >
                  <Label>{t('linha')}</Label>
                  <SelectSearch
                    options={props.comboOpts.chillerLines}
                    value={formDataAsset.chillerLineValue?.toString() || ''}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecionar')}
                    onChange={onFilterLineChillerChange}
                    disabled={state.isLoading}
                    closeOnSelect={false}
                    data-test-id="chillerLine"
                  />
                </div>
              </CustomInput>
              <CustomInput style={{
                width: '60%', marginLeft: '10px',
              }}
              >
                <div style={{
                  width: '100%', paddingTop: 3,
                }}
                >
                  <Label>{t('modelo')}</Label>
                  <SelectSearch
                    options={chillerModelsFilter}
                    value={formDataAsset.chillerModelValue?.toString() || ''}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecione')}
                    onChange={onFilterModelChillerChange}
                    disabled={state.isLoading || !props.selectedChillerLine}
                    closeOnSelect={false}
                    data-test-id="chillerModel"
                  />
                </div>
              </CustomInput>
            </Flex>
          </Flex>
          <Flex flexWrap="nowrap" flexDirection="row" mt="17px" justifyContent="left">
            <CustomInput style={{
              width: '275px',
            }}
            >
              <Input
                placeholder={t('digiteId')}
                isInputFilled={!!watch('datId')}
                label="DAT ID"
                formLabel="datId"
                validation={false}
                error={errorOrUndefined(errors.datId)}
                register={register}
                style={{ width: '100%', border: '0px' }}
                disabled={(formDataAsset.datId?.length === 0 || !formDataAsset.datId) && !switchDat}
                value={formDataAsset.datId || ''}
                handleChange={(event) => {
                  formDataAsset.datId = event.target.value;
                  if (event.target.value.length === 0) {
                    setSwitchDat(false);
                  }
                  props.onHandleChangeAsset([formDataAsset]);
                  render();
                }}
                data-test-id="datID"
              />

            </CustomInput>
            <CustomInput style={{
              width: '275px', marginLeft: '15px',
            }}
            >
              <Input
                placeholder={t('digiteId')}
                isInputFilled={!!watch('devId')}
                label={t('dispositivoDiel')}
                formLabel="devId"
                validation={false}
                error={errorOrUndefined(errors.devId)}
                register={register}
                value={formDataAsset.devId || ''}
                style={{ width: '100%', border: '0px' }}
                disabled={(formDataAsset.devId?.length === 0 || !formDataAsset.devId) && !switchDev}
                handleChange={(event) => {
                  formDataAsset.devId = event.target.value;
                  if (event.target.value.length === 0) {
                    setSwitchDev(false);
                  }
                  props.onHandleChangeAsset([formDataAsset]);
                  render();
                }}
                data-test-id="devID"
              />
            </CustomInput>

          </Flex>
          <Flex flexWrap="nowrap" widht="100%" flexDirection="row" mt="6px" justifyContent="left">
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="5px" width="275px">
              <div style={{ fontSize: '11px' }}>
                {t('possuiDatId')}
              </div>
              <div style={{ marginLeft: '36px', fontSize: '11px' }}>
                {t('nao')}
              </div>
              <ToggleSwitchMini checked={(formDataAsset.datId?.length !== 0 && formDataAsset.datId != null) || switchDat} style={{ marginLeft: '7px', marginRight: '7px' }} onClick={(e) => { e.preventDefault(); if (switchDat) { formDataAsset.datId = ''; props.onHandleChangeAsset([formDataAsset]); } setSwitchDat(!switchDat); render(); }} />
              <div style={{ fontSize: '11px' }}>
                {t('sim')}
              </div>
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="15px">
              <div style={{ fontSize: '11px' }}>
                {t('possuiDispDiel')}
              </div>
              <div style={{ marginLeft: '25px', fontSize: '11px' }}>
                {t('nao')}
              </div>
              <ToggleSwitchMini checked={(formDataAsset.devId?.length !== 0 && formDataAsset.devId != null) || switchDev} style={{ marginLeft: '7px', marginRight: '7px' }} onClick={(e) => { e.preventDefault(); if (switchDev) { formDataAsset.devId = ''; props.onHandleChangeAsset([formDataAsset]); } setSwitchDev(!switchDev); render(); }} />
              <div style={{ fontSize: '11px' }}>
                {t('sim')}
              </div>
            </Flex>
          </Flex>

          {(props.selectedChillerModel || isEdit) && (
          <>
            <Flex flexWrap="nowrap" flexDirection="row" mt="14px" justifyContent="left">
              <CustomInput style={{
                width: '275px', 'pointer-events': 'none', borderColor: '#F0F0F0',
              }}
              >
                <div style={{ width: '100%' }}>
                  <Input
                    placeholder={formDataAsset.nominalCapacity?.toString() || ''}
                    isInputFilled={false}
                    label={t('capacidadeNominal')}
                    formLabel="nominalCapacity"
                    validation={false}
                    error={errorOrUndefined(errors.nominalCapacity)}
                    register={register}
                    style={{ width: '100%', border: '0px' }}
                    data-test-id="nominalCapacity"
                    readonly
                  />
                </div>
                <PlaceholderWrapper>
                  BTU/h
                </PlaceholderWrapper>
              </CustomInput>

              <CustomInput style={{
                width: '275px', marginLeft: '15px', 'pointer-events': 'none', borderColor: '#F0F0F0',
              }}
              >
                <div style={{ width: '100%', cursor: 'not-allowed' }}>
                  <Input
                    placeholder={formDataAsset.nominalVoltage?.toString() || ''}
                    isInputFilled={false}
                    label={t('tensaoNominal')}
                    formLabel="nominalVoltage"
                    validation={false}
                    error={errorOrUndefined(errors.nominalVoltage)}
                    register={register}
                    style={{ width: '100%', border: '0px' }}
                    data-test-id="nominalVoltage"
                    readonly
                  />
                </div>
                <PlaceholderWrapper>
                  V
                </PlaceholderWrapper>
              </CustomInput>

            </Flex>
            <CustomInput style={{
              width: '275px', marginTop: '14px', 'pointer-events': 'none', borderColor: '#F0F0F0',
            }}
            >
              <Input
                placeholder={formDataAsset.nominalFrequency?.toString() || ''}
                isInputFilled={false}
                label={t('frequenciaNominal')}
                formLabel="nominalFrequency"
                validation={false}
                error={errorOrUndefined(errors.nominalFrequency)}
                register={register}
                style={{ width: '100%', border: '0px' }}
                data-test-id="nominalFrequency"
                readonly
              />
              <PlaceholderWrapper>
                Hz
              </PlaceholderWrapper>
            </CustomInput>
          </>
          )}
        </>
      )}
    </Flex>
  );
};
