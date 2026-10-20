/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, InputNumber, DatePicker } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';

// FormItem组件初始化
const FormItem = Form.Item;
// TextArea组件初始化
const { TextArea } = Input;

/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {object} contextProvider - Context.Provider
 * @return React.element
 */
export default class EditableCell extends Component {
  constructor(props) {
    super(props);

    // 方法注册
    ['getFormItem'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * getFormItem 设置formItem子组件
   */
  getFormItem() {
    const { dataIndex, title, record, contextConsumer, children, ...restProps } = this.props;
    const WrapperContextConsumer = contextConsumer;
    const defaultFormItems = {
      supplierRemark: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<TextArea style={{ resize: 'horizontal' }} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      shipQuantity: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`hzero.common.validation.notNull`, { name: title })
                        .d(`${title}不能为空`),
                    },
                  ],
                })(<InputNumber min={0} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      unitPackageQuantity: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<InputNumber min={0} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      packageQuantity: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<InputNumber min={0} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      remainderQuantity: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<InputNumber min={0} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      lotNum: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<Input inputChinese={false} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      productionDate: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex] ? moment(record[dataIndex]) : undefined,
                })(<DatePicker placeholder={null} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      shelfLife: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<Input />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      lotExpirationDate: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex] ? moment(record[dataIndex]) : undefined,
                })(<DatePicker placeholder={null} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      serialNum: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<Input inputChinese={false} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      invoiceNum: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(<Input inputChinese={false} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
    };
    return (
      <td {...restProps}>
        {dataIndex && defaultFormItems[dataIndex] && contextConsumer
          ? defaultFormItems[dataIndex]()
          : children}
      </td>
    );
  }

  render() {
    return this.getFormItem();
  }
}
