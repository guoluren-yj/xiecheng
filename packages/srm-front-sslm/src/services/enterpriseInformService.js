/**
 * service - 企业信息变更
 * @date: 2019-11-04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { HZERO_PLATFORM, HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 申请单查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryApplication(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 确认申请单查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryConfirmApplication(params) {
  const param = parseParameters(params);
  const { customizeUnitCode = [], ...rest } = param;
  return request(`${SRM_SSLM}/v1/${organizationId}/firm-change-confirms`, {
    method: 'GET',
    query: filterNullValueObject({ ...rest, customizeUnitCode: customizeUnitCode.join(',') }),
  });
}

/**
 * 申请单操作记录查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryApplicationRecord(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/record`, {
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
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/single`, {
    method: 'POST',
    body: filterNullValueObject(params),
  });
}

/**
 * 删除申请单
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteApplication(params) {
  const { customizeUnitCode = [], changeReqIdList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change`, {
    method: 'DELETE',
    body: changeReqIdList,
    query: { customizeUnitCode: customizeUnitCode.join() },
  });
}

/**
 * 查询开票信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPlatformInvoice(params) {
  const { supplierFlag = 1 } = params;
  const url =
    supplierFlag === 0 // 当值为0代表是企业信息变更并且对应变更供应商为空
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-invoice-reqs/all`
      : `${SRM_SSLM}/v1/${organizationId}/sup-invoice-reqs/all`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询联系人
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPlatformContact(params) {
  const { supplierFlag = 1 } = params;
  const url =
    supplierFlag === 0 // 当值为0代表是企业信息变更并且对应变更供应商为空
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/no-basic`
      : `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs/no-basic`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存联系人
 * @async
 * @param {Object} params - 查询参数
 */
