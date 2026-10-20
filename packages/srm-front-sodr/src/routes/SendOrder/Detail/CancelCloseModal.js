/**
 * 订单取消提示框
 * @date: 2021-3-8
 * @author: jingchen <jing.chen06@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Modal, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';

const { TextArea } = Input;

@connect(({ loading = {}, acceptanceSheetQuery = {} }) => ({
  fetchOperationRecordListLoading: loading.effects['acceptanceSheetQuery/fetchOperationRecordList'],
  acceptanceSheetQuery,
}))
@formatterCollections({
  code: ['sinv.deliveryCancelled', 'entity.supplier', 'entity.customer', 'entity.roles'],
})
@Form.create({ fieldNameProp: null })
export default class CancelCloseModal extends Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
  }

  render() {
    const {
      form,
      cancelModalVisible,
      hideCancelModal,
      handleReasonConfirm,
      handleReasonCancel,
      cancelOrderLoading,
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal
        title={intl.get(`sodr.common.model.common.cancelTitle`).d('取消')}
        width={620}
        visible={cancelModalVisible}
        onCancel={hideCancelModal}
        footer={[
          <Button onClick={() => handleReasonConfirm()} type="primary" loading={cancelOrderLoading}>
            {intl.get(`hzero.common.button.sure`).d('确定')}
          </Button>,
          <Button onClick={() => handleReasonCancel()} type="primary" loading={cancelOrderLoading}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>,
        ]}
      >
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={intl.get(`sodr.common.model.common.cancelReason`).d('取消原因')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('closeCancelRemark', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`sodr.common.model.common.cancelReason`).d('取消原因'),
                          }),
                        },
                      ],
                    })(<TextArea />)}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
