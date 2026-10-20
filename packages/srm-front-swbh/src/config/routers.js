module.exports = [
  {
    path: '/swbh/role-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/swbh/role-workbench/list',
        models: [
          () => import('../models/swbh/roleWorkbench.js'),
          () => import('../models/srmCards'),
          () => import('srm-front-spfm/lib/models/srmCards'),
        ],
        component: () => import('../routes/RoleWorkbench'),
      },
      // 风险定义
      {
        path: '/swbh/role-workbench/risk-definition',
        component: () => import('srm-front-sdat/lib/routers/RiskDefiniton'),
      },
      {
        path: '/swbh/role-workbench/risk-definition/detail/:id/:pageType/:editType/:groupCode/:viewFlag',
        component: () => import('srm-front-sdat/lib/routers/RiskDefiniton/Detail'),
      },
      // 黑名单管理
      {
        path: '/swbh/role-workbench/supplier-blacklist-manage',
        component: () => import('srm-front-sdat/lib/routers/RiskSupplierBlack'),
      },

      // 监控企业
      {
        path: '/swbh/role-workbench/monitor-business',
        models: [],
        component: () => import('srm-front-sdat/lib/routers/RiskControlMonitorBusiness'),
      },
    ],
  },
  // es对象管理
  {
    path: '/swbh/role-object-management',
    // FilterSupplier: true,
    components: [
      {
        path: '/swbh/role-object-management/list',
        component: () => import('../routes/RoleObjectManagement'),
        // FilterSupplier: true,
      },
      {
        path: '/swbh/role-object-management/detail/:id',
        component: () => import('../routes/RoleObjectManagement/Detail'),
        // FilterSupplier: true,
      },
      {
        path: '/swbh/role-object-management/template/field',
        component: () => import('@/routes/RoleObjectManagement/Detail/TemplateManagement/TemplateFields'),
        // FilterSupplier: true,
      },
    ],
  },

  // 单据动态配置
  {
    path: '/swbh/role-document-config',
    // FilterSupplier: true,
    components: [
      {
        path: '/swbh/role-document-config/list',
        component: () => import('../routes/RoleDocumentConfig'),
        // FilterSupplier: true,
      },
    ],
  },
  // 单据卡片字段映射
  {
    path: '/swbh/role-card-field-map',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/swbh/role-card-field-map/list',
        component: () => import('../routes/RoleCardFieldMap'),
      },
      {
        path: '/swbh/role-card-field-map/detail/:id',
        component: () => import('../routes/RoleCardFieldMap/Detail'),
      },
    ],
  },
  // 平台单据卡片字段映射
  {
    path: '/swbh/platform/role-card-field-map',
    models: [],
    components: [
      {
        path: '/swbh/platform/role-card-field-map/list',
        component: () => import('../routes/RoleCardFieldMap'),
      },
      {
        path: '/swbh/platform/role-card-field-map/detail/:id',
        component: () => import('../routes/RoleCardFieldMap/Detail'),
      },
    ],
  },
];
