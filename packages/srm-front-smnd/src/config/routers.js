module.exports = [
  {
    path: '/smnd/monitor-service',
    models: [],
    components: [
      {
        path: '/smnd/monitor-service/list',
        models: [],
        component: () => import('../routes/MonitorServiceDefine'),
      },
    ],
  },
  {
    path: '/smnd/monitor-dashboard',
    models: [],
    components: [
      {
        path: '/smnd/monitor-dashboard/list',
        models: [],
        component: () => import('../routes/MonitorDashboard'),
      },
    ],
  },
];
