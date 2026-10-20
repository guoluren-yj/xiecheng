## 前言
#### 目前存在的问题？
1. SRM 前端项目截止现在已经达到53个子模块，常规机器已经无法进行生产包的构建了。
2. 在前端进行构建时，会消耗1个小时左右的时间，中途一旦出错就得重新构建
3. 测试、开发、生产只能同时构建一个，且在构建前端时，对后端服务的重启和访问影响很大。
4. 后续会不断的添加新的模块进来，甚至会达到数千的规模，如果不解决这个问题，届时会必定出现无法打包的窘境

#### 微前端的优点
1. 技术栈无关 主框架不限制接入应用的技术栈，子应用具备完全自主权
2. 独立开发、独立部署 子应用仓库独立，前后端可独立开发。
3. 子模块和父模块可以分开构建。

## 微前端改造

#### 1. 前期准备工作

> 以 `srm-front-spfm` 为例

1. 基于各模块test分支，执行 `git checkout -b micro-1.6` ，检出 `micro-1.6分支`
2. 另找位置克隆种子仓库，执行 `git clone -b micro-1.x https://open-gitlab.going-link.com/operation-srm/srm-front-code.git`

#### 2. 项目结构调整

1. 备份 `srm-front-spfm` 项目的 `src` 目录和 `config/routers.js` 、 `config/reDevelopRouter.js`至其他位置，删除整个目录下除 `.git` 外的所有文件。

2. 将克隆下来的种子仓库代码复制到清理后的 `srm-front-spfm` 模块内

3. 将备份的 `config/routers.js` 、 `config/reDevelopRouter.js` 这两个文件移动至  `srm-front-spfm` 项目的 `src/config` 目录，替换原有文件

4. 参考下面微前端配置文件清单，将备份的 `src` 目录内 `业务代码` 迁移到 `srm-front-spfm` 项目的 `src` 目录
  ```js
  // 微前端关键文件清单
  srm-front-spfm
  ┣ mock
  ┣ public 
  ┣ src
  ┃ ┣ assets
  ┃ ┃ ┗ icons
  ┃ ┃ ┃ ┗ .gitkeep
  ┃ ┣ config 
  ┃ ┃ ┣ .env.development.yml
  ┃ ┃ ┣ .env.mock.yml
  ┃ ┃ ┣ .env.yml
  ┃ ┃ ┣ alias.js
  ┃ ┃ ┣ reDevelopRouter.js
  ┃ ┃ ┣ router.js
  ┃ ┃ ┣ router2.js
  ┃ ┃ ┣ routers.js
  ┃ ┃ ┗ theme,js
  ┃ ┣ models
  ┃ ┃ ┗ .gitkeep
  ┃ ┣ overwrite
  ┃ ┃ ┗ index.js
  ┃ ┣ routes
  ┃ ┣ utils
  ┃ ┃ ┗ router.js
  ┃ ┣ index.less
  ┃ ┣ router.js
  ┃ ┣ serviceWorker.js
  ┃ ┗ setupProxy.js
  ┣ .babelrc.js
  ┣ .editorconfig
  ┣ .eslintignore
  ┣ .eslintrc.js
  ┣ .gitignore
  ┣ .hzerorc.js
  ┣ .npmignore
  ┣ .npmrc
  ┣ .prettierignore
  ┣ .prettierrc
  ┣ .stylelintrc
  ┣ commitlint.config.js
  ┣ gitlab-ci.yml
  ┣ jsconfig.json
  ┣ package.json
  ┣ READEME.md
  ┣ upgrade.md
  ┗ yarn.lock
  ```


#### 3. 代码调整
1. 修改 `.hzerorc.js` 文件中以下配置
```javascript
package: {
tenantNum: "", // 二开项目加上租户编码，非二开项目删除此项
initLoad: false,
// ps: 这里换成相应模块的路径前缀，多个前缀用“|”隔开
// 二开项目需要把二开过的标准功能前缀都加上
registerRegex: "\\/ssrc|sslm\\/"
},
```

2. 对比git提交记录，修改`package.json` 文件，将`name` 、 `version` 、 `description`字段恢复到原有的值，如果需要其它第三方依赖，请自行对比`package.json` 的提交记录，将缺失的依赖加到 `devDependencies`。

> 备注：
> * 标准模块删除 `src/config/router2.js` 、 `src/config/reDevelopRouter.js`文件
> * 二开模块删除 `src/config/router.js` 文件， 并重命名 `src/config/router2.js` 为 `src/config/router.js`

#### 4. 启动验证
1. 执行 `yarn` 重新安装依赖

2. 依赖安装完成后，执行 `yarn start` 启动项目，确保页面可以正常打开

3. 验证通过后，提交修改到远程仓库

> 注: 分支合并由平台人员操作，届时会将micro-1.6分别合并至test、dev分支，此前从test检出的开发分支，请自行合并
