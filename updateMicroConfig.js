/* eslint-disable import/no-absolute-path */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
const fs = require('fs');

const _arguments = process.argv.splice(2);
if (_arguments.length < 2) {
  throw new Error('update need arguments: [sourceMicroConfigPath] [targetMicroConfigPath]');
}
try {
  const cacheFiles = fs.readdirSync(_arguments[0]);
  const newHzeroMicroConfig = require(`${_arguments[0]}/microConfig.json`);

  const srmModulesConfig = {};
  cacheFiles.forEach(f => {
    if (!/microConfig/.test(f) && /.json$/.test(f)) {
      const { version, ...moduleInfo } = require(`${_arguments[0]}/${f}`);
      if (moduleInfo.tenantNum) {
        delete newHzeroMicroConfig[moduleInfo.name];
      } else {
        srmModulesConfig[moduleInfo.name] = moduleInfo;
      }
    }
  });

  const mergeMicroConfig = { ...newHzeroMicroConfig, ...srmModulesConfig };

  fs.writeFileSync(`${_arguments[1]}/microConfig.json`, JSON.stringify(mergeMicroConfig), 'utf-8');
} catch (e) {
  console.log('microConfig.json合并失败:');
  console.log(e);
}
