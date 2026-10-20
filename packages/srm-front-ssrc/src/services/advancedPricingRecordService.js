/**
 * service - 价格公式管理
 * @date: 2018-12-26
 * @version: 0.0.1
 * @author: lichao
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPC}/v1`;

/**
 * 重新执行
 * @export
 * @param {Object} data
 * @returns
 */
export async function retry(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-adjust-records/retry`, {
    method: 'POST',
    body: data,
  });
}
