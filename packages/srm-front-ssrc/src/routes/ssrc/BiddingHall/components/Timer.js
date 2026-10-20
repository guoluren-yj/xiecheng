import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Popover, Text, Tooltip, Icon } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import moment from 'moment';
import { noop } from 'lodash';

import intl from 'utils/intl';

import { DayMillisecond } from '@/utils/SsrcRegx';
import CountDown from '@/routes/ssrc/components/CountDown';

import { getIntl } from '../utils/constants';
import { formatDateTime as getMonthDayFromDateTime } from '../utils/formatDate';


@observer
class Timer extends Component {
  // format time to hh:mm
  formatDateTimeToHM = (dateTime = null, format = 'HH:mm') => {
    if (!dateTime) {
      return '';
    }

    const monthDay = moment(dateTime).format(format);
    return monthDay;
  };

  /**
   * 开始结束间隔计算标识-header
   */
  getStartEndDateIntervalSybmol = (times = {}) => {
    const { countDownShowAllZeroFlag = 0, } = this.props;
    const {
      // start,
      end,
      current,
    } = times || {};

    if (countDownShowAllZeroFlag === 1) {
      return this.renderZeroTime();
    }

    const invalidFlag = !end || !current || end <= current;
    if (invalidFlag) {
      return '';
    }

    let monthDay = '';
    let day = '';
    let time = '';

    if (moment(current).isSame(end, 'day')) {
      // 今天
      monthDay = getMonthDayFromDateTime({ dateTime: end, onlyMonthDay: 1 });
      day = getIntl('today');
      time = this.formatDateTimeToHM(end);
    }

    if (moment(current).add(1, 'day').isSame(end, 'day')) {
      monthDay = getMonthDayFromDateTime({ dateTime: end, onlyMonthDay: 1 });
      day = getIntl('tomarrow');
      time = this.formatDateTimeToHM(end);
    }

    if (moment(current).add(2, 'day').isSameOrBefore(end, 'day')) {
      monthDay = getMonthDayFromDateTime({ dateTime: end, onlyMonthDay: 1 });
      day = '';
      time = this.formatDateTimeToHM(end);
    }

    // 将倒计时icon的标识置为false, 显示时间icon
    this.countDownIconFlag = false;

    return (
      <span className="ssrc-bidding-hall-time-line-only-render-time">
        {monthDay || ''}
        {day ? `(${day})` : ''}
        {time || ''}
      </span>
    );
  };

  onlyRenderEndDateTime = (data = {}) => {
    const { end } = data || {};
    if (!end) {
      return '';
    }

    // 将倒计时icon的标识置为false, 显示时间icon
    this.countDownIconFlag = false;

    const monthDay = getMonthDayFromDateTime({ dateTime: end, onlyMonthDay: 1 });
    const time = this.formatDateTimeToHM(end);

    return (
      <span className='bidding-time-line-render-value-read-only-text-wrap'>
        {monthDay || ''}
        {time || ''}
      </span>
    );
  };

  // header time calc
  headerTimerFormatRender = (data = {}) => {
    const { labelClass, valueClass, unitPriceFlag, } = this.props;
    const {
      status,
      trialBiddingQueryFlag, // 试竞价标识
      currentDateTime,
      signInEndDate,
      headerQuotationEndDate,
      headerQuotationStartDate,
      startingTrialBiddingEndDate,
      startingTrialBiddingStartDate,
      biddingPausedRealTimeStatus = '', // 竞价暂停时单据的实际状态 SIGN_IN TRIAL_BIDDING BIDDING
      // biddingTrialBiddingFlag,
      biddingPausedDate,
      deferBiddingFlag,
      biddingAutoDeferStartDate,
      trialBiddingFlag,
    } = data || {};

    let timeRender = '';
    this.labelPrefix = '';

    const pausedFlag = status === 'PAUSED'; // 暂停标识
    let currentTime = currentDateTime;
    const headerTimerStyle = {
      fontSize: '20px',
    };

    this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingStartTime').d('竞价开始时间');
    timeRender = this.calcCurrentEndIntervalRenderLineTime({
      end: headerQuotationStartDate,
      current: currentTime,
      pausedFlag,
      headerTimerStyle,
      showCountDownLTOneDayFlag: 1,
      countDownLabel: intl
        .get('ssrc.biddingHall.view.label.biddingStartTimeOnlyCount')
        .d('距竞价开始时间仅剩'),
    });

    if (status === 'NOT_START') {
      if (trialBiddingQueryFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
          .d('试竞价开始时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: startingTrialBiddingStartDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          headerTimerStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
            .d('距试竞价开始时间仅剩'),
        });
      }
    }

