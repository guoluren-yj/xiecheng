import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 新建调价单
export function createPriceAdjustment(params, customizeUnitCode) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/pool/create`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

// 保存调价单
export function savePriceAdjustment(params, customizeUnitCode) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/pool/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

// 发布
export function realsePriceAdjustment(params, customizeUnitCode) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/publish`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

// 退回
export function rollBackPriceAdjustment(params, customizeUnitCode) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/pool/return`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

// 新建
export async function handleCreate(params, customizeUnitCode) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/create`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 价格库-适用范围-查询tab标签
 * @async
 * @function fetchScopeTabs
 */
export async function queryScopeTabs(params) {
  const url = `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment-scopes`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 适用范围-保存新增维度tab
 * @async
 * @function saveAddTab
 */
export async function saveAddTabs(params) {
  const url = `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment-scopes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 适用范围 - 删除tab
 * @async
 * @function deleteTab
 */
export async function deleteTab(params) {
  const url = `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment-scopes`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 适用范围-保存引用
 * @async
 * @function saveIntroduce
 */
export async function saveIntroduce(params) {
  const url = `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment-scopes/line`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-适用范围-获取lov配置头
 * @async
 * @function fetchLovConfig
 */
export async function fetchLovConfig(params) {
  const url = `/hpfm/v1/${getCurrentOrganizationId()}/lov-view/info`;
  return request(url, {
    method: 'GET',
    query: { ...params, tenantId: getUserOrganizationId() },
  });
}

/**
 * 价格库-适用范围-加入全部
 * @async
 * @function saveJoinAll
 */
export async function saveJoinAll(params) {
  const url = `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment-scopes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

//  保存
export async function handleSave(params, customizeUnitCode) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/update`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

// 查询页签数量
export async function queryCount() {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/count`, {
    method: 'GET',
  });
}

// 删除前校验
export async function deleteCheck(params) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/check`, {
    method: 'POST',
    body: params,
  });
}

// 删除
export async function deleteWholeDoc(params) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/delete`, {
    method: 'POST',
    body: params,
  });
}

// 整单取消
export async function cancelWholeDoc(params) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 取价
export async function adjustPrice(params) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/adjust`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 调价单-审批历史
 * @async
 * @function fetchHistoryInfo
 */
export async function fetchHistoryInfo(params) {
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/export-workflow-comments/get-comments-by-businesskey?businesskey=${params}&needMerge=true&commentRecordFlag=true&commentStartFlag=true`,
    {
      method: 'GET',
    }
  );
}

// 调价单-操作记录
export async function fetchOperationRecords(params) {
  const { docType } = params;
  let url = `${SRM_SPC}/v1/${organizationId}/price-adjustment-action/list`;
  switch (docType) {
    case 'SERVICE':
      url = `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-actions/list`;
      break;
    case 'BOMVIEW':
      url = `${SRM_SPC}/v1/${organizationId}/price-lib-action/list`;
      break;
    default:
      break;
  }
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 调价单-撤销审批
export async function revokeWorkflow(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-adjustment/revocation`;
  return request(url, {
    method: 'POST',
    query: params,
  });
}

/**
 * 是否允许撤销
 * @param {*} params
 */
export async function operationRevoke(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 重新同步价格库
 * @param {*} params
 */
export async function reSyncPriceLib(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-adjustment/re-sync-price-lib`, {
    method: 'POST',
    body: params,
  });
}
