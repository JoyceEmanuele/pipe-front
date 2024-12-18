import { useState } from 'react';

import moment from 'moment';

import {
  Base,
  Container,
  Label,
  Error,
} from './styles';

type InputDateProps = {
  label?: string;
  placeholder?: string;
  value: moment.Moment;
  error?: string;
  disabled?: boolean;
  onChange: (value: moment.Moment | null, dateString: string) => void;
}

export const InputDate = ({
  onChange, value, label, error, placeholder, disabled, ...props
}: InputDateProps): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  return (
    <Container error={error} {...props}>
      <Label focused={focused} disabled={disabled} error={error} value={value}>
        <span>{label}</span>
      </Label>
      <Base error={error} disabled={disabled} onChange={(value, dateString) => onChange(value, dateString)} placeholder={placeholder} value={value} onFocus={onFocus} onBlur={onBlur} format="DD/MM/YYYY" {...props} />
      {error && <Error>{error}</Error>}
    </Container>
  );
};
