import { useEffect, useRef, useState } from 'react';
import i18n from '~/i18n';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SingleDatePicker } from 'react-dates';
import DatePicker, { registerLocale } from 'react-datepicker';
import {
  Card, Loader, Select, Checkbox,
} from '~/components';
import { getDeviceInfo } from '~/helpers/genericHelper';
import { getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'reflexbox';
import { ExportWorksheetIcon } from '~/icons';
import {
  ContainerInfoUsageIndex,
  ContentDate, ExportBtn, Label, StyledCalendarIcon,
} from './styles';
import { colors } from '~/styles/colors';
import ptBR from 'date-fns/locale/pt-BR';
import { ApiResps, apiCall } from '~/providers';
import { NoGraph } from '~/components/NoGraph';
import { CSVLink } from 'react-csv';
import { getUserProfile } from '~/helpers/userProfile';
import { getDatesList } from '~/pages/Overview/Default';
import { formatCsvDatetime } from '~/helpers/formatTime';
import { DmtUtilityHistoryCard } from './DmtUtilityHistoryCard';
import { AxiosError } from 'axios';

registerLocale('pt-BR', ptBR);

export const getUsageIndexPageInitialState = (devId: string) => ({
  isLoading: true,
  selectedTimeRange: '' as string,
  devInfo: getCachedDevInfoSync(devId),
  assetLayout: false as boolean,
  focused: false,
  advancedMode: false,
  date: moment(),
  focusedInput: null,
  monthDate: moment().startOf('month').toDate(),
  x: [] as number[],
  xDomain: [0, 24] as ([number, number]),
  dateList: getDatesList(moment().startOf('month'), new Date(moment().startOf('month').year(), moment().startOf('month').month() + 1, 0).getDate()),
  vars: null as any,
  numDays: 1 as number,
  csvData: [] as {}[],
  xTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] as number[],
  CSVheader: [] as any,
});

export function onRangeTypeChange(e: string, state: { selectedTimeRange, dateList, date, monthDate }, render: () => void, handleGetInfo: () => void, t: (string) => string): void {
  render();

  if (e === t('semana')) {
    state.selectedTimeRange = t('semana');
    state.dateList = getDatesList(state.date, 7);
  } else if (e === t('dia')) {
    state.selectedTimeRange = t('dia');
    state.dateList = getDatesList(state.date, 1);
  } else if (e === t('mes')) {
    state.selectedTimeRange = t('mes');
    state.dateList = getDatesList(moment(state.monthDate), new Date(moment(state.monthDate).year(), moment(state.monthDate).month() + 1, 0).getDate());
  }

  render();
  handleGetInfo();
}

export function onDateChange(date: moment.Moment, state: { selectedTimeRange, date, dateList, monthDate }, render: () => void, handleGetInfo: () => void, t: (string) => string): void {
  render();

  if (state.selectedTimeRange === t('semana')) {
    state.date = date;
    render();
    state.dateList = getDatesList(date, 7);
  } else if (state.selectedTimeRange === t('dia')) {
    state.date = date;
    render();
    state.dateList = getDatesList(date, 1);
  } else if (state.selectedTimeRange === t('mes')) {
    state.monthDate = date;
    state.dateList = getDatesList(moment(date), new Date(moment(date).year(), moment(date).month() + 1, 0).getDate());
  }

  render();
  handleGetInfo();
}

