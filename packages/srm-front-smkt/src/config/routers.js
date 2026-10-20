module.exports = [
  // 心愿单管理
  {
    path: '/smkt/wish-order-manage',
    FilterSupplier: true,
    // authorized: true,
    components: [
      {
        path: '/smkt/wish-order-manage/list',
        FilterSupplier: true,
        component: () => import('../routes/WishOrderManagment'),
      },
      {
        path: '/smkt/wish-order-manage/preview',
        FilterSupplier: true,
        component: () => import('../routes/SkuPreview'),
      },
    ],
  },
  // 买方市场-我的甄选商品
  {
    path: '/smkt/sku-selection',
    FilterSupplier: true,
    components: [
      {
        path: '/smkt/sku-selection/list',
        FilterSupplier: true,
        component: () => import('../routes/SkuSelection'),
      },
      {
        path: '/smkt/sku-selection/preview',
        FilterSupplier: true,
        component: () => import('../routes/SkuPreview'),
      },
    ],
  },
  // 甄选供应商管理
  {
    path: '/smkt/market-supplier-manage',
    FilterSupplier: true,
    authorized: true,
    component: () => import('../routes/MarketSupplierManage'),
  },
  // 卖方市场-甄选商品
  {
    path: '/smkt/sku-selection-sale',
    components: [
      {
        path: '/smkt/sku-selection-sale/list',
        component: () => import('../routes/SkuSelectionSale'),
      },
      {
        path: '/smkt/sku-selection-sale/preview',
        component: () => import('../routes/SkuPreview'),
      },
    ],
  },
  //
  // 平台-甄选商品
  {
    path: '/smkt/sku-selection-platform',
    components: [
      {
        path: '/smkt/sku-selection-platform/list',
        component: () => import('../routes/SkuSelectionPlatform'),
      },
      {
        path: '/smkt/sku-selection-platform/preview',
        component: () => import('../routes/SkuPreview'),
      },
    ],
  },
  // 卖方市场-发现商机
  {
    path: '/smkt/business-opportunity',
    component: () => import('../routes/BusiOpport'),
  },
  // 平台甄选供应商管理
  {
    path: '/smkt/platform/supplier-manage',
    authorized: true,
    component: () => import('../routes/PlatformSupplierManage'),
  },
  // 甄选目录
  {
    path: '/smkt/catalog-manage',
    authorized: true,
    component: () => import('../routes/CatalogManage'),
  },
];
