import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

// 招标文件工作台-列表：启用或者禁用模板
export async function enableListTemplate(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/file-manages/disable-enable`, {
    method: 'POST',
    body: params,
  });
}

// save
export async function saveFileTemplate(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/file-manages/save-update`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

// 编辑模板页面-模板列表：启用或者禁用文件模板
export async function enableLineFileTemplate(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/file-templates/disable-enable`, {
    method: 'POST',
    body: params,
  });
}

// save upload template
export async function saveWordUploadTemplate(params) {
  const { templateId, ...otherParams } = params || {};
  return request(`${prefix}/${getCurrentOrganizationId()}/file-templates/${templateId}/upload`, {
    method: 'POST',
    query: otherParams,
  });
}