export const handleGetDevInfo = (params, endpoint, state, setState, t): void => {
  if (!state.dateList.length) return;
  Promise.resolve().then(async () => {
    if (!state.isLoading) {
      setState({ isLoading: true });
    }

    try {
      const firstDay = new Date(`${state.dateList[0].YMD}T00:00:00Z`).getTime();
      const lastDay = new Date(`${state.dateList[state.dateList.length - 1].YMD}T00:00:00Z`).getTime();

      const numDays = Math.round((lastDay - firstDay) / 1000 / 60 / 60 / 24) + 1;
      state.numDays = numDays;

      try {
        const allParams = {
          ...params,
          dayYMD: state.dateList[0].YMD,
          numDays,
        };

        const chartsData = await apiCall(endpoint, allParams);
        state.x = chartsData.commonX;
        state.vars = chartsData.vars;
        state.xDomain = [0, 24 * numDays];
        if (state.selectedTimeRange === t('dia')) {
          state.xTicks = Array.from({ length: 13 }, (_, i) => i * 2 * numDays);
        } else if (state.selectedTimeRange === t('mes')) {
          const xticks = Array.from({ length: numDays % 2 === 0 ? (numDays / 2) : Math.ceil((numDays) / 2) }, (_, i) => i * 2 * 24);
          state.xTicks = xticks;
        } else if (state.selectedTimeRange === t('semana')) {
          state.xTicks = Array.from({ length: numDays + 1 }, (_, i) => i * 24);
        }
      } catch (e) {
        const error = e as AxiosError;
        console.log(error);
        toast.error(error.response?.data || t('erroAquisicaoIndiceDeUso'));
      }
    } catch (err) { console.log(err); }
    setState({ isLoading: false });
  });
};

const showWarning = (show: boolean, type: string, message: string, id: number) => {
  if (show && !type) {
    if (!toast.isActive(id)) {
      toast.warn(message, { toastId: id });
    }
  }
};

