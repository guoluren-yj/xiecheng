/*
 * DeliveryHeader - 送货单明细头信息
 * @date: 2018/11/14 14:29:33
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import intl from 'utils/intl';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@Form.create({ fieldNameProp: null })
export default class ShipHeaderInfo extends PureComponent {
  render() {
    const { dataSource, form, customizeForm } = this.props;
    const {
      companyName,
      organizationName,
      contactInfo,
      shipToLocationAddress,
      actualReceiverName,
    } = dataSource;
    return customizeForm(
      {
        code: 'SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP',
        form,
        dataSource,
      },
      <Form className={styles['information-item']}>
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`entity.customer.tag`).d('客户')} {...formLayout}>
              {form.getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
              {...formLayout}
            >
              {form.getFieldDecorator('organizationName')(<span>{organizationName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
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
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方')}
              {...formLayout}
            >
              {form.getFieldDecorator('actualReceiverName')(<span>{actualReceiverName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
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
