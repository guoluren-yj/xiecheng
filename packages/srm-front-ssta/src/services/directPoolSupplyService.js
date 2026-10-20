import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { headUnitCodes } from '@/routes/NewSupplySettle/Detail/StoreProvider';

const tenantId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${tenantId}`;

export async function getNumber(type) {
  let url = '';
  if (type === 'trash') {
    url = `${prefix}/direct-pool-errors/list`;
  } else {
    url = `${prefix}/direct-pools/list/${type}`;
  }
  return request(url, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

export async function deleteInvoice(params) {
  return request(`${prefix}/direct-pools/cancel`, {
    method: 'DELETE',
    body: params,
  });
}

export async function directInvoice(params) {
  return request(`${prefix}/direct-pools/create-invoice-apply`, {
    method: 'POST',
    body: params,
  });
}

export async function getDetail(applyHeaderId, apiType = 'normal') {
  const url =
    apiType === 'transform'
      ? `${prefix}/direct-invoice-apply-headers/transform/detail/${applyHeaderId}`
      : `${prefix}/direct-invoice-apply-headers/detail/${applyHeaderId}`;
  return request(url, {
    method: 'GET',
    query: { customizeUnitCode: 'SDIM.POOL_SUPPLY_DETAIL.APPLY_HEADER' },
  });
}

export async function save(data, type) {
  return request(
    `${prefix}/direct-invoice-apply-headers/${type === 'CREATE' ? 'create' : 'save'}`,
    {
      method: type === 'CREATE' ? 'POST' : 'PUT',
      body: data,
      // query: { customizeUnitCode },
    }
  );
}

export async function submit(data) {
  return request(`${prefix}/direct-invoice-apply-headers/submit`, {
    method: 'PUT',
    body: data,
    // query: { customizeUnitCode },
  });
}

export async function addLines({ list }) {
  return request(`${prefix}/direct-invoice-apply-lines/create`, {
    method: 'PUT',
    body: list,
  });
}

export async function submitSettle(data) {
  return request(`${prefix}/settle-headers/supplier/invoice/submit`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode: headUnitCodes.INVOICE.join() },
  });
}
