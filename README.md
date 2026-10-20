# SRM Front Core

本项目是基于`React`的构建页面的`JavaScript`UI库以及轻量级前端数据模型/状态管理框架`dva`, 并使用`webpack 4.x`构建本项目.

本项目主要HZero平台前端核心组件/模块/服务,支持通过`lerna`工具,将本项目作为`monorepo`(多模块,多`package`管理模式)模式作为多模块项目的核心子项目

我们提供了一套方案可以基于本项目快速构建全新的`monorepo`项目,其中包含如下工具

* [HZero Front Runtime](https://code.choerodon.com.cn/hzero-hzero/hzero-front-runtime)
* [HZero Front Cli](https://code.choerodon.com.cn/hzero-hzero/hzero-front-cli)

## 目录

* [介绍](##介绍)
* [使用](##使用)
* [项目目录](##项目目录)
* [Author](##Author)
* [Contributing](##Contributing)

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
  * 开发者模式运行内存: >4GB
  * 生产环境编译运行内存: >4GB

* yarn: 推荐使用yarn管理本项目

  > 执行如下命令全局安装yarn
  > ```
  > $ npm install --global yarn 
  > ```
  > 
  > 关于`yarn`请参考 [https://yarnpkg.com](https://yarnpkg.com)

* lerna: 用于管理具有多个`package`的`JavaScript`项目的工具。

  > A tool for managing JavaScript projects with multiple packages.
  > 执行如下命令全局安装
  > ```
  > $ npm install --global lerna
  > ```
  > 
  > 关于`lerna`请参考[https://lernajs.io/](https://lernajs.io/)

* 开发工具: 推荐使用Visual Studio Code编辑器

  > Visual Studio Code推荐插件:
  > * Chinese (Simplified) Language Pack for Visual Studio Code
  > * Debugger for Chrome
  > * EditorConfig for VS Code
  > * ESLint
  > * GitLens — Git supercharged
  > * YAML

### 使用和安装 hzero-front/hzero-front-*/srm-front-* 相关模块（非必须）

在基于`hzero-front`的项目中执行如下命令,即可将`hzero-front/hzero-front-*`相关模块作为依赖安装至项目

```bash
$ yarn add hzero-front --registry=http://nexus.saas.hand-china.com/content/groups/srm-npm-group/
# npm install hzero-front --registry=http://nexus.saas.hand-china.com/content/groups/srm-npm-group/

$ yarn add hzero-front-hiam --registry=http://nexus.saas.hand-china.com/content/groups/srm-npm-group/
# npm install hzero-front-hiam --registry=http://nexus.saas.hand-china.com/content/groups/srm-npm-group/

$ yarn add srm-front-spfm --registry=http://nexus.saas.hand-china.com/content/groups/srm-npm-repositories/
# npm install srm-front-spfm --registry=http://nexus.saas.hand-china.com/content/groups/srm-npm-repositories/
```

> 可以执行如下命令可以跳过puppeteer安装过程中下载Chromium
> 
> ```bash
> $ export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #macos/linux
> # set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #windows
> ```

### 下载/Clone

您可以使用如下命令下载本项目

```shell
git clone https://code.choerodon.com.cn/hzero-srm/srm-front-core.git
cd srm-front-core
```
### 拉取最新 test 分支代码

```shell
git pull
```

### 初始化子模块

初始化子模块，会更加子模块文件关联子模块仓库，拉取子模块代码。

**如果已经初始化，请勿重复执行此语句**

```shell
git submodule update --init --recursive
```

### 拉取子模块 test 代码

切换子模块的分支为 `test`，同时拉取代码。

```shell
git submodule foreach git checkout test
git submodule foreach git pull
```

### 初始化本项目

**由于本项目使用lerna管理项目packages,所以初始化项目请务必执行如下初始化命令,确保主体项目和`packages`子项目依赖安装正确**

由于项目依赖发布于私有 npm 仓库，所以需要将 yarn 的源配置为私有源。

```bash
yarn config set registry http://nexus.saas.hand-china.com/content/groups/srm-npm-group/
```

执行如下命令,安装本项目`packages`依赖(即初始化`workspace`)

```bash
$ lerna bootstrap
```

> 在开发模式下,可以执行如下命令可以跳过puppeteer安装过程中下载Chromium
> 
> ```bash
> $ export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #macos/linux
> # set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #windows
> ``````

`build dll`: 本项目开启`webpack dll`插件,所以在执行`启动/build`操作之前,`请务必执行如下命令`

```bash
$ yarn build:dll
```

### 启动项目/开发者模式

`srm-front-core`主体工程依赖于`packages`下的各模块,所以需要编译`packages`下的各模块,执行如下命令

```bash
$ yarn transpile:prod
```

或者

```bash
$ lerna run transpile
```

接下来,确保`dll`操作已经执行成功后,执行如下命令,即可启动`hzero-front`主体工程

```bash
$ yarn start
```

启动成功后,请访问如下地址即可

```url
http://localhost:8000
```

#### 启动单个packages模块服务

本项目中`packages`模块均可独立编译/打包/部署,即支持`webpack-dev-server`,所以执行如下命令启动`packages`模块

```bash
$ cd packages/<srm front module>
# cd packages/srm-front-hiam
```

`packages`模块项目也开启`webpack dll`插件,所以在执行`启动/build`操作之前,`请务必执行如下命令`

```bash
$ yarn build:dll
```

再执行如下命令即可启动单个packages模块服务

```bash
$ yarn start
```

**注：在对 packages 下面模块进行修改后，需要重新执行相应模块的 `transpile:prod` 命令，来更新当前的依赖**

### 构建

在执行完`build dll`操作之后,执行如下命令即可构建用于生产环境的项目

```bash
$ yarn build
```

最终静态文件会生成至如下目录

```bash
/dist
```

**build 会设置几个环境变量, 您可以改变他们来适应自己的项目。**

变量名及含义如下表所示：

| 变量名           | 含义                                                         | 构建后需要替换 |
| ---------------- | ------------------------------------------------------------ | -------------- |
| BASE_PATH        | 部署在子目录时需要改变。 例如 部署在 /demo/ 下; 则该变量的值为 /demo/ | 是             |
| CLIENT_ID        | hzero 后端进行 OAUTH 认证所需要的客户端参数                  | 是             |
| WFP_EDITOR       | 工作流的接口地址                                             | 是             |
| API_HOST         | 请求接口的地址                                               | 是             |
| WEBSOCKET_HOST   | websocket 地址                                               | 是             |
| ESLINT           | 由于在提交的时候已经校验过了 所以这里不执行校验以提升打包速度 | 否             |
| PLATFORM_VERSION | 系统是OP版还是SAAS版                                         | 是             |

#### 替换操作

如果采用`jenkins`进行构建，则需要在 build 结束后手动执行 `./docker/enterpoint.sh` 进行变量替换，因而需要在脚本中填写实际的变量值。

而如果采用`gitlab CI`进行构建，这些变量的值配置于 `/charts/hzero-front/values.yaml` 内，在容器启动时可执行脚本替换变量。

### Nginx 配置

文件 `docker/default.conf` 为默认的项目`Nginx`配置文件，如需修改`Nginx`配置需要在此更改，在构建 `Docker`镜像时,`Dockerfile`中的指令会将该文件复制到`nginx`配置目录下。

由于基础镜像暂未开启 `gzip`，在本项目`Dockerfile`中存在指令来更改默认的`Nginx`配置文件，以使`gzip`生效，如下：

```shell
RUN sed -i 's/\#gzip/gzip/g' /etc/nginx/nginx.conf;
```

如需关闭 gzip，将该行注释即可。

### 更多可执行脚本

* `precommit`: 执行`git commit`操作之前做`lint-staged`代码检查
* `lint`: 执行`eslint`代码检查和`stylelint`样式检查
* `lint:fix`: 执行`eslint`代码检查并修复和`stylelint`样式检查并修复
* `lint-staged`: 执行`lint-staged`代码检查
* `lint-staged:js`: 执行`eslint` `JavaScript`代码检查
* `lint:style`: 执行`stylelint`样式检查并修复
* `transpile:prod`: 执行`babel`编译,用于开发者模式模块化`build`
* `build:production`: 服务器编译模式,自动先编译dll,再编译核心模块
* `build:analyze`: `webpack`编译打包分析模块
* `transpile`: 用于子项目时`package`模块化`build`
* `add:modules`: 安装编译好的`packages`模块
* `test`: 执行单元测试命令
* `changelog`: 执行变更日志CHANGELOG.md文件生成
* `prettier`: 执行`prettier`用于美化代码
* `tree`: 查看项目目录结构,该命令windows系统支持有限
* `release`: 版本与CHANGELOG管理

## 项目目录

```bash
.
├── CHANGELOG.md                                          // 项目变更日志
├── Dockerfile                                            // docker配置文件
├── README.md                                             // 项目说明
├── charts
├── config                                                // 项目基本配置,包含webpakc相关/路由相关/测试相关/样式相关
│   ├── alias.js                                          // webpack.config别名alias配置
│   ├── env.js                                            // node.js环境变量配置
│   ├── jest                                              // jest单元测试工具配置文件
│   │   ├── cssTransform.js
│   │   └── fileTransform.js
│   ├── paths.js                                          // 静态文件路径配置文件
│   ├── routers.js                                        // 项目菜单路由配置文件
│   ├── theme.js                                          // 默认样式配置文件
│   ├── webpack.config.js                                 // webpack默认配置文件
│   ├── webpack.dll.config.js                             // webpack dll插件配置文件
│   └── webpackDevServer.config.js                        // webpack dev server开发者模式配文件
├── docker                                                // docker镜像配置相关
│   ├── default.conf                                      // nginx 配置文件
│   └── enterpoint.sh
├── jsconfig.json                                         // 开发工具(Visual Studio Code)代码兼容性配置文件
├── lerna.json                                            // lerna多package JavaScript项目管理配置文件
├── mock                                                  // mock静态数据服务配置相关
│   ├── ...
│   └── index.js
├── package.json                                          // 本项目配置node.js 配置文件
├── packages
│   ├── srm-front-sbid                                    // srm-front-sbid 模块
│   ├── srm-front-sfin                                    // srm-front-sfin 模块
│   ├── srm-front-sinv                                    // srm-front-sinv 模块
│   ├── srm-front-smdm                                    // srm-front-smdm 模块
│   ├── srm-front-sodr                                    // srm-front-sodr 模块
│   └── srm-front-spfm                                    // srm-front-spfm 模块
├── public                                                // 公共静态资源目录
│   ├── ...
│   └── index.html                                        // 本项目主页面html文件
├── scripts                                               // 本项目脚本文件包括webpack/模块化编译等 
│   ├── build.js                                          // 生产环境编译脚本文件
│   ├── build.lib.js                                      // babel模块化编译脚本文件 
│   ├── start.js                                          // 项目开发者模式dev server启动脚本文件
├── src                                                   // 工作目录,包含项目业务逻辑代码等
│   ├── assets                                            // 静态小资源目录
│   ├── index.js                                          // 项目入口文件
│   ├── index.less                                        // 项目全局样式
│   ├── models                                            // 项目数据模型
│   │   └── global.js                                     // 全局数据模型
│   ├── router.js                                         // 路由管理逻辑文件
│   ├── routes                                            // 项目核心业务逻辑/页面 
│   │   └── index.js                                      // 入口文件
│   ├── serviceWorker.js                                  // 静态缓存service worker 
│   ├── services                                          // 项目接口逻辑层 
│   ├── setupProxy.js                                     // mock静态数据代理服务器配置文件
│   └── utils                                             // 项目业业务逻辑通用方法 
│       └── router.js                                     // 路由控制逻辑文件
└── yarn.lock                                             // 项目yarn node.js模块配置文件 
```

## Author

@SRM 前端团队  
@中台技术中心·HZero 技术团队

## Contributing

### 版本管理

本项目采用`conventional-changelog`和`standard-version`管理`CHANGELOG`和版本管理,包括`git tags`的管理

### 发布

将本项目发布到`nexus npm`私有源仓库

### 编译用于发布的版本

执行如下命令

```bash
$ cd packages/<srm front module>
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

#### Clone

```shell
git clone https://code.choerodon.com.cn/hzero-srm/srm-front-core.git
cd srm-front-core
```

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
