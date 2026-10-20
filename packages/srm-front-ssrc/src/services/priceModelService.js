import request from 'utils/request';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 发布价格模型
 */
export async function releasePriceModel(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-models/release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 解锁价格模型
 */
export async function unlockPriceModel(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-models/unlock`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询模块列表
 */
export async function fetchModuleList(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-model-modules/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除模块
 */
export async function deleteModule(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-model-modules`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 保存模块
 */
export async function saveModule(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-model-modules/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询所有报价明细列-不带分页参数的
 */
export async function fetchAllColumns(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-model-quo-columns/list/all`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存写入价格库
 */
export async function saveTargetPriceTemplate(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-models/confirm/price-lib`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 维护-保存
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveUpdate(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-models/save/all`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询所有可选择的参数
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryParamsAll(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-models/params/all`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询模块和行信息
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchModuleIncludeLines(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-model-modules/list/include-lines`, {
    method: 'GET',
    query: params,
  });
}
