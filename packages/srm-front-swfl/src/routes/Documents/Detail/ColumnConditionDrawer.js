import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'hzero-ui';
import Lov from 'components/Lov';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class ColumnConditionDrawer extends Component {
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
    if (onHandleOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          onHandleOk({
            ...itemData,
            ...values,
            columnType: 'INPUT',
          });
        }
      });
    }
  }

  // 选中的值
  @Bind()
  changeLovValue(value, record) {
    const { form } = this.props;
    const { description, variableId, componentType, lovCode } = record;
    form.getFieldDecorator('variableId', { initialValue: '' });
    form.setFieldsValue({
      fieldCode: value,
      variableId,
      fieldName: description,
      fieldComponentType: componentType,
      lovCode,
    });
  }

  render() {
    const {
      anchor,
      visible,
      itemData,
      onCancel,
      enumMap,
      form,
      loading = false,
      documentId,
    } = this.props;
    const { componentTypes = [], searchFlagList = [] } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Modal
        okButtonProps={{ loading }}
        title={intl.get('hwfp.documents.model.title.conditionFieldMaintenance').d('条件字段维护')}
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
              initialValue: itemData.fieldCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.variableCode').d('字段编码'),
                  }),
                },
              ],
            })(
              <Lov
                code="HWFP.PROCESS_VARIABLE_LOV_VIEW"
                queryParams={{
                  documentId,
                  isIncludePredefineFlag: 'Y',
                  predefineType: 'relTable',
                  approvalGroupUseFlag: 1,
                }}
                lovOptions={{
                  displayField: 'variableName',
                  valueField: 'variableName',
                }}
                onChange={this.changeLovValue}
                disabled={itemData.editFlag === 0}
              />
            )}
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
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.categories.variableType').d('字段类型')}
            {...formLayout}
          >
            {getFieldDecorator('fieldComponentType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.categories.variableType').d('字段类型'),
                  }),
                },
              ],
              initialValue: itemData.fieldComponentType,
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
              initialValue: itemData.lovCode,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.categories.isQueryFlag').d('是否作为查询条件')}
            {...formLayout}
          >
            {getFieldDecorator('searchFlag', {
              initialValue: itemData.searchFlag ?? 0,
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
