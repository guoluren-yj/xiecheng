import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Popover } from 'choerodon-ui';
import { Select, DateTimePicker } from 'choerodon-ui/pro';
import { isObject } from 'lodash';
import moment from 'moment';
import { runInAction } from 'mobx';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { MatchStringEndNumReg } from '@/utils/SsrcRegx';

import style from './index.less';

const { Option } = Select;

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

/**
 * 对于render里面的node的时候的封装渲染
 * @param {*} props { record, historyDTO, name}
 */

@observer
export class ComponentDiffRender extends Component {
  render() {
    const { record, historyDTO, name, poverContent = '' } = this.props;
    if (!record) return null;
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
        // const index = adjustFields.indexOf(name);
        const index = adjustFields.findIndex((i) => i === name);
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
    // const currentIndex = oldFields.indexOf(name);
    const currentIndex = newFields.findIndex((i) => i === name);
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
    // const currentIndex = oldFields.indexOf(name);
    const currentIndex = newFields.findIndex((i) => i === name);
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
    // const currentIndex = oldFields.indexOf(NewName);
    const currentIndex = newFields.findIndex((i) => i === NewName);
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
    // const currentIndex = oldFields.indexOf(NewName);
    const currentIndex = newFields.findIndex((i) => i === NewName);
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
    const { dataSet = {}, name = null, data = {}, dateTimeProps = {} } = this.props;
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
        defaultTime={undefined}
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
