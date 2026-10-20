module.exports = [
  {
    path: '/sodr/order-type',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-type/list',
        models: [() => import('../models/orderTypeOrg.js')],
        component: () => import('../routes/OrderType'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/send-order',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/send-order/list',
        models: [() => import('../models/sendOrder.js')],
        component: () => import('../routes/SendOrder'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/send-order/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        exact: true, // react-router精准匹配
        path: '/sodr/send-order/detail/:id',
        models: [() => import('../models/sendOrder.js')],
        component: () => import('../routes/SendOrder/NewDetail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/received-order',
    models: [],
    components: [
      {
        path: '/sodr/received-order/list',
        models: [() => import('../models/receivedOrder.js')],
        component: () => import('../routes/ReceivedOrder'),
      },
      {
        path: '/sodr/received-order/detail/:id',
        models: [
          () => import('../models/receivedOrder.js'),
          () => import('../models/quotePurchaseRequisition.js'),
        ],
        component: () => import('../routes/ReceivedOrder/Detail'),
      },
    ],
  },
  {
    path: '/sodr/confirm-order',
    models: [],
    components: [
      {
        path: '/sodr/confirm-order/list',
        models: [() => import('../models/confirmOrder.js')],
        component: () => import('../routes/ConfirmOrder'),
      },
      {
        path: '/sodr/confirm-order/detail/:id',
        models: [
          () => import('../models/confirmOrder.js'),
          () => import('../models/orderSign.js'),
          () => import('../models/quotePurchaseRequisition.js'),
        ],
        component: () => import('../routes/ConfirmOrder/Detail'),
      },
    ],
  },
  {
    path: '/sodr/delivery-date-review',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/delivery-date-review/list',
        models: [() => import('../models/deliveryDateReview.js')],
        component: () => import('../routes/DeliveryDateReview'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/delivery-date-review/detail/:id',
        models: [() => import('../models/deliveryDateReview.js')],
        component: () => import('../routes/DeliveryDateReview/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/order-approval',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-approval/list',
        models: [() => import('../models/orderApproval.js')],
        component: () => import('../routes/OrderApproval'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-approval/detail/:poHeaderId',
        models: [() => import('../models/orderApproval.js')],
        component: () => import('../routes/OrderApproval/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/order-release',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-release/list',
        models: [() => import('../models/orderRelease.js')],
        component: () => import('../routes/OrderRelease'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-release/detail/:id',
        models: [() => import('../models/orderRelease.js')],
        component: () => import('../routes/OrderRelease/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/order-sign',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-sign/list',
        models: [() => import('../models/orderSign.js')],
        component: () => import('../routes/OrderSign'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-sign/detail/:id',
        models: [() => import('../models/orderSign.js')],
        component: () => import('../routes/OrderSign/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/write-off',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/write-off/list',
        models: [() => import('../models/writeOff.js')],
        component: () => import('../routes/WriteOff'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/write-off/detail',
        models: [() => import('../models/writeOff.js')],
        component: () => import('../routes/WriteOff/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sodr/order-cancel',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-cancel/list',
        models: [() => import('../models/orderCancel.js')],
        component: () => import('../routes/OrderCancel'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-cancel/detail/:id',
        models: [() => import('../models/sendOrder.js'), () => import('../models/orderCancel.js')],
        component: () => import('../routes/SendOrder/NewDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-cancel/order-change/:id',
        models: [
          () => import('../models/orderCancel.js'),
          () => import('../models/quotePurchaseRequisition.js'),
        ],
        component: () => import('../routes/OrderCancel/NewOrderChange'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-cancel/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  {
    path: '/sodr/purchase-order-maintain',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/purchase-order-maintain/list',
        models: [
          () => import('../models/orderMaintenanceEntry.js'),
          () => import('../models/quotePurchaseRequisition.js'),
        ],
        component: () => import('../routes/OrderMaintenanceEntry'),
        FilterSupplier: true,
      },
      // purchase-order-maintain/quote-purchase-requisition/list
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/list',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () => import('../routes/QuotePurchaseRequisition/NewPurchasingRequisition'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/detail/:id',
        models: [() => import('../models/sprm/purchaseRequisitionInquiry.js')],
        component: () => import('../routes/sprm/PurchaseRequisitionInquiry/NotErpDetail'),
        FilterSupplier: true,
      },
      // 按行引用采购申请详情页-目录化
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () =>
          import('../routes/QuotePurchaseRequisition/PurchasingRequisition/CatDetail'),
        FilterSupplier: true,
      },
      // 新-引用采购协议详情页
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/purchase-agreement',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () => import('../routes/QuotePurchaseRequisition/NewPurchaseAgreement/Detail'),
        FilterSupplier: true,
      },
      // 协议转订单详情页-tab分页页面
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/tab-purchase-agreement',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () =>
          import('../routes/QuotePurchaseRequisition/PurchaseAgreement/CombinedBillDetail'),
        FilterSupplier: true,
      },
      // 新版本按行引用采购申请详情页-SRM-ERP——SHOP
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () => import('../routes/QuotePurchaseRequisition/PurchasingRequisition/Detail'),
        FilterSupplier: true,
      },
      // 新版本按行引用采购申请详情页-tab分页页面-SRM-ERP——SHOP
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () =>
          import('../routes/QuotePurchaseRequisition/PurchasingRequisition/CombinedBillDetail'),
        FilterSupplier: true,
      },
      // 引用采购申请-电商采购申请
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () =>
          import('../routes/QuotePurchaseRequisition/PurchasingRequisition/ElectricityDetail'),
        FilterSupplier: true,
      },
      // 手工创建订单
      {
        path: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () => import('../routes/QuotePurchaseRequisition/ManuallyCreate'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/line-creation/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
      // 寻源转订单
      {
        path: '/sodr/purchase-order-maintain/source-from-requisition/list',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () => import('../routes/QuotePurchaseRequisition/NewSearchForTheSource'),
        FilterSupplier: true,
      },
      // 寻源转订单详情页-tab分页页面
      {
        path: '/sodr/purchase-order-maintain/source-from-requisition/tab-line-newCreation',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () =>
          import('../routes/QuotePurchaseRequisition/SearchForTheSource/CombinedBillDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/source-from-requisition/detail/:id',
        models: [() => import('../models/quotePurchaseRequisition.js')],
        component: () => import('../routes/QuotePurchaseRequisition/SearchForTheSource/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/:bidId',
        models: [() => import('../models/sbid/bidEventQuery.js')],
        component: () => import('../routes/sbid/BidEventQuery/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/source-from-requisition/query-rfq/:rfxId',
        models: [
          () => import('../models/ssrc/queryRfq.js'),
          () => import('../models/ssrc/inquiryHall.js'),
          () => import('../models/ssrc/supplierQuotation.js'),
          () => import('../models/ssrc/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/QueryRfq/Detail'),
        // authorized: true,
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/purchase/list',
        models: [() => import('../models/orderMaintenanceEntry.js')],
        component: () => import('../routes/QuotePurchaseRequisition/PurchaseAgreement'),
        // authorized: true,
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/purchase/detail',
        models: [
          () => import('../models/spcm/purchaseContractView.js'),
          () => import('../models/spcm/contractCommon.js'),
          () => import('../models/spcm/editorOnline.js'),
        ],
        component: () => import('../routes/spcm/PurchaseContractView/Detail'),
        // authorized: true,
        FilterSupplier: true,
      },
      {
        path: '/sodr/purchase-order-maintain/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 计划单创建/维护
  {
    path: '/sodr/plan-sheet',
    models: [],
    components: [
      {
        path: '/sodr/plan-sheet/list',
        models: [
          () => import('../models/planSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheet'),
      },
      {
        path: '/sodr/plan-sheet/detail/:id',
        models: [
          () => import('../models/planSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheet/Detail'),
      },
      {
        path: '/sodr/plan-sheet/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 计划单审批
  {
    path: '/sodr/plan-sheet-approved',
    models: [],
    components: [
      {
        path: '/sodr/plan-sheet-approved/list',
        models: [
          () => import('../models/planSheetApproved.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheetApproved'),
      },
      {
        path: '/sodr/plan-sheet-approved/detail/:id',
        models: [
          () => import('../models/planSheetApproved.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheetApproved/Detail'),
      },
    ],
  },
  // 计划单确认
  {
    path: '/sodr/plan-sheet-confirm',
    models: [],
    components: [
      {
        path: '/sodr/plan-sheet-confirm/list',
        models: [
          () => import('../models/planSheetConfirm.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheetConfirm'),
      },
      {
        path: '/sodr/plan-sheet-confirm/detail/:id',
        models: [
          () => import('../models/planSheetConfirm.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheetConfirm/Detail'),
      },
    ],
  },
  // 我发出的计划单
  {
    path: '/sodr/my-plan-sheet',
    models: [],
    components: [
      {
        path: '/sodr/my-plan-sheet/list',
        models: [
          () => import('../models/myPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyPlanSheet'),
      },
      {
        path: '/sodr/my-plan-sheet/detail/:id',
        models: [
          () => import('../models/myPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyPlanSheet/Detail'),
      },
    ],
  },
  // 我收到的计划单
  {
    path: '/sodr/my-received-plan-sheet',
    models: [],
    components: [
      {
        path: '/sodr/my-received-plan-sheet/list',
        models: [
          () => import('../models/myReceivedPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyReceivedPlanSheet'),
      },
      {
        path: '/sodr/my-received-plan-sheet/detail/:id',
        models: [
          () => import('../models/myReceivedPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyReceivedPlanSheet/Detail'),
      },
    ],
  },
  // 新版排程单创建/更新
  {
    path: '/sodr/schedule-sheet',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/schedule-sheet/list',
        models: [
          () => import('../models/scheduleSheet.js'),
          () => import('../models/scheduleSheetCommon.js'),
        ],
        component: () => import('../routes/ScheduleSheet'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/schedule-sheet/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  // 工作流嵌入计划排程审批
  {
    path: '/pub/sodr/schedule-sheet/detail/:planId',
    models: [
      () => import('../models/scheduleSheet.js'),
      () => import('../models/scheduleSheetCommon.js'),
    ],
    component: () => import('../routes/ScheduleSheet/WorlkList'),
    authorized: true,
  },
  // 新版排程单确认
  {
    path: '/sodr/schedule-sheet-confirm',
    models: [],
    components: [
      {
        path: '/sodr/schedule-sheet-confirm/list',
        models: [
          () => import('../models/scheduleSheetConfirm.js'),
          () => import('../models/scheduleSheetCommon.js'),
        ],
        component: () => import('../routes/ScheduleSheetConfirm'),
      },
    ],
  },
  // 新版供应商排程单创建/更新
  {
    path: '/sodr/supplier-schedule-sheet',
    models: [],
    components: [
      {
        path: '/sodr/supplier-schedule-sheet/list',
        models: [
          () => import('../models/supplierScheduleSheet.js'),
          () => import('../models/scheduleSheetCommon.js'),
        ],
        component: () => import('../routes/SupplierScheduleSheet'),
      },
      {
        path: '/sodr/supplier-schedule-sheet/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 新版采购商排程单确认
  {
    path: '/sodr/purchase-schedule-sheet-confirm',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/purchase-schedule-sheet-confirm/list',
        models: [
          () => import('../models/purchaseScheduleSheetConfirm.js'),
          () => import('../models/scheduleSheetCommon.js'),
        ],
        component: () => import('../routes/PurchaseScheduleSheetConfirm'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * 工作流嵌入订单审批详情页面
   */
  {
    path: '/pub/sodr/order-approval/detail/:poHeaderId',
    models: [() => import('../models/orderApproval.js')],
    component: () => import('../routes/OrderApproval/Detail'),
    authorized: true,
  },
  {
    path: '/sodr/order-evaluation',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-evaluation/list',
        models: [() => import('../models/orderEvaluation.js')],
        component: () => import('../routes/OrderEvaluation'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/order-evaluation/detail/:id',
        models: [() => import('../models/orderEvaluation.js')],
        component: () => import('../routes/OrderEvaluation/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 需求预测
  {
    path: '/sodr/demand-forecast',
    FilterSupplier: true,
    models: [],
    components: [
      {
        path: '/sodr/demand-forecast/list',
        FilterSupplier: true,
        models: [
          () => import('../models/demandForecast.js'),
          () => import('../models/demandForecastDetail.js'),
        ],
        component: () => import('../routes/DemandForecast'),
      },
      {
        FilterSupplier: true,
        path: '/sodr/demand-forecast/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 预测单反馈
  {
    path: '/sodr/demand-forecast-feedback',
    models: [],
    components: [
      {
        path: '/sodr/demand-forecast-feedback/list',
        models: [
          () => import('../models/demandForecastFeedback.js'),
          () => import('../models/demandForecastDetail.js'),
        ],
        component: () => import('../routes/DemandForecastFeedback'),
      },
      {
        path: '/sodr/demand-forecast-feedback/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 采购订单跟踪报表
  {
    path: '/sodr/purchase-order-tracking',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/purchase-order-tracking/list',
        models: [() => import('../models/purchaseOrderTracking.js')],
        component: () => import('../routes/PurchaseOrderTracking'),
        FilterSupplier: true,
      },
    ],
  },
  // 订单归档同步外部系统路由
  {
    path: '/pub/sodr/send-order/detail/:id',
    models: [() => import('../models/sendOrder.js')],
    component: () => import('../routes/SendOrder/NewDetail'),
    authorized: true,
  },
  // 工作流嵌套路由
  {
    path: '/pub/sodr/received-order/detail/:id',
    models: [() => import('../models/receivedOrder.js')],
    component: () => import('../routes/ReceivedOrder/Detail'),
    authorized: true,
  },
  // 反馈单批量导入
  {
    path: '/sodr/feedback-template/data-import/:code',
    models: [],
    component: () => import('../routes/himp/CommentImport'),
    // authorized: true,
  },
  // 反馈模板定义-租户
  {
    path: '/sodr/feedback-template',
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/feedback-template/list',
        models: [],
        component: () => import('../routes/FeedbackTemplateDefinition'),
        FilterSupplier: true,
      },
      {
        path: '/sodr/feedback-template/detail/:id',
        models: [],
        component: () => import('../routes/FeedbackTemplateDefinition/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 反馈模板定义-平台
  {
    path: '/sodr/feedback-template-platform',
    components: [
      {
        path: '/sodr/feedback-template-platform/list',
        models: [],
        component: () => import('../routes/FeedbackTemplateDefinition'),
      },
      {
        path: '/sodr/feedback-template-platform/detail/:id',
        models: [],
        component: () => import('../routes/FeedbackTemplateDefinition/Detail'),
      },
    ],
  },
  // 反馈来源服务定义-租户
  {
    path: '/sodr/feedback-source-service',
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/feedback-source-service/list',
        models: [],
        component: () => import('../routes/FeedbackSourceService'),
        FilterSupplier: true,
      },
    ],
  },
  // 反馈来源服务定义-平台
  {
    path: '/sodr/feedback-source-service-site',
    components: [
      {
        path: '/sodr/feedback-source-service-site/list',
        models: [],
        component: () => import('../routes/FeedbackSourceService'),
      },
    ],
  },
  // 反馈单批量导入
  {
    path: '/sodr/feedback-sheet/:templateCode/comment-import',
    models: [],
    component: () => import('../routes/FeedbackSheetBatchCreate'),
    authorized: true,
  },
  // 采反馈单
  {
    path: '/sodr/feedback-sheet/:templateCode',
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/feedback-sheet/:templateCode/list',
        component: () => import('../routes/FeedbackSheet'),
        models: [() => import('../models/feedbackSheet')],
        FilterSupplier: true,
      },
      // 反馈单批量导入
      //  {
      //   path: '/sodr/feedback-sheet/:templateCode/comment-import',
      //   models: [],
      //   component: () => import('../routes/FeedbackSheetBatchCreate'),
      //   FilterSupplier: true,
      // },
    ],
  },
  // 供反馈单
  {
    path: '/sodr/feedback-sheet-supplier/:templateCode',
    components: [
      {
        path: '/sodr/feedback-sheet-supplier/:templateCode/list',
        component: () => import('../routes/FeedbackSheet'),
        models: [() => import('../models/feedbackSheet')],
      },
      // 反馈单批量导入
      //  {
      //   path: '/sodr/feedback-sheet-supplier/:templateCode/comment-import',
      //   models: [],
      //   component: () => import('../routes/FeedbackSheetBatchCreate'),
      // },
    ],
  },
  // 采购订单工作台
  {
    path: '/sodr/order-workspace',
    FilterSupplier: true,
    components: [
      {
        path: '/sodr/order-workspace/list',
        models: [() => import('../models/orderWorkSpace.js')],
        component: () => import('../routes/OrderWorkspace'),
        FilterSupplier: true,
      },
      {
        // 批量导入
        path: '/sodr/order-workspace/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
      },
      // {
      //   // 引用单据创建
      //   path: '/sodr/order-workspace/reference-document/list',
      //   models: [() => import('../models/orderWorkSpace.js')],
      //   component: () => import('../routes/OrderWorkspace/ReferenceDocument'),
      //   FilterSupplier: true,
      // },
      {
        // 手工创建明细页
        path: '/sodr/order-workspace/detail/created-manually/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Maintenance/CreatedManually'),
        FilterSupplier: true,
      },
      {
        // SRM申请明细页
        path: '/sodr/order-workspace/detail/purchase-request/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Maintenance/PurchaseRequest'),
        FilterSupplier: true,
      },
      {
        // 目录化申请明细页
        path: '/sodr/order-workspace/detail/catalogue-request/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Maintenance/Catalogue'),
        FilterSupplier: true,
      },
      {
        // 电商申请明细页
        path: '/sodr/order-workspace/detail/ecommerce-request/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Maintenance/Ecommerce'),
        FilterSupplier: true,
      },
      {
        // 采购协议明细页
        path: '/sodr/order-workspace/detail/purchase-agreement/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Maintenance/PurchaseAgreement'),
        FilterSupplier: true,
      },
      {
        // 寻源结果明细页
        path: '/sodr/order-workspace/detail/sourcing-results/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Maintenance/SourcingResults'),
        FilterSupplier: true,
      },
      {
        // 待审批明细页
        path: '/sodr/order-workspace/detail/under-approval/:poHeaderId',
        component: () => import('../routes/OrderWorkspace/Detail/OrderApproval'),
        FilterSupplier: true,
      },
      {
        // 待发布明细页
        path: '/sodr/order-workspace/detail/to-be-released/:id',
        component: () => import('../routes/OrderWorkspace/Detail/ToBeReleased'),
        FilterSupplier: true,
      },
      {
        // 待签署明细页
        path: '/sodr/order-workspace/detail/to-be-signed/:id',
        models: [() => import('../models/orderSign.js')],
        component: () => import('../routes/OrderWorkspace/Detail/ToBeSigned'),
        FilterSupplier: true,
      },
      {
        // 反馈审核中明细页
        path: '/sodr/order-workspace/detail/feedback-under-review/:id',
        component: () => import('../routes/OrderWorkspace/Detail/FeedbackUnderReview'),
        FilterSupplier: true,
      },
      {
        // "全部"明细页
        path: '/sodr/order-workspace/detail/all-orders/:id',
        component: () => import('../routes/OrderWorkspace/Detail/AllOrders'),
        FilterSupplier: true,
      },
      {
        // 取消明细页
        path: '/sodr/order-workspace/detail/cancel/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Cancel'),
        FilterSupplier: true,
      },
      {
        // 变更明细页
        path: '/sodr/order-workspace/detail/change/:id',
        component: () => import('../routes/OrderWorkspace/Detail/Change'),
        FilterSupplier: true,
      },
      {
        // 电商变更明细页
        path: '/sodr/order-workspace/detail/e-commerce-change/:id',
        component: () => import('../routes/OrderWorkspace/Detail/EcommerceChange'),
        FilterSupplier: true,
      },
    ],
  },
  // 列表pub页
  {
    path: '/pub/sodr/order-workspace/list',
    models: [() => import('../models/orderWorkSpace.js')],
    component: () => import('../routes/OrderWorkspace'),
    authorized: true,
  },
  {
    // 全部明细pub页
    path: '/pub/sodr/order-workspace/detail/all-orders/:id',
    component: () => import('../routes/OrderWorkspace/Detail/AllOrders'),
    authorized: true,
  },
  {
    // 待审批明细页
    path: '/pub/sodr/order-workspace/detail/under-approval/:poHeaderId',
    component: () => import('../routes/OrderWorkspace/Detail/OrderApproval'),
    authorized: true,
  },
  {
    // 引用单据创建
    path: '/sodr/order-workspace/reference-document/list',
    models: [() => import('../models/orderWorkSpace.js')],
    component: () => import('../routes/OrderWorkspace/ReferenceDocument'),
  },
  // 我收到的订单pub
  {
    path: '/pub/sodr/received-order/detail/:id',
    models: [
      () => import('../models/receivedOrder.js'),
      () => import('../models/quotePurchaseRequisition.js'),
    ],
    component: () => import('../routes/ReceivedOrder/Detail'),
    authorized: true,
  },
];
