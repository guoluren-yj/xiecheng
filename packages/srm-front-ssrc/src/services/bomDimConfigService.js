/*
 * @Description: BOM结构配置管理 services
 * @Date: 2024-02-23 16:14:26
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */

import request from 'utils/request';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPC}/v1`;

/**
 * 发布
 * @export
 * @param {Object} data
 * @returns
 */
export async function release(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-template/release`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 编辑新版本
 * @export
 * @param {Object} data
 * @returns
 */
export async function editNew(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-template/edit`, {
    method: 'POST',
    body: data,
  });
}


/**
 * 启用/禁用公式
 * @export
 * @param {Object} data
 * @returns
 */
export async function enabled(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-template/isEnabled`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 删除
 * @export
 * @param {Object} data
 * @returns
 */
export async function deleteRecord(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-template`, {
    method: 'DELETE',
    body: data,
  });
}
