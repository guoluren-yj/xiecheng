/**
 * 在router.js中已经统一注入了path的服务名models和component的模块路径
 */
module.exports = [
  // 平台级
  {
    path: '/smep/sku-init-task',
    title: '商品初始化任务',
    component: () => import('../routes/SkuInitTask'),
  },
  {
    path: '/smep/middleware-polling-rules',
    // title: '中间件轮询规则',
    authorized: true,
    component: () => import('../routes/Middleware'),
  },
];
