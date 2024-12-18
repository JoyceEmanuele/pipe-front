import { colors } from '~/styles/colors';
import {
  ConsumptionResultContainer,
  ConsumptionResultData,
  ConsumptionResultHighlight,
  ConsumptionStyled,
  Content,
  DeltaInfo,
  EnergyEfficiencyHeader,
  EnergyEfficiencyStyled,
  HighlightData,
  NoAnalisysWarning,
  TooltipContainer,
} from './styles';
import { EnergyEfficiencyTicket } from './EnergyEfficiencyTicket';
import { useCard } from '~/contexts/CardContext';
import { useEffect } from 'react';
import { ApiResps, apiCall } from '~/providers';
import { useStateVar } from '~/helpers/useStateVar';
import { handleGetDatesParams } from '~/helpers/getRangeParamsChart';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { formatNumber } from '~/helpers/formatNumber';
import ReactTooltip from 'react-tooltip';
import { useEnergyCard } from '../EnergyCardContext';
import { convertEnergy } from '~/helpers';
import { ConsumptionChart } from '../ConsumptionChart';
import { useHistory } from 'react-router-dom';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const tickets = [
  {
    label: 'a',
    color: '#039340',
    width: '20%',
  },
  {
    label: 'b',
    color: '#05A935',
    width: '35%',
  },
  {
    label: 'c',
    color: '#99D014',
    width: '45%',
  },
  {
    label: 'd',
    color: '#FDF900',
    width: '55%',
  },
  {
    label: 'e',
    color: '#F1AE02',
    width: '65%',
  },
  {
    label: 'f',
    color: '#E4650A',
    width: '80%',
  },
  {
    label: 'g',
    color: '#DE2917',
    width: '100%',
  },
];

interface FilterDatesProps {
  yearOptions: {
    label: string;
    value: string | number;
    hasData: boolean;
  }[];
  monthOptions: {
    label: string;
    value: string | number;
    hasData: boolean;
  }[];
}

interface EnergyCardInsightsProps {
  energyCardFilters: {
    startObject?: boolean;
    unitIds?: number[];
    stateIds?: number[];
    cityIds?: string[];
    clientIds?: number[];
    supervisorIds?: string[];
  };
  insideFilters: {
    clientIds: [];
    stateIds: [];
    cityIds: [];
    unitIds: [];
  };
  filterDatesChart: FilterDatesProps;
  isLoading: boolean;
  handleChangeProcellFilters: (units, letters) => void;
  handleClickBarChart: (name) => void;
  handleResetProcellFilters: () => void;
  handleGetTotalUnits: (total) => void;
}

