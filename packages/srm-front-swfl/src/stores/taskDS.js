import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HWFP, HZERO_PLATFORM } from 'utils/config';
import { isArray, isEmpty } from 'lodash';
import intl from 'utils/intl';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

const tenantId = getCurrentOrganizationId();
// 请求API前缀
const prefix = `${HZERO_HWFP}/v1/${tenantId}`;

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

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
      lovCode: 'HWFP.EMPLOYEE',
      textField: 'name',
      lovPara: { tenantId: getCurrentOrganizationId(), empStatus: 'ALL' },
      ignore: 'always',
      multiple: true,
      lovQueryAxiosConfig: (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': 'HWFP.EMPLOYEE',
            's-lov-display-field': 'name',
          },
        }),
    },
    {
      name: 'startedUserList',
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
      // label: intl.get('hwfp.task.model.task.approveTime').d('申请时间'),
    },
    {
      name: 'startedAfter',
      type: 'date',
      label: intl.get('hwfp.task.model.task.approveTime.from').d('申请时间从'),
    },
    {
      name: 'startedBefore',
      type: 'date',
      label: intl.get('hwfp.task.model.task.approveTime.to').d('申请时间至'),
    },
    {
      name: 'rushFlag',
    },
    {
      name: 'startedUserUnitList',
      label: intl.get('hwfp.common.task.applyDepartment').d('申请部门'),
      type: 'object',
      lovCode: 'SPFM.UNIT.DEPARTMENT',
      ignore: 'always',
      multiple: true,
    },
    {
      name: 'createdTime',
      type: 'date',
      range: ['createdAfter', 'createdBefore'],
    },
    {
      name: 'createdAfter',
      type: 'date',
      label: intl.get('hzero.common.date.approve.empLastApprovalTimeAfter').d('审批时间从'),
    },
    {
      name: 'createdBefore',
      type: 'date',
      label: intl.get('hzero.common.date.approve.empLastApprovalTimeBefore').d('审批时间至'),
    },
    {
      name: 'labelIdList',
      label: intl.get('hwfp.common.view.message.current.label').d('标签'),
      multiple: true,
    },
  ],
  data: [
    {
      sortCode: 'startedTime',
      sortType: 'desc',
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
      name: 'processLabelList',
      label: intl.get('hwfp.common.view.message.current.label').d('标签'),
    },
    {
      name: 'processDetail',
      label: intl.get('hwfp.common.model.process.detail').d('流程明细'),
    },
    {
      name: 'createTime',
      label: intl.get('hwfp.common.view.preStage.approval.time').d('上一节点审批时间'),
    },
    {
      name: 'preStage',
      label: intl.get('hwfp.common.view.message.current.preStage').d('上一节点'),
    },
    {
      name: 'description',
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
    },
    {
      name: 'process',
      label: intl.get('hwfp.common.model.process.process').d('流程'),
    },
    {
      name: 'processInstanceId',
      label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
    },
    {
      name: 'processName',
      label: intl.get('hwfp.common.model.process.name').d('流程名称'),
    },
    {
      name: 'startUserName',
      label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
    },
    {
      name: 'startUserUnitName',
      label: intl.get('hwfp.common.model.apply.startUserUnitName').d('申请部门'),
    },
    {
      name: 'startTime',
      label: intl.get('hwfp.common.model.apply.time').d('申请时间'),
    },
    {
      name: 'assigneeName',
      label: intl.get('hwfp.common.model.apply.approver').d('审批人'),
    },
    {
      name: 'previousNodeName',
      label: intl.get('hwfp.common.view.message.current.preStage').d('上一节点'),
    },
    {
      name: 'previousApprover',
      label: intl.get('hwfp.common.view.message.current.preStage.approver').d('上一节点审批人'),
    },
    {
      name: 'previousComment',
      label: intl.get('hwfp.common.view.message.current.preStage.comment').d('上一节点审批意见'),
    },
    {
      name: 'modelStandardTime',
      label: intl.get('hwfp.common.view.message.current.preStage.modelStandardTime').d('标准用时'),
    },
  ],
  autoCount: false,
  transport: {
    read: ({ data, params }) => {
      const { page, size } = params;
      const { queryParams = {}, ...otherData } = data;
      return {
        url: `${prefix}/activiti/task/query/new-page?needPreviousComment=true&customizeUnitCode=HWFP.APPROVAL_WORKBENCH_LIST.TASK.FILTER,HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED`,
        method: 'POST',
        data: {
          ...otherData,
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
      type: 'object',
      lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), employeeResign: true },
    },
    {
      name: 'batchSelected',
      type: 'object',
      lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), employeeResign: true },
    },
    {
      name: 'approvalOpinion',
      label: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      dynamicProps: {
        required: ({ record }) => {
          const batchOperation = record.get('batchOperation');
          return batchOperation && ['delegate', 'rejected'].includes(batchOperation.toLowerCase());
        },
      },
    },
  ],
  events: {
    update: ({ dataSet, name, value }) => {
      if (name === 'batchDelegate' && value.length) {
        dataSet.current.set(name, [value[value.length - 1]]);
      }
    },
  },
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
    // 抄送
    {
      name: 'addCc',
      type: 'object',
      lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), employeeResign: true },
    },
    // 转交
    {
      name: 'delegate',
      type: 'object',
      lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), employeeResign: true },
    },
    // 加签，同意并加签
    {
      name: 'addSign',
      type: 'object',
      lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), employeeResign: true },
    },
    // 驳回
    {
      name: 'jumped',
      type: 'object',
    },
    {
      label: intl.get('hwfp.task.view.message.chooseRejectNode').d('选择驳回节点'),
      name: 'jumpedName',
      type: 'string',
    },
    {
      label: intl
        .get('hwfp.task.view.message.rebutAutoJumpFlag')
        .d('请选择驳回节点人员重新审批后的审批路径'),
      name: 'rebutAutoJumpFlag',
      type: 'number',
    },
    {
      name: 'refuseAutoJumpFlag',
      type: 'number',
      label: intl
        .get('hwfp.task.view.message.selectBox.refuseAutoJumpFlag.title')
        .d('请选择发起人再次提交后的审批路径'),
    },
    // 指派审批人
    {
      name: 'approval',
      type: 'object',
      multiple: true,
      lovCode: 'HWFP.EMPLOYEE',
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), lovCode: 'HWFP.EMPLOYEE' },
      lovQueryAxiosConfig: () => {
        return {
          url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/sql/data`,
          method: 'GET',
        };
      },
    },
  ],
  events: {
    update: ({ dataSet, name, value }) => {
      if (name === 'delegate' && isArray(value) && value.length) {
        dataSet.current.set(name, [value[value.length - 1]]);
      }
    },
  },
});

export const getAssignApproveDs = (otherParams = {}, queryByEmployeeNum = false) => {
  return {
    fields: [
      {
        name: 'key',
        type: 'string',
      },
      // 指派审批人
      {
        name: 'approval',
        type: 'object',
        multiple: true,
        ignore: 'always',
        computedProps: {
          lovCode: ({ record }) => {
            const changFlag = record.getState('approvalLovFlag') === 'changeLocCode';
            return changFlag ? 'HWFP.APPOINT_APPROVER_SCOPE' : 'HWFP.EMPLOYEE';
          },
          lovPara: ({ record }) => {
            const changFlag = record.getState('approvalLovFlag') === 'changeLocCode';
            return {
              tenantId: getCurrentOrganizationId(),
              lovCode: changFlag ? 'HWFP.APPOINT_APPROVER_SCOPE' : 'HWFP.EMPLOYEE',
            };
          },
          lovQueryAxiosConfig: ({ record }) => {
            const changFlag = record.getState('approvalLovFlag') === 'changeLocCode';
            const {
              appointApproverEmpStr = '',
              appointApproverPostStr = '',
              appointApproverRoleStr = '',
            } = record.getState('appointApproverParamsData') || {};
            if (changFlag) {
              return () => {
                return {
                  url: `/hwfp/v1/${tenantId}/hr/appoint-approver/query?appointApproverEmpStr=${appointApproverEmpStr}&appointApproverPostStr=${appointApproverPostStr}&appointApproverRoleStr=${appointApproverRoleStr}`,
                  method: 'GET',
                };
              };
            } else {
              return () => {
                return {
                  url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/sql/data`,
                  method: 'GET',
                };
              };
            }
          },
          optionsProps: (dsProps) => {
            const props = {
              ...dsProps,
              paging: !(
                otherParams &&
                otherParams.check === 'Y' &&
                !isEmpty(otherParams.candidates)
              ),
              events: {
                query: ({ dataSet, data }) => {
                  if (
                    otherParams &&
                    otherParams.check === 'Y' &&
                    !isEmpty(otherParams.candidates)
                  ) {
                    otherParams.candidates.map((item) => {
                      const newItem = item;
                      newItem.employeeNum = newItem.employeeNum || newItem.employeeCode;
                      return newItem;
                    });
                    const newOtherParams = [];
                    if (data.employeeNum || data.name) {
                      otherParams.candidates.forEach((item) => {
                        if (
                          queryByEmployeeNum &&
                          data.name &&
                          (item.employeeNum.includes(data.name) || item.name.includes(data.name))
                        ) {
                          newOtherParams.push(item);
                        } else if (
                          data.employeeNum &&
                          !data.name &&
                          item.employeeNum.includes(data.employeeNum)
                        ) {
                          newOtherParams.push(item);
                        } else if (
                          !data.employeeNum &&
                          data.name &&
                          item.name.includes(data.name)
                        ) {
                          newOtherParams.push(item);
                        } else if (
                          data.employeeNum &&
                          data.name &&
                          item.employeeNum.includes(data.employeeNum) &&
                          item.name.includes(data.name)
                        ) {
                          newOtherParams.push(item);
                        }
                      });
                    }
                    dataSet.loadData(
                      data.employeeNum || data.name ? newOtherParams : otherParams.candidates
                    );
                    return false;
                  }
                  return true;
                },
              },
            };
            return props;
          },
        },
      },
    ],
  };
};

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
      url: `${HZERO_PLATFORM}/v1/lovs/sql/data`,
      method: 'GET',
      params: {
        ...params,
        tenantId,
        lovCode: 'HWFP.EMPLOYEE',
      },
    }),
  },
});
