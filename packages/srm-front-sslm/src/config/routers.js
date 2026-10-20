module.exports = [
  // 调查表
  {
    path: '/sslm/investigation',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/investigation/list',
        models: [() => import('../models/investigationCreate.js')],
        component: () => import('../routes/Investigation/Define/List'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/investigation/detail',
        models: [() => import('../models/investigationDetailMaintain.js')],
        component: () => import('../routes/Investigation/Define/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/investigation/create',
        models: [() => import('../models/investigationMaintain.js')],
        component: () => import('../routes/Investigation/Define/Create'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sslm/investigation-write',
    models: [],
    components: [
      {
        path: '/sslm/investigation-write/list',
        models: [() => import('../models/investigationWrite.js')],
        component: () => import('../routes/Investigation/Write'),
      },
      {
        path: '/sslm/investigation-write/detail',
        models: [() => import('../models/investigationWrite.js')],
        component: () => import('../routes/Investigation/Write/Detail'),
      },
      // 调查表填写导入
      {
        path: '/sslm/investigation-write/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
      },
    ],
  },
  {
    path: '/sslm/investigation-approval',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/investigation-approval/list',
        models: [() => import('../models/investigationApproval.js')],
        component: () => import('../routes/Investigation/Approval'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/investigation-approval/detail',
        models: [
          () => import('../models/investigationApproval.js'),
          () => import('../models/operatingRecord.js'),
        ],
        component: () => import('../routes/Investigation/Approval/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sslm/investigation-received',
    models: [],
    components: [
      {
        path: '/sslm/investigation-received/list',
        models: [() => import('../models/investigationReceived.js')],
        component: () => import('../routes/Investigation/Received'),
      },
      {
        path: '/sslm/investigation-received/detail',
        models: [
          () => import('../models/investigationReceived.js'),
          () => import('../models/investigationApproval.js'),
          () => import('../models/operatingRecord.js'),
          () => import('../models/investigationWrite.js'),
        ],
        component: () => import('../routes/Investigation/Received/Detail'),
      },
    ],
  },
  {
    path: '/sslm/investigation-send',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/investigation-send/list',
        models: [() => import('../models/sendInvestigation.js')],
        component: () => import('../routes/Investigation/SendInvestigation'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/investigation-send/detail',
        models: [
          () => import('../models/sendInvestigation.js'),
          () => import('../models/investigationApproval.js'),
          () => import('../models/operatingRecord.js'),
          () => import('../models/investigationWrite.js'),
        ],
        component: () => import('../routes/Investigation/SendInvestigation/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/sslm/investigation-template-define',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/investigation-template-define/list',
        models: [() => import('../models/investigationTemDefineOrg.js')],
        component: () => import('../routes/Investigation/Template/List'),
        FilterSupplier: true,
      },
      {
        path:
          '/sslm/investigation-template-define/detail/:investigateTemplateId/:updateInvestigateTemplateId',
        models: [() => import('../models/investigationDefinitionOrg.js')],
        component: () => import('../routes/Investigation/Template/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    // 供应商相关审批
    path: '/sslm/supplier-about-approval',
    components: [
      {
        path: '/sslm/supplier-about-approval/list',
        component: () => import('../routes/AboutSupplierApproval'),
      },
    ],
  },
  {
    path: '/sslm/investigation-template-history',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/investigation-template-history/list',
        models: [() => import('../models/investigationTemHistoryOrg.js')],
        component: () => import('../routes/Investigation/TemplateHistory/List'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/investigation-template-history/detail/:investigateTemplateId',
        models: [() => import('../models/investigationTemHistoryDetailOrg.js')],
        component: () => import('../routes/Investigation/TemplateHistory/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // {
  //   path: '/sslm/score-tmpl',
  //   models: [],
  //   components: [
  //     {
  //       path: '/sslm/score-tmpl/list',
  //       models: [() => import('../models/scoreTmpl.js')],
  //       component: () => import('../routes/ScoreTmpl'),
  //     },
  //     {
  //       path: '/sslm/score-tmpl/score-indic',
  //       models: [() => import('../models/scoreIndic.js')],
  //       component: () => import('../routes/ScoreTmpl/ScoreIndic'),
  //     },
  //     {
  //       path: '/sslm/score-tmpl/score-indic-assign',
  //       models: [() => import('../models/scoreIndicAssign.js')],
  //       component: () => import('../routes/ScoreTmpl/ScoreIndic/ScoreIndicAssign'),
  //     },
  //     {
  //       path: '/sslm/score-tmpl/score-category',
  //       models: ['scoreCategory'],
  //       component: () => import('../routes/ScoreTmpl/ScoreCategory'),
  //     },
  //     {
  //       path: '/sslm/score-tmpl/score-level',
  //       models: ['scoreLevel'],
  //       component: () => import('../routes/ScoreTmpl/ScoreLevel'),
  //     },
  //     {
  //       path: '/sslm/score-tmpl/score-supplier',
  //       models: [() => import('../models/scoreSupplier.js')],
  //       component: () => import('../routes/ScoreTmpl/ScoreSupplier'),
  //     },
  //   ],
  // },
  {
    path: '/sslm/standard-tmpl',
    models: [() => import('../models/standardTmpl.js')],
    component: () => import('../routes/StandardTmpl'),
  },

  // 供应商分类定义
  {
    path: '/sslm/supplier-category',
    models: [() => import('../models/supplierCategory.js')],
    component: () => import('../routes/SupplierCategory'),
    FilterSupplier: true,
  },
  // 供应商分类定义新
  {
    path: '/sslm/supplier-category-new/list',
    component: () => import('../routes/SupplierCategoryNew'),
    FilterSupplier: true,
  },
  // 批量导入
  {
    path: '/sslm/supplier-category/:code',
    component: () => import('../routes/himp/CommentImport'),
    authorized: true,
    models: [],
    FilterSupplier: true,
  },
  // 供应商分类变更申请
  {
    path: '/sslm/supplier-category-alter',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-category-alter/list',
        models: [() => import('../models/supplierCategoryAlter.js')],
        component: () => import('../routes/SupplierCategoryAlter'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-category-alter/detail/:categoryAlterId',
        models: [() => import('../models/supplierCategoryAlter.js')],
        component: () => import('../routes/SupplierCategoryAlter/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-category-alter/create',
        models: [() => import('../models/supplierCategoryAlter.js')],
        component: () => import('../routes/SupplierCategoryAlter/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-category-alter/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商分类变更申请查询
  {
    path: '/sslm/supplier-category-alter-list',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-category-alter-list/list',
        models: [() => import('../models/supplierCategoryAlterList.js')],
        component: () => import('../routes/SupplierCategoryAlterList'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-category-alter-list/detail/:id',
        models: [() => import('../models/supplierCategoryAlterList.js')],
        component: () => import('../routes/SupplierCategoryAlterList/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 送样申请采购员发布
  {
    path: '/sslm/buyer-apply-release',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/buyer-apply-release/list',
        component: () => import('../routes/SampleDelivery/Release'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-release/detail/:detailReqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Release/Detail/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-release/create',
        component: () => import('../routes/SampleDelivery/Release/Detail/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-release/attach-upload/:sampleId/:reqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Release/Detail/SupplierAttachment'),
        FilterSupplier: true,
      },
    ],
  },

  // 送样申请供应商反馈
  {
    path: '/sslm/supplier-apply-callback',
    models: [],
    components: [
      {
        path: '/sslm/supplier-apply-callback/list',
        component: () => import('../routes/SampleDelivery/Feedback'),
      },
      {
        path: '/sslm/supplier-apply-callback/detail/:detailReqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Feedback/Detail/index'),
      },
      {
        path: '/sslm/supplier-apply-callback/attach-upload/:sampleId/:reqId',
        component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
      },
      // 供应商发起送样申请
      {
        path: '/sslm/supplier-apply-callback/create',
        component: () => import('../routes/SampleDelivery/Feedback/Detail/Create/index'),
      },
      {
        path: '/sslm/supplier-apply-callback/supplier/:detailReqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Feedback/Detail/Create/index'),
      },
    ],
  },
  // 送样申请确认
  {
    path: '/sslm/buyer-apply-confirm',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/buyer-apply-confirm/list',
        component: () => import('../routes/SampleDelivery/Confirm'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-confirm/detail/:detailReqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Confirm/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-confirm/attach-upload/:sampleId/:reqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
        FilterSupplier: true,
      },
    ],
  },
  // 我收到的送样申请
  {
    path: '/sslm/supplier-apply-query',
    models: [],
    components: [
      {
        path: '/sslm/supplier-apply-query/list',
        component: () => import('../routes/SampleDelivery/Received'),
      },
      {
        path: '/sslm/supplier-apply-query/detail/:detailReqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Received/Detail'),
      },
      {
        path: '/sslm/supplier-apply-query/attach-upload/:sampleId/:reqId',
        component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
      },
    ],
  },
  // 我发出的送样申请
  {
    path: '/sslm/buyer-apply-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/buyer-apply-query/list',
        component: () => import('../routes/SampleDelivery/Send'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-query/detail/:detailReqId/:reqStatus',
        component: () => import('../routes/SampleDelivery/Send/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/buyer-apply-query/attach-upload/:sampleId/:reqId',
        component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
        FilterSupplier: true,
      },
    ],
  },

  // 汇总页面供应商 360 度查询
  {
    path: '/sslm/supplier-manager',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-manager/list',
        models: [() => import('../models/supplierQuery.js')],
        component: () => import('../routes/SupplierManage/SupplierQuery/PlatformIndex'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-manager/supplier-detail',
        models: [() => import('../models/supplierDetail.js')],
        component: () => import('../routes/SupplierDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-manager/supplier-evaluation/:id/:evalGranularity',
        models: [() => import('../models/supplierDetail.js')],
        component: () => import('../routes/SupplierDetail/SupplierEvaluationResults'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-manager/version-history',
        models: [() => import('../models/supplierDetail.js')],
        component: () => import('../routes/SupplierDetail/HistoryVersion'),
        FilterSupplier: true,
      },
      // 平台级企业信息变更
      {
        path: '/sslm/supplier-manager/enterprise-inform-change/detail/:changeReqId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/Detail'),
        FilterSupplier: true,
      },
      // 预留申请单查询
      {
        path: '/sslm/supplier-manager/prepare-view',
        models: [
          () => import('../models/prepareApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Prepare'),
        FilterSupplier: true,
      },
      // 注册申请单查看
      {
        path: '/sslm/supplier-manager/register-view',
        models: [
          () => import('../models/registerApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Register'),
        FilterSupplier: true,
      },
      // 推荐申请单查看
      {
        path: '/sslm/supplier-manager/recommend-view',
        models: [
          () => import('../models/recommendApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Recommend'),
        FilterSupplier: true,
      },
      // 潜在申请单查看
      {
        path: '/sslm/supplier-manager/potential-view',
        models: [
          () => import('../models/potentialApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Potential'),
        FilterSupplier: true,
      },
      // 合格申请单查看
      {
        path: '/sslm/supplier-manager/qualified-view',
        models: [
          () => import('../models/qualifiedApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Qualified'),
        FilterSupplier: true,
      },
      // 淘汰申请单查看
      {
        path: '/sslm/supplier-manager/eliminate-view',
        models: [
          () => import('../models/eliminateApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Eliminate'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商生命周期管理
  {
    path: '/sslm/supplier-life-manage',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-life-manage/manage',
        models: [() => import('../models/supplierLifeManage.js')],
        component: () => import('../routes/SupplierLife/Manage'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/stage/:stageId',
        models: [() => import('../models/supplierLifeSearch.js')],
        component: () => import('../routes/SupplierLife/Search'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/register',
        models: [
          () => import('../models/registerApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Register'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/register-view',
        models: [
          () => import('../models/registerApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Register'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/recommend',
        models: [
          () => import('../models/recommendApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Recommend'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/recommend-view',
        models: [
          () => import('../models/recommendApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Recommend'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/potential',
        models: [
          () => import('../models/potentialApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Potential'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/potential-view',
        models: [
          () => import('../models/potentialApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Potential'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/supplier-detail',
        models: [() => import('../models/supplierDetailByManage.js')],
        component: () => import('../routes/SupplierLife/SupplierDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/qualified',
        models: [
          () => import('../models/qualifiedApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Qualified'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/qualified-view',
        models: [
          () => import('../models/qualifiedApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Qualified'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/eliminate',
        models: [
          () => import('../models/eliminateApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Eliminate'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/eliminate-view',
        models: [
          () => import('../models/eliminateApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Eliminate'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/prepare',
        models: [
          () => import('../models/prepareApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Prepare'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/prepare-view',
        models: [
          () => import('../models/prepareApplication.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/SupplierLife/Prepare'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-life-manage/version-history',
        models: [() => import('../models/supplierDetailByManage.js')],
        component: () => import('../routes/SupplierLife/SupplierDetail/HistoryVersion'),
        FilterSupplier: true,
      },
      // 平台级企业信息变更
      {
        path: '/sslm/supplier-life-manage/enterprise-inform-change/detail/:changeReqId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/Detail'),
        FilterSupplier: true,
      },
      // 供应商考评结果明细查询
      {
        path: '/sslm/supplier-life-manage/supplier-evaluation/:id/:evalGranularity',
        models: [() => import('../models/supplierDetail.js')],
        component: () => import('../routes/SupplierDetail/SupplierEvaluationResults'),
        FilterSupplier: true,
      },
      // 推荐申请单批量导入
      {
        path: '/sslm/supplier-life-manage/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商生命周期管理工作台
  {
    path: '/sslm/life-cycle-manage',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/life-cycle-manage/list',
        component: () => import('../routes/LifeCycleManage'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/life-cycle-manage/:status',
        component: () => import('../routes/LifeCycleManage/Documents/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商评审
  {
    path: '/sslm/eligible-supplier-review',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/eligible-supplier-review/list',
        models: [() => import('../models/supplierReview.js')],
        component: () => import('../routes/EligibleSupplierReview/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/eligible-supplier-review/detail/:requisitionId',
        models: [
          () => import('../models/supplierReview.js'),
          () => import('../models/commonApplication.js'),
        ],
        component: () => import('../routes/EligibleSupplierReview/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/eligible-supplier-review/supplier-detail',
        models: [() => import('../models/supplierDetailByManage.js')],
        component: () => import('../routes/SupplierLife/SupplierDetail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/eligible-supplier-review/version-history',
        models: [() => import('../models/supplierDetail.js')],
        component: () => import('../routes/SupplierDetail/HistoryVersion'),
        FilterSupplier: true,
      },
      // 平台级企业信息变更
      {
        path: '/sslm/eligible-supplier-review/enterprise-inform-change/detail/:changeReqId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供货能力清单管理
  {
    path: '/sslm/supplier-ablility-manage',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-ablility-manage/list',
        component: () => import('../routes/SupplyAbilityNew/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-manage/create',
        component: () => import('../routes/SupplyAbilityNew/SupplyAbility/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-manage/detail/:supplyAbilityId',
        component: () => import('../routes/SupplyAbilityNew/SupplyAbility/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-manage/expand-detail/:supplyAbilityExpandId',
        component: () => import('../routes/SupplyAbilityNew/ExpandSupplyAbility/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供货能力清单定义
  {
    path: '/sslm/supplier-ablility-definition',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-ablility-definition/list',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Definition/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-definition/create',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Definition/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-definition/detail/:supplyAbilityId',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Definition/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-definition/expand-detail/:supplyAbilityExpandId',
        component: () => import('../routes/SupplyAbility/Definition/ExpandDetail'),
        FilterSupplier: true,
      },
      // 供货能力清单定义导入
      {
        path: '/sslm/supplier-ablility-definition/import-component/:code',
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  // 供货能力清单评审
  {
    path: '/sslm/supplier-ablility-review',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-ablility-review/list',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Review/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-review/detail/:supplyAbilityId',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Review/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供货能力清单查询
  {
    path: '/sslm/supplier-ablility-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-ablility-query/list',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Query/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-ablility-query/detail/:supplyAbilityId',
        models: [() => import('../models/supplyAbility.js')],
        component: () => import('../routes/SupplyAbility/Query/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 标准指标定义
  {
    path: '/sslm/supplier-kpi-indicator',
    models: [() => import('../models/supplierKpiIndicatorOrg.js')],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-kpi-indicator/list',
        models: [() => import('../models/supplierKpiIndicatorOrg.js')],
        component: () => import('../routes/SupplierKpiIndicator'),
        FilterSupplier: true,
      },
      // 标准指标定义导入
      {
        path: '/sslm/supplier-kpi-indicator/comment-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
        models: [],
        FilterSupplier: true,
      },
    ],
  },
  // 评分模版定义
  {
    path: '/sslm/evaluation-template',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/evaluation-template/list',
        models: [() => import('../models/evaluationTemplate.js')],
        component: () => import('../routes/EvaluationTemplate'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-template/indicators/:action/:id',
        models: [() => import('../models/evaluationTemplate.js')],
        component: () => import('../routes/EvaluationTemplate/Indicator'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-template/score-level/:action',
        models: [() => import('../models/evaluationScoreLevel.js')],
        component: () => import('../routes/EvaluationTemplate/ScoreLevel/index'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-template/purchase-category/:action/:id',
        models: [() => import('../models/evaluationPurchaseCate.js')],
        component: () => import('../routes/EvaluationTemplate/PurchaseCategory/index'),
        FilterSupplier: true,
      },
      // 供应商及品类导入
      {
        path: '/sslm/evaluation-template/comment-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
        models: [],
        FilterSupplier: true,
      },
      // 历史版本页面
      {
        path: '/sslm/evaluation-template/historical-version/list',
        models: [() => import('../models/evaluationTemplate.js')],
        component: () => import('../routes/EvaluationTemplate/HistoricalVersion/index'),
        FilterSupplier: true,
      },
    ],
  },
  // 指标模板定义
  {
    path: '/sslm/indicator-template-define',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/indicator-template-define/list',
        component: () => import('../routes/IndicatorTemplateDefine'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/indicator-template-define/template-detail/create',
        component: () => import('../routes/IndicatorTemplateDefine/TemplateDefine/Detail/Create'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/indicator-template-define/template-detail/:evalTplId/:evalTplType/:status',
        component: () => import('../routes/IndicatorTemplateDefine/TemplateDefine/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 考评档案管理
  {
    path: '/sslm/evaluation-doc-manage',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/evaluation-doc-manage/list',
        models: [() => import('../models/evaluationDocManage.js')],
        component: () => import('../routes/EvaluationDocManage'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-doc-manage/create',
        models: [() => import('../models/evaluationDocManage.js')],
        component: () => import('../routes/EvaluationDocManage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-doc-manage/detail/:tplId/:headerId',
        models: [
          () => import('../models/evaluationDocManage.js'),
          () => import('../models/evaluationArchivesFilling.js'),
        ],
        component: () => import('../routes/EvaluationDocManage/Detail'),
        FilterSupplier: true,
      },
      // 考评档案管理详情-评分汇总导入
      {
        path: '/sslm/evaluation-doc-manage/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 考评档案填制
  {
    path: '/sslm/archive-filling',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/archive-filling/list',
        models: [() => import('../models/evaluationArchivesFilling.js')],
        component: () => import('../routes/EvaluationArchivesFilling'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/archive-filling/detail/:id',
        models: [() => import('../models/evaluationArchivesFilling.js')],
        component: () => import('../routes/EvaluationArchivesFilling/Detail'),
        FilterSupplier: true,
      },
      // 考评档案填制批量导入
      {
        path: '/sslm/archive-filling/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 已填制考评档案
  {
    path: '/sslm/archive-filled',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/archive-filled/list',
        models: [() => import('../models/evaluationArchivesFilled.js')],
        component: () => import('../routes/EvaluationArchivesFilled'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/archive-filled/detail/:id',
        models: [
          () => import('../models/evaluationArchivesFilled.js'),
          () => import('../models/evaluationArchivesFilling.js'),
        ],
        component: () => import('../routes/EvaluationArchivesFilled/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 考评结果查询
  {
    path: '/sslm/evaluation-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/evaluation-query/list',
        models: [
          () => import('../models/evaluationQuery.js'),
          () => import('../models/evaluationDocManage.js'),
        ],
        component: () => import('../routes/EvaluationQuery'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-query/detail/:id',
        models: [
          () => import('../models/evaluationQuery.js'),
          () => import('../models/evaluationDocManage.js'),
          () => import('../models/evaluationArchivesFilling.js'),
        ],
        component: () => import('../routes/EvaluationQuery/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 我收到的考评结果
  {
    path: '/sslm/received-query',
    models: [],
    components: [
      {
        path: '/sslm/received-query/list',
        models: [() => import('../models/receivedEvaluationResult.js')],
        component: () => import('../routes/ReceivedEvaluationResult'),
      },
      {
        path: '/sslm/received-query/detail/:id',
        models: [
          () => import('../models/receivedEvaluationResult.js'),
          () => import('../models/evaluationDocManage.js'),
        ],
        component: () => import('../routes/ReceivedEvaluationResult/Detail'),
      },
    ],
  },
  // 考评事件记录
  {
    path: '/sslm/event-record',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/event-record/list',
        models: [],
        component: () => import('../routes/EventRecord'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/event-record/detail/create',
        models: [],
        component: () => import('../routes/EventRecord/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/event-record/detail/:evalEventHeaderId',
        models: [],
        component: () => import('../routes/EventRecord/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 绩效考评-评分工作台
  {
    path: '/sslm/appraisal-score',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/appraisal-score/list',
        component: () => import('../routes/AppraisalScore'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/appraisal-score/detail/:evalHeaderId/:evalGranularity/:status',
        component: () => import('../routes/AppraisalScore/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 绩效考评-供应商工作台
  {
    path: '/sslm/appraisal-supplier',
    components: [
      {
        path: '/sslm/appraisal-supplier/list',
        component: () => import('../routes/AppraisalSupplier'),
      },
      {
        path: '/sslm/appraisal-supplier/detail/:evalHeaderId/:evalGranularity',
        component: () => import('../routes/AppraisalSupplier/Detail'),
      },
    ],
  },
  // 绩效考评-采购方工作台
  {
    path: '/sslm/appraisal-purchaser',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/appraisal-purchaser/list',
        component: () => import('../routes/AppraisalPurchaser'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/appraisal-purchaser/create',
        component: () => import('../routes/AppraisalPurchaser/Create'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/appraisal-purchaser/detail/:evalTplId/:evalHeaderId/:evalGranularity/:status',
        component: () => import('../routes/AppraisalPurchaser/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 企业风险监控
  {
    path: '/sslm/full-monitoring',
    models: [() => import('../models/riskMonitoring.js')],
    component: () => import('../routes/EnterpriseRiskMonitoring/FullMonitoring'),
    FilterSupplier: true,
  },
  // 风险事件分类定义
  {
    path: '/sslm/risk-events-classify',
    models: [() => import('../models/riskMonitoring.js')],
    component: () => import('../routes/RiskEventsClassify'),
    FilterSupplier: true,
  },
  // 风险内嵌页面 Tab
  {
    path: '/sslm/risk-embed',
    models: [],
    component: () => import('../routes/EnterpriseRiskMonitoring/embedPage'),
    authorized: true,
  },
  // 企业信息变更申请
  {
    path: '/sslm/enterprise-inform-change',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/enterprise-inform-change/list',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/enterprise-inform-change/detail/:changeReqId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/enterprise-inform-change/compare/:changeReqId/:companyId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/InformationCompare'),
        FilterSupplier: true,
      },
    ],
  },
  // 企业信息变更（新）
  {
    path: '/sslm/enterprise-inform-change-new',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/enterprise-inform-change-new/list',
        component: () => import('../routes/EnterpriseInformNew'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/enterprise-inform-change-new/detail/:status',
        component: () => import('../routes/EnterpriseInformNew/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 企业信息变更审批（新）-租户级
  {
    path: '/sslm/enterprise-inform-tenant-approval-new',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/enterprise-inform-tenant-approval-new/list',
        component: () => import('../routes/EnterpriseInformTenantApproval'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/enterprise-inform-tenant-approval-new/detail/:changeConfirmId',
        component: () => import('../routes/EnterpriseInformTenantApproval/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 企业信息变更审批-平台级
  {
    path: '/sslm/enterprise-inform-approval',
    models: [],
    components: [
      {
        path: '/sslm/enterprise-inform-approval/list',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/InfoChangeApproval'),
      },
      {
        path: '/sslm/enterprise-inform-approval/detail/:changeReqId/:companyId/:partnerTenantId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/InfoChangeApproval/Detail'),
      },
    ],
  },
  // 企业信息变更审批-租户级
  {
    path: '/sslm/enterprise-inform-confirm',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/enterprise-inform-confirm/list',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/InfoChangeConfirm'),
        FilterSupplier: true,
      },
      {
        path:
          '/sslm/enterprise-inform-confirm/detail/:changeReqId/:changeConfirmId/:companyId/:partnerTenantId',
        models: [() => import('../models/enterpriseInform.js')],
        component: () => import('../routes/EnterpriseInform/InfoChangeConfirm/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商信息变更申请
  {
    path: '/sslm/supplier-inform-change',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-inform-change/list',
        models: [() => import('../models/supplierInform.js')],
        component: () => import('../routes/SupplierInform'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-inform-change/detail/:changeReqId/:companyId',
        models: [
          () => import('../models/supplierInform.js'),
          () => import('../models/enterpriseInform.js'),
          () => import('../models/supplierInformCompare.js'),
        ],
        component: () => import('../routes/SupplierInform/Detail'),
        FilterSupplier: true,
      },
      // 供货能力清单批量导入
      {
        authorized: true,
        path: '/sslm/supplier-inform-change/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商信息变更（新）
  {
    path: '/sslm/supplier-inform-change-new',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-inform-change-new/list',
        component: () => import('../routes/SupplierInformNew'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-inform-change-new/detail/create',
        component: () => import('../routes/SupplierInformNew/Create'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-inform-change-new/detail/:status',
        component: () => import('../routes/SupplierInformNew/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商文档清单（采）
  {
    path: '/sslm/supplier-document-list',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-document-list/list',
        component: () => import('../routes/SupplierDocumentList'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商文档清单（供）
  {
    path: '/sslm/supplier-document-as-supplier',
    models: [],
    components: [
      {
        path: '/sslm/supplier-document-as-supplier/list',
        component: () => import('../routes/SupplierDocumentAsSupplier'),
      },
    ],
  },
  // 供应商配额管理
  {
    path: '/sslm/supplier-quota-manage',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-quota-manage/list',
        models: [() => import('../models/supplierQuota.js')],
        component: () => import('../routes/SupplierQuota/Manage'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-quota-manage/create',
        models: [() => import('../models/supplierQuota.js')],
        component: () => import('../routes/SupplierQuota/Manage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-quota-manage/detail/:quotaHeaderId/:evalStatus',
        models: [() => import('../models/supplierQuota.js')],
        component: () => import('../routes/SupplierQuota/Manage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-quota-manage/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 配额申请单
  {
    path: '/sslm/supplier-quota-application',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-quota-application/list',
        component: () => import('../routes/SupplierQuotaApplication/index.js'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-quota-application/detail/create',
        component: () => import('../routes/SupplierQuotaApplication/Detail/index.js'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-quota-application/detail/:quotaHeaderId',
        component: () => import('../routes/SupplierQuotaApplication/Detail/index.js'),
        FilterSupplier: true,
      },
    ],
  },
  // 配额主数据
  {
    path: '/sslm/supplier-quota-master-data',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-quota-master-data/list',
        component: () => import('../routes/SupplierQuotaMasterData/index.js'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-quota-master-data/detail/:quotaHeaderId',
        component: () => import('../routes/SupplierQuotaApplication/Detail/index.js'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商配额管理报表
  {
    path: '/sslm/supplier-quota-report/list',
    models: [() => import('../models/supplierQuota.js')],
    component: () => import('../routes/SupplierQuota/Report'),
    FilterSupplier: true,
  },

  // 现场考察报告管理
  {
    path: '/sslm/site-investigate-report/manage',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/site-investigate-report/manage/list',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Manage'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/site-investigate-report/manage/create',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Manage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/site-investigate-report/manage/detail/:evalHeaderId/:evalType',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Manage/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 现场考察报告填制
  {
    path: '/sslm/site-investigate-report/filling',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/site-investigate-report/filling/list',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Filling'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/site-investigate-report/filling/detail/:evalHeaderId',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Filling/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 已填制现场考察报告
  {
    path: '/sslm/site-investigate-report/filled',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/site-investigate-report/filled/list',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Filled'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/site-investigate-report/filled/detail/:evalHeaderId',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Filled/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 现场考察结果查询
  {
    path: '/sslm/site-investigate-report/result',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/site-investigate-report/result/list',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Result'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/site-investigate-report/result/detail/:evalHeaderId/:evalType/:evalStatus',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Result/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 现场考察报告反馈
  {
    path: '/sslm/site-investigate-report/feed-back',
    models: [],
    components: [
      {
        path: '/sslm/site-investigate-report/feed-back/list',
        models: [],
        component: () => import('../routes/SiteInvestigateReport/FeedBack'),
      },
      {
        path: '/sslm/site-investigate-report/feed-back/detail/:evalHeaderId/:evalType',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/FeedBack/Detail'),
      },
    ],
  },

  // 我收到的现场考察报告
  {
    path: '/sslm/site-investigate-report/received',
    models: [],
    components: [
      {
        path: '/sslm/site-investigate-report/received/list',
        models: [],
        component: () => import('../routes/SiteInvestigateReport/Received'),
      },
      {
        path: '/sslm/site-investigate-report/received/detail/:evalHeaderId/:evalType',
        models: [() => import('../models/siteInvestigateReport.js')],
        component: () => import('../routes/SiteInvestigateReport/Received/Detail'),
      },
    ],
  },
  // 供应商事件配置
  {
    path: '/sslm/supplier-event-config',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-event-config/list',
        models: [],
        component: () => import('../routes/SupplierEventConfig'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商模型定义
  {
    path: '/sslm/supplier-model-definition',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-model-definition/list',
        models: [],
        component: () => import('../routes/SupplierModelDefinition'),
        FilterSupplier: true,
      },
    ],
  },

  // 简易供应商入库
  {
    path: '/sslm/supplier-warehouse',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-warehouse/list',
        FilterSupplier: true,
        component: () => import('../routes/SupplierWarehouse'),
      },
      {
        path: '/sslm/supplier-warehouse/create/:userId',
        FilterSupplier: true,
        component: () => import('../routes/SupplierWarehouse/Detail'),
      },
      {
        path: '/sslm/supplier-warehouse/detail/:extSupplierReqId/:reqStatus/:userId',
        FilterSupplier: true,
        component: () => import('../routes/SupplierWarehouse/Detail'),
      },
    ],
  },
  // 供应商关联业务单据
  {
    title: 'hzero.common.view.title.supplierRelatedDoc',
    path: '/sslm/supplier-related-doc/list',
    component: () => import('../routes/SupplierLife/SupplierRelatedDoc/List'),
    authorized: true,
  },
  // 供应商工作台
  {
    path: '/sslm/supplier-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-workbench/list',
        component: () => import('../routes/Workbench'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-workbench/local-import/:code',
        component: () => import('../routes/himp/CommentImport'),
      },
      {
        path: '/sslm/supplier-workbench/platform-import/:code',
        component: () => import('../routes/himp/CommentImport'),
      },
    ],
  },

  // 供应商录入
  {
    path: '/sslm/supplier-entry',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-entry/list',
        component: () => import('../routes/SupplierEntry'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-entry/detail/:changeReqId/:editStatus',
        component: () => import('../routes/SupplierEntryDetail'),
        FilterSupplier: true,
      },
    ],
  },

  // 企业认证
  {
    path: '/sslm/enterprise-certification',
    components: [
      {
        path: '/sslm/enterprise-certification',
        component: () => import('../routes/EnterpriseCertification'),
      },
      {
        path: '/sslm/enterprise-certification/certification',
        component: () => import('../routes/EnterpriseCertification/Certification'),
      },
      {
        path: '/sslm/enterprise-certification/certification-result',
        component: () => import('../routes/EnterpriseCertification/Certification/Result'),
      },
      {
        path: '/sslm/enterprise-certification/affiliated',
        component: () => import('../routes/EnterpriseCertification/AffiliatedEnterprises'),
      },
      {
        path: '/sslm/enterprise-certification/affiliated-result',
        component: () => import('../routes/EnterpriseCertification/AffiliatedEnterprises/Result'),
      },
      {
        path: '/sslm/enterprise-certification/main-info',
        component: () => import('../routes/EnterpriseCertification/MainInfo'),
      },
      {
        path: '/sslm/enterprise-certification/secondary-info',
        component: () => import('../routes/EnterpriseCertification/SecondaryInfo'),
      },
      {
        path: '/sslm/enterprise-certification/investigation',
        component: () => import('../routes/EnterpriseCertification/ReplenishInvestigation'),
      },
      {
        path: '/sslm/enterprise-certification/apply-manager',
        component: () => import('../routes/EnterpriseCertification/ApplyManager'),
      },
      {
        path: '/sslm/enterprise-certification/result',
        component: () => import('../routes/EnterpriseCertification/Result'),
      },
      {
        path: '/sslm/enterprise-certification/preview',
        component: () => import('../routes/EnterpriseCertification/Preview'),
      },
      {
        path: '/sslm/enterprise-certification/preview-result',
        component: () => import('../routes/EnterpriseCertification/Preview'),
      },
    ],
  },

  // 供应商邀约管理
  {
    path: '/sslm/supplier-invite-manage',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supplier-invite-manage/list',
        component: () => import('../routes/SupplierInviteManage'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-invite-manage/invite-deal/detail/:inviteId',
        component: () => import('../routes/SupplierInviteManage/InviteDeal/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/supplier-invite-manage/certification-deal/detail/:changeReqId',
        component: () => import('../routes/SupplierInviteManage/CertificationDeal/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 注册策略配置
  {
    path: '/sslm/register-policy-config',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/register-policy-config/list',
        component: () => import('../routes/RegisterPolicyConfig'),
        FilterSupplier: true,
      },
    ],
  },

  // 平台企业认证审批（新）
  {
    path: '/sslm/platform-certification-approval',
    models: [],
    components: [
      {
        path: '/sslm/platform-certification-approval/list',
        component: () => import('../routes/EnterpriseCertificationApproval'),
      },
      {
        path: '/sslm/platform-certification-approval/detail/:changeReqId',
        component: () => import('../routes/EnterpriseCertificationApproval/Detail'),
      },
    ],
  },
  // 生命周期管理策略配置
  {
    path: '/sslm/supplier-life-policy-config',
    components: [
      {
        path: '/sslm/supplier-life-policy-config/list',
        component: () => import('../routes/SupplierLifePolicyConfig'),
      },
      {
        path: '/sslm/supplier-life-policy-config/create',
        component: () => import('../routes/SupplierLifePolicyConfig/PolicyConfig/Create'),
      },
      {
        path: '/sslm/supplier-life-policy-config/detail/:strategyId/:status',
        component: () => import('../routes/SupplierLifePolicyConfig/PolicyConfig/Detail'),
      },
    ],
  },
  // 调查表模板配置
  {
    path: '/sslm/investigation-template-config',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/investigation-template-config/list',
        component: () => import('../routes/InvestigationTemplateConfig'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/investigation-template-config/create',
        component: () => import('../routes/InvestigationTemplateConfig/Create'),
        FilterSupplier: true,
      },
      {
        path:
          '/sslm/investigation-template-config/detail/:newInvestigateTemplateId/:oldInvestigateTemplateId/:type',
        component: () => import('../routes/InvestigationTemplateConfig/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 采购方调查表工作台
  {
    path: '/sslm/purchaser-investigation',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/purchaser-investigation/list',
        component: () => import('../routes/PurchaserInvestigationWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/purchaser-investigation/detail/create',
        component: () => import('../routes/PurchaserInvestigationWorkbench/Create'),
        FilterSupplier: true,
      },
      // 待发布
      {
        path:
          '/sslm/purchaser-investigation/wait-release/detail/:investgHeaderId/:investigateTemplateId',
        component: () => import('../routes/PurchaserInvestigationWorkbench/Detail/WaitRelease'),
        FilterSupplier: true,
      },
      // 待审批
      {
        path:
          '/sslm/purchaser-investigation/wait-approve/detail/:investgHeaderId/:investigateTemplateId',
        component: () => import('../routes/PurchaserInvestigationWorkbench/Detail/WaitApprove'),
        FilterSupplier: true,
      },
      // 全部
      {
        path:
          '/sslm/purchaser-investigation/all-investigation/detail/:investgHeaderId/:investigateTemplateId',
        component: () =>
          import('../routes/PurchaserInvestigationWorkbench/Detail/AllInvestigation'),
        FilterSupplier: true,
      },
    ],
  },

  // 供应商调查表工作台
  {
    path: '/sslm/supplier-investigation-workbench',
    models: [],
    components: [
      {
        path: '/sslm/supplier-investigation-workbench/list',
        component: () => import('../routes/SupplierInvestigationWorkbench'),
      },
      {
        path: '/sslm/supplier-investigation-workbench/detail/:investgHeaderId',
        component: () => import('../routes/SupplierInvestigationWorkbench/Detail'),
      },
    ],
  },

  // 发现采购方
  {
    path: '/sslm/search-purchaser',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/search-purchaser/list',
        component: () => import('../routes/SearchPurchaser'),
        FilterSupplier: true,
      },
    ],
  },
  // 合作关系及企业信息
  {
    path: '/sslm/supplier-partner-relation-enterprise',
    models: [],
    components: [
      {
        path: '/sslm/supplier-partner-relation-enterprise/detail',
        component: () => import('../routes/SupplierMasterData'),
      },
    ],
  },
  {
    // 平台级-注册认证管理
    path: '/sslm/register-authentication-manage',
    components: [
      {
        path: '/sslm/register-authentication-manage/list',
        component: () => import('../routes/RegisterAuthenticationManage'),
      },
      {
        path: '/sslm/register-authentication-manage/detail/:assignId/:strategyCfBasicId/:tenantId',
        component: () => import('../routes/RegisterAuthenticationManage/Detail'),
      },
    ],
  },
  // 平台级-多云角色模板调整
  {
    path: '/sslm/multi-cloud-role-template-change',
    models: [],
    components: [
      {
        path: '/sslm/multi-cloud-role-template-change/list',
        component: () => import('../routes/MultiCloudRoleTemplate'),
      },
    ],
  },
  // 供货能力申请单（采）
  {
    path: '/sslm/supply-ability-doc-purchaser',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supply-ability-doc-purchaser/list',
        FilterSupplier: true,
        component: () => import('../routes/SupplyAbilityDoc/PurchaserWorkbench'),
      },
      {
        path: '/sslm/supply-ability-doc-purchaser/create',
        FilterSupplier: true,
        component: () => import('../routes/SupplyAbilityDoc/PurchaserWorkbench/Create'),
      },
      {
        path: '/sslm/supply-ability-doc-purchaser/detail/:abilityReqId/:type',
        FilterSupplier: true,
        component: () => import('../routes/SupplyAbilityDoc/PurchaserWorkbench/Detail'),
      },
    ],
  },
  // 供货能力申请单（供）
  {
    path: '/sslm/supply-ability-doc-supplier',
    components: [
      {
        path: '/sslm/supply-ability-doc-supplier/list',
        component: () => import('../routes/SupplyAbilityDoc/SupplierWorkbench'),
      },
      {
        path: '/sslm/supply-ability-doc-supplier/create',
        component: () => import('../routes/SupplyAbilityDoc/SupplierWorkbench/Create'),
      },
      {
        path: '/sslm/supply-ability-doc-supplier/detail/:abilityReqId/:type',
        component: () => import('../routes/SupplyAbilityDoc/SupplierWorkbench/Detail'),
      },
    ],
  },
  // 供货能力清单查询（采）
  {
    path: '/sslm/supply-ability-query-purchaser',
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/supply-ability-query-purchaser/list',
        FilterSupplier: true,
        component: () => import('../routes/SupplyAbilityMasterData/Purchaser'),
      },
      {
        path: '/sslm/supply-ability-query-purchaser/detail/:supplyAbilityId',
        FilterSupplier: true,
        component: () => import('../routes/SupplyAbilityMasterData/Purchaser/Detail'),
      },
    ],
  },
  // 供货能力清单查询（供）
  {
    path: '/sslm/supply-ability-query-supplier',
    components: [
      {
        path: '/sslm/supply-ability-query-supplier/list',
        component: () => import('../routes/SupplyAbilityMasterData/Supplier'),
      },
      {
        path: '/sslm/supply-ability-query-supplier/detail/:supplyAbilityId',
        component: () => import('../routes/SupplyAbilityMasterData/Supplier/Detail'),
      },
    ],
  },
  // 会员供应商信息拓展
  {
    path: '/sslm/member-supplier-expansion',
    components: [
      {
        path: '/sslm/member-supplier-expansion/list',
        component: () => import('../routes/MemberSupplierExpansion'),
      },
    ],
  },
  // 预览会员供应商信息拓展
  {
    title: 'hzero.common.preview',
    path: '/sslm/member-supplier-expansion-preview',
    component: () => import('../routes/MemberSupplierExpansion/Preview'),
    authorized: true,
  },

  // 供应商录入pub
  {
    path: '/pub/sslm/supplier-entry/detail/:changeReqId/:editStatus',
    component: () => import('../routes/SupplierEntryDetail'),
    authorized: true,
  },

  // 供应商录入-单据样式定制审批表单
  {
    path: '/pub/sslm/supplier-entry/detail/workflow/:changeReqId/:editStatus',
    component: () => import('../routes/SupplierEntryDetail/WorkFlow'),
    authorized: true,
  },

  // 合格申请单pub
  {
    path: '/pub/sslm/supplier-life-manage/qualified-view',
    models: [
      () => import('../models/qualifiedApplication.js'),
      () => import('../models/commonApplication.js'),
    ],
    component: () => import('../routes/SupplierLife/Qualified'),
    authorized: true,
  },
  // 预留申请单pub
  {
    path: '/pub/sslm/supplier-life-manage/prepare-view',
    models: [
      () => import('../models/prepareApplication.js'),
      () => import('../models/commonApplication.js'),
    ],
    component: () => import('../routes/SupplierLife/Prepare'),
    authorized: true,
  },
  // 淘汰申请单pub
  {
    path: '/pub/sslm/supplier-life-manage/eliminate-view',
    models: [
      () => import('../models/eliminateApplication.js'),
      () => import('../models/commonApplication.js'),
    ],
    component: () => import('../routes/SupplierLife/Eliminate'),
    authorized: true,
  },
  // 潜在申请单pub
  {
    path: '/pub/sslm/supplier-life-manage/potential-view',
    models: [
      () => import('../models/potentialApplication.js'),
      () => import('../models/commonApplication.js'),
    ],
    component: () => import('../routes/SupplierLife/Potential'),
    authorized: true,
  },
  // 推荐申请单pub
  {
    path: '/pub/sslm/supplier-life-manage/recommend-view',
    models: [
      () => import('../models/recommendApplication.js'),
      () => import('../models/commonApplication.js'),
    ],
    component: () => import('../routes/SupplierLife/Recommend'),
    authorized: true,
  },
  // 注册申请单pub
  {
    path: '/pub/sslm/supplier-life-manage/register-view',
    models: [
      () => import('../models/eliminateApplication.js'),
      () => import('../models/commonApplication.js'),
    ],
    component: () => import('../routes/SupplierLife/Register'),
    authorized: true,
  },
  // 企业信息变更明细pub
  {
    path: '/pub/sslm/enterprise-inform-change/detail/:changeReqId',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform/Detail'),
    authorized: true,
  },
  // 企业信息变更明细对比pub
  {
    path: '/pub/sslm/enterprise-inform-change/compare/:changeReqId/:companyId',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform/InformationCompare'),
    authorized: true,
  },
  // 企业信息变更明细对比-工作流页面
  {
    path: '/sslm/workflow/enterprise-inform-change/compare/:changeReqId/:companyId',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform/InformationCompare'),
    title: 'hzero.common.view.title.changeApplication',
    authorized: true,
  },
  // 供应商信息变更明细pub
  {
    path: '/pub/sslm/supplier-inform-change/detail/:changeReqId/:companyId',
    models: [
      () => import('../models/supplierInform.js'),
      () => import('../models/enterpriseInform.js'),
      () => import('../models/supplierInformCompare.js'),
    ],
    component: () => import('../routes/SupplierInform/Detail'),
    authorized: true,
  },
  // 供应商信息变更明细pub（新）
  {
    path: '/pub/sslm/supplier-inform-change-new/detail/:status',
    component: () => import('../routes/SupplierInformNew/Detail'),
    authorized: true,
  },
  // 供应商信息变更明细pub（新）- 单据样式定制
  {
    path: '/pub/sslm/supplier-inform-change-new/detail/workflow/:status',
    component: () => import('../routes/SupplierInformNew/WorkFlow'),
    authorized: true,
  },
  // 360查询pub
  {
    path: '/pub/sslm/supplier-life-manage/supplier-detail',
    models: [() => import('../models/supplierDetail.js')],
    component: () => import('../routes/SupplierDetail'),
    authorized: true,
  },
  // 360查询历史记录pub页
  {
    path: '/pub/sslm/supplier-life-manage/version-history',
    models: [() => import('../models/supplierDetail.js')],
    component: () => import('../routes/SupplierDetail/HistoryVersion'),
    authorized: true,
  },
  // 360查询平台级企业信息变更pub页
  {
    path: '/pub/sslm/supplier-life-manage/enterprise-inform-change/detail/:changeReqId',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform/Detail'),
    authorized: true,
  },
  // 供应商分类变更申请pub页
  {
    path: '/pub/sslm/supplier-category-alter/detail/:categoryAlterId',
    models: [() => import('../models/supplierCategoryAlter.js')],
    component: () => import('../routes/SupplierCategoryAlter/Detail'),
    authorized: true,
  },
  // 现场考察报告管理pub页
  {
    path: '/pub/sslm/site-investigate-report/manage/detail/:evalHeaderId/:evalType',
    models: [() => import('../models/siteInvestigateReport.js')],
    component: () => import('../routes/SiteInvestigateReport/Manage/Detail'),
    authorized: true,
  },
  // 调查表审批pub页
  {
    path: '/pub/sslm/investigation-approval/detail',
    models: [
      () => import('../models/investigationApproval.js'),
      () => import('../models/operatingRecord.js'),
    ],
    component: () => import('../routes/Investigation/Approval/Detail'),
    authorized: true,
  },
  {
    path:
      '/pub/sslm/enterprise-inform-confirm/detail/:changeReqId/:changeConfirmId/:companyId/:partnerTenantId',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform/InfoChangeConfirm/Detail'),
    authorized: true,
  },
  {
    path: '/pub/sslm/evaluation-doc-manage/detail/:tplId/:headerId',
    models: [
      () => import('../models/evaluationDocManage.js'),
      () => import('../models/evaluationArchivesFilling.js'),
    ],
    component: () => import('../routes/EvaluationDocManage/Detail'),
    authorized: true,
  },
  // 考评事件记录pub页
  {
    path: '/pub/sslm/event-record/detail/:evalEventHeaderId',
    models: [],
    component: () => import('../routes/EventRecord/Detail'),
    authorized: true,
  },
  // 送样申请发布pub页
  {
    path: '/pub/sslm/buyer-apply-release/detail/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Release/Detail/index'),
    authorized: true,
  },
  // 送样申请发布-供应商附件pub页
  {
    path: '/pub/sslm/buyer-apply-release/attach-upload/:sampleId/:reqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Release/Detail/SupplierAttachment'),
    authorized: true,
  },
  // 送样申请确认pub页
  {
    path: '/pub/sslm/buyer-apply-confirm/detail/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Confirm/Detail'),
    authorized: true,
  },
  // 送样申请确认-供应商附件pub页
  {
    path: '/pub/sslm/buyer-apply-confirm/attach-upload/:sampleId/:reqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
    authorized: true,
  },
  // 我发出的送样申请详情pub页
  {
    path: '/pub/sslm/buyer-apply-query/detail/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Send/Detail'),
    authorized: true,
  },
  // 我发出的送样申请-供应商附件pub页
  {
    path: '/pub/sslm/buyer-apply-query/attach-upload/:sampleId/:reqId',
    component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
    authorized: true,
  },
  // 供货能力清单评审pub页
  {
    path: '/pub/sslm/supplier-ablility-review/detail/:supplyAbilityId',
    models: [() => import('../models/supplyAbility.js')],
    component: () => import('../routes/SupplyAbility/Review/Detail'),
    authorized: true,
  },
  // 供应商关联业务单据pub页
  {
    path: '/pub/sslm/supplier-related-doc/list',
    component: () => import('../routes/SupplierLife/SupplierRelatedDoc/List'),
    authorized: true,
  },
  // 我发出的调查表pub页
  {
    path: '/pub/sslm/investigation-send/detail',
    models: [
      () => import('../models/sendInvestigation.js'),
      () => import('../models/investigationApproval.js'),
      () => import('../models/operatingRecord.js'),
      () => import('../models/investigationWrite.js'),
    ],
    component: () => import('../routes/Investigation/SendInvestigation/Detail'),
    authorized: true,
  },
  // 现场考察结果pub页
  {
    path: '/pub/sslm/site-investigate-report/result/detail/:evalHeaderId/:evalType/:evalStatus',
    models: [() => import('../models/siteInvestigateReport.js')],
    component: () => import('../routes/SiteInvestigateReport/Result/Detail'),
    authorized: true,
  },
  // 供应商配额管理pub页
  {
    path: '/pub/sslm/supplier-quota-manage/detail/:quotaHeaderId/:evalStatus',
    models: [() => import('../models/supplierQuota.js')],
    component: () => import('../routes/SupplierQuota/Manage/Detail'),
    authorized: true,
  },
  // 配额申请单pub页
  {
    path: '/pub/sslm/supplier-quota-application/detail/:quotaHeaderId',
    component: () => import('../routes/SupplierQuotaApplication/Detail'),
    authorized: true,
  },
  // 简易供应商入库pub页
  {
    path: '/pub/sslm/supplier-warehouse/detail/:extSupplierReqId/:reqStatus',
    component: () => import('../routes/SupplierWarehouse/Detail'),
    authorized: true,
  },
  // 简易供应商入库重构审批表单
  {
    path: '/pub/sslm/supplier-warehouse/detail/new/:extSupplierReqId/:reqStatus/:userId',
    component: () => import('../routes/SupplierWarehouse/Detail/WorkFlow'),
    authorized: true,
    FilterSupplier: true,
  },
  // 考评结果查询pub页
  {
    path: '/pub/sslm/evaluation-query/detail/:id',
    models: [
      () => import('../models/evaluationQuery.js'),
      () => import('../models/evaluationDocManage.js'),
      () => import('../models/evaluationArchivesFilling.js'),
    ],
    component: () => import('../routes/EvaluationQuery/Detail'),
    authorized: true,
  },
  // 调查表填写列表pub页
  {
    path: '/pub/sslm/investigation-write/list',
    models: [() => import('../models/investigationWrite.js')],
    component: () => import('../routes/Investigation/Write'),
    authorized: true,
  },
  // 调查表填写详情pub页
  {
    path: '/pub/sslm/investigation-write/detail',
    models: [() => import('../models/investigationWrite.js')],
    component: () => import('../routes/Investigation/Write/Detail'),
    authorized: true,
  },
  // 调查表填写导入pub页
  {
    path: '/pub/sslm/investigation-write/comment-import/:code',
    models: [],
    component: () => import('../routes/himp/CommentImport'),
    authorized: true,
  },
  // 我收到的调查表 列表pub页
  {
    path: '/pub/sslm/investigation-received/list',
    models: [() => import('../models/investigationReceived.js')],
    component: () => import('../routes/Investigation/Received'),
    authorized: true,
  },
  // 我收到的调查表 详情pub页
  {
    path: '/pub/sslm/investigation-received/detail',
    models: [
      () => import('../models/investigationReceived.js'),
      () => import('../models/investigationApproval.js'),
      () => import('../models/operatingRecord.js'),
      () => import('../models/investigationWrite.js'),
    ],
    component: () => import('../routes/Investigation/Received/Detail'),
    authorized: true,
  },
  // 送样反馈 列表pub页
  {
    path: '/pub/sslm/supplier-apply-callback/list',
    component: () => import('../routes/SampleDelivery/Feedback'),
    authorized: true,
  },
  // 送样反馈 详情pub页
  {
    path: '/pub/sslm/supplier-apply-callback/detail/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Feedback/Detail/index'),
    authorized: true,
  },
  // 送样反馈详情页 供应商附件pub页
  {
    path: '/pub/sslm/supplier-apply-callback/attach-upload/:sampleId/:reqId',
    component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
    authorized: true,
  },
  // 供应商发起送样申请pub页
  {
    path: '/pub/sslm/supplier-apply-callback/create',
    component: () => import('../routes/SampleDelivery/Feedback/Detail/Create/index'),
    authorized: true,
  },
  // 供应商发起送样申请pub页
  {
    path: '/pub/sslm/supplier-apply-callback/supplier/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Feedback/Detail/Create/index'),
    authorized: true,
  },
  // 送样申请查询(供) 列表pub页
  {
    path: '/pub/sslm/supplier-apply-query/list',
    component: () => import('../routes/SampleDelivery/Received'),
    authorized: true,
  },
  // 送样申请查询(供) 详情pub页
  {
    path: '/pub/sslm/supplier-apply-query/detail/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Received/Detail'),
    authorized: true,
  },
  // 送样申请查询(供) 供应商附件pub页
  {
    path: '/pub/sslm/supplier-apply-query/attach-upload/:sampleId/:reqId',
    component: () => import('../routes/SampleDelivery/components/SupplierAttachment'),
    authorized: true,
  },
  // 企业信息变更 列表pub页
  {
    path: '/pub/sslm/enterprise-inform-change/list',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform'),
    FilterSupplier: true,
    authorized: true,
  },
  // 拓展中供货能力pub页
  {
    path: '/pub/sslm/supplier-ablility-definition/expand-detail/:supplyAbilityExpandId',
    component: () => import('../routes/SupplyAbility/Definition/ExpandDetail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供应商360查询
  {
    title: 'hzero.common.view.message.360QueryDetail',
    path: '/sslm/supplier-detail-new',
    component: () => import('../routes/SupplierDetailNew'),
    authorized: true,
  },
  // 所有openTab类型工作流跳转360详情菜单
  {
    title: 'hzero.common.view.message.360QueryDetail',
    path: '/sslm/include/supplier-manager/supplier-detail',
    models: [() => import('../models/supplierDetail.js')],
    component: () => import('../routes/SupplierDetail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 所有openTab类型跳转历史版本菜单
  {
    path: '/sslm/include/supplier-manager/version-history',
    models: [() => import('../models/supplierDetail.js')],
    component: () => import('../routes/SupplierDetail/HistoryVersion'),
    FilterSupplier: true,
    authorized: true,
  },
  // 平台级企业信息变更（带include路径的360跳转过来的）
  {
    title: 'hzero.common.view.message.enterpriseInfo',
    path: '/sslm/include/supplier-manager/enterprise-inform-change/detail/:changeReqId',
    models: [() => import('../models/enterpriseInform.js')],
    component: () => import('../routes/EnterpriseInform/Detail'),
    authorized: true,
  },
  // 现场考察报告只读页-openTab方式
  {
    path: '/sslm/include/site-investigate-report/result/detail',
    models: [() => import('../models/siteInvestigateReport.js')],
    component: () => import('../routes/SiteInvestigateReport/Result/Detail'),
    authorized: true,
  },
  // 送样申请查询-只读页面
  {
    path: '/sslm/include/buyer-apply-query/detail/:detailReqId/:reqStatus',
    component: () => import('../routes/SampleDelivery/Send/Detail'),
    authorized: true,
  },
  // 考评结果查询-只读页面
  {
    path: '/sslm/include/evaluation-query/detail/:id',
    models: [
      () => import('../models/evaluationQuery.js'),
      () => import('../models/evaluationDocManage.js'),
      () => import('../models/evaluationArchivesFilling.js'),
    ],
    component: () => import('../routes/EvaluationQuery/Detail'),
    authorized: true,
  },
  // 考评事件-只读页面
  {
    path: '/sslm/include/event-record/detail/:evalEventHeaderId',
    models: [],
    component: () => import('../routes/EventRecord/Detail'),
    authorized: true,
  },
  // 考评档案填制pub页
  {
    path: '/pub/sslm/archive-filling/detail/:id',
    models: [() => import('../models/evaluationArchivesFilling.js')],
    component: () => import('../routes/EvaluationArchivesFilling/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 现场考察报告填制pub页
  {
    path: '/pub/sslm/site-investigate-report/filling/detail/:evalHeaderId',
    models: [() => import('../models/siteInvestigateReport.js')],
    component: () => import('../routes/SiteInvestigateReport/Filling/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 已填制现场考察报告pub页
  {
    path: '/pub/sslm/site-investigate-report/filled/detail/:evalHeaderId',
    models: [() => import('../models/siteInvestigateReport.js')],
    component: () => import('../routes/SiteInvestigateReport/Filled/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供应商邀约管理-认证审批
  {
    path: '/pub/sslm/supplier-invite-manage/certification-deal/detail/:changeReqId',
    component: () => import('../routes/SupplierInviteManage/CertificationDeal/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/pub/sslm/supplier-invite-manage/certification-deal/detail/new/:changeReqId',
    component: () => import('../routes/SupplierInviteManage/CertificationDeal/WorkFlow'),
    FilterSupplier: true,
    authorized: true,
  },
  // 采购方工作台-待审批详情pub页
  {
    path:
      '/pub/sslm/purchaser-investigation/wait-approve/detail/:investgHeaderId/:investigateTemplateId',
    component: () => import('../routes/PurchaserInvestigationWorkbench/Detail/WaitApprove'),
    FilterSupplier: true,
    authorized: true,
  },
  // 关联业务单据跳转采购方工作台-全部详情页
  {
    path:
      '/sslm/include/purchaser-investigation/all-investigation/detail/:investgHeaderId/:investigateTemplateId',
    component: () => import('../routes/PurchaserInvestigationWorkbench/Detail/AllInvestigation'),
    authorized: true,
  },
  //  工作流跳转我发出的调查表详情页
  {
    path: '/sslm/include/sslm/investigation-send/detail',
    models: [
      () => import('../models/sendInvestigation.js'),
      () => import('../models/investigationApproval.js'),
      () => import('../models/operatingRecord.js'),
      () => import('../models/investigationWrite.js'),
    ],
    component: () => import('../routes/Investigation/SendInvestigation/Detail'),
    authorized: true,
  },
  // 生命周期管理工作台-工作流表单
  {
    path: '/pub/sslm/life-cycle-manage/:status',
    component: () => import('../routes/LifeCycleManage/Documents/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 生命周期管理工作台-工作流表单-单据样式定制
  {
    path: '/pub/sslm/life-cycle-manage/detail/approval-form',
    component: () => import('../routes/LifeCycleManage/ApprovalForm'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供应商评估计划工作台
  {
    path: '/sslm/vendor-evaluation-plan-workbench',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/vendor-evaluation-plan-workbench/list',
        component: () => import('../routes/VendorEvaluationPlanWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/vendor-evaluation-plan-workbench/details/:status',
        component: () => import('../routes/VendorEvaluationPlanWorkbench/Details'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商评估-发布审批
  {
    path: '/pub/sslm/vendor-evaluation-plan-workbench/details/:status',
    component: () => import('../routes/VendorEvaluationPlanWorkbench/Details'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供应商评估策略
  {
    path: '/sslm/evaluation-strategy',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/evaluation-strategy/list',
        component: () => import('../routes/EvaluationStrategy'),
        FilterSupplier: true,
      },
      {
        path: '/sslm/evaluation-strategy/details/:status',
        component: () => import('../routes/EvaluationStrategy/Details'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方评估工作台
  {
    path: '/sslm/purchaser-evaluation-workbench',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/sslm/purchaser-evaluation-workbench/list',
        component: () => import('../routes/PurchaserEvaluationWorkbench'),
        FilterSupplier: true,
      },
      {
        // 采购方评估 - 管理 - 详情
        path: '/sslm/purchaser-evaluation-workbench/details/:status',
        component: () => import('../routes/PurchaserEvaluationWorkbench/Details'),
        FilterSupplier: true,
      },
      {
        // 采购方评估 - 评分 - 详情
        path: '/sslm/purchaser-evaluation-workbench/scoreDetails/:status',
        component: () => import('../routes/PurchaserEvaluationWorkbench/ScoreDetails'),
        FilterSupplier: true,
      },
    ],
  },
  // 其他页面跳转查看评估报告
  {
    path: '/sslm/include/purchaser-evaluation-workbench/details/:status',
    component: () => import('../routes/PurchaserEvaluationWorkbench/Details'),
    FilterSupplier: true,
    authorized: true,
  },
  // 采购方评估 - 审批表单
  {
    path: '/pub/sslm/purchaser-evaluation-workbench/details/:status',
    component: () => import('../routes/PurchaserEvaluationWorkbench/Details'),
    FilterSupplier: true,
    authorized: true,
  },
  // 采购方评估 - 评估结果 - 单据样式
  {
    path: '/pub/sslm/purchaser-evaluation-workbench/details-custom/view',
    component: () => import('../routes/PurchaserEvaluationWorkbench/WorkFlow/ResultApprove'),
    FilterSupplier: true,
    authorized: true,
  },
  {
    // 采购方评估 - 评分 - 审批表单
    path: '/pub/sslm/purchaser-evaluation-workbench/scoreDetails/:status',
    component: () => import('../routes/PurchaserEvaluationWorkbench/ScoreDetails'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供应商调查表工作台pub页
  {
    path: '/pub/sslm/supplier-investigation-workbench/detail/:investgHeaderId',
    component: () => import('../routes/SupplierInvestigationWorkbench/Detail'),
    authorized: true,
  },
  // 绩效考评-新建审批工作流-单据样式定制
  {
    path:
      '/pub/sslm/appraisal-purchaser/new-approve/:evalTplId/:evalHeaderId/:evalGranularity/:status',
    component: () => import('../routes/AppraisalPurchaser/WorkFlow/NewApprove'),
    authorized: true,
  },
  // 绩效考评-申诉工作流-单据样式定制
  {
    path:
      '/pub/sslm/appraisal-purchaser/appeal-approve/:evalTplId/:evalHeaderId/:evalGranularity/:status',
    component: () => import('../routes/AppraisalPurchaser/WorkFlow/AppealApprove'),
    authorized: true,
  },
  // 绩效考评-提交审批工作流-单据样式定制
  {
    path:
      '/pub/sslm/appraisal-purchaser/submit-approve/:evalTplId/:evalHeaderId/:evalGranularity/:status',
    component: () => import('../routes/AppraisalPurchaser/WorkFlow/SubmitApprove'),
    authorized: true,
  },
  // 绩效考评-评分工作流-单据样式定制
  {
    path: '/pub/sslm/appraisal-score/detail-custom/:evalHeaderId/:evalGranularity/:status',
    component: () => import('../routes/AppraisalScore/WorkFlow'),
    authorized: true,
  },
  // 绩效考评-不带菜单只读页
  {
    path: '/pub/sslm/appraisal-purchaser/detail/:evalTplId/:evalHeaderId/:evalGranularity/:status',
    component: () => import('../routes/AppraisalPurchaser/Detail'),
    authorized: true,
  },
  // 绩效考评-无菜单权限访问详情页
  {
    path:
      '/sslm/include/appraisal-purchaser/detail/:evalTplId/:evalHeaderId/:evalGranularity/:status',
    component: () => import('../routes/AppraisalPurchaser/Detail'),
    authorized: true,
  },
  // 销售方评估工作台
  {
    path: '/sslm/supplier-evaluation-workbench',
    models: [],
    components: [
      {
        path: '/sslm/supplier-evaluation-workbench/list',
        component: () => import('../routes/SupplierEvaluationWorkbench'),
      },
      {
        // 销售方评估 - 详情 - 自评（反馈）
        path: '/sslm/supplier-evaluation-workbench/details/:status',
        component: () => import('../routes/SupplierEvaluationWorkbench/Details'),
      },
      {
        // 销售方评估 - 评估计划详情
        path: '/sslm/supplier-evaluation-workbench/plan-details/:status',
        component: () => import('../routes/SupplierEvaluationWorkbench/PlanDetails'),
      },
    ],
  },
  // 企业信息变更审批-租户审批工作流-单据样式定制
  {
    path: '/pub/sslm/enterprise-inform-tenant-approval-new/detail/:changeConfirmId',
    component: () => import('../routes/EnterpriseInformTenantApproval/WorkFlow'),
    FilterSupplier: true,
    authorized: true,
  },
  // 单据样式定制采购方工作台-待审批详情pub页
  {
    path:
      '/pub/sslm/purchaser-investigation/approval-form/detail/:investgHeaderId/:investigateTemplateId',
    component: () => import('../routes/PurchaserInvestigationWorkbench/Detail/WorkFlow'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供货能力管理-审批工作流-单据样式定制
  {
    path: '/pub/sslm/supplier-ablility-manage/detail/:supplyAbilityId',
    component: () => import('../routes/SupplyAbilityNew/SupplyAbility/WorkFlow'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供货能力申请单-工作流表单
  {
    path: '/pub/sslm/supply-ability-doc-purchaser/detail/:abilityReqId/:type',
    component: () => import('../routes/SupplyAbilityDoc/PurchaserWorkbench/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 供货能力申请单-工作流表单-单据样式定制
  {
    path: '/pub/sslm/supply-ability-doc-purchaser/details-custom/:abilityReqId',
    component: () => import('../routes/SupplyAbilityDoc/PurchaserWorkbench/WorkFlow'),
    FilterSupplier: true,
    authorized: true,
  },

  // 外部寻源
  {
    path: '/sslm/oueside-project-setup',
    models: [],
    components: [
      {
        path: '/sslm/oueside-project-setup/list',
        component: () => import('../routes/OutsideProjectSetup/index'),
      },
      {
        path: '/sslm/oueside-project-setup/:status',
        component: () => import('../routes/OutsideProjectSetup/Detail'),
      },
    ],
  },
];
