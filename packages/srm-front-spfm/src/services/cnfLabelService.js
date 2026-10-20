/**
 * cnfLabelService.js - 业务规则定义标签 service
 * @date: 2020-09-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 保存
 * @param {Object} params
 */
export async function saveCnfLabel(params) {
  return request(`${SRM_PLATFORM}/v1/cnf-labels`, {
    method: 'POST',
    body: params,
  });
}
