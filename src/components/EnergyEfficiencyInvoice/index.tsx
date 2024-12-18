import { useEffect, useRef } from 'react';
import { t } from 'i18next';
import { Flex, Box } from 'reflexbox';
import { Trans } from 'react-i18next';
import { Card, ModalLoading, Loader } from '..';
import moment from 'moment';
import { CSVLink } from 'react-csv';
import styles from './styles.module.css';
import { apiCallDownload } from '../../providers';
import { useStateVar } from '../../helpers/useStateVar';
import { toast } from 'react-toastify';
import { InvoiceChart } from '../InvoiceChart';

import {
  BtnList,
} from './styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const monthNames = [t('mesesDoAno.jan'), t('mesesDoAno.fev'), t('mesesDoAno.mar'), t('mesesDoAno.abr'), t('mesesDoAno.mai'), t('mesesDoAno.jun'), t('mesesDoAno.jul'), t('mesesDoAno.ago'), t('mesesDoAno.set'), t('mesesDoAno.out'), t('mesesDoAno.nov'), t('mesesDoAno.dez')];
const CsvHeader = [
  {
    label: t('unidade'),
    key: 'unitId',
  },
  {
    label: t('mes'),
    key: 'currentMonth',
  },
  {
    label: t('custoTotal'),
    key: 'totalCharges',
  },
  {
    label: t('totalEmKwh'),
    key: 'totalMeasured',
  },
];

