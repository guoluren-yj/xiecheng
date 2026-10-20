module.exports = [
  // 发货配置
  {
    path: '/slod/shipments-configuration',
    models: [],
    components: [
      {
        path: '/slod/shipments-configuration/list',
        models: [],
        component: () => import('../routes/ShipmentsConfiguration'),
        // authorized: true,
      },
      {
        path: '/slod/shipments-configuration/detail',
        models: [],
        component: () => import('../routes/ShipmentsConfiguration/ShipmentsStrategy/Detail'),
        // authorized: true,
      },
    ],
  },

  // 送货单工作流 - 发货工作台
  {
    path: '/pub/slod/delivery-workbench/detail/affirm',
    component: () => import('../routes/DeliveryWorkbench/Detail/affirmDetail'),
    authorized: true,
  },
  // 送货单工作流 - 发货工作台
  {
    path: '/pub/slod/delivery-workbench/detail/all',
    component: () => import('../routes/DeliveryWorkbench/Detail/allDetail'),
    authorized: true,
  },

  // 发货工作台-采购方
  {
    path: '/slod/delivery-workbench',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/slod/delivery-workbench/list',
        models: [],
        component: () => import('../routes/DeliveryWorkbench'),
        FilterSupplier: true,
      },
      // 待创建明细
      {
        path: '/slod/delivery-workbench/detail/create',
        models: [],
        component: () => import('../routes/DeliveryWorkbench/Detail/createDetail'),
        // component: () => import('../routes/DeliveryWorkbench/Detail/submitDetail'),
        FilterSupplier: true,
      },
      // 并单
      {
        path: '/slod/delivery-workbench/detail/tab-create',
        models: [],
        component: () => import('../routes/DeliveryWorkbench/Detail/tabCreateDetail'),
        FilterSupplier: true,
      },
      // 待提交明细
      {
        path: '/slod/delivery-workbench/detail/submit',
        models: [],
        component: () => import('../routes/DeliveryWorkbench/Detail/submitDetail'),
        FilterSupplier: true,
        // authorized: true,
      },
      // 待确认明细
      {
        path: '/slod/delivery-workbench/detail/affirm',
        models: [],
        component: () => import('../routes/DeliveryWorkbench/Detail/affirmDetail'),
        FilterSupplier: true,
        // authorized: true,
      },
      // 全部明细
      {
        path: '/slod/delivery-workbench/detail/all',
        models: [],
        component: () => import('../routes/DeliveryWorkbench/Detail/allDetail'),
        FilterSupplier: true,
        // authorized: true,
      },
    ],
  },

  // 发货工作台-供应商
  {
    path: '/slod/supplier-delivery-workbench',
    models: [],
    components: [
      {
        path: '/slod/supplier-delivery-workbench/list',
        models: [],
        component: () => import('../routes/SupplierDeliveryWorkbench'),
        // authorized: true,
      },
      // 待创建明细
      {
        path: '/slod/supplier-delivery-workbench/detail/create',
        models: [],
        component: () => import('../routes/SupplierDeliveryWorkbench/Detail/createDetail'),
        // component: () => import('../routes/SupplierDeliveryWorkbench/Detail/submitDetail'),
        // authorized: true,
      },
      // 并单
      {
        path: '/slod/supplier-delivery-workbench/detail/tab-create',
        models: [],
        component: () => import('../routes/SupplierDeliveryWorkbench/Detail/tabCreateDetail'),
      },
      // 待提交明细
      {
        path: '/slod/supplier-delivery-workbench/detail/submit',
        models: [],
        component: () => import('../routes/SupplierDeliveryWorkbench/Detail/submitDetail'),
        // authorized: true,
      },
      // 待确认明细
      {
        path: '/slod/supplier-delivery-workbench/detail/affirm',
        models: [],
        component: () => import('../routes/SupplierDeliveryWorkbench/Detail/affirmDetail'),
        // authorized: true,
      },
      // 全部明细
      {
        path: '/slod/supplier-delivery-workbench/detail/all',
        models: [],
        component: () => import('../routes/SupplierDeliveryWorkbench/Detail/allDetail'),
        // authorized: true,
      },
    ],
  },

  {
    path: '/sodr/order-execution-workbench',
    components: [
      {
        path: '/sodr/order-execution-workbench/list',
        models: [() => import('../models/orderExecutionWorkbench')],
        component: () => import('../routes/OrderExecutionWorkbench'),
      },
      {
        path: '/sodr/order-execution-workbench/to-be-fed-back/:id',
        models: [() => import('../models/orderExecutionWorkbench')],
        component: () => import('../routes/OrderExecutionWorkbench/Detail/ToBeFedBack'),
      },
      {
        path: '/sodr/order-execution-workbench/feedback-already/:id',
        models: [() => import('../models/orderExecutionWorkbench')],
        component: () => import('../routes/OrderExecutionWorkbench/Detail/FeedbackAlready'),
      },
      {
        path: '/sodr/order-execution-workbench/all-orders/:id',
        models: [() => import('../models/orderExecutionWorkbench')],
        component: () => import('../routes/OrderExecutionWorkbench/Detail/All'),
      },
    ],
  },
  {
    path: '/pub/sodr/order-execution-workbench/all-orders/:id',
    models: [() => import('../models/orderExecutionWorkbench')],
    component: () => import('../routes/OrderExecutionWorkbench/Detail/All'),
    authorized: true,
  },
  // 链接弹框
  {
    path: '/slod/link-modal',
    models: [],
    component: () => import('../routes/components/CustomModal'),
    authorized: true,
  },

  // 发货执行看板
  {
    path: '/slod/delivery-board',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/slod/delivery-board/list',
        models: [],
        component: () => import('../routes/DeliveryBoard'),
        FilterSupplier: true,
      },
    ],
  },

  // 发货工作台新工作流页面（唯一标签）
  {
    path: '/pub/slod/delivery-workbench/detail/workflow',
    models: [],
    component: () => import('../routes/DeliveryWorkbench/Detail/Workflow'),
    authorized: true,
  },
];
