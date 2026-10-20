import React, { useState, useEffect } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import OverflowTip from '@/components/OverflowTip';

export default function SkuDesc(props) {
  const { skuDetail, attributes } = props;
  const cssurl = skuDetail?.match(/cssurl='(\S*)'>/)?.[1];
  const [cssData, setCssData] = useState('');
  useEffect(() => {
    if (cssurl) {
      fetch(`${window.location.protocol}${cssurl}`)
        .then((res) => res.text())
        .then((res) => setCssData(res));
    }
  }, [cssurl]);
  return (
    <div className="sku-desc-wrapper">
      <Tabs>
        <Tabs.TabPane tab={intl.get('smpc.product.model.productIntro').d('商品介绍')} key="intro">
          {skuDetail ? (
            <div
              className="sku-introduction"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: cssurl ? `<style>${cssData}</style><br>${skuDetail}` : skuDetail,
              }}
            />
          ) : (
            <div className="sku-no-data">{intl.get(`smpc.product.model.noData`).d('暂无数据')}</div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.get(`smpc.product.model.specifications`).d('规格参数')} key="attrs">
          {attributes && attributes.length > 0 ? (
            <div className="sku-attrs">
              {attributes.map((item) => {
                const { attrName, attrValue } = item;
                return (
                  <div className="spec-col">
                    <OverflowTip className="spec-label">{attrName}</OverflowTip>
                    <OverflowTip className="spec-value">{attrValue}</OverflowTip>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="sku-no-data">{intl.get(`smpc.product.model.noData`).d('暂无数据')}</div>
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