export async function savePlatformContact(params) {
  const { dataSource, supplierFlag = 1, desensitize, ...others } = params;
  const url =
    dataSource === 1 && supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs`
      : `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs`;
  return request(url, {
    method: 'POST',
    query: { dataSource, desensitize },
    body: others,
  });
}

/**
 * 查询平台级银行信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPlatformBank(params) {
  const { supplierFlag = 1 } = params;
  const url =
    supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/no-basic`
      : `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs/no-basic`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存平台级银行信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function savePlatformBank(params) {
  const {
    dataSource,
    supplierFlag,
    customizeUnitCode,
    customizeTenantId = null,
    desensitize = false,
    ...others
  } = params;
  const url =
    dataSource === 1 && supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs`
      : `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs`;
  return request(url, {
    method: 'POST',
    body: others,
    query: { dataSource, customizeUnitCode, customizeTenantId, desensitize },
  });
}

/**
 * 查询平台级地址信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPlatformAddress(params) {
  const { supplierFlag = 1 } = params;
  const url =
    supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/no-basic`
      : `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/no-basic`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存平台级地址信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function savePlatformAddress(params) {
  const { dataSource, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/com-address-reqs`, {
    method: 'POST',
    query: { dataSource },
    body: others,
  });
}

/**
 * 查询国家定义列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchCountryData(params) {
  return request(`${HZERO_PLATFORM}/v1/countries`, {
    method: 'GET',
    query: params,
  });
}
/**
 *查询省市区
 * @export
 * @param {*} params
 * @returns
 */
export async function queryProvinceCity(params) {
  return request(`${HZERO_PLATFORM}/v1/countries/${params.countryId}/regions`, {
    method: 'GET',
    query: params,
  });
}
/**
 *查询地址列表
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAddressList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/no-basic`, {
    method: 'GET',
    query: params,
  });
}
/**
 *保存地址列表
 * @export
 * @param {*} params
 * @returns
 */
export async function saveAddressList(params) {
  const { dataSource, customizeUnitCode, supplierFlag, ...others } = params;
  const url =
    dataSource === 1 && supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs`
      : `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs`;
  return request(url, {
    method: 'POST',
    query: { dataSource, customizeUnitCode },
    body: others,
  });
}

/**
 * 动态查询地区
 * @param {*} params
 * @returns
 */
export async function loadCityData(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/regions/regional-linkage`, {
      method: 'GET',
      query: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/regions/regional-linkage`, {
      method: 'GET',
      query: params,
    });
  }
}

/**
 * 查询基本信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryCompanyBasicReq(params) {
  const { changeReqId, supplierFlag = 1, ...query } = params;
  const url =
    supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-basic-req/after/${changeReqId}`
      : `${SRM_SSLM}/v1/${organizationId}/sup-basic-req/after/${changeReqId}`;
  return request(url, {
    method: 'GET',
    query: {
      supplierFlag,
      ...query,
    },
  });
}

/**
 * 查询业务信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryCompanyBusinessReq(params) {
  const { changeReqId, supplierFlag = 1, ...query } = params;
  const url =
    supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-business-req/after/${changeReqId}`
      : `${SRM_SSLM}/v1/${organizationId}/sup-business-req/after/${changeReqId}`;
  return request(url, {
    method: 'GET',
    query: {
      supplierFlag,
      ...query,
    },
  });
}

/**
 * 查询开票信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryCompanyInvoiceReq(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-business-req/after/${params.changeReqId}`, {
    method: 'GET',
  });
}

/**
 * 查询财务信息
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryCompanyFinance(params) {
  const { supplierFlag = 1 } = params;
  const url =
    supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/all`
      : `${SRM_SSLM}/v1/${organizationId}/sup-finance-reqs/all`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取行业品类.
 * @export
 */
export async function fetchIndustryCategories(idList) {
  // TODO:
  return request(`${HZERO_PLATFORM}/v1/industries/categories/tree`, {
    method: 'GET',
    query: {
      industryIdList: idList.join(','),
      enabledFlag: 1,
    },
  });
}

/**
 * 查询其他信息
 * @param {Object} params - 查询参数
 */
export async function querySupChangeOther(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/sup-change-others/firmChange/getSupChangeOther`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 *保存财务列表
 */
export async function saveFinancialList(params) {
  const { supplierFlag, dataSource, customizeUnitCode } = params;
  const url =
    dataSource === 1 && supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs`
      : `${SRM_SSLM}/v1/${organizationId}/sup-finance-reqs`;
  return request(url, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 *明细头查询
 * @export
 * @param {*} params
 * @returns
 */
export async function queryDetailHeader(params) {
  return request(
    `${SRM_SSLM}/v1${TenantRoleLevel ? `/${organizationId}/` : `/`}enterprise-change/firm-detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 *查询附件列表
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAttachmentsList(params) {
  const { supplierFlag = 1 } = params;
  const url =
    supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/no-basic`
      : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/no-basic`;
  return request(url, {
    method: 'get',
    query: params,
  });
}

/**
 * 获取附件类型
 * @async
 * @function queryAttachmentType
 * @param {object[]} params - 查询条件
 * @param {?string} params.SPFM.COMPANY.ATTACHMENT_TYPE - 附件类型
 * @param {?string} params.SPFM.COMPANY.SUB_ATTACHMENT - 附件子类型
 * @returns {object} fetch Promise
 */
export async function queryAttachmentType(params) {
  const { tenantId } = params;
  return request(`${HZERO_PLATFORM}/v1/${tenantId}/lovs/value/tree`, {
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
  const { customizeUnitCode = [], customizeTenantId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/submit`, {
    method: 'POST',
    body,
    query: { customizeUnitCode: customizeUnitCode.join(), customizeTenantId },
  });
}

/**
 *明细大保存
 * @export
 * @param {*} params
 * @returns
 */
export async function saveAttachmentsList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs`, {
    method: 'POST',
    body: params.comAttachmentReqs,
  });
}

/**
 * 基本信息值集.
 * @export
 */
export async function initAttmentList() {
  return queryMapIdpValue({
    attactmentType: 'SPFM.COMPANY.ATTACHMENT_TYPE',
    subType: 'SPFM.COMPANY.SUB_ATTACHMENT',
    tenantId: organizationId,
  });
}

/**
 * 获取行业
 * @export
 */
export async function fetchIndustries(payload) {
  return request(`${HZERO_PLATFORM}/v1/industries/tree?domesticFlag=${payload || 0}`);
}

export async function allSave(params) {
  const { customizeUnitCode = [], customizeTenantId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/all-detail`, {
    method: 'POST',
    body,
    query: { customizeUnitCode: customizeUnitCode.join(), customizeTenantId },
  });
}

/**
 * 查询当前uuid上附件个数
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function fetchFileNumber(params) {
  return request(`${HZERO_FILE}/v1/files/${params.attachmentUUID}/count`, {
    method: 'GET',
    query: {
      bucketName: params.bucketName,
    },
  });
}

/**
 * 新增/更新附件信息
 * @async
 * @function addAttachment
 * @param {object} params.data - 待保存数据
 * @param {!string} params.data.attachmentType - 附件类型
 * @param {!string} params.data.subAttachment - 附件子类型
 * @param {?string} params.data.attachmentUuid - 唯一id
 * @param {?string} params.data.description - 附件描述
 * @param {!string} params.data.companyId - 公司id
 * @param {?date} params.data.endDate - 文件到期日
 * @param {!date} params.data.uploadDate - 最后更新时间
 * @returns {object} fetch Promise
 */
export async function addAttachment(params) {
  const { dataSource, supplierFlag, customizeUnitCode } = params;
  const url =
    dataSource === 1 && supplierFlag === 0
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs`
      : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs`;
  return request(url, {
    method: 'POST',
    body: params,
    query: {
      dataSource,
      customizeUnitCode,
    },
  });
}

/**
 * 查询调查表字段
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryInfoChangeApprovalDetail({ changeReqId, ...rest }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/firm-change-investigate-confighs/${changeReqId}`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 * 企业信息变更明细查询
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
 * 审批通过
 * @async
 * @param {Object} params - 审批通过
 */
export async function approve(params) {
  return request(`${SRM_PLATFORM}/v1/company-change/batch-approve`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 审批确认
 * @async
 * @param {Object} params - 审批确认
 */
export async function confirm(params) {
  const { customizeUnitCode = [], data } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/confirm`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 审批拒绝
 * @async
 * @param {Object} params - 审批拒绝
 */
export async function approveReject(params) {
  const { customizeUnitCode = [], data } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/reject`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 审批拒绝
 * @async
 * @param {Object} params - 审批拒绝
 */
export async function reject(params) {
  return request(`${SRM_SSLM}/v1/enterprise-change/reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 三证认证
 * @async
 * @param {Object} params - 三证认证
 */
export async function tripartite(params) {
  const { changeReqId } = params;
  return request(
    `${SRM_PLATFORM}/v1/company-change/tripartite-verification?changeReqId=${changeReqId}`,
    {
      method: 'POST',
      // body: params,
    }
  );
}

/**
 * 新三证认证
 * @async
 * @param {Object} params - 新三证认证
 */
export async function tripartiteVerification(params) {
  return request(`${SRM_SSLM}/v1/enterprise-change/tripartite-verification`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 企业信息变更明细查询-平台
 * @async
 * isClassify 供应商分类调sslm服务 其他接口调spfm
 * @param {Object} params - 查询参数
 */
export async function queryPlatformInfo({ url, isPlatform, ...rest }) {
  return request(
    `${isPlatform ? SRM_PLATFORM : SRM_SSLM}/v1/${
      TenantRoleLevel || !isPlatform ? `${organizationId}/` : ''
    }${url}`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 * 申请单查询-平台
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPlatformApplication(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/enterprise-change`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 调查表数据明细
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryDataSource({
  url,
  changeReqId,
  purchaserTenantId,
  dataSource,
  desensitize,
}) {
  return request(`${SRM_SSLM}/v1/${organizationId}/${url}`, {
    method: 'GET',
    query: {
      changeReqId,
      tenantId: organizationId,
      purchaserTenantId,
      dataSource,
      desensitize,
    },
  });
}

/**
 * 调查表数据小保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveSmallDataSource({ url, tableList, desensitize = null }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: tableList,
    query: { desensitize },
  });
}

// 调查表数据小删除
export async function deleteDataSource({ url, deleteRows }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/${url}`, {
    method: 'DELETE',
    body: deleteRows,
  });
}

/**
 * 查询供应商分类
 * @async
 * @param {Object} params - 查询参数
 */
export async function querySupplierClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/firm-change-cates`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商分类小保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveSupplierClassify(params) {
  const { list, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/firm-change-cates`, {
    method: 'POST',
    body: list,
    query: { customizeUnitCode },
  });
}

/*
 * 校验银行信息账户名称是否一致
 * @async
 * @returns {Object} fetch Promise
 */
export async function checkBankAccount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/check-bank-account`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询征信配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/customize-settings`, {
    method: 'GET',
    body: params,
  });
}

/*
 * 查询中国值集对象
 * @async
 * @returns {Object} fetch Promise
 */
export async function getDefaultBankCountryInfo(params = {}) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/bank-account/default`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询平台级变更确认
 */
export async function queryPaltformList(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/platform-tenant-confirm-list`,
    {
      method: 'GET',
      query: parseParameters(params),
    }
  );
}

// 平台级租户确认
export async function tenantConfirm(params) {
  const { data = [], customizeUnitCode = '' } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/tenant-confirm-platform-req`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 平台级租户确认前
export async function tenantConfirmBefore(params) {
  const { data = [], customizeUnitCode = '' } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/enterprise-change/record/tenant-confirm-platform-req`,
    {
      method: 'POST',
      body: data,
      query: { customizeUnitCode },
    }
  );
}

// 删除附件
export async function deleteAttachment(params) {
  const { changeLevel, deleteRows, customizeUnitCode } = params;
  const url =
    changeLevel === 'PLATFORM'
      ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/delete`
      : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/delete`;
  return request(url, {
    method: 'DELETE',
    body: deleteRows,
    query: { customizeUnitCode },
  });
}

export async function checkedSupplierChangeReq(params) {
  const { changeReqId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-cates/${changeReqId}/check`, {
    method: 'POST',
    body,
  });
}

// 查询二级域名对应租户
export async function fetchWeburl(params) {
  const { webUrl } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/web-url`, {
    method: 'GET',
    query: {
      webUrl,
    },
  });
}

/**
 * 更新营业执照
 * @async
 * @param {Object} params
 */
export async function updateLicenceUrl(params) {
  const { isPlatformFlag = false, ...others } = params;
  const url = isPlatformFlag
    ? `${SRM_PLATFORM}/v1/${organizationId}/company-change/update/licence-url`
    : `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/update/licence-url`;
  return request(url, {
    method: 'PUT',
    body: others,
  });
}

// 信息变更不带调查表的附件更新最后上传日期
export async function updateUploadDate(params) {
  const { isPlatformFlag = false, ...others } = params;
  const url = isPlatformFlag
    ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/update-upload-date`
    : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/update-upload-date`;
  return request(url, {
    method: 'PUT',
    body: others,
  });
}

/**
 * 企业信息变更（新）查询调查表字段
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryInvestigationTemplate({ changeReqId, ...rest }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/firm-change-investigate-confighs/${changeReqId}/new`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 *审批-明细头查询
 * @export
 * @param {*} params
 * @returns
 */
export async function queryApprovalDetailHeader(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/firm-confirm-detail`, {
    method: 'GET',
    query: params,
  });
}
