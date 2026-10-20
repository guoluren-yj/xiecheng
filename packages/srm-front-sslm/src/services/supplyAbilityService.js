/**
 * service - 供应商能力定义
 * @date: 2018-10-8
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSLM, SRM_MDM } from '_utils/config';
import { filterNullValueObject, parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 *
 * 查询供应商能力列表
 * @async
 * @function queryList
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
 * @returns {Object} fetch Promise
 */
export async function queryList(params) {
  const {
    organizationId,
    asyncCountFlag,
    oldTotalElements,
    onlyCountFlag,
    ...otherParams
  } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  const { page, size, customizeUnitCode, ...paramsRest } = param;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/post`, {
    method: 'POST',
    query: { page, size, asyncCountFlag, oldTotalElements, onlyCountFlag, customizeUnitCode },
    body: paramsRest,
  });
}
/**
 * 查询供应商能力详细表单
 * @async
 * @function queryHeaderInfo
 * @param {*} params.organizationId 租户Id
 * @param {*} params.supplyAbilityId 推荐申请单头Id
 * @returns {Object} fetch Promise
 */
export async function queryHeaderInfo(params) {
  const { organizationId, supplyAbilityId, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/${supplyAbilityId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}
/**
 *
 * 查询物料/品类
 * @async
 * @function queryCategoryMaterial
 * @param {*} params.organizationId 租户Id
 * @param {*} params.supplyAbilityId 推荐申请单头Id
 * @returns {Object} fetch Promise
 */
export async function queryCategoryMaterial(params) {
  const { organizationId, supplyAbilityId, abilityLineCode = '', ...others } = params;
  const param = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/${supplyAbilityId}`, {
    method: 'GET',
    query: {
      ...param,
      customizeUnitCode: abilityLineCode,
    },
  });
}

/**
 *
 * 查询物料/品类 POST
 * @async
 * @function queryCategoryMaterial
 * @param {*} params.organizationId 租户Id
 * @param {*} params.supplyAbilityId 推荐申请单头Id
 * @returns {Object} fetch Promise
 */
export async function queryCategoryUsePost(params) {
  const { organizationId, supplyAbilityId, abilityLineCode = '', bodyData, ...others } = params;
  const param = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/${supplyAbilityId}`, {
    method: 'POST',
    query: {
      ...param,
      customizeUnitCode: abilityLineCode,
    },
    body: bodyData,
  });
}
/**
 *删除推荐物料/品类
 *
 * @async
 * @function deleteCategoryMaterialData
 * @param {Array} params.idList - 客推荐物料/品类主键
 * @returns {Object} fetch Promise
 */
export async function deleteCategoryMaterialData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-lines`, {
    method: 'DELETE',
    body: [...idList],
  });
}
/**
 *查询供应商分类数据
 *
 * @async
 * @function querySupplierClassification
 * @param {Number} params.supplierCompanyId - 供应商Id
 * @param {Number} params.supplierTenantId - 供应商租户Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function querySupplierClassification(params) {
  const { organizationId, ...otherParams } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-assign`, {
    method: 'GET',
    query: { isAssignFlag: 1, ...param },
  });
}
/**
 *查询附件信息
 *
 * @async
 * @function queryEnclosure
 * @param {*} params.supplyAbilityId - 供货能力清单Id
 * @returns {Object} fetch Promise
 */
export async function queryEnclosure(params) {
  const { supplyAbilityId, organizationId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-att-lns/${supplyAbilityId}`, {
    method: 'GET',
  });
}
/**
 *删除附件
 *
 * @async
 * @function deleteEnclosureTableData
 * @param {Array} params.idList - 附件主键
 * @returns {Object} fetch Promise
 */
export async function deleteEnclosureTableData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-att-lns`, {
    method: 'DELETE',
    body: [...idList],
  });
}
/**
 *保存所有数据
 *
 * @async
 * @param {*} params
 * @returns {Object} fetch Promise
 */
