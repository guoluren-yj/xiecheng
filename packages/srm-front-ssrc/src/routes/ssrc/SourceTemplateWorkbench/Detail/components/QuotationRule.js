/* eslint-disable no-unused-expressions */
import React, { useContext, useMemo } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil, noop } from 'lodash';

import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import Store from '../store/index';

const QuotationRule = (props) => {
  const {
    commonDs: { quotationRuleDs, baseInfoDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);
  const {
    nodeValue,
    // britishBidding = noop,
    japanBiddingFlag = noop,
    japOrDutchBidding = noop,
  } = props;

  // const britishBiddingFlag = britishBidding();

  const japanBidding = japanBiddingFlag();

  // 新竞价标识
  const biddingFlag = useMemo(() => {
    return baseInfoDs?.current?.get('sourceCategory') === 'RFA';
  }, [baseInfoDs?.current?.get('sourceCategory')]);

  // 询价新招标标识
  const inquiryFlag = useMemo(() => {
    return ['RFQ', 'NEW_BID'].includes(baseInfoDs?.current?.get('sourceCategory'));
  }, [baseInfoDs?.current?.get('sourceCategory')]);

  // 竞价模式标识
  const biddingModeFlag = useMemo(() => {
    return baseInfoDs?.current?.get('biddingMode');
  }, [baseInfoDs?.current?.get('biddingMode')]);

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
  // const whetherAdjustTimeShow = () => {
  //   const { current } = quotationRuleDs || {};
  //   const { biddingTarget, biddingQuotationOrder } = current
  //     ? current.get(['biddingTarget', 'biddingQuotationOrder'])
  //     : {};

  //   const biddingPreviewRuleVisible =
  //     (biddingTarget === 'UNIT_PRICE' && biddingQuotationOrder === 'PARALLEL') ||
  //     biddingTarget === 'TOTAL_PRICE';
  //   const flag = biddingPreviewRuleVisible && biddingFlag;

  //   return flag;
  // };

  const getFields = () => {
    const fields = [
      <Output
        name="tenderFeeFlag"
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output name="bidBondFlag" renderer={({ value }) => yesOrNoRender(value)} showHelp="label" />,
      <Output name="auctionDirection" hidden={!inquiryFlag} showHelp="label" />,
      <Output
        name="continuousQuotationFlag"
        hidden={!inquiryFlag}
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output
        name="multiCurrencyFlag"
        hidden={!inquiryFlag}
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output
        name="diyLadderQuotationFlag"
        hidden={!inquiryFlag}
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output name="detailPriceControlRule" hidden={!inquiryFlag} showHelp="label" />,
      <Output name="biddingQuotationMethod" hidden={!biddingFlag} showHelp="label" />,
      // <Output name="biddingMode" hidden={!biddingFlag} showHelp="label" />,
      <Output name="quotationType" showHelp="label" />,
      <Output name="biddingTarget" hidden={!biddingFlag} showHelp="label" />,
      <Output
        name="biddingQuotationOrder"
        showHelp="label"
        hidden={!biddingFlag || quotationRuleDs?.current?.get('biddingTarget') !== 'UNIT_PRICE'}
      />,
      <Output
        name="biddingStrategy"
        showHelp="label"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
      />,
      <Output name="openRule" hidden={!biddingFlag} showHelp="label" />,
      // {/* <Output
      //   name="auctionRule"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
      // /> */}
      <Output name="rankRule" hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'} />,
      // {/* <Output
      //   name="autoDeferFlag"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
      //   renderer={({ value }) => yesOrNoRender(value)}
      // />
      // <Output
      //   name="autoDeferPeriod"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   renderer={({ value }) => {
      //     if (!isNil(value)) {
      //       return `${intl
      //         .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.last')
      //         .d('最后')}${value}${intl
      //         .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
      //         .d('分钟')}`;
      //     }
      //     return null;
      //   }}
      // />
      // <Output
      //   name="autoDeferType"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      // />
      // <Output
      //   name="autoDeferTimeRule"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      // />
      // <Output
      //   name="autoDeferDuration"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   renderer={({ value }) => {
      //     if (!isNil(value)) {
      //       return `${value}${intl
      //         .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
      //         .d('分钟')}`;
      //     }
      //     return null;
      //   }}
      // /> */}
      // {/* <Output name="biddingTotalDelayLimit" hidden={!biddingFlag || biddingModeFlag!=='BRITISH_BIDDING' || !autoDeferFlag} /> */}
      // {/* <Output
      //   name="maxDeferCount"
      //   showHelp="label"
      //   hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
      //   renderer={({ value }) =>
      //     isNil(value) ? intl.get(`ssrc.common.view.noRestrictions`).d('不限制') : value
      //   }
      // /> */}
      <Output
        name="biddingAllowedQuotationCount"
        showHelp="label"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
        renderer={({ value }) =>
          isNil(value) ? intl.get(`ssrc.common.view.noRestrictions`).d('不限制') : value
        }
      />,
      <Output name="quotationScope" hidden={!inquiryFlag} showHelp="label" />,
      <Output
        name="sealedQuotationFlag"
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output
        name="biddingAnonymousQuotesFlag"
        showHelp="label"
        hidden={!biddingFlag}
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output name="minQuotedSupplier" showHelp="label" />,
      <Output
        name="quotationDtlTotalPriceWriteFlag"
        showHelp="label"
        hidden={!inquiryFlag || !quotationRuleFlag}
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      // <Output name="taxChangeFlag" renderer={({ value }) => yesOrNoRender(value)} showHelp="label" />,
      // <Output name="quantityChangeFlag" renderer={({ value }) => yesOrNoRender(value)} showHelp="label" />,
      biddingFlag && (
        <Output
          name="allowProhibitQuotation"
          renderer={({ value }) => yesOrNoRender(value)}
          showHelp="label"
          hidden
        />
      ),
      biddingFlag && (
        <Output
          name="allowDeleteLatestQuotation"
          renderer={({ value }) => yesOrNoRender(value)}
          showHelp="label"
          hidden
        />
      ),
      <Output
        name="biddingAllowAdjustTimeFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
        hidden={!biddingFlag}
      />,
      <Output name="biddingAllowAdjustTimeType" showHelp="label" hidden={!biddingFlag} />,
      <Output
        name="chatEnableFlag"
        hidden={!biddingFlag}
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output name="biddingEliminateRoundNumber" hidden={!japanBidding} showHelp="label" />,
      <Output name="biddingMinShortlistedSupplierNumber" hidden={!japanBidding} showHelp="label" />,
      <Output name="biddingEndType" hidden={!japOrDutchBidding()} showHelp="label" />,
      <Output name="lackQuotationTriggersType" showHelp="label" />,
    ].filter(Boolean);

    return fields;
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('quotationRule'),
    },
    <Form
      dataSet={quotationRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      {getFields()}
    </Form>
  );
};

export default observer(QuotationRule);
