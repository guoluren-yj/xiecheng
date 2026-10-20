import React, { Fragment } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';

import c7nModal from '@/utils/c7nModal';
import HtmlView from '@/components/HtmlView';
import SkuAFBasic from './SkuAFBasic';
import BaseInfo, { ItemInfo } from './BaseInfo';
import PriceInfo from './PriceInfo';
import SkuAttrs from './SkuAttrs';
import openCompare from '../openCompare';

export default function ContentDetail(props) {
  const {
    isSup,
    spuId,
    spuDs,
    skuId,
    skuDs,
    priceDs,
    loading,
    // skuList,
    anchorPre,
    specsData,
    currentSpu,
    changeFlag,
    onlyShowUpdateItem,
    skuTemporaryId,
    hiddenHeaderBtn,
  } = props;

  function handleViewIntro(intro) {
    const title = intl.get('smpc.product.view.title.skuDescription').d('商品描述');

    if (!changeFlag) {
      c7nModal({
        title,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        style: { width: 742 },
        children: <HtmlView _html={intro} name="sku-detail-intro" />,
      });
    } else {
      const childs = skuDs.map((m) => {
        const _intro = m.current?.get('introduction') || '-';
        return <HtmlView _html={_intro} name="sku-detail-intro" />;
      });
      openCompare({
        title,
        childs,
      });
    }
  }

  const getContents = (dataIndex = 0) => {
    // eslint-disable-next-line no-unused-vars
    const { skuList: lastSkuList, keyList: spuKeyList } = currentSpu?.[1] || {};
    const { attrIdList, keyList } =
      (lastSkuList || []).find((f) => String(f.skuId) === String(skuId)) || {};
    const compareProps = { keyList, spuKeyList, changeFlag };
    return [
      {
        comp: SkuAFBasic,
        props: {
          dataSet: skuDs[dataIndex],
          isSup,
          skuTemporaryId,
          skuId,
          changeFlag,
          hiddenHeaderBtn,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_BASE_INFO`,
        title: intl.get('smpc.product.view.baseInfo1').d('基础信息'),
        comp: BaseInfo,
        props: {
          spuId,
          skuDataSets: skuDs,
          spuDataSets: spuDs,
          primaryImagePath:
            currentSpu?.[dataIndex]?.largePrimaryImagePath ||
            currentSpu?.[dataIndex]?.primaryImagePath,
          onViewIntro: handleViewIntro,
          ...compareProps,
          // keyList: keyList.concat(spuKeyList),
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.PUR_PRICE`,
        title: intl.get('smpc.product.model.priceInfo').d('价格信息'),
        comp: PriceInfo,
        show:
          !onlyShowUpdateItem ||
          priceDs[0].some((r) => ['NEW', 'CHANGE'].includes(r.get('approveChangeType'))),
        props: {
          skuId,
          isSup,
          isHistory: dataIndex === 1,
          dataSet: priceDs[dataIndex],
          changeFlag,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_ATTRS`,
        title: intl.get('smpc.product.view.productAttr').d('商品属性'),
        comp: SkuAttrs,
        props: { skuDataSets: skuDs, specsData, ...compareProps, attrIdList },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_AFS`,
        title: intl.get('smpc.product.model.itemInfo').d('物料信息'),
        comp: ItemInfo,
        props: { dataSet: skuDs[dataIndex], ...compareProps },
        show: !onlyShowUpdateItem,
      },
    ].filter((f) => f.show || !('show' in f));
  };

  return (
    <Fragment>
      <div className="sku-container">
        <Spin spinning={loading}>
          {!!changeFlag && (
            <div className="sku-update-tip">
              <Alert
                type="info"
                message={intl
                  .get('smpc.product.view.tip.skuUpdateTip')
                  .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
                closable
                showIcon
              />
            </div>
          )}
          {getContents(0).map((m) => {
            return (
              <div id={m.anchorKey}>
                <m.comp {...m.props} id={m.anchorKey} title={m.title} />
              </div>
            );
          })}
        </Spin>
      </div>
    </Fragment>
  );
}
