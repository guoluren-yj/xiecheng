# srm-front-sdat

## Author

> @SRM 前端团队  

## Version

> 1.1.0

## 说明

本项目是基于`React`的构建页面的`JavaScript`UI库以及轻量级前端数据模型/状态管理框架`dva`, 并使用`webpack 4.x`构建本项目.

本项目主要HZero平台前端核心组件/模块/服务,通过 `yarn` 来管理项目的子项目。

## 介绍

### 关于React

React是用于构建用户界面的JavaScript库,本项目采用全新的react v16.8.x,其中包含一些全新的特性.且本项目会持续同步react版本.

更多请参考[React Github](https://github.com/facebook/react)或[React官网](https://reactjs.org/)

### 关于dva框架

dva是基于 redux、redux-saga 和 react-router 的轻量级前端框架。

请参考[dva Github](https://github.com/dvajs/dva)，相关问题可以在[dva Github issues](https://github.com/dvajs/dva/issues)咨询

### 关于webpack

用于构建/打包前端工程,本项目采用全新webpack v4.28.x,其中包含全新的特性/性能优化/社区最佳实践

请参考[webpack](https://webpack.js.org)

### 关于Create React App

本项目是基于Create React App脚手架创建,并执行了`yarn eject`命令

请参考[Create React App](https://github.com/facebook/create-react-app).

## 使用

下面是关于本项目的使用说明

### 环境变量

* node.js: v10.x or v8.x(>= v8.10)

  > 关于node.js请参考: [https://nodejs.org/en/](https://nodejs.org/en/)

* 内存: 
  * 开发者模式运行内存: >8GB
  * 生产环境编译运行内存: >8GB

* yarn: 推荐使用yarn管理本项目

  > 执行如下命令全局安装yarn
  > ```
  > $ npm install --global yarn 
  > ```
  > 
  > 关于`yarn`请参考 [https://yarnpkg.com](https://yarnpkg.com)


* 开发工具: 推荐使用Visual Studio Code编辑器

  > Visual Studio Code推荐插件:
  > * Chinese (Simplified) Language Pack for Visual Studio Code
  > * Debugger for Chrome
  > * EditorConfig for VS Code
  > * ESLint
  > * GitLens — Git supercharged
  > * YAML

## 启动

### 下载/Clone

您可以使用如下命令下载本项目

```shell
git clone https://code.choerodon.com.cn/hzero-srm/srm-front-sdat.git
cd srm-front-sdat
```
### 初始化本项目

**由于本项目使用 yarn 管理项目,所以初始化项目请务必执行如下初始化命令**

由于项目依赖发布于私有 npm 仓库，所以需要将 yarn 的源配置为私有源。

```bash
yarn config set registry https://nexus.going-link.com/repository/zhenyun-npm-source/
```

### 跳过puppeteer安装过程中下载Chromium(可加快安装依赖时间)

```bash
$ export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #macos/linux
# set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #windows
```
### yarn 安装依赖

根路径下直接执行 `yarn` 命令

```bash
$ yarn
```

### build:dll

`build dll`: 本项目开启`webpack dll`插件,所以在执行`启动/build`操作之前,`请务必执行如下命令`

```bash
$ yarn build:dll
```

### 编译模块

需要编译各模块,执行如下命令

```bash
$ yarn run transpile
```

### 启动项目

确保`dll`操作已经执行成功后,执行如下命令,即可启动当前工程

```bash
$ yarn start
```

#### 启动卡在 37% 快速排障

如果执行 `yarn start` 后长时间停在如下日志：

```bash
<i> [webpack-dev-middleware] wait until bundle finished: /
```

可优先按下面顺序处理：

1. 确认本地 Node 版本为 `v16.20.2`
2. 确认依赖源为 `https://nexus.going-link.com/repository/zhenyun-npm-group/`
3. 安装依赖前先执行 `unset NODE_OPTIONS`
4. 重新安装依赖时优先执行：

```bash
yarn install --ignore-optional --registry https://nexus.going-link.com/repository/zhenyun-npm-group/
```

5. 不要随意升级 `hzero-boot`、`hzero-cli`、`hzero-webpack-scripts`、`choerodon-ui`
6. 如果仍卡住，优先检查根项目是否缺失 Babel 依赖

详细原因和完整解决方案请见文末“常见问题 -> 安装依赖后启动项目卡在 37%”章节。

启动成功后,请访问如下地址即可

```url
http://localhost:8000
```

### 构建

在执行完`yarn build dll`和`yarn run transpile`操作之后,执行如下命令即可构建用于生产环境的项目

```bash
$ yarn build
```
最终静态文件会生成至如下目录

```bash
/dist
```
### 更多可执行脚本

* `lint`: 执行`eslint`代码检查和`stylelint`样式检查
* `lint:fix`: 执行`eslint`代码检查并修复和`stylelint`样式检查并修复
* `lint-staged`: 执行`lint-staged`代码检查
* `lint-staged:js`: 执行`eslint` `JavaScript`代码检查
* `lint:style`: 执行`stylelint`样式检查并修复
* `build:analyze`: `webpack`编译打包分析模块
* `transpile`: 用于子项目时`package`模块化`build`
* `test`: 执行单元测试命令
* `changelog`: 执行变更日志CHANGELOG.md文件生成
* `prettier`: 执行`prettier`用于美化代码
* `tree`: 查看项目目录结构,该命令windows系统支持有限
* `release`: 版本与CHANGELOG管理
* `commit`: git-cz 提交代码

## 模块依赖

- srm-front-sbid:
  - srm-front-boot
  - srm-front-ssrc
- srm-front-scec:
  - srm-front-boot
- srm-front-seci:
  - srm-front-boot
- srm-front-sfin:
  - srm-front-boot
  - hzero-front-himp
- srm-front-swfl:
  - srm-front-boot
- srm-front-hips:
  - srm-front-boot
- srm-front-hiam:
  - srm-front-boot
  - hzero-front-himp
  - hzero-front-hmsg
- srm-front-sodr: 
  - srm-front-boot
- srm-front-smdm: 
  - srm-front-boot
- srm-front-sitf: 
  - srm-front-boot
- srm-front-sinv: 
  - srm-front-boot
- srm-front-ssrc: 
  - srm-front-boot
  - srm-front-sbid
- srm-front-sdat: 
  - srm-front-boot
  - hzero-front-hmsg
  - srm-front-sodr
  - srm-front-sslm
- srm-front-spcm` 
  - srm-front-boot
- srm-front-sprm
  - srm-front-boot
- srm-front-sqam
  - srm-front-boot
- srm-front-sslm
  - srm-front-boot
  - srm-front-sdat

## Contributing

### 版本管理

本项目采用`conventional-changelog`和`standard-version`管理`CHANGELOG`和版本管理,包括`git tags`的管理

### 发布

将本项目发布到`nexus npm`私有源仓库

### 编译用于发布的版本

版本号+1，首先将 `package.json` 下面 `version` 字段的版本最小版本 +1 例如

```json
 - version: 1.1.0

 + version: 1.1.1 
```

执行如下命令

```bash
$ yarn transpile
```

#### 生成 `auth hash`

执行如下命令

```bash
echo -n 'username:password' | openssl base64
```

将生成的`auth hash`按照如下方式配置

```conf
email=yourname@hand-china.com
always-auth=true
_auth=yourbase64hashcode
```

执行如下命令将上面的配置加入到`node.js`全局环境变量配置文件`.npmrc`中

```bash
$ npm config edit 
```

再执行如下命令发布即可

```bash
$ npm publish
```

### Git使用规范

#### Git global setup

```shell
git config --global user.name "yourname"
git config --global user.email "youremail@hand-china.com"
```

#### 提交规范

本项目使用 `@commitlint/{cli, config-conventional}`, `commitizen`, `cz-conventional-changelog` 等一系列工具来规范 commit 提交信息，并配合 `standard-version` 来做版本发布管理。

建议全局安装 `commitizen` 工具，提供了 `git cz` 命令来做代码提交提示:

```shell
yarn global add commitizen
# npm install -g commitizen
```

若没有全局安装，项目内同样提供 npm 脚本的方式来使用

```shell
yarn commit # 可以调起 commit 信息
```

意味着，以后在项目中进行 commit 时，无需使用 `git commit` 命令（若能完全记得规范并保证通过 commit 检查也可使用），而使用 `git cz` 命令或 `yarn commit` 来替代。

命令执行后会出现交互式对话框，分别是提交类型，作用域，提交信息以及是否有 break change。

下面是各提交类型的说明：

```
build：主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
ci：主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交
docs：文档更新
feat：新增功能
fix：bug 修复
perf：性能优化
refactor：重构代码(既没有新增功能，也没有修复 bug)
style：不影响程序逻辑的代码修改(修改空白字符，补全缺失的分号等)
test：新增测试用例或是更新现有测试
revert：回滚某个更早之前的提交
chore：不属于以上类型的其他类型
```

按照该规范提交后，可配合 `conventional-changelog` 自动生成 `CHANGELOG.md` 变更文档。

## 开发

### 开发路径/文件

#### 路由

> config/routers.js

#### routes

> src/routers/*

#### models

> src/models/*

#### services

> src/services/*

### 引入包

如果需要引入新的包，请在自己本工程安装测试后，**报备**到前端管理组，进行全局安装

### 升级包

如果核心包 `srm-front-boot` 更新发布或者项目依赖其他模块更新发布，请修改 `package.json` 中的版本号，及时升级。

然后执行 `yarn` 命令，将重新生成的 `yarn.lock` 一并推送到 `git` 仓库。

## 常见问题

### 安装依赖后启动项目卡在 37%

#### 现象

执行 `yarn start` 后，终端长时间停留在如下日志，看起来像是卡在 `37%` 左右，页面也无法正常打开：

```bash
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-middleware] wait until bundle finished: /
```

#### 原因说明

经过排查确认，这个问题不是单一原因导致，而是以下几类问题叠加造成：

1. `node_modules` 与当前工程依赖链不匹配  
   旧工程依赖链依赖特定版本的 `hzero-boot`、`hzero-cli`、`hzero-webpack-scripts`、`choerodon-ui`。如果重新安装后版本被提升或锁文件异常，webpack 编译链会进入不稳定状态。

2. `yarn.lock` 与 `package.json` 不一致  
   部分关键包的锁定版本被错误合并或解析到不兼容版本，导致安装后虽然可以启动命令，但实际编译阶段会卡住。

3. Babel 根级依赖缺失  
   `hzero-cli` 的 Babel 配置依赖多个插件，如果这些插件没有被安装到根项目，webpack 在业务编译阶段会失败，但在默认启动日志中不一定能直接看到真实报错，因此表现为一直停留在 `wait until bundle finished: /`。

4. 本地 Node 版本不兼容  
   本项目旧依赖链在较新 Node 版本下容易出现兼容性问题。经过排查，切换到 `Node v16.20.2` 后明显更稳定。

5. 可选依赖干扰安装  
   如 `canvas` 这类可选依赖在本地编译失败或耗时过长，会导致安装结果不完整，进而影响后续启动。

#### 已确认的解决方案

本项目已按旧可运行依赖链完成过一轮修复，建议严格按以下步骤处理：

1. 使用稳定 Node 版本  

```bash
node -v
```

推荐使用：

```bash
v16.20.2
```

2. 使用私有仓库安装依赖  

```bash
yarn config set registry https://nexus.going-link.com/repository/zhenyun-npm-group/
```

3. 清理旧依赖后重新安装  

```bash
rm -rf node_modules
rm -f yarn.lock
git checkout -- yarn.lock
unset NODE_OPTIONS
yarn install --ignore-optional --registry https://nexus.going-link.com/repository/zhenyun-npm-group/
```

说明：

- `unset NODE_OPTIONS` 用于避免历史遗留的 `--openssl-legacy-provider` 等配置影响 Node 16
- `--ignore-optional` 用于跳过 `canvas` 等可选依赖，降低安装失败概率
- 如果仓库内已有经过验证的 `yarn.lock`，不要随意删除并重建，应优先保留仓库中的锁文件

4. 确认关键依赖版本与锁文件一致  

相关依赖中，以下依赖链需要重点关注：

- `hzero-boot: 3.0.0-zhenyun.38`
- `hzero-cli: 3.0.0-zhenyun.17`
- `hzero-webpack-scripts: 3.0.0-zhenyun.16`
- `choerodon-ui: 1.5.4-webpack5-4`
- `webpack: 5.72.0`
- `webpack-dev-server: 4.7.4`
- `url-loader: 1.1.2`
- `@babel/preset-typescript: 7.18.6`
- `@babel/plugin-proposal-class-properties: 7.18.6`

如果这些依赖安装后被提升到不兼容版本，极容易再次出现启动卡住的问题。

5. 若仍卡在 `37%`，优先排查 Babel 缺失依赖  

以下缺失依赖会导致编译阶段挂住：

- `@babel/preset-typescript`
- `@babel/plugin-proposal-class-properties`
- `@babel/plugin-proposal-numeric-separator`
- `@babel/plugin-proposal-optional-chaining`
- `@babel/plugin-proposal-nullish-coalescing-operator`
- `@babel/plugin-proposal-private-methods`
- `@babel/plugin-proposal-private-property-in-object`
- `babel-plugin-macros`
- `babel-plugin-react-require`
- `babel-plugin-transform-react-remove-prop-types`

这类问题的典型特征是：

- `yarn start` 表面停在 `wait until bundle finished: /`
- 实际上 webpack 内部已经在编译阶段失败
- 默认日志不一定直接输出根因

#### 推荐排查方法

如果重新安装依赖后仍然卡住，建议按以下顺序排查：

1. 先执行：

```bash
unset NODE_OPTIONS
yarn start
```

2. 如果长时间停在 `wait until bundle finished: /`，不要只看启动日志，要进一步检查真实编译错误。

3. 可通过自定义 webpack trace 脚本排查编译停在哪个阶段。  
   经过排查，通过禁用插件对照后，最终明确发现真实错误是 Babel 插件缺失，而不是 webpack 无响应。

#### 当前建议

- 不要随意升级 `hzero-*`、`choerodon-ui`、`webpack` 相关核心依赖
- 重新安装依赖时优先复用仓库内已验证过的 `package.json` 和 `yarn.lock`
- 本地 Node 推荐固定为 `v16.20.2`
- 安装依赖优先使用：

```bash
unset NODE_OPTIONS
yarn install --ignore-optional --registry https://nexus.going-link.com/repository/zhenyun-npm-group/
```

- 启动项目使用：

```bash
yarn start
```

如果依旧卡在 `37%`，优先检查是否存在根级 Babel 依赖缺失，而不是直接怀疑业务代码。
