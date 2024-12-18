import {
  ArrowDownAnalisys, InfoIcon, OrderIcon, PausedIcon, PlayIcon, WarnIcon,
} from '~/icons';
import {
  ShowProblemDataWrapper, NoInfoTooltip, UnitLink,
  SelectOptionStyled,
} from './styles';
import ReactTooltip from 'react-tooltip';
import { t } from 'i18next';
import { getUserProfile } from '~/helpers/userProfile';
import {
  ButtonFilters, Label, OrderColumn, PopoverContent, PopoverHeader, SearchInput, TitleColumn,
  TooltipContainer,
} from '~/components/Table/styles';
import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { Checkbox } from '~/components';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { FilterIcon } from '~/icons/FilterIconV3';
import {
  ButtonOptions, ContainerButtonStatusOpen, OptionsButtonsStatus,
} from '../Admin/Integrations/ApiIntegrations/styles';

type ShowProblemDataProps = {
  value: string | number;
  tooltipId: string;
  flags?: {
    dataIsInvalid: boolean;
    dataIsProcessed: boolean;
    invalidPercentage?: boolean;
  }
};

export const controlColumnsConfigs = [
  {
    id: 'clientName',
    visible: true,
    label: t('cliente'),
  },
  {
    id: 'stateName',
    visible: true,
    label: t('estado'),
  },
  {
    id: 'cityName',
    visible: true,
    label: t('cidade'),
  },
  {
    id: 'unitName',
    visible: true,
    label: t('unidade'),
  },
  {
    id: 'procelRanking',
    visible: true,
    label: 'Ranking',
  },
  {
    id: 'procelCategory',
    visible: true,
    label: 'Efic. Energética',
  },
  {
    id: 'consumptionByArea',
    visible: true,
    label: `${t('consumoPorM')} (kWh/m²)`,
  },
  {
    id: 'consumption',
    visible: true,
    label: `${t('consumo')} (kWh)`,
  },
  {
    id: 'consumptionPreviousPercentage',
    visible: true,
    label: 'Var. Consumo',
  },
  {
    id: 'totalCharged',
    visible: true,
    label: `${t('consumo')} (R$)`,
  },
  {
    id: 'refrigerationConsumption',
    visible: true,
    label: t('consumoRefrigecao'),
  },
  {
    id: 'refrigerationConsumptionPercentage',
    visible: true,
    label: t('refrigecacaoConsumo'),
  },
  {
    id: 'refCapacity',
    visible: true,
    label: t('capacidadeRefrigeracao'),
  },
  {
    id: 'refrigerationConsumptionByArea',
    visible: true,
    label: `m²/TR ${t('instalado')}`,
  },
];

export const formatValue = (value, prefix, sufix) => (value == null ? '-' : `${prefix}${formatNumberWithFractionDigits(value)}${sufix}`);

export const ShowProblemData: React.FC<ShowProblemDataProps> = ({ value, tooltipId, flags }) => {
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;

  let Icon = isAdmin ? WarnIcon : InfoIcon;
  let iconColor = isAdmin ? '#F3B107' : '#A9A9A9';
  let message = isAdmin ? 'dadoIncoerente' : 'naoFoiPossivelColetarDado';
  let description = isAdmin ? 'dadoIncoerenteDesc' : 'paraMaisDetalhes';

  let showValue = false;

  if (flags?.dataIsProcessed) {
    if (isAdmin) {
      Icon = InfoIcon;
      iconColor = '#A9A9A9';
      message = 'dadoTratado';
      description = 'paraMaisDetalhes';
    } else {
      showValue = true;
    }
  }

  if (flags?.dataIsInvalid || flags?.invalidPercentage) {
    showValue = false;
    if (isAdmin) {
      Icon = WarnIcon;
      iconColor = '#F3B107';
      message = 'dadoIncoerente';
      description = 'dadoIncoerenteDesc';
    } else {
      Icon = InfoIcon;
      iconColor = '#A9A9A9';
      message = 'naoFoiPossivelColetarDado';
      description = 'paraMaisDetalhes';
    }
  }

  return showValue === true ? <div>{value}</div> : (
    <ShowProblemDataWrapper>
      {isAdmin && value}
      <Icon color={iconColor} width="15" height="15" data-tip={tooltipId} data-for={`tooltip-problem-data-${tooltipId}`} />
      <ReactTooltip
        id={`tooltip-problem-data-${tooltipId}`}
        place="top"
        effect="solid"
      >
        <NoInfoTooltip>
          <Icon color="#FFFFFF" width="15" height="15" />
          <div>
            <span>{t(message)}</span>
            <p>{t(description)}</p>
          </div>
        </NoInfoTooltip>
      </ReactTooltip>
    </ShowProblemDataWrapper>
  );
};

