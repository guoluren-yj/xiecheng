/* eslint-disable no-unused-expressions */
import React, { useContext, useMemo } from 'react';
import { Select, NumberField, CheckBox, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

// import intl from 'utils/intl';

import Store from '../store/index';

const QuotationRule = (props) => {
  const {
    commonDs: { quotationRuleDs, baseInfoDs, checkPriceRuleDs, releaseRuleDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);
  const {
    delayBidFlag = false,
    nodeValue,
    britishBidding = noop,
    japOrDutchBidding = noop,
    japanBiddingFlag = noop,
  } = props;

  // 新竞价标识
  const biddingFlag = useMemo(() => {
    return baseInfoDs?.current?.get('sourceCategory') === 'RFA';
  }, [baseInfoDs?.current?.get('sourceCategory')]);

  const britishBiddingFlag = britishBidding();

  const japanBidding = japanBiddingFlag();

  // 询价新招标标识
  const inquiryFlag = useMemo(() => {
    return ['RFQ', 'NEW_BID'].includes(baseInfoDs?.current?.get('sourceCategory'));
  }, [baseInfoDs?.current?.get('sourceCategory')]);

  const getBiddingMode = () => {
    return baseInfoDs?.current?.get('biddingMode');
  };

  // 竞价模式标识
  const biddingModeFlag = useMemo(() => {
    return baseInfoDs?.current?.get('biddingMode');
  }, [baseInfoDs?.current?.get('biddingMode')]);

  // const autoDeferFlag = useMemo(() => {
  //   return quotationRuleDs?.current?.get('autoDeferFlag');
  // }, [quotationRuleDs?.current?.get('autoDeferFlag')]);

  // 报价次序
  const renderBiddingQuotationOrder = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (delayBidFlag) {
      return optionValue !== 'SEQUENCE';
    }
    return optionValue;
  };

  /**
   * 报价响应不足
   * 可选项：当寻源方式=公开时，查看不到选项“部分邀请供应商未报价”；当寻源方式=邀请时，能正常查看到选项“部分邀请供应商未报价”；
   * */
  const lackQuotationTriggersTypeOptionFilter = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    const sourceMethodValue = releaseRuleDs?.current?.get('sourceMethod');
    const sourceMethodOpen = sourceMethodValue === 'OPEN' || sourceMethodValue === 'ALL_OPEN';

    if (sourceMethodOpen) {
      return optionValue !== 'PART_SUPPLIER_NO_QUOTED';
    }
    return optionValue;
  };

  // 出价策略
  const renderBiddingStrategy = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    const { biddingQuotationMethod } = quotationRuleDs?.current?.get(['biddingQuotationMethod']);
    const biddingMode = getBiddingMode();
    const lowest = biddingMode === 'BRITISH_BIDDING' && biddingQuotationMethod === 'BIDDING';
    const abovest = biddingMode === 'BRITISH_BIDDING' && biddingQuotationMethod === 'AUCTION';
    if (lowest) {
      return optionValue === 'BELOW_THE_LOWEST_PRICE' || optionValue === 'LOWER_THAN_LAST_QUOTE';
    }
    if (abovest) {
      return optionValue === 'ABOVE_MAXIMUM_PRICE' || optionValue === 'ABOVE_THAN_LAST_QUOTE';
    }
    return optionValue;
  };

  // 竞价规则过滤字段
  // const renderAuctionRule = (optionRecord) => {
  //   const optionValue = optionRecord.get('value') || null;
  //   if (quotationRuleDs?.current?.get('biddingStrategy') === 'BELOW_THE_LOWEST_PRICE') {
  //     return optionValue !== 'NONE' && optionValue !== 'TOP_THREE';
  //   }
  //   return optionValue;
  // };

  // 竞价排名规则选择禁用
  const renderRankRule = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    const sourceCategoryFlag = baseInfoDs?.current?.get('sourceCategory') === 'RFA';
    const sourceMethodFlag = releaseRuleDs?.current?.get('sourceMethod') === 'OPEN';
    if (sourceCategoryFlag && sourceMethodFlag) {
      // return ['UNIT_PRICE'].includes(optionRecord?.get?.('value'));
      return optionValue === 'UNIT_PRICE';
    } else {
      // return ['UNIT_PRICE', 'WEIGHT_PRICE'].includes(optionRecord?.get?.('value'));
      return optionValue;
    }
  };

  // 报价范围change事件
  const handleQuotationScope = (value) => {
    if (value && value === 'PART_QUOTATION') {
      checkPriceRuleDs?.current?.set('onlyAllowAllWinBids', 0);
    }
  };

  // 竞价对象change事件
  const handleBidingTarget = (value) => {
    if (value && value === 'UNIT_PRICE') {
      checkPriceRuleDs?.current?.set('onlyAllowAllWinBids', 0);
    }
  };

  // 报价方式选项过滤
  const renderQuotationType = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (biddingFlag) {
      return optionValue !== 'OFFLINE' && optionValue !== 'ON_OFF';
    }
    return optionValue;
  };

  // 数据公开规则选项过滤
  const renderOpenRule = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (
      ['BELOW_THE_LOWEST_PRICE', 'ABOVE_MAXIMUM_PRICE'].includes(
        quotationRuleDs?.current?.get('biddingStrategy')
      )
    ) {
      return (
        optionValue !== 'HIDE_IDENTITY_HIDE_QUOTE' && optionValue !== 'OPEN_IDENTITY_HIDE_QUOTE'
      );
    }
    return optionValue;
  };

  // 报价、投标规则标识
  const quotationRuleFlag = useMemo(() => {
    return (
      (baseInfoDs?.current?.get('secondarySourceCategory') ||
        baseInfoDs?.current?.get('sourceCategory')) === 'NEW_BID' || nodeValue === 'QUOTATION'
    );
  }, [
    baseInfoDs?.current?.get('secondarySourceCategory'),
    baseInfoDs?.current?.get('sourceCategory'),
    nodeValue,
  ]);

  /**
   * 竞价对象=单价+报价次序=并行  / 竞价对象=总价 时显示
   */
  // const whetherAdjustTimeShow = useCallback(() => {
  //   const { current } = quotationRuleDs || {};
  //   const { biddingTarget, biddingQuotationOrder } = current
  //     ? current.get(['biddingTarget', 'biddingQuotationOrder'])
  //     : {};

  //   const biddingPreviewRuleVisible =
  //     (biddingTarget === 'UNIT_PRICE' && biddingQuotationOrder === 'PARALLEL') ||
  //     biddingTarget === 'TOTAL_PRICE';
  //   const flag = biddingPreviewRuleVisible && biddingFlag;

  //   return flag;
  // }, [quotationRuleDs, baseInfoDs, biddingFlag]);

  const getFields = () => {
    const fields = [
      <CheckBox name="tenderFeeFlag" showHelp="tooltip" />,
      <CheckBox name="bidBondFlag" showHelp="tooltip" />,
      <Select
        name="auctionDirection"
        clearButton={false}
        hidden={!inquiryFlag}
        showHelp="tooltip"
      />,
      <CheckBox name="continuousQuotationFlag" hidden={!inquiryFlag} showHelp="tooltip" />,
      <CheckBox name="multiCurrencyFlag" hidden={!inquiryFlag} showHelp="tooltip" />,
      <CheckBox name="diyLadderQuotationFlag" hidden={!inquiryFlag} showHelp="tooltip" />,
      <Select
        name="detailPriceControlRule"
        clearButton={false}
        hidden={!inquiryFlag}
        showHelp="tooltip"
      />,
      <Select
        name="biddingQuotationMethod"
        hidden={!biddingFlag}
        clearButton={false}
        showHelp="tooltip"
      />,
      // <Select name="biddingMode" hidden={!biddingFlag} clearButton={false} showHelp="tooltip" />,
      <Select
        name="quotationType"
        clearButton={false}
        optionsFilter={renderQuotationType}
        showHelp="tooltip"
      />,
      <Select
        name="biddingTarget"
        hidden={!biddingFlag}
        clearButton={false}
        onChange={handleBidingTarget}
        showHelp="tooltip"
      />,
      <Select
        name="biddingQuotationOrder"
        hidden={!biddingFlag || quotationRuleDs?.current?.get('biddingTarget') !== 'UNIT_PRICE'}
        clearButton={false}
        showHelp="tooltip"
        optionsFilter={renderBiddingQuotationOrder}
      />,
      <Select
        name="biddingStrategy"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
        optionsFilter={renderBiddingStrategy}
        clearButton={false}
        showHelp="tooltip"
      />,
      <Select
        name="openRule"
        hidden={!biddingFlag}
        clearButton={false}
        optionsFilter={renderOpenRule}
        showHelp="tooltip"
      />,
      // <Select
      //   name="auctionRule"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
      //   optionsFilter={renderAuctionRule}
      //   clearButton={false}
      //   showHelp="tooltip"
      // />,
      <Select
        name="rankRule"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
        clearButton={false}
        optionsFilter={renderRankRule}
      />,
      // {/* <CheckBox
      //   name="autoDeferFlag"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
      //   showHelp="tooltip"
      // /> */}
      // {/* <NumberField
      //   name="autoDeferPeriod"
      //   precision={1}
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   addonBefore={intl.get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.last').d('最后')}
      //   addonAfter={intl
      //     .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
      //     .d('分钟')}
      //   showHelp="tooltip"
      // /> */}
      // {/* <Select
      //   name="autoDeferType"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   clearButton={false}
      //   showHelp="tooltip"
      // /> */}
      // {/* <Select
      //   name="autoDeferTimeRule"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   clearButton={false}
      //   optionsFilter={renderAutoDeferTimeRule}
      //   showHelp="tooltip"
      // /> */}
      // {/* <NumberField
      //   name="autoDeferDuration"
      //   precision={1}
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   addonAfter={intl
      //     .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
      //     .d('分钟')}
      //   showHelp="tooltip"
      // /> */}
      // {/* <NumberField   // 不需要此字段
      //   name="biddingTotalDelayLimit"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      // /> */}
      // {/* <NumberField
      //   name="maxDeferCount"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   showHelp="tooltip"
      // /> */}
      <NumberField
        name="biddingAllowedQuotationCount"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
        showHelp="tooltip"
      />,
      <Select
        name="quotationScope"
        clearButton={false}
        hidden={!inquiryFlag}
        onChange={handleQuotationScope}
        showHelp="tooltip"
      />,
      <CheckBox name="sealedQuotationFlag" showHelp="tooltip" />,
      <CheckBox name="biddingAnonymousQuotesFlag" hidden={!biddingFlag} showHelp="tooltip" />,
      <NumberField name="minQuotedSupplier" showHelp="tooltip" />,
      <CheckBox
        name="quotationDtlTotalPriceWriteFlag"
        hidden={!inquiryFlag || !quotationRuleFlag}
        showHelp="tooltip"
      />,
      // <CheckBox name="taxChangeFlag" showHelp="tooltip" hidden={biddingFlag} />,
      // <CheckBox name="quantityChangeFlag" showHelp="tooltip" hidden={biddingFlag} />,
      biddingFlag && <CheckBox name="allowProhibitQuotation" showHelp="tooltip" hidden />,
      biddingFlag && <CheckBox name="allowDeleteLatestQuotation" showHelp="tooltip" hidden />,
      britishBiddingFlag ? <CheckBox name="biddingAllowAdjustTimeFlag" showHelp="tooltip" /> : null,
      britishBiddingFlag ? (
        <Select name="biddingAllowAdjustTimeType" clearButton={false} showHelp="tooltip" />
      ) : null,
      <CheckBox name="chatEnableFlag" hidden={!biddingFlag} showHelp="tooltip" />,
      japanBidding ? (
        <Select name="biddingEliminateRoundNumber" clearButton={false} showHelp="tooltip" />
      ) : null,
      japanBidding ? (
        <NumberField name="biddingMinShortlistedSupplierNumber" showHelp="tooltip" />
      ) : null,
      japOrDutchBidding() ? (
        <Select name="biddingEndType" clearButton={false} showHelp="tooltip" />
      ) : null,
      <Select
        name="lackQuotationTriggersType"
        optionsFilter={lackQuotationTriggersTypeOptionFilter}
        clearButton={false}
        showHelp="tooltip"
      />,
    ].filter(Boolean);

    return fields;
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('quotationRule'),
    },
    <Form dataSet={quotationRuleDs} columns={3} labelLayout="float" useWidthPercent>
      {getFields()}
    </Form>
  );
};

export default observer(QuotationRule);
