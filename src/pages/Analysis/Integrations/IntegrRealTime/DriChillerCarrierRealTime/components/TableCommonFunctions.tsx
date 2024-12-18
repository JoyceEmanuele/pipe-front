import { OrderIcon } from '~/icons';
import {
  TitleColumn,
  OrderColumn,
  NoDataComponent,
} from './styles';
import ReactTooltip from 'react-tooltip';
import { t } from 'i18next';

export function GenerateItemColumn(name, accessor, handleSort, sortBy): JSX.Element {
  return (
    <TitleColumn key={`accessor_${accessor}`}>
      <span style={{
        border: '1px solid lightgrey',
        padding: '5px',
        borderRadius: '6px',
        color: '#8f8f8f',
        minWidth: '80px',
        textAlign: 'center',
      }}
      >
        {name}
      </span>
      <div style={{ width: '14px' }} />
      <div>
        <OrderColumn onClick={() => handleSort(accessor)}>
          <OrderIcon orderDesc={sortBy.column === accessor ? sortBy.desc : false} />
        </OrderColumn>
      </div>
    </TitleColumn>
  );
}

export function AddTooltipIfOverflow(text, maxLength, marginBottom?: boolean): JSX.Element {
  const textAux = text ?? '-';

  const truncatedText = `${textAux?.slice(0, maxLength)}...`;
  const style = { marginBottom: marginBottom ? '20px' : '0' };

  return (
    <>
      { textAux?.length <= maxLength ? (
        <div style={style}>
          {textAux}
        </div>
      ) : (
        <div data-tip={textAux} data-for={`tooltip-${textAux}`} style={style}>
          {truncatedText}
          <ReactTooltip
            id={`tooltip-${textAux}`}
            place="top"
            effect="solid"
            delayHide={100}
            textColor="#000000"
            border
            backgroundColor="rgba(256, 256, 256, 1)"
          />
        </div>
      )}
    </>
  );
}

export function NoColumnsSelected(): JSX.Element {
  return (
    <NoDataComponent>
      <span style={{ fontSize: 13 }}><strong>{t('nenhumaColunaSelecionada')}</strong></span>
    </NoDataComponent>
  );
}

export function VerifyColumns(visibleColumns: Record<string, { visible: boolean }>, columnValue: string, marginBottom?: boolean): JSX.Element {
  const columnsVisible = Object.values(visibleColumns).filter((x) => x.visible === true).length;

  return (
    <>
      {
        columnsVisible <= 3 ? (
          ReturnLabelContent(columnValue, { marginBottom })
        ) : (
          AddTooltipIfOverflow(columnValue, 60, marginBottom)
        )
      }
    </>
  );
}

export function ReturnLabelContent(value, extraProps?: { padding?: boolean, marginBottom?: boolean }): JSX.Element {
  return (
    <div style={{ paddingLeft: extraProps?.padding ? '30px' : '0', marginBottom: extraProps?.marginBottom ? '20px' : '0' }}>{value}</div>
  );
}

export function handleSortAlarmCode(columnAValue, columnBValue, sortBy): number {
  if (columnAValue == null) return sortBy.desc ? 1 : -1;
  if (columnBValue == null) return sortBy.desc ? -1 : 1;

  return (columnAValue - columnBValue) * (sortBy.desc ? -1 : 1);
}

export function handleOrderAux(columnA, columnB, sortBy): number {
  const isStringA = typeof columnA === 'string';
  const isStringB = typeof columnB === 'string';

  if (isStringA && isStringB) {
    return columnA.localeCompare(columnB) * (sortBy.desc ? -1 : 1);
  }
  if (!isStringA && !isStringB) {
    return (columnA - columnB) * (sortBy.desc ? -1 : 1);
  }

  return isStringA ? 1 : -1;
}
