const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');

// 除hzero-front外的alias走lib
const aliasConfig = {
  // '@': path.resolve(paths.appRootPath, 'node_modules', 'hzero-front/lib'),
  // '@/assets': 'hzero-front/lib/assets',
  // '@/assets': path.resolve(paths.appPath, 'src/assets'),
  '@/assets': path.resolve(paths.appRootPath, 'src/assets'),
  '@': path.resolve(paths.appPath, 'src'),
  'hzero-boot-customize-init-config': `${path.resolve(paths.appRootPath, './src')}/overwrite`,
  components: path.resolve(paths.appPath, 'src/components/'),
  utils: path.resolve(paths.appPath, 'src/utils/'),
  services: path.resolve(paths.appPath, 'src/services/'),
  'hzero-front/lib': path.resolve(paths.appPath, 'src'),
};

module.exports = aliasConfig;
