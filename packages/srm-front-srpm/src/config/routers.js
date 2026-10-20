/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:43:16
 * @LastEditors: yanglin
 * @LastEditTime: 2021-11-15 15:38:00
 */
module.exports = [
  // 需求计划执行工作台
  {
    path: '/srpm/rp-execute-platform',
    FilterSupplier: true,
    models: [],
    components: [
      {
        path: '/srpm/rp-execute-platform/list',
        models: [() => import('../models/rpExecuteProgram.js')],
        component: () => import('../routes/RpExecuteProgram'),
        FilterSupplier: true,
      },
      {
        path: '/srpm/rp-execute-platform/detail/:id',
        FilterSupplier: true,
        models: [() => import('../models/rpExecuteProgram.js')],
        component: () => import('../routes/RpExecuteProgram/Detail'),
      },
      {
        path: '/srpm/rp-execute-platform/ready-modal',
        FilterSupplier: true,
        models: [() => import('../models/rpExecuteProgram.js')],
        component: () => import('../routes/RpExecuteProgram/ReadyModal'),
      },
    ],
  },
  // 需求计划执行pub页
  {
    path: '/pub/srpm/rp-execute-platform/detail/:id',
    models: [],
    component: () => import('../routes/RpExecuteProgram/Detail'),
    authorized: true,
  },
  // 需求计划工作台
  {
    path: '/srpm/requisition-plan',
    FilterSupplier: true,
    models: [() => import('../models/requisitionPlan')],
    components: [
      {
        path: '/srpm/requisition-plan/list',
        FilterSupplier: true,
        models: [() => import('../models/requisitionPlan')],
        component: () => import('../routes/RequisitionPlan'),
      },
      {
        path: '/srpm/requisition-plan/create',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/RequisitionPlanDetail/Create'),
      },
      {
        path: '/srpm/requisition-plan/edit/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanDetail/Create'),
      },
      {
        path: '/srpm/requisition-plan/only-read/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanDetail/ReadOnly'),
      },
      {
        path: '/srpm/requisition-plan/erp-only-read/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanDetail/ErpReadOnly'),
      },
      {
        path: '/srpm/requisition-plan/erp-edit/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanDetail/ErpCreate'),
      },
    ],
  },

  // 需求计划只读pub页
  {
    path: '/pub/srpm/requisition-plan/only-read/:id',
    models: [],
    component: () => import('../routes/RequisitionPlanDetail/ReadOnly'),
    authorized: true,
  },

  // 需求计划ERP只读pub页
  {
    path: '/pub/srpm/requisition-plan/erp-only-read/:id',
    models: [],
    component: () => import('../routes/RequisitionPlanDetail/ErpReadOnly'),
    authorized: true,
  },

  // 需求计划配置
  {
    path: '/srpm/requisition-plan-config',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/srpm/requisition-plan-config/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanConfig'),
      },
      {
        path: '/srpm/requisition-plan-config/detail/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanConfig/Detail'),
      },
      {
        path: '/srpm/requisition-plan-config/detail-query/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanConfig/History'),
      },
      {
        path: '/srpm/requisition-plan-config/history/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RequisitionPlanConfig/History'),
      },
    ],
    // title: '需求计划配置',
    // authorized: true,
  },
];
