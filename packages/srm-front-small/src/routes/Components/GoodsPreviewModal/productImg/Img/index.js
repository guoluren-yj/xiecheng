import React, { useRef } from 'react';

import Image from '../../Image';
import styles from './index.less';

export default function ImageMagnifier(props) {
  // 主图宽度 // 大图的宽度 // 左侧边距
  const { mainImgWidth = 175, bigImgWidth = 300, bigImgLeft = 200, minImg, maxImg } = props;
  const bigBox = useRef();
  const bigImg = useRef();
  const block = useRef();

  const onMouseOut = () => {
    if (bigBox.current) {
      bigBox.current.style.display = 'none';
    }
  };

  const onMouseMove = event => {
    const e = event || window.event;
    const { offsetX: mouseX, offsetY: mouseY } = e.nativeEvent;
    const bigImageCount = (bigImgWidth * 2) / mainImgWidth; // 大图的移动倍数
    let offsetX = mouseX; // 主图左距
    let offsetY = mouseY; // 主图上距
    if (mouseX < mainImgWidth / 4) {
      // 超过边界
      offsetX = mainImgWidth / 4;
    }
    if (mouseX > (3 * mainImgWidth) / 4) {
      offsetX = `${(3 * mainImgWidth) / 4}px`;
    }
    if (mouseY < mainImgWidth / 4) {
      offsetY = mainImgWidth / 4;
    }
    if (mouseY > (3 * mainImgWidth) / 4) {
      // 超过边界
      offsetY = `${(3 * mainImgWidth) / 4}px`;
    }
    // 遮罩的left,top
    if (block.current) {
      block.current.style.left = `${parseFloat(offsetX - mainImgWidth / 4)}px`;
      block.current.style.top = `${parseFloat(offsetY - mainImgWidth / 4)}px`;
    }
    // 大图left,top
    if (bigImg.current) {
      bigImg.current.style.left = `-${(offsetX - mainImgWidth / 4) * bigImageCount}px`;
      bigImg.current.style.top = `-${(offsetY - mainImgWidth / 4) * bigImageCount}px`;
    }
    if (bigBox.current) {
      bigBox.current.style.display = 'block';
    }
    // move时显示
  };

  return (
    <div className={styles['img-container']}>
      <div
        // id="smallBox"
        className="main-img-box"
        style={{ width: mainImgWidth }}
        onMouseOut={onMouseOut}
        onBlur={e => e}
        onMouseMove={e => onMouseMove(e)}
      >
        {/* 事件委托 解决抖动 */}
        <div style={{ width: mainImgWidth, height: mainImgWidth }} className="cover" />
        <Image width={mainImgWidth} height={mainImgWidth} value={minImg} />
        <span ref={block} style={{ width: mainImgWidth / 2, height: mainImgWidth / 2 }} />
      </div>
      <div
        ref={bigBox}
        className="big-img-Box"
        style={{ width: bigImgWidth, height: bigImgWidth, left: bigImgLeft }}
      >
        <div ref={bigImg} style={{ width: bigImgWidth * 2, height: bigImgWidth * 2 }}>
          <Image width={bigImgWidth * 2} height={bigImgWidth * 2} value={maxImg} />
        </div>
      </div>
    </div>
  );
}
