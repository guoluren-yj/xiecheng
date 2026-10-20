import React, { Component } from 'react';
import { Row, Col, Form, Input } from 'hzero-ui';

import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';

const modelPrompt = 'sodr.writeOff.model.common';

@Form.create({
  fieldNameProp: null,
})
export default class InfoPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.onRef) {
      props.onRef(props.form);
    }
  }

  render() {
    const { form, customizeForm, dataSource = {} } = this.props;
    const {
      operator,
      supplierName,
      asnNum,
      receiveOrderType,
      displayPoNum,
      receivedBy,
    } = dataSource;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.WRITE_OFF_DETAIL.HEADER',
      },
      <Form>
        <Row className="inclusion-row">
          <Col span={8}>
            <Form.Item
              label={intl.get(`entity.roles.operator`).d('操作人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('operator', {
                initialValue: operator,
              })(<span>{operator}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierName', {
                initialValue: supplierName,
              })(<span>{supplierName}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={
                receiveOrderType === 'ASN'
                  ? intl.get(`${modelPrompt}.asnNum`).d('送货单号')
                  : intl.get(`${modelPrompt}.orderNum`).d('订单号')
              }
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {receiveOrderType === 'ASN'
                ? getFieldDecorator('asnNum', { initialValue: asnNum })(<span>{asnNum}</span>)
                : getFieldDecorator('displayPoNum', { initialValue: displayPoNum })(
                    <span>{displayPoNum}</span>
                  )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`sinv.common.model.common.actualOperator`).d('实际操作人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receivedBy', {
                initialValue: receivedBy,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
