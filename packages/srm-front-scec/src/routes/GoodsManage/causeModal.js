import React from 'react';
import { Modal, Input, Form } from 'hzero-ui';
import intl from 'utils/intl';

const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class CauseModal extends React.PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  handleOk = () => {
    const {
      onHandleOk,
      form: { validateFields },
    } = this.props;
    validateFields(err => {
      if (!err) {
        onHandleOk();
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      modalVisible,
      onHandleCancel,
    } = this.props;
    return (
      <Modal title="下架原因" visible={modalVisible} onOk={this.handleOk} onCancel={onHandleCancel}>
        <Form.Item label="请填写下架原因" {...formlayout}>
          {getFieldDecorator('operatedRemark', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: '下架原因',
                }),
              },
              {
                max: 300,
                message: intl.get('hzero.common.validation.max', { max: 300 }),
              },
            ],
          })(<Input.TextArea trim rows={4} />)}
        </Form.Item>
      </Modal>
    );
  }
}
