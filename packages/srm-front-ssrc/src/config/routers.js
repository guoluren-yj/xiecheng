module.exports = [
  /**
   * 采购方-寻源模板-询价大厅-线下询价-寻源结果导入
   */

  // 寻源模板定义
  {
    path: '/ssrc/source-template',
    models: [],
    FilterSupplier: true,
    // 寻源模板定义列表
    components: [
      {
        path: '/ssrc/source-template/list',
        models: [() => import('../models/sourceTemplate.js')],
        component: () => import('../routes/ssrc/SourceTemplate'),
        FilterSupplier: true,
      },
      // 寻源模板创建
      {
        path: '/ssrc/source-template/create',
        models: [() => import('../models/sourceTemplate.js')],
        component: () => import('../routes/ssrc/SourceTemplate/Detail'),
        FilterSupplier: true,
      },
      // 寻源模板维护
      {
        path: '/ssrc/source-template/update/:templateId',
        models: [() => import('../models/sourceTemplate.js')],
        component: () => import('../routes/ssrc/SourceTemplate/Detail'),
        FilterSupplier: true,
      },
      // 寻源模板维护-rf
      {
        path: '/ssrc/source-template/rf-create',
        models: [() => import('../models/sourceTemplate.js')],
        component: () => import('../routes/ssrc/SourceTemplate/RFDetail'),
        FilterSupplier: true,
      },
      // 寻源模板维护-rf
      {
        path: '/ssrc/source-template/rf-update/:templateId',
        models: [() => import('../models/sourceTemplate.js')],
        component: () => import('../routes/ssrc/SourceTemplate/RFDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 寻源模板工作台
  {
    path: '/ssrc/source-template-workbench',
    models: [],
    FilterSupplier: true,
    authorized: true,
    components: [
      {
        path: '/ssrc/source-template-workbench/list',
        models: [],
        component: () => import('../routes/ssrc/SourceTemplateWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/source-template-workbench/update/:type/:templateId',
        models: [],
        component: () => import('../routes/ssrc/SourceTemplateWorkbench/Update/index'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/source-template-workbench/details/:templateId/detail',
        models: [],
        component: () => import('../routes/ssrc/SourceTemplateWorkbench/Detail/index'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/source-template-workbench/details/:templateId/history',
        models: [],
        component: () => import('../routes/ssrc/SourceTemplateWorkbench/Detail/index'),
        FilterSupplier: true,
      },
    ],
  },
  // 询价大厅
  {
    path: '/ssrc/inquiry-hall',
    models: [],
    FilterSupplier: true,
    components: [
      // 询价大厅列表
      {
        path: '/ssrc/inquiry-hall/list',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall'),
        FilterSupplier: true,
      },
      // 寻源过程控制
      {
        path: '/ssrc/inquiry-hall/rfx-detail-controller/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
      },
      // 询价监控台
      {
        path: '/ssrc/inquiry-hall/quotation-monitor/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallMonitor.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Monitor/Monitor.js'),
        FilterSupplier: true,
      },
      // 申请转询价
      {
        path: '/ssrc/inquiry-hall/apply-to-inquiry',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ApplyToInquiry'),
        FilterSupplier: true,
      },
      // 创建询价单
      {
        path: '/ssrc/inquiry-hall/rfx-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Create'),
        FilterSupplier: true,
      },
      // 询价单维护
      {
        path: '/ssrc/inquiry-hall/rfx-update/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Update'),
        FilterSupplier: true,
      },
      // 询价单明细-new
      // {
      //   path: '/ssrc/inquiry-hall/rfx-detail-new/:rfxId',
      //   models: [
      //     () => import('../models/inquiryHall.js'),
      //     () => import('../models/importExcel.js'),
      //     () => import('../models/bidHall.js'),
      //     () => import('../models/quotationDetail.js'),
      //     () => import('../models/commonModel.js'),
      //   ],
      //   component: () => import('../routes/ssrc/InquiryHallNew/Detail'),
      //   FilterSupplier: true,
      // },
      // 批量导入
      {
        authorized: true,
        path: '/ssrc/inquiry-hall/rfx-update/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
      // 询价单明细
      {
        path: '/ssrc/inquiry-hall/rfx-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail'),
        FilterSupplier: true,
      },
      // 还比价
      {
        path: '/ssrc/inquiry-hall/feedback-bargain/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/FeedbackBargain'),
        FilterSupplier: true,
      },
      // 核价
      {
        path: '/ssrc/inquiry-hall/check-price/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPrice'),
        FilterSupplier: true,
      },
      // 议价
      {
        path: '/ssrc/inquiry-hall/rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/index.js'),
        FilterSupplier: true,
      },
      // 初审
      {
        path: '/ssrc/inquiry-hall/pretrial/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Pretrial'),
        FilterSupplier: true,
      },
      // rfx过程管理
      {
        path: '/ssrc/inquiry-hall/rfx-evaluation-proc-manage/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/EvaluationProcManage'),
        FilterSupplier: true,
      },
      // rfx管理评分结果确认
      {
        path: '/ssrc/inquiry-hall/rfx-evaluation/:sourceHeaderId',
        models: [() => import('../models/bidHall.js'), () => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/RfxEvaluation'),
        FilterSupplier: true,
      },
      // 确认rfx候选人 - 实际没用到
      {
        path: '/ssrc/inquiry-hall/confirm-candidate/:sourceHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate'),
        FilterSupplier: true,
      },
      // 报价明细
      {
        path: '/ssrc/inquiry-hall/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationInquiry.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/QueryIndex'),
        FilterSupplier: true,
      },
      // 跳转寻源立项明细 (寻源大厅入口)
      {
        path: '/ssrc/inquiry-hall/project-setup/detail/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Update'),
        FilterSupplier: true,
      },
      // 评审澄清管理（寻源大厅入口）
      {
        path: '/ssrc/inquiry-hall/review-clarification',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification'),
        FilterSupplier: true,
      },
      // 评审澄清管理澄清单详情（寻源大厅入口）
      {
        path: '/ssrc/inquiry-hall/review-clarification-detail',
        models: [() => import('../models/inquiryHall.js')],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/ReviewClarification.js'),
        FilterSupplier: true,
      },
      // 评审澄清管理澄清单回复详情（寻源大厅入口）
      {
        path: '/ssrc/inquiry-hall/review-replay-detail',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification/ReplayDetail.js'),
        FilterSupplier: true,
      },
      // 评审澄清管理澄清新建澄清单（寻源大厅入口）
      {
        path: '/ssrc/inquiry-hall/review-clarification-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification/Create'),
        FilterSupplier: true,
      },
      // 多轮报价（核价入口）
      {
        path: '/ssrc/inquiry-hall/round-quotation/:rfxId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/RoundQuotation'),
        FilterSupplier: true,
      },

      // 采购方澄清函维护
      {
        path: '/ssrc/inquiry-hall/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Question'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览创建
      {
        path: '/ssrc/inquiry-hall/clarify-create/:sourceId/:rfxTitle/:rfxNum/:companyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 引用问题跳转问题详情
      {
        path: '/ssrc/inquiry-hall/issue-create/:sourceId/:rfxTitle/:rfxNum/:companyId/:selectId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看
      {
        path: '/ssrc/inquiry-hall/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情
      {
        path: '/ssrc/inquiry-hall/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览维护
      {
        path: '/ssrc/inquiry-hall/clarify-update/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 寻源中标公告
      {
        path: '/ssrc/inquiry-hall/accept-rfx-notice/:rfxId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/AcceptRfxNotice'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/inquiry-hall/rfx-review-clarification-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification/Create'),
        FilterSupplier: true,
      },
    ],
  },

  // 新-询价大厅
  {
    path: '/ssrc/new-inquiry-hall',
    models: [],
    FilterSupplier: true,
    components: [
      // 询价大厅列表
      {
        path: '/ssrc/new-inquiry-hall/list',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/commonModel.js'),
          () => import('../models/expertScoring.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew'),
        FilterSupplier: true,
      },
      // 寻源过程控制
      {
        path:
          '/ssrc/new-inquiry-hall/rf-detail-controller/:rfHeaderId/:sourceCategory/:adjustRecordId',
        // models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHallNew/RFController'),
        FilterSupplier: true,
      },
      //  i/p 寻源过程控制 审批
      {
        path:
          '/pub/ssrc/new-inquiry-hall/rf-detail-controller/approval/:rfHeaderId/:sourceCategory/:adjustRecordId',
        component: () => import('../routes/ssrc/InquiryHallNew/RFControllerApproval'),
        FilterSupplier: true,
        authorized: true,
      },
      // 立项转申请 提供给角色工作台用
      {
        path: '/pub/ssrc/new-inquiry-hall/project-to-inquiry',
        component: () => import('../routes/ssrc/InquiryHallNew/ProjectApprovalToInquiry'),
        FilterSupplier: true,
        authorized: true,
      },
      // RF报价响应不足 提供给角色工作台使用
      {
        path: '/pub/ssrc/new-inquiry-hall/rf-insufficient-quotation/:rfHeaderId',
        component: () => import('../routes/ssrc/InquiryHallNew/PubPagesEntry/RF/RFLackQuotedIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // RFQ 报价响应不足 提供给角色工作台使用
      {
        path: '/pub/ssrc/new-inquiry-hall/rfq-feedback-lack/:rfxHeaderId',
        component: () => import('../routes/ssrc/InquiryHallNew/PubPagesEntry/RFQFeedBackLack'),
        FilterSupplier: true,
        authorized: true,
      },
      // RFQ 开标 提供给角色工作台使用
      {
        path: '/pub/ssrc/new-inquiry-hall/open-bid/:rfxHeaderId',
        models: [() => import('../models/commonModel.js')],
        component: () => import('../routes/ssrc/InquiryHallNew/PubPagesEntry/OpenBid'),
      },
      {
        // 询价 过程控制 提供给角色工作台使用
        path: '/pub/ssrc/new-inquiry-hall/process-control/:rfxHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew/PubPagesEntry/ProcessControl'),
        FilterSupplier: true,
        authorized: true,
      },
      // 立项转rfi、rfp 提供给角色工作台用
      {
        path: '/pub/ssrc/new-inquiry-hall/project-to-rf/:type',
        component: () => import('../routes/ssrc/InquiryHallNew/ProjectApprovalToRFI.js'),
        FilterSupplier: true,
        authorized: true,
      },
      // 申请转RF
      {
        path: '/ssrc/new-inquiry-hall/rf-apply-to-inquiry',
        component: () => import('../routes/ssrc/InquiryHallNew/RFApply'),
        FilterSupplier: true,
      },
      // 寻源过程评审
      {
        path: '/ssrc/new-inquiry-hall/rf-detail-approve/:rfId',
        // models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHallNew/RFApprove'),
        FilterSupplier: true,
      },
      // 寻源评审澄清
      {
        path: '/ssrc/new-inquiry-hall/rfx-review-clarification',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/Entry/InquiryIndex.js'),
        FilterSupplier: true,
      },
      // 寻源问题创建
      {
        path: '/ssrc/new-inquiry-hall/rfx-review-clarification-create',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/Create/Entry/InquiryNewIndex'),
        FilterSupplier: true,
      },
      // 澄清问题详细
      {
        path: '/ssrc/new-inquiry-hall/rfx-review-clarification-detail',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () =>
          import(
            '../routes/ssrc/InquiryHall/ReviewClarification/ReviewClarificationEntry/InquiryIndex.js'
          ),
        FilterSupplier: true,
      },
      // 寻源问题
      {
        path: '/ssrc/new-inquiry-hall/source-review-clarification',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification'),
        FilterSupplier: true,
      },
      // 寻源问题创建
      {
        path: '/ssrc/new-inquiry-hall/source-review-clarification-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification/CreateSource'),
        FilterSupplier: true,
      },
      // 寻源问题详细
      {
        path: '/ssrc/new-inquiry-hall/source-review-clarification-detail',
        models: [() => import('../models/inquiryHall.js')],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/ReviewClarification.js'),
        FilterSupplier: true,
      },
      // 寻源过程控制
      {
        path: '/ssrc/new-inquiry-hall/rfx-detail-controller/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
      },
      // 寻源过程控制-新
      {
        path: '/ssrc/new-inquiry-hall/new-rfx-detail-controller/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/NewDetail'),
        FilterSupplier: true,
      },
      // 寻源过程控制-新-审批
      {
        path: '/pub/ssrc/new-inquiry-hall/new-rfx-detail-controller-detail/:type/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Approval'),
        FilterSupplier: true,
        authorized: true,
      },
      // 寻源过程控制-新-审批
      {
        path: '/pub/ssrc/new-inquiry-hall/new-rfx-detail-controller-detail/:type/:rfxId/RFQ',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Approval'),
        FilterSupplier: true,
        authorized: true,
      },
      // 新招标过程控制-新-审批
      {
        path: '/pub/ssrc/new-inquiry-hall/new-rfx-detail-controller-detail/:type/:rfxId/NEW_BID',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Approval'),
        FilterSupplier: true,
        authorized: true,
      },
      // 寻源过程控制-新-审批和详情
      {
        path: '/ssrc/new-inquiry-hall/new-rfx-detail-controller-detail/:type/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Approval'),
        FilterSupplier: true,
      },
      // 询价监控台
      {
        path: '/ssrc/new-inquiry-hall/quotation-monitor/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Monitor/InquiryIndex'),
        FilterSupplier: true,
      },
      // 申请转询价
      {
        path: '/ssrc/new-inquiry-hall/apply-to-inquiry',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ApplyToInquiry'),
        FilterSupplier: true,
      },
      // 申请转询价-c7n
      {
        path: '/ssrc/new-inquiry-hall/apply-to-inquiry-new',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/ApplyToInquiryNew'),
        FilterSupplier: true,
      },
      // 申请转整单线下
      {
        path: '/ssrc/new-inquiry-hall/apply-to-offline/:sourceRequest',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ApplyToInquiry'),
        FilterSupplier: true,
      },
      // 创建询价单
      {
        path: '/ssrc/new-inquiry-hall/rfx-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Create'),
        FilterSupplier: true,
      },
      // 询价单维护-new
      {
        path: '/ssrc/new-inquiry-hall/rfx-update/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew/Update'),
        FilterSupplier: true,
      },
      // 询价单维护-new
      {
        path: '/ssrc/new-inquiry-hall/rfx-update-new/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew/Update'),
        FilterSupplier: true,
      },
      // 整单录入-维护
      {
        path: '/ssrc/new-inquiry-hall/whole-update/:rfxId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/Whole/Update'),
        FilterSupplier: true,
      },
      // 整单录入-详情
      {
        path: '/ssrc/new-inquiry-hall/whole-detail/:rfxId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/Whole/Detail'),
        FilterSupplier: true,
      },
      // 整单录入-详情/pub
      {
        path: '/pub/ssrc/new-inquiry-hall/whole-detail/:rfxId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/Whole/Detail'),
        FilterSupplier: true,
        authorized: true,
      },
      // 批量导入
      {
        authorized: true,
        path: '/ssrc/new-inquiry-hall/rfx-update-new/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
      // 询价单明细
      {
        path: '/ssrc/new-inquiry-hall/rfx-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/InquiryIndex'),
        FilterSupplier: true,
      },
      // 询价单明细-其他模块使用-提供权限
      {
        path: '/ssrc/new-inquiry-hall/other-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/InquiryIndex'),
        authorized: true,
        title: 'hzero.common.view.message.title.inquiryHall',
      },
      // 还比价
      {
        path: '/ssrc/new-inquiry-hall/feedback-bargain/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/FeedbackBargain/InquiryIndex'),
        FilterSupplier: true,
      },
      // 还比价-C7N
      {
        path: '/ssrc/new-inquiry-hall/feedback-bargain-new/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/FeedbackBargainC7N/InquiryIndex'),
        FilterSupplier: true,
      },
      // 核价
      {
        path: '/ssrc/new-inquiry-hall/check-price/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPrice/NewIndex'),
        FilterSupplier: true,
      },
      // 核价概览
      {
        path: '/ssrc/new-inquiry-hall/check-price-overview/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n'),
        FilterSupplier: true,
      },
      // 议价
      {
        path: '/ssrc/new-inquiry-hall/rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainInquiryHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/Entry/indexInquiryHall.js'),
        FilterSupplier: true,
      },
      // 议价-新
      {
        path: '/ssrc/new-inquiry-hall/new-rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainInquiryHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/BargainNew/Entry/indexInquiryHall.js'),
        FilterSupplier: true,
      },
      // 初审
      {
        path: '/ssrc/new-inquiry-hall/pretrial/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Pretrial'),
        FilterSupplier: true,
      },
      // rfx过程管理
      {
        path: '/ssrc/new-inquiry-hall/rfx-evaluation-proc-manage/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/EvaluationProcManage/InquiryIndex'),
        FilterSupplier: true,
      },
      // rfx管理评分结果确认
      {
        path: '/ssrc/new-inquiry-hall/rfx-evaluation/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
          () => import('../models/bidHallInquiry.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RfxEvaluation/indexInquiryHall'),
        FilterSupplier: true,
      },
      // 确认rfx候选人
      {
        path: '/ssrc/new-inquiry-hall/confirm-candidate/:sourceHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate/InquiryIndex'),
        FilterSupplier: true,
      },
      // 报价明细
      {
        path: '/ssrc/new-inquiry-hall/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationInquiryNew'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/QueryIndexNew'),
        FilterSupplier: true,
      },
      // 跳转寻源立项明细 (寻源大厅入口)
      {
        path: '/ssrc/new-inquiry-hall/project-setup/detail/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Detail'),
        FilterSupplier: true,
      },
      // 澄清管理列表（专家入口）
      {
        path: '/ssrc/new-inquiry-hall/review-clarification',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
        ],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/indexInquiryHall'),
        FilterSupplier: true,
      },
      // 澄清单详情（专家入口）
      {
        path: '/ssrc/new-inquiry-hall/review-clarification-detail',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
        ],
        component: () =>
          import(
            '../routes/sbid/ExpertScoring/ReviewClarification/ReviewClarificationInquiryHall.js'
          ),
        FilterSupplier: true,
      },
      // 澄清单回复详情（专家入口）
      {
        path: '/ssrc/new-inquiry-hall/review-clarification-replay-detail',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
        ],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/ReplayDetailInquiryHall.js'),
        FilterSupplier: true,
      },
      // 答疑新建（专家入口）
      {
        path: '/ssrc/new-inquiry-hall/review-clarification-create',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
        ],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/Create/indexInquiryHall'),
        FilterSupplier: true,
      },
      // 评审澄清管理澄清单回复详情（寻源大厅入口）
      {
        path: '/ssrc/new-inquiry-hall/review-replay-detail',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () =>
          import(
            '../routes/ssrc/InquiryHall/ReviewClarification/ReplayDetailEntry/InquiryIndex.js'
          ),
        FilterSupplier: true,
      },
      // 多轮报价（核价入口）
      {
        path: '/ssrc/new-inquiry-hall/round-quotation/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RoundQuotation/indexInquiryHall'),
        FilterSupplier: true,
      },

      // 采购方澄清函维护
      {
        path: '/ssrc/new-inquiry-hall/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/InquiryIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函维护 - 工作流pub
      {
        path:
          '/pub/ssrc/new-inquiry-hall/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNewPub.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/PubInquiryIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // 采购方澄清函预览创建
      {
        path: '/ssrc/new-inquiry-hall/clarify-create/:sourceId/:rfxTitle/:rfxNum/:companyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 引用问题跳转问题详情
      {
        path:
          '/ssrc/new-inquiry-hall/issue-create/:sourceId/:rfxTitle/:rfxNum/:companyId/:selectId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      {
        path:
          '/pub/ssrc/new-inquiry-hall/issue-create/:sourceId/:rfxTitle/:rfxNum/:companyId/:selectId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
        authorized: true,
      },
      // 采购方引入问题详情查看
      {
        path: '/ssrc/new-inquiry-hall/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails/inquiryIndex'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看 - 工作流pub
      {
        path:
          '/pub/ssrc/new-inquiry-hall/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNewPub.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails/PubInquiryIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // 采购方澄清函预览详情
      {
        path:
          '/ssrc/new-inquiry-hall/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail/InquiryIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情 - 工作流pub
      {
        path:
          '/pub/ssrc/new-inquiry-hall/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail/InquiryIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // 采购方澄清函预览维护
      {
        path:
          '/ssrc/new-inquiry-hall/clarify-update/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 寻源中标公告
      {
        path: '/ssrc/new-inquiry-hall/accept-rfx-notice/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/AcceptRfxNotice/InquiryIndex'),
        FilterSupplier: true,
      },
      // 寻源中标公告-new
      {
        path: '/ssrc/new-inquiry-hall/accept-rfx-notice-new/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/AcceptRfxNoticeNew'),
        FilterSupplier: true,
      },
      // 专家评分修改-(老，建议不要用了)
      {
        path:
          '/ssrc/new-inquiry-hall/new-expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Update/InquiryIndex'),
        FilterSupplier: true,
      },
      // 专家评分修改
      {
        path:
          '/ssrc/new-inquiry-hall/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Update/InquiryIndex'),
        FilterSupplier: true,
      },
      // 专家评分 - 初步评审(符合性检查)-(老，建议不要用了)
      {
        path:
          '/ssrc/new-inquiry-hall/new-expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/initial-review',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Review/indexInquiryHall'),
        FilterSupplier: true,
      },
      // 专家评分 - 初步评审(符合性检查)
      {
        path:
          '/ssrc/new-inquiry-hall/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/initial-review',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringInquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Review/indexInquiryHall'),
        FilterSupplier: true,
      },
      // 专家评分跳转寻源评分过程管理页面-(老，建议不要用了)
      {
        path:
          '/ssrc/new-inquiry-hall/new-expert-scoring/rfx-evaluation-proc-manage/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallNew'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/EvaluationProcManage/InquiryIndex'),
        FilterSupplier: true,
      },
      // 专家评分跳转寻源评分管理评分结果确认tab-(老，建议不要用了)
      {
        path: '/ssrc/new-inquiry-hall/new-expert-scoring/rfx-evaluation/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
          () => import('../models/bidHallInquiry.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RfxEvaluation/indexInquiryHall'),
        FilterSupplier: true,
      },
      // 专家评分跳转推荐成交候选人-(老，建议不要用了)
      {
        path: '/ssrc/new-inquiry-hall/new-expert-scoring/confirm-candidate/:sourceHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate/InquiryIndex'),
        FilterSupplier: true,
      },
      // 资格审查明细
      {
        path: '/ssrc/new-inquiry-hall/new-qualification-examination/detail/:rfxId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/qualificationExaminationInquiry'),
        ],
        component: () => import('../routes/ssrc/QualificationExamination/Detail/InquiryIndex'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转议价界面
      {
        path: '/ssrc/new-inquiry-hall/expert-scoring/rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainInquiryHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/Entry/indexInquiryHall.js'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转议价新界面
      {
        path: '/ssrc/new-inquiry-hall/expert-scoring/new-rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainInquiryHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/BargainNew/Entry/indexInquiryHall.js'),
        FilterSupplier: true,
      },
      // 资格审查明细 - 分标段
      {
        path:
          '/ssrc/new-inquiry-hall/new-qualification-examination/section-detail/:prequalGroupHeaderId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/qualificationExaminationInquiry'),
        ],
        component: () =>
          import('../routes/ssrc/QualificationExamination/SectionDetail/InquiryIndex'),
        FilterSupplier: true,
      },
      // RFP 维护
      {
        path: '/ssrc/new-inquiry-hall/rf-update/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFUpdate/indexRFP'),
        FilterSupplier: true,
      },
      // RFI 维护
      {
        path: '/ssrc/new-inquiry-hall/rf-update/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFUpdate/indexRFI'),
        FilterSupplier: true,
      },
      // RFP确定供应商审批
      {
        path: '/pub/ssrc/new-inquiry-hall/rf-check/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP'),
        FilterSupplier: true,
      },
      // RFP 明细
      {
        path: '/ssrc/new-inquiry-hall/rf-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP'),
        FilterSupplier: true,
      },
      // RFP发布审批
      {
        path: '/pub/ssrc/new-inquiry-hall/rf-update/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP'),
        FilterSupplier: true,
      },
      // RFI确定供应商审批
      {
        path: '/pub/ssrc/new-inquiry-hall/rf-check/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI'),
        FilterSupplier: true,
      },
      // RFI 明细
      {
        path: '/ssrc/new-inquiry-hall/rf-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI'),
        FilterSupplier: true,
      },
      // RFI发布审批
      {
        path: '/pub/ssrc/new-inquiry-hall/rf-update/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI'),
        FilterSupplier: true,
      },
      // RFP 核价
      {
        path: '/ssrc/new-inquiry-hall/rf-check/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFCheck/indexRFP'),
        FilterSupplier: true,
      },
      // RFI 核价
      {
        path: '/ssrc/new-inquiry-hall/rf-check/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFCheck/indexRFI'),
        FilterSupplier: true,
      },
      // RF供应商回复-详情
      {
        path: '/ssrc/new-inquiry-hall/reply-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFI'),
      },
      {
        path: '/ssrc/new-inquiry-hall/reply-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFP'),
      },
      // RFI/RFP 历史版本详情
      {
        path: '/ssrc/new-inquiry-hall/rf/detail/RFI/:rfHeaderId/:quotationHeaderVersionId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/historyDetail/indexRFI'),
        authorized: true,
      },
      {
        path: '/ssrc/new-inquiry-hall/rf/detail/RFP/:rfHeaderId/:quotationHeaderVersionId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/historyDetail/indexRFP'),
        authorized: true,
      },
      // RF线下回复录入
      {
        path: '/ssrc/new-inquiry-hall/offline-reply/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFOfflineReply/indexRFI'),
      },
      {
        path: '/ssrc/new-inquiry-hall/offline-reply/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFOfflineReply/indexRFP'),
      },
      // 采购方竞价大厅
      {
        path: '/pub/ssrc/new-inquiry-hall/bidding-hall/:rfxHeaderId',
        FilterSupplier: true,
        authorized: true,
        component: () => import('../routes/ssrc/BiddingHall/Purchase'),
      },
      // 关闭询价单审批流
      {
        path: '/pub/ssrc/new-inquiry-hall/rfx-close-approval/:rfxId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/CloseRfxDrawer/Approval'),
        authorized: true,
      },
      // 关闭询价单审批流
      {
        path: '/pub/ssrc/new-inquiry-hall/rfx-close-approval/:rfxId/RFQ',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/CloseRfxDrawer/Approval'),
        authorized: true,
      },
      // 关闭招标单审批流
      {
        path: '/pub/ssrc/new-inquiry-hall/rfx-close-approval/:rfxId/NEW_BID',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/CloseRfxDrawer/Approval/BidIndex'),
        authorized: true,
      },
    ],
  },

  // 新-招标大厅
  {
    path: '/ssrc/new-bid-hall',
    models: [],
    FilterSupplier: true,
    components: [
      // 招标大厅列表
      {
        path: '/ssrc/new-bid-hall/list',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/commonModel.js'),
          () => import('../models/expertScoring.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew/BidIndex'),
        FilterSupplier: true,
      },
      // 寻源大厅/中标公告预览
      {
        path: '/ssrc/new-bid-hall/accept-rfx-notice-detail/:rfxId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHallNew/RFXWinBidNotice/bidIndex'),
        authorized: true,
        FilterSupplier: true,
      },
      // 询价单维护-new
      {
        path: '/ssrc/new-bid-hall/bid-update/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew/Update/NewBid'),
        FilterSupplier: true,
      },
      // 询价单维护-new
      {
        path: '/ssrc/new-bid-hall/rfx-update-new/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHallNew/Update/NewBid'),
        FilterSupplier: true,
      },
      // 立项转招标 提供给角色工作台用
      {
        path: '/pub/ssrc/new-bid-hall/project-to-inquiry',
        component: () => import('../routes/ssrc/InquiryHallNew/ProjectApprovalToInquiry'),
        FilterSupplier: true,
        authorized: true,
      },
      // 新招标 投标响应不足 提供给角色工作台使用
      {
        path: '/pub/ssrc/new-bid-hall/feedback-lack/:rfxHeaderId',
        component: () =>
          import('../routes/ssrc/InquiryHallNew/PubPagesEntry/RFQFeedBackLack/BidIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // 新招标 开标 提供给角色工作台使用
      {
        path: '/pub/ssrc/new-bid-hall/open-bid/:rfxHeaderId',
        component: () => import('../routes/ssrc/InquiryHallNew/PubPagesEntry/OpenBid/BidIndex'),
        models: [
          // () => import('../models/inquiryHall.js'),
          () => import('../models/commonModel.js'),
          // () => import('../models/expertScoring.js'),
        ],
        FilterSupplier: true,
        authorized: true,
      },
      {
        // 新招标 过程控制 提供给角色工作台使用
        path: '/pub/ssrc/new-bid-hall/process-control/:rfxHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHallNew/PubPagesEntry/ProcessControl/BidIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // 招标维护-new /ssrc/new-inquiry-hall/rfx-detail/
      {
        path: '/ssrc/new-bid-hall/bid-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/NewBidIndex.js'),
        FilterSupplier: true,
      },
      // 提供给其他模块使用
      {
        path: '/ssrc/new-bid-hall/other-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/NewBidIndex.js'),
        authorized: true,
        title: 'hzero.common.view.message.title.bidHall',
      },
      // 专家评分跳转用
      {
        path: '/ssrc/new-bid-hall/new-bid-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/NewBidIndex.js'),
        FilterSupplier: true,
      },
      // 新招标过程控制
      {
        path: '/ssrc/new-bid-hall/rf-detail-controller/:rfHeaderId/:sourceCategory/:adjustRecordId',
        // models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHallNew/RFController'),
        FilterSupplier: true,
      },
      // 申请转RF
      {
        path: '/ssrc/new-bid-hall/rf-apply-to-inquiry',
        component: () => import('../routes/ssrc/InquiryHallNew/RFApply'),
        FilterSupplier: true,
      },
      // 新招标过程评审
      {
        path: '/ssrc/new-bid-hall/rf-detail-approve/:rfId',
        // models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHallNew/RFApprove'),
        FilterSupplier: true,
      },
      // 新招标评审澄清
      {
        path: '/ssrc/new-bid-hall/rfx-review-clarification',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification/Entry/BidIndex.js'),
        FilterSupplier: true,
      },
      // 新招标问题创建
      {
        path: '/ssrc/new-bid-hall/rfx-review-clarification-create',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/Create/Entry/InquiryBidIndex'),
        FilterSupplier: true,
      },
      // 澄清问题详细
      {
        path: '/ssrc/new-bid-hall/rfx-review-clarification-detail',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () =>
          import(
            '../routes/ssrc/InquiryHall/ReviewClarification/ReviewClarificationEntry/BidIndex.js'
          ),
        FilterSupplier: true,
      },
      // 招标问题
      {
        path: '/ssrc/new-bid-hall/source-review-clarification',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification'),
        FilterSupplier: true,
      },
      // 新招标问题创建
      {
        path: '/ssrc/new-bid-hall/source-review-clarification-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ReviewClarification/CreateSource'),
        FilterSupplier: true,
      },
      // 招标问题详细
      {
        path: '/ssrc/new-bid-hall/source-review-clarification-detail',
        models: [() => import('../models/inquiryHall.js')],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/ReviewClarification.js'),
        FilterSupplier: true,
      },
      // 新招标过程控制
      {
        path: '/ssrc/new-bid-hall/rfx-detail-controller/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
      },
      // 新招标过程控制-新
      {
        path: '/ssrc/new-bid-hall/new-rfx-detail-controller/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/NewDetail/BidIndex'),
        FilterSupplier: true,
      },
      // 新招标过程控制-新-审批和详情
      {
        path: '/ssrc/new-bid-hall/new-rfx-detail-controller-detail/:type/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Approval'),
        FilterSupplier: true,
      },
      // 招标监控台
      {
        path: '/ssrc/new-bid-hall/quotation-monitor/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Monitor/NewBidIndex'),
        FilterSupplier: true,
      },
      // 申请转招标
      {
        path: '/ssrc/new-bid-hall/apply-to-inquiry',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/ApplyToInquiry/BidIndex'),
        FilterSupplier: true,
      },
      // 创建招标单
      {
        path: '/ssrc/new-bid-hall/rfx-create',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Create'),
        FilterSupplier: true,
      },
      // 招标单明细-实际没用到，用上面的/ssrc/new-bid-hall/bid-detail
      {
        path: '/ssrc/new-bid-hall/rfx-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/NewBidIndex'),
        FilterSupplier: true,
      },
      // 还比价
      {
        path: '/ssrc/new-bid-hall/feedback-bargain/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/FeedbackBargain/NewBidIndex'),
        FilterSupplier: true,
      },
      // 还比价-C7N
      {
        path: '/ssrc/new-bid-hall/feedback-bargain-new/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/FeedbackBargainC7N/NewBidIndex'),
        FilterSupplier: true,
      },
      // 核价
      {
        path: '/ssrc/new-bid-hall/check-price/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/newBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPrice/NewIndexBID'),
        FilterSupplier: true,
      },
      // 定标概览
      {
        path: '/ssrc/new-bid-hall/check-price-overview/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/newBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/indexBid'),
        FilterSupplier: true,
      },
      // 议价
      {
        path: '/ssrc/new-bid-hall/rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainBidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/Entry/indexBid.js'),
        FilterSupplier: true,
      },
      // 议价-new
      {
        path: '/ssrc/new-bid-hall/new-rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainBidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/BargainNew/Entry/indexBid.js'),
        FilterSupplier: true,
      },
      // 初审
      {
        path: '/ssrc/new-bid-hall/pretrial/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Pretrial/BidIndex'),
        FilterSupplier: true,
      },
      // rfx过程管理
      {
        path: '/ssrc/new-bid-hall/rfx-evaluation-proc-manage/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/EvaluationProcManage/Bidindex'),
        FilterSupplier: true,
      },
      // rfx管理评分结果确认
      {
        path: '/ssrc/new-bid-hall/rfx-evaluation/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHallBid.js'),
          () => import('../models/inquiryHallBid.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RfxEvaluation/indexBidHall'),
        FilterSupplier: true,
      },
      // 确认rfx候选人
      {
        path: '/ssrc/new-bid-hall/confirm-candidate/:sourceHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate/BidIndex'),
        FilterSupplier: true,
      },
      // 报价明细
      {
        path: '/ssrc/new-bid-hall/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationNewBid'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/NewBidIndex'),
        FilterSupplier: true,
      },
      // 跳转新招标立项明细 (新招标大厅入口)
      {
        path: '/ssrc/new-bid-hall/project-setup/detail/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Detail'),
        FilterSupplier: true,
      },
      // 澄清管理列表（专家入口）
      {
        path: '/ssrc/new-bid-hall/review-clarification',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/ReviewClarification/indexBidHall'),
        FilterSupplier: true,
      },
      // 澄清单详情（专家入口）
      {
        path: '/ssrc/new-bid-hall/review-clarification-detail',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
        ],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/ReviewClarificationBidHall.js'),
        FilterSupplier: true,
      },
      // 澄清单回复详情（专家入口）
      {
        path: '/ssrc/new-bid-hall/review-clarification-replay-detail',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
        ],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/ReplayDetailBidHall.js'),
        FilterSupplier: true,
      },
      // 答疑新建（专家入口）
      {
        path: '/ssrc/new-bid-hall/review-clarification-create',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
        ],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/Create/indexBidHall'),
        FilterSupplier: true,
      },
      // 评审澄清管理澄清单回复详情（寻源大厅入口）
      {
        path: '/ssrc/new-bid-hall/review-replay-detail',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/ReplayDetailEntry/BidIndex.js'),
        FilterSupplier: true,
      },
      // 多轮报价（核价入口）
      {
        path: '/ssrc/new-bid-hall/round-quotation/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RoundQuotation/indexBidHall'),
        FilterSupplier: true,
      },

      // 采购方澄清函维护
      {
        path: '/ssrc/new-bid-hall/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/BidIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览创建
      {
        path: '/ssrc/new-bid-hall/clarify-create/:sourceId/:rfxTitle/:rfxNum/:companyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 引用问题跳转问题详情
      {
        path: '/ssrc/new-bid-hall/issue-create/:sourceId/:rfxTitle/:rfxNum/:companyId/:selectId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create/BidIndex'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看
      {
        path: '/ssrc/new-bid-hall/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails/BidIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情
      {
        path: '/ssrc/new-bid-hall/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail/BidIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览维护
      {
        path: '/ssrc/new-bid-hall/clarify-update/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Create/BidIndex.js'),
        FilterSupplier: true,
      },
      // 新招标中标公告
      {
        path: '/ssrc/new-bid-hall/accept-rfx-notice/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/AcceptRfxNotice/NewBidIndex'),
        FilterSupplier: true,
      },
      // 新招标中标公告-new
      {
        path: '/ssrc/new-bid-hall/accept-rfx-notice-new/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/AcceptRfxNoticeNew/NewBidIndex'),
        FilterSupplier: true,
      },
      // 专家评分修改-(老，建议不要用了)
      {
        path:
          '/ssrc/new-bid-hall/new-expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Update/BidIndex'),
        FilterSupplier: true,
      },
      // 专家评分修改
      {
        path:
          '/ssrc/new-bid-hall/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Update/BidIndex'),
        FilterSupplier: true,
      },
      // 专家评分 - 初步评审(符合性检查)-(老，建议不要用了)
      {
        path:
          '/ssrc/new-bid-hall/new-expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/initial-review',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Review/indexBidHall'),
        FilterSupplier: true,
      },
      // 专家评分 - 初步评审(符合性检查)
      {
        path:
          '/ssrc/new-bid-hall/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/initial-review',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/expertScoringBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Review/indexBidHall'),
        FilterSupplier: true,
      },
      // 专家评分跳转新招标评分过程管理页面-(老，建议不要用了)
      {
        path: '/ssrc/new-bid-hall/new-expert-scoring/rfx-evaluation-proc-manage/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/EvaluationProcManage/Bidindex'),
        FilterSupplier: true,
      },
      // 专家评分跳转新招标评分管理评分结果确认tab-(老，建议不要用了)
      {
        path: '/ssrc/new-bid-hall/new-expert-scoring/rfx-evaluation/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHallBid.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RfxEvaluation/indexBidHall'),
        FilterSupplier: true,
      },
      // 专家评分跳转推荐成交候选人-(老，建议不要用了)
      {
        path: '/ssrc/new-bid-hall/new-expert-scoring/confirm-candidate/:sourceHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/editorOnline.js'),
          () => import('../models/inquiryHallBid.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate/BidIndex'),
        FilterSupplier: true,
      },
      // 资格审查明细
      {
        path: '/ssrc/new-bid-hall/new-qualification-examination/detail/:rfxId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/qualificationExaminationBid.js'),
        ],
        component: () => import('../routes/ssrc/QualificationExamination/Detail/BidIndex'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转议价界面
      {
        path: '/ssrc/new-bid-hall/expert-scoring/rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainBidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/Entry/indexBid.js'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转议价界面-new
      {
        path: '/ssrc/new-bid-hall/expert-scoring/new-rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainBidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/BargainNew/Entry/indexBid.js'),
        FilterSupplier: true,
      },
      // 资格审查明细 - 分标段
      {
        path:
          '/ssrc/new-bid-hall/new-qualification-examination/section-detail/:prequalGroupHeaderId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/qualificationExaminationBid'),
        ],
        component: () => import('../routes/ssrc/QualificationExamination/SectionDetail/BidIndex'),
        FilterSupplier: true,
      },
      // 招标工作台 招标公告
      {
        path: '/public/ssrc/new-bid-hall/tender-bid-notice-preview/RFX/:tenantId/:rfxHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFXTenderNotice/bidIndex'),
        authorized: true,
        FilterSupplier: true,
      },
      // 招标工作台--价格澄清
      {
        path: '/ssrc/new-bid-hall/price-clarification-update',
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/Update/BidIndex'),
        FilterSupplier: true,
      },
      // 招标工作台--价格澄清列表
      {
        path: '/ssrc/new-bid-hall/price-clarification-list',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/BidIndex'),
        FilterSupplier: true,
      },
      // 招标工作台--价格澄清详情
      {
        path: '/ssrc/new-bid-hall/price-clarification-detail',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/Detail/BidIndex'),
        FilterSupplier: true,
      },
      // 申请转招标-c7n
      {
        path: '/ssrc/new-bid-hall/apply-to-bid-new',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/ApplyToInquiryNew/BidIndex'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方查看澄清函 - 老询价
  {
    path: '/ssrc/clarification-letter',
    models: [],
    FilterSupplier: true,
    components: [
      // 采购方澄清函维护
      {
        path:
          '/ssrc/clarification-letter/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Question'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看
      {
        path:
          '/ssrc/clarification-letter/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情
      {
        path:
          '/ssrc/clarification-letter/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [() => import('../models/inquiryHall.js')],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方查看澄清函 - 新询价
  {
    path: '/ssrc/new-clarification-letter',
    models: [],
    FilterSupplier: true,
    components: [
      // 采购方澄清函维护
      {
        path:
          '/ssrc/new-clarification-letter/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/InquiryIndex'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看
      {
        path:
          '/ssrc/new-clarification-letter/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails/inquiryIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情
      {
        path:
          '/ssrc/new-clarification-letter/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallNew.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail/InquiryIndex'),
        FilterSupplier: true,
      },
    ],
  },
  // 采购方查看澄清函 - 新招标
  {
    path: '/ssrc/bid-clarification-letter',
    models: [],
    FilterSupplier: true,
    components: [
      // 采购方澄清函维护
      {
        path:
          '/ssrc/bid-clarification-letter/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/BidIndex'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看
      {
        path:
          '/ssrc/bid-clarification-letter/question-details/:issueHeaderId/:rfxNum/:rfxTitle/:companyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Question/IssueDetails/BidIndex'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情
      {
        path:
          '/ssrc/bid-clarification-letter/clarify-detail/:sourceId/:rfxNum/:rfxTitle/:companyId/:clarifyId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallBid'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Clarify/Detail/BidIndex'),
        FilterSupplier: true,
      },
    ],
  },
  // 中标公告预览
  {
    path:
      '/public/ssrc/new-inquiry-hall/accept-rfx-notice-detail-preview/RFX/:tenantId/:rfxHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFXWinBidNotice'),
    authorized: true,
    FilterSupplier: true,
  },
  // 中标公告预览-新招标
  {
    path: '/public/ssrc/new-bid-hall/accept-rfx-notice-detail-preview/RFX/:tenantId/:rfxHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFXWinBidNotice/bidIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 寻源大厅/招标公告预览
  {
    path: '/ssrc/inquiry-hall/tender-bid-notice-preview/:rfxId',
    models: [() => import('../models/inquiryHall.js')],
    component: () => import('../routes/ssrc/InquiryHall/TenderBidNotice'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价工作台/招标公告预览-门户
  {
    path: '/public/ssrc/new-inquiry-hall/tender-bid-notice-preview/RFP/:tenantId/:rfHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFTenderNotice/indexRFP'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价工作台/招标公告预览-门户
  {
    path: '/public/ssrc/new-inquiry-hall/tender-bid-notice-preview/RFI/:tenantId/:rfHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFTenderNotice/indexRFI'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价工作台/寻竞价招标公告
  {
    path: '/public/ssrc/new-inquiry-hall/tender-bid-notice-preview/RFX/:tenantId/:rfxHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFXTenderNotice'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价工作台/招标公告预览
  {
    path: '/ssrc/new-inquiry-hall/tender-bid-notice-preview/RFP/:tenantId/:rfHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFTenderNotice/indexRFP'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价工作台/招标公告预览
  {
    path: '/ssrc/new-inquiry-hall/tender-bid-notice-preview/RFI/:tenantId/:rfHeaderId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHallNew/RFTenderNotice/indexRFI'),
    authorized: true,
    FilterSupplier: true,
  },
  // 寻源大厅/中标公告预览
  {
    path: '/ssrc/inquiry-hall/accept-rfx-notice-detail/:rfxId',
    models: [() => import('../models/inquiryHall.js')],
    component: () => import('../routes/ssrc/InquiryHallNew/RFXWinBidNotice'),
    authorized: true,
    FilterSupplier: true,
  },
  // 新招标工作台公告预览
  {
    path: '/ssrc/inquiry-hall/tender-bid-hall-notice-preview/:rfxId',
    models: [() => import('../models/inquiryHall.js')],
    component: () => import('../routes/ssrc/InquiryHall/TenderBidNotice/BidIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询报价控制
  {
    path: '/ssrc/quotation-controller',
    models: [],
    FilterSupplier: true,
    // 询报价控制列表
    components: [
      {
        path: '/ssrc/quotation-controller/list',
        models: [() => import('../models/quotationController.js')],
        component: () => import('../routes/ssrc/QuotationController'),
        FilterSupplier: true,
      },
      // 询报价控制明细
      {
        path: '/ssrc/quotation-controller/rfx-detail/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
      },
      // 询报价控制明细
      {
        path: '/ssrc/quotation-controller/new-rfx-detail/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/NewDetail'),
        FilterSupplier: true,
      },
      // 询报价控制明细
      {
        path: '/pub/ssrc/quotation-controller/rfx-detail-approval/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
        authorized: true,
      },
    ],
  },
  // 新-招标过程控制
  {
    path: '/ssrc/bid-quotation-controller',
    models: [],
    FilterSupplier: true,
    // 询报价控制列表
    components: [
      {
        path: '/ssrc/bid-quotation-controller/list',
        models: [() => import('../models/quotationController.js')],
        component: () => import('../routes/ssrc/QuotationController/BidIndex'),
        FilterSupplier: true,
      },
      // 询报价控制明细
      {
        path: '/ssrc/bid-quotation-controller/rfx-detail/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
      },
      // 询报价控制明细
      {
        path: '/ssrc/bid-quotation-controller/new-rfx-detail/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/NewDetail/BidIndex'),
        FilterSupplier: true,
      },
      // 询报价控制明细
      {
        path: '/pub/ssrc/bid-quotation-controller/rfx-detail-approval/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationController.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/queryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QuotationController/Detail'),
        FilterSupplier: true,
        authorized: true,
      },
    ],
  },
  // 询报价查询
  {
    path: '/ssrc/query-rfq',
    models: [],
    FilterSupplier: true,
    components: [
      // 询报价查询列表
      {
        path: '/ssrc/query-rfq/list',
        models: [() => import('../models/inquiryHall.js'), () => import('../models/queryRfq.js')],
        component: () => import('../routes/ssrc/QueryRfq'),
        FilterSupplier: true,
      },
      // 询报价查询明细
      {
        path: '/ssrc/query-rfq/rfx-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallQuery'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/InquiryIndexQuery'),
        FilterSupplier: true,
      },
      // 寻源-线下整单-报价查询明细
      {
        path: '/ssrc/query-rfq/whole-detail/:rfxId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/Whole/Detail'),
        FilterSupplier: true,
      },
      // 新招标查询明细
      {
        path: '/ssrc/query-rfq/bid-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallQuery'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/InquiryIndexQueryBid'),
        FilterSupplier: true,
      },
      // 报价查询
      {
        path: '/ssrc/query-rfq/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationQueryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/QueryRFQIndex'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/query-rfq/rfx-quotation-detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationQueryRfq.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/QueryRFQIndex'),
        FilterSupplier: true,
      },
    ],
  },
  // 报价明细-供订单物流使用
  {
    path: '/ssrc/quotation-detail-query',
    models: [() => import('../models/quotationDetail.js')],
    component: () => import('../routes/components/QuotationDetail/displayQuotationDetail'),
    authorized: true,
  },
  // 寻源结果查询
  {
    path: '/ssrc/results-query',
    models: [],
    FilterSupplier: true,
    // 寻源结果查询列表
    components: [
      {
        path: '/ssrc/results-query/list',
        models: [
          () => import('../models/resultsQuery.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/ResultsQuery'),
        FilterSupplier: true,
      },
      // 寻源结果导入明细
      {
        path: '/ssrc/results-query/results-query-detail/:sourceHeaderId',
        models: [
          () => import('../models/resultsQuery.js'),
          () => import('../models/queryRfq.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/ResultsQuery/ResultsQueryDetail'),
        FilterSupplier: true,
      },
      // 寻源结果导入-招标明细
      {
        path: '/ssrc/results-query/results-bid-detail/:bidId',
        models: [
          () => import('../models/resultsQuery.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/ResultsQuery/ResultsQueryBidDt'),
        FilterSupplier: true,
      },
    ],
  },
  // 寻源结果导入 ---- 来源于寻源模块
  {
    path: '/ssrc/search-result-import',
    models: [],
    FilterSupplier: true,
    // 寻源结果导入查询列表
    components: [
      {
        path: '/ssrc/search-result-import/list',
        models: [
          () => import('../models/searchResultImport.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/SearchResultImport'),
        FilterSupplier: true,
      },
      // 寻源结果导入明细
      {
        path: '/ssrc/search-result-import/results-query-detail/:sourceHeaderId',
        models: [() => import('../models/resultsQuery.js'), () => import('../models/queryRfq.js')],
        component: () => import('../routes/ssrc/ResultsQuery/ResultsQueryDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 寻源结果导入 ---- 来源于新版价格库
  {
    path: '/ssrc/search-result-import-new',
    models: [],
    FilterSupplier: true,
    // 寻源结果导入查询列表
    components: [
      {
        path: '/ssrc/search-result-import-new/list',
        models: [
          () => import('../models/searchResultImportNew.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/SearchResultImportNew'),
        FilterSupplier: true,
      },
      // 寻源结果导入明细
      {
        path: '/ssrc/search-result-import-new/results-query-detail/:sourceHeaderId',
        models: [() => import('../models/resultsQuery.js'), () => import('../models/queryRfq.js')],
        component: () => import('../routes/ssrc/ResultsQuery/ResultsQueryDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 供应商报价汇总查询
  {
    path: '/ssrc/supplier-quotation-summary-query',
    models: [],
    FilterSupplier: true,
    // 供应商报价汇总查询列表
    components: [
      {
        path: '/ssrc/supplier-quotation-summary-query/list',
        models: [
          () => import('../models/supQuoSumQuery.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupQuoSumQuery'),
        FilterSupplier: true,
      },
    ],
  },
  // 价格库
  {
    path: '/ssrc/price-library',
    models: [],
    FilterSupplier: true,
    // 价格库查询列表
    components: [
      {
        path: '/ssrc/price-library/list',
        models: [
          () => import('../models/priceLibrary.js'),
          () => import('../models/searchResultImport.js'),
        ],
        component: () => import('../routes/ssrc/PriceLibrary'),
        FilterSupplier: true,
      },
      // 价格库-手工创建&更新
      {
        path: '/ssrc/price-library/lib-update',
        models: [() => import('../models/priceLibrary.js')],
        component: () => import('../routes/ssrc/PriceLibrary/Update'),
        FilterSupplier: true,
      },
      // 价格库-手工创建&更新 价格库变更申请单号详情
      {
        path: '/ssrc/price-library/detail/:priceLibraryDocId',
        models: [() => import('../models/priceLibrary.js')],
        component: () => import('../routes/ssrc/PriceLibrary/Update/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/pub/ssrc/price-library/detail/:priceLibraryDocId',
        models: [() => import('../models/priceLibrary.js')],
        component: () => import('../routes/ssrc/PriceLibrary/Update/Detail'),
        authorized: true,
        FilterSupplier: true,
      },
    ],
  },
  // 价格库导入
  {
    path: '/ssrc/price-library/comment-import/:code',
    models: [],
    component: () => import('../routes/himp/CommentImport'),
    FilterSupplier: true,
  },
  // 线下询价结果录入
  {
    path: '/ssrc/offline-result-entry',
    models: [],
    FilterSupplier: true,
    // 线下询价结果录入列表
    components: [
      {
        path: '/ssrc/offline-result-entry/list',
        models: [
          // () => import('../models/offlineResultEntry.js'),
          () => import('../models/offlineResultEntryInquiry.js'),
        ],
        component: () => import('../routes/ssrc/OfflineResultEntry'),
        FilterSupplier: true,
      },
      // 线下询价结果录入明细
      {
        path: '/ssrc/offline-result-entry/detail/:rfxId',
        models: [
          // () => import('../models/offlineResultEntry.js'),
          () => import('../models/offlineResultEntryInquiry.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/OfflineResultEntry/Detail'),
        FilterSupplier: true,
      },
      // 核价
      {
        path: '/ssrc/offline-result-entry/check-price/:rfxId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHallOffine.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPrice/NewIndex.js'),
        FilterSupplier: true,
      },
      // 批量导入
      {
        authorized: true,
        path: '/ssrc/offline-result-entry/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
    ],
  },
  // 线下招标结果录入
  {
    path: '/ssrc/bid-offline-result-entry',
    models: [],
    FilterSupplier: true,
    // 线下询价结果录入列表
    components: [
      {
        path: '/ssrc/bid-offline-result-entry/list',
        models: [
          // () => import('../models/offlineResultEntry.js'),
          () => import('../models/offlineResultEntryBid.js'),
        ],
        component: () => import('../routes/ssrc/OfflineResultEntry/BidIndex'),
        FilterSupplier: true,
      },
      // 线下询价结果录入明细
      {
        path: '/ssrc/bid-offline-result-entry/detail/:rfxId',
        models: [
          // () => import('../models/offlineResultEntry.js'),
          () => import('../models/offlineResultEntryBid.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/OfflineResultEntry/Detail/BidIndex'),
        FilterSupplier: true,
      },
      // 核价
      {
        path: '/ssrc/bid-offline-result-entry/check-price/:rfxId',
        models: [
          () => import('../models/newBidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotation.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/CheckPrice/NewIndexBID'),
        FilterSupplier: true,
      },
      // 批量导入
      // {
      //   authorized: true,
      //   path: '/ssrc/bid-offline-result-entry/comment-import/:code',
      //   models: [],
      //   component: () => import('../routes/himp/CommentImport'),
      //   FilterSupplier: true,
      // },
    ],
  },

  /*
   * 采购方-资格审查
   */
  // 资格审查
  {
    path: '/ssrc/qualification-examination',
    models: [],
    FilterSupplier: true,
    // 资格审查列表
    components: [
      {
        path: '/ssrc/qualification-examination/list',
        models: [() => import('../models/qualificationExamination.js')],
        component: () => import('../routes/ssrc/QualificationExamination'),
        FilterSupplier: true,
      },
      // 资格审查明细
      {
        path: '/ssrc/qualification-examination/detail/:rfxId',
        models: [() => import('../models/qualificationExamination.js')],
        component: () => import('../routes/ssrc/QualificationExamination/Detail'),
        FilterSupplier: true,
      },
      // 资格审查明细-分标段
      {
        path: '/ssrc/qualification-examination/section-detail/:prequalGroupHeaderId',
        models: [() => import('../models/qualificationExamination.js')],
        component: () => import('../routes/ssrc/QualificationExamination/SectionDetail'),
        FilterSupplier: true,
      },
      // 资格审查跳转rfx详情页
      {
        path: '/ssrc/qualification-examination/rfx-detail/:rfxId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/QualificationExamination/SrcDetail'),
        FilterSupplier: true,
      },
      // 资格审查跳转bid详情页
      {
        path: '/ssrc/qualification-examination/bid-detail/:bidId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/bidHall.js'),
        ],
        component: () => import('../routes/ssrc/QualificationExamination/BidDetail'),
        FilterSupplier: true,
      },
      // TODO 现阶段资格预审没有工作流，二开需要(分标段暂时不涉及)，就使用了标准的明细做，后期如果标准有的话也建议使用
      // 资格审查明细-工作流
      {
        path: '/pub/ssrc/qualification-examination/detail/:rfxId',
        models: [
          () => import('../models/qualificationExamination.js'),
          () => import('../models/qualificationExaminationPub'),
        ],
        component: () => import('../routes/ssrc/QualificationExamination/Detail/PubIndex'),
        FilterSupplier: true,
        authorized: true,
      },
      // 资格审查明细-分标段-工作流
      // {
      //   path: '/pub/ssrc/qualification-examination/section-detail/:prequalGroupHeaderId',
      //   models: [() => import('../models/qualificationExamination.js')],
      //   component: () => import('../routes/ssrc/QualificationExamination/SectionDetail'),
      //   FilterSupplier: true,
      //   authorized: true,
      // },
    ],
  },

  /**
   * 采购方-项目信息-招标计划
   */
  // 招标计划维护
  {
    path: '/ssrc/plan-update',
    models: [],
    FilterSupplier: true,
    // 招标计划维护查询
    components: [
      {
        path: '/ssrc/plan-update/list',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/PlanUpdate'),
        FilterSupplier: true,
      },
      // 招标计划维护明细
      {
        path: '/ssrc/plan-update/detail/:bidPlanId',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/PlanUpdate/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/plan-update/create',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/PlanUpdate/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 招标计划查询
  {
    path: '/ssrc/plan-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/plan-query/list',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/PlanQuery'),
        FilterSupplier: true,
      },
    ],
  },
  // 项目信息
  {
    path: '/ssrc/project-maintenance',
    FilterSupplier: true,
    models: [],
    // 项目信息维护列表
    components: [
      {
        path: '/ssrc/project-maintenance/list',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/ProjectInfo'),
        FilterSupplier: true,
      },
      // 项目信息维护明细
      {
        path: '/ssrc/project-maintenance/project-detail/:projectId',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/ProjectInfo/Detail/ProjectInfoForm'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/project-maintenance/create',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/ProjectInfo/Detail/ProjectInfoForm'),
        FilterSupplier: true,
      },
      {
        path: '/pub/ssrc/project-maintenance/project-read/:projectId',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/ProjectInfo/Read'),
        FilterSupplier: true,
        authorized: true,
      },
      {
        path: '/ssrc/project-maintenance/project-read/:projectId',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/ProjectInfo/Read'),
        FilterSupplier: true,
      },
      // 项目信息维护明细-不确定是否有项目使用个性化
      {
        path: '/pub/ssrc/project-maintenance/project-view/:projectId',
        models: [() => import('../models/tenderPlan.js')],
        component: () => import('../routes/ssrc/TenderPlan/ProjectInfo/View'),
        FilterSupplier: true,
        authorized: true,
      },
    ],
  },
  /**
   * 招标 - 保证金模块
   */
  // 保证金维护
  {
    path: '/ssrc/deposit-manage',
    models: [],
    FilterSupplier: true,
    components: [
      // 保证金列表
      {
        path: '/ssrc/deposit-manage/list',
        models: [
          () => import('../models/depositManage.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/DepositManage'),
        FilterSupplier: true,
      },
      // 保证金详情
      {
        path: '/ssrc/deposit-manage/detail/:sourceId',
        models: [
          () => import('../models/depositManage.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/DepositManage/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * 供应商-报价/竞价
   */
  // 报价竞价
  {
    path: '/ssrc/supplier-quotation',
    models: [],
    // 供应商报价入口
    components: [
      {
        path: '/ssrc/supplier-quotation/list',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/SupplierQuotation'),
      },
      // 供应商报价明细
      {
        path: '/ssrc/supplier-quotation/detail/:rfxId/:companyId/:type',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/Detail'),
      },
      // 评审澄清(供应商报价)
      {
        path: '/ssrc/supplier-quotation/review-clarification',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/SupplierQuotation/ReviewClarification'),
      },
      // 供应商问题新建
      {
        path: '/ssrc/supplier-quotation/question-create',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Create'),
      },
      // 供应商问题查看
      {
        path: '/ssrc/supplier-quotation/question-details',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Details'),
      },
      // 澄清答疑详情(供应商报价)
      {
        path: '/ssrc/supplier-quotation/review-clarification-clarification/:clarifyId',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Clarification/Details'),
      },
      // 评审澄清详情(供应商报价)
      {
        path: '/ssrc/supplier-quotation/review-clarification-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReviewClarification.js'),
      },
      // 评审澄清问题回复(供应商报价)
      {
        path: '/ssrc/supplier-quotation/review-clarification-pending-reply',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PendingReply'),
      },
      // 评审澄清问题详情(供应商报价)
      {
        path: '/ssrc/supplier-quotation/review-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReplayDetail.js'),
      },
      // 价格澄清问题回复-维护
      {
        path: '/ssrc/supplier-quotation/price-clarification-replay-update',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Update'),
      },
      // 价格澄清问题回复-明细
      {
        path: '/ssrc/supplier-quotation/price-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Detail'),
      },
      // 供应商报价-进行报价
      {
        path: '/ssrc/supplier-quotation/inquiry-price/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/InquiryPrice'),
      },
      // 供应商报价 excel批量导入
      {
        path: '/ssrc/supplier-quotation/inquiry-price/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
      },
      // 供应商报价-进行竞价
      {
        path: '/ssrc/supplier-quotation/bidding-offer/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/BiddingOffer'),
      },
      // 供应商竞价 excel批量导入
      {
        path: '/ssrc/supplier-quotation/bidding-offer/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
      },
      // 路由pub改造，嵌套使用
      {
        path: '/pub/ssrc/supplier-quotation/list',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/SupplierQuotation'),
        authorized: true,
      },
      // 供应商报价明细
      {
        path: '/pub/ssrc/supplier-quotation/detail/:rfxId/:companyId/:type',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/Detail'),
        authorized: true,
      },
      // 评审澄清(供应商报价)
      {
        path: '/pub/ssrc/supplier-quotation/review-clarification',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/SupplierQuotation/ReviewClarification'),
        authorized: true,
      },
      // 供应商问题新建
      {
        path: '/pub/ssrc/supplier-quotation/question-create',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Create'),
        authorized: true,
      },
      // 供应商问题查看
      {
        path: '/pub/ssrc/supplier-quotation/question-details',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Details'),
        authorized: true,
      },
      // 澄清答疑详情(供应商报价)
      {
        path: '/pub/ssrc/supplier-quotation/review-clarification-clarification/:clarifyId',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Clarification/Details'),
        authorized: true,
      },
      // 评审澄清详情(供应商报价)
      {
        path: '/pub/ssrc/supplier-quotation/review-clarification-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReviewClarification.js'),
        authorized: true,
      },
      // 评审澄清问题回复(供应商报价)
      {
        path: '/pub/ssrc/supplier-quotation/review-clarification-pending-reply',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PendingReply'),
        authorized: true,
      },
      // 评审澄清问题详情(供应商报价)
      {
        path: '/pub/ssrc/supplier-quotation/review-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReplayDetail.js'),
        authorized: true,
      },
      // 价格澄清问题回复-维护
      {
        path: '/pub/ssrc/supplier-quotation/price-clarification-replay-update',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Update'),
        authorized: true,
      },
      // 价格澄清问题回复-明细
      {
        path: '/pub/ssrc/supplier-quotation/price-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Detail'),
        authorized: true,
      },
      // 供应商报价-进行报价
      {
        path: '/pub/ssrc/supplier-quotation/inquiry-price/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/InquiryPrice'),
        authorized: true,
      },
      // 供应商报价 excel批量导入
      {
        path: '/pub/ssrc/supplier-quotation/inquiry-price/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
      },
      // 供应商报价-进行竞价
      {
        path: '/pub/ssrc/supplier-quotation/bidding-offer/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/BiddingOffer'),
        authorized: true,
      },
      // 供应商竞价 excel批量导入
      {
        path: '/pub/ssrc/supplier-quotation/bidding-offer/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        authorized: true,
      },
    ],
  },
  {
    path: '/ssrc/bid-supplier-reply',
    models: [],
    // 供应商投标入口
    components: [
      {
        path: '/ssrc/bid-supplier-reply/list',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/RFSupplierQuotation/BidIndex'),
      },
      {
        path: '/ssrc/bid-supplier-reply/query-quotation/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationNewBid.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/NewBidIndex'),
      },
      // 供应商投标明细
      {
        path: '/ssrc/bid-supplier-reply/detail/:rfxId/:companyId/:type',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationNewBid.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/Detail/BidIndex'),
      },
      // 供应商投标-进行投标
      {
        path: '/ssrc/bid-supplier-reply/inquiry-price/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationNewBid.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/InquiryPrice/BidIndex'),
      },
      // // 供应商投标-进行竞价
      // {
      //   path: '/ssrc/bid-supplier-reply/bidding-offer/:rfxId',
      //   models: [
      //     () => import('../models/supplierQuotation.js'),
      //     () => import('../models/importExcel.js'),
      //     () => import('../models/quotationTemplate.js'),
      //     () => import('../models/quotationDetail.js'),
      //   ],
      //   component: () => import('../routes/ssrc/SupplierQuotation/BiddingOffer'),
      // },
      // 评审澄清(供应商投标)
      {
        path: '/ssrc/bid-supplier-reply/review-clarification',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/SupplierQuotation/ReviewClarification/BindIndex'),
      },
      // 供应商问题新建
      {
        path: '/ssrc/bid-supplier-reply/question-create',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Create/BidIndex'),
      },
      // 供应商问题查看
      {
        path: '/ssrc/bid-supplier-reply/question-details',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Details/BidIndex'),
      },
      // 澄清答疑详情(供应商投标)
      {
        path: '/ssrc/bid-supplier-reply/review-clarification-clarification/:clarifyId',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import(
            '../routes/ssrc/SupplierQuotation/ReviewClarification/Clarification/Details/BidIndex'
          ),
      },
      // 评审澄清详情(供应商投标)
      {
        path: '/ssrc/bid-supplier-reply/review-clarification-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReviewClarification.js'),
      },
      // 评审澄清问题回复(供应商投标)
      {
        path: '/ssrc/bid-supplier-reply/review-clarification-pending-reply',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PendingReply'),
      },
      // 评审澄清问题详情(供应商投标)
      {
        path: '/ssrc/bid-supplier-reply/review-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReplayDetail.js'),
      },
      // 价格澄清问题回复-维护
      {
        path: '/ssrc/bid-supplier-reply/price-clarification-replay-update',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Update/BidIndex'),
      },
      // 价格澄清问题回复-明细
      {
        path: '/ssrc/bid-supplier-reply/price-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Detail/BidIndex'),
      },
      // 新报价-参与
      {
        path: '/ssrc/bid-supplier-reply/apply/:rfxHeaderId/:supplierCompanyId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/Apply/BidIndex'),
      },
      // 新报价
      {
        path: '/ssrc/bid-supplier-reply/quotation/:quotationHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/Quotation/BidIndex'),
      },
      // 新报价-历史版本
      {
        path: '/ssrc/bid-supplier-reply/history-version/:quotationHeaderRecordId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/QueryDetail/BidIndex'),
      },
      // 新报价-报价查询
      {
        path: '/ssrc/bid-supplier-reply/query/:quotationHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/QueryDetail/BidIndex'),
      },
      // 新报价-报价查询-外部使用
      {
        path: '/pub/ssrc/bid-supplier-reply/query/:quotationHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/QueryDetail/BidIndex'),
        authorized: true,
      },
    ],
  },
  /**
   * 供应商-回复 RFI/RFP
   */
  {
    path: '/ssrc/supplier-reply',
    models: [],
    // 供应商报价入口
    components: [
      {
        path: '/ssrc/supplier-reply/list',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/RFSupplierQuotation'),
      },
      // 报价查询-报价明细
      {
        path: '/ssrc/supplier-reply/query-quotation/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationSupplierReply.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/supplierReplyIndex.js'),
      },
      // 供应商报价明细
      {
        path: '/ssrc/supplier-reply/detail/:rfxId/:companyId/:type',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/Detail'),
      },
      // 供应商报价-进行报价
      {
        path: '/ssrc/supplier-reply/inquiry-price/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/InquiryPrice'),
      },
      // 供应商报价-进行竞价
      {
        path: '/ssrc/supplier-reply/bidding-offer/:rfxId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/importExcel.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/BiddingOffer'),
      },
      // 新报价-参与
      {
        path: '/ssrc/supplier-reply/apply/:rfxHeaderId/:supplierCompanyId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/Apply'),
      },
      // 新报价
      {
        path: '/ssrc/supplier-reply/quotation/:quotationHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/Quotation'),
      },
      // 新报价-历史版本
      {
        path: '/ssrc/supplier-reply/history-version/:quotationHeaderRecordId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/QueryDetail'),
      },
      // 新报价-报价查询
      {
        path: '/ssrc/supplier-reply/query/:quotationHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/QueryDetail'),
      },
      // 新报价-报价查询-外部使用
      {
        path: '/pub/ssrc/supplier-reply/query/:quotationHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/QueryDetail'),
        authorized: true,
      },
      // RFI RFP参与
      {
        path: '/ssrc/supplier-reply/participate/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFI'),
      },
      {
        path: '/ssrc/supplier-reply/participate/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFP'),
      },
      // RF供应商参与-详情
      {
        path: '/ssrc/supplier-reply/participate-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFI'),
      },
      {
        path: '/ssrc/supplier-reply/participate-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFP'),
      },
      // RFI/RFP 历史版本详情
      {
        path: '/ssrc/supplier-reply/rf/detail/RFI/:rfHeaderId/:quotationHeaderVersionId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/historyDetail/indexRFI'),
        authorized: true,
      },
      {
        path: '/ssrc/supplier-reply/rf/detail/RFP/:rfHeaderId/:quotationHeaderVersionId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/historyDetail/indexRFP'),
        authorized: true,
      },
      // RF供应商回复
      {
        path: '/ssrc/supplier-reply/reply/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFI'),
      },
      {
        path: '/ssrc/supplier-reply/reply/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFP'),
      },
      // RF供应商回复-详情
      {
        path: '/ssrc/supplier-reply/reply-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFI'),
      },
      {
        path: '/ssrc/supplier-reply/reply-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFP'),
      },
      // 评审澄清(供应商报价)
      {
        path: '/ssrc/supplier-reply/review-clarification',
        models: [() => import('../models/supplierQuotation.js')],
        component: () => import('../routes/ssrc/SupplierQuotation/ReviewClarification'),
      },
      // 供应商问题新建
      {
        path: '/ssrc/supplier-reply/question-create',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Create'),
      },
      // 供应商问题查看
      {
        path: '/ssrc/supplier-reply/question-details',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Maintain/Details'),
      },
      // 澄清答疑详情(供应商报价)
      {
        path: '/ssrc/supplier-reply/review-clarification-clarification/:clarifyId',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/Clarification/Details'),
      },
      // 评审澄清详情(供应商报价)
      {
        path: '/ssrc/supplier-reply/review-clarification-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReviewClarification.js'),
      },
      // 评审澄清问题回复(供应商报价)
      {
        path: '/ssrc/supplier-reply/review-clarification-pending-reply',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PendingReply'),
      },
      // 评审澄清问题详情(供应商报价)
      {
        path: '/ssrc/supplier-reply/review-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/ReplayDetail.js'),
      },
      // 价格澄清问题回复-维护
      {
        path: '/ssrc/supplier-reply/price-clarification-replay-update',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Update'),
      },
      // 价格澄清问题回复-明细
      {
        path: '/ssrc/supplier-reply/price-clarification-replay-detail',
        models: [() => import('../models/supplierQuotation.js')],
        component: () =>
          import('../routes/ssrc/SupplierQuotation/ReviewClarification/PriceReply/Detail'),
      },
      // 供应商报价明细
      {
        path: '/ssrc/supplier-reply/detail/:rfxId/:companyId/:type',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/SupplierQuotation/Detail'),
      },
      // 竞价大厅(供应商)-竞价现场
      {
        path: '/pub/ssrc/supplier-reply/bidding-hall/:rfxLineSupplierId/:biddingTarget',
        models: [],
        component: () => import('../routes/ssrc/BiddingHall/Supplier'),
        authorized: true,
      },
    ],
  },
  // 报价查询
  {
    path: '/ssrc/query-quotation',
    models: [],
    // 报价查询
    components: [
      {
        path: '/ssrc/query-quotation/list',
        models: [() => import('../models/queryQuotation.js')],
        component: () => import('../routes/ssrc/QueryQuotation'),
      },
      // 报价明细
      {
        path: '/ssrc/query-quotation/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail'),
      },
      // 路由pub改造，嵌套使用
      {
        path: '/pub/ssrc/query-quotation/list',
        models: [() => import('../models/queryQuotation.js')],
        component: () => import('../routes/ssrc/QueryQuotation'),
        authorized: true,
      },
      // 报价明细
      {
        path: '/pub/ssrc/query-quotation/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationPub.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/PubIndex.js'),
        authorized: true,
      },
    ],
  },

  /**
   * 采购方-专家库()
   */
  // 专家注册申请
  {
    path: '/ssrc/expert-requisition',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-requisition/list',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Requisition'),
        FilterSupplier: true,
      },
      // 批量导入
      {
        authorized: true,
        path: '/ssrc/expert-requisition/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-requisition/detail/:expertReqId',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Requisition/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-requisition/read-only-detail/:expertReqId',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Requisition/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-requisition/create',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Requisition/Detail'),
      },
    ],
  },
  // 专家信息维护(管理员)
  {
    path: '/ssrc/expert-maintenace',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-maintenace/list',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Maintenace'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-maintenace/detail/:expertId',
        models: [() => import('../models/expert.js'), () => import('../models/expertMaintence.js')],
        component: () => import('../routes/ssrc/Expert/Maintenace/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 注册申请审批
  {
    path: '/ssrc/expert-approve',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-approve/list',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Approve'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-approve/detail/:expertReqId',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Approve/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 注册申请查询
  {
    path: '/ssrc/expert-reqQuery',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-reqQuery/list',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/ReqQuery'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-reqQuery/detail/:expertReqId',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Approve/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 专家信息查询
  {
    path: '/ssrc/expert-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-query/list',
        models: [() => import('../models/expert.js')],
        component: () => import('../routes/ssrc/Expert/Query'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/expert-query/detail/:expertId',
        models: [() => import('../models/expert.js'), () => import('../models/expertQuery.js')],
        component: () => import('../routes/ssrc/Expert/Query/Detail'), // 【山鹰】新增二开审批表单，用此路由
        FilterSupplier: true,
      },
    ],
  },
  // 专家信息维护(个人)
  {
    path: '/ssrc/expert-personal',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-personal',
        models: [() => import('../models/expert.js'), () => import('../models/expertPersonal.js')],
        component: () => import('../routes/ssrc/Expert/Personal'),
        FilterSupplier: true,
      },
    ],
  },
  // 评分模板
  {
    path: '/ssrc/score',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/score/list',
        models: [() => import('../models/score.js')],
        component: () => import('../routes/ssrc/Score'),
        FilterSupplier: true,
      },
      // 批量导入
      {
        authorized: true,
        path: '/ssrc/score/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/score/elements/detail/:indicateId',
        models: [() => import('../models/score.js')],
        component: () => import('../routes/ssrc/Score/Elements/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/score/detail/:templateId',
        models: [() => import('../models/score.js')],
        component: () => import('../routes/ssrc/Score/Template/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 评分方法
  {
    path: '/ssrc/evaluation',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/evaluation/list',
        models: [() => import('../models/evaluation.js')],
        component: () => import('../routes/ssrc/Evaluation'),
        FilterSupplier: true,
      },
    ],
  },
  // 报价模板
  {
    path: '/ssrc/quotation-template',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/quotation-template/list',
        models: [() => import('../models/quotationTemplate.js')],
        component: () => import('../routes/ssrc/QuotationTemplate'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/quotation-template/detail/:templateId',
        models: [() => import('../models/quotationTemplate.js')],
        component: () => import('../routes/ssrc/QuotationTemplate/TemplateDetailDrawer'),
        FilterSupplier: true,
      },
    ],
  },

  // 报价模板
  {
    path: '/ssrc/new-quotation-template',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/new-quotation-template/list',
        component: () => import('../routes/ssrc/QuotationTemplateNew'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/new-quotation-template/update',
        component: () => import('../routes/ssrc/QuotationTemplateNew/Update'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/new-quotation-template/detail/:templateId',
        component: () => import('../routes/ssrc/QuotationTemplateNew/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * ******************************************************************************************
   * sbid router
   */

  // 采购商-招标大厅
  {
    path: '/ssrc/bid-hall',
    models: [],
    FilterSupplier: true,
    // 采购商招标大厅列表
    components: [
      {
        path: '/ssrc/bid-hall/list',
        models: [() => import('../models/bidHall.js'), () => import('../models/commonModel.js')],
        component: () => import('../routes/sbid/BidHall'),
        FilterSupplier: true,
      },
      // 申请转招标
      {
        path: '/ssrc/bid-hall/apply-to-inquiry',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ApplyToInquiry'),
        FilterSupplier: true,
      },
      // 采购商招标维护
      {
        path: '/ssrc/bid-hall/bid-update/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/BidHall/Update'),
        FilterSupplier: true,
      },
      // 招标大厅跳转寻源立项明细
      {
        path: '/ssrc/bid-hall/project-setup/detail/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Update'),
        FilterSupplier: true,
      },
      // 批量导入
      {
        authorized: true,
        path: '/ssrc/bid-hall/bid-update/comment-import/:code',
        models: [],
        component: () => import('../routes/himp/CommentImport'),
        FilterSupplier: true,
      },
      // 采购商定标管理
      {
        path: '/ssrc/bid-hall/calibration-managementnot/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidHall/TargetMange'),
        FilterSupplier: true,
      },
      // 采购商定标管理
      {
        path: '/pub/ssrc/bid-hall/calibration-managementnot/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        authorized: true,
        component: () => import('../routes/sbid/BidHall/TargetMange'),
        FilterSupplier: true,
      },
      // 采购商定标管理区分标段
      {
        path: '/ssrc/bid-hall/calibration-managementyes/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidHall/DiffTargetMange'),
        FilterSupplier: true,
      },
      // 采购商定标管理区分标段
      {
        path: '/pub/ssrc/bid-hall/calibration-managementyes/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        authorized: true,
        component: () => import('../routes/sbid/BidHall/DiffTargetMange'),
        FilterSupplier: true,
      },
      // 采购方澄清函维护tab
      {
        path: '/ssrc/bid-hall/inter-question/:sourceId/:bidNum/:bidTitle/:companyId/:flag',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Question'),
        FilterSupplier: true,
      },
      // 采购方引入问题详情查看
      {
        path: '/ssrc/bid-hall/question-details/:issueHeaderId/:bidNum/:bidTitle/:companyId',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Question/IssueDetails'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览创建
      {
        path: '/ssrc/bid-hall/clarify-create/:sourceId/:bidTitle/:bidNum/:companyId',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 采购方澄清函查看
      {
        path: '/ssrc/bid-hall/clarification-view/:sourceId/:bidNum/:bidTitle/:companyId/:flag',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ClarificationView'),
        FilterSupplier: true,
      },
      // 采购方澄清函查看详情
      {
        path: '/ssrc/bid-hall/clarification-view/detail/:sourceId/:bidNum/:bidTitle',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ClarificationView/Detail'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览维护
      {
        path: '/ssrc/bid-hall/clarify-update/:sourceId/:bidNum/:bidTitle/:companyId/:clarifyId',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 引用问题跳转问题详情
      {
        path: '/ssrc/bid-hall/issue-create/:sourceId/:bidTitle/:bidNum/:companyId/:selectId',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Clarify/Create'),
        FilterSupplier: true,
      },
      // 采购方澄清函预览详情
      {
        path: '/ssrc/bid-hall/clarify-detail/:sourceId/:bidNum/:bidTitle/:companyId/:clarifyId',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Clarify/Detail'),
        FilterSupplier: true,
      },
      // 采购商招标明细
      {
        path: '/ssrc/bid-hall/bid-detail/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/bidEventQuery.js'),
        ],
        component: () => import('../routes/sbid/BidHall/Detail'),
        FilterSupplier: true,
      },
      // 采购商招标明细
      {
        path: '/pub/ssrc/bid-hall/bid-detail/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/bidEventQuery.js'),
        ],
        authorized: true,
        component: () => import('../routes/sbid/BidHall/Detail'),
        FilterSupplier: true,
      },
      // 采购方澄清函查看
      {
        path: '/pub/ssrc/bid-hall/clarification-view/:sourceId/:bidNum/:bidTitle/:companyId/:flag',
        models: [() => import('../models/bidHall.js')],
        authorized: true,
        component: () => import('../routes/sbid/BidHall/ClarificationView'),
        FilterSupplier: true,
      },
      // 采购方澄清函查看详情
      {
        path: '/pub/ssrc/bid-hall/clarification-view/detail/:sourceId/:bidNum/:bidTitle',
        models: [() => import('../models/bidHall.js')],
        authorized: true,
        component: () => import('../routes/sbid/BidHall/ClarificationView/Detail'),
        FilterSupplier: true,
      },
      // 手工创建招标书
      {
        path: '/ssrc/bid-hall/create',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/Create'),
        FilterSupplier: true,
      },
      // 评标管理评分结果确认tab - LZJ排查代码，实际进不去
      {
        path: '/ssrc/bid-hall/bid-evaluation/:bidId',
        models: [() => import('../models/bidHall.js'), () => import('../models/inquiryHall.js')],
        component: () => import('../routes/sbid/BidHall/EvaluationDetail'),
        FilterSupplier: true,
      },
      // 评标过程管理-lzj排查代码，实际没用到
      {
        path: '/ssrc/bid-hall/bid-evaluation-proc-manage/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/sbid/BidHall/EvaluationProcManage'),
        FilterSupplier: true,
      },
      // 评审澄清管理（供应商入口）
      {
        path: '/ssrc/bid-hall/review-clarification',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification'),
        FilterSupplier: true,
      },
      // 澄清单详情（供应商入口）
      {
        path: '/ssrc/bid-hall/review-clarification-detail',
        models: [() => import('../models/bidHall.js')],
        component: () =>
          import('../routes/sbid/BidHall/ReviewClarification/ReviewClarification.js'),
        FilterSupplier: true,
      }, // 澄清单回复详情（供应商入口）
      {
        path: '/ssrc/bid-hall/review-clarification-replay-detail',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification/ReplayDetail.js'),
        FilterSupplier: true,
      },
      // 评审澄清管理创建
      {
        path: '/ssrc/bid-hall/review-create',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification/Create'),
        FilterSupplier: true,
      },
      // 确认中标候选人
      {
        path: '/ssrc/bid-hall/confirm-bid-candidate/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidHall/ConfirmBidCandidate'),
        FilterSupplier: true,
      },
      // 确认中标候选人-查看投标书
      {
        path: '/ssrc/bid-hall/confirm-bid-candidate/bid-query-detail/:quotationHeaderId',
        models: [
          () => import('../models/supplierBidQuery.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierBidQueryBid'),
        ],
        component: () => import('../routes/sbid/SupplierBidQuery/BidDetail/BidIndex'),
        FilterSupplier: true,
      },
      // 回复
      {
        path: '/ssrc/bid-hall/clarification-replay',
        models: [() => import('../models/supplierBid.js')],
        component: () =>
          import('../routes/sbid/SupplierBid/Question/ReviewClarification/PendingReply'),
        FilterSupplier: true,
      },
      // 中标公告
      {
        path: '/ssrc/bid-hall/accept-bid-notice',
        models: [() => import('../models/bidNotice.js')],
        component: () => import('../routes/sbid/BidHall/AcceptBidNotice'),
        FilterSupplier: true,
      },
      // 招标公告
      {
        path: '/ssrc/bid-hall/bid-notice',
        // models: [() => import('../models/bidNotice.js')],
        component: () => import('../routes/sbid/BidHall/BidNotice/indexNew'),
        FilterSupplier: true,
      },
      {
        path: '/public/ssrc/bid-hall/bid-notice',
        // models: [() => import('../models/bidNotice.js')],
        component: () => import('../routes/sbid/BidHall/BidNotice/indexNew'),
        FilterSupplier: true,
        authorized: true,
      },
      {
        path: '/pub/ssrc/bid-hall/close-approval/:bidHeaderId',
        models: [],
        authorized: true,
        component: () => import('../routes/sbid/BidHall/Approval'),
        FilterSupplier: true,
      },
    ],
  },
  // 中标公告预览
  {
    path: '/ssrc/bid-hall/accept-bid-notice-detail',
    // models: [() => import('../models/bidNotice.js')],
    component: () => import('../routes/sbid/BidHall/AcceptBidNotice/DetailNew'),
    authorized: true,
  },
  {
    path: '/public/ssrc/bid-hall/accept-bid-notice-detail',
    // models: [() => import('../models/bidNotice.js')],
    component: () => import('../routes/sbid/BidHall/AcceptBidNotice/DetailNew'),
    authorized: true,
  },
  // 招标变更
  {
    path: '/ssrc/bid-change',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/bid-change/list', // 招标变更列表
        models: [() => import('../models/bidChange.js')],
        component: () => import('../routes/sbid/BidChange'),
        FilterSupplier: true,
      },
      {
        // authorized: true,
        path: '/ssrc/bid-change/detail/:bidId', // 招标变更详情
        models: [
          () => import('../models/bidChange.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/commonModel.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidChange/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 招标作业
  {
    path: '/ssrc/bid-task',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/bid-task/list', // 招标作业列表
        models: [() => import('../models/bidTask.js'), () => import('../models/commonModel.js')],
        component: () => import('../routes/sbid/BidTask'),
        FilterSupplier: true,
      },
      // 招标作业-操作页
      {
        path: '/ssrc/bid-task/task-action/:bidId/:bidRuleType/:templateScoreType',
        models: [() => import('../models/bidTask.js')],
        component: () => import('../routes/sbid/BidTask/TaskAction'),
        FilterSupplier: true,
      },
      // 招标作业-详情页
      {
        path: '/ssrc/bid-task/bid-detail/:bidId',
        models: [
          () => import('../models/bidTask.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidTask/Details'),
        FilterSupplier: true,
      },
      // 采购方澄清函查看详情
      {
        path:
          '/ssrc/bid-task/clarification-view/detail/:sourceId/:bidNum/:bidTitle/:companyId/:clarifyId',
        models: [() => import('../models/bidTask.js')],
        component: () => import('../routes/sbid/BidTask/ClarificationView/Detail'),
        FilterSupplier: true,
      },
      // 采购方澄清函查看
      {
        path: '/ssrc/bid-task/clarification-view/:sourceId/:bidNum/:bidTitle/:companyId/:flag',
        models: [() => import('../models/bidTask.js')],
        component: () => import('../routes/sbid/BidTask/ClarificationView'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * 供应商-供应商投标
   */
  {
    path: '/ssrc/supplier-bid-hall',
    models: [],
    // 供应商投标入口列表
    components: [
      {
        path: '/ssrc/supplier-bid-hall/list',
        models: [() => import('../models/supplierBid.js')],
        component: () => import('../routes/sbid/SupplierBid'),
      },
      // 供应商投标明细-type区分参与放弃
      {
        path: '/ssrc/supplier-bid-hall/detail/:bidId/:companyId/:type',
        models: [
          () => import('../models/supplierBid.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/SupplierBid/Detail'),
      },
      // 供应商投标明细-查看投标（收回投标）
      {
        path: '/ssrc/supplier-bid-hall/view/:quotationHeaderId',
        models: [
          () => import('../models/supplierBid.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/SupplierBid/View'),
      },
      // 供应商投标-投标
      {
        path: '/ssrc/supplier-bid-hall/bidDone/:quotationHeaderId',
        models: [
          () => import('../models/supplierBid.js'),
          () => import('../models/supplierQuotation.js'),
          () => import('../models/quotationTemplate.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/SupplierBid/Update'),
      },
      // 供应商澄清答疑
      {
        path: '/ssrc/supplier-bid-hall/question-list/:quotationHeaderId',
        models: [() => import('../models/supplierBid.js')],
        component: () => import('../routes/sbid/SupplierBid/Question'),
      },
      // 供应商问题详情
      {
        path: '/ssrc/supplier-bid-hall/question-details/:issueHeaderId',
        models: [() => import('../models/supplierBid.js')],
        component: () => import('../routes/sbid/SupplierBid/Question/Maintain/Details'),
      },
      // 供应商问题新建
      {
        path: '/ssrc/supplier-bid-hall/question-create',
        models: [() => import('../models/supplierBid.js')],
        component: () => import('../routes/sbid/SupplierBid/Question/Maintain/Create'),
      },
      // 澄清函详情
      {
        path: '/ssrc/supplier-bid-hall/clarification-details/:clarifyId',
        models: [() => import('../models/supplierBid.js')],
        component: () => import('../routes/sbid/SupplierBid/Question/Clarification/Details'),
      },
      // 澄清函详情
      {
        path: '/ssrc/supplier-bid-hall/clarification-replay',
        models: [() => import('../models/supplierBid.js')],
        component: () =>
          import('../routes/sbid/SupplierBid/Question/ReviewClarification/PendingReply'),
      },
      // 澄清单详情（供应商入口）
      {
        path: '/ssrc/supplier-bid-hall/supplier-review-clarification-detail',
        models: [() => import('../models/bidHall.js')],
        component: () =>
          import('../routes/sbid/BidHall/ReviewClarification/ReviewClarification.js'),
      },
      {
        path: '/ssrc/supplier-bid-hall/supplier-review-clarification-replay-detail',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification/ReplayDetail.js'),
      },
    ],
  },
  // 投标汇总查询
  {
    path: '/ssrc/supplier-bid-summary-query',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/supplier-bid-summary-query/list',
        models: [() => import('../models/quotationDetail.js')],
        component: () => import('../routes/sbid/SupplierBidSummaryQuery'),
        FilterSupplier: true,
      },
    ],
  },
  // 投标查询
  {
    path: '/ssrc/supplier-bid-query',
    models: [],
    // 供应商投标查询
    components: [
      {
        path: '/ssrc/supplier-bid-query/list',
        models: [() => import('../models/supplierBidQuery.js')],
        component: () => import('../routes/sbid/SupplierBidQuery'),
      },
      // 查看投标书
      {
        path: '/ssrc/supplier-bid-query/bid-detail/:quotationHeaderId',
        models: [
          () => import('../models/supplierBidQuery.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/SupplierBidQuery/BidDetail'),
      },
      // 查看招标书
      {
        path: '/ssrc/supplier-bid-query/tender-detail/:bidHeaderId/:supplierCompanyId',
        models: [
          () => import('../models/supplierBidQuery.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/SupplierBidQuery/TenderDetail'),
      },
      // 供应商澄清答疑查询
      {
        path: '/ssrc/supplier-bid-query/question-answer/:quotationHeaderId',
        models: [() => import('../models/supplierBidQuery.js')],
        component: () => import('../routes/sbid/SupplierBidQuery/QuestionQuery'),
      },
      // 供应商问题详情
      {
        path: '/ssrc/supplier-bid-query/question-details/:issueHeaderId',
        models: [() => import('../models/supplierBidQuery.js')],
        component: () => import('../routes/sbid/SupplierBidQuery/QuestionQuery/Question/Details'),
      },
      // 供应商澄清函详情
      {
        path: '/ssrc/supplier-bid-query/clarification-details/:clarifyId',
        models: [() => import('../models/supplierBidQuery.js')],
        component: () =>
          import('../routes/sbid/SupplierBidQuery/QuestionQuery/Clarification/Details'),
      },
      // 中标公告
      {
        path: '/ssrc/supplier-bid-query/accept-bid-notice',
        models: [() => import('../models/bidNotice.js')],
        component: () => import('../routes/sbid/BidHall/AcceptBidNotice'),
      },
    ],
  },

  /**
   * ssrc-sbid 公用模块 专家评分
   */
  {
    path: '/ssrc/expert-scoring',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/expert-scoring/list', // 招标作业列表
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring'),
        FilterSupplier: true,
      },
      // 专家评分修改
      {
        path:
          '/ssrc/expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/update',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Update'),
        FilterSupplier: true,
      },
      // 专家评分详情查看
      {
        path: '/ssrc/expert-scoring/detail/:sourceHeaderId/:expertId/:subjectMatterRule',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Update'),
        FilterSupplier: true,
      },
      // 专家评分详情查看
      {
        path: '/ssrc/expert-scoring/bid-detail/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/bidEventQuery.js'),
          () => import('../models/bidHallExpert'),
          () => import('../models/bidEventQueryExpert'),
        ],
        component: () => import('../routes/sbid/BidHall/Detail/ExpertIndex'),
        FilterSupplier: true,
      },
      // 寻源澄清管理列表（专家入口）
      {
        path: '/ssrc/expert-scoring/rfx-review-clarification',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallExpert.js'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/Entry/ExpertIndex.js'),
        FilterSupplier: true,
      },
      // 寻源答疑新建（专家入口）
      {
        path: '/ssrc/expert-scoring/rfx-review-clarification-create',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallExpert.js'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/Create/Entry/ExpertIndex.js'),
        FilterSupplier: true,
      },
      // 寻源澄清单详情（专家入口）
      {
        path: '/ssrc/expert-scoring/rfx-review-clarification-detail',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallExpert.js'),
        ],
        component: () =>
          import(
            '../routes/ssrc/InquiryHall/ReviewClarification/ReviewClarificationEntry/ExpertIndex.js'
          ),
        FilterSupplier: true,
      },
      // 寻源澄清单回复详情（专家入口）
      {
        path: '/ssrc/expert-scoring/rfx-review-clarification-replay-detail',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallExpert.js'),
        ],
        component: () =>
          import('../routes/ssrc/InquiryHall/ReviewClarification/ReplayDetailEntry/ExpertIndex.js'),
        FilterSupplier: true,
      },
      // 招标澄清管理列表（专家入口）
      {
        path: '/ssrc/expert-scoring/bid-review-clarification',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification'),
        FilterSupplier: true,
      },
      // 招标答疑新建（专家入口）
      {
        path: '/ssrc/expert-scoring/bid-review-clarification-create',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification/Create'),
        FilterSupplier: true,
      },
      // 招标澄清单详情（专家入口）
      {
        path: '/ssrc/expert-scoring/bid-review-clarification-detail',
        models: [() => import('../models/bidHall.js')],
        component: () =>
          import('../routes/sbid/BidHall/ReviewClarification/ReviewClarification.js'),
        FilterSupplier: true,
      },
      // 招标澄清单回复详情（专家入口）
      {
        path: '/ssrc/expert-scoring/bid-review-clarification-replay-detail',
        models: [() => import('../models/bidHall.js')],
        component: () => import('../routes/sbid/BidHall/ReviewClarification/ReplayDetail.js'),
        FilterSupplier: true,
      },
      // 澄清管理列表（专家入口）
      {
        path: '/ssrc/expert-scoring/review-clarification',
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring/ReviewClarification'),
        FilterSupplier: true,
      },
      // 澄清单详情（专家入口）
      {
        path: '/ssrc/expert-scoring/review-clarification-detail',
        models: [() => import('../models/expertScoring.js')],
        component: () =>
          import('../routes/sbid/ExpertScoring/ReviewClarification/ReviewClarification.js'),
        FilterSupplier: true,
      },
      // 澄清单回复详情（专家入口）
      {
        path: '/ssrc/expert-scoring/review-clarification-replay-detail',
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring/ReviewClarification/ReplayDetail.js'),
        FilterSupplier: true,
      },
      // 答疑新建（专家入口）
      {
        path: '/ssrc/expert-scoring/review-clarification-create',
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring/ReviewClarification/Create'),
        FilterSupplier: true,
      },
      // 回复
      {
        path: '/ssrc/expert-scoring/clarification-replay',
        models: [() => import('../models/supplierBid.js')],
        component: () =>
          import('../routes/sbid/SupplierBid/Question/ReviewClarification/PendingReply'),
        FilterSupplier: true,
      },
      // 专家评分跳转招标评分过程管理页面
      {
        path: '/ssrc/expert-scoring/bid-evaluation-proc-manage/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/sbid/BidHall/EvaluationProcManage'),
        FilterSupplier: true,
      },
      // 专家评分跳转招标评分管理评分结果确认tab
      {
        path: '/ssrc/expert-scoring/bid-evaluation/:bidId',
        models: [() => import('../models/bidHall.js'), () => import('../models/inquiryHall.js')],
        component: () => import('../routes/sbid/BidHall/EvaluationDetail'),
        FilterSupplier: true,
      },
      // 专家评分跳转确认中标候选人
      {
        path: '/ssrc/expert-scoring/confirm-bid-candidate/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidHall/ConfirmBidCandidate'),
        FilterSupplier: true,
      },
      // 专家评分跳转确认中标候选人-查看投标书
      {
        path: '/ssrc/expert-scoring/bid-query-detail/:quotationHeaderId',
        models: [
          () => import('../models/supplierBidQuery.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierBidQueryExpert'),
        ],
        component: () => import('../routes/sbid/SupplierBidQuery/BidDetail/ExpertIndex'),
        FilterSupplier: true,
      },
      // 专家评分跳转确认中标候选人-工作流
      {
        path: '/pub/ssrc/expert-scoring/workflow/bid/:sourceHeaderId',
        key: '/pub/ssrc/expert-scoring/workflow/bid/:sourceHeaderId',
        authorized: true,
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHallPub.js'),
        ],
        component: () => import('../routes/sbid/BidHall/ConfirmBidCandidate/BidWorkFlow'),
        FilterSupplier: true,
      },
      // 专家评分跳转寻源评分过程管理页面
      {
        path: '/ssrc/expert-scoring/rfx-evaluation-proc-manage/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallExpert'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/EvaluationProcManage/ExpertIndex'),
        FilterSupplier: true,
      },
      // 专家评分跳转寻源评分管理评分结果确认tab
      {
        path: '/ssrc/expert-scoring/rfx-evaluation/:sourceHeaderId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/bidHallExpert.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/inquiryHallExpert.js'),
          () => import('../models/expertScoring.js'),
          () => import('../models/priceComparison.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/RfxEvaluation/indexExpert'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转议价界面
      {
        path: '/ssrc/expert-scoring/rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainExpert.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/Entry/indexExpert.js'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转议价界面-new
      {
        path: '/ssrc/expert-scoring/new-rfx-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainExpert.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/BargainNew/Entry/indexExpert.js'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转新招标议价界面
      {
        path: '/ssrc/expert-scoring/bid-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainExpert.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/Bargain/Entry/indexExpertBid.js'),
        FilterSupplier: true,
      },
      // 专家评分的评分管理跳转新招标议价界面-new
      {
        path: '/ssrc/expert-scoring/new-bid-bargain/:rfxId',
        models: [
          () => import('../models/bargain.js'),
          () => import('../models/bargainExpert.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/BargainNew/Entry/indexExpertBid.js'),
        FilterSupplier: true,
      },
      // 专家评分跳转推荐成交候选人
      {
        path: '/ssrc/expert-scoring/confirm-candidate/:sourceHeaderId',
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate'),
        FilterSupplier: true,
      },
      // 专家评分跳转推荐成交候选人-工作流
      {
        path: '/pub/ssrc/expert-scoring/workFlow/rfx/:sourceHeaderId',
        authorized: true,
        models: [
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallNewPub.js'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/ConfirmCandidate/RfxWorkFlow'),
        FilterSupplier: true,
      },
      // 推荐成交候选人跳转询价单明细
      {
        path: '/ssrc/expert-scoring/rfx-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallExpert'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/ExpertIndex'),
        FilterSupplier: true,
      },
      // 推荐成交候选人跳转询价单明细
      {
        path: '/ssrc/expert-scoring/new-bid-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/inquiryHallExpert'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/ExpertBidIndex'),
        FilterSupplier: true,
      },
      // 推荐成交候选人、确认及汇总跳转报价查询详情
      {
        path: '/ssrc/expert-scoring/detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationExpert.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/ExpertIndex'),
        FilterSupplier: true,
      },
      // 推荐成交候选人、确认及汇总跳转投标查询详情（新招标）
      {
        path: '/ssrc/expert-scoring/bid-quotation-detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationExpertBid.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/ExpertBidIndex'),
        FilterSupplier: true,
      },
      // 专家评分 - 初步评审(符合性检查)
      {
        path:
          '/ssrc/expert-scoring/:sourceHeaderId/:expertUserId/:subjectMatterRule/:expertSequenceNum/:sourceFrom/initial-review',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/Review'),
        FilterSupplier: true,
      },
      // 专家评分价格澄清创建
      {
        path: '/ssrc/expert-scoring/price-clarification/list',
        models: [
          () => import('../models/expertScoring.js'),
          // () => import('../models/supplierQuotation.js'),
          // () => import('../models/inquiryHall.js'),
          // () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification'),
        FilterSupplier: true,
      },
      // 专家评分价格澄清create update
      {
        path: '/ssrc/expert-scoring/price-clarification/update',
        models: [
          () => import('../models/expertScoring.js'),
          // () => import('../models/supplierQuotation.js'),
          // () => import('../models/inquiryHall.js'),
          // () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/Update'),
        FilterSupplier: true,
      },
      // 专家评分价格澄清detail
      {
        path: '/ssrc/expert-scoring/price-clarification/detail',
        models: [
          () => import('../models/expertScoring.js'),
          // () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          // () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/Detail'),
        FilterSupplier: true,
      },
      // 查看招标书
      {
        path: '/ssrc/expert-scoring/view-bid/detail/:quotationHeaderId',
        models: [
          () => import('../models/supplierBidQuery.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierBidQueryExpert'),
        ],
        component: () => import('../routes/sbid/SupplierBidQuery/BidDetail/ExpertIndex'),
      },
      // RFP 明细
      {
        path: '/ssrc/expert-scoring/rf-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP'),
        FilterSupplier: true,
      },
      // RFI 明细
      {
        path: '/ssrc/expert-scoring/rf-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI'),
        FilterSupplier: true,
      },
      // RF回复详情
      {
        path: '/ssrc/expert-scoring/reply-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFI'),
      },
      {
        path: '/ssrc/expert-scoring/reply-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/newDetail/indexRFP'),
      },
      // RFI/RFP 历史版本详情
      {
        path: '/ssrc/expert-scoring/rf/detail/RFI/:rfHeaderId/:quotationHeaderVersionId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/historyDetail/indexRFI'),
        authorized: true,
      },
      {
        path: '/ssrc/expert-scoring/rf/detail/RFP/:rfHeaderId/:quotationHeaderVersionId',
        models: [],
        component: () => import('../routes/ssrc/RFSupplierQuotation/historyDetail/indexRFP'),
        authorized: true,
      },
    ],
  },

  /**
   * 采购商-招标事件查询
   */
  {
    path: '/ssrc/inquiry-bid-query',
    models: [],
    FilterSupplier: true,
    // 采购商招标事件查询列表
    components: [
      {
        path: '/ssrc/inquiry-bid-query/list',
        models: [
          () => import('../models/bidEventQuery.js'),
          () => import('../models/commonModel.js'),
        ],
        component: () => import('../routes/sbid/BidEventQuery'),
        FilterSupplier: true,
      },
      // 采购商招标维护
      {
        path: '/ssrc/inquiry-bid-query/bid-update/:bidId',
        models: [
          () => import('../models/bidHall.js'),
          () => import('../models/bidEventQuery.js'),
          () => import('../models/quotationDetail.js'),
        ],
        component: () => import('../routes/sbid/BidHall/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * 寻源立项
   */
  {
    path: '/ssrc/project-setup',
    models: [],
    FilterSupplier: true,
    // 采购商招标事件查询列表project-set
    components: [
      {
        path: '/ssrc/project-setup/list',
        models: [() => import('../models/projectSetup.js')],
        component: () => import('../routes/ssrc/ProjectSetup'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/project-setup/detail/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Update'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/project-setup/update/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Update'),
        FilterSupplier: true,
      },
      // 引用申请立项
      {
        path: '/ssrc/project-setup/quoteApproval',
        models: [() => import('../models/projectSetup.js')],
        component: () => import('../routes/ssrc/ProjectSetup/QuoteApproval'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * 寻源项目工作台
   */
  {
    path: '/ssrc/new-project-setup',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/new-project-setup/list',
        models: [],
        component: () => import('../routes/ssrc/ProjectSetupNew'),
        FilterSupplier: true,
        // authorized: true,
      },
      {
        path: '/ssrc/new-project-setup/detail/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Detail'),
        FilterSupplier: true,
      },
      // RFP 明细
      {
        path: '/ssrc/new-project-setup/rf-detail/RFP/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP'),
        FilterSupplier: true,
      },
      // RFI 明细
      {
        path: '/ssrc/new-project-setup/rf-detail/RFI/:rfHeaderId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI'),
        FilterSupplier: true,
      },
      // 询价单明细
      {
        path: '/ssrc/new-project-setup/rfx-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallProject'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/ProjectIndex'),
        FilterSupplier: true,
      },
      // 整单录入-详情
      {
        path: '/ssrc/new-project-setup/whole-detail/:rfxId',
        models: [],
        component: () => import('../routes/ssrc/InquiryHallNew/Whole/Detail'),
        FilterSupplier: true,
      },
      // 新招标明细
      {
        path: '/ssrc/new-project-setup/bid-detail/:rfxId',
        models: [
          () => import('../models/quotationController.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/bidHall.js'),
          () => import('../models/priceComparison.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/inquiryHallProject'),
        ],
        component: () => import('../routes/ssrc/InquiryHall/SrcDetail/ProjectBidIndex'),
        FilterSupplier: true,
      },
      // 手工立项
      {
        path: '/ssrc/new-project-setup/update/:sourceProjectId',
        models: [
          () => import('../models/projectSetup.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/ssrc/ProjectSetup/Update'),
        FilterSupplier: true,
      },
      // 引用申请立项
      {
        path: '/ssrc/new-project-setup/quoteApproval',
        models: [() => import('../models/projectSetup.js')],
        component: () => import('../routes/ssrc/ProjectSetup/QuoteApproval'),
        FilterSupplier: true,
      },
      // 推荐成交候选人、确认及汇总跳转报价查询详情
      {
        path: '/ssrc/new-project-setup/rfx-quotation-detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationProject.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/ProjectIndex'),
        FilterSupplier: true,
      },
      // 推荐成交候选人、确认及汇总跳转投标查询详情（新招标）
      {
        path: '/ssrc/new-project-setup/bid-quotation-detail/:rfxId/:companyId',
        models: [
          () => import('../models/supplierQuotation.js'),
          () => import('../models/inquiryHall.js'),
          () => import('../models/quotationDetail.js'),
          () => import('../models/supplierQuotationProjectBid.js'),
        ],
        component: () => import('../routes/ssrc/QueryQuotation/Detail/ProjectBidIndex'),
        FilterSupplier: true,
      },
      // 寻源项目c7n变更
      {
        path: '/ssrc/new-project-setup/sp-change/:sourceProjectId',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPChange'),
        FilterSupplier: true,
      },
      // 寻源醒目c7n明细
      {
        path: '/ssrc/new-project-setup/sp-detail/:sourceProjectId',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPDetail/indexDetail.js'),
        FilterSupplier: true,
      },
      // 寻源项目c7n发布审批
      {
        path: '/pub/ssrc/new-project-setup/sp-approval/:sourceProjectId',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPDetail/indexApproval.js'),
        FilterSupplier: true,
      },
      // 寻源项目c7n版本查看
      {
        path: '/ssrc/new-project-setup/sp-version/:sourceProjectId/:sourceProjectHistoryId',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPDetail/indexVersion.js'),
        FilterSupplier: true,
      },
      // 寻源项目c7n变更审批
      {
        path: '/pub/ssrc/new-project-setup/sp-change-approval/:sourceProjectId',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPChangeApprovalWF'),
        FilterSupplier: true,
        authorized: true,
      },
      // 寻源项目c7n新建
      {
        path: '/ssrc/new-project-setup/sp-update/create',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPUpdate'),
        FilterSupplier: true,
      },
      // 寻源项目c7n维护
      {
        path: '/ssrc/new-project-setup/sp-update/:sourceProjectId',
        component: () => import('../routes/ssrc/ProjectSetupNew/SPUpdate'),
        FilterSupplier: true,
      },
      // 申请转立项
      {
        path: '/ssrc/new-project-setup/apply-to-project',
        component: () => import('../routes/ssrc/ProjectSetupNew/ApplyToProject'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * 价格库维度平台
   */
  {
    path: '/ssrc/price-lib-dimension',
    models: [],
    components: [
      {
        path: '/ssrc/price-lib-dimension/list',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Sit'),
      },
      {
        path: '/ssrc/price-lib-dimension/update/:templateId',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Sit/Update'),
      },
    ],
  },

  /**
   * 价格库维度租户
   */
  {
    path: '/ssrc/price-lib-dimension-org',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/price-lib-dimension-org/list',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Org'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/price-lib-dimension-org/create',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Org/Update'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/price-lib-dimension-org/update/:templateId',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Org/Update'),
        FilterSupplier: true,
      },
      // 价格库模板-预览
      {
        path: '/ssrc/price-lib-dimension-org/preview/:templateCode',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Preview'),
        FilterSupplier: true,
      },
      // 价格库模板更新-预览
      {
        path: '/ssrc/price-lib-dimension-org/update-preview/:templateCode',
        models: [],
        component: () => import('../routes/ssrc/PriceLibDimension/Preview/Update'),
        FilterSupplier: true,
      },
    ],
  },

  // 价格服务平台
  {
    path: '/ssrc/price-service/list',
    models: [],
    component: () => import('../routes/ssrc/PriceService/Sit'),
  },
  // 价格服务租户
  {
    path: '/ssrc/price-service-org/list',
    models: [],
    component: () => import('../routes/ssrc/PriceService/Org'),
    FilterSupplier: true,
  },

  // 新价格库
  {
    path: '/ssrc/price-library-new/:templateCode',
    models: [],
    FilterSupplier: true,
    exactRoute: true,
    // 新价格库查询列表
    components: [
      {
        path: '/ssrc/price-library-new/:templateCode/list',
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew'),
        FilterSupplier: true,
        exactRoute: true,
        // authorized: true,
      },
      // 价格库-手工创建&更新
      {
        path: '/ssrc/price-library-new/:templateCode/update',
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew/Update'),
        FilterSupplier: true,
        // authorized: true,
        exactRoute: true,
      },
      // 价格库批量创建
      {
        path: '/ssrc/price-library-new/:templateCode/comment-import',
        models: [],
        component: () => import('../routes/ssrc/PriceLibBatchCreate'),
        // authorized: true,
        exactRoute: true,
      },
      // 价格库-手工创建审批中/审批通过
      {
        path: '/ssrc/price-library-new/:templateCode/detail',
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew/Detail'),
        FilterSupplier: true,
        exactRoute: true,
      },
      // 价格库-手工创建审批拒绝
      {
        path: '/ssrc/price-library-new/:templateCode/detail-reject',
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew/DetailReject'),
        FilterSupplier: true,
        exactRoute: true,
      },
      // 价格库-手工创建审批工作流
      {
        path: '/pub/ssrc/price-library-new/:templateCode/detail',
        authorized: true,
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew/WorkFlow'),
        FilterSupplier: true,
        exactRoute: true,
      },
      // 价格库-历史价格趋势图
      {
        path: '/ssrc/price-library-new/:templateCode/chart',
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew/Chart'),
        FilterSupplier: true,
        exactRoute: true,
      },
      // 价格库-审批查询
      {
        path: '/ssrc/price-library-new/:templateCode/approval',
        models: [],
        component: () => import('../routes/ssrc/PriceLibraryNew/Approval'),
        FilterSupplier: true,
        exactRoute: true,
      },
    ],
  },
  /**
   * 公式管理
   */
  {
    path: '/spc/formula-manage',
    models: [],
    FilterSupplier: true,
    // 公式管理列表
    components: [
      {
        path: '/spc/formula-manage/list',
        models: [],
        component: () => import('../routes/spc/FormulaManage'),
        FilterSupplier: true,
        // authorized: true,
      },
      // 公式管理列表 创建
      {
        path: '/spc/formula-manage/create',
        models: [],
        component: () => import('../routes/spc/FormulaManage/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/spc/formula-manage/:type/:formulaId',
        models: [],
        component: () => import('../routes/spc/FormulaManage/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * Bom结构配置
   */
  {
    path: '/spc/bom-dim-config',
    models: [],
    FilterSupplier: true,
    // Bom结构配置列表
    components: [
      {
        path: '/spc/bom-dim-config/list',
        models: [],
        component: () => import('../routes/spc/BomDimConfig'),
        FilterSupplier: true,
      },
      // Bom结构配置 创建
      {
        path: '/spc/bom-dim-config/create',
        models: [],
        component: () => import('../routes/spc/BomDimConfig/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/spc/bom-dim-config/:type/:bomTemplateId',
        models: [],
        component: () => import('../routes/spc/BomDimConfig/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  /**
   * 价格BOM工作台
   */
  {
    path: '/spc/bom-view-workbench',
    models: [],
    FilterSupplier: true,
    // Bom结构配置列表
    components: [
      {
        path: '/spc/bom-view-workbench/list',
        models: [],
        component: () => import('../routes/spc/BomViewWorkbench'),
        FilterSupplier: true,
      },
      // Bom结构配置 创建
      {
        path: '/spc/bom-view-workbench/create',
        models: [],
        component: () => import('../routes/spc/BomViewWorkbench/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/spc/bom-view-workbench/:bomTemplateCode/comment-import',
        models: [],
        component: () => import('../routes/spc/BomViewWorkbenchImport'),
        authorized: true,
        FilterSupplier: true,
      },
      {
        path: '/spc/bom-view-workbench/:type/:bomViewId',
        models: [],
        component: () => import('../routes/spc/BomViewWorkbench/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  /**
   * 高级取价记录表
   */
  {
    path: '/spc/advanced-pricing-record',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/spc/advanced-pricing-record/list',
        models: [],
        component: () => import('../routes/spc/AdvancedPricingRecord'),
        FilterSupplier: true,
      },
      {
        path: '/spc/advanced-pricing-record/detail/:recordNum/:isAdjust?',
        models: [],
        component: () => import('../routes/spc/AdvancedPricingRecord/detail'),
        FilterSupplier: true,
      },
    ],
  },
  /**

  /**
   * 价格拓展策略
   */
  {
    path: '/ssrc/price-expand-strategy',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/price-expand-strategy/list',
        models: [],
        component: () => import('../routes/ssrc/PriceExpandStrategy'),
        FilterSupplier: true,
        // authorized: true,
      },
      {
        path: '/ssrc/price-expand-strategy/create',
        models: [],
        component: () => import('../routes/ssrc/PriceExpandStrategy/Create'),
        FilterSupplier: true,
        // authorized: true,
      },
      {
        path: '/ssrc/price-expand-strategy/update/:expandId',
        models: [],
        component: () => import('../routes/ssrc/PriceExpandStrategy/Update'),
        FilterSupplier: true,
        // authorized: true,
      },
      {
        path: '/ssrc/price-expand-strategy/detail/:expandId',
        models: [],
        component: () => import('../routes/ssrc/PriceExpandStrategy/Detail'),
        FilterSupplier: true,
        // authorized: true,
      },
    ],
  },
  // 询价单审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-detail-approval/:rfxId',
    models: [
      () => import('../models/quotationController.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/bidHall.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/SrcDetail/PubIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价单审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-detail-approval/:rfxId/RFQ',
    models: [
      () => import('../models/quotationController.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/bidHall.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/SrcDetail/PubIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价单审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-detail-approval/:rfxId/NEW_BID',
    models: [
      () => import('../models/quotationController.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/bidHall.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/SrcDetail/PubBidIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 询价单-报价中节点-审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-detail-quoting-approval/:rfxId',
    models: [() => import('../models/inquiryHall.js')],
    component: () => import('../routes/ssrc/InquiryHall/Detail/Approvals'),
    authorized: true,
    FilterSupplier: true,
  },

  // 询价单审批-审批新增供应商
  {
    path: '/pub/ssrc/inquiry-hall/rfx-detail-approval/:rfxId/:rfxLineSupplierSnapId',
    models: [
      () => import('../models/quotationController.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/bidHall.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/SrcDetail/PubIndex'),
    authorized: true,
    FilterSupplier: true,
  },

  // 核价审批
  {
    path: '/pub/ssrc/inquiry-hall/check-price-approval/:rfxId',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApproval'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批new - c7n
  {
    path: '/pub/ssrc/inquiry-hall/check-price-approval-new/:rfxId',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalC7n'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批
  {
    path: '/pub/ssrc/inquiry-hall/check-price-approval/:rfxId/RFQ',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApproval'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批new - c7n
  {
    path: '/pub/ssrc/inquiry-hall/check-price-approval-new/:rfxId/RFQ',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalC7n'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批
  {
    path: '/pub/ssrc/inquiry-hall/check-price-approval/:rfxId/NEW_BID',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApproval/BidIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批new - c7n
  {
    path: '/pub/ssrc/inquiry-hall/check-price-approval-new/:rfxId/NEW_BID',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalC7n'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批new - c7n - 二维表
  {
    path: '/pub/ssrc/inquiry-hall/new-check-price-approval/:rfxId/RFQ',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/workflowIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价审批new - c7n - 二维表
  {
    path: '/pub/ssrc/inquiry-hall/new-check-price-approval/:rfxId/NEW_BID',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/workflowIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 核价概览审批
  {
    path:
      '/pub/ssrc/inquiry-hall/new-check-price-approval-overview/:rfxId/:secondarySourceCategory',
    models: [
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
      () => import('../models/supplierQuotation.js'),
      () => import('../models/inquiryHallNewPub.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/workflowIndex'),
    authorized: true,
    FilterSupplier: true,
  },
  // 价格库
  {
    path: '/pub/ssrc/price-library/lib-update',
    models: [() => import('../models/priceLibrary.js')],
    component: () => import('../routes/ssrc/PriceLibrary/Update'),
    authorized: true,
    FilterSupplier: true,
  },
  // 寻源立项详情
  {
    path: '/pub/ssrc/project-setup/detail/:sourceProjectId',
    models: [() => import('../models/projectSetup.js')],
    component: () => import('../routes/ssrc/ProjectSetup/Update'),
    authorized: true,
    FilterSupplier: true,
  },
  {
    path: '/pub/ssrc/new-project-setup/detail/:sourceProjectId',
    models: [() => import('../models/projectSetup.js'), () => import('../models/inquiryHall.js')],
    authorized: true,
    component: () => import('../routes/ssrc/ProjectSetup/Update'),
    FilterSupplier: true,
  },
  // pdf-export-demo
  {
    path: '/ssrc/demo/pdf',
    models: [() => import('../models/inquiryHall.js')],
    component: () => import('../routes/ssrc/DemoPdf'),
    authorized: true,
    FilterSupplier: true,
  },
  // 议价 - 审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-bargain-approval/:rfxId',
    models: [
      () => import('../models/bargain.js'),
      () => import('../models/bargainPub.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/Bargain/Approval/indexPub.js'),
    authorized: true,
    FilterSupplier: true,
  },
  // 议价 - 审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-bargain-approval/:rfxHeaderSnapId/RFQ',
    models: [
      () => import('../models/bargain.js'),
      () => import('../models/bargainPub.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/Bargain/Approval/indexPub.js'),
    authorized: true,
    FilterSupplier: true,
  },
  // 议价-审批
  {
    path: '/pub/ssrc/inquiry-hall/rfx-bargain-approval/:rfxHeaderSnapId/NEW_BID',
    models: [
      () => import('../models/bargain.js'),
      () => import('../models/bargainPub.js'),
      () => import('../models/inquiryHall.js'),
      () => import('../models/priceComparison.js'),
      () => import('../models/quotationDetail.js'),
    ],
    component: () => import('../routes/ssrc/InquiryHall/Bargain/Approval/indexBidPub.js'),
    FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/ssrc/scoreRptTemplate-org',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/ssrc/scoreRptTemplate-org/list',
        models: [() => import('../models/scoreRptTemplate.js')],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Org'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/scoreRptTemplate-org/create',
        models: [() => import('../models/scoreRptTemplate.js')],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Org/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/scoreRptTemplate-org/detail',
        models: [
          () => import('../models/scoreRptTemplate.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Org/Detail'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/scoreRptTemplate-org/content/:templateId',
        models: [
          () => import('../models/scoreRptTemplate.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Org/Detail/ViewContent'),
        FilterSupplier: true,
      },
    ],
  },

  {
    path: '/ssrc/scoreRptTemplate-site',
    models: [],
    components: [
      {
        path: '/ssrc/scoreRptTemplate-site/list',
        models: [() => import('../models/scoreRptTemplate.js')],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Sit'),
      },
      {
        path: '/ssrc/scoreRptTemplate-site/create',
        models: [() => import('../models/scoreRptTemplate.js')],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Sit/Detail'),
      },
      {
        path: '/ssrc/scoreRptTemplate-site/detail',
        models: [
          () => import('../models/scoreRptTemplate.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Sit/Detail'),
      },
      {
        path: '/ssrc/scoreRptTemplate-site/content/:templateId',
        models: [
          () => import('../models/scoreRptTemplate.js'),
          () => import('../models/editorOnline.js'),
        ],
        component: () => import('../routes/ssrc/ScoreRptTemplate/Sit/Detail/ViewContent'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/ssrc/price-clarification',
    models: [],
    components: [
      {
        path: '/ssrc/price-clarification/list',
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification'),
        FilterSupplier: true,
      },
      // 专家评分价格澄清create update
      {
        path: '/ssrc/price-clarification/update',
        models: [() => import('../models/expertScoring.js')],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/Update'),
        FilterSupplier: true,
      },
      {
        path: '/ssrc/price-clarification/detail',
        models: [
          () => import('../models/expertScoring.js'),
          () => import('../models/inquiryHall.js'),
        ],
        component: () => import('../routes/sbid/ExpertScoring/PriceClarification/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 二开路由
  {
    path: '/ssrc/redevelop-route/approval-list',
    component: () => import('../routes/components/OperationRecord/NewApprovalList'),
  },
  // 二开路由
  {
    path: '/ssrc/redevelop-route/project-approval-list',
    component: () => import('../routes/components/ProjectOperationRecord/NewApprovalList'),
  },
  // 核价审批-新
  {
    path: '/pub/ssrc/inquiry-hall/new-check-price-approval/:rfxId',
    models: [],
    component: () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail'),
    authorized: true,
    FilterSupplier: true,
  },
  // 价格模型
  {
    path: '/spc/price-model',
    models: [],
    FilterSupplier: true,
    // 价格模型查询列表
    components: [
      {
        path: '/spc/price-model/list',
        models: [],
        component: () => import('../routes/spc/PriceModel'),
        FilterSupplier: true,
      },
      // 价格模型-编辑
      {
        path: '/spc/price-model/update/:modelId',
        models: [],
        component: () => import('../routes/spc/PriceModel/Update'),
        FilterSupplier: true,
      },
      // 价格模型-明细
      {
        path: '/spc/price-model/detail/:modelId',
        models: [],
        component: () => import('../routes/spc/PriceModel/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 专家注册申请 -审批
  {
    path: '/pub/ssrc/expert-reqQuery/detail/:expertReqId',
    models: [() => import('../models/expert.js')],
    component: () => import('../routes/ssrc/Expert/Approve/Detail'),
    FilterSupplier: true,
    authorized: true,
  },
  // 专家工作台
  {
    path: '/ssrc/expert-workbench',
    component: () => import('../routes/ssrc/ExpertWorkBench/index'),
    models: [],
    FilterSupplier: true,
  },
  {
    path: '/spc/price-adjustment-workbench',
    models: [],
    FilterSupplier: true,
    // 调价单工作台列表页
    components: [
      {
        path: '/spc/price-adjustment-workbench/list',
        component: () => import('../routes/spc/PriceAdjustmentWorkbench/index'),
        FilterSupplier: true,
      },
      // 调价单工作台详情页
      {
        path: '/spc/price-adjustment-workbench/details/:status',
        component: () => import('../routes/spc/PriceAdjustmentWorkbench/Detail/index'),
        FilterSupplier: true,
      },
      // 调价单工作台详情页-无权限控制，提供给其他模块跳转使用
      // /spc/price-adjustment-workbench/authorize-details/view?backFlag=N&priceAdjustmentHeaderId=${priceAdjustmentHeaderId}
      {
        path: '/spc/price-adjustment-workbench/authorize-details/:status',
        component: () => import('../routes/spc/PriceAdjustmentWorkbench/Detail/index'),
        FilterSupplier: true,
        authorized: true,
        title: 'hzero.common.view.message.title.priceAdjustment',
      },
    ],
  },
  // 调价单工作流
  {
    path: '/pub/spc/price-adjustment-workbench/details/:status',
    component: () => import('../routes/spc/PriceAdjustmentWorkbench/Detail/index'),
    authorized: true,
    FilterSupplier: true,
  },
  // 调价单工作流-单据样式
  {
    path: '/pub/spc/price-adjustment-workbench/submit-approve',
    component: () => import('../routes/spc/PriceAdjustmentWorkbench/SubmitApprove'),
    authorized: true,
  },
  {
    path: '/ssrc/quick-inquiry-workbench',
    models: [],
    FilterSupplier: true,
    // 快速询价工作台列表页
    components: [
      {
        path: '/ssrc/quick-inquiry-workbench/list',
        component: () => import('../routes/ssrc/QuickInquiryWorkBench/index.js'),
        FilterSupplier: true,
      },
      // 快速询价工作台新建页
      {
        path: '/ssrc/quick-inquiry-workbench/create',
        component: () => import('../routes/ssrc/QuickInquiryWorkBench/Update/indexCreate'),
        FilterSupplier: true,
      },
      // 快速询价工作台维护页
      {
        path: '/ssrc/quick-inquiry-workbench/update/:rfqHeaderId',
        component: () => import('../routes/ssrc/QuickInquiryWorkBench/Update/indexUpdate'),
        FilterSupplier: true,
      },
    ],
  },
  // 寻源项目关闭审批
  {
    path: '/pub/ssrc/new-project-setup/source-project-close-approval-wf/:sourceProjectId',
    models: [],
    component: () => import('../routes/ssrc/ProjectSetupNew/SourceProjectCloseApprovalWF'),
    authorized: true,
    FilterSupplier: true,
  },
  // 发现商机
  {
    path: '/ssrc/find-business-opportunities',
    models: [],
    //  发现商机列表页
    components: [
      {
        path: '/ssrc/find-business-opportunities/list',
        component: () => import('../routes/ssrc/FindBusiness/index.js'),
        FilterSupplier: true,
      },
      //  发现商机明细页
      {
        path: '/ssrc/find-business-opportunities/:rfxHeaderVipId',
        component: () => import('../routes/ssrc/FindBusiness/Detail/index.js'),
        FilterSupplier: true,
      },
    ],
    FilterSupplier: true,
  },
  // 采购方澄清函发布审批 - 单据样式
  {
    path: '/pub/ssrc/purchaser-clarify-approval/:clarifyId/:sourceCategory',
    component: () => import('../routes/ssrc/InquiryHall/Clarify/ApprovalWFC7N/wfIndex.js'),
    FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/ssrc/file-template-manage',
    models: [],
    FilterSupplier: true,
    // 招标文件模板管理工作台列表页
    components: [
      {
        path: '/ssrc/file-template-manage/workbench-list',
        component: () => import('../routes/ssrc/FileTemplateManageWorkBench/index.js'),
        FilterSupplier: true,
      },
      // 招标文件模板管理工作台新建页
      {
        path: '/ssrc/file-template-manage/create',
        component: () => import('../routes/ssrc/FileTemplateManageWorkBench/Update/indexCreate.js'),
        FilterSupplier: true,
      },
      // 招标文件模板管理工作台维护页
      {
        path: '/ssrc/file-template-manage/update/:fileManageId', // todo: 替换id名
        component: () => import('../routes/ssrc/FileTemplateManageWorkBench/Update/indexUpdate.js'),
        FilterSupplier: true,
      },
    ],
  },
  {
    path: '/pub/ssrc/round-quotation-execution',
    component: () => import('../routes/ssrc/InquiryHallNew/components/RoundQuotation/linkIndex.js'),
    FilterSupplier: true,
  },
  {
    path: '/pub/ssrc/rfx-chat-room',
    component: () => import('../routes/components/ChatRoomSource/ChatRoomSourcePage.js'),
    authorized: true,
  },
];
