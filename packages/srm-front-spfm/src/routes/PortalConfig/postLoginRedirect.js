/**
 * 登录成功后按 redirect_uri / session.redirectUrl 回跳业务页
 */
import { getSession, setSession } from 'utils/utils';

const INVALID_REDIRECT_PATHS = [
  '/public/home',
  '/public/unauthorized',
  '/public/kickoff',
  '/oauth',
];

/**
 * 将跳转地址写入 session（与 401 逻辑保持一致，存 encode 后的完整 URL）
 * @param {string} redirectUri
 */
export function savePostLoginRedirect(redirectUri) {
  if (!redirectUri || typeof redirectUri !== 'string') {
    return;
  }
  let raw = redirectUri;
  try {
    // 已编码则先解码，避免双重 encode
    if (/%[0-9A-Fa-f]{2}/.test(redirectUri)) {
      raw = decodeURIComponent(redirectUri);
    }
  } catch (e) {
    raw = redirectUri;
  }
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) {
      return;
    }
    setSession('redirectUrl', encodeURIComponent(url.href));
  } catch (e) {
    // ignore invalid url
  }
}

/**
 * 读取并校验登录后回跳地址（仅允许同源业务页）
 * @returns {string|null}
 */
export function getPostLoginRedirectUrl() {
  const cached = getSession('redirectUrl');
  if (!cached || typeof cached !== 'string') {
    return null;
  }
  let raw = cached;
  try {
    raw = decodeURIComponent(cached);
  } catch (e) {
    raw = cached;
  }
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }
    const { pathname } = url;
    if (INVALID_REDIRECT_PATHS.some(p => pathname === p || pathname.includes(p))) {
      return null;
    }
    return url.href;
  } catch (e) {
    return null;
  }
}

/**
 * 清除登录回跳缓存
 */
export function clearPostLoginRedirect() {
  setSession('redirectUrl', '');
}
