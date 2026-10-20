/**
 * EditForm - 外部系统分配 - 编辑弹框
 * @date: 2018-12-17
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * modal侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

const otherStyle = {
  style: {
    width: '100%',
  },
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * EditForm - 编辑form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  @Bind()
  okHandle() {
    const { form, onHandleAddSystem, editRowData = {} } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddSystem(
          {
            relationId: editRowData.relationId,
            interfaceEnabledFlag: fieldsValue.interfaceEnabledFlag,
            interfaceControlFlag: fieldsValue.interfaceControlFlag,
          },
          form
        );
      }
    });
  }

  /**
   * 取消模态框
   */
  @Bind()
  cancelHandle() {
    const { form, onShowEditModal } = this.props;
    onShowEditModal(false);
    form.resetFields();
  }

  render() {
    const { form, modalVisible, editRowData = {}, loading } = this.props;
    return (
      <Modal
        title={intl.get('sitf.externalSystems.view.message.title.list.modal').d('外部系统定义维护')}
        {...otherProps}
        destroyOnClose
        width={520}
        confirmLoading={loading}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
              .d('系统代码')}
          >
            {form.getFieldDecorator('externalSystemCode', {
              initialValue: editRowData.externalSystemCode,
            })(<Input typeCase="upper" trim inputChinese={false} disabled {...otherStyle} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.externalSystemName')
              .d('系统名称')}
          >
            {form.getFieldDecorator('externalSystemName', {
              initialValue: editRowData.externalSystemName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('sitf.common.applicationGroup.name').d('应用组名称')}
          >
            {form.getFieldDecorator('applicationGroupCode', {
              initialValue: editRowData.applicationGroupCode,
            })(
              <Lov
                textValue={editRowData.applicationGroupName}
                code="SIFC.APPLICATION_GROUPS"
                disabled
                {...otherStyle}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.interfaceEnabledFlag')
              .d('启用接口')}
          >
            {form.getFieldDecorator('interfaceEnabledFlag', {
              initialValue:
                editRowData.interfaceEnabledFlag === undefined
                  ? 1
                  : editRowData.interfaceEnabledFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.interfaceControlFlag')
              .d('接口管控')}
          >
            {form.getFieldDecorator('interfaceControlFlag', {
              initialValue:
                editRowData.interfaceControlFlag === undefined
                  ? 1
                  : editRowData.interfaceControlFlag,
            })(<Switch />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
