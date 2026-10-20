/**
 * creditConfigService 平台征信配置Service
 * @date: 2019-07-22
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/customize-settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 保存配置
 */
export async function saveSettings(params) {
  return request(`${SRM_PLATFORM}/v1/customize-settings`, {
    method: 'POST',
    body: params,
  });
}
