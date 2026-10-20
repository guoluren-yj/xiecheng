/**
 * expressionEngineService 表达式引擎规则服务
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { lowcodeOrganizationURL } from '../utils';
import { SRM_SWBH } from '../utils/config';

/**
 * 动态定义详情查询
 * @param {*} params
 * @returns
 */
export async function getDynamicDetail(params) {
  const { actionId } = params;
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition/detail/${actionId}`;
  return request(url, {
    method: 'GET',
  });
}
/**
 * 待办定义详情查询
 * @param {*} params
 * @returns
 */
export async function getToDoDetail(params) {
  const { todoId } = params;
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions/detail/${todoId}`;
  return request(url, {
    method: 'GET',
  });
}

export async function saveRoleDynamicDefine(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}
/**
 * 保存待办定义
 * */
export async function saveRoleToDo(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}
