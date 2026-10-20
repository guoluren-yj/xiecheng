/**
 * service - 待办事情列表
 * @date: 2018-8-14
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HWFP, HZERO_PLATFORM, HZERO_FILE } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_HWFP}/v1`;
const hpfmFix = `${HZERO_PLATFORM}/v1`;

/**
 * 数据查询
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @param {?number} params.processDefinitionId - 流程ID
 * @param {?string} params.name - 流程名称
 * @param {?string} params.createdBefore - 创建时间从
 * @param {?string} params.createdAfter - 创建时间至
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchTaskList(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/activiti/task/query/page`, {
    method: 'POST',
    body: others,
  });
}

export async function fetchEmployeeList(params) {
  return request(`${hpfmFix}/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 明细
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.taskId - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function searchDetail(params) {
  return request(`${prefix}/${params.tenantId}/activiti/task/${params.taskId}`, {
    method: 'GET',
    query: filterNullValueObject({
      delegateInitiatorFlag: true,
      commentRecordFlag: params.commentRecordFlag,
      customizeUnitCode: 'HWFP.APPROVAL_FORM_UNIT_GROUP.NOT_APPROVED',
    }),
  });
}

export async function searchDetailNew(params, beforeCatch) {
  return request(
    `${prefix}/${params.tenantId}/activiti/task/${params.taskId}`,
    {
      method: 'GET',
      query: filterNullValueObject({
        delegateInitiatorFlag: true,
        commentRecordFlag: params.commentRecordFlag,
        customizeUnitCode: 'HWFP.APPROVAL_FORM_UNIT_GROUP.NOT_APPROVED',
      }),
    },
    {
      beforeCatch,
    }
  );
}
/**
 * 流程图上表格数据
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.taskId - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function fetchForecast(params) {
  return request(`${prefix}/${params.tenantId}/process/instance/forecast/${params.Id}`, {
    method: 'GET',
  });
}

/**
 * 审批
 * @async
 * @function searchTaskList
 * @param {object} params - 保存条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function saveTask(params, query) {
  const { tenantId, currentTaskId, ...others } = params;
  // 日志调试，勿删
  console.log('[swfl]: task is submiting');
  return request(`${prefix}/${tenantId}/runtime/tasks/${currentTaskId}`, {
    method: 'POST',
    body: { ...others, currentTaskId },
    query,
  });
}

/**
 * 获取可跳转的节点
 * @async
 * @function getJumpList
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function getJumpList(params) {
  const { tenantId, taskId, query } = params;
  return request(`${prefix}/${tenantId}/activiti/task/getJumpList/${taskId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 回退上一审批人
 *
 */
