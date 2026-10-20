import React from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

export const RFTypeList = () => [
  {
    value: 'RF',
    meaning: `${intl.get('ssrc.supplierQuotation.view.message.title.RFI').d('征询书')}(RFI/RFP)`,
  },
  {
    value: 'RFX',
    meaning: `${intl.get('ssrc.supplierQuotation.view.message.title.RFQ').d('询价单')}(RFQ)`,
  },
];

export const searchTypes = () => [
  {
    value: 'order',
    meaning: `${intl.get('ssrc.supplierQuotation.view.message.title.allOrder').d('整单')}`,
  },
  {
    value: 'detail',
    meaning: `${intl.get(`ssrc.inquiryHall.view.message.title.rfDetail`).d('明细')}`,
  },
];

export const RFTypeStatus = () => [
  {
    value: 'pending',
    meaning: `${intl.get('ssrc.inquiryHall.model.inquiryHall.noParticipation').d('未参与')}`,
    parentKey: 'RF',
  },
  {
    value: 'participatory',
    meaning: `${intl.get('ssrc.inquiryHall.button.onGoing').d('进行中')}`,
    parentKey: 'RF',
  },
  {
    value: 'completed',
    meaning: `${intl.get('hzero.common.component.excelExport.hd.m.hd.state.done').d('已结束')}`,
    parentKey: 'RF',
  },
  {
    value: 'all',
    meaning: `${intl.get('ssrc.inquiryHall.button.all').d('全部')}`,
    parentKey: 'RF',
  },
  {
    value: 'notParticipate',
    meaning: `${intl.get('ssrc.inquiryHall.model.inquiryHall.noParticipation').d('未参与')}`,
    parentKey: 'RFX',
  },
  {
    value: 'onGoing',
    meaning: `${intl.get('ssrc.inquiryHall.button.onGoing').d('进行中')}`,
    parentKey: 'RFX',
  },
  {
    value: 'finished',
    meaning: `${intl.get('hzero.common.component.excelExport.hd.m.hd.state.done').d('已结束')}`,
    parentKey: 'RFX',
  },
  {
    value: 'rfxAll',
    meaning: `${intl.get('ssrc.inquiryHall.button.all').d('全部')}`,
    parentKey: 'RFX',
  },
];

/**
 * status tag render
 *
 * SSRC.RFX_DISPLAY_QUOTATION_STATUS
 * SSRC.NEW_BID_STATUS
 * SSRC.RF_DISPLAY_QUOTATION_STATUS
 *
 * 未参与 orange
  已放弃 gray
  未开始 orange
  待回复 orange
  已回复 green
  征询截止 red
  待确定供应商 orange
  已入围 green
  未入围 gray
  关闭 gray

  未参与 orange
  已放弃 gray
  未提交资格预审 orange
  预审退回 orange
  预审审批中 orange
  预审未通过 red
  报价未开始 orange
  未报价 orange
  已报价 green
  已还价 green
  报价截止 red
  议价中 orange
  议价已回复 green
  待核价 orange
  已淘汰 gray
  已中标 green
  未中标 gray
  暂停 orange
  关闭 gray

  NOT_PARTICIPATED	未参与
  ABANDONED	已放弃
  NOT_START	未开始
  REPLY_PENDING	待回复
  REPLIED	已回复
  SHORTLISTED	已入围
  UN_SHORTLISTED	未入围
  CHECK_PENDING	待确定供应商
  CLOSED	关闭
  QUOTED_END	征询截止
*/

export const renderStatusTag = (data) => {
  const { status = null, statusMeaning = '', defineColor = null } = data || {};

  if (!status && !statusMeaning) {
    return '-';
  }

  const orange = 'orange';
  const red = 'red';
  const green = 'green';
  const gray = 'gray';

  let color = null;

  const originStatus = {
    NOT_PARTICIPATED: gray,
    NOT_BIDDING: red,
    QUOTED_END: red,
    BIDDING_END: red,
    OBSOLETE: gray,
    NOT_BIDDED: gray,
    CLOSED: gray,
    ABANDONED: gray,
    UN_SHORTLISTED: gray,
    QUOTED: green,
    BARGAINED: green,
    BIDDED: green,
    REPLIED: green,
    SHORTLISTED: green,
    SUBMITTED: green,
  };

  color = defineColor || originStatus[status] || orange;

  return (
    <Tag color={color} border={false}>
      {statusMeaning || '-'}
    </Tag>
  );
};
