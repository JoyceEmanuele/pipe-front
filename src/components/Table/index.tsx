import {
  HTMLAttributes, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTable, useSortBy, useResizeColumns } from 'react-table';
import { colors } from '../../styles/colors';
import ReactTooltip from 'react-tooltip';
import { t } from 'i18next';

import {
  ArrowTable,
  StyledLink,
  StyledCell,
  StyledTableHeader,
  StyledTableRow,
  StyledBody,
  StyledTable,
  StyledHead,
  selectTableHeadContentColor,
  TitleColumn,
  NoDataComponent,
  OrderColumn,
  ButtonFilters,
  PopoverContent,
  PopoverHeader,
  SearchInput,
  Label,
  StyledSubTableHeader,
  StyledSubCell,
  LineSubTable,
  LineSubItemTable,
  TooltipContainer,
} from './styles';
import { OrderIcon } from '~/icons';
import * as Popover from '@radix-ui/react-popover';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { Checkbox, FiltersContainer } from '~/components';
import { FilterIcon } from '~/icons/FilterIconV3';

type TableProps = HTMLAttributes<HTMLTableElement> & {
  columns: any;
  data: any;
  initialSortBy?: string;
  variant?: 'primary'|'secondary';
  dense?: boolean;
  border?: boolean;
  disableSortBy?: boolean;
  noBorderBottom?: boolean;
  reduceWidth?: boolean;
  maxItens?: number;
  borderRow?: string;
  noDataComponent?: () => void;
  isFirstReloadComponent?: () => void;
  isFirstReload?: boolean;
  setFilter?: (mensagem: string) => void;
  handleRemoveAllFilters?: () => void;
  handleSearchWithFilters?: () => void;
  handleRemoveFilter?: (key, index) => void;
  handleRemoveCategoryFilter?: (columnKey: string) => void;
  filtersSelected?: {
    [key: string]: {
      label: string;
      values: {
        value: string|number;
        name: string
      }[]
    };
  }
  haveAssets?: boolean
  haveSubTable?: boolean
  columnsSubTable?: any;
  openAllSubTables?: () => JSX.Element;
  subTableItem?: (itemId, isOpen, haveItem) => JSX.Element;
  toogleAsset?: (machineId) => void;
}

type FilterOptions = { onChangeFilter?: (name, item, option) => Promise<void>, onSelectAllOptions?: (name, filterAll) => Promise<void>, value?: string[], options?: {}[], hasFilter: boolean, filterAll?: boolean, renderOption?: (propsOption: any, option: any, _snapshot: any) => JSX.Element, };

