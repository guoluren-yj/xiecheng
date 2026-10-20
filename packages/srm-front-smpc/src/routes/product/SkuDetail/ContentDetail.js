import React, { Fragment } from 'react';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import Anchor from '@/components/Anchor';
import HtmlView from '@/components/HtmlView';
import SkuInfo from './SkuInfo';
import SpuInfo from './SpuInfo';
import PurPrice from './PurPrice';
import SkuAttrs from './SkuAttrs';
import SkuAfs from './SkuAfs';
import SkuThird from './SkuThird';
import openCompare from './openCompare';
import customStore from './customStore';
import GiftRules from './GiftRules';

export default function ContentDetail(props) {
  const {
    isSup,
    spuId,
    spuDs,
    skuId,
    skuDs,
    priceDs,
    loading,
    skuList,
    anchorPre,
    specsData,
    currentSpu,
    showHistory,
    isWorkflowApprove,
    remote,
  } = props;

  const isReceive = customStore.getState('isReceive');

  function handleViewIntro(intro) {
    const title = intl.get('smpc.product.view.title.skuDescription').d('商品描述');

    if (!showHistory) {
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

  function handleViewGiftRule(rules) {
    c7nModal({
      title: intl.get('smpc.product.model.giveRules').d('赠品规则'),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      children: <GiftRules rules={rules} />,
    });
  }

  const getAnchors = (dataIndex = 0) => {
    const { skuList: lastSkuList, keyList: spuKeyList } = currentSpu?.[1] || {};
    const { attrIdList, keyList } =
      (lastSkuList || []).find((f) => String(f.skuId) === String(skuId)) || {};
    const compareProps = { showHistory, isHistory: dataIndex === 1, keyList };
    return [
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_BASE_INFO`,
        title: intl.get('smpc.product.view.baseInfo').d('基本信息'),
        comp: SkuInfo,
        props: {
          isSup,
          spuId,
          dataSet: skuDs[dataIndex],
          skuList,
          primaryImagePath:
            currentSpu?.[dataIndex]?.largePrimaryImagePath ||
            currentSpu?.[dataIndex]?.primaryImagePath,
          onViewIntro: handleViewIntro,
          onViewGiftRule: handleViewGiftRule,
          ...compareProps,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SPU_INFO`,
        title: intl.get('smpc.product.view.title.spuInfo').d('商品组信息'),
        comp: SpuInfo,
        show: showHistory,
        props: {
          isSup,
          dataSet: spuDs[dataIndex],
          currentSpu: currentSpu?.[dataIndex],
          type: 'horizontal',
          ...compareProps,
          keyList: spuKeyList,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.PUR_PRICE`,
        title: intl.get('smpc.product.view.purPrice').d('采购价格'),
        comp: PurPrice,
        props: {
          skuId,
          isSup,
          isHistory: dataIndex === 1,
          dataSet: priceDs[dataIndex],
          remote,
          skuList,
        },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_ATTRS`,
        title: intl.get('smpc.product.view.productAttr').d('商品属性'),
        comp: SkuAttrs,
        props: { skuDs: skuDs[dataIndex], specsData, ...compareProps, attrIdList },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_AFS`,
        title: intl.get('smpc.product.view.afterSaleServices').d('售后服务'),
        comp: SkuAfs,
        // show: !isReceive,
        props: { dataSet: skuDs[dataIndex], ...compareProps },
      },
      {
        anchorKey: `${anchorPre}_DETAIL.SKU_THIRD`,
        title: intl.get('smpc.product.view.thirdInfo').d('第三方信息'),
        comp: SkuThird,
        show: !isReceive,
        props: { dataSet: skuDs[dataIndex], ...compareProps },
      },
    ].filter((f) => f.show || !('show' in f));
  };

  return (
    <Fragment>
      <div className="sku-container">
        <Spin spinning={loading}>
          {showHistory && (
            <div className="sku-current">
              {intl.get('smpc.product.view.currentVersion').d('当前版本')}
            </div>
          )}
          {getAnchors().map((m) => {
            return <m.comp {...m.props} id={m.anchorKey} title={m.title} />;
          })}
        </Spin>
      </div>
      <div className="vertical-line" />
      {showHistory ? (
        <div className="sku-container">
          <div className="sku-history">
            {intl.get('smpc.product.view.historyVersion').d('历史版本')}
          </div>
          {getAnchors(1).map((m) => {
            return <m.comp {...m.props} title={m.title} />;
          })}
        </div>
      ) : (
        <div className="spu-container">
          <SpuInfo isSup={isSup} dataSet={spuDs[0]} currentSpu={currentSpu?.[0]} type="vertical" />
        </div>
      )}
      {!isWorkflowApprove && (
        <Anchor
          list={getAnchors()}
          container={
            !showHistory
              ? document.querySelector(`.${anchorPre}`)?.firstChild
              : document.querySelector(`.${anchorPre}`)?.parentNode
          }
        />
      )}
    </Fragment>
  );
}
