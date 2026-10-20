import qs from 'querystring';
import Cookies from 'universal-cookie';
import { overWriteConfig } from 'hzero-boot';
import { getCurrentUser } from 'utils/utils/user';
import ApmInit, { processRequestError } from '../utils/apm';

const cookies = new Cookies();

ApmInit();

overWriteConfig({
  // 兼容最新版Chrome xframe cookie写入
  patchToken: () => {
    const tokenConfig = {
      sameSite: 'none',
      secure: true,
    };
    const TEST_TOKEN = 'TEST_TOKEN';
    cookies.set(TEST_TOKEN, TEST_TOKEN, {
      path: '/',
      ...tokenConfig,
    });
    if (!cookies.get(TEST_TOKEN)) {
      delete tokenConfig.sameSite;
      cookies.set(TEST_TOKEN, TEST_TOKEN, {
        path: '/',
        ...tokenConfig,
      });
    }
    if (!cookies.get(TEST_TOKEN)) {
      delete tokenConfig.secure;
    }
    cookies.remove(TEST_TOKEN, {
      path: '/',
    });
    return tokenConfig;
  },
  patchRequestHeader: () => {
    const params = {};
    // 只作用于工作流
    try {
      if (
        window.top.location.href.includes('/hwfp') ||
        window.top.location.href.includes('/doc-link')
      ) {
        const urlParams = qs.parse(window.top.location.search.substr(1));
        params['H-Menu-Id'] = window.top.location.href.includes('/doc-link')
          ? urlParams.activeTabMenuId
          : window.top.dvaApp._store.getState().global.activeTabMenuId;
        if (urlParams['s-workflow-token']) {
          params['s-workflow-token'] = urlParams['s-workflow-token'];
        }
      }
    } catch (e) {
      console.log(e);
    }
    const { language = cookies.get('language') || 'zh_CN' } = getCurrentUser() || {};
    if (language === 'zh_CN') {
      const { activeElement } = document;
      if (
        activeElement &&
        (['button', 'a'].includes(activeElement.tagName.toLowerCase()) ||
          activeElement.dataset['spm-text'])
      ) {
        const spmText = activeElement.dataset['spm-text'] || activeElement.textContent;
        if (spmText) {
          params['h-request-trigger'] = encodeURIComponent(spmText);
        }
      }
    }
    return params;
  },
  // 可以设置 dvaApp.router 的根路由
  dvaRootRouter: () => require('../router').default,
  phoneReg: /^1\d{10}$|^(\d{2,5}-?|\(\d{2,5}\))?[1-9]\d{4,7}(-\d{1,8})?$/,
  dealGlobalError: err => {
    console.log(err);
  },
  responseIntercept(props) {
    processRequestError(props);
  },
  initC7nUiConfig() {
    const c7nConfig = require('srm-front-boot/lib/utils/loadUiConfig');
    if (c7nConfig && c7nConfig.loadConfig) {
      c7nConfig.loadConfig();
    }
  },
  globalConfig: () => require('srm-front-boot/lib/utils/defaultConfig'),
  // 可以替换 global 配置
  // globalModal: () => require('../models/global').default(window.dvaApp),
});
