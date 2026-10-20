import request from 'utils/request';
import { getCurrentTenant } from 'utils/utils';
import { SRM_SSTA, SRM_PLATFORM } from '_utils/config';

const { tenantId, tenantNum } = getCurrentTenant();

/**
 * 获取详情
 */
export async function getCuszTemplate(body) {
  return request(`${SRM_SSTA}/v1/customize/template-cusz`, {
    method: 'POST',
    body,
  });
}

// 查询当前租户是否在配置表中配置展示老值集
export async function getSupLovConfig() {
  const configCode = 'source_supplier_lov_old_config';
  return request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum },
  });
}

// 配置表黑名单的租户保留当前逻辑，结算自行查询，非配置表租户，改为调用供应商api&新增的供应商组查询
export async function getBankLovConfig() {
  return request(
    `${SRM_SSTA}/v1/${tenantId}/rel-table/query/ssta_prepayment_queryorder_useoldapi_tenant`,
    {
      method: 'POST',
      body: {
        tenantId,
        map: { tenantNum, funRole: 'PAY_BANK_ACCOUNT_OPTIMIZE' },
      },
    }
  );
}

// 查询当前租户是否在配置表中配置是否使用新的金额计算方法
export async function getCalculateConfig() {
  const configCode = 'ssta_not_base_price_calculate_algorithm';
  return request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum },
  });
}

// 查询配置表 引用事务创建 勾选的阈值
export async function getPaymentCreateSelectConfig() {
  const configCode = 'ssta_document_line_limit';
  return request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum, documentType: 'PAYMENT' },
  });
}


export async function getCreateSelectConfig(isPlatform = false) {
  const configCode = 'ssta_document_line_limit';
  return request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum: isPlatform ? 'SRM' : tenantNum },
  });
}
