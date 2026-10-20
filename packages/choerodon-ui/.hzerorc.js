const path = require('path');
const fs = require('fs');

const libraryName = '.';
const libraryPath = path.join(__dirname);
const uiDir = ['lib', 'lib'];
const proUiDir = ['pro/lib', 'pro/lib'];
const winReg = /\\/g;

function replaceWinPath(paths) {
  return paths.replace(winReg, '/');
}

const exts = [
  // '.tsx',
  // '.ts',
  // '.jsx',
  '.js',
];

function exists(file) {
  return exts.some(ext => {
    return fs.existsSync(`${file}${ext}`);
  });
}

function getExt(file) {
  return !file.endsWith('.d.ts') && exts.find(ext => file.endsWith(ext));
}

function getExposesByFiles(files) {
  return files.reduce((result, [[source, dist], file]) => {
    result[`./${dist}/${file}`] = `./${source}/${file}`;
    return result;
  }, {});
}

function getExposesFromDir(dir, componentDir) {
  const sourceDir = `${dir[0]}/${componentDir}`;
  const distDir = `${dir[1]}/${componentDir}`;
  const dirPath = path.join(libraryPath, sourceDir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    return files.reduce((result, file) => {
      if (file !== '__tests__') {
        if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
          Object.assign(result, getExposesFromDir(dir, `${componentDir}/${file}`));
        } else {
          const ext = getExt(file);
          if (ext) {
            const filePath = file.replace(ext, '');
            result[`./${distDir}/${filePath}`] = `${libraryName}/${sourceDir}/${filePath}`;
          }
        }
      }
      return result;
    }, {});
  }
  throw new Error(`"${sourceDir}" is not exists.`);
}