    if (status === 'SIGN_IN') {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingSignInEndTime')
        .d('签到结束时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: signInEndDate,
        current: currentDateTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        headerTimerStyle,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingSignInEndTimeOnlyCount')
          .d('距签到结束时间仅剩'),
      });
    }

    if (status === 'IN_PROGRESS') {
      this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingEndTime').d('竞价截止时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: biddingAutoDeferStartDate ?? headerQuotationEndDate, // 因为真正的竞价截止时间包含延时竞价，所以如果延时竞价时间存在，则结束应该是延时竞价开始
        current: currentTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        headerTimerStyle,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingEndTimeOnlyCount')
          .d('距竞价结束时间仅剩'),
      });

      if (deferBiddingFlag) {
        // 处于延时竞价中
        // 延时竞价中
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.deferBiddingEndTime')
          .d('延时竞价结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: headerQuotationEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          headerTimerStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.deferBiddingEndTimeOnlyCount')
            .d('距延时竞价结束时间仅剩'),
        });
      }

      if (trialBiddingQueryFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingEndTime')
          .d('试竞价结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: startingTrialBiddingEndDate,
          current: currentTime,
          pausedFlag,
          headerTimerStyle,
          showCountDownLTOneDayFlag: 1,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingTrialEndTimeOnlyCount')
            .d('距试竞价结束时间仅剩'),
        });
      }
    }

    if (status === 'PAUSED') {
      currentTime = biddingPausedDate; // 暂停时，以暂停时间代替当前时间

      if (biddingPausedRealTimeStatus === 'NOT_START') {
        if (trialBiddingQueryFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: startingTrialBiddingStartDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }

        if (unitPriceFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: startingTrialBiddingEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            headerTimerStyle,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }
      }

      // 未开始
      if (biddingPausedRealTimeStatus === 'NOT_START') {
        if (trialBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: startingTrialBiddingEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            headerTimerStyle,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }

        if (biddingPausedRealTimeStatus === 'TRIAL_BIDDING' || trialBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: startingTrialBiddingEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            headerTimerStyle,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }
      }

      // 签到中暂停
      if (biddingPausedRealTimeStatus === 'SIGN_IN') {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingSignInEndTime')
          .d('签到结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: signInEndDate,
          current: currentDateTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          headerTimerStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingSignInEndTimeOnlyCount')
            .d('距签到结束时间仅剩'),
        });
      }

      // 试竞价中暂停
      if (biddingPausedRealTimeStatus === 'IN_PROGRESS') {
        if (deferBiddingFlag) {
          // 处于延时竞价中
          // 延时竞价中
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.deferBiddingEndTime')
            .d('延时竞价结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: headerQuotationEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            headerTimerStyle,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.deferBiddingEndTimeOnlyCount')
              .d('距延时竞价结束时间仅剩'),
          });
        } else {
          this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingEndTime').d('竞价截止时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: biddingAutoDeferStartDate ?? headerQuotationEndDate, // 因为真正的竞价截止时间包含延时竞价，所以如果延时竞价时间存在，则结束应该是延时竞价开始
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            headerTimerStyle,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingEndTimeOnlyCount')
              .d('距竞价结束时间仅剩'),
          });
        }

        if (trialBiddingQueryFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingEndTime')
            .d('试竞价结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: startingTrialBiddingEndDate,
            current: currentTime,
            pausedFlag,
            headerTimerStyle,
            showCountDownLTOneDayFlag: 1,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialEndTimeOnlyCount')
              .d('距试竞价结束时间仅剩'),
          });
        }
      }
    }

    if (status === 'FINISHED' || status === 'SUGGESTED' || status === 'NO_SUGGESTED') {
      this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingFinishTime').d('竞价完成时间');
      timeRender = this.onlyRenderEndDateTime({
        end: headerQuotationEndDate,
      });

      if (trialBiddingQueryFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialFinishTime')
          .d('试竞价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: startingTrialBiddingEndDate,
        });
      }
    }

    if (status === 'CLOSED') {
      this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingFinishedTime').d('竞价结束时间');
      timeRender = this.onlyRenderEndDateTime({
        end: headerQuotationEndDate,
      });
    }

    return (
      <>
        <span className={labelClass}>
          <Text>{this.labelPrefix}</Text>
        </span>
        <span className={valueClass}>
          <Text>{timeRender}</Text>
        </span>
      </>
    );
  };

  // render header time
  headerTimerRender = () => {
    const { data = null, wrapClass = '', unitWholeBatchPriceFlag, } = this.props;
    const {
      displayBiddingSupHeaderStatus,
      trialBiddingQueryFlag, // 试竞价标识
      currentDateTime,
      signInEndDate,
      startingTrialBiddingEndDate,
      headerQuotationEndDate,
      headerQuotationStartDate,
      startingTrialBiddingStartDate,
      biddingPausedRealTimeStatus,
      // biddingTrialBiddingFlag,
      biddingPausedDate,
      biddingAutoDeferStartDate,
      deferBiddingFlag,
    } = data || {};

    const timeRelativeData = {
      status: displayBiddingSupHeaderStatus,
      trialBiddingQueryFlag, // 试竞价标识
      currentDateTime,
      signInEndDate,
      startingTrialBiddingEndDate,
      headerQuotationEndDate,
      headerQuotationStartDate,
      startingTrialBiddingStartDate,
      biddingPausedRealTimeStatus,
      // biddingTrialBiddingFlag,
      deferBiddingFlag,
      biddingPausedDate,
      biddingAutoDeferStartDate,
    };

    console.log(timeRelativeData, 'header date');

    // IN_PROGRESS 不展示时间
    const hiddenTimeFlag =
      (displayBiddingSupHeaderStatus === 'IN_PROGRESS' && !unitWholeBatchPriceFlag) ||
      (displayBiddingSupHeaderStatus === 'PAUSED' && biddingPausedRealTimeStatus === 'IN_PROGRESS' && !unitWholeBatchPriceFlag);
    if (hiddenTimeFlag) {
      return '';
    }

    return <span className={wrapClass}>{this.headerTimerFormatRender(timeRelativeData)}</span>;
  };

  // render line time
  lineTimerRender = () => {
    const {
      data = null,
      wrapClass = '',
      headerRecordData,
      totalPriceLineFlag = false,
      headerInfo,
      prefixRender = '',
      prefixRenderClass = '',
      japOrDutchBidding = noop,
    } = this.props;
    const {
      biddingPausedDate,
      displayBiddingSupHeaderStatus: quotationHeaderStatus,
      biddingPausedRealTimeStatus: headerPausedStatus,
      biddingAutoDeferStartDate, // 延时竞价开始时间
    } = headerInfo || {};
    const {
      displayBiddingSupLineStatus,
      currentDateTime,
      lineQuotationEndDate,
      lineQuotationStartDate,
      lineTrialQuotationEndDate,
      lineTrialQuotationStartDate,
      signInEndDate,
      // TOTAL PRICE TIME
      headerQuotationEndDate,
      headerQuotationStartDate,
      startingTrialBiddingEndDate,
      startingTrialBiddingStartDate,
      displayBiddingSupHeaderStatus,
      trialBiddingQueryFlag: currentFormTrialBiddingQueryFlag,

      // supplementary
      biddingSupplementPriceStartDate,
      biddingSupplementPriceEndDate,
      biddingSupplementPriceRunningFlag,
      biddingSupplementPriceNotStartFlag,

      deferBiddingFlag: currentDeferBiddingFlag, // 是否处于延时竞价中

      currentBiddingRoundEndDate,
      currentBiddingRoundNumber,
    } = data || {};


    let japanDutchBiddingFlag = false;
    if (japOrDutchBidding) {
      japanDutchBiddingFlag = japOrDutchBidding();
    }


    const {
      displayBiddingSupLineStatus: lineStatus,
      biddingPausedRealTimeStatus,
      trialBiddingQueryFlag,
      trialBiddingFlag,
      deferBiddingFlag,
    } = headerRecordData || {};
    const timeRelativeData = {
      status: lineStatus || displayBiddingSupLineStatus,
      trialBiddingQueryFlag, // 试竞价标识
      signInEndDate,
      currentDateTime,
      lineQuotationEndDate,
      lineQuotationStartDate,
      lineTrialQuotationEndDate,
      lineTrialQuotationStartDate,
      biddingPausedRealTimeStatus: biddingPausedRealTimeStatus || headerPausedStatus,
      trialBiddingFlag,
      biddingSupplementPriceStartDate,
      biddingSupplementPriceEndDate,
      biddingSupplementPriceRunningFlag,
      biddingSupplementPriceNotStartFlag,
      headerQuotationEndDate,
      biddingPausedDate,
      quotationHeaderStatus,
      biddingAutoDeferStartDate,
      deferBiddingFlag: deferBiddingFlag ?? currentDeferBiddingFlag,
      japanDutchBiddingFlag,
      currentBiddingRoundNumber,
      currentBiddingRoundEndDate,
    };

    if (totalPriceLineFlag) {
      timeRelativeData.trialBiddingQueryFlag = currentFormTrialBiddingQueryFlag;
      timeRelativeData.trialBiddingFlag = currentFormTrialBiddingQueryFlag;
      timeRelativeData.status = displayBiddingSupHeaderStatus;
      timeRelativeData.lineQuotationEndDate = headerQuotationEndDate;
      timeRelativeData.lineQuotationStartDate = headerQuotationStartDate;
      timeRelativeData.lineTrialQuotationEndDate = startingTrialBiddingEndDate;
      timeRelativeData.lineTrialQuotationStartDate = startingTrialBiddingStartDate;
    }

    if (displayBiddingSupLineStatus === 'SIGN_IN' && !totalPriceLineFlag) {
      return '';
    }

    return (
      <div className={wrapClass}>
        {prefixRender ? (
          <div className={prefixRenderClass}>
            <Popover content={prefixRender}>{prefixRender}</Popover>
          </div>
        ) : (
          ''
        )}
        {this.lineTimerFormatRender(timeRelativeData)}
      </div>
    );
  };

  renderZeroTime = () => {
    return (
      <span style={{ color: '#E64322', fontWeight: '600', fontSize: "20px", }}>
        00:00:00
      </span>
    );
  }

  /**
   * 开始结束间隔计算标识 - line
   */
  calcCurrentEndIntervalRenderLineTime = (times = {}) => {
    const { countDownTimerOver = noop, countDownShowAllZeroFlag = 0, } = this.props;
    const {
      end,
      current,
      showCountDownLTOneDayFlag = 0, // 当前时间于截止时间不足1天，直接渲染倒计时组件标识
      countDownLabel = null,
      pausedFlag = false,
      emptyEndLabel = '',
      headerTimerStyle = {},
    } = times || {};

    if (!end && emptyEndLabel) {
      return emptyEndLabel;
    }

    const invalidFlag = !end || !current || end <= current;
    if (invalidFlag) {
      return '';
    }

    // 结束时间和当前时间差
    const TimeMinus = moment(end).diff(current);

    if (showCountDownLTOneDayFlag) {
      if (math.lt(TimeMinus, DayMillisecond)) {
        this.labelPrefix = countDownLabel ?? this.labelPrefix;
        // 倒计时显示标识
        this.countDownIconFlag = true;

        if (countDownShowAllZeroFlag === 1) {
          return this.renderZeroTime();
        }

        return (
          <CountDown
            hiddenDayFlag={1}
            sysNow={current}
            endTime={end}
            type="dayChina"
            numberStyle={{
              color: '#E64322',
              fontSize: '20px',
              fontWeight: '600',
              padding: '0 2px',
              ...(headerTimerStyle || {}),
            }}
            timeOver={countDownTimerOver}
            pausedFlag={pausedFlag}
          />
        );
      } else {
        return this.getStartEndDateIntervalSybmol({
          end,
          current,
        });
      }
    }

    return this.getStartEndDateIntervalSybmol({
      end,
      current,
    });
  };

  // format line time
  lineTimerFormatRender = (data = {}) => {
    const {
      labelClass,
      valueClass,
      unitPriceFlag,
      showLabelIconFlag, // true-显示labelIcon气泡，false-显示label文字
    } = this.props;
    const {
      status,
      signInEndDate,
      trialBiddingQueryFlag, // 试竞价标识
      currentDateTime,
      lineQuotationEndDate,
      lineQuotationStartDate,
      lineTrialQuotationEndDate,
      lineTrialQuotationStartDate,
      biddingPausedRealTimeStatus = '', // 竞价暂停时单据的实际状态 SIGN_IN TRIAL_BIDDING BIDDING
      trialBiddingFlag,
      biddingSupplementPriceStartDate,
      biddingSupplementPriceEndDate,
      biddingSupplementPriceRunningFlag,
      biddingSupplementPriceNotStartFlag,
      biddingPausedDate,
      quotationHeaderStatus,
      biddingAutoDeferStartDate, // 延时竞价开始时间
      deferBiddingFlag, // 是否处于延时竞价中
      japanDutchBiddingFlag = 0,
      currentBiddingRoundEndDate,
    } = data;

    const pausedFlag = quotationHeaderStatus === 'PAUSED' || status === 'PAUSED'; // 暂停标识
    let currentTime = currentDateTime;
    if (pausedFlag) {
      currentTime = biddingPausedDate; // 暂停时，以暂停时间代替当前时间
    }

    let timeRender = '';
    this.labelPrefix = '';

    console.log(data, 'line times');

    this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingStartTime').d('竞价开始时间');
    timeRender = this.calcCurrentEndIntervalRenderLineTime({
      end: lineQuotationStartDate,
      current: currentTime,
      pausedFlag,
      showCountDownLTOneDayFlag: 1,
      countDownLabel: intl
        .get('ssrc.biddingHall.view.label.biddingStartTimeOnlyCount')
        .d('距竞价开始时间仅剩'),
    });

    if (status === 'SIGN_IN') {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingSignInEndTime')
        .d('签到结束时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: signInEndDate,
        current: currentDateTime,
        showCountDownLTOneDayFlag: 1,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingSignInEndTimeOnlyCount')
          .d('距签到结束时间仅剩'),
      });
    }

    if (status === 'NOT_START') {
      if (trialBiddingFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
          .d('试竞价开始时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: lineTrialQuotationStartDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
            .d('距试竞价开始时间仅剩'),
        });
      }
      if (biddingSupplementPriceNotStartFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.supplementPrices')
          .d('补充单价开始时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: biddingSupplementPriceStartDate,
          current: currentTime,
          pausedFlag,
          showCountDownLTOneDayFlag: 1,
          emptyEndLabel: intl.get('ssrc.common.view.message.undetermined').d('待定'),
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingSupplimentPriceStartTimeOnlyCount')
            .d('距补充单价开始时间仅剩'),
        });
      }
    }

    if (status === 'IN_PROGRESS') {
      this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingEndTime').d('竞价截止时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: biddingAutoDeferStartDate ?? lineQuotationEndDate, // 因为真正的竞价截止时间包含延时竞价，所以如果延时竞价时间存在，则结束应该是延时竞价开始
        current: currentTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingEndTimeOnlyCount')
          .d('距竞价结束时间仅剩'),
      });

      // japan dutch total price
      if (japanDutchBiddingFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTime')
          .d('当前轮次结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: currentBiddingRoundEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTimeOnlyCount')
            .d('距当前轮次结束仅剩'),
        });
      }

      if (deferBiddingFlag) {
        // 处于延时竞价中
        // 延时竞价中
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.deferBiddingEndTime')
          .d('延时竞价结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: lineQuotationEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.deferBiddingEndTimeOnlyCount')
            .d('距延时竞价结束时间仅剩'),
        });
      }

      if (trialBiddingQueryFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingEndTime')
          .d('试竞价结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: lineTrialQuotationEndDate,
          current: currentTime,
          pausedFlag,
          showCountDownLTOneDayFlag: 1,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingTrialEndTimeOnlyCount')
            .d('距试竞价结束时间仅剩'),
        });

        // japan dutch total price
        if (japanDutchBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTime')
            .d('当前轮次结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: currentBiddingRoundEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTimeOnlyCount')
              .d('距当前轮次结束仅剩'),
          });
        }
      }
      if (biddingSupplementPriceRunningFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.supplementPricesFinishedDate')
          .d('补充单价结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: biddingSupplementPriceEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          emptyEndLabel: intl.get('ssrc.common.view.message.undetermined').d('待定'),
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingSupplimentPriceFinishedTimeOnlyCount')
            .d('距补充单价结束时间仅剩'),
        });
      }
    }

    if (status === 'PAUSED') {
      // 签到中暂停
      if (biddingPausedRealTimeStatus === 'SIGN_IN') {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingSignInEndTime')
          .d('签到结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: signInEndDate,
          pausedFlag,
          current: currentDateTime,
          showCountDownLTOneDayFlag: 1,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingSignInEndTimeOnlyCount')
            .d('距签到结束时间仅剩'),
        });

        if (unitPriceFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: lineTrialQuotationStartDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }
      }

      // 未开始
      if (biddingPausedRealTimeStatus === 'NOT_START') {
        if (trialBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: lineTrialQuotationStartDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }

        if (biddingPausedRealTimeStatus === 'TRIAL_BIDDING' || trialBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
            .d('试竞价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: lineTrialQuotationStartDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
              .d('距试竞价开始时间仅剩'),
          });
        }

        if (biddingSupplementPriceNotStartFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.supplementPrices')
            .d('补充单价开始时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: biddingSupplementPriceStartDate,
            current: currentTime,
            pausedFlag,
            showCountDownLTOneDayFlag: 1,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingSupplimentPriceStartTimeOnlyCount')
              .d('距补充单价开始时间仅剩'),
          });
        }
      }

      if (biddingPausedRealTimeStatus === 'IN_PROGRESS') {
        if (deferBiddingFlag) {
          // 处于延时竞价中
          // 延时竞价中
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.deferBiddingEndTime')
            .d('延时竞价结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: lineQuotationEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.deferBiddingEndTimeOnlyCount')
              .d('距延时竞价结束时间仅剩'),
          });
        } else {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingEndTime')
            .d('竞价截止时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: biddingAutoDeferStartDate ?? lineQuotationEndDate, // 因为真正的竞价截止时间包含延时竞价，所以如果延时竞价时间存在，则结束应该是延时竞价开始
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingEndTimeOnlyCount')
              .d('距竞价结束时间仅剩'),
          });
        }

        // japan dutch total price
        if (japanDutchBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTime')
            .d('当前轮次结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: currentBiddingRoundEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTimeOnlyCount')
              .d('距当前轮次结束仅剩'),
          });
        }

        if (trialBiddingFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.biddingTrialBiddingEndTime')
            .d('试竞价结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: lineTrialQuotationEndDate,
            current: currentTime,
            pausedFlag,
            showCountDownLTOneDayFlag: 1,
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingTrialEndTimeOnlyCount')
              .d('距试竞价结束时间仅剩'),
          });

          // japan dutch total price
          if (japanDutchBiddingFlag) {
            this.labelPrefix = intl
              .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTime')
              .d('当前轮次结束时间');
            timeRender = this.calcCurrentEndIntervalRenderLineTime({
              end: currentBiddingRoundEndDate,
              current: currentTime,
              showCountDownLTOneDayFlag: 1,
              pausedFlag,
              countDownLabel: intl
                .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTimeOnlyCount')
                .d('距当前轮次结束仅剩'),
            });
          }
        }

        if (biddingSupplementPriceRunningFlag) {
          this.labelPrefix = intl
            .get('ssrc.biddingHall.view.label.supplementPricesFinishedDate')
            .d('补充单价结束时间');
          timeRender = this.calcCurrentEndIntervalRenderLineTime({
            end: biddingSupplementPriceEndDate,
            current: currentTime,
            showCountDownLTOneDayFlag: 1,
            pausedFlag,
            emptyEndLabel: intl.get('ssrc.common.view.message.undetermined').d('待定'),
            countDownLabel: intl
              .get('ssrc.biddingHall.view.label.biddingSupplimentPriceFinishedTimeOnlyCount')
              .d('距补充单价结束时间仅剩'),
          });
        }
      }
    }

    if (status === 'BIDDING_END' || status === 'FINISHED' || status === 'SUGGESTED') {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingFinishTime')
        .d('竞价完成时间');
      timeRender = this.onlyRenderEndDateTime({
        end: lineQuotationEndDate,
      });

      if (trialBiddingQueryFlag) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialFinishTime')
          .d('试竞价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: lineTrialQuotationEndDate,
        });
      }

      if (currentDateTime && currentDateTime >= biddingSupplementPriceEndDate) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.title.biddingSupplementPriceEndDateFinished')
          .d('补充单价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: biddingSupplementPriceEndDate,
        });
      }
    }

    if (status === 'CLOSED') {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingFinishedTime')
        .d('竞价结束时间');
      timeRender = this.onlyRenderEndDateTime({
        end: lineQuotationEndDate,
      });
    }

    return (
      <>
        <div className={labelClass}>
          {
            // 需要显示时间icon标识 若showLabelIconFlag为true则显示icon加气泡，否则直接显示label文字
            showLabelIconFlag ? (
              <Tooltip title={this.labelPrefix}>
                {/* 倒计时和具体时间需要显示不同的icon */}
                {this.countDownIconFlag ? <Icon type="alarm-o" /> : <Icon type="date_range-o" />}
              </Tooltip>
            ) : (
              <Text>{this.labelPrefix}</Text>
            )
          }
        </div>
        <div className={valueClass}>
          <Text>{timeRender || "-"}</Text>
        </div>
      </>
    );
  };

  render() {
    const {
      type = 'header', // header | line
      visibleFlag = true,
      hiddenTimer = false,
    } = this.props;

    if (!visibleFlag || hiddenTimer) {
      return '';
    }

    return type === 'header' ? this.headerTimerRender() : this.lineTimerRender();
  }
}

export default Timer;
