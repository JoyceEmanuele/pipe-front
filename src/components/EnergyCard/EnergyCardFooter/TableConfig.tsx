import { t } from 'i18next';
import { GenerateItemColumn } from '~/components/Table';
import { tickets } from '~/pages/General';
import {
  LinkedStringLabel, ProcelCategoryLabel, RankingLabel, StringLabel, ValueTotalCharged, ValueTrated,
  VarConsumptionLabel,
} from '~/pages/General/TableConfigs';

export const ColumnsTableConfig = (state, handleSortData, handleChangeFilters, handleSelectAllFilters, procellFilters) => [
  {
    Header: () => (
      GenerateItemColumn(t('cliente'), 'clientName', handleSortData, state.columnSort.clientName, {
        hasFilter: procellFilters.length <= 0,
        options: state.filtersData.clients,
        onChangeFilter: handleChangeFilters,
        onSelectAllOptions: handleSelectAllFilters,
        filterAll: state.filtersData?.clients?.length === state.selectedFilters?.clients?.length,
        value: state.selectedFilters.clients.values,
      })
    ),
    accessor: 'clientName',
    disableSortBy: true,
    Cell: (props) => StringLabel(props.row.original.clientName, `clientName-${props.row.original.unitId}`, '0', '11px'),
  },
  {
    Header: () => (
      GenerateItemColumn(t('estado'), 'stateName', handleSortData, state.columnSort.stateName, {
        hasFilter: procellFilters.length <= 0,
        options: state.filtersData.states,
        onChangeFilter: handleChangeFilters,
        onSelectAllOptions: handleSelectAllFilters,
        filterAll: state.filtersData?.states?.length === state.selectedFilters?.states?.length,
        value: state.selectedFilters.states.values,
      })
    ),
    accessor: 'stateName',
    disableSortBy: true,
    Cell: (props) => StringLabel(props.row.original.stateName, `stateName-${props.row.original.unitId}`, '0', '11px'),
  },
  {
    Header: () => (
      GenerateItemColumn(t('cidade'), 'cityName', handleSortData, state.columnSort.cityName, {
        hasFilter: procellFilters.length <= 0,
        options: state.filtersData.cities,
        onChangeFilter: handleChangeFilters,
        onSelectAllOptions: handleSelectAllFilters,
        filterAll: state.filtersData?.cities?.length === state.selectedFilters?.cities?.length,
        value: state.selectedFilters.cities.values,
      })
    ),
    accessor: 'cityName',
    disableSortBy: true,
    Cell: (props) => StringLabel(props.row.original.cityName, `cityName-${props.row.original.unitId}`, '0', '11px'),
  },
  {
    Header: () => (
      GenerateItemColumn(t('unidade'), 'unitName', handleSortData, state.columnSort.unitName, {
        hasFilter: procellFilters.length <= 0,
        options: state.filtersData.units,
        onChangeFilter: handleChangeFilters,
        onSelectAllOptions: handleSelectAllFilters,
        filterAll: state.filtersData?.units?.length === state.selectedFilters?.units?.length,
        value: state.selectedFilters.units.values,
      })
    ),
    accessor: 'unitName',
    disableSortBy: true,
    Cell: (props) => LinkedStringLabel(props.row.original.unitName, props.row.original.unitId, `unitName-${props.row.original.unitId}`, '0', '11px'),
  },
  {
    Header: () => (
      GenerateItemColumn('Ranking', 'procelRanking', handleSortData, state.columnSort.procelRanking, {
        hasFilter: false,
      }, false, { tooltipId: 'ranking-info', title: 'Ranking', text: t('rankingDesc') })
    ),
    accessor: 'procelRanking',
    disableSortBy: true,
    Cell: (props) => RankingLabel(props.row.original.procelRanking),
  },
  {
    Header: () => (
      GenerateItemColumn('Efic. Energética', 'procelCategory', handleSortData, state.columnSort.procelCategory)
    ),
    accessor: 'procelCategory',
    disableSortBy: true,
    Cell: (props) => ProcelCategoryLabel(props.row.original.procelCategory, tickets),
  },
  {
    Header: () => (
      GenerateItemColumn(`${t('consumo')} (kWh)`, 'consumption', handleSortData, state.columnSort.consumption)
    ),
    accessor: 'consumption',
    disableSortBy: true,
    Cell: (props) => ValueTrated(props.row.original, 'consumption', '', ' kWh', '0'),
  },
  {
    Header: () => (
      GenerateItemColumn('Var. Consumo', 'consumptionPreviousPercentage', handleSortData, state.columnSort.consumptionPreviousPercentage, {
        hasFilter: false,
      }, false, { tooltipId: 'var_consumption-info', title: t('variacaoConsumo'), text: t('variacaoConsumoDesc') })
    ),
    accessor: 'consumptionPreviousPercentage',
    disableSortBy: true,
    Cell: (props) => VarConsumptionLabel(props.row.original, props.row.original.consumptionPreviousPercentage, 'previousPercentage'),
  },
  {
    Header: () => (
      GenerateItemColumn(`${t('consumo')} (R$)`, 'totalCharged', handleSortData, state.columnSort.totalCharged)
    ),
    accessor: 'totalCharged',
    disableSortBy: true,
    Cell: (props) => ValueTotalCharged(props.row.original, props.row.original.totalCharged, 'totalChargedConsumption', 'R$ ', '8px 0'),
  },
  {
    Header: () => (
      GenerateItemColumn(`${t('consumoPorM')} (kWh/m²)`, 'consumptionByArea', handleSortData, state.columnSort.consumptionByArea)
    ),
    accessor: 'consumptionByArea',
    disableSortBy: true,
    Cell: (props) => ValueTrated(props.row.original, 'consumptionByArea', '', ' kWh/m²', '0'),
  },
];
