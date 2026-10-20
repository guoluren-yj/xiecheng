# SRM 平台前端迁移改造步骤

## 服务代码层面修改

拆分后，一个服务的 src 文件夹通常如下(以 smdm 模块)为例：

```shell
.
├── index.js
├── index.less
├── models
│   ├── rateOrg.js
├── router.js
├── routes
│   ├── RateOrg
│   │   ├── RateForm.js
│   │   └── index.js
│   └── index.js
├── serviceWorker.js
├── services
│   ├── rateOrgService.js
├── setupProxy.js
└── utils
    ├── config.js
    └── router.js
```

在原工程中，`models`, `routes`, `services` 下均存在服务名命名的模块，在拆分后，可将层级缩减，各个服务文件直接归属于相应的 `models`, `routes`, `services` 文件夹下，如上面的例子所示。

**注意：**

1. 在 models 中存在 global.js 文件为必须文件，各个拆分模块的 models 目录均需包含
2. 原 `utils/utils.less` 的位置变化，更改后引用路径为 `@import '~hzero-front/lib/assets/styles/utils.less';`
3. 在 less 文件中引用时不可使用别名，需要采用包名引用方式，比如上面第二条的引用方式，若为 url 引用，则需要采用类似 `url('hzero-front/lib/assets/logo.png')'` 的写法。

### 别名处理

对于文件内模块的引用，比如上面 `models/rateOrg.js` 中需要引用 `services/rateOrgService.js` 中的一些方法，不可采用相对路径，只允许采用别名引用的方式。在各个服务的 webpack 配置文件，例如 `packages/srm-front-smdm/config/alias.js` 中可以看到，配置了别名 `@`，它是当前服务的 `src` 文件夹的别名。

所以，凡是当前服务内模块的相互引用，均要使用别名 `@` 来处理。

- 如果当前服务必须引用其他服务的文件，则需要进行模块拆分，以降低服务间的耦合。

- 对于 SRM 平台通用的 `utils`, `components`, `services`，需要在相应别名前加 `_`，下面是一例：

  ```javascript
  import { HZERO_FILE } from 'utils/config';
  import { SRM_MDM } from '_utils/config';
  ```

  若后续需要添加通用的 utils 方法或者组件，需要在 `srm-front-spfm` 模块内部添加。

- 对于 routes 下面通模块组件的相互引用，无需使用别名，使用相对路径即可。

总而言之，处理别名部分要做的事情就是模块引用采用别名引用，不可采用相对路径引用(同服务 routes 下的组件间引用除外)。

### 国际化相关函数名处理

拆分服务后，国际化相关的函数名进行了更新。

旧：

```javascript
import prompt from 'utils/intl/prompt';
```

新：

```javascript
import formatterCollections from 'utils/intl/formatterCollections';
```

在使用时，相关装饰器名也需要进行相应的更改：

```javascript
@prompt // 旧

@formatterCollections // 新
```

### 路由处理

拆分后，各服务的路由配置于 `config` 文件夹下，以 smdm 为例:  `packages/srm-front-smdm/config/routers.js` 。

根据上面的文件夹结构图的内容，来添加第一个路由：

```javascript
module.exports = [
  {
    path: "/smdm/rate-org",
    models: ['rateOrg'],
    component: "RateOrg",
  }
];
```

路由可以进行层级嵌套，下面是一些例子（很直白）：

旧：

```javascript
/** 平台接口管理-hitf  */
'/hitf/application': {
  component: dynamicWrapper(app, ['hitf/application'], () =>
    import('../routes/hitf/Application')
  ),
},
'/hitf/services': {
  component: dynamicWrapper(app, ['hitf/services'], () => import('../routes/hitf/Services')),
},
'/hitf/interface-logs': {
  component: dynamicWrapper(app, ['hitf/interfaceLogs'], () => import('../routes')),
},
'/hitf/interface-logs/list': {
  component: dynamicWrapper(app, ['hitf/interfaceLogs'], () =>
    import('../routes/hitf/InterfaceLogs')
  ),
},
'/hitf/interface-logs/detail/:interfaceLogId': {
  component: dynamicWrapper(app, ['hitf/interfaceLogs'], () =>
    import('../routes/hitf/InterfaceLogs/Detail')
  ),
},
```

