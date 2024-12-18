import { useEffect } from 'react';

import moment from 'moment';
import { SingleDatePicker } from 'react-dates';
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
  InputDate,
  ContentDate,
  StyledCalendarIcon,
  Label,
} from '../../DEVs/UsageCommon/styles';

import {
  RenderUsageInformation,
} from '../../DEVs/UsageCommon/index';

function findGreenAreas(Levp, Lcmp) {
  if (!Levp) return [];
  if (!Lcmp) return [];

  const ac = Levp.c;
  const av = Levp.v;
  const bc = Lcmp.c;
  const bv = Lcmp.v;
  let a1 = 0;
  let a2 = 0;
  let a3 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;

  let xi = 0;
  let xf = 0;
  let x1 = null;
  let x2 = null;

  const areas:{x1: any, x2:any, key:string}[] = [];

  while (true) {
    if (!a2) {
      if (a1 >= ac.length) break;
      a2 = ac[a1];
      a3 = av[a1];
      a1++;
    }
    if (!b2) {
      if (b1 >= bc.length) break;
      b2 = bc[b1];
      b3 = bv[b1];
      b1++;
    }
    const s = Math.min(a2, b2);
    xi = xf;
    xf += s;
    if (a3 === 1 && b3 === 0) {
      // @ts-ignore
      if (!x1) x1 = xi;
      // @ts-ignore
      x2 = xf;
    } else {
      if (x2) {
        areas.push({
          // @ts-ignore
          x1: x1 / 60 / 60,
          // @ts-ignore
          x2: x2 / 60 / 60,
          // @ts-ignore
          key: `${x1}:${x2}`,
        });
      }
      x1 = x2 = null;
    }
    a2 -= s;
    b2 -= s;
  }
  if (x2) {
    areas.push({
      // @ts-ignore
      x1: x1 / 60 / 60,
      // @ts-ignore
      x2: x2 / 60 / 60,
      // @ts-ignore
      key: `${x1}:${x2}`,
    });
  }
  return areas;
}

