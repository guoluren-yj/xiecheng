module.exports = {
  package: {
    initLoad: true,
    registerRegex: '\\/sfin\\/',
    // ps: 这里换成二开模块的路径前缀，用“|”隔开，如“ssrc|sslm”\\/"
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
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
        'core-js',
      ],
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
