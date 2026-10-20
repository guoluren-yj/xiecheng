const fs = require('fs');
const path = require('path');
const { promisify } = require('./util/promiseify.js');

const writeFilePro = promisify(fs.writeFile);
const readDirPro = promisify(fs.readdir);
const BASE_SRC = '/assets/icon';
const BASE_SRC_HIPS = '/assets/icon/hipsIcon';
const filterImgFile = (fileNames: string[]): string[] =>
  fileNames.filter((name) => /\.(png|jpg|svg)$/.test(name));
const getSrcPath = (dir: string): string => path.join(__dirname, '..', '..', dir);
const getCurrentPath = (dir: string): string => path.join(__dirname, dir);

(async function () {
  try {
    let fileNames: string[] = [];
    let fileNamesHips: string[] = [];
    try {
      // 读取目录
      fileNames = await readDirPro(getSrcPath(`.${BASE_SRC}`));
      fileNamesHips = await readDirPro(getSrcPath(`.${BASE_SRC_HIPS}`));
    } catch (e) {
      // 没有起始目录，则创建
      return console.log(e);
    }
    const filesMap = new Map([
      ...filterImgFile(fileNames).map<[string, string]>((filename) => [filename, BASE_SRC]),
      ...filterImgFile(fileNamesHips).map<[string, string]>((filename) => [
        filename,
        BASE_SRC_HIPS,
      ]),
    ]);
    const filesMapKeys: string[] = Array.from(filesMap.keys());

    const fromSrcs = filesMapKeys.map((key) => `@${filesMap.get(key)}/${key}`);

    const importNames = filesMapKeys.map((key) => key.replace(/(@|[.]|[-]|\s)/g, '_'));

    let data = '';
    data += `/* 由node编写，请勿手写，使用yarn imglist 自动生成 */\n`;
    data += `/* eslint-disable */\n`;
    data += fromSrcs.map((src, i) => `import ${importNames[i]} from '${src}';\n`).join('');
    data += `\n`;
    data += `/* 由node编写，请勿手写，使用yarn imglist 自动生成 */\n`;
    data += `const icons = new Map([\n`;
    data += importNames.map((name, i) => `  ['${filesMapKeys[i]}', ${name}],\n`).join('');
    data += `]);\n`;
    data += `/* 由node编写，请勿手写，使用yarn imglist 自动生成 */\n`;
    data += 'export default icons;';
    // 写入新的目录下
    await writeFilePro(getCurrentPath('importImg.js'), data, 'UTF-8');
    return console.log(`载入完毕！载入${importNames.length}张图片`);
  } catch (e) {
    console.log(e);
  }
})();
