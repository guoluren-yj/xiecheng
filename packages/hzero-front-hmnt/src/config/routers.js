module.exports = [
  {
    path: '/hmnt/audit-query',
    component: () => import('../routes/AuditQuery'),
    models: [() => import('../models/auditQuery')],
    FilterSupplier: true,
  },
  // 操作审计配置
  {
    path: '/hmnt/audit-config',
    component: () => import('../routes/AuditConfig'),
    models: [() => import('../models/auditConfig')],
    FilterSupplier: true,
  },
  {
    path: '/hmnt/data-audit',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hmnt/data-audit/list',
        component: () => import('../routes/DataAudit'),
        models: [() => import('../models/dataAudit')],
      },
      // {
      //   path: '/hmnt/data-audit/detail/:id',
      //   component: () => import('../routes/DataAudit/Detail'),
      //   models: [() => import('../models/dataAudit')],
      // },
    ],
  },
  {
    path: '/hmnt/data-audit-config',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hmnt/data-audit-config/list',
        component: () => import('../routes/DataAuditConfig/List'),
        models: [() => import('../models/dataAuditConfig')],
        FilterSupplier: true,
      },
      {
        path: '/hmnt/data-audit-config/detail',
        component: () => import('../routes/DataAuditConfig/Detail'),
        models: [() => import('../models/dataAuditConfig')],
        FilterSupplier: true,
      },
    ],
  },
  // 单据审计配置
  {
    path: '/hmnt/document-audit-config',
    component: () => import('../routes/DocumentAuditConfig'),
    FilterSupplier: true,
  },
  // 单据审计查询
  {
    path: '/hmnt/document-audit-query',
    component: () => import('../routes/DocumentAuditLog'),
    FilterSupplier: true,
  },
  // 单据审计日志
  {
    path: '/hmnt/document-audit-log',
    component: () => import('../routes/DocAuditLogSummary'),
    FilterSupplier: true,
  },
];
