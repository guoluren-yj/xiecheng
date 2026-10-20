/* eslint-disable no-param-reassign */
/**
 * 风险定义
 * @date: 2023-03-15
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchSaveStepOne: 保存使用范围数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveStepOne(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/save-or-update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchSaveStepTwo: 保存外部风险数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveStepTwo(params) {
  const { pageType } = params;
  let url = `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/save-risk-rule`;

  if (pageType === 'edit') {
    url = `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/update-risk-rule`;
  }

  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchSaveStepThree: 保存业务风险数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveStepThree(params) {
  const { editType } = params;

  let url = `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/save-risk-rule`;

  if (editType === 'edit') {
    url = `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/update-risk-rule`;
  }

  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询风险详情数据(编辑)
 * @param {*} params
 * @returns
 */
export async function fetchRiskDetail(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/risk-rule-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询风险详情数据(默认)
 * @param {*} params
 * @returns
 */
export async function fetchRiskDefault(params = {}) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/risk-rule-default`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询风险详情数据(适用范围)
 * @param {*} params
 * @returns
 */
export async function fetchScopeDetail(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/risk-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询经办人列表
 * @param {*} params
 * @returns
 */
export async function fetchPersonList(params = {}) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define-theme-person/query-person`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 保存经办人列表
 * @param {*} params
 * @returns
 */
export async function fetchSavePerson(params = {}) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define-theme-person/save-person`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 启用禁用
 * @param {*} params
 * @returns
 */
export async function fetchUpdateEnabled(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/update-status`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取动态主题列表
 * @param {*} params
 * @returns
 */
export async function getThemeList(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/query-theme-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询事件树形数据
 * @param {*} params
 * @returns
 */
export async function fetchEventTree(params = {}) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/theme-code-lov`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询订单状态
 * @param {*} params
 * @returns
 */
export async function fetchOrderStatus(params = {}) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/workbench-service-open`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询适用范围可选范围
 * @param {*} params
 * @returns
 */
export async function fetchScopeMap(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/query-scope`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询使用旧菜单租户配置表
 * @param {*} params
 * @returns
 */
export async function fetchTenantList(params = {}) {
  return request(
    `/spfm/v1/${getCurrentOrganizationId()}/rel-table-records/sdat_risk_workplace_old_tenant/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}
