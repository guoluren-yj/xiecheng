import React, { Component } from 'react';
import { Modal, Form, Button, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class CreateModal extends Component {
  @Bind()
  changeTemplateId(val, record) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      templateId: record.templateId,
    });
  }

  @Bind()
  onClickSubmit() {
    const {
      createInquiry,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (err) return;
      createInquiry(values);
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      onCancel,
      loading,
      projectApprovalToBiddingRows = [],
    } = this.props;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const { sourceProjectId } = projectApprovalToBiddingRows[0] || {};
    return (
      <Modal
        visible={visible}
        width={350}
        maskClosable
        destroyOnClose
        onCancel={onCancel}
        title={intl
          .get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`)
          .d('选择寻源模板')}
        footer={
          <Button type="primary" loading={loading} onClick={this.onClickSubmit}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        }
      >
        <Row gutter={8}>
          <Form>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                initialValue:
                  projectApprovalToBiddingRows[0] && projectApprovalToBiddingRows[0].templateId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`)
                        .d('寻源模板'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.TEMPLATE_NAME"
                  queryParams={{
                    sourceCategory: 'RFX',
                    sourceProjectId,
                  }}
                  textValue={
                    projectApprovalToBiddingRows[0] && projectApprovalToBiddingRows[0].templateName
                  }
                  textField="templateName"
                  onChange={(val, record) => this.changeTemplateId(val, record)}
                />
              )}
            </FormItem>
            {/* <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...formLayout}
            >
              {getFieldDecorator('sourcingCategory')(<Input trim maxLength={40} />)}
            </FormItem> */}
          </Form>
        </Row>
      </Modal>
    );
  }
}
