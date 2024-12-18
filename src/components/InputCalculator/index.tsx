import {
  Base,
  Container,
  Label,
  Error,
  SetpointButton,
  IconWrapper,
  CustomInput,
  PlaceholderWrapper,
} from './styles';

import {
  ArrowUpIconV2,
  ArrowDownIconV2,
} from '../../icons';

import { toast } from 'react-toastify';
import { useStateVar } from 'helpers/useStateVar';
import { CSSProperties } from 'react';

export const InputCalculator = (cProps: {
  label?: string;
  placeholder?: string;
  value: string;
  name?: string;
  disabled?: boolean;
  error?: string|null;
  unity?: string;
  suffix?: string;
  possibleValues?: number[]|null;
  lowerLimit?: number;
  isSetpoint?: boolean;
  style?: CSSProperties;
  onIncreaseDecrease,
  onEnterKey?: () => void;
}): JSX.Element => {
  const {
    disabled, label, value, name, error, unity, possibleValues, onEnterKey, placeholder, suffix, lowerLimit, isSetpoint, ...props
  } = cProps;

  const onKeyPress = (e) => {
    if (e.nativeEvent && e.nativeEvent.keyCode === 13 && onEnterKey) {
      e.preventDefault(); // Ensure it is only this code that runs
      onEnterKey();
    }
    if (cProps.lowerLimit != null && cProps.lowerLimit >= 0 && (e.code === 'Minus' || e.code === 'NumpadSubtract')) {
      e.preventDefault();
    }
  };

  function increaseDecrease(value: string) {
    props.onIncreaseDecrease(value);
  }

  return (
    <>
      {possibleValues ? (
        <SelectValue
          {...props}
          value={value}
          name={name}
          possibleValues={possibleValues}
          error={error}
          label={label}
          disabled={disabled}
          placeholder={placeholder}
          onKeyPress={onKeyPress}
          suffix={suffix}
          unity={unity}
          onIncreaseDecrease={increaseDecrease}
          isSetpoint={isSetpoint}
        />
      ) : (
        <InputValue
          {...props}
          value={value}
          name={name}
          error={error}
          label={label}
          disabled={disabled}
          placeholder={placeholder}
          lowerLimit={lowerLimit}
          unity={unity}
          onKeyPress={onKeyPress}
          suffix={suffix}
          onIncreaseDecrease={increaseDecrease}
        />
      )}
    </>
  );
};

function increaseDecreaseValue(value: string, increase: boolean, lowerLimit?: number) {
  let valueReturn = Number(value);
  if (increase) {
    valueReturn++;
  }
  else {
    valueReturn--;
    if (lowerLimit != null && valueReturn < lowerLimit) {
      valueReturn++;
      toast.warn(`Não é permitido ultrapassar limite inferior de ${lowerLimit}`);
    }
  }

  return `${valueReturn.toString()}`;
}

function increaseDecreaseValueList(value: string, possibleValues: number[], increase: boolean, unity?: string, isSetpoint?: boolean) {
  const valueReturn = Number(value);
  let index = possibleValues.indexOf(valueReturn);

  if (increase) {
    index += (index === possibleValues.length - 1 ? 0 : 1);
  }
  else {
    index -= (index === 0 ? 0 : 1);
  }

  if (possibleValues[index] === valueReturn) {
    toast.info(`Não é possível ${increase ? 'incrementar' : 'decrementar'} além do ${isSetpoint ? 'setpoint' : 'valor'} ${possibleValues[index]}${unity || ''}!${isSetpoint ? ' Necessário cadastro de comando IR para setpoint desejado.' : ''}`);
  }

  return `${possibleValues[index].toString()}`;
}

