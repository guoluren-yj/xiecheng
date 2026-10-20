/**
 * QueryForm - 监控联系人 - 数据维护表单
 * @date: 2018-11-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { EMAIL, PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import Switch from 'components/Switch';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 侧滑modal样式属性
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
 * 数据维护表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { form, onHandleAddNoticeReceiver } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddNoticeReceiver(fieldsValue, form);
      }
    });
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  onCancelHandle() {
    const { form, onShowEditModal } = this.props;
    onShowEditModal(false);
    form.resetFields();
  }

  render() {
    const { form, modalVisible, editRowData, loading } = this.props;
    const { name, mobilephone, email, enabledFlag } = editRowData;
    return (
      <Modal
        title={intl.get('sitf.noticeReceiver.view.title.modal').d('监控联系人维护')}
        width={520}
        visible={modalVisible}
        confirmLoading={loading}
        onOk={this.okHandle}
        onCancel={this.onCancelHandle}
        destroyOnClose
        {...otherProps}
      >
        <React.Fragment>
          <FormItem label={intl.get('entity.roles.contacts').d('联系人')} {...formLayout}>
            {form.getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.roles.contacts').d('联系人'),
                  }),
                },
                {
                  max: 70,
                  message: intl.get('hzero.common.validation.max', {
                    max: 70,
                  }),
                },
              ],
            })(<Input trim maxLength={70} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.phone').d('手机号')} {...formLayout}>
            {form.getFieldDecorator('mobilephone', {
              initialValue: mobilephone,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hzero.common.phone').d('手机号'),
                  }),
                },
                {
                  pattern: PHONE,
                  message: intl.get('hzero.common.validation.phone').d('手机号码格式不正确'),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input trim inputChinese={false} maxLength={30} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.email').d('邮箱')} {...formLayout}>
            {form.getFieldDecorator('email', {
              initialValue: email,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hzero.common.email').d('邮箱'),
                  }),
                },
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
                {
                  pattern: EMAIL,
                  message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                },
              ],
            })(<Input trim inputChinese={false} maxLength={100} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            })(<Switch />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
