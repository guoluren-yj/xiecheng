import React, { Component } from 'react';
import { Popover, Badge } from 'choerodon-ui';
import { NumberField, Select, DateTimePicker } from 'choerodon-ui/pro';
import { isObject, isEmpty, isArray } from 'lodash';
import moment from 'moment';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getResponse } from 'utils/utils';
import { C7NCPopover } from '@/routes/components/CPopover';
import { MatchStringEndNumReg } from '@/utils/SsrcRegx';

import style from './index.less';

const { Option } = Select;

/**
 * 对于render里面的node的时候的封装渲染
 * @param {*} props { record, historyDTO, name}
 */

@observer
export class ComponentDiffRender extends Component {
  render() {
    const { record, historyDTO, name, poverContent = '' } = this.props;
    let historyValue = record.get(historyDTO) && record.get(historyDTO)[name];
    let currentValue = record.get(name)?._d
      ? moment(record.get(name)).format(DEFAULT_DATETIME_FORMAT)
      : record.get(name) ?? null;
    let adjustFields = [];
    if (record.get('adjustFields')?.length) {
      adjustFields = record.get('adjustFields').toJS();
    }
    historyValue = isObject(historyValue) ? historyValue[name] : historyValue;
    currentValue = isObject(currentValue) ? currentValue[name] : currentValue;

    if (historyValue === currentValue) {
      if (adjustFields.includes(name)) {
        const index = adjustFields.indexOf(name);
        adjustFields.splice(index, 1);
        record.set('adjustFields', adjustFields.length ? adjustFields : null);
      }
    }
    if (historyValue !== currentValue) {
      if (!adjustFields.includes(name)) {
        record.set('adjustFields', [...adjustFields, name]);
      }
    }
    return (
      <div className={style.diffContainer}>
        {historyValue !== currentValue ? (
          poverContent || historyValue ? (
            <div className={style.redColor}>
              <Popover content={poverContent || historyValue}>
                <div>{this.props.children}</div>
              </Popover>
            </div>
          ) : (
            <div className={style.redColor}>{this.props.children}</div>
          )
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}

@observer
export class AttachmentComponentDiffRender extends Component {
  render() {
    const { record, name } = this.props;
    const adjustFields = record?.get('adjustFields');
    return (
      <div className={style.diffContainer}>
        {adjustFields?.includes(name) ? (
          <div className={style.redColor}>{this.props.children}</div>
        ) : (
          <div>{this.props.children}</div>
        )}
      </div>
    );
  }
}

@observer
export class ComponentDiffLovRender extends Component {
  render() {
    const { record, historyDTO, lovName, textName, bindId, poverContent = '' } = this.props;
    let recordC;
    if (record.current) {
      recordC = record.current;
    }
    let historyValue = recordC.get(historyDTO) && recordC.get(historyDTO)[lovName];
    let historyId = recordC.get(historyDTO) && recordC.get(historyDTO)?.[lovName]?.[bindId];
    let currentValue = recordC.get(lovName)?._d
      ? moment(recordC.get(lovName)).format(DEFAULT_DATETIME_FORMAT)
      : recordC.get(lovName) || null;
    let currentId = recordC.get(bindId);

    const historyFlag = historyValue instanceof Array && typeof historyValue.length === 'number';
    const currentFlag = currentValue instanceof Array && typeof currentValue.length === 'number';

    historyValue = historyFlag ? Array.from(historyValue) : historyValue;
    currentValue = currentFlag ? Array.from(currentValue) : currentValue;

    let historyStr = '';
    if (historyFlag && currentFlag) {
      if (historyValue.length !== currentValue.length) {
        historyId = '';
        currentId = 'id';
        historyValue.forEach((item) => {
          historyStr += (historyStr === '' ? `${item?.[textName]}` : `，${item?.[textName]}`) || '';
        });
      } else {
        const flag = [];
        historyValue.forEach((hisItem) => {
          const result = currentValue.some((curItem) => {
            const curId = curItem ? curItem?.[bindId] : curItem[bindId];
            return hisItem?.[bindId] === curId;
          });
          if (result) flag.push(result);
          historyStr +=
            (historyStr === '' ? `${hisItem?.[textName]}` : `，${hisItem?.[textName]}`) || '';
        });
        if (flag.length === historyValue.length) {
          historyId = '';
          currentId = '';
        } else {
          historyId = '';
          currentId = 'id';
        }
      }
    } else if (!historyFlag && currentFlag && currentValue.length) {
      historyId = '';
      currentId = 'id';
    } else if (!currentFlag && historyFlag && historyValue.length) {
      historyValue = Array.from(historyValue);

      historyValue.forEach((item) => {
        historyStr += historyStr === '' ? `${item?.[textName]}` : `，${item?.[textName]}`;
      });
    } else {
      if (isObject(historyValue)) {
        historyId = historyValue?.[bindId];
        historyValue = historyValue?.[textName];
      }
      if (isObject(currentValue)) {
        currentId = currentValue?.[bindId];
        currentValue = currentValue?.[textName];
      }
    }

    let adjustFields = [];
    if (recordC.get('adjustFields')?.length) {
      adjustFields = recordC.get('adjustFields').toJS();
    }

    if (historyId === currentId) {
      if (adjustFields.includes(lovName)) {
        const index = adjustFields.indexOf(lovName);
        adjustFields.splice(index, 1);
        recordC.set('adjustFields', adjustFields.length ? adjustFields : null);
      }
    }
    if (historyId !== currentId) {
      if (!adjustFields.includes(lovName)) {
        recordC.set('adjustFields', [...adjustFields, lovName]);
      }
    }

    historyStr =
      historyStr || (isObject(historyValue) || isArray(historyValue) ? '' : historyValue);
    return (
      <div className={style.diffLovContainer}>
        {historyId !== currentId ? (
          <div className={style.redColor}>
            <Popover content={poverContent || historyStr}>
              <div className={style.componentDiffRender}>{this.props.children}</div>
            </Popover>
          </div>
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}

@observer
export class ComponentDiffRoundTime extends Component {
  // 转换报价运行时间
  transTime(value = null) {
    let day = null;
    let hour = null;
    let minute = null;

    if (value) {
      day = Math.floor(value / 1440);
      hour =
        day > 0 ? Math.floor((value - day * 1440) / 60) : value ? Math.floor(value / 60) : value;
      minute = hour > 0 || day > 0 ? value - day * 1440 - hour * 60 : value;
    }

    return {
      day,
      hour,
      minute,
    };
  }

  render() {
    const { record, historyDTO, name, changeBiddingRunningTime = () => {}, ...others } = this.props;
    const historyValue = record.get(historyDTO) && record.get(historyDTO)[name];
    const currentValue = record.get(name);
    let adjustFields = [];
    if (record.get('adjustFields')?.length) {
      adjustFields = record.get('adjustFields').toJS();
    }
    if (historyValue === currentValue) {
      if (adjustFields.includes(name)) {
        const index = adjustFields.indexOf(name);
        adjustFields.splice(index, 1);
        record.set('adjustFields', adjustFields.length ? adjustFields : null);
      }
    }
    if (historyValue !== currentValue) {
      if (!adjustFields.includes(name)) {
        record.set('adjustFields', [...adjustFields, name]);
      }
    }
    const historyObj = this.transTime(historyValue);
    const currentObj = this.transTime(currentValue);

    return (
      <div className={style.quotationRuningTime}>
        {historyObj.day !== currentObj.day ? (
          <Popover content={historyObj.day}>
            <NumberField
              {...others}
              name="biddingRunnintDay"
              placeholder={intl
                .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
                .d('运行时间(天)')}
              style={{ width: '33%' }}
              className="diffRender"
              onChange={(value) => changeBiddingRunningTime(value, 'day')}
            />
          </Popover>
        ) : (
          <NumberField
            {...others}
            name="biddingRunnintDay"
            placeholder={intl
              .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
              .d('运行时间(天)')}
            style={{ width: '33%' }}
            onChange={(value) => changeBiddingRunningTime(value, 'day')}
          />
        )}

        {historyObj.hour !== currentObj.hour ? (
          <Popover content={historyObj.hour}>
            <NumberField
              {...others}
              name="biddingRunnintHour"
              style={{ width: '33%' }}
              label={null}
              className="diffRender"
              placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
              onChange={(value) => changeBiddingRunningTime(value, 'hour')}
            />
          </Popover>
        ) : (
          <NumberField
            {...others}
            name="biddingRunnintHour"
            style={{ width: '33%' }}
            label={null}
            placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
            onChange={(value) => changeBiddingRunningTime(value, 'hour')}
          />
        )}

        {historyObj.minute !== currentObj.minute ? (
          <Popover content={historyObj.minute}>
            <NumberField
              {...others}
              name="biddingRunnintMinute"
              style={{ width: '33%' }}
              label={null}
              className="diffRender"
              placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
              onChange={(value) => changeBiddingRunningTime(value, 'minute')}
            />
          </Popover>
        ) : (
          <NumberField
            {...others}
            name="biddingRunnintMinute"
            style={{ width: '33%' }}
            label={null}
            placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
            onChange={(value) => changeBiddingRunningTime(value, 'minute')}
          />
        )}
      </div>
    );
  }
}

/**
 * 历史数据渲染-纯函数
 * @param {*} param0 {dataset, record, value}
 * @param {*} historyDTO 原始数据的DTO名称
 * @param {*} name 当前字段
 * @returns VNode || value
 */
export function historyRenderPure({ dataSet, record }, historyDTO = {}, name = null, options = {}) {
  let historyValueText = null;
  let componentCurrent = null;

  if (isEmpty(record) || !dataSet || !name) {
    return undefined;
  }

  const historyValue = record?.get(historyDTO) ? record?.get(historyDTO)[name] : null;
  let currentValue = record.get(name);
  currentValue = isObject(currentValue) ? currentValue[name] : currentValue;
  const { optionsFilter = null, readOnly = false, styles = null } = options;
  const newStyles = styles;

  const currentField = dataSet.getField(name);
  const lookupCode = currentField?.get('lookupCode');

  if (lookupCode) {
    historyValueText = currentField?.getText(historyValue);
    componentCurrent = !readOnly ? (
      <Select
        record={record}
        name={name}
        optionsFilter={optionsFilter}
        onMouseEnter={(e) => e.stopPropagation()}
        highlightRenderer={({ text }) => <span style={newStyles}>{text}</span>}
      />
    ) : null;
  }
  // //  评分要素占比在新增行时不处理
  // const flag =
  //   (['businessWeight', 'technologyWeight'].includes(name) && record.status !== 'add') ||
  //   !['businessWeight', 'technologyWeight'].includes(name);
  // eslint-disable-next-line eqeqeq
  if (historyValue != currentValue) {
    return (
      <div className={style['history-controller-field-red']} style={newStyles}>
        <C7NCPopover content={historyValueText ?? historyValue}>
          {componentCurrent ?? currentValue ?? null}
        </C7NCPopover>
      </div>
    );
  }

  return componentCurrent ?? currentValue ?? null;
}

/**
 * 历史数据渲染-纯函数
 * @param {*} param0 {dataset, record, value}
 * @param {*} historyDTO 原始数据的DTO名称
 * @param {*} name 当前字段
 * @returns VNode || value
 */
export function HistoryRenderPureHzero(props = {}) {
  const {
    // value,
    record = {},
    name = null,
    historyDTO = null,
    readOnly = false,
    children,
  } = props;
  const {
    $form: { getFieldValue = () => {} },
  } = record;
  const { _status = null } = record;

  let historyValue = null;
  let currentValue = null;

  if (!readOnly) {
    historyValue = getFieldValue(historyDTO) ?? null;
    currentValue = getFieldValue(name) ?? null;
  } else {
    historyValue = record[historyDTO] || null;
    currentValue = record[name];
  }

  currentValue = isObject(currentValue) ? currentValue[name] : currentValue;
  const componentCurrent = children;

  // eslint-disable-next-line eqeqeq
  if (_status !== 'create' && historyValue !== null && historyValue != currentValue) {
    return (
      <div className={style['history-controller-field-red']} style={{ color: '#f56349' }}>
        <C7NCPopover content={historyValue}>
          {componentCurrent ?? currentValue ?? historyValue}
        </C7NCPopover>
      </div>
    );
  }

  return componentCurrent ?? currentValue ?? historyValue;
}

// 明细页面-信息对比表示
export function renderCompareSymbol(props = {}, currentMode = null) {
  if (!props || !props.record) {
    return null;
  }

  const { record = {}, name = null } = props || {};
  const showDiff = !currentMode || currentMode === 'current' || currentMode === 'history';

  const addFlag = record?.get('addFlag');
  const updateFlag = record?.get('updateFlag');
  const deleteFlag = record?.get('deleteFlag');
  const showValue = record?.get(name);

  const renderLineSymbol = (flag = false, content = null) => {
    const visibleFlag = showDiff && flag;
    if (!visibleFlag) {
      return null;
    }

    return (
      <C7NCPopover content={content} placement="bottom">
        <span>
          {currentMode === 'history' ? <Badge status="error" /> : <Badge status="success" />}
        </span>
      </C7NCPopover>
    );
  };

  return (
    <div>
      {renderLineSymbol(
        addFlag,
        intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')
      )}
      {renderLineSymbol(
        updateFlag,
        intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')
      )}
      {renderLineSymbol(
        deleteFlag,
        intl.get('ssrc.inquiryHall.view.table.deletedLineSymbol').d('删除行')
      )}

      {showValue}
    </div>
  );
}

// 时间组件-包裹
@observer
export class TimeSelectionWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dateVisible: false,
    };
  }

  componentDidMount() {
    const WrapperValue = this.getWrapperFieldValue();
    if (WrapperValue === 'custom') {
      this.dateMouseEnter();
    }
  }

  toggleDateVisible = (visible = false) => {
    this.setState({ dateVisible: visible });
  };

  dateMouseEnter = () => {
    this.clearLableWhileValueEmpty();

    this.toggleDateVisible(true);
  };

  // 当值不存在清空label
  clearLableWhileValueEmpty = () => {
    const { name = null, dataSet = {} } = this.props;
    const record = dataSet.current;
    const currentValue = record.get(name);

    if (!currentValue) {
      this.removeLableForWrapper();
    }
  };

  removeLableForWrapper = () => {
    const { dataSet = {} } = this.props;

    const wrapperName = this.getWrapperFieldName();
    dataSet.getField(wrapperName).set('label', null);
  };

  // 容器下拉框增加label
  addLabelForWrapper = () => {
    const { dataSet = {}, data = {} } = this.props;
    const { label = null } = data;

    const wrapperName = this.getWrapperFieldName();
    dataSet.getField(wrapperName).set('label', label);
  };

  dateTimeLeave = () => {
    this.addLabelForWrapper();
    // this.toggleDateVisible();
  };

  dataTimeBlur = () => {
    this.removeLableForWrapper();
  };

  // 发布即开始 - add filed
  nowAdjustedFieldAdd = (name = null, record = {}) => {
    const oldFields = record.get('nowAdjustedField') || '';
    let newFields = oldFields.split(',').filter(Boolean);

    const currentIndex = oldFields.indexOf(name);
    if (currentIndex === -1) {
      newFields.push(name);
    }

    newFields = newFields.join(',');
    record.set('nowAdjustedField', newFields);
  };

  // 发布即开始 - remove filed
  nowAdjustedFieldRemove = (name = null, record = {}) => {
    const oldFields = record.get('nowAdjustedField') || '';
    let newFields = oldFields.split(',').filter(Boolean);

    const currentIndex = oldFields.indexOf(name);
    if (currentIndex > -1) {
      newFields.splice(currentIndex, 1);
    }

    newFields = newFields.join(',');
    record.set('nowAdjustedField', newFields);
  };

  roundQuotationowAdjustedFieldAdd = (name = null, record = {}) => {
    const { quotationRound = null } = this.props;
    const nowAdjustedField = `nowAdjustedField${quotationRound}`;
    const oldFields = record.get(nowAdjustedField) || '';
    let newFields = oldFields.split(',').filter(Boolean);

    const NewName = name.replace(MatchStringEndNumReg, '$1Date');
    const currentIndex = oldFields.indexOf(NewName);
    if (currentIndex === -1) {
      newFields.push(NewName);
    }

    newFields = newFields.join(',');
    record.set(nowAdjustedField, newFields);
  };

  roundQuotationowAdjustedFieldRemove = (name = null, record = {}) => {
    const { quotationRound = null } = this.props;
    const nowAdjustedField = `nowAdjustedField${quotationRound}`;
    const oldFields = record.get(nowAdjustedField) || '';
    let newFields = oldFields.split(',').filter(Boolean);

    const NewName = name.replace(MatchStringEndNumReg, '$1Date');
    const currentIndex = oldFields.indexOf(NewName);
    if (currentIndex > -1) {
      newFields.splice(currentIndex, 1);
    }

    newFields = newFields.join(',');
    record.set(nowAdjustedField, newFields);
  };

  // selection handle change
  handleChange = (value = null) => {
    const { dataSet = {}, name = null, quotationRound = 0 } = this.props;
    const record = dataSet.current;
    const currentValue = record.get(name);
    // const CurrentTime = `${name}CurrentTime`;

    runInAction(() => {
      if (!value) {
        // record.set(CurrentTime, 0);
        record.set(name, null);
        return;
      }

      if (value === 'start') {
        // record.set(CurrentTime, 1);
        record.set(name, value);
        this.setState({ dateVisible: false });
        this.addLabelForWrapper();
        if (quotationRound) {
          this.roundQuotationowAdjustedFieldAdd(name, record);
        } else {
          this.nowAdjustedFieldAdd(name, record);
        }
      }

      if (value === 'custom') {
        // record.set(CurrentTime, 0);
        record.set(name, null);
        this.setState({ dateVisible: true });
        this.removeLableForWrapper();
        if (quotationRound) {
          this.roundQuotationowAdjustedFieldRemove(name, record);
        } else {
          this.nowAdjustedFieldRemove(name, record);
        }

        if (!currentValue) {
          this.removeLableForWrapper();
        }
      }
    });
  };

  // date component fouse
  dateTimeFouse = () => {
    this.clearLableWhileValueEmpty();
  };

  // 渲染时间选择器
  renderDataTime = () => {
    const { dataSet = {}, name = null, data = {}, dateTimeProps = {}, remote } = this.props;
    const { styles = {} } = dateTimeProps || {};
    const { dateVisible = false } = this.state;
    const WrapperValue = this.getWrapperFieldValue();
    const { format = null, label } = data;

    if (WrapperValue !== 'custom' || !dateVisible) {
      return null;
    }

    return (
      <DateTimePicker
        record={dataSet?.current}
        name={name}
        label={label}
        clearButton={false}
        trigger="click"
        format={format}
        onBlur={this.dataTimeBlur}
        onFocus={this.dateTimeFouse}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: '1000',
          width: '82%',
          ...(styles || {}),
        }}
        defaultTime={
          remote
            ? remote.process(
                'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_QUOTATION_START_END_DEF_TIME',
                undefined,
                { name }
              )
            : undefined
        }
      />
    );
  };

  // 获取包裹的select name
  getWrapperFieldName = () => {
    const { name = null } = this.props;
    const WrapperName = `${name}Wrapper`;
    return WrapperName;
  };

  // 获取包裹的select value
  getWrapperFieldValue = () => {
    const { dataSet = {} } = this.props;
    const record = dataSet.current;
    const wrapperName = this.getWrapperFieldName();

    return record?.get(wrapperName);
  };

  // selection dynamic text when value is custom
  renderSelectionTextCustom = (value = null) => {
    const { dateVisible = false } = this.state;
    const WrapperValue = this.getWrapperFieldValue();

    return value && WrapperValue === 'custom' && !dateVisible
      ? moment(value).format(DEFAULT_DATETIME_FORMAT)
      : intl.get('ssrc.quoController.view.selectCustomDateTime').d('自定义时间');
  };

  renderStartText = (name = null) => {
    const StartReg = /Start/;
    const StartFlag = name && StartReg.test(name);
    return StartFlag
      ? intl.get('ssrc.quoController.view.selectStartByPublish').d('发布即开始')
      : intl.get('ssrc.quoController.view.selectEndByPublish').d('发布即截止');
  };

  render() {
    const { dataSet = {}, data = {}, name = null, selectProps = {} } = this.props;
    const { defaultValue = null } = data;
    const record = dataSet.current;

    return (
      <div style={{ position: 'relative' }}>
        <Select
          record={record}
          name={`${name}Wrapper`}
          placeholder={defaultValue}
          onChange={this.handleChange}
          onFocus={this.dateMouseEnter}
          style={{ width: '100%' }}
          clearButton={false}
          trigger="click"
          {...(selectProps || {})}
        >
          <Option value="custom">{this.renderSelectionTextCustom(record?.get(name))}</Option>
          <Option value="start">{this.renderStartText(name)}</Option>
        </Select>
        {this.renderDataTime()}
      </div>
    );
  }
}

// 下拉框组件比较新老值展示meaning
@observer
export class ComponentSelectDiffRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      meaningArray: '',
    };
  }

