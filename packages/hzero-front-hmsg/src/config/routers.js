module.exports = [
  {
    path: '/hmsg/email',
    component: () => import('../routes/Email'),
    models: [() => import('../models/email')],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/message-query',
    models: [() => import('../models/messageQuery')],
    component: () => import('../routes/MessageQuery'),
    FilterSupplier: true,
  },
  {
    path: '/hmsg/message-template',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hmsg/message-template/list',
        component: () => import('../routes/MessageTemplate/List'),
        models: [() => import('../models/messageTemplate')],
        FilterSupplier: true,
      },
      {
        path: '/hmsg/message-template/create',
        component: () => import('../routes/MessageTemplate/Detail'),
        models: [() => import('../models/messageTemplate')],
        FilterSupplier: true,
      },
      {
        path: '/hmsg/message-template/detail/:id/:tenantId',
        component: () => import('../routes/MessageTemplate/Detail'),
        models: [() => import('../models/messageTemplate')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hmsg/receive-config',
    component: () => import('../routes/ReceiveConfig'),
    models: [() => import('../models/receiveConfig')],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/receiver-type',
    component: () => import('../routes/ReceiverType'),
    models: [() => import('../models/receiverType')],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/send-config',
    models: [() => import('../models/sendConfig')],
    FilterSupplier: true,
    components: [
      {
        path: '/hmsg/send-config/list',
        component: () => import('../routes/SendConfig/List'),
        models: [() => import('../models/sendConfig')],
        FilterSupplier: true,
      },
      {
        path: '/hmsg/send-config/create',
        component: () => import('../routes/SendConfig/Detail'),
        models: [() => import('../models/sendConfig')],
        FilterSupplier: true,
      },
      {
        path: '/hmsg/send-config/detail/:id',
        component: () => import('../routes/SendConfig/Detail'),
        models: [() => import('../models/sendConfig')],
        FilterSupplier: true,
      },
      {
        path: '/hmsg/send-config/message-send',
        FilterSupplier: true,
        models: [() => import('../models/messageQuery')],
        component: () => import('../routes/SendConfig/MessageSend'),
      },
    ],
  },
  {
    path: '/hmsg/sms-config',
    component: () => import('../routes/SMSConfig'),
    models: [() => import('../models/smsConfig')],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/user-message',
    models: [],
    components: [
      {
        authorized: true,
        title: 'hzero.common.title.userMessage',
        key: '/hmsg/user-message',
        path: '/hmsg/user-message/list',
        component: () => import('../routes/UserMessage'),
        models: [() => import('../models/userMessage')],
      },
      {
        authorized: true,
        title: 'hzero.common.title.userMessage',
        key: '/hmsg/user-message',
        // 当详情页展示的公告信息时, userMessageId 时 noticeId
        path: '/hmsg/user-message/detail/:type/:userMessageId',
        component: () => import('../routes/UserMessage/MessageDetail'),
        models: [() => import('../models/userMessage')],
      },
      {
        authorized: true,
        title: 'hzero.common.title.userMessage',
        key: '/hmsg/user-message',
        // 当详情页展示的公告信息时, userMessageId 时 noticeId
        path: '/hmsg/user-message/detail/:userMessageId',
        component: () => import('../routes/UserMessage/MessageDetail'),
        models: [() => import('../models/userMessage')],
      },
    ],
  },
  {
    path: '/hmsg/notices',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/hmsg/notices/list',
        component: () => import('../routes/Notice'),
        models: [() => import('../models/hmsgNotice')],
        FilterSupplier: true,
      },
      {
        path: '/hmsg/notices/detail/:noticeId',
        component: () => import('../routes/Notice/NoticeDetail'),
        models: [() => import('../models/hmsgNotice')],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/hmsg/wechat-config',
    component: () => import('../routes/WechatConfig'),
    models: [],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/official-accounts-config',
    component: () => import('../routes/OfficialAccountsConfig'),
    models: [],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/ding-talk-config',
    component: () => import('../routes/DingTalkConfig'),
    models: [],
    FilterSupplier: true,
  },
  {
    path: '/hmsg/call-server',
    component: () => import('../routes/CallServer'),
    FilterSupplier: true,
  },
  {
    path: '/hmsg/webhook-config',
    authorized: true,
    component: () => import('../routes/WebHookConfig'),
    FilterSupplier: true,
  },
];
