module.exports = [
  // 个性化

  {
    path: '/hpfm/ui-customize/cust-config',
    components: [
      {
        path: '/hpfm/ui-customize/cust-config/entry',
        models: [],
        component: () => import('../routes/UnifyEntry/Org/Unit'),
      },
      {
        path: '/hpfm/ui-customize/cust-config/detail',
        models: [() => import('../models/searchBarConfig')],
        component: () => import('../routes/UnifyEntry/Org/Unit/Detail'),
      },
    ],
    priority: 1,
    FilterSupplier: true,
  },
  // {
  //   path: '/hpfm/ui-customize/model',
  //   priority: 1,
  //   FilterSupplier: true,
  //   components: [
  //     {
  //       path: '/hpfm/ui-customize/model/list',
  //       models: [() => import('../models/flexModel')],
  //       component: () => import('../routes/FlexModel'),
  //       priority: 1,
  //       FilterSupplier: true,
  //     },
  //     {
  //       path: '/hpfm/ui-customize/model/detail/:modelId',
  //       models: [() => import('../models/flexModel')],
  //       component: () => import('../routes/FlexModel/ModelDetail'),
  //       priority: 1,
  //       FilterSupplier: true,
  //     },
  //   ],
  // },
  {
    path: '/hpfm/ui-customize/cust-unit',
    models: [
      () => import('../models/individuationUnit'),
      () => import('../models/searchBarConfig'),
    ],
    component: () => import('../routes/IndividuationUnit'),
    priority: 1,
    FilterSupplier: true,
  },
  {
    path: '/hpfm/ui-customize/doc/platform',
    components: [
      {
        path: '/hpfm/ui-customize/doc/platform/list',
        models: [() => import('../models/searchBarConfig')],
        component: () => import('../routes/DocConfig/Platform'),
      },
      {
        path: '/hpfm/ui-customize/doc/platform/update',
        models: [() => import('../models/searchBarConfig')],
        component: () => import('../routes/DocConfig/Platform/Detail'),
      },
    ],
  },
  {
    path: '/hpfm/ui-customize/unify-entry/org',
    components: [
      {
        path: '/hpfm/ui-customize/unify-entry/org/index',
        models: [() => import('../models/searchBarConfig')],
        component: () => import('../routes/UnifyEntry/Org/Doc'),
      },
      {
        path: '/hpfm/ui-customize/unify-entry/org/doc',
        models: [() => import('../models/searchBarConfig')],
        component: () => import('../routes/UnifyEntry/Org/Doc/Detail'),
      },
    ],
  },
];
