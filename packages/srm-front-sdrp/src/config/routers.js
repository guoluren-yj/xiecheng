module.exports = [
  {
    path: '/sdrp/report-workbench',
    component: () => import('../routes/ReportTest'),
  },
  // 供应商品类采购金额查询
  {
    path: '/sdrp/supplier-cate-amont-report',
    component: () => import('../routes/SupplierCateAmountReport'),
    FilterSupplier: true,
  },
  // 收货执行跟踪
  {
    path: '/sdrp/spuc-sinv-goods-arrive-report',
    component: () => import('../routes/ArrivalWorkReport'),
    FilterSupplier: true,
  },
  // 合同明细履约跟踪
  {
    path: '/sdrp/pc-subject-track',
    component: () => import('../routes/ContractLine'),
    FilterSupplier: true,
  },
  // 采购订单明细追踪
  {
    path: '/sdrp/spuc-po-line-track-report',
    component: () => import('../routes/PoLineTrackReport'),
    FilterSupplier: true,
  },
  // 寻源价格分析
  {
    path: '/sdrp/sourcing-price-analysis',
    component: () => import('../routes/InquiryAndHistoricalPricesReport'),
    FilterSupplier: true,
  },
  // 供应商名录
  {
    path: '/sdrp/supplier-directory',
    component: () => import('../routes/SupplierDirReport'),
    authorized: true,
  },
  // 供应商绩效
  {
    path: '/sdrp/supplier-performance',
    component: () => import('../routes/SupplierPerformanceReport'),
    authorized: true,
  },
  // 发票业务全流程查阅
  {
    path: '/sdrp/settle-invoice',
    component: () => import('../routes/SettleInvoiceReport'),
    authorized: true,
  },
  // 电商对账全局查询
  {
    path: '/sdrp/settle-reconciliation',
    component: () => import('../routes/SettleReconciliationReport'),
    authorized: true,
  },
  // 全链路报表
  {
    path: '/sdrp/full-link',
    component: () => import('../routes/FullLinkReport'),
    authorized: true,
  },
];
