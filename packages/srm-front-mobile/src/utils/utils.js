import { getAccessToken } from 'hzero-front/lib/utils/utils';
import { isObject, isString } from 'lodash';
import { bucketName } from '@/utils/smblConstant.js';

export function buildFileUrl(src) {
  const accessToken = getAccessToken();
  return `${window.$$env.API_HOST}/hfle/v1/files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}&url=${src}`;
}

export function to(promise, errorExt) {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err) => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }
      return [err, undefined];
    });
}

// 判断元素是否有出现省略号
export function isElementOverflowed(element) {
  if (!element) return false;
  return element.scrollWidth > element.clientWidth;
}

// 判断元素是否换行
export function isElementTextWrapped(element) {
  if (!element) return false;
  const computedStyles = getComputedStyle(element);
  let lineHeight = computedStyles.getPropertyValue('line-height');
  lineHeight = parseInt(lineHeight.replace('px', ''), 10);
  return element.scrollHeight > lineHeight;
}

// hex转rgba
export function hexToRGBA(hex, alpha) {
  if (!hex) return '';
  // 去除 # 符号
  const _hex = hex.replace('#', '');

  // 解析 RGB 部分
  const r = parseInt(_hex.substring(0, 2), 16);
  const g = parseInt(_hex.substring(2, 4), 16);
  const b = parseInt(_hex.substring(4, 6), 16);

  // 验证 alpha 值在有效范围内（0 到 1）
  const _alpha = Math.min(1, Math.max(0, alpha || 1));

  // 返回 RGBA 格式的字符串
  return `rgba(${r}, ${g}, ${b}, ${_alpha})`;
}

// 节流
export function throttleWaiting(fn, delay) {
  let timer = null;
  return (...args) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

/* eslint-disable no-param-reassign */
const isSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('applewebkit') && !userAgent.includes('chrome');
};

/**
 * 获取当前光标选区的信息。
 * @returns {Object|null} 包含光标选区和选择对象的对象，如果没有选区，则返回 null。
 */
export const getEditorRange = () => {
  let range = null;
  let selection = null;
  if (window.getSelection) {
    // 获取选区对象
    selection = window.getSelection();
    if (!selection) {
      return null;
    }
    // 对于 Safari，直接获取第一个选区
    if (isSafari()) {
      range = selection.getRangeAt(0);
    } else if (selection.rangeCount > 0) {
      // 对于其他浏览器，检查 rangeCount 是否大于 0
      range = selection.getRangeAt(0);
    }
  } else {
    return null;
  }
  return {
    range,
    selection,
  };
};

export function getURLSearchParams(url) {
  const searchParams = new URLSearchParams(url);

  const paramsMap = {};

  for (const [key, value] of searchParams.entries()) {
    paramsMap[key] = value;
  }

  return paramsMap;
}

/**
 * 获取路径？后面拼接的参数值
 */
export function getParseUrlParam() {
  const url = decodeURIComponent(location.search);
  const theParam = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theParam[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }
  return theParam;
}

export function getLocationParam(searchStr = '') {
  const url = searchStr || '';
  const theParam = {};
  if (url && url.indexOf && url.indexOf('?') !== -1) {
    const str = url.substr(1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theParam[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }
  return theParam;
}

// base64解码
export function decodeString(str, type) {
  if (type === 'decode') {
    return decodeURIComponent(atob(str));
  } else {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => {
          return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join('')
    );
  }
}

export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}
