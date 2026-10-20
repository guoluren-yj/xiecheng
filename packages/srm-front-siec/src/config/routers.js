module.exports = [
  // PCN工作台
  {
    path: '/siec/pcnmanage-workbench',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/siec/pcnmanage-workbench/list',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/PcnmanageWorkbench/index'),
        FilterSupplier: true,
      },
      // PCN申请单-新建
      {
        path: '/siec/pcnmanage-workbench/detail',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/PcnmanageWorkbench/Detail/index'),
        FilterSupplier: true,
      },
      // PCN申请单-查询
      {
        path: '/siec/pcnmanage-workbench/detail/search',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/PcnmanageWorkbench/Detail/index'),
        FilterSupplier: true,
      },
      // PCN申请单-审批
      {
        path: '/siec/pcnmanage-workbench/detail/approve',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/PcnmanageWorkbench/Detail/index'),
        FilterSupplier: true,
      },
      // PCN申请单-SQE审批
      {
        path: '/siec/pcnmanage-workbench/detail/sqe-approve',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/PcnmanageWorkbench/Detail/index'),
        FilterSupplier: true,
      },
    ],
  },

  // 销售方PCN工作台
  {
    path: '/siec/supplier-pcnmanage-workbench',
    models: [],
    components: [
      {
        path: '/siec/supplier-pcnmanage-workbench/list',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/SupplierPcnmanageWorkbench/index'),
      },
      // PCN申请单-新建
      {
        path: '/siec/supplier-pcnmanage-workbench/detail',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/SupplierPcnmanageWorkbench/Detail/index'),
      },
      // PCN申请单-查询
      {
        path: '/siec/supplier-pcnmanage-workbench/detail/search',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/SupplierPcnmanageWorkbench/Detail/index'),
      },
      // PCN申请单-审批
      {
        path: '/siec/supplier-pcnmanage-workbench/detail/approve',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/SupplierPcnmanageWorkbench/Detail/index'),
      },
      // PCN申请单-SQE审批
      {
        path: '/siec/supplier-pcnmanage-workbench/detail/sqe-approve',
        models: [() => import('../models/pcnmanageWorkbench.js')],
        component: () => import('../routes/SupplierPcnmanageWorkbench/Detail/index'),
      },
    ],
  },

  // PCN申请单嵌入页面
  {
    path: '/pub/siec/pcnmanage-workbench/detail/approve',
    models: [() => import('../models/pcnmanageWorkbench.js')],
    component: () => import('../routes/PcnmanageWorkbench/Detail/index'),
    authorized: true,
  },

  // PCN申请单嵌入页面
  {
    path: '/pub/siec/pcnmanage-workbench/detail/work-flow',
    models: [() => import('../models/pcnmanageWorkbench.js')],
    component: () => import('../routes/PcnmanageWorkbenchDetailWork/index.js'),
    authorized: true,
  },
];
