module.exports = [
  // 资金计划预测
  {
    path: '/sbsm/fund-plan-forecasting',
    FilterSupplier: true,
    components: [
      {
        path: '/sbsm/fund-plan-forecasting/list',
        FilterSupplier: true,
        component: () => import('../routes/FundPlanForecasting/List'),
      },
    ],
  },
  // 外部使用 来源单据条款
  {
    path: '/pub/sbsm/source-document/detail/:dtHeaderId',
    authorized: true,
    component: () => import('../routes/SourceDocTerm'),
  },
  // 外部使用 编制池详情弹框
  {
    path: '/pub/sbsm/fund-plan-prefabrication/detail',
    authorized: true,
    component: () => import('../routes/FundPlanPrefabrication/Detail'),
  },
  // 资金计划编制池
  {
    path: '/sbsm/fund-plan-prefabrication',
    components: [
      {
        path: '/sbsm/fund-plan-prefabrication/list',
        FilterSupplier: true,
        component: () => import('../routes/FundPlanPrefabrication/List'),
      },
    ],
  },
  // 资金计划编制工作台
  {
    path: '/pub/sbsm/fund-plan-preparation/detail/:prepHeaderId',
    authorized: true,
    component: () => import('../routes/FundPlanPreparation/Detail'),
  },
  {
    path: '/sbsm/fund-plan-preparation',
    FilterSupplier: true,
    components: [
      {
        path: '/sbsm/fund-plan-preparation/list',
        FilterSupplier: true,
        component: () => import('../routes/FundPlanPreparation/List'),
      },
      {
        path: '/sbsm/fund-plan-preparation/detail/:prepHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/FundPlanPreparation/Detail'),
      },
    ],
  },
  // 资金计划汇总编制工作台
  {
    path: '/sbsm/fund-plan-summary',
    FilterSupplier: true,
    components: [
      {
        path: '/sbsm/fund-plan-summary/list',
        FilterSupplier: true,
        component: () => import('../routes/FundPlanSummary/List'),
      },
      {
        path: '/sbsm/fund-plan-summary/detail/:balHeaderId',
        FilterSupplier: true,
        component: () => import('../routes/FundPlanSummary/Detail'),
      },
    ],
  },
  {
    path: '/pub/sbsm/fund-plan-summary/detail/:balHeaderId',
    authorized: true,
    component: () => import('../routes/FundPlanSummary/Detail'),
  },
  // 条款定义工作流
  {
    path: '/pub/sbsm/payment-terms/detail/:termHeaderId',
    component: () => import('../routes/FundPlanTerm/Detail'),
    authorized: true,
  },
  // 条款定义
  {
    path: '/sbsm/payment-terms',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sbsm/payment-terms/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/FundPlanTerm/List'),
      },
      // 资金计划详情
      {
        path: '/sbsm/payment-terms/detail/:termHeaderId',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/FundPlanTerm/Detail'),
      },
    ],
  },
  {
    path: '/sbsm/payment-pool',
    components: [
      {
        path: '/sbsm/payment-pool/list',
        component: () => import('../routes/PaymentPool/List'),
      },
    ],
  },
  {
    path: '/sbsm/payment-workbench',
    components: [
      {
        path: '/sbsm/payment-workbench/list',
        component: () => import('../routes/PaymentWorkbench/List'),
      },
      {
        path: '/sbsm/payment-workbench/detail/:payHeaderId',
        component: () => import('../routes/PaymentWorkbench/Detail'),
      },
    ],
  },
  {
    path: '/pub/sbsm/payment-workbench/detail/:payHeaderId',
    component: () => import('../routes/PaymentWorkbench/Detail'),
    authorized: true,
  },
  {
    path: '/pub/sbsm/payment-workbench/batch-workflow/:batchId',
    component: () => import('../routes/PaymentWorkbench/BatchWorkflow'),
    authorized: true,
  },
  {
    path: '/sbsm/bank-bill-pool',
    components: [
      {
        path: '/sbsm/bank-bill-pool/list',
        component: () => import('../routes/BankBillPool/List'),
      },
      {
        path: '/sbsm/bank-bill-pool/create',
        component: () => import('../routes/BankBillPool/Detail'),
      },
      {
        path: '/sbsm/bank-bill-pool/detail/:paperId',
        component: () => import('../routes/BankBillPool/Detail'),
      },
    ],
  },
  {
    path: '/sbsm/bank-flow-pool',
    components: [
      {
        path: '/sbsm/bank-flow-pool/list',
        component: () => import('../routes/BankFlowPool/List'),
      },
    ],
  },
];
