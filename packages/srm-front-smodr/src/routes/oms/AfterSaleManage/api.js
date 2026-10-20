import request from 'utils/request';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

// 当前公司值集查询
export async function fetchCurrentCompany() {
  return request(`/hpfm/v1/lovs/sql/data?lovCode=HPFM.COMPANY&tenantId=${tenantId}`, {
    method: 'GET',
  });
}

// 售后明细查询
export async function fetchSaleDetail(afterSaleId, customizeUnitCode) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/detail`, {
    method: 'GET',
    query: { afterSaleId, customizeUnitCode },
  });
}

// 采购方售后明细查询
export async function fetchSupSaleDetail(afterSaleId) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/supplier-detail`, {
    method: 'GET',
    query: { afterSaleId },
  });
}

// 修改售后单状态
export async function updateSaleStatus(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/supplier-approve`, {
    method: 'POST',
    body: { ...params },
    // responseType: 'text',
  });
}

// 修改接收
export async function updateAcceptStatus(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/supplier-result`, {
    method: 'POST',
    body: { ...params },
    // responseType: 'text',
  });
}

// 提交运单
export async function submitWayBill(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/after-sale-waybills`, {
    method: 'POST',
    body: params,
  });
}
