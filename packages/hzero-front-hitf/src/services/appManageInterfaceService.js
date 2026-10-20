import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const organizationRoleLevel = isTenant ? `/${organizationId}` : '';

// 详情页数据转换-选择组件编码后表格数据查询-入参
export async function queryInputDs(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-module-lines/input/${id}`, {
    method: 'GET',
  });
}

// 详情页数据转换-选择组件编码后表格数据查询-出参
export async function queryOutputDs(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-module-lines/output/${id}`, {
    method: 'GET',
  });
}

// 详情页数据转换-编辑表格数据查询-入参
export async function queryEditInputDs(id) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-module-convert-tns/${id}?fieldCategory=INPUT`,
    {
      method: 'GET',
    }
  );
}

// 详情页数据转换-编辑表格数据查询-出参
export async function queryEditOutputDs(id) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-module-convert-tns/${id}?fieldCategory=OUTPUT`,
    {
      method: 'GET',
    }
  );
}

// 详情页数据转换-编辑表格数据查询-条件表格
export async function queryConditionDs(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-condition-convert-tns/${id}/list`, {
    method: 'GET',
  });
}

// 接口定义详情页-查询
export async function queryDetail(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-tns/${id}`, {
    method: 'GET',
  });
}

// 接口定义详情页保存
export async function saveDetail(params) {
  const { tenantInterfaceId } = params;
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-tns/${tenantInterfaceId}/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 接口定义详情页-数据转换保存
export async function saveDataConversionDetail(params) {
  const { interfaceId } = params;
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-convert-tns/${interfaceId}/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 接口定义详情页-数据转换编辑查询
export async function getDataConversionDetail(type, id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-convert-tns/${id}`, {
    method: 'GET',
  });
}

// 接口定义详情页-数据转换编辑查询-源数据表格
export async function getDataConversionSourceTable(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-source-convert-tns/${id}`, {
    method: 'GET',
  });
}

// 参数维护-树目录查询
export async function getTreeData(id, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-header-tns/${id}`,
    {
      method: 'GET',
    }
  );
}

// 参数维护-树目录新增
export async function createTreeData(params, typeFlag) {
  const { tenantInterfaceId } = params;
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-header-tns/${tenantInterfaceId}/save`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}

// 参数维护-树目录删除
export async function deleteParamTable(params, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-header-tns`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

// 参数维护-树目录重命名
export async function renameParamTable(params, typeFlag) {
  const { tenantInterfaceId } = params;
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-header-tns/${tenantInterfaceId}/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 参数维护-表格批量保存
export async function saveParamsTable(params, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-line-tns/batch-save`,
    {
      method: 'POST',
      body: params,
    }
  );
}
