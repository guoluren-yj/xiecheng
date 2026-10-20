/*
 * commonService - 全局公共Service
 * @Date: 2022-04-25 15:36:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  getResponse,
  filterNullValueObject,
} from 'utils/utils';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM, HZERO_PLATFORM, HZERO_FILE, HZERO_HWFP, HZERO_HFLE } from 'utils/config';

const organizationId = getCurrentOrganizationId();

// 查询操作记录
export async function queryOperationRecord(params) {
  const { documentType, documentId, isPlatform, approveDocumentType, ...others } = params;
  let url = '';
  switch (documentType) {
    case 'INVESTIGATE': // 调查表
      url = 'investg-process-recs';
      break;
    case 'SAMPLE_SEND_REQ': // 送样
      url = `sample-record/${documentId}`;
      break;
    case 'SITE_EVAL': // 现场考察
    case 'SITE_EVAL_SUBMIT': // 现场考察填制/已填制
    case 'REPORT_EVAL': // 采购方评估工作台 - 管理
    case 'REPORT_EVAL_SUBMIT': // 采购方评估工作台 - 评分
      url = `site-eval-opr-historys/${documentId}`;
      break;
    case 'EVAL_MANAGE': // 采购方绩效考评工作台
    case 'KPI_EVAL': // 绩效考评
      url = 'kpi-eval-opr-historys';
      break;
    case 'simpleSupplier': // 简易入库
      url = `ext-supplier-req-records/${documentId}`;
      break;
    case 'expandAbility': // 拓展中供货能力清单
      url = 'supply-ability-expand-recs';
      break;
    case 'SUPPLIER_ENTRY': // 供应商录入
      url = 'enterprise-change/record/entering';
      break;
    case 'ENTERPRISE_APPROVAL_PLATFORM': // 企业认证平台审批
      url = 'enterprise-change/record/platform';
      break;
    case 'ENTERPRISE_APPROVAL_TENANT': // 企业认证租户审批
      url = 'enterprise-change/record/entering';
      break;
    case 'SUPPLIER_INFO_CHANGE': // 供应商信息变更单
      url = 'sup-change-records';
      break;
    case 'ENTERPRISE_PLATFORM_CONFIRM': // 平台级-企业信息变更审批
      url = `firm-confirm-records/${documentId}`;
      break;
    case 'ENTERPRISE_TENANT_CONFIRM': // 租户级-企业信息变更
      url = `enterprise-change/record`;
      break;
    case 'LIFE_CYCLE_MANAGE': // 生命周期管理工作台
      url = `life-cycle-change-proc-recs/${documentId}`;
      break;
    case 'SUPPLIER_INVESTIGATION_WORKBENCH': // 供应商调查表工作台
      url = `investg-process-recs?investgHeaderId=${documentId}&organizationId=${organizationId}`;
      break;
    case 'EVAL_PLAN': // 评估计划
      url = `eva-plan-opr-historys`;
      break;
    case 'KPI_EVAL_SUBMIT':
    case 'EVAL_MANAGE_SUBMIT': // 绩效考评-评分工作台
      url = 'kpi-eval-opr-historys/filling';
      break;
    case 'SUPPLY_ABILITY_MANAGE': // 供货能力清单管理
      url = `supply-ability-recs/${documentId}`;
      break;
    case 'QUOTA_APPLICATION': // 配额申请单、配额主数据
      url = `supplier-quota-opr-historys/${documentId}`;
      break;
    case 'SUPPLY_ABILITY_CHANGE_REQ': // 供货能力申请单
      url = `supply-ability-change-records/${documentId}`;
      break;
    case 'MEMBER_SUPPLIER': // 会员供应商拓展
      url = `company-member-proc-records/${documentId}`;
      break;
    default:
      break;
  }
  return request(`${isPlatform ? SRM_PLATFORM : SRM_SSLM}/v1/${organizationId}/${url}`, {
    method: 'GET',
    query: {
      ...others,
      page: 0,
      size: 0,
    },
  });
}

// 导出操作记录
export async function exportOperationRecord(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/version-history/operated-action/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

// 查询工作流审批记录
export async function queryApproveRecords(params) {
  const { documentId, ...query } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/approval-records/${documentId}`, {
    method: 'GET',
    query,
  });
}

// 默认中国地址查询
export async function fetchLovData() {
  const params = parseParameters({
    lovCode: 'HPFM.COUNTRY',
    page: 0,
    size: 10,
    condition: 'CN',
  });
  return request(`${HZERO_PLATFORM}/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

// 查询H0工作流审批记录
export async function queryH0ApproveRecords(params) {
  const { documentId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/common-data/approval-bpmn-records/${documentId}`,
    {
      method: 'GET',
      query,
    }
  );
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

// 查询角色菜单权限
export async function queryMenuPermissions(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/menus/permissions`, {
    method: 'POST',
    body: params,
    query: params,
  });
}

// 查询配置表
export async function fetchConfigTable(params = {}) {
  const { configCode = null, data = {} } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
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

// 校验银行信息账户名称是否一致
export async function checkBankAccount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/check-bank-account`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 校验银行账户 不带调查表
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function checkBank(params) {
  const { changeReqId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/register-company/check-bank/${changeReqId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取租户文件上传配置
 * @param {string} bucketName
 * @param {string} bucketDirectory
 * @returns {Promise<number|undefined>}
 */
