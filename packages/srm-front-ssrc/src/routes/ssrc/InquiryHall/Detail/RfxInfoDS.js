import { isEmpty } from 'choerodon-ui/dataset/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getDateTimeFormat } from 'utils/utils';

const RfxInfoDS = (options = {}) => {
  const { documentTypeName = '', quotationName = '', bidFlag } = options;

  return {
    fields: [
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitleRFX`, {
            documentTypeName,
          })
          .d(`{documentTypeName}标题`),
        name: 'rfxTitle',
        type: 'string',
        disabled: true,
      },
      {
        name: 'budgetAmount',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
        disabled: true,
      },
      {
        name: 'totalEstimatedAmount',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
          .d('预估金额(含税)'),
        disabled: true,
      },
      {
        name: 'totalNetEstimatedAmount',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
          .d('预估金额(不含税)'),
        disabled: true,
      },
      {
        name: 'sourceProjectNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
      },
      {
        name: 'sourceProjectName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectName`).d('寻源项目名称'),
      },
      {
        name: 'createSourceFlag',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.createRFXFlag').d('创建询价单'),
        type: 'number',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'sectionCode',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionCode`).d('标段编码'),
      },
      {
        name: 'sectionName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
        name: 'templateName',
        type: 'string',
        disabled: true,
      },
      {
        name: 'rfxRemark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
        disabled: true,
      },
      {
        name: 'expertScoreType',
        type: 'string',
      },
      {
        name: 'expertSource',
        type: 'string',
      },
      {
        name: 'expertScoreType',
        type: 'string',
      },
      /**
       * Supplier with request
       * */
      {
        name: 'sourceMethodMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'organizationTypeMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.organizationType`).d('境内外关系'),
        type: 'string',
      },
      {
        name: 'industryData',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型'),
        // lovCode: 'HPFM.INDUSTRY_FIRST',
        transformResponse: (value = null) => {
          if (isEmpty(value)) {
            return null;
          }

          let result = [];
          const parseValue = value ? JSON.parse(value) : [];
          parseValue.forEach((item = {}) => {
            const { industryName = null } = item;
            result.push(industryName);
          });

          result = result.join(',');
          return result;
        },
      },
      {
        name: 'industryCategoryData',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`).d('主营品类'),
        // lovCode: 'HPFM.INDUSTRY.CATEGORY',
        transformResponse: (value = null) => {
          if (isEmpty(value)) {
            return null;
          }

          let result = [];
          const parseValue = value ? JSON.parse(value) : [];
          parseValue.forEach((item = {}) => {
            const { categoryName = null } = item;
            result.push(categoryName);
          });
          result = result.join(',');
          return result;
        },
      },
      {
        name: 'allowSourceSupplierStages',
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowSourceSupplierStages')
          .d('可参与寻源供应商阶段'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'expandScopeMeaning',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.expandScope').d('拓展范围'),
      },
      /**
       * rfx demand
       * */
      {
        name: 'sourceCategoryMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        disabled: true,
      },
      {
        name: 'secondarySourceCategoryMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        disabled: true,
      },
      /**
       * 资格预审
       * */
      {
        name: 'mergeTypeMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalMergeType`).d('预审合并方式'),
      },
      {
        name: 'mergeType',
      },
      {
        name: 'prequalEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`).d('预审截止时间'),
        disabled: true,
        showType: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        name: 'reviewMethodMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'qualifiedLimit',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`).d('合格上限'),
        disabled: true,
      },
      {
        name: 'preGroupLeaderLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
        type: 'string',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`).d('预审小组成员'),
        name: 'preGroupMemberLov',
        type: 'string',
        disabled: true,
      },
      {
        name: 'enableScoreFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.enableScoreFlag`).d('启用评分细项'),
        disabled: true,
      },
      {
        name: 'prequalRemark',
        label: intl.get(`ssrc.common.qualRequirements`).d('资质要求'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'prequalHeaderId',
        type: 'string',
        disabled: true,
      },
      {
        name: 'prequalAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`).d('资格预审文件'),
        type: 'attachment',
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-prequal',
      },
      /**
       * 报价部分
       * */
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.passwordFlag`).d('启用开标密码'),
        name: 'passwordFlag',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
        name: 'startFlag',
        disabled: true,
      },
      {
        name: 'startQuotationRunningDuration',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotRunningDuration`, { quotationName })
          .d('{quotationName}运行时间'),
        disabled: true,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTimeRFX`, { quotationName })
          .d(`{quotationName}开始时间`),
        name: 'quotationStartDate',
        disabled: true,
        showType: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
            quotationName,
          })
          .d(`{quotationName}截止时间`),
        name: 'quotationEndDate',
        disabled: true,
        showType: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        name: 'quotationEndDateFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间'),
        name: 'quotationRunningDuration',
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`).d('报价间隔时间'),
        name: 'quotationInterval',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationOrderType`).d('报价次序'),
        name: 'quotationOrderTypeMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.auctionRule`).d('竞价规则'),
        name: 'auctionRuleMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则'),
        name: 'openRuleMeaning',
        disabled: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.rankRule').d('排名规则'),
        name: 'rankRuleMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferFlag`).d('启用自动延时'),
        name: 'autoDeferFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
        name: 'autoDeferDuration',
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferType`).d('延时触发规则'),
        name: 'autoDeferTypeMeaning',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.inquiryHall.autoDeferPeriod')
          .d('延时触发时间段'),
        name: 'autoDeferPeriod',
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.maxDeferCount').d('最大延时次数'),
        name: 'maxDeferCount',
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
        name: 'sealedQuotationFlag',
        type: 'string',
        // trueValue: 1,
        // falseValue: 0,
        // defaultValue: 0,
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.passwordFlag`).d('启用开标密码'),
        name: 'passwordFlag',
        disabled: true,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
        name: 'quotationTypeMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
        disabled: true,
      },
      {
        name: 'currencyId',
        bind: 'currencyLov.currencyId',
      },
      {
        name: 'finishingRate',
        type: 'number',
      },
      /**
       * others
       * */
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`).d('允许多币种报价'),
        name: 'multiCurrencyFlag',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`).d('报价范围'),
        name: 'quotationScopeMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowAlterPaymnetTypeTerm')
          .d('允许修改付款条款方式'),
        name: 'paymentTermFlag',
        disabled: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidFileExpense').d('招标文件费(元)'),
        name: 'bidFileExpense',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.bidingDocumentDownLoad')
          .d('招标文件下载节点'),
        name: 'bidFileDownloadNodeMeaning',
        type: 'string',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowServiceExpenseCharge')
          .d('是否收取服务费'),
        name: 'serviceExpenseChargeFlag',
        disabled: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)'),
        name: 'bidBond',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
          .d('最少报价供应商数'),
        name: 'minQuotedSupplier',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.centralPurFlag`).d('是否集采'),
        name: 'centralPurchaseFlag',
        disabled: true,
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.taxChangeFlag').d('允许供应商修改税率'),
        name: 'taxChangeFlag',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.continuousQuotationFlag')
          .d('允许供应商连续报价'),
        name: 'continuousQuotationFlag',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.quantityChangeFlag')
          .d('允许供应商修改可供数量'),
        name: 'quantityChangeFlag',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.diyLadderQuotationFlags')
          .d('允许供应商自定义阶梯报价'),
        name: 'diyLadderQuotationFlag',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.tab.matterDetailNotice`).d('寻源事项须知'),
        name: 'matterDetail',
        type: 'string',
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制'),
        name: 'openBidOrderMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyEndDate`).d('澄清截止时间'),
        name: 'clarifyEndDate',
        showType: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        name: 'openBidOrder',
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.bidRuleType').d('标书规则'),
        name: 'bidRuleTypeMeaning',
        disabled: true,
      },
      {
        name: 'subjectMatterRule',
      },
      {
        name: 'bidRuleType',
      },
      /**
       * organization and staff
       * */
      {
        name: 'companyName',
        label: intl.get('ssrc.common.company').d('公司'),
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
        disabled: true,
        name: 'unitName',
      },
      {
        name: 'resultsExpandingDimensions',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.resultsExpandingDimensions`)
          .d('寻源拓展维度'),
        lookupCode: 'SSRC.RESULTS_EXPANDING_DIMENSIONS',
      },
      {
        name: 'resultsExpandingHierarchy',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.resultsExpandingHierarchy`)
          .d('寻源拓展层级'),
        lookupCode: 'SSRC.RESULTS_EXPANDING_HIERARCHY',
      },
      {
        name: 'expandCompanyMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expandCompany`).d('拓展公司'),
      },
      {
        name: 'expandInvOrganizationMeaning',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.expandInvOrganization`)
          .d('拓展库存组织'),
      },
      {
        name: 'purOrganizationName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
        disabled: true,
      },
      {
        name: 'purchaserName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
        disabled: true,
      },
      {
        name: 'purName',
        type: 'string',
        label: intl.get(`ssrc.bidHall.model.bidHall.purchasingContact`).d('采购联系人'),
        disabled: true,
      },
      {
        name: 'internationalTelCodeMeaning',
      },
      {
        name: 'purPhone',
        type: 'string',
        label: intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话'),
        disabled: true,
      },
      {
        name: 'purEmail',
        label: intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱'),
        disabled: true,
      },
      {
        name: 'openBidLov',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
        type: 'string',
        // ignore: 'always',
        // readOnly: true,
        // lovCode: 'SSRC.TENANT.USER',
        // textField: 'realName',
        // valueField: 'id',
        // multiple: true,
        // disabled: true,
        // dynamicProps: {
        //   lovPara({ dataSet }) {
        //     const { organizationId = null } = dataSet.queryParameter.commonProps || {};
        //     return {
        //       organizationId,
        //     };
        //   },
        // },
      },
      {
        name: 'openerFlag',
      },
      {
        name: 'prequalCheckerLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalChecker`).d('初审审查员'),
        type: 'string',
        // ignore: 'always',
        // readOnly: true,
        // lovCode: 'SSRC.TENANT.USER',
        // textField: 'realName',
        // valueField: 'id',
        disabled: true,
        // dynamicProps: {
        //   lovPara({ dataSet }) {
        //     const { organizationId = null } = dataSet.queryParameter.commonProps || {};
        //     return {
        //       organizationId,
        //     };
        //   },
        // },
      },
      {
        name: 'inquierLov',
        label: !bidFlag
          ? intl.get('ssrc.common.view.message.RfxCreator').d('询价员')
          : intl.get('ssrc.common.view.message.BIDCreator').d('招标员'),
        disabled: true,
        type: 'string',
        // ignore: 'always',
        // lovCode: 'SSRC.TENANT.USER',
        // textField: 'realName',
        // readOnly: true,
        // valueField: 'id',
        // disabled: true,
        // dynamicProps: {
        //   lovPara({ dataSet }) {
        //     const { organizationId = null } = dataSet.queryParameter.commonProps || {};
        //     return {
        //       organizationId,
        //     };
        //   },
        // },
      },
      {
        name: 'checkPriceLov',
        type: 'string',
        label: !bidFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXcheckPricer`).d('核价员')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.BIDcheckPricer`).d('定标员'),
        // ignore: 'always',
        // lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        readOnly: true,
        disabled: true,
        // valueField: 'id',
        // dynamicProps: {
        //   lovPara({ dataSet }) {
        //     const { organizationId = null } = dataSet.queryParameter.commonProps || {};
        //     return {
        //       organizationId,
        //     };
        //   },
        // },
      },
      {
        name: 'observeLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.observePerson`).d('观察员'),
        disabled: true,
        type: 'string',
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'sourceFrom',
        type: 'string',
        defaultValue: 'MANUAL',
      },
      {
        name: 'matterRequireFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        name: 'applicationScopeFlag',
        defaultValue: 0,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'quotationRounds',
        type: 'number',
      },
      // 竞价大厅-竞价时间
      {
        // 签到选择：自定义时间 or 资格预审截止即开始 or 发布即开始 标识
        name: 'signInStartFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signStartTimeRFX`).d(`签到开始时间`),
        name: 'signInStartDate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signInEndDate`).d(`签到截止时间`),
        name: 'signInEndDate',
      },
      {
        // 签到运行时间标识
        name: 'signInRunningDurationFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.signInRunningDuration`)
          .d('签到运行时间'),
        name: 'signInRunningDuration',
        type: 'number',
      },
      {
        // 试竞价选择： 自定义时间 or 签到截止即开始 or 资格预审截止即开始 or 发布即开始 标识
        name: 'startingTrialBiddingStartFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingStartDate`)
          .d(`试竞价开始时间`),
        name: 'startingTrialBiddingStartDate',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingEndDate`)
          .d(`试竞价截止时间`),
        name: 'startingTrialBiddingEndDate',
      },
      {
        // 试竞价运行时间标识
        name: 'startingTrialBiddingRunningDurationFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingRunningDuration`)
          .d('试竞价运行时间'),
        name: 'startingTrialBiddingRunningDuration',
      },
      {
        // 正式竞价运行时间标识
        name: 'startingBiddingRunningDurationFlag',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceStartDate`)
          .d(`补充单价开始时间`),
        name: 'biddingSupplementPriceStartDate',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceEndDate`)
          .d(`补充单价截止时间`),
        name: 'biddingSupplementPriceEndDate',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceRunningDuration`)
          .d('补充单价运行时间'),
        name: 'biddingSupplementPriceRunningDuration',
      },
      // 竞价大厅-竞价规则
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingTarget').d('竞价对象'),
        name: 'biddingTargetMeaning',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingStrategy').d('出价策略'),
        name: 'biddingStrategyMeaning',
        type: 'string',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.biddingRules.biddingAllowedQuotationCount')
          .d('允许报价次数'),
        name: 'biddingAllowedQuotationCount',
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.startingBiddingPrice').d('起竞价'),
        name: 'startingBiddingPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        name: 'floatTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        name: 'quotationRange',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.biddingRules.biddingTotalPricePrinciple')
          .d('总价竞价原则'),
        name: 'biddingTotalPricePrincipleMeaning',
        type: 'string',
      },
      {
        name: 'biddingFlag',
      },
    ],
  };
};

export default RfxInfoDS;
