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
];
