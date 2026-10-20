import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';
import intl from 'utils/intl';
import { precisionRender } from '@/utils/precision';
import c7nModal from '@/utils/c7nModal';
import Detail from '../../PriceStrategy/Detail';
import styles from './styles.less';

const ShowPrice = ({ price, type = 'yellow', currency }) => {
  const classMap = {
    yellow: 'price-init',
    green: 'price-down',
    red: 'price-up',
  };
  const typeClass = classMap[type];
  return (
    <Tooltip
      title={intl
        .get('sagm.common.view.skuTaxPrice', { value: price })
        .d(`商品含税单价：￥${price}`)}
    >
      <span className={classNames({ 'price-show': true, [typeClass]: true })}>
        {currency}
        {price}
      </span>
    </Tooltip>
  );
};

const viewStrategy = (record) => {
  const priceStrategyId = record.get('priceStrategyId');
  const title = intl.get('sagm.priceStrategy.view.strategyDetail').d('策略明细');
  const { pathname, search = '' } = window.location;
  const viewSkuBackPath = `${pathname.replace('/app', '')}${search}`;
  c7nModal({
    style: { width: 742 },
    title,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: <Detail type={priceStrategyId} readOnly viewSkuBackPath={viewSkuBackPath} />,
  });
};

// 240px
export default function linePriceRender({ record, dataSet }, skuName) {
  const { salePrice, creationDate } = record.get(['salePrice', 'creationDate']);
  const prevRecord = dataSet.get(record.index + 1) || record;
  const prevSalePrice = prevRecord.get('salePrice');
  const salePriceText = precisionRender({ name: 'salePrice', record });
  const prevSalePriceText = precisionRender({ name: 'salePrice', record: prevRecord });
  const purchasePriceText = precisionRender({ name: 'purchasePrice', record });
  const diffPrice = math.minus(salePrice, prevSalePrice);
  const diffClass = diffPrice >= 0 ? 'price-up' : 'price-down';
  const diffSign = diffPrice >= 0 ? '+' : '-';
  const isInitPrice = record.index === dataSet.length - 1;
  const inits = (
    <div className={styles['price-wrapper']}>
      <span className="sku-name">{skuName}</span>
      <span className="price-action">{intl.get('sagm.common.view.purPriceAs').d('采购价为')}</span>
      <ShowPrice price={purchasePriceText} />，
      <span className="price-action">
        {intl.get('sagm.common.view.salePriceSetAs').d('销售价定价为')}
      </span>
      <ShowPrice price={salePriceText} />
    </div>
  );

  const changes = (
    <div className={styles['price-wrapper']}>
      <span className="sku-name">{skuName}</span>
      <span className="price-action">
        {intl.get('sagm.common.view.salePriceFrom').d('销售价由')}
      </span>
      <ShowPrice price={prevSalePriceText} />
      <span className="price-action">{intl.get('sagm.common.view.updateTo').d('变更为')}</span>
      <ShowPrice price={salePriceText} type={diffPrice >= 0 ? 'red' : 'green'} />
      <span className={`price-tag ${diffClass}`}>
        {`${diffSign}${new BigNumber(diffPrice).absoluteValue()}`}
      </span>
    </div>
  );

  return {
    icon: isInitPrice ? 'attach_money' : 'autorenew',
    time: creationDate,
    header: (
      <div className={styles['price-record-container']}>
        {isInitPrice ? inits : changes}
        <a onClick={() => viewStrategy(record)}>
          {intl.get('sagm.common.view.button.lookStrategy').d('查看策略')}
        </a>
      </div>
    ),
  };
}
