const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');

let babelConfig = babelConfigFactory();
if (process.env.MULTIPLE_SKIN_ENABLE === 'true') {
  const {
    generateC7nUiConfig,
    generateHzeroUIConfig,
  } = require('@hzero-front-ui/cfg/lib/utils/uedConfig');
  // const uedConfig = require('hzero-front/lib/utils/uedUtils');
  babelConfig.plugins = [
    ...generateHzeroUIConfig(),
    ...generateC7nUiConfig(),
    ...babelConfig.plugins.filter(
      ([_1, _2, pName] = []) => !['ant', 'c7n', 'c7n-pro'].includes(pName)
    ),
  ];
}
babelConfig.plugins = [
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
        'hzero-front/lib/index': 'hzero-boot/lib/entry/root/emptyRouter',      
        'utils/intl': 'srm-front-boot/lib/utils/intl',
        'components/Lov': 'srm-front-boot/lib/components/LovSrm',
        'hzero-front/lib/components/Lov': 'srm-front-boot/lib/components/LovSrm',
        'components/Import': 'srm-front-boot/lib/components/Import',
        'hzero-front/lib/components/Import': 'srm-front-boot/lib/components/Import',
        'components/ExcelExportPro': 'srm-front-boot/lib/components/ExcelExportPro',
        'hzero-front/lib/components/ExcelExportPro': 'srm-front-boot/lib/components/ExcelExportPro',
        components: 'hzero-front/lib/components/',
        utils: 'hzero-front/lib/utils/',
        services: 'hzero-front/lib/services/',
        theme: 'srm-front-mall/lib/routes/styles/default',
        _components: 'srm-front-boot/lib/components/',
        _utils: 'srm-front-boot/lib/utils/',
        _services: 'srm-front-boot/lib/services/',
      },
    },
  ],
];
module.exports = babelConfig;
