const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');

let babelConfig = babelConfigFactory();

babelConfig.plugins = [
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
        components: './src/components',
        utils: './src/utils',
        services: './src/services',
      },
    },
  ],
];
module.exports = babelConfig;
