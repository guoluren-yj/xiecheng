export default [
  {
    coverPath: '/sslm/enterprise-certification',
    path: '/cux/sslm/enterprise-certification',
    components: [
      {
        coverPath: '/sslm/enterprise-certification/affiliated',
        path: '/cux/sslm/enterprise-certification/affiliated',
        component: () =>
          import('../routes/sslm/EnterpriseCertification/AffiliatedEnterprises'),
      },
      {
        coverPath: '/sslm/enterprise-certification/affiliated-result',
        path: '/cux/sslm/enterprise-certification/affiliated-result',
        component: () =>
          import('../routes/sslm/EnterpriseCertification/AffiliatedEnterprises/Result'),
      },
      // 企业次要信息（步骤下各卡片组件二开覆盖）
      {
        coverPath: '/sslm/enterprise-certification/secondary-info',
        path: '/cux/sslm/enterprise-certification/secondary-info',
        component: () => import('../routes/sslm/EnterpriseCertification/SecondaryInfo'),
      },
    ],
  },
];
