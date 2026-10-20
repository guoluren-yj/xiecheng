import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 调试js代码
 */
export async function executScrpt(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/debug-js`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 根据uuid获取最新版本的js代码
 */
export async function getJsCode(uuid = null, version = null) {
  const params = {};
  if (uuid) {
    params.uuid = uuid;
  }
  if (version !== null) {
    params.version = version;
  }
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存js代码到uuid
 */
export async function saveJsCode(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取js的操作按钮
 */
export async function getRobotJsButtons(robotJsId) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/button/${robotJsId} `, {
    method: 'GET',
  });
}

/**
 * 发布版本
 */
export async function publishVersionApi(data) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/publish`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 取消发布版本
 */
export async function cancelPublishVersionApi(data) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/publish-cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 部署版本
 */
export async function deployVersionApi(data) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/deploy`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 新建版本
 */
export async function createNewVersionApi(data) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot-js/new-version`, {
    method: 'POST',
    body: data,
  });
}
