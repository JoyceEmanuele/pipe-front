import { useState } from 'react';

import {
  Base,
  Container,
  Label,
  Error,
} from './styles';

type InputProps = {
  value?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export const TextArea = ({
  value, label, error, placeholder, onChange, disabled, ...props
}: InputProps): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  return (
    <Container error={error} {...props}>
      <Label focused={focused} disabled={disabled} error={error} value={value}>
        <span>
          {label}
        </span>
      </Label>
      <Base {...props} value={value} error={error} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
      {/* {error && <Error>{error}</Error>} */}
    </Container>
  ); };
