import React, { PureComponent } from 'react';
import { Modal, Row, Col, DatePicker, Form, Input } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6, offset: 0 },
  wrapperCol: { span: 18 },
};
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class TimeAdjustmentModal extends PureComponent {
  @Bind()
  handleOk() {
    const {
      handleSubmitTime,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        if (handleSubmitTime) handleSubmitTime(values, this.handleCancel);
      }
    });
  }

  @Bind()
  handleCancel() {
    const {
      onClose,
      form: { resetFields },
    } = this.props;
    resetFields();
    onClose();
  }

  render() {
    const { form = {}, basicInfo, timeVisible, timeLoading } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={timeVisible}
        onCancel={this.handleCancel}
        width={600}
        title={intl.get(`entity.attachment.timeAdjustment`).d('时间调整')}
        onOk={this.handleOk}
        confirmLoading={timeLoading}
      >
        <Form>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem
                label={intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期')}
                {...formLayout}
              >
                {getFieldDecorator('feedbackDate', {
                  initialValue: basicInfo.feedbackDate && moment(basicInfo.feedbackDate),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期'),
                      }),
                    },
                  ],
                })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem
                label={intl.get(`sqam.common.model.timeAdjustment.adjustmentRemark`).d('调整说明')}
                {...formLayout}
              >
                {getFieldDecorator('dateAdjustRemark', {
                  initialValue: basicInfo.dateAdjustRemark,
                })(<TextArea rows={3} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
