import { overWriteConfig } from 'hzero-boot';

overWriteConfig({
  // 可以设置 dvaApp.router 的根路由
  dvaRootRouter: () => require('../router').default,
  // 可以替换 global 配置
  initC7nUiConfig() {
    const c7nUiConfig = require('srm-front-boot/lib/utils/loadUiConfig');
    c7nUiConfig.loadConfig();
  },
  // globalModal: () => require('../models/global').default,
});
