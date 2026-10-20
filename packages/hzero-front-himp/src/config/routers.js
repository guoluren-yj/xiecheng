module.exports = [
  {
    path: '/himp/template',
    models: [() => import('../models/template')],
    components: [
      {
        path: '/himp/template/list',
        FilterSupplier: true,
        component: () => import('../routes/Template/List'),
        models: [() => import('../models/template')],
      },
      {
        path: '/himp/template/column/:id/:sheetId/:templateType',
        FilterSupplier: true,
        component: () => import('../routes/Template/Detail/Column'),
        models: [() => import('../models/template')],
      },
      {
        path: '/himp/template/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/Template/Detail'),
        models: [() => import('../models/template')],
      },
    ],
  },
  {
    path: '/himp/commentImport/:code',
    FilterSupplier: true,
    component: () => import('../routes/CommentImport'),
    models: [() => import('../models/commentImport')],
  },
  {
    path: '/himp/history',
    models: [],
    components: [
      {
        path: '/himp/history/list',
        FilterSupplier: true,
        component: () => import('../routes/ImportHistory'),
        models: [],
      },
      {
        path: '/himp/history/detail/:importId/:templateCode/:batch',
        FilterSupplier: true,
        component: () => import('../routes/ImportHistory/Detail'),
        models: [],
      },
    ],
  },
  {
    path: '/himp/translate-workench',
    models: [],
    component: () => import('../routes/TranslateWorkench'),
  },
  {
    path: '/himp/translate-workench-config',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/TranslateWorkenchConfig'),
  },
];
