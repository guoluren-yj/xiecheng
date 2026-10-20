/* eslint-disable no-underscore-dangle */
// import { useContext } from 'react';
import { message } from 'choerodon-ui';
import pathToRegexp from 'path-to-regexp';
import { isTenantRoleLevel, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';
// import { getColorGradation } from '@hzero-front-ui/core';
// import { ThemeContext } from '@hzero-front-ui/core/lib/utils/ThemeContext';

import { EModelType } from '@/globalData/modelManager';

import routers from '../config/routers';

export function uuid() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  // eslint-disable-next-line no-bitwise
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'; // eslint-disable-line

  const uuid1 = s.join('');
  return uuid1;
}

export const getUrlParamHref = (name) => {
  // console.log(window.location.href);
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'); // eslint-disable-line
  var r = window.location.search.substr(1).match(reg); // eslint-disable-line
  // console.log(decodeURI(r[2]));
  if (r != null) {
    return decodeURIComponent(r[2]); // eslint-disable-line
  }
  return null; // 返回参数值
};

export const getCookies = (name) => {
  const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
  const result = (document.cookie || '').match(reg);
  if (result && result[2]) {
    return unescape(result[2]);
  }
  return '{}';
};

export const getSessionAppInfo = () => {
  const result = getCookies('appInfo'); // 暂时先从cookie中获取
  try {
    return JSON.parse(result);
  } catch (error) {
    window.location = `${window.location.protocol}//${window.location.host}${process.env.BASE_PATH}pub/hmde/authority/authority-manage`;
    throw new Error(error);
  }
};

export const setCookie = ({ name, value, expireTime }) => {
  const currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + expireTime);
  document.cookie = `${name}=${escape(value)};expires=${currentDate.toGMTString()};path=/`;
  return null;
};

export const deleteCookie = (name) => {
  setCookie({
    name,
    value: '',
    expireTime: -1,
  });
};

export function needDraftFlag() {
  let { pathname } = window.location;
  if (process.env.BASE_PATH.length > 1) {
    pathname = pathname.replace(process.env.BASE_PATH, '/');
  }

  const lowcodePage = routers.find((r) => {
    const reg = pathToRegexp(r.path);
    return reg.test(pathname);
  });
  return lowcodePage; // draft-flag 拟定态传1 运行传0 20200601
}
export function getDraftFlag() {
  let { pathname } = window.location;
  if (process.env.BASE_PATH.length > 1) {
    pathname = pathname.replace(process.env.BASE_PATH, '/');
  }

  const lowcodePage = routers.find((r) => {
    const reg = pathToRegexp(r.path);
    return reg.test(pathname);
  });
  return lowcodePage ? 1 : 0; // draft-flag 拟定态传1 运行传0 20200601
}

/**
 * 获取AppId
 */
export function getAppId() {
  const { appId } = JSON.parse(sessionStorage.getItem('appInfo') || '{}'); // 先从session中获取
  // eslint-disable-next-line no-self-compare
  if (!appId || appId !== appId) {
    // window.location = `${window.location.protocol}//${window.location.host}${process.env.BASE_PATH}pub/authority/authority-manage`;
    const cookieAppId = getSessionAppInfo().appId;

    // eslint-disable-next-line no-self-compare
    if (cookieAppId && cookieAppId === cookieAppId) {
      // 过滤 NaN
      return cookieAppId;
    }

    return null;
  }
  return appId;
}

/**
 * 获取AppCode
 */
export function getAppCode() {
  const { appCode } = JSON.parse(sessionStorage.getItem('appInfo') || '{}'); // 先从session中获取
  // eslint-disable-next-line no-self-compare
  if (!appCode || appCode !== appCode) {
    const cookieAppCode = getSessionAppInfo().appCode;

    // eslint-disable-next-line no-self-compare
    if (cookieAppCode && cookieAppCode === cookieAppCode) {
      // 过滤 NaN
      return cookieAppCode;
    }

    return null;
  }
  return appCode;
}

/**
 * 获取AppName
 */
export function getAppName() {
  const { appName } = JSON.parse(sessionStorage.getItem('appInfo') || '{}');

  if (!appName) {
    const cookieAppName = String(getSessionAppInfo().appName);

    if (cookieAppName) {
      return cookieAppName;
    }

    return console.error('appName未获取。请通过正常流程选择应用进入页面，或者询问技术人员。');
  }
  return appName || '';
}

// 判断是否是租户，返回租户id
export function lowcodeOrganizationURL({ route = 'hmde', isSite = false, haveGrade = 'v1' } = {}) {
  const orgStr = isSite || isTenantRoleLevel() ? `${getCurrentOrganizationId()}` : '';
  return `${(window.__lowcodeUrlRoute || {})[route] || route}${haveGrade ? `/${haveGrade}` : ''}${
    orgStr ? `/${orgStr}` : ''
  }`;
}

