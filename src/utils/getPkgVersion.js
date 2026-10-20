/**
 * getPkgVersion - 获取一些工具包的版本
 * @date: 2021-05-26
 * @author: lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import localPkg from '../../package.json';

const { resolutions } = localPkg;

const dependencies = [
  '@babel/types',
  '@babel/cli',
  '@babel/core',
  '@babel/helper-hoist-variables',
  '@babel/helper-optimise-call-expression',
  '@babel/preset-env',
  '@babel/preset-react',
  'browserslist',
  'caniuse-lite',
  'colors',
  'css-loader',
  'eslint-plugin-import',
  'file-loader',
  'hzero-boot',
  'hzero-cli',
  'hzero-webpack-scripts',
  'loader-utils',
  'mini-css-extract-plugin',
  'mobx',
  'mobx-react',
  'mobx-react-lite',
  'react',
  'react-beautiful-dnd',
  'react-dom',
  'react-router',
  'react-router-dom',
  'postcss-loader',
  'umi',
  'webpack',
  'webpack-dev-server',
];


export default dependencies.reduce((versions, dependence) => {
  versions[dependence] = resolutions[dependence];
  return versions;
}, {
  'srm-front-cuz': '1.5.0-webpack5',
  'srm-front-boot': '1.28.0-webpack5-2',
  'hzero-front': '1.5.8-webpack5-1',
  'hzero-ui': '2.0.0-webpack5-1',
  'choerodon-ui': '1.5.4-webpack5-3',
});
