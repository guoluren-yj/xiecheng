/*
 * @Description: 价格公式管理
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
 * 编辑生成新公式
 * @export
 * @param {Object} data
 * @returns
 */
export async function editNewFormula(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-formulas`, {
    method: 'POST',
    // query: { customizeUnitCode },
    body: data,
  });
}

/**
 * 发布公式
 * @export
 * @param {Object} data
 * @returns
 */
export async function releaseFormula(data, type) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-formulas/${type}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 复制公式
 * @export
 * @param {Object} data
 * @returns
 */
export async function copyFormula(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-formulas/copy`, {
    method: 'PUT',
    // query: { customizeUnitCode },
    body: data,
  });
}

/**
 * 启用/禁用公式
 * @export
 * @param {Object} data
 * @returns
 */
export async function enabledFormula(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-formulas/enabled`, {
    method: 'PUT',
    // query: { customizeUnitCode },
    body: data,
  });
}

/**
 * 删除
 * @param {object} data
 * @returns
 */
export async function deleteFormula(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-formulas`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 获取公式左边可选变量
 * @param {Object} payload
 * @returns
 */
export async function getFieldList(params) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-formulas/bom-tmp`, {
    method: 'GET',
    query: params,
  });
}
