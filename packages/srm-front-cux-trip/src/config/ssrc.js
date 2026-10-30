/**
 * 寻源模块二开路由
 */
export default [
  // 新-询价大厅列表
  {
    coverPath: '/ssrc/new-inquiry-hall/list',
    path: '/cux/ssrc/new-inquiry-hall/list',
    models: [
      () => import('srm-front-ssrc/lib/models/inquiryHall.js'),
      () => import('srm-front-ssrc/lib/models/commonModel.js'),
      () => import('srm-front-ssrc/lib/models/expertScoring.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHallNew'),
    FilterSupplier: true,
  },
  // 专家评分修改
  {
    coverPath:
      '/ssrc/expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
    path:
      '/cux/ssrc/expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
    models: [
      () => import('srm-front-ssrc/lib/models/expertScoring.js'),
      () => import('srm-front-ssrc/lib/models/priceComparison.js'),
      () => import('srm-front-ssrc/lib/models/quotationDetail.js'),
      () => import('srm-front-ssrc/lib/models/commonModel.js'),
    ],
    component: () => import('../routes/sbid/ExpertScoring/Update'),
    FilterSupplier: true,
  },
  // 专家评分修改（新-询价大厅入口）
  {
    coverPath:
      '/ssrc/new-inquiry-hall/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
    path:
      '/cux/ssrc/new-inquiry-hall/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
    models: [
      () => import('srm-front-ssrc/lib/models/expertScoring.js'),
      () => import('srm-front-ssrc/lib/models/expertScoringInquiryHall.js'),
      () => import('srm-front-ssrc/lib/models/priceComparison.js'),
      () => import('srm-front-ssrc/lib/models/quotationDetail.js'),
      () => import('srm-front-ssrc/lib/models/commonModel.js'),
    ],
    component: () => import('../routes/sbid/ExpertScoring/Update/InquiryIndex'),
    FilterSupplier: true,
  },
  // 专家评分查看（详情）
  {
    coverPath: '/ssrc/expert-scoring/detail/:sourceHeaderId/:expertId/:subjectMatterRule',
    path: '/cux/ssrc/expert-scoring/detail/:sourceHeaderId/:expertId/:subjectMatterRule',
    models: [
      () => import('srm-front-ssrc/lib/models/expertScoring.js'),
      () => import('srm-front-ssrc/lib/models/commonModel.js'),
    ],
    component: () => import('../routes/sbid/ExpertScoring/Update'),
    FilterSupplier: true,
  },
];
