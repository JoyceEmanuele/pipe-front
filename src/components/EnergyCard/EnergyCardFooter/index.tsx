import { Loader, Table } from '~/components';
import {
  CardContentFooter, InsightsFooter, LoaderOverlay, ShowListButton,
} from './styles';
import {
  forwardRef, useEffect, useImperativeHandle, useState,
} from 'react';
import Pagination from 'rc-pagination';
import { NoAnalisysSelected } from '~/pages/General/styles';
import { EmptyDocumentIcon } from '~/icons/EmptyDocumentIcon';
import { t } from 'i18next';
import { useStateVar } from '~/helpers/useStateVar';
import { ColumnTable } from '~/metadata/ColumnTable.model';
import { apiCall } from '~/providers';
import { EnergyCardProps } from '..';
import { ColumnsTableConfig } from './TableConfig';
import { handleGetDatesParams } from '~/helpers/getRangeParamsChart';
import { toast } from 'react-toastify';
import { useEnergyCard } from '../EnergyCardContext';

interface EnergyCardFooterProps extends EnergyCardProps{
  chartMode: string;
  isComparing: boolean;
  totalUnitsWithConstructedArea: number;
  procellFilters: number[];
  procellLetters: string[];
  handleChangeTableFilters: (tableFilters) => void;
  ref?: React.Ref<{ handleResetFilters: () => void }>;
  isExpanded?: boolean;
}

