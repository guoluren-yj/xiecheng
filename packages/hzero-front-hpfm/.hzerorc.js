// module.exports = {
//   package: {
//     initLoad: true,
//     public: true,
//     registerRegex: '\\/hpfm\\/',
//   },
//   hzeroBoot: 'hzero-boot/lib/pathInfo',
//   dllConfig: {
//     // dllConfig 配置
//     common: {
//       priority: 100,
//       packages: [
//         'react',
//         'react-dom',
//         'dva',
//         'dva/router',
//         'dva/saga',
//         'dva/fetch',
//         'hzero-ui',
//         'choerodon-ui',
//         'choerodon-ui/pro',
//         'core-js',
//       ],
//     },
//     vendorsGraph: {
//       packages: ['echarts', 'bizcharts', '@antv/data-set'],
//     },
//     vendors: {
//       packages: [
//         'lodash',
//         'lodash-decorators',
//         'react-intl-universal',
//         'axios',
//         'uuid',
//         'numeral',
//         'react-cropper',
//         'cropperjs',
//       ],
//     },
//   },
// };

module.exports = {
  package: {
    initLoad: true,
    public: true,
    registerRegex: '\\/hpfm\\/',
  },
  splitChunks: {
    chunks: 'all',
    name: false,
    cacheGroups: {
      polyfill: {
        name: 'polyfill',
        test: /(core-js|regenerator-runtime)/,
        chunks: 'all',
        priority: 20,
      },
    },
  }, // chunks 优化配置 参考: https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
};
