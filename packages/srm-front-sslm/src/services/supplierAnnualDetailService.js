/**
 * service 我收到的年的考评结果详细
 * @date: 2018-12-29
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
/**
 * @async
 * @function querySupplierAnnualDetail
 * @param {!string} param.id - 详情页面Id
 * @returns {object} fetch promise
 */
export async function querySupplierAnnualDetail(params) {
  return request(`${SRM_SSLM}/v1/${params.id}/supplier-annual`, {
    method: 'GET',
  });
}