export const EnergyCardFooter: React.FC<EnergyCardFooterProps> = forwardRef(({
  chartMode, energyCardFilters, isComparing, handleChangeTableFilters, procellFilters, procellLetters, totalUnitsWithConstructedArea, isExpanded,
}, ref) => {
  const { cardControlTab, cardDate } = useEnergyCard();

  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  const [state, render] = useStateVar({
    isLoading: false,
    filtersData: {
      clients: [],
      states: [],
      cities: [],
      units: [],
    } as any,
    selectedFilters: {
      clients: {
        label: t('cliente'),
        values: [],
      },
      states: {
        label: t('estado'),
        values: [],
      },
      cities: {
        label: t('cidade'),
        values: [],
      },
      units: {
        label: t('unidade'),
        values: [],
      },
    } as any,
    filterAll: {
      clients: false,
      states: false,
      cities: false,
      units: false,
    },
    columnSort: {
      clientName: {
        column: 'clientName',
        desc: false,
      },
      stateName: {
        column: 'stateName',
        desc: false,
      },
      cityName: {
        column: 'cityName',
        desc: false,
      },
      unitName: {
        column: 'unitName',
        desc: false,
      },
      procelRanking: {
        column: 'procelRanking',
        desc: true,
      },
      procelCategory: {
        column: 'procelCategory',
        desc: false,
      },
      consumption: {
        column: 'consumption',
        desc: false,
      },
      consumptionPreviousPercentage: {
        column: 'consumptionPreviousPercentage',
        desc: false,
      },
      totalCharged: {
        column: 'totalCharged',
        desc: false,
      },
      refrigerationConsumption: {
        column: 'refrigerationConsumption',
        desc: false,
      },
      refrigerationConsumptionPercentage: {
        column: 'refrigerationConsumptionPercentage',
        desc: false,
      },
      consumptionByArea: {
        column: 'consumptionByArea',
        desc: false,
      },
      refCapacity: {
        column: 'refCapacity',
        desc: false,
      },
      refrigerationConsumptionByArea: {
        column: 'refrigerationConsumptionByArea',
        desc: false,
      },
    },
    currentSort: {
      field: '',
      type: '',
    },
    pagination: {
      itemsPerPage: 5,
      totalItems: 0,
      currentPage: 1,
    },
  });

  const handleSortData = (column) => {
    Object.keys(state.columnSort).forEach((columnKey) => {
      if (columnKey === column) {
        state.columnSort[columnKey] = {
          column: state.columnSort[columnKey].column,
          desc: !state.columnSort[columnKey].desc,
        };
      } else {
        state.columnSort[columnKey] = {
          column: state.columnSort[columnKey].column,
          desc: false,
        };
      }
    });

    state.currentSort = {
      field: state.columnSort[column].column,
      type: state.columnSort[column].desc ? 'Asc' : 'Desc',
    };

    handleGetTableData();
    render();
  };

  const handleFormatterFilterParams = () => ({
    clientIds: state.selectedFilters.clients.values.map((filter) => filter.value),
    stateIds: state.selectedFilters.states.values.map((filter) => filter.value),
    cityIds: state.selectedFilters.cities.values.map((filter) => filter.value),
    unitIds: state.selectedFilters.units.values.map((filter) => filter.value),
  });

  const handleGetTableData = async (resetPagination = true) => {
    try {
      state.isLoading = true;
      render();
      const sortParams = {} as {orderByField: string, orderByType: string };

      if (state.currentSort.field && state.currentSort.type) {
        sortParams.orderByField = state.currentSort.field;
        sortParams.orderByType = state.currentSort.type;
      }

      const filtersParams = handleFormatterFilterParams();

      const chartModeParam = cardControlTab === 'insights' ? 'monthMode' : chartMode;
      const datesParams = handleGetDatesParams(`${cardDate.month} ${cardDate.year}`, 'MMMM YYYY', chartModeParam, isComparing);

      if (resetPagination) {
        state.pagination.currentPage = 1;
      }

      const items = await apiCall('/energy/get-analysis-list', {
        startDate: datesParams.startDate.toISOString().substring(0, 19),
        endDate: datesParams.endDate.toISOString().substring(0, 19),
        page: state.pagination.currentPage,
        pageSize: state.pagination.itemsPerPage,
        insideFilters: {
          ...filtersParams,
          categoryFilter: procellLetters.map((letter) => letter.toLocaleUpperCase()),
        },
        ...sortParams,
        ...energyCardFilters,
      });

      if (items.unitsList) {
        setTableData(items.unitsList);
      }

      state.isLoading = false;
      state.pagination.totalItems = items.resume.totalItems;
      render();
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetFilters = async (energyCardFilters) => {
    try {
      const chartModeParam = cardControlTab === 'history' ? chartMode : 'monthMode';
      const datesParams = handleGetDatesParams(`${cardDate.month} ${cardDate.year}`, 'MMMM YYYY', chartModeParam, isComparing);

      const filtersParams = handleFormatterFilterParams();

      const filters = await apiCall('/energy/get-energy-hist-filters', {
        startDate: datesParams.startDate.toISOString().substring(0, 19),
        endDate: datesParams.endDate.toISOString().substring(0, 19),
        insideFilters: {
          ...filtersParams,
          categoryFilter: procellLetters.map((letter) => letter.toLocaleUpperCase()),
        },
        ...energyCardFilters,
      });
      state.filtersData = {
        clients: filters.clients.map((client) => ({ name: client.name, value: client.id })),
        states: filters.states.map((state) => ({ name: state.name, value: state.id })),
        cities: filters.cities.map((city) => ({ name: city.name, value: city.id })),
        units: filters.units.map((unit) => ({ name: unit.name, value: unit.id })),
      };

      render();
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesFiltros'));
    }
  };

  const handleChangeFilters = (name, filters) => {
    switch (name) {
      case 'Cliente':
        state.selectedFilters.clients.values = filters.map((filter) => state.filtersData.clients.find((filterData) => filterData.value === filter));
        break;
      case 'Estado':
        state.selectedFilters.states.values = filters.map((filter) => state.filtersData.states.find((filterData) => filterData.value === filter));
        break;
      case 'Cidade':
        state.selectedFilters.cities.values = filters.map((filter) => state.filtersData.cities.find((filterData) => filterData.value === filter));
        break;
      case 'Unidade':
        state.selectedFilters.units.values = filters.map((filter) => state.filtersData.units.find((filterData) => filterData.value === filter));
        break;
      default:
        break;
    }

    const updatedFilters = handleFormatterFilterParams();
    handleChangeTableFilters(updatedFilters);

    render();
  };

  const handleSelectAllFilters = (name, filterAll) => {
    switch (name) {
      case 'Cliente':
        state.selectedFilters.clients.values = filterAll ? state.filtersData.clients : [];
        state.filterAll.clients = filterAll;
        break;
      case 'Estado':
        state.selectedFilters.states.values = filterAll ? state.filtersData.states : [];
        state.filterAll.states = filterAll;
        break;
      case 'Cidade':
        state.selectedFilters.cities.values = filterAll ? state.filtersData.cities : [];
        state.filterAll.cities = filterAll;
        break;
      case 'Unidade':
        state.selectedFilters.units.values = filterAll ? state.filtersData.units : [];
        state.filterAll.units = filterAll;
        break;
      default:
        break;
    }

    const updatedFilters = handleFormatterFilterParams();
    handleChangeTableFilters(updatedFilters);

    render();
  };

  const handleRemoveAllFilters = (callHandleChange = true) => {
    state.selectedFilters.clients.values = [];
    state.selectedFilters.states.values = [];
    state.selectedFilters.cities.values = [];
    state.selectedFilters.units.values = [];

    if (callHandleChange) {
      const updatedFilters = handleFormatterFilterParams();
      handleChangeTableFilters(updatedFilters);
    }

    render();
  };

  const handleRemoveFilter = (columnKey: string, filterIndex: number) => {
    const newFilters = state.selectedFilters[columnKey].values.filter((_, index) => index !== filterIndex);
    state.selectedFilters[columnKey].values = newFilters;

    const updatedFilters = handleFormatterFilterParams();
    handleChangeTableFilters(updatedFilters);

    render();
  };

  const handleRemoveCategoryFilter = (columnKey: string) => {
    state.selectedFilters[columnKey].values = [];

    const updatedFilters = handleFormatterFilterParams();
    handleChangeTableFilters(updatedFilters);

    render();
  };

  const [columnsData, setColumnsData] = useState<(boolean | ColumnTable)[]>(ColumnsTableConfig(state, handleSortData, handleChangeFilters, handleSelectAllFilters, procellFilters));

  useImperativeHandle(ref, () => ({
    handleResetFilters: () => {
      state.selectedFilters.clients.values = [];
      state.selectedFilters.states.values = [];
      state.selectedFilters.cities.values = [];
      state.selectedFilters.units.values = [];
    },
  }), []);

  useEffect(() => {
    if (energyCardFilters.startObject || !cardDate.verifyDate || !cardDate.isApiDate) return;

    setColumnsData(ColumnsTableConfig(state, handleSortData, handleChangeFilters, handleSelectAllFilters, procellFilters));
    handleGetFilters(energyCardFilters);
    handleGetTableData();
  }, [cardDate, chartMode, isComparing]);

  useEffect(() => {
    if (energyCardFilters.startObject) return;

    handleRemoveAllFilters();
  }, [energyCardFilters]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px', paddingTop: totalUnitsWithConstructedArea ? '0px' : '20px',
    }}
    >
      <CardContentFooter>
        {(cardControlTab === 'insights' && totalUnitsWithConstructedArea > 0) && (
          <InsightsFooter>
            <p>
              {t('ucsContabilizadas')}
              :
              <span style={{
                fontWeight: 500,
                color: '#000',
              }}
              >
                {` ${totalUnitsWithConstructedArea ?? 0}`}
              </span>
            </p>
            <span style={{ maxWidth: '60%' }}>{t('considerandoApenas')}</span>
          </InsightsFooter>
        )}
        <div />
        <ShowListButton onClick={() => setShowTable((showTablePrevState) => !showTablePrevState)}>{t('verLista')}</ShowListButton>
      </CardContentFooter>
      {showTable && (
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '15px',
        }}
        >
          <div style={{ width: '100%' }}>
            <Table
              columns={columnsData.filter(Boolean)}
              data={tableData}
              noDataComponent={NoDataInTable}
              noBorderBottom
              filtersSelected={state.selectedFilters}
              {...(
                procellFilters.length <= 0 && ({
                  handleRemoveFilter,
                  handleRemoveAllFilters,
                  handleRemoveCategoryFilter,
                })
              )}
              style={{
                boxShadow: 'none',
                overflowX: tableData.length ? 'auto' : 'hidden',
                overflowY: tableData.length > 7 ? 'auto' : 'hidden',
                height: '300px',
              }}
            />
          </div>
          <Pagination
            className="ant-pagination"
            current={state.pagination.currentPage}
            total={state.pagination.totalItems}
            pageSize={state.pagination.itemsPerPage}
            onChange={(current) => {
              state.pagination.currentPage = current;
              handleGetTableData(false);
              render();
            }}
            disabled={state.isLoading}
          />
          {state.isLoading && (
            <LoaderOverlay>
              <Loader variant="primary" size="large" />
            </LoaderOverlay>
          )}
        </div>
      )}
    </div>
  );
});

const NoDataInTable = () => (
  <NoAnalisysSelected>
    <EmptyDocumentIcon />
    <span>{t('resultadoDaAnalise')}</span>
    <p>
      {t('tabelaSemDados')}
    </p>
  </NoAnalisysSelected>
);
