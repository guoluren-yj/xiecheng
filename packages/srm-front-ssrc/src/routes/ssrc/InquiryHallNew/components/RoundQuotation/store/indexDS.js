import React from 'react';
import intl from 'utils/intl';
import moment from 'moment';
import { SRM_SSRC } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

import { BID, getQuotationName } from '@/utils/globalVariable';
import { abandonRemarkRender, supplierQuotaitonAbandanRenderStatus } from '@/utils/renderer';

import '../index.less';

const organizationId = getCurrentOrganizationId();

// 是否是新竞价大厅
const isNewBiddingFlag = (payload = {}) => {
  // const { biddingHallFlag } = this.state;
  const { sourceCategory, biddingFlag } = payload || {};
  const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
  return newBiddingFlag;
};

/**
 * status render 方法
 * @param {*} record
 * @param {*} param1
 * @returns
 */
const statusRender = (record, { lineRecord, sourceKey }) => {
  const curRecord = record;
  const {
    quotedCount,
    feedbackStatusMeaning,
    feedbackStatus,
    supplierStatus,
    supplierStatusMeaning,
    supBiddingStatusMeaning, // 供应商竞价状态(竞价大厅专用字段-未开始时区分签到、试竞价，竞价开始后与其他状态一样
    assignItemCountConcatQuotedCount,
  } = curRecord?.get([
    'quotedCount',
    'feedbackStatusMeaning',
    'feedbackStatus',
    'supplierStatus',
    'supplierStatusMeaning',
    'supBiddingStatusMeaning',
    'assignItemCountConcatQuotedCount',
  ]);
  // 明细行record
  const {
    bargainStatus,
    bargainEndDate,
    sourceCategory,
    biddingFlag,
    rfxStatus,
    biddingTarget,
  } = lineRecord?.get([
    'bargainStatus',
    'bargainEndDate',
    'sourceCategory',
    'biddingFlag',
    'rfxStatus',
    'biddingTarget',
  ]);
  const barginFlag =
    (bargainStatus === 'BARGAINING_ONLINE' || bargainStatus === 'BARGAINING_OFFLINE') &&
    moment().isBefore(bargainEndDate);

  const bidFlag = sourceKey === BID;
  const quotationName = getQuotationName(bidFlag);

  // 竞价大厅-竞价单标识
  const newBiddingFlag = isNewBiddingFlag({ sourceCategory, biddingFlag });

  const supBiddingStatusFlag =
    newBiddingFlag &&
    (rfxStatus === 'NOT_START' ||
      ((rfxStatus === 'IN_QUOTATION' || rfxStatus === 'LACK_QUOTED') &&
        biddingTarget === 'TOTAL_PRICE'));

  if (supBiddingStatusFlag) {
    return supBiddingStatusMeaning;
  }
  let countNum = assignItemCountConcatQuotedCount ?? quotedCount;
  countNum = countNum ?? '-';

  const bargin = (
    <div className="qutationLine">
      {`${intl.get('ssrc.inquiryHall.model.inquiryHall.reply').d('回复')} ${countNum} ${intl
        .get('ssrc.inquiryHall.model.inquiryHall.line')
        .d('行')}`}
    </div>
  );

  const ABANDONED_STATUS = abandonRemarkRender({ val: feedbackStatusMeaning, record: curRecord });

  const NO_ABANDONED_STATUS = (
    <div className="qutationLine">
      {supplierStatus === 'ABANDONED' || supplierStatus === 'QUOTATION_ABANDONED'
        ? supplierQuotaitonAbandanRenderStatus({
            val: supplierStatusMeaning,
            record: curRecord,
          })
        : `${quotationName} ${countNum} ${intl
            .get('ssrc.inquiryHall.model.inquiryHall.line')
            .d('行')}`}
    </div>
  );

  return barginFlag
    ? bargin
    : feedbackStatus === 'ABANDONED'
    ? ABANDONED_STATUS
    : NO_ABANDONED_STATUS;
};

export const indexDS = () => ({
  // primaryKey: '',
  selection: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanysName').d('供应商名称'),
    },
    {
      name: 'status',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.status').d('状态'),
    },
    {
      name: 'attachmentFlag',
      type: 'number',
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.whetherHeaderAttachmentUploaded')
        .d('是否上传头附件'),
    },
    {
      name: 'attachmentLineFlag',
      type: 'number',
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.whetherLineAttachmentUploaded')
        .d('是否上传行附件'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/feedback/round/quotation`,
        method: 'GET',
        data,
      };
    },
  },
});

export const columns = (props) => {
  const { lineRecord, sourceKey } = props;
  return [
    {
      name: 'supplierCompanyNum',
      defaultWidth: 140,
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'status',
      width: 100,
      renderer: ({ record }) => statusRender(record, { lineRecord, sourceKey }),
    },
    {
      name: 'attachmentFlag',
      align: 'left',
      width: 120,
      renderer: ({ value = 0 }) => yesOrNoRender(Number(value)),
    },
    {
      name: 'attachmentLineFlag',
      align: 'left',
      width: 120,
      renderer: ({ value = 0 }) => yesOrNoRender(Number(value)),
    },
  ];
};

export const headerInfoDataSet = () => {
  return {
    autoCreate: false,
    autoQuery: false,
  };
};
