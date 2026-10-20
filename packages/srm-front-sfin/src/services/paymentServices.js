import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 校验提交
 * @param {*} params
 */
export async function validateSubmit(params) {
  const customizeUnitCode =
    'SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.HEADER,SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.LINE_SUPPLIER,SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.LINE_CONTRACT,SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.LINE_ORDER';
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/validate-submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
// 创建到票付款提交校验
export async function hasValidateSubmit(params) {
  const customizeUnitCode =
    'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM';
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/validate-submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
export async function batchValidateSubmit(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/batch-validate-submit`, {
    method: 'POST',
    body: params,
  });
}
