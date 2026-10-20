import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { NumberMax } from '@/utils/constants';

// 基础信息DS所有类型共用
const baseInfoDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'templateNum',
      label: intl.get(`ssrc.sourceTemplate.model.template.templateNum`).d('模板编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`ssrc.sourceTemplate.model.template.templateName`).d('模板名称'),
    },
    {
      name: 'sourceCategory',
      label: intl.get(`ssrc.sourceTemplate.model.template.sourcingCategory`).d('寻源类别'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.sourcingCategoryTitle`)
        .d('用于标识创建的寻源单类别'),
      lookupCode: 'SSRC.SECONDARY_SOURCE_CATEGORY',
    },
    {
      name: 'versionNumber',
      label: intl.get('ssrc.sourceTemplate.model.template.versionNumber').d('版本'),
    },
    {
      name: 'templateStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'biddingMode',
      label: intl.get(`ssrc.sourceTemplate.model.template.biddingMode`).d('竞价模式'),
      lookupCode: 'SSRC.BIDDING_MODE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.biddingModeTitle`)
        .d('用于配置竞价模式是英式竞价/荷兰式竞价/日式竞价。'),
    },
    {
      name: 'isBritishBidTrafficLight',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.isBritishBidTrafficLight`)
        .d('启用红绿灯'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.isBritishBidTrafficLightHelpText`)
        .d('用于配置供应商竞价时显示红绿灯而非排名模式。'),
    },
    {
      name: 'isBritishBidLowestPriceGreen',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.isBritishBidLowestPriceGreen`)
        .d('最低价绿灯'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.isBritishBidLowestPriceGreenHelpText`)
        .d('用于配置多家供应商报价低于目标价上/下限时，只有最低/高价显示为绿灯。'),
    },
    {
      name: 'biddingStageChangeableFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.allowAdjustBiddingStage`)
        .d('是否允许修改竞价阶段'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      disabled: true,
    },
  ],
});

// 询价的DS
const approveRuleDS = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'releaseApproveType',
      label: intl.get(`ssrc.sourceTemplate.model.template.releaseAT`).d('发布审批'),
      lookupCode: 'SPFM.BUSINESS_APV_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.releaseApproveTypeTitle`)
        .d(
          '用于配置寻源单据发布时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'preApproveType',
      label: intl.get(`ssrc.sourceTemplate.model.template.preApproveType`).d('评审结果审批'),
      lookupCode: 'SPFM.BUSINESS_APV_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.preApproveTypeTitle`)
        .d(
          '来配置推荐成交候选人时审批工作流.包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'resultApproveType',
      label: intl.get(`ssrc.sourceTemplate.model.template.resultAT`).d('结果审批'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.resultApproveTypeTitle`)
        .d(
          '用于配置核价/定标提交时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
      dynamicProps: {
        lookupCode({ dataSet }) {
          if (dataSet.getState('resultApproveFlag')) {
            return 'SPFM.BUSINESS_APV_METHOD';
          }
          return 'SSRC.CHECK_RESULT_TYPE';
        },
      },
    },
    {
      name: 'clarifyApproveType',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.clarifyApproval`)
        .d('澄清答疑澄清函发布审批'),
      lookupCode: 'SSRC.APPROVE_TYPE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.clarifyApprovalTooltip`)
        .d(
          '用于配置澄清答疑澄清函发布时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'closeApproveMethod',
      label: intl.get(`ssrc.sourceTemplate.model.template.closeApprove`).d('关闭审批'),
      lookupCode: 'SSRC.PRICE_LIB_APPROVE_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.closeApproveTitle`)
        .d(
          '用于配置寻源单据关闭时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'bargainApproveMethod',
      label: intl.get(`ssrc.sourceTemplate.model.template.bargainApprove`).d('议价审批'),
      lookupCode: 'SSRC.PRICE_LIB_APPROVE_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.bargainApproveTitle`)
        .d(
          '用于配置发起议价时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'rollbackApproveType',
      label: intl.get(`ssrc.sourceTemplate.model.template.rollbackApproveType`).d('退回至核价审批'),
      lookupCode: 'SSRC.ROLLBACK_APPROVE_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.rollbackApproveTitle`)
        .d(
          '用于配置寻源单据退回至核价时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）'
        ),
    },
  ],
});

// 询价DS 全局规则 - 附件要求
const attachRequirementDS = ({ templateId, customizeUnitCode } = {}) => ({
  autoQuery: false,
  dataToJSON: 'all',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'attachmentTypeMeaning',
      label: intl.get(`ssrc.sourceTemplate.model.approveRule.attachType`).d('附件类型'),
    },
    {
      name: 'attachmentUuid',
      label: intl
        .get(`ssrc.sourceTemplate.model.approveRule.uploadLocalAttTemplate`)
        .d('上传本地附件模板'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-file-template-manage',
    },
    {
      name: 'fileManageName',
      label: intl
        .get(`ssrc.sourceTemplate.model.approveRule.selectBidAttTemplate`)
        .d('选择招标文件模板'),
    },
    {
      name: 'editableFlag',
      label: intl.get(`ssrc.sourceTemplate.model.approveRule.editableFlag`).d('限制文件不可修改'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.approveRule.editableFlagHelp`)
        .d('仅当配置招标文件模板时，可启用。启用后用户只可根据模板生成文件无法自行上传文件。'),
    },
    {
      name: 'remark',
      label: intl.get(`ssrc.sourceTemplate.model.approveRule.describeTemplate`).d('模板描述'),
      type: 'intl',
    },
    {
      name: 'requiredFlag',
      label: intl.get(`ssrc.sourceTemplate.model.approveRule.isRequired`).d('附件是否必输'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'sourceNodeMeaning',
      label: intl.get(`ssrc.sourceTemplate.model.approveRule.owningNode`).d('所属节点'),
    },
  ],
  transport: {
    read: ({ params }) => {
      if (!templateId) return;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/template-attachment-lines/list`,
        method: 'POST',
        params: {
          ...(params || {}),
          customizeUnitCode,
        },
        data: {
          templateId,
        },
      };
    },
  },
});

const releaseRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'sourceMethod',
      label: intl.get(`ssrc.sourceTemplate.model.template.sourceMethod`).d('寻源方式'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.approachTitle`)
        .d(
          '用于控制寻源业务的范围，“邀请”表示将寻源单据发给供应商列表所邀请的供应商；“合作伙伴公开”表示将寻源单据发给所选公司的所有合作伙伴；“全平台公开”表示将寻源单据发给平台上所有的供应商。'
        ),
      lookupCode: 'SSRC.SOURCE_METHOD',
    },
    {
      name: 'maxVendorQuantity',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.maxVendorQuantity`)
        .d('最多邀请供应商数量'),
      type: 'number',
      min: 1,
      max: NumberMax,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.maxVendorQuantityTitle`)
        .d('邀请的寻源方式下，能邀请的最大供应商数量。'),
    },
    {
      name: 'minVendorNumber',
      label: intl.get(`ssrc.sourceTemplate.model.template.minVendorNumber`).d('最少邀请供应商数量'),
      type: 'number',
      min: 1,
      max: NumberMax,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.minVendorNumberTitle`)
        .d('在邀请的寻源方式下，能邀请的最少供应商数量。'),
    },
    {
      name: 'matchRestrictFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.matchRestrictFlag`)
        .d('供应商能力清单匹配限制'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.matchRestrictFlagTooltip`)
        .d(
          '在邀请的寻源方式下，限定选择该模板的寻源单据做供应商选择时仅能选到物品明细中的物品是供应商可供产品范围内的供应商。'
        ),
    },
    {
      name: 'notesReadRequired',
      label: intl.get(`ssrc.sourceTemplate.model.template.notesReadRequired`).d('寻源事项须知必读'),
      lookupCode: 'HPFM.FLAG',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.notesReadRequiredTitle`)
        .d('用于配置供应商参与寻源时是否必须阅读寻源事项须知。'),
    },
    {
      name: 'sourceMatterNotice',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.sourceMatterNoticeContent`)
        .d('寻源事项须知内容'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.sourceMatterNoticeContentTooltip`)
        .d('用于维护供应商报价期间需要阅读的事项须知内容。'),
    },
    {
      name: 'noticeEndNodeCode',
      lookupCode: 'SSRC.NOTICE_END_NODE_CODE',
      label: intl.get(`ssrc.sourceTemplate.model.template.noticeEndNodeCode`).d('公告终止节点'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.noticeEndNodeCodeDescription`)
        .d('用于维护供应商报价期间需要阅读的事项须知内容。'),
    },
  ],
});

const quotationRuleDS = (baseInfoDs) => {
  const getBiddingMode = () => {
    return baseInfoDs?.current?.get('biddingMode');
  };

  return {
    autoQuery: false,
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'tenderFeeFlag',
        label: intl.get(`ssrc.sourceTemplate.model.template.tenderFeeFlag`).d('招标文件费管控'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.matchTenderFeeFlagTitle`)
          .d('用于控制是否根据供应商招标文件费缴纳情况限制供应商参与寻源。'),
      },
      {
        name: 'bidBondFlag',
        label: intl.get(`ssrc.sourceTemplate.model.template.bidBondFlag`).d('保证金管控'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.matchBidBondFlagTitle`)
          .d('用于控制是否根据供应商保证金缴纳情况限制供应商报价。'),
      },
      {
        name: 'biddingQuotationMethod',
        label: intl.get(`ssrc.sourceTemplate.model.template.biddingQuotationMethod`).d('竞价方式'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingQuotationMethodTitle`)
          .d('用于配置竞价方式是竞价/拍卖。'),
        lookupCode: 'SSRC.BIDDING_QUOTATION_METHOD',
        defaultValue: 'BIDDING',
      },
      // {
      //   name: 'biddingMode',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.biddingMode`).d('竞价模式'),
      //   lookupCode: 'SSRC.BIDDING_MODE',
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.biddingModeTitle`)
      //     .d('用于配置竞价模式是英式竞价/荷兰式竞价/日式竞价。'),
      // },
      {
        name: 'quotationType',
        label: intl.get(`ssrc.sourceTemplate.model.template.quotationType`).d('报价方式'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.newqTTitle`)
          .d(
            '用于配置供应商的报价方式。“线上报价”表示供应商只能在系统中进行线上报价；“线下报价”表示只能由采购员通过线下寻源结果录入的功能将供应商的报价信息导入进寻源单；“线上线下并行”表示线上报价和线下录入可以并行。'
          ),
        lookupCode: 'SSRC.QUOTATION_TYPE',
      },
      {
        name: 'biddingTarget',
        label: intl.get(`ssrc.sourceTemplate.model.template.biddingTarget`).d('竞价对象'),
        lookupCode: 'SSRC.BIDDING_TARGET',
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingTargetTitle`)
          .d('用于配置竞价时，供应商可报单价/总价。'),
      },
      {
        name: 'biddingQuotationOrder',
        label: intl.get(`ssrc.sourceTemplate.model.template.biddingQuotationOrder`).d('报价次序'),
        lookupCode: 'SSRC.BIDDING_QUOTATION_ORDER',
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingQuotationOrderTitle`)
          .d('用于配置多物品竞价场景下，物品按顺序依次竞价/同时竞价。'),
      },
      {
        name: 'biddingStrategy',
        label: intl.get(`ssrc.sourceTemplate.model.template.biddingStrategy`).d('出价策略'),
        lookupCode: 'SSRC.BIDDING_STRATEGY',
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingStrategyTitle`)
          .d('用于配置英式竞价场景下，要求供应商的出价方式。'),
      },
      {
        name: 'openRule',
        label: intl.get(`ssrc.sourceTemplate.model.template.numOpenRule`).d('数据公开规则'),
        lookupCode: 'SSRC.RFA_OPEN_RULE',
        help: intl
          .get(`ssrc.sourceTemplate.model.template.openRuleTitle`)
          .d('在竞价寻源类别中，用于控制供应商报价时能否看到其他供应商的报价和身份。'),
      },
      {
        name: 'auctionRule',
        label: intl.get(`ssrc.sourceTemplate.model.template.auctionRule`).d('竞价规则'),
        lookupCode: 'SSRC.RFA_AUCTION_RULE',
        help: intl
          .get(`ssrc.sourceTemplate.model.template.auctionRuleTitle`)
          .d('在竞价寻源类别中，用于控制供应商报价时能否与其他供应商报相同的价格。'),
      },
      {
        name: 'rankRule',
        label: intl.get(`ssrc.sourceTemplate.model.template.RFARankRule`).d('竞价排名规则'),
        lookupCode: 'SSRC.RANK_RULE',
      },
      // {
      //   name: 'autoDeferFlag',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferFlag`).d('启用自动延时'),
      //   type: 'boolean',
      //   trueValue: 1,
      //   falseValue: 0,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.autoDeferFlagTitle`)
      //     .d('在竞价寻源类别中，用于控制是否启用自动延时。勾选表示启用，不勾选表示不启用。'),
      // },
      // {
      //   name: 'autoDeferPeriod',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferPeriod`).d('延时触发时间段'),
      //   type: 'number',
      //   min: 1,
      //   max: NumberMax,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.autoDeferPeriodTitle`)
      //     .d('用于配置延时触发的时间段，只有在这个时间段内满足延时触发规则才会触发自动延时。'),
      // },
      {
        name: 'autoDeferType',
        label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferType`).d('延时触发规则'),
        lookupCode: 'SSRC.AUTO_DEFER_TYPE',
        help: intl
          .get(`ssrc.sourceTemplate.template.autoDeferTypeTip`)
          .d(
            '用于配置自动延时触发的条件，“第1名价格发生变化时”表示只有当第1名的价格发生变化时会触发；“出现新的报价时触发”表示只要有供应商提交了新报价就会触发自动延时。'
          ),
      },
      // {
      //   name: 'autoDeferTimeRule',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.deferTimeRule`).d('延时时间规则'),
      //   lookupCode: 'SSRC.AUTO_DEFER_TIME_RULE',
      //   help: intl
      //     .get(`ssrc.sourceTemplate.template.autoDeferTimeRuleTitle`)
      //     .d(
      //       '用于配置基于什么时间延时，满足延时条件后，系统基于配置的时间点延时，生成新的报价截止时间。'
      //     ),
      // },
      // {
      //   name: 'autoDeferDuration',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferDuration`).d('延时时长'),
      //   type: 'number',
      //   min: 1,
      //   max: NumberMax,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.quotationTypeTitle`)
      //     .d('在竞价寻源类别中，用于配置发生自动延时时，延时的时间长短。'),
      // },
      // {
      //   name: 'biddingTotalDelayLimit',
      //   label: (
      //     <Tooltip
      //       title={intl
      //         .get(`ssrc.sourceTemplate.model.template.biddingTotalDelayLimitTitle`)
      //         .d('用于配置延时竞价时，延时总时长的限制.')}
      //     >
      //       {intl
      //         .get(`ssrc.sourceTemplate.model.template.biddingTotalDelayLimit`)
      //         .d('延时总时长限制')}
      //     </Tooltip>
      //   ),
      //   type: 'number',
      //   min: 1,
      //   max: NumberMax,
      // },
      // {
      //   name: 'maxDeferCount',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.maxDeferCount`).d('最大延时次数'),
      //   type: 'number',
      //   min: 1,
      //   max: NumberMax,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.maxDeferCountTitle`)
      //     .d(
      //       '用于配置物料行的最大延时次数，当延时次数已经用完之后，再在延时触发时间段内满足延时触发规则，将不再触发自动延时。最大延时次数为空则表示对延时次数没有限制.'
      //     ),
      // },
      {
        name: 'biddingAllowedQuotationCount',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountFormalBidding`)
          .d('允许报价次数(正式竞价)'),
        type: 'number',
        min: 1,
        max: NumberMax,
        step: 1,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountTitleFormalBidding`)
          .d('用于配置正式竞价阶段，供应商最多可报价次数'),
      },
      {
        name: 'sealedQuotationFlag',
        label: intl.get(`ssrc.sourceTemplate.model.template.sealedQuotationFlag`).d('密封报价'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.sealedQuotationFlagTooltip`)
          .d(
            '用于配置在报价期间内，所有报价信息是否对采购员密封保密。勾选表示采购员在报价期间内看不到任何报价信息；不勾选则采购员在报价期间内可以查看所有的报价信息。'
          ),
      },
      {
        name: 'biddingAnonymousQuotesFlag',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAnonymousQuotesFlag`)
          .d('匿名报价'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAnonymousQuotesFlagTooltip`)
          .d('用于配置竞价过程中，采购是否可以查看供应商名称。'),
      },
      {
        name: 'minQuotedSupplier',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.quotedSupplierMin`)
          .d('最少报价供应商数'),
        type: 'number',
        min: 1,
        max: NumberMax,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.newMinQuotedSupplierTitle`)
          .d('“当报价供应商数量”小于“最少报价供应商数”时，报价截止后需人工决定寻源是否继续进行。'),
      },
      // 询价招标特有字段
      {
        name: 'auctionDirection',
        label: intl.get(`ssrc.sourceTemplate.model.template.auctionDirection`).d('报价方向'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.auctionTitle`)
          .d(
            '用于控制供应商的报价方向。荷兰式表示报价必须越来越低；英式表示报价必须越来越高；无要求表示对报价方向无控制。'
          ),
        lookupCode: 'SSRC.SOURCE_AUCTION_DIRECTION',
      },
      {
        name: 'continuousQuotationFlag',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.continuousQuotationFlag`)
          .d('允许供应商连续报价'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.newConquotFlag`)
          .d(
            '在寻源寻源类别中，用于控制供应商能否对已报价状态的物料行再次报价。勾选表示可以进行对已报价状态的物料行再次报价，不勾选则表示不可以。'
          ),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'multiCurrencyFlag',
        label: intl.get(`ssrc.sourceTemplate.model.template.allowMuitiCurQuo`).d('允许多币种报价'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.allowMuitiCurQuoTitle`)
          .d(
            '在发布询价单或供应商报价中，用于控制是否允许供应商开启多币种报价。勾选代表允许供应商多币种报价，不勾选代表不允许供应商多币种报价。'
          ),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'diyLadderQuotationFlag',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.diyLadderQuotationFlag`)
          .d('允许供方自定义阶梯报价'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.diyLadderQuotationTitle`)
          .d(
            '在发布包含阶梯报价的寻源单据时，用于控制是否允许供应商修改或自定义阶梯报价的阶梯数量。勾选代表供应商可以修改或自定义阶梯报价的阶梯，不勾选代表供应商只可按采购方定义的阶梯等级报价。'
          ),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'detailPriceControlRule',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.detailPriceControlRule`)
          .d('报价明细总价管控'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.priceControlRuleTip`)
          .d(
            '用于管控报价明细总价和报价行单价之间的关系。报价明细总价=∑数量*单价，报价明细总价可计算的前提：报价模板中【数量】的编码是Quantity，【单价】的编码是Price。'
          ),
        lookupCode: 'SSRC.DETAIL_PRICE_CONTROL',
      },
      {
        name: 'quotationScope',
        label: intl.get(`ssrc.sourceTemplate.model.template.quotationScope`).d('报价范围'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.quotationScopeTooltip`)
          .d(
            '用于配置供应商是否报价范围。全部报价表示供应商必须整单报价，不可以放弃物料行报价；部分报价表示供应商可以部分报价，可以放弃部分物料行报价。'
          ),
        lookupCode: 'SSRC.QUOTATION_SCOPE_CODE',
      },
      {
        name: 'quotationDtlTotalPriceWriteFlag',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.quotationDtlTotalPriceWriteFlag`)
          .d('报价明细总价写入行单价'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.quotationDtlTotalPriceWriteFlagTitle`)
          .d(
            '用于配置是否自动将报价明细中的总价带到物料行单价中。注：报价明细总价=∑数量*单价，报价明细总价可计算的前提：报价模板中【数量】的编码是Quantity，【单价】的编码是Price。'
          ),
      },
      // {
      //   name: 'taxChangeFlag',
      //   label: intl
      //   .get(`ssrc.sourceTemplate.model.template.taxChangeFlag`)
      //   .d('允许供应商修改税率'),
      //   help: intl
      //   .get(`ssrc.sourceTemplate.model.template.taxChangeFlagTitle`)
      //   .d('用于控制供应商在报价时能否修改物料行的税率，勾选表示可以修改，不勾选则表示不可以。'),
      // },
      // {
      //   name: 'quantityChangeFlag',
      //   label: intl
      //   .get(`ssrc.sourceTemplate.model.template.quantityChangeFlag`)
      //   .d('允许供应商修改可供数量'),
      //   help: intl
      //   .get(`ssrc.sourceTemplate.model.template.quantityChangeFlagTitle`)
      //   .d('用于控制供应商在报价时能否修改可供数量，勾选表示可以修改，不勾选表示不可以。'),
      // },
      {
        name: 'allowProhibitQuotation',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.allowProhibitQuotation`)
          .d('允许操作禁止报价'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.tooltip.allowProhibitQuotation`)
          .d('竞价员可操作禁止供应商出价，点击后清除该供应商的所有出价信息和排名信息。'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        transformResponse: (val) => val ?? 1,
        dynamicProps: {
          help: () => {
            const isRfaFlag = baseInfoDs?.current?.get('sourceCategory') === 'RFA';
            return isRfaFlag
              ? intl
                  .get(`ssrc.sourceTemplate.model.template.tooltip.allowProhibitQuotation`)
                  .d('竞价员可操作禁止供应商出价，点击后清除该供应商的所有出价信息和排名信息。')
              : null;
          },
        },
      },
      {
        name: 'allowDeleteLatestQuotation',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.allowDeleteLatestQuotation`)
          .d('允许操作删除最新报价'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        transformResponse: (val) => val ?? 1,
        dynamicProps: {
          help: () => {
            const isRfaFlag = baseInfoDs?.current?.get('sourceCategory') === 'RFA';
            return isRfaFlag
              ? intl
                  .get(`ssrc.sourceTemplate.model.template.tooltip.allowDeleteLatestQuotation`)
                  .d(
                    '竞价员可操作删除供应商的最新一次出价信息，点击后删除该供应商的最新一次出价信息和排名信息。'
                  )
              : null;
          },
        },
      },
      {
        name: 'biddingAllowAdjustTimeFlag',
        label: intl.get(`ssrc.sourceTemplate.model.template.allowAdjustTime`).d('是否允许调整时间'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.tooltip.allowAdjustTime`)
          .d(
            '用于配置正式竞价时间是否允许调整。仅当竞价对象=单价且报价次序=并行或竞价对象=总价时生效'
          ),
        disabled: true,
      },
      {
        name: 'biddingAllowAdjustTimeType',
        label: intl.get(`ssrc.sourceTemplate.model.template.allowAdjustTimeNode`).d('调整时间节点'),
        help: intl
          .get(`ssrc.sourceTemplate.model.template.tooltip.allowAdjustTimeNode`)
          .d(
            '用于配置在竞价中、报价响应不足节点调整正式竞价时间。仅当竞价对象=单价且报价次序=并行或竞价对象=总价时生效'
          ),
        lookupCode: 'SSRC.BIDDING_ALLOW_ADJUST_TIME_NODE',
        multiple: true,
        disabled: true,
        transformResponse: (value) => {
          if (!value) {
            return '';
          }
          return value ? value.split(',') : null;
        },
      },
      {
        name: 'chatEnableFlag',
        label: intl
          .get('ssrc.sourceTemplate.model.template.chatRoomEnableFlag')
          .d('启用聊天室功能'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl
          .get('ssrc.sourceTemplate.model.template.chatRoomEnableFlagHelpText')
          .d('启用聊天室功能后，可与供应商在线聊天，若不开启，则无法与供应商聊天。'),
      },
      {
        name: 'biddingEliminateRoundNumber',
        label: intl.get('ssrc.common.model.template.biddingEliminateRoundNumber').d('供方淘汰规则'),
        help: intl
          .get('ssrc.common.model.template.tooltip.biddingEliminateRoundNumber')
          .d('用于配置当接受报价的供应商连续X轮未接受报价，则自动淘汰进入下一轮的资格'),
        type: 'string',
        lookupCode: 'SSRC_BIDDING_ELIMINATION_RULE',
      },
      {
        name: 'biddingMinShortlistedSupplierNumber',
        label: intl
          .get(`ssrc.common.model.template.biddingMinShortlistedSupplierNumber`)
          .d('最少入围供应商数'),
        help: intl
          .get('ssrc.common.model.template.tooltip.biddingMinShortlistedSupplierNumber')
          .d('用于配置最少供应商入围数量，若不满足则竞价结束。'),
      },
      {
        name: 'biddingEndType',
        label: intl.get('ssrc.common.model.template.biddingEndType').d('竞价结束方式'),
        help: intl
          .get('ssrc.common.model.template.tooltip.biddingEndType')
          .d('用户配置日式/荷兰式竞价结束的方式。'),
        type: 'string',
        multiple: true,
        disabled: true,
        transformResponse: (value) => {
          if (!value) {
            return '';
          }
          return value ? value.split(',') : null;
        },
        dynamicProps: {
          lookupCode() {
            const biddingMode = getBiddingMode();

            let code = 'SSRC_BIDDING_JAPANESE_END_TYPE';

            if (biddingMode === 'DUTCH_BIDDING') {
              code = 'SSRC_BIDDING_DUTCH_END_TYPE';
            }

            return code;
          },
        },
      },
      {
        name: 'lackQuotationTriggersType',
        label: intl
          .get(`ssrc.common.model.template.lackQuotationTriggersType`)
          .d('报价响应不足触发规则'),
        help: intl
          .get(`ssrc.common.model.template.tooltip.lackQuotationTriggersTypeHelp`)
          .d('用于配置需要将询价单置为报价响应不足状态的场景'),
        type: 'string',
        lookupCode: 'SSRC_LACK_TRIGGERS_TYPE',
        multiple: ',',
      },
    ],
  };
};

const auctionBidDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      // {
      //   name: 'autoDeferFlag',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferFlag`).d('启用自动延时'),
      //   type: 'boolean',
      //   trueValue: 1,
      //   falseValue: 0,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.autoDeferFlagTitle`)
      //     .d('在竞价寻源类别中，用于控制是否启用自动延时。勾选表示启用，不勾选表示不启用。'),
      // },
      // {
      //   name: 'autoDeferPeriod',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferPeriod`).d('延时触发时间段'),
      //   type: 'number',
      //   min: 1,
      //   step: 0.1,
      //   max: NumberMax,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.autoDeferPeriodTitle`)
      //     .d('用于配置延时触发的时间段，只有在这个时间段内满足延时触发规则才会触发自动延时。'),
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return (
      //         baseInfoDs?.current?.get('sourceCategory') === 'RFA' &&
      //         record.get('biddingMode') === 'BRITISH_BIDDING' &&
      //         record.get('autoDeferFlag')
      //       );
      //     },
      //   },
      // },
      {
        name: 'autoDeferType',
        label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferType`).d('延时触发规则'),
        lookupCode: 'SSRC.AUTO_DEFER_TYPE',
        defaultValue: 'NEW_OFFER',
        help: intl
          .get(`ssrc.sourceTemplate.template.autoDeferTypeTip`)
          .d(
            '用于配置自动延时触发的条件，“第1名价格发生变化时”表示只有当第1名的价格发生变化时会触发；“出现新的报价时触发”表示只要有供应商提交了新报价就会触发自动延时。'
          ),
      },
      // {
      //   name: 'autoDeferTimeRule',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.deferTimeRule`).d('延时时间规则'),
      //   lookupCode: 'SSRC.AUTO_DEFER_TIME_RULE',
      //   defaultValue: 'NEW_QUOTE',
      //   help: intl
      //     .get(`ssrc.sourceTemplate.template.autoDeferTimeRuleTitle`)
      //     .d(
      //       '用于配置基于什么时间延时，满足延时条件后，系统基于配置的时间点延时，生成新的报价截止时间。'
      //     ),
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return (
      //         baseInfoDs?.current?.get('sourceCategory') === 'RFA' &&
      //         record.get('biddingMode') === 'BRITISH_BIDDING' &&
      //         record.get('autoDeferFlag')
      //       );
      //     },
      //   },
      // },
      {
        name: 'autoDeferDuration',
        label: intl.get(`ssrc.sourceTemplate.model.template.autoDeferDuration`).d('延时时长'),
        type: 'number',
        max: NumberMax,
        step: 0.1,
        min: 1,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.quotationTypeTitle`)
          .d('在竞价寻源类别中，用于配置发生自动延时时，延时的时间长短。'),
      },
      // {
      //   name: 'maxDeferCount',
      //   label: intl.get(`ssrc.sourceTemplate.model.template.maxDeferCount`).d('最大延时次数'),
      //   type: 'number',
      //   min: 1,
      //   max: NumberMax,
      //   step: 1,
      //   help: intl
      //     .get(`ssrc.sourceTemplate.model.template.maxDeferCountTitle`)
      //     .d(
      //       '用于配置物料行的最大延时次数，当延时次数已经用完之后，再在延时触发时间段内满足延时触发规则，将不再触发自动延时。最大延时次数为空则表示对延时次数没有限制.'
      //     ),
      // },
      {
        name: 'deferBiddingAllowedQuotationCount',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`)
          .d('允许报价次数(延时竞价)'),
        type: 'number',
        min: 1,
        max: NumberMax,
        step: 1,
        help: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountTitleDeferBidding`)
          .d('用于配置延时竞价阶段，供应商最多可报价次数'),
      },
    ],
  };
};

const openBidDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'passwordFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.passwordFlag`).d('启用开标密码'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.passwordFlagTooltip`)
        .d('用于配置开标员在开标环节是否需要开标密码，密码可在消息监控中查看。'),
    },
  ],
});

const scoreRuleDS = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'bidRuleType',
      label: intl.get(`ssrc.sourceTemplate.model.template.bidRuleType`).d('标书规则'),
      lookupCode: 'SSRC.BID_RULE_TYPE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.bidRuleTypeTooltip`)
        .d(
          '用来配置是否区分专家类型进行评分。专家评分为线上专家评分时可以修改。默认为不区分。不区分，寻源单创建时维护专家可以选择所有专家；分商务/技术，寻源单创建时维护专家只能选择对应类型的专家。'
        ),
    },
    {
      name: 'openBidOrder',
      label: intl.get(`ssrc.sourceTemplate.model.template.openBidOrder`).d('评标步制'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.openBidOrderTooltip`)
        .d(
          '用来配置专家评分的流程。标书规则为分商务/技术时可以修改。同步评标时，全部专家评分后可以推荐成交候选人；先技术后商务时，先技术专家评分并确认汇总，后商务专家评分并确认汇总，最后推荐成交候选人；先商务后技术时，先商务专家评分并确认汇总，后技术专家评分并确认汇总，最后推荐成交候选人。'
        ),
      lookupCode: 'SSRC.OPEN_BID_ORDER',
    },
    {
      name: 'initialReview',
      label: intl.get(`ssrc.sourceTemplate.model.template.complianceCheck`).d('符合性检查'),
      lookupCode: 'SSRC.INITIAL_REVIEW',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.complianceCheckTitle`)
        .d('用于配置专家评分前是否进行符合性检查。'),
    },
    {
      name: 'expertSource',
      label: intl.get(`ssrc.sourceTemplate.model.template.expertSource`).d('专家来源'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.expertSourceTitle`)
        .d(
          '用于配置专家的取值。当专家评分为线上专家评分时，专家来源为空且不可编辑。为专家库时，专家取自专家库；为子账户时，专家取自子账户。'
        ),
      lookupCode: 'SSRC.EXPERT_SOURCE',
    },
    {
      name: 'templateScoreType',
      label: intl.get(`ssrc.sourceTemplate.model.template.scoreMethod`).d('评分方式'),
      lookupCode: 'SSRC.TEMPLATE_SCORE_TYPE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.matchScoreMethodTitle`)
        .d('限用于配置寻源单评分要素录入方式，可选择分值法、权重法。'),
    },
    {
      name: 'scoreIndicFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.scoreIndicFlag`)
        .d('允许编辑寻源单时无专家&评分要素'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.scoreIndicFlagDescription`)
        .d('单据维护时选定专家评分，可以不维护专家及评分要素。'),
    },
    {
      name: 'leaderNoScoreFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.leaderWithoutScoring`)
        .d('允许评分负责人不参与打分'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.modle.template.leaderWithoutScoringTitle`)
        .d('用于配置是否为评分负责人默认分配评分要素，勾选表示不分配，不勾选表示分配。'),
    },
    {
      name: 'noneExpertFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.noneExpertFlag`)
        .d('允许编辑寻源单时无专家'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.noneExpertFlagTip`)
        .d(
          '用于配置含专家评分的寻源单据是否允许在单据发布时不维护专家信息；当单据启用了开标节点，且报价方式为密封报价，且勾选此配置项时，单据发布时不会进行专家的必填及相关校验；注：此配置项仅在启用了开标节点，且【专家评分】为线上专家评分时方可编辑'
        ),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'noneIndicateFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.noneIndicateFlag`)
        .d('允许编辑寻源单时无评分要素'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.noneIndicateFlagTip`)
        .d(
          '用于配置含专家评分的寻源单据是否允许在单据发布时不维护评分要素信息；当单据启用了开标节点，且报价方式为密封报价，且勾选此配置项时，单据发布时不会进行评分要素的必填及相关校验；注：此配置项仅在启用了开标节点，且【专家评分】为线上专家评分时方可编辑'
        ),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'scoringReportGenerationCtrl',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.ScoringReportGenerationCtrlFlag`)
        .d('评审结果附件上传管控'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.scoringReportGenerationCtrlTip`)
        .d(
          '用于配置推荐成交候选人节点是否需要上传评审结果附件，当选择不管控时，未上传评审结果附件可以提交成功；当选择强管控时，须上传评审结果附件方可提交成功；当选择弱管控时，若没有上传评审结果附件，提示后继续提交可提交成功'
        ),
      lookupCode: 'SSRC.SCORING_REPORT_CTRL_RULE',
    },
    {
      name: 'businessTechSee',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.businessTechViewConfig`)
        .d('商务/技术标隐藏配置'),
      lookupCode: 'SSRC.BUSINESS_TECH_SEE',
      help: intl
        .get(`ssrc.sourceTemplate.modle.template.businessTechViewConfigTitle`)
        .d(
          '用于控制标书规则为不区分，评标步制为同步评标时，专家在评分环节可查看的商务/技术标信息。比如，配置显示技术标/隐藏商务标，专家评分时，专家只能查看技术标信息，不能查看商务附件、单价等商务标信息。'
        ),
    },
    {
      name: 'minExpertNum',
      label: intl.get(`ssrc.sourceTemplate.model.template.minExpertNum`).d('最小专家组人数'),
      type: 'number',
      help: intl
        .get(`ssrc.sourceTemplate.modle.template.minExpertNumTitle`)
        .d('用于限制线上专家评分时维护的最少专家组人数。'),
    },
    {
      name: 'expertExtractFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.expertExtract`).d('专家抽取'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.modle.template.expertExtractTooltip`)
        .d(
          '启用后，可在询价/招标维护、过程控制页面制定抽取条件，系统随机从专家库中抽取出满足条件的专家。'
        ),
    },
    {
      name: 'expertRequirementsRule',
      label: intl
        .get('ssrc.sourceTemplate.model.template.expertRequirementsRule')
        .d('专家需求数量抽取规则'),
      lookupCode: 'SSRC_EXPERT_REQUIREMENTS_RULE',
      defaultValue: 'NONE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.expertRequirementsRuleTooltip`)
        .d(
          '用于配置启用专家抽取时，是否需要区分商务/技术组别分别设定需求的专家数量。为不区分时，只需设定抽取专家总人数；为区分商务/技术专家需求数量时，需分别设定所需技术/商务专家人数进行抽取'
        ),
    },
    {
      name: 'expertReplyFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.expertReply`).d('是否需要专家回复'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.modle.template.expertReplyTooltip`)
        .d(
          '启用专家回复时，将抽取信息发送给专家后专家可在专家回复功能下回复是否出席评标活动；不启用时，无需专家进行回复，采购员决定抽取出的专家是否出席评标活动。'
        ),
    },
    {
      name: 'repeatScoreFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.repeatScoreFlag`).d('启用全部重新评分'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.repeatScoreFlagTooltip`)
        .d('用于配置评分管理页面评分负责人是否可以操作让所有专家进行重新评分。'),
    },
    {
      name: 'clarifyRuleFlag',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.clarifyRuleFlag`)
        .d('评审澄清是否需要组长汇总'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.clarifyRuleFlagTooltip`)
        .d('用于配置专家的评审澄清是否需要组长进行汇总。'),
    },
    {
      name: 'scoreHideSupplierRule',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.scoreHideSupplierRule`)
        .d('评分中隐藏供应商信息'),
      lookupCode: 'SSRC.SCORE_HIDE_SUPPLIER_RULE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.scoreHideSupplierRuleDescription`)
        .d(
          '用于配置专家评分过程中是否需要隐藏供应商相关信息，为无需隐藏时，评分过程中供应商信息可见；为技术评分中隐藏时，在技术专家评分过程中供应商信息不可见'
        ),
    },
    {
      name: 'autoScorePriceType',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.autoScorePriceType`)
        .d('自动评分价格取值'),
      lookupCode: 'SSRC.AUTO_SCORE_PRICE_TYPE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.autoScorePriceTypeHelp`)
        .d('用于配置在专家评分自动打分的评分要素计算时，取什么价来进行计算'),
    },
    {
      name: 'reviewHidePrice',
      label: intl
        .get('ssrc.sourceTemplate.model.template.reviewHidePrice')
        .d('符合性检查是否隐藏价格信息'),
      lookupCode: 'SSRC.COMPLIANCE_CHECK_HIDE_PRICE',
      defaultValue: 'NO_HIDE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.reviewHidePriceHelp`)
        .d(
          '用于配置专家评分符合性检查过程中是否需要隐藏价格相关信息，为无需隐藏时，价格信息对审查员可见；为隐藏时，价格信息对审查员不可见'
        ),
    },
    {
      name: 'onlyReviewExpertFlag',
      label: intl
        .get('ssrc.sourceTemplate.model.template.onlyReviewExpert')
        .d('允许专家仅参与符合性检查'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.onlyReviewExpertHelp`)
        .d('用于配置是否允许在单据维护时仅需要给专家分配符合性检查评分要素。'),
    },
  ],
});

const bargainRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get(`ssrc.sourceTemplate.model.template.bargainRuleNode`).d('议价发起节点'),
      name: 'bargainRule',
      lookupCode: 'SSRC.BARGAIN_RULE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.bargainRuleTip`)
        .d(
          '用来配置在什么环节可以进行议价；发起议价后，可以部分物料发起（非密封）议价。为核价阶段发起议价时，核价时可以发起议价；为评审阶段发起议价时，评分中和评分汇总时可以发起议价；为均允许发起议价时，核价、评分中和评分汇总时可以发起议价。'
        ),
    },
    {
      name: 'bargainOfflineFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.bargainOfflineFlag`).d('允许线下议价'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.bargainOfflineFlagTooltip`)
        .d(
          '用来配置是否可以线下议价。当议价规则不为不允许发起议价时，可以勾选允许线下议价。勾选后，可以在对应的议价阶段线下报价；不勾选则不能线下议价。'
        ),
    },
  ],
});

const roundQuotationRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'roundQuotationRule',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.roundQuotationRuleNode`)
        .d('多轮报价发起节点'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.newRoundQuotationRuleTooltip`)
        .d(
          '用来配置在什么环节可以进行多轮报价；发起多轮报价后，全部物料发起（密封）多轮报价。为自动发起多轮报价时，系统自动根据寻源单维护时设置的每个轮次的起止时间发起多轮报价'
        ),
      lookupCode: 'SSRC.ROUND_QUOTATION_RULE',
    },
    {
      name: 'openEliminateFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.openEliminateFlag`).d('启用逐轮淘汰'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.openElFlagDescription`)
        .d('用于定义多轮报价环节是否可淘汰供应商报价。'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'roundQuotationRankFlag',
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.showRoundQuotationRank')
        .d('显示多轮报价排名'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.showRoundRank`)
        .d('该字段控制供应商在多轮报价每轮截止后是否可查看到之前轮次自己的排名'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'roundQuotationRankRule',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.RoundQuotationRule`)
        .d('多轮报价排名规则'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.roundQuotationRankRuleTip`)
        .d(
          '勾选显示多轮报价排名时，配置排名规则。选择基准价，物料行的上一轮排名和多轮报价历史表格内则按照业务规则定义设置的基准价显示排名，否则按照含税、未税单价显示排名。多轮报价信息表内也随之按照含税总价或未税总价排名'
        ),
      lookupCode: 'SSRC.ROUND_RANK_RULE',
    },
    {
      name: 'quotationRounds',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.roundQuotationRoundNumber`)
        .d('多轮报价轮次'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.roundQuotationRoundNumberTooltip`)
        .d('用来配置自动发起多轮报价的轮次'),
      type: 'number',
    },
  ],
});

const checkPriceRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'budgetControlRule',
      label: intl.get(`ssrc.sourceTemplate.model.template.budgetControlRule`).d('预算控制规则'),
      lookupCode: 'SSRC.BUDGET_CONTROL_RULE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.budgetControlRuleTitle`)
        .d(
          '用来配置在核价或定标如何控制成本小于预算。不管控时，当成交金额小于预算金额，提交成功；强管控成交金额小于预算金额时，当成交金额小于预算金额，提交失败；成交金额超预算时仅提示时，当成交金额小于预算金额，提示超预算后继续提交可提交成功。'
        ),
    },
    {
      name: 'onlyAllowAllWinBids',
      label: intl.get(`ssrc.sourceTemplate.model.template.onlyAllowAllWinBids`).d('仅允许整单中标'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl
        .get(`ssrc.sourceTemplate.model.template.onlyAllowAllWinBidsTip`)
        .d(
          '当询价/招投标单据的报价范围为全部报价，或竞价单据的竞价对象为总价时，此配置项可编辑。勾选表示只能整单选择单个或多个供应商，不勾选表示可以区分物料选择供应商。'
        ),
    },
    {
      name: 'checkRecommendationStrategy',
      label: intl.get(`ssrc.sourceTemplate.model.template.selectedStandard`).d('选用标准'),
      lookupCode: 'SSRC.CHECK_RECOMMENDATION_STRATEGY',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.selectedStandardTooltip`)
        .d(
          '选用规则代表本次寻源核价/定标时的选用标准是按照价格优先还是评分优先。影响到核价/定标时自动推荐是按照价格还是按照评分推荐，且核价/定标时供应商排名会按照对应价格或分数排序。'
        ),
    },
    {
      name: 'checkSelectionDimension',
      label: intl.get(`ssrc.sourceTemplate.model.template.selectedDimension`).d('选用维度'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.selectedDimensionTooltip`)
        .d(
          '该选项代表核价/定标时，是否允许核价/定标员按每行物料分别选用供应商，或者仅允许按照供应商。'
        ),
      lookupCode: 'SSRC.CHECK_SELECTION_DIMENSION',
    },
    {
      name: 'selectionStrategy',
      label: intl.get(`ssrc.sourceTemplate.model.template.selectionStrategy`).d('选择策略'),
      lookupCode: 'SSRC.RFX_SELECTION_STRATEGY',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.selectionStrategyTemplateLable`)
        .d('用于配置核价阶段默认的选择策略。'),
    },
    {
      name: 'checkItemQuantityCtrlMethod',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.checkItemQuantityCtrlMethod`)
        .d('核价分配数量管控'),
      lookupCode: 'SSRC.CHECK_ITEM_NUMBER_RULE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.checkItemQuantityCtrlMethodTooltip`)
        .d('用于配置核价/定标时是否管控物料的分配数量/比例必须小于等于需求数量。'),
    },
  ],
});

