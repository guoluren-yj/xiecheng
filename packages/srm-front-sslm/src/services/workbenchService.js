import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询配置中心，是否开启风险监控
 * @param {Object} params 修改参数
 */
export async function enableAddMonitor(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-function/getSetting`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询配置中心，是否开启风险扫描
 * @param {Object} params 修改参数
 */
export async function enableRiskScan(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan/getSetting`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前租户开通风控的服务
 */
export async function queryRiskMonitorType(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/opened-service-query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前租户开通风控的服务
 */
export async function handleQCCAddMonitor({ supplierCompanyId }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/${supplierCompanyId}/add-monitor`, {
    method: 'POST',
  });
}

/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存分组
 * @param {Object} params 修改参数
 */
export async function saveGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 头新建单据下拉查询
 */
export async function fetchHeaderType(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/header-new-doc`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 行新建单据下拉查询
 */
export async function fetchLineType(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/line-new-doc`, {
    method: 'GET',
    query: params,
  });
}

// 新建生命周期申请单前的校验
export async function verifySupplierLife(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/header-new-check`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询关联单据待处理个数
 */
// export async function fetchDealNum(params) {
//   return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier-to-do-info`, {
//     method: 'GET',
//     query: params,
//   });
// }

/**
 * 校验简易入库 变更信息 是否已存在
 */
export async function verifySupplierUpdate(params) {
  const { supplierId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/change/verify/${supplierId}`,
    {
      method: 'GET',
    }
  );
}

// 本地供应商关联企业
export async function relevantEnterprise(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-suppliers/erps/link`, {
    method: 'POST',
    body: params,
  });
}

// 本地供应商取消关联
export async function cancelRelevant(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-suppliers/erps/unlink`, {
    method: 'POST',
    body: params,
  });
}

// 平台供应商生命周期历史查询
export async function queryLifeCycleHistory(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-Admission`, {
    method: 'GET',
    query: params,
  });
}

// 查询适用阶段
export async function searchStageNodes(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategy-stages/apply-strategy`, {
    method: 'GET',
    query: params,
  });
}

// 查询流程详情
export async function queryStageProcess(params) {
  const { strategyStageProcId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/stage-proc-branchs/${strategyStageProcId}`, {
    method: 'GET',
    query: others,
  });
}

// 查询流程节点
export async function queryProcessNode(params) {
  const { currentProcId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/strategy-execute-records/current-relation/${currentProcId}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 查询流程明细
export async function queryProcessDetail(params) {
  const { currentProcId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/stage-proc-branchs/${currentProcId}/all-detail`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 查询角色菜单权限
export async function queryMenuPermissions(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/menus/permissions`, {
    method: 'POST',
    body: params,
    query: params,
  });
}

// 操作指引校验供应商信息
export async function queryGuideSupplierInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/intro-supplier-info`, {
    method: 'GET',
    query: params,
  });
}

// 本地供应商-更新单据供应商数据
export async function singleUpdateSupplierData(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/external-suppliers/createOrUpdateAssociateRecord`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 批量更新单据供应商数据
export async function batchUpdateSupplierData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-suppliers/createAllAssociateRecord`, {
    method: 'POST',
    body: params,
  });
}

// 平台供应商风险扫描历史查询
export async function queryRiskHistory(params) {
  return request(`/sdat/v1/${organizationId}/risk-report-record/risk-scan-history`, {
    method: 'GET',
    query: params,
  });
}

// 查询关联单据页签数量
export async function queryTabsCount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier/document/count`, {
    method: 'GET',
    query: params,
  });
}
