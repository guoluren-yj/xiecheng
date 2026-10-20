/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, InputNumber, Checkbox } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

// FormItem组件初始化
const FormItem = Form.Item;
// const { Option } = Select;

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
  onModelFieldIdChange(result = {}, setFieldsValue = () => {}, getFieldDecorator = () => {}) {
    const { code = {} } = this.props;
    const { description, valueSource, fieldTypeMeaning, fieldType } = result;
    getFieldDecorator('valueSource');
    getFieldDecorator('fieldTypeMeaning');
    getFieldDecorator('fieldType');
    getFieldDecorator('fieldDescription');
    setFieldsValue({
      fieldDescription: description,
      valueSource,
      fieldTypeMeaning:
        fieldTypeMeaning ||
        (code['HPFM.FLEX.FIELD_TYPE'].find(o => o.value === 'INPUT') || {}).meaning,
      fieldType: fieldType || 'INPUT',
    });
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
      // code = {},
      // onFiledTypeChange = () => {},
      ...restProps
    } = this.props;
    const { _token } = record;
    const WrapperContextConsumer = contextConsumer;
    const defaultCellRender = isFunction(render)
      ? render(record[dataIndex], record)
      : record[dataIndex];
    const defaultFormItems = {
      modelFieldId: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, setFieldsValue = () => {} } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, { name: title }),
                    },
                  ],
                })(
                  <Lov
                    disabled={record[dataIndex]}
                    queryParams={{ tenantId: organizationId, ruleCode: flexRuleCode }}
                    code="HPFM.FLEX.ATT_FIELD"
                    textValue={record.fieldName}
                    onChange={(value, selectedData) =>
                      this.onModelFieldIdChange(selectedData, setFieldsValue, getFieldDecorator)
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
            const { getFieldDecorator = e => e } = form || {};
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, { name: title }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get('hpfm.flexModel.model.flexModel.fieldDescription')
                      .d('字段描述')}
                    field="fieldDescription"
                    token={_token}
                  />
                )}
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
            getFieldDecorator(dataIndex, {
              initialValue: record[dataIndex],
            });

            return fieldType === record.fieldType
              ? record[dataIndex]
              : getFieldValue('valueSource');
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
                      message: intl.get(`hzero.common.validation.notNull`, { name: title }),
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
                      message: intl.get(`hzero.common.validation.notNull`, { name: title }),
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
                  initialValue: record[dataIndex] || 120,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, { name: title }),
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
            const { getFieldDecorator = () => {}, getFieldValue = () => {} } = form || {};
            getFieldDecorator(dataIndex, {
              initialValue: record[dataIndex],
            });
            getFieldDecorator('fieldTypeMeaning');
            return getFieldValue('fieldTypeMeaning') || record.fieldTypeMeaning;
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
          ? ['action', 'fieldType', 'valueSource'].indexOf(dataIndex) > -1
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
