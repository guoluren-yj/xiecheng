// 页面组件
import React, { Component, useEffect, useState } from 'react';
import { NumberField, Select, DateTimePicker, Tooltip } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { useComputed } from 'mobx-react-lite';
import moment from 'moment';
import { isObject, isFunction, isNumber, isEmpty, isArray, isString, isNil } from 'lodash';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getResponse } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { queryIdpValue } from 'services/api'; // 查询单个值集

import { numberSeparatorRender } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { dayHourMinuteToTimestamp } from '@/utils/utils';
import { calculateLatterFieldTime } from '@/routes/ssrc/InquiryHallNew/Update/utils/utils';

import style from '../index.less';

const { Option } = Select;

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
    const {
      record = {},
      startField = null,
      flagField,
      // endTimeField,
      historyDTO,
    } = this.props;

    record.set({
      [flagField]: value,
      [startField]: null,
    });

    if (value === 2) {
      // 如果是发布截止即开始，则设置 nowAdjustedField 为当前字段
      // record.set('nowAdjustedField', startField);
      nowAdjustedFieldAdd({ name: startField, flagField, record });
    } else {
      // record.set('nowAdjustedField', null);
      nowAdjustedFieldRemove({ name: startField, record });
    }
    // 切换的时候 若当前flag值和之前相同，则清除
    const historyValue = record.get(historyDTO) && record.get(historyDTO)?.[name];
    if (historyValue === value) {
      addOrClearPreviousAdjustFields({ record, clearName: startField });
    }

    if (isFunction(calculateLatterFieldTime)) {
      calculateLatterFieldTime({ name: startField, record });
    }
  };

  // changeTime = (value) => { // 改变开始时间，如果截止是运行时间 则需要计算出截止时间
  //   const { endFlagField, endDurationField, endTimeField, record } = this.props;
  //   const endFlag = record.get(endFlagField);
  //   const endDuration = record.get(endDurationField);
  //   if (value && endFlag === 1 && endDuration > 0) {
  //     const startTimeStamp = moment(value).valueOf() + endDuration * 60000;
  //     const endDate = moment(startTimeStamp).format(DEFAULT_DATETIME_FORMAT);
  //     record.set(endTimeField, endDate);
  //   }
  // }

  render() {
    const {
      flagField,
      startField,
      record,
      disabled,
      // hidden = true,
      selectionOptions = [
        { value: 0, text: intl.get('ssrc.common.view.selectCustomDateTime').d('自定义时间') },
        {
          value: 1,
          text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
        },
      ],
      historyDTO,
      remote,
      header,
    } = this.props;
    const selectedValue = record?.get(flagField) || 0;

    // 内层组件需要的公共属性值
    const insideCommonDiffProps = {
      historyDTO,
      record,
      disabled,
    };

    let showSelectWrap = !disabled;

    const showDateTimeWrap = selectedValue === 0 || disabled;

    showSelectWrap = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_BIDDING_DEMANDFORM_START_TIME_SELECT_SHOW',
          showSelectWrap,
          {
            header,
            that: this,
            flagField,
            startField,
          }
        )
      : showSelectWrap;

    let selectDisabled = disabled;
    selectDisabled = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_BIDDING_DEMANDFORM_START_TIME_SELECT_DISABLED',
          selectDisabled,
          {
            header,
            that: this,
            flagField,
            startField,
          }
        )
      : selectDisabled;

    return (
      <React.Fragment>
        <div className={style.diffContainer}>
          {showSelectWrap ? (
            <SelectWrapperDiffRender
              name={flagField}
              {...insideCommonDiffProps}
              changeField={startField}
            >
              <Select
                clearButton={false}
                defaultValue={0}
                style={{ width: '40%', height: '26px' }}
                onChange={this.changeSelect}
                value={selectedValue}
                name={flagField}
                record={record}
                disabled={selectDisabled}
              >
                {selectionOptions.map((option) => {
                  return <Option value={option.value}>{option.text}</Option>;
                })}
              </Select>
            </SelectWrapperDiffRender>
          ) : (
            ''
          )}

          {showDateTimeWrap ? (
            <ComponentDiffRender key={startField} name={startField} {...insideCommonDiffProps}>
              <DateTimePicker
                name={startField}
                record={record}
                onChange={() => calculateLatterFieldTime({ name: startField, record })}
                style={{ width: '60%' }}
              />
            </ComponentDiffRender>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

// 运行时间 动态
const DurationTimes = observer((props = {}) => {
  const {
    record,
    durationField,
    dayField,
    hourField,
    minuteField,
    // minuteOptions = {},
    historyDTO,
    outSideRedFlag,
    ...others
  } = props;

  const changeTime = (value, currentField) => {
    const { updateTimes = null } = props || {};
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
      updateTimes({ name: durationField, record });
    }
  };

  // 公共属性值
  const commonDiffRenderProps = {
    outSideRedFlag,
    historyDTO,
    record,
    // durationField,
  };

  return (
    <React.Fragment>
      <ComponentDiffRender key={dayField} name={dayField} {...commonDiffRenderProps}>
        <NumberField
          {...others}
          name={dayField}
          label={intl.get('hzero.common.date.unit.day').d('天')}
          placeholder={intl.get('hzero.common.date.unit.day').d('天')}
          style={{ width: '20%' }}
          onChange={(value) => changeTime(value, dayField)}
        />
      </ComponentDiffRender>
      <ComponentDiffRender key={hourField} name={hourField} {...commonDiffRenderProps}>
        <NumberField
          {...others}
          name={hourField}
          style={{ width: '20%' }}
          label={intl.get('hzero.common.date.unit.hours').d('小时')}
          placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
          onChange={(value) => changeTime(value, hourField)}
        />
      </ComponentDiffRender>
      <ComponentDiffRender key={minuteField} name={minuteField} {...commonDiffRenderProps}>
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
      </ComponentDiffRender>
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
    } = this.props;
    if (value === 2) {
      // 如果是发布截止即开始，则设置 nowAdjustedField 为当前字段
      // record.set('nowAdjustedField', timeField);
      nowAdjustedFieldAdd({ name: timeField, flagField, record });
      addOrClearPreviousAdjustFields({ record, clearName: [dayField, hourField, minuteField] });
    } else {
      nowAdjustedFieldRemove({ name: timeField, record });
      // record.set('nowAdjustedField', null);
      if (value === 0) {
        // 自定义时间，清除运行时间调整字段
        addOrClearPreviousAdjustFields({ record, clearName: [dayField, hourField, minuteField] });
      } else if (value === 1) {
        // 运行时间，清除自定义时间调整字段
        addOrClearPreviousAdjustFields({ record, clearName: timeField });
      }
    }

    record.set({
      [flagField]: value,
      [durationField]: null,
      [timeField]: null,
      [dayField]: null,
      [hourField]: null,
      [minuteField]: null,
    });
    // 切换选择框 计算后续时间
    calculateLatterFieldTime({ name: timeField, record });
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
      // hiddenEndDate = false,
      minuteOptions = {}, // 分钟配置
      selectionOptions = [],
      disabled,
      header,
      historyDTO = '',
      remote,
    } = this.props;

    const { [flagField]: runningDurationFlag = 1 } = record?.get([flagField, historyDTO]) || {};

    // const hisDTOCopy = hisDTO || {};
    // const curFlagValue = runningDurationFlag;
    // const hisFlagValue = hisDTOCopy[flagField];

    // let popoverValue = '';
    // let outSideRedFlag = false; // 外层标红flag --- 外层标红，内层也标红；内层标红，外层不一定全部都标红
    // // 先看下拉框的的值是否相同，如果相同，内层标红即可；否则外层直接标红
    // if (curFlagValue !== hisFlagValue) {
    //   outSideRedFlag = true;
    //   if (hisFlagValue === 1) {
    //     // 运行时间
    //     const dayFieldValue = hisDTOCopy[dayField];
    //     const hourFieldValue = hisDTOCopy[hourField];
    //     const minuteFieldValue = hisDTOCopy[minuteField];
    //     popoverValue = `${dayFieldValue ? `${dayFieldValue}时 ` : ''}${
    //       hourFieldValue ? `${hourFieldValue}分 ` : ''
    //     }${minuteFieldValue ? `${minuteFieldValue}秒 ` : ''}`;
    //   } else {
    //     // 自定义时间
    //     popoverValue = hisDTOCopy[timeField];
    //   }
    // }

    // 内层组件需要的公共属性值
    const insideCommonDiffProps = {
      // outSideRedFlag,
      historyDTO,
      record,
      disabled,
    };

    let showSelectWrap = !disabled;
    showSelectWrap = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_BIDDING_DEMANDFORM_END_TIME_SELECT_SHOW',
          showSelectWrap,
          {
            header,
            that: this,
            flagField,
          }
        )
      : showSelectWrap;

    let selectDisabled = disabled;
    selectDisabled = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_BIDDING_DEMANDFORM_END_TIME_SELECT_DISABLED',
          selectDisabled,
          {
            header,
            that: this,
            flagField,
          }
        )
      : selectDisabled;

    // const showDateTimeWrap = selectedValue === 0 || disabled;

    return (
      <React.Fragment>
        {/* <TimeWrapperDiffRender name={timeField} record={record} content={popoverValue}> */}
        <div className={style.diffContainer}>
          {showSelectWrap ? (
            <SelectWrapperDiffRender name={flagField} endSelectFlag {...insideCommonDiffProps}>
              <Tooltip title={minuteOptions.showHelp ? minuteOptions.help : ''}>
                <Select
                  clearButton={false}
                  style={{ width: '40%', height: '26px' }}
                  onChange={this.changeSelect}
                  value={runningDurationFlag}
                  name={flagField}
                  record={record}
                  disabled={selectDisabled}
                >
                  {selectionOptions.map((option) => {
                    return (
                      <Option value={option.value}>
                        {option.value !== 2 ? title + option.text : option.text}
                      </Option>
                    );
                  })}
                </Select>
              </Tooltip>
            </SelectWrapperDiffRender>
          ) : (
            ''
          )}

          {runningDurationFlag !== 2 &&
            (runningDurationFlag === 0 || disabled ? (
              <ComponentDiffRender name={timeField} {...insideCommonDiffProps}>
                <DateTimePicker
                  onChange={() => calculateLatterFieldTime({ name: timeField, record })}
                  name={timeField}
                  style={{ width: '60%' }}
                />
              </ComponentDiffRender>
            ) : (
              <DurationTimes
                record={record}
                dayField={dayField}
                hourField={hourField}
                minuteField={minuteField}
                durationField={durationField}
                updateTimes={this.updateTimes}
                // minuteOptions={minuteOptions}
                historyDTO={historyDTO}
                // outSideRedFlag={outSideRedFlag}
              />
            ))}
        </div>
        {/* </TimeWrapperDiffRender> */}
      </React.Fragment>
    );
  }
}

