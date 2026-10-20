import isString from 'lodash/isString';
import intl from 'utils/intl';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export const approverTableDS = () => {
  const tenantId = getCurrentOrganizationId();
  return {
    autoCount: false,
    autoQuery: false,
    record: {
      dynamicProps: {
        selectable: (record) => {
          return record && !record.get('suspended');
        },
      },
    },
    queryFields: [
      {
        name: 'assignee',
        label: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
        lovCode: 'HWFP.EMPLOYEE',
        lovPara: { tenantId, empStatus: 'ALL' },
        textField: 'name',
        type: 'object',
        display: true,
      },
      {
        name: 'processDefinitionKey',
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
        display: true,
      },
      {
        name: 'processDefinitionName',
        label: intl.get('hwfp.common.model.process.name').d('流程名称'),
        display: true,
      },
      {
        name: 'processDescriptionLike',
        label: intl.get('hwfp.common.model.process.description').d('流程描述'),
        display: true,
      },
      {
        name: 'processDefinitionVersion',
        label: intl.get('hwfp.task.model.task.processDefinitionVersion').d('流程版本'),
        type: 'number',
        display: true,
      },
      {
        name: 'employeeResign',
        label: intl.get('hwfp.common.view.message.handlerResign').d('当前处理人是否离职'),
        lookupCode: 'HPFM.FLAG',
        display: true,
        transformValue: (value) => (value === '1' ? 'true' : value === '0' ? 'false' : undefined),
      },
    ],
    fields: [
      {
        name: 'suspended',
        label: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
      },
      {
        name: 'processInstanceId',
        label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
      },
      {
        name: 'processDefinitionKey',
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
      },
      {
        name: 'processName',
        label: intl.get('hwfp.common.model.process.name').d('流程名称'),
      },
      {
        name: 'description',
        label: intl.get('hwfp.common.model.process.description').d('流程描述'),
      },
      {
        name: 'name',
        label: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
      },
      {
        name: 'assigneeName',
        label: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
      },
      {
        name: 'startUserName',
        label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
      },
      {
        name: 'startTime',
        label: intl.get('hwfp.task.model.task.creationTime').d('创建时间'),
      },
      {
        name: 'processDefinitionVersion',
        label: intl.get('hwfp.task.model.task.processDefinitionVersion').d('流程版本'),
      },
    ],
    transport: {
      read: {
        url: `${HZERO_HWFP}/v1/${tenantId}/task/delegate-list`,
        method: 'POST',
      },
    },
  };
};

export const applicantTableDS = () => {
  const tenantId = getCurrentOrganizationId();
  return {
    autoCount: false,
    autoQuery: false,
    queryFields: [
      {
        name: 'processStatusList',
        label: intl.get('hwfp.common.view.title.processStatus').d('流程状态'),
        multiple: true,
        display: true,
        lookupCode: 'HWFP.PROCESS_APPROVE_STATUS',
        transformValue: (value) => (value && isString(value) ? value.split(',') : value),
      },
      {
        name: 'assignee',
        label: intl.get('hwfp.common.view.message.applicant').d('流程申请人'),
        lovCode: 'HWFP.EMPLOYEE',
        type: 'object',
        lovPara: { tenantId, empStatus: 'ALL' },
        textField: 'name',
        display: true,
      },
      {
        name: 'processDefinitionKey',
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
        display: true,
      },
      {
        name: 'processDefinitionName',
        label: intl.get('hwfp.common.model.process.name').d('流程名称'),
        display: true,
      },
      {
        name: 'processDescriptionLike',
        label: intl.get('hwfp.common.model.process.description').d('流程描述'),
        display: true,
      },
      {
        name: 'processDefinitionVersion',
        label: intl.get('hwfp.task.model.task.processDefinitionVersion').d('流程版本'),
        type: 'number',
        display: true,
      },
      {
        name: 'employeeResign',
        label: intl.get('hwfp.common.view.message.applicantDepart').d('流程申请人是否离职'),
        lookupCode: 'HPFM.FLAG',
        display: true,
        transformValue: (value) => (value === '1' ? 'true' : value === '0' ? 'false' : undefined),
      },
    ],
    fields: [
      {
        label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
        name: 'processInstanceId',
      },
      {
        name: 'processDefinitionKey',
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
      },
      {
        label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
        name: 'startUserName',
      },
      {
        label: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
        name: 'processStatus',
      },
      {
        label: intl.get('hwfp.common.model.process.name').d('流程名称'),
        name: 'processName',
      },
      {
        label: intl.get('hwfp.common.model.process.description').d('流程描述'),
        name: 'description',
      },
      {
        label: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        name: 'name',
      },
      {
        label: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
        name: 'taskAssigneeList',
      },
      {
        label: intl.get('hwfp.task.model.task.creationTime').d('创建时间'),
        name: 'startTime',
      },
      {
        name: 'processDefinitionVersion',
        label: intl.get('hwfp.task.model.task.processDefinitionVersion').d('流程版本'),
      },
    ],
    transport: {
      read: {
        url: `${HZERO_HWFP}/v1/${tenantId}/delegate/delegate-initiator/list`,
        method: 'POST',
      },
    },
  };
};
