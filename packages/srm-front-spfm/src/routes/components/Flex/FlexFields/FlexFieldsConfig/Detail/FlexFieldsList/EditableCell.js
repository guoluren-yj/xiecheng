/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, InputNumber, Checkbox, Select, Input } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

// FormItem组件初始化
const FormItem = Form.Item;
const { Option } = Select;

const organizationId = getCurrentOrganizationId();

/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {object} contextProvider - Context.Provider
 * @return React.element
 */
export default class EditableCell extends PureComponent {
  constructor(props) {
    super(props);

    // 方法注册
    ['getFormItem'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   *
   *
   * @param {*} description
   * @param {*} getFieldDecorator
   * @memberof EditableCell
   */
  @Bind()
  onModelFieldIdChange(description, getFieldDecorator) {
    getFieldDecorator('fieldDescription', { initialValue: description });
  }

  /**
   *
   *
   * @returns
   * @memberof EditableCell
   */
  getFormItem() {
    const {
      dataIndex,
      title,
      record,
      contextConsumer,
      children,
      editable,
      status,
      render,
      flexRuleCode,
      code = {},
      onFiledTypeChange = () => {},
      ...restProps
    } = this.props;

    const WrapperContextConsumer = contextConsumer;
    const defaultCellRender = isFunction(render)
      ? render(record[dataIndex], record)
      : record[dataIndex];
    const defaultFormItems = {
      modelFieldId: () => (
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
                })(
                  <Lov
                    queryParams={{ tenantId: organizationId, ruleCode: flexRuleCode }}
                    code="HPFM.FLEX.MODEL_FIELD"
                    textValue={record.fieldName}
                    onChange={(value, selectedData) =>
                      this.onModelFieldIdChange(selectedData.description, getFieldDecorator)
                    }
                  />
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      fieldDescription: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, getFieldValue = () => {} } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex] || getFieldValue('fieldDescription'),
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`hzero.common.validation.notNull`, { name: title })
                        .d(`${title}不能为空`),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      valueSource: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, getFieldValue = () => {} } = form || {};
            const fieldType = getFieldValue('fieldType');
            return fieldType === 'LOV' || fieldType === 'SELECT' ? (
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
                })(<Input />)}
              </FormItem>
            ) : (
              record[dataIndex]
            );
          }}
        </WrapperContextConsumer>
      ),
      orderSeq: () => (
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
                })(<InputNumber min={0} step={1} precision={0} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      fieldColumnNumber: () => (
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
                })(<InputNumber min={0} step={1} precision={0} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      fieldColumnWidth: () => (
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
                })(<InputNumber min={0} step={0.01} precision={2} />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      fieldType: () => (
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
                })(
                  <Select allowClear style={{ width: 120 }} onChange={onFiledTypeChange}>
                    {(code['HPFM.FLEX.FIELD_TYPE'] || []).map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      readableFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  valuePropName: 'checked',
                })(<Checkbox />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      requiredFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  valuePropName: 'checked',
                })(<Checkbox />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      action: () => (
        <WrapperContextConsumer>
          {(form = {}) => render(record[dataIndex], record, form)}
        </WrapperContextConsumer>
      ),
    };

    return (
      <td {...restProps}>
        {dataIndex && defaultFormItems[dataIndex] && contextConsumer
          ? dataIndex === 'action'
            ? defaultFormItems[dataIndex]()
            : editable
            ? defaultFormItems[dataIndex]()
            : defaultCellRender
          : children}
      </td>
    );
  }

  render() {
    return this.getFormItem();
  }
}
