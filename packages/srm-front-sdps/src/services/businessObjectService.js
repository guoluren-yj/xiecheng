// 维护业务对象接口
import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';

/**
 * fetchAudit: 审核数据列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAudit(params) {
  return request(`${SRM_DATA_PROCESS}/v1/audit-center/batch-audit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * getCombinationBOList: 获取模型对象列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getCombinationBOList(params) {
  return request(params.url, {
    method: 'GET',
    query: {
      ...params,
      url: '',
    },
  });
}
