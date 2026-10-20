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
      `SSRC.INQUIRY_HALL.RF_EDIT.HEADER_BUTTONS_RFI`, // 头部按钮组
      `SSRC.INQUIRY_HALL.RF_EDIT.HEADER_RFI`, // 基础信息
      `SSRC.INQUIRY_HALL.RF_EDIT.ORGANIZATION_RFI`, // 采购组织及人员
      `SSRC.INQUIRY_HALL.RF_EDIT.MEMBER_RFI`, // 寻源小组
      `SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_RFI`, // 物料行
      `SSRC.INQUIRY_HALL.RF_EDIT.INVITE_RANGE_RFI`, // 邀请范围
      `SSRC.INQUIRY_HALL.RF_EDIT.LINE_SUPPLIER_RFI`, // 供应商行
      `SSRC.INQUIRY_HALL.RF_EDIT.NOTICES_RFI`, // 公告
      `SSRC.INQUIRY_HALL.RF_EDIT.FORM_RFI`, // 征询内容
      `SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_RFI`, // 流程节点配置
      `SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_STAGE_RFI`, // 征询阶段
      `SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_EXPERT_RFI`, // 专家配置
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_RULE_RFI`, // 评分规则
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_EXPERTS_RFI`, // 专家小组
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_CONFIG_RFI`, // 参考模板
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_TECH_RFI`, // 评分要素（技术组）
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_BUSI_RFI`, // 评分要素（商务组）
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_RFI`, // 评分要素（商务技术组）
      `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_ASSIGN_RFI`, // 评分要素 分配专家
      `SSRC.INQUIRY_HALL.RF_EDIT.FORM_CARD_RFI`, // 内容卡片
      `SSRC.INQUIRY_HALL.RF_EDIT.RFI_ATTACHMENT`, // 上传附件
      `SSRC.INQUIRY_HALL.RF_EDIT.INVITE_HEADER_BUTTONS_RFI`, // 邀请范围表格按钮
      `SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_HEADER_BUTTONS_RFI`, // RFI标的物-表格按钮
    ],
  }),
  formatterCollections({
    code: ['ssrc.rf', 'ssrc.common', 'ssrc.inquiryHall', 'hzero.c7nProUI', 'ssrc.rfTemplate'],
  }),
  remote(
    {
      code: 'SSRC_INQUIRY_UPDATE_RF',
      name: 'remote',
    },
    {
      events: {
        // 批量添加供应商确定前置置埋点
        async remoteHandleOkSupplier() {
          return true;
        },
      },
    }
  )
)(Index);
