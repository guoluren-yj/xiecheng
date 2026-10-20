/**
 * service - 我收到的索赔单
 * @date: 2019-11-13
 * @version: 0.0.1
 * @author: wuting <ting.wu@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 入口查询
 */
export async function fetchReceivedClaim(params) {
  const param = parseParameters(params);
  const { customizeUnitCode, ...otherParams } = param;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/supplier/page?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 打印
 */
export async function print(formHeaderId) {
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/supplier/detail/${formHeaderId}/print`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}

// 撤回
export async function reCallMyReceivedClaim(params) {
  const { body, customizeUnitCode } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/undo?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 详情头查询
 */
export async function searchDetail(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/supplier/detail/${params.formHeaderId}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 详情操作记录查询
 */
export async function fetchOperationRecord(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form-records/${params.formHeaderId}/records`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 详情行查询
 */
export async function fetchClaimProject(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form-lines/supplier/detail/${params.formHeaderId}/items`,
    {
      method: 'GET',
      query: param,
    }
  );
}
