import React, { Component } from 'react';
import { Form, TextArea, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import moment from 'moment';
import { isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import {
  StartTimeWrapper,
  EndTimeWrapper,
  TimeBiddingDurationFields,
} from '@/routes/ssrc/InquiryHallNew/Update/Components';
import { transTimeToDHS } from '@/utils/utils';
import { fetchPurchaseBiddingHeader } from '../../api';

const TimerOut = 15_000;

@observer
class AdjustTime extends Component {
  constructor(props) {
    super(props);

    this.timer = null;

    // 头正式竞价剩余时间-分钟数
    this.headerLastedMinute = null;

    // 延迟或提前的时间差值-分钟
    this.timeAdjustValue = null;

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      headerInfo: {},
    };
  }

  // 正式竞价开始时间下拉框
  optionsObj = {
    defaultOption: {
      value: 0,
      text: intl.get('ssrc.common.view.selectCustomDateTime').d('自定义时间'),
    },
    value1: {
      value: 1,
      text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
    },
    value2: {
      value: 1,
      text: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.startAfterPreQualificationEnd`)
        .d('资格预审截止即开始'),
    },
    value3: {
      value: 1,
      text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startAfterSignIn`).d('签到截止即开始'),
    },
    value4: {
      value: 1,
      text: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.startAfterTrialBiddingEnd`)
        .d('试竞价截止即开始'),
    },
    value5: {
      value: 1,
      text: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.startAfterQuotationEnd`)
        .d('竞价截止即开始'),
    },
  };

  componentDidMount() {
    this.initPage();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  getHeaderDSRecord = () => {
    const { headerInfoDS } = this.props;
    const { current } = headerInfoDS || {};

    return current;
  };

  getAdjustTimeDSRecord = () => {
    const { adjustTimeDs } = this.props;
    const { current } = adjustTimeDs || {};

    return current;
  };

  fetchHeader = async (options = {}) => {
    const { rfxHeaderId } = this.props;
    if (!rfxHeaderId) {
      return;
    }

    let header = null;
    const param = {
      rfxHeaderId,
      organizationId: this.organizationId,
    };

    try {
      header = await fetchPurchaseBiddingHeader(param);
      header = getResponse(header);
      if (!header) {
        return;
      }

      this.setState(
        {
          headerInfo: header,
        },
        () => {
          this.calcTime({ header });

          this.initAdjustTimeDS(options);
        }
      );
    } catch (e) {
      throw e;
    }
  };

  initAdjustTimeDS = (options) => {
    const { headerInfo } = this.state;
    const adjustRecord = this.getAdjustTimeDSRecord();
    const { initPageFlag } = options || {};
    if (!adjustRecord || !initPageFlag) {
      return;
    }

    const {
      autoDeferFlag,
      biddingSupplementPriceStartDate,
      biddingSupplementPriceEndDate,
      biddingTotalPricePrinciple, // 总价竞价原则
      biddingTarget, // 竞价对象
      quotationEndDate,
      autoDeferDuration,
      biddingSupplementPriceRunningDurationFlag,
      biddingSupplementPriceStartFlag,
      biddingSupplementPriceRunningDuration = null,
    } = headerInfo || {};

    // 总价竞价且总价竞价原则为总价必输
    let totalPriceTotalPriceRequiredFlag =
      biddingTarget === 'TOTAL_PRICE' && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
    totalPriceTotalPriceRequiredFlag = totalPriceTotalPriceRequiredFlag ? 1 : 0;

    let supplementEndRunningFieldsValue = {};
    // 上游选择是运行时间，需要带出并算时分秒
    if (
      biddingSupplementPriceRunningDurationFlag === 1 &&
      !isNil(biddingSupplementPriceRunningDuration)
    ) {
      const { day, hour, minute } = transTimeToDHS(biddingSupplementPriceRunningDuration) || {};
      supplementEndRunningFieldsValue = {
        biddingSupplementPriceRunnintDay: day,
        biddingSupplementPriceRunnintHour: hour,
        biddingSupplementPriceRunnintMinute: minute,
      };
    }

    adjustRecord.set({
      biddingSupplementPriceStartFlag,
      autoDeferFlag,
      biddingSupplementPriceRunningDurationFlag,
      totalPriceTotalPriceRequiredFlag,
      quotationEndDate,
      biddingSupplementPriceStartDate,
      biddingSupplementPriceEndDate,
      autoDeferDuration,
      biddingTarget,
      biddingTotalPricePrinciple,
      biddingSupplementPriceRunningDuration,
      ...supplementEndRunningFieldsValue,
    });
  };

  initPage = () => {
    this.fetchHeader({
      initPageFlag: 1,
    });

    this.timer = setInterval(this.fetchHeader, TimerOut);
  };

  clearTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  // 正式竞价截止时间
  getFormEndDate = () => {
    const headerRecord = this.getHeaderDSRecord();
    if (!headerRecord) {
      return;
    }

    const { biddingNodeDTOS, quotationEndDate } =
      headerRecord.get(['biddingNodeDTOS', 'quotationEndDate']) || {};
    let currentEndDate = quotationEndDate;

    if (!isEmpty(biddingNodeDTOS)) {
      biddingNodeDTOS.forEach((node) => {
        const { nodeName, endDate } = node || {};

        if (nodeName === 'BIDDING' && endDate) {
          currentEndDate = endDate;
        }
      });
    }

    return currentEndDate;
  };

  // 计算剩余时间时间
  calcTime = (options) => {
    const { header } = options || {};
    const headerRecord = this.getHeaderDSRecord();
    const adjustRecord = this.getAdjustTimeDSRecord();
    const { currentTime: currentTimeValue } = header || {};
    if (!headerRecord || !adjustRecord) {
      return;
    }

    const { currentTime: headerCurrentTime } = headerRecord.get(['currentTime']) || {};
    const currentTime = currentTimeValue || headerCurrentTime;

    // 时间未结束
    const formQuotationEndDate = this.getFormEndDate();
    const biddingRunning =
      currentTime && formQuotationEndDate && formQuotationEndDate > currentTime;
    if (!biddingRunning) {
      return;
    }

    let remainSeconds = new Date(formQuotationEndDate).getTime() - new Date(currentTime).getTime();
    remainSeconds = remainSeconds / 1000 / 60; // to minute
    remainSeconds = Math.ceil(remainSeconds);

    const { day, hour, minute } = transTimeToDHS(remainSeconds) || {};
    this.headerLastedMinute = remainSeconds;

    const newDay = day || 0;
    const newHour = hour || 0;
    const newMinute = !isNil(minute) ? Math.floor(minute) : 0;

    const vlaueText =
      newDay +
      intl.get('hzero.common.date.unit.day').d('天') +
      newHour +
      intl.get('hzero.common.date.unit.hours').d('小时') +
      newMinute +
      intl.get('hzero.common.date.unit.minutes').d('分钟');

    adjustRecord.set({
      currentBiddingFormalLadtedTime: vlaueText,
      currentTime,
    });
  };

  /**
   * 正式竞价时间
   * 1.当单据存在补充单价节点时显示。默认带出维护页【补充单价开始时间】维护的时间样式。

2.下拉框值集：竞价截止即开始/自定义时间。当单据存在延时竞价节点时，仅显示【竞价截止即开始】且不可编辑。

3.选择【自定义时间】时，增加下述逻辑：

①选择的时间不得早于当前时间。

②【调整后竞价剩余时间】该字段变更后，需要根据最新计算出的提前/推迟的时间，给【补充单价开始时间】做相应的提前/推迟。例如选择【调整后竞价剩余时间】后，最新竞价截止时间推迟了5分钟，则【补充单价开始时间】需要前端自动顺延5分钟

③当【调整后竞价剩余时间】该字段变更，顺延了【补充单价开始时间】，此时用户又手动修改了【补充单价开始时间】，则以用户手动修改的时间为最终的时间更新

4.该字段显示时必输
   *
   * */
  changeBiddingRunningTime = (value = null, type = 'minute') => {
    const { adjustTimeDs } = this.props;
    const headerRecord = this.getHeaderDSRecord();

    let data = null;
    const { current } = adjustTimeDs || {};
    if (!current) {
      return;
    }

    const {
      biddingRunnintDay: days = null,
      biddingRunnintHour: hours = null,
      biddingRunnintMinute: minutes = null,
      // biddingSupplementPriceStartDate = null,
      updateBiddingSupplementPriceStartDateFlag,
      autoDeferFlag,
    } =
      current?.get([
        'biddingRunnintDay',
        'biddingRunnintHour',
        'biddingRunnintMinute',
        // 'biddingSupplementPriceStartDate',
        'updateBiddingSupplementPriceStartDateFlag',
        'autoDeferFlag',
      ]) || {};
    const { biddingSupplementPriceStartDate: headerBiddingSupplementPriceStartDate } =
      headerRecord.get(['biddingSupplementPriceStartDate']) || {};

    if (!days && !hours && !minutes) {
      current.set({
        biddingRunnintDay: null,
        biddingRunnintHour: null,
        biddingRunnintMinute: null,
        adjustQuotationRunningDuration: data,
      });
      return;
    }

    if (type === 'day') {
      data = value * 1440 + hours * 60 + minutes;
    } else if (type === 'hour') {
      data = days * 1440 + value * 60 + minutes;
    } else {
      data = days * 1440 + hours * 60 + value;
    }

    if (updateBiddingSupplementPriceStartDateFlag !== 1 && autoDeferFlag !== 1) {
      const start = data || 0;
      const end = this.headerLastedMinute || 0;
      this.timeAdjustValue = start - end;
      let biddingSupplementPriceStartDateValue = headerBiddingSupplementPriceStartDate;

      biddingSupplementPriceStartDateValue = biddingSupplementPriceStartDateValue
        ? moment(biddingSupplementPriceStartDateValue).add(this.timeAdjustValue, 'm')
        : null;

      // if (this.timeAdjustValue) {
      //   biddingSupplementPriceStartDateValue = biddingSupplementPriceStartDateValue
      //     ? moment(biddingSupplementPriceStartDateValue).add(this.timeAdjustValue, 'm')
      //     : null;
      // } else {
      //   biddingSupplementPriceStartDateValue = biddingSupplementPriceStartDateValue
      //     ? moment(biddingSupplementPriceStartDateValue).subtract(this.timeAdjustValue, 'm')
      //     : null;
      // }

      current.set({
        biddingSupplementPriceStartDate: biddingSupplementPriceStartDateValue,
      });
    }

    current.set('adjustQuotationRunningDuration', data);
  };

  dateTimerStartPickerChange = ({ record }) => {
    record.set({
      updateBiddingSupplementPriceStartDateFlag: 1,
    });
  };

  changeStartSelect = ({ record }) => {
    record.set({
      updateBiddingSupplementPriceStartDateFlag: 1,
    });
  };

  dateTimerEndPickerChange = ({ record }) => {
    record.set({
      updateBiddingSupplementPriceEndDateFlag: 1,
    });
  };

  changeEndSelect = ({ record }) => {
    record.set({
      updateBiddingSupplementPriceEndDateFlag: 1,
    });
  };

  renderFormFields = () => {
    const { headerInfoDS, adjustTimeDs } = this.props;
    const { current } = headerInfoDS || {};
    const { current: record } = adjustTimeDs || {};
    if (!current || !record) {
      return '';
    }

    const {
      autoDeferFlag,
      biddingTotalPricePrinciple, // 总价竞价原则
      biddingTarget, // 竞价对象
    } = current
      ? current.get([
          'autoDeferFlag', // 是否启用自动延时
          'biddingTotalPricePrinciple', // 总价竞价原则
          'biddingTarget', // 竞价对象
        ])
      : {};

    // 是否启用自动延时
    const resumeAutoDeferFlag = autoDeferFlag;
    // 总价竞价且总价竞价原则为总价必输
    const totalPriceFlag =
      biddingTarget === 'TOTAL_PRICE' && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

    // 补充单价字段
    const biddingSupplementPriceFields = totalPriceFlag
      ? [
        <StartTimeWrapper
          title={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceStartDate`)
              .d(`补充单价开始时间`)}
          name="biddingSupplementPriceStartDate"
          flagField="biddingSupplementPriceStartFlag"
          startField="biddingSupplementPriceStartDate"
          record={record}
          selectionOptions={
              resumeAutoDeferFlag
                ? [this.optionsObj.value5]
                : [this.optionsObj.value5, this.optionsObj.defaultOption]
            }
          selectionProps={{
              disabled: resumeAutoDeferFlag === 1,
            }}
          dateTimerPickerChange={this.dateTimerStartPickerChange}
          changeStartSelect={this.changeStartSelect}
        />,
        <EndTimeWrapper
          title={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`)
              .d(`补充单价`)}
          name="biddingSupplementPriceEndDate"
          flagField="biddingSupplementPriceRunningDurationFlag"
          timeField="biddingSupplementPriceEndDate"
          durationField="biddingSupplementPriceRunningDuration"
          dayField="biddingSupplementPriceRunnintDay"
          hourField="biddingSupplementPriceRunnintHour"
          minuteField="biddingSupplementPriceRunnintMinute"
          record={record}
          startField="biddingSupplementPriceStartDate"
          hiddenEndDate={resumeAutoDeferFlag}
          afterUpdateTimes={this.dateTimerEndPickerChange}
          dateTimerPickerChange={this.dateTimerEndPickerChange}
          changeEndSelect={this.changeEndSelect}
        />,
        ]
      : [];

    const fields = [
      <TextField name="currentBiddingFormalLadtedTime" />,
      <TextField
        name="autoDeferDuration"
        renderer={({ value }) => {
          if (!isNil(value)) {
            return `${value}${intl
              .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
              .d('分钟')}`;
          }
          return '';
        }}
        hidden={!autoDeferFlag}
      />,
      <TimeBiddingDurationFields
        name="biddingRunnintDay"
        dayOverProps={{
          label: intl
            .get('ssrc.inquiryHall.model.inquiryHall.afterAdjustBiddingEndTime')
            .d('调整后竞价剩余时间'),
          style: {
            width: '49%',
          },
          record,
        }}
        hourOverProps={{
          style: {
            width: '25%',
          },
        }}
        minuteOverProps={{
          style: {
            width: '25%',
          },
        }}
        record={record}
        changeBiddingRunningTime={this.changeBiddingRunningTime}
      />,
      ...biddingSupplementPriceFields,
      <TextArea name="adjustRemark" resize="vertical" />,
    ].filter(Boolean);

    return fields;
  };

  render() {
    const { adjustTimeDs } = this.props;

    return (
      <div>
        <Form dataSet={adjustTimeDs} columns={1} labelLayout="float">
          {this.renderFormFields()}
        </Form>
      </div>
    );
  }
}

export default AdjustTime;
