import { overWriteConfig } from 'hzero-boot';

overWriteConfig({
  dvaRootRouter: () => require('../router').default,
  initC7nUiConfig() {
    const c7nConfig = require('srm-front-boot/lib/utils/loadUiConfig');
    if (c7nConfig && c7nConfig.loadConfig) {
      c7nConfig.loadConfig();
    }
  },
});
