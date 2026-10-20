/*
 * @Date: 2024-07-04 14:20:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config.js';

export async function batchApprove(params) {
  return request(`${SRM_PLATFORM}/v1/company-retrieves/batch-approve`, {
    method: 'POST',
    body: params,
  });
}

export async function batchReject(params) {
  return request(`${SRM_PLATFORM}/v1/company-retrieves/batch-reject`, {
    method: 'POST',
    body: params,
  });
}
