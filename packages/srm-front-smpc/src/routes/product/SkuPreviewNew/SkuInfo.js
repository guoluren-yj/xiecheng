import React from 'react';

import classNames from 'classnames';
import intl from 'utils/intl';

import OverflowTip from '@/routes/components/OverflowTip';
import Image from '@/components/Image';
import colors from '../ProductLabelManage/LabelPreview/colors';

import styles from './index.less';

export const SkuLabels = ({ labels = [] }) => {
  return (
    <div className="sku-labels">
      {labels.map((m) => (
        <OverflowTip
          style={{
            color: colors[m.labelColorCode]?.['label-preview-color'],
            borderColor: colors[m.labelColorCode]?.['label-preview-border-color'],
            backgroundColor: colors[m.labelColorCode]?.['label-preview-background-color'],
          }}
          className="sku-label"
        >
          {m.labelName}
        </OverflowTip>
      ))}
    </div>
  );
};

const LabelRowRender = ({ label, value, vertical, hidden }) => {
  return hidden ? (
    ''
  ) : (
    <div className="sku-info-row" style={{ alignItems: vertical }}>
      <OverflowTip className="sku-row-label">{label}</OverflowTip>
      <div className="sku-row-value">{value || '-'}</div>
    </div>
  );
};

const SkuSales = ({ skuList, skuId }) => {
  // 禁用，当前维度未选中的属性与其他层选中的属性进行判断

  const getSkuIsExit = (skuIds, dim) => {
    if (!skuIds || skuIds.length < 1) return true;
    if (skuIds.includes(skuId)) return false;
    const otherDims = skuList.filter((f) => f.dim !== dim);
    if (otherDims.length < 1) return false;
    return !otherDims.every((f) => {
      const { saleAttr } = f;
      // 每层维度所选中的属性
      const attr = saleAttr?.find((sale) => sale?.skuIds?.includes(skuId));
      return skuIds.some((s) => attr?.skuIds?.includes(s));
    });
  };

  const getSaleAttr = (sales, dim) => {
    return (
      <div className="sku-sales">
        {sales.map((m) => (
          <div
            className={classNames({
              'sku-sale-col': true,
              'sku-sale-col-selected': m.skuIds?.includes(skuId),
              'sku-sale-col-disabled': getSkuIsExit(m.skuIds, dim),
            })}
          >
            {m.imagePath && <Image width={28} height={28} value={m.imagePath} />}
            <span>{m.saleValue}</span>
          </div>
        ))}
      </div>
    );
  };

  return skuList.map((m) => {
    return (
      <LabelRowRender
        label={m.saleName}
        vertical="center"
        value={getSaleAttr(m.saleAttr || [], m.dim)}
      />
    );
  });
};

export default function skuInfo({ outSkuInfo = {}, selfSkuInfo = {} }) {
  const {
    // 外部携带的参数信息
    unitPrice,
    currency,
    unTaxedPrice,
  } = outSkuInfo;
  return (
    <>
      <div className={styles['sku-info-wrapper']}>
        <div className="sku-title-wrap">
          <p className="sku-title">{selfSkuInfo.skuName || '-'}</p>
          {selfSkuInfo.skuTitle && <p className="sku-sub-info">{selfSkuInfo.skuTitle || '-'}</p>}
        </div>
        <div className="sku-sale-info">
          <p className="sku-sale-item" style={{ marginBottom: 10 }}>
            <span className="label">{intl.get('smpc.product.view.price.tax').d('单价(含税)')}</span>
            <span className="content big-price">
              <span style={{ fontSize: 12 }}> {currency}</span>
              <span className="big-price">{unitPrice || '-'}</span>
            </span>
          </p>
          <p className="sku-sale-item">
            <span className="label">
              {intl.get('smpc.product.view.price.noTax').d('单价(不含税')}
            </span>
            <span className="content">{unTaxedPrice || '-'}</span>
          </p>
          <p className="sku-sale-item">
            <span className="label">{intl.get('smpc.product.view.skuLabel').d('商品标签')}</span>
            <span className="content">
              {selfSkuInfo.labels?.length > 0 ? <SkuLabels labels={selfSkuInfo?.labels} /> : '-'}
            </span>
          </p>
          {/* 动态 */}
          {selfSkuInfo.skuList.length > 0 && (
            <p className="sku-sale-item">
              <SkuSales skuId={selfSkuInfo?.skuId} skuList={selfSkuInfo.skuList} />
            </p>
          )}
          <p className="sku-sale-item">
            <span className="label">{intl.get('smpc.product.view.skuCode').d('商品编码')}</span>
            <span className="content">{selfSkuInfo.skuCode || '-'}</span>
          </p>
          <p className="sku-sale-item">
            <span className="label">{intl.get('smpc.product.view.thirdCode').d('第三方编码')}</span>
            <span className="content">{selfSkuInfo.thirdSkuCode || '-'}</span>
          </p>
        </div>
      </div>
    </>
  );
}
