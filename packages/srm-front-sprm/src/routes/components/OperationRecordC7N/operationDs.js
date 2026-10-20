// import moment from 'moment';
import intl from 'utils/intl';
import { BKT_HWFP } from 'utils/config';
import { SRM_SPUC, SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const historyDs = (prHeaderId) => ({
  autoLocateFirst: false,
  autoQuery: true,
  key: 'actionId',
  fields: [
    {
      label: intl.get('entity.roles.operator').d('操作人'),
      name: 'processUserName',
    },
    {
      label: intl.get(`${commonPrompt}.handleDate`).d('操作时间'),
      name: 'processedDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`${commonPrompt}.motion`).d('动作'),
      width: 100,
      name: 'processTypeCodeMeaning',
    },
    {
      label: intl.get(`${commonPrompt}.handleRemark`).d('操作说明'),
      width: 100,
      name: 'processRemark',
    },
    {
      label: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
      width: 100,
      name: 'changeField',
    },
    {
      label: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
      width: 80,
      name: 'displayLineNum',
    },
    {
      label: intl.get(`${commonPrompt}.beforeModify`).d('修改前'),
      name: 'oldValue',
      width: 250,
    },
    {
      label: intl.get(`${commonPrompt}.afterModify`).d('修改后'),
      name: 'newValue',
      width: 250,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/actions`,
        method: 'GET',
      };
    },
  },
});

const workHistoryDs = () => ({
  autoLocateFirst: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('hwfp.common.model.approval.time').d('审批时间'),
      name: 'endTime',
      type: 'dateTime',
    },
    {
      label: intl.get('hwfp.common.model.approval.action').d('审批动作'),
      name: 'action',
    },
    {
      label: intl.get('hwfp.common.model.approval.step').d('审批环节'),
      name: 'name',
    },
    {
      label: intl.get('hwfp.common.model.approval.owner').d('审批人'),
      name: 'assigneeName',
    },
    {
      label: intl.get('hwfp.common.model.approval.opinion').d('审批意见'),
      name: 'comment',
      width: 150,
    },
    {
      label: intl.get('hwfp.common.model.approval.file').d('附件'),
      name: 'attachmentUuid',
      bucketName: BKT_HWFP,
      bucketDirectory: 'hwfp01',
      type: 'attachment',
      fixed: 'right',
    },
  ],
});

export { historyDs, workHistoryDs };
