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
import { useStateVar } from '~/helpers/useStateVar';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'reflexbox';
import { ExportWorksheetIcon } from '~/icons';
import {
  ContentDate, ExportBtn, Label, StyledCalendarIcon, ContainerUseIndex,
} from './styles';
import { colors } from '~/styles/colors';
import ptBR from 'date-fns/locale/pt-BR';
import { IlluminationHistoryCard } from './IlluminationHistoryCard';
import { ApiResps } from '~/providers';
import { NoGraph } from '~/components/NoGraph';
import { CSVLink } from 'react-csv';
import { getUserProfile } from '~/helpers/userProfile';
import {
  getUsageIndexPageInitialState,
  onRangeTypeChange,
  onDateChange,
  handleGetDevInfo,
} from '../DMTs/DmtUsageIndex';
import { formatCsvDatetime } from '~/helpers/formatTime';
import { ContainerInfoUsageIndex } from '../DMTs/styles';

registerLocale('pt-BR', ptBR);

export const DalUsageIndex = ({ illuminationInfo } : {illuminationInfo?: null|(ApiResps['/dal/get-illumination-info'])}): JSX.Element => {
  const routeParams = useParams<{ devId }>();
  const devId = routeParams.devId || illuminationInfo?.DAL_CODE;

  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const csvLinkEl = useRef();

  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar(() => {
    const state = getUsageIndexPageInitialState(devId);
    state.isLoading = !state.devInfo;
    return state;
  });

  const handleGetDalInfo = () => handleGetDevInfo({ dalCode: devId }, '/dal/get-illuminations-charts-data', state, setState, t);
  const handleOnRangeTypeChange = (e) => onRangeTypeChange(e, state, render, handleGetDalInfo, t);
  const handleOnDateChange = (date) => onDateChange(date, state, render, handleGetDalInfo, t);

  useEffect(() => {
    getDeviceInfo(devId, state, setState);
  }, []);

  function formatCsvValue(value: any) {
    const labels = {
      0: t('desligado').toUpperCase(),
      1: t('ligado').toUpperCase(),
    };

    return labels[value] || '-';
  }

  const getCsvHeader = () => {
    state.CSVheader = [];
    state.CSVheader.push({
      label: t('dataHora'),
      key: 'data',
    });
    if (!illuminationInfo || state.advancedMode) {
      state.devInfo?.dal?.illuminationList.forEach((illum) => {
        state.CSVheader.push({
          label: illum.NAME,
          key: String(illum.ILLUMINATION_ID),
        });
      });
    } else {
      state.CSVheader.push({
        label: illuminationInfo.NAME,
        key: String(illuminationInfo.ID),
      });
    }
  };

  const getCsvBody = () => {
    const formattedCSV = [] as any;
    for (let i = 0; i < state.x.length; i++) {
      const data = {
        data: `${formatCsvDatetime(state.x[i], state.dateList[0].YMD)}`,
      };
      if (!illuminationInfo || state.advancedMode) {
        state.devInfo?.dal?.illuminationList.forEach((illum) => {
          data[illum.ILLUMINATION_ID] = state.vars.Feedback[illum.FEEDBACK - 1]?.length > i ? formatCsvValue(state.vars.Feedback[illum.FEEDBACK - 1][i]) : '-';
        });
      } else {
        data[illuminationInfo.ID] = state.vars.Feedback[illuminationInfo.FEEDBACK - 1]?.length > i ? formatCsvValue(state.vars.Feedback[illuminationInfo.FEEDBACK - 1][i]) : '-';
      }

      formattedCSV.push(data);
    }

    return formattedCSV;
  };

  const getCsvData = async () => {
    setState({ isLoading: true });
    try {
      if (state.vars) {
        getCsvHeader();
        state.csvData = getCsvBody();

        setTimeout(() => {
          (csvLinkEl as any).current.link.click();
        }, 1000);
      } else {
        toast.info(t('semDadosGraficoExportar'));
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
    setState({ isLoading: false });
  };

  return (
    <div>
      <div
        style={{
          width: '100%',
          padding: '25px 0px 25px 0px',
          position: 'sticky',
          top: 0,
          zIndex: 3,
          marginBottom: 20,
          borderBottom: `2px solid ${colors.Grey100}`,
          backgroundColor: 'white',
        }}
      >
        <ContainerInfoUsageIndex>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            backgroundColor: 'white',
            zIndex: 2,
            alignItems: 'center',
          }}
          >
            <Box width={[1, 1, 1, 1, 1, 1 / 12]} minWidth="125px" marginRight="20px">
              <Select
                options={[t('mes'), t('semana'), t('dia')]}
                value={state.selectedTimeRange}
                onSelect={handleOnRangeTypeChange}
                placeholder={t('periodo')}
                hideSelected
                disabled={state.isLoading}
              />
            </Box>

            <Box width="fit-content" margin="0px -5px" mt={[16, 16, 16, 16, 16, 0]}>
              {(state.selectedTimeRange === t('dia') || state.selectedTimeRange === t('semana')) && (
                <ContentDate>
                  <Label>{t('data')}</Label>
                  <SingleDatePicker
                    date={state.date}
                    onDateChange={handleOnDateChange}
                    id="datepicker"
                    numberOfMonths={1}
                    isOutsideRange={(d) => !d.isBefore(moment())}
                    focused={state.focused}
                    onFocusChange={({ focused }) => { state.focused = focused; render(); }}
                    disabled={state.isLoading}
                  />
                  <StyledCalendarIcon color="#202370" />
                </ContentDate>
              )}
              {(state.selectedTimeRange === t('mes')) && (
                <ContentDate>
                  <Label>{t('data')}</Label>
                  <DatePicker
                    selected={state.monthDate}
                    onChange={handleOnDateChange}
                    dateFormat="MMM yyyy"
                    locale={`${t('data') === 'Data' ? 'pt-BR' : ''}`}
                    showMonthYearPicker
                    disabled={state.isLoading}
                  />
                  <StyledCalendarIcon color="#202370" />
                </ContentDate>
              )}

            </Box>

            {illuminationInfo && profile.permissions.isAdminSistema && (
              <Flex flexDirection="row" ml={40} justifyContent="center" alignItems="center">
                <Checkbox size={18} checked={state.advancedMode} onClick={() => { state.advancedMode = !state.advancedMode; render(); }} />
                <Flex flexDirection="column" width={230} fontSize={11}>
                  <span style={{ fontWeight: 'bold' }}>{t('modoAvancado')}</span>
                  {t('mostrarTodosUtilitariosDal')}
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
              filename={`${t('indiceUso')} - ${devId}`}
              headers={state.CSVheader}
              data={state.csvData}
              separator=";"
              enclosingCharacter={"'"}
              asyncOnClick
              ref={csvLinkEl}
            />
          </div>
        </ContainerInfoUsageIndex>
      </div>
      <Card noPadding>
        <ContainerUseIndex>
          {(!state.selectedTimeRange || !state.vars) && <NoGraph type="usageIndex" title={t('indiceDeUsoDoDal')} />}
          {state.isLoading && (
            <Flex flexDirection="column" justifyContent="center" alignItems="center" style={{ height: 300 }}>
              <Loader />
            </Flex>
          )}
          {(!state.isLoading && state.selectedTimeRange && state.dateList.length !== 0) && (
          <Flex flexDirection="column">
            {state.vars && (!illuminationInfo || state.advancedMode) && state.devInfo?.dal?.illuminationList.map((illum) => (
              <IlluminationHistoryCard
                timeRange={state.selectedTimeRange}
                commonX={state.x}
                relay={state.vars.Relays[illum.PORT - 1] || []}
                feedback={state.vars.Feedback[illum.FEEDBACK - 1] || []}
                numDays={state.numDays}
                xDomain={state.xDomain}
                xTicks={state.xTicks}
                dateStart={state.dateList[0].YMD}
                dalCode={illum.DAL_CODE}
                illumInfo={{ ...illum, ID: illum.ILLUMINATION_ID }}
                key={illum.ID}
              />
            ))}
            { state.vars && illuminationInfo && !state.advancedMode && (
              <IlluminationHistoryCard
                timeRange={state.selectedTimeRange}
                commonX={state.x}
                relay={state.vars.Relays[illuminationInfo.PORT - 1] || []}
                feedback={state.vars.Feedback[illuminationInfo.FEEDBACK - 1] || []}
                numDays={state.numDays}
                xDomain={state.xDomain}
                xTicks={state.xTicks}
                dateStart={state.dateList[0].YMD}
                dalCode={illuminationInfo.DAL_CODE}
                illumInfo={illuminationInfo}
              />
            )}
          </Flex>
          )}
        </ContainerUseIndex>
      </Card>
    </div>
  );
};
