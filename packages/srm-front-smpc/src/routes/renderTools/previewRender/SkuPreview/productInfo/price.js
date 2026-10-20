import React from 'react';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { isCustomNumber } from '@/utils/precision';

const promptKey = 'smpc.product';
export default function Price(props) {
  const { sourceFrom, currentPrice, prePrice } = props;
  const getPrice = (_price) => (isCustomNumber(_price) ? numberRender(_price, 2) : '-');
  return (
    <div className="product-price">
      {sourceFrom !== 'CATA' && (
        <div className="jd-price-label">
          {intl.get(`${promptKey}.model.productDetail.corporateExclusive`).d('企业专享')}
        </div>
      )}
      <div className="p-content" style={{ marginLeft: sourceFrom === 'CATA' ? 0 : 24 }}>
        <span className="p-price">{getPrice(currentPrice)}</span>
        {/* {sourceFrom !== 'CATA' && ( */}
        {prePrice && <span className="p-jd-price">{getPrice(prePrice)}</span>}
        {/* )} */}
      </div>
    </div>
  );
}
