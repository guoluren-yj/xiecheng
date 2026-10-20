/*
 * deliveryCreationService - 送货单创建
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SPUC, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询批量导入配置
export async function queryCommonImportConfig() {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/purchaser/can-create-asn/import-control`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询送货单创建列表的数据
 * 可送货订单发运行查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryCreateList(params) {
  const query = filterNullValueObject(
    parseParameters({ ...params, supplierTenantId: getUserOrganizationId() })
  );
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser/can-create-asn`, {
    query,
  });
}

/**
 * 查询送货单维护列表的数据
 * 送货单汇总查询—供应商
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryMaintenanceList(params) {
  const query = filterNullValueObject(
    parseParameters({ ...params, supplierTenantId: getUserOrganizationId() })
  );
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier/maintain`, {
    query,
  });
}

/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryReceiveTransactionDetails(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/supplierReceiptRecord-list`, {
    query,
  });
}

/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryReceiveTransactionASNDetails(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/supplierReceiptRecord-list`, {
    query,
  });
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}

/**
 * 送货单头查询
 * @param {!number} asnHeaderId - 送货单头ID
 * @param {Object} params - 查询参数
 */
export async function queryDetailHeader(params) {
  // const query = filterNullValueObject(
  //   parseParameters({ ...params, supplierTenantId: getUserOrganizationId() })
  // );
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${params.asnHeaderId}`, {
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
  });
}

/**
 * 送货单行查询-不分页
 * @param {!number} asnHeaderId - 送货单头ID
 */
export async function queryDetailList(params) {
  const query = filterNullValueObject(parseParameters({ ...params }));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${params.asnHeaderId}/lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 送货单保存
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function saveDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header`, {
    method: 'PUT',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
  });
}

/**
 * 创建送货单
 * @async
 * @function batchCreateDelivery
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
// export async function batchCreateDelivery(data) {
//   return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/create-by-po`, {
//     method: 'POST',
//     body: data,
//   });
// }
export async function batchCreateDelivery(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/create-by-po-new`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 送货单删除
 * @async
 * @function deleteDelivery
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function batchDeleteDelivery(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 送货单提交
 * @async
 * @function submitDelivery
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function submitDelivery(params) {
  const { customizeUnitCode = '', data = [] } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: data,
  });
}

/**
 * 送货单操作记录查询
 * @async
 * @function submitDelivery
 * @param {!number} organizationId - 组织ID
 * @param {!number} asnHeaderId - 送货单主键
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @returns {object} fetch Promise
 */
export async function queryOperationRecord(asnHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/action`, {
    query,
  });
}

/**
 * 可新增订单发运行查询
 * @async
 * @function queryDetailCreateList
 * @param {!number} organizationId - 组织ID
 * @param {!number} asnHeaderId - 送货单主键
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @returns {object} fetch Promise
 */
export async function queryDetailCreateList(asnHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/lines/add`, {
    query,
  });
}

/**
 * 送货单行新增
 * @async
 * @function addDetailLines
 * @param {!number} organizationId - 组织ID
 * @param {!number} asnHeaderId - 送货单主键
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function addDetailLines(asnHeaderId, data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/lines`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 送货单行删除
 * @async
 * @function deleteDetailLines
 * @param {!number} organizationId - 组织ID
 * @param {!number} asnHeaderId - 送货单主键
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteDetailLines(asnHeaderId, data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/lines`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 送货单头附件ID刷新
 * @async
 * @function getHeaderAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getHeaderAttachmentUuid(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/attachment-uuid`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 送货单行附件ID刷新
 * @async
 * @function getLineAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getLineAttachmentUuid(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/lines/attachment-uuid`, {
    method: 'PUT',
    body: data,
  });
}
/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 查询配置
 */
export async function fetchBusinessRule() {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/purchaser/can-create-asn/plan-control`,
    {
      method: 'GET',
    }
  );
}

/**
 * 送货单采购方行附件ID刷新
 * @async
 * @function getLineAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getPurLineAttachmentUuid(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/lines/attachment-uuid`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 查询Table页
 */
export async function fetchDetailTable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/creating/asn/list`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 销毁Table页
 */
export async function over(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/creating/asn/list`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 查询配置
 */
export async function fetchBOM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    method: 'GET',
    query: params,
  });
}

export async function saveBOM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    method: 'POST',
    body: params,
  });
}

export async function regulation(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/query-business-rules?paramStr=${params.paramStr}&rulesCode=${params.rulesCode}`,
    {
      method: 'GET',
      // query: params,
    }
  );
}
