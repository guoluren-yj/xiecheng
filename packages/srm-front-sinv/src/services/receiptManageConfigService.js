/*
 * @Description:
 * @Date: 2020-09-06 10:26:19
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function getUrl(type) {
  let url = '';
  switch (type) {
    case 'node':
      url = 'rcv-node-configs';
      break;
    case 'system':
      url = 'rcv-ext-mappings';
      break;
    case 'reverse':
      url = 'rcv-reverse-configs';
      break;
    case 'strategy':
      url = 'rcv-strategy-headers';
      break;
    case 'line':
      url = 'rcv-strategy-lines';
      break;
    case 'return':
      url = 'rcv-ext-mappings';
      break;
    default:
      break;
  }
  return url;
}

/**
 * 业务节点删除
 * @param {勾选数据} list
 */
export async function handleDelete(list, type) {
  const url = getUrl(type);
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'DELETE',
    body: list,
  });
}

/**
 * 维护保存
 * @param {勾选数据} list
 */
export async function handleSave(list, type) {
  const url = getUrl(type);
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 引用推荐配置
 */
export async function handleReferenceRecommend() {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-node-configs/copy`, {
    method: 'POST',
  });
}

/**
 * 引用推荐配置校验
 */
export async function handleReferenceRecommendCheck() {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-node-configs/copy-check`, {
    method: 'POST',
  });
}

/**
 * 查询是否启发货工作台
 */
export async function queryDeliveryWorkbench() {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-common/delivery-enable/query`, {
    method: 'GET',
  });
}

/**
 * 查询收货管理配置明细头信息
 */
export async function headerFetchInfo(params) {
  const srmDetail = params.nodeStrategyId ? '/srmDetail' : '/detail';
  const url = params.tabsKey === 'node' ? `rcv-node-configs` : `rcv-strategy-headers`;
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}/${params.id}${srmDetail}`, {
    method: 'GET',
  });
}

/**
 * 明细节点/策略保存
 */
export async function saveDetailInfo({ params, tabsKey }) {
  const url =
    tabsKey === 'node' ? `rcv-node-configs/detail/save` : `rcv-strategy-headers/detail/save`;
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询收货管理配置策略明细节点
 */
export async function queryFlowChartsInfo(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-strategy-lines/${params.id}/children`, {
    method: 'GET',
  });
}

/**
 * 查询收货管理配置策略明细节点
 */
export async function queryFlowChartsInfoSRM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-strategy-lines/${params.id}/srmChildren`, {
    method: 'GET',
  });
}

/**
 * 策略节点新增
 */
export async function addLineCharts(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-strategy-lines/${params.id}/add/children`, {
    method: 'POST',
    body: params.newData,
  });
}

/**
 * 策略节点删除
 */
export async function deleteChartsNode(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-strategy-lines`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 明细节点/策略保存
 */
export async function createInfo({ params, tabsKey }) {
  const url = tabsKey === 'node' ? `rcv-node-configs` : `rcv-strategy-headers`;
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: params,
  });
}

export async function delDataLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv-strategy-line-coop/delete`, {
    method: 'DELETE',
    body: params,
  });
}

export async function saveDataLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv-strategy-line-coop/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 列表/启用禁用保存行数据
 */
export async function handleSaveEnable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-strategy-headers`, {
    method: 'POST',
    body: params,
  });
}