  componentDidMount() {
    const { record, name } = this.props;
    record
      .getField(name)
      .fetchLookup(true, record)
      .then((res) => {
        if (getResponse(res)) {
          this.setState({ meaningArray: res });
        }
      });
  }

  getHistoryMeaningValue(historyValue) {
    const { meaningArray } = this.state;
    if (!historyValue || !meaningArray) {
      return;
    }
    const targetSelect = meaningArray.filter((item) => item.value === historyValue);
    return targetSelect[0]?.meaning;
  }

  render() {
    const { record, historyDTO, name, poverContent = '' } = this.props;
    let historyValue = record.get(historyDTO) && record.get(historyDTO)[name];
    let currentValue = record.get(name)?._d
      ? moment(record.get(name)).format(DEFAULT_DATETIME_FORMAT)
      : record.get(name) ?? null;
    let adjustFields = [];
    if (record.get('adjustFields')?.length) {
      adjustFields = record.get('adjustFields').toJS();
    }
    historyValue = isObject(historyValue) ? historyValue[name] : historyValue;
    currentValue = isObject(currentValue) ? currentValue[name] : currentValue;

    if (historyValue === currentValue) {
      if (adjustFields.includes(name)) {
        const index = adjustFields.indexOf(name);
        adjustFields.splice(index, 1);
        record.set('adjustFields', adjustFields.length ? adjustFields : null);
      }
    }
    if (historyValue !== currentValue) {
      if (!adjustFields.includes(name)) {
        record.set('adjustFields', [...adjustFields, name]);
      }
    }
    const historyMeaningValue = this.getHistoryMeaningValue(historyValue);
    return (
      <div className={style.diffContainer}>
        {historyValue !== currentValue ? (
          <div className={style.redColor}>
            <Popover content={poverContent || historyMeaningValue}>{this.props.children}</Popover>
          </div>
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}
