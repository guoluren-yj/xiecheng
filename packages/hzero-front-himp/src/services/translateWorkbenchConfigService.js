/**
 * valueListService.js - 值集配置 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_IMP } from 'utils/config';
import { parseParameters, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

function urlPrefix() {
  return `${HZERO_IMP}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}`;
}

/**
 * 批量删除数据配置
 */
export async function deleteDataConfig(translateObjectId) {
  return request(`${urlPrefix()}translate/object/delete/${translateObjectId}`, {
    method: 'POST',
  });
}

/**
 * 查询单条数据配置
 */
export async function queryDataConfigById(id) {
  return request(`${urlPrefix()}translate/object/query/${id}`, {
    method: 'POST',
  });
}

/**
 * 保存数据配置
 */
export async function saveDataConfig(data) {
  return request(`${urlPrefix()}translate/object/modify`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 删除字段
 */
export async function deleteDataConfigField(data) {
  return request(`${urlPrefix()}`, {
    method: 'DELETE',
    body: data,
  });
}

export async function exportDataConfig() {
  return request(`${HZERO_IMP}/v1/translate/metadata/download`, {
    method: 'POST',
    responseType: 'text',
  });
}

export async function importDataConfig(data) {
  return request(`${HZERO_IMP}/v1/translate/metadata/upload`, {
    method: 'POST',
    body: data,
  });
}
