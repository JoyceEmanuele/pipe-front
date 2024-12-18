import { useEffect } from 'react';
import moment from 'moment';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import i18n from '~/i18n';
import {
  Checkbox,
  Loader, Select,
} from 'components';
import {
  AxisInfo,
  ChartLineNumber,
  ChartLineSteps,
  fillDynamicValues,
  fillMaxMin,
  fillSteps,
} from 'helpers/axisCalc';
import { useStateVar } from 'helpers/useStateVar';
import { CalendarIcon } from 'icons';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';

import 'react-datepicker/dist/react-datepicker.css';
import { ChartLine, colorPalete } from '~/components/ChartRecharts';
import { LegendaGroup } from '~/components/ChartRecharts/Legenda';
import { parseCoolAutVarName } from '../IntegrRealTime/CoolAutomationRealTime';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';

export function CoolAutomationHist(props: { deviceId: string }): JSX.Element {
  const { t } = useTranslation();
  const routeParams = useParams<{ coolAutUnitId: string }>();
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const [state, render, setState] = useStateVar({
    loadingChart: true,
    loadingUnitsList: true,
    chartData: {
      x: [] as number[],
      vars: null as null|{
        id: string;
        name: string;
        unit?: string;
        y: (null|number)[];
        color: string;
        axisId: string;
        maxY?: null|number;
        minY?: null|number;
        y_orig?: (null|number|string)[];
        steps?: {
          y_orig: (null|number|string);
          y_chart: (null|number);
          label: string;
        }[];
        checked?: boolean;
      }[],
      axisInfo: {
        x: { domain: [0, 24] as [number, number] },
        y: {
          left: {
            domain: [-1, 50] as [number, number],
            ticks: [-1, 0, 50],
            ticksLabels: ['-1', '0', '50'],
          },
        },
      },
    },
    multiDays: false,
    numDays: 1 as number,
    focused: false,
    focusedInput: null as 'endDate'|'startDate'|null,
    dateStart: moment().subtract(1, 'days'),
    dateEnd: moment().subtract(1, 'days'),
    tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    deviceUnits: null as null|({ id: string, name: string }[]),
    selectedUnit: null as null|{ id: string, name: string },
  });

  const coolAutUnitId = (state.selectedUnit && state.selectedUnit.id) || routeParams.coolAutUnitId;

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        if (props.deviceId) {
          setState({ loadingUnitsList: true });
          const { list } = await apiCall('/coolautomation/get-device-units', { coolAutDeviceId: props.deviceId });
          state.deviceUnits = list;
        }
      } catch (err) { toast.error(t('houveErro')); console.error(err); }
      setState({ loadingUnitsList: false });
    });
  }, []);

  useEffect(() => {
    if (state.multiDays && state.focusedInput) return;
    const chartVars: (typeof state.chartData.vars) = [];
    const checkedBefore = (state.chartData.vars && state.chartData.vars.filter((line) => line.checked).map((line) => line.name)) || [];
    state.chartData.vars = null;
    Promise.resolve().then(async () => {
      try {
        if (state.dateStart && state.dateEnd && coolAutUnitId) {
          const d1 = new Date(`${moment(state.dateStart).format('YYYY-MM-DD')}T00:00:00Z`).getTime();
          const d2 = new Date(`${moment(state.dateEnd).format('YYYY-MM-DD')}T00:00:00Z`).getTime();
          const numDays = Math.round((d2 - d1) / 1000 / 60 / 60 / 24) + 1;
          if ((numDays >= 1) && (numDays <= 8)) { } // OK
          else {
            toast.error(t('erroPeriodo1a8'));
            return;
          }

          state.numDays = numDays;

          setState({ loadingChart: true });
          const { vars, commonX } = await apiCall('/coolautomation/get-unit-history', {
            coolAutUnitId,
            dayYMD: moment(state.dateStart).format('YYYY-MM-DD'),
            numDays,
          });
          const varsList = Object.values(vars);
          varsList.sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
          });
          const linesCont = [] as ChartLineNumber[];
          const linesDisc = [] as ChartLineSteps[];
          for (const row of varsList) {
            if (row.name.includes('Horímetro')) continue;
            if (row.name.includes('Partidas')) continue;
            if (row.name.includes('Umidade')) continue;
            if (row.name.includes('Status')) {
              const line: ChartLineSteps = {
                name: row.name,
                x: [], // not used
                y_orig: row.y.map((v) => ((v === 0) ? t('desligadoMinusculo') : (v === 2) ? t('ligadoMinusculo') : (v && String(v)))),
                y: row.y,
                steps: [],
              };
              fillSteps(line);
              linesDisc.push(line);
            } else {
              const line: ChartLineNumber = {
                name: row.name,
                x: [], // not used
                y: row.y,
                maxY: null,
                minY: null,
              };
              fillMaxMin(line);
              linesCont.push(line);
            }
          }
          const axisInfo: AxisInfo = { left: null };
          fillDynamicValues(axisInfo, linesCont, linesDisc);
          let nColor = 0;
          for (const line of [...linesCont, ...linesDisc]) {
            const { name, unit } = parseCoolAutVarName(line.name);
            chartVars.push({
              ...line,
              name,
              unit,
              color: colorPalete[nColor++ % colorPalete.length],
              axisId: 'left',
              id: line.name,
              checked: checkedBefore.includes(name),
            });
          }
          state.chartData.vars = chartVars;
          state.chartData.x = commonX;
          state.chartData.axisInfo.x.domain = [0, 24 * numDays];
          if (axisInfo.left) {
            // state.chartData.axisInfo.y.left.domain = axisInfo.left.range;
            state.chartData.axisInfo.y.left.domain = axisInfo.left.range;
            state.chartData.axisInfo.y.left.ticks = axisInfo.left.tickvals;
            state.chartData.axisInfo.y.left.ticksLabels = axisInfo.left.ticktext;
          }
        }
      } catch (err) { toast.error(t('houveErro')); console.error(err); }
      setState({ loadingChart: false });
    });
  }, [coolAutUnitId, state.dateStart, state.dateEnd, state.focusedInput]);

  function onMultidaysClick() {
    state.multiDays = !state.multiDays;
    if (!state.multiDays) {
      state.dateEnd = state.dateStart;
    }
    render();
  }

  function tooltipXLabelFormater(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(`${moment(state.dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dateFinal = `${dd}/${mm}`;

    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const min = Math.floor((Math.abs(hour) * 60) % 60);
    const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);

    return `${dateFinal} - ${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  function tickXLabelFormaterDay(hour: number) {
    const numDays = Math.floor(hour / 24);
    const date = new Date(`${moment(state.dateStart).add(numDays + 1, 'days').format('YYYY-MM-DD')}T00:00:00Z`);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');

    const dateFinal = `${dd}/${mm}`;
    return `${dateFinal}`;
  }

  function tickXLabelFormaterHour(hour: number) {
    const numDays = Math.floor(hour / 24);
    const sign = hour - 24 * numDays < 0 ? '-' : '';
    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const mm = Math.floor((Math.abs(hour) * 60) % 60);
    return `${'\n'} ${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  const renderQuarterTickHour = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value, offset } = payload;
    const date = new Date(value);
    const month = date.getMonth();
    const quarterNo = Math.floor(month / 3) + 1;

    return <text x={x} y={y - 4} textAnchor="middle" className="recharts-text">{`${tickXLabelFormaterHour(value)}`}</text>;
  };

  const loading = state.loadingChart || state.loadingUnitsList;

  return (
    <>
      {(loading) && <Loader />}
      {(!loading)
        && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            {(state.deviceUnits) && (
              <div style={{ maxWidth: '400px' }}>
                <Select
                  options={state.deviceUnits}
                  value={state.selectedUnit}
                  placeholder={t('unidade')}
                  propLabel="name"
                  onSelect={(opt) => setState({ selectedUnit: opt })}
                  notNull
                  style={{ minWidth: '200px', marginRight: '20px' }}
                />
              </div>
            )}
            <ContentDate>
              <DateLabel>{t('data')}</DateLabel>
              <br />
              {(!state.multiDays) && (
                <SingleDatePicker
                  disabled={loading}
                  date={state.dateStart}
                  onDateChange={(value) => setState({ dateStart: value, dateEnd: value })}
                  focused={state.focused}
                  onFocusChange={({ focused }) => setState({ focused })}
                  id="datepicker"
                  numberOfMonths={1}
                  isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                />
              )}
              {(state.multiDays) && (
                <DateRangePicker
                  disabled={loading}
                  startDate={state.dateStart} // momentPropTypes.momentObj or null,
                  startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                  endDate={state.dateEnd} // momentPropTypes.momentObj or null,
                  endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                  onDatesChange={({ startDate, endDate }) => { setState({ dateStart: startDate, dateEnd: startDate !== state.dateStart ? null : endDate }); }} // PropTypes.func.isRequired,
                  onFocusChange={(focused: 'endDate'|'startDate'|null) => setState({ focusedInput: focused })}
                  focusedInput={state.focusedInput}
                  noBorder
                  isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                />
              )}
              <StyledCalendarIcon color="#202370" />
            </ContentDate>
            <Checkbox
              checked={state.multiDays}
              onClick={onMultidaysClick}
              label={t('multiplosDias')}
              style={{ marginLeft: '20px' }}
            />
          </div>
          {(state.chartData.vars) && (
            <div style={{ display: 'flex' }}>
              <LegendaGroup
                style={{ minWidth: '250px', maxWidth: '450px' }}
                groups={[{ name: t('variaveis'), lines: state.chartData.vars }]}
                onCheckboxChanging={() => { render(); }}
                onColorChanging={(color, line) => { line.color = color.hex; render(); }}
              />
              <ChartLine
                commonX={state.chartData.x}
                varsInfo={state.chartData.vars.filter((line) => line.checked)}
                axisInfo={state.chartData.axisInfo}
                tooltipXLabelFormater={tooltipXLabelFormater}
                formaterXTick={state.numDays && state.numDays > 1 ? tickXLabelFormaterDay : tickXLabelFormaterHour}
                tickSecondX={renderQuarterTickHour}
                numDays={state.numDays}
              />
            </div>
          )}
        </div>
        )}
    </>
  );
}

const ContentDate = styled.div`
  position: relative;
  border: 1px solid ${colors.GreyLight};
  border-radius: 5px;
  min-height: 50px;
  .react-datepicker__month-text--keyboard-selected {
    background-color: ${colors.BlueSecondary};
  }
  .react-datepicker__triangle {
    left: -130px !important;
  }
  .react-datepicker__header {
    background-color: white;
    border-bottom: none;
  }
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
    border-bottom-color: white;
  }
  .react-datepicker-wrapper {
    display: block;
    .react-datepicker__input-container {
      input[type="text"] {
        border: none;
        font-size: 12px;
        outline: none;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: #464555;
      }
    }
  }
  .SingleDatePicker {
    display: block;
    position: initial;
  }
  .SingleDatePickerInput {
    display: block;
    position: relative;
    border: none;
    .DateInput {
      display: block;
      position: relative;
      width: 100%;
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: ${colors.Grey400};
        width: 100%;
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateRangePickerInput {
    .DateRangePickerInput_arrow {
      width: 60px;
    }
    .DateInput {
      .DateInput_input {
        outline: none;
        font-size: 12px;
        line-height: 19px;
        padding: 0px 40px 0px 14px;
        color: ${colors.Grey400};
      }
      .DateInput_input__focused {
        border: none;
      }
    }
  }
  .DateInput_fang {
    z-index: 1;
  }
  .SingleDatePicker_picker {
    width: 100%;
  }
  .CalendarDay__selected,
  .CalendarDay__selected:active {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
    color: ${colors.White};
  }
  .CalendarDay__selected:hover {
    background: ${colors.BlueSecondary};
    border: 1px double ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
  .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
    border-right: 33px solid ${colors.BlueSecondary};
  }
`;

const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 17px;
  right: 16px;
`;

const DateLabel = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;
// margin-left: 16px;
// color: ${colors.Grey300};

export default withTransaction('CoolAutomationHist', 'component')(CoolAutomationHist);
