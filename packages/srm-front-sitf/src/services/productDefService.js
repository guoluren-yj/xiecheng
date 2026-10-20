/**
 * productDefinitionService - 产品线定义 - service
 * @date: 2018-09-11
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 产品线定义数据查询
 *
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function queryProductDef(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/product-lines`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 产品线定义数据创建、编辑
 * @export
 * @param {object} params 创建编辑参数
 * @returns
 */
export async function updateProduct(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/product-lines`, {
    method: 'POST',
    body: params.body,
  });
}
