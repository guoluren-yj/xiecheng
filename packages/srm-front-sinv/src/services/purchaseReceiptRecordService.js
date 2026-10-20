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
  // /sodr-21108
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-purchase`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryReceiveTransactionDetails(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-details`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryReceiveTransactionASNDetails(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-asn-details`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询操作数据
 * @param {Object} params - 查询参数
 */
export async function operationDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-change-records/${query.headerId}/${query.id}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 查询操作数据
 * @param {Object} params - 查询参数
 */
export async function alingeDetail(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-change-records/${params.headerId}/${params.id}/repost`,
    {
      method: 'POST',
      body: params.record,
    }
  );
}
