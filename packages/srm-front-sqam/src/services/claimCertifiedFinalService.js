/*
 * @Description:
 * @Date: 2020-05-13 13:50:00
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const organizationId = getCurrentOrganizationId();

export async function print(formHeaderId) {
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/purchase/detail/${formHeaderId}/print`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}

export async function fetchMyClaim(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/claim-form/results/perform-management/page`, {
    method: 'GET',
    query: param,
  });
}
export async function saveResultExc(params) {
  const { customizeUnitCode, ...body } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/results/perform-management/save?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body,
    }
  );
}
export async function submitResultExc(params) {
  const { customizeUnitCode, ...body } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/results/perform-management/submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body,
    }
  );
}

export async function searchDetail(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${params.tenantId}/claim-form/purchase/detail/${params.formHeaderId}`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchOperationRecord(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/claim-form-records/${params.formHeaderId}/records`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchClaimProject(params) {
  const param = parseParameters(params);
  return request(
    `${prefix}/${organizationId}/claim-form-lines/purchase/detail/${params.formHeaderId}/items`,
    {
      method: 'GET',
      query: param,
    }
  );
}
