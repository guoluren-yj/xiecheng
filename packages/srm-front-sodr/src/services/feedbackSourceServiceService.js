/**
 * service - 反馈单来源服务定义
 * @date: 2020-12-28
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();

/**
 *
 * 新建反馈单来源服务
 * @export
 * @param {Object} params 保存的数据
 * @returns
 */
export async function createFeedbackSource(params) {
  return request(
    isTenant
      ? `/siec/v1/${organizationId}/feedback/create`
      : `/siec/v1/${organizationId}/feedback-site/create`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 保存反馈单来源服务
 *
 * @export
 * @param {Object} params 保存的数据
 * @returns
 */
export async function saveFeedbackSource(params) {
  return request(
    isTenant
      ? `/siec/v1/${organizationId}/feedback/update`
      : `/siec/v1/${organizationId}/feedback-site/update`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
