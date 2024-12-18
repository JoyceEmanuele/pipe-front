import {
  useState, useRef, useCallback, CSSProperties,
  ReactElement,
} from 'react';

import { useOuterClickNotifier } from '../../hooks/useOuterClickNotifier';
import { CloseIcon } from '../../icons';
import { colors } from '../../styles/colors';

import {
  IconWrapper,
  SelectedContainer,
  Selected,
  EmptyLabel,
  Wrapper,
  Arrow,
  Container,
  Base,
  Label,
  SelectedLabel,
  ListItem,
  List,
  BlueBar,
  Error,
} from './styles';
import * as IconNames from 'icons';

export type Option = {
  label: string;
  value: string;
  iconName: keyof typeof IconNames;
}

type SelectProps = {
  label?: string;
  placeholder?: string;
  hideSelected?: boolean;
  onSelect: (value: any | Option) => any;
  options?: any | Option[];
  value?: any;
  error?: string;
  propLabel?: string;
  notNull?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

export const Select = ({
  label, placeholder, hideSelected = false, onSelect, options, value, error, propLabel = 'label', notNull = false, disabled = undefined, ...props
}: SelectProps): JSX.Element => {
  const innerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const clickOutsideCallback = useCallback((e) => setIsOpen(false), []);
  useOuterClickNotifier(clickOutsideCallback, innerRef);
  const toggle = () => setIsOpen(!isOpen);

  function isOption(option: unknown): option is Option {
    return !!option && !!(option as Option).label && !!(option as Option).value;
  }

  function renderIcon(option: Option): ReactElement | null {
    if (!option.iconName) {
      return null;
    }
    const Icon = IconNames[option.iconName];

    return (
      <div style={{
        display: 'inline', marginRight: 8, marginLeft: -6,
      }}
      >
        <Icon />
      </div>
    );
  }

  return (
    <Container ref={innerRef} {...props}>
      <Base error={error} isOpen={isOpen} isSelected={value} disabled={disabled} onClick={disabled ? () => {} : toggle}>
        <Wrapper>
          <Label error={error} isSelected={value} isOpen={isOpen} disabled={disabled}>
            {label}
          </Label>
          {
            !isOpen && !value && (
              <div style={{
                marginLeft: 16, marginTop: 15, color: '#a5a5a5', fontSize: 12,
              }}
              >
                {placeholder}
              </div>
            )
          }
          {value ? <SelectedLabel disabled={disabled}>{(value && (value[propLabel] === 'ET330' ? 'ET330 (Padrão Diel)' : value[propLabel])) || String(value)}</SelectedLabel> : isOpen && <EmptyLabel />}
        </Wrapper>
        <Arrow color={disabled ? colors.Grey200 : colors.Blue700} isOpen={isOpen} />
      </Base>
      {value && (!notNull) && !hideSelected && (
        <SelectedContainer>
          <IconWrapper disabled={disabled} onClick={disabled ? () => {} : () => onSelect('')}>
            <CloseIcon color={disabled ? colors.Grey200 : colors.Grey400} />
          </IconWrapper>
          <Selected>{(value && (value[propLabel] === 'ET330' ? 'ET330 (Padrão Diel)' : value[propLabel])) || String(value)}</Selected>
        </SelectedContainer>
      )}
      {error && <Error>{typeof (error) === 'string' ? error : 'Campo incorreto.'}</Error>}
      {isOpen && (
        <List>
          {options.map((option, index) => {
            const isSelected = isOption(option) ? value === option.value : value === option;
            const isLast = index === options.length - 1;
            return (
              <ListItem
                style={{ height: 'auto', display: 'flex', alignItems: 'center' }}
                key={index}
                isSelected={isSelected}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {isSelected && <BlueBar isLast={isLast} />}
                {isOption(option) && renderIcon(option)}
                <span>{(option && (option[propLabel] === 'ET330' ? 'ET330 (Padrão Diel)' : option[propLabel])) || option}</span>
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};
