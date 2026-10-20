module.exports = [
  {
    path: '/seci/credit-tenant',
    models: [],
    components: [
      {
        path: '/seci/credit-tenant/list',
        models: [() => import('../models/creditTenant.js')],
        component: () => import('../routes/CreditTenant'),
      },
      // {
      //   path: '/seci/credit-tenant/product-assign',
      //   models: [() => import('../models/productAssign.js')],
      //   component: () => import('../routes/reditTenant/ProductAssign'),
      // },
    ],
  },
  {
    path: '/seci/product-define',
    models: [() => import('../models/productDefine.js')],
    component: () => import('../routes/ProductDefine'),
  },
  {
    path: '/seci/consume-record',
    models: [() => import('../models/consumeRecord.js')],
    component: () => import('../routes/ConsumeRecord'),
  },
  {
    path: '/seci/seci-interface-def',
    models: [() => import('../models/seciInterfaceDef.js')],
    component: () => import('../routes/SeciInterfaceDef'),
  },
  {
    path: '/seci/product-search',
    models: [() => import('../models/productSearch.js')],
    component: () => import('../routes/ProductSearch'),
  },
  {
    path: '/seci/consume-record-org',
    models: [() => import('../models/consumeRecordOrg.js')],
    component: () => import('../routes/ConsumeRecordOrg'),
  },
  {
    path: '/seci/supplier-credit-info',
    models: [() => import('../models/supplierCreditInfo.js')],
    component: () => import('../routes/CreditInfo/SupplierCreditInfo'),
  },
  {
    path: '/seci/purchaser-credit-info',
    models: [() => import('../models/purchaserCreditInfo.js')],
    component: () => import('../routes/CreditInfo/PurchaserCreditInfo'),
  },
];
