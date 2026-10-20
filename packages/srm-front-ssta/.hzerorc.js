/*
 * @Author: your name
 * @Date: 2020-10-23 11:32:24
 * @LastEditTime: 2023-07-12 09:26:30
 * @LastEditors: yiping.liu
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-ssta\.hzerorc.js
 */
module.exports = {
  package: {
    initLoad: true,
    registerRegex: '\\/ssta\\/',
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
  hzeroMS: {
    exposes: {
      './lib/utils/expose': './src/utils/expose',
      './lib/routes/NewPurchaseSettle/Detail': './src/routes/NewPurchaseSettle/Detail',
      './lib/routes/ReconciliationWorkbench/Detail': './src/routes/ReconciliationWorkbench/Detail',
      './lib/routes/ReconciliationWorkbenchSup/Detail': './src/routes/ReconciliationWorkbenchSup/Detail',
      './lib/routes/NewPurchaseSettle/PrePayment/Detail': './src/routes/NewPurchaseSettle/PrePayment/Detail',
      './lib/routes/SourcingCostPurchaser/ServiceChargeManage': './src/routes/SourcingCostPurchaser/ServiceChargeManage',
      './lib/routes/ExecutionProgress': './src/routes/ExecutionProgress',
    }
  }
};