export const OptionsButton = ({
  id, isOpen, handleButtonStatusToggle, status, onActivateClick,
}) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <ButtonOptions style={{ borderRadius: '4px', width: '110px', position: 'relative' }} onClick={() => handleButtonStatusToggle(id)}>
      {
        !status ? <PausedIcon />
          : <PlayIcon />
      }
      <p style={{ margin: '0%' }}>{status ? 'Ativada' : 'Pausada'}</p>
      <ArrowDownAnalisys />
    </ButtonOptions>
    {isOpen && (
      <>
        <ContainerButtonStatusOpen>
          <OptionsButtonsStatus
            style={{ width: '100%', height: '100%' }}
            disabled={false}
            onClick={() => {
              onActivateClick(id);
              handleButtonStatusToggle(id);
            }}
          >
            {
              status ? <PausedIcon />
                : <PlayIcon />
            }
            <p style={{ margin: '0%', marginLeft: '10px' }}>{!status ? t('ativada') : t('pausada')}</p>
          </OptionsButtonsStatus>
        </ContainerButtonStatusOpen>
        <button
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            position: 'fixed',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            padding: 0,
          }}
          onClick={() => handleButtonStatusToggle(id)}
          aria-label={`Toggle status for ID: ${id}`}
          type="button"
        />
      </>
    )}
  </div>
);

export const StringLabel = (value, tooltipId, padding?, fontSize?) => {
  const haveInfo = value !== null && value !== undefined && value !== '';

  if (haveInfo) {
    return (
      <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
        {value}
      </div>
    );
  }

  const displayValue = value === null ? '-' : value;

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      <ShowProblemData value={displayValue} tooltipId={tooltipId} />
    </div>
  );
};

export const LinkedStringLabel = (value, unitId, tooltipId, padding?, fontSize?) => {
  const haveInfo = value !== null && value !== undefined && value !== '';

  if (haveInfo) {
    return (
      <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
        <UnitLink
          style={{ color: 'black' }}
          to={`/analise/unidades/energyEfficiency/${unitId}`}
        >
          {value}
        </UnitLink>
      </div>
    );
  }

  const displayValue = value === null ? '-' : value;

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      <ShowProblemData value={displayValue} tooltipId={tooltipId} />
    </div>
  );
};

export const ValueLabelWithSufix = (value, sufix, tooltipId, padding?, fontSize?) => {
  const haveInfo = value !== null && value !== undefined;
  const isPositiveValue = value > 0;
  const displayValue = formatValue(value, '', sufix);

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      {haveInfo && isPositiveValue ? displayValue : <ShowProblemData value={displayValue} tooltipId={tooltipId} />}
    </div>
  );
};

export const ValueLabelWithSufixNullable = (value, sufix, tooltipId, padding?, fontSize?) => {
  const nullableData = value === null || value === undefined;
  const isPositiveValue = value > 0;
  const displayValue = formatValue(value, '', sufix);

  if (nullableData) { return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>-</div>
  ); }

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      {isPositiveValue ? displayValue : <ShowProblemData value={displayValue} tooltipId={tooltipId} />}
    </div>
  );
};

