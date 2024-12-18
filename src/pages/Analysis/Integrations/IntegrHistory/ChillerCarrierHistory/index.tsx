import { useEffect, useRef, useState } from 'react';
import {
  StyledItem,
  StyledList,
  Wrapper,
  Content,
  StyledLine,
  StyledLabel,
  MenuFixedContainer,
} from './components/styles';
import { t } from 'i18next';
import { Select } from '~/components';
import { AlarmsHistory } from './components/AlarmsHistory';
import { Box, Flex } from 'reflexbox';
import moment, { Moment } from 'moment';
import { ContentDate, Label, StyledCalendarIcon } from '../styles';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import DatePicker from 'react-datepicker';
import { BtnOrderColumns } from '../../IntegrRealTime/DriChillerCarrierRealTime/components/styles';
import { toast } from 'react-toastify';
import { apiCallDownload } from '~/providers';
import { ExportIcon } from '~/icons';
import { useStateVar } from '~/helpers/useStateVar';
import { QuickSelection } from '~/components/QuickSelection';
import { ChillerParameters } from './components/ChillerParameters';

export default function ChillerCarrierHistory(props: { driId: string, model: string, chillerModel?: string }): JSX.Element {
  const [focus, setFocus] = useState({
    focused: false,
    focusedInput: null,
  });
  const [sortBy, setSortBy] = useState({ column: '', desc: false });
  const [state, render, setState] = useStateVar({
    selectedFilterAlarms: [] as {column: string, values: string[]}[],
    startDate: null as Moment | null,
    endDate: null as Moment | null,
    selectedTimeRange: null as string|null,
    paramsHistorySelected: true,
    exportAlarmHistoryColumns: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  function handleDateChange(date: moment.Moment, selectedTimeRangeAux?: string) {
    let startDate: null | string = null;
    let endDate: null | string = null;
    const timeRange = selectedTimeRangeAux || state.selectedTimeRange;
    switch (timeRange) {
      case t('dia'): {
        startDate = date.format('YYYY-MM-DD');
        endDate = date.format('YYYY-MM-DD');
        break;
      }
      case t('mes'): {
        startDate = date.startOf('month').format('YYYY-MM-DD');
        endDate = date.endOf('month').format('YYYY-MM-DD');
        break;
      }
      case t('ano'): {
        startDate = date.startOf('year').format('YYYY-MM-DD');
        endDate = date.endOf('year').format('YYYY-MM-DD');
        break;
      }
      default: {
        break;
      }
    }
    setState({ startDate: startDate ? moment(startDate) : null, endDate: endDate ? moment(endDate) : null });
    render();
  }

  async function handleExport() {
    if (!state.startDate || !state.endDate) {
      return toast.warn(t('selecioneAlgumPeriodoExportar'));
    }

    if (state.paramsHistorySelected) {
      toast.warn(t('erroNaoImplementado'));
    } else {
      await handleExportAlarms(state.startDate, state.endDate);
    }
  }

  async function handleExportAlarms(startDate: Moment, endDate: Moment) {
    try {
      setIsLoading(true);
      const exportResponse = await apiCallDownload('/dri/export-chiller-alarms-hist', {
        DEVICE_CODE: props.driId,
        START_DATE: startDate.format('YYYY-MM-DD'),
        END_DATE: endDate.format('YYYY-MM-DD'),
        ORDER_BY: {
          column: sortBy.column,
          desc: sortBy.desc,
        },
        filterBy: state.selectedFilterAlarms,
        columnsToExport: state.exportAlarmHistoryColumns,
      });

      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || `${t('nomeArquivoHistoricoAlarmesChiller')}.xlsx`;
      link.click();

      toast.success(t('sucessoExportacao'));
    } catch (error) {
      console.log(error);
      toast.error(t('naoFoiPossivelExportar'));
    } finally {
      setIsLoading(false);
    }
  }

  function handleChangeQuickDates(startDate: Moment, endDate: Moment) {
    if (startDate.format('YYYY-MM-DD') === endDate.format('YYYY-MM-DD')) {
      state.selectedTimeRange = t('dia');
    } else {
      state.selectedTimeRange = t('flexivel');
    }

    state.startDate = startDate;
    state.endDate = endDate;
    render();
  }

  function returnOptions() {
    if (state.paramsHistorySelected) {
      return [t('flexivel')];
    }
    return [t('dia'), t('mes'), t('flexivel'), t('ano')];
  }

  useEffect(() => {
    setState({ startDate: null, endDate: null, selectedTimeRange: null });
  }, [state.paramsHistorySelected]);

  return (
    <>
      <Wrapper>
        <Content>
          <StyledList>
            <StyledItem>
              <StyledLabel isActive={state.paramsHistorySelected} onClick={() => { setState({ paramsHistorySelected: true }); render(); }}>{t('parametros')}</StyledLabel>
              <StyledLine isActive={state.paramsHistorySelected} />
            </StyledItem>
            {!props.model?.startsWith('chiller-carrier-30xa')
            && (
            <StyledItem>
              <StyledLabel isActive={!state.paramsHistorySelected} onClick={() => { setState({ paramsHistorySelected: false }); render(); }}>{t('alarmes')}</StyledLabel>
              <StyledLine isActive={!state.paramsHistorySelected} />
            </StyledItem>
            ) }
          </StyledList>
        </Content>
      </Wrapper>
      <MenuFixedContainer ref={elementRef} historySelected={state.paramsHistorySelected} scroll={false}>
        <Box width={1} maxWidth="120px">
          <Select
            options={returnOptions()}
            onSelect={(period: string) => {
              setState({ selectedTimeRange: period });
              render();
              handleDateChange(moment(), period);
            }}
            value={state.selectedTimeRange}
            placeholder={t('periodo')}
            hideSelected
            disabled={isLoading}
          />
          {!state.paramsHistorySelected && (
            <QuickSelection setDate={handleChangeQuickDates} />
          )}
        </Box>
        <Box mb={['0', !state.paramsHistorySelected ? '25px' : '0px']}>
          {(state.selectedTimeRange === t('dia')) && (
            <ContentDate>
              <Label>{t('data')}</Label>
              <SingleDatePicker
                disabled={isLoading}
                date={moment(state.startDate, 'YYYY-MM-DD')}
                onDateChange={(data) => handleDateChange(moment(data))}
                focused={focus.focused}
                onFocusChange={({ focused }) => {
                  setFocus({ ...focus, focused });
                }}
                id="datepicker"
                numberOfMonths={1}
                isOutsideRange={(d) => !d.isBefore(moment())}
              />
              <StyledCalendarIcon color="#202370" />
            </ContentDate>
          )}
          {state.selectedTimeRange === t('mes') && (
            <ContentDate>
              <Label>{t('data')}</Label>
              <DatePicker
                maxDate={moment().toDate()}
                disabled={isLoading}
                selected={moment(state.startDate, 'YYYY-MM-DD')
                  .startOf('month')
                  .toDate()}
                onChange={(d) => handleDateChange(moment(d))}
                locale="pt-BR"
                showMonthYearPicker
                dateFormat="P"
              />
              <StyledCalendarIcon color="#202370" />
            </ContentDate>
          )}
          {state.selectedTimeRange === t('flexivel') && (
            <ContentDate>
              <Label>{t('data')}</Label>
              <br />
              <DateRangePicker
                readOnly
                disabled={isLoading}
                startDate={state.startDate ? moment(state.startDate) : null}
                startDateId="your_unique_start_date_id"
                endDate={state.endDate ? moment(state.endDate) : null}
                endDateId="your_unique_end_date_id"
                onDatesChange={({ startDate, endDate }) => {
                  setState({
                    startDate,
                    endDate: startDate?.format('YYYY-MM-DD') !== state.startDate?.format('YYYY-MM-DD') ? null : endDate,
                  });
                  render();
                }}
                onFocusChange={(focused) => {
                  setFocus({ ...focus, focusedInput: focused });
                }}
                focusedInput={focus.focusedInput}
                noBorder
                isOutsideRange={(d) => d.isAfter(moment(), 'day')}
                startDatePlaceholderText={t('dataInicial')}
                endDatePlaceholderText={t('dataFinal')}
              />
              <StyledCalendarIcon color="#202370" />
            </ContentDate>
          )}
          {state.selectedTimeRange === t('ano') && (
            <ContentDate width={1} maxWidth="365px">
              <Label>{t('data')}</Label>
              <DatePicker
                maxDate={moment().toDate()}
                disabled={isLoading}
                selected={state.startDate ? state.startDate.startOf('year').toDate() : moment().startOf('year').toDate()}
                onChange={(date) => { handleDateChange(moment(date)); }}
                locale="pt-BR"
                showYearPicker
                dateFormat="yyyy"
              />
              <StyledCalendarIcon color="#202370" />
            </ContentDate>
          )}
        </Box>
        {!state.paramsHistorySelected && (
          <Box justifyContent="flex-end" marginLeft={['0', '0', 'auto', 'auto', 'auto', 'auto', 'auto']} mb={['0', '25px']}>
            <a href="#" style={{ display: 'none' }} id="downloadLink" />
            <BtnOrderColumns onClick={() => handleExport()} disabled={isLoading}>
              <ExportIcon />
              {t('botaoExportar')}
            </BtnOrderColumns>
          </Box>
        )}
      </MenuFixedContainer>
      <Flex ml="5px" mr="5px">
        {state.paramsHistorySelected ? (
          <ChillerParameters
            driId={props.driId}
            startDate={state.startDate}
            endDate={state.endDate}
            isFlexivel={state.selectedTimeRange === t('flexivel')}
            model={props.model}
            chillerModel={props.chillerModel}
          />
        ) : (
          <AlarmsHistory
            driId={props.driId}
            startDate={state.startDate}
            endDate={state.endDate}
            setIsLoading={(value) => setIsLoading(value)}
            isLoading={isLoading}
            sortBy={sortBy}
            setSortBy={setSortBy}
            renderState={render}
            setSelectedFilters={setState}
            selectedFilters={state.selectedFilterAlarms}
            setAlarmHistoryColumns={setState}
          />
        )}
      </Flex>
    </>
  );
}
