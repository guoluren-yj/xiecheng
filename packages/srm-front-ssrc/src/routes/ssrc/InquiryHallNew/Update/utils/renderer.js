import React from 'react';
import { observer } from 'mobx-react';
import { Tooltip, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { phoneRender } from '@/utils/renderer';

// 预审小组lov tooltip
const renderpretialMemberLovTooltip = (value = {}) => {
  const { realName = null, email = null, phone = null, internationalTelCodeMeaning = null } =
    value || {};

  return (
    <Tooltip
      title={
        <div>
          <div>Name: {realName}</div>
          <div>Email: {email}</div>
          <div>Phone: {phoneRender(internationalTelCodeMeaning, phone)}</div>
        </div>
      }
    >
      {realName}
    </Tooltip>
  );
};

const CheckBoxWithLinkRender = observer((props = {}) => {
  const { checkboxProps = {}, children = null } = props;

  return (
    <React.Fragment>
      <span style={{ display: 'flex', alignItem: 'center' }}>
        <CheckBox {...checkboxProps} />
        {children}
      </span>
    </React.Fragment>
  );
});


// 封底/封顶价 判断类别
const getTopOrBottomPriceCategory = ({ biddingMode, biddingQuotationMethod, }) => {
  let topFlag = 0; // 封顶
  let bottomFlag = 0; // 封底

  if (biddingMode === "JAPANESE_BIDDING") {
    if (biddingQuotationMethod === 'BIDDING') {
      bottomFlag = 1;
    }
    if (biddingQuotationMethod === 'AUCTION') {
      topFlag = 1;
    }
  }

  if (biddingMode === "DUTCH_BIDDING") {
    if (biddingQuotationMethod === 'BIDDING') {
      topFlag = 1;
    }
    if (biddingQuotationMethod === 'AUCTION') {
      bottomFlag = 1;
    }
  }

  const result = {
    topFlag,
    bottomFlag,
  };
  return result;
};

// 起竞价/起拍价 类别
const getBiddingOrAuctionPriceCategory = ({ biddingMode, biddingQuotationMethod, }) => {
  let biddingPriceFlag = 0; // 起竞价
  let auctionPriceFlag = 0; // 起拍价

  if (biddingMode === 'BRITISH_BIDDING') {
    if (biddingQuotationMethod === 'AUCTION') {
      auctionPriceFlag = 1;
    }
    if (biddingQuotationMethod === 'BIDDING') {
      biddingPriceFlag = 1;
    }
  }

  if (biddingMode === "JAPANESE_BIDDING") {
    if (biddingQuotationMethod === 'BIDDING') {
      biddingPriceFlag = 1;
    }
    if (biddingQuotationMethod === 'AUCTION') {
      auctionPriceFlag = 1;
    }
  }

  if (biddingMode === "DUTCH_BIDDING") {
    if (biddingQuotationMethod === 'BIDDING') {
      auctionPriceFlag = 1;
    }
    if (biddingQuotationMethod === 'AUCTION') {
      biddingPriceFlag = 1;
    }
  }

  const result = {
    biddingPriceFlag,
    auctionPriceFlag,
  };
  return result;
};

const biddingDisclosePriceTitle = (data) => {
  const topPrice = intl.get('ssrc.common.model.biddingDisclosePriceTop').d('封顶价');
  const bottomPrice = intl.get('ssrc.common.model.biddingDisclosePriceBottom').d('封底价');
  let label = topPrice;

  const {
    topFlag,
    bottomFlag,
  } = getTopOrBottomPriceCategory(data);

  if (bottomFlag === 1) {
    label = bottomPrice;
  }
  if (topFlag === 1) {
    label = topPrice;
  }
  return label;
};

const trialBiddingDisclosePriceTitle = (data) => {
  const topPrice = intl
    .get('ssrc.common.model.biddingTrialDisclosePriceTop')
    .d('试竞价封顶价');
  const bottomPrice = intl
    .get('ssrc.common.model.biddingTrialDisclosePriceBottom')
    .d('试竞价封底价');
  let label = topPrice;

  const {
    topFlag,
    bottomFlag,
  } = getTopOrBottomPriceCategory(data);

  if (bottomFlag === 1) {
    label = bottomPrice;
  }
  if (topFlag === 1) {
    label = topPrice;
  }

  return label;
};


const startingBiddingPriceTitle = (data) => {
  const biddingTtitle = intl.get('ssrc.inquiryHall.model.biddingRules.startingBiddingPrice').d('起竞价');
  const auctionTitle = intl
    .get('ssrc.inquiryHall.model.biddingRules.startingAuctionPrice')
    .d('起拍价');

  const {
    biddingPriceFlag,
    auctionPriceFlag,
  } = getBiddingOrAuctionPriceCategory(data);

  let label = "";
  if (biddingPriceFlag === 1) {
    label = biddingTtitle;
  }
  if (auctionPriceFlag === 1) {
    label = auctionTitle;
  }

  return label;
};

const trialStartingBiddingPriceTitle = (data) => {
  const biddingTtitle = intl
    .get('ssrc.inquiryHall.model.biddingRules.trialStartingBiddingPrice')
    .d('试竞价起竞价');
  const auctionTitle = intl
    .get('ssrc.inquiryHall.model.biddingRules.trialStartingAuctionPrice')
    .d('试竞价起拍价');

  const {
    biddingPriceFlag,
    auctionPriceFlag,
  } = getBiddingOrAuctionPriceCategory(data);

  let label = "";
  if (biddingPriceFlag === 1) {
    label = biddingTtitle;
  }
  if (auctionPriceFlag === 1) {
    label = auctionTitle;
  }

  return label;
};

export {
  renderpretialMemberLovTooltip,
  CheckBoxWithLinkRender,
  biddingDisclosePriceTitle,
  trialBiddingDisclosePriceTitle,
  startingBiddingPriceTitle,
  trialStartingBiddingPriceTitle,
  getTopOrBottomPriceCategory,
  getBiddingOrAuctionPriceCategory,
};
