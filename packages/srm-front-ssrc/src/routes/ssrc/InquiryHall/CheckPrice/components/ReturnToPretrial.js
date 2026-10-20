/**
 * ReturnToPretrial - 寻源服务/核价页面/退回至初审
 * @date: 2019-4-1
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class LadderLevelModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  onOk() {
    const { form, submitReturnToPretrial } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        submitReturnToPretrial(values);
      }
    });
  }

  returnToPretrialResion() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.backResion`).d('退回原因')}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              style={{ marginTop: '3px' }}
            >
              {getFieldDecorator('backPretrialRemark', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.backResion`).d('退回原因'),
                    }),
                  },
                ],
              })(<TextArea autosize={{ minRows: 3, maxRows: 6 }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { hideModal, visible } = this.props;
    return (
      <Modal
        visible={visible}
        width={500}
        onOk={this.onOk}
        onCancel={hideModal}
        bodyStyle={{ maxHeight: 600 }}
        title={intl.get(`ssrc.inquiryHall.view.message.title.returnToPretrial`).d('退回至初审')}
      >
        {this.returnToPretrialResion()}
      </Modal>
    );
  }
}
