import { Box, Grid } from '@material-ui/core';
import moment from 'moment';
import { Flex } from 'reflexbox';
import {
  Button, DateInput, Loader, Select,
} from '~/components';
import { Card } from '~/components/Card';
import { apiCall } from '~/providers';
import { AnalysisLayout } from '../AnalysisLayout';
import {
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  Line,
  Tooltip,
} from 'recharts';
import { useEffect, useRef, useState } from 'react';
import { CompiledEnergyData, compileEnergyData } from '~/helpers/energyData';
import { toast } from 'react-toastify';
import Checkbox from '@material-ui/core/Checkbox';
import {
  AddIcon, DeleteOutlineIcon, EnergyIcon, ExportWorksheetIcon, ReferenceIcon, ComparativeIcon,
} from 'icons';
import { colors } from 'styles/colors';
import { ActionButton, CustomInput, Label } from './styles';
import { QuickSelection } from '~/components/QuickSelection';
import { CSVLink } from 'react-csv';
import { ChangeColor } from '~/components/ChangeColor';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { UtilFilter } from '../Utilities/UtilityFilter';
import { useStateVar } from '~/helpers/useStateVar';

import { getUserProfile } from '~/helpers/userProfile';
import { withTransaction } from '@elastic/apm-rum-react';
import { formatNumberWithFractionDigits, thousandPointFormat } from '~/helpers/thousandFormatNumber';

interface IUnit {
  UNIT_ID: number;
  UNIT_NAME: string;
}

interface EnergyByMonth {
  month: string;
  monthInYear: string;
  totalMeasured: number;
}

