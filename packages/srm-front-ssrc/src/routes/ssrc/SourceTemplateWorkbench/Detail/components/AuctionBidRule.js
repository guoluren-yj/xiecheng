import React, { useContext, useMemo } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import intl from 'utils/intl';

import Store from '../store/index';

const AuctionBidRule = () => {
  const {
    commonDs: { baseInfoDs, auctionBidDs },
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
    <Form
      dataSet={auctionBidDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      {/* <Output
        name="autoDeferFlag"
        showHelp="label"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING'}
        renderer={({ value }) => yesOrNoRender(value)}
      /> */}
      {/* <Output
        name="autoDeferPeriod"
        showHelp="label"
        hidden={!biddingFlag || biddingModeFlag !== 'BRITISH_BIDDING' || !autoDeferFlag}
        renderer={({ value }) => {
          if (!isNil(value)) {
            return `${intl
              .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.last')
              .d('最后')}${value}${intl
              .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
              .d('分钟')}`;
          }
          return null;
        }}
      /> */}
      {/* <Output
        name="autoDeferTimeRule"
        showHelp="label"
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
      /> */}
      <Output
        name="autoDeferDuration"
        showHelp="label"
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        renderer={({ value }) => {
          if (!isNil(value)) {
            return `${value}${intl
              .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
              .d('分钟')}`;
          }
          return null;
        }}
      />
      {/* <Output name="biddingTotalDelayLimit" hidden={!biddingFlag || biddingModeFlag!=='BRITISH_BIDDING' || !autoDeferFlag} /> */}
      {/* <Output
        name="maxDeferCount"
        showHelp="label"
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        renderer={({ value }) =>
          isNil(value) ? intl.get(`ssrc.common.view.noRestrictions`).d('不限制') : value
        }
      /> */}
      <Output
        name="deferBiddingAllowedQuotationCount"
        showHelp="label"
        hidden={biddingModeFlag !== 'BRITISH_BIDDING'}
        renderer={({ value }) =>
          isNil(value) ? intl.get(`ssrc.common.view.noRestrictions`).d('不限制') : value
        }
      />
      <Output name="autoDeferType" showHelp="label" />
    </Form>
  );
};

export default observer(AuctionBidRule);
