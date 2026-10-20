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
    initLoad: true,
    registerRegex: '\\/s2-mall|smpc\\/',
  },
  public: true,
  theme: require.resolve('srm-front-boot/lib/config/theme.js'),
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  hzeroMS: {
    exposes: {
      ...getExposesByFiles([
        'components/SupplierHocLov',
        'hooks/useRuleConfig',
        'components/AddOtherProduct',
        'routes/product/SkuWorkbench/drawers/label',
      ]),
    },
  },
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
