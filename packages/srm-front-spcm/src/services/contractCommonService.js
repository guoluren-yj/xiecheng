/*
 * contractCommonService - 协议公共service
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-08-02 09:22:50
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getUserOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
} from 'utils/utils';
import { SRM_SPCM, SRM_PLATFORM, SRM_MDM, SRM_SSRC } from '_utils/config';

// const SRM_SPCM = '/spcm-22192';

const organizationId = getCurrentOrganizationId();
const { tenantNum } = getCurrentTenant() || {};


/**
 * 协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchHeader({ pcHeaderId, customizeUnitCode }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 阶梯报价
 */
export async function fetchLadderQuotation(params) {
  const { pcSubjectId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-subject/${pcSubjectId}/lines`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 合作伙伴行不分页查询
 * @param {String} params - 参数
 */
export async function fetchPartner(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/list`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 标的信息行查询
 * @param {String} params - 参数
 */
export async function fetchSubject(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 协议阶段行查询
 * @param {String} params - 参数
 */
export async function fetchStage(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/page`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 业务条款行不分页查询
 * @param {String} params - 参数
 */
export async function fetchTerm(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/list`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 业务条款行分页查询
 * @param {String} params - 参数
 */
export async function fetchTermPage(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/page`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { pcHeaderId, ...otherQuery } = query;
  return request(`/spcm/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`, {
    method: 'GET',
    query: otherQuery,
  });
}

/* 获取fileList
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function fetchFilesByUrl(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/* deleteFilesByUrl - 删除url对应文件
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function deleteFilesByUrl(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/* 查询协议头下面的配置附件列表
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function fetchPcAttachmentList(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-attachment/list`
  );
}

/* 更新协议头下面的配置附件信息
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updatePcAttachmentList(params) {
  const { body, pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-attachment`, {
    method: 'PUT',
    body,
  });
}

/* 更新协议头下面的供应商uuid
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updateSupplierUuid(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/attachment-uuid/supplier`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
/* 更新协议头下面的采购方uuid
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updatePurchaseUuid(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/attachment-uuid/purchase`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
/* 更新协议模板的附件url
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updateContractTemplateUrl(params) {
  const { pcTemplateId } = params;
  return request(
    `${SRM_SPCM}/v1/${getUserOrganizationId()}/purchase-contract-template/${pcTemplateId}/attachment-file`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 查询配置中心配置
 * @param {*} params
 */
export async function fetchConfigSetting() {
  return request(`${SRM_PLATFORM}/v1/${getUserOrganizationId()}/settings`, {
    method: 'GET',
  });
}

/**
 * 返利信息查询
 * @param {*} params
 */
export async function fetchContractRebate(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-rebate-informations/${pcHeaderId}/pc-rebate/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 查询返利信息下的公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-affiliated-companys/${param.rebateInformationId}/page`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 查询返利信息下的新增公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchAddCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/page/increase_company`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 保存协议类型列表下的新增公司
 * @param {Object} params - 查询参数
 */
export async function saveCompany(params) {
  const { rebateInformationId, companyDataSource } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-affiliated-companys/${rebateInformationId}/company`,
    {
      method: 'POST',
      body: companyDataSource,
    }
  );
}

/**
 * 查询新增标的行采购订单
 * @param {*} params
 */
export async function fetchAddPurchaseOrder(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchaser/poLine/add`, {
    method: 'GET',
    query,
  });
}

/**
 * 更新阶梯报价
 */
export async function saveLadderQuotation(body) {
  const { pcSubjectId, ...otherParams } = body;
  const arr = Object.values(otherParams);
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-subject/${pcSubjectId}/lines`, {
    method: 'PATCH',
    body: arr,
  });
}

/**
 * 删除阶梯
 */
export async function ladderQuoteLinesDelete(params) {
  const { body } = params;
  const ids = body.map((b) => b.lineId);
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-subject/lines`, {
    method: 'DELETE',
    body: ids,
  });
}

/**
 * 查询审批记录列表
 * @param {*} params
 */
export async function fetchApproveRecord(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-approval-records?pcHeaderId=${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 打印
 * @param {*} pcHeaderId
 */
export async function printFile(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/${pcHeaderId}/watermark-pdf`,
    {
      method: 'POST',
      responseType: 'blob',
    }
  );
}

/**
 * 打印 兼容钉钉/飞书内置浏览器
 * @param {*} pcHeaderId
 */
export async function extraPrintFile(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/${pcHeaderId}/watermark-pdf`,
    {
      method: 'POST',
      responseType: 'JSON',
      headers: { 's-print-using-preview': '1' },
    }
  );
}

/**
 * 查询文本对比
 * @param {*} params
 */
export async function fetchTextComparison(params) {
  const { pcHeaderId, version, isSupplier, needOldLastApi = true } = params;
  const path = isSupplier ? 'purchase-contract-file' : 'purchase-contract';
  // 上次版本已发布走原接口，上次版本已生效提供一个新接口last-contrast-approve
  const lastPath =
    version === 'last' && !needOldLastApi ? 'last-contrast-approve' : `${version}-contrast`;
  return request(`${SRM_SPCM}/v1/${organizationId}/${path}/${lastPath}`, {
    method: 'POST',
    query: { pcHeaderId },
  });
}

/**
 * 合同文本生成
 * @param {Object} params
 */
export async function contractTextGen(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/view/attachment`, {
    method: 'POST',
    body: params,
  });
}

/** 查询协议阶段值集
 * @param {Object} params
 */
export async function fetchStageList(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${params.pcTypeId}/pc-stage/enable/page`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询合作伙伴类型值集
 * @param {Object} params
 */
export async function fetchPartnerList(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${params.pcTypeId}/pc-partner/list`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询补充协议
 * @param {Object} params
 */
export async function fetchReplenish(params) {
  const param = parseParameters(params);
  const { pcHeaderId, ...others } = param;
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-supplements/${pcHeaderId}/page`, {
    method: 'GET',
    query: {
      ...others,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH',
    },
  });
}

/**
 * 查询协议自定义行表信息
 * @param {Object} params
 */
export async function fetchTableExtend(params) {
  const parseParams = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-table-extends/page/list`, {
    method: 'GET',
    query: {
      ...parseParams,
      customizeUnitCode: 'SPCM.CONTRACT.SIGN.TABLEEXTEND.READONLY',
    },
  });
}

/**
 * 查询查看存证证明Url
 * @param params
 */
export function queryViewCertificateDeposit(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/sign/get-proof-link`, {
    responseType: 'text',
    query: params,
  });
}

/** 查询实时汇率
 * @param {*} params
 */
export async function fetchExchangeRate(payload) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/query-spcmExchangeRate`, {
    method: 'POST',
    body: payload,
  });
}

/** 查询协议用章|协议签署时验证手机号
 * @param {*} params
 */
export async function fetchVerifyPhoneNum(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/query-phoneNum`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询签署套餐类型（E签宝|法大大)
 * @param {Object} body
 */
export async function querySealType(params) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/purchase-contract/sign/get-sign-type`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询由协议标的行编码自动获取价格库有效价格
 * @param {*} params
 */
export async function fetchPriceLibValidPrice(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-subject/price`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询当前日期下的汇率定义
 * @param {Object} body
 */
export async function queryExchangeRates(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/exchange-rates`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询汇率类型定义
 * @param {Object} body
 */
export async function queryExchangeRateTypes(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/exchange-rate-types`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取打印链接
 * @param {*} params
 */
export async function fetchLockPrintContract({ pcHeaderId }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-header/contract/lock/${pcHeaderId}/print`, {
    method: 'POST',
  });
}

/**
 * 获取契约锁合同附件
 * @param {*} params
 */
export async function fetchLockContractFile({ pcHeaderId }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-header/contract/lock/${pcHeaderId}`, {
    method: 'POST',
  });
}

/**
 * 查询精度
 */
const prefix = `${SRM_SSRC}/v1`;
export async function queryPrecision(params) {
  const { currencyCodes = [], uomIds = [], financialCodes = [] } = params;
  return request(`${prefix}/${organizationId}/precision`, {
    method: 'GET',
    query: {
      currencyCodes,
      uomIds,
      financialCodes,
    },
  });
}

/**
 * 合同报批表
 * @param {*} pcHeaderId
 */
export async function printContractApproval(pcHeaderId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/print/${pcHeaderId}/print-pdf`, {
    method: 'POST',
    responseType: 'blob',
  });
}

// 查询菜单在租户下是否拥有权限
export async function checkPermisssions(params) {
  return request(`/iam/hzero/v1/${getCurrentOrganizationId()}/permisison/admin/check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 协议提交前校验预算是否占用
 * @async
 * @function pcBudgetCheck
 */
export async function pcBudgetCheck(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/purchase-contract/pc-budget-check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询是否开启双单位配置
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise 0不开启双单位，1上下游和订单都开启，2仅协议开启
 */
export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询是否开启单据流、关联单据
 * @returns
 */
export async function getRelationDocControl() {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/cnf-actions/SITE.SPFM.RELATION_DOC_CONTROL/invoke_with_parameter`,
    {
      method: 'GET',
      query: { businessModule: 'SPCM' },
    }
  );
}

/**
 * 查询协议标的行是否可以根据参考价格修改
 * @async
 * @function queryEnableModifyReferPrice
 * @returns {object} fetch Promise enableModifyPrice 1允许修改，2不允许修改
 */
export async function queryEnableModifyReferPrice(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-cnf/enable-modify-referencePrice`, {
    method: 'GET',
    query: params,
  });
}

// 查询双单位基本数量换算关系
export async function queryDoubleUnitConversion(params) {
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 根据公司id查询默认的联系人信息
 * @param {object} companyId 公司id
 * @returns 默认联系人信息
 */
export async function queryContactByCompany(companyId) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/pc-common/query-basic-company/${companyId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 重新生成订单
 * @param {object} companyId 公司id
 * @returns 默认联系人信息
 */
export async function autoChangePo(params) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/sync-contract/execute/auto-change-po`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取业务规则-是否申请推荐供应商
 * @returns 1,0 开启/关闭
 */
export async function getRecommendSupplierFlag() {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/contract-cnf/get-recommend-supplier-flag`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询历史版本对比合同信息
 * @param {object} params pcHeaderId
 * @returns
 */
export async function queryCompareContract(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/pc-compare/get-compare-headers`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 一键调整阶段原/本币种
 * @param {*} params 协议头信息
 * @returns
 */
export async function autoAdjust(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/purchase-contract/${pcHeaderId}/stage/auto-adjust`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取导入模板编码
 * @param {*} params 协议头信息
 * @returns
 */
export async function getImportTemplateCode(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/pc-subject/import-template`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

/**
 * 获取导入模板编码
 * @param {*} params 协议头信息
 * @returns
 */
export async function fetchFileByUrl({ query, attachmentUrls }) {
  const action = `${HZERO_FILE}/v1/${
    isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
  }files`;
  return request(action, {
    method: 'POST',
    body: attachmentUrls || [],
    query,
  });
}

/**
 * 查询业务规则定义【协议归档时允许删除已归档文件】
 * @param {*} params
 * @returns
 */
export async function getEnableDeleteArchiveFileFlag(params) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/purchase-contract-archive/enable_delete_file`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 校验业务实体与库存组织是否关联
 * @param {*} params
 * @returns
 */
export async function checkOuInvRel(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/pc-subject/${pcHeaderId}/check-ou-inv-rel`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询是否是老阶段
 * @returns
 */
export async function getStageCalculateMethod() {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/rel-table-records/spcm_pc_stage_calculate_method/page`,
    {
      method: 'POST',
      body: { tenantNum: getCurrentTenant().tenantNum },
    }
  );
}

/**
 * 获取业务规则-标的行取价优先级
 * @returns 1,0 开启/关闭
 */
export async function fetchPricePriority() {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/contract-cnf/prPricePriority`, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 判断租户是否在黑名单
 * @param {string} pcHeaderId 协议头ID
 * @returns
 */
export async function fetchTenantIsBlacklist() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-common/getFeatureWhiteList`, {
    method: 'GET',
    query: {
      functionCode: 'ATTACHMENT_CONTRACT_TEXT_SIGNATURE_SUPPORTED',
    },
  });
}

/**
 * 查询文本对比当前文本默认值
 */
export async function fetchCurrentContractText(params = {}) {
  return request(`${SRM_SPCM}/v1/${organizationId}/compare-results/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getSmartContractTaskId - 获取文本对比任务id或者在线对比url
 * @param {array}
 * @returns
 */
export async function getDocCompareTaskIdOrTextUrl(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/compare-contract`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 智能对比计费提示
 * @param {array}
 * @returns
 */
export async function checkBillRemind(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/bill-remind`, {
    method: 'POST',
    body: params,
  });
}

/**
 * getSmartContractTaskId - 获取文本对比在线链接 循环调用接口
 * @param {array}
 * @returns
 */
export async function getDocOnLineUrl(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/poll/compare-result`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 忽略审查点
 * @returns
 */
export async function ignoreCheckPoint(params = {}) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 生成智能审查
 * @param {*} params
 * @returns
 */
export async function generateSmartReview(params) {
  const { triggerType } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/check`, {
    method: 'POST',
    body: {
      ...params,
      triggerType: triggerType || 'MANUAL_REVIEW',
    },
  });
}

/**
 * 获取合同审查类型
 * @param {*} params
 * @returns
 */
export async function fetchContractReviewType(params) {
  const { triggerType } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/smart-process`, {
    method: 'POST',
    body: {
      ...params,
      triggerType: triggerType || 'MANUAL_REVIEW',
    },
  });
}

/**
 * 获取合同审查 - 提取任务id
 * @param {array} pcHeaderList
 * @returns
 */
export async function fetchTaskIdOfExtract(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/smart-contract`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取合同审查 - 对比任务id
 * @param {array} pcHeaderList
 * @returns
 */
export async function fetchTaskIdOfCompare(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/compare-contract`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新审查进度标识
 * @param {array} pcHeaderList
 * @returns
 */
export async function updateReviewProgressFlag(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-results/update/duplication`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询协议模板列表
 * @param {*} params
 * @returns
 */
export async function fetchContractTemplates(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/page_template_company`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function fetchReviewRecord(params) {
  const { pcTemplateFileId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-review-tasks/${pcTemplateFileId}`, {
    method: 'GET',
    query: params,
  });
}

export async function referencePrmWhitelist(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/spcm_pr_mapping_pc/page`, {
    method: 'POST',
      body: { tenantNum, ...params },
  });
}
