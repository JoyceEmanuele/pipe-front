import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import ExpansaoRemocao from '../assets/img/ExpansaoRemocao.gif';
import MoverCards from '../assets/img/MoverCards.gif';
import { t } from 'i18next';
import { apiCall } from '~/providers';
import { getUserProfile } from '~/helpers/userProfile';

export interface ITour {
  step: number;
  highlight?: boolean;
  isActive: boolean;
  title: string;
  description: ReactNode;
}

type Action =
  | { type: 'CHANGE_STEP'; payload: number }
  | { type: 'FINISH_TOUR' };

interface TourContextState {
  tour: ITour[];
  isTourActive: boolean;
  totalSteps: number;
  currentStep: number;
  stepHistory: number[];
  dispatch: React.Dispatch<Action>;
}
const TourContext = createContext<TourContextState | undefined>(undefined);

const initialState: ITour[] = [
  {
    step: 0,
    highlight: true,
    isActive: false,
    title: t('configuracaoRapida'),
    description: (
      <p>
        {t('configuracaoRapidaDescricao')}
      </p>
    ),
  },
  {
    step: 1,
    isActive: false,
    title: t('botaoEdicao'),
    description: (
      <p>
        {t('botaoEdicaoDescricao')}
      </p>
    ),
  },
  {
    step: 2,
    highlight: true,
    isActive: false,
    title: t('movimentarCards'),
    description: (
      <div style={{ width: '100%', marginBottom: '8px' }}>
        <p>
          {t('movimentarCardsDescricao')}
        </p>
        <img src={MoverCards} alt="Movimentar e realocar cards" width="100%" />
      </div>
    ),
  },
  {
    step: 3,
    highlight: true,
    isActive: false,
    title: t('expandirVisualizacao'),
    description: (
      <div style={{ width: '100%', marginBottom: '8px' }}>
        <p>
          {t('expandirVisualizacaoDescricao')}
        </p>
        <img
          src={ExpansaoRemocao}
          alt="Expandir e inibir visualização"
          width="100%"
        />
      </div>
    ),
  },
];

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const profile = getUserProfile();
  const [stepHistory, setStepHistory] = useState<number[]>([0, 0, 0, 0, 0]);

  const finishTour = async () => {
    await apiCall('/users/edit-user', {
      USER: profile?.user,
      PREFS: JSON.stringify({
        tour_finished: true,
      }),
    });
  };

  const [tour, dispatch] = useReducer((state: ITour[], action: Action) => {
    switch (action.type) {
      case 'CHANGE_STEP':
        setStepHistory((prevHistory) => [action.payload, ...prevHistory.slice(0, 4)]);
        return state.map((tourStep) => (tourStep.step === action.payload
          ? { ...tourStep, isActive: true }
          : { ...tourStep, isActive: false }));
      case 'FINISH_TOUR': {
        finishTour();
        setStepHistory([0, 0, 0, 0, 0]);
        return state.map((tourStep) => ({ ...tourStep, isActive: false }));
      }
      default:
        return state;
    }
  }, initialState);

  const totalSteps = tour.length;
  const isTourActive = tour.some((step) => step.isActive);
  const currentStep = tour.find((step) => step.isActive)?.step || 0;

  useEffect(() => {
    const tourFinished = JSON.parse(profile?.prefs || '{}').tour_finished || profile.prefsObj?.tour_finished;
    if (!tourFinished || tourFinished === undefined || tourFinished === null) {
      dispatch({ type: 'CHANGE_STEP', payload: 0 });
    }
  }, []);

  const value = useMemo(
    () => ({
      tour,
      totalSteps,
      isTourActive,
      currentStep,
      stepHistory,
      dispatch,
    }),
    [tour, totalSteps, isTourActive, currentStep, stepHistory],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);

  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }

  return context;
};
