/**
 * service 我收到的考评结果查询详情
 * @date: 2018-12-28
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com
 * @copyright: Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
/**
 * 查询考评结果详情
 * @async
 * @function querySupplierResult
 * @param {object} param - 查询参数
 * @param {string} param.id - 查询详情条目Id
 * @returns {object} fetch promise
 */
export async function querySupplierDetail(params) {
  return request(`${SRM_SSLM}/v1/${params.id}/supplier-result`, {
    method: 'GET',
  });
}
/**
 * 查询评分详情
 * @async
 * @function queryScoreDetail
 * @param {string} param.recordId - 查询评分详情条目Id
 * @returns {object} fetch promise
 */
export async function queryScoreDetail(params) {
  return request(`${SRM_SSLM}/v1/${params.recordId}/supplier-result`, {
    method: 'GET',
  });
}
