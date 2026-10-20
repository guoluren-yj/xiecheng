module.exports = {
  package: {
    initLoad: false,
    registerRegex: '\\/smep\\/',
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'),
  dllConfig: {
    // dllConfig 配置
    common: {
      priority: 100,
      packages: [
        'react',
        'react-dom',
        'dva',
        'dva/router',
        'dva/saga',
        'dva/fetch',
        'hzero-ui',
        'choerodon-ui',
        'choerodon-ui/pro',
        'core-js'      ],
    },
    vendorsGraph: {
      packages: ['echarts', 'bizcharts', '@antv/data-set'],
    },
    vendors: {
      packages: [
        'lodash',
        'lodash-decorators',
        'react-intl-universal',
        'axios',
        'uuid',
        'numeral',
        'react-cropper',
        'cropperjs',
      ],
    },
  },
};
