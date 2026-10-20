module.exports = [
  // 通用导入页面
  {
    path: '/sigl/batch-upload/:code',
    authorized: true,
    component: () => import('../routes/himp/CommonImport'),
  },

  // 会员管理
  {
    path: '/sigl/member-centre-memberlist',
    FilterSupplier: true,
    component: () => import('../routes/MemberCentre/MemberManagement/index'),
  },
  // 会员标签管理
  {
    path: '/sigl/member-centre-taglist',
    FilterSupplier: true,
    component: () => import('../routes/MemberCentre/TagManagement/index'),
  },
  // 积分管理
  {
    path: '/sigl/member-centre-points',
    FilterSupplier: true,
    component: () => import('../routes/MemberCentre/PointsManagement/index'),
  },
  // 积分类型管理
  {
    path: '/sigl/integral-type-manage',
    FilterSupplier: true,
    component: () => import('../routes/IntegralTypeManage'),
  },
];
