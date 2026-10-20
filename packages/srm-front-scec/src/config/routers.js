export default [
  {
    path: '/scec/ec-platform-def',
    models: [() => import('../models/ecPlatformDef.js')],
    component: () => import('../routes/EcPlatformDef'),
  },
  {
    path: '/scec/platform-custom-bar',
    models: [],
    components: [
      {
        path: '/scec/platform-custom-bar/list',
        models: [() => import('../models/customBar.js')],
        component: () => import('../routes/CustomBar/index'),
      },
      {
        path: '/scec/platform-custom-bar/detail/:barId',
        models: [() => import('../models/customBar.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CustomBar/PlatformDetail/Detail.js'),
      },
      {
        path: '/scec/platform-custom-bar/check-detail/:barId',
        models: [() => import('../models/customBar.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CustomBar/CheckDetail/Detail.js'),
      },
      {
        path: '/scec/platform-custom-bar/create',
        models: [() => import('../models/customBar.js')],
        component: () => import('../routes/CustomBar/PlatformDetail/Detail.js'),
      },
      {
        path: '/scec/platform-custom-bar/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
      },
    ],
  },
  {
    path: '/scec/group-custom-bar',
    models: [],
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/scec/group-custom-bar/list',
        models: [() => import('../models/groupcustomBar.js')],
        component: () => import('../routes/GroupCustomBar'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-custom-bar/detail/:companyId/:barId',
        models: [() => import('../models/groupcustomBar.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/GroupCustomBar/PlatformDetail/Detail.js'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-custom-bar/check-detail/:companyId/:barId',
        models: [() => import('../models/groupcustomBar.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/GroupCustomBar/CheckDetail/Detail.js'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-custom-bar/create/:companyId',
        models: [() => import('../models/groupcustomBar.js')],
        component: () => import('../routes/GroupCustomBar/PlatformDetail/Detail.js'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-custom-bar/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/company-custom-bar',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/company-custom-bar/list',
        models: [() => import('../models/customBar.js')],
        component: () => import('../routes/CustomBar'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-custom-bar/detail/:companyId/:barId',
        models: [() => import('../models/customBar.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CustomBar/PlatformDetail/Detail.js'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-custom-bar/check-detail/:companyId/:barId',
        models: [() => import('../models/customBar.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CustomBar/CheckDetail/Detail.js'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-custom-bar/create/:companyId',
        models: [() => import('../models/customBar.js')],
        component: () => import('../routes/CustomBar/PlatformDetail/Detail.js'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-custom-bar/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/ec-acquirer-address',
    models: [() => import('../models/ecAcquirerAddress.js')],
    component: () => import('../routes/EcAcquirerAddress'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-platform-category',
    models: [() => import('../models/ecPlatformCategory.js')],
    component: () => import('../routes/EcPlatformCategory'),
  },
  {
    path: '/scec/ec-catalog',
    models: [() => import('../models/ecCatalog.js'), () => import('../models/ecPlatformCategory.js')],
    component: () => import('../routes/EcCatalog'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-company-catalog',
    models: [() => import('../models/ecCompanyCatalog.js'), () => import('../models/ecPlatformCategory.js')],
    component: () => import('../routes/EcCompanyCatalog'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-delivery-address',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/ec-delivery-address/list',
        models: [() => import('../models/ecDeliveryAddress.js'), () => import('../models/ecAcquirerAddress.js')],
        component: () => import('../routes/EcDeliveryAddress'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-delivery-address/config',
        models: [() => import('../models/ecDeliveryAddress.js'), () => import('../models/ecAcquirerAddress.js')],
        component: () => import('../routes/EcDeliveryAddress/Config'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/com-delivery-address',
    models: [() => import('../models/companyDeliveryAddress.js'), () => import('../models/ecAcquirerAddress.js')],
    component: () => import('../routes/CompanyDeliveryAddress'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-platform-category',
    models: [() => import('../models/ecPlatformCategory.js')],
    component: () => import('../routes/EcPlatformCategory'),
  },
  {
    path: '/scec/ec-catalog',
    models: [() => import('../models/ecCatalog.js'), () => import('../models/ecPlatformCategory.js')],
    component: () => import('../routes/EcCatalog'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-company-catalog',
    models: [() => import('../models/ecCompanyCatalog.js'), () => import('../models/ecPlatformCategory.js')],
    component: () => import('../routes/EcCompanyCatalog'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-category-platform-catalog',
    models: [],
    components: [
      {
        path: '/scec/ec-category-platform-catalog/list',
        models: [() => import('../models/ecCategoryPlatformCatalog.js'), () => import('../models/productDetailsModal.js')],
        component: () => import('../routes/EcCategoryPlatformCatalog'),
      },
      {
        path: '/scec/ec-category-platform-catalog/detail',
        models: [() => import('../models/ecCategoryPlatformCatalog.js'), () => import('../models/productDetailsModal.js')],
        component: () => import('../routes/ProductDetailsModal'),
      },
      {
        path: '/scec/ec-category-platform-catalog/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
      },
    ],
  },
  {
    path: '/scec/ec-category-company-catalog',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/ec-category-company-catalog/list',
        models: [
          () => import('../models/ecCompanyCatalog.js'),
          () => import('../models/ecCategoryCatalog.js'),
          () => import('../models/ecCategoryCompanyCatalog.js'),
          () => import('../models/productDetailsModal.js'),
        ],
        component: () => import('../routes/EcCategoryCompanyCatalog'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-category-company-catalog/detail',
        models: [
          () => import('../models/ecCompanyCatalog.js'),
          () => import('../models/ecCategoryCatalog.js'),
          () => import('../models/ecCategoryCompanyCatalog.js'),
          () => import('../models/productDetailsModal.js'),
        ],
        component: () => import('../routes/ProductDetailsModal'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-category-company-catalog/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/materiel-mapping',
    models: [() => import('../models/ecMaterielMapping.js')],
    component: () => import('../routes/MaterielMapping'),
    FilterSupplier: true,
  },
  {
    path: '/scec/ec-address-manage',
    models: [],
    components: [
      {
        path: '/scec/ec-address-manage/list',
        models: [() => import('../models/ecPlatformDef.js')],
        component: () => import('../routes/EcAddressManage'),
      },
      {
        path: '/scec/ec-address-manage/detail',
        models: [() => import('../models/ecAddressManage.js')],
        component: () => import('../routes/EcAddressManage/Detail'),
      },
    ],
  },
  {
    path: '/scec/ec-category-catalog',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/ec-category-catalog/list',
        models: [() => import('../models/ecCategoryCatalog.js'), () => import('../models/productDetailsModal.js')],
        component: () => import('../routes/EcCategoryCatalog'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-category-catalog/detail',
        models: [() => import('../models/ecCategoryCatalog.js'), () => import('../models/productDetailsModal.js')],
        component: () => import('../routes/ProductDetailsModal'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-category-catalog/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/group-materiel-mapping',
    title: '集团物料映射',
    authorized: true,
    models: [() => import('../models/groupMaterielMapping.js')],
    component: () => import('../routes/GroupMaterielMapping'),
    FilterSupplier: true,
  },
  {
    path: '/scec/goods-maintain',
    models: [],
    components: [
      {
        path: '/scec/goods-maintain/list',
        models: [() => import('../models/goodsMaintain.js'), () => import('../models/operateRecord.js'), () => import('../models/modifyDirectory.js'), () => import('../models/sourcing.js')],
        component: () => import('../routes/GoodsMaintain'),
      },
      {
        path: '/scec/goods-maintain/detail',
        models: [() => import('../models/goodsMaintain.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsMaintain/Detail'),
      },
      {
        path: '/scec/goods-maintain/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
      },
    ],
  },
  {
    path: '/scec/goods-maintain-pur',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/goods-maintain-pur/list',
        models: [() => import('../models/goodsMaintainPur.js'), () => import('../models/operateRecord.js'), () => import('../models/modifyDirectory.js'), () => import('../models/sourcing.js')],
        component: () => import('../routes/GoodsMaintainPur'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-maintain-pur/detail',
        models: [() => import('../models/goodsMaintainPur.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsMaintainPur/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-maintain-pur/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/goods-manage',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/goods-manage/list',
        models: [() => import('../models/goodsManage.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsManage/index'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-manage/detail',
        models: [() => import('../models/goodsManage.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsManage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-manage/goods-preview-only',
        models: [],
        component: () => import('../routes/GoodsPreview/PreGoodInfo'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/goods-approve',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/goods-approve/list',
        models: [() => import('../models/goodsApprove.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsApprove'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-approve/detail',
        models: [() => import('../models/goodsApprove.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsApprove/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-approve/goods-preview-only',
        models: [],
        component: () => import('../routes/GoodsPreview/PreGoodInfo'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/goods-demand',
    models: [],
    components: [
      {
        path: '/scec/goods-demand/list',
        models: [() => import('../models/goodsDemand.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsDemand'),
      },
      {
        path: '/scec/goods-demand/detail',
        models: [() => import('../models/goodsDemand.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsDemand/Detail'),
      },
      {
        path: '/scec/goods-demand/goods-preview-only',
        models: [],
        component: () => import('../routes/GoodsPreview/PreGoodInfo'),
      },
    ],
  },
  {
    path: '/scec/goods-demand-pur',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/goods-demand-pur/list',
        models: [() => import('../models/goodsDemandPur.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsDemandPur'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-demand-pur/detail',
        models: [() => import('../models/goodsDemandPur.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsDemandPur/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-demand-pur/goods-preview-only',
        models: [],
        component: () => import('../routes/GoodsPreview/PreGoodInfo'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/ec-client',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/ec-client/list',
        models: [() => import('../models/ecClient.js')],
        component: () => import('../routes/ECClient/Org'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-client/assign',
        models: [() => import('../models/ecClientAssign.js')],
        component: () => import('../routes/ECClient/Org/Assign'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/ec-client-site',
    models: [() => import('../models/ecClientSite.js')],
    component: () => import('../routes/ECClientSite'),
  },
  {
    path: '/scec/company-banner',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/company-banner/list',
        models: [() => import('../models/companyBanner.js')],
        component: () => import('../routes/CompanyBanner'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-banner/create/:companyId',
        models: [() => import('../models/companyBanner.js')],
        component: () => import('../routes/CompanyBanner/Create'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-banner/detail/:bannerId/:companyId',
        models: [() => import('../models/companyBanner.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CompanyBanner/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-banner/check-detail/:bannerId/:companyId',
        models: [() => import('../models/companyBanner.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CompanyBanner/CheckDetail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/company-banner/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/group-banner',
    models: [],
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/scec/group-banner/list',
        models: [() => import('../models/groupBanner.js')],
        component: () => import('../routes/GroupBanner'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-banner/create',
        models: [() => import('../models/groupBanner.js')],
        component: () => import('../routes/GroupBanner/Create'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-banner/detail/:bannerId/:companyId',
        models: [() => import('../models/groupBanner.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/GroupBanner/Detail/'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-banner/check-detail/:bannerId/:companyId',
        models: [() => import('../models/groupBanner.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/GroupBanner/CheckDetail/'),
        FilterSupplier: true,
      },
      {
        path: '/scec/group-banner/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/platform-banner',
    models: [],
    components: [
      {
        path: '/scec/platform-banner/list',
        models: [() => import('../models/companyBanner.js')],
        component: () => import('../routes/CompanyBanner'),
      },
      {
        path: '/scec/platform-banner/create',
        models: [() => import('../models/companyBanner.js')],
        component: () => import('../routes/CompanyBanner/Create'),
      },
      {
        path: '/scec/platform-banner/detail/:bannerId',
        models: [() => import('../models/companyBanner.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CompanyBanner/Detail/'),
      },
      {
        path: '/scec/platform-banner/check-detail/:bannerId',
        models: [() => import('../models/companyBanner.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/CompanyBanner/CheckDetail/'),
      },
      {
        path: '/scec/platform-banner/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
      },
    ],
  },
  {
    path: '/scec/ec-product-query', // 集团电商商品查询
    models: [() => import('../models/ecProductQuery.js')],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/ec-product-query/list',
        models: [() => import('../models/ecProductQuery.js')],
        component: () => import('../routes/EcProductQuery'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-product-query/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/ec-platform-product-query', // 平台电商商品查询
    models: [],
    components: [
      {
        path: '/scec/ec-platform-product-query/list',
        models: [() => import('../models/ecPlatformProductQuery.js')],
        component: () => import('../routes/EcPlatformProductQuery'),
      },
      {
        path: '/scec/ec-platform-product-query/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
      },
    ],
  },
  {
    path: '/scec/ec-company-product-query', // 公司电商商品查询
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/ec-company-product-query/list',
        models: [() => import('../models/ecCompanyProductQuery.js')],
        component: () => import('../routes/EcCompanyProductQuery'),
        FilterSupplier: true,
      },
      {
        path: '/scec/ec-company-product-query/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/ec-company-order-query', // 订单查询
    models: [() => import('../models/ecCompanyOrderQuery.js')],
    component: () => import('../routes/EcCompanyOrderQuery'),
  },
  {
    path: '/scec/goods-share', // 商品分享
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/goods-share/list',
        models: [() => import('../models/goodsShare.js'), () => import('../models/ecCompanyCatalog.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/GoodsShare'),
        FilterSupplier: true,
      },
      {
        path: '/scec/goods-share/detail',
        models: [() => import('../models/goodsShare.js')],
        component: () => import('../routes/GoodsShare/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/shopping-basket', // 购物篮管理
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/shopping-basket/list',
        models: [() => import('../models/shoppingBasket.js'), () => import('../models/ecCompanyCatalog.js')],
        component: () => import('../routes/ShoppingBasket'),
        FilterSupplier: true,
      },
      {
        path: '/scec/shopping-basket/detail/:companyId/:marketBasketId',
        models: [() => import('../models/shoppingBasket.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/ShoppingBasket/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/shopping-basket/check-detail/:companyId/:marketBasketId',
        models: [() => import('../models/shoppingBasket.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/ShoppingBasket/CheckDetail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/shopping-basket/create/:companyId',
        models: [() => import('../models/shoppingBasket.js'), () => import('../models/goodsPreview.js')],
        component: () => import('../routes/ShoppingBasket/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/scec/shopping-basket/goods-preview',
        models: [],
        component: () => import('../routes/GoodsPreview'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/mall-resource', // 平台电商商品查询
    models: [],
    components: [
      {
        path: '/scec/mall-resource/list',
        models: [() => import('../models/mallResource.js')],
        component: () => import('../routes/MallResource'),
      },
      {
        path: '/scec/mall-resource/template/edit/:pageConfigId',
        models: [() => import('../models/mallResource.js')],
        component: () => import('../routes/MallResource/Detail'),
      },
    ],
  },
  {
    path: '/scec/unShelveApprove',
    models: [() => import('../models/goodsUnshelveApprove.js')],
    component: () => import('../routes/GoodsUnshelveApprove'),
    FilterSupplier: true,
  },
  {
    path: '/pub/scec/hwfp-unshelve-approve/:productIds',
    authorized: true, // 特意加上的开放权限，别删
    models: [() => import('../models/hwfpUnshelveApprove.js')],
    component: () => import('../models/hwfpUnshelveApprove.js'),
  },
  // 工作流 -商品审批
  {
    path: '/pub/scec/goods-approve-hwfp',
    // path: '/scec/account-visible',
    models: [],
    authorized: true, // 特意加上的开放权限，别删
    components: [
      {
        path: '/pub/scec/goods-approve-hwfp/list/:productIds',
        authorized: true,
        models: [() => import('../models/goodsApprove.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/hwfpGoodsApprove'),
      },
      {
        path: '/pub/scec/goods-approve-hwfp/detail',
        authorized: true,
        models: [() => import('../models/goodsApprove.js'), () => import('../models/operateRecord.js')],
        component: () => import('../routes/hwfpGoodsApprove/Detail'),
      },
    ],
  },
  {
    path: '/scec/commom-goods-preview',
    models: [() => import('../models/goodsPreview.js')],
    component: () => import('../routes/CommonPreview'),
    authorized: true, // 特意加上的开放权限，别删
  },
  {
    path: '/scec/account-visible',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/account-visible/list',
        models: [() => import('../models/accountVisible.js')],
        component: () => import('../routes/AccountVisible'),
        FilterSupplier: true,
      },
      {
        path: '/scec/account-visible/detail/:userCatalogConfigId/:companyId',
        models: [() => import('../models/accountVisible.js')],
        component: () => import('../routes/AccountVisible/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/product-shelves',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/scec/product-shelves/list',
        models: [() => import('../models/productShelves.js')],
        component: () => import('../routes/ProductShelves'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/scec/mix-configure', // 混合部署配置
    models: [() => import('../models/mixConfigure.js')],
    component: () => import('../routes/MixConfigure'),
  },
];
