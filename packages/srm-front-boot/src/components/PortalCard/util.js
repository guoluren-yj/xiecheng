import intl from 'utils/intl';
import jsencrypt from 'jsencrypt';
import { cleanCookies } from 'universal-cookie/cjs/utils';
import { LOGOUT_URL } from 'hzero-front/lib/utils/config';
import { getAccessToken, removeAccessToken } from 'hzero-front/lib/utils/utils';
/**
 * @function getUrlHashParam 解析HASH参数
 * @param {name} - name
 */
export const getUrlHashParam = (name) => {
  const { hash } = window.location;
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`); // 构造一个含有目标参数的正则表达式对象
  const r = hash.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
};

/**
 * @function getUrlParam 解析url参数
 * @param {name} - name
 */
export const getUrlParam = (name) => {
  const { search } = window.location;
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`); // 构造一个含有目标参数的正则表达式对象
  const r = search.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
};

export function setUrlParam(name, oldValue, value) {
  const destiny = window.location.href;
  const originalText = `${name}=${oldValue}`;
  const replaceText = `${name}=${value}`;
  if (destiny.indexOf(originalText)) {
    return destiny.replace(originalText, replaceText);
  }
  if (destiny.match('[?]')) {
    return `${destiny}&${replaceText}`;
  } else {
    return `${destiny}?${replaceText}`;
  }
}

/**
 *  跳转链接
 */
export const LOGINLIST = [
  {
    title: intl.get('srm.oauth.login.forgetPassword').d('忘记密码'),
    // link: `/oauth/public/default/password_find.html`,
    link: '/app/public/forgetPassword',
    enabled: 0,
    blankEnabled: 1,
    position: 1,
    _tls: {
      title: {
        zh_CN: '忘记密码',
        en_US: 'Forget Password',
        ja_JP: 'パスワードをお忘れの場合',
      },
    },
  },
  {
    title: intl.get('srm.oauth.login.enterprise.recovery').d('企业找回'),
    link: `/oauth/public/default/enterprise-recovery.html`,
    position: 2,
    enasbled: 0,
    blankEnabled: 1,
    _tls: {
      title: {
        zh_CN: '企业找回',
        en_US: 'Enterprise recovery',
        ja_JP: '企業復元',
      },
    },
  },
];

/**
 *  登录类型
 */
export const LOGINTYPELIST = [
  {
    title: intl.get('srm.oauth.login.accountLogin').d('账号登录'),
    enabled: 1,
    type: 'account',
    position: 1,
    _tls: {
      title: {
        zh_CN: '账号登录',
        en_US: 'Sign In',
        ja_JP: 'アカウントログイン',
      },
    },
  },
  {
    title: intl.get('srm.oauth.login.phoneLogin').d('手机号登录'),
    enabled: 1,
    type: 'phone',
    position: 2,
    _tls: {
      title: {
        zh_CN: '手机号登录',
        en_US: 'Log In By Phone',
        ja_JP: 'スマホでログイン',
      },
    },
  },
];

/**
 * @function replacePrefix
 * @param {prefix} - prefix
 * @param {link} - link
 */
export const replacePrefix = (prefix, link) => {
  const reg = prefix ? /\{prefix\}/g : /\{prefix\}./g;
  return link.replace(reg, prefix);
};

/**
 * 加密
 * @param {string} password
 * @return {string}
 */
export const encode = (password) => {
  /* eslint-disable */
  // 初始化加密器
  const encrypt = new jsencrypt();
  // 设置公钥
  const publicKey =
    'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJL0JkqsUoK6kt3JyogsgqNp9VDGDp+t3ZAGMbVoMPdHNT2nfiIVh9ZMNHF7g2XiAa8O8AQWyh2PjMR0NiUSVQMCAwEAAQ==';
  encrypt.setPublicKey(publicKey);
  // 加密
  return encrypt.encrypt(password);
  /* eslint-disable */
};

export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 *  退出登录
 */
export const logout = () => {
  const baseUrl = `${LOGOUT_URL}?access_token=${getAccessToken()}`;
  cleanCookies();
  removeAccessToken();
  window.location.replace(baseUrl);
};

// 用户注册协议地址
export const userAgreement = '/oauth/public/default/terms.html';

// 隐私政策协议
export const privacyAgreement = '/oauth/public/default/terms_two.html';

// 注册地址
export const defaultRegisterLink = `/oauth/public/default/register.html`;

// 找回密码地址
export const passwordFind = `/oauth/public/default/password_find.html`;

// 企业找回地址
export const enterpriseRecoveryLink = `/oauth/public/default/enterprise-recovery.html`;
