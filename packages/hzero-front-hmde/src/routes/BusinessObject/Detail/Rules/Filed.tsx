import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { Icon } from 'choerodon-ui';

import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';

const ItemTypes = {
  CARD: 'card',
};

export interface CardProps {
  id: any;
  text: string;
  index: number;
  // eslint-disable-next-line no-unused-vars
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  // eslint-disable-next-line no-unused-vars
  handleDelete: (id: any) => void;
  tenantReadOnly: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export default ({ id, text, index, moveCard, handleDelete, tenantReadOnly }: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // eslint-disable-next-line no-param-reassign
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { id, index, type: ItemTypes.CARD },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <div
      ref={!tenantReadOnly ? ref : undefined}
      className={styles['field-contain']}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <div className={styles['field-item']}>
        <div>
          <Icon type="view_headline" />
          <span>{+index + 1}</span>
          <span>{text}</span>
        </div>
        <ImgIcon
          name="blue-button-delet@1x.svg"
          size={16}
          style={{ cursor: 'pointer' }}
          onClick={() => handleDelete(id)}
          hidden={tenantReadOnly}
        />
      </div>
    </div>
  );
};
