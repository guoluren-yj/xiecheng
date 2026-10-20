module.exports = {
  package: {
    "initLoad": true,
    public: true,
    registerRegex: "\\/sbud|pub|sbdm\\/"
  },
  "hzeroBoot": "hzero-boot/lib/pathInfo",
  // webpackConfig: (config, webpackConfigType) => { // webpack 配置修改
  //   // console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
  //   if (webpackConfigType !== 'dll') {
  //   return config;
  // },
  // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
  // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
  // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
  dllConfig: { // dllConfig 配置
    common: {
      priority: 100,
      packages: ['react', 'react-dom', 'dva', 'dva/router', 'dva/saga', 'dva/fetch', 'hzero-ui', 'choerodon-ui', 'choerodon-ui/pro', 'core-js'],
    },
    vendorsGraph: {
      packages: ['echarts', 'bizcharts', '@antv/data-set'],
    },
    vendors: {
      packages: ['lodash', 'lodash-decorators', 'react-intl-universal', 'axios', 'uuid', 'numeral', 'react-cropper', 'cropperjs',]
    }
  },
  hzeroMS: {
    exposes: {
      './lib/routes/SearchBarTable': './src/routes/components/SearchBarTable',
      './lib/routes/BudgetOccupiedModal': './src/routes/BudgetOccupiedModal',
    },
  },
};



// module.exports = {
//   package: {
//     initLoad: false,
//     registerRegex: '\\/sbud|pub|sbdm\\/',
//   },
//   splitChunks: {
//     chunks: 'all',
//     name: false,
//     cacheGroups: {
//       polyfill: {
//         name: 'polyfill',
//         test: /(core-js|regenerator-runtime)/,
//         chunks: 'all',
//         priority: 20,
//       },
//     },
//   }, // chunks 优化配置 参考: https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
// };
