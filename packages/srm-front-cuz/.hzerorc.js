const source = 'src';
const dist = 'lib';

function getExposesByFiles(files) {
  return files.reduce((result, file) => {
    result[`./${dist}/${file}`] = `./${source}/${file}`;
    return result;
  }, {});
}

module.exports = {
  package: {
    initLoad: false,
    indexRouter: "/cuz/test",
    registerRegex: "(\\/(private|public|pub))?\\/cuz\\/"
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'), // less 变量配置, theme 的值可以是 string 表示指向配置文件
  hzeroMS: {
    exposes: {
      ...getExposesByFiles([
        'c7nCustomize',
        'components/c7n/withCustomize',
        'components/Customize',
        'components/Customize/FlexComponents',
        'components/Customize/LovMulti',
        'custH0X/getComponent',
        'custH0X/LovMulti',
        'customizeTool',
        'h0Customize',
        'mixCustomize',
        'utils',
      ]),
      './index': './src',
      './lib': './src',
      './components': './components',
    },
    splitChunks: {
      cacheGroups: {
        common: {
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          name: 'chunk-common',
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'chunk-vendors',
          chunks: 'async',
        },
        'react-dom': {
          test: /[\\/]node_modules[\\/]react-dom[\\/]/,
          priority: 100,
          name: 'react-dom',
        },
        'lodash': {
          test: /[\\/]node_modules[\\/]lodash[\\/](?!lodash.js)/,
          priority: 100,
          name: 'lodash',
        },
        'cust-h0': {
          test: /src[\\/]custH0X[\\/]/,
          priority: 110,
          name: 'cust-h0',
        },
        'customize': {
          test: /src[\\/]/,
          priority: 120,
          name: 'customize',
        },
      },
    },
  },
};
