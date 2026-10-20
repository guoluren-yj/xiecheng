/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询列表数据
export async function onFetchList(params) {
  const { type, ...query } = parseParameters(params);
  const customizeUnitCode = 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.GRID';
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/query-invoice`, {
    method: 'GET',
    query: {
      customizeUnitCode,
      ...query,
    },
  });
}

/**
 *  新建跳明细页面数据
 * */
export async function newDetailList(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/create`, {
    method: 'POST',
    body,
  });
}

export async function removeInvoiceOrNot(params) {
  const { interfaceName, createRowKeys } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}${interfaceName}`, {
    method: 'POST',
    body: createRowKeys,
  });
}
