/**
 * commonApplicationService.js - 供应商生命周期表单通用 service
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商生命周期明细
 * @function queryLifecycleInfo
 * @param {Number} params.organizationId - 租户Id
 * @param {String} params.dimensionCode - 管控维度
 * @param {Number} params.companyId - 公司Id
 * @param {Number} params.supplierCompanyId - 公司Id
 * @returns
 */
export async function queryLifecycleInfo(params) {
  const { customizeUnitCode = [], ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycles/single`, {
    method: 'GET',
    query: { ...others, customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 查询供货能力清单表
 * @export
 * @function queryReviewDetail
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.supplierCompanyId 供应商Id
 * @param {Number} params.itemCategoryId 采购品类Id
 * @param {Number} params.itemId 物料Id
 * @param {String} params.createUserName 创建人
 * @param {Date} params.startCreateDate 创建日期从
 * @param {Date} params.endCreateDate 创建日期到
 * @param {String} params.companyName 公司名
 * @param {Date} params.startUpdateDate 最后更新日期从
 * @param {Date} params.endUpdateDate 最后更新日期到
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns
 */
export async function queryReviewDetail(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail`, {
    method: 'GET',
    query: filterNullValueObject({
      ...others,
      customizeUnitCode: customizeUnitCode.join(','),
      isAllSupplyAbilitys: 0, // 区分生命周期申请单和供货能力清单明细查询标识
    }),
  });
}

/**
 *查询供应商分类
 *
 * @export
 * @function querySupplierClassification
 * @param {Number} params.supplierCompanyId - 供应商Id
 * @param {Number} params.supplierTenantId - 供应商租户Id
 * @param {Number} params.supplierCompanyId - 供应商Id
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns
 */
export async function querySupplierClassification(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-assign/queryAssign`, {
    method: 'GET',
    query: { isAssignFlag: 1, ...param },
  });
}

/**
 * 删除供应商分类
 */
export async function deleteClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-ctg-alter-lines/batchDel`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除文件服务器中的文件
 * @function onDraggerUploadRemove
 * @export
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - url列表
 * @returns
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
 * 查询评分信息
 * @param {Object} params - 查询对象
 */
export async function queryQualifiedScoreInfo(params) {
  const { evalTplId, customizeUnitCode = '' } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/leaf`, {
    method: 'GET',
    query: {
      evalTplId,
      customizeUnitCode,
      // enabledFlag: 1,
      // page: pagination.current - 1 || 0,
      // size: pagination.pageSize || 10,
    },
  });
}

/**
 * 查询评分人列表
 * @param {Object} params - 查询参数
 */
export async function queryScorer(params) {
  const { requisitionId, indicateLineId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/${indicateLineId}/query`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 批量维护评分人信息
 */
export async function batchMaintainGrader(params) {
  const { requisitionId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/batchCover`, {
    method: 'POST',
    body: others,
  });
}

/**
 * 保存评分人
 * 修改支持修改权重
 * @param {Object} params - 创建或保存参数
 */
export async function saveScorer(params) {
  const { requisitionId, indicateLineId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/${indicateLineId}/scorer`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 删除评分人
 * 传行 ID 列表
 * @param {Object} params - 删除参数
 */
export async function deleteScorer(params) {
  const { requisitionId, indicateLineId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/${indicateLineId}/scorer/batchDelete`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 评分模板适用校验
 * @param {Object} params - 参数
 */
export async function validateSuitable(params) {
  const { templateId, supplierCompanyId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/scope/validateSuitable/${supplierCompanyId}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * 查询供货能力清单行附件
 * @async
 * @function queryOperation
 * @param {Number} params.abilityLineId - 供货能力清单行Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryLineAttachment(params) {
  const { itemLineId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/life-ability-item-ln-atts/${itemLineId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存供货能力清单行附件
 * @async
 * @function saveOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function saveLineAttachment(params) {
  const { tableValues, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-ability-item-ln-atts`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/**
 * 删除供货能力清单行附件
 * @async
 * @function deleteOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function deleteLineAttachment(params) {
  const { attIdList, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-ability-item-ln-atts`, {
    method: 'DELETE',
    body: attIdList,
    query: { customizeUnitCode },
  });
}

/**
 * 获取单据操作记录
 * @async
 * @function queryOperation
 * @param {string} [params.processType] - api 类型
 * @param {Number} [params.requisitionId ] - 申请单Id
 * @returns {Object} fetch Promise
 */
export async function getOperationsRecord({ processType, requisitionId }) {
  return request(
    // 判读是不是注册申请单
    processType === 'register'
      ? `${SRM_SSLM}/v1/${organizationId}/investg-process-recs/${requisitionId}`
      : `${SRM_SSLM}/v1/${organizationId}/life-cycle/${processType}-process-record${
          // 合格申请单api 更换 判读
          processType === 'qualified' ? '/up' : ''
        }/${requisitionId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取单据审批记录
 * @async
 * @function getReviewRecord
 * @param {Number} [params.requisitionId ] - 申请单Id
 * @returns {Object} fetch Promise
 */
export async function getReviewRecord({ requisitionId }) {
  const documentType = 'LIFE_CYCLE';
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/approval-records/${requisitionId}`, {
    method: 'GET',
    query: {
      documentType,
    },
  });
}

/**
 * 查询采购/财务页签历史数据
 */
export async function queryPurchaseData(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-change-syncs/findSync`, {
    method: 'GET',
    query: { ...params, customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 查询采购/财务页签头信息
 */
export async function queryPurchaseHeader(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-change-syncs`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询采购/财务页签行信息
 */
export async function queryPurchaseLines(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/life-change-sync-pfs`, {
    method: 'GET',
    query,
  });
}

/**
 * 删除采购/财务页签行信息
 */
export async function deletePurchaseLines(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-change-sync-pfs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 退回评分
 * @param {object} params
 * @param {object[]} records - 要删除的记录
 * @return {Promise<void>}
 */
export async function backScore(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${params.requisitionId}/back`, {
    method: 'POST',
    body: filterNullValueObject(params),
  });
}

/**
 *
 *查询生命周期管理申请单-评分信息
 * @export
 * @function queryScoreInfo
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @returns
 */
export async function queryScoreInfo(params) {
  const { requisitionId, customizeUnitCode, stageCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/indicate`, {
    method: 'GET',
    query: {
      ...filterNullValueObject(others),
      stageCode,
      customizeUnitCode,
    },
  });
}

/**
 * 查询供应商供货能力清单
 * @param {Object} params - 查询参数
 */
export async function querySupplierAbility(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail`, {
    method: 'GET',
    query: {
      ...others,
      page: 0,
      size: 0,
      isAllSupplyAbilitys: 0, // 区分生命周期申请单和供货能力清单明细查询标识
      customizeUnitCode: customizeUnitCode.join(','),
    },
  });
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
export async function checkSupLifesupplierCtgAlter(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycles/category-check`, {
    method: 'POST',
    body: params,
  });
}
