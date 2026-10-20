/**
 * InvoiceInfo - 开票信息
 * @date: 2021-04-07
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import intl from 'utils/intl';
import { formatInternationalTel } from '@/routes/components/utils';
import './style.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export default class InvoiceInfo extends Component {
  render() {
    const { data = {} } = this.props;
    return (
      <Form className="regist-form">
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.invoice.invoiceHeader').d('发票头')}
            >
              <div style={{ color: data.invoiceHeaderFlag === 'UPDATE' && 'red' }}>
                {data.invoiceHeader}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.invoice.taxNumber').d('税务登记号')}
            >
              <div style={{ color: data.taxRegistrationNumberFlag === 'UPDATE' && 'red' }}>
                {data.taxRegistrationNumber}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.invoice.depositBank').d('开户行')}
            >
              <div style={{ color: data.depositBankFlag === 'UPDATE' && 'red' }}>
                {data.depositBank}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.bankAccountNum')
                .d('开户行账号')}
            >
              <div style={{ color: data.bankAccountNumFlag === 'UPDATE' && 'red' }}>
                {data.bankAccountNum}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.taxAddress')
                .d('税务登记地址')}
            >
              <div style={{ color: data.taxRegistrationAddressFlag === 'UPDATE' && 'red' }}>
                {data.taxRegistrationAddress}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.taxPhone')
                .d('税务登记电话')}
            >
              <div style={{ color: data.taxRegistrationPhoneFlag === 'UPDATE' && 'red' }}>
                {data.taxRegistrationPhone}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.model.invoice.taker').d('收票人')}
            >
              <div style={{ color: data.receiverFlag === 'UPDATE' && 'red' }}>{data.receiver}</div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.receiveMail')
                .d('收票人邮箱')}
            >
              <div style={{ color: data.receiveMailFlag === 'UPDATE' && 'red' }}>
                {data.receiveMail}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.receivePhone')
                .d('收票人手机号')}
            >
              <div
                style={{
                  color:
                    (data.receivePhoneFlag === 'UPDATE' ||
                      data.internationalTelCodeFlag === 'UPDATE') &&
                    'red',
                }}
              >
                {formatInternationalTel(data.internationalTelMeaning, data.receivePhone)}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址')}
            >
              <div style={{ color: data.receiveAddressFlag === 'UPDATE' && 'red' }}>
                {data.receiveAddress}
              </div>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
