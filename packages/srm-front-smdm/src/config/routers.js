module.exports = [
  {
    path: '/smdm/rate-org',
    models: [() => import('../models/rateOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/RateOrg'),
  },
  {
    path: '/smdm/purchase/category',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/purchase/category/list',
        models: [() => import('../models/purchaseCategory.js')],
        FilterSupplier: true,
        component: () => import('../routes/PurchaseCategory'),
      },
      {
        path: '/smdm/purchase/category/import/:code',
        FilterSupplier: true,
        component: () => import('../routes/components/CommentImport'),
        authorized: true,
        models: [],
      },
      {
        path: '/smdm/purchase/category/template/:orgId/:categoryId',
        models: [() => import('../models/purchaseCategory.js')],
        FilterSupplier: true,
        component: () => import('../routes/PurchaseCategory/Template'),
      },
    ],
  },
  {
    path: '/smdm/bank-org',
    models: [],
    components: [
      {
        path: '/smdm/bank-org/list',
        models: [() => import('../models/bankTenant.js')],
        component: () => import('../routes/BankTenant'),
      },
      {
        path: '/smdm/bank-org/branch/:bankId',
        models: [() => import('../models/bankTenant.js')],
        component: () => import('../routes/BankTenant/BankTenantBranch'),
      },
      {
        path: '/smdm/bank-org/import/:code',
        component: () => import('../routes/components/CommentImport'),
        authorized: true,
        models: [],
      },
    ],
  },
  {
    path: '/smdm/tax-rate-org',
    models: [() => import('../models/taxRateOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/TaxRateOrg'),
  },
  // 汇率导入
  {
    path: '/smdm/rate-org/data-import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
  },
  {
    path: '/smdm/currency-org',
    models: [() => import('../models/currencyOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/CurrencyOrg'),
  },
  {
    path: '/smdm/payment-type',
    models: [() => import('../models/paymentType.js')],
    FilterSupplier: true,
    component: () => import('../routes/PaymentType'),
  },
  {
    path: '/smdm/payment-usages',
    models: [() => import('../models/paymentUsages.js')],
    FilterSupplier: true,
    component: () => import('../routes/PaymentUsages/PaymentUsages'),
  },
  {
    path: '/smdm/payment-terms',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/payment-terms/list',
        models: [() => import('../models/paymentTerms.js')],
        FilterSupplier: true,
        component: () => import('../routes/PayTermsCtrl'),
      },
      {
        path: '/smdm/payment-terms/detail/:termHeaderId',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/PayTermsCtrl/Detail'),
      },
      {
        path: '/smdm/payment-terms/released-by-id/:termHeaderId',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/PayTermsCtrl/Detail'),
      },
      {
        path: '/smdm/payment-terms/released-by-num/:termNum',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/PayTermsCtrl/Detail'),
      },
      {
        path: '/smdm/payment-terms/released-by-old/:termId',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/PayTermsCtrl/Detail'),
      },
    ],
  },
  // 付款条款导入
  {
    path: '/smdm/payment-terms/import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
  },
  {
    path: '/smdm/uom-org',
    models: [() => import('../models/uomOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/UomOrg'),
  },
  {
    path: '/smdm/uom-org/import/:code',
    component: () => import('../routes/components/CommentImport'),
    authorized: true,
    models: [],
  },
  {
    path: '/smdm/uom-type',
    models: [() => import('../models/uomType.js')],
    FilterSupplier: true,
    component: () => import('../routes/UomType'),
  },
  {
    path: '/smdm/period-org',
    models: [() => import('../models/periodOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/PeriodOrg'),
  },
  {
    path: '/smdm/ledger',
    models: [() => import('../models/ledger.js')],
    FilterSupplier: true,
    component: () => import('../routes/Ledger'),
  },
  {
    path: '/smdm/materiel',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/materiel/list',
        models: [() => import('../models/materiel.js')],
        FilterSupplier: true,
        component: () => import('../routes/Materiel'),
      },
      {
        path: '/smdm/materiel/detail/:itemId',
        models: [() => import('../models/materiel.js')],
        FilterSupplier: true,
        component: () => import('../routes/Materiel/Detail'),
      },
      {
        path: '/smdm/materiel/create',
        models: [() => import('../models/materiel.js')],
        FilterSupplier: true,
        component: () => import('../routes/Materiel/Detail'),
      },
      {
        path: '/smdm/materiel/img-import', // 商品图片导入
        models: [() => import('../models/materiel.js')],
        component: () => import('../routes/Materiel/ProductImgImport'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/smdm/materiel-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/materiel-query/list',
        models: [() => import('../models/materielQuery.js')],
        FilterSupplier: true,
        component: () => import('../routes/MaterielQuery'),
      },
      {
        path: '/smdm/materiel-query/detail/:itemId',
        models: [() => import('../models/materielQuery.js')],
        FilterSupplier: true,
        component: () => import('../routes/MaterielQuery/Detail'),
      },
    ],
  },
  {
    path: '/smdm/materiel-application',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/materiel-application/list',
        models: [() => import('../models/materielApplication.js')],
        FilterSupplier: true,
        component: () => import('../routes/MaterielApplication'),
      },
      {
        path: '/smdm/materiel-application/detail/:itemReqHeaderId',
        models: [() => import('../models/materielApplication.js')],
        FilterSupplier: true,
        component: () => import('../routes/MaterielApplication/Detail'),
      },
      {
        path: '/smdm/materiel-application/create',
        models: [() => import('../models/materielApplication.js')],
        FilterSupplier: true,
        component: () => import('../routes/MaterielApplication/Detail'),
      },
    ],
  },
  {
    path: '/smdm/materiel-application/data-import/:code',
    models: [],
    authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
  },
  {
    path: '/pub/smdm/materiel-application/detail/:itemReqHeaderId',
    models: [() => import('../models/materielApplication.js')],
    FilterSupplier: true,
    authorized: true,
    component: () => import('../routes/MaterielApplication/Detail'),
  },
  {
    path: '/pub/smdm/materiel-application/detailPub/:itemReqHeaderId',
    models: [() => import('../models/materielApplicationPub.js')],
    FilterSupplier: true,
    authorized: true,
    component: () => import('../routes/MaterielApplication/DetailPub'),
  },
  {
    path: '/smdm/rate-type-org',
    models: [() => import('../models/rateTypeOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/RateTypeOrg'),
  },
  {
    path: '/smdm/calendar',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/calendar/list',
        models: [() => import('../models/calendarOrg.js')],
        FilterSupplier: true,
        component: () => import('../routes/Calendar/List'),
      },
      {
        path: '/smdm/calendar/detail/:calendarId',
        models: [() => import('../models/calendarOrg.js')],
        FilterSupplier: true,
        component: () => import('../routes/Calendar/Detail'),
      },
    ],
  },
  // 成本中心定义
  {
    path: '/smdm/cost-center-org',
    models: [() => import('../models/costCenter.js')],
    FilterSupplier: true,
    component: () => import('../routes/CostCenter'),
  },
  // 成本中心导入
  {
    path: '/smdm/cost-center-org/data-import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
  },
  // 总科账目
  {
    path: '/smdm/ledger-account-org',
    models: [() => import('../models/ledgerAccount.js')],
    FilterSupplier: true,
    component: () => import('../routes/LedgerAccount'),
  },
  // 总账科目导入
  {
    path: '/smdm/ledger-account-org/data-import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
  },
  {
    path: '/smdm/wbs-element-org',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/wbs-element-org/list',
        models: [() => import('../models/wbs.js')],
        FilterSupplier: true,
        component: () => import('../routes/WbsElement'),
      },
      {
        path: '/smdm/wbs-element-org/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
        models: [],
      },
    ],
  },
  {
    path: '/smdm/bank',
    component: () => import('../routes/Bank'),
    models: [() => import('../models/bank.js')],
  },
  // 地区映射
  {
    path: '/smdm/regional-mapping',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/smdm/regional-mapping/list',
        FilterSupplier: true,
        component: () => import('../routes/Country'),
      },
      {
        path: '/smdm/regional-mapping/detail-new/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RegionalMappingNew'),
      },
      {
        path: '/smdm/regional-mapping/detail-readOnly/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/RegionalMappingNew/readOnly.js'),
      },
      {
        path: '/smdm/regional-mapping/detail/:id',
        models: [() => import('../models/regionalMapping.js')],
        FilterSupplier: true,
        component: () => import('../routes/RegionalMapping'),
      },
      {
        path: '/smdm/regional-mapping/import/:code',
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
        models: [],
      },
    ],
  },
  // 预算科目定义
  {
    path: '/smdm/budget-account',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/BudgetAccount'),
    authorized: true,
  },
  // 预算科目定义导入
  {
    path: '/smdm/budget-account/data-import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
    authorized: true,
  },
  {
    path: '/smdm/category-attribute',
    models: [() => import('../models/categoryAttribute.js')],
    // FilterSupplier: true,
    components: [
      {
        path: '/smdm/category-attribute/list',
        models: [() => import('../models/categoryAttribute.js')],
        component: () => import('../routes/CategoryAttribute'),
      },
      {
        path: '/smdm/category-attribute/detail/:id',
        models: [() => import('../models/categoryAttribute.js')],
        component: () => import('../routes/CategoryAttribute/Detail'),
      },
    ],
  },
  // 物料认证策略模版
  {
    path: '/smdm/material-certification-policy',
    models: [() => import('../models/materialCertificationPolicy.js')],
    components: [
      {
        path: '/smdm/material-certification-policy/list',
        component: () => import('../routes/MaterialCertificationPolicy'),
      },
      {
        path: '/smdm/material-certification-policy/node-detail/:nodeId',
        component: () => import('../routes/MaterialCertificationPolicy/NodeConfig/Detail'),
      },
      {
        path: '/smdm/material-certification-policy/node-read/:nodeId',
        component: () => import('../routes/MaterialCertificationPolicy/NodeConfig/ReadOnly'),
      },
      {
        path: '/smdm/material-certification-policy/node-palicy-detail/:strategyHeaderId',
        component: () => import('../routes/MaterialCertificationPolicy/NodePolicyConfig/Edit'),
      },
      {
        path: '/smdm/material-certification-policy/node-policy-read/:strategyHeaderId',
        component: () => import('../routes/MaterialCertificationPolicy/NodePolicyConfig/ReadOnly'),
      },
    ],
    authorized: true,
  },
  // 待认证物料池
  {
    path: '/smdm/material-certification-pool',
    models: [() => import('../models/materialCertification')],
    components: [
      {
        path: '/smdm/material-certification-pool/list',
        models: [() => import('../models/materialCertification')],
        component: () => import('../routes/MaterialCertificationPool'),
      },
      {
        path: '/smdm/material-certification-pool/create',
        models: [],
        component: () => import('../routes/MaterialCertificationPool/Create'),
      },
      {
        path: '/smdm/material-certification-pool/edit/:itemAuthReqHeaderId',
        models: [],
        component: () => import('../routes/MaterialCertificationPool/Detail/Edit'),
      },
      {
        path: '/smdm/material-certification-pool/prequalification/:itemAuthFeeHeaderId',
        models: [],
        component: () => import('../routes/MaterialFeedback/Detail/ReadOnly'),
      },
      {
        path: '/smdm/material-certification-pool/read/:itemAuthReqHeaderId',
        models: [],
        component: () => import('../routes/MaterialCertificationPool/Detail/ReadOnly'),
      },
    ],
  },
  {
    path: '/pub/smdm/material-certification-pool/read/:itemAuthReqHeaderId',
    models: [],
    authorized: true,
    component: () => import('../routes/MaterialCertificationPool/Detail/ReadOnly'),
  },
  // 物料认证反馈单
  {
    path: '/smdm/material-certification-feedback',
    models: [() => import('../models/materialFeedback')],
    components: [
      {
        path: '/smdm/material-certification-feedback/list',
        models: [() => import('../models/materialFeedback')],
        component: () => import('../routes/MaterialFeedback'),
      },
      {
        path: '/smdm/material-certification-feedback/edit/:itemAuthFeeHeaderId',
        models: [],
        component: () => import('../routes/MaterialFeedback/Detail/Edit'),
      },
      {
        path: '/smdm/material-certification-feedback/read/:itemAuthFeeHeaderId',
        models: [],
        component: () => import('../routes/MaterialFeedback/Detail/ReadOnly'),
      },
    ],
  },
  {
    path: '/pub/smdm/material-certification-feedback/read/:itemAuthFeeHeaderId',
    models: [],
    authorized: true,
    component: () => import('../routes/MaterialFeedback/Detail/ReadOnly'),
  },
  {
    path: '/smdm/draw-info',
    models: [],
    component: () => import('../routes/DrawInfo'),
    authorized: true,
  },
  // 替代方案
  {
    path: '/smdm/substitute-relation',
    components: [
      {
        path: '/smdm/substitute-relation/list',
        component: () => import('../routes/SubstituteRelation'),
      },
      {
        // 替代方案维护 subRelationCurId 当前表
        path: '/smdm/substitute-relation/update/:subRelationCurId',
        component: () => import('../routes/SubstituteRelation/Update'),
      },
      {
        // 替代方案明细 subRelationId 有效表
        path: '/smdm/substitute-relation/Detail/:subRelationId',
        component: () => import('../routes/SubstituteRelation/Detail'),
      },
    ],
  },
  // 差异银行信息
  {
    path: '/smdm/diff-bank-info',
    models: [],
    component: () => import('../routes/DiffDankInfo'),
    authorized: true,
  },
  {
    path: '/smdm/definition-fixed-assets',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/DefinitionFixedAssets'),
  },
];
