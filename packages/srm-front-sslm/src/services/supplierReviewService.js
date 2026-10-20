/**
 * service - 合格供应商评审
 * @date: 2018-9-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSLM } from '_utils/config';
import { filterNullValueObject, parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 *查询合格供应商评审列表
 * @export
 * @function querySupplierReview
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} params.companyId - 公司Id
 * @param {Number} params.qualifiedNumber - 申请单号
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @param {Date} params.releaseDateFrom 发布日期从
 * @param {Date} params.releaseDateTo 发布日期到
 * @param {String} params.gradeCode 操作状态
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function querySupplierReview(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/score`, {
    method: 'GET',
    query: param,
  });
}
/**
 *
 * 查询合格供应商详情
 * @async
 * @function queryDetail
 * @param {*} params.requisitionId - 申请单Id
 * @returns {Object} fetch Promise
 */
export async function queryDetail(params) {
  const { requisitionId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/supplier`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 删除文件服务器中的文件
 * @async
 * @function onDraggerUploadRemove
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - url列表
 * @returns {Object} fetch Promise
 */
export async function onDraggerUploadRemove(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}
/**
 *保存数据
 *
 * @export
 * @function saveSupplierReview
 * @param {Object} params - 批量全部保存的所有数据
 * @returns {Object} fetch Promise
 */
export async function saveSupplierReview(params) {
  const { requisitionId, data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/supplier`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}
/**
 *提交评审
 *
 * @export
 * @function submitSupplierReview
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} params.requisitionId - 申请单Id
 * @returns {Object} fetch Promise
 */
export async function submitSupplierReview(params) {
  const { requisitionId, data, customizeUnitCode } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/submit/supplier`,
    {
      method: 'POST',
      body: data,
      query: { customizeUnitCode },
    }
  );
}
/**
 * 删除附件表格中的数据
 * @async
 * @function deleteEnclosureData
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} params.requisitionId - 申请单Id
 * @param {Array} params.attachmentLineIdList - 删除行的Id
 * @returns {Object} fetch Promise
 */
export async function deleteEnclosureData(params) {
  const { requisitionId, attachmentLineIdList } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${requisitionId}/attachment/batchDelete`,
    {
      method: 'POST',
      body: attachmentLineIdList,
    }
  );
}
/**
 * 查询供应商分类
 * @async
 * @function querySupplierClassification
 * @param {Number} params.supplierCompanyId - 供应商Id
 * @param {Number} params.supplierTenantId - 供应商租户Id
 * @param {Number} params.supplierCompanyId - 供应商Id
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function querySupplierClassification(params) {
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-ctg-alter-lines/${requisitionId}`, {
    method: 'GET',
  });
}

/**
 *查询供货能力清单
 *
 * @export
 * @function queryReviewDetail
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryReviewDetail(params) {
  const { requisitionId, ...otherParams } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/supply-abilitys/detail`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 *查询推荐物料/品类
 */
export async function queryMaterialsCategories(params) {
  const { requisitionId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/recommend-item-line/${requisitionId}`,
    {
      method: 'GET',
      query,
    }
  );
}
