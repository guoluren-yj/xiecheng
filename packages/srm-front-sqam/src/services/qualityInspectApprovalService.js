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

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchList(params) {
  const customizeUnitCode =
    'SQAM.QUALITY_INSPECT_APPROVAL_LIST.FILTER,SQAM.QUALITY_INSPECT_APPROVAL_LIST.GRID';
  // const { customizeUnitCode } = params;
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
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/maintain`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询送货单详情行
 * @export
 * @param {Number} params
 */
export async function fetchDetailHeader(params) {
  const { id, customizeUnitCode } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/detail/${id}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      // query: params,
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
export async function fetchDefectList(params) {
  const { id, ...otherParams } = params;
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
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections`, {
    method: 'POST',
    body: params,
  });
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
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/submit-batch`, {
    method: 'POST',
    body,
  });
}

export async function deleteData(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/delete`, {
    method: 'DELETE',
    body,
  });
}

export async function approvalData(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/approved`, {
    method: 'POST',
    body,
  });
}

export async function fetchOperatorData(params) {
  const { inspectionId } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/incoming-inspection-records/${inspectionId}/page`
  );
}
