// 维护业务对象接口
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * api url - 脚本查询
 * */
export const getScriptPageUrl = `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts`;

export async function getScriptPage(
  params: { page: number; size: number } = { page: 0, size: 20 }
) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts`, {
    method: 'GET',
    query: params,
  }) as Promise<ScriptAbstractPageInfo>;
}

export interface ScriptAbstractPageInfo {
  content: {
    enabledFlag: 0 | 1;
    objectVersionNumber: number;
    remark?: string;
    scriptCode: string;
    scriptId: string;
    scriptName: string;
    tenantId: number;
    tenantName: string;
    _token: string;
  }[];
  empty: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * api url - 脚本新建
 * */
export const createScriptPageUrl = `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts`;

/**
 * api url - 脚本复制
 * */
export const copyScriptPageUrl = (scriptId: string) =>
  `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts/copy/${scriptId}`;

/**
 * 查询脚本摘要
 * */
export const queryScriptAbstractService = {
  url: (scriptId: string) => `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts/${scriptId}`,
  method: 'GET',
  response: (null as unknown) as ScriptAbstractPageInfo,
} as const;

/**
 * 更新脚本摘要
 * */
export const updateScriptAbstractService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts`,
  method: 'PUT',
  response: null,
} as const;

/**
 * 启用/禁用脚本
 * */
export const setScriptAvailabilityService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts/enabled`,
  method: 'PUT',
  response: null,
} as const;

/**
 * 删除脚本
 * */
export const deleteScriptService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts`,
  method: 'DELETE',
  response: null,
} as const;

/**
 * api url - 脚本详情查询
 * */
export const queryScriptDetailUrl = `${lowcodeOrganizationURL({
  route: HZERO_HMDE,
})}/scripts/datas`;

/**
 * 查询脚本详情
 * */
export const queryScriptDetailService = {
  url: (scriptId: string) =>
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts/datas/${scriptId}`,
  method: 'GET',
  response: (null as unknown) as {
    createdBy: number;
    creationDate: string;
    data: string;
    lastUpdateDate: string;
    lastUpdatedBy: number;
    objectVersionNumber: number;
    scriptDataId: string;
    scriptId: string;
    scriptName: string;
    tenantId: number;
    _token: string;
  } & {
    inputReference: any;
    outputReference: any;
  },
} as const;

/**
 * 更新脚本详情
 * */
export const updateScriptDetailService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts/datas`,
  method: 'PUT',
  payload: (null as unknown) as {
    createdBy: number;
    creationDate: string;
    data: string;
    lastUpdateDate: string;
    lastUpdatedBy: number;
    objectVersionNumber: number;
    scriptDataId: string;
    scriptId: string;
    tenantId: number;
    _token: string;
  } & {
    inputReference: any;
    outputReference: any;
  },
  response: null,
} as const;

/**
 * 调试脚本
 * */
export const debugScriptService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts/debug`,
  method: 'POST',
  payload: (null as unknown) as {
    scriptText: string;
    param: {
      [arg: string]: any;
    };
  },
  response: (null as unknown) as
    | {
        consoleLog: string[];
        result: string;
      }
    | {
        failed: true;
        message: string;
      },
} as const;

export async function getCurrentRole() {
  return request(`/iam/hzero/v1/users/self`, {
    method: 'GET',
  });
}

export async function getRole(id) {
  return request(`/iam/hzero/v1/roles/self/assigned-roles?tenantId=${id}&page=0&size=100`, {
    method: 'GET',
  });
}