export const DmtUsageIndex = ({ utilityInfo } : {utilityInfo?: null|(ApiResps['/dmt/get-nobreak-info'])|(ApiResps['/dal/get-illumination-info'])}): JSX.Element => {
  const routeParams = useParams<{ devId, type }>();
  const devId = routeParams.devId || utilityInfo?.DMT_CODE;
  const utilityId = (utilityInfo && 'NOBREAK_ID' in utilityInfo && utilityInfo?.NOBREAK_ID) || (utilityInfo && 'ID' in utilityInfo && utilityInfo?.ID);
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const csvLinkEl = useRef();

  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar(() => {
    const state = getUsageIndexPageInitialState(devId);
    state.isLoading = !state.devInfo;
    return state;
  });

  const showAllWarnings = () => {
    const hasUtilities = !!state.devInfo?.dmt?.utilitiesList?.length;
    showWarning(!hasUtilities, routeParams.type, t('dmtSemUtilitariosIndiceDeUso'), 10);

    const hasUtilitiesWithPort = !!state.devInfo?.dmt?.utilitiesList?.filter((util) => util.PORT != null).length;
    showWarning(hasUtilities && !hasUtilitiesWithPort, routeParams.type, t('dmtSemUtilitariosIndiceDeUso2'), 11);

    const electricNet = !!state.devInfo?.dmt?.utilitiesList.filter((util) => (util.APPLICATION === 'Electric Network' && util.PORT != null)).length;
    const nobreaks = !!state.devInfo?.dmt?.utilitiesList.filter((util) => (util.APPLICATION === 'Nobreak' && util.PORT != null)).length;
    showWarning(hasUtilitiesWithPort && nobreaks && !electricNet, routeParams.type, t('dmtSemUtilitariosIndiceDeUso3'), 12);

    return !hasUtilities || (hasUtilities && !hasUtilitiesWithPort) || (hasUtilitiesWithPort && nobreaks && !electricNet);
  };

  const isDisabled = showAllWarnings();
  const handleGetDmtInfo = () => handleGetDevInfo({ dmtCode: devId }, '/dmt/get-utilities-charts-data', state, setState, t);
  const handleOnRangeTypeChange = (e) => onRangeTypeChange(e, state, render, handleGetDmtInfo, t);
  const handleOnDateChange = (date) => onDateChange(date, state, render, handleGetDmtInfo, t);

  useEffect(() => {
    getDeviceInfo(devId, state, setState);
  }, []);

  function formatCsvValue(value: any) {
    const labels = {
      0: t('desligado').toUpperCase(),
      1: t('bateria').toUpperCase(),
      2: t('redeEletrica').toUpperCase(),
    };

    return labels[value] || '-';
  }

  const getCsvHeader = () => {
    state.CSVheader = [];
    state.CSVheader.push({
      label: t('dataHora'),
      key: 'data',
    });
    const varsKeys = Object.getOwnPropertyNames(state.vars);
    for (const key of varsKeys) {
      if (!utilityInfo || state.advancedMode || (utilityInfo && String(utilityId) === key)) {
        state.CSVheader.push({
          label: state.vars[key].name,
          key: String(state.vars[key].utilityId),
        });
      }
    }
  };

  const getCsvBody = () => {
    const formattedCSV = [] as any;
    for (let i = 0; i < state.x.length; i++) {
      const data = {
        data: `${formatCsvDatetime(state.x[i], state.dateList[0].YMD)}`,
      };
      const varsKeys = Object.getOwnPropertyNames(state.vars);
      for (const key of varsKeys) {
        if (!utilityInfo || state.advancedMode || (utilityInfo && String(utilityId) === key)) {
          data[key] = state.vars[key].y.length > i ? formatCsvValue(state.vars[key].y[i]) : '-';
        }
      }

      formattedCSV.push(data);
    }

    return formattedCSV;
  };

  const getCsvData = async () => {
    state.isLoading = true;
    render();
    try {
      if (state.vars && Object.getOwnPropertyNames(state.vars).length > 0) {
        getCsvHeader();
        state.csvData = getCsvBody();
        render();

        setTimeout(() => {
          (csvLinkEl as any).current.link.click();
        }, 1000);

        state.isLoading = false;
        render();
      } else {
        toast.info(t('semDadosGraficoExportar'));
        state.isLoading = false;
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
      state.isLoading = false;
    }
  };

  const hasVars = state.vars && Object.getOwnPropertyNames(state.vars).length !== 0;
  return (
    <div>
      <div
        style={{
          padding: '25px 0px 25px 0px',
          position: 'sticky',
          top: 0,
          zIndex: 3,
          width: '100%',
          borderBottom: `2px solid ${colors.Grey100}`,
          backgroundColor: 'white',
          marginBottom: 20,
        }}
      >
        <ContainerInfoUsageIndex>
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
            zIndex: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
          >
            <Box width={[1, 1, 1, 1, 1, 1 / 12]} marginRight="20px" minWidth="125px">
              <Select
                options={[t('mes'), t('semana'), t('dia')]}
                onSelect={handleOnRangeTypeChange}
                value={state.selectedTimeRange}
                placeholder={t('periodo')}
                hideSelected
                disabled={state.isLoading || isDisabled}
              />
            </Box>

            <Box width="fit-content" margin="0px -5px" mt={[16, 16, 16, 16, 16, 0]}>
              {(state.selectedTimeRange === t('dia') || state.selectedTimeRange === t('semana')) && (
                <ContentDate>
                  <Label>{t('data')}</Label>
                  <SingleDatePicker
                    disabled={state.isLoading}
                    date={state.date}
                    onDateChange={handleOnDateChange}
                    focused={state.focused}
                    onFocusChange={({ focused }) => { state.focused = focused; render(); }}
                    id="datepicker"
                    numberOfMonths={1}
                    isOutsideRange={(d) => !d.isBefore(moment())}
                  />
                  <StyledCalendarIcon color="#202370" />
                </ContentDate>
              )}
              {(state.selectedTimeRange === t('mes')) && (
                <ContentDate>
                  <Label>{t('data')}</Label>
                  <DatePicker
                    disabled={state.isLoading}
                    selected={state.monthDate}
                    onChange={handleOnDateChange}
                    dateFormat="MMM yyyy"
                    locale={`${t('data') === 'Data' ? 'pt-BR' : ''}`}
                    showMonthYearPicker
                  />
                  <StyledCalendarIcon color="#202370" />
                </ContentDate>
              )}

            </Box>

            {utilityInfo && profile.permissions.isAdminSistema && (
              <Flex flexDirection="row" ml={40} justifyContent="center" alignItems="center">
                <Checkbox size={18} checked={state.advancedMode} onClick={() => { state.advancedMode = !state.advancedMode; render(); }} />
                <Flex flexDirection="column" fontSize={11} width={230}>
                  <span style={{ fontWeight: 'bold' }}>{t('modoAvancado')}</span>
                  {t('mostrarTodosNobreaks')}
                </Flex>
              </Flex>
            )}
          </div>
          <div>
            <ExportBtn onClick={getCsvData}>
              <ExportWorksheetIcon color="#363BC4" />
              <span style={{ marginLeft: 10 }}>{t('exportarPlanilha')}</span>
            </ExportBtn>
            <CSVLink
              headers={state.CSVheader}
              data={state.csvData}
              filename={`${t('indiceUso')} - ${devId}`}
              separator=";"
              asyncOnClick
              enclosingCharacter={"'"}
              ref={csvLinkEl}
            />
          </div>
        </ContainerInfoUsageIndex>
      </div>
      <Card>
        <>
          {!state.isLoading && (!state.selectedTimeRange || !(hasVars)) && <NoGraph type="usageIndex" title={t('indiceDeUsoDoDmt')} />}
          {state.isLoading && (
            <Flex flexDirection="column" justifyContent="center" alignItems="center" style={{ height: 300 }}>
              <Loader />
            </Flex>
          )}
          {(!state.isLoading && state.selectedTimeRange && state.dateList.length !== 0) && (
          <Flex flexDirection="column">
            {state.vars && (!utilityInfo || state.advancedMode) && Object.getOwnPropertyNames(state.vars).map((utilId) => (
              <DmtUtilityHistoryCard
                timeRange={state.selectedTimeRange}
                commonX={state.x}
                y={state.vars[utilId].y}
                timeUsingBattery={state.vars[utilId].timeUsingBattery}
                numDays={state.numDays}
                xDomain={state.xDomain}
                xTicks={state.xTicks}
                dateStart={state.dateList[0].YMD}
                dmtCode={state.vars[utilId].dmtCode}
                datCode={state.vars[utilId].datCode}
                name={state.vars[utilId].name}
                utilityType={state.vars[utilId].utilityType}
                consumption={state.vars[utilId].consumption?.toFixed(2)}
                key={utilId}
              />
            ))}
            { hasVars && utilityInfo && utilityId != null && !state.advancedMode && (
              <>
                { routeParams.type === 'nobreak' && (
                  <DmtUtilityHistoryCard
                    timeRange={state.selectedTimeRange}
                    commonX={state.x}
                    xTicks={state.xTicks}
                    dateStart={state.dateList[0].YMD}
                    dmtCode={state.vars[`Nobreak-${utilityId}`].dmtCode}
                    y={state.vars[`Nobreak-${utilityId}`].y}
                    timeUsingBattery={state.vars[`Nobreak-${utilityId}`].timeUsingBattery}
                    numDays={state.numDays}
                    xDomain={state.xDomain}
                    datCode={state.vars[`Nobreak-${utilityId}`].datCode}
                    utilityType={state.vars[`Nobreak-${utilityId}`].utilityType}
                    name={state.vars[`Nobreak-${utilityId}`].name}
                  />
                )}
                { routeParams.type === 'iluminacao' && (
                  <DmtUtilityHistoryCard
                    dmtCode={state.vars[`Illumination-${utilityId}`].dmtCode}
                    commonX={state.x}
                    y={state.vars[`Illumination-${utilityId}`].y}
                    utilityType={state.vars[`Illumination-${utilityId}`].utilityType}
                    name={state.vars[`Illumination-${utilityId}`].name}
                    consumption={state.vars[`Illumination-${utilityId}`].consumption?.toFixed(2)}
                    timeRange={state.selectedTimeRange}
                    timeUsingBattery={state.vars[`Illumination-${utilityId}`].timeUsingBattery}
                    xTicks={state.xTicks}
                    dateStart={state.dateList[0].YMD}
                    numDays={state.numDays}
                    xDomain={state.xDomain}
                  />
                )}
              </>
            )}
          </Flex>
          )}
        </>
      </Card>
    </div>
  );
};