export const ValueLabelWithPrefixNullable = (value, prefix, tooltipId, padding?, fontSize?) => {
  const nullableData = value === null || value === undefined;
  const isPositiveValue = value > 0;
  const displayValue = formatValue(value, prefix, '');

  if (nullableData) { return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>-</div>
  ); }

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      {isPositiveValue ? displayValue : <ShowProblemData value={displayValue} tooltipId={tooltipId} />}
    </div>
  );
};

export const ValueTotalCharged = (row, value, label, prefix, padding?) => {
  const isPositiveValue = value > 0;
  const displayValue = `R$ ${formatNumberWithFractionDigits(value, { minimum: 2, maximum: 2 })}`;
  const nullableData = value == null;

  return (
    <div style={{ padding: padding ?? '16px 0', fontSize: '12px' }}>
      {((row.dataIsInvalid || row.dataIsProcessed || !isPositiveValue) && !nullableData) ? (
        <ShowProblemData
          value={displayValue}
          tooltipId={`${label}-${displayValue}-${row.unitId}`}
          flags={{
            dataIsInvalid: row.dataIsInvalid,
            dataIsProcessed: row.dataIsProcessed,
          }}
        />
      ) : displayValue}
    </div>
  );
};

export const ValueTrated = (value, label, prefix, sufix, padding?, fontSize?) => {
  const auxValue = value[label];

  const displayValue = formatValue(auxValue, prefix, sufix);
  let invalidPercentage = false;

  if (label === 'refrigerationConsumption') {
    const percentageConsumption = value.refrigerationConsumptionPercentage;
    invalidPercentage = percentageConsumption ? !(Math.floor(percentageConsumption) <= 90 && Math.floor(percentageConsumption) >= 10) : true;
  }

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      {(value.dataIsInvalid || value.dataIsProcessed || invalidPercentage) ? (
        <ShowProblemData
          value={displayValue}
          tooltipId={`${label}-${auxValue}-${value.unitId}`}
          flags={{
            dataIsInvalid: value.dataIsInvalid,
            dataIsProcessed: value.dataIsProcessed,
            invalidPercentage,
          }}
        />
      ) : displayValue}
    </div>
  );
};

export const PercentageTableLabel = (value, label, padding?, fontSize?) => {
  const auxValue = value[label];

  const displayValue = auxValue === null ? '-' : formatValue(Math.floor(auxValue), '', '%');
  const invalidPercentage = auxValue ? !(Math.floor(auxValue) <= 90 && Math.floor(auxValue) >= 10) : true;

  return (
    <div style={{ padding: padding || '16px 0', fontSize: fontSize || '12px' }}>
      {(value.dataIsInvalid || value.dataIsProcessed || invalidPercentage) ? (
        <ShowProblemData
          value={displayValue}
          tooltipId={`${label}-${auxValue}-${value.unitId}`}
          flags={{
            dataIsInvalid: value.dataIsInvalid,
            dataIsProcessed: value.dataIsProcessed,
            invalidPercentage,
          }}
        />
      ) : displayValue}
    </div>
  );
};

export const RankingLabel = (procelRangking) => (procelRangking ? (
  <div
    style={{ display: 'flex', justifyContent: 'center' }}
  >
    {procelRangking}
    °
  </div>
) : (
  <div
    style={{ display: 'flex', justifyContent: 'center' }}
  >
    -
  </div>
));

export const ProcelCategoryLabel = (procelCategory, tickets) => {
  const currentTicket = tickets.find((ticket) => ticket.label.toUpperCase() === procelCategory);

  return procelCategory ? (
    <div
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px',
      }}
    >
      <div style={{
        width: '11px',
        height: '11px',
        background: currentTicket?.color,
        borderRadius: '3px',
      }}
      />
      {procelCategory}
    </div>
  ) : (
    <div
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px',
      }}
    >
      -
    </div>
  );
};

