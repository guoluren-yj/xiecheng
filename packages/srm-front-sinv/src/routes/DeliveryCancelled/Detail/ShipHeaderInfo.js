/*
 * HeaderInfo - 收货信息
 * @date: 2020-12-02
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class ShipHeaderInfo extends PureComponent {
  render() {
    // const { loading } = this.props;
    const { detailHeaderInfo = {}, customizeForm, form } = this.props;
    const {
      companyName,
      organizationName,
      shipToLocationAddress,
      contactInfo,
      actualReceiverName,
      // carriersCode,
      // carriersName,
      // processingPlantAddress,
    } = detailHeaderInfo;
    return customizeForm(
      {
        code: 'SODR.DELIVERY_CANCELLED_DETAIL.HEADERSHIP',
        form,
        dataSource: detailHeaderInfo,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.customer.tag`).d('客户')} {...formLayout}>
              {form.getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
              {...formLayout}
            >
              {form.getFieldDecorator('organizationName')(<span>{organizationName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点')}
              {...formLayout}
            >
              {form.getFieldDecorator('shipToLocationAddress')(
                <span>{shipToLocationAddress}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方')}
              {...formLayout}
            >
              {form.getFieldDecorator('actualReceiverName')(<span>{actualReceiverName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...formLayout}
              label={intl.get(`sinv.common.model.common.contactor`).d('联系人')}
            >
              {form.getFieldDecorator('contactInfo', { initiaValue: contactInfo })(
                <span>{contactInfo}</span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
