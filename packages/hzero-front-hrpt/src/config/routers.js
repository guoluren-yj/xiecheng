module.exports = [
  {
    path: '/hrpt/data-set',
    models: [() => import('../models/dataSet')],
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/data-set/list',
        component: () => import('../routes/DataSet/List'),
        models: [() => import('../models/dataSet')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/data-set/create',
        component: () => import('../routes/DataSet/Detail'),
        models: [() => import('../models/dataSet')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/data-set/detail/:id',
        component: () => import('../routes/DataSet/Detail'),
        models: [() => import('../models/dataSet')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hrpt/report-definition',
    models: [() => import('../models/reportDefinition')],
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/report-definition/list',
        component: () => import('../routes/ReportDefinition/List'),
        models: [() => import('../models/reportDefinition')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/report-definition/create',
        component: () => import('../routes/ReportDefinition/Detail'),
        models: [() => import('../models/reportDefinition')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/report-definition/detail/:id',
        component: () => import('../routes/ReportDefinition/Detail'),
        models: [() => import('../models/reportDefinition')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/report-definition/u-report',
        component: () => import('../routes/ReportDefinition/Detail/UReportEditor'),
        models: [() => import('../models/reportDefinition')],
        FilterSupplier: true,
      },
    ],
  },
  // 报表详情菜单1
  {
    path: '/hrpt/report-detail',
    models: [() => import('../models/reportQuery')],
    component: () => import('../routes/ReportQuery/Detail'),
    FilterSupplier: true,
  },
  // 报表详情菜单, 将参数放在路径上，保证唯一key
  {
    path: '/hrpt/report-detail-path/:code',
    models: [() => import('../models/reportQuery')],
    component: () => import('../routes/ReportQuery/ReportDetail'),
    FilterSupplier: true,
  },
  {
    path: '/hrpt/report-query',
    models: [() => import('../models/reportQuery')],
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/report-query/list',
        component: () => import('../routes/ReportQuery/List'),
        models: [() => import('../models/reportQuery')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/report-query/detail/:id/:name',
        component: () => import('../routes/ReportQuery/Detail'),
        models: [() => import('../models/reportQuery')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hrpt/personal-report-query',
    component: () => import('../routes/PersonalReport'),
    FilterSupplier: true,
  },
  {
    path: '/hrpt/report-request',
    component: () => import('../routes/ReportRequest'),
    models: [() => import('../models/reportRequest')],
    FilterSupplier: true,
  },
  {
    path: '/hrpt/template-manage',
    models: [() => import('../models/templateManage')],
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/template-manage/list',
        component: () => import('../routes/TemplateManage/List'),
        models: [() => import('../models/templateManage')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/template-manage/create',
        component: () => import('../routes/TemplateManage/Detail'),
        models: [() => import('../models/templateManage')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/template-manage/detail/:id',
        component: () => import('../routes/TemplateManage/Detail'),
        models: [() => import('../models/templateManage')],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/template-manage/word-editor/:fileId',
        component: () => import('../routes/TemplateManage/Detail/DetailWordEditor'),
        models: [() => import('../models/templateManage')],
        FilterSupplier: true,
      },
    ],
  },
  // 标签模板管理
  {
    path: '/hrpt/label-template',
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/label-template/list',
        component: () => import('../routes/LabelTemplate'),
        FilterSupplier: true,
      },
      {
        path: '/hrpt/label-template/detail/:labelTemplateId',
        exact: true,
        component: () => import('../routes/LabelTemplate/Detail'),
        FilterSupplier: true,
      },
      {
        path:
          '/hrpt/label-template/detail/edit-template/:labelTemplateId/:templateHigh/:templateWidth',
        component: () => import('../routes/LabelTemplate/EditTemplate'),
        FilterSupplier: true,
      },
      {
        path: '/hrpt/label-template/print/:templateCode',
        component: () => import('../routes/LabelTemplate/Print'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hrpt/analysis-report',
    models: [],
    FilterSupplier: true,
    priority: 100,
    components: [
      {
        // authorized: true,
        // title: '采购额分析报表',
        path: '/hrpt/analysis-report/list',
        models: [() => import('../models/analysisReport.js')],
        component: () => import('../routes/AnalysisReport'),
        FilterSupplier: true,
      },
    ],
  },
  // {
  //   path: '/hrpt/print-template',
  //   models: [],
  //   FilterSupplier: true,
  //   components: [
  //     {
  //       path: '/hrpt/print-template/list',
  //       component: () => import('../routes/PrintTemplate/List'),
  //       models: [],
  //       FilterSupplier: true,
  //     },
  //     {
  //       path: '/hrpt/print-template/create',
  //       component: () => import('../routes/PrintTemplate/Detail'),
  //       models: [],
  //       FilterSupplier: true,
  //     },
  //     {
  //       path: '/hrpt/print-template/detail/:reportId/:reportUuid',
  //       component: () => import('../routes/PrintTemplate/Detail'),
  //       models: [],
  //       FilterSupplier: true,
  //     },
  //   ],
  // },
  {
    path: '/hrpt/print-template',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/print-template/list',
        component: () => import('../routes/PrintTemplateNew'),
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hrpt/print-dataset',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hrpt/print-dataset/list',
        component: () => import('../routes/DataSetNew/List'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/print-dataset/create',
        component: () => import('../routes/DataSetNew/Detail'),
        models: [],
        FilterSupplier: true,
      },
      {
        path: '/hrpt/print-dataset/detail/:id',
        component: () => import('../routes/DataSetNew/Detail'),
        models: [() => import('../models/dataSet')],
        FilterSupplier: true,
      },
    ],
  },
];
