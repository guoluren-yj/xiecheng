'use strict';
const runtimeVersion = require('@babel/runtime/package.json').version;
const { resolve, isThereHaveBrowserslistConfig } = require('./utils/projectHelper');

module.exports = function(modules) {
  const plugins = [
    [
      resolve('@babel/plugin-transform-typescript'),
      {
        isTSX: true,
      },
    ],
    resolve('@babel/plugin-transform-object-assign'),
    [resolve('@babel/plugin-transform-runtime'), { version: runtimeVersion }],
    resolve('@babel/plugin-proposal-export-default-from'),
    [
      resolve('@babel/plugin-proposal-decorators'),
      {
        legacy: true,
      },
    ],
  ];
  return {
    presets: [
      resolve('@babel/preset-react'),
      [
        resolve('@babel/preset-env'),
        {
          modules,
          targets: isThereHaveBrowserslistConfig()
            ? undefined
            : {
              browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
            },
        },
      ],
    ],
    plugins,
    babelrc: false,
  };
};
