// module.exports = {
//   package: {
//     "initLoad": false,
//     registerRegex: "\\/smdm\\/"
//   },
//   "hzeroBoot": "hzero-boot/lib/pathInfo",
//   // webpackConfig: (config, webpackConfigType) => { // webpack 配置修改
//   //   // console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
//   //   if (webpackConfigType !== 'dll') {
//   //   return config;
//   // },
//   // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
//   // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
//   // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
//   dllConfig: { // dllConfig 配置
//     common: {
//       priority: 100,
//       packages: ['react', 'react-dom', 'dva', 'dva/router', 'dva/saga', 'dva/fetch', 'hzero-ui', 'choerodon-ui', 'choerodon-ui/pro', 'core-js'],
//     },
//     vendorsGraph: {
//       packages: ['echarts', 'bizcharts', '@antv/data-set'],
//     },
//     vendors: {
//       packages: ['lodash', 'lodash-decorators', 'react-intl-universal', 'axios', 'uuid', 'numeral', 'react-cropper', 'cropperjs',]
//     }
//   }
// };

module.exports = {
  package: {
    initLoad: true,
    public: true,
    registerRegex: '\\/smdm|pub\\/',
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
  hzeroMS: {
    exposes: {
      './lib/models/materiel': './src/models/materiel',
      './lib/models/materielApplication': './src/models/materielApplication',
      './lib/routes/materialFeedback/read-detail':
        './src/routes/MaterialFeedback/Detail/ReadOnly/index',
      './lib/routes/materialCertificationPool/Detail/ReadOnly': './src/routes/MaterialCertificationPool/Detail/ReadOnly/index',
      './lib/models/materielQuery': './src/models/materielQuery',
      './lib/routes/MaterielQuery/Detail': './src/routes/MaterielQuery/Detail',
      './lib/routes/materialFeedback/edit-detail':'./src/routes/MaterialFeedback/Detail/Edit/index',
    },
  },
};
