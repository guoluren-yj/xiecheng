import React from 'react';

import OverflowTip from '@/routes/components/OverflowTip';
import intl from 'utils/intl';

const LabelText = ({ label, value, hidden }) => {
  return hidden ? (
    ''
  ) : (
    <div className="reference-line">
      <span className="reference-line-label">{label}：</span>
      <OverflowTip className="reference-info-line">
        <span className="reference-line-value">{value || '-'}</span>
      </OverflowTip>
    </div>
  );
};

export default function ReferenceInfo(props) {
  const { data, attrList = [], priceInfo = {}, isReceive, tabKey } = props;
  const { attrValueName, description } = attrList.find((f) => f.attrCode === '000000000001') || {};

  const {
    changeSpecial = 0,
    afterSaleSpecial = 0,
    returnSpecial = 0,
    instruction = '',
    returnDuration = '',
    changeDuration = '',
    qualityDuration = '',
    // 电商推品售后信息
    changeDesc = '',
    returnDesc = '',
    qualityDesc = '',
  } = data?.afterSale || {};

  const getReturnDesc = () => {
    if (returnDesc) return returnDesc;
    else {
      return returnSpecial === 2
        ? intl.get('smpc.product.view.noLimitRefunds').d('该商品支持不限次数退货')
        : returnSpecial === 1
        ? intl.get('smpc.product.view.noRefunds').d('特殊商品，一经签收不予退货')
        : returnSpecial === 0 && returnDuration
        ? intl
            .get('smpc.product.view.returnDuration', { name: returnDuration })
            .d(`确认收货后${returnDuration}日内出现质量问题可申请退货`)
        : '-';
    }
  };
  const getChangeDesc = () => {
    if (changeDesc) return changeDesc;
    else {
      return changeSpecial === 2
        ? intl.get('smpc.product.view.noLimitExchange').d('该商品支持不限次数换货')
        : changeSpecial === 1
        ? intl.get('smpc.product.view.noExchange').d('特殊商品，一经签收不予换货')
        : changeSpecial === 0 && changeDuration
        ? intl
            .get('smpc.product.view.changeDuration', { name: changeDuration })
            .d(`确认收货后${changeDuration}日内出现质量问题可申请换货`)
        : '-';
    }
  };
  const getQualityDesc = () => {
    if (qualityDesc) return qualityDesc;
    if (tabKey === 'CATA') {
      return data?.guarantee; // 价格 || 商品售后质保 后端处理
    } else {
      return qualityDuration
        ? intl
            .get('smpc.product.view.qualityDuration', { name: qualityDuration })
            .d(`质保限期${qualityDuration}个月`)
        : '-';
    }
  };
  return (
    <div className="reference-info-wrapper">
      <div className="reference-info-title text-overflow">
        {intl.get('smpc.product.view.title.skuReferenceInfo').d('商品参考信息')}
      </div>
      <div className="reference-info-body">
        {/* <div className="his-price-wrapper">
          <OverflowTip className="his-price-btn">
            {intl.get('smpc.product.view.button.hisOffer').d('历史报价')}
          </OverflowTip>
          <OverflowTip className="his-price-btn">
            {intl.get('smpc.product.view.button.hisFinalPrice').d('历史成交价')}
          </OverflowTip>
        </div> */}
        <div className="reference-info-row">
          <LabelText
            label={intl.get('smpc.product.view.skuCode').d('商品编码')}
            value={data?.skuCode}
          />
          {!isReceive && (
            <LabelText
              label={intl.get('smpc.product.view.thirdCode').d('第三方编码')}
              value={data?.thirdSkuCode}
            />
          )}
          <LabelText
            label={intl.get('smpc.product.view.brand').d('品牌')}
            value={attrValueName || description || data?.brandName}
          />
          <LabelText
            label={intl.get('smpc.product.view.supplier').d('供应商')}
            value={data?.supplierCompanyName}
          />
        </div>

        <div className="reference-info-row" hidden={isReceive}>
          <LabelText
            label={intl.get('smpc.product.model.itemCode').d('物料编码')}
            value={data?.itemCode}
          />
          <LabelText
            label={intl.get('smpc.product.model.itemName').d('物料名称')}
            value={data?.itemName}
          />
          <LabelText
            label={intl.get('smpc.product.model.itemUom').d('物料单位')}
            value={data?.itemUomName}
          />
          <LabelText
            label={intl.get('smpc.product.model.itemCategoryCode').d('品类编码')}
            value={data?.itemCategoryCode}
          />
          <LabelText
            label={intl.get('smpc.product.model.itemCategoryName').d('品类名称')}
            value={data?.itemCategoryName}
          />
          <LabelText
            label={intl.get('smpc.product.view.supplyCycle').d('供货周期')}
            value={
              priceInfo?.deliveryDay
                ? `${priceInfo?.deliveryDay}${intl.get('smpc.product.view.day').d('天')}`
                : '-'
            }
          />
        </div>
        <div className="reference-info-row" hidden={isReceive}>
          <LabelText
            label={intl.get('smpc.product.view.refundsInfo').d('退货信息')}
            value={getReturnDesc()}
          />
          <LabelText
            label={intl.get('smpc.product.view.exchangeInfo').d('换货信息')}
            value={getChangeDesc()}
          />
          <LabelText
            label={intl.get('smpc.product.view.warrantyInfo').d('质保信息')}
            value={getQualityDesc() || '-'}
          />
          <LabelText
            label={intl.get('smpc.product.view.specialAfs').d('特殊售后说明')}
            value={afterSaleSpecial ? instruction : '-'}
          />
          <LabelText
            label={intl.get('smpc.product.view.deliveryMethod').d('配送方式')}
            value={data?.deliveryTypeMeaning}
          />
        </div>
      </div>
    </div>
  );
}
