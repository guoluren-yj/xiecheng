/**
 * BasicInfoListEditableCell - 订单发布明细页面 - 基本信息可编辑单元格组件
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import { isFunction, toSafeInteger } from 'lodash';

// FormItem组件初始化
const FormItem = Form.Item;
// TextArea组件初始化
const { TextArea } = Input;

export default class EditableCell extends PureComponent {
  constructor(props) {
    super(props);
    this.getFormItem = this.getFormItem.bind(this);
  }

  parserSort(value) {
    return toSafeInteger(value);
  }

  /**
   * onRemarkChange - remark输入框onChange事件
   * @param {object} event - 事件对象
   */
  onRemarkChange(event) {
    const { saveRowData = e => e, record } = this.props;
    saveRowData({ ...record, remark: event.target.value, editedRow: true });
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
    } = this.props;
    const defaultFormItem = {
      remark: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            initialValue: record[dataIndex],
          })(
            <TextArea
              onChange={this.onRemarkChange.bind(this)}
              style={{ resize: 'vertical' }}
              rows={1}
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
