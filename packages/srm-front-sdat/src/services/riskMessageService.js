/**
 * 风险工作台
 * @date: 2023-04-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchDynamicDetail: 查询风险事件详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchDynamicDetail(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process/${
      params.riskEventId
    }/event-detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}
