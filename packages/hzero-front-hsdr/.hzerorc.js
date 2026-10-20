
module.exports = {
  "package": {
    "initLoad": false,
    "indexRouter": "/hsdr/conc-request",
    "registerRegex": "(\\/(private|public|pub))?\\/hsdr\\/"
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'), // less 变量配置, theme 的值可以是 string 表示指向配置文件
}
