/**
 * service - 推荐申请单
 * @date: 2018-9-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *
 *查询品类、物料
 * @export
 * @function queryRecommend
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @returns
 */
export async function queryRecommend(params) {
  const { requisitionId, customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend/${requisitionId}`, {
    method: 'GET',
    query: { ...others, customizeUnitCode: customizeUnitCode.join(',') },
  });
}
/**
 *保存推荐申请单数据
 *
 * @export
 * @function saveRecommend
 * @param {Number} params.organizationId 租户Id
 * @param {Object} params.other 页面上需要保存的数据
 * @returns
 */
export async function saveRecommend(params) {
  const { pubEdit, customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend`, {
    method: 'POST',
    query: { pubEdit, customizeUnitCode: customizeUnitCode.join(',') },
    body,
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
  const { itemLineIdList, requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend-item-line/${requisitionId}`,
    {
      method: 'DELETE',
      body: [...itemLineIdList],
    }
  );
}
/**
 *删除附件表格行数据
 *
 * @export
 * @function deleteEnclosureData
 * @param {Array} params.itemLineIdList 附件主键
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @returns
 */
export async function deleteEnclosureData(params) {
  const { attachmentLineIdList, requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend-attachment-line/${requisitionId}`,
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
 * @function submitRecommend
 * @param {Number} params.organizationId 租户Id
 * @param {Object} params.otherParams 页面上需要保存的数据
 * @returns
 */
export async function submitRecommend(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend/submit`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join(',') },
    body,
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
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend/${requisitionId}`, {
    method: 'DELETE',
  });
}

/**
 * 发起评审
 */
export async function scoreRecommend(params) {
  const { customizeUnitCode, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend/${params.requisitionId}/score`,
    {
      method: 'POST',
      query: { customizeUnitCode: customizeUnitCode.join(',') },
      body: others,
    }
  );
}

/**
 *废弃申请单
 *
 * @export
 * @function deteleForm
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function obsoletedRecommend(params) {
  const { requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend/${requisitionId}/obsoleted`,
    {
      method: 'POST',
    }
  );
}

// 打印
export async function handlePrint(params) {
  const { requisitionId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend/${requisitionId}/print`, {
    method: 'GET',
    query: others,
  });
}
