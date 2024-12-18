import { Flex } from 'reflexbox';
import { Card, Table } from '~/components';
import { BtnOrderColumns, NoDataComponent, TopTitle } from './styles';
import { FilterColumnsIcon } from '~/icons/FilterColumnsIcon';
import { AlarmIcon } from '~/icons/AlarmIcon';
import i18next, { t } from 'i18next';
import { useEffect, useState } from 'react';
import {
  handleOrderAux,
  handleSortAlarmCode,
} from './TableCommonFunctions';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import { HorizontalLine } from '~/components/Menu/styles';
import {
  GenerateItemColumn,
  NoColumnsSelected,
  ReturnLabelContent,
  VerifyColumns,
} from '~/components/Table';
import ModalOrderColumns from '~/components/ModalOrderColumns';
import { controlColumnsConfig } from './TableConfigs';
import { reorderList } from '~/helpers/reorderList';
import { ColumnTable } from '~/metadata/ColumnTable.model';

type RowsAlarms = {
  ID?: number,
  ALARM_CODE: string,
  DESCRIPTION: string,
  REASON_ALARM: string,
  ACTION_TAKEN: string,
  RESET_TYPE: string,
  CAUSE: string,
  DATE: {
    datetime: string
    dateInMinutes: number,
  },
}[];

type AlarmsList = {
  ID: number;
  ALARM_CODE: string;
}[];

