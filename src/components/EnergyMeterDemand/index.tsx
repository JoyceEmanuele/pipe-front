import { Dispatch, SetStateAction, useEffect } from 'react';
import { t } from 'i18next';

import { Flex, Box } from 'reflexbox';

import {
  Card,
  DemandChart,
  Button,
} from '..';
import moment from 'moment';
import { useStateVar } from '../../helpers/useStateVar';
import { ToggleSwitchMini } from '../ToggleSwitch';
import { IEnergyMeter, IMeterDemand } from '../../pages/Analysis/Units/EnergyEfficiency';

export const EnergyMeterDemand = (props: {
  unitId: number
  maxWidth?: null;
  marginLeft?: number;
  marginRight?: number;
  minHeight?: null | number;
  // isLoading?: boolean;
  maxTotalDemandMeasured: number,
  yPointsTotalMeasured: number[];
  filterMode: string,
  dateList: { mdate: moment.Moment }[],
  energyMetersList: IEnergyMeter[],
  demandsByMeter: {
    [key: string] : IMeterDemand[]
  };
  metersTotalDemand: IMeterDemand[],
  maxTotalDemandMeasuredAllMeters: number,
  yPointsDemandTotalMeasuredAllMeters: number[],
  selectedEnergyMeters: string[],
  shouldShowConsumptionByMeter: boolean
  setShouldShowConsumptionByMeter: Dispatch<SetStateAction<boolean>>
  selectedDay: null | undefined | IMeterDemand;
  setSelectedDay: Dispatch<SetStateAction< null | undefined | IMeterDemand>>
  selectedDayMeter: string;
  setSelectedDayMeter: Dispatch<SetStateAction<string>>;
  selectedDayMeterStr: string;
  setSelectedDayMeterStr: Dispatch<SetStateAction<string>>;
  totalConsumptionPeriod?: {
    totalKwh: number,
    totalCost: number,
    calc: boolean,
  };
  handleGetTelemetryMonth: () => void,
  handleGetTelemetryDay: (day: string) => void
}): JSX.Element => {
  const monthNames = [t('mesesDoAno.janeiro'), t('mesesDoAno.fevereiro'), t('mesesDoAno.marco'), t('mesesDoAno.abril'), t('mesesDoAno.maio'), t('mesesDoAno.junho'), t('mesesDoAno.julho'), t('mesesDoAno.agosto'), t('mesesDoAno.setembro'), t('mesesDoAno.outubro'), t('mesesDoAno.novembro'), t('mesesDoAno.dezembro')];
  const {
    unitId,
    maxWidth,
    marginLeft,
    marginRight,
    energyMetersList,
    selectedDay,
    setSelectedDay,
    selectedDayMeter,
    setSelectedDayMeter,
    selectedDayMeterStr,
    setSelectedDayMeterStr,
  } = props;
  const [state, _render, setState] = useStateVar(() => ({
    chartMode: 'month',
  }));

  useEffect(() => {
    setState({ chartMode: 'month' });
  }, [props.filterMode]);

  function changeChartMode(mode?: string, selectedDay?: IMeterDemand) {
    if (state.chartMode === 'day' && props.filterMode === t('dia')) return;
    if (state.chartMode === 'month' && props.filterMode === t('mes')) return;

    if (mode) {
      setState({ chartMode: mode });
      setSelectedDay(selectedDay);

      return;
    }
    if (state.chartMode === 'day' && props.filterMode !== t('dia')) {
      setState({ chartMode: 'month', selectedDay });
      setSelectedDay(selectedDay);
    }
  }

  function getRefPeriod() {
    if (props.filterMode === t('mes') && state.chartMode === 'month') {
      const month = props.dateList[0].mdate.month();
      const year = props.dateList[0].mdate.year();
      return `${monthNames[month]} ${year}`;
    }
    if ((props.filterMode === t('semana') || props.filterMode === t('flexivel')) && state.chartMode === 'month') {
      const firstDay = props.dateList[0].mdate.format('DD/MM/YYYY');
      const lastDay = props.dateList[props.dateList.length - 1].mdate.format('DD/MM/YYYY');
      return `${firstDay} a ${lastDay}`;
    }
    if (props.filterMode === t('dia')) {
      return props.dateList[0].mdate.format('DD/MM/YYYY');
    }
    if (state.chartMode === 'day') {
      return moment(selectedDay?.day).format('DD/MM/YYYY');
    }
    return null;
  }

  return (
    <Box width={[1, 1, 1, 1, 25 / 51, 1]} mb={40} ml={marginLeft} mr={marginRight} style={{ maxWidth: maxWidth || 'none' }}>
      <Card>

        <Flex flexWrap="wrap" alignItems="center" mt={15}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{t('consumo')}</div>
          {state.chartMode === 'day' && (
          <Button
            variant="borderblue"
            style={{
              width: 'fit-content', padding: '2px 15px', marginLeft: '20px', fontSize: '12px',
            }}
            onClick={() => {
              props.handleGetTelemetryMonth();
              changeChartMode();
            }}
          >
            {t('voltar')}
          </Button>
          )}
          {(state.chartMode === 'month' && energyMetersList && energyMetersList.length > 1) && (
          <div style={{ marginLeft: '25px' }}>
            <span style={{ fontSize: '14px' }}>{t('consumoTotal')}</span>
            <ToggleSwitchMini
              checked={(energyMetersList.length > 1) ? props.shouldShowConsumptionByMeter : !props.shouldShowConsumptionByMeter}
              onClick={() => props.setShouldShowConsumptionByMeter(!props.shouldShowConsumptionByMeter)}
              style={{ marginLeft: '10px', marginRight: '10px' }}
            />
            <span style={{ fontSize: '14px' }}>{t('consumoPorMedidor')}</span>
          </div>
          ) }
          <div style={{ marginLeft: 'auto', fontWeight: 500 }}>
            {getRefPeriod()}
          </div>
        </Flex>

        <DemandChart
          unitId={unitId}
          maxTotalDemandMeasured={props.maxTotalDemandMeasured}
          yPointsTotalMeasured={props.yPointsTotalMeasured}
          isReduced={false}
          measurementUnit="Wh"
          chartMode={state.chartMode}
          filterMode={props.filterMode}
          changeChartMode={changeChartMode}
          dateList={props.dateList}
          demandsByMeter={props.demandsByMeter}
          energyMetersList={props.energyMetersList}
          metersTotalDemand={props.metersTotalDemand}
          maxTotalDemandMeasuredAllMeters={props.maxTotalDemandMeasuredAllMeters}
          yPointsDemandTotalMeasuredAllMeters={props.yPointsDemandTotalMeasuredAllMeters}
          shouldShowConsumptionByMeter={props.shouldShowConsumptionByMeter}
          selectedEnergyMeters={props.selectedEnergyMeters}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedDayMeter={selectedDayMeter}
          setSelectedDayMeter={setSelectedDayMeter}
          selectedDayMeterStr={selectedDayMeterStr}
          setSelectedDayMeterStr={setSelectedDayMeterStr}
          totalConsumptionPeriod={props.totalConsumptionPeriod}
          handleGetTelemetryDay={props.handleGetTelemetryDay}
        />

      </Card>
    </Box>
  );
};
