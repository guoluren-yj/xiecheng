import React, { useState } from 'react';
import { Row, Col, Icon } from 'choerodon-ui';

import defaultImg from '@/assets/no-product-img.png';
import Icons from '../Icons';
import styles from './index.less';

export default function ImageViewer(props) {
  const { index = 0, imgList = [], closeModal = (e) => e } = props;
  const [currentIndex, setCurrentIndex] = useState(index);

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(imgList.length - 1);
    }
  }

  function handleNext() {
    if (currentIndex < imgList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }

  return (
    <div className={styles['image-viewer']}>
      <div className="image-header">
        <Row>
          <Col span={4} className="text-left col-item">
            图片预览
          </Col>
          <Col span={16} className="text-center col-item">
            {currentIndex + 1}/{imgList.length}
          </Col>
          <Col span={4} className="text-right col-item">
            <Icon type="close" style={{ fontSize: 24 }} onClick={closeModal} />
          </Col>
        </Row>
      </div>
      <div className="image-content">
        <Icons style={{ left: 40 }} size={24} type="left" onClick={handlePrev} />
        <div className="image-box">
          <img src={imgList[currentIndex]?.fileUrl || defaultImg} alt="" />
        </div>
        <Icons size={24} style={{ right: 40 }} type="right" onClick={handleNext} />
      </div>
    </div>
  );
}
