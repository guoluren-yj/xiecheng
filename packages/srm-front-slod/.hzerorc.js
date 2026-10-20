module.exports = {
  package: {
    public: true,
    initLoad: true,
    registerRegex: '\\/slod|sodr\\/',
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
  },
  hzeroMS: {
    remotePackages: ['srm-front-sodr', 'srm-front-mobile'],
  },
};
