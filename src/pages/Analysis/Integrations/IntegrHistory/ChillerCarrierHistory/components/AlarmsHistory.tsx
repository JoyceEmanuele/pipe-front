import i18next, { t } from 'i18next';
import { Flex } from 'reflexbox';
import {
  Card, Loader, ModalLoading, Table,
} from '~/components';
import { BtnOrderColumns, NoDataComponent, TopTitle } from '../../../IntegrRealTime/DriChillerCarrierRealTime/components/styles';
import { HorizontalLine } from '~/components/Menu/styles';
import { useEffect, useState } from 'react';
import { FilterColumnsIcon } from '~/icons/FilterColumnsIcon';
import ModalOrderColumns from '~/components/ModalOrderColumns';
import { AlarmIcon } from '~/icons/AlarmIcon';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import moment, { Moment } from 'moment';
import {
  GenerateItemColumn,
  NoColumnsSelected,
  ReturnLabelContent,
  VerifyColumns,
} from '~/components/Table';
import Pagination from 'rc-pagination';
import { controlColumnsConfig } from './TableConfigs';
import { reorderList } from '~/helpers/reorderList';
import { ColumnTable } from '~/metadata/ColumnTable.model';
import { useStateVar } from '~/helpers/useStateVar';
import { Trans } from 'react-i18next';

type HistAlarms = {
  ID: number;
  ALARM_CODE: string;
  START_DATE: string;
  END_DATE: string;
  DESCRIPTION: string;
  REASON_ALARM: string;
  ACTION_TAKEN: string;
  RESET_TYPE: string;
  CAUSE: string;
}[];

type FilterColumns = {
  ALARM_CODE: { list: { name: string, value: string }[] },
  DESCRIPTION: { list: { name: string, value: string }[] },
  REASON_ALARM: { list: { name: string, value: string }[] },
  ACTION_TAKEN: { list: { name: string, value: string }[] },
  RESET_TYPE: { list: { name: string, value: string }[] },
  CAUSE: { list: { name: string, value: string }[] },
}

type FilterColumnsSelected = {
  [key: string]: {
    label: string;
    values: {
      value: string;
      name: string
    }[]
  };
}

