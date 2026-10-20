/* eslint-disable no-underscore-dangle */
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { lowcodeRequest, draftRequest } from '@/utils/lowcodeRequest';

const addAppCodeHeader = (body: any = {}) => {
  const { appCode } = body;
  let headers = {};
  if (appCode) {
    headers = {
      'app-code': appCode,
    };
  }
  return headers;
};

/**
 * 获取应用分配服务详情
 */
export async function queryAppModelerServiceTree(
  query: any = {}
): Promise<model.ModelerServiceTree[]> {
  return draftRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app/service-assign/tree`, {
    method: 'GET',
    query,
    headers: addAppCodeHeader(query),
  });
}

/**
 * 新建应用时获取应用分配服务
 */
export async function queryAppDetailInitService() {
  return draftRequest(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/page-for-permission`,
    {
      method: 'POST',
    }
  );
}

/**
 * 新建应用
 */
export async function createNewApplicationService(body: any): Promise<model.Application> {
  return draftRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app`, {
    method: 'POST',
    body,
  });
}

/**
 * 编辑应用
 */
export async function editApplicationService(body: any = {}): Promise<model.Application> {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app`, {
    method: 'PUT',
    body,
    headers: addAppCodeHeader(body),
  });
}

/**
 * 新建/修改分配服务
 * @param {any} body
 */
export async function submitAppVisibleService(
  body: any,
  appCode: string | number
): Promise<model.AppServiceAssignUpdate> {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app/service-assign`, {
    method: 'POST',
    body,
    headers: addAppCodeHeader({ appCode }),
  });
}

/**
 * 查询角色编码
 */
export async function getPermissionRoleCodeService() {
  return draftRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/permission/is-admin`, {
    method: 'GET',
  });
}

/**
 * 应用启用
 */
export async function applicationEnableService(body: any = {}): Promise<model.Application> {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app/enable`, {
    method: 'PUT',
    body,
    headers: addAppCodeHeader(body),
  });
}

/**
 * 应用禁用
 */
export async function applicationDisableService(body: any = {}): Promise<model.Application> {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app/disable`, {
    method: 'PUT',
    body,
    headers: addAppCodeHeader(body),
  });
}

/**
 * 删除应用开发者账号
 */
export async function deleteAccountService(body: any = {}): Promise<model.LowcodeAppUserAssign> {
  const { assignId = '' } = body;
  return lowcodeRequest(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app/account/${assignId}`,
    {
      method: 'DELETE',
      body,
      headers: addAppCodeHeader(body),
    }
  );
}

// ----------------------------------------------------------- 共享应用相关

/**
 * 创建应用分发
 */
export async function distributionsApplicationService(
  body: any = {},
  query: any = {}
): Promise<model.AppDistribution> {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app-distributions`, {
    method: 'POST',
    body,
    headers: addAppCodeHeader(query),
  });
}

/**
 * 取消应用分发
 */
export async function cancelDistributionsApplicationService(
  body: any = {},
  query: any = {}
): Promise<model.AppDistribution> {
  return lowcodeRequest(`hlod/v1/app/app-distributions`, {
    method: 'DELETE',
    query: body,
    headers: addAppCodeHeader(query),
  });
}

/**
 * 请求数据列表 (查应用下的功能)
 * @returns {Promise<void>}
 * params=123&appCode=1
 */
export async function queryPageListService({ query }: any = {}): Promise<model.LowcodeModule> {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/module/draft-list`, {
    method: 'GET',
    query,
    headers: addAppCodeHeader(query),
  });
}

/**
 * 应用默认角色配置
 */
export async function applicationDefaultRoleSettingService({ body = {}, appCode = {} }: any) {
  return lowcodeRequest(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app/default-role`, {
    method: 'POST',
    body,
    headers: addAppCodeHeader(appCode),
  });
}
