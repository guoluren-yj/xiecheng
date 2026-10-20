const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');
const fs = require('fs');

// 除hzero-front外的alias走lib
const aliasConfig = {
  '@': fs.existsSync(path.resolve(paths.appPath, 'src')) ? path.resolve(paths.appPath, 'src') : path.resolve(paths.appPath, 'lib'),
  'hzero-front/lib/index': 'hzero-boot/lib/entry/root/emptyRouter',
  'hzero-front/lib/utils/getConvertRouter': 'hzero-boot/lib/utils/getConvertRouter',
  'hzero-boot-customize-init-config': `${path.resolve(paths.appRootPath, './src')}/overwrite`,
  components: 'hzero-front/lib/components/',
  utils: 'hzero-front/lib/utils/',
  services: 'hzero-front/lib/services/',
  theme: 'srm-front-mall/lib/routes/styles/default',
  _components: 'srm-front-boot/lib/components/',
  _utils: 'srm-front-boot/lib/utils/',
  _services: 'srm-front-boot/lib/services/',
};

module.exports = aliasConfig;
