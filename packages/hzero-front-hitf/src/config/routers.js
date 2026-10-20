module.exports = [
  {
    path: '/hitf/application',
    FilterSupplier: true,
    component: () => import('../routes/Application'),
    models: [() => import('../models/application')],
  },
  // 接口监控
  {
    path: '/hitf/interface-logs',
    components: [
      {
        path: '/hitf/interface-logs/list',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceLogs'),
      },
      {
        path: '/hitf/interface-logs/detail/:interfaceLogId',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceLogs/Detail'),
      },
    ],
  },
  {
    path: '/private/hitf/interface-logs',
    key: '/private/hitf/interface-logs',
    authorized: true,
    components: [
      {
        path: '/private/hitf/interface-logs/list',
        key: '/private/hitf/interface-logs/list',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/InterfaceLogs'),
      },
      {
        path: '/private/hitf/interface-logs/detail/:interfaceLogId',
        key: '/private/hitf/interface-logs/detail/:interfaceLogId',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/InterfaceLogs/Detail'),
      },
    ],
  },
  // 健康状况监控
  {
    path: '/hitf/interface-statistics',
    FilterSupplier: true,
    component: () => import('../routes/InterfaceStatistics'),
  },
  {
    path: '/private/hitf/interface-statistics',
    key: '/private/hitf/interface-statistics',
    authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/InterfaceStatistics'),
  },
  {
    path: '/hitf/import-history',
    FilterSupplier: true,
    component: () => import('../routes/ImportHistory'),
  },
  {
    path: '/private/hitf/import-history',
    key: '/private/hitf/import-history',
    authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/ImportHistory'),
  },
  {
    path: '/hitf/services',
    models: [() => import('../models/services')],
    components: [
      {
        path: '/hitf/services/list',
        FilterSupplier: true,
        component: () => import('../routes/Services'),
        models: [() => import('../models/services')],
      },
      {
        path: '/hitf/services/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/Services/Detail'),
        models: [() => import('../models/services')],
      },
      {
        path: '/hitf/services/create',
        FilterSupplier: true,
        component: () => import('../routes/Services/Detail'),
        models: [() => import('../models/services')],
      },
    ],
  },
  {
    path: '/hitf/client-auth',
    FilterSupplier: true,
    component: () => import('../routes/ClientAuth'),
  },
  {
    path: '/private/hitf/client-auth',
    key: '/private/hitf/client-auth',
    authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/ClientAuth'),
  },
  {
    path: '/hitf/interfaces',
    models: [() => import('../models/interfaces')],
    components: [
      {
        path: '/hitf/interfaces/list',
        FilterSupplier: true,
        component: () => import('../routes/Interfaces'),
        models: [() => import('../models/interfaces')],
      },
      {
        path: '/hitf/interfaces/auth-config/:interfaceId',
        FilterSupplier: true,
        component: () => import('../routes/Interfaces/AuthConfig'),
        models: [() => import('../models/interfaces')],
      },
    ],
  },
  {
    path: '/private/hitf/interfaces',
    key: '/private/hitf/interfaces',
    authorized: true,
    components: [
      {
        path: '/private/hitf/interfaces/list',
        key: '/private/hitf/interfaces/list',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/Interfaces'),
        models: [() => import('../models/interfaces')],
      },
      {
        path: '/private/hitf/interfaces/auth-config/:interfaceId',
        key: '/private/hitf/interfaces/auth-config/:interfaceId',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/Interfaces/AuthConfig'),
        models: [() => import('../models/interfaces')],
      },
    ],
    models: [() => import('../models/interfaces')],
  },
  {
    path: '/hitf/client-role',
    FilterSupplier: true,
    component: () => import('../routes/ClientRole'),
  },
  {
    path: '/private/hitf/client-role',
    key: '/private/hitf/client-role',
    authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/ClientRole'),
  },
  {
    path: '/pub/hitf/document-view',
    FilterSupplier: true,
    component: () => import('../routes/Services/DocumentView'),
    authorized: true, // authorized 不需要菜单权限就可以打开的页面
    key: '/pub/hitf/document-view',
    models: [() => import('../models/services')],
  },
  {
    path: '/hitf/application-type-definition',
    components: [
      {
        path: '/hitf/application-type-definition/list',
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/List'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: '/hitf/application-type-definition/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: '/hitf/application-type-definition/create',
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
    ],
  },
  {
    path: '/hitf/application-type-definition',
    components: [
      {
        path: '/hitf/application-type-definition/list',
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/List'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: '/hitf/application-type-definition/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: '/hitf/application-type-definition/create',
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
    ],
  },
  {
    path: '/private/hitf/application-type-definition',
    key: '/private/hitf/application-type-definition',
    authorized: true,
    components: [
      {
        path: '/private/hitf/application-type-definition/list',
        key: '/private/hitf/application-type-definition/list',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/List'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: '/private/hitf/application-type-definition/create',
        key: '/private/hitf/application-type-definition/create',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: '/private/hitf/application-type-definition/detail/:id',
        key: '/private/hitf/application-type-definition/detail/:id',
        authorized: true,
        FilterSupplier: true,
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
    ],
  },
  {
    path: '/hitf/charge-set',
    key: '/hitf/charge-set',
    components: [
      {
        path: '/hitf/charge-set/list',
        key: '/hitf/charge-set/list',
        FilterSupplier: true,
        component: () => import('../routes/ChargeSet/List'),
        models: [],
      },
      {
        path: '/hitf/charge-set/create',
        key: '/hitf/charge-set/create',
        FilterSupplier: true,
        component: () => import('../routes/ChargeSet/Detail'),
        models: [],
      },
      {
        path: '/hitf/charge-set/line/:setHeaderId',
        key: '/hitf/charge-set/line/:setHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeSet/Detail'),
        models: [],
      },
      {
        path: '/hitf/charge-set/purchase-list/:typeCode/:id',
        key: '/hitf/charge-set/purchase-list/:typeCode/:id',
        FilterSupplier: true,
        component: () => import('../routes/ChargeSet/PurchaseList'),
        models: [],
      },
    ],
  },
  {
    path: '/hitf/charge-group',
    key: '/hitf/charge-group',
    components: [
      {
        path: '/hitf/charge-group/list',
        key: '/hitf/charge-group/list',
        FilterSupplier: true,
        component: () => import('../routes/ChargeGroup/List'),
        models: [],
      },
      {
        path: '/hitf/charge-group/create',
        key: '/hitf/charge-group/create',
        FilterSupplier: true,
        component: () => import('../routes/ChargeGroup/Detail'),
        models: [],
      },
      {
        path: '/hitf/charge-group/line/:groupHeaderId',
        key: '/hitf/charge-group/line/:groupHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeGroup/Detail'),
        models: [],
      },
      {
        path: '/hitf/charge-group/rule/:groupHeaderId',
        key: '/hitf/charge-group/rule/:groupHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeGroup/Rule'),
        models: [],
      },
      {
        path: '/hitf/charge-group/server/:groupHeaderId',
        key: '/hitf/charge-group/server/:groupHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeGroup/Server'),
        models: [],
      },
      // {
      //   path: '/hitf/charge-group/purchase/:groupHeaderId',
      //   key: '/hitf/charge-group/purchase/:groupHeaderId',
      //   FilterSupplier: true,
      //   component: () => import('../routes/ChargeGroup/Purchase'),
      //   models: [],
      // },
      {
        path: '/hitf/charge-group/purchase-list/:typeCode/:id',
        key: '/hitf/charge-group/purchase-list/:typeCode/:id',
        FilterSupplier: true,
        component: () => import('../routes/ChargeSet/PurchaseList'),
        models: [],
      },
    ],
  },
  {
    path: '/hitf/user-purchase',
    key: '/hitf/user-purchase',
    components: [
      {
        path: '/hitf/user-purchase/list',
        key: '/hitf/user-purchase/list',
        FilterSupplier: true,
        component: () => import('../routes/Purchase/UserPurchase'),
        models: [],
      },
      {
        path: '/hitf/user-purchase/rule/:ruleHeaderId',
        key: '/hitf/user-purchase/rule/:ruleHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeRule/Detail'),
        models: [],
      },
    ],
  },
  {
    path: '/hitf/available-purchase',
    key: '/hitf/available-purchase',
    components: [
      {
        path: '/hitf/available-purchase/list',
        key: '/hitf/available-purchase/list',
        FilterSupplier: true,
        component: () => import('../routes/Purchase/AvailablePurchase'),
        models: [],
      },
      {
        path: '/hitf/available-purchase/server/:groupHeaderId',
        key: '/hitf/available-purchase/server/:groupHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeGroup/Server'),
        models: [],
      },
      {
        path: '/hitf/available-purchase/rule/:ruleHeaderId',
        key: '/hitf/available-purchase/rule/:ruleHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/ChargeRule/Detail'),
        models: [],
      },
    ],
  },
  // 结构字段
  {
    path: '/hitf/structure-field',
    components: [
      {
        path: '/hitf/structure-field/list',
        FilterSupplier: true,
        component: () => import('../routes/StructureField/List'),
        models: [],
      },
      {
        path: '/hitf/structure-field/line/:type/:headerId',
        FilterSupplier: true,
        component: () => import('../routes/StructureField/Detail'),
        models: [],
      },
    ],
  },

  // 消息中间件配置
  {
    path: '/hitf/dynamic-mq-config',
    components: [
      {
        path: '/hitf/dynamic-mq-config/list',
        FilterSupplier: true,
        component: () => import('../routes/DynamicMqConfig/List'),
        models: [],
      },
      {
        path: '/hitf/dynamic-mq-config/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/DynamicMqConfig/Detail'),
        models: [],
      },
    ],
  },
  // 日志记录
  {
    path: '/hitf/trace-logs',
    components: [
      {
        path: '/hitf/trace-logs/list',
        FilterSupplier: true,
        component: () => import('../routes/TraceLogs/List'),
        models: [],
      },
      {
        path: '/hitf/trace-logs/detail/:traceLogId',
        FilterSupplier: true,
        component: () => import('../routes/TraceLogs/Detail'),
        models: [],
      },
      {
        path: '/hitf/trace-logs/outer-detail/:invokeKey',
        FilterSupplier: true,
        component: () => import('../routes/TraceLogs/Detail'),
        models: [],
      },
    ],
  },
  // 服务领域配置
  {
    path: '/hitf/server-domain',
    components: [
      {
        path: '/hitf/server-domain/list',
        FilterSupplier: true,
        component: () => import('../routes/ServerDomain'),
        models: [],
      },
    ],
  },
  // 字段映射
  {
    path: '/hitf/field-mapping',
    components: [
      {
        path: '/hitf/field-mapping/list',
        FilterSupplier: true,
        component: () => import('../routes/FieldMapping/List'),
        models: [],
      },
      {
        path: '/hitf/field-mapping/create',
        FilterSupplier: true,
        component: () => import('../routes/FieldMapping/Detail'),
        models: [],
      },
      {
        path: '/hitf/field-mapping/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/FieldMapping/Detail'),
        models: [],
      },
      {
        path: '/hitf/field-mapping/history/:id/:version',
        FilterSupplier: true,
        component: () => import('../routes/FieldMapping/Detail'),
        models: [],
      },
    ],
  },
  // 数据转化
  {
    path: '/hitf/data-mapping',
    components: [
      {
        path: '/hitf/data-mapping/list',
        FilterSupplier: true,
        component: () => import('../routes/DataMapping/List'),
        models: [() => import('../models/dataMapping')],
      },
      {
        path: '/hitf/data-mapping/create',
        FilterSupplier: true,
        component: () => import('../routes/DataMapping/Detail'),
        models: [() => import('../models/dataMapping')],
      },
      {
        path: '/hitf/data-mapping/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/DataMapping/Detail'),
        models: [() => import('../models/dataMapping')],
      },
      {
        path: '/hitf/data-mapping/history/:id/:version',
        FilterSupplier: true,
        component: () => import('../routes/DataMapping/Detail'),
        models: [() => import('../models/dataMapping')],
      },
    ],
  },
  // 映射调试
  {
    path: '/hitf/mapping-config-debug',
    components: [
      {
        path: '/hitf/mapping-config-debug',
        FilterSupplier: true,
        component: () => import('../routes/MappingDebug'),
        models: [],
      },
    ],
  },
  // 接口MOCK
  {
    path: '/hitf/interface-mock',
    components: [
      {
        path: '/hitf/interface-mock/list',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMock/List'),
        models: [],
      },
      {
        path: '/hitf/interface-mock/create',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMock/Detail'),
        models: [],
      },
      {
        path: '/hitf/interface-mock/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMock/Detail'),
        models: [],
      },
    ],
  },
  // 接口限流规则配置
  {
    path: '/hitf/rate-limit',
    FilterSupplier: true,
    component: () => import('../routes/RateLimit'),
  },
  // 接口转发配置
  {
    path: '/hitf/interface-forward',
    components: [
      {
        path: '/hitf/interface-forward/list',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceForward/List'),
        models: [],
      },
      {
        path: '/hitf/interface-forward/create',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceForward/Detail'),
        models: [],
      },
      {
        path: '/hitf/interface-forward/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceForward/Detail'),
        models: [],
      },
    ],
  },
  // 脱敏规则
  {
    path: '/hitf/desensitize-rule',
    FilterSupplier: true,
    component: () => import('../routes/DesensitizeRule'),
    models: [],
  },
  // 接口申请配置
  {
    path: '/hitf/basic-config',
    FilterSupplier: true,
    component: () => import('../routes/BasicConfig'),
    models: [],
  },
  // 我的接口申请
  {
    path: '/hitf/my-application',
    FilterSupplier: true,
    component: () => import('../routes/MyApplication'),
    models: [],
  },
  // 接口权限审批
  {
    path: '/hitf/interface-permission-approval',
    FilterSupplier: true,
    component: () => import('../routes/Approval'),
    models: [],
  },
  // 应用管理-平台级
  {
    path: '/hitf/application-manage',
    FilterSupplier: true,
    models: [],
    components: [
      // 应用管理-列表页
      {
        path: '/hitf/application-manage/list',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage'),
      },
      // 应用管理-新建详情页
      {
        path: '/hitf/application-manage/create-detail',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage/Detail'),
      },
      // 应用管理-编辑详情页
      {
        path: '/hitf/application-manage/detail/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage/Detail'),
      },
      // 应用管理-详情页-接口编辑
      {
        path: '/hitf/application-manage/api/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage/InterfaceDetail'),
      },
    ],
  },
  // 接口组件库
  {
    path: '/hitf/interface-component-library',
    FilterSupplier: true,
    models: [],
    components: [
      // 应用管理-列表页
      {
        path: '/hitf/interface-component-library/list',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceComponentLibrary'),
      },
    ],
  },
  // 接口定义-平台级
  {
    path: '/hitf/interface-definition',
    FilterSupplier: true,
    models: [],
    components: [
      // 接口定义-列表页
      {
        path: '/hitf/interface-definition/list',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceDefinition'),
      },
      // 接口定义-新建详情页
      {
        path: '/hitf/interface-definition/create-detail',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceDefinition/Detail'),
      },
      // 接口定义-编辑详情页
      {
        path: '/hitf/interface-definition/detail/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceDefinition/Detail'),
      },
    ],
  },
  // 接口配置工作台-租户级
  {
    path: '/hitf/interface-configuration-workbench',
    FilterSupplier: true,
    models: [],
    components: [
      // 接口配置工作台-列表页
      {
        path: '/hitf/interface-configuration-workbench/list',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceWorkplace'),
      },
      // 接口配置工作台-接口告警-新建详情页
      {
        path: '/hitf/interface-configuration-workbench/create-detail',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceWorkplace/Alarm/Detail'),
      },
      // 接口告警-编辑详情页
      {
        path: '/hitf/interface-configuration-workbench/detail/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceWorkplace/Alarm/Detail'),
      },
      // 接口加密-新建详情页
      {
        path: '/hitf/interface-configuration-workbench/encryption/create',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceWorkplace/Encryption/Detail'),
      },
      // 接口加密-编辑详情页
      {
        path: '/hitf/interface-configuration-workbench/encryption/detail/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceWorkplace/Encryption/Detail'),
      },
      // 接口定义-租户级
      // 接口定义-新建详情页
      {
        path: '/hitf/interface-configuration-workbench/interface-definition/create-detail',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceDefinition/Detail'),
      },
      // 接口定义-编辑详情页
      {
        path: '/hitf/interface-configuration-workbench/interface-definition/detail/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceDefinition/Detail'),
      },
      // 应用管理租户级
      // 应用管理-新建详情页
      {
        path: '/hitf/interface-configuration-workbench/application-manage/create-detail',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage/Detail'),
      },
      // 应用管理-编辑详情页
      {
        path: '/hitf/interface-configuration-workbench/application-manage/detail/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage/Detail'),
      },
      // 应用管理-详情页-接口编辑
      {
        path: '/hitf/interface-configuration-workbench/application-manage/api/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/ApplicationManage/InterfaceDetail'),
      },
    ],
  },
  // 接口配置工作台-平台级
  {
    path: '/hitf/interface-configuration-workbench-platform',
    FilterSupplier: true,
    models: [],
    components: [
      // 接口配置工作台-列表页
      {
        path: '/hitf/interface-configuration-workbench-platform/list',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/InterfaceWorkplace'),
      },
    ],
  },
  // 接口监控工作台-租户级
  {
    path: '/hitf/interface-monitor-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/hitf/interface-monitor-workbench/list',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMonitor'),
        models: [],
      },
      {
        path: '/hitf/interface-monitor-workbench/parameter-detail/:type/:id',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMonitor/ParameterDetail'),
        models: [],
      },
    ],
  },
  // 接口监控工作台-平台级
  {
    path: '/hitf/interface-monitor-workbench-platform',
    FilterSupplier: true,
    components: [
      {
        path: '/hitf/interface-monitor-workbench-platform/list',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMonitor'),
        models: [],
      },
      {
        path: '/hitf/interface-monitor-workbench-platform/parameter-detail/:type/:id/:tenantId',
        FilterSupplier: true,
        component: () => import('../routes/InterfaceMonitor/ParameterDetail'),
        models: [],
      },
    ],
  },
];
