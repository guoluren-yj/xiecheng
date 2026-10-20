import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const organizationRoleLevel = isTenant ? `/${organizationId}` : '';

// 树目录
export async function getTreeValue() {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-categorys`, {
    method: 'GET',
  });
}

// 新建API类别
export async function addApiCategory(
  interfaceCategoryName,
  interfaceCategoryCode,
  applicationTypeCode,
  _tls
) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-categorys`, {
    method: 'POST',
    body: { interfaceCategoryName, interfaceCategoryCode, applicationTypeCode, _tls },
  });
}

// 重命名API类别
export async function renameApiCategory(
  id,
  interfaceCategoryName,
  objectVersionNumber,
  applicationTypeCode,
  _tls
) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-categorys`, {
    method: 'PUT',
    body: { id, interfaceCategoryName, objectVersionNumber, applicationTypeCode, _tls },
  });
}

// 删除API类别
export async function deleteApiCategory(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-categorys`, {
    method: 'DELETE',
    body: { id },
  });
}

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
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-module-converts/input/${id}`, {
    method: 'GET',
  });
}

// 详情页数据转换-编辑表格数据查询-出参
export async function queryEditOutputDs(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-module-converts/output/${id}`, {
    method: 'GET',
  });
}

// 接口定义详情页-查询
export async function queryDetail(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces/${id}`, {
    method: 'GET',
  });
}

// 接口定义详情页保存
export async function saveDetail(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces`, {
    method: 'POST',
    body: params,
  });
}

// 接口定义详情页发布
export async function publishDetail(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces`, {
    method: 'PUT',
    body: { interfaceId: id },
  });
}

// 接口定义详情页删除
export async function deleteDetail(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces`, {
    method: 'DELETE',
    body: { interfaceId: id },
  });
}

// 接口定义详情页-操作记录
export async function queryRecords(id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-records`, {
    method: 'GET',
    query: { interfaceId: id },
  });
}

// 接口定义详情页-数据转换保存
export async function saveDataConversionDetail(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-converts/save`, {
    method: 'POST',
    body: params,
  });
}

// 接口定义详情页-数据转换编辑查询
export async function getDataConversionDetail(type, id) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-converts/detail`, {
    method: 'GET',
    query: { convertType: type, openInterfaceConvertId: id },
  });
}

// 参数维护-树目录查询
export async function getTreeData(id, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-headers`,
    {
      method: 'GET',
      query: { interfaceId: id },
    }
  );
}

// 参数维护-树目录新增
export async function createTreeData(params, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-headers`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 参数维护-树目录删除
export async function deleteParamTable(id, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-headers`,
    {
      method: 'DELETE',
      body: { id },
    }
  );
}

// 参数维护-树目录重命名
export async function renameParamTable(params, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-headers`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 参数维护-表格批量保存
export async function saveParamsTable(params, typeFlag) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${
      typeFlag ? '-response' : ''
    }-param-lines`,
    {
      method: 'POST',
      body: params,
    }
  );
}
