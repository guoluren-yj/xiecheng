import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 获取老订单工作台租户配置表
export async function fetchOrderConfig(params) {
  const tableCode = 'spuc_old_order_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

//
export async function fetchSalesOrderConfig(params) {
  const tableCode = 'spuc_old_order_confirm_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}
