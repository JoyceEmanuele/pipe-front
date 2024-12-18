import { useState, useRef, useCallback } from 'react';

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

type SelectMultipleProps = {
  label: string;
  placeholder: string;
  onSelect: any;
  options?: any;
  values?: any;
  disabled?: boolean;
  error?: string;
  emptyLabel?: string;
  propLabel?: string;
  closeOnSelect?: any;
}

function changeMultipleSelection(item, values) {
  if (!item) return [];
  return values.includes(item) ? values.filter((x) => x !== item) : values.concat([item]);
}

export const SelectMultiple = ({
  label, placeholder, onSelect, options, values, disabled = undefined, error, emptyLabel = undefined, propLabel = 'name', closeOnSelect = false, ...props
}: SelectMultipleProps): JSX.Element => {
  const innerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  if (disabled) setIsOpen(false);
  const clickOutsideCallback = useCallback((e) => setIsOpen(false), []);
  useOuterClickNotifier(clickOutsideCallback, innerRef);
  const toggle = () => setIsOpen(!isOpen);

  function formatDisplayedValue(values) {
    if (values.length === 0) return emptyLabel || '';
    if (values.length === 1) return values[0][propLabel];
    if (values.length > 1) return `${values.length} seleções`;
    return '';
  }

  return (
    <Container ref={innerRef} {...props}>
      <Base error={error} isOpen={isOpen} isSelected={values.length > 0} disabled={disabled} onClick={disabled ? () => {} : toggle}>
        <Wrapper>
          <Label error={error} isSelected={values.length > 0} isOpen={isOpen} disabled={disabled}>
            {label}
          </Label>
          {
            !isOpen && values.length === 0 && (
              <div style={{
                marginLeft: 16, marginTop: 15, color: '#a5a5a5', fontSize: 12,
              }}
              >
                {placeholder}
              </div>
            )
          }
          {(values.length > 0) ? <SelectedLabel disabled={disabled}>{formatDisplayedValue(values)}</SelectedLabel> : isOpen && <EmptyLabel />}
        </Wrapper>
        <Arrow color={disabled ? colors.Grey200 : colors.Grey400} isOpen={isOpen} />
      </Base>
      {(values.length > 0) && (
        <SelectedContainer>
          <IconWrapper disabled={disabled} onClick={disabled ? () => {} : () => onSelect('', options, [])}>
            <CloseIcon color={disabled ? colors.Grey200 : colors.Grey400} />
          </IconWrapper>
          <Selected>{formatDisplayedValue(values)}</Selected>
        </SelectedContainer>
      )}
      {error && <Error>{typeof (error) === 'string' ? error : 'Campo incorreto.'}</Error>}
      {isOpen && (
        <List>
          {options.map((option, index) => {
            const isSelected = values.includes(option);
            const isLast = index === options.length - 1;
            return (
              <ListItem
                key={index}
                isSelected={isSelected}
                onClick={() => {
                  let suggestedNewValues = null;
                  try {
                    suggestedNewValues = changeMultipleSelection(option, values);
                  } catch (err) { console.log(err); }
                  onSelect(option, options, suggestedNewValues);
                  if (closeOnSelect) setIsOpen(false);
                }}
              >
                {isSelected && <BlueBar isLast={isLast} />}
                <span>{option[propLabel]}</span>
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};
