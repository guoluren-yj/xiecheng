/**
 * supplierWarehouseService - 简易供应商入库Service
 * @date: 2020-01-04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 动态查询地区
 * @param {*} params
 * @returns
 */
export async function loadCityData(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/regions/regional-linkage`, {
      method: 'GET',
      query: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/regions/regional-linkage`, {
      method: 'GET',
      query: params,
    });
  }
}

// 明细提交
export async function submitAll(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/submit`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

// 明细保存
export async function saveAll(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/save`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

// 明细删除
export async function deleteAll(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/delete`, {
    method: 'DELETE',
    body: [others],
    query: { customizeUnitCode },
  });
}

// 查询供应商已有信息
export async function querySupplierInfo(params) {
  const { supplierId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/supplierInfo/${supplierId}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 校验改供应商是否可以变更
export async function verifySupplierUpdate(params) {
  const { supplierId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/change/verify/${supplierId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询申请人信息
 */
export async function queryCreatorInfo() {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/getUserAndUserMasterUnit`, {
    method: 'GET',
  });
}

/**
 * 查询业务规则必输配置
 */
export async function queryRequiredTabsInfo() {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/required-tabs`, {
    method: 'GET',
  });
}

// 列表提交
export async function batchSubmit(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/submit-batch`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 新建单据查询页签默认带值数据
 */
export async function queryDefaultSupplierInfo() {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/create_supplierInfo`, {
    method: 'GET',
  });
}

// 查询业务规则定义银行名称校验方式
export async function queryCheckMode(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/cnf`, {
    method: 'GET',
    query: params,
  });
}
