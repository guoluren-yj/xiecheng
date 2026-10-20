module.exports = [
  // 基础配置
  {
    path: '/spfp/basic-configuration',
    authorized: true,
    components: [
      {
        path: '/spfp/basic-configuration/detail',
        component: () => import('../routes/BasicConfiguration'),
        authorized: true,
      },
    ],
  },
  // 规则汇总查询
  {
    path: '/spfp/rule-maintenance/query-all',
    components: [
      {
        path: '/spfp/rule-maintenance/query-all/list',
        component: () => import('../routes/RuleMaintenance/TotalQuery/List'),
      },
    ],
  },
  //  返利规则维护
  {
    path: '/spfp/rule-maintenance/rebate',
    components: [
      {
        path: '/spfp/rule-maintenance/rebate/list',
        component: () => import('../routes/RuleMaintenance/Rebate/List'),
      },
      {
        path: '/spfp/rule-maintenance/rebate/detail/:ruleId/:operate?',
        component: () => import('../routes/RuleMaintenance/Rebate/Create/index'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/spfp/rule-maintenance/rebate/detail/:ruleId/view?step=END',
    component: () => import('../routes/RuleMaintenance/Rebate/Create/index'),
  },
  //  折扣规则维护
  {
    path: '/spfp/rule-maintenance/discount',
    components: [
      {
        path: '/spfp/rule-maintenance/discount/list',
        component: () => import('../routes/RuleMaintenance/Discount/List'),
      },
      {
        path: '/spfp/rule-maintenance/discount/detail/:ruleId/:operate?',
        component: () => import('../routes/RuleMaintenance/Discount/Create'),
      },
      {
        path: '/spfp/rule-maintenance/discount/change-detail/:ruleId/:operate',
        component: () => import('../routes/RuleMaintenance/Discount/Detail'),
      },
      {
        // 实际配置 /spfp/rule-maintenance/discount/other-detail/{ruleId}/view?step=END
        path: '/spfp/rule-maintenance/discount/other-detail/:ruleId/:operate',
        component: () => import('../routes/RuleMaintenance/Discount/Create'),
        authorized: true,
        title: 'hzero.common.view.message.title.discountDetail',
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/spfp/rule-maintenance/discount/detail/:ruleId/view?step=END',
    component: () => import('../routes/RuleMaintenance/Discount/Create'),
  },
  // 返利出单计算明细报表
  {
    path: '/spfp/rebate-order-calculate',
    components: [
      {
        path: '/spfp/rebate-order-calculate/list',
        component: () => import('../routes/RebateOrderCalculate/List'),
      },
    ],
  },
];
