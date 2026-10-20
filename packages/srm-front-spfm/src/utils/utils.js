import React from 'react';
import { Tag } from 'hzero-ui';

import qs from 'query-string';
import { getDvaApp } from 'utils/iocUtils';
import { API_HOST } from 'utils/config';
import jsencrypt from 'jsencrypt';
import Cookies from 'universal-cookie';
import { queryUUID } from 'hzero-front/lib/services/api';

const JD_PREFIX_IMG_URL = 'http://img13.360buyimg.com';
const allMenuData = getDvaApp()._store.getState().global.menuLeafNode;

const ACCESS_TOKEN = 'access_token';
const cookies = new Cookies();

export function jdConvertImg(path, level = 0) {
  return `${JD_PREFIX_IMG_URL}/n${level}/${path}`;
}

/**
 * 取范围内的随机值整数 左闭右开
 * @param {number} min
 * @param {number} max
 * @returns
 */
export function getRandomInt(min, max) {
  const minNum = Math.ceil(min);
  const maxNum = Math.floor(max);
  return Math.floor(Math.random() * (maxNum - minNum)) + minNum; // 不含最大值，含最小值
}

// 路由为public下。获取token
export const getToken = () => {
  const privateRouter = window.location.pathname.startsWith('/private');
  const privateToken = qs.parse(window.location.search) || {};
  return privateRouter
    ? privateToken.access_token
    : cookies.get(ACCESS_TOKEN, {
        path: '/',
      });
};

/**
 * 获取路径？后面拼接的参数值
 */
export function getUrlParam() {
  const url = location.search;
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

/**
 * 获取路径？后面拼接的参数值
 */
export function getParseUrlParam(searchStr) {
  const url = searchStr ? decodeURIComponent(searchStr) : ''; // location.search
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

export function getExpires(ms) {
  const expires = new Date();
  expires.setTime(new Date().getTime() + ms);
  return expires;
}

export function findMenuName(menuName) {
  // 避免把结算平台内的菜单移动到新建的目录下，导致查询失败
  const findItem = allMenuData.find(v =>
    [v.name, v.functionMenuCode, v?.menuItem?.functionMenuCode].includes(menuName)
  );
  return findItem;
}
export function menuLeaf() {
  const state = getDvaApp()._store.getState();
  const { global: { menuLeafNode = [] } = {} } = state;
  return menuLeafNode;
}

export function getDetailDispatchRouter() {
  const menuLeafNode = menuLeaf();
  let approvalMenu = false;
  let taskMenu = false;
  menuLeafNode.forEach(item => {
    if (item.path === '/hwfp/approval') {
      approvalMenu = true;
    }
    if (item.path === '/hwfp/task') {
      taskMenu = true;
    }
  });
  return { approvalMenu, taskMenu };
}

export function getOrigin(HOST = '') {
  return window.location.origin.includes('localhost')
    ? API_HOST + HOST
    : window.location.origin + HOST;
}

export const encode = password => {
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

/**
 * public下手动获取多语言
 * @param {string} language
 * @param {string} name
 * @param {string} promptKey
 */
export const queryIntl = async (language, name, promptKey) => {
  const sessionIntl = `${language}-${name}`;
  const tenantId = cookies.get('hostTenantId') || cookies.get('tenantId') || 0;
  const res = await request(
    `${HZERO_PLATFORM}/v1/${tenantId}/prompt/${language}?promptKey=${promptKey}`
  );
  if (getResponse(res)) {
    setSession(sessionIntl, res);
    return res;
  }
  return {};
};

export const PROTAL_CARD_CONTENT_TYPE = {
  IFRAME: 'iframe',
  RICH_TEXT: 'richText',
  CUSTOMIZE: 'customize',
};

/**
 * createAttachmentUUID - 创建返回UUID
 */
export async function createAttachmentUUID() {
  const res = await queryUUID();
  const attachmentUUID = res?.content ?? '';
  return attachmentUUID;
}

// 含有离职标识的string转化为带有tag的dom
export function ResignedDisplay({ value = '' }) {
  try {
    const messageArr = value.split('[employeeResign]');
    const { length } = messageArr;
    if (length < 2) {
      return value;
    }
    const result = [];
    messageArr.forEach((item, index) => {
      result.push(item);
      if (index < length - 1) {
        result.push(<QuitTag />);
      }
    });
    return <>{result.map(item => item)}</>;
  } catch (e) {
    return value;
  }
}

// 离职tag
export function QuitTag() {
  return (
    <Tag
      color="#E5E7EC"
      style={{
        lineHeight: '18px',
        height: '18px',
        border: 'none',
        padding: '0 4px',
        cursor: 'default',
        margin: 0,
        transform: 'scale(0.84)',
        color: '#4e5769',
      }}
    >
      {intl.get('hzero.common.organization.model.position.leave').d('离职')}
    </Tag>
  );
}

export function processStatusRender(processStatus, currentStatus) {
  if (!currentStatus || currentStatus.toUpperCase() === 'APPROVAL') {
    // return <Tag color="geekblue">{processStatus.APPROVAL || ''}</Tag>;
    return (
      <Tag style={{ color: '#fca400', backgroundColor: '#fef4e2' }}>
        {processStatus.APPROVAL || ''}
      </Tag>
    );
  }
  switch (currentStatus.toUpperCase()) {
    case 'APPROVED':
      // return <Tag color="green" >{processStatus.APPROVED || ''}</Tag>;
      return (
        <Tag style={{ color: '#47b883', backgroundColor: '#ebf7f1' }}>
          {processStatus.APPROVED || ''}
        </Tag>
      );
    case 'REJECTED':
      // return <Tag color="red">{processStatus.REJECTED || ''}</Tag>;
      return (
        <Tag style={{ color: '#f56649', backgroundColor: '#ffeeeb' }}>
          {processStatus.REJECTED || ''}
        </Tag>
      );
    case 'STOP':
      // return <Tag>{processStatus.STOP || ''}</Tag>;
      return (
        <Tag style={{ color: '#595959', backgroundColor: '#f0f0f0' }}>
          {processStatus.STOP || ''}
        </Tag>
      );
    case 'REVOKE':
      // return <Tag color="magenta">{processStatus.REVOKE || ''}</Tag>;
      return (
        <Tag style={{ color: '#f56649', backgroundColor: '#ffeeeb' }}>
          {processStatus.REVOKE || ''}
        </Tag>
      );
    case 'SUSPENDED':
      // return <Tag color="orange">{processStatus.SUSPENDED || ''}</Tag>;
      return (
        <Tag style={{ color: '#f56649', backgroundColor: '#ffeeeb' }}>
          {processStatus.SUSPENDED || ''}
        </Tag>
      );
    default:
      // return <Tag color="geekblue">{processStatus.APPROVAL || ''}</Tag>;
      return (
        <Tag style={{ color: '#333', backgroundColor: '#ddd', fontWeight: 400 }}>
          {processStatus[currentStatus] || ''}
        </Tag>
      );
  }
}

export function getURLSearchParams(url) {
  const searchParams = new URLSearchParams(url);

  const paramsMap = {};

  for (const [key, value] of searchParams.entries()) {
    paramsMap[key] = value;
  }

  return paramsMap;
}
