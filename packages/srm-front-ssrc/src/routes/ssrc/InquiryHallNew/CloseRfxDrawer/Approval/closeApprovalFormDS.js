/*
 * @Descripttion: 关闭询价单--审批-DS
 * @version: 1.0
 * @Author: yujie.shao@going-link.com;
 * @Date: 2021-09-01 11:20
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const promptCode = 'ssrc.inquiryHall';
// 基本信息
const closeApprovalFormDS = ({ rfxId, documentTypeName, bidFlag }) => {
  return {
    // autoQuery: true,
    paging: false,
    primaryKey: 'closeApprovalId',
    fields: [
      {
        name: 'rfxNum',
        type: 'string',
        label: intl
          .get(`${promptCode}.model.inquiryHall.commonRfxNo`, {
            documentTypeName: bidFlag ? 'BID' : 'RFX',
          })
          .d('{documentTypeName}单号'),
      },
      {
        name: 'rfxTitle',
        type: 'string',
        label: intl
          .get(`${promptCode}.model.inquiryHall.commonApproveTitle`, { documentTypeName })
          .d('{documentTypeName}标题'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get(`${promptCode}.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
      },
      {
        name: 'terminatedRemark',
        type: 'string',
        label: intl.get(`${promptCode}.view.message.close.inquiryListReason`).d('关闭理由'),
      },
      {
        name: 'closeAttachmentUuid',
        type: 'attachment',
        label: intl.get('ssrc.common.model.common.attachment').d('附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${Prefix}/${organizationId}/rfx/snap/simple/${rfxId}`,
          method: 'GET',
        };
      },
    },
  };
};
export { closeApprovalFormDS };
