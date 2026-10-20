import React from 'react';
import { Tooltip, Tag, Text } from 'choerodon-ui';
import { isNil, } from 'lodash';
import classnames from "classnames";

import intl from 'utils/intl';


import { getCommonLineStatusColor } from '@/routes/ssrc/BiddingHall/utils/statusColor';

import Styles from './index.less';

const renderHeanderDeferCountNumber = (props) => {
  const {
    data = {},
    wrapperClassName = "",
  } = props || {};
  const {
    displayBiddingSupHeaderStatus,
    biddingPausedRealTimeStatus,
    headerBiddingPausedRealTimeStatus,
    autoDeferFlag,
    supplierDeferCount,
    deferBiddingFlag,
    deferBiddingAllowedQuotationCount,
  } = data || {};
  const { tagColor } = getCommonLineStatusColor(displayBiddingSupHeaderStatus) || {};

  // 【延时竞价中、完成、暂停】状态显示
  // realStatus === 'IN_PROGRESS' && deferBiddingFlag 这个代表是处于延时竞价中
  const realStatus = displayBiddingSupHeaderStatus === 'PAUSED' ? (biddingPausedRealTimeStatus || headerBiddingPausedRealTimeStatus) : displayBiddingSupHeaderStatus;
  const showStatusFlag = ['FINISHED', 'BIDDING_END', 'SUGGESTED'].includes(realStatus) || (realStatus === 'IN_PROGRESS' && deferBiddingFlag);
  // 以上状态 & 有延时 & 【触发了延时 或者 有最大延时次数】
  const showAutoDeferFlag = showStatusFlag && autoDeferFlag && (!isNil(supplierDeferCount) || !isNil(deferBiddingAllowedQuotationCount));// 以上状态 & 有延时 & 【触发了延时】

  if (!showAutoDeferFlag) {
    return "";
  }

  return showAutoDeferFlag ? (
    <span className={classnames(Styles['quotation-detail-line-quotation-defer-count'], wrapperClassName)}>
      <Tooltip
        title={`${intl.get('ssrc.common.view.message.delayedTimes').d('已延时次数')}${
          deferBiddingAllowedQuotationCount
            ? `/${intl.get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`).d('允许报价次数(延时竞价)')}`
            : ''
        }`}
      >
        <Tag color={tagColor} border={false}>
          <Text>
            {`${intl.get('ssrc.common.view.message.delayTimes').d('延时次数')}: ${supplierDeferCount || "0"}${
              deferBiddingAllowedQuotationCount ? `/${deferBiddingAllowedQuotationCount}` : ''
            }`}
          </Text>
        </Tag>
      </Tooltip>
    </span>
  ) : (
    ''
  );
};

export { renderHeanderDeferCountNumber };
