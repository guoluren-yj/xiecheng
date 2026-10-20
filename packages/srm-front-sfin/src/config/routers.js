module.exports = [
  // 创建开票通知
  {
    path: '/sfin/bill-create',
    models: [],
    components: [
      {
        path: '/sfin/bill-create/list', // 创建开票申请
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Create'),
      },
      {
        path: '/sfin/bill-create/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Create/NoConsignmentSale/Detail'),
      },
      {
        path: '/sfin/bill-create/detail-list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Create/NoConsignmentSale/BillCreateList'),
      },
    ],
  },
  // 审核开票申请单
  {
    FilterSupplier: true,
    path: '/sfin/bill-audit',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/bill-audit/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Audit'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/bill-audit/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Audit/Detail'),
      },
      {
        path: '/sfin/bill-audit/electronic-mall/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Audit/ElectronicMall'),
      },
    ],
  },
  // 我的采购账单
  {
    FilterSupplier: true,
    path: '/sfin/purchase-bill',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/purchase-bill/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Purchase'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/purchase-bill/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Purchase/Detail'),
      },
      {
        path: '/sfin/purchase-bill/electronic-mall/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Purchase/ElectronicMall'),
      },
    ],
  },

  // 同步采购账单
  {
    FilterSupplier: true,
    path: '/sfin/sync-purchase-bill',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/sync-purchase-bill/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Sync'),
      },
    ],
  },
  // 维护开票申请单
  {
    path: '/sfin/bill-maintain',
    models: [],
    components: [
      {
        path: '/sfin/bill-maintain/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Maintain'),
      },
      {
        path: '/sfin/bill-maintain/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Maintain/NoConsignment/Detail'),
      },
    ],
  },
  // 退回开票申请单
  {
    FilterSupplier: true,
    path: '/sfin/cancel-bill',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/cancel-bill/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Cancel'),
      },
    ],
  },
  // 我的销售账单
  {
    path: '/sfin/sales-bill',
    models: [],
    components: [
      {
        path: '/sfin/sales-bill/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Sales'),
      },
      {
        path: '/sfin/sales-bill/detail/:billHeaderId',
        models: [() => import('../models/bill.js'), () => import('../models/salesBill.js')],
        component: () => import('../routes/Bill/Sales/NonPerformance/Detail'),
      },
      {
        path: '/sfin/sales-bill/maintainDetail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Create/NoConsignmentSale/Detail'),
      },
      {
        path: '/sfin/sales-bill/electronic-mall/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/Bill/Sales/NonPerformance/ElectronicMall'),
      },
    ],
  },
  // 创建应收发票
  {
    path: '/sfin/invoice-create',
    models: [],
    components: [
      {
        path: '/sfin/invoice-create/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Create'),
      },
      {
        path: '/sfin/invoice-create/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Create/Detail'),
      },
      {
        path: '/sfin/invoice-create/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
      },
      {
        authorized: true,
        path: '/sfin/invoice-create/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
      {
        authorized: true,
        path: '/sfin/invoice-create/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        title: '电子发票查看',
        models: [() => import('../models/invoice.js')],
      },
      // 创建应收发票自动拆单规则
      {
        // FilterSupplier: true,
        // authorized: true,
        path: '/sfin/invoice-create/detail-list',
        component: () => import('../routes/Invoice/Create/DetailList'),
        models: [() => import('../models/invoice.js')],
      },
    ],
  },
  // 维护应收发票
  {
    path: '/sfin/invoice-create-purchaser',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sfin/invoice-create-purchaser/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/CreatePurchaser'),
        FilterSupplier: true,
      },
      {
        path: '/sfin/invoice-create-purchaser/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/CreatePurchaser/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sfin/invoice-create-purchaser/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
        FilterSupplier: true,
      },
      {
        authorized: true,
        path: '/sfin/invoice-create-purchaser/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        authorized: true,
        path: '/sfin/invoice-create-purchaser/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        title: '电子发票查看',
        models: [() => import('../models/invoice.js')],
        FilterSupplier: true,
      },
      // 创建应付发票自动拆单规则
      {
        FilterSupplier: true,
        path: '/sfin/invoice-create-purchaser/detail-list',
        component: () => import('../routes/Invoice/CreatePurchaser/DetailList'),
        models: [() => import('../models/invoice.js')],
      },
    ],
  },
  {
    path: '/sfin/invoice-update',
    models: [],
    components: [
      {
        path: '/sfin/invoice-update/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Update'),
      },
      {
        path: '/sfin/invoice-update/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Update/Detail'),
      },
      {
        path: '/sfin/invoice-update/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
      },
      {
        path: '/sfin/invoice-update/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        models: [() => import('../models/invoice.js')],
      },
    ],
  },
  // 我的应收发票
  {
    path: '/sfin/invoice-update-purchaser',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sfin/invoice-update-purchaser/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/UpdatePurchaser'),
        FilterSupplier: true,
      },
      {
        path: '/sfin/invoice-update-purchaser/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/UpdatePurchaser/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sfin/invoice-update-purchaser/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
        FilterSupplier: true,
      },
      {
        path: '/sfin/invoice-update-purchaser/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        models: [() => import('../models/invoice.js')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sfin/invoice-supplier',
    models: [],
    components: [
      {
        path: '/sfin/invoice-supplier/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Supplier'),
      },
      {
        path: '/sfin/invoice-supplier/detail/:supplierType/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Update/Detail'),
      },
      {
        path: '/sfin/invoice-supplier/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Supplier/Detail'),
      },
      {
        path: '/sfin/invoice-supplier/read-only-centralized-detail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js'), () => import('../models/invoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        path: '/sfin/invoice-supplier/read-only-followGoodsDetail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js'), () => import('../models/invoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
      {
        path: '/sfin/invoice-supplier/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
      },
      {
        path: '/sfin/invoice-supplier/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        models: [() => import('../models/invoice.js')],
      },
    ],
  },
  // 审核应付发票
  {
    FilterSupplier: true,
    path: '/sfin/invoice-approve',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/invoice-approve/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Approve'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-approve/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Approve/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-approve/read-only-centralized-detail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
    ],
  },
  // 复核应付发票
  {
    path: '/pub/sfin/invoice-approve/detail/:invoiceHeaderId',
    authorized: true,
    models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
    component: () => import('../routes/Invoice/Approve/Detail'),
  },
  {
    FilterSupplier: true,
    path: '/sfin/invoice-review',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/invoice-review/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Review'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-review/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Review/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-review/read-only-centralized-detail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-review/read-only-followGoodsDetail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
    ],
  },
  // 同步应付发票
  {
    FilterSupplier: true,
    path: '/sfin/invoice-sync',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/invoice-sync/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Sync'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-sync/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Sync/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-sync/read-only-centralized-detail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-sync/read-only-followGoodsDetail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
    ],
  },
  // 退回应付发票
  {
    FilterSupplier: true,
    path: '/sfin/invoice-return',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/invoice-return/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Return'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-return/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Return/Detail'),
      },
    ],
  },
  // 我的应付发票
  {
    FilterSupplier: true,
    path: '/sfin/invoice-summary',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/invoice-summary/list',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Summary'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-summary/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Summary/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-summary/read-only-centralized-detail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-summary/read-only-followGoodsDetail/:invoiceHeaderId',
        models: [
          () => import('../models/payableInvoice.js'),
          () => import('../models/invoice.js'),
          () => import('../models/bill.js'),
        ],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
    ],
  },
  {
    FilterSupplier: true,
    path: '/sfin/auto-account',
    models: [() => import('../models/autoAccount.js')],
    component: () => import('../routes/AutoAccount'),
  },
  // 创建应付发票申请
  {
    FilterSupplier: true,
    path: '/sfin/payable-invoice-apply',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-apply/list',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Apply'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-apply/centralizedDetail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-apply/followGoodsDetail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-apply/order-detail/:ecPoSubHeaderId',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/OrderDetail'),
      },
    ],
  },
  {
    FilterSupplier: true,
    path: '/sfin/payable-invoice-maintain',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-maintain/list',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Maintain'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-maintain/centralizedDetail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-maintain/read-only-centralized-detail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js'), () => import('../models/invoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/Centralized'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-maintain/followGoodsDetail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/payable-invoice-maintain/read-only-followGoodsDetail/:invoiceHeaderId',
        models: [() => import('../models/payableInvoice.js'), () => import('../models/invoice.js')],
        component: () => import('../routes/PayableInvoice/Apply/Detail/FollowGoods'),
      },
    ],
  },
  // 发票验真
  {
    FilterSupplier: true,
    path: '/sfin/invoice-verification',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/invoice-verification/list',
        models: [() => import('../models/invoiceVerification.js')],
        component: () => import('../routes/InvoiceVerification'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-verification/detail',
        models: [() => import('../models/invoiceVerification.js')],
        component: () => import('../routes/InvoiceVerification/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-verification/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
      {
        FilterSupplier: true,
        path: '/sfin/invoice-verification/summary/:invoiceHeaderId',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/InvoiceVerification/Summary'),
      },
    ],
  },
  // 进项发票池菜单
  {
    FilterSupplier: true,
    path: '/sfin/input-invoice',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/input-invoice/list',
        models: [() => import('../models/inputInvoice.js')],
        component: () => import('../routes/InputInvoice'),
      },
      // 跳转到非寄销发票明细
      {
        FilterSupplier: true,
        path: '/sfin/input-invoice/summary/:invoiceHeaderId',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/InvoiceVerification/Summary'),
      },
      // 跳转到电子发票显示页面
      {
        FilterSupplier: true,
        path: '/sfin/input-invoice/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        models: [() => import('../models/invoice.js')],
      },
      // 跳转到纸制发票显示页面
      {
        FilterSupplier: true,
        path: '/sfin/input-invoice/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
      },
    ],
  },
  // 销项发票池
  {
    path: '/sfin/output-invoice',
    models: [],
    components: [
      {
        path: '/sfin/output-invoice/list',
        models: [() => import('../models/outputInvoice.js')],
        component: () => import('../routes/OutputInvoice'),
      },
      {
        path: '/sfin/output-invoice/detail',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
      },
      {
        //
        path: '/sfin/output-invoice/supplier/detail/:invoiceHeaderId',
        models: [() => import('../models/invoice.js'), () => import('../models/bill.js')],
        component: () => import('../routes/Invoice/Supplier/Detail'),
      },
      // 跳转到电子发票显示页面
      {
        path: '/sfin/output-invoice/elcview',
        component: () => import('../routes/Invoice/Components/ElectronView'),
        models: [() => import('../models/invoice.js')],
      },
      // 跳转到纸制发票显示页面
      {
        path: '/sfin/output-invoice/view',
        models: [() => import('../models/invoice.js')],
        component: () => import('../routes/Invoice/Components/InvoiceView'),
      },
    ],
  },

  // 创建开票通知
  {
    FilterSupplier: true,
    path: '/sfin/create-invoice-notification',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/create-invoice-notification/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/CreateInvoiceNotification'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/create-invoice-notification/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/CreateInvoiceNotification/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/create-invoice-notification/detail-list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/CreateInvoiceNotification/DetailList'),
      },
    ],
  },
  // 维护开票通知
  {
    FilterSupplier: true,
    path: '/sfin/maintain-invoice-notification',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/maintain-invoice-notification/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/MaintainNotification'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/maintain-invoice-notification/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/MaintainNotification/Detail'),
      },
    ],
  },
  // 确认开票页面
  {
    path: '/sfin/confirm-invoice-notification',
    models: [],
    components: [
      {
        path: '/sfin/confirm-invoice-notification/list',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/ConfirmInvoiceNotification'),
      },
      {
        path: '/sfin/confirm-invoice-notification/detail/:billHeaderId',
        models: [() => import('../models/bill.js')],
        component: () => import('../routes/ConfirmInvoiceNotification/Detail'),
      },
    ],
  },

  // 总账科目定义
  // {
  //   path: '/sfin/general-ledger-account',
  //   models: [],
  //   components: [
  //     {
  //       title: '总账科目定义',
  //       authorized: true,
  //       path: '/sfin/general-ledger-account/list',
  //       models: [() => import('../models/generalLedgerAccount.js')],
  //       component: () => import('../routes/GeneralLedgerAccount'),
  //     },
  //   ],
  // },

  // 供应商扣款录入
  {
    FilterSupplier: true,
    path: '/sfin/supplier-chargeEntry',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/supplier-chargeEntry/list',
        models: [
          () => import('../models/supplierChargeEntry.js'),
          () => import('../models/supplierCommon.js'),
        ],
        component: () => import('../routes/SupplierChargeEntry'),
      },
      {
        FilterSupplier: true,
        authorized: true,
        title: '批量导入',
        path: '/sfin/supplier-chargeEntry/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },

  // 供应商扣款审批
  {
    FilterSupplier: true,
    path: '/sfin/supplier-deduction-approval',
    models: [],
    components: [
      {
        // title: '供应商扣款审批',
        // authorized: true,
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-approval/list',
        models: [
          () => import('../models/supplierDeductionApproval.js'),
          () => import('../models/supplierCommon.js'),
        ],
        component: () => import('../routes/SupplierDeductionApproval'),
      },
      // 跳转模块===> sodr: 我发出的订单
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-approval/sendOrder/detail/:id',
        models: [() => import('../models/sodr/sendOrder.js')],
        component: () => import('../routes/sodr/SendOrder'),
      },
      // 跳转模块===> sqam: 我的索赔单
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-approval/my-claimForm/detail',
        models: [
          () => import('../models/sqam/myClaimForm.js'),
          () => import('../models/sqam/sqamCommon.js'),
        ],
        component: () => import('../routes/sqam/MyClaimForm'),
      },
      // 跳转模块===> spcm: 我发起的协议
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-approval/purchase-contract-view/detail',
        models: [
          () => import('../models/spcm/purchaseContractView.js'),
          () => import('../models/spcm/contractCommon.js'),
          () => import('../models/spcm/editorOnline.js'),
        ],
        component: () => import('../routes/spcm/PurchaseContractView'),
      },
    ],
  },
  {
    path: '/pub/sfin/supplier-deduction-workfollow-approval/detail/:id',
    authorized: true,
    models: [() => import('../models/supplierCommon.js')],
    component: () => import('../routes/SupplierWorkFollowApproval'),
  },

  // 供应商扣款查询
  {
    FilterSupplier: true,
    path: '/sfin/supplier-deduction-query',
    models: [],
    components: [
      // 供应商扣款查询
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-query/list',
        models: [
          () => import('../models/supplierDeductionQuery.js'),
          () => import('../models/supplierCommon.js'),
        ],
        component: () => import('../routes/SupplierDeductionQuery'),
      },
      // 跳转模块===> sodr: 我发出的订单
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-query/sendOrder/detail/:id',
        models: [() => import('../models/sodr/sendOrder.js')],
        component: () => import('../routes/sodr/SendOrder'),
      },
      // 跳转模块===> sqam: 我的索赔单
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-query/my-claimForm/detail',
        models: [
          () => import('../models/sqam/myClaimForm.js'),
          () => import('../models/sqam/sqamCommon.js'),
        ],
        component: () => import('../routes/sqam/MyClaimForm'),
      },
      // 我发起的协议
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-query/purchase-contract-view/detail',
        models: [
          () => import('../models/spcm/purchaseContractView.js'),
          () => import('../models/spcm/contractCommon.js'),
          () => import('../models/spcm/editorOnline.js'),
        ],
        component: () => import('../routes/spcm/PurchaseContractView'),
      },
    ],
  },
  // 供应商扣款同步
  {
    FilterSupplier: true,
    path: '/sfin/supplier-deduction-sync',
    models: [],
    components: [
      // 供应商扣款同步
      {
        FilterSupplier: true,
        path: '/sfin/supplier-deduction-sync/list',
        models: [
          () => import('../models/supplierDeductionSync.js'),
          () => import('../models/supplierCommon.js'),
        ],
        component: () => import('../routes/SupplierDeductionSync'),
      },
    ],
  },
  // 供应商确认
  {
    path: '/sfin/supplier-confirm-query',
    models: [],
    components: [
      {
        path: '/sfin/supplier-confirm-query/list',
        models: [
          () => import('../models/supplierConfirm.js'),
          () => import('../models/supplierCommon.js'),
        ],
        component: () => import('../routes/SupplierConfirm'),
      },
      // 跳转模块===> sodr: 我收到的订单
      {
        path: '/sfin/supplier-confirm-query/receivedOrder/detail/:id',
        models: [() => import('../models/sodr/receivedOrder.js')],
        component: () => import('../routes/sodr/ReceivedOrder'),
      },
      // 跳转模块===> sqam: 我收到的索赔单
      {
        path: '/sfin/supplier-confirm-query/my-received-claim-form/detail',
        models: [
          () => import('../models/sqam/myReceivedClaimForm.js'),
          () => import('../models/sqam/sqamCommon.js'),
        ],
        component: () => import('../routes/sqam/MyReceivedClaimForm'),
      },
      // 我收到的协议
      {
        path: '/sfin/supplier-confirm-query/supplier-contract-view/detail',
        models: [
          () => import('../models/spcm/supplierContractView.js'),
          () => import('../models/spcm/contractCommon.js'),
          () => import('../models/spcm/editorOnline.js'),
        ],
        component: () => import('../routes/spcm/SupplierContractView'),
      },
    ],
  },
  // 我收到的扣款单
  {
    path: '/sfin/my-received-deduction',
    models: [],
    components: [
      {
        path: '/sfin/my-received-deduction/list',
        models: [
          () => import('../models/myReceivedDeduction.js'),
          () => import('../models/supplierCommon.js'),
        ],
        component: () => import('../routes/MyReceivedDeduction'),
      },
      // 跳转模块===> sodr: 我收到的订单
      {
        path: '/sfin/my-received-deduction/receivedOrder/detail/:id',
        models: [() => import('../models/sodr/receivedOrder.js')],
        component: () => import('../routes/sodr/ReceivedOrder'),
      },
      // 跳转模块===> sqam: 我收到的索赔单
      {
        path: '/sfin/my-received-deduction/my-received-claim-form/detail',
        models: [
          () => import('../models/sqam/myClaimForm.js'),
          () => import('../models/sqam/myReceivedClaimForm.js'),
          () => import('../models/sqam/sqamCommon.js'),
        ],
        component: () => import('../routes/sqam/MyReceivedClaimForm'),
      },
      // 我收到的协议
      {
        path: '/sfin/my-received-deduction/supplier-contract-view/detail',
        models: [
          () => import('../models/spcm/supplierContractView.js'),
          () => import('../models/spcm/contractCommon.js'),
          () => import('../models/spcm/editorOnline.js'),
        ],
        component: () => import('../routes/spcm/SupplierContractView'),
      },
    ],
  },

  /**
   * 工作流嵌入审核开票申请单页面
   */
  {
    authorized: true,
    path: '/pub/sfin/bill-audit/detail/:billHeaderId',
    models: [() => import('../models/bill.js')],
    component: () => import('../routes/Bill/Audit/Detail'),
  },
  //  付款申请审批
  {
    FilterSupplier: true,
    path: '/sfin/pay-approve',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/pay-approve/list',
        models: [() => import('../models/payApprove.js')],
        component: () => import('../routes/PaymentApprove'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-approve/detail/:id',
        models: [() => import('../models/payApprove.js')],
        component: () => import('../routes/PaymentApprove/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-approve/advance/detail/:id',
        models: [() => import('../models/payApprove.js')],
        component: () => import('../routes/PaymentApprove/AdvanceDetail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-approve/cancel-after-ver/detail',
        models: [
          () => import('../models/payApprove.js'),
          () => import('../models/cancelAfterVerification.js'),
        ],
        component: () => import('../routes/components/CancelAfterVerification'),
      },
    ],
  },
  //  付款申请查询
  {
    FilterSupplier: true,
    path: '/sfin/pay-query',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/pay-query/list',
        models: [() => import('../models/payQuery.js'), () => import('../models/payApprove.js')],
        component: () => import('../routes/PaymentQuery'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-query/detail/:id',
        models: [() => import('../models/payQuery.js')],
        component: () => import('../routes/PaymentQuery/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-query/advance/detail/:id',
        models: [() => import('../models/payQuery.js')],
        component: () => import('../routes/PaymentQuery/AdvanceDetail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-query/cancel-after-ver/detail',
        models: [
          () => import('../models/payApprove.js'),
          () => import('../models/cancelAfterVerification.js'),
        ],
        component: () => import('../routes/components/CancelAfterVerification'),
        // title: '预付款核销明细',
        // authorized: true,
      },
    ],
  },
  // 收款申请查询
  {
    path: '/pub/sfin/pay-query/detail/:id',
    models: [() => import('../models/payQuery.js')],
    component: () => import('../routes/PaymentQuery/Detail'),
    authorized: true,
  },
  {
    path: '/pub/sfin/pay-query/advance/detail/:id',
    models: [() => import('../models/payQuery.js')],
    component: () => import('../routes/PaymentQuery/AdvanceDetail'),
    authorized: true,
  },
  {
    path: '/sfin/receive-pay-query',
    models: [],
    components: [
      {
        path: '/sfin/receive-pay-query/list',
        models: [
          () => import('../models/receivedPayQuery.js'),
          () => import('../models/payApprove.js'),
        ],
        component: () => import('../routes/ReceivedPaymentQuery'),
      },
      {
        path: '/sfin/receive-pay-query/detail/:id',
        models: [() => import('../models/receivedPayQuery.js')],
        component: () => import('../routes/ReceivedPaymentQuery/Detail'),
      },
      {
        path: '/sfin/receive-pay-query/advance/detail/:id',
        models: [() => import('../models/receivedPayQuery.js')],
        component: () => import('../routes/ReceivedPaymentQuery/AdvanceDetail'),
      },
      {
        path: '/sfin/receive-pay-query/cancel-after-ver/detail',
        models: [
          () => import('../models/receivedPayQuery.js'),
          () => import('../models/cancelAfterVerification.js'),
        ],
        component: () => import('../routes/components/CancelAfterVerification'),
      },
    ],
  },
  //  我的付款记录
  {
    FilterSupplier: true,
    path: '/sfin/pay-record',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/pay-record/list',
        models: [() => import('../models/paymentRecord.js')],
        component: () => import('../routes/PaymentRecord'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-record/detail/:id',
        models: [() => import('../models/paymentRecord.js')],
        component: () => import('../routes/PaymentRecord/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/pay-record/pay-query/detail/:id',
        models: [() => import('../models/payQuery.js')],
        component: () => import('../routes/PaymentQuery/Detail'),
      },
      {
        path: '/sfin/pay-record/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  //  我的收款记录
  {
    path: '/sfin/collection-record',
    models: [],
    components: [
      {
        path: '/sfin/collection-record/list',
        models: [() => import('../models/collectionRecord.js')],
        component: () => import('../routes/CollectionRecord'),
        // authorized: true,
      },
      {
        path: '/sfin/collection-record/detail/:id',
        models: [() => import('../models/collectionRecord.js')],
        component: () => import('../routes/CollectionRecord/Detail'),
        // authorized: true,
      },
      {
        path: '/sfin/collection-record/receive-pay-query/detail/:id',
        models: [() => import('../models/receivedPayQuery.js')],
        component: () => import('../routes/ReceivedPaymentQuery/Detail'),
        // authorized: true,
      },
    ],
  },
  // 创建到票付款申请
  {
    FilterSupplier: true,
    path: '/sfin/create-payment-request',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/create-payment-request/list',
        models: [() => import('../models/createPaymentRequest.js')],
        component: () => import('../routes/CreatePaymentRequest'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/create-payment-request/opyion-to-payinvoice/list',
        models: [() => import('../models/optionToPayInvoice.js')],
        component: () => import('../routes/CreatePaymentRequest/OptionToPayInvoice'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/create-payment-request/detail/:paymentHeaderId',
        models: [() => import('../models/createPaymentRequest.js')],
        component: () => import('../routes/CreatePaymentRequest/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/create-payment-request/cancelAfterVerification/:headerId/:id',
        models: [() => import('../models/createPaymentRequest.js')],
        component: () => import('../routes/CreatePaymentRequest/Detail/CancelAfterVerification'),
      },
    ],
  },

  // 创建预付款申请
  {
    FilterSupplier: true,
    path: '/sfin/advance-payment-record',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sfin/advance-payment-record/list',
        models: [() => import('../models/advancePaymentRecord.js')],
        component: () => import('../routes/AdvancePaymentRecord'),
      },
      {
        FilterSupplier: true,
        path: '/sfin/advance-payment-record/detail',
        models: [() => import('../models/advancePaymentRecord.js')],
        component: () => import('../routes/AdvancePaymentRecord/Detail'),
      },
    ],
  },

  // 创建预收款申请
  {
    path: '/sfin/advance-receive-payment',
    models: [],
    components: [
      {
        path: '/sfin/advance-receive-payment/list',
        models: [() => import('../models/advanceReceivePayment.js')],
        component: () => import('../routes/AdvanceReceivePayment'),
      },
      {
        path: '/sfin/advance-receive-payment/detail',
        models: [() => import('../models/advanceReceivePayment.js')],
        component: () => import('../routes/AdvanceReceivePayment/Detail'),
      },
    ],
  },

  //  付款申请同步ERP
  {
    path: '/sfin/pay-sync-erp',
    models: [() => import('../models/payQuery.js'), () => import('../models/payApprove.js')],
    component: () => import('../routes/PaymentSyncErp'),
    FilterSupplier: true,
  },
  // 发票异常监控
  {
    path: '/sfin/invoice-monitor',
    models: [],
    component: () => import('../routes/InvoiceMonitor'),
    FilterSupplier: true,
  },
];
