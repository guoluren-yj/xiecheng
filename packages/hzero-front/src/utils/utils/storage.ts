import { forIn } from 'lodash';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

/**
 * 存储sessionStorage
 */
export function setSession(key, value) {
  const formatValue = JSON.stringify(value);
  window.sessionStorage.setItem(key, formatValue);
  return true;
}

/**
 * 获取sessionStorage
 */
export function getSession(key) {
  const value = sessionStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return false;
}

export function removeAllCookie() {
  forIn(cookies.getAll(), (_, key) => {
    cookies.remove(key);
  });
}


export function setLanguageStorage(language) {
  setSession('language', language);
  cookies.set('language', language, { 
    path: '/',
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 设置一年有效期
  });
}