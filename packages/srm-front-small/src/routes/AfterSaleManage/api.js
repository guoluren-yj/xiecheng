import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM, SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 当前公司值集查询
export async function fetchCurrentCompany() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
  });
}

// 售后明细查询
export async function fetchSaleDetail(afsId) {
  return request(`${SRM_MALL}/v1/${organizationId}/after-sales/${afsId}/detail`, {
    method: 'GET',
  });
}

// 修改售后单状态
export async function updateSaleStatus(afsId, params) {
  return request(`${SRM_MALL}/v1/${organizationId}/after-sales/update-status/${afsId}`, {
    method: 'POST',
    body: params,
  });
}

// 提交运单
export async function submitWayBill(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/after-sale-waybills`, {
    method: 'POST',
    body: params,
  });
}
