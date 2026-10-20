import request from 'utils/request';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID
const userOrganizationId = getUserOrganizationId();

export async function fetchAfterSaleData(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/detail`, {
    method: 'GET',
    query: params,
  });
}
export async function fetchSupAddress(params) {
  return request(
    `${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss/${userOrganizationId}/list-all`,
    {
      method: 'GET',
      query: { supplierCompanyId: params },
    }
  );
}
export async function fetchSupAddressList(params) {
  return request(
    `${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss/${userOrganizationId}/list`,
    {
      method: 'GET',
      query: { supplierCompanyId: params },
    }
  );
}

export function fetchCode() {
  const url = `/hpfm/v1/${organizationId}/lovs/data`;
  return request(url, {
    method: 'GET',
    query: { lovCode: 'HPFM.IDD' },
  });
}

export function fetchCountry() {
  const url = `/hpfm/v1/${organizationId}/lovs/data`;
  return request(url, {
    method: 'GET',
    query: { lovCode: 'HPFM.COUNTRY', condition: 'CN' },
  });
}

export function fetchCityInfoService(params) {
  const url = `/smal/v1/mall-regions/${organizationId}/Subordinate`;
  return request(url, {
    method: 'GET',
    query: { page: -1, ...params },
  });
}

export async function createAddress(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchAddressDetail(supplierAddressId) {
  return request(
    `${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss/${supplierAddressId}`,
    {
      method: 'GET',
    }
  );
}

export async function setDefault(data) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss`, {
    method: 'PUT',
    body: data,
  });
}
