const path = require('path');
const fs = require('fs');

const libraryName = '.';
const libraryPath = path.join(__dirname);
const source = 'components';
const dist = 'lib';
const uiDir = [source, dist];
const winReg = /\\/g;
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function replaceWinPath(paths) {
  return paths.replace(winReg, '/');
}

function exists(file) {
  return exts.some(ext => {
    return fs.existsSync(`${file}${ext}`);
  });
}

function getExt(file) {
  return !file.endsWith('.d.ts') && exts.find(ext => file.endsWith(ext));
}

function getExposesByFiles(files) {
  return files.reduce((result, file) => {
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
  const [sourceDir, distDir] = uiDir;
  const tsFilePath = path.join(libraryPath, sourceDir, 'index.tsx');
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
    if (exists(path.join(libraryPath, filePath, 'util'))) {
      result[`./${distFilePath}/util`] = `${libraryName}/${filePath}/util`;
    }
    if (exists(path.join(libraryPath, filePath, 'utils'))) {
      result[`./${distFilePath}/utils`] = `${libraryName}/${filePath}/utils`;
    }
    if (exists(path.join(libraryPath, filePath, 'placements'))) {
      result[`./${distFilePath}/placements`] = `${libraryName}/${filePath}/placements`;
    }
    if (exists(path.join(libraryPath, filePath, 'overwriteProps'))) {
      result[`./${distFilePath}/overwriteProps`] = `${libraryName}/${filePath}/overwriteProps`;
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

  return result;
}

const exposes = {
  ...getExposes(),
  ...getExposesFromDir(uiDir, '_util'),
  ...getExposesFromDir(uiDir, 'locale-provider'),
  ...getExposesFromDir(uiDir, 'rc-components/util'),
  ...getExposesByFiles([
    'form/Form',
    'modal/Modal',
  ]),
};

module.exports = {
  appSrc: [
    path.join(__dirname, './components'),
  ],
  hzeroMS: {
    exposes,
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        'hzero-ui-style': {
          test: /hzero-ui[\\/]components[\\/][^\\/]+[\\/]style[\\/]/,
          priority: 101,
          name: 'hzero-ui-style',
        },
        'hzero-ui': {
          test: /hzero-ui[\\/]components[\\/]/,
          priority: 100,
          name: 'hzero-ui',
        },
      },
    },
  },
};
