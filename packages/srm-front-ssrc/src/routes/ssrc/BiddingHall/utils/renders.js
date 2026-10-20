/**
 * 竞价大厅
 * @date: 2023-5-09
 */

import React from 'react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

const CollectionIcon = observer((props = {}) => {
  const { collectionFlag, styles = {} } = props || {};

  const currentStyles = styles || {};

  return collectionFlag ? (
    <Icon type="star" style={{ color: '#eecc34', ...currentStyles }} />
  ) : (
    <Icon type="star_border" style={{ ...currentStyles }} />
  );
});

// 报价比例
const getRatioTitle = ({ biddingQuotationMethod }) => {
  const title =
    biddingQuotationMethod === 'AUCTION'
      ? intl.get(`ssrc.biddingHall.model.warnIncreatePriceReductionRatio`).d('警戒加价比例')
      : intl.get(`ssrc.biddingHall.model.warnDecreatePriceReductionRatio`).d('警戒降价比例');
  return title;
};

// 幅度
const getRangeTitle = ({ biddingQuotationMethod }) => {
  const title =
    biddingQuotationMethod === 'AUCTION'
      ? intl.get(`ssrc.biddingHall.model.warnIncreatePriceReductionRange`).d('警戒加价幅度')
      : intl.get(`ssrc.biddingHall.model.warnDecreasePriceReductionRange`).d('警戒降价幅度');
  return title;
};

const getRatioText = ({ biddingQuotationMethod }) => {
  const title =
    biddingQuotationMethod === 'BIDDING'
      ? intl.get('ssrc.biddingHall.view.title.desPriceRatio').d('降价比例')
      : intl.get(`ssrc.biddingHall.model.increasePriceRatio`).d('加价比例');
  return title;
};

const getRangeText = ({ biddingQuotationMethod }) => {
  const title =
    biddingQuotationMethod === 'BIDDING'
      ? intl.get('ssrc.biddingHall.view.title.desPriceRange').d('降价幅度')
      : intl.get(`ssrc.biddingHall.model.increasePriceRange`).d('加价幅度');
  return title;
};

// quotation_range dynamic label
const getQuotationRangeLabel = (data = {}) => {
  let title = '';
  if (isEmpty(data)) {
    return title;
  }

  const { biddingQuotationMethod, floatType } = data || {};

  if (biddingQuotationMethod === 'AUCTION') {
    title = intl.get(`ssrc.biddingHall.model.increasePriceRange`).d('加价幅度');
    if (floatType === 'ratio') {
      title = intl.get(`ssrc.biddingHall.model.increasePriceRatio`).d('加价比例');
    }
    if (floatType === 'money') {
      title = intl.get(`ssrc.biddingHall.model.increasePriceRange`).d('加价幅度');
    }
  }
  if (biddingQuotationMethod === 'BIDDING') {
    title = intl.get(`ssrc.biddingHall.model.decreasePriceRange`).d('降价幅度');
    if (floatType === 'ratio') {
      title = intl.get(`ssrc.biddingHall.model.decreasePriceRatio`).d('降价比例');
    }
    if (floatType === 'money') {
      title = intl.get(`ssrc.biddingHall.model.decreasePriceRange`).d('降价幅度');
    }
  }

  return title;
};

// 采购方-通用行状态标签
const PurStatusTag = observer((props = {}) => {
  const { children, ...surplusParams } = props || {};
  if (!children) return null;
  return (
    <span
      style={{
        fontFamily: 'PingFangSC-Medium',
        borderRadius: '.02rem',
        padding: '0 .04rem',
        lineHeight: '.18rem',
        fontWeight: 500,
        fontSize: '.12rem',
        display: 'inline-block',
        ...surplusParams,
      }}
    >
      {children}
    </span>
  );
});

// 价格与起竞价或者最低/最高对比提示
const priceCompareText = (data) => {
  const {
    biddingPriceValidate,
    auctionPriceValidate,
    biddingQuotationMethod,
    biddingSafePriceValidate,
    auctionSafePriceValidate,
  } = data || {};

  let text = '';
  if (biddingPriceValidate) {
    text = intl
      .get('ssrc.biddingHall.view.yourPriceBiggerStartPriceWarning')
      .d('您的报价高于起竞价');
  }

  if (auctionPriceValidate) {
    text = intl
      .get('ssrc.biddingHall.view.yourAcutionPriceBelowStartPriceWarning')
      .d('您的报价低于起拍价');
  }

  if (biddingQuotationMethod === 'BIDDING') {
    if (biddingSafePriceValidate) {
      text = intl
        .get('ssrc.biddingHall.view.yourPriceBelowSafePriceWarning')
        .d('您的出价已低于安全价，如需更改请联系采购方删除最新出价');
    }
  }
  if (biddingQuotationMethod === 'AUCTION') {
    if (auctionSafePriceValidate) {
      text = intl
        .get('ssrc.biddingHall.view.yourPriceAboveSafePriceWarning')
        .d('您的出价已高于安全价，如需更改请联系采购方删除最新出价');
    }
  }

  return text;
};

export {
  CollectionIcon,
  getRatioTitle,
  getRangeTitle,
  getQuotationRangeLabel,
  PurStatusTag,
  priceCompareText,
  getRatioText,
  getRangeText,
};
