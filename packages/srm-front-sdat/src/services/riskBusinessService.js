/**
 * 风险定义 监控企业
 * @date: 2023-04-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';

const tenantId = getCurrentOrganizationId();
const { id: userId, realName, loginName } = getCurrentUser();

const commonParam = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 查询列表
 * @async
 * @function fetchRemoveItem
 * @param {Object} params - 查询参数
 */
export async function fetchRemoveItem(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/remove-monitor`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
      operateName: realName,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 查询列表
 * @async
 * @function getRiskScanUrl
 * @param {Object} params - 查询参数
 */
export async function getRiskScanUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/risk-scan/risk-scan-url`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 获取报告下载列表
 * @async
 * @function getDownLoadUrl
 * @param {Object} params - 查询参数
 */
export async function getDownLoadUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/credit-qcc/download-url`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 添加企业
 * @async
 * @function fetchAddBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/add-monitor`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 监控管理 人员tab页 添加企业
 * @async
 * @function fetchAddBusiness2
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness2(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/add-monitor`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

/**
 * 查询匹配到的企业
 * @async
 * @function fetchMatchBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchMatchBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/batch-fuzzy-search`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 查询租户添加的剩余额度
 * @async
 * @function fetchAddedCount
 * @param {Object} params - 查询参数
 */
export async function fetchAddedCount(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/query-monitor-quota`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 获取企业等级页面连接
 * @async
 * @function getBusinessLevelUrl
 * @param {Object} params - 查询参数
 */
export async function getBusinessLevelUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/credit-qcc/risk-level-setting-url`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}
