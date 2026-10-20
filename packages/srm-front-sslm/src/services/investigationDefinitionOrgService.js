/**
 * service - 租户级明细模板定义investigationDefinitionOrg
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

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
/**
 *修改 是否调查页签
 *
 * @export
 * @function updateHeader
 * @param {String} params.configDescription - 配置项描述
 * @param {Number} params.configName - 配置项名称
 * @param {Number} params.investgCfHeaderId - 配置项头Id
 * @param {Number} params.investigateFlag - 是否调查
 * @param {Number} params.investigateTemplateId - 模板Id
 * @param {Number} params.objectVersionNumber - 版本号
 * @returns
 */
export async function updateHeader(params) {
  const { flagList, organizationId, updateInvestigateTemplateId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-confighs`, {
    method: 'PUT',
    query: { updateInvestigateTemplateId },
    body: [flagList],
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
  return request(`${SRM_SSLM}/v1/investigate-confighs/${investgCfHeaderId}`, {
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
  const { payloadData, organizationId, updateInvestigateTemplateId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-configls`, {
    method: 'PUT',
    query: { updateInvestigateTemplateId },
    body: {
      investigateTemplateId: updateInvestigateTemplateId,
      ...payloadData,
    },
  });
}
/**
 *
 * @param {Object} params - 查询参数
 */
export async function queryAttachmentList(params) {
  // const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-atts`, {
    method: 'GET',
    query: params,
  });
}
export async function saveAttachmentLine(params) {
  const { updateInvestigateTemplateId, body } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-atts/${updateInvestigateTemplateId}`,
    {
      method: 'POST',
      body,
    }
  );
}
export async function deleteAttachmentLine(params) {
  const { updateInvestigateTemplateId, body } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-atts/${updateInvestigateTemplateId}`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 查询租户级列表
 * @export
 * @param {Object} params
 */
export async function fetchInvestigateListOrg(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/real`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 查询平台级列表
 * @export
 * @param {Object} params
 */
export async function fetchInvestigateListSite(params) {
  return request(`${SRM_PLATFORM}/v1/investigate-templates`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 保存新的租户级引用模板
 * @export
 * @param {Object} params
 */
export async function saveReferenceTemplateOrg(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/dup-investgconfigs`, {
    method: 'PUT',
    query: params,
  });
}
/**
 * 保存新的平台级引用模板
 * @export
 * @param {Object} params
 */
export async function saveReferenceTemplateSite(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/dupspfm-investgconfigs`, {
    method: 'PUT',
    query: params,
  });
}
/**
 *根据模板Id查询平台级模板头
 *
 * @export
 * @param {*} investigateTemplateId
 * @returns
 */
export async function investigationTemplateSiteConfigQuery(investigateTemplateId) {
  return request(`${SRM_PLATFORM}/v1/investigate-templates/${investigateTemplateId}`, {
    method: 'GET',
  });
}
/**
 *根据模板Id查询模板信息
 *
 * @export
 * @param {*} investigateTemplateId
 * @returns
 */
export async function investigationTemplateSiteHeaderQueryAll(investigateTemplateId) {
  return request(`${SRM_PLATFORM}/v1/investigate-confighs-preview/${investigateTemplateId}`, {
    method: 'GET',
  });
}

// 预览 service 已经存在了
// /**
//  *
//  * @export
//  * @param {*} organizationId
//  * @param {*} investigateTemplateId
//  * @returns
//  */
// export async function investigationTemplateConfigQuery(organizationId, investigateTemplateId) {
//   return request(
//     `${SRM_SSLM}/v1/${organizationId}/investigate-templates/${investigateTemplateId}`,
//     {
//       method: 'GET',
//     }
//   );
// }

// export async function investigationTemplateHeaderQueryAll(organizationId, investigateTemplateId) {
//   return request(
//     `${SRM_SSLM}/v1/${organizationId}/investigate-confighs-preview/${investigateTemplateId}`,
//     {
//       method: 'GET',
//     }
//   );
// }
/**
 *根据模板Id查询模板信息
 *
 * @export
 * @param {*} investigateTemplateId
 * @returns
 */
export async function investigationTemplateOrgHeaderQueryAll(payload) {
  const { investigateTemplateId, organizationId } = payload;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate-confighs-preview/${investigateTemplateId}`,
    {
      method: 'GET',
    }
  );
}

/**
 *保存调查表模板详情
 *
 * @export
 * @function saveDefinition
 * @param {Object} params - 表数据以及头数据
 * @returns
 */
export async function saveTemptDetail(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-configls-new`, {
    method: 'PUT',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 *发布调查表模板详情
 *
 * @export
 * @function saveDefinition
 * @param {Object} params - 表数据以及头数据
 * @returns
 */
export async function releaseTemptDetail(params) {
  const { investigateTemplateId, customizeUnitCode, ...other } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/${investigateTemplateId}/effective-in`,
    {
      method: 'POST',
      body: other,
      query: { customizeUnitCode },
    }
  );
}

// 导出调查表模板明细
export async function exportTempDetail({ investigateTemplateId, ...query }) {
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/${investigateTemplateId}/print`,
    {
      method: 'GET',
      query,
      responseType: 'text',
    }
  );
}