export async function rollBack(params) {
  const { currentTaskId } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/runtime/tasks/${currentTaskId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 跳转指定节点
 * @async
 * @function getJumpList
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function jumpActivity(params) {
  const { tenantId, taskId, activityId, appointer } = params;
  return request(
    `${prefix}/${tenantId}/activiti/task/jumpActivity/${taskId}/${activityId}/${appointer}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取顺序流节点数据
 * @async
 * @function fetchOrderFlowJump
 * @param {object} params - 请求参数
 * @returns
 */
export async function fetchOrderFlowJump(params) {
  const { tenantId, ...data } = params;
  return request(`${prefix}/${tenantId}/process/instance/specified-sequence`, {
    method: 'GET',
    query: data,
  });
}

/**
 * 发送选中顺序流节点
 * @async
 * @function fetchOrderFlowNode
 * @param {object} params - 请求参数
 * @returns
 */
export async function fetchOrderFlowNode(params) {
  const { tenantId, ...data } = params;
  return request(`${prefix}/${tenantId}/process/instance/specified-sequence`, {
    method: 'POST',
    query: data,
  });
}

export async function batchApproveTasks(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/runtime/batch-tasks`, {
    method: 'POST',
    body: params,
  });
}

export async function getAllUser(params) {
  const formData = new FormData();
  const param = parseParameters(params);
  Object.keys(param).forEach((itemKey) => {
    if (param[itemKey] !== undefined) {
      formData.append(itemKey, param[itemKey]);
    }
  });
  return request(`${prefix}/${getCurrentOrganizationId()}/hr/employee/query`, {
    method: 'POST',
    body: formData,
  });
}

export async function fetchFileCount(params) {
  const { attachmentUUID } = params;
  if (attachmentUUID) {
    return request(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/${attachmentUUID}/count`, {
      method: 'GET',
    });
  } else {
    return 0;
  }
}

// 查询审批历史记录
export async function fetchHistoryApproval(params) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/activiti/task/historyApproval?filterAuto=true&delegateInitiatorFlag=true`,
    {
      method: 'POST',
      query: params,
    }
  );
}

//
export async function saveTaskComment(params) {
  const { taskId, comment } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/comment/${taskId}`, {
    method: 'POST',
    body: comment || '',
  });
}

// 查询流程单据-分类树
export async function fetchTaskCategoryList() {
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list`);
}

// 审批工作台查询流程单据-分类树
export async function fetchNewTaskCategoryList() {
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new`);
}

// 审批工作台查询流程单据-分类树第一层
export async function fetchNewTaskCategorySecondList(params) {
  const { documentId, type } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new`, {
    query: { documentId, levelType: 'model', type },
  });
}

// 获取审批表单token
export async function fetchProcessFormToken() {
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/token`, {
    responseType: 'text',
  });
}

// 获取审批偏好设置
export async function fetchFavorStatus() {
  return request(`${prefix}/${getCurrentOrganizationId()}/delegate/approval-config`);
}

// 修改审批偏好设置

export async function updateFavorStatus(autoOpenNext) {
  return request(`${prefix}/${getCurrentOrganizationId()}/delegate/approval-config`, {
    method: 'POST',
    body: autoOpenNext,
  });
}

// 获取预测审批记录数据
export async function getForecastLists(params) {
  return request(
    `${prefix}/${params.tenantId}/instance/forecast/${params.processInstanceId}?processDefinitionId=${params.processDefinitionId}`,
    {
      method: 'GET',
    }
  );
}

// 查询操作按钮气泡提示
export async function getActionTooltipLists() {
  return request(`${prefix}/${getCurrentOrganizationId()}/notification/approval-action-tooltip`, {
    method: 'GET',
  });
}

// 查询流程定义全局配置
export async function getProcessDefineConfig() {
  return request(`${prefix}/${getCurrentOrganizationId()}/notification`, {
    method: 'POST',
  });
}

export async function acquireFormLock(processInstanceId) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/activiti/task/form-lock/acquire/${processInstanceId}`,
    {
      method: 'POST',
    }
  );
}

export async function releaseFormLock({ processInstanceId, formLock }) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/activiti/task/form-lock/release/${processInstanceId}?formLock=${formLock}`,
    {
      method: 'POST',
    }
  );
}

export async function queryMenuId(code) {
  return request(`/iam/hzero/v1/menu`, {
    query: { code, level: 'organization' },
  });
}

export async function saveTaskLabel(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/process-labels/save-label`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteTaskLabel(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/process-labels`, {
    method: 'DELETE',
    body: data,
  });
}

export async function queryPreviousInfo(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/process/instance/query/previous-info`, {
    method: 'POST',
    body: data,
  });
}

export async function checkGroupButFlag(data) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ABOFppB6rhtPFGEzAc48rM5aB4Vs7FghscwDIb2xlxqwj7VjbmmW1kjgAwyEO2Hic`,
    {
      method: 'GET',
      query: data,
    }
  );
}

export async function starGroupChat(data) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ABOFppB6rhtPFGEzAc48rO2AsLUJ8FjCp16pPET4kkdktWIxeQGCR3QRanrI4IPW`,
    {
      method: 'POST',
      body: data,
    }
  );
}

export async function getApproveDetail(data) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ABOFppB6rhtPFGEzAc48rECIUSQdXPDAiaVYEe7B5icCstFQ2yRxg8A6JBfPvqOugr`,
    {
      method: 'GET',
      query: data,
    }
  );
}

export async function getDdConfig(data) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/KSymRE9BGYuXWzbCoUmkAZdhdCSRmt5QHTia345jgFnY`,
    {
      method: 'POST',
      body: data,
    }
  );
}
