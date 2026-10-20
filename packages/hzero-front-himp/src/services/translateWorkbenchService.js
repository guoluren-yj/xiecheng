/**
 * valueListService.js - 值集配置 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_IMP, HZERO_FILE } from 'utils/config';
import { parseParameters, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
function urlPrefix() {
  return `${HZERO_IMP}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}`;
}

/**
 * 刷新
 */
export async function refreshData(data) {
  return request(`${urlPrefix()}translate/station/translate-object/refresh`, {
    method: 'POST',
    body: data,
    // responseType: 'text',
  });
}

/**
 * 导出
 */
export async function exportData(data) {
  return request(`${urlPrefix()}translate/station/translate-object/export`, {
    method: 'POST',
    body: data,
    responseType: 'text',
  });
}

/**
 * 上传
 */
export async function uploadData(data, query) {
  return request(`${urlPrefix()}translate/station/translate-object/upload`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 上传前先上传文件到桶中
 */
export async function beforeUploadData(data, query) {
  return request(
    `${HZERO_FILE}/v1${
      isTenantRoleLevel() ? `/${getCurrentOrganizationId()}` : ''
    }/files/attachment/multipart-with-info`,
    {
      method: 'POST',
      body: data,
      query,
    }
  );
}
