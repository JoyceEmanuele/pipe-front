import { useState, useRef, useCallback } from 'react';
import { useOuterClickNotifier } from '../../hooks/useOuterClickNotifier';
import { EletricNetworkIcon, PortIcon } from '../../icons';
import { colors } from '../../styles/colors';
import { t } from 'i18next';

import {
  EmptyLabel,
  Wrapper,
  Arrow,
  Container,
  Base,
  Label,
  SelectedLabel,
  ListItem,
  List,
  Error,
  SideBar,
} from './styles';

type SelectProps = {
  label?: string;
  placeholder?: string;
  onSelect: (value: any) => any;
  options?: any;
  value?: any;
  error?: string;
  propLabel?: string;
  notNull?: boolean;
  disabled?: boolean;
}

export const SelectDMTport = ({
  label, placeholder, onSelect, options, value, error, propLabel = 'label', notNull = false, disabled = undefined, ...props
}: SelectProps): JSX.Element => {
  const innerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const clickOutsideCallback = useCallback((e) => setIsOpen(false), []);
  useOuterClickNotifier(clickOutsideCallback, innerRef);
  const toggle = () => setIsOpen(!isOpen);

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
          {value ? <SelectedLabel disabled={disabled}>{value[propLabel] || String(value)}</SelectedLabel> : isOpen && <EmptyLabel />}
        </Wrapper>
        <Arrow color={disabled ? colors.Grey200 : colors.Blue700} isOpen={isOpen} />
      </Base>
      {error && <Error>{typeof (error) === 'string' ? error : t('campoIncorreto')}</Error>}
      {isOpen && (
        <List>
          {options.map((option, index) => {
            const isSelected = value ? (String(value) === String(option[propLabel]) || value[propLabel] === option[propLabel]) : false;
            const isLast = index === options.length - 1;
            return (
              <ListItem
                key={index}
                isSelected={isSelected}
                associated={option?.associated}
                onClick={() => {
                  if (!option?.associated) {
                    onSelect(option);
                    setIsOpen(false);
                  }
                }}
              >
                {(isSelected || option?.associated) && <SideBar associated={option?.associated} isLast={isLast} />}
                <span>{option[propLabel] || option}</span>
                {
                  option?.associated && (
                  <span style={{ marginLeft: '10px' }}>
                    {option?.eletricCircuitId ? <EletricNetworkIcon style={{ paddingBottom: '25px' }} color={colors.Grey300} /> : <PortIcon style={{ paddingBottom: '25px' }} color={colors.Grey300} />}
                    <span style={{ marginLeft: '10px' }}>{option?.eletricCircuitId ? t('redeEletrica') : t('emUso')}</span>
                  </span>
                  )
                }
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};
