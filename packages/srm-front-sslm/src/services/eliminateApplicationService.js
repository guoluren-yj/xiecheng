/**
 * service - 淘汰申请单
 * @date: 2018-9-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const prefix = `${SRM_SSLM}/v1`;
const currentOrganizationId = getCurrentOrganizationId();

/**
 *
 *查询品类、物料
 * @export
 * @function queryEliminate
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 申请单头Id
 * @returns
 */
export async function queryEliminate(params) {
  const { organizationId, requisitionId, ...others } = params;
  return request(`${prefix}/${organizationId}/life-cycle/degrade/${requisitionId}`, {
    method: 'GET',
    query: others,
  });
}
/**
 *保存推荐申请单数据
 *
 * @export
 * @function saveEliminate
 * @param {Object} params
 * @returns
 */
export async function saveEliminate(params) {
  const { pubEdit, organizationId, tenantId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/life-cycle/degrade`, {
    method: 'POST',
    body: filterNullValueObject(other),
    query: {
      tenantId,
      pubEdit,
      customizeUnitCode: customizeUnitCode.join(','),
    },
  });
}
/**
 *删除表格行数据
 *
 * @export
 * @function deleteEnclosureData
 * @param {Array} params.attachmentLineIdList - 附件主键
 * @param {Number} params.requisitionId - 申请单Id
 * @returns
 */
export async function deleteEnclosureData(params) {
  const { organizationId, attachmentLineIdList, requisitionId } = params;
  return request(
    `${prefix}/${organizationId}/life-cycle/degrade-attachment-line/${requisitionId}`,
    {
      method: 'DELETE',
      body: [...attachmentLineIdList],
    }
  );
}
/**
 *提交申请单
 *
 * @export
 * @function submitEliminate
 * @param {Number} params.organizationId - 租户Id
 * @param {Object} params.otherParams - 页面上需要保存的数据
 * @returns
 */
export async function submitEliminate(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/life-cycle/degrade/submit`, {
    method: 'POST',
    body: otherParams,
    query: { customizeUnitCode: customizeUnitCode.join(',') },
  });
}
/**
 *删除申请单
 *
 * @export
 * @function deteleForm
 * @param {Number} params.requisitionId - 申请单Id
 * @param {Number} params.organizationId - 租户Id
 * @returns
 */
export async function deteleForm(params) {
  const { organizationId, requisitionId } = params;
  return request(`${prefix}/${organizationId}/life-cycle/degrade/${requisitionId}`, {
    method: 'DELETE',
  });
}

/**
 * 废弃申请单
 */
export async function obsoletedEliminate(params) {
  const { requisitionId, organizationId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/degrade/${requisitionId}/obsoleted`, {
    method: 'POST',
  });
}

/*
 * 打印
 */
export async function handlePrint(params) {
  const { requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${currentOrganizationId}/life-cycle/degrade/${requisitionId}/print`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}
