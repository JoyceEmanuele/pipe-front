import { useTranslation } from 'react-i18next';
import { Flex, Box } from 'reflexbox';
import aviso_ico from '../../assets/img/icons/aviso_icon.svg';

import {
  ItemTitle,
  ItemSubTitle,
  ItemVal,
  ItemValue,
  ItemValueCurrency,
  ItemValueUnit,
  NoInformation,
  LabelObs,
} from './styles';
import { ICard } from '~/contexts/CardContext';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { InfoIcon, WarnIcon } from '~/icons';
import ReactTooltip from 'react-tooltip';
import { getUserProfile } from '~/helpers/userProfile';
import { NoInfoTooltip } from '../DemandChart/styles';

type EnergyEfficiencyOverview = {
  unhealthyConsumption: {
    kwh: number;
  }
  condenserConsumption: {
    kwh: number;
    price: number;
  }
  greenAntConsumption: {
    kwh: number;
    price: number;
  }
  savings: {
    price: number;
  }
}

interface EnergyEfficiencyGeneralProps {
  selectedTimeRange: any;
  dateList: any;
  energyEfficiencyOverview?: EnergyEfficiencyOverview;
  consumptionSum?: number;
  greenAntSum?: number;
  greenAntInvoiceSum?: number;
  dataTotalConsPercent?: number;
  averageTariff?: string;
  opportunity?: number;
  sumSavingsKWh?: number;
  maxWidth?: null;
  marginLeft?: number;
  marginRight?: number;
  oneUnit?: boolean;
  minHeight?: null|number;
  isLoading?: boolean;
  totalConsumptionPeriod?: {
    totalKwh: number,
    totalCost: number,
    calc: boolean,
  },
  energyCard?: ICard;
  consumptionFlags?: {
    dataIsInvalid: boolean,
    dataIsProcessed: boolean
  },
}

