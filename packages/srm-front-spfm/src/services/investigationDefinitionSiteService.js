/**
 * service - 平台级明细模板定义
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 *
 *根据模板Id查询模板头
 * @export
 * @function investigationTemplateConfigQuery
 * @param {Number} investigateTemplateId - 调查表模板Id
 * @returns
 */
export async function investigationTemplateConfigQuery(investigateTemplateId) {
  return request(`${SRM_PLATFORM}/v1/investigate-templates/${investigateTemplateId}`, {
    method: 'GET',
  });
}
/**
 *根据模板Id查询模板信息
 *
 * @export
 * @function investigationTemplateHeaderQueryAll
 * @param {Number} investigateTemplateId - 调查表模板Id
 * @returns
 */
export async function investigationTemplateHeaderQueryAll(investigateTemplateId) {
  return request(`${SRM_PLATFORM}/v1/investigate-confighs-define/${investigateTemplateId}`, {
    method: 'GET',
  });
}
/**
 *修改 是否调查页签
 *
 * @export
 * @function updateHeader
 * @param {String} params.configDescription - 配置项描述
 * @param {String} params.configName - 配置项名称
 * @param {Number} params.investgCfHeaderId - 配置项头Id
 * @param {Boolean} params.investigateFlag - 是否调查
 * @param {Number} params.investigateTemplateId - 模板Id
 * @param {Number} params.objectVersionNumber - 版本号
 * @returns
 */
export async function updateHeader(params) {
  return request(`${SRM_PLATFORM}/v1/investigate-confighs`, {
    method: 'PUT',
    body: [params],
  });
}
/**
 *根据模板头Id查询头数据
 *
 * @export
 * @function fetchHeaderInfo
 * @param {Number} params.investgCfHeaderId - 模板头Id
 * @returns
 */
export async function fetchHeaderInfo(params) {
  const { investgCfHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/investigate-confighs/${investgCfHeaderId}`, {
    method: 'GET',
  });
}
/**
 *批量保存数据
 *
 * @export
 * @function saveDefinition
 * @param {Object} params - 表数据以及头数据
 * @returns
 */
export async function saveDefinition(params) {
  return request(`${SRM_PLATFORM}/v1/investigate-configls`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询预览的调查表配置
 * @export
 * @function investigationTemplateConfigPreviewQuery
 * @param {Number} params.investgCfHeaderId - 模板头Id
 * @returns
 */
export async function investigationTemplateConfigPreviewQuery(investigateTemplateId) {
  return request(`${SRM_PLATFORM}/v1/investigate-confighs-preview/${investigateTemplateId}`, {
    method: 'GET',
  });
}
