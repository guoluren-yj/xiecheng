import React, { useRef, useState, useEffect } from 'react';
import styles from './product.less';


const BUTTON_WIDTH = 40;

export default function CaptchaModal(props) {
  const { onSuccess, modal, isMobile } = props;
  const width = isMobile ? 250: 300;
  const dragRef = useRef({
    dragStarted: false,
    dragWidth: 0,
  });
  const wrapperRef = useRef(null);
  const [{ dragWidth }, setState] = useState({
    dragWidth: 0,
  });

  useEffect(() => {
    if (isMobile) {
      document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.body.addEventListener('touchend', handleMouseUp);
    } else {
      document.body.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (isMobile) {
        document.body.removeEventListener('touchmove', handleTouchMove);
        document.body.removeEventListener('touchend', handleMouseUp);
      } else {
        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);
  
  const updateState = (newState) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  };

  const handleMouseDown = (e) => {
    dragRef.current.dragStarted = true;
  }; 


  const handleTouchMove = (e) => {
    e.preventDefault();
    if (dragRef.current.dragStarted && wrapperRef.current) {
      const { left } = wrapperRef.current.getBoundingClientRect() || {};
       // 获取第一个触摸点
       const touch = event && event.touches && event.touches[0];
      if (!touch) {
        return;
      }
      const offsetX = touch.clientX - left;
      if (offsetX >= 0) {
        const dragWidth = Math.min(offsetX, width - BUTTON_WIDTH);
        dragRef.current.dragWidth = dragWidth;
        updateState({ dragWidth });
      }
    }
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (dragRef.current.dragStarted && wrapperRef.current) {
      const { left } = wrapperRef.current.getBoundingClientRect() || {};
      const offsetX = e.clientX - left;
      if (offsetX >= 0) {
        const dragWidth = Math.min(offsetX, width - BUTTON_WIDTH);
        dragRef.current.dragWidth = dragWidth;
        updateState({ dragWidth });
      }
    }
  };

  const handleMouseUp = (e) => {
    if (dragRef.current.dragStarted) {
      dragRef.current.dragStarted = false;
      if (dragRef.current.dragWidth >= width - BUTTON_WIDTH) {
        onSuccess();
        if (modal && modal.close) {
          modal.close();
        }
        return;
      }
      dragRef.current.dragWidth = 0;
      updateState({
        dragWidth: 0,
       });
    }
  };

  return (
    <div
      className={styles['captcha-wrapper']}
      style={{ width: `${width}px` }}
      ref={wrapperRef}
    >
      <span className={styles['captcha-text']}>请按住滑块，拖动到最右边</span>
      <div
        className={styles['captcha-button']}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: `${dragWidth}px`,
          width: `${BUTTON_WIDTH}px`,
          height: `${BUTTON_WIDTH}px`,
        }}
      >
        <span>{'>'}</span>
        <span>{'>'}</span>
      </div>
      <div className={styles['captcha-inner']} style={{ width: `${dragWidth + BUTTON_WIDTH}px` }} />
    </div>
  )
}