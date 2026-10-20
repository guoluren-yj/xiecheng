module.exports = [
  {
    path: '/smop/service-center',
    models: [],
    component: () => import('../routes/ServiceCenter'),
    authorized: true,
  },
  {
    path: '/smop/doc-manage',
    models: [],
    authorized: true,
    components: [
      {
        path: '/smop/doc-manage/list',
        models: [],
        component: () => import('../routes/DocManage'),
      },
      {
        path: '/smop/doc-manage/detail',
        models: [],
        component: () => import('../routes/DocManage/Detail'),
      },
    ],
  },
];
