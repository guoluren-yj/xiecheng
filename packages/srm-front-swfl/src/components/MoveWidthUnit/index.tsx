/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import styles from './index.less';

interface IIndex {
  onChange?: (width: number) => void;
  handleWidth?: () => void;
}

const Index = ({ onChange, handleWidth }: IIndex) => {
  const [showDotted, setShowDotted] = useState(false); // 控制拖拉虚线显隐
  const [dottedLeft, setDottedLeft] = useState(0); // 拖拉虚线位置

  const handleMouseDown = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    let _downSuo = false;
    let finalPosition: number = 0;
    let moveWidth: number = 0;
    const handleMouseMove = bodyEvent => {
      bodyEvent.preventDefault();
      bodyEvent.stopPropagation();
      // 设置拖拉虚线
      setShowDotted(true);
      _downSuo = true;
      if (bodyEvent.clientX - 220 - 14 < 150) {
        return;
      }
      setDottedLeft(bodyEvent.clientX);
      if (_downSuo) {
        finalPosition = bodyEvent.pageX || 0;
        // moveWidth = document.body.clientWidth - finalPosition;
        moveWidth = finalPosition - 220 - 14;
        // 回调 onChange
        if (onChange) {
          onChange(moveWidth);
        }
      }
    };
    const handleMouseUp = bodyEvent => {
      bodyEvent.preventDefault();
      bodyEvent.stopPropagation();
      if (_downSuo) {
        if (handleWidth) {
          handleWidth();
        }
        setShowDotted(false);
        _downSuo = false;
        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);
      }
    };
    document.body.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={styles['move-unit']}>
      {showDotted && (
        <span className={styles['slide-dotted']} style={{ left: `${dottedLeft}px` }} />
      )}
      <span className={styles['slide-solid']} />
      <i className={styles.slide} onMouseDown={handleMouseDown} />
    </div>
  );
};

export default Index;
