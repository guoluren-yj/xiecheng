/*
 * @Description:
 * @Date: 2020-07-23 10:11:41
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
module.exports = [
  // 预算编制
  {
    path: '/sbud/budgeting',
    FilterSupplier: true,
    models: [],
    components: [
      {
        path: '/sbud/budgeting/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/Budgeting'),
      },
      {
        path: '/sbud/budgeting/occupationDetails',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/Budgeting/OccupationDetails/index'),
      },
      {
        FilterSupplier: true,
        path: '/sbud/budgeting/data-import/:code',
        component: () => import('../routes/Budgeting/Import/CommentImport'),
        models: [],
      },
      {
        path: '/sbud/budgeting/write-off',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/Budgeting/BudgetWriteOff'),
      },
    ],
  },
  // 预算属性映射
  {
    path: '/sbud/budget-attribute-mapping',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sbud/budget-attribute-mapping/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudgetAttributeMapping'),
      },
    ],
  },
  // 时间周期设置
  {
    path: '/sbud/budget-time-cycle',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sbud/budget-time-cycle/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudgetTimeCycle'),
      },
    ],
  },
  // 预算规则
  {
    path: '/sbud/budget-rule',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sbud/budget-rule/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudgetRule'),
      },
      {
        path: '/sbud/budget-rule/detail',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudgetRule/Detail'),
      },
    ],
  },
  // 预算审批
  {
    path: '/sbud/budeget-approval',
    models: [],
    FilterSupplier: true,
    authorized: true,
    components: [
      {
        path: '/sbud/budeget-approval/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudegetApproval'),
      },
      {
        path: '/sbud/budeget-approval/occupationDetails',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudegetApproval/OccupationDetails/index'),
      },
      {
        path: '/sbud/budeget-approval/write-off',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/BudegetApproval/BudgetWriteOff'),
      },
    ],
  },
  {
    path: '/pub/sbud/budget-rule/detail/:budgetId',
    models: [],
    component: () => import('../routes/Budgeting/onlyView'),
  },

  // --------新预算----------

  // 平台级预算维度定义
  {
    path: '/sbud/budget-item-pre',
    models: [],
    component: () => import('../routes/BudgetItemPre'),
  },
  // 租户级预算维度属性映射
  {
    path: '/sbud/budget-item-mapping',
    models: [],
    authorized: true,
    components: [
      {
        path: '/sbud/budget-item-mapping/list',
        models: [],
        component: () => import('../routes/BudgetItemMapping'),
      },
      {
        path: '/sbud/budget-item-mapping/detail/:budgetItemId',
        models: [],
        component: () => import('../routes/BudgetItemMapping/Detail/Edit'),
      },
      {
        path: '/sbud/budget-item-mapping/read-only/:budgetItemId',
        models: [],
        component: () => import('../routes/BudgetItemMapping/Detail/ReadOnly'),
      },
    ],
  },
  // 预算模版
  {
    path: '/sbud/budget-template',
    models: [],
    components: [
      {
        path: '/sbud/budget-template/list',
        models: [],
        component: () => import('../routes/BudgetTemplate'),
      },
      {
        path: '/sbud/budget-template/detail/:id',
        models: [],
        component: () => import('../routes/BudgetTemplate/Detail'),
      },
      {
        path: '/sbud/budget-template/read-only/:id',
        models: [],
        component: () => import('../routes/BudgetTemplate/ReadOnly'),
      },
      {
        path: '/sbud/budget-template/history/:id',
        models: [],
        component: () => import('../routes/BudgetTemplate/ReadOnly'),
      },
    ],
  },

  // 预算策略

  {
    path: '/sbud/budget-strategy',
    models: [],
    components: [
      {
        path: '/sbud/budget-strategy/list',
        models: [],
        component: () => import('../routes/BudgetStrategy'),
      },
      {
        path: '/sbud/budget-strategy/detail/:id',
        models: [],
        component: () => import('../routes/BudgetStrategy/Detail'),
      },
      {
        path: '/sbud/budget-strategy/read-only/:id',
        models: [],
        component: () => import('../routes/BudgetStrategy/ReadOnly'),
      },
    ],
  },

  // 预算编制
  {
    path: '/sbud/budget',
    models: [() => import('../models/budget')],
    components: [
      {
        path: '/sbud/budget/list',
        models: [() => import('../models/budget')],
        component: () => import('../routes/Budget'),
      },
      {
        path: '/sbud/budget/detail',
        models: [],
        component: () => import('../routes/Budget/Detail'),
      },
      {
        path: '/sbud/budget/read',
        models: [],
        component: () => import('../routes/Budget/ReadOnly'),
      },
      {
        path: '/sbud/budget/import-component/:code',
        models: [],
        component: () => import('../routes/Budget/components/Imports'),
      },
    ],
  },
  {
    path: '/pub/sbud/budget/read',
    models: [],
    component: () => import('../routes/Budget/ReadOnly'),
    authorized: true,
  },

  // 预算台账
  {
    path: '/sbud/budget-account',
    models: [],
    component: () => import('../routes/BudgetAccount'),
  },
];
