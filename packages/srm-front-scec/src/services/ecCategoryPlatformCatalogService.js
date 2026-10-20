/**
 * ecCategoryPlatformCatalog - 电商分类映射平台目录 - service
 * @date: 2019-1-25
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 电商分类映射平台目录数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCategoryPlatformCatalog(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/platform-ecCategory-mapping`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 映射平台目录
 * @export
 * @param {object} params 映射平台目录参数
 * @returns
 */
export async function setPlatformEcCategoryMap(params) {
  return request(`${SRM_SCEC}/v1/platform-ecCategory-mapping`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 启用禁用
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function setPermissionSetEnable(params) {
  return request(`${SRM_SCEC}/v1/platform-ecCategory-mapping`, {
    method: 'POST',
    body: params,
  });
}
