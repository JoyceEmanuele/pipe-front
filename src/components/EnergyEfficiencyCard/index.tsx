import { Flex, Box } from 'reflexbox';
import { useMemo } from 'react';
import OrderIcon from '../../assets/img/order.svg';
import {
  EnergyEfficiencyGeneral,
  Card,
  InvoiceChart,
  Table,
  Loader,
} from '..';
import { useStateVar } from '../../helpers/useStateVar';
import {
  TopTitle,
  TopDate,
  BtnList,
  CellLabel,
  OverLay,
  StyledLink,
} from './styles';
import ReactTooltip from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { ICard, useCard } from '../../contexts/CardContext';
import { CardManager } from '../CardManager';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const monthNames = ['Dezembro', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const EnergyEfficiencyCard = (props: {
  selectedTimeRange: string,
  dateList: {
    mdate: moment.Moment;
    YMD: string;
    DMY: string;
  }[],
  isLoadingEfficiencyOverviewCard: boolean,
  isLoadingInvoices: boolean,
  invoices:
    {
      month: string,
      percentageTotalCharges: number,
      percentageTotalMeasured: number,
      totalCharges: number,
      totalMeasured: number,
      percentageInvoices: number,
    }[],
  selectedUnit: any[],
  energyEfficiency:
  {
    savings: {
      price: number
    },
    greenAntConsumption: {
      price: number,
      kwh: number
    },
    condenserConsumption: {
      price: number,
      kwh: number
    },
    unhealthyConsumption: {
      kwh: number
    },
  },
  invoicedList: {
    unitId: number,
    unitName: string,
    totalCharges: number,
    totalBaselineCharges: number,
    variationCharges: number,
    totalMeasured: number,
    totalBaselineMeasured: number,
    variationMeasured: number,
  }[],
  yPointsTotalCharges: number[],
  yPointsTotalMeasured: number[],
  measurementUnit: string,
  saveOverviewFilters?: () => void
}): JSX.Element => {
  const { t } = useTranslation();
  const {
    selectedTimeRange,
    dateList,
    isLoadingEfficiencyOverviewCard,
    isLoadingInvoices,
    invoices,
    selectedUnit,
    energyEfficiency,
    invoicedList,
    yPointsTotalCharges,
    yPointsTotalMeasured,
    measurementUnit,
  } = props;
  const [state, render, setState] = useStateVar(() => ({
    filter: 'Padrao',
    showList: false,
    showAsHistory: false,
    showEnergyEfficiencyInvoices: false,
  }));

  const invoiceColumns = [
    {
      Header: () => (
        <span>
          {t('unidade')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'unitName',
      // disableSortBy: true,
      Cell: ({ row }) => (
        <>
          <CellLabel data-tip data-for={row.original.unitName}>
            <StyledLink to={`/analise/unidades/energyEfficiency/${row.original.unitId.toString()}`}>
              {
                row.original.unitName && row.original.unitName.length > 15
                  ? row.original.unitName.slice(0, 15).concat('...')
                  : (row.original.unitName || '-')
              }
            </StyledLink>
          </CellLabel>
          {row.original.unitName && row.original.unitName.length > 15 && (
            <ReactTooltip
              id={row.original.unitName}
              place="top"
              effect="solid"
              delayHide={100}
              offset={{ top: 0, left: 10 }}
              textColor="#000000"
              border
              backgroundColor="rgba(255, 255, 255, 0.97)"
            >
              <div>
                {row.original.unitName}
              </div>
            </ReactTooltip>
          )}
        </>
      ),
    },
    {
      Header: () => (
        <span>
          {t('Última Fatura')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'totalCharges',
      // disableSortBy: true,
      Cell: (propsItem) => <CellLabel>{formatTotal(propsItem.row.original.totalCharges, true, 0)}</CellLabel>,
    },
    {
      Header: () => (
        <span>
          {`Var. ${t('fatura')}`}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'variationCharges',
      // disableSortBy: true,
      Cell: (propsItem) => <CellLabel>{formatVariation(propsItem.row.original.variationCharges, propsItem.row.original.totalBaselineCharges > 0)}</CellLabel>,
    },
    {
      Header: () => (
        <span>
          {`${t('Última Fatura')} (${measurementUnit || 'kWh'})`}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'totalMeasured',
      // disableSortBy: true,
      Cell: ({ row }) => <CellLabel>{formatTotal(row.original.totalMeasured, false, measurementUnit === 'kWh' ? 0 : 1)}</CellLabel>,
    },
    {
      Header: () => (
        <span>
          {`Var. ${measurementUnit || 'kWh'}`}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'variationMeasured',
      // disableSortBy: true,
      Cell: ({ row }) => <CellLabel>{formatVariation(row.original.variationMeasured, row.original.totalBaselineMeasured > 0)}</CellLabel>,
    },
  ];

  const processedInvoices = useMemo(() => ((invoicedList) || [])
    .filter((x) => !!x.unitName)
    .sort((a, b) => {
      if (state.filter === t('padrao')) {
        if (a.totalCharges < b.totalCharges) return 1;
        if (a.totalCharges > b.totalCharges) return -1;
        return 0;
      }
      if (state.filter === t('unidade')) {
        if (a.unitName < b.unitName) return -1;
        if (a.unitName > b.unitName) return 1;
        return 0;
      }
      if (state.filter === `${t('Última Fatura')}`) {
        if (a.totalCharges < b.totalCharges) return -1;
        if (a.totalCharges > b.totalCharges) return 1;
        return 0;
      }
      if (state.filter === `Var. ${t('fatura')}`) {
        if (a.variationCharges < b.variationCharges) return -1;
        if (a.variationCharges > b.variationCharges) return 1;
        return 0;
      }
      if (state.filter === `${t('Última Fatura')} (${measurementUnit || 'kWh'})`) {
        if (a.totalMeasured < b.totalMeasured) return -1;
        if (a.totalMeasured > b.totalMeasured) return 1;
        return 0;
      }
      if (state.filter === `Var. ${measurementUnit || 'kWh'}`) {
        if (a.variationMeasured < b.variationMeasured) return -1;
        if (a.variationMeasured > b.variationMeasured) return 1;
        return 0;
      }
      return 0;
    }), [invoicedList, state.filter]);

  function formatVariation(value, hasBaseline) {
    if (!hasBaseline) {
      return (
        <div>
          -
        </div>
      );
    }

    let auxArrow = '';
    const auxSignal = (value > 0 ? '+' : '');
    if (value !== 0) {
      auxArrow = (value > 0 ? ' ▲' : ' ▼');
    }

    const variationExibe = `${auxSignal}${formatNumberWithFractionDigits(value.toFixed(2), { minimum: 0, maximum: 2 })}%`;

    return (
      <div style={{ color: value > 0 ? 'red' : 'green' }}>
        {` ${variationExibe}`}
        <b style={{ fontSize: '90%' }}>
          {auxArrow}
        </b>
      </div>
    );
  }

  function formatTotal(value, isCharge, decimalPlaces) {
    let valueFormatted = '';
    valueFormatted = formatNumberWithFractionDigits(value.toFixed(decimalPlaces), { minimum: 0, maximum: decimalPlaces });
    const unit = ` ${measurementUnit || 'kWh'}`;
    return `${isCharge ? 'R$ ' : ''}${valueFormatted}${!isCharge ? unit : ''}`;
  }

  function formatDateHeader() {
    if (!state.showEnergyEfficiencyInvoices) {
      return selectedTimeRange === 'Dia' ? dateList[0].DMY : `${dateList[0].DMY} - ${dateList[dateList.length - 1].DMY}`;
    }
    const monthIndex = Number(dateList[0].DMY.substring(3, 5)) - 1;
    const year = monthIndex > 0 ? Number(dateList[0].DMY.substring(6, 10)) : Number(dateList[0].DMY.substring(6, 10)) - 1;

    return `${t(monthNames[monthIndex])} ${t('de')} ${year - 1} - ${t(monthNames[monthIndex])} ${t('de')} ${year}`;
  }

  const { cards } = useCard();
  const energyCard = cards.find((card) => card.title === 'Ef. Energética');

  return (
    <Box width={energyCard?.isExpanded ? 1 : [1, 1, 1, 1, 25 / 51, 25 / 51]} mb={40} ml={0} mr={0} style={energyCard?.isExpanded ? { maxWidth: 'none', height: 'auto' } : { maxWidth: 'none', minHeight: 570 }}>
      <Card
        noPaddingRelative
        wrapperStyle={
        {
          minHeight: energyCard?.isExpanded ? 'auto' : 570,
          height: state.showList ? '900px' : 'auto',
        }
      }
      >
        <div style={{ padding: '10px 30px' }}>
          <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
            <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
              <TopTitle>{t('Eficiência Energética')}</TopTitle>
            </Box>
            <Flex flexWrap="wrap" justifyContent="flex-end" alignItems="center" width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
              <TopDate>
                {formatDateHeader()}
              </TopDate>
              <CardManager card={energyCard as ICard} />
            </Flex>
          </Flex>
        </div>

        {isLoadingEfficiencyOverviewCard || isLoadingInvoices ? (
          <OverLay>
            <Loader variant="primary" size="large" />
          </OverLay>
        ) : (
          <></>
        )}
        {!energyCard?.isExpanded && invoices.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto', height: '5px' }}>
              <span
                style={{
                  borderTop: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: state.showEnergyEfficiencyInvoices ? '#f4f4f4' : 'transparent',
                }}
              />
              <span />
              <span
                style={{
                  border: '1px solid lightgrey',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: state.showEnergyEfficiencyInvoices ? 'transparent' : '#f4f4f4',
                }}
              />
              <span />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto' }}>
              <span
                style={{
                  borderRight: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  borderBottom: state.showEnergyEfficiencyInvoices ? '1px solid lightgrey' : 'none',
                  backgroundColor: state.showEnergyEfficiencyInvoices ? '#f4f4f4' : 'transparent',
                  cursor: state.showEnergyEfficiencyInvoices ? 'pointer' : undefined,
                }}
                onClick={() => { state.showEnergyEfficiencyInvoices && setState({ showEnergyEfficiencyInvoices: !state.showEnergyEfficiencyInvoices, showList: false }); }}
              >
                {t('Informações Gerais')}
              </span>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
              <span
                style={{
                  borderLeft: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  borderBottom: state.showEnergyEfficiencyInvoices ? 'none' : '1px solid lightgrey',
                  backgroundColor: state.showEnergyEfficiencyInvoices ? 'transparent' : '#f4f4f4',
                  cursor: (!state.showEnergyEfficiencyInvoices) ? 'pointer' : undefined,
                }}
                onClick={() => { (!state.showEnergyEfficiencyInvoices) && setState({ showEnergyEfficiencyInvoices: !state.showEnergyEfficiencyInvoices }); }}
              >
                {t('fatura')}
              </span>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
            </div>
          </>
        ) : (
          <></>
        )}
        {energyCard?.isExpanded ? (
          <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
            <InvoiceChart
              unitId={0}
              invoices={invoices}
              yPointsTotalCharges={yPointsTotalCharges}
              yPointsTotalMeasured={yPointsTotalMeasured}
              displayPdfOption={false}
              displayBaselineOption={false}
              isReduced
              isLoading={isLoadingInvoices}
              measurementUnit={measurementUnit}
            />
            {' '}
            <EnergyEfficiencyGeneral
              selectedTimeRange={selectedTimeRange}
              dateList={dateList}
              energyEfficiencyOverview={energyEfficiency}
              oneUnit={selectedUnit.length === 1}
              isLoading={isLoadingEfficiencyOverviewCard}
              energyCard={energyCard}
            />
            <Flex flexWrap="wrap" flexDirection="row-reverse" justifyContent="space-between" mt={1} alignItems="flex-end" width={1} pl={15}>
              <Box>
                <BtnList
                  onClick={() => {
                    state.showList = !state.showList;
                    render();
                  }}
                  clickable={!isLoadingEfficiencyOverviewCard}
                >
                  {t('verLista')}
                </BtnList>
              </Box>
            </Flex>
          </div>
        ) : (
          <>
            {!state.showEnergyEfficiencyInvoices || invoices.length === 0 ? (
              <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                <EnergyEfficiencyGeneral
                  selectedTimeRange={selectedTimeRange}
                  dateList={dateList}
                  energyEfficiencyOverview={energyEfficiency}
                  oneUnit={selectedUnit.length === 1}
                  isLoading={isLoadingEfficiencyOverviewCard}
                />
              </div>
            ) : (
              <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
                <InvoiceChart
                  unitId={0}
                  invoices={invoices}
                  yPointsTotalCharges={yPointsTotalCharges}
                  yPointsTotalMeasured={yPointsTotalMeasured}
                  displayPdfOption={false}
                  displayBaselineOption={false}
                  isReduced
                  isLoading={isLoadingInvoices}
                  measurementUnit={measurementUnit}
                />
                <Flex flexWrap="wrap" flexDirection="row-reverse" justifyContent="space-between" mt={energyCard?.isExpanded ? 0 : '135px'} alignItems="flex-end" width={1} pl={15}>
                  <Box>
                    <BtnList
                      onClick={() => {
                        state.showList = !state.showList;
                        render();
                      }}
                      clickable={!isLoadingEfficiencyOverviewCard}
                    >
                      {t('verLista')}
                    </BtnList>
                  </Box>
                </Flex>
              </div>
            )}
          </>
        )}

        {state.showList && invoices.length !== 0
          ? (
            <Flex
              flexWrap="wrap"
              width={1}
              mt={10}
              style={{
                overflow: 'auto',
                maxHeight: 300,
              }}
            >
              <Table style={{ paddingLeft: '30px', paddingRight: '35px' }} columns={invoiceColumns} data={processedInvoices} dense border={false} maxItens={10} />
            </Flex>
          ) : (
            <>
            </>
          )}
      </Card>
    </Box>
  );
};
