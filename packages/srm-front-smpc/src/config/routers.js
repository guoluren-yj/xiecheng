/**
 * 在router.js中已经统一注入了path的服务名models和component的模块路径
 */
module.exports = [
  // 导入
  {
    authorized: true,
    path: '/smpc/data-import/:code',
    component: () => import('../routes/himp/CommonImport'),
  },
  // 商品预览公共预览
  {
    name: '/s2-mall/product/preview',
    component: () => import('../routes/product/SkuPreview'),
    authorized: true, // 特意加上的开放权限，别删
  },
  // 商品预览新版公共预览页面
  {
    path: '/s2-mall/product/new-preview',
    component: () => import('../routes/product/SkuPreviewNew'),
    authorized: true, // 特意加上的开放权限，别删
  },
  {
    authorized: true,
    path: '/smpc/sku-preview',
    component: () => import('../routes/product/SkuPreview'),
  },
  // 商品详情公共预览
  {
    authorized: true,
    path: '/smpc/sku-detail-pur',
    FilterSupplier: true,
    component: () => import('../routes/product/SkuDetail'),
  },
  {
    authorized: true,
    path: '/smpc/sku-detail-sup',
    component: () => import('../routes/product/SkuDetail'),
  },
  // 提供给协议模块打开的商品发布页面，目的不占用原有商品发布菜单
  {
    path: '/smpc/sku-release-pur',
    FilterSupplier: true,
    authorized: true,
    component: () => import('../routes/product/SkuCreate'),
  },
  {
    path: '/smpc/sku-release-sup',
    authorized: true,
    component: () => import('../routes/product/SkuCreate'),
  },
  // 提供给流程申请查看商品详情
  {
    path: '/smpc/shelf-apply-pub/sku-detail-sup',
    authorized: true,
    component: () => import('../routes/product/SkuDetail'),
  },
  // 平台级-------------------------------------------------------------
  {
    path: '/s2-mall/product/approve-rule',
    // title: '商品审核规则',
    models: [() => import('../models/product/productApproveRule')],
    component: () => import('../routes/product/ApproveRule'),
  },
  {
    path: '/s2-mall/product/attribute-manage',
    // title: '属性管理',
    authorized: true,
    models: [],
    component: () => import('../routes/product/AttributeManage'),
  },
  {
    path: '/s2-mall/product/attribute-value-manage',
    // title: '属性值管理',
    component: () => import('../routes/product/AttributeValueManage'),
  },
  {
    path: '/s2-mall/product/brand-manage',
    // title: '品牌管理',
    component: () => import('../routes/product/BrandManage'),
  },
  {
    path: '/s2-mall/product/category-manage',
    // title: '分类管理',
    component: () => import('../routes/product/CategoryManage'),
  },
  {
    // title: '商品标签定义',
    path: '/s2-mall/product/platform-label-config', // 平台级
    component: () => import('../routes/product/ProductLabelConfig'),
  },
  {
    path: '/smpc/parity-rule', // 比价规则
    models: [() => import('../models/product/parityRule')],
    component: () => import('../routes/product/ParityRule'),
  },
  {
    // 平台
    path: '/smpc/custom-sku/attr-value',
    // title: '定制品属性值配置',
    component: () => import('../routes/product/CustomAttrValue'),
  },
  // 租户级-----------------------------------------------------------
  {
    path: '/s2-mall/product/attribute-mapping',
    // title: '属性映射',
    FilterSupplier: true,
    component: () => import('../routes/product/AttributeMapping'),
  },
  {
    path: '/s2-mall/product/introduce-template-def',
    // title: '商品介绍模板定义',
    FilterSupplier: true,
    components: [
      {
        path: '/s2-mall/product/introduce-template-def/list',
        FilterSupplier: true,
        component: () => import('../routes/product/IntroduceTemplateDef'),
      },
      {
        path: '/s2-mall/product/introduce-template-def/detail/:templateId',
        FilterSupplier: true,
        component: () => import('../routes/product/IntroduceTemplateDef/Detail'),
      },
    ],
  },
  {
    // title: '商品标签定义',
    path: '/s2-mall/product/label-config',
    FilterSupplier: true,
    component: () => import('../routes/product/ProductLabelConfig'),
  },
  {
    // title: '商品标签管理',
    path: '/s2-mall/product/label-manage',
    FilterSupplier: true,
    component: () => import('../routes/product/ProductLabelManage'),
  },
  {
    // title: '商品映射',
    path: '/s2-mall/product/product-mapping',
    FilterSupplier: true,
    component: () => import('../routes/product/ProductMapping'),
  },
  {
    // title: '目录映射',
    path: '/s2-mall/product/catalog-mapping',
    FilterSupplier: true,
    component: () => import('../routes/product/CatalogMapping'),
  },
  {
    // title: '目录管理', // 有二开，不要动这个路由
    path: '/s2-mall/product/catalog-manage',
    FilterSupplier: true,
    components: [
      {
        path: '/s2-mall/product/catalog-manage/list',
        FilterSupplier: true,
        component: () => import('../routes/product/CatalogManage'),
      },
      {
        path: '/s2-mall/product/catalog-manage/mobile-icon-import',
        FilterSupplier: true,
        component: () => import('../routes/product/CatalogManage/MobileIconImport'),
      },
    ],
  },
  {
    // title: '物料映射',
    path: '/s2-mall/product/materiel-mapping',
    FilterSupplier: true,
    component: () => import('../routes/product/MaterielMapping'),
  },
  {
    // title: '商品发布（采）',
    path: '/smpc/sku-publish-pur',
    FilterSupplier: true,
    components: [
      {
        path: '/smpc/sku-publish-pur/list',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuPublish'),
      },
      {
        path: '/smpc/sku-publish-pur/detail',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuDetail'),
      },
      {
        path: '/smpc/sku-publish-pur/create',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuCreate'),
      },
      {
        path: '/smpc/sku-publish-pur/img-import',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuImgImport'),
      },
    ],
  },
  {
    // title: '商品发布（供）',
    path: '/smpc/sku-publish-sup',
    components: [
      {
        path: '/smpc/sku-publish-sup/list',
        component: () => import('../routes/product/SkuPublish'),
      },
      {
        path: '/smpc/sku-publish-sup/detail',
        component: () => import('../routes/product/SkuDetail'),
      },
      {
        path: '/smpc/sku-publish-sup/create',
        component: () => import('../routes/product/SkuCreate'),
      },
      {
        path: '/smpc/sku-publish-sup/img-import',
        component: () => import('../routes/product/SkuImgImport'),
      },
    ],
  },
  {
    // title: '商品中心工作台（采）',
    path: '/smpc/sku-workbench-pur',
    FilterSupplier: true,
    components: [
      {
        path: '/smpc/sku-workbench-pur/list',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuWorkbench'),
      },
      {
        path: '/smpc/sku-workbench-pur/create',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuCreate'),
      },
      {
        path: '/smpc/sku-workbench-pur/detail',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuDetail'),
      },
      {
        path: '/smpc/sku-workbench-pur/img-import',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuImgImport'),
      },
      {
        path: '/smpc/sku-workbench-pur/custom-attr-template',
        FilterSupplier: true,
        component: () => import('../routes/product/CustomTemplate'),
      },
      {
        path: '/smpc/sku-workbench-pur/sku-feedback',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuFeedback'),
      },
    ],
  },
  {
    // title: '商品中心工作台（供）',
    path: '/smpc/sku-workbench-sup',
    components: [
      {
        path: '/smpc/sku-workbench-sup/list',
        component: () => import('../routes/product/SkuWorkbench/Supplier'),
      },
      {
        path: '/smpc/sku-workbench-sup/create',
        component: () => import('../routes/product/SkuCreate'),
      },
      {
        path: '/smpc/sku-workbench-sup/detail',
        component: () => import('../routes/product/SkuDetail'),
      },
      {
        path: '/smpc/sku-workbench-sup/img-import',
        component: () => import('../routes/product/SkuImgImport'),
      },
      {
        path: '/smpc/sku-workbench-sup/custom-attr-template',
        component: () => import('../routes/product/CustomTemplate'),
      },
    ],
  },
  {
    // title: '商品评价管理',
    path: '/smpc/sku-evaluate',
    FilterSupplier: true,
    component: () => import('../routes/product/SkuEvaluate'),
  },
  {
    // title: '商品审批',
    path: '/smpc/sku-approve-pur',
    FilterSupplier: true,
    components: [
      {
        path: '/smpc/sku-approve-pur/list',
        component: () => import('../routes/product/SkuApprove'),
      },
      {
        path: '/smpc/sku-approve-pur/detail',
        component: () => import('../routes/product/SkuDetail'),
      },
    ],
  },
  {
    // title: '商品上下架',
    path: '/smpc/sku-shelf',
    FilterSupplier: true,
    component: () => import('../routes/product/SkuShelf'),
  },
  {
    path: '/smpc/sku-query-pur',
    // title: '商品查询（采）',
    FilterSupplier: true,
    components: [
      {
        path: '/smpc/sku-query-pur/list',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuQuery'),
      },
      {
        path: '/smpc/sku-query-pur/detail',
        FilterSupplier: true,
        component: () => import('../routes/product/SkuDetail'),
      },
    ],
  },
  {
    path: '/smpc/sku-query-sup',
    // title: '商品查询（供）',
    components: [
      {
        path: '/smpc/sku-query-sup/list',
        component: () => import('../routes/product/SkuQuery'),
      },
      {
        path: '/smpc/sku-query-sup/detail',
        component: () => import('../routes/product/SkuDetail'),
      },
    ],
  },
  {
    path: '/smpc/stock-manage-pur',
    // title: '库存管理（采）',
    FilterSupplier: true,
    component: () => import('../routes/product/SkuStock'),
  },
  {
    path: '/smpc/stock-manage-sup',
    // title: '库存管理（供）',
    component: () => import('../routes/product/SkuStock'),
  },
  // {
  //   path: '/smpc/custom-sku-attr/template', // 定制品属性模版管理
  //   component: () => import('../routes/product/CustomTemplate'),
  // },
  {
    // title: '电商价格监控',
    path: '/smpc/ec-price-monitor',
    FilterSupplier: true,
    component: () => import('../routes/product/EcPriceMonitor'),
  },
  // 商品上下架申请管理
  {
    path: '/smpc/shelf-apply',
    components: [
      {
        path: '/smpc/shelf-apply/list',
        component: () => import('../routes/product/ShelfApply'),
      },
      {
        path: '/smpc/shelf-apply/detail/:status',
        component: () => import('../routes/product/ShelfApply/Detail'),
      },
      {
        path: '/smpc/shelf-apply/sku-detail-sup',
        component: () => import('../routes/product/SkuDetail'),
      },
    ],
  },
  {
    // title: '搜索热词类目推荐',
    path: '/smpc/hot-word-mapping',
    FilterSupplier: true,
    component: () => import('../routes/product/HotWordMapping'),
  },
  {
    path: '/pub/smpc/sku-workflow-approve-pur/detail',
    authorized: true,
    component: () => import('../routes/product/SkuDetail/WorkFlow'),
  },
  {
    path: '/pub/smpc/sku-shelf-workflow-approve/detail',
    authorized: true,
    component: () => import('../routes/product/SkuShelfWorkFlow'),
  },
];
