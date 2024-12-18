import {
  Base, Container, Label, Error,
} from './styles';

type InputProps = {
  label?: string;
  formLabel: string;
  isInputFilled?: any;
  register: any;
  validation: any;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  handleChange?: (e: any) => void;
  value?: string;
};

export const Input = ({
  isInputFilled,
  label,
  formLabel,
  register,
  validation,
  error,
  placeholder,
  disabled,
  readonly,
  handleChange,
  value,
  ...props
}: InputProps): JSX.Element => (
  <Container error={error}>
    <Label disabled={disabled} error={error} isInputFilled={isInputFilled} readonly={readonly}>
      {label && <span>{label}</span>}
      <Base
        {...props}
        {...register(formLabel, validation)}
        error={error}
        label={formLabel}
        disabled={disabled}
        readonly={readonly}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
      />
    </Label>
    {error && <Error>{error}</Error>}
  </Container>
);
