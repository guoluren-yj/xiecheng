const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');
let babelConfig = babelConfigFactory();
babelConfig.plugins = [
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      alias: {
        '@/assets': './src/assets', // 单独为 hzero-front Icons 组件提供
        '@': './src',
        'hzero-front/lib/index': 'hzero-boot/lib/entry/root/emptyRouter',

        components: 'hzero-front/lib/components/',
        utils: 'hzero-front/lib/utils/',
        services: 'hzero-front/lib/services/',
        theme: 'srm-front-mall/lib/routes/styles/default',
      },
    },
  ],
]
module.exports = babelConfig;
