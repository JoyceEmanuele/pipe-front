import { ChangeEvent } from 'react';

import { useStateVar } from 'helpers/useStateVar';
import { SearchIcon } from 'icons';
import { useTranslation } from 'react-i18next';

import {
  IconWrapper,
  Base,
  Container,
  Label,
  Error,
} from './styles';

export function InputSearch(props: {
  disabled?: boolean
  placeholder: string
  value: string
  name: string
  error?: string
}) {
  const {
    disabled, placeholder, value, name, error, ...extraProps
  } = props;
  return (
    <Container error={error}>
      <Label disabled={disabled} htmlFor={name} value={value} error={error}>
        <span>{placeholder}</span>
        <Base {...extraProps} value={value} name={name} error={error} placeholder={placeholder} disabled={disabled} />
        <IconWrapper>
          <SearchIcon />
        </IconWrapper>
      </Label>
      {error && <Error>{error}</Error>}
    </Container>
  );
}

export function SearchBox(props: { onSearchChange: (text: string) => void }) {
  const { t } = useTranslation();
  const { onSearchChange } = props;
  const [stateBox, renderBox] = useStateVar({
    searchState: '',
    debounceTimer: null as null|NodeJS.Timeout,
  });

  function debounceOnChange() {
    if (stateBox.debounceTimer) clearTimeout(stateBox.debounceTimer);
    stateBox.debounceTimer = setTimeout(() => onSearchChange(stateBox.searchState), 200);
  }

  return (
    <InputSearch
      id="search"
      name="search"
      placeholder={t('pesquisar')}
      value={stateBox.searchState}
      onChange={(e: ChangeEvent<HTMLInputElement>) => { stateBox.searchState = e.target.value; renderBox(); debounceOnChange(); }}
    />
  );
}
