import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Modal, Input } from 'hzero-ui';

import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
export default class EditTable extends Component {
  @Bind()
  handleOk() {
    const { form, onHandleOK } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleOK(fieldsValue);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      editData,
      visible,
      onClose,
      type,
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={
          type === 'white'
            ? intl.get('small.common.model.whiteList').d('白名单')
            : intl.get('small.common.model.blackList').d('黑名单')
        }
        visible={visible}
        onOk={this.handleOk}
        onCancel={onClose}
      >
        <Form.Item
          label={intl.get('small.ecommerceAuthorization.entity.roles.ip.address').d('IP地址')}
          {...formLayout}
        >
          {getFieldDecorator('ipAddress', {
            initialValue: editData.ipAddress,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('small.ecommerceAuthorization.entity.roles.ip.address')
                    .d('IP地址'),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
      </Modal>
    );
  }
}
