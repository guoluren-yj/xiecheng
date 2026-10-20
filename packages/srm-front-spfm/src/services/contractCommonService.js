/*
 * contractCommonService - 协议公共service
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchHeader(pcHeaderId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 合作伙伴行不分页查询
 * @param {String} params - 参数
 */
export async function fetchPartner(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/list`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 标的信息行查询
 * @param {String} params - 参数
 */
export async function fetchSubject(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 业务条款行不分页查询
 * @param {String} params - 参数
 */
export async function fetchTerm(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/list`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 业务条款行分页查询
 * @param {String} params - 参数
 */
export async function fetchTermPage(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/page`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { pcHeaderId, ...otherQuery } = query;
  return request(`/spcm/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`, {
    method: 'GET',
    query: otherQuery,
  });
}

/* 获取fileList
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function fetchFilesByUrl(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/* deleteFilesByUrl - 删除url对应文件
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function deleteFilesByUrl(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/* 查询协议头下面的配置附件列表
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function fetchPcAttachmentList(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-attachment/list`
  );
}

/* 更新协议头下面的配置附件信息
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updatePcAttachmentList(params) {
  const { body, pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-attachment`, {
    method: 'PUT',
    body,
  });
}

/* 更新协议头下面的供应商uuid
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updateSupplierUuid(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/attachment-uuid/supplier`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
/* 更新协议头下面的采购方uuid
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updatePurchaseUuid(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/attachment-uuid/purchase`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
/* 更新协议模板的附件url
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updateContractTemplateUrl(params) {
  const { pcTemplateId } = params;
  return request(
    `${SRM_SPCM}/v1/${getUserOrganizationId()}/purchase-contract-template/${pcTemplateId}/attachment`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
