/**
 * service - 处理邀约
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const TenantRoleLevel = isTenantRoleLevel();
const currentOrganizationId = getCurrentOrganizationId();

const prefix = `${SRM_SSLM}/v1`;

/**
 *查询调查表模板信息
 *
 * @export
 * @param {*} investigateTemplateId 模板Id
 * @param {*} organizationId 租户Id
 * @returns
 */
export async function investigationTemplateHeaderQueryAll(params) {
  const { investigateTemplateId, organizationId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/investigate-confighs-preview/${investigateTemplateId}`,
    {
      method: 'GET',
      query: others,
    }
  );
}
/**
 *
 *查询调查表数据
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchDataSource(params) {
  const { configName, organizationId, investgHeaderId } = params;
  let interfaceName = '';
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      interfaceName = 'investigate-basics';
      break;
    // 业务信息
    case 'sslmInvestgBusiness':
      interfaceName = 'investigate-businesses';
      break;
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      interfaceName = 'investg-supplier-cates';
      break;
    // 近三年财务状况
    case 'sslmInvestgFin':
      interfaceName = 'investigate-finances';
      break;
    // 分支机构
    case 'sslmInvestgFinBranch':
      interfaceName = 'investigate-finances-branchs';
      break;
    // 资质信息
    case 'sslmInvestgAuth':
      interfaceName = 'investigate-authes';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'investigate-contacts';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'investigate-addresses';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'investigate-bank-accounts';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'investigate-customers';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'investigate-sub-suppliers';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'investigate-equipments';
      break;
    // 研发能力
    case 'sslmInvestgRd':
      interfaceName = 'investigate-rds';
      break;
    // 生产能力
    case 'sslmInvestgProduce':
      interfaceName = 'investigate-produces';
      break;
    // 质保能力
    case 'sslmInvestgQa':
      interfaceName = 'investigate-qas';
      break;
    // 售后服务
    case 'sslmInvestgCustservice':
      interfaceName = 'investigate-custservices';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      interfaceName = 'investigate-attachments';
      break;
    // 预留表格页签1
    case 'sslmInvestgReserve1':
      interfaceName = 'investg-reserve1s';
      break;
    // 预留表格页签2
    case 'sslmInvestgReserve2':
      interfaceName = 'investg-reserve2s';
      break;
    // 预留表单页签1
    case 'sslmInvestgReserve3':
      interfaceName = 'investg-reserve3s';
      break;
    // 预留表单页签2
    case 'sslmInvestgReserve4':
      interfaceName = 'investg-reserve4s';
      break;
    // 预留表格页签3
    case 'sslmInvestgReserve5':
      interfaceName = 'investg-reserve5s';
      break;
    // 预留表格页签4
    case 'sslmInvestgReserve6':
      interfaceName = 'investg-reserve6s';
      break;
    // 预留表格页签5
    case 'sslmInvestgReserve7':
      interfaceName = 'investg-reserve7s';
      break;
    // 预留表格页签6
    case 'sslmInvestgReserve8':
      interfaceName = 'investg-reserve8s';
      break;
    // 预留表格页签7
    case 'sslmInvestgReserve9':
      interfaceName = 'investg-reserve9s';
      break;
    // 预留表单页签3
    case 'sslmInvestgReserve10':
      interfaceName = 'investg-reserve10s';
      break;
    // 预留表单页签4
    case 'sslmInvestgReserve11':
      interfaceName = 'investg-reserve11s';
      break;
    // 预留表单页签5
    case 'sslmInvestgReserve12':
      interfaceName = 'investg-reserve12s';
      break;
    // 预留表单页签6
    case 'sslmInvestgReserve13':
      interfaceName = 'investg-reserve13s';
      break;
    // 预留表单页签7
    case 'sslmInvestgReserve14':
      interfaceName = 'investg-reserve14s';
      break;
    default:
      break;
  }
  return request(`${prefix}/${currentOrganizationId}/${interfaceName}`, {
    method: 'GET',
    query: {
      investgHeaderId,
      tenantId: organizationId,
    },
  });
}
/**
 *批量保存数据
 *
 * @export
 * @param {*} params
 * @param {*} investgHeaderId
 * @param {*} organizationId
 * @returns
 */
export async function saveData(params, investgHeaderId) {
  return request(`${prefix}/${currentOrganizationId}/investigate/save/${investgHeaderId}`, {
    method: 'POST',
    body: params,
    query: {
      customizeUnitCode: params.customizeUnitCode,
      customizeTenantId: params.customizeTenantId,
    },
  });
}
/**
 *调查表提交并保存
 *
 * @export
 * @param {number} investigateHeaderId
 * @param {number} organizationId
 * @param {object} params
 * @returns
 */
export async function submit(investigateHeaderId, organizationId, params) {
  return request(
    `${prefix}/${currentOrganizationId}/investigate/save-submits/${investigateHeaderId}`,
    {
      method: 'POST',
      body: params,
      query: {
        customizeUnitCode: params.customizeUnitCode,
        customizeTenantId: params.customizeTenantId,
      },
    }
  );
}
/**
 *删除调查表数据
 *
 * @export
 * @param {string} configName
 * @param {string} rowKeys
 * @param {number} organizationId
 * @returns
 */
export async function deleteData(configName, rowKeys) {
  let interfaceName = '';
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      interfaceName = 'investigate-basics';
      break;
    // 业务信息
    case 'sslmInvestgBusiness':
      interfaceName = 'investigate-businesses';
      break;
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      interfaceName = 'investg-supplier-cates';
      break;
    // 近三年财务状况
    case 'sslmInvestgFin':
      interfaceName = 'investigate-finances';
      break;
    // 分支机构
    case 'sslmInvestgFinBranch':
      interfaceName = 'investigate-finances-branchs';
      break;
    // 资质信息
    case 'sslmInvestgAuth':
      interfaceName = 'investigate-authes';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'investigate-contacts';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'investigate-addresses';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'investigate-bank-accounts';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'investigate-customers';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'investigate-sub-suppliers';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'investigate-equipments';
      break;
    // 研发能力
    case 'sslmInvestgRd':
      interfaceName = 'investigate-rds';
      break;
    // 生产能力
    case 'sslmInvestgProduce':
      interfaceName = 'investigate-produces';
      break;
    // 质保能力
    case 'sslmInvestgQa':
      interfaceName = 'investigate-qas';
      break;
    // 售后服务
    case 'sslmInvestgCustservice':
      interfaceName = 'investigate-custservices';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      interfaceName = 'investigate-attachments';
      break;
    // 预留页签1
    case 'sslmInvestgReserve1':
      interfaceName = 'investg-reserve1s';
      break;
    // 预留页签2
    case 'sslmInvestgReserve2':
      interfaceName = 'investg-reserve2s';
      break;
    // 预留页签3
    case 'sslmInvestgReserve5':
      interfaceName = 'investg-reserve5s';
      break;
    // 预留页签4
    case 'sslmInvestgReserve6':
      interfaceName = 'investg-reserve6s';
      break;
    // 预留页签5
    case 'sslmInvestgReserve7':
      interfaceName = 'investg-reserve7s';
      break;
    // 预留页签6
    case 'sslmInvestgReserve8':
      interfaceName = 'investg-reserve8s';
      break;
    // 预留页签7
    case 'sslmInvestgReserve9':
      interfaceName = 'investg-reserve9s';
      break;
    default:
      break;
  }
  return request(`${prefix}/${currentOrganizationId}/${interfaceName}`, {
    method: 'DELETE',
    body: rowKeys,
  });
}

/**
 * 动态查询地区
 * @param {*} params
 * @returns
 */
export async function loadCityData(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${currentOrganizationId}/regions/regional-linkage`, {
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

/*
 * 校验银行信息账户名称是否一致
 * @async
 * @returns {Object} fetch Promise
 */
export async function checkBankAccount(params) {
  return request(`${SRM_SSLM}/v1/${currentOrganizationId}/common-data/firm/check-bank-account`, {
    method: 'POST',
    body: params,
  });
}

// 更新附件最后上传日期
export async function updateLastUploadDate(params) {
  const { configName, ...others } = params;
  const urlPath =
    configName === 'sslmInvestgAuth' ? 'investigate-authes' : 'investigate-attachments';
  return request(`${SRM_SSLM}/v1/${currentOrganizationId}/${urlPath}/update-last-upload-date`, {
    method: 'POST',
    body: others,
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
