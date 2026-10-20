/**
 * 在router.js中已经统一注入了path的服务名models和component的模块路径
 */
module.exports = [
  {
    authorized: true,
    path: '/sads/data-import/:code',
    models: [],
    component: () => import('../routes/himp/CommonImport'),
  },
  {
    path: '/sads/custom-search-config',
    models: [],
    component: () => import('../routes/CusSearchConfig'),
  },
  {
    path: '/sads/pipeline-data-configuration',
    component: () => import('../routes/Pipeline/index'),
    // authorized: true
  },
  {
    path: '/sads/data-scheduling',
    component: () => import('../routes/DataScheduling/index'),
    // authorized: true,
  },
  {
    path: '/sads/persIndex-cofig',
    component: () => import('../routes/PersIndexCofig/index'),
    // authorized: true,
  },
  {
    path: '/sads/lexicon',
    // title: '搜索词库管理',
    FilterSupplier: true,
    component: () => import('../routes/Lexicon'),
  },
  {
    path: '/sads/srm-lexicon', // 平台级
    // title: '搜索词库管理',
    component: () => import('../routes/Lexicon'),
  },
  {
    path: '/sads/mall-search-config', // 平台级
    title: '主站搜索配置',
    component: () => import('../routes/SiteSearchConfig'),
  },
  {
    path: '/sads/mall-search-synonymous-word', // 平台级
    title: '同义词库',
    component: () => import('../routes/SynonymousWord'),
  },
];
