/**
 * EditableCell - 送货单创建明细页面 - 行内编辑可编辑单元格组件
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Checkbox, Select } from 'hzero-ui';
import { isFunction, isNil } from 'lodash';
import intl from 'utils/intl';

// FormItem组件初始化
const FormItem = Form.Item;
// Option组件初始化
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
    ['getFormItem', 'handleEvalTplType'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * getFormItem 设置formItem子组件
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
      kpiEvalTplTypeCode = [],
      render,
      ...restProps
    } = this.props;
    const WrapperContextConsumer = contextConsumer;
    const defaultFormItems = {
      evalTplCode: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return status === 'add' ? (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`hzero.common.validation.notNull`, { name: title })
                        .d(`${title}`),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input inputChinese={false} />)}
              </FormItem>
            ) : (
              record[dataIndex]
            );
          }}
        </WrapperContextConsumer>
      ),
      evalTplName: () => (
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
                        .d(`${title}`),
                    },
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      evalTplType: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            return status === 'add' ? (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: record[dataIndex],
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`hzero.common.validation.notNull`, { name: title })
                        .d(`${title}`),
                    },
                  ],
                })(
                  <Select
                    allowClear
                    style={{ minWidth: 120 }}
                    onChange={value => this.handleEvalTplType(value, form)}
                  >
                    {kpiEvalTplTypeCode.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ) : (
              record.evalTplTypeMeaning
            );
          }}
        </WrapperContextConsumer> // kpiScoreTypeCode
      ),
      // versionNum: () => (
      //   <WrapperContextConsumer>
      //     {(form = {}) => {
      //       const { getFieldDecorator = e => e } = form || {};
      //       return status === 'add' ? (
      //         <FormItem style={{ margin: 0 }}>
      //           {getFieldDecorator(dataIndex, {
      //             initialValue: record[dataIndex],
      //           })(<Input />)}
      //         </FormItem>
      //       ) : (
      //         record[dataIndex]
      //       );
      //     }}
      //   </WrapperContextConsumer>
      // ),
      enabledFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            const initialValue =
              record[dataIndex] === null || record[dataIndex] === undefined ? 1 : record[dataIndex];
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: initialValue === 1,
                })(<Checkbox />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      weightedFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e } = form || {};
            const initialValue =
              record[dataIndex] === null || record[dataIndex] === undefined ? 1 : record[dataIndex];
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue: initialValue === 1,
                })(<Checkbox />)}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      evalFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, setFieldsValue = e => e, getFieldValue = e => e } =
              form || {};
            const initialValue =
              record[dataIndex] === null || record[dataIndex] === undefined ? 0 : record[dataIndex];
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={e => {
                      if (e.target.value === 1) {
                        setFieldsValue({ abandonFlag: 0, allowAppealFlag: 0 });
                      }
                      // "业务单据评价","是否用于考评档案"改变时，清空"平均式计算"
                      if (
                        ['BDKPI_EVAL'].includes(getFieldValue('evalTplType') || record.evalTplType)
                      ) {
                        setFieldsValue({ averageFlag: 0 });
                      }
                    }}
                  />
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      // 平均式计算
      averageFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, getFieldValue = e => e, setFieldsValue = e => e } =
              form || {};
            const initialValue =
              record[dataIndex] === null || record[dataIndex] === undefined ? 0 : record[dataIndex];
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue,
                })(
                  <Checkbox
                    disabled={
                      !(
                        getFieldValue('evalTplType') === 'GYSKP' ||
                        getFieldValue('evalTplType') === 'GYSKP_AUTO' ||
                        getFieldValue('evalTplType') === 'GYSKP_XC' ||
                        record.evalTplType === 'GYSKP' ||
                        record.evalTplType === 'GYSKP_AUTO' ||
                        record.evalTplType === 'GYSKP_XC' ||
                        (['BDKPI_EVAL'].includes(
                          getFieldValue('evalTplType') || record.evalTplType
                        ) &&
                          getFieldValue('evalFlag'))
                      )
                    }
                    onChange={e => {
                      if (e.target.value === 1) {
                        setFieldsValue({ abandonFlag: 0 });
                      }
                    }}
                    checkedValue={1}
                    unCheckedValue={0}
                  />
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      // 允许放弃
      abandonFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, getFieldValue = e => e } = form || {};
            const initialValue =
              record[dataIndex] === null || record[dataIndex] === undefined ? 0 : record[dataIndex];
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue,
                })(
                  <Checkbox
                    disabled={
                      !(
                        getFieldValue('evalTplType') === 'GYSKP' ||
                        getFieldValue('evalTplType') === 'GYSKP_AUTO' ||
                        getFieldValue('evalTplType') === 'GYSKP_XC' ||
                        record.evalTplType === 'GYSKP' ||
                        record.evalTplType === 'GYSKP_AUTO' ||
                        record.evalTplType === 'GYSKP_XC' ||
                        getFieldValue('evalFlag')
                      ) || !getFieldValue('averageFlag')
                    }
                    checkedValue={1}
                    unCheckedValue={0}
                  />
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
      // _action: () => (
      //   <WrapperContextConsumer>
      //     {() => operationRender(record, this)}
      //   </WrapperContextConsumer>
      // ),
      // 允许供应商申诉
      allowAppealFlag: () => (
        <WrapperContextConsumer>
          {(form = {}) => {
            const { getFieldDecorator = e => e, getFieldValue = e => e } = form || {};
            const initialValue = isNil(record[dataIndex]) ? 0 : record[dataIndex];
            return (
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  initialValue,
                })(
                  <Checkbox
                    disabled={!getFieldValue('evalFlag')}
                    checkedValue={1}
                    unCheckedValue={0}
                  />
                )}
              </FormItem>
            );
          }}
        </WrapperContextConsumer>
      ),
    };

    return (
      <td {...restProps}>
        {dataIndex && defaultFormItems[dataIndex] && contextConsumer
          ? editable
            ? defaultFormItems[dataIndex]()
            : isFunction(render)
            ? render(record[dataIndex], record)
            : record[dataIndex]
          : children}
      </td>
    );
  }

  /**
   * 处理模板类型切换
   */
  handleEvalTplType(value, form) {
    if (value === 'HGGYSZR' || value === 'GYSKP_XC' || value === 'GYSKP_ORDER') {
      form.setFieldsValue({ evalFlag: 0, averageFlag: 0 });
    } else {
      form.setFieldsValue({ evalFlag: 1 });
    }
  }

  render() {
    return this.getFormItem();
  }
}
