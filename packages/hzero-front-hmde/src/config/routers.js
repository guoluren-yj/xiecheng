module.exports = [
  // 模型改造-基础表-平台
  {
    path: '/hmde/physical-model',
    component: () => import('../routes/Modeler/BasicTable'),
    FilterSupplier: true,
  },
  // 模型改造-基础表-租户
  {
    path: '/hmde/tenant-physical-model',
    component: () => import('../routes/Modeler/BasicTable'),
    FilterSupplier: true,
  },
  // 模型改造-模型设计器-平台
  {
    path: '/hmde/logic-model',
    component: () => import('../routes/Modeler/ModelDesigner'),
    FilterSupplier: true,
  },
  // 模型改造-模型设计器-租户
  {
    path: '/hmde/tenant-logic-model',
    component: () => import('../routes/Modeler/ModelDesigner'),
    FilterSupplier: true,
  },
  // 模型改造-数据对象配置-平台
  {
    path: '/hmde/data-object',
    component: () => import('../routes/Modeler/DataSourceConfig'),
    FilterSupplier: true,
  },
  // 模型改造-数据对象配置-租户
  {
    path: '/hmde/tenant-data-object',
    component: () => import('../routes/Modeler/DataSourceConfig'),
    FilterSupplier: true,
  },
  // 测试钻取组件
  {
    path: '/hmde/drill',
    component: () => import('../businessComponents/DrillComponent/demo'),
    FilterSupplier: true,
  },
  // 业务对象
  {
    path: '/hmde/business-object',
    FilterSupplier: true,
    components: [
      {
        path: '/hmde/business-object/list',
        component: () => import('../routes/BusinessObject/DomainOwnBOList'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object/detail/:id', // 这个id根据实际情况修改名称，如果需要多个变量，依次加上/:xxx
        component: () => import('../routes/BusinessObject/Detail'),
        FilterSupplier: true,
      },
      // 新增字段详情
      {
        path: '/hmde/business-object/field/create',
        component: () => import('../routes/BusinessObject/Detail/FieldsList/AddAndEditField'),
        FilterSupplier: true,
      },
      // 编辑字段详情
      {
        path: '/hmde/business-object/field/edit',
        component: () => import('../routes/BusinessObject/Detail/FieldsList/AddAndEditField'),
        FilterSupplier: true,
      },
      // 字段依赖管理
      {
        path: '/hmde/business-object/field/rely',
        component: () => import('../routes/BusinessObject/Detail/FieldsList/FieldRely'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object/export/field',
        component: () =>
          import('../routes/BusinessObject/Detail/ExportTemplate/ExportTemplateFields'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object/import/field',
        component: () =>
          import('../routes/BusinessObject/Detail/ImportTemplate/TemplateConfigPage'),
        FilterSupplier: true,
      },
      // 触发器规则列表
      // {
      //   path: '/hmde/business-object/trigger-rule/:id',
      //   component: () => import('../routes/BusinessObject/Detail/TriggerList/TriggerRuleList'),
      //   FilterSupplier: true,
      // },
      // 触发器规则详情
      // {
      //   path: '/hmde/business-object/trigger-rule-detail/:type/:id',
      //   component: () => import('../routes/BusinessObject/Detail/TriggerList/TriggerRuleDetail'),
      //   FilterSupplier: true,
      // },
      {
        path: '/hmde/business-object/rule/create',
        component: () => import('../routes/BusinessObject/Detail/Rules/Rule'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object/rule/detail',
        component: () => import('../routes/BusinessObject/Detail/Rules/Rule'),
        FilterSupplier: true,
      },
      // 事件流程
      // {
      //   path: '/hmde/business-object/event-flow/:id/:code',
      //   component: () => import('../routes/BusinessObject/Detail/EventFlow/Detail'),
      //   FilterSupplier: true,
      // },
    ],
  },
  // 领域
  {
    path: '/hmde/domain',
    FilterSupplier: true,
    components: [
      {
        path: '/hmde/domain/list',
        component: () => import('../routes/Domain'),
        FilterSupplier: true,
      },
      // 新增字段详情
      {
        path: '/hmde/domain/field/create',
        component: () => import('../routes/BusinessObject/Detail/FieldsList/AddAndEditField'),
        FilterSupplier: true,
      },
      // 编辑字段详情
      {
        path: '/hmde/domain/field/edit',
        component: () => import('../routes/BusinessObject/Detail/FieldsList/AddAndEditField'),
        FilterSupplier: true,
      },
    ],
  },
  // 脚本事件
  {
    path: '/hmde/script-event',
    FilterSupplier: true,
    components: [
      {
        path: '/hmde/script-event/list',
        component: () => import('../routes/ScriptEvent'),
        FilterSupplier: true,
      },
      // 脚本事件详情编辑,type=edit
      {
        path: '/hmde/script-event/:type/:id',
        component: () => import('../routes/ScriptEvent/ScriptEventDetail'),
        FilterSupplier: true,
      },
      // 脚本事件详情查看,type=detail
      {
        path: '/pub/hmde/script-event/:type/:id',
        component: () => import('../routes/ScriptEvent/ScriptEventDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 脚本应用
  {
    path: '/hmde/script-utility',
    component: () => import('../routes/ScriptUtility'),
    FilterSupplier: true,
  },
  // 事务处理流
  {
    path: '/hmde/definition',
    FilterSupplier: true,
    components: [
      {
        path: '/hmde/definition/list',
        component: () => import('../routes/ProcessDefinition'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/definition/designer/:type',
        component: () => import('../routes/ProcessDefinition/Designer'),
        FilterSupplier: true,
      },
      {
        path: '/pub/hmde/definition/designer/:type',
        component: () => import('../routes/ProcessDefinition/Designer'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hmde/business-object-composition',
    FilterSupplier: true,
    components: [
      {
        path: '/hmde/business-object-composition/list',
        component: () => import('../routes/BusinessObjectComposition'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object-composition/detail/:id',
        component: () => import('../routes/BusinessObjectComposition/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object-composition/export/field',
        component: () =>
          import('@/routes/BusinessObjectComposition/Detail/ExportTemplate/ExportTemplateFields'),
        FilterSupplier: true,
      },
      {
        path: '/hmde/business-object-composition/import/field',
        component: () =>
          import('@/routes/BusinessObjectComposition/Detail/ImportTemplate/TemplateConfigPage'),
        FilterSupplier: true,
      },
    ],
  },
];
