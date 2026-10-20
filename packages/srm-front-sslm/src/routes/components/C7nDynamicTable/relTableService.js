/**
 * c7n配置表组件service
 * relTableService.js
 * @date: 2020-08-04
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 根据配置表 code 查询配置表列配
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function queryRelTableConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-settings/rel-table-records`, {
    method: 'GET',
    query: params,
  });
}
