/**
 * supplierInvestWorkbenchService - 供应商调查表工作台 - service
 * @date: 2022-11-21
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询公司信息.
 * @export
 */
export async function handleQueryCount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/supplier/work/count`, {
    method: 'GET',
    body: params,
  });
}

/*
 * pdf打印
 */
export async function handlePrint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}/print`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

/*
 * excel打印
 */
export async function handleExcelPrint(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}/config-line-print`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}
