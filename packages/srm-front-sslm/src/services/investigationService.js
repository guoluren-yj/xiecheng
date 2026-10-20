/**
 * service - 处理邀约
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const prefix = `${SRM_SSLM}/v1`;
const currentOrganizationId = getCurrentOrganizationId();

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
 *查询过滤后的调查表模板信息
 *
 * @export
 * @param {*} investigateTemplateId 模板Id
 * @param {*} organizationId 租户Id
 * @returns
 */
export async function queryFilterInvestigationTemplate(params) {
  const { investigateTemplateId, organizationId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/investigate-confighs-preview-new/${investigateTemplateId}`,
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
  const { configName, organizationId, investgHeaderId, ...others } = params;
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
      interfaceName = 'investigate-proservices/page';
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
    // 预留表单页签1
    case 'sslmInvestgReserve3':
      interfaceName = 'investg-reserve3s';
      break;
    // 预留表单页签2
    case 'sslmInvestgReserve4':
      interfaceName = 'investg-reserve4s';
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
    query:
      configName === 'sslmInvestgProservice'
        ? parseParameters({ ...others, investgHeaderId, tenantId: organizationId }) // 只有产品及服务需要分页
        : { investgHeaderId, tenantId: organizationId },
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
    // 预留表格页签1
    case 'sslmInvestgReserve1':
      interfaceName = 'investg-reserve1s';
      break;
    // 预留表格页签2
    case 'sslmInvestgReserve2':
      interfaceName = 'investg-reserve2s';
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
    default:
      break;
  }
  return request(`${prefix}/${currentOrganizationId}/${interfaceName}`, {
    method: 'DELETE',
    body: rowKeys,
  });
}

// 单页签保存方法
export async function singleSaveData(configName, rows) {
  let interfaceName = '';
  switch (configName) {
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      interfaceName = 'investg-supplier-cates/createOrUpdate';
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
      interfaceName = 'investigate-authes/createOrUpdate';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'investigate-contacts/createOrUpdate';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'investigate-addresses/createOrUpdate';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'investigate-bank-accounts/createOrUpdate';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'investigate-customers/createOrUpdate';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'investigate-sub-suppliers/createOrUpdate';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'investigate-equipments';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      interfaceName = 'investigate-attachments';
      break;
    // 预留表格页签1
    case 'sslmInvestgReserve1':
      interfaceName = 'investg-reserve1s/createOrUpdate';
      break;
    // 预留表格页签2
    case 'sslmInvestgReserve2':
      interfaceName = 'investg-reserve2s/createOrUpdate';
      break;
    // 预留表格页签3
    case 'sslmInvestgReserve5':
      interfaceName = 'investg-reserve5s/createOrUpdate';
      break;
    // 预留表格页签4
    case 'sslmInvestgReserve6':
      interfaceName = 'investg-reserve6s/createOrUpdate';
      break;
    // 预留表格页签5
    case 'sslmInvestgReserve7':
      interfaceName = 'investg-reserve7s/createOrUpdate';
      break;
    // 预留表格页签6
    case 'sslmInvestgReserve8':
      interfaceName = 'investg-reserve8s/createOrUpdate';
      break;
    // 预留表格页签7
    case 'sslmInvestgReserve9':
      interfaceName = 'investg-reserve9s/createOrUpdate';
      break;
    default:
      break;
  }
  return request(`${prefix}/${currentOrganizationId}/${interfaceName}`, {
    method: 'POST',
    body: rows,
  });
}

/**
 * 查询供应商分类
 */
export async function fetchSupplierCate(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${currentOrganizationId}/supplier-category-assign/purchaser/lov`, {
    method: 'GET',
    query: parseParameters(others),
  });
}

// 查询模板定义中-采购方预定义的附件
export async function queryPurchaserAttachment(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-atts`, {
    method: 'GET',
    query: params,
  });
}

// 查询调查表tab的校验状态（字段必输和必输行数）
export async function queryTabValidate(params) {
  const { investigateTemplateId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${currentOrganizationId}/investigate-check-by-configname/${investigateTemplateId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 查询附件按钮权限
export async function queryButtonPermissions(params) {
  return request(`${SRM_PLATFORM}/v1/${currentOrganizationId}/role-menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}

// 更新附件最后上传日期
export async function updateLastUploadDate(params) {
  const { configName, pageSource = '', ...others } = params;
  // 区分企业信息变更调查表和其他功能调查表
  let urlPath =
    configName === 'sslmInvestgAuth'
      ? 'investigate-authes/update-last-upload-date'
      : 'investigate-attachments/update-last-upload-date';
  let method = 'POST';
  // 企业信息变更的调查表调用firmChange接口，其他的调用调查表的接口
  if (pageSource === 'enterpriseInform') {
    urlPath =
      configName === 'sslmInvestgAuth'
        ? 'firm-change-auths/save-firm-change-auth/update-upload-date'
        : 'firm-change-attachments/update-upload-date';
    method = configName === 'sslmInvestgAuth' ? 'POST' : 'PUT';
  }
  return request(`${SRM_SSLM}/v1/${currentOrganizationId}/${urlPath}`, {
    method,
    body: others,
  });
}
