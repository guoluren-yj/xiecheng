module.exports = [
  {
    path: '/swfl/process-appoint',
    models: [() => import('../models/processAppoint.js')],
    component: () => import('../routes/ProcessAppoint'),
    FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/hwfp/process-define',
    models: [() => import('../models/processDefine')],
    FilterSupplier: true,
    components: [
      {
        path: '/hwfp/process-define/list',
        component: () => import('../routes/ProcessDefine'),
        models: [() => import('../models/processDefine')],
        FilterSupplier: true,
      },
      {
        path: '/hwfp/process-define/detail/:processId',
        component: () => import('../routes/ProcessDefine/Detail'),
        models: [() => import('../models/processDefine')],
        FilterSupplier: true,
      },
      {
        path: '/hwfp/process-define/approval-detail/:approvalId',
        component: () => import('../routes/ProcessDefine/ApprovalDetail'),
        models: [() => import('../models/processDefine')],
        FilterSupplier: true,
      },
    ],
  },
  // 自动处理规则
  {
    path: '/hwfp/automatic-process',
    component: () => import('../routes/AutomaticProcess'),
    models: [() => import('../models/automaticProcess')],
    FilterSupplier: true,
  },
  // 流程监控
  {
    path: '/hwfp/monitor',
    models: [() => import('../models/monitor')],
    FilterSupplier: true,
    components: [
      {
        path: '/hwfp/monitor/list',
        component: () => import('../routes/Monitor/List'),
        models: [() => import('../models/monitor')],
        FilterSupplier: true,
      },
      {
        path: '/hwfp/monitor/create',
        component: () => import('../routes/Monitor/Detail'),
        models: [() => import('../models/monitor')],
        FilterSupplier: true,
      },
      {
        path: '/hwfp/monitor/detail/:id',
        component: () => import('../routes/Monitor/Detail'),
        models: [() => import('../models/monitor')],
        FilterSupplier: true,
      },
    ],
  },
  // 表单管理
  {
    path: '/hwfp/form-manage',
    FilterSupplier: true,
    component: () => import('../routes/FormManage'),
    models: [() => import('../models/formManage')],
  },
  // 流程启动
  {
    path: '/hwfp/process-start',
    FilterSupplier: true,
    component: () => import('../routes/ProcessStart'),
    models: [() => import('../models/processStart')],
  },
  // 我发起的流程
  {
    path: '/hwfp/start-by-task',
    FilterSupplier: true,
    models: [() => import('../models/startByTask')],
    components: [
      {
        path: '/hwfp/start-by-task/list',
        component: () => import('../routes/StartByTask/List'),
        models: [() => import('../models/startByTask')],
        FilterSupplier: true,
      },
      {
        path: '/hwfp/start-by-task/detail/:id',
        component: () => import('../routes/StartByTask/Detail'),
        models: [() => import('../models/startByTask')],
        FilterSupplier: true,
      },
    ],
  },
  // 我参与的流程
  {
    path: '/hwfp/involved-task',
    FilterSupplier: true,
    models: [() => import('../models/involvedTask')],
    components: [
      {
        path: '/hwfp/involved-task/list',
        FilterSupplier: true,
        component: () => import('../routes/InvolvedTask/List'),
        models: [() => import('../models/involvedTask')],
      },
      {
        path: '/hwfp/involved-task/detail/:id',
        FilterSupplier: true,
        component: () => import('../routes/InvolvedTask/Detail'),
        models: [() => import('../models/involvedTask')],
      },
    ],
  },
  // 待办事项
  {
    path: '/hwfp/task',
    FilterSupplier: true,
    models: [() => import('../models/task')],
    components: [
      {
        path: '/hwfp/task/list',
        FilterSupplier: true,
        // component: () => import('../routes/Task/List'),
        component: () => import('../routes/TaskNew/List'),
        models: [() => import('../models/task')],
      },
    ],
  },
  {
    path: '/hwfp/task/detail/:id/:processInstanceId',
    authorized: true,
    //  component: () => import('../routes/Task/Detail'),
    component: () => import('../routes/TaskNew/Detail'),
    FilterSupplier: true,
    models: [() => import('../models/task')],
  },
  // 审批工作台
  {
    path: '/hwfp/approval',
    // authorized: true,
    FilterSupplier: true,
    models: [
      () => import('../models/task'),
      () => import('../models/involvedTask'),
      () => import('../models/carbonCopyTask'),
      () => import('../models/startByTask'),
      () => import('../models/automaticProcess'),
      () => import('../models/delegate'),
    ],
    components: [
      {
        path: '/hwfp/approval/list',
        component: () => import('../routes/Approval'),
        FilterSupplier: true,
        models: [() => import('../models/task')],
      },
    ],
  },
  {
    path: '/hwfp/approval/task/detail/:id/:processInstanceId',
    authorized: true,
    component: () => import('../routes/Approval/Task/Detail/NewTab'),
    FilterSupplier: true,
    models: [() => import('../models/task')],
  },
  {
    path: '/hwfp/approval/involved-task/detail/:id',
    authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/Approval/InvolvedTask/Detail/NewTab'),
    models: [() => import('../models/involvedTask')],
  },
  {
    path: '/hwfp/approval/carbon-copy-task/detail/:id',
    authorized: true,
    component: () => import('../routes/Approval/CarbonCopyTask/Detail/NewTab'),
    models: [() => import('../models/carbonCopyTask')],
    FilterSupplier: true,
  },
  {
    path: '/hwfp/approval/start-by-task/detail/:id',
    authorized: true,
    component: () => import('../routes/Approval/StartByTask/Detail/NewTab'),
    models: [() => import('../models/startByTask')],
    FilterSupplier: true,
  },
  // 接口定义
  {
    path: '/hwfp/interface-definition',
    FilterSupplier: true,
    models: [() => import('../models/interfaceDefinition')],
    components: [
      {
        path: '/hwfp/interface-definition/list',
        FilterSupplier: true,
        models: [() => import('../models/interfaceDefinition')],
        component: () => import('../routes/InterfaceDefinition'),
      },
      {
        path: '/hwfp/interface-definition/detail/:interfaceId',
        FilterSupplier: true,
        models: [() => import('../models/interfaceDefinition')],
        component: () => import('../routes/InterfaceDefinition/Detail'),
      },
    ],
  },
  {
    path: '/pub/hwfp/interface-definition/detail/:interfaceId',
    component: () => import('../routes/InterfaceDefinition/Detail'),
    authorized: true,
    key: '/pub/hwfp/interface-definition/detail/:interfaceId',
    models: [() => import('../models/interfaceDefinition')],
  },
  // 服务定义
  {
    path: '/hwfp/service-definition',
    FilterSupplier: true,
    models: [() => import('../models/serviceDefinition')],
    components: [
      {
        path: '/hwfp/service-definition/list',
        FilterSupplier: true,
        models: [() => import('../models/serviceDefinition')],
        component: () => import('../routes/ServiceDefinition'),
      },
      {
        path: '/hwfp/service-definition/detail/:serviceId',
        FilterSupplier: true,
        models: [() => import('../models/serviceDefinition')],
        component: () => import('../routes/ServiceDefinition/Detail'),
      },
    ],
  },
  // 流程分类
  {
    path: '/hwfp/setting/categories',
    FilterSupplier: true,
    components: [
      {
        path: '/hwfp/setting/categories/list',
        component: () => import('../routes/Categories'),
        FilterSupplier: true,
        models: [() => import('../models/categories')],
      },
      {
        path: '/hwfp/setting/categories/detail/:id',
        component: () => import('../routes/Categories/Detail'),
        FilterSupplier: true,
        models: [() => import('../models/categories')],
      },
      {
        path: '/hwfp/setting/categories/create',
        component: () => import('../routes/Categories/Detail'),
        models: [() => import('../models/categories')],
        FilterSupplier: true,
      },
    ],
    models: [() => import('../models/categories')],
  },
  // 流程单据
  {
    path: '/hwfp/setting/documents',
    FilterSupplier: true,
    components: [
      {
        path: '/hwfp/setting/documents/list',
        FilterSupplier: true,
        component: () => import('../routes/Documents'),
        models: [() => import('../models/documents')],
      },
      {
        path: '/hwfp/setting/documents/detail/:id',
        component: () => import('../routes/Documents/Detail'),
        models: [() => import('../models/documents')],
        FilterSupplier: true,
      },
      {
        path: '/hwfp/setting/documents/create',
        component: () => import('../routes/Documents/Detail'),
        models: [() => import('../models/documents')],
        FilterSupplier: true,
      },
    ],
    models: [() => import('../models/documents')],
  },
  // 我抄送的流程
  {
    path: '/hwfp/carbon-copy-task',
    FilterSupplier: true,
    models: [() => import('../models/carbonCopyTask')],
    components: [
      {
        path: '/hwfp/carbon-copy-task/list',
        FilterSupplier: true,
        component: () => import('../routes/CarbonCopyTask/List'),
        models: [() => import('../models/carbonCopyTask')],
      },
      {
        authorized: true,
        FilterSupplier: true,
        path: '/hwfp/carbon-copy-task/detail/:id',
        component: () => import('../routes/CarbonCopyTask/Detail'),
        models: [() => import('../models/carbonCopyTask')],
      },
    ],
  },
  // 自动转交
  {
    path: '/hwfp/delegate',
    FilterSupplier: true,
    component: () => import('../routes/Delegate'),
    models: [() => import('../models/delegate')],
  },
  // 流程转交
  {
    path: '/hwfp/process-delegate',
    FilterSupplier: true,
    models: [() => import('../models/processDelegate')],
    component: () => import('../routes/ProcessDelegate'),
  },
  // 工作流整合
  {
    path: '/hwfp/process-configuration',
    models: [],
    component: () => import('../routes/ProcessConfiguration'),
  },
  // 审批工作台pub
  {
    path: '/pub/hwfp/approval',
    authorized: true,
    FilterSupplier: true,
    models: [
      () => import('../models/task'),
      () => import('../models/involvedTask'),
      () => import('../models/carbonCopyTask'),
      () => import('../models/startByTask'),
      () => import('../models/automaticProcess'),
      () => import('../models/delegate'),
    ],
    components: [
      {
        path: '/pub/hwfp/approval/list',
        component: () => import('../routes/Approval'),
        authorized: true,
        FilterSupplier: true,
        models: [
          () => import('../models/task'),
          () => import('../models/involvedTask'),
          () => import('../models/carbonCopyTask'),
          () => import('../models/startByTask'),
          () => import('../models/automaticProcess'),
          () => import('../models/delegate'),
        ],
      },
    ],
  },
  // 待审批明细 pub
  {
    path: '/pub/hwfp/approval/task/detail/:id/:processInstanceId',
    authorized: true,
    component: () => import('../routes/Approval/Task/Detail/NewTab'),
    FilterSupplier: true,
    models: [() => import('../models/task')],
  },
  {
    title: 'ces',
    path: '/hwfp/test',
    authorized: true,
    component: () => import('../routes/StandardFormTest'),
  },
  {
    path: '/hwfp/dynamic-table-config',
    component: () => import('../routes/DynamicTableConfig'),
  },
  {
    path: '/hwfp/scux-goldrain-group/:processInstanceId',
    authorized: true,
    // title: '中转审批表单',
    component: () => import('../routes/GoldRainGroup/index.js'),
  },
];