export async function saveAll(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSLM}/v1/${params.organizationId}/supply-abilitys`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}
/**
 *查询评审列表数据
 *
 * @async
 * @function queryReviewList
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
 * @returns {Object} fetch Promise
 */
export async function queryReviewList(params) {
  const { organizationId, ...otherParams } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  const { page, size, customizeUnitCode, ...paramsRest } = param;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/evaluate-post`, {
    method: 'POST',
    query: { page, size, customizeUnitCode },
    body: paramsRest,
  });
}
/**
 *查询评审推荐物料品类表
 *
 * @async
 * @function queryReviewMaterial
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryReviewMaterial(params) {
  const { organizationId, paging, supplyAbilityId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/${supplyAbilityId}`, {
    method: 'GET',
    query: paging,
  });
}
/**
 *查询评审推荐物料品类表
 *
 * @async
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
 * @returns {Object} fetch Promise
 */
export async function queryReviewDetail(params) {
  const {
    organizationId,
    asyncCountFlag,
    onlyCountFlag,
    oldTotalElements,
    ...otherParams
  } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  const { page, size, customizeUnitCode, ...paramsRest } = param;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail-post`, {
    method: 'POST',
    query: { page, size, asyncCountFlag, onlyCountFlag, oldTotalElements, customizeUnitCode },
    body: paramsRest,
  });
}
/**
 * 查询操作记录
 * @async
 * @function queryOperation
 * @param {Number} params.supplyAbilityId - 供货能力清单Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryOperation(params) {
  const { organizationId, supplyAbilityId, ...otherParams } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-recs/${supplyAbilityId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 检验新增供货能力清单时供应商和公司的唯一性
 * @async
 * @function checkValid
 * @param {object} params
 * @returns {Object} fetch Promise
 */
export async function checkValid(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/valid`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 删除文件服务器中的文件
 * @async
 * @function onDraggerUploadRemove
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - 文件url
 * @returns {Object} fetch Promise
 */
export async function onDraggerUploadRemove(params) {
  const { organizationId, bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
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
  const organizationId = getCurrentOrganizationId();
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`, {
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
  const organizationId = getCurrentOrganizationId();
  const { tableValues, customizeUnitCode, optional = undefined } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`, {
    method: 'POST',
    body: {
      supplyAbilityLineAttLns: tableValues,
      optional,
    },
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
  const organizationId = getCurrentOrganizationId();
  const { attIdList, customizeUnitCode, optional = undefined } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`, {
    method: 'DELETE',
    body: {
      supplyAbilityLineAttLnIds: attIdList,
      optional,
    },
    query: { customizeUnitCode },
  });
}

/**
 * 查询物料下的品类
 * @async
 * @function queryItemCategory
 * @param {String} itemId - 物料id
 */
export async function queryItemCategory(itemId) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId} `, {
    method: 'GET',
  });
}

/**
 *提交勾选数据
 *
 * @async
 * @param {*} params
 * @returns {Object} fetch Promise
 */
export async function submitLines(params) {
  const { organizationId, supplyAbilityId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/${supplyAbilityId}/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: {
      supplyAbilityId,
      ...otherParams,
    },
  });
}

/**
 *校验勾选数据
 *
 * @async
 * @param {*} params
 * @returns {Object} fetch Promise
 */
export async function handleValidate(params) {
  const { organizationId, supplyAbilityId, customizeUnitCode, supplyAbilityLineList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/${supplyAbilityId}/valid`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: supplyAbilityLineList,
  });
}

/**
 * 工作台新建时查询供应商信息
 */
export async function querySupplierInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/line-company-info`, {
    method: 'GET',
    query: params,
  });
}

// 查询配置中心供货能力管控维度
export async function queryAbilityDimension(params) {
  const organizationId = getCurrentOrganizationId();
  const { supplierCompanyId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supply-ability-expands/dimSup/${supplierCompanyId} `,
    {
      method: 'GET',
      responseType: 'text',
      query,
    }
  );
}

// 一键拓展
export async function expandCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-expands/expand`, {
    method: 'POST',
    body: params,
  });
}

// 保存拓展中单据
export async function submitExpand(params) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode, submitList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-expands/submit`, {
    method: 'POST',
    body: submitList,
    query: { customizeUnitCode },
  });
}

// 废弃拓展单据
export async function abandonExpand(params) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode, abandonList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-expands/abandon`, {
    method: 'POST',
    body: abandonList,
    query: { customizeUnitCode },
  });
}

/**
 * 保存批量编辑物料/品类
 * @async
 * @param {*} params
 * @returns {Object} fetch Promise
 */
export async function saveBatchLine(params) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/batch-update`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

// 新建品类物料校验接口
export async function checkCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/line-check`, {
    method: 'POST',
    body: params,
  });
}
