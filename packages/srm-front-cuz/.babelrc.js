const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');

const babelConfig = babelConfigFactory();

babelConfig.plugins = [
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      'alias': {
        'components': 'hzero-front/lib/components',
        'utils': 'hzero-front/lib/utils',
        'services': 'hzero-front/lib/services',
        '@': './src',
      },
    },
  ],
];
module.exports = babelConfig;

