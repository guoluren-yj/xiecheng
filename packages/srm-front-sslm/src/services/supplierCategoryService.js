/**
 * supplierCategoryService.js - 供应商分类定义 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商分类树
 * @param {Object} params - 查询参数
 */
export async function querySupplierCategory(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增或修改供应商分类
 * @param {Object} params - 新增或修改参数
 */
export async function saveSupplierCategory(params) {
  const { customizeUnitCode, dataList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys`, {
    method: 'POST',
    body: dataList,
    query: { customizeUnitCode },
  });
}

/**
 * 校验供应商分类编码
 * @param {Object} params - 新增或修改参数
 */
export async function checkCategoryCode(params) {
  const { categoryCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/${categoryCode}/valid`, {
    method: 'POST',
  });
}

/**
 * 禁用供应商分类
 * @param {Object} params
 */
export async function disableSupplierCategory(params) {
  const { categoryId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/${categoryId}/disable`, {
    method: 'POST',
  });
}

/**
 * 启用供应商分类
 * @param {Object} params
 */
export async function enableSupplierCategory(params) {
  const { categoryId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/${categoryId}/enable`, {
    method: 'POST',
  });
}

/**
 * @description: 校验当前供应商分类及下级是否存在供应商启用
 * @param {*} params
 * @return {*}
 */
export async function queryCurrentSupplierCtgIsEnabled(params) {
  const { categoryId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-categorys/${categoryId}/disable/check`,
    {
      method: 'GET',
    }
  );
}