function getExposes() {
  const result = {};
  [uiDir, proUiDir].forEach(([sourceDir, distDir]) => {
    const tsFilePath = path.join(libraryPath, sourceDir, 'index.d.ts');
    const exportReg = /export\s*\{\s*default\s*as\s*[^\s]+\s*\}\s*from\s*[\'\"]([^\'\"]+)[\'\"]\s*;/g;
    const exportsData = fs.readFileSync(tsFilePath);
    const matchRes = exportsData.toString().match(exportReg);
    if (!matchRes) {
      throw new Error(`${tsFilePath} 不匹配 ${exportReg.toString()}`);
    }
    matchRes.forEach((item) => {
      const execRes = new RegExp(exportReg).exec(item);
      const filePath = replaceWinPath(path.join(sourceDir, execRes[1]));
      const distFilePath = replaceWinPath(path.join(distDir, execRes[1]));
      result[`./${distFilePath}`] = `${libraryName}/${filePath}`;
      result[`./${distFilePath}/style`] = `${libraryName}/${filePath}/style`;
      if (exists(path.join(libraryPath, filePath, 'enum'))) {
        result[`./${distFilePath}/enum`] = `${libraryName}/${filePath}/enum`;
      }
      if (exists(path.join(libraryPath, filePath, 'interface'))) {
        result[`./${distFilePath}/interface`] = `${libraryName}/${filePath}/interface`;
      }
      if (exists(path.join(libraryPath, filePath, 'util'))) {
        result[`./${distFilePath}/util`] = `${libraryName}/${filePath}/util`;
      }
      if (exists(path.join(libraryPath, filePath, 'utils'))) {
        result[`./${distFilePath}/utils`] = `${libraryName}/${filePath}/utils`;
      }
      if (exists(path.join(libraryPath, filePath, 'placements'))) {
        result[`./${distFilePath}/placements`] = `${libraryName}/${filePath}/placements`;
      }
      const localePath = path.join(libraryPath, filePath, 'locale');
      if (fs.existsSync(localePath) && fs.statSync(localePath).isDirectory()) {
        const locales = fs.readdirSync(localePath);
        locales.forEach((locale) => {
          const ext = getExt(locale);
          if (ext) {
            const localeInfo = fs.statSync(path.join(localePath, locale));
            if (!localeInfo.isDirectory()) {
              const localeName = locale.replace(ext, '');
              result[`./${distFilePath}/locale/${localeName}`] = `${libraryName}/${filePath}/locale/${localeName}`;
            }
          }
        });
      }
    });
  });

  return result;
}

const exposes = {
  './dataset': './dataset',
  './dataset/data-set/DataSet': './dataset/data-set/DataSet',
  './dataset/data-set/AttachmentFile': './dataset/data-set/AttachmentFile',
  './dataset/data-set/AttachmentFileChunk': './dataset/data-set/AttachmentFileChunk',
  './dataset/utils': './dataset/utils',
  './dataset/formatter': './dataset/formatter',
  './dataset/data-set/enum': './dataset/data-set/enum',
  './dataset/enum': './dataset/enum',
  './shared': './shared',
  ...getExposes(),
  ...getExposesFromDir(uiDir, '_util'),
  ...getExposesFromDir(uiDir, 'locale-provider'),
  ...getExposesFromDir(uiDir, 'rc-components/util'),
  ...getExposesFromDir(proUiDir, '_util'),
  ...getExposesFromDir(proUiDir, 'locale-context'),
  ...getExposesFromDir(proUiDir, 'code-area/formatters'),
  ...getExposesFromDir(proUiDir, 'code-area/lint'),
  ...getExposesByFiles([
    [uiDir, 'config-provider/ConfigContext'],
    [uiDir, 'dropdown/dropdown'],
    [uiDir, 'modal/confirm'],
    [uiDir, 'radio/RadioContext'],
    [uiDir, 'rc-components/table/TableContext'],
    [uiDir, 'rc-components/table/TableRowContext'],
    [uiDir, 'rc-components/tree/contextTypes'],
    [uiDir, 'rc-components/tree-select/strategies'],
    [uiDir, 'rc-components/trigger'],
    [uiDir, 'rc-components/upload'],
    [uiDir, 'trigger/enum'],
    [proUiDir, 'button/Button'],
    [proUiDir, 'core/enum'],
    [proUiDir, 'core/ViewComponent'],
    [proUiDir, 'data-set/DataSet'],
    [proUiDir, 'data-set/Field'],
    [proUiDir, 'data-set/Record'],
    [proUiDir, 'field/enum'],
    [proUiDir, 'field/FormField'],
    [proUiDir, 'formatter/formatString'],
    [proUiDir, 'progress/Progress'],
    [proUiDir, 'select/Select'],
    [proUiDir, 'stores/LovCodeStore'],
    [proUiDir, 'table/Column'],
    [proUiDir, 'table/Table'],
    [proUiDir, 'table/query-bar/FilterSelect'],
    [proUiDir, 'trigger/enum'],
    [proUiDir, 'trigger-field/enum'],
  ]),
};

module.exports = {
  appSrc: [
    path.join(__dirname, './components'),
    path.join(__dirname, './components-dataset'),
    path.join(__dirname, './components-pro'),
    path.join(__dirname, './components-shared'),
  ],
  hzeroMS: {
    exposes,
    splitChunks: {
      cacheGroups: {
        common: {
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          name: 'chunk-common',
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'chunk-vendors',
          chunks: 'async',
        },
        'jsbarcode': {
          test: /[\\/]node_modules[\\/]jsbarcode[\\/]/,
          priority: 100,
          name: 'jsbarcode',
        },
        'react-slick': {
          test: /[\\/]node_modules[\\/]react-slick[\\/]/,
          priority: 100,
          name: 'react-slick',
        },
        'rc-virtual-list': {
          test: /[\\/]node_modules[\\/]rc-virtual-list[\\/]/,
          priority: 100,
          name: 'rc-virtual-list',
        },
        'react-beautiful-dnd': {
          test: /[\\/]node_modules[\\/]react-beautiful-dnd[\\/]/,
          priority: 100,
          name: 'react-beautiful-dnd',
        },
        'react-dom': {
          test: /[\\/]node_modules[\\/]react-dom[\\/]/,
          priority: 100,
          name: 'react-dom',
        },
        'mobx': {
          test: /[\\/]node_modules[\\/]mobx[\\/]/,
          priority: 100,
          name: 'mobx',
        },
        'esprima': {
          test: /[\\/]node_modules[\\/]esprima[\\/]/,
          priority: 100,
          name: 'esprima',
        },
        'quill': {
          test: /[\\/]node_modules[\\/]quill[\\/]/,
          priority: 100,
          name: 'quill',
        },
        'jshint': {
          test: /[\\/]node_modules[\\/]jshint[\\/]/,
          priority: 100,
          name: 'jshint',
        },
        'htmlhint': {
          test: /[\\/]node_modules[\\/]htmlhint[\\/]/,
          priority: 100,
          name: 'htmlhint',
        },
        'better-scroll': {
          test: /[\\/]node_modules[\\/]@better-scroll[\\/]/,
          priority: 100,
          name: 'better-scroll',
        },
        'js-yaml': {
          test: /[\\/]node_modules[\\/]jshint[\\/]/,
          priority: 100,
          name: 'js-yaml',
        },
        'prettier-parser-yaml': {
          test: /[\\/]node_modules[\\/]prettier[\\/]parser-yaml/,
          priority: 100,
          name: 'prettier-parser-yaml',
        },
        'prettier-parser-html': {
          test: /[\\/]node_modules[\\/]prettier[\\/]parser-html/,
          priority: 100,
          name: 'prettier-parser-babylon',
        },
        'prettier-parser-babylon': {
          test: /[\\/]node_modules[\\/]prettier[\\/]parser-babylon/,
          priority: 100,
          name: 'prettier-parser-babylon',
        },
        'prettier-standalone': {
          test: /[\\/]node_modules[\\/]prettier[\\/]standalone/,
          priority: 100,
          name: 'prettier-standalone',
        },
        'lodash': {
          test: /[\\/]node_modules[\\/]lodash[\\/](?!lodash.js)/,
          priority: 100,
          name: 'lodash',
        },
        'lodash-all': {
          test: /[\\/]node_modules[\\/]lodash[\\/](lodash|index).js/,
          priority: 100,
          name: 'lodash-all',
        },
        'choerodon-ui-shared': {
          test: /choerodon-ui[\\/]/,
          priority: 120,
          name: 'choerodon-ui-shared',
        },
        'choerodon-ui-common': {
          test: /choerodon-ui[\\/](lib|es)[\\/]|[\\/]node_modules[\\/]choerodon-ui-font[\\/]/,
          priority: 130,
          name: 'choerodon-ui-common',
        },
        'choerodon-ui-pro-common': {
          test: /choerodon-ui[\\/]pro[\\/](lib|es)[\\/]/,
          priority: 130,
          name: 'choerodon-ui-pro-common',
        },
        'choerodon-ui-rc-components': {
          test: /choerodon-ui[\\/](lib|es)[\\/]rc-components[\\/][^\\/]+[\\/](?!locale)/,
          priority: 140,
          name: 'choerodon-ui-rc-components',
        },
        'choerodon-ui-pro-ptable': {
          test: /choerodon-ui[\\/]pro[\\/](lib|es)[\\/]performance-table[\\/]/,
          priority: 150,
          name: 'choerodon-ui-pro-performance-table',
        },
        'choerodon-ui-pro-table': {
          test: /choerodon-ui[\\/]pro[\\/](lib|es)[\\/]table[\\/]/,
          priority: 150,
          name: 'choerodon-ui-pro-table',
        },
        'choerodon-ui-table': {
          test: /choerodon-ui[\\/](lib|es)[\\/](rc-components[\\/])?table[\\/]/,
          priority: 150,
          name: 'choerodon-ui-table',
        },
        // 'choerodon-ui-tabs': {
        //   test: /choerodon-ui[\\/](pro[\\/])?(lib|es)[\\/]tabs[\\/]/,
        //   priority: 150,
        //   name: 'choerodon-ui-tabs',
        // },
        // 'choerodon-ui-menu': {
        //   test: /choerodon-ui[\\/](pro[\\/])?(lib|es)[\\/](rc-components[\\/])?menu[\\/]/,
        //   priority: 150,
        //   name: 'choerodon-ui-menu',
        // },
        // 'choerodon-ui-tree': {
        //   test: /choerodon-ui[\\/](pro[\\/])?(lib|es)[\\/](rc-components[\\/])?tree[\\/]/,
        //   priority: 150,
        //   name: 'choerodon-ui-tree',
        // },
        // 'choerodon-ui-field': {
        //   test: /choerodon-ui[\\/](lib|es)[\\/](?:input.*|.*select|.+-picker|checkbox|radio|rate|switch|upload|form)[\\/]/,
        //   priority: 150,
        //   name: 'choerodon-ui-field',
        // },
        // 'choerodon-ui-pro-field': {
        //   test: /choerodon-ui[\\/]pro[\\/](lib|es)[\\/](?:.+-picker|.*field|.+-box|currency|.*select|radio|option|text-area|password|range|output|switch|transfer|cascader|auto-complete|rate|form)[\\/]/,
        //   priority: 150,
        //   name: 'choerodon-ui-pro-field',
        // },
        // 'choerodon-ui-feedback': {
        //   test: /choerodon-ui[\\/](pro[\\/])?(lib|es)[\\/](?:notification|message|tooltip|popconfirm|popover|alert|modal.*|trigger|spin)[\\/]/,
        //   priority: 150,
        //   name: 'choerodon-ui-feedback',
        // },
        'choerodon-ui-style': {
          test: /choerodon-ui[\\/](lib|es)[\\/](.+[\\/])?style[\\/]/,
          priority: 160,
          name: 'choerodon-ui-style',
        },
        'choerodon-ui-pro-style': {
          test: /choerodon-ui[\\/]pro[\\/](lib|es)[\\/](.+[\\/])?style[\\/]/,
          priority: 160,
          name: 'choerodon-ui-pro-style',
        },
      },
    },
  },
  webpackConfig: (config, webpackConfigType) => {
    const webpack = require('webpack');
    // config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1
    // }));
    config.optimization = {
      ...(config.optimization || {}),
      chunkIds: 'named'
    };
    return config;
  },
};
