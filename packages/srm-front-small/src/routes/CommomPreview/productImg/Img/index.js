import React from 'react';

import Image from '../../Image';
import styles from './index.less';

export default function ImageMagnifier(props) {
  // 主图宽度 // 大图的宽度 // 左侧边距
  const { mainImgWidth = 350, bigImgWidth = 600, bigImgLeft = 400, minImg, maxImg } = props;

  const onMouseOut = () => {
    const bigBox = document.getElementById('bigBox');
    bigBox.style.display = 'none';
  };

  const onMouseMove = (event) => {
    const e = event || window.event;
    const { offsetX: mouseX, offsetY: mouseY } = e.nativeEvent;
    const bigImageCount = (bigImgWidth * 2) / mainImgWidth; // 大图的移动倍数
    const bigBox = document.getElementById('bigBox');
    const bigImg = document.getElementById('bigImg');
    const block = document.getElementById('product-detail-span');
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
    block.style.left = `${parseFloat(offsetX - mainImgWidth / 4)}px`;
    block.style.top = `${parseFloat(offsetY - mainImgWidth / 4)}px`;
    // 大图left,top
    bigImg.style.left = `-${(offsetX - mainImgWidth / 4) * bigImageCount}px`;
    bigImg.style.top = `-${(offsetY - mainImgWidth / 4) * bigImageCount}px`;
    // move时显示
    bigBox.style.display = 'block';
  };

  return (
    <div className={styles['common-img-container']}>
      <div
        id="smallBox"
        className="main-img-box"
        style={{ width: mainImgWidth }}
        onMouseOut={onMouseOut}
        onBlur={(e) => e}
        onMouseMove={(e) => onMouseMove(e)}
      >
        {/* 事件委托 解决抖动 */}
        <div style={{ width: mainImgWidth, height: mainImgWidth }} className="cover" />
        <Image width={mainImgWidth} height={mainImgWidth} value={minImg} />
        <span
          id="product-detail-span"
          style={{ width: mainImgWidth / 2, height: mainImgWidth / 2 }}
        />
      </div>
      <div
        id="bigBox"
        className="big-img-Box"
        style={{ width: bigImgWidth, height: bigImgWidth, left: bigImgLeft }}
      >
        <Image width={bigImgWidth * 2} height={bigImgWidth * 2} id="bigImg" value={maxImg} />
      </div>
    </div>
  );
}
