import React, { Fragment } from 'react';

import intl from 'utils/intl';
import BaseInfo from './BaseInfo';
import ItemInfo from './ItemInfo';
import PriceInfo from './PriceInfo';
import SkuAttrs from './SkuAttrs';

export default function ContentDetail(props) {
  const { sku } = props;
  const anchorPre = 'PUR';

  const getContents = () => {
    const commonProps = {
      sku,
    };
    return [
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_BASE_INFO`,
        title: intl.get('smpc.product.view.baseInfo1').d('基础信息'),
        comp: BaseInfo,
        props: {
          ...commonProps,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.PUR_PRICE`,
        title: intl.get('smpc.product.model.priceInfo').d('价格信息'),
        comp: PriceInfo,
        props: {
          ...commonProps,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_ATTRS`,
        title: intl.get('smpc.product.view.productAttr').d('商品属性'),
        comp: SkuAttrs,
        props: {
          ...commonProps,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_AFS`,
        title: intl.get('smpc.product.model.itemInfo').d('物料信息'),
        comp: ItemInfo,
        props: {
          ...commonProps,
        },
      },
    ].filter((f) => f.show || !('show' in f));
  };

  return (
    <Fragment>
      <div className="sku-container">
        {getContents(0).map((m) => {
          return (
            <div id={m.anchorKey} key={m.anchorKey}>
              <m.comp {...m.props} id={m.anchorKey} title={m.title} />
            </div>
          );
        })}
      </div>
    </Fragment>
  );
}
