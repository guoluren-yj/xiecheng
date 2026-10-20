/* eslint-disable no-underscore-dangle */
import request from 'utils/request';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { getAppCode, getDraftFlag } from './common.js';

// 需要排除拼tenantId的特定路由 (全局拼tenantId有个漏洞，当选择租户时本身这个Lov就接受tenantId作为筛选的条件，这是拼接tenantId会导致Lov搜索数据丢失)
const exceptUrlList = ['?lovCode=HPFM.TENANT_PAGING'];

const defaultHeaders = {
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
};

const defaultOptions = {
  credentials: 'include',
  query: {},
};

export function draftRequest(url, options = {}, customOptions = {}) {
  const _options = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
      'draft-flag': getDraftFlag(),
    },
  };
  // 只有模型和飞搭接口才拼接全局tenantId
  if (url.indexOf('/hmde') > -1) {
    const tenantId = window.dvaApp._store?.getState()?.hmde?.[window.location.pathname]?.tenantId;
    if (
      (typeof tenantId === 'number' ||
        (typeof tenantId === 'string' && tenantId.length > 0 && !isNaN(Number(tenantId)))) &&
      !exceptUrlList.some((item) => url.indexOf(item) > -1)
    ) {
      _options.query.tenantId = tenantId;
    } else if (options?.query?.tenantId || [0].includes(options?.query?.tenantId)) {
      _options.query.tenantId = options.query.tenantId;
    } else {
      delete _options.query.tenantId;
    }
  }

  return request(url, _options, customOptions);
}

export function lowcodeRequest(url, options, customOptions = {}) {
  const AppCode = getAppCode();
  const _options = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
      'draft-flag':
        (options.headers || {})['draft-flag'] !== undefined
          ? (options.headers || {})['draft-flag']
          : getDraftFlag(),
    },
  };
  if (AppCode && AppCode !== 'null' && !_options.headers['app-code']) {
    _options.headers['app-code'] = AppCode;
  }
  const tenantId = window.dvaApp._store?.getState()?.hmde?.[window.location.pathname]?.tenantId;
  // 只有模型和飞搭接口才拼接全局tenantId
  if (url.indexOf('/hmde') > -1) {
    if (
      (typeof tenantId === 'number' ||
        (typeof tenantId === 'string' && tenantId.length > 0 && !isNaN(Number(tenantId)))) &&
      !exceptUrlList.some((item) => url.indexOf(item) > -1)
    ) {
      _options.query.tenantId = tenantId;
    } else if (options?.query?.tenantId || [0].includes(options?.query?.tenantId)) {
      _options.query.tenantId = options.query.tenantId;
    } else if (isTenantRoleLevel()) {
      _options.query.tenantId = getCurrentOrganizationId();
    } else {
      delete _options.query.tenantId;
    }
  }
  return request(url, _options, customOptions);
}
