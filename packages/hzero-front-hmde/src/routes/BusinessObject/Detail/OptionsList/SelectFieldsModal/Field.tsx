import React, { useState } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { useDrop, useDrag } from 'react-dnd';

import styles from './index.less';

export default observer(({ dndType, onDrop = () => {}, data, children, style = {} }) => {
  const [hoverItem, setHoverItem] = useState(null);

  const [{ canDrop: canLeftDrop, isOver: isLeftOver }, sortLeftDrop] = useDrop({
    accept: dndType,
    collect: (monitor) => ({
      isOver: monitor.isOver(), // 是否有元素进入该区域
      canDrop: monitor.canDrop(), // 是否有元素进行拖动
    }),
    drop: () => ({
      callback: (dragData) => {
        onDrop(dragData, data, 'left');
      },
    }),
  });
  const [{ canDrop: canRightDrop, isOver: isRightOver }, sortRightDrop] = useDrop({
    accept: dndType,
    collect: (monitor) => ({
      isOver: monitor.isOver(), // 是否有元素进入该区域
      canDrop: monitor.canDrop(), // 是否有元素进行拖动
    }),
    drop: () => ({
      callback: (dragData) => {
        onDrop(dragData, data, 'right');
      },
    }),
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: dndType,
      data,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => {
      setHoverItem(data);
    },
    end(item, monitor) {
      setHoverItem(null);
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        dropResult.callback(data);
      }
    },
  });

  const isLeftActive = canLeftDrop && isLeftOver;
  const isRightActive = canRightDrop && isRightOver;

  return (
    <div style={{ opacity: isDragging ? 0.4 : 1, position: 'relative', ...style }}>
      <span
        className={classnames({ [styles.canDropLine]: true, [styles.canDropActive]: isLeftActive })}
      />
      <span
        ref={sortLeftDrop}
        className={styles.canLeftDrop}
        style={{ zIndex: canLeftDrop && !hoverItem ? 1 : -1 }}
      />
      <div
        ref={drag}
        style={{ display: 'flex', alignItems: 'center' }}
        onDragEnter={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDragOver={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {children}
      </div>
      <span
        ref={sortRightDrop}
        className={styles.canRightDrop}
        style={{ zIndex: canRightDrop && !hoverItem ? 1 : -1 }}
      />
      <span
        className={classnames({
          [styles.canDropLine]: true,
          [styles.canDropActive]: isRightActive,
        })}
      />
    </div>
  );
});
