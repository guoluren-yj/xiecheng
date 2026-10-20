/**
 * invoiceInfoService - 企业注册-开票信息 - service
 * @date: 2019-2-16
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
/**
 * 查询公司开票信息
 * @async
 * @function fetchInvoiceInfo
 * @param {object} params - 查询条件
 * @param {!string} params.companyId - 公司id
 * @returns {object} fetch Promise
 */
export async function fetchInvoiceInfo(params) {
  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/company-invoices/queryInvoiceNotCreate/${params.companyId}/${params.companyBasicId}`,
      {
        method: 'GET',
      }
    );
  } else {
    return request(
      `${SRM_PLATFORM}/v1/company-invoices/queryInvoiceNotCreate/${params.companyId}/${params.companyBasicId}`,
      {
        method: 'GET',
      }
    );
  }
}

/**
 * 查询当前最新的企业信息.
 * @export
 */
export async function queryCompanyBasic() {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic`);
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/basic`);
  }
}

/**
 * 新增公司开票信息
 * @async
 * @function addFinance
 * @param {object} params.data - 待保存数据
 * @param {!string} params.data.invoiceHeader - 发票头
 * @param {!string} params.data.taxRegistrationNumber - 税登记号
 * @param {!number} params.data.depositBank - 开户行
 * @param {!number} params.data.bankAccountNum - 开户行账号
 * @param {!number} params.data.taxRegistrationAddress - 税登记地址
 * @param {!number} params.data.taxRegistrationPhone - 税登记电话
 * @param {!number} params.data.receiveMail - 收票人邮箱
 * @param {!number} params.data.receivePhone - 收票人手机号
 * @returns {object} fetch Promise
 */
export async function createInvoiceInfo(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/company-invoices`, {
      method: 'POST',
      body: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/company-invoices`, {
      method: 'POST',
      body: params,
    });
  }
}

/**
 * 更新公司开票信息.
 * @export
 */
export async function updateInvoiceInfo(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/company-invoices`, {
      method: 'PUT',
      body: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/company-invoices`, {
      method: 'PUT',
      body: params,
    });
  }
}

/**
 * 租户公司开票信息
 * @async
 * @function fetchInvoiceInfo
 * @param {object} params - 查询条件
 * @param {!string} params.companyId - 公司id
 * @returns {object} fetch Promise
 */
export async function queryCompanyInvoice(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-invoices/queryCompanyInvoice/${params.companyId}`,
    {
      method: 'GET',
    }
  );
}
