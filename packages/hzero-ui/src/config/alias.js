const path = require('path');

// 除hzero-front外的alias走lib
const aliasConfig = {
  'hzero-ui/lib': path.resolve('components'),
};

module.exports = aliasConfig;
