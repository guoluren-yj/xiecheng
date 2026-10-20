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

const oneThirdOfInputSpan = 16;
/**
 * BillingInformation - 开票信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class BillingInformation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { form = {}, dataSource = {}, loading } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
      taxRegisterNum,
      taxRegisterAddress,
      taxRegisterBank,
      invoiceTypeName,
      invoiceMethodName,
      taxRegisterBankAccount,
      invoiceDetailTypeName,
      invoiceTitleTypeName,
    } = dataSource;
    return (
      <Spin spinning={loading}>
        <Form className={styles['header-wrapper']}>
          <Row className="items-row">
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.taxRegisterAddress`)
                    .d('税务登记地址')}
                  :
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('taxRegisterAddress', {
                      initialValue: taxRegisterAddress,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl.get(`sodr.quotePurchase.model.quotePurchase.taxRegisterNum`).d('税号')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('taxRegisterNum', {
                      initialValue: taxRegisterNum,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl.get(`sodr.quotePurchase.model.quotePurchase.taxRegisterBank`).d('开户行')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('taxRegisterBank', {
                      initialValue: taxRegisterBank,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.taxBankAccount`)
                    .d('开户行账号')}
                  :
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('taxRegisterBankAccount', {
                      initialValue: taxRegisterBankAccount,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl.get(`sodr.common.model.common.taxRegisterBank`).d('开票公司名称')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('taxRegisterBank', {
                      initialValue: taxRegisterBank,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl.get(`sodr.common.model.common.taxRegisterBankAccount`).d('税务登记电话')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('taxRegisterBankAccount', {
                      initialValue: taxRegisterBankAccount,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.invoiceTitleTypeCode`)
                    .d('发票类型')}
                  :
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('invoiceTitleTypeMeaning', {
                      initialValue: invoiceTitleTypeName,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.invoiceMethodCode`)
                    .d('开票方式')}
                  :
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('invoiceMethodMeaning', {
                      initialValue: invoiceMethodName,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl.get(`sodr.quotePurchase.model.quotePurchase.invoiceTypeCode`).d('发票形式')}
                  :
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('invoiceTypeMeaning', {
                      initialValue: invoiceTypeName,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={6} className="item-label">
                  {intl
                    .get(`sodr.quotePurchase.model.quotePurchase.invoiceDetailTypeCode`)
                    .d('发票明细')}
                  :
                </Col>
                <Col span={oneThirdOfInputSpan}>
                  <FormItem>
                    {getFieldDecorator('invoiceDetailTypeMeaning', {
                      initialValue: invoiceDetailTypeName,
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
