/**
 * urk相关
 * @date: 2019-12-25
 * @author: wjc <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import qs from 'query-string';
import isPromise from 'is-promise'; 
import request from '../request';

export function isUrl(path) {
  /* eslint no-useless-escape:0 */
  const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(:[\d]+)?((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;
  return reg.test(path);
}

/**
 * 生成带Get参数的URL
 * @param {String} url      原来的url
 * @param {Object} params   get 参数
 */
export function generateUrlWithGetParam(url, params) {
  let newUrl = url;
  if (params && Object.keys(params).length >= 1) {
    const newParams = params; // filterNullValueObject
    if (Object.keys(newParams).length >= 1) {
      newUrl += `${url.indexOf('?') >= 0 ? '&' : '?'}${qs.stringify(newParams)}`;
    }
  }
  return newUrl;
}

/**
 * 得到get请求后面的参数部分,并去掉参数值为空的
 * @param param
 * @returns {String}
 */
export function getUrlParam(param) {
  let on = true;
  let result = '';
  for (const item in param) {
    if (on) {
      on = false;
      if (param[item] || param[item] === 0 || param[item] === false) {
        result = `?${item}=${encodeURIComponent(param[item])}`;
      } else {
        result = '?';
      }
    } else if (param[item] || param[item] === 0 || param[item] === false) {
      result = `${result}&${item}=${encodeURIComponent(param[item])}`;
    }
  }
  return result;
}

/* 与Java默认AES实现兼容的加密方法
* @param {string} plaintext - 要加密的文本
* @param {string} keyBase64 - Base64格式的密钥(必须16/24/32字节)
* @returns {Promise<string>} Base64格式的加密结果
*/
export async function encryptRequestBody(body) {
  try {
    // 检查Web Crypto API支持
    if (!body || !window.crypto || !window.crypto.subtle) {
      return body;
    }
    //获取秘钥
    let keyBase64 = await loadRequestEncryptKey();
    if (!keyBase64) {
        return body;
      }
      const iv = window.crypto.getRandomValues(new Uint8Array(16));
      const keyBytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  
      const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC', length: 128 },
      false,
      ['encrypt']
    );

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      new TextEncoder().encode(body)
  );
  
  // 将IV前置到密文中
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(Array.from(combined, byte => String.fromCharCode(byte)).join(''));
  } catch (error) {
      console.error('加密失败:', error);
      return body;
  }
}

async function loadRequestEncryptKey() {
  try {
    let result;
    // 如果已经加载过密钥，直接返回
    if ((window as any).requestEncryptKey) {
      if (isPromise((window as any).requestEncryptKey)){
        result = await (window as any).requestEncryptKey;
      } else {
        return (window as any).requestEncryptKey;
      }
    } else {
      (window as any).requestEncryptKey = request('/hpfm/v1/config/request-encrypt/info', {
        method: 'POST',
      });
      result = await (window as any).requestEncryptKey;
    }
    // 调用API获取加密密钥
    // 验证返回的数据结构（根据实际API调整）
    if (!result || !result.requestEncryptKey) {
        throw new Error('Invalid key response structure');
    }
    // 缓存密钥到全局变量
    (window as any).requestEncryptKey = result.requestEncryptKey;

    return (window as any).requestEncryptKey;
  } catch (error) {
    console.log(error);
  }
}