/*
 * @Date: 2023-12-07 11:28:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getAppraisalAttachmentDs = ({ evalHeaderId }) => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'attachmentName',
      label: intl.get('sslm.common.model.attachment.name').d('附件名称'),
    },
    {
      name: 'uploadUserName',
      label: intl.get(`sslm.common.model.attachment.uploadName`).d('上传人'),
    },
    {
      name: 'uploadTime',
      type: 'dateTime',
      label: intl.get(`sslm.common.model.attachment.uploadDate`).d('上传时间'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'option',
      width: 180,
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-header-atts`,
        method: 'GET',
        data: {},
        params: { evalHeaderId, ...params },
      };
    },
  },
});
