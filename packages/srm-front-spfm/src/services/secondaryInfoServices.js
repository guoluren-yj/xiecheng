/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-19 17:17:12
 * @FilePath: /srm-front-spfm/src/services/secondaryInfoServices.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * @description: 保存次要信息
 * @param {*} params
 * @return {*}
 */
export async function saveSecondDaryInfo(params) {
  const { companyId, domainName, onlySaveFlag } = params;
  return request(`${SRM_PLATFORM}/v1/companies/basic/${companyId}/save-com-info`, {
    method: 'POST',
    query: { domainName, companyId, onlySaveFlag },
    body: params,
  });
}
