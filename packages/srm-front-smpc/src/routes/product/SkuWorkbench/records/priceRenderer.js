import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';
import intl from 'utils/intl';
import styles from './styles.less';

const ShowPrice = ({ price, type = 'yellow', currency = '￥' }) => {
  const classMap = {
    yellow: 'price-init',
    green: 'price-down',
    red: 'price-up',
  };
  const typeClass = classMap[type];
  return (
    <Tooltip
      title={intl
        .get('smpc.product.view.skuTaxPrice', { value: price })
        .d(`商品含税单价：￥${price}`)}
    >
      <span className={classNames({ 'price-show': true, [typeClass]: true })}>
        {currency}
        {price}
      </span>
    </Tooltip>
  );
};

// 240px
export default function priceRenderer({ record, dataSet }, skuName) {
  const { currentPrice, oldPrice, changeDate } = record.toData();
  const diffPrice = math.minus(currentPrice, oldPrice);
  const diffClass = diffPrice >= 0 ? 'price-up' : 'price-down';
  const diffSign = diffPrice >= 0 ? '+' : '-';

  const isInitPrice = record.index === dataSet.length - 1;

  const initContent = (
    <div className={styles['price-wrapper']}>
      <span className="sku-name">{skuName}</span>
      <span className="price-action">{intl.get('smpc.product.view.initPriceSet').d('定价为')}</span>
      <ShowPrice price={currentPrice} />
    </div>
  );

  return {
    icon: isInitPrice ? 'attach_money' : 'autorenew',
    time: changeDate,
    header: isInitPrice ? (
      initContent
    ) : (
      <div className={styles['price-wrapper']}>
        <span className="sku-name">{skuName}</span>
        <span className="price-action">{intl.get('smpc.product.view.priceFrom').d('价格由')}</span>
        <ShowPrice price={oldPrice} />
        <span className="price-action">{intl.get('smpc.product.view.updateTo').d('变更为')}</span>
        <ShowPrice price={currentPrice} type={diffPrice >= 0 ? 'red' : 'green'} />
        <span className={`price-tag ${diffClass}`}>
          {`${diffSign}￥${new BigNumber(diffPrice).abs()}`}
        </span>
      </div>
    ),
  };
}
