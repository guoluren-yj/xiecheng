import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'hzero-ui';
import { isEmpty, omit } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

let uid = Date.now();
@Form.create({ fieldNameProp: null })
export default class ColumnApprovalDrawer extends Component {
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

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { form, onHandleOk, itemData } = this.props;
    const myCode = itemData.id ? {} : { fieldCode: this.createUid() };
    if (onHandleOk) {
      form.validateFields((err, values) => {
        const value = itemData.id ? omit(values, ['fieldCode']) : values;
        if (isEmpty(err)) {
          onHandleOk({
            ...itemData,
            ...value,
            columnType: 'OUTPUT',
            ...myCode,
          });
        }
      });
    }
  }

  changeOutputType = (value) => {
    const { form } = this.props;
    // EMPLOYEE 员工 ROLE 角色 POSITION 岗位
    if (value === 'EMPLOYEE') {
      form.setFieldsValue({ lovCode: 'HWFP.EMPLOYEE' });
    } else if (value === 'ROLE') {
      form.setFieldsValue({ lovCode: 'HWFP.TENANT.ROLE.WORKFLOW' });
    } else if (value === 'POSITION') {
      form.setFieldsValue({ lovCode: 'HWFP.APPROVE_RULE_POSITION' });
    } else if (!value) {
      form.setFieldsValue({ lovCode: '' });
    }
  };

  createUid = () => {
    return (uid++).toString(36);
  };

  render() {
    const {
      anchor,
      visible,
      itemData,
      onCancel,
      enumMap,
      form,
      loading = false,
      approvalListNum,
    } = this.props;
    const { componentTypes = [], outputTypes = [], searchFlagList = [] } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Modal
        okButtonProps={{ loading }}
        title={intl
          .get('hwfp.documents.model.title.approvalGroupFieldMaintenance')
          .d('审批组字段维护')}
        width={520}
        zIndex={950}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get('hwfp.common.model.common.variableCode').d('字段编码')}
            {...formLayout}
          >
            {getFieldDecorator('fieldCode', {
              initialValue: `#${approvalListNum}`,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.variableCode').d('字段编码'),
                  }),
                },
              ],
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.variableName').d('字段名称')}
            {...formLayout}
          >
            {getFieldDecorator('fieldName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
                  }),
                },
                {
                  max: 240,
                  message: intl.get('hzero.common.validation.max', {
                    max: 240,
                  }),
                },
              ],
              initialValue: itemData.fieldName,
            })(<Input disabled={itemData.editFlag === 0} />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.outputType').d('输出类型')}
            {...formLayout}
          >
            {getFieldDecorator('outputType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.outputType').d('输出类型'),
                  }),
                },
              ],
              initialValue: itemData.outputType || 'EMPLOYEE',
            })(
              <Select onChange={this.changeOutputType} disabled={itemData.editFlag === 0}>
                {outputTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.categories.variableType').d('字段类型')}
            {...formLayout}
          >
            {getFieldDecorator('fieldComponentType', {
              initialValue: itemData.fieldComponentType || 'SINGLE_LOV',
            })(
              <Select disabled>
                {componentTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.documents.model.documents.lovCode').d('来源值集')}
            {...formLayout}
          >
            {getFieldDecorator('lovCode', {
              rules: [
                {
                  required:
                    ['SINGLE_SELECT', 'SINGLE_LOV', 'RADIO', 'SWITCH', 'CHECKBOX'].indexOf(
                      getFieldValue('fieldComponentType')
                    ) !== -1,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.documents.model.documents.lovCode').d('来源值集'),
                  }),
                },
              ],
              initialValue: itemData.lovCode || 'HWFP.EMPLOYEE',
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.categories.isQueryFlag').d('是否作为查询条件')}
            {...formLayout}
          >
            {getFieldDecorator('searchFlag', {
              initialValue: itemData.searchFlag ?? 1,
            })(
              <Select>
                {searchFlagList.map((item) => (
                  <Select.Option key={parseInt(item.value, 10)} value={parseInt(item.value, 10)}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
