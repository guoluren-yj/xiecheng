/*
 * @Date: 2022-06-23 10:19:45
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();

const getApplyManagerDS = () => ({
  // autoCreate: true,
  // autoQuery: true,
  fields: [
    {
      name: 'applicantName',
      required: true,
      label: intl.get('spfm.enterpriseCertification.model.manualCheck.proposerName').d('申请人'),
    },
    {
      name: 'reason',
      label: intl.get('spfm.enterpriseCertification.modal.applyManager.remark').d('申请说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      required: true,
      label: intl.get('spfm.enterpriseCertification.modal.applyManager.attachment').d('申请附件'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/enterprise-role-applys/find-one`,
      method: 'GET',
      params: {
        userId,
      },
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/enterprise-role-applys`,
        method: 'POST',
        data: data && data[0],
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { getApplyManagerDS };