export const EnergyEfficiencyInvoice = (props: {
  unitId: number
  maxWidth?: null;
  marginLeft?: number;
  marginRight?: number;
  minHeight?: null|number;
  isLoading?: boolean;
  invoices: null|{
    month: string,
    periodFrom: string,
    periodUntil: string,
    totalCharges: number,
    totalMeasured: number,
    percentageTotalCharges: number,
    percentageTotalMeasured: number,
    baselinePrice: number,
    baselineKwh: number,
    percentageBaselinePrice: number,
    percentageBaselineKwh: number,
  }[];
  yPointsTotalCharges: number[];
  yPointsTotalMeasured: number[];
  shouldExport: boolean;
}): JSX.Element => {
  const {
    maxWidth,
    marginLeft,
    marginRight,
    minHeight,
    isLoading,
  } = props;
  const csvLinkEl = useRef();
  const [state, render, setState] = useStateVar(() => ({
    filter: t('unidade'),
    showAsHistory: false,
    showInvoice: true,
    isLoading: false,
    invoices: props.invoices as null|{
      month: string,
      periodFrom: string,
      periodUntil: string,
      totalCharges: number,
      totalMeasured: number,
      percentageTotalCharges: number,
      percentageTotalMeasured: number,
      baselinePrice: number,
      baselineKwh: number,
      percentageBaselinePrice: number,
      percentageBaselineKwh: number,
    }[],
    dateStart: new Date(),
    dateEnd: new Date(),
    csvData: [] as {}[],
    yPointsTotalCharges: props.yPointsTotalCharges,
    yPointsTotalMeasured: props.yPointsTotalMeasured,
    downloadingPdf: false as boolean,
    showBaselines: false as boolean,
  }));

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!state.isLoading) {
        state.isLoading = true;
        render();
      }

      state.isLoading = false;
      render();
    });
  }, [state.showInvoice]);

  useEffect(() => {
    if (props.shouldExport) getCsvData();
  }, [props.shouldExport]);

  state.invoices = props.invoices;
  state.yPointsTotalCharges = props.yPointsTotalCharges;
  state.yPointsTotalMeasured = props.yPointsTotalMeasured;

  function tickYLabelFormatter(value: number, switchInvoice: boolean) {
    let valueFormatted = '';
    valueFormatted = value.toFixed(0);

    return `${!switchInvoice ? 'R$ ' : ''}${formatNumberWithFractionDigits(valueFormatted)}${switchInvoice ? ' kWh' : ''}`;
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

  const getCsvData = async () => {
    state.isLoading = true; render();
    const formattedCsv = [] as any;
    try {
      if (state.invoices) {
        state.invoices.forEach((invoice) => {
          formattedCsv.push({
            unitId: props.unitId,
            currentMonth: `${tickXLabelFormaterMonth(invoice.month)}/${tickXLabelFormaterYear(invoice.month)}`,
            totalCharges: formatNumberWithFractionDigits(invoice.totalCharges.toFixed(2), { minimum: 0, maximum: 2 }),
            totalMeasured: formatNumberWithFractionDigits(invoice.totalMeasured.toFixed(2), { minimum: 0, maximum: 2 }),
          });
        });

        state.csvData = formattedCsv;
        render();
        setTimeout(() => {
          (csvLinkEl as any).current.link.click();
        }, 1000);
        state.isLoading = false; render();
      }
      else {
        toast.info(t('erroExportacaoFatura')); state.isLoading = false;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); state.isLoading = false; }
  };

  function formatData(data: string) {
    const mm = data.substring(5, 7);
    const dd = data.substring(8, 10);
    return `${dd}/${mm}`;
  }

  function ToolTipContents(props: { dayIndex: number }) {
    const month = state.invoices ? state.invoices[props.dayIndex].month : '';
    const dateFrom = state.invoices ? new Date(state.invoices[props.dayIndex].periodFrom) : new Date();
    const dateUntil = state.invoices ? new Date(state.invoices[props.dayIndex].periodUntil) : new Date();
    const timeDifference = Math.abs(dateFrom.getTime() - dateUntil.getTime());
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    // Variation with baseline

    if (!state.invoices) {
      return (<div className={styles.tooltipCustom} />);
    }

    const differencePrice = state.invoices[props.dayIndex].baselinePrice - state.invoices[props.dayIndex].totalCharges;
    const differenceKwh = state.invoices[props.dayIndex].baselineKwh - state.invoices[props.dayIndex].totalMeasured;

    const variationPrice = state.invoices[props.dayIndex].baselinePrice > 0 ? (Math.abs(differencePrice) * 100) / state.invoices[props.dayIndex].baselinePrice : 0;
    let ternaryAuxArrow = (differencePrice > 0 ? ' ▼' : ' ▲');
    let ternaryAuxSignal = (differencePrice > 0 ? ' -' : ' +');
    const variationPriceExib = `${differencePrice === 0 ? '' : ternaryAuxSignal}${formatNumberWithFractionDigits(variationPrice.toFixed(2), { minimum: 0, maximum: 2 })}%
      ${differencePrice === 0 ? '' : ternaryAuxArrow}`;

    const variationKwh = state.invoices[props.dayIndex].baselineKwh > 0 ? (Math.abs(differenceKwh) * 100) / state.invoices[props.dayIndex].baselineKwh : 0;
    ternaryAuxArrow = (differenceKwh > 0 ? ' ▼' : ' ▲');
    ternaryAuxSignal = (differenceKwh > 0 ? ' -' : ' +');
    const variationKwhExib = `${differenceKwh === 0 ? '' : ternaryAuxSignal}${formatNumberWithFractionDigits(variationKwh.toFixed(2), { minimum: 0, maximum: 2 })}%
    ${differenceKwh === 0 ? '' : ternaryAuxArrow}`;

    return (
      <div className={styles.tooltipCustom}>
        <div className={styles.tooltipCustom}>
          <div className={styles.tooltipCustom} style={{ fontSize: '95%' }}>
            <Trans
              i18nKey="periodoDeDias"
              periodFrom={formatData(state.invoices[props.dayIndex].periodFrom)}
              periodUntil={formatData(state.invoices[props.dayIndex].periodUntil)}
              daysDiff={daysDifference.toString()}
            >
              <strong>
                {t('periodo')}
              </strong>
              {{ periodFrom: formatData(state.invoices[props.dayIndex].periodFrom) }}
              a
              {{ periodUntil: formatData(state.invoices[props.dayIndex].periodUntil) }}
              <b style={{ fontSize: '80%' }}>
                <>
                  {{ daysDiff: daysDifference.toString() }}
                  dias
                </>
              </b>
            </Trans>
            <br />
            <div style={{ marginTop: '10px' }} />
            <svg width="11" height="11">
              <rect width="11" height="11" style={{ fill: '#92cc9a' }} />
            </svg>
            <strong>
              {` ${t('custo')}:`}
            </strong>
            {` ${tickYLabelFormatter(state.invoices[props.dayIndex].totalCharges, false)}`}
            <b style={{ fontSize: '80%', color: differencePrice > 0 ? 'green' : 'red' }}>
              {` ${variationPriceExib}`}
            </b>
            <br />
            <strong style={{ marginLeft: '15px' }}>
              {' Baseline:'}
            </strong>
            {` ${tickYLabelFormatter(state.invoices[props.dayIndex].baselinePrice, false)}`}
            <br />
            <div style={{ marginTop: '5px' }} />
            <svg width="11" height="11">
              <rect width="11" height="11" style={{ fill: '#424242' }} />
            </svg>
            <strong>
              {` ${t('consumo')}:`}
            </strong>
            {` ${tickYLabelFormatter(state.invoices[props.dayIndex].totalMeasured, true)}`}
            <b style={{ fontSize: '80%', color: differenceKwh > 0 ? 'green' : 'red' }}>
              {` ${variationKwhExib}`}
            </b>
            <br />
            <strong style={{ marginLeft: '15px' }}>
              {' Baseline:'}
            </strong>
            {` ${tickYLabelFormatter(state.invoices[props.dayIndex].baselineKwh, true)}`}
            <br />
            <a href="#" style={{ display: 'none' }} id="downloadLink" />
            <BtnList variant="primary" style={{ marginTop: '10px' }} onClick={() => (state.downloadingPdf ? null : downloadPdf(month))}>
              <div style={{ marginTop: '3px' }} />
              {t('baixarFaturaEmPDF')}
            </BtnList>
          </div>
        </div>
      </div>
    );
  }

  async function downloadPdf(month: string) {
    if (!state.invoices) return;
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

  return (
    <Box width={[1, 1, 1, 1, 25 / 51, 1]} mb={40} ml={marginLeft} mr={marginRight} style={{ maxWidth: maxWidth || 'none' }}>
      <Card noPadding>
        <div style={{ minHeight: minHeight || 'none' }}>

          <Flex flexWrap="wrap" justifyContent="right" alignItems="center" mt={15}>
            <Box width={[1, 1, 1, 1, 1, 1 / 18]}>
              {/* <BtnExportReduced variant={isLoading ? 'disabled' : 'primary'} onClick={getCsvData}>
                <div>
                  <IconWrapper>
                    <ExportPdfIcon />
                  </IconWrapper>
                </div>
              </BtnExportReduced> */}
              <CSVLink
                headers={CsvHeader}
                data={state.csvData}
                filename={t('historicoDeFaturaCsv')}
                separator=";"
                asyncOnClick
                enclosingCharacter={"'"}
                ref={csvLinkEl}
              />
            </Box>
          </Flex>

          {isLoading && (
            <ModalLoading>
              <Loader variant="primary" size="large" />
            </ModalLoading>
          )}

          <>
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 6px 120px auto', height: '5px' }}>
                <span
                  style={{
                    borderTop: '1px solid lightgrey',
                    borderRight: '1px solid lightgrey',
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: state.showInvoice ? 'transparent' : '#f4f4f4',
                  }}
                />
                <span />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 6px 120px auto', marginBottom: '10px' }}>
                <span
                  style={{
                    borderRight: '1px solid lightgrey',
                    textAlign: 'center',
                    fontWeight: state.showInvoice ? 'bold' : 'normal',
                    fontSize: '90%',
                    borderBottom: state.showInvoice ? 'none' : '1px solid lightgrey',
                    backgroundColor: state.showInvoice ? 'transparent' : '#f4f4f4',
                    cursor: state.showInvoice ? undefined : 'pointer',
                  }}
                  onClick={() => { !state.showInvoice && setState({ showInvoice: !state.showInvoice }); }}
                >
                  {t('total')}
                  <span style={{ fontSize: '65%' }}>
                    {state.showInvoice ? ' ▼' : ''}
                  </span>
                </span>
                <span
                  style={{
                    borderBottom: '1px solid lightgrey',
                  }}
                />
                <span
                  style={{
                    textAlign: 'center',
                    fontSize: '90%',
                    borderBottom: state.showInvoice ? '1px solid lightgrey' : 'none',
                  }}
                />
                <span
                  style={{
                    borderBottom: '1px solid lightgrey',
                  }}
                />
              </div>
            </>
            {/* {!isLoading && ( */}
            <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
              <InvoiceChart
                unitId={props.unitId}
                invoices={state.invoices}
                yPointsTotalCharges={state.yPointsTotalCharges}
                yPointsTotalMeasured={state.yPointsTotalMeasured}
                displayPdfOption
                displayBaselineOption
                isReduced={false}
                isLoading={isLoading}
              />
            </div>
            {/* )} */}
          </>
        </div>

      </Card>
    </Box>
  );
};