export const Usage = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const history = useHistory();
  const { devId: dacId } = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      loading: false,
      devInfo: getCachedDevInfoSync(dacId),
      selectedTimeRange: t('dia'),
      date: moment(),
      focused: null,
      error: false,
      dacInfo: {} as {
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
          Levp?: { v, c },
          Lcut?: { v, c },
          greenAreas?: { key: string, x1: number, x2: number }[],
        },
      },
      mostradores: {
        tempoLigado_text: '',
        tempoLigado_hours: 0,
        tempoBloqueado_text: '',
        tempoBloqueado_hours: 0,
        num_partidas: '',
        consumo_kwh: '',
      } as {
        tempoLigado_text?,
        tempoLigado_hours?,
        tempoBloqueado_text?,
        tempoBloqueado_hours?,
        num_partidas?,
        consumo_kwh?,
      },
      assetLayout: false as boolean,

      RESET_USAGE_RATES() {
        state.realLiveData.data = [];
        state.realLiveData.yearData = [];
        state.realLiveHistorical.data = {};
      },

      updateCharts() {
        if (!state.dacInfo) return;
        Promise.resolve().then(async () => {
          state.loading = true;
          state.RESET_USAGE_RATES();
          state.mostradores = {};
          render();
          if (state.selectedTimeRange === t('dia')) {
            const histData = await apiCall('/dac/get-day-charts-data', {
              dacId,
              day: state.date.format('YYYY-MM-DD'),
              selectedParams: ['Lcmp', 'Lcut', 'Levp'],
            });
            if (histData.provision_error) { toast.error(t('erroDadosIncompletos')); }

            state.realLiveHistorical.data = histData;
            if (histData.Lcut) {
              for (let i = 0; i < histData.Lcut.v.length; i++) {
                if (histData.Lcut.v[i] === 1) histData.Lcut.v[i] = -2;
                else if (histData.Lcut.v[i] === 0) histData.Lcut.v[i] = -1;
              }
            }
            state.realLiveData.data = [{
              // @ts-ignore
              dat_report_week: '',
              // @ts-ignore
              dat_report_month: '',
              // @ts-ignore
              day_hours_on: histData.hoursOn,
              // @ts-ignore
              day_num_departs: histData.numDeparts,
              // @ts-ignore
              day_hours_blocked: histData.hoursBlocked,
            }];
            state.realLiveHistorical.data.greenAreas = findGreenAreas(state.realLiveHistorical.data.Levp, state.realLiveHistorical.data.Lcmp);

            state.mostradores = {
              tempoLigado_text: formatTime(histData.hoursOn || 0),
              tempoLigado_hours: (histData.hoursOn || 0),
              tempoBloqueado_text: formatTime(histData.hoursBlocked || 0),
              tempoBloqueado_hours: (histData.hoursBlocked || 0),
              num_partidas: histData.numDeparts,
              // @ts-ignore
              consumo_kwh: formatNumberWithFractionDigits(histData.hoursOn * state.dacInfo.DAC_KW || 0, { minimum: 0, maximum: 2 }),
            };
          }
          if (state.selectedTimeRange === t('semana')) {
            const { list } = await apiCall('/dac/get-usage-per-day', {
              dacId,
              datIni: state.date.weekday(0).format('YYYY-MM-DD'),
              numDays: 7,
            });

            let hoursOn = 0;
            let numDeparts = 0;
            // @ts-ignore
            let hoursBlocked = 0;
            // @ts-ignore
            state.realLiveData.data = list.map((item) => {
              hoursOn += (item.hoursOn || 0);
              numDeparts += (item.numDeparts || 0);
              hoursBlocked += (item.hoursBlocked || 0);
              return {
                dat_report_week: moment(item.day).format('ddd'),
                dat_report_month: moment(item.day).format('DD/MM/YYYY'),
                day_hours_on: item.hoursOn,
                day_hours_blocked: item.hoursBlocked,
                day_num_departs: item.numDeparts,
              };
            });

            state.mostradores = {
              tempoLigado_text: formatTime(hoursOn || 0),
              tempoLigado_hours: 0,
              tempoBloqueado_text: formatTime(hoursBlocked || 0),
              tempoBloqueado_hours: 0,
              num_partidas: numDeparts,
              // @ts-ignore
              consumo_kwh: formatNumberWithFractionDigits(hoursOn * state.dacInfo.DAC_KW || 0),
            };
          }
          if (state.selectedTimeRange === t('mes') && !state.error) {
            const datIni = state.date.startOf('month').format('YYYY-MM-DD');
            const datIniD = new Date(`${datIni}T00:00:00Z`);
            const datEndD = new Date(datIniD.getTime());
            datEndD.setUTCMonth(datEndD.getUTCMonth() + 1);
            const numDays = Math.round((datEndD.getTime() - datIniD.getTime()) / 1000 / 60 / 60 / 24);

            const { list } = await apiCall('/dac/get-usage-per-day', {
              dacId,
              datIni,
              numDays,
            });

            let hoursOn = 0;
            // @ts-ignore
            let numDeparts = 0;
            // @ts-ignore
            let hoursBlocked = 0;
            // @ts-ignore
            state.realLiveData.data = list.map((item) => {
              hoursOn += (item.hoursOn || 0);
              numDeparts += (item.numDeparts || 0);
              hoursBlocked += (item.hoursBlocked || 0);
              return {
                dat_report_week: moment(item.day).format('ddd'),
                dat_report_month: moment(item.day).format('DD/MM/YYYY'),
                day_hours_on: item.hoursOn,
                day_hours_blocked: item.hoursBlocked,
                day_num_departs: item.numDeparts,
              };
            });

            state.mostradores = {
              tempoLigado_text: formatTime(hoursOn || 0),
              tempoLigado_hours: 0,
              // @ts-ignore
              tempoBloqueado_text: formatTime(hoursBlocked || 0),
              tempoBloqueado_hours: 0,
              num_partidas: numDeparts,
              // @ts-ignore
              consumo_kwh: formatNumberWithFractionDigits(hoursOn * state.dacInfo.DAC_KW || 0, { minimum: 0, maximum: 0 }),
            };
          }
          if (state.selectedTimeRange === t('ano') && !state.error) {
            const { list } = await apiCall('/dac/get-usage-per-month', {
              dacId,
              monthIni: state.date.startOf('year').format('YYYY-MM'),
              numMonths: 12,
            });

            let hoursOn = 0;
            let numDeparts = 0;
            // @ts-ignore
            let hoursBlocked = 0;
            // @ts-ignore
            state.realLiveData.yearData = list.map((item) => {
              hoursOn += (item.hoursOn || 0);
              numDeparts += (item.numDeparts || 0);
              hoursBlocked += (item.hoursBlocked || 0);
              return {
                MONTH_HOURS_ON: item.hoursOn,
                MONTH_NUM_DEPARTS: item.numDeparts,
                MONTH_HOURS_BLOCKED: item.hoursBlocked,
                MONTH_REPORT: moment(item.periodYM).format('MMM'),
              };
            });

            state.mostradores = {
              tempoLigado_text: formatTime(hoursOn || 0),
              tempoLigado_hours: 0,
              tempoBloqueado_text: formatTime(hoursBlocked || 0),
              tempoBloqueado_hours: 0,
              num_partidas: numDeparts,
              // @ts-ignore
              consumo_kwh: formatNumberWithFractionDigits(hoursOn * state.dacInfo.DAC_KW || 0, { minimum: 0, maximum: 0 }),
            };
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
      },
    };

    const linkBase = history.location.pathname;
    state.assetLayout = linkBase.includes('/ativo');

    Promise.resolve().then(async () => {
      state.devInfo = await getCachedDevInfo(dacId, {});
      // @ts-ignore
      state.dacInfo = state.devInfo.dac;
      render();
    }).catch(console.log);

    return state;
  });

  const { realLiveData } = state;
  const { realLiveHistorical } = state;

  function formatValue(value) {
    const month = new RegExp(/^(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/);
    const year = new RegExp(/^\d{4}$/);
    if (month.test(value)) {
      state.date = moment(`01/${value}`, 'DD/MM/YYYY');
      state.error = false;
    } else if (year.test(value)) {
      state.error = false;
      state.date = moment(`01/01/${value}`, 'DD/MM/YYYY');
    } else {
      state.date = value;
      state.error = true;
    }
    render();
  }

  function getValue(value) {
    const regex = new RegExp(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/);
    return typeof value === 'object' && regex.test(value.format('DD/MM/YYYY'))
      ? state.selectedTimeRange === t('mes')
        ? value.format('MM/YYYY')
        : value.format('YYYY')
      : value;
  }

  function handleSelect(e) {
    switch (e) {
      case t('dia'): {
        return state.selectedTimeRange = t('dia'), state.RESET_USAGE_RATES(), render();
      }
      case t('semana'): {
        return state.selectedTimeRange = t('semana'), state.RESET_USAGE_RATES(), render();
      }
      case t('mes'): {
        return state.selectedTimeRange = t('mes'), state.RESET_USAGE_RATES(), render();
      }
      case t('ano'): {
        return state.selectedTimeRange = t('ano'), state.RESET_USAGE_RATES(), render();
      }
      default: {
        return state.selectedTimeRange = 'Dia', state.RESET_USAGE_RATES(), render();
      }
    }
  }

  useEffect(() => {
    state.updateCharts();
  }, [state.date, state.selectedTimeRange, state.dacInfo]);

  useEffect(() => {
    if (
      (state.selectedTimeRange === t('semana') && state.realLiveData.data.length === 7)
      || (state.selectedTimeRange === t('mes') && state.realLiveData.data.length === 30)
      || (state.selectedTimeRange === t('ano') && state.realLiveData.yearData.length === 12)
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
          <Box width={[1, 1, 1, 1, 1, 1 / 5]} ml={[0, 0, 0, 0, 0, 24, 24]} mt={[16, 16, 16, 16, 16, 0]}>
            <ContentDate>
              <Label>{t('data')}</Label>
              {[t('dia'), t('semana')].includes(state.selectedTimeRange) ? (
                <SingleDatePicker
                  date={state.date}
                  onDateChange={(date) => {
                    state.RESET_USAGE_RATES();
                    state.date = date;
                    render();
                  }}
                  focused={state.focused}
                  onFocusChange={({ focused }) => { state.focused = focused; render(); }}
                  id="datepicker"
                  numberOfMonths={1}
                  isOutsideRange={(d) => d.startOf('day').isAfter(moment().startOf('day'))}
                />
              ) : (
                <InputDate type="text" value={getValue(state.date)} onChange={(e) => formatValue(e.target.value)} />
              )}
              <StyledCalendarIcon />
            </ContentDate>
          </Box>
        </Flex>
        <RenderUsageInformation state={state} />
      </Card>
    </>
  );
};
