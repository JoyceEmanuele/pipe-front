/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useRef, useState } from 'react';

import { Card } from './styles';
import { MoreIcon } from '../../../icons/More';
import { ICard, useCard } from '../../../contexts/CardContext';
import { CloseIcon, CollapseIcon, ExpandCardIcon } from '../../../icons';
import { Flex } from 'reflexbox';
import { TourPopover } from '~/components/TourPopover';
import { useTour } from '~/contexts/TourContext';
import { t } from 'i18next';

export interface DraggableCardProps {
  card: ICard;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  closeModal?: () => void;
}

export const DraggableCard = ({
  card,
  index,
  moveCard,
  closeModal,
}: DraggableCardProps) => {
  const { dispatch } = useCard();
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
    const hoverIndex = index;

    moveCard(dragIndex, hoverIndex);
  };

  const handleToggleExpanded = () => {
    dispatch({ type: 'TOGGLE_EXPANDED', payload: card?.type });
  };

  const handleToggleVisibility = () => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: card?.type });
  };

  const { tour, totalSteps, isTourActive } = useTour();
  const lastStep = tour.findIndex((step) => step.step === totalSteps - 1);

  return (
    <Card
      className={`${card.isActive === false ? 'disabled' : ''} ${card.isExpanded ? 'expanded' : ''}`}
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      id={index.toString()}
    >
      <Flex width={1} alignItems="center" justifyContent="space-between">
        <MoreIcon color="#D9DADB" />
        <p>{t(card.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())}</p>
        {isTourActive && card.type === 1 ? (
          <TourPopover tour={tour[lastStep]} placement="left" onNextStepClick={closeModal}>
            <Flex alignItems="center">
              {card.isExpanded ? <CollapseIcon onClick={handleToggleExpanded} style={{ cursor: 'pointer' }} /> : <ExpandCardIcon onClick={handleToggleExpanded} style={{ cursor: 'pointer' }} />}
              <CloseIcon style={{ marginLeft: 8, cursor: 'pointer' }} color="#4950CC" onClick={handleToggleVisibility} />
            </Flex>
          </TourPopover>
        ) : (
          <Flex alignItems="center">
            {card.isExpanded ? <CollapseIcon onClick={handleToggleExpanded} style={{ cursor: 'pointer' }} /> : <ExpandCardIcon onClick={handleToggleExpanded} style={{ cursor: 'pointer' }} />}
            <CloseIcon style={{ marginLeft: 8, cursor: 'pointer' }} color="#4950CC" onClick={handleToggleVisibility} />
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