export default function ChillerAlarms(props: { alarmParams: any, driId: string }): JSX.Element {
  const [sortBy, setSortBy] = useState({ column: '', desc: false });
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const [alarmsGenerated, setAlarmsGenerated] = useState<RowsAlarms>([]);
  const [orderedAlarms, setOrderedAlarms] = useState<RowsAlarms>([]);
  const [lastAlarms, setLastAlarms] = useState({
    alarm_1: null as number|null,
    alarm_2: null as number|null,
    alarm_3: null as number|null,
    alarm_4: null as number|null,
    alarm_5: null as number|null,
  });
  const [alarmsList, setAlarmsList] = useState<AlarmsList>([]);
  const [showModalOrderColumns, setShowModalOrderColumns] = useState(false);
  const [initVerifyAlarms, setInitVerifyAlarms] = useState(false);

  const columns = [
    {
      Header: () => (
        GenerateItemColumn(t('codigo'), 'ALARM_CODE', handleSort, sortBy)
      ),
      Cell: (props) => (
        ReturnLabelContent(props.row.original.ALARM_CODE, { padding: true })
      ),
      accessor: 'ALARM_CODE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('data'), 'DATE', handleSort, sortBy)
      ),
      Cell: (props) => (
        ReturnLabelDate(props.row.original.DATE.dateInMinutes)
      ),
      accessor: 'DATE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('descricao'), 'DESCRIPTION', handleSort, sortBy)
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.DESCRIPTION)
      ),
      accessor: 'DESCRIPTION',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('porqueAlarmeGerado'), 'REASON_ALARM', handleSort, sortBy)
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.REASON_ALARM)
      ),
      accessor: 'REASON_ALARM',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('acaoRealizada'), 'ACTION_TAKEN', handleSort, sortBy)
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.ACTION_TAKEN)
      ),
      accessor: 'ACTION_TAKEN',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('tipoReset'), 'RESET_TYPE', handleSort, sortBy)
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.RESET_TYPE)
      ),
      accessor: 'RESET_TYPE',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('causa'), 'CAUSE', handleSort, sortBy)
      ),
      Cell: (props) => (
        VerifyColumns(controlColumns, props.row.original.CAUSE)
      ),
      accessor: 'CAUSE',
      disableSortBy: true,
    },
  ];

  const [controlColumns, setControlColumns] = useState(controlColumnsConfig);
  const [columnsData, setColumnsData] = useState<(boolean | ColumnTable)[]>(columns);

  useEffect(() => {
    if (initVerifyAlarms && Object.values(props.alarmParams).every((alarm) => alarm !== null)) {
      const alarms = verifyAlarms();
      updateAlarmTimes(alarms);
    }
  }, [props, initVerifyAlarms]);

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        let allAlarms: AlarmsList = [];
        await apiCall('/dri/get-chiller-alarms-list', {}).then((res) => {
          allAlarms = res.list;
          setAlarmsList(allAlarms);
        });
        await apiCall('/dri/get-chiller-alarms-list-hist', { DEVICE_CODE: props.driId }).then((res) => {
          handleActualAlarms(res.list, allAlarms);
        });
        setInitVerifyAlarms(true);
      } catch (err) {
        toast.error(t('erro')); console.error(err);
      }
    });
    handleSetColumnsData(controlColumnsConfig);
  }, []);

  useEffect(() => {
    const newColumnsData = controlColumns.map((column) => {
      if (column.visible === true) {
        return columns.find((columnTable) => columnTable.accessor === column.id) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);
  }, [orderedAlarms]);

  function updateAlarmTimes(alarms) {
    const updatedAlarms = alarms.map((alarm) => ({
      ...alarm,
      DATE: {
        datetime: alarm.DATE.datetime,
        dateInMinutes: alarm.DATE.dateInMinutes !== '-' ? calculateDiffDatesInMinutes(alarm.DATE.datetime) : '-',
      },
    }));

    setAlarmsGenerated(updatedAlarms);
    setOrderedAlarms(updatedAlarms);
    if (sortBy.column) handleOrderRows(sortBy, updatedAlarms);
  }

  function calculateDiffDatesInMinutes(date) {
    const actualDate = new Date();
    const milliSecondsDiff = actualDate.getTime() - new Date(date).getTime();
    const minutesDiff = Math.floor(milliSecondsDiff / (1000 * 60));

    return minutesDiff;
  }

  function verifyAlarms() {
    const newAlarms: {
      alarm_1?: number;
      alarm_2?: number;
      alarm_3?: number;
      alarm_4?: number;
      alarm_5?: number;
    } = {};

    const newTelemetryAlarms = props.alarmParams;
    const removedAlarms: any[] = [];

    Object.keys(lastAlarms).forEach((key) => {
      const lastAlarmValue = lastAlarms[key];
      if (lastAlarmValue && Object.values(newTelemetryAlarms).indexOf(lastAlarmValue) === -1) {
        removedAlarms.push(lastAlarmValue.toString());
      }
    });

    const actualAlarmsList = handleRemoveAlarms(removedAlarms, alarmsGenerated);

    Object.keys(newTelemetryAlarms).forEach((key) => {
      const alarm = newTelemetryAlarms[key];
      if (alarm && Object.values(lastAlarms).indexOf(alarm) === -1) {
        newAlarms[key] = alarm;
      }
    });

    handleAlarmCode(newAlarms, actualAlarmsList);
    setLastAlarms(JSON.parse(JSON.stringify(newTelemetryAlarms)));
    return actualAlarmsList;
  }

  function handleAlarmCode(newAlarms, alarmsListAux) {
    const dateNow = new Date().toISOString();
    Object.values(newAlarms).forEach((alarm) => {
      const alarm_code = `${alarm}`;
      const alarmInfo = alarmsList.find((x) => x.ALARM_CODE === alarm_code);
      if (alarmInfo) {
        alarmsListAux.push({
          ID: alarmInfo.ID,
          ALARM_CODE: alarmInfo.ALARM_CODE,
          DATE: {
            dateInMinutes: calculateDiffDatesInMinutes(dateNow),
            datetime: dateNow,
          },
          DESCRIPTION: verifyAlarmRegistered(`alarm_${alarm_code}_description`),
          REASON_ALARM: verifyAlarmRegistered(`alarm_${alarm_code}_reason_alarm`),
          ACTION_TAKEN: verifyAlarmRegistered(`alarm_${alarm_code}_action_taken`),
          RESET_TYPE: verifyAlarmRegistered(`alarm_${alarm_code}_reset_type`),
          CAUSE: verifyAlarmRegistered(`alarm_${alarm_code}_cause`),
        });
      } else {
        alarmsListAux.push({
          ALARM_CODE: alarm_code,
          DESCRIPTION: '-',
          REASON_ALARM: '-',
          ACTION_TAKEN: '-',
          RESET_TYPE: '-',
          CAUSE: '-',
          DATE: {
            dateInMinutes: calculateDiffDatesInMinutes(dateNow),
            datetime: dateNow,
          },
        });
      }
    });
  }

  function verifyAlarmRegistered(alarmKey) {
    return i18next.exists(alarmKey) ? t(alarmKey) : '-';
  }

  function handleRemoveAlarms(resolved_alarms, alarmsList) {
    const actualAlarms = alarmsList.filter((x) => !resolved_alarms.includes(x.alarm_code));

    return actualAlarms;
  }

  function handleSort(column: string) {
    let sortByAux: { column: string; desc: boolean; };

    if (sortBy.column === column) {
      sortByAux = { ...sortBy, desc: !sortBy.desc };
    } else {
      sortByAux = { column, desc: true };
    }

    setSortBy(sortByAux);
    handleOrderRows(sortByAux, orderedAlarms);
  }

  function handleOrderRows(sortBy, rows: RowsAlarms) {
    const sortedParams = [...rows].sort((a, b) => {
      let columnA = a[sortBy.column];
      let columnB = b[sortBy.column];

      if (sortBy.column === 'ALARM_CODE') {
        return handleSortAlarmCode(Number(columnA), Number(columnB), sortBy);
      }
      if (sortBy.column === 'DATE') {
        columnA = columnA.dateInMinutes;
        columnB = columnB.dateInMinutes;
      }

      return handleOrderAux(columnA, columnB, sortBy);
    });

    setOrderedAlarms(sortedParams);
  }

  function handleCloseModal() {
    setShowModalOrderColumns(false);
  }

  function handleChangeColumns(columnId) {
    const toggleVisibility = (column) => ({
      ...column,
      visible: column.id === columnId ? !column.visible : column.visible,
    });

    const updatedColumns = controlColumns.map(toggleVisibility);
    setControlColumns(updatedColumns);

    const newColumnsData = updatedColumns.map((column) => {
      if (column.visible === true) {
        return columns.find((columnTable) => columnTable.accessor === column.id) ?? false;
      }
      return false;
    });

    setColumnsData(newColumnsData);

    return updatedColumns.some((column) => column.visible);
  }

  function handleActualAlarms(alarms, allAlarms) {
    const lastAlarmsAux = {
      alarm_1: alarms[0]?.ALARM_CODE ? Number(alarms[0]?.ALARM_CODE) : null,
      alarm_2: alarms[1]?.ALARM_CODE ? Number(alarms[1]?.ALARM_CODE) : null,
      alarm_3: alarms[2]?.ALARM_CODE ? Number(alarms[2]?.ALARM_CODE) : null,
      alarm_4: alarms[3]?.ALARM_CODE ? Number(alarms[3]?.ALARM_CODE) : null,
      alarm_5: alarms[4]?.ALARM_CODE ? Number(alarms[4]?.ALARM_CODE) : null,
    };

    const actualAlarms: RowsAlarms = [];

    for (const alarm of alarms) {
      const alarmInfo = allAlarms.find((x) => x.ALARM_CODE === alarm.ALARM_CODE);
      if (!alarmInfo) return;
      actualAlarms.push({
        ID: alarmInfo.ID,
        ALARM_CODE: alarmInfo.ALARM_CODE,
        DESCRIPTION: verifyAlarmRegistered(`alarm_${alarmInfo.ALARM_CODE}_description`),
        REASON_ALARM: verifyAlarmRegistered(`alarm_${alarmInfo.ALARM_CODE}_reason_alarm`),
        ACTION_TAKEN: verifyAlarmRegistered(`alarm_${alarmInfo.ALARM_CODE}_action_taken`),
        RESET_TYPE: verifyAlarmRegistered(`alarm_${alarmInfo.ALARM_CODE}_reset_type`),
        CAUSE: verifyAlarmRegistered(`alarm_${alarmInfo.ALARM_CODE}_cause`),
        DATE: {
          dateInMinutes: calculateDiffDatesInMinutes(alarm.START_DATE),
          datetime: alarm.START_DATE,
        },
      });
    }

    setAlarmsGenerated(actualAlarms);
    setLastAlarms(lastAlarmsAux);
    setOrderedAlarms(actualAlarms);
  }

  function handleSetColumnsData(newColumns) {
    setControlColumns(newColumns);

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

  return (
    <>
      <Card overflowHidden noPadding wrapperStyle={{ marginTop: '10px' }}>
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
            <BtnOrderColumns onClick={() => setShowModalOrderColumns(!showModalOrderColumns)}>
              <FilterColumnsIcon />
              {t('colunas')}
            </BtnOrderColumns>
          </Flex>
        </Flex>
        <HorizontalLine />
        {controlColumns.some((value) => value.visible === true) ? (
          <Table
            columns={columnsData.filter(Boolean)}
            data={orderedAlarms}
            noBorderBottom
            reduceWidth
            noDataComponent={NoDataInTable}
            style={{
              padding: '0px 10px',
              boxShadow: 'none',
              maxHeight: '300px',
              minHeight: '200px',
              overflowX: orderedAlarms.length ? 'auto' : 'hidden',
            }}
          />
        ) : (
          NoColumnsSelected()
        )}
      </Card>
      {showModalOrderColumns && (
        <ModalOrderColumns
          handleCancelModal={handleCloseModal}
          handleSubmitModal={handleCloseModal}
          columns={controlColumns}
          handleChangeColumns={handleChangeColumns}
          isDesktop={isDesktop.matches}
          handleDragColumn={(dragIndex, hoverIndex) => {
            setControlColumns((prevState) => reorderList(prevState, dragIndex, hoverIndex));
            setColumnsData((prevState) => reorderList(prevState, dragIndex, hoverIndex));
          }}
          handleResetColumns={(originalColumns) => handleSetColumnsData(originalColumns)}
        />
      )}
    </>
  );
}

function NoDataInTable() {
  return (
    <NoDataComponent>
      <AlarmIcon />
      <span style={{ fontSize: 13 }}><strong>{t('semAlarmesMax')}</strong></span>
      <span style={{ fontSize: 11, fontWeight: 500 }}>{t('naoHaAlarmesAtivos')}</span>
    </NoDataComponent>
  );
}

function ReturnLabelDate(value) {
  let formatedValue = value;
  let formatedText = '';
  const lastMinute = value === 1;
  const lessThanAMinute = value < 1;
  const moreThanHour = value >= 60;

  if (lessThanAMinute) {
    formatedText = t('haMenosDeUmMinuto');
  } else if (lastMinute) {
    formatedText = t('haUmMinuto');
  } else if (!lastMinute && !moreThanHour) {
    formatedText = t('haXMinutos', { minutos: formatedValue });
  } else {
    formatedValue = Math.floor(value / 60);
    formatedText = formatedValue === 1 ? t('ha1Hora') : t('haXHoras', { horas: formatedValue });
  }

  return (
    <div>
      {formatedText}
    </div>
  );
}
