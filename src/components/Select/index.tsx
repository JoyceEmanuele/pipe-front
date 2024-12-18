import {
  useState, useRef, useCallback, MutableRefObject, ReactNode,
} from 'react';
import { Box, Flex } from 'reflexbox';
import Checkbox from '@material-ui/core/Checkbox';
import ReactTooltip from 'react-tooltip';
import { tips } from '../../helpers/tips';
import { useOuterClickNotifier } from '../../hooks/useOuterClickNotifier';
import { ArrowDownIcon, CloseIcon, WarnIcon } from '../../icons';
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
  SelectedLabel,
  ListItem,
  List,
  BlueBar,
  Error,
  Input,
  FuzzySearchLabel,
  FuzzySearchSelectedLabel,
  CheckboxLine,
  Text,
  HaveSelectAllSelectedContainer,
  Label,
  LabelPlaceholder,
  LimitBoxInfo,
  ContainerIcon,
} from './styles';
import { useStateVar } from '../../helpers/useStateVar';
import { t } from 'i18next';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

export const Select = (cProps: {
  placeholder?: string;
  hideSelected?: boolean;
  onSelect?: any;
  options?: any;
  value?: any;
  error?: string | null;
  propLabel?: string;
  notNull?: boolean;
  disabled?: boolean;
  haveFuzzySearch?: boolean;
  tip?: boolean;
  small?: boolean;
  style?: CSSProperties;
  removeScroll?: boolean;
}): JSX.Element => {
  const {
    placeholder,
    hideSelected = false,
    onSelect,
    options,
    value,
    error = undefined,
    propLabel = 'label',
    notNull = false,
    disabled = undefined,
    haveFuzzySearch,
    tip = true,
    small = false,
    ...props
  } = cProps;
  const innerRef = useRef(null);
  const inputRef: MutableRefObject<any> = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const clickOutsideCallback = useCallback((e) => setIsOpen(false), []);
  useOuterClickNotifier(clickOutsideCallback, innerRef);
  const toggle = () => setIsOpen(!isOpen);

  const toggleAndFocusInputs = () => {
    toggle();
    inputRef?.current?.focus();
  };

  const fuzzySearchSelectedLabel = !isOpen && !search && value ? (
    <FuzzySearchSelectedLabel disabled={disabled}>
      {(value && value[propLabel]) || String(value)}
    </FuzzySearchSelectedLabel>
  ) : (
    isOpen && <EmptyLabel />
  );

  const selectedLabel = value ? (
    <SelectedLabel disabled={disabled} small={small}>
      {(value && value[propLabel]) || String(value)}
    </SelectedLabel>
  ) : (
    isOpen && <EmptyLabel />
  );

  function filterOptions() {
    return options
      .filter((option) => (haveFuzzySearch
        ? option[propLabel]?.toLowerCase()?.includes(search.toLowerCase())
        : option));
  }
  return (
    <Container
      ref={innerRef}
      {...props}
      style={{ width: '100%' }}
    >
      <Base
        error={!!error}
        isOpen={isOpen}
        isSelected={value}
        disabled={disabled}
        onClick={disabled ? undefined : toggleAndFocusInputs}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        small={small}
        {...props}
      >
        <Wrapper>
          {haveFuzzySearch ? (
            <>
              <div style={{ width: '100%' }}>
                <Input
                  error={!!error}
                  isSelected={value}
                  isOpen={isOpen}
                  disabled={disabled}
                  ref={inputRef}
                  value={search}
                  onChange={({ target }) => setSearch(target.value)}
                />
                <FuzzySearchLabel
                  error={!!error}
                  isSelected={value}
                  isOpen={isOpen}
                  disabled={disabled}
                >
                  {placeholder}
                </FuzzySearchLabel>
              </div>
              {fuzzySearchSelectedLabel}
            </>
          ) : (
            <>
              <Label
                error={!!error}
                isSelected={value}
                isOpen={isOpen}
                disabled={disabled}
                small={small}
              >
                {placeholder}
              </Label>
              {selectedLabel}
            </>
          )}
        </Wrapper>
        {small ? (
          <ContainerIcon
            isOpen={isOpen}
          >
            <ArrowDownIcon />
          </ContainerIcon>
        ) : (
          <Arrow
            color={disabled ? colors.Grey200 : colors.Blue700}
            isOpen={isOpen}
          />
        )}

      </Base>
      {value && !notNull && !hideSelected && (
        <SelectedContainer style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
        >
          <IconWrapper
            disabled={disabled}
            onClick={disabled ? undefined : () => onSelect('')}
          >
            <CloseIcon color={disabled ? colors.Grey200 : colors.Grey400} />
          </IconWrapper>
          { tip ? (
            <>
              <Selected data-tip={tips[(value && value[propLabel]) || String(value)]}>{(value && value[propLabel]) || String(value)}</Selected>
              <ReactTooltip place="top" type="light" effect="float" />
            </>
          ) : (
            <Selected>{(value && value[propLabel]) || String(value)}</Selected>
          )}
        </SelectedContainer>
      )}
      {error && (
        <Error>{typeof error === 'string' ? error : t('campoIncorreto')}</Error>
      )}
      {isOpen && (
        <List removeScroll={props.removeScroll}>
          {filterOptions()
            .map((option, index) => {
              const isSelected = value === option;
              const isLast = index === options.length - 1;
              return (
                <ListItem
                  style={{ height: 'auto' }}
                  key={index}
                  isSelected={isSelected}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {isSelected && <BlueBar isLast={isLast} />}
                  <span>{(option && option[propLabel]) || option}</span>
                </ListItem>
              );
            })}
        </List>
      )}
    </Container>
  );
};

