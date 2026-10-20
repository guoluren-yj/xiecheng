/* eslint-disable no-param-reassign */
import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchGoodsList(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/source/item-suggest`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商详情数据
 * @returns
 */
export async function fetchWideAreaDetail(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/source/supplier-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询广域寻源列表
 * @returns
 */
export async function fetchWideList(params) {
  const { page = 0, size = 20 } = params;

  return request(`${SRM_SMBL}/v1/${organizationId}/source/search`, {
    method: 'GET',
    query: {
      ...params,
      page,
      size,
    },
  });
}

/**
 * 查询供应商top10
 * @returns
 */
export async function getTopListApi(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/source/top-item`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 发送code给钉钉后端
 * @returns
 */
export async function getUserInfoApi(authCode, corpId) {
  const params = { appCode: 'WIDE_SOURCE_DINGTALK', authCode, corpId };
  return request(`${SRM_SMBL}/v1/dingtalk/thirdApp/getUserInfo`, {
    method: 'GET',
    query: params,
  });
}
