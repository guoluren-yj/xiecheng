import React from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'hzero-ui';

import ExponentComp from './ExponentComp';
import RiskExponentComp from './RiskExponentComp';
import './index.less';

const IndexTabs = (props) => {
  const { searchParams, codeObj, operatList, finalScore } = props;

  // 经营指数 props
  const operatProps = {
    radarData: operatList,
    score: finalScore,
    indicatorsList: [
      {
        title: intl.get('spfm.wideArea.view.title.performanceAbility').d('履约能力'),
        content: intl
          .get('spfm.wideArea.view.title.performanceAbilityInfo')
          .d(
            '履约能力主要包括支付能力和生产能力两方面的内容，审查生产能力时，主要审查对方当事人的生产能力、生产规模、技术水平、产品质量、交货能力等情况，审查履约能力的目的是提高经济合同的真实性和可行性'
          ),
      },
      {
        title: intl.get('spfm.wideArea.view.title.historicalPerformance').d('历史绩效'),
        content: intl
          .get('spfm.wideArea.view.title.historicalPerformanceInfo')
          .d(
            '供应商经营是否稳定，对采购企业合作的时间周期、生产经营周期都有所影响，供应商越稳定风险越低'
          ),
      },
      {
        title: intl.get('spfm.wideArea.view.title.productQuality').d('商品质量'),
        content: intl
          .get('spfm.wideArea.view.title.productQualityInfo')
          .d(
            '产品质量对产品、过程、体系都提出要求，所以供应商能够提供优质的产品，通过历史的履约情况判断质量情况，作为成为供应商非常关键的指标'
          ),
      },
      {
        title: intl.get('spfm.wideArea.view.title.customerStability').d('客户稳定度'),
        content: intl
          .get('spfm.wideArea.view.title.customerStabilityInfo')
          .d(
            '通过供应商历史的交易情况，推断未来合作关系的可持续性，从而对未来合作的稳定性提供了有利的维度'
          ),
      },
      {
        title: intl.get('spfm.wideArea.view.title.commodityStability').d('商品稳定度'),
        content: intl
          .get('spfm.wideArea.view.title.commodityStabilityInfo')
          .d(
            '供应商商品供应是否稳定，对采购企业未来的生产计划影响非常重要，供应商能够稳定的生产出原材料，降低采购方的生产经营风险'
          ),
      },
    ],
  };

  return (
    <>
      <Row>
        <Col className="index-title-col" span={12} style={{ borderRight: '1px solid #EBEBEB' }}>
          {intl.get('spfm.wideArea.view.title.operatingIndex').d('经营指数')}
        </Col>
        <Col className="index-title-col" span={12}>
          {intl.get('spfm.wideArea.view.title.riskControlIndex').d('风控指数')}
        </Col>
      </Row>

      <Row>
        <Col style={{ borderRight: '1px solid #EBEBEB', minHeight: '500px' }} span={12}>
          <ExponentComp {...operatProps} />
        </Col>
        <Col style={{ minHeight: '500px' }} span={12}>
          <RiskExponentComp params={searchParams} codeObj={codeObj} />
        </Col>
      </Row>
    </>
  );
};

export default IndexTabs;
