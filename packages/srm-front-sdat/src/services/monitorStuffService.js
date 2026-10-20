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
    query: { ...params, ...passParams },
  });
}

/**
 * 查询监控事件层级数据
 * @async
 * @function getMonitorStuffData
 * @param {Object} params
 */
export async function getMonitorStuffData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/credit-dimension/dimension-tree`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 获取新闻内容
 * @async
 * @function getNewsContent
 * @param {Object} params
 */
export async function getNewsContent(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/customer-risk-events/event-outer-detail`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}
