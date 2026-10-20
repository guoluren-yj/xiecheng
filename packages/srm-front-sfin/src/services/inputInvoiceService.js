/**
 * Bill - 我开具的税务发票
 * @date: 2019-09-19
 * @author: junchaozhou <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

/**
 * 查询开票头信息
 *
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
const organizationId = getCurrentOrganizationId();

// 查询列表数据
export async function fetchMaintain(params) {
  const { type, ...query } = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/input-invoice`, {
    method: 'GET',
    query,
  });
}