export const Table = ({
  setFilter = () => {},
  noDataComponent,
  isFirstReload,
  isFirstReloadComponent,
  columns, data, initialSortBy = undefined, variant = 'primary', dense = undefined, disableSortBy = false, maxItens = undefined, handleRemoveAllFilters, handleSearchWithFilters, handleRemoveFilter, filtersSelected, handleRemoveCategoryFilter, borderRow, haveAssets, ...props
}: TableProps): JSX.Element => {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 100,
      maxWidth: 300,
    }),
    [],
  );

  const {
    getTableProps, getTableBodyProps, headerGroups, prepareRow, rows,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        sortBy: initialSortBy ? [
          {
            id: initialSortBy,
            desc: false,
          },
        ] : [],
      },
      disableSortBy,
    },
    useSortBy,
    useResizeColumns,
  );
  function sliceFinal() {
    if (maxItens) {
      return maxItens;
    }
    return rows.length;
  }

  const filterSet = (filter) => {
    setFilter(filter);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0 && containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [data]);

  return (
    <StyledTable {...props} {...getTableProps()} ref={containerRef}>
      <StyledHead variant={variant}>
        {headerGroups.map((headerGroup, index) => (
          <StyledTableRow key={index} {...headerGroup.getHeaderGroupProps()}>
            {(props.haveSubTable && props.openAllSubTables) && (
              <StyledTableHeader
                variant={variant}
                key="arrow_sub_table_header"
                dense={dense}
                noBorderBottom={props.noBorderBottom}
                colSpan={1}
                scope="colgroup"
              >
                {props.openAllSubTables()}
              </StyledTableHeader>
            )}
            {headerGroup.headers.map((column) => (
              <StyledTableHeader
                variant={variant}
                key={column.Header}
                {...column.getHeaderProps(column.getSortByToggleProps())}
                dense={dense}
                noBorderBottom={props.noBorderBottom}
                onClick={() => {
                  column.id
                    ? filterSet(column.id) : null;
                }}
                style={props.reduceWidth && { width: column.width }}
              >
                {column.render('Header')}
                <ArrowTable
                  {...column.getResizerProps()}
                  style={{ cursor: 'pointer' }}
                  isopen={column.isSortedDesc ? 1 : 0}
                  color={
                    column.isSorted
                      ? selectTableHeadContentColor(variant)
                      : variant === 'primary'
                        ? colors.White
                        : colors.Blue300
                  }
                  dense={dense}
                />
              </StyledTableHeader>
            ))}
          </StyledTableRow>
        ))}
        {filtersSelected && Object.values(filtersSelected).some((item) => item.values.length > 0) && (
          <tr>
            <th colSpan={haveAssets ? columns.length + 1 : columns.length} style={{ padding: borderRow ? '' : '0 10px 20px 10px' }}>
              <FiltersContainer
                handleRemoveAllFilters={handleRemoveAllFilters}
                handleRemoveFilter={handleRemoveFilter}
                filtersSelected={filtersSelected}
                handleSearchWithFilters={handleSearchWithFilters}
                handleRemoveCategoryFilter={handleRemoveCategoryFilter}
              />
            </th>
          </tr>
        )}
      </StyledHead>
      {
        isFirstReload && isFirstReloadComponent ? (isFirstReloadComponent()) : (
          <>
            {(rows.length === 0 && noDataComponent) ? (
              noDataComponent()
            ) : (
              <StyledBody borderRow={borderRow} {...getTableBodyProps()}>
                {rows.slice(0, sliceFinal()).map((row) => {
                  if (!row.original.hide) {
                    prepareRow(row);

                    return (
                      <>
                        <StyledTableRow key={(row.original && row.original.rowKey) || row} {...row.getRowProps()} backgroundColor={row.original.backgroundColor}>
                          {(props.haveSubTable && props.subTableItem) && (
                            <>
                              {props.subTableItem(row.original.MACHINE_ID, row.original.toogleAsset, row.original.ASSETS.length)}
                            </>
                          )}
                          {row.cells.map((cell, index) => {
                            if (cell.column.Header !== 'Button') {
                              if (cell.row.original.hasInternalLink) {
                                return (
                                  <StyledCell key={index} {...cell.getCellProps()} dense={dense}>
                                    <StyledLink to={cell.row.original.url}>{cell.render('Cell')}</StyledLink>
                                  </StyledCell>
                                );
                              }
                              return (
                                <StyledCell key={index} {...cell.getCellProps()} dense={dense}>
                                  {cell.render('Cell')}
                                </StyledCell>
                              );
                            }
                            return (
                              <td
                                key={index}
                                {...cell.getCellProps()}
                                align="right"
                                style={{ borderBottom: '1px solid rgba(162, 172, 189, 0.2)', paddingRight: '24px' }}
                              >
                                {cell.render('Cell')}
                              </td>
                            );
                          })}
                        </StyledTableRow>
                        {(row.original.ASSETS && row.original.toogleAsset) && Array.isArray(row.original.ASSETS) && row.original.ASSETS.length > 0 && (
                          <AssetsColumnsSubTable headerGroups={headerGroups} row={row} props={props} dense={dense} />
                        )}
                      </>
                    );
                  }
                })}
              </StyledBody>
            )}
          </>
        )
      }
    </StyledTable>
  );
};

export function ReturnLabelContent(value: string|number, extraProps?: { padding?: boolean, marginBottom?: boolean }): JSX.Element {
  return (
    <div style={{ paddingLeft: extraProps?.padding ? '25px' : '0', marginBottom: extraProps?.marginBottom ? '20px' : '0' }}>{value}</div>
  );
}

