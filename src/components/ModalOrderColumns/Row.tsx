import { useRef } from 'react';
import { IconWrapper, OrderColumnModal } from './styles';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import OlhoAberto from '~/icons/OlhoAberto';
import OlhoFechado from '~/icons/OlhoFechado';
import { ThreeDotsVerticalIcon } from '~/icons/ThreeDotsVerticalIcon';

type ColumnType = {
  id: string | number;
  visible: boolean;
  label: string;
}

interface RowProps {
  index: string | number;
  column: ColumnType;
  handleChangeVisibility: (columnId) => void;
  handleMoveItem: (dragIndex: number | string, hoverIndex: number | string) => void
}

export const Row: React.FC<RowProps> = ({
  column, handleChangeVisibility, handleMoveItem, index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop<
    ColumnType,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      handleMoveItem(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: () => ({ id: column.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <OrderColumnModal ref={ref} style={{ opacity: isDragging ? 0 : 1 }} onClick={() => handleChangeVisibility(column.id)}>
      <IconWrapper>
        <ThreeDotsVerticalIcon />
      </IconWrapper>
      {column.label}
      <IconWrapper>
        {column.visible ? (
          <OlhoAberto />
        ) : (
          <OlhoFechado />
        )}
      </IconWrapper>
    </OrderColumnModal>
  );
};

export default Row;