export function fetchRemoteFileSizeLimit(bucketName, bucketDirectory) {
  return request(`${HZERO_FILE}/v1/${organizationId}/upload-configs/by-directory-bucket`, {
    method: 'GET',
    query: { bucketName, directory: bucketDirectory },
  }).then(res => {
    if (getResponse(res)) {
      const { storageUnit, storageSize } = res;
      let finalSize;
      if (storageUnit === 'MB') finalSize = storageSize * 1024 * 1024;
      else if (storageUnit === 'KB') finalSize = storageSize * 1024;
      return finalSize;
    }
  });
}

/**
 * 工作台新建时查询供应商信息
 * @param {*} sourceType 来源，GUIDE-工作台-操作指引（主要解决调查表的跳转问题）
 */
export async function querySupplierInfo(params) {
  const { sourceType, ...rest } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/${
      sourceType === 'GUIDE' ? 'intro-supplier-company-info' : 'line-company-info'
    }`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

// 查询采购方是否启用隐私政策
export async function fetchPrivacyPolicy(params) {
  const settingCode = '010011'; // 隐私政策code
  const partnerTenantId = params.tenantId;
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/settings/${settingCode}/${partnerTenantId}`,
    {
      method: 'GET',
    }
  );
}

// 查询供货能力清单行附件数量
export async function fetchAbilityFileCount(abilityLineId) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-supply-recs/queryFileCount/${abilityLineId}`,
    {
      method: 'GET',
    }
  );
}

// 查询隐私政策详细
export async function fetchPrivacyPolicyText(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/static-texts/text/by-code/list`, {
    method: 'GET',
    query: params,
  });
}

// 查询单个隐私政策详细
export async function fetchSinglePrivacyPolicyText(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/static-texts/text/by-code`, {
    method: 'GET',
    query: params,
  });
}

// 模糊查询企业名称-租户
export async function fetchOrgSimilarCompanyName(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic/qccSearch`, {
    method: 'POST',
    body: params,
  });
}

/*
 * 校验供应商分类
 * @param {Object} params
 */
export async function checkClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/check-intro-category`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

// 查询权限集
export async function queryPermission(data) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: data,
  });
}

// 查询行业类型
export async function fetchIndustries(payload) {
  return request(`${HZERO_PLATFORM}/v1/industries/tree`, {
    method: 'GET',
    query: payload,
  });
}

// 查询行业品类
export async function fetchIndustryCategories(payload) {
  return request(`${HZERO_PLATFORM}/v1/industries/categories/tree`, {
    method: 'GET',
    query: payload,
  });
}

// 老的信息变更带调查表的附件更新最后上传日期
export async function updateUploadDateWithInvestigate(params) {
  const { configName, ...others } = params;
  const urlPath =
    configName === 'sslmInvestgAuth'
      ? 'firm-change-auths/save-firm-change-auth'
      : 'firm-change-attachments';
  const method = configName === 'sslmInvestgAuth' ? 'POST' : 'PUT';
  return request(`${SRM_SSLM}/v1/${organizationId}/${urlPath}/update-upload-date`, {
    method,
    body: others,
  });
}

// 查询360配置表
export async function fetch360Config(payload) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/open-new-360-ui`, {
    method: 'GET',
    query: payload,
  });
}

// 查询配置中心供应商分类是否启用
export async function fetchShowSupplierCategory(params) {
  const { settingCode, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/span/${settingCode}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 通过供应商id查询供应商信息
 * @param {*}
 */
export async function querySupplierInfoById(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/change-company-info`, {
    method: 'GET',
    query: params,
  });
}

/*
 * 校验银行账户是否重复
 * @async
 * @returns {Object} fetch Promise
 */
export async function checkBankAccountCommon(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/firm/check-bank-account`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询业务规则定义配置
 * @param {*} params
 * @returns
 */
export async function fetchBusinessRules(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/tab`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询单据是否可以撤销
 * @param {*} params
 * @returns
 */
export async function queryRevokeDocument(params) {
  const { revokeFlag = 1, businessKeys = [] } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag`, {
    method: 'POST',
    body: businessKeys,
    query: { revokeFlag },
  });
}

/**
 * 撤销审批
 * @param {*} params
 * @returns
 */
export async function revokeDocumentApprova(params) {
  const { businessKey = '' } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/revoke-by-key/unify-interface`, {
    method: 'POST',
    // responseType: 'text',
    body: {
      businessKey,
    },
  });
}

// 判断当前租户是否能正常使用会员供应商功能
export async function checkMemberSupplierEnabled(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/feature-enabled`, {
    method: 'GET',
    query: params,
  });
}

export async function batchDownloadAttachments(params) {
  return request(`${HZERO_HFLE}/v1/${organizationId}/files/download/compress/urls-and-uuids`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

// 采购方是否展示供应商标签
export async function enterpriseTagsConfig(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic/zhima-label-display-flag`, {
    method: 'GET',
    query: params,
  });
}

// 查询业务规则是否开始AI审批
export async function queryAiConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/getCnf`, {
    method: 'GET',
    query: params,
  });
}

// 智能预审
export async function aiApprove(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/doAiApprove`, {
    method: 'POST',
    query: params,
  });
}

// 轮询智能预审返回的状态
export async function fetchApproveStatus(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/getApproveStatus`, {
    method: 'GET',
    query: params,
  });
}
