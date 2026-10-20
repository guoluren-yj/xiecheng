module.exports = [
  // 商城订单工作台
  {
    path: '/s2-mall/oms/order-line',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/s2-mall/oms/order-line/list',
        models: [
          () => import('../../models/oms/orderLineManage'),
          () => import('../../models/oms/relevanceDrawer'),
          () => import('../../models/oms/deliveryOrder'),
          () => import('../../models/oms/acceptOrder'),
          () => import('../../models/oms/reconciliationOrder'),
          () => import('../../models/oms/afterSaleOrder'),
        ],
        FilterSupplier: true,
        component: () => import('../../routes/oms/OrderLineManage'),
      },
      {
        path: '/s2-mall/oms/order-line/create-detail',
        models: [() => import('../../models/oms/orderLineManage')],
        FilterSupplier: true,
        component: () => import('../../routes/oms/OrderLineManage/CreateDetailPage'),
      },
      // 订单工作台订单详情
      {
        path: '/s2-mall/oms/order-line/order-detail',
        models: [
          () => import('../../models/oms/orderDetail'),
          () => import('../../models/oms/orderLineManage'),
          () => import('../../models/oms/relevanceDrawer'),
          () => import('../../models/oms/freightLineManage'),
        ],
        component: () => import('../../routes/oms/OrderDetail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/s2-mall/oms/freight-line',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/s2-mall/oms/freight-line/list',
        models: [
          () => import('../../models/oms/freightLineManage'),
          () => import('../../models/oms/relevanceDrawer'),
        ],
        FilterSupplier: true,
        component: () => import('../../routes/oms/FreightLineManage'),
      },
    ],
  },
  {
    path: '/s2-mall/oms/after-detail',
    models: [],
    component: () => import('../../routes/oms/AfterSaleWFP'),
    authorized: true,
  },
  // 订单工作台订单详情
  {
    path: '/s2-mall/oms/order-detail',
    models: [
      () => import('../../models/oms/orderDetail'),
      () => import('../../models/oms/orderLineManage'),
      () => import('../../models/oms/relevanceDrawer'),
      () => import('../../models/oms/freightLineManage'),
    ],
    component: () => import('../../routes/oms/OrderDetail'),
    FilterSupplier: true,
    // authorized: true,
    // title: '订单详情',
  },
  {
    path: '/pub/s2-mall/oms/order-detail',
    models: [() => import('../../models/oms/orderLineManage')],
    component: () => import('../../routes/oms/OrderDetailWFP'),
    authorized: true,
    // title: '订单详情',
  },
  {
    path: '/pub/s2-mall/oms/batch-detail',
    models: [],
    component: () => import('../../routes/oms/OrderDetailBatch'),
    authorized: true,
    // title: '订单详情批量审批',
  },
  {
    path: '/pub/s2-mall/oms/request-detail',
    models: [],
    component: () => import('../../routes/oms/OrderRequestWFP'),
    authorized: true,
  },
  // {
  //   path: '/s2-mall/oms/delivery-order-detail',
  //   models: [
  //     () => import('../../models/oms/deliveryOrder'),
  //     () => import('../../models/oms/relevanceDrawer'),
  //   ],
  //   component: () => import('../../routes/oms/DeliveryOrder'),
  //   authorized: true,
  //   // title: '配送单详情',
  // },
  // {
  //   path: '/s2-mall/oms/accept-order-detail',
  //   models: [
  //     () => import('../../models/oms/acceptOrder'),
  //     () => import('../../models/oms/relevanceDrawer'),
  //   ],
  //   component: () => import('../../routes/oms/AcceptOrder'),
  //   authorized: true,
  //   // title: '接收单详情',
  // },
  // {
  //   path: '/s2-mall/oms/statement-order-detail',
  //   models: [
  //     () => import('../../models/oms/reconciliationOrder'),
  //     () => import('../../models/oms/relevanceDrawer'),
  //   ],
  //   component: () => import('../../routes/oms/ReconciliationOrder'),
  //   authorized: true,
  //   // title: '对账单详情',
  // },
  // {
  //   path: '/s2-mall/oms/afterSale-order-detail',
  //   models: [
  //     () => import('../../models/oms/afterSaleOrder'),
  //     () => import('../../models/oms/relevanceDrawer'),
  //   ],
  //   component: () => import('../../routes/oms/AfterSaleOrder'),
  //   authorized: true,
  //   // title: '售后单详情',
  // },
  {
    path: '/s2-mall/oms/invoice-record',
    models: [() => import('../../models/oms/invoiceRecord')],
    component: () => import('../../routes/oms/InvoiceRecord'),
    FilterSupplier: true,
  },
  {
    path: '/s2-mall/oms/payment-record',
    models: [() => import('../../models/oms/paymentRecord')],
    component: () => import('../../routes/oms/PaymentRecord'),
    FilterSupplier: true,
  },
  {
    path: '/s2-mall/oms/payment-info',
    models: [() => import('../../models/oms/paymentInfo')],
    component: () => import('../../routes/oms/PaymentInfo'),
    // title: '支付/退款信息',
    FilterSupplier: true,
    // authorized: true,
  },
  // 售后管理供
  {
    path: '/s2-mall/oms/after-sale-manage',
    models: [],
    // authorized: true,
    components: [
      {
        path: '/s2-mall/oms/after-sale-manage/list',
        models: [],
        component: () => import('../../routes/oms/AfterSaleManage'),
      },
      // {
      //   path: '/s2-mall/oms/after-sale-manage/detail/:afterSaleId',
      //   models: [],
      //   component: () => import('../../routes/oms/AfterSaleManage/Detail'),
      // },
      {
        path: '/s2-mall/oms/after-sale-manage/address-manage',
        models: [],
        component: () => import('../../routes/oms/AfterSaleManage/ReturnAddressManage'),
      },
    ],
  },
  {
    path: '/s2-mall/oms/payment-refund',
    models: [() => import('../../models/oms/paymentRecord')],
    component: () => import('../../routes/oms/PaymentAndRefund'),
    // authorized: true,
    FilterSupplier: true,
  },
  {
    path: '/s2-mall/oms/deal-record',
    models: [],
    component: () => import('../../routes/oms/DealRecord'),
    FilterSupplier: true,
    // authorized: true,
  },
  {
    path: '/s2-mall/oms/ecBill-workBench',
    models: [],
    component: () => import('../../routes/oms/EcBillWorkBench'),
    // authorized: true,
  },
  {
    path: '/s2-mall/oms/ecBill-bench',
    models: [],
    component: () => import('../../routes/oms/EcBillWorkBenchNew'),
    // authorized: true,
  },
  // 售后管理采
  {
    path: '/s2-mall/oms/pur-afterSale-workBench',
    models: [],
    // authorized: true,
    component: () => import('../../routes/oms/PurAfterSaleWorkBench'),
    FilterSupplier: true,
  },
  // 商城申请工作台
  {
    path: '/s2-mall/oms/request-workBench',
    models: [],
    components: [
      {
        path: '/s2-mall/oms/request-workBench/list',
        models: [],
        component: () => import('../../routes/oms/ApplyWorkBench'),
      },
      {
        path: '/s2-mall/oms/request-workBench/detail-read',
        models: [],
        component: () => import('../../routes/oms/ApplyWorkBench/Detail/readOnly'),
      },
      {
        path: '/s2-mall/oms/request-workBench/detail-edit',
        models: [],
        component: () => import('../../routes/oms/ApplyWorkBench/Detail/editPage'),
      },
    ],
  },
  {
    path: '/pub/s2-mall/oms/accept-order-wfp',
    models: [],
    component: () => import('../../routes/oms/AcceptOrderWFP'),
    authorized: true,
  },
];
