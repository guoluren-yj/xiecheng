/*
 * supplierReceiptRecordService - 供应商收货记录
 * @date: 2018/10/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-supplier`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询事务明细列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryReceiveTransactionDetails(params) {
  const parseParams = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-details`, {
    method: 'GET',
    query: parseParams,
  });
}

/**
 * 查询ASN事务明细列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryReceiveTransactionASNDetails(params) {
  const parseParams = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-asn-details`, {
    method: 'GET',
    query: parseParams,
  });
}
