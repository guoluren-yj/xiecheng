/*
 * @Description: contractChangeService - 协议变更
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-11-12 11:05:55
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { SRM_SPCM, SRM_SCEI, SRM_SCEC, SRM_MDM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * -查询列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/change/page`, {
    method: 'GET',
    query,
  });
}

/**
 * -更改合同状态
 * @param {Object} body - 传递参数
 */
export async function changeContractStatus(body) {
  const { pcHeaderStatus, terminationReason, pcHeaderDetailDtos } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/change-status`, {
    method: 'PUT',
    query: { pcHeaderStatus, terminationReason },
    body: pcHeaderDetailDtos,
  });
}

/**
 * -作废请求
 * @param {Object} body - 传递参数
 */
export async function invalidApproval(body) {
  const { pcHeaderDetailDtos } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/invalid-approval`, {
    method: 'PUT',
    // query: { pcHeaderStatus },
    body: pcHeaderDetailDtos,
  });
}

/**
 * -提交采购协议
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */

/**
 * -协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchDetailHeader(pcHeaderId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-header/${pcHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 合作伙伴行查询
 * @param {String} params - 参数
 */
export async function fetchPartner(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-partner/${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 合作伙伴行查询
 * @param {String} params - 参数
 */
export async function fetchSubject(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-subject/${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 业务条款行查询
 * @param {String} params - 参数
 */
export async function fetchTerm(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-term/${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}
/* 获取操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/actions`, {
    method: 'GET',
    query,
  });
}
/**
 * 新增采购申请头
 * @async
 * @function add
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function add({ customizeUnitCode, ...body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'POST',
    query: { customizeUnitCode },
    body,
  });
}
/**
 * 更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function update({ customizeUnitCode, ...body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: filterNullValueObject(body),
  });
}

/**
 * 更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function changeContract(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'PUT',
    body: filterNullValueObject(body),
  });
}
export async function submit({ customizeUnitCode, pcHeaderList }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: pcHeaderList,
  });
}
/**
 * 删除协议拟制
 * @async
 * @function deleteHeader
 * @param {object} params - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteHeader(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 取消采购申请
 * @async
 * @function cancel
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function cancel(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-requests/cancel`, {
    method: 'POST',
    body,
  });
}
/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindHeaderAttachmentUuid(query) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-requests/attachment-uuid`, {
    method: 'POST',
    query,
  });
}
/**
 * 绑定行附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindLineAttachmentUuid(query) {
  const { prHeaderId, ...otherQuery } = query;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines/attachment-uuid`,
    {
      method: 'POST',
      query: otherQuery,
    }
  );
}
/**
 * 删除标的信息行
 * @async
 * @function pcSubjectLinesDelete
 * @returns {object} fetch Promise
 */
export async function pcSubjectLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/batch`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 删除合作伙伴信息行
 * @async
 * @function partnerLinesDelete
 * @returns {object} fetch Promise
 */
export async function partnerLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/batch`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 删除业务条款信息行
 * @async
 * @function termLinesDelete
 * @returns {object} fetch Promise
 */
// export async function termLinesDelete(lines) {
//   return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-subject`, {
//     method: 'DELETE',
//     body: lines,
//   });
// }

/**
 * 查询支付方式值集
 * @export
 * @param {Object} params
 */
export async function queryPaymentMethod(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-payments/by-company`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询收单地址
 * @export
 * @param {Object} params
 */
export async function queryInvoiceAddress(params) {
  const query = filterNullValueObject(parseParameters(params));
  const res = request(`${SRM_SCEC}/v1/${organizationId}/addresss/list`, {
    method: 'GET',
    query,
  });
  return getResponse(res);
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 操作记录
 * @param {Object} params
 */
export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, pcHeaderId, ...otherQuery } = query;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 查询合作伙伴类型值集
 * @param {Object} params
 */
export async function fetchPcPartnerTypes(params) {
  const query = filterNullValueObject(params);
  const { pcTypeId, ...otherQuery } = query;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-partner/list`,
    {
      method: 'GET',
      query: otherQuery,
    }
  );
}

/**
 * 查询协议阶段值集
 * @param {Object} params
 */
export async function fetchStageOptions(params) {
  const query = filterNullValueObject(params);
  const { pcTypeId, ...otherQuery } = query;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-stage/enable/page`,
    {
      method: 'GET',
      query: otherQuery,
    }
  );
}

/**
 * 更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function updateContractTextUrl(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/contract-attachment-url`, {
    method: 'PUT',
    body,
  });
}

/**
 * 查询公司拓展信息
 * @export
 * @param {*} params
 */
export async function fetchExtended(params) {
  const { companyId, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/extended`,
    {
      method: 'GET',
      query: { companyId },
    }
  );
}
/**
 * 删除阶段信息行
 * @async
 * @function pcSubjectLinesDelete
 * @returns {object} fetch Promise
 */
export async function pcStageLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/batch`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 标的增加
 * @param {String} params - 参数
 */
export async function saveSubject(params) {
  const { pcHeaderId, customizeUnitCode, ...otherQuery } = params;
  const arr = Object.values(otherQuery);
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-subject`, {
    method: 'PATCH',
    query: { pcHeaderId, customizeUnitCode },
    body: arr,
  });
}
