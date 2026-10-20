/**
 * expertService.js - 专家库 service
 * @date: 2019-01-22
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
/**
 *
 * 查询专家注册申请审批
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryApprove(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/approve`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询专家信息维护(管理员)
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryMaintenace(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expert/update-all`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询专家信息汇总数据
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryAll(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expert/all`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询专家注册申请汇总查询
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryReqQuery(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/all`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询专家注册申请
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryRequisition(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/personal`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 专家注册申请头提交
 * @export
 * @param {Array} params.expertReqIds 头Id数组
 * @returns
 */
export async function submitRequisition(params) {
  const { expertReqIds } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/submitHead`, {
    method: 'PUT',
    body: expertReqIds,
  });
}

/**
 *
 * 查询专业领域树结构
 * @export
 * @returns
 */
export async function queryTransfer(params) {
  return request('/hpfm/v1/lovs/value/tree?SSRC.EXPERT_FIELD=1', {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询操作记录接口
 */
export async function queryRecordList(params) {
  const { expertReqId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req-actions/${expertReqId}`, {
    method: 'GET',
    query,
  });
}

/**
 *查询专家库注册申请明细
 *
 * @export
 * @param {Number} params.expertReqId
 * @returns
 */
export async function fetchExpertReq(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/queryDetail/${params.expertReqId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 保存 - 专家库注册明细
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function requisitionSave(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 删除 - 专家库注册明细
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function requisitionDelete(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/${params.expertReqId}/delete`, {
    method: 'DELETE',
    query: { customizeUnitCode },
  });
}

/**
 * 取消 - 专家库注册明细
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function requisitionCancel(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/cancel`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 提交 - 专家库注册明细
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function requisitionSubmit(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/submitInvoice`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 删除 - 专家库 tabs的table
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function tableDelete(params) {
  const { functionName, idList, isReq } = params;
  const interfaceNameMap = isReq
    ? {
        field: 'expert-field-req',
        achievement: 'expert-achv-req',
        careerPortfolio: 'expert-career-req',
        educationExperience: 'expert-education-req',
        enclosure: 'expert-attachment-req',
      }
    : {
        field: 'expert-field',
        achievement: 'expert-achv',
        careerPortfolio: 'expert-career',
        educationExperience: 'expert-education',
        enclosure: 'expert-attachment',
      };
  const interfaceName = interfaceNameMap[functionName];
  return request(`${SRM_SSRC}/v1/${organizationId}/${interfaceName}`, {
    method: 'DELETE',
    body: [...idList],
  });
}

/**
 * 查询 - 专家信息维护明细
 *
 * @export
 * @param {Number} params.userId
 * @returns
 */
export async function fetchDetailPersonal(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert/personalDetail/${params.userId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 查询 - 专家信息维护明细
 *
 * @export
 * @param {Number} params.userId
 * @returns
 */
export async function saveDetailPersonal(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert/personal`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 查询 - 专家信息维护明细
 *
 * @export
 * @param {Number} params.userId
 * @returns
 */
export async function saveDetailAdmin(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert/admin`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 通过 - 专家注册申请审批
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function approveExpert(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/approve-req`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 拒绝 - 专家注册申请审批
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function rejectExpert(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert-req/reject-req`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 查询 - 专家信息维护明细(管理员)
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchDetailAdmin(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expert/queryExportDetail/${params.expertId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 动态查询省/市
 * @param {*} params
 * @returns
 */
export async function loadProvinceCityData(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/regions/regional-linkage`, {
    method: 'GET',
    query: params,
  });
}
