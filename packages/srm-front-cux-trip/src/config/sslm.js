/**
 * 供应商关联业务单据（sslm）二开路由
 */
export default [
  {
    coverPath: '/sslm/supplier-related-doc/list',
    path: '/cux/sslm/supplier-related-doc/list',
    component: () => import('../routes/sslm/SupplierLife/SupplierRelatedDoc/List'),
    authorized: true,
  },
  {
    coverPath: '/pub/sslm/supplier-related-doc/list',
    path: '/cux/pub/sslm/supplier-related-doc/list',
    component: () => import('../routes/sslm/SupplierLife/SupplierRelatedDoc/List'),
    authorized: true,
  },
];
