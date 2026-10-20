import { overWriteConfig } from 'hzero-boot';

overWriteConfig({
  dvaRootRouter: () => require('../router').default,
  initC7nUiConfig() {
    const c7nConfig = require('srm-front-boot/lib/utils/loadUiConfig');
    if (c7nConfig && c7nConfig.loadConfig) {
      c7nConfig.loadConfig();
    }
  },
  phoneReg: /^1\d{10}$|^(\d{2,5}-?|\(\d{2,5}\))?[1-9]\d{4,7}(-\d{1,8})?$/,
});
