/**
 * authorityManagementService - 租户级权限维护 - service
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

export async function fetchTabList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/doc-type/dimension/role/${params.roleId}`, {
    method: 'GET',
  });
}
export async function queryCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${params.roleId}/authority-org`, {
    method: 'GET',
    query: params,
  });
}

export async function updateCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${params.roleId}/authority-org`, {
    method: 'POST',
    body: params.checkList,
  });
}

export async function queryData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/authority`, {
    method: 'GET',
    query: param,
  });
}

export async function saveData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/role/${params.roleId}/authority?authorityTypeCode=${params.authorityTypeCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function deleteData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${params.roleId}/authority`, {
    method: 'DELETE',
    body: params.deleteRows,
  });
}

export async function changeAuthority(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/role/${params.roleId}/authority/exchange?exchanageroleId=${params.exchanageroleId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function copyAuthority(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${params.roleId}/copy`, {
    method: 'POST',
    body: params.copyRoleIdList,
  });
}

export async function queryUserInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/role/${params.roleId}/info`, {
    method: 'GET',
  });
}

export async function queryCompanyModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/customers`, {
    method: 'GET',
    query: param,
  });
}

export async function querySupplierModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/suppliers`, {
    method: 'GET',
    query: param,
  });
}

export async function queryPurorgModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/purorgs`, {
    method: 'GET',
    query: param,
  });
}

export async function queryPuragentModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/puragents`, {
    method: 'GET',
    query: param,
  });
}

export async function queryPurcatModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/purcats`, {
    method: 'GET',
    query: param,
  });
}

/**
 * queryValueListModalData
 * @param {object} params - 值集新建数据
 */
export async function queryValueListModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/lovs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询值集视图
 * queryLovViewModalData
 * @param {object} params - 值集视图新建数据
 */
export async function queryLovViewModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/lov-views`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询数据源
 * queryLovViewModalData
 * @param {object} params - 数据源新建数据
 */
export async function queryDataSourceModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/datasources`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询数据组新建弹窗数据
 * queryDataGroupModalData
 * @param {object} params - 数据组新建数据
 */
export async function queryDataGroupModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/data-group`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询供应商数据
 * queryVendorModalData
 * @LastEditors: 24517-黄锦
 * @param {object} params - 新建数据
 */
export async function queryVendorModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/suppliers`, {
    method: 'GET',
    query: param,
  });
}

// 客户 - Custom
export async function queryCustomModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/custom`, {
    method: 'GET',
    query: param,
  });
}
export async function updateCustom(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/custom`, {
    method: 'GET',
    query: param,
  });
}

//  PurchaseCategory
export async function queryPurchaseCategoryModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/purchase_category`, {
    method: 'GET',
    query: param,
  });
}
export async function updatePurchaseCategory(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/purchase_category`, {
    method: 'GET',
    query: param,
  });
}

// PurItem
export async function queryPurItemModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/vendors`, {
    method: 'GET',
    query: param,
  });
}
export async function updatePurItem(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/vendors`, {
    method: 'GET',
    query: param,
  });
}

// VendorItem
export async function queryVendorItemModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/vendors`, {
    method: 'GET',
    query: param,
  });
}
export async function updateVendorItem(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/vendors`, {
    method: 'GET',
    query: param,
  });
}

// VendorSite
export async function queryVendorSiteModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/vendors`, {
    method: 'GET',
    query: param,
  });
}
export async function updateVendorSite(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/vendors`, {
    method: 'GET',
    query: param,
  });
}

// 查询组织架构－公司，添加到组织架构－公司组中
export async function queryGroupModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/group`, {
    method: 'GET',
    query: param,
  });
}

// 查询岗位，添加到组中
export async function queryPositionModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/position`, {
    method: 'GET',
    query: param,
  });
}

// 查询员工，添加到组中
export async function queryEmployeeModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/employee`, {
    method: 'GET',
    query: param,
  });
}

// 查询部门，添加到组中
export async function queryUnitModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/unit`, {
    method: 'GET',
    query: param,
  });
}

// 查询采购物料，添加到组中
export async function queryPurchaseItemModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/role/${param.roleId}/data/purchase-item`, {
    method: 'GET',
    query: param,
  });
}
