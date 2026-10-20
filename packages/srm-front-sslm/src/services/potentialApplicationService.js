/**
 * service - 潜在申请单
 * @date: 2018-9-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const currentOrganizationId = getCurrentOrganizationId();

/**
 *
 *查询品类、物料
 * @export
 * @function queryPotential
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @returns
 */
export async function queryPotential(params) {
  const { organizationId, requisitionId, customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/potential/${requisitionId}`, {
    method: 'GET',
    query: { ...others, customizeUnitCode: customizeUnitCode.join(',') },
  });
}
/**
 *保存推荐申请单数据
 *
 * @export
 * @function savePotential
 * @param {Number} params.organizationId 租户Id
 * @param {Object} params.other 页面上需要保存的数据
 * @returns
 */
export async function savePotential(params) {
  const { pubEdit, organizationId, customizeUnitCode, ...other } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/potential`, {
    method: 'POST',
    query: { pubEdit, customizeUnitCode: customizeUnitCode.join(',') },
    body: other,
  });
}
/**
 *删除表格行数据
 *
 * @export
 * @function deleteData
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @param {Array} params.itemLineIdList 物料/品类主键
 * @returns
 */
export async function deleteData(params) {
  const { organizationId, itemLineIdList, requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/potential-line/${requisitionId}`, {
    method: 'DELETE',
    body: [...itemLineIdList],
  });
}
/**
 *删除附件行数据
 *
 * @export
 * @function deleteEnclosureData
 * @param {Array} params.itemLineIdList 附件主键
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @returns
 */
export async function deleteEnclosureData(params) {
  const { organizationId, attachmentLineIdList, requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/potential-attachment-line/${requisitionId}`,
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
 * @function submitPotential
 * @param {Number} params.organizationId 租户Id
 * @param {Object} params.otherParams 页面上需要保存的数据
 * @returns
 */
export async function submitPotential(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/potential/submit`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join(',') },
    body: otherParams,
  });
}
/**
 *删除申请单
 *
 * @export
 * @function deteleForm
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function deteleForm(params) {
  const { organizationId, requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/potential/${requisitionId}`, {
    method: 'DELETE',
  });
}

/**
 * 发起评审
 */
export async function scorePotential(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/potential/${params.requisitionId}/score`,
    {
      method: 'POST',
      query: { customizeUnitCode: customizeUnitCode.join(',') },
      body: others,
    }
  );
}

/**
 * 废弃申请单
 */
export async function obsoletedPotential(params) {
  const { requisitionId, organizationId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/potential/${requisitionId}/obsoleted`,
    {
      method: 'POST',
    }
  );
}

/*
 * 打印
 */
export async function handlePrint(params) {
  const { requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${currentOrganizationId}/life-cycle/potential/${requisitionId}/print`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}
