import React, { Component } from 'react';
// import { parse } from 'querystring';
// import { Modal, Input, Form } from 'hzero-ui';
import { Modal } from 'hzero-ui';
import intl from 'utils/intl';

// const { TextArea } = Input;
// const FormItem = Form.Item;
const commonPrompt = 'spcm.contractSign.model.common';

export default class LocalizedModal extends Component {
  // hideModal = () => {
  //   this.setState({
  //     visible: false,
  //   });
  // };
  render() {
    const {
      visible,
      // form: { getFieldDecorator },
    } = this.props;

    return (
      <Modal
        title={intl.get(`${commonPrompt}.refusedToDeal`).d('拒绝协议')}
        visible={visible}
        onOk={this.hideModal}
        onCancel={this.hideModal}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {/* <Form>
          <FormItem label={intl.get(``).d('审批拒绝')}>
            {getFieldDecorator('approvedRemark', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: '拒绝协议',
                  }),
                },
              ],
            })(<TextArea rows={4} />)}
          </FormItem>
        </Form> */}
      </Modal>
    );
  }
}
