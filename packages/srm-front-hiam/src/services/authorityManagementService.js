/**
 * authorityManagementService - 租户级权限维护 - service
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_PLATFORM, SRM_MDM } from '_utils/config';

export async function queryCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/authority-org`, {
    method: 'GET',
    query: params,
  });
}

export async function updateCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/authority-org`, {
    method: 'POST',
    body: params.checkList,
    query: {
      authRoleId: params.authRoleId,
    },
  });
}

export async function queryData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/authority`, {
    method: 'GET',
    query: param,
  });
}

export async function querySupplierData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/authority/supplier`, {
    method: 'GET',
    query: param,
  });
}

export async function queryDataCustomer(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/authority/customer`, {
    method: 'GET',
    query: param,
  });
}

export async function saveData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/authority?authorityTypeCode=${params.authorityTypeCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}
export async function deleteData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/authority`, {
    method: 'DELETE',
    body: params.deleteRows,
    query: {
      authRoleId: params.authRoleId,
    },
  });
}

export async function changeAuthority(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/authority/exchange?exchanageUserId=${params.exchanageUserId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function copyAuthority(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/authority/copy`, {
    method: 'POST',
    body: params.copyUserIdList,
    query: {
      authRoleId: params.authRoleId,
    },
  });
}

export async function queryUserInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/users/${params.userId}/info`, {
    method: 'GET',
    query: params,
  });
}

export async function queryCompanyModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/customers`, {
    method: 'GET',
    query: param,
  });
}

// 查询组织架构－公司，添加到组织架构－公司组中
export async function queryGroupModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/groups`, {
    method: 'GET',
    query: param,
  });
}

// 查询岗位，添加到组中
export async function queryPositionModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/positions`, {
    method: 'GET',
    query: param,
  });
}

// 查询员工，添加到组中
export async function queryEmployeeModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/employees`, {
    method: 'GET',
    query: param,
  });
}

// 查询部门，添加到组中
export async function queryUnitModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/units`, {
    method: 'GET',
    query: param,
  });
}

// 查询采购物料，新建权限
export async function queryPurchaseItemModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/purchase-item`, {
    method: 'GET',
    query: param,
  });
}

export async function querySupplierModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/srm/suppliers`, {
    method: 'GET',
    query: param,
  });
}

// 增加新的查询接口
export async function fetchSupplierModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/srm/suppliers/ctgs`,
    {
      method: 'GET',
      query: param,
    }
  );
}

export async function queryPurorgModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const { cuxQueryUrl, ...param } = parseParameters(params);
  const url = cuxQueryUrl || `${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/purorgs`;
  return request(`${url}`, {
    method: 'GET',
    query: { ...param, tenantId: organizationId },
  });
}

export async function queryPuragentModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/puragents`, {
    method: 'GET',
    query: param,
  });
}

export async function queryPurcatModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(
    `${SRM_MDM}/v1/${organizationId}/item-categories/category-user-authority/${param.userId}`,
    {
      method: 'GET',
      query: param,
    }
  );
}
// 获取数据组弹窗数据
export async function queryDataGroupModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/data-group`, {
    method: 'GET',
    query: param,
  });
}
// 获取数据源数据
export async function queryDataSourceModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/datasources`, {
    method: 'GET',
    query: param,
  });
}

export async function queryLovModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/lovs`, {
    method: 'GET',
    query: param,
  });
}

export async function queryLovViewModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/lov-views`, {
    method: 'GET',
    query: param,
  });
}

// 获取权限维度显示tab页面
export async function queryUserDimension(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/doc-type/dimension/user/${params.userId}`, {
    method: 'GET',
  });
}

/**
 * 查询供应商分类树
 * @param {Object} params - 查询参数
 */
export async function querySupplierCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/supplier-category`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function updateSupplierCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/supplier-category`,
    {
      method: 'POST',
      body: params.checkList,
      query: { authRoleId: params.authRoleId },
    }
  );
}

/**
 * 客户物料编码
 * @param {Object} params - 查询参数
 */
export async function queryCustomerItemCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/customer-item-category`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function updateCustomerItemCategory(params) {
  const organizationId = getCurrentOrganizationId();
  const { checkList = [], customerTenantId = -1, userId } = params;
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${userId}/${customerTenantId}/data/customer-item-category`,
    {
      method: 'POST',
      body: checkList,
      query: { authRoleId: params.authRoleId },
    }
  );
}

export async function fetchLov(params) {
  return request(`${SRM_PLATFORM}/v1/lovs/sql/data`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function queryInventoryData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/srm/authority-inventories`,
    {
      method: 'GET',
      query: param,
    }
  );
}
export async function queryInventoryModalData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${param.userId}/data/srm/inventories`, {
    method: 'GET',
    query: param,
  });
}

export async function updateAuthorityUnit(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/tree-unit`, {
    method: 'POST',
    body: params.checkList,
  });
}

export async function queryCustomerUnit(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/customer-operation-unit`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function updateCustomerUnit(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/customer-operation-unit`,
    {
      method: 'POST',
      body: params.checkList,
      query: {
        authRoleId: params.authRoleId,
      },
    }
  );
}

export async function queryUnit(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/tree-unit`, {
    method: 'GET',
    query: param,
  });
}

export async function queryAuthorityUnit(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(filterNullValueObject(params));
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/list-unit/authority`,
    {
      method: 'GET',
      query: param,
    }
  );
}

export async function queryCreateUnit(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/tree-unit-variant`,
    {
      method: 'GET',
      query: param,
    }
  );
}

export async function updateAuthorityCreateUnit(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/v1/${organizationId}/users/${params.userId}/data/tree-unit-variant`,
    {
      method: 'POST',
      body: params.checkList,
      query: {
        variant: params.variant,
      },
    }
  );
}

export async function queryUnitSetting() {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_MDM}/v1/${organizationId}/tenant-config/logical-distinction/query`,
    {
      method: 'GET',
      query: {
        logicalDistinction: 'USER_AUTH_UNIT_TREE_DISPLAY'
      },
    }
  );
}
