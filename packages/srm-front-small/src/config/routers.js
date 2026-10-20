module.exports = [
  {
    path: '/small/ec-platform-def',
    models: [() => import('../models/smallEcPlatformDef.js')],
    component: () => import('../routes/EcPlatformDef'),
  },
  {
    path: '/small/address-manage', //
    models: [
      () => import('../models/smallEcAcquirerAddress.js'),
      () => import('../models/smallCompanyDeliveryAddress.js'),
    ],
    component: () => import('../routes/AddressManage'),
    FilterSupplier: true,
  },
  /*  购物车分配模板定义 */
  {
    path: '/small/cart-template-definition',
    models: [],
    components: [
      {
        path: '/small/cart-template-definition/list',
        models: [() => import('../models/cartDefinition.js')],
        component: () => import('../routes/CartTemplateDefinition'),
      },
      {
        path: '/small/cart-template-definition/distribution/:templateId', // 分配模板明细定义,
        models: [() => import('../models/templateDetailInfo')],
        component: () => import('../routes/DistibutionTemplateDefinition'),
      },
    ],
  },

  // 公司收货地址
  // {
  //   path: '/small/com-delivery-address',
  //   models: [
  //     () => import('../models/smallCompanyDeliveryAddress.js'),
  //     () => import('../models/smallEcAcquirerAddress.js'),
  //   ],
  //   component: () => import('../routes/CompanyDeliveryAddress'),
  //   FilterSupplier: true,
  // },
  // 配置默认收货地址
  // {
  //   path: '/small/com-delivery-address-config',
  //   models: [
  //     () => import('../models/smallEcDeliveryAddress.js'),
  //     () => import('../models/smallEcAcquirerAddress.js'),
  //   ],
  //   component: () => import('../routes/CompanyDeliveryAddressConfig'),
  //   FilterSupplier: true,
  // },

  {
    path: '/small/ec-client', // 账号管理
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/small/ec-client/list',
        models: [],
        component: () => import('../routes/ECClient'),
        FilterSupplier: true,
      },
      {
        path: '/small/ec-client/assign',
        models: [],
        component: () => import('../routes/ECClient/Assign'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/small/ec-client-site',
    models: [() => import('../models/smallEcClientSite.js')],
    component: () => import('../routes/ECClientSite'),
  },
  {
    path: '/small/mall-resource', // 商城首页配置
    models: [],
    components: [
      {
        path: '/small/mall-resource/list',
        models: [() => import('../models/smallMallResource.js')],
        component: () => import('../routes/MallResource'),
      },
    ],
  },
  // {
  //   path: '/small/transacte-monite', // 交易监控
  //   models: [() => import('../models/transacteMonite.js')],
  //   component: () => import('../routes/TransacteMonite'),
  // },
  {
    path: '/small/ec-address-manage', // 电商地址
    // authorized: true,
    models: [() => import('../models/ecAddressManage.js')],
    component: () => import('../routes/EcAddressManage'),
  },
  {
    path: '/small/ec-address', // 电商地址
    models: [],
    components: [
      {
        path: '/small/ec-address/list',
        models: [],
        component: () => import('../routes/EcAddress'),
      },
      {
        path: '/small/ec-address/version',
        models: [],
        component: () => import('../routes/EcAddress/VersionManage'),
      },
    ],
  },
  {
    path: '/small/ecommerce-authorization', // 电商授权
    models: [],
    components: [
      {
        path: '/small/ecommerce-authorization/list',
        models: [() => import('../models/ecommerceAuthorization.js')],
        component: () => import('../routes/EcommerceAuthorization'),
      },
      {
        path: '/small/ecommerce-authorization/detail/:accountId/:type',
        models: [() => import('../models/ecommerceAuthorization.js')],
        component: () => import('../routes/EcommerceAuthorization/Detail'),
      },
    ],
  },
  {
    path: '/small/commom-goods-preview', // 公共预览
    models: [],
    component: () => import('../routes/CommomPreview'),
    authorized: true, // 特意加上的开放权限，别删
  },
  {
    path: '/small/mix-configure', // 混合部署配置
    models: [() => import('../models/smalMixConfigure.js')],
    component: () => import('../routes/MixConfigure'),
  },
  {
    path: '/small/mall-home-config',
    models: [
      () => import('../models/mallHomeConfig.js'),
      () => import('../models/mallHome.js'),
      () => import('../models/groupCategoryMaintenance.js'),
      () => import('../models/productRecommended.js'),
    ],
    component: () => import('../routes/MallHomeConfig'),
  },
  {
    path: '/small/product-recommended',
    models: [],
    components: [
      {
        path: '/small/product-recommended/list',
        models: [() => import('../models/productRecommended.js')],
        component: () => import('../routes/ProductRecommended'),
      },
    ],
  },
  {
    path: '/small/after-sale-manage',
    models: [],
    components: [
      {
        path: '/small/after-sale-manage/list',
        models: [],
        component: () => import('../routes/AfterSaleManage'),
      },
      {
        path: '/small/after-sale-manage/detail/:afsId',
        models: [],
        component: () => import('../routes/AfterSaleManage/Detail'),
      },
    ],
  },
  {
    authorized: true,
    title: '导入',
    path: '/small/data-import/:code',
    models: [],
    component: () => import('../routes/himp/CommonImport'),
  },
  {
    authorized: true,
    title: '导入',
    path: '/small/data-import/company/:code',
    models: [],
    component: () => import('../routes/himp/CommonImport'),
  },
  {
    authorized: true,
    path: '/small/mall-home-plate-manage',
    title: '商城首页板块管理',
    models: [],
    FilterSupplier: true,
    components: [
      // 采购套餐管理
      {
        path: '/small/mall-home-plate-manage/list',
        models: [
          () => import('../models/mallHomePlateManage.js'),
          () => import('../models/productRecommended.js'),
        ],
        component: () => import('../routes/PurchasePackageManage'),
        FilterSupplier: true,
      },
    ],
  },
  {
    authorized: true,
    path: '/small/mall-home-plate',
    title: '商城首页板块管理（公司）',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/small/mall-home-plate/list',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/create-bar/:companyId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/CustomBar/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/edit-bar/:companyId/:barId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/CustomBar/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/read-bar/:companyId/:barId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/CustomBar/PreviewDetail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/create-banner/:companyId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/Banner/Create'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/edit-banner/:companyId/:bannerId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/Banner/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/read-banner/:companyId/:bannerId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/Banner/PreviewDetail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/create-package/:companyId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/PurchasePackage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/edit-package/:companyId/:marketBasketId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/PurchasePackage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-home-plate/read-package/:companyId/:marketBasketId',
        models: [() => import('../models/mallHomePlate.js')],
        component: () => import('../routes/MallHomePlate/PurchasePackage/CheckDetail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    title: '支付信息管理',
    path: '/small/pay-info-management/list',
    models: [],
    component: () => import('../routes/PayInfoManagement'),
  },
  //  比价策略定义
  {
    title: '比价策略定义',
    path: '/small/price-comparison-strategy-definition',
    models: [],
    components: [
      {
        path: '/small/price-comparison-strategy-definition/list', // 比价策略定义列表
        models: [],
        component: () => import('../routes/PriceComparisonStrategyDefinition'),
      },
      {
        path: '/small/price-comparison-strategy-definition/:compareRuleHeaderId/:readOnlyPage', // 比价策略定义明细
        models: [],
        component: () => import('../routes/PriceComparisonStrategyDefinition/Detail'),
      },
    ],
  },
  // 拼单活动管理
  {
    title: '拼单活动管理',
    path: '/small/centralize-manage',
    models: [],
    components: [
      {
        path: '/small/centralize-manage/list',
        models: [],
        component: () => import('../routes/CentralizeManage'),
        FilterSupplier: true,
      },
      {
        path: '/small/centralize-manage/detail/:status',
        models: [],
        component: () => import('../routes/CentralizeManage/NewDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 电商签约
  {
    title: '电商签约',
    path: "/small/ec-sign",
    models: [],
    components: [
      {
        path: "/small/ec-sign/list",
        models: [],
        component: () => import('../routes/EcSign'),
        FilterSupplier: true,
      },
      {
        path: "/small/ec-sign/detail/:ecPlatformId",
        models: [],
        component: () => import('../routes/EcSign/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 我的电商
  {
    title: '我的电商',
    path: "/small/my-ec-sign",
    models: [],
    components: [
      {
        path: "/small/my-ec-sign/list",
        models: [],
        component: () => import('../routes/MyEcSign'),
        FilterSupplier: true,
      },
      {
        path: "/small/my-ec-sign/detail/:ecPlatformId",
        models: [],
        component: () => import('../routes/MyEcSign/EcIntroduce'),
        FilterSupplier: true,
      },
    ],
  },
  {
    title: '智能比价采购节流分析报表',
    path: '/small/price-savings-analysis',
    authorized: true,
    models: [],
    components: [
      {
        path: '/small/price-savings-analysis/list',
        models: [],
        component: () => import('../routes/OperationView'),
        FilterSupplier: true,
      },
    ],
  },
];
