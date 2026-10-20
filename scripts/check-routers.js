const path = require('path');
const fs = require('fs');

const root = path.resolve('./packages');
const dirs = fs.readdirSync(root);
const common = [
  'choerodon-ui',
  'hzero-ui',
  'hzero-front',
  'srm-front-boot',
  'srm-front-cuz',
  'srm-front-spfm',
];
const pathReg = /path:\s*('[^']+'|"[^"]+")/g;

console.log('start !!!!!!!!!!');
dirs.forEach(dir => {
  if (!common.includes(dir) && (!dir.includes('cux') || dir.includes('cux-saas'))) {
    const routerConfig = fs.readFileSync(`${root}/${dir}/src/config/routers.js`, { encoding: 'utf-8' });
    const hzeroRc = require(`${root}/${dir}/.hzerorc.js`);
    const { registerRegex } = hzeroRc.package;
    const registerRegex$ = typeof registerRegex === 'string' ? new RegExp(registerRegex) : registerRegex;
    const matches = routerConfig.matchAll(pathReg);
    for (const match of matches) {
      const path$ = match[1];
      if (!registerRegex$.test(path$)) {
        console.log(dir, path$);
      }
    }
  }
});
console.log('done !!!!!!!!!!');