export function AlarmsHistory(props: Readonly<{
  driId: string,
  startDate?: Moment | null,
  endDate?: Moment | null,
  setIsLoading: (loading: boolean) => void,
  isLoading: boolean,
  sortBy: { column: string; desc: boolean; },
  renderState: () => void,
  setSortBy: (value: { column: string, desc: boolean }) => void,
  setSelectedFilters: (value: { selectedFilterAlarms: { column: string, values: string[] }[] }) => void,
  selectedFilters: { column: string, values: string[] }[]
  setAlarmHistoryColumns: (value: { exportAlarmHistoryColumns: string[] }) => void,
}>): JSX.Element {
  const {
    driId,
    startDate,
    endDate,
    sortBy,
    isLoading,
    setIsLoading,
    renderState,
    setSelectedFilters,
    setSortBy,
    selectedFilters,
    setAlarmHistoryColumns,
  } = props;
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const [state, render, setState] = useStateVar({
    showModalOrderColumns: false,
    tablePagination: { tablePage: 1, tablePageSize: 10, totalItems: 0 },
    orderedHistAlarms: [] as HistAlarms,
    filterColumns: {
      ALARM_CODE: { list: [] },
      DESCRIPTION: { list: [] },
      REASON_ALARM: { list: [] },
      ACTION_TAKEN: { list: [] },
      RESET_TYPE: { list: [] },
      CAUSE: { list: [] },
    } as FilterColumns,
    selectedFiltersColumns: {
      ALARM_CODE: {
        label: t('codigo'),
        values: [],
      },
      DESCRIPTION: {
        label: t('descricao'),
        values: [],
      },
      REASON_ALARM: {
        label: t('porqueAlarmeGerado'),
        values: [],
      },
      ACTION_TAKEN: {
        label: t('acaoRealizada'),
        values: [],
      },
      RESET_TYPE: {
        label: t('tipoReset'),
        values: [],
      },
      CAUSE: {
        label: t('causa'),
        values: [],
      },
    } as FilterColumnsSelected,
    controlColumns: controlColumnsConfig,
    filterChanged: false,
  });

  const columns = [
    {
      Header: () => (
        GenerateItemColumn(t('codigo'), 'ALARM_CODE', handleSort, sortBy, {
          hasFilter: true,
          options: state.filterColumns.ALARM_CODE.list,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filterColumns.ALARM_CODE.list.length === state.selectedFiltersColumns.ALARM_CODE.values.length,
          value: state.selectedFiltersColumns.ALARM_CODE.values.map((alarm) => alarm.value),
        })
      ),
      Cell: (props) => (
        ReturnLabelContent(props.row.original.ALARM_CODE, { padding: true, marginBottom: true })
      ),
      accessor: 'ALARM_CODE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('dataInicio'), 'START_DATE', handleSort, sortBy)
      ),
      Cell: (props) => (
        FormatDateColumn(props.row.original.START_DATE)
      ),
      accessor: 'START_DATE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('dataFinal'), 'END_DATE', handleSort, sortBy)
      ),
      Cell: (props) => (
        FormatDateColumn(props.row.original.END_DATE)
      ),
      accessor: 'END_DATE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('descricao'), 'DESCRIPTION', handleSort, sortBy, {
          hasFilter: true,
          options: state.filterColumns.DESCRIPTION.list,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filterColumns.DESCRIPTION.list.length === state.selectedFiltersColumns.DESCRIPTION.values.length,
          value: state.selectedFiltersColumns.DESCRIPTION.values.map((description) => description.value),
        })
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.DESCRIPTION, true)
      ),
      accessor: 'DESCRIPTION',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('porqueAlarmeGerado'), 'REASON_ALARM', handleSort, sortBy, {
          hasFilter: true,
          options: state.filterColumns.REASON_ALARM.list,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filterColumns.REASON_ALARM.list.length === state.selectedFiltersColumns.REASON_ALARM.values.length,
          value: state.selectedFiltersColumns.REASON_ALARM.values.map((reason_alarm) => reason_alarm.value),
        })
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.REASON_ALARM, true)
      ),
      accessor: 'REASON_ALARM',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('acaoRealizada'), 'ACTION_TAKEN', handleSort, sortBy, {
          hasFilter: true,
          options: state.filterColumns.ACTION_TAKEN.list,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filterColumns.ACTION_TAKEN.list.length === state.selectedFiltersColumns.ACTION_TAKEN.values.length,
          value: state.selectedFiltersColumns.ACTION_TAKEN.values.map((action_taken) => action_taken.value),
        })
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.ACTION_TAKEN, true)
      ),
      accessor: 'ACTION_TAKEN',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('tipoReset'), 'RESET_TYPE', handleSort, sortBy, {
          hasFilter: true,
          options: state.filterColumns.RESET_TYPE.list,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filterColumns.RESET_TYPE.list.length === state.selectedFiltersColumns.RESET_TYPE.values.length,
          value: state.selectedFiltersColumns.RESET_TYPE.values.map((reset_type) => reset_type.value),
        })
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.RESET_TYPE, true)
      ),
      accessor: 'RESET_TYPE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('causa'), 'CAUSE', handleSort, sortBy, {
          hasFilter: true,
          options: state.filterColumns.CAUSE.list,
          onChangeFilter: handleChangeFilters,
          onSelectAllOptions: handleSelectAllFilters,
          filterAll: state.filterColumns.CAUSE.list.length === state.selectedFiltersColumns.CAUSE.values.length,
          value: state.selectedFiltersColumns.CAUSE.values.map((cause) => cause.value),
        })
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.CAUSE, true)
      ),
      accessor: 'CAUSE',
      disableSortBy: true,
    },
  ];

  const [columnsData, setColumnsData] = useState<(boolean | ColumnTable)[]>(columns);
  const [controlColumns, setControlColumns] = useState(controlColumnsConfig);

  useEffect(() => {
    if ([startDate, endDate].every((x) => x != null)) {
      Promise.resolve().then(async () => {
        try {
          setIsLoading(true);
          handleChangeDate();
          await handleGetAllFilters(startDate, endDate, driId);
          await handleGetAlarmsHist();
        } catch (err) {
          toast.error(t('erro')); console.error(err);
        }
        setIsLoading(false);
      });
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const newColumnsData = controlColumns.map((column) => {
      if (column.visible === true) {
        return columns.find((columnTable) => columnTable.accessor === column.id) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);
  }, [state.orderedHistAlarms]);

  useEffect(() => {
    handleSetColumnsData(controlColumnsConfig);
    setSortBy({ column: 'START_DATE', desc: true });
  }, []);

  function verifyAlarmRegistered(alarmKey) {
    return i18next.exists(alarmKey) ? t(alarmKey) : '-';
  }

  function handleGetExtraInfoALarm(alarms) {
    const alarmsWithExtraInfo = alarms.map((alarm) => ({
      ALARM_CODE: alarm.ALARM_CODE,
      START_DATE: alarm.START_DATE,
      END_DATE: alarm.END_DATE,
      DESCRIPTION: verifyAlarmRegistered(`alarm_${alarm.ALARM_CODE}_description`),
      REASON_ALARM: verifyAlarmRegistered(`alarm_${alarm.ALARM_CODE}_reason_alarm`),
      ACTION_TAKEN: verifyAlarmRegistered(`alarm_${alarm.ALARM_CODE}_action_taken`),
      RESET_TYPE: verifyAlarmRegistered(`alarm_${alarm.ALARM_CODE}_reset_type`),
      CAUSE: verifyAlarmRegistered(`alarm_${alarm.ALARM_CODE}_cause`),
    }));

    setState({ orderedHistAlarms: alarmsWithExtraInfo });
    render();
  }

  async function handleGetAllFilters(startDate, endDate, driId) {
    const allAlarmsCodes = await apiCall('/dri/get-all-chiller-alarms-codes', {
      DEVICE_CODE: driId,
      START_DATE: startDate.format('YYYY-MM-DD'),
      END_DATE: endDate.format('YYYY-MM-DD'),
    });

    const filterColumnsAux: FilterColumns = {
      ALARM_CODE: { list: [] },
      DESCRIPTION: { list: [] },
      REASON_ALARM: { list: [] },
      RESET_TYPE: { list: [] },
      ACTION_TAKEN: { list: [] },
      CAUSE: { list: [] },
    };

    allAlarmsCodes.list.forEach((alarms) => {
      filterColumnsAux.ALARM_CODE.list.push({
        name: alarms.ALARM_CODE,
        value: alarms.ALARM_CODE,
      });

      i18next.exists(`alarm_${alarms.ALARM_CODE}_description`) && filterColumnsAux.DESCRIPTION.list.push({
        name: t(`alarm_${alarms.ALARM_CODE}_description`),
        value: alarms.ALARM_CODE,
      });
      i18next.exists(`alarm_${alarms.ALARM_CODE}_reason_alarm`) && filterColumnsAux.REASON_ALARM.list.push({
        name: t(`alarm_${alarms.ALARM_CODE}_reason_alarm`),
        value: alarms.ALARM_CODE,
      });
      i18next.exists(`alarm_${alarms.ALARM_CODE}_action_taken`) && filterColumnsAux.ACTION_TAKEN.list.push({
        name: t(`alarm_${alarms.ALARM_CODE}_action_taken`),
        value: alarms.ALARM_CODE,
      });
      i18next.exists(`alarm_${alarms.ALARM_CODE}_reset_type`) && filterColumnsAux.RESET_TYPE.list.push({
        name: t(`alarm_${alarms.ALARM_CODE}_reset_type`),
        value: alarms.ALARM_CODE,
      });
      i18next.exists(`alarm_${alarms.ALARM_CODE}_cause`) && filterColumnsAux.CAUSE.list.push({
        name: t(`alarm_${alarms.ALARM_CODE}_cause`),
        value: alarms.ALARM_CODE,
      });
    });

    setState({ filterColumns: filterColumnsAux });
    render();
  }

  function handleCloseModal() {
    setState({ showModalOrderColumns: !state.showModalOrderColumns });
    render();
  }

  function handleChangeColumns(columnId) {
    const toggleVisibility = (column) => ({
      ...column,
      visible: column.id === columnId ? !column.visible : column.visible,
    });

    const updatedColumns = controlColumns.map(toggleVisibility);
    setControlColumns(updatedColumns);
    handleSetExportColumns(updatedColumns);

    const newColumnsData = updatedColumns.map((column) => {
      if (column.visible === true) {
        return columns.find((columnTable) => columnTable.accessor === column.id) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);

    return updatedColumns.some((column) => column.visible);
  }

  async function handleSort(column: string) {
    let sortByAux: { column: string; desc: boolean; };

    if (sortBy.column === column) {
      sortByAux = { ...sortBy, desc: !sortBy.desc };
    } else {
      sortByAux = { column, desc: true };
    }

    setSortBy(sortByAux);
    if ([startDate, endDate].every((x) => x != null)) {
      await handleGetAlarmsHist({
        sortByColumn: sortByAux.column, sortByDesc: sortByAux.desc, page: 1,
      });
    }
  }

  async function handleGetAlarmsHist(params?: { page?: number, sortByColumn?: string, sortByDesc?: boolean, filterParams?: { column: string, values: string[] }[] }) {
    const pageAux = params?.page || state.tablePagination.tablePage;
    const sortByAux = params?.sortByColumn ? { column: params.sortByColumn, desc: !!params.sortByDesc } : sortBy;
    const filters = params?.filterParams ?? selectedFilters;

    const alarmsHist = await apiCall('/dri/get-chiller-alarms-list-hist', {
      DEVICE_CODE: driId,
      START_DATE: startDate?.format('YYYY-MM-DD'),
      END_DATE: endDate?.format('YYYY-MM-DD'),
      LIMIT: state.tablePagination.tablePageSize,
      SKIP: state.filterChanged ? 0 : (pageAux - 1) * state.tablePagination.tablePageSize,
      ORDER_BY: {
        column: sortByAux.column,
        desc: sortByAux.desc,
      },
      filterBy: filters,
    });

    handleGetExtraInfoALarm(alarmsHist.list);
    setState({ tablePagination: { ...state.tablePagination, tablePage: pageAux, totalItems: alarmsHist.totalItems }, filterChanged: false });
    render();
  }

  async function handleChangePage(page: number) {
    setState({ tablePagination: { ...state.tablePagination, tablePage: page } });
    render();
    await handleGetAlarmsHist({ page });
  }

  function handleSetColumnsData(newColumns) {
    setControlColumns(newColumns);
    handleSetExportColumns(newColumns);

    const newColumnsData = newColumns.map((column) => {
      if (column.visible === true) {
        return columns.find((columnTable) => {
          if (typeof columnTable !== 'boolean') {
            return columnTable.accessor === column.id;
          }

          return false;
        }) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);
  }

  function handleSetExportColumns(columns) {
    const columnsToExport: string[] = [];
    for (const col of columns) {
      if (col?.visible) {
        columnsToExport.push(col.id);
      }
    }
    setAlarmHistoryColumns({ exportAlarmHistoryColumns: columnsToExport });
  }

  async function handleChangeFilters(name, filters) {
    switch (name) {
      case t('codigo'):
        state.selectedFiltersColumns.ALARM_CODE.values = filters.map((alarm) => ({ name: alarm, value: alarm }));
        break;
      case t('descricao'):
        state.selectedFiltersColumns.DESCRIPTION.values = filters.map((alarm) => ({ name: t(`alarm_${alarm}_description`), value: alarm }));
        break;
      case t('porqueAlarmeGerado'):
        state.selectedFiltersColumns.REASON_ALARM.values = filters.map((alarm) => ({ name: t(`alarm_${alarm}_reason_alarm`), value: alarm }));
        break;
      case t('acaoRealizada'):
        state.selectedFiltersColumns.ACTION_TAKEN.values = filters.map((alarm) => ({ name: t(`alarm_${alarm}_action_taken`), value: alarm }));
        break;
      case t('tipoReset'):
        state.selectedFiltersColumns.RESET_TYPE.values = filters.map((alarm) => ({ name: t(`alarm_${alarm}_reset_type`), value: alarm }));
        break;
      case t('causa'):
        state.selectedFiltersColumns.CAUSE.values = filters.map((alarm) => ({ name: t(`alarm_${alarm}_cause`), value: alarm }));
        break;
      default:
        break;
    }

    state.filterChanged = true;
    render();

    await handleUpdateFiltersAux();
  }

  function handleChangeDate() {
    setState({
      selectedFilterColumns: {
        ALARM_CODE: [],
        DESCRIPTION: [],
        REASON_ALARM: [],
        RESET_TYPE: [],
        ACTION_TAKEN: [],
        CAUSE: [],
      },
      orderedHistAlarms: [],
    });

    setSortBy({ column: 'START_DATE', desc: true });
    setState({ tablePagination: { ...state.tablePagination, tablePage: 1 } });
    render();
  }

  async function handleRemoveAllFilters() {
    state.selectedFiltersColumns.ALARM_CODE.values = [];
    state.selectedFiltersColumns.DESCRIPTION.values = [];
    state.selectedFiltersColumns.REASON_ALARM.values = [];
    state.selectedFiltersColumns.RESET_TYPE.values = [];
    state.selectedFiltersColumns.ACTION_TAKEN.values = [];
    state.selectedFiltersColumns.CAUSE.values = [];
    state.filterChanged = false;
    setSelectedFilters({ selectedFilterAlarms: [] });
    renderState();
    render();
    await handleGetAlarmsHist({ filterParams: [] });
  }

  const handleRemoveCategoryFilter = async (columnKey: string) => {
    state.selectedFiltersColumns[columnKey].values = [];
    state.filterChanged = true;
    await handleUpdateFiltersAux();
    render();
  };

  async function handleSelectAllFilters(name, filterAll) {
    const filterColumnsAux = JSON.parse(JSON.stringify(state.filterColumns));
    switch (name) {
      case t('codigo'):
        state.selectedFiltersColumns.ALARM_CODE.values = filterAll ? filterColumnsAux.ALARM_CODE.list : [];
        break;
      case t('descricao'):
        state.selectedFiltersColumns.DESCRIPTION.values = filterAll ? filterColumnsAux.DESCRIPTION.list : [];
        break;
      case t('porqueAlarmeGerado'):
        state.selectedFiltersColumns.REASON_ALARM.values = filterAll ? filterColumnsAux.REASON_ALARM.list : [];
        break;
      case t('acaoRealizada'):
        state.selectedFiltersColumns.ACTION_TAKEN.values = filterAll ? filterColumnsAux.ACTION_TAKEN.list : [];
        break;
      case t('tipoReset'):
        state.selectedFiltersColumns.RESET_TYPE.values = filterAll ? filterColumnsAux.RESET_TYPE.list : [];
        break;
      case t('causa'):
        state.selectedFiltersColumns.CAUSE.values = filterAll ? filterColumnsAux.CAUSE.list : [];
        break;
      default:
        break;
    }
    state.filterChanged = true;
    render();

    await handleUpdateFiltersAux();
  }

  async function handleRemoveFilter(columnKey: string, filterIndex: number) {
    state.selectedFiltersColumns[columnKey].values.splice(filterIndex, 1);
    state.filterChanged = true;
    await handleUpdateFiltersAux();

    render();
  }

  async function handleUpdateFiltersAux() {
    const selectedFilterAlarms = Object.entries(state.selectedFiltersColumns)
      .filter(([_, columnObj]) => columnObj.values.length > 0)
      .map(([columnName, columnObj]) => ({
        column: columnName,
        values: columnObj.values.map((valueObj) => valueObj.value),
      }));

    setSelectedFilters({ selectedFilterAlarms });

    if (!selectedFilterAlarms.length) {
      await handleGetAlarmsHist({ filterParams: selectedFilterAlarms, page: 1 });
    }

    renderState();
  }

  return (
    <div id="pageBody" style={{ width: '100%', position: 'relative' }}>
      <ModalLoading display={isLoading}>
        <Loader />
        <div>
          <Trans
            i18nKey="mensageLoader"
          >
            <h4> Aguarde, os dados estão </h4>
            <h4> sendo carregados. </h4>
          </Trans>
        </div>
      </ModalLoading>
      <div style={{ minHeight: '650px' }}>
        <Card noPadding>
          <>
            <Flex flexDirection={isDesktop.matches ? 'row' : 'column'} mt="10px" mb="10px">
              <Flex
                flexWrap="wrap"
                justifyContent="space-between"
                alignItems="center"
                margin="10px 0 20px 20px"
              >
                <TopTitle>{t('alarmes')}</TopTitle>
              </Flex>
              <Flex alignItems="right" margin={isDesktop.matches ? '0 20px 0 auto' : '10px auto 0 20px'}>
                <BtnOrderColumns onClick={() => { setState({ showModalOrderColumns: !state.showModalOrderColumns }); render(); }}>
                  <FilterColumnsIcon />
                  {t('colunas')}
                </BtnOrderColumns>
              </Flex>
            </Flex>
            <HorizontalLine />
            {controlColumns.some(
              (column) => column.visible === true,
            ) ? (
              <Table
                columns={columnsData.filter(Boolean)}
                data={state.orderedHistAlarms}
                noDataComponent={[startDate, endDate].some((date) => date == null) ? NoPeriodSelected : NoDataInTable}
                noBorderBottom
                handleRemoveAllFilters={handleRemoveAllFilters}
                handleRemoveFilter={handleRemoveFilter}
                filtersSelected={state.selectedFiltersColumns}
                handleSearchWithFilters={handleGetAlarmsHist}
                handleRemoveCategoryFilter={handleRemoveCategoryFilter}
                style={{
                  padding: '0 10px',
                  minHeight: state.orderedHistAlarms.length ? '200px' : '0px',
                  boxShadow: 'none',
                  overflowX: state.orderedHistAlarms.length ? 'auto' : 'hidden',
                  overflowY: state.orderedHistAlarms.length > 7 ? 'auto' : 'hidden',
                }}
              />
              ) : (
                <NoColumnsSelected />
              )}
          </>
        </Card>
        {state.tablePagination.totalItems > 0 && (
          <Flex justifyContent="flex-end" width={1} mt={10} mb={10}>
            <Pagination
              className="ant-pagination"
              current={state.tablePagination.tablePage}
              total={state.tablePagination.totalItems}
              pageSize={state.tablePagination.tablePageSize}
              onChange={(current) => handleChangePage(current)}
              disabled={isLoading}
            />
          </Flex>
        )}
      </div>

      {state.showModalOrderColumns && (
        <ModalOrderColumns
          handleCancelModal={handleCloseModal}
          handleSubmitModal={handleCloseModal}
          columns={controlColumns}
          handleChangeColumns={handleChangeColumns}
          isDesktop={isDesktop.matches}
          handleDragColumn={(dragIndex, hoverIndex) => {
            setControlColumns((prevState) => {
              const dataAux = reorderList(prevState, dragIndex, hoverIndex);
              handleSetExportColumns(dataAux);
              return dataAux;
            });
            setColumnsData((prevState) => reorderList(prevState, dragIndex, hoverIndex));
          }}
          handleResetColumns={(originalColumns) => handleSetColumnsData(originalColumns)}
        />
      )}
    </div>
  );
}

function NoDataInTable() {
  return (
    <div>
      <NoDataComponent minHeight="500px">
        <AlarmIcon />
        <span style={{ fontSize: 13 }}><strong>{t('historicoDeAlarmes')}</strong></span>
        <span style={{ fontSize: 11, fontWeight: 500 }}>{t('naoHouveramRegistrosAlarmesDiaSelecionado')}</span>
      </NoDataComponent>
    </div>

  );
}

function NoPeriodSelected() {
  return (
    <div>
      <NoDataComponent minHeight="500px">
        <AlarmIcon />
        <span style={{ fontSize: 13 }}><strong>{t('historicoDeAlarmes')}</strong></span>
        <span style={{ fontSize: 11, fontWeight: 500 }}>{t('selecioneDataParaMostrarHistorico')}</span>
      </NoDataComponent>
    </div>
  );
}

function FormatDateColumn(date) {
  const dataMoment = moment(date);
  const dateFormated = dataMoment.format('DD/MM/YYYY');
  const hourFormated = `${dataMoment.format('HH:mm')}h`;
  return (
    <div style={{ paddingBottom: '5px' }}>
      {date != null ? (
        <>
          <div>{dateFormated}</div>
          <div style={{ fontSize: '11px', color: '#8f8f8f' }}>{hourFormated}</div>
        </>
      ) : (
        <div>-</div>
      )}
    </div>
  );
}