if (
  location.href.indexOf('172.22.0.5') > -1 ||
  location.href.indexOf('172.23.16.104') > -1 ||
  location.href.indexOf('172.23.16.47') > -1 ||
  location.href.indexOf('172.23.32.119') > -1 ||
  // location.href.indexOf('172.23.16.138') > -1 ||
  // location.href.indexOf('172.23.16.158') > -1 ||
  location.href.indexOf('172.23.16') > -1 || // 包含三楼网段都可以访问
  location.href.indexOf('localhost:8000/') > -1
) {
  window.__lowcodeUrlRoute = sessionStorage.__lowcodeUrlRoute
    ? JSON.parse(sessionStorage.__lowcodeUrlRoute)
    : {
        hlod: 'hlod',
        '/hlod': '/hlod',
        hmde: 'hmde',
        '/hmde': '/hmde',
      };
  window.__setLowcodeUrlRoute = (oldRoute, newRoute) => {
    if (window.__lowcodeUrlRoute) {
      window.__lowcodeUrlRoute[oldRoute] = newRoute;
      window.__lowcodeUrlRoute[`/${oldRoute}`] = `/${newRoute}`;
      sessionStorage.__lowcodeUrlRoute = JSON.stringify(window.__lowcodeUrlRoute);
    } else {
      window.__lowcodeUrlRoute = {};
    }
  };
}

/**
 * 修改Select组件大小写模糊匹配
 * @param {*} param0
 */
export function searchMatcher({ record, text }) {
  if (record && record.get('value')) {
    return record.get('value').toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1;
  }
}

/**
 * 浏览器复制
 * @param {String} val 需要复制的值
 * @param {String} val 提示类型 message || notification
 */
export function handleCopy(val, tipType) {
  const input = document.createElement('input');
  input.style.position = 'fixed'; // 设置input悬浮
  input.style.opacity = 0; // 透明
  document.body.appendChild(input);
  input.setAttribute('value', val);
  input.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
    if (!tipType || tipType === 'message') {
      message.success('复制成功', undefined, undefined, 'top');
    } else {
      notification.success({
        description: '复制成功',
      });
    }
  }
}

/**
 * 字符串大写下划线转 小驼峰
 * @param {String} str 要转化的字符串
 * @param {String} type 转化的类型 默认小驼峰
 */
export function capitalToHump(str, type = 'hump') {
  if (!str) return;
  let strArr = str.toLocaleLowerCase().split('_');
  let i = 1;
  if (type === 'Hump') {
    // 大驼峰
    i = 0;
  }
  strArr = strArr.map((item, index) => {
    if (index >= i) {
      return `${strArr[index].charAt(0).toUpperCase()}${strArr[index].substring(1)}`;
    }
    return item;
  });
  return strArr.join('');
}

/**
 * 获取数字类型的uuid
 * @param {*} type 返回的基本类型 String|Number
 */
export const timeUuid = (type = 'string') => {
  let moduleId = new Date().getTime();
  if (type === 'string') {
    moduleId = moduleId.toString();
  }
  return moduleId;
};

/**
 * 判断权限
 */
export function isTenantPermission(isTenantRole, isTenantLevel) {
  return isTenantRole || isTenantLevel;
}

// 获取当前应用类型
export const getAppRoleType = () => {
  // 获取应用信息
  const { sharedFlag } = JSON.parse(sessionStorage.getItem('appInfo')) || {};
  // eslint-disable-next-line no-nested-ternary
  return sharedFlag
    ? EModelType.PLATFORM_SHARED
    : isTenantRoleLevel()
    ? EModelType.TENANT
    : EModelType.PLATFORM;
};

/**
 * 在需要把dataset布尔字段映射到 [0, 1] 的场景下，在字段配置中引入并展开这个定义
 */
export const DSTF = {
  trueValue: 1,
  falseValue: 0,
};

/**
 * 转换枚举值0、1到正常boolean
 * @param {0|1} TFNumber
 * @returns boolean
 */
export function DSBoolean(TFNumber) {
  return TFNumber === 1;
}

export function getThemeColor() {
  // const { dataMap } = useContext(ThemeContext);
  const {
    userThemeConfig: { themeColor },
  } = getCurrentUser();
  // const { primary, ...obj } = dataMap.get(menuLayoutTheme)?.data?.common?.data?.[0] || {};

  // return { primary: themeColor || primary, ...obj, ...getColorGradation(themeColor || primary) };
  return { primary: themeColor };
}

export const pxWidth = (str = '', font = {}) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = `${font?.fontSize || '12px'} ${font?.fontFamily || ''}`;
    const metrics = context.measureText(str);
    return metrics.width;
  }
  return 0;
};
