/*
 * ShipHeaderInfo - 收货信息
 * @date: 2020-12-02
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
export default class ShipHeaderInfo extends PureComponent {
  render() {
    const { dataSource, form, customizeForm } = this.props;
    const {
      companyName,
      organizationName,
      shipToLocationAddress,
      actualReceiverName,
      contactInfo,
      erpAsnNum,
      // processingPlantAddress,
      // carriersCode,
      // carriersName,
    } = dataSource;
    return customizeForm(
      { code: 'SINV.PURCHASER_DELIVERY.DETAIL.HEADERSHIP', form, dataSource },
      <Form className={styles['information-item']}>
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`entity.customer.tag`).d('客户')} {...formLayout}>
              {form.getFieldDecorator('companyName', {
                initialValue: companyName,
              })(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sinv.common.model.common.organizationName').d('收货组织')}
              {...formLayout}
            >
              {form.getFieldDecorator('organizationName', {
                initialValue: organizationName,
              })(<span>{organizationName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点')}
              {...formLayout}
            >
              {form.getFieldDecorator('shipToLocationAddress', {
                initialValue: shipToLocationAddress,
              })(<span>{shipToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方')}
              {...formLayout}
            >
              {form.getFieldDecorator('actualReceiverName', {
                initialValue: actualReceiverName,
              })(<span>{actualReceiverName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.erpAsnNum`).d('内向交货单')}
              {...formLayout}
            >
              {form.getFieldDecorator('erpAsnNum', {
                initialValue: erpAsnNum,
              })(
                <Tooltip title={erpAsnNum}>
                  <div
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    <span>{erpAsnNum}</span>
                  </div>
                </Tooltip>
              )}
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
