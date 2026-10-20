/**
 * EditForm - 消息队列定义 - 消息队列系统分配定义 - 编辑组件
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 侧滑弹出框样式属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑组件
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  /**
   * 确定按钮事件
   */
  @Bind()
  okHandle() {
    const { form, onHandleAddSystem } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddSystem(
          { ...fieldsValue, applicationCode: lodash.trim(fieldsValue.applicationCode) },
          form
        );
      }
    });
  }

  /**
   * 取消模态框显示
   */
  @Bind()
  cancelHandle() {
    const { form, onShowEditModal } = this.props;
    onShowEditModal(false);
    form.resetFields();
  }

  render() {
    const { form, modalVisible, editRowData, loading } = this.props;
    const { systemAssignId, systemType, systemCode, remark } = editRowData;
    return (
      <Modal
        title={intl
          .get('sitf.queuesSetting.view.message.title.list.modal.queueSystemAssign')
          .d('系统分配类型维护')}
        width={520}
        {...otherProps}
        destroyOnClose
        confirmLoading={loading}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem label={intl.get('sitf.common.system.type').d('系统分配类型')} {...formLayout}>
            {form.getFieldDecorator('systemType', {
              initialValue: systemType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.system.type').d('系统分配类型'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input disabled={!!systemAssignId} />)}
          </FormItem>
          <FormItem label={intl.get('sitf.common.system.code').d('系统分配代码')} {...formLayout}>
            {form.getFieldDecorator('systemCode', {
              initialValue: systemCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.system.code').d('系统分配代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!!systemAssignId} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {form.getFieldDecorator('remark', {
              initialValue: remark,
            })(<Input />)}
          </FormItem>
          {/* <FormItem
            label={intl.get('sitf.queuesSetting.model.queueSystemAssign.enabledFlag').d('是否启用')}
            {...formLayout}
          >
            {form.getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            })(<Switch />)}
          </FormItem> */}
        </React.Fragment>
      </Modal>
    );
  }
}
