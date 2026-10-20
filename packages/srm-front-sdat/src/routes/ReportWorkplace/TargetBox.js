/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/aria-role */
import React, { memo } from 'react';
import { useDrop } from 'react-dnd';

import { CardTypes } from './CardTypes';

import GridLayoutPanel from './GridLayoutPanel';

import styles from './index.less';

const TargetBox = memo(function TargetBox(props) {
  const { onDrop, onChangeState = () => {}, onRemoveCard = () => {}, width, setting } = props;
  const cardTypeList = () => {
    const ids = Object.keys(CardTypes);
    return ids.map((item) => CardTypes[item]);
  };

  const [{ canDrop }, drop] = useDrop({
    accept: cardTypeList(),
    drop(_item, monitor) {
      const scrollTop =
        document.getElementById('workplace-card-config-col')?.children[0]?.scrollTop ?? 0; // 获取画板滚动高度
      const dropPos = monitor.getClientOffset();

      const x = Math.floor((dropPos.x - 220) / ((width - 13 * 10) / 12)) - 1; // 拖拽后坐标
      const y = Math.floor((dropPos.y + scrollTop - 140) / ((width - 13 * 10) / 12)) - 1; // 拖拽后坐标

      onDrop(_item, { x, y });
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const columnWidth = (width - 13 * 10) / 12;

  const contentHeight =
    document.getElementById('workplace-card-config-col')?.children[0]?.scrollHeight ?? 0; // 获取画板高度
  const scrollTop =
    document.getElementById('workplace-card-config-col')?.children[0]?.scrollTop ?? 0; // 获取画板滚动高度

  const rowCount = Math.floor(
    ((contentHeight > 1000 ? 1000 : contentHeight) + scrollTop) / columnWidth
  ); // 应该绘制的行数

  const cardList = []; // 背景卡片数
  for (let i = 0; i < rowCount * 12; i++) {
    cardList.push(i);
  }

  return (
    <div ref={drop} className={styles['target-box-style']} role="TargetBox">
      <div className={styles['c7ncd-workbench-container']}>
        {setting && (
          <div
            className={styles['c7ncd-workbench-gridBg']}
            style={{
              gridTemplateColumns: `repeat(12, ${columnWidth}px)`,
              padding: '10px',
            }}
          >
            {cardList.map((item) => {
              return (
                <div
                  key={item}
                  style={{
                    height: `${columnWidth}px`,
                    backgroundColor: 'rgba(14, 29, 128, 0.1)',
                    borderRadius: '10px',
                  }}
                />
              );
            })}
          </div>
        )}
        <GridLayoutPanel onChangeState={onChangeState} onRemoveCard={onRemoveCard} {...props} />
      </div>
    </div>
  );
});

const StatefulTargetBox = (props) => {
  const { onDropAddCard = () => {} } = props;

  const handleDrop = (item, pos) => {
    onDropAddCard(item, pos);
  };

  return <TargetBox {...props} onDrop={handleDrop} />;
};

export default StatefulTargetBox;
