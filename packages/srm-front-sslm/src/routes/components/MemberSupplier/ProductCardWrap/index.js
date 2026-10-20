/*
 * ProductCardWrap - 主要产品通用组件
 * @Date: 2024-08-22 17:20:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import FileCardByUuid from '@/routes/components/EnterpriseCertification/components/FileCardByUuid';
import styles from './index.less';
import { renderFormField } from '../utils';

const ProductCardWrap = observer(({ dataSet, extraRender, formFields = [], operateRender }) => {
  const { price, productName, productPictureUuid } =
    dataSet?.current?.get(['price', 'productName', 'productPictureUuid']) || {};

  return (
    <div className={styles['card-container']}>
      <div className="card-top">
        <div className="card-left">
          <FileCardByUuid
            viewOnly
            showDefault
            imgWrapClass="product-logo-uuid"
            uuid={productPictureUuid}
          />
        </div>
        <div className="card-right">
          <div className="card-right-top">
            <div className="card-right-top-name">
              <span style={{ marginRight: 8 }}>{productName}</span>
              {price && <span>{`${price}${intl.get('sslm.common.view.field.yuan').d('元')}`}</span>}
            </div>
            <div className="card-right-top-operat">{isFunction(extraRender) && extraRender()}</div>
          </div>
          <div className="card-right-bottom">
            {formFields.map(field => renderFormField({ dataSet, ...field }))}
          </div>
        </div>
      </div>
      {operateRender && <div className="card-bottom">{operateRender(dataSet?.current)}</div>}
    </div>
  );
});

export default ProductCardWrap;
