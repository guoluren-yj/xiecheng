import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Modal } from 'hzero-ui';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterList extends Component {
  @Bind()
  handleOk() {
    const {
      form: { validateFields },
      onOk,
    } = this.props;
    validateFields((err, val) => {
      if (!err) {
        onOk(val.remark);
      }
    });
  }

  render() {
    const { form = {}, visible = false, onCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        destroyOnClose
        width={400}
        title={intl.get('smpc.product.view.rejectReason').d('拒绝原因')}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <Form>
          <FormItem>
            {getFieldDecorator('remark', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('smpc.product.view.rejectReason').d('拒绝原因'),
                  }),
                },
                {
                  max: 100,
                  message: intl.get('smpc.product.view.reasonLimitLength').d('限100字'),
                },
              ],
            })(<Input.TextArea rows={5}></Input.TextArea>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
