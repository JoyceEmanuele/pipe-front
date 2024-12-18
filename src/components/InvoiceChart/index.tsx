import { useState } from 'react';

import { Flex } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { ToggleSwitchMini } from '../ToggleSwitch';
import styles from './styles.module.css';
import { apiCallDownload } from '../../providers';
import ReactTooltip from 'react-tooltip';
import { useStateVar } from '../../helpers/useStateVar';
import { toast } from 'react-toastify';
import Checkbox from '@material-ui/core/Checkbox';
import {
  BtnList,
  Text,
  CheckboxLine,
  Overlay,
} from './styles';
import { useCard } from '~/contexts/CardContext';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const InvoiceChart = (props: {
  unitId: number
  invoices: null|{
    month: string,
    periodFrom?: string,
    periodUntil?: string,
    totalCharges: number,
    totalMeasured: number,
    percentageTotalCharges: number,
    percentageTotalMeasured: number,
    baselinePrice?: number,
    baselineKwh?: number,
    percentageBaselinePrice?: number,
    percentageBaselineKwh?: number,
    percentageInvoices?: number,
  }[];
  yPointsTotalCharges: number[];
  yPointsTotalMeasured: number[];
  displayBaselineOption: boolean;
  displayPdfOption: boolean;
  isReduced: boolean;
  isLoading?: boolean;
  measurementUnit?: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const monthNames = [t('mesesDoAno.jan'), t('mesesDoAno.fev'), t('mesesDoAno.mar'), t('mesesDoAno.abr'), t('mesesDoAno.mai'), t('mesesDoAno.jun'), t('mesesDoAno.jul'), t('mesesDoAno.ago'), t('mesesDoAno.set'), t('mesesDoAno.out'), t('mesesDoAno.nov'), t('mesesDoAno.dez')];
  const [state, render, setState] = useStateVar(() => ({
    downloadingPdf: false as boolean,
    showBaselines: false as boolean,
  }));

  const [toggleSwitchInvoice, setToggleSwitchInvoice] = useState(false);

  function tickYLabelFormatter(value: number, switchInvoice: boolean, decimalPlaces: number) {
    let valueFormatted = '';
    valueFormatted = formatNumberWithFractionDigits(value.toFixed(decimalPlaces), { minimum: 0, maximum: decimalPlaces });
    const measurementUnitAux = !props.measurementUnit ? ' kWh' : ` ${props.measurementUnit}`;

    const result = `${!switchInvoice ? 'R$ ' : ''}${valueFormatted}${switchInvoice ? measurementUnitAux : ''}`;
    return result;
  }

  function tickXLabelFormaterMonth(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    const numMonth = dateAux.getMonth();
    const mm = t(monthNames[numMonth]);
    return `${mm}`;
  }

  function tickXLabelFormaterYear(date: string) {
    const dateAux = new Date(`${moment(date).format('YYYY-MM-DD')}T00:00:00Z`);
    dateAux.setDate(dateAux.getDate() + 1);
    const yy = dateAux.getFullYear();
    return `${yy}`;
  }

  function formatData(data: string) {
    const mm = data.substring(5, 7);
    const dd = data.substring(8, 10);
    return `${dd}/${mm}`;
  }

  function ToolTipContents(dayIndex: number) {
    const month = props.invoices ? props.invoices[dayIndex].month : '';
    const dateFrom = props.invoices ? new Date(props.invoices[dayIndex].periodFrom || '2000-01-01') : new Date();
    const dateUntil = props.invoices ? new Date(props.invoices[dayIndex].periodUntil || '2000-01-01') : new Date();
    const timeDifference = Math.abs(dateFrom.getTime() - dateUntil.getTime());
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    // Variation with baseline

    if (!props.invoices) {
      return (<div className={styles.tooltipCustom} />);
    }

    const differencePrice = (props.invoices[dayIndex].baselinePrice || 0) - props.invoices[dayIndex].totalCharges;
    const differenceKwh = (props.invoices[dayIndex].baselineKwh || 0) - props.invoices[dayIndex].totalMeasured;

    const variationPrice = (props.invoices[dayIndex].baselinePrice || 0) > 0 ? (Math.abs(differencePrice) * 100) / (props.invoices[dayIndex].baselinePrice || 1) : 0;
    let ternaryAuxArrow = (differencePrice > 0 ? ' ▼' : ' ▲');
    let ternaryAuxSignal = (differencePrice > 0 ? ' -' : ' +');
    const variationPriceExib = `${differencePrice === 0 ? '' : ternaryAuxSignal}${formatNumberWithFractionDigits(variationPrice.toFixed(2), { minimum: 0, maximum: 2 })}%
      ${differencePrice === 0 ? '' : ternaryAuxArrow}`;

    const variationKwh = (props.invoices[dayIndex].baselineKwh || 0) > 0 ? (Math.abs(differenceKwh) * 100) / (props.invoices[dayIndex].baselineKwh || 1) : 0;
    ternaryAuxArrow = (differenceKwh > 0 ? ' ▼' : ' ▲');
    ternaryAuxSignal = (differenceKwh > 0 ? ' -' : ' +');
    const variationKwhExib = `${differenceKwh === 0 ? '' : ternaryAuxSignal}${formatNumberWithFractionDigits(variationKwh.toFixed(2), { minimum: 0, maximum: 2 })}%
    ${differenceKwh === 0 ? '' : ternaryAuxArrow}`;

    const decimalPalcesToMeasured = (props.measurementUnit || 'kWh') === 'kWh' ? 0 : 1;

    return (
      <div className={styles.tooltipCustom}>
        <div className={styles.tooltipCustom}>
          <div className={styles.tooltipCustom} style={{ fontSize: '95%' }}>
            {!props.isReduced ? (
              <>
                <strong>
                  {`${t('periodo')}:`}
                </strong>
                {` ${formatData(props.invoices[dayIndex].periodFrom || '2000-01-01')} a ${formatData(props.invoices[dayIndex].periodUntil || '2000-01-01')}`}
                <b style={{ fontSize: '80%' }}>
                  {` (${daysDifference.toString()} dias)`}
                </b>
                <br />
              </>
            ) : (
              <>
                <strong>
                  {`${t('faturasContabilizadas')}:`}
                </strong>
                <b>
                  {` ${props.invoices[dayIndex].percentageInvoices != null ? props.invoices[dayIndex].percentageInvoices?.toFixed(0) : 0}%`}
                </b>
              </>
            )}
            <div style={{ marginTop: '3px' }} />
            <svg width="11" height="11">
              <rect width="11" height="11" style={{ fill: '#92cc9a' }} />
            </svg>
            <strong>
              {` ${t('custo')}:`}
            </strong>
            {` ${tickYLabelFormatter(props.invoices[dayIndex].totalCharges, false, 0)}`}
            {props.displayBaselineOption && (
              <b style={{ fontSize: '80%', color: differencePrice > 0 ? 'green' : 'red' }}>
                {` ${variationPriceExib}`}
              </b>
            )}
            <br />
            {props.displayBaselineOption && (
              <>
                <strong style={{ marginLeft: '15px' }}>
                  {' Baseline:'}
                </strong>
                {` ${tickYLabelFormatter(props.invoices[dayIndex].baselinePrice || 0, false, 0)}`}
                <br />
              </>
            )}
            <div style={{ marginTop: '5px' }} />
            <svg width="11" height="11">
              <rect width="11" height="11" style={{ fill: '#424242' }} />
            </svg>
            <strong>
              {` ${t('consumo')}:`}
            </strong>
            {` ${tickYLabelFormatter(props.invoices[dayIndex].totalMeasured, true, decimalPalcesToMeasured)}`}
            {props.displayBaselineOption && (
              <b style={{ fontSize: '80%', color: differenceKwh > 0 ? 'green' : 'red' }}>
                {` ${variationKwhExib}`}
              </b>
            )}
            <br />
            {props.displayBaselineOption && (
              <>
                <strong style={{ marginLeft: '15px' }}>
                  {' Baseline:'}
                </strong>
                {` ${tickYLabelFormatter(props.invoices[dayIndex].baselineKwh || 0, true, 0)}`}
                <br />
              </>
            )}
            <a href="#" style={{ display: 'none' }} id="downloadLink" />
            {props.displayPdfOption && (
              <BtnList variant="primary" style={{ marginTop: '10px' }} onClick={() => (state.downloadingPdf ? null : downloadPdf(month))}>
                <div style={{ marginTop: '3px' }} />
                {t('baixarFaturaEmPDF')}
              </BtnList>
            )}
          </div>
        </div>
      </div>
    );
  }

  async function downloadPdf(month: string) {
    if (!props.invoices) return;
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

  const { cards } = useCard();
  const energyCard = cards.find((card) => card.title === 'Ef. Energética');

  return (
    <>
      <div>
        <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mt={energyCard?.isExpanded ? '4px' : 35} pr={15} mb={!props.isReduced ? 4 : 3}>
            <p style={energyCard?.isExpanded ? { marginBottom: '0' } : { marginBottom: '8px' }}>
              {t('custoTotal')}
              <ToggleSwitchMini checked={toggleSwitchInvoice} style={{ marginLeft: '10px', marginRight: '10px' }} onClick={() => setToggleSwitchInvoice(!toggleSwitchInvoice)} />
              {`${t('total')} em ${props.measurementUnit || 'kWh'}`}
            </p>
          </Flex>
          {props.displayBaselineOption && (
            <Flex flexWrap="wrap" justifyContent="right" alignItems="right" mt={35} pl={25} pr={15} mb={4}>
              <CheckboxLine>
                <Checkbox
                  checked={state.showBaselines}
                  style={{ marginLeft: '-10px' }}
                  onChange={() => { state.showBaselines = !state.showBaselines; render(); }}
                  color="primary"
                />
                <Text>
                  Baseline
                </Text>
              </CheckboxLine>
            </Flex>
          )}
        </Flex>
        <div style={
          {
            fontSize: '75%', fontFamily: 'sans-serif', paddingLeft: '35px',
          }
        }
        >
          <div className={styles.ChartContainer1}>
            <div className={styles.ChartContainer}>
              {props.invoices && props.invoices.map((invoice) => (
                <div key={invoice.month} className={!props.isReduced ? styles.BarContainer : styles.BarContainerReduced}>
                  <div
                    style={{
                      width: '1px',
                      height: '100%',
                      borderLeft: '1px dashed lightgrey',
                      margin: '0 auto',
                    }}
                  />
                </div>
              ))}
            </div>
            {!toggleSwitchInvoice && props.yPointsTotalCharges && props.yPointsTotalCharges.map((_label, i) => (
              <div
                key={i / (props.yPointsTotalCharges.length - 1)}
                className={styles.HorizontalGrid}
                style={{
                  top: `${Math.round(1000 / (props.yPointsTotalCharges.length - 1) * i) / 10}%`,
                  left: '53px',
                  width: 'calc(100% - 63px)',
                }}
              />
            ))}
            {toggleSwitchInvoice && props.yPointsTotalMeasured && props.yPointsTotalMeasured.map((_label, i) => (
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
            {!toggleSwitchInvoice && props.yPointsTotalCharges && props.yPointsTotalCharges.map((label, i) => (
              <span
                key={i / (props.yPointsTotalCharges.length - 1)}
                className={styles.VerticalLabels}
                style={{ top: `calc(${Math.round(100 / (props.yPointsTotalCharges.length - 1) * i) - 5}%)` }}
              >
                {tickYLabelFormatter(label, toggleSwitchInvoice, 0)}
              </span>
            ))}
            {toggleSwitchInvoice && props.yPointsTotalMeasured && props.yPointsTotalMeasured.map((label, i) => (
              <div
                key={i / (props.yPointsTotalMeasured.length - 1)}
                className={styles.VerticalLabels}
                style={{ top: `calc(${Math.round(100 / (props.yPointsTotalMeasured.length - 1) * i) - 5}%)` }}
              >
                {tickYLabelFormatter(label, toggleSwitchInvoice, 0)}
              </div>
            ))}
            <div className={styles.ChartContainer}>
              {props.invoices && props.invoices.map((invoice, i) => (
                <div key={invoice.month} className={!props.isReduced ? styles.BarContainer : styles.BarContainerReduced}>
                  <div
                    className={styles.BarSubContainer}
                    style={{ height: `${!toggleSwitchInvoice ? invoice.percentageTotalCharges.toString() : invoice.percentageTotalMeasured.toString()}%` }}
                    data-tip
                    data-for={`room-${invoice.month}`}
                  >
                    <div key={i} style={{ height: '100%', backgroundColor: !toggleSwitchInvoice ? '#92cc9a' : '#424242' }} />
                  </div>
                  {state.showBaselines
                    && (
                    <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center" ml={-9}>
                      <div
                        key={i}
                        className={styles.Baseline}
                        style={{
                          top: `${100 - (!toggleSwitchInvoice ? (invoice.percentageBaselinePrice || 0) : (invoice.percentageBaselineKwh || 0))}%`,
                          width: '50px',
                        }}
                      />
                    </Flex>
                    )}
                  <ReactTooltip
                    id={`room-${invoice.month}`}
                    place="top"
                    effect="solid"
                    delayHide={100}
                    offset={{ top: 0, left: 10 }}
                    textColor="#000000"
                    border
                    backgroundColor="rgba(255, 255, 255, 0.97)"
                    className={styles.tooltipHolder}
                  >
                    {/* <ToolTipContents dayIndex={i} /> */}
                    {ToolTipContents(i)}
                  </ReactTooltip>
                </div>
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
            {props.invoices && props.invoices.map((invoice) => (
              <div
                className={!props.isReduced ? styles.XAxis : styles.XAxisReduced}
              >
                <span>
                  {tickXLabelFormaterMonth(invoice.month)}
                </span>
                <span>
                  <strong style={{ fontSize: '10px' }}>
                    {tickXLabelFormaterYear(invoice.month)}
                  </strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
