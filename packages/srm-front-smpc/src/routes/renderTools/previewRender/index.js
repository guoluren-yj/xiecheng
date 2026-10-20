import React from 'react';
import { Popover } from 'choerodon-ui';
import uuidv4 from 'uuid/v4';
import SkuPreview from './SkuPreview';

import defaultImg from './images/sku_default.svg';
import styles from './index.less';

export { SkuPreview };

export default function previewRender(props, wrapperStyle = { width: 60, height: 60 }) {
  const { imagePath, ...params } = props;

  const _wrapperStyle = { width: 60, height: 60, ...wrapperStyle };
  const { width, height } = wrapperStyle;
  return (
    <div className={styles['sku-view-container']} style={_wrapperStyle}>
      <Popover
        // trigger="click"
        content={
          <div style={{ width: 600, height: 400, overflow: 'auto' }}>
            <SkuPreview id={uuidv4()} {...params} />
          </div>
        }
        placement="right"
      >
        <img
          style={{ width, height }}
          src={imagePath || defaultImg}
          className="sku-primary-img"
          alt=""
        />
      </Popover>
    </div>
  );
}
