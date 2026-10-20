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
      cancelCloseModalVisible,
      hideCancelModal,
      handleReasonConfirm,
      handleReasonCancel,
      buttonType,
      closeOrderLoading,
      cancelOrderLoading,
      closeLineLoading,
      cancelLineLoading,
      customizeForm,
      personalizedCoding,
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={
          buttonType === 'cancel'
            ? intl.get(`sodr.common.model.common.cancelTitle`).d('取消')
            : intl.get(`sodr.common.model.common.closeTitle`).d('关闭')
        }
        width={500}
        visible={cancelCloseModalVisible}
        // bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
        onCancel={hideCancelModal}
        footer={[
          <Button
            onClick={() => handleReasonConfirm(buttonType)}
            type="primary"
            loading={
              cancelOrderLoading || cancelLineLoading || closeOrderLoading || closeLineLoading
            }
          >
            {intl.get(`hzero.common.button.sure`).d('确定')}
          </Button>,
          <Button
            onClick={() => handleReasonCancel()}
            type="primary"
            loading={
              cancelOrderLoading || cancelLineLoading || closeOrderLoading || closeLineLoading
            }
          >
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>,
        ]}
      >
        {customizeForm(
          {
            code: buttonType === 'cancel' ? personalizedCoding : '',
            form: this.props.form,
            dataSource: {},
          },
          <Form className="whole-form">
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  label={
                    buttonType === 'cancel'
                      ? intl.get(`sodr.common.model.common.cancelReason`).d('取消原因')
                      : intl.get(`sodr.common.model.common.closeReason`).d('关闭原因')
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator('closeCancelRemark', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name:
                            buttonType === 'cancel'
                              ? intl.get(`sodr.common.model.common.cancelReason`).d('取消原因')
                              : intl.get(`sodr.common.model.common.closeReason`).d('关闭原因'),
                        }),
                      },
                    ],
                    //   initialValue: headerInfo.acceptListTypeId,
                  })(<TextArea />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
