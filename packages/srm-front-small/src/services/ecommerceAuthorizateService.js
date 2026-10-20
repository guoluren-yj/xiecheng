import request from 'utils/request';
import { parseParameters } from 'utils/utils';

const SIFG = '/sifg';

/**
 * 查询
 * @async
 * @function fetchAuthorizateList
 * @returns {object} fetch Promise
 */
export async function fetchAuthorizateList(params) {
  const param = parseParameters(params);
  return request(`${SIFG}/gateway/account/queryAccounts`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 确定保存
 * @function fetchHandleOk
 * @returns {object} fetch Promise
 */
export async function fetchHandleOk(params) {
  const url = `${SIFG}/gateway/account/add`;
  return request(url, {
    method: params.id ? 'PUT' : 'POST',
    body: params,
  });
}

/**
 * 启用/禁用
 * @function fetchEnable
 * @returns {object} fetch Promise
 */
export async function fetchEnable(params) {
  const param = {
    username: params.username,
    yn: !params.yn,
  };
  return request(`${SIFG}/gateway/account/updateState`, {
    method: 'POST',
    query: param,
  });
}

/**
 * 修改密码
 * @function fetchNewPwd
 * @returns {object} fetch Promise
 */
export async function fetchNewPwd(params) {
  return request(`${SIFG}/gateway/account/updatePassword`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 查询白名单
 * @async
 * @function fetchWhiteList
 * @returns {object} fetch Promise
 */
export async function fetchWhiteList(params) {
  const param = parseParameters(params);
  return request(`${SIFG}/gateway/ipWhite/queryIpWhiteList`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询黑名单
 * @async
 * @function fetchBlackList
 * @returns {object} fetch Promise
 */
export async function fetchBlackList(params) {
  const param = parseParameters(params);
  return request(`${SIFG}/gateway/ipWhite/queryIpBlackList`, {
    method: 'GET',
    query: param,
  });
}
export async function deleteAdjust(params) {
  return request(`${SIFG}/gateway/ipWhite/del/${params.id}`, {
    method: 'POST',
    body: params.id,
  });
}

export async function saveWhiteList(params) {
  return request(`${SIFG}/gateway/ipWhite/saveOrUpdate`, {
    method: 'POST',
    body: params,
  });
}
