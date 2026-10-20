import React, { useContext, useMemo } from 'react';
import { NumberField, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import Store from '../store/index';

const AuctionBidRule = () => {
  const {
    commonDs: { auctionBidDs, baseInfoDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  const biddingModeFlag = useMemo(() => {
    return baseInfoDs?.current?.get('biddingMode');
  }, [baseInfoDs?.current?.get('biddingMode')]);

  return customizeForm(
    {
      code: getCustomizeUnitCode('delayedPriceBiddingRule'),
    },
    <Form dataSet={auctionBidDs} columns={3} labelLayout="float" useWidthPercent>
      {/* <CheckBox
        name="autoDeferFlag"
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        showHelp="tooltip"
      />
      <NumberField
        name="autoDeferPeriod"
        precision={1}
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        addonBefore={intl.get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.last').d('最后')}
        addonAfter={intl
          .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
          .d('分钟')}
        showHelp="tooltip"
      /> */}
      {/* <Select
        name="autoDeferTimeRule"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
        clearButton={false}
        optionsFilter={renderAutoDeferTimeRule}
        showHelp="tooltip"
      /> */}
      <NumberField
        name="autoDeferDuration"
        precision={1}
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        addonAfter={intl
          .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
          .d('分钟')}
        showHelp="tooltip"
      />
      {/* <NumberField
        name="maxDeferCount"
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        showHelp="tooltip"
      /> */}
      <NumberField name="deferBiddingAllowedQuotationCount" showHelp="tooltip" />
      <Select name="autoDeferType" clearButton={false} showHelp="tooltip" />
    </Form>
  );
};

export default observer(AuctionBidRule);