const InputValue = (cProps: {
  value: string
  disabled?: boolean
  label?: string
  name?: string
  error?: string|null
  placeholder?: string
  unity?: string
  suffix?: string
  lowerLimit?: number
  onIncreaseDecrease
}): JSX.Element => {
  const [state, render, setState] = useStateVar({
    value: `${cProps.value != null ? cProps.value : '-'}`,
  });
  const {
    disabled, label, name, error, placeholder, suffix, unity, value, lowerLimit, ...props
  } = cProps;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      state.value = value;
      render();
    }
  };

  return (
    <CustomInput type="text" {...props}>
      <div style={{ width: '100%' }}>
        <Container error={error}>
          <Label disabled={disabled} htmlFor={name} value={state.value} error={error} suffixLength={suffix?.length}>
            <span>{label}</span>
            <Base
              style={{ border: '0px' }}
              value={state.value}
              name={name}
              error={error}
              label={label}
              disabled={disabled}
              placeholder={placeholder}
              suffixLength={suffix?.length}
              onChange={handleInputChange}
            />
            {suffix && (
              <span>{suffix}</span>
            )}
          </Label>
          {error && <Error>{error}</Error>}
        </Container>
      </div>
      {cProps.unity && (
        <PlaceholderWrapper>
          {cProps.unity}
        </PlaceholderWrapper>
      )}
      <div style={{
        width: '57px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #C5C5C5',
      }}
      >
        <SetpointButton up onClick={() => { setState({ value: increaseDecreaseValue(state.value, true, cProps.lowerLimit) }); props.onIncreaseDecrease(state.value); render(); }}>
          <IconWrapper>
            <ArrowUpIconV2 />
          </IconWrapper>
        </SetpointButton>
        <SetpointButton down onClick={() => { setState({ value: increaseDecreaseValue(state.value, false, cProps.lowerLimit) }); props.onIncreaseDecrease(state.value); render(); }}>
          <IconWrapper>
            <ArrowDownIconV2 />
          </IconWrapper>
        </SetpointButton>
      </div>
    </CustomInput>
  );
};

const SelectValue = (cProps: {
  value: string
  possibleValues: number[]
  disabled?: boolean
  label?: string
  name?: string
  error?: string|null
  unity?: string;
  placeholder?: string
  suffix?: string
  isSetpoint?: boolean
  onIncreaseDecrease
}): JSX.Element => {
  const [state, render, setState] = useStateVar({
    value: `${cProps.value != null ? cProps.value : '-'}`,
  });
  const {
    disabled, label, name, error, placeholder, suffix, possibleValues, isSetpoint, ...props
  } = cProps;
  return (
    <CustomInput {...props}>
      <div style={{ width: '100%' }}>
        <Container error={error}>
          <Label disabled={disabled} htmlFor={name} value={state.value} error={error} suffixLength={suffix?.length}>
            <span>{label}</span>
            <Base style={{ border: '0px' }} value={state.value} name={name} error={error} label={label} disabled placeholder={placeholder} suffixLength={suffix?.length} />
            {suffix && (
              <span>{suffix}</span>
            )}
          </Label>
          {error && <Error>{error}</Error>}
        </Container>
      </div>
      {cProps.unity && (
        <PlaceholderWrapper>
          {cProps.unity}
        </PlaceholderWrapper>
      )}
      <div style={{
        width: '57px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #C5C5C5',
      }}
      >
        <SetpointButton disabled={disabled} up onClick={() => { if (cProps.value != null) { setState({ value: increaseDecreaseValueList(state.value, possibleValues, true, cProps.unity, cProps.isSetpoint) }); props.onIncreaseDecrease(state.value); render(); } }}>
          <IconWrapper>
            <ArrowUpIconV2 />
          </IconWrapper>
        </SetpointButton>
        <SetpointButton disabled={disabled} down onClick={() => { if (cProps.value != null) { setState({ value: increaseDecreaseValueList(state.value, possibleValues, false, cProps.unity, cProps.isSetpoint) }); props.onIncreaseDecrease(state.value); render(); } }}>
          <IconWrapper>
            <ArrowDownIconV2 />
          </IconWrapper>
        </SetpointButton>
      </div>
    </CustomInput>
  );
};
