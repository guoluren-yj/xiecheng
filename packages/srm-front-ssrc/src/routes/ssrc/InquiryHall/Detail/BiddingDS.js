import intl from 'utils/intl';

import { getDateTimeFormat } from 'utils/utils';
import {
  biddingDisclosePriceTitle,
  trialBiddingDisclosePriceTitle,
  startingBiddingPriceTitle,
  trialStartingBiddingPriceTitle,
} from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';

// 商务要求
const BiddingBusinessRequestDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidFileExpense').d('招标文件费(元)'),
        name: 'bidFileExpense',
        disabled: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)'),
        name: 'bidBond',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowServiceExpenseCharge')
          .d('是否收取服务费'),
        name: 'serviceExpenseChargeFlag',
        disabled: true,
        type: 'number',
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
    ],
  };
};

// 竞价时间
const BiddingTimeDS = () => {
  return {
    autoCreate: true,
    fields: [
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
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signInEndDate`).d(`签到截止时间`),
        name: 'signInEndDate',
        showType: 'dateTime',
        format: getDateTimeFormat(),
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
        showshowType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingEndDate`)
          .d(`试竞价截止时间`),
        name: 'startingTrialBiddingEndDate',
        showType: 'dateTime',
        format: getDateTimeFormat(),
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
        /**
         * 新竞价特殊逻辑=》正式竞价选择： 自定义时间 or 试竞价截止即开始 or 签到截止即开始 or 资格预审截止即开始 or 发布即开始 标识
         */
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
        name: 'startFlag',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.biddingTime.biddingStartTime`).d('竞价开始时间'),
        name: 'quotationStartDate',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.biddingTime.biddingEndDate`).d('竞价截止时间'),
        name: 'quotationEndDate',
        disabled: true,
        showType: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间'),
        name: 'quotationRunningDuration',
        type: 'number',
        disabled: true,
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
        showType: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceRunningDuration`)
          .d('补充单价运行时间'),
        name: 'biddingSupplementPriceRunningDuration',
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferType`).d('延时触发规则'),
      //   name: 'autoDeferTypeMeaning',
      //   disabled: true,
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
        name: 'autoDeferDuration',
        type: 'number',
        disabled: true,
      },
      // {
      //   label: intl.get('ssrc.sourceTemplate.model.template.maxDeferCount').d('最大延时次数'),
      //   name: 'maxDeferCount',
      //   type: 'number',
      //   disabled: true,
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferFlag`).d('启用自动延时'),
        name: 'autoDeferFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        disabled: true,
      },
    ],
  };
};

// 竞价规则
const BiddingRuleDS = () => {
  // DUTCH_BIDDING 日式/荷兰 总价
  const japOrDutchBiddingTotal = ({ record }) => {
    const { biddingTarget, biddingMode } = record.get(['biddingTarget', 'biddingMode']) || {};

    const flag =
      (biddingMode === 'JAPANESE_BIDDING' || biddingMode === 'DUTCH_BIDDING') &&
      biddingTarget === 'TOTAL_PRICE';
    return flag;
  };

  return {
    autoCreate: true,
    fields: [
      // 竞价大厅-竞价规则
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingTarget').d('竞价对象'),
        name: 'biddingTargetMeaning',
        type: 'string',
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
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingStrategy').d('出价策略'),
        name: 'biddingStrategyMeaning',
        type: 'string',
      },
      {
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountFormalBidding`)
          .d('允许报价次数(正式竞价)'),
        name: 'biddingAllowedQuotationCount',
        type: 'number',
      },
      {
        name: 'deferBiddingAllowedQuotationCount',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`)
          .d('允许报价次数(延时竞价)'),
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.rankRule').d('排名规则'),
        name: 'rankRuleMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.biddingRules.openRuleOfData`).d('数据公开规则'),
        name: 'openRuleMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
        name: 'sealedQuotationFlag',
        type: 'string',
        disabled: true,
      },
      {
        name: 'startingBiddingPrice',
        type: 'number',
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = startingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });
            return label;
          },
        },
      },
      {
        name: 'trialStartingBiddingPrice',
        type: 'number',
        min: '0',
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = trialStartingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });
            return label;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        name: 'floatTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        name: 'quotationRange',
        dynamicProps: {
          label({ record }) {
            let label = intl
              .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRange')
              .d('报价幅度');

            const flag = japOrDutchBiddingTotal({ record });

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeBiddingPrice')
                .d('叫价幅度');
            }

            return label;
          },
        },
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
        label: intl.get('ssrc.inquiryHall.model.biddingRules.unitBiddingRule').d('单价竞价规则'),
        name: 'biddingUnitPriceRuleMeaning',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
      },
      {
        label: intl.get('ssrc.biddingHall.view.message.biddingSpreadPrice').d('价差'),
        name: 'biddingSpreadPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferType`).d('延时触发规则'),
        name: 'autoDeferTypeMeaning',
      },
      {
        name: 'isBritishBidTrafficLight',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.isBritishBidTrafficLight`)
          .d('启用红绿灯'),
      },
      {
        name: 'isBritishBidLowestPriceGreen',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.isBritishBidLowestPriceGreen`)
          .d('最低价绿灯'),
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceLowerLimit').d('目标价下限'),
        name: 'targetPriceLowerLimit',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceUpperLimit').d('目标价上限'),
        name: 'targetPriceUpperLimit',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceLowerLimit')
          .d('试竞价目标价下限'),
        name: 'trialTargetPriceLowerLimit',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceUpperLimit')
          .d('试竞价目标价上限'),
        name: 'trialTargetPriceUpperLimit',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.trialBiddingSymbol').d('试竞价标识'),
        name: 'biddingTrialBiddingFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.signInOnline').d('在线签到'),
        name: 'biddingOnlineSignInFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferFlag`).d('启用自动延时'),
        name: 'autoDeferFlag',
      },
      {
        name: 'biddingIntervalDuration',
        label: intl.get(`ssrc.common.model.template.biddingIntervalDuration`).d('叫价间隔时长'),
      },
      {
        name: 'biddingEliminateRoundNumber',
        label: intl.get(`ssrc.common.model.template.biddingEliminateRoundNumber`).d('供方淘汰规则'),
        type: 'string',
      },
      {
        name: 'biddingMinShortlistedSupplierNumber',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingMinShortlistedSupplierNumber`)
          .d('最少入围供应商数'),
      },
      {
        name: 'biddingEndType',
        label: intl.get('ssrc.common.model.template.biddingEndType').d('竞价结束方式'),
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
          lookupCode({ record }) {
            const biddingMode = record.get('biddingMode');

            let code = 'SSRC_BIDDING_JAPANESE_END_TYPE';

            if (biddingMode === 'DUTCH_BIDDING') {
              code = 'SSRC_BIDDING_DUTCH_END_TYPE';
            }

            return code;
          },
        },
      },
      {
        name: 'biddingDisclosePrice',
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = biddingDisclosePriceTitle({ biddingQuotationMethod, biddingMode });

            return label;
          },
        },
      },
      {
        name: 'biddingTrialDisclosePrice',
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = trialBiddingDisclosePriceTitle({ biddingQuotationMethod, biddingMode });

            return label;
          },
        },
      },
      {
        name: 'biddingMinShortlistedSupplierNumber',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingMinShortlistedSupplierNumber`)
          .d('最少入围供应商数'),
      },
      {
        name: 'biddingEstimatedRoundNumber',
        label: intl.get(`ssrc.common.model.expectedMaxRounds`).d('预期最多轮次'),
      },
      {
        name: 'biddingEstimatedTrialRoundNumber',
        label: intl.get(`ssrc.common.model.expectedTrialBiddingMaxRounds`).d('试竞价预期最多轮次'),
      },
      {
        name: 'biddingTrialQuotationRange',
        dynamicProps: {
          label({ record }) {
            let label = intl
              .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeTrial')
              .d('试竞价报价幅度');

            const flag = japOrDutchBiddingTotal({ record });

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationPriceRangeTrial')
                .d('试竞价叫价幅度');
            }

            return label;
          },
        },
      },
    ],
  };
};

export { BiddingBusinessRequestDS, BiddingTimeDS, BiddingRuleDS };
