/**
 * EditPwForm - 电商授权 - 维护密码
 * @date: 2019-12-03
 * @author: lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

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
@CacheComponent({ cacheKey: '/small/ecommerce-authorization-pwd' })
export default class EditPwForm extends React.Component {
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

  render() {
    const { form, pwdVisible, editPwdLoading, closePassword, pwdRecord } = this.props;

    return (
      <Modal
        destroyOnClose
        confirmLoading={editPwdLoading}
        title={intl.get('small.ecommerceAuthorization.authorization.changePwd').d('密码修改')}
        visible={pwdVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={closePassword}
      >
        <React.Fragment>
          <FormItem
            label={intl.get('small.ecClient.model.ecClient.form.account').d('账号')}
            {...formLayout}
          >
            {form.getFieldDecorator('username', {
              initialValue: pwdRecord.username,
            })(<Input disabled={pwdRecord} />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecClient.model.ecClient.form.oldPwd').d('旧密码')}
            {...formLayout}
          >
            {form.getFieldDecorator('oldPwd', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecClient.model.ecClient.form.oldPwd').d('旧密码'),
                  }),
                },
              ],
            })(<Input type="password" />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecClient.model.ecClient.form.newPwd').d('新密码')}
            {...formLayout}
          >
            {form.getFieldDecorator('newPwd', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecClient.model.ecClient.form.newPwd').d('新密码'),
                  }),
                },
              ],
            })(<Input type="password" />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
