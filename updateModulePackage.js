/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const fs = require('fs');

const filterPkgs = ["hzero-front-himp", "hzero-ui", "hzero-front", "choerodon-ui", "srm-front-cuz", "srm-front-boot"];
const _arguments = process.argv.splice(2);
if (_arguments.length < 1) {
  throw new Error('update need arguments: [version]');
}
try {
  // 将release-1.33.0变为1.33.0
  const version = (_arguments[0] || "").replace("release-", "");

  // 读取并修改core的package.json
  const corePkgInfo = require(`${__dirname}/package.json`);
  corePkgInfo.version = version;
  fs.writeFileSync(`${__dirname}/package.json`, JSON.stringify(corePkgInfo, null, 2), 'utf-8');

  // 读取并修改子模块的package.json
  const baseDir = `${__dirname}/packages`;
  const submodules = fs.readdirSync(baseDir);
  submodules.forEach(f => {
    if (filterPkgs.includes(f)) return;
    const pkgInfo = require(`${baseDir}/${f}/package.json`);
    pkgInfo.version = version;
    fs.writeFileSync(`${baseDir}/${f}/package.json`, JSON.stringify(pkgInfo, null, 2), 'utf-8');
  });
} catch (e) {
  console.log('批量修改package.json失败:');
  console.log(e);
}
