/**
 * service - multiCloudRoleTemplateService
 * @date: 2024-04-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';

/**
 * 执行多云企业信息变更新菜单切换旧菜单
 */
export async function executeChangeRoleTemplate(params) {
  return request(`${SRM_SSLM}/v1/enterprise-change/role-template-replacement`, {
    method: 'POST',
    body: {},
    query: params,
  });
}
