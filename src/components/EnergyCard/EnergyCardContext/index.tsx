import moment from 'moment';
import {
  ReactNode, createContext, useContext, useState,
} from 'react';

interface EnergyCardContextData {
  cardDate: { isApiDate: boolean; verifyDate: boolean; month: string; year: string, isCurrentMonth: boolean };
  isLoadingFilters: boolean;
  handleSetIsLoadingFilters: (value: boolean) => void;
  cardControlTab: string;
  handleChangeTab: (newTab: string) => void;
  tabIsLoading: {
    insights: boolean;
    history: boolean;
    trends: boolean;
  };
  handleSetTabIsLoading: (value: boolean, tab: string) => void;
  handleSetCardDate: (date) => void;
}

const EnergyCardContext = createContext({} as EnergyCardContextData);

interface EnergyCardProviderProps {
  children: ReactNode;
}

export const EnergyCardProvider: React.FC<EnergyCardProviderProps> = ({
  children,
}) => {
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);
  const [cardControlTab, setCardControlTab] = useState<string>('insights');
  const currentMonth = moment().format('MMMM');
  const currentYear = moment().format('YYYY');

  const [cardDate, setCardDate] = useState<{
    isApiDate: boolean;
    verifyDate: boolean;
    month: string;
    year: string;
    isCurrentMonth: boolean;
  }>({
    isApiDate: false,
    verifyDate: false,
    month: currentMonth,
    year: currentYear,
    isCurrentMonth: true,
  });

  const [tabIsLoading, setTabIsLoading] = useState<{
    insights: boolean;
    history: boolean;
    trends: boolean;
  }>({
    insights: true,
    history: false,
    trends: false,
  });

  const handleSetCardDate = (date) => {
    setCardDate((prevState) => ({ ...prevState, ...date, isCurrentMonth: verifyIsCurrentMonth(date) }));
  };

  const handleSetIsLoadingFilters = (value: boolean) => setIsLoadingFilters(value);

  const handleChangeTab = (newTab: string) => setCardControlTab(newTab);

  const handleSetTabIsLoading = (value: boolean, tab: string) => {
    setTabIsLoading((prevState) => ({
      ...prevState,
      [tab]: value,
    }));
  };

  function verifyIsCurrentMonth(date) {
    const currentMonth = moment().format('MMMM');
    const currentYear = moment().format('YYYY');
    return date?.month === currentMonth && date?.year === currentYear;
  }

  return (
    <EnergyCardContext.Provider
      value={{
        cardDate,
        isLoadingFilters,
        handleSetIsLoadingFilters,
        cardControlTab,
        handleChangeTab,
        tabIsLoading,
        handleSetTabIsLoading,
        handleSetCardDate,
      }}
    >
      {children}
    </EnergyCardContext.Provider>
  );
};

export const useEnergyCard = () => useContext(EnergyCardContext);
