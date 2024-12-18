import { Flex } from 'reflexbox';
import {
  useMemo, useState,
} from 'react';
import { GenerateItemColumn, Table } from '../../Table';
import Pagination from 'rc-pagination';
import { DefaultTableLabel, DefaultTableLabelUnit, DefaultTableLabelUnitLink } from '../TableConfig';
import {
  NoAnalisysSelected,
  TableContainer,
} from '../style';
import { sortDataColumn } from '~/pages/General';
import { t } from 'i18next';
import { EmptyDocumentIcon } from '~/icons/EmptyDocumentIcon';

export function CardWaterTable({
  handleGetDevInfo, infoTableData, filterDataTable, state, setState, render, getUnitConsumptionWater,
}) {
  const columnsTable = [
    {
      Header: () => (
        GenerateItemColumn(t('cliente'), 'client_name', handleSortData, state.columnSort.client_name, {
          hasFilter: true,
          options: state.filterColumns.clients?.list,
          onChangeFilter: handleChangeFilter,
          onSelectAllOptions: handleSelectAll,
          filterAll: state.filterColumns.clients.list.length === state.selectedFilters.clients.values.length,
          value: state.selectedFilters.clients?.values.map((item) => item.value?.toString()),
        })
      ),
      accessor: 'client_name',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabel(props.row.original.client_name),
    },
    {
      Header: () => (
        GenerateItemColumn(t('estado'), 'state_name', handleSortData, state.columnSort.state_name, {
          hasFilter: true,
          options: state.filterColumns.states?.list,
          onChangeFilter: handleChangeFilter,
          onSelectAllOptions: handleSelectAll,
          filterAll: state.filterColumns.states.list.length === state.selectedFilters.states.values.length,
          value: state.selectedFilters.states?.values.map((item) => item.value?.toString()),
        })
      ),
      accessor: 'state_name',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabel(props.row.original.state_name),
    },
    {
      Header: () => (
        GenerateItemColumn(t('cidade'), 'city_name', handleSortData, state.columnSort.city_name, {
          hasFilter: true,
          options: state.filterColumns.cities?.list,
          onChangeFilter: handleChangeFilter,
          onSelectAllOptions: handleSelectAll,
          filterAll: state.filterColumns.cities.list.length === state.selectedFilters.cities.values.length,
          value: state.selectedFilters.cities?.values.map((item) => item.value?.toString()),
        })
      ),
      accessor: 'city_name',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabel(props.row.original.city_name),
    },
    {
      Header: () => (
        GenerateItemColumn(t('unidade'), 'unit_name', handleSortData, state.columnSort.unit_name, {
          hasFilter: true,
          options: state.filterColumns.units?.list,
          onChangeFilter: handleChangeFilter,
          onSelectAllOptions: handleSelectAll,
          filterAll: state.filterColumns.cities.list.length === state.selectedFilters.cities.values.length,
          value: state.selectedFilters.units?.values.map((item) => item.value?.toString()),
        })
      ),
      accessor: 'unit_name',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabelUnitLink(props.row.original.unit_name, props.row.original.unit_id, props.row.original.device_code),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('consumo')} (${state.unitMeasure === 'liters' ? 'L' : 'm³'})`, 'period_usage', handleSortData, state.columnSort.period_usage)
      ),
      accessor: 'period_usage',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabelUnit(getUnitConsumptionWater(props.row.original.period_usage, true), `${state.unitMeasure === 'liters' ? ' L' : ' m³'}`, props.row.original.unit_id),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('consumoPessoa')}`, 'usage_people', handleSortData, state.columnSort.usage_people)
      ),
      accessor: 'usage_people',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabelUnit(getUnitConsumptionWater(props.row.original.usage_people, true), `${state.unitMeasure === 'liters' ? ' L' : ' m³'}/pessoa`, props.row.original.unit_id),
    },
    {
      Header: () => (
        GenerateItemColumn(`${t('consumo')} (${state.unitMeasure === 'liters' ? 'L' : 'm³'}/m²)`, 'usage_area', handleSortData, state.columnSort.usage_area)
      ),
      accessor: 'usage_area',
      disableSortBy: true,
      Cell: (props) => DefaultTableLabelUnit(getUnitConsumptionWater(props.row.original.usage_area, true), `${state.unitMeasure === 'liters' ? ' L' : ' m³'}/m²`, props.row.original.unit_id),
    },
  ];
  const [columnsData] = useState(columnsTable);

  function getPages() {
    let data = filterDataTable;
    if (state.currentSort.field !== '') {
      data = sortByParameter(infoTableData, state.currentSort.field, state.currentSort.type);
    }
    data = data.map((item, index) => ({ ...item, key: `${index} ${item.state_name} ${item.unit_name}` })).slice((state.waterPag.tablePage - 1) * state.waterPag.tablePageSize, state.waterPag.tablePage * state.waterPag.tablePageSize);
    return data;
  }

  const handleSortData = (column) => {
    sortDataColumn(state, column);
    render();
  };

  async function handleSelectAll(name, filterAll) {
    const filterColumnsAux = JSON.parse(JSON.stringify(state.filterColumns));
    switch (name) {
      case t('cidade'):
        state.selectedFilters.cities.values = filterAll ? filterColumnsAux.cities.list : [];
        break;
      case t('estado'):
        state.selectedFilters.states.values = filterAll ? filterColumnsAux.states.list : [];
        break;
      case t('unidade'):
        state.selectedFilters.units.values = filterAll ? filterColumnsAux.units.list : [];
        break;
      case t('cliente'):
        state.selectedFilters.clients.values = filterAll ? filterColumnsAux.clients.list : [];
        break;
      default:
        break;
    }
    await handleGetDevInfo({ firstSearch: true, useFilters: true });
    render();
  }
  function acessorFilterChange(acessor, option, filters) {
    const arrayValues = state.selectedFilters[acessor].values.map((item) => item.value);
    const filteredArray = option.filter((value) => !arrayValues.includes(value.value));
    if (filteredArray.length === 0) {
      state.selectedFilters[acessor].values = state.selectedFilters[acessor].values.filter((item) => filters.includes(item.value));
    } else {
      state.selectedFilters[acessor].values = [...state.selectedFilters[acessor].values, ...filteredArray];
    }
    render();
  }

  async function handleChangeFilter(name, filters, option) {
    setState({ waterPag: { ...state.waterPag, tablePage: 1 } });
    if (name) {
      if (name === t('cidade')) {
        acessorFilterChange('cities', option, filters);
      }
      if (name === t('estado')) {
        acessorFilterChange('states', option, filters);
      }
      if (name === t('unidade')) {
        acessorFilterChange('units', option, filters);
      }
      if (name === t('cliente')) {
        acessorFilterChange('clients', option, filters);
      }
    }
  }

  const onPageChange = (curr) => {
    setState({ waterPag: { ...state.waterPag, tablePage: curr } });
  };

  function sortByParameter(data, parameter, type) {
    if (!['state_name', 'city_name', 'unit_name', 'period_usage', 'usage_people', 'usage_area', 'client_name'].includes(parameter)) {
      console.error('Parâmetro inválido!');
      return data;
    }
    const compare = (a, b) => {
      let comparison = 0;
      if (a[parameter] > b[parameter]) comparison = 1;
      else if (a[parameter] < b[parameter]) comparison = -1;
      return type === 'Desc' ? comparison * -1 : comparison;
    };
    const sort = data.sort(compare);
    return sort;
  }

  async function handleRemoveAllFilters() {
    state.selectedFilters.states.values = [];
    state.selectedFilters.cities.values = [];
    state.selectedFilters.units.values = [];
    state.selectedFilters.clients.values = [];
    render();
    await handleGetDevInfo({ firstSearch: false, useFilters: true });
  }

  const handleRemoveCategoryFilter = async (columnKey: string) => {
    state.selectedFilters[columnKey].values = [];
    await handleGetDevInfo({ firstSearch: false, useFilters: true });
    render();
  };

  async function handleRemoveFilter(columnKey: string, filterIndex: number) {
    state.selectedFilters[columnKey].values.splice(filterIndex, 1);
    await handleGetDevInfo({ firstSearch: true, useFilters: true });

    render();
  }

  const pageLocale = {
    prev_page: t('paginaAnterior'),
    next_page: t('proximaPagina'),
    prev_5: t('5paginasAnteriores'),
    next_5: t('proximas5paginas'),
    prev_3: t('3paginasAnteriores'),
    next_3: t('proximas3paginas'),
  };

  const getDataPerPage = useMemo(() => getPages(), [state.currentSort, filterDataTable, state.waterPag.tablePage, state.waterPag.tablePageSize]);
  return (
    <TableContainer>
      <Table
        columns={columnsData.filter(Boolean)}
        data={getDataPerPage}
        noBorderBottom
        noDataComponent={NoDataInTable}
        handleRemoveAllFilters={handleRemoveAllFilters}
        handleRemoveCategoryFilter={handleRemoveCategoryFilter}
        handleRemoveFilter={handleRemoveFilter}
        handleSearchWithFilters={() => { handleGetDevInfo({ firstSearch: false, useFilters: false }); }}
        filtersSelected={state.selectedFilters}
        style={{
          padding: '0px 10px',
          boxShadow: 'none',
          height: '300px',
          scrollbarWidth: 'thin',
          overflowX: getDataPerPage.length > 0 ? 'unset' : 'hidden',
        }}
        borderRow="0.7px solid rgba(0, 0, 0, 0.2)"
      />
      {state.waterPag && onPageChange && (
        <Flex justifyContent="flex-end" width={1} style={{ paddingTop: '6px', paddingRight: '1%' }}>
          <Pagination
            className="ant-pagination"
            defaultCurrent={state.waterPag.tablePage}
            total={filterDataTable.length}
            locale={pageLocale}
            pageSize={state.waterPag.tablePageSize}
            onChange={(current) => onPageChange(current)}
          />
        </Flex>
      )}
    </TableContainer>
  );
}

const NoDataInTable = () => (
  <NoAnalisysSelected>
    <EmptyDocumentIcon />
    <span>{t('resultadoDaBusca')}</span>
    <p>
      {t('tabelaSemDados')}
    </p>
  </NoAnalisysSelected>
);
