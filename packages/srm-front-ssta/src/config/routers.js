/*
 * @Description:
 * @Date: 2020-10-16 10:01:38
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
module.exports = [
  {
    path: '/ssta/settle-strategy',
    // FilterSupplier: true,
    components: [
      {
        path: '/ssta/settle-strategy/list',
        component: () => import('../routes/SettlePolicy'),
      },
      {
        path: '/ssta/settle-strategy/:operate/:settleConfigId',
        component: () => import('../routes/SettlePolicy/Detail'),
      },
    ],
  },
  {
    path: '/ssta/invoice-ai-prompt',
    components: [
      {
        path: '/ssta/invoice-ai-prompt/list',
        component: () => import('../routes/InvoiceAiPrompt'),
      },
      {
        path: '/ssta/invoice-ai-prompt/:operate/:lang',
        component: () => import('../routes/InvoiceAiPrompt/Detail'),
      },
    ],
  },
  // 采购工作台
  {
    path: '/ssta/purchase-settle',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/purchase-settle/list',
        component: () => import('../routes/PurchaseSettle'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/purchase-settle/detail',
        component: () => import('../routes/PurchaseSettle/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/purchase-settle/pre-payment',
        component: () => import('../routes/PurchaseSettle/PrePayment'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/purchase-settle/pre-payment-create',
        component: () => import('../routes/PurchaseSettle/PrePayment'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/purchase-settle/payment-invoice',
        component: () => import('../routes/PurchaseSettle/PaymentInvoice'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购工作台(新)
  {
    path: '/ssta/new-purchase-settle',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/new-purchase-settle/list',
        component: () => import('../routes/NewPurchaseSettle'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-purchase-settle/create-steps',
        component: () => import('../routes/NewPurchaseSettle/Create/SuperWrapper'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-purchase-settle/pre-payment',
        component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-purchase-settle/pre-payment-create',
        component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-purchase-settle/data-import/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-purchase-settle/batch-submit/:batchApproveId',
        component: () => import('../routes/NewPurchaseSettle/BatchSubmit'),
        authorized: true,
      },
      {
        path: '/ssta/new-purchase-settle/:docType/:settleHeaderId',
        component: () => import('../routes/NewPurchaseSettle/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * 导入路由
   */
  {
    path: '/ssta/purchase-settle/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
  },
  {
    path: '/pub/ssta/purchase-settle/detail',
    component: () => import('../routes/PurchaseSettle/Detail'),
    authorized: true,
  },
  {
    path: '/pub/ssta/new-purchase-settle/:documentType/:settleHeaderId',
    component: () => import('../routes/NewPurchaseSettle/Detail'),
    authorized: true,
  },
  {
    path: '/pub/ssta/purchase-settle/pre-payment',
    component: () => import('../routes/PurchaseSettle/PrePayment'),
    authorized: true,
  },
  {
    path: '/pub/ssta/new-purchase-settle/pre-payment',
    component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
    authorized: true,
  },
  {
    path: '/pub/ssta/new-purchase-settle/batch-submit/:batchId',
    component: () => import('../routes/NewPurchaseSettle/BatchSubmit'),
    authorized: true,
  },
  /**
   * 采购方结算单,开票类型详情页面,工作流审批
   */
  {
    path: '/pub/ssta/purchase-settle/detail-date',
    component: () => import('../routes/PurchaseSettle/Detail'),
    authorized: true,
  },
  {
    path: '/pub/ssta/new-purchase-settle/detail-date/:documentType/:settleHeaderId',
    component: () => import('../routes/NewPurchaseSettle/Detail'),
    authorized: true,
  },
  /**
   * 采购方结算单,付款类型详情页面,工作流审批
   */
  {
    path: '/pub/ssta/purchase-settle/export-erp',
    component: () => import('../routes/PurchaseSettle/Detail'),
    authorized: true,
  },
  {
    path: '/pub/ssta/new-purchase-settle/export-erp/:documentType/:settleHeaderId',
    component: () => import('../routes/NewPurchaseSettle/Detail'),
    authorized: true,
  },
  // 销售工作台
  {
    path: '/ssta/supply-settle',
    components: [
      {
        path: '/ssta/supply-settle/list',
        component: () => import('../routes/SupplySettle'),
      },
      {
        path: '/ssta/supply-settle/detail',
        component: () => import('../routes/SupplySettle/Detail'),
      },
      {
        path: '/ssta/supply-settle/detail-create',
        component: () => import('../routes/SupplySettle/Detail'),
      },
      {
        path: '/ssta/supply-settle/pre-payment',
        component: () => import('../routes/SupplySettle/PrePayment'),
      },
      {
        path: '/ssta/supply-settle/pre-payment-create',
        component: () => import('../routes/SupplySettle/PrePayment'),
      },
      {
        path: '/ssta/supply-settle/payment-invoice',
        component: () => import('../routes/SupplySettle/PaymentInvoice'),
      },
    ],
  },
  // 销售工作台(新)
  {
    path: '/ssta/new-supply-settle',
    components: [
      {
        path: '/ssta/new-supply-settle/list',
        component: () => import('../routes/NewSupplySettle'),
      },
      {
        path: '/ssta/new-supply-settle/create-steps',
        component: () => import('../routes/NewSupplySettle/Create/SuperWrapper'),
      },
      {
        path: '/ssta/new-supply-settle/pre-payment',
        component: () => import('../routes/NewSupplySettle/PrePayment/Detail'),
      },
      {
        path: '/ssta/new-supply-settle/pre-payment-create',
        component: () => import('../routes/NewSupplySettle/PrePayment/Detail'),
      },
      {
        path: '/ssta/new-supply-settle/data-import/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-supply-settle/:docType/:settleHeaderId',
        component: () => import('../routes/NewSupplySettle/Detail'),
      },
    ],
  },

  /**
   * 导入路由
   */
  {
    path: '/ssta/supply-settle/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
  },
  {
    path: '/pub/ssta/supply-settle/detail',
    authorized: true,
    component: () => import('../routes/SupplySettle/Detail'),
  },
  {
    path: '/pub/ssta/new-supply-settle/:documentType/:settleHeaderId',
    authorized: true,
    component: () => import('../routes/NewSupplySettle/Detail'),
  },
  /**
   * 采购结算池
   */
  {
    path: '/ssta/purchase-settle-pool',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/purchase-settle-pool/list',
        component: () => import('../routes/PurchaseSettlePool'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * 销售结算池
   */
  {
    path: '/ssta/supply-settle-pool',
    components: [
      {
        path: '/ssta/supply-settle-pool/list',
        component: () => import('../routes/SupplySettlePool'),
      },
    ],
  },
  /**
   * 结算池
   * 采购方导入路由
   */
  {
    path: '/ssta/purchase-settle-pool/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
    FilterSupplier: true,
  },

  /**
   * 结算池
   * 销售方导入路由
   */
  {
    path: '/ssta/supply-settle-pool/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
  },
  // 采购方费用单工作台
  {
    path: '/ssta/cost-sheet',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/cost-sheet/list',
        component: () => import('../routes/CostSheet'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/cost-sheet/detail',
        component: () => import('../routes/CostSheet/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/cost-sheet/detail-create',
        component: () => import('../routes/CostSheet/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 新采购方费用单工作台
  {
    path: '/ssta/new-cost-sheet',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/new-cost-sheet/list',
        component: () => import('../routes/CostSheet'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-cost-sheet/detail',
        component: () => import('../routes/CostSheet/DetailNew'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-cost-sheet/detail-create',
        component: () => import('../routes/CostSheet/DetailNew'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方费用单工作台-导入
  {
    path: '/ssta/cost-sheet/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
    FilterSupplier: true,
  },
  //  采购方费用单工作台-导入(新)
  {
    path: '/ssta/new-cost-sheet/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
    FilterSupplier: true,
  },
  {
    path: '/pub/ssta/cost-sheet/detail',
    component: () => import('../routes/CostSheet/Detail'),
    authorized: true,
  },
  // UX
  {
    path: '/pub/ssta/new-cost-sheet/detail',
    component: () => import('../routes/CostSheet/DetailNew'),
    authorized: true,
  },
  // 供应商费用单工作台
  {
    path: '/ssta/cost-sheet-sup',
    components: [
      {
        path: '/ssta/cost-sheet-sup/list',
        component: () => import('../routes/CostSheetSup'),
      },
      {
        path: '/ssta/cost-sheet-sup/detail',
        component: () => import('../routes/CostSheetSup/Detail'),
      },
    ],
  },
  // 供应商费用单工作台(新)
  {
    path: '/ssta/new-cost-sheet-sup',
    components: [
      {
        path: '/ssta/new-cost-sheet-sup/list',
        component: () => import('../routes/CostSheetSup'),
      },
      {
        path: '/ssta/new-cost-sheet-sup/detail-create',
        component: () => import('../routes/CostSheetSup/DetailNew'),
      },
      {
        path: '/ssta/new-cost-sheet-sup/detail',
        component: () => import('../routes/CostSheetSup/DetailNew'),
      },
    ],
  },
  // 销售方费用单工作台-导入
  {
    path: '/ssta/cost-sheet-sup/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
  },
  // 采购方对账单工作台
  {
    path: '/ssta/reconciliation-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/reconciliation-workbench/list',
        component: () => import('../routes/ReconciliationWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/reconciliation-workbench/detail',
        component: () => import('../routes/ReconciliationWorkbench/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/reconciliation-workbench/data-import/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/ssta/reconciliation-workbench/data-import-create/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  // 新-采购方对账单工作台
  {
    path: '/ssta/new-reconciliation-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/new-reconciliation-workbench/list',
        component: () => import('../routes/ReconciliationWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-reconciliation-workbench/create-steps',
        component: () => import('../routes/ReconciliationWorkbench/CreateModal'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-reconciliation-workbench/detail',
        component: () => import('../routes/ReconciliationWorkbench/DetailNew'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-reconciliation-workbench/data-import/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/ssta/new-reconciliation-workbench/data-import-create/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  //  供应商对账单工作台
  {
    path: '/ssta/reconciliation-workbench-supplier',
    components: [
      {
        path: '/ssta/reconciliation-workbench-supplier/list',
        component: () => import('../routes/ReconciliationWorkbenchSup'),
      },
      {
        path: '/ssta/reconciliation-workbench-supplier/detail',
        component: () => import('../routes/ReconciliationWorkbenchSup/Detail'),
      },
      {
        // authorized: true,
        path: '/ssta/reconciliation-workbench-supplier/data-import/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
      },
      {
        path: '/ssta/reconciliation-workbench-supplier/data-import-create/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
      },
    ],
  },
  //  供应商对账单工作台-新
  {
    path: '/ssta/new-reconciliation-workbench-supplier',
    components: [
      {
        path: '/ssta/new-reconciliation-workbench-supplier/list',
        component: () => import('../routes/ReconciliationWorkbenchSup'),
      },
      {
        path: '/ssta/new-reconciliation-workbench-supplier/create-steps',
        component: () => import('../routes/ReconciliationWorkbenchSup/CreateModal'),
      },
      {
        path: '/ssta/new-reconciliation-workbench-supplier/detail',
        component: () => import('../routes/ReconciliationWorkbenchSup/DetailNew'),
      },
      {
        path: '/ssta/new-reconciliation-workbench-supplier/data-import/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
      },
      {
        path: '/ssta/new-reconciliation-workbench-supplier/data-import-create/:code',
        component: () => import('hzero-front-himp/lib/routes/CommentImport'),
        models: [],
      },
    ],
  },
  // 电商自动对账
  {
    path: '/ssta/ec-auto-bill',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/ec-auto-bill/list',
        component: () => import('../routes/EcAutoBill'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/ec-auto-bill/detail/:autoBillId/:action?',
        component: () => import('../routes/EcAutoBill/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方对账单-审批页面-明细（用于工作流审批）
  // ?editFlag=0&billList=[{"billHeaderId":"__-tMqzxDSeod9xLiGBEBjRvg-__","billNum":"BL20201204000007"}]
  {
    path: '/pub/ssta/reconciliation-workbench/detail',
    // models: [() => import('../models/inquiryHall.js'), () => import('../models/priceComparison.js'), () => import('../models/quotationDetail.js')],
    component: () => import('../routes/ReconciliationWorkbench/Detail'),
    authorized: true,
    FilterSupplier: true,
  },
  // UX
  {
    path: '/pub/ssta/new-reconciliation-workbench/detail',
    // models: [() => import('../models/inquiryHall.js'), () => import('../models/priceComparison.js'), () => import('../models/quotationDetail.js')],
    component: () => import('../routes/ReconciliationWorkbench/DetailNew'),
    authorized: true,
    FilterSupplier: true,
  },
  // 供应商对账单-审批页面-明细（用于工作流审批）
  {
    path: '/pub/ssta/reconciliation-workbench-supplier/detail',
    // models: [() => import('../models/inquiryHall.js'), () => import('../models/priceComparison.js'), () => import('../models/quotationDetail.js')],
    component: () => import('../routes/ReconciliationWorkbenchSup/Detail'),
    authorized: true,
    FilterSupplier: true,
  },
  // UX
  {
    path: '/pub/ssta/new-reconciliation-workbench-supplier/detail',
    // models: [() => import('../models/inquiryHall.js'), () => import('../models/priceComparison.js'), () => import('../models/quotationDetail.js')],
    component: () => import('../routes/ReconciliationWorkbenchSup/DetailNew'),
    authorized: true,
    FilterSupplier: true,
  },
  // 采购方发票池工作台
  {
    path: '/ssta/purchase-invoice-pool',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/purchase-invoice-pool/list',
        component: () => import('../routes/PurchaseInvoicePool/index'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/purchase-invoice-pool/detail',
        component: () => import('../routes/PurchaseInvoicePool/Detail/index'),
        FilterSupplier: true,
      },
      // 发票新建/编辑
      {
        path: '/ssta/purchase-invoice-pool/detail-action',
        component: () => import('../routes/PurchaseInvoicePool/Create/index'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方发票池导入
  {
    path: '/ssta/purchase-invoice-pool/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
    FilterSupplier: true,
  },
  // 销售方发票池
  {
    path: '/ssta/supply-invoice-pool',
    components: [
      {
        path: '/ssta/supply-invoice-pool/list',
        component: () => import('../routes/SupplyInvoicePool/index'),
      },
      {
        path: '/ssta/supply-invoice-pool/detail',
        component: () => import('../routes/SupplyInvoicePool/Detail/index'),
      },
      // 发票新建/编辑
      {
        path: '/ssta/supply-invoice-pool/detail-action',
        component: () => import('../routes/SupplyInvoicePool/Create/index'),
      },
    ],
  },
  // 销售方发票池导入
  {
    path: '/ssta/supply-invoice-pool/data-import/:code',
    component: () => import('hzero-front-himp/lib/routes/CommentImport'),
    models: [],
  },
  // 采购方结算看板
  {
    path: '/ssta/purchase-settlement-kanban',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/purchase-settlement-kanban/list',
        component: () => import('../routes/PurchaseSettlementKanban'),
        FilterSupplier: true,
      },
    ],
  },
  // 销售方结算看板
  {
    path: '/ssta/supply-settlement-kanban',
    components: [
      {
        path: '/ssta/supply-settlement-kanban/list',
        component: () => import('../routes/SupplySettlementKanban'),
      },
    ],
  },
  {
    path: '/ssta/tax-control',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/tax-control/list',
        component: () => import('../routes/TaxControl'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/ssta/invoice-rule',
    FilterSupplier: true,
    // authorized: true,
    components: [
      {
        path: '/ssta/invoice-rule/list',
        // authorized: true,
        component: () => import('../routes/InvoiceRule'),
        FilterSupplier: true,
      },
      {
        path: '/ssta/invoice-rule/detail/:ruleId',
        // authorized: true,
        component: () => import('../routes/InvoiceRule/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    // 供应商开票商品信息（采购方用）
    path: '/ssta/sup-invoiced-goods',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/sup-invoiced-goods/list',
        FilteSupplier: true,
        component: () => import('../routes/SupInvoicedGoods/List'),
      },
    ],
  },
  // 税收商品信息（销售方用）
  {
    path: '/ssta/tax-goods',
    components: [
      {
        path: '/ssta/tax-goods/list',
        component: () => import('../routes/TaxGoods/List'),
      },
    ],
  },
  {
    path: '/ssta/direct-commodity',
    components: [
      {
        path: '/ssta/direct-commodity/list',
        component: () => import('../routes/DirectCommodity'),
      },
    ],
  },
  // 销售方待开票池
  {
    path: '/ssta/direct-pool-supply',

    components: [
      {
        path: '/ssta/direct-pool-supply/list',
        component: () => import('../routes/DirectPoolSupply/List'),
        // authorized: true,
      },
      {
        path: '/ssta/direct-pool-supply/detail',
        // authorized: true,
        component: () => import('../routes/DirectPoolSupply/Detail'),
      },
      {
        path: '/ssta/direct-pool-supply/create',
        // authorized: true,
        component: () => import('../routes/DirectPoolSupply/Detail'),
      },
      {
        path: '/ssta/direct-pool-supply/apply/detail',
        component: () => import('../routes/InvoicingApply'),
      },
    ],
  },

  {
    path: '/ssta/payment-plan',
    components: [
      {
        path: '/ssta/payment-plan/list',
        component: () => import('../routes/PaymentPlan/List'),
      },
      {
        path: '/ssta/payment-plan/detail/:planHeaderId',
        component: () => import('../routes/PaymentPlan/Detail'),
      },
      {
        path: '/ssta/payment-plan/detail-by-num/:planNum',
        component: () => import('../routes/PaymentPlan/Detail'),
      },
    ],
  },
  // 采购方寻源费用工作台
  {
    path: '/ssta/purchaser-sourcing-cost',
    FilterSupplier: true,
    components: [
      {
        path: '/ssta/purchaser-sourcing-cost/list',
        FilterSupplier: true,
        component: () => import('../routes/SourcingCostPurchaser/List'),
      },
      {
        path: '/ssta/purchaser-sourcing-cost/tender/:tenderFeesId',
        FilterSupplier: true,
        component: () => import('../routes/SourcingCostPurchaser/TenderDetail'),
      },
      {
        path: '/ssta/purchaser-sourcing-cost/deposit/:depositId',
        FilterSupplier: true,
        component: () => import('../routes/SourcingCostPurchaser/DepositDetail'),
      },
      {
        path: '/ssta/purchaser-sourcing-cost/service/:serverFeesId',
        FilterSupplier: true,
        component: () => import('../routes/SourcingCostPurchaser/ServiceDetail'),
      },
    ],
  },
  // 供应商寻源费用工作台
  {
    path: '/ssta/supplier-sourcing-cost',
    components: [
      {
        path: '/ssta/supplier-sourcing-cost/list',
        component: () => import('../routes/SourcingCostSupplier/List'),
      },
      {
        path: '/ssta/supplier-sourcing-cost/tender/:tenderFeesId',
        component: () => import('../routes/SourcingCostSupplier/TenderDetail'),
      },
      {
        path: '/ssta/supplier-sourcing-cost/deposit/:depositId',
        component: () => import('../routes/SourcingCostSupplier/DepositDetail'),
      },
      {
        path: '/ssta/supplier-sourcing-cost/service/:serverFeesId',
        component: () => import('../routes/SourcingCostSupplier/ServiceDetail'),
      },
    ],
  },
  // 开票申请单独立页面,动态路由
  {
    path: '/ssta/invoicing-apply/:applyHeaderId',
    component: () => import('../routes/InvoicingApply'),
  },
  // 开票申请单独立页面，单例
  {
    path: '/ssta/invoicing-apply-detail',
    component: () => import('../routes/InvoicingApply'),
  },
  // 采购方招标文件费工作流
  {
    path: '/pub/ssta/purchaser-sourcing-cost/tender/:tenderFeesId',
    component: () => import('../routes/SourcingCostPurchaser/TenderDetail'),
    authorized: true,
  },
  // 采购方保证金工作流
  {
    path: '/pub/ssta/purchaser-sourcing-cost/deposit/:depositId',
    component: () => import('../routes/SourcingCostPurchaser/DepositDetail'),
    authorized: true,
  },
  // 采购方服务费工作流
  {
    path: '/pub/ssta/purchaser-sourcing-cost/service/:serverFeesId',
    component: () => import('../routes/SourcingCostPurchaser/ServiceDetail'),
    authorized: true,
  },
  // 采购方 新保证金审批 工作流
  {
    path: '/pub/ssta/purchaser-sourcing-cost/approval/deposit/:depositId',
    component: () => import('../routes/SourcingCostPurchaser/DepositApproval'),
    authorized: true,
  },
  {
    path: '/ssta/execution-progress',
    component: () => import('../routes/ExecutionProgress'),
    authorized: true,
  },
];
