import React from 'react';
import { compose } from 'lodash';

import remote from 'hzero-front/lib/utils/remote';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import Page from './Page';
import { StoreProvider } from './store/index';

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_INFO_RFI`, // 发布准备-基础信息
      `SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_ORG_RFI`, // 发布准备-采购组织及人员
      `SSRC.INQUIRY_HALL_RF_DETAIL.MEMBER_RFI`, // 发布准备-寻源小组
      `SSRC.INQUIRY_HALL_RF_DETAIL.LINE_ITEM_RFI`, // 发布准备-物料行
      `SSRC.INQUIRY_HALL_RF_DETAIL.INVITE_RANGE_RFI`, // 发布准备-邀请范围
      `SSRC.INQUIRY_HALL_RF_DETAIL.LINE_SUPPLIER_RFI`, // 发布准备-供应商行
      `SSRC.INQUIRY_HALL_RF_DETAIL.NOTICES_RFI`, // 发布准备-公告
      `SSRC.INQUIRY_HALL_RF_DETAIL.FORM_RFI`, // 发布准备-征询内容
      `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_NODE_RFI`, // 发布准备-流程节点配置
      `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_STAGE_RFI`, // 发布准备-征询阶段
      `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_EXPERT_RFI`, // 发布准备-专家配置
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_EXPERTS_RFI`, // 发布准备-专家小组
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_CONFIG_RFI`, // 发布准备-参考模板
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_TECH_RFI`, // 发布准备-评分要素-技术
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_BUSI_RFI`, // 发布准备-评分要素-商务
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_RFI`, // 发布准备-评分要素-商务技术
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_ASSIGN_RFI`, // 发布准备-专家分配
      `SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_RF_INFO_RFI`, // 确定入围供应商-基础信息
      `SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_SUPPLIER_QUO_RFI`, // 确定入围供应商-供应商
      `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_RF_INFO_RFI`, // 征询中-基本信息
      `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_SUPPLIER_RFI`, // 征询中-供应商响应情况
      `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_HEADER_INFO_RFI`, // 评分中-基础信息
      `SSRC.INQUIRY_HALL_RF_DETAIL.RFI_ATTACHMENT`, // 确定入围供应商-查看附件
      'SSRC.INQUIRY_HALL_RF_DETAIL.CREATE_RFI_ATTACHMENT', // 发布准备-查看附件
      'SSRC.INQUIRY_HALL_RF_DETAIL.RFI_QUOTATION_LINE', // 确定入围供应商-报价明细
      'SSRC.INQUIRY_HALL_RF_DETAIL.RFI_STEP_IN_QUOTATION_LINE', // 征询中-报价明细
      'SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_BUTTON_RFI', // 头部按钮组
      'SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_DETAIL_HEADER_RFI', // 评分明细头
    ],
  }),
  formatterCollections({
    code: [
      [
        'ssrc.rfDetail',
        'ssrc.rfCheck',
        'ssrc.common',
        'ssrc.rf',
        'ssrc.priceLibraryNew',
        'ssrc.supplierQuotation',
        'ssrc.bidHall',
        'ssrc.inquiryHall',
        'ssrc.expertScoring',
        'component.docFlow',
        'ssrc.rfTemplate',
      ],
    ],
  })
)(
  remote(
    {
      code: 'SSRC_INQUIRY_DETAIL_RF',
      name: 'remote',
    },
    {
      events: {
        onLoad() {},
      },
    }
  )(Index)
);