export const EnergyEfficiencyGeneral = ({
  energyEfficiencyOverview,
  consumptionSum = 0,
  greenAntSum = 0,
  greenAntInvoiceSum = 0,
  dataTotalConsPercent = 0,
  averageTariff = '0',
  opportunity = 0,
  sumSavingsKWh = 0,
  oneUnit = true,
  minHeight = null,
  totalConsumptionPeriod = {
    totalKwh: 0,
    totalCost: 0,
    calc: false,
  },
  energyCard,
  consumptionFlags,
}: EnergyEfficiencyGeneralProps): JSX.Element => {
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;

  const { t } = useTranslation();
  function opportunityPercent() {
    let value = Math.ceil(((opportunity || 0) / (consumptionSum || 0)) * 100);
    if (energyEfficiencyOverview) {
      value = Math.ceil(((energyEfficiencyOverview.unhealthyConsumption.kwh || 0) / (energyEfficiencyOverview.condenserConsumption.kwh || 0)) * 100);
    }

    return value > 100 ? 100 : value;
  }

  const calculatePercent = () => {
    if (energyEfficiencyOverview && energyEfficiencyOverview.greenAntConsumption.kwh) {
      return Math.ceil(((energyEfficiencyOverview.condenserConsumption.kwh || 0) / energyEfficiencyOverview.greenAntConsumption.kwh) * 100);
    } if (totalConsumptionPeriod.calc) {
      return Math.ceil(((consumptionSum || 0) / totalConsumptionPeriod.totalKwh) * 100);
    }
    return 0;
  };

  const totalPercent = calculatePercent();

  const verifyPercentOverLimit = (percent) => {
    const percentAdjusted = percent > 100 ? 100 : percent;

    return percentAdjusted;
  };

  const getBackgroundColor = () => {
    if (energyEfficiencyOverview) {
      if (energyEfficiencyOverview.greenAntConsumption.kwh && (energyEfficiencyOverview.condenserConsumption.kwh > energyEfficiencyOverview.greenAntConsumption.kwh)) {
        return '100%';
      }
      return `${verifyPercentOverLimit(totalPercent)}%`;
    }
    if (totalConsumptionPeriod.calc === true) {
      return `${verifyPercentOverLimit(totalPercent)}%`;
    }
    if (greenAntSum && consumptionSum > greenAntSum) {
      return '100%';
    }
    return `${verifyPercentOverLimit(dataTotalConsPercent)}%`;
  };

  const calculateConsumption = () => {
    const condenserConsumption = energyEfficiencyOverview?.condenserConsumption.kwh;
    const greenAntConsumption = energyEfficiencyOverview?.greenAntConsumption.kwh;

    return formatNumberWithFractionDigits(
      ((condenserConsumption ?? 0) > (greenAntConsumption ?? 0) ? condenserConsumption : (greenAntConsumption ?? greenAntSum ?? consumptionSum)) || 0,
      { minimum: 0, maximum: 0 },
    );
  };

  const isCondenserGreater = (energyEfficiencyOverview?.condenserConsumption.kwh ?? 0) > (energyEfficiencyOverview?.greenAntConsumption.kwh ?? 0);

  const calculateRightBorderRadius = () => ((isCondenserGreater || greenAntSum > consumptionSum) ? 0 : 5);

  const getConsumptionPrice = () => {
    const condenserPrice = energyEfficiencyOverview?.condenserConsumption.price;
    const greenAntPrice = energyEfficiencyOverview?.greenAntConsumption.price;

    return formatNumberWithFractionDigits(
      ((condenserPrice ?? 0) > (greenAntPrice ?? 0)
        ? condenserPrice
        : (greenAntPrice || greenAntSum || consumptionSum || 0) * parseFloat(averageTariff || '0')) ?? 0,
      { minimum: 0, maximum: 0 },
    );
  };

  const displayConsumption = energyEfficiencyOverview
    ? energyEfficiencyOverview.greenAntConsumption.kwh && (energyEfficiencyOverview.condenserConsumption.kwh > energyEfficiencyOverview.greenAntConsumption.kwh)
      ? energyEfficiencyOverview.greenAntConsumption.kwh
      : energyEfficiencyOverview.condenserConsumption.kwh
    : greenAntSum && (consumptionSum > greenAntSum)
      ? greenAntSum
      : consumptionSum;

  const price = (() => {
    /*
      energyEfficiencyOverview
        ? greenAntPrice && (condenserPrice > greenAntPrice)
          ? greenAntPrice
          : condenserPrice
        : greenAntSum && (consumptionSum > greenAntSum)
          ? (greenAntSum || 0) * parseFloat(averageTariff || '0')
          : (consumptionSum || 0) * parseFloat(averageTariff || '0')
    */
    if (energyEfficiencyOverview) {
      const greenAntPrice = energyEfficiencyOverview.greenAntConsumption?.price;
      const condenserPrice = energyEfficiencyOverview.condenserConsumption?.price;

      if (condenserPrice && condenserPrice > (greenAntPrice || 0)) {
        return condenserPrice;
      }
    }

    const effectiveGreenAntSum = greenAntSum || 0;
    const effectiveConsumptionSum = consumptionSum || 0;
    const effectiveAverageTariff = parseFloat(averageTariff || '0');

    return Math.max(
      effectiveGreenAntSum * effectiveAverageTariff,
      effectiveConsumptionSum * effectiveAverageTariff,
    );
  })();

  const handleGetLegendTratedData = () => {
    const percentageNumber = Number(getBackgroundColor().split('%'));

    if (percentageNumber > 100 || percentageNumber < 0) {
      if (isAdmin) {
        return (
          <div>
            <WarnIcon data-tip="percentage" data-for="legend-percentage" />
            <ReactTooltip
              id="legend-percentage"
              place="top"
              effect="solid"
            >
              <NoInfoTooltip>
                <WarnIcon color="#FFFFFF" width="20" height="17" />
                <div>
                  <span>{t('dadoIncoerente')}</span>
                  <p>{t('dadoIncoerenteDesc')}</p>
                </div>
              </NoInfoTooltip>
            </ReactTooltip>
          </div>
        );
      }
      return (
        <div>
          <InfoIcon data-tip="percentage" data-for="legend-percentage" />
          <ReactTooltip
            id="legend-percentage"
            place="top"
            effect="solid"
          >
            <NoInfoTooltip>
              <InfoIcon color="#FFFFFF" width="20" height="17" />
              <div>
                <span>{t('naoFoiPossivelColetarDado')}</span>
                <p>{t('paraMaisDetalhes')}</p>
              </div>
            </NoInfoTooltip>
          </ReactTooltip>
        </div>
      );
    }

    return <></>;
  };

  return (
    <div style={{ minHeight: minHeight || '0' }}>
      <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" mt={energyCard?.isExpanded ? '8px' : 35} pl={15} pr={15}>

        {energyCard?.isExpanded ? (
          <Flex alignItems="center" width="100%" justifyContent="space-between">
            <Flex alignSelf="flex-start" flexDirection="column">
              <ItemTitle>
                {t('economiaGerada')}
              </ItemTitle>
              {(energyEfficiencyOverview && energyEfficiencyOverview.savings.price) || sumSavingsKWh ? (
                <ItemValue>
                  <ItemValueCurrency>-</ItemValueCurrency>
                  {/* <ItemValueCurrency>R$</ItemValueCurrency>
                    <ItemVal style={{ color: colors.GreenLight }}>
                      {thousandPointFormat((energyEfficiencyOverview && energyEfficiencyOverview.savings.price) || ((sumSavingsKWh || 0) * parseFloat(averageTariff || '0')))}
                    </ItemVal> */}
                </ItemValue>
              ) : (
                <NoInformation>
                  -
                </NoInformation>
              )}

            </Flex>
            <Flex alignSelf="flex-start" flexDirection="column" style={{ borderRight: '1px solid #CCC' }} paddingRight="4rem">
              <ItemTitle>
                {t('oportunidade')}
                {' '}
                {opportunityPercent() === 100 && (
                <img src={aviso_ico} />
                )}
              </ItemTitle>
              {(energyEfficiencyOverview && energyEfficiencyOverview.unhealthyConsumption.kwh) || opportunity ? (
                <ItemValue>
                  <ItemVal>
                    {formatNumberWithFractionDigits((energyEfficiencyOverview && energyEfficiencyOverview.unhealthyConsumption.kwh) || (opportunity || 0), { minimum: 0, maximum: 0 })}
                  </ItemVal>
                  <ItemValueUnit>kWh</ItemValueUnit>
                </ItemValue>
              ) : (
                <NoInformation>
                  -
                </NoInformation>
              )}
              <div style={{
                backgroundColor: '#EDEDED',
                borderRadius: 5,
                width: '100%',
                height: 15,
              }}
              >
                {opportunityPercent() > 0 && (
                <div style={{
                  backgroundColor: '#F8D000',
                  width: `${opportunityPercent()}%`,
                  height: 15,
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderTopRightRadius: opportunityPercent() < 100 ? 0 : 5,
                  borderBottomRightRadius: opportunityPercent() < 100 ? 0 : 5,
                }}
                />
                )}
              </div>
            </Flex>
            <Flex alignSelf="flex-start" flexDirection="column">
              <Flex alginItems="center" justifyContent="space-between" style={{ gap: '4rem' }}>
                <div>
                  <ItemTitle>
                    {t('refrigeracao')}
                  </ItemTitle>
                  <ItemValue>
                    <ItemVal>
                      {calculateConsumption()}
                    </ItemVal>
                    <ItemValueUnit>kWh</ItemValueUnit>
                  </ItemValue>
                </div>
                <div>
                  <ItemTitle>
                    {t('total')}
                  </ItemTitle>
                  {(energyEfficiencyOverview && energyEfficiencyOverview.greenAntConsumption.kwh) || greenAntSum ? (
                    <ItemValue>
                      <ItemVal>
                        {formatNumberWithFractionDigits(energyEfficiencyOverview ? energyEfficiencyOverview.greenAntConsumption.kwh : greenAntSum, { minimum: 0, maximum: 0 })}
                      </ItemVal>
                      <ItemValueUnit>kWh</ItemValueUnit>
                    </ItemValue>
                  ) : (
                    <ItemValue>
                      <ItemVal>
                        {totalConsumptionPeriod && totalConsumptionPeriod.calc === true ? formatNumberWithFractionDigits(totalConsumptionPeriod.totalKwh, { minimum: 0, maximum: 0 })
                          : (
                            <NoInformation>
                              -
                            </NoInformation>
                          )}
                      </ItemVal>
                    </ItemValue>
                  )}
                </div>
              </Flex>
              <Flex flexDirection="column" alignItems="center" justifyContent="center">
                <div style={{
                  backgroundColor: '#EDEDED',
                  borderRadius: 5,
                  width: '100%',
                  height: 15,
                }}
                >
                  <div style={{
                    backgroundColor: '#363BC4',
                    width: getBackgroundColor() === '100%' ? '100%' : getBackgroundColor(),
                    height: 15,
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                    borderTopRightRadius: calculateRightBorderRadius(),
                    borderBottomRightRadius: calculateRightBorderRadius(),
                  }}
                  />
                </div>
                <Flex width={1} justifyContent="center" alignItems="center">
                  <ItemSubTitle>
                    <strong>
                      {getBackgroundColor() === '100%' ? '100%' : getBackgroundColor()}
                      {' '}
                    </strong>
                    {' '}
                    {t('refrigeracao')}
                    {' '}
                  </ItemSubTitle>
                  {handleGetLegendTratedData()}
                </Flex>
              </Flex>
            </Flex>
            <Flex alignSelf="flex-start" flexDirection="column">
              <ItemTitle>
                {t('refrigeracao')}
              </ItemTitle>
              <ItemValue>
                <ItemValueCurrency>R$</ItemValueCurrency>
                <ItemVal>
                  {getConsumptionPrice()}
                </ItemVal>
              </ItemValue>
            </Flex>
            <Flex alignSelf="flex-start" flexDirection="column">
              <ItemTitle>
                {t('fatura')}
              </ItemTitle>
              {(energyEfficiencyOverview && energyEfficiencyOverview.greenAntConsumption.price) || greenAntSum ? (
                <ItemValue>
                  <ItemValueCurrency>R$</ItemValueCurrency>
                  <ItemVal>
                    {formatNumberWithFractionDigits(energyEfficiencyOverview
                      ? energyEfficiencyOverview.greenAntConsumption.price
                      : (greenAntInvoiceSum || ((greenAntSum || 0) * parseFloat(averageTariff || '0'))), { minimum: 0, maximum: 0 })}
                  </ItemVal>
                </ItemValue>
              ) : (
                <ItemValue>
                  {
                      totalConsumptionPeriod && totalConsumptionPeriod.calc === true ? (
                        <>
                          <ItemValueCurrency>R$</ItemValueCurrency>
                          <ItemVal>
                            {formatNumberWithFractionDigits(totalConsumptionPeriod.totalCost, { minimum: 0, maximum: 0 })}
                          </ItemVal>
                        </>
                      ) : (
                        <NoInformation>
                          -
                        </NoInformation>
                      )
                    }
                </ItemValue>
              )}
              {/* <ItemSubTitle>
                  Vencimento: <HighLight>24/04/2021</HighLight>
                </ItemSubTitle> */}
            </Flex>
          </Flex>
        ) : (
          <>
            <Box
              width={[1, 1, 1, 2 / 7, 2 / 7, 2 / 7]}
              sx={{
                borderBottomWidth: [0.5, 0.5, 0.5, 0, 0, 0],
                borderBottomStyle: 'solid',
                borderRightWidth: [0, 0, 0, 0.5, 0.5, 0.5],
                borderRightStyle: 'solid',
                borderColor: '#CCC',
                paddingBottom: [20, 20, 20, 0, 0, 0],
                paddingRight: 20,
              }}
            >

              <Box width={1}>
                <div>
                  <ItemTitle>
                    {t('economiaGerada')}
                  </ItemTitle>
                  {(energyEfficiencyOverview && energyEfficiencyOverview.savings.price) || sumSavingsKWh ? (
                    <ItemValue>
                      <ItemValueCurrency>-</ItemValueCurrency>
                      {/* <ItemValueCurrency>R$</ItemValueCurrency>
                   <ItemVal style={{ color: colors.GreenLight }}>
                     {thousandPointFormat((energyEfficiencyOverview && energyEfficiencyOverview.savings.price) || ((sumSavingsKWh || 0) * parseFloat(averageTariff || '0')))}
                   </ItemVal> */}
                    </ItemValue>
                  ) : (
                    <NoInformation>
                      -
                    </NoInformation>
                  )}

                </div>
              </Box>

              <Box width={1}>
                <div>
                  <ItemTitle>
                    {t('oportunidade')}
                    {' '}
                    {opportunityPercent() === 100 && (
                    <img src={aviso_ico} />
                    )}
                  </ItemTitle>
                  <ItemSubTitle>
                    {t('consumoMaquinasForaPadrao')}
                  </ItemSubTitle>
                  {(energyEfficiencyOverview && energyEfficiencyOverview.unhealthyConsumption.kwh) || opportunity ? (
                    <ItemValue>
                      <ItemVal>
                        {formatNumberWithFractionDigits((energyEfficiencyOverview && energyEfficiencyOverview.unhealthyConsumption.kwh) || (opportunity || 0), { minimum: 0, maximum: 0 })}
                      </ItemVal>
                      <ItemValueUnit>kWh</ItemValueUnit>
                    </ItemValue>
                  ) : (
                    <NoInformation>
                      -
                    </NoInformation>
                  )}
                </div>
                <Flex mt={2}>
                  <Box width={1}>
                    <div style={{
                      backgroundColor: '#EDEDED',
                      borderRadius: 5,
                      width: '100%',
                      height: 15,
                    }}
                    >
                      {opportunityPercent() > 0 && (
                      <div style={{
                        backgroundColor: '#F8D000',
                        width: `${opportunityPercent()}%`,
                        height: 15,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                        borderTopRightRadius: opportunityPercent() < 100 ? 0 : 5,
                        borderBottomRightRadius: opportunityPercent() < 100 ? 0 : 5,
                      }}
                      />
                      )}
                    </div>
                  </Box>
                </Flex>
              </Box>

            </Box>

            <Box width={[1, 1, 1, 5 / 7, 5 / 7, 5 / 7]} pl={[0, 0, 0, 25, 25, 25]} mt={[20, 20, 20, 0, 0, 0]}>
              <Flex>
                <Box width={1}>
                  <div style={{
                    backgroundColor: '#EDEDED',
                    borderRadius: 5,
                    width: '100%',
                    height: 15,
                  }}
                  >
                    <div style={{
                      backgroundColor: '#363BC4',
                      width: getBackgroundColor() === '100%' ? '100%' : getBackgroundColor(),
                      height: 15,
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 5,
                      borderTopRightRadius: energyEfficiencyOverview
                        ? energyEfficiencyOverview.greenAntConsumption.kwh && (energyEfficiencyOverview.condenserConsumption.kwh > energyEfficiencyOverview.greenAntConsumption.kwh) ? 0 : 5
                        : greenAntSum && (consumptionSum > greenAntSum) ? 0 : 5,
                      borderBottomRightRadius: energyEfficiencyOverview
                        ? energyEfficiencyOverview.greenAntConsumption.kwh && (energyEfficiencyOverview.condenserConsumption.kwh > energyEfficiencyOverview.greenAntConsumption.kwh) ? 0 : 5
                        : greenAntSum && (consumptionSum > greenAntSum) ? 0 : 5,
                    }}
                    />
                  </div>
                  <Flex width={1} justifyContent="center" alignItems="center">
                    <ItemSubTitle>
                      <strong>
                        {getBackgroundColor() === '100%' ? '100%' : getBackgroundColor()}
                        {' '}

                      </strong>
                      {' '}
                      {t('refrigeracao')}
                      {' '}
                    </ItemSubTitle>
                    {handleGetLegendTratedData()}
                  </Flex>
                </Box>
              </Flex>

              <Flex flexWrap="wrap" mt={25}>
                <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
                  <div>
                    <ItemTitle>
                      {t('refrigeracao')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {`${t('consumo')} kWh`}
                    </ItemSubTitle>
                    <ItemValue>
                      <ItemVal>
                        <ItemValue>
                          <ItemVal>
                            {formatNumberWithFractionDigits(displayConsumption, { minimum: 0, maximum: 0 })}
                          </ItemVal>
                        </ItemValue>
                      </ItemVal>
                    </ItemValue>
                  </div>
                </Box>
                <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
                  <div>
                    <ItemTitle>
                      {t('total')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {`${t('consumo')} kWh`}
                    </ItemSubTitle>
                    {(energyEfficiencyOverview && energyEfficiencyOverview.greenAntConsumption.kwh) || greenAntSum ? (
                      <ItemValue>
                        <ItemVal>
                          {formatNumberWithFractionDigits(energyEfficiencyOverview ? energyEfficiencyOverview.greenAntConsumption.kwh : greenAntSum, { minimum: 0, maximum: 0 })}
                        </ItemVal>
                      </ItemValue>
                    ) : (
                      <ItemValue>
                        <ItemVal>
                          {totalConsumptionPeriod && totalConsumptionPeriod.calc === true ? formatNumberWithFractionDigits(totalConsumptionPeriod.totalKwh, { minimum: 0, maximum: 0 })
                            : (
                              <NoInformation>
                                -
                              </NoInformation>
                            )}
                        </ItemVal>
                      </ItemValue>
                    )}
                  </div>
                </Box>
              </Flex>

              <Flex mt={25} flexWrap="wrap">
                <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
                  <div>
                    <ItemTitle>
                      {t('refrigeracao')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {t('totalPeriodoSelecionado')}
                    </ItemSubTitle>
                    <ItemValue>
                      <ItemValueCurrency>R$</ItemValueCurrency>
                      <ItemVal>
                        {formatNumberWithFractionDigits(price, { minimum: 0, maximum: 0 })}
                      </ItemVal>
                    </ItemValue>
                  </div>
                </Box>
                <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
                  <div>
                    <ItemTitle>
                      {t('fatura')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {t('totalPeriodoSelecionado')}
                    </ItemSubTitle>
                    {(energyEfficiencyOverview && energyEfficiencyOverview.greenAntConsumption.price) || greenAntSum ? (
                      <ItemValue>
                        <ItemValueCurrency>R$</ItemValueCurrency>
                        <ItemVal>
                          {formatNumberWithFractionDigits(energyEfficiencyOverview
                            ? energyEfficiencyOverview.greenAntConsumption.price
                            : (greenAntInvoiceSum || ((greenAntSum || 0) * parseFloat(averageTariff || '0'))), { minimum: 0, maximum: 0 })}
                        </ItemVal>
                      </ItemValue>
                    ) : (
                      <ItemValue>
                        {
                      totalConsumptionPeriod && totalConsumptionPeriod.calc === true ? (
                        <>
                          <ItemValueCurrency>R$</ItemValueCurrency>
                          <ItemVal>
                            {formatNumberWithFractionDigits(totalConsumptionPeriod.totalCost, { minimum: 0, maximum: 0 })}
                          </ItemVal>
                        </>
                      ) : (
                        <NoInformation>
                          -
                        </NoInformation>
                      )
                    }
                      </ItemValue>
                    )}
                    {/* <ItemSubTitle>
                  Vencimento: <HighLight>24/04/2021</HighLight>
                </ItemSubTitle> */}
                  </div>
                </Box>
              </Flex>
            </Box>
          </>
        )}

        <Flex flexWrap="wrap" justifyContent="flex-start" alignItems="center" width={1}>
          <Box width={1}>
            <LabelObs>
              {!oneUnit
                ? `${t('considerandoMedicaoEnergia')}.`
                : (energyEfficiencyOverview?.greenAntConsumption.kwh) || greenAntSum
                  ? `${t('analiseCompletaEE')}`
                  : ''}
            </LabelObs>
          </Box>
        </Flex>

      </Flex>
    </div>
  );
};
