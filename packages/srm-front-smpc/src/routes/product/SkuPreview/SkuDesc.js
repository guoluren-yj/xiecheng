import React from 'react';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import OverflowTip from '@/routes/components/OverflowTip';
import HtmlView from '@/components/HtmlView';

export default function SkuDesc(props) {
  const { introduction, attrList = [] } = props;

  return (
    <div className="sku-desc-wrapper">
      <Tabs>
        <Tabs.TabPane tab={intl.get('smpc.product.model.productIntro').d('商品介绍')} key="intro">
          {introduction ? (
            <HtmlView name="sku-preview-intro" className="sku-introduction" _html={introduction} />
          ) : (
            <div className="sku-no-data">{intl.get(`smpc.product.model.noData`).d('暂无数据')}</div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.get(`smpc.product.model.specifications`).d('规格参数')} key="attrs">
          {attrList.length > 0 ? (
            <div className="sku-attrs">
              {attrList.map((item) => {
                const { attributeName, attrValueName, description, attrName, attrValue } = item;
                return (
                  <div className="spec-col">
                    <OverflowTip className="spec-label">{attributeName || attrName}</OverflowTip>
                    <OverflowTip className="spec-value">
                      {attrValueName || attrValue || description}
                    </OverflowTip>
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
