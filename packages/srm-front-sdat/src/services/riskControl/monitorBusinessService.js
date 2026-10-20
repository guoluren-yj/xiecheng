/**
 * monitorService
 * @author qingxiang.luo@going-link.com
 * @date 2022-09-07
 * @copyright 2022 © ZhenYun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 查询列表
 * @async
 * @function getRiskScanUrl
 * @param {Object} params - 查询参数
 */
export async function getRiskScanUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-scan/risk-scan-url`, {
    method: 'GET',
    query: {
      ...params,
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
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/credit-qcc/download-url`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询列表
 * @async
 * @function fetchRemoveItem
 * @param {Object} params - 查询参数
 */
export async function fetchRemoveItem(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-enterprise/remove-monitor`,
    {
      method: 'POST',
      body: {
        ...params,
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
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-enterprise/add-monitor`,
    {
      method: 'POST',
      body: {
        ...params,
      },
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
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-enterprise/batch-fuzzy-search`,
    {
      method: 'GET',
      query: {
        ...params,
      },
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
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-enterprise/query-monitor-quota`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 获取企业等级页面连接
 * @async
 * @function getBusinessLevelUrl
 * @param {Object} params - 查询参数
 */
export async function getBusinessLevelUrl(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/credit-qcc/risk-level-setting-url`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}
