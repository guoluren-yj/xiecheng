module.exports = {
  package: {
    public: true,
    "initLoad": true,
    registerRegex: '\\/sinv\\/',
  },
  hzeroMS: {
    remotePackages: [ 'srm-front-mobile' ],
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  // webpackConfig: (config, webpackConfigType) => { // webpack 配置修改
  //   // console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
  //   if (webpackConfigType !== 'dll') {
  //   return config;
  // },
  // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
  // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
  theme: require.resolve('srm-front-boot/lib/config/theme.js'),
  // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
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
  splitChunks: {
    chunks: 'all',
    name: false,
    cacheGroups: {
      commons: {
        name: 'commons',
        chunks: 'initial',
        priority: 3,
        minChunks: 2,
      },
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
      libs: {
        // 基本框架
        chunks: 'all',
        test: new RegExp(
          '(react|react-dom|react-dom-router|dva|lodash|react-intl-universal|lodash|lodash-decorators|numeral|cropperjs|codemirror|jsplumb|core-js|react-viewer|react-cropper|react-dnd|react-dnd-html5-backend)'
        ),
        priority: 100,
        name: 'libs',
      },
      'hzero-front-components': {
        // 基本框架
        chunks: 'all',
        test: new RegExp('hzero-front/lib/components'),
        priority: 100,
        name: 'hzero-front-components',
      },
      'hzero-front-utils': {
        // 基本框架
        chunks: 'all',
        test: new RegExp('hzero-front/lib/utils'),
        priority: 99,
        name: 'hzero-front-utils',
      },
      'hzero-ui': {
        // 基本框架
        chunks: 'all',
        test: /hzero-ui/,
        priority: 100,
        name: 'hzero-ui',
      },
      'srm-front-spfm': {
        // 基本框架
        chunks: 'all',
        test: new RegExp('srm-front-spfm/lib'),
        reuseExistingChunk: true,
        priority: 90,
        name: 'srm-front-spfm',
      },
      'srm-front-boot': {
        // 基本框架
        chunks: 'all',
        test: new RegExp('srm-front-boot/lib'),
        reuseExistingChunk: true,
        priority: 90,
        name: 'srm-front-boot',
      },
      'choerodon-ui': {
        // 基本框架
        chunks: 'all',
        test: /choerodon-ui(?!\/pro)/,
        priority: 200,
        name: 'choerodon-ui',
      },
      'choerodon-ui-pro': {
        // 基本框架
        chunks: 'all',
        test: /choerodon-ui\/pro/,
        priority: 200,
        name: 'choerodon-ui-pro',
      },
      echarts: {
        // 基本框架
        chunks: 'all',
        test: /echarts/,
        priority: 100,
        name: 'echarts',
      },
      tinymce: {
        // 基本框架
        chunks: 'all',
        test: /tinymce/,
        priority: 100,
        name: 'tinymce',
      },
      bizcharts: {
        // 基本框架
        chunks: 'all',
        test: /bizcharts/,
        priority: 100,
        name: 'bizcharts',
      },
      'async-comons': {
        // 其余异步加载包
        chunks: 'async',
        minChunks: 5,
        name: 'async-comons',
        priority: 99,
      },
      styles: {
        name: 'styles',
        test: /\.css|less$/,
        chunks: 'all',
        enforce: true,
        priority: 20,
      },
    },
  }, // chunks 优化配置 参考: https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
};
