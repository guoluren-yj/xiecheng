import React from 'react';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';

const promptKey = 'small.productDetail';
export default function Price(props) {
  const { sourceFrom, currentPrice, prePrice } = props;
  return (
    <div className="product-price">
      {sourceFrom !== 'CATA' && (
        <div className="jd-price-label">
          {intl.get(`${promptKey}.model.productDetail.corporateExclusive`).d('企业专享')}
        </div>
      )}
      <div className="p-content" style={{ marginLeft: sourceFrom === 'CATA' ? 0 : 24 }}>
        <span className="p-price">{currentPrice ? numberRender(currentPrice, 2) : '-'}</span>
        {/* {sourceFrom !== 'CATA' && ( */}
        <span className="p-jd-price">{numberRender(prePrice, 2)}</span>
        {/* )} */}
      </div>
    </div>
  );
}
