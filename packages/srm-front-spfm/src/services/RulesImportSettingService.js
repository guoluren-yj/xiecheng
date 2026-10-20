/**
 * rulesDefinitionService
 * @date: 2020-06-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 处理业务规则自动转换的数据
 * @param {Object} params
 */
export async function delAutoConvert(params) {
  return request(`${SRM_PLATFORM}/v1/cnf-auto-convert`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 处理业务规则自动转换的关联清单
 * @param {Object} params
 */
export async function delConvertRelation(params) {
  const { body, ...other } = params;
  return request(`${SRM_PLATFORM}/v1/cnf-auto-convert-relation`, {
    method: 'POST',
    body,
    query: other,
  });
}
