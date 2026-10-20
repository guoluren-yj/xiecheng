import request from 'utils/request';
import { SRM_SPCT } from '@/utils/config';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchOrderData(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/payment-orders/detail/${params}`, {
    method: 'GET',
    // query: params,
  });
}

export async function fetchPaymentData(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/configs/new-select-page`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchPayStatus(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/basepay/pay-new-query`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchLogo(params) {
  return request(`${SRM_MALL}/v1/mall-page-configs/new/mall-config`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchVerify(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/basepay/pay-check/${params}`, {
    method: 'GET',
  });
}

export async function handlePay(params) {
  const { paymentOrderNum, ...others } = params;
  return request(`${SRM_SPCT}/v1/${organizationId}/basepay/pay-new/${paymentOrderNum}`, {
    method: 'GET',
    query: { ...others },
    responseType: 'text',
  });
}

export async function fetchData(param) {
  return request(`${SRM_SPCT}/v1/${organizationId}/cashier-configs/${param}`, {
    method: 'GET',
  });
}

export async function updateData(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/cashier-configs/createToUpdate`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteData(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/cashier-configs/delete/${params}`, {
    method: 'GET',
  });
}

export async function deleteLineData(params) {
  return request(
    `${SRM_SPCT}/v1/${organizationId}/cashier-configs/deleteCashierConfigLink/${params}`,
    {
      method: 'GET',
    }
  );
}

export function searchUuidImage(attachmentUuid, bucketName = 'public-bucket') {
  const url = `/hfle/v1/${organizationId}/files/${attachmentUuid}/file?attachmentUuid=${attachmentUuid}&bucketName=${bucketName}`;
  return request(url);
}

export function deleteUuidImage(
  item,
  attachmentUuid,
  bucketName = 'public-bucket',
  tenantId,
  directory
) {
  const url = `/hfle/v1/${organizationId}/files/delete-by-uuidurl?attachmentUUID=${attachmentUuid}&bucketName=${bucketName}&tenantId=${tenantId}&directory=${directory}`;
  return request(url, {
    method: 'POST',
    body: [item],
    // dataType: 'text',
  });
}

export async function validatePriority() {
  return request(`${SRM_SPCT}/v1/${organizationId}/cashier-configs/validate/priority`, {
    method: 'POST',
  });
}

export async function previewData(cashierConfigSource, srmUrl) {
  return request(
    `${SRM_SPCT}/v1/${organizationId}/cashier-configs/${cashierConfigSource}/homeCashier?srmUrl=${srmUrl}`,
    {
      method: 'GET',
    }
  );
}
