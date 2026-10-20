/**
 * smartCustomerService.js - 工作台卡片 service
 * @date: 2021-01-27
 * @author: Yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
/**
 *
 * 查询固定的常用功能
 * @export
 * @returns
 */
export async function queryUserInfo(loginName) {
  return request(`${SRM_PLATFORM}/v1/user-info/${loginName}`, {
    method: 'GET',
  });
}
