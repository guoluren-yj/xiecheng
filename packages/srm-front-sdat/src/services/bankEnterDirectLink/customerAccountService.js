/**
 * 动态监控事件
 * @author Zip <zepeng.huang@hand-china.com>
 * @date 2019-06-13
 * @copyright 2019-05-28 © HAND
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 修改数据状态
 * @async
 * @function fetchChangeStatus
 * @param {Object} params
 */
export async function fetchChangeStatus(params) {
  return request(`${SRM_DATA_SDAT}/v1/bank-pmt-configs`, {
    method: 'POST',
    body: params,
  });
}
