/**
 * ecCompanyOrderQuery -订单查询
 * @date: 2019-08-27
 * @author  <xia.li05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 数据查询
 * @async
 * @function fetchCompanyBannerList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchCompanyBannerList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/mall-order`, {
    method: 'GET',
    query: { ...param },
  });
}
