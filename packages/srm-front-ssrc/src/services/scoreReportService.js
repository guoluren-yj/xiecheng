import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSRC } from '_utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  isTenantRoleLevel,
} from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 查询评分模版列表数据
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchScorRpt(params) {
  const param = filterNullValueObject(parseParameters(params));
  if (TenantRoleLevel) {
    return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-templates`, {
      method: 'GET',
      query: param,
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt-templates`, {
      method: 'GET',
      query: param,
    });
  }
}

/**
 * 查询评分模版列表数据
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchDetail(params) {
  const param = filterNullValueObject(parseParameters(params));
  if (TenantRoleLevel) {
    return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-templates/${param.templateId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt-templates/${param.templateId}`, {
      method: 'GET',
    });
  }
}

// 查询评分模版表格行
export async function fetchTemplateLine(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-template-lines`, {
      method: 'GET',
      query: params,
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt-template-lines`, {
      method: 'GET',
      query: params,
    });
  }
}

// 删除评分模版表格行
export async function deleteTemplateLine(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-template-line/del`, {
      method: 'DELETE',
      body: params,
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt-template-line/del`, {
      method: 'DELETE',
      body: params,
    });
  }
}

export async function saveDetail(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-templates`, {
      method: 'POST',
      body: params,
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt-templates`, {
      method: 'POST',
      body: params,
    });
  }
}

export async function copyTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-templates/cope`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/score-rpt-templates/remove`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除文件服务器中的文件
 * @async
 * @function onDraggerUploadRemove
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - 文件url
 * @returns fetch Promise
 */
export async function onDraggerUploadRemove(params) {
  const { bucketName, urls } = params;
  if (TenantRoleLevel) {
    return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
      method: 'POST',
      query: { bucketName },
      body: urls,
    });
  } else {
    return request(`${HZERO_FILE}/v1/files/delete-by-url`, {
      method: 'POST',
      query: { bucketName },
      body: urls,
    });
  }
}
