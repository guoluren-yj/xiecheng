module.exports = [
  {
    path: '/sinv/supplier-collaborative-workbench',
    models: [],
    components: [
      {
        path: '/sinv/supplier-collaborative-workbench/list',
        models: [],
        component: () => import('../routes/PurchaseCollaborativeWorkbench/supplierIndex'),
      },
      {
        path: '/sinv/supplier-collaborative-workbench/:invHeaderId',
        models: [],
        component: () => import('../routes/PurchaseCollaborativeWorkbench/Detail'),
      },
    ],
  },
  {
    path: '/sinv/inventoryManageConfig',
    components: [
      {
        path: '/sinv/inventoryManageConfig/list',
        component: () => import('../routes/InventoryManageConfig'),
      },
      {
        path: '/sinv/inventoryManageConfig/detail',
        component: () => import('../routes/InventoryManageConfig/Detail/index.tsx'),
      },
    ],
  },
  {
    path: '/sinv/purchaser-collaborative-workbench',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/purchaser-collaborative-workbench/list',
        models: [],
        component: () => import('../routes/PurchaseCollaborativeWorkbench/purchaseIndex'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/purchaser-collaborative-workbench/:invHeaderId',
        models: [],
        component: () => import('../routes/PurchaseCollaborativeWorkbench/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sinv/purchaser-inventory-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/purchaser-inventory-query/list',
        component: () => import('../routes/PurchaseInventoryManageQuery'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sinv/supplier-inventory-query',
    models: [],
    components: [
      {
        path: '/sinv/supplier-inventory-query/list',
        component: () => import('../routes/SupplierInventoryManageQuery'),
      },
    ],
  },
  {
    path: '/sinv/supplier-delivery',
    models: [],
    components: [
      {
        path: '/sinv/supplier-delivery/list',
        models: [() => import('../models/supplierDelivery.js')],
        component: () => import('../routes/SupplierDelivery/C7nSupplierDelivery'),
      },
      {
        path: '/sinv/supplier-delivery/c7nDetail/:asnHeaderId',
        component: () => import('../routes/SupplierDelivery/C7nSupplierDelivery/Detail'),
      },
      {
        path: '/sinv/supplier-delivery/detail/:asnHeaderId',
        models: [
          () => import('../models/supplierDelivery.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/SupplierDelivery/Detail'),
      },
    ],
  },
  {
    path: '/sinv/delivery-approved',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/delivery-approved/list',
        models: [
          () => import('../models/deliveryApproved.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryApproved'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/delivery-approved/detail/:id',
        models: [
          () => import('../models/deliveryApproved.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryApproved/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sinv/delivery-review',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/delivery-review/list',
        models: [
          () => import('../models/deliveryReview.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryReview'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/delivery-review/detail/:id',
        models: [
          () => import('../models/deliveryReview.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryReview/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sinv/delivery-cancelled',
    models: [],
    components: [
      {
        path: '/sinv/delivery-cancelled/list',
        models: [
          () => import('../models/deliveryCancelled.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryCancelled'),
      },
      {
        path: '/sinv/delivery-cancelled/detail/:id',
        models: [
          () => import('../models/deliveryCancelled.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryCancelled/Detail'),
      },
    ],
  },
  {
    path: '/sinv/delivery-closed',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/delivery-closed/list',
        models: [
          () => import('../models/deliveryClosed.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryClosed'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/delivery-closed/detail/:id',
        models: [
          () => import('../models/deliveryClosed.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/DeliveryClosed/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sinv/supplier-receipt-record',
    models: [() => import('../models/supplierReceiptRecord.js')],
    component: () => import('../routes/SupplierReceiptRecord'),
  },
  {
    path: '/sinv/purchase-receipt-record',
    models: [() => import('../models/purchaseReceiptRecord.js')],
    component: () => import('../routes/PurchaseReceiptRecord'),
    FilterSupplier: true,
  },
  {
    path: '/sinv/purchaser-delivery',
    models: [],
    FilterSupplier: true,
    components: [
      // {
      //   path: '/sinv/purchaser-delivery/list',
      //   models: [() => import('../models/purchaserDelivery.js')],
      //   component: () => import('../routes/PurchaserDelivery'),
      //   FilterSupplier: true,
      // },
      // 新版c7n
      {
        path: '/sinv/purchaser-delivery/list',
        models: [() => import('../models/purchaserDelivery.js')],
        component: () => import('../routes/PurchaserDelivery/C7nPages'),
        FilterSupplier: true,
      },
      // H0 送货单明细
      {
        path: '/sinv/purchaser-delivery/detail/:asnHeaderId',
        models: [
          () => import('../models/purchaserDelivery.js'),
          () => import('../models/sinvCommon.js'),
        ],
        component: () => import('../routes/PurchaserDelivery/Detail'),
        FilterSupplier: true,
      },
      // C7N 送货单明细
      {
        path: '/sinv/purchaser-delivery/new-detail/:asnHeaderId',
        component: () => import('../routes/PurchaserDelivery/C7nPages/NewDetail'),
      },
    ],
  },
  {
    path: '/sinv/delivery-creation',
    models: [],
    components: [
      // {
      //   path: '/sinv/delivery-creation/list',
      //   models: [() => import('../models/deliveryCreation.js')],
      //   component: () => import('../routes/DeliveryCreation/hzeroIndex'),
      // },

      {
        path: '/sinv/delivery-creation/list',
        models: [() => import('../models/deliveryCreation.js')],
        component: () => import('../routes/DeliveryCreation/index'),
      },

      // 老明细
      {
        path: '/sinv/delivery-creation/detail/:id',
        models: [() => import('../models/deliveryCreation.js')],
        component: () => import('../routes/DeliveryCreation/Detail'),
      },
      // 新明细
      {
        path: '/sinv/delivery-creation/newDetail/:id',
        models: [() => import('../models/deliveryCreation.js')],
        component: () => import('../routes/DeliveryCreation/NewDetail'),
      },
      // 老明细-并单
      {
        path: '/sinv/delivery-creation/detailTable',
        models: [() => import('../models/deliveryCreation.js')],
        component: () => import('../routes/DeliveryCreation/DetailTable'),
      },
      // 新明细-并单
      {
        path: '/sinv/delivery-creation/newDetailTable',
        models: [() => import('../models/deliveryCreation.js')],
        component: () => import('../routes/DeliveryCreation/NewDetailTable'),
      },
      {
        path: '/sinv/delivery-creation/import-creation/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  {
    path: '/sinv/purchase-reception',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/purchase-reception/list',
        models: [() => import('../models/purchaseReception.js')],
        component: () => import('../routes/PurchaseReception'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/purchase-reception/detail/:ids',
        models: [() => import('../models/purchaseReception.js')],
        component: () => import('../routes/PurchaseReception/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 验收单类型维护
  {
    path: '/sinv/acceptance-sheet-type',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/acceptance-sheet-type/list',
        models: [() => import('../models/acceptanceSheetType.js')],
        component: () => import('../routes/AcceptanceSheetType'),
        FilterSupplier: true,
      },
    ],
  },
  // 验收单创建
  {
    path: '/sinv/acceptance-sheet-create',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/acceptance-sheet-create/list',
        models: [() => import('../models/acceptanceSheetCreate.js')],
        component: () => import('../routes/AcceptanceSheetCreate'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/acceptance-sheet-create/detail',
        models: [() => import('../models/acceptanceSheetCreate.js')],
        component: () => import('../routes/AcceptanceSheetCreate/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/acceptance-sheet-create/noDocument/detail/:id',
        models: [() => import('../models/acceptanceSheetCreate.js')],
        component: () => import('../routes/AcceptanceSheetCreate/DetailNoDocumentSource'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/acceptance-sheet-create/agreement/detail/:id',
        models: [() => import('../models/acceptanceSheetCreate.js')],
        component: () => import('../routes/AcceptanceSheetCreate/DetailAgreement'),
        FilterSupplier: true,
      },
    ],
  },
  // 验收单审批
  {
    path: '/sinv/acceptance-sheet-approved',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/acceptance-sheet-approved/list',
        models: [
          () => import('../models/acceptanceSheetApproved.js'),
          () => import('../models/acceptanceSheetQuery.js'),
        ],
        component: () => import('../routes/AcceptanceSheetApproved'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/acceptance-sheet-approved/detail/:id/:sourceCode',
        models: [() => import('../models/acceptanceSheetApproved.js')],
        component: () => import('../routes/AcceptanceSheetApproved/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 验收单查询
  {
    path: '/sinv/acceptance-sheet-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/acceptance-sheet-query/list',
        models: [() => import('../models/acceptanceSheetQuery.js')],
        component: () => import('../routes/AcceptanceSheetQuery'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/acceptance-sheet-query/detail/:id/:sourceCode',
        models: [() => import('../models/acceptanceSheetQuery.js')],
        component: () => import('../routes/AcceptanceSheetQuery/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/pub/sinv/acceptance-sheet-query/detail/:id/:sourceCode',
        key: '/pub/sinv/acceptance-sheet-query/detail/:id/:sourceCode',
        models: [() => import('../models/acceptanceSheetQuery.js')],
        component: () => import('../routes/AcceptanceSheetQuery/Detail'),
        authorized: true,
        FilterSupplier: true,
      },
    ],
  },
  // 我的库存录入(供应商)
  {
    path: '/sinv/myInventory',
    models: [],
    components: [
      {
        path: '/sinv/myInventory/list',
        models: [() => import('../models/myInventory.js')],
        component: () => import('../routes/MyInventory'),
      },
      {
        path: '/sinv/myInventory/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 我的库存记录查询(供应商)
  {
    path: '/sinv/myInventoryInquiry',
    models: [],
    components: [
      {
        path: '/sinv/myInventoryInquiry/list',
        models: [() => import('../models/myInventory.js')],
        component: () => import('../routes/MyInventoryInquiry'),
      },
    ],
  },
  // 供应商库存查询(采购方)
  {
    path: '/sinv/supplierInventory',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/supplierInventory/list',
        models: [() => import('../models/supplierInventory.js')],
        component: () => import('../routes/SupplierInventory'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商库存记录查询(采购方)
  {
    path: '/sinv/supplierInventoryInquiry',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/supplierInventoryInquiry/list',
        models: [() => import('../models/supplierInventory.js')],
        component: () => import('../routes/SupplierInventoryInquiry'),
        FilterSupplier: true,
      },
    ],
  },
  // 外协&寄售库存查询(采购方)
  {
    path: '/sinv/outsourceConsignInventoryInquiry',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/outsourceConsignInventoryInquiry/list',
        models: [() => import('../models/inventoryInquiry.js')],
        component: () => import('../routes/InventoryInquiry'),
        FilterSupplier: true,
      },
    ],
  },
  // 外协&寄售库存查询(供应商)
  {
    path: '/sinv/outsourceConsignInventoryInquiry-vendor',
    models: [],
    components: [
      {
        path: '/sinv/outsourceConsignInventoryInquiry-vendor/list',
        models: [() => import('../models/inventoryInquiry.js')],
        component: () => import('../routes/InventoryInquiryVendor'),
      },
    ],
  },
  // 标签管理配置
  {
    path: '/sinv/label-management',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/label-management/list',
        models: [],
        component: () => import('../routes/LabelManagement'),
        FilterSupplier: true,
      },
    ],
  },
  // 销售方标签创建/查询
  {
    path: '/sinv/box-label-creation',
    models: [],
    components: [
      {
        path: '/sinv/box-label-creation/list',
        models: [() => import('../models/boxLabelCreation.js')],
        component: () => import('../routes/BoxLabelCreation'),
      },
      {
        path: '/sinv/box-label-creation/detail/:labelHeaderId',
        models: [() => import('../models/boxLabelCreation.js')],
        component: () => import('../routes/BoxLabelCreation/Detail'),
      },
    ],
  },
  // 采购方标签创建/查询
  {
    path: '/sinv/purchase-box-label-creation',
    models: [],
    components: [
      {
        path: '/sinv/purchase-box-label-creation/list',
        models: [() => import('../models/boxLabelCreation.js')],
        component: () => import('../routes/PurchaseBoxLabelCreation'),
      },
      {
        path: '/sinv/purchase-box-label-creation/detail/:labelHeaderId',
        models: [() => import('../models/boxLabelCreation.js')],
        component: () => import('../routes/PurchaseBoxLabelCreation/Detail'),
      },
    ],
  },
  // 收货执行
  {
    path: '/sinv/receipt-execution',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/receipt-execution/list',
        models: [],
        component: () => import('../routes/ReceiptExecution'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-execution/detail/:id',
        models: [],
        component: () => import('../routes/ReceiptExecution/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-execution/return-detail/:id',
        models: [],
        component: () => import('../routes/ReceiptExecution/ReturnDetail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/pub/sinv/delivery-approved/detail/:id',
    models: [
      () => import('../models/deliveryApproved.js'),
      () => import('../models/sinvCommon.js'),
    ],
    component: () => import('../routes/DeliveryApproved/Detail'),
    authorized: true,
  },

  // 1.21.0迭代补缺被删除的代码
  {
    path: '/pub/sinv/receipt-execution/detail/:id',
    models: [],
    component: () => import('../routes/ReceiptExecution/Detail'),
    authorized: true,
  },

  // 外部系统进收货单据
  {
    path: '/pub/sinv/receipt-workbench/cdetail/:rcvTrxHeaderId',
    models: [],
    component: () => import('../routes/ReceipWorkbench/Detail'),
    authorized: true,
  },

  // 工作流收货单据
  {
    path: '/pub/sinv/receipt-workbench/detail/:id',
    models: [],
    component: () => import('../routes/ReceipWorkbench//Detail'),
    authorized: true,
  },

  {
    path: '/pub/sinv/receipt-workbench/return-detail/:id',
    models: [],
    component: () => import('../routes/ReceipWorkbench/ReturnDetail'),
    authorized: true,
  },

  {
    path: '/pub/sinv/receipt-workbench-works/detail/:id',
    models: [],
    component: () => import('../routes/ReceipWorkbenchWorks/index'),
    authorized: true,
  },
  // 新版单据样式工作流
  {
    path: '/pub/sinv/receipt-workbench-new-works/detail/:rcvTrxHeaderId',
    models: [],
    component: () => import('../routes/ReceipWorkbenchNewFlow/index'),
    authorized: true,
  },

  {
    path: '/sinv/receipt-workbenchs/detail/:id',
    models: [],
    component: () => import('../routes/ReceipWorkbench/Detail'),
    authorized: true,
    title: '收货工作台',
  },
  {
    path: '/sinv/receipt-workbenchs/return-detail/:id',
    models: [],
    component: () => import('../routes/ReceipWorkbench/ReturnDetail'),
    authorized: true,
    title: '收货工作台',
  },

  // 收货工作台
  {
    path: '/sinv/receipt-workbench',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/receipt-workbench/list',
        models: [],
        component: () => import('../routes/ReceipWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-workbench/detail/:id',
        models: [],
        component: () => import('../routes/ReceipWorkbench/Detail/index.js'),
        // component: () => import('../routes/ReceipWorkbenchNewFlow/index'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-workbench/merge-detail',
        models: [],
        component: () => import('../routes/ReceipWorkbench/MergeDetail/index.js'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-workbench/return-detail/:id',
        models: [],
        component: () => import('../routes/ReceipWorkbench/ReturnDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-workbench/merge-return-detail',
        models: [],
        component: () => import('../routes/ReceipWorkbench/ReturnDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sinv/receipt-workbench/execution-record-detail',
        models: [],
        component: () => import('@/routes/components/ExecutionRecordDetail'),
        FilterSupplier: true,
      },
    ],
  },

  // 供应商收货工作台
  {
    path: '/sinv/supplier-receipt-workbench',
    models: [],
    components: [
      {
        path: '/sinv/supplier-receipt-workbench/list',
        models: [],
        component: () => import('../routes/SupplierReceiptWorkbench'),
      },
      {
        path: '/sinv/supplier-receipt-workbench/detail/:id',
        models: [],
        component: () => import('../routes/SupplierReceiptWorkbench/Detail/index.js'),
      },
      {
        path: '/sinv/supplier-receipt-workbench/merge-detail',
        models: [],
        component: () => import('../routes/SupplierReceiptWorkbench/MergeDetail/index.js'),
      },
      {
        path: '/sinv/supplier-receipt-workbench/return-detail/:id',
        models: [],
        component: () => import('../routes/SupplierReceiptWorkbench/ReturnDetail'),
      },
      {
        path: '/sinv/supplier-receipt-workbench/merge-return-detail',
        models: [],
        component: () => import('../routes/SupplierReceiptWorkbench/ReturnDetail'),
      },
      {
        path: '/sinv/supplier-receipt-workbench/execution-record-detail',
        models: [],
        component: () => import('../routes/components/ExecutionRecordDetail'),
      },
    ],
  },

  {
    path: '/pub/sinv/supplier-receipt-workbench/detail/:id',
    models: [],
    component: () => import('../routes/SupplierReceiptWorkbench/Detail'),
    authorized: true,
  },

  {
    path: '/pub/sinv/supplier-receipt-workbench/return-detail/:id',
    models: [],
    component: () => import('../routes/SupplierReceiptWorkbench/ReturnDetail'),
    authorized: true,
  },

  // 链接弹框
  {
    path: '/sinv/link-modal',
    models: [],
    component: () => import('../routes/components/CustomModal'),
    authorized: true,
  },

  // 收货管理配置-新
  {
    path: '/sinv/receipt-manage-config',
    models: [() => import('../models/receiptManageConfig.js')],
    FilterSupplier: true,
    components: [
      {
        path: '/sinv/receipt-manage-config/list',
        models: [() => import('../models/receiptManageConfig.js')],
        component: () => import('../routes/NewReceiptManageConfig/index.tsx'),
        FilterSupplier: true,
        // authorized: true,
      },
      {
        path: '/sinv/receipt-manage-config/detail/:id',
        models: [() => import('../models/receiptManageConfig.js')],
        component: () => import('../routes/NewReceiptManageConfig/Detail/index.tsx'),
        FilterSupplier: true,
      },
    ],
  },
];
