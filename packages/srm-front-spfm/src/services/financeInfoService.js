/**
 * financeInfoService - 企业注册-财务信息 - service
 * @date: 2018-7-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
/**
 * 删除companyId
 *
 * @param {*} params 传递的参数
 * @returns 删除后的参数
 */
function deleteCompanyId(params) {
  const paramsData = params;
  if (params.companyId) {
    delete paramsData.companyId;
  }
  return paramsData.arr;
}
/**
 * 删除companyId
 *
 * @param {*} params 传递的参数
 * @returns 删除后的参数
 */
function deleteCompanyIdArr(params) {
  const paramsData = params;
  if (params.companyId) {
    delete paramsData.companyId;
  }
  return paramsData.deleteRows;
}

/**
 * 查询公司财务信息
 * @async
 * @function queryFinance
 * @param {object} params - 查询条件
 * @param {!string} params.companyId - 公司id
 * @returns {object} fetch Promise
 */
export async function queryFinance(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/finance/${params.companyId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/finance/${params.companyId}`, {
      method: 'GET',
    });
  }
}

/**
 * 新增/更新公司财务信息
 * @async
 * @function addFinance
 * @param {object} params.data - 待保存数据
 * @param {!string} params.data.companyId - 公司id
 * @param {!string} params.data.year - 年份
 * @param {!number} params.data.totalAssets - 企业总资产
 * @param {!number} params.data.totalLiabilities - 总负债
 * @param {!number} params.data.currentAssets - 流动资产
 * @param {!number} params.data.currentLiabilities - 流动负债
 * @param {!number} params.data.revenue - 营业收入
 * @param {!number} params.data.netProfit - 净利润
 * @returns {object} fetch Promise
 */
export async function addFinance(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/finance/${params.companyId}`, {
      method: 'POST',
      body: deleteCompanyId(params),
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/finance/${params.companyId}`, {
      method: 'POST',
      body: deleteCompanyId(params),
    });
  }
}

/**
 * 删除公司财务信息
 * @async
 * @function removeFinance
 * @param {object[]} params.selectedRows - 待保存数据
 * @param {!string} params.selectedRows[].companyFinanceId - 财务id
 * @param {!string} params.selectedRows[].objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function removeFinance(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/finance/${params.companyId}`, {
      method: 'DELETE',
      body: deleteCompanyIdArr(params),
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/finance/${params.companyId}`, {
      method: 'DELETE',
      body: deleteCompanyIdArr(params),
    });
  }
}