export const Comparative = (): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const initialState = {
    units: [] as IUnit[],
    selectedTimeRange: 'Ano' as string,
    loading: false as boolean,
    showGraph: false as boolean,
    focused: false as boolean,
    timeRanges: ['Ano', 'Mês', 'Semana', 'Dia', 'Flexível'],
    graphColors: ['#92CC9A', '#363BC4', '#FF4C00', '#EC4CAC', '#FFBE16'],
    csvData: [] as any[],
    csvHeader: [] as {label: string, key: string}[],
    data: [
      {
        unit: {} as IUnit,
        date: {
          startDate: moment().startOf('year').format('YYYY-MM-DD') as string,
          endDate: moment().format('YYYY-MM-DD') as string,
        },
        energyData: {} as CompiledEnergyData,
        totalEnergy: 0 as number,
        totalEnergyPerMonth: [] as EnergyByMonth[],
        show: true,
        color: '#92CC9A',
      },
      {
        unit: {} as IUnit,
        date: {
          startDate: moment().startOf('year').format('YYYY-MM-DD') as string,
          endDate: moment().format('YYYY-MM-DD') as string,
        },
        energyData: {} as CompiledEnergyData,
        totalEnergy: 0 as number,
        totalEnergyPerMonth: [] as EnergyByMonth[],
        show: true,
        color: '#363BC4',
      },
    ],
  };
  const [state, render, setState] = useStateVar(() => {
    const state = initialState;
    return state;
  });
  const csvLinkEl = useRef();

  const [view, setView] = useState({
    byMonth: ['Ano', 'Últimos 12 meses'].includes(state.selectedTimeRange),
    byHour: ['Dia', 'Ontem', 'Hoje'].includes(state.selectedTimeRange),
    byDay: !['Dia', 'Ontem', 'Hoje', 'Ano', 'Últimos 12 meses'].includes(state.selectedTimeRange),
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData()
  {
    try {
      const { list } = await apiCall('/clients/get-units-with-energy-device', {
        INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
      });
      setState({ ...state, units: list });
    }
    catch {
      toast.error('Não foi possível obter as unidades');
    }
  }

  function cleanFields() {
    setState(initialState);
  }

  function addData() {
    const data = [...state.data];
    if (state.data.length < 5) {
      data.push({
        unit: {} as IUnit,
        date: {
          startDate: data[0].date.startDate as string,
          endDate: data[0].date.endDate as string,
        },
        energyData: {} as CompiledEnergyData,
        totalEnergy: 0 as number,
        totalEnergyPerMonth: [] as EnergyByMonth[],
        show: true,
        color: state.graphColors[state.data.length],
      });
      setState({ ...state, data });
    } }

  function deleteData(index) {
    const data = [...state.data];
    const newDate = data.filter((_item, i) => i !== index);
    setState({ ...state, data: newDate });
  }

  async function onHandleClick() {
    if (!state.data[0].unit.UNIT_ID || !state.data[1].unit.UNIT_ID) {
      toast.info('É necessário selecionar as unidades');
      return;
    }
    setState({ ...state, loading: true, showGraph: false });
    try {
      const reqParams = [] as {unit_id: number | undefined, start_time:string, end_time:string, params: string[]}[];
      const params = ['en_at_tri'];
      state.data.forEach((dataElement) => reqParams.push({
        unit_id: dataElement.unit.UNIT_ID,
        start_time: (`${moment(dataElement.date.startDate).format('YYYY-MM-DD')}T00:00:00`),
        end_time: (`${moment(dataElement.date.endDate).format('YYYY-MM-DD')}T23:59:59`),
        params,
      }));

      const requests = reqParams.map((reqParam) => apiCall('/energy/get-hist', reqParam));

      await Promise.all(requests)
        .then((responses) => {
          responses.forEach((response, index) => {
            const data = [...state.data];
            data[index].energyData = compileEnergyData(response, state.data[index].date.startDate, state.data[index].date.endDate, params);
            setState({ ...state, data });
          });
        });
      calculateTotalMeasured();
      setState({ ...state, loading: false, showGraph: true });
    } catch (err) {
      toast.error('Não foi possível obter os dados de energia das unidades');
      setState({ ...state, loading: false });
    }
  }

  const formatXAxis = (tick) => {
    if (view.byHour) {
      return `${tick}h `;
    }
    if (['Últimos 30 dias', 'Últimos 60 dias', 'Últimos 90 dias'].includes(state.selectedTimeRange)) {
      return `${moment(tick).format('DD')} `;
    }
    if (['Ano'].includes(state.selectedTimeRange)) {
      return moment(tick).format('MMM');
    }
    if (['Últimos 12 meses'].includes(state.selectedTimeRange)) {
      return tick;
    }
    if ((['Semana', 'Mês'].includes(state.selectedTimeRange))) {
      return tick;
    }
    if ((['Flexível'].includes(state.selectedTimeRange))) {
      return `${moment(state.data[0].date.startDate).add(tick - 1, 'days').format('DD/MM/YYYY')}`;
    }
    return `${moment(tick).format('DD/MM/YYYY')} `;
  };

  const formaterYAxis = (tick) => {
    if (tick > 10000) { return `${tick / 1000} MWh `; }
    return `${thousandPointFormat(tick)} kWh `;
  };

  function handleChangeSelectedTimeRange(selectedTime) {
    state.data.forEach((data) => {
      if (selectedTime === 'Mês') {
        data.date.startDate = moment().startOf('month').format('YYYY-MM-DD');
        data.date.endDate = moment().format('YYYY-MM-DD');
      }
      else if (selectedTime === 'Semana' || selectedTime === 'Flexível') {
        data.date.startDate = moment().startOf('week').format('YYYY-MM-DD');
        data.date.endDate = moment().format('YYYY-MM-DD');
      }
      else if (selectedTime === 'Ano') {
        data.date.startDate = moment().startOf('year').format('YYYY-MM-DD');
        data.date.endDate = moment().format('YYYY-MM-DD');
      }
      else if (selectedTime === 'Dia') {
        data.date.startDate = moment().format('YYYY-MM-DD');
        data.date.endDate = moment().format('YYYY-MM-DD');
      }
    });

    setState({ ...state, selectedTimeRange: selectedTime });
    setView({
      byMonth: ['Ano', 'Últimos 12 meses'].includes(selectedTime),
      byHour: ['Dia', 'Ontem', 'Hoje'].includes(selectedTime),
      byDay: !(['Dia', 'Ontem', 'Hoje', 'Ano', 'Últimos 12 meses'].includes(selectedTime)),
    });
  }
  function calculateEnergyConsumed(data, referData) {
    return (((data - referData) / referData) * 100);
  }

  function calculateTotalMeasuredByHour(data) {
    state.data.forEach((itemData, i) => {
      if (itemData.energyData.en_at_tri) {
        data[i].totalEnergy = itemData.energyData.en_at_tri[0].totalMeasured;
      }
    });
  }

  function calculateTotalMeasuredByMonth(data) {
    data.forEach((itemData, i) => {
      let sum = 0;
      if (itemData.energyData.en_at_tri) {
        itemData.energyData.en_at_tri.forEach((energyData) =>
        {
          sum += energyData.totalMeasured;
          const itemEnergyPerMonth = itemData.totalEnergyPerMonth.find((item) => item.month === `${energyData.day.split('-')[1]}/${energyData.day.split('-')[0]}`);
          if (itemEnergyPerMonth && itemEnergyPerMonth.totalMeasured !== undefined) {
            itemEnergyPerMonth.totalMeasured += energyData.totalMeasured;
          }
          if (!itemEnergyPerMonth) {
            itemData.totalEnergyPerMonth.push({
              month: `${energyData.day.split('-')[1]}/${energyData.day.split('-')[0]}`,
              monthInYear: `${moment(energyData.day)}`,
              totalMeasured: energyData.totalMeasured,
            });
          }
        });
      }
      data[i].totalEnergy = sum;
    });
  }

  function calculateTotalMeasuredByDay(data) {
    state.data.forEach((itemData, i) => {
      let sum = 0;
      if (itemData.energyData.en_at_tri) {
        itemData.energyData.en_at_tri.forEach((energyData) =>
        {
          sum += energyData.totalMeasured;
        });
      }
      data[i].totalEnergy = sum;
    });
  }

  function calculateTotalMeasured() {
    const data = [...state.data];

    if (view.byHour) {
      calculateTotalMeasuredByHour(data);
    }
    else if (view.byMonth) {
      calculateTotalMeasuredByMonth(data);
    }
    else {
      calculateTotalMeasuredByDay(data);
    }
    setState({ ...state, data });
  }

  function handleChangeDate(index, startDate, endDate) {
    const data = [...state.data];
    if (state.selectedTimeRange === 'Ano') {
      data[index].date.startDate = startDate.startOf('year').format('YYYY-MM-DD');
      data[index].date.endDate = endDate.endOf('year').format('YYYY-MM-DD') > moment().format('YYYY-MM-DD') ? moment().format('YYYY-MM-DD') : endDate.endOf('year').format('YYYY-MM-DD');
    }
    else if (state.selectedTimeRange === 'Mês') {
      data[index].date.startDate = startDate.startOf('month').format('YYYY-MM-DD');
      data[index].date.endDate = endDate.endOf('month').format('YYYY-MM-DD') > moment().format('YYYY-MM-DD') ? moment().format('YYYY-MM-DD') : endDate.endOf('month').format('YYYY-MM-DD');
    }
    else if (state.selectedTimeRange === 'Semana') {
      data[index].date.startDate = startDate.startOf('week').format('YYYY-MM-DD');
      data[index].date.endDate = startDate.endOf('week').format('YYYY-MM-DD') > moment().format('YYYY-MM-DD') ? moment().format('YYYY-MM-DD') : startDate.endOf('week').format('YYYY-MM-DD');
    }
    else if (state.selectedTimeRange === 'Dia') {
      data[index].date.startDate = startDate.format('YYYY-MM-DD');
      data[index].date.endDate = endDate.format('YYYY-MM-DD');
    }
    else if (state.selectedTimeRange === 'Flexível') {
      if (index === 0) {
        data[index].date.startDate = startDate.format('YYYY-MM-DD');
        data[index].date.endDate = endDate.format('YYYY-MM-DD');
      }
      else {
        const days = moment(data[0].date.endDate).diff(data[0].date.startDate, 'days');
        data[index].date.startDate = startDate.format('YYYY-MM-DD');
        data[index].date.endDate = moment(startDate).add(days, 'days').format('YYYY-MM-DD');
      }
    }
    setState({ ...state, data });
  }
  function quickHandleChangeData(startDate, endDate, timeSelected) {
    const data = [...state.data];
    data.forEach((itemData) => {
      itemData.date.startDate = startDate.format('YYYY-MM-DD');
      itemData.date.endDate = endDate.format('YYYY-MM-DD');
    });

    setState({ ...state, selectedTimeRange: timeSelected, data });
    setView({
      byMonth: ['Ano', 'Últimos 12 meses'].includes(timeSelected),
      byHour: ['Dia', 'Ontem', 'Hoje'].includes(timeSelected),
      byDay: !['Dia', 'Ontem', 'Hoje', 'Ano', 'Últimos 12 meses'].includes(timeSelected),
    });
  }

  function getCsvDataByDay(data, csvHeader, line, index) {
    data.energyData.en_at_tri.forEach((energyData) => {
      if (index === 0) csvHeader.push({ label: `${moment(energyData.day).format('DD/MM/YYYY')} (kWh)`, key: energyData.day });
      else {
        const findData = csvHeader.find((item) => item.key === energyData.day);
        if (!findData) csvHeader.push({ label: `${moment(energyData.day).format('DD/MM/YYYY')} (kWh)`, key: energyData.day });
      }
      line[energyData.day] = formatNumberWithFractionDigits(parseFloat(Math.abs(energyData.totalMeasured).toFixed(2)), { minimum: 2, maximum: 2 });
    });
  }

  function getCsvDataByMonth(data, csvHeader, line, index) {
    data.totalEnergyPerMonth.forEach((energyData: EnergyByMonth) => {
      if (index === 0) csvHeader.push({ label: `${energyData.month} (kWh)`, key: energyData.month });
      else {
        const findData = csvHeader.find((item) => item.key === energyData.month);
        if (!findData) csvHeader.push({ label: `${energyData.month} (kWh)`, key: energyData.month });
      }
      line[energyData.month] = formatNumberWithFractionDigits(parseFloat(Math.abs(energyData.totalMeasured).toFixed(2)), { minimum: 2, maximum: 2 });
    });
  }

  function getCsvDataByHour(data, csvHeader, line, index) {
    data.energyData.en_at_tri[0].hours.forEach((energyData) => {
      if (index === 0) csvHeader.push({ label: `${energyData.hour}:00 (kWh)`, key: energyData.hour });
      else {
        const findData = csvHeader.find((item) => item.key === energyData.hour);
        if (!findData) csvHeader.push({ label: `${energyData.hour}:00 (kWh)`, key: energyData.hour });
      }
      line[energyData.hour] = formatNumberWithFractionDigits(parseFloat(Math.abs(energyData.totalMeasured).toFixed(2)), { minimum: 2, maximum: 2 });
    });
  }

  function buildCsvLine(data, csvHeader, index) {
    const line:any = { UNIT_NAME: data.unit.UNIT_NAME };
    if (data.energyData.en_at_tri && view.byDay) {
      getCsvDataByDay(data, csvHeader, line, index);
    }
    else if (data.energyData.en_at_tri && view.byMonth) {
      getCsvDataByMonth(data, csvHeader, line, index);
    }
    else if (data.energyData.en_at_tri[0].hours && view.byHour) {
      getCsvDataByHour(data, csvHeader, line, index);
    }
    return line;
  }

  function getCsvData() {
    const csvData = [] as any[];
    const csvHeader = [{ label: 'Unidade', key: 'UNIT_NAME' }] as {label: string, key: string}[];
    if (!state.showGraph) {
      toast.info('É necessário realizar a comparação dos dados antes da exportação');
      return;
    }
    try {
      state.data.forEach((data, index) => {
        const line = buildCsvLine(data, csvHeader, index);
        csvData.push(line);
      });
      setState({ ...state, csvData, csvHeader });
      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);
    } catch {
      toast.error('Não foi possível exportar os dados');
    }
  }

  function getDataToChangeColor() {
    const list = [] as {color: string, description: string, index: number}[];
    state.data.forEach((item, i) => list.push({
      color: item.color,
      description: `${item.unit.UNIT_NAME} |  ${moment(item.date.startDate).format('DD MMM YYYY ')} -  ${moment(item.date.endDate).format('DD MMM YYYY ')}`,
      index: i,
    }));
    return list;
  }

  function setColor(color, index) {
    const data = [...state.data];
    data[index].color = color.hex;
    setState({ ...state, data });
  }

  function getFormattedDate(payload) {
    if (view.byHour) return `${payload.payload.hour}h`;
    if (view.byMonth) return payload.payload.month;
    return `${moment(payload.payload.day).format('DD/MM/YYYY')}`;
  }

  function parseEnergyConsumptionValue(value) {
    if (value > 10000) {
      return `${formatNumberWithFractionDigits(parseFloat(Math.abs(value / 1000).toFixed(2)), { minimum: 2, maximum: 2 })}MWh`;
    }
    return `${formatNumberWithFractionDigits(parseFloat(Math.abs(value).toFixed(2)), { minimum: 2, maximum: 2 })}kWh`;
  }

  const CustomizedToolTip = ({ payload }: any) => {
    if (payload?.length) {
      return (
        <div style={{
          width: payload.length > 1 ? '450px' : '350px',
          background: 'white',
          borderRadius: '5px',
          boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.05)',
          padding: '10px',
        }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <p style={{ fontWeight: 700 }}>Comparativo</p>
              <Box display="flex">
                <div style={{
                  width: '12px', height: '12px', background: payload[0].color, borderRadius: '2px',
                }}
                />
                <p style={{ fontSize: '12px', lineHeight: '12px', paddingLeft: '5px' }}>
                  {getFormattedDate(payload[0])}
                </p>
              </Box>
              <Box display="flex">
                <EnergyIcon color="#636363" />
                <p style={{ lineHeight: '13px', paddingLeft: '5px' }}>
                  {parseEnergyConsumptionValue(payload[0].value)}
                </p>
              </Box>
            </Grid>
            {payload.map((payloadItem, index) => (
              index !== 0
              && (
                <Grid item xs={6}>
                  <p style={{ fontWeight: 700, marginTop: '1px' }}>Referência</p>
                  <Box display="flex">
                    <div style={{
                      width: '12px', height: '12px', background: payloadItem.color, borderRadius: '2px',
                    }}
                    />
                    <p style={{ fontSize: '12px', lineHeight: '12px', paddingLeft: '5px' }}>
                      {getFormattedDate(payloadItem)}
                    </p>
                  </Box>
                  <Box display="flex" width="100%">
                    <EnergyIcon color="#636363" />
                    <p style={{ lineHeight: '13px', paddingLeft: '5px' }}>
                      {parseEnergyConsumptionValue(payloadItem.value)}
                    </p>
                    <PercentageComponent data={payloadItem.value} referData={payload[0].value} size="small" />
                  </Box>
                </Grid>
              )
            ))}
          </Grid>
        </div>
      );
    }
    return <div />;
  };

  function arrowConsumption(data, referData, size) {
    if (calculateEnergyConsumed(data, referData) > 0) {
      return (
        <div style={{
          width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '6px solid #FF0000', marginTop: size === 'small' ? '4px' : '0px', marginBottom: '5px', marginRight: '2px', marginLeft: '10px',
        }}
        />
      );
    }
    return (
      <div style={{
        width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #5AB365', marginTop: size === 'small' ? '4px' : '0px', marginBottom: '5px', marginRight: '2px', marginLeft: '10px',
      }}
      />
    );
  }

  const PercentageComponent = ({ data, referData, size }) => (
    <>
      {referData > 0 ? arrowConsumption(data, referData, size) : <></>}
      {size === 'small'
        ? (
          <p style={{
            color: calculateEnergyConsumed(data, referData) > 0 ? '#FF0000' : '#5AB365', fontWeight: 'bold', marginRight: '20px', lineHeight: '13px', fontSize: '12px',
          }}
          >
            {referData > 0 && ` ${formatNumberWithFractionDigits(parseFloat((Math.abs(calculateEnergyConsumed(data, referData))).toFixed(2)), { minimum: 2, maximum: 2 })}%`}
          </p>
        )
        : (
          <h3 style={{ color: calculateEnergyConsumed(data, referData) > 0 ? '#FF0000' : '#5AB365', fontWeight: 'bold', marginRight: '20px' }}>
            {referData > 0 && ` ${formatNumberWithFractionDigits(parseFloat((Math.abs(calculateEnergyConsumed(data, referData))).toFixed(2)), { minimum: 2, maximum: 2 })}%` }
          </h3>
        )}
    </>
  );

  function selectUnit(unitId) {
    const selectedUnit = state.units.filter((unit) => unit.UNIT_ID === unitId);
    return selectedUnit[0];
  }

  function getXAxisDataKey(selectedTimeRange) {
    const selectedTimeRangeView = {
      Ano: 'monthInYear',
      'Últimos 12 meses': 'month',
      Mês: 'dayInMonth',
      Semana: 'dayOfWeek',
      Flexível: 'dayNumber',
    };
    if (view.byHour) return 'hour';
    return selectedTimeRangeView[selectedTimeRange] || 'day';
  }

  function getBarDataKey() {
    if (view.byHour) {
      return state.data[0].energyData?.en_at_tri[0]?.hours;
    }
    if (view.byMonth) {
      return state.data[0].totalEnergyPerMonth;
    }
    return state.data[0].energyData?.en_at_tri;
  }
  const isDesktop = window.matchMedia('(min-width: 1039px)');
  const isMobile = !isDesktop.matches;
  return (
    <>
      <UtilFilter
        state={state}
        render={render}
        onAply={() => handleChangeSelectedTimeRange(state.selectedTimeRange)}
        exportFunc={getCsvData}
        setView={(timeSelected: string) => { setView({
          byMonth: ['Ano', 'Últimos 12 meses'].includes(timeSelected),
          byHour: ['Dia', 'Ontem', 'Hoje'].includes(timeSelected),
          byDay: !['Dia', 'Ontem', 'Hoje', 'Ano', 'Últimos 12 meses'].includes(timeSelected),
        }); }}
        listFilters={['analise', 'dados', 'periodo']}
        closeFilter
      />
      <Box width={isMobile ? '100%' : '70%'} paddingTop={5}>
        <Card noPadding>
          <Box padding={5}>
            <Box>
              <Box display="flex">
                <ReferenceIcon />
                <h4 style={{ marginLeft: '10px' }}>Referência</h4>
              </Box>
              <Box display="flex" flexWrap="wrap" mt={2} p={2.5} justifyContent="space-between" style={{ gap: '5px' }} mr={5}>
                <Box width={isMobile ? '100%' : '32%'}>
                  <CustomInput>
                    <div style={{ width: '100%', paddingTop: 3 }}>
                      <Label>Unidade</Label>
                      <SelectSearch
                        options={state.units.map((unit) => ({ value: unit.UNIT_ID, name: unit.UNIT_NAME }))}
                        value={state.data[0].unit.UNIT_ID?.toString() || ''}
                        closeOnSelect
                        printOptions="on-focus"
                        search
                        filterOptions={fuzzySearch}
                        placeholder="Unidade"
                        onChange={(value) => {
                          const data = [...state.data];
                          data[0].unit = selectUnit(value); setState({ ...state, data });
                        }}
                      />
                    </div>
                  </CustomInput>
                </Box>
                <Box width={isMobile ? '100%' : '35%'}>
                  <DateInput
                    timeRange={state.selectedTimeRange}
                    label="Data"
                    startDate={moment(state.data[0].date.startDate)}
                    endDate={moment(state.data[0].date.endDate)}
                    setDate={(startDate, endDate) => {
                      handleChangeDate(0, startDate, endDate);
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Box marginTop={2} paddingTop={2} borderTop="1px solid lightGray">
              <Box display="flex" alignItems="center">
                <ComparativeIcon />
                <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Comparativo</h4>
              </Box>
              {state.data.map((data, index) => (index !== 0
                && (
                <Box display="flex" flexWrap="wrap" border="1px solid lightGray" style={{ gap: '5px' }} borderRadius="5px" mt={2} p={2.5} justifyContent="space-between">
                  <Box width={isMobile ? '100%' : '30%'}>
                    <CustomInput>
                      <div style={{ width: '100%', paddingTop: 3 }}>
                        <Label>Unidade</Label>
                        <SelectSearch
                          options={state.units.map((unit) => ({ value: unit.UNIT_ID, name: unit.UNIT_NAME }))}
                          value={data.unit.UNIT_ID?.toString() || ''}
                          closeOnSelect
                          printOptions="on-focus"
                          search
                          filterOptions={fuzzySearch}
                          placeholder="Unidade"
                          onChange={(value) => {
                            const data = [...state.data];
                            data[index].unit = selectUnit(value); setState({ ...state, data });
                          }}
                        />
                      </div>
                    </CustomInput>
                  </Box>
                  <Box display="flex" width={isMobile ? '100%' : '48%'} justifyContent="end">
                    <Box width="70%">
                      <DateInput
                        timeRange={state.selectedTimeRange}
                        label="Data"
                        startDate={moment(data.date.startDate)}
                        endDate={moment(data.date.endDate)}
                        setDate={(startDate, endDate) => {
                          handleChangeDate(index, startDate, endDate);
                        }}
                      />
                    </Box>
                    <Box width="12%" height="100%" display="flex" justifyContent="center" alignItems="center">
                      {index > 1 && (
                      <ActionButton onClick={() => deleteData(index)}>
                        <DeleteOutlineIcon colors={colors.Red} />
                      </ActionButton>
                      )}
                    </Box>
                  </Box>
                </Box>
                )
              ))}
            </Box>
            <Box width="100%" display="flex" flexDirection="row-reverse" justifyContent="space-between" borderBottom="1px solid rgba(32, 35, 112, 0.2)" pb="20px">
              <Box width="150px" mt={2}>
                <Button
                  variant="primary"
                  onClick={onHandleClick}
                  disabled={state.loading}
                >
                  Comparar
                </Button>
              </Box>
              <Box
                width="36px"
                height="33px"
                display="flex"
                mt={2}
                onClick={addData}
                style={{
                  cursor: 'pointer', border: '1px solid lightGray', borderRadius: '8px', justifyContent: 'center', alignContent: 'center', alignItems: 'center', boxShadow: '0.8px 0.8px  rgba(71, 71, 71, 0.31)',
                }}
              >
                <AddIcon />
              </Box>
            </Box>

            <Flex
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
              mt={20}
              mb={20}
              flexDirection="column"
            >
              {state.loading && <Box marginBottom="20px"><Loader variant="primary" size="large" /></Box>}
              {state.showGraph
            && (
            <>
              <Box display="flex" width="100%" flexDirection="row-reverse" mb="20px">
                <ChangeColor data={getDataToChangeColor()} setColor={setColor} />
              </Box>
              <Box width={850} height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    width={850}
                    height={200}
                    data={state.data}
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 11,
                    }}
                  >
                    <XAxis
                      dataKey={getXAxisDataKey(state.selectedTimeRange)}
                      allowDuplicatedCategory={false}
                      tickFormatter={formatXAxis}
                      allowDataOverflow
                    />
                    <YAxis
                      dataKey="totalMeasured"
                      tickFormatter={formaterYAxis}
                      tick={{ width: 75 }}
                    />
                    {state.data[0].show && state.data[0].energyData.en_at_tri && (
                    <Bar
                      data={getBarDataKey()}
                      barSize={20}
                      fill={state.data[0].color}
                      radius={[4, 4, 0, 0]}
                      dataKey="totalMeasured"
                    />
                    )}
                    { state.data.map((data, index) => (
                      index !== 0
                    && data.show && data.energyData.en_at_tri && (
                    <Line
                      data={view.byHour ? data.energyData?.en_at_tri[0]?.hours : view.byMonth ? data.totalEnergyPerMonth : data.energyData?.en_at_tri}
                      dataKey="totalMeasured"
                      stroke={data.color}
                      dot={false}
                      strokeWidth={2}
                      type="monotone"
                    />
                      )
                    ))}
                    <CartesianGrid strokeDasharray="2 2" />
                    <Tooltip content={<CustomizedToolTip />} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </>
            )}
            </Flex>
          </Box>
          <>
            {state.showGraph && (
            <Box>
              <Box display="flex" borderTop="1px solid lightGray" pl={5} pr={7} pt={3} pb={1} justifyContent="space-between">
                <Box display="flex" height="10px" justifyContent="center">
                  <h4 style={{ fontWeight: 'bold', marginRight: '10px' }}>Referência: </h4>
                  <Checkbox
                    style={{ color: state.data[0].color, backgroundColor: 'transparent' }}
                    disableRipple
                    size="small"
                    checked={state.data[0].show}
                    onClick={
                      () => { const data = [...state.data];
                        data[0].show = !data[0].show;
                        setState({ ...state, data }); }
                    }
                  />
                  <p style={{ fontWeight: '600', color: '#525252' }}>{` ${state.data[0].unit.UNIT_NAME} | ${moment(state.data[0].date.startDate).format('DD MMM YYYY ')} - ${moment(state.data[0].date.endDate).format('DD MMM YYYY ')}`}</p>
                </Box>
                {state.data[0].totalEnergy > 10000 ? (
                  <Box display="flex">
                    <h3 style={{ fontWeight: 'bold' }}>
                      {` ${formatNumberWithFractionDigits(parseFloat((Math.abs(state.data[0].totalEnergy / 1000)).toFixed(2)), { minimum: 2, maximum: 2 })}`}
                    </h3>
                    <h3 style={{ fontWeight: '400', marginLeft: '3px' }}> MWh</h3>
                  </Box>
                ) : (
                  <Box display="flex">
                    <h3 style={{ fontWeight: 'bold' }}>
                      {` ${formatNumberWithFractionDigits(parseFloat((Math.abs(state.data[0].totalEnergy)).toFixed(2)), { minimum: 2, maximum: 2 })}`}
                    </h3>
                    <h3 style={{ fontWeight: '400', marginLeft: '3px' }}> kWh</h3>
                  </Box>
                ) }

              </Box>
              {state.data.map((data, index) => (
                index !== 0
                && data.energyData.en_at_tri
                && (
                <Box display="flex" borderTop="1px solid lightGray" pl={5} pr={7} pt={3} pb={1} justifyContent="space-between">
                  <Box display="flex" height="10px" justifyContent="center">
                    <h4 style={{ fontWeight: 'bold', marginRight: '10px' }}>Comparativo:</h4>
                    <Checkbox
                      style={{ color: data.color, backgroundColor: 'transparent' }}
                      disableRipple
                      size="small"
                      checked={data.show}
                      onClick={
                        () => { const data = [...state.data];
                          data[index].show = !data[index].show;
                          setState({ ...state, data }); }
                      }
                    />
                    <p style={{ fontWeight: '600', color: '#525252' }}>{` ${data.unit.UNIT_NAME} |  ${moment(data.date.startDate).format('DD MMM YYYY ')} -  ${moment(data.date.endDate).format('DD MMM YYYY ')}`}</p>
                  </Box>
                  {data.totalEnergy > 10000 ? (
                    <Box display="flex" alignItems="center" justifyContent="end">
                      <PercentageComponent data={data.totalEnergy} referData={state.data[0].totalEnergy} size="large" />
                      <h3 style={{ fontWeight: 'bold' }}>
                        {` ${formatNumberWithFractionDigits(parseFloat((Math.abs(data.totalEnergy / 1000)).toFixed(2)), { minimum: 2, maximum: 2 })}`}
                      </h3>
                      <h3 style={{ fontWeight: '400', marginLeft: '3px' }}> MWh</h3>
                    </Box>
                  )
                    : (
                      <Box display="flex" alignItems="center" justifyContent="end">
                        <PercentageComponent data={data.totalEnergy} referData={state.data[0].totalEnergy} size="large" />
                        <h3 style={{ fontWeight: 'bold' }}>
                          {` ${formatNumberWithFractionDigits(parseFloat((Math.abs(data.totalEnergy)).toFixed(2)), { minimum: 2, maximum: 2 })}`}
                        </h3>
                        <h3 style={{ fontWeight: '400', marginLeft: '3px' }}> kWh</h3>
                      </Box>
                    )}
                </Box>
                )
              ))}
            </Box>
            )}
          </>
        </Card>
        <Box display="flex" width="100%" justifyContent="space-between" marginTop="20px">
          <Box
            onClick={cleanFields}
            ml="5px"
            style={{
              color: '#363BC4', textDecorationLine: 'underline', cursor: 'pointer', fontWeight: '500', fontSize: '13px',
            }}
          >
            Limpar Campos
          </Box>
          <Box display="flex" justifyContent="center" flexDirection="row" alignItems="center" textAlign="center" width="154px" height="31px" style={{ cursor: 'pointer', border: '0.8px solid rgba(80, 80, 80, 0.31)', borderRadius: '10px' }}>
            <ExportWorksheetIcon color="#363BC4" />
            <div style={{ paddingLeft: '8px', lineHeight: '20px', fontSize: '13px' }} onClick={getCsvData}>Exportar Planilha</div>
            <CSVLink
              headers={state.csvHeader}
              data={state.csvData}
              filename="Energia.csv"
              separator=";"
              asyncOnClick
              enclosingCharacter={"'"}
              ref={csvLinkEl}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default withTransaction('Comparative', 'component')(Comparative);
