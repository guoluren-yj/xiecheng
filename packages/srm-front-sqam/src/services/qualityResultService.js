/**
 * qualityResultService - 质检结果查询
 * @date: 2020-4-9
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SQAM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchList(params) {
  const customizeUnitCode = 'SQAM.QUALITY_RESULT_LIST.FILTER,SQAM.QUALITY_RESULT_LIST.GRID';
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
  const { id, customizeUnitCode, pathSource } = params;
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
