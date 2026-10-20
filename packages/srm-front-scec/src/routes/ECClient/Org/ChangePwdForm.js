/**
 * ChangePwdFrom - 电商账号管理 - 维护密码
 * @date: 2019-2-25
 * @author: lokya <kan.li01@hand-china.com>
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
@CacheComponent({ cacheKey: '/scec/ec-client-pwd' })
export default class EditForm extends React.Component {
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
        title={intl.get('scec.ecClient.view.ecClient.title.changePwd').d('密码修改')}
        visible={changePwdModalVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem
            label={intl.get('scec.ecClient.model.ecClient.form.userPassword').d('密码')}
            {...formLayout}
          >
            {form.getFieldDecorator('userPassword', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.ecClient.model.ecClient.form.userPassword').d('密码'),
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
          <FormItem label="CLIENT_ID" {...formLayout}>
            {form.getFieldDecorator('clientId', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: 'CLIENT_ID',
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
          <FormItem
            label={intl.get('scec.ecClient.model.ecClient.form.clientSecret').d('密钥')}
            {...formLayout}
          >
            {form.getFieldDecorator('clientSecret', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.ecClient.model.ecClient.form.clientSecret').d('密钥'),
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
        </React.Fragment>
      </Modal>
    );
  }
}
