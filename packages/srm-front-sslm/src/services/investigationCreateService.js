/**
 * service 调查表创建发布
 * @date: 2018-8-13
 * @version: 0.0.1
 * @author:  dengtingmin <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * fetchInvestigateList - 查询调查表列表
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchInvestigateList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate`, {
    method: 'GET',
    query: param,
  });
}

/**
 * investigateRelease - 批量发布调查表
 * @async
 * @param {Object} params - 查询参数
 */
export async function investigateRelease(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate/batch-release`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * investigateDelete - 批量删除调查表
 * @async
 * @param {Object} params - 查询参数
 */
export async function investigateDelete(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate`, {
    method: 'DELETE',
    body: params.body,
  });
}

/**
 * investigateCreate - 批量确认但不发布调查表
 * @async
 * @param {Object} params - 查询参数
 */
export async function investigateCreate(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate`, {
    method: 'POST',
    body: params.body,
    query: { customizeUnitCode },
  });
}

/**
 * investigateCreateAndRelease - 批量确认并且发布调查表
 * @async
 * @param {Object} params - 查询参数
 */
export async function investigateCreateAndRelease(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate/save-release`, {
    method: 'POST',
    body: params.body,
    query: { customizeUnitCode },
  });
}

/**
 * selectSupplierLov - 供应商选择lov
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSupplierLovData(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/supplier-company`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询供应商分类
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSupplierClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 树结构查询供应商分类
 * @export
 * @param {*} params
 * @returns
 */
export async function fetTreeSupplierClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/treePage`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商管控维度配置
 * @export
 * @returns
 */
export async function fetchLifeCycleDimConfigs() {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-configs`, {
    method: 'GET',
  });
}

/**
 * 工作台新建时查询供应商信息
 * @param {*} sourceType 来源，GUIDE-工作台-操作指引
 */
export async function querySupplierInfo(params) {
  const { sourceType, ...rest } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/${
      sourceType === 'GUIDE' ? 'intro-supplier-company-info' : 'line-company-info'
    }`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 * 查询供应商管控维度配置
 * @export
 * @returns
 */
export async function getUserDefaultMsg() {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/getUserAndUserMasterUnit`, {
    method: 'GET',
  });
}

// 校验供应商信息
export async function checkSupplier(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/synergy-check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * investigateCreateAndRelease - 校验和名单
 * @async
 * @param {Object} params - 查询参数
 */
export async function checkReleaseBlackSupplier(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/save-release-check`, {
    method: 'POST',
    body: params.body,
  });
}
