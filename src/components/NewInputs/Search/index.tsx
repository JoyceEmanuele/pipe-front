import { SearchIcon } from '../../../icons';

import {
  IconWrapper,
  Base,
  Container,
  Label,
} from './styles';

type InputSearchProps = {
  label: string;
  placeholder: string;
  value: string;
  name: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onEnterKey?: () => void;
  noBorder?: boolean;
  filterStyle?: boolean;
};

export const InputSearch = ({
  label, placeholder, value, name, disabled, onChange, onEnterKey, noBorder, filterStyle, ...props
}: InputSearchProps): JSX.Element => {
  const onKeyPress = (e) => {
    if (e.nativeEvent && e.nativeEvent.keyCode === 13 && onEnterKey) {
      e.preventDefault(); // Ensure it is only this code that runs
      onEnterKey();
    }
  };
  return (
    <Container filterStyle={filterStyle}>
      <Label disabled={disabled} filterStyle={filterStyle} htmlFor={name} value={value} noBorder={noBorder}>
        {label && (<span>{label}</span>)}
        <Base {...props} onKeyDown={onKeyPress} noBorder={noBorder} value={value} name={name} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
        <IconWrapper onClick={onEnterKey} style={{ cursor: onEnterKey ? 'pointer' : 'inherit' }}>
          <SearchIcon />
        </IconWrapper>
      </Label>
    </Container>
  );
};
