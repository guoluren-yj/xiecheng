import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';

// 树目录
export async function getTreeValue() {
  return request(`${HZERO_HITF}/v1/open-interface-categorys`, {
    method: 'GET',
  });
}

// 新建API类别
export async function addApiCategory(interfaceCategoryName, interfaceCategoryCode) {
  return request(`${HZERO_HITF}/v1/open-interface-categorys`, {
    method: 'POST',
    body: { interfaceCategoryName, interfaceCategoryCode },
  });
}

// 重命名API类别
export async function renameApiCategory(id, interfaceCategoryName, objectVersionNumber) {
  return request(`${HZERO_HITF}/v1/open-interface-categorys`, {
    method: 'PUT',
    body: { id, interfaceCategoryName, objectVersionNumber },
  });
}

// 删除API类别
export async function deleteApiCategory(id) {
  return request(`${HZERO_HITF}/v1/open-interface-categorys`, {
    method: 'DELETE',
    body: { id },
  });
}

// 详情页数据转换-选择组件编码后表格数据查询-入参
export async function queryInputDs(id) {
  return request(`${HZERO_HITF}/v1/open-module-lines/input/${id}`, {
    method: 'GET',
  });
}

// 详情页数据转换-选择组件编码后表格数据查询-出参
export async function queryOutputDs(id) {
  return request(`${HZERO_HITF}/v1/open-module-lines/output/${id}`, {
    method: 'GET',
  });
}

// 接口定义详情页-查询
export async function queryDetail(id) {
  return request(`${HZERO_HITF}/v1/open-interfaces/${id}`, {
    method: 'GET',
  });
}

// 接口定义详情页保存
export async function saveDetail(params) {
  return request(`${HZERO_HITF}/v1/open-interfaces`, {
    method: 'POST',
    body: params,
  });
}

// 接口定义详情页发布
export async function publishDetail(id) {
  return request(`${HZERO_HITF}/v1/open-interfaces`, {
    method: 'PUT',
    body: { interfaceId: id },
  });
}

// 接口定义详情页删除
export async function deleteDetail(id) {
  return request(`${HZERO_HITF}/v1/open-interfaces`, {
    method: 'DELETE',
    body: { interfaceId: id },
  });
}

// 接口定义详情页-操作记录
export async function queryRecords(id) {
  return request(`${HZERO_HITF}/v1/open-interface-records`, {
    method: 'GET',
    query: { interfaceId: id },
  });
}

// 接口定义详情页-数据转换保存
export async function saveDataConversionDetail(params) {
  return request(`${HZERO_HITF}/v1/open-interface-converts/save`, {
    method: 'POST',
    body: params,
  });
}

// 接口定义详情页-数据转换编辑查询
export async function getDataConversionDetail(type, id) {
  return request(`${HZERO_HITF}/v1/open-interface-converts/detail`, {
    method: 'GET',
    query: { convertType: type, openInterfaceConvertId: id },
  });
}