export const VarConsumptionLabel = (row, consumptionPreviousPercentage, label) => {
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;
  const value = Number(consumptionPreviousPercentage ?? 0);
  const formattedData = value < 0 ? `${Math.floor(value)}%` : `+${Math.floor(value)}%`;
  return value ? (
    <div
      style={{
        display: 'flex', justifyContent: 'left', gap: '4px', alignItems: 'center',
      }}
    >
      { (!row.dataIsInvalid || (row.dataIsInvalid && isAdmin)) && (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {Number(consumptionPreviousPercentage) > 0 && (
        <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.63397 0.5C4.01887 -0.166666 4.98113 -0.166667 5.36603 0.5L8.39711 5.75C8.78201 6.41667 8.30089 7.25 7.53109 7.25H1.46891C0.699111 7.25 0.217986 6.41667 0.602886 5.75L3.63397 0.5Z" fill="#E00030" />
        </svg>
        )}
        {Number(consumptionPreviousPercentage) < 0 && (
        <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.36603 7.5C4.98113 8.16667 4.01887 8.16667 3.63397 7.5L0.602887 2.25C0.217987 1.58333 0.699112 0.749999 1.46891 0.749999L7.53109 0.75C8.30089 0.75 8.78202 1.58333 8.39711 2.25L5.36603 7.5Z" fill="#5AB365" />
        </svg>
        )}
      </div>
      )}
      <p style={{
        margin: '0', fontSize: '12px', fontWeight: '400', fontFamily: 'Inter', lineHeight: '14.52px',
      }}
      >
        {((row.dataIsInvalid || row.dataIsProcessed)) ? (
          <ShowProblemData
            value={formattedData}
            tooltipId={`${label}-${formattedData}-${row.unitId}`}
            flags={{
              dataIsInvalid: row.dataIsInvalid,
              dataIsProcessed: row.dataIsProcessed,
            }}
          />
        ) : formattedData}
      </p>
    </div>
  ) : (
    <div
      style={{
        display: 'flex', justifyContent: 'left', gap: '4px', alignItems: 'center',
      }}
    >
      -
    </div>
  );
};

const renderOption = (propsOption, option, _snapshot, className) => (
  <SelectOptionStyled
    {...propsOption}
    className={className}
    type="button"
    selected={_snapshot.selected}
    style={{ display: 'flex' }}
  >
    <div style={{
      width: '12px',
      height: '12px',
      background: option.color,
      borderRadius: '3px',
    }}
    />
    {option.label.toUpperCase()}
  </SelectOptionStyled>
);

export const GenerateEfColumn = (
  name: string,
  accessor: string,
  handleSort: (column: string) => void,
  sortBy: { column: string, desc: boolean },
  filterOptions?: any,
  infoOptions?: {
    tooltipId: string;
    title: string;
    text: string;
  },
) => (
  <TitleColumn key={`accessor_${accessor}`}>
    <PopoverFilters name={name} filterOption={filterOptions} infoOptions={infoOptions} />
    <OrderColumn onClick={() => handleSort(accessor)}>
      <OrderIcon orderDesc={sortBy.column === accessor ? sortBy.desc : false} />
    </OrderColumn>
  </TitleColumn>
);

