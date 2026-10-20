/**
 * service - 供应商汇总查询
 * @date: 2018-8-15
 * @author:  dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_MDM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * fetchInvestigateList - 查询平台级供应商
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchSupplierPool(params) {
  const {
    page,
    size,
    customizeUnitCode,
    asyncCountFlag,
    onlyCountFlag,
    oldTotalElements,
    ...body
  } = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${params.organizationId}/supplier-pool`, {
    method: 'POST',
    body,
    query: {
      page,
      size,
      customizeUnitCode,
      asyncCountFlag,
      onlyCountFlag,
      oldTotalElements,
    },
  });
}

/**
 * fetchLifeCyclesStages - 供应商生命周期配置阶段查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchLifeCyclesStages(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/life-cycles/stages`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询品类
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/lov`, {
    method: 'GET',
    query,
  });
}

/**
 * 默认分页size查询接口
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPageSize(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/page-size`, {
    method: 'GET',
    query,
  });
}
