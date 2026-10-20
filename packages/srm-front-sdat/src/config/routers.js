module.exports = [
  {
    path: '/sdat/cards-management',
    component: () => import('../routes/platform/CardsManagement'),
    // FilterSupplier: true,
  },
  {
    path: '/sdat/cards-distribution',
    component: () => import('../routes/CardsDistribution'),
    // FilterSupplier: true,
  },
  {
    path: '/sdat/report-cards-config',
    component: () => import('../routes/ReportWorkplace'),
  },
  {
    path: '/sdat/report-cards-menu-config',
    component: () => import('../routes/ReportConfig'),
    FilterSupplier: true,
  },
  {
    path: '/sdat/template-management',
    models: [],
    components: [
      {
        path: '/sdat/template-management/list',
        models: [],
        component: () => import('../routes/platform/TemplateManagement'),
      },
      {
        path: '/sdat/template-management/template-config/:id/:type',
        models: [],
        component: () => import('../routes/platform/TemplateManagement/Details'),
      },
    ],
  },

  // 黑名单管理
  {
    path: '/sdat/risk-blacklist-manage',
    models: [],
    components: [
      {
        path: '/sdat/risk-blacklist-manage/list',
        models: [],
        component: () => import('../routes/BlacklistManage'),
      },
      {
        path: '/sdat/risk-blacklist-manage/map/:id',
        models: [],
        component: () => import('../routes/BlacklistManage/Details'),
      },
    ],
  },

  // 供应商黑名单管理
  {
    path: '/sdat/supplier-blacklist-manage',
    models: [],
    components: [
      {
        path: '/sdat/supplier-blacklist-manage/list',
        models: [],
        component: () => import('../routes/SupplierBlacklistManage'),
      },
      {
        path: '/sdat/supplier-blacklist-manage/map/:id',
        models: [],
        component: () => import('../routes/SupplierBlacklistManage/Details'),
      },
    ],
  },

  // 黑名单关系排查
  {
    path: '/sdat/blacklist-relationship-detail',
    models: [],
    authorized: true,
    title: '关系明细',
    component: () => import('../routes/RelationshipDetail'),
  },
  // 页面迁移 - 监控概览
  {
    path: '/sdat/supplier-risk-monitor-org',
    models: [],
    authorized: true,
    components: [
      {
        path: '/sdat/supplier-risk-monitor-org/list',
        models: [],
        component: () => import('../routes/amkt/SupplierRiskMonitorOrg'),
      },
      // 動態監控事件定義
      {
        path: '/sdat/supplier-risk-monitor-org/dynamic-monitor',
        models: [],
        component: () => import('../routes/amkt/DynamicMonitor'),
      },
      // 監控企業
      {
        path: '/sdat/supplier-risk-monitor-org/monitor-business',
        models: [],
        component: () => import('../routes/amkt/MonitorBusiness'),
      },
      // 監控事件 - 風險信息詳情
      {
        path: '/sdat/supplier-risk-monitor-org/monitor-stuff',
        models: [],
        component: () => import('../routes/amkt/MonitorStuff'),
      },
      // 新聞輿情 - 新聞信息詳情
      {
        path: '/sdat/supplier-risk-monitor-org/news-public-opinion',
        models: [],
        component: () => import('../routes/amkt/NewsPublicOpinion'),
      },
    ],
  },
  // 页面迁移 - 监控管理
  {
    path: '/sdat/monitor-org-management',
    models: [],
    // authorized: true,
    components: [
      {
        path: '/sdat/monitor-org-management/list',
        models: [],
        component: () => import('../routes/amkt/MonitorOrgManagement'),
      },
      {
        path: '/sdat/monitor-org-management/mining-detail',
        models: [],
        component: () => import('../routes/amkt/MonitorOrgManagement/MiningDetail'),
      },
      // 風控日志
      {
        path: '/sdat/monitor-org-management/credit-log',
        models: [],
        component: () => import('../routes/amkt/CreditLog'),
      },
      {
        path: '/sdat/monitor-org-management/detail/:id/:enterpriseName',
        models: [],
        component: () => import('../routes/amkt/MonitorOrgManagement/MonitorOrgPanel/Details'),
      },
      // 风险扫描二级页面
      {
        path: '/sdat/monitor-org-management/risk-level-define',
        component: () => import('../routes/RiskLevelDefine'),
        // authorized: true,
      },
    ],
  },

  // 风险扫描页面
  {
    path: '/sdat/business-risk-scan',
    component: () => import('../routes/EnterpriseRiskControl/RiskScan'),
    FilterSupplier: true,
  },
  // 风险扫描报告下载页面
  {
    path: '/sdat/risk-scan-report-download',
    component: () => import('../routes/EnterpriseRiskControl/ReportDownload'),
    FilterSupplier: true,
  },

  // 内嵌供应商找关系页面
  {
    path: '/public/sdat/outlink-supplier-relationship',
    authorized: true,
    component: () => import('../routes/EnterpriseRiskControl/SupplierRelationship'),
  },
  // 内嵌供应商关系挖掘页面
  {
    path: '/public/sdat/outlink-supplier-relation-mining',
    component: () => import('../routes/EnterpriseRiskControl/RelationshipMining'),
    authorized: true,
  },
  // 启信宝产品内嵌供应商关系挖掘页面
  {
    path: '/public/sdat/qxb-supplier-relation-mining',
    component: () => import('../routes/EnterpriseRiskControl/RelationshipMiningQxb'),
    authorized: true,
  },
  // 启信宝产品内嵌供应商关系挖掘静态页面
  {
    path: '/public/sdat/qxb-static-relation-mining',
    component: () => import('../routes/RelationStaticMiningQxb'),
    authorized: true,
  },
  // 企业等级页面
  {
    path: '/sdat/business-level',
    FilterSupplier: true,
    component: () => import('../routes/EnterpriseRiskControl/BusinessLevel'),
  },

  // 云仓一体
  // 数据字典 租户级
  {
    path: '/sdat/data-dictionary-org',
    // FilterSupplier: true,
    component: () => import('../routes/sdpsTransfer/DataDictionaryOrg'),
  },

  // 数据表管理 平台级
  {
    path: '/sdat/data-sheet-manage',
    models: [() => import('../models/dataSheetManage.js')],
    component: () => import('../routes/sdpsTransfer/DataSheetManage'),
  },

  // 审核中心
  {
    path: '/sdat/audit-center',
    authorized: true,
    component: () => import('../routes/sdpsTransfer/AuditCenter'),
  },

  // 风控工作台
  {
    path: '/sdat/risk-control-workbench',
    title: '风控工作台',
    models: [
      () => import('../models/scanWorkbench.js'),
      () => import('../models/monitorWorkbench.js'),
    ],
    components: [
      {
        path: '/sdat/risk-control-workbench/list',
        component: () => import('../routes/RiskControlWorkbench'),
      },

      // 风险定义
      {
        path: '/sdat/risk-control-workbench/risk-definition',
        components: [
          {
            path: '/sdat/risk-control-workbench/risk-definition/list',
            component: () => import('../routes/RiskDefinition'),
          },
          // 风险定义
          {
            // :id/:pageType/:editType 三个参数用于区分风险定义三个步骤的新建或编辑状态
            path:
              '/sdat/risk-control-workbench/risk-definition/detail/:id/:pageType/:editType/:groupCode/:viewFlag',
            component: () => import('../routes/RiskDefinition/Detail'),
          },
          {
            // 查看操作
            path: '/sdat/risk-control-workbench/risk-definition/view/:id/:groupCode',
            component: () => import('../routes/RiskDefinition/DefineDetail'),
          },
        ],
      },

      // 风险扫描方案配置
      {
        path: '/sdat/risk-control-workbench/scheme-config',
        models: [() => import('../models/scanWorkbench.js')],
        components: [
          {
            path: '/sdat/risk-control-workbench/scheme-config/list',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig'),
          },
          // 创建页面
          {
            path: '/sdat/risk-control-workbench/scheme-config/detail/:id',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig/CreateDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-control-workbench/scheme-config/view-detail/:id/:pageType',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig/EditDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-control-workbench/scheme-config/view/:id',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig/ViewDetail'),
          },
        ],
      },

      // 风险监控方案配置
      {
        path: '/sdat/risk-control-workbench/monitor-plan',
        models: [() => import('../models/monitorWorkbench.js')],
        components: [
          {
            path: '/sdat/risk-control-workbench/monitor-plan/list',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan'),
          },
          // 创建页面
          {
            path: '/sdat/risk-control-workbench/monitor-plan/detail/:id',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan/CreateDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-control-workbench/monitor-plan/view-detail/:id/:pageType',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan/EditDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-control-workbench/monitor-plan/view/:id',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan/ViewDetail'),
          },
        ],
      },

      // 黑名单管理
      {
        path: '/sdat/risk-control-workbench/supplier-blacklist-manage',
        components: [
          {
            path: '/sdat/risk-control-workbench/supplier-blacklist-manage/list',
            component: () => import('../routes/RiskControlWorkbench/SupplierBlacklistManage'),
          },
          {
            path: '/sdat/risk-control-workbench/supplier-blacklist-manage/detail/:id',
            component: () =>
              import('../routes/RiskControlWorkbench/SupplierBlacklistManage/Details'),
          },
        ],
      },

      // 监控企业
      {
        path: '/sdat/risk-control-workbench/monitor-business',
        models: [],
        component: () => import('../routes/RiskControlMonitorBusiness'),
      },

      // 租户级风控评估指标管理
      {
        path: '/sdat/risk-control-workbench/risk-assessment-config',
        component: () => import('../routes/RiskControl/RiskIndexManageOrg'),
      },

      // 风控管理
      {
        path: '/sdat/risk-control-workbench/risk-control-manage',
        models: [],
        component: () => import('../routes/RiskControl/MonitorManage'),
      },
    ],
  },

  // 风控工作台（新）
  {
    path: '/sdat/risk-workbench-new',
    title: '风控工作台（新）',
    models: [
      () => import('../models/scanWorkbench.js'),
      () => import('../models/monitorWorkbench.js'),
    ],
    components: [
      {
        path: '/sdat/risk-workbench-new/list',
        component: () => import('../routes/RiskControlWorkbenchNew'),
      },

      // 风险定义
      {
        path: '/sdat/risk-workbench-new/risk-definition',
        components: [
          {
            path: '/sdat/risk-workbench-new/risk-definition/list',
            component: () => import('../routes/RiskDefinition'),
          },
          // 风险定义
          {
            // :id/:pageType/:editType 三个参数用于区分风险定义三个步骤的新建或编辑状态
            path:
              '/sdat/risk-workbench-new/risk-definition/detail/:id/:pageType/:editType/:groupCode/:viewFlag',
            component: () => import('../routes/RiskDefinition/Detail'),
          },
          {
            // 查看操作
            path: '/sdat/risk-workbench-new/risk-definition/view/:id/:groupCode',
            component: () => import('../routes/RiskDefinition/DefineDetail'),
          },
        ],
      },

      // 风险扫描方案配置
      {
        path: '/sdat/risk-workbench-new/scheme-config',
        models: [() => import('../models/scanWorkbench.js')],
        components: [
          {
            path: '/sdat/risk-workbench-new/scheme-config/list',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig'),
          },
          // 创建页面
          {
            path: '/sdat/risk-workbench-new/scheme-config/detail/:id',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig/CreateDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-workbench-new/scheme-config/view-detail/:id/:pageType',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig/EditDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-workbench-new/scheme-config/view/:id',
            models: [() => import('../models/scanWorkbench.js')],
            component: () => import('../routes/riskScanConfig/RiskScanSchemaConfig/ViewDetail'),
          },
        ],
      },

      // 风险监控方案配置
      {
        path: '/sdat/risk-workbench-new/monitor-plan',
        models: [() => import('../models/monitorWorkbench.js')],
        components: [
          {
            path: '/sdat/risk-workbench-new/monitor-plan/list',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan'),
          },
          // 创建页面
          {
            path: '/sdat/risk-workbench-new/monitor-plan/detail/:id',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan/CreateDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-workbench-new/monitor-plan/view-detail/:id/:pageType',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan/EditDetail'),
          },
          {
            // 编辑查看操作
            path: '/sdat/risk-workbench-new/monitor-plan/view/:id',
            models: [() => import('../models/monitorWorkbench.js')],
            component: () => import('../routes/RiskControl/RiskMonitorPlan/ViewDetail'),
          },
        ],
      },

      // 黑名单管理
      {
        path: '/sdat/risk-workbench-new/supplier-blacklist-manage',
        components: [
          {
            path: '/sdat/risk-workbench-new/supplier-blacklist-manage/list',
            component: () => import('../routes/RiskControlWorkbenchNew/SupplierBlacklistManage'),
          },
          {
            path: '/sdat/risk-workbench-new/supplier-blacklist-manage/detail/:id',
            component: () =>
              import('../routes/RiskControlWorkbenchNew/SupplierBlacklistManage/Details'),
          },
        ],
      },

      // 监控企业
      {
        path: '/sdat/risk-workbench-new/monitor-business',
        models: [],
        component: () => import('../routes/RiskControlMonitorBusiness'),
      },

      // 租户级风控评估指标管理
      {
        path: '/sdat/risk-workbench-new/risk-assessment-config',
        component: () => import('../routes/RiskControl/RiskIndexManageOrg'),
      },

      // 风控管理
      {
        path: '/sdat/risk-workbench-new/risk-control-manage',
        models: [],
        component: () => import('../routes/RiskControl/MonitorManage'),
      },
    ],
  },

  {
    path: '/sdat/risk-monitor-business',
    models: [],
    component: () => import('../routes/RiskMonitorBusiness'),
  },

  // 审批表单
  {
    path: '/pub/sdat/risk-control-approve-form/:riskProcessId', // 流程表单页面的 url,必须以 `pub` 开头
    authorized: true, // 必加，用于 pub 路由的访问
    models: [], // 流程表单页面用到的 model
    component: () => import('../routes/RiskApproveForm'), // 流程表单页面组件
  },

  // 事件消息详情
  {
    path: '/sdat/risk-control-event-detail/:riskEventId', // 流程表单页面的 url,必须以 `pub` 开头
    authorized: true, // 必加，用于 pub 路由的访问
    models: [], // 流程表单页面用到的 model
    title: 'hzero.common.view.title.riskIncidentDetail',
    component: () => import('../routes/RiskMessageDetail'), // 流程表单页面组件
  },

  // 页面字段关系查询 租户级
  {
    path: '/sdat/field-relationship-query-org',
    // FilterSupplier: true,
    component: () => import('../routes/tenant/FieldRelationshipQueryOrg'),
  },

  // 页面字段关系查询 平台级
  {
    path: '/sdat/platform-field-relationship',
    authorized: true,
    component: () => import('../routes/FieldRelationshipQuery'),
  },

  // 内嵌供应商关系挖掘页面
  {
    path: '/public/sdat/supplier-relation-static-mining',
    component: () => import('../routes/RelationStaticMining'),
    authorized: true,
  },

  // 事件采集监控
  {
    path: '/sdat/event-collection-monitor',
    models: [],
    // authorized: true,
    component: () => import('../routes/EventCollectMonitor'),
  },

  // 企业尽职调查页面 平台级
  {
    path: '/sdat/corporate-due-diligence',
    component: () => import('../routes/CorpDueDiligence'),
  },

  // 事件更新汇总查询
  {
    path: '/sdat/event-update-summary',
    models: [],
    authorized: true,
    components: [
      {
        path: '/sdat/event-update-summary/list',
        models: [],
        component: () => import('../routes/EventUpdateSummary'),
      },
      // 風控日志
      {
        path:
          '/sdat/event-update-summary/monitor-detail/:tenantId/:socialCode/:client/:enterpriseName',
        models: [],
        component: () => import('../routes/EventUpdateSummary/Detail'),
      },
      {
        // :id/:pageType/:editType 三个参数用于区分风险定义三个步骤的新建或编辑状态
        path: '/sdat/event-update-summary/risk-definition/:id/:tenantId/:groupCode',
        component: () => import('../routes/EventUpdateSummary/DefineDetail'),
      },
    ],
  },

  // 内嵌供应商关系挖掘历史页面
  {
    path: '/public/sdat/relation-mining-history',
    component: () => import('../routes/EnterpriseRiskControl/RelationMiningHistory'),
    authorized: true,
  },

  // 内嵌风险扫描弹窗
  {
    path: '/public/sdat/risk-scan-report',
    component: () => import('../routes/RiskScanReport'),
    authorized: true,
  },

  // 关系排查页面
  {
    path: '/public/sdat/relation-investigation',
    component: () => import('../routes/EnterpriseRiskControl/RelationInvest'),
    authorized: true,
  },

  // 风险档案查询
  {
    path: '/public/sdat/risk-profile',
    component: () => import('../routes/RiskProfile'),
    authorized: true,
  },

  // 关系排查报告
  {
    path: '/public/sdat/relation-troubleshoot',
    component: () => import('../routes/RiskTroubleshoot'),
    authorized: true,
  },

  // 风险报告下载页面
  {
    path: '/sdat/risk-report-download',
    component: () => import('../routes/RiskReportDownload'),
  },

  // 内嵌启信宝页面 资质筛选
  {
    path: '/sdat/inner-access-spa',
    component: () => import('../routes/InnerQXB/AccessSpa'),
  },

  // 内嵌启信宝页面 客商搜索
  {
    path: '/sdat/inner-advances',
    component: () => import('../routes/InnerQXB/Advanced'),
  },

  // 内嵌启信宝页面 批量排查
  {
    path: '/sdat/inner-batch-invest',
    component: () => import('../routes/InnerQXB/BatchInvestigation'),
  },

  // 内嵌启信宝页面 企业监控
  {
    path: '/sdat/inner-enterprise-monitor',
    component: () => import('../routes/InnerQXB/EnterpriseMonitor'),
  },

  // 内嵌启信宝页面 舆情监控
  {
    path: '/sdat/inner-news-monitor',
    component: () => import('../routes/InnerQXB/NewsMonitor'),
    authorized: true,
  },

  // 内嵌启信宝页面 园区企业
  {
    path: '/sdat/inner-park-search',
    component: () => import('../routes/InnerQXB/ParkSearch'),
  },

  // 内嵌启信宝页面 集中排查
  {
    path: '/sdat/inner-relation-new',
    component: () => import('../routes/InnerQXB/RelationNew'),
  },

  // 租户接口调用信息配置
  {
    path: '/sdat/tenant-account-config',
    component: () => import('../routes/BankEnterDirectLink/CustomerAccountMgt'),
    // authorized: true,
  },

  // 银行流水
  {
    path: '/sdat/bank-statement-inquiry',
    component: () => import('../routes/BankEnterDirectLink/BankStatementInquiry'),
    // authorized: true,
  },

  // 新关系排查页面
  {
    path: '/public/sdat/customized-relation-investigation',
    component: () => import('../routes/EnterpriseRiskControl/NewRelationInvest'),
    authorized: true,
  },

  // 点数消耗看台
  {
    path: '/sdat/point-consumption-stands',
    component: () => import('../routes/riskScanConfig/PointWorkplace'),
  },

  // 风险项管理
  {
    path: '/sdat/platform/risk-item-config',
    // component: () => import('../routes/riskScanConfig/platform/RiskItemConfig'),
    component: () => import('../routes/RiskControl/RiskIndexManage'),
  },

  // 风险扫描方案模板
  {
    path: '/sdat/platform/risk-scheme-template',
    components: [
      {
        path: '/sdat/platform/risk-scheme-template/list',
        component: () => import('../routes/riskScanConfig/platform/SchemeTemplate'),
      },
      {
        path: '/sdat/platform/risk-scheme-template/create',
        component: () => import('../routes/riskScanConfig/platform/SchemeTemplate/CreateDetail'),
      },
      {
        path: '/sdat/platform/risk-scheme-template/detail/:id/:type/:tenantName',
        component: () => import('../routes/riskScanConfig/platform/SchemeTemplate/EditDetail'),
      },
    ],
  },

  // 内嵌风险扫描弹窗 v2
  {
    path: '/pub/sdat/risk-scan-v2-report',
    component: () => import('../routes/riskScanConfig/RiskScanReport'),
    authorized: true,
  },

  // 审批表单
  {
    path: '/pub/sdat/risk-control-approve-form-v2/:riskProcessId', // 流程表单页面的 url,必须以 `pub` 开头
    authorized: true, // 必加，用于 pub 路由的访问
    models: [], // 流程表单页面用到的 model
    component: () => import('../routes/riskScanConfig/RiskApproveForm'), // 流程表单页面组件
  },

  // 事件消息详情
  {
    path: '/sdat/risk-control-event-detail-v2/:riskEventId', // 流程表单页面的 url,必须以 `pub` 开头
    authorized: true, // 必加，用于 pub 路由的访问
    models: [], // 流程表单页面用到的 model
    title: 'hzero.common.view.title.riskIncidentDetail',
    component: () => import('../routes/riskScanConfig/RiskMessageDetail'), // 流程表单页面组件
  },

  {
    path: '/sdat/commentImport/:code',
    component: () => import('../routes/CommentImport'),
  },

  // AI 应用服务管理
  {
    path: '/sdat/ai-application-manage',
    component: () => import('../routes/AIAgentMgt/AiAppManage'),
  },

  // // 租户 AI 应用配置
  // {
  //   path: '/sdat/ai-org-app-config',
  //   authorized: true,
  //   component: () => import('../routes/AIAgentMgt/AiOrgConfig'),
  // },

  // // 租户级风控评估指标管理
  // {
  //   path: '/sdat/org/risk-assessment-config',
  //   authorized: true,
  //   component: () => import('../routes/RiskControl/RiskIndexManageOrg'),
  // },

  // 数据采集商品管理
  {
    path: '/sdat/collection-product-manage',
    component: () => import('../routes/MarketDataCollection/ProductManagement'),
  },

  // 数据采集商品价格管理
  {
    path: '/sdat/collection-product-price',
    component: () => import('../routes/MarketDataCollection/ProductPrice'),
  },

  // 采购智能寻源
  {
    path: '/sdat/inner-supplier-source',
    component: () => import('../routes/InnerQXB/SupplierSource'),
    authorized: true,
  },

  // 关系排查
  {
    path: '/sdat/qxb-relationship-investigation',
    component: () => import('../routes/EnterpriseRiskControl/RelationshipMiningMenu'),
  },
];
