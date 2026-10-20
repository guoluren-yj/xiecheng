import React from 'react';
import { observer } from 'mobx-react';
// import { Icon } from 'choerodon-ui';
import { math, Record } from 'choerodon-ui/dataset';
import moment from 'moment';
import { noop } from 'lodash';
import { Text } from 'choerodon-ui';

import intl from 'utils/intl';

import { DayMillisecond } from '@/utils/SsrcRegx';
import CountDown from '@/routes/ssrc/components/CountDown';

import { getIntl } from '../utils/constants';
import { formatDateTime as getMonthDayFromDateTime } from '../utils/formatDate';

// const TWO_DAYS = math.multipliedBy(DayMillisecond, 2);

@observer
class Timer extends React.Component {
  // format time to hh:mm
  formatDateTimeToHM = (dateTime = null, format = 'HH:mm') => {
    const { remote, remotePrefix } = this.props;
    if (!dateTime) {
      return '';
    }

    let dataTimeFormat = format;
    dataTimeFormat =
      remote && remotePrefix
        ? remote.process(`${remotePrefix}_FORMAT`, dataTimeFormat, { that: this })
        : dataTimeFormat;

    const monthDay = moment(dateTime).format(dataTimeFormat);
    return monthDay;
  };

  /**
   * 开始结束间隔计算标识-header
   */
  getStartEndDateIntervalSybmol = (times = {}) => {
    const {
      // start,
      end,
      current,
    } = times || {};

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

    return (
      <span>
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

    const monthDay = getMonthDayFromDateTime({ dateTime: end, onlyMonthDay: 1 });
    const time = this.formatDateTimeToHM(end);

    return (
      <span>
        {monthDay || ''}
        {time || ''}
      </span>
    );
  };

  // 总价竞价头时间 会显示倒计时
  headerTimerCountDownRender = (data = {}) => {
    const { labelClass, valueClass, remote, remotePrefix } = this.props;
    const {
      status,
      // biddingTrialBiddingFlag, // 试竞价标识
      headerSignInStartDate, // 签到开始时间
      headerSignInEndDate, // 签到截止时间
      headerTrialBiddingStartDate, // 试竞价开始时间
      headerTrialBiddingEndDate, // 试竞价截止时间
      headerQuotationStartDate, // 正式竞价开始时间
      headerQuotationEndDate, // 正式竞价截止时间
      headerSupplementPriceStartDate, // 补充单价开始时间
      headerSupplementPriceEndDate, // 补充单价截止时间
      currentTime,
      // biddingOnlineSignInFlag,
      originalStatus = '', // 竞价暂停时单据的实际状态 SIGN_IN TRIAL_BIDDING BIDDING
      biddingAutoDeferStartDate, // 延时竞价开始时间
      deferBiddingFlag, // 是否处于延时竞价中
      japanDutchBiddingFlag,
      currentBiddingRoundEndDate,
    } = data;

    let timeRender = '';
    this.labelPrefix = '';

    const pausedFlag = status === 'BIDDING_PAUSED';

    // 倒计时数字样式
    const numberStyle = { fontSize: '0.2rem', color: '#e64322' };

    if (
      status === 'SIGN_NOT_START' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'SIGN_NOT_START')
    ) {
      // 签到未开始
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingSignInStartTime')
        .d('签到开始时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: headerSignInStartDate,
        current: currentTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        numberStyle,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingSignInStartTimeOnlyCount')
          .d('距签到开始时间仅剩'),
      });
    } else if (
      status === 'SIGNING' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'SIGNING')
    ) {
      // 签到中
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingSignInEndTime')
        .d('签到结束时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: headerSignInEndDate,
        current: currentTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        numberStyle,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingSignInEndTimeOnlyCount')
          .d('距签到结束时间仅剩'),
      });
    } else if (
      status === 'TRIAL_BIDDING_NOT_START' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'TRIAL_BIDDING_NOT_START')
    ) {
      // 试竞价未开始
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
        .d('试竞价开始时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: headerTrialBiddingStartDate,
        current: currentTime,
        pausedFlag,
        numberStyle,
        showCountDownLTOneDayFlag: 1,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
          .d('距试竞价开始时间仅剩'),
      });
    } else if (
      status === 'TRIAL_BIDDING' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'TRIAL_BIDDING')
    ) {
      // 试竞价中
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingTrialBiddingEndTime')
        .d('试竞价结束时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: headerTrialBiddingEndDate,
        current: currentTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        numberStyle,
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
          numberStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTimeOnlyCount')
            .d('距当前轮次结束仅剩'),
        });
      }
    } else if (
      status === 'BIDDING_NOT_START' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'BIDDING_NOT_START')
    ) {
      // 正式竞价未开始
      this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingStartTime').d('竞价开始时间');
      timeRender = this.calcCurrentEndIntervalRenderLineTime({
        end: headerQuotationStartDate,
        current: currentTime,
        pausedFlag,
        numberStyle,
        showCountDownLTOneDayFlag: 1,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingStartTimeOnlyCount')
          .d('距竞价开始时间仅剩'),
      });
    } else if (
      ['BIDDING'].includes(status) ||
      (status === 'BIDDING_PAUSED' && ['BIDDING'].includes(originalStatus))
    ) {
      // 正式竞价中
      this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingEndTime').d('竞价结束时间');
      let headerBiddingEndProps = {
        end: biddingAutoDeferStartDate ?? headerQuotationEndDate, // 因为真正的竞价截止时间包含延时竞价，所以如果延时竞价时间存在，则结束应该是延时竞价开始
        current: currentTime,
        showCountDownLTOneDayFlag: 1,
        pausedFlag,
        numberStyle,
        countDownLabel: intl
          .get('ssrc.biddingHall.view.label.biddingEndTimeOnlyCount')
          .d('距竞价结束时间仅剩'),
      };
      headerBiddingEndProps =
        remote && remotePrefix
          ? remote.process(
              `${remotePrefix}_HEADER_TIMER_BIDDING_END_TIMER_PROPS`,
              headerBiddingEndProps,
              { that: this }
            )
          : headerBiddingEndProps;
      timeRender = this.calcCurrentEndIntervalRenderLineTime(headerBiddingEndProps);

      if (deferBiddingFlag) {
        // 延时竞价中
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.deferBiddingEndTime')
          .d('延时竞价结束时间');
        let headerDeferBiddingEndProps = {
          end: headerQuotationEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          numberStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.deferBiddingEndTimeOnlyCount')
            .d('距延时竞价结束时间仅剩'),
        };
        headerDeferBiddingEndProps =
          remote && remotePrefix
            ? remote.process(
                `${remotePrefix}_HEADER_TIMER_DEFER_BIDDING_END_TIMER_PROPS`,
                headerDeferBiddingEndProps,
                { that: this }
              )
            : headerDeferBiddingEndProps;
        timeRender = this.calcCurrentEndIntervalRenderLineTime(headerDeferBiddingEndProps);
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
          numberStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingCurrentRoundEndTimeOnlyCount')
            .d('距当前轮次结束仅剩'),
        });
      }
    } else if (
      status === 'SUPPLEMENT_PRICE_NOT_START' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'SUPPLEMENT_PRICE_NOT_START')
    ) {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.supplementPriceStartTime')
        .d('补充单价开始时间');
      // 补充单价未开始
      if (headerSupplementPriceStartDate) {
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: headerSupplementPriceStartDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          numberStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.supplementPriceStartTimeOnlyCount')
            .d('距补充单价开始时间仅剩'),
        });
      } else {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.supplementPriceStartTime')
          .d('补充单价开始时间');
        timeRender = intl.get('ssrc.biddingHall.view.label.toBeConfirmed').d('待定');
      }
    } else if (
      status === 'SUPPLEMENT_PRICE_BIDDING' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'SUPPLEMENT_PRICE_BIDDING')
    ) {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.supplementPriceEndTime')
        .d('补充单价结束时间');
      // 补充单价中
      if (headerSupplementPriceEndDate) {
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: headerSupplementPriceEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          numberStyle,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.supplementPriceEndTimeOnlyCount')
            .d('距补充单价结束时间仅剩'),
        });
      } else {
        timeRender = intl.get('ssrc.biddingHall.view.label.toBeConfirmed').d('待定');
      }
    } else if (status === 'BIDDING_END') {
      // 补充单价截止时间存在说明有补充单价阶段
      if (headerSupplementPriceEndDate) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.supplementPriceFinishTime')
          .d('补充单价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: headerSupplementPriceEndDate,
        });
      } else {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingFinishTime')
          .d('竞价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: headerQuotationEndDate,
        });
      }
    } else if (status === 'BIDDING_CLOSED') {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingFinishedTime')
        .d('竞价结束时间');
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

  // header time calc
  // 单价竞价 只显示时间 不显示倒计时
  headerTimerFormatRender = (data = {}) => {
    const { labelClass, valueClass } = this.props;
    const {
      status,
      biddingTrialBiddingFlag, // 试竞价标识
      headerSignInStartDate,
      headerSignInEndDate,
      headerTrialBiddingStartDate,
      // headerTrialBiddingEndDate,
      headerQuotationStartDate,
      headerQuotationEndDate,
      currentTime,
      // biddingOnlineSignInFlag,
      originalStatus = '', // 竞价暂停时单据的实际状态 SIGN_IN TRIAL_BIDDING BIDDING
      // currentBiddingRoundNumber,
    } = data;

    let timeRender = '';
    let labelPrefix = '';

    if (
      status === 'SIGN_NOT_START' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'SIGN_NOT_START')
    ) {
      // 签到未开始
      labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingSignInStartTime')
        .d('签到开始时间');
      timeRender = this.getStartEndDateIntervalSybmol({
        end: headerSignInStartDate,
        current: currentTime,
      });
    } else if (
      status === 'SIGNING' ||
      (status === 'BIDDING_PAUSED' && originalStatus === 'SIGNING')
    ) {
      // 签到中
      labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingSignInEndTime').d('签到结束时间');
      timeRender = this.getStartEndDateIntervalSybmol({
        end: headerSignInEndDate,
        current: currentTime,
      });
    } else if (
      ['TRIAL_BIDDING_NOT_START', 'BIDDING_NOT_START'].includes(status) ||
      (status === 'BIDDING_PAUSED' && originalStatus !== 'SIGN_NOT_START')
    ) {
      // 试竞价未开始
      if (
        biddingTrialBiddingFlag &&
        (status === 'TRIAL_BIDDING_NOT_START' ||
          (status === 'BIDDING_PAUSED' && originalStatus === 'TRIAL_BIDDING_NOT_START'))
      ) {
        labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
          .d('试竞价开始时间');
        timeRender = this.getStartEndDateIntervalSybmol({
          end: headerTrialBiddingStartDate,
          current: currentTime,
        });
      } else {
        labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingStartTime').d('竞价开始时间');
        timeRender = this.getStartEndDateIntervalSybmol({
          end: headerQuotationStartDate,
          current: currentTime,
        });
      }
    }

    if (status === 'BIDDING_END') {
      labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingFinishTime').d('竞价完成时间');
      timeRender = this.onlyRenderEndDateTime({
        end: headerQuotationEndDate,
      });
    }

    if (status === 'BIDDING_CLOSED') {
      labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingFinishedTime').d('竞价结束时间');
      timeRender = this.onlyRenderEndDateTime({
        end: headerQuotationEndDate,
      });
    }

    return (
      <>
        <span className={labelClass}>
          <Text>{labelPrefix}</Text>
        </span>
        <span className={valueClass}>
          <Text>{timeRender}</Text>
        </span>
      </>
    );
  };

  // render header time
  headerTimerRender = () => {
    const {
      data = null,
      wrapClass = '',
      isShowCountDownFlag = false,
      japOrDutchBidding,
    } = this.props;
    const {
      biddingStatus,
      biddingTrialBiddingFlag, // 试竞价标识
      originalStatus,
      // headerSignInStartDate,
      // headerSignInEndDate,
      // headerTrialBiddingStartDate,
      // headerTrialBiddingEndDate,
      // headerQuotationStartDate,
      // headerQuotationEndDate,
      currentTime,
      biddingOnlineSignInFlag,
      allHeaderDateTime,
      biddingPausedDate,
      biddingAutoDeferStartDate, // 延时竞价开始时间
      currentBiddingRoundNumber,
      currentBiddingRoundEndDate,
    } =
      data instanceof Record
        ? data?.get([
            'biddingStatus',
            'biddingTrialBiddingFlag',
            'originalStatus',
            'currentTime',
            'biddingOnlineSignInFlag',
            'allHeaderDateTime',
            'biddingPausedDate',
            'biddingAutoDeferStartDate',
            'currentBiddingRoundNumber',
            'currentBiddingRoundEndDate',
          ]) || {}
        : data || {};

    let japanDutchBiddingFlag = false;
    if (japOrDutchBidding) {
      japanDutchBiddingFlag = japOrDutchBidding();
    }

    const timeRelativeData = {
      status: biddingStatus,
      biddingTrialBiddingFlag, // 试竞价标识
      originalStatus,
      // 暂停的话 将暂停时间赋值给当前时间
      currentTime: biddingStatus === 'BIDDING_PAUSED' ? biddingPausedDate : currentTime,
      biddingOnlineSignInFlag,
      biddingAutoDeferStartDate, // 延时竞价开始时间
      currentBiddingRoundNumber,
      japanDutchBiddingFlag,
      currentBiddingRoundEndDate,
      ...(allHeaderDateTime || {}),
    };

    // 如果头时间需要显示倒计时 ps: 总价竞价需要显示倒计时
    if (isShowCountDownFlag) {
      return <span className={wrapClass}>{this.headerTimerCountDownRender(timeRelativeData)}</span>;
    }

    // IN_PROGRESS 不展示时间
    const processStatusFlag = ['TRIAL_BIDDING', 'BIDDING'].includes(biddingStatus); // 试竞价，正式竞价
    const processStatusPausedFlag =
      ['TRIAL_BIDDING', 'BIDDING'].includes(originalStatus) && biddingStatus === 'BIDDING_PAUSED'; // 试竞价，正式竞价, 延时竞价暂停
    if (processStatusFlag || processStatusPausedFlag) {
      return '';
    }

    return <span className={wrapClass}>{this.headerTimerFormatRender(timeRelativeData)}</span>;
  };

  // render line time
  lineTimerRender = () => {
    const { data = null, wrapClass = '', headerRecordData } = this.props;

    const {
      biddingTrialBiddingFlag,
      biddingStatus,
      // currentTime,
      originalStatus, // 真正的暂停状态
      biddingPausedDate,
    } =
      headerRecordData instanceof Record
        ? headerRecordData?.get([
            'biddingTrialBiddingFlag',
            'biddingStatus',
            'originalStatus',
            'biddingPausedDate',
          ]) || {}
        : headerRecordData || {};

    // biddingLineRule - 里面放一些规则的字段及时间
    const { biddingItemStatus, biddingLineRule = {}, currentTime } =
      data?.get(['biddingItemStatus', 'biddingLineRule', 'currentTime']) || {};

    const { quotationStartDate, quotationEndDate } = biddingLineRule || {};

    // 如果是暂停状态 则返回 不显示倒计时
    // if (biddingItemStatus === 'BIDDING_PAUSED' || biddingStatus === 'BIDDING_PAUSED') {
    //   return '';
    // }

    const timeRelativeData = {
      biddingTrialBiddingFlag, // 试竞价标识
      headerBiddingStatus: biddingStatus,
      lineStatus: biddingItemStatus,
      quotationStartDate,
      quotationEndDate,
      currentDateTime: currentTime,
      originalStatus,
      biddingPausedDate,
    };

    // if (['SIGN_NOT_START', 'SIGNING'].includes(biddingStatus)) {
    //   return '';
    // }

    return <span className={wrapClass}>{this.lineTimerFormatRender(timeRelativeData)}</span>;
  };

  /**
   * 开始结束间隔计算标识 - line
   */
  calcCurrentEndIntervalRenderLineTime = (times = {}) => {
    const { countDownTimerOver = noop } = this.props;
    const {
      end,
      current,
      showCountDownLTOneDayFlag = 0, // 当前时间于截止时间不足1天，直接渲染倒计时组件标识
      countDownLabel = null,
      pausedFlag,
      numberStyle = { color: '#E64322', fontSize: '14px', fontWeight: '600' },
    } = times || {};

    const invalidFlag = !end || !current || end <= current;

    if (invalidFlag) {
      return '';
    }

    // 结束时间和当前时间差
    const TimeMinus = moment(end).diff(current);

    if (showCountDownLTOneDayFlag) {
      // 是否超过1天，超过1天显示倒计时
      if (math.lt(TimeMinus, DayMillisecond)) {
        this.labelPrefix = countDownLabel ?? this.labelPrefix;
        return (
          <CountDown
            hiddenDayFlag={1}
            pausedFlag={pausedFlag}
            sysNow={current}
            endTime={end}
            timeOver={countDownTimerOver}
            type="dayChina"
            numberStyle={numberStyle}
          />
        );
      }
    }

    return this.getStartEndDateIntervalSybmol({
      end,
      current,
    });
  };

  // format line time
  lineTimerFormatRender = (data = {}) => {
    const { labelClass, valueClass, remote, remotePrefix } = this.props;
    const {
      biddingTrialBiddingFlag, // 试竞价标识
      lineStatus,
      headerBiddingStatus,
      quotationStartDate,
      quotationEndDate,
      currentDateTime,
      originalStatus,
      biddingPausedDate,
    } = data;

    let timeRender = '';
    this.labelPrefix = '';

    // 试竞价开始之前的所有状态
    const beforeTrialBiddingStatus = [
      'SIGN_NOT_START',
      'SIGNING',
      'TRIAL_BIDDING_NOT_START',
      'TRIAL_BIDDING',
    ];

    const pausedFlag = headerBiddingStatus === 'BIDDING_PAUSED';

    let currentTime = currentDateTime;
    if (headerBiddingStatus === 'BIDDING_PAUSED') {
      currentTime = biddingPausedDate; // 暂停的话 将暂停时间赋值给当前时间
    }

    if (
      // 竞价未开始 行上就显示试竞价时间
      lineStatus === 'BIDDING_NOT_START' ||
      (lineStatus === 'BIDDING_PAUSED' && moment(biddingPausedDate).isBefore(quotationStartDate))
    ) {
      if (
        biddingTrialBiddingFlag &&
        (beforeTrialBiddingStatus.includes(headerBiddingStatus) ||
          (headerBiddingStatus === 'BIDDING_PAUSED' &&
            beforeTrialBiddingStatus.includes(originalStatus)))
      ) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingStartTime')
          .d('试竞价开始时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: quotationStartDate,
          current: currentTime,
          pausedFlag,
          showCountDownLTOneDayFlag: 1,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingTrialStartTimeOnlyCount')
            .d('距试竞价开始时间仅剩'),
        });
      } else {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingStartTime')
          .d('竞价开始时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: quotationStartDate,
          current: currentTime,
          pausedFlag,
          showCountDownLTOneDayFlag: 1,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingStartTimeOnlyCount')
            .d('距竞价开始时间仅剩'),
        });
      }
    } else if (lineStatus === 'BIDDING_IN_PROGRESS' || lineStatus === 'BIDDING_PAUSED') {
      // 进行中
      if (
        biddingTrialBiddingFlag &&
        (originalStatus === 'TRIAL_BIDDING' || headerBiddingStatus === 'TRIAL_BIDDING')
      ) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingTrialBiddingEndTime')
          .d('试竞价结束时间');
        timeRender = this.calcCurrentEndIntervalRenderLineTime({
          end: quotationEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingTrialEndTimeOnlyCount')
            .d('距试竞价结束时间仅剩'),
        });
      } else {
        this.labelPrefix = intl.get('ssrc.biddingHall.view.label.biddingEndTime').d('竞价结束时间');

        let lineBiddingEndProps = {
          end: quotationEndDate,
          current: currentTime,
          showCountDownLTOneDayFlag: 1,
          pausedFlag,
          countDownLabel: intl
            .get('ssrc.biddingHall.view.label.biddingEndTimeOnlyCount')
            .d('距竞价结束时间仅剩'),
        };
        lineBiddingEndProps =
          remote && remotePrefix
            ? remote.process(
                `${remotePrefix}_LINE_TIMER_BIDDING_END_TIMER_PROPS`,
                lineBiddingEndProps,
                { that: this }
              )
            : lineBiddingEndProps;
        timeRender = this.calcCurrentEndIntervalRenderLineTime(lineBiddingEndProps);
      }
    }

    if (lineStatus === 'BIDDING_END') {
      // 如果头状态也是已完成状态或者正式竞价，则是真正完成状态
      if (
        ['BIDDING_END', 'BIDDING'].includes(headerBiddingStatus) ||
        ['BIDDING_END', 'BIDDING'].includes(originalStatus)
      ) {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.biddingFinishTime')
          .d('竞价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: quotationEndDate,
        });
      } else {
        this.labelPrefix = intl
          .get('ssrc.biddingHall.view.label.trailBiddingFinishTime')
          .d('试竞价完成时间');
        timeRender = this.onlyRenderEndDateTime({
          end: quotationEndDate,
        });
      }
    }

    if (lineStatus === 'BIDDING_CLOSED') {
      this.labelPrefix = intl
        .get('ssrc.biddingHall.view.label.biddingFinishedTime')
        .d('竞价结束时间');
      timeRender = this.onlyRenderEndDateTime({
        end: quotationEndDate,
      });
    }

    return (
      <span style={{ padding: '0 .04rem' }}>
        <span className={labelClass}>
          <Text>{this.labelPrefix}</Text>
        </span>
        <span className={valueClass}>
          <Text>{timeRender}</Text>
        </span>
      </span>
    );
  };

  render() {
    const {
      type = 'header', // header | line
    } = this.props;

    return type === 'header' ? this.headerTimerRender() : this.lineTimerRender();
  }
}

export default Timer;
