import React from 'react';
import Image from '@/components/Image';

import styles from './index.less';

export default function ProductInfoCell(props) {
  const { imagePath, skuName, spuCode, categoryNamePath } = props;
  return (
    <div className={styles['product-content']}>
      <Image value={imagePath} className="info-img" />
      <div className="info-content">
        <p className="product-name" title={skuName}>
          {skuName}
        </p>
        <p className="product-other">
          <span className="product-spu" title={spuCode}>
            {spuCode}
          </span>
          <span className="product-category" title={categoryNamePath}>
            {categoryNamePath}
          </span>
        </p>
      </div>
    </div>
  );
}
