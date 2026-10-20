import { overWriteConfig } from 'hzero-boot';

overWriteConfig({
  initC7nUiConfig() {
    const c7nConfig = require('srm-front-boot/lib/utils/loadUiConfig');
    if (c7nConfig && c7nConfig.loadConfig) {
      c7nConfig.loadConfig();
    }
  },
});
