const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');
const fs = require('fs');

const aliasConfig = {
  '@': fs.existsSync(path.resolve(paths.appPath, 'src'))
    ? path.resolve(paths.appPath, 'src')
    : path.resolve(paths.appPath, 'lib'),
  'hzero-boot-customize-init-config': `${path.resolve(paths.appRootPath, './src')}/overwrite`,
  'hzero-front/lib/index': 'hzero-boot/lib/entry/root/emptyRouter',
  components: 'hzero-front/lib/components/',
  utils: 'hzero-front/lib/utils/',
  services: 'hzero-front/lib/services/',

  theme: 'srm-front-mall/lib/routes/styles/default',
};

module.exports = aliasConfig;
