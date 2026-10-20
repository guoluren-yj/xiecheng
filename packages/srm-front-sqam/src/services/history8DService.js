/**
 * 8D 历史
 * @date: 2018-12-17
 * @author: LZM <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;

export async function searchAllDetail(params) {
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderHisId}/query`,
    {
      method: 'GET',
    }
  );
}