function AssetsColumnsSubTable({
  headerGroups, row, props, dense,
}) {
  return (
    <>
      <StyledTableRow key="Initial-assets-header" className="assets-header" backgroundColor="#ededed">
        <StyledSubTableHeader key="-sub-table-space" dense={false} />
        {headerGroups[0].headers.map((column) => {
          if (props.columnsSubTable && props.columnsSubTable[column.id]) {
            if (column.id === 'MACHINE_NAME') {
              return (
                <StyledSubTableHeader key={column.Header} style={{ color: '#8f8f8f', width: column.width, position: 'relative' }} dense={column.dense}>
                  <LineSubTable style={{ height: `${row.original.ASSETS.length > 1 ? (row.original.ASSETS.length - 1) * 51.8 + 66 : '64'}px` }} />
                  <div style={{ padding: '0px 24px' }}>
                    {props.columnsSubTable[column.id].name}
                  </div>
                </StyledSubTableHeader>
              );
            }
            return (
              <StyledSubTableHeader key={column.Header} style={{ color: '#8f8f8f', width: column.width }} dense={column.dense}>
                <div style={{ padding: props.columnsSubTable[column.id].padding }}>
                  {props.columnsSubTable[column.id].name}
                </div>
              </StyledSubTableHeader>
            );
          }
          return <StyledSubTableHeader dense={column.dense} key={`${column.Header}-sub-table`} />;
        })}
      </StyledTableRow>
      {row.original.ASSETS.map((asset, index) => (
        <StyledTableRow key={`${asset.ASSET_NAME}-asset-row`} backgroundColor="#ededed" className="assets-row" style={{ borderBottom: '1px solid rgb(0 0 0 / 16%)' }}>
          <StyledCell key={`${asset.ASSET_NAME}-space`} border="" dense={dense} />
          {headerGroups[0].headers.map((column) => {
            if (props.columnsSubTable && props.columnsSubTable[column.id]) {
              return (
                <StyledSubCell key={column.Header} {...column.getHeaderProps()} dense={dense}>
                  { column.id === 'MACHINE_NAME' && (<LineSubItemTable />) }
                  <div style={{ padding: column.id === 'MACHINE_NAME' ? '16px 24px' : '16px 0px' }}>
                    {props.columnsSubTable[column.id]?.Cell(asset[props.columnsSubTable[column.id].value], row.original.MACHINE_ID, asset.DEVICE_CODE, asset.ASSET_ID, asset.AST_ROLE_NAME, asset.STATUS_WIFI)}
                  </div>
                </StyledSubCell>
              );
            }
            return <StyledSubCell key={column.Header} {...column.getHeaderProps()} dense={dense} />;
          })}
        </StyledTableRow>
      ))}
    </>
  );
}

export function AddTooltipIfOverflow(text: string, maxLength: number, marginBottom?: boolean): JSX.Element {
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

export function VerifyColumns(visibleColumns: { visible: boolean }[], columnValue: string, marginBottom?: boolean): JSX.Element {
  const columnsVisible = visibleColumns.filter((x) => x.visible === true).length;

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

export function NoColumnsSelected(): JSX.Element {
  return (
    <NoDataComponent>
      <span style={{ fontSize: 13 }}><strong>{t('nenhumaColunaSelecionada')}</strong></span>
    </NoDataComponent>
  );
}

export function GenerateItemColumn(
  name: string,
  accessor: string,
  handleSort: (column: string) => void,
  sortBy: { column: string, desc: boolean },
  filterOptions?: FilterOptions,
  disabledSortBy?: boolean,
  infoOptions?: {
    tooltipId: string;
    title: string;
    text: string;
  },
): JSX.Element {
  return (
    <TitleColumn key={`accessor_${accessor}`}>
      <PopoverFilters name={name} filterOption={filterOptions} infoOptions={infoOptions} />
      {
        !disabledSortBy && (
          <OrderColumn onClick={() => handleSort(accessor)}>
            <OrderIcon orderDesc={sortBy.column === accessor ? sortBy.desc : false} />
          </OrderColumn>
        )
      }
    </TitleColumn>
  );
}

export function PopoverFilters(props: {
  name, filterOption, infoOptions,
}): JSX.Element {
  const [onOpenPopover, setOnOpenPopover] = useState(false);
  const {
    name, filterOption, infoOptions,
  } = props;

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
                  options={filterOption.options}
                  value={filterOption.value}
                  multiple
                  printOptions="on-focus"
                  search
                  placeholder="Selecionar"
                  filterOptions={fuzzySearch}
                  renderOption={filterOption.renderOption}
                  onChange={(e, option) => filterOption.onChangeFilter && filterOption.onChangeFilter(name, e, option)}
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
                    checked={filterOption.options.length === filterOption.value.length}
                    onClick={() => filterOption.onSelectAllOptions && filterOption.onSelectAllOptions(name, !(filterOption.options.length === filterOption.value.length))}
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
}