const PopoverFilters = (props: {
  name, filterOption, infoOptions
}): JSX.Element => {
  const [onOpenPopover, setOnOpenPopover] = useState(false);
  const { name, filterOption, infoOptions } = props;

  const [options] = useState(filterOption.options.map((option) => ({ value: option.label.toUpperCase(), name: option.label.toUpperCase(), ...option })));
  return (
    <Popover.Root open={onOpenPopover} onOpenChange={() => filterOption?.options?.length > 0 && setOnOpenPopover((prevOnOpenPopover) => !prevOnOpenPopover)}>
      <Popover.Trigger asChild>
        <ButtonFilters hasFilter={filterOption?.hasFilter}>
          {filterOption?.hasFilter && <FilterIcon filtered={filterOption?.value?.length > 0} />}
          {name}

          {infoOptions
          && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg data-tip={infoOptions.tooltipId} data-for={`tooltip-info-${infoOptions.tooltipId}`} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.085 9.519V7.085M7.085 4.651H7.09109M13.17 7.085C13.17 10.4457 10.4457 13.17 7.085 13.17C3.72435 13.17 1 10.4457 1 7.085C1 3.72435 3.72435 1 7.085 1C10.4457 1 13.17 3.72435 13.17 7.085Z" stroke="#B6B6B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <ReactTooltip
                id={`tooltip-info-${infoOptions.tooltipId}`}
                place="bottom"
                effect="solid"
              >
                <TooltipContainer>
                  <p>{infoOptions.title}</p>
                  <span>
                    {infoOptions.text}
                  </span>
                </TooltipContainer>
              </ReactTooltip>
            </div>
          )}
        </ButtonFilters>
      </Popover.Trigger>
      {(filterOption?.hasFilter && filterOption?.options?.length > 0) && (
        <Popover.Portal>
          <Popover.Content
            align="start"
            className="PopoverContent"
            sideOffset={5}
          >
            <PopoverContent>
              <PopoverHeader>
                <svg
                  width="16"
                  height="15"
                  viewBox="0 0 16 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.79652 2.84785C1.27246 2.26214 1.01043 1.96928 1.00055 1.72039C0.991961 1.50417 1.08487 1.29636 1.25173 1.15859C1.44381 1 1.83678 1 2.62272 1H12.9073C13.6932 1 14.0862 1 14.2783 1.15859C14.4451 1.29636 14.538 1.50417 14.5295 1.72039C14.5196 1.96928 14.2575 2.26214 13.7335 2.84786L9.77966 7.26682C9.6752 7.38358 9.62296 7.44195 9.58572 7.50839C9.55269 7.56732 9.52845 7.63076 9.51378 7.6967C9.49723 7.77104 9.49723 7.84938 9.49723 8.00605V11.711C9.49723 11.8465 9.49723 11.9142 9.47538 11.9728C9.45607 12.0246 9.42466 12.071 9.38377 12.1081C9.3375 12.1502 9.2746 12.1753 9.14878 12.2257L6.79295 13.168C6.53828 13.2699 6.41095 13.3208 6.30873 13.2996C6.21934 13.281 6.1409 13.2279 6.09045 13.1518C6.03277 13.0648 6.03277 12.9276 6.03277 12.6533V8.00605C6.03277 7.84938 6.03277 7.77104 6.01622 7.6967C6.00155 7.63076 5.97731 7.56732 5.94428 7.50839C5.90704 7.44195 5.8548 7.38358 5.75034 7.26682L1.79652 2.84785Z"
                    stroke="#363BC4"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2>{t('filtroRapido')}</h2>
              </PopoverHeader>
              <SearchInput>
                <Label>{name}</Label>
                <SelectSearch
                  options={options}
                  value={filterOption.value}
                  multiple
                  printOptions="on-focus"
                  search
                  placeholder="Selecionar"
                  filterOptions={fuzzySearch}
                  renderOption={renderOption}
                  onChange={(_, selectedOption) => {
                    filterOption.onChangeFilter(name, selectedOption);
                  }}
                />
              </SearchInput>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Checkbox
                    size={15}
                    checked={options.length === filterOption.value.length}
                    onClick={() => filterOption.onSelectAllOptions && filterOption.onSelectAllOptions(name, !(options.length === filterOption.value.length))}
                  />
                  <p
                    style={{
                      textAlign: 'center',
                      marginBottom: '4px',
                      fontSize: '10px',
                      paddingLeft: '4px',
                    }}
                  >
                    {t('selecionarTudo')}
                  </p>
                </div>
                <p
                  onClick={() => filterOption.onSelectAllOptions && filterOption.onSelectAllOptions(name, false)}
                  style={{
                    fontSize: '10px',
                    textUnderlineOffset: '4px',
                    color: 'blue',
                    paddingRight: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {t('limpar')}
                </p>
              </div>
            </PopoverContent>
          </Popover.Content>
        </Popover.Portal>
      )}
    </Popover.Root>
  );
};
