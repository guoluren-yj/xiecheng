import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SLOD } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 删除数据-node
export async function deleteOnChange(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/node-config`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存数据-node
export async function saveList(params, type) {
  const data = type === 'node' ? params : { ...params[0], strategyLines: [] };
  const url = type === 'node' ? `delivery/strategy/node-config` : `delivery/strategy/strategy`;
  return request(`${SRM_SLOD}/v1/${organizationId}/${url}`, {
    method: type === 'node' ? 'POST' : 'PUT',
    body: data,
  });
}

// 保存数据-str
export async function saveOnChangeStr(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy`, {
    method: 'PUT',
    body: params,
  });
}

// 删除数据-str
export async function deleteOnChangeStr(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-header`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询历史版本
export async function historyChange(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-line/list/publish`, {
    method: 'GET',
    query: params,
  });
}

// 查询明细行树结构
export async function queryFlowChartsInfo(params) {
  const url = params?.urlFlag ? `strategy/copy-strategy-line` : `strategy/strategy-line`;
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/${url}/list`, {
    method: 'GET',
    query: params,
  });
}

// 查询明细行树结构-添加节点
export async function querySelectNodeChange(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/node-config/list`, {
    method: 'GET',
    query: params,
  });
}

// 单个保存数据-明细页面
export async function saveLineCharts(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-line`, {
    method: 'PUT',
    body: params,
  });
}

// 删除数据-明细行树节点
export async function deleteChartsNode(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-line`, {
    method: 'DELETE',
    body: params,
  });
}

// 明细数据发布
export async function pubOnChangeDetail(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy/publish`, {
    method: 'PUT',
    body: params,
  });
}

// 校验推荐配置
export async function getRecommendConfig() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/copy/check`, {
    method: 'PUT',
  });
}

// 引用推荐配置
export async function handleDirectRecommend() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/copy`, {
    method: 'PUT',
  });
}

// 保存数据-操作权限
export async function saveModal(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-permission/${params.strategyLineId}`,
    {
      method: 'PUT',
      body: params.data,
    }
  );
}
// 保存数据-操作权限
export async function saveAlterModal(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/change-field`, {
    method: 'POST',
    body: params.data,
  });
}

// 删除数据-操作权限
export async function handleLineDel(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/change-field`, {
    method: 'DELETE',
    body: params.data,
  });
}

// 引用数据-操作权限
export async function handleReference(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/change-field/copy?strategyLineId=${params.strategyLineId}&nodeTemplateCode=${params.nodeTemplateCode}`,
    {
      method: 'POST',
    }
  );
}

// 保存单据关闭权限
export async function savePermission(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-close-control/${params.strategyLineId}`,
    {
      method: 'POST',
      body: params.data,
    }
  );
}

// 导出-下载按钮
export async function handleExport() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/export`, {
    method: 'POST',
    responseType: 'blob',
  });
}

// 查询明细行树结构-添加节点
export async function openStockControl() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/outsource/enable`, {
    method: 'GET',
  });
}
