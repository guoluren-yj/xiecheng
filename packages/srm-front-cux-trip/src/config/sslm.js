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
    ],
  },
];
