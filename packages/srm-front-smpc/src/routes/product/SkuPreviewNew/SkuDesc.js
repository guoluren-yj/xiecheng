import React from 'react';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import OverflowTip from '@/routes/components/OverflowTip';
import HtmlView from '@/components/HtmlView';

const { TabPane } = Tabs;

export default function SkuDesc(props) {
  const { introduction, specAttrList = [], inferenceList = [] } = props;

  return (
    <div className="sku-desc-wrapper">
      <Tabs customizedCode="sku.detail.info">
        <TabPane tab={intl.get('smpc.product.model.productIntro').d('商品介绍')} key="intro">
          {introduction ? (
            <HtmlView name="sku-preview-intro" className="sku-introduction" _html={introduction} />
          ) : (
            <div className="sku-no-data">{intl.get(`smpc.product.model.noData`).d('暂无数据')}</div>
          )}
        </TabPane>
        <TabPane tab={intl.get('smpc.product.model.inferenceIntro').d('参考信息')} key="inference">
          <div className="sku-attrs">
            {inferenceList.map((item) => {
              const { label, value, getValue } = item;
              return (
                <div className="spec-col">
                  <OverflowTip className="spec-label">{label}</OverflowTip>
                  <OverflowTip className="spec-value">
                    {(getValue ? getValue() : value) || '-'}
                  </OverflowTip>
                </div>
              );
            })}
          </div>
        </TabPane>
        <TabPane tab={intl.get(`smpc.product.model.specifications`).d('规格参数')} key="attrs">
          {specAttrList.length > 0 ? (
            <div className="sku-attrs">
              {specAttrList.map((item) => {
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
        </TabPane>
      </Tabs>
    </div>
  );
}
