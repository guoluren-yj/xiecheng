/** SRM接口管理-sitf */
module.exports = [
  {
    path: '/sitf/external-systems',
    models: [],
    FilterSupplier: true,
    components: [
      // 外部系统列表
      {
        path: '/sitf/external-systems/list',
        models: [() => import('../models/externalSystems.js')],
        component: () => import('../routes/ExternalSystems'),
        FilterSupplier: true,
      },
      // 外部系统关联租户
      {
        path: '/sitf/external-systems/es-relations',
        models: [() => import('../models/externalSystems.js')],
        component: () => import('../routes/ExternalSystems/ESRelations'),
        FilterSupplier: true,
      },
      // 外部系统关联服务
      {
        path: '/sitf/external-systems/es-service',
        models: [() => import('../models/externalSystems.js')],
        component: () => import('../routes/ExternalSystems/ESService'),
        FilterSupplier: true,
      },
      // 外部系统分配
      {
        path: '/sitf/external-system-assign',
        models: [() => import('../models/externalSystemAssign.js')],
        component: () => import('../routes/ExternalSystemAssign'),
        FilterSupplier: true,
      },
      // 绑定客户端
      {
        path: '/sitf/external-systems/bindclient/:externalSystemId',
        component: () => import('../routes/ExternalSystems/BindClient'),
        FilterSupplier: true,
      },
    ],
  },
  // 消息队列组定义
  {
    path: '/sitf/message-queue',
    models: [() => import('../models/messageQueue.js')],
    component: () => import('../routes/MessageQueueDef'),
  },
  // 接口定义页面 - 平台级
  {
    path: '/sitf/interface-def',
    models: [],
    components: [
      // 接口定义列表
      {
        path: '/sitf/interface-def/list',
        component: () => import('../routes/InterfaceDefNew'),
      },
      // 关键字段
      {
        path: '/sitf/interface-def/table',
        component: () => import('../routes/InterfaceDefNew/KeywordExtraction'),
      },
      // marmot脚本
      {
        path: '/sitf/interface-def/cate',
        component: () => import('../routes/InterfaceDefNew/MarmotScript'),
      },
    ],
  },
  // 接口定义页面 - 租户级
  {
    path: '/sitf/interface-def-org',
    FilterSupplier: true,
    components: [
      // 接口定义列表
      {
        path: '/sitf/interface-def-org/list',
        component: () => import('../routes/InterfaceDefNew'),
        FilterSupplier: true,
      },
      // 关键字段
      {
        path: '/sitf/interface-def-org/table',
        component: () => import('../routes/InterfaceDefNew/KeywordExtraction'),
        FilterSupplier: true,
      },
      // marmot脚本
      {
        path: '/sitf/interface-def-org/cate',
        component: () => import('../routes/InterfaceDefNew/MarmotScript'),
        FilterSupplier: true,
      },
      // 多告警接收组配置
      {
        path: '/sitf/interface-def-org/multiReceiver',
        component: () => import('../routes/InterfaceDefNew/MultiReceiver'),
        FilterSupplier: true,
      },
    ],
  },
  // 接口类别定义 - 租户级
  {
    path: '/sitf/interface-cate-def-org',
    models: [() => import('../models/interfaceCateDefOrg.js')],
    component: () => import('../routes/InterfaceCateDef/Tenant/TenantIndex'),
    FilterSupplier: true,
  },
  // 接口类别定义 - 平台级
  {
    path: '/sitf/interface-cate-def',
    models: [() => import('../models/interfaceCateDef.js')],
    component: () => import('../routes/InterfaceCateDef/Platform'),
  },
  // 产品定义
  {
    path: '/sitf/product-def',
    models: [() => import('../models/productDef.js')],
    component: () => import('../routes/ProductDef'),
  },
  // 应用组定义页面
  {
    path: '/sitf/application-group-def',
    models: [() => import('../models/applicationGroupDef.js')],
    component: () => import('../routes/ApplicationGroupDef'),
  },
  // 消息队列处理定义
  {
    path: '/sitf/message-queue-pro-def',
    models: [() => import('../models/messageQueueProDef.js')],
    component: () => import('../routes/MessageQueueProDef'),
  },
  // 前置机定义页面
  {
    path: '/sitf/front-computer-def',
    models: [() => import('../models/frontComputerDef.js')],
    component: () => import('../routes/FrontComputerDef'),
  },
  // 接口段结构表
  {
    path: '/sitf/interface-segment',
    models: [() => import('../models/interfaceSegment.js')],
    component: () => import('../routes/InterfaceSegment'),
    FilterSupplier: true,
  },
  // 前置机监控页面
  {
    path: '/sitf/processor-monitor',
    models: [() => import('../models/processorMonitor.js')],
    component: () => import('../routes/ProcessorMonitor'),
  },
  // 应用配置
  {
    path: '/sitf/application-configure',
    models: [() => import('../models/applicationConfigure.js')],
    component: () => import('../routes/ApplicationConfigure'),
  },
  // 消息队列定义
  {
    path: '/sitf/queues-setting',
    models: [],
    components: [
      // 消息队列定义列表
      {
        path: '/sitf/queues-setting/list',
        models: [() => import('../models/queuesSetting.js')],
        component: () => import('../routes/QueuesSetting'),
      },
      // 消息队列定义处理分配
      {
        path: '/sitf/queues-setting/queue-Handle-assigns',
        models: [() => import('../models/queueHandleAssigns.js')],
        component: () => import('../routes/QueuesSetting/QueueHandleAssigns'),
      },
      // 消息队列定义系统分配
      {
        path: '/sitf/queues-setting/queue-system-assign',
        models: [() => import('../models/queueSystemAssign.js')],
        component: () => import('../routes/QueuesSetting/QueueSystemAssign'),
      },
    ],
  },
  // 消息队列消费组定义
  {
    path: '/sitf/message-consum-def',
    models: [],
    components: [
      // 消息队列消费组定义列表
      {
        path: '/sitf/message-consum-def/list',
        models: [() => import('../models/messageQueueConsumDef.js')],
        component: () => import('../routes/MessageQueueConsumDef'),
      },
      // 消息队列定义处理分配
      {
        path: '/sitf/message-consum-def/handler-assigns',
        models: [() => import('../models/messageHandlerAssigns.js')],
        component: () => import('../routes/MessageQueueConsumDef/HandlerAssigns'),
      },
      // 消息队列定义系统分配
      {
        path: '/sitf/message-consum-def/queue-assigns',
        models: [() => import('../models/messageQueueAssigns.js')],
        component: () => import('../routes/MessageQueueConsumDef/QueueAssigns'),
      },
    ],
  },
  // 消息队列数据查询
  {
    path: '/sitf/message-queue-search',
    models: [() => import('../models/messageQueueSearch.js')],
    component: () => import('../routes/MessageQueueSearch'),
  },
  // IDoc接口映射配置
  {
    path: '/sitf/interface-mapping-config',
    models: [() => import('../models/interfaceMappingConfig.js')],
    component: () => import('../routes/InterfaceMappingConfig'),
  },
  // 接口查询 - 平台级
  {
    path: '/sitf/interface-search',
    models: [],
    components: [
      // 接口查询列表
      {
        path: '/sitf/interface-search/list',
        models: [
          () => import('../models/interfaceSearch.js'),
          () => import('../models/batchStatistic.js'),
        ],
        component: () => import('../routes/InterfaceSearch'),
      },
      // 接口查询接口表详情
      {
        path: '/sitf/interface-search/interface-list-detail',
        models: [() => import('../models/interfaceListDetail.js')],
        component: () => import('../routes/InterfaceSearch/InterfaceListDetail'),
      },
    ],
  },
  // 接口查询 - 租户级
  {
    path: '/sitf/interface-search-org',
    models: [],
    FilterSupplier: true,
    components: [
      // 接口查询列表
      {
        path: '/sitf/interface-search-org/list',
        models: [
          () => import('../models/interfaceSearchOrg.js'),
          () => import('../models/batchStatisticOrg.js'),
        ],
        component: () => import('../routes/InterfaceSearchOrg'),
        FilterSupplier: true,
      },
      // 接口查询接口表详情
      {
        path: '/sitf/interface-search-org/interface-list-detail',
        models: [() => import('../models/interfaceListDetailOrg.js')],
        component: () => import('../routes/InterfaceSearchOrg/InterfaceListDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 接口页面配置 - 平台级
  {
    path: '/sitf/interface-page-config',
    models: [() => import('../models/interfacePageConfig.js')],
    component: () => import('../routes/InterfacePageConfig'),
  },
  // 接口页面配置 - 租户级
  {
    path: '/sitf/interface-page-config-org',
    models: [() => import('../models/interfacePageConfigOrg.js')],
    component: () => import('../routes/InterfacePageConfigOrg'),
    FilterSupplier: true,
  },
  // 源数据查询 - 平台级
  {
    path: '/sitf/sourcedata-search',
    models: [],
    components: [
      // 接口查询列表
      {
        path: '/sitf/sourcedata-search/list',
        models: [() => import('../models/sourceDataSearch.js')],
        component: () => import('../routes/SourceDataSearch'),
      },
      // 接口查询接口表详情
      {
        path: '/sitf/sourcedata-search/detail',
        models: [() => import('../models/interfaceListDetailOrg.js')],
        component: () => import('../routes/SourceDataSearch/SourceDataDetail'),
      },
    ],
  },
  // 源数据查询 - 租户级
  {
    path: '/sitf/sourcedata-search-org',
    models: [],
    FilterSupplier: true,
    components: [
      // 接口查询列表
      {
        path: '/sitf/sourcedata-search-org/list',
        // models: [() => import('../models/sourceDataSearchOrg.js')],
        // component: () => import('../routes/SourceDataSearchOrg'),
        component: () => import('../routes/SourceDataSearchOrgNew'),
        FilterSupplier: true,
      },
      // 接口查询接口表详情
      {
        path: '/sitf/sourcedata-search-org/detail',
        models: [
          () => import('../models/interfaceListDetailOrg.js'),
          () => import('../models/sourceDataSearchOrg.js'),
        ],
        component: () => import('../routes/SourceDataSearchOrg/SourceDataDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 接口监控
  {
    path: '/sitf/interface-monitor',
    models: [],
    components: [
      // 接口监控列表
      {
        path: '/sitf/interface-monitor/list',
        models: [() => import('../models/interfaceMonitor.js')],
        component: () => import('../routes/InterfaceMonitor'),
      },
      // 监控接口配置
      {
        path: '/sitf/interface-monitor/monitor-interface-setting',
        models: [() => import('../models/monitorInterfaceSetting.js')],
        component: () => import('../routes/InterfaceMonitor/MonitorInterfaceSetting'),
      },
      // 监控联系人配置
      {
        path: '/sitf/interface-monitor/notice-receiver',
        models: [() => import('../models/noticeReceiver.js')],
        component: () => import('../routes/InterfaceMonitor/NoticeReceiver'),
      },
    ],
  },
  // 接口批次统计 - 平台级
  {
    path: '/sitf/batch-statistic',
    models: [() => import('../models/batchStatistic.js')],
    component: () => import('../routes/BatchStatistic/Site'),
  },
  // 接口批次统计 - 租户级
  {
    path: '/sitf/batch-statistic-org',
    models: [() => import('../models/batchStatisticOrg.js')],
    component: () => import('../routes/BatchStatistic/Org'),
    FilterSupplier: true,
  },
  // 接口清理
  {
    path: '/sitf/interface-clean',
    models: [() => import('../models/interfaceClean.js')],
    component: () => import('../routes/InterfaceClean'),
  },
  // 接口请求报文配置 - 平台级
  {
    path: '/sitf/interface-packet-monitor',
    models: [() => import('../models/packetMonitor.js')],
    component: () => import('../routes/PacketMonitor/Tenant'),
  },
  // 接口请求报文配置 - 租户级
  {
    path: '/sitf/interface-packet-monitor-org',
    models: [
      () => import('../models/batchStatisticOrg.js'),
      () => import('../models/packetMonitorOrg.js'),
    ],
    component: () => import('../routes/PacketMonitor/Platform'),
    FilterSupplier: true,
  },
  // 接口监控工作台
  {
    path: '/sitf/interface-monitoring-workbench',
    components: [
      {
        path: '/sitf/interface-monitoring-workbench/list',
        component: () => import('../routes/InterfaceMointoringWork'),
      },
    ],
  },
  // 重定向界面功能
  {
    path: '/sitf/file/to-external',
    component: () => import('../routes/ToExternal'),
  },

  // 异常调用监控记录看板
  {
    path: '/sitf/abnormal-call-monitoring-record',
    component: () => import('../routes/AbnormalCallMonitoring'),
  },
  // 接口流量控制
  {
    path: '/sitf/interface-flow-control',
    component: () => import('../routes/InterfaceFlowControl'),
  },
  // 接口方法库
  {
    path: '/sitf/interface-method-library',
    component: () => import('../routes/InterfaceMethodLibrary'),
  },
  // 接口对象定义
  {
    path: '/sitf/interface-object-definition',
    components: [
      {
        path: '/sitf/interface-object-definition/list',
        component: () => import('../routes/InterfaceObjectDefinition'),
      },
      {
        path: '/sitf/interface-object-definition/details/:id',
        component: () => import('../routes/InterfaceObjectDefinition/Details'),
      },
    ],
  },
  // 外部接口定义
  {
    path: '/sitf/external-interface-definition',
    components: [
      {
        path: '/sitf/external-interface-definition/list',
        component: () => import('../routes/ExternalInterfaceDefinition'),
      },
      {
        path: '/sitf/external-interface-definition/details/:id',
        component: () => import('../routes/ExternalInterfaceDefinition/Details'),
      },
      {
        path: '/sitf/external-interface-definition/details-desigin/:extItfId',
        component: () => import('../routes/ExternalInterfaceDefinition/DetailsDesign'),
      },
    ],
  },
];
