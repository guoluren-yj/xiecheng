/**
 * 报表卡片配置管理
 * @date: 2022-08-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
// import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchRfxId: 寻源单编码查ID
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRfxId(params) {
  return request(
    `/ssrc/v2/${getCurrentOrganizationId()}/rfx/list/all?page=0&size=20&multiRfxNumOrTitle=${
      params.multiRfxNumOrTitle
    }`,
    {
      method: 'GET',
      // query: params,
    }
  );
}
