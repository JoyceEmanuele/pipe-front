import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

import { colors } from '~/styles/colors';

import {
  Caret, CaretsContainer, Container, InputContainer, InputLabel, Input,
} from './styles';

type Props = {
  label: string;
  value: number;
  disabled: boolean;
  negativeNumbersAllowed?: boolean;
  onChange: (newValue: number) => void;
}

export const InputNumber = ({
  label, value, disabled, negativeNumbersAllowed, onChange,
}: Props): JSX.Element => {
  const handleInputValueChange = (value: number): void => {
    if (value > 0) {
      onChange(value);
    }
  };

  return (
    <Container>
      <InputLabel>{label}</InputLabel>
      <InputContainer>
        <Input type="number" value={value} onChange={(e) => handleInputValueChange(Number(e.target.value))} disabled={disabled} />
        <CaretsContainer>
          <Caret isDisabled={disabled}>
            <FaCaretUp color={colors.Blue700} size={14} onClick={() => !disabled && onChange(value + 1)} />
          </Caret>
          <Caret isDisabled={disabled || (!negativeNumbersAllowed && value - 1 === 0)}>
            <FaCaretDown
              color={colors.Blue700}
              size={14}
              onClick={() => {
                if (!disabled) {
                  const newValue = value - 1;
                  if (newValue <= 0 && negativeNumbersAllowed) {
                    onChange(newValue);
                  } else if (newValue > 0) {
                    onChange(newValue);
                  }
                }
              }}
            />
          </Caret>
        </CaretsContainer>
      </InputContainer>
    </Container>
  );
};
