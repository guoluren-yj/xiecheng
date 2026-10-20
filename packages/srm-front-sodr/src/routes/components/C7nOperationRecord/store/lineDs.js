import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const line = (poHeaderId) => ({
  selection: false,
  fields: [
    {
      name: 'processUserName',
      label: intl.get('sodr.workspace.model.common.processUserName').d('操作人'),
    },
    {
      name: 'processedDate',
      label: intl.get('sodr.workspace.model.common.processedDate').d('操作时间'),
    },
    {
      name: 'processType',
      label: intl.get('sodr.workspace.model.common.processType').d('动作'),
    },
    {
      name: 'processRemark',
      label: intl.get('sodr.workspace.model.common.processRemark').d('说明'),
    },
    {
      name: 'versionNum',
      label: intl.get('sodr.workspace.model.common.version').d('版本'),
    },
    {
      name: 'changeType',
      label: intl.get('sodr.workspace.model.common.changeType').d('变更动作'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'changeFieldName',
      label: intl.get('sodr.workspace.model.common.changeFieldName').d('修改内容'),
    },
    {
      name: 'oldValue',
      label: intl.get('sodr.workspace.model.common.oldValue').d('修改前'),
    },
    {
      name: 'newValue',
      label: intl.get('sodr.workspace.model.common.newValue').d('修改后'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}`,
        method: 'GET',
      };
    },
  },
});

const approval = () => ({
  selection: false,
  fields: [
    {
      name: 'endTime',
      label: intl.get('sodr.workspace.model.common.afterModification').d('修改后'),
    },
    {
      name: 'action',
      label: intl.get('sodr.workspace.model.common.approvalAction').d('审批动作'),
    },
    {
      name: 'name',
      label: intl.get('sodr.workspace.model.common.approvalProcess').d('审批环节'),
    },
    {
      name: 'assigneeName',
      label: intl.get('sodr.workspace.model.common.approvedBy').d('审批人'),
    },
    {
      name: 'comment',
      label: intl.get('sodr.workspace.model.common.approvalComments').d('审批意见'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUuid').d('附件'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-change-records/list-history-approval`,
        method: 'GET',
      };
    },
  },
});

export { line, approval };
