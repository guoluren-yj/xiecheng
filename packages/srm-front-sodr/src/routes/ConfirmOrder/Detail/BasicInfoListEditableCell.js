import React, { PureComponent } from 'react';
import { Form, Input, DatePicker } from 'hzero-ui';
import { isFunction, toSafeInteger } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

// FormItem组件初始化
const FormItem = Form.Item;
// TextArea组件初始化
const { TextArea } = Input;

// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

export default class EditableCell extends PureComponent {
  constructor(props) {
    super(props);
    this.getFormItem = this.getFormItem.bind(this);
  }

  parserSort(value) {
    return toSafeInteger(value);
  }

  /**
   * onFeedbackChange - feedback输入框onChange事件
   * @param {object} event - 事件对象
   */
  onFeedbackChange(event) {
    const { saveRowData = e => e, record } = this.props;
    saveRowData({ ...record, feedback: event.target.value, edited: true });
  }

  /**
   * onPromiseDeliveryDateOpenChange - promiseDeliveryDateOpen日期onChange事件
   * @param {object} event - 事件对象
   */
  onPromiseDeliveryDateOpenChange(value) {
    const { saveRowData = e => e, record } = this.props;
    saveRowData({
      ...record,
      promiseDeliveryDate: moment(value).format(DEFAULT_DATETIME_FORMAT),
      edited: true,
    });
  }

  /**
   * getFormItem - form item组件渲染函数
   */
  getFormItem() {
    const {
      form: { getFieldDecorator = e => e },
      dataIndex,
      record,
      text,
      title,
      promiseDeliveryDateNotNullFlag,
    } = this.props;
    const defaultFormItem = {
      feedback: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            initialValue: record[dataIndex],
          })(
            <TextArea
              onChange={this.onFeedbackChange.bind(this)}
              style={{ resize: 'vertical' }}
              rows={1}
            />
          )}
        </FormItem>
      ),
      promiseDeliveryDate: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(
            dataIndex,
            Object.assign(
              {
                initialValue: record[dataIndex] ? moment(record[dataIndex]) : null,
              },
              promiseDeliveryDateNotNullFlag === 1
                ? {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.notNull`, { name: title })
                          .d(`${title}不能为空`),
                      },
                    ],
                  }
                : {}
            )
          )(
            <DatePicker
              onChange={this.onPromiseDeliveryDateOpenChange.bind(this)}
              placeholder={null}
            />
          )}
        </FormItem>
      ),
    };
    return isFunction(defaultFormItem[dataIndex]) ? defaultFormItem[dataIndex]() : text;
  }

  render() {
    return (
      <div
        ref={node => {
          this.cell = node;
        }}
        className="editable-cell"
      >
        {this.getFormItem()}
      </div>
    );
  }
}