// 切换下拉框的时候将现在的字段添加进去或者将之前的调整字段删除
const addOrClearPreviousAdjustFields = (payload = {}) => {
  const { record, clearName, addName } = payload || {};
  let oldFields = record?.get('adjustFields') || [];
  // 向adjustFields添加字段
  if (addName) {
    if (!oldFields?.includes(addName)) {
      oldFields = [...oldFields, addName];
    }
  }
  // 从adjustFields 删除字段
  if (clearName) {
    // 如果是数组，循环执行删除
    if (isArray(clearName) && !isEmpty(clearName)) {
      clearName.forEach((itemName) => {
        if (oldFields?.includes(itemName)) {
          const index = oldFields?.indexOf(itemName);
          oldFields.splice(index, 1);
        }
      });
    } else if (isString(clearName)) {
      // 字符串直接删除
      if (oldFields?.includes(clearName)) {
        const index = oldFields?.indexOf(clearName);
        oldFields.splice(index, 1);
      }
    }
  }
  record.set('adjustFields', oldFields.length ? oldFields : null);
};

// 发布即开始 - add filed
const nowAdjustedFieldAdd = (payload = {}) => {
  const { name = null, flagField, record = {} } = payload || {};
  const oldFields = record.get('nowAdjustedField') || '';
  // let newFields = oldFields.split(',').filter(Boolean);

  const currentIndex = oldFields.indexOf(name);
  if (currentIndex === -1) {
    // newFields.push(name);
    record.set('nowAdjustedField', name);
    // 方便提交数据时 设置发布即开始或者发布即截止下拉框flag为0
    record.set('nowAdjustedFieldTimeSelectFlagField', flagField);
  }

  // newFields = newFields.join(',');
};

