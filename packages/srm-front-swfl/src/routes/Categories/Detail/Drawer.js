import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'hzero-ui';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Switch from 'components/Switch';
import { isTenantRoleLevel } from 'utils/utils';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 跳转条件-数据修改滑窗(抽屉)
 * @extends {Component} - React.Component
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onHandleOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends Component {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onHandleOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onHandleOk: (e) => e,
    onCancel: (e) => e,
  };
  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.itemData.leftType !== this.props.itemData.leftType ||
      nextProps.itemData.rightType !== this.props.itemData.rightType
    ) {
      this.searchLeftOperand(nextProps.itemData.leftType);
      this.searchRightOperand(nextProps.itemData.rightType);
    }
  }

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { form, onHandleOk, itemData } = this.props;
    if (onHandleOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          onHandleOk({
            ...itemData,
            ...values,
          });
        }
      });
    }
  }

  /**
   * 左操作数类型变更
   */
  @Bind()
  handleChangeLeftType(value) {
    this.searchLeftOperand(value);
    this.props.form.setFieldsValue({ leftOperand: undefined });
    this.props.form.setFieldsValue({ leftOperandText: undefined });
  }

  /**
   * 右操作数类型变更
   */
  @Bind()
  handleChangeRightType(value) {
    this.searchRightOperand(value);
    this.props.form.setFieldsValue({ rightOperand: undefined });
    this.props.form.setFieldsValue({ rightOperandText: undefined });
  }

  @Bind()
  selectRight(value, options) {
    this.props.form.setFieldsValue({ rightOperandText: options.props.children });
  }

  /**
   * 条件编码唯一性校验
   * @param {!object} categories - 规则
   * @param {!string} value - 表单值
   * @param {!Function} callback
   */
  @Bind()
  checkUnique(categories, value, callback) {
    const { ruleList, itemData } = this.props;
    if (isUndefined(itemData.code)) {
      // 非编辑时，校验规则编码是否重复
      const target = ruleList.find((item) => item.code === +value);
      if (target) {
        callback(
          intl.get('hwfp.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      visible,
      title,
      itemData,
      onCancel,
      form,
      headerTenantId,
      tenantId,
      loading = false,
      enumMap = {},
      canUpdateCode,
    } = this.props;
    const { variableTypes = [], componentTypes = [] } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;
    const lovCodeFlag = getFieldValue('componentType') === 'SINGLE_LOV';
    const isSiteFlag = !isTenantRoleLevel();
    return (
      <Modal
        title={title}
        width={520}
        zIndex={800}
        okButtonProps={{ loading }}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleOk}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get('hwfp.common.model.common.variableCode').d('字段编码')}
            {...formLayout}
          >
            {getFieldDecorator('variableName', {
              initialValue: itemData.variableName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.categories.model.categories.code').d('规则编号'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input disabled={!!canUpdateCode} />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.categories.variableType').d('字段类型')}
            {...formLayout}
          >
            {getFieldDecorator('variableType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.categories.variableTypes').d('字段类型'),
                  }),
                },
              ],
              initialValue: itemData.variableType,
            })(
              <Select>
                {variableTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.categories.model.categories.variableName').d('字段名称')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.categories.model.categories.variableName').d('字段名称'),
                  }),
                },
                {
                  max: 240,
                  message: intl.get('hzero.common.validation.max', {
                    max: 240,
                  }),
                },
              ],
              initialValue: itemData.description,
            })(
              // <Input />
              <TLEditor
                label={intl.get('hwfp.categories.model.categories.variableName').d('字段名称')}
                field="description"
                inputSize={{ zh: 240, en: 240 }}
                token={itemData._token || ''}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.componentType').d('组件类型')}
            {...formLayout}
          >
            {getFieldDecorator('componentType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.componentType').d('组件类型'),
                  }),
                },
              ],
              initialValue: itemData.componentType,
            })(
              <Select onChange={() => form.setFieldsValue({ lovCode: '' })}>
                {componentTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.lovCode').d('来源值集')}
            {...formLayout}
          >
            {getFieldDecorator('lovCode', {
              rules: [
                {
                  required:
                    ['SINGLE_SELECT', 'SINGLE_LOV', 'RADIO', 'SWITCH', 'CHECKBOX'].indexOf(
                      getFieldValue('componentType')
                    ) !== -1,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.lovCode').d('来源值集'),
                  }),
                },
              ],
              initialValue: itemData.lovCode,
            })(
              <Lov
                code={
                  lovCodeFlag
                    ? isSiteFlag
                      ? 'HPFM.LOV_VIEW'
                      : 'HPFM.LOV.VIEW.ORG'
                    : isSiteFlag
                    ? 'HPFM.LOV.LOV_DETAIL_CODE'
                    : 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
                }
                queryParams={lovCodeFlag ? { organizationId: headerTenantId || tenantId } : {}}
                lovOptions={
                  lovCodeFlag
                    ? {
                        displayField: 'viewName',
                        valueField: 'viewCode',
                      }
                    : {
                        displayField: 'lovName',
                        valueField: 'lovCode',
                      }
                }
                disabled={
                  ['SINGLE_SELECT', 'SINGLE_LOV', 'RADIO', 'SWITCH', 'CHECKBOX'].indexOf(
                    getFieldValue('componentType')
                  ) === -1
                }
              />
            )}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`hzero.common.status.requiredFlag`).d('是否必输')}
          >
            {getFieldDecorator('requiredFlag', {
              initialValue: itemData.requiredFlag === 1 ? 1 : 0,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
