# srm-front-sdrp

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
git clone https://code.choerodon.com.cn/hzero-srm/srm-front-sdrp.git
cd srm-front-sdrp
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
