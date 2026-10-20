/**
 * ChangePwdFrom - 电商账号管理 - 维护密码
 * @date: 2019-3-06
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 维护密码表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ChangePwdForm extends React.Component {
  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { form, saveNewPwd } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (saveNewPwd) {
          saveNewPwd(fieldsValue);
        }
      }
    });
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { form, showChangePwdModal } = this.props;
    showChangePwdModal(false);
    form.resetFields();
  }

  render() {
    const { form, changePwdModalVisible, savePwdLoading } = this.props;
    return (
      <Modal
        destroyOnClose
        confirmLoading={savePwdLoading}
        title={intl.get('small.ecClientSite.model.ecClientSite.passwordchange').d('密码修改')}
        visible={changePwdModalVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <FormItem
          label={intl.get('small.ecClientSite.model.ecClientSite.password').d('密码')}
          {...formLayout}
        >
          {form.getFieldDecorator('userPassword', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('small.ecClientSite.model.ecClientSite.password').d('密码'),
                }),
              },
              {
                max: 120,
                message: intl.get('hzero.common.validation.max', {
                  max: 120,
                }),
              },
            ],
          })(<Input type="password" autoComplete="new-password" />)}
        </FormItem>
      </Modal>
    );
  }
}
