/**
 * service - 供应商生命周期申请单查询
 * @date: 2018-9-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { parseParameters } from 'utils/utils';

const prefix = `${SRM_SSLM}/v1`;

/**
 * 供应商生命周期申请单查询
 * @async
 * @function searchLifeStage
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {!string} params.stageId - 阶段Id
 * @returns {object} fetch Promise
 * /v1/{organization}/life-cycle-reqss
 */
export async function searchApplyForm(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-reqss`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
