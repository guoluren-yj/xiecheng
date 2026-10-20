/**
 * service 考评结果查询
 * @date: 2018-12-29
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import request from 'utils/request';
// import { SRM_SSLM } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * @async
 * @function querySupplierAnnual
 * @param {?string} tenantId - 租户id
 * @param {?string} params - 查询参数
 * @param {?string} params - 来源
 * @returns {Object} fetch promise
 */
export async function queryList(params) {
  const { tenantId, problemHeaderId } = parseParameters(params);
  return request(
    `/sqam/v1/${tenantId}/problem-headers/associate/kipEvalHeader/${problemHeaderId}`,
    {
      method: 'GET',
      // query: params,
    }
  );
}
