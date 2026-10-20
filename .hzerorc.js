module.exports = {
  package: {
    initLoad: true,
    public: true,
    registerRegex: '\\/public\\/filePreview',
  },
  packages: [
    // { name: 'hzero-front-hadm', initLoad: false, registerRegex: '\\/hadm\\/' },
    // { name: 'hzero-front-hagd', initLoad: false, registerRegex: '\\/hagd\\/' },
    // { name: 'hzero-front-hdtt', initLoad: false, registerRegex: '\\/hdtt\\/' },
    // { name: 'hzero-front-hfile', initLoad: false, registerRegex: '\\/hfile\\/' },
    // { name: 'hzero-front-hiam', initLoad: false, registerRegex: '\\/hiam\\/' },
    // { name: 'hzero-front-himp' },
    // { name: 'hzero-front-hitf', initLoad: false, registerRegex: '\\/hitf\\/' },
    // { name: 'hzero-front-hmnt', initLoad: false, registerRegex: '\\/hmnt\\/' },
    // { name: 'hzero-front-hmsg' },
    // { name: 'hzero-front-hpfm' },
    // { name: 'hzero-front-hrpt' },
    // { name: 'hzero-front-hsdr', initLoad: false, registerRegex: '\\/hsdr\\/' },
    // { name: 'hzero-front-hmde', initLoad: false, registerRegex: '\\/hmde\\/' },
    // { name: 'hzero-front-hlod', initLoad: false, registerRegex: '\\/hlod\\/' },
    // {
    //   name: 'srm-front-cuz-config',
    //   initLoad: false,
    //   registerRegex: '(\\/(private|public|pub))?\\/hpfm|\\/himp\\/',
    // },
    // {"name": "hzero-front-hwfp"},
    // {"name": "hzero-front-hmde", initLoad: false, registerRegex: "\\/hmde|model\\/"},
    // {"name": "hzero-front-hlod", initLoad: true, registerRegex: "\\/hlod\\/"},
  ],
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
};
