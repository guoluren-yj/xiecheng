import React from 'react';
import intl from 'utils/intl';
import { getAttachmentUrl } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import OverflowTip from '@/components/OverflowTip';
import Image from '@/components/Image';
// import LadderPrice from './LadderPrice';

const LabelRowRender = ({ label, value, vertical }) => {
  return (
    <div className="sku-info-row" style={{ alignItems: vertical }}>
      <OverflowTip className="sku-row-label">{label}</OverflowTip>
      <div className="sku-row-value">{value || '-'}</div>
    </div>
  );
};

export default function SkuInfo(props) {
  const { data } = props;

  const { logoUrl, companyName, website, industryList, industryCategoryList, description } =
    data?.companyInfosVO || {};

  const priceRender = (
    <div className="sku-price">
      <span className="sku-sale-price">{data?.proposedPrice || '-'}</span>
    </div>
  );

  const itemRender = ({ label, value, list, dispayField }) => {
    const val =
      value || (list && list.length > 0 ? list.map((m) => m[dispayField]).join('、') : '-');
    return (
      <div className="selection-item">
        <span className="selection-label">{label}：</span>
        <OverflowTip className="selection-value">{val}</OverflowTip>
      </div>
    );
  };

  return (
    <div className="sku-info-wrapper">
      <div className="sku-header">
        <div className="sku-supplier-name">
          {/* {data?.supplierName && (
            <OverflowTip className="sku-supplier">{data?.supplierName}</OverflowTip>
          )} */}
          {data?.skuName}
        </div>
        {data?.skuSubtitle && <div className="sku-subtitle">{data?.skuSubtitle}</div>}
      </div>
      <LabelRowRender
        label={intl.get('smpc.product.view.proposedPrice').d('参考价格')}
        vertical="center"
        value={priceRender}
      />
      <div className="sku-selection-supplier">
        <div className="selection-header">
          {intl.get('smkt.selection.view.title.selectionSupplier').d('甄选供应商')}
        </div>
        <div className="selection-body">
          <div className="selection-content">
            <Image
              value={getAttachmentUrl(logoUrl, PRIVATE_BUCKET)}
              // style={{ borderRadius: '50%' }}
              width={70}
              height={70}
            />
            <div className="selection-content-others">
              <div className="selection-company">{companyName}</div>
              <div className="selection-list">
                <div className="selection-line">
                  {itemRender({
                    label: intl.get('smkt.selection.view.industryType').d('行业类型'),
                    list: industryList,
                    dispayField: 'industryName',
                  })}
                  {itemRender({
                    label: intl.get('smkt.selection.view.majorCategory').d('主营品类'),
                    list: industryCategoryList,
                    dispayField: 'categoryName',
                  })}
                </div>
                {itemRender({
                  label: intl.get('smkt.selection.view.website').d('公司官网'),
                  value: website,
                })}
              </div>
            </div>
          </div>
          <div className="selection-desc">
            <div className="selection-desc-title">
              {intl.get('smkt.selection.view.title.companyDescÎ').d('公司简介')}
            </div>
            <p>{description || '-'}</p>
          </div>
        </div>
      </div>
      <div className="sku-footer">
        <div className="add-cart-btn">{intl.get('smpc.product.view.button.iWant').d('我想要')}</div>
        <div className="sku-adver">
          <span>{intl.get('smpc.product.view.advertisement').d('广告')}</span>
          {intl.get('smpc.product.view.plsSupplierMsg').d('请联系供应商合作吧～')}
        </div>
      </div>
    </div>
  );
}
