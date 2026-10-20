/**
 * service - 寻源模板创建与维护
 * @date: 2018-12-26
 * @version: 0.0.1
 * @author: lichao
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 寻源模板明细
 * @function searchSourceTemp
 * @function parseParameters - 处理分页信息
 * @param {Number} params.organizationId - 租户Id
 * @param {String} params.latestFlag - 模板状态
 * @returns
 */
export async function searchSourceTemp(params) {
  const { organizationId, latestFlag, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SSRC}/v1/${organizationId}/source-template`, {
    method: 'GET',
    query: { ...param, latestFlag },
  });
}

/**
 * 寻源模板新建或编辑（保存）
 * @async
 * @function tempSave
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - json
 * @returns {object} fetch Promise
 */
export async function templateSave(params) {
  const { customizeUnitCode } = params;
  return request(`${prefix}/${params.tenantId}/source-template`, {
    headers: {
      's-request-web': 'srm_web',
    },
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: params.data,
  });
}

/**
 *  详情查看
 */

export async function templateDetail(params) {
  const { customizeUnitCode } = params;
  return request(`${prefix}/${params.tenantId}/source-template/${params.templateId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 寻源模板发布
 * @async
 * @function tempSave
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - json
 * @returns {object} fetch Promise
 */
export async function templateRelease(params) {
  const { customizeUnitCode } = params;
  return request(`${prefix}/${params.tenantId}/source-template/release`, {
    headers: {
      's-request-web': 'srm_web',
    },
    query: {
      customizeUnitCode,
    },
    method: 'POST',
    body: params.data,
  });
}

/**
 * 复制寻源模板
 * @async
 * @function saveCopySourceTemp
 * @param {!Object} params - 请求参数
 * @returns {!Object} fetch Promise
 */
export async function saveCopySourceTemp(params = {}) {
  const { organizationId, templateId } = params;
  return request(`${prefix}/${organizationId}/source-template/copy/${templateId}`, {
    method: 'POST',
  });
}

/**
 * 复制RF模板
 * @async
 * @function saveCopyRFTemp
 * @param {!Object} params - 请求参数
 * @returns {!Object} fetch Promise
 */
export async function saveCopyRFTemp(params = {}) {
  const { organizationId, templateId } = params;
  return request(`${prefix}/${organizationId}/rf-templates/copy`, {
    method: 'POST',
    body: { templateId },
  });
}

/**
 * 寻源明细(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetRfxPrepare(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_old_ui_config/list-from-site`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

/**
 * 查询历史版本
 * */
export async function fetchHistoryVersion(params = {}) {
  const { organizationId, sourceCategory, ...otherParams } = params;
  const url =
    sourceCategory === 'RFI' || sourceCategory === 'RFP'
      ? `${prefix}/${organizationId}/rf-templates/history`
      : `${prefix}/${organizationId}/source-template/history`;
  return request(url, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 保存rf模板
 * */
export async function saveRFTemplate(params = {}) {
  const { customizeUnitCode, ...others } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/rf-templates`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * rf - 发布
 * @export
 * @param {Object} params
 * @returns
 */
export async function releaseCheck(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rf-templates/release`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}
/**
 * rf-发布-校验
 * @export
 * @param {Object} params
 * @returns
 */
export async function checkConfirm(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rf-templates/confirm`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 判断导出按钮是否需要禁用
 * @param {Object} payload
 * @returns
 */
export async function judgeExportIsDisable(payload) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-template/export/enable`, {
    method: 'GET',
    query: { ...payload },
  });
}
