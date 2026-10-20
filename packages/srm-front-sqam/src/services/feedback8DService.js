/**
 * service - 8D反馈
 * @date: 2018-11-27
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, filterNullValueObject } from 'utils/utils';

// const customizeUnitCodes = [
//   'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
//   'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
//   'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
//   'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
//   'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
//   'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
//   'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
//   'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
// ].join();
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;

/**
 * 反馈8D 列表查询
 * @async
 * @function search8D
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function search8D(params) {
  const param = parseParameters(params);
  const customizeUnitCode = 'SQAM.FEEDBACK_8D_LIST.GRID,SQAM.FEEDBACK_8D_LIST.FILTER_FORM';
  return request(
    `${prefix}/${param.tenantId}/problem-headers?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
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
  const { customizeUnitCodes, menuEntryPoint } = params;
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/detail?customizeUnitCode=${customizeUnitCodes}`,
    {
      method: 'GET',
      query: filterNullValueObject({ menuEntryPoint }),
    }
  );
}

/**
 * 8D 保存
 * @async
 * @function save8D
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function save8D(params) {
  const { customizeUnitCodes } = params;
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/save?customizeUnitCode=${customizeUnitCodes}`,
    {
      method: 'POST',
      body: params.data,
    }
  );
}

/**
 * 8D 提交
 * @async
 * @function submit8D
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function submit8D(params) {
  const { customizeUnitCodes } = params;
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/submit?customizeUnitCode=${customizeUnitCodes}`,
    {
      method: 'POST',
      body: params.data,
    }
  );
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
 * 审批意见
 * @async
 * @function fetchApprovalOpinion
 * @param {object} params - 查询条件
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function fetchApprovalOpinion(params) {
  return request(`${prefix}/operation-historys/${params.problemHeaderId}/approval`, {
    method: 'GET',
  });
}

/**
 * 保存attachmentUUID
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!number} params.problemHeaderId - 问题单ID
 * @param {!string} params.uuid - uuid
 * @param {!number} params.uuidType - uuid类型(1: 采购方；2：供应商)
 * @param {!object} params.data - 问题单对象
 */
export async function saveUUID(params) {
  const { tenantId, problemHeaderId, ...others } = params;
  return request(`${prefix}/${tenantId}/problem-headers/${problemHeaderId}/attachment-uuid`, {
    method: 'POST',
    query: { ...others },
  });
}

export async function removeMembers(params) {
  const { members, tenantId, optcamp } = params;
  return request(`${prefix}/${tenantId}/ed-problem-teams?optcamp=${optcamp}`, {
    method: 'DELETE',
    body: [...members],
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

export async function fetchSourceInfo(params) {
  const { tenantId, problemHeaderId, ...query } = params;
  return request(`${prefix}/${tenantId}/ed-problem-inspections/${problemHeaderId}`, {
    query,
  });
}

// 查询关联采购订单
export async function fetchPurchaseOrder(params) {
  const { tenantId, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos/${problemHeaderId}/query`);
}

// 编辑
export async function getEdit(params) {
  const { tenantId, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/problem-headers/cnfFormControl/${problemHeaderId}`);
}
