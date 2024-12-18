import SelectSearch, { fuzzySearch } from 'react-select-search';
import {
  CustomInput,
  Label,
  IconWrapper,
  PlaceholderWrapper,
} from './styles';
import { Input } from 'components/NewInputs/Default';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ToggleSwitchMini } from '../ToggleSwitch';
import {
  useState,
  useEffect,
} from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  BoxIcon,
} from '../../icons';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

interface ComponentProps {
    comboOpts: {
      fluids: { value: number, name: string, id: string, }[],
      types: { value: number, name: string, id: string, }[],
      brands: { value: number, name: string, id: string, }[],
      roles: { value: number, name: string }[],
    },
    assetNumber: number,
    onHandleDeleteAsset,
    asset: {
      index: number,
      name: string|null,
      installationLocation: string | null,
      datId: string|null,
      devId: string|null,
      roleId: number|null,
      role: string|null,
      type: string|null,
      brandName: string|null,
      model: string|null,
      refrigerationCapacity: string|null,
      ratedPower: string|null,
      refrigerationFluid: string|null,
      capacityMeasurementUnit: string|null,
      devClientAssetId: number|null,
      datIndex: number|null,
      devIdPersisted: string|null,
      assetId: number|null,
    },
    onHandleChange,
}

type Inputs = {
  name: string|null,
  installationLocation: string | null,
  datId: string|null,
  devId: string|null,
  model: string|null,
  refrigerationCapacity: string|null,
  ratedPower: string|null,
  capacityMeasurementUnit: string|null,
};

