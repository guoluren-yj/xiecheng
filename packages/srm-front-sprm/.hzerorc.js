module.exports = {
  package: {
    "initLoad": true,
    public: true,
    registerRegex: "\\/sprm\\/"
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
      './lib/routes/PurchasePlatform': './src/routes/PurchasePlatform/index.js',
      './lib/routes/PurchaseQuery': './src/routes/NewPurchaseDetail/RequisitionInquery/index.js',
      './lib/routes/PurchaseCancel': './src/routes/NewPurchaseDetail/RequisitionCacel/index.js',
      './lib/routes/PurchaseCreate': './src/routes/NewPurchaseDetail/RequisitionCreation/index.js',
      './lib/routes/H0PurchaseCreate': './src/routes/PurchaseRequisitionCreation/index.js',
      './lib/routes/H0PurchaseCreateDetail': './src/routes/PurchaseRequisitionCreation/Detail/index.js',
      './lib/models/purchaseCreate': './src/models/purchaseRequisitionCreation.js',
      './lib/models/purchaseCancel': './src/models/purchaseRequisitionCancel.js',
      './lib/models/purchaseQuery': './src/models/purchaseRequisitionInquiry.js',
      './lib/models/purchaseplatform': './src/models/purchaseplatform.js',
      './lib/routes/NewPurchaseDetail/RequisitionInquery': './src/routes/NewPurchaseDetail/RequisitionInquery/index.js',
      './lib/routes/PurchasePlatform/AllByExecutionStatus/ContectDoc': './src/routes/PurchasePlatform/AllByExecutionStatus/ContectDoc.js',
      './lib/routes/PurchaseExecution/components/PromptModal': './src/routes/PurchaseExecution/components/PromptModal.js',
      './lib/routes/PurchaseExecution/components/SupplierModal': './src/routes/PurchaseExecution/components/SupplierModal/index.js',
      './lib/routes/components/ReferPrice': './src/routes/components/ReferPrice.js',
      './lib/routes/components/ReferPriceProduct': './src/routes/components/ReferPriceProduct.js',
    },
    remotePackages: ['srm-front-sbud','srm-front-smpc', 'srm-front-spfm'],
  },
};
