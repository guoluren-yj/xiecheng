const source = 'src';
const dist = 'lib';

function getExposesByFiles(files) {
  return files.reduce((result, file) => {
    result[`./${dist}/${file}`] = `./${source}/${file}`;
    return result;
  }, {});
}

module.exports = {
  "package": {
    "initLoad": true,
    public: true,
    "indexRouter": "/hrpt/data-set",
    "registerRegex": "(\\/(private|public|pub))?\\/hrpt\\/"
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'), // less 变量配置, theme 的值可以是 string 表示指向配置文件
  hzeroMS: {
    exposes: {
      ...getExposesByFiles([
        'routes/PrintTemplateNew/Content/TemplateConfig/DesignWord'
      ]),
    },
  },
}
