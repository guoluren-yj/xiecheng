/**
 * supplierDeliveryService - 供应商送货单
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SQAM, SRM_SPUC } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';
// import { HZERO_RPT } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SQAM}/v1`;
/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchList(params) {
  const customizeUnitCode =
    'SQAM.INCOMING_INSPECTION_QUERY_LIST.FILTER,SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: parseParameters(params),
    }
  );
}

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchListMaintain(params) {
  const customizeUnitCode = 'SQAM.INCOMING_INSPECTION_CREATE_LIST.GRID';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/maintain?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: parseParameters(params),
    }
  );
}

/**
 * 查询送货单详情行
 * @export
 * @param {Number} params
 */
export async function fetchDetailHeader(params) {
  const { id, customizeUnitCode, pathSource = '' } = params;

  const url = pathSource.includes('/detail-from-inspection-num') ? `query-by-dto` : `${id}`;
  const query = { customizeUnitCode };
  if (pathSource.includes('/detail-from-inspection-num')) {
    query.inspectionNum = id;
  }
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/detail/${url}`, {
    method: 'GET',
    query,
  });
}

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchDefectList(params) {
  const { id, ...otherParams } = params;
  otherParams.customizeUnitCode = 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DEFECT';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/incoming_inspection_defect/${id}`,
    {
      method: 'GET',
      query: parseParameters(otherParams),
    }
  );
}

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchDetectionList(params) {
  const { id, ...otherParams } = params;
  otherParams.customizeUnitCode = 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DETECT';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/incoming_inspection_detect/${id}`,
    {
      method: 'GET',
      query: parseParameters(otherParams),
    }
  );
}

/**
 * fetchSave
 * @param {object} params
 */
export async function fetchSave(params) {
  const { customizeUnitCode } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * fetchSave
 * @param {object} params
 */
export async function fetchSaveAttachmentUuid(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/attachment-uuid`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchSave
 * @param {object} params
 */
export async function fetchOperationRecordList(params) {
  const { inspectionId, ...otherParams } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspection-records/${inspectionId}/page`,
    {
      method: 'GET',
      query: parseParameters(otherParams),
    }
  );
}

export async function fetchApprovalRecordList(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/activiti/task/historyApproval`, {
    method: 'POST',
    query: parseParameters(params),
  });
}

export async function fetchCount() {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-inspection-count`);
}

export async function fetchUnInspection(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-inspection`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function quoteAndCreate(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/save-from-rcv`, {
    method: 'POST',
    body,
  });
}

export async function submitData(body) {
  const customizeUnitCode =
    'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/submit-batch?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body,
    }
  );
}

export async function deleteData(body) {
  const { customizeUnitCode } = body;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/delete?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'DELETE',
      body,
    }
  );
}
// 同步
export async function fetchSync(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/sync`, {
    method: 'POST',
    body,
  });
}
// 查询一维码
export async function barCode(params) {
  const { itemCode } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${itemCode}/bar-code`, {
    method: 'GET',
    responseType: 'blob',
  });
}
/**
 * 质检结果查询-批量打印
 * @param {object} params
 */
export async function fetchListPrint(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/batch/print`, {
    method: 'POST',
    responseType: 'blob',
    body: params,
  });
}
/**
 * 质检结果查询-明细页面打印
 * @param {object} params
 */
export async function fetchRecordPrint(params) {
  const { inspectionId } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/${inspectionId}/query-print`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}
/**
 * 质量检验创建-批量删除
 * @async
 * @function delete8D
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - 问题单数组
 * @returns {object} fetch Promise
 */
export async function fetchListDelete(params) {
  return request(`${prefix}/${params.tenantId}/incoming-inspections/delete-batch`, {
    method: 'DELETE',
    body: params.data,
  });
}
/**
 * 质检结果查询-取消
 * @param {object} params
 */
export async function fetchCancel(body) {
  const { customizeUnitCode, IncomingInspectionDetailDTO } = body;

  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/cancel?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: IncomingInspectionDetailDTO,
    }
  );
}

export async function fetchOtherList(params) {
  const { queryType, id, ...otherParams } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incominginspectionexpandlines/${id}/${queryType}_LINE`,
    {
      method: 'GET',
      query: parseParameters(otherParams),
    }
  );
}
