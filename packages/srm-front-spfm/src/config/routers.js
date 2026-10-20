module.exports = [
  {
    path: '/spfm/org-info',
    models: [() => import('../models/hpfm/group.js')],
    FilterSupplier: true,
    component: () => import('../routes/hpfm/OrgInfo'),
  },
  {
    path: '/spfm/org-info/group',
    models: [() => import('../models/hpfm/group.js')],
    FilterSupplier: true,
    component: () => import('../routes/hpfm/OrgInfo/Group'),
  },
  {
    path: '/spfm/org-info/company',
    FilterSupplier: true,
    models: [
      () => import('../models/company.js'),
      () => import('../models/enterprise/enterpriseEdit.js'),
      () => import('../models/enterprise/legal.js'),
      () => import('../models/enterprise/business.js'),
      () => import('../models/enterprise/contactPerson.js'),
      () => import('../models/enterprise/address.js'),
      () => import('../models/enterprise/bank.js'),
      () => import('../models/enterprise/financeInfo.js'),
      () => import('../models/enterprise/attachment.js'),
      () => import('../models/enterprise/invoiceInfo.js'),
    ],
    component: () => import('../routes/Company'),
  },
  // 业务组织信息公司-导入
  {
    path: '/spfm/org-info/company/import-component/:code',
    component: () => import('../routes/components/CommentImports'),
    authorized: true,
    models: [],
    FilterSupplier: true,
  },
  {
    path: '/spfm/org-info/purchase-org',
    models: [
      () => import('../models/hpfm/purchaseOrg.js'),
      () => import('../models/assignAgent.js'),
    ],
    FilterSupplier: true,
    component: () => import('../routes/hpfm/OrgInfo/PurchaseOrg'),
  },
  {
    path: '/spfm/org-info/store-room',
    FilterSupplier: true,
    models: [() => import('../models/hpfm/storeRoom.js')],
    component: () => import('../routes/hpfm/OrgInfo/StoreRoom'),
  },
  {
    path: '/spfm/org-info/operation-unit',
    FilterSupplier: true,
    models: [
      () => import('../models/hpfm/operationUnit.js'),
      () => import('../models/assignOrganization.js'),
    ],
    component: () => import('../routes/hpfm/OrgInfo/OperationUnit'),
  },
  {
    path: '/spfm/org-info/inventory-org',
    models: [() => import('../models/hpfm/inventoryOrg.js')],
    FilterSupplier: true,
    component: () => import('../routes/hpfm/OrgInfo/InventoryOrg'),
  },
  {
    path: '/spfm/org-info/inventory-org/comment-import/:code',
    component: () => import('../routes/components/CommentImport'),
    FilterSupplier: true,
    models: [],
  },
  {
    path: '/spfm/org-info/operation-unit/comment-import/:code',
    component: () => import('../routes/components/CommentImport'),
    FilterSupplier: true,
    models: [],
  },
  {
    path: '/spfm/org-info/purchase-org/comment-import/:code',
    component: () => import('../routes/components/CommentImport'),
    FilterSupplier: true,
    models: [],
  },
  {
    path: '/spfm/org-info/store-room/comment-import/:code',
    component: () => import('../routes/components/CommentImport'),
    FilterSupplier: true,
    models: [],
  },
  {
    path: '/spfm/org-info/purchase-agent',
    models: [() => import('../models/hpfm/purchaseAgent.js')],
    FilterSupplier: true,
    component: () => import('../routes/hpfm/OrgInfo/PurchaseAgent'),
  },
  {
    path: '/spfm/org-info/purchase-agent/import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
  },
  {
    path: '/spfm/org-info/library-position',
    models: [() => import('../models/hpfm/libraryPosition.js')],
    FilterSupplier: true,
    component: () => import('../routes/hpfm/OrgInfo/LibraryPosition'),
  },
  {
    path: '/spfm/org-info/library-position/comment-import/:code',
    component: () => import('../routes/components/CommentImport'),
    FilterSupplier: true,
    models: [],
  },
  {
    path: '/spfm/purchase-order',
    models: [() => import('../models/purchaseOrder.js')],
    component: () => import('../routes/PurchaseOrder'),
  },
  {
    path: '/spfm/event',
    models: [],
    components: [
      {
        path: '/spfm/event/list',
        models: [() => import('../models/event.js')],
        component: () => import('../routes/Event'),
      },
      {
        path: '/spfm/event/handle',
        models: [() => import('../models/eventHandle.js')],
        component: () => import('../routes/Event/EventHandle'),
      },
    ],
  },
  {
    path: '/spfm/event-org',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/event-org/list',
        models: [() => import('../models/event.js')],
        component: () => import('../routes/Event'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/event-org/handle',
        models: [() => import('../models/eventHandle.js')],
        component: () => import('../routes/Event/EventHandle'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/spfm/event-message',
    models: [() => import('../models/eventMessage.js')],
    component: () => import('../routes/EventMessage'),
  },
  {
    path: '/spfm/event-message-org',
    models: [() => import('../models/eventMessage.js')],
    component: () => import('../routes/EventMessage'),
    FilterSupplier: true,
  },
  {
    path: '/spfm/event-category',
    models: [() => import('../models/eventCategory.js')],
    component: () => import('../routes/EventCategory'),
  },
  {
    path: '/spfm/event-category-org',
    models: [() => import('../models/eventCategory.js')],
    component: () => import('../routes/EventCategory'),
    FilterSupplier: true,
  },
  {
    path: '/spfm/event-data-type',
    models: [() => import('../models/eventDataType.js')],
    component: () => import('../routes/EventDataType'),
  },
  {
    path: '/spfm/event-data-type-org',
    models: [() => import('../models/eventDataType.js')],
    component: () => import('../routes/EventDataType'),
    FilterSupplier: true,
  },
  {
    path: '/spfm/purchase-transaction',
    models: [() => import('../models/purchaseTransaction.js')],
    component: () => import('../routes/PurchaseTransaction'),
  },
  {
    path: '/spfm/enterprise/edit',
    models: [
      () => import('../models/enterprise/enterpriseEdit.js'),
      () => import('../models/enterprise/legal.js'),
      () => import('../models/enterprise/business.js'),
      () => import('../models/enterprise/contactPerson.js'),
      () => import('../models/enterprise/address.js'),
      () => import('../models/enterprise/bank.js'),
      () => import('../models/enterprise/financeInfo.js'),
      () => import('../models/enterprise/attachment.js'),
    ],
    component: () => import('../routes/Enterprise/EnterpriseEdit'),
  },
  {
    path: '/spfm/enterprise/register',
    models: [
      () => import('../models/enterprise/legal.js'),
      () => import('../models/enterprise/preview.js'),
    ],
    // component: () => import('../routes/Enterprise/Register')
    components: [
      {
        path: '/spfm/enterprise/register',
        models: [
          () => import('../models/enterprise/legal.js'),
          () => import('../models/enterprise/preview.js'),
        ],
        component: () => import('../routes/Enterprise/Register'),
      },
      {
        path: '/spfm/enterprise/register/legal',
        models: [() => import('../models/enterprise/legal.js')],
        component: () => import('../routes/Enterprise/Register/LegalInfo'),
      },
      {
        path: '/spfm/enterprise/register/business',
        models: [() => import('../models/enterprise/business.js')],
        component: () => import('../routes/Enterprise/Register/BusinessInfo'),
      },
      {
        path: '/spfm/enterprise/register/contact',
        models: [() => import('../models/enterprise/contactPerson.js')],
        component: () => import('../routes/Enterprise/Register/ContactPerson'),
      },
      {
        path: '/spfm/enterprise/register/address',
        models: [() => import('../models/enterprise/address.js')],
        component: () => import('../routes/Enterprise/Register/AddressInfo'),
      },
      {
        path: '/spfm/enterprise/register/bank',
        models: [() => import('../models/enterprise/bank.js')],
        component: () => import('../routes/Enterprise/Register/BankInfo'),
      },
      {
        path: '/spfm/enterprise/register/invoice',
        models: [() => import('../models/enterprise/invoiceInfo.js')],
        component: () => import('../routes/Enterprise/Register/InvoiceInfo'),
      },
      {
        path: '/spfm/enterprise/register/finance',
        models: [() => import('../models/enterprise/financeInfo.js')],
        component: () => import('../routes/Enterprise/Register/FinanceInfo'),
      },
      {
        path: '/spfm/enterprise/register/attachment',
        models: [
          () => import('../models/enterprise/attachment.js'),
          () => import('../models/enterprise/legal.js'),
        ],
        component: () => import('../routes/Enterprise/Register/AttachmentInfo'),
      },
      {
        path: '/spfm/enterprise/register/preview',
        models: [
          () => import('../models/enterprise/preview.js'),
          () => import('../models/enterprise/attachment.js'),
          () => import('../models/enterprise/legal.js'),
        ],
        component: () => import('../routes/Enterprise/Register/PreviewInfo'),
      },
      {
        path: '/spfm/enterprise/register/result',
        models: [],
        component: () => import('../routes/Enterprise/Register/ProcessInfo'),
      },
    ],
  },
  // {
  //   path: "/spfm/enterprise/register/legal",
  //   models: [() => import('../models/enterprise/legal.js')],
  //   component: () => import('../routes/Enterprise/Register/LegalInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/business",
  //   models: [() => import('../models/enterprise/business.js')],
  //   component: () => import('../routes/Enterprise/Register/BusinessInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/contact",
  //   models: [() => import('../models/enterprise/contactPerson.js')],
  //   component: () => import('../routes/Enterprise/Register/ContactPerson')
  // },
  // {
  //   path: "/spfm/enterprise/register/address",
  //   models: [() => import('../models/enterprise/address.js')],
  //   component: () => import('../routes/Enterprise/Register/AddressInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/bank",
  //   models: [() => import('../models/enterprise/bank.js')],
  //   component: () => import('../routes/Enterprise/Register/BankInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/invoice",
  //   models: [() => import('../models/enterprise/invoiceInfo.js')],
  //   component: () => import('../routes/Enterprise/Register/InvoiceInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/finance",
  //   models: [() => import('../models/enterprise/financeInfo.js')],
  //   component: () => import('../routes/Enterprise/Register/FinanceInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/attachment",
  //   models: [() => import('../models/enterprise/attachment.js')],
  //   component: () => import('../routes/Enterprise/Register/AttachmentInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/preview",
  //   models: [() => import('../models/enterprise/preview.js')],
  //   component: () => import('../routes/Enterprise/Register/PreviewInfo')
  // },
  // {
  //   path: "/spfm/enterprise/register/result",
  //   models: [],
  //   component: () => import('../routes/Enterprise/Register/ProcessInfo')
  // },
  {
    path: '/spfm/certification-approval',
    models: [],
    components: [
      {
        path: '/spfm/certification-approval/list',
        models: [() => import('../models/enterprise/approval.js')],
        component: () => import('../routes/Enterprise/Approval/List'),
      },
      {
        path: '/spfm/certification-approval/detail/:id',
        models: [() => import('../models/enterprise/approval.js')],
        component: () => import('../routes/Enterprise/Approval/Detail'),
      },
      {
        path: '/spfm/certification-approval/import-component/:code',
        component: () => import('../routes/components/CommentImport'),
        models: [],
      },
    ],
  },
  // 我的合作伙伴 供应商
  {
    path: '/spfm/partner-list',
    models: [],
    FilterSupplier: true,
    components: [
      // 供应商
      {
        path: '/spfm/partner-list/supplier',
        models: [() => import('../models/supplier.js')],
        FilterSupplier: true,
        component: () => import('../routes/PartnerList/Supplier'),
        isFilter: true,
      },
      {
        path: '/spfm/partner-list/supplier/import-component/:code',
        component: () => import('../routes/components/CommentImport'),
        authorized: true,
        FilterSupplier: true,
        models: [],
        isFilter: true,
      },
      {
        path: '/spfm/partner-list/import-erp',
        models: [() => import('../models/importErp.js')],
        FilterSupplier: true,
        component: () => import('../routes/PartnerList/ImportErp'),
        isFilter: true,
      },
      // 批量导入sap
      {
        path: '/spfm/partner-list/sap-import/:code',
        component: () => import('../routes/components/CommentImport'),
        FilterSupplier: true,
        models: [],
        isFilter: true,
      },
      // 批量导入ebs
      {
        path: '/spfm/partner-list/ebs-import/:code',
        component: () => import('../routes/PartnerList/Import/CommentImport'),
        FilterSupplier: true,
        models: [],
        isFilter: true,
      },
      {
        path: '/spfm/partner-list/import-erp-list',
        models: [() => import('../models/importErp.js')],
        FilterSupplier: true,
        component: () => import('../routes/PartnerList/SupplierMessage'),
        isFilter: true,
      },
    ],
  },
  {
    path: '/spfm/company-search-purchaser',
    models: [() => import('../models/companySearchPurchaser.js')],
    FilterSupplier: true,
    component: () => import('../routes/CompanySearch/CompanySearchPurchaser'),
    isFilter: true,
  },
  {
    path: '/spfm/company-search',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/company-search/supplier',
        models: [() => import('../models/companySearchSupplier.js')],
        FilterSupplier: true,
        component: () => import('../routes/CompanySearch/CompanySearchSupplier'),
        isFilter: true,
      },
      // {
      //   path: '/spfm/company-search/embedPage',
      //   models: [],
      //   component: () => import('../routes/CompanySearch/riskEmbedPage'),
      //   isFilter: true,
      // },
      {
        // 供应商导入生成
        path: '/spfm/company-search/supplier/import/:code',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/components/CommentImport'),
      },
      {
        // 个人供应商导入
        path: '/spfm/company-search/personal/import/:code',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/components/CommentImport'),
      },
      {
        // 批量邀请注册
        path: '/spfm/company-search/batchInviteRegistration/import/:code',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/components/CommentImport'),
      },
    ],
  },
  {
    path: '/spfm/invitation',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/invitation/list',
        models: [
          () => import('../models/invitationList.js'),
          () => import('../models/disposeInvite.js'),
        ],
        FilterSupplier: true,
        component: () => import('../routes/InvitationList'),
        isFilter: true,
      },
      {
        path: '/spfm/invitation/list/import-component/:code',
        component: () => import('../routes/components/CommentImport'),
        authorized: true,
        FilterSupplier: true,
        models: [],
      },
    ],
  },
  {
    path: '/spfm/dispose-invite/:inviteId',
    models: [
      () => import('../models/disposeInvite.js'),
      () => import('../models/hmsg/userMessage.js'),
      () => import('../models/invitationQuestionnaireOperation.js'),
    ],
    component: () => import('../routes/Invitation'),
    FilterSupplier: true,
    authorized: true,
    title: 'hzero.common.title.disposeInvite',
    isFilter: true,
  },
  {
    path: '/spfm/business-apv-method',
    models: [() => import('../models/businessApvMethod.js')],
    FilterSupplier: true,
    component: () => import('../routes/BusinessApvMethod'),
  },
  {
    path: '/spfm/partnership',
    models: [() => import('../models/partnership.js')],
    component: () => import('../routes/Partnership'),
  },
  {
    path: '/spfm/investigation-template-define',
    models: [],
    components: [
      {
        path: '/spfm/investigation-template-define/list',
        models: [() => import('../models/investigationTemDefineSite.js')],
        component: () => import('../routes/Investigation/Template/List'),
      },
      {
        path: '/spfm/investigation-template-define/detail/:investigateTemplateId',
        models: [() => import('../models/investigationDefinitionSite.js')],
        component: () => import('../routes/Investigation/Template/Detail'),
      },
    ],
  },
  // 配置中心
  {
    path: '/spfm/config-server',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/config-server/main',
        models: [
          () => import('../models/configServer.js'),
          () => import('../models/deliveryCompanySupplier.js'),
          () => import('../models/sodr/invoiceUpdateRule.js'),
          () => import('../models/sodr/toleranceRule.js'),
          () => import('../models/sodr/onlyInvoiceRule.js'),
          () => import('../models/sodr/billUpdateRule.js'),
          () => import('../models/sinv/acceptanceSheet.js'),
        ],
        FilterSupplier: true,
        component: () => import('../routes/ConfigServer'),
      },
      {
        path: '/spfm/config-server/life-cycle-dim-config',
        models: [() => import('../models/dimConfig.js')],
        FilterSupplier: true,
        component: () => import('../routes/DimConfig'),
      },
      {
        path: '/spfm/config-server/supplier-life-config',
        models: [() => import('../models/sslm/supplierLifeConfig.js')],
        FilterSupplier: true,
        component: () => import('../routes/sslm/SupplierLife/Config'),
      },
    ],
  },
  {
    path: '/spfm/message-receiver-setting',
    models: [() => import('../models/messageSendConfig.js')],
    component: () => import('../routes/MessageSendConfig'),
  },
  {
    path: '/spfm/supplier-kpi-indicator',
    models: [() => import('../models/supplierKpiIndicator.js')],
    component: () => import('../routes/SupplierKpiIndicator'),
  },
  // hptl迁移过来的门户管理
  {
    path: '/spfm/notices',
    models: [],
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/notices/list',
        component: () => import('../routes/Notice'),
        FilterSupplier: true,
        models: [() => import('../models/notice.js')],
      },
      {
        path: '/spfm/notices/detail/:noticeId',
        component: () => import('../routes/Notice/NoticeDetail'),
        FilterSupplier: true,
        models: [() => import('../models/notice.js')],
      },
      {
        path: '/spfm/notices/preview/:noticeId/:actionId',
        component: () => import('../routes/Notice/NoticePreview'),
        FilterSupplier: true,
        models: [() => import('../models/notice.js')],
      },
      // 审批表单内嵌的公告展示
      {
        path: '/spfm/notices/includeForm/:noticeId',
        component: () => import('../routes/Notice/NoticeIncludeForm'),
        FilterSupplier: true,
        models: [() => import('../models/notice.js')],
      },
    ],
  },
  {
    path: '/spfm/noticeSite',
    models: [],
    authorized: true,
    components: [
      {
        path: '/spfm/noticeSite/list',
        component: () => import('../routes/NoticeSite'),
        models: [() => import('../models/noticeSite.js')],
      },
      {
        path: '/spfm/noticeSite/detail/:noticeId',
        component: () => import('../routes/NoticeSite/NoticeDetail'),
        models: [() => import('../models/noticeSite.js')],
      },
      {
        path: '/spfm/noticeSite/preview/:noticeId/:actionId',
        component: () => import('../routes/NoticeSite/NoticePreview'),
        models: [() => import('../models/noticeSite.js')],
      },
      {
        path: '/spfm/noticeSite/import-component/:code',
        component: () => import('../routes/components/CommentImport'),
      },
    ],
  },
  {
    path: '/spfm/notices/previewOnly/:noticeId',
    component: () => import('../routes/Notice/NoticePreviewOnly'),
    authorized: true,
    models: [() => import('../models/notice.js')],
    action: 'hzero.common.view.title.noticePreviewOnly',
    title: 'hzero.common.view.title.noticePreviewOnly',
  },
  {
    path: '/spfm/portal-assign',
    models: [],
    authorized: true,
    components: [
      {
        path: '/spfm/portal-assign/list',
        component: () => import('../routes/PortalAssign'),
        models: [() => import('../models/portalAssign.js'), () => import('../models/templates.js')],
      },
      {
        path: '/spfm/portal-assign/template/edit/:configId',
        component: () => import('../routes/PortalAssign/TemplateEdit'),
        models: [
          () => import('../models/portalAssign.js'),
          () => import('../models/templatesConfig.js'),
        ],
      },
    ],
  },
  {
    path: '/spfm/portal-manage',
    models: [],
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/portal-manage/list',
        component: () => import('../routes/PortalManage'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/portal-manage/edit/:layoutId',
        component: () => import('../routes/PortalConfig'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/portal-card/list',
        component: () => import('../routes/PortalCard'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/spfm/portal-layout',
    models: [],
    authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/portal-layout/list',
        component: () => import('../routes/PortalLayout'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/portal-layout/create',
        component: () => import('../routes/PortalLayout/Create'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/portal-layout/edit/:layoutId',
        component: () => import('../routes/PortalConfig'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/pub/home',
    component: () => import('../routes/PortalConfig'),
    authorized: true,
  },
  {
    path: '/pub/home/:layoutId',
    component: () => import('../routes/PortalConfig'),
    authorized: true,
  },
  {
    path: '/spfm/templates-config',
    authorized: true,
    FilterSupplier: true,
    models: [],
    components: [
      // {
      //   path: '/spfm/templates-config/list',
      //   component: () => import('../routes/TemplatesConfig'),
      //   models: [
      //     () => import('../models/templatesConfig.js'),
      //     () => import('../models/hpfm/group.js'),
      //   ],
      //   FilterSupplier: true,
      // },
      {
        path: '/spfm/templates-config/edit',
        component: () => import('../routes/TemplatesConfig/TemplateEdit'),
        models: [
          () => import('../models/portalAssign.js'),
          () => import('../models/templatesConfig.js'),
        ],
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/workplace',
    priority: 1,
    component: () => import('../routes/Dashboard/WorkPlace'),
    models: [() => import('../models/hpfm/workplace.js')],
  },
  {
    path: '/spfm/platform-credit-config',
    models: [() => import('../models/creditConfig.js')],
    component: () => import('../routes/CreditConfig'),
    authorized: true,
  },
  // 内嵌应用商城
  {
    path: '/spfm/amkt-appstore',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 内嵌价格中心
  {
    path: '/spfm/price-center',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 内嵌供应商找关系页面
  {
    path: '/spfm/supplier-relationship',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 内嵌供应商关系挖掘页面
  {
    path: '/spfm/supplier-relation-mining',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },

  // 内嵌供应商找关系页面
  {
    path: '/public/spfm/outlink-supplier-relationship',
    authorized: true,
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
  },
  // 内嵌供应商关系挖掘页面
  {
    path: '/public/spfm/outlink-supplier-relation-mining',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },

  // 内嵌监控企业页面
  {
    path: '/spfm/monitor-business',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 内嵌企业等级页面
  {
    path: '/spfm/business-level',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 风险扫描页面
  {
    path: '/spfm/business-risk-scan',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 风险扫描报告下载页面
  {
    path: '/spfm/risk-scan-report-download',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // 内嵌服务开通记录
  {
    path: '/spfm/amkt-servelog',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌我的套餐计费
  {
    path: '/spfm/report-form/my-package-billing',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌租户模块管理
  {
    path: '/spfm/amkt-module-manage',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌租户级服务账号配置
  {
    path: '/spfm/amkt-account-configuration',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌产品线
  {
    path: '/spfm/product-control',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌客户端管理
  {
    path: '/spfm/client-management',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌服务定义
  {
    path: '/spfm/service-definition',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌合作伙伴管理
  // {
  //   path: '/spfm/partner-management',
  //   component: () => import('../routes/Amkt/PartnerManagement'),
  //   models: [() => import('../models/amkt/iframeEmbedded.js')],
  //   authorized: true,
  // },
  // 内嵌应用管理
  {
    path: '/spfm/apply-management',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌认证类型定义
  {
    path: '/spfm/approve-type',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌合作伙伴账户组
  {
    path: '/spfm/partner-account',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌服务申请审批
  {
    path: '/spfm/service-approve',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌动态监控
  {
    path: '/spfm/dynamic-monitor',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌新闻舆情
  {
    path: '/spfm/news-public-opinion',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌风控日志
  {
    path: '/spfm/credit-log',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌监控概览
  {
    path: '/spfm/supplier-risk-monitor-org',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌监控企业管理 MonitorOrgManagement
  {
    path: '/spfm/monitor-org-management',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    authorized: true,
  },
  // 内嵌监控事件monitor-stuff
  {
    path: '/spfm/monitor-stuff',
    component: () => import('../routes/Amkt/IframeEmbedded'),
    models: [() => import('../models/amkt/iframeEmbedded.js')],
    FilterSupplier: true,
  },
  // CA认证
  {
    path: '/spfm/certificate-authority',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/certificate-authority/list',
        models: [() => import('../models/certificateAuthority.js')],
        FilterSupplier: true,
        component: () => import('../routes/ElectronicSignature/CertificateAuthority'),
      },
      {
        path: '/spfm/certificate-authority/detail',
        models: [() => import('../models/certificateAuthority.js')],
        FilterSupplier: true,
        component: () => import('../routes/ElectronicSignature/CertificateAuthority/Detail'),
      },
    ],
  },
  // 印章管理
  {
    path: '/spfm/seal-mange',
    models: [],
    FilterSupplier: true,
    // authorized: true,
    components: [
      {
        path: '/spfm/seal-mange/list',
        models: [() => import('../models/sealMange.js')],
        FilterSupplier: true,
        component: () => import('../routes/ElectronicSignature/SealManage'),
        // authorized: true,
      },
    ],
  },
  // 业务通知单发布
  {
    path: '/spfm/business-order-publish',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/business-order-publish/list',
        models: [() => import('../models/businessOrderPublish.js')],
        FilterSupplier: true,
        component: () => import('../routes/BusinessOrderPublish'),
      },
      {
        path: '/spfm/business-order-publish/detail/:notificationId',
        models: [() => import('../models/businessOrderPublish.js')],
        FilterSupplier: true,
        component: () => import('../routes/BusinessOrderPublish/Detail'),
      },
      {
        path: '/spfm/business-order-publish/detail-readOnly/:notificationId',
        models: [() => import('../models/businessOrderPublish.js')],
        FilterSupplier: true,
        component: () => import('../routes/BusinessOrderPublish/Detail'),
      },
      {
        path: '/spfm/business-order-publish/import-component/:code',
        component: () => import('../routes/components/CommentImport'),
        FilterSupplier: true,
        models: [],
      },
    ],
  },
  // 业务通知单发布-工作流
  {
    path: '/pub/spfm/business-order-publish/detail/:notificationId',
    models: [() => import('../models/businessOrderPublish.js')],
    component: () => import('../routes/BusinessOrderPublish/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/spfm/notice-sign',
    models: [],
    components: [
      {
        path: '/spfm/notice-sign/list',
        models: [() => import('../models/noticeSign.js')],
        component: () => import('../routes/NoticeSigning'),
      },
      {
        path: '/spfm/notice-sign/detail/:id',
        models: [() => import('../models/noticeSign.js')],
        component: () => import('../routes/NoticeSigning/Detail'),
      },
    ],
  },
  // 免密登陆
  {
    path: '/spfm/oauth-config',
    models: [() => import('../models/oauthConfig.js')],
    component: () => import('../routes/OauthConfig/Console'),
  },
  // 资料管理
  {
    path: '/spfm/data-management',
    models: [() => import('../models/dataManagement.js')],
    component: () => import('../routes/DataManagement'),
    FilterSupplier: true,
    authorized: true,
  },
  // 资料下载(采)
  {
    path: '/spfm/data-upload',
    models: [() => import('../models/dataManagement.js')],
    component: () => import('../routes/DataManagement/onlyView/index'),
    FilterSupplier: true,
    // authorized: true,
  },
  // 资料下载(供)
  {
    path: '/spfm/data-upload-supplier',
    models: [() => import('../models/dataManagement.js')],
    component: () => import('../routes/DataManagement/onlyView/index'),
    // FilterSupplier: true,
    // authorized: true,
  },
  // 公司级流程监控
  {
    path: '/hwfp/monitor-srm',
    models: [() => import('../models/monitor.js')],
    FilterSupplier: true,
    priority: 100,
    components: [
      {
        path: '/hwfp/monitor-srm/list',
        models: [() => import('../models/monitor.js')],
        FilterSupplier: true,
        priority: 100,
        component: () => import('../routes/Monitor/List'),
      },
      {
        path: '/hwfp/monitor-srm/detail/:id',
        models: [
          () => import('../models/monitor.js'),
          () => import('srm-front-swfl/lib/models/monitor.js'),
        ],
        authorized: true,
        FilterSupplier: true,
        priority: 100,
        component: () => import('../routes/Monitor/Detail'),
      },
    ],
  },
  // 租户注册企业审批
  {
    path: '/spfm/certification-tenant-approval',
    models: [],
    // authorized: true,
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/certification-tenant-approval/list',
        models: [() => import('../models/enterprise/approval.js')],
        component: () => import('../routes/Enterprise/TenantApproval/List'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/certification-tenant-approval/detail/:id',
        models: [() => import('../models/enterprise/approval.js')],
        component: () => import('../routes/Enterprise/TenantApproval/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/certification-tenant-approval/import-component/:code',
        component: () => import('../routes/components/CommentImport'),
        FilterSupplier: true,
        models: [],
      },
    ],
  },
  // 业务规则定义
  {
    path: '/spfm/rules-definition',
    models: [],
    FilterSupplier: true,
    // component: () => import('../routes/RulesDefinition/site/index'),
    component: () => import('../routes/RulesDefinitionNew'),
  },
  // 业务规则定义元数据
  {
    path: '/spfm/rules-definition-meta',
    models: [],
    // FilterSupplier: true,
    component: () => import('../routes/RulesDefinitionMeta'),
  },
  // 配置表定义
  {
    path: '/spfm/rel-table-definition',
    models: [],
    component: () => import('../routes/RelTableDefinition'),
  },
  // 配置表定义 - 租户级
  {
    path: '/spfm/rel-table-definition-org',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/RelTableDefinitionOrg'),
  },
  // 配置表
  {
    path: '/spfm/rel-table-access',
    models: [],
    component: () => import('../routes/RelTableAccess'),
  },
  // 配置表租户级
  {
    path: '/spfm/org-rel-table-access',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/RelTableAccess'),
  },
  // 业务规则分类
  {
    path: '/spfm/rule-definition-category',
    models: [],
    component: () => import('../routes/RulesDefinitionCategory'),
    FilterSupplier: true,
  },
  // 结构定义
  {
    path: '/spfm/entity-define',
    models: [],
    component: () => import('../routes/EntityDefine'),
  },
  // 脚本查询
  {
    // FilterSupplier: true,
    authorized: true,
    models: [],
    path: '/spfm/adaptor/console',
    // FilterSupplier: true,
    component: () => import('../routes/AdaptorConsole'),
  },
  // 适配器
  {
    path: '/spfm/adaptor-task',
    models: [],
    components: [
      {
        path: '/spfm/adaptor-task/list',
        component: () => import('../routes/AdaptorTask/indexPre'),
      },
      {
        path: '/spfm/adaptor-task/detail',
        component: () => import('../routes/AdaptorTask/Detail'),
      },
    ],
  },
  // 单据转交定义
  {
    path: '/spfm/doc-transfer-definition',
    models: [],
    components: [
      {
        path: '/spfm/doc-transfer-definition/list',
        component: () => import('../routes/DocTransferDefin'),
      },
    ],
  },
  {
    path: '/spfm/doc-transfer',
    models: [],
    FilterSupplier: true,
    // authorized: true,
    components: [
      {
        path: '/spfm/doc-transfer/list',
        component: () => import('../routes/DocTransfer'),
        // authorized: true,
        FilterSupplier: true,
      },
      {
        path: '/spfm/doc-transfer/transfer-summary',
        component: () => import('../routes/DocTransfer/TransferSummary'),
        // authorized: true,
        FilterSupplier: true,
      },
      {
        path: '/spfm/doc-transfer/auto-transfer',
        component: () => import('../routes/DocTransfer/AutoTransfer'),
        FilterSupplier: true,
      },
    ],
  },
  // 业务规则定义标签
  {
    path: '/spfm/cnf-label',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/CnfLabel'),
  },
  // 字段映射模板定义
  {
    path: '/spfm/field-mapping-defination',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/field-mapping-defination/list',
        component: () => import('../routes/FieldMappingDefination/List'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/field-mapping-defination/detail/:id',
        component: () => import('../routes/FieldMappingDefination/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 客服配置表
  {
    path: '/spfm/customer-service-configuration',
    models: [() => import('../models/customerConfiguration')],
    authorized: true,
    component: () => import('../routes/CustomerConfiguration'),
  },
  // 采购员注册界面
  // {
  //   path: '/public/gjsc/buyer-registration-interface',
  //   models: [],
  //   authorized: true,
  //   component: () => import('../routes/BuyerReginstrationInt'),
  // },
  // 新宝-现场取号
  {
    path: '/public/donlim/onSite-number',
    models: [],
    authorized: true,
    component: () => import('../routes/OnsiteNumber'),
  },
  // 新宝-排号信息
  {
    path: '/public/donlim/rank-information',
    models: [],
    authorized: true,
    component: () => import('../routes/RankInformation'),
  },
  // 门户-首页
  {
    path: '/public/home',
    component: () => import('../routes/PortalConfig'),
    authorized: true,
  },
  // 忘记密码
  {
    path: '/public/forgetPassword',
    component: () => import('../routes/ForgetPassword'),
    authorized: true,
  },
  // 供应商注册
  {
    path: '/public/supplierRegistration',
    component: () => import('../routes/SupplierRegistration'),
    authorized: true,
  },
  // 二次认证
  {
    path: '/public/user-certification',
    models: [],
    authorized: true,
    component: () => import('../routes/UserCertification'),
  },
  // 修改密码
  {
    path: '/public/update-password',
    models: [],
    authorized: true,
    component: () => import('../routes/UserCertification'),
  },
  // 收银台
  {
    path: '/pub/hpay/checkout-counter',
    models: [],
    authorized: true,
    component: () => import('../routes/CheckoutCounter'),
  },
  // 平台邮件接收用户定义
  {
    path: '/spfm/email-receive-user',
    models: [() => import('../models/emailReceiveUser.js')],
    // authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/EmailReceiveUser'),
  },
  // 注册企业查询
  {
    path: '/spfm/registered-enterprise',
    models: [() => import('../models/registerEnterprise.js')],
    authorized: true,
    component: () => import('../routes/RegisterEnterprise'),
  },
  // SRM授权协议
  {
    path: '/pub/spfm/srm-authorize-HJL',
    models: [],
    authorized: true,
    component: () => import('../routes/SRMAuthorizeHJL'),
  },
  // 智能客服
  {
    path: '/pub/spfm/smart-customer-service',
    models: [],
    authorized: true,
    component: () => import('../routes/SmartCustomerService'),
  },
  // 企业找回
  {
    path: '/spfm/enterprise-recovery',
    models: [],
    components: [
      {
        path: '/spfm/enterprise-recovery/list',
        component: () => import('../routes/EnterpriseRecovery'),
      },
      {
        path: '/spfm/enterprise-recovery/detail',
        component: () => import('../routes/EnterpriseRecovery/Detail'),
      },
    ],
  },
  {
    path: '/manage-page1',
    key: '/manage-page1',
    title: '配置界面1',
    component: () => import('../routes/ManagePage/Page1'),
    models: [],
    authorized: true,
  },
  {
    path: '/manage-page2',
    key: '/manage-page2',
    title: '配置界面1',
    component: () => import('../routes/ManagePage/Page2'),
    models: [],
    authorized: true,
  },
  {
    path: '/spfm/edi-authorization',
    // title: 'EDI供应商接口授权配置',
    component: () => import('../routes/EDIAuthorization'),
    models: [],
    // authorized: true,
  },
  // 租户注册企业审批-工作流
  {
    path: '/pub/spfm/certification-tenant-approval/detail/:id',
    models: [() => import('../models/enterprise/approval.js')],
    component: () => import('../routes/Enterprise/TenantApproval/Detail'),
    authorized: true,
  },
  // 平台配置
  {
    path: '/spfm/label-management',
    models: [],
    component: () => import('../routes/LabelConfig'),
  },
  // 业务规则定义 - new
  // {
  //   path: '/spfm/rules-definition-new',
  //   models: [],
  //   FilterSupplier: true,
  //   authorized: true,
  //   component: () => import('../routes/RulesDefinitionNew'),
  // },
  // 函数库
  {
    path: '/spfm/function-library',
    models: [],
    components: [
      {
        path: '/spfm/function-library/list',
        component: () => import('../routes/FunctionLibrary'),
      },
    ],
  },

  // 广域寻源
  {
    path: '/spfm/wide-area-sourcing',
    models: [() => import('../models/wideAreaSource')],
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/wide-area-sourcing/list',
        models: [() => import('../models/wideAreaSource')],
        component: () => import('../routes/WideAreaSourcing'),
        FilterSupplier: true,
      },
      {
        path: '/spfm/wide-area-sourcing/detail/:taxNo/:corpName/:goodsName',
        models: [() => import('../models/wideAreaSource')],
        component: () => import('../routes/WideAreaSourcing/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 节点定义
  {
    path: '/spfm/setting/node-definition',
    // FilterSupplier: true,
    components: [
      {
        path: '/spfm/setting/node-definition/list',
        // FilterSupplier: true,
        component: () => import('../routes/DocFlowDefinition'),
      },
      {
        path: '/spfm/setting/node-definition/edit/:nodeId',
        // FilterSupplier: true,
        component: () => import('../routes/DocFlowDefinitionCoding'),
      },
      {
        path: '/spfm/setting/node-definition/table/:nodeId',
        // FilterSupplier: true,
        component: () => import('../routes/DataProcessTable'),
      },
    ],
  },
  // 节点定义 -租户级
  {
    path: '/spfm/setting/node-definition-org',
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/setting/node-definition-org/list',
        FilterSupplier: true,
        component: () => import('../routes/DocFlowDefinition'),
      },
      {
        path: '/spfm/setting/node-definition-org/edit/:nodeId',
        FilterSupplier: true,
        // authorized: true,
        component: () => import('../routes/DocFlowDefinitionCoding'),
      },
    ],
  },
  // 单据流权限分配 -租户级
  {
    path: '/spfm/documents/flow-permission-org',
    models: [],
    // authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/DocFlowPermission'),
  },
  // 表元数据界面
  {
    models: [],
    path: '/spfm/setting/field_config',
    // FilterSupplier: true,
    component: () => import('../routes/DataProcessField'),
    priority: 1,
  },
  {
    path: '/spfm/adaptor-task/list-org',
    models: [],
    // authorized: true,
    FilterSupplier: true,
    component: () => import('../routes/AdaptorTenant'),
  },
  // 适配器监控
  {
    path: '/spfm/adaptor/monitor',
    models: [],
    // authorized: true,
    // FilterSupplier: true,
    component: () => import('../routes/AdaptorMonitor'),
  },
  {
    path: '/spfm/marmot-script/console-org',
    models: [],
    // authorized: true,
    // FilterSupplier: true,
    component: () => import('../routes/AdaptorConsole'),
  },
  {
    path: '/spfm/marmot/Toolbox',
    models: [],
    // authorized: true,
    // FilterSupplier: true,
    component: () => import('../routes/MarmotToolbox'),
  },
  {
    path: '/hpfm/sys-tools-two',
    models: [],
    // authorized: true,
    // FilterSupplier: true,
    component: () => import('../routes/SysToolsTwo'),
    FilterSupplier: true,
    priority: 100,
  },
  {
    models: [],
    path: '/spfm/setting/field_config-org',
    // FilterSupplier: true,
    // authorized: true,
    component: () => import('../routes/DataProcessField'),
  },
  {
    models: [],
    path: '/spfm/setting/node-definition-hiding',
    // FilterSupplier: true,
    // authorized: true,
    component: () => import('../routes/DocFlowDefinitionHiding'),
  },
  // 简化供应商注册
  {
    path: '/spfm/simplified-register',
    models: [],
    components: [
      {
        path: '/spfm/simplified-register/list',
        models: [],
        component: () => import('../routes/SimplifiedRegister'),
      },
      {
        path: '/spfm/simplified-register/main-info',
        models: [],
        component: () => import('../routes/SimplifiedRegister/EditPage'),
      },
      {
        path: '/spfm/simplified-register/result',
        models: [],
        component: () => import('../routes/SimplifiedRegister/ProcessInfo'),
      },
    ],
  },

  // 供应商缴费记录
  {
    path: '/spfm/supplier-payment-record',
    models: [() => import('../models/supplierInvoicing')],
    component: () => import('../routes/SupplierWorkplace/SupplierInvoicing'),
  },
  // 采购方缴费记录
  {
    path: '/spfm/buyer-payment-record',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/SupplierWorkplace/SupplierBuyerInvoicing'),
  },
  {
    path: '/spfm/supplier-payment-card',
    authorized: true,
    models: [],
    component: () => import('../routes/SupplierWorkplace/BillRenewal'),
  },
  {
    path: '/spfm/marmot-workbench',
    models: [() => import('../models/oauthConfig.js')],
    component: () => import('../routes/MarmotWorkbench'),
  },
  // Marmot帮助手册
  {
    path: '/pub/marmot-help-manual',
    models: [],
    authorized: true,
    component: () => import('../routes/MarmotHelpManual'),
  },
  // 消息队列日志查询
  {
    path: '/spfm/message-queue-log',
    component: () => import('../routes/MessageQueueLog'),
  },
  {
    path: '/public/spfm/portal-card-attachment',
    component: () => import('../routes/PortalCardList/Attachment'),
    authorized: true,
  },
  // 邮箱单点登录
  {
    path: '/public/mail/single-sign-on',
    component: () => import('../routes/MailSingleSignOn'),
    authorized: true,
  },
  {
    path: '/public/page/expired',
    component: () => import('../routes/PageExpired'),
    authorized: true,
  },
  {
    path: '/spfm/rel-table/:code',
    component: () => import('../routes/RelTableDisplay'),
    FilterSupplier: true,
  },
  {
    path: '/public/portal/resource_center',
    component: () => import('../routes/PortalSubPage/ResourceCenter'),
    authorized: true,
  },
  // 双杰电气-门户首页添加常见问题
  {
    path: '/public/portal/common_problem/list',
    component: () => import('../routes/PortalSubPage/scux/CommonProblem'),
    authorized: true,
  },
  {
    path: '/public/portal/common_problem/detail/:id',
    component: () => import('../routes/PortalSubPage/scux/CommonProblem/Detail'),
    authorized: true,
  },
  {
    path: '/public/login-error-for-single',
    component: () => import('../routes/PortalSubPage/SingleLoginError'),
    authorized: true,
  },
  {
    path: '/spfm/rule-import-setting',
    component: () => import('../routes/RulesImportSetting'),
    authorized: true,
  },
  // 单据流-跳转详情
  {
    authorized: true,
    path: '/spfm/doc-link',
    component: () => import('../routes/DocFlowLinkDatail'),
  },

  // 电子签章工作台 - 无权限
  {
    path: '/public/spfm/signature-no-permission',
    component: () => import('../routes/RedirectPage'),
    authorized: true,
  },

  // 电子签章工作台 - 采购方
  {
    path: '/spfm/signature-workplace',
    component: () => import('../routes/BuyerElectronicSign'),
    FilterSupplier: true,
    models: [
      () => import('../models/certificateAuthorityBuyer.js'),
      () => import('../models/sealMangeSdat.js'),
    ],
  },

  // 电子签章工作台 - 供应商
  {
    path: '/spfm/sup-sign',
    models: [
      () => import('../models/certificateAuthoritySdat.js'),
      () => import('../models/sealMangeSdat.js'),
    ],
    components: [
      {
        path: '/spfm/sup-sign/list',
        models: [],
        // authorized: true,
        component: () => import('../routes/SupplierElectronicSign'),
      },

      // 新链路未认证进入步骤页
      {
        path: '/spfm/sup-sign/unauth',
        models: [],
        component: () => import('../routes/SupplierElectronicSign/UnAuthorized'),
      },

      // 新链路详情 - 已认证
      {
        path: '/spfm/sup-sign/detail',
        models: [],
        component: () => import('../routes/SupplierElectronicSign/Detail'),
      },

      // 易签宝详情 - 未认证完成
      {
        path: '/spfm/sup-sign/old-dtl',
        models: [() => import('../models/certificateAuthoritySdat.js')],
        // FilterSupplier: true,
        component: () => import('../routes/SupplierElectronicSign/OldDetail'),
      },

      // 契约锁、法大大详情 - 未认证完成
      {
        path: '/spfm/sup-sign/simple-dtl',
        models: [],
        component: () => import('../routes/SupplierElectronicSign/SimpleDetail'),
      },
      // 契约锁 境外企业
      {
        path: '/spfm/sup-sign/outer-simple-dtl',
        models: [],
        component: () => import('../routes/SupplierElectronicSign/OuterStepPanel'),
      },
    ],
  },
  // 招标寻源公告
  {
    path: '/public/bid-source-notice',
    component: () => import('../routes/BidSource'),
    authorized: true,
  },

  // 中标公告
  {
    path: '/public/win-bid-notice',
    component: () => import('../routes/WinNotice'),
    authorized: true,
  },
  // 供应商资质报表
  {
    path: '/pub/spfm/supplier-qualification-report/attachment',
    authorized: true,
    component: () => import('../routes/sdrp/SupplierQualificationReport'),
  },
  // 海量报表编辑
  {
    path: '/pub/spfm/hl/report/edit/:params',
    authorized: true,
    component: () => import('../routes/sdrp/scux/HL-ReportEdit'),
  },
  {
    path: '/spfm/organizational-information-change/list',
    component: () => import('../routes/ssrc/OrgInfoChange'),
  },

  // 缴费弹窗页面
  {
    path: '/spfm/supplier-common-payment',
    authorized: true,
    models: [],
    component: () => import('../routes/SupplierWorkplace/BillRenewalCommon'),
  },
  // 数字员工管理
  {
    path: '/spfm/digital-employee',
    authorized: true,
    models: [],
    component: () => import('../routes/DigitalEmployee'),
  },
  // Agent 按钮列表
  {
    path: '/spfm/agent-button-list',
    authorized: true,
    models: [],
    component: () => import('../routes/AgentButtonList'),
  },
  // AI助手权限管理
  {
    path: '/spfm/ai-assistant-permissions',
    authorized: true,
    models: [],
    component: () => import('../routes/AiAssistantPermission'),
  },
  {
    path: '/spfm/digital-detail/:digitalEmployeeInfoId',
    authorized: true,
    models: [],
    component: () => import('../routes/DigitalEmployeeDetail'),
  },
  // 智能采购助手工作台
  {
    path: '/spfm/ai-assistant-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/spfm/ai-assistant-workbench/list',
        FilterSupplier: true,
        component: () => import('../routes/AiAssistantWorkbench'),
      },
      {
        path: '/spfm/ai-assistant-workbench/detail/:digitalEmployeeInfoId',
        FilterSupplier: true,
        component: () => import('../routes/AiAssistantWorkbench/Detail'),
      },
    ],
  },
];
