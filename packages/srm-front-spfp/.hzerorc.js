module.exports = {
  package: {
    initLoad: true,
    public: true,
    registerRegex: '\\/spfp\\/',
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'), // less 变量配置, theme 的值可以是 string 表示指向配置文件
  hzeroMS: {
    exposes: {
      './lib/routes/RuleMaintenance/Rebate/Create': './src/routes/RuleMaintenance/Rebate/Create',
      './lib/routes/RuleMaintenance/Discount/Create':
        './src/routes/RuleMaintenance/Discount/Create',
    },
  },
};