// 中标规则DS
const winBidRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'winMessageFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.winMessageFlag`).d('自动发送中标通知'),
    },
    {
      name: 'autoSendBidNoticeFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.winNoticeFlag`).d('自动发送中标公告'),
    },
    {
      name: 'loseMessageFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.loseMessageFlag`).d('自动发送未中标通知'),
    },
    {
      name: 'noticeDays',
      label: intl.get(`ssrc.sourceTemplate.model.template.noticeDays`).d('公告天数'),
    },
    {
      name: 'visibleRangeType',
      label: intl.get(`ssrc.sourceTemplate.model.template.visibleRangeType`).d('可见范围'),
      lookupCode: 'SSRC.NOTICE_VISIBLE_RANGE_TYPE',
    },
    {
      name: 'nameVisibleType',
      label: intl.get('ssrc.common.supplierName').d('供应商名称'),
      lookupCode: 'SSRC.VISIBLE_TYPE',
    },
    {
      name: 'priceVisibleType',
      label: intl.get(`ssrc.sourceTemplate.model.template.bieWinnerPrice`).d('中标价格'),
      lookupCode: 'SSRC.VISIBLE_TYPE',
    },
    {
      name: 'quantityVisibleType',
      label: intl.get(`ssrc.sourceTemplate.model.template.quantityVisibleType`).d('中标数量'),
      lookupCode: 'SSRC.VISIBLE_TYPE',
    },
    {
      name: 'expertVisibleType',
      label: intl.get(`ssrc.sourceTemplate.model.template.expertVisibleType`).d('评审专家'),
      lookupCode: 'SSRC.VISIBLE_TYPE',
    },
    {
      name: 'expandResultsFlag',
      label: intl.get(`ssrc.sourceTemplate.model.template.expandResults`).d('拓展寻源结果'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.expandResultsTooltip`)
        .d(
          '启用拓展寻源结果，可以在单据发布时维护寻源结果需要拓展给其他公司或其他库存组织；不启用则无法拓展给其他组织。'
        ),
      trueValue: 1,
      falseValue: 0,
    },
  ],
});

// 唱标规则DS
const bidAnnouncementRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'enableBidAnnouncementFlag',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.enableBidAnnouncementFlag`)
        .d('是否启用唱标'),
    },
    {
      name: 'bidAnnouncementType',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementType`)
        .d('唱标价格公开范围'),
      lookupCode: 'SSRC.BID_ANNOUNCEMENT_TYPE',
    },
    {
      name: 'bidAnnouncementContent',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementContent`)
        .d('唱标内容选择'),
      lookupCode: 'SSRC.BID_ANNOUNCEMENT_SCOPE_CODE',
    },
    {
      name: 'bidAnnouncementTarget',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementTarget`).d('接收对象选择'),
      lookupCode: 'SSRC.BID_ANNOUNCEMENT_SCOPE_CODE',
    },
    {
      name: 'showSupplierName',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.showSupplierName`)
        .d('是否显示供应商名称'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'showHistoricalPriceVersion',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.showHistoricalPriceVersion`)
        .d('是否展示历史价格版本'),
      lookupCode: 'HPFM.FLAG',
    },
  ],
});

// RF的DS
const rfApproveRuleDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'releaseApproveType',
      label: intl.get(`ssrc.sourceTemplate.model.template.releaseAT`).d('发布审批'),
      lookupCode: 'SSRC.PRICE_LIB_APPROVE_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.releaseRfApproveTypeTitle`)
        .d(
          '用于配置征询单发布时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'resultApproveType',
      label: intl.get(`ssrc.sourceTemplate.model.template.sureSupplierAT`).d('确定供应商审批'),
      lookupCode: 'SSRC.PRICE_LIB_APPROVE_METHOD',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.resultRfApproveTypeTitle`)
        .d(
          '用于配置征询单确认入围供应商时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
    {
      name: 'clarifyApproveType',
      label: intl
        .get(`ssrc.sourceTemplate.model.template.clarifyApproval`)
        .d('澄清答疑澄清函发布审批'),
      lookupCode: 'SSRC.APPROVE_TYPE',
      help: intl
        .get(`ssrc.sourceTemplate.model.template.clarifyApprovalTooltip`)
        .d(
          '用于配置澄清答疑澄清函发布时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
        ),
    },
  ],
});

const rfReleaseDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'lineItemsFlag',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.lineItemsFlag').d('启用标的物'),
      type: 'number',
    },
    {
      name: 'minVendorNumber',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.minInviteSupplier`).d('最少邀请供应商数'),
      type: 'number',
    },
    {
      name: 'noticeEndNodeCode',
      lookupCode: 'SSRC.RF_NOTICE_END_NODE_CODE',
      label: intl.get(`ssrc.sourceTemplate.model.template.noticeEndNodeCode`).d('公告终止节点'),
      help: intl
        .get(`ssrc.sourceTemplate.model.template.noticeEndNodeCodeDescription`)
        .d('用于维护供应商报价期间需要阅读的事项须知内容。'),
    },
  ],
});

const rfQuotationDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'minQuotedSupplier',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.minQuotedSupplier`).d('最少回复供应商数'),
      type: 'number',
    },
    {
      name: 'sealedQuotationFlag',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.sealedQuotationFlag').d('密封征询'),
      type: 'number',
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.replyMethod`).d('回复方式'),
      lookupCode: 'SSRC.RF_REPLY_TYPE',
      name: 'replyType',
    },
  ],
});

const rfExpertScoreDS = () => ({
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.bidRuleType`).d('标书规则'),
      lookupCode: 'SSRC.BID_RULE_TYPE',
      name: 'bidRuleType',
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.openBidOrder`).d('评标步制'),
      lookupCode: 'SSRC.OPEN_BID_ORDER',
      name: 'openBidOrder',
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.scoreType`).d('评分方式'),
      lookupCode: 'SSRC.TEMPLATE_SCORE_TYPE',
      name: 'scoreType',
    },
  ],
});

export {
  baseInfoDS,
  approveRuleDS,
  attachRequirementDS,
  releaseRuleDS,
  quotationRuleDS,
  auctionBidDS,
  openBidDS,
  scoreRuleDS,
  bargainRuleDS,
  roundQuotationRuleDS,
  checkPriceRuleDS,
  winBidRuleDS,
  bidAnnouncementRuleDS,
  // RF的DS
  rfApproveRuleDS,
  rfReleaseDS,
  rfQuotationDS,
  rfExpertScoreDS,
};
