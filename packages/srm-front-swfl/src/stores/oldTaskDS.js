import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HWFP, HZERO_PLATFORM } from 'utils/config';
import intl from 'utils/intl';

const tenantId = getCurrentOrganizationId();
// 请求API前缀
const prefix = `${HZERO_HWFP}/v1/${tenantId}`;

// 列表页-查询表单
export const listFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'processDescriptionLike',
      type: 'string',
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
    },
    {
      name: 'processDefinitionNameLike',
      label: intl.get('hwfp.common.model.process.name').d('流程名称'),
    },
    {
      name: 'startedUserLov',
      label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
      type: 'object',
      lovCode: 'HPFM.EMPLOYEE',
      textField: 'name',
      lovPara: { tenantId: getCurrentOrganizationId() },
      ignore: 'always',
    },
    {
      name: 'startedUserId',
      bind: 'startedUserLov.employeeNum',
    },
    {
      name: 'processInstanceId',
      label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
    },
    {
      name: 'startedTime',
      type: 'date',
      range: ['startedAfter', 'startedBefore'],
      label: intl.get('hwfp.task.model.task.approveTime').d('申请时间'),
    },
    {
      name: 'startedAfter',
      label: intl.get('hzero.common.date.creation.from').d('创建日期从'),
    },
    {
      name: 'startedBefore',
      label: intl.get('hzero.common.date.creation.to').d('创建日期至'),
    },
  ],
});

// 列表页-表格
export const listTableDS = () => ({
  fields: [
    {
      name: 'name',
      label: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
    },
    {
      name: 'description',
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
    },
  ],
  autoCount: false,
  transport: {
    read: ({ data, params }) => {
      const { page, size } = params;
      const { queryParams = {} } = data;
      return {
        url: `${prefix}/activiti/task/query/page`,
        method: 'POST',
        data: {
          page,
          size,
          ...queryParams,
        },
      };
    },
  },
});

// 列表页-底部操作栏
export const listOperatorDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'checkedAll',
      label: intl.get('hzero.common.button.selectAll').d('全选'),
    },
    {
      name: 'batchOperation',
      defaultValue: 'Approved',
      label: intl.get('hwfp.task.button.batchOpeartion').d('批量操作'),
    },
    {
      name: 'batchDelegate',
    },
    {
      name: 'approvalOpinion',
      label: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      dynamicProps: {
        required: ({ record }) => {
          return (
            record.get('batchOperation') === 'Rejected' ||
            record.get('batchOperation') === 'delegate'
          );
        },
      },
    },
  ],
});

// 详情页-表格
export const detailTableDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get('hwfp.common.model.approval.time').d('审批时间'),
      name: 'endTime',
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
      label: intl.get('hwfp.common.model.approval.opinion', { title: '审批意见' }).d('审批意见'),
      name: 'comment',
    },
  ],
});

// 详情页 - 审批弹窗 ds
export const detailApproveFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'approvalOpinion',
      label: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      required: true,
    },
    {
      name: 'approvalType',
      label: intl.get('hwfp.common.view.title.approveMethod').d('审批方式'),
      defaultValue: 'Approved',
    },
    {
      name: 'rebutAutoJumpFlag',
      type: 'number',
    },
    {
      name: 'refuseAutoJumpFlag',
      type: 'number',
    },
  ],
});

// 员工
export const employeeTableDS = () => ({
  autoQuery: false,
  queryFields: [
    { label: intl.get('entity.employee.code').d('员工编码'), name: 'employeeNum' },
    { label: intl.get('entity.employee.name').d('员工姓名'), name: 'name' },
  ],
  fields: [
    { label: intl.get('entity.employee.code').d('员工编码'), name: 'employeeCode' },
    { label: intl.get('entity.employee.code').d('员工编码'), name: 'employeeNum' },
    { label: intl.get('entity.employee.name').d('员工姓名'), name: 'name' },
    { label: intl.get('entity.department.name').d('部门名称'), name: 'unitName' },
    { label: intl.get('entity.position.name').d('岗位名称'), name: 'positionName' },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/sql/data`,
      method: 'GET',
      params: {
        ...params,
        tenantId,
        lovCode: 'HPFM.EMPLOYEE',
      },
    }),
  },
});

export const specifyEmployeeTableDS = () => ({
  autoQuery: false,
  queryFields: [
    { label: intl.get('entity.employee.code').d('员工编码'), name: 'employeeCode' },
    { label: intl.get('entity.employee.name').d('员工姓名'), name: 'name' },
  ],
  fields: [
    { label: intl.get('entity.employee.code').d('员工编码'), name: 'employeeCode' },
    { label: intl.get('entity.employee.code').d('员工编码'), name: 'employeeNum' },
    { label: intl.get('entity.employee.name').d('员工姓名'), name: 'name' },
    { label: intl.get('entity.department.name').d('部门名称'), name: 'unitName' },
    { label: intl.get('entity.position.name').d('岗位名称'), name: 'positionName' },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/sql/data`,
      method: 'GET',
      params: {
        ...params,
        tenantId,
        lovCode: 'HPFM.EMPLOYEE',
      },
    }),
  },
});
