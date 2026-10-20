module.exports = [
  /** *****************************************平台层路由************************************ */
  // 应用定义(平台)
  {
    path: '/smbl/application/definition',
    models: [],
    components: [
      {
        path: '/smbl/application/definition/list',
        component: () => import('../routes/Application'),
      },
    ],
  },
  // 队列定义(平台)
  {
    path: '/smbl/queue/definition',
    models: [],
    components: [
      {
        path: '/smbl/queue/definition/list',
        component: () => import('../routes/QueueTag'),
      },
      // {
      //   path: '/smbl/queue/definition/consumer/:tagId',
      //   component: () => import('../routes/QueueTag/queueConsumer.js'),
      // },
      {
        path: '/smbl/queue/definition/queueTagParams/:topicId',
        component: () => import('../routes/QueueTag/queueTagParams.js'),
      },
    ],
  },
  // 队列数据(平台)
  {
    path: '/smbl/queue/data',
    models: [],
    components: [
      {
        path: '/smbl/queue/data/list',
        component: () => import('../routes/QueueTagData'),
      },
    ],
  },
  // 三方平台(平台)
  {
    path: '/smbl/thirdplatform/def',
    models: [],
    components: [
      {
        path: '/smbl/thirdplatform/def/list',
        component: () => import('../routes/ThirdParty'),
      },
      // {
      //   path: '/smbl/thirdplatform/def/param/:thirdPartyId',
      //   component: () => import('../routes/ThirdParty/thirdPartyParam.js'),
      // },
    ],
  },
  // APP版本控制(平台)
  {
    path: '/smbl/appVersion/def',
    models: [],
    components: [
      {
        path: '/smbl/appVersion/def/list',
        component: () => import('../routes/AppVersion'),
      },
      {
        path: '/smbl/appVersion/def/param/:appVersionId',
        component: () => import('../routes/AppVersion/AppVersionParam.js'),
      },
    ],
  },
  // 三方平台运营账号(平台)
  {
    path: '/smbl/thirdplatform/account/def',
    models: [],
    components: [
      {
        path: '/smbl/thirdplatform/account/def/list',
        component: () => import('../routes/ThirdPartyAcc'),
      },
      // {
      //   path: '/smbl/thirdplatform/account/def/param/:thirdPartyAccountId',
      //   component: () => import('../routes/ThirdPartyAcc/thirdPartyAccParam.js'),
      // },
    ],
  },
  // 三方平台用户关系(平台)
  {
    path: '/smbl/thirdplatform/relation/user/site',
    component: () => import('../routes/ThirdPartyRelationSite/index'),
    models: [],
  },
  // 消息频道(平台)
  {
    path: '/smbl/message-channel/definition/site', // 路由地址
    component: () => import('../routes/MessageChannel/index'), // 页面组件入口文件相对路径
    models: [],
  },
  // 消息发送记录(平台)
  {
    path: '/smbl/message-record/manage/site', // 路由地址
    component: () => import('../routes/MessageRecordSite/index'), // 页面组件入口文件相对路径
    models: [],
  },
  // 页面个性化（平台）
  {
    path: '/smbl/page/customize', // 路由地址
    component: () => import('../routes/PageCustomize/index'), // 页面组件入口文件相对路径
    models: [],
  },

  // link中转
  {
    path: '/pub/smbl/link/jump', // 路由地址
    authorized: true,
    component: () => import('../routes/LinkJump/index'), // 页面组件入口文件相对路径
    models: [],
  },
  /** *****************************************租户层路由************************************ */
  // 子应用组(租户)
  {
    path: '/smbl/subapplication/group/org', // 路由地址
    component: () => import('../routes/SubApplicationGroup/index.js'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [
      () => import('../models/SubApplicationGroup/index.js'), // 页面数据逻辑models相对路径
    ],
  },
  // 子应用(租户)
  {
    path: '/smbl/subapplication/definition/org',
    component: () => import('../routes/SubApplicationMaintain'),
    FilterSupplier: true,
  },
  // 三方平台用户关系(租户)
  {
    path: '/smbl/thirdplatform/relation/user/org',
    FilterSupplier: true,
    component: () => import('../routes/ThirdPartyRelation/index'),
    models: [],
  },
  // 消息发送记录(租户)
  {
    path: '/smbl/message-record/manage/org', // 路由地址
    component: () => import('../routes/MessageRecord/index'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [],
  },
  // banner(租户)
  {
    path: '/smbl/banner/manage/org', // 路由地址
    component: () => import('../routes/Banner/index'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [],
  },
  // 消息模板-子应用映射配置（租户）
  {
    path: '/smbl/msg-url-mapping/config/org', // 路由地址
    component: () => import('../routes/MsgUrlMapping/index'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [],
  },
  // 卡片配置（租户）
  {
    path: '/smbl/card-mapping/config/org', // 路由地址
    component: () => import('../routes/CardMapping/index'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [],
  },
  // 角色常用子应用管理列表（租户）
  {
    path: '/smbl/common-sub-app',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smbl/common-sub-app/org',
        component: () => import('../routes/SubApplicationCommon'),
      },
    ],
  },
  // 组件个性化（租户）
  {
    path: '/smbl/component/customize', // 路由地址
    component: () => import('../routes/ComponentCustomize/index'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [],
  },
  // 移动个性化管理（租户）
  {
    path: '/smbl/customize/manage/org', // 路由地址
    component: () => import('../routes/CustomizeManage/index'), // 页面组件入口文件相对路径
    FilterSupplier: true,
    models: [],
  },
  // 服务号推文模板配置（租户）
  {
    path: '/smbl/wechat-tweet/config/org', // 路由地址
    components: [
      {
        path: '/smbl/wechat-tweet/config/org/list',
        component: () => import('../routes/WechatTweet'),
      },
      {
        path: '/smbl/wechat-tweet/config/org/create/:templateId',
        component: () => import('../routes/WechatTweet/create'),
      },
    ],
    FilterSupplier: true,
    models: [],
  },
  // 寻商问品
  {
    path: '/smbl/wide-area-sourcing',
    models: [() => import('../models/wideAreaSource')],
    components: [
      {
        path: '/smbl/wide-area-sourcing/list',
        models: [() => import('../models/wideAreaSource')],
        component: () => import('../routes/WideAreaSourcing'),
      },
    ],
  },
  {
    path: '/pub/smbl/wide-area-sourcing',
    authorized: true,
    models: [() => import('../models/wideAreaSource')],
    components: [
      {
        path: '/pub/smbl/wide-area-sourcing/list',
        authorized: true,
        models: [() => import('../models/wideAreaSource')],
        component: () => import('../routes/WideAreaSourcing'),
      },
    ],
  },
  // 技能树（租户）
  {
    path: '/smbl/purchase-robot/config', // 路由地址
    components: [
      {
        path: '/smbl/purchase-robot/config/list',
        component: () => import('../routes/PurchaseRobotConfig'),
      },
      {
        path: '/smbl/purchase-robot/config/message-template-detail',
        component: () => import('../routes/PurchaseRobotConfig/MessageTemplateDetail'),
      },
      {
        path: '/smbl/purchase-robot/config/skill/detail/:skillId',
        component: () => import('../routes/PurchaseRobotConfig/SkillTreeDetail'),
      },
    ],
    FilterSupplier: true,
    models: [],
  },
  // 知识库维护
  {
    path: '/smbl/purchase-robot/knowledge',
    component: () => import('../routes/PurchaseRobotKnowledge'),
    FilterSupplier: true,
    models: [],
  },
  // 问答助手管理
  {
    path: '/smbl/purchase-robot/assistant-config',
    component: () => import('../routes/PurchaseRobotConfig/AssistantConfig'),
    FilterSupplier: true,
    models: [],
  },
  // 人工客服
  {
    path: '/smbl/purchase-robot/customer',
    component: () => import('../routes/PurchaseRobotCustomer'),
    FilterSupplier: true,
    models: [],
  },
  // 业务预警配置
  {
    path: '/smbl/purchase-robot/webhook',
    components: [
      {
        path: '/smbl/purchase-robot/webhook/list',
        component: () => import('../routes/PurchaseRobotWebhook'),
      },
      {
        path: '/smbl/purchase-robot/webhook/detail/:webhookRobotId',
        component: () => import('../routes/PurchaseRobotWebhook/Detail'),
      },
    ],
    FilterSupplier: true,
    models: [],
  },
  // 智能客服配置中心
  {
    path: '/smbl/purchase-robot/customer-config',
    component: () => import('../routes/PurchaseRobotCustomerConfig'),
    FilterSupplier: true,
    models: [],
  },
  // 智能客服看板
  {
    path: '/smbl/purchase-robot/customer-board',
    component: () => import('../routes/CustomerAssignBoard'),
    FilterSupplier: true,
    models: [],
  },
  // 智能客服看板
  {
    path: '/smbl/test/romote',
    component: () => import('../routes/Test'),
    FilterSupplier: false,
    models: [],
  },
  // 客服使用报表
  {
    path: '/smbl/cux/purchase-robot/customer-report',
    component: () => import('../routes/CUX/XBK-PurchaseRobotCustomerReport'),
    FilterSupplier: true,
    models: [],
  },
  // 即刻3.0在线沟通嵌入页
  {
    path: '/pub/smbl/chat-hub',
    authorized: true,
    component: () => import('../routes/ChatHub'),
    FilterSupplier: false,
    models: [],
  },
  // 即刻3.0在线沟通嵌入页
  {
    path: '/pub/smbl/chat-hub-room',
    authorized: true,
    component: () => import('../routes/ChatHubRoom'),
    FilterSupplier: true,
    models: [],
  },

  // 新 AI 助理
  {
    path: '/public/smbl/multi-platform-assistant',
    component: () => import('../routes/MultiPlatform'),
    FilterSupplier: false,
    models: [],
    authorized: true,
  },

  // 智能审核规则配置
  {
    path: '/smbl/check/rules',
    component: () => import('../routes/CheckRulesMgt'),
    models: [],
  },

  {
    path: '/pub/smbl/check-result',
    component: () => import('../routes/PubCheckRule'),
    authorized: true,
    models: [],
  },

  {
    path: '/pub/smbl/check-result-card-panel',
    component: () => import('../routes/PanguCheckResult'),
    authorized: true,
    models: [],
  },

  {
    path: '/smbl/check/reports',
    component: () => import('../routes/AiChekReport'),
    models: [],
    authorized: true,
  },
];
