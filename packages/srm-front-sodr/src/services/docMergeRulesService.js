/**
 * docMergeRules - 对账及开票并单规则 - service
 * @date: 2018-11-12
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_FINANCE } from '_utils/config';
import request from 'utils/request';

/**
 * 查询对账及开票并单规则
 */
export async function queryDocMergeRulesList(params) {
  return request(`${SRM_FINANCE}/v1/${params.organizationId}/doc-merge-rules`, {
    method: 'GET',
    query: params,
  });
}
