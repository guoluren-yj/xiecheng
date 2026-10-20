module.exports = [
  {
    path: '/hadm/service',
    FilterSupplier: true,
    component: () => import('../routes/ServiceManage'),
    models: [() => import('../models/hadmServiceManage')],
  },
  {
    path: '/private/hadm/service',
    key: '/private/hadm/service',
    authorized: true,
    component: () => import('../routes/ServiceManage'),
    models: [() => import('../models/hadmServiceManage')],
    FilterSupplier: true,
  },
  {
    path: '/hadm/trace-log',
    key: '/hadm/trace-log',
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        key: '/hadm/trace-log',
        path: '/hadm/trace-log/list',
        component: () => import('../routes/TraceLog'),
        title: 'hadm.traceLog.view.title',
        authorized: true,
        FilterSupplier: true,
      },
      {
        key: '/hadm/trace-log',
        path: '/hadm/trace-log/detail/:id',
        component: () => import('../routes/TraceLog/Detail'),
        title: 'hadm.traceLog.view.title',
        authorized: true,
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hadm/rule-config',
    // key: '/hadm/rule-engine',
    // authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/rule-config/list',
        // key: '/hadm/rule-engine',
        // authorized: true,
        component: () => import('../routes/RuleConfig'),
        FilterSupplier: true,
      },
      {
        path: '/hadm/rule-config/detail/:id',
        // key: '/hadm/rule-engine',
        // authorized: true,
        component: () => import('../routes/RuleConfig/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hadm/hystrix',
    models: [() => import('../models/hadmHystrix')],
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/hystrix/list',
        component: () => import('../routes/Hystrix'),
        models: [() => import('../models/hadmHystrix')],
        FilterSupplier: true,
      },
      {
        path: '/hadm/hystrix/detail/:confId',
        component: () => import('../routes/Hystrix/Detail'),
        models: [() => import('../models/hadmHystrix')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/private/hadm/hystrix',
    key: '/private/hadm/hystrix',
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/private/hadm/hystrix/list',
        key: '/private/hadm/hystrix/list',
        authorized: true,
        component: () => import('../routes/Hystrix'),
        models: [() => import('../models/hadmHystrix')],
        FilterSupplier: true,
      },
      {
        path: '/private/hadm/hystrix/detail/:confId',
        key: '/private/hadm/hystrix/detail/:confId',
        authorized: true,
        component: () => import('../routes/Hystrix/Detail'),
        models: [() => import('../models/hadmHystrix')],
        FilterSupplier: true,
      },
    ],
    models: [() => import('../models/hadmHystrix')],
  },
  {
    path: '/hadm/rate-limit',
    models: [() => import('../models/hadmZuulRateLimit')],
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/rate-limit/list',
        component: () => import('../routes/ZuulRateLimit'),
        models: [() => import('../models/hadmZuulRateLimit')],
        FilterSupplier: true,
      },
      {
        path: '/hadm/rate-limit/detail/:rateLimitId',
        component: () => import('../routes/ZuulRateLimit/RateLimitDetail'),
        models: [() => import('../models/hadmZuulRateLimit')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/private/hadm/rate-limit',
    key: '/private/hadm/rate-limit',
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/private/hadm/rate-limit/list',
        key: '/private/hadm/rate-limit/list',
        authorized: true,
        component: () => import('../routes/ZuulRateLimit'),
        models: [() => import('../models/hadmZuulRateLimit')],
        FilterSupplier: true,
      },
      {
        path: '/private/hadm/rate-limit/detail/:rateLimitId',
        key: '/private/hadm/rate-limit/detail/:rateLimitId',
        authorized: true,
        component: () => import('../routes/ZuulRateLimit/RateLimitDetail'),
        models: [() => import('../models/hadmZuulRateLimit')],
        FilterSupplier: true,
      },
    ],
    models: [() => import('../models/hadmZuulRateLimit')],
  },
  {
    path: '/hadm/route',
    component: () => import('../routes/ServiceRoute'),
    models: [() => import('../models/hadmServiceRoute')],
    FilterSupplier: true,
  },
  {
    path: '/hadm/config',
    component: () => import('../routes/ServiceConfig'),
    models: [() => import('../models/hadmServiceConfig')],
    FilterSupplier: true,
  },
  {
    path: '/private/hadm/config',
    key: '/private/hadm/config',
    authorized: true,
    component: () => import('../routes/ServiceConfig'),
    models: [() => import('../models/hadmServiceConfig')],
    FilterSupplier: true,
  },
  {
    path: '/hadm/api-limit',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/api-limit/list',
        component: () => import('../routes/APILimit'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/hadm/api-limit/detail/:monitorRuleId',
        component: () => import('../routes/APILimit/ViewMonitor'),
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hadm/api-test',
    models: [],
    component: () => import('../routes/APITest'),
    FilterSupplier: true,
  },
  {
    path: '/private/hadm/api-limit',
    key: '/private/hadm/api-limit',
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/private/hadm/api-limit/list',
        key: '/private/hadm/api-limit/list',
        authorized: true,
        component: () => import('../routes/APILimit'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/private/hadm/api-limit/detail/:monitorRuleId',
        key: '/private/hadm/api-limit/detail/:monitorRuleId',
        authorized: true,
        component: () => import('../routes/APILimit/ViewMonitor'),
        models: [],
        FilterSupplier: true,
      },
    ],
    models: [],
  },
  {
    path: '/hadm/node-rule',
    models: [() => import('../models/nodeRule')],
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/node-rule/list',
        component: () => import('../routes/NodeRule'),
        models: [() => import('../models/nodeRule')],
        FilterSupplier: true,
      },
      {
        path: '/hadm/node-rule/config/:nodeRuleId',
        component: () => import('../routes/NodeRule/Editor'),
        models: [() => import('../models/nodeRule')],
        FilterSupplier: true,
      },
    ],
  },
  // Seata监控
  {
    path: '/hadm/seata',
    component: () => import('../routes/SeataMonitor'),
    FilterSupplier: true,
  },
  // URL映射配置
  {
    path: '/hadm/url-mapping-config',
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        key: '/hadm/url-mapping-config',
        path: '/hadm/url-mapping-config/list',
        component: () => import('../routes/URLMappingConfig'),
        FilterSupplier: true,
      },
      {
        key: '/hadm/url-mapping-config',
        path: '/hadm/url-mapping-config/detail/:id',
        component: () => import('../routes/URLMappingConfig/Detail'),
        FilterSupplier: true,
        // authorized: true,
      },
    ],
  },
  {
    path: '/hadm/ds-mapping',
    component: () => import('../routes/DsMapping'),
    FilterSupplier: true,
  },
  {
    path: '/hadm/logical-data-source-group',
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/logical-data-source-group/list',
        component: () => import('../routes/LogicalDataSourceGroup'),
        FilterSupplier: true,
      },
      {
        path: '/hadm/logical-data-source-group/detail/:id',
        component: () => import('../routes/LogicalDataSourceGroup/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hadm/api-overview',
    component: () => import('../routes/ApiOverview'),
    FilterSupplier: true,
  },
  {
    path: '/hadm/instance',
    component: () => import('../routes/Instance'),
    FilterSupplier: true,
  },
  {
    path: '/hadm/maintain',
    FilterSupplier: true,
    components: [
      {
        path: '/hadm/maintain/list',
        component: () => import('../routes/Maintain'),
        FilterSupplier: true,
      },
      {
        path: '/hadm/maintain/detail/:maintainId',
        component: () => import('../routes/Maintain/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 应用市场配置页面
  {
    path: '/hadm/client-config',
    component: () => import('../routes/MarketClient/ClientConfig'),
    models: [],
    FilterSupplier: true,
  },
];
