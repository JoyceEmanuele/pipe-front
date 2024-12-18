import { useEffect } from 'react';
import { useEnergyCard } from '../EnergyCardContext';
import { TrendsChart } from '../TrendsChart';
import { toast } from 'react-toastify';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';
import { handleGetDatesParams } from '~/helpers/getRangeParamsChart';

interface EnergyTrendProps {
  energyCardFilters: {
    startObject?: boolean;
    unitIds?: number[];
    stateIds?: number[];
    cityIds?: string[];
    supervisorIds?: string[];
  };
  insideFilters: {
    clientIds: [];
    stateIds: [];
    cityIds: [];
    unitIds: [];
  };
  handleResetDates;
}

export const EnergyTrend: React.FC<EnergyTrendProps> = ({ energyCardFilters, insideFilters, handleResetDates }) => {
  const { cardDate, handleSetTabIsLoading } = useEnergyCard();
  const [state, render] = useStateVar({
    trendsChartData: {} as any,
  });

  const handleGetTrendsData = async (options?) => {
    try {
      handleSetTabIsLoading(true, 'trends');

      const datesParams = handleGetDatesParams(
        `${cardDate.month} ${cardDate.year}`,
        'MMMM YYYY',
        'monthMode',
        false,
      );

      const data = await apiCall('energy/get-energy-trends', {
        insideFilters: {
          ...insideFilters,
        },
        ...datesParams,
        ...energyCardFilters,
        ...options,
      });

      state.trendsChartData = data;
      render();
    } catch (e) {
      toast.error('Não foi possível buscar informações do gráfico');
    } finally {
      handleSetTabIsLoading(false, 'trends');
    }
  };

  useEffect(() => {
    if (energyCardFilters.startObject || !cardDate.verifyDate) return;
    if (!cardDate.isApiDate) {
      handleResetDates();
    } else {
      handleGetTrendsData();
    }
  }, [cardDate]);

  return (
    <TrendsChart trendChartData={state.trendsChartData} />
  );
};
