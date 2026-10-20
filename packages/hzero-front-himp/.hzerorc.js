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
    "initLoad": true,
    public: true,
    registerRegex: "\\/himp\\/"
  },
  exposes: {
    ...getExposesByFiles([
      'components/CommonImport',
    ]),
  },
  "hzeroBoot": "hzero-boot/lib/pathInfo",
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

