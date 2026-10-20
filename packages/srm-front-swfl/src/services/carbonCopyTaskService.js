/*
 * @Descripttion:
 * @Date: 2021-05-21 09:35:42
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
/**
 * service - 我的抄送流程
 * @date: 2018-8-14
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_HWFP}/v1`;

/**
 * 数据查询
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchTaskList(params) {
  const param = parseParameters(params);
  const { tenantId, carbonCopy, onlyCountFlag, oldTotalElements, ...others } = param;
  return request(`${prefix}/${tenantId}/process/instance/query/page`, {
    method: 'POST',
    query:
      onlyCountFlag === 'Y'
        ? { carbonCopy, onlyCountFlag, asyncCountFlag: 'Y', oldTotalElements }
        : { carbonCopy, asyncCountFlag: 'Y', oldTotalElements },
    body: others,
  });
}

/**
 * 明细
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function searchDetail(params) {
  return request(`${prefix}/${params.tenantId}/instance/carbonCopy/${params.id}`, {
    method: 'GET',
    query: filterNullValueObject({
      type: params.type,
      commentRecordFlag: params.commentRecordFlag,
      customizeUnitCode: 'HWFP.APPROVAL_FORM_UNIT_GROUP.CARBON',
      delegateInitiatorFlag: true,
    }),
  });
}
/**
 * 流程图上表格数据
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function fetchForecast(params) {
  return request(`${prefix}/${params.tenantId}/process/instance/forecast/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 撤回
 * @async
 * @function taskRecall
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.processInstanceId - 流程ID
 * @returns {object} fetch Promise
 */
export async function taskRecall(params) {
  const { tenantId, processInstanceId } = params;
  return request(`${prefix}/${tenantId}/runtime/prc/back/${processInstanceId}`, {
    method: 'GET',
  });
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

// 查询流程单据-分类树
export async function fetchCarbonCopyTaskCategoryList() {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list?type=carbonCopy`
  );
}

// 审批工作台查询流程单据-分类树
export async function fetchNewCarbonCopyTaskCategoryList() {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new?type=carbonCopy`
  );
}

// 审批工作台导出按钮
export async function exportApproveTask(params) {
  const { processInstanceIds, queryFrom, customizeUnitCode, merge, ...othersParams } = params;
  return request(
    !merge
      ? `${prefix}/${getCurrentOrganizationId()}/process/instance/export/un-merge?customizeUnitCode=${customizeUnitCode}`
      : `${prefix}/${getCurrentOrganizationId()}/process/instance/export?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: { processInstanceIds, ...queryFrom },
      query: othersParams,
    }
  );
}

// 审批工作台待审批导出按钮
export async function exportToDoTask(params) {
  const { processInstanceIds, queryFrom, merge, ...othersParams } = params;
  return request(
    !merge
      ? `${prefix}/${getCurrentOrganizationId()}/activiti/task/todo-proc/export/un-merge?customizeUnitCode=HWFP.APPROVAL_WORKBENCH_LIST.TASK.FILTER,HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED`
      : `${prefix}/${getCurrentOrganizationId()}/activiti/task/todo-proc/export?customizeUnitCode=HWFP.APPROVAL_WORKBENCH_LIST.TASK.FILTER,HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED`,
    {
      method: 'POST',
      body: { processInstanceIds, ...queryFrom },
      query: othersParams,
    }
  );
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
