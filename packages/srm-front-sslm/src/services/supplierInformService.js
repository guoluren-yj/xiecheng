/**
 * service - 供应商信息变更
 * @date: 2019-12-17
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';
import { HZERO_PLATFORM, HZERO_FILE } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 申请单查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryApplication(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 申请单操作记录查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryApplicationRecord(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-records`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存申请单
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveApplication(params) {
  const { customizeUnitCode, tableValues } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/**
 * 删除申请单
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteApplication(params) {
  const { changeReqIdList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`, {
    method: 'DELETE',
    body: changeReqIdList,
  });
}

/**
 * 申请单详情页数据查询
 * @param {Object} params - 查询参数
 */
export async function queryDetailHeader(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/firm-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 *明细提交
 * @export
 * @param {*} params
 * @returns
 */
export async function submitApplication(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/submit`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join() },
    body,
  });
}

/**
 *明细提交(新)
 * @export
 * @param {*} params
 * @returns
 */
export async function submitAll(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/submit-new`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join() },
    body,
  });
}

// 明细提交（新）前的后端校验
export async function submitAllCheck(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/check-submit`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join() },
    body,
  });
}

/**
 *明细大保存
 * @export
 * @param {*} params
 * @returns
 */
export async function allSave(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/all-detail`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join(',') },
    body,
  });
}

/**
 *明细大保存（新）
 * @export
 * @param {*} params
 * @returns
 */
export async function saveAll(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/all-detail-new`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join(',') },
    body,
  });
}

/**
 * 供货能力清单数据查询
 * @param {Object} params - 查询参数
 */
export async function querySupplierCapacity(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-lns`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询其他信息
 * @param {Object} params - 查询参数
 */
export async function querySupChangeOther(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-others/getSupChangeOther`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供货能力清单保存
 * @param {Object} params --保存
 */
export async function saveSupplyCapacity(params) {
  const { customizeUnitCode, payload } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-lns`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: payload,
  });
}

/**
 * 供货能力清单数据删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteSupplyCapacity(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-lns`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 财务/采购头信息查询
 * @param {Object} params - 查询参数
 */
export async function queryPurchaseHeadInform(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-syncs`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 财务/采购数据查询
 * @param {Object} params - 查询参数
 */
export async function queryPurchaseInform(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-synced-pfs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 采购/财务信息
 * @param {Object} params --保存
 */
export async function savePurchase(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-synced-pfs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 财务/采购数据删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deletePurchase(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-synced-pfs`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询地点层信息数据
export async function queryLocationInform(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-adds`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 地点层信息数据保存
 * @param {Object} params --保存
 */
export async function saveLocationInform(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-adds`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 地点层数据删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteLocationInform(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-adds`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询OU层信息
export async function queryOUMessageInfo(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-ous`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 保存供应商OU信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function saveOUMessage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-ous`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除供应商OU信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function deleteOUMessage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-ous`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * ou层信息
 * @param {*} params -- 信息比对
 */
export async function fetchOuList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-compare/ou`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商分类信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function querySupplierClassify(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-cates`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 供应商分类保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveSupplierClassifyList(params) {
  const { list, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-cates`, {
    method: 'POST',
    body: list,
    query: { customizeUnitCode },
  });
}

/**
 * 查询调查表字段
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryInvestigateConfig({ changeReqId, ...rest }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-change-investigate-config/${changeReqId}`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 * 调查表数据明细
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryDataSource({ url, changeReqId, dataSource, desensitize }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/${url}`, {
    method: 'GET',
    query: {
      changeReqId,
      dataSource,
      tenantId: organizationId,
      desensitize,
    },
  });
}

/**
 * 调查表数据小保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveSmallDataSource({ url, tableList, desensitize = false }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: tableList,
    query: { desensitize },
  });
}

/**
 * 调查表对比查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryInvestigate({ url, ...rest }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/detail/investigate-${url}`, {
    method: 'GET',
    query: rest,
  });
}

/**
 * 平台对比查询
 */
export async function queryPlatformInfo({ url, ...rest }) {
  return request(`${SRM_SSLM}/v1/${TenantRoleLevel ? `${organizationId}/` : ''}${url}`, {
    method: 'GET',
    query: rest,
  });
}

/*
 * 查询供货能力清单行附件
 * @async
 * @function queryOperation
 * @param {Number} params.abilityLineId - 供货能力清单行Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryLineAttachment(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts`, {
    method: 'GET',
    query,
  });
}

/*
 * 信息对比--查询供货能力清单行附件
 * @async
 * @function queryOperation
 */
export async function queryLineAttachmentcontrast(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts/compare`, {
    method: 'GET',
    query: params,
  });
}

/*
 * 保存供货能力清单行附件
 * @async
 * @function saveOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function saveLineAttachment(params) {
  const { tableValues, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/*
 * 删除供货能力清单行附件
 * @async
 * @function deleteOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function deleteLineAttachment(params) {
  const { attIdList, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts`, {
    method: 'DELETE',
    body: attIdList,
    query: { customizeUnitCode },
  });
}

/*
 * 查询个性化配置
 */
export async function queryCustomize(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-customize`, {
    method: 'GET',
    query: params,
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

// 查询tab需显示数量
export async function queryCounts(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/new/count`, {
    method: 'GET',
    query: params,
  });
}

// 查询供货能力清单-行附件数量
export async function queryAbilityFileCount(params) {
  const { abilityLineId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/sup-change-ability-lns/queryFileCount/${abilityLineId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 关联调查表打印
export async function handlePrint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}/print`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}
