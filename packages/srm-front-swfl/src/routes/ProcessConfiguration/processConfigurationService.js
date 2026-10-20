/**
 * processConfigurationService 接口服务
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { HZERO_HWFP } from 'utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { downloadFileByAxios } from 'services/api';

const organizationId = getCurrentOrganizationId();
const isSiteFlag = !isTenantRoleLevel();
const prefix = isSiteFlag ? `${HZERO_HWFP}/v1` : `${HZERO_HWFP}/v1/${organizationId}`;

export async function queryProcessTreeNode(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/documents/approve-flow/tree/query`, {
    method: 'GET',
    query: params,
  });
}

export async function saveDocumentAndCategory(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/documents/approve-flow/save`, {
    method: 'POST',
    body: params,
  });
}

export async function updateProcessDocument(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/documents/approve-flow/new-update`, {
    method: 'PUT',
    body: params,
  });
}

export async function copySiteRecord(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/documents/copy/${params.documentId}`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteProcessDocument(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/documents/${params.documentId}`, {
    method: 'DELETE',
    body: params,
  });
}

export async function saveProcessCategory(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/documents/approve-flow/save`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteProcessCategory(params) {
  const { categoryId, ...otherParams } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/categories/${categoryId}`, {
    method: 'DELETE',
    body: otherParams,
  });
}

export async function updateProcessCategory(params) {
  const { categoryId, ...otherParams } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/categories/${categoryId}`, {
    method: 'PUT',
    body: otherParams,
    query: {
      isApproveFlow: true,
    },
  });
}

export async function fetchProcessVariable(params) {
  const { sourceType, sourceId } = params;
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/process/variables/${sourceId}/${sourceType}/list`,
    {
      method: 'GET',
      query: { tenantId: organizationId },
    }
  );
}

export async function fetchCustomizeField(params) {
  const { modelCode } = params;
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/process/documents/bo-rel/tree?modelCode=${modelCode}`,
    {
      method: 'POST',
    }
  );
}

export async function saveProcessVariable(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/variables`, {
    method: 'POST',
    body: params,
  });
}

export async function updateProcessVariable(params) {
  const { variableId } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/variables/${variableId}`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteProcessVariable(params) {
  const { variableId } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/variables/${variableId}`, {
    method: 'DELETE',
    body: params,
  });
}

export async function saveProcessForm(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/forms`, {
    method: 'POST',
    body: params,
  });
}

export async function updateProcessForm(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/forms/${params.formId}`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteProcessForm(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/forms/${params.formId}`, {
    method: 'DELETE',
    body: params,
  });
}

export async function saveEmailApproveForm(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/mail-templates`, {
    method: 'POST',
    body: params,
  });
}

export async function updateEmailApproveForm(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/mail-templates`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteEmailApproveForm(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/mail-templates`, {
    method: 'DELETE',
    body: params,
  });
}

export async function saveApprovalGroup(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-defs`, {
    method: 'POST',
    body: params,
  });
}

export async function updateApprovalGroup(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-defs`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteApprovalGroup(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-defs/del-single`, {
    method: 'DELETE',
    body: params,
  });
}

export async function saveApprovalGroupField(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-column-defs/save-single`, {
    method: 'POST',
    body: params,
  });
}

export async function updateApprovalGroupField(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-column-defs/save-single`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteApprovalGroupField(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-column-defs/del-single`, {
    method: 'DELETE',
    body: params,
  });
}

export async function queryDataMaintenanceConfig(params) {
  const { defId, columnType, tenantId } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-datas/column-def-list`, {
    method: 'GET',
    query: { defId, columnType, tenantId },
  });
}

export async function fetchDataMaintenanceData(defId) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-datas/list/${defId}`, {
    method: 'GET',
  });
}

export async function saveDataMaintenanceData(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-datas/save`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteDataMaintenanceData(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/approval-group-datas/batch-del`, {
    method: 'DELETE',
    body: params,
  });
}

export async function addRemind(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/notification/save`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDeployHistory(params) {
  return request(`${prefix}/process/models/definitions`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除流程
 * @async
 * @function deleteProcess
 * @param {object} params - 请求条件
 * @param {!string} params.tenantId - 租户ID
 * @param {!string} parmas.modelId - 流程Id
 * @returns {object} fetch Promise
 */
export async function deleteProcess(params) {
  const { modelId, record } = params;
  return request(`${prefix}/process/models/${modelId}`, {
    method: 'DELETE',
    body: record,
  });
}

export async function addProcess(params) {
  return request(`${prefix}/process/models`, {
    method: 'POST',
    body: { ...params.process },
  });
}

/**
 * 保存设置
 */
export async function saveProcessSetting({ modelId, ...other }) {
  return request(`${prefix}/process/models/${modelId}`, {
    method: 'POST',
    body: other,
  });
}

