import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { BKT_HWFP } from 'utils/config';

export default ({ organizationId, poHeaderId }) => {
  return {
    autoQuery: true,
    transport: {
      read: {
        url: `${SRM_SPUC}/v1/${organizationId}/po-change-records/list-history-approval`,
        method: 'GET',
        params: {
          poHeaderId,
        },
        transformResponse(resp) {
          const data = JSON.parse(resp);
          const { failed } = data;
          if (failed) {
            return data;
          }
          return data.reduce((total, item) => [...total, ...(item.historicTaskExtList || [])], []);
        },
      },
    },
    dataKey: null,
    paging: false,
    fields: [
      {
        name: 'endTime',
        type: 'dateTime',
        label: intl.get('sodr.common.model.approval.time').d('审批时间'),
      },
      {
        name: 'action',
        label: intl.get('sodr.common.model.approval.action').d('审批动作'),
      },
      {
        name: 'name',
        label: intl.get('sodr.common.model.approval.step').d('审批环节'),
      },
      {
        name: 'assigneeName',
        label: intl.get('sodr.common.model.approval.owner').d('审批人'),
      },
      {
        name: 'comment',
        label: intl.get('sodr.common.model.approval.opinion').d('审批意见'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('sodr.common.model.approval.file').d('附件'),
        bucketName: BKT_HWFP,
        bucketDirectory: 'hwfp01',
        readOnly: true,
      },
    ],
  };
};
