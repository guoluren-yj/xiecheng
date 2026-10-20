import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId, realName, loginName } = getCurrentUser();

const commonParam = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 查询监控额度
 * @async
 * @function fetchGetQuota
 * @param {Object} params - 查询参数
 */
export async function fetchGetQuota(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/query-monitor-quota`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 移除监控
 * @param {*} params
 * @returns
 */
export async function fetchRemoveMonitor(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/remove-monitor`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询匹配到的企业
 * @async
 * @function fetchMatchBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchMatchBusiness(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/fuzzy-supplier`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询租户添加的剩余额度
 * @async
 * @function fetchAddedCount
 * @param {Object} params - 查询参数
 */
export async function fetchAddedCount(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/query-monitor-quota`,
    {
      method: 'GET',
      query: {
        ...params,
        ...commonParam,
        userName: realName,
        loginName,
      },
    }
  );
}

/**
 * 添加企业
 * @async
 * @function fetchAddBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/add-monitor`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
      userName: realName,
      loginName,
    },
  });
}
