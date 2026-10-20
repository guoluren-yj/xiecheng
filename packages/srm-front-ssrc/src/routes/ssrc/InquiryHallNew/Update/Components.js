// 页面组件
import React, { Component } from 'react';
import {
  NumberField,
  Icon,
  CheckBox,
  Select,
  TextField,
  DateTimePicker,
  Tooltip,
} from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';

import { isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { dayHourMinuteToTimestamp } from '@/utils/utils';

import { calculateLatterFieldTime } from './utils/utils';

import './index.less';

const { Step } = Steps;
const { Option } = Select;

// 报价运行时间,表单字段
const StarDurationFields = (props) => {
  const { name, changeQuotationDuration = () => {}, ...others } = props;

  return (
    <React.Fragment>
      <NumberField
        {...others}
        name="quotationDay"
        style={{ width: '53%' }}
        placeholder={intl
          .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
          .d('运行时间(天)')}
        onChange={(value) => changeQuotationDuration(value, 'day')}
      />
      <NumberField
        {...others}
        name="quotationHour"
        style={{ width: '23%' }}
        label=""
        placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
        onChange={(value) => changeQuotationDuration(value, 'hour')}
      />
      <NumberField
        {...others}
        name="quotationMinute"
        style={{ width: '23%' }}
        label={null}
        placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        onChange={(value) => changeQuotationDuration(value, 'minute')}
      />
    </React.Fragment>
  );
};

// 多轮报价运行时间,表单字段
const RoundQuotationDurationFields = (props) => {
  const { name, changeRoundQuotationDuration, round, ...others } = props;
  return (
    <React.Fragment>
      <NumberField
        min={0}
        {...others}
        name={`roundDay${round}`}
        style={{ width: '53%' }}
        placeholder={
          intl.get('ssrc.common.the').d('第') +
          round +
          intl.get('ssrc.common.round').d('轮') +
          intl.get('ssrc.common.roundDay').d('(天)')
        }
        onChange={(value) => changeRoundQuotationDuration(value, 'day', round)}
      />
      <NumberField
        min={0}
        {...others}
        label={intl.get('ssrc.common.data.hours').d('时')}
        name={`roundHour${round}`}
        style={{ width: '23%' }}
        placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
        onChange={(value) => changeRoundQuotationDuration(value, 'hour', round)}
      />
      <NumberField
        min={0}
        {...others}
        name={`roundMinute${round}`}
        style={{ width: '23%' }}
        label={intl.get('ssrc.common.data.minutes').d('分')}
        placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        onChange={(value) => changeRoundQuotationDuration(value, 'minute', round)}
      />
    </React.Fragment>
  );
};

// 竞价运行时间
const BiddingPriceRunningFields = (props) => {
  const { name, changeBiddingRunningTime = () => {}, ...others } = props;

  return (
    <React.Fragment>
      <NumberField
        {...others}
        name="biddingRunnintDay"
        placeholder={intl
          .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
          .d('运行时间(天)')}
        style={{ width: '53%' }}
        onChange={(value) => changeBiddingRunningTime(value, 'day')}
      />
      <NumberField
        {...others}
        name="biddingRunnintHour"
        style={{ width: '23%' }}
        label={null}
        placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
        onChange={(value) => changeBiddingRunningTime(value, 'hour')}
      />
      <NumberField
        {...others}
        name="biddingRunnintMinute"
        style={{ width: '23%' }}
        label={null}
        placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        onChange={(value) => changeBiddingRunningTime(value, 'minute')}
      />
    </React.Fragment>
  );
};

const ScoreDetailDoubleFields = (props = {}) => {
  const { value, children, ...others } = props || {};
  return (
    <React.Fragment>
      <CheckBox {...others} />
      {children}
    </React.Fragment>
  );
};

const SourceNodes = (props = {}) => {
  const { name, rfxInfoDS } = props;

  if (!rfxInfoDS.current) {
    return null;
  }

  const rfxSteps = rfxInfoDS.current.get(name) || [];
  if (!rfxSteps || isEmpty(rfxSteps)) {
    return null;
  }

  const current = rfxSteps.filter((s = {}) => s.nodeFlag === 0) || [];
  const currentNodeStatus = (current[0] || {}).nodeSeq || 1;

  return (
    <Steps
      size="small"
      current={currentNodeStatus - 1}
      style={{ position: 'absolute', width: 'max-content', top: 0 }}
    >
      {rfxSteps.map((rfxStep) => {
        const { nodeFlag = 0, nodeStatus = null, nodeStatusMeaning = null } = rfxStep || {};

        return (
          <Step
            key={nodeStatus}
            title={
              <span
                style={{ fontSize: '12px', color: 'black', fontWeight: !nodeFlag ? '600' : '400' }}
              >
                {nodeStatusMeaning || nodeStatus}
              </span>
            }
            icon={<Icon type="brightness_o" />}
          />
        );
      })}
    </Steps>
  );
};

// 密封报价
const SealOpenBidFormFields = (props = {}) => {
  const { value, children, className, ...others } = props || {};

  return (
    <div className={className}>
      <CheckBox {...others} />
      {children}
    </div>
  );
};

// 联系电话
const PurPhoneFields = (props = {}) => {
  const { changePurPhone } = props || {};
  return (
    <React.Fragment>
      <Select clearButton={false} name="internationalTelCode" style={{ width: '50%' }} />
      <TextField
        name="purPhone"
        style={{ width: '50%', marginLeft: '-0.02rem' }}
        onChange={(value) => changePurPhone(value)}
      />
    </React.Fragment>
  );
};

// 联系人-电话
const ContactPhone = (props = {}) => {
  const { record } = props || {};
  return (
    <div style={{ display: 'flex', height: 'inherit', lineHeight: 'inherit' }}>
      <Select
        record={record}
        clearButton={false}
        name="internationalTelCode"
        style={{ width: '50%', height: '26px' }}
      />
      <TextField
        record={record}
        name="contactMobilephone"
        style={{ width: '50%', height: '26px' }}
      />
    </div>
  );
};

// 报价运行时间,表单字段
const TimeQuotationDurationFields = (props) => {
  const { name, changeQuotationDuration = () => {}, ...others } = props;

  return (
    <React.Fragment>
      <NumberField
        {...others}
        name="quotationDay"
        style={{ width: '20%' }}
        label={intl.get('hzero.common.date.unit.day').d('天')}
        placeholder={intl.get('hzero.common.date.unit.day').d('天')}
        onChange={(value) => changeQuotationDuration(value, 'day')}
      />
      <NumberField
        {...others}
        name="quotationHour"
        style={{ width: '20%' }}
        label={intl.get('hzero.common.date.unit.hours').d('小时')}
        placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
        onChange={(value) => changeQuotationDuration(value, 'hour')}
      />
      <NumberField
        {...others}
        name="quotationMinute"
        style={{ width: '20%' }}
        label={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        onChange={(value) => changeQuotationDuration(value, 'minute')}
      />
    </React.Fragment>
  );
};

const TimeBiddingDurationFields = (props) => {
  const {
    name,
    changeBiddingRunningTime = () => {},
    dayOverProps = {},
    hourOverProps = {},
    minuteOverProps = {},
    ...others
  } = props;

  return (
    <React.Fragment>
      <NumberField
        {...others}
        name="biddingRunnintDay"
        label={intl.get('hzero.common.date.unit.day').d('天')}
        placeholder={intl.get('hzero.common.date.unit.day').d('天')}
        style={{ width: '20%' }}
        onChange={(value) => changeBiddingRunningTime(value, 'day')}
        {...dayOverProps}
      />
      <NumberField
        {...others}
        name="biddingRunnintHour"
        style={{ width: '20%' }}
        label={intl.get('hzero.common.date.unit.hours').d('小时')}
        placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
        onChange={(value) => changeBiddingRunningTime(value, 'hour')}
        {...hourOverProps}
      />
      <NumberField
        {...others}
        name="biddingRunnintMinute"
        style={{ width: '20%' }}
        label={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
        onChange={(value) => changeBiddingRunningTime(value, 'minute')}
        {...minuteOverProps}
      />
    </React.Fragment>
  );
};

class NewStarDurationFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: 0,
    };
  }

  componentDidMount() {
    const { record = {} } = this.props;
    const quotationRunningDurationFlag = record.get('quotationRunningDurationFlag') || 0;
    this.setState({
      selectValue: quotationRunningDurationFlag,
    });
  }

  @Bind()
  changeSelect(value) {
    const { record = {}, biddingPriceFlag = false } = this.props;
    this.setState({ selectValue: value });
    record.set('quotationRunningDurationFlag', value);
    if (value === 0) {
      record.set('quotationEndDate', null);
    } else if (value === 1) {
      if (biddingPriceFlag) {
        record.set('biddingRunnintDay', null);
        record.set('biddingRunnintHour', null);
        record.set('biddingRunnintMinute', null);
        record.set('quotationRunningDuration', null);
      } else {
        record.set('quotationDay', null);
        record.set('quotationHour', null);
        record.set('quotationMinute', null);
        record.set('startQuotationRunningDuration', null);
      }
    }
  }

  render() {
    const {
      record,
      changeQuotationDuration,
      quotationName,
      biddingPriceFlag = false,
      changeBiddingRunningTime,
      remote,
    } = this.props;
    const { selectValue } = this.state;
    const quotationRunningDurationFlag = record.get('quotationRunningDurationFlag') || 0;
    const quotationEndDateFlag = record.get('quotationEndDateFlag') || 0;
    return (
      <React.Fragment>
        <Select
          clearButton={false}
          style={{ width: '40%', height: '26px' }}
          onChange={this.changeSelect}
          value={selectValue}
          name="quotationRunningDurationFlag"
          record={record}
        >
          <Option value={0}>
            {biddingPriceFlag
              ? intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间')
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotRunningDuration`, {
                    quotationName,
                  })
                  .d('{quotationName}运行时间')}
          </Option>
          <Option value={1} disabled={!quotationEndDateFlag}>
            {intl
              .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
                quotationName,
              })
              .d(`{quotationName}截止时间`)}
          </Option>
        </Select>
        {quotationRunningDurationFlag === 0 &&
          (biddingPriceFlag ? (
            <TimeBiddingDurationFields
              name="biddingRunnintDay"
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotRunningDuration`, {
                  quotationName,
                })
                .d('{quotationName}运行时间')}
              changeBiddingRunningTime={changeBiddingRunningTime}
            />
          ) : (
            <TimeQuotationDurationFields
              name="quotationDay"
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotRunningDuration`, {
                  quotationName,
                })
                .d('{quotationName}运行时间')}
              changeQuotationDuration={changeQuotationDuration}
            />
          ))}
        {quotationRunningDurationFlag === 1 && (
          <DateTimePicker
            name="quotationEndDate"
            defaultTime={
              remote
                ? remote.process(
                    'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_BIDDING_END_DEF_TIME',
                    undefined
                  )
                : undefined
            }
            style={{ width: '60%' }}
          />
        )}
      </React.Fragment>
    );
  }
}

// 竞价大厅-开始时间组件
@observer
class StartTimeWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.init();
  }

  init = () => {};

  changeSelect = (value) => {
    const { record = {}, startField = null, flagField, changeStartSelect } = this.props;

    record.set({
      [flagField]: value,
      [startField]: null,
    });
    // 计算后续所有的时间
    if (isFunction(calculateLatterFieldTime)) {
      calculateLatterFieldTime({ name: startField, record });
    }

    if (isFunction(changeStartSelect)) {
      changeStartSelect({ name: startField, record });
    }
  };

  changeDateTimerPicker = ({ name, record }) => {
    const { dateTimerPickerChange } = this.props;
    calculateLatterFieldTime({ name, record });

    if (isFunction(dateTimerPickerChange)) {
      dateTimerPickerChange({ name, record });
    }
  };

  render() {
    const {
      flagField,
      startField,
      record,
      // hidden = true,
      selectionOptions = [
        { value: 0, text: intl.get('ssrc.common.view.selectCustomDateTime').d('自定义时间') },
        {
          value: 1,
          text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
        },
      ],
      selectionProps = {},
    } = this.props;
    const selectedValue = record?.get(flagField) || 0;

    // todo
    // if (hidden) {
    //   return '';
    // }

    return (
      <React.Fragment>
        <Select
          clearButton={false}
          defaultValue={0}
          style={{ width: '40%', height: '26px' }}
          onChange={this.changeSelect}
          value={selectedValue}
          name={flagField}
          record={record}
          {...selectionProps}
        >
          {selectionOptions.map((option) => {
            return <Option value={option.value}>{option.text}</Option>;
          })}
        </Select>
        {selectedValue === 0 ? (
          <DateTimePicker
            name={startField}
            record={record}
            onChange={() => this.changeDateTimerPicker({ name: startField, record })}
            style={{ width: '60%' }}
          />
        ) : (
          ''
        )}
      </React.Fragment>
    );
  }
}

// 运行时间 动态
const DurationTimes = observer((props = {}) => {
  const { dayField, hourField, minuteField, durationField, ...others } = props;

  const changeTime = (value, currentField) => {
    const { record, updateTimes = null } = props || {};
    if (!record) {
      return;
    }
    const { [dayField]: dayTime, [hourField]: hourTime, [minuteField]: minuteTime } = record.get([
      dayField,
      hourField,
      minuteField,
    ]);
    if (!dayTime && !hourTime && !minuteTime) {
      record.set(currentField, null);
    } else {
      record.set(currentField, value);
    }
    if (updateTimes) {
      updateTimes();
    }
  };

  return (
    <React.Fragment>
      <NumberField
        {...others}
        name={dayField}
        label={intl.get('hzero.common.date.unit.day').d('天')}
        placeholder={intl.get('hzero.common.date.unit.day').d('天')}
        style={{ width: '20%' }}
        onChange={(value) => changeTime(value, dayField)}
      />
      <NumberField
        {...others}
        name={hourField}
        style={{ width: '20%' }}
        label={intl.get('hzero.common.date.unit.hours').d('小时')}
        placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
        onChange={(value) => changeTime(value, hourField)}
      />
      <span style={{ width: '20%', display: 'inline-block' }}>
        <NumberField
          {...others}
          // {...minuteOptions}
          name={minuteField}
          style={{ width: '100%' }}
          label={intl.get('hzero.common.date.unit.minutes').d('分钟')}
          placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
          onChange={(value) => changeTime(value, minuteField)}
        />
      </span>
    </React.Fragment>
  );
});

// 竞价大厅-截止时间组件
@observer
class EndTimeWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.init();
  }

  init = () => {};

  // 运行时间变更，则计算出截止时间
  updateTimes = () => {
    const {
      record = {},
      // startField,
      // timeField,
      durationField,
      dayField,
      hourField,
      minuteField,
      afterUpdateTimes = null,
    } = this.props;
    const daysField = record.get(dayField);
    const hoursFields = record.get(hourField);
    const minutesField = record.get(minuteField);

    const timestamp = dayHourMinuteToTimestamp(daysField, hoursFields, minutesField);
    // const startDate = record.get(startField);

    // if (startDate && timestamp > 0) {
    //   const startTimeStamp = new Date(startDate).getTime() + timestamp;
    //   const endDate = moment(startTimeStamp).format(DEFAULT_DATETIME_FORMAT);
    //   record.set(timeField, endDate);
    // } else {
    //   record.set(timeField, null);
    // }

    if (!daysField && !hoursFields && !minutesField) {
      record.set(durationField, null);
    } else {
      record.set(durationField, timestamp / 60000);
    }

    calculateLatterFieldTime({ name: durationField, record });

    if (afterUpdateTimes) {
      afterUpdateTimes({ name: durationField, record });
    }
  };

  changeTime = (value, record) => {
    const { timeField } = this.props;
    record.set({
      [timeField]: value,
    });

    // this.updateTimes();
  };

  changeSelect = (value = 0) => {
    const {
      record = {},
      durationField,
      timeField,
      dayField,
      hourField,
      minuteField,
      flagField,
      changeEndSelect,
    } = this.props;

    record.set({
      [flagField]: value,
      [durationField]: null,
      [timeField]: null,
      [dayField]: null,
      [hourField]: null,
      [minuteField]: null,
    });
    calculateLatterFieldTime({ name: timeField, record });

    if (isFunction(changeEndSelect)) {
      changeEndSelect({ name: timeField, record });
    }
  };

  changeDateTimerPicker = ({ name, record }) => {
    const { dateTimerPickerChange } = this.props;
    calculateLatterFieldTime({ name, record });

    if (isFunction(dateTimerPickerChange)) {
      dateTimerPickerChange({ name, record });
    }
  };

  render() {
    const {
      record,
      flagField,
      // name,
      title = '',
      durationField,
      timeField,
      dayField,
      hourField,
      minuteField,
      // hidden = false,
      hiddenEndDate = false,
      hiddenRunningOptions = false,
      minuteOptions = {}, // 分钟配置
    } = this.props;

    const { [flagField]: runningDurationFlag = 1 } = record?.get([flagField]) || {};

    // todo
    // if (hidden) {
    //   return '';
    // }

    return (
      <React.Fragment>
        <Tooltip title={minuteOptions.showHelp ? minuteOptions.help : ''}>
          <Select
            clearButton={false}
            style={{ width: '40%', height: '26px' }}
            onChange={this.changeSelect}
            value={runningDurationFlag}
            name={flagField}
            record={record}
          >
            {!hiddenRunningOptions ? (
              <Option value={1}>
                {intl
                  .get('ssrc.common.view.runningDurationTimeWithTitle', { title })
                  .d('{title}运行时间')}
                {/* {title + intl.get('ssrc.common.view.runningDurationTime').d('运行时间')} */}
              </Option>
            ) : ""}
            {!hiddenEndDate && (
              <Option value={0}>
                {intl.get('ssrc.common.view.endTimeWithTitle', { title }).d('{title}截止时间')}
              </Option>
            )}
          </Select>
        </Tooltip>
        {runningDurationFlag !== 1 ? (
          <DateTimePicker
            onChange={() => this.changeDateTimerPicker({ name: timeField, record })}
            name={timeField}
            style={{ width: '60%' }}
          />
        ) : (
          <DurationTimes
            record={record}
            dayField={dayField}
            hourField={hourField}
            minuteField={minuteField}
            durationField={durationField}
            updateTimes={this.updateTimes}
            // minuteOptions={minuteOptions}
          />
        )}
      </React.Fragment>
    );
  }
}

// 报价幅度展示
const QuotationRange = observer((props) => {
  const { record, rfxInfoDS, type = 'unitPrice' } = props || {};

  // 渲染select
  const renderSelect = () => {
    return (
      <Select
        clearButton={false}
        record={record}
        name="floatType"
        onChange={() => {
          record.set('quotationRange', null);
          record.set('biddingTrialQuotationRange', null);
        }}
      />
    );
  };

  const NumberFieldStyle = {
    marginLeft: '-1px',
  };

  // 渲染精度组件
  const renderQuotationRang = () => {
    if (type === 'unitPrice') {
      // 单价竞价取币种单价精度
      return (
        <C7nPrecisionInputNumber
          name="quotationRange"
          record={record}
          currency="currencyCode"
          addonBefore={renderSelect()}
          headerRecord={rfxInfoDS?.current}
          omitZeroFlag
          style={NumberFieldStyle}
        />
      );
    }
    // 总价竞价取币种财务精度
    return (
      <C7nPrecisionInputNumber
        name="quotationRange"
        record={record}
        financial="currencyCode"
        addonBefore={renderSelect()}
        omitZeroFlag
        style={NumberFieldStyle}
      />
    );
  };

  return (
    <React.Fragment>
      <div className="inquiry-update-quotation-range">
        {record.get('floatType') === 'ratio' ? (
          <NumberField
            name="quotationRange"
            record={record}
            addonBefore={renderSelect()}
            addonAfter="%"
            style={NumberFieldStyle}
          />
        ) : (
          renderQuotationRang()
        )}
      </div>
    </React.Fragment>
  );
});

export {
  StarDurationFields,
  BiddingPriceRunningFields,
  SourceNodes,
  ScoreDetailDoubleFields,
  SealOpenBidFormFields,
  RoundQuotationDurationFields,
  PurPhoneFields,
  ContactPhone,
  NewStarDurationFields,
  StartTimeWrapper,
  EndTimeWrapper,
  QuotationRange,
  TimeBiddingDurationFields,
};
