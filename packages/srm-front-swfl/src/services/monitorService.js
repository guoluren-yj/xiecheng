/**
 * service - 流程监控
 * @date: 2018-8-14
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_HWFP, HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const isSiteFlag = !isTenantRoleLevel();
const tenantId = getCurrentOrganizationId();
const prefix = isSiteFlag ? `${HZERO_HWFP}/v1` : `${HZERO_HWFP}/v1/${tenantId}`;

export async function fetchEmployeeList(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 数据查询
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchMonitorList(params) {
  const param = parseParameters(params);
  const { onlyCountFlag, oldTotalElements, ...otherParam } = param;
  return request(`${prefix}/process/instance/monitor/query`, {
    method: 'POST',
    query:
      onlyCountFlag === 'Y'
        ? { onlyCountFlag, oldTotalElements, asyncCountFlag: 'Y' }
        : { oldTotalElements, asyncCountFlag: 'Y' },
    body: otherParam,
  });
}

/**
 * 详情
 * @async
 * @function fetchDetail
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 流程ID
 * @returns {object} fetch Promise
 */
export async function fetchDetail(params) {
  const { id, ...other } = params;
  return request(`${prefix}/process/instance/monitor/detail/${id}?delegateInitiatorFlag=true`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 流程图上表格数据
 * @async
 * @function fetchForecast
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 流程ID
 * @returns {object} fetch Promise
 */
export async function fetchForecast(params) {
  return request(`${prefix}/process/instance/monitor/forecast/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 挂起详情
 * @export
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.processInstanceId - 流程ID
 * @returns
 */
export async function fetchExceptionDetail(params) {
  return request(`${prefix}/process/instance/monitor/suspendDetail/${params.processInstanceId}`, {
    method: 'GET',
  });
}

/**
 * 终止流程
 * @async
 * @function stopProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function stopProcess(params) {
  const { comment, processInstanceId, ...other } = params;
  return request(
    `${prefix}/process/instance/monitor/end/${processInstanceId}?comment=${comment || ''}`,
    {
      method: 'GET',
      query: other,
    }
  );
}

/**
 * 恢复流程
 * @async
 * @function resumeProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function resumeProcess(params) {
  const { processInstanceId, ...other } = params;
  return request(`${prefix}/process/instance/monitor/active/${processInstanceId}`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 挂起流程
 * @async
 * @function suspendProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function suspendProcess(params) {
  const { processInstanceId, ...other } = params;
  return request(`${prefix}/process/instance/monitor/suspend/${processInstanceId}`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 查询有效的节点
 * @async
 * @function fetchValidNode
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function fetchValidNode(params) {
  return request(`${prefix}/definition/user-tasks/${params.processInstanceId}`, {
    method: 'GET',
  });
}

/**
 * 流程恢复并制指定审批人
 * @async
 * @function retryProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function retryProcess(params) {
  return request(`${prefix}/process/instance/monitor/execute/retry`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 异常日志
 * @async
 * @function fetchProcessException
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function fetchProcessException(params) {
  return request(`${prefix}/process/instance/monitor/exception/${params.encryptId}`, {
    method: 'GET',
  });
}

/**
 * 流程变量
 * @async
 * @function fetchProcessVariable
 * @param {String} params.procDefKey - 流程定义编码
 * @param {String} params.procInstId - 流程标识
 */
export async function fetchProcessVariable(params) {
  const { procDefKey, procInstId, ...queryParams } = params;
  return request(
    `${prefix}/process/instance/monitor/${procDefKey}/${procInstId}/query-process-variable`,
    {
      method: 'GET',
      query: parseParameters(queryParams),
    }
  );
}

/**
 * 查询带指定审批的流程
 */
export async function fetchProcessRetry(params) {
  const query = parseParameters(params);
  return request(`${prefix}/process/instance/monitor/execute/retry`, {
    method: 'GET',
    query,
  });
}

/**
 * 提交指定审批人
 */
export async function saveProcessRetry({ processInstanceId, data, tenantId: retryTenantId }) {
  return request(`${prefix}/process/instance/monitor/execute/retry`, {
    method: 'POST',
    query: {
      processInstanceId,
      tenantId: retryTenantId,
    },
    body: data,
  });
}

// 导出审批记录
export const EXPORTURL = `${prefix}/process/instance/monitor/query-export-detail?exportType=COLUMN`;
export const EXPORTURL_NO_MERGE = `${prefix}/process/instance/monitor/query-export-detail/un-merge?exportType=COLUMN`;
export function exportDetail(query = {}, option) {
  const { merge } = option || {};
  return request(
    !merge
      ? `${prefix}/process/instance/monitor/query-export-detail/un-merge`
      : `${prefix}/process/instance/monitor/query-export-detail`,
    {
      method: 'GET',
      query: {
        exportType: 'DATA',
        ...query,
      },
    }
  );
}

export async function fixProcessStatus(data) {
  const { tenantId: recordTenantId, ...other } = data;
  return request(`${HZERO_HWFP}/v1/workflow/data-fix/fix-proc-status`, {
    method: 'POST',
    query: { tenantId: recordTenantId },
    body: { ...other },
  });
}

export async function fetchApprovalHistoryList({ businessKey }) {
  return request(`${prefix}/process/instance/proc-by-buskey`, {
    method: 'GET',
    query: {
      businessKey,
    },
  });
}

export async function batchSuspend(data) {
  return request(`${prefix}/process/instance/monitor/suspend-batch`, {
    method: 'POST',
    body: data,
  });
}

export async function batchRestore(data) {
  return request(`${prefix}/process/instance/monitor/active-batch`, {
    method: 'POST',
    body: data,
  });
}

export async function continueProcess({ id }) {
  return request(`${prefix}/process/instance/monitor/continue/${id}`, {
    method: 'GET',
  });
}
