import React, { useState } from 'react';
import { Icon } from 'choerodon-ui/pro';
import classNames from 'classnames';
import intl from 'utils/intl';
import OverflowTip from '@/routes/components/OverflowTip';
import Image from '@/components/Image';
import c7nModal from '@/utils/c7nModal';
import Detail from '../CustomTemplate/Detail';
import LadderPrice from './LadderPrice';
import colors from '../ProductLabelManage/LabelPreview/colors';
// import openCustom from './openCustom';
import styles from './index.less';

const Count = () => {
  const [num, setNum] = useState(1);
  return (
    <div className="count">
      <span className="num">{num}</span>
      <div className="operator">
        <span className="plus" onClick={() => setNum((n) => n + 1)}>
          <Icon type="expand_less" />
        </span>
        <span className={`minus ${num > 1 ? '' : 'disabled'}`}>
          <Icon
            type="expand_more"
            onClick={() => {
              if (num > 1) {
                setNum((n) => n - 1);
              }
            }}
          />
        </span>
      </div>
    </div>
  );
};

export const SkuLabels = ({ labels = [] }) => {
  return (
    <div className={styles['sku-labels']}>
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

export default function SkuInfo(props) {
  const { data, skuList, isReceive } = props;

  const [ladderPirce, setLadderPrice] = useState({});

  const {
    uomName,
    priceType,
    currencySymbol,
    skuSalesLadders,
    freeShippingFlag,
    platPriceMeaning,
    agreementPriceMeaning,
    agreementTaxedPriceMeaning: taxPrice,
  } = data?.skuPreviewInfoDTO || {};

  const isLadder = priceType === 'LADDER_PRICE';

  const unitPrice = isLadder ? ladderPirce?.unitPriceMeaning : agreementPriceMeaning;

  const priceRender = !isLadder ? (
    <div className="sku-price">
      <span className="sku-sale-price">
        {currencySymbol && <span className="symbol">{currencySymbol}</span>}
        {taxPrice || '-'}
        {uomName && <span className="uom">/{uomName}</span>}
      </span>
      <span className="sku-market-price">
        {platPriceMeaning && currencySymbol && <span className="symbol">{currencySymbol}</span>}
        {platPriceMeaning}
      </span>
    </div>
  ) : (
    <LadderPrice
      uomName={uomName}
      currencySymbol={currencySymbol}
      skuSalesLadders={skuSalesLadders || []}
      onChangePrice={(ladder) => setLadderPrice(ladder)}
    />
  );

  function handleViewCustomAttr(list) {
    const title = intl.get('smpc.product.view.customInfo').d('定制品信息');
    c7nModal({
      title,
      style: { width: 1090 },
      okCancel: false,
      okProps: { style: { background: '#f56349', color: '#fff', borderColor: '#f56349' } },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <Detail isMall readOnly data={list} entrance="spu" />,
    });
  }

  return (
    <div className="sku-info-wrapper">
      <div className="sku-header">
        <div className="sku-supplier-name">
          {/* {data?.supplierCompanyName && (
            <OverflowTip className="sku-supplier">{data?.supplierCompanyName}</OverflowTip>
          )} */}
          {data?.skuName}
        </div>
        {data?.skuTitle && <div className="sku-subtitle">{data?.skuTitle}</div>}
      </div>
      <LabelRowRender
        label={
          isLadder ? (
            <>
              {intl.get('smpc.product.model.ladderPrice').d('阶梯价格')}
              <div>({intl.get('smpc.product.view.includeTax').d('含税')})</div>
            </>
          ) : (
            intl.get('smpc.product.view.includeTaxPrice').d('含税单价')
          )
        }
        vertical="center"
        value={priceRender}
      />
      <LabelRowRender
        label={intl.get('smpc.product.view.noTaxPrice').d('未税单价')}
        vertical="center"
        value={
          <span style={{ color: '#000', fontSize: '14px', fontWeight: 600 }}>
            {currencySymbol && <span>{currencySymbol}</span>}
            {unitPrice || '-'}
          </span>
        }
      />
      <LabelRowRender
        label={intl.get('smpc.product.view.skuLabel').d('商品标签')}
        vertical="center"
        value={data?.labels && data?.labels?.length > 0 ? <SkuLabels labels={data?.labels} /> : '-'}
      />
      <LabelRowRender
        label={intl.get('smpc.product.view.receiveInfo').d('收货信息')}
        hidden={isReceive}
        value={
          <div className="receive-info">
            <span className="receive-name">
              {intl.get('smpc.product.view.reveiveDemoName').d('张三')}
            </span>
            <OverflowTip className="receive-address">
              {intl
                .get('smpc.product.view.reveiveDemoAddress')
                .d('上海市青浦区重固镇汇联路33号 201700')}
            </OverflowTip>
            {/* <span className="receive-tel">176****5919</span> */}
            <span className="receive-update">
              {intl.get('hzero.common.button.update').d('修改')}
            </span>
          </div>
        }
      />
      {/* <LabelRowRender
        hidden={isReceive}
        label={intl.get('smpc.product.view.arrivalTime').d('到货时间')}
        value={intl
          .get('smpc.product.view.arrivalTime.example')
          .d('最快到货时间30天，现在可以下单')}
      /> */}
      {skuList.length > 0 && <SkuSales skuId={data?.skuId} skuList={skuList} />}
      <LabelRowRender
        hidden={isReceive}
        label={intl.get('smpc.product.model.freightRule').d('运费规则')}
        value={freeShippingFlag ? intl.get('smpc.product.view.freeShipping').d('包邮') : '-'}
      />
      {data?.spuCustomAttrGroupList && data?.spuCustomAttrGroupList?.length > 0 && (
        <LabelRowRender
          label={intl.get('smpc.product.view.specCustom').d('规格定制')}
          value={
            <a
              style={{ color: '#F56349' }}
              onClick={() => handleViewCustomAttr(data?.spuCustomAttrGroupList)}
            >
              {intl.get('hzero.common.button.look').d('查看')}
            </a>
          }
        />
      )}
      <div className="sku-footer">
        <Count />
        <div className="add-cart-btn">
          {intl.get('smpc.product.view.button.addCart').d('加入购物车')}
        </div>
        <div className="buy-now-btn">
          {intl.get('smpc.product.view.button.buyNow').d('立即购买')}
        </div>
      </div>
    </div>
  );
}
