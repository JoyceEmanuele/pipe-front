import {
  useContext,
  useState,
} from 'react';
import { Flex } from 'reflexbox';
import { CheckDeviceIcon, PortDisabledIcon, PortEnableIcon } from '~/icons';
import { InputValidationContext } from '~/pages/ClientPanel/FormEditUtility';
import { Loader } from '../Loader';
import {
  Base,
  Container,
  Label,
  IconWrapper,
  TextInfo,
  TextInfoLoading,
} from './styles';
import { t } from 'i18next';

export const InputWithValidation = (cProps: {
  label?: string;
  placeholder?: string;
  value: string;
  name?: string;
  disabled?: boolean;
  onChange?: any
  onEnterKey?: () => void;
  validateFunction: () => Promise<boolean|null>;
  newDevice?: boolean;
  hasMachine?: boolean;
}): JSX.Element => {
  const {
    disabled, label, name, onEnterKey, placeholder, onChange, validateFunction, newDevice, hasMachine, ...props
  } = cProps;
  const { value } = cProps;

  const onKeyPress = (e) => {
    if (e.nativeEvent && e.nativeEvent.keyCode === 13 && onEnterKey) {
      e.preventDefault(); // Ensure it is only this code that runs
      onEnterKey();
    }
  };

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(-1 as null|number|boolean);
  // @ts-ignore
  const { setAllowedMonitoring } = useContext(InputValidationContext);
  const validate = async () => {
    setLoading(true);
    setStatus(-1);
    const allow = await validateFunction();
    setAllowedMonitoring(!!allow);
    setStatus(allow);
    setLoading(false);
  };

  return (
    <Container>
      <Label disabled={disabled || loading} htmlFor={name} value={value}>
        <span>{label}</span>
        <Base {...props} onKeyPress={onKeyPress} value={!disabled || loading ? value : ''} onChange={(event) => { setStatus(-1); setAllowedMonitoring(false); onChange(event); }} name={name} label={label} disabled={disabled || loading} placeholder={placeholder} />
        <span onClick={validate}><IconWrapper>{loading ? <Loader /> : <CheckDeviceIcon />}</IconWrapper></span>
      </Label>
      <Flex style={{ visibility: (status !== -1 && !disabled) || !disabled || loading ? 'visible' : 'hidden' }} alignItems="center">
        { !loading && status === true ? <PortEnableIcon /> : null}
        {/* eslint-disable-next-line eqeqeq */}
        { !loading && (!!status) == false ? <PortDisabledIcon /> : null}
        {/* eslint-disable-next-line eqeqeq */}
        { !loading && ((!!status) == false || status === true)
          ? <TextStatus status={status} newDevice={newDevice} hasMachine={hasMachine} value={value} />
          : null}
        <TextInfoLoading>
          {loading ? t('verificandoDispositivo') : ''}
        </TextInfoLoading>
      </Flex>
    </Container>
  );
};

export const TextStatus = (props: {
  value: string,
  status: number | boolean | null,
  newDevice?: boolean
  hasMachine?: boolean

}): JSX.Element => {
  const {
    status, value, newDevice, hasMachine,
  } = props;
  const textStatus = status === null ? t('dispositivoInexistente') : t('portasNaoDisponiveis');
  const textStatusOkDAM = newDevice ? t('dispositivoNovo') : t('dispositivoDisponivel');
  const textStatusNotOkDAM = hasMachine ? t('dispositivoAssociadoMaquina') : t('dispositivoNaoDisponivel');

  return (
    (
      value.startsWith('DAM')
        ? (
          <TextInfo status={status}>
            {status && value.length === 12 ? textStatusOkDAM : textStatusNotOkDAM }
          </TextInfo>
        )
        : (
          <TextInfo status={status}>
            {status ? t('portasDisponiveis') : textStatus}
          </TextInfo>
        )
    )
  );
};
