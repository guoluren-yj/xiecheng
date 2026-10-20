/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-12-05 16:37:41
 * @LastEditTime: 2025-01-07 16:54:33
 * @Description:
 * @copyright: Copyright (c) 2020, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
// import { Prefix } from '@/utils/globalVariable';
// import { PRIVATE_BUCKET } from '_utils/config';
// import { ChunkUploadProps } from '@/utils/SsrcRegx';

const organizationId = getCurrentOrganizationId();
// 开标执行情况
const executionTableDS = ({ rfxHeaderId }) => ({
  dataToJSON: 'all',
  // autoQuery: true,
  primaryKey: 'rfxMemberId',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'realName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
    },
    {
      name: 'loginName',
      type: 'string',
      label: intl.get(`ssrc.expert.model.expert.subAccount`).d('子账户'),
    },
    {
      name: 'viewItemDetail',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/members/open/execution/list`,
        method: 'POST',
        data: { rfxHeaderId },
      };
    },
  },
});

// 开标一览表
const listDS = ({ rfxHeaderId, customizeTableCode }) => ({
  selection: false,
  pageSize: 20,
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
      name: 'assignItemCountConcatQuotedCount',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.quotationNumber`).d('报价行数'),
    },
    {
      name: 'techAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
    },

    {
      name: 'businessAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationCurrency').d('报价币种'),
    },
    {
      name: 'supplierTotalAmount',
      type: 'string',
      label: intl.get('ssrc.common.totalQuotaionAmount').d('报价总金额'),
    },
    {
      name: 'quotationRank',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRank`).d('报价排名'),
    },
    {
      name: 'quotationDetail',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.view.message.modal.quotationDetail`).d('报价明细'),
    },
  ],
  transport: {
    read: ({ params }) => {
      const newParams = {
        ...(params || {}),
        customizeUnitCode: customizeTableCode,
      };

      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/suppliers/open-quotation-table`,
        method: 'POST',
        params: newParams,
        data: { rfxHeaderId },
      };
    },
  },
});

export { executionTableDS, listDS };
