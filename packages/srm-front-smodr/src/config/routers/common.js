/**
 * 在router.js中已经统一注入了path的服务名models和component的模块路径
 */
module.exports = [
  {
    authorized: true,
    path: '/s2-mall/data-import/:code',
    models: [],
    component: () => import('../../routes/himp/CommonImport'),
  },
];
