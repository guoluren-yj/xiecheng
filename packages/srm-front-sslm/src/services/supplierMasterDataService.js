/**
 * supplierMasterDataService - 供应方供应商主数据查询
 * @date: 2024/02/06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询当前用户子账户权限中与当前租户有合作伙伴的供应商公司信息
export async function fetchDefaultSupplierCompany() {
  return request(`${SRM_SSLM}/v1/${organizationId}/suppliers/default-supplier-company`, {
    method: 'GET',
  });
}

// 查询当前供应有合作伙伴的采购方公司信息
export async function fetchPartnerCompanyInfo(param) {
  return request(`${SRM_SSLM}/v1/${organizationId}/suppliers/partners`, {
    method: 'GET',
    query: param,
  });
}

// 查询企业信息
export async function fetchEnterpriseInfo(param) {
  return request(`${SRM_SSLM}/v1/${organizationId}/suppliers/for-sales`, {
    method: 'GET',
    query: param,
  });
}
