const path = require('path');
const appRootPath = process.cwd().includes('/packages')
  ? path.resolve(process.cwd(), '../../')
  : process.cwd();

const babelConfig = require(path.resolve(appRootPath, '.babelrc.js'));

module.exports = {
  package: {
    "initLoad": true,
    public: true,
    registerRegex: "\\/srdm|config-object\\/"
  },
  "hzeroBoot": "hzero-boot/lib/pathInfo",
  webpackConfig: (config, webpackConfigType) => {
    // webpack 配置修改
    config.externals = {
      ...config.externals,
    };
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: [
          path.resolve(appRootPath, 'src'),
          path.resolve(appRootPath, 'lib'),
          path.resolve(appRootPath, 'packages'),
          path.resolve(appRootPath, 'node_modules/@htd'),
        ],
        exclude: [/.smock/, /node_modules\/(?!.*@htd).*/, /\.d\.ts$/],
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          customize: require.resolve('babel-preset-react-app/webpack-overrides'),
          ...babelConfig,
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          cacheCompression: true,
          compact: true,
        },
      },
    ].filter(Boolean);
    return config;
  },
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
};
