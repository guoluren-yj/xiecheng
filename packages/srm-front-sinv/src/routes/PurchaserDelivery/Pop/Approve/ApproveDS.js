import intl from 'utils/intl';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ApproveDS = () => ({
  autoQuery: false,
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get('sinv.common.model.approval.time').d('审批时间'),
      name: 'endTime',
      width: 180,
    },
    {
      label: intl.get('sinv.common.model.approval.action').d('审批动作'),
      name: 'action',
      width: 120,
    },
    {
      label: intl.get('sinv.common.model.approval.step').d('审批环节'),
      name: 'name',
      width: 150,
    },
    {
      label: intl.get('sinv.common.model.approval.owner').d('审批人'),
      name: 'assigneeName',
      width: 150,
    },
    {
      label: intl.get('sinv.common.model.approval.opinion').d('审批意见'),
      name: 'comment',
    },
    {
      label: intl.get('sinv.common.model.approval.file').d('附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      fixed: 'right',
      width: 150,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/list-history-approval`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { ApproveDS };
