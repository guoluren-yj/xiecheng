/**
 * 动态监控事件
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
 * 保存监控事件层级数据
 * @async
 * @function saveMonitorStuffData
 * @param {Object} params
 */
export async function saveMonitorStuffData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/credit-event-define/save-dimension`, {
    method: 'POST',
    body: { ...params, ...passParams },
  });
}
