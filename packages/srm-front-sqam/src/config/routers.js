module.exports = [
  // 质量整改创建
  {
    FilterSupplier: true,
    path: '/sqam/create8D',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/create8D/list',
        models: [() => import('../models/create8D.js')],
        component: () => import('../routes/Create8D'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/create8D/detail/:id',
        models: [
          () => import('../models/create8D.js'),
          () => import('../models/initiated8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
        ],
        component: () => import('../routes/Create8D/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/create8D/quoteIncomingInspection',
        models: [() => import('../models/create8D.js')],
        component: () => import('../routes/Create8D/QuoteIncomingInspection/SuperWrapper'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/create8D/create',
        models: [() => import('../models/create8D.js')],
        component: () => import('../routes/Create8D/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/create8D/detail8D/:id',
        models: [
          () => import('../models/detail8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
        ],
        component: () => import('../routes/Detail8D'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/create8D/incoming-inspection-query/detail/:id',
        models: [() => import('../models/incomingInspectionQuery.js')],
        component: () => import('../routes/IncomingInspectionQuery/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/create8D/sendOrder/detail/:id',
        models: [() => import('../models/sodr/sendOrder.js')],
        component: () => import('../routes/sodr/SendOrder'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/sqam/create8D/detail/:id',
    models: [
      () => import('../models/create8D.js'),
      () => import('../models/initiated8D.js'),
      () => import('../models/promiseMaintainProvide.js'),
      () => import('../models/followUpProduce.js'),
      () => import('../models/rootReasonAnalyze.js'),
      () => import('../models/foreverDealSolution.js'),
      () => import('../models/relateStandard.js'),
      () => import('../models/isSuitUnderItem.js'),
    ],
    component: () => import('../routes/Create8D/Detail'),
  },
  // 质量整改反馈审核
  {
    FilterSupplier: true,
    path: '/sqam/audit8D',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/list',
        models: [() => import('../models/audit8D.js')],
        component: () => import('../routes/Audit8D'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/detail/:id',
        models: [
          () => import('../models/audit8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
          () => import('../models/create8D.js'),
          () => import('../models/feedback8D.js'),
          () => import('../models/groupMemberPanel.js'),
        ],
        component: () => import('../routes/Audit8D/CommonDetail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/history/:historyId/:preHeaderId',
        models: [() => import('../models/history8D.js')],
        component: () => import('../routes/HistoryVerison'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/pub-detail/:id',
        models: [
          () => import('../models/audit8D.js'),
          () => import('../models/feedback8D.js'),
          () => import('../models/groupMemberPanel.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
          () => import('../models/create8D.js'),
        ],
        component: () => import('../routes/Audit8D/CommonDetail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/detail8D/:id',
        models: [
          () => import('../models/detail8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
        ],
        component: () => import('../routes/Detail8D'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/incoming-inspection-query/detail/:id',
        models: [() => import('../models/incomingInspectionQuery.js')],
        component: () => import('../routes/IncomingInspectionQuery/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/audit8D/sendOrder/detail/:id',
        models: [() => import('../models/sodr/sendOrder.js')],
        component: () => import('../routes/sodr/SendOrder'),
      },
    ],
  },
  {
    path: '/sqam/feedback8D',
    models: [],
    components: [
      {
        path: '/sqam/feedback8D/list',
        models: [() => import('../models/feedback8D.js')],
        component: () => import('../routes/Feedback8D'),
      },
      {
        path: '/sqam/feedback8D/detail/:id',
        models: [
          () => import('../models/feedback8D.js'),
          () => import('../models/groupMemberPanel.js'),
          () => import('../models/audit8D.js'),
          () => import('../models/groupMemberPanel.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
          () => import('../models/create8D.js'),
        ],
        component: () => import('../routes/Feedback8D/Detail'),
      },
      {
        path: '/sqam/feedback8D/history/:historyId/:preHeaderId',
        models: [() => import('../models/history8D.js')],
        component: () => import('../routes/HistoryVerison'),
      },
      {
        path: '/sqam/feedback8D/detail8D/:id',
        models: [
          () => import('../models/detail8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
        ],
        component: () => import('../routes/Detail8D'),
      },
      {
        path: '/sqam/feedback8D/incoming-inspection-query/detail/:id',
        models: [() => import('../models/qualityResult.js')],
        component: () => import('../routes/QualityResult/Detail'),
      },
      {
        path: '/sqam/feedback8D/receivedOrder/detail/:id',
        models: [() => import('../models/sodr/receivedOrder.js')],
        component: () => import('../routes/sodr/ReceivedOrder'),
      },
    ],
  },
  // 我发起的质量整改
  {
    FilterSupplier: true,
    path: '/sqam/initiated8D',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/initiated8D/list',
        models: [() => import('../models/initiated8D.js')],
        component: () => import('../routes/Initiated8D'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/initiated8D/detail/:id',
        models: [
          () => import('../models/initiated8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
          () => import('../models/create8D.js'),
        ],
        component: () => import('../routes/Initiated8D/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/initiated8D/history/:historyId/:preHeaderId',
        models: [() => import('../models/history8D.js')],
        component: () => import('../routes/HistoryVerison'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/initiated8D/detail8D/:id',
        models: [
          () => import('../models/detail8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
        ],
        component: () => import('../routes/Detail8D'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/initiated8D/incoming-inspection-query/detail/:id',
        models: [() => import('../models/incomingInspectionQuery.js')],
        component: () => import('../routes/IncomingInspectionQuery/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/initiated8D/sendOrder/detail/:id',
        models: [() => import('../models/sodr/sendOrder.js')],
        component: () => import('../routes/sodr/SendOrder'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/sqam/initiated8D/detail/:id',
    models: [
      () => import('../models/initiated8D.js'),
      () => import('../models/promiseMaintainProvide.js'),
      () => import('../models/followUpProduce.js'),
      () => import('../models/rootReasonAnalyze.js'),
      () => import('../models/foreverDealSolution.js'),
      () => import('../models/relateStandard.js'),
      () => import('../models/isSuitUnderItem.js'),
      () => import('../models/create8D.js'),
    ],
    component: () => import('../routes/Initiated8D/Detail'),
  },
  {
    path: '/sqam/received8D',
    models: [],
    components: [
      {
        path: '/sqam/received8D/list',
        models: [() => import('../models/received8D.js')],
        component: () => import('../routes/Received8D'),
      },
      {
        path: '/sqam/received8D/detail/:id',
        models: [
          () => import('../models/received8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
          () => import('../models/create8D.js'),
        ],
        component: () => import('../routes/Received8D/Detail'),
      },
      {
        path: '/sqam/received8D/history/:historyId/:preHeaderId',
        models: [() => import('../models/history8D.js')],
        component: () => import('../routes/HistoryVerison'),
      },
      {
        path: '/sqam/received8D/detail8D/:id',
        models: [
          () => import('../models/detail8D.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
        ],
        component: () => import('../routes/Detail8D'),
      },
      {
        path: '/sqam/received8D/incoming-inspection-query/detail/:id',
        models: [() => import('../models/qualityResult.js')],
        component: () => import('../routes/QualityResult/Detail'),
      },
      {
        path: '/sqam/received8D/receivedOrder/detail/:id',
        models: [() => import('../models/sodr/receivedOrder.js')],
        component: () => import('../routes/sodr/ReceivedOrder'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/sqam/received8D/detail/:id',
    models: [
      () => import('../models/received8D.js'),
      () => import('../models/promiseMaintainProvide.js'),
      () => import('../models/followUpProduce.js'),
      () => import('../models/rootReasonAnalyze.js'),
      () => import('../models/foreverDealSolution.js'),
      () => import('../models/relateStandard.js'),
      () => import('../models/isSuitUnderItem.js'),
    ],
    component: () => import('../routes/Received8D/Detail'),
  },
  {
    FilterSupplier: true,
    path: '/sqam/my-claim-form',
    // title: "我的索赔单",
    models: [],
    //  authorized: true,
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/my-claim-form/list',
        models: [() => import('../models/myClaimForm.js')],
        component: () => import('../routes/MyClaimForm'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/my-claim-form/detail',
        models: [() => import('../models/myClaimForm.js'), () => import('../models/sqamCommon.js')],
        component: () => import('../routes/MyClaimForm/Detail'),
      },
    ],
  },
  {
    FilterSupplier: true,
    path: '/sqam/claim-certified-final',
    // title: "索赔结果最终确认",
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/claim-certified-final/list',
        models: [() => import('../models/claimCertifiedFinal.js')],
        component: () => import('../routes/ClaimCertifiedFinal'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/claim-certified-final/detail',
        models: [
          () => import('../models/claimCertifiedFinal.js'),
          () => import('../models/sqamCommon.js'),
        ],
        component: () => import('../routes/ClaimCertifiedFinal/Detail'),
      },
    ],
  },
  {
    path: '/sqam/my-received-claim-form',
    // title: "我收到的索赔单",
    models: [],
    // authorized: true,
    components: [
      {
        path: '/sqam/my-received-claim-form/list',
        models: [() => import('../models/myReceivedClaimForm.js')],
        component: () => import('../routes/MyReceivedClaimForm'),
      },
      {
        path: '/sqam/my-received-claim-form/detail',
        models: [
          () => import('../models/myReceivedClaimForm.js'),
          () => import('../models/sqamCommon.js'),
        ],
        component: () => import('../routes/MyReceivedClaimForm/Detail'),
      },
    ],
  },
  // 索赔单确认
  {
    path: '/sqam/claimConfirmation',
    models: [],
    components: [
      {
        path: '/sqam/claimConfirmation/list',
        models: [() => import('../models/claimConfirm.js')],
        component: () => import('../routes/ClaimConfirmation'),
      },
      {
        path: '/sqam/claimConfirmation/detail/:id',
        models: [
          () => import('../models/claimConfirm.js'),
          () => import('../models/sqamCommon.js'),
        ],
        component: () => import('../routes/ClaimConfirmation/Detail'),
      },
    ],
  },
  // 索赔单申述
  {
    FilterSupplier: true,
    path: '/sqam/claimStatement',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/claimStatement/list',
        models: [() => import('../models/claimStatement.js')],
        component: () => import('../routes/ClaimStatement'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/claimStatement/detail/:id',
        models: [
          () => import('../models/claimStatement.js'),
          () => import('../models/sqamCommon.js'),
        ],
        component: () => import('../routes/ClaimStatement/Detail'),
      },
    ],
  },

  {
    FilterSupplier: true,
    path: '/sqam/claimTypeDefinition',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/claimTypeDefinition/list',
        models: [() => import('../models/claimTypeDefinition.js')],
        component: () => import('../routes/ClaimTypeDefinition'),
        // title: '索赔单类型定义',
        // authorized: true,
      },
    ],
  },
  // 索赔单创建
  {
    FilterSupplier: true,
    path: '/sqam/createClaim',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/createClaim/list',
        models: [() => import('../models/createClaim.js')],
        component: () => import('../routes/CreateClaim'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/createClaim/create',
        models: [() => import('../models/createClaim.js'), () => import('../models/sqamCommon.js')],
        component: () => import('../routes/CreateClaim/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/createClaim/detail/:id',
        models: [() => import('../models/createClaim.js'), () => import('../models/sqamCommon.js')],
        component: () => import('../routes/CreateClaim/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/createClaim/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
      {
        FilterSupplier: true,
        path: '/sqam/createClaim/quoteIncomingInspection',
        component: () => import('../routes/CreateClaim/QuoteIncomingInspection'),
        models: [() => import('../models/createClaim.js')],
      },
      {
        FilterSupplier: true,
        path: '/sqam/createClaim/imgImport',
        component: () => import('../routes/CreateClaim/ImgImport'),
        models: [],
      },
    ],
  },
  // 索赔单审批
  {
    FilterSupplier: true,
    path: '/sqam/claimApproval',
    model: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/claimApproval/list',
        models: [
          () => import('../models/claimApproval.js'),
          () => import('../models/sqamCommon.js'),
        ],
        component: () => import('../routes/ClaimApproval'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/claimApproval/detail',
        models: [
          () => import('../models/claimApproval.js'),
          () => import('../models/sqamCommon.js'),
        ],
        component: () => import('../routes/ClaimApproval/Detail'),
      },
    ],
  },
  // 来料检验查询
  {
    FilterSupplier: true,
    path: '/sqam/incoming-inspection-query',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/incoming-inspection-query/list',
        models: [() => import('../models/incomingInspectionQuery.js')],
        component: () => import('../routes/IncomingInspectionQuery'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/incoming-inspection-query/detail/:id',
        models: [() => import('../models/incomingInspectionQuery.js')],
        component: () => import('../routes/IncomingInspectionQuery/Detail'),
      },
      // 我发起的索赔单-索赔项目-关联质检单链接跳转到"来料检验查询"界面
      {
        FilterSupplier: true,
        path: '/sqam/incoming-inspection-query/detail-from-inspection-num/:id',
        models: [() => import('../models/incomingInspectionQuery.js')],
        component: () => import('../routes/IncomingInspectionQuery/Detail'),
      },
    ],
  },

  // 来料检验创建
  {
    FilterSupplier: true,
    path: '/sqam/incoming-inspection-maintain',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/incoming-inspection-maintain/list',
        models: [() => import('../models/incomingInspectionMaintain.js')],
        component: () => import('../routes/IncomingInspectionMaintain'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/incoming-inspection-maintain/detail/:id',
        models: [() => import('../models/incomingInspectionMaintain.js')],
        component: () => import('../routes/IncomingInspectionMaintain/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/incoming-inspection-maintain/unInspection/list',
        models: [() => import('../models/incomingInspectionMaintain.js')],
        component: () => import('../routes/IncomingInspectionMaintain/UnInspection'),
      },
      {
        path: '/sqam/incoming-inspection-maintain/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },
  // 质量检验审批
  {
    FilterSupplier: true,
    path: '/sqam/quality-inspect-approval',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/quality-inspect-approval/list',
        models: [() => import('../models/qualityInspectApproval.js')],
        component: () => import('../routes/QualityInspectApproval'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/quality-inspect-approval/detail/:id',
        models: [() => import('../models/qualityInspectApproval.js')],
        component: () => import('../routes/QualityInspectApproval/Detail'),
      },
    ],
  },

  // 质检工作流
  {
    // FilterSupplier: true,
    path: '/pub/sqam/quality-inspect-approval/wfl-approve/:id',
    models: [],
    component: () => import('../routes/QualityInspectApproval/Approve'),
    authorized: true,
  },
  // 质量检验报表
  {
    FilterSupplier: true,
    path: '/sqam/quality-report',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/quality-report/list',
        models: [() => import('../models/qualityReport.js')],
        component: () => import('../routes/QualityReport'),
      },
    ],
  },
  // 索赔单确认工作流
  {
    authorized: true,
    path: '/pub/sqam/my-claim-form/detail',
    models: [() => import('../models/myClaimForm.js'), () => import('../models/sqamCommon.js')],
    component: () => import('../routes/MyClaimForm/Detail'),
  },
  // 索赔单审批工作流
  {
    authorized: true,
    path: '/pub/sqam/claimApproval/detail',
    models: [() => import('../models/claimApproval.js'), () => import('../models/sqamCommon.js')],
    component: () => import('../routes/ClaimApproval/Detail'),
  },
  // 索赔单申诉处理工作流
  {
    authorized: true,
    path: '/pub/sqam/claimStatement/detail/:id',
    models: [() => import('../models/claimStatement.js'), () => import('../models/sqamCommon.js')],
    component: () => import('../routes/ClaimStatement/Detail'),
  },
  // 质检结果查询
  {
    path: '/sqam/quality-result',
    models: [],
    components: [
      {
        path: '/sqam/quality-result/list',
        models: [() => import('../models/qualityResult.js')],
        component: () => import('../routes/QualityResult'),
      },
      {
        path: '/sqam/quality-result/detail/:id',
        models: [() => import('../models/qualityResult.js')],
        component: () => import('../routes/QualityResult/Detail'),
      },
      // 我收到的索赔单-索赔项目-关联质检单链接跳转到"质检结果查询"界面
      {
        path: '/sqam/quality-result/detail-from-inspection-num/:id',
        models: [() => import('../models/qualityResult.js')],
        component: () => import('../routes/QualityResult/Detail'),
      },
    ],
  },
  // 质量整改成效追踪
  {
    FilterSupplier: true,
    path: '/sqam/rectification-effect-track',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/rectification-effect-track/list',
        models: [() => import('../models/rectificationEffectTrack.js')],
        component: () => import('../routes/RectificationEffectTrack'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/rectification-effect-track/detail/:id',
        models: [
          () => import('../models/rectificationEffectTrack.js'),
          () => import('../models/promiseMaintainProvide.js'),
          () => import('../models/followUpProduce.js'),
          () => import('../models/rootReasonAnalyze.js'),
          () => import('../models/foreverDealSolution.js'),
          () => import('../models/relateStandard.js'),
          () => import('../models/isSuitUnderItem.js'),
          () => import('../models/create8D.js'),
        ],
        component: () => import('../routes/RectificationEffectTrack/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/rectification-effect-track/sendOrder/detail/:id',
        models: [() => import('../models/sodr/sendOrder.js')],
        component: () => import('../routes/sodr/SendOrder'),
      },
    ],
  },
  {
    FilterSupplier: true,
    path: '/sqam/PPAPTemplate',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/PPAPTemplate/list',
        component: () => import('../routes/PPAPTemplate/List'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/PPAPTemplate/detail/create',
        component: () => import('../routes/PPAPTemplate/Detail'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/PPAPTemplate/detail/:templateId/:viewType?',
        component: () => import('../routes/PPAPTemplate/Detail'),
      },
    ],
  },

  {
    authorized: true,
    path: '/pub/sqam/PPAPWorkbench/detail/:projectHeaderId',
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },

  {
    FilterSupplier: true,
    path: '/sqam/PPAPWorkbench',
    models: [],
    components: [
      {
        FilterSupplier: true,
        path: '/sqam/PPAPWorkbench/list',
        component: () => import('../routes/PPAPWorkbench/List'),
      },
      {
        FilterSupplier: true,
        path: '/sqam/PPAPWorkbench/detail/:projectHeaderId',
        component: () => import('../routes/PPAPWorkbench/Detail'),
      },
    ],
  },
  {
    FilterSupplier: true,
    path: '/sqam/PPAPWorkbenchSummary',
    models: [],
    // authorized: true,
    components: [
      {
        // authorized: true,
        FilterSupplier: true,
        path: '/sqam/PPAPWorkbenchSummary/list',
        component: () => import('../routes/PPAPWorkbenchSummary/List'),
      },
      {
        // authorized: true,
        FilterSupplier: true,
        path: '/sqam/PPAPWorkbenchSummary/detail/:projectHeaderId',
        component: () => import('../routes/PPAPWorkbenchSummary/Detail'),
      },
    ],
  },
  {
    path: '/sqam/PPAPWorkbenchSummarySup',
    models: [],
    // authorized: true,
    components: [
      {
        // authorized: true,
        path: '/sqam/PPAPWorkbenchSummarySup/list',
        component: () => import('../routes/PPAPWorkbenchSummarySup/List'),
      },
      {
        // authorized: true,
        path: '/sqam/PPAPWorkbenchSummarySup/detail/:projectHeaderId',
        component: () => import('../routes/PPAPWorkbenchSummarySup/Detail'),
      },
    ],
  },
  {
    path: '/sqam/PPAPWorkbenchSup',
    models: [],
    components: [
      {
        path: '/sqam/PPAPWorkbenchSup/list',
        component: () => import('../routes/PPAPWorkbenchSup/List'),
      },
      {
        path: '/sqam/PPAPWorkbenchSup/detail/:projectHeaderId',
        component: () => import('../routes/PPAPWorkbenchSup/Detail'),
      },
    ],
  },
  {
    FilterSupplier: true,
    path: '/sqam/PPAPDeliveryTempDefinition',
    models: [],
    // authorized: true,
    components: [
      {
        // authorized: true,
        FilterSupplier: true,
        path: '/sqam/PPAPDeliveryTempDefinition/list',
        component: () => import('../routes/PPAPDeliveryTempDefinition/List'),
      },
    ],
  },
];
