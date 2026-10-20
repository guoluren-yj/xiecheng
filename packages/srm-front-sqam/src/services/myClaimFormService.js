import request from 'utils/request';
import { SRM_SQAM, SRM_SSTA } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const organizationId = getCurrentOrganizationId();

export async function print(formHeaderId) {
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/purchase/detail/${formHeaderId}/print`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}

export async function fetchMyClaim(params) {
  const param = parseParameters(params);
  const { customizeUnitCode, ...otherParams } = param;
  return request(
    `${prefix}/${organizationId}/claim-form/purchase/page?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

export async function searchDetail(params) {
  const param = parseParameters(params);
  const customizeUnitCode = param?.customizeUnitCode
    ? param.customizeUnitCode
    : 'SQAM.CLAIM_FORM_DETAIL.BASIC_INFO';
  if (param?.customizeUnitCode) delete param.customizeUnitCode;
  return request(
    `${prefix}/${params.tenantId}/claim-form/purchase/detail/${params.formHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

export async function fetchOperationRecord(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/claim-form-records/${params.formHeaderId}/records`, {
    method: 'GET',
    query: param,
  });
}
// 撤回
export async function reCallMyClaim(params) {
  const { body, customizeUnitCode } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/undo?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

export async function fetchClaimProject(params) {
  const param = parseParameters(params);
  return request(
    `${prefix}/${organizationId}/claim-form-lines/purchase/detail/${params.formHeaderId}/items`,
    {
      method: 'GET',
      query: param,
    }
  );
}
/**
 * 查询供应商列表
 * @param {Object} params - 请求参数
 */
export async function myClaimFormSync(params) {
  // const { selectedRowKeys = [] } = params;
  return request(`${prefix}/${organizationId}/claim-form/sync`, {
    method: 'POST',
    body: params,
  });
}

// 同步外部系统
export async function myClaimFormSyncExternal(params) {
  // const { selectedRowKeys = [] } = params;
  return request(`${prefix}/${organizationId}/claim-form/export/external`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchChargeLine(params) {
  return request(`${SRM_SSTA}/v1/${organizationId}/charge-lines/charge-info`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchBillLine(params) {
  return request(`${SRM_SSTA}/v1/${organizationId}/bill-lines/bill-info`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchInvoiceLine(params) {
  return request(`${SRM_SSTA}/v1/${organizationId}/settle-lines/invoice-info`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchPaymentLine(params) {
  return request(`${SRM_SSTA}/v1/${organizationId}/settle-lines/payment-info`, {
    method: 'POST',
    body: params,
  });
}

// 取消我发起的索赔单
export async function myClaimFormCancel(params) {
  const { body, customizeUnitCode } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/confirm/cancel?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

// 时间调整
export async function myClaimAdjustTime(body) {
  return request(`${prefix}/${organizationId}/claim-form/update-feedback-date`, {
    method: 'PUT',
    body,
  });
}
