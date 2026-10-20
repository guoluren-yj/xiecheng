const fs = require('fs');
// node path模块
const path = require('path');

const source = 'src';
const dist = 'lib';
// 收集所有的文件路径
const arr = [];

const fileDisplay = (url) => {
  const filePath = path.resolve(url);
  //根据文件路径读取文件，返回文件列表
  files = fs.readdirSync(filePath);
  files.forEach((filename) => {
    //获取当前文件的绝对路径
    const filedir = path.join(filePath, filename);
    // fs.stat(path)执行后，会将stats类的实例返回给其回调函数。
    const stats = fs.statSync(filedir);
    // 是否是文件
    const isFile = stats.isFile();
    // 是否是文件夹
    const isDir = stats.isDirectory();
    if (isFile) {
      // 这块我自己处理了多余的绝对路径，第一个 replace 是替换掉那个路径，第二个是所有满足\\的直接替换掉
      arr.push(filedir.replace(__dirname, '.').replace(/\\/img, '/'))
    }
    // 如果是文件夹
    if (isDir) fileDisplay(filedir);
  });
  return arr
}

const getExposesByFiles = (files) => {
  return files.reduce((result, file) => {
    result[file.replace(source, dist)] = file;
    return result;
  }, {});
}

function getExposesRelativeByFiles(files) {
  return files.reduce((result, file) => {
    result[`./${dist}/${file}`] = `./${source}/${file}`;
    return result;
  }, {});
}

module.exports = {
  package: {
    "initLoad": true,
    registerRegex: "\\/spcm|sodr\\/"
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
    remotePackages: [
      'srm-front-spfp',
      'srm-front-sbud',
      'srm-front-mobile',
    ],
    /**
     * 用getExposesByFiles(fileDisplay('.xx/xxx/xxx'))批量暴露文件的方式好像不能生效。
     * 所以还是用getExposesRelativeByFiles(['xx/xxx/xxx', 'xx/xxx/xxx'])的方式暴露文件。
     */
    exposes: {
      './lib/routes/components/PreferentialRule': './src/routes/components/PreferentialRule',
      './lib/routes/ContractControl/Detail/index': './src/routes/ContractControl/Detail/index',
      './lib/routes/workspace/Detail/view': './src/routes/workspace/Detail/view',
      './lib/models/contractChapter': './src/models/contractChapter',
      './lib/models/contractCommon': './src/models/contractCommon',
      './lib/models/contractMaintain': './src/models/contractMaintain',
      './lib/models/editorOnline': './src/models/editorOnline',
      './lib/models/workSpace': './src/models/workSpace',
      // ...getExposesByFiles(fileDisplay('./src/routes/workspace')),
      // ...getExposesByFiles(fileDisplay('./src/routes/workspace/Detail')),
      // ...getExposesByFiles(fileDisplay('./src/routes/PurchaseContractView')),
      // ...getExposesByFiles(fileDisplay('./src/routes/ContractMaintain')),
      // ...getExposesByFiles(fileDisplay('./src/routes/ContractControl')),
      ...getExposesRelativeByFiles([
        'routes/workspace/ReferenceDocument',
        'routes/components/Precision/PrecisionInputNumber',
        'routes/components/Precision/C7nPrecisionInputNumber',
        'routes/components/SmartReview',
        'routes/workspace/Detail/components/ContractPartner',
        'routes/workspace/Detail/components/ContractHeader/ConstructForm',
        'routes/components/TextCompareModalNew',
        'routes/components/AISvg',
        'services/contractMaintainService',
      ]),
    },
  }
};
