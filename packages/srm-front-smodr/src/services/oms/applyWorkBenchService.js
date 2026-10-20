
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function handleSave(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/save`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleSubmit(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/submit`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleSendBack(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/submit-return`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleBatchSubmit(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/batch-submit`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleCancel(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/cancel`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleLineCancel(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/cancel`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleSearchData(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/link-order/${params.requestEntryId}`;
  return request(url, {
    method: 'GET',
    // body: params,
  });
}

export async function receiveConfirm(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/to-receive`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function addressCheck(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/address-check`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleLineDelete(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/delete`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function fetchExecuteData(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-request-entry-details/execute-result`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export async function handleToRetry(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/conversion`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function fetchEcRecord(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-request-entry-records/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 商城订单详情变更记录
export async function fetchOrderUpdateRecord(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/order-change-records/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export async function fetchApproveRecord(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/mall-requests/approval-progress`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}