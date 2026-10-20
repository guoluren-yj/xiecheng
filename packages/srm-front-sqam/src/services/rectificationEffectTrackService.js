/**
 * service - 沿用我收到的8D
 * @date: 2018-11-27
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;

/**
 * 查询消息模板列表数据
 * @async
 * @function search8D
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function search8D(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${param.tenantId}/problem-headers`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询基本信息数据
 * @async
 * @function search8DDetail
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function search8DDetail(params) {
  const { customizeUnitCode, menuEntryPoint } = params;
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/detail?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: filterNullValueObject({ menuEntryPoint }),
    }
  );
}

/**
 * 操作记录查询
 * @async
 * @function fetchOperatorRecord
 * @param {object} params - 查询条件
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function fetchOperatorRecord(params) {
  return request(`${prefix}/operation-historys/${params.problemHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 历史版本查询
 * @async
 * @function fetchHistoryVersion
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function fetchHistoryVersion(params) {
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/page-his`,
    {
      method: 'GET',
    }
  );
}

/**
 * 关联8D
 */
export async function fetchAssociation(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SQAM}/v1/${organizationId}/header-associates/${params.problemHeaderId}/assocaite/Receive`,
    {
      method: 'GET',
    }
  );
}

export async function fetchSourceInfo(params) {
  const { tenantId, problemHeaderId, ...query } = params;
  return request(`${prefix}/${tenantId}/ed-problem-inspections/${problemHeaderId}`, {
    query,
  });
}

// 关联8D
export async function relation8D(params) {
  const { tenantId, problemHeaderId, ...others } = params;
  return request(`${prefix}/${tenantId}/header-associates/${problemHeaderId}/assocaite`, {
    method: 'GET',
    query: parseParameters(others),
  });
}

export async function update8D(params) {
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.EFFECT_TRACK_DETAIL.PROBLEM,SQAM.EFFECT_TRACK_DETAIL.GROUPMEMB,SQAM.EFFECT_TRACK_DETAIL.TEAMCONGRATULATIONS,SQAM.EFFECT_TRACK_DETAIL.RESULTSTRACKING,SQAM.EFFECT_TRACK_DETAIL.OTHERINFO,SQAM.EFFECT_TRACK_DETAIL.OTHERINFO_A';
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params.data,
    }
  );
}

export async function completeTrack(params) {
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.EFFECT_TRACK_DETAIL.PROBLEM,SQAM.EFFECT_TRACK_DETAIL.GROUPMEMB,SQAM.EFFECT_TRACK_DETAIL.TEAMCONGRATULATIONS,SQAM.EFFECT_TRACK_DETAIL.RESULTSTRACKING,SQAM.EFFECT_TRACK_DETAIL.OTHERINFO,SQAM.EFFECT_TRACK_DETAIL.OTHERINFO_A';
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/finish-track?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params.data,
    }
  );
}

// 查询关联采购订单
export async function fetchPurchaseOrder(params) {
  const { tenantId, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos/${problemHeaderId}/query`);
}
