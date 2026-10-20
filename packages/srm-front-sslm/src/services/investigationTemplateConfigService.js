/**
 * service - 调查表模板配置 InvestigationTemplateConfig
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
// import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

/**
 *根据模板Id查询模板头
 *
 * @export
 * @function investigationTemplateConfigQuery
 * @param {Number} investigateTemplateId - 调查表模板Id
 * @returns
 */
export async function investigationTemplateConfigQuery(payload) {
  const { investigateTemplateId, organizationId } = payload;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate-templates/${investigateTemplateId}`,
    {
      method: 'GET',
    }
  );
}

/**
 *根据模板Id查询模板信息
 *
 * @export
 * @function investigationTemplateHeaderQueryAll
 * @param {Number} investigateTemplateId - 调查表模板Id
 * @returns
 */
export async function investigationTemplateHeaderQueryAll(payload) {
  const { investigateTemplateId, organizationId } = payload;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate-confighs-define/${investigateTemplateId}`,
    {
      method: 'GET',
    }
  );
}
