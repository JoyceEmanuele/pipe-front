import { useState } from 'react';
import { Cards } from './Cards/Cards';
import { t } from 'i18next';

import Pagination from 'rc-pagination';
import { Flex, Box } from 'reflexbox';

import { InputSearch } from '../index';

import {
  TableContainer, TableHead, HeaderRow, HeaderCell, TableBody, Row, DataCell, DataCellCard, CardsRow, ClickableSpan,
} from './styles';

import '../../assets/css/rc-pagination.css';

const pageLocale = {
  prev_page: t('paginaAnterior'),
  next_page: t('proximaPagina'),
  prev_5: t('5paginasAnteriores'),
  next_5: t('proximas5paginas'),
  prev_3: t('3paginasAnteriores'),
  next_3: t('proximas3paginas'),
};

export interface TableColumn {
  Header: string|JSX.Element
  accessor: string
  HeaderCell?: (column: TableColumn) => JSX.Element
  Cell?: (row: any) => JSX.Element|string
  width?: string
  textAlign?: any
}

type DataTableProps = {
  onSearchText?: (value: string) => void;
  onPageChange: (value: number) => void;
  columns: TableColumn[];
  data: any;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isUnit: boolean;
  verifyMobile?: boolean;
}

export const OrderableHeaderCell = (props: {
  onColumnClick: (column: TableColumn) => void,
  column: TableColumn,
  orderBy: [string, 'ASC' | 'DESC'] | null,
}): JSX.Element => {
  const {
    onColumnClick, column, orderBy,
  } = props;
  return (
    <ClickableSpan onClick={(e) => onColumnClick(column)}>
      {column.Header}
      &nbsp;
      {(orderBy && (orderBy[0] === column.accessor) && (orderBy[1] === 'ASC') && (
        <i className="fa fa-caret-up" aria-hidden="true" />
      ))}
      {(orderBy && (orderBy[0] === column.accessor) && (orderBy[1] === 'DESC') && (
        <i className="fa fa-caret-down" aria-hidden="true" />
      ))}
    </ClickableSpan>
  );
};

export const DataTable = ({
  onSearchText,
  onPageChange,
  columns,
  data,
  currentPage,
  pageSize,
  totalItems,
  isUnit,
  verifyMobile,
}: DataTableProps): JSX.Element => {
  const [searchText, setSearchText] = useState('');

  const onSearch = (e) => {
    setSearchText(e.target.value);
    onSearchText && onSearchText(e.target.value);
  };

  return (
    <>
      {onSearchText && (
        <>
          <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
            <InputSearch
              id="search"
              name="search"
              placeholder="Pesquisar"
              value={searchText}
              onChange={onSearch}
            />
          </Box>
          <br />
        </>
      )}
      <TableContainer verifyMobile={verifyMobile || false}>
        <TableHead>
          <HeaderRow>
            {columns.map((column) => (
              <HeaderCell key={column.accessor}>
                {!column.HeaderCell ? column.Header : column.HeaderCell(column)}
              </HeaderCell>
            ))}
          </HeaderRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <>
              <Row key={`row${index}`}>
                {columns.map((cell, cellIndex) => (
                  <DataCell key={`cell${cellIndex}`} style={{ width: cell.width || 'auto', textAlign: cell.textAlign || 'left' }}>
                    {!cell.Cell ? row[cell.accessor] : cell.Cell(row)}

                  </DataCell>
                ))}
              </Row>
              { isUnit && row.hide && (
                <CardsRow>
                  <DataCellCard>
                    <Cards dacs={row.dacs} duts={row.duts} vavs={row.vavs} nobreaks={row.nobreaks || []} illumination={row.illumination || []} machineWithoutDevices={row.machineWithoutDevices || []} />
                  </DataCellCard>
                </CardsRow>
              )}
            </>
          ))}
        </TableBody>
      </TableContainer>
      <Flex justifyContent="flex-end" width={1} mt={20}>
        <Pagination
          className="ant-pagination"
          defaultCurrent={currentPage}
          total={totalItems}
          locale={pageLocale}
          pageSize={pageSize}
          onChange={(current) => { onPageChange(current); }}
        />
      </Flex>
    </>
  );
};
