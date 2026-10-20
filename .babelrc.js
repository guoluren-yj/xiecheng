const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');

let babelConfig = babelConfigFactory();
babelConfig.plugins = [
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
        'hzero-front/lib/index': 'hzero-boot/lib/entry/root/emptyRouter',

        components: 'hzero-front/lib/components/',
        utils: 'hzero-front/lib/utils/',
        services: 'hzero-front/lib/services/',
        _components: 'srm-front-boot/lib/components/',
        _utils: 'srm-front-boot/lib/utils/',
        _services: 'srm-front-boot/lib/services/',
        'hzero-front-hcuz': 'srm-front-cuz',
      },
    },
  ],
];
module.exports = babelConfig;