/**
 * 复制流程
 * @async
 * @function fetchDocuments
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function copyValue(params) {
  return request(`${prefix}/process/models/reproduction`, {
    method: 'POST',
    query: params,
  });
}

export async function releaseProcess(params) {
  return request(`${prefix}/process/models/${params.modelId}/deploy`, {
    method: 'POST',
  });
}

export async function importProcess(params) {
  return request(`${prefix}/process/models/upload`, {
    method: 'POST',
    body: params,
  });
}

export async function queryProcessAppoint(params) {
  return request(`${prefix}/process-assign/approve-flow/detail`, {
    method: 'GET',
    query: params,
  });
}

/* 详情查询
 * @async
 * @function fetchDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchDetail(params) {
  return request(`${prefix}/service/${params.serviceId}`, {
    method: 'GET',
    query: params,
  });
}

// 审批组下拉框
export async function getApprovalGroupList({ sourceId }) {
  return request(`${prefix}/service/approvel-groups/${sourceId}`, {
    method: 'GET',
  });
}

// 审批人下拉框
export async function getApproverList({ defId }) {
  return request(`${prefix}/service/approvel-group-column/${defId}`, {
    method: 'GET',
    query: { columnType: 'OUTPUT' },
  });
}

export async function createService(params) {
  return request(`${prefix}/service`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateService
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function updateService(params) {
  return request(`${prefix}/service/${params.serviceId}`, {
    method: 'PUT',
    body: params,
  });
}

export async function saveStartupRuleType(params) {
  return request(`${prefix}/process-assign/save-single`, {
    method: 'POST',
    body: params,
  });
}

export async function saveVariableConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-variable`, {
    method: 'POST',
    body: params,
  });
}

export async function updateVariableConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-variable`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteVariableConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-variable`, {
    method: 'DELETE',
    body: params,
  });
}

export async function deleteService(params) {
  return request(`${prefix}/service/${params.serviceId}`, {
    method: 'DELETE',
    body: params,
  });
}

export async function queryVariableConfig(params) {
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/process-assign-variable/${params.procAssignConfId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function saveRuleConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-rule`, {
    method: 'POST',
    body: params,
  });
}

export async function updateRuleConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-rule`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteRuleConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-rule`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 获取流程变量
 * @async
 * @function fetchDocuments
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchVariable(params) {
  return request(`${prefix}/service/interface/variable`, {
    method: 'GET',
    query: params,
  });
}

// 同步参数
export async function syncParam({ serviceId, interfaceId }) {
  return request(`${prefix}/service/${serviceId}/${interfaceId}`, {
    method: 'GET',
  });
}

// 根据接口定义查询参数
export async function queryParams(params) {
  return request(`${prefix}/service/interface/parameter`, {
    method: 'GET',
    query: params,
  });
}

// 查询流程分类详情
export async function fetchDetailHeader(query) {
  const { categoryId } = query;
  return request(`${prefix}/process/categories/${categoryId}`, {
    method: 'GET',
  });
}

// 查询流程分类详情列表
export async function fetchDetailList(params) {
  const { sourceType, sourceId, tenantId } = params;
  return request(`${prefix}/process/variables/${sourceId}/${sourceType}/list`, {
    method: 'GET',
    query: Number(tenantId) === 0 || tenantId ? { tenantId } : {},
  });
}

// 保存外部审批配置
export async function saveExternalSystemApproveConfig(params) {
  return request(`${prefix}/export-workflow-config-details/save`, {
    method: 'POST',
    body: params,
  });
}

// 删除外部审批配置行
export async function deleteExternalSystemApproveConfigLine(params) {
  const { id } = params;
  return request(`${prefix}/export-workflow-configs/delete-single`, {
    method: 'DELETE',
    body: params,
    query: { id },
  });
}

// 数据维护 数据导出
export function exportData(params = {}, queryData) {
  return downloadFileByAxios({
    requestUrl: `${prefix}/approval-group-datas/out`,
    method: 'POST',
    queryParams: Object.entries(params).map(([name, value]) => ({ name, value })),
    queryData,
  });
}

// 数据维护 模板导出
export function exportTemplate({ params, queryData }) {
  return downloadFileByAxios({
    requestUrl: `${prefix}/approval-group-datas/template`,
    method: 'POST',
    queryParams: Object.entries(params).map(([name, value]) => ({ name, value })),
    queryData,
  });
}

export async function saveDefaultExpressionEngine(params) {
  return request(`/marmot/v1/${organizationId}/marmot-expression-engine/condition`, {
    method: 'POST',
    body: params,
  });
}

// 流程定义导出按钮
export async function handleExport(params) {
  const { queryFrom, lastVersionFlag, ...othersParams } = params;
  return request(`${prefix}/process-services/service/export`, {
    method: 'POST',
    body: { ...queryFrom, lastVersionFlag },
    query: othersParams,
  });
}

/**
 * 校验发布流程
 * @async
 * @function verifyReleaseProcess
 * @param {!string} parmas.modelId - 流程Id
 */
export async function verifyReleaseProcess(params) {
  return request(`${prefix}/process/models/${params.modelId}/verify`, {
    method: 'POST',
  });
}
