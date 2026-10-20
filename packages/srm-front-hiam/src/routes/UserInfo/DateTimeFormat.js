/**
 * DateTimeFormat.js
 * @date 2018/11/27
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Select } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { getLocaleDate } from 'utils/utils';

import EditableListItem from './components/EditableListItem';
import styles from './index.less';

const itemContentStyle = { width: 240, position: 'relative', top: '1px' };
const btnStyle = { marginLeft: 8 };

/**
 * 如果curValue为 undefined 则使用 defaultValue 否则使用 curValue
 * @param {*} curValue
 * @param {*} defaultValue
 */
function undefinedCon(curValue, defaultValue) {
  return isUndefined(curValue) ? defaultValue : curValue;
}

@Form.create({ fieldNameProp: null })
export default class DateTimeFormat extends React.Component {
  state = {
    dateFormatProps: { editing: false },
    timeFormatProps: { editing: false },
    currentMoment: moment(getLocaleDate()).locale('en'),
  };

  render() {
    return (
      <>
        {this.renderDateFormat()}
        {this.renderTimeFormat()}
      </>
    );
  }

  componentDidMount() {
    this.timer = setInterval(this.updateDate, 500);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  @Bind()
  renderDateFormat() {
    const { userInfo = {}, dateMap = {}, form, updateDateFormatLoading } = this.props;
    const {
      dateFormatProps: { editing = false },
      currentMoment,
    } = this.state;
    const date = moment(currentMoment)
      .locale('en')
      .format(undefinedCon(userInfo.dateFormat, DEFAULT_DATE_FORMAT));
    let content = [];
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('dateFormat', {
            initialValue: undefinedCon(userInfo.dateFormat, DEFAULT_DATE_FORMAT),
          })(
            <Select style={itemContentStyle}>
              {Object.values(dateMap).map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {currentMoment.format(v.value)}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            color="primary"
            loading={updateDateFormatLoading}
            style={btnStyle}
            onClick={this.handleDateFormatUpdate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleDateFormatEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleDateFormatEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="dateFormat"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.date').d('日期格式')}
            {date && <span className={styles['default-tag']}>{date}</span>}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.date')
          .d('日期首选项，选择不同的日期格式')}
        content={content}
      />
    );
  }

  @Bind()
  renderTimeFormat() {
    const { userInfo = {}, timeMap = {}, form, updateTimeFormatLoading } = this.props;
    const {
      timeFormatProps: { editing = false },
      currentMoment,
    } = this.state;
    const time = moment(currentMoment).format(
      undefinedCon(userInfo.timeFormat, DEFAULT_TIME_FORMAT)
    );
    let content;
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('timeFormat', {
            initialValue: undefinedCon(userInfo.timeFormat, DEFAULT_TIME_FORMAT),
          })(
            <Select style={itemContentStyle}>
              {Object.values(timeMap).map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {currentMoment.format(v.value)}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            color="primary"
            style={btnStyle}
            loading={updateTimeFormatLoading}
            onClick={this.handleTimeFormatUpdate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleTimeFormatEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleTimeFormatEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="timeFormat"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.time').d('时间格式')}
            {time && <span className={styles['default-tag']}>{time}</span>}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.time')
          .d('时间首选项，选择不同的时间格式')}
        content={content}
      />
    );
  }

  @Bind()
  updateDate() {
    this.setState({
      currentMoment: moment(getLocaleDate()).locale('en'),
    });
  }

  // date-format
  @Bind()
  handleDateFormatEdit() {
    this.setState({
      dateFormatProps: { editing: true },
    });
  }

  @Bind()
  handleDateFormatEditCancel() {
    this.setState({
      dateFormatProps: { editing: false },
    });
  }

  @Bind()
  handleDateFormatUpdate() {
    const { form } = this.props;
    form.validateFields(['dateFormat'], (err, data) => {
      if (!err) {
        const { onDateFormatUpdate } = this.props;
        onDateFormatUpdate(data.dateFormat).then((res) => {
          if (res) {
            this.handleDateFormatEditCancel();
          }
        });
      }
    });
  }

  // time-format
  @Bind()
  handleTimeFormatEdit() {
    this.setState({
      timeFormatProps: { editing: true },
    });
  }

  @Bind()
  handleTimeFormatEditCancel() {
    this.setState({
      timeFormatProps: { editing: false },
    });
  }

  @Bind()
  handleTimeFormatUpdate() {
    const { form } = this.props;
    form.validateFields(['timeFormat'], (err, data) => {
      if (!err) {
        const { onTimeFormatUpdate } = this.props;
        onTimeFormatUpdate(data.timeFormat).then((res) => {
          if (res) {
            this.handleTimeFormatEditCancel();
          }
        });
      }
    });
  }
}
