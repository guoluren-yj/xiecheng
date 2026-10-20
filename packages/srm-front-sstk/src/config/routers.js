/**
 * 在router.js中已经统一注入了path的服务名models和component的模块路径
 */
module.exports = [
  // 非生库存
  {
    // title: '库存策略管理',
    path: '/sstk/stock-strategy-config',
    FilterSupplier: true,
    components: [
      {
        FilterSupplier: true,
        path: '/sstk/stock-strategy-config/list',
        component: () => import('../routes/sstk/StockStrategyConfig'),
      },
      {
        FilterSupplier: true,
        path: '/sstk/stock-strategy-config/detail/:status',
        component: () => import('../routes/sstk/StockStrategyConfig/Detail'),
      },
    ],
  },
  {
    // title: '出入库工作台',
    path: '/sstk/stock-workbench',
    FilterSupplier: true,
    components: [
      {
        FilterSupplier: true,
        path: '/sstk/stock-workbench/list',
        component: () => import('../routes/sstk/StockWorkbench'),
      },
      {
        FilterSupplier: true,
        path: '/sstk/stock-workbench/detail/:status',
        component: () => import('../routes/sstk/StockWorkbench/Detail'),
      },
    ],
  },
  {
    // title: '库存报表工作台',
    path: '/sstk/stock-report-workbench',
    FilterSupplier: true,
    component: () => import('../routes/sstk/StockReportWorkbench'),
  },
];
