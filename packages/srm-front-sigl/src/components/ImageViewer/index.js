import React, { useState } from 'react';
import { Row, Col, Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import Image from '@/components/Image';
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
            {intl.get('smpc.product.view.picturePreview').d('图片预览')}
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
        <Icon style={{ left: 40, fontSize: 48 }} type="navigate_before" onClick={handlePrev} />
        <div className="image-box">
          <Image value={imgList[currentIndex]?.fileUrl} />
        </div>
        <Icon style={{ right: 40, fontSize: 48 }} type="navigate_next" onClick={handleNext} />
      </div>
    </div>
  );
}
