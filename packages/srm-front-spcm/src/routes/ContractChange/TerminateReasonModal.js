import React, { Component, Fragment } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
@Form.create()
export default class componentName extends Component {
  /**
   * 确认回调
   */
  @Bind()
  handleOk() {
    const {
      onOk,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        if (onOk) {
          onOk(values);
          // this.handleCancel();
        }
      }
    });
  }

  @Bind()
  handleCancel() {
    const {
      onCancel,
      form: { resetFields },
    } = this.props;
    resetFields();
    onCancel();
  }

  render() {
    const { visible, terminateLoading, customizeForm, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        className={styles['reject-modal']}
        footer={
          <Fragment>
            <Button onClick={this.handleCancel}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            <Button type="primary" onClick={this.handleOk} loading={terminateLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
        title={intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
        onCancel={this.handleCancel}
        visible={visible}
      >
        {customizeForm(
          {
            code: 'SPCM.CONTRACT.CONTROL.TERMINATION',
            form,
          },
          <Form>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.terminationReason`).d('终止原因')}
                >
                  {getFieldDecorator('terminationReason', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spcm.common.model.terminationReason`).d('终止原因'),
                        }),
                      },
                    ],
                  })(<TextArea className={styles['text-area']} rows={4} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.terminationAttachment`).d('终止文件')}
                >
                  {getFieldDecorator('terminationAttachmentUuid')(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      name="terminationAttachmentUuid"
                      bucketDirectory="purchaser-attachment"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