// 发布即开始 - remove filed
const nowAdjustedFieldRemove = (payload) => {
  const { name = null, record = {} } = payload || {};
  const oldFields = record.get('nowAdjustedField') || '';
  // let newFields = oldFields.split(',').filter(Boolean);

  const currentIndex = oldFields.indexOf(name);
  if (currentIndex > -1) {
    // newFields.splice(currentIndex, 1);
    record.set('nowAdjustedField', null);
    record.set('nowAdjustedFieldTimeSelectFlagField', null);
  }

  // newFields = newFields.join(',');
};

// 下拉框组件渲染对比 只标红，不提示气泡
const SelectWrapperDiffRender = observer((props) => {
  const {
    record, // 当前记录行数据
    historyDTO, // 历史DTO名称
    name, // 当前字段名称
    children,
    changeField, // 数据变更对应的真正字段
  } = props || {};
  const currentValue = record.get(name);
  const historyValue = record.get(historyDTO) && record.get(historyDTO)?.[name];
  if (changeField) {
    // 因为每次数据变更会触发到这个组件 因此只在值不相同时加入adjustFields，在切换时值相同删除 changeField 是选择框对应的实际时间变更字段
    if (historyValue !== currentValue) {
      addOrClearPreviousAdjustFields({ record, addName: changeField });
    }
  }
  if (historyValue !== currentValue) {
    return <span className={`${style.redColor} ${style.compareComponentContent}`}>{children}</span>;
  }
  return children;
});

