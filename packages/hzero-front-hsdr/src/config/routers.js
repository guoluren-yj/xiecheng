module.exports = [
  {
    path: '/hsdr/conc-request',
    component: () => import('../routes/ConcRequest'),
    models: [() => import('../models/concRequest'), () => import('../models/jobLog')],
    FilterSupplier: true,
  },
  {
    path: '/hsdr/concurrent',
    models: [() => import('../models/concurrent')],
    FilterSupplier: true,
    components: [
      {
        path: '/hsdr/concurrent/list',
        component: () => import('../routes/Concurrent/List'),
        models: [() => import('../models/concurrent')],
        FilterSupplier: true,
      },
      {
        path: '/hsdr/concurrent/detail/:id',
        component: () => import('../routes/Concurrent/Detail'),
        models: [() => import('../models/concurrent')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hsdr/executable',
    component: () => import('../routes/Executable'),
    models: [() => import('../models/executable')],
    FilterSupplier: true,
  },
  {
    path: '/hsdr/job-group',
    component: () => import('../routes/JobGroup'),
    models: [() => import('../models/jobGroup')],
    FilterSupplier: true,
  },
  {
    path: '/hsdr/job-info',
    models: [() => import('../models/jobInfo')],
    FilterSupplier: true,
    components: [
      {
        path: '/hsdr/job-info/list',
        component: () => import('../routes/JobInfo'),
        models: [() => import('../models/jobInfo'), () => import('../models/jobLog')],
        FilterSupplier: true,
      },
      {
        path: '/hsdr/job-info/glue/:id',
        component: () => import('../routes/JobInfo/Glue'),
        models: [() => import('../models/jobInfo')],
        FilterSupplier: true,
      },
      {
        path: '/hsdr/job-info/log/:jobId',
        component: () => import('../routes/JobLog'),
        models: [() => import('../models/jobLog')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hsdr/job-log',
    component: () => import('../routes/JobLog'),
    models: [() => import('../models/jobLog')],
    FilterSupplier: true,
  },
];
