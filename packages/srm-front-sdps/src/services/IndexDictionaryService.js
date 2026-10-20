/**
 * 指标字典
 */
import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';

export async function fetchChangeEnabled(params) {
  return request(`${SRM_DATA_PROCESS}/v1/index-define/save-or-update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除数据
 * @param {*} params
 * @returns
 */
export async function fetchRemoveData(params) {
  return request(`${SRM_DATA_PROCESS}/v1/index-define`, {
    method: 'DELETE',
    body: params,
  });
}
