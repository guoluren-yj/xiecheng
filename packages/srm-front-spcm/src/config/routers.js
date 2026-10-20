/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-13 11:05:55
 * @LastEditTime: 2025-11-19 14:47:28
 * @LastEditors: Please set LastEditors
 */
module.exports = [
  // 协议拟制
  {
    path: '/spcm/contract-maintain',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-maintain/list',
        models: [
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/newContract.js'),
        ],
        component: () => import('../routes/ContractMaintain'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-maintain/detail',
        models: [
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/purchaseContractType.js'),
          () => import('../models/newContract.js'),
        ],
        component: () => import('../routes/ContractMaintain/Detail'),
        FilterSupplier: true,
      },
      {
        // 引用采购申请
        path: '/spcm/contract-maintain/purchase-contract',
        models: [() => import('../models/purchaseApplicationContract.js')],
        component: () => import('../routes/PurchaseContract'),
        FilterSupplier: true,
      },
      {
        // 引用寻源结果
        path: '/spcm/contract-maintain/quoteSource',
        models: [
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractMaintain/QuoteSourceResult'),
        FilterSupplier: true,
      },
      {
        // 引用采购订单
        path: '/spcm/contract-maintain/quote-purchase-order',
        models: [() => import('../models/contractMaintain.js')],
        component: () => import('../routes/ContractMaintain/QuotePurchaseOrder'),
        FilterSupplier: true,
      },
    ],
  },
  // 协议类型管理
  {
    path: '/spcm/purchase-contract-type',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/purchase-contract-type/list',
        models: [() => import('../models/purchaseContractType.js')],
        component: () => import('../routes/PurchaseContactType'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/purchase-contract-type/detail',
        models: [
          () => import('../models/purchaseContractType.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/newContract.js'),
        ],
        component: () => import('../routes/PurchaseContactType/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 协议模板
  {
    path: '/spcm/contract-template',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-template/list',
        models: [
          () => import('../models/contractTemplate.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractTemplate'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-template/detail',
        models: [
          () => import('../models/contractTemplate.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractTemplate/Detail/TemplateDetail'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-template/config/:pcTemplateId',
        models: [
          () => import('../models/contractTemplate.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractTemplate/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-template/version/:pcTemplateId',
        models: [
          () => import('../models/contractTemplate.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractTemplate/HistoricVersion'),
        FilterSupplier: true,
      },
    ],
  },

  // 全屏预览
  {
    path: '/pub/spcm/components',
    models: [],
    authorized: true,
    title: 'hzero.common.title.userInfo',
    component: [
      {
        path: '/pub/spcm/components/editor-online',
        models: [() => import('../models/editorOnline.js')],
        component: () => import('../routes/components/EditorOnline'),
        authorized: true,
        title: 'hzero.common.title.userInfo',
      },
    ],
  },

  // 协议审批
  {
    path: '/spcm/contract-approval',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-approval/list',
        models: [
          () => import('../models/contractApproval.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractApproval'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-approval/detail',
        models: [
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractApproval.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractApproval/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 协议签署
  {
    path: '/spcm/contract-sign',
    models: [],
    components: [
      {
        path: '/spcm/contract-sign/list',
        models: [
          () => import('../models/contractSign.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractSign'),
      },
      {
        path: '/spcm/contract-sign/detail',
        models: [
          () => import('../models/contractSign.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractSign/Detail'),
      },
      {
        path: '/spcm/contract-sign/contract-history-compare',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/PurchaseContractView/Detail/infoChangeCompare'),
      },
    ],
  },
  // 我发出的协议
  {
    path: '/spcm/purchase-contract-view',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/purchase-contract-view/list',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/PurchaseContractView'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/purchase-contract-view/detail',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/PurchaseContractView/Detail'),
        FilterSupplier: true,
      },
      // 我发起的协议明细页面：不受菜单权限控制，提供给其他模块使用
      {
        path: '/spcm/purchase-contract-view/other-detail',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/PurchaseContractView/Detail'),
        authorized: true,
        title: 'hzero.common.view.message.title.contractDetail',
      },
      {
        path: '/spcm/purchase-contract-view/contract-history-compare',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/PurchaseContractView/Detail/infoChangeCompare'),
        FilterSupplier: true,
      },
    ],
  },
  // 我收到的协议
  {
    path: '/spcm/supplier-contract-view',
    models: [],
    components: [
      {
        path: '/spcm/supplier-contract-view/list',
        models: [
          () => import('../models/supplierContractView.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/SupplierContractView'),
      },
      {
        path: '/spcm/supplier-contract-view/detail',
        models: [
          () => import('../models/supplierContractView.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/SupplierContractView/Detail'),
      },
    ],
  },

  // 协议用章
  {
    path: '/spcm/contract-chapter',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-chapter/list',
        models: [
          () => import('../models/contractChapter.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractChapter'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-chapter/detail',
        models: [
          () => import('../models/contractChapter.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractChapter/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 协议变更
  {
    path: '/spcm/contract-change',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-change/list',
        models: [
          () => import('../models/contractChange.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractChange'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-change/detail/:id',
        models: [
          () => import('../models/contractChange.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractChange/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 合同报表
  {
    path: '/spcm/contract-statement',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-statement/list',
        models: [
          () => import('../models/contractStatement.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () => import('../routes/ContractStatement'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-statement/detail',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractStatement/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * 工作流嵌入协议审批详情页面
   */
  {
    path: '/pub/spcm/purchase-contract-view/detail/:id',
    models: [
      () => import('../models/purchaseContractView.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/contractMaintain.js'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/PurchaseContractView/Detail'),
    authorized: true,
  },
  {
    path: '/pub/spcm/contract-approval/detail',
    models: [
      () => import('../models/purchaseContractView.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/contractMaintain.js'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/PurchaseContractView/Detail'),
    authorized: true,
  },
  // 工作台只读页pub
  {
    path: '/pub/spcm/contract-workspace/view/:pcHeaderId',
    models: [
      () => import('../models/workSpace.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/contractMaintain.js'),
      () => import('../models/contractChapter'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/workspace/Detail/view'),
    authorized: true,
  },
  // 协议详情审批
  {
    path: '/pub/spcm/contract-workspace/contract-approval-new/:pcHeaderId',
    models: [
      () => import('../models/workSpace.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/contractMaintain.js'),
      () => import('../models/contractChapter'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/workspace/ContractApprovalWF'),
    authorized: true,
  },
  // 工作台签署页pub
  // {
  //   path: '/pub/spcm/contract-workspace/chapter/:pcHeaderId',
  //   models: [
  //     () => import('../models/workSpace.js'),
  //     () => import('../models/contractCommon.js'),
  //     () => import('../models/contractMaintain.js'),
  //     () => import('../models/contractChapter'),
  //     () => import('../models/editorOnline.js'),
  //   ],
  //   component: () => import('../routes/workspace/Detail/chapter'),
  //   authorized: true,
  // },
  /**
   * [伽蓝]工作流嵌入协议审批法务审批节点详情页面
   */
  // {
  //   path: '/pub/legal/spcm/purchase-contract-view/detail/:id',
  //   models: [
  //     () => import('../models/purchaseContractView.js'),
  //     () => import('../models/contractCommon.js'),
  //     () => import('../models/editorOnline.js'),
  //     () => import('../models/contractMaintain.js'),
  //   ],
  //   component: () => import('../routes/PurchaseContractView/Detail'),
  //   authorized: true,
  // },
  {
    authorized: true,
    path: '/spcm/contract-subject/data-import/:code',
    title: 'hzero.common.title.batchImport',
    component: () => import('../routes/himp/CommentImport'),
    models: [],
  },
  {
    path: '/pub/spcm/contract-sign/detail',
    models: [
      () => import('../models/contractSign.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/ContractSign/Detail'),
    authorized: true,
  },
  {
    path: '/pub/spcm/contract-change/detail/:id',
    models: [
      () => import('../models/contractChange.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/ContractChange/Detail'),
    authorized: true,
  },
  {
    path: '/pub/spcm/supplier-contract-view/detail',
    models: [
      () => import('../models/supplierContractView.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/SupplierContractView/Detail'),
    authorized: true,
  },
  // 协议模板工作流审批
  {
    path: '/pub/spcm/contract-template/list/:pcTemplateId',
    models: [
      () => import('../models/contractTemplate.js'),
      () => import('../models/contractCommon.js'),
    ],
    component: () => import('../routes/ContractTemplate'),
    authorized: true,
  },
  {
    path: '/pub/spcm/contract-template/detail',
    models: [
      () => import('../models/contractTemplate.js'),
      () => import('../models/contractCommon.js'),
      () => import('../models/editorOnline.js'),
    ],
    component: () => import('../routes/ContractTemplate/Detail/TemplateDetail'),
    authorized: true,
  },
  {
    path: '/pub/spcm/contract-template/config/:pcTemplateId',
    models: [
      () => import('../models/contractTemplate.js'),
      () => import('../models/contractCommon.js'),
    ],
    component: () => import('../routes/ContractTemplate/Detail'),
    authorized: true,
  },
  {
    path: '/pub/spcm/contract-template/version/:pcTemplateId',
    models: [
      () => import('../models/contractTemplate.js'),
      () => import('../models/contractCommon.js'),
    ],
    component: () => import('../routes/ContractTemplate/HistoricVersion'),
    authorized: true,
  },
  // 协议控制
  {
    path: '/spcm/contract-control',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-control/list',
        models: [
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ContractControl'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-control/detail/:pcHeaderId',
        models: [
          () => import('../models/contractCommon.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/newContract.js'),
        ],
        component: () => import('../routes/ContractControl/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-control/contract-history-compare',
        models: [
          () => import('../models/purchaseContractView.js'),
          () => import('../models/contractCommon.js'),
        ],
        component: () =>
          import('../routes/PurchaseContractView/Detail/infoChangeCompare/fromContractControl'),
        FilterSupplier: true,
      },
    ],
  },

  // 我发起的协议-期初导入（目前仅限阳光照明使用）
  {
    path: '/spcm/purchase-contract-view/data-import/:code',
    component: () => import('../routes/himp/CommentImport'),
    models: [],
    authorized: true,
  },
  // 协议订单签署
  {
    path: '/spcm/contract-ordersign',
    models: [],
    FilterSupplier: true,
    components: [
      // 新增二次菜单：订单签署，三级菜单：订单采购方无意愿签署确认。
      {
        path: '/spcm/contract-ordersign/nonvoluntarysign',
        models: [() => import('../models/contractChapter.js')],
        component: () => import('../routes/ContractChapter/DisclaimerSign'),
        FilterSupplier: true,
      },
    ],
  },
  {
    // 在线编辑
    path: '/pub/spcm/contract-workspace/editor-online/:pcHeaderId',
    models: [() => import('../models/workSpace.js'), () => import('../models/editorOnline.js')],
    component: () => import('../routes/components/EditorOnline/RouterIndex'),
    authorized: true,
  },
  {
    // wps v7文本预览
    path: '/pub/spcm/contract-workspace/wps-v7-preview/:pcHeaderId',
    component: () => import('../routes/components/EditorOnline/WpsV7Preview'),
    authorized: true,
  },
  // 协议金额策略
  {
    path: '/spcm/amount-strategy',
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/amount-strategy/list',
        component: () => import('../routes/AmountStrategy'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/amount-strategy/create',
        component: () => import('../routes/AmountStrategy/Create'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/amount-strategy/:strategyId/:status',
        component: () => import('../routes/AmountStrategy/Details'),
        FilterSupplier: true,
      },
    ],
  },
  // 协议工作台
  {
    path: '/spcm/contract-workspace',
    components: [
      {
        path: '/spcm/contract-workspace/list',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractMaintain.js'),
        ],
        component: () => import('../routes/workspace'),
      },
      // 新建协议
      {
        path: '/spcm/contract-workspace/create',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractMaintain.js'),
        ],
        component: () => import('../routes/workspace/Detail/create'),
      },
      // 编辑协议
      {
        path: '/spcm/contract-workspace/update/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/update'),
      },
      // 编辑协议-共享(是否有权限)
      {
        path: '/spcm/contract-workspace/coordinate/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/coordinate'),
      },
      // 协议详情---只读
      {
        path: '/spcm/contract-workspace/view/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractChapter'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/view'),
      },
      // 智能提取-编辑
      {
        path: '/spcm/contract-workspace/intelligent/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractChapter'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/intelligent'),
      },
      // 智能提取-查看
      {
        path: '/spcm/contract-workspace/intelligentView/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractChapter'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/intelligentView'),
      },
      // 协议工作台明细页面：不受菜单权限控制，提供给其他模块使用
      {
        path: '/spcm/contract-workspace/other-view/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractChapter'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/view'),
        authorized: true,
        title: 'hzero.common.view.message.title.contractDetail',
      },
      // 协议用章
      {
        path: '/spcm/contract-workspace/chapter/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/contractChapter'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/chapter'),
      },
      // 协议审批
      {
        path: '/spcm/contract-workspace/approval/:pcHeaderId',
        models: [
          () => import('../models/workSpace.js'),
          () => import('../models/contractCommon.js'),
          () => import('../models/contractMaintain.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/workspace/Detail/approval'),
      },
      // 工作台-合同审查
      {
        path: '/spcm/contract-workspace/review/:pcHeaderId',
        component: () => import('../routes/workspace/Detail/components/ContractReview'),
        FilterSupplier: true,
      },
      // 工作台-合同审查等待页
      {
        path: '/spcm/contract-workspace/review-wait/:pcHeaderId',
        component: () => import('../routes/workspace/Detail/components/ContractReview/ReviewWait'),
        FilterSupplier: true,
      },
      // 工作台-重新提取等待页面
      {
        path: '/spcm/contract-workspace/extract-wait/:pcHeaderId',
        component: () =>
          import('../routes/workspace/Detail/components/ContractExtract/ContractExtractWait.js'),
        FilterSupplier: true,
      },
      {
        // 引用单据创建
        path: '/spcm/contract-workspace/reference-document/list',
        models: [() => import('../models/workSpace.js')],
        component: () => import('../routes/workspace/ReferenceDocument'),
      },
      // {
      //   // 批量导入
      //   path: '/sodr/order-workspace/data-import/:code',
      //   component: () => import('../routes/himp/CommentImport'),
      // },
    ],
  },
  // 合同审查配置
  {
    path: '/spcm/contract-review-config',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spcm/contract-review-config/list',
        component: () => import('../routes/ContractReviewConfig'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-review-config/template/detail/:reviewTemplateId/:status',
        component: () => import('../routes/ContractReviewConfig/TemplateDetail'),
        FilterSupplier: true,
      },
      {
        path: '/spcm/contract-review-config/template/create',
        component: () => import('../routes/ContractReviewConfig/TemplateDetail/Create'),
        FilterSupplier: true,
      },
    ],
  },
  // 文本对比
  {
    path: '/spcm/contract-text-compare',
    title: 'hzero.common.view.title.contractTextComparison',
    component: () => import('../routes/ContractTextCompare'),
    authorized: true,
  },
];
