import React, { Component } from 'react';
import { Modal, Form, Input, Row, Col } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config.js';

const { TextArea } = Input;

const formLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

@Form.create({ fieldNameProp: null })
export default class AssignModal extends Component {
  @Bind()
  handleOk() {
    const { form, onSubmit } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { assign, comment } = values;
        onSubmit(assign, comment);
      }
    });
  }

  render() {
    const {
      visible,
      handleClose,
      form: { getFieldDecorator },
      buttonLoading,
      attachmentUuid,
      setAttachmentUuid,
      tenantId,
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={intl.get('hwfp.monitor.view.option.retry').d('指定审批人')}
        width={500}
        visible={visible}
        onOk={this.handleOk}
        onCancel={handleClose}
        confirmLoading={buttonLoading}
      >
        <Form>
          <Form.Item
            {...formLayout}
            label={intl.get('hwfp.common.model.approval.owner').d('审批人')}
          >
            {getFieldDecorator('assign', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.model.approval.owner').d('审批人'),
                    })
                    .d(`${intl.get('hwfp.common.model.approval.owner').d('审批人')}不能为空`),
                },
              ],
            })(
              <Lov
                code="HWFP.EMPLOYEE"
                queryParams={{ tenantId, enabledFlag: 1 }}
                lovOptions={{
                  displayField: 'name',
                }}
              />
            )}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get('hwfp.common.modal.opinion').d('意见')}>
            {getFieldDecorator('comment', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.modal.opinion').d('意见'),
                    })
                    .d(`${intl.get('hwfp.common.modal.opinion').d('意见')}不能为空`),
                },
              ],
            })(<TextArea />)}
          </Form.Item>
          <Row>
            <Col span={20} offset={4}>
              {attachmentUuid && (
                <Attachment
                  bucketName={PRIVATE_BUCKET}
                  value={attachmentUuid}
                  onChange={setAttachmentUuid}
                />
              )}
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
