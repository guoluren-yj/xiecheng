import request from 'utils/request';
import axios from 'axios';
import { SRM_PLATFORM } from '_utils/config';
import { API_HOST, HZERO_PLATFORM } from 'utils/config';
import { getPlatformVersionApi } from 'utils/utils';
import isNil from 'lodash/isNil';

const selfAxios = axios;
let selfAxiosRes = null;
if (!isNil(selfAxiosRes)) {
  selfAxiosRes = selfAxios.interceptors.response.use((data) => {
    if (data && data.failed) {
      throw data;
    } else {
      return data;
    }
  });
}

/**
 * 修改门户分配信息
 * @async
 * @function updatePortalAssign
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupId - 集团ID
 * @param {String} params.groupNum - 集团编码
 * @param {String} params.groupName - 集团名称
 * @param {String} params.companyId - 公司ID
 * @param {String} params.companyNum - 公司编码
 * @param {String} params.companyName - 公司名称
 * @param {String} params.webUrl - 二级域名
 * @param {String} params.tenantId - 租户ID
 */
export async function updatePortalAssign(params) {
  return request(`${SRM_PLATFORM}/v1/${getPlatformVersionApi('portal-assigns-customize')}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 修改卡片
 * @async
 * @function updateLayoutCard
 * @param {Object} params - 参数
 */
export async function updateLayoutCard(params) {
  return request(`${SRM_PLATFORM}/v1/layout-card`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取模板配置项
 * @async
 * @function getLayoutConfig
 * @param {Object} id - 模板ID
 */
export async function getLayoutConfig(id) {
  let url = '';
  if (id) {
    const api = getPlatformVersionApi(`portal-layouts/config-layout/${id}`);
    url = `${SRM_PLATFORM}/v1/${api}`;
  } else {
    url = `${SRM_PLATFORM}/v1/portal-layouts/layout-pub`;
  }
  return request(url, {
    method: 'GET',
    headers: {
      // 跑本地测试时可写死portal-host, 如：zhenyun.dev.isrm.going-link.com
      'portal-host': window.location.host,
    },
  });
}

/**
 * 修改模板配置项
 * @async
 * @function updateLayoutConfig
 * @param {Object} params - 参数
 * @param {String} params.id - 模板ID
 * @param {String} params.objectVersionNumber - 乐观锁
 * @param {String} params.dataJson - 自定义信息
 */
export async function updateLayoutConfig(params) {
  return request(`${SRM_PLATFORM}/v1/${getPlatformVersionApi(`portal-layouts`)}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取个人信息
 * @async
 * @function getUserSelf
 * @param {String} token - token
 */
export async function getUserSelfService() {
  const res = selfAxios.get(`${API_HOST}/iam/hzero/v1/users/self`);
  axios.interceptors.response.eject(selfAxiosRes);
  return res;
}

// 查询租户支持语言
export async function fetchLanguageList(params) {
  return request(`${HZERO_PLATFORM}/v1/tenant-languages/list`, {
    method: 'GET',
    query: params,
  });
}

// 门户模板管理启用、禁用
export async function updateEnabledFlag(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getPlatformVersionApi('portal-layouts/update_enabledFlag')}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
