import { useEffect, useRef } from 'react';
import { t } from 'i18next';
import ptBR from 'date-fns/locale/pt-BR';
import { useStateVar } from '~/helpers/useStateVar';
import { Flex, Box } from 'reflexbox';
import moment from 'moment';
import DatePicker, { registerLocale } from 'react-datepicker';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import i18n from '~/i18n';
import {
  ModalWindow,
  Select,
  RadioButton,
  Loader,
} from '~/components';
import {
  ExpandIcon,
  ExportPdfIcon,
} from '~/icons';
import {
  ContentDate,
  StyledCalendarIcon,
  Label,
  ArrowButton,
  ExportButton,
  IconWrapper,
} from './styles';
import { colors } from '~/styles/colors';

registerLocale('pt-BR', ptBR);

export const DataExportModal = (props: {
  isLoading: boolean,
  closeExportModal: () => void,
  selectedTimeRange: string,
  date: moment.Moment,
  dateList: {
    mdate: moment.Moment,
    YMD: string,
    DMY: string,
    totalGreenAntCons: number,
    totalGreenAntInvoice: number,
    totalAirCondCons: number,
    savings_kWh: number,
  }[];
  startDate: moment.Moment,
  endDate: moment.Moment,
  monthDate: Date,
  handleExport: (newPeriodParams, exportType: string, info?: string) => Promise<void>
}): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const [state, render, setState] = useStateVar(() => ({
    isLoading: false,
    selectedTimeRange: props.selectedTimeRange,
    date: props.date,
    dateList: props.dateList,
    startDate: props.startDate,
    endDate: props.endDate,
    monthDate: props.monthDate,
    focused: false,
    focusedInput: false,
    exportType: t('fatura'),
    energyMeterDataType: t('consumo'),
  }));

  function getDatesList(date: moment.Moment, numDays: number) {
    const dateList = [] as {
      mdate: moment.Moment,
      YMD: string,
      DMY: string,
      totalGreenAntCons: number,
      totalGreenAntInvoice: number,
      totalAirCondCons: number,
      savings_kWh: number,
    }[];

    for (let i = 0; i < numDays; i++) {
      const mdate = moment(date).add(i, 'days');
      dateList.push({
        mdate,
        DMY: mdate.format('DD/MM/YYYY'),
        YMD: mdate.format('YYYY-MM-DD'),
        totalGreenAntCons: 0,
        totalGreenAntInvoice: 0,
        totalAirCondCons: 0,
        savings_kWh: 0,
      });
    }

    return dateList;
  }

  function onRangeTypeChange(e) {
    if (e === t('semana')) {
      state.selectedTimeRange = t('semana');
      state.dateList = getDatesList(state.date, 7);
    } else if (e === t('dia')) {
      state.selectedTimeRange = t('dia');
      state.dateList = getDatesList(state.date, 1);
    } else if (e === t('flexivel')) {
      state.selectedTimeRange = t('flexivel');
      state.dateList = getDatesList(state.startDate, state.endDate.diff(state.startDate, 'days') + 1);
    } else if (e === t('mes')) {
      state.selectedTimeRange = t('mes');
      state.dateList = getDatesList(moment(state.monthDate), new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate());
    }

    render();
  }

  function onDateChange(date, dateEnd) {
    if (state.selectedTimeRange === t('semana')) {
      state.date = date;
      render();
      state.dateList = getDatesList(date, 7);
    } else if (state.selectedTimeRange === t('dia')) {
      state.date = date;
      render();
      state.dateList = getDatesList(date, 1);
    } else if (state.selectedTimeRange === t('flexivel')) {
      state.startDate = date;
      state.endDate = dateEnd;
      dateEnd.set({
        hour: 12, minute: 0, second: 0, millisecond: 0,
      });
      state.dateList = getDatesList(date, dateEnd.diff(date, 'days') + 1);
    } else if (state.selectedTimeRange === t('mes')) {
      state.monthDate = date;
      state.dateList = getDatesList(moment(date), new Date(moment(date).year(), moment(date).month() + 1, 0).getDate());
    }

    render();
  }

  function alterDate(type: 'next' | 'previous') {
    let newDate;
    if (state.selectedTimeRange === t('mes')) {
      newDate = type === 'next' ? new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() + 1, 1) : new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() - 1, 1);
    }
    if (state.selectedTimeRange === t('semana')) {
      newDate = type === 'next' ? moment(state.date).add(7, 'days') : moment(state.date).subtract(7, 'days');
    }
    if (state.selectedTimeRange === t('dia')) {
      newDate = type === 'next' ? moment(state.date).add(1, 'days') : moment(state.date).subtract(1, 'days');
    }
    if (newDate) onDateChange(newDate, newDate);
  }

  async function handleExport() {
    const periodParams = [state.selectedTimeRange, state.monthDate, state.startDate, state.endDate, state.dateList];

    if (state.exportType === t('medidorEnergia')) {
      await props.handleExport(periodParams, state.exportType, state.energyMeterDataType);
    } else {
      await props.handleExport(periodParams, state.exportType);
    }

    if (props.isLoading === false) props.closeExportModal();
  }

  return (
    <ModalWindow borderTop onClickOutside={props.closeExportModal} style={{ width: '50%', height: '65%' }}>
      {props.isLoading ? <Loader /> : (
        <div style={{ padding: '6% 8%' }}>
          <Flex flexDirection="column">
            <p style={{ fontWeight: 'bold' }}>{t('periodo')}</p>
            <Flex alignItems="center" flexWrap="wrap">
              <Box width={[1, 1, 1, 1, 1, 1 / 12]} marginRight="20px" minWidth="125px">
                <Select
                  options={[t('dia'), t('semana'), t('mes'), t('flexivel')]}
                  onSelect={onRangeTypeChange}
                  value={state.selectedTimeRange}
                  placeholder={t('periodo')}
                  hideSelected
                  disabled={state.isLoading}
                />
              </Box>
              {state.selectedTimeRange !== t('flexivel') && (
                <ArrowButton orientation="left" onClick={() => alterDate('previous')}>
                  <ExpandIcon color={state.isLoading ? colors.Grey200 : colors.Blue700} style={{ rotate: '90deg' }} />
                </ArrowButton>
              )}

              <Box width="fit-content" margin="0px -5px" mt={[16, 16, 16, 16, 16, 0]}>
                {(state.selectedTimeRange === t('dia') || state.selectedTimeRange === t('semana')) && (
                  <ContentDate style={{ borderRight: '0px', borderLeft: '0px' }}>
                    <Label>{t('data')}</Label>
                    <SingleDatePicker
                      disabled={state.isLoading}
                      date={state.date}
                      onDateChange={onDateChange}
                      focused={state.focused}
                      onFocusChange={({ focused }) => { state.focused = focused; render(); }}
                      id="datepicker"
                      numberOfMonths={1}
                      isOutsideRange={(d) => !d.isBefore(moment())}
                    />
                    <StyledCalendarIcon color="#202370" />
                  </ContentDate>
                )}
                {state.selectedTimeRange === t('flexivel') && (
                  <ContentDate style={{ borderRight: '0px', borderLeft: '0px' }}>
                    <Label>{t('data')}</Label>
                    <br />
                    <DateRangePicker
                      disabled={state.isLoading}
                      startDate={state.startDate}
                      startDateId="your_unique_start_date_id"
                      endDate={state.endDate}
                      endDateId="your_unique_end_date_id"
                      onDatesChange={({ startDate, endDate }) => onDateChange(startDate, endDate)}
                      onFocusChange={(focused) => { state.focusedInput = focused; render(); }}
                      focusedInput={state.focusedInput}
                      noBorder
                      isOutsideRange={() => false}
                    />
                    <StyledCalendarIcon color="#202370" />
                  </ContentDate>
                )}
                {(state.selectedTimeRange === t('mes')) && (
                  <ContentDate style={{ borderRight: '0px', borderLeft: '0px' }}>
                    <Label>{t('data')}</Label>
                    <DatePicker
                      disabled={state.isLoading}
                      selected={state.monthDate}
                      onChange={onDateChange}
                      dateFormat="MMM yyyy"
                      locale={t('data') === 'Data' ? 'pt-BR' : 'en'}
                      showMonthYearPicker
                    />
                    <StyledCalendarIcon color="#202370" />
                  </ContentDate>
                )}
              </Box>
              {state.selectedTimeRange !== t('flexivel') && (
                <ArrowButton orientation="right" onClick={() => alterDate('next')}>
                  <ExpandIcon color={state.isLoading ? colors.Grey200 : colors.Blue700} style={{ rotate: '270deg' }} />
                </ArrowButton>
              )}
            </Flex>
          </Flex>

          <Flex flexWrap="wrap" marginTop="25px">
            <Flex flexDirection="column" style={{ width: '50%' }}>
              <p style={{ fontWeight: 'bold' }}>{t('informacoes')}</p>
              <Box width={[1, 1, 1, 1, 1, 1 / 12]} minWidth="200px">
                <Select
                  options={[t('fatura'), t('medidorEnergia'), t('maquinas')]}
                  onSelect={(e) => setState({ exportType: e })}
                  value={state.exportType}
                  placeholder={t('exportar')}
                  hideSelected
                  disabled={state.isLoading}
                />
              </Box>
            </Flex>

            {state.exportType === t('medidorEnergia') && (
              <Flex flexDirection="column" style={{ width: '50%' }}>
                <p style={{ fontWeight: 'bold' }}>{t('dados')}</p>
                <Box width={[1, 1, 1, 1, 1, 1 / 12]} minWidth="150px">
                  <RadioButton label={t('consumo')} checked={state.energyMeterDataType === t('consumo')} onClick={() => setState({ energyMeterDataType: t('consumo') })} style={{ fontSize: '12px' }} />
                  <RadioButton label={t('todosOsDados')} checked={state.energyMeterDataType === t('todosOsDados')} onClick={() => setState({ energyMeterDataType: t('todosOsDados') })} style={{ fontSize: '12px' }} />
                </Box>
              </Flex>
            )}
          </Flex>

          <Flex flexDirection="column" alignItems="center" marginTop="18%">
            <ExportButton variant={state.isLoading ? 'disabled' : 'primary'} style={{ width: '100%' }} onClick={handleExport} hover>
              <div>
                <IconWrapper>
                  <ExportPdfIcon />
                </IconWrapper>
                <span>{t('exportarDados')}</span>
              </div>
            </ExportButton>

            <span
              style={{ color: colors.BlueSecondary, textDecoration: 'underline', marginTop: '20px' }}
              onClick={props.closeExportModal}
            >
              {t('cancelar')}
            </span>
          </Flex>
        </div>
      )}
    </ModalWindow>
  );
};
