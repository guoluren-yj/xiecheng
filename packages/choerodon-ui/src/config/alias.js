const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');
const fs = require('fs');

// 除hzero-front外的alias走lib
const aliasConfig = {
  'choerodon-ui/dataset': path.resolve('components-dataset'),
  'choerodon-ui/shared': path.resolve('components-shared'),
  'choerodon-ui/pro/lib': path.resolve('components-pro'),
  'choerodon-ui/pro': path.resolve('index-pro'),
  'choerodon-ui/lib': path.resolve('components'),
};

module.exports = aliasConfig;