// 最外层组件渲染对比
// const TimeWrapperDiffRender = observer((props = {}) => {
//   const { children, content } = props || {};
//   if (children) {
//     if (!isNil(content) && content !== '') {
//       return (
//         <Popover content={content}>
//           <div className={style.diffContainer}>
//             <span className={`${style.redColor} ${style.compareComponentContent}`}>{children}</span>
//           </div>
//         </Popover>
//       );
//     }
//     return children;
//   }
//   return null;
// });

// 普通的对比组件
const ComponentDiffRender = observer((props = {}) => {
  const {
    record,
    historyDTO,
    name,
    poverContent = '',
    children,
    showOnlyFlag = false, // 是否只做显示用，不需要操作变更字段adjustFields
    disabled = false,
    // outSideRedFlag=false
  } = props || {};

  // 历史值
  const historyValue = useComputed(() => {
    let _historyValue = record.get(historyDTO) && record.get(historyDTO)[name];
    if (math.isBigNumber(_historyValue) || isNumber(_historyValue)) {
      // 是否是大数，如果是转换陈字符串
      _historyValue = numberSeparatorRender(_historyValue);
    } else {
      _historyValue = isObject(_historyValue) ? _historyValue[name] : _historyValue;
    }
    return _historyValue;
  }, [record, historyDTO, name]);

  // 当前值
  const currentValue = useComputed(() => {
    let _currentValue = record.get(name)?._d
      ? moment(record.get(name)).format(DEFAULT_DATETIME_FORMAT)
      : record.get(name) ?? null;
    if (math.isBigNumber(_currentValue) || isNumber(_currentValue)) {
      // 是否是大数，如果是转换陈字符串
      _currentValue = numberSeparatorRender(_currentValue);
    } else {
      _currentValue = isObject(_currentValue) ? _currentValue[name] : _currentValue;
    }
    return _currentValue;
  }, [record, name]);

  useEffect(() => {
    let adjustFields = [];

    const currentField = record.dataSet?.getField(name);
    const disabledFlag = currentField?.get('disabled');
    const readOnlyFlag = currentField?.get('readOnly');
    if (disabledFlag || readOnlyFlag || showOnlyFlag) {
      return;
    }

    if (record.get('adjustFields')?.length) {
      adjustFields = record.get('adjustFields').toJS();
    }

    // 注意：历史值和当前值，若两者为 【null、undefined、''】也是相等
    const isEqual =
      ((isNil(historyValue) || historyValue === '') &&
        (isNil(currentValue) || currentValue === '')) ||
      historyValue === currentValue;
    if (isEqual) {
      // 历史值和当前值相等
      if (adjustFields?.includes(name)) {
        // 调整字段中有此值，将此字段从调整字段删除
        const index = adjustFields?.indexOf(name);
        adjustFields.splice(index, 1);
      }
      record.set('adjustFields', adjustFields.length ? adjustFields : null);
    } else if (!adjustFields?.includes(name)) {
      // 否则历史值和当前值不等，并且调整字段中没有此字段，将此字段放进调整字段中
      record.set('adjustFields', [...adjustFields, name]);
    }
  }, [record, historyValue, currentValue, name]);

  return (
    <span className={style.diffContainer}>
      {/* {!outSideRedFlag ? ( */}
      {
        historyValue !== currentValue && !disabled ? (
          poverContent || historyValue ? (
            <Popover content={poverContent || historyValue}>
              <span className={`${style.redColor} ${style.compareComponentContent}`}>
                {children}
              </span>
            </Popover>
          ) : (
            <span className={`${style.redColor} ${style.compareComponentContent}`}>{children}</span>
          )
        ) : (
          children
        )
        // ) : (
        //   children
        // )}
      }
    </span>
  );
});

