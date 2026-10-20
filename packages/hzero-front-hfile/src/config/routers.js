module.exports = [
  {
    path: '/hfile/edit-log',
    component: () => import('../routes/EditLog'),
    models: [() => import('../models/editLog')],
    FilterSupplier: true,
  },
  {
    path: '/hfile/file-aggregate',
    FilterSupplier: true,
    components: [
      {
        path: '/hfile/file-aggregate/list',
        component: () => import('../routes/FileAggregate'),
        models: [() => import('../models/fileAggregate')],
        FilterSupplier: true,
      },
      {
        path: '/hfile/file-aggregate/word-editor/:fileId',
        component: () => import('../routes/FileAggregate/DetailWordEditor'),
        models: [() => import('../models/fileAggregate')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hfile/file-upload',
    component: () => import('../routes/FileUpload'),
    models: [() => import('../models/fileUpload')],
    FilterSupplier: true,
  },
  {
    path: '/hfile/server-upload',
    models: [() => import('../models/serverUpload')],
    FilterSupplier: true,
    components: [
      {
        path: '/hfile/server-upload/list',
        component: () => import('../routes/ServerUpload/List'),
        models: [() => import('../models/serverUpload')],
        FilterSupplier: true,
      },
      {
        path: '/hfile/server-upload/detail/:id',
        component: () => import('../routes/ServerUpload/Detail'),
        models: [() => import('../models/serverUpload')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hfile/storage',
    component: () => import('../routes/Storage'),
    models: [() => import('../models/storage')],
    FilterSupplier: true,
  },
  {
    path: '/hfile/water-mark-config',
    component: () => import('../routes/WaterMarkConfig'),
    FilterSupplier: true,
  },
  {
    path: '/pub/hfile/online-doc/:requestId',
    component: () => import('../routes/OnlineDoc'),
    authorized: true,
  },
];
