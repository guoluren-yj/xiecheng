/**
 * 竞价大厅主内容-竞价现场
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { Icon, message, Text, Tag, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { noop, isNil } from 'lodash';

import { getCommonLineStatusColor } from '@/routes/ssrc/BiddingHall/utils/statusColor';

import { numberSeparatorRender } from '@/utils/renderer';
import { TooltipEllipsis, PurchaseTimer } from '../../../components';

import style from '../../index.less';

const finishBiddingSvg = require('@/assets/biddingHall/finish-bidding.svg');

const BiddingSite = observer((props = {}) => {
  const {
    biddingSiteInfoDataSet,
    bidCountDataSet,
    getTotalPriceFlag = noop,
    getUnitPriceFlag = noop,
    headerInfoDS,
    initPage = noop,
    getWarningMessageCount = noop,
    japOrDutchBidding = noop,
    britishBidding = noop,
    remote,
    header,
    japanDutchRoundListDs,
    // japanBiddingTotalPrice = noop,
    japOrDutchBiddingTotalPrice = noop,
  } = props || {};

  // const japanTotal = japanBiddingTotalPrice();
  const japOrDutchBiddingTotal = japOrDutchBiddingTotalPrice();

  const {
    onlineUsersCount, // 观看人数
  } = biddingSiteInfoDataSet?.current?.get(['onlineUsersCount']) || {};

  // 出价次数
  const numberOfBids = bidCountDataSet?.current?.get('numberOfBids');

  const warningMessage = getWarningMessageCount();

  const {
    biddingStatus,
    internalPausedReason,
    internalClosedReason,
    quotationOrderType,
    deferCount,
    deferBiddingAllowedQuotationCount,
    autoDeferFlag,
    originalStatus,
    allHeaderDateTime,
    currentBiddingRoundPrice,
    nextBiddingRoundPrice,
    currentBiddingRoundNumber = null,
  } =
    headerInfoDS?.current?.get([
      'biddingStatus',
      'internalPausedReason',
      'internalClosedReason',
      'quotationOrderType', // 报价次序
      'deferCount', // 延时次数
      'deferBiddingAllowedQuotationCount', // 最大延时次数
      'autoDeferFlag',
      'originalStatus', // 暂停前的状态
      'allHeaderDateTime',
      'currentBiddingRoundPrice',
      'nextBiddingRoundPrice',
      'currentBiddingRoundNumber',
    ]) || {};

  // 'deferBiddingFlag' 延时竞价中标识
  const { deferBiddingFlag } = allHeaderDateTime || {};

  const [alertVisible, setAlertVisible] = useState(true); // 增加判断，初始化根据接口来，看单子是否需要显示

  useEffect(() => {
    if (biddingStatus === 'BIDDING_PAUSED') {
      messageConfig();
      message.warning(
        <span className={style['ssrc-purchase-message-text']}>
          {intl.get('ssrc.biddingHall.view.title.biddingPaused').d('竞价已暂停')}
        </span>,
        undefined,
        undefined,
        'top'
      );
    } else if (biddingStatus === 'BIDDING_CLOSED') {
      messageConfig();
      message.warning(
        <span className={style['ssrc-purchase-message-text']}>
          {intl.get('ssrc.biddingHall.view.title.biddingClosed').d('竞价已关闭')}
        </span>,
        undefined,
        undefined,
        'top'
      );
    }
  }, [biddingStatus, messageConfig]);

  // 信息提示配置项
  const messageConfig = useCallback(() => {
    message.destroy();
    message.config({
      top: 100,
      duration: 3,
    });
  }, [biddingStatus]);

  // 获取警示信息
  const alertInfo = useMemo(() => {
    const obj = {
      BIDDING_PAUSED: {
        // 暂停
        svg: (
          <Icon
            type="error"
            className={classNames(style['pur-main-content-bidding-site-title-icon'])}
          />
        ),
        message:
          intl
            .get('ssrc.biddingHall.view.title.biddingPausedReason')
            .d('竞价单已暂停，暂停原因是：') + internalPausedReason ?? '',
      },
      BIDDING_CLOSED: {
        // 关闭
        svg: (
          <Icon
            type="error"
            className={classNames(style['pur-main-content-bidding-site-title-icon'])}
          />
        ),
        message: `${intl
          .get('ssrc.biddingHall.view.title.biddingClosedReason')
          .d('竞价单已关闭，关闭原因是：')}${internalClosedReason ?? ''}`,
      },
      BIDDING_END: {
        // 完成
        svg: <img src={finishBiddingSvg} alt="" />,
        message: intl.get('ssrc.biddingHall.view.title.biddingEnd').d('竞价已完成'),
      },
    };
    return obj[biddingStatus];
  }, [biddingStatus, internalPausedReason, internalClosedReason]);

  const renderJapanDutchCurrentRound = () => {
    if (!japOrDutchBiddingTotal || isNil(currentBiddingRoundNumber)) {
      return '';
    }

    return (
      <span className={style['pur-main-content-bidding-site-current-round-wrap']}>
        <span className={style['pur-main-content-bidding-site-current-round-label']}>
          {intl.get('ssrc.common.view.currentRoundNumber').d('当前轮次')}
        </span>
        <span className={style['pur-main-content-bidding-site-current-round-value']}>
          {numberSeparatorRender(currentBiddingRoundNumber)}
        </span>
      </span>
    );
  };

  // 竞价现场详情list
  const biddingSiteList = useMemo(() => {
    // const { numberOfBids, onlineUsersCount } = biddingSiteInfo || {};
    const siteList = [
      // {
      //   key: 'currentBiddingRoundNumber',
      //   label: intl.get('ssrc.common.view.currentRoundNumber').d('当前轮次'),
      //   value: numberSeparatorRender(currentBiddingRoundNumber),
      //   hidden: !japOrDutchBiddingTotal,
      // },
      {
        key: 'currentBiddingRoundPrice',
        label: intl.get('ssrc.biddingHall.view.title.currentOutcry').d('当前叫价'),
        value: numberSeparatorRender(currentBiddingRoundPrice),
        hidden: !japOrDutchBiddingTotal,
      },
      {
        key: 'nextBiddingRoundPrice',
        label: intl.get('ssrc.biddingHall.view.title.currentOutcryOfNextRound').d('下轮叫价'),
        value: numberSeparatorRender(nextBiddingRoundPrice),
        hidden: !japOrDutchBiddingTotal,
      },
      {
        key: 'numberOfBids',
        label: intl.get('ssrc.biddingHall.view.title.numberOfBids').d('出价次数'),
        value: numberOfBids,
        hidden: !britishBidding(),
      },
      {
        key: 'viewNumber',
        label: intl.get('ssrc.biddingHall.view.title.viewNumber').d('观看人数'),
        // 单据状态为【关闭、完成】显示-
        value: ['BIDDING_CLOSED', 'BIDDING_END'].includes(biddingStatus) ? '-' : onlineUsersCount,
      },
      {
        key: 'warningMessage',
        label: intl.get('ssrc.biddingHall.view.title.warningMessage').d('警示消息'),
        value: warningMessage || 0,
      },
    ];
    return remote.process
      ? remote.process('SSRC_PURCHASE_BIDDING_HALL_MAIN_CONTENT_PROCESS_SITE_LIST', siteList, {
          header,
          japanDutchRoundListDs,
        })
      : siteList;
  }, [
    remote,
    numberOfBids,
    onlineUsersCount,
    warningMessage,
    headerInfoDS,
    currentBiddingRoundPrice,
    nextBiddingRoundPrice,
    japanDutchRoundListDs.length,
    japanDutchRoundListDs?.get(0)?.get('scuxAllBiddingRoundQuotedCount'), // 用于BBAC二开卡片刷新
  ]);

  // 渲染延时次数
  const renderDeferCountNode = useCallback(() => {
    const { tagColor } = getCommonLineStatusColor(biddingStatus) || {};

    // 【延时竞价中、完成、暂停】状态显示
    // 以上状态 & 有延时 & 【触发了延时 或者 有最大延时次数】
    const showAutoDeferFlag =
      (biddingStatus === 'BIDDING_END' ||
        originalStatus === 'BIDDING_END' ||
        ((biddingStatus === 'BIDDING' || originalStatus === 'BIDDING') && deferBiddingFlag)) &&
      autoDeferFlag &&
      (!isNil(deferCount) || !isNil(deferBiddingAllowedQuotationCount));
    return showAutoDeferFlag ? (
      <div className={classNames(style['bidding-site-process-nodes-defer-count'])}>
        <Tooltip
          title={`${intl.get('ssrc.common.view.message.delayedTimes').d('已延时次数')}${
            deferBiddingAllowedQuotationCount
              ? `/${intl
                  .get(
                    `ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`
                  )
                  .d('允许报价次数(延时竞价)')}`
              : ''
          }`}
        >
          <Tag color={tagColor} border={false}>
            <Text>
              {`${intl.get('ssrc.common.view.message.delayTimes').d('延时次数')}: ${
                deferCount ?? 0
              }${deferBiddingAllowedQuotationCount ? `/${deferBiddingAllowedQuotationCount}` : ''}`}
            </Text>
          </Tag>
        </Tooltip>
      </div>
    ) : (
      ''
    );
  }, [
    biddingStatus,
    originalStatus,
    deferCount,
    deferBiddingAllowedQuotationCount,
    autoDeferFlag,
    deferBiddingFlag,
  ]);

  /**
   * 是否显示倒计时
   * 只有【总价竞价】&【单价竞价且报价次序为并行进行中状态】时显示具体倒计时
   */
  const showCountDownFlag = useMemo(() => {
    if (getTotalPriceFlag()) {
      return true;
    } else if (getUnitPriceFlag() && quotationOrderType === 'PARALLEL') {
      const processStatusFlag = ['TRIAL_BIDDING', 'BIDDING'].includes(biddingStatus); // 试竞价，正式竞价
      const processStatusPausedFlag =
        ['TRIAL_BIDDING', 'BIDDING'].includes(originalStatus) && biddingStatus === 'BIDDING_PAUSED'; // 试竞价，正式竞价, 延时竞价暂停
      if (processStatusFlag || processStatusPausedFlag) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  }, [getTotalPriceFlag, getUnitPriceFlag, quotationOrderType, biddingStatus, originalStatus]);

  let purchaseTimerProps = {
    data: headerInfoDS?.current,
    type: "header",
    isShowCountDownFlag: showCountDownFlag,
    countDownTimerOver: () => {
      initPage();
    },
    wrapClass: style['bidding-hall-process-header-count-down'],
    labelClass: style['bidding-hall-process-header-count-down-label'],
    valueClass: style['bidding-hall-process-header-count-down-value'],
    japOrDutchBidding: japOrDutchBidding,
    remote,
    remotePrefix: "SSRC_PURCHASE_BIDDING_HALL_MAIN_CONTENT_BIDDING_SITE_PURCHASER_TIMER_PROCESS",
  };
  purchaseTimerProps = remote ? remote?.process(
    'SSRC_PURCHASE_BIDDING_HALL_MAIN_CONTENT_PROCESS_PURCHASE_TIMER_PROPS',
    purchaseTimerProps,
    { pageProps: props, style, }
  ) : purchaseTimerProps;
  purchaseTimerProps = purchaseTimerProps || {}

  return (
    <React.Fragment>
      {alertVisible && alertInfo && (
        <div className={classNames(style['pur-main-content-bidding-site-title'])}>
          <span className={classNames(style['pur-main-content-bidding-site-title-alert'])}>
            {alertInfo.svg}
            <TooltipEllipsis title={alertInfo.message}>
              <span className={classNames(style['pur-main-content-bidding-site-title-text'])}>
                {alertInfo.message}
              </span>
            </TooltipEllipsis>
            <div
              onClick={() => {
                setAlertVisible(false);
              }}
              className={classNames(style['pur-main-content-bidding-site-title-close'])}
            >
              <Icon type="close" />
            </div>
          </span>
        </div>
      )}
      <div className={classNames(style['pur-main-content-bidding-site-process'])}>
        <div className={classNames(style['pur-main-content-bidding-site-process-nodes'])}>
          <span className={classNames(style['pur-main-content-bidding-site-process-title'])}>
            <Text>{intl.get('ssrc.biddingHall.view.title.biddingSite').d('竞价现场')}</Text>
          </span>

          {renderJapanDutchCurrentRound()}
        </div>
        <div className={classNames(style['bidding-site-process-nodes-defer-count-down'])}>
          <PurchaseTimer
            {...purchaseTimerProps}
          />
          {/* 延时次数/最大延时次数 */}
          {renderDeferCountNode()}
        </div>
      </div>
      <div className={classNames(style['pur-main-content-bidding-site-detail'])}>
        {biddingSiteList.map((site) => {
          const { hidden, key, value, label } = site || {};
          if (hidden || !key) {
            return '';
          }

          return (
            <div
              key={key}
              className={classNames(style['pur-main-content-bidding-site-detail-column'])}
            >
              <span className={classNames(style['pur-main-content-bidding-site-detail-label'])}>
                <Tooltip title={label}>{label}</Tooltip>
              </span>
              <span
                className={classNames(style['pur-main-content-bidding-site-detail-value'], {
                  [style[
                    'pur-main-content-bidding-site-detail-value-japandutch'
                  ]]: japOrDutchBiddingTotal, // 日/荷兰 需要缩小字体
                })}
              >
                <Tooltip title={value ?? '-'}>{value ?? '-'}</Tooltip>
              </span>
            </div>
          );
        })}
      </div>
      {/* </div> */}
    </React.Fragment>
  );
});

export default BiddingSite;
