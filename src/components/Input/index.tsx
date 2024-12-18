import MaskedInput from 'react-text-mask';

import {
  Base,
  Container,
  Label,
  Error,
} from './styles';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  value: string;
  name?: string;
  disabled?: boolean;
  error?: string|null;
  mask?: any;
  suffix?: string
  noSuffixBorder?: boolean;
  width?: string
  onEnterKey?: () => void;
  handleKeyPress?: (event) => void;
  onWheel?: (event: React.WheelEvent<HTMLInputElement>) => void;
}

export const Input = ({
  label,
  placeholder,
  value,
  name,
  disabled,
  error,
  mask,
  suffix,
  noSuffixBorder,
  width,
  onEnterKey,
  handleKeyPress,
  onWheel,
  ...props
}: CustomInputProps): JSX.Element => {
  const onKeyPress = (e) => {
    if (handleKeyPress) handleKeyPress(e);

    if (e.nativeEvent && e.nativeEvent.keyCode === 13 && onEnterKey) {
      e.preventDefault(); // Ensure it is only this code that runs
      onEnterKey();
    }
  };

  return (
    <>
      {mask ? (
        <InputMasked
          {...props}
          value={value}
          name={name}
          error={error}
          label={label}
          disabled={disabled}
          mask={mask}
          placeholder={placeholder}
          onKeyPress={onKeyPress}
          suffix={suffix}
        />
      ) : (
        <InputDefault
          {...props}
          value={value}
          name={name}
          error={error}
          label={label}
          disabled={disabled}
          placeholder={placeholder}
          onKeyPress={onKeyPress}
          suffix={suffix}
          noSuffixBorder={noSuffixBorder}
          width={width}
        />
      )}
    </>
  );
};

function InputDefault(cProps: {
  value: string
  disabled?: boolean
  label?: string
  name?: string
  error?: string|null
  placeholder?: string
  suffix?: string
  noSuffixBorder?: boolean
  width?: string
}) {
  const {
    disabled, label, value, name, error, placeholder, suffix, noSuffixBorder, width, ...props
  } = cProps;
  return (
    <Container style={{ width }} error={error}>
      <Label disabled={disabled} htmlFor={name} value={value} error={error} suffixLength={suffix?.length} noSuffixBorder={noSuffixBorder}>
        <span>{label}</span>
        <Base {...props} value={value} name={name} error={error} label={label} disabled={disabled} placeholder={placeholder} suffixLength={suffix?.length} />
        {suffix && (
          <span>{suffix}</span>
        )}
      </Label>
      {error && <Error>{error}</Error>}
    </Container>
  );
}
function InputMasked(cProps: {
  value: string
  disabled?: boolean
  label?: string
  name?: string
  error?: string|null
  mask?: any
  placeholder?: string
  suffix?: string
  newSuffixModel?: string
}) {
  const {
    disabled, label, value, name, error, mask, placeholder, suffix, ...props
  } = cProps;
  return (
    <Container error={error}>
      <Label disabled={disabled} htmlFor={name} value={value} error={error}>
        <span>{label}</span>
        <MaskedInput
          {...props}
          value={value}
          name={name}
          error={error}
          placeholder={placeholder}
          disabled={disabled}
          mask={mask}
          render={(ref, props2) => <Base ref={ref} innerRef={ref} {...props2} />}
        />
      </Label>
      {error && <Error>{error}</Error>}
    </Container>
  );
}
