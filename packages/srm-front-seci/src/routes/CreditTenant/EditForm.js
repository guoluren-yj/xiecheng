/**
 * EditForm - 租户配置 - 数据维护表单
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { EMAIL, PHONE } from 'utils/regExp';
import Lov from 'components/Lov';
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
    const { form, onAddCreditTenant } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onAddCreditTenant(fieldsValue, form);
      }
    });
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { form, onHandleEditModal } = this.props;
    onHandleEditModal(false);
    form.resetFields();
  }

  /**
   * 设置租户名称
   * @param {*} _ 占位
   * @param {Object} record 当前行数据
   */
  @Bind()
  setTenantName(_, record) {
    const { form } = this.props;
    form.registerField('tenantName');
    form.setFieldsValue({
      tenantName: record.tenantName,
    });
  }

  render() {
    const { form, modalVisible, editRowData, loading } = this.props;
    const { tenantId, tenantName, email, phone, enabledFlag } = editRowData;
    return (
      <Modal
        destroyOnClose
        {...otherProps}
        confirmLoading={loading}
        title={intl.get('seci.creditTenant.view.message.title').d('租户维护')}
        visible={modalVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
            {form.getFieldDecorator('tenantId', {
              initialValue: tenantId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.tenant.tag').d('租户'),
                  }),
                },
              ],
            })(<Lov textValue={tenantName} code="HPFM.TENANT" onChange={this.setTenantName} />)}
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
                  pattern: EMAIL,
                  message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.phone').d('电话')} {...formLayout}>
            {form.getFieldDecorator('phone', {
              initialValue: phone,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hzero.common.phone').d('电话'),
                  }),
                },
                {
                  pattern: PHONE,
                  message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                },
              ],
            })(<Input trim inputChinese={false} />)}
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
