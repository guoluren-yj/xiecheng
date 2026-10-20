/**
 * 业务规则分类service
 */

import { SRM_PLATFORM } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import request from 'utils/request';

/**
 * 保存数据
 */
export async function saveRulesCategoryData({ editType, ...other }) {
  return request(`${SRM_PLATFORM}/v1/cnf-menu-trees`, {
    method: editType === 'edit' ? 'PUT' : 'POST',
    body: other,
  });
}

/**
 *  获取多语言数据
 */
export async function getMultiLanguage(params) {
  return request(`${HZERO_PLATFORM}/v1/multi-language`, {
    method: 'GET',
    query: params,
  });
}