function changeMultipleSelection<T>(item: T, list: T[], values: T[]): T[] {
  if (!item) return [];
  return values?.includes(item)
    ? values.filter((x) => x !== item)
    : values.concat([item]);
}

export function SelectMultiple<T extends { checked?: boolean }>(cProps: {
  placeholder: string;
  onSelect: (
    option: T | null,
    options: T[],
    suggestedNewValues: null | T[]
  ) => void;
  options: T[];
  values: T[];
  disabled?: boolean;
  error?: string | null;
  emptyLabel?: string;
  propLabel: string;
  closeOnSelect?: boolean;
  haveFuzzySearch?: boolean;
  haveSelectAll?: boolean;
  selectAllOptions?: (options) => void;
  haveCountSelect?: boolean;
  name?: string;
  customElements?: (option) => React.ReactElement,
  labelOnTop?: boolean
  styleBox?: CSSProperties
  limitSelect?: number
  position?: string
} & {children?: ReactNode}) {
  const {
    placeholder,
    onSelect,
    options,
    values,
    disabled = undefined,
    error,
    emptyLabel = undefined,
    propLabel = 'label',
    closeOnSelect = false,
    haveFuzzySearch = false,
    haveSelectAll = false,
    selectAllOptions,
    name,
    haveCountSelect,
    customElements,
    labelOnTop,
    styleBox,
    limitSelect,
    position,
    ...props
  } = cProps;
  const innerRef = useRef(null);
  const inputRef: MutableRefObject<any> = useRef(null);

  const [state, _render, setState] = useStateVar({
    isOpen: false,
    search: '',
    position,
  });
  if (disabled) state.isOpen = false;

  function clickOutsideCallback() {
    setState({ isOpen: false });
  }
  useOuterClickNotifier(clickOutsideCallback, innerRef);
  function toggle() {
    setState({ isOpen: !state.isOpen });
  }

  function toggleAndFocusInputs() {
    toggle();
    inputRef?.current?.focus();
  }

  function formatDisplayedValue(values) {
    if (values.length === 0) return emptyLabel || '';
    if (values.length === 1) return values[0][propLabel];
    if (values.length > 1) return `${values.length} seleções`;
    return '';
  }

  const formatedDisplayedValue = formatDisplayedValue(values);

  const fuzzySearchSelectedLabel = (!state.isOpen && !state.search && formatedDisplayedValue) ? (
    <FuzzySearchSelectedLabel disabled={disabled}>
      {formatedDisplayedValue}
    </FuzzySearchSelectedLabel>
  ) : (
    state.isOpen && <EmptyLabel />
  );

  function selectedLabel() {
    if (formatedDisplayedValue) {
      return (
        <SelectedLabel disabled={disabled}>
          {formatedDisplayedValue}
        </SelectedLabel>
      );
    }
    return (
      state.isOpen && <EmptyLabel />
    );
  }

  function haveFuzzySearchFunc() {
    if (haveFuzzySearch) {
      return (
        <>
          <div style={{ width: '100%' }}>
            { labelOnTop && (
              <LabelPlaceholder>{placeholder}</LabelPlaceholder>
            )}
            <Input
              error={!!error}
              isSelected={isSelected1}
              isOpen={state.isOpen}
              disabled={disabled}
              ref={inputRef}
              value={state.search}
              onChange={({ target }) => setState({ search: target.value })}
            />
            { !labelOnTop && (
            <FuzzySearchLabel
              error={!!error}
              isSelected={isSelected1}
              isOpen={state.isOpen}
              disabled={disabled}
            >
              {placeholder}
            </FuzzySearchLabel>
            )}
          </div>
          {fuzzySearchSelectedLabel}
        </>
      );
    }
    return (
      <>
        <Label
          error={!!error}
          isSelected={isSelected1}
          isOpen={state.isOpen}
          disabled={disabled}
        >
          {placeholder}
        </Label>
        {selectedLabel()}
      </>
    );
  }

  function haveCustomElements(option, index) {
    const isSelected2 = values?.includes(option);
    const isLast = index === filteredOptions.length - 1;
    if (customElements) {
      return (
        <ListItem
          style={{ padding: '0' }}
          key={index}
          isSelected={isSelected2}
          onClick={() => {
            let suggestedNewValues = null as null | T[];
            try {
              suggestedNewValues = changeMultipleSelection(
                option,
                filteredOptions,
                values,
              );
            } catch (err) {
              console.log(err);
            }
            onSelect(option, filteredOptions, suggestedNewValues);
            if (closeOnSelect) setState({ isOpen: false });
          }}
        >
          { customElements(option) }
        </ListItem>
      );
    }
    return (
      <ListItem
        key={index}
        isSelected={isSelected2}
        onClick={() => {
          let suggestedNewValues = null as null | T[];
          try {
            suggestedNewValues = changeMultipleSelection(
              option,
              filteredOptions,
              values,
            );
          } catch (err) {
            console.log(err);
          }
          onSelect(option, filteredOptions, suggestedNewValues);
          if (closeOnSelect) setState({ isOpen: false });
        }}
      >
        {isSelected2 && <BlueBar isLast={isLast} />}
        <span>{option[propLabel]}</span>
      </ListItem>
    );
  }

  function haveSelectAllOptions(position?: 'left' | 'right') {
    if (haveSelectAll && filteredOptions.length > 0 && selectAllOptions) {
      return (
        <Flex justifyContent={position === 'left' ? '' : 'space-between'} alignItems="center">
          <div>
            {values.length > 0 && (
              <HaveSelectAllSelectedContainer>
                <IconWrapper
                  disabled={disabled}
                  onClick={
                    () => {
                      if (disabled) {
                        return undefined;
                      }
                      return onSelect(null, options, []);
                    }
                  }
                >
                  <CloseIcon color={disabled ? colors.Grey200 : colors.Grey400} />
                </IconWrapper>
                <Selected>{formatedDisplayedValue}</Selected>
              </HaveSelectAllSelectedContainer>
            )}
          </div>
          <Box>
            <CheckboxLine>
              <Checkbox
                checked={filteredOptions.every((option) => option.checked)}
                onClick={() => selectAllOptions(filteredOptions)}
                style={{ marginLeft: '-10px' }}
                color="primary"
                name={name}
                id={name}
              />
              <Text htmlFor={name}>
                {t('selecionarTodos')}
              </Text>
            </CheckboxLine>
          </Box>
        </Flex>
      );
    }
    if (values.length > 0 && haveCountSelect) {
      return (
        <SelectedContainer>
          <IconWrapper
            disabled={disabled}
            onClick={disabled ? undefined : () => onSelect(null, options, [])}
          >
            <CloseIcon color={disabled ? colors.Grey200 : colors.Grey400} />
          </IconWrapper>
          <Selected>{formatDisplayedValue(values)}</Selected>
        </SelectedContainer>
      );
    }
    return <></>;
  }

  let filteredOptions = options;
  if (haveFuzzySearch && state.search) {
    const searchLC = (state.search || '')?.trim()?.toLowerCase();
    filteredOptions = options.filter((option) => option[propLabel]?.toLowerCase().includes(searchLC));
  }

  const isSelected1 = (values.length > 0) || (!!emptyLabel);

  return (
    <Container ref={innerRef} {...props}>
      <Base
        error={!!error}
        isOpen={state.isOpen}
        isSelected={isSelected1}
        disabled={disabled}
        onClick={disabled ? undefined : toggleAndFocusInputs}
        style={styleBox}
      >
        <Wrapper>
          {haveFuzzySearchFunc()}
        </Wrapper>
        <Arrow
          color={disabled ? colors.Grey200 : colors.Grey400}
          isOpen={state.isOpen}
        />
      </Base>
      {haveSelectAllOptions(state.position === 'left' ? state.position : 'right')}
      {error && (
        <Error>{typeof error === 'string' ? error : t('campoIncorreto')}</Error>
      )}
      {state.isOpen && (
        <>
          <List style={{ border: 'none' }}>
            {filteredOptions
              .map((option, index) => (
                haveCustomElements(option, index)
              ))}
            <div style={{ position: 'relative' }} />
            {
              limitSelect && (
                <LimitBoxInfo>
                  {
                    limitSelect === values.length && (
                      <>
                        <WarnIcon color="rgba(160, 160, 160, 1)" />
                        {t('limiteMaximoParametrosAtigindos', { limitSelect })}
                      </>
                    )
                  }
                </LimitBoxInfo>
              )
            }
          </List>
        </>
      )}
    </Container>
  );
}