// 报价幅度展示-物品行表格
const QuotationRange = observer((props) => {
  const { record, historyDTO, type = 'unitPrice' } = props || {};
  if (!record) return '';
  // 渲染下拉框
  const renderSelect = () => {
    return (
      <ComponentSelectDiffRender record={record} historyDTO={historyDTO} name="floatType">
        <Select
          clearButton={false}
          record={record}
          name="floatType"
          onChange={(value) => {
            record.set({
              floatType: value || null,
              quotationRange: null,
            });
          }}
        />
      </ComponentSelectDiffRender>
    );
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
          omitZeroFlag
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
      />
    );
  };
  return (
    <React.Fragment>
      <div className={style['quotation-controller-range-wrapper']}>
        <ComponentDiffRender record={record} historyDTO={historyDTO} name="quotationRange">
          {record.get('floatType') === 'ratio' ? (
            <>
              <NumberField
                name="quotationRange"
                record={record}
                addonBefore={renderSelect()}
                addonAfter="%"
              />
            </>
          ) : (
            renderQuotationRang()
          )}
        </ComponentDiffRender>
      </div>
    </React.Fragment>
  );
});

// 下拉框组件比较新老值展示meaning
const ComponentSelectDiffRender = observer((props = {}) => {
  const { record, name, historyDTO, poverContent, children, lovCode } = props || {};

  // 历史值meaning
  const [historyMeaning, setHistoryMeaning] = useState('');
  // 值集数据
  // const [meaningArray, setMeaningArray] = useState('');

  // 历史值
  const historyValue = useComputed(() => {
    let _historyValue = record.get(historyDTO) && record.get(historyDTO)[name];
    _historyValue = isObject(_historyValue) ? _historyValue[name] : _historyValue;
    return _historyValue;
  }, [name, record, historyDTO]);

  // 当前值
  const currentValue = useComputed(() => {
    let _currentValue = record.get(name)?._d
      ? moment(record.get(name)).format(DEFAULT_DATETIME_FORMAT)
      : record.get(name) ?? null;
    _currentValue = isObject(_currentValue) ? _currentValue[name] : _currentValue;
    return _currentValue;
  }, [name, record, historyDTO]);

  // 如果是值集下拉框 则获历史值meaning
  // const getHistoryMeaningValue = useCallback(() => {
  //   if (!historyValue || !meaningArray || isEmpty(meaningArray) || !isArray(meaningArray)) {
  //     return;
  //   }
  //   const targetSelect = meaningArray.filter((item) => item.value === historyValue);
  //   return targetSelect[0]?.meaning;
  // }, [historyValue, meaningArray]);

  useEffect(() => {
    let adjustFields = [];
    const currentField = record.dataSet?.getField(name);

    if (record.get('adjustFields')?.length) {
      adjustFields = record.get('adjustFields').toJS();
    }

    const disabledFlag = currentField?.get('disabled');
    const readOnlyFlag = currentField?.get('readOnly');
    const notDealAdjustFieldsFlag = readOnlyFlag || disabledFlag;
    if (historyValue === currentValue && !notDealAdjustFieldsFlag) {
      if (adjustFields.includes(name)) {
        const index = adjustFields.indexOf(name);
        adjustFields.splice(index, 1);
        record.set('adjustFields', adjustFields.length ? adjustFields : null);
      }
    }
    if (historyValue !== currentValue) {
      if (!adjustFields.includes(name) && !notDealAdjustFieldsFlag) {
        record.set('adjustFields', [...adjustFields, name]);
      }
      if (lovCode) {
        queryIdpValue(lovCode).then((res) => {
          if (getResponse(res)) {
            if (!historyValue || !res || isEmpty(res) || !isArray(res)) {
              return;
            }
            const targetSelect = res.filter((item) => item.value === historyValue);
            setHistoryMeaning(targetSelect[0]?.meaning);
          }
        });
      } else {
        record
          .getField(name)
          .fetchLookup(true, record)
          .then((res) => {
            if (getResponse(res)) {
              if (!historyValue || !res || isEmpty(res) || !isArray(res)) {
                return;
              }
              const targetSelect = res.filter((item) => item.value === historyValue);
              setHistoryMeaning(targetSelect[0]?.meaning);
            }
          });
      }
    }
  }, [historyValue, currentValue, record, name]);

  return (
    <span className={style.diffSelectContainer}>
      {historyValue !== currentValue ? (
        <Popover content={poverContent || historyMeaning}>
          <span className={`${style.redColor} ${style.compareComponentContent}`}>{children}</span>
        </Popover>
      ) : (
        children
      )}
    </span>
  );
});

export {
  StartTimeWrapper,
  EndTimeWrapper,
  ComponentDiffRender,
  QuotationRange,
  ComponentSelectDiffRender,
};
