/**
 *EcommerceAuthorization -电商授权 查询页面
 * @date: 2019-12-03
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
export default class EditInfo extends Component {
  handleCreateAccount = () => {
    const {
      record = {},
      onOk,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      const value = { ...record, ...values, yn: !!values.yn };
      if (!err) {
        onOk(value);
      }
    });
  };

  render() {
    const {
      visible,
      record = {},
      onClose,
      saveLoading,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        destroyOnClose
        width={400}
        title={
          record.id
            ? intl.get('small.common.modal.change.info').d('修改信息')
            : intl.get('small.common.button.newAccount').d('新建账号')
        }
        placement="right"
        visible={visible}
        onOk={this.handleCreateAccount}
        onCancel={onClose}
        confirmLoading={saveLoading}
        transitionName="move-right"
        wrapClassName="ant-modal-sidebar-right"
      >
        <Form.Item
          label={intl.get('small.common.form.customerr.code').d('客户代码')}
          {...formLayout}
        >
          {getFieldDecorator('customerCode', {
            initialValue: record.customerCode,
          })(<Input />)}
        </Form.Item>
        <Form.Item label={intl.get('small.common.model.tenant').d('租户')} {...formLayout}>
          {getFieldDecorator('tenantId', {
            initialValue: record.tenantId,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('small.common.model.tenant').d('租户'),
                }),
              },
            ],
          })(<Lov code="HPFM.TENANT" textValue={record.tenantName} disabled={record.id} />)}
        </Form.Item>
        <Form.Item label={intl.get('small.common.model.ecommerce').d('电商')} {...formLayout}>
          {getFieldDecorator('supplierCode', {
            initialValue: record.supplierCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('small.common.model.ecommerce').d('电商'),
                }),
              },
            ],
          })(
            <Lov
              code="SMAL.PLATFORM_NAME"
              textValue={record.supplierName}
              queryParams={{ tenantId: getCurrentOrganizationId() }}
              // queryParams={{ tenantId: getCurrentOrganizationId(), companyId: '-1' }}
            />
          )}
        </Form.Item>
        <Form.Item label={intl.get('small.common.model.accountNumber').d('账号')} {...formLayout}>
          {getFieldDecorator('username', {
            initialValue: record.username,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('small.common.model.accountNumber').d('账号'),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        {!record.id && (
          <Form.Item
            label={intl.get('small.ecommerceAuthorization.entity.roles.password').d('密码')}
            {...formLayout}
          >
            {getFieldDecorator('password', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecommerceAuthorization.entity.roles.password').d('密码'),
                  }),
                },
              ],
            })(<Input type="password" />)}
          </Form.Item>
        )}
        <Form.Item label={intl.get('small.common.table.column.remark').d('备注')} {...formLayout}>
          {getFieldDecorator('remark', { initialValue: record.remark })(<TextArea rows={4} />)}
        </Form.Item>
        <Form.Item {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
          {getFieldDecorator('yn', {
            initialValue: record.yn || 1,
          })(<Switch />)}
        </Form.Item>
      </Modal>
    );
  }
}
