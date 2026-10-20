module.exports = {
  package: {
    public: true,
    initLoad: true,
    registerRegex: '\\/sodr\\/',
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
    remotePackages: ['srm-front-mobile'],
    exposes: {
      './lib/routes/SendOrder/Detail': './src/routes/SendOrder/Detail',
      './lib/routes/ReceivedOrder/Detail': './src/routes/ReceivedOrder/Detail',
      './lib/models/sendOrder': './src/models/sendOrder',
      './lib/models/receivedOrder': './src/models/receivedOrder',
      './lib/routes/components/AgreementLadderPrice':
        './src/routes/components/AgreementLadderPrice/index.js',
      './lib/routes/components/C7nOperationApprove':
        './src/routes/components/C7nOperationApprove/index.js',
      './lib/routes/components/DotButton': './src/routes/components/DotButton/index.js',
      // ['SRM-CHANGHUA','SRM-CHANGSHUN']
      './lib/routes/OrderWorkspace/Detail/OrderApproval':
        './src/routes/OrderWorkspace/Detail/OrderApproval',
      './lib/routes/components/utils': './src/routes/components/utils/index.js',
      './lib/routes/components/PaymentTermInfo': './src/routes/components/PaymentTermInfo',
      './lib/routes/components/OrderAffix': './src/routes/components/OrderAffix',
      './lib/routes/OrderApproval/Detail': './src/routes/OrderApproval/Detail',
      './lib/models/orderApproval': './src/models/orderApproval.js',
    },
  },
};
