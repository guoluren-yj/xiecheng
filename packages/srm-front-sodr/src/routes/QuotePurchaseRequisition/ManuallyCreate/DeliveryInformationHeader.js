/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Spin } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './Header.less';

const FormItem = Form.Item;

/**
 * DeliveryInformationHeader - 收货/收单信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class DeliveryInformationHeader extends PureComponent {
  render() {
    const { form = {}, dataSource = {}, loading } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
      shipToLocationAddress,
      shipToLocContName,
      shipToLocTelNum,
      billToLocationAddress,
      billToLocContName,
      billToLocTelNum,
      receiverEmailAddress,
    } = dataSource;
    return (
      <Spin spinning={loading}>
        <Form className={styles['header-wrapper']}>
          <Row className="items-row">
            <Col span={24}>
              <Row>
                <Col span={2} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.receiverAddressName`)
                    .d('收货方地址')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('shipToLocationAddress', {
                      initialValue: shipToLocationAddress,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={8}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.receiverContactName`)
                    .d('收货联系人')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('shipToLocContName', {
                      initialValue: shipToLocContName,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row style={{ marginLeft: '15px' }}>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.receiverTelNum`)
                    .d('收货联系电话')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('shipToLocTelNum', {
                      initialValue: shipToLocTelNum,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={24}>
              <Row>
                <Col span={2} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.invoiceAddressName`)
                    .d('收单方地址')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('billToLocationAddress', {
                      initialValue: billToLocationAddress,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={8}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.invoiceContactName`)
                    .d('收单联系人')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('billToLocContName', {
                      initialValue: billToLocContName,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row style={{ marginLeft: '15px' }}>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.invoiceTelNum`)
                    .d('收单联系电话')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('billToLocTelNum', {
                      initialValue: billToLocTelNum,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row style={{ marginLeft: '15px' }}>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.receiverEmailAddress`)
                    .d('收单邮箱')}
                  :
                </Col>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('receiverEmailAddress', {
                      initialValue: receiverEmailAddress,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Spin>
    );
  }
}
