/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useCallback } from 'react';
import { DraggableCard } from './DraggableCard';
import { ICard, useCard } from '../../../contexts/CardContext';
import { Flex } from 'reflexbox';
import {
  AddCard, EmptyCard, HorizontalLine, Title,
} from './styles';
import { PlusOutlined } from '@ant-design/icons';

export interface DraggableItem {
  id: number;
  text: string;
}

export interface DraggableAreaState {
  cards: DraggableItem[];
}

interface DraggableAreaProps {
  closeModal?: () => void;
}

export const DraggableArea = ({ closeModal }: DraggableAreaProps) => {
  const { cards, dispatch } = useCard();

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    dispatch({ type: 'CHANGE_ORDER', payload: { dragIndex, hoverIndex } });
  }, [dispatch]);

  const addCard = useCallback((card: ICard) => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: card?.type });
  }, [dispatch]);

  const enabledCards = cards.filter((card) => card.isActive);
  const disabledCards = cards.filter((card) => !card.isActive);

  return (
    <>
      <Flex width={1} alignItems="center" justifyContent="flex-start" flexWrap="wrap">
        {enabledCards.map((card) => (
          <DraggableCard
            key={card.type}
            card={card}
            index={card.position}
            moveCard={moveCard}
            closeModal={closeModal}
          />
        ))}
        {disabledCards.map((_, i) => (
          <EmptyCard key={i}>Vazio</EmptyCard>
        ))}
        {disabledCards.length > 0 && (
          <>
            <HorizontalLine />
            <Flex width={1} alignItems="flex-start" justifyContent="flex-start" flexDirection="column">
              <Title>Adicionar</Title>
              <Flex width={1} alignItems="center" justifyContent="flex-start" flexWrap="wrap">
                {disabledCards.map((card) => (
                  <AddCard key={card.type} onClick={() => addCard(card)}>
                    <PlusOutlined size={18} />
                    {card.title}
                  </AddCard>
                ))}
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </>
  );
};
