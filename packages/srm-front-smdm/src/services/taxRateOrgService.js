/**
 * service - 税率定义
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MDM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `${SRM_MDM}/v1/${organizationId}`;

/**
 * 税率定义查询
 * @async
 * @function queryTax
 * @param {String} params.taxCode - 税率代码
 * @param {String} params.description - 税率描述
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryTax(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${prefix}/taxes`, {
    method: 'GET',
    query: param,
  });
}

// /**
//  * 税率引用云级数据
//  * @async
//  * @function quoteData
//  * @returns {object} fetch Promise
//  */
// export async function quoteData() {
//   return request(`${prefix}/taxes/ref`, {
//     method: 'POST',
//   });
// }

/**
 * 修改租户级税率
 * @async
 * @function updateTax
 * @param {Number} params.taxId - 税率Id
 * @param {String} params.taxCode - 税率代码
 * @param {Number} params.taxRate - 税率
 * @param {String} params.description - 税率描述
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.tenantId - 租户Id
 * @param {Number} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function updateTax(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${prefix}/taxes`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}
/**
 * 新增租户级税率
 * @async
 * @function addTax
 * @param {String} params.taxCode - 税率代码
 * @param {Number} params.taxRate - 税率
 * @param {String} params.description - 税率描述
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function addTax(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${prefix}/taxes`, {
    method: 'POST',
    body: {
      ...body,
      tenantId: organizationId,
    },
    query: { customizeUnitCode },
  });
}

/**
 * fetchFields
 * @async
 */
export async function fetchFields() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/tax-service-config/tax_dimension/list`, {
    method: 'GET',
    // body: params,
  });
}

/**
 * 税率服务查询
 * @async
 * @function queryTax
 * @param {String} params.taxCode - 税率代码
 * @param {String} params.description - 税率描述
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchTaxRateService(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${prefix}/tax-services`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存税率服务
 * @param {obj} params
 */
export async function fetchTaxRateServiceSave(params) {
  return request(`${prefix}/tax-services`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 引用云级数据
 * @param {*} params
 */
export async function fetchQuoteDemision(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/tax-service-config/tax_dimension/reference-cloud`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 引用云级数据映射
 * @param {obj} params
 */
export async function fetchQuoteDemisionMap(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/tax-service-config/tax_dimension_mapping/reference-cloud`,
    {
      method: 'POST',
      body: params,
    }
  );
}
