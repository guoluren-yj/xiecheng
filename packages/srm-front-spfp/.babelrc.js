const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');
let babelConfig = babelConfigFactory();
if(process.env.MULTIPLE_SKIN_ENABLE === 'true') {
  const { generateC7nUiConfig, generateHzeroUIConfig } = require('@hzero-front-ui/cfg/lib/utils/uedConfig')
  // const uedConfig = require('hzero-front/lib/utils/uedUtils');
  babelConfig.plugins=([
    ...generateHzeroUIConfig(),
    ...generateC7nUiConfig(),
    ...babelConfig.plugins.filter(([_1,_2,pName]=[])=>!['ant', 'c7n', 'c7n-pro'].includes(pName)),
  ]);
}
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