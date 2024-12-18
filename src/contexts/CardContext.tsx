/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, {
  createContext, useReducer, useContext, useEffect, ReactNode, useMemo,
} from 'react';
import { getUserProfile } from '~/helpers/userProfile';
import { apiCall } from '~/providers';

export interface ICard {
  type: number;
  position: number;
  title: string;
  isActive: boolean;
  isExpanded: boolean;
}

type Action =
  | { type: 'TOGGLE_ACTIVE'; payload: number }
  | { type: 'TOGGLE_EXPANDED'; payload: number }
  | { type: 'CHANGE_ORDER'; payload: { dragIndex: number; hoverIndex: number } }
  | { type: 'SAVE_STATE' }
  | { type: 'RESET_ALL', payload: ICard[] };

interface CardContextState {
  cards: ICard[];
  dispatch: React.Dispatch<Action>;
}

const CardContext = createContext<CardContextState | undefined>(undefined);

export const CardProvider = ({ children }: { children: ReactNode }) => {
  const user = getUserProfile();

  const submitCards = async (cards: ICard[]) => {
    try {
      await apiCall('/users/set-prefs-overview', { userId: user.user, prefs: cards });
    } catch (error) {
      console.error('Erro ao salvar preferências do usuário', error);
    }
  };

  const reducer = (state: ICard[], action: Action): ICard[] => {
    switch (action.type) {
      case 'TOGGLE_ACTIVE':
        return state.map((card) => (card.type === action.payload ? { ...card, isActive: !card.isActive } : card));
      case 'TOGGLE_EXPANDED':
        return state.map((card) => (card.type === action.payload ? { ...card, isExpanded: !card.isExpanded } : card));
      case 'CHANGE_ORDER': {
        const { dragIndex, hoverIndex } = action.payload;
        const dragCard = state[dragIndex];
        const newCards = [...state];
        newCards.splice(dragIndex, 1);
        newCards.splice(hoverIndex, 0, dragCard);
        return newCards.map((card, index) => ({ ...card, position: index }));
      }
      case 'SAVE_STATE':
        submitCards(state);
        return state;
      case 'RESET_ALL':
        if (action.payload.length === 0) {
          return [];
        }

        return action.payload;
      default:
        return state;
    }
  };

  const [cards, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    if (user && user.user) {
      (async () => {
        try {
          const response = await apiCall('/users/get-prefs-overview', { userId: user.user });
          if (response) {
            const orderedCards: any = response.prefs.sort((a: any, b: any) => a.position - b.position);
            dispatch({ type: 'RESET_ALL', payload: orderedCards });
          }
        } catch (error) {
          console.error('Erro ao obter preferências do usuário', error);
        }
      })();
    }
  }, [user.user]);

  const contextValue = useMemo(() => ({ cards, dispatch }), [cards, dispatch]);

  return (
    <CardContext.Provider value={contextValue}>
      {children}
    </CardContext.Provider>
  );
};

export const useCard = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext deve ser usado dentro de um CardProvider');
  }
  return context;
};
