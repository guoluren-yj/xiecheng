/* eslint-disable no-param-reassign */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchGoodsList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/goods`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 公司列表
 * @param {*} params
 * @returns
 */
export async function fetchWideAreaList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/supplier`, {
    method: 'GET',
    query: parseParameters(params),
    // body: params,
  });
}

/**
 * 查询供应商详情数据
 * @returns
 */
export async function fetchWideAreaDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商经营指数
 * @returns
 */
export async function fetchManageDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/manage`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商风险模型
 * @returns
 */
export async function fetchRiskDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/risk`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 埋点记录发起邀约信息
 * @returns
 */
export async function markInvite(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/invite`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询广域寻源列表
 * @returns
 */
export async function fetchWideList(params) {
  const { page = 1, size = 10 } = params;

  if (params.capitalType === 'all') {
    params.capitalType = '';
  }
  if (params.areaCode === 'all') {
    params.areaCode = '';
  }

  return request(`${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/supplier`, {
    method: 'POST',
    body: {
      ...params,
      pageNum: page,
      pageSize: size,
    },
  });
}
