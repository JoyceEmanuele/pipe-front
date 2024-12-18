import { Dispatch, SetStateAction, useEffect } from 'react';
import { Box, Flex } from 'reflexbox';
import i18n from '../../i18n/index';
import moment from 'moment';
import styles from './styles.module.css';
import { apiCallDownload } from '../../providers';
import ReactTooltip from 'react-tooltip';
import { useStateVar } from '../../helpers/useStateVar';
import { toast } from 'react-toastify';

import {
  ChartInfo,
  ChartInfoContainer,
  ChartInfoDataContainer,
  ChartInfoTitle,
  ChartLegendContainer,
  ChartLegendTitle,
  NoInfoTooltip,
} from './styles';
import { IEnergyMeter, IMeterDemand } from '../../pages/Analysis/Units/EnergyEfficiency';
import { Divider } from '../Divider';
import { formatNumberWithFractionDigits, thousandPointFormat } from '~/helpers/thousandFormatNumber';
import { convertEnergy } from '~/helpers';
import { InfoIcon, WarnIcon } from '~/icons';
import { getUserProfile } from '~/helpers/userProfile';

const t = i18n.t.bind(i18n);

export const DemandChart = (props: {
  unitId: number
  maxTotalDemandMeasured: number,
  yPointsTotalMeasured: number[];
  isReduced: boolean;
  isLoading?: boolean;
  measurementUnit?: string;
  chartMode: string;
  changeChartMode: (mode?: string, selectedDay?: IMeterDemand) => void;
  filterMode: string;
  dateList: { mdate: moment.Moment }[];
  demandsByMeter: {
    [key: string] : IMeterDemand[]
  };
  energyMetersList: IEnergyMeter[];
  metersTotalDemand: IMeterDemand[];
  maxTotalDemandMeasuredAllMeters: number;
  yPointsDemandTotalMeasuredAllMeters: number[];
  shouldShowConsumptionByMeter: boolean;
  selectedEnergyMeters: string[];
  selectedDay: null | undefined | IMeterDemand;
  setSelectedDay: Dispatch<SetStateAction<null | undefined | IMeterDemand>>
  selectedDayMeter: string;
  setSelectedDayMeter: Dispatch<SetStateAction<string>>;
  selectedDayMeterStr: string;
  setSelectedDayMeterStr: Dispatch<SetStateAction<string>>;
  totalConsumptionPeriod?: {
    totalKwh: number,
    totalCost: number,
    calc: boolean,
  },
  handleGetTelemetryDay: (day: string) => void
}): JSX.Element => {
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;

  const [state, render, setState] = useStateVar(() => ({
    downloadingPdf: false as boolean,
    showBaselines: false as boolean,
    defaultYTicks: [4, 3, 2, 1, 0],
  }));
  const {
    selectedDay, setSelectedDay, selectedDayMeter, setSelectedDayMeter, selectedDayMeterStr, setSelectedDayMeterStr,
  } = props;
  const metersColor = {};
  if (props.energyMetersList && props.energyMetersList.length) {
    props.energyMetersList.forEach((meter) => metersColor[meter.ENERGY_DEVICE_ID] = meter.color);
  }
  const monthNames = [t('mesesDoAno.jan'), t('mesesDoAno.fev'), t('mesesDoAno.mar'), t('mesesDoAno.abr'), t('mesesDoAno.mai'), t('mesesDoAno.jun'), t('mesesDoAno.jul'), t('mesesDoAno.ago'), t('mesesDoAno.set'), t('mesesDoAno.out'), t('mesesDoAno.nov'), t('mesesDoAno.dez')];
  const weekDayNames = [t('diasDaSemana.dom'), t('diasDaSemana.seg'), t('diasDaSemana.ter'), t('diasDaSemana.qua'), t('diasDaSemana.qui'), t('diasDaSemana.sex'), t('diasDaSemana.sab')];

  function checkDayMode() {
    if (props.filterMode && props.metersTotalDemand && props.metersTotalDemand.length === 1) {
      toggleChartMode(props.metersTotalDemand[0]);
    } else {
      setSelectedDay(null);
    }

    if (props.filterMode !== t('dia')) {
      props.changeChartMode('month');
    }
  }

  useEffect(() => {
    checkDayMode();
  }, [props.demandsByMeter, props.metersTotalDemand, props.filterMode, props.dateList]);

  function toggleChartMode(selectedDayCurrent?: IMeterDemand, meter?: string) {
    setSelectedDay(selectedDayCurrent || null);
    setSelectedDayMeter(meter || '');
    setSelectedDayMeterStr(selectedDayCurrent?.day || '');
    props.changeChartMode('day', selectedDayCurrent);
    render();
  }

  function tickYLabelFormatter(value: number) {
    let valueFormatted = '';
    let unit = 'k';
    if (value > 1000) {
      if (value > 1000) value /= 1000;
      unit = 'M';
    } else if (props.maxTotalDemandMeasuredAllMeters > 1000 && !props.shouldShowConsumptionByMeter && props.chartMode === 'month') {
      unit = 'M';
    }
    const decimalPlaces = Math.floor(value) === value ? 0 : 1;
    valueFormatted = formatNumberWithFractionDigits(value?.toFixed(decimalPlaces));
    const measurementUnitAux = !props.measurementUnit ? 'Wh' : `${props.measurementUnit}`;

    return `${valueFormatted}${unit}${measurementUnitAux}`;
  }

  function consumptionLabelFormatter(value: number) {
    let valueFormatted = '';
    let unit = 'k';
    if (value > 1000) {
      if (value > 1000) value /= 1000;
      unit = 'M';
    }

    const decimalPlaces = Math.floor(value) === value ? 0 : 1;
    valueFormatted = formatNumberWithFractionDigits(value?.toFixed(decimalPlaces));
    const measurementUnitAux = !props.measurementUnit ? 'Wh' : `${props.measurementUnit}`;

    return [`${valueFormatted ?? 0}`, `${unit}${measurementUnitAux}`];
  }

  function tickXLabelFormaterMonth(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    const numMonth = dateAux.getMonth();
    const mm = monthNames[numMonth];
    return `${mm}`;
  }

  function tickXLabelFormaterDay(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    return `${dateAux.getDate().toString()?.padStart(2, '0')}`;
  }

  function tickXLabelFormaterWeekDay(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    return (weekDayNames[dateAux.getDay()][0]);
  }

  function tickXLabelFormaterYear(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    const yy = dateAux.getFullYear();
    return `${yy}`;
  }

  function formatData(data: string) {
    if (data) {
      const mm = data.substring(5, 7);
      const dd = data.substring(8, 10);
      return `${dd}/${mm}`;
    }
  }

  function isLastDayOfWeek(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    return dateAux.getDay() === 6;
  }

  const handleGetTratedIcon = (flags) => {
    if (flags?.dataIsInvalid) {
      return isAdmin ? <WarnIcon /> : <InfoIcon />;
    }

    if (flags?.dataIsProcessed && isAdmin) {
      return <InfoIcon />;
    }

    return null;
  };

  function ToolTipContents(meter: string, dayIndex: number, hourIndex?: number, flags?: any) {
    const consumptionByMeter = (props.demandsByMeter && props.demandsByMeter[meter]) ? props.demandsByMeter[meter][dayIndex]?.day : '';
    const day = props.shouldShowConsumptionByMeter ? consumptionByMeter : props.metersTotalDemand[dayIndex]?.day;
    const dateAux = new Date(`${moment(day).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    const weekDayName = weekDayNames[dateAux.getDay()];

    if (!(props.demandsByMeter && props.demandsByMeter[meter]) && !props.metersTotalDemand) {
      return (<div className={styles.tooltipCustom} />);
    }
    let total = 0;
    if (props.energyMetersList && props.energyMetersList.length) {
      props.energyMetersList.forEach((meterCurrent) => {
        if (props.selectedEnergyMeters.includes(meterCurrent.ENERGY_DEVICE_ID) && Object.keys(props.demandsByMeter).includes(meterCurrent.ENERGY_DEVICE_ID)) {
          total += props.demandsByMeter[meterCurrent.ENERGY_DEVICE_ID][dayIndex]?.totalMeasured;
        }
      });
    }

    let message = '';
    let description = '';

    if (flags?.dataIsProcessed && isAdmin) {
      message = t('dadoTratado');
    }

    if (flags?.dataIsInvalid) {
      if (isAdmin) {
        message = t('dadoIncoerente');
      } else {
        message = t('naoFoiPossivelColetarDado');
        description = t('paraMaisDetalhes');
      }
    }

    if (props.energyMetersList.length <= 1 || props.chartMode === 'day') {
      const demandToShow = props.shouldShowConsumptionByMeter ? props.demandsByMeter[meter][dayIndex]?.totalMeasured || 0 : props.metersTotalDemand[dayIndex]?.totalMeasured;
      return (
        <div className={styles.tooltipCustom}>
          <div className={styles.tooltipCustom}>
            {flags?.dataIsInvalid && !isAdmin ? <></> : (
              <div className={styles.tooltipCustom} style={{ fontSize: '95%' }}>
                <>
                  <strong>{`${weekDayName} - ${formatData(day)}`}</strong>
                  <br />
                </>
                <span>R$</span>
                <strong>&nbsp;-</strong>
                <span> | </span>
                <strong>
                  {hourIndex === 0 ? (` ${tickYLabelFormatter(selectedDay?.hours[0]?.totalMeasured || 0)}`) : (
                    <>
                      {hourIndex && ` ${tickYLabelFormatter(selectedDay?.hours[hourIndex]?.totalMeasured || 0)}`}
                      {!hourIndex && ` ${tickYLabelFormatter(demandToShow)}`}
                    </>
                  )}

                </strong>
                <br />
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              {(flags?.dataIsInvalid && !isAdmin) && (<strong>{`${weekDayName} - ${formatData(day)}`}</strong>)}
              <div style={{ display: 'flex', gap: '8px', maxWidth: '172px' }}>

                <div style={{ alignSelf: 'start' }}>
                  {handleGetTratedIcon(flags)}
                </div>
                <div style={{
                  display: 'flex', gap: '8px', maxWidth: '142px', flexDirection: 'column',
                }}
                >
                  <span style={{
                    fontWeight: '700', fontSize: '12px', fontFamily: 'Inter', color: '#565656',
                  }}
                  >
                    {message}
                  </span>
                  {(flags?.dataIsInvalid && !isAdmin) && (
                  <p style={{
                    fontWeight: '400', fontSize: '11px', fontFamily: 'Inter', color: '#565656',
                  }}
                  >
                    {t(description)}
                  </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.tooltipCustom}>
        <div className={styles.tooltipCustom}>
          <div className={styles.tooltipCustom} style={{ fontSize: '95%', width: flags?.dataIsInvalid && !isAdmin ? '' : '300px' }}>

            {flags?.dataIsInvalid && !isAdmin ? <></> : (
              <>
                <>
                  <strong>{`${weekDayName} - ${formatData(day)}`}</strong>
                  <div style={{
                    marginTop: '8px', backgroundColor: '#F5F5F5', height: '3px', width: '100%',
                  }}
                  />
                  <div style={{ marginBottom: '10px' }}>
                    <strong>
                      {t('totalDaUnidade')}
                      :
                      {' '}
                    </strong>

                    <span>R$</span>
                    <strong>&nbsp;-&nbsp;</strong>
                    <span> | </span>
                    <strong>
                      <>
                        {!hourIndex && ` ${consumptionLabelFormatter(total)[0]}`}
                      </>

                    </strong>
                    {!hourIndex && ` ${consumptionLabelFormatter(total)[1]}`}

                  </div>
                </>
                <Flex mt="8px" width="100%" justifyContent="space-between" alignItems="center" flexWrap="wrap" flexDirection="row">
                  {props.energyMetersList.map((meterCurrent, index) => (
                    props.selectedEnergyMeters.includes(meterCurrent.ENERGY_DEVICE_ID) && (
                    <Box width="50%" marginBottom="8px">
                      <>
                        <strong>{meterCurrent.ESTABLISHMENT_NAME || `${t('estabelecimento')} ${index + 1}`}</strong>
                      </>
                      <br />
                      <>
                        <strong>
                          {t('total')}
                          :
                          {' '}
                        </strong>

                        <span>R$</span>
                        <strong>&nbsp;-&nbsp;</strong>
                        <span> | </span>
                        <strong>
                          <>
                            {!hourIndex && ` ${consumptionLabelFormatter(Object.keys(props.demandsByMeter).includes(meterCurrent.ENERGY_DEVICE_ID) ? props.demandsByMeter[meterCurrent.ENERGY_DEVICE_ID][dayIndex]?.totalMeasured : 0)[0]}`}
                          </>

                        </strong>
                        {!hourIndex && ` ${consumptionLabelFormatter(Object.keys(props.demandsByMeter).includes(meterCurrent.ENERGY_DEVICE_ID) ? props.demandsByMeter[meterCurrent.ENERGY_DEVICE_ID][dayIndex]?.totalMeasured : 0)[1]}`}

                      </>
                    </Box>
                    )
                  ))}

                </Flex>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              {(flags?.dataIsInvalid && !isAdmin) && (<strong>{`${weekDayName} - ${formatData(day)}`}</strong>)}
              <div style={{ display: 'flex', gap: '8px', maxWidth: '172px' }}>
                <div style={{ alignSelf: 'start' }}>
                  {handleGetTratedIcon(flags)}
                </div>
                <div style={{
                  display: 'flex', gap: '8px', maxWidth: '142px', flexDirection: 'column',
                }}
                >
                  <span style={{
                    fontWeight: '700', fontSize: '12px', fontFamily: 'Inter', color: '#565656',
                  }}
                  >
                    {message}
                  </span>
                  {(flags?.dataIsInvalid && !isAdmin) && (
                  <p style={{
                    fontWeight: '400', fontSize: '11px', fontFamily: 'Inter', color: '#565656',
                  }}
                  >
                    {t(description)}
                  </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function downloadPdf(month: string) {
    if (!Object.keys(props.demandsByMeter).length) return;
    try {
      setState({ downloadingPdf: true });
      const params = { unit_id: props.unitId, month };
      const pdfResponse = await apiCallDownload('/invoice/get-invoice-pdf', params);

      const link: any = document.getElementById('downloadLink');

      if (link.href !== '#') {
        window.URL.revokeObjectURL(link.href);
      }
      link.href = window.URL.createObjectURL(pdfResponse.data);
      link.download = `Unidade_${props.unitId}-${month.substring(0, 10)}.pdf`;
      link.click();
      toast.success(t('sucessoPDF'));
    } catch (err) {
      console.log(err); toast.error(t('erroPDF'));
    }
    setState({ downloadingPdf: false });
  }

  function sumTotalDemands(demands: IMeterDemand[]) {
    return demands?.reduce((acc, demand) => {
      if (demand.totalMeasured) {
        acc += demand.totalMeasured;
      }
      return acc;
    }, 0) || 0;
  }

  function calculateTotal() {
    let total = 0;
    if (props.chartMode === 'month') {
      if (props.shouldShowConsumptionByMeter) {
        Object.keys(props.demandsByMeter).forEach((meter) => {
          if (props.selectedEnergyMeters.includes(meter)) {
            total += sumTotalDemands(props.demandsByMeter[meter]);
          }
        });
      } else {
        total = sumTotalDemands(props.metersTotalDemand);
      }
    }
    if (props.chartMode === 'day') {
      total = selectedDay?.totalMeasured || 0;
    }

    const [resultValue, resultUnit] = convertEnergy(total);
    return [formatNumberWithFractionDigits(resultValue.toFixed()), `${resultUnit}h`];
  }

  const getEstablishmentName = (meterId: string) => {
    let establishmentName = '';

    props.energyMetersList.forEach((meter, index) => {
      if (meter.ENERGY_DEVICE_ID === meterId) establishmentName = meter.ESTABLISHMENT_NAME || `${t('estabelecimento')} ${index + 1}`;
    });

    return establishmentName;
  };

  let initWeek = false;

  const handleGetTratedData = (data) => {
    if (data?.dataIsInvalid) {
      if (isAdmin) {
        return <WarnIcon style={{ margin: '1px 0 0 0' }} color="#F3B107" width="15" height="15" />;
      }
      return <InfoIcon color="#A9A9A9" width="15" height="15" />;
    }

    if (data?.dataIsProcessed) {
      if (isAdmin) {
        return <InfoIcon color="#A9A9A9" width="15" height="15" />;
      }
      return <></>;
    }
  };

  const handleGetLegendTratedData = (tooltipId) => {
    const monthDataLength = 30;
    const dayDataLength = 24;

    const lengthConstant = props.chartMode === 'day' ? dayDataLength : monthDataLength;
    const percentageValue = (10 * (lengthConstant ?? 1)) / 100;
    let countDataIsInvalid = 0;
    let countDataIsProcessed = 0;

    if (props.chartMode === 'day') {
      selectedDay?.hours.forEach((hour) => {
        if (hour?.dataIsInvalid) {
          countDataIsInvalid++;
        } else if (hour?.dataIsProcessed) {
          countDataIsProcessed++;
        }
      });
    } else {
      props.metersTotalDemand.forEach((demand) => {
        if (demand?.dataIsInvalid) {
          countDataIsInvalid++;
        } else if (demand?.dataIsProcessed) {
          countDataIsProcessed++;
        }
      });
    }

    let Icon = isAdmin ? WarnIcon : InfoIcon;
    let iconColor = isAdmin ? '#F3B107' : '#A9A9A9';
    let message = isAdmin ? 'dadoIncoerente' : 'naoFoiPossivelColetarDado';
    let description = isAdmin ? 'dadoIncoerenteDesc' : 'paraMaisDetalhes';

    let showTooltip = true;

    if (isAdmin && (countDataIsInvalid !== 0 || countDataIsProcessed !== 0)) {
      if (countDataIsInvalid >= countDataIsProcessed) {
        Icon = WarnIcon;
        iconColor = '#F3B107';
        message = 'dadoIncoerente';
        description = 'dadoIncoerenteDesc';
      } else {
        Icon = InfoIcon;
        iconColor = '#A9A9A9';
        message = 'naoFoiPossivelColetarDado';
        description = 'paraMaisDetalhes';
      }
    } else if (countDataIsInvalid + countDataIsProcessed >= percentageValue) {
      Icon = InfoIcon;
      iconColor = '#A9A9A9';
      message = 'naoFoiPossivelColetarDado';
      description = 'paraMaisDetalhes';
    } else {
      showTooltip = false;
    }

    return showTooltip === true ? (
      <div>
        <Icon color={iconColor} width="15" height="15" data-tip={tooltipId} data-for={`legend-${tooltipId}`} />
        <ReactTooltip
          id={`legend-${tooltipId}`}
          place="top"
          effect="solid"
        >
          <NoInfoTooltip>
            <Icon color="#FFFFFF" width="15" height="15" />
            <div>
              <span>{t(message)}</span>
              <p>{t(description)}</p>
            </div>
          </NoInfoTooltip>
        </ReactTooltip>
      </div>
    ) : <></>;
  };

  const handleGetBarColor = (data) => {
    if (data?.dataIsInvalid) {
      return isAdmin ? '#92cc9a' : '';
    }
    return metersColor[data] || '#92cc9a';
  };

  const handleCanView = () => {
    const monthDataLength = props.metersTotalDemand.length;
    const dayDataLength = selectedDay?.hours.length;

    const lengthConstant = props.chartMode === 'day' ? dayDataLength : monthDataLength;
    const percentageValue = (10 * (lengthConstant ?? 1)) / 100;
    let countDataIsInvalid = 0;
    let countDataIsProcessed = 0;
    let canView = false;

    if (props.chartMode === 'day') {
      selectedDay?.hours.forEach((hour) => {
        if (hour?.dataIsInvalid) {
          countDataIsInvalid++;
        } else if (hour?.dataIsProcessed) {
          countDataIsProcessed++;
        }
      });
    } else {
      props.metersTotalDemand.forEach((demand) => {
        if (demand?.dataIsInvalid) {
          countDataIsInvalid++;
        } else if (demand?.dataIsProcessed) {
          countDataIsProcessed++;
        }
      });
    }

    if (countDataIsInvalid + countDataIsProcessed < percentageValue && !isAdmin) {
      canView = true;
    } else if (countDataIsInvalid >= countDataIsProcessed) {
      if (isAdmin) {
        canView = true;
      } else {
        canView = false;
      }
    } else if (countDataIsProcessed > countDataIsInvalid) {
      canView = true;
    }

    return canView;
  };

  const handleCanClick = (data) => {
    if (data?.dataIsInvalid && !isAdmin) {
      return false;
    }
    return true;
  };

  return (
    <>
      <Flex flexDirection="column" alignItems="center" style={{ gap: '20px' }}>
        <div style={{ width: '100%' }}>
          <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
            <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mt={35} pr={15} mb={!props.isReduced ? 4 : 3} />
          </Flex>
          <div style={
          {
            fontSize: '75%', fontFamily: 'sans-serif', paddingLeft: '35px',
          }
        }
          >
            <div className={styles.ChartContainer1}>
              {(props.chartMode !== 'month' || props.filterMode !== t('mes')) && props.yPointsTotalMeasured && props.yPointsTotalMeasured.map((_label, i) => (
                <div
                  key={i / (props.yPointsTotalMeasured.length - 1)}
                  className={styles.HorizontalGrid}
                  style={{
                    top: `${Math.round(1000 / (props.yPointsTotalMeasured.length - 1) * i) / 10}%`,
                    left: '53px',
                    width: 'calc(100% - 63px)',
                  }}
                />
              ))}
              {props.chartMode === 'day' && selectedDay && selectedDay.yPointsHoursMeasured && selectedDay.yPointsHoursMeasured.map((label, i) => (
                <div
                  key={i / ((selectedDay?.yPointsHoursMeasured.length || 0) - 1)}
                  className={styles.VerticalLabels}
                  style={{ top: `calc(${Math.round(100 / ((selectedDay?.yPointsHoursMeasured.length || 0) - 1) * i) - 5}%)` }}
                >
                  {tickYLabelFormatter(label)}
                </div>
              ))}
              {props.chartMode === 'day' && !selectedDay && state.defaultYTicks.map((label, i) => (
                <div
                  key={i / ((state.defaultYTicks.length || 0) - 1)}
                  className={styles.VerticalLabels}
                  style={{ top: `calc(${Math.round(100 / ((state.defaultYTicks.length || 0) - 1) * i) - 5}%)` }}
                >
                  {tickYLabelFormatter(label)}
                </div>
              ))}
              {props.chartMode === 'month' && props.shouldShowConsumptionByMeter && props.yPointsTotalMeasured && props.yPointsTotalMeasured.map((label, i) => (
                <div
                  key={i / (props.yPointsTotalMeasured.length - 1)}
                  className={styles.VerticalLabels}
                  style={{ top: `calc(${Math.round(100 / (props.yPointsTotalMeasured.length - 1) * i) - 5}%)` }}
                >
                  {tickYLabelFormatter(label)}
                </div>
              ))}
              {props.chartMode === 'month' && !props.shouldShowConsumptionByMeter && props.yPointsDemandTotalMeasuredAllMeters && props.yPointsDemandTotalMeasuredAllMeters.map((label, i) => (
                <div
                  key={i / (props.yPointsDemandTotalMeasuredAllMeters.length - 1)}
                  className={styles.VerticalLabels}
                  style={{ top: `calc(${Math.round(100 / (props.yPointsDemandTotalMeasuredAllMeters.length - 1) * i) - 5}%)` }}
                >
                  {tickYLabelFormatter(label)}
                </div>
              ))}
              <div className={styles.ChartContainer}>
                {props.chartMode === 'day' && selectedDay && selectedDay.hours.map((hour, i) => (
                // @ts-ignore
                  <div key={hour.hour} className={!props.isReduced ? styles.DayBarContainer : styles.BarContainerReduced} style={{ flexBasis: `${100 / state.selectedDay?.hours.length}%` }}>
                    <div
                      className={styles.BarSubContainer}
                      style={{
                        height: `${hour.percentageTotalMeasured?.toString()}%`,
                      }}
                      data-tip
                      data-for={`room-${hour.hour}-${selectedDayMeter}-${i}`}
                    >
                      <div key={i} style={{ height: '100%', backgroundColor: handleGetBarColor(hour) }} />
                    </div>
                    <ReactTooltip
                      id={`room-${hour.hour}-${selectedDayMeter}-${i}`}
                      place="top"
                      effect="solid"
                      delayHide={100}
                      offset={{ top: 0, left: 10 }}
                      textColor="#000000"
                      border
                      backgroundColor="rgba(255, 255, 255, 0.97)"
                      className={styles.tooltipHolder}
                    >
                      {ToolTipContents(selectedDayMeter, (!props.shouldShowConsumptionByMeter ? props.metersTotalDemand.findIndex((demand) => demand === selectedDay) : props.demandsByMeter[selectedDayMeter].findIndex((demand) => demand === selectedDay)) || 0, i, { dataIsInvalid: hour.dataIsInvalid, dataIsProcessed: hour.dataIsProcessed })}
                    </ReactTooltip>
                  </div>
                ))}
                {props.chartMode === 'month' && props.shouldShowConsumptionByMeter && props.demandsByMeter && Object.keys(props.demandsByMeter).length !== 0 && props.demandsByMeter[Object.keys(props.demandsByMeter)[0]].map((_, i) => (
                  <>
                    { tickXLabelFormaterWeekDay(props.demandsByMeter[Object.keys(props.demandsByMeter)[0]][i]?.day) === weekDayNames[0][0] && props.filterMode === t('mes') && (initWeek = !initWeek) }

                    {Object.keys(props.demandsByMeter).map((meter, index) => (
                      <>

                        { /* @ts-ignore */ }
                        <div key={`${props.demandsByMeter[meter][i]?.day}-${meter}`} className={!props.isReduced ? styles.MonthBarContainer : styles.BarContainerReduced} style={{ flexBasis: `${100 / (Object.keys(props.demandsByMeter).length * props.demandsByMeter[Object.keys(props.demandsByMeter)[0]].length)}%`, backgroundColor: initWeek ? '#F5F5F5' : '' }}>
                          <div
                            className={styles.BarSubContainerMultipleMeters}
                            data-tip
                            data-for={`room-${meter}-${i}-${index}`}
                            style={{
                              height: `${props.demandsByMeter[meter][i]?.percentageTotalMeasured?.toString()}%`,
                            }}
                          >

                            {props.selectedEnergyMeters.includes(meter) && (
                              <div
                                key={`${meter}-${i}`}
                                style={{ height: '100%', backgroundColor: handleGetBarColor(props.demandsByMeter[meter][i]) }}
                                onClick={() => {
                                  if (!handleCanClick(props.demandsByMeter[meter][i])) return;
                                  toggleChartMode(props.demandsByMeter[meter][i], meter);
                                }}
                              />
                            )}
                          </div>
                          <ReactTooltip
                            id={`room-${meter}-${i}-${index}`}
                            place="top"
                            effect="solid"
                            delayHide={100}
                            offset={{ top: 0, left: 10 }}
                            textColor="#000000"
                            border
                            backgroundColor="rgba(255, 255, 255, 0.97)"
                            className={styles.tooltipHolder}
                          >
                            {ToolTipContents(meter, i, undefined, { dataIsInvalid: props.demandsByMeter[meter][i].dataIsInvalid, dataIsProcessed: props.demandsByMeter[meter][i].dataIsProcessed })}
                          </ReactTooltip>
                        </div>
                        {index === Object.keys(props.demandsByMeter).length - 1 && (
                        <div key={`${props.demandsByMeter[meter][i]?.day}-${meter}`} className={!props.isReduced ? styles.MonthBarContainer : styles.BarContainerReduced} style={{ flexBasis: `${100 / (Object.keys(props.demandsByMeter).length * props.demandsByMeter[Object.keys(props.demandsByMeter)[0]].length)}%`, backgroundColor: initWeek && !isLastDayOfWeek(props.demandsByMeter[Object.keys(props.demandsByMeter)[0]][i]?.day) ? '#F5F5F5' : '' }}>
                          <div
                            className={styles.BarSubContainerMultipleMeters}
                          >
                            <div key={`${meter}-${i}`} style={{ height: '100%', backgroundColor: 'transparent' }} />
                          </div>
                        </div>
                        )}
                      </>
                    ))}

                  </>
                ))}
                {props.chartMode === 'month' && !props.shouldShowConsumptionByMeter && props.metersTotalDemand && props.metersTotalDemand.map((demand, i) => (
                  <>
                    {tickXLabelFormaterWeekDay(demand.day) === weekDayNames[0][0] && props.filterMode === t('mes') && (initWeek = !initWeek)}
                    {/* @ts-ignore */}
                    <div key={demand.day} className={!props.isReduced ? styles.MonthBarContainer : styles.BarContainerReduced} style={{ flexBasis: `${100 / props.metersTotalDemand.length}%`, backgroundColor: initWeek ? '#F5F5F5' : '' }}>
                      <div
                        className={styles.BarSubContainer}
                        style={{
                          height: `${demand.percentageTotalMeasured?.toString()}%`,
                        }}
                        data-tip
                        data-for={`room-${demand.day}`}
                      >
                        <div
                          key={i}
                          style={{ height: '100%', backgroundColor: handleGetBarColor(demand) }}
                          onClick={() => {
                            if (!handleCanClick(demand)) return;
                            props.handleGetTelemetryDay(demand.day);
                            toggleChartMode(demand);
                          }}
                        />
                      </div>
                      <ReactTooltip
                        id={`room-${demand.day}`}
                        place="top"
                        effect="solid"
                        delayHide={100}
                        offset={{ top: 0, left: 10 }}
                        textColor="#000000"
                        border
                        backgroundColor="rgba(255, 255, 255, 0.97)"
                        className={styles.tooltipHolder}
                      >
                        {ToolTipContents('', i, undefined, { dataIsInvalid: demand.dataIsInvalid, dataIsProcessed: demand.dataIsProcessed })}
                      </ReactTooltip>
                    </div>
                  </>
                ))}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingLeft: '36px',
                fontWeight: 'bold',
              }}
            >
              {props.chartMode === 'month' && props.shouldShowConsumptionByMeter && props.demandsByMeter && Object.keys(props.demandsByMeter).length !== 0 && props.demandsByMeter[Object.keys(props.demandsByMeter)[0]].map((demand) => (
                <div
                  className={!props.isReduced ? styles.XAxis : styles.XAxisReduced}
                // @ts-ignore
                  style={{ flexBasis: `${100 / props.demandsByMeter[Object.keys(props.demandsByMeter)[0]].length}%`, fontWeight: tickXLabelFormaterWeekDay(demand.day) === 'D' ? 'bold' : 'normal' }}
                >
                  <span>
                    {tickXLabelFormaterDay(demand.day)}
                  </span>
                  <span>
                    <span style={{ fontSize: '10px' }}>
                      {tickXLabelFormaterWeekDay(demand.day)}
                    </span>
                  </span>
                  {handleGetTratedData(demand)}
                </div>
              ))}

              {props.chartMode === 'month' && !props.shouldShowConsumptionByMeter && props.metersTotalDemand && props.metersTotalDemand.map((demand) => (
                <div
                  className={!props.isReduced ? styles.XAxis : styles.XAxisReduced}
                // @ts-ignore
                  style={{ flexBasis: `${100 / props.metersTotalDemand.length}%`, fontWeight: tickXLabelFormaterWeekDay(demand.day) === 'D' ? 'bold' : 'normal' }}
                >
                  <span>
                    {tickXLabelFormaterDay(demand.day)}
                  </span>
                  <span>
                    <span style={{ fontSize: '10px' }}>
                      {tickXLabelFormaterWeekDay(demand.day)}
                    </span>
                  </span>
                  {handleGetTratedData(demand)}
                </div>
              ))}
              {props.chartMode === 'day' && selectedDay && selectedDay.hours.map((hour) => (
                <div
                  className={!props.isReduced ? styles.XAxis : styles.XAxisReduced}
                // @ts-ignore
                  style={{ flexBasis: `${100 / selectedDay.hours.length}%`, fontWeight: 'normal' }}
                >
                  <span>
                    {hour.hour?.padStart(2, '0').concat(':00')}
                  </span>
                  {handleGetTratedData(hour)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider height={1} />

        <Flex flexDirection="column" padding="0px 40px" fontSize="15px">
          <div>
            <ChartLegendTitle>{t('Consumo')}</ChartLegendTitle>
          </div>
          <ChartLegendContainer>
            <ChartInfoContainer>
              <ChartInfoTitle>
                {t('total')}
                {' '}
                (
                {calculateTotal()[1]}
                )
              </ChartInfoTitle>
              <ChartInfoDataContainer>
                {handleCanView() && (
                <ChartInfo>
                  {calculateTotal()[0]}
                  {' '}
                  <span>{calculateTotal()[1]}</span>
                </ChartInfo>
                )}
                {handleGetLegendTratedData('total')}
              </ChartInfoDataContainer>
            </ChartInfoContainer>
            {
              props.totalConsumptionPeriod && props.totalConsumptionPeriod.calc === true ? (
                <ChartInfoContainer>
                  <ChartInfoTitle>
                    {t('total')}
                    {' '}
                    (R$)
                  </ChartInfoTitle>
                  <ChartInfoDataContainer>
                    {handleCanView() && (
                    <ChartInfo>
                      <span>R$</span>
                      {' '}
                      {thousandPointFormat(props.totalConsumptionPeriod.totalCost)}
                    </ChartInfo>
                    )}
                    {handleGetLegendTratedData('totalCost')}
                    <div style={{ visibility: 'hidden' }}>
                      {handleGetLegendTratedData('total')}
                    </div>
                  </ChartInfoDataContainer>
                </ChartInfoContainer>
              ) : null
            }
          </ChartLegendContainer>
        </Flex>
      </Flex>
      {selectedDayMeterStr !== '' && selectedDayMeter && props.chartMode === 'day' && (
      <p style={{ marginTop: '15px' }}>
        <span style={{ fontWeight: 'bold' }}>
          {t('consumoDiarioDoEstabelecimento')}
          :
          {' '}
        </span>
        {' '}
        {getEstablishmentName(selectedDayMeter)}
      </p>
      )}
    </>

  );
};
