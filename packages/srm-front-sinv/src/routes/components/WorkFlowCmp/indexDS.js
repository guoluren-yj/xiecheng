import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const workFlowDS = () => ({
  dataToJSON: 'all',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'name',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.processNode').d('审批节点'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.action').d('审批动作'),
    },
    {
      name: 'assigneeName',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.owner').d('审批人'),
    },
    {
      name: 'comment',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.opinion', { title: '审批意见' }).d('审批意见'),
    },
    {
      name: 'endTime',
      type: 'string',
      label: intl.get('hwfp.monitor.model.approval.time').d('审批时间'),
    },
    {
      name: 'approveDuration',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.approveDuration').d('用时'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get('hwfp.common.model.approval.file').d('附件'),
    },
  ],
});
export { workFlowDS };
