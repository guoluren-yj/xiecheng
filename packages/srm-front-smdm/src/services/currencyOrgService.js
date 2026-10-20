/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-08-19 10:47:24
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-24 17:10:57
 */
/**
 * service - 租户级币种定义
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `${SRM_MDM}/v1/${organizationId}`;

/**
 * 租户级币种查询
 * @async
 * @function queryCurDefinition
 * @param {String} params.currencyCode - 币种代码
 * @param {String} params.currencyName - 币种名称
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryCurDefinition(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${prefix}/currency`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 引用云级数据
 * @async
 * @function quoteData
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function quoteData() {
  return request(`${prefix}/currency`, {
    method: 'POST',
  });
}
/**
 * 修改租户级币种信息
 * @async
 * @function updateCurrencyDef
 * @param {Number} params.currencyId - 币种Id
 * @param {String} params.currencyCode - 币种代码
 * @param {String} params.currencyName - 币种名称
 * @param {Number} params.financialPrecision - 财务精度
 * @param {Number} params.defaultPrecision - 精度
 * @param {String} params.currencySymbol - 货币符号
 * @param {Number} params.enabledFlag - 状态
 * @param {Number} params.refCurrencyId - 引用币种Id
 * @returns {Object} fetch Promise
 */
export async function updateCurrencyDef(params) {
  const { customizeUnitCode, body } = params;
  return request(`${prefix}/currency`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}

// 租户级批量更改币种状态
export async function updateEnabledFlag(params) {
  const { enabledFlag, list } = params;
  return request(`${prefix}/currency/batch/enable/or/disable?enabledFlag=${enabledFlag}`, {
    method: 'PUT',
    body: list,
  });
}