export const EnergyInsights: React.FC<EnergyCardInsightsProps> = ({
  energyCardFilters,
  insideFilters,
  isLoading,
  filterDatesChart,
  handleChangeProcellFilters,
  handleResetProcellFilters,
  handleClickBarChart,
  handleGetTotalUnits,
}) => {
  const history = useHistory();
  const { cardDate, handleSetTabIsLoading } = useEnergyCard();

  const [state, render] = useStateVar({
    energyInsightsData: [] as any,
    energyInsightsSummary: {} as any,
    historyChartData: {} as ApiResps['/energy/get-energy-analysis-hist'],
    procellFilters: {} as any,
    procellFiltersSelected: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as string[],
  });

  const { cards } = useCard();
  const energyCard = cards.find((card) => card.title === 'Energia');

  const handleGetInsightsProcel = async (options?) => {
    try {
      const datesParams = handleGetDatesParams(
        `${cardDate.month} ${cardDate.year}`,
        'MMMM YYYY',
        'monthMode',
        false,
      );

      const data = await apiCall('/energy/get-procel-insights', {
        insideFilters: {
          ...insideFilters,
        },
        ...datesParams,
        ...energyCardFilters,
        ...options,
      });

      state.energyInsightsSummary = {
        containsProcel: data.containsProcel,
        containsAnalysisData: data.containsAnalysisData,
        averageConsumption: data.averageConsumption,
        totalConsumption: data.totalConsumption,
        totalCharged: data.totalCharged,
        averageConsumptionPreviousMonthPercentage: Number(data.averageConsumptionPreviousMonthPercentage),
      };

      state.energyInsightsData = tickets.map((ticket) => ({
        ...ticket,
        ...data[ticket.label],
      }));
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesClassificacao'));
    } finally {
      render();
    }
  };

  const handleGetChartData = async (energyHistParams) => {
    try {
      const chartModeParam = 'month';

      const datesParams = handleGetDatesParams(
        `${cardDate.month} ${cardDate.year}`,
        'MMMM YYYY',
        'monthMode',
        false,
      );

      const data = await apiCall('/energy/get-energy-analysis-hist', {
        ...datesParams,
        filterType: chartModeParam,
        insideFilters: { ...insideFilters },
        ...energyCardFilters,
        ...energyHistParams,
      });
      state.historyChartData = data;
      handleGetTotalUnits(data.totalUnitsWithConstructedArea ?? 0);
    } catch (e) {
      toast.error(t('naoFoiPossivelBuscarInformacoesGrafico'));
    } finally {
      render();
    }
  };

  const handleFormatAndConvertNumber = (number) => {
    const [convertedNumber, numberUnit] = convertEnergy(number ?? 0);

    return [formatNumberWithFractionDigits(convertedNumber, { minimum: 0, maximum: 0 }), numberUnit];
  };

  const handleLoadData = async () => {
    handleSetTabIsLoading(true, 'insights');

    const procellArrays = Object.values(state.procellFilters);
    const procellUnits = [...procellArrays.flat()];

    await handleGetInsightsProcel({
      ...(procellUnits.length > 0 && { procelUnitsFilter: procellUnits }),
    });
    await handleGetChartData({
      ...(procellUnits.length > 0 && { unitIds: procellUnits }),
    });

    handleSetTabIsLoading(false, 'insights');
  };

  const handleGetArrayUnits = () => {
    const procellArrays = Object.values(state.procellFilters);
    const procellUnits = [...procellArrays.flat()];

    return procellUnits;
  };

  const updateFilters = () => {
    const procellUnits = handleGetArrayUnits();
    handleChangeProcellFilters(procellUnits, state.procellFiltersSelected);
    render();
  };

  const handleResetProcell = () => {
    state.procellFiltersSelected = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    state.procellFilters = {};
  };

  useEffect(() => {
    if (energyCardFilters.startObject || !cardDate.verifyDate) return;
    if (!cardDate.isApiDate) {
      handleResetProcell();
      updateFilters();
    } else {
      handleLoadData();
    }
  }, [cardDate]);

  useEffect(() => {
    handleResetProcell();
    handleResetProcellFilters();
  }, [energyCardFilters]);

  return (
    <Content>
      {!state.energyInsightsSummary.containsAnalysisData ? (
        <NoAnalisysWarning>
          <svg
            width="21"
            height="24"
            viewBox="0 0 21 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.1765 10.9H5.47059M7.70588 15.3H5.47059M14.4118 6.5H5.47059M18.8824 12V6.28C18.8824 4.43183 18.8824 3.50774 18.5169 2.80183C18.1954 2.1809 17.6825 1.67606 17.0516 1.35968C16.3344 1 15.3955 1 13.5176 1H6.36471C4.48688 1 3.54797 1 2.83074 1.35968C2.19984 1.67606 1.68691 2.1809 1.36545 2.80183C1 3.50774 1 4.43183 1 6.28V17.72C1 19.5682 1 20.4923 1.36545 21.1982C1.68691 21.8191 2.19984 22.3239 2.83074 22.6403C3.54797 23 4.48688 23 6.36471 23H9.94118M14.4118 16.4L20 21.9M20 16.4L14.4118 21.9"
              stroke="#7D7D7D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>{t('naoHaDados')}</p>
          <span>{t('paraGerarAnalise')}</span>
        </NoAnalisysWarning>
      ) : (
        <>
          {state.energyInsightsSummary.containsProcel && (
            <EnergyEfficiencyStyled>
              <EnergyEfficiencyHeader>
                <h3>{t('Eficiência Energética')}</h3>
                <span>{t('unidades')}</span>
              </EnergyEfficiencyHeader>
              {state.energyInsightsData.map((ticket) => (
                <EnergyEfficiencyTicket
                  key={`energy-insigths-ticket-${ticket.label}`}
                  isSelected={
                    state.procellFiltersSelected.findIndex(
                      (procell) => procell === ticket.label,
                    ) >= 0
                  }
                  ticket={ticket}
                  handleRedirect={() => {
                    const pageFilters = JSON.stringify(energyCardFilters);
                    const insideFiltersEncoded = JSON.stringify(insideFilters);
                    const date = `${cardDate.month} ${cardDate.year}`;
                    const url = `/analise/energia?tipo=energy&pageFilters=${pageFilters}&insideFilters=${insideFiltersEncoded}&procellFilters=${ticket.label.toUpperCase()}&date=${date}`;

                    window.open(url, '_blank');
                  }}
                  handleClickTicket={(label, units) => {
                    if (
                      state.procellFiltersSelected.length === 1
                      && state.procellFiltersSelected[0] === label
                    ) {
                      handleResetProcell();
                      updateFilters();
                      render();
                      return;
                    }

                    if (state.procellFiltersSelected.length === 7) {
                      handleResetProcell();
                      state.procellFiltersSelected = [label];
                      state.procellFilters[label] = units;
                      updateFilters();
                      render();
                      return;
                    }

                    if (
                      state.procellFiltersSelected.findIndex(
                        (procell) => procell === label,
                      ) >= 0
                    ) {
                      state.procellFiltersSelected = state.procellFiltersSelected.filter(
                        (procell) => procell !== label,
                      );
                      state.procellFilters[label] = [];
                    } else {
                      state.procellFiltersSelected.push(label);
                      state.procellFilters[label] = units;
                    }
                    updateFilters();
                    render();
                  }}
                />
              ))}
            </EnergyEfficiencyStyled>
          )}
          {state.energyInsightsSummary.containsProcel && (
            <div
              style={{
                background: colors.GreyDefaultCardBorder,
                width: '1px',
                height: '100%',
              }}
            />
          )}
          <ConsumptionStyled isExpanded={energyCard?.isExpanded}>
            {energyCard?.isExpanded && (
              <ConsumptionChart
                chartData={state.historyChartData}
                chartMode="monthMode"
                cardYear={cardDate.year}
                cardMonth={cardDate.month}
                filterDatesChart={filterDatesChart}
                isLoading={isLoading}
                handleClickBarChart={handleClickBarChart}
                handleChangeComparingChart={() => {}}
                canCompare={false}
                chartWrapperStyle={{
                  height: '235px',
                }}
                consumptionChartStyle={{
                  padding: '0',
                }}
              />
            )}
            <ConsumptionResultContainer isExpanded={energyCard?.isExpanded}>
              <ConsumptionResultData>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <h3>{t('consumo')}</h3>
                  <span>{t('mediaGeral')}</span>
                </div>
                <p>
                  {
                    handleFormatAndConvertNumber(
                      state.energyInsightsSummary.averageConsumption,
                    )[0]
                  }
                  {' '}
                  <span>
                    {
                      handleFormatAndConvertNumber(
                        state.energyInsightsSummary.averageConsumption,
                      )[1]
                    }
                    h/m²
                  </span>
                </p>
                {state.energyInsightsSummary
                  .averageConsumptionPreviousMonthPercentage ? (
                    <DeltaInfo
                      isPositive={
                      state.energyInsightsSummary
                        .averageConsumptionPreviousMonthPercentage > 0
                    }
                    >
                      <div>
                        <svg
                          width="7"
                          height="6"
                          viewBox="0 0 7 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.85156 6L6.88265 0.75H0.820474L3.85156 6Z"
                            fill="#5AB365"
                          />
                        </svg>
                      </div>

                      <p>
                        {state.energyInsightsSummary
                          .averageConsumptionPreviousMonthPercentage > 0 && '+'}
                        {
                        formatNumberWithFractionDigits(state.energyInsightsSummary
                          .averageConsumptionPreviousMonthPercentage, { minimum: 0, maximum: 2 })
                        }
                        %
                      </p>

                      <svg
                        width="15"
                        height="14"
                        viewBox="0 0 15 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        data-tip="delta-procell-summary"
                        data-for="delta-procell-summary"
                      >
                        <path d="M7.43656 9.519V7.085M7.43656 4.651H7.44265M13.5216 7.085C13.5216 10.4457 10.7972 13.17 7.43656 13.17C4.07591 13.17 1.35156 10.4457 1.35156 7.085C1.35156 3.72435 4.07591 1 7.43656 1C10.7972 1 13.5216 3.72435 13.5216 7.085Z" stroke="#B6B6B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <ReactTooltip
                        id="delta-procell-summary"
                        place="top"
                        effect="solid"
                      >
                        <TooltipContainer>
                          <p>{t('variacaoConsumo')}</p>
                          <span>
                            {t('porcentagemEmRelacao')}
                            <br />
                            {t('aoConsumoAnterior')}
                          </span>
                        </TooltipContainer>
                      </ReactTooltip>
                    </DeltaInfo>
                  ) : <></>}
              </ConsumptionResultData>
              <ConsumptionResultHighlight>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <p>{t('somatorios')}</p>
                  <div
                    style={{ display: 'flex', gap: '15px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <span style={{ color: '#000000' }}>
                        {t('somatorioGeral')}
                        {' '}
                        (
                        {
                          handleFormatAndConvertNumber(
                            state.energyInsightsSummary.totalConsumption,
                          )[1]
                        }
                        h)
                      </span>
                      <HighlightData>
                        {
                          handleFormatAndConvertNumber(
                            state.energyInsightsSummary.totalConsumption,
                          )[0]
                        }
                        {' '}
                        <span>
                          {
                            handleFormatAndConvertNumber(
                              state.energyInsightsSummary.totalConsumption,
                            )[1]
                          }
                          h
                        </span>
                      </HighlightData>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <span style={{ color: '#000000' }}>
                        {t('somatorioGeral')}
                        {' '}
                        (R$)
                      </span>
                      <HighlightData>
                        <span>
                          R$
                        </span>
                        {
                          formatNumberWithFractionDigits(
                            state.energyInsightsSummary.totalCharged ?? 0, { minimum: 0, maximum: 0 },
                          )
                        }
                      </HighlightData>
                    </div>
                  </div>
                </div>
                <p>
                  {t('ucsContabilizadas')}
                  :
                  <span style={{
                    fontWeight: 500,
                    color: '#000',
                  }}
                  >
                    {` ${state.historyChartData?.totalUnits ?? 0}`}
                  </span>
                </p>
                <span>{t('somatorioConsiderando')}</span>
              </ConsumptionResultHighlight>
            </ConsumptionResultContainer>
          </ConsumptionStyled>
        </>
      )}
    </Content>
  );
};
