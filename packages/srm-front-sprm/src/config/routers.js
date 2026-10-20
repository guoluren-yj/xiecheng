module.exports = [
  {
    authorized: true,
    path: '/pub/sprm/ai-request-query',
    models: [],
    component: () => import('../routes/AiRequestQuery'),
  },
  {
    authorized: true,
    path: '/pub/sprm/source-confirmation',
    component: () => import('../routes/SourceConfirmation'),
  },
  {
    authorized: true,
    path: '/pub/sprm/order-view',
    component: () => import('../routes/OrderView'),
  },
  // {
  //   authorized: true,
  //   path: '/pub/sprm/ai-source-match',
  //   component: () => import('../routes/AiSourceMatchDetail'),
  // },
  // 智能转单申请详情
  {
    authorized: true,
    path: '/pub/sprm/ai-pr-view',
    component: () => import('../routes/AiPrView'),
  },
  // 智能转单订单详情
  {
    authorized: true,
    path: '/pub/sprm/ai-order-view',
    component: () => import('../routes/AiOrderView'),
  },
  {
    path: '/sprm/purchase-requisition-inquiry',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sprm/purchase-requisition-inquiry/list',
        models: [() => import('../models/purchaseRequisitionInquiry.js')],
        component: () => import('../routes/PurchaseRequisitionInquiry'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-inquiry/erp-detail/:id',
        models: [() => import('../models/purchaseRequisitionInquiry.js')],
        component: () => import('../routes/PurchaseRequisitionInquiry/ErpDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-inquiry/not-erp-detail/:id',
        models: [() => import('../models/purchaseRequisitionInquiry.js')],
        component: () => import('../routes/PurchaseRequisitionInquiry/NotErpDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-inquiry/price-list',
        models: [],
        component: () => import('../routes/PriceCompare'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sprm/purchase-requisition-creation',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sprm/purchase-requisition-creation/list',
        models: [() => import('../models/purchaseRequisitionCreation.js')],
        component: () => import('../routes/PurchaseRequisitionCreation'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-creation/detail',
        models: [() => import('../models/purchaseRequisitionCreation.js')],
        component: () => import('../routes/PurchaseRequisitionCreation/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-creation/price-list',
        models: [],
        component: () => import('../routes/PriceCompare'),
        FilterSupplier: true,
      },
      {
        // authorized: true,
        // title: '批量导入',
        path: '/sprm/purchase-requisition-creation/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sprm/purchase-requisition-cancel',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sprm/purchase-requisition-cancel/list',
        models: [() => import('../models/purchaseRequisitionCancel.js')],
        component: () => import('../routes/PurchaseRequisitionCancel'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-cancel/detail-erp/:id',
        models: [() => import('../models/purchaseRequisitionCancel.js')],
        component: () =>
          import('../routes/PurchaseRequisitionCancel/ERP/ErpPurchaseRequisition.js'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-cancel/detail-non-erp/:id',
        models: [() => import('../models/purchaseRequisitionCancel.js')],
        component: () =>
          import('../routes/PurchaseRequisitionCancel/Detail/NonErpPurchaseRequisition.js'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sprm/purchase-requisition-approval',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sprm/purchase-requisition-approval/list',
        models: [() => import('../models/purchaseRequisitionApproval.js')],
        component: () => import('../routes/PurchaseRequisitionApproval'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-approval/detail-erp/:id',
        models: [() => import('../models/purchaseRequisitionApproval.js')],
        component: () =>
          import('../routes/PurchaseRequisitionApproval/Detail/ErpPurchaseRequisition.js'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-approval/new-detail-nonerp/:id',
        models: [],
        component: () => import('../routes/NewPurchaseDetail/RequisitionApprove'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-approval/detail-non-erp/:id',
        models: [() => import('../models/purchaseRequisitionApproval.js')],
        component: () =>
          import('../routes/PurchaseRequisitionApproval/Detail/NonErpPurchaseRequisition.js'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-requisition-approval/price-list',
        models: [],
        component: () => import('../routes/PriceCompare'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sprm/purchase-requisition-assignment',
    FilterSupplier: true,
    models: [],
    components: [
      {
        path: '/sprm/purchase-requisition-assignment/list',
        models: [() => import('../models/purchaseRequisitionAssignment.js')],
        component: () => import('../routes/PurchaseRequisitionAssignment'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * 工作流需求创建嵌入页面
   */
  {
    path: '/pub/sprm/purchase-requisition-creation/detail/:id',
    models: [() => import('../models/purchaseRequisitionCreation.js')],
    component: () => import('../routes/PurchaseRequisitionCreation/Detail'),
    authorized: true,
  },
  // 寻求erp明细pub页
  {
    path: '/pub/sprm/purchase-requisition-inquiry/not-erp-detail/:id',
    models: [() => import('../models/purchaseRequisitionInquiry.js')],
    component: () => import('../routes/PurchaseRequisitionInquiry/NotErpDetail'),
    authorized: true,
  },
  // 寻求非erp明细pub页
  {
    path: '/pub/sprm/purchase-requisition-inquiry/erp-detail/:id',
    models: [() => import('../models/purchaseRequisitionInquiry.js')],
    component: () => import('../routes/PurchaseRequisitionInquiry/ErpDetail'),
    authorized: true,
  },

  // 确认货源
  {
    path: '/sprm/source-confirm',
    models: [],
    component: () => import('../routes/SourceConfirm'),
    authorized: true,
    title: '确认货源',
  },
  // 需求池
  {
    path: '/sprm/purchase-requisition-pool',
    FilterSupplier: true,
    models: [() => import('../models/purchaseRequisitionAssignment.js')],
    component: () => import('../routes/PurchaseRequisitionPool'),
    // components: [
    //   {
    //     path: '/sprm/purchase-requisition-pool/list',
    //     models: [() => import('../models/purchaseRequisitionAssignment.js')],
    //     component: () => import('../routes/PurchaseRequisitionPool'),
    //     FilterSupplier: true,
    //   },
    // ],
  },
  // 采购申请工作台
  {
    path: '/sprm/purchase-platform',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sprm/purchase-platform/list',
        models: [() => import('../models/purchaseplatform.js')],
        component: () => import('../routes/PurchasePlatform'),
        FilterSupplier: true,
      },
      // 采购申请创建
      {
        path: '/sprm/purchase-platform/creation-detail',
        models: [],
        component: () => import('../routes/NewPurchaseDetail/RequisitionCreation'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/creation-detail/:id',
        models: [() => import('../models/purchaseRequisitionCreation.js')],
        component: () => import('../routes/NewPurchaseDetail/RequisitionCreation'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/creation-price-list',
        models: [() => import('../models/purchaseRequisitionCreation.js')],
        component: () => import('../routes/PriceCompare'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform-creation/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/noerp-detail/:id',
        models: [() => import('../models/purchaseRequisitionInquiry.js')],
        component: () => import('../routes/NewPurchaseDetail/RequisitionInquery'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/erp-detail/:id',
        models: [() => import('../models/purchaseRequisitionInquiry.js')],
        component: () => import('../routes/NewPurchaseDetail/RequisitionInquery'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/cancel-noerp-detail/:id',
        models: [() => import('../models/purchaseRequisitionCancel.js')],
        component: () => import('../routes/NewPurchaseDetail/RequisitionCacel'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/cancel-erp-detail/:id',
        models: [() => import('../models/purchaseRequisitionCancel.js')],
        component: () => import('../routes/NewPurchaseDetail/RequisitionCacel'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/purchase-platform/cancelerp-detail/:id',
        models: [() => import('../models/purchaseRequisitionCancel.js')],
        component: () => import('../routes/NewPurchaseDetail/RequisitionCacel'),
        // component: () =>
        //   import('../routes/PurchaseRequisitionCancel/ERP/ErpPurchaseRequisition.js'),
        FilterSupplier: true,
      },
    ],
  },
  {
    // 高级查询测试页面
    path: '/sprm/search-bar-test',
    FilterSupplier: true,
    models: [() => import('../models/purchaseRequisitionAssignment.js')],
    component: () => import('../routes/SearchBarTest'),
  },
  // 采购执行工作台
  {
    path: '/sprm/purchase-execution',
    models: [
      () => import('../models/purchaseRequisitionAssignment.js'),
      () => import('../models/purchaseplatform.js'),
    ],
    component: () => import('../routes/PurchaseExecution'),
    FilterSupplier: true,
  },
  /**
   * 工作流需求查询新UI /pub/sprm/purchase-platform/noerp-detail//${id}
   */
  {
    path: '/pub/sprm/purchase-platform/noerp-detail/:id',
    models: [() => import('../models/purchaseRequisitionInquiry.js')],
    component: () => import('../routes/NewPurchaseDetail/RequisitionInquery'),
    authorized: true,
  },
  {
    path: '/pub/sprm/purchase-platform/erp-detail/:id',
    models: [() => import('../models/purchaseRequisitionInquiry.js')],
    component: () => import('../routes/NewPurchaseDetail/RequisitionInquery'),
    authorized: true,
  },

  {
    path: '/sprm/modal/item-custom',
    component: () => import('../routes/ModalPage/ItemCustom'),
  },

  // 预测管理模板-平台级
  // forecast-template-definition
  {
    path: '/sprm/forecast-lib-dimension',
    models: [],
    components: [
      {
        path: '/sprm/forecast-lib-dimension/list',
        models: [],
        component: () => import('../routes/ForecastTemplateDefinition'),
      },
      {
        path: '/sprm/forecast-lib-dimension/detail/create',
        models: [],
        component: () => import('../routes/ForecastTemplateDefinition/Detail'),
      },
      {
        path: '/sprm/forecast-lib-dimension/detail/:id',
        models: [],
        component: () => import('../routes/ForecastTemplateDefinition/Detail'),
      },

      {
        path: '/sprm/forecast-lib-dimension/read-detail/:id',
        models: [],
        component: () => import('../routes/ForecastTemplateDefinition/ReadDatail'),
      },
    ],
  },

  // 预测管理模板-平台级
  // forecast-template-definition
  {
    path: '/sprm/forecast-dimension-org',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sprm/forecast-dimension-org/list',
        models: [],
        component: () => import('../routes/ForcastTempDefByTenant'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/forecast-dimension-org/detail/:id',
        models: [],
        component: () => import('../routes/ForcastTempDefByTenant/Detail'),
        FilterSupplier: true,
      },

      {
        path: '/sprm/forecast-dimension-org/read-detail/:id',
        models: [],
        component: () => import('../routes/ForcastTempDefByTenant/ReadDatail'),
        FilterSupplier: true,
      },
    ],
  },

  {
    path: '/sprm/forecast-workbench',
    models: [],
    FilterSupplier: true,
    // component: () => import('../routes/ForecastWorkbench'),
    components: [
      {
        path: '/sprm/forecast-workbench/list',
        models: [],
        component: () => import('../routes/ForecastWorkbenchNew'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/forecast-workbench/offline-import',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/ForecastWorkbench/batchNew'),
      },
      {
        path: '/sprm/forecast-workbench/import',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/ForecastWorkbench/batchNew'),
      },
      {
        path: '/sprm/forecast-workbench/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },

  {
    path: '/sprm/forecast-supplier-workbench',
    models: [],
    components: [
      {
        path: '/sprm/forecast-supplier-workbench/list',
        models: [],
        component: () => import('../routes/ForecastSupplierWorkbench'),
      },
      {
        path: '/sprm/forecast-supplier-workbench/import',
        models: [],
        component: () => import('../routes/ForecastSupplierWorkbench/batchNew'),
      },
    ],
  },

  {
    authorized: true,
    path: '/pub/sprm/forecast-workflow/:id',
    models: [],
    component: () => import('../routes/ForcastWorkFlow'),
  },
  // {
  //   path: '/sprm/purchase-requisition-creation',
  //   models: [],
  //   FilterSupplier: true,
  //   components: [
  //     {
  //       path: '/sprm/purchase-requisition-creation/list',
  //       models: [() => import('../models/purchaseRequisitionCreation.js')],
  //       component: () => import('../routes/PurchaseRequisitionCreation'),
  //       FilterSupplier: true,
  //     },
  //     {
  //       path: '/sprm/purchase-requisition-creation/detail',
  //       models: [() => import('../models/purchaseRequisitionCreation.js')],
  //       component: () => import('../routes/PurchaseRequisitionCreation/Detail'),
  //       FilterSupplier: true,
  //     },
  //     {
  //       path: '/sprm/purchase-requisition-creation/price-list',
  //       models: [],
  //       component: () => import('../routes/PriceCompare'),
  //       FilterSupplier: true,
  //     },
  //     {
  //       // authorized: true,
  //       // title: '批量导入',
  //       path: '/sprm/purchase-requisition-creation/data-import/:code',
  //       component: () => import('../routes/himp/CommentImport'),
  //       models: [],
  //     },
  //   ],
  // },
  {
    path: '/sprm/draw-info',
    models: [],
    component: () => import('../routes/DrawInfo'),
    authorized: true,
  },
  {
    path: '/sprm/project-workspace',
    models: [],
    components: [
      {
        path: '/sprm/project-workspace/list',
        models: [],
        component: () => import('../routes/ProjectSpace'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/project-workspace/edit-detail/new',
        models: [],
        component: () => import('../routes/ProjectSpace/EditDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/project-workspace/edit-detail/:id',
        models: [],
        component: () => import('../routes/ProjectSpace/EditDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/project-workspace/read-detail/:id',
        models: [],
        component: () => import('../routes/ProjectSpace/ReadDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/project-workspace/update-detail/:id',
        models: [],
        component: () => import('../routes/ProjectSpace/ChangeDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/project-workspace/update-read-detail/:id',
        models: [],
        component: () => import('../routes/ProjectSpace/ChangeReadDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sprm/project-workspace/other/:id/:projectReqHeaderId',
        models: [],
        component: () => import('../routes/ProjectSpace/ActionDetail'),
        FilterSupplier: true,
      },
    ],
    authorized: true,
  },
  {
    authorized: true,
    path: '/pub/sprm/project-workspace/read-detail/:id',
    models: [],
    component: () => import('../routes/ProjectSpace/ReadDetail'),
  },
  {
    path: '/pub/sprm/project-workspace/other-detail/:id/:projectReqHeaderId',
    models: [],
    component: () => import('../routes/ProjectSpace/ActionDetail'),
    authorized: true,
  },
  {
    path: '/pub/sprm/project-workspace/update-read-detail/:id/',
    models: [],
    component: () => import('../routes/ProjectSpace/ChangeReadDetail'),
    authorized: true,
  },
  {
    path: '/sprm/product-image',
    models: [],
    component: () => import('../routes/ProductImage.js'),
  },
];
