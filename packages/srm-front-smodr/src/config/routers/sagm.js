// module.exports = [
//   {
//     // title: '策略维度配置',
//     // authorized: true,
//     path: '/s2-mall/sagm/strategy-config',
//     component: () => import('../../routes/sagm/StrategyConfig'),
//   },
//   {
//     // title: '价格策略管理',
//     // authorized: true,
//     path: '/s2-mall/sagm/price-strategy',
//     FilterSupplier: true,
//     component: () => import('../../routes/sagm/PriceStrategy'),
//   },
//   {
//     // title: '销售协议管理',
//     // authorized: true,
//     path: '/s2-mall/sagm/sale-agreement',
//     components: [
//       {
//         path: '/s2-mall/sagm/sale-agreement/list',
//         component: () => import('../../routes/sagm/SaleAgreement'),
//       },
//       {
//         path: '/s2-mall/sagm/sale-agreement/detail/:type/:status', // type: 区分电商/目录化协议, status: 区分只读/编辑状态
//         component: () => import('../../routes/sagm/SaleAgreement/Detail'),
//       },
//     ],
//   },
//   {
//     title: '商品权限管理',
//     authorized: true,
//     path: '/s2-mall/sagm/product-authority',
//     FilterSupplier: true,
//     component: () => import('../../routes/sagm/ProductAuthority'),
//   },
// ];
