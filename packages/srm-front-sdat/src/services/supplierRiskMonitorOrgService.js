/**
 * payConfigService
 * @author Zip <zepeng.huang@hand-china.com>
 * @date 2019-06-13
 * @copyright 2019-05-28 © HAND
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 查询表情态度列表
 * @async
 * @function getMsgByLovCode
 * @param {Object} params
 */
export async function getMsgByLovCode(params) {
  return request(`/hpfm/v1/lovs/data?lovCode=${params?.code ?? ''}`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 查询表情态度列表
 * @async
 * @function getRiskLevelDistribution
 * @param {Object} params
 */
export async function getRiskLevelDistribution(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/level-report`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 新增舆情分布列表
 * @async
 * @function getAddPublicOpinionDistribution
 * @param {Object} params
 */
export async function getAddPublicOpinionDistribution(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/news-report`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 风险事件趋势数据
 * @async
 * @function getRiskStuffTrendData
 * @param {Object} params
 */
export async function getRiskStuffTrendData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/events-trend`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 风险级别分布数据
 * @async
 * @function getRiskLevelDistributionData
 * @param {Object} params
 */
export async function getRiskLevelDistributionData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/event-level-export`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 风险类型分布数据
 * @async
 * @function getRiskTypeDistributionData
 * @param {Object} params
 */
export async function getRiskTypeDistributionData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/dimension-export`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 获取时间
 * @async
 * @function getUpdateTime
 * @param {Object} params
 */
export async function getUpdateTime(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/monitor-update-time`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 获取时间
 * @async
 * @function getIfPermitted
 * @param {Object} params
 */
export async function getIfPermitted(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/check-order`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}