新：

```javascript
module.exports = [
  {
    path: "/hitf/application",
    component: "Application",
    models: [
      "application"
    ]
  },
  {
    path: "/hitf/interface-logs",
    models: [
      "interfaceLogs"
    ],
    components: [
      {
        path: "/hitf/interface-logs/list",
        component: "InterfaceLogs",
        models: [
          "interfaceLogs"
        ]
      },
      {
        path: "/hitf/interface-logs/detail/:interfaceLogId",
        component: "InterfaceLogs/Detail",
        models: [
          "interfaceLogs"
        ]
      },
    ]
  },
  {
    path: "/hitf/services",
    component: "Services",
    models: [
      "services"
    ]
  },
];
```

此时，对于代码部分的修改就已经完成了。

**注:**

特别注意上面的配置中，*`component`* 和 *`components`* 的区别。

## 服务包部分的修改

在 packages 下面，每一个服务模块都是单独的文件夹，该文件夹下除了 `src` 外，还有供本服务单独运行的 webpack 配置等文件。需要修改的内容如下：

`package.json`: 需要修改 `name`, `description` 字段为相应的服务名，`version` 修改为相应的版本号。

## 运行服务

在当前服务文件夹内，执行 `yarn build:dll` 生成 dll，随后执行 `yarn start` 启动服务。查询有无报错，若报错则根据相应的错误信息进行修正，一般而言是别名的引用路径的问题。

## 整合模块于 srm-front

各个模块管理在 `srm-front` 工程的 `packages` 中，因此，除了在模块内启动工程，在 `srm-front` 基础工程内也应能够启动工程。需要做下面几件事：

### 路由配置

在 `src/utils/getModuleRouters.js` 中添加模块的路由配置，依旧以 `srm-front-smdm` 模块为例：

```javascript
import { getModuleRouters } from 'utils/utils';
import { getRouterData as getDefaultRouters } from 'utils/router';
import * as hzeroFrontHagdRouters from 'hzero-front-hagd/lib/utils/router';
import * as hzeroFrontHcnfRouters from 'hzero-front-hcnf/lib/utils/router';
import * as hzeroFrontHdttRouters from 'hzero-front-hdtt/lib/utils/router';
import * as hzeroFrontHfileRouters from 'hzero-front-hfile/lib/utils/router';
import * as hzeroFrontHiamRouters from 'hzero-front-hiam/lib/utils/router';
import * as hzeroFrontHimpRouters from 'hzero-front-himp/lib/utils/router';
import * as hzeroFrontHitfRouters from 'hzero-front-hitf/lib/utils/router';
import * as hzeroFrontHmsgRouters from 'hzero-front-hmsg/lib/utils/router';
import * as hzeroFrontHpfmRouters from 'hzero-front-hpfm/lib/utils/router';
import * as hzeroFrontHptlRouters from 'hzero-front-hptl/lib/utils/router';
import * as hzeroFrontHrptRouters from 'hzero-front-hrpt/lib/utils/router';
import * as hzeroFrontHsdrRouters from 'hzero-front-hsdr/lib/utils/router';
import * as hzeroFrontHsgpRouters from 'hzero-front-hsgp/lib/utils/router';
import * as hzeroFrontHwflRouters from 'hzero-front-hwfl/lib/utils/router';
import * as srmFrontSmdmRouters from 'srm-front-smdm/lib/utils/router'; // 追加内容

export default app =>
  getModuleRouters(app, [
    getDefaultRouters,
    hzeroFrontHagdRouters,
    hzeroFrontHcnfRouters,
    hzeroFrontHdttRouters,
    hzeroFrontHfileRouters,
    hzeroFrontHiamRouters,
    hzeroFrontHimpRouters,
    hzeroFrontHitfRouters,
    hzeroFrontHmsgRouters,
    hzeroFrontHpfmRouters,
    hzeroFrontHptlRouters,
    hzeroFrontHrptRouters,
    hzeroFrontHsdrRouters,
    hzeroFrontHsgpRouters,
    hzeroFrontHwflRouters,
    srmFrontSmdmRouters, // 追加内容
  ]);

```
