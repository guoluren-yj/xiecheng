module.exports = [
  {
    path: '/sdps/parameter-manages',
    component: () => import('../routes/ParameterManages'),
  },
  {
    path: '/sdps/subscribe-manages',
    component: () => import('../routes/SubscribeManages'),
    FilterSupplier: true,
  },
  {
    path: '/sdps/rule-manages',
    components: [
      {
        path: '/sdps/rule-manages/list',
        component: () => import('../routes/RuleManages'),
      },
      {
        path: '/sdps/rule-manages/detail',
        component: () => import('../routes/RuleManages/Detail'),
      },
      {
        path: '/sdps/rule-manages/detail-only-read', // 不允许编辑的详情页
        component: () => import('../routes/RuleManages/DetailOnlyRead'),
      },
    ],
  },
  {
    path: '/sdps/rule-manages-org',
    FilterSupplier: true,
    components: [
      {
        path: '/sdps/rule-manages-org/list',
        component: () => import('../routes/RuleManagesOrg'),
        FilterSupplier: true,
      },
      {
        path: '/sdps/rule-manages-org/detail',
        component: () => import('../routes/RuleManagesOrg/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sdps/rule-manages-org/detail-only-read', // 不允许编辑的详情页
        component: () => import('../routes/RuleManagesOrg/DetailOnlyRead'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sdps/index-search', // 指标探查详情页(平台级)
    component: () => import('../routes/IndexSearch'),
  },
  {
    path: '/sdps/index-search-org', // 指标探查详情页(租户级)
    component: () => import('../routes/IndexSearchOrg'),
    authorized: true,
    FilterSupplier: true,
  },
  // 新版规则管理页面（平台级）
  {
    path: '/sdps/rule-management',
    components: [
      {
        path: '/sdps/rule-management/list',
        component: () => import('../routes/RuleManageTabs'),
      },
      {
        path: '/sdps/rule-management/detail',
        component: () => import('../routes/RuleManagesNew/Detail'),
      },
      {
        path: '/sdps/rule-management/detail-only-read',
        component: () => import('../routes/RuleManagesNew/DetailOnlyRead'),
      },
      {
        path: '/sdps/rule-management/new-tab-detail',
        component: () => import('../routes/RuleManagesRisk/Detail'),
      },
      {
        path: '/sdps/rule-management/new-tab-detail-only-read',
        component: () => import('../routes/RuleManagesRisk/DetailOnlyRead'),
      },
    ],
  },
  // 新版规则管理页面（租户级）
  {
    path: '/sdps/rule-management-org',
    FilterSupplier: true,
    components: [
      {
        path: '/sdps/rule-management-org/list',
        component: () => import('../routes/RuleManagesNewOrg'),
        FilterSupplier: true,
      },
      {
        path: '/sdps/rule-management-org/detail',
        component: () => import('../routes/RuleManagesNewOrg/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sdps/rule-management-org/detail-only-read',
        component: () => import('../routes/RuleManagesNewOrg/DetailOnlyRead'),
        FilterSupplier: true,
      },
      {
        path: '/sdps/rule-management-org/index-inner-org', // 指标探查详情页(租户级)
        component: () => import('../routes/IndexSearchOrg'),
        FilterSupplier: true,
      },
    ],
  },
  // 数据接入页面（平台级）
  {
    path: '/sdps/data-access',
    component: () => import('../routes/DataAccess'),
  },

  // 云仓一体 数据看板 租户级
  {
    path: '/sdps/data-display-org',
    FilterSupplier: true,
    component: () => import('../routes/CloudWarehouse/DataDisplayOrg'),
  },

  // 云仓一体 数据看板 平台级
  {
    path: '/sdps/data-display',
    component: () => import('../routes/CloudWarehouse/DataDisplay'),
  },

  // // 审核中心
  // {
  //   path: '/sdps/audit-center',
  //   component: () => import('../routes/AuditCenter'),
  // },

  // // 数据字典 租户级
  // {
  //   path: '/sdps/data-dictionary-org',
  //   // FilterSupplier: true,
  //   authorized: true,
  //   component: () => import('../routes/DataDictionaryOrg'),
  // },

  // // 数据表管理 平台级
  // {
  //   path: '/sdps/data-sheet-manage',
  //   models: [() => import('../models/dataSheetManage.js')],
  //   component: () => import('../routes/DataSheetManage'),
  // },
  // {
  //   path: '/sdps/commentImport/:code',
  //   component: () => import('../routes/CommentImport'),
  // },

  // 主题管理
  {
    path: '/sdps/theme-config',
    authorized: true,
    component: () => import('../routes/ThemeManage'),
  },

  // 指标字典
  {
    path: '/sdps/index-dictionary',
    authorized: true,
    component: () => import('../routes/IndexDictionary'),
  },
  {
    path: '/sdps/commentImport/:code',
    component: () => import('../routes/CommentImport'),
  },
];
