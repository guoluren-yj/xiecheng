import React from 'react';
import { observer } from 'mobx-react';
import { isNil, } from "lodash";

import Rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';

const RankTrenkRender = (props = {}) => {
  const { record = {}, styles = {} } = props;
  const {
    trendFlag,
    biddingQuotationRank,
  } = record ? record.get([
    'trendFlag',
    'biddingQuotationRank',
  ]) : {};

  if (isNil(trendFlag) || isNil(biddingQuotationRank)) {
    return "";
  }

  return (
    <span style={{ paddingLeft: "4px", ...(styles || {}) }}>
      {trendFlag === 1 ? (
        <img src={Rise} alt="up" />
      ) : trendFlag === 0 ? (
        <img src={decline} alt="down" />
      ) : (
        ""
      )}
    </span>
  );
};

export default observer(RankTrenkRender);
