/*
 * @Date: 2023-10-23 10:54:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';

const useId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();

export const getAttachmentDs = ({ evalHeaderId }) => ({
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
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-header-atts`,
        method: 'GET',
        params: { evalHeaderId, uploadUserId: useId, ...params },
      };
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-header-atts`,
      method: 'DELETE',
    },
  },
});
