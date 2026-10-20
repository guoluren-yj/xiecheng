import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 节点查询
export async function queryNodes(params) {
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/node-info`, {
    method: 'POST',
    body: params,
  });
}

// 模版保存
export async function templateSave(params) {
  const { query, ...others } = params || {};
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/save-update`, {
    method: 'POST',
    body: others,
    query,
  });
}

// 模版发布
export async function templateRelease(params) {
  const { query, ...others } = params || {};
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/release`, {
    method: 'POST',
    body: others,
    query,
  });
}

// 查询明细
export async function queryDetail(params) {
  const { query, ...others } = params || {};
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/detail`, {
    method: 'POST',
    body: others,
    query,
  });
}

// 启用禁用
export async function enableDisabled(params) {
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/disable-enable`, {
    method: 'POST',
    body: params,
  });
}

// 复制
export async function copy(params) {
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/copy`, {
    method: 'POST',
    body: params,
  });
}

// 历史版本
export async function queryHistory(params) {
  const { query, ...others } = params || {};

  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/history`, {
    method: 'POST',
    body: others,
    query,
  });
}

// 业务规则定义信息查询
export async function definitionQuery(params) {
  return request(`${SRM_SSRC}/v2/${organizationId}/source-templates/cnf-meta-definitions`, {
    method: 'POST',
    body: params,
  });
}
