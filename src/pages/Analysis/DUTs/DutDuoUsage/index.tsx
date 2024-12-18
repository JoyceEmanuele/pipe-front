import { useEffect } from 'react';

import moment from 'moment';
import { SingleDatePicker } from 'react-dates';
import DatePicker from 'react-datepicker';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Box, Flex } from 'reflexbox';
import { Select } from '~/components';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { formatTime } from '~/helpers/formatTime';
import { useStateVar } from '~/helpers/useStateVar';
import { useHistory } from 'react-router-dom';
import { apiCall } from '~/providers';
import i18n from '~/i18n';
import { t } from 'i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

import {
  Card,
  ContentDate,
  StyledCalendarIcon,
  Label,
} from '../../DEVs/UsageCommon/styles';
import {
  RenderUsageInformation,
} from '../../DEVs/UsageCommon/index';

export const DutDuoUsage = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const history = useHistory();
  const { devId: dutId } = useParams<{ devId: string }>();
  const [state, render] = useStateVar(() => {
    const state = {
      loading: false,
      devInfo: getCachedDevInfoSync(dutId),
      selectedTimeRange: t('dia'),
      date: moment(),
      focused: null,
      error: false,
      dutInfo: {} as {
        hasAutomation?: boolean,
        DAC_KW?: number,
      },
      realLiveData: {
        data: [] as any,
        yearData: [],
      },
      realLiveHistorical: {
        data: {} as {
          Lcmp?: { v, c },
        },
      },
      mostradores: {
        tempoLigado_text: '',
        tempoLigado_hours: 0,
        num_partidas: '',
        consumo_kwh: '',
      } as {
        tempoLigado_text?,
        tempoLigado_hours?,
        num_partidas?,
        consumo_kwh?,
      },
      assetLayout: false as boolean,
    };

    const linkBase = history.location.pathname;
    state.assetLayout = linkBase.includes('/ativo');

    Promise.resolve().then(async () => {
      state.devInfo = await getCachedDevInfo(dutId, {});
      // @ts-ignore
      state.dutInfo = state.devInfo.dut;
      render();
    }).catch(console.log);

    return state;
  });

  function handleSelect(e) {
    switch (e) {
      case state.selectedTimeRange: {
        return;
      }
      case t('dia'): {
        state.selectedTimeRange = t('dia');
        resetUsageRates();
        render();
        return;
      }
      case t('semana'): {
        state.selectedTimeRange = t('semana');
        resetUsageRates();
        render();
        return;
      }
      case t('mes'): {
        state.selectedTimeRange = t('mes');
        resetUsageRates();
        render();
        return;
      }
      case t('ano'): {
        state.selectedTimeRange = t('ano');
        resetUsageRates();
        render();
        return;
      }
      default: {
        state.selectedTimeRange = t('dia');
        resetUsageRates();
        render();
      }
    }
  }

  function handleDate(date: string) {
    resetUsageRates();
    state.date = moment(date);
    render();
  }

  async function selectDayTimeRange() {
    const histData = await apiCall('/dut/get-day-charts-data', {
      devId: dutId,
      day: state.date.format('YYYY-MM-DD'),
      selectedParams: [],
    });

    if (histData.provision_error) { toast.error(t('erroDadosIncompletos')); }

    state.realLiveHistorical.data = { Lcmp: histData?.L1 };

    state.realLiveData.data = [{
      dat_report_week: '',
      dat_report_month: '',
      day_hours_on: histData.hoursOnL1,
      day_num_departs: histData.numDeparts,
    }];

    state.mostradores = {
      tempoLigado_text: formatTime(histData.hoursOnL1 ?? 0),
      tempoLigado_hours: (histData.hoursOnL1 ?? 0),
      num_partidas: histData.numDeparts,
      // @ts-ignore
      consumo_kwh: formatNumberWithFractionDigits(histData.hoursOnL1 * state.dutInfo.DAC_KW || 0, { minimum: 0, maximum: 2 }),
    };
  }

  async function selectWeekTimeRange() {
    const { list } = await apiCall('/dut/get-usage-per-day', {
      dutId,
      datIni: state.date.weekday(0).format('YYYY-MM-DD'),
      numDays: 7,
    });

    let hoursOnL1 = 0;
    let numDeparts = 0;
    state.realLiveData.data = list.map((item) => {
      hoursOnL1 += (item.hoursOnL1 || 0);
      numDeparts += (item.numDeparts || 0);
      return {
        dat_report_week: moment(item.day).format('ddd'),
        dat_report_month: moment(item.day).format('DD/MM/YYYY'),
        day_hours_on: item.hoursOnL1,
        day_num_departs: item.numDeparts,
      };
    });

    state.mostradores = {
      tempoLigado_text: formatTime(hoursOnL1 ?? 0),
      tempoLigado_hours: 0,
      num_partidas: numDeparts,
      // @ts-ignore
      consumo_kwh: formatNumberWithFractionDigits(hoursOnL1 * state.dutInfo.DAC_KW || 0),
    };
  }

  async function selectMonthTimeRange() {
    const datIni = moment(state.date).startOf('month').format('YYYY-MM-DD');
    const datIniD = new Date(`${datIni}T00:00:00Z`);
    const datEndD = new Date(datIniD.getTime());
    datEndD.setUTCMonth(datEndD.getUTCMonth() + 1);
    const numDays = Math.round((datEndD.getTime() - datIniD.getTime()) / 1000 / 60 / 60 / 24);

    const { list } = await apiCall('/dut/get-usage-per-day', {
      dutId,
      datIni,
      numDays,
    });

    let hoursOnL1 = 0;
    // @ts-ignore
    let numDeparts = 0;
    // @ts-ignore
    // @ts-ignore
    state.realLiveData.data = list.map((item) => {
      hoursOnL1 += (item.hoursOnL1 || 0);
      numDeparts += (item.numDeparts || 0);
      return {
        dat_report_week: moment(item.day).format('ddd'),
        dat_report_month: moment(item.day).format('DD/MM/YYYY'),
        day_hours_on: item.hoursOnL1,
        day_num_departs: item.numDeparts,
      };
    });

    state.mostradores = {
      tempoLigado_text: formatTime(hoursOnL1 || 0),
      tempoLigado_hours: 0,
      num_partidas: numDeparts,
      // @ts-ignore
      consumo_kwh: formatNumberWithFractionDigits(hoursOnL1 * state.dutInfo.DAC_KW || 0, { minimum: 0, maximum: 0 }),
    };
  }

  async function selectYearTimeRange() {
    const { list } = await apiCall('/dut/get-usage-per-month', {
      dutId,
      datIni: state.date.startOf('year').format('YYYY-MM-DD'),
      numMonths: 12,
    });

    let hoursOnL1 = 0;
    let numDeparts = 0;

    // @ts-ignore
    state.realLiveData.yearData = list.map((item) => {
      hoursOnL1 += (item.hoursOnL1 || 0);
      numDeparts += (item.numDeparts || 0);
      return {
        MONTH_HOURS_ON: item.hoursOnL1,
        MONTH_NUM_DEPARTS: item.numDeparts,
        MONTH_REPORT: moment(item.month).format('MMM'),
      };
    });

    state.mostradores = {
      tempoLigado_text: formatTime(hoursOnL1 || 0),
      tempoLigado_hours: 0,
      num_partidas: numDeparts,
      // @ts-ignore
      consumo_kwh: formatNumberWithFractionDigits(hoursOnL1 * state.dutInfo.DAC_KW || 0, { minimum: 0, maximum: 0 }),
    };
  }

  function resetUsageRates() {
    state.realLiveData.data = [];
    state.realLiveData.yearData = [];
    state.realLiveHistorical.data = {};
  }

  function updateCharts() {
    if (!state.dutInfo) return;
    Promise.resolve().then(async () => {
      state.loading = true;
      resetUsageRates();
      state.mostradores = {};
      render();

      if (state.selectedTimeRange === t('dia')) {
        await selectDayTimeRange();
      }

      if (state.selectedTimeRange === t('semana')) {
        await selectWeekTimeRange();
      }

      if (state.selectedTimeRange === t('mes') && !state.error) {
        await selectMonthTimeRange();
      }

      if (state.selectedTimeRange === t('ano') && !state.error) {
        await selectYearTimeRange();
      }
    })
      .catch((err) => {
        console.log(err);
        alert(t('houveErro'));
      })
      .then(() => {
        state.loading = false;
        render();
      });
  }

  useEffect(() => {
    updateCharts();
  }, [state.date, state.selectedTimeRange, state.dutInfo]);

  useEffect(() => {
    if (
      (state.selectedTimeRange === t('semana') && state.realLiveData.data.length === 7)
    ) {
      state.loading = false; render();
    }
  }, [state.realLiveData.data, state.realLiveData.yearData]);

  return (
    <>
      <Card>
        <Flex flexWrap="wrap">
          <Box width={[1, 1, 1, 1, 1, 1 / 5]}>
            <Select
              options={[t('dia'), t('semana'), t('mes'), t('ano')]}
              onSelect={(e) => handleSelect(e)}
              value={state.selectedTimeRange}
              placeholder={t('periodo')}
            />
          </Box>
          <Box minHeight="55px" minWidth="340px" ml="40px">
            {[t('dia'), t('semana')].includes(state.selectedTimeRange) && (
              <ContentDate>
                <Label>{t('data')}</Label>
                <SingleDatePicker
                  disabled={state.loading}
                  date={state.date}
                  onDateChange={(date) => { handleDate(date); }}
                  focused={state.focused}
                  onFocusChange={({ focused }) => {
                    state.focused = focused;
                    render();
                  }}
                  id="datepicker"
                  numberOfMonths={1}
                  isOutsideRange={(d) => d.startOf('day').isAfter(moment().startOf('day'))}
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            )}
            {[t('mes')].includes(state.selectedTimeRange) && (
              <ContentDate>
                <Label>{t('data')}</Label>
                <DatePicker
                  maxDate={moment().toDate()}
                  disabled={state.loading}
                  selected={state.date.startOf('month').toDate()}
                  onChange={(date) => { handleDate(date); }}
                  locale="pt-BR"
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            )}
            {[t('ano')].includes(state.selectedTimeRange) && (
              <ContentDate>
                <Label>{t('data')}</Label>
                <DatePicker
                  maxDate={moment().toDate()}
                  disabled={state.loading}
                  selected={state.date.startOf('year').toDate()}
                  onChange={(date) => { handleDate(date); }}
                  locale="pt-BR"
                  showYearPicker
                  dateFormat="yyyy"
                />
                <StyledCalendarIcon color="#202370" />
              </ContentDate>
            )}
          </Box>
        </Flex>
        <RenderUsageInformation state={state} />
      </Card>
    </>
  );
};
