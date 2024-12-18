/* eslint-disable no-useless-escape */
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

import { colors } from '~/styles/colors';
import { applySuffixToInputValue } from './applySuffixToInputValue';

import {
  Caret, CaretsContainer, InputContainer, Input, Label, Error,
} from './styles';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  error?: string;
  onChange: (newValue: string) => void;
}

export const InputHour = ({
  label, error, value, disabled, placeholder, onChange, ...props
}: Props): JSX.Element => {
  const handleCaretClick = (type: 'up' | 'down') => {
    let newValue = value.split('h')[0];
    const hourSplited = newValue.split(':');

    if (type === 'up') {
      if (hourSplited[1] === '30') newValue = `${Number(hourSplited[0]) + 1}:00h`;
      else newValue = `${hourSplited[0]}:30h`;
    } else if (hourSplited[1] === '30') newValue = `${hourSplited[0]}:00h`;
    else newValue = newValue = `${Number(hourSplited[0]) - 1}:30h`;

    if (newValue === '24:00h') {
      newValue = '00:00h';
    }

    onChange(newValue);
  };

  const handleInputValueChange = (value: string) => {
    let newValue = value;

    if (!value.includes(':')) {
      newValue = `${value.substring(0, 2)}:${value.substring(2)}`;
    }

    onChange(
      applySuffixToInputValue(
        newValue,
        'h',
        /[- #*;,<>\{\}\[\]\\\/]/gi,
      ),
    );
  };

  return (
    <div {...props}>
      <InputContainer {...props}>
        <Label disabled={disabled} error={error}>
          {label && (<span>{label}</span>)}
        </Label>
        <Input value={value} onChange={(e) => handleInputValueChange(e.target.value)} disabled={disabled} placeholder={placeholder} />
        <CaretsContainer>
          <Caret isDisabled={disabled}>
            <FaCaretUp color={colors.Blue700} size={14} onClick={() => !disabled && handleCaretClick('up')} />
          </Caret>
          <Caret isDisabled={disabled}>
            <FaCaretDown color={colors.Blue700} size={14} onClick={() => !disabled && handleCaretClick('down')} />
          </Caret>
        </CaretsContainer>
      </InputContainer>
      {error && <Error>{error}</Error>}
    </div>
  );
};