export const FormAsset = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const [state, render] = useStateVar({
    isLoading: false as boolean,
  });

  const [switchCapacity, setSwitchCapacity] = useState(props.asset.capacityMeasurementUnit && props.asset.capacityMeasurementUnit.startsWith('BTU/h'));
  const [switchDat, setSwitchDat] = useState((props.asset.datId !== null && props.asset.datId.length > 1) || false);
  const [switchDev, setSwitchDev] = useState((props.asset.devId && props.asset.devId.length !== 0) || false);
  const [isCondenser, setIsCondenser] = useState(props.asset.roleId === 2);
  const [isEvaporator, setIsEvaporator] = useState(props.asset.roleId === 1);
  const [formData] = useState({
    index: props.asset.index,
    name: props.asset.name,
    installationLocation: props.asset.installationLocation,
    brandName: props.asset.brandName,
    roleId: props.asset.roleId || 0 as number,
    role: props.asset.role,
    brandValue: props.asset.brandName ? (props.comboOpts.brands.find((brand) => brand.id === props.asset.brandName))?.value : null as number|null,
    type: props.asset.type,
    typeValue: props.asset.type ? (props.comboOpts.types.find((type) => type.id === props.asset.type))?.value : null as number|null,
    model: props.asset.model,
    datId: props.asset.datId,
    devId: props.asset.devId,
    refrigerationCapacity: props.asset.refrigerationCapacity,
    ratedPower: props.asset.ratedPower,
    refrigerationFluid: props.asset.refrigerationFluid,
    refrigerationFluidValue: props.asset.refrigerationFluid ? (props.comboOpts.fluids.find((fluid) => fluid.id === props.asset.refrigerationFluid))?.value : null as number|null,
    capacityMeasurementUnit: props.asset.capacityMeasurementUnit || 'TR',
    devClientAssetId: props.asset.devClientAssetId || null,
    datIndex: props.asset.datIndex || null as number|null,
    devIdPersisted: props.asset.devIdPersisted || null,
    assetId: props.asset.assetId,
  });

  const {
    register, setValue, watch, formState: { errors },
  } = useForm<Inputs>({
    mode: 'all',
  });

  useEffect(() => {
    updateAssetData();
  }, []);

  function updateAssetData() {
    state.isLoading = true;
    setValue('name', formData.name);
    setValue('installationLocation', formData.installationLocation);
    setValue('datId', formData.datId);
    setValue('devId', formData.devId);
    setValue('model', formData.model);
    setValue('refrigerationCapacity', formData.refrigerationCapacity && formData.refrigerationCapacity.replace('.', ','));
    setValue('ratedPower', formData.ratedPower);
    setValue('capacityMeasurementUnit', formData.capacityMeasurementUnit);
    (formData.datId !== null && formData.datId.length > 1) ? setSwitchDat(true) : setSwitchDat(false);

    state.isLoading = false;
    render();
  }

  function onFilterRoleChange(roleId) {
    if (formData.roleId !== roleId) {
      formData.assetId = null;
    }
    formData.roleId = roleId;
    const roleAux = props.comboOpts.roles.find((unit) => unit.value === roleId);
    formData.role = roleAux?.name || null;
    setIsCondenser(roleId === 2);
    setIsEvaporator(roleId === 1);
    if (roleId !== 2 && roleId !== 1)
    {
      formData.refrigerationCapacity = '0';
      formData.ratedPower = '0';
      setValue('refrigerationCapacity', formData.refrigerationCapacity);
      setValue('ratedPower', formData.ratedPower);
    }
    props.onHandleChange(formData);
  }

  function errorOrUndefined(error) {
    if (error?.message) return error.message;
    return undefined;
  }

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="column"
      height="480px"
      width="480px"
      style={{
        borderLeft: '5px solid #363BC4',
        borderRadius: '5px',
      }}
      mb="10px"
    >
      <Flex flexWrap="wrap" flexDirection="row" width="100%" ml="25px" justifyContent="left" mt="13px">
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="left">
          <IconWrapper>
            <BoxIcon />
          </IconWrapper>
          <strong style={{ fontSize: '14px' }}>
            {t('ativoNum', { numAtivo: props.assetNumber.toString() })}
          </strong>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="right" ml="322px">
          <button
            type="button"
            style={{
              border: 'none', cursor: 'pointer', backgroundColor: 'transparent',
            }}
            onClick={(e) => { e.preventDefault(); props.onHandleDeleteAsset(props.asset.index); }}
          >
            <FaRegTrashAlt color="#ED193F" />
          </button>
        </Flex>
      </Flex>
      <Flex flexWrap="wrap" flexDirection="row" mt="14px" ml="25px" justifyContent="left">
        <Input
          placeholder={t('digiteNomeAtivo')}
          isInputFilled={!!watch('name')}
          label={t('nomeAtivo')}
          formLabel="name"
          validation={false}
          error={errorOrUndefined(errors.name)}
          register={register}
          style={{ width: '411px' }}
          handleChange={(event) => { formData.name = event.target.value; props.onHandleChange(formData); }}
          data-test-id="nameAsset"
        />
      </Flex>
      <Flex flexWrap="wrap" flexDirection="row" mt="14px" ml="25px" justifyContent="left">
        <Input
          placeholder={t('digiteLocalInstalacao')}
          isInputFilled={!!watch('installationLocation')}
          label={t('localInstalacao')}
          formLabel="installationLocation"
          validation={false}
          error={errorOrUndefined(errors.installationLocation)}
          register={register}
          style={{ width: '411px' }}
          handleChange={(event) => { formData.installationLocation = event.target.value; props.onHandleChange(formData); }}
          data-test-id="installationLoc"
        />
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="row" mt="17px" ml="25px" justifyContent="left">
        <div style={{ width: 'fit-content' }}>
          <Input
            placeholder={t('digiteId')}
            isInputFilled={!!watch('datId')}
            label="DAT ID"
            formLabel="datId"
            validation={false}
            error={errorOrUndefined(errors.datId)}
            register={register}
            style={{ width: '194px' }}
            disabled={!switchDat}
            handleChange={(event) => { formData.datId = event.target.value; props.onHandleChange(formData); }}
            data-test-id="datID"
          />
        </div>
        <div style={{ marginLeft: '21px' }}>
          <Input
            placeholder={t('digiteId')}
            isInputFilled={!!watch('devId')}
            label={t('dispositivoDiel')}
            formLabel="devId"
            validation={false}
            error={errorOrUndefined(errors.devId)}
            register={register}
            style={{ width: '194px' }}
            disabled={!switchDev}
            handleChange={(event) => { formData.devId = event.target.value; props.onHandleChange(formData); }}
            data-test-id="devID"
          />
        </div>
      </Flex>
      <Flex flexWrap="nowrap" widht="100%" flexDirection="row" mt="6px" ml="25px" justifyContent="left">
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left">
          <div style={{ fontSize: '11px' }}>
            {t('possuiDatId')}
          </div>
          <div style={{ marginLeft: '36px', fontSize: '11px' }}>
            {t('nao')}
          </div>
          <ToggleSwitchMini checked={switchDat} style={{ marginLeft: '7px', marginRight: '7px' }} onClick={(e) => { e.preventDefault(); setSwitchDat(!switchDat); }} />
          <div style={{ fontSize: '11px' }}>
            {t('sim')}
          </div>
        </Flex>
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="24px">
          <div style={{ fontSize: '11px' }}>
            {t('possuiDispDiel')}
          </div>
          <div style={{ marginLeft: '25px', fontSize: '11px' }}>
            {t('nao')}
          </div>
          <ToggleSwitchMini checked={switchDev} style={{ marginLeft: '7px', marginRight: '7px' }} onClick={(e) => { e.preventDefault(); setSwitchDev(!switchDev); }} />
          <div style={{ fontSize: '11px' }}>
            {t('sim')}
          </div>
        </Flex>
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="row" mt="20px" ml="25px" justifyContent="left">
        <CustomInput style={{ width: '194px' }}>
          <div style={{ width: '100%', paddingTop: 3 }}>
            <Label>{t('funcao')}</Label>
            <SelectSearch
              options={props.comboOpts.roles}
              value={formData.roleId?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder={t('selecionarFuncao')}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={onFilterRoleChange}
              disabled={state.isLoading}
              closeOnSelect={false}
              data-test-id="functionAsset"
            />
          </div>
        </CustomInput>
        {/* <CustomInput style={{ width: '194px', marginLeft: '21px' }}>
          <div style={{ width: '100%', paddingTop: 3 }}>
            <Label>Tipo de Ativo</Label>
            <SelectSearch
              options={props.comboOpts.types}
              value={formData.typeValue?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder="Selecione o tipo"
              // eslint-disable-next-line react/jsx-no-bind
              onChange={onFilterTypeChange}
              disabled={state.isLoading}
              closeOnSelect={false}
            />
          </div>
        </CustomInput> */}
        <div style={{ marginLeft: '21px' }}>
          <Input
            placeholder={t('digiteModelo')}
            isInputFilled={!!watch('model')}
            label={t('modelo')}
            formLabel="model"
            validation={false}
            error={errorOrUndefined(errors.model)}
            register={register}
            style={{ width: '194px' }}
            handleChange={(event) => { formData.model = event.target.value; props.onHandleChange(formData); }}
            data-test-id="modelAsset"
          />
        </div>
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="row" mt="15px" ml="25px" justifyContent="left">
        {/* <CustomInput style={{ width: '194px' }}>
          <div style={{ width: '100%', paddingTop: 3 }}>
            <Label>Fabricante</Label>
            <SelectSearch
              options={props.comboOpts.brands}
              value={formData.brandValue?.toString() || ''}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder="Selecionar fabricante"
              // eslint-disable-next-line react/jsx-no-bind
              onChange={onFilterBrandChange}
              disabled={state.isLoading}
              closeOnSelect={false}
            />
          </div>
        </CustomInput> */}
      </Flex>
      <Flex flexWrap="nowrap" flexDirection="row" mt="14px" ml="25px" justifyContent="left">
        <CustomInput style={{ width: '194px' }}>
          <div style={{ width: '100%' }}>
            <Input
              placeholder={t('digite')}
              isInputFilled={!!watch('refrigerationCapacity')}
              label={t('capacidadeFrigorifica')}
              formLabel="refrigerationCapacity"
              validation={false}
              error={errorOrUndefined(errors.refrigerationCapacity)}
              register={register}
              disabled={!isCondenser && !isEvaporator}
              style={{ width: '100%', border: '0px' }}
              handleChange={(event) => { formData.refrigerationCapacity = (event.target.value).replace(',', '.'); props.onHandleChange(formData); }}
              data-test-id="refriCapacity"
            />
          </div>
          <PlaceholderWrapper>
            {!switchCapacity ? 'TR' : 'BTU/h'}
          </PlaceholderWrapper>
        </CustomInput>
        {/* <CustomInput style={{ width: '195px', marginLeft: '21px' }}>
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
            />
          </div>
        </CustomInput> */}
        <CustomInput style={{ width: '195px', marginLeft: '21px' }}>
          <div style={{ width: '100%' }}>
            <Input
              placeholder={t('digite')}
              isInputFilled={!!watch('ratedPower')}
              label={t('potenciaNominal')}
              formLabel="ratedPower"
              validation={false}
              error={errorOrUndefined(errors.ratedPower)}
              register={register}
              disabled={!isCondenser && !isEvaporator}
              style={{ width: '100%', border: '0px' }}
              handleChange={(event) => { formData.ratedPower = event.target.value.replace(',', '.'); props.onHandleChange(formData); }}
              data-test-id="ratedPower"
            />
          </div>
          <PlaceholderWrapper>
            kW
          </PlaceholderWrapper>
        </CustomInput>
      </Flex>
      <Flex flexWrap="wrap" flexDirection="row" mt="4px" ml="24px" justifyContent="space-between">
        <div style={{ fontSize: '11px' }}>
          {t('unidadeCapFrigTr')}
          <ToggleSwitchMini
            disabled={!isCondenser && !isEvaporator}
            checked={!!switchCapacity}
            style={{ marginLeft: '7px', marginRight: '7px' }}
            onClick={(e) => {
              e.preventDefault();
              if (isCondenser || isEvaporator) {
                setSwitchCapacity(!switchCapacity);
                formData.capacityMeasurementUnit = !switchCapacity ? 'BTU/h' : 'TR';
                props.onHandleChange(formData);
              }
            }}
          />
          BTU/h
        </div>
      </Flex>
    </Flex>
  );
};
