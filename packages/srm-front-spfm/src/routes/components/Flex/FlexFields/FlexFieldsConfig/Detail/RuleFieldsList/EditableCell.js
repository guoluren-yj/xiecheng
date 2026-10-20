/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Select, InputNumber, DatePicker } from 'hzero-ui';
import { isFunction, isNumber, isEmpty, isNull, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

// FormItem组件初始化
const FormItem = Form.Item;
const { Option } = Select;

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
    ['getFormItem', 'fieldValueRender'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   *
   *
   * @returns
   * @memberof EditableCell
   */
  @Bind()
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
      code = {},
      flexTableColumnsCode,
      defaultListPrimaryKey,
      ...restProps
    } = this.props;
    const WrapperContextConsumer = contextConsumer;
    const defaultCellRender = isFunction(render)
      ? render(record[dataIndex], record)
      : record[dataIndex];
    const defaultFormItems = {
      preSymbol: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(
                  <Select allowClear style={{ width: 120 }}>
                    {(code['HPFM.FLEX.SYMBOL'] || []).map(n => (
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
      operator: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(
                  <Select allowClear style={{ width: 120 }}>
                    {(code['HPFM.FLEX.OPERATOR'] || []).map(n => (
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
      backSymbol: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                })(
                  <Select allowClear style={{ width: 120 }}>
                    {(code['HPFM.FLEX.SYMBOL'] || []).map(n => (
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
      fieldName: () => (
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
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: 150 }} disabled={isNumber(record[defaultListPrimaryKey])}>
                    {(flexTableColumnsCode || []).map(n => (
                      <Option key={n} value={n}>
                        {n}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      fieldType: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = () => {}, setFieldsValue = () => {} } = form || {};
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
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(
                  <Select
                    style={{ width: 120 }}
                    onChange={value =>
                      setFieldsValue({
                        fieldValue: value === record.fieldType ? record.fieldValue : undefined,
                      })
                    }
                  >
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
      fieldValue: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = () => {}, getFieldValue = () => {} } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {this.fieldValueRender({
                  record,
                  title,
                  dataIndex,
                  getFieldDecorator,
                  type: getFieldValue('fieldType') || record[dataIndex],
                  fieldName: getFieldValue('fieldName'),
                  // props: (formSchema[getFieldValue('fieldName')] || {}).specifiedProps || {},
                  // dataSource: (formSchema[getFieldValue('fieldName')] || {}).dataSource || [],
                })}
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

  @Bind()
  fieldValueRender({ dataIndex, record, title, getFieldDecorator = () => {}, type, fieldName }) {
    const { getSourceFormSchema = () => {} } = this.props;
    // const dataSourceComponentTypes = ['LOV', 'SELECT'];
    let sourceformSchema = {};
    if (!isEmpty(type)) {
      sourceformSchema = getSourceFormSchema(fieldName) || {};
    }
    const {
      size,
      typeCase,
      dbc2sbc,
      trim,
      trimAll,
      disabled,
      allowThousandth = false,
      max = Infinity,
      step = 1,
      min = -Infinity,
      precision = null,
      queryParams,
      code,
      textField,
      textValue,
      style,
      placeholder,
      format,
      disabledDate,
      showTime,
      parser,
      children,
      allowClear,
    } = sourceformSchema;
    const inputProps = { size, typeCase, dbc2sbc, trim, trimAll, disabled };
    const inputNumberProps = { disabled, allowThousandth, max, min, precision, step, parser };
    const lovProps = { disabled, queryParams, code, textField, textValue };
    const datePickerProps = {
      disabled,
      style,
      placeholder,
      format,
      disabledDate,
      showTime,
    };
    const selectProps = { children, allowClear, disabled };
    const defaultRender = <Input {...inputProps} />;
    const activeComponents = {
      default: defaultRender,
      LOV: <Lov {...lovProps} />,
      SELECT: <Select style={{ width: 120 }} {...selectProps} />,
      NUMBER: <InputNumber {...inputNumberProps} />,
      DATE: <DatePicker {...datePickerProps} />,
    };

    let active = type;
    if (!type || type === 'INPUT') {
      active = 'default';
    }
    const rules = [
      {
        required: true,
        message: intl.get(`hzero.common.validation.notNull`, { name: title }).d(`${title}不能为空`),
      },
    ];
    if (
      isNull(type) ||
      isUndefined(type) ||
      type === 'INPUT' ||
      type === 'default' ||
      !activeComponents[active]
    ) {
      rules.push({
        max: 240,
        message: intl.get('hzero.common.validation.max', {
          max: 240,
        }),
      });
    }
    return getFieldDecorator(dataIndex, {
      initialValue: record[dataIndex],
      rules,
    })(activeComponents[active] ? activeComponents[active] : defaultRender);
  }

  render() {
    return this.getFormItem();
  }
}
