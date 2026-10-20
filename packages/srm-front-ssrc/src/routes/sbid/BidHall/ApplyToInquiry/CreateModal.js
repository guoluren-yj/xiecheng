import React, { Component } from 'react';
import { Modal, Form, Button, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;

// {fieldNameProp: null}解决chrome下自动存储输入框数据问题
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
      createInquiry(values);
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      onCancel,
      createLoading,
    } = this.props;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal
        visible={visible}
        width={350}
        maskClosable
        destroyOnClose
        onCancel={onCancel}
        title={intl.get('ssrc.bidHall.view.message.title.chooseSourceTemp').d('选择寻源模板')}
        footer={
          <Button type="primary" loading={createLoading} onClick={this.onClickSubmit}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        }
      >
        <Row gutter={8}>
          <Form>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.modal.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.modal.inquiryHall.sourcingTemplate`)
                        .d('寻源模板'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.TEMPLATE_NAME"
                  queryParams={{
                    sourceCategory: 'BID',
                  }}
                  onChange={(val, record) => this.changeTemplateId(val, record)}
                />
              )}
            </FormItem>
            {/* <FormItem
              label={intl.get(`ssrc.inquiryHall.modal.inquiryHall.sourcingCategory`).d('寻源类别')}
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
